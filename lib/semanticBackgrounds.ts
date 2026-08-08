export const SEMANTIC_BACKGROUND_ROLES = ["default", "muted", "primary", "secondary"] as const;

export type SemanticBackgroundRole = (typeof SEMANTIC_BACKGROUND_ROLES)[number];

type SectionBackgroundInput = {
  backgroundRole?: unknown;
  sectionVariant?: unknown;
  backgroundOverride?: unknown;
  background?: unknown;
};

function semanticRole(value: unknown): SemanticBackgroundRole | undefined {
  return typeof value === "string" && (SEMANTIC_BACKGROUND_ROLES as readonly string[]).includes(value.toLowerCase())
    ? value.toLowerCase() as SemanticBackgroundRole
    : undefined;
}

function legacyOverride(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const color = value.trim();
  if (!color || ["transparent", "initial", "inherit", "#fff", "#ffffff"].includes(color.toLowerCase())) return undefined;
  return color;
}

/** Global semantic ownership; legacy `background` is migration fallback only. */
export function resolveSectionBackground(section: SectionBackgroundInput): { role: SemanticBackgroundRole; override?: string } {
  const role = semanticRole(section.backgroundRole) ?? semanticRole(section.sectionVariant) ?? "default";
  return { role, override: legacyOverride(section.backgroundOverride) ?? legacyOverride(section.background) };
}

export function sectionBackgroundClass(role: SemanticBackgroundRole): string {
  return `uk-section-${role}`;
}
