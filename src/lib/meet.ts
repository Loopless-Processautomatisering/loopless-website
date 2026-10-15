// Telt een geslaagde aanvraag in Vercel Web Analytics (custom event), zodat het
// maandrapport aanvragen per bron kan tonen en niet alleen bezoek. Geen cookies en
// geen inhoud: alleen welk formulier en vanaf welke pagina. De loader staat in
// src/app/layout.tsx.
declare global {
  interface Window {
    va?: (type: "event", props: { name: string; data?: Record<string, string> }) => void;
  }
}

export function meetAanvraag(formulier: string) {
  window.va?.("event", { name: "formulier_verzonden", data: { formulier, pagina: location.pathname } });
}
