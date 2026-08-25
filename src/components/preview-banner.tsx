import { draftMode } from "next/headers";

// Preview-/voorbeeldmodus-banner voor de publieke site. Async server-component die
// ZELF draftMode() leest (request-API → MOET buiten elke 'use cache'-scope blijven;
// Next 16 pitfall, zie src/lib/supabase/content.ts). Zo blijft de (site)-layout sync.
//
// Rendert niets in de published-laag → een gewone anonieme bezoeker (geen draft-cookie)
// ziet de banner NOOIT. In draft-mode toont 'm een vaste balk met een "Preview
// verlaten"-link naar /api/draft/disable, die de draft-cookie wist en terugstuurt naar
// de pagina waar de klant stond (ISS-006, slug-besluit 29-02).
//
// ── WAAROM EIGEN CSS EN GEEN TAILWIND-KLASSEN (gemeten 29-03) ────────────────────
// Deze banner is review-chrome: hij moet er op ELKE klantsite hetzelfde uitzien, en
// klantsites zijn maatwerk met eigen globals.css. Tailwind-utilities staan in
// `@layer utilities`, en ONGELAAGDE CSS wint altijd van gelaagde CSS — ongeacht
// specificiteit. Alles wat we in utilities zetten, kan een klantsite dus stilletjes
// overrulen. Bij Bushido gebeurde dat twee keer tegelijk:
//   - `a { color: inherit }` (globals.css) versloeg `text-amber-50` → de knop
//     "Preview verlaten" werd donkere tekst op een donkere knop. Gemeten: tekstkleur
//     identiek aan achtergrondkleur. De uitweg uit de preview was onleesbaar.
//   - `*, *::before, *::after { margin: 0; padding: 0 }` versloeg `px-4` en `px-3 py-1`
//     → de balk had geen binnenmarge meer en de knop liep tot de viewportrand.
// Daarom staat de volledige presentatie hieronder in één <style>-blok met #id-selectors:
// dat blok is zelf ongelaagd en specifieker dan `*`, `a` of een elementselector, dus het
// wint van dit soort resets. Voeg hier geen Tailwind-klassen aan toe — die zijn per
// definitie overrulebaar door de klantsite.
//
// ── STAPELING (ISS-034, gemeten 29-02) ───────────────────────────────────────────
// ONDERAAN gefixeerd, niet bovenaan: klantsites hebben vaak een eigen fixed header op
// z-50; een top-banner verliest die stapeling (later in de DOM wint) en wordt onklikbaar.
// Maar onderaan is er WEL een fixed element om mee te botsen — de aankondiging-modal van
// de engine zelf (.announce-overlay: position:fixed; inset:0; z-index:1000). Die lag over
// de banner heen, en omdat de overlay-div een onClick={close} heeft, sloot een klik op
// "Preview verlaten" de pop-up in plaats van de preview te verlaten. De afspraak is
// daarom: de banner staat boven ALLES van de site zelf, inclusief de eigen modals —
// vandaar z-index 1100. Wie een nieuw overlay-element toevoegt, blijft daaronder.
//
// ── ONDERRUIMTE (ISS-032, gemeten 29-01) ─────────────────────────────────────────
// Een fixed balk zonder compenserende ruimte dekt de onderkant van de pagina af — op
// loopless.nl/375px precies de tweede hero-CTA, juist in het scherm waar de klant
// beoordeelt of de site klopt. Opgelost met `body { padding-bottom }` in hetzelfde
// style-blok, dat alleen in de draft-tak rendert en dus per constructie niet naar de
// published-laag lekt. Het moet CSS zijn en geen spacer-div: de banner wordt per
// klantsite op een andere plek gemount (loopless in (site)/layout.tsx, bushido in de
// root-layout), dus een spacer kan bóven de content belanden. De hoogte is daarom VAST
// (2.75rem) en gelijk aan de gereserveerde ruimte, niet impliciet uit de tekstlengte.
// De uitleg-zin verdwijnt onder 640px omdat hij daar naar drie regels brak (gemeten box
// 60px); mobiel houdt "Voorbeeldmodus" plus de knop over, wat op één regel past.
//
// Dependency-vrij en zonder repo-specifieke imports → engine byte-identiek
// template↔loopless↔bushido (conventie 11-01). Wijzig dit bestand nooit in één repo, en
// vergelijk met `git rev-parse HEAD:<pad>` (de blob-hash), niet met een bestandsdiff —
// core.autocrlf maakt op Windows verschil dat er niet is.
const CSS = `
body { padding-bottom: 2.75rem; }
#su-preview-banner {
  position: fixed; bottom: 0; left: 0; right: 0; z-index: 1100;
  box-sizing: border-box;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  min-height: 2.75rem; padding: 0.5rem 1rem;
  background: #fbbf24; color: #451a03;
  font-size: 0.875rem; line-height: 1.25rem;
  box-shadow: 0 -2px 6px rgb(0 0 0 / 0.15);
}
#su-preview-banner .su-pb-label { font-weight: 500; }
#su-preview-banner .su-pb-detail { display: none; }
@media (min-width: 640px) { #su-preview-banner .su-pb-detail { display: inline; } }
#su-preview-banner a {
  flex-shrink: 0; box-sizing: border-box;
  padding: 0.25rem 0.75rem; border-radius: 0.375rem;
  background: #451a03; color: #fffbeb;
  font-weight: 600; text-decoration: none;
}
#su-preview-banner a:hover { background: #78350f; }
`;

export async function PreviewBanner() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <>
      <style>{CSS}</style>
      <div id="su-preview-banner" role="status">
        <span className="su-pb-label">
          Voorbeeldmodus
          <span className="su-pb-detail">
            {" "}
            — je bekijkt niet-gepubliceerde wijzigingen.
          </span>
        </span>
        <a href="/api/draft/disable">Preview verlaten</a>
      </div>
    </>
  );
}
