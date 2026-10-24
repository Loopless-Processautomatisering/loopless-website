# Reviewlog — PLAN-3D-HERO.md

## Ronde 1 — 2026-09-20

**Fable:** gedraaid, tien bevindingen.
**Codex:** NIET gedraaid — ChatGPT-quota op tot 2026-09-21 16:03.
Een ronde 2 met Codex is nog open; dit plan is dus half getoetst.

### Zelf geverifieerd (niet blind overgenomen)

| Claim van Fable | Uitkomst |
|---|---|
| Boog heeft geen poster-PNG, valt terug op een CSS-gradient | **Klopt.** `sculptuur-hero.tsx:55` — `boog`, `lus` én `oneindig` geven `<GradientBoog />`. Alleen `logo` en `stroom` hebben een PNG. |
| De echte hero is links uitgelijnd, niet gecentreerd zoals de werkbank-boog | **Klopt.** `hero-section.tsx` — tekstkolom `max-w-[720px]` in een container van 1200, rechterhelft leeg. De werkbank-boog staat `items-center text-center`. |
| `lus`/`stroom` zijn juist gebouwd om naast een linkse kop te staan | **Klopt.** `sculptuur.tsx:83-97` — `verschuif` is 0,0016 (lus) en 0,0012 (stroom), maar 0 voor `boog` en `oneindig`. De vormen die Fable voorstelt schuiven per ontwerp naar rechts. |
| `three` staat in package.json maar niet in de gecommitte lockfile | **Klopt, en het is een bestaande bug.** `git show HEAD:package-lock.json` heeft 0 treffers op `node_modules/three`, `HEAD:package.json` wel. Een schone `npm ci` op Vercel installeert three niet. Staat los van dit plan en moet hoe dan ook gerepareerd. |
| `NeuralBackground` ligt ook onder de probleemkaarten | **Klopt.** `hero-section.tsx` rendert `children` binnen dezelfde `<section>`; `page.tsx` stopt daar de kaarten in. |

Versievergelijking zelf gedaan: `next`, `react`, `react-dom`, `@react-three/fiber`,
`@react-three/drei` zijn **identiek** in beide repo's. Alleen `three` verschilt
(website 0.180, werkbank 0.186) — één bump.

### Overgenomen
1. **Boog is de verkeerde vorm.** Het oorspronkelijke plan koos hem op "past in de
   layout" en schoof de harde eis (reageren op de muis) weg als kanttekening. Dat
   is naar een conclusie toe redeneren. `lus` of `stroom` rechts van de linkse
   tekstkolom heeft het volle interactie-oppervlak én past op de bestaande layout.
2. **Kwast uit `pointermove` op de sectie, niet uit r3f-hover.** Nu moet de cursor
   letterlijk op een tegel staan (`onPointerOver` op de mesh-group). Op de sectie
   luisteren laat het beeld ook reageren als de cursor over de tekst gaat — en dan
   is `pointer-events-none` op de tekstkolom niet meer nodig, wat het selecteren
   van de kop weer mogelijk maakt.
3. **Mobiel is een keuze, geen aanname.** Voor lus/boog bestaat er geen still.
   Expliciet beslissen: still bakken, desktop-only accepteren, of een lichte variant.
4. **LCP-alinea was fout.** De LCP is nu de server-gerenderde h1 en dat is optimaal.
   Een poster met `priority` erbij maakt het slechter, niet beter. Vervallen.
5. **Palet-optie (d):** een licht hero-vlak binnen de donkere site. Houdt de
   sculptuur zoals hij bewezen werkt en raakt alleen `hero-section.tsx`.
6. **Meten vóór overzetten.** Een werkbank-pagina die de echte hero-layout nabootst
   (linkse kop, `#161625`, de CTA's) met `meet.mjs` erop. Dan kiest Wessel op
   cijfers in plaats van op beschrijvingen.
7. **Lockfile committen is stap 0.**
8. **Toegankelijkheid ontbrak volledig:** `aria-hidden` altijd, bij reduced-motion
   Three.js niet laden i.p.v. alleen de animatie uitzetten, geen `grab`-cursor die
   een handeling suggereert die zonder muis niet bestaat.
9. **Dode code strippen vóór het kopiëren** (`reis.tsx`, `reis-hero.tsx`, de
   `onthullen`-modus).

### Niet overgenomen, wel doorgegeven aan Wessel
**Bevinding 6 — "wordt de vraag of een 3D-hero überhaupt goed is wel gesteld?"**
Fable wijst erop dat een canvas met verende tegels spanning heeft met de eigen
kernboodschap "AI is het middel, niet het doel", en vraagt om een conversie-
criterium vóór de bouw. Dat is een terecht punt maar geen technische bevinding:
het is een positioneringsbesluit van Wessel. Doorgegeven, niet zelf beslist.

---

## Ronde 2 — 2026-09-21, op PLAN-3D-HERO.md v2

**Codex** (`codex exec --sandbox read-only`, gpt-5.6-sol): **VERDICT:REVISE**, 18 bevindingen.
Blind gedraaid: dit reviewlog stond tijdens de run buiten de repo, dus Codex kon
Fable's ronde-1-bevindingen niet zien.

### Zelf geverifieerd

| Claim van Codex | Uitkomst |
|---|---|
| `maak_curve_logo` pakt alleen de **langste spline** en gooit de rest weg; de tweede SVG-path is de losse pijl, niet "het gat in de lus" | **Klopt.** `logo-silhouet.svg` heeft 2 paths; `sculptuur.py:160-168` houdt alleen de spline met de meeste bezier-punten over. De pijl — precies het deel dat het verhaal draagt — valt er dus af. |
| Alleen `VORMEN["merk"]` toevoegen bouwt niet: `bouw()` haalt verplicht `GEOMETRIE[vorm]` op | **Klopt.** `sculptuur.py:279` — `g = GEOMETRIE[vorm]` zonder fallback → `KeyError`. Ook `BEELD` en `OMSCHRIJVING` hebben een entry nodig. |
| `context-herstel.ts` wordt **niet** gebruikt door `sculptuur-hero.tsx`; die logica staat daar inline | **Klopt.** 0 treffers op `context-herstel` in `sculptuur-hero.tsx`. Alleen `reis*` gebruikt de hook. Meekopiëren = dode code. |
| `reducedMotion` zit niet in `stil`, dus Three.js laadt op desktop ook bij reduced-motion | **Klopt.** `sculptuur-hero.tsx:166` — `const stil = smal === null \|\| smal \|\| kapot;`. |
| De LCP-redenering is te stellig: de h1 wordt door framer-motion initieel met `opacity: 0` gerenderd | **Klopt, en dit corrigeert ronde 1.** `hero-section.tsx:58` — `initial={{ opacity: 0, y: 40 }}`. Fable's punt 4 ("h1 is LCP en dat is optimaal") en mijn overname daarvan waren te stellig: de kop verschijnt pas na hydratie. |

### Overgenomen in v3
1. **De pijl zit niet in de huidige logo-curve** en kan er ook niet automatisch uit:
   er is een expliciet getekende open centerline nodig, plus een ontwerpbesluit over
   hoe de navy lus en de cyaan pijl verbonden worden.
2. **Een pijlpunt kan de generator nu niet maken.** Constante doorsnede over de hele
   baan → een centerline eindigt stomp. Vergt variabele doorsnede, een vertakking,
   of een apart tegelobject voor de punt.
3. **`gesloten=False` is maar half ondersteund.** De tegelverdeling gebruikt voor open
   en gesloten vormen dezelfde `row * totaal / ROWS`, dus het exacte eindpunt wordt
   nooit betegeld — hinderlijk juist bij een pijlpunt. En de puls doet
   `if (d > 0.5) d = 1 - d`, wat op een open baan over de uiteinden heen springt.
4. **De kleurbreuk raakt ook `tegels.ts`.** Eén uniform materiaal per rol; de puls
   overschrijft elk frame alle drie kanalen met dezelfde factor, dus een basisgradient
   verdwijnt bij de eerste puls. Nodig: blijvende basiskleur per tegel, puls als
   vermenigvuldiging daarbovenop.
5. **"Eén kleurbron" is nu al niet waar.** TypeScript maakt de body navy, Blender maakt
   hem licht `#E4EBF7`. De mobiele still kan dus een ander kleurverhaal vertellen dan
   het canvas. De kleurbreuk moet in beide, of uit gedeelde data komen.
6. **`pointermove` op de sectie vervangt r3f-hover niet zomaar.** De kwast is geen
   mesh-hit maar een straalkwast: `useThree().pointer` → cameraray → lokale ruimte van
   de draaiende groep → afstand per tegel. De sectiehandler moet zelf NDC t.o.v. het
   canvas berekenen en via een ref doorgeven. Ook `pointerleave` nodig, anders blijft
   de kwast hangen.
7. **Klik/sleep uitzetten is meer dan `onPointerOver` weghalen:** `pointerdown`,
   `pointermove`, `pointerup`, sleepstaat, uiteenval-toggle en de globale bodycursor
   hangen aan dezelfde group.
8. **Lockfile-gevolg verkeerd geformuleerd.** `npm ci` *stopt* bij de mismatch, hij
   installeert niet stilletjes zonder three. Ernstiger dan v1 zei.
9. **Ook `@types/three` verschilt** (0.180 vs 0.186), niet alleen `three`. Geen
   aantoonbare API-noodzaak om te bumpen → eerst op 0.180 testen; bij een bewuste bump
   runtime én types samen.
10. **De assetpipeline ontbrak.** Blender schrijft `sculptuur-merk.glb`, de component
    vraagt `sculptuur-merk-opt.glb`. De `gltf-transform optimize`-stap ertussen is
    verplicht en staat niet gepind in `package.json`.
11. **CSP-controle keek naar de verkeerde plek.** `Environment` gebruikt lokale
    Lightformers, dus `img-src blob:` is niet het risico. Het echte punt: de Meshopt-
    decoder instantieert WebAssembly → `script-src 'wasm-unsafe-eval'` testen. Er is
    bovendien geen reporting-endpoint en `meet.mjs` luistert niet naar console, dus
    CSP-violations komen nu in geen enkele meting terecht.
12. **`meet.mjs` meet geen LCP** en draait alleen 1440×900 desktop.
13. **De "hero-sectie" is in de huidige DOM ook de probleemkaarten-sectie.** Een
    pointerhandler of canvas op die outer section reageert dus ook boven "Herken je
    dit?". Er moet een aparte eerste-viewport-wrapper komen.
14. **Supabase-keten expliciet intact houden** en acceptatiegrenzen vastleggen voor
    kolombreedte en wrapping — "rechterhelft" alleen voorkomt geen overlap bij een
    langere kop uit `/beheer`.

### Waar de twee rondes elkaar corrigeren
- Fable zei: "de h1 is LCP en dat is optimaal, dus geen priority-poster."
  Codex laat zien dat die h1 door framer-motion pas na hydratie zichtbaar wordt.
  **Beide conclusies zijn dus te stellig; de LCP moet gemeten worden, niet beredeneerd.**
- Fable werkte op de opdracht (welke vorm, welk palet, waarom überhaupt).
  Codex werkte op de code (wat breekt er bij het bouwen). Geen enkele bevinding
  overlapte. Dat is precies de taakverdeling die in CLAUDE.md staat.

## Ronde 3 — 2026-09-25, contactformulier (Formspree → eigen `/api/contact`)

Plan: scratchpad `PLAN-contactformulier.md` (concept). Aanleiding: Wessel meldt "contactformulier werkt niet".
Diagnose vooraf: keten Formspree → wessel@loopless.nl werkt (testinzending 13:22 UTC, binnen 1s in inbox);
echte lead van 11-09 stond ongelezen. Wat Wessel precies zag is nog onbekend.

**Codex (REVISE, 8 punten, geverifieerd tegen code):** client stuurt FormData, route verwacht JSON;
geen time-outs, dus fallback niet gegarandeerd bereikbaar; cotek-route geeft ook bij mislukte mail
200 terug (`route.ts:139`), dat contract mag niet mee; nachtwacht-predicate is config-check, geen
afleverbewijs; secret in header i.p.v. query; privacy-tekst klopt niet als Formspree fallback blijft;
body-limiet/typevalidatie; foutpaden testen. CSP/middleware/manifest: geen blokkade.

**Fable (2 blokkerend, 5 belangrijk):** opdracht lost een onbekend probleem op — de ongelezen lead is
een meldingsprobleem, Resend verandert dat niet; Vercel-logs (1u Hobby / 1 dag Pro) zijn geen vangnet;
afzender (b) site-up.nl verworpen (entiteitsmenging); `_dmarc.loopless.nl` = `p=reject` (zelf
geverifieerd met dig) → na DNS-setup verifiëren op `dmarc=pass` in ontvangen headers; n8n als derde
optie; Gmail-filter + tweede meldkanaal ontbrak.

**Overgenomen:** alles van Codex; van Fable: meldmaatregel vooraan, log-vangnet geschrapt, afzender (a),
DMARC-headercheck, eerlijke goal-omschrijving. **Niet overgenomen:** bouw pas na dashboardcheck
blokkeren — Wessel gaf richting akkoord ("zolang het maar werkt"); dashboardcheck loopt parallel.
Overlap tussen de twee: alleen de nachtwacht-predicate-kritiek.
