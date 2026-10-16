// =============================================================================
// SITEUP DEPLOYCONTROLE
//
//   node scripts/deploycontrole.mjs      draait vanzelf vóór `next build` (npm run build)
//
// Vraagt het portaal of deze sitecode past bij wat er voor deze klant in de database staat
// (portaal fase 54, ontwerp §7b eis 2). Past het niet, dan breekt de bouw hier af en blijft
// de live site staan zoals hij is. Het portaal noemt de reden en de secties.
//
// DE VASTE VOLGORDE bij een wijziging aan een sectietype: versie ophogen in
// `src/secties/schema.ts` → `npm run export:websitebouwer` → seeden in de portaalrepo →
// uitrollen. Deze controle dwingt af dat het seeden gebeurd is.
//
// ZONDER PORTAALKOPPELING slaat de controle zichzelf over op een werkplek (een verse kloon moet
// zonder variabelen blijven bouwen). Op een bouwomgeving (Vercel) breekt hij dan AF, tenzij het
// project met `SITEUP_DEMO=1` als demo is gemerkt: een klantproject waar de variabelen
// ontbreken zou anders stil met demo-inhoud live gaan. EEN HALVE KOPPELING breekt altijd af.
//
// DE EERSTE REGEL VAN DE UITVOER noemt de gekozen tak: "koppeling", "demo", "lokaal, zonder
// koppeling", "geen koppeling", "halve koppeling" of "ongeldige koppeling". Lees die na een
// uitrol na in het bouwlog.
//
// NOODGREEP, alleen bij een storing van het portaal: `DEPLOYCONTROLE=overslaan`. Een
// afkeuring, een fout geheim, een redirect, een onvolledig antwoord of een ontbrekende
// koppeling is daarmee niet te omzeilen.
//
// De beslissingen staan in `deploycontrole-regels.mjs` (`voerControleUit`), zonder `process`,
// zodat elke uitkomst in een test staat. Dit bestand laadt de omgeving en drukt af.
//
// WAT DIT NIET DEKT: `next build` rechtstreeks of een aangepast Build Command in Vercel,
// en Instant Rollback (bouwt niet). Zie SETUP.md.
// =============================================================================

import nextEnv from "@next/env";
import { voerControleUit } from "./deploycontrole-regels.mjs";

process.removeAllListeners("warning");
process.on("warning", (w) => {
  if (w.name !== "ExperimentalWarning" && !/MODULE_TYPELESS/.test(String(w.code))) console.warn(w);
});

// Dezelfde bestanden in dezelfde volgorde als `next build`: zonder dit zou een lokale bouw
// de controle overslaan (geen variabelen in de shell) en daarna tóch tegen de klant uit
// `.env.local` bouwen. Wat al in de omgeving staat, wint.
nextEnv.loadEnvConfig(process.cwd(), false, { info: () => {}, error: console.error });

// `schema.ts` heeft geen imports en is dus rechtstreeks te laden (zie export-websitebouwer.mjs).
const { SECTIETYPES } = await import("../src/secties/schema.ts");
const sectietypes = Object.entries(SECTIETYPES).map(([sleutel, t]) => ({
  sleutel,
  label: t.label,
  versie: t.versie,
  velden: t.velden.map((v) => ({ ...v })),
}));

const uit = await voerControleUit({ env: process.env, sectietypes, haal: fetch });
const druk = uit.code === 1 ? console.error : uit.waarschuwing ? console.warn : console.log;
for (const regel of uit.regels) druk(regel);
// `exitCode` en niet `process.exit`: dat kapt een uitvoer af die nog naar een pipe onderweg is,
// en juist het bouwlog moet compleet zijn.
process.exitCode = uit.code;
