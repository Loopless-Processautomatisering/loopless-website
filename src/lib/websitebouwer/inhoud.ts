// De inhoud van `/over` uit de websitebouwer van het Siteup-portaal (portaal fase 60).
//
// Overgenomen uit de klantsite-template (`src/lib/websitebouwer/inhoud.ts`), met drie verschillen:
//   - geen `tenant_stijl`: Loopless rendert in zijn eigen vaste ontwerp en heeft geen stijlrij;
//   - geen proefbestand als terugval: zonder koppeling, zonder pagina of bij een live leesfout
//     rendert `/over` de pagina zoals hij was (`over/huidige-pagina.tsx`, oude blokken);
//   - `bepaalWeergave` beslist dat, los van Next, zodat elke tak in een test staat.
//
// DE BRON: de tabellen `pages` en `page_sections` van het portaal (mig 0082). Live rechtstreeks
// met de anonieme sleutel, gecachet met dezelfde tag als de blokken (`tenant:<id>:content`), dus
// de publiceer-webhook (`/api/revalidate`) ververst beide. In voorbeeldmodus (draft-mode) het
// concept via het portaal (`PORTAAL_BFF_URL`), dat ook de blokken levert.

import { cache } from "react";
import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { renderbareSecties, type Sectiesleutel } from "@/secties/schema";

/** Eén sectie op een pagina: de live kolommen van een `page_sections`-rij. */
export type SectieRij = {
  id: string;
  type_sleutel: string;
  sort_order: number;
  enabled: boolean;
  inhoud: Record<string, unknown>;
};

export type PaginaRij = { path: string; label: string; secties: SectieRij[] };

export type SiteInhoud = { paginas: PaginaRij[] };

// De live stand van één klant. Alleen BENOEMDE live kolommen, nooit `*`: één conceptkolom in de
// select weigert de hele query voor de anonieme rol.
//
// ⚠️ EEN LEESFOUT GOOIT, en wordt dus niet gecachet. `bepaalWeergave` vangt hem op en valt terug;
// een lege lijst zou anders met `cacheLife("max")` als "geen pagina's" blijven staan.
async function leesLiveInhoud(tenantId: string, url: string, anonKey: string): Promise<SiteInhoud> {
  "use cache";
  cacheLife("max");
  cacheTag(`tenant:${tenantId}:content`);

  const supabase = createClient(url, anonKey);
  const [paginas, secties] = await Promise.all([
    supabase.from("pages").select("id, path, label").eq("tenant_id", tenantId),
    supabase
      .from("page_sections")
      .select("id, page_id, type_sleutel, sort_order, enabled, inhoud")
      .eq("tenant_id", tenantId),
  ]);
  const fout = paginas.error ?? secties.error;
  if (fout) throw new Error(`de inhoud kon niet worden gelezen: ${fout.message}`);

  return {
    paginas: (paginas.data ?? []).map((p) => ({
      path: p.path as string,
      label: p.label as string,
      secties: (secties.data ?? [])
        .filter((s) => s.page_id === p.id)
        .map((s) => ({
          id: s.id as string,
          type_sleutel: s.type_sleutel as string,
          // numeric komt als tekst uit PostgREST.
          sort_order: Number(s.sort_order),
          enabled: s.enabled as boolean,
          inhoud: (s.inhoud ?? {}) as Record<string, unknown>,
        })),
    })),
  };
}

// Het concept via het portaal: concept over live, `pending_delete` weg, `pending_insert` erbij.
//
// ⚠️ EEN FOUT GOOIT, ook hier geen terugval (Codex-ronde 46): stil de oude pagina tonen zou de
// klant laten denken dat hij zijn concept ziet. In voorbeeldmodus ziet hij dan een foutpagina.
const leesVoorbeeldInhoud = cache(async (tenantId: string): Promise<SiteInhoud> => {
  // Geheim in de kop, nooit in het adres: een querystring belandt in logs.
  const res = await fetch(`${process.env.PORTAAL_BFF_URL}?tenantId=${tenantId}`, {
    cache: "no-store",
    headers: { "X-Preview-Secret": process.env.PORTAAL_PREVIEW_SECRET ?? "" },
  });
  if (!res.ok) {
    throw new Error(`[websitebouwer] het voorbeeld kon niet worden gelezen: het portaal gaf ${res.status}`);
  }
  const json = (await res.json()) as { paginas?: unknown };
  if (!Array.isArray(json.paginas)) {
    throw new Error("[websitebouwer] het voorbeeld kon niet worden gelezen: het portaal levert geen pagina's");
  }
  return { paginas: json.paginas as PaginaRij[] };
});

export function vindPagina(inhoud: SiteInhoud, path: string): PaginaRij | null {
  return inhoud.paginas.find((p) => p.path === path) ?? null;
}

/**
 * De secties die de bezoeker ziet, in volgorde: uitgeschakelde vallen weg, de rest op
 * `sort_order`, bij gelijke volgorde op id.
 */
export function zichtbareSecties(pagina: PaginaRij): SectieRij[] {
  return pagina.secties
    .filter((s) => s.enabled)
    .sort((a, b) => a.sort_order - b.sort_order || a.id.localeCompare(b.id));
}

export type Weergave =
  | { soort: "secties"; secties: (SectieRij & { type_sleutel: Sectiesleutel })[] }
  | { soort: "terugval"; reden: "geen koppeling" | "pagina ontbreekt" | "leesfout" };

/**
 * Secties of de pagina zoals hij was. De regels (60-OVERZICHT):
 *   - terugval bij geen koppeling, een ontbrekende pagina, of een fout bij het LIVE lezen; met
 *     een melding `[websitebouwer] terugval …`;
 *   - een fout bij het lezen van het CONCEPT gooit;
 *   - een pagina met nul zichtbare secties is leeg, geen terugval (anders verschijnt stil de
 *     oude pagina als de klant alles uitzet);
 *   - een onbekend sectietype valt weg met een melding.
 */
export async function bepaalWeergave(
  path: string,
  bron: {
    koppeling: boolean;
    concept: boolean;
    leesLive: () => Promise<SiteInhoud>;
    leesConcept: () => Promise<SiteInhoud>;
  },
  meld: (bericht: string) => void = console.error,
  waarschuw: (bericht: string) => void = console.warn,
): Promise<Weergave> {
  if (!bron.koppeling) {
    meld(`[websitebouwer] terugval ${path}: geen portaalkoppeling`);
    return { soort: "terugval", reden: "geen koppeling" };
  }
  let inhoud: SiteInhoud;
  if (bron.concept) {
    inhoud = await bron.leesConcept();
  } else {
    try {
      inhoud = await bron.leesLive();
    } catch (e) {
      meld(`[websitebouwer] terugval ${path}: ${e instanceof Error ? e.message : String(e)}`);
      return { soort: "terugval", reden: "leesfout" };
    }
  }
  const pagina = vindPagina(inhoud, path);
  if (!pagina) {
    meld(`[websitebouwer] terugval ${path}: de pagina bestaat niet in het portaal`);
    return { soort: "terugval", reden: "pagina ontbreekt" };
  }
  return { soort: "secties", secties: renderbareSecties(zichtbareSecties(pagina), waarschuw) };
}

/**
 * De weergave voor deze bezoeker. `draftMode()` wordt BUITEN elke `'use cache'` gelezen
 * (Next 16), net als in `lib/supabase/content.ts`.
 */
export async function getWeergave(path: string): Promise<Weergave> {
  const tenantId = process.env.TENANT_ID;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const koppeling = Boolean(tenantId && url && anonKey);
  const { isEnabled } = await draftMode();
  return bepaalWeergave(path, {
    koppeling,
    concept: isEnabled,
    leesLive: () => leesLiveInhoud(tenantId!, url!, anonKey!),
    leesConcept: () => leesVoorbeeldInhoud(tenantId!),
  });
}
