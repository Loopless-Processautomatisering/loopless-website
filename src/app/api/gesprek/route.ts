import { type NextRequest } from "next/server";
import { verifieer } from "@/lib/gesprek/code";
import { toetsMomenten } from "@/lib/gesprek/momenten";

// Gespreksformulier (/gesprek): valideert de inzending en stuurt hem door naar de
// loopless-outreach-app (api/gesprek.js daar), die er één rij voor in
// gesprek_aanvragen zet. lead_id en versie komen alleen uit de geverifieerde code
// uit de link, nooit uit een los veld in de body.
// Bewust geen databasesleutel hier: deze site draait in het Vercel-team Site UP
// en de outreach-database hoort daar niet bereikbaar te zijn (besluit Wessel
// 2026-10-07). Op de site staan alleen het adres en een gedeeld geheim.

const MAX_BODY_BYTES = 20_000;

const INTERESSES = ["inkoop", "vragen", "offertes", "anders"];
// Het formulier stuurt sinds het rooster (01-08) alleen nog deze twee.
const DAGDELEN = ["geen_voorkeur", "momenten"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const secret = process.env.GESPREK_SECRET;
  const doorstuurUrl = process.env.GESPREK_DOORSTUUR_URL;
  const doorstuurSecret = process.env.GESPREK_DOORSTUUR_SECRET;
  if (!secret || !doorstuurUrl || !doorstuurSecret) {
    const ontbreekt = [
      !secret && "GESPREK_SECRET",
      !doorstuurUrl && "GESPREK_DOORSTUUR_URL",
      !doorstuurSecret && "GESPREK_DOORSTUUR_SECRET",
    ].filter(Boolean);
    console.error("[gesprek] ontbreekt:", ontbreekt.join(", "));
    return Response.json({ ok: false }, { status: 500 });
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (text.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false }, { status: 400 });
  }

  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(text);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error();
    payload = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Honeypot: mensen zien dit veld niet, bots vullen het in.
  // Doen alsof het gelukt is en niets opslaan.
  if (str(payload._hp, 200)) {
    return Response.json({ ok: true });
  }

  const code = verifieer(typeof payload.c === "string" ? payload.c : null, secret);
  if (!code) {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (!Array.isArray(payload.interesse)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const gekozen: unknown[] = payload.interesse;
  if (gekozen.length === 0 || !gekozen.every((i) => INTERESSES.includes(i as string))) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const interesse = INTERESSES.filter((i) => gekozen.includes(i));

  const dagdeel = str(payload.dagdeel, 20);
  const bereiken = str(payload.bereiken, 20);
  const telefoon = str(payload.telefoon, 40);
  if (!DAGDELEN.includes(dagdeel)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  let momenten: string[] | null = null;
  if (dagdeel === "momenten") {
    const uitslag = toetsMomenten(payload.momenten);
    if (!uitslag.ok) {
      // "voorbij": de pagina stond lang open; het formulier laat dan opnieuw kiezen.
      return Response.json(
        uitslag.reden === "voorbij" ? { ok: false, fout: "moment voorbij" } : { ok: false },
        { status: 400 },
      );
    }
    momenten = uitslag.momenten;
  }
  if (bereiken !== "bellen" && bereiken !== "mailen") {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (bereiken === "bellen" && !telefoon) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const anderEmail = bereiken === "mailen" ? str(payload.ander_email, 200) : "";
  if (anderEmail && !EMAIL.test(anderEmail)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  // Het formulier geeft elke inzending een eigen id mee. Probeert de bezoeker
  // het na een fout opnieuw, dan is het hetzelfde id en komt er geen tweede rij.
  const inzendingId = str(payload.inzending_id, 36).toLowerCase();
  if (!UUID.test(inzendingId)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Alleen bewaren wat bij de gemaakte keuze hoort: een nummer bij bellen, een
  // ander adres bij mailen, de toelichting bij "anders".
  const rij = {
    inzending_id: inzendingId,
    lead_id: code.leadId,
    versie: code.versie,
    interesse,
    anders_tekst: (interesse.includes("anders") && str(payload.anders_tekst, 1000)) || null,
    bereiken,
    telefoon: bereiken === "bellen" ? telefoon : null,
    ander_email: anderEmail || null,
    dagdeel,
    voorkeur: str(payload.voorkeur, 200) || null,
    ...(momenten ? { momenten } : {}),
  };

  // voornaam en bedrijf gaan mee voor de melding aan Wessel; ze worden niet
  // opgeslagen (ze staan al bij de lead).
  try {
    const res = await fetch(doorstuurUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${doorstuurSecret}`,
      },
      body: JSON.stringify({ ...rij, voornaam: code.voornaam, bedrijf: code.bedrijf }),
      signal: AbortSignal.timeout(15_000),
    });
    // Alleen "gelukt" melden als de ontvanger bevestigt dat de rij staat.
    const antwoord: unknown = res.ok ? await res.json().catch(() => null) : null;
    if (!antwoord || typeof antwoord !== "object" || (antwoord as { ok?: unknown }).ok !== true) {
      console.error("[gesprek] opslaan mislukt, status", res.status);
      return Response.json({ ok: false }, { status: 502 });
    }
  } catch (e) {
    console.error("[gesprek] ontvanger onbereikbaar:", e instanceof Error ? e.name : "fout");
    return Response.json({ ok: false }, { status: 502 });
  }

  return Response.json({ ok: true });
}
