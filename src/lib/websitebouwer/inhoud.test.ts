import { describe, expect, it, vi } from "vitest";

// `inhoud.ts` importeert Next-modules die buiten een verzoek niet werken; de beslissing zelf
// (`bepaalWeergave`) gebruikt ze niet.
vi.mock("next/cache", () => ({ cacheLife: () => {}, cacheTag: () => {} }));
vi.mock("next/headers", () => ({ draftMode: async () => ({ isEnabled: false }) }));

const { bepaalWeergave, zichtbareSecties } = await import("./inhoud");
type SiteInhoud = Awaited<ReturnType<Parameters<typeof bepaalWeergave>[1]["leesLive"]>>;

const sectie = (id: string, type_sleutel: string, sort_order: number, enabled = true) => ({
  id,
  type_sleutel,
  sort_order,
  enabled,
  inhoud: {},
});
const metOver = (secties: ReturnType<typeof sectie>[]): SiteInhoud => ({
  paginas: [{ path: "/over", label: "Over", secties }],
});

function bron(over: Partial<Parameters<typeof bepaalWeergave>[1]> = {}) {
  return {
    koppeling: true,
    concept: false,
    leesLive: vi.fn(async () => metOver([sectie("a", "intro", 1)])),
    leesConcept: vi.fn(async () => metOver([sectie("c", "tekst", 1)])),
    ...over,
  };
}

describe("bepaalWeergave", () => {
  it("de pagina bestaat: de zichtbare secties, zonder melding", async () => {
    const meld = vi.fn();
    const w = await bepaalWeergave("/over", bron(), meld);
    expect(w).toEqual({ soort: "secties", secties: [sectie("a", "intro", 1)] });
    expect(meld).not.toHaveBeenCalled();
  });

  it("de pagina ontbreekt: terugval, met één melding", async () => {
    const meld = vi.fn();
    const w = await bepaalWeergave("/over", bron({ leesLive: async () => ({ paginas: [] }) }), meld);
    expect(w).toEqual({ soort: "terugval", reden: "pagina ontbreekt" });
    expect(meld).toHaveBeenCalledTimes(1);
    expect(meld.mock.calls[0][0]).toMatch(/^\[websitebouwer\] terugval \/over/);
  });

  it("een live leesfout: terugval, met de fout in de melding", async () => {
    const meld = vi.fn();
    const leesLive = async () => {
      throw new Error("de inhoud kon niet worden gelezen: time-out");
    };
    const w = await bepaalWeergave("/over", bron({ leesLive }), meld);
    expect(w).toEqual({ soort: "terugval", reden: "leesfout" });
    expect(meld.mock.calls[0][0]).toContain("time-out");
  });

  it("een fout bij het lezen van het concept gooit, geen terugval", async () => {
    const meld = vi.fn();
    const leesConcept = async () => {
      throw new Error("het portaal gaf 500");
    };
    await expect(bepaalWeergave("/over", bron({ concept: true, leesConcept }), meld)).rejects.toThrow("500");
    expect(meld).not.toHaveBeenCalled();
  });

  it("in voorbeeldmodus het concept, niet de live stand", async () => {
    const b = bron({ concept: true });
    const w = await bepaalWeergave("/over", b, vi.fn());
    expect(w).toEqual({ soort: "secties", secties: [sectie("c", "tekst", 1)] });
    expect(b.leesLive).not.toHaveBeenCalled();
  });

  it("in voorbeeldmodus zonder pagina (de klant staat nog op het oude model): terugval", async () => {
    const w = await bepaalWeergave("/over", bron({ concept: true, leesConcept: async () => ({ paginas: [] }) }), vi.fn());
    expect(w).toEqual({ soort: "terugval", reden: "pagina ontbreekt" });
  });

  it("nul zichtbare secties: een lege pagina, geen terugval", async () => {
    const meld = vi.fn();
    const w = await bepaalWeergave("/over", bron({ leesLive: async () => metOver([sectie("x", "tekst", 1, false)]) }), meld);
    expect(w).toEqual({ soort: "secties", secties: [] });
    expect(meld).not.toHaveBeenCalled();
  });

  it("een onbekend sectietype valt weg met een waarschuwing, de rest blijft", async () => {
    const waarschuw = vi.fn();
    const leesLive = async () => metOver([sectie("a", "intro", 1), sectie("z", "galerij", 2)]);
    const w = await bepaalWeergave("/over", bron({ leesLive }), vi.fn(), waarschuw);
    expect(w).toEqual({ soort: "secties", secties: [sectie("a", "intro", 1)] });
    expect(waarschuw.mock.calls[0][0]).toContain('"galerij"');
  });

  it("zonder koppeling: terugval, en er wordt niets gelezen", async () => {
    const b = bron({ koppeling: false });
    const w = await bepaalWeergave("/over", b, vi.fn());
    expect(w).toEqual({ soort: "terugval", reden: "geen koppeling" });
    expect(b.leesLive).not.toHaveBeenCalled();
    expect(b.leesConcept).not.toHaveBeenCalled();
  });
});

describe("zichtbareSecties", () => {
  it("uitgeschakeld weg, op volgorde, bij gelijke volgorde op id", () => {
    const p = { path: "/over", label: "Over", secties: [sectie("c", "tekst", 3), sectie("b", "tekst", 1), sectie("uit", "tekst", 2, false), sectie("a", "tekst", 1)] };
    expect(zichtbareSecties(p).map((s) => s.id)).toEqual(["a", "b", "c"]);
  });
});
