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
  return {
    label: String(raw.buttonLabel ?? rawItem.buttonLabel ?? raw.linkText ?? "Read more"),
    url: String(raw.buttonUrl ?? rawItem.buttonUrl ?? "#"),
    target: String(raw.buttonTarget ?? raw.linkTarget ?? rawItem.buttonTarget ?? "_self"),
    style: normalizeActionStyle(
      raw.buttonStyle ?? rawItem.actionStyle ?? rawItem.buttonStyle ?? raw.linkStyle,
    ),
    size: normalizeActionSize(
      raw.size ?? rawItem.actionSize ?? raw.linkButtonSize,
    ),
    fullWidth: raw.fullWidthButton === true || raw.linkFullWidth === true,
    margin: typeof raw.linkMarginTop === "string" ? raw.linkMarginTop : undefined,
  };
}
