import { normalize } from "./text";
import type { Lead } from "./types";

const SAME_PLACE_METERS = 100;

function metersBetween(a: Lead, b: Lead): number {
  const rad = Math.PI / 180;
  const x = (b.lon - a.lon) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.hypot(x, y) * 6_371_000;
}

function richness(l: Lead): number {
  return Number(Boolean(l.phone)) + Number(Boolean(l.address));
}

function same(a: Lead, b: Lead): boolean {
  if (a.id === b.id) return true;
  if (normalize(a.name) !== normalize(b.name)) return false;
  if (a.phone && b.phone && a.phone.replace(/\D/g, "") === b.phone.replace(/\D/g, "")) return true;
  return metersBetween(a, b) < SAME_PLACE_METERS;
}

export function dedupe(leads: Lead[]): Lead[] {
  const out: Lead[] = [];
  for (const lead of leads) {
    const i = out.findIndex((kept) => same(kept, lead));
    if (i === -1) out.push(lead);
    else if (richness(lead) > richness(out[i])) out[i] = lead;
  }
  return out;
}
