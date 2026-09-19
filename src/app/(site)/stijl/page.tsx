import type { Metadata } from "next";
import {
  Section,
  Rule,
  Eyebrow,
  Prose,
  PullQuote,
  NumberedList,
  DefinitionList,
  Button,
  TextLink,
} from "@/components/ds";
import { Figure } from "@/components/schema/grammar";
import {
  SchemaLoop,
  SchemaLoopHero,
  SchemaLeads,
  SchemaInkoop,
  SchemaOffertes,
  SchemaKennisbank,
  SchemaVoorNa,
} from "@/components/schema/schemas";

// Beoordelingspagina voor fase 1. Niet in de navigatie, niet indexeerbaar.
// Bestaat om op een echt scherm de fontkeuze te maken en het systeem te keuren
// vóórdat er één pagina wordt herbouwd.
export const metadata: Metadata = {
  title: "Stijlpagina",
  robots: { index: false, follow: false },
};

const HERO = "Laat je mensen doen\nwaarvoor je ze\nhebt aangenomen.";

function Kop({ children }: { children: string }) {
  return (
    <>
      <Rule label={children} className="mb-8 mt-20 first:mt-0" />
    </>
  );
}

/** De hero zoals hij eruit gaat zien, in de meegegeven variant. */
function HeroProef({ variant }: { variant: "a" | "b" }) {
  return (
    <div data-type={variant === "b" ? "b" : undefined} className="border border-rule p-6 md:p-10">
      <p className="mb-6 text-meta font-medium tracking-wide text-ink-3">
        Variant {variant.toUpperCase()} — {variant === "a"
          ? "Newsreader + IBM Plex Sans"
          : "Schibsted Grotesk"}
      </p>
      <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-center">
        <div>
          <Eyebrow>Doorbreek de loop van handmatig werk</Eyebrow>
          <h1 className="text-display font-medium leading-[1.04] tracking-tight">
            {HERO.split("\n").map((r) => (
              <span key={r} className="block">
                {r}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[34rem] text-lead text-ink-2">
            Toch gaat de dag op aan uitzoeken, overtypen en mail doorspitten.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/contact">Plan een gesprek</Button>
            <TextLink href="/configurator">Kijk wat er bij jou kan</TextLink>
          </div>
        </div>
        <SchemaLoopHero className="mx-auto max-w-[24rem]" />
      </div>
    </div>
  );
}

export default function StijlPage() {
  return (
    <Section className="pt-28">
      <Eyebrow>Fase 1 — fundament</Eyebrow>
      <h1 className="text-h1 font-medium">Stijlpagina</h1>
      <p className="mt-4 max-w-prose text-lead text-ink-2">
        Alles van het nieuwe systeem op één plek. Deze pagina bestaat om de keuze te maken,
        niet om mooi te zijn. Kies hieronder de typografie; de rest van de site volgt daarna.
      </p>

      {/* ------------------------------------------------------------------ */}
      <Kop>1 — Typografie: kies A of B</Kop>
      <div className="space-y-8">
        <HeroProef variant="a" />
        <HeroProef variant="b" />
      </div>

      {/* ------------------------------------------------------------------ */}
      <Kop>2 — Kleur</Kop>
      <p className="mb-6 max-w-prose text-ink-2">
        Eén accent, en het is gereserveerd voor precies één ding: de stap waar een mens beslist.
        Alles wat je hieronder in kleur ziet, is die stap.
      </p>
      <div className="grid gap-px border border-rule bg-rule sm:grid-cols-3 lg:grid-cols-5">
        {[
          ["paper", "#FAFAF7", "paginagrond"],
          ["paper-2", "#F2F1EC", "tintvlak, max 1 per pagina"],
          ["ink", "#14161A", "koppen, body"],
          ["ink-2", "#474C55", "secundaire tekst"],
          ["ink-3", "#767C86", "meta"],
          ["rule", "#DEDCD5", "hairlines"],
          ["rule-strong", "#B9B6AD", "actieve rand"],
          ["accent", "#1B3A5C", "het enige accent"],
          ["accent-ink", "#12283F", "hover"],
          ["accent-wash", "#E8EDF2", "vulling accent-knooppunt"],
        ].map(([naam, hex, waarvoor]) => (
          <div key={naam} className="bg-paper p-4">
            <div
              className="mb-3 h-12 w-full border border-rule"
              style={{ background: hex }}
            />
            <p className="font-mono text-label text-ink">{naam}</p>
            <p className="font-mono text-label text-ink-3">{hex}</p>
            <p className="mt-1 text-label text-ink-3">{waarvoor}</p>
          </div>
        ))}
      </div>

      {/* ------------------------------------------------------------------ */}
      <Kop>3 — Schema&apos;s: het beeldmerk</Kop>
      <p className="mb-8 max-w-prose text-ink-2">
        Geen stockbeeld en geen icoontjesgrid. Zes tekeningen in één taal, die allemaal
        hetzelfde zeggen: het systeem zoekt uit, jouw mensen beslissen. In de hero staat
        straks jouw Blender-model op de plek van het eerste schema.
      </p>
      <div className="space-y-14">
        <Figure caption="Schema 1 — de loop. Home-hero, en de plek van het 3D-model.">
          <SchemaLoop />
        </Figure>
        <Figure caption="Schema 2 — leads uitzoeken.">
          <SchemaLeads />
        </Figure>
        <Figure caption="Schema 3 — besteladvies en inkoop.">
          <SchemaInkoop />
        </Figure>
        <Figure caption="Schema 4 — offertes klaarzetten.">
          <SchemaOffertes />
        </Figure>
        <Figure caption="Schema 5 — vragen beantwoorden uit eigen documentatie.">
          <SchemaKennisbank />
        </Figure>
        <Figure caption="Schema 6 — ervoor en erna. De hele case in één beeld; hier Drabor.">
          <SchemaVoorNa
            stappen={["lijst nalopen", "voorraad checken", "advies opstellen", "beslissen", "bestellen"]}
            systeemVanaf={0}
            beslissing={3}
            title="Drabor, ervoor en erna"
            desc="Ervoor liepen de inkopers elke stap met de hand: lijst nalopen, voorraad checken, advies opstellen, beslissen, bestellen. Erna doet het systeem het nalopen, checken en opstellen; de inkoper beslist en bestelt."
          />
        </Figure>
      </div>

      {/* ------------------------------------------------------------------ */}
      <Kop>4 — Tekstprimitieven</Kop>
      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-label text-ink-3">NumberedList (vervangt de kaarten)</p>
          <NumberedList
            items={[
              {
                title: "Je beste mensen zijn uren kwijt aan uitzoeken",
                description:
                  "Mail doorspitten, Excel bijwerken, leveranciersdocs doorzoeken.",
              },
              {
                title: "De kennis zit in het hoofd van één iemand",
                description: "Is die collega er niet, dan staat het stil.",
              },
            ]}
          />
        </div>
        <div>
          <p className="mb-4 font-mono text-label text-ink-3">DefinitionList</p>
          <DefinitionList
            items={[
              { term: "Voor wie", value: "Groothandels en technische handel" },
              { term: "Wat er af ging", value: "Het nalopen van de voorraadlijst" },
              { term: "Wie beslist", value: "De inkoper, net als eerst" },
            ]}
          />
        </div>
      </div>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        <div>
          <p className="mb-4 font-mono text-label text-ink-3">Prose</p>
          <Prose>
            <h2>Wat is automatisering voor het MKB?</h2>
            <p>
              Het komt erop neer dat het uitzoekwerk eraf gaat. Niet het beslissen — dat blijft
              waar het hoort. Een <a href="/diensten">systeem</a> haalt de gegevens bij elkaar,
              zet het werk klaar, en legt het voor.
            </p>
            <h3>Wat het niet is</h3>
            <p>Een robot die je mensen vervangt. Bewust niet.</p>
          </Prose>
        </div>
        <div>
          <p className="mb-4 font-mono text-label text-ink-3">PullQuote</p>
          <PullQuote bron="Nog geen klantquote — pas plaatsen als Drabor of Vuljevacature er letterlijk een geeft.">
            Het systeem stelt voor, de inkopers beslissen.
          </PullQuote>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      <Kop>5 — Interactie</Kop>
      <p className="mb-6 max-w-prose text-ink-2">
        De hele interactietaal van de site: kleur verandert, niets beweegt. Geen hover-lift,
        geen schaduw, geen glow.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <Button href="#">Plan een gesprek</Button>
        <Button href="#" variant="secondary">
          Bekijk de diensten
        </Button>
        <TextLink href="#">Kijk wat er bij jou kan</TextLink>
      </div>

      <Rule className="mt-20" />
      <p className="mt-6 max-w-prose text-meta text-ink-3">
        Wat hierna komt: masthead en footer, dan home, diensten en cases (fase 2). Deze pagina
        blijft bestaan tot de cutover en gaat er daarna uit.
      </p>
    </Section>
  );
}
