import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Home discovery controls and creator credit", () => {
  const homeSource = readFileSync(resolve(process.cwd(), "client/src/pages/Home.tsx"), "utf8");

  it("keeps Compare and Bag controls connected to explicit actions", () => {
    expect(homeSource).toContain("const openCompare = () => setCompareOpen(true)");
    expect(homeSource).toContain("const openBag = () => setCartOpen(true)");
    expect(homeSource).toContain("onClick={openCompare}");
    expect(homeSource).toContain("onClick={openBag}");
  });

  it("includes the requested creator credit in the site footer", () => {
    expect(homeSource).toContain("Created by ENG. Abdulhamid ALkatib");
  });
});
