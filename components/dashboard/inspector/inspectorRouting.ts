import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";

/** Normal page kinds with a dedicated capability-driven inspector path. */
export const CANONICAL_INSPECTOR_KINDS = [
  "button", "panel", "heading", "text", "list", "accordion", "image",
  "hero", "grid", "icon", "badgeGrid", "table", "divider", "alert", "breadcrumbs", "datePicker",
] as const satisfies readonly LayoutBlockKind[];

/**
 * Explicitly documented legacy paths. These remain visible while their larger
 * data-heavy editors are migrated; they are never silently treated as modern.
 */
export const LEGACY_INSPECTOR_ALLOWLIST = [
  "promoStrip", "slider", "scrollPinnedDemo",
  "embed", "fluentForm", "menu",
  "products", "categoryFilters",
  "cartContent", "checkoutContent", "accountContent",
] as const satisfies readonly LayoutBlockKind[];

export function classifyInspectorKind(kind: LayoutBlockKind) {
  return (CANONICAL_INSPECTOR_KINDS as readonly string[]).includes(kind)
    ? "canonical"
    : (LEGACY_INSPECTOR_ALLOWLIST as readonly string[]).includes(kind)
      ? "legacy-allowlisted"
      : "unclassified";
}
