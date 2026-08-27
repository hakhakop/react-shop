export type CanonicalHeaderVariant = "desktop" | "mobile";

/** Resolve canonical/YOOtheme breakpoint vocabulary into one CSS length. */
export function normalizeHeaderMobileBreakpoint(value: string | undefined): string {
  const source = value?.trim().toLowerCase();
  if (source === "s") return "640px";
  if (source === "m") return "960px";
  if (source === "l") return "1200px";
  if (source === "xl") return "1600px";
  return source && /^\d+(?:\.\d+)?(?:px|rem|em)$/.test(source) ? source : "640px";
}

export function headerVariantForViewport(
  viewportWidth: number,
  breakpoint: string | undefined,
  hasMobileComposition: boolean,
): CanonicalHeaderVariant {
  if (!hasMobileComposition) return "desktop";
  const normalized = normalizeHeaderMobileBreakpoint(breakpoint);
  const pixelMatch = normalized.match(/^(\d+(?:\.\d+)?)px$/);
  if (!pixelMatch) return "desktop";
  return viewportWidth <= Number(pixelMatch[1]) ? "mobile" : "desktop";
}
