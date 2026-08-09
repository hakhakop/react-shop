import type { BuilderLayoutBlock, BuilderSection } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { TypographySettings } from "@/lib/builderTypography";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";

/**
 * The single compatibility boundary for supported YOOtheme semantics.
 *
 * Importers may recognise more source fields, but may only write through this
 * contract when the destination is an existing, visible WebPages owner.
 */
export type YoothemeCapabilityStatus = "mapped-rendered" | "unsupported";
export type YoothemeCapability = {
  owner: string;
  status: YoothemeCapabilityStatus;
  ui: string;
};

export const YOOTHEME_LESS_CAPABILITIES: Record<string, YoothemeCapability> = {
  "global-font-family": { owner: "shellSettings.fontFamilyBody", status: "mapped-rendered", ui: "Global Styles › General › Typography" },
  "global-primary-font-family": { owner: "shellSettings.fontFamilyPrimary", status: "mapped-rendered", ui: "Global Styles › General › Primary" },
  "global-secondary-font-family": { owner: "shellSettings.fontFamilySecondary", status: "mapped-rendered", ui: "Global Styles › General › Secondary" },
  "global-tertiary-font-family": { owner: "shellSettings.fontFamilyTertiary", status: "mapped-rendered", ui: "Global Styles › General › Tertiary" },
  "global-color": { owner: "shellSettings.textColor", status: "mapped-rendered", ui: "Global Styles › General › Colors" },
  "global-muted-color": { owner: "shellSettings.mutedTextColor", status: "mapped-rendered", ui: "Global Styles › General › Colors" },
  "global-emphasis-color": { owner: "shellSettings.emphasisColor", status: "mapped-rendered", ui: "Global Styles › General › Colors" },
  "global-background": { owner: "shellSettings.backgroundDefault", status: "mapped-rendered", ui: "Global Styles › Background" },
  "global-muted-background": { owner: "shellSettings.backgroundMuted", status: "mapped-rendered", ui: "Global Styles › Background" },
  "global-primary-background": { owner: "shellSettings.backgroundPrimary", status: "mapped-rendered", ui: "Global Styles › Background" },
  "global-secondary-background": { owner: "shellSettings.backgroundSecondary", status: "mapped-rendered", ui: "Global Styles › Background" },
  "global-small-margin": { owner: "shellSettings.marginSmall", status: "mapped-rendered", ui: "Global Styles › General › Spacing" },
  "global-margin": { owner: "shellSettings.marginDefault", status: "mapped-rendered", ui: "Global Styles › General › Spacing" },
  "global-medium-margin": { owner: "shellSettings.marginMedium", status: "mapped-rendered", ui: "Global Styles › General › Spacing" },
  "global-large-margin": { owner: "shellSettings.marginLarge", status: "mapped-rendered", ui: "Global Styles › General › Spacing" },
  "global-xlarge-margin": { owner: "shellSettings.marginXLarge", status: "mapped-rendered", ui: "Global Styles › General › Spacing" },
  "global-small-gutter": { owner: "shellSettings.gridGutterSmall", status: "mapped-rendered", ui: "Global Styles › Grid › Gutters" },
  "global-gutter": { owner: "shellSettings.gridGutterDefault", status: "mapped-rendered", ui: "Global Styles › Grid › Gutters" },
  "global-medium-gutter": { owner: "shellSettings.gridGutterMedium", status: "mapped-rendered", ui: "Global Styles › Grid › Gutters" },
  "global-large-gutter": { owner: "shellSettings.gridGutterLarge", status: "mapped-rendered", ui: "Global Styles › Grid › Gutters" },
  "section-padding-vertical": { owner: "shellSettings.sectionPaddingDefault", status: "mapped-rendered", ui: "Global Styles › Section › Padding" },
  "button-primary-background": { owner: "shellSettings.buttonPrimaryBackground", status: "mapped-rendered", ui: "Global Styles › Button" },
  "button-secondary-background": { owner: "shellSettings.buttonSecondaryBackground", status: "mapped-rendered", ui: "Global Styles › Button" },
  "card-default-background": { owner: "shellSettings.cardBackground", status: "mapped-rendered", ui: "Global Styles › Card › Variants" },
  "card-primary-background": { owner: "shellSettings.cardPrimaryBackground", status: "mapped-rendered", ui: "Global Styles › Card › Variants" },
  "card-secondary-background": { owner: "shellSettings.cardSecondaryBackground", status: "mapped-rendered", ui: "Global Styles › Card › Variants" },
  "breakpoint-small": { owner: "unsupported: fixed responsive tier", status: "unsupported", ui: "Global Styles › Breakpoints (read-only compatibility note)" },
  "breakpoint-medium": { owner: "unsupported: fixed responsive tier", status: "unsupported", ui: "Global Styles › Breakpoints (read-only compatibility note)" },
  "breakpoint-large": { owner: "unsupported: fixed responsive tier", status: "unsupported", ui: "Global Styles › Breakpoints (read-only compatibility note)" },
  "breakpoint-xlarge": { owner: "unsupported: fixed responsive tier", status: "unsupported", ui: "Global Styles › Breakpoints (read-only compatibility note)" },
};

/**
 * Resolves a LESS declaration at the compatibility boundary.
 *
 * The importer still keeps its destination table close to the LESS parser so
 * that every YOOtheme declaration is easy to audit there.  This function is
 * deliberately the policy gate: a known destination is a supported canonical
 * Global Style only when it is a `BuilderShellSettings` property consumed by
 * the shared CSS-variable renderer.  Explicit entries above document the
 * cross-format semantic anchors; the fallback covers the remaining existing
 * Global Styles controls without creating a second import model.
 */
export function resolveYoothemeLessCapability(
  variable: string,
  destination?: string,
  domain = "Global Styles",
): YoothemeCapability | undefined {
  const explicit = YOOTHEME_LESS_CAPABILITIES[variable];
  if (explicit) return explicit;
  if (!destination?.startsWith("shellSettings.")) return undefined;
  return {
    owner: destination,
    status: "mapped-rendered",
    ui: `Global Styles › ${domain}`,
  };
}

const string = (value: unknown) => typeof value === "string" && value.trim() ? value.trim() : undefined;
const bool = (value: unknown) => value === true || value === "true" || value === 1 || value === "1";

export function normalizeYoothemeSection(props: Record<string, unknown>): Partial<BuilderSection> {
  const style = string(props.style);
  const role = style === "default" || style === "muted" || style === "primary" || style === "secondary" ? style : undefined;
  const width = string(props.width);
  const contentMode = width === "none" || width === "small" || width === "default" || width === "large" || width === "xlarge" || width === "expand" ? width : width === "full" ? "full" : undefined;
  const height = string(props.height);
  const sectionHeight = height === "viewport" && bool(props.height_offset_top) ? "viewport-percent" : height === "viewport" ? "viewport" : height === "viewport-20" ? "viewport-20" : height === "viewport-percent" ? "viewport-percent" : height === "none" || height === "auto" ? "auto" : undefined;
  const padding = string(props.padding);
  const sectionPadding = padding === "none" || padding === "xsmall" || padding === "small" || padding === "default" || padding === "medium" || padding === "large" || padding === "xlarge" ? padding : padding === "x-small" ? "xsmall" : undefined;
  const vertical = string(props.vertical_align);
  return {
    ...(role ? { backgroundRole: role, sectionVariant: role } : {}),
    ...(contentMode ? { contentMode, maxWidth: contentMode } : {}),
    ...(sectionHeight ? { sectionHeight } : {}),
    ...(string(props.height_offset) ? { heightOffset: string(props.height_offset) } : {}),
    ...(bool(props.height_offset_top) ? { subtractHeightAbove: true } : {}),
    ...(vertical === "middle" || vertical === "center" ? { contentVerticalAlign: "center" } : vertical === "bottom" ? { contentVerticalAlign: "bottom" } : vertical === "top" ? { contentVerticalAlign: "top" } : {}),
    ...(sectionPadding ? { sectionPadding } : {}),
    ...(bool(props.padding_remove_top) ? { removeTopPadding: true } : {}),
    ...(bool(props.padding_remove_bottom) ? { removeBottomPadding: true } : {}),
    ...(bool(props.padding_remove_horizontal) ? { removeHorizontalPadding: true } : {}),
  };
}

export function normalizeYoothemeMedia(props: Record<string, unknown>): Partial<Pick<BuilderLayoutBlock, "imageFit" | "imageRatio" | "imageAlignment" | "imageLoading">> {
  const width = string(props.image_width);
  const height = string(props.image_height);
  const ratio = string(props.image_ratio);
  const fit = string(props.image_fit);
  const position = string(props.image_position);
  return {
    ...(fit === "contain" || fit === "cover" || fit === "fill" ? { imageFit: fit } : {}),
    ...(ratio === "auto" || ratio === "square" || ratio === "4:5" || ratio === "3:4" || ratio === "16:9" ? { imageRatio: ratio } : {}),
    ...(position === "left" || position === "center" || position === "right" ? { imageAlignment: position } : {}),
    ...(props.image_loading === true || props.image_loading === "eager" ? { imageLoading: "eager" } : props.image_loading === false || props.image_loading === "lazy" ? { imageLoading: "lazy" } : {}),
    // Height and width are owned by the image/grid-specific fields. A generic
    // block does not own a second, incompatible image-height representation.
    ...(width || height ? {} : {}),
  };
}

/** Element typography stays an explicit local override; omitted properties inherit. */
export function normalizeYoothemeTypography(props: Record<string, unknown>): { typography?: TypographySettings } {
  const transform = string(props.text_transform);
  const typography: TypographySettings = {
    ...(string(props.font_family) ? { fontFamily: string(props.font_family) } : {}),
    ...(string(props.font_size) ? { fontSize: string(props.font_size) } : {}),
    ...(string(props.font_weight) ? { fontWeight: string(props.font_weight) } : {}),
    ...(string(props.letter_spacing) ? { letterSpacing: string(props.letter_spacing) } : {}),
    ...(string(props.line_height) ? { lineHeight: string(props.line_height) } : {}),
    ...(string(props.color) ? { color: string(props.color) } : {}),
    ...(transform === "none" || transform === "uppercase" || transform === "lowercase" || transform === "capitalize" ? { textTransform: transform } : {}),
  };
  return Object.keys(typography).length ? { typography } : {};
}

const yoothemeSpacingValue = (value: unknown): string | undefined => {
  const token = string(value);
  if (!token || token === "none") return "0";
  const map: Record<string, string> = {
    small: "var(--uk-global-margin-small)", default: "var(--uk-global-margin)",
    medium: "var(--uk-global-margin-medium)", large: "var(--uk-global-margin-large)",
    xlarge: "var(--uk-global-margin-xlarge)",
  };
  return map[token] ?? undefined;
};

/** Shared Grid/Panel presentation ownership: visualStyle.card, never source-only props. */
export function normalizeYoothemeGridPanelPresentation(props: Record<string, unknown>): { visualStyle?: BuilderVisualStyle; gridMetaAlign?: string; gridMetaHtmlElement?: string } {
  const titleAlign = string(props.title_align);
  const metaAlign = string(props.meta_align);
  const metaElement = string(props.meta_element);
  const titleMargin = yoothemeSpacingValue(props.title_margin);
  const linkMargin = yoothemeSpacingValue(props.link_margin);
  const margin = yoothemeSpacingValue(props.margin);
  const card: NonNullable<BuilderVisualStyle["card"]> = {
    ...(titleAlign === "left" || titleAlign === "center" || titleAlign === "right" ? { titleAlign: titleAlign as "left" | "center" | "right" } : {}),
    ...(titleMargin ? { titleMargin } : {}),
    ...(linkMargin ? { buttonMargin: linkMargin } : {}),
  };
  return {
    ...(Object.keys(card).length || margin ? { visualStyle: {
      ...(margin ? { margin: { top: margin, bottom: props.margin_remove_bottom ? "0" : undefined } } : {}),
      ...(Object.keys(card).length ? { card } : {}),
    } } : {}),
    ...(metaAlign === "above-title" || metaAlign === "below-title" || metaAlign === "above-content" || metaAlign === "below-content" ? { gridMetaAlign: metaAlign } : {}),
    ...(metaElement === "div" || metaElement === "span" || metaElement === "p" ? { gridMetaHtmlElement: metaElement } : {}),
  };
}

export function normalizeYoothemeTemplateGlobals(root: Record<string, unknown>): Partial<BuilderShellSettings> {
  const candidates = [root.props, root.global, root.settings, root.global_styles].filter((value): value is Record<string, unknown> => !!value && typeof value === "object");
  const read = (...keys: string[]) => {
    for (const candidate of candidates) for (const key of keys) {
      const value = string(candidate[key]);
      if (value) return value;
    }
    return undefined;
  };
  const patch: Partial<BuilderShellSettings> = {};
  const fields: Array<[keyof BuilderShellSettings, string[]]> = [
    ["backgroundDefault", ["global_background", "global-background", "background"]], ["backgroundMuted", ["global_muted_background", "global-muted-background", "muted_background"]], ["backgroundPrimary", ["global_primary_background", "global-primary-background", "primary_background"]], ["backgroundSecondary", ["global_secondary_background", "global-secondary-background", "secondary_background"]],
    ["textColor", ["global_color", "global-color"]], ["mutedTextColor", ["global_muted_color", "global-muted-color"]], ["emphasisColor", ["global_emphasis_color", "global-emphasis-color"]], ["fontFamilyBody", ["global_font_family", "global-font-family"]], ["fontFamilyPrimary", ["global_primary_font_family", "global-primary-font-family"]], ["fontFamilySecondary", ["global_secondary_font_family", "global-secondary-font-family"]], ["fontFamilyTertiary", ["global_tertiary_font_family", "global-tertiary-font-family"]],
  ];
  fields.forEach(([owner, keys]) => { const value = read(...keys); if (value) (patch as Record<string, string>)[owner] = value; });
  return patch;
}
