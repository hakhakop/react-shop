import type {
  BuilderLayoutBlock,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";

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
};

export type YoothemeGlobalStyleBoundary = {
  hasSourceGlobalSettings: boolean;
  mapped: Array<{
    path: string;
    sourceKey: string;
    sourceValue: string;
    owner: "WebPages Global Styles" | "UIkit token";
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
  "overlay-slider": "panelSlider",
  "overlay-slider_item": "panelSlider",
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

const sourcePosition = (
  value: unknown,
): NonNullable<NonNullable<BuilderVisualStyle>["layout"]>["position"] => {
  if (value === "static" || value === "relative" || value === "absolute") {
    return value;
  }
  return undefined;
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

  if (!position && !top && !right && !bottom && !left && zIndex === undefined) {
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
    },
  };
};

const withSourceGeneralVisualStyle = <T extends BuilderLayoutBlock>(
  block: T,
  props: Record<string, unknown>,
): T => {
  const visualStyle = sourceGeneralVisualStyle(props);
  return visualStyle ? { ...block, visualStyle } : block;
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
  owner: "WebPages Global Styles" | "UIkit token",
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

    ["font_family", "font_size", "font_weight", "letter_spacing", "color"].forEach(
      (sourceKey) => {
        reportUnmappedStyleValue(
          boundary,
          path,
          sourceKey,
          props[sourceKey],
          "Concrete source appearance requires an existing Global Settings owner before import.",
        );
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
  typeof value === "string" && /^h[1-6]$/.test(value)
    ? (value as BuilderLayoutBlock["headingLevel"])
    : undefined;

const sourceHeadingSize = (
  value: unknown,
): BuilderLayoutBlock["headingSize"] | undefined => {
  if (typeof value !== "string") return undefined;
  if (["h1", "h2", "h3", "h4", "h5", "h6", "small", "medium", "large", "xlarge"].includes(value)) {
    return value as BuilderLayoutBlock["headingSize"];
  }
  if (value === "heading-small") return "small";
  if (value === "heading-medium") return "medium";
  if (value === "heading-large") return "large";
  if (value === "heading-xlarge") return "xlarge";
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
): NonNullable<BuilderLayoutBlock["buttons"]>[number]["style"] => {
  if (value === "primary") return "primary";
  if (value === "text" || value === "link") return "ghost";
  if (value === "secondary") return "secondary";
  return "outline";
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
  const normalized = typeof value === "string" ? value.replace(/^(?:card|tile)-/, "") : "default";
  return normalized === "primary" || normalized === "secondary" || normalized === "blank"
    ? normalized
    : "default";
};

const sourceGridButtonStyle = (
  value: unknown,
): NonNullable<NonNullable<BuilderLayoutBlock["gridItems"]>[number]["buttonStyle"]> | undefined => {
  if (value === undefined || value === null || value === "") return undefined;
  const style = sourceButtonStyle(value);
  return style === "light" ? "link" : style;
};

const sourceGridItem = (
  node: YoothemeSourceNode,
  path: string,
  parentProps: Record<string, unknown>,
  warnings: string[],
): NonNullable<BuilderLayoutBlock["gridItems"]>[number] => {
  const props = sourceProps(node);
  const panelStyle = sourcePanelStyle(props.panel_style ?? parentProps.panel_style);
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
    title: asString(props.title) ?? "",
    meta: asString(props.meta) ?? "",
    text: asString(props.content) ?? "",
    buttonLabel: asString(props.link_text) ?? asString(parentProps.link_text) ?? undefined,
    buttonUrl: asString(props.link) ?? undefined,
    buttonStyle: sourceGridButtonStyle(props.link_style),
    buttonTarget: props.link_target === "blank" ? "_blank" : "_self",
    renderer: panelStyle ? "card" : "plain",
    cardVariant: sourceCardVariant(props.panel_style ?? parentProps.panel_style),
    mediaPlacement: props.image_align === "left" || props.image_align === "right" ? props.image_align : "top",
    mediaFit: props.image_fit === "contain" ? "contain" : "cover",
    textAlign: sourceAlignment(props.text_align ?? parentProps.text_align),
    titleElement: sourceHeadingLevel(props.title_element ?? parentProps.title_element) as "h2" | "h3" | "h4" | "div" | undefined,
    titleStyle: sourceHeadingSize(props.title_style ?? parentProps.title_style) as "inherit" | "h3" | "h4" | "h5" | undefined,
  };
};

const sourceSliderItem = (
  node: YoothemeSourceNode,
  path: string,
): NonNullable<BuilderSection["slides"]>[number] => {
  const props = sourceProps(node);
  return {
    id: sourcePathId(path, "panel-slide"),
    title: asString(props.title) ?? "",
    meta: asString(props.meta) ?? "",
    text: asString(props.content) ?? "",
    imageUrl: resolveYoothemeAssetUrl(props.image),
    imageAlt: asString(props.image_alt) ?? asString(props.title) ?? "",
    headingLevel: sourceHeadingLevel(props.title_element) ?? "h3",
    metaStyle: sourceTextVariant(props.meta_style) ?? "muted",
    showAction: Boolean(props.link),
    buttonLabel: asString(props.link_text) ?? "Read more",
    buttonUrl: asString(props.link) ?? "#",
    buttonTarget: props.link_target === "blank" ? "_blank" : "_self",
    buttonStyle: sourceButtonStyle(props.link_style),
  };
};

const warnUnsupported = (
  path: string,
  props: Record<string, unknown>,
  supported: string[],
  warnings: string[],
) => {
  const unsupported = Object.keys(props).filter((key) => !supported.includes(key));
  if (unsupported.length > 0) {
    warnings.push(`${path}: source options not represented by the canonical WebPages consumer: ${unsupported.join(", ")}.`);
  }
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
      warnings.push(`${path}: semantic level '${String(props.title_element)}' has no direct WebPages heading equivalent.`);
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
    }, props);
  }

  if (type === "button") {
    const items = sourceChildren(node)
      .filter((child) => child.type === "button_item")
      .map((child, index) => {
        const itemProps = sourceProps(child);
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
      warnings.push(`${path}: modal image links are not supported by the current image field and were imported as normal links.`);
    }
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "image"),
      kind: "image",
      imageUrl: resolveYoothemeAssetUrl(props.image),
      imageAlt: asString(props.alt) ?? "",
      imageMaxWidth: sourceImageMaxWidth(props),
      imageWidth: "auto",
      imageLoading: props.image_loading === true ? "eager" : "lazy",
      imageLinkUrl: asString(props.link) ?? undefined,
      imageLinkTarget: props.link ? linkTarget : undefined,
      imageShape: props.image_border === "rounded" || props.image_border === "circle" || props.image_border === "pill"
        ? props.image_border
        : "none",
      imageAlignment: sourceAlignment(props.text_align),
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
      "image_align", "link_style", "link_text", "meta_style", "panel_padding", "panel_style",
      "show_content", "show_image", "show_link", "show_meta", "show_title", "text_align",
      "title_element", "title_style",
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
      gridItemRenderer: panelStyle ? "card" : "plain",
      gridCardVariant: sourceCardVariant(props.panel_style),
      gridCardSize: props.panel_padding === "large" ? "large" : props.panel_padding === "small" ? "small" : "default",
      gridMediaPlacement: props.image_align === "left" || props.image_align === "right" ? props.image_align : "top",
      gridItemAlign: sourceAlignment(props.text_align),
      gridGap: typeof props.grid_column_gap === "string" ? props.grid_column_gap : undefined,
      columnsDesktop: typeof props.grid_medium === "string" ? props.grid_medium : undefined,
      textAlign: sourceAlignment(props.text_align),
    }, props);
  }

  if (type === "panel") {
    if (Object.prototype.hasOwnProperty.call(props, "image") && !resolveYoothemeAssetUrl(props.image)) {
      warnings.push(`${path}: panel image asset could not be resolved and was left empty.`);
    }
    warnUnsupported(path, props, [
      "content", "image", "image_width", "link", "link_style", "link_text", "meta_style",
      "text_align", "title", "title_element", "panel_style", "image_align", "image_grid_width",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "panel"),
      kind: "panel",
      title: asString(props.title) ?? "",
      body: asString(props.content) ?? "",
      imageUrl: resolveYoothemeAssetUrl(props.image),
      imageAlt: asString(props.title) ?? "",
      buttonLabel: asString(props.link_text) ?? undefined,
      buttonUrl: asString(props.link) ?? undefined,
      buttonStyle: props.link_style ? sourceButtonStyle(props.link_style) : undefined,
      panelVariant: sourceCardVariant(props.panel_style),
      panelStyle: sourcePanelStyle(props.panel_style) ?? "default",
      panelShowMedia: Boolean(props.image),
      panelMediaPlacement: props.image_align === "left" || props.image_align === "right" ? props.image_align : "top",
      panelMediaWidth: props.image_grid_width === "1-2" ? "medium" : "large",
      panelTextAlign: sourceAlignment(props.text_align),
      panelTitleElement: sourceHeadingLevel(props.title_element) as "h2" | "h3" | "h4" | "div" | undefined,
    }, props);
  }

  if (type === "overlay-slider") {
    const slides = sourceChildren(node)
      .filter((child) => child.type === "overlay-slider_item")
      .map((child, index) => sourceSliderItem(child, `${path}.${index}`));
    warnUnsupported(path, props, [
      "link_style", "link_text", "meta_style", "nav", "nav_align", "nav_position", "show_content",
      "show_link", "show_meta", "show_title", "slidenav", "slider_autoplay_pause", "slider_center",
      "slider_divider", "slider_gap", "text_align", "title_element", "margin", "visibility",
      ...GENERAL_POSITION_KEYS,
    ], warnings);
    return withSourceGeneralVisualStyle({
      id: sourcePathId(path, "panel-slider"),
      kind: "panelSlider",
      slides,
      carouselSettings: {
        variant: "panel",
        slideMode: "panel",
        loop: true,
        autoplay: false,
        pauseOnHover: props.slider_autoplay_pause !== false,
        align: props.slider_center === false ? "start" : "center",
        spaceBetween: props.slider_gap === "small" ? 15 : props.slider_gap === "large" ? 40 : 30,
        showArrows: Boolean(props.slidenav),
        showDots: Boolean(props.nav),
        arrowPosition: asString(props.slidenav) ?? undefined,
        paginationPosition: asString(props.nav_position) ?? undefined,
        effect: "slide",
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
    return { sections: [], warnings };
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

    sections.push({
      id: structureSection.id,
      kind: "contentLayout",
      title: structureSection.title,
      background: structureSection.background,
      sectionVariant: sourceSectionVariant(sectionProps.style),
      topSpacing: sourceSectionSpacing(sectionProps.padding),
      bottomSpacing: sectionProps.padding_remove_bottom
        ? "none"
        : sourceSectionSpacing(sectionProps.padding),
      visible: true,
      layout:
        structureSection.layout ?? layoutItems[0]?.rowLayout,
      layoutColumns:
        structureSection.layoutColumns ||
        layoutItems.filter((item) => item.rowId === layoutItems[0]?.rowId).length,
      layoutRows: structureSection.layoutRows,
      layoutItems,
    });
  });

  return { sections, warnings };
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
