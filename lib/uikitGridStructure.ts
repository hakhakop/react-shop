/**
 * Canonical UIkit Grid structure contract shared by Grid-family consumers.
 * Presentation owners supply their item markup; this adapter owns only the
 * collection-track semantics UIkit exposes (not cards, media, or typography).
 */
export type UikitGridMasonry = "pack" | "next";

export type UikitGridStructure = {
  masonry?: UikitGridMasonry;
  parallax?: number;
  parallaxJustify?: boolean;
  parallaxStart?: string;
  parallaxEnd?: string;
  centerColumns: boolean;
  centerRows: boolean;
  showDividers: boolean;
};

const nonEmptyString = (value: unknown) => {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
};

export function resolveUikitGridStructure(block: Record<string, unknown>): UikitGridStructure {
  const masonryValue = block.gridMasonry ?? block.masonry;
  const masonry = masonryValue === "pack" || masonryValue === "next" ? masonryValue : undefined;
  const rawParallax = block.gridParallax ?? block.parallax;
  const parsedParallax = typeof rawParallax === "number" ? rawParallax : Number(rawParallax);
  const parallax = Number.isFinite(parsedParallax) && parsedParallax !== 0 ? parsedParallax : undefined;

  return {
    masonry,
    parallax,
    parallaxJustify: Boolean(block.gridParallaxJustify ?? block.parallaxJustify),
    parallaxStart: nonEmptyString(block.gridParallaxStart ?? block.parallaxStart),
    parallaxEnd: nonEmptyString(block.gridParallaxEnd ?? block.parallaxEnd),
    // UIkit ignores these flex classes while masonry owns the collection flow.
    centerColumns: !masonry && Boolean(block.centerColumns),
    centerRows: !masonry && Boolean(block.centerRows),
    showDividers: Boolean(block.showDividers),
  };
}

/** Exact UIkit data attribute syntax, so the static DOM and imperative bridge agree. */
export function uikitGridAttribute(structure: UikitGridStructure): string | undefined {
  const options = [
    structure.masonry ? `masonry: ${structure.masonry}` : "",
    structure.parallax !== undefined ? `parallax: ${structure.parallax}` : "",
    structure.parallaxJustify ? "parallax-justify: true" : "",
    structure.parallaxStart ? `parallax-start: ${structure.parallaxStart}` : "",
    structure.parallaxEnd ? `parallax-end: ${structure.parallaxEnd}` : "",
  ].filter(Boolean);
  return options.length ? options.join("; ") : undefined;
}

export function uikitGridStructureClassName(structure: UikitGridStructure): string {
  return [
    "uk-grid",
    // UIkit's masonry/parallax engine measures and offsets a wrapping flex
    // track. The ordinary WebPages Grid may remain CSS Grid, but runtime
    // effects must opt back into UIkit's canonical geometry.
    structure.masonry || structure.parallax !== undefined ? "shop-builder-uikit-grid--runtime" : "",
    // YOOtheme applies UIkit's equal-height match to every non-masonry Grid.
    // The item composition may then decide which inner surface expands.
    !structure.masonry ? "uk-grid-match" : "",
    structure.showDividers ? "uk-grid-divider" : "",
    structure.centerColumns ? "uk-flex-center shop-builder-uikit-grid--column-center" : "",
    structure.centerRows ? "uk-flex-middle" : "",
  ].filter(Boolean).join(" ");
}

/** UIkit gutter tokens, shared where a consumer renders a CSS grid fallback. */
export function uikitGridGapCss(value: unknown): string {
  if (value === "small") return "var(--uk-grid-gutter-small, 15px)";
  if (value === "large") return "var(--uk-grid-gutter-large, 70px)";
  if (value === "collapse" || value === "none") return "0px";
  return "var(--uk-grid-gutter-medium, 40px)";
}
