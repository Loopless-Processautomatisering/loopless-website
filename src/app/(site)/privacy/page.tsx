import type { Metadata } from "next";
import { PageGlow } from "@/components/page-glow";

// Privacyverklaring — toegevoegd 2026-07-24 (review-ronde configurator).
// Claims hier zijn geverifieerd tegen de werkelijke stack, maar leveranciers
// worden bewust niet bij naam genoemd, alleen per soort (besluit Wessel
// 2026-10-13; de AVG vraagt ontvangers óf categorieën van ontvangers).
// Deze repo is openbaar: welke leverancier achter welke soort zit, staat in het
// projectdossier, niet hier.

export const metadata: Metadata = {
  title: "Privacyverklaring",
  description:
    "Hoe Loopless omgaat met de gegevens die je achterlaat via het contactformulier, de configurator of het gespreksformulier.",
  alternates: { canonical: "/privacy" },
};

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-12 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 leading-relaxed text-[#5F6B85]">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <>
      <PageGlow />
      <section className="relative pb-24 pt-40">
        <div className="mx-auto max-w-[720px] px-6">
          <h1 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B] md:text-5xl">
            Privacyverklaring
          </h1>
          <p className="mb-2 text-sm text-[#5F6B85]">Laatst bijgewerkt: 29 oktober 2026</p>
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
          <P>
            Tijdens je bezoek onthoudt je browser via welke link je binnenkwam (bijvoorbeeld een
            video op Instagram of TikTok, of een pagina van deze site). Dat staat alleen in het
            geheugen van dat tabblad, is geen cookie en verdwijnt als je het tabblad sluit. Vul je
            een formulier in, dan gaat die herkomst mee, zodat we kunnen zien welke video of pagina
            aanvragen oplevert.
          </P>
          <P>
            Stuur je ons een bericht via sociale media, LinkedIn of mail met een vraag over onze
            diensten, dan noteren we je naam of accountnaam, wat je vraagt en via welk kanaal het
            binnenkwam, zodat je vraag niet blijft liggen.
          </P>
          <P>
            Via het gespreksformulier uit onze mail: de onderwerpen die je aanvinkt en wat je
            daarbij zelf toelicht, hoe je bereikt wilt worden, je telefoonnummer of een ander
            e-mailadres (als je dat invult), de momenten die je aanvinkt en wat je daar zelf over
            schrijft.
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
            EU-datacenter en worden bewaard in onze zakelijke mail- en kantoorsoftware. Het
            contactformulier wordt als e-mail bezorgd via een dienst voor webformulieren of een
            dienst voor het versturen van e-mail. Inzendingen via het contactformulier, de
            configurator en het gespreksformulier, en vragen die we zelf noteren, worden daarnaast
            bewaard in een database in de EU, zodat alle aanvragen op één plek staan; Wessel
            krijgt daarvan een melding op zijn telefoon met alleen je naam en bedrijfsnaam. Onze e-mails
            worden verstuurd via een dienst voor het versturen van e-mail. De website wordt
            gehost bij een hostingpartij. Voor zover deze partijen gegevens buiten de EU
            verwerken, gebeurt dat onder de waarborgen die de AVG daarvoor kent, zoals het
            EU-VS Data Privacy Framework of standaardcontractbepalingen.
          </P>

          <H2>Hoe lang we ze bewaren</H2>
          <P>
            Zolang dat nodig is voor de opvolging van je aanvraag, en maximaal twaalf maanden na
            het laatste contact. Een aanvraag in onze database wordt twaalf maanden nadat we hem
            hebben opgepakt automatisch verwijderd; pakken we hem nooit op, dan twaalf maanden na
            binnenkomst. Word je klant, dan gelden de afspraken uit de overeenkomst.
          </P>

          <H2>Cookies</H2>
          <P>
            Loopless.nl gebruikt geen tracking-cookies. We houden wel bij hoe vaak pagina&apos;s
            worden bezocht, met een webstatistiek die geen cookies plaatst en geen profiel van je
            opbouwt. Op de pagina van het gespreksformulier staat ook die uit. Er kan alleen een
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
            gedeeld. Voor het versturen gaan alleen het e-mailadres, de bedrijfsnaam en waar
            bekend de naam van de contactpersoon naar de dienst die onze e-mails verstuurt.
          </P>
          <P>
            De knop in onze mail bevat een code die bij jouw bedrijf hoort, zodat het formulier je
            naam en bedrijf al kent. De dienst die onze e-mails verstuurt houdt bij of er op een link
            in de mail is geklikt; links lopen daarom eerst via die dienst. Of je een mail opent,
            meten we niet. We gebruiken dit alleen om te zien welke mails werken.
          </P>
          <P>
            Wil je geen mail meer ontvangen, klik dan op de afmeldlink onderaan de mail, antwoord
            met &quot;stop&quot; of mail naar{" "}
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
