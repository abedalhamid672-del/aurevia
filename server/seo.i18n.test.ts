import { describe, expect, it } from "vitest";
import { assertTranslationParity } from "../client/src/lib/i18n";
import { buildSitemapXml, localizedFragrancePath, metadataForPath } from "../shared/seo";

describe("Aurevia SEO and locale foundation", () => {
  it("keeps translation keys in parity", () => expect(() => assertTranslationParity()).not.toThrow());
  it("uses reciprocal localized product routes", () => {
    expect(localizedFragrancePath("en", "louis-vuitton-imagination")).toBe("/fragrance/louis-vuitton-imagination");
    expect(localizedFragrancePath("ar", "louis-vuitton-imagination")).toBe("/ar/عطر/louis-vuitton-imagination");
    expect(metadataForPath("/ar/عطر/louis-vuitton-imagination").canonical).toContain("/ar/%D8%B9%D8%B7%D8%B1/");
  });
  it("emits only real product slugs supplied by the registry", () => {
    const xml = buildSitemapXml(["louis-vuitton-imagination"]);
    expect(xml).toContain("/fragrance/louis-vuitton-imagination");
    expect(xml).toContain("/ar/%D8%B9%D8%B7%D8%B1/louis-vuitton-imagination");
    expect(xml).not.toContain("/pricing");
  });
  it("keeps account routes out of the public index", () => {
    expect(metadataForPath("/account").robots).toBe("noindex,nofollow");
    expect(metadataForPath("/ar/account").robots).toBe("noindex,nofollow");
  });
});
