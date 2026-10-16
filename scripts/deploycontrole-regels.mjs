// De regels van de deploycontrole, zonder netwerk en zonder `process` (portaal fase 54-02).
// `deploycontrole.mjs` doet het werk; dit bestand beslist en schrijft de regels voor het
// bouwlog, zodat elke uitkomst in een test te toetsen is
// (`src/lib/websitebouwer/deploycontrole.test.ts`).

/** De vijf variabelen die samen de portaalkoppeling van een site op het nieuwe model zijn. */
export const KOPPELVARIABELEN = [
  "TENANT_ID",
  "PORTAAL_BFF_URL",
  "PORTAAL_PREVIEW_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

/**
 * De koppeling uit de omgeving. Een lege waarde telt als niet gezet.
 *
 * `half` is een fout en geen terugval: een bouw met een deel van de variabelen zou de
 * controle overslaan en daarna stil op `proef-inhoud.json` bouwen, of juist op de echte
 * inhoud zonder controle.
 *
 * `ongeldig`: het adres van het portaal is geen https. Het geheim van de klant gaat in een kop
 * mee; over http staat het in klare tekst op de lijn. Alleen een adres op de eigen machine mag
 * http zijn. Getoetst op het ontlede adres, niet op het begin van de tekst:
 * `http://localhost.voorbeeld.nl` begint ook met `http://localhost`.
 *
 * @param {Record<string, string | undefined>} env
 * @returns {{ soort: "geen" } | { soort: "half", ontbreken: string[] } | { soort: "ongeldig", reden: string } | { soort: "volledig", tenantId: string, adres: string, geheim: string }}
 */
export function leesKoppeling(env) {
  const gezet = (naam) => typeof env[naam] === "string" && env[naam].trim() !== "";
  const ontbreken = KOPPELVARIABELEN.filter((naam) => !gezet(naam));
  if (ontbreken.length === KOPPELVARIABELEN.length) return { soort: "geen" };
  if (ontbreken.length > 0) return { soort: "half", ontbreken };
  let adres;
  try {
    // De controle staat op hetzelfde portaal als de voorbeeldinhoud.
    adres = new URL("/api/deploycontrole", env.PORTAAL_BFF_URL.trim());
  } catch {
    return { soort: "ongeldig", reden: "PORTAAL_BFF_URL is geen geldig adres." };
  }
  // Gebruikersgegevens in het adres weigert `fetch` vóór enig verzoek; dat zou als "geen
  // verbinding" een storing lijken, en het wachtwoord kwam in het bouwlog (Codex-ronde 43).
  if (adres.username || adres.password) {
    return { soort: "ongeldig", reden: "PORTAAL_BFF_URL bevat een gebruikersnaam of wachtwoord; dat hoort er niet in." };
  }
  const eigenMachine = ["localhost", "127.0.0.1", "[::1]"].includes(adres.hostname);
  if (adres.protocol !== "https:" && !(adres.protocol === "http:" && eigenMachine)) {
    return { soort: "ongeldig", reden: "PORTAAL_BFF_URL moet met https:// beginnen (alleen localhost mag http zijn)." };
  }
  return {
    soort: "volledig",
    tenantId: env.TENANT_ID.trim(),
    adres: adres.toString(),
    geheim: env.PORTAAL_PREVIEW_SECRET.trim(),
  };
}

/**
 * Draait deze bouw op een bouwomgeving (Vercel, of een andere CI) in plaats van op een
 * werkplek? Dit zijn systeemvariabelen van Vercel. Staat in een project "Automatically expose
 * System Environment Variables" uit, dan ontbreken ze en lijkt de bouw lokaal: daarom drukt de
 * controle altijd af welke tak hij koos, en hoort die regel na een uitrol nagelezen te worden.
 *
 * @param {Record<string, string | undefined>} env
 */
export function isBouwomgeving(env) {
  return ["VERCEL", "VERCEL_ENV", "VERCEL_URL", "CI"].some((n) => typeof env[n] === "string" && env[n].trim() !== "");
}

/**
 * Wat de bouw doet met een HTTP-status van het portaal.
 * - `oordeel`: het antwoord is een beoordeling, lees `ok`.
 * - `storing`: het portaal is er niet (5xx, 429). Eén herhaling; daarna afbreken, tenzij de
 *   noodgreep `DEPLOYCONTROLE=overslaan` staat.
 * - `afbreken`: een fout aan deze kant (geheim, vorm). Herhalen helpt niet en de noodgreep
 *   geldt niet: dit is geen storing.
 *
 * Een 3xx valt onder `afbreken`: de controle volgt geen redirect (het geheim zou meegaan naar
 * het nieuwe adres, en het antwoord komt dan niet van de bedoelde route).
 *
 * @param {number} status
 * @returns {"oordeel" | "storing" | "afbreken"}
 */
export function soortAntwoord(status) {
  if (status === 200) return "oordeel";
  if (status === 429 || status >= 500) return "storing";
  return "afbreken";
}

const aantal = (n, een, meer) => `${n} ${n === 1 ? een : meer}`;

/**
 * De regels voor het bouwlog bij een beoordeling van het portaal. Per afwijking de reden en
 * de secties waar het om gaat, met de plek die de klant in het paneel ziet. Geen
 * veldwaarden: het portaal levert ze niet en een bouwlog is geen plek voor klantinhoud.
 *
 * Elke regel begint met een teken, niet met inspringing: het bouwlog van Vercel haalt de
 * witruimte aan het begin van een regel weg (gemeten 2026-10-10).
 *
 * @param {{ ok: boolean, afwijkingen?: { code: string, reden: string, secties?: { id?: string, pagina: string, positie: number, type: string }[] }[], meldingen?: string[], geteld?: { sectietypes: number, secties: number } }} antwoord
 * @param {string} tenantId
 * @returns {string[]}
 */
export function opmaak(antwoord, tenantId) {
  const geteld = antwoord.geteld
    ? `${aantal(antwoord.geteld.sectietypes, "sectietype", "sectietypes")}, ${aantal(antwoord.geteld.secties, "sectie", "secties")}`
    : "niets geteld";
  const meldingen = (antwoord.meldingen ?? []).map((m) => `- melding: ${m}`);

  if (antwoord.ok) return [`deploycontrole: in orde, ${geteld} (klant ${tenantId})`, ...meldingen];

  const regels = [
    `deploycontrole: AFGEKEURD voor klant ${tenantId} (${geteld})`,
    "Deze sitecode past niet bij wat er voor deze klant in het portaal staat:",
  ];
  for (const a of antwoord.afwijkingen ?? []) {
    regels.push(`- ${a.code}: ${a.reden}`);
    for (const s of a.secties ?? []) {
      // Positie 0: de sectie staat in het portaal op verwijderen en telt daar niet mee in de volgorde.
      const plek = s.positie === 0 ? "een sectie die op verwijderen staat" : `sectie ${s.positie}`;
      regels.push(`  -> pagina ${s.pagina}, ${plek} (${s.type})`);
    }
  }
  regels.push(...meldingen);
  return regels;
}

const isTekst = (w) => typeof w === "string";
const isTelling = (w) => Number.isInteger(w) && w >= 0;

/**
 * Het antwoord van het portaal bij status 200, GEHEEL getoetst. `{"ok":true}` zonder de rest
 * is geen oordeel: het kan van een andere route of een tussenlaag komen. En "in orde" met
 * afwijkingen, of "afgekeurd" zonder, spreekt zichzelf tegen.
 *
 * @param {string} tekst
 * @returns {{ oordeel: Parameters<typeof opmaak>[0] } | { fout: string }}
 */
export function leesOordeel(tekst) {
  let o;
  try {
    o = JSON.parse(tekst);
  } catch {
    return { fout: "geen leesbaar antwoord" };
  }
  const geldig =
    o !== null &&
    typeof o === "object" &&
    typeof o.ok === "boolean" &&
    Array.isArray(o.afwijkingen) &&
    o.afwijkingen.every((a) => a !== null && typeof a === "object" && isTekst(a.code) && isTekst(a.reden)) &&
    Array.isArray(o.meldingen) &&
    o.meldingen.every(isTekst) &&
    o.geteld !== null &&
    typeof o.geteld === "object" &&
    isTelling(o.geteld.sectietypes) &&
    isTelling(o.geteld.secties);
  if (!geldig) return { fout: "geen volledig oordeel" };
  if (o.ok !== (o.afwijkingen.length === 0)) return { fout: "een tegenstrijdig oordeel" };
  return { oordeel: o };
}

const TIJDSLIMIET_MS = 15_000;
const WACHT_VOOR_HERHALING_MS = 3_000;
const AFGEBROKEN = "deploycontrole: de bouw is afgebroken; de live site is niet gewijzigd.";
const STREEP = "".padEnd(78, "!");

/**
 * De hele controle, zonder `process`: de omgeving erin, de uitkomst eruit. `deploycontrole.mjs`
 * drukt de regels af en stopt met `code`.
 *
 * @param {{
 *   env: Record<string, string | undefined>,
 *   sectietypes: unknown[],
 *   haal: typeof fetch,
 *   wacht?: (ms: number) => Promise<void>,
 * }} invoer
 * @returns {Promise<{ code: 0 | 1, regels: string[], waarschuwing: boolean }>}
 */
export async function voerControleUit({ env, sectietypes, haal, wacht = (ms) => new Promise((k) => setTimeout(k, ms)) }) {
  const stop = (regels) => ({ code: /** @type {1} */ (1), regels: [...[].concat(regels), AFGEBROKEN], waarschuwing: false });
  const door = (regels, waarschuwing = false) => ({ code: /** @type {0} */ (0), regels: [].concat(regels), waarschuwing });
  const waar = isBouwomgeving(env) ? "bouwomgeving" : "lokaal";
  const koppeling = leesKoppeling(env);

  if (koppeling.soort === "geen") {
    if (!isBouwomgeving(env)) return door(`deploycontrole: tak "lokaal, zonder koppeling" (${waar}): controle overgeslagen.`);
    if ((env.SITEUP_DEMO ?? "").trim() === "1") {
      return door(`deploycontrole: tak "demo" (${waar}, SITEUP_DEMO=1): demo zonder portaalkoppeling, controle overgeslagen.`);
    }
    return stop([
      `deploycontrole: tak "geen koppeling" (${waar}): deze bouw heeft geen portaalkoppeling.`,
      "Zonder koppeling bouwt de site op de demo-inhoud. Het is een van twee:",
      `- een klantsite: zet de vijf variabelen (${KOPPELVARIABELEN.join(", ")}) op Production én Preview;`,
      "- de demo van de template zelf: zet SITEUP_DEMO=1 op dit project.",
      "DEPLOYCONTROLE=overslaan geldt hier niet: dit is geen storing van het portaal.",
    ]);
  }
  if (koppeling.soort === "half") {
    return stop([
      `deploycontrole: tak "halve koppeling" (${waar}).`,
      "deploycontrole: de portaalkoppeling is niet compleet. Er ontbreekt:",
      ...koppeling.ontbreken.map((naam) => `- ${naam}`),
      "Zet ze op deze omgeving (Production én Preview), of haal ze alle vijf weg.",
    ]);
  }
  if (koppeling.soort === "ongeldig") return stop([`deploycontrole: tak "ongeldige koppeling" (${waar}).`, `deploycontrole: ${koppeling.reden}`]);

  const kop = `deploycontrole: tak "koppeling" (${waar}): ${koppeling.adres}`;

  /** Eén verzoek. Geeft `{ status, tekst }`, of `{ fout }` als er geen antwoord kwam. */
  const vraag = async () => {
    try {
      const res = await haal(koppeling.adres, {
        method: "POST",
        // Het geheim in de kop, nooit in het adres: een querystring belandt in logs.
        headers: { "Content-Type": "application/json", "X-Preview-Secret": koppeling.geheim },
        body: JSON.stringify({ tenantId: koppeling.tenantId, sectietypes }),
        // Geen redirect volgen: het geheim zou meegaan naar een ander adres.
        redirect: "manual",
        signal: AbortSignal.timeout(TIJDSLIMIET_MS),
      });
      // Er IS een antwoord. Mislukt daarna het lezen van de body, dan blijft het dit antwoord en
      // wordt het geen "geen verbinding": anders zou een 307 of 403 met een kapotte body als
      // storing gelden, en ging de bouw met de noodgreep alsnog door (Codex-ronde 43).
      let tekst = "";
      try {
        tekst = await res.text();
      } catch {
        tekst = "";
      }
      return { status: res.status, tekst };
    } catch (e) {
      return { fout: e?.name === "TimeoutError" ? `geen antwoord binnen ${TIJDSLIMIET_MS / 1000} s` : "geen verbinding" };
    }
  };
  const isStoring = (a) => "fout" in a || soortAntwoord(a.status) === "storing";

  let antwoord = await vraag();
  if (isStoring(antwoord)) {
    await wacht(WACHT_VOOR_HERHALING_MS);
    antwoord = await vraag();
  }

  if (isStoring(antwoord)) {
    const wat = "fout" in antwoord ? antwoord.fout : `het portaal gaf ${antwoord.status}`;
    if (env.DEPLOYCONTROLE === "overslaan") {
      return door(
        [
          kop,
          STREEP,
          `deploycontrole: OVERGESLAGEN met DEPLOYCONTROLE=overslaan (${wat}, twee pogingen).`,
          "Deze bouw is NIET gecontroleerd. Haal de variabele weg zodra het portaal er weer is.",
          STREEP,
        ],
        true,
      );
    }
    return stop([
      kop,
      `deploycontrole: het portaal is niet bereikbaar (${wat}, twee pogingen).`,
      "Probeer het opnieuw. Alleen bij een storing van het portaal: DEPLOYCONTROLE=overslaan.",
    ]);
  }

  // Vanaf hier is er een antwoord dat geen storing is. De noodgreep geldt niet meer.
  if (antwoord.status >= 300 && antwoord.status < 400) {
    return stop([kop, `deploycontrole: het portaal verwees door (${antwoord.status}). De controle volgt geen redirect; zet PORTAAL_BFF_URL op het eindadres.`]);
  }
  if (antwoord.status === 403) {
    return stop([kop, "deploycontrole: het geheim van deze site klopt niet met het portaal (TENANT_ID of PORTAAL_PREVIEW_SECRET)."]);
  }
  if (soortAntwoord(antwoord.status) === "afbreken") {
    return stop([kop, `deploycontrole: het portaal weigerde het verzoek (${antwoord.status}).`, antwoord.tekst.slice(0, 2000)]);
  }

  const gelezen = leesOordeel(antwoord.tekst);
  if ("fout" in gelezen) return stop([kop, `deploycontrole: het portaal gaf ${gelezen.fout}.`]);

  const regels = [kop, ...opmaak(gelezen.oordeel, koppeling.tenantId)];
  return gelezen.oordeel.ok ? door(regels) : stop(regels);
}
