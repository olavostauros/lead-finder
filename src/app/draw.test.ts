import { describe, expect, it } from "vitest";
import { MIN_DRAG_PX, RectGesture } from "./draw";

const down = (g: RectGesture, id: number, x: number, y: number, isPrimary = true, button = 0) =>
  g.down({ pointerId: id, isPrimary, button }, { x, y });

describe("RectGesture", () => {
  it("draws a rectangle from a drag", () => {
    const g = new RectGesture();
    expect(down(g, 1, 10, 10)).toBe(true);
    expect(g.move(1, { x: 60, y: 80 })).toEqual({ start: { x: 10, y: 10 }, end: { x: 60, y: 80 } });
    expect(g.up(1, { x: 100, y: 90 })).toEqual({ kind: "rect", start: { x: 10, y: 10 }, end: { x: 100, y: 90 } });
    expect(g.active).toBe(false);
  });

  it("treats a tap as no drawing, not as an empty area", () => {
    const g = new RectGesture();
    down(g, 1, 50, 50);
    expect(g.up(1, { x: 50, y: 50 })).toEqual({ kind: "tap" });
  });

  it("treats a jittery tap, or a drag along one edge only, as a tap", () => {
    const g = new RectGesture();
    down(g, 1, 50, 50);
    expect(g.up(1, { x: 50 + MIN_DRAG_PX - 1, y: 52 })).toEqual({ kind: "tap" });
    down(g, 1, 50, 50);
    expect(g.up(1, { x: 250, y: 50 + MIN_DRAG_PX - 1 })).toEqual({ kind: "tap" });
  });

  it("ignores a second finger while the first is drawing", () => {
    const g = new RectGesture();
    down(g, 1, 10, 10);
    expect(down(g, 2, 200, 200, false)).toBe(false);
    expect(g.move(2, { x: 300, y: 300 })).toBeUndefined();
    expect(g.up(2, { x: 300, y: 300 })).toBeUndefined();
    expect(g.up(1, { x: 60, y: 60 })).toEqual({ kind: "rect", start: { x: 10, y: 10 }, end: { x: 60, y: 60 } });
  });

  it("does not start on a non-primary pointer or a non-left mouse button", () => {
    const g = new RectGesture();
    expect(down(g, 3, 10, 10, false)).toBe(false);
    expect(down(g, 4, 10, 10, true, 2)).toBe(false);
    expect(g.active).toBe(false);
  });

  it("drops the stroke on pointercancel and can start again", () => {
    const g = new RectGesture();
    down(g, 1, 10, 10);
    expect(g.cancel(2)).toBe(false);
    expect(g.cancel(1)).toBe(true);
    expect(g.active).toBe(false);
    expect(g.up(1, { x: 60, y: 60 })).toBeUndefined();
    expect(down(g, 5, 20, 20)).toBe(true);
  });

  it("ignores moves before any pointer is down", () => {
    expect(new RectGesture().move(1, { x: 1, y: 1 })).toBeUndefined();
  });
});
