import { type NextRequest } from "next/server";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

// Zet draft-mode uit en stuurt terug naar de pagina waar de klant stond (published-laag).
//
// Vóór 29-03 ging dit hard naar "/": wie de preview op /tarieven verliet, belandde op de
// homepage en moest zelf terugnavigeren om te zien wat er gepubliceerd was.
// Checkpoint-besluit 29-02: de slug meegeven.
//
// WAAROM DE REFERER en niet een query-param of usePathname: de banner is een async
// server-component in een layout en kent het huidige pad niet (layouts krijgen geen
// pathname). Een client-component met usePathname zou werken, maar maakt van een nul-JS
// server-component gehydrateerde client-code plus een server-wrapper voor draftMode() —
// twee extra bestanden die in drie repo's byte-identiek gehouden moeten worden, voor één
// redirect. De klik op "Preview verlaten" is een same-origin navigatie, dus onder de
// browser-default (strict-origin-when-cross-origin) gaat de volledige Referer mee.
// Ontbreekt of faalt hij, dan is de fallback "/" — exact het oude gedrag, dus nooit
// slechter dan vóór deze wijziging.
export async function GET(request: NextRequest) {
  const referer = request.headers.get("referer");
  let target = "/";

  if (referer) {
    try {
      const url = new URL(referer);
      // Same-origin-check tegen de Host-header, niet tegen new URL(request.url).origin:
      // achter de Vercel-proxy hoeft die laatste niet het publieke domein te zijn, en dan
      // zou de check stil altijd falen — de feature werkt dan nergens en dat is visueel
      // niet te onderscheiden van "de Referer kwam niet mee".
      //
      // Dat de Host-header spoofbaar is, is hier geen gat: de guard hieronder laat alleen
      // een PAD door (enkele leidende slash), nooit een absolute URL. redirect() met een
      // pad blijft per definitie op het eigen origin. De origin-check is dus alleen
      // hygiëne — de echte grens is de padcontrole.
      const host = request.headers.get("host");
      if (host && url.host === host) {
        const path = url.pathname + url.search;
        // Zelfde open-redirect-guard als enable/route.ts: weert //evil.com en
        // /\evil.com (sommige browsers normaliseren \ naar /). Niet overbodig naast de
        // origin-check: https://<eigen-host>//evil.com parset naar pathname "//evil.com",
        // en dat is protocol-relatief zodra je het aan redirect() geeft.
        if (
          path.startsWith("/") &&
          !path.startsWith("//") &&
          !path.startsWith("/\\")
        ) {
          target = path;
        }
      }
    } catch {
      // Onparsebare Referer → fallback "/".
    }
  }

  (await draftMode()).disable();
  redirect(target);
}
