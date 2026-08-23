import type { BuilderLayoutBlock, BuilderSection } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { TypographySettings } from "@/lib/builderTypography";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { normalizeSectionTitlePosition } from "@/lib/sectionSemantics";

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
  "alert-background": { owner: "shellSettings.alertBackground", status: "mapped-rendered", ui: "Global Styles › Alert › Default surface" },
  "alert-color": { owner: "shellSettings.alertColor", status: "mapped-rendered", ui: "Global Styles › Alert › Default surface" },
  "alert-border-radius": { owner: "shellSettings.alertBorderRadius", status: "mapped-rendered", ui: "Global Styles › Alert › Default surface" },
  "alert-primary-background": { owner: "shellSettings.alertPrimaryBackground", status: "mapped-rendered", ui: "Global Styles › Alert › Primary" },
  "alert-primary-color": { owner: "shellSettings.alertPrimaryColor", status: "mapped-rendered", ui: "Global Styles › Alert › Primary" },
  "alert-success-background": { owner: "shellSettings.alertSuccessBackground", status: "mapped-rendered", ui: "Global Styles › Alert › Success" },
  "alert-success-color": { owner: "shellSettings.alertSuccessColor", status: "mapped-rendered", ui: "Global Styles › Alert › Success" },
  "alert-warning-background": { owner: "shellSettings.alertWarningBackground", status: "mapped-rendered", ui: "Global Styles › Alert › Warning" },
  "alert-warning-color": { owner: "shellSettings.alertWarningColor", status: "mapped-rendered", ui: "Global Styles › Alert › Warning" },
  "alert-danger-background": { owner: "shellSettings.alertDangerBackground", status: "mapped-rendered", ui: "Global Styles › Alert › Danger" },
  "alert-danger-color": { owner: "shellSettings.alertDangerColor", status: "mapped-rendered", ui: "Global Styles › Alert › Danger" },
  "internal-card-primary-gradient": { owner: "shellSettings.cardPrimaryBackground", status: "mapped-rendered", ui: "Global Styles › Card › Primary › Background" },
  "internal-card-secondary-gradient": { owner: "shellSettings.cardSecondaryBackground", status: "mapped-rendered", ui: "Global Styles › Card › Secondary › Background" },
  "breakpoint-small": { owner: "shellSettings.breakpointSmall", status: "mapped-rendered", ui: "Global Styles › Global › Breakpoints › Small" },
  "breakpoint-medium": { owner: "shellSettings.breakpointMedium", status: "mapped-rendered", ui: "Global Styles › Global › Breakpoints › Medium" },
  "breakpoint-large": { owner: "shellSettings.breakpointLarge", status: "mapped-rendered", ui: "Global Styles › Global › Breakpoints › Large" },
  "breakpoint-xlarge": { owner: "shellSettings.breakpointXLarge", status: "mapped-rendered", ui: "Global Styles › Global › Breakpoints › X-Large" },
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
  const width = typeof props.width === "string" ? props.width.trim() : undefined;
  const isUnboxedWidth = width === "none" || width === "expand" || width === "full" || width === "";
  const contentMode = isUnboxedWidth
    ? "expand"
    : width === "xsmall" || width === "small" || width === "default" || width === "large" || width === "xlarge"
    ? width
    : undefined;
  const maxWidth = isUnboxedWidth
    ? "expand"
    : width === "xsmall" || width === "small" || width === "default" || width === "large" || width === "xlarge"
    ? width
    : undefined;
  const height = string(props.height);
  const sectionHeight = height === "viewport" && bool(props.height_offset_top) ? "viewport-percent" : height === "viewport" ? "viewport" : height === "viewport-20" ? "viewport-20" : height === "viewport-percent" ? "viewport-percent" : height === "none" || height === "auto" ? "auto" : undefined;
  const padding = string(props.padding);
  const sectionPadding = padding === "none" || padding === "xsmall" || padding === "small" || padding === "default" || padding === "medium" || padding === "large" || padding === "xlarge" ? padding : padding === "x-small" ? "xsmall" : undefined;
  const vertical = string(props.vertical_align);
  const titlePosition = string(props.title_position);
  const titleRotation = string(props.title_rotation);
  const titleBreakpoint = string(props.title_breakpoint);
  const sticky = string(props.sticky ?? props.sticky_effect);
  const htmlElement = string(props.html_element);
  const textColor = string(props.text_color);
  const headerTextColor = string(props.header_text_color);
  const imageUrl = string(props.image);
  const imagePosition = string(props.image_position);
  const imageSize = string(props.image_size);
  const imageRepeat = string(props.image_repeat);
  const sectionBackground: NonNullable<BuilderVisualStyle["background"]> | undefined = imageUrl || imagePosition || imageSize || imageRepeat
    ? {
        type: "image" as const,
        ...(imageUrl ? { imageUrl } : {}),
        ...(imagePosition ? { imagePosition } : {}),
        ...(imageSize === "auto" || imageSize === "cover" || imageSize === "contain" ? { imageSize } : {}),
        ...(imageRepeat === "no-repeat" || imageRepeat === "repeat" || imageRepeat === "repeat-x" || imageRepeat === "repeat-y" ? { imageRepeat } : {}),
      }
    : undefined;
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
    ...(bool(props.preserve_color) ? { preserveColor: true } : {}),
    ...(bool(props.overlap) ? { overlap: true } : {}),
    ...(string(props.margin) ? { margin: string(props.margin) as any } : {}),
    ...(bool(props.margin_remove_top) ? { removeTopMargin: true } : {}),
    ...(bool(props.margin_remove_bottom) ? { removeBottomMargin: true } : {}),
    ...(titlePosition ? { sectionTitlePosition: normalizeSectionTitlePosition(titlePosition) } : {}),
    ...(titleRotation === "none" || titleRotation === "left" || titleRotation === "right" ? { sectionTitleRotation: titleRotation } : {}),
    ...(titleBreakpoint ? { sectionTitleBreakpoint: titleBreakpoint } : {}),
    ...(sticky === "none" || sticky === "cover" || sticky === "reveal" ? { stickyEffect: sticky } : {}),
    ...(bool(props.header_transparent) ? { headerTransparent: true } : {}),
    ...(bool(props.pull_under_header) ? { pullUnderHeader: true } : {}),
    ...(headerTextColor === "none" || headerTextColor === "light" || headerTextColor === "dark" ? { headerTextColor } : {}),
    ...(textColor === "none" || textColor === "light" || textColor === "dark" ? { textColor } : {}),
    ...(htmlElement === "div" || htmlElement === "section" || htmlElement === "header" || htmlElement === "footer" || htmlElement === "aside" || htmlElement === "main" ? { htmlElement } : {}),
    ...(sectionBackground ? { visualStyle: { background: sectionBackground } } : {}),
  };
}

export function normalizeYoothemeMedia(props: Record<string, unknown>): Partial<Pick<BuilderLayoutBlock, "imageFit" | "imageRatio" | "imageAlignment" | "imagePosition" | "imageLoading" | "imageWidth" | "imageHeight" | "imageSvgInline" | "imageSvgColor">> {
  const cssDimension = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return `${value}px`;
    const normalized = string(value);
    if (!normalized || normalized === "auto") return normalized;
    return /^\d+(?:\.\d+)?$/.test(normalized) ? `${normalized}px` : normalized;
  };
  const width = cssDimension(props.image_width);
  const height = cssDimension(props.image_height);
  const ratio = string(props.image_ratio);
  const fit = string(props.image_fit);
  const position = string(props.image_position);
  const alignment = string(props.image_align);
  return {
    ...(width ? { imageWidth: width } : {}),
    ...(height ? { imageHeight: height } : {}),
    ...(fit === "contain" || fit === "cover" || fit === "fill" ? { imageFit: fit } : {}),
    ...(ratio === "auto" || ratio === "square" || ratio === "4:5" || ratio === "3:4" || ratio === "16:9" ? { imageRatio: ratio } : {}),
    ...(alignment === "left" || alignment === "center" || alignment === "right" ? { imageAlignment: alignment } : {}),
    ...(position === "top-left" || position === "top-center" || position === "top-right" || position === "center-left" || position === "center" || position === "center-right" || position === "bottom-left" || position === "bottom-center" || position === "bottom-right" ? { imagePosition: position } : {}),
    ...(props.image_svg_inline === true || props.image_svg_inline === "true" || props.image_svg_inline === "1" ? { imageSvgInline: true } : {}),
    ...(string(props.image_svg_color) ? { imageSvgColor: string(props.image_svg_color) } : {}),
    ...(props.image_loading === true || props.image_loading === "eager" ? { imageLoading: "eager" } : props.image_loading === false || props.image_loading === "lazy" ? { imageLoading: "lazy" } : {}),
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

/** YOOtheme Heading uses semantic font-family roles, not literal font names. */
export function normalizeYoothemeTypographyRole(
  value: unknown,
): "default" | "primary" | "secondary" | "tertiary" | undefined {
  return value === "default" || value === "primary" || value === "secondary" || value === "tertiary"
    ? value
    : undefined;
}

/** YOOtheme Headline's semantic color is stored as text_color. Keep the
 * explicit "none" value so the renderer can distinguish inherit from a
 * selected semantic color, including the UIkit background token. */
export function normalizeYoothemeHeadingColor(props: Record<string, unknown>): {
  headingColor?: string;
} {
  const color = string(props.text_color) || string(props.title_color);
  return color === "none" || color === "default" || color === "muted" || color === "emphasis" ||
    color === "primary" || color === "secondary" || color === "success" || color === "warning" ||
    color === "danger" || color === "background"
    ? { headingColor: color }
    : {};
}

/** Canonical Text element presentation. These values are intentionally separate
 * from raw typography overrides: YOOtheme Text owns semantic styles/colors and
 * responsive columns, while absent fields continue to inherit Globals. */
export function normalizeYoothemeTextPresentation(props: Record<string, unknown>) {
  const textColor = string(props.text_color);
  const columns = string(props.column);
  const breakpoint = string(props.column_breakpoint);
  const htmlElement = string(props.html_element);
  return {
    ...(textColor === "muted" || textColor === "emphasis" || textColor === "primary" || textColor === "secondary" || textColor === "success" || textColor === "warning" || textColor === "danger" ? { textColor: textColor as "muted" | "emphasis" | "primary" | "secondary" | "success" | "warning" | "danger" } : {}),
    ...(props.dropcap === true || props.dropcap === "1" ? { textDropcap: true } : {}),
    ...(columns === "1-2" || columns === "1-3" || columns === "1-4" || columns === "1-5" || columns === "1-6" ? { textColumns: columns as "1-2" | "1-3" | "1-4" | "1-5" | "1-6" } : {}),
    ...(props.column_divider === true || props.column_divider === "1" ? { textColumnDivider: true } : {}),
    ...(breakpoint === "s" ? { textColumnBreakpoint: "small" as const } : breakpoint === "m" ? { textColumnBreakpoint: "medium" as const } : breakpoint === "l" ? { textColumnBreakpoint: "large" as const } : breakpoint === "xl" ? { textColumnBreakpoint: "xlarge" as const } : {}),
    ...(htmlElement === "address" || htmlElement === "aside" || htmlElement === "footer" ? { textHtmlElement: htmlElement as "address" | "aside" | "footer" } : {}),
  };
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
    ...(metaElement === "div" || metaElement === "span" || metaElement === "p" || (typeof metaElement === "string" && /^h[1-6]$/.test(metaElement))
      ? { gridMetaHtmlElement: metaElement }
      : {}),
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

/**
 * Maps only document-owned Header settings from a full YOOtheme export.
 * Appearance tokens stay in Global Styles; this patch is intentionally limited
 * to the canonical Header document fields consumed by both renderers.
 */
export function normalizeYoothemeHeaderDocument(root: Record<string, unknown>): Partial<BuilderSection> {
  const sourceHeader = root.header && typeof root.header === "object"
    ? root.header as Record<string, unknown>
    : {};
  const sourceNavbar = root.navbar && typeof root.navbar === "object"
    ? root.navbar as Record<string, unknown>
    : {};
  const sourceMobile = root.mobile && typeof root.mobile === "object"
    ? root.mobile as Record<string, unknown>
    : {};
  const sourceSite = root.site && typeof root.site === "object"
    ? root.site as Record<string, unknown>
    : {};

  const sourceLayout = string(sourceHeader.layout)?.toLowerCase();
  const headerLayout: BuilderSection["headerLayout"] =
    sourceLayout === "horizontal-justify" ? "wordpress" :
      sourceLayout === "horizontal-left" ? "simple" :
        sourceLayout === "horizontal-right" ? "princity" :
          sourceLayout === "stacked" ? "two-row" : undefined;
  const width = string(sourceHeader.width)?.toLowerCase();
  const sticky = sourceNavbar.sticky;
  const headerBehavior: BuilderSection["headerBehavior"] =
    sticky === false || sticky === 0 || sticky === "0" ? "static" :
      sticky === 2 || sticky === "2" || sticky === "show-on-up" ? "sticky-on-scroll-up" :
        sticky === true || sticky === 1 || sticky === "1" || sticky === "sticky" ? "sticky" : undefined;

  const patch: Partial<BuilderSection> = {
    headerArchitectureVersion: 2,
    ...(headerLayout ? { headerLayout } : {}),
    ...(width === "full" || width === "expand" ? { headerWidthMode: "full" as const } : {}),
    ...(width === "default" || width === "boxed" ? { headerWidthMode: "boxed" as const } : {}),
    ...(headerBehavior ? { headerBehavior } : {}),
  };

  // These keys are accepted by YOOtheme exports when present (they are absent
  // from some theme exports). Preserve them as document values instead of
  // inventing tenant-specific defaults.
  const boolValue = (value: unknown) => typeof value === "boolean" ? value : undefined;
  const transparent = boolValue(sourceHeader.transparent ?? sourceHeader.header_transparent);
  const overlay = boolValue(sourceHeader.overlay ?? sourceHeader.header_overlay);
  const height = string(sourceHeader.height ?? sourceHeader.header_height);
  const customHeight = typeof sourceHeader.custom_height === "number" ? sourceHeader.custom_height : undefined;
  const zIndex = typeof sourceHeader.z_index === "number" ? sourceHeader.z_index : undefined;
  const backgroundMode = string(sourceHeader.background_mode ?? sourceHeader.background);
  const textMode = string(sourceHeader.text_mode ?? sourceHeader.color_mode);
  if (transparent !== undefined) patch.headerTransparent = transparent;
  if (overlay !== undefined) patch.headerOverlay = overlay;
  if (height === "auto" || height === "small" || height === "medium" || height === "large" || height === "custom") patch.headerHeight = height;
  if (customHeight !== undefined && Number.isFinite(customHeight)) patch.headerCustomHeight = customHeight;
  if (zIndex !== undefined && Number.isFinite(zIndex)) patch.headerZIndex = zIndex;
  if (backgroundMode === "default" || backgroundMode === "glass" || backgroundMode === "accent" || backgroundMode === "none") patch.headerBackgroundMode = backgroundMode;
  if (textMode === "auto" || textMode === "light" || textMode === "dark") patch.headerTextMode = textMode;

  // Theme exports use the `site.boxed.header_outside` flag for the structural
  // overlay case. It is a document behaviour, not a global colour token.
  if (sourceSite.boxed && typeof sourceSite.boxed === "object") {
    const boxed = sourceSite.boxed as Record<string, unknown>;
    if (typeof boxed.header_outside === "boolean") patch.headerOverlay = boxed.header_outside;
  }

  // Keep the imported mobile breakpoint available to the shared Header
  // document once responsive Header controls consume it. It is deliberately
  // omitted here until that canonical field exists, avoiding a dead setting.
  void sourceMobile;
  return patch;
}
