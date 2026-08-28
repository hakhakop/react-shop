const numericDimension = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  if (typeof value !== "string") return null;
  const match = value.trim().match(/^(\d+(?:\.\d+)?)(?:px)?$/i);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

/** CSS aspect-ratio accepts unitless numbers, never CSS dimensions such as px. */
export function resolveGalleryImageAspectRatio(width: unknown, height: unknown) {
  const numericWidth = numericDimension(width);
  const numericHeight = numericDimension(height);
  return numericWidth && numericHeight
    ? `${numericWidth} / ${numericHeight}`
    : undefined;
}

/** Preserve source dimensions as intrinsic HTML attributes, not forced CSS pixels. */
export function resolveGalleryImageIntrinsicDimensions(width: unknown, height: unknown) {
  const numericWidth = numericDimension(width);
  const numericHeight = numericDimension(height);
  return numericWidth && numericHeight
    ? { width: numericWidth, height: numericHeight }
    : undefined;
}
