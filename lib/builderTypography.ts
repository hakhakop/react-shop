import type { CSSProperties } from "react";

export type TypographyVariant = "heading" | "subheading" | "body" | "button";

export type TypographySettings = {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string | number;
  lineHeight?: string;
  letterSpacing?: string;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textDecoration?: "none" | "underline" | "line-through";
  variant?: TypographyVariant;
};

export type TypographyGroup = {
  title?: TypographySettings;
  body?: TypographySettings;
  button?: TypographySettings;
  eyebrow?: TypographySettings;
};

export type TypographyArea = "title" | "body" | "button" | "eyebrow";

function isClassLike(value?: string) {
  return typeof value === "string" && /^[a-z-]+[0-9a-z-]*$/.test(value);
}

function normalizeFontSize(value?: string) {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (/^-?\d*\.?\d+$/.test(trimmed)) {
    return `${trimmed}px`;
  }
  return trimmed;
}

function resolveTypographyInput(
  typ?: TypographySettings | TypographyGroup,
  area?: TypographyArea,
): TypographySettings | undefined {
  if (!typ) return undefined;

  const group = typ as TypographyGroup;
  const isGroup = Boolean(group.title || group.body || group.button || group.eyebrow);

  if (isGroup) {
    if (area) {
      const specific = group[area];
      if (specific) {
        if (!specific.fontFamily) {
          const fallbackFont = group.body?.fontFamily || group.title?.fontFamily;
          if (fallbackFont) {
            return { ...specific, fontFamily: fallbackFont };
          }
        }
        return specific;
      }
      if (area === "button") {
        const fallbackFont = group.body?.fontFamily || group.title?.fontFamily;
        if (fallbackFont) {
          return { fontFamily: fallbackFont };
        }
      }
      return undefined;
    }
    return group.title ?? group.body ?? group.button ?? group.eyebrow;
  }

  const flatSettings = typ as TypographySettings;
  if (area === "button") {
    // Buttons have their own background boxes, so they must not inherit a general
    // flat text color from section/parent container typography (which could cause
    // contrast issues, like white text on a white button).
    const { color, ...rest } = flatSettings;
    return rest;
  }

  return flatSettings;
}

export function typographyProps(
  typ?: TypographySettings | TypographyGroup,
  area?: TypographyArea,
): { className?: string; style?: CSSProperties } {
  const resolved = resolveTypographyInput(typ, area);
  if (!resolved) return { className: undefined, style: undefined };

  const classes: string[] = [];
  const style: CSSProperties = {};

  if (resolved.variant) {
    const isHeadingArea = area === "title" || area === "eyebrow";
    const isHeadingVariant = resolved.variant === "heading" || resolved.variant === "subheading";
    const isBodyArea = area === "body" || !area;
    const isBodyVariant = resolved.variant === "body";
    const isButtonArea = area === "button";
    const isButtonVariant = resolved.variant === "button";

    const shouldApplyVariant =
      (isHeadingArea && isHeadingVariant) ||
      (isBodyArea && isBodyVariant) ||
      (isButtonArea && isButtonVariant) ||
      (!isHeadingArea && !isButtonArea);

    if (shouldApplyVariant) {
      if (resolved.variant === "heading") {
        style.fontSize = "clamp(42px, 8vw, 126px)";
        style.fontWeight = 760;
        style.lineHeight = "0.92";
        style.letterSpacing = "0";
      }

      if (resolved.variant === "subheading") {
        style.fontSize = "clamp(24px, 3vw, 44px)";
        style.fontWeight = 700;
        style.lineHeight = "1";
        style.letterSpacing = "0";
      }

      if (resolved.variant === "body") {
        style.fontSize = "16px";
        style.fontWeight = 400;
        style.lineHeight = "1.7";
      }

      if (resolved.variant === "button") {
        style.fontSize = "14px";
        style.fontWeight = 720;
        style.lineHeight = "1";
        style.letterSpacing = "0";
      }
    }
  }

  if (resolved.fontSize) {
    style.fontSize = normalizeFontSize(resolved.fontSize);
  }

  if (resolved.fontWeight) {
    const weight = String(resolved.fontWeight);
    if (isClassLike(weight) && weight.startsWith("font-")) {
      classes.push(weight);
    } else {
      style.fontWeight = resolved.fontWeight as CSSProperties["fontWeight"];
    }
  }

  if (resolved.lineHeight) {
    if (
      isClassLike(resolved.lineHeight) &&
      resolved.lineHeight.startsWith("leading-")
    ) {
      classes.push(resolved.lineHeight);
    } else {
      style.lineHeight = resolved.lineHeight;
    }
  }

  if (resolved.letterSpacing) {
    if (
      isClassLike(resolved.letterSpacing) &&
      resolved.letterSpacing.startsWith("tracking-")
    ) {
      classes.push(resolved.letterSpacing);
    } else {
      style.letterSpacing = resolved.letterSpacing;
    }
  }

  if (resolved.color) {
    if (isClassLike(resolved.color) && resolved.color.startsWith("text-")) {
      classes.push(resolved.color);
    } else {
      style.color = resolved.color;
    }
  }

  if (resolved.textAlign) {
    const map: Record<string, string> = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    };
    classes.push(map[resolved.textAlign] ?? "");
    style.textAlign = resolved.textAlign;

    if (area === "button") {
      style.justifySelf =
        resolved.textAlign === "center"
          ? "center"
          : resolved.textAlign === "right"
            ? "end"
            : "start";
    } else {
      style.display = "block";
      style.width = "100%";
    }
  }

  if (resolved.textTransform) {
    if (isClassLike(resolved.textTransform)) {
      classes.push(resolved.textTransform);
    } else {
      style.textTransform = resolved.textTransform;
    }
  }

  if (resolved.textDecoration) {
    if (isClassLike(resolved.textDecoration)) {
      classes.push(resolved.textDecoration);
    } else {
      style.textDecoration = resolved.textDecoration;
    }
  }

  if (resolved.fontFamily) {
    if (
      isClassLike(resolved.fontFamily) &&
      resolved.fontFamily.startsWith("font-")
    ) {
      classes.push(resolved.fontFamily);
    } else {
      style.fontFamily = resolved.fontFamily;
    }
  }

  return {
    className: classes.filter(Boolean).join(" ") || undefined,
    style: Object.keys(style).length ? style : undefined,
  };
}
