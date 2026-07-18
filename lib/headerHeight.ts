export const HEADER_HEIGHT_PRESETS = {
  compact: "56px",
  comfortable: "72px",
  spacious: "88px",
  showcase: "104px",
} as const;

export const HEADER_CUSTOM_HEIGHT_MIN = 40;
export const HEADER_CUSTOM_HEIGHT_MAX = 300;
export const HEADER_CUSTOM_HEIGHT_DEFAULT = 72;

export type HeaderHeightValue = "auto" | keyof typeof HEADER_HEIGHT_PRESETS | string;

export function normalizeHeaderHeight(value: unknown): string {
  if (typeof value !== "string") return "auto";
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized === "auto") return "auto";
  if (normalized === "custom") return "custom";
  if (normalized in HEADER_HEIGHT_PRESETS) return normalized;
  if (/^\d+(?:\.\d+)?$/.test(normalized)) return `${normalized}px`;
  if (/^\d+(?:\.\d+)?(?:px|rem|em|vh|svh|dvh)$/.test(normalized)) {
    return normalized;
  }
  if (/^clamp\([^)]+\)$/.test(normalized)) return normalized;
  return "auto";
}

export function normalizeHeaderCustomHeight(value: unknown): number | undefined {
  const numericValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;
  if (!Number.isFinite(numericValue)) return undefined;
  return Math.min(
    HEADER_CUSTOM_HEIGHT_MAX,
    Math.max(HEADER_CUSTOM_HEIGHT_MIN, Math.round(numericValue)),
  );
}

export function getInitialHeaderCustomHeight(value: unknown): number {
  const resolved = resolveHeaderHeightCss(value);
  const pixelValue = resolved?.match(/^(\d+(?:\.\d+)?)px$/)?.[1];
  return (
    normalizeHeaderCustomHeight(pixelValue) ?? HEADER_CUSTOM_HEIGHT_DEFAULT
  );
}

export function resolveHeaderHeightCss(
  value: unknown,
  customHeight?: unknown,
): string | undefined {
  const normalized = normalizeHeaderHeight(value);
  if (normalized === "auto") return undefined;
  if (normalized === "custom") {
    return `${normalizeHeaderCustomHeight(customHeight) ?? HEADER_CUSTOM_HEIGHT_DEFAULT}px`;
  }
  return HEADER_HEIGHT_PRESETS[
    normalized as keyof typeof HEADER_HEIGHT_PRESETS
  ] ?? normalized;
}
