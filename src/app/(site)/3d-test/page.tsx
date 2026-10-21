import type { Metadata } from "next";
import { ModelHero } from "@/components/three/model-hero";

// Meetpagina voor fase 1a. Niet in de navigatie, niet indexeerbaar.
export const metadata: Metadata = {
  title: "3D-meettest",
  robots: { index: false, follow: false },
};

export default function ThreeDTestPage() {
  return (
    <main className="min-h-screen bg-[#161625]">
      <div className="mx-auto max-w-[1200px] px-6 pt-28">
        <h1 className="text-3xl font-semibold text-white">3D-meettest (fase 1a)</h1>
        <p className="mt-2 max-w-[60ch] text-white/60">
          Khronos-sample, Meshopt + WebP, 545 KB. Deze pagina bestaat om LCP,
          framerate en geheugen op een echt toestel te meten — niet om mooi te zijn.
        </p>
      </div>
      <div className="mt-8 h-[70vh] w-full">
        <ModelHero />
      </div>
    </main>
  );
}
