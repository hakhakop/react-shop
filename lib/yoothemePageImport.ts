import type {
  BuilderLayoutBlock,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { sanitizeHtml } from "@/lib/safeHtml";
import {
  normalizeYoothemeMedia,
  normalizeYoothemeGridPanelPresentation,
  normalizeYoothemeSection,
  normalizeYoothemeTemplateGlobals,
  normalizeYoothemeTypography,
  normalizeYoothemeTypographyRole,
  normalizeYoothemeTextPresentation,
} from "@/lib/yoothemeImportContract";

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
  if (!normalized || normalized === "none" || normalized === "parallax") return normalized || undefined;
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
    ...(maxWidth ? { effects: { maxWidth } } : {}),
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
        ["default", "primary", "secondary", "text", "link"].includes(String(value))
          ? sourceButtonStyle(value)
          : undefined, "UIkit token"],
      ["link_style", (value) =>
        ["default", "primary", "secondary", "text", "link"].includes(String(value))
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
): "primary" | "secondary" | "default" | "text" => {
  if (value === "primary") return "primary";
  if (value === "secondary") return "secondary";
  // `link` is a YOOtheme presentation alias for the canonical UIkit Text
  // button. Do not store either semantic in the historic ghost/outline set.
  if (value === "text" || value === "link") return "text";
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
  const props = { ...parentProps, ...sourceProps(node) };
  const media = normalizeYoothemeMedia(props);
  const actionLabel = asString(props.link_text);
  const actionUrl = asString(props.link);
  return {
    id: sourcePathId(path, "panel-slide"),
    title: asString(props.title) ?? "",
    meta: asString(props.meta) ?? "",
    text: asString(props.content) ?? "",
    imageUrl: resolveYoothemeAssetUrl(props.image),
    imageAlt: asString(props.image_alt) ?? asString(props.title) ?? "",
    imageWidth: asString(props.image_width) ?? undefined,
    imageHeight: asString(props.image_height) ?? undefined,
    imageFit: media.imageFit,
    imageRatio: media.imageRatio,
    imageAlignment: media.imageAlignment,
    imagePosition: media.imagePosition,
    imageLoading: media.imageLoading,
    headingLevel: sourceHeadingLevel(props.title_element) ?? "h3",
    metaStyle: sourceTextVariant(props.meta_style) ?? "muted",
    // YOOtheme distinguishes a whole-panel link from a visible link/button.
    // Do not manufacture a default action when `link_text` is intentionally
    // empty; `panel_link` still makes the title/media panel interactive.
    showAction: Boolean(actionUrl && actionLabel),
    buttonLabel: actionLabel ?? undefined,
    buttonUrl: actionUrl ?? undefined,
    buttonTarget: props.link_target === "blank" ? "_blank" : "_self",
    buttonStyle: sourceButtonStyle(props.link_style),
    linkPanel: props.panel_link === true || props.panel_link === "true",
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
) => {
  const items = sourceChildren(node).filter((child) => child.type === itemType);
  const hasDynamicItemSource = items.some(hasDynamicSourceBinding);
  const slides = items
    .filter((child) => !hasDynamicSourceBinding(child) || hasStaticSliderFallback(child))
    .map((child, index) => sourceSliderItem(child, `${path}.${index}`, parentProps));
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
      imageLinkUrl: asString(props.link) ?? undefined,
      imageLinkTarget: props.link ? linkTarget : undefined,
      imageShape: props.image_border === "rounded" || props.image_border === "circle" || props.image_border === "pill"
        ? props.image_border
        : "none",
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
      // YOOtheme's grid_column_align is its Vertical Alignment toggle.
      centerRows: Boolean(props.grid_column_align),
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

  if (type === "slideshow") {
    const { slides, hasDynamicSource } = sourceStaticSliderItems(node, "slideshow_item", path, props);
    if (reportUnsupportedDynamicSource(path, hasDynamicSource ? { ...props, source: props.source ?? true } : props, slides.length, warnings)) return null;
    warnUnsupported(path, props, [
      "show_title", "show_meta", "show_content", "show_link",
      "slideshow_height", "slideshow_ratio", "slideshow_animation", "slideshow_autoplay", "slideshow_autoplay_pause", "slideshow_autoplay_interval",
      "nav", "nav_position", "nav_breakpoint", "slidenav", "slidenav_breakpoint", "slidenav_outside_breakpoint", "text_color",
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
        slideshowMinHeight: Number.isFinite(Number(props.slideshow_min_height)) ? Number(props.slideshow_min_height) : undefined,
        showTitle: props.show_title !== false,
        showMeta: props.show_meta !== false,
        showContent: props.show_content !== false,
        showLink: props.show_link !== false,
        autoplay: props.slideshow_autoplay === true || props.slideshow_autoplay === "true",
        autoplayDelayMs: Number.isFinite(Number(props.slideshow_autoplay_interval)) ? Number(props.slideshow_autoplay_interval) * 1000 : undefined,
        pauseOnHover: props.slideshow_autoplay_pause !== false,
        showArrows: Boolean(props.slidenav),
        showDots: Boolean(props.nav),
        arrowPosition: asString(props.slidenav) === "outside" ? "outer" : "overlay",
        paginationPosition: asString(props.nav_position) ?? undefined,
        effect: props.slideshow_animation === "fade" ? "fade" : "slide",
        overlayTextColor: props.text_color === "light" || props.text_color === "dark" ? props.text_color : undefined,
      },
    }, props);
  }

  if (type === "panel-slider") {
    const { slides, hasDynamicSource } = sourceStaticSliderItems(node, "panel-slider_item", path, props);
    if (reportUnsupportedDynamicSource(path, hasDynamicSource ? { ...props, source: props.source ?? true } : props, slides.length, warnings)) return null;
    warnUnsupported(path, props, [
      "slider_autoplay", "slider_autoplay_pause", "slider_autoplay_interval", "slider_finite", "slider_gap", "slider_divider", "slider_width_default", "slider_width_small", "slider_width_medium", "slider_width_large", "slider_width_xlarge", "slider_center", "nav", "nav_align", "nav_position", "nav_breakpoint", "slidenav", "slidenav_breakpoint", "slidenav_outside_breakpoint", "text_align", "margin", "margin_remove_bottom",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "panel-slider"),
      kind: "panelSlider",
      slides: slides.map((slide) => ({
        ...slide,
        // Panel Slider has no implicit Card surface in UIkit. Only an
        // explicit source panel style may opt into a Card presentation.
        panelStyle: sourceCardVariant(props.panel_style),
        panelSize: props.panel_padding === "small" || props.panel_padding === "default" || props.panel_padding === "large"
          ? props.panel_padding
          : "none",
      })),
      carouselSettings: {
        presentation: "panel-slider",
        variant: "panel",
        slideMode: "panel",
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
        showDots: Boolean(props.nav),
        arrowPosition: asString(props.slidenav) ?? undefined,
        paginationPosition: asString(props.nav_position) ?? undefined,
        effect: "slide",
      },
    }, props);
  }

  if (type === "overlay-slider") {
    const { slides, hasDynamicSource } = sourceStaticSliderItems(node, "overlay-slider_item", path, props);
    if (reportUnsupportedDynamicSource(path, hasDynamicSource ? { ...props, source: props.source ?? true } : props, slides.length, warnings)) return null;
    warnUnsupported(path, props, [
      "show_content", "show_link", "show_meta", "show_title", "nav", "nav_align", "nav_position", "slidenav", "slider_autoplay_pause", "slider_center", "slider_autoplay", "slider_autoplay_interval", "slider_finite",
      "slider_divider", "slider_gap", "slider_width_default", "slider_width_small", "slider_width_medium", "slider_width_large", "slider_width_xlarge", "overlay_mode", "overlay_display", "overlay_position", "overlay_padding", "text_color", "text_align", "title_element", "margin", "visibility",
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
        showDots: Boolean(props.nav),
        arrowPosition: asString(props.slidenav) === "outside" ? "outer" : "overlay",
        paginationPosition: asString(props.nav_position) ?? undefined,
        effect: "slide",
        overlayMode: props.overlay_mode === "caption" ? "caption" : "cover",
        overlayDisplay: sourceCarouselOverlayDisplay(props.overlay_display),
        overlayPosition: sourceCarouselOverlayPosition(props.overlay_position),
        overlayPadding: sourceCarouselOverlayPadding(props.overlay_padding),
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
    return { sections: [], warnings, globalStylePatch: {} };
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
      animation: typeof sectionProps.animation === "string" && sectionProps.animation !== "none" ? (sectionProps.animation as any) : undefined,
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

  return { sections, warnings, globalStylePatch: sourceGlobalBackgroundPatch(root) };
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
