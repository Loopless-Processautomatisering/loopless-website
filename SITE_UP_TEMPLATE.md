> # ⚠️ VEROUDERD — NIET MEER GEBRUIKEN
>
> Dit document beschrijft het **verlaten** model: een eigen Supabase-project +
> eigen `/beheer`-paneel per klant. Dat is vervangen door één **centraal
> Siteup-portaal** + de **`siteup-klantsite-template`**-repo: één gedeeld
> Supabase/portaal-project voor álle klanten, en per klant alleen een aparte
> Vercel-deploy van de template met 3 env-vars.
>
> **Huidige aanpak → `Broedersai/siteup-klantsite-template/SETUP.md`.**
>
> Hieronder blijft bewaard als historische referentie.

---

# Site UP — Beheerpaneel template

Aanpak om hetzelfde `/beheer` paneel als loopless.nl uit te rollen voor klantsites.

Reference-implementatie: deze repo. Kopieer de patronen 1-op-1 — geen framework, geen abstractie. Voor elke klant: nieuw Next.js project, nieuw Supabase project, hetzelfde recept.

## Wanneer wel / niet

**Wel** voor:
- Marketing sites met statische pagina's (5-15 pagina's)
- Klanten die zelf teksten en foto's willen kunnen aanpassen
- Geen blog, geen dynamische lijsten, geen producten

**Niet** voor:
- Blog of bewerkbare collections (dan content_blocks uitbreiden met een `collections` tabel)
- Meerdere admins / rollen (dan auth-model herzien)
- E-commerce, formulieren met opslag, bookings

## Per klant — checklist

### 1. Supabase project (5 min)

1. Nieuw project aanmaken op supabase.com (West EU, Free tier voor start)
2. Naam: `<klantnaam>-beheer`
3. Project ref noteren — die heb je nodig voor `.mcp.json` en env vars

### 2. Database schema (2 min)

Run deze migratie via Supabase SQL editor of MCP:

```sql
-- content_blocks tabel + RLS
create table public.content_blocks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  page text not null,
  label text not null,
  type text not null check (type in ('text', 'image')),
  text_value text,
  image_url text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
create index content_blocks_page_idx on public.content_blocks (page, sort_order);

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at := now(); return new; end; $$;

create trigger content_blocks_touch_updated_at
before update on public.content_blocks
for each row execute function public.touch_updated_at();

alter table public.content_blocks enable row level security;

create policy "content_blocks public read" on public.content_blocks
for select to anon, authenticated using (true);

-- VERVANG ADMIN EMAIL hieronder!
create policy "content_blocks admin insert" on public.content_blocks
for insert to authenticated
with check ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');

create policy "content_blocks admin update" on public.content_blocks
for update to authenticated
using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE')
with check ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');

create policy "content_blocks admin delete" on public.content_blocks
for delete to authenticated
using ((auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');
```

### 3. Storage bucket (1 min)

```sql
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true);

-- VERVANG ADMIN EMAIL!
create policy "site-images admin insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'site-images' and (auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');

create policy "site-images admin update" on storage.objects
for update to authenticated
using (bucket_id = 'site-images' and (auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE')
with check (bucket_id = 'site-images' and (auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');

create policy "site-images admin delete" on storage.objects
for delete to authenticated
using (bucket_id = 'site-images' and (auth.jwt() ->> 'email') = 'ADMIN_EMAIL_HERE');
```

### 4. Admin user (1 min)

Supabase Dashboard → Auth → Users → Add user → Create new user
- E-mail: het admin-adres dat je in de policies hebt gezet
- Auto Confirm User: aan
- Wachtwoord: laat klant zelf invullen of geef tijdelijke + reset

### 5. Code kopiëren naar klant-repo

Kopieer uit deze repo (loopless):

```
src/lib/supabase/         (volledig — server.ts, client.ts, content.ts)
src/app/beheer/           (volledig — alle pages, layout, actions, editor)
src/proxy.ts
```

Dependencies in package.json toevoegen:
```
@supabase/supabase-js
@supabase/ssr
```

### 6. next.config.ts aanpassen

```ts
images: {
  remotePatterns: [{
    protocol: "https",
    hostname: "<KLANT-PROJECT-REF>.supabase.co",
    pathname: "/storage/v1/object/public/**",
  }],
}
```

### 7. Route group voor publieke pagina's

Verplaats alle publieke pagina's naar `src/app/(site)/` met een eigen `layout.tsx` die de navbar/footer wrapt. Zo heeft `/beheer` geen klant-navbar bovenin.

Root `src/app/layout.tsx` bevat alleen `<html>`, `<body>`, fonts, structured data — geen navbar/footer.

### 8. Content blocks definiëren

Per pagina: maak een lijst van wat beheerbaar moet zijn. Skip headers, knoppen, navigatie — alleen wat de klant écht zelf wil aanpassen (teksten, foto's). Houd het bij ~10-25 blocks per site, anders wordt het paneel onoverzichtelijk.

Naming convention: `<page>_<sectie>_<element>` bijv. `home_hero_title`, `over_team_p1`, `contact_address`.

Seed via SQL:
```sql
insert into public.content_blocks (slug, page, label, type, text_value, sort_order) values
  ('home_hero_title', 'home', 'Hero — titel', 'text', '<huidige tekst>', 10),
  -- etc
```

### 9. Publieke pagina's refactoren

Voor elke pagina die content_blocks gebruikt:
1. Maak server component (`async function`)
2. Roep `getBlocksByPage('home')` aan
3. Gebruik `blockText(blocks, slug, fallback)` voor elke beheerbare tekst — fallback = de oorspronkelijke hardcoded waarde
4. Voor foto's: `blockImage(blocks, slug, fallback)` met fallback naar `/public/` pad

Patroon zie `src/app/(site)/page.tsx` en `src/app/(site)/over/page.tsx` in deze repo.

### 10. Env vars + deploy

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<klant-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable key>
```

Vercel → Settings → Environment Variables → dezelfde vars toevoegen voor Production + Preview.

Deploy → klant kan inloggen op `<klantsite>/beheer`.

## Wat per klant verschilt

| | Verschil per klant |
|---|---|
| Supabase project ref | Ja |
| Admin email (in RLS policies + storage) | Ja |
| Content blocks (slugs, labels, defaults) | Ja |
| Publieke pagina-styling | Volledig anders |
| Beheerpaneel UI (kleuren, typografie) | Optioneel — past bij klant-branding |

## Wat hetzelfde blijft

- DB schema, RLS-patroon, storage policies (alleen email vervangen)
- Supabase clients (`server.ts`, `client.ts`)
- `content.ts` helpers (`getBlocksByPage`, `blockText`, `blockImage`)
- Auth flow, proxy, server actions
- `/beheer` UI structuur (lijst + slug-editor)

## Veelgemaakte valkuilen

- **Vergeten admin email te vervangen** in alle 7 RLS policies — gevolg: niemand kan inloggen of writes worden geweigerd.
- **`revalidateTag` gebruikt** in plaats van `updateTag` — Next 16 vereist `updateTag` in server actions, anders krijg je deprecation warning of build error.
- **`cookies()` binnen `unstable_cache`** — werkt niet. Gebruik anon supabase client (`createClient` uit `@supabase/supabase-js`) voor publieke leesoperaties die gecached worden.
- **Supabase domein vergeten** in `next.config.ts` `remotePatterns` — `<Image>` met storage URL werkt dan niet in productie.
- **Te veel blocks beheerbaar maken** — 50+ blocks maakt het paneel onbruikbaar. Houd het bij essentials.
- **`middleware.ts`** in plaats van `proxy.ts` — Next 16 hernoemde dit, oude naam blijft werken maar geeft deprecation warning.

## Tijdsinschatting per klant

Met dit recept: **2-4 uur** voor een complete setup van een loopless-achtige site (Supabase opzetten, code kopiëren, blocks definiëren, refactoren, deployen). Eerste keer langer; vanaf de tweede klant gaat het sneller.
