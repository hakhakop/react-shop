import type { CSSProperties } from "react";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
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

export type BuilderVisualStyle = {
  padding?: BuilderSpacingSides;
  margin?: BuilderSpacingSides;
  background?: BuilderBackgroundStyle;
  border?: BuilderBorderStyle;
  effects?: BuilderEffectsStyle;
  visibility?: BuilderVisibilityStyle;
  customClass?: string;
};

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
): CSSProperties {
  if (!padding) return {};
  const top = resolveSideValue(padding.top, "elementPadding");
  const right = resolveSideValue(
    padding.right ?? (padding.linked ? padding.top : undefined),
    "elementPadding",
  );
  const bottom = resolveSideValue(
    padding.bottom ?? (padding.linked ? padding.top : undefined),
    "elementPadding",
  );
  const left = resolveSideValue(
    padding.left ?? (padding.linked ? padding.top : padding.right),
    "elementPadding",
  );

  return {
    ...(top !== undefined ? { paddingTop: top } : {}),
    ...(right !== undefined ? { paddingRight: right } : {}),
    ...(bottom !== undefined ? { paddingBottom: bottom } : {}),
    ...(left !== undefined ? { paddingLeft: left } : {}),
  };
}

export function marginToCss(margin?: BuilderSpacingSides): CSSProperties {
  if (!margin) return {};
  const top = resolveSideValue(margin.top, "elementMargin");
  const right = resolveSideValue(
    margin.right ?? (margin.linked ? margin.top : undefined),
    "elementMargin",
  );
  const bottom = resolveSideValue(
    margin.bottom ?? (margin.linked ? margin.top : undefined),
    "elementMargin",
  );
  const left = resolveSideValue(
    margin.left ?? (margin.linked ? margin.top : margin.right),
    "elementMargin",
  );

  return {
    ...(top !== undefined ? { marginTop: top } : {}),
    ...(right !== undefined ? { marginRight: right } : {}),
    ...(bottom !== undefined ? { marginBottom: bottom } : {}),
    ...(left !== undefined ? { marginLeft: left } : {}),
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

export function visualStyleToCss(style?: BuilderVisualStyle): CSSProperties {
  if (!style) return {};

  return {
    ...paddingToCss(style.padding),
    ...marginToCss(style.margin),
    ...backgroundToCss(style.background),
    ...borderToCss(style.border),
    ...effectsToCss(style.effects),
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
