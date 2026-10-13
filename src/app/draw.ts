export interface Point {
  x: number;
  y: number;
}

export interface PointerInfo {
  pointerId: number;
  isPrimary: boolean;
  button: number;
}

export type GestureEnd = { kind: "rect"; start: Point; end: Point } | { kind: "tap" };

// Below this many pixels on either side, a release is a tap, not a rectangle.
export const MIN_DRAG_PX = 8;

export class RectGesture {
  private pointerId?: number;
  private start?: Point;

  get active(): boolean {
    return this.pointerId !== undefined;
  }

  down(pointer: PointerInfo, at: Point): boolean {
    if (this.active || !pointer.isPrimary || pointer.button !== 0) return false;
    this.pointerId = pointer.pointerId;
    this.start = at;
    return true;
  }

  move(pointerId: number, at: Point): { start: Point; end: Point } | undefined {
    if (pointerId !== this.pointerId || !this.start) return undefined;
    return { start: this.start, end: at };
  }

  up(pointerId: number, at: Point): GestureEnd | undefined {
    if (pointerId !== this.pointerId || !this.start) return undefined;
    const start = this.start;
    this.reset();
    const tooSmall = Math.abs(at.x - start.x) < MIN_DRAG_PX || Math.abs(at.y - start.y) < MIN_DRAG_PX;
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
