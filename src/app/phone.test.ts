import { describe, expect, it } from "vitest";
import { parsePhoneBR } from "./phone";

describe("parsePhoneBR", () => {
  it("formats a mobile and links WhatsApp", () => {
    expect(parsePhoneBR("+55 11 91234-5678")).toEqual({
      display: "(11) 91234-5678",
      whatsapp: "https://wa.me/5511912345678",
    });
  });

  it("formats a landline without a WhatsApp link", () => {
    expect(parsePhoneBR("+55 (21) 3123-4567")).toEqual({ display: "(21) 3123-4567" });
  });

  it("accepts numbers without the country code", () => {
    expect(parsePhoneBR("11912345678")?.display).toBe("(11) 91234-5678");
    expect(parsePhoneBR("(31) 3333-4444")?.display).toBe("(31) 3333-4444");
  });

  it("drops a leading trunk zero", () => {
    expect(parsePhoneBR("011 3123 4567")?.display).toBe("(11) 3123-4567");
  });

  it("keeps toll-free numbers intact", () => {
    expect(parsePhoneBR("0800 123 4567")).toEqual({ display: "0800 123 4567" });
  });

  it("takes the first of several numbers", () => {
    expect(parsePhoneBR("+55 11 3123-4567; +55 11 91234-5678")?.display).toBe("(11) 3123-4567");
  });

  it("does not treat a 10-digit number starting with 9 after the DDD as mobile", () => {
    expect(parsePhoneBR("1191234567")).toEqual({ display: "(11) 9123-4567" });
  });

  it("returns the raw text when the number is not Brazilian-shaped", () => {
    expect(parsePhoneBR("+1 415 555 0100")).toEqual({ display: "+1 415 555 0100" });
  });

  it("returns undefined for empty input", () => {
    expect(parsePhoneBR(undefined)).toBeUndefined();
    expect(parsePhoneBR("  ")).toBeUndefined();
  });
});
