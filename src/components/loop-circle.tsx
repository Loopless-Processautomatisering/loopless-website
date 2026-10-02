"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";

// De lichtcirkel (oktober 2026): één grote, gesloten cirkel met gloed rond de eerste
// secties onder de hero (Herken je dit, Wat is AI-automatisering, Onze aanpak). Hij is breder dan het scherm, dus je ziet de gloeiende bovenrand, scrolt
// door de inhoud en komt onderaan de rand weer tegen die hem sluit. Eigenlijk een ellips
// (zo hoog als de inhoud, ~2× schermbreed), zodat de rand boven en onder net zo rond
// buigt als de oude lichtboog.
//
// De gloed van de boven- en onderrand groeit mee als die rand in beeld schuift.
// Secties erin hebben geen eigen achtergrond: de binnenkant is één vlak.

function Rim({ edge, glow }: { edge: "top" | "bottom"; glow: MotionValue<number> | number }) {
  const top = edge === "top";
  return (
    <>
      {/* Bloom buiten de rand */}
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className={`absolute left-1/2 h-[320px] w-[1300px] max-w-[160vw] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(79,142,247,0.42),rgba(79,142,247,0.12)_45%,transparent_70%)] blur-2xl ${
          top ? "-top-[110px]" : "-bottom-[110px]"
        }`}
      />
      {/* Heetste punt van het licht, midden op de rand */}
      <motion.div
        aria-hidden
        style={{ opacity: glow }}
        className={`absolute left-1/2 h-[40px] w-[46%] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,1),rgba(170,204,255,0.95)_35%,transparent_70%)] blur-md ${
          top ? "-top-[18px]" : "-bottom-[18px]"
        }`}
      />
    </>
  );
}


// Komeet langs de rand (oktober 2026): een wit-blauw lichtpunt met een uitlopende staart dat
// rond de cirkel reist, één rondje per ~12 s. Omdat de cirkel veel breder is dan het scherm,
// reist hij rustig over de zichtbare stukken (boven- en onderrand) en snel door wat buiten
// beeld valt; zo komt hij steeds terug in zicht. SVG over precies de ellips, per frame
// bijgewerkt; alleen als de cirkel in beeld is. prefers-reduced-motion: geen komeet.
const TAIL = 64;

function RimComet() {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = box.current, sv = svg.current;
    if (!el || !sv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const head = sv.querySelector<SVGCircleElement>("[data-head]")!;
    const halo = sv.querySelector<SVGCircleElement>("[data-halo]")!;
    const tail = Array.from(sv.querySelectorAll<SVGCircleElement>("[data-tail]"));
    let W = 1, H = 1;
    const size = () => {
      W = el.clientWidth;
      H = el.clientHeight;
      sv.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const at = (phi: number) => [W / 2 + (W / 2) * Math.cos(phi), H / 2 + (H / 2) * Math.sin(phi)];
    // staart: stap terug langs de ellips in vaste booglengte
    const back = (phi: number, ds: number) => {
      const a = W / 2, b = H / 2;
      const speed = Math.hypot(a * Math.sin(phi), b * Math.cos(phi)) || 1;
      return phi - ds / speed;
    };

    let phi = -Math.PI / 2 - 0.25, raf = 0, visible = false, prev = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      // zichtbaar deel van de rand: |x - midden| < halve schermbreedte
      const vw = window.innerWidth;
      const [x] = at(phi);
      const onScreen = Math.abs(x - W / 2) < vw / 2 + 60;
      // rustig (~250 px/s) waar je hem ziet, snel waar hij buiten beeld is
      const a = W / 2, b = H / 2;
      const pxPerRad = Math.hypot(a * Math.sin(phi), b * Math.cos(phi)) || 1;
      const pxs = onScreen ? 250 : 3200;
      phi += (pxs * dt) / pxPerRad;
      if (phi > Math.PI * 1.5) phi -= Math.PI * 2;

      const [hx, hy] = at(phi);
      head.setAttribute("cx", String(hx));
      head.setAttribute("cy", String(hy));
      halo.setAttribute("cx", String(hx));
      halo.setAttribute("cy", String(hy));
      let p = phi;
      tail.forEach((c) => {
        p = back(p, 4.5);
        const [tx, ty] = at(p);
        c.setAttribute("cx", String(tx));
        c.setAttribute("cy", String(ty));
      });
    };
    raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      prev = performance.now();
    });
    io.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={box} className="absolute left-1/2 top-0 h-full w-[max(230vw,3000px)] -translate-x-1/2">
      <svg ref={svg} className="absolute inset-0 h-full w-full overflow-visible motion-reduce:hidden" aria-hidden>
        <defs>
          <filter id="comet-blur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
          <filter id="comet-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        <g filter="url(#comet-soft)">
          {Array.from({ length: TAIL }, (_, i) => {
            const f = 1 - i / TAIL;
            return <circle key={i} data-tail r={0.8 + 4.2 * f} fill={i < 12 ? "#E3EEFF" : "#4F8EF7"} opacity={0.6 * f * f} cx="-99" cy="-99" />;
          })}
        </g>
        <circle data-halo r="26" fill="#4F8EF7" opacity="0.55" filter="url(#comet-blur)" cx="-99" cy="-99" />
        <circle data-head r="5.5" fill="#FFFFFF" cx="-99" cy="-99" style={{ filter: "drop-shadow(0 0 6px rgba(170,204,255,1))" }} />
      </svg>
    </div>
  );
}

export function LoopCircle({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: topIn } = useScroll({ target: ref, offset: ["start end", "start center"] });
  const { scrollYProgress: bottomIn } = useScroll({ target: ref, offset: ["end end", "end center"] });
  const topGlow = useTransform(topIn, [0, 1], [0.55, 1]);
  const bottomGlow = useTransform(bottomIn, [0, 1], [1, 0.55]);

  return (
    <div ref={ref} className="relative isolate mt-28 mb-24 md:mt-36 md:mb-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-x-clip">
        {/* De cirkel zelf: lichte binnenkant, blauwe gloed buiten en binnen langs de rand */}
        <div className="absolute left-1/2 top-0 h-full w-[max(230vw,3000px)] -translate-x-1/2 rounded-[50%] border-[1.5px] border-[#9CC0FF] bg-[radial-gradient(ellipse_at_50%_50%,#FFFFFF_72%,#F4F8FF_90%,#E4EEFF_100%)] shadow-[0_0_0_1px_rgba(255,255,255,1),0_0_28px_rgba(79,142,247,0.55),0_0_100px_rgba(79,142,247,0.35),inset_0_0_60px_rgba(79,142,247,0.22)]" />
        <Rim edge="top" glow={reduce ? 1 : topGlow} />
        <Rim edge="bottom" glow={reduce ? 1 : bottomGlow} />
        <RimComet />
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
