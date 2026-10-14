// Het rooster van het gespreksformulier: welke dagen en dagdelen een lead kan
// aanvinken, en de controle daarop in /api/gesprek.
//
// Een moment is "JJJJ-MM-DD:ochtend" of "JJJJ-MM-DD:middag". De ontvanger in de
// outreach-app (loopless-outreach, api/_momenten.js) toetst met dezelfde regels;
// verandert er hier iets, dan ook daar. Plan: 01-08-PLAN-gesprek-rooster.md §6.
//
// Alles rekent met kale datums in Europe/Amsterdam en telt dagen op in UTC, nooit
// met milliseconden vanaf lokale middernacht: de zomertijd eindigt op 2026-10-25,
// midden in het eerste rooster.

const TZ = "Europe/Amsterdam";
export const MAX_MOMENTEN = 20;
export const MAX_DAGEN_VOORUIT = 28;
export const DAGEN_PER_WEEK = 5;

// Feestdagen op een werkdag, vanaf het eerste rooster tot en met 2027.
const FEESTDAGEN = new Set([
  "2026-12-25", "2027-01-01", "2027-03-26", "2027-03-29", "2027-04-27",
  "2027-05-05", "2027-05-06", "2027-05-17",
]);

const VORM = /^(\d{4})-(\d{2})-(\d{2}):(ochtend|middag)$/;
const DAGNAAM = ["zo", "ma", "di", "wo", "do", "vr", "za"];
const MAAND = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

export type Dagdeel = "ochtend" | "middag";
export type RoosterDag = { datum: string; label: string; vandaag: boolean; dagdelen: Dagdeel[] };

// Vandaag in Amsterdam als JJJJ-MM-DD, en het uur daar (0-23).
export function amsterdam(nu = new Date()) {
  const delen = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
    })
      .formatToParts(nu)
      .map((p) => [p.type, p.value]),
  );
  return { datum: `${delen.year}-${delen.month}-${delen.day}`, uur: Number(delen.hour) };
}

const naarUtc = (datum: string) => {
  const [j, m, d] = datum.split("-").map(Number);
  return Date.UTC(j, m - 1, d);
};
const plusDagen = (datum: string, n: number) =>
  new Date(naarUtc(datum) + n * 86_400_000).toISOString().slice(0, 10);
const isWerkdag = (datum: string) => {
  const dag = new Date(naarUtc(datum)).getUTCDay();
  return dag >= 1 && dag <= 5 && !FEESTDAGEN.has(datum);
};

// "2026-10-26" -> "ma 26 okt"
export function dagLabel(datum: string) {
  const [, m, d] = datum.split("-").map(Number);
  return `${DAGNAAM[new Date(naarUtc(datum)).getUTCDay()]} ${d} ${MAAND[m - 1]}`;
}

// De rijen van het rooster: vóór 12:00 vandaag met alleen de middag, daarna
// `weken` keer vijf werkdagen vanaf morgen.
export function roosterDagen(nu = new Date(), weken = 2): RoosterDag[] {
  const { datum: vandaag, uur } = amsterdam(nu);
  const dagen: RoosterDag[] = [];
  if (uur < 12 && isWerkdag(vandaag)) {
    dagen.push({ datum: vandaag, label: dagLabel(vandaag), vandaag: true, dagdelen: ["middag"] });
  }
  let n = 0;
  for (let i = 1; n < weken * DAGEN_PER_WEEK && i <= 60; i++) {
    const d = plusDagen(vandaag, i);
    if (!isWerkdag(d)) continue;
    dagen.push({ datum: d, label: dagLabel(d), vandaag: false, dagdelen: ["ochtend", "middag"] });
    n++;
  }
  return dagen;
}

// Toetst een lijst momenten. { ok: true, momenten } (ontdubbeld, gesorteerd) of
// { ok: false, reden }; reden "voorbij" = een gekozen moment is verleden tijd.
export function toetsMomenten(
  lijst: unknown,
  nu = new Date(),
): { ok: true; momenten: string[] } | { ok: false; reden: "vorm" | "voorbij" } {
  if (!Array.isArray(lijst) || lijst.length === 0 || lijst.length > MAX_MOMENTEN * 2) {
    return { ok: false, reden: "vorm" };
  }
  const { datum: vandaag, uur } = amsterdam(nu);
  const grens = plusDagen(vandaag, MAX_DAGEN_VOORUIT);
  const uniek = new Set<string>();
  for (const m of lijst) {
    const deel = typeof m === "string" ? m.match(VORM) : null;
    if (!deel) return { ok: false, reden: "vorm" };
    const datum = `${deel[1]}-${deel[2]}-${deel[3]}`;
    if (plusDagen(datum, 0) !== datum) return { ok: false, reden: "vorm" };
    if (datum < vandaag) return { ok: false, reden: "voorbij" };
    // Vandaag kan alleen de middag, en alleen vóór 12:00 (zoals het rooster hem toont).
    if (datum === vandaag && (deel[4] === "ochtend" || uur >= 12)) return { ok: false, reden: "voorbij" };
    if (datum > grens || !isWerkdag(datum)) return { ok: false, reden: "vorm" };
    uniek.add(m);
  }
  if (uniek.size > MAX_MOMENTEN) return { ok: false, reden: "vorm" };
  return { ok: true, momenten: [...uniek].sort() };
}

// ["2026-10-23:middag", "2026-10-26:ochtend", "2026-10-26:middag"]
//   -> ["vr 23 okt: middag", "ma 26 okt: hele dag"]
export function momentenRegels(momenten: string[]) {
  const perDag = new Map<string, string[]>();
  for (const m of momenten) {
    const [datum, deel] = m.split(":");
    perDag.set(datum, [...(perDag.get(datum) ?? []), deel]);
  }
  return [...perDag.keys()].sort().map((datum) => {
    const delen = perDag.get(datum) ?? [];
    const deel = delen.includes("ochtend") && delen.includes("middag") ? "hele dag" : delen[0];
    return `${dagLabel(datum)}: ${deel}`;
  });
}
