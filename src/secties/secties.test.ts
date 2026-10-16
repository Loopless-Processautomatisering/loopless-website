import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import opgeleverd from "@/lib/websitebouwer/opgeleverd.json";
import { SECTIETYPES, alineas, fotoUrl, isBekendSectietype, tekstVeld } from "./schema";

const TENANT = "0e4850b7-a8e9-4e68-ae59-7105e884cb9c";

describe("velden", () => {
  it("tekstVeld: alleen tekst, getrimd", () => {
    expect(tekstVeld({ a: "  x " }, "a")).toBe("x");
    expect(tekstVeld({ a: 3 }, "a")).toBe("");
    expect(tekstVeld({}, "a")).toBe("");
  });

  it("alineas: op lege regels, lege weg", () => {
    expect(alineas("een\n\ntwee\n \n\ndrie")).toEqual(["een", "twee", "drie"]);
    expect(alineas("")).toEqual([]);
  });

  it("fotoUrl: alleen een pad zoals het portaal het schrijft", () => {
    const basis = "https://x.supabase.co/";
    expect(fotoUrl({ f: `${TENANT}/secties/a/b.jpg` }, "f", basis)).toBe(
      `https://x.supabase.co/storage/v1/object/public/tenant-assets/${TENANT}/secties/a/b.jpg`,
    );
    for (const slecht of ["https://evil.nl/a.jpg", `${TENANT}/../x.jpg`, `${TENANT}//x.jpg`, "/wessel.jpg", ""]) {
      expect(fotoUrl({ f: slecht }, "f", basis)).toBeNull();
    }
    expect(fotoUrl({ f: `${TENANT}/a.jpg` }, "f", undefined)).toBeNull();
  });
});

describe("de opgeleverde pagina /over", () => {
  const secties = opgeleverd.paginas[0].secties;

  it("gebruikt alleen bekende types en alleen velden uit hun schema", () => {
    for (const s of secties) {
      expect(isBekendSectietype(s.type_sleutel)).toBe(true);
      const sleutels = SECTIETYPES[s.type_sleutel as keyof typeof SECTIETYPES].velden.map((v) => v.sleutel as string);
      for (const k of Object.keys(s.inhoud)) expect(sleutels).toContain(k);
    }
  });

  it("draagt elke standaardtekst van de oude pagina, letterlijk", () => {
    // De terugvalteksten in huidige-pagina.tsx zijn wat de site toont als een blok ontbreekt.
    // Elke tekst moet in de opgeleverde inhoud staan, anders mist een nieuwe klant een stuk.
    const bron = readFileSync("src/app/(site)/over/huidige-pagina.tsx", "utf8");
    const standaard = [...bron.matchAll(/blockText\(blocks, "[a-z_0-9]+", "((?:[^"\\]|\\.)*)"\)/g)].map((m) => m[1]);
    expect(standaard.length).toBe(13);
    const alles = secties.flatMap((s) => Object.values(s.inhoud).flatMap((v) => alineas(String(v))));
    for (const t of standaard) expect(alles).toContain(t);
    // De kop die in de oude pagina vast in de code stond, is nu een veldwaarde.
    expect(alles).toContain("Hoe dat er in de praktijk uitziet");
  });
});
