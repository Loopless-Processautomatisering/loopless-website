import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://loopless.nl"),
  title: {
    default: "Loopless — AI-automatisering voor het MKB",
    template: "%s | Loopless",
  },
  description:
    "Loopless bouwt AI-systemen die het uitzoekwerk doen voor het MKB: leads uitzoeken, offertes klaarzetten, vragen beantwoorden uit eigen documentatie. Actief vanuit Tiel en Breda.",
  keywords:
    "AI automatisering, MKB automatisering, procesautomatisering, lead qualification, offerte automatisering, kennisbank AI, Loopless, Tiel, Breda, Nederland",
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

// Zet de wachtrij van Vercel Web Analytics klaar en hangt er een filter in.
// Het script roept dit filter aan voor elke paginaweergave en gebeurtenis; null
// teruggeven laat hem vervallen.
const analyticsFilter = `window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments)};window.va("beforeSend",function(e){try{if(new URL(e.url,location.origin).pathname.indexOf("/gesprek")===0)return null}catch(_){}return e});`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased`}>
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
        {/* Bezoeken aan /gesprek tellen niet mee: de link daarheen is persoonlijk
            en de privacytekst zegt dat een klik niet wordt vastgelegd. Het filter
            moet in de wachtrij staan vóór de loader hieronder draait, en geldt
            per gebeurtenis, dus ook na navigeren binnen de site. */}
        <script dangerouslySetInnerHTML={{ __html: analyticsFilter }} />
        <Script src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
