import { describe, expect, it } from "vitest";
import { fragranceProvider } from "../client/src/lib/fragranceProvider";

describe("development fragrance provider", () => {
  it("returns only the six real development records", async () => {
    const records = await fragranceProvider.search("");
    expect(records).toHaveLength(6);
    expect(records.every((record) => record.dataStatus === "development")).toBe(true);
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
});
