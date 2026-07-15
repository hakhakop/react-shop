export function normalizeBuilderAnchorId(value: string): string {
  let normalized = value
    .normalize("NFKD")
    .trim()
    .toLocaleLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (/^\d/.test(normalized)) normalized = `section-${normalized}`;
  return normalized;
}

export function validateBuilderAnchorId(value: string): string | null {
  if (!value) return null;
  if (normalizeBuilderAnchorId(value) !== value) {
    return "Use letters, numbers, and hyphens only.";
  }
  return null;
}

export function createUniqueBuilderAnchorId(
  value: string,
  existing: Iterable<string>,
): string {
  const base = normalizeBuilderAnchorId(value) || "section";
  const used = new Set(Array.from(existing, normalizeBuilderAnchorId).filter(Boolean));
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}
