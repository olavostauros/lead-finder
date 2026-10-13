export type FetchFn = (url: string, init?: RequestInit) => Promise<Response>;

export async function withTimeout<T>(
  ms: number,
  signal: AbortSignal | undefined,
  timeoutMessage: string,
  run: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const timeout = AbortSignal.timeout(ms);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  try {
    return await run(combined);
  } catch (err) {
    if (timeout.aborted && !signal?.aborted) throw new Error(timeoutMessage);
    throw err;
  }
}
