"use client";

import { useEffect, useRef } from "react";

// Kleine stoflus (oktober 2026): de ∞ uit de hero in het klein (2D-canvas, ~4000 korrels uit
// public/loop-infinity.png). Komt hij in beeld, dan waait het stof samen tot de lus en
// breekt die daarna open op het kruispunt; de opening blijft staan. Met de muis erover
// breekt hij verder open en sluit hij zich weer tot de vaste opening. Veerdynamiek per
// korrel; buiten beeld staat hij stil.

const N = 4200;

export function MiniLoop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    if (!cx) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const img = new Image();
      img.src = "/loop-infinity.png";
      try {
        await img.decode();
      } catch {
        return;
      }
      if (disposed) return;

      // Pixels van de vorm verzamelen, genormaliseerd naar breedte 1 rond het midden.
      const S = 220;
      const off = document.createElement("canvas");
      off.width = S;
      off.height = S;
      const ox = off.getContext("2d", { willReadFrequently: true })!;
      ox.drawImage(img, 0, 0, S, S);
      const d = ox.getImageData(0, 0, S, S).data;
      const cells: [number, number][] = [];
      let minX = S, maxX = 0, minY = S, maxY = 0;
      for (let y = 0; y < S; y++)
        for (let x = 0; x < S; x++) {
          const i = (y * S + x) * 4;
          if (d[i] * 0.2126 + d[i + 1] * 0.7152 + d[i + 2] * 0.0722 < 128) {
            cells.push([x, y]);
            minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
        }
      const bw = maxX - minX + 1, cxm = (minX + maxX + 1) / 2, cym = (minY + maxY + 1) / 2;
      const aspect = (maxY - minY + 1) / bw;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const P = Array.from({ length: N }, () => {
        const [x, y] = cells[Math.floor(Math.random() * cells.length)];
        const tx = (x + Math.random() - cxm) / bw, ty = (y + Math.random() - cym) / bw;
        return {
          tx, ty,
          x: tx + (Math.random() - 0.5) * 1.4, y: ty + (Math.random() - 0.5) * 1.4,
          vx: 0, vy: 0,
          k: Math.hypot(tx, ty), // afstand tot het kruispunt (midden)
          s: 0.9 + Math.random() * 1.2,
          c: tx > 0.05 && ty < 0.05 ? 1 : 0,
          j: Math.random() * 6.28,
        };
      });

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let w = 0, h = 0, scale = 1;
      const size = () => {
        w = cv.clientWidth;
        h = cv.clientHeight;
        cv.width = w * dpr;
        cv.height = h * dpr;
        cx.setTransform(dpr, 0, 0, dpr, 0, 0);
        scale = Math.min(w * 0.92, (h * 0.92) / aspect);
      };
      size();
      const ro = new ResizeObserver(size);
      ro.observe(cv);

      let hover = false;
      const onEnter = () => (hover = true);
      const onLeave = () => (hover = false);
      cv.addEventListener("pointerenter", onEnter);
      cv.addEventListener("pointerleave", onLeave);

      let raf = 0, visible = false, shownAt = -1, prev = performance.now(), gap = 0, t = 0;
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        const dt = Math.min((now - prev) / 1000, 0.05);
        prev = now;
        t += dt;
        if (shownAt < 0) shownAt = now;
        // eerst samenwaaien, na ~1,6 s knapt hij open; muis erover = verder open
        const age = (now - shownAt) / 1000;
        const target = reduce ? 0.5 : age < 1.6 ? 0 : hover ? 1 : 0.5;
        gap += (target - gap) * (1 - Math.exp(-dt * 5));

        cx.clearRect(0, 0, w, h);
        for (const p of P) {
          // korrels bij het kruispunt worden weggeduwd: de opening
          const near = Math.max(0, 1 - p.k / 0.16);
          const push = near * near * gap * 0.22;
          const dirx = p.tx / (p.k || 1), diry = p.ty / (p.k || 1);
          const gx = p.tx + dirx * push + Math.sin(t * 0.8 + p.j) * 0.002;
          const gy = p.ty + diry * push + Math.cos(t * 0.7 + p.j) * 0.002;
          if (reduce) {
            p.x = gx;
            p.y = gy;
          } else {
            p.vx += (gx - p.x) * 60 * dt;
            p.vy += (gy - p.y) * 60 * dt;
            const damp = Math.exp(-dt * 9);
            p.vx *= damp;
            p.vy *= damp;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
          }
          cx.globalAlpha = 0.85 * (1 - near * gap * 0.6);
          cx.fillStyle = p.c ? "#22B8CF" : "#7FB2F0";
          cx.fillRect(w / 2 + p.x * scale, h / 2 + p.y * scale, p.s, p.s);
        }
        cx.globalAlpha = 1;
      };
      raf = requestAnimationFrame(frame);
      const io = new IntersectionObserver(([e]) => {
        visible = e.isIntersecting;
        prev = performance.now();
      }, { threshold: 0.3 });
      io.observe(cv);

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        cv.removeEventListener("pointerenter", onEnter);
        cv.removeEventListener("pointerleave", onLeave);
      };
      if (disposed) cleanup();
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={ref} aria-label="Een loop van stof die openbreekt" role="img" className={className} />;
}
