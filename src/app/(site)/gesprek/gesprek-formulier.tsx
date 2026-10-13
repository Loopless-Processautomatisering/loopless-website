"use client";

import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimateIn } from "@/components/ui/animate-in";
import { GesprekBevestiging } from "./gesprek-bevestiging";
import { useGesprekStaat } from "./gesprek-staat";
import { roosterDagen, DAGEN_PER_WEEK, type RoosterDag } from "@/lib/gesprek/momenten";
import { BEREIKEN, INTERESSES, type Inzending } from "./keuzes";

// Het formulier achter de knop in de koude mail. Naam en bedrijf komen uit de
// ondertekende code en zijn hier vaste tekst; het e-mailadres van de lead staat
// nergens op de pagina. De code gaat ongewijzigd mee terug naar /api/gesprek,
// die hem opnieuw verifieert.

// Zelfde opschoning als str() in /api/gesprek.
const schoon = (v: string, max: number) => v.trim().slice(0, max);

type Fouten = {
  interesse?: string;
  bereiken?: string;
  telefoon?: string;
  anderEmail?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Voor useSyncExternalStore: er is niets om op te abonneren, de vlag zegt alleen
// of we in de browser draaien (op de server false, na het laden true).
const geenAbonnement = () => () => {};

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

// De tabel met dagen en dagdelen. Eerst één werkweek (plus vandaag-middag vóór
// 12:00), met een knop voor de week erna: op een telefoon blijft het zo kort.
function Rooster({
  dagen,
  volgendeWeek,
  gekozen,
  gedimd,
  onWissel,
  onVolgendeWeek,
}: {
  dagen: RoosterDag[];
  volgendeWeek: boolean;
  gekozen: string[];
  gedimd: boolean;
  onWissel: (moment: string) => void;
  onVolgendeWeek: () => void;
}) {
  const vandaag = dagen.filter((d) => d.vandaag);
  const rest = dagen.filter((d) => !d.vandaag);
  const zichtbaar = [...vandaag, ...rest.slice(0, volgendeWeek ? DAGEN_PER_WEEK * 2 : DAGEN_PER_WEEK)];
  const cel =
    "flex h-11 cursor-pointer items-center justify-center rounded-lg border border-[#DCE6F5] bg-[#F7FAFF] transition-colors hover:border-[#4F8EF7] has-[:checked]:border-[#4F8EF7] has-[:checked]:bg-[#EAF1FC] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#4F8EF7]";
  return (
    <div className={`mt-4 transition-opacity ${gedimd ? "opacity-50" : ""}`}>
      <table className="w-full border-separate border-spacing-x-2 border-spacing-y-1.5 text-sm">
        <thead>
          <tr>
            <th scope="col" className="w-[38%] text-left font-normal text-[#5F6B85]">
              <span className="sr-only">Dag</span>
            </th>
            <th scope="col" className="font-medium text-[#5F6B85]">Ochtend</th>
            <th scope="col" className="font-medium text-[#5F6B85]">Middag</th>
          </tr>
        </thead>
        <tbody>
          {zichtbaar.map((dag) => (
            <tr key={dag.datum}>
              <th scope="row" className="whitespace-nowrap text-left font-medium text-[#2B3446]">
                {dag.label}
                {dag.vandaag && <span className="font-normal text-[#5F6B85]"> (vandaag)</span>}
              </th>
              {(["ochtend", "middag"] as const).map((deel) => {
                const moment = `${dag.datum}:${deel}`;
                return (
                  <td key={deel}>
                    {dag.dagdelen.includes(deel) ? (
                      <label className={cel}>
                        <input
                          type="checkbox"
                          name="momenten"
                          value={moment}
                          aria-label={`${dag.label} ${deel}`}
                          checked={gekozen.includes(moment)}
                          onChange={() => onWissel(moment)}
                          className={keuzeVak}
                        />
                      </label>
                    ) : (
                      <span aria-hidden="true" className="flex h-11 items-center justify-center text-[#9AA6BF]">
                        –
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      {!volgendeWeek && rest.length > DAGEN_PER_WEEK && (
        <button
          type="button"
          onClick={onVolgendeWeek}
          className="mt-2 text-sm font-medium text-[#3A75D8] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8EF7]"
        >
          Volgende week tonen
        </button>
      )}
    </div>
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
  // Het rooster rekent met de klok van de bezoeker, dus pas na het laden: de
  // server kent die niet, en rond 12:00 of middernacht zou de server een ander
  // rooster renderen dan de browser.
  const inDeBrowser = useSyncExternalStore(geenAbonnement, () => true, () => false);
  const [roosterVersie, setRoosterVersie] = useState(0);
  const rooster = useMemo(
    () => (inDeBrowser ? roosterDagen() : null),
    // roosterVersie: opnieuw opbouwen na "moment voorbij".
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inDeBrowser, roosterVersie],
  );
  const [momenten, setMomenten] = useState<string[]>([]);
  const [geenVoorkeur, setGeenVoorkeur] = useState(false);
  const [volgendeWeek, setVolgendeWeek] = useState(false);
  const [momentVoorbij, setMomentVoorbij] = useState(false);
  const [voorkeur, setVoorkeur] = useState("");
  const [hp, setHp] = useState("");
  const [fouten, setFouten] = useState<Fouten>({});
  const [submitting, setSubmitting] = useState(false);
  const [verstuurd, setVerstuurd] = useState<Inzending | null>(null);
  const [error, setError] = useState(false);
  const { meldVerstuurd } = useGesprekStaat();
  // Een nieuwe poging na een fout met dezelfde inhoud is dezelfde inzending en
  // geeft geen tweede rij. Herladen geeft een nieuw id.
  const inzendingId = useRef("");
  // De inhoud waarvoor het huidige inzendingId is gemaakt. Een herhaalde poging
  // met dezelfde inhoud houdt het id (de ontvanger herkent dan het duplicaat);
  // een gewijzigde inhoud krijgt een nieuw id, anders bevestigt de ontvanger de
  // oude rij terwijl dit scherm de nieuwe waarden toont (Codex 2026-10-07).
  const inzendingInhoud = useRef("");

  const wisselMoment = (moment: string) => {
    setMomenten((nu) => (nu.includes(moment) ? nu.filter((m) => m !== moment) : [...nu, moment]));
    setGeenVoorkeur(false);
    setMomentVoorbij(false);
  };

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
    if (bereiken === "mailen" && anderEmail.trim() && !EMAIL.test(anderEmail.trim()))
      gevonden.anderEmail = "Dit lijkt geen e-mailadres. Laat het leeg of vul het aan.";
    setFouten(gevonden);

    const eerste = (["interesse", "bereiken", "telefoon", "anderEmail"] as const).find(
      (k) => gevonden[k],
    );
    if (eerste) {
      const doel = e.currentTarget.querySelector<HTMLElement>(
        eerste === "telefoon"
          ? "#gesprek-telefoon"
          : eerste === "anderEmail"
            ? "#gesprek-ander-email"
            : `[name="${eerste}"]`,
      );
      doel?.focus();
      return;
    }

    // Momentopname van wat er nu de deur uit gaat. De velden blijven tijdens het
    // versturen bewerkbaar, dus het scherm erna leest hieruit en niet uit de
    // velden, en toont dezelfde waarden als de server opslaat.
    const anders = interesse.includes("anders");
    // Het rooster is niet verplicht: niets aangevinkt telt als "maakt niet uit".
    const metMomenten = !geenVoorkeur && momenten.length > 0;
    const inzending: Inzending = {
      interesse: INTERESSES.map((i) => i.waarde).filter((w) => interesse.includes(w)),
      andersTekst: anders ? schoon(andersTekst, 1000) : "",
      bereiken,
      telefoon: bereiken === "bellen" ? schoon(telefoon, 40) : "",
      anderEmail: bereiken === "mailen" ? schoon(anderEmail, 200) : "",
      dagdeel: metMomenten ? "momenten" : "geen_voorkeur",
      momenten: metMomenten ? [...momenten].sort() : [],
      voorkeur: schoon(voorkeur, 200),
    };

    const inhoud = JSON.stringify(inzending);
    if (!inzendingId.current || inzendingInhoud.current !== inhoud) {
      inzendingId.current = crypto.randomUUID();
      inzendingInhoud.current = inhoud;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/gesprek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          c: code,
          inzending_id: inzendingId.current,
          interesse: inzending.interesse,
          anders_tekst: inzending.andersTekst,
          bereiken: inzending.bereiken,
          telefoon: inzending.telefoon,
          ander_email: inzending.anderEmail,
          dagdeel: inzending.dagdeel,
          ...(metMomenten ? { momenten: inzending.momenten } : {}),
          voorkeur: inzending.voorkeur,
          _hp: hp,
        }),
      });
      const antwoord: unknown = await res.json().catch(() => null);
      const veld = (k: string) =>
        antwoord && typeof antwoord === "object" ? (antwoord as Record<string, unknown>)[k] : undefined;
      if (res.ok && veld("ok") === true) {
        setVerstuurd(inzending);
        meldVerstuurd();
      } else if (veld("fout") === "moment voorbij") {
        // De pagina stond lang open: rooster opnieuw opbouwen en alleen de
        // vinkjes houden die er nog in staan.
        const nieuw = roosterDagen();
        const geldig = new Set(nieuw.flatMap((d) => d.dagdelen.map((dd) => `${d.datum}:${dd}`)));
        setRoosterVersie((v) => v + 1);
        setMomenten((nu) => nu.filter((m) => geldig.has(m)));
        setMomentVoorbij(true);
        document.getElementById("gesprek-wanneer")?.scrollIntoView({ block: "start" });
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setSubmitting(false);
  }

  if (verstuurd) {
    return <GesprekBevestiging voornaam={voornaam} inzending={verstuurd} />;
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
                onChange={(e) => {
                  setAnderEmail(e.target.value);
                  setFouten((f) => ({ ...f, anderEmail: undefined }));
                }}
                aria-invalid={fouten.anderEmail ? true : undefined}
                aria-describedby={fouten.anderEmail ? "fout-ander-email" : undefined}
                className={invoer}
              />
              <Melding id="fout-ander-email" tekst={fouten.anderEmail} />
            </div>
          )}
        </fieldset>

        <div className="mb-8 border-t border-[#DCE6F5]" />

        {/* Blok 3: wanneer. Niet verplicht; niets aanvinken telt als "maakt niet uit". */}
        <fieldset id="gesprek-wanneer" className="min-w-0 scroll-mt-28">
          <legend className={groepKop}>Wanneer komt het je uit?</legend>
          <p className="mb-5 text-sm text-[#5F6B85]">
            Vink aan wat kan, meer dan één mag. Ik bevestig één moment, per mail of telefoon.
          </p>
          <label className={keuzeRij}>
            <input
              type="checkbox"
              name="geen_voorkeur"
              checked={geenVoorkeur}
              onChange={(e) => {
                setGeenVoorkeur(e.target.checked);
                if (e.target.checked) setMomenten([]);
                setMomentVoorbij(false);
              }}
              className={keuzeVak}
            />
            <span>Maakt me niet uit</span>
          </label>
          {momentVoorbij && (
            <p role="alert" className="mt-3 text-sm font-medium text-[#B42323]">
              Een van de gekozen momenten is al voorbij. Kijk nog even of het klopt en verstuur
              opnieuw.
            </p>
          )}
          {rooster && (
            <Rooster
              dagen={rooster}
              volgendeWeek={volgendeWeek}
              gekozen={momenten}
              gedimd={geenVoorkeur}
              onWissel={wisselMoment}
              onVolgendeWeek={() => setVolgendeWeek(true)}
            />
          )}
          <div className="mt-5">
            <label htmlFor="gesprek-voorkeur" className={veldLabel}>
              Nog iets over het moment? (optioneel)
            </label>
            <input
              id="gesprek-voorkeur"
              type="text"
              name="voorkeur"
              maxLength={200}
              value={voorkeur}
              onChange={(e) => setVoorkeur(e.target.value)}
              placeholder="Bijvoorbeeld: liefst na 10 uur."
              className={invoer}
            />
          </div>
        </fieldset>

        {/* Honeypot: onzichtbaar voor mensen, bots vullen het wel in. */}
        <input
          type="text"
          name="gesprek_extra"
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
