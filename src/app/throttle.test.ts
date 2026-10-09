import { describe, expect, it } from "vitest";
import { createThrottle } from "./throttle";

describe("createThrottle", () => {
  it("spaces calls at least the interval apart, in order", async () => {
    let now = 0;
    const starts: number[] = [];
    const throttle = createThrottle(1000, {
      now: () => now,
      sleep: async (ms) => {
        now += ms;
      },
    });
    await Promise.all([1, 2, 3].map(() => throttle(async () => void starts.push(now))));
    expect(starts).toEqual([0, 1000, 2000]);
  });

  it("does not wait when the interval has already passed", async () => {
    let now = 0;
    const waits: number[] = [];
    const throttle = createThrottle(1000, { now: () => now, sleep: async (ms) => void waits.push(ms) });
    await throttle(async () => {});
    now = 5000;
    await throttle(async () => {});
    expect(waits).toEqual([]);
  });

  it("keeps the queue moving after a failure", async () => {
    const throttle = createThrottle(0);
    await expect(throttle(async () => Promise.reject(new Error("x")))).rejects.toThrow("x");
    await expect(throttle(async () => 1)).resolves.toBe(1);
  });
});
