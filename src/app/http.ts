export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

// AbortSignal.any is missing in Safari/iOS < 17.4, Chrome < 116 and Firefox < 124, which the build targets.
function eitherSignal(a: AbortSignal, b: AbortSignal): { signal: AbortSignal; dispose: () => void } {
  if (typeof AbortSignal.any === "function") return { signal: AbortSignal.any([a, b]), dispose: () => {} };
  const controller = new AbortController();
  const fromA = () => controller.abort(a.reason);
  const fromB = () => controller.abort(b.reason);
  const dispose = () => {
    a.removeEventListener("abort", fromA);
    b.removeEventListener("abort", fromB);
  };
  if (a.aborted) fromA();
  else if (b.aborted) fromB();
  else {
    a.addEventListener("abort", fromA, { once: true });
    b.addEventListener("abort", fromB, { once: true });
  }
  return { signal: controller.signal, dispose };
}

export async function withTimeout<T>(
  ms: number,
  signal: AbortSignal | undefined,
  timeoutMessage: string,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const timeout = AbortSignal.timeout(ms);
  const combined = signal ? eitherSignal(signal, timeout) : { signal: timeout, dispose: () => {} };
  try {
    return await run(combined.signal);
  } catch (err) {
    if (timeout.aborted && !signal?.aborted) throw new Error(timeoutMessage);
    throw err;
  } finally {
    combined.dispose();
  }
}
