import type { BuilderLayoutBlock } from "@/lib/builderLayouts";

type GridActionItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];

export type CanonicalGridAction = {
  label: string;
  url: string;
  target: string;
  style: "primary" | "secondary" | "danger" | "default" | "text" | "link" | "link-muted" | "link-text";
  size: "small" | "default" | "large";
  fullWidth: boolean;
  margin: string | undefined;
};

function normalizeActionStyle(value: unknown): CanonicalGridAction["style"] {
  const rawStyle = String(value ?? "").trim().toLowerCase();
  // `link-muted` and `link-text` are complete canonical values, not a
  // `link-` prefix followed by a button variant.
  if (rawStyle === "link-muted" || rawStyle === "link-text") return rawStyle;
  const style = rawStyle.replace(/^button-/, "").replace(/^link-/, "");
  if (style === "primary" || style === "solid") return "primary";
  if (style === "secondary" || style === "dark") return "secondary";
  if (style === "danger") return "danger";
  if (style === "text") return "text";
  if (style === "link") return "link";
  if (style === "link-muted") return "link-muted";
  if (style === "link-text") return "link-text";
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
  const allLegacyItemStyles = (block.gridItems ?? [])
    .filter((entry) => entry.buttonStyleSource !== "item")
    .map((entry) => entry.buttonStyle)
    .filter((style): style is NonNullable<GridActionItem["buttonStyle"]> => typeof style === "string");
  // A previous importer version copied one Grid-owned YOOtheme `link_style`
  // onto every imported child. When all legacy children agree, treat that
  // value as the copied default rather than an item override. This keeps
  // existing documents responsive to their canonical Grid Link control while
  // preserving explicit item styles imported by the corrected path.
  const ignoresLegacyCopiedItemStyle = block.id.startsWith("yootheme-grid-")
    && allLegacyItemStyles.length === (block.gridItems ?? []).length
    && new Set(allLegacyItemStyles).size === 1
    && rawItem.buttonStyleSource !== "item";
  const itemStyle = ignoresLegacyCopiedItemStyle
    ? undefined
    : rawItem.buttonStyle ?? rawItem.actionStyle ?? rawItem.linkStyle;
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
