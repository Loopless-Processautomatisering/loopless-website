"use client";

import { motion, useReducedMotion } from "framer-motion";

// Lijn-illustraties per dienst (oktober 2026): kleine, steeds herhalende scènes die laten
// zien wat het systeem klaarzet. Lijnen in de kleur van de dienst, de rest in rustig grijs-
// blauw. Bij prefers-reduced-motion staat alles stil in de eindstand.

type Variant = "leads" | "offerte" | "vragen" | "maatwerk";

const INK = "#C9D6EA";

export function ServiceArt({ variant, color }: { variant: Variant; color: string }) {
  const reduce = useReducedMotion();
  const loop = (delay = 0, duration = 3.2) =>
    reduce ? { duration: 0 } : { duration, delay, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" as const };

  return (
    <svg viewBox="0 0 240 110" className="h-full w-full" aria-hidden>
      {variant === "leads" &&
        [0, 1, 2, 3].map((i) => (
          <g key={i} transform={`translate(18 ${14 + i * 22})`}>
            <motion.rect
              width="204" height="16" rx="5" fill="white" stroke={INK}
              initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -8 }}
              animate={{ opacity: [0, 1, 1, 0], x: [-8, 0, 0, 0] }}
              transition={{ ...loop(i * 0.25, 4), times: [0, 0.15, 0.85, 1] }}
            />
            <rect x="10" y="6" width="58" height="4" rx="2" fill={INK} />
            <rect x="120" y="6" width="44" height="4" rx="2" fill="#EEF3FB" />
            <motion.rect
              x="120" y="6" height="4" rx="2" fill={color}
              initial={{ width: reduce ? 44 - i * 8 : 0 }}
              animate={{ width: [0, 44 - i * 8, 44 - i * 8, 0] }}
              transition={{ ...loop(i * 0.25 + 0.3, 4), times: [0, 0.2, 0.85, 1] }}
            />
            <motion.circle
              cx="190" cy="8" r="4.5" fill={i < 3 ? color : INK}
              initial={{ scale: reduce ? 1 : 0 }}
              animate={{ scale: [0, 1, 1, 0] }}
              transition={{ ...loop(i * 0.25 + 0.6, 4), times: [0, 0.15, 0.85, 1] }}
            />
          </g>
        ))}

      {variant === "offerte" && (
        <g transform="translate(70 8)">
          <rect width="100" height="94" rx="8" fill="white" stroke={INK} />
          <rect x="12" y="12" width="40" height="6" rx="3" fill={color} opacity="0.85" />
          {[0, 1, 2, 3].map((i) => (
            <motion.rect
              key={i} x="12" y={30 + i * 12} height="4" rx="2" fill={INK}
              initial={{ width: reduce ? 76 - (i % 2) * 18 : 0 }}
              animate={{ width: [0, 76 - (i % 2) * 18, 76 - (i % 2) * 18, 0] }}
              transition={{ ...loop(i * 0.35, 4.2), times: [0, 0.25, 0.85, 1] }}
            />
          ))}
          <motion.g
            initial={{ opacity: reduce ? 1 : 0, y: reduce ? 0 : 4 }}
            animate={{ opacity: [0, 0, 1, 1, 0], y: [4, 4, 0, 0, 0] }}
            transition={{ ...loop(0, 4.2), times: [0, 0.55, 0.65, 0.88, 1] }}
          >
            <rect x="52" y="76" width="36" height="10" rx="5" fill={color} />
            <rect x="58" y="80" width="24" height="2.5" rx="1.25" fill="white" />
          </motion.g>
        </g>
      )}

      {variant === "vragen" && (
        <g>
          <motion.g
            initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : -6 }}
            animate={{ opacity: [0, 1, 1, 0], x: [-6, 0, 0, 0] }}
            transition={{ ...loop(0, 4.4), times: [0, 0.12, 0.88, 1] }}
          >
            <rect x="20" y="14" width="120" height="26" rx="10" fill="white" stroke={INK} />
            <rect x="32" y="25" width="80" height="4" rx="2" fill={INK} />
          </motion.g>
          <motion.g
            initial={{ opacity: reduce ? 1 : 0, x: reduce ? 0 : 6 }}
            animate={{ opacity: [0, 0, 1, 1, 0], x: [6, 6, 0, 0, 0] }}
            transition={{ ...loop(0, 4.4), times: [0, 0.3, 0.42, 0.88, 1] }}
          >
            <rect x="84" y="50" width="136" height="46" rx="10" fill={color} opacity="0.12" stroke={color} strokeOpacity="0.5" />
            {[0, 1, 2].map((i) => (
              <motion.rect
                key={i} x="98" y={62 + i * 10} height="4" rx="2" fill={color}
                initial={{ width: reduce ? 100 - i * 24 : 0 }}
                animate={{ width: [0, 0, 100 - i * 24, 100 - i * 24, 0] }}
                transition={{ ...loop(0, 4.4), times: [0, 0.45 + i * 0.07, 0.6 + i * 0.07, 0.88, 1] }}
                opacity="0.8"
              />
            ))}
          </motion.g>
        </g>
      )}

      {variant === "maatwerk" && (
        <g>
          {[
            [40, 30], [120, 22], [200, 34], [70, 82], [160, 84],
          ].map(([x, y], i) => (
            <rect key={i} x={x - 16} y={y - 10} width="32" height="20" rx="6" fill="white" stroke={i === 1 ? color : INK} />
          ))}
          {[
            "M56 30 L104 22", "M136 22 L184 34", "M120 32 L86 72", "M120 32 L154 74", "M86 82 L144 84",
          ].map((dPath, i) => (
            <motion.path
              key={i} d={dPath} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: [0, 1, 1, 0] }}
              transition={{ ...loop(i * 0.3, 4), times: [0, 0.25, 0.85, 1] }}
            />
          ))}
          <motion.circle
            cx="120" cy="22" r="14" fill="none" stroke={color} strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={reduce ? { opacity: 0 } : { opacity: [0, 0.5, 0], scale: [0.8, 1.5, 1.6] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1 }}
            style={{ transformOrigin: "120px 22px" }}
          />
        </g>
      )}
    </svg>
  );
}
