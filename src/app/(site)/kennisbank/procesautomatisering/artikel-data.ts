/**
 * Kennisartikel "procesautomatisering" (P25, siteup-seo klanten/loopless/p25-onderbouwing.md).
 * Top 5 op de term (gemeten 2026-11-04) = uitlegartikelen, geen dienstpagina's; daarom een artikel
 * en niet /diensten. Elke bewering komt uit de eigen site: /diensten, /cases, /faq en
 * /kennisbank/automatisering-mkb. Geen bedragen, geen claims die daar niet staan.
 */
export const artikel = {
  slug: "procesautomatisering",
  titel: "Procesautomatisering: wat het is en hoe je begint",
  metaTitel: "Procesautomatisering: wat het is en hoe je begint",
  omschrijving:
    "Wat procesautomatisering is, hoe het verschilt van software kopen, hoe het er bij een groothandel, een recruitmentbureau en in de signbranche uitziet, en wat je nodig hebt om te beginnen.",
  gepubliceerd: "2026-11-04",
  gewijzigd: "2026-11-04",
  leestijd: "5 minuten",
  lead:
    "Procesautomatisering klinkt groot, maar het gaat bijna altijd over iets kleins dat elke dag terugkomt: gegevens opzoeken, overtypen, bij elkaar zetten. Een systeem neemt dat over, een mens kijkt het na en beslist. In dit stuk lees je wat dat in de praktijk betekent en hoe je het eerste proces kiest.",
} as const;

export type Alinea = { tekst: string; vet?: string };
export type Sectie = { id: string; kop: string; alineas: Alinea[] };

export const secties: Sectie[] = [
  {
    id: "wat",
    kop: "Wat is procesautomatisering?",
    alineas: [
      {
        tekst:
          "Procesautomatisering betekent dat een terugkerend stuk werk in je bedrijf door een systeem wordt gedaan in plaats van door een medewerker. Denk aan prijzen en levertijden bij elkaar zoeken voor een bestelling, een offerte opbouwen uit vaste tarieven, of een vraag van een klant opzoeken in handleidingen.",
      },
      {
        tekst:
          "Het gaat daarbij om het voorwerk, niet om de keuze. Het systeem zet klaar wat iemand anders eerst bij elkaar moest rapen. De inkoper, de recruiter of de specialist kijkt het na, past aan waar hij het beter weet en beslist. Daarom noemen wij het ook wel: het uitzoekwerk eraf halen.",
      },
      {
        vet: "Waarom dat onderscheid ertoe doet:",
        tekst:
          "een systeem dat zelf beslist, moet foutloos zijn voordat iemand het durft te gebruiken. Een systeem dat voorbereidt, hoeft dat niet. Fouten vallen op bij de controle, en de verantwoordelijkheid blijft waar hij was.",
      },
    ],
  },
  {
    id: "software",
    kop: "Het verschil met software kopen",
    alineas: [
      {
        tekst:
          "Software koop je, en daarna past je bedrijf zich aan die software aan. Bij procesautomatisering op maat gaat het andersom: het systeem wordt gebouwd op de manier waarop jullie al werken, met de systemen die er al staan.",
      },
      {
        tekst:
          "Het gevolg is dat niemand een nieuw pakket hoeft te leren waar hij niet om heeft gevraagd. De besteladvieslijst komt in hetzelfde scherm, de leadlijst staat klaar waar het team al werkt.",
      },
    ],
  },
  {
    id: "voorbeelden",
    kop: "Drie voorbeelden uit de praktijk",
    alineas: [
      {
        vet: "Een groothandel.",
        tekst:
          "De inkopers liepen hun lijst artikel voor artikel na: voorraad checken, eerder verbruik erbij pakken, inschatten wat er weg moest. Nu staat met één knop een besteladvies klaar, met cijfers uit hun eigen systeem. Zij kijken het na en bestellen zelf.",
      },
      {
        vet: "Een recruitmentbureau.",
        tekst:
          "Het team zocht elke ochtend eerst bedrijven op, beoordeelde of er iets te halen viel en typte gegevens over. Pas daarna kon er gebeld worden. Nu staat elke ochtend een lijst klaar met wie de moeite waard is, en het team begint met bellen. Wie er benaderd wordt, bepalen ze nog steeds zelf.",
      },
      {
        vet: "Een bedrijf in de signbranche.",
        tekst:
          "Vragen over storingen aan machines kwamen bij twee mensen terecht, die het antwoord zelf opzochten in handleidingen, schema's en onderdelenlijsten. Nu zoekt een systeem het antwoord op in de eigen documentatie en zet erbij waar het staat. Staat het er niet in, dan zegt het systeem dat. De specialisten lezen het na en sturen het door.",
      },
      {
        tekst:
          "Drie heel verschillende soorten werk, met dezelfde vorm: het opzoeken is eraf, het oordeel is gebleven. Hetzelfde patroon werkt bij offertes: een aanvraag komt binnen, het systeem zet een concept klaar uit jouw tarieven en kortingen, en jij controleert en verstuurt.",
      },
    ],
  },
  {
    id: "welk-proces",
    kop: "Welk proces is geschikt?",
    alineas: [
      {
        tekst:
          "Een proces is een goede kandidaat als het vaak terugkomt, als de regels op te schrijven zijn, en als het zoeken meer tijd kost dan het beslissen. Hoe je dat bij jou boven tafel krijgt, en waarom je beter niet met het grootste proces begint, staat uitgewerkt in het artikel:",
      },
    ],
  },
  {
    id: "niet",
    kop: "Wanneer het niet het antwoord is",
    alineas: [
      {
        tekst:
          "Niet elk tijdverlies vraagt om een systeem. Soms lost een betere werkafspraak meer op. En zit de kennis alleen in het hoofd van één of twee mensen, dan moet die er eerst uit voordat een systeem er iets mee kan. Dat hoort in het eerste gesprek op tafel te komen, niet pas na de bouw.",
      },
    ],
  },
  {
    id: "aanpak",
    kop: "Van eerste gesprek tot werkend systeem",
    alineas: [
      {
        vet: "Eerst meten.",
        tekst:
          "Hoe vaak komt het werk terug, hoe lang duurt het, wie doet het? Zonder dat getal is achteraf niet te zeggen of het iets heeft opgeleverd.",
      },
      {
        vet: "Vooraf vastleggen waaraan het moet voldoen.",
        tekst:
          "Wat moet het systeem doen, en waaraan zie je dat het werkt? Doet het systeem dat niet, dan betaal je er niet voor (no cure no pay).",
      },
      {
        vet: "Klein bouwen, met echte gegevens.",
        tekst:
          "Liever één proces dat af is dan vijf die half staan. Een half werkend systeem moet worden nagekeken én nog met de hand gedaan, en dat kost meer vertrouwen dan het oplevert.",
      },
      {
        vet: "Laten meelopen.",
        tekst:
          "Een paar weken naast de oude manier, met de mensen die het werk kennen. Zij zien het snelst wat er niet klopt. Daarna besluit je pas of de oude manier uit kan.",
      },
    ],
  },
  {
    id: "na-oplevering",
    kop: "Na de oplevering",
    alineas: [
      {
        tekst:
          "Standaard draait het systeem in jullie eigen omgeving, met de accounts op naam van jullie bedrijf. De data blijft daardoor bij jullie. Onderhoud loopt via een vast maandbedrag; wil je er helemaal niet naar omkijken, dan kan het beheer ook volledig worden overgenomen.",
      },
    ],
  },
  {
    id: "kosten",
    kop: "Wat het kost",
    alineas: [
      {
        tekst:
          "Dat hangt af van wat er nodig is, en vooral van hoe je gegevens erbij liggen. Daarom kijken we eerst samen welk werk eraf kan. Pas daarna volgt een voorstel met een vaste prijs, niet op uurbasis.",
      },
    ],
  },
  {
    id: "beginnen",
    kop: "Wat je nodig hebt om te beginnen",
    alineas: [
      {
        tekst:
          "Geen technische kennis en geen voorbereiding. Een gesprek is genoeg: daarin stel ik de vragen en brengen we in kaart waar het uitzoekwerk bij jou zit. Wil je eerst zelf kijken, dan helpt de zelfscan om te zien welk werk een systeem bij jou zou kunnen overnemen.",
      },
    ],
  },
];
