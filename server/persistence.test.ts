import { describe, expect, it } from "vitest";
import { readStoredIds } from "../client/src/lib/persistence";

describe("persistent ID storage", () => {
  it("returns an empty list safely outside a browser", () => {
    expect(readStoredIds("aurevia-test")).toEqual([]);
  });
});
