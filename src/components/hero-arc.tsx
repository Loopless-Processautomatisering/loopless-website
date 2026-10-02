"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import { LoopDust } from "@/components/loop-dust";
import { AnimateIn } from "@/components/ui/animate-in";

// Hero (oktober 2026): ∞ van stofdeeltjes die breekt onder de muis, gecentreerd op de
// achtergrond, met de kop in het midden eroverheen. Scrollen breekt de loop: het stof wordt een lichtblauwe wolk over de sectie
// "de loop verbreken" en vormt daarin het logo in wit (zie loop-dust.tsx). De rest van de
// home staat daaronder in de lichtcirkel (loop-circle.tsx). Licht palet: wit en blauw.
//
// De kop komt uit de portal (kan regeleinden bevatten), die worden hier spaties.

// Binnenkomst: vervaagd, iets lager, dan scherp op z'n plek.
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 40, filter: "blur(20px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 1, delay, ease: "easeOut" as const },
});

// Fijne korrel tegen banding in de verlopen.
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function HeroArc({
  title,
  subtitle,
  kicker,
  about,
}: {
  title: string;
  subtitle: string;
  kicker: string;
  about: { kicker: string; heading: string; text: string; cta: string };
}) {
  const kop = title.replace(/\n/g, " ").trim();

  // Scrollvoortgang over hero + logo-sectie: 0 = de ∞, 1 = het logo. Als ref, zodat de
  // scene hem per frame leest zonder React-renders.
  const stageRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const textRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stageProgress } = useScroll({ target: stageRef, offset: ["start start", "end end"] });
  useMotionValueEvent(stageProgress, "change", (v) => {
    progress.current = v;
  });
  const hintOpacity = useTransform(stageProgress, [0, 0.1], [1, 0]);
  // Blauw vlak onder de stofwolk van de logo-sectie: houdt witte tekst leesbaar.
  const skyOpacity = useTransform(stageProgress, [0.4, 0.85], [0, 1]);

  return (
    <section className="relative overflow-x-clip bg-white">
      {/* Stoflus (oktober 2026): één canvas blijft staan (sticky) achter de hero én de
          logo-sectie. In de hero de ∞ van stof (muis erdoor = de loop breekt); bij het
          scrollen knapt hij open en vormt het stof het logo in de volgende sectie (zie
          loop-dust.tsx). De inhoud schuift er met -mt-[100svh] overheen.
          overflow-x-clip i.p.v. hidden, anders werkt sticky niet. */}
      <div ref={stageRef} className="relative">
        <div className="sticky top-0 h-[100svh] min-h-[640px] overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_60%_42%,rgba(79,142,247,0.1),transparent_70%)]"
          />
          {/* Lichtblauw vlak dat meekomt met de stofwolk (achter het stof) */}
          <motion.div
            aria-hidden
            style={{ opacity: skyOpacity }}
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_80%_at_28%_45%,#6FA6F2_0%,#4F8EF7_45%,#3F7FE0_100%)]"
          />
          <LoopDust progressRef={progress} avoidRef={textRef} className="absolute inset-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-multiply"
            style={{ backgroundImage: GRAIN }}
          />
        </div>

        <div className="relative -mt-[100svh]">
          {/* Hero */}
          <div className="relative h-[100svh] min-h-[640px]">
            <motion.div
              aria-hidden
              style={{ opacity: hintOpacity }}
              className="pointer-events-none absolute bottom-6 right-6 hidden items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#5F6B85] md:flex"
            >
              <span className="hidden [@media(hover:hover)_and_(pointer:fine)]:inline">Beweeg je muis door de loop</span>
              <span className="[@media(hover:hover)_and_(pointer:fine)]:hidden">Scroll en doorbreek de loop</span>
              <span className="block h-6 w-px animate-pulse bg-[#4F8EF7]" />
            </motion.div>

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 pb-10 pt-24 text-center">
              {/* Tekstvak: hier wijkt het stof voor (geen overlay) */}
              <div ref={textRef} className="max-w-[560px]">
                <motion.div {...rise(0.3)} className="mb-4 flex justify-center">
                  <Link
                    href="/diensten"
                    className="liquid-glass group inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[13px] text-[#2B3446] transition-colors hover:text-[#10182B] sm:text-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4F8EF7] shadow-[0_0_8px_1px_rgba(79,142,247,0.7)]" />
                    <span className="font-semibold text-[#1F2D52]">Voor het MKB</span>
                    <span aria-hidden className="hidden text-[#9AA6BE] sm:inline">·</span>
                    <span className="hidden sm:inline">{kicker}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-[#4F8EF7] transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
  
                <motion.h1
                  {...rise(0.45)}
                  className="chrome-ink text-balance font-[family-name:var(--font-heading)] text-[1.9rem] font-bold leading-[1.08] tracking-tight md:text-[2.4rem] lg:text-[2.6rem]"
                >
                  {kop}
                </motion.h1>
  
                <motion.p
                  {...rise(0.56)}
                  className="mx-auto mt-3 max-w-[420px] text-balance text-base leading-relaxed text-[#5F6B85]"
                >
                  {subtitle}
                </motion.p>
  
                <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center sm:gap-3">
                  <motion.div {...rise(0.66)}>
                    <Link
                      href="/contact"
                      className="block w-full rounded-full bg-[#4F8EF7] px-6 py-3 text-center text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(79,142,247,0.6)] transition-all hover:bg-[#3A75D8] hover:shadow-[0_14px_36px_-10px_rgba(79,142,247,0.7)] sm:w-auto"
                    >
                      Plan een gesprek
                    </Link>
                  </motion.div>
                  <motion.div {...rise(0.76)}>
                    <Link
                      href="/diensten"
                      className="block w-full rounded-full border border-[#C9D8F0] bg-white/70 px-6 py-3 text-center text-sm font-semibold text-[#10182B] backdrop-blur transition-colors hover:border-[#4F8EF7]/50 hover:text-[#4F8EF7] sm:w-auto"
                    >
                      Bekijk onze diensten
                    </Link>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* De loop verbreken: links (boven op mobiel) vormt het stof het logo, rechts de tekst */}
          <div className="relative min-h-[100svh]">
            <div className="mx-auto grid min-h-[100svh] max-w-[1200px] items-end px-6 pb-16 pt-[52svh] md:grid-cols-2 md:items-center md:gap-16 md:py-24">
              <div aria-hidden className="hidden md:block" />
              <AnimateIn>
                <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.2em] text-white/80">{about.kicker}</p>
                <h2 className="text-balance font-[family-name:var(--font-heading)] text-4xl font-bold leading-[1.08] tracking-tight text-white md:text-5xl">
                  {about.heading}
                </h2>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/90">
                  {about.text.split(/\n\s*\n/).map((alinea) => (
                    <p key={alinea.slice(0, 24)}>{alinea}</p>
                  ))}
                </div>
                <Link
                  href="/over"
                  className="group mt-8 inline-flex items-center gap-2 rounded-full border border-white/70 px-6 py-3 font-semibold text-white transition-colors hover:bg-white hover:text-[#2F6FD6]"
                >
                  {about.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </AnimateIn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
