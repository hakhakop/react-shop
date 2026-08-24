import type { CSSProperties } from "react";

import type {
  BuilderColumn,
  BuilderRow,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import {
  normalizeBuilderSectionLayout,
  type BuilderSectionLayoutConflict,
} from "@/lib/builderSectionLayout";
import { builderGeneralVisibilityClassName } from "@/lib/builderVisualStyle";
import {
  resolveBuilderRowGap,
  resolveBuilderRowStyle,
  type BuilderRowGlobalSpacing,
  type BuilderRowStyleInput,
} from "@/lib/builderRowStyles";
import {
  getUikitCardClass,
  getUikitColumnClass,
  getUikitGridClass,
} from "@/lib/uikitTokens";
import { getUikitColumnWidthClass } from "@/lib/uikitLayoutEngine";

type LegacyLayoutItem = NonNullable<BuilderSection["layoutItems"]>[number];

export type BuilderStructuralColumn = {
  column: BuilderColumn;
  legacyItem?: LegacyLayoutItem;
  index: number;
  flatIndex: number;
  span: number;
  className: string;
  style: CSSProperties;
  stickyDeclaration?: string;
};

export type BuilderStructuralRow = {
  row: BuilderRow;
  legacyItem?: LegacyLayoutItem;
  index: number;
  className: string;
  style: CSSProperties;
  precedingGap: string;
  columns: BuilderStructuralColumn[];
};

export type BuilderSectionStructure = {
  source: "canonical" | "legacy";
  conflicts: BuilderSectionLayoutConflict[];
  rows: BuilderStructuralRow[];
};

export type BuilderSectionStructureOptions = {
  fallbackLayoutItems?: NonNullable<BuilderSection["layoutItems"]>;
  globalRowGap?: string;
  rowGlobalSpacing?: BuilderRowGlobalSpacing;
};

function compactClasses(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

function gapSize(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  if (!normalized || normalized === "inherit") return undefined;
  if (normalized === "none" || normalized === "collapse" || normalized === "0") {
    return "collapse";
  }
  if (["xs", "sm", "small"].includes(normalized)) return "small";
  if (["md", "medium"].includes(normalized)) return "medium";
  if (["lg", "xl", "2xl", "3xl", "large"].includes(normalized)) return "large";
  return undefined;
}

function rowGridClass(
  row: BuilderRow,
  legacyItem: LegacyLayoutItem | undefined,
) {
  const columnGap = gapSize(row.columnGap);
  const rowGap = gapSize(row.rowGap);
  const usesCombinedGap = columnGap === rowGap;
  const legacyJustify = legacyItem?.rowJustify;
  const justifyContent = legacyJustify ?? (
    row.horizontalDistribution === "center"
      ? "center"
      : row.horizontalDistribution === "justify"
        ? "between"
        : undefined
  );
  const base = getUikitGridClass({
    gutter: usesCombinedGap ? row.columnGap : undefined,
    // A sticky column must retain its intrinsic content height. UIkit's
    // match-height modifier stretches the sticky target to the full row,
    // preventing it from ever entering the sticky state in tall parallax
    // rows such as the imported Product hero.
    matchHeight:
      legacyItem?.rowMatchHeight !== false &&
      !row.columns.some((column) => {
        const sticky = column.sticky;
        return Boolean(
          (sticky?.mode && sticky.mode !== "none") ||
            sticky?.topOffset ||
            sticky?.bottomOffset,
        );
      }),
    // Legacy rowAlignment remains read compatibility only. Canonical vertical
    // alignment is projected by each Column below.
    alignItems: legacyItem?.rowAlignment,
    justifyContent,
  });
  const hasStickyColumn = row.columns.some((column) => {
    const sticky = column.sticky;
    return Boolean(
      (sticky?.mode && sticky.mode !== "none") ||
        sticky?.topOffset ||
        sticky?.bottomOffset,
    );
  });
  const boundaryClass = hasStickyColumn ? "builder-sticky-boundary-row" : undefined;
  if (usesCombinedGap) return compactClasses(base, boundaryClass);
  return compactClasses(
    base,
    boundaryClass,
    columnGap ? `uk-grid-column-${columnGap}` : undefined,
    rowGap ? `uk-grid-row-${rowGap}` : undefined,
  );
}

function widthClass(value: string | undefined, breakpoint = "") {
  if (!value) return undefined;
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/^uk-width-/, "")
    .replace("/", "-");
  if (!normalized || normalized === "inherit") return undefined;
  if (normalized === "full") return `uk-width-1-1${breakpoint}`;
  if (normalized === "auto" || normalized === "expand") {
    return `uk-width-${normalized}${breakpoint}`;
  }
  if (/^\d+-\d+$/.test(normalized)) {
    return `uk-width-${normalized}${breakpoint}`;
  }
  return undefined;
}

function columnWidthClasses(
  row: BuilderRow,
  column: BuilderColumn,
  columnIndex: number,
) {
  const widths = column.responsiveWidths;
  if (!widths) return getUikitColumnWidthClass(row.layout, columnIndex);

  return compactClasses(
    widthClass(widths.default),
    widthClass(widths.small, "@s"),
    widthClass(widths.medium, "@m") ??
      getUikitColumnWidthClass(row.layout, columnIndex),
    widthClass(widths.large, "@l"),
    widthClass(widths.xlarge, "@xl"),
  );
}

function orderClass(value: number | "first" | "last" | undefined, suffix = "") {
  if (value === "first" || value === "last") return `uk-flex-${value}${suffix}`;
  return undefined;
}

function columnOrderClasses(column: BuilderColumn) {
  const order = column.order;
  if (!order) return undefined;
  return compactClasses(
    orderClass(order.default),
    orderClass(order.small, "@s"),
    orderClass(order.medium, "@m"),
    orderClass(order.large, "@l"),
    orderClass(order.xlarge, "@xl"),
  );
}

function columnStyle(column: BuilderColumn): CSSProperties {
  const defaultOrder = column.order?.default;
  const stickyOwnsVerticalAlignment = column.sticky?.mode === "column-within-row";
  return {
    ...(typeof defaultOrder === "number" ? { order: defaultOrder } : {}),
    ...(!stickyOwnsVerticalAlignment && (column.verticalAlign === "middle" || column.verticalAlign === "bottom")
      ? { flexDirection: "row" }
      : {}),
    ...(column.background?.color ? { backgroundColor: column.background.color } : {}),
    ...(column.background?.imageUrl
      ? {
          backgroundImage: column.background.gradient
            ? `${column.background.gradient}, url(${JSON.stringify(column.background.imageUrl)})`
            : `url(${JSON.stringify(column.background.imageUrl)})`,
          backgroundPosition: column.background.position,
          backgroundSize: column.background.size,
          backgroundRepeat: column.background.repeat,
        }
      : column.background?.gradient
        ? { backgroundImage: column.background.gradient }
        : {}),
  };
}

function columnSurfaceClass(column: BuilderColumn) {
  const rawStyle = column.style?.trim().toLowerCase();
  const style = rawStyle === "muted" ? "tile-muted" : rawStyle === "hover" ? "card-hover" : rawStyle;
  const surface = style && style !== "none" ? style : undefined;
  const padding = column.padding?.trim().toLowerCase();
  const paddingClass = padding === "none"
    ? "uk-padding-remove"
    : padding === "small" || padding === "sm"
      ? "uk-padding-small"
      : padding === "medium" || padding === "md" || padding === "default"
        ? ""
        : padding === "large" || padding === "lg"
          ? "uk-padding-large"
          : padding === "xlarge" || padding === "xl"
            ? "uk-padding-xlarge"
            : "";
  const classes = surface
    ? getUikitCardClass(surface, { padding: column.padding })
    : paddingClass;
  return compactClasses(
    classes,
    column.textColor === "light" ? "uk-light" : column.textColor === "dark" ? "uk-dark" : undefined,
    column.preserveColor ? "uk-preserve-color" : undefined,
  );
}

/**
 * YOOtheme can place a visibility-only decorative element in a column. In
 * that shape UIkit hides the whole grid item at the breakpoint, not merely
 * the inner image. Collapsing the column keeps hidden Hero artwork from
 * leaving an empty fifth column that wraps the remaining grid on tablet and
 * phone widths.
 */
function columnVisibilityClass(column: BuilderColumn) {
  const elements = column.elements ?? [];
  if (!elements.length) return undefined;
  const classes = elements.map((element) =>
    builderGeneralVisibilityClassName(element.visualStyle?.layout?.visibilityMode),
  );
  if (classes.some((value) => !value) || new Set(classes).size !== 1) return undefined;
  return classes[0];
}

function columnClassName(
  row: BuilderRow,
  column: BuilderColumn,
  columnIndex: number,
  legacyItem: LegacyLayoutItem | undefined,
) {
  const stickyOwnsVerticalAlignment = column.sticky?.mode === "column-within-row";
  return compactClasses(
    columnWidthClasses(row, column, columnIndex),
    getUikitColumnClass({
      horizontalAlign: legacyItem?.columnHorizontalAlign,
      verticalAlign: stickyOwnsVerticalAlignment
        ? undefined
        : column.verticalAlign === "middle"
          ? "center"
          : column.verticalAlign,
      flex: legacyItem?.columnFlex,
      responsiveWidth: legacyItem?.columnResponsiveWidth,
    }),
    columnOrderClasses(column),
    columnVisibilityClass(column),
    columnSurfaceClass(column),
  );
}

/**
 * Canonical UIkit sticky declaration for imported column settings.  A column
 * within a row naturally uses the row as its sticky boundary, matching
 * YOOtheme's default containment without inventing a second runtime model.
 */
export function getBuilderColumnStickyDeclaration(
  column: BuilderColumn,
): string | undefined {
  const sticky = column.sticky;
  const mode = sticky?.mode;
  if (!sticky || !mode || mode === "none") return undefined;
  const declaration: string[] = [];
  if (sticky.topOffset) declaration.push(`offset: ${sticky.topOffset}`);
  if (sticky.bottomOffset) declaration.push(`offset-end: ${sticky.bottomOffset}`);
  // YOOtheme terminates column sticky panels at their containing grid row
  // (`end: !.tm-grid-expand`).  Use the shared WebPages row class for the
  // same UIkit boundary; without it the panel remains sticky until document
  // end instead of releasing when the following row enters the viewport.
  declaration.push("end: !.shop-builder-content-row");
  if (sticky.breakpoint) declaration.push(`media: @${sticky.breakpoint}`);
  if (sticky.blend) declaration.push("cls-active: uk-preserve-color");
  return declaration.length ? `${declaration.join("; ")};` : "";
}

function rowStyleInput(
  row: BuilderRow,
  legacyItem: LegacyLayoutItem | undefined,
): BuilderRowStyleInput {
  return {
    ...legacyItem,
    // Legacy YOOtheme exports keep authored row CSS on the layout item. Feed
    // it through the canonical advanced-css path so shared row spacing
    // preserves declarations such as `margin-bottom: 15vh`.
    advanced: row.advanced ?? ((legacyItem as any)?.css ? { css: (legacyItem as any).css } : undefined),
    spacingContract: row.spacingContract ?? (legacyItem as any)?.spacingContract,
    rowHeight: row.height,
    rowTopMargin: row.topMargin ?? legacyItem?.rowTopMargin,
    rowBottomMargin: row.bottomMargin ?? legacyItem?.rowBottomMargin,
    rowGap: row.rowGap ?? legacyItem?.rowGap,
    maxWidth: row.maxWidth,
  };
}

function equalColumnSpan(columnIndex: number, columnCount: number) {
  const count = Math.max(columnCount, 1);
  const usedBefore = Math.floor((columnIndex * 12) / count);
  const usedAfter = Math.floor(((columnIndex + 1) * 12) / count);
  return Math.max(1, usedAfter - usedBefore);
}

/**
 * Shared semantic projection consumed by both Builder preview and storefront.
 * Builder interaction chrome is intentionally not represented here.
 */
export function resolveBuilderSectionStructure(
  section: BuilderSection,
  options: BuilderSectionStructureOptions = {},
): BuilderSectionStructure {
  const effectiveSection =
    section.rows !== undefined || section.layoutItems?.length
      ? section
      : options.fallbackLayoutItems
        ? { ...section, layoutItems: options.fallbackLayoutItems }
        : section;
  const normalized = normalizeBuilderSectionLayout(effectiveSection);
  const legacyItems = normalized.source === "legacy"
    ? effectiveSection.layoutItems ?? []
    : [];
  let flatIndex = 0;
  let previousRowInput: BuilderRowStyleInput | undefined;

  const rows = normalized.rows.map((row, rowIndex) => {
    const rowStartIndex = flatIndex;
    const legacyItem = legacyItems[rowStartIndex];
    const structuralInput = rowStyleInput(row, legacyItem);
    const precedingGap = resolveBuilderRowGap(
      structuralInput,
      options.globalRowGap,
      previousRowInput,
    ).css;
    const style = resolveBuilderRowStyle(
      structuralInput,
      {
        global: options.rowGlobalSpacing,
        isFirstRow: rowIndex === 0,
      },
    );
    previousRowInput = structuralInput;

    const columns = row.columns.map((column, columnIndex) => {
      const normalizedColumn =
        column.sticky &&
        !column.sticky.mode &&
        (column.sticky.topOffset || column.sticky.bottomOffset)
          ? {
              ...column,
              sticky: {
                ...column.sticky,
                mode: "column-within-row" as const,
              },
            }
          : column;
      const columnFlatIndex = flatIndex;
      const legacyColumn = legacyItems[columnFlatIndex];
      flatIndex += 1;
      return {
        column: normalizedColumn,
        legacyItem: legacyColumn,
        index: columnIndex,
        flatIndex: columnFlatIndex,
        span: equalColumnSpan(columnIndex, row.columns.length),
        className: columnClassName(
          row,
          normalizedColumn,
          columnIndex,
          legacyColumn,
        ),
        style: columnStyle(normalizedColumn),
        stickyDeclaration: getBuilderColumnStickyDeclaration(normalizedColumn),
      } satisfies BuilderStructuralColumn;
    });

    return {
      row,
      legacyItem,
      index: rowIndex,
      className: rowGridClass(row, legacyItem),
      style,
      precedingGap,
      columns,
    } satisfies BuilderStructuralRow;
  });

  return {
    source: normalized.source,
    conflicts: normalized.conflicts,
    rows,
  };
}
