import type { CSSProperties } from "react";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
  getDefaultSpacingToken,
  BUILDER_SPACING_SCALE,
} from "@/lib/builderSpacing";

export type BuilderSpacingPreset =
  | "none"
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "inherit";

export type BuilderSpacingSides = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  linked?: boolean;
};

export type BuilderBackgroundStyle = {
  type?: "none" | "color" | "gradient" | "image";
  color?: string;
  gradient?: string;
  imageUrl?: string;
  imageSize?: "cover" | "contain" | "auto";
  imagePosition?: string;
  imageRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  overlay?: string;
};

export type BuilderBorderStyle = {
  width?: string;
  style?: "none" | "solid" | "dashed" | "dotted";
  color?: string;
  radius?: string;
};

export type BuilderEffectsStyle = {
  opacity?: number;
  boxShadow?: string;
  maxWidth?: string;
  minHeight?: string;
  overflow?: "visible" | "hidden" | "auto" | "scroll";
};

export type BuilderVisibilityStyle = {
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
};

export type BuilderCardPreset =
  | "none"
  | "soft"
  | "elevated"
  | "glass"
  | "outline"
  | "gradient"
  | "dark"
  | "image-overlay";

export type BuilderHoverPreset =
  | "none"
  | "lift-soft"
  | "lift-strong"
  | "image-zoom"
  | "glow-subtle"
  | "press-down"
  | "shadow-grow";

export type BuilderCardPartStyle = {
  preset?: BuilderCardPreset;
  hoverPreset?: BuilderHoverPreset;
  imageRadius?: string;
  imageRatio?: "auto" | "square" | "4:5" | "3:4" | "16:9";
  imageFit?: "cover" | "contain" | "fill";
  imageOverlay?: "none" | "soft" | "dark" | "gradient";
  titleSize?: string;
  titleWeight?: string;
  titleColor?: string;
  titleAlign?: "left" | "center" | "right";
  titleMargin?: string;
  metaSize?: string;
  metaColor?: string;
  metaTransform?: "none" | "uppercase";
  metaSpacing?: string;
  contentSize?: string;
  contentColor?: string;
  contentLineHeight?: string;
  contentMaxWidth?: string;
  buttonAlign?: "left" | "center" | "right";
  buttonMargin?: string;
  cardGap?: string;
  cardPadding?: string;
};

export type BuilderVisualStyle = {
  padding?: BuilderSpacingSides;
  margin?: BuilderSpacingSides;
  background?: BuilderBackgroundStyle;
  border?: BuilderBorderStyle;
  effects?: BuilderEffectsStyle;
  visibility?: BuilderVisibilityStyle;
  card?: BuilderCardPartStyle;
  customClass?: string;
};

export function hasBuilderVisualSpacing(sides?: BuilderSpacingSides) {
  return Boolean(
    sides &&
      [sides.top, sides.right, sides.bottom, sides.left].some(
        (value) =>
          typeof value === "string" &&
          value.trim() !== "" &&
          value.trim().toLowerCase() !== "inherit",
      ),
  );
}

export function legacySpacingToSides(
  value?: string,
): BuilderSpacingSides | undefined {
  if (!value || value === "inherit") return undefined;
  return {
    top: value,
    right: value,
    bottom: value,
    left: value,
    linked: true,
  };
}

const BUILDER_SPACING_VALUES = new Set([
  "none",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
  "3xl",
  "small",
  "medium",
  "large",
]);

export function resolveSpacingToken(
  value?: string,
  context: BuilderSpacingContext = "elementPadding",
): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed === "inherit") return undefined;
  if (BUILDER_SPACING_VALUES.has(trimmed.toLowerCase())) {
    return resolveBuilderSpacing(trimmed, context).css;
  }
  return trimmed;
}

function resolveSideValue(
  value: string | undefined,
  context: BuilderSpacingContext,
): string | undefined {
  return resolveSpacingToken(value, context);
}

function spacingSidesToCss(
  sides?: BuilderSpacingSides,
): Pick<
  CSSProperties,
  "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "marginTop" | "marginRight" | "marginBottom" | "marginLeft"
> {
  if (!sides) return {};

  const top = resolveSideValue(sides.top, "elementPadding");
  const right = resolveSideValue(
    sides.right ?? (sides.linked ? sides.top : undefined),
    "elementPadding",
  );
  const bottom = resolveSideValue(
    sides.bottom ?? (sides.linked ? sides.top : undefined),
    "elementPadding",
  );
  const left = resolveSideValue(
    sides.left ?? (sides.linked ? sides.top : sides.right),
    "elementPadding",
  );

  return {
    ...(top !== undefined ? { paddingTop: top } : {}),
    ...(right !== undefined ? { paddingRight: right } : {}),
    ...(bottom !== undefined ? { paddingBottom: bottom } : {}),
    ...(left !== undefined ? { paddingLeft: left } : {}),
  } as CSSProperties;
}

export function paddingToCss(
  padding?: BuilderSpacingSides,
  context: BuilderSpacingContext = "elementPadding",
): CSSProperties {
  if (!padding) return {};

  const prefix = context.replace(/([A-Z])/g, "-$1").toLowerCase();
  const defaultPx = BUILDER_SPACING_SCALE[getDefaultSpacingToken(context)];

  const getSideValue = (side: "top" | "right" | "bottom" | "left", value?: string) => {
    const resolved = resolveSideValue(value, context);
    if (resolved !== undefined) return resolved;
    return `var(--builder-global-${prefix}-${side}, ${defaultPx}px)`;
  };

  const top = getSideValue("top", padding.top);
  const right = getSideValue(
    "right",
    padding.right ?? (padding.linked ? padding.top : undefined),
  );
  const bottom = getSideValue(
    "bottom",
    padding.bottom ?? (padding.linked ? padding.top : undefined),
  );
  const left = getSideValue(
    "left",
    padding.left ?? (padding.linked ? padding.top : padding.right),
  );

  return {
    paddingTop: top,
    paddingRight: right,
    paddingBottom: bottom,
    paddingLeft: left,
  };
}

export function marginToCss(
  margin?: BuilderSpacingSides,
  context: BuilderSpacingContext = "elementMargin",
): CSSProperties {
  if (!margin) return {};

  const prefix = context.replace(/([A-Z])/g, "-$1").toLowerCase();
  const defaultPx = BUILDER_SPACING_SCALE[getDefaultSpacingToken(context)];

  const getSideValue = (side: "top" | "right" | "bottom" | "left", value?: string) => {
    const resolved = resolveSideValue(value, context);
    if (resolved !== undefined) return resolved;
    return `var(--builder-global-${prefix}-${side}, ${defaultPx}px)`;
  };

  const top = getSideValue("top", margin.top);
  const right = getSideValue(
    "right",
    margin.right ?? (margin.linked ? margin.top : undefined),
  );
  const bottom = getSideValue(
    "bottom",
    margin.bottom ?? (margin.linked ? margin.top : undefined),
  );
  const left = getSideValue(
    "left",
    margin.left ?? (margin.linked ? margin.top : margin.right),
  );

  return {
    marginTop: top,
    marginRight: right,
    marginBottom: bottom,
    marginLeft: left,
  };
}

export function backgroundToCss(
  background?: BuilderBackgroundStyle,
): CSSProperties {
  if (!background || background.type === "none") return {};

  const type = background.type ?? "color";

  if (type === "gradient" && background.gradient) {
    return { background: background.gradient };
  }

  if (type === "image" && background.imageUrl) {
    const overlay = background.overlay?.trim();
    const image = `url("${background.imageUrl}")`;
    return {
      backgroundImage: overlay
        ? `linear-gradient(${overlay}, ${overlay}), ${image}`
        : image,
      backgroundSize: background.imageSize ?? "cover",
      backgroundPosition: background.imagePosition ?? "center",
      backgroundRepeat: background.imageRepeat ?? "no-repeat",
    };
  }

  if (background.color) {
    return { background: background.color };
  }

  return {};
}

export function borderToCss(border?: BuilderBorderStyle): CSSProperties {
  if (!border) return {};
  const width = border.width?.trim();
  const style = border.style ?? "solid";
  const color = border.color?.trim();
  const radius = border.radius?.trim();

  const css: CSSProperties = {};
  if (width && style !== "none") {
    css.borderWidth = width;
    css.borderStyle = style;
    if (color) css.borderColor = color;
  } else if (style === "none") {
    css.border = "none";
  }
  if (radius) css.borderRadius = radius;
  return css;
}

export function effectsToCss(effects?: BuilderEffectsStyle): CSSProperties {
  if (!effects) return {};
  const css: CSSProperties = {};
  if (effects.opacity !== undefined && effects.opacity !== null) {
    css.opacity = Math.min(100, Math.max(0, effects.opacity)) / 100;
  }
  if (effects.boxShadow?.trim()) css.boxShadow = effects.boxShadow.trim();
  if (effects.maxWidth?.trim()) css.maxWidth = effects.maxWidth.trim();
  if (effects.minHeight?.trim()) css.minHeight = effects.minHeight.trim();
  if (effects.overflow) css.overflow = effects.overflow;
  return css;
}

function cardStyleToCss(card?: BuilderCardPartStyle): CSSProperties {
  if (!card) return {};
  const css: CSSProperties & Record<string, string> = {};

  const ratioMap: Record<NonNullable<BuilderCardPartStyle["imageRatio"]>, string> = {
    auto: "",
    square: "1 / 1",
    "4:5": "4 / 5",
    "3:4": "3 / 4",
    "16:9": "16 / 9",
  };

  if (card.imageRadius) css["--builder-card-image-radius"] = card.imageRadius;
  if (card.imageRatio && ratioMap[card.imageRatio]) {
    css["--builder-card-image-ratio"] = ratioMap[card.imageRatio];
  }
  if (card.imageFit) {
    css["--builder-card-image-fit"] =
      card.imageFit === "fill" ? "fill" : card.imageFit;
    css["--builder-card-bg-image-fit"] =
      card.imageFit === "fill" ? "100% 100%" : card.imageFit;
  }
  if (card.titleSize) css["--builder-card-title-size"] = card.titleSize;
  if (card.titleWeight) css["--builder-card-title-weight"] = card.titleWeight;
  if (card.titleColor) css["--builder-card-title-color"] = card.titleColor;
  if (card.titleAlign) css["--builder-card-title-align"] = card.titleAlign;
  if (card.titleMargin) css["--builder-card-title-margin"] = card.titleMargin;
  if (card.metaSize) css["--builder-card-meta-size"] = card.metaSize;
  if (card.metaColor) css["--builder-card-meta-color"] = card.metaColor;
  if (card.metaTransform) css["--builder-card-meta-transform"] = card.metaTransform;
  if (card.metaSpacing) css["--builder-card-meta-spacing"] = card.metaSpacing;
  if (card.contentSize) css["--builder-card-content-size"] = card.contentSize;
  if (card.contentColor) css["--builder-card-content-color"] = card.contentColor;
  if (card.contentLineHeight) {
    css["--builder-card-content-line-height"] = card.contentLineHeight;
  }
  if (card.contentMaxWidth) {
    css["--builder-card-content-max-width"] = card.contentMaxWidth;
  }
  if (card.buttonAlign) {
    css["--builder-card-button-align"] =
      card.buttonAlign === "center"
        ? "center"
        : card.buttonAlign === "right"
          ? "flex-end"
          : "flex-start";
  }
  if (card.buttonMargin) css["--builder-card-button-margin"] = card.buttonMargin;
  if (card.cardGap) css["--builder-card-gap"] = card.cardGap;
  if (card.cardPadding) css["--builder-card-padding"] = card.cardPadding;

  return css;
}

export function visualStyleToCss(
  style?: BuilderVisualStyle,
  paddingContext: BuilderSpacingContext = "elementPadding",
  marginContext: BuilderSpacingContext = "elementMargin",
): CSSProperties {
  if (!style) return {};

  return {
    ...paddingToCss(style.padding, paddingContext),
    ...marginToCss(style.margin, marginContext),
    ...backgroundToCss(style.background),
    ...borderToCss(style.border),
    ...effectsToCss(style.effects),
    ...cardStyleToCss(style.card),
  };
}

export function visualStyleClassName(style?: BuilderVisualStyle): string {
  if (!style) return "";
  const classes: string[] = [];
  if (style.customClass?.trim()) {
    classes.push(
      ...style.customClass
        .trim()
        .split(/\s+/)
        .filter(Boolean),
    );
  }
  if (style.card?.preset) {
    classes.push(`builder-card-preset--${style.card.preset}`);
  }
  if (style.card?.hoverPreset) {
    classes.push(`builder-hover-preset--${style.card.hoverPreset}`);
  }
  if (style.card?.imageOverlay && style.card.imageOverlay !== "none") {
    classes.push(`builder-image-overlay--${style.card.imageOverlay}`);
  }
  if (style.visibility?.desktop === false) {
    classes.push("builder-hide-desktop");
  }
  if (style.visibility?.tablet === false) {
    classes.push("builder-hide-tablet");
  }
  if (style.visibility?.mobile === false) {
    classes.push("builder-hide-mobile");
  }
  return classes.join(" ");
}

/** @internal for tests */
export { spacingSidesToCss };
