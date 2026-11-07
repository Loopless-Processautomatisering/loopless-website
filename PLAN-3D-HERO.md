# PLAN — het merkteken als 3D-hero van loopless.nl

Status: v2, wacht op Codex-ronde. Fable-ronde gedraaid (zie PLAN-REVIEW-LOG.md).
Richting goedgekeurd door Wessel 2026-09-21.

## De opdracht
De 3D-tegelsculptuur uit `~/work/loopless-3d-hero` wordt een **echt onderdeel van
loopless.nl**, geen losse demo.

Twee harde eisen van Wessel:
1. **Hij moet reageren op de muis.** Een 3D-object dat je muis niet volgt is een
   screensaver met extra stappen.
2. **Logisch verband met het logo en met het idee "Loopless".**

## Het beeld: het logo zelf

`public/logo-icon-final.png` is het verhaal al: een **navy lus die één keer
rondgaat, zich opent, en als cyaan pijl naar rechts wegloopt.** Loop → less.

Dat is de vorm die de hero wordt: één doorlopende betegelde baan die de
**logo-lijn** volgt, navy in de lus, omslaand naar cyaan `#4CC5E8` in de uitloop,
pijl die rechts het beeld uitloopt.

**Waarom niet een gesloten oneindigheidslus.** Die zegt letterlijk "eindeloze
loop" — het probleem dat Loopless oplost, niet de belofte. Precies daar liep de
`/reis`-proef van 20-09 op vast: een lemniscaat die zich strekt leest als een
slang die plat gaat liggen, niet als "uit de lus komen". Wat daar ontbrak is wat
het logo wel heeft: **de kleurbreuk**. Navy = de lus. Cyaan = eruit.

**De bestaande `logo`-vorm is niet bruikbaar.** `sculptuur.py:144 maak_curve_logo`
legt een buis rond de *omtrek* van het silhouet. Resultaat: een worst, geen
beeldmerk (`public/3d/sculptuur-logo.png`). Het script zegt dat zelf op regel 38.
Dit wordt een **nieuwe curve**: de logo-lijn als baan, niet de contour.

## Wat er nu staat

### Website (`~/work/Website LoopLess`, :3000)
- `src/components/hero-section.tsx` — 2D. Donker `#161625`, **links uitgelijnde**
  tekstkolom `max-w-[720px]` in een container van 1200; rechterhelft leeg.
  `NeuralBackground` (700 particles) + gradient-overlay, framer-motion, twee CTA's.
- Kop en subkop komen uit **Supabase** (`getBlocksByPage("home")`), server-gerenderd.
- `HeroSection` rendert `children` **binnen dezelfde `<section>`** met dezelfde
  achtergrond; `page.tsx` stopt daar de drie probleemkaarten in.
- `three`, `@react-three/fiber`, `@react-three/drei` staan al in package.json.
- CSP staat **Report-Only** in `next.config.ts`.
- Ongecommit: de verkenning van 19-09 (`damagedhelmet.glb` 3,7 MB, `helmet-opt.glb`,
  `model-hero.tsx`, `model-stage.tsx`, `/3d-test`). Wordt overbodig.
  **Niet verwijderen zonder expliciete bevestiging van Wessel.**

### Werkbank (`~/work/loopless-3d-hero`, :3001)
- `sculptuur.tsx` — hover-kwast, klik-uiteen, slepen met naloop, lichtpuls.
- `sculptuur-hero.tsx` — dynamic import (WebGL buiten SSR), poster/fallback,
  reduced-motion, pauzeren buiten beeld, contextverlies-vangnet.
- `context-herstel.ts`, `tegels.ts`, `palet.ts`.
- `scripts/meet.mjs` — Playwright-meting (fps, heap, canvas, externe requests).

### Versies — geverifieerd
`next` 16.1.6, `react`/`react-dom` 19.2.3, `@react-three/fiber` 9.7.0,
`@react-three/drei` 10.7.8: **identiek** in beide repo's.
Alleen `three` verschilt: website 0.180.0, werkbank 0.186.0 → één bump.

## Stap 0 — bestaande bug, los van dit plan
`three` staat in `HEAD:package.json` maar **niet in `HEAD:package-lock.json`**
(0 treffers op `node_modules/three`). Een schone `npm ci` op Vercel installeert
three niet. Lockfile committen vóór al het andere.

## De bouw

### 1. Nieuwe curve in Blender
Een baan die de logo-lijn volgt: lus links (één omwenteling), opening, uitloop
naar rechts eindigend in de pijlvorm. Plat profiel (`plat` ~0,7–0,85) — een ronde
buis leest als een autoband, dat is al een keer misgegaan.
Niet-gesloten curve, dus `VORMEN["merk"] = (..., False)`.

### 2. Kleurbreuk langs de baan — nieuw
Alle vormen hebben nu één tegelkleur. Navy → cyaan als functie van de positie
langs de curve moet erbij. Raakt `palet.ts` én de puls-logica in `sculptuur.tsx`
(~regel 300), die nu op uniform donkere tegels rekent en bij een cyaan tegel
anders uitpakt.

### 3. Interactie — kwast uit `pointermove` op de sectie
Nu hangt hover aan `onPointerOver` op de mesh-group: de cursor moet letterlijk op
een tegel staan. In plaats daarvan luisteren op de **hero-sectie**. Dan reageert
het beeld ook als de cursor over de tekst gaat, en is `pointer-events-none` op de
tekstkolom niet nodig — de kop blijft selecteerbaar.
Klik-uiteen en slepen: **uit** in de hero. Reden uit de werkbank-comment: "een
klik naast de knop liet de hele ring exploderen". De CTA's zijn hier het doel.

### 4. Plaatsing
Rechterhelft, naast de linkse kop. `verschuif` in `BEELD` (lus 0,0016, stroom
0,0012) doet dit al; de nieuwe vorm krijgt een eigen regel. De pijl loopt rechts
het beeld uit.

### 5. Overzetten
Kopiëren, niet importeren — twee losse repo's. Mee: `sculptuur.tsx`,
`sculptuur-hero.tsx`, `context-herstel.ts`, `tegels.ts`, `palet.ts`, het GLB.
**Vóór het kopiëren strippen:** `reis.tsx`, `reis-hero.tsx` en de `onthullen`-modus
gaan anders als dode code mee.
`playwright` erbij als devDependency (staat nog niet in de website-repo).

### 6. Flow-field
`NeuralBackground` ligt ook onder de probleemkaarten, niet alleen achter de hero.
Hem "eruit halen" haalt hem dus ook daar weg. Keuze voor Wessel:
(a) sectie splitsen — sculptuur in de hero, particles weg onder de kaarten;
(b) particles blijven onder de kaarten, canvas alleen over de eerste 100vh;
(c) alles eruit.
Niet twee animatielussen stapelen.

### 7. Mobiel — expliciete keuze, geen aanname
`Poster()` geeft voor `lus`/`boog`/`oneindig` een **CSS-gradient**, geen
afbeelding; alleen `logo` en `stroom` hebben een PNG. De nieuwe vorm heeft er dus
ook geen. Opties: still bakken met `--render`, desktop-only accepteren, of een
lichte variant. Voor een MKB-site is mobiel doorgaans de helft van het verkeer.

### 8. Toegankelijkheid — ontbrak volledig in v1
- `aria-hidden` op het canvas, altijd (staat nu alleen bij `boog`).
- Bij `prefers-reduced-motion`: Three.js **niet laden**, poster tonen. Nu wordt
  alleen de animatie uitgezet terwijl de bundel wel binnenkomt.
- Geen `grab`-cursor over de hele hero: die suggereert een handeling die zonder
  muis niet bestaat — en slepen gaat er toch uit.

### 9. LCP — de alinea uit v1 was fout
De LCP-kandidaat is nu de **server-gerenderde h1** met Supabase-tekst, direct in
de HTML. Beter kan niet. Een poster met `priority` erbij zetten creëert juist een
groter LCP-element. Dus: geen priority-poster. Canvas laadt lazy na hydratie
(`dynamic(..., {ssr:false})` doet dat al). LCP vóór en ná meten, niet aannemen.

## Volgorde
1. Stap 0: lockfile repareren en committen.
2. Codex-ronde op dit plan (quota terug 16:03). Bevindingen in PLAN-REVIEW-LOG.md.
3. Curve bouwen in de **werkbank**, plus een pagina die de echte hero-layout
   nabootst (linkse kop, `#161625`, de CTA's). Meten met `meet.mjs`: fps, heap,
   externe requests, screenshots desktop én mobiel. **Meten vóór overzetten.**
4. Wessel kijkt. Pas bij akkoord over naar de website.
5. Overzetten, hero omzetten, opnieuw meten op de echte hero.
6. Commit. **Deploy is een apart besluit.**

## Openstaand
- **Positionering.** Fable werpt op dat een canvas met verende tegels spanning
  heeft met de eigen kernboodschap "AI is het middel, niet het doel", en vraagt om
  een conversiecriterium vooraf (CTA-klikpercentage vóór/ná via Vercel Analytics,
  staat al aan). Doorgegeven aan Wessel; geen technische beslissing.
- CSP: `img-src` staat geen `blob:` toe. Controleren of drei's `Environment`
  geen blob-textures aanmaakt. Report-Only maakt het zichtbaar, niet blokkerend.
- Supabase-kop is via `/beheer` bewerkbaar en kan langer worden. Bij de
  rechterhelft-plaatsing speelt de `vrijTot`-clamp niet meer, maar controleren
  dat een lange kop de sculptuur niet overlapt.
