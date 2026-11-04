// Eén bron voor de FAQ: de pagina rendert hieruit én de FAQPage-JSON-LD wordt
// hieruit opgebouwd. Antwoorden hier aanpassen werkt dus meteen door in beide.
export type FaqEntry = {
  question: string;
  answer: string;
  /** Optionele verdiepingslink onder het antwoord (bv. naar de privacyverklaring). */
  link?: { href: string; label: string };
};

export const faqCategories: { label: string; items: FaqEntry[] }[] = [
  {
    label: "Over het uitzoekwerk",
    items: [
      {
        question: "Wat is AI-automatisering voor het MKB?",
        answer:
          "Een systeem dat het uitzoekwerk overneemt dat je mensen nu met de hand doen: informatie opzoeken, leads napluizen, offertes van nul opbouwen. Het systeem zet het werk klaar, jouw mensen controleren en beslissen. Zo helpt de binnendienst weer klanten in plaats van steeds hetzelfde op te zoeken. Je hebt er geen IT-afdeling voor nodig.",
      },
      {
        question: "Waarom zou ik mijn bedrijfsprocessen automatiseren?",
        answer:
          "Omdat je mensen niet zijn aangenomen om uit te zoeken. Een inkoper is aangenomen om in te kopen, niet om de halve week door lijsten te spitten. Gaat dat werk eraf, dan doen de mensen die je al hebt weer het werk waarvoor je ze hebt aangenomen. Er hoeft ook niemand bij om het werk af te krijgen.",
      },
      {
        question: "Welke processen kan ik automatiseren in mijn bedrijf?",
        answer:
          "Overal waar iemand hetzelfde uitzoekwerk herhaalt. De binnendienst die de hele dag dezelfde vragen beantwoordt. Iemand die meer tijd kwijt is aan uitzoeken dan aan zijn eigenlijke werk. Offertes die steeds opnieuw van nul worden opgebouwd. Gegevens die worden overgetypt tussen mail, Excel en het systeem. Bij elk bedrijf zit het ergens anders. Weet je niet waar het bij jou zit? In een paar vragen zie je wat er bij jou speelt.",
      },
      {
        question:
          "Wat is het verschil tussen procesautomatisering en gewone software kopen?",
        answer:
          "Software koop je, en je bedrijf past zich eraan aan. Ik bouw op maat, op de manier waarop jullie al werken. We beginnen bij het probleem, niet bij de technologie. En niemand hoeft een nieuw systeem te leren waar hij niet om gevraagd heeft.",
        link: { href: "/kennisbank/procesautomatisering", label: "Lees meer over procesautomatisering" },
      },
    ],
  },
  {
    label: "Over de samenwerking",
    items: [
      {
        question: "Wat kost procesautomatisering voor een klein bedrijf?",
        answer:
          "Dat hangt af van wat er nodig is. We kijken eerst samen welk werk eraf kan, pas daarna maak ik een voorstel met een vaste prijs. Geen uurtarief, en je betaalt nooit voor meer dan wat je nodig hebt.",
      },
      {
        question:
          "Is AI-automatisering ook geschikt voor een MKB-bedrijf zonder IT-afdeling?",
        answer:
          "Ja. Ik regel de technische kant van begin tot eind. Jij hoeft alleen aan te wijzen waar je mensen vastlopen. Je hebt geen IT-kennis nodig om te beginnen, en je mensen hoeven er niets voor te kunnen.",
      },
      {
        question: "Hoe lang duurt het om een automatisering te laten werken?",
        answer:
          "Binnen vier tot zes weken draait er één proces dat je nu handmatig doet. Vaste prijs, met acceptatiecriteria die we vooraf afspreken, zodat van tevoren vaststaat wanneer het klaar is.",
      },
      {
        question:
          "Hoe weet ik of automatisering geschikt is voor mijn situatie?",
        answer:
          "Dat bepalen we samen in een gratis gesprek. Ik breng in kaart waar de tijd blijft hangen en of een systeem daar het antwoord op is. Soms is een betere werkafspraak effectiever. En zit de kennis alleen in het hoofd van één of twee mensen, dan moet die er eerst uit voordat een systeem er iets mee kan. Dat zeg ik dan ook gewoon.",
      },
      {
        question: "Wat heb ik nodig om te beginnen met procesautomatisering?",
        answer:
          "Alleen een gesprek. Geen technische kennis, geen voorbereiding. Ik stel de vragen en breng in kaart waar het uitzoekwerk zit.",
      },
      {
        question: "Wat als het systeem niet werkt zoals verwacht?",
        answer:
          "Ik hanteer no cure no pay. We leggen vooraf vast waaraan het systeem moet voldoen. Doet het systeem dat niet, dan betaal je er niet voor.",
      },
    ],
  },
  {
    label: "Na oplevering",
    items: [
      {
        question: "Wie beheert het systeem na de oplevering?",
        answer:
          "Dat kies je zelf. Standaard draait het systeem op jullie eigen omgeving en staan de accounts op naam van jullie bedrijf; ik log op afstand in om het draaiend te houden. Wil je er helemaal niet naar omkijken, dan neem ik het beheer volledig over. In beide gevallen loopt het onderhoud via een vast maandbedrag.",
      },
    ],
  },
  {
    label: "Over je data",
    items: [
      {
        question: "Hoe zit het met de privacy van mijn bedrijfsdata?",
        answer:
          "Standaard draait het systeem op jullie eigen omgeving, met de accounts op naam van jullie bedrijf. Jullie data blijft dan bij jullie staan en ik heb alleen toegang om het draaiend te houden. Verwerk ik zelf persoonsgegevens, dan leggen we in een verwerkersovereenkomst vast welke dat zijn, waarvoor ze gebruikt worden en hoe lang ze bewaard blijven. Data van de ene klant komt nooit in het systeem van een andere: gescheiden omgevingen, gescheiden sleutels.",
      },
      {
        question: "Tekenen jullie een geheimhoudingsverklaring?",
        answer:
          "Die zit er al in. In elk voorstel staat een geheimhoudingsclausule, dus je hoeft er niet apart om te vragen en er hoeft geen los document achteraan. Heeft jullie organisatie een eigen NDA die getekend moet worden, dan teken ik die uiteraard ook.",
      },
      {
        question: "Wordt mijn data gebruikt om AI-modellen te trainen?",
        answer:
          "Nee. Bij de AI-diensten die ik inzet staat trainen op klantdata uit, en waar een leverancier dat standaard wél doet, wordt die instelling omgezet voordat er ook maar één document van jullie langskomt. Bewaartermijnen houden we zo kort als de dienst toelaat en leggen we per systeem vast. Eén ding zeg ik er eerlijk bij: zo'n afspraak is precies zo sterk als de leverancier waarmee je hem maakt. Daarom staan de accounts bij voorkeur op jullie naam, zodat jullie zelf zien en bepalen wat er onder de motorkap staat aangevinkt.",
        link: { href: "/privacy", label: "Lees de privacyverklaring" },
      },
    ],
  },
];
