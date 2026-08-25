import type { Metadata } from "next";
import Link from "next/link";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow, SectionDivider } from "@/components/page-glow";
import { Target, FileText, BarChart3, PackageSearch } from "lucide-react";

export const metadata: Metadata = {
  title: "Diensten: AI-automatisering op maat voor het MKB",
  description:
    "Van leads uitzoeken tot offertes klaarzetten en vragen beantwoorden uit eigen documentatie: AI-automatisering op maat die jouw MKB-team tijd teruggeeft.",
  alternates: { canonical: "/diensten" },
  openGraph: {
    title: "Diensten: AI-automatisering op maat voor het MKB",
    description:
      "Van leads uitzoeken tot offertes klaarzetten en vragen beantwoorden uit eigen documentatie: AI-automatisering op maat die jouw MKB-team tijd teruggeeft.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diensten: AI-automatisering op maat voor het MKB",
    description:
      "Van leads uitzoeken tot offertes klaarzetten en vragen beantwoorden uit eigen documentatie: AI-automatisering op maat die jouw MKB-team tijd teruggeeft.",
  },
};

const servicesJsonLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  provider: {
    "@type": "Organization",
    name: "Loopless",
    url: "https://loopless.nl",
  },
  serviceType: "AI-automatisering",
  areaServed: { "@type": "Country", name: "NL" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "AI-automatiseringsdiensten",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Besteladvies en inkoop-uitzoekwerk", description: "Het systeem zoekt prijzen, voorraad en levertijden bij elkaar en zet 's ochtends een besteladvies klaar. Je inkoper controleert en beslist." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Leads uitzoeken", description: "Het systeem zoekt, screent en kwalificeert leads. Jouw mensen voeren de gesprekken." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Offertes klaarzetten", description: "Concept-offertes staan klaar uit je eigen tarieven en productinfo. Jij controleert en verstuurt." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Vragen beantwoorden uit eigen documentatie", description: "Antwoorden uit je eigen documenten, met directe bronverwijzing." } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Maatwerk voor jouw uitzoekwerk", description: "Maatwerk automatisering voor het uitzoekwerk dat jouw team het meeste tijd kost." } },
    ],
  },
};

const diensten = [
  {
    id: "inkoop-besteladvies",
    icon: <PackageSearch className="h-6 w-6" />,
    title: "Besteladvies en inkoop-uitzoekwerk",
    navLabel: "Inkoop",
    subtitle: "Je inkoper koopt weer in, in plaats van uit te zoeken.",
    paragraphs: [
      "Voor elke bestelling zoekt iemand eerst prijzen, voorraad en levertijden bij elkaar. Leverancierslijsten, mail, het voorraadscherm: dat verzamelwerk vreet de dag op.",
      "Wij bouwen een systeem dat dat uitzoekwerk op de achtergrond doet: 's ochtends staat het besteladvies klaar, met de prijzen, voorraad en levertijden erbij. Het advies is een voorstel, geen bestelling. Je inkoper controleert het en drukt zelf op de knop.",
    ],
    highlight: "Zo werkt het bij Drabor, een groothandel: de inkopers vragen met één knop een besteladvies op en controleren het voordat er iets besteld wordt.",
    voorWie: "Groothandels en technische handel waar inkopers of binnendienst dagelijks prijzen, voorraad en levertijden bij elkaar zoeken",
    accentColor: "#4F8EF7",
  },
  {
    id: "lead-qualification",
    icon: <Target className="h-6 w-6" />,
    title: "Leads uitzoeken",
    navLabel: "Leads",
    subtitle: "Elke ochtend een lijst met gekwalificeerde leads, zonder dat je team er iets voor hoeft te doen.",
    paragraphs: [
      "Recruiters en salesteams verliezen dagelijks uren aan handmatig zoeken, checken en invoeren. Dat stopt.",
      "Het systeem zoekt, screent en kwalificeert leads op basis van jouw criteria, op de achtergrond, ook 's nachts en in het weekend. Jouw team logt in en gaat direct aan de slag met wat er echt toe doet: klantcontact.",
    ],
    highlight: "Zo werkt het bij vuljevacature.nl: de leadkwalificatie draait elke ochtend vanzelf, het team benadert de kandidaten.",
    voorWie: "Recruitmentbureaus en salesteams die dagelijks tijd kwijt zijn aan het zoeken en kwalificeren van leads",
    accentColor: "#22D3EE",
  },
  {
    id: "offerte-automatisering",
    icon: <FileText className="h-6 w-6" />,
    title: "Offertes klaarzetten",
    navLabel: "Offertes",
    subtitle: "Een aanvraag komt binnen, een offerte gaat eruit. Zonder dat iemand er uren werk in steekt.",
    paragraphs: [
      "Offertes opstellen betekent steeds opnieuw dezelfde informatie opzoeken en tarieven berekenen. Wij bouwen een systeem dat dat overneemt.",
      "Een aanvraag komt binnen en het systeem zet een compleet concept klaar uit jouw tarieven en kortingen. Jij controleert en verstuurt.",
      "Wie de offerte maakt, begint niet meer bij nul maar bij een concept dat al klopt.",
    ],
    voorWie: "Bedrijven die projectoffertes opstellen met vaste tarieven, zoals aannemers, groenvoorzieningsbedrijven en consultants",
    accentColor: "#A78BFA",
  },
  {
    id: "kennisbank",
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Vragen beantwoorden uit eigen documentatie",
    navLabel: "Vragen & kennis",
    subtitle: "Al je kennis op één plek, altijd direct beschikbaar.",
    paragraphs: [
      "Handleidingen, procedures, productinfo: het bestaat allemaal. Maar het staat verspreid over mappen, drives en hoofden van collega's. Dus wordt er gebeld, gezocht en gewacht.",
      "Wij bouwen een AI-assistent die al je documenten kent. Medewerkers stellen hun vraag en krijgen direct antwoord, met erbij waar het vandaan komt.",
      "Geen zoeken meer, geen collega storen. De expert doet weer zijn eigen werk, en iedereen krijgt toch antwoord.",
    ],
    voorWie: "Bedrijven met veel interne documenten, handleidingen of procedures waar medewerkers dagelijks in moeten zoeken",
    accentColor: "#E8A04E",
  },
];

export default function DienstenPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesJsonLd) }}
      />
      <PageGlow />
      {/* Hero + anchor nav */}
      <section className="relative pb-12 pt-40">
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn>
            <h1 className="mb-4 font-[family-name:var(--font-heading)] text-5xl font-bold text-white md:text-6xl">
              Het werk waarvoor je niemand hebt aangenomen
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="max-w-[600px] text-xl text-[#8585A3]">
              Uitzoeken, overtypen, mail doorspitten, gegevens bij elkaar rapen. Wij bouwen systemen die dat werk op de achtergrond doen. Jouw mensen controleren en beslissen.
            </p>
          </AnimateIn>

          {/* Anchor nav */}
          <AnimateIn delay={0.2}>
            <nav className="mt-12 flex flex-wrap gap-3">
              {diensten.map((d) => (
                <a
                  key={d.id}
                  href={`#${d.id}`}
                  className="rounded-full border border-[#2E2E4A] px-4 py-2 text-sm font-medium text-[#8585A3] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4F8EF7]/40 hover:text-white hover:shadow-[0_4px_12px_-4px_rgba(79,142,247,0.2)]"
                >
                  {d.navLabel}
                </a>
              ))}
              <a
                href="#maatwerk"
                className="rounded-full border border-[#2E2E4A] px-4 py-2 text-sm font-medium text-[#8585A3] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4F8EF7]/40 hover:text-white hover:shadow-[0_4px_12px_-4px_rgba(79,142,247,0.2)]"
              >
                Maatwerk
              </a>
            </nav>
          </AnimateIn>
        </div>
      </section>

      {/* Diensten */}
      {diensten.map((dienst, i) => (
        <section
          key={dienst.id}
          id={dienst.id}
          className={`relative overflow-hidden py-24 md:py-32 ${
            i % 2 === 1 ? "bg-[#1A1A2E]" : ""
          }`}
        >
          <div className="mx-auto max-w-[900px] px-6">
            <AnimateIn>
              <article>
                <div className="mb-8 flex items-start gap-5">
                  <div
                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#2E2E4A] transition-colors duration-300 hover:bg-[#3E3E5A]"
                    style={{ color: dienst.accentColor }}
                  >
                    {dienst.icon}
                  </div>
                  <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-white md:text-3xl">
                    {dienst.title}
                  </h2>
                </div>

                <p className="mb-6 text-lg font-medium text-[#EDEDF4]">
                  {dienst.subtitle}
                </p>

                <div className="mb-8 flex flex-col gap-4">
                  {dienst.paragraphs.map((p) => (
                    <p key={p} className="text-[#8585A3] leading-relaxed">{p}</p>
                  ))}
                </div>

                {dienst.highlight && (
                  <div
                    className="mb-8 border-l-2 py-1 pl-6"
                    style={{ borderColor: dienst.accentColor }}
                  >
                    <p className="text-[#EDEDF4]">{dienst.highlight}</p>
                  </div>
                )}

                <p className="text-sm text-[#8585A3]">
                  <span className="font-semibold uppercase tracking-wider" style={{ color: dienst.accentColor }}>Voor wie</span>
                  <span className="mx-3 text-[#2E2E4A]">|</span>
                  {dienst.voorWie}
                </p>
              </article>
            </AnimateIn>
          </div>
        </section>
      ))}

      <SectionDivider />

      {/* Maatwerk */}
      <section id="maatwerk" className="py-24 md:py-32">
        <div className="mx-auto max-w-[700px] px-6 text-center">
          <AnimateIn>
            <h2 className="mb-6 font-[family-name:var(--font-heading)] text-3xl font-bold text-white md:text-4xl">
              Staat jouw proces er niet tussen?
            </h2>
            <p className="mb-4 text-lg text-[#EDEDF4]">
              Wij beginnen altijd bij het probleem, nooit bij de technologie. Of preciezer: bij de persoon die verzuipt, niet bij de tool.
            </p>
            <p className="mb-10 text-[#8585A3]">
              Eerst brengen we in kaart waar tijd verloren gaat. Dan pas bouwen we een oplossing die past bij hoe jij werkt. Elk MKB-bedrijf met taken die te veel tijd kosten is welkom.
            </p>
            <Link
              href="/contact"
              className="inline-block rounded-full bg-[#4F8EF7] px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-[#3A75D8] hover:shadow-[0_8px_30px_-8px_rgba(79,142,247,0.3)]"
            >
              Vertel over je proces
            </Link>
            <p className="mt-8 text-sm text-[#8585A3]">
              Weet je nog niet waar je moet beginnen?{" "}
              <Link
                href="/kennisbank/automatisering-mkb"
                className="font-semibold text-[#4F8EF7] transition-colors hover:text-[#7EAEFA]"
              >
                Lees eerst hoe je dat bepaalt
              </Link>
              .
            </p>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
