// Doorsturen van een aanvraag naar de Loopless-outreach-app (api/aanvraag-in.js), leadflow fase 1.
//
// Komt NA het bestaande mailpad en vervangt het niet: de mail blijft de primaire route. Faalt het
// doorsturen (app weg, geheim fout, time-out), dan wordt dat gelogd en merkt de bezoeker niets.
// De site krijgt geen databasesleutel, alleen een adres en een gedeeld geheim (zoals /api/gesprek).

import type { Herkomst } from "./herkomst";

export type Aanvraag = {
  bron: "contact" | "configurator";
  extern_id: string;
  naam: string;
  bedrijf?: string;
  email: string;
  telefoon?: string;
  tekst?: string;
  gegevens?: Record<string, unknown>;
  herkomst: Herkomst | null;
};

const TIMEOUT_MS = 5_000;

/** Geeft true als de app de aanvraag aannam (201 of 200 = stond er al). Gooit nooit. */
export async function stuurAanvraagDoor(a: Aanvraag, doe: typeof fetch = fetch): Promise<boolean> {
  const url = process.env.AANVRAAG_DOORSTUUR_URL;
  const geheim = process.env.AANVRAAG_DOORSTUUR_SECRET;
  if (!url || !geheim) {
    console.error("[aanvraag] AANVRAAG_DOORSTUUR_URL/SECRET ontbreekt: niet doorgestuurd");
    return false;
  }
  try {
    const res = await doe(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${geheim}` },
      body: JSON.stringify(a),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) console.error("[aanvraag] app antwoordde", res.status, a.bron);
    return res.ok;
  } catch (e) {
    console.error("[aanvraag] app onbereikbaar:", e instanceof Error ? e.name : "fout", a.bron);
    return false;
  }
}
