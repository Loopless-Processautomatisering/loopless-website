# Loopless website v2

De nieuwe website van Loopless (loopless.nl), gebouwd met **Next.js 16**, React 19,
Tailwind CSS 4, Framer Motion en Three.js.

## Starten

Je hebt **Node.js 20.9 of nieuwer** nodig.

```bash
npm install
cp .env.example .env.local   # vul de waarden in (zie hieronder)
npm run dev
```

Open daarna http://localhost:3000.

De eerste keer laden duurt even: Next.js bouwt de pagina dan op. Zonder ingevulde
`.env.local` werkt de site ook. Dan staan in de terminal meldingen als
`getPublishedBlocks failed` en gebruikt de site de standaardteksten uit de code.

Andere commando's:

| Commando | Wat het doet |
|---|---|
| `npm run build` | Productieversie bouwen |
| `npm run start` | De gebouwde versie draaien |
| `npm run lint` | Code nalopen met ESLint |
| `npm run check:manifest` | `content-manifest.json` controleren (draait ook in CI) |

## Instellingen (`.env.local`)

Alle namen staan in `.env.example`. De waarden zijn geheim en staan niet in deze repo;
die krijg je los aangeleverd.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TENANT_ID`: de teksten
  van de home en /over komen uit het portaal.
- `PORTAAL_*`: voorbeeldweergave en bijwerken na een tekstwijziging in het portaal.
- `CONFIGURATOR_WEBHOOK_URL`: waar de aanvraag uit /configurator naartoe gaat.

## Waar zit wat

| Onderdeel | Bestand |
|---|---|
| Homepagina | `src/app/(site)/page.tsx` |
| Hero met de stoflus, en de sectie "Wij doorbreken de loop" | `src/components/hero-arc.tsx` |
| De ∞ van stof (Three.js): breekt onder de muis en vormt bij het scrollen het logo | `src/components/loop-dust.tsx` |
| De lichtcirkel met de komeet langs de rand | `src/components/loop-circle.tsx` |
| Drijvend stof, mini-loop, illustraties, bewegende schermpjes, tijdlijn | `src/components/home-visuals/` |
| Dienstenpagina | `src/app/(site)/diensten/page.tsx` |
| Over-pagina | `src/app/(site)/over/page.tsx` |
| Algemene stijl, glazen pil (`.liquid-glass`) | `src/app/globals.css` |
| Bronbeelden voor het stof: de ∞ en het logo | `public/loop-infinity.png`, `public/logo-definitief-icon-trimmed.png` |

### De stoflus aanpassen

In `loop-dust.tsx` staan bovenaan uitleg en de instellingen:

- **Vorm:** wordt gelezen uit `public/loop-infinity.png`. Vervang dat beeld (zwart op wit)
  en de lus neemt de nieuwe vorm aan. Hetzelfde geldt voor het logo.
- **Kleuren:** de uniforms `uNavy`/`uTeal` (de ∞), `uCloudLo`/`uCloudHi` (de blauwe wolk).
- **Aantal deeltjes:** `COUNT` (lager op telefoons).
- **Plek en grootte:** de functie `layout()`.

Alle animaties houden rekening met `prefers-reduced-motion` en staan stil zodra ze
buiten beeld zijn.

## Teksten en het portaal

De teksten op `/` en `/over` zijn via het portaal te bewerken. Elke tekst heeft in de code
een standaardwaarde (`blockText(blocks, "sleutel", "standaardtekst")`). Voeg je een nieuwe
bewerkbare tekst toe, zet hem dan ook in `content-manifest.json` en draai
`npm run check:manifest`.

## Achtergrond

`CRD_loopless_website.md` is de oorspronkelijke briefing (donker thema, pure HTML). De site
is sindsdien omgezet naar Next.js en een licht thema. Deze README beschrijft de huidige
stand.
