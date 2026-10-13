export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface Area {
  bbox: BBox;
  label?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  lat: number;
  lon: number;
  source: string;
  sourceUrl: string;
}

export type SearchEvent =
  | { kind: "requesting" }
  | { kind: "waiting"; ms: number }
  | { kind: "partial" };

export interface SearchOptions {
  signal?: AbortSignal;
  onEvent?: (event: SearchEvent) => void;
}

export interface Provider {
  readonly name: string;
  search(area: Area, query: string, opts?: SearchOptions): Promise<Lead[]>;
}
