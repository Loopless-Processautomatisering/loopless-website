# SEO + GEO Audit — loopless.nl

**Datum:** 2026-05-11
**URL:** https://loopless.nl
**Stack:** Next.js (SSR, statisch gerenderd)
**Pagina's gecrawld:** 6 (volledige sitemap)

---

## Health Score: ~84/100

| Categorie | Score | Gewicht |
|---|---|---|
| Technical SEO | 95 | 22% |
| Content Quality | 80 | 23% |
| On-Page SEO | 75 | 20% |
| Schema / Structured Data | 90 | 10% |
| AI Search Readiness (GEO) | 70 | 10% |
| Images | 100 | 5% |
| Performance (CWV) | N/A | 10% — PSI rate-limited, geen API key |

> Score is berekend zonder Performance. Voor echte CWV-meting: setup Google API key via `python ~/.claude/skills/seo/scripts/google_auth.py` of test handmatig op pagespeed.web.dev.

---

## ✅ Wat goed gaat

- **Technical fundamentals**: robots.txt + sitemap.xml correct ingericht
- **Per-pagina meta tags**: title + description per pagina uniek en relevant
- **Canonical URLs**: aanwezig op alle pagina's
- **Schema.org Organization**: op elke pagina (naam, adres Tiel, contact, founder, sameAs LinkedIn)
- **FAQPage schema** op /faq met 8 vragen — sterk voor AI Overviews + rich results
- **H1 op alle pagina's** (homepage: "Doorbreek de loop van handmatig werk.")
- **Alt-tekst** op alle images (geen lege alts)
- **TTFB < 200ms** op alle pagina's (Vercel edge)
- **Lang="nl"** correct
- **OG + Twitter image** dimensies en types ingevuld
- **Apple-touch-icon, favicon, icon** allemaal aanwezig

---

## 🔴 Critical (fix deze week)

### 1. Twitter Cards op subpagina's tonen homepage content
**Probleem:** `/diensten`, `/cases`, etc. hebben `twitter:title` en `twitter:description` van de homepage:
```html
<meta name="twitter:title" content="Loopless — AI-automatisering voor het MKB"/>
<meta name="twitter:description" content="Loopless automatiseert repetitieve processen..."/>
```

**Impact:** Wanneer iemand een sub-URL deelt op X/Twitter, ziet ontvanger homepage-content i.p.v. de pagina-specifieke content. Verlaagt CTR.

**Fix:** In `metadata` per pagina ook `twitter` overrides meegeven. Bijv. in `app/diensten/page.tsx`:
```ts
export const metadata: Metadata = {
  title: '...',
  description: '...',
  twitter: { title: '...', description: '...', card: 'summary_large_image' }
}
```

---

## 🟠 High (fix deze maand)

### 2. Geen `llms.txt` bestand
**Probleem:** `https://loopless.nl/llms.txt` → 404. AI-zoekmachines (Perplexity, ChatGPT, Claude) kunnen geen gestructureerde brand-context oppikken.

**Impact:** Lagere kans op accurate citations in AI Overviews / generative engines.

**Fix:** `public/llms.txt` aanmaken:
```
# Loopless — AI-automatisering voor het MKB

> Loopless (Broeders Digital) bouwt op maat AI-automatisering voor Nederlandse MKB-bedrijven.
> Gespecialiseerd in lead qualification, offerte-automatisering en interne kennisbanken (RAG).
> Eigenaar: Wessel Broeders. Gevestigd in Tiel, actief vanuit Tiel en Breda.

## Diensten
- [Diensten overzicht](https://loopless.nl/diensten)
- [Bewezen cases](https://loopless.nl/cases)

## Over
- [Over Wessel](https://loopless.nl/over)
- [FAQ](https://loopless.nl/faq)
- [Contact](https://loopless.nl/contact)

## Kerncase
vuljevacature.nl — lead qualification volledig geautomatiseerd.

## Aanpak
1. Analyseren — probleem eerst, technologie tweede
2. Bouwen — binnen 2 weken werkende oplossing
3. Draaien — 2 weken testfase, daarna live op klant-eigen infrastructuur
```

### 3. LocalBusiness schema toevoegen
**Probleem:** Site heeft alleen `Organization` schema. Voor lokale zoekopdrachten ("AI automatisering Tiel", "MKB automatisering Gelderland") helpt `LocalBusiness` of `ProfessionalService`.

**Fix:** Voeg toe aan root layout schema:
```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "Loopless",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Tiel",
    "addressRegion": "Gelderland",
    "addressCountry": "NL"
  },
  "areaServed": ["Nederland", "Tiel", "Breda", "Gelderland", "Noord-Brabant"],
  "priceRange": "€€"
}
```

---

## 🟡 Medium (backlog)

### 4. `<meta keywords>` tag verwijderen
Google negeert deze sinds 2009. Op elke pagina dezelfde keyword-string staat. Geen impact maar code-rot.

### 5. OG image is op alle subpagina's hetzelfde
`/diensten`, `/cases` etc. delen dezelfde OG image als homepage. Per-pagina OG images = hogere social CTR. Quick win via Next.js dynamic OG (al gebruikt op homepage).

### 6. Performance niet gemeten
PSI rate limit bereikt zonder API key. Configureer Google API key (`google_auth.py`) of meet handmatig:
- https://pagespeed.web.dev/analysis?url=https%3A%2F%2Floopless.nl
- https://search.google.com/test/rich-results

### 7. GEO citability kan sterker
Cases-pagina is dun. AI engines citeren content met:
- Concrete getallen ("80% minder tijd aan X")
- Korte feiten in heading (niet alleen verhalend)
- Quote-vriendelijke alinea's (1-3 zinnen)

Loopless cases pagina mist meetbare cijfers. Voorbeeld voor vuljevacature: "Verlaagde handmatige lead-screening van X uur naar Y minuten per dag."

---

## 🟢 Low (nice-to-have)

- Geen blog → mist long-tail keyword potentieel ("hoe automatiseer ik offertes", "RAG kennisbank MKB", etc.)
- Geen Article schema (omdat geen blog — niet relevant tot er content is)
- `keywords` uit footer-meta verwijderen (zie #4)
- Sitemap heeft `<changefreq>monthly</changefreq>` — zelden genuttig voor Google, kan weg

---

## Top 5 Quick Wins (in volgorde)

1. **Twitter cards per pagina** — 15 min fix, voorkomt verkeerde social previews
2. **`llms.txt` aanmaken** — 10 min, betere AI Overview citations
3. **LocalBusiness schema** — 20 min, helpt local search
4. **Cases met cijfers** — paar uur copywriting, sterk effect op GEO + sales
5. **PSI baseline meten** — 5 min handmatig, weet je waar je staat

---

## Niet getest (blokkers / limitaties)

- **Performance/Core Web Vitals**: PSI rate limit. Setup Google API key voor unlocked metingen
- **Backlinks**: geen Moz/Ahrefs API geconfigureerd
- **Search Console data**: niet gekoppeld
- **GA4 organic traffic**: niet gekoppeld
- **DataForSEO live SERP data**: extensie niet geïnstalleerd

Voor een volledig audit met live data: setup `seo-google` (gratis) en evt. `seo-dataforseo` (betaald).
