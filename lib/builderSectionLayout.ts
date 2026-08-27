import type {
  BuilderColumn,
  BuilderResponsiveColumnOrder,
  BuilderResponsiveColumnWidths,
  BuilderRow,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import {
  UIKIT_LAYOUT_PRESETS,
  normalizeLayoutToUikitPreset,
} from "@/lib/uikitLayoutEngine";

type LegacyLayoutItem = NonNullable<BuilderSection["layoutItems"]>[number];

export type BuilderSectionLayoutConflict = {
  rowId: string;
  field: string;
  selectedItemId?: string;
  selectedValue: unknown;
  conflictingValues: Array<{
    itemId?: string;
    value: unknown;
  }>;
};

export type NormalizedBuilderSectionLayout = {
  source: "canonical" | "legacy";
  rows: BuilderRow[];
  conflicts: BuilderSectionLayoutConflict[];
};

const REPEATED_LEGACY_ROW_FIELDS = [
  "rowLayout",
  "rowBackground",
  "rowBackgroundMode",
  "rowBackgroundEffect",
  "rowAntigravitySpeed",
  "rowAntigravityParticleCount",
  "rowAntigravityColor",
  "rowAntigravityGridDensity",
  "rowAntigravityInteractive",
  "rowAntigravityShowGrid",
  "rowAntigravityShowParticles",
  "rowAntigravityGridMoveSpeed",
  "rowAntigravityGlowIntensity",
  "rowAntigravityVisualMode",
  "rowAntigravityInteractionScope",
  "rowColorScheme",
  "rowTopSpacing",
  "rowBottomSpacing",
  "rowTopMargin",
  "rowBottomMargin",
  "rowGap",
  "rowAlignment",
  "rowJustify",
  "rowMatchHeight",
  "rowBorderRadius",
  "rowVisualStyle",
  "rowAnimation",
  "role",
  "headerVariant",
  "maxWidth",
  "removeHorizontalPadding",
  "horizontalDistribution",
  "headerGap",
  "headerJustify",
  "headerAlign",
] as const satisfies readonly (keyof LegacyLayoutItem)[];

function stableValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableValue).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableValue(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function resolveRepeatedRowField(
  rowId: string,
  items: LegacyLayoutItem[],
  field: keyof LegacyLayoutItem,
  conflicts: BuilderSectionLayoutConflict[],
) {
  const authored = items
    .map((item) => ({ item, value: item[field] }))
    .filter((entry) => entry.value !== undefined);
  const selected = authored[0];
  if (!selected) return undefined;

  const selectedKey = stableValue(selected.value);
  const different = authored.filter(
    (entry) => stableValue(entry.value) !== selectedKey,
  );
  if (different.length > 0) {
    conflicts.push({
      rowId,
      field: String(field),
      selectedItemId: selected.item.id,
      selectedValue: selected.value,
      conflictingValues: different.map(({ item, value }) => ({
        itemId: item.id,
        value,
      })),
    });
  }
  return selected.value;
}

function legacyHorizontalDistribution(
  value: LegacyLayoutItem["rowJustify"],
): BuilderRow["horizontalDistribution"] {
  if (value === "start") return "left";
  if (value === "center") return "center";
  if (value === "between" || value === "around") return "justify";
  return undefined;
}

function legacyVerticalAlignment(
  item: LegacyLayoutItem,
): BuilderColumn["verticalAlign"] {
  const record = item as LegacyLayoutItem & {
    verticalAlign?: "top" | "middle" | "center" | "bottom";
  };
  const value = item.columnVerticalAlign ?? record.verticalAlign;
  if (value === "center" || value === "middle") return "middle";
  if (value === "top" || value === "bottom") return value;
  return undefined;
}

function legacyResponsiveWidths(
  item: LegacyLayoutItem,
): BuilderResponsiveColumnWidths | undefined {
  const record = item as LegacyLayoutItem & Record<string, unknown>;
  const widths: BuilderResponsiveColumnWidths = {
    default: (record.columnWidth ?? record.width) as string | undefined,
    small: (record.columnWidthSmall ?? record.widthSmall ?? record.width_small) as
      | string
      | undefined,
    medium: (record.columnWidthMedium ?? record.widthMedium ?? record.width_medium) as
      | string
      | undefined,
    large: (record.columnWidthLarge ?? record.widthLarge ?? record.width_large) as
      | string
      | undefined,
    xlarge: (record.columnWidthXlarge ?? record.widthXlarge ?? record.width_xlarge) as
      | string
      | undefined,
  };
  return Object.values(widths).some((value) => value !== undefined)
    ? widths
    : undefined;
}

function legacyResponsiveOrder(
  item: LegacyLayoutItem,
): BuilderResponsiveColumnOrder | undefined {
  const record = item as LegacyLayoutItem & Record<string, unknown>;
  const order: BuilderResponsiveColumnOrder = {};
  const legacyOrder = record.columnOrder ?? record.order;
  if (
    typeof legacyOrder === "number" ||
    legacyOrder === "first" ||
    legacyOrder === "last"
  ) {
    order.default = legacyOrder;
  }
  const orderFirst = record.orderFirst ?? record.order_first;
  if (orderFirst === true || orderFirst === "true") order.default = "first";
  return order.default !== undefined ? order : undefined;
}

function normalizeLegacyColumn(
  item: LegacyLayoutItem,
  rowId: string,
  columnIndex: number,
): BuilderColumn {
  const responsiveWidths = legacyResponsiveWidths(item);
  const order = legacyResponsiveOrder(item);
  const verticalAlign = legacyVerticalAlignment(item);
  const elements = item.blocks?.length
    ? item.blocks
    : item.title || item.body || item.eyebrow || item.buttonLabel || item.buttonUrl
      ? [{
          id: `${item.id ?? "legacy"}-text`,
          kind: "text" as const,
          eyebrow: item.eyebrow,
          title: item.title,
          body: item.body,
          buttonLabel: item.buttonLabel,
          buttonUrl: item.buttonUrl,
        }]
      : [];
  return {
    id: item.id ?? `${rowId}-column-${columnIndex + 1}`,
    ...(responsiveWidths ? { responsiveWidths } : {}),
    ...(order ? { order } : {}),
    ...(verticalAlign ? { verticalAlign } : {}),
    elements,
  };
}

type LegacyRowGroup = {
  id: string;
  items: LegacyLayoutItem[];
};

function groupLegacyRows(section: BuilderSection): LegacyRowGroup[] {
  const items = section.layoutItems ?? [];
  if (items.length === 0) return [];

  const preset = UIKIT_LAYOUT_PRESETS[
    normalizeLayoutToUikitPreset(section.layout)
  ];
  const fallbackColumns = Math.max(preset.columnCount, 1);
  const rows: LegacyRowGroup[] = [];
  let index = 0;

  while (index < items.length) {
    const item = items[index];
    if (!item) break;

    if (item.rowId) {
      const rowItems: LegacyLayoutItem[] = [];
      const rowId = item.rowId;
      while (index < items.length && items[index]?.rowId === rowId) {
        rowItems.push(items[index]!);
        index += 1;
      }
      rows.push({ id: rowId, items: rowItems });
      continue;
    }

    const rowItems = items.slice(index, index + fallbackColumns);
    rows.push({ id: `legacy-row-${index}`, items: rowItems });
    index += rowItems.length;
  }

  return rows;
}

/**
 * Pure compatibility boundary for the canonical Section -> Row -> Column model.
 * It never mutates or persists the source document.
 */
export function normalizeBuilderSectionLayout(
  section: BuilderSection,
): NormalizedBuilderSectionLayout {
  if (section.rows !== undefined) {
    return { source: "canonical", rows: section.rows, conflicts: [] };
  }

  const conflicts: BuilderSectionLayoutConflict[] = [];
  const rows = groupLegacyRows(section).map(({ id, items }) => {
    const resolvedFields: Partial<Record<keyof LegacyLayoutItem, unknown>> = {};
    for (const field of REPEATED_LEGACY_ROW_FIELDS) {
      resolvedFields[field] = resolveRepeatedRowField(
        id,
        items,
        field,
        conflicts,
      );
    }

    const layout =
      (resolvedFields.rowLayout as string | undefined) ??
      section.layout ??
      "1-col";
    const legacyGap = resolvedFields.rowGap as BuilderRow["rowGap"];
    const topMargin = resolvedFields.rowTopMargin as BuilderRow["topMargin"];
    const bottomMargin = resolvedFields.rowBottomMargin as BuilderRow["bottomMargin"];
    const rowJustify = resolvedFields.rowJustify as LegacyLayoutItem["rowJustify"];
    const horizontalDistribution = resolvedFields.horizontalDistribution as BuilderRow["horizontalDistribution"];

    return {
      id,
      layout,
      ...(resolvedFields.role === "toolbar" ? { role: "toolbar" as const } : {}),
      ...(resolvedFields.headerVariant === "desktop" || resolvedFields.headerVariant === "mobile"
        ? { headerVariant: resolvedFields.headerVariant }
        : {}),
      ...(resolvedFields.maxWidth ? { maxWidth: resolvedFields.maxWidth as BuilderRow["maxWidth"] } : {}),
      ...(typeof resolvedFields.removeHorizontalPadding === "boolean"
        ? { removeHorizontalPadding: resolvedFields.removeHorizontalPadding }
        : {}),
      // Legacy rowGap drove UIkit's combined gutter. Reading it into both
      // canonical axes preserves that historical meaning until renderer migration.
      ...(legacyGap ? { columnGap: legacyGap, rowGap: legacyGap } : {}),
      ...(topMargin ? { topMargin } : {}),
      ...(bottomMargin ? { bottomMargin } : {}),
      ...(horizontalDistribution || legacyHorizontalDistribution(rowJustify)
        ? { horizontalDistribution: horizontalDistribution ?? legacyHorizontalDistribution(rowJustify) }
        : {}),
      ...(resolvedFields.headerGap ? { headerGap: resolvedFields.headerGap as string } : {}),
      ...(resolvedFields.headerJustify ? { headerJustify: resolvedFields.headerJustify as BuilderRow["headerJustify"] } : {}),
      ...(resolvedFields.headerAlign ? { headerAlign: resolvedFields.headerAlign as BuilderRow["headerAlign"] } : {}),
      ...(resolvedFields.rowBackground ? { rowBackground: resolvedFields.rowBackground as string } : {}),
      ...(resolvedFields.rowColorScheme ? { rowColorScheme: resolvedFields.rowColorScheme as BuilderRow["rowColorScheme"] } : {}),
      ...(resolvedFields.rowTopSpacing ? { rowTopSpacing: resolvedFields.rowTopSpacing as BuilderRow["rowTopSpacing"] } : {}),
      ...(resolvedFields.rowBottomSpacing ? { rowBottomSpacing: resolvedFields.rowBottomSpacing as BuilderRow["rowBottomSpacing"] } : {}),
      ...(resolvedFields.rowTopMargin ? { rowTopMargin: resolvedFields.rowTopMargin as BuilderRow["rowTopMargin"] } : {}),
      ...(resolvedFields.rowBottomMargin ? { rowBottomMargin: resolvedFields.rowBottomMargin as BuilderRow["rowBottomMargin"] } : {}),
      ...(resolvedFields.rowBorderRadius !== undefined ? { rowBorderRadius: resolvedFields.rowBorderRadius as number } : {}),
      ...(resolvedFields.rowVisualStyle ? { rowVisualStyle: resolvedFields.rowVisualStyle as BuilderRow["rowVisualStyle"] } : {}),
      ...(resolvedFields.rowAnimation ? { rowAnimation: resolvedFields.rowAnimation as BuilderRow["rowAnimation"] } : {}),
      columns: items.map((item, columnIndex) =>
        normalizeLegacyColumn(item, id, columnIndex),
      ),
    } satisfies BuilderRow;
  });

  return { source: "legacy", rows, conflicts };
}
