// Herkomst van een aanvraag: kanaal + account + stuk content (leadflow Loopless, besluit Wessel
// 2026-10-29: meerdere accounts per platform). Komt uit de UTM-tags van de eerste pagina in deze
// sessie, zodat een bezoeker die via een reel binnenkomt en daarna doorklikt naar /contact nog
// steeds bij die reel hoort.
//
// Afspraak voor links in bio's en video's: ?utm_source=<kanaal>&utm_campaign=<account>&utm_content=<stuk>
// bijvoorbeeld ?utm_source=instagram&utm_campaign=claude-stijl&utm_content=reel-tip01.
// Zonder tags: kanaal "site", account "loopless", content = de eerste pagina.

export type Herkomst = { kanaal: string; account: string; content: string };

export const KANALEN = ["site", "instagram", "tiktok", "linkedin", "mail", "anders"] as const;
const ACCOUNT = /^[a-z0-9-]{2,40}$/;
export const HERKOMST_SLEUTEL = "loopless-herkomst";

const schoon = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().replace(/[\u0000-\u001f]/g, "").slice(0, max) : "";

/** Herkomst uit de query-string en het pad van de eerste pagina. */
export function herkomstUitUrl(search: string, pad: string): Herkomst {
  const q = new URLSearchParams(search);
  const bron = schoon(q.get("utm_source"), 20).toLowerCase();
  const kanaal = (KANALEN as readonly string[]).includes(bron) ? bron : bron ? "anders" : "site";
  const account = schoon(q.get("utm_campaign"), 40).toLowerCase();
  return {
    kanaal,
    account: ACCOUNT.test(account) ? account : "loopless",
    content: schoon(q.get("utm_content"), 200) || schoon(pad, 200) || "/",
  };
}

/** Wat de server van de client aanneemt: alleen bekende kanalen, nette accountnaam, korte content. */
export function herkomstSchoon(v: unknown): Herkomst | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const h = v as Record<string, unknown>;
  const kanaal = schoon(h.kanaal, 20);
  const account = schoon(h.account, 40);
  if (!(KANALEN as readonly string[]).includes(kanaal) || !ACCOUNT.test(account)) return null;
  return { kanaal, account, content: schoon(h.content, 200) };
}

/** In de browser: de bewaarde herkomst van deze sessie, of die van de huidige pagina. */
export function leesHerkomst(): Herkomst {
  try {
    const bewaard = herkomstSchoon(JSON.parse(sessionStorage.getItem(HERKOMST_SLEUTEL) || "null"));
    if (bewaard) return bewaard;
  } catch {
    // geen sessionStorage (privévenster, blokkade): val terug op de huidige pagina
  }
  return herkomstUitUrl(window.location.search, window.location.pathname);
}

/** Een id per inzending, zodat een herhaalde poging geen tweede aanvraag wordt. */
export function nieuwInzendingId(): string {
  // randomUUID bestaat alleen in een beveiligde context (https); getRandomValues overal.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 15) | 64;
  b[8] = (b[8] & 63) | 128;
  const h = [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}
