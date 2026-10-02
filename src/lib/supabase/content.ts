import { draftMode } from "next/headers";
import { cacheLife, cacheTag } from "next/cache";
import { createClient } from "@supabase/supabase-js";

// Leesbaar voor de paginas: een blok is uiteindelijk tekst of een (publieke) foto-URL,
// gesleuteld op de slug (deel na de "/" in de portal-key page/slug).
export type ContentBlock = {
  slug: string;
  type: "text" | "image";
  text_value: string | null;
  image_url: string | null;
};

// Rauwe blok-shape zoals beide bronnen (anon-Supabase EN portal-BFF) hem leveren:
// key = "page/slug", image_url = STORAGE-PATH (geen URL). De BFF heeft draft al over
// live gemerged, dus beide paden consumeren dezelfde velden.
type RawBlock = {
  key: string;
  type: string;
  text_value: string | null;
  image_url: string | null;
};

// De portal bewaart in image_url een storage-PATH ({tenant_id}/...), niet een URL.
// Bouw de publieke URL uit het pad. Bucket tenant-assets is public (9-01).
function toPublicUrl(path: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path; // defensief: al een absolute URL
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/tenant-assets/${path}`;
}

// Published-pad: anon-read (cookieless) uit het portal-project. Leest de LIVE kolommen
// van álle rijen; drafts zijn column-level afgeschermd in het portaal (mig 0022), niet
// meer via een row-filter. Zo valt een blok in draft-status niet terug op de
// code-placeholder maar toont het z'n laatst-gepubliceerde waarde (ISS-004).
// 'use cache' + lange cacheLife + per-tenant cacheTag → revalidatie via de
// publish-webhook (9-05). draftMode() wordt BEWUST buiten deze cache-scope gelezen.
async function getPublishedBlocks(tenantId: string): Promise<RawBlock[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`tenant:${tenantId}:content`);

  // Zonder Supabase-gegevens (bv. een verse checkout zonder .env.local) niet crashen maar
  // de standaardteksten uit de code tonen.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.warn("[content] geen Supabase-gegevens in .env.local: standaardteksten uit de code");
    return [];
  }

  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("content_blocks")
    .select("key, type, text_value, image_url")
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("[content] getPublishedBlocks failed:", error.message);
    return [];
  }
  return (data ?? []) as RawBlock[];
}

// Draft-pad: via de portal-BFF (service-role, draft-over-live al gemerged). no-store,
// want drafts veranderen bij elke save. Shape { tenantId, blocks, collections } as-is.
async function getDraftBlocks(tenantId: string): Promise<RawBlock[]> {
  // Secret in de X-Preview-Secret-header, nooit in de URL (A-01/4.1-06): query-strings
  // belanden in logs/history. Server-to-server fetch, dus een header kan gewoon;
  // tenantId is geen secret en mag in de query blijven.
  const url = `${process.env.PORTAAL_BFF_URL}?tenantId=${tenantId}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "X-Preview-Secret": process.env.PORTAAL_PREVIEW_SECRET ?? "" },
  });
  if (!res.ok) {
    console.error("[content] getDraftBlocks failed:", res.status);
    return [];
  }
  const json = (await res.json()) as { blocks?: RawBlock[] };
  return json.blocks ?? [];
}

export async function getBlocksByPage(
  page: string,
): Promise<Record<string, ContentBlock>> {
  // Request-API: BUITEN elke 'use cache'-scope lezen (Next 16 pitfall). Bepaalt of we
  // de gecachte published-tak of de no-store draft-tak nemen.
  const { isEnabled } = await draftMode();
  const tenantId = process.env.TENANT_ID ?? "";

  const raw = isEnabled
    ? await getDraftBlocks(tenantId)
    : await getPublishedBlocks(tenantId);

  // Geen page-kolom meer in het portal-schema: page/slug zit in de key.
  const result: Record<string, ContentBlock> = {};
  for (const b of raw) {
    const slashIndex = b.key.indexOf("/");
    if (slashIndex === -1) continue;
    const blockPage = b.key.slice(0, slashIndex);
    const slug = b.key.slice(slashIndex + 1);
    if (blockPage !== page || !slug) continue;
    result[slug] = {
      slug,
      type: b.type === "image" ? "image" : "text",
      text_value: b.text_value,
      image_url: toPublicUrl(b.image_url),
    };
  }
  return result;
}

export function blockText(
  blocks: Record<string, ContentBlock>,
  slug: string,
  fallback: string,
): string {
  return blocks[slug]?.text_value ?? fallback;
}

export function blockImage(
  blocks: Record<string, ContentBlock>,
  slug: string,
  fallback: string,
): string {
  return blocks[slug]?.image_url ?? fallback;
}

// ============================================================================
// Collecties — herhaalbare items (projecten/diensten/portfolio) met titel +
// tekst + foto, in een door de klant bepaalde volgorde. Zelfde draft/published-
// splitsing als de blocks hierboven. De portaal-CRUD (Phase 5) en de BFF-draft-
// merge (10-04) leverden dit al; dit is de ontbrekende render-kant.
// ============================================================================

// Eén item van een collectie zoals de pagina's het consumeren: image_url is hier
// al een publieke URL (toPublicUrl toegepast), sort_order al een number.
export type CollectionItem = {
  id: string;
  title: string | null;
  text: string | null;
  image_url: string | null;
  sort_order: number;
};

// Rauwe item-shape zoals beide bronnen (anon-Supabase EN portal-BFF) hem leveren:
// image_url = STORAGE-PATH (geen URL), sort_order kan string zijn (DB-numeric via
// PostgREST). De BFF heeft draft al over live gemerged én gesorteerd.
type RawCollectionItem = {
  id: string;
  title: string | null;
  text: string | null;
  image_url: string | null;
  sort_order: number | string | null;
};

type RawCollection = {
  key: string;
  title: string | null;
  items: RawCollectionItem[];
};

// Published-pad voor collecties: anon-read (cookieless) uit het portal-project.
// Leest de LIVE kolommen van collections + nested collection_items (mig 0022 laat
// anon de live-kolommen van álle rijen lezen; draft_* is column-level afgeschermd).
// Zelfde cache-tag als de blocks → de publish-webhook (9-05) revalideert beide.
// draftMode() wordt BEWUST buiten deze cache-scope gelezen.
async function getPublishedCollections(
  tenantId: string,
): Promise<RawCollection[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`tenant:${tenantId}:content`);

  // Defensief: zonder portaal-config (verse clone, ontbrekende env) geen crash
  // maar een lege laag → de pagina toont z'n leegstaat. Spiegelt getPublishedBlocks.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[content] Supabase-env ontbreekt — collecties leeg, leegstaat wordt getoond.",
    );
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase
    .from("collections")
    .select(
      // Expliciete FK-hint: sinds portaal-mig 0029 zijn er twee FK's naar collections
      // (composite tenant-FK erbij) → embed zonder hint geeft PGRST201.
      "key, title, collection_items!collection_items_collection_id_fkey (id, title, text, image_url, sort_order)",
    )
    .eq("tenant_id", tenantId);

  if (error) {
    console.error("[content] getPublishedCollections failed:", error.message);
    return [];
  }

  // Untyped anon-client → map de nested shape expliciet naar RawCollection (geen any-lek).
  const rows = (data ?? []) as Array<{
    key: string;
    title: string | null;
    collection_items: RawCollectionItem[] | null;
  }>;
  return rows.map((c) => ({
    key: c.key,
    title: c.title,
    items: c.collection_items ?? [],
  }));
}

// Draft-pad voor collecties: via de portal-BFF (service-role, draft-over-live al
// gemerged én gesorteerd). no-store. Mirrort getDraftBlocks; consumeert json.collections.
async function getDraftCollections(tenantId: string): Promise<RawCollection[]> {
  // Zelfde header-patroon als getDraftBlocks (A-01/4.1-06): secret nooit in de URL.
  const url = `${process.env.PORTAAL_BFF_URL}?tenantId=${tenantId}`;
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "X-Preview-Secret": process.env.PORTAAL_PREVIEW_SECRET ?? "" },
  });
  if (!res.ok) {
    console.error("[content] getDraftCollections failed:", res.status);
    return [];
  }
  const json = (await res.json()) as { collections?: RawCollection[] };
  return json.collections ?? [];
}

// Haal één collectie op z'n key op (published of draft), gemapt naar CollectionItem[]
// en gesorteerd op effectieve volgorde. draftMode() BUITEN de cache-scope (Next 16
// pitfall — zelfde patroon als getBlocksByPage). Lege/onbekende collectie → [].
export async function getCollectionByKey(
  key: string,
): Promise<CollectionItem[]> {
  const { isEnabled } = await draftMode();
  const tenantId = process.env.TENANT_ID ?? "";

  const raw = isEnabled
    ? await getDraftCollections(tenantId)
    : await getPublishedCollections(tenantId);

  const collection = raw.find((c) => c.key === key);
  if (!collection) return [];

  const items = collection.items.map((i) => ({
    id: i.id,
    title: i.title,
    text: i.text,
    image_url: toPublicUrl(i.image_url),
    sort_order: Number(i.sort_order ?? 0),
  }));

  // Sorteer op sort_order (decision 05-01): de published-tak komt ongesorteerd uit de
  // anon-read; de draft-tak is al BFF-gesorteerd, dus deze sort is daar idempotent.
  items.sort((a, b) => a.sort_order - b.sort_order);
  return items;
}
