// Herhaalbare controle van het gespreksformulier (/gesprek en POST /api/gesprek).
//
// Draait volledig lokaal: een stub-server speelt de ontvanger in de
// loopless-outreach-app (api/gesprek.js daar), de site draait als `next start` op
// een eigen poort, en Playwright bedient de pagina. Er gaat niets naar de echte
// outreach-app of database. De ontvanger zelf heeft zijn eigen test:
// loopless-outreach/scripts/gesprek_test.mjs.
//
// Vooraf:
//   1. .env.local met wegwerpwaarden voor GESPREK_SECRET, GESPREK_DOORSTUUR_SECRET en
//      GESPREK_DOORSTUUR_URL=http://127.0.0.1:<vrije poort>/api/gesprek  (de stub luistert daar)
//   2. npm run build
//
// Draaien:
//   node scripts/test-gesprek.mjs
//
// De links komen uit loopless-outreach/scripts/gesprek_link.py (map instelbaar met
// OUTREACH_DIR), zodat ook bewezen is dat het script en de site hetzelfde
// algoritme gebruiken. Playwright komt uit deze repo als die het heeft, anders
// uit ~/work/loopless-visuals. Schermafbeeldingen komen in scripts/uit/.

import { spawn, spawnSync } from "node:child_process";
import { createHmac } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import http from "node:http";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uit = path.join(root, "scripts", "uit");
const outreach = process.env.OUTREACH_DIR ?? path.join(os.homedir(), "work", "loopless-outreach");
const SITE_POORT = 3217;
const site = `http://127.0.0.1:${SITE_POORT}`;

// --- instellingen uit .env.local (waarden worden nergens getoond) ---
const env = {};
const envPad = path.join(root, ".env.local");
if (!existsSync(envPad)) stop("Geen .env.local gevonden. Zie de kop van dit script.");
for (const regel of readFileSync(envPad, "utf8").split("\n")) {
  const m = regel.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
for (const naam of ["GESPREK_SECRET", "GESPREK_DOORSTUUR_URL", "GESPREK_DOORSTUUR_SECRET"]) {
  if (!env[naam]) stop(`${naam} ontbreekt in .env.local.`);
}
const stubUrl = new URL(env.GESPREK_DOORSTUUR_URL);
if (!["127.0.0.1", "localhost"].includes(stubUrl.hostname)) {
  stop("GESPREK_DOORSTUUR_URL wijst niet naar deze machine. Dit script schrijft alleen naar een lokale stub.");
}
if (!existsSync(path.join(root, ".next", "BUILD_ID"))) stop("Geen build gevonden. Draai eerst: npm run build");

function stop(tekst) {
  console.error(tekst);
  process.exit(2);
}

// --- Playwright laden ---
let chromium;
for (const basis of [root, path.join(os.homedir(), "work", "loopless-visuals")]) {
  try {
    ({ chromium } = createRequire(path.join(basis, "package.json"))("playwright"));
    break;
  } catch {
    // volgende plek proberen
  }
}
if (!chromium) stop("Playwright niet gevonden (niet in deze repo, niet in ~/work/loopless-visuals).");

// --- uitslagen ---
const uitslagen = [];
function meld(naam, ok, detail = "") {
  uitslagen.push({ naam, ok });
  console.log(`${ok ? "GESLAAGD" : "MISLUKT "}  ${naam}${detail ? `\n          ${detail}` : ""}`);
}
const gelijk = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// --- de stub: neemt de doorgestuurde inzending aan, bewaart het JSON, geeft 201
// met {"ok":true} (of 500). Wat niet in de tabel komt (het inzendings-id voor de
// vergelijking, en voornaam en bedrijf voor de melding) staat apart in `extra`.
const stub = { rijen: [], extra: [], verzoeken: [], faal: false, zonderOk: false };
const stubServer = http.createServer((req, res) => {
  let body = "";
  req.on("data", (d) => (body += d));
  req.on("end", () => {
    stub.verzoeken.push({ methode: req.method, pad: req.url, headers: req.headers });
    if (stub.faal) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end('{"message":"stub faalt"}');
      return;
    }
    try {
      const { inzending_id, voornaam, bedrijf, ...rij } = JSON.parse(body);
      stub.rijen.push(rij);
      stub.extra.push({ inzending_id, voornaam, bedrijf });
    } catch {
      stub.rijen.push({ ongeldig: body });
    }
    res.writeHead(201, { "Content-Type": "application/json" });
    res.end(stub.zonderOk ? '{"ok":false}' : '{"ok":true,"stond_al":false}');
  });
});
const leegStub = () => {
  stub.rijen = [];
  stub.extra = [];
  stub.verzoeken = [];
};

// --- links maken met het script uit loopless-outreach ---
function maakLink({ lead, voornaam, bedrijf, versie }) {
  const r = spawnSync(
    "python3",
    [
      path.join(outreach, "scripts", "gesprek_link.py"),
      "--lead", lead, "--voornaam", voornaam, "--bedrijf", bedrijf, "--versie", versie,
      "--basis", `${site}/gesprek`,
    ],
    { env: { ...process.env, GESPREK_SECRET: env.GESPREK_SECRET }, encoding: "utf8" },
  );
  if (r.status !== 0) throw new Error(`gesprek_link.py faalde: ${r.stderr}`);
  return r.stdout.trim();
}

const LEAD = "3f2b8c1e-5d4a-4b6f-9a70-2c1d8e9f0a1b";
const ANDER_LEAD = "11111111-2222-4333-8444-555555555555";
const VOORNAAM = "Annelotte";
const BEDRIJF = 'Bakker & Zoë "De Korenschoof"';
const KOP = "Een half uur over het uitzoekwerk bij ";
const TERUGVAL =
  "Deze link werkt niet. Heb je mijn mail gekregen? Antwoord er dan gewoon op. Of mail me op wessel@loopless.nl.";
const FOUTREGEL = "Er ging iets mis. Probeer het nog eens, of antwoord op mijn mail.";

async function wachtOpSite() {
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(`${site}/privacy`);
      if (r.ok) return;
    } catch {
      // nog niet op
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("De site kwam niet op.");
}

const stuur = (body) =>
  fetch(`${site}/api/gesprek`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

// Alle bestanden onder een map, voor de zoektocht in .next/static.
function bestanden(map) {
  return readdirSync(map).flatMap((naam) => {
    const p = path.join(map, naam);
    return statSync(p).isDirectory() ? bestanden(p) : [p];
  });
}

async function geenZijscroll(page) {
  return page.evaluate(
    () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
  );
}

// Openen en wachten tot de inhoud er staat en React hem heeft overgenomen
// (de inhoud komt gestreamd binnen; "networkidle" bleek hier niet betrouwbaar).
async function open(page, url) {
  await page.goto(url, { waitUntil: "load" });
  await page.locator("h1").waitFor();
  await page.waitForFunction(() => {
    const el = document.querySelector("form") ?? document.querySelector("h1");
    return Object.keys(el).some((k) => k.startsWith("__reactProps") || k.startsWith("__reactFiber"));
  });
}

// Loop de pagina één keer af zodat alles wat bij in-beeld-komen infadet zichtbaar is.
async function foto(page, naam) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(uit, naam), fullPage: true });
}

async function vulAlles(page) {
  await page.getByLabel("Besteladvies en inkoop-uitzoekwerk").check();
  await page.getByLabel("Maatwerk: iets anders bij ons").check();
  await page.getByLabel("Waar zit bij jullie het uitzoekwerk?").fill("Orderbevestigingen overtypen.");
  await page.getByLabel("Bel me").check();
  await page.getByLabel("Telefoonnummer").fill("06 12 34 56 78");
  await page.getByLabel("'s Ochtends").check();
  await page.getByLabel("Dagen die niet kunnen, of een voorkeur").fill("Niet op maandag.");
}

let siteProces;
let browser;

async function main() {
  mkdirSync(uit, { recursive: true });
  await new Promise((r) => stubServer.listen(Number(stubUrl.port), "127.0.0.1", r));
  siteProces = spawn(
    process.execPath,
    [path.join(root, "node_modules", "next", "dist", "bin", "next"), "start", "-p", String(SITE_POORT)],
    { cwd: root, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] },
  );
  let siteLog = "";
  siteProces.stdout.on("data", (d) => (siteLog += d));
  siteProces.stderr.on("data", (d) => (siteLog += d));
  await wachtOpSite();

  browser = await chromium.launch();
  const link = maakLink({ lead: LEAD, voornaam: VOORNAAM, bedrijf: BEDRIJF, versie: "B" });
  const linkZonderNaam = maakLink({ lead: LEAD, voornaam: "", bedrijf: BEDRIJF, versie: "A" });
  const code = new URL(link).searchParams.get("c");
  const [payload, handtekening] = code.split(".");

  // ---------- 1. link uit het script opent het formulier ----------
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const cspMeldingen = [];
  page.on("console", (m) => {
    if (/content.security.policy/i.test(m.text())) cspMeldingen.push(m.text());
  });
  await open(page, link);
  {
    const kop = (await page.locator("h1").innerText()).trim();
    const intro = (await page.locator("section p").first().innerText()).trim();
    const vast = (await page.locator("form dl").innerText()).replace(/\s+/g, " ").trim();
    const verwachtIntro = `Hoi ${VOORNAAM}. Vink aan waar je nieuwsgierig naar bent, waar ik je kan bereiken en wanneer het je uitkomt. Ik neem daarna contact op om een tijdstip af te spreken.`;
    const ok =
      kop === KOP + BEDRIJF && intro === verwachtIntro && vast === `Naam ${VOORNAAM} Bedrijf ${BEDRIJF}`;
    meld(
      "link uit gesprek_link.py opent het formulier met voornaam en bedrijf (met &, aanhalingsteken en ë)",
      ok,
      ok ? "" : `kop=${JSON.stringify(kop)} intro=${JSON.stringify(intro)} vast=${JSON.stringify(vast)}`,
    );
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    meld("pagina staat op noindex, nofollow", robots === "noindex, nofollow", `robots=${robots}`);
    const feiten = await page.locator("section").first().innerText();
    meld(
      "de drie feiten staan er",
      ["Een half uur", "Kost niets en is vrijblijvend", "Daarna een plan op één pagina, van jullie"].every(
        (f) => feiten.includes(f),
      ),
    );
  }
  {
    const p2 = await ctx.newPage();
    await open(p2, linkZonderNaam);
    const intro = (await p2.locator("section p").first().innerText()).trim();
    const vast = (await p2.locator("form dl").innerText()).replace(/\s+/g, " ").trim();
    const ok = intro.startsWith("Vink aan waar je nieuwsgierig naar bent") && vast === `Bedrijf ${BEDRIJF}`;
    meld("zonder voornaam: intro begint bij 'Vink aan', alleen het bedrijf als vaste tekst", ok, ok ? "" : `intro=${intro} vast=${vast}`);
    await p2.close();
  }

  // ---------- 2. geen of ongeldige code ----------
  const vervalst = Buffer.from(
    JSON.stringify({ l: ANDER_LEAD, n: "Vervalsnaam", b: "Vervalstbedrijf", v: "B" }),
  ).toString("base64url");
  const gevallen = {
    "zonder code": `${site}/gesprek`,
    "gewijzigde payload": `${site}/gesprek?c=${vervalst}.${handtekening}`,
    "gewijzigde handtekening": `${site}/gesprek?c=${payload}.${handtekening.slice(0, -2)}${handtekening.endsWith("AA") ? "BB" : "AA"}`,
    "handtekening met een ander geheim": `${site}/gesprek?c=${payload}.${createHmac("sha256", "een-ander-geheim").update(payload).digest("base64url")}`,
  };
  for (const [naam, url] of Object.entries(gevallen)) {
    const html = await (await fetch(url)).text();
    const p2 = await ctx.newPage();
    await open(p2, url);
    const kop = (await p2.locator("h1").innerText()).trim();
    const tekst = (await p2.locator("section p").first().innerText()).replace(/\s+/g, " ").trim();
    const formulieren = await p2.locator("form").count();
    const linkContact = await p2.locator('section p a[href="/contact"]').count();
    const lekt = [VOORNAAM, "Korenschoof", "Vervalsnaam", "Vervalstbedrijf"].filter((w) => html.includes(w));
    const inDom = await p2.content();
    const lektDom = [VOORNAAM, "Korenschoof", "Vervalsnaam", "Vervalstbedrijf"].filter((w) => inDom.includes(w));
    const ok =
      kop === KOP + "jullie" && tekst === TERUGVAL && formulieren === 0 && linkContact === 1 &&
      lekt.length === 0 && lektDom.length === 0;
    meld(
      `${naam}: geen formulier, terugvaltekst, geen naam of bedrijf in de HTML`,
      ok,
      ok ? "" : `kop=${kop} tekst=${tekst} formulieren=${formulieren} linkContact=${linkContact} lekt=${lekt} lektDom=${lektDom}`,
    );
    await p2.close();
  }

  // ---------- 5. verplichte velden (vóór het versturen, op dezelfde pagina) ----------
  leegStub();
  {
    await page.getByRole("button", { name: "Verstuur" }).click();
    const meldingen = await page.locator('form [role="alert"]').allInnerTexts();
    const zichtbaar = await page.locator('form [role="alert"]').first().isVisible();
    meld(
      "leeg versturen: geen verzoek aan de stub, meldingen bij onderwerp, bereiken en dagdeel",
      stub.verzoeken.length === 0 && meldingen.length === 3 && zichtbaar,
      `meldingen=${JSON.stringify(meldingen)} verzoeken=${stub.verzoeken.length}`,
    );
    await foto(page, "formulier-meldingen-1280.png");

    // zonder vinkje
    await page.getByLabel("Mail me").check();
    await page.getByLabel("'s Middags").check();
    await page.getByRole("button", { name: "Verstuur" }).click();
    let m = await page.locator('form [role="alert"]').allInnerTexts();
    meld(
      "zonder vinkje: geen verzoek aan de stub en een zichtbare melding",
      stub.verzoeken.length === 0 && m.length === 1 && (await page.locator("#fout-interesse").isVisible()),
      `meldingen=${JSON.stringify(m)}`,
    );

    // met Bel me zonder nummer
    await page.getByLabel("Offertes klaarzetten").check();
    await page.getByLabel("Bel me").check();
    await page.getByRole("button", { name: "Verstuur" }).click();
    m = await page.locator('form [role="alert"]').allInnerTexts();
    meld(
      "Bel me zonder nummer: geen verzoek aan de stub en een zichtbare melding",
      stub.verzoeken.length === 0 && m.length === 1 && (await page.locator("#fout-telefoon").isVisible()),
      `meldingen=${JSON.stringify(m)}`,
    );

    // zonder dagdeel: verse pagina, alles behalve het dagdeel
    await open(page, link);
    await page.getByLabel("Offertes klaarzetten").check();
    await page.getByLabel("Mail me").check();
    await page.getByRole("button", { name: "Verstuur" }).click();
    m = await page.locator('form [role="alert"]').allInnerTexts();
    meld(
      "zonder dagdeel: geen verzoek aan de stub en een zichtbare melding",
      stub.verzoeken.length === 0 && m.length === 1 && (await page.locator("#fout-dagdeel").isVisible()),
      `meldingen=${JSON.stringify(m)}`,
    );
  }

  // ---------- toetsenbord ----------
  {
    await open(page, link);
    const eerste = page.getByLabel("Besteladvies en inkoop-uitzoekwerk");
    await eerste.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    const tweede = await page.getByLabel("Vragen beantwoorden uit eigen documentatie").isChecked();
    await page.getByLabel("Bel me").focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowRight");
    const mail = await page.getByLabel("Mail me").isChecked();
    const ring = await page
      .getByLabel("Mail me")
      .evaluate((el) => getComputedStyle(el.closest("label")).boxShadow);
    meld(
      "bedienbaar met het toetsenbord (spatie, tab, pijltjes) en een zichtbare focusring",
      (await eerste.isChecked()) && tweede && mail && ring !== "none",
      `focusring=${ring}`,
    );
    await page.getByLabel("Mail me").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(uit, "formulier-focus-1280.png") });
  }

  // ---------- 7. de stub geeft 500 ----------
  let idBijFout;
  leegStub();
  {
    await open(page, link);
    await vulAlles(page);
    stub.faal = true;
    const verzoek = page.waitForRequest((r) => r.url().endsWith("/api/gesprek"));
    await page.getByRole("button", { name: "Verstuur" }).click();
    idBijFout = (await verzoek).postDataJSON()?.inzending_id;
    await page.getByText(FOUTREGEL).waitFor({ timeout: 10_000 }).catch(() => {});
    const foutZichtbaar = await page.getByText(FOUTREGEL).isVisible();
    const staatNog =
      (await page.locator("form").count()) === 1 &&
      (await page.getByLabel("Besteladvies en inkoop-uitzoekwerk").isChecked()) &&
      (await page.getByLabel("Maatwerk: iets anders bij ons").isChecked()) &&
      (await page.getByLabel("Waar zit bij jullie het uitzoekwerk?").inputValue()) === "Orderbevestigingen overtypen." &&
      (await page.getByLabel("Bel me").isChecked()) &&
      (await page.getByLabel("Telefoonnummer").inputValue()) === "06 12 34 56 78" &&
      (await page.getByLabel("'s Ochtends").isChecked()) &&
      (await page.getByLabel("Dagen die niet kunnen, of een voorkeur").inputValue()) === "Niet op maandag.";
    meld(
      "stub geeft 500: formulier blijft staan met de ingevulde waarden en de foutregel",
      foutZichtbaar && staatNog && stub.verzoeken.length === 1 && stub.rijen.length === 0,
      `foutregel=${foutZichtbaar} waarden=${staatNog} verzoeken=${stub.verzoeken.length}`,
    );
    await foto(page, "formulier-fout-1280.png");

    // 7b. Na de fout een ander nummer: dat is een andere inzending en krijgt een
    // nieuw id (Codex 2026-10-07: anders bevestigt de ontvanger de oude rij).
    const tel = page.getByLabel("Telefoonnummer");
    await tel.fill("06 98 76 54 32");
    const v2 = page.waitForRequest((r) => r.url().endsWith("/api/gesprek"));
    await page.getByRole("button", { name: "Verstuur" }).click();
    const idGewijzigd = (await v2).postDataJSON()?.inzending_id;
    await page.getByText(FOUTREGEL).waitFor({ timeout: 10_000 }).catch(() => {});
    await tel.fill("06 12 34 56 78");
    const v3 = page.waitForRequest((r) => r.url().endsWith("/api/gesprek"));
    await page.getByRole("button", { name: "Verstuur" }).click();
    const idTerug = (await v3).postDataJSON()?.inzending_id;
    await page.getByText(FOUTREGEL).waitFor({ timeout: 10_000 }).catch(() => {});
    meld(
      "na een fout: gewijzigde inhoud krijgt een nieuw inzendings-id, en terug naar de oude inhoud weer een nieuw",
      /^[0-9a-f-]{36}$/.test(idGewijzigd ?? "") && idGewijzigd !== idBijFout && idTerug !== idGewijzigd,
      `idBijFout=${idBijFout} idGewijzigd=${idGewijzigd} idTerug=${idTerug}`,
    );
    idBijFout = idTerug;
    stub.faal = false;
  }

  // ---------- 3. versturen met alle velden (zelfde pagina, tweede poging) ----------
  leegStub();
  {
    const antwoord = page.waitForResponse((r) => r.url().endsWith("/api/gesprek"));
    await page.getByRole("button", { name: "Verstuur" }).click();
    const res = await antwoord;
    const body = await res.text();
    await page.getByText("Dank je, Annelotte.").waitFor({ timeout: 10_000 }).catch(() => {});
    const verwacht = {
      lead_id: LEAD,
      versie: "B",
      interesse: ["inkoop", "anders"],
      anders_tekst: "Orderbevestigingen overtypen.",
      bereiken: "bellen",
      telefoon: "06 12 34 56 78",
      ander_email: null,
      dagdeel: "ochtend",
      voorkeur: "Niet op maandag.",
    };
    const ok = stub.rijen.length === 1 && gelijk(stub.rijen[0], verwacht);
    meld(
      "versturen (bellen): de stub ontvangt precies één rij met de verwachte velden; lead_id en versie uit de code",
      ok,
      ok ? "" : `rijen=${JSON.stringify(stub.rijen)}`,
    );
    const v = stub.verzoeken[0] ?? { headers: {} };
    meld(
      "het verzoek aan de ontvanger: POST naar het doorstuuradres met het gedeelde geheim als Bearer, zonder apikey",
      v.methode === "POST" && v.pad === stubUrl.pathname &&
        v.headers.authorization === `Bearer ${env.GESPREK_DOORSTUUR_SECRET}` &&
        !("apikey" in v.headers),
      `methode=${v.methode} pad=${v.pad}`,
    );
    const x = stub.extra[0] ?? {};
    meld(
      "meegestuurd voor de melding: voornaam en bedrijf uit de code, en een inzendings-id; na de fout van zojuist hetzelfde id",
      x.voornaam === VOORNAAM && typeof x.bedrijf === "string" && x.bedrijf.length > 0 &&
        /^[0-9a-f-]{36}$/.test(x.inzending_id ?? "") && x.inzending_id === idBijFout,
      `extra=${JSON.stringify(x)} idBijFout=${idBijFout}`,
    );
    meld("antwoord van de route is precies {\"ok\":true}", res.status() === 200 && body === '{"ok":true}', `status=${res.status()} body=${body}`);
    const dank = (await page.locator('[role="status"]').innerText().catch(() => "")).replace(/\s+/g, " ").trim();
    meld(
      "na versturen: formulier weg, de dankregel met voornaam",
      (await page.locator("form").count()) === 0 && dank === "Dank je, Annelotte. Het staat genoteerd.",
      `dank=${JSON.stringify(dank)}`,
    );
    meld(
      "na versturen: de focus staat op de dankregel en de intro in de hero is weg",
      (await page.evaluate(() => document.activeElement?.getAttribute("role"))) === "status" &&
        (await page.getByText("Vink aan waar je nieuwsgierig naar bent").count()) === 0 &&
        (await page.getByRole("heading", { level: 1 }).isVisible()),
    );
    const echo = (await page.locator("dl").innerText()).replace(/\s+/g, " ");
    meld(
      "na versturen: het scherm toont wat is verstuurd (onderwerpen, toelichting, nummer, dagdeel, voorkeur)",
      ["Besteladvies en inkoop-uitzoekwerk", "Maatwerk: iets anders bij ons", "Orderbevestigingen overtypen.",
        "Ik bel je op 06 12 34 56 78", "'s Ochtends", "Niet op maandag."].every((t) => echo.includes(t)),
      `echo=${JSON.stringify(echo)}`,
    );
    const stappen = (await page.locator("ol h3").allInnerTexts()).join(" | ");
    const beeld = page.locator('img[src*="voorbeeldplan"]');
    await beeld.scrollIntoViewIfNeeded();
    const geladen = await beeld
      .evaluate(async (el) => {
        await el.decode().catch(() => {});
        return el.complete && el.naturalWidth > 0;
      })
      .catch(() => false);
    const planLink = page.locator('a[href="/gesprek/voorbeeldplan-inkoop.png"]');
    meld(
      "na versturen: drie stappen (bellen), het voorbeeldplan van inkoop geladen, link opent in een nieuw tabblad",
      stappen === "Ik bel je | Een half uur bellen | Jij krijgt het plan" && geladen &&
        (await planLink.getAttribute("target")) === "_blank" &&
        (await page.getByText("Je vinkte meer dan één onderwerp aan.").count()) === 1,
      `stappen=${stappen} geladen=${geladen}`,
    );
    const tekst = await page.locator("body").innerText();
    meld(
      "na versturen: geen termijn, geen 'gratis', geen 'voor te bereiden' op het scherm",
      !/werkdag|binnen \d|gratis|voor te bereiden/i.test(tekst),
    );
  }

  // versturen met Mail me, een ander adres en zonder voornaam
  leegStub();
  {
    const p2 = await ctx.newPage();
    await open(p2, linkZonderNaam);
    await p2.getByLabel("Vragen beantwoorden uit eigen documentatie").check();
    await p2.getByLabel("Offertes klaarzetten").check();
    await p2.getByLabel("Mail me").check();
    const regel = await p2.getByText("Ik mail je op het adres waar mijn bericht naartoe ging.").isVisible();
    await p2.getByLabel("Liever een ander e-mailadres?").fill("inkoop@voorbeeld.test");
    await p2.getByLabel("Maakt me niet uit").check();
    await p2.getByRole("button", { name: "Verstuur" }).click();
    await p2.locator('[role="status"]').waitFor({ timeout: 10_000 }).catch(() => {});
    const dank = (await p2.locator('[role="status"]').innerText().catch(() => "")).replace(/\s+/g, " ").trim();
    const verwacht = {
      lead_id: LEAD,
      versie: "A",
      interesse: ["vragen", "offertes"],
      anders_tekst: null,
      bereiken: "mailen",
      telefoon: null,
      ander_email: "inkoop@voorbeeld.test",
      dagdeel: "geen_voorkeur",
      voorkeur: null,
    };
    const ok =
      regel && stub.rijen.length === 1 && gelijk(stub.rijen[0], verwacht) &&
      dank === "Dank je. Het staat genoteerd.";
    meld(
      "versturen (mailen, ander adres, zonder voornaam): één rij met de verwachte velden, dankregel zonder naam",
      ok,
      ok ? "" : `regel=${regel} rijen=${JSON.stringify(stub.rijen)} dank=${dank}`,
    );
    const echo = (await p2.locator("dl").innerText().catch(() => "")).replace(/\s+/g, " ");
    meld(
      "na versturen (mailen): het andere adres en 'geen voorkeur' in de echo, stap 1 is 'Ik mail je', voorbeeld van vragen",
      echo.includes("Ik mail je op inkoop@voorbeeld.test") && echo.includes("Geen voorkeur voor een dagdeel") &&
        (await p2.locator("ol h3").first().innerText()) === "Ik mail je" &&
        (await p2.locator('a[href="/gesprek/voorbeeldplan-vragen.png"]').count()) === 1,
      `echo=${JSON.stringify(echo)}`,
    );
    await p2.close();
  }

  // wisselen tijdens het versturen: het scherm toont wat is verstuurd, niet wat er daarna is aangeklikt
  leegStub();
  {
    const p3 = await ctx.newPage();
    await open(p3, link);
    await p3.getByLabel("Offertes klaarzetten").check();
    await p3.getByLabel("Bel me").check();
    await p3.getByLabel("Telefoonnummer").fill("  06 98 76 54 32  ");
    await p3.getByLabel("'s Middags").check();
    await p3.route("**/api/gesprek", async (route) => {
      await new Promise((r) => setTimeout(r, 3000));
      await route.continue();
    });
    await p3.getByRole("button", { name: "Verstuur" }).click();
    await p3.getByLabel("Mail me").check({ force: true });
    await p3.getByLabel("'s Ochtends").check({ force: true });
    const gewisseld = await p3.getByLabel("Mail me").isChecked().catch(() => false);
    await p3.locator('[role="status"]').waitFor({ timeout: 10_000 }).catch(() => {});
    const echo = (await p3.locator("dl").innerText().catch(() => "")).replace(/\s+/g, " ");
    const r = stub.rijen[0] ?? {};
    meld(
      "wisselen tijdens het versturen: scherm en opgeslagen rij tonen allebei bellen, het ingekorte nummer en de middag",
      gewisseld &&
        echo.includes("Ik bel je op 06 98 76 54 32") && echo.includes("'s Middags") && !echo.includes("Ik mail je") &&
        r.bereiken === "bellen" && r.telefoon === "06 98 76 54 32" && r.dagdeel === "middag" &&
        (await p3.locator("ol h3").first().innerText().catch(() => "")) === "Ik bel je" &&
        (await p3.locator('a[href="/gesprek/voorbeeldplan-offertes.png"]').count()) === 1 &&
        (await p3.getByText("Je vinkte meer dan één onderwerp aan.").count()) === 0,
      `gewisseld=${gewisseld} echo=${JSON.stringify(echo)} rij=${JSON.stringify(r)}`,
    );
    await p3.close();
  }

  // alleen maatwerk, zonder toelichting: het voorbeeld van inkoop met de uitleg erbij
  leegStub();
  {
    const p4 = await ctx.newPage();
    await open(p4, link);
    await p4.getByLabel("Maatwerk: iets anders bij ons").check();
    await p4.getByLabel("Mail me").check();
    await p4.getByLabel("'s Middags").check();
    await p4.getByRole("button", { name: "Verstuur" }).click();
    await p4.locator('[role="status"]').waitFor({ timeout: 10_000 }).catch(() => {});
    const echo = (await p4.locator("dl").innerText().catch(() => "")).replace(/\s+/g, " ");
    meld(
      "alleen maatwerk zonder toelichting: voorbeeld van inkoop met de uitleg, mail naar het adres van de mail",
      (await p4.locator('a[href="/gesprek/voorbeeldplan-inkoop.png"]').count()) === 1 &&
        (await p4.getByText("Jouw onderwerp is maatwerk.").count()) === 1 &&
        echo.includes("Ik mail je op het adres waar mijn bericht naartoe ging") &&
        stub.rijen[0]?.anders_tekst === null,
      `echo=${JSON.stringify(echo)}`,
    );
    await p4.reload({ waitUntil: "load" });
    await p4.locator("form").waitFor({ timeout: 10_000 }).catch(() => {});
    meld(
      "herladen na versturen: het lege formulier staat er weer, met de intro",
      (await p4.locator("form").count()) === 1 &&
        (await p4.getByText("Vink aan waar je nieuwsgierig naar bent").count()) === 1,
    );
    await p4.close();
  }

  // ---------- 4. een ander lead_id in de body ----------
  const geldig = {
    c: code,
    inzending_id: "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee",
    interesse: ["inkoop"],
    bereiken: "mailen",
    dagdeel: "middag",
  };
  leegStub();
  {
    const res = await stuur({ ...geldig, lead_id: ANDER_LEAD, versie: "C", l: ANDER_LEAD, v: "C" });
    const ok =
      res.status === 200 && stub.rijen.length === 1 &&
      stub.rijen[0].lead_id === LEAD && stub.rijen[0].versie === "B";
    meld("een ander lead_id (en versie) in de body verandert de opgeslagen waarden niet", ok, `status=${res.status} rijen=${JSON.stringify(stub.rijen)}`);
  }

  // ---------- 6. honeypot ----------
  leegStub();
  {
    const res = await stuur({ ...geldig, _hp: "https://spam.example" });
    const body = await res.text();
    meld(
      "honeypot gevuld: antwoord ok, niets bij de stub",
      res.status === 200 && body === '{"ok":true}' && stub.verzoeken.length === 0,
      `status=${res.status} body=${body} verzoeken=${stub.verzoeken.length}`,
    );
  }

  // ---------- validatie van de route zelf ----------
  leegStub();
  {
    const fout = {
      "geen code": { ...geldig, c: undefined },
      "vervalste code": { ...geldig, c: `${vervalst}.${handtekening}` },
      "lege interesse": { ...geldig, interesse: [] },
      "onbekende interesse": { ...geldig, interesse: ["inkoop", "iets"] },
      "interesse geen lijst": { ...geldig, interesse: "inkoop" },
      "onbekend dagdeel": { ...geldig, dagdeel: "avond" },
      "onbekend bereiken": { ...geldig, bereiken: "sms" },
      "bellen zonder nummer": { ...geldig, bereiken: "bellen", telefoon: "  " },
      "geen inzendings-id": { ...geldig, inzending_id: undefined },
      "inzendings-id geen uuid": { ...geldig, inzending_id: "1234" },
      "onzinnig ander adres": { ...geldig, ander_email: "geen adres" },
    };
    const statussen = {};
    for (const [naam, body] of Object.entries(fout)) statussen[naam] = (await stuur(body)).status;
    const geenJson = (await fetch(`${site}/api/gesprek`, { method: "POST", body: "geen json" })).status;
    const teGroot = (await stuur({ ...geldig, voorkeur: "x".repeat(21_000) })).status;
    const ok =
      Object.values(statussen).every((s) => s === 400) && geenJson === 400 && teGroot === 400 &&
      stub.verzoeken.length === 0;
    meld(
      "de route weigert ongeldige invoer met 400 en slaat niets op",
      ok,
      `${JSON.stringify(statussen)} geenJson=${geenJson} teGroot=${teGroot} verzoeken=${stub.verzoeken.length}`,
    );

    const lang = await stuur({
      ...geldig,
      interesse: ["anders", "inkoop", "inkoop"],
      anders_tekst: "a".repeat(1500),
      bereiken: "bellen",
      telefoon: "1".repeat(60),
      ander_email: "weg@voorbeeld.test",
      voorkeur: "v".repeat(300),
    });
    const r = stub.rijen[0] ?? {};
    meld(
      "te lange waarden worden ingekort, dubbele keuzes samengevoegd, ander adres weg bij bellen",
      lang.status === 200 && stub.rijen.length === 1 && r.anders_tekst?.length === 1000 &&
        r.telefoon?.length === 40 && r.voorkeur?.length === 200 && r.ander_email === null &&
        gelijk(r.interesse, ["inkoop", "anders"]),
      `status=${lang.status} lengtes=${r.anders_tekst?.length}/${r.telefoon?.length}/${r.voorkeur?.length} interesse=${JSON.stringify(r.interesse)}`,
    );
  }

  // de ontvanger antwoordt 2xx maar bevestigt niet: de bezoeker ziet geen "gelukt"
  leegStub();
  {
    stub.zonderOk = true;
    const res = await stuur(geldig);
    stub.zonderOk = false;
    meld(
      "ontvanger bevestigt niet met ok:true: de route geeft 502",
      res.status === 502 && (await res.text()) === '{"ok":false}',
      `status=${res.status}`,
    );
  }

  // een onzinnig ander adres wordt in het formulier al tegengehouden
  leegStub();
  {
    const p5 = await ctx.newPage();
    await open(p5, link);
    await p5.getByLabel("Offertes klaarzetten").check();
    await p5.getByLabel("Mail me").check();
    await p5.getByLabel("Liever een ander e-mailadres?").fill("geen adres");
    await p5.getByLabel("'s Middags").check();
    await p5.getByRole("button", { name: "Verstuur" }).click();
    const zichtbaar = await p5.locator("#fout-ander-email").isVisible();
    meld(
      "onzinnig ander adres: melding bij het veld, focus erop, niets verstuurd",
      zichtbaar && stub.verzoeken.length === 0 &&
        (await p5.evaluate(() => document.activeElement?.id)) === "gesprek-ander-email",
    );
    await p5.close();
  }

  // analytics: het filter staat klaar vóór de loader en laat /gesprek vervallen
  {
    const p6 = await ctx.newPage();
    await open(p6, link);
    const uit = await p6.evaluate(() => {
      const regel = [...(window.vaq ?? [])].map((a) => [...a]).find((a) => a[0] === "beforeSend");
      if (!regel) return null;
      const f = regel[1];
      const o = location.origin;
      return {
        gesprek: f({ type: "pageview", url: `${o}/gesprek?c=abc` }),
        home: f({ type: "pageview", url: `${o}/` })?.url,
        diensten: f({ type: "pageview", url: `${o}/diensten` })?.url,
        eerste: [...window.vaq[0]][0],
      };
    });
    meld(
      "analytics-filter: staat als eerste in de wachtrij, laat /gesprek vervallen en andere pagina's door",
      uit && uit.gesprek === null && uit.home?.endsWith("/") && uit.diensten?.endsWith("/diensten") && uit.eerste === "beforeSend",
      `uit=${JSON.stringify(uit)}`,
    );
    const kop = (await fetch(link)).headers.get("referrer-policy");
    const kopElders = (await fetch(`${site}/diensten`)).headers.get("referrer-policy");
    meld(
      "/gesprek stuurt geen verwijzer mee (no-referrer); de rest van de site houdt zijn eigen beleid",
      kop === "no-referrer" && kopElders === "strict-origin-when-cross-origin",
      `gesprek=${kop} diensten=${kopElders}`,
    );
    await p6.close();
  }

  // ---------- 8. breedtes en schermafbeeldingen ----------
  for (const breedte of [1280, 390]) {
    const c2 = await browser.newContext({
      viewport: { width: breedte, height: breedte === 390 ? 844 : 800 },
      isMobile: breedte === 390,
      hasTouch: breedte === 390,
      deviceScaleFactor: breedte === 390 ? 2 : 1,
    });
    const p = await c2.newPage();
    const scroll = {};

    await open(p, `${site}/gesprek`);
    scroll.terugval = await geenZijscroll(p);
    await foto(p, `terugval-${breedte}.png`);

    await open(p, link);
    scroll.formulier = await geenZijscroll(p);
    await foto(p, `formulier-${breedte}.png`);

    await vulAlles(p);
    scroll.ingevuld = await geenZijscroll(p);
    await foto(p, `formulier-ingevuld-${breedte}.png`);

    leegStub();
    await p.getByRole("button", { name: "Verstuur" }).click();
    await p.locator('[role="status"]').waitFor({ timeout: 10_000 });
    await p.locator('img[src*="voorbeeldplan"]').evaluate((el) => el.decode?.()).catch(() => {});
    scroll.dank = await geenZijscroll(p);
    await foto(p, `dank-${breedte}.png`);

    meld(
      `${breedte} breed: geen zijwaartse scroll (terugval, formulier, ingevuld, dank)`,
      Object.values(scroll).every(Boolean),
      JSON.stringify(scroll),
    );
    await c2.close();
  }

  // ---------- 9. e-mailadres, geheim en sleutel ----------
  {
    const html = await (await fetch(link)).text();
    const adressen = [...new Set(html.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [])];
    meld(
      "geen e-mailadres in de pagina behalve wessel@loopless.nl",
      adressen.every((a) => a === "wessel@loopless.nl"),
      `gevonden=${JSON.stringify(adressen)}`,
    );
    const lekHtml = [env.GESPREK_SECRET, env.GESPREK_DOORSTUUR_SECRET, env.GESPREK_DOORSTUUR_URL].some((w) => html.includes(w));
    meld("geheim, sleutel en database-adres staan niet in de HTML van de pagina", !lekHtml);

    const zoek = [env.GESPREK_SECRET, env.GESPREK_DOORSTUUR_SECRET, "GESPREK_SECRET", "GESPREK_DOORSTUUR", "LOOPLESS_SUPABASE"];
    const lijst = bestanden(path.join(root, ".next", "static"));
    const treffers = lijst.filter((f) => {
      const inhoud = readFileSync(f, "latin1");
      return zoek.some((w) => inhoud.includes(w));
    });
    meld(
      `geheim en sleutel (waarde en naam) staan niet in .next/static (${lijst.length} bestanden doorzocht)`,
      treffers.length === 0,
      treffers.map((f) => path.relative(root, f)).join(", "),
    );
  }

  // ---------- CSP ----------
  {
    const overtredingen = cspMeldingen.filter((m) => /violat|refused|blocked/i.test(m));
    meld(
      "geen CSP-overtredingen in de console op /gesprek",
      overtredingen.length === 0,
      overtredingen.concat(cspMeldingen.length ? [`(alle CSP-regels in de console: ${cspMeldingen.length})`] : []).join(" | "),
    );
  }

  if (/\[gesprek\]/.test(siteLog)) {
    console.log("\nRegels van de route in het serverlog:");
    console.log(siteLog.split("\n").filter((r) => r.includes("[gesprek]")).join("\n"));
  }
}

let code = 0;
try {
  await main();
} catch (e) {
  console.error("\nHet script is afgebroken:", e);
  code = 1;
} finally {
  await browser?.close();
  siteProces?.kill();
  stubServer.close();
}
const mislukt = uitslagen.filter((u) => !u.ok);
console.log(`\n${uitslagen.length - mislukt.length} van ${uitslagen.length} geslaagd.`);
if (mislukt.length) {
  console.log("Mislukt:\n" + mislukt.map((u) => `  - ${u.naam}`).join("\n"));
  code = 1;
}
process.exit(code);
