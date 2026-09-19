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
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  label: string[];
  accent?: boolean;
  muted?: boolean;
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
        rx={2}
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
}: {
  from: [number, number];
  to: [number, number];
  accent?: boolean;
}) {
  const stroke = accent ? "var(--color-accent)" : "var(--color-rule-strong)";
  const [x1, y1] = from;
  const [x2, y2] = to;
  const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  const dir = horizontal ? Math.sign(x2 - x1) : Math.sign(y2 - y1);
  const head = 4.5;

  const headPath = horizontal
    ? `M ${x2 - dir * head} ${y2 - head} L ${x2} ${y2} L ${x2 - dir * head} ${y2 + head}`
    : `M ${x2 - head} ${y2 - dir * head} L ${x2} ${y2} L ${x2 + head} ${y2 - dir * head}`;

  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1} />
      <path d={headPath} fill="none" stroke={stroke} strokeWidth={1} strokeLinecap="round" />
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
