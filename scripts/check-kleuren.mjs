#!/usr/bin/env node
// Bewaakt de aanleiding van het herontwerp: er stonden 426 losse hexcodes in 27
// bestanden, waardoor "de kleuren aanpassen" neerkwam op elke pagina herschrijven.
//
// Kleuren horen als token in globals.css. Deze check houdt dat zo.
//
// TE_HERBOUWEN is een KRIMPENDE lijst: elk bestand dat in fase 2/3/4 wordt herbouwd
// gaat eruit. Staat de lijst leeg, dan is het herontwerp compleet en kan deze
// uitzondering zelf weg. Er mag nooit een bestand bij.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const WORTEL = "src";

// Blijvend uitgezonderd, met reden.
const BLIJVEND = [
  "src/app/globals.css",              // hier hóren de kleuren
  "src/components/preview-banner.tsx", // per conventie byte-identiek met andere klantsites
  "src/app/opengraph-image.tsx",      // ImageResponse rendert buiten de CSS, kent geen tokens
  "src/components/three/",            // 3D-experiment, eigen traject
  "src/app/(site)/3d-test/",          // idem
  "src/app/(site)/stijl/page.tsx",    // toont de tokens letterlijk als kleurenstaal
];

// Nog niet herbouwd. Deze lijst hoort alleen korter te worden.
const TE_HERBOUWEN = [
  "src/app/(site)/page.tsx",
  "src/app/(site)/cases/page.tsx",
  "src/app/(site)/configurator/configurator.tsx",
  "src/app/(site)/contact/page.tsx",
  "src/app/(site)/diensten/page.tsx",
  "src/app/(site)/faq/page.tsx",
  "src/app/(site)/kennisbank/page.tsx",
  "src/app/(site)/kennisbank/automatisering-mkb/page.tsx",
  "src/app/(site)/kennisbank/automatisering-mkb/artikel-data.ts",
  "src/app/(site)/over/page.tsx",
  "src/app/(site)/privacy/page.tsx",
  "src/components/footer.tsx",
  "src/components/hero-section.tsx",
  "src/components/logo.tsx",
  "src/components/navbar.tsx",
  "src/components/page-glow.tsx",
  "src/components/section-with-particles.tsx",
  "src/components/ui/animate-in.tsx",
  "src/components/ui/card-with-noise-patter.tsx",
  "src/components/ui/flow-field-background.tsx",
  "src/components/ui/glowing-effect.tsx",
  "src/components/ui/shiny-button.tsx",
];

const HEX = /#[0-9A-Fa-f]{3,8}\b/;

function* bestanden(dir) {
  for (const naam of readdirSync(dir)) {
    const pad = join(dir, naam);
    if (statSync(pad).isDirectory()) yield* bestanden(pad);
    else if (/\.(tsx|ts|css)$/.test(naam)) yield pad;
  }
}

const overtredingen = [];
for (const pad of bestanden(WORTEL)) {
  const rel = relative(".", pad);
  if (BLIJVEND.some((b) => rel.startsWith(b))) continue;
  if (TE_HERBOUWEN.includes(rel)) continue;

  readFileSync(pad, "utf8")
    .split("\n")
    .forEach((regel, i) => {
      if (HEX.test(regel)) overtredingen.push(`${rel}:${i + 1}  ${regel.trim()}`);
    });
}

if (overtredingen.length) {
  console.error("Losse hexkleuren buiten het design system:\n");
  overtredingen.forEach((r) => console.error("  " + r));
  console.error(
    `\n${overtredingen.length} stuks. Zet ze als token in src/app/globals.css.`,
  );
  process.exit(1);
}

const resterend = TE_HERBOUWEN.length;
console.log(
  resterend
    ? `OK — geen nieuwe losse kleuren. Nog ${resterend} bestand(en) te herbouwen.`
    : "OK — het herontwerp is compleet; deze uitzonderingslijst kan weg.",
);
