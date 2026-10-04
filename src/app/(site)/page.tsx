import Link from "next/link";
import Image from "next/image";
import { HeroArc } from "@/components/hero-arc";
import { LoopCircle } from "@/components/loop-circle";
import { DustField } from "@/components/home-visuals/dust-field";
import { MiniLoop } from "@/components/home-visuals/mini-loop";
import { ServiceArt } from "@/components/home-visuals/service-art";
import { LeadListSnippet, OrderAdviceSnippet, SupportAnswerSnippet } from "@/components/home-visuals/case-snippets";
import { PromiseTimeline } from "@/components/home-visuals/promise-timeline";
import { SectionWithParticles } from "@/components/section-with-particles";
import { AnimateIn, StaggerContainer, StaggerItem } from "@/components/ui/animate-in";
import { ArrowRight } from "lucide-react";
import { getBlocksByPage, blockText } from "@/lib/supabase/content";

const aanpakSteps = [
  { num: "01", title: "Analyseren", desc: "We analyseren waar jouw team vastloopt", color: "#0EA5C6" },
  { num: "02", title: "Bouwen", desc: "We bouwen een oplossing op maat", color: "#7C5CE6" },
  { num: "03", title: "Draaien", desc: "Jouw processen lopen automatisch, zonder dat iemand er iets voor hoeft te doen.", color: "#12A36F" },
];

const caseResults = [
  "Elke ochtend staat de lijst klaar",
  "Het systeem draait door, ook als er niemand kijkt",
  "Het team bepaalt zelf wie er gebeld wordt",
];

const caseDraborResults = [
  "Besteladvies staat klaar met één knop",
  "Het systeem stelt voor, de inkopers beslissen",
  "De cijfers komen uit hun eigen systeem, niet uit een schatting",
];

// CMYK Consultancy: pas publiceren na go-live en akkoord van de klant op naamsvermelding.
const caseCmykResults = [
  "Antwoord uit de eigen handleidingen, met de bron erbij",
  "Het systeem zoekt op, de specialist controleert",
  "Staat het er niet in, dan zegt het systeem dat",
];

export default async function Home() {
  const blocks = await getBlocksByPage("home");

  const heroTitle = blockText(blocks, "home_hero_title", "Laat je mensen doen\nwaarvoor je ze\nhebt aangenomen.");
  const heroSubtitle = blockText(
    blocks,
    "home_hero_subtitle",
    // Verdieping van de kop, geen uitleg: het mechanisme staat al in de
    // diensten-kaarten, de uitleg-sectie en het vervangt-blok (besloten 2026-07-25).
    "Toch gaat de dag op aan uitzoeken, overtypen en mail doorspitten.",
  );
  const problemsHeading = blockText(blocks, "home_problems_heading", "Herken je dit?");
  const problem1Title = blockText(blocks, "home_problem_1_title", "Je beste mensen zijn uren kwijt aan uitzoeken");
  const problem1Desc = blockText(blocks, "home_problem_1_desc", "Mail doorspitten, Excel bijwerken, leveranciersdocs doorzoeken. Uren per week die niet naar hun vak gaan.");
  const problem2Title = blockText(blocks, "home_problem_2_title", "De kennis zit in het hoofd van één iemand");
  const problem2Desc = blockText(blocks, "home_problem_2_desc", "Is die collega er niet, dan staat het stil. Vragen blijven liggen tot diegene terug is.");
  const problem3Title = blockText(blocks, "home_problem_3_title", "Jij beantwoordt zelf nog elke lastige vraag");
  const problem3Desc = blockText(blocks, "home_problem_3_desc", "Terwijl je bedrijf jouw aandacht ergens anders nodig heeft. Ondernemen komt er niet meer van.");
  const caseIntro = blockText(blocks, "home_case_intro", "Niet alleen mooie woorden: dit is wat we al hebben opgeleverd.");
  const caseTitle = blockText(blocks, "home_case_title", "Van zoekwerk naar een lijst die 's ochtends klaarstaat");
  const caseDesc = blockText(blocks, "home_case_desc", "Elke ochtend staat de lijst klaar met wie de moeite waard is. Het team begint de dag met bellen in plaats van met zoeken, en bepaalt zelf wie er benaderd wordt.");
  const caseDraborTitle = blockText(blocks, "home_case_drabor_title", "Van lijsten nalopen naar een besteladvies met één knop");
  const caseDraborDesc = blockText(blocks, "home_case_drabor_desc", "De inkopers liepen hun voorraadlijst artikel voor artikel na. Nu vragen ze met één knop het inkooprapport op: wat urgent is, wat er ligt, wat eruit gaat. Ze kijken het na, passen aan waar ze het beter weten, en bestellen.");
  const caseCmykTitle = blockText(blocks, "home_case_cmyk_title", "Van zelf opzoeken naar een antwoord dat klaarstaat");
  const caseCmykDesc = blockText(blocks, "home_case_cmyk_desc", "Storingsvragen van klanten kwamen bij twee mensen terecht, die het antwoord zelf opzochten in handleidingen, schema's en onderdelenlijsten. Nu zoekt het systeem het op en zet het antwoord klaar, met erbij waar het staat. Zij lezen het na en sturen het door.");
  const ctaHeading = blockText(blocks, "home_cta_heading", "Benieuwd welk werk bij jou eraf kan?");
  const ctaText = blockText(blocks, "home_cta_text", "Weet je waar het blijft hangen, plan dan een gesprek. Weet je het nog niet precies, kijk dan eerst wat er bij jou kan.");
  const replaceHeading = blockText(blocks, "home_replace_heading", "Vervangt dit mijn mensen? Nee. Bewust niet.");
  const replaceIntro = blockText(blocks, "home_replace_intro", "Wij automatiseren het uitzoeken, niet het beslissen. Daar zijn drie redenen voor:");
  const replace1Title = blockText(blocks, "home_replace_1_title", "Je mensen zíjn je bedrijf");
  const replace1Desc = blockText(blocks, "home_replace_1_desc", "Hun kennis van klanten, leveranciers en uitzonderingen kan geen systeem vervangen. Die kennis wordt juist meer waard als het werk eromheen verdwijnt.");
  const replace2Title = blockText(blocks, "home_replace_2_title", "Ook een slim systeem maakt fouten");
  const replace2Desc = blockText(blocks, "home_replace_2_desc", "Daarom gaat er bij ons niets ongecontroleerd de deur uit. Jouw mensen controleren, het systeem bereidt voor.");
  const replace3Title = blockText(blocks, "home_replace_3_title", "Het werkt beter");
  const replace3Desc = blockText(blocks, "home_replace_3_desc", "Een team dat sneller wordt, werkt mee. Bij onze klanten beslissen de inkopers nog steeds zelf. Ze doen alleen het werk eromheen niet meer.");
  const promiseHeading = blockText(blocks, "home_promise_heading", "Binnen 4 tot 6 weken draait er één proces dat je nu handmatig doet.");
  const loopKicker = blockText(blocks, "home_loop_kicker", "Over Loopless");
  const loopHeading = blockText(blocks, "home_loop_heading", "Wij doorbreken de loop.");
  const loopText = blockText(
    blocks,
    "home_loop_text",
    "Elke week hetzelfde uitzoekwerk. Mail doorspitten, lijsten bijwerken, gegevens overtypen. Het houdt je mensen bezig, maar het brengt je bedrijf niet verder. Dat is de loop.\n\nLoopless bouwt systemen die dat werk overnemen. Het systeem zet klaar, jouw mensen controleren en beslissen. Zo gaat hun tijd weer naar het werk waarvoor je ze hebt aangenomen.",
  );
  const loopCta = blockText(blocks, "home_loop_cta", "Lees het verhaal van Wessel");
  const promiseText = blockText(blocks, "home_promise_text", "Vaste prijs, duidelijke acceptatiecriteria vooraf. Werkt het niet zoals afgesproken, dan betaal je de laatste termijn niet.");

  return (
    <>
      {/* Hero: ∞ van stof die breekt, daarna "de loop verbreken" met het logo; lichtboog met
          het leads-scherm eronder. Merkslogan als pill-badge boven de kop. */}
      <HeroArc
        title={heroTitle}
        subtitle={heroSubtitle}
        kicker="Doorbreek de loop van handmatig werk."
        about={{ kicker: loopKicker, heading: loopHeading, text: loopText, cta: loopCta }}
      />

      {/* De lichtcirkel (oktober 2026): Herken je dit, Wat is AI-automatisering en Onze aanpak
          staan erin; onder de aanpak sluit de cirkel. Secties erin zonder eigen achtergrond. */}
      <LoopCircle>
      {/* Herken je dit? Ruim onder de bovenrand van de cirkel. */}
      <section className="relative pb-20 pt-24 md:pb-28 md:pt-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn>
            <h2 className="mb-14 text-center font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B]">{problemsHeading}</h2>
          </AnimateIn>
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
            <StaggerItem>
              <ProblemCard number="01" title={problem1Title} description={problem1Desc} />
            </StaggerItem>
            <StaggerItem>
              <ProblemCard number="02" title={problem2Title} description={problem2Desc} />
            </StaggerItem>
            <StaggerItem>
              <ProblemCard number="03" title={problem3Title} description={problem3Desc} />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Wat is AI-automatisering voor het MKB */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-[760px] px-6">
          <AnimateIn>
            <h2 className="mb-8 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B] md:text-4xl">
              Wat is AI-automatisering voor het MKB?
            </h2>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <div className="space-y-5 text-[#2B3446] leading-relaxed">
              <p>
                Automatisering betekent bij ons niet dat een systeem je mensen vervangt. Het betekent dat het werk waarvoor je niemand hebt aangenomen alvast gedaan is. Een lead die gescreend klaarstaat. Een besteladvies met één knop. Een antwoord dat alleen nog gecontroleerd hoeft te worden.
              </p>
              <p className="text-[#5F6B85]">
                Jouw mensen doen wat een systeem niet kan: beslissen, uitzonderingen zien, de klant kennen. En het bedrijf merkt het: er wordt meer werk verzet met hetzelfde team, omdat iedereen weer zijn vak doet.
              </p>
              <p className="text-[#5F6B85]">
                Wat we bouwen hangt af van waar bij jou tijd verloren gaat. Geen one-size-fits-all-tool, wel een systeem dat past op jouw schaal en jouw manier van werken.
              </p>
            </div>
          </AnimateIn>
          <AnimateIn delay={0.2}>
            <Link
              href="/diensten"
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#4F8EF7] transition-colors hover:text-[#3A75D8]"
            >
              Bekijk wat we automatiseren
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* Aanpak */}
      <section className="overflow-hidden py-24 md:py-32">
        <div className="mx-auto max-w-[720px] px-6">
          <AnimateIn className="mb-14">
            <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B]">Onze aanpak</h2>
            <p className="mt-3 text-[#5F6B85]">
              We beginnen bij jouw probleem, niet bij de technologie.
            </p>
          </AnimateIn>

          <div className="relative flex flex-col gap-0">
            {/* Vertical line */}
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[#EAF1FC]" />

            {aanpakSteps.map((step, i) => (
              <AnimateIn key={step.num} delay={i * 0.1}>
                <div className="relative flex items-start gap-6 py-6">
                  <div className="relative z-10 mt-1 flex h-[23px] w-[23px] shrink-0 items-center justify-center">
                    <div className="h-[7px] w-[7px] rounded-full bg-[#4F8EF7]" />
                  </div>
                  <div>
                    <span className="mb-1 block text-xs font-medium tracking-wider text-[#4F8EF7]/60">{step.num}</span>
                    <h3 className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B]">{step.title}</h3>
                    <p className="mt-1 text-[#5F6B85] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      </LoopCircle>

      {/* Diensten Preview: stof drijft op de achtergrond, elke kaart een bewegende illustratie */}
      <section className="relative overflow-hidden bg-[#F3F7FD] py-24 md:py-32">
        <DustField className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative mx-auto max-w-[1200px] px-6">
          <AnimateIn className="mb-16 flex flex-col items-start md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B]">Onze diensten</h2>
              <p className="mt-3 max-w-[400px] text-[#5F6B85]">Elk proces dat handmatig draait, kan slimmer.</p>
            </div>
            <Link href="/diensten" className="group mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#4F8EF7] transition-colors hover:text-[#3A75D8] md:mt-0">
              Alle diensten bekijken
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-1 gap-5 md:grid-cols-2" staggerDelay={0.1}>
            <StaggerItem>
              <ServiceCard art="leads" title="Leads uitzoeken" description="Elke ochtend staat de gescreende lijst klaar. Jouw mensen voeren de gesprekken." color="#0EA5C6" />
            </StaggerItem>
            <StaggerItem>
              <ServiceCard art="offerte" title="Offertes klaarzetten" description="Het concept staat klaar uit je eigen gegevens. Jij zet de kennis en de prijs erin en verstuurt." color="#7C5CE6" />
            </StaggerItem>
            <StaggerItem>
              <ServiceCard art="vragen" title="Vragen beantwoorden uit eigen documentatie" description="Alle kennis uit hoofden en documenten, opvraagbaar voor iedereen. De expert wordt niet meer voor alles gestoord." color="#C77B16" />
            </StaggerItem>
            <StaggerItem>
              <ServiceCard art="maatwerk" title="Maatwerk voor jouw uitzoekwerk" description="Bij elk bedrijf zit het werk ergens anders. We beginnen bij de persoon die verzuipt, niet bij de tool." color="#12A36F" />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Vervangt dit mijn mensen? Links een kleine stoflus die openbreekt, rechts de drie
          redenen en Wessel als afzender. */}
      <section className="overflow-hidden py-24 md:py-32">
        <div className="mx-auto grid max-w-[1100px] items-center gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <AnimateIn className="relative">
            <div aria-hidden className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(127,178,240,0.25),transparent_70%)] blur-2xl" />
            <MiniLoop className="relative aspect-[4/3] w-full" />
          </AnimateIn>
          <div>
            <AnimateIn>
              <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B] md:text-4xl">{replaceHeading}</h2>
              <p className="mb-10 text-[#5F6B85]">{replaceIntro}</p>
            </AnimateIn>
            <StaggerContainer className="flex flex-col gap-7" staggerDelay={0.1}>
              {[
                { num: "01", title: replace1Title, desc: replace1Desc },
                { num: "02", title: replace2Title, desc: replace2Desc },
                { num: "03", title: replace3Title, desc: replace3Desc },
              ].map((r) => (
                <StaggerItem key={r.num}>
                  <div className="flex items-start gap-5">
                    <span className="mt-1 shrink-0 font-[family-name:var(--font-heading)] text-xs font-bold tracking-widest text-[#4F8EF7]/60">{r.num}</span>
                    <div>
                      <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B]">{r.title}</h3>
                      <p className="text-[#5F6B85] leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
            <AnimateIn delay={0.2}>
              <Link href="/over" className="group mt-10 inline-flex items-center gap-4">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-[0_0_0_4px_rgba(127,178,240,0.35),0_10px_30px_-8px_rgba(79,142,247,0.6)]">
                  <Image src="/wessel.jpg" alt="Wessel Broeders" fill sizes="56px" className="object-cover object-top" />
                </span>
                <span className="text-sm">
                  <span className="block font-semibold text-[#10182B] transition-colors group-hover:text-[#4F8EF7]">Wessel Broeders</span>
                  <span className="text-[#5F6B85]">Oprichter Loopless</span>
                </span>
              </Link>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto max-w-[1200px] px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-[#DCE6F5] to-transparent" />
      </div>

      {/* Resultaat — drie cases uit verschillende hoeken (positionering: nooit één niche-voorbeeld alleen) */}
      <section className="overflow-hidden py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn className="mb-14 max-w-[560px]">
            <span className="mb-4 inline-block rounded-full border border-[#C77B16]/20 bg-[#C77B16]/10 px-4 py-1 text-xs font-medium text-[#C77B16]">Case studies</span>
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B]">Hoe dat uitpakt</h2>
            <p className="text-[#5F6B85]">{caseIntro}</p>
          </AnimateIn>
          <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2" staggerDelay={0.15}>
            <StaggerItem>
              <div className="flex h-full flex-col gap-6 rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8 transition-colors duration-300 hover:border-[#B7CBEE] md:p-10">
                <LeadListSnippet />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href="https://vuljevacature.nl" target="_blank" rel="noopener noreferrer" className="opacity-90 drop-shadow-[0_4px_14px_rgba(79,142,247,0.35)] transition-opacity hover:opacity-100">
                    <Image
                      src="/clients/vuljevacature.png"
                      alt="vuljevacature.nl"
                      width={180}
                      height={45}
                      className="h-11 w-auto"
                    />
                  </a>
                  <span className="rounded-full border border-[#4F8EF7]/20 bg-[#4F8EF7]/10 px-3 py-0.5 text-xs font-medium text-[#4F8EF7]">Recruitment</span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">{caseTitle}</h3>
                <p className="text-[#5F6B85]">{caseDesc}</p>
                <div className="flex flex-col gap-2">
                  {caseResults.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[#2B3446]">
                      <span className="font-bold text-[#C77B16]">✓</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="flex h-full flex-col gap-6 rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8 transition-colors duration-300 hover:border-[#B7CBEE] md:p-10">
                <OrderAdviceSnippet />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {/* Donkerblauw woordmerk op transparant — licht vlak eronder, anders onzichtbaar op de donkere kaart */}
                  <a
                    href="https://www.drabor.nl"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-md bg-white/90 px-3 py-1.5 opacity-95 drop-shadow-[0_4px_14px_rgba(79,142,247,0.35)] transition-opacity hover:opacity-100"
                  >
                    <Image
                      src="/clients/drabor.png"
                      alt="Drabor"
                      width={160}
                      height={39}
                      className="h-7 w-auto"
                    />
                  </a>
                  <span className="rounded-full border border-[#4F8EF7]/20 bg-[#4F8EF7]/10 px-3 py-0.5 text-xs font-medium text-[#4F8EF7]">Groothandel</span>
                </div>
                <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">{caseDraborTitle}</h3>
                <p className="text-[#5F6B85]">{caseDraborDesc}</p>
                <div className="flex flex-col gap-2">
                  {caseDraborResults.map((s) => (
                    <div key={s} className="flex items-center gap-2 text-[#2B3446]">
                      <span className="font-bold text-[#C77B16]">✓</span> {s}
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>
            {/* Derde case over de volle breedte: schermpje links, verhaal rechts */}
            <StaggerItem className="md:col-span-2">
              <div className="grid h-full grid-cols-1 gap-6 rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8 transition-colors duration-300 hover:border-[#B7CBEE] md:grid-cols-2 md:items-center md:gap-10 md:p-10">
                <div className="min-w-0">
                  <SupportAnswerSnippet />
                </div>
                <div className="flex min-w-0 flex-col gap-6">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <a
                      href="https://cmyk-consultancy.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B] transition-colors hover:text-[#4F8EF7]"
                    >
                      CMYK Consultancy
                    </a>
                    <span className="rounded-full border border-[#4F8EF7]/20 bg-[#4F8EF7]/10 px-3 py-0.5 text-xs font-medium text-[#4F8EF7]">Signbranche</span>
                  </div>
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">{caseCmykTitle}</h3>
                  <p className="text-[#5F6B85]">{caseCmykDesc}</p>
                  <div className="flex flex-col gap-2">
                    {caseCmykResults.map((s) => (
                      <div key={s} className="flex items-center gap-2 text-[#2B3446]">
                        <span className="font-bold text-[#C77B16]">✓</span> {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
          <AnimateIn delay={0.2}>
            <Link href="/cases" className="group mt-8 inline-flex items-center gap-1 text-sm font-medium text-[#4F8EF7] transition-all hover:gap-2">
              Bekijk de cases
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* Belofte-strook (oktober 2026): blauw met stof, zoals "de loop verbreken"; tijdlijn van
          zes weken met de fasen uit Onze aanpak, witte tekst en knop. */}
      <section className="relative overflow-hidden bg-[radial-gradient(90%_80%_at_30%_40%,#6FA6F2_0%,#4F8EF7_45%,#3F7FE0_100%)] py-20 md:py-28">
        <DustField tone="light" count={420} className="pointer-events-none absolute inset-0 h-full w-full" />
        <div className="relative mx-auto max-w-[760px] px-6 text-center">
          <AnimateIn>
            <h2 className="mb-4 text-balance font-[family-name:var(--font-heading)] text-3xl font-bold text-white md:text-4xl">{promiseHeading}</h2>
            <p className="mx-auto max-w-[560px] text-lg text-white/85">{promiseText}</p>
          </AnimateIn>
          <PromiseTimeline />
          <AnimateIn delay={0.2}>
            <Link
              href="/contact"
              className="mt-10 inline-block rounded-full bg-white px-8 py-4 font-semibold text-[#2F6FD6] shadow-[0_10px_30px_-10px_rgba(16,24,43,0.35)] transition-colors hover:bg-[#EAF1FC]"
            >
              Plan een gesprek
            </Link>
          </AnimateIn>
        </div>
      </section>

      {/* CTA — particles terug */}
      <SectionWithParticles className="py-24 md:py-32" particleCount={300} speed={0.4} trailOpacity={0.06}>
        <AnimateIn className="mx-auto max-w-[1200px] px-6 text-center">
          <h2 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B]">{ctaHeading}</h2>
          <p className="mx-auto mb-8 max-w-[520px] text-lg text-[#5F6B85]">{ctaText}</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-[#4F8EF7] px-8 py-4 font-semibold text-white transition-colors hover:bg-[#3A75D8]"
            >
              Plan een gratis gesprek
            </Link>
            <Link
              href="/configurator"
              className="inline-block rounded-full border border-[#C9D8F0] px-8 py-4 font-semibold text-[#2B3446] transition-all duration-300 hover:border-[#4F8EF7]/40 hover:text-[#10182B]"
            >
              Kijk wat er bij jou kan
            </Link>
          </div>
        </AnimateIn>
      </SectionWithParticles>
    </>
  );
}

function ProblemCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group h-full rounded-xl border border-[#DCE6F5] bg-white p-7 shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] transition-all duration-300 hover:-translate-y-1 hover:border-[#4F8EF7]/40 hover:shadow-[0_2px_4px_rgba(16,24,43,0.04),0_24px_48px_-20px_rgba(79,142,247,0.35)]">
      <span className="mb-4 block font-[family-name:var(--font-heading)] text-xs font-bold tracking-widest text-[#4F8EF7]/50 transition-colors duration-300 group-hover:text-[#4F8EF7]/80">{number}</span>
      <h3 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B]">{title}</h3>
      <p className="text-[#5F6B85]">{description}</p>
    </div>
  );
}

function ServiceCard({ art, title, description, color = "#4F8EF7" }: { art: "leads" | "offerte" | "vragen" | "maatwerk"; title: string; description: string; color?: string }) {
  return (
    <Link href="/diensten" className="group block h-full" style={{ "--service-color": color } as React.CSSProperties}>
      <div className="relative h-full rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-7 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[var(--service-color)]/30" style={{ boxShadow: undefined }}>
        <div
          className="mb-5 h-[120px] overflow-hidden rounded-lg border border-[#EEF3FB]"
          style={{ background: `radial-gradient(120% 90% at 50% 0%, ${color}14, #F8FBFF 70%)` }}
        >
          <ServiceArt variant={art} color={color} />
        </div>
        <h3 className="mb-2 font-[family-name:var(--font-heading)] text-lg font-bold text-[#10182B]">{title}</h3>
        <p className="text-sm text-[#5F6B85]">{description}</p>
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium transition-all group-hover:gap-2" style={{ color }}>
          Meer info
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
