import { describe, expect, it } from "vitest";
import css from "./style.css?raw";

function threeLineBreakpoint(): { value: number; unit: string } {
  const match = css.match(/@media \(max-width: ([\d.]+)(px|em)\) \{\s*#status \{\s*min-height: 3\.75em;/);
  if (!match) throw new Error("no media query reserving three lines for #status in style.css");
  return { value: Number(match[1]), unit: match[2] };
}

describe("style.css, #status", () => {
  it("switches to the three-line reserve in em, so it follows the browser's text size", () => {
    expect(threeLineBreakpoint().unit).toBe("em");
  });

  it("keeps two lines from 360 px up at the default 16 px text size", () => {
    const { value } = threeLineBreakpoint();
    expect(value * 16).toBeLessThan(360);
    expect(value * 16).toBeGreaterThanOrEqual(359);
  });
});
