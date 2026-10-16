import type { Metadata } from "next";
import { PageGlow } from "@/components/page-glow";
import { getWeergave } from "@/lib/websitebouwer/inhoud";
import { SECTIECOMPONENTEN } from "@/secties/register";
import { HuidigePagina } from "./huidige-pagina";

// De metadata blijft code (portaal fase 60).
export const metadata: Metadata = {
  title: "Over Loopless — Wessel Broeders, oprichter",
  description:
    "Wessel Broeders, oprichter van Loopless. Ik bouw systemen die het uitzoekwerk doen, zodat jouw mensen weer het werk doen waarvoor je ze hebt aangenomen.",
  alternates: { canonical: "/over" },
  openGraph: {
    title: "Over Loopless — Wessel Broeders, oprichter",
    description:
      "Wessel Broeders, oprichter van Loopless. Ik bouw systemen die het uitzoekwerk doen, zodat jouw mensen weer het werk doen waarvoor je ze hebt aangenomen.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Over Loopless — Wessel Broeders, oprichter",
    description:
      "Wessel Broeders, oprichter van Loopless. Ik bouw systemen die het uitzoekwerk doen, zodat jouw mensen weer het werk doen waarvoor je ze hebt aangenomen.",
  },
};

// `/over` uit de websitebouwer van het Siteup-portaal, of de pagina zoals hij was (terugval, zie
// `lib/websitebouwer/inhoud.ts`).
export default async function OverPage() {
  const weergave = await getWeergave("/over");
  if (weergave.soort === "terugval") return <HuidigePagina />;
  return (
    <>
      <PageGlow />
      {weergave.secties.map((s, i) => {
        const Sectie = SECTIECOMPONENTEN[s.type_sleutel];
        return <Sectie key={s.id} inhoud={s.inhoud} index={i} />;
      })}
    </>
  );
}
