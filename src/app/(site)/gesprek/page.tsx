import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FileText, ShieldCheck } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow } from "@/components/page-glow";
import { verifieer } from "@/lib/gesprek/code";
import { GesprekFormulier } from "./gesprek-formulier";
import { GesprekStaat, VoorVersturen } from "./gesprek-staat";

// Landingspagina voor de knop in de koude mail: /gesprek?c=<code>. De code is
// ondertekend (src/lib/gesprek/code.ts) en draagt voornaam en bedrijf, zodat het
// formulier die al kent. Bewust noindex en niet in de sitemap: de pagina heeft
// alleen zin met een persoonlijke link.
export const metadata: Metadata = {
  title: "Een half uur over het uitzoekwerk",
  robots: { index: false, follow: false },
};

const feiten = [
  { icon: Clock, tekst: "Een half uur" },
  { icon: ShieldCheck, tekst: "Kost niets en is vrijblijvend" },
  { icon: FileText, tekst: "Daarna een plan op één pagina, van jullie" },
];

type Props = { searchParams: Promise<{ c?: string | string[] }> };

export default function GesprekPage({ searchParams }: Props) {
  return (
    <>
      <PageGlow />
      {/* searchParams is een request-API: met cacheComponents hoort die read in
          een Suspense-grens, zodat navbar en footer prerenderbaar blijven. */}
      <Suspense fallback={null}>
        <Inhoud searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Inhoud({ searchParams }: Props) {
  const { c } = await searchParams;
  const code = typeof c === "string" ? c : null;
  const lead = verifieer(code);

  // De intro in de hero verdwijnt na versturen; GesprekStaat deelt dat met het
  // formulier. De controle van de code hierboven blijft op de server.
  return (
    <GesprekStaat>
      {/* Hero, links uitgelijnd */}
      <section className={`relative pt-40 ${lead ? "pb-12" : "pb-24 md:pb-32"}`}>
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn>
            <h1 className="mb-4 max-w-[900px] break-words font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B] md:text-5xl">
              Een half uur over het uitzoekwerk bij {lead ? lead.bedrijf : "jullie"}
            </h1>
          </AnimateIn>
          {lead ? (
            <>
              <VoorVersturen>
                <AnimateIn delay={0.1}>
                  <p className="max-w-[600px] text-lg text-[#5F6B85]">
                    {lead.voornaam && `Hoi ${lead.voornaam}. `}Vink aan waar je nieuwsgierig naar
                    bent, waar ik je kan bereiken en wanneer het je uitkomt. Ik neem daarna
                    contact op om een tijdstip af te spreken.
                  </p>
                </AnimateIn>
              </VoorVersturen>
              <AnimateIn delay={0.2}>
                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-[#5F6B85]">
                  {feiten.map(({ icon: Icon, tekst }) => (
                    <div key={tekst} className="flex items-center gap-2">
                      <Icon className="h-4 w-4 flex-shrink-0 text-[#4F8EF7]" />
                      <span>{tekst}</span>
                    </div>
                  ))}
                </div>
              </AnimateIn>
            </>
          ) : (
            <AnimateIn delay={0.1}>
              <p className="max-w-[600px] text-lg text-[#5F6B85]">
                Deze link werkt niet. Heb je mijn mail gekregen? Antwoord er dan gewoon op. Of
                mail me op{" "}
                <Link
                  href="/contact"
                  className="font-medium text-[#4F8EF7] transition-colors hover:text-[#3A75D8]"
                >
                  wessel@loopless.nl
                </Link>
                .
              </p>
            </AnimateIn>
          )}
        </div>
      </section>

      {lead && code && (
        <section className="pb-24 md:pb-32">
          <div className="mx-auto max-w-[1200px] px-6">
            <GesprekFormulier code={code} voornaam={lead.voornaam} bedrijf={lead.bedrijf} />
          </div>
        </section>
      )}
    </GesprekStaat>
  );
}
