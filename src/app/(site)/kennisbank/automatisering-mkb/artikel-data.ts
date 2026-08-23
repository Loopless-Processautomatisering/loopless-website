export const artikel = {
  slug: "automatisering-mkb",
  titel: "Automatisering in het MKB: waar je begint en wat het oplevert",
  metaTitel: "Automatisering in het MKB: waar je begint",
  omschrijving:
    "Welk werk automatiseer je als eerste, hoe pak je het aan en wat levert het op? Een praktische uitleg voor MKB-bedrijven, zonder technisch verhaal.",
  gepubliceerd: "2026-08-23",
  gewijzigd: "2026-08-23",
  leestijd: "9 minuten",
  lead:
    "In elk bedrijf zit werk waar eigenlijk niemand voor is aangenomen. Opzoeken, overtypen, mail doorspitten, gegevens bij elkaar rapen. De vraag is niet of je dat kunt automatiseren, want dat kan tegenwoordig bijna altijd. De vraag is welk stuk je als eerste aanpakt, en waaraan je merkt of het de moeite waard was. Daar gaat dit stuk over.",
} as const;

export type Alinea = { tekst: string; vet?: string };

export type Sectie = {
  id: string;
  kop: string;
  alineas: Alinea[];
};

/** `vet` is de aanhef die als eerste woorden vet wordt gezet, `tekst` is de rest. */
export const secties: Sectie[] = [
  {
    id: "wat",
    kop: "Wat automatisering in het MKB wel en niet is",
    alineas: [
      {
        tekst:
          "Automatiseren betekent niet dat er een systeem komt dat jouw werk overneemt. Het betekent dat het uitzoekwerk eraf gaat en dat de beslissing bij jou blijft.",
      },
      {
        tekst:
          "Dat onderscheid klinkt als een detail, maar het bepaalt of iets werkt. Neem een inkoper die elke week zijn artikellijst naloopt: voorraad checken, verbruik van eerdere periodes erbij pakken, inschatten wat er besteld moet worden. Het uitzoeken kost uren, de beslissing kost minuten. Als je die uren weghaalt en de minuten laat staan, is er niets veranderd aan wie er verantwoordelijk is. Er is alleen tijd overgebleven.",
      },
      {
        tekst:
          "Waar het misgaat is bij bedrijven die het omgekeerde proberen: de beslissing wegautomatiseren. Dan krijg je een systeem dat bestellingen plaatst die niemand heeft nagekeken, of dat klanten mailt met een toon die niemand heeft gelezen. Dat werkt een paar weken en dan gaat het één keer goed mis, en daarna zet iedereen het uit.",
      },
      {
        vet: "De vuistregel die wij aanhouden: het systeem doet het zoekwerk, de mens doet de keuze.",
        tekst:
          "Niet omdat techniek de keuze niet aankan, maar omdat een keuze die niemand meer nakijkt, ook niemand meer kan bijsturen. En bijsturen is precies wat je in een MKB-bedrijf de hele dag doet.",
      },
      {
        tekst:
          "Wat er dus niet in dit verhaal thuishoort: mensen vervangen. Wat er wel in thuishoort: mensen weer laten doen waarvoor je ze hebt aangenomen.",
      },
    ],
  },
  {
    id: "welk-proces",
    kop: "Welk proces kies je als eerste",
    alineas: [
      {
        tekst:
          "Dit is de vraag waar de meeste bedrijven op vastlopen, en meestal niet omdat er te weinig kandidaten zijn maar omdat er te veel zijn.",
      },
      { tekst: "Er zijn drie kenmerken die samen een goed eerste proces aanwijzen." },
      {
        vet: "Het komt terug.",
        tekst:
          "Iets dat één keer per jaar gebeurt, is het niet waard om in te richten, hoe vervelend het ook is. Iets dat elke dag of elke week gebeurt wel, ook als het per keer maar een half uur kost. Reken het eens uit over een jaar; dat getal verrast bijna iedereen.",
      },
      {
        vet: "Er zitten vaste regels in.",
        tekst:
          "Als je aan de persoon die het doet kunt vragen “hoe bepaal je dat?” en er komt een antwoord dat je kunt opschrijven, dan is het geschikt. Komt er “dat voel je gewoon na twintig jaar”, dan is het dat niet, of in elk geval nog niet.",
      },
      {
        vet: "Het uitzoeken kost meer tijd dan het beslissen.",
        tekst:
          "Dit is het belangrijkste van de drie en het wordt het vaakst overgeslagen. Als iemand tien minuten zoekt en vervolgens twee minuten nadenkt, valt er veel te winnen. Als hij één minuut zoekt en daarna een halfuur zit te wikken, dan zit het probleem ergens anders en gaat automatiseren het niet oplossen.",
      },
      {
        tekst:
          "Een praktische manier om dit boven tafel te krijgen: vraag je mensen niet wat er geautomatiseerd zou moeten worden. Die vraag levert wensen op. Vraag ze waar hun dag aan opgaat, en vooral welk deel van hun werk ze zouden overslaan als ze mochten. Daar zit het antwoord meestal binnen tien minuten.",
      },
      {
        tekst:
          "Wat je aan het begin niet moet doen: het grootste of het meest zichtbare proces kiezen. Het eerste project is er om te leren of het bij jou werkt en of je mensen het vertrouwen. Kies iets dat groot genoeg is om verschil te maken en klein genoeg om binnen enkele weken te draaien.",
      },
    ],
  },
  {
    id: "praktijk",
    kop: "Hoe het er in de praktijk uitziet",
    alineas: [
      {
        tekst:
          "Twee voorbeelden uit ons eigen werk, allebei bij een bedrijf dat er niet naar op zoek was maar er wel elke dag last van had.",
      },
    ],
  },
  {
    id: "stappen",
    kop: "Van idee naar werkend, stap voor stap",
    alineas: [
      {
        vet: "Begin met meten wat het nu kost.",
        tekst:
          "Niet op gevoel maar met een getal: hoeveel keer per week gebeurt het, hoe lang duurt het, hoeveel mensen zijn ermee bezig. Dit kost een middag en het is de stap die het vaakst wordt overgeslagen. Zonder dit getal kun je achteraf nooit hard maken of het iets heeft opgeleverd, en dan blijft het een gevoel.",
      },
      {
        vet: "Bouw de kleinste versie die echt werkt.",
        tekst:
          "Niet een demo en niet een proefopstelling, maar iets dat één stuk van het echte werk doet met echte gegevens. Liever één proces dat af is dan vijf die half staan. De reden is niet zuinigheid: een half werkend systeem kost meer vertrouwen dan het oplevert, want je mensen moeten het nakijken én zelf nog doen.",
      },
      {
        vet: "Laat het meelopen naast de oude manier.",
        tekst:
          "Twee tot vier weken, met de mensen die het werk normaal doen. Zij zien binnen een week wat er niet klopt en dat is precies wat je wilt weten. In deze fase hoort het systeem fouten te maken; als het er geen maakt, kijkt er waarschijnlijk niemand goed genoeg.",
      },
      {
        vet: "Beslis daarna pas.",
        tekst:
          "Werkt het, dan zet je de oude manier uit. Werkt het niet, dan stop je ermee, en dat is een geldige uitkomst. Een pilot die eerlijk op nee eindigt heeft je meer opgeleverd dan een pilot die uit beleefdheid doorgaat.",
      },
      {
        vet: "Pas dan het volgende proces.",
        tekst:
          "Niet eerder, hoe verleidelijk het ook is. Het tweede proces gaat sneller dan het eerste omdat de koppelingen er al liggen en omdat je mensen inmiddels weten wat ze kunnen verwachten.",
      },
      {
        tekst:
          "Wat in elke stap meegaat: wie er verantwoordelijk blijft, en wat er gebeurt als het systeem eruit ligt. Dat laatste klinkt somber maar het is de vraag die het verschil maakt tussen iets waar een bedrijf op durft te leunen en iets dat na de eerste storing wordt uitgezet.",
      },
    ],
  },
  {
    id: "kosten",
    kop: "Wat het kost en wat het oplevert",
    alineas: [
      {
        tekst:
          "Eerlijk antwoord: dat hangt af van hoe je gegevens erbij liggen, en veel minder van hoe ingewikkeld het proces zelf is.",
      },
      {
        tekst:
          "Een proces met vaste regels waarvan de gegevens netjes in één systeem staan, is in enkele weken te bouwen. Hetzelfde proces waarbij de informatie over vier plekken verspreid staat, waarvan er één een gedeelde map met spreadsheets is, kost een veelvoud. Niet vanwege de automatisering maar vanwege het opruimen dat eraan voorafgaat. Dat opruimen had trouwens sowieso moeten gebeuren.",
      },
      {
        tekst:
          "Aan de opbrengstkant is de rekensom simpeler dan bedrijven denken, mits je die nulmeting hebt gedaan. Uren maal weken maal uurloon, en dan de vraag wat die uren nu doen. Dat laatste bepaalt of het echt oplevert. Tijd die vrijkomt en in ander uitzoekwerk verdwijnt, levert niets op. Tijd die naar klanten gaat of naar werk waar je mensen voor zijn aangenomen, wel.",
      },
      {
        tekst:
          "Waar wij zelf op sturen: het moet binnen een jaar terugverdiend zijn. Lukt dat niet op papier vooraf, dan is het het verkeerde eerste proces en zoeken we een ander.",
      },
      {
        tekst:
          "Wat er niet in de rekensom hoort, hoe vaak het ook zo verkocht wordt: besparing op mensen. Als dat je doel is, is dit het verkeerde verhaal en waarschijnlijk ook de verkeerde partij.",
      },
    ],
  },
  {
    id: "misgaat",
    kop: "Waarom het misgaat",
    alineas: [
      {
        vet: "Er is begonnen bij de techniek.",
        tekst:
          "Iemand ziet iets werken bij een ander bedrijf en wil dat ook. Dan is het gereedschap gekozen voordat het probleem is opgeschreven, en gaat de rest van het project over de vraag welk probleem er bij het gereedschap past. Begin bij het probleem, kies daarna pas waarmee.",
      },
      {
        vet: "Het is te groot begonnen.",
        tekst:
          "Het proces dat de meeste tijd kost is bijna nooit het proces waarmee je moet beginnen, want dat is meestal ook het proces met de meeste uitzonderingen.",
      },
      {
        vet: "De mensen die het werk doen zijn er niet bij betrokken.",
        tekst:
          "Zij weten waar de uitzonderingen zitten. Worden ze pas bij de oplevering gevraagd, dan komen die uitzonderingen alsnog, alleen dan als reden om het niet te gebruiken.",
      },
      {
        vet: "Niemand heeft de nulmeting gedaan.",
        tekst:
          "Achteraf is de vraag “heeft het geholpen” dan niet te beantwoorden, en wat je niet kunt aantonen ga je ook niet uitbreiden.",
      },
      {
        vet: "Er is niet nagedacht over wat er misgaat.",
        tekst:
          "Elk systeem ligt er een keer uit. Als niemand weet wat er dan gebeurt, wordt de eerste storing het einde.",
      },
    ],
  },
  {
    id: "zelf-of-uitbesteden",
    kop: "Zelf doen of uitbesteden",
    alineas: [
      {
        tekst:
          "Zelf doen kan prima, en vaker dan partijen zoals wij toegeven. Zit er iemand in je bedrijf die handig is met systemen, heeft die er tijd voor, en is het proces overzichtelijk? Begin dan zelf. Je leert er meer van dan van welke uitleg ook, en je weet daarna veel beter wat je aan een ander zou moeten vragen.",
      },
      {
        tekst:
          "Waar het zelf doen meestal spaak loopt is niet bij het bouwen maar bij het onderhouden. Het is gebouwd door één iemand, in zijn eigen tijd, zonder dat iemand anders weet hoe het in elkaar zit. Als die persoon vertrekt of het te druk krijgt, blijft er iets achter waar niemand aankomt.",
      },
      {
        tekst:
          "De vragen die de keuze bepalen: is het straks nog te veranderen door iemand anders dan de bouwer, staat er beschreven wat het doet, en wie kijkt ernaar als het misgaat. Kun je die drie beantwoorden, dan is zelf doen een goede keuze. Kun je dat niet, dan koop je met uitbesteden vooral dat.",
      },
    ],
  },
];

export const cases = [
  {
    naam: "Een recruitmentbedrijf",
    accent: "#4CC5E8",
    ervoor:
      "Het team deed het voorwerk zelf: bedrijven opzoeken, beoordelen of er iets te halen viel, gegevens overtypen. Werk dat af moest zijn voordat er überhaupt iemand gebeld kon worden. Het gevolg was dat de ochtend opging aan voorbereiding en het bellen, waar ze goed in zijn, pas daarna begon.",
    erna:
      "Nu staat de lijst elke ochtend klaar met wie de moeite waard is. Het team begint de dag met bellen in plaats van met zoeken. Wie er benaderd wordt bepalen ze nog steeds zelf, en het systeem draait door ook als er niemand naar kijkt.",
  },
  {
    naam: "Een groothandel",
    accent: "#A78BFA",
    ervoor:
      "De inkopers liepen hun lijst artikel voor artikel na: voorraad checken, verbruik van eerdere periodes erbij pakken, inschatten wat er besteld moest worden. Uitzoekwerk dat elke keer terugkwam en dat elke keer hetzelfde was.",
    erna:
      "Nu staat het besteladvies met één knop klaar: wat urgent is, wat er in voorraad ligt, wat eruit gaat. De inkopers kijken het na, passen aan waar ze het beter weten, en bestellen. De cijfers komen uit hun eigen systeem en niet uit een schatting.",
  },
];

export const naCases = [
  "Wat deze twee gemeen hebben is niet de techniek, want die is totaal verschillend. Wat ze gemeen hebben is de vorm: het zoekwerk is eraf gegaan, de beslissing is gebleven waar hij was, en de mensen die het werk doen zijn er beter van geworden in plaats van overbodig.",
  "Bij elk bedrijf zit dat werk ergens anders. Maar het is er, en je mensen weten precies waar.",
];

export const vragen = [
  {
    vraag: "Hoe lang duurt zo'n eerste project?",
    antwoord:
      "Voor een afgebakend proces waarvan de gegevens beschikbaar zijn: enkele weken tot ongeveer anderhalve maand, inclusief de periode dat het meeloopt naast de oude manier. Duurt het veel langer, dan is het waarschijnlijk te groot ingestoken.",
  },
  {
    vraag: "Moeten wij eerst nieuwe software aanschaffen?",
    antwoord:
      "Meestal niet. In de meeste gevallen werkt het met de systemen die er al staan. Het aanschaffen van iets nieuws is een aparte beslissing en die zou niet uit een automatiseringsproject moeten voortkomen.",
  },
  {
    vraag: "Wat als onze gegevens een rommeltje zijn?",
    antwoord:
      "Dan begin je daar, en dat is geen verloren tijd. Ordelijke gegevens zijn de voorwaarde voor bijna alles wat daarna komt, ook voor dingen die niets met automatiseren te maken hebben.",
  },
  {
    vraag: "Verliezen wij de controle?",
    antwoord:
      "Nee, en dat is geen geruststelling maar een ontwerpkeuze. Het systeem doet het zoekwerk en legt het resultaat voor. Wie beslist, blijft beslissen.",
  },
  {
    vraag: "Wij zijn maar met acht man. Is dit iets voor ons?",
    antwoord:
      "Juist wel. In een klein bedrijf komt het uitzoekwerk terecht bij de mensen die het minst gemist kunnen worden, vaak de eigenaar zelf. Het verschil is daar per persoon groter, niet kleiner.",
  },
  {
    vraag: "Kunnen we ergens beginnen zonder meteen een traject in te gaan?",
    antwoord:
      "Ja. Neem één proces, meet een week lang hoeveel tijd het kost, en schrijf op hoe de beslissing wordt genomen. Met die twee dingen kun je zelf al beoordelen of het de moeite waard is, ongeacht met wie je verder gaat.",
  },
];
