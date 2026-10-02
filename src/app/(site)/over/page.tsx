import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow, SectionDivider } from "@/components/page-glow";
import { ArrowRight } from "lucide-react";
import { getBlocksByPage, blockText, blockImage } from "@/lib/supabase/content";

export const metadata: Metadata = {
  title: "Over Loopless — Wessel Broeders, oprichter",
  description:
    "Wessel Broeders, oprichter van Loopless. Ik bouw systemen die het uitzoekwerk doen, zodat jouw mensen weer het werk doen waarvoor je ze hebt aangenomen.",
  alternates: { canonical: "/over" },
  openGraph: {
    title: "Over Loopless — Wessel Broeders, oprichter",
    description:
      "Wessel Broeders, oprichter van Loopless. Ik bouw systemen die het uitzoekwerk doen, zodat jouw mensen weer het werk doen waarvoor je ze hebt aangenomen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Over Loopless — Wessel Broeders, oprichter",
    description:
      "Wessel Broeders, oprichter van Loopless. Ik bouw systemen die het uitzoekwerk doen, zodat jouw mensen weer het werk doen waarvoor je ze hebt aangenomen.",
  },
};

export default async function OverPage() {
  const blocks = await getBlocksByPage("over");

  const kicker = blockText(blocks, "over_intro_kicker", "Oprichter Loopless");
  const introP1 = blockText(blocks, "over_intro_p1", "Je bent geen bedrijf begonnen om de hele dag uit te zoeken en mail door te spitten. En je hebt je mensen niet aangenomen om dat voor je te doen.");
  const introP2 = blockText(blocks, "over_intro_p2", "Toch gaat het zo bij veel bedrijven. De inkoper is de halve week databeheerder, de binnendienst verzuipt in mail en Excel. Ik bouw de systemen die dat werk overnemen.");
  const photoUrl = blockImage(blocks, "over_photo", "/wessel.jpg");
  const waaromHeading = blockText(blocks, "over_waarom_heading", "Waarom ik bij het werk begin, niet bij de techniek");
  const waaromP1 = blockText(blocks, "over_waarom_p1", "Tijdens mijn studie Bedrijfskunde aan Avans Breda leerde ik een bedrijf uit elkaar halen: waar loopt het vast, welke stap kost tijd en levert niets op. Daarnaast leerde ik bouwen. Niet als hobby, maar om die stappen er ook echt uit te kunnen halen.");
  const waaromP2 = blockText(blocks, "over_waarom_p2", "Daardoor begint het bij mij nooit bij een tool. Het begint bij de vraag welk werk jouw mensen doen waarvoor ze niet zijn aangenomen. Wat daaruit komt, bouw ik zelf.");
  const praktijkP1 = blockText(blocks, "over_praktijk_p1", "Sommige bedrijven komen met een concreet idee: dit stuk werk moet eraf. Anderen weten alleen dat er tijd verdwijnt, maar niet precies waar. Beide zijn een goed startpunt, want je mensen weten het meestal wel.");
  const praktijkP2 = blockText(blocks, "over_praktijk_p2", "We kijken samen waar het uitzoekwerk zit en ik bouw daar een systeem omheen. Het systeem zet klaar, jouw mensen controleren en beslissen. Niemand wordt vervangen: dat is geen geruststelling achteraf, zo bouw ik het.");
  const resultaatHeading = blockText(blocks, "over_resultaat_heading", "Hoe dat uitpakt");
  const resultaatText = blockText(blocks, "over_resultaat_text", "Bij vuljevacature.nl deed het team het voorwerk zelf: leads zoeken, screenen, gegevens overtypen. Nu staat die lijst er 's ochtends al. Ze beginnen de dag met bellen in plaats van met zoeken, en bepalen zelf wie ze benaderen.");
  const resultaatDraborText = blockText(blocks, "over_resultaat_drabor_text", "Bij Drabor liepen de inkopers hun voorraadlijst artikel voor artikel na. Nu vragen ze met één knop het inkooprapport op, kijken het na, passen aan waar ze het beter weten, en bestellen. Ze kopen weer in in plaats van uit te zoeken.");
  const ctaHeading = blockText(blocks, "over_cta_heading", "Benieuwd welk werk bij jou eraf kan?");
  const ctaText = blockText(blocks, "over_cta_text", "Weet je waar het blijft hangen, plan dan een gesprek. Weet je het nog niet, kijk dan eerst wat er bij jou kan.");

  return (
    <>
      <PageGlow />
      {/* Intro */}
      <section className="relative pt-40 pb-24 md:pb-32">
        <div className="mx-auto max-w-[1000px] px-6">
          <div className="flex flex-col gap-12 md:flex-row md:items-start">
            <AnimateIn className="flex-shrink-0 self-center md:self-start">
              <div className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl border border-[#DCE6F5] transition-all duration-500 hover:border-[#4F8EF7]/30 hover:shadow-[0_8px_30px_-12px_rgba(79,142,247,0.2)]">
                <Image
                  src={photoUrl}
                  alt="Wessel Broeders"
                  fill
                  className="object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                  sizes="280px"
                />
              </div>
            </AnimateIn>

            <AnimateIn delay={0.15}>
              <div>
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#4F8EF7]">{kicker}</p>
                <h1 className="mb-6 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B] md:text-5xl">
                  Wessel Broeders
                </h1>
                <p className="mb-4 text-lg leading-relaxed text-[#2B3446]">{introP1}</p>
                <p className="text-[#5F6B85] leading-relaxed">{introP2}</p>
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Waarom dat werkt */}
      <section className="bg-[#F3F7FD] py-24 md:py-32">
        <div className="mx-auto max-w-[700px] px-6">
          <AnimateIn>
            <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">{waaromHeading}</h2>
            <div className="space-y-4 text-[#2B3446] leading-relaxed">
              <p>{waaromP1}</p>
              <p className="text-[#5F6B85]">{waaromP2}</p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Hoe dat er in de praktijk uitziet */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[700px] px-6">
          <AnimateIn>
            <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">Hoe dat er in de praktijk uitziet</h2>
            <div className="space-y-4 text-[#2B3446] leading-relaxed">
              <p>{praktijkP1}</p>
              <p className="text-[#5F6B85]">{praktijkP2}</p>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Bewezen resultaat */}
      <section className="bg-[#F3F7FD] py-24 md:py-32">
        <div className="mx-auto max-w-[700px] px-6">
          <AnimateIn>
            <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">{resultaatHeading}</h2>
            <div className="rounded-xl border border-[#DCE6F5] bg-[#FFFFFF] p-8">
              <div className="mb-4 flex items-center gap-4">
                <a href="https://vuljevacature.nl" target="_blank" rel="noopener noreferrer" className="opacity-70 transition-opacity hover:opacity-100">
                  <Image
                    src="/clients/vuljevacature.png"
                    alt="vuljevacature.nl"
                    width={120}
                    height={30}
                    className="h-7 w-auto"
                  />
                </a>
                <span className="rounded-full border border-[#4F8EF7]/20 bg-[#4F8EF7]/10 px-3 py-0.5 text-xs font-medium text-[#4F8EF7]">Recruitment</span>
              </div>
              <p className="text-[#2B3446] leading-relaxed">{resultaatText}</p>
            </div>
            <div className="mt-6 rounded-xl border border-[#DCE6F5] bg-[#FFFFFF] p-8">
              <div className="mb-4 flex items-center gap-4">
                {/* Donkerblauw woordmerk op transparant — licht vlak eronder, anders onzichtbaar */}
                <a
                  href="https://www.drabor.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 opacity-90 transition-opacity hover:opacity-100"
                >
                  <Image src="/clients/drabor.png" alt="Drabor" width={120} height={29} className="h-6 w-auto" />
                </a>
                <span className="rounded-full border border-[#4F8EF7]/20 bg-[#4F8EF7]/10 px-3 py-0.5 text-xs font-medium text-[#4F8EF7]">Groothandel</span>
              </div>
              <p className="text-[#2B3446] leading-relaxed">{resultaatDraborText}</p>
            </div>
          </AnimateIn>
        </div>
      </section>

      <SectionDivider />

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[700px] px-6">
          <AnimateIn>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">{ctaHeading}</h2>
            <p className="mb-8 text-lg text-[#5F6B85]">{ctaText}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/contact"
                className="inline-block rounded-full bg-[#4F8EF7] px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-[#3A75D8] hover:shadow-[0_8px_30px_-8px_rgba(79,142,247,0.3)]"
              >
                Plan een gesprek
              </Link>
              <Link
                href="/configurator"
                className="inline-block rounded-full border border-[#C9D8F0] px-8 py-4 font-semibold text-[#2B3446] transition-all duration-300 hover:border-[#4F8EF7]/40 hover:text-[#10182B]"
              >
                Kijk wat er bij jou kan
              </Link>
              <a
                href="https://www.linkedin.com/in/wessel-broeders-250767221/"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-sm font-medium text-[#4F8EF7] transition-colors hover:text-[#3A75D8]"
              >
                Bekijk mijn LinkedIn
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
