import { describe, expect, it } from "vitest";
import { fragranceProvider } from "../client/src/lib/fragranceProvider";
import { fragrances } from "../client/src/data/fragrances";
import { getAllNotes, getAvailability, sortFragrances } from "../client/src/types/fragrance";

describe("development fragrance provider", () => {
  it("returns the complete real catalog", async () => {
    const records = await fragranceProvider.search("");
    expect(records).toHaveLength(fragrances.length);
    expect(records.some((record) => record.dataStatus === "development")).toBe(true);
    expect(records.some((record) => record.dataStatus === "provider" && record.brand === "Louis Vuitton")).toBe(true);
    expect(records.some((record) => record.dataStatus === "provider" && record.brand === "Jean Paul Gaultier")).toBe(true);
    expect(records.some((record) => record.name === "N°5 Eau de Parfum")).toBe(true);
  });

  it("searches across notes and accords", async () => {
    const records = await fragranceProvider.search("saffron");
    expect(records.map((record) => record.name)).toContain("Baccarat Rouge 540");
  });

  it("preserves explicit unavailable pricing", async () => {
    const record = await fragranceProvider.getProduct("creed-aventus");
    expect(record?.offers).toEqual([]);
  });

  it("keeps product profiles complete for notes, sizes, and availability", () => {
    fragrances.forEach((record) => {
      expect(getAllNotes(record).length).toBeGreaterThan(0);
      expect(record.sizes.length).toBeGreaterThan(0);
      expect(getAvailability(record)).toBe(record.offers.length ? "In stock" : "Price unavailable");
    });
  });

  it("sorts newest records and keeps pricing provenance explicit", () => {
    const newest = sortFragrances(fragrances, "newest")[0];
    expect(newest?.name).toBe("Ambre Levant");
    expect(fragrances.filter((record) => record.dataStatus === "development").every((record) => record.offers.length === 0)).toBe(true);
    expect(fragrances.filter((record) => record.dataStatus === "provider").every((record) => record.offers.length > 0)).toBe(true);
  });
});
