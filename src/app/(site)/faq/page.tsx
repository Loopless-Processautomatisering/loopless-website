"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimateIn } from "@/components/ui/animate-in";
import { PageGlow } from "@/components/page-glow";
import { faqCategories, type FaqEntry } from "./faq-data";

function FaqItem({ question, answer, link }: FaqEntry) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#DCE6F5] last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-6 py-6 text-left"
      >
        <h3 className="font-[family-name:var(--font-heading)] text-base font-semibold text-[#10182B]">
          {question}
        </h3>
        <div
          className={cn(
            "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-300",
            open ? "bg-[#4F8EF7]/10" : "bg-transparent"
          )}
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 text-[#4F8EF7] transition-transform duration-300",
              open && "rotate-180"
            )}
          />
        </div>
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <p className="text-[#5F6B85] leading-relaxed">
            {answer}
          </p>
          {link && (
            <Link
              href={link.href}
              className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#4F8EF7] transition-colors hover:text-[#3A75D8]"
            >
              {link.label}
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
          <div className="pb-6" />
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <>
      <PageGlow />
      {/* Hero */}
      <section className="relative pb-8 pt-40">
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn>
            <h1 className="mb-4 font-[family-name:var(--font-heading)] text-5xl font-bold text-[#10182B] md:text-6xl">
              Veelgestelde vragen
            </h1>
          </AnimateIn>
          <AnimateIn delay={0.1}>
            <p className="max-w-[560px] text-xl text-[#5F6B85]">
              Welk werk een systeem kan overnemen, wat het kost, en wat er
              gebeurt als het niet doet wat we hebben afgesproken.
            </p>
          </AnimateIn>
        </div>
      </section>

      {/* FAQ per categorie — two-column layout on desktop */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6">
          {faqCategories.map((cat, i) => (
            <AnimateIn key={cat.label} delay={i * 0.1}>
              <div className={`grid gap-8 md:grid-cols-12 ${i > 0 ? "mt-20" : ""}`}>
                {/* Category label — left column */}
                <div className="md:col-span-3">
                  <h2 className="sticky top-32 text-xs font-semibold uppercase tracking-widest text-[#4F8EF7]">
                    {cat.label}
                  </h2>
                </div>
                {/* Questions — right column */}
                <div className="md:col-span-8">
                  <div className="rounded-xl border border-[#DCE6F5] bg-white shadow-[0_1px_2px_rgba(16,24,43,0.04),0_16px_40px_-20px_rgba(79,142,247,0.25)] px-6 transition-colors duration-300 hover:border-[#B7CBEE]">
                    {cat.items.map((faq) => (
                      <FaqItem key={faq.question} {...faq} />
                    ))}
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6">
          <AnimateIn>
            <div className="flex flex-col gap-6 rounded-2xl border border-[#DCE6F5] bg-[#F3F7FD] p-8 transition-colors duration-300 hover:border-[#B7CBEE] md:flex-row md:items-center md:justify-between md:p-12">
              <div>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-[#10182B]">
                  Vraag niet beantwoord?
                </h2>
                <p className="mt-2 text-[#5F6B85]">
                  Ik denk graag met je mee in een kort gesprek.
                </p>
              </div>
              <Link
                href="/contact"
                className="group inline-flex items-center gap-3 rounded-full bg-[#4F8EF7] px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-[#3A75D8] hover:shadow-[0_8px_30px_-8px_rgba(79,142,247,0.3)]"
              >
                Plan een gesprek
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
    </>
  );
}
