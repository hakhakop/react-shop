import { getUikitCardClass } from "@/lib/uikitTokens";

type PanelLike = Record<string, unknown>;

type CardColorRole = "primary" | "secondary" | null;

function cardColorRole(variant: unknown): CardColorRole {
  const normalized = String(variant ?? "default").trim().toLowerCase();
  if (["primary", "card-primary", "tile-primary", "accent"].includes(normalized)) return "primary";
  if (["secondary", "card-secondary", "tile-secondary", "dark"].includes(normalized)) return "secondary";
  return null;
}

function hasExplicitColor(value: unknown) {
  return typeof value === "string" && !["", "inherit", "default", "none"].includes(value.trim().toLowerCase());
}

/**
 * Resolve the semantic text/link palette for colored Card and Tile surfaces.
 * Global Card role tokens remain the source of truth; local color utilities
 * still win because they apply a concrete color on the child itself.
 */
export function resolvePanelColorSemantics(block: PanelLike) {
  const role = cardColorRole(block.panelVariant ?? block.panelStyle ?? block.cardVariant);
  const variant = String(block.panelVariant ?? block.panelStyle ?? block.cardVariant ?? "").trim().toLowerCase();
  const isDefaultCard = ["default", "card-default"].includes(variant);
  if (!role && !isDefaultCard) return {
    className: "",
    style: {} as Record<string, string>,
    metaStyle: {} as Record<string, string>,
  };

  // UIkit's default Card body is muted, but its title inherits the global
  // emphasis color. Keep this distinction in the shared panel resolver so a
  // YOOtheme Grid and a standalone Panel cannot diverge.
  if (!role) {
    const style: Record<string, string> = {
      // Default Cards inherit the page's emphasis/text/link palette in
      // YOOtheme. Do not freeze Circle's dark-surface text to the light-mode
      // fallback token (`#111827`).
      "--builder-card-content-color": "var(--uk-global-emphasis-color, var(--uk-card-default-color, inherit))",
      "--builder-card-meta-color": "var(--uk-global-emphasis-color, var(--uk-card-default-color, inherit))",
      "--uk-global-link-color": "var(--uk-global-emphasis-color, inherit)",
      "--uk-global-link-hover-color": "var(--uk-global-emphasis-color, inherit)",
      "--uk-button-text-color": "var(--uk-global-emphasis-color, inherit)",
      "--uk-button-link-color": "var(--uk-global-emphasis-color, inherit)",
    };
    if (!hasExplicitColor(block.titleColor ?? block.panelTitleColor)) {
      style["--builder-card-title-color"] = "var(--uk-global-emphasis-color, var(--uk-card-default-title, inherit))";
    }
    return { className: "", style, metaStyle: {} as Record<string, string> };
  }

  const text = `var(--uk-card-${role}-text, var(--uk-global-inverse-color, var(--uk-global-color, currentColor)))`;
  const title = `var(--uk-card-${role}-title, ${text})`;
  const surface = `var(--uk-card-${role}-background, transparent)`;
  const hasExplicitActionColor = hasExplicitColor(
    block.buttonTextColor ?? block.panelActionTextColor ?? block.linkColor,
  );
  const hasExplicitMetaColor = hasExplicitColor(block.metaColor ?? block.panelMetaColor);
  const style: Record<string, string> = {
    "--uk-global-link-color": text,
    "--uk-global-link-hover-color": text,
  };

  // UIkit Default actions are inverse-outline actions on an inverse surface.
  // Primary/Secondary classes retain their explicit global variant tokens.
  if (!hasExplicitActionColor) {
    Object.assign(style, {
      // On a primary Card, YOOtheme's default link is the filled inverse
      // action (white surface, dark text), not the generic outline fallback.
      "--uk-button-default-background": role === "primary" ? text : "transparent",
      "--uk-button-default-text": role === "primary"
        ? "var(--uk-global-emphasis-color, var(--uk-global-color, #111111))"
        : text,
      "--uk-button-default-border": role === "primary" ? "transparent" : text,
      "--uk-button-default-hover-background": role === "primary"
        ? "var(--uk-button-inverse-default-hover-background, color-mix(in srgb, var(--uk-global-inverse-color, #fff) 95%, #000))"
        : text,
      "--uk-button-default-hover-text": role === "primary"
        ? "var(--uk-button-inverse-default-hover-text, var(--uk-global-text-color, #111827))"
        : surface,
      "--uk-button-default-hover-border": role === "primary" ? "transparent" : text,
      "--uk-button-text-color": text,
      "--uk-button-link-color": text,
      // YOOtheme's inverse surface contract also applies to an inheriting
      // primary action.  This matters for DevStack: the global primary button
      // is a gradient, while a primary Card intentionally presents that same
      // action as a light/emphasis control.  Keep it token-based so an
      // explicit action style/color still wins.
      "--uk-button-primary-gradient": "none",
      "--uk-button-primary-background": text,
      "--uk-button-primary-text": "var(--uk-global-emphasis-color, var(--uk-global-color, currentColor))",
      "--uk-button-primary-border": text,
      "--uk-button-primary-hover-gradient": "none",
      "--uk-button-primary-hover-background": text,
      "--uk-button-primary-hover-text": "var(--uk-global-link-hover-color, var(--uk-global-emphasis-color, currentColor))",
      "--uk-button-primary-hover-border": text,
      ...(role === "primary"
        ? {
            // Project the canonical YOOtheme inverse-button tokens onto the
            // card-local default action. This prevents the normal light-card
            // shadow from leaking into the solid CTA.
            "--uk-button-default-shadow": "var(--uk-button-inverse-default-shadow, 0 5px 15px rgba(0, 0, 0, 0.2))",
            "--uk-button-default-hover-shadow": "var(--uk-button-inverse-default-shadow, 0 5px 15px rgba(0, 0, 0, 0.2))",
            "--uk-button-default-active-shadow": "var(--uk-button-inverse-default-shadow, 0 5px 15px rgba(0, 0, 0, 0.2))",
          }
        : {}),
    });
  }

  if (!hasExplicitColor(block.titleColor ?? block.panelTitleColor)) {
    style["--builder-card-title-color"] = title;
  }
  if (!hasExplicitMetaColor) {
    style["--builder-card-meta-color"] = text;
  }
  if (!hasExplicitColor(block.contentColor ?? block.panelContentColor)) {
    style["--builder-card-content-color"] = text;
  }

  return {
    className: `shop-builder-card--inverse uk-light${hasExplicitMetaColor ? "" : " shop-builder-card--inverse-meta"}`,
    style,
    metaStyle: hasExplicitMetaColor
      ? {}
      : { color: "var(--builder-card-meta-color, inherit)" },
  };
}

/**
 * Canonical Panel/Card presentation resolver shared by the Builder preview
 * and storefront. It owns only Panel presentation; media appearance stays in
 * the Phase 5 image resolver and actions stay in the Phase 6 button path.
 */
export function resolvePanelPresentation(block: PanelLike) {
  const padding = typeof block.panelSize === "string" ? block.panelSize : "default";
  const expand = block.panelExpand === "image" || block.panelExpand === "content" || block.panelExpand === "both"
    ? block.panelExpand
    : "none";
  const linked = block.linkPanel === true && typeof block.buttonUrl === "string" && block.buttonUrl.length > 0;
  const colorSemantics = resolvePanelColorSemantics(block);
  const classes = [
    getUikitCardClass(String(block.panelVariant ?? block.panelStyle ?? "default"), {
      hover: block.panelHover === true,
      padding,
    }),
    // Undefined is a compatibility fallback for pre-Phase-7 documents,
    // which already rendered their media edge-to-edge.
    block.panelImageNoPadding === false
      ? "shop-builder-panel--media-padded"
      : "shop-builder-panel--media-flush",
    block.panelHeightExpand === true ? "shop-builder-panel--height-expand" : "",
    expand !== "none" ? `shop-builder-panel--expand-${expand}` : "",
    linked ? "shop-builder-panel--linked" : "",
    colorSemantics.className,
  ].filter(Boolean).join(" ");

  return {
    className: classes,
    linked,
    linkHref: linked ? String(block.buttonUrl) : undefined,
    metaPosition: block.panelMetaPosition === "above-title" || block.panelMetaPosition === "above-content" || block.panelMetaPosition === "below-content"
      ? block.panelMetaPosition
      : "below-title",
    colorStyle: colorSemantics.style,
  } as const;
}
