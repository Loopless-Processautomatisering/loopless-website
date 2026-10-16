import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import { SectionDivider } from "@/components/page-glow";
import { alineas, tekstVeld, type SectieProps } from "./schema";

// De afsluiter van `/over`, met de scheidingslijn erboven zoals de pagina was. De drie knoppen
// zijn code.
export function Oproep({ inhoud, index }: SectieProps) {
  const kop = tekstVeld(inhoud, "kop");
  return (
    <>
      <SectionDivider />
      <section className={`${index % 2 === 1 ? "bg-[#F3F7FD] " : ""}py-24 md:py-32`}>
        <div className="mx-auto max-w-[700px] px-6">
          <AnimateIn>
            {kop && <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">{kop}</h2>}
            {alineas(tekstVeld(inhoud, "tekst")).map((a, i) => (
              <p key={i} className="mb-8 text-lg text-[#5F6B85]">{a}</p>
            ))}
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
