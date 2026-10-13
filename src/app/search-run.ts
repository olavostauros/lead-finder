import type { Area, Lead, Provider, SearchEvent } from "./types";

export type CancelReason = "user" | "area";

export type SearchOutcome =
  | { kind: "done"; leads: Lead[]; partial: boolean }
  | { kind: "cancelled"; reason: CancelReason }
  | { kind: "failed"; message: string };

export class SearchRunner {
  private running?: { controller: AbortController; reason?: CancelReason };

  constructor(private readonly provider: Provider) {}

  get busy(): boolean {
    return this.running !== undefined;
  }

  cancel(reason: CancelReason): void {
    const running = this.running;
    if (!running || running.controller.signal.aborted) return;
    running.reason = reason;
    running.controller.abort();
  }

  async run(area: Area, term: string, onEvent?: (event: SearchEvent) => void): Promise<SearchOutcome> {
    // One search at a time: a second one must not jump a back-off the server asked for.
    if (this.running) throw new Error("Já existe uma busca em andamento.");
    const running: { controller: AbortController; reason?: CancelReason } = { controller: new AbortController() };
    this.running = running;
    let partial = false;
    try {
      const leads = await this.provider.search(area, term, {
        signal: running.controller.signal,
        onEvent: (event) => {
          if (event.kind === "partial") partial = true;
          onEvent?.(event);
        },
      });
      // A provider may finish after cancel; its leads belong to an area the user has left.
      if (running.reason) return { kind: "cancelled", reason: running.reason };
      return { kind: "done", leads, partial };
    } catch (err) {
      if (running.reason) return { kind: "cancelled", reason: running.reason };
      return { kind: "failed", message: err instanceof Error ? err.message : "Falha na busca." };
    } finally {
      this.running = undefined;
    }
  }
}
