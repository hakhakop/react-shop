/** Canonical Section semantic value normalization shared by import, UI, and renderers. */
export type SectionTitlePosition = "none" | "left-top" | "right-top" | "left-center" | "right-center";

export function normalizeSectionTitlePosition(value: unknown): SectionTitlePosition {
  const raw = String(value ?? "none").trim().toLowerCase();
  if (raw === "top-left") return "left-top";
  if (raw === "top-right") return "right-top";
  if (raw === "center-left") return "left-center";
  if (raw === "center-right") return "right-center";
  return raw === "left-top" || raw === "right-top" || raw === "left-center" || raw === "right-center" ? raw : "none";
}

export function normalizeSectionTitleBreakpoint(value: unknown): "xlarge" | "large" | "medium" | "small" {
  const raw = String(value ?? "xlarge").trim().toLowerCase();
  return raw === "small" || raw === "medium" || raw === "large" ? raw : "xlarge";
}
