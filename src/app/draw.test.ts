import { describe, expect, it } from "vitest";
import { MIN_DRAG_PX, RectGesture, suspend, type Point } from "./draw";

const pixels = () => new RectGesture<Point>((p) => p);

const down = (g: RectGesture<Point>, id: number, x: number, y: number, isPrimary = true, button = 0) =>
  g.down({ pointerId: id, isPrimary, button }, { x, y });

describe("RectGesture", () => {
  it("draws a rectangle from a drag", () => {
    const g = pixels();
    expect(down(g, 1, 10, 10)).toBe(true);
    expect(g.move(1, { x: 60, y: 80 })).toEqual({ start: { x: 10, y: 10 }, end: { x: 60, y: 80 } });
    expect(g.up(1, { x: 100, y: 90 })).toEqual({ kind: "rect", start: { x: 10, y: 10 }, end: { x: 100, y: 90 } });
    expect(g.active).toBe(false);
  });

  it("treats a tap as no drawing, not as an empty area", () => {
    const g = pixels();
    down(g, 1, 50, 50);
    expect(g.up(1, { x: 50, y: 50 })).toEqual({ kind: "tap" });
  });

  it("treats a jittery tap, or a drag along one edge only, as a tap", () => {
    const g = pixels();
    down(g, 1, 50, 50);
    expect(g.up(1, { x: 50 + MIN_DRAG_PX - 1, y: 52 })).toEqual({ kind: "tap" });
    down(g, 1, 50, 50);
    expect(g.up(1, { x: 250, y: 50 + MIN_DRAG_PX - 1 })).toEqual({ kind: "tap" });
  });

  it("ignores a second finger while the first is drawing", () => {
    const g = pixels();
    down(g, 1, 10, 10);
    expect(down(g, 2, 200, 200, false)).toBe(false);
    expect(g.move(2, { x: 300, y: 300 })).toBeUndefined();
    expect(g.up(2, { x: 300, y: 300 })).toBeUndefined();
    expect(g.up(1, { x: 60, y: 60 })).toEqual({ kind: "rect", start: { x: 10, y: 10 }, end: { x: 60, y: 60 } });
  });

  it("does not start on a non-primary pointer or a non-left mouse button", () => {
    const g = pixels();
    expect(down(g, 3, 10, 10, false)).toBe(false);
    expect(down(g, 4, 10, 10, true, 2)).toBe(false);
    expect(g.active).toBe(false);
  });

  it("drops the stroke on pointercancel and can start again", () => {
    const g = pixels();
    down(g, 1, 10, 10);
    expect(g.cancel(2)).toBe(false);
    expect(g.cancel(1)).toBe(true);
    expect(g.active).toBe(false);
    expect(g.up(1, { x: 60, y: 60 })).toBeUndefined();
    expect(down(g, 5, 20, 20)).toBe(true);
  });

  it("ignores moves before any pointer is down", () => {
    expect(pixels().move(1, { x: 1, y: 1 })).toBeUndefined();
  });

  it("keeps the start where it landed on the map when the map zooms mid-stroke", () => {
    let zoom = 1;
    const g = new RectGesture<Point>((p) => ({ x: p.x * zoom, y: p.y * zoom }));
    g.down({ pointerId: 1, isPrimary: true, button: 0 }, { x: 10, y: 10 });
    zoom = 4;
    expect(g.move(1, { x: 200, y: 200 })).toEqual({ start: { x: 10, y: 10 }, end: { x: 200, y: 200 } });
    expect(g.up(1, { x: 200, y: 200 })).toEqual({ kind: "rect", start: { x: 10, y: 10 }, end: { x: 200, y: 200 } });
  });

  it("measures a tap against where the start is on screen now, not where it was", () => {
    let zoom = 1;
    const g = new RectGesture<Point>((p) => ({ x: p.x * zoom, y: p.y * zoom }));
    g.down({ pointerId: 1, isPrimary: true, button: 0 }, { x: 10, y: 10 });
    zoom = 4;
    expect(g.up(1, { x: 12, y: 12 })).toEqual({ kind: "rect", start: { x: 10, y: 10 }, end: { x: 12, y: 12 } });
    g.down({ pointerId: 1, isPrimary: true, button: 0 }, { x: 10, y: 10 });
    expect(g.up(1, { x: 41, y: 42 })).toEqual({ kind: "tap" });
  });
});

describe("suspend", () => {
  const handler = (on: boolean) => ({
    on,
    enabled() {
      return this.on;
    },
    enable() {
      this.on = true;
    },
    disable() {
      this.on = false;
    },
  });

  it("disables every handler and restores only the ones that were on", () => {
    const zoom = handler(true);
    const wheel = handler(false);
    const restore = suspend([zoom, wheel]);
    expect(zoom.on).toBe(false);
    expect(wheel.on).toBe(false);
    restore();
    expect(zoom.on).toBe(true);
    expect(wheel.on).toBe(false);
  });

  it("restores once, so a later exit does not re-enable what someone else turned off", () => {
    const zoom = handler(true);
    const restore = suspend([zoom]);
    restore();
    zoom.disable();
    restore();
    expect(zoom.on).toBe(false);
  });
});
