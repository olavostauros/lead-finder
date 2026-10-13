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

export interface Provider {
  readonly name: string;
  search(area: Area, query: string, signal?: AbortSignal): Promise<Lead[]>;
}
