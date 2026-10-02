"use client";

import { motion, useReducedMotion } from "framer-motion";

// Tijdlijn bij de belofte (oktober 2026): zes weken, de balk vult zich als hij in beeld komt
// en de drie fasen uit "Onze aanpak" lichten op. Week 4 tot 6 is gemarkeerd: daar draait
// het. Wit op de blauwe sectie. prefers-reduced-motion: direct gevuld.

const FASEN = [
  { label: "Analyseren", at: 0.08 },
  { label: "Bouwen", at: 0.4 },
  { label: "Draaien", at: 0.83 },
];

export function PromiseTimeline() {
  const reduce = useReducedMotion();
  const fill = reduce ? { initial: { width: "100%" } } : { initial: { width: "0%" }, whileInView: { width: "100%" } };
  return (
    <div className="mx-auto mt-10 max-w-[620px] text-left" aria-hidden>
      <div className="relative h-14">
        {/* weken */}
        <div className="absolute inset-x-0 top-0 text-[11px] font-medium text-white/60">
          {[1, 2, 3, 4, 5, 6].map((w, i) => (
            <span
              key={w}
              className="absolute whitespace-nowrap"
              style={{ left: `${(i / 5) * 100}%`, transform: `translateX(${i === 0 ? "0" : i === 5 ? "-100%" : "-50%"})` }}
            >
              wk {w}
            </span>
          ))}
        </div>
        {/* balk */}
        <div className="absolute inset-x-0 top-7 h-2 rounded-full bg-white/20">
          {/* week 4 tot 6: het draait */}
          <div className="absolute inset-y-[-5px] left-[60%] right-0 rounded-full border border-white/50 bg-white/10" />
          <motion.div
            {...fill}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-full rounded-full bg-white shadow-[0_0_16px_rgba(255,255,255,0.8)]"
          >
            <span className="absolute -right-1.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_4px_rgba(255,255,255,0.7)]" />
          </motion.div>
        </div>
      </div>
      {/* fasen */}
      <div className="relative h-6">
        {FASEN.map((f, i) => (
          <motion.span
            key={f.label}
            initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.4 + i * 0.7 }}
            className="absolute -translate-x-1/2 whitespace-nowrap text-sm font-semibold text-white"
            style={{ left: `${f.at * 100}%` }}
          >
            {f.label}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
