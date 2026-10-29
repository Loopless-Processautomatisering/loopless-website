import { afterEach, describe, expect, it, vi } from "vitest";
import { herkomstSchoon, herkomstUitUrl, nieuwInzendingId } from "./herkomst";
import { stuurAanvraagDoor, type Aanvraag } from "./doorsturen";

describe("herkomstUitUrl", () => {
  it("leest kanaal, account en content uit de UTM-tags", () => {
    expect(herkomstUitUrl("?utm_source=instagram&utm_campaign=claude-stijl&utm_content=reel-tip01", "/contact"))
      .toEqual({ kanaal: "instagram", account: "claude-stijl", content: "reel-tip01" });
  });
  it("zonder tags: site · loopless · de pagina", () => {
    expect(herkomstUitUrl("", "/configurator")).toEqual({ kanaal: "site", account: "loopless", content: "/configurator" });
  });
  it("onbekend kanaal wordt anders, rare accountnaam wordt loopless", () => {
    expect(herkomstUitUrl("?utm_source=Faxx&utm_campaign=Hoofd%20Letters!", "/")).toEqual({
      kanaal: "anders", account: "loopless", content: "/",
    });
  });
  it("kort lange content in", () => {
    expect(herkomstUitUrl(`?utm_content=${"x".repeat(500)}`, "/").content).toHaveLength(200);
  });
});

describe("herkomstSchoon", () => {
  it("laat een geldige herkomst door", () => {
    expect(herkomstSchoon({ kanaal: "tiktok", account: "loopless", content: "video-7" }))
      .toEqual({ kanaal: "tiktok", account: "loopless", content: "video-7" });
  });
  it("weigert onbekend kanaal, foute accountnaam en geen object", () => {
    expect(herkomstSchoon({ kanaal: "x", account: "loopless" })).toBeNull();
    expect(herkomstSchoon({ kanaal: "site", account: "Loopless!" })).toBeNull();
    expect(herkomstSchoon("site")).toBeNull();
    expect(herkomstSchoon([])).toBeNull();
  });
});

it("nieuwInzendingId geeft een uuid v4", () => {
  expect(nieuwInzendingId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

describe("stuurAanvraagDoor", () => {
  const a: Aanvraag = {
    bron: "contact", extern_id: "0f8e7d6c-5b4a-4392-8170-6f5e4d3c2b1a", naam: "Test", email: "t@t.test",
    herkomst: { kanaal: "site", account: "loopless", content: "/contact" },
  };
  afterEach(() => vi.unstubAllEnvs());

  it("stuurt met het geheim als Bearer en geeft true bij 201", async () => {
    vi.stubEnv("AANVRAAG_DOORSTUUR_URL", "https://app.test/api/aanvraag-in");
    vi.stubEnv("AANVRAAG_DOORSTUUR_SECRET", "geheim");
    const doe = vi.fn(async () => new Response("{}", { status: 201 }));
    expect(await stuurAanvraagDoor(a, doe as unknown as typeof fetch)).toBe(true);
    const [url, opt] = doe.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://app.test/api/aanvraag-in");
    expect((opt.headers as Record<string, string>).Authorization).toBe("Bearer geheim");
    expect(JSON.parse(String(opt.body)).bron).toBe("contact");
  });
  it("app weg: false, geen fout naar boven (fail-safe)", async () => {
    vi.stubEnv("AANVRAAG_DOORSTUUR_URL", "https://bestaat-niet.test");
    vi.stubEnv("AANVRAAG_DOORSTUUR_SECRET", "geheim");
    const fout = vi.spyOn(console, "error").mockImplementation(() => {});
    const doe = vi.fn(async () => { throw new TypeError("fetch failed"); });
    await expect(stuurAanvraagDoor(a, doe as unknown as typeof fetch)).resolves.toBe(false);
    expect(fout).toHaveBeenCalled();
  });
  it("app antwoordt 500: false en gelogd", async () => {
    vi.stubEnv("AANVRAAG_DOORSTUUR_URL", "https://app.test");
    vi.stubEnv("AANVRAAG_DOORSTUUR_SECRET", "geheim");
    const fout = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await stuurAanvraagDoor(a, (async () => new Response("", { status: 500 })) as typeof fetch)).toBe(false);
    expect(fout).toHaveBeenCalledWith("[aanvraag] app antwoordde", 500, "contact");
  });
  it("zonder env: niets versturen, false", async () => {
    vi.stubEnv("AANVRAAG_DOORSTUUR_URL", "");
    vi.spyOn(console, "error").mockImplementation(() => {});
    const doe = vi.fn();
    expect(await stuurAanvraagDoor(a, doe as unknown as typeof fetch)).toBe(false);
    expect(doe).not.toHaveBeenCalled();
  });
});
