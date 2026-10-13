import { describe, expect, it } from "vitest";
import html from "../index.html?raw";

function openingTag(id: string): string {
  const tag = html.match(new RegExp(`<[a-z]+\\b[^>]*\\bid="${id}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`#${id} not found in index.html`);
  return tag;
}

describe("index.html", () => {
  it("announces the area line, so a refused area is heard and not only seen", () => {
    expect(openingTag("area-info")).toMatch(/\baria-live="polite"/);
  });
});
