// De keuzes van het gespreksformulier, gedeeld door het formulier en het scherm
// dat na versturen verschijnt. De waarden zijn dezelfde als in /api/gesprek.

export const INTERESSES = [
  { waarde: "inkoop", label: "Besteladvies en inkoop-uitzoekwerk" },
  { waarde: "vragen", label: "Vragen beantwoorden uit eigen documentatie" },
  { waarde: "offertes", label: "Offertes klaarzetten" },
  { waarde: "anders", label: "Maatwerk: iets anders bij ons" },
];

export const BEREIKEN = [
  { waarde: "bellen", label: "Bel me" },
  { waarde: "mailen", label: "Mail me" },
];

// "Wanneer komt het je uit?" is sinds 01-08 een rooster (src/lib/gesprek/momenten.ts). Niets
// aanvinken of "Maakt me niet uit" geeft dagdeel geen_voorkeur; vakjes in het
// rooster geven dagdeel momenten met de lijst.

// Wat er is verstuurd, opgeschoond zoals /api/gesprek het opslaat: ingekort, en
// alleen de velden die bij de gemaakte keuze horen.
export type Inzending = {
  interesse: string[];
  andersTekst: string;
  bereiken: string;
  telefoon: string;
  anderEmail: string;
  dagdeel: "momenten" | "geen_voorkeur";
  momenten: string[];
  voorkeur: string;
};
