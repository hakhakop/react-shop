import type { CSSProperties } from "react";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue, resolveGlobalStyleToken } from "@/lib/globalStyleTokens";

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
  textShadow?: string;
};

export type TypographyGroup = {
  title?: TypographySettings;
  body?: TypographySettings;
  button?: TypographySettings;
  eyebrow?: TypographySettings;
};

export type TypographyArea = "title" | "body" | "button" | "eyebrow";
export type SemanticTypographyRole = "default" | "primary" | "secondary" | "tertiary";

export function typographyRoleClass(role?: SemanticTypographyRole) {
  return role && role !== "default" ? `webpages-typography-role-${role}` : "";
}

export type TypographyResolutionOptions = {
  shellSettings?: Partial<BuilderShellSettings>;
  componentDefault?: TypographySettings;
};

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

export function isTypographyGroup(
  typ?: TypographySettings | TypographyGroup,
): typ is TypographyGroup {
  if (!typ) return false;
  const group = typ as TypographyGroup;
  return Boolean(group.title || group.body || group.button || group.eyebrow);
}

export function resolveTypographyInput(
  typ?: TypographySettings | TypographyGroup,
  area?: TypographyArea,
  options?: TypographyResolutionOptions,
): TypographySettings | undefined {
  const local = resolveLocalTypographyInput(typ, area);
  if (!options) return local;

  const global = globalTypographyDefaults(area, options.shellSettings);
  const componentDefault = options.componentDefault ?? {};
  const keys = new Set<keyof TypographySettings>([
    ...Object.keys(global) as (keyof TypographySettings)[],
    ...Object.keys(componentDefault) as (keyof TypographySettings)[],
    ...Object.keys(local ?? {}) as (keyof TypographySettings)[],
  ]);
  const resolved: TypographySettings = {};

  keys.forEach((key) => {
    const value = resolveAppearanceValue({
      global: global[key],
      componentDefault: componentDefault[key],
      local: local?.[key],
    }).value;
    if (value !== undefined) {
      resolved[key] = value as never;
    }
  });

  return Object.keys(resolved).length > 0 ? resolved : undefined;
}

function resolveLocalTypographyInput(
  typ?: TypographySettings | TypographyGroup,
  area?: TypographyArea,
): TypographySettings | undefined {
  if (!typ) return undefined;

  const group = typ as TypographyGroup;
  const isGroup = isTypographyGroup(typ);

  if (isGroup) {
    if (area) {
      const specific = group[area];
      if (specific) {
        if (!specific.fontFamily) {
          const fallbackFont = group.body?.fontFamily || group.title?.fontFamily;
          if (fallbackFont) {
            return normalizeLocalTypographySettings({ ...specific, fontFamily: fallbackFont });
          }
        }
        return normalizeLocalTypographySettings(specific);
      }
      if (area === "button") {
        const fallbackFont = group.body?.fontFamily || group.title?.fontFamily;
        if (fallbackFont) {
          return normalizeLocalTypographySettings({ fontFamily: fallbackFont });
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
    return normalizeLocalTypographySettings(rest);
  }

  return normalizeLocalTypographySettings(flatSettings);
}

function normalizeLocalTypographySettings(settings: TypographySettings): TypographySettings | undefined {
  const normalized = { ...settings };
  (Object.keys(normalized) as (keyof TypographySettings)[]).forEach((key) => {
    const value = normalized[key];
    if (typeof value === "string" && (!value.trim() || value.trim().toLowerCase() === "inherit")) {
      delete normalized[key];
    }
  });
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

function globalTypographyDefaults(
  area: TypographyArea | undefined,
  shellSettings?: Partial<BuilderShellSettings>,
): TypographySettings {
  const value = (key: string, fallback: string) =>
    resolveGlobalStyleToken(key, shellSettings, undefined, fallback).value;

  if (area === "title" || area === "eyebrow") {
    return {
      fontFamily: value("fontFamilyHeading", "inherit"),
      fontWeight: value("headingFontWeight", "700"),
      lineHeight: value("headingMediumLineHeight", value("baseLineHeight", "1.5")),
      color: value("emphasisColor", value("textColor", "#111827")),
    };
  }

  if (area === "button") {
    return {
      fontFamily: value("buttonFontFamily", "inherit"),
      fontSize: value("buttonFontSize", value("baseFontSize", "16px")),
      fontWeight: value("buttonFontWeight", "600"),
      lineHeight: value("buttonLineHeight", value("baseLineHeight", "1.5")),
      letterSpacing: value("buttonLetterSpacing", "0px"),
    };
  }

  return {
    fontFamily: value("fontFamilyBody", "system-ui, sans-serif"),
    fontSize: value("baseFontSize", "16px"),
    fontWeight: "400",
    lineHeight: value("baseLineHeight", "1.5"),
    color: value("textColor", "#111827"),
  };
}

export function updateTypographyArea(
  typ: TypographySettings | TypographyGroup | undefined,
  area: TypographyArea,
  value: TypographySettings,
): TypographyGroup {
  if (isTypographyGroup(typ)) {
    return { ...typ, [area]: value };
  }

  const inherited = typ ? { ...(typ as TypographySettings) } : undefined;
  return {
    title: inherited ? { ...inherited } : undefined,
    body: inherited ? { ...inherited } : undefined,
    button: inherited ? { ...inherited } : undefined,
    eyebrow: inherited ? { ...inherited } : undefined,
    [area]: value,
  };
}

export function resetTypographyAreaProperty(
  typ: TypographySettings | TypographyGroup | undefined,
  area: TypographyArea,
  property: keyof TypographySettings,
): TypographySettings | TypographyGroup | undefined {
  if (isTypographyGroup(typ)) {
    const nextArea = { ...(typ[area] ?? {}) };
    delete nextArea[property];
    return {
      ...typ,
      [area]: Object.keys(nextArea).length > 0 ? nextArea : undefined,
    };
  }

  if (!typ) return undefined;
  const next = { ...(typ as TypographySettings) };
  delete next[property];
  return Object.keys(next).length > 0 ? next : undefined;
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

  if (resolved.textShadow) {
    style.textShadow = resolved.textShadow;
  }

  return {
    className: classes.filter(Boolean).join(" ") || undefined,
    style: Object.keys(style).length ? style : undefined,
  };
}

/**
  * Extracts allowed complementary typography styles for a heading block.
  * Explicitly excludes fontSize and variant so UIkit heading size presets remain in full control.
  * Excludes color when a gradient is active.
  */
export function getHeadingTypographyStyles(
  typ?: TypographySettings | TypographyGroup,
  hasGradient?: boolean,
): CSSProperties {
  const resolved = resolveTypographyInput(typ, "title");
  if (!resolved) return {};

  const style: CSSProperties = {};

  if (resolved.fontFamily) {
    if (!isClassLike(resolved.fontFamily) || !resolved.fontFamily.startsWith("font-")) {
      style.fontFamily = resolved.fontFamily;
    }
  }

  if (resolved.fontWeight) {
    style.fontWeight = resolved.fontWeight as CSSProperties["fontWeight"];
  }

  if (resolved.lineHeight) {
    style.lineHeight = resolved.lineHeight;
  }

  if (resolved.letterSpacing) {
    style.letterSpacing = resolved.letterSpacing;
  }

  if (resolved.textTransform && resolved.textTransform !== "none") {
    style.textTransform = resolved.textTransform as CSSProperties["textTransform"];
  }

  if (resolved.textDecoration && resolved.textDecoration !== "none") {
    style.textDecoration = resolved.textDecoration as CSSProperties["textDecoration"];
  }

  if (resolved.textShadow && resolved.textShadow !== "none") {
    style.textShadow = resolved.textShadow;
  }

  if (resolved.color && !hasGradient) {
    style.color = resolved.color;
  }

  return style;
}
