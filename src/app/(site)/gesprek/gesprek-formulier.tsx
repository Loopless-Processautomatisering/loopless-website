"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";

// Het formulier achter de knop in de koude mail. Naam en bedrijf komen uit de
// ondertekende code en zijn hier vaste tekst; het e-mailadres van de lead staat
// nergens op de pagina. De code gaat ongewijzigd mee terug naar /api/gesprek,
// die hem opnieuw verifieert.

const INTERESSES = [
  { waarde: "inkoop", label: "Besteladvies en inkoop-uitzoekwerk" },
  { waarde: "vragen", label: "Vragen beantwoorden uit eigen documentatie" },
  { waarde: "offertes", label: "Offertes klaarzetten" },
  { waarde: "anders", label: "Maatwerk: iets anders bij ons" },
];

const BEREIKEN = [
  { waarde: "bellen", label: "Bel me" },
  { waarde: "mailen", label: "Mail me" },
];

const DAGDELEN = [
  { waarde: "ochtend", label: "'s Ochtends" },
  { waarde: "middag", label: "'s Middags" },
  { waarde: "geen_voorkeur", label: "Maakt me niet uit" },
];

type Fouten = { interesse?: string; bereiken?: string; telefoon?: string; dagdeel?: string };

const kaart =
  "relative overflow-hidden rounded-2xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-6 sm:p-8";
const invoer =
  "w-full rounded-lg border border-[#DCE6F5] bg-[#F7FAFF] px-4 py-3 text-[#2B3446] placeholder-[#5F6B85] transition-colors focus:border-[#4F8EF7] focus:outline-none focus:ring-2 focus:ring-[#4F8EF740]";
const veldLabel = "mb-1.5 block text-sm font-medium text-[#2B3446]";
const groepKop =
  "mb-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-[#10182B]";
// Hele rij is klikbaar; de focusring staat op de rij, zodat hij ook met het
// toetsenbord goed zichtbaar is.
const keuzeRij =
  "flex cursor-pointer items-center gap-3 rounded-lg border border-[#DCE6F5] bg-[#F7FAFF] px-4 py-3 text-[#2B3446] transition-colors hover:border-[#4F8EF7] has-[:checked]:border-[#4F8EF7] has-[:checked]:bg-[#EAF1FC] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#4F8EF7]";
const keuzeVak = "h-4 w-4 flex-shrink-0 accent-[#4F8EF7] focus:outline-none";

function Melding({ id, tekst }: { id: string; tekst?: string }) {
  if (!tekst) return null;
  return (
    <p id={id} role="alert" className="mt-2 text-sm font-medium text-[#B42323]">
      {tekst}
    </p>
  );
}

export function GesprekFormulier({
  code,
  voornaam,
  bedrijf,
}: {
  code: string;
  voornaam: string;
  bedrijf: string;
}) {
  const [interesse, setInteresse] = useState<string[]>([]);
  const [andersTekst, setAndersTekst] = useState("");
  const [bereiken, setBereiken] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [anderEmail, setAnderEmail] = useState("");
  const [dagdeel, setDagdeel] = useState("");
  const [voorkeur, setVoorkeur] = useState("");
  const [hp, setHp] = useState("");
  const [fouten, setFouten] = useState<Fouten>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const dankRef = useRef<HTMLDivElement>(null);

  // Na versturen verdwijnt het formulier; zet de focus op de dankregel zodat
  // die in beeld staat en door een schermlezer wordt voorgelezen.
  useEffect(() => {
    if (submitted) dankRef.current?.focus();
  }, [submitted]);

  const wisselInteresse = (waarde: string) => {
    setInteresse((nu) => (nu.includes(waarde) ? nu.filter((w) => w !== waarde) : [...nu, waarde]));
    setFouten((f) => ({ ...f, interesse: undefined }));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);

    const gevonden: Fouten = {};
    if (interesse.length === 0) gevonden.interesse = "Vink minstens één onderwerp aan.";
    if (!bereiken) gevonden.bereiken = "Kies of ik je mag bellen of mailen.";
    if (bereiken === "bellen" && !telefoon.trim())
      gevonden.telefoon = "Vul het nummer in waarop ik je kan bellen.";
    if (!dagdeel) gevonden.dagdeel = "Kies een dagdeel.";
    setFouten(gevonden);

    const eerste = (["interesse", "bereiken", "telefoon", "dagdeel"] as const).find(
      (k) => gevonden[k],
    );
    if (eerste) {
      const doel = e.currentTarget.querySelector<HTMLElement>(
        eerste === "telefoon" ? "#gesprek-telefoon" : `[name="${eerste}"]`,
      );
      doel?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/gesprek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          c: code,
          interesse,
          anders_tekst: andersTekst,
          bereiken,
          telefoon,
          ander_email: anderEmail,
          dagdeel,
          voorkeur,
          _hp: hp,
        }),
      });
      const antwoord: unknown = res.ok ? await res.json() : null;
      if (antwoord && typeof antwoord === "object" && (antwoord as { ok?: unknown }).ok === true) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div className={`${kaart} max-w-[760px]`}>
        <div
          ref={dankRef}
          tabIndex={-1}
          role="status"
          className="flex flex-col items-center justify-center py-12 text-center focus:outline-none"
        >
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#4F8EF7]/10">
            <ShieldCheck className="h-8 w-8 text-[#4F8EF7]" />
          </div>
          <p className="max-w-md text-lg text-[#2B3446]">
            {voornaam ? `Dank je, ${voornaam}.` : "Dank je."} Ik neem contact op om een tijdstip af
            te spreken. Je hoeft verder niets te doen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimateIn delay={0.15} className={`${kaart} max-w-[760px]`}>
      <form onSubmit={handleSubmit} noValidate>
        {/* Vaste gegevens uit de link, niet bewerkbaar */}
        <dl className="mb-8 grid gap-4 rounded-xl bg-[#F7FAFF] p-4 text-sm sm:grid-cols-2">
          {voornaam && (
            <div>
              <dt className="text-[#5F6B85]">Naam</dt>
              <dd className="break-words font-semibold text-[#10182B]">{voornaam}</dd>
            </div>
          )}
          <div>
            <dt className="text-[#5F6B85]">Bedrijf</dt>
            <dd className="break-words font-semibold text-[#10182B]">{bedrijf}</dd>
          </div>
        </dl>

        {/* Blok 1: onderwerpen */}
        <fieldset
          className="mb-8 min-w-0"
          aria-describedby={fouten.interesse ? "fout-interesse" : undefined}
        >
          <legend className={groepKop}>Waar wil je het over hebben?</legend>
          <p className="mb-5 text-sm text-[#5F6B85]">Meer dan één mag.</p>
          <div className="grid gap-3">
            {INTERESSES.map(({ waarde, label }) => (
              <label key={waarde} className={keuzeRij}>
                <input
                  type="checkbox"
                  name="interesse"
                  value={waarde}
                  checked={interesse.includes(waarde)}
                  onChange={() => wisselInteresse(waarde)}
                  className={keuzeVak}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <Melding id="fout-interesse" tekst={fouten.interesse} />
          {interesse.includes("anders") && (
            <div className="mt-4">
              <label htmlFor="gesprek-anders" className={veldLabel}>
                Waar zit bij jullie het uitzoekwerk?
              </label>
              <textarea
                id="gesprek-anders"
                name="anders_tekst"
                rows={3}
                maxLength={1000}
                value={andersTekst}
                onChange={(e) => setAndersTekst(e.target.value)}
                placeholder="Bijvoorbeeld: orderbevestigingen overtypen in het systeem."
                className={`${invoer} resize-y`}
              />
            </div>
          )}
        </fieldset>

        <div className="mb-8 border-t border-[#DCE6F5]" />

        {/* Blok 2: bereiken */}
        <fieldset
          className="mb-8 min-w-0"
          aria-describedby={fouten.bereiken ? "fout-bereiken" : undefined}
        >
          <legend className={`${groepKop} mb-5`}>Waar mag ik je op bereiken?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {BEREIKEN.map(({ waarde, label }) => (
              <label key={waarde} className={keuzeRij}>
                <input
                  type="radio"
                  name="bereiken"
                  value={waarde}
                  checked={bereiken === waarde}
                  onChange={() => {
                    setBereiken(waarde);
                    setFouten((f) => ({ ...f, bereiken: undefined, telefoon: undefined }));
                  }}
                  className={keuzeVak}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <Melding id="fout-bereiken" tekst={fouten.bereiken} />
          {bereiken === "bellen" && (
            <div className="mt-4">
              <label htmlFor="gesprek-telefoon" className={veldLabel}>
                Telefoonnummer
              </label>
              <input
                id="gesprek-telefoon"
                type="tel"
                name="telefoon"
                autoComplete="tel"
                required
                maxLength={40}
                value={telefoon}
                onChange={(e) => {
                  setTelefoon(e.target.value);
                  setFouten((f) => ({ ...f, telefoon: undefined }));
                }}
                aria-invalid={fouten.telefoon ? true : undefined}
                aria-describedby={fouten.telefoon ? "fout-telefoon" : undefined}
                className={invoer}
              />
              <Melding id="fout-telefoon" tekst={fouten.telefoon} />
            </div>
          )}
          {bereiken === "mailen" && (
            <div className="mt-4">
              <p className="mb-4 text-sm text-[#5F6B85]">
                Ik mail je op het adres waar mijn bericht naartoe ging.
              </p>
              <label htmlFor="gesprek-ander-email" className={veldLabel}>
                Liever een ander e-mailadres?
              </label>
              <input
                id="gesprek-ander-email"
                type="email"
                name="ander_email"
                autoComplete="email"
                maxLength={200}
                value={anderEmail}
                onChange={(e) => setAnderEmail(e.target.value)}
                className={invoer}
              />
            </div>
          )}
        </fieldset>

        <div className="mb-8 border-t border-[#DCE6F5]" />

        {/* Blok 3: dagdeel */}
        <fieldset
          className="min-w-0"
          aria-describedby={fouten.dagdeel ? "fout-dagdeel" : undefined}
        >
          <legend className={`${groepKop} mb-5`}>Wanneer komt het je uit?</legend>
          <div className="grid gap-3 sm:grid-cols-3">
            {DAGDELEN.map(({ waarde, label }) => (
              <label key={waarde} className={keuzeRij}>
                <input
                  type="radio"
                  name="dagdeel"
                  value={waarde}
                  checked={dagdeel === waarde}
                  onChange={() => {
                    setDagdeel(waarde);
                    setFouten((f) => ({ ...f, dagdeel: undefined }));
                  }}
                  className={keuzeVak}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <Melding id="fout-dagdeel" tekst={fouten.dagdeel} />
          <div className="mt-4">
            <label htmlFor="gesprek-voorkeur" className={veldLabel}>
              Dagen die niet kunnen, of een voorkeur
            </label>
            <input
              id="gesprek-voorkeur"
              type="text"
              name="voorkeur"
              maxLength={200}
              value={voorkeur}
              onChange={(e) => setVoorkeur(e.target.value)}
              placeholder="Bijvoorbeeld: niet op maandag."
              className={invoer}
            />
          </div>
        </fieldset>

        {/* Honeypot: onzichtbaar voor mensen, bots vullen het wel in. */}
        <input
          type="text"
          name="website"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />

        {error && (
          <div
            role="alert"
            className="mt-8 rounded-xl border border-[#E24C4C]/40 bg-[#E24C4C]/10 p-4 text-center text-sm text-[#B42323]"
          >
            Er ging iets mis. Probeer het nog eens, of antwoord op mijn mail.
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className={`${error ? "mt-4" : "mt-8"} w-full rounded-lg bg-[#4F8EF7] px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-[#3A75D8] hover:shadow-[0_8px_30px_-8px_rgba(79,142,247,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8EF7] focus-visible:ring-offset-2 disabled:opacity-50`}
        >
          {submitting ? "Versturen..." : "Verstuur"}
        </button>
        <p className="mt-4 text-center text-xs text-[#5F6B85]">
          Wat ik met je gegevens doe staat op{" "}
          <Link href="/privacy" className="text-[#4F8EF7] hover:underline">
            loopless.nl/privacy
          </Link>
          .
        </p>
      </form>
    </AnimateIn>
  );
}
