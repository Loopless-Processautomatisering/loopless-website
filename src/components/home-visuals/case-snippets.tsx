"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, FileBarChart, Sparkles } from "lucide-react";

// Kleine bewegende schermpjes bij de cases (oktober 2026): laten zien wat het systeem doet.
// Voorbeelddata, geen echte klantgegevens. Ze spelen af zodra ze in beeld komen en
// herhalen daarna rustig. prefers-reduced-motion: direct de eindstand.

const frame =
  "overflow-hidden rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_18px_40px_-22px_rgba(79,142,247,0.45)]";

function useCycle(steps: number, ms: number) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!inView || reduce) return;
    const id = setInterval(() => setStep((s) => (s + 1) % steps), ms);
    return () => clearInterval(id);
  }, [inView, reduce, steps, ms]);
  return { ref, step: reduce ? steps - 1 : step };
}

const LEADS = [
  { naam: "Installatiebedrijf, Culemborg", score: 92 },
  { naam: "Bouwbedrijf, Tiel", score: 88 },
  { naam: "Technisch bureau, Geldermalsen", score: 81 },
  { naam: "Elektrotechniek, Zaltbommel", score: 76 },
];

// vuljevacature: de lijst van vanochtend vult zich, rij voor rij
export function LeadListSnippet() {
  const { ref, step } = useCycle(LEADS.length + 2, 900);
  const shown = Math.min(step, LEADS.length);
  return (
    <div ref={ref} className={frame}>
      <div className="flex items-center justify-between border-b border-[#EEF3FB] px-4 py-2.5 text-[11px] text-[#5F6B85]">
        <span className="flex items-center gap-1.5 font-semibold text-[#1F2D52]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22B8CF] shadow-[0_0_8px_rgba(34,184,207,0.8)]" />
          Vanochtend klaargezet
        </span>
        <span>06:30</span>
      </div>
      <div className="flex min-h-[148px] flex-col gap-1.5 p-3">
        <AnimatePresence initial={false}>
          {LEADS.slice(0, shown).map((l) => (
            <motion.div
              key={l.naam}
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 rounded-lg bg-[#F6F9FE] px-3 py-1.5 text-xs text-[#2B3446]"
            >
              <span className="flex-1 truncate">{l.naam}</span>
              <span className="h-1.5 w-16 overflow-hidden rounded-full bg-[#E4ECF8]">
                <motion.span
                  className="block h-full rounded-full bg-[#4F8EF7]"
                  initial={{ width: 0 }}
                  animate={{ width: `${l.score}%` }}
                  transition={{ duration: 0.6, delay: 0.15 }}
                />
              </span>
              <span className="w-6 text-right tabular-nums text-[#5F6B85]">{l.score}</span>
              <Check className="h-3.5 w-3.5 text-[#22B8CF]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ADVIES = [
  { art: "Artikel 10-245", advies: "Bestel 240", urgent: true },
  { art: "Artikel 22-031", advies: "Bestel 60", urgent: false },
  { art: "Artikel 08-117", advies: "Ligt er", urgent: false },
];

// Drabor: één knop, dan staat het besteladvies klaar
export function OrderAdviceSnippet() {
  const { ref, step } = useCycle(5, 1100);
  const pressed = step >= 1;
  const rows = step >= 2 ? ADVIES : [];
  return (
    <div ref={ref} className={frame}>
      <div className="flex items-center justify-between border-b border-[#EEF3FB] px-4 py-2.5">
        <span className="text-[11px] font-semibold text-[#1F2D52]">Inkoop deze week</span>
        <motion.span
          animate={pressed ? { scale: [1, 0.94, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
            pressed ? "bg-[#1F2D52] text-white" : "bg-[#4F8EF7] text-white"
          }`}
        >
          {pressed ? <Sparkles className="h-3 w-3" /> : <FileBarChart className="h-3 w-3" />}
          {pressed ? "Rapport klaar" : "Inkooprapport"}
        </motion.span>
      </div>
      <div className="flex min-h-[148px] flex-col gap-1.5 p-3">
        <AnimatePresence initial={false}>
          {rows.map((r, i) => (
            <motion.div
              key={r.art}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-3 rounded-lg bg-[#F6F9FE] px-3 py-1.5 text-xs text-[#2B3446]"
            >
              <span className="flex-1 truncate">{r.art}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  r.urgent ? "bg-[#22B8CF]/15 text-[#0E8FA6]" : "bg-[#E4ECF8] text-[#5F6B85]"
                }`}
              >
                {r.advies}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {rows.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-1 px-1 text-[10px] text-[#9AA6BE]"
          >
            De inkoper kijkt het na en bestelt.
          </motion.p>
        )}
      </div>
    </div>
  );
}

// Offertes: een aanvraag komt binnen, het concept vult zich uit eigen tarieven
const REGELS = [
  { post: "Arbeid, 16 uur", bedrag: "€ 1.120" },
  { post: "Materiaal volgens tarieflijst", bedrag: "€ 845" },
  { post: "Voorrijkosten", bedrag: "€ 45" },
];

export function QuoteSnippet() {
  const { ref, step } = useCycle(REGELS.length + 3, 950);
  const regels = Math.max(0, Math.min(step - 1, REGELS.length));
  const klaar = step >= REGELS.length + 1;
  return (
    <div ref={ref} className={frame}>
      <div className="flex items-center justify-between border-b border-[#EEF3FB] px-4 py-2.5 text-[11px]">
        <span className="font-semibold text-[#1F2D52]">Aanvraag binnen: renovatie kantoor</span>
        <span className="text-[#9AA6BE]">09:12</span>
      </div>
      <div className="flex min-h-[168px] flex-col gap-1.5 p-3">
        <AnimatePresence initial={false}>
          {REGELS.slice(0, regels).map((r) => (
            <motion.div
              key={r.post}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between rounded-lg bg-[#F6F9FE] px-3 py-1.5 text-xs text-[#2B3446]"
            >
              <span>{r.post}</span>
              <span className="tabular-nums text-[#5F6B85]">{r.bedrag}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        {klaar && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 flex items-center justify-between px-1"
          >
            <span className="text-[11px] text-[#9AA6BE]">Concept klaar. Jij controleert en verstuurt.</span>
            <span className="rounded-full bg-[#7C5CE6] px-3 py-1 text-[11px] font-semibold text-white">Controleren</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Vragen: een medewerker vraagt, het antwoord komt uit eigen documenten, met bron
export function AnswerSnippet() {
  const { ref, step } = useCycle(5, 1000);
  const antwoord = "Retouren boven de 30 dagen gaan via de binnendienst, met het formulier uit het kwaliteitshandboek.";
  return (
    <div ref={ref} className={frame}>
      <div className="flex items-center gap-1.5 border-b border-[#EEF3FB] px-4 py-2.5 text-[11px] font-semibold text-[#1F2D52]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#C77B16] shadow-[0_0_8px_rgba(199,123,22,0.7)]" />
        Vraag het de kennisbank
      </div>
      <div className="flex min-h-[168px] flex-col gap-2 p-3 text-xs">
        <div className="self-end rounded-xl rounded-br-sm bg-[#EEF3FB] px-3 py-2 text-[#2B3446]">
          Hoe verwerken we een retour na 30 dagen?
        </div>
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-[92%] rounded-xl rounded-bl-sm border border-[#C77B16]/25 bg-[#C77B16]/[0.06] px-3 py-2 text-[#2B3446]"
          >
            {step === 1 ? (
              <span className="inline-flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="h-1.5 w-1.5 rounded-full bg-[#C77B16]/60"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </span>
            ) : (
              antwoord
            )}
          </motion.div>
        )}
        {step >= 3 && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="inline-flex w-fit items-center gap-1 rounded-full border border-[#DCE6F5] bg-white px-2.5 py-0.5 text-[10px] text-[#5F6B85]"
          >
            Bron: Kwaliteitshandboek, hoofdstuk 4
          </motion.span>
        )}
      </div>
    </div>
  );
}
