// De grammatica van de schema's.
//
// Eén tekentaal voor alle zes: technische tekening uit een jaarverslag, niet
// "hand-drawn". Lijnen 1px, rechthoekige knooppunten, open pijlpunten, labels
// in mono.
//
// De regel die het hele ontwerp draagt: er is PRECIES ÉÉN accent-knooppunt per
// schema, en dat is altijd de stap waar een mens beslist. Daarmee is de
// positionering — wij automatiseren het uitzoeken, niet het beslissen — het
// enige gekleurde element op de site.

import type { ReactNode } from "react";

export const SCHEMA_FONT = "var(--font-mono)";

/** Knooppunt. `accent` is gereserveerd voor de menselijke beslissing. */
export function Node({
  x,
  y,
  w = 150,
  h = 56,
  label,
  accent = false,
  muted = false,
  rx = 14,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string[];
  accent?: boolean;
  muted?: boolean;
  /** Ronding. 14 = zacht (standaard), 2 = strak technisch. */
  rx?: number;
}) {
  const stroke = accent ? "var(--color-accent)" : muted ? "var(--color-rule-strong)" : "var(--color-ink)";
  const fill = accent ? "var(--color-accent-wash)" : "transparent";
  const textFill = accent ? "var(--color-accent)" : muted ? "var(--color-ink-3)" : "var(--color-ink)";
  const lineHeight = 13;
  const startY = y + h / 2 - ((label.length - 1) * lineHeight) / 2 + 4;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={rx}
        fill={fill}
        stroke={stroke}
        strokeWidth={accent ? 1.5 : 1}
      />
      {label.map((line, i) => (
        <text
          key={line}
          x={x + w / 2}
          y={startY + i * lineHeight}
          textAnchor="middle"
          fontFamily={SCHEMA_FONT}
          fontSize={10.5}
          fill={textFill}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/** Pijl met open punt. Horizontaal of verticaal. */
export function Arrow({
  from,
  to,
  accent = false,
  bocht = 0,
}: {
  from: [number, number];
  to: [number, number];
  accent?: boolean;
  /** Zijwaartse doorbuiging in px. 0 = kaarsrecht, 6-14 = los. */
  bocht?: number;
}) {
  const stroke = accent ? "var(--color-accent)" : "var(--color-rule-strong)";
  const [x1, y1] = from;
  const [x2, y2] = to;
  const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  const dir = horizontal ? Math.sign(x2 - x1) : Math.sign(y2 - y1);
  const head = 5;

  const headPath = horizontal
    ? `M ${x2 - dir * head} ${y2 - head} L ${x2} ${y2} L ${x2 - dir * head} ${y2 + head}`
    : `M ${x2 - head} ${y2 - dir * head} L ${x2} ${y2} L ${x2 + head} ${y2 - dir * head}`;

  // Controlepunt haaks op de looprichting: dat geeft een vloeiende boog in
  // plaats van een rechte lijn, zonder dat de richting onduidelijk wordt.
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const cx = horizontal ? mx : mx + bocht;
  const cy = horizontal ? my - bocht : my;

  const lijn = bocht
    ? `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
    : `M ${x1} ${y1} L ${x2} ${y2}`;

  return (
    <g>
      <path
        d={lijn}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
      />
      <path
        d={headPath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

/** Losse regel tekst in het schema (bronnen, uitkomsten). */
export function Item({
  x,
  y,
  children,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontFamily={SCHEMA_FONT}
      fontSize={10.5}
      fill="var(--color-ink-2)"
    >
      {children}
    </text>
  );
}

/**
 * Omhulsel. `title`/`desc` staan er niet voor de sier: schermlezers en
 * AI-crawlers lezen het schema daardoor als tekst, en dat is precies het beeld
 * dat de site van zichzelf wil geven.
 */
export function Schema({
  viewBox,
  title,
  desc,
  children,
  className,
}: {
  viewBox: string;
  title: string;
  desc: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg
      viewBox={viewBox}
      role="img"
      aria-label={title}
      className={className}
      style={{ width: "100%", height: "auto" }}
    >
      <title>{title}</title>
      <desc>{desc}</desc>
      {children}
    </svg>
  );
}

/** Schema met bijschrift. Het bijschrift is copy, geen decoratie. */
export function Figure({
  children,
  caption,
  className,
}: {
  children: ReactNode;
  caption?: ReactNode;
  className?: string;
}) {
  return (
    <figure className={className}>
      {children}
      {caption && (
        <figcaption className="mt-4 border-t border-rule pt-3 text-meta leading-relaxed text-ink-3">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
