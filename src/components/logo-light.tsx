"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// Logo-animatie voor de hero (september 2026), naar een Pinterest-referentie: een fel
// lichtpunt met komeetstaart dat een lus tekent. Hier loopt het licht door het echte
// logo: het verschijnt aan het uitlopende einde van de lus, gaat de lus rond, en schiet
// via de pijl naar buiten. Dat is letterlijk "de loop doorbreken".
//
// Opbouw:
//  - Het logo zelf is geen nagetekend pad maar de PNG als CSS-masker, gesplitst in lus
//    (/logo-loop-mask.png) en pijl (/logo-arrow-mask.png). Zo klopt het silhouet exact,
//    ook de kalligrafische ring (buiten- en binnencirkel hebben een ander middelpunt).
//  - Alleen de LICHTROUTE is een SVG-pad (centerlijn, gemeten op de PNG in 1259x683).
//    Het pad wordt één keer bemonsterd met getPointAtLength; de canvas tekent per frame
//    de kop en laat het vorige beeld vervagen (destination-out), wat vanzelf een
//    komeetstaart geeft die langer wordt naarmate het licht sneller gaat.
//  - prefers-reduced-motion: één stilstaand beeld, geen requestAnimationFrame.
//  - Buiten beeld (IntersectionObserver) staat de loop stil.

const W = 1259;
const H = 683;
const ROUTE =
  "M 547.3 224.0 A 244.4 244.4 0 1 0 395.9 521.0 C 443 510, 560 536, 620 536 L 1000 527 L 1250 528";
const DUUR = 5.4; // seconden dat het licht onderweg is
const PAUZE = 1.1; // seconden rust voor de volgende ronde
const N = 1200; // aantal bemonsterde punten op de route

type Punt = [number, number];

export function LogoLight({ className }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const pathEl = pathRef.current;
    if (!wrap || !canvas || !pathEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const totaal = pathEl.getTotalLength();
    const punten: Punt[] = [];
    for (let i = 0; i <= N; i++) {
      const p = pathEl.getPointAtLength((totaal * i) / N);
      punten.push([p.x, p.y]);
    }

    let schaal = 1;
    let dpr = 1;
    let breed = 0;
    let hoog = 0;

    const meet = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      breed = r.width;
      hoog = r.height;
      canvas.width = Math.round(breed * dpr);
      canvas.height = Math.round(hoog * dpr);
      canvas.style.width = `${breed}px`;
      canvas.style.height = `${hoog}px`;
      // Het logo staat met object-fit: contain in het vlak; bereken dezelfde afbeelding.
      schaal = Math.min(breed / W, hoog / H);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const naarScherm = (p: Punt): Punt => [
      (breed - W * schaal) / 2 + p[0] * schaal,
      (hoog - H * schaal) / 2 + p[1] * schaal,
    ];

    const puntOp = (d: number): Punt => {
      const i = Math.min(N - 1, Math.max(0, Math.floor(d * N)));
      const f = d * N - i;
      const a = punten[i];
      const b = punten[i + 1];
      return naarScherm([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
    };

    const tekenKop = (p: Punt, alpha: number, vorige: Punt | null) => {
      const s = schaal * 2.2; // lichtgrootte schaalt mee met het logo
      ctx.globalCompositeOperation = "lighter";
      if (vorige) {
        ctx.beginPath();
        ctx.moveTo(vorige[0], vorige[1]);
        ctx.lineTo(p[0], p[1]);
        ctx.lineCap = "round";
        ctx.lineWidth = 8 * s;
        ctx.strokeStyle = `rgba(170, 210, 255, ${0.95 * alpha})`;
        ctx.shadowColor = "rgba(79, 142, 247, 1)";
        ctx.shadowBlur = 22 * s;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      // brede zachte gloed
      const g1 = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 46 * s);
      g1.addColorStop(0, `rgba(79, 142, 247, ${0.6 * alpha})`);
      g1.addColorStop(1, "rgba(79, 142, 247, 0)");
      ctx.fillStyle = g1;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 46 * s, 0, Math.PI * 2);
      ctx.fill();
      // kern
      const g2 = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], 13 * s);
      g2.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
      g2.addColorStop(0.45, `rgba(190, 225, 255, ${0.95 * alpha})`);
      g2.addColorStop(1, "rgba(120, 180, 255, 0)");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(p[0], p[1], 13 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    };

    const vervaag = (sterkte: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${sterkte})`;
      ctx.fillRect(0, 0, breed, hoog);
      ctx.globalCompositeOperation = "source-over";
    };

    // Traag op gang, steeds sneller: door de lus rustig, de pijl uit als een schot.
    const voortgang = (u: number) => Math.pow(u, 1.75);

    const stil = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    meet();

    if (stil) {
      // Eén beeld: het licht halverwege de pijl, met een korte staart.
      const kop = 0.9;
      let vorige: Punt | null = null;
      for (let k = 60; k >= 0; k--) {
        const d = kop - k * 0.0025;
        const p = puntOp(d);
        tekenKop(p, (1 - k / 60) * 0.9, vorige);
        vorige = p;
        if (k > 0) vervaag(0.06);
      }
      const ro = new ResizeObserver(() => {
        meet();
      });
      ro.observe(wrap);
      return () => ro.disconnect();
    }

    let raf = 0;
    let start = performance.now();
    let vorige: Punt | null = null;
    let zichtbaar = true;
    let laatsteTijd = 0;

    const frame = (nu: number) => {
      raf = requestAnimationFrame(frame);
      if (!zichtbaar) return;
      const dt = laatsteTijd ? Math.min(0.05, (nu - laatsteTijd) / 1000) : 1 / 60;
      laatsteTijd = nu;
      const t = ((nu - start) / 1000) % (DUUR + PAUZE);
      // vervaging per seconde constant houden, onafhankelijk van de framerate
      vervaag(1 - Math.pow(1 - 0.07, dt * 60));
      if (t < DUUR) {
        const u = t / DUUR;
        const d = voortgang(u);
        const p = puntOp(d);
        const inFade = Math.min(1, u / 0.1);
        const uitFade = u > 0.94 ? Math.max(0, (1 - u) / 0.06) : 1;
        tekenKop(p, inFade * uitFade, vorige);
        vorige = p;
      } else {
        vorige = null;
      }
    };

    const ro = new ResizeObserver(() => {
      meet();
      ctx.clearRect(0, 0, breed, hoog);
      vorige = null;
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([e]) => {
        zichtbaar = e.isIntersecting;
        if (zichtbaar) {
          laatsteTijd = 0;
          start = performance.now();
          vorige = null;
        }
      },
      { threshold: 0.05 },
    );
    io.observe(wrap);

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  const masker = (bestand: string): React.CSSProperties => ({
    WebkitMaskImage: `url(${bestand})`,
    maskImage: `url(${bestand})`,
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  });

  return (
    <div ref={wrapRef} className={cn("relative aspect-[1259/683] w-full", className)} aria-hidden>
      {/* Lus als glazen buis. Drie lagen met hetzelfde masker: een 1,5px verschoven lichte
          laag (wordt een randlichtje linksboven), daaroverheen de paneelkleur (maakt de
          binnenkant weer donker) en een zachte highlight van linksboven naar rechtsonder. */}
      <div
        className="absolute inset-0 -translate-x-[1.5px] -translate-y-[1.5px] bg-white/40"
        style={masker("/logo-loop-mask.png")}
      />
      <div className="absolute inset-0 bg-[#0B1226]/85" style={masker("/logo-loop-mask.png")} />
      <div
        className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04)_50%,rgba(79,142,247,0.18))]"
        style={masker("/logo-loop-mask.png")}
      />
      {/* Pijl in het merkcyaan, iets gedempt zodat het licht erbovenuit komt */}
      <div
        className="absolute inset-0 -translate-x-[1.5px] -translate-y-[1.5px] bg-white/30"
        style={masker("/logo-arrow-mask.png")}
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(160deg,rgba(34,184,207,0.72),rgba(34,184,207,0.38))]"
        style={masker("/logo-arrow-mask.png")}
      />
      {/* Het lopende licht */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* Alleen om de route te meten; niet zichtbaar */}
      <svg viewBox={`0 0 ${W} ${H}`} className="absolute h-0 w-0 opacity-0" focusable="false">
        <path ref={pathRef} d={ROUTE} fill="none" />
      </svg>
    </div>
  );
}
