export interface Point {
  x: number;
  y: number;
}

export interface PointerInfo {
  pointerId: number;
  isPrimary: boolean;
  button: number;
}

export type GestureEnd<A> = { kind: "rect"; start: A; end: Point } | { kind: "tap" };

// Below this many pixels on either side, a release is a tap, not a rectangle.
export const MIN_DRAG_PX = 8;

// The start is kept as an anchor (a map coordinate in the app) and projected
// to the screen only when measured, so a zoom mid-stroke cannot move it.
export class RectGesture<A> {
  private pointerId?: number;
  private start?: A;

  constructor(private readonly toPoint: (anchor: A) => Point) {}

  get active(): boolean {
    return this.pointerId !== undefined;
  }

  down(pointer: PointerInfo, at: A): boolean {
    if (this.active || !pointer.isPrimary || pointer.button !== 0) return false;
    this.pointerId = pointer.pointerId;
    this.start = at;
    return true;
  }

  move(pointerId: number, at: Point): { start: A; end: Point } | undefined {
    if (pointerId !== this.pointerId || this.start === undefined) return undefined;
    return { start: this.start, end: at };
  }

  up(pointerId: number, at: Point): GestureEnd<A> | undefined {
    if (pointerId !== this.pointerId || this.start === undefined) return undefined;
    const start = this.start;
    this.reset();
    const from = this.toPoint(start);
    const tooSmall = Math.abs(at.x - from.x) < MIN_DRAG_PX || Math.abs(at.y - from.y) < MIN_DRAG_PX;
    return tooSmall ? { kind: "tap" } : { kind: "rect", start, end: at };
  }

  cancel(pointerId: number): boolean {
    if (pointerId !== this.pointerId) return false;
    this.reset();
    return true;
  }

  private reset() {
    this.pointerId = undefined;
    this.start = undefined;
  }
}

export interface Toggle {
  enabled(): boolean;
  enable(): unknown;
  disable(): unknown;
}

export function suspend(handlers: Toggle[]): () => void {
  let paused: Toggle[] | undefined = handlers.filter((h) => h.enabled());
  for (const h of paused) h.disable();
  return () => {
    for (const h of paused ?? []) h.enable();
    paused = undefined;
  };
}
