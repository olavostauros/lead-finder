import { areaKm2, widenToMinimum } from "./area";
import { withTimeout, type FetchFn } from "./http";
import { createThrottle, type Throttle } from "./throttle";
import type { BBox } from "./types";

const ENDPOINT = "https://nominatim.openstreetmap.org/search";

// Nominatim's usage policy: at most one request per second from the whole app.
const nominatimThrottle = createThrottle(1000);
const FETCH_TIMEOUT_MS = 10_000;

export interface Place {
  label: string;
  bbox: BBox;
}

interface NominatimResult {
  display_name: string;
  boundingbox: [string, string, string, string];
}

export class NominatimGeocoder {
  private readonly fetchFn: FetchFn;
  private readonly throttle: Throttle;
  private readonly timeoutMs: number;

  constructor(opts: { fetchFn?: FetchFn; throttle?: Throttle; timeoutMs?: number } = {}) {
    this.fetchFn = opts.fetchFn ?? ((url, init) => fetch(url, init));
    this.throttle = opts.throttle ?? nominatimThrottle;
    this.timeoutMs = opts.timeoutMs ?? FETCH_TIMEOUT_MS;
  }

  async search(query: string, signal?: AbortSignal): Promise<Place[]> {
    const q = query.trim();
    if (!q) return [];
    const url = new URL(ENDPOINT);
    url.search = new URLSearchParams({
      q,
      format: "jsonv2",
      countrycodes: "br",
      "accept-language": "pt-BR",
      limit: "5",
    }).toString();

    const results = await this.throttle(() =>
      withTimeout(
        this.timeoutMs,
        signal,
        "O serviço de busca de lugares não respondeu a tempo. Tente de novo.",
        async (s) => {
          const res = await this.fetchFn(url.toString(), { signal: s });
          if (!res.ok) throw new Error(`Falha na busca de lugares (HTTP ${res.status}).`);
          return (await res.json()) as NominatimResult[];
        },
      ),
    );
    const byLabel = new Map<string, Place>();
    for (const r of results) {
      const [south, north, west, east] = r.boundingbox.map(Number);
      const place = { label: r.display_name, bbox: widenToMinimum({ south, north, west, east }) };
      const seen = byLabel.get(place.label);
      if (!seen || areaKm2(place.bbox) > areaKm2(seen.bbox)) byLabel.set(place.label, place);
    }
    return [...byLabel.values()];
  }
}
