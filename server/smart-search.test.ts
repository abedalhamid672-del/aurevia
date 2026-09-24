import { describe, expect, it } from "vitest";
import { fragrances } from "../client/src/data/fragrances";
import { getSmartMatches } from "../client/src/lib/smartSearch";

describe("smart fragrance search", () => {
  it("prioritizes fragrances matching selected accords and notes", () => {
    const matches = getSmartMatches(fragrances, "", { accords: ["Woody"], notes: ["Vanilla"], gender: "Men" });
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0]?.fragrance.gender).toBe("Men");
    expect(matches[0]?.fragrance.accords).toContain("Woody");
  });

  it("finds a fragrance by a personal note query", () => {
    const matches = getSmartMatches(fragrances, "oud", { accords: [], notes: [], gender: "All" });
    expect(matches.some(({ fragrance }) => fragrance.name === "Fleur du Désert")).toBe(true);
  });
});
