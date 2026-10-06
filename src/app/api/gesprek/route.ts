import { type NextRequest } from "next/server";
import { verifieer } from "@/lib/gesprek/code";

// Gespreksformulier (/gesprek): valideert de inzending en zet één rij in
// gesprek_aanvragen (server-to-server via PostgREST, zodat de sleutel niet in de
// browser ligt). lead_id en versie komen alleen uit de geverifieerde code uit de
// link, nooit uit een los veld in de body.
// Let op: dit is het outreach-project (LOOPLESS_SUPABASE_*), niet het portaal
// waar NEXT_PUBLIC_SUPABASE_* naar wijst.

const MAX_BODY_BYTES = 20_000;

const INTERESSES = ["inkoop", "vragen", "offertes", "anders"];
const DAGDELEN = ["ochtend", "middag", "geen_voorkeur"];

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const secret = process.env.GESPREK_SECRET;
  const supabaseUrl = process.env.LOOPLESS_SUPABASE_URL;
  const supabaseKey = process.env.LOOPLESS_SUPABASE_KEY;
  if (!secret || !supabaseUrl || !supabaseKey) {
    const ontbreekt = [
      !secret && "GESPREK_SECRET",
      !supabaseUrl && "LOOPLESS_SUPABASE_URL",
      !supabaseKey && "LOOPLESS_SUPABASE_KEY",
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
  if (bereiken !== "bellen" && bereiken !== "mailen") {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (bereiken === "bellen" && !telefoon) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // Alleen bewaren wat bij de gemaakte keuze hoort: een nummer bij bellen, een
  // ander adres bij mailen, de toelichting bij "anders".
  const rij = {
    lead_id: code.leadId,
    versie: code.versie,
    interesse,
    anders_tekst: (interesse.includes("anders") && str(payload.anders_tekst, 1000)) || null,
    bereiken,
    telefoon: bereiken === "bellen" ? telefoon : null,
    ander_email: (bereiken === "mailen" && str(payload.ander_email, 200)) || null,
    dagdeel,
    voorkeur: str(payload.voorkeur, 200) || null,
  };

  try {
    const res = await fetch(`${supabaseUrl.replace(/\/+$/, "")}/rest/v1/gesprek_aanvragen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(rij),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[gesprek] opslaan mislukt, status", res.status);
      return Response.json({ ok: false }, { status: 502 });
    }
  } catch (e) {
    console.error("[gesprek] database onbereikbaar:", e instanceof Error ? e.name : "fout");
    return Response.json({ ok: false }, { status: 502 });
  }

  return Response.json({ ok: true });
}
