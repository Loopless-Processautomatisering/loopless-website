// =============================================================================
// SITEUP MANIFEST-CHECK
//
// Draait in CI op elke push/PR (.github/workflows/manifest.yml) en lokaal via
// `npm run check:manifest`. Faalt als `content-manifest.json` structureel niet
// klopt — dubbele sectie-key, twee namen voor één pagina, een blok dat naar een
// niet-bestaande sectie wijst.
//
// Waarom hier en niet in de seeder alleen: de seeder draait pas bij een
// oplevering, met de klant erbij. Een structuurfout hoort bij de commit die hem
// introduceert rood te worden, niet weken later midden in een schrijvende run.
//
// Geen database, geen geheim: de validator is puur en leest alleen het bestand.
//
// `scripts/manifest.ts` is een GEGENEREERDE kopie van siteup-portaal
// `src/lib/seed/manifest.ts`. Sync bij elke validator-wijziging; de blob-hash is
// het ankerpunt (zie SETUP.md).
// =============================================================================

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { execSync } from "node:child_process";

// Het TS-bestand importeren geeft op Node 22 een typeless-package-waarschuwing
// (deze repo heeft geen "type"-veld in package.json). Die hoort niet in elke
// CI-log. Zelfde onderdrukking als in de portaal-seeder.
process.removeAllListeners("warning");
process.on("warning", (w) => {
  if (w.name !== "ExperimentalWarning" && !/MODULE_TYPELESS/.test(String(w.code)))
    console.warn(w);
});

const root = process.cwd();

// Draaien we in de template of in een klantsite? Identiek aan check-baseline.mjs:
// NIET op pkg.name kijken — een klantsite erft de templatenaam en zou dan juist
// de check overslaan die ertoe doet.
const TEMPLATE_REPO = "siteup-klantsite-template";

function repoIdentity() {
  if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
  try {
    return execSync("git remote get-url origin", {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
      encoding: "utf8",
    }).trim();
  } catch {
    return "";
  }
}

const isTemplate = new RegExp(`${TEMPLATE_REPO}(\.git)?$`).test(repoIdentity());
const manifestPath = resolve(root, "content-manifest.json");

// De template heeft bewust geen manifest. Expliciet melden, niet stil overslaan:
// een stille skip is een groene check die niets meet.
if (isTemplate) {
  console.log(
    "Manifest-check overgeslagen: dit is siteup-klantsite-template, die heeft " +
      "bewust geen content-manifest.json (elke klantsite krijgt zijn eigen manifest).",
  );
  process.exit(0);
}

if (!existsSync(manifestPath)) {
  console.error(
    "FOUT: content-manifest.json ontbreekt in de repo-root.\n" +
      "Een klantsite hoort zijn manifest naast de code te hebben — dat zijn de " +
      "fallback-waarden die de site rendert (24-04).",
  );
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (err) {
  console.error(`FOUT: content-manifest.json is geen geldige JSON — ${err.message}`);
  process.exit(1);
}

const { validateManifest } = await import("./manifest.ts");
const { errors, warnings } = validateManifest(manifest);

for (const w of warnings) console.warn(`  waarschuwing  [${w.code}] ${w.path}: ${w.message}`);

if (errors.length > 0) {
  console.error(`\nManifest-check GEFAALD — ${errors.length} fout(en):\n`);
  for (const e of errors) console.error(`  [${e.code}] ${e.path}\n      ${e.message}`);
  console.error("");
  process.exit(1);
}

const counts = [
  `${manifest.blocks?.length ?? 0} blokken`,
  `${manifest.collections?.length ?? 0} collecties`,
  `${manifest.sections?.length ?? 0} secties`,
].join(", ");
console.log(
  `Manifest-check OK — ${counts}` +
    (warnings.length > 0 ? ` (${warnings.length} waarschuwing(en))` : ""),
);
