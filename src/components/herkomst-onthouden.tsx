"use client";

import { useEffect } from "react";
import { HERKOMST_SLEUTEL, herkomstUitUrl } from "@/lib/aanvraag/herkomst";

// Onthoudt bij de eerste pagina van een sessie waar de bezoeker vandaan kwam (UTM-tags of de
// pagina zelf), zodat een aanvraag later in dezelfde sessie bij de juiste reel of pagina hoort.
// Alleen sessionStorage, geen cookie: verdwijnt als het tabblad dicht gaat.
export function HerkomstOnthouden() {
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(HERKOMST_SLEUTEL)) {
        sessionStorage.setItem(
          HERKOMST_SLEUTEL,
          JSON.stringify(herkomstUitUrl(window.location.search, window.location.pathname)),
        );
      }
    } catch {
      // geen sessionStorage: dan telt de pagina van de inzending zelf
    }
  }, []);
  return null;
}
