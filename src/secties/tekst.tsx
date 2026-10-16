import { AnimateIn } from "@/components/ui/animate-in";
import { alineas, tekstVeld, type SectieProps } from "./schema";

// "Waarom" en "In de praktijk" van `/over`. De achtergrond wisselt met de plek op de pagina,
// zoals de pagina was: de tweede, vierde, ... sectie licht blauw.
export function Tekst({ inhoud, index }: SectieProps) {
  const kop = tekstVeld(inhoud, "kop");
  const [eerste, ...rest] = alineas(tekstVeld(inhoud, "tekst"));
  return (
    <section className={`${index % 2 === 1 ? "bg-[#F3F7FD] " : ""}py-24 md:py-32`}>
      <div className="mx-auto max-w-[700px] px-6">
        <AnimateIn>
          {kop && <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">{kop}</h2>}
          <div className="space-y-4 text-[#2B3446] leading-relaxed">
            {eerste && <p>{eerste}</p>}
            {rest.map((a, i) => (
              <p key={i} className="text-[#5F6B85]">{a}</p>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
