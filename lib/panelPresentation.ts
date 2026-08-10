import { getUikitCardClass } from "@/lib/uikitTokens";

type PanelLike = Record<string, unknown>;

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
  ].filter(Boolean).join(" ");

  return {
    className: classes,
    linked,
    linkHref: linked ? String(block.buttonUrl) : undefined,
    metaPosition: block.panelMetaPosition === "above-title" || block.panelMetaPosition === "above-content" || block.panelMetaPosition === "below-content"
      ? block.panelMetaPosition
      : "below-title",
  } as const;
}
