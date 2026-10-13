export type StatusLine = Pick<HTMLElement, "textContent" | "title"> & {
  classList: Pick<DOMTokenList, "toggle" | "contains">;
};

// The progress line is clamped to one line with an ellipsis; the title is the only place a sighted user sees the cut end.
// It must be cleared for any other tone, or hovering an error would show the progress message it replaced.
export function showStatus(el: StatusLine, msg: string, tone?: "error" | "progress") {
  el.textContent = msg;
  el.title = tone === "progress" ? msg : "";
  el.classList.toggle("error", tone === "error");
  el.classList.toggle("progress", tone === "progress");
}
