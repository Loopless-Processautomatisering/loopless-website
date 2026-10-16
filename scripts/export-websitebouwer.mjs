// =============================================================================
// SITEUP WEBSITEBOUWER-MANIFEST (portaal fase 60)
//
//   node scripts/export-websitebouwer.mjs           schrijft websitebouwer-manifest.json
//   node scripts/export-websitebouwer.mjs --check   faalt als het bestand achterloopt
//
// Wat deze site aan het portaal levert: de sectietypes met veldschema en versie, plus de
// opgeleverde pagina `/over` met de teksten uit de code. Gegenereerd uit `src/secties/schema.ts`
// en `src/lib/websitebouwer/opgeleverd.json`. Geen database, geen geheim. Loopless heeft geen
// stijl: `stijl` is null.
//
// De overstap van Loopless (portaal plan 60-02) neemt per veld de live waarde van het oude blok,
// en alleen als die ontbreekt de tekst uit dit manifest.
// =============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

process.removeAllListeners("warning");
process.on("warning", (w) => {
  if (w.name !== "ExperimentalWarning" && !/MODULE_TYPELESS/.test(String(w.code))) console.warn(w);
});

const { SECTIETYPES } = await import("../src/secties/schema.ts");
const opgeleverd = JSON.parse(readFileSync(resolve("src/lib/websitebouwer/opgeleverd.json"), "utf8"));

const manifest = {
  formaat: "websitebouwer-1",
  sectietypes: Object.entries(SECTIETYPES).map(([sleutel, t]) => ({
    sleutel,
    label: t.label,
    versie: t.versie,
    velden: t.velden.map((v) => ({ ...v })),
  })),
  stijl: null,
  paginas: opgeleverd.paginas.map((p) => ({
    path: p.path,
    secties: p.secties.map((s) => ({
      type_sleutel: s.type_sleutel,
      sort_order: s.sort_order,
      enabled: s.enabled,
      inhoud: s.inhoud,
    })),
  })),
};

const PAD = resolve("websitebouwer-manifest.json");
const tekst = JSON.stringify(manifest, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (!existsSync(PAD) || readFileSync(PAD, "utf8") !== tekst) {
    console.error("websitebouwer-manifest.json loopt achter op de code: draai npm run export:websitebouwer");
    process.exit(1);
  }
  console.log("websitebouwer-manifest.json is bij.");
} else {
  writeFileSync(PAD, tekst);
  console.log(`websitebouwer-manifest.json geschreven (${manifest.sectietypes.length} sectietypes).`);
}
