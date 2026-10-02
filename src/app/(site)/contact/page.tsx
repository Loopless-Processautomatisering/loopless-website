"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Linkedin, Clock, ShieldCheck, Send } from "lucide-react";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow } from "@/components/page-glow";

const FORMSPREE_ACTION = "https://formspree.io/f/xbdeeolq";

const contactFields = [
  { entry: "naam", label: "Naam", type: "text", placeholder: "Jouw naam" },
  { entry: "bedrijf", label: "Bedrijfsnaam", type: "text", placeholder: "Jouw bedrijf" },
  { entry: "email", label: "E-mailadres", type: "email", placeholder: "naam@bedrijf.nl" },
  { entry: "telefoon", label: "Telefoonnummer", type: "tel", placeholder: "+31 6 12345678" },
];

// Afgeslankt 2026-07-25: de zes intakevragen zijn vervangen door één
// berichtveld. Wie nog niet weet waar het vastloopt, gaat naar de configurator.
const berichtVeld = {
  entry: "bericht",
  label: "Waar loopt het bij jullie vast?",
  placeholder:
    "Bijvoorbeeld: onze binnendienst is de halve dag bezig met dezelfde vragen beantwoorden.",
};

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(FORMSPREE_ACTION, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }

    setSubmitting(false);
  }

  return (
    <>
      <PageGlow />
      {/* Hero — links uitgelijnd */}
      <section className="relative pb-12 pt-40">
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn>
            <h1 className="mb-4 font-[family-name:var(--font-heading)] text-4xl font-bold text-[#10182B] md:text-5xl">
              Laten we kennismaken
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="max-w-[600px] text-lg text-[#5F6B85]">
              Weet je al welk werk eraf moet, of weet je alleen dat er tijd
              verdwijnt? In beide gevallen denk ik graag mee.
            </p>
          </AnimateIn>

          {/* Trust indicators */}
          <AnimateIn delay={0.2}>
            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-[#5F6B85]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#4F8EF7]" />
                <span>Volledig vrijblijvend</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#4F8EF7]" />
                <span>Reactie binnen 24 uur</span>
              </div>
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-[#4F8EF7]" />
                <span>~1 minuut</span>
              </div>
            </div>
          </AnimateIn>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-24 md:py-32">
        <div className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-[1fr_2fr]">
          {/* Sidebar */}
          <AnimateIn className="lg:sticky lg:top-32 lg:self-start">
            <h2 className="mb-4 font-[family-name:var(--font-heading)] text-3xl font-bold text-[#10182B]">
              Direct contact
            </h2>
            <p className="mb-8 text-[#5F6B85]">
              Liever direct een bericht sturen? Dat kan ook.
            </p>

            <div className="flex flex-col gap-6">
              <ContactItem
                icon={<Mail className="h-5 w-5 text-[#4F8EF7]" />}
                label="E-mail"
                value="wessel@loopless.nl"
                href="mailto:wessel@loopless.nl"
              />
              <ContactItem
                icon={<Linkedin className="h-5 w-5 text-[#4F8EF7]" />}
                label="LinkedIn"
                value="Wessel Broeders"
                href="https://www.linkedin.com/in/wessel-broeders-250767221/"
              />
            </div>

            {/* Trust card */}
            <div className="mt-10 overflow-hidden rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-6 relative">
              <p className="text-sm leading-relaxed text-[#5F6B85]">
                <span className="font-semibold text-[#2B3446]">Hoe werkt het?</span>
                <br />
                Na het versturen neem ik binnen 24 uur contact op. Samen kijken
                we welk werk bij jullie blijft liggen en of een systeem daar het
                antwoord op is. Geen verplichtingen, geen verborgen kosten.
              </p>
            </div>
          </AnimateIn>

          {/* Form */}
          <AnimateIn delay={0.15} className="relative overflow-hidden rounded-2xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#4F8EF7]/10">
                  <ShieldCheck className="h-8 w-8 text-[#4F8EF7]" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-[#10182B]">
                  Bedankt voor het invullen!
                </h3>
                <p className="max-w-md text-[#5F6B85]">
                  Ik heb je bericht ontvangen en neem binnen 24 uur contact met
                  je op.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <input
                  type="hidden"
                  name="_subject"
                  value="Nieuwe intake via loopless.nl"
                />
                {/* Contact details section */}
                <div className="mb-8">
                  <h3 className="mb-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-[#10182B]">
                    Jouw gegevens
                  </h3>
                  <p className="mb-5 text-sm text-[#5F6B85]">
                    Zodat ik je kan bereiken na het invullen.
                  </p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {contactFields.map(({ entry, label, type, placeholder }) => (
                      <div key={entry}>
                        <label className="mb-1.5 block text-sm font-medium text-[#2B3446]">
                          {label}
                        </label>
                        <input
                          type={type}
                          name={entry}
                          placeholder={placeholder}
                          className="w-full rounded-lg border border-[#DCE6F5] bg-[#F7FAFF] px-4 py-3 text-[#2B3446] placeholder-[#5F6B85] transition-colors focus:border-[#4F8EF7] focus:outline-none focus:ring-2 focus:ring-[#4F8EF740]"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8 border-t border-[#DCE6F5]" />

                {/* Bericht */}
                <div>
                  <h3 className="mb-1 font-[family-name:var(--font-heading)] text-lg font-semibold text-[#10182B]">
                    Over jullie situatie
                  </h3>
                  <p className="mb-5 text-sm text-[#5F6B85]">
                    Eén of twee zinnen is genoeg. Weet je nog niet precies waar
                    het zit?{" "}
                    <Link
                      href="/configurator"
                      className="font-medium text-[#4F8EF7] transition-colors hover:text-[#3A75D8]"
                    >
                      Kijk dan eerst wat er bij jou kan.
                    </Link>
                  </p>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#2B3446]">
                      {berichtVeld.label}
                    </label>
                    <textarea
                      name={berichtVeld.entry}
                      rows={5}
                      placeholder={berichtVeld.placeholder}
                      className="w-full resize-y rounded-lg border border-[#DCE6F5] bg-[#F7FAFF] px-4 py-3 text-[#2B3446] placeholder-[#5F6B85] transition-colors focus:border-[#4F8EF7] focus:outline-none focus:ring-2 focus:ring-[#4F8EF740]"
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-8 rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] p-4 text-center text-sm text-[#5F6B85]">
                  Invullen is volledig vrijblijvend — ik neem binnen 24 uur contact op.
                </div>

                {error && (
                  <div className="mt-4 rounded-xl border border-[#E24C4C]/40 bg-[#E24C4C]/10 p-4 text-center text-sm text-[#B42323]">
                    Er ging iets mis bij het versturen. Probeer het opnieuw of
                    mail me direct op{" "}
                    <a
                      href="mailto:wessel@loopless.nl"
                      className="font-semibold underline"
                    >
                      wessel@loopless.nl
                    </a>
                    .
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-4 w-full rounded-lg bg-[#4F8EF7] px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-[#3A75D8] hover:shadow-[0_8px_30px_-8px_rgba(79,142,247,0.3)] disabled:opacity-50"
                >
                  {submitting ? "Versturen..." : "Verstuur bericht"}
                </button>
              </form>
            )}
          </AnimateIn>
        </div>
      </section>
    </>
  );
}

function ContactItem({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="flex items-start gap-4 rounded-lg p-2 -m-2 transition-colors hover:bg-[#4F8EF7]/5"
    >
      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-[#EAF1FC]">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-[#10182B]">{label}</h4>
        <span className="text-sm text-[#4F8EF7]">{value}</span>
      </div>
    </a>
  );
}
