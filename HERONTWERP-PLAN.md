# Herontwerp loopless.nl — plan ter akkoord

Status: **wacht op akkoord Wessel**. Datum: 2026-09-19.
Tegengelezen door Fable (ontwerp) en Codex (code naast voornemen), blind van elkaar.
Alle feitelijke claims hieronder zijn door de hoofdsessie zelf geverifieerd tegen de repo.

## Aanleiding

Wessel: "inhoud is goed, maar de layout en visuals zijn matig en AI slob."

## Besluiten (vastgelegd 2026-09-19)

| # | Besluit | Keuze |
|---|---|---|
| 1 | Richting | Licht, redactioneel, zakelijk |
| 2 | Reikwijdte | Nieuw design system + alle pagina's |
| 3 | Beeld | Zelfgetekende SVG-schema's, geen stockbeeld, geen icoongrid |
| 4 | Accent | Inktblauw `#1B3A5C` — precies één accent |
| 5 | Fonts | Twee varianten naast elkaar op `/stijl`, keuze op scherm |
| 6 | Logo | Woordmerk in tekst, icoon opnieuw als SVG |
| 7 | 3D | Eigen Blender-model (in de maak) — de loop/het mechanisme, in de hero, rustig en monochroom |

## Diagnose

Beide tegenlezers komen onafhankelijk op dezelfde kern uit: **er is geen design system.**

- **426 losse hexcodes in 27 bestanden** (geverifieerd). `globals.css:50-59` definieert nette
  `--color-loopless-*`-tokens die door geen enkele pagina worden gebruikt. Alleen `:root` licht
  maken verandert vrijwel niets — kaarten, navbar, formulieren en de configurator hebben hun
  kleuren hardcoded.
- **Zeven kleuren waar er één hoort te zijn:** accent `#4F8EF7`, logo-cyaan `#4CC5E8`,
  OG-image `#1B3A5C`/`#22B8CF`, plus per-kaart cyaan/paars/oranje/groen.
- **De effecten:** 700-deeltjes particle-canvas achter de hero + 300 achter de CTA
  (`hero-section.tsx`, `flow-field-background.tsx`), `PageGlow` op 9 pagina's,
  scroll-animaties (`animate-in.tsx`) op 8 pagina's waardoor alles onzichtbaar is tot je scrolt,
  hover-lift + glow-schaduw op vrijwel elke kaart, gradient-hairlines.
- **De kaartenmuur:** `rounded-xl border bg-[#1E1E30] p-8` is de bouwsteen van élke sectie op
  élke pagina.
- **Space Grotesk** is sinds 2021 hét lettertype van crypto/AI-landingpages — de eerste
  visuele trigger voor "slop".
- **Dode code** (geverifieerd, 0 imports): `shiny-button.tsx`, `glowing-effect.tsx`,
  `card-with-noise-patter.tsx`. Plus `framer-motion` én `motion` allebei in `package.json`.

### Wat blijft

Het kennisbank-artikel (`kennisbank/automatisering-mkb/page.tsx`) is al de redactionele maat:
760px kolom, 17px/1.75 body, gewone koppenhiërarchie. De rest van de site moet daarnaartoe.
Verder blijven: alle metadata en JSON-LD, `sitemap.ts`, `next.config.ts` (CSP), de hele
`content.ts`, `preview-banner.tsx` (bewust engine-identiek — niet aanraken), alle `api/*`,
en de configurator-logica.

## Los van het design: drie onjuiste claims naar buiten

Deze vallen onder de harde regel "claims altijd dubbelchecken". Alle drie geverifieerd:

1. **`privacy/page.tsx:78` zegt "geen tracking-cookies en geen analytics"**, maar
   `layout.tsx:118` laadt Vercel Web Analytics. Onjuiste claim op een juridische pagina.
2. **`public/llms.txt` spreekt de site tegen:** regel 21 belooft "binnen 2 weken werkende
   oplossing" (site: 4-6 weken), regel 17 claimt "Uren per week bespaard, structureel"
   (cijferclaim die de positionering vermijdt), en Drabor ontbreekt volledig.
3. **Eén tekst heeft twee waarheden:** manifest zegt "beslist de inkoper", code-fallback zegt
   "beslissen de inkopers". Wat je ziet hangt af van of het blok in de database staat.

## Design system

### Kleur (licht, één accent)

Als `--color-*` onder `@theme` in `globals.css`, met de shadcn-semantiek eraan gekoppeld.

| Token | Hex | Gebruik |
|---|---|---|
| `paper` | `#FAFAF7` | paginagrond (warm gebroken wit, geen `#FFF`) |
| `paper-2` | `#F2F1EC` | max één tintvlak per pagina |
| `ink` | `#14161A` | koppen, body |
| `ink-2` | `#474C55` | secundaire tekst (8.3:1) |
| `ink-3` | `#767C86` | meta (4.6:1, alleen >=14px) |
| `rule` | `#DEDCD5` | hairlines, formulierranden in rust |
| `rule-strong` | `#B9B6AD` | actieve rand, secundaire schemalijnen |
| `accent` | `#1B3A5C` | **alleen** links, primaire knop, en het "mensen beslissen"-knooppunt |
| `ok` / `err` | `#2E7D4F` / `#B42318` | uitsluitend formulierstatus |

Geen schaduwen, geen gradients, geen blur. Radius max 2px. Hover = onderstreping of
kleurverschuiving, nooit verplaatsing.

### Typografie

Twee varianten op `/stijl`, keuze op scherm:
- **A:** Newsreader (koppen, serif met krantenherkomst) + IBM Plex Sans (body) + Plex Mono (schemalabels)
- **B:** Schibsted Grotesk, één familie, koppen via gewicht en maat

Basis 17px, proza max 40rem (~65 tekens), container 70rem. Koppen krijgen gewicht- en
kleurcontrast, niet bold-op-bold.

### Ritme

Basis 8px. Sectie-afstand 6rem desktop / 4rem mobiel, gescheiden door een hairline of niets —
**geen afwisselende achtergrondbanden** (nu om en om `bg-[#1A1A2E]`). Witruimte doet het werk
dat nu kaarten en glows doen.

### Componenten (klein, bewust geen Card)

`Section`, `Prose`, `Eyebrow`, `Button`/`TextLink`, `Rule`, `NumberedList`, `DefinitionList`,
`PullQuote`, `Figure`+`Schema*`, `Field`/`TextArea`/`Choice`, `Masthead`+`Footer`, `ClientLine`.

Geen Card-component: de verleiding om weer overal dozen te tekenen moet er structureel uit.

## Het beeld: schema's + het 3D-model

Eén grammatica, één verhaal. Lijnen 1px `ink`, knooppunten als rechthoeken, labels in mono,
open pijlpunten. **Precies één element in accent: het knooppunt "jouw mensen controleren en
beslissen".** Daarmee is de positionering het enige gekleurde op de site.

Zes SVG-schema's (server components, `role="img"` + `<title>`/`<desc>` voor crawlers, geen animatie):
1. Master — de loop: bronnen -> systeem zoekt uit -> **[accent] mensen beslissen** -> resultaat
2. Leads, 3. Inkoop/besteladvies, 4. Offertes, 5. Vragen uit documentatie
6. Ervoor/erna-variant voor de cases: erna verschuift alles naar "systeem" behalve het accent-knooppunt

**Het 3D-model (Blender, door Wessel, in de maak)** toont dezelfde loop en staat in de hero.
Behandelregels zodat het beeld blijft en geen effect wordt:
- monochroom in `ink`/`accent` op `paper`, geen glans, geen felle lichten, geen omgevingsreflecties
- **geen autorotatie**; stil, of hooguit reagerend op scroll
- `prefers-reduced-motion` -> statische render; WebGL faalt -> statische render
- poster/fallback op `paper`, niet op het huidige `#161625`
- budget: model + texturen samen onder 600KB, LCP mobiel onder 2,0s — anders statisch beeld
- de bestaande wiring in `model-hero.tsx` (reduced-motion-check, WebGL-detectie, poster,
  contextverlies-afvang) is bruikbaar en blijft; alleen de donkere achtergrond gaat eruit
- tot het model klaar is bouw ik schema 1 als SVG op die plek, zodat de hero nooit leeg staat

## Wat er technisch in de weg zit

1. **Slugs niet hernoemen.** `/` en `/over` lezen uit Supabase; een hernoemde slug in code
   betekent stilzwijgend voor eeuwig de fallback, zonder foutmelding.
2. **`home_hero_title` bevat `\n`** als regelbreek-conventie waar `hero-section.tsx` op splitst.
   De nieuwe hero moet dat blijven ondersteunen.
3. **Vijf gebruikte slugs staan niet in het manifest** (geverifieerd): `home_case_drabor_title`,
   `home_case_drabor_desc`, `over_waarom_heading`, `over_resultaat_heading`,
   `over_resultaat_drabor_text`. Die zijn nu niet via het portaal te beheren.
4. **Geen nieuwe CMS-blokken deze ronde.** Figcaptions en schemalabels leven in code, anders
   hangt het herontwerp aan een seeder-run.
5. **De configurator is een datacontract.** De zichtbare kaartteksten gaan als renderklare
   `uitslag` naar n8n, en `_hp` is een werkende honeypot. Alleen de presentatie-primitieven
   (`configurator.tsx:532-612`) worden vervangen; logica, payload en honeypot blijven letterlijk.
6. **CI heeft geen vangnet.** Alleen de manifest-check draait; geen build, lint of tsc. En
   `npm run lint` faalt nu al met 3 errors (geverifieerd).
7. **De OG-image is volledig donker** en moet opnieuw. `ImageResponse` gebruikt `next/font` niet —
   font via `readFile` als ArrayBuffer.
8. **`/privacy` ontbreekt in `sitemap.ts`** terwijl de pagina indexeerbaar is met canonical.
9. **Preview dekt alleen `/` en `/over`** — de overige zeven pagina's zijn niet via het portaal
   na te kijken.

## Aanpak

**Big-bang op een branch, niet gefaseerd live.** Een halve site licht en de rest donker is erger
dan beide. Beoordeling wel gefaseerd, via Vercel-preview, desktop en 375px.

### Fase 0 — vooraf, geen design
- IA: één naam voor de configurator (heet nu "Doe de zelfscan" / "Kijk wat er bij jou kan" /
  "Wat kan het overnemen?"); home-dienstenlijst gelijktrekken met `/diensten` (inkoop-besteladvies
  ontbreekt op home terwijl dat de Drabor-case is); nav krijgt Cases en Kennisbank
- de drie onjuiste claims rechtzetten (privacy, llms.txt, manifest-drift)
- `/privacy` in de sitemap
- CI uitbreiden: `npm ci && lint && tsc --noEmit && build`, plus een grep die nieuwe hexcodes
  in `src/` rood maakt (behalve `preview-banner.tsx` en `opengraph-image.tsx`)
- 3D-experiment: `damagedhelmet.glb` (3,7MB Khronos-testmodel) eruit zodra Wessels eigen model er is

### Fase 1 — fundament
Tokens, fonts, primitieven, de zes schema's, en `/stijl` (noindex) met alles naast elkaar en
beide font-varianten. **Beoordeling door Wessel op een echt scherm voordat er één pagina wordt
gebouwd.** Dit is de goedkoopste plek om te ontdekken dat iets alsnog niet goed is.

### Fase 2 — funnelkern
Masthead, footer, home, diensten, cases.

### Fase 3 — rest
Over, FAQ (`useState` -> `<details>/<summary>`, wordt server component), kennisbank x2,
contact, privacy.

### Fase 4 — configurator
Primitieven wisselen, uitslag met de bijpassende schema's. Payload-contract bewaakt — Codex
hierop laten meelezen met de vraag "verandert de payload?".

### Fase 5 — 3D-hero
Zodra Wessels model klaar is: inpassen volgens de behandelregels, meten (LCP mobiel), en bij
overschrijding terugvallen op de statische variant.

### Fase 6 — afronding
OG-image in de lichte stijl, asset-opruiming (alleen na bevestiging — `public/` bevat 5,4MB
`definitief-logo.png`, 4,6MB `logo.png`, 1,5MB ongebruikte `logo-definitief-icon.png`, en de
navbar rendert een 1MB PNG `unoptimized` op 30px), Lighthouse en LCP mobiel, Playwright-
screenshots desktop + 375px per route, cutover in één keer.

## Definitie van "niet slop" — toetsbaar bij de review

Geen gradients, glow of blur. Eén accent. Geen icoongrid. Nul scroll-animaties. Max één
tintvlak per pagina. Lighthouse mobiel >= 95 performance. LCP < 2,0s op 4G. Alle tekst AA.
Zichtbare focusstijl. Boven de vouw op 375px: kop, één zin, één knop, en het beeld.

## Nog nodig van Wessel

- **Akkoord op dit plan** (niets wordt gebouwd tot dat er is)
- Drie sites die je goed vindt en drie die je slop vindt — zonder referenties is "redactioneel"
  een rorschachtest
- Het Blender-model zodra het klaar is (GLB, Meshopt-geoptimaliseerd)
- Bevestiging vóór élke verwijdering (harde regel): dode componenten, ongebruikte PNG's,
  `framer-motion`/`motion`/`lucide-react`
