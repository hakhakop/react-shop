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
  if (value === "xs" || value === "sm" || value === "small") {
    return "uk-section uk-section-xsmall";
  }
  if (value === "md" || value === "medium") {
    return "uk-section uk-section-small";
  }
  if (value === "lg" || value === "large") {
    return "uk-section"; // default UIkit section padding
  }
  if (value === "xl") {
    return "uk-section uk-section-large";
  }
  if (value === "2xl" || value === "3xl") {
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

  if (hasFlexAlignment || options?.flex === "expand") classes.push("uk-flex", "uk-flex-column");
  if (horizontal === "center") classes.push("uk-flex-center");
  if (horizontal === "right") classes.push("uk-flex-right");
  if (vertical === "center") classes.push("uk-flex-middle");
  if (vertical === "bottom") classes.push("uk-flex-bottom");
  if (options?.flex === "expand") classes.push("uk-flex-1");
  if (options?.responsiveWidth === "stack") classes.push("uk-width-1-1@s");

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
    hover?: string;
    padding?: string;
  }
): string {
  const classes: string[] = [];

  const p = preset?.toLowerCase() || "default";

  if (p === "none" || p === "flat" || p === "blank" || p === "panel") {
    classes.push("uk-panel");
  } else if (p === "secondary" || p === "dark") {
    classes.push("uk-card", "uk-card-secondary");
  } else if (p === "primary" || p === "accent") {
    classes.push("uk-card", "uk-card-primary");
  } else {
    // default, soft, elevated, outline, glass
    classes.push("uk-card", "uk-card-default");
  }

  // Padding modifier
  const pad = options?.padding?.toLowerCase();
  if (pad === "small" || pad === "xs" || pad === "sm") {
    classes.push("uk-card-small");
  } else if (pad === "large" || pad === "lg" || pad === "xl") {
    classes.push("uk-card-large");
  }

  // Hover modifier
  const hover = options?.hover?.toLowerCase();
  if (hover && hover !== "none") {
    classes.push("uk-card-hover");
  }

  return classes.join(" ");
}

/**
 * Maps WebPages button presets and sizes to canonical UIkit button classes.
 */
export function getUikitButtonClass(preset?: string, size?: string): string {
  const classes = ["uk-button"];

  const p = preset?.toLowerCase() || "solid";

  if (p === "primary" || p === "solid") {
    classes.push("uk-button-primary");
  } else if (p === "secondary" || p === "dark") {
    classes.push("uk-button-secondary");
  } else if (p === "text" || p === "link") {
    classes.push("uk-button-text");
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

/**
 * Maps WebPages heading level and size presets to UIkit typography classes.
 */
export function getUikitHeadingClass(
  level?: string | number,
  sizePreset?: string
): string {
  const classes = ["uk-margin-remove-top"];

  const s = sizePreset?.toLowerCase();
  if (s === "xlarge" || s === "hero" || s === "display" || s === "2xl" || s === "3xl") {
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
  const v = variant.toLowerCase();
  if (v === "lead") return "uk-text-lead";
  if (v === "meta") return "uk-text-meta";
  if (v === "muted") return "uk-text-muted";
  if (v === "small" || v === "sm") return "uk-text-small";
  if (v === "large" || v === "lg") return "uk-text-large";
  return "";
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
  const s = status?.toLowerCase() || "primary";

  if (s === "success" || s === "info") {
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
