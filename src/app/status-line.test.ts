import { describe, expect, it } from "vitest";
import { showStatus, type StatusLine } from "./status-line";

function line(): StatusLine {
  const classes = new Set<string>();
  return {
    textContent: "",
    title: "",
    classList: {
      toggle: (name: string, on?: boolean) => {
        if (on ?? !classes.has(name)) classes.add(name);
        else classes.delete(name);
        return classes.has(name);
      },
      contains: (name: string) => classes.has(name),
    },
  };
}

const LONG = "Buscando “loja de material de construção” no OpenStreetMap…";

describe("showStatus", () => {
  it("gives a progress line its full text as a title, since the line may be cut with an ellipsis", () => {
    const el = line();
    showStatus(el, LONG, "progress");
    expect(el.textContent).toBe(LONG);
    expect(el.title).toBe(LONG);
    expect(el.classList.contains("progress")).toBe(true);
  });

  it("drops the title when an error replaces progress, so the old message does not linger on hover", () => {
    const el = line();
    showStatus(el, LONG, "progress");
    showStatus(el, "O servidor do OpenStreetMap está ocupado.", "error");
    expect(el.title).toBe("");
    expect(el.classList.contains("progress")).toBe(false);
    expect(el.classList.contains("error")).toBe(true);
  });

  it("drops the title when the line is cleared or shows an outcome", () => {
    const el = line();
    showStatus(el, LONG, "progress");
    showStatus(el, "");
    expect(el.title).toBe("");
    showStatus(el, LONG, "progress");
    showStatus(el, "Busca cancelada.");
    expect(el.title).toBe("");
    expect(el.classList.contains("progress")).toBe(false);
    expect(el.classList.contains("error")).toBe(false);
  });
});
