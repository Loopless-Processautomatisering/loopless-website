import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { describe, expect, it } from "vitest";
import {
  KOPPELVARIABELEN,
  isBouwomgeving,
  leesKoppeling,
  leesOordeel,
  opmaak,
  soortAntwoord,
  voerControleUit,
} from "../../../scripts/deploycontrole-regels.mjs";

const VOL = {
  TENANT_ID: "0e4850b7-a8e9-4e68-ae59-7105e884cb9c",
  PORTAAL_BFF_URL: "https://portaal.site-up.nl/api/preview-content",
  PORTAAL_PREVIEW_SECRET: "geheim-van-de-test",
  NEXT_PUBLIC_SUPABASE_URL: "https://voorbeeld.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_test",
};

describe("leesKoppeling", () => {
  it("geen enkele variabele: geen koppeling, de template bouwt op het proefbestand", () => {
    expect(leesKoppeling({})).toEqual({ soort: "geen" });
    // `leesKoppeling` zegt alleen of er een koppeling is; wat "geen" op Vercel betekent
    // beslist `voerControleUit` (portaal 56-02).
    expect(leesKoppeling({ PORTAAL_REVALIDATE_SECRET: "x", VERCEL: "1" })).toEqual({ soort: "geen" });
  });

  it("alle vijf: volledig, met het adres van de controle op hetzelfde portaal", () => {
    expect(leesKoppeling(VOL)).toEqual({
      soort: "volledig",
      tenantId: VOL.TENANT_ID,
      adres: "https://portaal.site-up.nl/api/deploycontrole",
      geheim: VOL.PORTAAL_PREVIEW_SECRET,
    });
  });

  it("een deel: half, en noemt precies wat ontbreekt", () => {
    // De stand van het proefproject op Preview vóór 54-02 taak 3, als `klant-env.mjs` er
    // zonder `--volledig` overheen was gegaan: het tenant-ID en het geheim, de rest niet.
    const { TENANT_ID, PORTAAL_PREVIEW_SECRET } = VOL;
    expect(leesKoppeling({ TENANT_ID, PORTAAL_PREVIEW_SECRET })).toEqual({
      soort: "half",
      ontbreken: ["PORTAAL_BFF_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    });
  });

  it.each(KOPPELVARIABELEN)("zonder %s: half", (naam) => {
    expect(leesKoppeling({ ...VOL, [naam]: undefined })).toEqual({ soort: "half", ontbreken: [naam] });
  });

  it("een lege waarde telt als niet gezet", () => {
    expect(leesKoppeling({ ...VOL, TENANT_ID: "  " })).toEqual({ soort: "half", ontbreken: ["TENANT_ID"] });
    expect(leesKoppeling(Object.fromEntries(KOPPELVARIABELEN.map((n) => [n, ""])))).toEqual({ soort: "geen" });
  });
});

describe("soortAntwoord", () => {
  it("200 is een oordeel", () => expect(soortAntwoord(200)).toBe("oordeel"));
  it.each([429, 500, 502, 503, 504])("%i is een storing: herhalen, en de noodgreep geldt", (s) => {
    expect(soortAntwoord(s)).toBe("storing");
  });
  it.each([400, 401, 403, 404])("%i is een fout aan deze kant: afbreken zonder noodgreep", (s) => {
    expect(soortAntwoord(s)).toBe("afbreken");
  });
});

describe("opmaak", () => {
  const KLANT = VOL.TENANT_ID;

  it("in orde: één regel met wat er geteld is", () => {
    expect(opmaak({ ok: true, afwijkingen: [], meldingen: [], geteld: { sectietypes: 3, secties: 5 } }, KLANT)).toEqual([
      `deploycontrole: in orde, 3 sectietypes, 5 secties (klant ${KLANT})`,
    ]);
  });

  it("enkelvoud waar het er één is", () => {
    expect(opmaak({ ok: true, geteld: { sectietypes: 1, secties: 1 } }, KLANT)[0]).toContain("1 sectietype, 1 sectie ");
  });

  it("afgekeurd: de klant, per afwijking de reden, en per sectie de pagina en de plek", () => {
    const regels = opmaak(
      {
        ok: false,
        afwijkingen: [
          {
            code: "TYPE_ONBEKEND_IN_GEBRUIK",
            reden: "Sectietype \"oproep\" staat niet in deze sitecode, maar er is 1 sectie van.",
            secties: [{ id: "a79f572a", pagina: "/", positie: 4, type: "oproep" }],
          },
          { code: "SCHEMA_ONGELIJK", reden: "Sectietype \"tekst\": velden (bijschrift), versie 1 → 2; seed eerst." },
        ],
        meldingen: ["sectietype \"oud\" staat alleen in de database."],
        geteld: { sectietypes: 2, secties: 5 },
      },
      KLANT,
    );
    expect(regels[0]).toBe(`deploycontrole: AFGEKEURD voor klant ${KLANT} (2 sectietypes, 5 secties)`);
    expect(regels).toContain("- TYPE_ONBEKEND_IN_GEBRUIK: Sectietype \"oproep\" staat niet in deze sitecode, maar er is 1 sectie van.");
    expect(regels).toContain("  -> pagina /, sectie 4 (oproep)");
    expect(regels).toContain("- SCHEMA_ONGELIJK: Sectietype \"tekst\": velden (bijschrift), versie 1 → 2; seed eerst.");
    expect(regels.at(-1)).toBe("- melding: sectietype \"oud\" staat alleen in de database.");
    // De volgorde: de secties staan direct onder hun eigen afwijking.
    expect(regels.indexOf("  -> pagina /, sectie 4 (oproep)")).toBe(
      regels.findIndex((r) => r.startsWith("- TYPE_ONBEKEND_IN_GEBRUIK")) + 1,
    );
  });

  it("een sectie die op verwijderen staat heet zo, niet 'sectie 0'", () => {
    const regels = opmaak(
      {
        ok: false,
        afwijkingen: [{ code: "TYPE_ONBEKEND_IN_GEBRUIK", reden: "r", secties: [{ pagina: "/", positie: 0, type: "weg" }, { pagina: "/", positie: 2, type: "weg" }] }],
        meldingen: [],
        geteld: { sectietypes: 1, secties: 2 },
      },
      KLANT,
    );
    expect(regels).toContain("  -> pagina /, een sectie die op verwijderen staat (weg)");
    expect(regels).toContain("  -> pagina /, sectie 2 (weg)");
    expect(regels.join("\n")).not.toContain("sectie 0");
  });

  // `opmaak` krijgt na `leesOordeel` alleen nog volledige antwoorden; dit blijft als vangnet.
  it("een antwoord zonder lijsten loopt niet vast", () => {
    expect(opmaak({ ok: false }, KLANT)).toEqual([
      `deploycontrole: AFGEKEURD voor klant ${KLANT} (niets geteld)`,
      "Deze sitecode past niet bij wat er voor deze klant in het portaal staat:",
    ]);
  });
});

describe("leesKoppeling: het adres van het portaal", () => {
  it.each(["http://portaal.site-up.nl/x", "http://localhost.voorbeeld.nl/x", "ftp://portaal.site-up.nl", "http://127.0.0.1.voorbeeld.nl"])(
    "%s is ongeldig: het geheim zou in klare tekst gaan",
    (adres) => {
      expect(leesKoppeling({ ...VOL, PORTAAL_BFF_URL: adres }).soort).toBe("ongeldig");
    },
  );
  it.each(["http://localhost:3000/api/preview-content", "http://127.0.0.1:3100/", "http://[::1]:3000/", "https://portaal.site-up.nl"])(
    "%s mag",
    (adres) => {
      expect(leesKoppeling({ ...VOL, PORTAAL_BFF_URL: adres }).soort).toBe("volledig");
    },
  );
  it("een adres met gebruikersgegevens is ongeldig, en het wachtwoord komt niet in de reden", () => {
    const uit = leesKoppeling({ ...VOL, PORTAAL_BFF_URL: "https://naam:wachtwoord@portaal.site-up.nl" });
    expect(uit.soort).toBe("ongeldig");
    expect(JSON.stringify(uit)).not.toContain("wachtwoord@");
  });

  it("onzin is ongeldig, geen crash", () => {
    expect(leesKoppeling({ ...VOL, PORTAAL_BFF_URL: "geen adres" })).toEqual({ soort: "ongeldig", reden: "PORTAAL_BFF_URL is geen geldig adres." });
  });
});

describe("isBouwomgeving", () => {
  it.each(["VERCEL", "VERCEL_ENV", "VERCEL_URL", "CI"])("%s gezet: ja", (n) => expect(isBouwomgeving({ [n]: "1" })).toBe(true));
  it("niets gezet, of leeg: nee", () => {
    expect(isBouwomgeving({})).toBe(false);
    expect(isBouwomgeving({ VERCEL: " ", CI: "" })).toBe(false);
  });
});

const GOED = { ok: true, afwijkingen: [], meldingen: [], geteld: { sectietypes: 3, secties: 5 } };
const AFGEKEURD = { ok: false, afwijkingen: [{ code: "SCHEMA_ONGELIJK", reden: "seed eerst" }], meldingen: [], geteld: { sectietypes: 3, secties: 5 } };

describe("leesOordeel: het antwoord wordt geheel getoetst", () => {
  it("een volledig oordeel komt erdoor", () => {
    expect(leesOordeel(JSON.stringify(GOED))).toEqual({ oordeel: GOED });
    expect(leesOordeel(JSON.stringify(AFGEKEURD))).toEqual({ oordeel: AFGEKEURD });
  });
  it.each([
    ["alleen ok", { ok: true }],
    ["zonder geteld", { ok: true, afwijkingen: [], meldingen: [] }],
    ["zonder meldingen", { ok: true, afwijkingen: [], geteld: { sectietypes: 1, secties: 1 } }],
    ["ok als tekst", { ...GOED, ok: "true" }],
    ["een afwijking zonder reden", { ...AFGEKEURD, afwijkingen: [{ code: "X" }] }],
    ["een negatieve telling", { ...GOED, geteld: { sectietypes: -1, secties: 0 } }],
    ["een melding die geen tekst is", { ...GOED, meldingen: [3] }],
    ["null", null],
    ["een lijst", []],
  ])("%s: geen volledig oordeel", (_naam, antwoord) => {
    expect(leesOordeel(JSON.stringify(antwoord))).toEqual({ fout: "geen volledig oordeel" });
  });
  it("in orde met afwijkingen, of afgekeurd zonder: tegenstrijdig", () => {
    expect(leesOordeel(JSON.stringify({ ...AFGEKEURD, ok: true }))).toEqual({ fout: "een tegenstrijdig oordeel" });
    expect(leesOordeel(JSON.stringify({ ...GOED, ok: false }))).toEqual({ fout: "een tegenstrijdig oordeel" });
  });
  it("HTML of een lege body: geen leesbaar antwoord", () => {
    expect(leesOordeel("<html>Onderhoud</html>")).toEqual({ fout: "geen leesbaar antwoord" });
    expect(leesOordeel("")).toEqual({ fout: "geen leesbaar antwoord" });
  });
});

describe("voerControleUit: de hele beslissing", () => {
  type Antwoord = { status: number; tekst?: string } | { gooi: string };
  /** Een `fetch` die een rij antwoorden afwerkt en bijhoudt wat hij kreeg. */
  function nep(...antwoorden: Antwoord[]) {
    const verzoeken: { adres: string; init: RequestInit }[] = [];
    const haal = (async (adres: string, init: RequestInit) => {
      verzoeken.push({ adres, init });
      const a = antwoorden[Math.min(verzoeken.length - 1, antwoorden.length - 1)];
      if ("gooi" in a) throw Object.assign(new Error(a.gooi), { name: a.gooi });
      return { status: a.status, text: async () => a.tekst ?? "" };
    }) as unknown as typeof fetch;
    return { haal, verzoeken };
  }
  const wachttijden: number[] = [];
  const wacht = async (ms: number) => void wachttijden.push(ms);
  const draai = (env: Record<string, string | undefined>, haal: typeof fetch) => voerControleUit({ env, sectietypes: [], haal, wacht });
  const AF = "deploycontrole: de bouw is afgebroken; de live site is niet gewijzigd.";

  it("in orde: door, met de tak op de eerste regel", async () => {
    const { haal, verzoeken } = nep({ status: 200, tekst: JSON.stringify(GOED) });
    const uit = await draai({ ...VOL, VERCEL: "1" }, haal);
    expect(uit.code).toBe(0);
    expect(uit.regels[0]).toBe('deploycontrole: tak "koppeling" (bouwomgeving): https://portaal.site-up.nl/api/deploycontrole');
    expect(uit.regels[1]).toContain("in orde, 3 sectietypes, 5 secties");
    expect(verzoeken).toHaveLength(1);
    expect(verzoeken[0].init.redirect).toBe("manual");
    expect((verzoeken[0].init.headers as Record<string, string>)["X-Preview-Secret"]).toBe(VOL.PORTAAL_PREVIEW_SECRET);
    expect(verzoeken[0].adres).not.toContain(VOL.PORTAAL_PREVIEW_SECRET);
  });

  it("afgekeurd: stoppen, en de noodgreep helpt niet", async () => {
    const uit = await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, nep({ status: 200, tekst: JSON.stringify(AFGEKEURD) }).haal);
    expect(uit.code).toBe(1);
    expect(uit.regels).toContain("- SCHEMA_ONGELIJK: seed eerst");
    expect(uit.regels.at(-1)).toBe(AF);
  });

  it("503 twee keer: één herhaling na de wachttijd, dan stoppen", async () => {
    wachttijden.length = 0;
    const { haal, verzoeken } = nep({ status: 503 });
    const uit = await draai(VOL, haal);
    expect(uit.code).toBe(1);
    expect(verzoeken).toHaveLength(2);
    expect(wachttijden).toEqual([3000]);
    expect(uit.regels.join("\n")).toContain("het portaal gaf 503, twee pogingen");
  });

  it("503 twee keer met de noodgreep: door, luid, en als waarschuwing", async () => {
    const { haal, verzoeken } = nep({ status: 503 });
    const uit = await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, haal);
    expect(uit).toMatchObject({ code: 0, waarschuwing: true });
    expect(verzoeken).toHaveLength(2);
    expect(uit.regels.join("\n")).toContain("OVERGESLAGEN met DEPLOYCONTROLE=overslaan");
  });

  it("503 en dan 200: de herhaling telt", async () => {
    const { haal, verzoeken } = nep({ status: 503 }, { status: 200, tekst: JSON.stringify(GOED) });
    const uit = await draai(VOL, haal);
    expect(uit.code).toBe(0);
    expect(verzoeken).toHaveLength(2);
  });

  it("429, een time-out en geen verbinding zijn storingen", async () => {
    for (const a of [{ status: 429 }, { gooi: "TimeoutError" }, { gooi: "TypeError" }] as Antwoord[]) {
      const { haal, verzoeken } = nep(a);
      expect((await draai(VOL, haal)).code).toBe(1);
      expect(verzoeken).toHaveLength(2);
      expect((await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, nep(a).haal)).code).toBe(0);
    }
    expect((await draai(VOL, nep({ gooi: "TimeoutError" }).haal)).regels.join("\n")).toContain("geen antwoord binnen 15 s");
  });

  it.each([301, 302, 307, 308])("%i: geen herhaling, geen noodgreep, het geheim ging één keer weg", async (status) => {
    const { haal, verzoeken } = nep({ status }, { status: 200, tekst: JSON.stringify(GOED) });
    const uit = await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, haal);
    expect(uit.code).toBe(1);
    expect(verzoeken).toHaveLength(1);
    expect(uit.regels.join("\n")).toContain(`het portaal verwees door (${status})`);
  });

  it("een antwoord waarvan de body niet te lezen is, blijft dat antwoord: geen storing, geen noodgreep", async () => {
    for (const status of [307, 403, 200]) {
      const verzoeken: unknown[] = [];
      const haal = (async (...args: unknown[]) => {
        verzoeken.push(args);
        return { status, text: async () => { throw new TypeError("body afgebroken"); } };
      }) as unknown as typeof fetch;
      const uit = await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, haal);
      expect(uit.code, String(status)).toBe(1);
      expect(verzoeken, String(status)).toHaveLength(1);
      expect(uit.regels.join("\n")).not.toContain("OVERGESLAGEN");
    }
  });

  it("403 en 400: stoppen zonder herhaling en zonder noodgreep", async () => {
    for (const status of [403, 400, 404]) {
      const { haal, verzoeken } = nep({ status, tekst: "nee" });
      expect((await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, haal)).code).toBe(1);
      expect(verzoeken).toHaveLength(1);
    }
  });

  it.each([
    ['{"ok":true}', "geen volledig oordeel"],
    [JSON.stringify({ ...AFGEKEURD, ok: true }), "een tegenstrijdig oordeel"],
    [JSON.stringify({ ...GOED, ok: false }), "een tegenstrijdig oordeel"],
    ["<html>ok</html>", "geen leesbaar antwoord"],
    ["", "geen leesbaar antwoord"],
  ])("200 met %s: stoppen, ook met de noodgreep", async (tekst, reden) => {
    const uit = await draai({ ...VOL, DEPLOYCONTROLE: "overslaan" }, nep({ status: 200, tekst }).haal);
    expect(uit.code).toBe(1);
    expect(uit.regels.join("\n")).toContain(`het portaal gaf ${reden}.`);
  });

  it("zonder koppeling op een werkplek: overslaan, en dat staat er", async () => {
    const { haal, verzoeken } = nep({ status: 200 });
    const uit = await draai({}, haal);
    expect(uit).toEqual({ code: 0, regels: ['deploycontrole: tak "lokaal, zonder koppeling" (lokaal): controle overgeslagen.'], waarschuwing: false });
    expect(verzoeken).toHaveLength(0);
  });

  it.each(["VERCEL", "VERCEL_ENV", "CI"])("zonder koppeling op een bouwomgeving (%s): stoppen, ook met de noodgreep", async (n) => {
    const { haal, verzoeken } = nep({ status: 200 });
    const uit = await draai({ [n]: "1", DEPLOYCONTROLE: "overslaan" }, haal);
    expect(uit.code).toBe(1);
    expect(uit.regels[0]).toContain('tak "geen koppeling" (bouwomgeving)');
    expect(uit.regels.join("\n")).toContain("SITEUP_DEMO=1");
    expect(verzoeken).toHaveLength(0);
  });

  it("zonder koppeling op een bouwomgeving met SITEUP_DEMO=1: de demo bouwt, en dat staat er", async () => {
    const uit = await draai({ VERCEL: "1", SITEUP_DEMO: "1" }, nep({ status: 200 }).haal);
    expect(uit.code).toBe(0);
    expect(uit.regels[0]).toContain('tak "demo" (bouwomgeving, SITEUP_DEMO=1)');
    // alleen de waarde 1 telt
    expect((await draai({ VERCEL: "1", SITEUP_DEMO: "true" }, nep({ status: 200 }).haal)).code).toBe(1);
  });

  it("met een volledige koppeling draait de controle, ook met SITEUP_DEMO=1", async () => {
    const { haal, verzoeken } = nep({ status: 200, tekst: JSON.stringify(AFGEKEURD) });
    expect((await draai({ ...VOL, VERCEL: "1", SITEUP_DEMO: "1" }, haal)).code).toBe(1);
    expect(verzoeken).toHaveLength(1);
  });

  it("een halve koppeling, een http-adres of gebruikersgegevens: stoppen zonder verzoek, ook met de noodgreep, en de tak staat erbij", async () => {
    for (const [env, tak] of [
      [{ ...VOL, TENANT_ID: "" }, "halve koppeling"],
      [{ ...VOL, PORTAAL_BFF_URL: "http://portaal.site-up.nl" }, "ongeldige koppeling"],
      [{ ...VOL, PORTAAL_BFF_URL: "https://a:b@portaal.site-up.nl" }, "ongeldige koppeling"],
    ] as const) {
      const { haal, verzoeken } = nep({ status: 200, tekst: JSON.stringify(GOED) });
      const uit = await draai({ ...env, DEPLOYCONTROLE: "overslaan", VERCEL: "1" }, haal);
      expect(uit.code).toBe(1);
      expect(uit.regels[0]).toBe(`deploycontrole: tak "${tak}" (bouwomgeving).`);
      expect(verzoeken).toHaveLength(0);
    }
  });

  // Geen aanname over `fetch`: met de echte `fetch` van Node tegen een echte server. Volgt hij
  // de redirect toch, dan komt het geheim bij het tweede adres aan en is deze test rood.
  it("de echte fetch volgt een redirect niet en geeft het geheim niet door", async () => {
    const ontvangen: { pad: string; geheim: string | undefined }[] = [];
    const server = createServer((req, res) => {
      ontvangen.push({ pad: req.url ?? "", geheim: req.headers["x-preview-secret"] as string | undefined });
      if (req.url === "/api/deploycontrole") res.writeHead(307, { Location: "/elders" }).end();
      else res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(GOED));
    });
    await new Promise<void>((klaar) => server.listen(0, "127.0.0.1", klaar));
    try {
      const poort = (server.address() as AddressInfo).port;
      const uit = await voerControleUit({ env: { ...VOL, PORTAAL_BFF_URL: `http://127.0.0.1:${poort}/api/preview-content` }, sectietypes: [], haal: fetch, wacht });
      expect(uit.code).toBe(1);
      expect(uit.regels.join("\n")).toContain("het portaal verwees door (307)");
      expect(ontvangen).toEqual([{ pad: "/api/deploycontrole", geheim: VOL.PORTAAL_PREVIEW_SECRET }]);
    } finally {
      await new Promise((klaar) => server.close(klaar));
    }
  });
});
