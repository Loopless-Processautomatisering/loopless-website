import type { ComponentType } from "react";
import { Intro } from "./intro";
import { Oproep } from "./oproep";
import { Resultaat } from "./resultaat";
import { Tekst } from "./tekst";
import type { SectieProps, Sectiesleutel } from "./schema";

/** Elk sectietype uit `schema.ts` met zijn component. TypeScript dwingt af dat ze gelijk lopen. */
export const SECTIECOMPONENTEN: Record<Sectiesleutel, ComponentType<SectieProps>> = {
  intro: Intro,
  tekst: Tekst,
  resultaat: Resultaat,
  oproep: Oproep,
};
