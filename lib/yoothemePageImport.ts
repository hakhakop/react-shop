import type {
  BuilderLayoutBlock,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { sanitizeHtml } from "@/lib/safeHtml";
import { resolveUikitIconName } from "@/lib/uikitIconRegistry";
import {
  normalizeYoothemeMedia,
  normalizeYoothemeGridPanelPresentation,
  normalizeYoothemeSection,
  normalizeYoothemeTemplateGlobals,
  normalizeYoothemeTypography,
  normalizeYoothemeTypographyRole,
  normalizeYoothemeTextPresentation,
} from "@/lib/yoothemeImportContract";
import { createYoothemePageImportReport, formatYoothemeImportWarnings, type YoothemeImportReport } from "@/lib/yoothemeImportReport";
import type { UikitYoothemeButtonVariant } from "@/lib/uikitTokens";

/**
 * Pure compatibility analysis and static-content mapping for YOOtheme layout exports.
 *
 * This module deliberately does not write documents, import assets, or render
 * source nodes. It only describes the source tree using WebPages' existing
 * element vocabulary so a later importer can remain deterministic.
 */

export type YoothemeSourceNode = {
  type?: unknown;
  children?: unknown;
  [key: string]: unknown;
};

export type YoothemeImportElementKind =
  | "heading"
  | "text"
  | "button"
  | "image"
  | "grid"
  | "panel"
  | "alert"
  | "icon"
  | "list"
  | "accordion"
  | "table"
  | "gallery"
  | "slideshow"
  | "overlaySlider"
  | "panelSlider";

export type YoothemeImportAnalysis = {
  rootType: string | null;
  sourceVersion: string | null;
  nodeCounts: Record<string, number>;
  supportedElements: Array<{
    sourceType: string;
    kind: YoothemeImportElementKind;
  }>;
  unsupportedTypes: string[];
};

export type YoothemeStructuralColumn = {
  id: string;
  sourceIndex: number;
  rowId: string;
  rowLayout: string;
};

export type YoothemeStructuralSection = {
  id: string;
  sourceIndex: number;
  kind: "contentLayout";
  title: string;
  background: "transparent";
  layout: string | undefined;
  layoutColumns: number;
  layoutRows: number;
  layoutItems: YoothemeStructuralColumn[];
};

export type YoothemeStructuralMapping = {
  sections: YoothemeStructuralSection[];
  warnings: string[];
};

export type YoothemeStaticImportMapping = {
  sections: BuilderSection[];
  warnings: string[];
  globalStylePatch: Partial<BuilderShellSettings>;
  /** Registry-backed reporting projection; legacy warnings remain readable during Batch 2 migration. */
  report: YoothemeImportReport;
  /** Compatibility bridge for existing string[] preview consumers. */
  reportWarnings: string[];
};

export type YoothemeGlobalStyleBoundary = {
  hasSourceGlobalSettings: boolean;
  mapped: Array<{
    path: string;
    sourceKey: string;
    sourceValue: string;
    owner: "WebPages Global Styles" | "WebPages Element override" | "UIkit token";
  }>;
  unmapped: Array<{
    path: string;
    sourceKey: string;
    sourceValue: string;
    reason: string;
  }>;
};

const ELEMENT_TYPES: Record<string, YoothemeImportElementKind> = {
  headline: "heading",
  text: "text",
  button: "button",
  button_item: "button",
  image: "image",
  grid: "grid",
  grid_item: "grid",
  panel: "panel",
  alert: "alert",
  icon: "icon",
  list: "list",
  list_item: "list",
  accordion: "accordion",
  accordion_item: "accordion",
  table: "table",
  table_item: "table",
  gallery: "gallery",
  gallery_item: "gallery",
  "panel-slider": "panelSlider",
  "panel-slider_item": "panelSlider",
  slideshow: "slideshow",
  slideshow_item: "slideshow",
  "overlay-slider": "overlaySlider",
  "overlay-slider_item": "overlaySlider",
};

const STRUCTURAL_TYPES = new Set(["layout", "section", "row", "column"]);

const LAYOUT_BY_COLUMN_COUNT: Record<number, string> = {
  1: "1-col",
  2: "2-col-equal",
  3: "3-col-equal",
  4: "4-col-equal",
  5: "5-col-equal",
  6: "6-col-equal",
};

const asString = (value: unknown): string | null =>
  typeof value === "string" && value.length > 0 ? value : null;

const sourceAssetBaseUrl = (): string => {
  const configured = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const graphqlUrl = process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL?.trim();
  if (!graphqlUrl) return "";

  try {
    const url = new URL(graphqlUrl);
    url.pathname = url.pathname.replace(/\/graphql\/?$/, "");
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
};

export const resolveYoothemeAssetUrl = (
  value: unknown,
  baseUrl = sourceAssetBaseUrl(),
): string => {
  const asset = asString(value);
  if (!asset) return "";

  if (
    /^(?:[a-z][a-z\d+\-.]*:)?\/\//i.test(asset) ||
    asset.startsWith("data:")
  ) {
    return asset;
  }

  const path = `/${asset.replace(/^\/+|^\.\/+/, "")}`;
  return baseUrl ? `${baseUrl.replace(/\/+$/, "")}${path}` : path;
};

const asChildren = (value: unknown): YoothemeSourceNode[] => {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (child): child is YoothemeSourceNode =>
      typeof child === "object" && child !== null,
  );
};

export const mapYoothemeElementType = (
  sourceType: string,
): YoothemeImportElementKind | null => ELEMENT_TYPES[sourceType] ?? null;

export const isYoothemeStructuralType = (sourceType: string): boolean =>
  STRUCTURAL_TYPES.has(sourceType);

const sourceChildren = (node: YoothemeSourceNode): YoothemeSourceNode[] =>
  asChildren(node.children);

const sourceName = (node: YoothemeSourceNode, fallback: string): string => {
  const name = asString(node.name);
  return name ?? fallback;
};

const sourceProps = (node: YoothemeSourceNode): Record<string, unknown> =>
  typeof node.props === "object" && node.props !== null
    ? (node.props as Record<string, unknown>)
    : {};

const sourcePathId = (path: string, kind: string): string =>
  `yootheme-${kind}-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/-+$/, "")}`;

const sourceAlignment = (value: unknown): "left" | "center" | "right" | undefined =>
  value === "left" || value === "center" || value === "right" ? value : undefined;

/**
 * An absolutely positioned YOOtheme image is offset as an image-sized box.
 * WebPages keeps Position/Offsets on the Phase 3 shell, so its media child
 * must use the corresponding edge as its anchor when no explicit alignment
 * was authored. This avoids centering a 600px decoration inside a full-width
 * positioned shell.
 */
const sourceImageAlignment = (
  props: Record<string, unknown>,
  fallback?: unknown,
): "left" | "center" | "right" | undefined => {
  const explicit = sourceAlignment(props.text_align);
  if (explicit) return explicit;
  if (sourcePosition(props.position) === "absolute") {
    if (asString(props.position_right) !== null) return "right";
    if (asString(props.position_left) !== null) return "left";
  }
  return sourceAlignment(fallback);
};

/** The shared Image border/shape owner accepts the same UIkit border tokens. */
const sourceImageBorder = (
  value: unknown,
): "none" | "rounded" | "circle" | "pill" | undefined =>
  value === "none" || value === "rounded" || value === "circle" || value === "pill"
    ? value
    : undefined;

const sourcePosition = (
  value: unknown,
): NonNullable<NonNullable<BuilderVisualStyle>["layout"]>["position"] => {
  if (value === "static" || value === "relative" || value === "absolute") {
    return value;
  }
  return undefined;
};

const sourceBreakpoint = (
  value: unknown,
): "small" | "medium" | "large" | "xlarge" | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  return normalized === "s" || normalized === "small"
    ? "small"
    : normalized === "m" || normalized === "medium"
      ? "medium"
      : normalized === "l" || normalized === "large"
        ? "large"
        : normalized === "xl" || normalized === "xlarge"
          ? "xlarge"
          : undefined;
};

const sourceMargin = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  if (!normalized) return undefined;
  if (normalized === "remove-vertical" || normalized === "none") return "none";
  if (normalized === "xsmall") return "small";
  if (["small", "default", "medium", "large", "xlarge"].includes(normalized)) return normalized;
  return undefined;
};

const sourceVisibility = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  return ["s", "m", "l", "xl", "visible-s", "visible-m", "visible-l", "visible-xl", "hidden-s", "hidden-m", "hidden-l", "hidden-xl"].includes(normalized)
    ? normalized
    : undefined;
};

const sourceAnimation = (value: unknown): string | undefined => {
  const normalized = String(value ?? "").toLowerCase();
  // YOOtheme's parallax is a compound UIkit runtime (`uk-parallax`) with
  // coordinate/easing/target fields, not a one-shot CSS animation preset.
  // Do not persist an inert `uk-animation-parallax` approximation.
  if (!normalized || normalized === "none" || normalized === "parallax") return undefined;
  return ["fade", "scale-up", "scale-down", "slide-top-small", "slide-bottom-small", "slide-left-small", "slide-right-small", "slide-top-medium", "slide-bottom-medium", "slide-left-medium", "slide-right-medium", "slide-top", "slide-bottom", "slide-left", "slide-right"].includes(normalized)
    ? normalized
    : undefined;
};

const sourceZIndex = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Maps YOOtheme's existing General positioning fields to the existing
 * WebPages visual-style contract. The builder and storefront already render
 * this contract through visualStyleToCss; the importer must not create a
 * second positioning representation.
 */
const sourceGeneralVisualStyle = (
  props: Record<string, unknown>,
): BuilderLayoutBlock["visualStyle"] | undefined => {
  const position = sourcePosition(props.position);
  const top = asString(props.position_top);
  const right = asString(props.position_right);
  const bottom = asString(props.position_bottom);
  const left = asString(props.position_left);
  const zIndex = sourceZIndex(props.position_z_index);
  const marginMode = sourceMargin(props.margin);
  const maxWidth = asString(props.maxwidth);
  const maxWidthBreakpoint = sourceBreakpoint(props.maxwidth_breakpoint);
  const blockAlign = sourceAlignment(props.block_align);
  const blockAlignBreakpoint = sourceBreakpoint(props.block_align_breakpoint);
  const blockAlignFallback = sourceAlignment(props.block_align_fallback) ?? (props.block_align_fallback === "" ? "left" : undefined);
  const textAlign = sourceAlignment(props.text_align) ?? (props.text_align === "justify" ? "justify" : undefined);
  const textAlignBreakpoint = sourceBreakpoint(props.text_align_breakpoint);
  const textAlignFallback = sourceAlignment(props.text_align_fallback) ?? (props.text_align_fallback === "justify" ? "justify" : undefined);
  const visibilityMode = sourceVisibility(props.visibility);
  const animation = sourceAnimation(props.animation);
  const blendWithPage = props.blend === true || props.blend === "true";
  const customClass = asString(props.class);
  const customAttributes = asString(props.attributes) ?? asString(props.attrs);
  const customCss = asString(props.css);

  if (!position && !top && !right && !bottom && !left && zIndex === undefined && !marginMode && !maxWidth && !blockAlign && !textAlign && !visibilityMode && !animation && !blendWithPage && !customClass && !customAttributes && !customCss && !props.margin_remove_top && !props.margin_remove_bottom) {
    return undefined;
  }

  return {
    layout: {
      ...(position ? { position } : {}),
      ...(top ? { top } : {}),
      ...(right ? { right } : {}),
      ...(bottom ? { bottom } : {}),
      ...(left ? { left } : {}),
      ...(zIndex !== undefined ? { zIndex } : {}),
      ...(marginMode ? { marginMode } : {}),
      ...(props.margin_remove_top ? { removeTopMargin: true } : {}),
      ...(props.margin_remove_bottom ? { removeBottomMargin: true } : {}),
      ...(maxWidth ? { maxWidth } : {}),
      ...(maxWidthBreakpoint ? { maxWidthBreakpoint } : {}),
      ...(blockAlign ? { blockAlign } : {}),
      ...(blockAlignBreakpoint ? { blockAlignBreakpoint } : {}),
      ...(blockAlignFallback ? { blockAlignFallback } : {}),
      ...(textAlign ? { textAlign: textAlign as any } : {}),
      ...(textAlignBreakpoint ? { textAlignBreakpoint } : {}),
      ...(textAlignFallback ? { textAlignFallback: textAlignFallback as any } : {}),
      ...(blendWithPage ? { blendWithPage: true } : {}),
      ...(visibilityMode ? { visibilityMode } : {}),
    },
    ...(customClass ? { customClass } : {}),
    ...(customAttributes ? { customAttributes } : {}),
    ...(customCss ? { customCss } : {}),
  };
};

const withSourceGeneralVisualStyle = <T extends BuilderLayoutBlock>(
  block: T,
  props: Record<string, unknown>,
): T => {
  const visualStyle = sourceGeneralVisualStyle(props);
  if (!visualStyle) return block;
  const layout = visualStyle.layout ?? {};
  const direct: Record<string, unknown> = {
    ...(layout.maxWidth ? { maxWidth: layout.maxWidth } : {}),
    ...(layout.maxWidthBreakpoint ? { maxWidthBreakpoint: layout.maxWidthBreakpoint } : {}),
    ...(layout.blockAlign && layout.blockAlign !== "none" ? { elementAlign: layout.blockAlign } : {}),
    ...(layout.textAlign ? { textAlign: layout.textAlign as any, headingAlign: layout.textAlign as any } : {}),
    ...(layout.removeTopMargin ? { removeTopMargin: true } : {}),
    ...(layout.removeBottomMargin ? { removeBottomMargin: true } : {}),
    ...(layout.visibilityMode ? { visibility: layout.visibilityMode, visibilityMode: layout.visibilityMode } : {}),
    ...(sourceAnimation(props.animation) ? { animation: { preset: sourceAnimation(props.animation) as any } } : {}),
  };
  return {
    ...block,
    ...direct,
    // Native WebPages blocks may inherit Global Element Padding. Imported
    // YOOtheme blocks deliberately do not: their source owns spacing through
    // explicit UIkit margin semantics and component internals.
    elementPadding: "none",
    spacingContract: "yootheme",
    visualStyle: {
      ...(block.visualStyle ?? {}),
      ...visualStyle,
      layout: {
        ...(block.visualStyle?.layout ?? {}),
        ...(visualStyle.layout ?? {}),
      },
      effects: { ...(block.visualStyle?.effects ?? {}), ...(visualStyle.effects ?? {}) },
      card: { ...(block.visualStyle?.card ?? {}), ...(visualStyle.card ?? {}) },
    },
  } as T;
};

const GENERAL_POSITION_KEYS = [
  "position",
  "position_left",
  "position_right",
  "position_top",
  "position_bottom",
  "position_z_index",
];

const sourceImageMaxWidth = (props: Record<string, unknown>): number | undefined => {
  if (typeof props.image_width === "string" && /^\d+$/.test(props.image_width)) {
    return Number(props.image_width);
  }

  // YOOtheme's play overlay relies on the SVG's natural 100px presentation
  // size. Without an explicit width, the WebPages image primitive otherwise
  // stretches it to the full media container.
  if (typeof props.image === "string" && /(?:^|\/)icon-play\.svg$/i.test(props.image)) {
    return 100;
  }

  return undefined;
};

const sourceSectionVariant = (
  value: unknown,
): BuilderSection["sectionVariant"] =>
  value === "muted" || value === "primary" || value === "secondary"
    ? value
    : "default";

const sourceGlobalBackgroundPatch = (root: YoothemeSourceNode): Partial<BuilderShellSettings> =>
  normalizeYoothemeTemplateGlobals(root as Record<string, unknown>);

const sourceSectionSpacing = (
  value: unknown,
): BuilderSection["topSpacing"] | undefined => {
  if (typeof value !== "string") return undefined;
  if (["none", "small", "medium", "large", "xlarge"].includes(value)) {
    return value as BuilderSection["topSpacing"];
  }
  if (value === "x-small") return "xs";
  if (value === "2xlarge") return "2xl";
  return undefined;
};

const reportGlobalStyleValue = (
  boundary: YoothemeGlobalStyleBoundary,
  path: string,
  sourceKey: string,
  value: unknown,
  owner: "WebPages Global Styles" | "WebPages Element override" | "UIkit token",
) => {
  const sourceValue = asString(value);
  if (!sourceValue) return;
  boundary.mapped.push({ path, sourceKey, sourceValue, owner });
};

const reportUnmappedStyleValue = (
  boundary: YoothemeGlobalStyleBoundary,
  path: string,
  sourceKey: string,
  value: unknown,
  reason: string,
) => {
  const sourceValue = asString(value);
  if (!sourceValue) return;
  boundary.unmapped.push({ path, sourceKey, sourceValue, reason });
};

/**
 * Classifies source appearance semantics against owners that already exist in
 * WebPages. It intentionally does not create or mutate Global Settings.
 */
export const analyzeYoothemeGlobalStyleBoundary = (
  source: unknown,
): YoothemeGlobalStyleBoundary => {
  const boundary: YoothemeGlobalStyleBoundary = {
    hasSourceGlobalSettings: false,
    mapped: [],
    unmapped: [],
  };
  const root =
    typeof source === "object" && source !== null
      ? (source as YoothemeSourceNode)
      : null;

  const visit = (node: YoothemeSourceNode, path: string) => {
    const type = asString(node.type);
    const props = sourceProps(node);
    if (type === "layout" && (props.global || props.settings || props.global_styles)) {
      boundary.hasSourceGlobalSettings = true;
    }

    if (type === "section") {
      if (
        props.style === "default" ||
        props.style === "muted" ||
        props.style === "primary" ||
        props.style === "secondary"
      ) {
        reportGlobalStyleValue(boundary, path, "style", props.style, "UIkit token");
      }
      if (sourceSectionSpacing(props.padding)) {
        reportGlobalStyleValue(boundary, path, "padding", props.padding, "WebPages Global Styles");
      }
    }

    const semanticMappings: Array<[
      string,
      (value: unknown) => unknown,
      "WebPages Global Styles" | "UIkit token",
    ]> = [
      ["title_style", sourceHeadingSize, "WebPages Global Styles"],
      ["text_style", sourceTextVariant, "WebPages Global Styles"],
      ["meta_style", sourceTextVariant, "WebPages Global Styles"],
      ["button_style", (value) =>
        ["", "default", "primary", "secondary", "danger", "text", "link", "link-muted", "link-text"].includes(String(value))
          ? sourceButtonStyle(value)
          : undefined, "UIkit token"],
      ["link_style", (value) =>
        ["", "default", "primary", "secondary", "danger", "text", "link", "link-muted", "link-text"].includes(String(value))
          ? sourceButtonStyle(value)
          : undefined, "UIkit token"],
      ["panel_style", sourcePanelStyle, "UIkit token"],
      ["image_border", (value) =>
        value === "rounded" || value === "circle" || value === "pill" ? value : undefined,
      "UIkit token"],
    ];

    semanticMappings.forEach(([sourceKey, resolver, owner]) => {
      const value = props[sourceKey];
      if (value === undefined || value === null || value === "") return;
      if (resolver(value)) {
        reportGlobalStyleValue(boundary, path, sourceKey, value, owner);
      } else {
        reportUnmappedStyleValue(
          boundary,
          path,
          sourceKey,
          value,
          "No existing WebPages semantic or UIkit token equivalent.",
        );
      }
    });

    ["font_family", "font_size", "font_weight", "letter_spacing", "line_height", "color", "text_transform"].forEach(
      (sourceKey) => {
        if (props[sourceKey] === undefined) return;
        reportGlobalStyleValue(boundary, path, sourceKey, props[sourceKey], "WebPages Element override");
      },
    );

    sourceChildren(node).forEach((child, index) => visit(child, `${path}.${index}`));
  };

  if (root) visit(root, "0");
  return boundary;
};

const sourceHeadingLevel = (
  value: unknown,
): BuilderLayoutBlock["headingLevel"] | undefined =>
  typeof value === "string" && (/^h[1-6]$/.test(value) || value === "div")
    ? (value as BuilderLayoutBlock["headingLevel"])
    : undefined;

/** Meta uses its own compact HTML-element contract (div/span/p), rather than
 * the Heading contract. Keep that distinction at the import boundary. */
const sourceMetaElement = (value: unknown): "div" | "span" | "p" | undefined =>
  value === "div" || value === "span" || value === "p" ? value : undefined;

const sourceHeadingSize = (
  value: unknown,
): BuilderLayoutBlock["headingSize"] | undefined => {
  if (typeof value !== "string") return undefined;
  if (["h1", "h2", "h3", "h4", "h5", "h6", "small", "medium", "large", "xlarge", "2xlarge", "3xlarge"].includes(value)) {
    return value as BuilderLayoutBlock["headingSize"];
  }
  if (value === "heading-small") return "small";
  if (value === "heading-medium") return "medium";
  if (value === "heading-large") return "large";
  if (value === "heading-xlarge") return "xlarge";
  if (value === "heading-2xlarge") return "2xlarge";
  if (value === "heading-3xlarge") return "3xlarge";
  return undefined;
};

const sourceTextVariant = (
  value: unknown,
): BuilderLayoutBlock["textVariant"] | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/^text-/, "");
  return ["default", "lead", "meta", "small", "large", "muted"].includes(normalized)
    ? (normalized as BuilderLayoutBlock["textVariant"])
    : undefined;
};

const sourceButtonStyle = (
  value: unknown,
): UikitYoothemeButtonVariant => {
  // YOOtheme uses an empty `button_style` value for its plain Link treatment.
  // Preserve it as a semantic value rather than falling back to Default.
  if (value === "" || value === "link") return "link";
  if (value === "primary") return "primary";
  if (value === "secondary") return "secondary";
  if (value === "danger") return "danger";
  if (value === "text") return "text";
  if (value === "link-muted") return "link-muted";
  if (value === "link-text") return "link-text";
  if (value === "default") return "default";
  return "default";
};

const sourceButtonSize = (
  value: unknown,
): NonNullable<BuilderLayoutBlock["size"]> | undefined =>
  value === "small" || value === "large" || value === "default"
    ? (value as NonNullable<BuilderLayoutBlock["size"]>)
    : undefined;

const sourcePanelStyle = (
  value: unknown,
): BuilderLayoutBlock["panelStyle"] | undefined => {
  if (typeof value !== "string") return undefined;
  const normalized = value.replace(/^(?:card|tile)-/, "");
  // Card variants are owned by `panelVariant`/`gridCardVariant`; `panelStyle`
  // selects the existing panel renderer. Do not reject valid YOOtheme cards.
  if (normalized === "primary" || normalized === "blank") return "default";
  return [
    "default",
    "princity",
    "princity-flat",
    "princity-line",
    "secondary",
    "dark",
    "light",
    "clean-shadow",
    "flat-dark",
    "flat-white",
    "antigravity",
  ].includes(normalized)
    ? (normalized as NonNullable<BuilderLayoutBlock["panelStyle"]>)
    : undefined;
};

const sourceCardVariant = (
  value: unknown,
): NonNullable<BuilderLayoutBlock["gridCardVariant"]> => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase().replace(/^(?:card|tile)-/, "") : "";
  // An omitted YOOtheme panel_style means Grid Panel Style = None. It must
  // remain distinct from Card Default through import and rendering.
  if (normalized === "" || normalized === "none" || normalized === "blank") return "blank";
  return normalized === "primary" || normalized === "secondary" || normalized === "blank"
    ? normalized
    : "default";
};

const sourcePanelVariant = (
  value: unknown,
): NonNullable<BuilderLayoutBlock["panelVariant"]> => {
  const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (["card-default", "default"].includes(normalized)) return "default";
  // YOOtheme's Card Hover is the default card surface with its hover state
  // enabled; it is not an independent surface token.
  if (normalized === "card-hover") return "default";
  if (["card-primary", "primary"].includes(normalized)) return "primary";
  if (["card-secondary", "secondary"].includes(normalized)) return "secondary";
  if (["", "blank", "none"].includes(normalized)) return "blank";
  if (["tile-default", "tile-muted", "tile-primary", "tile-secondary"].includes(normalized)) {
    return normalized as NonNullable<BuilderLayoutBlock["panelVariant"]>;
  }
  return "default";
};

const sourceGridButtonStyle = (
  value: unknown,
): NonNullable<NonNullable<BuilderLayoutBlock["gridItems"]>[number]["buttonStyle"]> | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const style = sourceButtonStyle(value);
  return style as NonNullable<NonNullable<BuilderLayoutBlock["gridItems"]>[number]["buttonStyle"]>;
};

/** YOOtheme stores filter tags as a comma-separated item field. */
const sourceGridTags = (value: unknown): string[] | undefined => {
  const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
  const tags = values
    .map((entry) => String(entry).trim())
    .filter(Boolean);
  return tags.length ? Array.from(new Set(tags)) : undefined;
};

const sourceGridItem = (
  node: YoothemeSourceNode,
  path: string,
  parentProps: Record<string, unknown>,
  warnings: string[],
): NonNullable<BuilderLayoutBlock["gridItems"]>[number] => {
  const props = sourceProps(node);
  const media = normalizeYoothemeMedia({ ...parentProps, ...props });
  const panelStyle = sourcePanelStyle(props.panel_style ?? parentProps.panel_style);
  const hasItemPanelStyle = Object.prototype.hasOwnProperty.call(props, "panel_style");
  if (Object.prototype.hasOwnProperty.call(props, "image") && !resolveYoothemeAssetUrl(props.image)) {
    warnings.push(`${path}: image asset could not be resolved and was left empty.`);
  }
  if (props.panel_style && !panelStyle) {
    warnings.push(`${path}: panel style '${String(props.panel_style)}' has no canonical WebPages equivalent.`);
  }

  return {
    id: sourcePathId(path, "grid-item"),
    imageUrl: resolveYoothemeAssetUrl(props.image),
    imageAlt: asString(props.image_alt) ?? asString(props.title) ?? "",
    // Both source fields are authored as rich HTML in the DevStack fixtures.
    // Normalize them at the same safe boundary used by the WebPages rich editor.
    title: sanitizeHtml(asString(props.title) ?? ""),
    meta: asString(props.meta) ?? "",
    text: sanitizeHtml(asString(props.content) ?? ""),
    tags: sourceGridTags(props.tags),
    buttonLabel: asString(props.link_text) ?? asString(parentProps.link_text) ?? undefined,
    buttonUrl: asString(props.link) ?? undefined,
    buttonStyle: sourceGridButtonStyle(props.link_style),
    buttonTarget: props.link_target === "blank" ? "_blank" : "_self",
    // The Grid owns its default Card surface. Retain an item value only when
    // YOOtheme explicitly set one, otherwise future Grid style changes inherit.
    ...(hasItemPanelStyle ? {
      renderer: panelStyle ? "card" : "plain",
      cardVariant: sourceCardVariant(props.panel_style),
      ...(props.panel_style === "card-hover" ? { cardHover: true } : {}),
    } : {}),
    mediaPlacement: props.image_align === "left" || props.image_align === "right" ? props.image_align : "top",
    mediaFit: media.imageFit ?? "natural",
    imagePosition: media.imagePosition,
    textAlign: sourceAlignment(props.text_align ?? parentProps.text_align),
    titleElement: sourceHeadingLevel(props.title_element ?? parentProps.title_element) as "h2" | "h3" | "h4" | "div" | undefined,
    titleStyle: sourceHeadingSize(props.title_style ?? parentProps.title_style) as "inherit" | "h3" | "h4" | "h5" | undefined,
  };
};

const sourceSliderItem = (
  node: YoothemeSourceNode,
  path: string,
  parentProps: Record<string, unknown> = {},
): NonNullable<BuilderSection["slides"]>[number] => {
  const itemProps = sourceProps(node);
  const props = { ...parentProps, ...itemProps };
  const media = normalizeYoothemeMedia(props);
  // Element-level links must not leak into each item as manufactured actions.
  // Item action ownership belongs only to its own source node.
  const actionLabel = asString(itemProps.link_text);
  const actionUrl = asString(itemProps.link);
  const sourceFocalPoint = (value: unknown) => {
    const focal = asString(value);
    return focal === "top-left" || focal === "top-center" || focal === "top-right" ||
      focal === "center-left" || focal === "center" || focal === "center-right" ||
      focal === "bottom-left" || focal === "bottom-center" || focal === "bottom-right"
      ? focal
      : undefined;
  };
  const itemElement = asString(itemProps.item_element);
  return {
    id: sourcePathId(path, "panel-slide"),
    // YOOtheme title fields may carry safe inline markup (for example a
    // deliberate line break). Preserve it through the shared rich-inline
    // sanitizer instead of reducing a title to plain text at import time.
    title: sanitizeHtml(asString(props.title) ?? ""),
    meta: asString(props.meta) ?? "",
    // Slider item content uses the same persisted safe-HTML contract as Grid
    // and Panel content. Keep imported YOOtheme markup intact at the importer
    // boundary instead of reducing it to plain text in the item adapter.
    text: sanitizeHtml(asString(props.content) ?? ""),
    imageUrl: resolveYoothemeAssetUrl(props.image),
    imageAlt: asString(props.image_alt) ?? asString(props.title) ?? "",
    thumbnailUrl: resolveYoothemeAssetUrl(itemProps.thumbnail),
    thumbnailPosition: sourceFocalPoint(itemProps.thumbnail_focal_point),
    // Width and Height are Panel Slider element media defaults. Retain these
    // on an item only when the source item explicitly authored its own value;
    // copying a parent value here would mask later element-level edits.
    ...(asString(itemProps.image_width) ? { imageWidth: asString(itemProps.image_width)! } : {}),
    ...(asString(itemProps.image_height) ? { imageHeight: asString(itemProps.image_height)! } : {}),
    ...(Object.prototype.hasOwnProperty.call(itemProps, "image_border")
      ? { imageShape: sourceImageBorder(itemProps.image_border) ?? "none" }
      : {}),
    imageFit: media.imageFit,
    imageRatio: media.imageRatio,
    imageAlignment: media.imageAlignment,
    imagePosition: sourceFocalPoint(itemProps.image_focal_point) ?? media.imagePosition,
    imageLoading: media.imageLoading,
    // Item fields are true local overrides only. Parent element values belong
    // to carouselSettings so a missing item value can inherit correctly.
    ...(sourceHeadingLevel(itemProps.title_element)
      ? { headingLevel: sourceHeadingLevel(itemProps.title_element) }
      : {}),
    ...(sourceHeadingSize(itemProps.title_style)
      ? { headingSize: sourceHeadingSize(itemProps.title_style) }
      : {}),
    ...(sourceTextVariant(itemProps.meta_style)
      ? { metaStyle: sourceTextVariant(itemProps.meta_style) }
      : {}),
    ...(sourceMetaElement(itemProps.meta_element)
      ? { metaHtmlElement: sourceMetaElement(itemProps.meta_element) }
      : {}),
    ...(itemProps.meta_align === "above-title" || itemProps.meta_align === "below-content"
      ? { gridMetaAlign: itemProps.meta_align }
      : {}),
    // YOOtheme distinguishes a whole-panel link from a visible link/button.
    // Do not manufacture a default action when `link_text` is intentionally
    // empty; `panel_link` still makes the title/media panel interactive.
    showAction: Boolean(actionUrl && actionLabel),
    buttonLabel: actionLabel ?? undefined,
    buttonUrl: actionUrl ?? undefined,
    ...(itemProps.link_target !== undefined
      ? { buttonTarget: itemProps.link_target === "blank" ? "_blank" : "_self" }
      : {}),
    buttonAriaLabel: asString(itemProps.link_aria_label) ?? undefined,
    navigationLabel: asString(itemProps.label) ?? undefined,
    ...(itemProps.text_color === "light" || itemProps.text_color === "dark" || itemProps.text_color === "none"
      ? { textColor: itemProps.text_color }
      : {}),
    ...(itemElement === "div" || itemElement === "article" || itemElement === "section" || itemElement === "li"
      ? { itemElement }
      : {}),
    ...(itemProps.link_style !== undefined ? { buttonStyle: sourceButtonStyle(itemProps.link_style) } : {}),
    ...(sourceButtonSize(itemProps.link_size) ? { buttonSize: sourceButtonSize(itemProps.link_size) } : {}),
    ...(Object.prototype.hasOwnProperty.call(itemProps, "link_fullwidth")
      ? { fullWidthButton: itemProps.link_fullwidth === true || itemProps.link_fullwidth === "true" }
      : {}),
    ...(sourceMargin(itemProps.link_margin) ? { linkMarginTop: sourceMargin(itemProps.link_margin) } : {}),
    // Panel/Card presentation belongs to the shared Card owner. Preserve an
    // explicitly authored item value; parent-level defaults are applied by
    // the Panel Slider adapter below.
    ...(Object.prototype.hasOwnProperty.call(itemProps, "panel_style")
      ? { panelStyle: sourceCardVariant(itemProps.panel_style) }
      : {}),
    ...(itemProps.panel_padding === "small" || itemProps.panel_padding === "default" || itemProps.panel_padding === "large"
      ? { panelSize: itemProps.panel_padding }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(itemProps, "panel_link_hover")
      ? { panelHover: itemProps.panel_link_hover === true || itemProps.panel_link_hover === "true" || itemProps.panel_style === "card-hover" }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(itemProps, "panel_link")
      ? { linkPanel: itemProps.panel_link === true || itemProps.panel_link === "true" }
      : {}),
  };
};

/** A YOOtheme item can carry a dynamic field binding in `source`, separate
 * from its authored static props. Phase 9 deliberately imports only actual
 * static fallback content; bindings themselves belong to Phase 13. */
const hasDynamicSourceBinding = (node: YoothemeSourceNode) => {
  const source = node.source;
  return Boolean(
    source && typeof source === "object" && !Array.isArray(source) &&
      Object.keys(source as Record<string, unknown>).length > 0,
  );
};

const hasStaticSliderFallback = (node: YoothemeSourceNode) => {
  const props = sourceProps(node);
  return ["title", "meta", "content", "image", "video", "link"].some(
    (key) => asString(props[key]) !== null,
  );
};

const sourceStaticSliderItems = (
  node: YoothemeSourceNode,
  itemType: string,
  path: string,
  parentProps: Record<string, unknown>,
  warnings?: string[],
) => {
  const items = sourceChildren(node).filter((child) => child.type === itemType);
  const hasDynamicItemSource = items.some(hasDynamicSourceBinding);
  const slides = items
    .filter((child) => !hasDynamicSourceBinding(child) || hasStaticSliderFallback(child))
    .map((child, index) => {
      const itemPath = `${path}.${index}`;
      if (itemType === "panel-slider_item" && warnings) {
        warnPanelSliderFields(itemPath, sourceProps(child), warnings, PANEL_SLIDER_ITEM_SUPPORTED_FIELDS);
      }
      return sourceSliderItem(child, itemPath, parentProps);
    });
  return {
    slides,
    hasDynamicSource: hasDynamicItemSource || hasDynamicSourceBinding(node),
  };
};

const sourceSliderGap = (value: unknown) =>
  value === "small" ? 15 : value === "medium" ? 20 : value === "large" ? 40 : value === "" || value === "none" ? 0 : 30;

/** `1-3` means one third width, i.e. three visible items. */
const sourceSliderItemsPerView = (value: unknown) => {
  const match = typeof value === "string" ? value.match(/^(\d+)-(\d+)$/) : null;
  if (!match) return undefined;
  const numerator = Number(match[1]);
  const denominator = Number(match[2]);
  return numerator > 0 && denominator >= numerator ? Math.min(Math.max(denominator / numerator, 1), 6) : undefined;
};

/** Normalize the UIkit values at the importer boundary instead of leaking
 * element-specific strings into the shared carousel contract. */
const sourceCarouselOverlayPosition = (value: unknown) => {
  const normalized = asString(value);
  return [
    "top-left", "top-right", "bottom-left", "bottom-center", "bottom-right",
    "center", "center-left", "center-right",
  ].includes(normalized ?? "") && normalized ? normalized : undefined;
};

const sourceCarouselOverlayDisplay = (value: unknown) =>
  value === "hover" || value === "active" ? value : "always";

const sourceCarouselOverlayPadding = (value: unknown) =>
  value === "small" || value === "large" || value === "none" ? value : "default";

const sourceSlideshowHeight = (value: unknown) =>
  value === "viewport" ? "viewport" : undefined;

const warnUnsupported = (
  path: string,
  props: Record<string, unknown>,
  supported: string[],
  warnings: string[],
) => {
  const unsupported = Object.keys(props).filter((key) => !supported.includes(key));
  unsupported.forEach((key) => {
    warnings.push(`${path}.${key}: INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — no canonical WebPages owner or shared renderer exists.`);
  });
};

/**
 * Panel Slider reporting is deliberately stricter than the legacy generic
 * allowlist. The adapter has a real owner for the supported keys below,
 * explicit deferred keys are reported once as DEFERRED, and a newly seen key
 * is called out as UNHANDLED instead of being mistaken for an intentional
 * product decision.
 */
const PANEL_SLIDER_SUPPORTED_FIELDS = new Set([
  ...GENERAL_POSITION_KEYS,
  "animation", "attributes", "attrs", "blend", "class", "css", "visibility",
  "maxwidth", "maxwidth_breakpoint", "block_align", "block_align_breakpoint", "block_align_fallback",
  "text_align_breakpoint", "text_align_fallback", "margin", "margin_remove_top", "margin_remove_bottom",
  "panel_style", "panel_padding", "panel_link", "panel_link_hover",
  "title", "meta", "content",
  "show_title", "show_image", "show_meta", "show_content", "show_link",
  "text_align", "meta_align", "meta_element", "meta_style", "title_element", "title_style",
  "link", "link_text", "link_style", "link_size", "link_target",
  "image", "image_alt", "image_width", "image_height", "image_fit", "image_ratio", "image_position", "image_loading", "image_border", "image_svg_inline", "image_svg_color",
  "slider_autoplay", "slider_autoplay_interval", "slider_autoplay_pause", "slider_center", "slider_finite", "slider_gap", "slider_width",
  "slider_width_default", "slider_width_small", "slider_width_medium", "slider_width_large", "slider_width_xlarge",
  "slider_divider", "slidenav", "slidenav_margin", "slidenav_breakpoint", "nav", "nav_position",
  // Dynamic source descriptors are classified by reportUnsupportedDynamicSource.
  "source", "query", "content_source", "item_source",
]);

const PANEL_SLIDER_DEFERRED_FIELDS = new Set([
  "image_align",
  "text_color",
  "panel_match",
  "nav_breakpoint",
  "slidenav_outside_breakpoint",
]);

const PANEL_SLIDER_INTENTIONALLY_UNSUPPORTED_FIELDS = new Set([
  "content_column_breakpoint", "icon_width", "image_grid_breakpoint", "image_grid_width",
  "show_hover_image", "show_hover_video", "show_video", "slider_sets",
  "title_align", "title_grid_breakpoint", "title_grid_width", "title_hover_style",
  "link_image", "image_transition", "animate_strokes", "image_icon_width", "image_icon_color",
  "grid_column_gap", "grid_row_gap", "vertical_align", "margin_top", "link_margin", "title_margin",
  "lightbox_bg_close", "parallax_easing", "item_animation", "item_maxwidth",
  "panel_expand", "panel_image_no_padding", "meta_color", "title_link",
]);

const PANEL_SLIDER_DEFERRED_MESSAGES: Record<string, string> = {
  image_align: "Panel Slider structural image alignment requires the shared media-grid layout runtime, which is not in the current supported scope.",
  text_color: "Panel Slider has no canonical shared text-context owner that applies this source value across title, meta, content, and actions.",
  panel_match: "equal-height Panel Slider sets require the shared item-height contract, which is not in the current supported scope.",
  nav_breakpoint: "navigation breakpoint responsiveness is intentionally deferred in the current shared slider runtime.",
  slidenav_outside_breakpoint: "outside-arrow breakpoint responsiveness is intentionally deferred in the current shared slider runtime.",
};

const warnPanelSliderFields = (
  path: string,
  props: Record<string, unknown>,
  warnings: string[],
  supported = PANEL_SLIDER_SUPPORTED_FIELDS,
) => {
  Object.keys(props).forEach((key) => {
    if (supported.has(key)) return;
    if (PANEL_SLIDER_DEFERRED_FIELDS.has(key)) {
      warnings.push(`${path}.${key}: DEFERRED — ${PANEL_SLIDER_DEFERRED_MESSAGES[key]}`);
      return;
    }
    if (PANEL_SLIDER_INTENTIONALLY_UNSUPPORTED_FIELDS.has(key)) {
      warnings.push(`${path}.${key}: INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — no canonical WebPages owner or shared renderer exists.`);
      return;
    }
    warnings.push(`${path}.${key}: UNHANDLED YOOtheme Panel Slider source field — no importer classification exists yet.`);
  });
};

const PANEL_SLIDER_ITEM_SUPPORTED_FIELDS = new Set([
  "title", "meta", "content", "image", "image_alt", "image_width", "image_height", "image_fit", "image_ratio", "image_position", "image_loading", "image_border", "image_svg_inline", "image_svg_color",
  "title_element", "title_style", "meta_align", "meta_element", "meta_style",
  "link", "link_text", "link_target", "link_style", "link_size", "panel_link",
  "panel_style", "panel_padding", "panel_link_hover",
]);

/**
 * YOOtheme's source/query descriptors describe a dynamic collection rather
 * than static element content. Dynamic Content / Field Binding is deliberately
 * a cross-element capability, so Phase 9 must neither persist these objects
 * nor pretend the carousel can resolve them.
 */
const reportUnsupportedDynamicSource = (
  path: string,
  props: Record<string, unknown>,
  staticItemCount: number,
  warnings: string[],
): boolean => {
  const dynamicKeys = Object.keys(props).filter((key) =>
    key === "source" || key === "query" || key === "content_source" ||
    key === "item_source" || key.startsWith("source_") || key.startsWith("query_"),
  ).filter((key) => {
    const value = props[key];
    return value !== undefined && value !== null && value !== "" && value !== false;
  });

  if (dynamicKeys.length === 0) return false;

  const fallback = staticItemCount > 0
    ? "Static item content was imported; the dynamic binding was not stored."
    : "The element was not imported because no static fallback items exist.";
  warnings.push(`${path}: DYNAMIC CONTENT UNSUPPORTED FOR NOW (${dynamicKeys.join(", ")}). ${fallback} Deferred to the cross-element Dynamic Content / Field Binding capability.`);
  return staticItemCount === 0;
};

const mapStaticElement = (
  node: YoothemeSourceNode,
  path: string,
  warnings: string[],
): BuilderLayoutBlock | null => {
  const props = sourceProps(node);
  const type = asString(node.type);
  if (!type) return null;

  if (type === "headline") {
    const level = sourceHeadingLevel(props.title_element);
    if (props.title_element && !level) {
      warnings.push(`${path}.title_element: INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — semantic level '${String(props.title_element)}' has no canonical WebPages heading control.`);
    }
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "heading"),
      kind: "heading",
      headingText: asString(props.content) ?? "",
      title: asString(props.content) ?? "",
      headingLevel: level ?? "h2",
      headingSize: sourceHeadingSize(props.title_style),
      headingAlign: sourceAlignment(props.text_align),
      elementAlign: sourceAlignment(props.block_align),
      ...(normalizeYoothemeTypographyRole(props.title_font_family)
        ? { headingTypographyRole: normalizeYoothemeTypographyRole(props.title_font_family) }
        : {}),
      ...normalizeYoothemeTypography(props),
    }, props);
  }

  if (type === "text") {
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "text"),
      kind: "text",
      body: asString(props.content) ?? "",
      textVariant: sourceTextVariant(props.text_style) ?? "default",
      textAlign: sourceAlignment(props.text_align),
      elementAlign: sourceAlignment(props.block_align),
      ...normalizeYoothemeTextPresentation(props),
      ...normalizeYoothemeTypography(props),
    }, props);
  }

  if (type === "button") {
    const items = sourceChildren(node)
      .filter((child) => child.type === "button_item")
      .map((child, index) => {
        const itemProps = sourceProps(child);
        if (itemProps.link_target === "modal") {
          warnings.push(`${path}.${index}.link_target: INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — Button dialog/offcanvas links have no canonical WebPages interaction; the ordinary link URL is retained without modal behavior.`);
        }
        return {
          id: sourcePathId(`${path}.${index}`, "button"),
          label: asString(itemProps.content) ?? `Button ${index + 1}`,
          url: asString(itemProps.link) ?? "#",
          target: (itemProps.link_target === "blank" ? "_blank" : "_self") as "_blank" | "_self",
          style: sourceButtonStyle(itemProps.button_style),
        };
      });
    if (items.length === 0) {
      warnings.push(`${path}: button has no button_item children and was skipped.`);
      return null;
    }
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "button"),
      kind: "button",
      buttons: items,
      size: sourceButtonSize(props.button_size),
      fullWidthButton: props.fullwidth === true || props.fullwidth === "true",
      textAlign: sourceAlignment(props.text_align),
      elementAlign: sourceAlignment(props.block_align),
    }, props);
  }

  if (type === "image") {
    if (Object.prototype.hasOwnProperty.call(props, "image") && !resolveYoothemeAssetUrl(props.image)) {
      warnings.push(`${path}: image asset could not be resolved and was left empty.`);
    }
    const linkTarget = props.link_target === "blank" ? "_blank" : "_self";
    if (props.link_target && props.link_target !== "blank" && props.link_target !== "modal") {
      warnings.push(`${path}: image link target '${String(props.link_target)}' was normalized to the current window.`);
    }
    if (props.link_target === "modal") {
      warnings.push(`${path}.link_target: INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — image modal links have no canonical WebPages image control; the ordinary link URL is retained without modal behavior.`);
    }
    const media = normalizeYoothemeMedia(props);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "image"),
      kind: "image",
      imageUrl: resolveYoothemeAssetUrl(props.image),
      imageAlt: asString(props.image_alt) ?? asString(props.alt) ?? "",
      // Retained only as a read-compatible alias for documents that predate
      // canonical imageWidth. The resolver prefers imageWidth.
      imageMaxWidth: sourceImageMaxWidth(props),
      ...media,
      // YOOtheme's Image template only creates its cover frame when
      // `image_ratio` is authored. An omitted source ratio is therefore an
      // explicit natural-media instruction for an imported Image, not an
      // opportunity to inherit WebPages' native global media framing.
      imageRatio: media.imageRatio ?? "natural",
      imageLinkUrl: asString(props.link) ?? undefined,
      imageLinkTarget: props.link ? linkTarget : undefined,
      imageShape: props.image_border === "rounded" || props.image_border === "circle" || props.image_border === "pill"
        ? props.image_border
        : "none",
      ...(["none", "small", "medium", "large", "xlarge"].includes(asString(props.image_box_shadow) ?? "")
        ? {
          imageShadow: asString(props.image_box_shadow) as "none" | "small" | "medium" | "large" | "xlarge",
          imageBoxShadow: asString(props.image_box_shadow) as "none" | "small" | "medium" | "large" | "xlarge",
        }
        : {}),
      ...(["none", "default", "primary", "secondary"].includes(asString(props.image_box_decoration) ?? "")
        ? { imageBoxDecoration: asString(props.image_box_decoration) as "none" | "default" | "primary" | "secondary" }
        : {}),
      imageAlignment: sourceImageAlignment(props, media.imageAlignment),
    }, props);
  }

  if (type === "grid") {
    const items = sourceChildren(node)
      .filter((child) => child.type === "grid_item")
      .map((child, index) => sourceGridItem(child, `${path}.${index}`, props, warnings));
    const panelStyle = sourcePanelStyle(props.panel_style);
    if (props.panel_style && !panelStyle) {
      warnings.push(`${path}: panel style '${String(props.panel_style)}' has no canonical WebPages equivalent.`);
    }
    warnUnsupported(path, props, [
      "block_align", "grid_column_gap", "grid_default", "grid_medium", "grid_small",
      "grid_row_gap", "grid_divider", "grid_column_align", "grid_row_align",
      "image_align", "image_width", "image_height", "image_position", "image_fit", "image_ratio", "image_loading", "image_border",
      "image_box_shadow", "image_box_decoration", "image_transition", "link_image", "image_grid_width",
      "link_style", "link_text", "link_target", "link_size", "link_fullwidth", "link_margin", "meta_style", "panel_padding", "panel_style",
      "show_content", "show_image", "show_link", "show_meta", "show_title", "text_align",
      "title_element", "title_style", "title_align", "meta_align", "meta_element",
      "title_margin", "link_margin", "margin", "margin_remove_bottom",
      // Filter navigation has an existing Grid owner. More detailed filter
      // layout options remain unsupported until the responsive runtime owns
      // them, but the source enablement/style must reach item tags.
      "filter", "filter_style",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "grid"),
      kind: "grid",
      gridSource: "static",
      gridItems: items,
      gridShowImage: props.show_image !== false,
      gridShowMeta: props.show_meta !== false,
      gridShowText: props.show_content !== false,
      gridShowButton: props.show_link !== false,
      enableFilter: props.filter === true || props.filter === "true",
      filterStyle: props.filter_style === "subnav-pill" ? "pill" : props.filter_style === "tab" ? "tabs" : "subnav",
      gridItemRenderer: panelStyle ? "card" : "plain",
      gridCardVariant: sourceCardVariant(props.panel_style),
      gridCardSize: props.panel_padding === "large" ? "large" : props.panel_padding === "small" ? "small" : props.panel_padding === "default" ? "default" : "none",
      gridCardHover: props.panel_style === "card-hover",
      gridMediaPlacement: props.image_align === "left" || props.image_align === "right" ? props.image_align : "top",
      gridItemAlign: sourceAlignment(props.text_align),
      gridGap: typeof props.grid_column_gap === "string" ? props.grid_column_gap : undefined,
      gridRowGap: ["none", "small", "medium", "large"].includes(String(props.grid_row_gap))
        ? (props.grid_row_gap as "none" | "small" | "medium" | "large")
        : undefined,
      showDividers: Boolean(props.grid_divider),
      // YOOtheme emits these independently on the Grid track:
      // `grid_column_align` -> uk-flex-center, `grid_row_align` -> uk-flex-middle.
      centerColumns: Boolean(props.grid_column_align),
      centerRows: Boolean(props.grid_row_align),
      columnsPhonePortrait: typeof props.grid_default === "string" ? props.grid_default : undefined,
      columnsPhoneLandscape: typeof props.grid_small === "string" ? props.grid_small : undefined,
      // UIkit's `grid_medium` is the Tablet Landscape tier. Keep it on the
      // matching canonical owner instead of the later Desktop tier.
      columnsTabletLandscape: typeof props.grid_medium === "string" && props.grid_medium !== ""
        ? props.grid_medium
        : undefined,
      gridMediaWidth: props.image_grid_width === "1-3" ? "small" : props.image_grid_width === "1-2" ? "medium" : "large",
      ...normalizeYoothemeMedia(props),
      imageMaxWidth: sourceImageMaxWidth(props),
      imageBorder: asString(props.image_border) ?? "none",
      imageBoxShadow: asString(props.image_box_shadow) ?? "none",
      imageBoxDecoration: asString(props.image_box_decoration) ?? "none",
      imageHoverTransition: asString(props.image_transition) ?? "none",
      linkImage: Boolean(props.link_image),
      buttonLabel: asString(props.link_text) ?? undefined,
      buttonStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
      buttonTarget: props.link_target === "blank" ? "_blank" : "_self",
      size: sourceButtonSize(props.link_size),
      fullWidthButton: props.link_fullwidth === true || props.link_fullwidth === "true",
      linkMarginTop: sourceMargin(props.link_margin),
      textAlign: sourceAlignment(props.text_align),
      ...normalizeYoothemeGridPanelPresentation(props),
    }, props);
  }

  if (type === "panel") {
    if (Object.prototype.hasOwnProperty.call(props, "image") && !resolveYoothemeAssetUrl(props.image)) {
      warnings.push(`${path}: panel image asset could not be resolved and was left empty.`);
    }
    warnUnsupported(path, props, [
      "content", "image", "image_width", "image_height", "image_fit", "image_ratio", "image_position", "image_loading", "link", "link_style", "link_text", "link_target", "link_size", "link_fullwidth", "link_margin", "meta", "meta_style",
      "text_align", "title", "title_element", "panel_style", "panel_padding", "panel_link", "panel_link_hover", "panel_image_no_padding", "height_expand", "panel_expand", "image_align", "image_grid_width",
      "title_align", "meta_align", "meta_element", "title_margin", "link_margin", "margin", "margin_remove_bottom",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "panel"),
      kind: "panel",
      title: asString(props.title) ?? "",
      eyebrow: asString(props.meta) ?? "",
      body: asString(props.content) ?? "",
      imageUrl: resolveYoothemeAssetUrl(props.image),
      imageAlt: asString(props.title) ?? "",
      imageMaxWidth: sourceImageMaxWidth(props),
      imageHeight: asString(props.image_height) ?? undefined,
      ...normalizeYoothemeMedia(props),
      buttonLabel: asString(props.link_text) ?? undefined,
      buttonUrl: asString(props.link) ?? undefined,
      buttonStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
      panelActionStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
      buttonTarget: props.link_target === "blank" ? "_blank" : "_self",
      size: sourceButtonSize(props.link_size),
      panelActionSize: sourceButtonSize(props.link_size),
      fullWidthButton: props.link_fullwidth === true || props.link_fullwidth === "true",
      linkMarginTop: sourceMargin(props.link_margin),
      panelVariant: sourcePanelVariant(props.panel_style),
      // `panelVariant` is the canonical Panel surface owner. `panelStyle`
      // remains a legacy document alias and must not mask an imported Card
      // Primary/Secondary value during rendering.
      panelStyle: typeof props.panel_style === "string" && /^(?:card|tile)-/.test(props.panel_style)
        ? undefined
        : sourcePanelStyle(props.panel_style),
      panelSize: props.panel_padding === "small" || props.panel_padding === "default" || props.panel_padding === "large"
        ? props.panel_padding
        : "none",
      panelImageNoPadding: props.panel_image_no_padding === true || props.panel_image_no_padding === "true",
      linkPanel: props.panel_link === true || props.panel_link === "true",
      panelHover: props.panel_link_hover === true || props.panel_link_hover === "true" || props.panel_style === "card-hover",
      panelHeightExpand: props.height_expand === true || props.height_expand === "true",
      panelExpand: props.panel_expand === "image" || props.panel_expand === "content" || props.panel_expand === "both"
        ? props.panel_expand
        : "none",
      panelMetaPosition: props.meta_align === "above-title" || props.meta_align === "below-title" || props.meta_align === "above-content" || props.meta_align === "below-content"
        ? props.meta_align
        : undefined,
      panelShowMedia: Boolean(props.image),
      panelMediaPlacement: props.image_align === "left" || props.image_align === "right" ? props.image_align : "top",
      panelMediaWidth: props.image_grid_width === "1-2" ? "medium" : "large",
      panelTextAlign: sourceAlignment(props.text_align),
      panelTitleElement: sourceHeadingLevel(props.title_element) as "h2" | "h3" | "h4" | "div" | undefined,
      ...normalizeYoothemeGridPanelPresentation(props),
    }, props);
  }

  if (type === "alert") {
    const style = asString(props.alert_style);
    warnUnsupported(path, props, [
      "title", "content", "link", "link_target", "alert_style", "alert_size",
      "title_style", "title_element", "title_inline", "content_style", "content_margin",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "alert"),
      kind: "alert",
      title: asString(props.title) ?? "",
      body: sanitizeHtml(asString(props.content) ?? ""),
      alertStyle: ["primary", "success", "warning", "danger"].includes(style ?? "") ? style as "primary" | "success" | "warning" | "danger" : undefined,
      alertLarge: props.alert_size === true || props.alert_size === "true",
      alertTitleElement: sourceHeadingLevel(props.title_element) ?? "h3",
      alertTitleStyle: sourceHeadingSize(props.title_style),
      alertTitleInline: props.title_inline === true || props.title_inline === "true",
      alertContentStyle: sourceTextVariant(props.content_style),
      alertContentMargin: sourceMargin(props.content_margin),
      alertLinkUrl: asString(props.link) ?? undefined,
      alertLinkTarget: props.link_target === "blank" ? "_blank" : "_self",
    }, props);
  }

  if (type === "icon") {
    const sourceIcon = asString(props.icon);
    const icon = resolveUikitIconName(sourceIcon);
    if (sourceIcon && !icon) {
      warnings.push(path + ".icon: '" + sourceIcon + "' is unavailable in the canonical WebPages UIkit icon registry and was not substituted.");
    }
    const color = asString(props.icon_color);
    const linkStyle = asString(props.link_style);
    warnUnsupported(path, props, [
      "icon", "link", "link_target", "link_aria_label", "icon_color", "icon_width", "link_style",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "icon"),
      kind: "icon",
      iconName: icon ?? undefined,
      icon: icon ?? undefined,
      iconSize: Number.isFinite(Number(props.icon_width)) ? Number(props.icon_width) : undefined,
      iconColorScheme: ["muted", "emphasis", "primary", "secondary", "success", "warning", "danger"].includes(color ?? "") ? color : "default",
      iconLinkUrl: asString(props.link) ?? undefined,
      iconLinkTarget: props.link_target === "blank" ? "_blank" : "_self",
      iconLinkAriaLabel: asString(props.link_aria_label) ?? undefined,
      iconLinkStyle: ["button", "link", "muted", "text", "reset"].includes(linkStyle ?? "") ? linkStyle : "icon",
    }, props);
  }

  if (type === "list") {
    const listItems = sourceChildren(node)
      .filter((child) => child.type === "list_item")
      .map((child, index) => {
        const item = sourceProps(child);
        const sourceIcon = asString(item.icon);
        const icon = resolveUikitIconName(sourceIcon);
        if (sourceIcon && !icon) warnings.push(path + "." + index + ".icon: '" + sourceIcon + "' is unavailable in the canonical WebPages UIkit icon registry and was not substituted.");
        ["image", "image_alt", "image_focal_point", "icon_color"].forEach((key) => {
          if (item[key] !== undefined && item[key] !== "" && item[key] !== false) {
            warnings.push(path + "." + index + "." + key + ": DEFERRED — List item media/icon-color runtime has no canonical consumer yet.");
          }
        });
        return {
          id: sourcePathId(path + "." + index, "list-item"),
          text: sanitizeHtml(asString(item.content) ?? ""),
          url: asString(item.link) ?? undefined,
          target: (item.link_target === "blank" ? "_blank" : "_self") as "_blank" | "_self",
          iconName: icon ?? undefined,
        };
      });
    const marker = asString(props.list_marker);
    const presentation = asString(props.list_style);
    const size = asString(props.list_size);
    warnUnsupported(path, props, [
      "content", "show_image", "show_link", "list_type", "list_marker", "list_marker_color",
      "list_style", "list_size", "list_horizontal_separator", "list_element", "html_element",
      "content_style", "icon", "icon_color", "icon_width", "link_style",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    // Image framing/SVG animation and responsive columns remain intentionally
    // unclaimed until List has an exact shared media/column runtime owner.
    ["image_width", "image_height", "image_loading", "image_border", "image_svg_inline", "image_svg_animate", "image_svg_color", "image_align", "image_vertical_align", "column", "column_divider", "column_breakpoint"].forEach((key) => {
      if (props[key] !== undefined && props[key] !== "" && props[key] !== false) {
        warnings.push(path + "." + key + ": DEFERRED — List media/column runtime has no canonical consumer yet.");
      }
    });
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "list"),
      kind: "list",
      listItems,
      listType: asString(props.list_type) === "horizontal" ? "horizontal" : "vertical",
      listMarker: (["disc", "circle", "square"].includes(marker ?? "") ? marker : "none") as "none" | "disc" | "circle" | "square",
      listMarkerColor: asString(props.list_marker_color) ?? undefined,
      listPresentation: presentation === "divider" || presentation === "striped" ? presentation : "default",
      listSpacing: size === "large" ? "large" : size === "collapse" ? "compact" : "default",
      listHorizontalSeparator: asString(props.list_horizontal_separator) ?? ", ",
      listElement: asString(props.list_element) === "ol" ? "ol" : "ul",
      listWrapNav: props.html_element === true || props.html_element === "true",
      listShowLink: props.show_link !== false,
      contentStyle: sourceTextVariant(props.content_style),
      listShowImage: props.show_image !== false,
      listIcon: (props.show_image !== false ? resolveUikitIconName(asString(props.icon)) ?? undefined : undefined) as any,
      listIconColor: asString(props.icon_color) ?? undefined,
      listIconSize: Number.isFinite(Number(props.icon_width)) ? Number(props.icon_width) : undefined,
      listLinkStyle: asString(props.link_style) ?? "default",
    }, props);
  }

  if (type === "accordion") {
    const items = sourceChildren(node)
      .filter((child) => child.type === "accordion_item")
      .map((child, index) => {
        const item = sourceProps(child);
        const url = asString(item.link);
        return {
          id: sourcePathId(path + "." + index, "accordion-item"),
          title: asString(item.title) ?? "",
          content: sanitizeHtml(asString(item.content) ?? ""),
          imageUrl: asString(item.image) ?? undefined,
          imageAlt: asString(item.image_alt) ?? undefined,
          ...(url ? {
            buttonUrl: url,
            buttonLabel: asString(item.link_text) ?? asString(props.link_text) ?? undefined,
            buttonTarget: props.link_target === true || props.link_target === "true" ? "_blank" : "_self",
          } : {}),
        };
      });
    const imageAlign = asString(props.image_align);
    const unsupportedImageLayout = imageAlign === "left" || imageAlign === "right";
    if (unsupportedImageLayout) warnings.push(path + ".image_align: DEFERRED — Accordion side-media grid layout has no exact canonical runtime yet.");
    if (props.link_style === "danger") warnings.push(path + ".link_style: DEFERRED — the canonical shared Action owner does not yet support UIkit danger buttons.");
    ["content_dropcap", "content_column", "content_column_divider", "content_column_breakpoint", "image_grid_width", "image_grid_column_gap", "image_grid_row_gap", "image_grid_breakpoint", "image_vertical_align", "image_margin", "image_svg_inline", "image_svg_color"].forEach((key) => {
      if (props[key] !== undefined && props[key] !== "" && props[key] !== false) warnings.push(path + "." + key + ": DEFERRED — Accordion has no exact canonical runtime consumer yet.");
    });
    warnUnsupported(path, props, [
      "content", "show_image", "show_link", "multiple", "collapsible", "content_style", "content_margin",
      "image_width", "image_height", "image_loading", "image_border", "image_align",
      "link_text", "link_target", "link_style", "link_size", "link_fullwidth", "link_margin",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "accordion"), kind: "accordion", accordionItems: items as any,
      accordionMultiple: props.multiple === true || props.multiple === "true",
      accordionCollapsible: props.collapsible !== false && props.collapsible !== "false",
      accordionOpenItems: [], accordionTitleLevel: "div",
      accordionShowImage: props.show_image !== false, accordionShowLink: props.show_link !== false,
      accordionContentStyle: sourceTextVariant(props.content_style) ?? "inherit",
      accordionContentMarginTop: props.content_margin === "remove" ? "none" : sourceMargin(props.content_margin) ?? "default",
      imageWidth: Number.isFinite(Number(props.image_width)) ? Number(props.image_width) : undefined,
      imageHeight: Number.isFinite(Number(props.image_height)) ? Number(props.image_height) : undefined,
      imageLoading: props.image_loading === true || props.image_loading === "true" ? "eager" : "lazy",
      imageBorder: asString(props.image_border) || undefined,
      ...(imageAlign === "top" || imageAlign === "bottom" ? { accordionMediaPlacement: imageAlign } : {}),
      accordionLinkText: asString(props.link_text) ?? undefined,
      accordionLinkTarget: props.link_target === true || props.link_target === "true" ? "_blank" : "_self",
      accordionButtonStyle: props.link_style === "danger" ? undefined : sourceButtonStyle(props.link_style),
      accordionButtonSize: sourceButtonSize(props.link_size),
      accordionFullWidth: props.link_fullwidth === true || props.link_fullwidth === "true",
      accordionLinkMargin: props.link_margin === "remove" ? "none" : sourceMargin(props.link_margin) ?? undefined,
    } as any, props);
  }

  if (type === "table") {
    const show = (name: string) => props[`show_${name}`] !== false;
    const order = ({ "1": ["meta", "image", "title", "content", "link"], "2": ["title", "image", "meta", "content", "link"], "3": ["image", "title", "content", "meta", "link"], "4": ["image", "title", "meta", "content", "link"], "5": ["title", "meta", "content", "link", "image"], "6": ["meta", "title", "content", "link", "image"] } as Record<string, string[]>)[asString(props.table_order) ?? "1"] ?? ["meta", "image", "title", "content", "link"];
    const children = sourceChildren(node).filter((child) => child.type === "table_item");
    const hasValue = (field: string) => children.some((child) => Boolean(asString(sourceProps(child)[field])));
    const fields = order.filter((field) => show(field) && hasValue(field));
    const hasAuthoredHeadings = fields.some((field) => Boolean(asString(props[`table_head_${field}`])));
    ["title_style", "title_font_family", "title_color", "meta_style", "meta_color", "content_style", "image_svg_animate"].forEach((key) => {
      if (props[key] !== undefined && props[key] !== "" && props[key] !== false) warnings.push(path + "." + key + ": DEFERRED — Table cell typography/media/action has no exact canonical table-cell consumer yet.");
    });
    warnUnsupported(path, props, [
      "content", "show_title", "show_meta", "show_content", "show_image", "show_link", "table_style", "table_hover", "table_justify", "table_size", "table_order", "table_vertical_align", "table_responsive", "table_last_align", "table_width_title", "table_width_meta", "table_width_content", "table_head_title", "table_head_meta", "table_head_content", "table_head_image", "table_head_link",
      "image_width", "image_height", "image_loading", "image_border", "image_box_shadow", "image_svg_inline", "image_svg_color",
      "link_text", "link_target", "link_style", "link_size", "link_fullwidth",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "table"), kind: "table",
      // Table may have no authored General visual fields, but it is still an
      // imported YOOtheme block. Keep that provenance so its inspector can
      // compose the source-truthful row media/action contract instead of the
      // native CSV-only surface.
      elementPadding: "none",
      spacingContract: "yootheme",
      tableHeadings: hasAuthoredHeadings
        ? fields.map((field) => asString(props[`table_head_${field}`]) ?? "")
        : [],
      tableRows: children.map((child) => {
        const item = sourceProps(child);
        return fields.map((field) => sanitizeHtml(asString(item[field]) ?? ""));
      }),
      tableItems: children.map((child, index) => {
        const item = sourceProps(child);
        const sourceLink = asString(item.link);
        return {
          id: sourcePathId(`${path}.${index}`, "table-item"),
          title: asString(item.title) ?? "",
          meta: asString(item.meta) ?? "",
          content: sanitizeHtml(asString(item.content) ?? ""),
          ...(show("image") && asString(item.image) ? {
            imageUrl: resolveYoothemeAssetUrl(item.image),
            imageAlt: asString(item.image_alt) ?? asString(item.title) ?? "",
          } : {}),
          ...(show("link") && sourceLink ? {
            linkUrl: sourceLink,
            linkLabel: asString(item.link_text) ?? asString(props.link_text) ?? "",
            linkTarget: props.link_target === true || props.link_target === "true" || props.link_target === "blank" ? "_blank" : "_self",
          } : {}),
        };
      }),
      tableColumnFields: fields as any,
      tableShowImage: show("image"), tableShowLink: show("link"),
      tableImageWidth: typeof props.image_width === "number" ? props.image_width : asString(props.image_width) ?? undefined,
      tableImageHeight: typeof props.image_height === "number" ? props.image_height : asString(props.image_height) ?? undefined,
      tableImageLoading: props.image_loading === true || props.image_loading === "true" ? "eager" : "lazy",
      tableImageBorder: asString(props.image_border) || "none",
      tableImageShadow: asString(props.image_box_shadow) || "none",
      tableImageSvgInline: props.image_svg_inline === true || props.image_svg_inline === "true",
      tableImageSvgColor: asString(props.image_svg_color) || undefined,
      tableLinkStyle: asString(props.link_style) || "default",
      tableLinkSize: sourceButtonSize(props.link_size) ?? "default",
      tableLinkFullWidth: props.link_fullwidth === true || props.link_fullwidth === "true",
      tableLinkTarget: props.link_target === true || props.link_target === "true" || props.link_target === "blank" ? "_blank" : "_self",
      tableStyle: asString(props.table_style) === "divider" ? "divider" : asString(props.table_style) === "striped" ? "striped" : "default",
      tableSize: asString(props.table_size) || "default", tableHover: props.table_hover === true || props.table_hover === "true",
      tableJustify: props.table_justify === true || props.table_justify === "true", tableVerticalAlign: props.table_vertical_align === true || props.table_vertical_align === "true",
      tableResponsive: asString(props.table_responsive) === "responsive" ? "responsive" : "overflow",
      tableLastAlign: ["left", "center", "right"].includes(asString(props.table_last_align) ?? "") ? asString(props.table_last_align) : undefined,
    } as any, props);
  }

  if (type === "gallery") {
    const items = sourceChildren(node)
      .filter((child) => child.type === "gallery_item")
      .map((child, index) => {
        const item = sourceProps(child);
        const sourceLink = asString(item.link);
        ["video", "video_title", "hover_image", "hover_video", "text_color", "text_color_hover", "lightbox_image_focal_point", "lightbox_text_color", "image_focal_point", "hover_image_focal_point"].forEach((key) => {
          if (item[key] !== undefined && item[key] !== "" && item[key] !== false) warnings.push(path + "." + index + "." + key + ": DEFERRED — Gallery item runtime has no exact canonical consumer yet.");
        });
        return {
          id: sourcePathId(path + "." + index, "gallery-item"),
          imageUrl: asString(item.image) ?? undefined,
          imageAlt: asString(item.image_alt) ?? undefined,
          title: asString(item.title) ?? "",
          meta: asString(item.meta) ?? "",
          content: sanitizeHtml(asString(item.content) ?? ""),
          tags: asString(item.tags)?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
          ...(sourceLink ? {
            linkUrl: sourceLink,
            linkTarget: props.link_target === "blank" || props.link_target === true || props.link_target === "true" ? "_blank" : "_self",
            linkLabel: asString(item.link_text) ?? asString(props.link_text) ?? undefined,
            linkAriaLabel: asString(item.link_aria_label) ?? asString(props.link_aria_label) ?? undefined,
          } : {}),
        };
      });
    ["grid_parallax", "grid_parallax_justify", "grid_parallax_start", "grid_parallax_end", "grid_small", "grid_large", "grid_xlarge", "filter", "filter_animation", "filter_order", "filter_reverse", "filter_order_manual", "filter_style", "filter_all", "filter_all_label", "filter_position", "filter_style_primary", "filter_align", "filter_margin", "filter_grid_width", "filter_grid_column_gap", "filter_grid_row_gap", "filter_grid_breakpoint", "lightbox_controls", "lightbox_counter", "lightbox_bg_close", "lightbox_animation", "lightbox_nav", "lightbox_image_width", "lightbox_image_height", "lightbox_image_orientation", "lightbox_video_autoplay", "lightbox_text_color", "title_display", "content_display", "image_expand", "overlay_padding", "item_animation"].forEach((key) => {
      if (props[key] !== undefined && props[key] !== "" && props[key] !== false) warnings.push(path + "." + key + ": DEFERRED — Gallery has no exact canonical runtime for this YOOtheme semantic yet.");
    });
    warnUnsupported(path, props, [
      "content", "show_title", "show_meta", "show_content", "show_link", "link_target", "link_text", "link_style", "link_aria_label", "grid_column_gap", "grid_row_gap", "grid_divider", "grid_column_align", "grid_row_align", "overlay_mode", "overlay_link", "show_hover_image", "show_hover_video",
      "lightbox",
      "image_width", "image_height", "image_loading", "image_border", "image_box_shadow", ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "gallery"), kind: "gallery", galleryItems: items,
      gridShowTitle: props.show_title !== false, gridShowMeta: props.show_meta !== false,
      gridShowText: props.show_content !== false, gridShowButton: props.show_link !== false,
      gridShowHoverImage: false, gridShowHoverVideo: false,
      gridGap: props.grid_column_gap === "collapse" ? "none" : sourceMargin(props.grid_column_gap) ?? "medium",
      gridRowGap: props.grid_row_gap === "collapse" ? "none" : sourceMargin(props.grid_row_gap) ?? "medium",
      showDividers: props.grid_divider === true || props.grid_divider === "true",
      columnsPhonePortrait: asString(props.grid_default) || undefined,
      columnsTabletLandscape: asString(props.grid_medium) || undefined,
      masonry: asString(props.grid_masonry) === "pack" ? "pack" : undefined,
      overlayMode: asString(props.overlay_mode) === "caption" ? "caption" : "cover",
      overlayStyle: asString(props.overlay_style) || undefined,
      overlayPosition: asString(props.overlay_position) || undefined,
      overlayHover: props.overlay_hover === true || props.overlay_hover === "true",
      overlayTransition: asString(props.overlay_transition) || undefined,
      overlayLink: props.overlay_link === true || props.overlay_link === "true",
      headingLevel: sourceHeadingLevel(props.title_element) ?? undefined,
      metaStyle: asString(props.meta_style) || undefined,
      textAlign: sourceAlignment(props.text_align),
      enableLightbox: props.lightbox === true || props.lightbox === "true",
      linkText: asString(props.link_text) || undefined,
      buttonStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
      imageWidth: Number.isFinite(Number(props.image_width)) ? Number(props.image_width) : undefined,
      imageHeight: Number.isFinite(Number(props.image_height)) ? Number(props.image_height) : undefined,
      imageLoading: props.image_loading === true || props.image_loading === "true" ? "eager" : "lazy",
      imageBorder: asString(props.image_border) || undefined,
      imageShadow: asString(props.image_box_shadow) || undefined,
      imageBoxShadow: asString(props.image_box_shadow) || undefined,
    } as any, props);
  }

  if (type === "slideshow") {
    const { slides, hasDynamicSource } = sourceStaticSliderItems(node, "slideshow_item", path, props);
    if (reportUnsupportedDynamicSource(path, hasDynamicSource ? { ...props, source: props.source ?? true } : props, slides.length, warnings)) return null;
    warnUnsupported(path, props, [
      "show_title", "show_meta", "show_content", "show_link", "link", "link_target", "link_text", "link_style", "link_size", "link_fullwidth", "link_margin", "margin",
      "slideshow_height", "slideshow_height_viewport", "slideshow_ratio", "slideshow_min_height", "slideshow_max_height", "slideshow_animation", "slideshow_autoplay", "slideshow_autoplay_pause", "slideshow_autoplay_interval",
      "nav", "nav_below", "nav_hover", "nav_vertical", "nav_position", "nav_position_margin", "nav_breakpoint", "show_thumbnail", "thumbnav_width", "thumbnav_height", "thumbnav_wrap", "thumbnav_nowrap", "slidenav", "slidenav_hover", "slidenav_large", "slidenav_margin", "slidenav_breakpoint", "text_color",
      "overlay_position", "overlay_padding", "title_element", "title_style", "meta_align", "meta_element", "meta_style",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    if (props.slideshow_height === "section") {
      warnings.push(`${path}.slideshow_height: INTENTIONALLY UNSUPPORTED for Compatibility Fixture #1 — viewport subtraction requires cross-section layout measurement and has no canonical shared runtime yet.`);
    }
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "slideshow"),
      kind: "slideshow",
      slides,
      carouselSettings: {
        presentation: "slideshow",
        // Presentation remains a hero-style slideshow without inheriting the
        // generic WebPages Hero carousel's synthetic min-height defaults.
        variant: "slideshow",
        slideMode: "hero",
        aspectRatio: asString(props.slideshow_ratio) ?? undefined,
        slideshowRatio: asString(props.slideshow_ratio) ?? undefined,
        slideshowHeight: sourceSlideshowHeight(props.slideshow_height),
        slideshowViewportHeight: Number.isFinite(Number(props.slideshow_height_viewport)) ? Number(props.slideshow_height_viewport) : undefined,
        slideshowMinHeight: Number.isFinite(Number(props.slideshow_min_height)) ? Number(props.slideshow_min_height) : undefined,
        slideshowMaxHeight: Number.isFinite(Number(props.slideshow_max_height)) ? Number(props.slideshow_max_height) : undefined,
        showTitle: props.show_title !== false,
        showMeta: props.show_meta !== false,
        showContent: props.show_content !== false,
        showLink: props.show_link !== false,
        // YOOtheme Slideshow owns the presentation of its item actions at
        // element level. Individual item link_style/link_size remain local
        // overrides in sourceSliderItem; otherwise actions inherit these
        // canonical shared Button values.
        buttonStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
        buttonSize: sourceButtonSize(props.link_size),
        buttonLabel: asString(props.link_text) ?? undefined,
        linkTarget: props.link_target === "blank" ? "_blank" : undefined,
        fullWidthButton: props.link_fullwidth === true || props.link_fullwidth === "true",
        linkMarginTop: sourceMargin(props.link_margin),
        showNavigationThumbnail: props.show_thumbnail !== false,
        elementLinkUrl: asString(props.link) ?? undefined,
        elementLinkTarget: props.link_target === "blank" ? "_blank" : "_self",
        headingLevel: sourceHeadingLevel(props.title_element) ?? "h3",
        headingSize: sourceHeadingSize(props.title_style),
        metaPosition: props.meta_align === "above-title" || props.meta_align === "below-title" || props.meta_align === "below-content"
          ? props.meta_align
          : undefined,
        metaHtmlElement: sourceMetaElement(props.meta_element),
        metaStyle: sourceTextVariant(props.meta_style),
        autoplay: props.slideshow_autoplay === true || props.slideshow_autoplay === "true",
        autoplayDelayMs: Number.isFinite(Number(props.slideshow_autoplay_interval)) ? Number(props.slideshow_autoplay_interval) * 1000 : undefined,
        pauseOnHover: props.slideshow_autoplay_pause !== false,
        // YOOtheme represents an explicitly disabled Slidenav as the string
        // "none". Treat that as false rather than truthy source data.
        showArrows: asString(props.slidenav) !== "none" && Boolean(props.slidenav),
        // Navigation is a distinct YOOtheme Slideshow contract. Do not reduce
        // its source type/position/margin to WebPages' old generic dot style.
        navigationType: props.nav === "dotnav" || props.nav === "thumbnav" ? props.nav : "none",
        showDots: props.nav === "dotnav",
        arrowPosition: asString(props.slidenav) === "default" ? "overlay" : (asString(props.slidenav) === "outside" ? "outer" : asString(props.slidenav) ?? "overlay"),
        paginationPosition: asString(props.nav_position) ?? undefined,
        navigationMargin: asString(props.nav_position_margin) ?? undefined,
        navigationBreakpoint: sourceBreakpoint(props.nav_breakpoint),
        navigationBelow: props.nav_below === true || props.nav_below === "true",
        navigationHoverOnly: props.nav_hover === true || props.nav_hover === "true",
        navigationVertical: props.nav_vertical === true || props.nav_vertical === "true",
        thumbnavWidth: Number.isFinite(Number(props.thumbnav_width)) ? Number(props.thumbnav_width) : undefined,
        thumbnavHeight: Number.isFinite(Number(props.thumbnav_height)) ? Number(props.thumbnav_height) : undefined,
        thumbnavNoWrap: props.thumbnav_nowrap === true || props.thumbnav_nowrap === "true" || props.thumbnav_wrap === false || props.thumbnav_wrap === "false",
        slidenavHoverOnly: props.slidenav_hover === true || props.slidenav_hover === "true",
        slidenavLarger: props.slidenav_large === true || props.slidenav_large === "true",
        slidenavMargin: asString(props.slidenav_margin) ?? undefined,
        slidenavBreakpoint: sourceBreakpoint(props.slidenav_breakpoint),
        effect: props.slideshow_animation === "fade" ? "fade" : "slide",
        overlayPosition: sourceCarouselOverlayPosition(props.overlay_position),
        overlayPadding: sourceCarouselOverlayPadding(props.overlay_padding),
        // Preserve YOOtheme's explicit text context. An omitted/`none` source
        // value inherits the surrounding semantic context rather than being
        // rewritten to a WebPages-specific dark default.
        overlayTextColor: props.text_color === "light" || props.text_color === "dark" ? props.text_color : undefined,
      },
    }, props);
  }

  if (type === "panel-slider") {
    const { slides, hasDynamicSource } = sourceStaticSliderItems(node, "panel-slider_item", path, props, warnings);
    if (reportUnsupportedDynamicSource(path, hasDynamicSource ? { ...props, source: props.source ?? true } : props, slides.length, warnings)) return null;
    const sourceSlidenav = asString(props.slidenav);
    const sourceNavigation = asString(props.nav);
    // Panel Slider's Image Alignment is structural (`top` / `left`) and
    // requires the deferred media-grid layout contract. Do not coerce it into
    // the unrelated shared Image horizontal alignment owner.
    const { imageAlignment: _deferredStructuralImageAlignment, ...panelSliderMedia } = normalizeYoothemeMedia(props);
    warnPanelSliderFields(path, props, warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "panel-slider"),
      kind: "panelSlider",
      slides: slides.map(({ imageAlignment: _deferredItemImageAlignment, ...slide }) => slide),
      carouselSettings: {
        presentation: "panel-slider",
        variant: "panel",
        slideMode: "panel",
        ...panelSliderMedia,
        ...(Object.prototype.hasOwnProperty.call(props, "image_border")
          ? { imageShape: sourceImageBorder(props.image_border) ?? "none" }
          : {}),
        // Panel Slider owns one element-level presentation contract. Item
        // content is deliberately limited to the source item fields rather
        // than becoming a nested WebPages Panel/Card editor.
        showTitle: props.show_title !== false,
        showImage: props.show_image !== false,
        showMeta: props.show_meta !== false,
        showContent: props.show_content !== false,
        showLink: props.show_link !== false,
        metaPosition: props.meta_align === "above-title" || props.meta_align === "below-content"
          ? props.meta_align
          : "below-title",
        metaHtmlElement: sourceMetaElement(props.meta_element) ?? "div",
        metaStyle: asString(props.meta_style) ?? undefined,
        headingLevel: sourceHeadingLevel(props.title_element) ?? "h3",
        headingSize: sourceHeadingSize(props.title_style),
        imageFit: "natural",
        imageRatio: "natural",
        linkPanel: props.panel_link === true || props.panel_link === "true",
        // Panel/card presentation is element-owned in YOOtheme Panel Slider.
        // Preserve an explicitly authored item override from sourceSliderItem,
        // but do not copy these parent values into every item.
        panelStyle: sourceCardVariant(props.panel_style),
        panelSize: props.panel_padding === "small" || props.panel_padding === "default" || props.panel_padding === "large"
          ? props.panel_padding
          : "none",
        panelHover: props.panel_link_hover === true || props.panel_link_hover === "true" || props.panel_style === "card-hover",
        buttonStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
        buttonSize: sourceButtonSize(props.link_size),
        buttonLabel: asString(props.link_text) ?? undefined,
        linkTarget: props.link_target === "blank" ? "_blank" : "_self",
        fullWidthButton: props.link_fullwidth === true || props.link_fullwidth === "true",
        linkMarginTop: sourceMargin(props.link_margin),
        autoplay: props.slider_autoplay === true || props.slider_autoplay === "true",
        autoplayDelayMs: Number.isFinite(Number(props.slider_autoplay_interval)) ? Number(props.slider_autoplay_interval) * 1000 : undefined,
        pauseOnHover: props.slider_autoplay_pause !== false,
        centered: props.slider_center === true || props.slider_center === "true",
        loop: !(props.slider_finite === true || props.slider_finite === "true"),
        spaceBetween: sourceSliderGap(props.slider_gap),
        divider: props.slider_divider === true || props.slider_divider === "true",
        itemWidthMode: props.slider_width === "fixed" ? "fixed" : "auto",
        cardsPerViewPhone: sourceSliderItemsPerView(props.slider_width_default) ?? 1,
        cardsPerViewSmall: sourceSliderItemsPerView(props.slider_width_small),
        cardsPerViewMedium: sourceSliderItemsPerView(props.slider_width_medium),
        cardsPerViewLarge: sourceSliderItemsPerView(props.slider_width_large),
        cardsPerViewXLarge: sourceSliderItemsPerView(props.slider_width_xlarge),
        // Source values are semantic strings, not truthy flags: `none` must
        // suppress the shared controls, while UIkit's `default`/`outside`
        // normalize to the established CarouselBlock presentation contract.
        showArrows: Boolean(sourceSlidenav && sourceSlidenav !== "none"),
        showDots: sourceNavigation === "dotnav",
        navigationType: sourceNavigation === "dotnav" ? "dotnav" : "none",
        arrowPosition: sourceSlidenav === "outside" ? "outer" : sourceSlidenav === "default" ? "overlay" : undefined,
        slidenavMargin: asString(props.slidenav_margin) ?? undefined,
        slidenavBreakpoint: sourceBreakpoint(props.slidenav_breakpoint),
        paginationPosition: asString(props.nav_position) ?? undefined,
        effect: "slide",
      },
    }, props);
  }

  if (type === "overlay-slider") {
    const { slides, hasDynamicSource } = sourceStaticSliderItems(node, "overlay-slider_item", path, props);
    if (reportUnsupportedDynamicSource(path, hasDynamicSource ? { ...props, source: props.source ?? true } : props, slides.length, warnings)) return null;
    warnUnsupported(path, props, [
      "show_content", "show_link", "show_meta", "show_title", "nav", "nav_below", "nav_position", "nav_position_margin", "nav_breakpoint", "slidenav", "slidenav_margin", "slidenav_breakpoint", "slider_autoplay_pause", "slider_center", "slider_autoplay", "slider_autoplay_interval", "slider_finite",
      "slider_divider", "slider_gap", "slider_width", "slider_width_default", "slider_width_small", "slider_width_medium", "slider_width_large", "slider_width_xlarge", "overlay_mode", "overlay_display", "overlay_position", "overlay_padding", "overlay_style", "text_color", "text_align", "title_element", "title_style", "meta_align", "meta_element", "meta_style", "link_text", "link_style", "link_size", "link_target", "link_margin", "margin", "visibility",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "overlay-slider"),
      kind: "overlaySlider",
      slides,
      carouselSettings: {
        presentation: "overlay-slider",
        variant: "overlay",
        slideMode: "overlay",
        showTitle: props.show_title !== false,
        showMeta: props.show_meta !== false,
        showContent: props.show_content !== false,
        showLink: props.show_link !== false,
        itemWidthMode: props.slider_width === "fixed" ? "fixed" : "auto",
        autoplay: props.slider_autoplay === true || props.slider_autoplay === "true",
        autoplayDelayMs: Number.isFinite(Number(props.slider_autoplay_interval)) ? Number(props.slider_autoplay_interval) * 1000 : undefined,
        pauseOnHover: props.slider_autoplay_pause !== false,
        centered: props.slider_center === true || props.slider_center === "true",
        loop: !(props.slider_finite === true || props.slider_finite === "true"),
        spaceBetween: sourceSliderGap(props.slider_gap),
        divider: props.slider_divider === true || props.slider_divider === "true",
        cardsPerViewPhone: sourceSliderItemsPerView(props.slider_width_default) ?? 1,
        cardsPerViewSmall: sourceSliderItemsPerView(props.slider_width_small),
        cardsPerViewMedium: sourceSliderItemsPerView(props.slider_width_medium),
        cardsPerViewLarge: sourceSliderItemsPerView(props.slider_width_large ?? props.slider_width_xlarge),
        showArrows: Boolean(props.slidenav),
        showDots: props.nav === "dotnav",
        navigationType: props.nav === "dotnav" ? "dotnav" : "none",
        navigationBelow: props.nav_below === true || props.nav_below === "true",
        navigationMargin: sourceMargin(props.nav_position_margin) ?? "default",
        navigationBreakpoint: sourceBreakpoint(props.nav_breakpoint),
        arrowPosition: asString(props.slidenav) === "outside" ? "outside" : asString(props.slidenav) === "" ? "none" : "overlay",
        slidenavMargin: asString(props.slidenav_margin) ?? "medium",
        paginationPosition: asString(props.nav_position) ?? undefined,
        slidenavBreakpoint: sourceBreakpoint(props.slidenav_breakpoint),
        headingLevel: sourceHeadingLevel(props.title_element),
        headingSize: sourceHeadingSize(props.title_style),
        metaPosition: props.meta_align === "above-title" || props.meta_align === "below-content" ? props.meta_align : "below-title",
        metaHtmlElement: sourceMetaElement(props.meta_element) ?? "div",
        metaStyle: sourceTextVariant(props.meta_style),
        buttonLabel: asString(props.link_text) ?? undefined,
        buttonStyle: sourceButtonStyle(props.link_style),
        buttonSize: sourceButtonSize(props.link_size),
        linkTarget: props.link_target === "blank" ? "_blank" : "_self",
        linkMarginTop: sourceMargin(props.link_margin),
        effect: "slide",
        overlayMode: props.overlay_mode === "caption" ? "caption" : "cover",
        overlayDisplay: sourceCarouselOverlayDisplay(props.overlay_display),
        overlayPosition: sourceCarouselOverlayPosition(props.overlay_position),
        overlayPadding: sourceCarouselOverlayPadding(props.overlay_padding),
        overlayStyle: ["default", "primary", "tile-default", "tile-muted", "tile-primary", "tile-secondary"].includes(asString(props.overlay_style) ?? "")
          ? asString(props.overlay_style)
          : "none",
        overlayTextColor: props.text_color === "light" || props.text_color === "dark" ? props.text_color : undefined,
      },
    }, props);
  }

  if (mapYoothemeElementType(type)) {
    warnings.push(`${path}: '${type}' is recognized but has no canonical WebPages consumer mapping.`);
  } else if (!isYoothemeStructuralType(type)) {
    warnings.push(`${path}: source node '${type}' is unsupported and was not imported.`);
  }
  return null;
};

/**
 * Maps only the source hierarchy to the existing WebPages section/row/column
 * primitives. Element fields are intentionally left for the next phase.
 */
export const mapYoothemeStructure = (
  source: unknown,
): YoothemeStructuralMapping => {
  const root =
    typeof source === "object" && source !== null
      ? (source as YoothemeSourceNode)
      : null;
  const sections: YoothemeStructuralSection[] = [];
  const warnings: string[] = [];

  sourceChildren(root ?? {}).forEach((sectionNode, sectionIndex) => {
    if (sectionNode.type !== "section") return;

    const rows = sourceChildren(sectionNode).filter(
      (node) => node.type === "row",
    );
    const layoutItems: YoothemeStructuralColumn[] = [];

    rows.forEach((rowNode, rowIndex) => {
      const columns = sourceChildren(rowNode).filter(
        (node) => node.type === "column",
      );
      const rowId = `yootheme-section-${sectionIndex + 1}-row-${rowIndex + 1}`;
      const rowLayout = LAYOUT_BY_COLUMN_COUNT[columns.length];

      if (!rowLayout) {
        warnings.push(
          `Section ${sectionIndex + 1}, row ${rowIndex + 1} has ${columns.length} columns; WebPages supports 1–6 canonical columns.`,
        );
      }

      columns.forEach((_, columnIndex) => {
        layoutItems.push({
          id: `${rowId}-column-${columnIndex + 1}`,
          sourceIndex: columnIndex,
          rowId,
          rowLayout: rowLayout ?? "1-col",
        });
      });
    });

    if (rows.length === 0) {
      warnings.push(`Section ${sectionIndex + 1} has no rows.`);
    }

    sections.push({
      id: `yootheme-section-${sectionIndex + 1}`,
      sourceIndex: sectionIndex,
      kind: "contentLayout",
      title: sourceName(sectionNode, `Imported Section ${sectionIndex + 1}`),
      background: "transparent",
      layout: rows.length === 1 ? layoutItems[0]?.rowLayout : undefined,
      layoutColumns:
        rows.length === 1
          ? layoutItems.filter((item) => item.rowId === layoutItems[0]?.rowId)
              .length
          : 0,
      layoutRows: rows.length,
      layoutItems,
    });
  });

  if (!root || root.type !== "layout") {
    warnings.unshift("The source root is not a YOOtheme layout export.");
  }
  if (sections.length === 0) {
    warnings.push("The source contains no top-level sections to map.");
  }

  return { sections, warnings };
};

/**
 * Maps static source elements onto existing shared consumer paths and the
 * WebPages document shape. This is intentionally a pure mapper: callers still
 * decide when and where a document is persisted, and source asset paths are
 * normalized to valid root-relative browser URLs until the asset-import phase.
 */
export const mapYoothemeStaticContent = (
  source: unknown,
): YoothemeStaticImportMapping => {
  const root =
    typeof source === "object" && source !== null
      ? (source as YoothemeSourceNode)
      : null;
  const structure = mapYoothemeStructure(source);
  const warnings = [...structure.warnings];

  if (!root || root.type !== "layout") {
    const report = createYoothemePageImportReport(source);
    return { sections: [], warnings, globalStylePatch: {}, report, reportWarnings: formatYoothemeImportWarnings(report) };
  }

  const sections: BuilderSection[] = [];
  sourceChildren(root).forEach((sectionNode, sectionIndex) => {
    if (sectionNode.type !== "section") return;
    const structureSection = structure.sections[sectionIndex];
    if (!structureSection) return;

    const layoutItems: NonNullable<BuilderSection["layoutItems"]> = [];
    let layoutItemIndex = 0;
    sourceChildren(sectionNode)
      .filter((node) => node.type === "row")
      .forEach((rowNode, rowIndex) => {
        const columns = sourceChildren(rowNode).filter(
          (node) => node.type === "column",
        );
        const rowId = `yootheme-section-${sectionIndex + 1}-row-${rowIndex + 1}`;
        const rowLayout = LAYOUT_BY_COLUMN_COUNT[columns.length] ?? "1-col";

        columns.forEach((columnNode, columnIndex) => {
          const blocks = sourceChildren(columnNode)
            .map((node, childIndex) =>
              mapStaticElement(
                node,
                `${sectionIndex}.${rowIndex}.${columnIndex}.${childIndex}`,
                warnings,
              ),
            )
            .filter((block): block is BuilderLayoutBlock => Boolean(block));
          layoutItems.push({
            id: `${rowId}-column-${columnIndex + 1}`,
            rowId,
            rowLayout,
            blocks,
          });
          layoutItemIndex += 1;
        });
      });

    if (layoutItemIndex === 0) {
      warnings.push(`Section ${sectionIndex + 1} has no importable columns.`);
    }

    const sectionProps = sourceProps(sectionNode);
    const normalizedSection = normalizeYoothemeSection(sectionProps);

    sections.push({
      id: structureSection.id,
      kind: "contentLayout",
      title: structureSection.title,
      background: structureSection.background,
      ...normalizedSection,
      preserveColor: Boolean(sectionProps.preserve_color),
      overlap: Boolean(sectionProps.overlap),
      textColor: sectionProps.text_color === "light" || sectionProps.text_color === "dark" ? sectionProps.text_color : "none",
      contentMode: normalizedSection.contentMode ?? "boxed",
      maxWidth: normalizedSection.maxWidth ?? "default",
      removeHorizontalPadding: normalizedSection.removeHorizontalPadding ?? Boolean(sectionProps.padding_remove_horizontal),
      expandOneSide: sectionProps.expand === "left" || sectionProps.expand === "right" ? sectionProps.expand : "none",
      sectionHeight: normalizedSection.sectionHeight ?? "auto",
      heightOffset: normalizedSection.heightOffset,
      subtractHeightAbove: normalizedSection.subtractHeightAbove,
      contentVerticalAlign: normalizedSection.contentVerticalAlign ?? "top",
      sectionPadding: normalizedSection.sectionPadding ?? "default",
      removeTopPadding: normalizedSection.removeTopPadding,
      removeBottomPadding: normalizedSection.removeBottomPadding,
      // Do not copy global section padding into legacy local spacing fields:
      // imported sections must keep inheriting the canonical Global Style token.
      htmlElement: (["div", "section", "header", "footer", "aside", "main"].includes(sectionProps.html_element as string) ? sectionProps.html_element : "div") as any,
      stickyEffect: sectionProps.sticky === "cover" || sectionProps.sticky === "reveal" ? sectionProps.sticky : "none",
      headerTransparent: sectionProps.header_transparent === "transparent" || sectionProps.header_transparent === "pull" || Boolean(sectionProps.header_transparent),
      pullUnderHeader: sectionProps.header_transparent === "pull",
      headerTextColor: sectionProps.header_transparent_color === "light" || sectionProps.header_transparent_color === "dark" ? sectionProps.header_transparent_color : "none",
      animation: sourceAnimation(sectionProps.animation) as any,
      animationDelay: sectionProps.animation_delay ? Number(sectionProps.animation_delay) : undefined,
      sectionTitlePosition: typeof sectionProps.title_position === "string" ? sectionProps.title_position : undefined,
      sectionTitleRotation: sectionProps.title_rotation === "left" || sectionProps.title_rotation === "right" ? sectionProps.title_rotation : "none",
      sectionTitleBreakpoint: typeof sectionProps.title_breakpoint === "string" ? sectionProps.title_breakpoint : undefined,
      visible: true,
      layout: structureSection.layout ?? layoutItems[0]?.rowLayout,
      layoutColumns:
        structureSection.layoutColumns ||
        layoutItems.filter((item) => item.rowId === layoutItems[0]?.rowId).length,
      layoutRows: structureSection.layoutRows,
      layoutItems,
    });
  });

  const report = createYoothemePageImportReport(source);
  return { sections, warnings, globalStylePatch: sourceGlobalBackgroundPatch(root), report, reportWarnings: formatYoothemeImportWarnings(report) };
};

export const analyzeYoothemeLayout = (
  source: unknown,
): YoothemeImportAnalysis => {
  const root =
    typeof source === "object" && source !== null
      ? (source as YoothemeSourceNode)
      : null;
  const nodeCounts: Record<string, number> = {};
  const supportedElements: YoothemeImportAnalysis["supportedElements"] = [];
  const unsupported = new Set<string>();

  const visit = (node: YoothemeSourceNode): void => {
    const sourceType = asString(node.type);
    if (!sourceType) return;

    nodeCounts[sourceType] = (nodeCounts[sourceType] ?? 0) + 1;

    const kind = mapYoothemeElementType(sourceType);
    if (kind) {
      supportedElements.push({ sourceType, kind });
    } else if (!isYoothemeStructuralType(sourceType)) {
      unsupported.add(sourceType);
    }

    asChildren(node.children).forEach(visit);
  };

  if (root) visit(root);

  return {
    rootType: asString(root?.type),
    sourceVersion: root ? asString(root.version) : null,
    nodeCounts,
    supportedElements,
    unsupportedTypes: [...unsupported].sort(),
  };
};
