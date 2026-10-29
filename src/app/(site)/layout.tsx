import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PreviewBanner } from "@/components/preview-banner";
import { HerkomstOnthouden } from "@/components/herkomst-onthouden";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* PreviewBanner leest draftMode() (request-API) → dynamisch. Met cacheComponents
          moet die dynamische read in een Suspense-grens staan zodat de statische shell
          (navbar/footer) prerenderbaar blijft; fallback=null want in de published-laag
          rendert de banner toch niets. De banner is position:sticky: in preview-modus
          duwt 'ie de navbar omlaag (navbar blijft klikbaar) én blijft zichtbaar bij
          scrollen; in de published-laag neemt 'ie geen ruimte in. Preview is een interne
          review-modus, geen published view. */}
      <Suspense fallback={null}>
        <PreviewBanner />
      </Suspense>
      <HerkomstOnthouden />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
