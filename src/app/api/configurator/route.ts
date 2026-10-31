import { type NextRequest } from "next/server";
import { stuurAanvraagDoor } from "@/lib/aanvraag/doorsturen";
import { herkomstSchoon } from "@/lib/aanvraag/herkomst";

// Configurator-intake: valideert de inzending en stuurt hem door naar de
// n8n-webhook (server-to-server, zodat de webhook-URL niet in de browser ligt).
// De bezoeker mag hier nooit op stranden: de uitslag is client-side, maar de
// client toont bij een niet-ok antwoord wel een herstel-regel (mail Wessel).
//
// Leadflow (2026-10-29): na een geslaagde webhook gaat de aanvraag ook naar de outreach-app (één
// plek voor alle aanvragen). Dat komt erbij: faalt het, dan merkt de bezoeker niets.

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const MAX_BODY_BYTES = 20_000;

const str = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

export async function POST(request: NextRequest) {
  const webhook = process.env.CONFIGURATOR_WEBHOOK_URL;
  if (!webhook) {
    console.error("[configurator] CONFIGURATOR_WEBHOOK_URL ontbreekt");
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
  // Doen alsof het gelukt is en niets doorsturen.
  if (str(payload._hp, 200)) {
    return Response.json({ ok: true });
  }
  delete payload._hp;
  // Alleen voor de app, niet voor n8n.
  const inzending = str(payload.inzending_id, 36).toLowerCase();
  const herkomst = herkomstSchoon(payload.herkomst);
  delete payload.inzending_id;
  delete payload.herkomst;

  const naam = str(payload.naam, 120);
  const bedrijf = str(payload.bedrijf, 160);
  const email = str(payload.email, 200);
  if (!naam || !bedrijf || !/.+@.+\..+/.test(email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  // De n8n-webhook eist header-auth; zonder sleutel antwoordt hij 403 en toont
  // de client de herstel-regel.
  const sleutel = process.env.CONFIGURATOR_WEBHOOK_KEY;
  if (!sleutel) console.error("[configurator] CONFIGURATOR_WEBHOOK_KEY ontbreekt");

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(sleutel ? { "X-Loopless-Key": sleutel } : {}),
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.error("[configurator] webhook antwoordde", res.status);
      return Response.json({ ok: false }, { status: 502 });
    }
  } catch (e) {
    console.error("[configurator] webhook onbereikbaar:", e);
    return Response.json({ ok: false }, { status: 502 });
  }

  const gesprek = payload.gesprek_gevraagd === true;
  const pijn = Array.isArray(payload.pijn_zinnen)
    ? payload.pijn_zinnen.filter((z): z is string => typeof z === "string").map((z) => z.slice(0, 300))
    : [];
  await stuurAanvraagDoor({
    bron: "configurator",
    // De vraag om een gesprek is een tweede inzending vanaf de uitslag: eigen sleutel.
    extern_id: (UUID.test(inzending) ? inzending : crypto.randomUUID()) + (gesprek ? ":gesprek" : ""),
    naam,
    bedrijf,
    email,
    telefoon: str(payload.telefoon, 40),
    tekst: [gesprek ? "Vraagt om een gesprek." : "", ...pijn].filter(Boolean).join("\n").slice(0, 5000),
    gegevens: {
      grootte: str(payload.grootte, 60),
      keuzes: Array.isArray(payload.keuzes) ? payload.keuzes.slice(0, 20) : [],
      aanscherping: payload.aanscherping && typeof payload.aanscherping === "object" ? payload.aanscherping : {},
      gesprek_gevraagd: gesprek,
    },
    herkomst,
  });

  return Response.json({ ok: true });
}
