export const HEADER_HEIGHT_PRESETS = {
  compact: "56px",
  comfortable: "72px",
  spacious: "88px",
  showcase: "104px",
} as const;

export type HeaderHeightValue = "auto" | keyof typeof HEADER_HEIGHT_PRESETS | string;

export function normalizeHeaderHeight(value: unknown): string {
  if (typeof value !== "string") return "auto";
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "auto") return "auto";
  if (normalized in HEADER_HEIGHT_PRESETS) return normalized;
  if (/^\d+(?:\.\d+)?$/.test(normalized)) return `${normalized}px`;
  if (/^\d+(?:\.\d+)?(?:px|rem|em|vh|svh|dvh)$/.test(normalized)) {
    return normalized;
  }
  if (/^clamp\([^)]+\)$/.test(normalized)) return normalized;
  return "auto";
}

export function resolveHeaderHeightCss(value: unknown): string | undefined {
  const normalized = normalizeHeaderHeight(value);
  if (normalized === "auto") return undefined;
  return HEADER_HEIGHT_PRESETS[
    normalized as keyof typeof HEADER_HEIGHT_PRESETS
  ] ?? normalized;
}
