"use client";

import { useState } from "react";
import Link from "next/link";

// Oplossings-configurator — kaartset "alternatief 5+1" (besloten 2026-07-23).
// Positionerings-regels (HARD): mens-eerst, geen efficiëntie/productiviteit,
// geen cijfers/besparingen, "systeem" altijd met object, AI niet als kop,
// bewijs bij naam alleen Drabor + Vuljevacature. Geen em-dashes in copy.
// Flow: intro → grootte → pijn-kaarten → aanscherping → gegevens → uitslag.
// De uitslag zit bewust ACHTER de gegevens-gate (besluit Wessel 2026-07-23);
// sinds de review-ronde wordt de uitslag ook per mail naar de lead gestuurd
// (n8n rendert de blokken uit payload.uitslag, copy leeft alleen hier).
// "Wessel neemt er één keer contact over op" is een harde belofte: max één
// opvolg-poging (besluit Wessel 2026-07-23). Die belofte staat bewust NIET
// meer in de copy (besluit 2026-08-01: te veel uitleg, wie zijn mailadres
// achterlaat verwacht sowieso opvolging) maar geldt nog wel.
// De uitslag-CTA stuurt geen bezoeker naar een leeg formulier maar hergebruikt
// de al ingevulde gegevens: tweede POST met gesprek_gevraagd: true.

type CardId = "vragen" | "beslissen" | "benaderen" | "overtypen" | "vacature" | "offertes";

type Card = {
  id: CardId;
  // Kort label boven de pijn-zin: maakt de keuzestap scanbaar in plaats van
  // acht volzinnen onder elkaar (vereenvoudigings-ronde 2026-08-07).
  label: string;
  pijn: string;
  kop: string;
  body: string;
  controle: string;
  bewijs?: string;
};

const CARDS: Card[] = [
  {
    id: "vragen",
    label: "Steeds dezelfde vragen",
    pijn: "Mijn mensen beantwoorden de hele dag dezelfde vragen",
    kop: "Je binnendienst helpt weer klanten, in plaats van antwoorden op te zoeken.",
    body: "Elke vraag die vaker langskomt, zoekt nu iemand opnieuw op in handleidingen, oude mails en leveranciersdocumenten. Een systeem dat die stukken kent, zet het antwoord klaar op het moment dat de vraag binnenkomt, met erbij waar het vandaan komt.",
    controle: "Jouw mensen controleren het antwoord voordat het de deur uit gaat.",
  },
  {
    id: "beslissen",
    label: "Uitzoeken voor je kunt bestellen",
    pijn: "Voor elke bestelling zoekt iemand eerst prijzen, voorraad en levertijden bij elkaar",
    kop: "Je inkoper koopt weer in, in plaats van uit te zoeken.",
    body: "Nu struint je inkoper leverancierslijsten, mail en het voorraadscherm af voordat er besteld kan worden. Dat verzamelwerk gaat naar de achtergrond: 's ochtends staat het besteladvies al klaar, met de prijzen, voorraad en levertijden erbij.",
    controle: "Jij blijft beslissen. Het advies is een voorstel, geen bestelling. Je inkoper controleert het en drukt zelf op de knop.",
    bewijs: "Zo werkt het bij Drabor, een groothandel: de inkopers vragen met één knop een besteladvies op en controleren het voordat er iets besteld wordt.",
  },
  {
    id: "benaderen",
    label: "Zelf klanten bij elkaar zoeken",
    pijn: "We zoeken met de hand uit welke bedrijven we benaderen",
    kop: "Elke ochtend ligt de lijst klaar. Je sales voert weer gesprekken.",
    body: "Nu kost elke nieuwe klant eerst een middag zoeken en lijstjes maken. Een systeem doet dat zoeken en screenen op de achtergrond en legt er elke ochtend alleen de bedrijven neer die passen bij wat je verkoopt.",
    controle: "Jouw mensen kiezen wie ze benaderen en voeren het gesprek. Het systeem heeft alleen het zoekwerk gedaan.",
    bewijs: "Zo werkt het bij vuljevacature.nl: de leadkwalificatie draait elke ochtend vanzelf, het team benadert de kandidaten.",
  },
  {
    id: "overtypen",
    label: "Gegevens overtypen",
    pijn: "Gegevens gaan met de hand van de mail naar Excel naar ons systeem",
    kop: "Niemand typt meer over. De fouten die daarbij insluipen, verdwijnen.",
    body: "Een order of bevestiging komt per mail binnen, iemand typt hem over in Excel, en daarna nog een keer in jullie eigen systeem. Een systeem dat die mail en bestanden zelf leest, zet de gegevens in één keer op de juiste plek.",
    controle: "Twijfelgevallen legt het systeem apart voor een mens. Niets verdwijnt ongezien in de administratie.",
  },
  {
    id: "vacature",
    label: "Vacature die niet ingevuld raakt",
    pijn: "We zoeken al maanden iemand, maar kunnen niemand vinden",
    kop: "Het werk komt af zonder dat je iemand hoeft te vinden.",
    body: "Vaak staat die vacature open omdat je team verzuipt in uitzoekwerk. Als een systeem dat werk doet, doen de mensen die je al hebt weer hun vak.",
    controle: "Niemand wordt vervangen. Dit gaat over de vacature die je niet ingevuld krijgt, niet over de mensen die er zijn.",
  },
  {
    id: "offertes",
    label: "Offertes en facturen maken",
    pijn: "Offertes of facturen maken kost steeds opnieuw veel tijd",
    kop: "De concept-offerte staat klaar. Jij controleert en verstuurt.",
    body: "Nu begint elke offerte met een leeg document en zoeken naar tarieven en oude offertes. Een systeem dat jullie tarieven, productinfo en eerdere offertes kent, zet het concept alvast klaar. Jij hoeft alleen nog aan te vullen wat deze klant anders maakt.",
    controle: "Er gaat niets de deur uit zonder jouw controle. Jij zet de kennis en de prijs erin en drukt op versturen.",
  },
];

const MODIFIER_ID = "kennis-hoofd";
const ESCAPE_ID = "anders";

const SIZES = ["Minder dan 10", "10 tot 50", "50 tot 100", "Meer dan 100"] as const;

// Aanscherpings-vragen: alleen voor de eerst aangevinkte relevante kaart.
const SHARPEN: Partial<Record<CardId, { vraag: string; opties: [string, string] }>> = {
  vragen: {
    vraag: "Staan de antwoorden ergens vast (handleidingen, leveranciersdocs, oude mail), of zitten ze vooral in iemands hoofd?",
    opties: ["Ze staan grotendeels vast", "Vooral in iemands hoofd"],
  },
  beslissen: {
    vraag: "Gaat dat uitzoeken volgens vaste stappen, of is het elke keer echt anders?",
    opties: ["Meestal vaste stappen", "Elke keer echt anders"],
  },
  vacature: {
    vraag: "Welk werk zou die persoon vooral gaan doen?",
    opties: ["Vragen beantwoorden, uitzoeken of gegevens verwerken", "Iets heel anders (vakwerk, fysiek werk)"],
  },
};

const VAKWERK_PANEL = {
  kop: "Eerlijk antwoord: voor vakwerk of fysiek werk bouw je geen systeem.",
  tekst:
    "Die vacature los je niet op met automatisering, en dat gaan we ook niet beweren. Wat wél vaak kan: het uitzoek- en administratiewerk rond die functie weghalen, zodat de mensen die je hebt meer aan hun echte werk toekomen. Dat is een gesprek waard, geen belofte.",
};

const BELOFTE =
  "Binnen 4 tot 6 weken draait er één proces dat je nu handmatig doet. Vaste prijs, duidelijke acceptatiecriteria vooraf. Werkt het niet zoals afgesproken, dan betaal je de laatste termijn niet.";

// Het losse intro-scherm is vervallen (2026-08-07): het vroeg niets en kostte
// een extra klik. De belofte staat nu boven de eerste vraag.
type Step = "grootte" | "kaarten" | "aanscherping" | "gegevens" | "uitslag";

// Vast totaal in de teller: de aanscherping telt als vervolg op vraag 2, zodat
// het getal niet halverwege verspringt.
const TOTAAL_VRAGEN = 3;

export function Configurator() {
  const [step, setStep] = useState<Step>("grootte");
  const [grootte, setGrootte] = useState<string>("");
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [aanscherping, setAanscherping] = useState<Record<string, string>>({});
  const [naam, setNaam] = useState("");
  const [bedrijf, setBedrijf] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [hp, setHp] = useState("");
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendFailed, setSendFailed] = useState(false);
  const [gesprek, setGesprek] = useState<"idle" | "sending" | "done" | "error">("idle");

  const toggle = (id: string) =>
    setGekozen((g) => (g.includes(id) ? g.filter((x) => x !== id) : [...g, id]));

  const gekozenKaarten = CARDS.filter((c) => gekozen.includes(c.id));
  const isEscapeOnly = gekozen.includes(ESCAPE_ID) && gekozenKaarten.length === 0;
  const sharpenTargets = gekozenKaarten.filter((c) => SHARPEN[c.id]);
  const vacatureNaarVakwerk = aanscherping["vacature"] === SHARPEN.vacature!.opties[1];
  // Het vakwerk-antwoord vervangt alleen de vacature-kaart, niet de andere gekozen kaarten.
  const zichtbareKaarten = gekozenKaarten.filter(
    (c) => !(vacatureNaarVakwerk && c.id === "vacature"),
  );

  const nuances: string[] = [];
  if (grootte === SIZES[0])
    nuances.push(
      "Eerlijk: met minder dan 10 mensen loont een systeem alleen als het uitzoekwerk echt dagelijks terugkomt. Vaak is één gericht gesprek dan waardevoller dan een bouwtraject.",
    );
  if (grootte === SIZES[3])
    nuances.push(
      "Boven de 100 mensen spelen er meestal ook IT-afdelingen en bestaande systemen mee. Dat kan prima, maar het gesprek gaat dan eerst over waar wij naast jullie eigen mensen passen.",
    );
  if (gekozen.includes(MODIFIER_ID))
    nuances.push(
      "Je gaf aan dat de kennis vooral in het hoofd van één of twee mensen zit. Dan is de eerlijke eerste stap: die kennis vastleggen. Pas daarna kan een systeem er iets mee. Dat vastleggen hoort bij het traject.",
    );
  if (aanscherping["vragen"] === SHARPEN.vragen!.opties[1])
    nuances.push(
      "De antwoorden zitten nu vooral in hoofden. Eerst vastleggen, dan pas een systeem erop. Dat is minder spannend, maar wel de volgorde die werkt.",
    );
  if (aanscherping["beslissen"] === SHARPEN.beslissen!.opties[1])
    nuances.push(
      "Als het uitzoeken elke keer echt anders is, neemt een systeem een deel over en houdt de mens de leiding. Ook dat is winst, maar we beloven niet meer dan dat.",
    );

  const naKaarten = () => setStep(sharpenTargets.length > 0 ? "aanscherping" : "gegevens");

  const buildPayload = (gesprekGevraagd: boolean) => {
    return {
      naam: naam.trim(),
      bedrijf: bedrijf.trim(),
      email: email.trim(),
      telefoon: telefoon.trim(),
      grootte,
      keuzes: gekozen,
      aanscherping,
      pijn_zinnen: gekozenKaarten.map((c) => c.pijn),
      escape: gekozen.includes(ESCAPE_ID),
      modifier_kennis: gekozen.includes(MODIFIER_ID),
      // Vraagt de bezoeker zélf om een gesprek, dan is dat het sterkste signaal
      // dat er is. n8n zet daar een aparte badge op in de intake-mail.
      gesprek_gevraagd: gesprekGevraagd,
      _hp: hp,
      // Render-klare uitslag voor de mail naar de lead: n8n rendert alleen,
      // de copy heeft precies één bron (dit bestand).
      uitslag: {
        escape_only: isEscapeOnly,
        vakwerk: vacatureNaarVakwerk ? VAKWERK_PANEL : null,
        kaarten: zichtbareKaarten.map(({ kop, body, controle, bewijs }) => ({
          kop,
          body,
          controle,
          bewijs: bewijs ?? "",
        })),
        nuances,
        belofte: BELOFTE,
      },
    };
  };

  const post = async (gesprekGevraagd: boolean) => {
    const res = await fetch("/api/configurator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(gesprekGevraagd)),
    });
    return res.ok;
  };

  const submit = async () => {
    if (!naam.trim() || !bedrijf.trim() || !email.trim() || !/.+@.+\..+/.test(email)) {
      setFormError("Vul in elk geval je naam, bedrijf en een geldig e-mailadres in.");
      return;
    }
    setFormError("");
    setSending(true);
    try {
      setSendFailed(!(await post(false)));
    } catch {
      // Inzending mag de bezoeker nooit blokkeren: uitslag tonen we sowieso,
      // maar we melden wel dat de gegevens niet zijn aangekomen.
      setSendFailed(true);
    }
    setSending(false);
    setStep("uitslag");
  };

  // Tweede inzending vanaf de uitslag: dezelfde gegevens, nu met de vraag om
  // een gesprek. De bezoeker hoeft niets opnieuw in te vullen.
  const vraagGesprek = async () => {
    setGesprek("sending");
    try {
      setGesprek((await post(true)) ? "done" : "error");
    } catch {
      setGesprek("error");
    }
  };

  return (
    <div className="mx-auto max-w-[760px] px-6">
      {step === "grootte" && (
        <>
          <div className="mb-8">
            <h1 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B] md:text-4xl">
              Welk werk zou een systeem bij jou kunnen overnemen?
            </h1>
            <p className="text-lg leading-relaxed text-[#5F6B85]">
              Drie vragen, ongeveer 2 minuten. Je krijgt een concreet overzicht, geen
              verkooppraatje. Niemand wordt vervangen: jouw mensen controleren en beslissen.
            </p>
          </div>
          <Panel>
            <StepLabel n={1} />
            <h2 className="mb-6 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">
              Hoeveel mensen werken er bij jullie?
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {SIZES.map((s) => (
                <ChoiceButton key={s} active={grootte === s} onClick={() => setGrootte(s)}>
                  {s}
                </ChoiceButton>
              ))}
            </div>
            <NavRow verder={() => setStep("kaarten")} verderDisabled={!grootte} />
          </Panel>
        </>
      )}

      {step === "kaarten" && (
        <Panel>
          <StepLabel n={2} />
          <h2 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">
            Je mensen zijn meer tijd kwijt aan uitzoeken dan aan hun eigenlijke werk. Waar zit dat
            bij jou?
          </h2>
          <p className="mb-6 text-[#5F6B85]">
            Wij bouwen systemen die het werk afleveren, niet nog een chatbox. Kies wat herkenbaar
            is, meerdere mag.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {CARDS.map((c) => (
              <ChoiceButton key={c.id} active={gekozen.includes(c.id)} onClick={() => toggle(c.id)}>
                <span className="block font-semibold">{c.label}</span>
                <span className="mt-1 block text-sm opacity-70">
                  &ldquo;{c.pijn}&rdquo;
                </span>
              </ChoiceButton>
            ))}
          </div>
          <div className="mt-6 border-t border-[#DCE6F5] pt-6">
            <div className="grid gap-3 sm:grid-cols-2">
              <ChoiceButton active={gekozen.includes(MODIFIER_ID)} onClick={() => toggle(MODIFIER_ID)}>
                <span className="block font-semibold">Kennis zit in één hoofd</span>
                <span className="mt-1 block text-sm opacity-70">
                  &ldquo;De kennis zit vooral in het hoofd van één of twee mensen&rdquo;
                </span>
              </ChoiceButton>
              <ChoiceButton active={gekozen.includes(ESCAPE_ID)} onClick={() => toggle(ESCAPE_ID)}>
                <span className="block font-semibold">Iets anders</span>
                <span className="mt-1 block text-sm opacity-70">
                  Ik weet het niet precies
                </span>
              </ChoiceButton>
            </div>
          </div>
          <NavRow
            terug={() => setStep("grootte")}
            verder={naKaarten}
            verderDisabled={gekozenKaarten.length === 0 && !gekozen.includes(ESCAPE_ID)}
          />
        </Panel>
      )}

      {step === "aanscherping" && (
        <Panel>
          <StepLabel n={2} />
          {sharpenTargets.map((c) => {
            const s = SHARPEN[c.id]!;
            return (
              <div key={c.id} className="mb-8">
                <p className="mb-1 text-sm text-[#5F6B85]">Over &ldquo;{c.pijn}&rdquo;:</p>
                <h3 className="mb-4 font-[family-name:var(--font-heading)] text-xl font-bold text-[#10182B]">
                  {s.vraag}
                </h3>
                <div className="flex flex-col gap-3">
                  {s.opties.map((o) => (
                    <ChoiceButton
                      key={o}
                      active={aanscherping[c.id] === o}
                      onClick={() => setAanscherping((a) => ({ ...a, [c.id]: o }))}
                    >
                      {o}
                    </ChoiceButton>
                  ))}
                </div>
              </div>
            );
          })}
          <NavRow
            terug={() => setStep("kaarten")}
            verder={() => setStep("gegevens")}
            verderDisabled={sharpenTargets.some((c) => !aanscherping[c.id])}
          />
        </Panel>
      )}

      {step === "gegevens" && (
        <Panel>
          <StepLabel n={3} />
          <h2 className="mb-2 font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">
            Bijna klaar. Waar mag het overzicht heen?
          </h2>
          <p className="mb-6 text-[#5F6B85]">
            Je ziet het overzicht direct op je scherm en krijgt het ook per mail. Je praat straks
            direct met degene die het bouwt, geen verkoper.
          </p>
          <div className="mb-3 grid gap-3 md:grid-cols-2">
            <Input label="Naam" placeholder="Jouw naam" value={naam} onChange={setNaam} />
            <Input label="Bedrijf" placeholder="Jouw bedrijf" value={bedrijf} onChange={setBedrijf} />
            <Input label="E-mailadres" placeholder="naam@bedrijf.nl" type="email" value={email} onChange={setEmail} />
            <Input label="Telefoon (optioneel)" placeholder="+31 6 12345678" type="tel" value={telefoon} onChange={setTelefoon} />
          </div>
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
          <p className="mb-2 text-xs text-[#5F6B85]">
            We gebruiken je gegevens alleen om je het overzicht te mailen en er één keer contact
            over op te nemen. Zie de{" "}
            <Link href="/privacy" className="text-[#4F8EF7] hover:underline">
              privacyverklaring
            </Link>
            .
          </p>
          {formError && <p className="mb-2 text-sm text-[#C77B16]">{formError}</p>}
          <NavRow
            terug={() => setStep(sharpenTargets.length > 0 ? "aanscherping" : "kaarten")}
            verder={submit}
            verderLabel={sending ? "Versturen..." : "Toon mijn overzicht"}
            verderDisabled={sending}
          />
        </Panel>
      )}

      {step === "uitslag" && (
        <div className="flex flex-col gap-6">
          <Panel>
            <h2 className="mb-2 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">
              {isEscapeOnly ? "Dan is een gesprek eerlijker dan een uitslag." : `Dit staat er voor jou klaar, ${naam.split(" ")[0]}.`}
            </h2>
            <p className="text-[#5F6B85]">
              {isEscapeOnly
                ? "Jouw situatie past niet in een standaardhokje, en dat gaan we ook niet forceren. In een kort gesprek komen we er samen achter waar de tijd bij jullie echt blijft hangen, en of een systeem daar iets kan betekenen."
                : "Geen offerte, geen verplichting: dit is wat een systeem bij jullie zou kunnen overnemen, op basis van wat je aangaf."}
            </p>
            {sendFailed && (
              <p className="mt-4 text-sm text-[#C77B16]">
                Door een technisch probleem zijn je gegevens niet verstuurd. Het overzicht hieronder
                klopt gewoon, maar mail even naar{" "}
                <a href="mailto:wessel@loopless.nl" className="font-semibold underline">
                  wessel@loopless.nl
                </a>
                , dan komt het alsnog goed.
              </p>
            )}
          </Panel>

          {/* Alleen de eerste kaart staat open. Wie er drie aanvinkt kreeg
              anders een lap van honderden woorden voor de CTA in beeld kwam. */}
          {zichtbareKaarten.map((c, i) => (
            <UitslagKaart key={c.id} kaart={c} standaardOpen={i === 0} />
          ))}

          {vacatureNaarVakwerk && (
            <Panel>
              <h3 className="mb-3 font-[family-name:var(--font-heading)] text-xl font-bold text-[#10182B]">
                {VAKWERK_PANEL.kop}
              </h3>
              <p className="leading-relaxed text-[#5F6B85]">{VAKWERK_PANEL.tekst}</p>
            </Panel>
          )}

          {nuances.length > 0 && (
            <Panel>
              <h3 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B]">
                Eerlijk erbij
              </h3>
              <ul className="flex flex-col gap-2">
                {nuances.map((n) => (
                  <li key={n} className="leading-relaxed text-[#5F6B85]">
                    {n}
                  </li>
                ))}
              </ul>
            </Panel>
          )}

          <Panel>
            <h3 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B]">
              Wat je krijgt als je doorgaat
            </h3>
            <p className="mb-6 text-[#2B3446]">{BELOFTE}</p>

            {gesprek === "done" ? (
              <p className="text-[#2B3446]">
                <span className="font-semibold">Genoteerd, {naam.split(" ")[0]}.</span> Wessel mailt
                je binnen 24 uur om een moment te prikken. Liever meteen zelf?{" "}
                <a href="mailto:wessel@loopless.nl" className="font-semibold underline">
                  wessel@loopless.nl
                </a>
              </p>
            ) : (
              <>
                <PrimaryButton onClick={vraagGesprek} disabled={gesprek === "sending"}>
                  {gesprek === "sending" ? "Momentje..." : "Ja, ik wil hier een gesprek over"}
                </PrimaryButton>
                {gesprek === "error" && (
                  <p className="mt-4 text-sm text-[#C77B16]">
                    Dat lukte niet door een technisch probleem. Mail even naar{" "}
                    <a href="mailto:wessel@loopless.nl" className="font-semibold underline">
                      wessel@loopless.nl
                    </a>
                    , dan pakt Wessel het op.
                  </p>
                )}
              </>
            )}

            <p className="mt-6 text-sm text-[#5F6B85]">
              Eerst zien wat we bouwen?{" "}
              <Link href="/diensten" className="font-medium text-[#4F8EF7] hover:underline">
                Bekijk de diensten
              </Link>
            </p>
          </Panel>
        </div>
      )}
    </div>
  );
}

function UitslagKaart({ kaart, standaardOpen }: { kaart: Card; standaardOpen: boolean }) {
  const [open, setOpen] = useState(standaardOpen);
  return (
    <Panel>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-bold text-[#10182B]">
          {kaart.kop}
        </h3>
        <span
          className={`mt-1 shrink-0 text-[#4F8EF7] transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </button>
      {open && (
        <div className="mt-3">
          <p className="mb-3 leading-relaxed text-[#5F6B85]">{kaart.body}</p>
          <p className="mb-3 font-medium text-[#2B3446]">{kaart.controle}</p>
          {kaart.bewijs && (
            <p className="border-l-2 border-[#4F8EF7] pl-4 text-sm italic text-[#5F6B85]">
              {kaart.bewijs}
            </p>
          )}
        </div>
      )}
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8 md:p-10">{children}</div>
  );
}

// Teller met balk: de bezoeker ziet hoeveel er nog komt (stond er niet, wat de
// wizard langer deed lijken dan hij is).
function StepLabel({ n }: { n: number }) {
  return (
    <div className="mb-6">
      <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-[#4F8EF7]">
        Vraag {n} van {TOTAAL_VRAGEN}
      </span>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#EAF1FC]">
        <div
          className="h-full rounded-full bg-[#4F8EF7] transition-all"
          style={{ width: `${(n / TOTAAL_VRAGEN) * 100}%` }}
        />
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-full bg-[#4F8EF7] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#3A75D8] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function ChoiceButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-5 py-4 text-left transition-all ${
        active
          ? "border-[#4F8EF7] bg-[#4F8EF7]/10 text-[#10182B]"
          : "border-[#DCE6F5] bg-[#F7FAFF] text-[#5F6B85] hover:border-[#B7CBEE] hover:text-[#10182B]"
      }`}
    >
      {children}
    </button>
  );
}

function NavRow({ terug, verder, verderDisabled, verderLabel }: { terug?: () => void; verder: () => void; verderDisabled?: boolean; verderLabel?: string }) {
  return (
    <div className="mt-8 flex items-center justify-between">
      {terug ? (
        <button onClick={terug} className="text-sm font-medium text-[#5F6B85] transition-colors hover:text-[#10182B]">
          Terug
        </button>
      ) : (
        <span />
      )}
      <PrimaryButton onClick={verder} disabled={verderDisabled}>
        {verderLabel ?? "Verder"}
      </PrimaryButton>
    </div>
  );
}

function Input({ label, placeholder, value, onChange, type = "text" }: { label: string; placeholder: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[#2B3446]">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-[#DCE6F5] bg-[#F7FAFF] px-5 py-4 text-[#10182B] placeholder-[#5F6B85] outline-none transition-colors focus:border-[#4F8EF7]"
      />
    </label>
  );
}
