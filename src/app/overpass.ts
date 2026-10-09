import { checkArea, formatKm2, MAX_AREA_KM2 } from "./area";
import { findCategory } from "./categories";
import { dedupe } from "./dedupe";
import type { FetchFn } from "./http";
import { parsePhoneBR } from "./phone";
import { sleep as realSleep } from "./throttle";
import type { Area, BBox, Lead, Provider } from "./types";

const ENDPOINT = "https://overpass-api.de/api/interpreter";
const QUERY_TIMEOUT_S = 25;
const MAX_RESULTS = 300;
const MAX_RETRIES = 3;
const MAX_BACKOFF_MS = 30_000;
const MAX_TERM_LENGTH = 80;

export interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function quote(s: string): string {
  return `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildQuery(b: BBox, term: string): string {
  const clean = term.replace(/[\u0000-\u001f]/g, " ").trim().slice(0, MAX_TERM_LENGTH);
  if (!clean) throw new Error("Informe o que procurar.");
  const box = `(${b.south},${b.west},${b.north},${b.east})`;
  const category = findCategory(clean);
  const filters = category
    ? category.tags.map(([k, v]) => `nwr[${quote(k)}=${quote(v)}]${box};`)
    : [`nwr["name"~${quote(escapeRegex(clean))},i]${box};`];
  return `[out:json][timeout:${QUERY_TIMEOUT_S}];\n(\n${filters.join("\n")}\n);\nout center tags ${MAX_RESULTS};`;
}

export function elementToLead(el: OverpassElement): Lead | undefined {
  const tags = el.tags ?? {};
  const name = tags.name?.trim();
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!name || lat === undefined || lon === undefined) return undefined;

  const phone = parsePhoneBR(tags.phone ?? tags["contact:phone"] ?? tags["contact:mobile"]);
  const street = [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(", ");
  const locality = [tags["addr:suburb"], tags["addr:city"]].filter(Boolean).join(", ");
  const address = [street, locality].filter(Boolean).join(" - ");

  return {
    id: `osm:${el.type}/${el.id}`,
    name,
    phone: phone?.display,
    whatsapp: phone?.whatsapp,
    address: address || undefined,
    lat,
    lon,
    source: "OpenStreetMap",
    sourceUrl: `https://www.openstreetmap.org/${el.type}/${el.id}`,
  };
}

function retryDelay(res: Response, attempt: number): number {
  const header = Number(res.headers.get("Retry-After"));
  const ms = header > 0 ? header * 1000 : 2000 * 2 ** attempt;
  return Math.min(ms, MAX_BACKOFF_MS);
}

export class OverpassProvider implements Provider {
  readonly name = "OpenStreetMap";
  private readonly fetchFn: FetchFn;
  private readonly sleep: (ms: number) => Promise<void>;

  constructor(opts: { fetchFn?: FetchFn; sleep?: (ms: number) => Promise<void> } = {}) {
    this.fetchFn = opts.fetchFn ?? ((url, init) => fetch(url, init));
    this.sleep = opts.sleep ?? realSleep;
  }

  async search(area: Area, query: string, signal?: AbortSignal): Promise<Lead[]> {
    const check = checkArea(area.bbox);
    if (!check.ok) {
      throw new Error(
        `Área grande demais (${formatKm2(check.km2)}). O limite é ${formatKm2(MAX_AREA_KM2)}; escolha uma área menor.`,
      );
    }
    const body = `data=${encodeURIComponent(buildQuery(area.bbox, query))}`;

    for (let attempt = 0; ; attempt++) {
      const res = await this.fetchFn(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal,
      });
      if (res.ok) {
        const json = (await res.json()) as { elements?: OverpassElement[]; remark?: string };
        if (json.remark?.includes("runtime error") && !json.elements?.length) {
          throw new Error("A consulta demorou demais. Tente uma área menor.");
        }
        return dedupe((json.elements ?? []).map(elementToLead).filter((l): l is Lead => l !== undefined));
      }
      if (res.status !== 429 && res.status !== 504) {
        throw new Error(`Erro na consulta ao OpenStreetMap (HTTP ${res.status}).`);
      }
      if (attempt >= MAX_RETRIES) {
        throw new Error("O servidor do OpenStreetMap está ocupado. Tente de novo em alguns minutos.");
      }
      await this.sleep(retryDelay(res, attempt));
      signal?.throwIfAborted();
    }
  }
}
