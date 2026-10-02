"use client";

import NeuralBackground from "@/components/ui/flow-field-background";
import { cn } from "@/lib/utils";

interface SectionWithParticlesProps {
  children: React.ReactNode;
  className?: string;
  particleCount?: number;
  speed?: number;
  trailOpacity?: number;
  color?: string;
  overlay?: "left" | "center" | "full";
}

export function SectionWithParticles({
  children,
  className,
  particleCount = 400,
  speed = 0.5,
  trailOpacity = 0.08,
  color = "#4F8EF7",
  overlay = "full",
}: SectionWithParticlesProps) {
  const overlayClass = {
    left: "bg-gradient-to-r from-[#FFFFFF]/90 via-[#FFFFFF]/70 to-[#FFFFFF]/40",
    center: "bg-[#FFFFFF]/60",
    full: "bg-[#FFFFFF]/70",
  };

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0">
        <NeuralBackground
          color={color}
          trailOpacity={trailOpacity}
          particleCount={particleCount}
          speed={speed}
          trailColor="255, 255, 255"
          className="bg-white"
        />
        <div className={cn("absolute inset-0", overlayClass[overlay])} />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
