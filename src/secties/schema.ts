// De sectietypes van Loopless voor de websitebouwer van het Siteup-portaal (portaal fase 60).
//
// Alleen `/over` draait op secties; de rest van de site leest de blokken van het oude model
// (`lib/supabase/content.ts`). De types zijn afgeleid van de pagina zoals hij was: elk zichtbaar
// stuk tekst is een veld, of staat hieronder aantoonbaar als code genoemd.
//
// Dit bestand is de pure helft (geen JSX, geen imports), zodat het in een node-test en in
// `scripts/export-websitebouwer.mjs` en `scripts/deploycontrole.mjs` rechtstreeks te laden is.
// De componenten staan ernaast en `register.tsx` koppelt ze.
//
// HET VELDSCHEMA HEEFT HET FORMAAT VAN HET PORTAAL (`{sleutel, type, label, opties}`). Waar het
// kan volgen de velden die van de klantsite-template (`tekst`), zodat een later herontwerp
// dezelfde inhoud kan dragen.
//
// DE VASTE VOLGORDE bij een wijziging: `versie` ophogen → `npm run export:websitebouwer` →
// seeden in de portaalrepo → uitrollen. De deploycontrole dwingt het seeden af. Een veld
// weghalen of van soort veranderen weigert het portaal zolang een sectie of het origineel het
// gebruikt (portaal-mig 0088); zie SETUP.md van de template, "Een veld of sectietype weghalen".

export type VeldSchema = {
  sleutel: string;
  type: "tekst" | "opmaak" | "link" | "foto";
  label: string;
  opties?: Record<string, unknown>;
};

export type Sectietype = {
  label: string;
  /** Ophogen bij ELKE wijziging aan `velden`; de seeder weigert anders. */
  versie: number;
  velden: readonly VeldSchema[];
};

// Wat CODE blijft, bewust: de naam "Wessel Broeders" als kop van de intro, de logo's en labels
// (Recruitment, Groothandel) bij de resultaten, de drie knoppen van de oproep, en de metadata
// van de pagina.
export const SECTIETYPES = {
  intro: {
    label: "Intro met foto",
    versie: 1,
    velden: [
      { sleutel: "kicker", type: "tekst", label: "Regel boven de naam" },
      // Eerste alinea groot, de rest kleiner, zoals de pagina was.
      { sleutel: "tekst", type: "tekst", label: "Tekst", opties: { meerregelig: true } },
      { sleutel: "foto", type: "foto", label: "Foto" },
      { sleutel: "foto_alt", type: "tekst", label: "Beschrijving van de foto" },
    ],
  },
  // Gelijk aan het type `tekst` van de template. De tweede en volgende alinea in een
  // zachtere kleur, zoals de pagina was.
  tekst: {
    label: "Tekst",
    versie: 1,
    velden: [
      { sleutel: "kop", type: "tekst", label: "Kop" },
      { sleutel: "tekst", type: "tekst", label: "Tekst", opties: { meerregelig: true } },
    ],
  },
  resultaat: {
    label: "Resultaten",
    versie: 1,
    velden: [
      { sleutel: "kop", type: "tekst", label: "Kop" },
      { sleutel: "tekst", type: "tekst", label: "Tekst bij vuljevacature.nl", opties: { meerregelig: true } },
      { sleutel: "tekst_2", type: "tekst", label: "Tekst bij Drabor", opties: { meerregelig: true } },
    ],
  },
  oproep: {
    label: "Oproep",
    versie: 1,
    velden: [
      { sleutel: "kop", type: "tekst", label: "Kop" },
      { sleutel: "tekst", type: "tekst", label: "Tekst", opties: { meerregelig: true } },
    ],
  },
} as const satisfies Record<string, Sectietype>;

export type Sectiesleutel = keyof typeof SECTIETYPES;

export function isBekendSectietype(sleutel: string): sleutel is Sectiesleutel {
  return Object.hasOwn(SECTIETYPES, sleutel);
}

/** Wat een sectiecomponent binnenkrijgt: het inhoudsobject van zijn rij en zijn plek. */
export type SectieProps = { inhoud: Record<string, unknown>; index: number };

/** Een tekstveld uit de inhoud. Ontbreekt het of is het geen tekst, dan een lege string. */
export function tekstVeld(inhoud: Record<string, unknown>, sleutel: string): string {
  const v = inhoud[sleutel];
  return typeof v === "string" ? v.trim() : "";
}

/** Splitst lopende tekst op lege regels in alinea's. */
export function alineas(tekst: string): string[] {
  return tekst
    .split(/\n\s*\n/)
    .map((a) => a.trim())
    .filter(Boolean);
}

/**
 * De secties die gerenderd kunnen worden. Een rij met een type dat deze sitecode niet kent,
 * valt weg en wordt gemeld: de database kan nieuwer zijn dan de site.
 */
export function renderbareSecties<T extends { id: string; type_sleutel: string }>(
  secties: readonly T[],
  meld: (bericht: string) => void = console.warn,
): (T & { type_sleutel: Sectiesleutel })[] {
  const uit: (T & { type_sleutel: Sectiesleutel })[] = [];
  for (const s of secties) {
    if (isBekendSectietype(s.type_sleutel)) {
      uit.push(s as T & { type_sleutel: Sectiesleutel });
    } else {
      meld(`[websitebouwer] onbekend sectietype "${s.type_sleutel}" (sectie ${s.id}) overgeslagen`);
    }
  }
  return uit;
}

// Een fotopad zoals het portaal het schrijft: `<tenant-uuid>/<map>/.../<bestand>`. Alles wat daar
// niet op lijkt wordt niet gerenderd: de waarde komt uit data en belandt in een `src`.
const FOTOPAD = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/[A-Za-z0-9._-]+)+$/i;

/** De publieke URL van een fotoveld in de bucket `tenant-assets`, of `null`. Zelfde als de template. */
export function fotoUrl(
  inhoud: Record<string, unknown>,
  sleutel: string,
  basis: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL,
): string | null {
  const pad = tekstVeld(inhoud, sleutel);
  if (!pad || !basis || !FOTOPAD.test(pad) || pad.split("/").some((d) => d === "." || d === "..")) {
    return null;
  }
  return `${basis.replace(/\/+$/, "")}/storage/v1/object/public/tenant-assets/${pad}`;
}
