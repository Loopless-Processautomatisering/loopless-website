import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Sans, IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Twee typografie-varianten staan naast elkaar tot de keuze op /stijl is gemaakt
// (besluit 5, HERONTWERP-PLAN.md). Variant A is de standaard; /stijl zet
// data-type="b" op een fragment om B te tonen. Zodra de keuze valt gaat de
// verliezer eruit, inclusief zijn font-import.
//
// Variant A — redactioneel: serif-koppen met krantenherkomst + nuchtere sans.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-ui",
});

// Alleen voor schema-labels en meta-cijfers. Zelfde familie als de body, dus één stem.
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono-ui",
});

// Variant B — één familie, koppen via gewicht en maat. Ontworpen voor krantenzetsel.
const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loopless.nl"),
  title: {
    default: "Loopless — AI-automatisering voor het MKB",
    template: "%s | Loopless",
  },
  description:
    "Loopless bouwt AI-systemen die het uitzoekwerk doen voor het MKB: leads uitzoeken, offertes klaarzetten, vragen beantwoorden uit eigen documentatie. Actief vanuit Tiel en Breda.",
  authors: [{ name: "Wessel Broeders" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "nl_NL",
    siteName: "Loopless",
    title: "Loopless — AI-automatisering voor het MKB",
    description:
      "Loopless bouwt AI-systemen die het uitzoekwerk doen voor het MKB: leads uitzoeken, offertes klaarzetten, vragen beantwoorden uit eigen documentatie.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Loopless — AI-automatisering voor het MKB",
    description:
      "Loopless bouwt AI-systemen die het uitzoekwerk doen voor het MKB: leads uitzoeken, offertes klaarzetten, vragen beantwoorden uit eigen documentatie.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Loopless",
  legalName: "Broeders Digital",
  url: "https://loopless.nl",
  logo: "https://loopless.nl/logo-icon-final.png",
  description:
    "AI-automatisering voor het MKB. Systemen die het uitzoekwerk doen: leads uitzoeken, offertes klaarzetten, vragen beantwoorden uit eigen documentatie.",
  founder: {
    "@type": "Person",
    name: "Wessel Broeders",
    jobTitle: "Oprichter",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tiel",
    addressRegion: "Gelderland",
    addressCountry: "NL",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "wessel@loopless.nl",
    contactType: "sales",
    availableLanguage: "Dutch",
  },
  sameAs: [
    "https://www.linkedin.com/in/wessel-broeders-250767221/",
  ],
};

const professionalServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Loopless",
  url: "https://loopless.nl",
  image: "https://loopless.nl/logo-icon-final.png",
  description:
    "AI-automatisering voor Nederlandse MKB-bedrijven. Systemen die het uitzoekwerk doen: leads uitzoeken, offertes klaarzetten, vragen beantwoorden uit eigen documentatie.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tiel",
    addressRegion: "Gelderland",
    addressCountry: "NL",
  },
  areaServed: ["Nederland", "Tiel", "Breda", "Gelderland", "Noord-Brabant"],
  priceRange: "€€",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${newsreader.variable} ${plexSans.variable} ${plexMono.variable} ${schibsted.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceJsonLd) }}
        />
        {children}
        {/* Vercel Web Analytics. Bewust de loader zelf plaatsen: <Analytics /> uit
            @vercel/analytics 2.0.1 zette op Next 16 wel window.va + de queue klaar,
            maar injecteerde script.js nooit, waardoor elke pageview in de wachtrij
            bleef staan (geverifieerd in de browser, 2026-08-09). Dit script handelt
            pageviews en route-wissels zelf af. */}
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
