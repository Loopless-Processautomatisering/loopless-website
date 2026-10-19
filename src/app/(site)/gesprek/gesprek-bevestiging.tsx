"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { momentenRegels } from "@/lib/gesprek/momenten";
import { INTERESSES, type Inzending } from "./keuzes";

// Het scherm na versturen: wat er is genoteerd, wat er nu gebeurt en een
// fictief voorbeeld van het plan. Het leest alleen uit de momentopname van de
// inzending; er wordt niets opgehaald.

const VOORBEELDEN: Record<string, { hoogte: number; onderwerp: string; alt: string }> = {
  inkoop: {
    hoogte: 1168,
    onderwerp: "inkoop",
    alt: "Fictief voorbeeld van een aanpakplan voor een verzonnen technische handel, over het uitzoekwerk vóór een bestelronde: hoe het nu loopt, hoe het straks loopt, een voorbeeld van het besteladvies, wie controleert en wat er van het bedrijf nodig is.",
  },
  vragen: {
    hoogte: 1180,
    onderwerp: "vragen uit eigen documentatie",
    alt: "Fictief voorbeeld van een aanpakplan voor een verzonnen technische handel, over het zoekwerk achter een technische klantvraag: hoe het nu loopt, hoe het straks loopt, een voorbeeld van een klaargezet antwoord met bron, wie controleert en wat er van het bedrijf nodig is.",
  },
  offertes: {
    hoogte: 1112,
    onderwerp: "offertes",
    alt: "Fictief voorbeeld van een aanpakplan voor een verzonnen technische handel, over het werk vóór een offerte de deur uit gaat: hoe het nu loopt, hoe het straks loopt, een voorbeeld van een conceptofferte, wie controleert en wat er van het bedrijf nodig is.",
  },
};

const blokKop =
  "mb-5 font-[family-name:var(--font-heading)] text-lg font-semibold text-[#10182B]";
const scheiding = "my-8 border-t border-[#DCE6F5]";

export function GesprekBevestiging({
  voornaam,
  inzending,
}: {
  voornaam: string;
  inzending: Inzending;
}) {
  const dankRef = useRef<HTMLParagraphElement>(null);

  // Het formulier is weg; zet de focus op de dankregel zodat die in beeld staat
  // en door een schermlezer wordt voorgelezen. Alleen die regel is de
  // statusmelding, de rest staat onder gewone koppen.
  useEffect(() => {
    dankRef.current?.focus();
  }, []);

  const { interesse, andersTekst, bereiken, telefoon, anderEmail, dagdeel, momenten, voorkeur } = inzending;
  const bellen = bereiken === "bellen";

  const onderwerpen = INTERESSES.filter((i) => interesse.includes(i.waarde)).map((i) => i.label);
  const bereikRegel = bellen
    ? `Ik bel je op ${telefoon}`
    : anderEmail
      ? `Ik mail je op ${anderEmail}`
      : "Ik mail je op het adres waar mijn bericht naartoe ging";
  const metMomenten = dagdeel === "momenten" && momenten.length > 0;

  // Eén voorbeeld: dat van het eerste aangevinkte onderwerp. Voor maatwerk
  // bestaat geen voorbeeld, dan tonen we dat van inkoop.
  const gekozen = ["inkoop", "vragen", "offertes"].find((w) => interesse.includes(w));
  const voorbeeld = VOORBEELDEN[gekozen ?? "inkoop"];
  const beeld = `/gesprek/voorbeeldplan-${gekozen ?? "inkoop"}.png`;

  const stappen = [
    {
      kop: bellen ? "Ik bel je" : "Ik mail je",
      tekst: metMomenten
        ? "Ik bevestig zo snel mogelijk één van deze momenten. Je hoeft verder niets te doen."
        : "Om een tijdstip af te spreken. Je hoeft verder niets te doen.",
    },
    {
      kop: "Een half uur bellen",
      tekst: "Jij vertelt hoe het nu loopt. Ik vraag door op waar de tijd in zit.",
    },
    {
      kop: "Jij krijgt het plan",
      tekst:
        "Eén pagina, per mail, op jullie eigen stappen en gegevens. Die is van jullie, wat je er ook mee doet.",
    },
  ];

  return (
    <div className="relative max-w-[760px] overflow-hidden rounded-2xl border border-[#DCE6F5] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] sm:p-8">
      {/* Blok 1: bevestiging */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#4F8EF7]/10">
          <ShieldCheck className="h-6 w-6 text-[#4F8EF7]" />
        </div>
        <p
          ref={dankRef}
          tabIndex={-1}
          role="status"
          className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[#10182B] focus:outline-none"
        >
          {voornaam ? `Dank je, ${voornaam}.` : "Dank je."} Het staat genoteerd.
        </p>
      </div>
      <dl className="grid gap-4 rounded-xl bg-[#F7FAFF] p-4 text-sm">
        <div>
          <dt className="text-[#5F6B85]">Onderwerp</dt>
          <dd className="break-words font-semibold text-[#10182B]">
            <ul>
              {onderwerpen.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            {andersTekst && (
              <p className="mt-1 whitespace-pre-line font-normal text-[#2B3446]">{andersTekst}</p>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[#5F6B85]">Bereiken</dt>
          <dd className="break-words font-semibold text-[#10182B]">{bereikRegel}</dd>
        </div>
        <div>
          <dt className="text-[#5F6B85]">Wanneer</dt>
          <dd className="break-words font-semibold text-[#10182B]">
            {metMomenten ? (
              <ul>
                {momentenRegels(momenten).map((regel) => (
                  <li key={regel}>{regel}</li>
                ))}
              </ul>
            ) : (
              "Maakt me niet uit"
            )}
            {voorkeur && <p className="mt-1 font-normal text-[#2B3446]">{voorkeur}</p>}
          </dd>
        </div>
      </dl>

      <div className={scheiding} />

      {/* Blok 2: de stappen */}
      <h2 className={blokKop}>Dit gebeurt er nu</h2>
      <ol className="grid gap-5">
        {stappen.map(({ kop, tekst }, i) => (
          <li key={kop} className="flex gap-4">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF1FC] font-[family-name:var(--font-heading)] text-sm font-bold text-[#3A75D8]"
            >
              {i + 1}
            </span>
            <div>
              <h3 className="font-semibold text-[#10182B]">{kop}</h3>
              <p className="mt-1 text-[#5F6B85]">{tekst}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={scheiding} />

      {/* Blok 3: het voorbeeldplan */}
      <h2 className={`${blokKop} !mb-2`}>Zo ziet dat plan eruit</h2>
      <p className="text-[#5F6B85]">
        Een voorbeeld, van een verzonnen bedrijf. In jouw plan staat wat jij in het gesprek
        vertelt.
      </p>
      {!gekozen ? (
        <p className="mt-2 text-[#5F6B85]">
          Jouw onderwerp is maatwerk. Dit voorbeeld gaat over inkoop en laat zien hoe zo&apos;n
          plan is opgebouwd.
        </p>
      ) : (
        interesse.length > 1 && (
          <p className="mt-2 text-[#5F6B85]">
            Je vinkte meer dan één onderwerp aan. Het plan gaat over één proces; welk, kiezen we
            in het gesprek. Dit voorbeeld gaat over {voorbeeld.onderwerp}.
          </p>
        )
      )}
      <a
        href={beeld}
        target="_blank"
        rel="noopener"
        className="mt-5 block overflow-hidden rounded-xl border border-[#DCE6F5] transition-colors hover:border-[#4F8EF7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8EF7] focus-visible:ring-offset-2"
      >
        <Image
          src={beeld}
          alt={voorbeeld.alt}
          width={1240}
          height={voorbeeld.hoogte}
          sizes="(min-width: 760px) 700px, 100vw"
          className="h-auto w-full"
        />
        <span className="block border-t border-[#DCE6F5] bg-[#F7FAFF] px-4 py-3 text-sm font-medium text-[#3A75D8]">
          Bekijk het voorbeeld groot (opent in een nieuw tabblad)
        </span>
      </a>

      <div className={scheiding} />

      {/* Blok 4: slot */}
      <p className="text-[#2B3446]">Schiet je nog iets te binnen, antwoord dan op mijn mail.</p>
    </div>
  );
}
