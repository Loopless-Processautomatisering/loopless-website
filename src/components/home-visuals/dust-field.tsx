"use client";

import { useEffect, useRef } from "react";

// Drijvend stof als sectie-achtergrond (oktober 2026): dezelfde deeltjestaal als de ∞ in de
// hero, maar licht (2D-canvas, een paar honderd korrels). Het stof drijft langzaam naar
// rechts op een zacht stromingsveld en wijkt voor de muis. Buiten beeld staat het stil;
// bij prefers-reduced-motion één stilstaand beeld.

export function DustField({
  className,
  count = 520,
  tone = "blue",
}: {
  className?: string;
  count?: number;
  /** "blue" op een lichte achtergrond, "light" (wit en lichtblauw) op een blauwe. */
  tone?: "blue" | "light";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const P = Array.from({ length: count }, () => ({
      x: Math.random(), y: Math.random(), vx: 0, vy: 0,
      s: 1 + Math.random() * 2, a: 0.25 + Math.random() * 0.5, c: Math.random(),
    }));
    const size = () => {
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(cv);

    const ptr = { x: -1e4, y: -1e4 };
    const onMove = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0, visible = true, prev = performance.now(), t = 0;
    const draw = () => {
      cx.clearRect(0, 0, w, h);
      for (const p of P) {
        cx.globalAlpha = p.a;
        // hemelsblauw → lichtblauw van de pijl, zoals de ∞; op blauw wit en ijsblauw
        cx.fillStyle =
          tone === "light"
            ? p.c < 0.6 ? "#FFFFFF" : p.c < 0.85 ? "#CFE2FF" : "#9EE3F0"
            : p.c < 0.55 ? "#7FB2F0" : p.c < 0.85 ? "#4F8EF7" : "#22B8CF";
        cx.fillRect(p.x * w, p.y * h, p.s, p.s);
      }
      cx.globalAlpha = 1;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      t += dt;
      for (const p of P) {
        const px = p.x * w, py = p.y * h;
        // stromingsveld: langzaam naar rechts met zachte golven
        let ax = 6 + Math.sin(py * 0.012 + t * 0.4) * 5;
        let ay = Math.cos(px * 0.01 + t * 0.3) * 4;
        const dx = px - ptr.x, dy = py - ptr.y, d = Math.hypot(dx, dy);
        if (d < 110) {
          const f = (1 - d / 110) * 900;
          ax += (dx / (d || 1)) * f;
          ay += (dy / (d || 1)) * f;
        }
        p.vx = (p.vx + ax * dt) * Math.exp(-dt * 2.5);
        p.vy = (p.vy + ay * dt) * Math.exp(-dt * 2.5);
        p.x += (p.vx * dt) / w;
        p.y += (p.vy * dt) / h;
        if (p.x > 1.02) p.x = -0.02;
        if (p.x < -0.02) p.x = 1.02;
        if (p.y > 1.02) p.y = -0.02;
        if (p.y < -0.02) p.y = 1.02;
      }
      draw();
    };
    if (reduce) draw();
    else raf = requestAnimationFrame(frame);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      prev = performance.now();
    });
    io.observe(cv);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [count, tone]);

  return <canvas ref={ref} aria-hidden className={className} />;
}
