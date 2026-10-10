"use client";

// =============================================================================
// FASE 1a — MEETOPSTELLING, GEEN PRODUCTIECODE
//
// Doel: vaststellen wat een GLB-hero kost op een echt toestel, vóórdat er één
// uur in Blender gaat. Asset is bewust een Khronos-sample (DamagedHelmet), niet
// een eigen model: als de cijfers rood zijn, zijn de modelleeruren nooit gemaakt.
//
// Meshopt wordt door drei's useGLTF automatisch gewired (3e argument, default
// true). KTX2 NIET — dat is het gat uit drei issue #2639 en staat bewust buiten
// deze ronde.
//
// LET OP bij het verifiëren: R3F rendert via requestAnimationFrame, en Chrome
// smoort rAF volledig in een niet-zichtbare tab. Een screenshot uit een
// achtergrondtab toont dan een leeg canvas zonder enige foutmelding. Meet met
// een zichtbare pagina (Playwright headless telt als zichtbaar).
// =============================================================================

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment, Html, useProgress } from "@react-three/drei";
import type { Group } from "three";

const MODEL_URL = "/3d/helmet-opt.glb";

function Model({ spin }: { spin: boolean }) {
  const ref = useRef<Group>(null);
  const { scene } = useGLTF(MODEL_URL);

  // Mutatie op de ref, niet setState — de gedocumenteerde R3F-valkuil.
  // delta houdt de snelheid gelijk op 60 én 120 Hz.
  useFrame((_, delta) => {
    if (spin && ref.current) ref.current.rotation.y += delta * 0.35;
  });

  return <primitive ref={ref} object={scene} scale={2.2} />;
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <span className="text-sm text-white/70">{Math.round(progress)}%</span>
    </Html>
  );
}

export default function ModelStage({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <Canvas
      // Onder reduced motion één frame renderen i.p.v. een doorlopende loop.
      frameloop={reducedMotion ? "demand" : "always"}
      // Pixelratio begrenzen: op een 3x-telefoon scheelt dit factor ~2 in fillrate.
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 45 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={<Loader />}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 3, 3]} intensity={1.5} />
        <Model spin={!reducedMotion} />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
