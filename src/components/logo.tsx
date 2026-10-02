"use client";

import Image from "next/image";

interface LogoIconProps {
  className?: string;
  size?: number;
}

export function LogoIcon({ className, size = 32 }: LogoIconProps) {
  return (
    <Image
      src="/logo-icon-final.png"
      alt="LoopLess"
      width={Math.round(size * 1.9)}
      height={size}
      className={className}
      unoptimized
    />
  );
}

interface LogoWithTextProps {
  className?: string;
  iconSize?: number;
}

export function LogoWithText({ className, iconSize = 30 }: LogoWithTextProps) {
  return (
    <span className={`group inline-flex items-center gap-2 ${className ?? ""}`}>
      <LogoIcon size={iconSize} />
      <span className="font-[family-name:var(--font-heading)] text-xl font-bold tracking-tight text-[#1B3A5C]">
        Loop<span className="text-[#22B8CF]">Less</span>
      </span>
    </span>
  );
}
