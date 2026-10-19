"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

// De intro in de hero staat buiten het formulier, maar moet weg zodra er is
// verstuurd. Deze context deelt alleen dat ene feit; de controle van de code
// blijft op de server (page.tsx).

const Staat = createContext<{ verstuurd: boolean; meldVerstuurd: () => void }>({
  verstuurd: false,
  meldVerstuurd: () => {},
});

export function GesprekStaat({ children }: { children: ReactNode }) {
  const [verstuurd, setVerstuurd] = useState(false);
  return (
    <Staat.Provider value={{ verstuurd, meldVerstuurd: () => setVerstuurd(true) }}>
      {children}
    </Staat.Provider>
  );
}

export const useGesprekStaat = () => useContext(Staat);

// Toont zijn inhoud alleen zolang het formulier nog niet is verstuurd.
export function VoorVersturen({ children }: { children: ReactNode }) {
  const { verstuurd } = useGesprekStaat();
  return verstuurd ? null : <>{children}</>;
}
