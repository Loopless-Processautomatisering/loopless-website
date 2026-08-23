import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow, SectionDivider } from "@/components/page-glow";
import { artikel, secties, cases, naCases, vragen } from "./artikel-data";

export const metadata: Metadata = {
  title: artikel.metaTitel,
  description: artikel.omschrijving,
  alternates: { canonical: `/kennisbank/${artikel.slug}` },
  openGraph: {
    type: "article",
    title: artikel.metaTitel,
    description: artikel.omschrijving,
    publishedTime: artikel.gepubliceerd,
    modifiedTime: artikel.gewijzigd,
  },
  twitter: {
    card: "summary_large_image",
    title: artikel.metaTitel,
    description: artikel.omschrijving,
  },
};

const artikelJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: artikel.titel,
  description: artikel.omschrijving,
  datePublished: artikel.gepubliceerd,
  dateModified: artikel.gewijzigd,
  inLanguage: "nl-NL",
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `https://loopless.nl/kennisbank/${artikel.slug}`,
  },
  author: { "@type": "Person", name: "Wessel Broeders" },
  publisher: {
    "@type": "Organization",
    name: "Loopless",
    url: "https://loopless.nl",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: vragen.map((v) => ({
    "@type": "Question",
    name: v.vraag,
    acceptedAnswer: { "@type": "Answer", text: v.antwoord },
  })),
};

const broodkruimelJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://loopless.nl" },
    { "@type": "ListItem", position: 2, name: "Kennisbank", item: "https://loopless.nl/kennisbank" },
    {
      "@type": "ListItem",
      position: 3,
      name: artikel.metaTitel,
      item: `https://loopless.nl/kennisbank/${artikel.slug}`,
    },
  ],
};

/** Secties met eigen opmaak, die renderen we los tussen de lopende tekst door. */
const PRAKTIJK_ID = "praktijk";

export default function AutomatiseringMkbPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(artikelJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(broodkruimelJsonLd) }}
      />
      <PageGlow />

      {/* Kop */}
      <section className="relative pb-4 pt-40">
        <div className="mx-auto max-w-[760px] px-6">
          <AnimateIn>
            <nav
              aria-label="Kruimelpad"
              className="mb-6 flex items-center gap-2 text-sm text-[#8585A3]"
            >
              <Link href="/kennisbank" className="transition-colors hover:text-[#4F8EF7]">
                Kennisbank
              </Link>
            </nav>
          </AnimateIn>
          <AnimateIn delay={0.05}>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.1] text-white md:text-5xl">
              {artikel.titel}
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="mt-6 text-xl leading-relaxed text-[#B4B4C8]">{artikel.lead}</p>
          </AnimateIn>
          <AnimateIn delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3 border-b border-[#2E2E4A] pb-8 text-sm text-[#8585A3]">
              <span className="rounded-full border border-[#2E2E4A] bg-[#1E1E30] px-3 py-1">
                Kennisbank
              </span>
              <span>Leestijd ongeveer {artikel.leestijd}</span>
            </div>
          </AnimateIn>

          {/* In dit artikel */}
          <AnimateIn delay={0.2}>
            <nav
              aria-label="In dit artikel"
              className="mt-10 rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-6"
            >
              <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.09em] text-[#8585A3]">
                In dit artikel
              </h2>
              <ol className="flex flex-col gap-2">
                {secties.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="flex gap-3 text-[15px] text-[#EDEDF4] transition-colors hover:text-[#4F8EF7]"
                    >
                      <span className="tabular-nums text-[#8585A3]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.kop}
                    </a>
                  </li>
                ))}
                <li>
                  <a
                    href="#vragen"
                    className="flex gap-3 text-[15px] text-[#EDEDF4] transition-colors hover:text-[#4F8EF7]"
                  >
                    <span className="tabular-nums text-[#8585A3]">
                      {String(secties.length + 1).padStart(2, "0")}
                    </span>
                    Veelgestelde vragen
                  </a>
                </li>
              </ol>
            </nav>
          </AnimateIn>
        </div>
      </section>

      {/* Artikel */}
      <section className="relative pb-20 pt-4">
        <div className="mx-auto max-w-[760px] px-6">
          <article>
            {secties.map((sectie) => (
              <div key={sectie.id}>
                <h2
                  id={sectie.id}
                  className="mt-14 scroll-mt-28 font-[family-name:var(--font-heading)] text-2xl font-bold leading-snug text-white md:text-[1.75rem]"
                >
                  {sectie.kop}
                </h2>

                {sectie.alineas.map((alinea, i) => (
                  <p key={i} className="mt-5 text-[17px] leading-[1.75] text-[#B4B4C8]">
                    {alinea.vet && (
                      <strong className="font-semibold text-white">{alinea.vet} </strong>
                    )}
                    {alinea.tekst}
                  </p>
                ))}

                {sectie.id === PRAKTIJK_ID && (
                  <>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                      {cases.map((c) => (
                        <div
                          key={c.naam}
                          className="rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-6"
                          style={{ borderLeft: `2px solid ${c.accent}` }}
                        >
                          <h3 className="font-[family-name:var(--font-heading)] text-[15px] font-bold text-white">
                            {c.naam}
                          </h3>
                          <p className="mt-4 text-[15px] leading-relaxed text-[#B4B4C8]">
                            <span className="mb-1 block text-[11px] uppercase tracking-[0.09em] text-[#8585A3]">
                              Ervoor
                            </span>
                            {c.ervoor}
                          </p>
                          <p className="mt-4 text-[15px] leading-relaxed text-[#B4B4C8]">
                            <span className="mb-1 block text-[11px] uppercase tracking-[0.09em] text-[#8585A3]">
                              Erna
                            </span>
                            {c.erna}
                          </p>
                        </div>
                      ))}
                    </div>
                    {naCases.map((tekst, i) => (
                      <p key={i} className="mt-5 text-[17px] leading-[1.75] text-[#B4B4C8]">
                        {tekst}
                      </p>
                    ))}
                    <Link
                      href="/cases"
                      className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#4F8EF7] transition-colors hover:text-[#7EAEFA]"
                    >
                      Bekijk beide cases uitgebreider
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </>
                )}
              </div>
            ))}

            {/* Veelgestelde vragen */}
            <h2
              id="vragen"
              className="mt-14 scroll-mt-28 font-[family-name:var(--font-heading)] text-2xl font-bold leading-snug text-white md:text-[1.75rem]"
            >
              Veelgestelde vragen
            </h2>
            <div className="mt-2">
              {vragen.map((v) => (
                <div key={v.vraag} className="mt-7 border-t border-[#2E2E4A] pt-7">
                  <h3 className="font-[family-name:var(--font-heading)] text-[17px] font-bold text-white">
                    {v.vraag}
                  </h3>
                  <p className="mt-3 text-[17px] leading-[1.75] text-[#B4B4C8]">{v.antwoord}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <SectionDivider />

      {/* Afsluiting */}
      <section className="relative py-20">
        <div className="mx-auto max-w-[760px] px-6">
          <AnimateIn>
            <div className="rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-8">
              <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
                Welk uitzoekwerk zit er bij jou?
              </h2>
              <p className="mt-4 text-[17px] leading-relaxed text-[#B4B4C8]">
                Weet je al waar het bij jou blijft hangen, plan dan een gesprek. Weet je het nog
                niet precies, doe dan eerst de zelfscan. Die loopt langs de plekken waar dit werk
                zich meestal ophoopt en geeft aan waar bij jou de meeste tijd in gaat zitten.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#4F8EF7] px-6 py-3 text-sm font-semibold text-[#0d0d18] transition-all duration-300 hover:bg-[#3A75D8]"
                >
                  Plan een gesprek
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/configurator"
                  className="inline-flex items-center gap-2 rounded-full border border-[#2E2E4A] px-6 py-3 text-sm font-semibold text-[#EDEDF4] transition-all duration-300 hover:border-[#4F8EF7]/40 hover:text-[#4F8EF7]"
                >
                  Doe de zelfscan
                </Link>
              </div>
            </div>
          </AnimateIn>

          <Link
            href="/kennisbank"
            className="group mt-10 inline-flex items-center gap-2 text-sm font-semibold text-[#8585A3] transition-colors hover:text-[#4F8EF7]"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            Terug naar de kennisbank
          </Link>
        </div>
      </section>
    </>
  );
}
