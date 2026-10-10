"use client";

// Wrapper: houdt WebGL uit de SSR-bundel, respecteert prefers-reduced-motion en
// toont een poster zolang (of wanneer) het canvas er niet is. De poster is ook
// de fallback bij WebGL-contextverlies — precies wat adviseur-website nog mist.

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ModelStage = dynamic(() => import("./model-stage"), {
  ssr: false,
  loading: () => <Poster label="3D wordt geladen…" />,
});

function Poster({ label }: { label: string }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center bg-[#161625]"
      role="img"
      aria-label="Productweergave in 3D"
    >
      <span className="text-sm text-white/50">{label}</span>
    </div>
  );
}

export function ModelHero() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);

    // WebGL-ondersteuning vooraf toetsen: geen canvas monteren als het toch faalt.
    try {
      const c = document.createElement("canvas");
      if (!c.getContext("webgl2") && !c.getContext("webgl")) setWebglFailed(true);
    } catch {
      setWebglFailed(true);
    }

    const onLost = () => setWebglFailed(true);
    window.addEventListener("webglcontextlost", onLost, true);
    return () => {
      mq.removeEventListener("change", onChange);
      window.removeEventListener("webglcontextlost", onLost, true);
    };
  }, []);

  if (webglFailed) return <Poster label="3D niet beschikbaar" />;
  return <ModelStage reducedMotion={reducedMotion} />;
}
