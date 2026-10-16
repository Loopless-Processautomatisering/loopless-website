import Image from "next/image";
import { AnimateIn } from "@/components/ui/animate-in";
import { alineas, tekstVeld, type SectieProps } from "./schema";

// "Hoe dat uitpakt" van `/over`. De logo's, links en labels zijn code; de teksten zijn velden.
export function Resultaat({ inhoud, index }: SectieProps) {
  const kop = tekstVeld(inhoud, "kop");
  return (
    <section className={`${index % 2 === 1 ? "bg-[#F3F7FD] " : ""}py-24 md:py-32`}>
      <div className="mx-auto max-w-[700px] px-6">
        <AnimateIn>
          {kop && <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">{kop}</h2>}
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
            {alineas(tekstVeld(inhoud, "tekst")).map((a, i) => (
              <p key={i} className="text-[#2B3446] leading-relaxed">{a}</p>
            ))}
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
            {alineas(tekstVeld(inhoud, "tekst_2")).map((a, i) => (
              <p key={i} className="text-[#2B3446] leading-relaxed">{a}</p>
            ))}
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
