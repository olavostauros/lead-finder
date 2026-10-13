import { describe, expect, it } from "vitest";
import { SearchRunner } from "./search-run";
import type { Area, Lead, Provider, SearchOptions } from "./types";

const pinheiros: Area = { bbox: { south: -23.57, west: -46.7, north: -23.56, east: -46.69 }, label: "Pinheiros" };
const lead: Lead = {
  id: "osm:node/1",
  name: "Padaria A",
  lat: -23.565,
  lon: -46.695,
  source: "OpenStreetMap",
  sourceUrl: "https://www.openstreetmap.org/node/1",
};

const hangingUntilAbort = (): Provider & { opts?: SearchOptions } => {
  const provider: Provider & { opts?: SearchOptions } = {
    name: "fake",
    search: (_area, _query, opts = {}) => {
      provider.opts = opts;
      return new Promise((_, reject) =>
        opts.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))),
      );
    },
  };
  return provider;
};

const deferred = () => {
  let resolve!: (leads: Lead[]) => void;
  const promise = new Promise<Lead[]>((r) => (resolve = r));
  return { promise, resolve };
};

describe("SearchRunner", () => {
  it("returns the leads and whether the list is partial", async () => {
    const provider: Provider = {
      name: "fake",
      search: async (_a, _q, opts) => {
        opts?.onEvent?.({ kind: "requesting" });
        opts?.onEvent?.({ kind: "partial" });
        return [lead];
      },
    };
    const runner = new SearchRunner(provider);
    await expect(runner.run(pinheiros, "padaria")).resolves.toEqual({ kind: "done", leads: [lead], partial: true });
  });

  it("does not take a waiting event for a partial list", async () => {
    const provider: Provider = {
      name: "fake",
      search: async (_a, _q, opts) => {
        opts?.onEvent?.({ kind: "waiting", ms: 1000 });
        return [lead];
      },
    };
    await expect(new SearchRunner(provider).run(pinheiros, "padaria")).resolves.toMatchObject({ partial: false });
  });

  it("passes a signal to the provider and aborts it on cancel", async () => {
    const provider = hangingUntilAbort();
    const runner = new SearchRunner(provider);
    const run = runner.run(pinheiros, "padaria");
    expect(runner.busy).toBe(true);
    expect(provider.opts?.signal?.aborted).toBe(false);
    runner.cancel("user");
    expect(provider.opts?.signal?.aborted).toBe(true);
    await expect(run).resolves.toEqual({ kind: "cancelled", reason: "user" });
    expect(runner.busy).toBe(false);
  });

  it("drops results that arrive after the area changed, even from a provider that ignores the signal", async () => {
    const pending = deferred();
    const runner = new SearchRunner({ name: "fake", search: () => pending.promise });
    const run = runner.run(pinheiros, "padaria");
    runner.cancel("area");
    pending.resolve([lead]);
    await expect(run).resolves.toEqual({ kind: "cancelled", reason: "area" });
  });

  it("stops forwarding provider events once cancelled", async () => {
    const provider = hangingUntilAbort();
    const runner = new SearchRunner(provider);
    const events: string[] = [];
    const run = runner.run(pinheiros, "padaria", (event) => events.push(event.kind));
    provider.opts?.onEvent?.({ kind: "requesting" });
    runner.cancel("user");
    provider.opts?.onEvent?.({ kind: "waiting", ms: 1000 });
    provider.opts?.onEvent?.({ kind: "partial" });
    await run;
    expect(events).toEqual(["requesting"]);
  });

  it("reports a provider error in pt-BR", async () => {
    const runner = new SearchRunner({
      name: "fake",
      search: async () => {
        throw new Error("O servidor do OpenStreetMap está ocupado.");
      },
    });
    await expect(runner.run(pinheiros, "padaria")).resolves.toEqual({
      kind: "failed",
      message: "O servidor do OpenStreetMap está ocupado.",
    });
  });

  it("refuses a second search while one runs", async () => {
    const runner = new SearchRunner(hangingUntilAbort());
    const first = runner.run(pinheiros, "padaria");
    await expect(runner.run(pinheiros, "academia")).rejects.toThrow();
    runner.cancel("user");
    await first;
  });

  it("does nothing on cancel when idle", () => {
    const runner = new SearchRunner(hangingUntilAbort());
    expect(() => runner.cancel("area")).not.toThrow();
    expect(runner.busy).toBe(false);
  });
});
