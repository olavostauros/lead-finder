import { describe, expect, it, vi } from "vitest";
import { OverpassProvider, buildQuery, elementToLead } from "./overpass";

const bbox = { south: -23.56, west: -46.66, north: -23.55, east: -46.65 };

describe("buildQuery", () => {
  it("uses the category tags, the bbox, a timeout and a result cap", () => {
    const q = buildQuery(bbox, "padaria");
    expect(q).toContain("[out:json][timeout:25]");
    expect(q).toContain('nwr["shop"="bakery"](-23.56,-46.66,-23.55,-46.65);');
    expect(q).toMatch(/out center tags \d+;/);
  });

  it("searches names for free text, escaping regex and quotes", () => {
    const q = buildQuery(bbox, 'Zé "Pão" (1+1)');
    expect(q).toContain('nwr["name"~"Zé \\"Pão\\" \\\\(1\\\\+1\\\\)",i]');
  });

  it("refuses an empty term", () => {
    expect(() => buildQuery(bbox, "  ")).toThrow();
  });
});

describe("elementToLead", () => {
  it("maps a node with phone and address", () => {
    const lead = elementToLead({
      type: "node",
      id: 42,
      lat: -23.555,
      lon: -46.655,
      tags: {
        name: "Padaria Real",
        phone: "+55 11 91234-5678",
        "addr:street": "Rua Augusta",
        "addr:housenumber": "100",
        "addr:suburb": "Consolação",
        "addr:city": "São Paulo",
      },
    });
    expect(lead).toEqual({
      id: "osm:node/42",
      name: "Padaria Real",
      phone: "(11) 91234-5678",
      whatsapp: "https://wa.me/5511912345678",
      address: "Rua Augusta, 100 - Consolação, São Paulo",
      lat: -23.555,
      lon: -46.655,
      source: "OpenStreetMap",
      sourceUrl: "https://www.openstreetmap.org/node/42",
    });
  });

  it("uses the center of a way and contact:phone", () => {
    const lead = elementToLead({
      type: "way",
      id: 7,
      center: { lat: -23.551, lon: -46.651 },
      tags: { name: "Academia X", "contact:phone": "(11) 3123-4567" },
    });
    expect(lead?.lat).toBe(-23.551);
    expect(lead?.phone).toBe("(11) 3123-4567");
    expect(lead?.whatsapp).toBeUndefined();
    expect(lead?.address).toBeUndefined();
  });

  it("skips unnamed or unlocated elements", () => {
    expect(elementToLead({ type: "node", id: 1, lat: 0, lon: 0, tags: { shop: "bakery" } })).toBeUndefined();
    expect(elementToLead({ type: "way", id: 2, tags: { name: "Sem centro" } })).toBeUndefined();
  });
});

describe("OverpassProvider", () => {
  const area = { bbox };
  const body = {
    elements: [
      { type: "node", id: 1, lat: -23.555, lon: -46.655, tags: { name: "Padaria A", phone: "11 3123-4567" } },
      { type: "way", id: 2, center: { lat: -23.5551, lon: -46.6551 }, tags: { name: "Padaria A", phone: "+55 11 3123 4567" } },
      { type: "node", id: 3, lat: -23.552, lon: -46.652, tags: { name: "Padaria B" } },
    ],
  };
  const ok = () => new Response(JSON.stringify(body), { status: 200 });

  it("posts the query and returns deduplicated leads", async () => {
    const fetchFn = vi.fn(async () => ok());
    const provider = new OverpassProvider({ fetchFn, sleep: async () => {} });
    const leads = await provider.search(area, "padaria");
    expect(leads.map((l) => l.name)).toEqual(["Padaria A", "Padaria B"]);
    const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toMatch(/^https:\/\/overpass-api\.de\/api\/interpreter$/);
    expect(init.method).toBe("POST");
    expect(String(init.body)).toContain("data=");
  });

  it("refuses an area over the cap without calling the API", async () => {
    const fetchFn = vi.fn(async () => ok());
    const provider = new OverpassProvider({ fetchFn, sleep: async () => {} });
    await expect(provider.search({ bbox: { south: -24, west: -47, north: -23, east: -46 } }, "padaria")).rejects.toThrow(
      /grande/,
    );
    expect(fetchFn).not.toHaveBeenCalled();
  });

  it("backs off on 429, honouring Retry-After, then succeeds", async () => {
    const sleeps: number[] = [];
    const fetchFn = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 429, headers: { "Retry-After": "3" } }))
      .mockResolvedValueOnce(new Response("", { status: 429 }))
      .mockResolvedValueOnce(ok());
    const provider = new OverpassProvider({ fetchFn, sleep: async (ms) => void sleeps.push(ms) });
    const leads = await provider.search(area, "padaria");
    expect(leads).toHaveLength(2);
    expect(sleeps).toEqual([3000, 4000]);
  });

  it("gives up after repeated 429s with a pt-BR message", async () => {
    const fetchFn = vi.fn(async () => new Response("", { status: 429 }));
    const provider = new OverpassProvider({ fetchFn, sleep: async () => {} });
    await expect(provider.search(area, "padaria")).rejects.toThrow(/ocupado/);
    expect(fetchFn).toHaveBeenCalledTimes(4);
  });

  it("does not retry other errors", async () => {
    const fetchFn = vi.fn(async () => new Response("bad query", { status: 400 }));
    const provider = new OverpassProvider({ fetchFn, sleep: async () => {} });
    await expect(provider.search(area, "padaria")).rejects.toThrow(/400/);
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });
});
