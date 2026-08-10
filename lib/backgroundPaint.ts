/**
 * Canonical Global Styles background paint contract.
 *
 * A background role may be a CSS color or a CSS gradient. It intentionally
 * excludes image URLs and arbitrary declaration fragments: those belong to
 * element-level media/advanced styling, not a reusable semantic surface token.
 */
const SAFE_PAINT_FUNCTIONS = /^(?:linear-gradient|radial-gradient|repeating-linear-gradient|repeating-radial-gradient|var|rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color|color-mix)\(/i;
const SAFE_PAINT_KEYWORDS = new Set([
  "transparent",
  "currentcolor",
  "inherit",
  "initial",
  "unset",
  "revert",
  "revert-layer",
]);

function balancedParentheses(value: string) {
  let depth = 0;
  for (const character of value) {
    if (character === "(") depth += 1;
    if (character === ")") depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

/** Validates the safe subset supported by semantic Global Style backgrounds. */
export function isValidBackgroundPaint(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const paint = value.trim();
  if (!paint || /[;{}<>]/.test(paint) || /\b(?:url|image-set|expression)\s*\(/i.test(paint)) return false;
  if (SAFE_PAINT_KEYWORDS.has(paint.toLowerCase())) return true;
  if (/^#[0-9a-f]{3,8}$/i.test(paint)) return true;
  if (/^[a-z]+$/i.test(paint)) return true;
  return SAFE_PAINT_FUNCTIONS.test(paint) && balancedParentheses(paint);
}

export function isGradientBackgroundPaint(value: unknown) {
  return typeof value === "string" && /^(?:repeating-)?(?:linear|radial)-gradient\(/i.test(value.trim());
}

/** Returns a stored semantic paint unchanged only when it is safe to emit. */
export function resolveBackgroundPaint(value: unknown, fallback: string) {
  return isValidBackgroundPaint(value) ? value.trim() : fallback;
}
