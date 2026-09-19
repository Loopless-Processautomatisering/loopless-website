// Loopless design system — primitieven.
//
// Bewust géén Card-component. De oude site bouwde elke sectie van elke pagina uit
// hetzelfde afgeronde-doos-met-donkere-vulling-blok; die verleiding hoort er
// structureel uit. Ritme komt van witruimte en hairlines, niet van dozen.
//
// Alles hier is een server component. Geen "use client" tenzij er echt state is.

import { createElement } from "react";
import type { ReactNode, ElementType } from "react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Layout                                                                      */
/* -------------------------------------------------------------------------- */

export function Section({
  children,
  className,
  rule = false,
  tint = false,
  width = "page",
  as: Tag = "section",
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Hairline bovenaan als scheiding met de vorige sectie. */
  rule?: boolean;
  /** Tintvlak. Max één per pagina — anders wordt het weer een blokkenstapel. */
  tint?: boolean;
  width?: "page" | "prose";
  as?: ElementType;
  id?: string;
}) {
  return createElement(
    Tag,
    {
      id,
      className: cn(
        "py-16 md:py-24",
        tint && "bg-paper-2",
        rule && "border-t border-rule",
        className,
      ),
    },
    <div
      className={cn(
        "mx-auto px-4 md:px-10",
        width === "prose" ? "max-w-prose" : "max-w-page",
      )}
    >
      {children}
    </div>,
  );
}

/** Hairline, optioneel met een label erin (vervangt de gradient-dividers). */
export function Rule({ label, className }: { label?: string; className?: string }) {
  if (!label) return <hr className={cn("border-0 border-t border-rule", className)} />;
  return (
    <div className={cn("flex items-center gap-4", className)} role="separator">
      <span className="text-meta font-medium tracking-wide text-ink-3">{label}</span>
      <span className="h-px flex-1 bg-rule" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tekst                                                                       */
/* -------------------------------------------------------------------------- */

/** Klein label boven een kop. Vervangt kickers, pills en chips. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("mb-4 text-meta font-medium tracking-wide text-ink-3", className)}>
      {children}
    </p>
  );
}

/**
 * Typografie-scope voor lopende tekst. Vervangt de losse H2/P-helpers die op
 * privacy, artikel en diensten elk hun eigen classes meesleepten.
 */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "max-w-prose",
        "[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:text-h2 [&_h2]:font-medium",
        "[&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:font-sans [&_h3]:text-h3 [&_h3]:font-semibold",
        "[&_p]:mb-5 [&_p]:text-ink-2",
        "[&_ul]:mb-5 [&_ul]:space-y-2 [&_ul]:pl-5 [&_ul]:text-ink-2 [&_li]:list-disc",
        "[&_ol]:mb-5 [&_ol]:space-y-2 [&_ol]:pl-5 [&_ol]:text-ink-2 [&_li]:marker:text-ink-3",
        "[&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-accent-ink",
        "[&_strong]:font-semibold [&_strong]:text-ink",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Citaat met bron. Vervangt de highlight-blokken op /diensten. */
export function PullQuote({ children, bron }: { children: ReactNode; bron?: string }) {
  return (
    <figure className="my-8 border-l-2 border-accent pl-6">
      <blockquote className="font-heading text-lead leading-snug text-ink">{children}</blockquote>
      {bron && <figcaption className="mt-3 text-meta text-ink-3">{bron}</figcaption>}
    </figure>
  );
}

/* -------------------------------------------------------------------------- */
/* Lijsten                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Redactionele genummerde lijst: cijfer in de goot, in de serif.
 * Vervangt de ProblemCards, de aanpak-timeline en het vervangt-blok — drie
 * plekken die nu elk hun eigen kaartvariant hadden.
 */
export function NumberedList({
  items,
  className,
  columns = 1,
}: {
  items: { title: string; description?: ReactNode }[];
  className?: string;
  columns?: 1 | 2 | 3;
}) {
  return (
    <ol
      className={cn(
        "grid gap-x-10 gap-y-10",
        columns === 3 && "md:grid-cols-3",
        columns === 2 && "md:grid-cols-2",
        className,
      )}
    >
      {items.map((item, i) => (
        <li key={item.title} className="border-t border-rule pt-5">
          <span
            aria-hidden
            className="mb-3 block font-heading text-h3 leading-none text-ink-3"
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="mb-2 font-sans text-h3 font-semibold text-ink">{item.title}</h3>
          {item.description && (
            <div className="text-ink-2">{item.description}</div>
          )}
        </li>
      ))}
    </ol>
  );
}

/** dt/dd in twee kolommen. Voor "Voor wie", casefeiten, contactgegevens. */
export function DefinitionList({
  items,
  className,
}: {
  items: { term: string; value: ReactNode }[];
  className?: string;
}) {
  return (
    <dl className={cn("divide-y divide-rule border-y border-rule", className)}>
      {items.map((item) => (
        <div key={item.term} className="grid gap-1 py-4 md:grid-cols-[12rem_1fr] md:gap-6">
          <dt className="text-meta font-medium tracking-wide text-ink-3">{item.term}</dt>
          <dd className="text-ink-2">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* -------------------------------------------------------------------------- */
/* Interactie                                                                  */
/* -------------------------------------------------------------------------- */

type ButtonProps = {
  children: ReactNode;
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
};

/**
 * Knop. Rechthoekig, 2px radius, geen schaduw en geen verplaatsing bij hover —
 * alleen kleur. Dat is de hele interactietaal van de site.
 */
export function Button({ children, href, variant = "primary", className }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-[2px] px-5 py-3 text-small font-medium";
  const styles =
    variant === "primary"
      ? "bg-accent text-paper hover:bg-accent-ink"
      : "border border-rule-strong text-ink hover:border-ink hover:text-ink";
  return (
    <a href={href} className={cn(base, styles, className)}>
      {children}
    </a>
  );
}

/** Tekstlink met pijl als tekst, niet als icoon. Vervangt de lucide-ArrowRight. */
export function TextLink({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group inline-flex items-baseline gap-1.5 font-medium text-accent",
        "underline underline-offset-4 decoration-rule-strong",
        "hover:text-accent-ink hover:decoration-accent-ink",
        className,
      )}
    >
      {children}
      <span aria-hidden className="text-ink-3 group-hover:text-accent-ink">
        &rarr;
      </span>
    </a>
  );
}
