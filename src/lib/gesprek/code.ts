import crypto from "node:crypto";
import { timingSafeEqualStr } from "@/lib/preview/token";

// De code in de link naar /gesprek. Vorm: "<payload>.<handtekening>".
// payload = base64url van compacte JSON {"l":lead-uuid,"n":voornaam,"b":bedrijf,"v":versie},
// handtekening = HMAC-SHA256 over de payloadstring met GESPREK_SECRET, base64url
// zonder opvulling. Geen vervaldatum: de link in een mail moet blijven werken.
// De tegenhanger die de links maakt staat in loopless-outreach
// (scripts/gesprek_link.py). Verandert het algoritme hier, dan ook daar.

export const VERSIES = ["A", "B", "C"] as const;
export type Versie = (typeof VERSIES)[number];

export type GesprekCode = {
  leadId: string;
  voornaam: string;
  bedrijf: string;
  versie: Versie;
};

const MAX_CODE = 2000;
const MAX_NAAM = 80;
const MAX_BEDRIJF = 160;
const BASE64URL = /^[A-Za-z0-9_-]+$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Geeft de velden uit een geldige code terug, anders null. De handtekening wordt
// eerst gecontroleerd; pas daarna wordt de payload gelezen.
export function verifieer(
  code: string | null | undefined,
  secret: string | undefined = process.env.GESPREK_SECRET,
): GesprekCode | null {
  if (!code || !secret || code.length > MAX_CODE) return null;
  const punt = code.indexOf(".");
  if (punt === -1) return null;
  const payload = code.slice(0, punt);
  const handtekening = code.slice(punt + 1);
  if (!BASE64URL.test(payload) || !BASE64URL.test(handtekening)) return null;

  const verwacht = crypto.createHmac("sha256", secret).update(payload).digest("base64url");
  if (!timingSafeEqualStr(handtekening, verwacht)) return null;

  let velden: unknown;
  try {
    velden = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!velden || typeof velden !== "object" || Array.isArray(velden)) return null;
  const { l, n, b, v } = velden as Record<string, unknown>;
  if (typeof l !== "string" || !UUID.test(l)) return null;
  if (typeof n !== "string" || n.length > MAX_NAAM) return null;
  if (typeof b !== "string" || !b.trim() || b.length > MAX_BEDRIJF) return null;
  if (typeof v !== "string" || !(VERSIES as readonly string[]).includes(v)) return null;

  return { leadId: l.toLowerCase(), voornaam: n.trim(), bedrijf: b.trim(), versie: v as Versie };
}
