import type { Metadata } from "next";
import { faqCategories } from "./faq-data";

export const metadata: Metadata = {
  title: "Veelgestelde vragen over werken met Loopless",
  description:
    "Welk werk een systeem kan overnemen, wat het kost, hoe lang het duurt en wat er gebeurt als het niet doet wat we hebben afgesproken.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "Veelgestelde vragen over werken met Loopless",
    description:
      "Welk werk een systeem kan overnemen, wat het kost, hoe lang het duurt en wat er gebeurt als het niet doet wat we hebben afgesproken.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veelgestelde vragen over werken met Loopless",
    description:
      "Welk werk een systeem kan overnemen, wat het kost, hoe lang het duurt en wat er gebeurt als het niet doet wat we hebben afgesproken.",
  },
};

// Bouwt de FAQPage-schema uit dezelfde bron als de pagina zelf, zodat de
// structured data nooit meer uit de pas loopt met de zichtbare antwoorden.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    }))
  ),
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
