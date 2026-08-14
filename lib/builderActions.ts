import type { BuilderLayoutBlock } from "@/lib/builderLayouts";

type GridActionItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];

export type CanonicalGridAction = {
  label: string;
  url: string;
  target: string;
  style: "primary" | "secondary" | "default" | "text";
  size: "small" | "default" | "large";
  fullWidth: boolean;
  margin: string | undefined;
};

function normalizeActionStyle(value: unknown): CanonicalGridAction["style"] {
  const style = String(value ?? "").trim().toLowerCase().replace(/^(button|link)-/, "");
  if (style === "primary" || style === "solid") return "primary";
  if (style === "secondary" || style === "dark") return "secondary";
  if (style === "text" || style === "link") return "text";
  return "default";
}

function normalizeActionSize(value: unknown): CanonicalGridAction["size"] {
  const size = String(value ?? "").trim().toLowerCase();
  if (size === "small" || size === "sm") return "small";
  if (size === "large" || size === "lg") return "large";
  return "default";
}

/**
 * One compatibility resolver for a Grid item's action. It preserves old
 * `link*` aliases as read-only fallbacks, while new imports and inspectors
 * write the canonical button fields used by every active renderer.
 */
export function resolveCanonicalGridAction(
  block: BuilderLayoutBlock,
  item: GridActionItem,
): CanonicalGridAction {
  const raw = block as BuilderLayoutBlock & Record<string, unknown>;
  const rawItem = item as GridActionItem & Record<string, unknown>;
  // A Grid link belongs to its item. Grid-level link text/style are shared
  // presentation defaults only; they must never manufacture `Read more → #`
  // for an item with no canonical URL.
  const itemUrl = rawItem.buttonUrl ?? rawItem.linkUrl ?? rawItem.link;
  const cardVariant = String(rawItem.cardVariant ?? raw.gridCardVariant ?? raw.panelVariant ?? "").toLowerCase();
  const itemStyle = rawItem.buttonStyle ?? rawItem.actionStyle ?? rawItem.linkStyle;
  let style = normalizeActionStyle(itemStyle ?? raw.buttonStyle ?? raw.linkStyle);
  // YOOtheme's primary card uses the default (solid) button unless the item
  // explicitly authors a button style. Do not let a Grid-level fallback
  // promote that inverse-card CTA to the primary gradient/shadow contract.
  if (itemStyle == null && (cardVariant === "primary" || cardVariant === "card-primary")) {
    style = "default";
  }
  if (raw.spacingContract === "yootheme" && style === "default" && (cardVariant === "default" || cardVariant === "card-default")) {
    style = "primary";
  }
  return {
    label: String(rawItem.buttonLabel ?? raw.buttonLabel ?? raw.linkText ?? "").trim(),
    url: typeof itemUrl === "string" ? itemUrl.trim() : "",
    target: String(rawItem.buttonTarget ?? rawItem.linkTarget ?? raw.buttonTarget ?? raw.linkTarget ?? "_self"),
    style,
    size: normalizeActionSize(
      rawItem.actionSize ?? raw.size ?? raw.linkButtonSize,
    ),
    fullWidth: raw.fullWidthButton === true || raw.linkFullWidth === true,
    margin: typeof raw.linkMarginTop === "string" ? raw.linkMarginTop : undefined,
  };
}
