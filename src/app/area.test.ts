import { describe, expect, it } from "vitest";
import { MAX_AREA_KM2, areaKm2, checkArea, fitUnderCap, formatKm2 } from "./area";

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

describe("fitUnderCap", () => {
  const centre = (b: { south: number; west: number; north: number; east: number }) => [
    (b.south + b.north) / 2,
    (b.west + b.east) / 2,
  ];
  // The default phone view: zoom 13 over São Paulo on a 390 px screen, about 51 km².
  const phoneView = { south: -23.5865, west: -46.6646, north: -23.5145, east: -46.602 };

  it("returns a box under the cap unchanged", () => {
    expect(fitUnderCap(small)).toBe(small);
  });

  it("shrinks a box over the cap to the cap, around the same centre", () => {
    expect(areaKm2(phoneView)).toBeGreaterThan(MAX_AREA_KM2);
    const fitted = fitUnderCap(phoneView);
    expect(checkArea(fitted).ok).toBe(true);
    expect(areaKm2(fitted)).toBeGreaterThan(MAX_AREA_KM2 * 0.999);
    expect(centre(fitted)[0]).toBeCloseTo(centre(phoneView)[0], 9);
    expect(centre(fitted)[1]).toBeCloseTo(centre(phoneView)[1], 9);
  });

  it("keeps the shrunk box inside the original, with the same proportions", () => {
    const wide = { south: -23.6, west: -46.9, north: -23.5, east: -46.4 };
    const fitted = fitUnderCap(wide);
    expect(fitted.south).toBeGreaterThan(wide.south);
    expect(fitted.north).toBeLessThan(wide.north);
    expect(fitted.west).toBeGreaterThan(wide.west);
    expect(fitted.east).toBeLessThan(wide.east);
    expect((fitted.east - fitted.west) / (fitted.north - fitted.south)).toBeCloseTo(5, 9);
  });

  it("fits any box far over the cap", () => {
    const huge = { south: -34, west: -74, north: 5, east: -34 };
    expect(checkArea(fitUnderCap(huge)).ok).toBe(true);
  });

  it("leaves a degenerate box for checkArea to refuse", () => {
    const flat = { south: 1, west: 1, north: 1, east: 2 };
    expect(fitUnderCap(flat)).toBe(flat);
  });
});
