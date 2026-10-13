import { describe, expect, it } from "vitest";
import { CATEGORIES, findCategory } from "./categories";

describe("findCategory", () => {
  it("matches labels ignoring case and accents", () => {
    expect(findCategory("Padaria")?.label).toBe("Padaria");
    expect(findCategory("  ACADEMIA ")?.label).toBe("Academia");
    expect(findCategory("farmacia")?.label).toBe("Farmácia");
  });

  it("returns undefined for free text", () => {
    expect(findCategory("pizzaria do zé")).toBeUndefined();
  });

  it("gives every category at least one tag filter", () => {
    for (const c of CATEGORIES) expect(c.tags.length).toBeGreaterThan(0);
  });
});
