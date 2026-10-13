import { describe, expect, it, vi } from "vitest";
import { MAX_AREA_KM2, areaKm2 } from "./area";
import { NominatimGeocoder } from "./nominatim";

const result = {
  display_name: "Pinheiros, São Paulo, Brasil",
  boundingbox: ["-23.58", "-23.55", "-46.71", "-46.67"],
};

describe("NominatimGeocoder", () => {
  it("queries Brazil in pt-BR and maps the bounding box", async () => {
    const fetchFn = vi.fn(async () => new Response(JSON.stringify([result])));
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: (f) => f() });
    const places = await geocoder.search("Pinheiros");
    const url = new URL((fetchFn.mock.calls[0] as unknown as [string])[0]);
    expect(url.origin + url.pathname).toBe("https://nominatim.openstreetmap.org/search");
    expect(url.searchParams.get("q")).toBe("Pinheiros");
    expect(url.searchParams.get("countrycodes")).toBe("br");
    expect(url.searchParams.get("accept-language")).toBe("pt-BR");
    expect(places).toEqual([
      { label: "Pinheiros, São Paulo, Brasil", bbox: { south: -23.58, north: -23.55, west: -46.71, east: -46.67 } },
    ]);
  });

  it("widens a point-like place to a searchable box around it", async () => {
    const point = { display_name: "Estação Pinheiros", boundingbox: ["-23.5671", "-23.5670", "-46.7021", "-46.7020"] };
    const fetchFn = vi.fn(async () => new Response(JSON.stringify([point])));
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: (f) => f() });
    const [place] = await geocoder.search("Estação Pinheiros");
    expect(areaKm2(place.bbox)).toBeGreaterThan(3);
    expect(areaKm2(place.bbox)).toBeLessThan(MAX_AREA_KM2);
    expect((place.bbox.south + place.bbox.north) / 2).toBeCloseTo(-23.56705, 4);
  });

  it("collapses results with the same label, keeping the larger area", async () => {
    const station = { display_name: "Pinheiros, São Paulo", boundingbox: ["-23.5671", "-23.5670", "-46.7021", "-46.7020"] };
    const district = { display_name: "Pinheiros, São Paulo", boundingbox: ["-23.58", "-23.55", "-46.71", "-46.67"] };
    const fetchFn = vi.fn(async () => new Response(JSON.stringify([station, district])));
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: (f) => f() });
    const places = await geocoder.search("Pinheiros");
    expect(places).toHaveLength(1);
    expect(places[0].bbox.south).toBe(-23.58);
  });

  it("goes through the throttle", async () => {
    const throttle = vi.fn((f: () => Promise<unknown>) => f());
    const fetchFn = vi.fn(async () => new Response("[]"));
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: throttle as never });
    await geocoder.search("Centro");
    expect(throttle).toHaveBeenCalledTimes(1);
  });

  it("does not call the API for an empty query", async () => {
    const fetchFn = vi.fn();
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: (f) => f() });
    expect(await geocoder.search("  ")).toEqual([]);
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("reports an HTTP error in pt-BR", async () => {
    const fetchFn = vi.fn(async () => new Response("", { status: 503 }));
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: (f) => f() });
    await expect(geocoder.search("Centro")).rejects.toThrow(/busca de lugares/);
  });

  it("gives up on a stalled connection with a pt-BR message", async () => {
    const fetchFn = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason))),
    );
    const geocoder = new NominatimGeocoder({ fetchFn, throttle: (f) => f(), timeoutMs: 10 });
    await expect(geocoder.search("Pinheiros")).rejects.toThrow(/não respondeu/);
  });
});
