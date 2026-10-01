import type { Metadata } from "next";
import { PageGlow } from "@/components/page-glow";

// Privacyverklaring — toegevoegd 2026-07-24 (review-ronde configurator).
// Claims hier zijn geverifieerd tegen de werkelijke stack: contactformulier
// via Formspree, configurator via eigen server (n8n, EU) naar Google
// Workspace, hosting Vercel, geen tracking-cookies of analytics.

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description:
    "Hoe Loopless omgaat met de gegevens die je achterlaat via het contactformulier of de configurator.",
  alternates: { canonical: "/privacy" },
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-12 font-[family-name:var(--font-heading)] text-2xl font-bold text-white">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-[#8585A3]">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <>
      <PageGlow />
      <section className="relative pb-24 pt-40">
        <div className="mx-auto max-w-[720px] px-6">
          <h1 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-white md:text-5xl">
            Privacyverklaring
          </h1>
          <p className="mb-2 text-sm text-[#8585A3]">Laatst bijgewerkt: 1 oktober 2026</p>
          <P>
            Loopless is een handelsnaam van Broeders Digital (eenmanszaak, KVK 42004729). Deze
            pagina legt uit welke gegevens we verwerken als je iets achterlaat op loopless.nl, en
            wat we daarmee doen. Kort samengevat: alleen wat nodig is om je te antwoorden, niets
            wordt verkocht of gedeeld voor marketing.
          </P>

          <H2>Welke gegevens we verwerken</H2>
          <P>
            Via het contactformulier en de configurator: je naam, bedrijfsnaam, e-mailadres,
            telefoonnummer (als je dat invult) en de antwoorden die je zelf geeft over jullie
            situatie. Verder houdt de hosting standaard technische serverlogs bij, zoals elk
            website-platform.
          </P>

          <H2>Waarvoor we ze gebruiken</H2>
          <P>
            Om je het overzicht uit de configurator te mailen, je vraag te beantwoorden en er
            daarna contact over op te nemen. Dat is ook de grondslag: je vraagt er zelf om. We
            zetten je niet op een nieuwsbrief of marketinglijst.
          </P>

          <H2>Waar je gegevens staan</H2>
          <P>
            Inzendingen via de configurator lopen via onze eigen automatiseringsserver in een
            EU-datacenter en worden bewaard in Google Workspace (mail en een spreadsheet). Het
            contactformulier wordt verwerkt door Formspree. De website wordt gehost bij Vercel.
            Voor zover deze partijen gegevens buiten de EU verwerken, gebeurt dat onder de
            waarborgen die de AVG daarvoor kent, zoals het EU-VS Data Privacy Framework of
            standaardcontractbepalingen.
          </P>

          <H2>Hoe lang we ze bewaren</H2>
          <P>
            Zolang dat nodig is voor de opvolging van je aanvraag, en maximaal twaalf maanden na
            het laatste contact. Word je klant, dan gelden de afspraken uit de overeenkomst.
          </P>

          <H2>Cookies</H2>
          <P>
            Loopless.nl gebruikt geen tracking-cookies en geen analytics. Er kan alleen een
            functionele cookie worden gezet die nodig is om de site te laten werken.
          </P>

          <H2>Gegevens van opdrachtgevers</H2>
          <P>
            Het bovenstaande gaat over de gegevens die je op deze website achterlaat. Voor
            bedrijven waarvoor we een systeem bouwen, gelden aparte afspraken. Kort samengevat:
            systemen draaien standaard op de eigen omgeving van de opdrachtgever, met accounts op
            naam van dat bedrijf. Verwerkt Loopless zelf persoonsgegevens, dan wordt daarvoor een
            verwerkersovereenkomst gesloten waarin staat welke gegevens dat zijn, waarvoor ze
            worden gebruikt en hoe lang ze bewaard blijven. Geheimhouding is onderdeel van elke
            overeenkomst. Gegevens van de ene opdrachtgever komen nooit terecht in het systeem van
            een andere.
          </P>
          <P>
            Bij de AI-diensten die we inzetten staat het trainen op klantdata uit. Bewaartermijnen
            worden zo kort gehouden als de betreffende dienst toelaat en per systeem vastgelegd.
            Draait een systeem op de accounts van de opdrachtgever, dan zijn die diensten
            subverwerkers van de opdrachtgever zelf, die de instellingen dus ook zelf kan inzien en
            wijzigen.
          </P>

          <H2>Als wij jou benaderen</H2>
          <P>
            Loopless benadert soms zelf bedrijven per e-mail. Daarvoor verwerken we zakelijke
            contactgegevens: de bedrijfsnaam, de website, het algemene e-mailadres dat het bedrijf
            zelf op de eigen website heeft gepubliceerd, en waar bekend de naam en functie van een
            contactpersoon uit openbare bedrijfsinformatie. Het e-mailadres halen we alleen van de
            eigen website van het bedrijf; we leggen vast op welke pagina het stond.
          </P>
          <P>
            We gebruiken deze gegevens om één bedrijf gericht een aanbod te doen dat bij dat
            bedrijf past. De grondslag is ons gerechtvaardigd belang bij het vinden van
            opdrachtgevers. De gegevens staan in een database in de EU en worden niet verkocht of
            gedeeld.
          </P>
          <P>
            Wil je geen mail meer ontvangen, antwoord dan met &quot;stop&quot; of mail naar{" "}
            <a href="mailto:wessel@loopless.nl" className="text-[#4F8EF7] hover:underline">
              wessel@loopless.nl
            </a>
            . We benaderen je dan niet opnieuw en bewaren alleen je e-mailadres, zodat we dat ook
            kunnen waarmaken. Zonder reactie verwijderen we je gegevens uiterlijk twaalf maanden na
            het laatste contact.
          </P>

          <H2>Je rechten</H2>
          <P>
            Je kunt je gegevens inzien, laten corrigeren of laten verwijderen. Mail daarvoor naar{" "}
            <a href="mailto:wessel@loopless.nl" className="text-[#4F8EF7] hover:underline">
              wessel@loopless.nl
            </a>
            . Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht
            indienen bij de Autoriteit Persoonsgegevens.
          </P>
        </div>
      </section>
    </>
  );
}
