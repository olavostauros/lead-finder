import { describe, expect, it } from "vitest";
import { dedupe } from "./dedupe";
import type { Lead } from "./types";

const lead = (over: Partial<Lead>): Lead => ({
  id: "osm:node/1",
  name: "Padaria A",
  lat: -23.555,
  lon: -46.655,
  source: "OpenStreetMap",
  sourceUrl: "",
  ...over,
});

describe("dedupe", () => {
  it("drops repeated ids", () => {
    expect(dedupe([lead({}), lead({})])).toHaveLength(1);
  });

  it("merges the same business mapped twice nearby, keeping the richer record", () => {
    const out = dedupe([
      lead({ id: "osm:node/1" }),
      lead({ id: "osm:way/2", name: "padaria  a", lat: -23.5552, phone: "(11) 3123-4567" }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].phone).toBe("(11) 3123-4567");
  });

  it("keeps same-named businesses far apart", () => {
    expect(dedupe([lead({ id: "a" }), lead({ id: "b", lat: -23.6 })])).toHaveLength(2);
  });

  it("merges same name and same phone even when far apart", () => {
    const phone = "(11) 3123-4567";
    expect(dedupe([lead({ id: "a", phone }), lead({ id: "b", lat: -23.6, phone })])).toHaveLength(1);
  });
});
