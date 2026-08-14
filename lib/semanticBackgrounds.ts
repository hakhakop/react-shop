export const SEMANTIC_BACKGROUND_ROLES = ["default", "muted", "primary", "secondary"] as const;

export type SemanticBackgroundRole = (typeof SEMANTIC_BACKGROUND_ROLES)[number];

type SectionBackgroundInput = {
  backgroundRole?: unknown;
  sectionVariant?: unknown;
  backgroundOverride?: unknown;
  background?: unknown;
  visualStyle?: { background?: { imageUrl?: unknown; imageSize?: unknown; imagePosition?: unknown; imageRepeat?: unknown } };
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

/** Shared UIkit variable projection for a Section-owned background image. */
export function sectionBackgroundImageVariables(section: SectionBackgroundInput): Record<string, string> {
  const imageUrl = section.visualStyle?.background?.imageUrl;
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return {};
  const { role } = resolveSectionBackground(section);
  const background = section.visualStyle?.background;
  const position = typeof background?.imagePosition === "string" ? background.imagePosition.replace(/-/g, " ") : undefined;
  return {
    [`--uikit-section-${role}-bg-image`]: `url("${imageUrl}")`,
    ...(typeof background?.imageSize === "string" ? { "--builder-section-background-size": background.imageSize } : {}),
    ...(position ? { "--builder-section-background-position": position } : {}),
    ...(typeof background?.imageRepeat === "string" ? { "--builder-section-background-repeat": background.imageRepeat } : {}),
  };
}
