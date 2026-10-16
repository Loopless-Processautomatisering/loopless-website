import Image from "next/image";
import { AnimateIn } from "@/components/ui/animate-in";
import { alineas, fotoUrl, tekstVeld, type SectieProps } from "./schema";

// De opmaak van de intro van `/over` zoals hij was (over/huidige-pagina.tsx). De kop "Wessel
// Broeders" is code. Zonder foto in de inhoud de foto uit de repo, zoals de oude terugval.
export function Intro({ inhoud }: SectieProps) {
  const [eerste, ...rest] = alineas(tekstVeld(inhoud, "tekst"));
  const kicker = tekstVeld(inhoud, "kicker");
  return (
    <section className="relative pt-40 pb-24 md:pb-32">
      <div className="mx-auto max-w-[1000px] px-6">
        <div className="flex flex-col gap-12 md:flex-row md:items-start">
          <AnimateIn className="flex-shrink-0 self-center md:self-start">
            <div className="relative h-[280px] w-[280px] overflow-hidden rounded-2xl border border-[#DCE6F5] transition-all duration-500 hover:border-[#4F8EF7]/30 hover:shadow-[0_8px_30px_-12px_rgba(79,142,247,0.2)]">
              <Image
                src={fotoUrl(inhoud, "foto") ?? "/wessel.jpg"}
                alt={tekstVeld(inhoud, "foto_alt") || "Wessel Broeders"}
                fill
                className="object-cover object-top transition-transform duration-500 hover:scale-[1.03]"
                sizes="280px"
              />
            </div>
          </AnimateIn>

          <AnimateIn delay={0.15}>
            <div>
              {kicker && <p className="mb-3 text-sm font-medium uppercase tracking-wider text-[#4F8EF7]">{kicker}</p>}
              <h1 className="mb-6 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B] md:text-5xl">
                Wessel Broeders
              </h1>
              {eerste && <p className="mb-4 text-lg leading-relaxed text-[#2B3446]">{eerste}</p>}
              {rest.map((a, i) => (
                <p key={i} className="text-[#5F6B85] leading-relaxed">{a}</p>
              ))}
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
