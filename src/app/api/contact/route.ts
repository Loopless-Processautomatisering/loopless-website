// Contactformulier loopless.nl — lead-capture met twee mailpaden.
//
// Harde eis (2026-09-25): een lead mag niet stil verdwijnen. Daarom:
// - Resend is het primaire pad (afzender op loopless.nl).
// - Faalt Resend (niet geconfigureerd, fout of time-out), dan gaat dezelfde lead
//   server-side naar Formspree, het oude endpoint.
// - Pas als béide falen krijgt de client een niet-2xx, zodat de bezoeker de
//   foutmelding met het mailadres ziet en nooit een valse "Bedankt".
// Bewust GEEN "log de lead als vangnet": Vercel-runtime-logs bewaren kort
// (uur/dag), dus dat zou een vangnet suggereren dat er niet is.
//
// Leadflow (2026-10-29): na het mailpad gaat dezelfde aanvraag ook naar de outreach-app
// (één plek voor alle aanvragen, met push en herinnering). Dat komt erbij, het vervangt de mail
// niet: faalt het doorsturen, dan merkt de bezoeker niets. De ntfy-push van deze route is eruit;
// die stuurt de app nu, één keer per aanvraag (anders twee pushes).

import { stuurAanvraagDoor } from "@/lib/aanvraag/doorsturen";
import { herkomstSchoon } from "@/lib/aanvraag/herkomst";

const MAX_BODY = 20_000;
const MAX_VELD = 200;
const MAX_BERICHT = 5_000;
const TIMEOUT_MS = 8_000;

// Twee pogingen van elk max 8s passen ruim binnen deze grens.
export const maxDuration = 30;

const FORMSPREE_DEFAULT = "https://formspree.io/f/xbdeeolq";

type Lead = {
  naam: string;
  bedrijf: string;
  email: string;
  telefoon: string;
  bericht: string;
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Simpele rem tegen scripted spam. Per instance-geheugen: een drempel, geen slot —
 *  serverless schaalt uit, dus dit vangt de domme gevallen, niet een gerichte aanval. */
const recent = new Map<string, number[]>();
const VENSTER_MS = 60_000;
const MAX_PER_VENSTER = 5;

function teVaak(ip: string): boolean {
  const nu = Date.now();
  const tijden = (recent.get(ip) ?? []).filter((t) => nu - t < VENSTER_MS);
  tijden.push(nu);
  recent.set(ip, tijden);
  if (recent.size > 5000) recent.clear(); // geheugengrens: liever leegvegen dan lekken
  return tijden.length > MAX_PER_VENSTER;
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );

function tekst(l: Lead): string {
  return [
    `Naam: ${l.naam}`,
    `Bedrijf: ${l.bedrijf || "-"}`,
    `E-mail: ${l.email}`,
    `Telefoon: ${l.telefoon || "-"}`,
    "",
    "Waar loopt het vast:",
    l.bericht || "-",
  ].join("\n");
}

function html(l: Lead): string {
  const rij = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:#666">${k}</td><td style="padding:4px 0">${esc(v || "-")}</td></tr>`;
  return `<table style="font-family:sans-serif;font-size:14px">${rij("Naam", l.naam)}${rij("Bedrijf", l.bedrijf)}${rij("E-mail", l.email)}${rij("Telefoon", l.telefoon)}</table>
<p style="font-family:sans-serif;font-size:14px;color:#666;margin-top:16px">Waar loopt het vast:</p>
<p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${esc(l.bericht || "-")}</p>`;
}

async function viaResend(l: Lead): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const naar = process.env.CONTACT_NOTIFICATIE_EMAIL; // komma-gescheiden mag
  const van = process.env.CONTACT_AFZENDER;
  if (!key || !naar || !van) {
    console.error("[contact] Resend niet geconfigureerd — door naar Formspree");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: van,
        to: naar.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: l.email,
        subject: `Nieuwe intake via loopless.nl — ${l.naam}`,
        text: tekst(l),
        html: html(l),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[contact] Resend antwoordde", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[contact] Resend onbereikbaar:", e);
    return false;
  }
}

async function viaFormspree(l: Lead): Promise<boolean> {
  const url = process.env.CONTACT_FORMSPREE_URL || FORMSPREE_DEFAULT;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ ...l, _subject: `Nieuwe intake via loopless.nl — ${l.naam}`, _replyto: l.email }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error("[contact] Formspree antwoordde", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[contact] Formspree onbereikbaar:", e);
    return false;
  }
}

// Configuratiecheck voor de nachtwacht-goal `loopless-contactformulier`. Bewijst dat het
// primaire pad geconfigureerd is — NIET dat een mail aankomt. Secret via header, niet in
// de URL (die belandt in access-logs).
export async function GET(request: Request) {
  const secret = process.env.CONTACT_CHECK_SECRET;
  if (!secret || request.headers.get("x-contact-check") !== secret) {
    return new Response(null, { status: 404 });
  }
  const resendKlaar = Boolean(
    process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFICATIE_EMAIL && process.env.CONTACT_AFZENDER
  );
  return Response.json({ resend: resendKlaar }, { status: resendKlaar ? 200 : 503 });
}

export async function POST(request: Request) {
  const ruw = await request.text();
  if (ruw.length > MAX_BODY) {
    return Response.json({ ok: false }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(ruw);
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  const p = payload as Record<string, unknown>;

  // Bot vulde het verborgen veld: doen alsof het gelukt is, niets versturen.
  if (str(p._hp, 200)) {
    return Response.json({ ok: true });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "onbekend";
  if (teVaak(ip)) {
    return Response.json({ ok: false }, { status: 429 });
  }

  const lead: Lead = {
    naam: str(p.naam, MAX_VELD),
    bedrijf: str(p.bedrijf, MAX_VELD),
    email: str(p.email, MAX_VELD),
    telefoon: str(p.telefoon, MAX_VELD),
    bericht: str(p.bericht, MAX_BERICHT),
  };
  if (!lead.naam || !isEmail(lead.email)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const gemaild = (await viaResend(lead)) || (await viaFormspree(lead));

  // Ook als beide mailpaden faalden: dan staat de aanvraag in elk geval in de app.
  const inzending = str(p.inzending_id, 36).toLowerCase();
  await stuurAanvraagDoor({
    bron: "contact",
    extern_id: UUID.test(inzending) ? inzending : crypto.randomUUID(),
    naam: lead.naam,
    bedrijf: lead.bedrijf,
    email: lead.email,
    telefoon: lead.telefoon,
    tekst: lead.bericht,
    herkomst: herkomstSchoon(p.herkomst),
  });
  if (gemaild) return Response.json({ ok: true });

  console.error("[contact] beide mailpaden faalden — bezoeker krijgt de mailto-foutmelding");
  return Response.json({ ok: false }, { status: 502 });
}
