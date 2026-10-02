import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/ui/animate-in";
import { PageGlow, SectionDivider } from "@/components/page-glow";

export const metadata: Metadata = {
  title: "Cases — het uitzoekwerk ging eraf",
  description:
    "Twee bedrijven waar het uitzoekwerk eraf ging: leads die 's ochtends klaarstaan, en een besteladvies dat met één knop klaarstaat. De mensen beslissen nog steeds zelf.",
  alternates: { canonical: "/cases" },
  openGraph: {
    title: "Cases — het uitzoekwerk ging eraf",
    description:
      "Twee bedrijven waar het uitzoekwerk eraf ging: leads die 's ochtends klaarstaan, en een besteladvies dat met één knop klaarstaat.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cases — het uitzoekwerk ging eraf",
    description:
      "Twee bedrijven waar het uitzoekwerk eraf ging: leads die 's ochtends klaarstaan, en een besteladvies dat met één knop klaarstaat.",
  },
};

const cases = [
  {
    naam: "vuljevacature.nl",
    logo: "/clients/vuljevacature.png",
    site: "https://vuljevacature.nl",
    lichtVlak: false,
    chip: "Recruitment",
    ervoor:
      "Het team deed het voorwerk zelf: bedrijven opzoeken, beoordelen of er iets te halen viel, gegevens overtypen. Werk dat af moest zijn voordat er überhaupt iemand gebeld kon worden.",
    erna:
      "Elke ochtend staat de lijst klaar met wie de moeite waard is. Het team begint de dag met bellen in plaats van met zoeken. Wie er benaderd wordt, bepalen ze nog steeds zelf.",
    punten: [
      "Elke ochtend staat de lijst klaar",
      "Het systeem draait door, ook als er niemand kijkt",
      "Het team bepaalt zelf wie er gebeld wordt",
    ],
  },
  {
    naam: "Drabor",
    logo: "/clients/drabor.png",
    site: "https://www.drabor.nl",
    lichtVlak: true,
    chip: "Groothandel",
    ervoor:
      "De inkopers liepen hun lijst artikel voor artikel na: voorraad checken, verbruik van eerdere periodes erbij pakken, inschatten wat er besteld moest worden. Uitzoekwerk dat elke keer terugkwam.",
    erna:
      "Met één knop staat het besteladvies klaar: wat urgent is, wat er in voorraad ligt, wat eruit gaat. De inkopers kijken het na, passen aan waar ze het beter weten, en bestellen. Ze kopen weer in in plaats van uit te zoeken.",
    punten: [
      "Besteladvies staat klaar met één knop",
      "Het systeem stelt voor, de inkopers beslissen",
      "De cijfers komen uit hun eigen systeem, niet uit een schatting",
    ],
  },
];

export default function CasesPage() {
  return (
    <>
      <PageGlow />
      {/* Hero */}
      <section className="relative pb-12 pt-40">
        <div className="mx-auto max-w-[1000px] px-6">
          <AnimateIn>
            <h1 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B] md:text-5xl">
              Het uitzoekwerk ging eraf. Dit bleef over.
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="max-w-[560px] text-lg text-[#5F6B85]">
              Twee bedrijven, twee soorten uitzoekwerk. In beide gevallen
              beslist er nog steeds een mens.
            </p>
          </AnimateIn>
        </div>
      </section>

      {cases.map((c, index) => (
        <section key={c.naam} className={index === 0 ? "py-16 md:py-24" : "pb-16 md:pb-24"}>
          <div className="mx-auto max-w-[1000px] px-6">
            {/* Case header */}
            <AnimateIn>
              <div className="mb-12 flex items-center gap-4">
                {c.logo && c.site ? (
                  <a
                    href={c.site}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={
                      c.lichtVlak
                        ? // Donkerblauw woordmerk op transparant — licht vlak eronder, anders onzichtbaar
                          "inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 opacity-90 transition-opacity hover:opacity-100"
                        : "opacity-70 transition-opacity hover:opacity-100"
                    }
                  >
                    <Image src={c.logo} alt={c.naam} width={120} height={30} className={c.lichtVlak ? "h-6 w-auto" : "h-7 w-auto"} />
                  </a>
                ) : (
                  <strong className="text-2xl text-[#10182B] font-[family-name:var(--font-heading)]">
                    {c.naam}
                  </strong>
                )}
                <span className="rounded-full border border-[#4F8EF7]/20 bg-[#4F8EF7]/10 px-4 py-1 text-xs font-medium text-[#4F8EF7]">
                  {c.chip}
                </span>
              </div>
            </AnimateIn>

            {/* Voor / Na grid */}
            <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.15}>
              <StaggerItem>
                <div className="h-full rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8 transition-all duration-300 hover:border-[#B7CBEE]">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#5F6B85]">Ervoor</p>
                  <p className="text-[#2B3446] leading-relaxed">{c.ervoor}</p>
                </div>
              </StaggerItem>

              <StaggerItem>
                <div className="h-full rounded-xl border border-[#4F8EF7]/20 bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8 transition-all duration-300 hover:border-[#4F8EF7]/40">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#4F8EF7]">Erna</p>
                  <p className="text-[#2B3446] leading-relaxed">{c.erna}</p>
                </div>
              </StaggerItem>
            </StaggerContainer>

            {/* Wat het opleverde */}
            <AnimateIn delay={0.1}>
              <div className="mt-8 flex flex-wrap gap-8">
                {c.punten.map((punt) => (
                  <div key={punt} className="flex items-center gap-2 text-[#2B3446]">
                    <span className="font-bold text-[#4F8EF7]">✓</span> {punt}
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>
      ))}

      <SectionDivider />

      {/* CTA */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[700px] px-6">
          <AnimateIn>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">
              Welk uitzoekwerk zit er bij jou?
            </h2>
            <p className="mb-8 text-lg text-[#5F6B85]">
              Weet je al waar het bij jou blijft hangen, plan dan een gesprek.
              Weet je het nog niet precies, kijk dan eerst wat er bij jou kan.
            </p>
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
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
