// De loop als echte loop.
//
// Idee van Wessel (2026-09-19): de site ís een loop, en elke pagina is er een
// onderdeel van. Dat maakt van het beeldmerk meteen de navigatie — je ziet waar
// je bent en wat ervoor en erna komt.
//
// De stappen zijn geen verzonnen indeling: ze volgen de keten die op elke
// dienstpagina terugkomt. Precies één stap is in accent, en dat is altijd de
// stap waar een mens beslist.

import { Schema } from "./grammar";

export type LoopStap = {
  id: string;
  /** Wat er in die stap gebeurt. */
  label: string;
  /** De pagina die bij deze stap hoort. */
  href: string;
  /** Hoe de pagina in de navigatie heet. */
  pagina: string;
  /** De stap waar de mens beslist — krijgt het accent. */
  beslissing?: boolean;
};

export const LOOP: LoopStap[] = [
  { id: "probleem", label: "waar het blijft hangen", href: "/diensten", pagina: "Diensten" },
  { id: "uitzoeken", label: "het systeem zoekt uit", href: "/configurator", pagina: "Zelfscan" },
  { id: "beslissen", label: "jouw mensen beslissen", href: "/over", pagina: "Over", beslissing: true },
  { id: "resultaat", label: "het werk gaat eruit", href: "/cases", pagina: "Cases" },
];

/**
 * De loop als cirkel. Gebruikt in de hero en — kleiner — in de footer als
 * navigatie, waar `actief` de huidige pagina markeert.
 */
export function LoopCirkel({
  actief,
  className,
  compact = false,
}: {
  actief?: string;
  className?: string;
  compact?: boolean;
}) {
  const W = 580;
  const H = 400;
  const cx = W / 2;
  const cy = H / 2;
  const r = compact ? 104 : 116;

  // Vier posities op de cirkel, startend bovenaan.
  const punten = LOOP.map((stap, i) => {
    const hoek = (i / LOOP.length) * Math.PI * 2 - Math.PI / 2;
    return { ...stap, x: cx + Math.cos(hoek) * r, y: cy + Math.sin(hoek) * r, hoek };
  });

  // De cirkel in vier bogen, zodat er een opening bij elk knooppunt valt.
  const gat = 0.32;
  const bogen = punten.map((p, i) => {
    const volgende = punten[(i + 1) % punten.length];
    const a1 = p.hoek + gat;
    const a2 = volgende.hoek - gat;
    const x1 = cx + Math.cos(a1) * r;
    const y1 = cy + Math.sin(a1) * r;
    const x2 = cx + Math.cos(a2) * r;
    const y2 = cy + Math.sin(a2) * r;
    // Pijlpunt halverwege de boog, in de looprichting.
    const am = (a1 + a2) / 2;
    const mx = cx + Math.cos(am) * r;
    const my = cy + Math.sin(am) * r;
    const tx = -Math.sin(am);
    const ty = Math.cos(am);
    return {
      d: `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`,
      kop: `M ${mx - tx * 6 - Math.cos(am) * 4} ${my - ty * 6 - Math.sin(am) * 4} L ${mx} ${my} L ${mx - tx * 6 + Math.cos(am) * 4} ${my - ty * 6 + Math.sin(am) * 4}`,
      naarBeslissing: volgende.beslissing,
    };
  });

  return (
    <Schema
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      title="De loop: waar het blijft hangen, het systeem zoekt uit, jouw mensen beslissen, het werk gaat eruit"
      desc="Loopless werkt in een kringloop van vier stappen. Eerst: waar blijft het werk hangen. Dan zoekt het systeem het uit en zet het klaar. Vervolgens controleren en beslissen jouw mensen. Daarna gaat het werk eruit, en wat er besloten is gaat de loop weer in."
    >
      {bogen.map((b, i) => (
        <g key={i}>
          <path
            d={b.d}
            fill="none"
            stroke={b.naarBeslissing ? "var(--color-accent)" : "var(--color-rule-strong)"}
            strokeWidth={1.25}
            strokeLinecap="round"
          />
          <path
            d={b.kop}
            fill="none"
            stroke={b.naarBeslissing ? "var(--color-accent)" : "var(--color-rule-strong)"}
            strokeWidth={1.25}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {punten.map((p) => {
        const isActief = actief === p.id;
        const kleur = p.beslissing ? "var(--color-accent)" : "var(--color-ink)";
        const straal = p.beslissing ? 11 : 6;

        // Labels naar buiten toe uitlijnen, anders lopen ze door de cirkel heen:
        // boven en onder gecentreerd, links en rechts zijwaarts.
        const cosH = Math.cos(p.hoek);
        const sinH = Math.sin(p.hoek);
        const zijwaarts = Math.abs(cosH) > 0.5;
        const anchor = zijwaarts ? (cosH > 0 ? "start" : "end") : "middle";
        const lx = p.x + (zijwaarts ? cosH * (straal + 14) : 0);
        const ly = zijwaarts
          ? p.y - 4
          : p.y + (sinH > 0 ? straal + 24 : -(straal + 18));

        return (
          <g key={p.id}>
            {isActief && (
              <circle
                cx={p.x}
                cy={p.y}
                r={straal + 8}
                fill="none"
                stroke={kleur}
                strokeWidth={1}
                strokeDasharray="3 3"
                opacity={0.55}
              />
            )}
            <circle
              cx={p.x}
              cy={p.y}
              r={straal}
              fill={p.beslissing ? "var(--color-accent)" : "var(--color-paper)"}
              stroke={kleur}
              strokeWidth={p.beslissing ? 0 : 1.25}
            />
            {p.beslissing && (
              // Het enige gevulde knooppunt van de hele site: hier beslist een mens.
              <circle cx={p.x} cy={p.y} r={4} fill="var(--color-paper)" />
            )}
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              fontFamily="var(--font-mono)"
              fontSize={12}
              fill={p.beslissing ? "var(--color-accent)" : "var(--color-ink-2)"}
            >
              {p.label}
            </text>
            <text
              x={lx}
              y={ly + 15}
              textAnchor={anchor}
              fontFamily="var(--font-mono)"
              fontSize={10.5}
              fill="var(--color-ink-3)"
            >
              {p.pagina}
            </text>
          </g>
        );
      })}

      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fontFamily="var(--font-heading)"
        fontSize={17}
        fill="var(--color-ink)"
      >
        de loop
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize={11}
        fill="var(--color-ink-3)"
      >
        elke pagina een stap
      </text>
    </Schema>
  );
}

/**
 * De loop verticaal, voor smalle schermen. Een cirkel van 580 breed schaalt op
 * 375px naar labels van ~7px en is dan onleesbaar (gemeten 2026-09-19); deze
 * variant houdt dezelfde vier stappen en dezelfde volgorde, maar onder elkaar.
 */
export function LoopLijst({ actief, className }: { actief?: string; className?: string }) {
  return (
    <nav aria-label="De loop" className={className}>
      <ol className="relative">
        {LOOP.map((stap, i) => {
          const isActief = actief === stap.id;
          const isLaatste = i === LOOP.length - 1;
          return (
            <li key={stap.id} className="relative pb-7 pl-8 last:pb-0">
              {!isLaatste && (
                <span
                  aria-hidden
                  className="absolute left-[7px] top-4 h-full w-px bg-rule-strong"
                />
              )}
              <span
                aria-hidden
                className={[
                  "absolute left-0 top-1 block h-[15px] w-[15px] rounded-full border",
                  stap.beslissing
                    ? "border-accent bg-accent"
                    : "border-rule-strong bg-paper",
                  isActief && !stap.beslissing ? "border-ink" : "",
                ].join(" ")}
              />
              {stap.beslissing && (
                <span
                  aria-hidden
                  className="absolute left-[5px] top-[9px] block h-[5px] w-[5px] rounded-full bg-paper"
                />
              )}
              <a
                href={stap.href}
                aria-current={isActief ? "page" : undefined}
                className={[
                  "block leading-tight",
                  stap.beslissing ? "text-accent" : isActief ? "text-ink" : "text-ink-2",
                ].join(" ")}
              >
                <span className="block font-mono text-small">{stap.label}</span>
                <span className="mt-0.5 block font-mono text-label text-ink-3">
                  {stap.pagina}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 pl-8 font-mono text-label text-ink-3">
        <span aria-hidden>↻ </span>
        en dan weer van voren af aan
      </p>
    </nav>
  );
}

/**
 * De loop als voortgangsbalk. Past in een masthead of onderaan een pagina:
 * dezelfde vier stappen, maar plat, zodat hij nergens ruimte opeist.
 */
export function LoopBalk({ actief, className }: { actief?: string; className?: string }) {
  return (
    <nav aria-label="De loop" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {LOOP.map((stap, i) => {
          const isActief = actief === stap.id;
          return (
            <li key={stap.id} className="flex items-center gap-2">
              <a
                href={stap.href}
                aria-current={isActief ? "page" : undefined}
                className={[
                  "text-meta transition-colors",
                  isActief
                    ? "font-medium text-ink underline underline-offset-4 decoration-rule-strong"
                    : stap.beslissing
                      ? "text-accent hover:text-accent-ink"
                      : "text-ink-3 hover:text-ink",
                ].join(" ")}
              >
                {stap.label}
              </a>
              <span aria-hidden className="text-ink-3">
                {i === LOOP.length - 1 ? "↻" : "→"}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
