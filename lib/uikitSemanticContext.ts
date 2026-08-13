/**
 * Canonical text/surface context for UIkit-compatible Builder content.
 *
 * Global Styles owns the normal palette. A semantic dark surface only
 * establishes an inverse context; it must not substitute an unrelated
 * Builder-only palette. Both Builder and storefront consume this helper.
 */
export type UikitSemanticColorScheme = "light" | "dark" | "auto";

type LayoutLike = { sections?: unknown[] };

/**
 * Imported UIkit/YOOtheme blocks retain this explicit provenance on their
 * General shell. It lets the root select the Global Styles compatibility
 * bridge without changing native WebPages documents or adding hidden state.
 */
export function hasYoothemeImportContract(layout: LayoutLike): boolean {
  const visit = (value: unknown): boolean => {
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some(visit);
    const record = value as Record<string, unknown>;
    if (record.spacingContract === "yootheme") return true;
    return Object.values(record).some(visit);
  };

  return visit(layout.sections);
}

/**
 * Compatibility aliases for legacy Builder presentation consumers.
 *
 * They are applied only at a YOOtheme-imported document root. Existing
 * native page-design presets therefore remain intact, while imported content
 * reaches the same canonical Global Styles tokens as UIkit components.
 */
export function getYoothemeImportGlobalAliases(): Record<string, string> {
  return {
    background: "var(--webpages-background-default, var(--uk-global-background-color, #fff))",
    "--builder-page-bg": "var(--webpages-background-default, var(--uk-global-background-color, #fff))",
    "--builder-text": "var(--uk-global-text-color, #111827)",
    "--builder-muted": "var(--uk-global-muted-text-color, #6b7280)",
    "--builder-accent": "var(--uk-global-primary-color, #111111)",
    "--builder-surface": "var(--webpages-background-muted, var(--uk-global-muted-background, #f8fafc))",
    "--builder-button-bg": "var(--uk-button-primary-background, var(--uk-global-primary-color, #111111))",
    "--builder-button-text": "var(--uk-button-primary-text, #fff)",
    // Preview consumers are legacy names, not a second palette. Imported
    // documents deliberately point them at the same Global Styles tokens.
    "--builder-preview-text": "var(--uk-global-text-color, #111827)",
    "--builder-preview-muted": "var(--uk-global-muted-text-color, #6b7280)",
    "--builder-preview-accent": "var(--uk-global-primary-color, #111111)",
    "--builder-preview-surface": "var(--webpages-background-muted, var(--uk-global-muted-background, #f8fafc))",
    "--builder-preview-button-bg": "var(--uk-button-primary-background, var(--uk-global-primary-color, #111111))",
    "--builder-preview-button-text": "var(--uk-button-primary-text, #fff)",
    "--builder-card-bg": "var(--uk-card-default-background, #fff)",
    "--builder-card-radius": "var(--uk-card-border-radius, var(--uk-global-border-radius, 8px))",
    "--builder-card-border": "var(--uk-card-default-border, var(--uk-global-border-color, transparent))",
    "--builder-card-shadow": "var(--uk-card-shadow, none)",
    "--builder-card-shadow-hover": "var(--uk-card-hover-shadow, var(--uk-card-shadow, none))",
    "--builder-card-image-bg": "var(--uk-card-default-background, #fff)",
    "--builder-card-image-padding": "var(--uk-card-padding, 30px)",
  };
}

export function getUikitSemanticContextVars(
  scheme: UikitSemanticColorScheme,
  customBackground?: string,
): Record<string, string | undefined> {
  const inverse = scheme === "dark";
  const text = inverse
    ? "var(--uk-global-inverse-color, #fff)"
    : "var(--uk-global-text-color, #111827)";
  const muted = inverse
    ? "var(--uk-global-inverse-color, #fff)"
    : "var(--uk-global-muted-text-color, #6b7280)";
  const emphasis = inverse
    ? "var(--uk-global-inverse-color, #fff)"
    : "var(--uk-global-emphasis-color, var(--uk-global-text-color, #111827))";
  const surface = inverse
    ? "var(--webpages-background-secondary, #111827)"
    : "var(--webpages-background-default, var(--uk-global-background-color, #fff))";
  // UIkit's inverse mode is a context, rather than a second component
  // palette. Keep the semantic values here so every component can consume
  // exactly the same inherited roles. A component's explicit local color
  // still wins through its own class/style above these fallback variables.
  const inverseSurface = "var(--uk-global-inverse-color, #fff)";
  const inverseSurfaceText = "var(--uk-global-emphasis-color, var(--uk-global-text-color, #111827))";
  const inverseMuted = "color-mix(in srgb, var(--uk-global-inverse-color, #fff) 70%, transparent)";
  const divider = inverse
    ? "color-mix(in srgb, var(--uk-global-inverse-color, #fff) 24%, transparent)"
    : "var(--uk-accordion-item-border, var(--uk-global-border-color, rgba(0,0,0,.12)))";
  const accordionTitle = inverse
    ? "var(--uk-global-inverse-color, #fff)"
    : "var(--uk-accordion-title-color, var(--uk-global-emphasis-color, var(--uk-global-text-color, #111827)))";
  const accordionIcon = inverse
    ? inverseMuted
    : "var(--uk-accordion-icon-color, currentColor)";
  const accordionHover = inverse
    ? inverseMuted
    : "var(--uk-accordion-title-hover-color, var(--uk-global-primary-color, #1e87f0))";

  return {
    "--context-bg": customBackground || "transparent",
    "--context-text": text,
    "--context-muted": muted,
    "--context-emphasis": emphasis,
    "--context-surface": surface,
    // Canonical UIkit text utility roles. Utility classes resolve these
    // values instead of carrying fixed light-surface colors in CSS.
    "--uikit-text-default-color": text,
    "--uikit-text-lead-color": emphasis,
    "--uikit-text-meta-color": muted,
    "--uikit-text-muted-color": muted,
    "--uikit-text-emphasis-color": emphasis,
    "--uikit-text-primary-color": inverse
      ? inverseSurface
      : "var(--uk-global-primary-color, #1e87f0)",
    "--uikit-text-secondary-color": inverse
      ? inverseSurface
      : "var(--uk-global-emphasis-color, var(--uk-global-text-color, #111827))",
    // Accordion consumes the same context roles while retaining its global
    // tokens on light surfaces and local item/title overrides at the element.
    "--uikit-accordion-title-color": accordionTitle,
    "--uikit-accordion-content-color": text,
    "--uikit-accordion-icon-color": accordionIcon,
    "--uikit-accordion-divider-color": divider,
    "--uikit-accordion-title-hover-color": accordionHover,
    "--builder-section-text": text,
    "--builder-section-muted": muted,
    "--builder-section-button-bg": "var(--uk-button-primary-background, var(--uk-global-primary-color, #111111))",
    "--builder-section-button-text": "var(--uk-button-primary-text, #fff)",
    "--builder-active-text": text,
    "--builder-active-muted": muted,
    "--builder-active-heading": emphasis,
    "--builder-active-surface": surface,
    "--builder-active-button-bg": "var(--uk-button-primary-background, var(--uk-global-primary-color, #111111))",
    "--builder-active-button-text": "var(--uk-button-primary-text, #fff)",
    ...(inverse
      ? {
          // UIkit's inverse default Button is the inverse primary surface:
          // filled with the global inverse color and using the normal global
          // text token. Individual YOOtheme styles may still author these
          // tokens, but their absence must preserve the UIkit fallback.
          "--uk-button-default-background": "var(--uk-button-inverse-default-background, var(--uk-global-inverse-color, #fff))",
          "--uk-button-default-text": "var(--uk-button-inverse-default-text, var(--uk-global-text-color, #111827))",
          "--uk-button-default-border": "var(--uk-button-inverse-default-border, var(--uk-global-inverse-color, #fff))",
          "--uk-button-default-shadow": "var(--uk-button-inverse-default-shadow, none)",
          "--uk-button-default-hover-shadow": "var(--uk-button-inverse-default-shadow, none)",
          "--uk-button-default-hover-background": "var(--uk-button-inverse-default-hover-background, color-mix(in srgb, var(--uk-global-inverse-color, #fff) 95%, #000))",
          "--uk-button-default-hover-text": "var(--uk-button-inverse-default-hover-text, var(--uk-global-text-color, #111827))",
          "--uk-button-default-hover-border": "var(--uk-button-inverse-default-hover-border, var(--uk-global-inverse-color, #fff))",
          "--uk-button-default-active-background": "var(--uk-button-inverse-default-active-background, color-mix(in srgb, var(--uk-global-inverse-color, #fff) 90%, #000))",
          "--uk-button-default-active-text": "var(--uk-button-inverse-default-active-text, var(--uk-global-text-color, #111827))",
          "--uk-button-default-active-border": "var(--uk-button-inverse-default-active-border, var(--uk-global-inverse-color, #fff))",
          "--uk-button-primary-shadow": "var(--uk-button-inverse-primary-shadow, none)",
          "--uk-button-secondary-background": "var(--uk-button-inverse-secondary-background, transparent)",
          "--uk-button-secondary-text": "var(--uk-button-inverse-secondary-text, var(--uk-global-inverse-color, #fff))",
          "--uk-button-secondary-border": "var(--uk-button-inverse-secondary-border, var(--uk-global-inverse-color, #fff))",
          "--uk-button-secondary-hover-background": "var(--uk-button-inverse-secondary-hover-background, var(--uk-global-inverse-color, #fff))",
          "--uk-button-secondary-hover-gradient": "none",
          "--uk-button-secondary-hover-text": "var(--uk-button-inverse-secondary-hover-text, var(--uk-global-text-color, #111827))",
          "--uk-button-secondary-hover-border": "var(--uk-button-inverse-secondary-border, var(--uk-global-inverse-color, #fff))",
          "--uk-button-secondary-active-background": "var(--uk-button-inverse-secondary-active-background, color-mix(in srgb, var(--uk-global-inverse-color, #fff) 80%, transparent))",
          "--uk-button-secondary-active-gradient": "none",
          "--uk-button-secondary-active-text": "var(--uk-button-inverse-secondary-active-text, var(--uk-global-text-color, #111827))",
          "--uk-button-secondary-active-border": "var(--uk-button-inverse-secondary-border, var(--uk-global-inverse-color, #fff))",
          "--uk-button-secondary-shadow": "none",
          "--uk-button-secondary-hover-shadow": "none",
          "--uk-button-secondary-active-shadow": "none",
          "--uk-button-text-color": "var(--uk-global-inverse-color, #fff)",
          "--uk-button-text-hover-color": inverseMuted,
          "--uk-button-text-active-color": inverseMuted,
          "--uk-button-link-color": "var(--uk-global-inverse-color, #fff)",
          "--uk-button-link-hover-color": inverseMuted,
          "--uk-global-link-color": "var(--uk-global-inverse-color, #fff)",
        }
      : {}),
  };
}
