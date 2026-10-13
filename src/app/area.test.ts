import { describe, expect, it } from "vitest";
import { MAX_AREA_KM2, areaKm2, checkArea, formatKm2 } from "./area";

const small = { south: -23.56, west: -46.66, north: -23.55, east: -46.65 };

describe("areaKm2", () => {
  it("approximates a small box in São Paulo", () => {
    expect(areaKm2(small)).toBeGreaterThan(1.0);
    expect(areaKm2(small)).toBeLessThan(1.3);
  });

  it("is positive regardless of corner order", () => {
    expect(areaKm2({ south: small.north, west: small.east, north: small.south, east: small.west })).toBeCloseTo(
      areaKm2(small),
    );
  });
});

describe("checkArea", () => {
  it("accepts a box under the cap", () => {
    expect(checkArea(small)).toEqual({ ok: true, km2: areaKm2(small) });
  });

  it("refuses a box over the cap", () => {
    const big = { south: -24, west: -47, north: -23, east: -46 };
    const result = checkArea(big);
    expect(result.ok).toBe(false);
    expect(result.km2).toBeGreaterThan(MAX_AREA_KM2);
  });

  it("refuses a degenerate box", () => {
    expect(checkArea({ south: 1, west: 1, north: 1, east: 2 }).ok).toBe(false);
  });
});

describe("formatKm2", () => {
  it("shows areas from 0,1 km² up in km²", () => {
    expect(formatKm2(MAX_AREA_KM2)).toBe("50 km²");
    expect(formatKm2(1.25)).toBe("1,3 km²");
    expect(formatKm2(0.1)).toBe("0,1 km²");
  });

  it("shows a smaller area in m², never as 0 km²", () => {
    expect(formatKm2(0.0999)).toBe("99.900 m²");
    expect(formatKm2(0.04)).toBe("40.000 m²");
    expect(formatKm2(0.000013)).toBe("13 m²");
  });

  it("does not round a tiny area down to zero", () => {
    expect(formatKm2(0.0000004)).toBe("< 1 m²");
  });
});
