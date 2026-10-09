export type Throttle = <T>(fn: () => Promise<T>) => Promise<T>;

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function createThrottle(
  intervalMs: number,
  clock: { now?: () => number; sleep?: (ms: number) => Promise<void> } = {},
): Throttle {
  const now = clock.now ?? Date.now;
  const wait = clock.sleep ?? sleep;
  let lastStart = -Infinity;
  let tail: Promise<unknown> = Promise.resolve();

  return <T>(fn: () => Promise<T>): Promise<T> => {
    const run = tail.then(async () => {
      const delay = lastStart + intervalMs - now();
      if (delay > 0) await wait(delay);
      lastStart = now();
      return fn();
    });
    tail = run.catch(() => {});
    return run;
  };
}
