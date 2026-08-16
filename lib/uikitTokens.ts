/**
 * WebPages UIkit Foundation Adapter Layer
 *
 * Canonical bridge translating WebPages semantic JSON props and design tokens
 * into deterministic UIkit CSS classes.
 *
 * Principles:
 * 1. WebPages owns the schema and state; UIkit owns the visual grammar.
 * 2. Zero UIkit class strings are saved to the database.
 * 3. All UIkit class generation passes through this adapter.
 */

export type SpacingScaleToken =
  | "inherit"
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "small"
  | "medium"
  | "large"
  | string
  | null
  | undefined;

/**
 * Maps WebPages spacing tokens to UIkit margin classes.
 */
export function getUikitMarginClass(
  token: SpacingScaleToken,
  direction: "all" | "top" | "bottom" | "left" | "right" = "all"
): string {
  if (!token || token === "inherit") return "";

  const value = String(token).trim().toLowerCase();

  if (value === "none" || value === "0" || value === "0px") {
    switch (direction) {
      case "top":
        return "uk-margin-remove-top";
      case "bottom":
        return "uk-margin-remove-bottom";
      case "left":
        return "uk-margin-remove-left";
      case "right":
        return "uk-margin-remove-right";
      default:
        return "uk-margin-remove";
    }
  }

  const prefix =
    direction === "top"
      ? "uk-margin-top"
      : direction === "bottom"
      ? "uk-margin-bottom"
      : direction === "left"
      ? "uk-margin-left"
      : direction === "right"
      ? "uk-margin-right"
      : "uk-margin";

  if (value === "xs" || value === "sm" || value === "small") {
    return `${prefix}-small`;
  }
  if (value === "md" || value === "medium") {
    return prefix;
  }
  if (value === "lg" || value === "large") {
    return `${prefix}-large`;
  }
  if (value === "xl" || value === "2xl" || value === "3xl") {
    return `${prefix}-xlarge`;
  }

  return prefix;
}

/**
 * Maps WebPages section vertical padding tokens to UIkit section padding classes.
 */
export function getUikitSectionPaddingClass(token: SpacingScaleToken): string {
  if (!token || token === "inherit") return "uk-section";

  const value = String(token).trim().toLowerCase();

  if (value === "none" || value === "0" || value === "0px") {
    return "uk-section uk-padding-remove-vertical";
  }
  if (value === "xs" || value === "xsmall") {
    return "uk-section uk-section-xsmall";
  }
  if (value === "sm" || value === "small") {
    return "uk-section uk-section-small";
  }
  if (value === "md" || value === "medium" || value === "default") {
    return "uk-section uk-section-medium";
  }
  if (value === "lg" || value === "large" || value === "xl") {
    return "uk-section uk-section-large";
  }
  if (value === "xlarge" || value === "2xl" || value === "3xl") {
    return "uk-section uk-section-xlarge";
  }

  return "uk-section";
}

/**
 * Maps WebPages section background style to UIkit section modifier.
 */
export function getUikitSectionStyleClass(style?: string): string {
  if (!style) return "uk-section-default";

  const s = style.toLowerCase();
  if (s === "muted" || s === "soft") return "uk-section-muted";
  if (s === "primary" || s === "accent") return "uk-section-primary";
  if (s === "secondary" || s === "dark") return "uk-section-secondary";

  return "uk-section-default";
}

/**
 * Maps WebPages container preset to UIkit container bounds.
 */
export function getUikitContainerClass(preset?: string): string {
  if (!preset) return "uk-container";

  const p = preset.toLowerCase();
  if (p === "xsmall" || p === "xs") {
    return "uk-container uk-container-xsmall";
  }
  if (p === "small" || p === "narrow" || p === "sm") {
    return "uk-container uk-container-small";
  }
  if (p === "large" || p === "wide" || p === "lg") {
    return "uk-container uk-container-large";
  }
  if (p === "xlarge" || p === "xl") {
    return "uk-container uk-container-xlarge";
  }
  if (p === "expand" || p === "full" || p === "none") {
    return "uk-container uk-container-expand";
  }

  return "uk-container";
}

/**
 * Maps WebPages row grid parameters to UIkit grid layout classes.
 */
export function getUikitGridClass(options?: {
  gutter?: string;
  matchHeight?: boolean;
  alignItems?: string;
  justifyContent?: string;
}): string {
  const classes = ["uk-grid"];

  const g = options?.gutter?.toLowerCase();
  if (g === "none" || g === "collapse" || g === "0") {
    classes.push("uk-grid-collapse");
  } else if (g === "small" || g === "sm" || g === "xs") {
    classes.push("uk-grid-small");
  } else if (g === "medium" || g === "md") {
    classes.push("uk-grid-medium");
  } else if (g === "large" || g === "lg" || g === "xl" || g === "2xl" || g === "3xl") {
    classes.push("uk-grid-large");
  }

  if (options?.matchHeight) {
    classes.push("uk-grid-match");
  }

  if (options?.alignItems === "center" || options?.alignItems === "middle") {
    classes.push("uk-flex-middle");
  } else if (options?.alignItems === "bottom" || options?.alignItems === "end") {
    classes.push("uk-flex-bottom");
  }

  if (options?.justifyContent === "center") {
    classes.push("uk-flex-center");
  } else if (options?.justifyContent === "space-between" || options?.justifyContent === "between") {
    classes.push("uk-flex-between");
  } else if (options?.justifyContent === "space-around" || options?.justifyContent === "around") {
    classes.push("uk-flex-around");
  }

  return classes.join(" ");
}

/** Maps semantic WebPages column behavior to UIkit flex utility classes. */
export function getUikitColumnClass(options?: {
  horizontalAlign?: string;
  verticalAlign?: string;
  flex?: string;
  responsiveWidth?: string;
}): string {
  const classes: string[] = [];
  const horizontal = options?.horizontalAlign;
  const vertical = options?.verticalAlign;
  const hasFlexAlignment = horizontal === "center" || horizontal === "right" || vertical === "center" || vertical === "bottom";

  if (hasFlexAlignment) classes.push("uk-flex");
  if (options?.flex === "expand") classes.push("uk-flex", "uk-flex-column");
  if (horizontal === "center") classes.push("uk-flex-center");
  if (horizontal === "right") classes.push("uk-flex-right");
  if (vertical === "center") classes.push("uk-flex-middle");
  if (vertical === "bottom") classes.push("uk-flex-bottom");
  if (options?.flex === "expand") classes.push("uk-flex-1");
  if (options?.responsiveWidth === "stack") classes.push("uk-width-1-1@s");

  return classes.join(" ");
}

export function getUikitTableClass(style?: string, size?: string, hover?: boolean, striping?: boolean) {
  // UIkit's table contract fills the containing element; column-level
  // `table_width_*` settings control distribution inside that width.
  const classes = ["uk-table", "uk-width-1-1"];
  if (style === "divider") classes.push("uk-table-divider");
  else if (style === "striped" || striping) classes.push("uk-table-striped");
  if (size === "small") classes.push("uk-table-small");
  else if (size === "large") classes.push("uk-table-large");
  if (hover) classes.push("uk-table-hover");
  classes.push("uk-table-middle");
  return classes.join(" ");
}

/**
 * Maps column width proportion (e.g. span 6 out of 12) to UIkit responsive grid width.
 */
export function getUikitWidthClass(colSpan?: number, totalCols: number = 12): string {
  if (!colSpan || colSpan >= totalCols) return "uk-width-1-1";

  const ratio = colSpan / totalCols;

  // Standard UIkit grid ratios: 1-2, 1-3, 2-3, 1-4, 3-4, 1-5, 2-5, 3-5, 4-5, 1-6, 5-6
  if (Math.abs(ratio - 1 / 2) < 0.02) return "uk-width-1-2@m";
  if (Math.abs(ratio - 1 / 3) < 0.02) return "uk-width-1-3@m";
  if (Math.abs(ratio - 2 / 3) < 0.02) return "uk-width-2-3@m";
  if (Math.abs(ratio - 1 / 4) < 0.02) return "uk-width-1-4@m";
  if (Math.abs(ratio - 3 / 4) < 0.02) return "uk-width-3-4@m";
  if (Math.abs(ratio - 1 / 6) < 0.02) return "uk-width-1-6@m";
  if (Math.abs(ratio - 5 / 6) < 0.02) return "uk-width-5-6@m";

  return "uk-width-1-1";
}

/**
 * Maps WebPages card visual presets to UIkit card components.
 */
export function getUikitCardClass(
  preset?: string,
  options?: {
    hover?: boolean | string;
    padding?: string;
  }
): string {
  const classes: string[] = [];

  const rawP = (preset?.toLowerCase() || "default").trim();
  const isTile = rawP.startsWith("tile-");
  const isCardPrefix = rawP.startsWith("card-");
  const p = isTile ? rawP.replace("tile-", "") : isCardPrefix ? rawP.replace("card-", "") : rawP;

  if (p === "none" || p === "flat" || p === "blank" || p === "panel") {
    classes.push("uk-panel");
  } else if (isTile) {
    classes.push("uk-tile", `uk-tile-${p || "default"}`);
  } else if (p === "secondary" || p === "dark") {
    classes.push("uk-card", "uk-card-secondary");
  } else if (p === "primary" || p === "accent") {
    classes.push("uk-card", "uk-card-primary");
  } else if (p === "hover") {
    classes.push("uk-card", "uk-card-default", "uk-card-hover");
  } else {
    // default, soft, elevated, outline, glass
    classes.push("uk-card", "uk-card-default");
  }

  // Padding modifier
  const pad = options?.padding?.toLowerCase();
  if (pad === "none" || pad === "0") {
    classes.push("uk-card-none");
  } else if (pad === "small" || pad === "xs" || pad === "sm") {
    classes.push(isTile ? "uk-padding-small" : "uk-card-small");
  } else if (pad === "large" || pad === "lg" || pad === "xl") {
    classes.push(isTile ? "uk-padding-large" : "uk-card-large");
  }

  // Hover modifier
  const hover = options?.hover;
  const isHoverActive =
    hover === true ||
    (typeof hover === "string" &&
      hover.toLowerCase() !== "none" &&
      hover.toLowerCase() !== "disabled" &&
      hover.toLowerCase() !== "false" &&
      hover.toLowerCase() !== "");

  if (isHoverActive && !classes.includes("uk-card-hover")) {
    classes.push("uk-card-hover");
  }

  return classes.join(" ");
}

export type UikitPanelMediaPlacement = "top" | "left" | "right";

export function getUikitPanelMediaClass(
  placement: UikitPanelMediaPlacement = "top",
): string {
  if (placement === "left") return "uk-card-media-left";
  if (placement === "right") return "uk-card-media-right";
  return "uk-card-media-top";
}

export function getUikitPanelLayoutClass(
  placement: UikitPanelMediaPlacement = "top",
  mediaWidth: "small" | "medium" | "large" = "medium",
): string {
  return `shop-builder-panel--media-${placement} shop-builder-panel--media-width-${mediaWidth}`;
}

export function getUikitPanelMediaStyle(options: {
  ratio?: string;
  fit?: "cover" | "contain" | "fill" | "natural";
  alignment?: "left" | "center" | "right";
  position?: string;
}): { aspectRatio?: string; backgroundSize?: "cover" | "contain" | "fill"; backgroundPosition: string; objectFit?: "cover" | "contain" | "fill" } {
  const ratioMap: Record<string, string> = {
    square: "1 / 1",
    "4:3": "4 / 3",
    "3:2": "3 / 2",
    "16:9": "16 / 9",
    portrait: "3 / 4",
  };
  const focal = options.position && options.position !== "center"
    ? options.position.replace(/-/g, " ")
    : undefined;
  const fit = options.fit === "cover" || options.fit === "contain" || options.fit === "fill"
    ? options.fit
    : undefined;
  return {
    aspectRatio: ratioMap[options.ratio ?? ""] || undefined,
    backgroundSize: fit,
    objectFit: fit,
    backgroundPosition: focal ?? (options.alignment === "left" ? "left center" : options.alignment === "right" ? "right center" : "center"),
  };
}

export type UikitAccordionStyle = "default" | "divided" | "striped" | "minimal";
type UikitAccordionStyleInput = UikitAccordionStyle | "boxed";
export type UikitAccordionIndicator = "default" | "plus-minus" | "chevron" | "none";

/** Canonical semantic Accordion presentation mapping. */
export function getUikitAccordionClass(options: {
  style?: UikitAccordionStyleInput;
  indicator?: UikitAccordionIndicator;
  indicatorPosition?: "start" | "end";
  titleEmphasis?: "inherit" | "muted" | "default" | "emphasis";
  itemSpacing?: "inherit" | "small" | "default" | "large";
  contentSpacing?: "inherit" | "small" | "default" | "large";
  divider?: boolean;
} = {}): string {
  // Older documents may still contain "boxed"; render that legacy value using the new native UIkit treatment.
  const style = options.style === "boxed" ? "striped" : options.style ?? "default";
  // YOOtheme's unconfigured Accordion indicator is its native plus/minus
  // treatment. Keep `default` as the document-facing value, but resolve it
  // to the canonical visual variant before emitting modifier classes.
  const indicator = options.indicator === "default" ? "plus-minus" : options.indicator ?? "default";
  const classes = ["uk-accordion", "uk-accordion-default", ...(style === "striped" ? ["uk-list-striped"] : []), `shop-builder-accordion--style-${style}`, `shop-builder-accordion--indicator-${indicator}`, `shop-builder-accordion--indicator-${options.indicatorPosition ?? "end"}`, `shop-builder-accordion--title-${options.titleEmphasis ?? "inherit"}`, `shop-builder-accordion--items-${options.itemSpacing ?? "inherit"}`, `shop-builder-accordion--content-${options.contentSpacing ?? "inherit"}`];
  if (options.divider !== false) classes.push("shop-builder-accordion--divider");
  return classes.join(" ");
}

/** Compatibility hook retained while Accordion presentation is owned by the root UIkit modifier. */
export function getUikitAccordionItemClass(_style: UikitAccordionStyleInput = "default"): string {
  void _style;
  return "";
}

/**
 * Maps WebPages button presets and sizes to canonical UIkit button classes.
 */
/**
 * The static YOOtheme Button item vocabulary. These are persisted semantic
 * values, never UIkit class strings. Native WebPages-only aliases continue to
 * be handled by the resolver below without becoming YOOtheme import values.
 */
export const UIKIT_YOOTHEME_BUTTON_VARIANTS = [
  "default",
  "primary",
  "secondary",
  "danger",
  "text",
  "link",
  "link-muted",
  "link-text",
] as const;

export type UikitYoothemeButtonVariant = (typeof UIKIT_YOOTHEME_BUTTON_VARIANTS)[number];

/** Native aliases remain explicit so imported YOOtheme values are never lossy. */
export type WebPagesNativeButtonVariantAlias =
  | "solid"
  | "dark"
  | "outline"
  | "ghost"
  | "light"
  | "native-link";

export type CanonicalButtonVariant = UikitYoothemeButtonVariant | WebPagesNativeButtonVariantAlias;

/**
 * Maps canonical Button semantics and legacy native aliases to UIkit classes.
 *
 * YOOtheme's `link` style deliberately has no `uk-button-*` modifier. The
 * muted/text link styles use UIkit link modifiers rather than button-text.
 */
export function getUikitButtonClass(preset?: string, size?: string): string {
  const classes = ["uk-button"];

  const p = preset?.toLowerCase() || "solid";

  if (p === "primary" || p === "solid") {
    classes.push("uk-button-primary");
  } else if (p === "secondary" || p === "dark") {
    classes.push("uk-button-secondary");
  } else if (p === "danger") {
    classes.push("uk-button-danger");
  } else if (p === "text" || p === "native-link") {
    classes.push("uk-button-text");
  } else if (p === "link-muted") {
    classes.push("uk-link-muted");
  } else if (p === "link-text") {
    classes.push("uk-link-text");
  } else if (p === "link") {
    // YOOtheme Link: intentionally bare `uk-button`.
  } else {
    classes.push("uk-button-default");
  }

  const s = size?.toLowerCase();
  if (s === "sm" || s === "small") {
    classes.push("uk-button-small");
  } else if (s === "lg" || s === "large") {
    classes.push("uk-button-large");
  }

  return classes.join(" ");
}

type UikitButtonLocalOverrideSource = {
  buttonBg?: unknown;
  buttonTextColor?: unknown;
  buttonBorderColor?: unknown;
  buttonBorderWidth?: unknown;
  buttonBorderRadius?: unknown;
  buttonPaddingY?: unknown;
  buttonPaddingX?: unknown;
  buttonHoverBg?: unknown;
  buttonHoverTextColor?: unknown;
  buttonHoverBorderColor?: unknown;
};

/**
 * Maps explicit element-level Button appearance overrides into the canonical
 * UIkit Button variables. Context variables remain the fallback, so an
 * inherited inverse surface never overwrites an authored local value.
 */
export function getUikitButtonLocalOverride(
  source: UikitButtonLocalOverrideSource,
): { className: string; style: Record<string, string> | undefined } {
  const value = (candidate: unknown) =>
    typeof candidate === "string" && candidate.trim() ? candidate.trim() : undefined;
  const background = value(source.buttonBg);
  const text = value(source.buttonTextColor);
  const border = value(source.buttonBorderColor);
  const borderWidth = value(source.buttonBorderWidth);
  const radius = value(source.buttonBorderRadius);
  const paddingY = value(source.buttonPaddingY);
  const paddingX = value(source.buttonPaddingX);
  const hoverBackground = value(source.buttonHoverBg);
  const hoverText = value(source.buttonHoverTextColor);
  const hoverBorder = value(source.buttonHoverBorderColor);
  const style: Record<string, string> = {
    ...(background ? { "--uikit-button-local-background": background } : {}),
    ...(background?.includes("gradient(") ? { "--uikit-button-local-background-image": background } : {}),
    ...(text ? { "--uikit-button-local-text": text } : {}),
    ...(border ? { "--uikit-button-local-border": border } : {}),
    ...(borderWidth ? { "--uk-button-border-width": borderWidth } : {}),
    ...(radius ? { "--uk-button-border-radius": radius } : {}),
    ...(paddingX ? { "--uk-button-padding-x": paddingX } : {}),
    ...(paddingY ? { "--uikit-button-local-padding-y": paddingY } : {}),
    ...(hoverBackground ? { "--uikit-button-local-hover-background": hoverBackground } : {}),
    ...(hoverBackground?.includes("gradient(") ? { "--uikit-button-local-hover-background-image": hoverBackground } : {}),
    ...(hoverText ? { "--uikit-button-local-hover-text": hoverText } : {}),
    ...(hoverBorder ? { "--uikit-button-local-hover-border": hoverBorder } : {}),
  };
  const classes = [
    "shop-builder-uikit-button",
    background && "shop-builder-uikit-button--local-background",
    text && "shop-builder-uikit-button--local-text",
    border && "shop-builder-uikit-button--local-border",
    paddingY && "shop-builder-uikit-button--local-padding-y",
    hoverBackground && "shop-builder-uikit-button--local-hover-background",
    hoverText && "shop-builder-uikit-button--local-hover-text",
    hoverBorder && "shop-builder-uikit-button--local-hover-border",
  ].filter(Boolean).join(" ");

  return { className: classes, style: Object.keys(style).length ? style : undefined };
}

/**
 * Maps WebPages heading level and size presets to UIkit typography classes.
 */
export function getUikitHeadingClass(
  level?: string | number,
  sizePreset?: string
): string {
  const classes = ["uk-margin-remove-top"];

  const s = sizePreset?.toLowerCase();
  if (s === "3xlarge" || s === "3xl") {
    classes.push("uk-heading-3xlarge");
    return classes.join(" ");
  }
  if (s === "2xlarge" || s === "2xl") {
    classes.push("uk-heading-2xlarge");
    return classes.join(" ");
  }
  if (s === "xlarge" || s === "hero" || s === "display") {
    classes.push("uk-heading-xlarge");
    return classes.join(" ");
  }
  if (s === "large" || s === "xl") {
    classes.push("uk-heading-large");
    return classes.join(" ");
  }
  if (s === "medium" || s === "lg") {
    classes.push("uk-heading-medium");
    return classes.join(" ");
  }
  if (s === "small" || s === "sm") {
    classes.push("uk-heading-small");
    return classes.join(" ");
  }
  if (s === "article-title" || s === "article") {
    classes.push("uk-article-title");
    return classes.join(" ");
  }
  if (s === "h1" || s === "1") {
    classes.push("uk-h1");
    return classes.join(" ");
  }
  if (s === "h2" || s === "2") {
    classes.push("uk-h2");
    return classes.join(" ");
  }
  if (s === "h3" || s === "3") {
    classes.push("uk-h3");
    return classes.join(" ");
  }
  if (s === "h4" || s === "4") {
    classes.push("uk-h4");
    return classes.join(" ");
  }
  if (s === "h5" || s === "5") {
    classes.push("uk-h5");
    return classes.join(" ");
  }
  if (s === "h6" || s === "6") {
    classes.push("uk-h6");
    return classes.join(" ");
  }

  // Level-based fallback
  const l = String(level).toLowerCase();
  if (l === "div") return classes.join(" ");
  if (l === "h1" || l === "1") classes.push("uk-article-title");
  else if (l === "h2" || l === "2") classes.push("uk-h2");
  else if (l === "h3" || l === "3") classes.push("uk-h3");
  else if (l === "h4" || l === "4") classes.push("uk-h4");
  else if (l === "h5" || l === "5") classes.push("uk-h5");
  else if (l === "h6" || l === "6") classes.push("uk-h6");
  else classes.push("uk-h2");

  return classes.join(" ");
}

/**
 * Maps WebPages text variant presets to UIkit text helpers.
 */
export function getUikitTextClass(variant?: string): string {
  if (!variant) return "";
  const v = variant.toLowerCase().replace(/^uk-text-/, "").replace(/^text-/, "");
  if (v === "bold") return "uk-text-bold";
  if (v === "lead") return "uk-text-lead";
  if (v === "meta") return "uk-text-meta";
  if (v === "muted") return "uk-text-muted";
  if (v === "small" || v === "sm") return "uk-text-small";
  if (v === "large" || v === "lg") return "uk-text-large";
  if (v === "heading-small") return "uk-heading-small";
  if (/^heading-h[1-6]$/.test(v)) return `uk-${v.slice("heading-".length)}`;
  return "";
}

export type UikitListPresentation = "default" | "bullet" | "divider" | "striped" | "large";
export type UikitListMarker = "none" | "disc" | "circle" | "square";
export type UikitListSpacing = "compact" | "default" | "large";

/** Maps semantic WebPages List settings to installed UIkit list modifiers. */
export function getUikitListClass(options?: {
  presentation?: UikitListPresentation;
  marker?: UikitListMarker;
  align?: "left" | "center" | "right";
  spacing?: UikitListSpacing;
}): string {
  const classes = ["uk-list"];
  const presentation = options?.presentation ?? "default";
  const marker = options?.marker ?? "none";
  const spacing = options?.spacing ?? "default";

  if (presentation === "bullet") classes.push("uk-list-bullet");
  if (presentation === "divider") classes.push("uk-list-divider");
  if (presentation === "striped") classes.push("uk-list-striped");
  if (presentation === "large" || spacing === "large") classes.push("uk-list-large");
  if (spacing === "compact") classes.push("uk-list-collapse");
  if (marker !== "none") classes.push(`uk-list-${marker}`);
  if (options?.align) classes.push(`uk-text-${options.align}`);

  return classes.join(" ");
}

/**
 * Maps WebPages badge/label visual presets to UIkit badge and label component classes.
 */
export function getUikitBadgeClass(preset?: string, variant?: "label" | "badge"): string {
  const p = preset?.toLowerCase() || "default";

  if (variant === "badge") {
    return "uk-badge";
  }

  const classes = ["uk-label"];

  if (p === "success" || p === "green") {
    classes.push("uk-label-success");
  } else if (p === "warning" || p === "yellow" || p === "orange") {
    classes.push("uk-label-warning");
  } else if (p === "danger" || p === "red" || p === "error") {
    classes.push("uk-label-danger");
  }

  return classes.join(" ");
}

/**
 * Maps WebPages divider preset options to UIkit divider component classes.
 */
export function getUikitDividerClass(preset?: string): string {
  const p = preset?.toLowerCase() || "default";
  if (p === "icon" || p === "bullet" || p === "star") return "uk-divider-icon";
  if (p === "small" || p === "short") return "uk-divider-small";
  if (p === "vertical") return "uk-divider-vertical";
  return "uk-hr";
}

/**
 * Maps WebPages alert status types to UIkit alert component classes.
 */
export function getUikitAlertClass(status?: string): string {
  const classes = ["uk-alert"];
  const s = status?.toLowerCase() || "default";

  if (s === "default" || s === "none") {
    // UIkit's base alert has no variant modifier.
  } else if (s === "success" || s === "info") {
    classes.push("uk-alert-success");
  } else if (s === "warning" || s === "caution") {
    classes.push("uk-alert-warning");
  } else if (s === "danger" || s === "error") {
    classes.push("uk-alert-danger");
  } else {
    classes.push("uk-alert-primary");
  }

  return classes.join(" ");
}

/**
 * Resolves Alert presentation from the canonical Global Style token family.
 * This keeps the UIkit class contract intact while preventing a legacy
 * dashboard stylesheet from replacing imported Alert semantics in Builder.
 */
export function getUikitAlertPresentationStyle(status?: string) {
  const s = status?.toLowerCase() || "default";
  const variant = s === "success" || s === "info"
    ? "success"
    : s === "warning" || s === "caution"
      ? "warning"
      : s === "danger" || s === "error"
        ? "danger"
        : s === "default" || s === "none"
          ? "default"
          : "primary";
  const token = variant === "default" ? "--uk-alert" : `--uk-alert-${variant}`;
  return {
    background: `var(${token}-background)`,
    color: `var(${token}-color)`,
    borderRadius: "var(--uk-alert-border-radius)",
  };
}

export type UikitImageSemantics = {
  fit?: "contain" | "cover" | "fill" | string;
  ratio?: "auto" | "natural" | "square" | "4:3" | "3:2" | "4:5" | "3:4" | "16:9" | "portrait" | string;
  shape?: "none" | "rounded" | "circle" | "pill" | string;
  shadow?: "none" | "small" | "medium" | "large" | "xlarge" | string;
  alignment?: "left" | "center" | "right" | string;
  width?: "auto" | "full" | "small" | "medium" | "large" | "xlarge" | string;
  height?: string | number | null;
  position?: string;
};

export type UikitImageDocumentFields = {
  imageFit?: UikitImageSemantics["fit"] | "natural";
  imageRatio?: UikitImageSemantics["ratio"];
  imageShape?: UikitImageSemantics["shape"];
  imageShadow?: UikitImageSemantics["shadow"];
  imageAlignment?: UikitImageSemantics["alignment"];
  imageWidth?: UikitImageSemantics["width"];
  imageHeight?: string | number | null;
  imagePosition?: string;
  imageBorderRadius?: number | null;
  /** YOOtheme's "Make SVG stylable with CSS" option. */
  imageSvgInline?: boolean;
  /** Semantic color used when the SVG is rendered as a stylable icon. */
  imageSvgColor?: string;
  /** UIkit background surface behind the image media. */
  imageBoxDecoration?: "none" | "default" | "primary" | "secondary" | string;
};

/**
 * YOOtheme Image's Inline SVG color vocabulary. `inverse` is a legacy native
 * WebPages alias, not an option in the YOOtheme Image inspector.
 */
export const UIKIT_YOOTHEME_SVG_COLOR_OPTIONS = [
  { value: "none", label: "None" },
  { value: "muted", label: "Muted" },
  { value: "emphasis", label: "Emphasis" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "danger", label: "Danger" },
  { value: "default", label: "Default" },
  { value: "inverse", label: "Inverse" },
] as const;

/** Resolves stored Image fields into the shared UIkit Image semantic contract. */
export function resolveUikitImageSemantics(
  image: UikitImageDocumentFields & { imageBorder?: string; imageBoxShadow?: string; imageHoverTransition?: string },
): UikitImageSemantics & { hoverTransition?: string } {
  return {
    fit: image.imageFit,
    ratio: image.imageRatio,
    shape: image.imageShape ?? (image.imageBorder === "rounded" || image.imageBorder === "circle" ? image.imageBorder : (image.imageBorderRadius ? "rounded" : "none")),
    shadow: image.imageShadow ?? (image.imageBoxShadow && image.imageBoxShadow !== "none" ? image.imageBoxShadow : undefined),
    alignment: image.imageAlignment,
    width: image.imageWidth,
    height: image.imageHeight,
    position: image.imagePosition,
    hoverTransition: image.imageHoverTransition,
  };
}

/** Maps semantic Image settings to UIkit 3.25-compatible classes and attributes. */
export function getUikitImageClass(image: UikitImageSemantics & { hoverTransition?: string }): string {
  const classes = ["uk-img"];
  if (image.shape === "rounded") classes.push("uk-border-rounded");
  if (image.shape === "circle") classes.push("uk-border-circle");
  if (image.shape === "pill") classes.push("uk-border-pill");
  if (image.shadow && image.shadow !== "none") classes.push(`uk-box-shadow-${image.shadow}`);
  if (image.hoverTransition && image.hoverTransition !== "none") classes.push(`uk-transition-${image.hoverTransition}`, "uk-transition-opaque");
  return classes.join(" ");
}

export function getUikitImageWrapperClass(image: UikitImageSemantics): string {
  const classes: string[] = [];
  if (image.ratio && image.ratio !== "auto" && image.ratio !== "natural") classes.push("uk-cover-container");
  if (image.shape === "rounded") classes.push("uk-border-rounded");
  if (image.shape === "circle") classes.push("uk-border-circle");
  if (image.shape === "pill") classes.push("uk-border-pill");
  if (image.shadow && image.shadow !== "none") classes.push(`uk-box-shadow-${image.shadow}`);
  if (image.alignment === "left" || image.alignment === "center" || image.alignment === "right") classes.push(`uk-align-${image.alignment}`);
  return classes.join(" ");
}

export function getUikitImageStyle(image: UikitImageSemantics): {
  aspectRatio?: string;
  maxWidth?: string;
  width?: string;
  height?: string;
  objectFit?: "contain" | "cover" | "fill";
  objectPosition?: string;
  position?: "absolute";
  inset?: 0;
} {
  const ratioMap: Record<string, string> = {
    square: "1 / 1",
    "4:3": "4 / 3",
    "3:2": "3 / 2",
    "4:5": "4 / 5",
    "3:4": "3 / 4",
    "16:9": "16 / 9",
    portrait: "3 / 4",
  };
  const widthMap: Record<string, string> = {
    small: "320px",
    medium: "640px",
    large: "960px",
    xlarge: "1280px",
  };
  const cssDimension = (value: unknown) => {
    if (typeof value === "number") return `${value}px`;
    if (typeof value !== "string" || !value.trim() || value === "auto") return undefined;
    return /^-?\d+(?:\.\d+)?$/.test(value.trim()) ? `${value.trim()}px` : value.trim();
  };
  const ratio = ratioMap[image.ratio ?? ""];
  const contained = Boolean(ratio);
  const width = image.width === "full" ? "100%" : widthMap[image.width ?? ""] ?? cssDimension(image.width);
  const focal = image.position && image.position !== "center" ? image.position.replace(/-/g, " ") : undefined;
  return {
    aspectRatio: ratio,
    maxWidth: image.width && image.width !== "auto" && image.width !== "full" && widthMap[image.width] ? widthMap[image.width] : undefined,
    width,
    height: cssDimension(image.height),
    // Natural is the YOOtheme default: no crop mode is implied. `fill` is the
    // browser's non-cropping baseline and prevents legacy CSS fallbacks from
    // reintroducing `cover` when an image has an explicit frame.
    objectFit: image.fit === "contain" || image.fit === "fill" || image.fit === "cover" ? image.fit : "fill",
    objectPosition: focal,
    ...(contained ? { position: "absolute", inset: 0 as const } : {}),
  };
}

export function getUikitImageAttributes(image: UikitImageSemantics) {
  const ratio = image.ratio && image.ratio !== "auto" && image.ratio !== "natural";
  return {
    "data-uk-cover": ratio && image.fit !== "contain" && image.fit !== "fill" ? "" : undefined,
    "data-uk-img": undefined,
  };
}

/** Shared renderer semantics for YOOtheme's "Make SVG stylable with CSS" contract. */
export function getUikitSvgColor(value?: string | null): string | undefined {
  const normalized = String(value ?? "").toLowerCase();
  if (!normalized || normalized === "none") return undefined;
  return {
    primary: "var(--uk-global-primary-background, currentColor)",
    secondary: "var(--uk-global-secondary-background, currentColor)",
    muted: "var(--uk-global-muted-color, currentColor)",
    emphasis: "var(--uk-global-emphasis-color, currentColor)",
    success: "var(--uk-global-success-background, currentColor)",
    warning: "var(--uk-global-warning-background, currentColor)",
    danger: "var(--uk-global-danger-background, currentColor)",
    inverse: "var(--uk-global-inverse-color, currentColor)",
    default: "var(--uk-global-color, currentColor)",
  }[normalized];
}

/** YOOtheme applies SVG Style through contextual UIkit text-color classes. */
export function getUikitSvgColorClass(value?: string | null): string {
  const normalized = String(value ?? "").toLowerCase();
  return ["primary", "secondary", "muted", "emphasis", "success", "warning", "danger"].includes(normalized)
    ? `uk-text-${normalized}`
    : "";
}
