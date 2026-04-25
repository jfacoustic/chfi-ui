import { describe, expect, it } from "vitest";
import { flagUrl, iso3ToIso2 } from "./iso";

describe("iso3ToIso2", () => {
  it.each([
    ["USA", "US"],
    ["GBR", "GB"],
    ["DEU", "DE"],
    ["JPN", "JP"],
    ["BRA", "BR"],
  ])("maps %s to %s", (iso3, iso2) => {
    expect(iso3ToIso2(iso3)).toBe(iso2);
  });

  it("returns null for unknown ISO3", () => {
    expect(iso3ToIso2("XYZ")).toBeNull();
  });

  it("is case-insensitive on input", () => {
    expect(iso3ToIso2("usa")).toBe("US");
  });
});

describe("flagUrl", () => {
  it("returns a flagcdn URL for a known ISO3", () => {
    expect(flagUrl("USA")).toBe("https://flagcdn.com/w24/us.png");
  });

  it("respects the size argument", () => {
    expect(flagUrl("FRA", 48)).toBe("https://flagcdn.com/w48/fr.png");
  });

  it("returns null for an unmapped ISO3", () => {
    expect(flagUrl("XYZ")).toBeNull();
  });
});
