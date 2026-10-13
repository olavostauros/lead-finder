import { describe, expect, it } from "vitest";
import { withTimeout } from "./http";

const hang = (signal: AbortSignal) =>
  new Promise<never>((_, reject) => signal.addEventListener("abort", () => reject(signal.reason)));

describe("withTimeout", () => {
  it("returns the result when the call finishes in time", async () => {
    await expect(withTimeout(1000, undefined, "lento", async () => 42)).resolves.toBe(42);
  });

  it("aborts a stalled call and throws the given message", async () => {
    await expect(withTimeout(10, undefined, "Demorou demais.", hang)).rejects.toThrow("Demorou demais.");
  });

  it("passes the caller's abort through unchanged", async () => {
    const controller = new AbortController();
    const run = withTimeout(1000, controller.signal, "Demorou demais.", hang);
    controller.abort();
    await expect(run).rejects.toMatchObject({ name: "AbortError" });
  });

  it("does not translate errors other than the timeout", async () => {
    await expect(
      withTimeout(1000, undefined, "Demorou demais.", async () => {
        throw new Error("HTTP 500");
      }),
    ).rejects.toThrow("HTTP 500");
  });
});
