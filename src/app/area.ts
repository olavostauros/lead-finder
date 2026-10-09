import type { BBox } from "./types";

export const MAX_AREA_KM2 = 50;

const KM_PER_DEGREE = 111.32;

export function areaKm2(b: BBox): number {
  const midLat = ((b.south + b.north) / 2) * (Math.PI / 180);
  const height = Math.abs(b.north - b.south) * KM_PER_DEGREE;
  const width = Math.abs(b.east - b.west) * KM_PER_DEGREE * Math.cos(midLat);
  return height * width;
}

export function checkArea(b: BBox): { ok: boolean; km2: number } {
  const km2 = areaKm2(b);
  return { ok: km2 > 0 && km2 <= MAX_AREA_KM2, km2 };
}

export function formatKm2(km2: number): string {
  return `${km2.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km²`;
}

export function widenToMinimum(b: BBox, minSideKm = 2): BBox {
  const out = { ...b };
  const minLat = minSideKm / KM_PER_DEGREE;
  if (Math.abs(b.north - b.south) < minLat) {
    const mid = (b.south + b.north) / 2;
    out.south = mid - minLat / 2;
    out.north = mid + minLat / 2;
  }
  const midLat = (out.south + out.north) / 2;
  const minLon = minSideKm / (KM_PER_DEGREE * Math.cos(midLat * (Math.PI / 180)));
  if (Math.abs(b.east - b.west) < minLon) {
    const mid = (b.west + b.east) / 2;
    out.west = mid - minLon / 2;
    out.east = mid + minLon / 2;
  }
  return out;
}
