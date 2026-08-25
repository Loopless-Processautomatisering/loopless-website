// GEGENEREERD uit siteup-portaal src/lib/seed/manifest.ts — niet met de hand bewerken.
// Sync bij elke validator-wijziging; controleer met de git blob-hash (zie SETUP.md).

/**
 * Het content-manifest: het bestandsformaat dat het per-klant seed-script
 * vervangt (24-04). Een manifest beschrijft de volledige portaal-inhoud van één
 * klantsite — blokken, collecties en items — als data, zodat de seeder (24-05)
 * één motor is in plaats van een script per klant.
 *
 * **Het manifest woont in de klantsite-repo**, naast de code met de fallbacks:
 * de waarden ín het manifest zíjn die fallbacks, dus één PR wijzigt beide en
 * drift is zichtbaar. Deze repo bezit het bestand niet, hij leest het.
 *
 * `validateManifest()` controleert wat 21-KEYS.md nu in proza waarschuwt. Elke
 * regel komt uit een echte vondst; de reden staat bij de regel.
 */

/** Blok-type uit `content_blocks.type`. Bij `image` blijft de waarde leeg. */
export type ManifestBlockType = "text" | "image";

export type ManifestBlock = {
  /** `pagina/sectie_veld`; de prefix vóór de `/` wordt de paneelpagina. */
  key: string;
  /** `Sectie — veld`; het deel vóór de em-dash wordt de paneelsectie. */
  label: string;
  /** De NL-waarde. Leeg bij een image-blok: de klant uploadt zelf. */
  value?: string;
  /** Default `text`. */
  type?: ManifestBlockType;
  /** Weergavevolgorde in het paneel (editor-only, mig 0021). */
  sortOrder?: number;
  /**
   * Sleutel van de sectie waar dit blok in hoort (manifest v2, mig 0057).
   * Afwezig = "nog niet ingedeeld" -> `section_id` blijft null en de consument
   * valt terug op het raadpad uit sleutelnamen.
   */
  section?: string;
  /** Bedrag-veld: het €-teken zit in de layout, niet in de waarde (21-02). */
  amount?: boolean;
  /** Randspatie is betekenisvol, geen slip (21-03). */
  keepWhitespace?: boolean;
};

export type ManifestItem = {
  title?: string;
  text?: string;
  /** Pad naar een bestand in de klantsite-repo, bv. `public/assets/foto.jpg`. */
  image?: string;
  /**
   * Stabiele itemsleutel (mig 0055, ISS-035). Optioneel, maar alles-of-niets per
   * collectie. Zonder keys matcht de seeder positioneel — het oude pad, dat blijft
   * bestaan voor elke tenant zonder manifest-keys. Nooit klantbewerkbaar: de key
   * komt uit het manifest en verschijnt niet in het paneel.
   */
  key?: string;
};

export type ManifestCollection = {
  /** Uniek binnen de tenant. */
  key: string;
  title: string;
  /** Toont het tekstveld per item in het paneel (`collections.show_item_text`). */
  showItemText?: boolean;
  /** Toont het fotoveld per item in het paneel (`collections.show_item_image`). */
  showItemImage?: boolean;
  items: ManifestItem[];
  /** Zie `ManifestBlock.section`. */
  section?: string;
};

/**
 * Een sectie: de expliciete structuurlaag van manifest v2 (mig 0057, v2.4 brok C).
 * Het manifest is de AUTEUR van de structuur, de database de runtime-waarheid —
 * daarom staan de regels hieronder in `validateManifest()` en niet als DB-check:
 * een check die midden in een schrijvende seeder-run hard faalt, laat de klant
 * met een half gemigreerde structuur achter.
 */
export type ManifestSection = {
  /** Tenant-BREED uniek (0057: `unique (tenant_id, key)`); `pagePath` telt niet mee. */
  key: string;
  /** Wat de klant in het paneel leest. NOT NULL in de DB. */
  label: string;
  /** `null` = site-breed (pop-up, bedrijfsgegevens). */
  pagePath: string | null;
  /**
   * Naam van de pagina. NOT NULL in de DB, óók bij `pagePath: null` — die groep
   * heeft óók een naam nodig (precies wat `PAGE_LABELS` nu doet).
   */
  pageLabel: string;
  /** Wordt B-01 (sectie-anker op de klantsite). */
  anchor?: string;
  /** Volgorde binnen de pagina. Integer: sectievolgorde is seeder-eigendom. */
  sortOrder: number;
  /** Mag de klant deze sectie aan/uit zetten? DB-default `false`. */
  canToggle?: boolean;
  /** Staat de sectie aan? DB-default `true`. */
  enabled?: boolean;
};

export type Manifest = {
  tenant: {
    name: string;
    slug: string;
    origin: string;
    siteType: "nextjs" | "static";
    /**
     * Waar de bedrijfsgegevens (NAP) vandaan komen. `portal` (default) betekent
     * dat de klantsite ze uit `site/nap_*`-blokken leest en dat die blokken dus
     * verplicht zijn (24-02 / ISS-016). `code` betekent dat de site ze hardcodeert
     * en het portaal ze niet bezit; dan is een ontbrekend NAP-blok geen fout maar
     * een waarschuwing.
     *
     * Waarom expliciet en niet geraden (35-02): `REQUIRED_NAP_KEYS` is geschreven
     * tegen bushido, de enige van de drie tenants die de blokken hééft — loopless
     * en moonsvp hebben er nul en renderen NAP uit hun eigen code. De vlag NIET
     * afleiden uit `siteType`: dat moonsvp static is en de rest nextjs, is
     * correlatie in een steekproef van drie (28-02-regel). Default `portal` houdt
     * de regel hard voor elke bestaande en nieuwe klantsite die niets declareert.
     */
    napSource?: "portal" | "code";
  };
  blocks: ManifestBlock[];
  collections: ManifestCollection[];
  /**
   * Manifest v2. Afwezig blijft een geldig v1-manifest: dan blijft `section_id`
   * overal null en verandert er niets aan het gedrag (mig 0057 is gedragsneutraal
   * by design).
   */
  sections?: ManifestSection[];
};

/** Eén bevinding. `path` wijst de plek aan, zodat repareren geen zoektocht is. */
export type Issue = {
  code: string;
  path: string;
  message: string;
};

export type ValidationResult = {
  /** Seeden mag niet doorgaan. */
  errors: Issue[];
  /** Seeden mag wel, maar de kwaliteit lijdt. */
  warnings: Issue[];
};

/**
 * De bedrijfsgegevens die élke klantsite nodig heeft (24-02). `site/nap_maps_url`
 * en `site/nap_mobiel` staan er bewust níét bij: de code leidt de Maps-link zelf
 * uit het adres af, en een tweede telefoonnummer heeft lang niet elke klant.
 */
export const REQUIRED_NAP_KEYS = [
  "site/nap_straat",
  "site/nap_postcode",
  "site/nap_plaats",
  "site/nap_telefoon",
  "site/nap_email",
] as const;

/** Telefoon-keys waarvan de waarde een belbare link moet opleveren. */
const PHONE_KEYS = ["site/nap_telefoon", "site/nap_mobiel"];

/** De em-dash die 18-04 tussen sectie en veld zet; group.ts splitst hierop. */
const EM_DASH = "—";

const VALID_TYPES: ManifestBlockType[] = ["text", "image"];

/**
 * Controleer een manifest mechanisch. Throwt nooit — een validator die throwt
 * geeft je één fout per run in plaats van alle.
 */
export function validateManifest(manifest: Manifest): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];

  const blocks = Array.isArray(manifest?.blocks) ? manifest.blocks : [];
  const collections = Array.isArray(manifest?.collections)
    ? manifest.collections
    : [];

  // -----------------------------------------------------------------------
  // Secties (manifest v2, mig 0057). Twee van de regels hieronder zijn door
  // `0057_sections.sql` EXPLICIET hierheen doorgeschoven in plaats van als
  // DB-check gelegd (r47 en r78-82): een check die tijdens de seeder-run afgaat,
  // faalt midden in een schrijvende transactie en laat de klant met een half
  // gemigreerde structuur achter. De beoordeling "is deze structuur zinnig"
  // hoort vóór de run, hier.
  //
  // `sections` afwezig is een geldig v1-manifest: nul secties, nul nieuwe fouten,
  // `section_id` blijft overal null en de consument valt terug op het raadpad.
  // -----------------------------------------------------------------------
  const sections = Array.isArray(manifest?.sections) ? manifest.sections : [];
  const declaredSections = new Set<string>();
  // Eén pagina heeft één naam; page_label staat gedenormaliseerd op elke sectierij.
  const pageLabelByPath = new Map<string, string>();
  // Groepssleutel voor de volgorde: het paginapad, of — bij een site-brede sectie
  // — het paginalabel, want twee site-brede groepen (pop-up, bedrijfsgegevens)
  // zijn echt verschillende groepen en mogen elkaars volgorde niet raken.
  const seenSectionOrders = new Map<string, Set<number>>();

  sections.forEach((section, i) => {
    const at = `sections[${i}]`;
    const key = typeof section?.key === "string" ? section.key : "";
    const label = typeof section?.label === "string" ? section.label : "";
    const pageLabel = typeof section?.pageLabel === "string" ? section.pageLabel : "";
    const pagePath =
      typeof section?.pagePath === "string" && section.pagePath !== ""
        ? section.pagePath
        : null;

    // --- errors ---------------------------------------------------------

    if (key.trim() === "") {
      errors.push({
        code: "SECTION_MISSING_KEY",
        path: `${at}.key`,
        message: `Sectie op positie ${i} heeft geen key. sections.key is NOT NULL met check (key <> '') (mig 0057) — de seed crasht.`,
      });
    } else if (declaredSections.has(key)) {
      errors.push({
        code: "DUPLICATE_SECTION_KEY",
        path: `${at}.key`,
        message: `Sectie "${key}" komt meer dan één keer voor; sections is uniek op (tenant_id, key) — tenant-BREED, dus een ander pagePath maakt hem niet uniek. Bij de upsert overschrijft de laatste de eerste.`,
      });
    }
    if (key.trim() !== "") declaredSections.add(key);

    if (label.trim() === "") {
      errors.push({
        code: "SECTION_MISSING_LABEL",
        path: `${at}.label`,
        message: `Sectie "${key}" heeft geen label. sections.label is NOT NULL met check (label <> '') (mig 0057) — de seed crasht, en de klant zou een naamloze kop in het paneel krijgen.`,
      });
    }

    if (pageLabel.trim() === "") {
      errors.push({
        code: "SECTION_MISSING_PAGE_LABEL",
        path: `${at}.pageLabel`,
        message: `Sectie "${key}" heeft geen pageLabel. sections.page_label is NOT NULL — óók bij pagePath: null: een site-brede groep (pop-up, bedrijfsgegevens) heeft net zo goed een naam nodig in het paneel.`,
      });
    }

    // 0057 r78-82: bewust GEEN DB-check, want die zou midden in een seeder-run
    // hard falen. Zonder deze regel zet één manifest-wijziging een sectie
    // permanent uit: uit én niet schakelbaar = de klant krijgt hem nooit terug.
    const canToggle = section?.canToggle === true;
    if (section?.enabled === false && !canToggle) {
      const waarom =
        section?.canToggle === undefined
          ? "canToggle ontbreekt (DB-default false)"
          : "canToggle staat op false";
      errors.push({
        code: "SECTION_LOCKED_OFF",
        path: `${at}.enabled`,
        message: `Sectie "${key}" staat uit (enabled: false) terwijl ${waarom}. De klant kan hem dan nooit meer aanzetten — de inhoud is alleen met handmatige SQL terug te halen. Zet canToggle: true, of laat de sectie aan staan.`,
      });
    }

    // 0057 r47: de `pages`-tabel is bewust uit de DDL gehouden (page_label staat
    // gedenormaliseerd op de sectierij), dus déze validator bewaakt dat één
    // pagina maar één naam heeft.
    if (pagePath !== null && pageLabel.trim() !== "") {
      const eerder = pageLabelByPath.get(pagePath);
      if (eerder === undefined) {
        pageLabelByPath.set(pagePath, pageLabel);
      } else if (eerder !== pageLabel) {
        errors.push({
          code: "PAGE_LABEL_CONFLICT",
          path: `${at}.pageLabel`,
          message: `Pagina "${pagePath}" heet hier "${pageLabel}" en eerder "${eerder}". page_label staat op elke sectierij apart (mig 0057, bewust geen pages-tabel); met twee namen noemt het paneel de pagina anders al naar gelang welke sectie het laatst geschreven is.`,
        });
      }
    }

    // --- warnings -------------------------------------------------------

    const groep = pagePath ?? `(site-breed) ${pageLabel}`;
    if (typeof section?.sortOrder === "number") {
      const orders = seenSectionOrders.get(groep) ?? new Set<number>();
      if (orders.has(section.sortOrder)) {
        warnings.push({
          code: "SECTION_SORT_ORDER_COLLISION",
          path: `${at}.sortOrder`,
          message: `Pagina "${groep}" heeft sortOrder ${section.sortOrder} al in gebruik; twee secties op dezelfde plek verspringen in het paneel.`,
        });
      }
      orders.add(section.sortOrder);
      seenSectionOrders.set(groep, orders);
    }
  });

  const seenKeys = new Set<string>();
  // pagina → gebruikte sort_orders, want de volgorde geldt binnen een pagina.
  const seenOrders = new Map<string, Set<number>>();

  blocks.forEach((block, i) => {
    const at = `blocks[${i}]`;
    const key = typeof block?.key === "string" ? block.key : "";
    const label = typeof block?.label === "string" ? block.label : "";
    const value = typeof block?.value === "string" ? block.value : undefined;
    const type = block?.type ?? "text";

    // --- errors ---------------------------------------------------------

    if (label.trim() === "") {
      errors.push({
        code: "MISSING_LABEL",
        path: `${at}.label`,
        message: `Blok "${key}" heeft geen label. content_blocks.label is NOT NULL (mig 0031) — de seed crasht.`,
      });
    }

    if (seenKeys.has(key)) {
      errors.push({
        code: "DUPLICATE_KEY",
        path: `${at}.key`,
        message: `Key "${key}" komt meer dan één keer voor; bij de upsert op (tenant_id, key) overschrijft de laatste de eerste.`,
      });
    }
    seenKeys.add(key);

    // Geen `/`, of een `/` helemaal vooraan (lege paginanaam).
    const slash = key.indexOf("/");
    if (slash < 1) {
      errors.push({
        code: "KEY_WITHOUT_PAGE",
        path: `${at}.key`,
        message: `Key "${key}" heeft geen paginadeel (\`pagina/sectie_veld\`) en belandt onder "Overig" in het paneel.`,
      });
    }

    if (!VALID_TYPES.includes(type)) {
      errors.push({
        code: "INVALID_TYPE",
        path: `${at}.type`,
        message: `Blok "${key}" heeft type "${String(type)}"; content_blocks.type kent alleen "text" en "image".`,
      });
    }

    if (type === "image" && value !== undefined && value !== "") {
      errors.push({
        code: "IMAGE_WITH_TEXT",
        path: `${at}.value`,
        message: `Image-blok "${key}" heeft een waarde. Bij een image-blok blijft text_value leeg — de klant uploadt zelf.`,
      });
    }

    if (block?.amount === true && value?.includes("€")) {
      errors.push({
        code: "CURRENCY_IN_AMOUNT",
        path: `${at}.value`,
        message: `Bedrag "${key}" bevat een €. Het €-teken zit in de layout; "€42,-" seeden geeft "€€42,-" op de site (21-02).`,
      });
    }

    // --- warnings -------------------------------------------------------

    if (label.trim() !== "" && !label.includes(EM_DASH)) {
      warnings.push({
        code: "NO_SECTION_IN_LABEL",
        path: `${at}.label`,
        message: `Label "${label}" heeft geen " — "; het blok wordt z'n eigen sectie in het paneel.`,
      });
    }

    if (value !== undefined && value !== value.trim() && !block?.keepWhitespace) {
      warnings.push({
        code: "UNMARKED_EDGE_WHITESPACE",
        path: `${at}.value`,
        message: `Waarde van "${key}" begint of eindigt met een spatie. Bedoeld? Zet \`keepWhitespace: true\` (21-03). Zo niet: trim 'm.`,
      });
    }

    const page = slash < 1 ? "" : key.slice(0, slash);
    if (block?.sortOrder === undefined) {
      warnings.push({
        code: "SORT_ORDER_MISSING",
        path: `${at}.sortOrder`,
        message: `Blok "${key}" heeft geen sortOrder; de kolom wordt 0 en het veld springt alfabetisch door het paneel (ISS-005).`,
      });
    } else {
      const orders = seenOrders.get(page) ?? new Set<number>();
      if (orders.has(block.sortOrder)) {
        warnings.push({
          code: "SORT_ORDER_COLLISION",
          path: `${at}.sortOrder`,
          message: `Pagina "${page}" heeft sortOrder ${block.sortOrder} al in gebruik; twee velden op dezelfde plek verspringen.`,
        });
      }
      orders.add(block.sortOrder);
      seenOrders.set(page, orders);
    }

    if (PHONE_KEYS.includes(key) && value !== undefined && !isDialable(value)) {
      warnings.push({
        code: "PHONE_NOT_DIALABLE",
        path: `${at}.value`,
        message: `"${value}" is niet naar een tel:-link te normaliseren; de site toont het dan als platte tekst (24-02).`,
      });
    }
  });

  const napInCode = manifest?.tenant?.napSource === "code";
  for (const key of REQUIRED_NAP_KEYS) {
    if (seenKeys.has(key)) continue;
    if (napInCode) {
      warnings.push({
        code: "NAP_IN_CODE",
        path: "blocks",
        message: `Bedrijfsgegeven "${key}" ontbreekt. Dat mag hier, want tenant.napSource is "code": de klantsite hardcodeert de NAP. Prijs: de klant kan dit gegeven niet zelf wijzigen — daarvoor is een codewijziging nodig (ISS-016 / 24-02).`,
      });
    } else {
      errors.push({
        code: "MISSING_NAP",
        path: "blocks",
        message: `Verplicht bedrijfsgegeven "${key}" ontbreekt; zonder dat blok blijft de NAP onbewerkbaar (ISS-016 / 24-02). Leest de site zijn NAP uit eigen code, zet dan tenant.napSource: "code" — dan wordt dit een waarschuwing.`,
      });
    }
  }

  const seenCollectionKeys = new Set<string>();
  collections.forEach((collection, i) => {
    const key = typeof collection?.key === "string" ? collection.key : "";
    if (seenCollectionKeys.has(key)) {
      errors.push({
        code: "DUPLICATE_COLLECTION_KEY",
        path: `collections[${i}].key`,
        message: `Collectie "${key}" komt meer dan één keer voor; collections is uniek op (tenant_id, key).`,
      });
    }
    seenCollectionKeys.add(key);

    // Itemsleutels (mig 0055, ISS-035). Twee regels, allebei een FOUT en geen
    // waarschuwing:
    //  1. uniek binnen de collectie — het partial unique index eist dat, en een
    //     dubbele key zou de seeder-run halverwege laten klappen;
    //  2. alles-of-niets per collectie — een half gekeyde collectie maakt het
    //     matchpad ambigu (deels op key, deels op positie) en is precies de
    //     toestand waarin de fallback stilzwijgend het verkeerde item raakt.
    const items: unknown[] = Array.isArray(collection?.items) ? collection.items : [];
    const keyed: number[] = [];
    const seenItemKeys = new Set<string>();
    items.forEach((rawItem, j) => {
      const itemKey = (rawItem as ManifestItem | null)?.key;
      if (itemKey === undefined || itemKey === null) return;
      if (typeof itemKey !== "string" || itemKey.trim() === "") {
        errors.push({
          code: "INVALID_ITEM_KEY",
          path: `collections[${i}].items[${j}].key`,
          message: `Itemsleutel moet een niet-lege tekst zijn; nu: ${JSON.stringify(itemKey)}.`,
        });
        return;
      }
      keyed.push(j);
      if (seenItemKeys.has(itemKey)) {
        errors.push({
          code: "DUPLICATE_ITEM_KEY",
          path: `collections[${i}].items[${j}].key`,
          message: `Itemsleutel "${itemKey}" komt meer dan één keer voor in collectie "${key}"; collection_items is uniek op (collection_id, item_key).`,
        });
      }
      seenItemKeys.add(itemKey);
    });
    if (keyed.length > 0 && keyed.length < items.length) {
      const zonder = items.map((_, j) => j).filter((j) => !keyed.includes(j));
      errors.push({
        code: "PARTIAL_ITEM_KEYS",
        path: `collections[${i}].items`,
        message:
          `Collectie "${key}" is half gekeyd: ${keyed.length} van ${items.length} items hebben een "key" ` +
          `(zonder key: index ${zonder.join(", ")}). Geef álle items een key of geen enkele — ` +
          `gemengd maakt het matchpad ambigu.`,
      });
    }
  });

  // Verwijzingen naar een niet-gedeclareerde sectie. In één pas ná de loops
  // hierboven, zodat een sectie die verderop in het bestand staat óók telt —
  // de volgorde in het manifest mag hier niets uitmaken.
  if (sections.length > 0) {
    blocks.forEach((block, i) => {
      const ref = block?.section;
      if (typeof ref === "string" && ref !== "" && !declaredSections.has(ref)) {
        errors.push({
          code: "UNKNOWN_SECTION_REF",
          path: `blocks[${i}].section`,
          message: `Blok "${block?.key ?? ""}" verwijst naar sectie "${ref}", die niet in sections staat. De seeder vindt er geen section_id bij; het blok belandt stil op "niet ingedeeld".`,
        });
      }
    });
    collections.forEach((collection, i) => {
      const ref = collection?.section;
      if (typeof ref === "string" && ref !== "" && !declaredSections.has(ref)) {
        errors.push({
          code: "UNKNOWN_SECTION_REF",
          path: `collections[${i}].section`,
          message: `Collectie "${collection?.key ?? ""}" verwijst naar sectie "${ref}", die niet in sections staat. De seeder vindt er geen section_id bij; de lijst belandt stil op "niet ingedeeld".`,
        });
      }
    });

    // SECTION_COVERAGE — het vergeten zichtbaar maken (35-01, valkuil 1 uit
    // 35-RESEARCH). Een tenantmigratie deelt honderd blokken met de hand in;
    // "ik ben er dertig vergeten" ziet er zonder deze regel uit als een groene
    // CI, want een blok zónder `section` is volkomen geldig — het belandt op
    // "niet ingedeeld" en de consument valt terug op het raadpad.
    //
    // WAARSCHUWING en geen fout: tijdens 35-02/35-03/35-04 is een manifest
    // onderweg per definitie tijdelijk half ingedeeld, en een harde fout zou de
    // CI-gate (34-04) op de klantrepo's midden in de migratie rood zetten. De
    // regel moet het werk zichtbaar maken, niet blokkeren.
    //
    // Deze regel staat hier en niet bij de andere warnings in de blokken-loop
    // (r338 e.v.): hij is een AGGREGAAT over alle blokken en collecties samen.
    // Eén waarschuwing per ongedekt blok zou honderd regels ruis geven op precies
    // het moment dat je overzicht nodig hebt.
    //
    // Declareert het manifest géén secties, dan komt deze pas niet eens langs —
    // het `if (sections.length > 0)` hierboven houdt v1-manifesten er buiten.
    const dekt = (ref: unknown) => typeof ref === "string" && ref.trim() !== "";
    const losseBlocks = blocks.filter((b) => !dekt(b?.section));
    const losseCollections = collections.filter((c) => !dekt(c?.section));

    const eerste = (keys: string[]) =>
      keys.slice(0, 5).join(", ") + (keys.length > 5 ? `, … (+${keys.length - 5})` : "");

    if (losseBlocks.length > 0) {
      warnings.push({
        code: "SECTION_COVERAGE",
        path: "blocks",
        message:
          `${losseBlocks.length} van ${blocks.length} blokken hebben geen "section" terwijl het manifest ` +
          `${sections.length} sectie(s) declareert; die belanden op "niet ingedeeld". ` +
          `Eerste: ${eerste(losseBlocks.map((b) => b?.key ?? "(zonder key)"))}.`,
      });
    }

    if (losseCollections.length > 0) {
      warnings.push({
        code: "SECTION_COVERAGE",
        path: "collections",
        message:
          `${losseCollections.length} van ${collections.length} collecties hebben geen "section" terwijl het ` +
          `manifest ${sections.length} sectie(s) declareert; die belanden op "niet ingedeeld". ` +
          `Eerste: ${eerste(losseCollections.map((c) => c?.key ?? "(zonder key)"))}.`,
      });
    }
  }

  return { errors, warnings };
}

/**
 * Bewust ruim: hij vangt alleen wat écht geen nummer is. `phoneHref()` op de
 * klantsite maakt van `0…` een `+31…` en laat `+31…`/`00…` staan; een strengere
 * regel hier zou uit de pas gaan lopen met die implementatie en vals alarm geven.
 */
function isDialable(value: string): boolean {
  const compact = value.replace(/[^\d+]/g, "");
  const digits = compact.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return false;
  return compact.startsWith("+") || digits.startsWith("0");
}
