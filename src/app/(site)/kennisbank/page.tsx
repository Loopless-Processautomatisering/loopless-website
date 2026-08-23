import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow } from "@/components/page-glow";
import { artikel } from "./automatisering-mkb/artikel-data";

export const metadata: Metadata = {
  title: "Kennisbank: uitleg over automatiseren in het MKB",
  description:
    "Praktische uitleg over automatiseren in het MKB: welk werk je als eerste aanpakt, hoe je het aanpakt en wat het oplevert.",
  alternates: { canonical: "/kennisbank" },
  openGraph: {
    title: "Kennisbank: uitleg over automatiseren in het MKB",
    description:
      "Praktische uitleg over automatiseren in het MKB: welk werk je als eerste aanpakt, hoe je het aanpakt en wat het oplevert.",
  },
};

const artikelen = [
  {
    href: `/kennisbank/${artikel.slug}`,
    titel: artikel.titel,
    omschrijving: artikel.omschrijving,
    leestijd: artikel.leestijd,
  },
];

export default function KennisbankPage() {
  return (
    <>
      <PageGlow />

      <section className="relative pb-16 pt-40">
        <div className="mx-auto max-w-[900px] px-6">
          <AnimateIn>
            <h1 className="font-[family-name:var(--font-heading)] text-5xl font-bold text-white md:text-6xl">
              Kennisbank
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="mt-4 max-w-[600px] text-xl text-[#8585A3]">
              Uitleg zonder verkooppraat, voor wie zelf wil bepalen of automatiseren bij hem past.
            </p>
          </AnimateIn>
        </div>
      </section>

      <section className="relative pb-32">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="flex flex-col gap-4">
            {artikelen.map((a, i) => (
              <AnimateIn key={a.href} delay={0.1 + i * 0.05}>
                <Link
                  href={a.href}
                  className="group block rounded-xl border border-[#2E2E4A] bg-[#1E1E30] p-8 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4F8EF7]/40 hover:shadow-[0_8px_24px_-12px_rgba(79,142,247,0.3)]"
                >
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold leading-snug text-white">
                    {a.titel}
                  </h2>
                  <p className="mt-4 max-w-[640px] leading-relaxed text-[#8585A3]">
                    {a.omschrijving}
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#4F8EF7]">
                    Lezen, ongeveer {a.leestijd}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
