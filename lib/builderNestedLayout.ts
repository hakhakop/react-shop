import type {
  BuilderLayoutBlock,
  BuilderSection,
} from "@/components/dashboard/builderTypes";

export type BuilderLayoutColumn =
  NonNullable<BuilderSection["layoutItems"]>[number];

export type BuilderNestedColumn =
  NonNullable<BuilderLayoutColumn["nestedLayout"]>["rows"][number]["columns"][number];

export function createVerticalNestedLayout(
  column: BuilderLayoutColumn,
): NonNullable<BuilderLayoutColumn["nestedLayout"]> {
  const seed = Date.now().toString(36);
  const firstRowId = `nested-row-${seed}-1`;
  const secondRowId = `nested-row-${seed}-2`;

  return {
    version: 1,
    direction: "vertical",
    distribution: "equal",
    gap: "inherit",
    rows: [
      {
        id: firstRowId,
        weight: 1,
        layout: "whole",
        columns: [
          {
            id: `nested-column-${seed}-1`,
            rowId: firstRowId,
            rowLayout: "whole",
            blocks: [...(column.blocks ?? [])],
          },
        ],
      },
      {
        id: secondRowId,
        weight: 1,
        layout: "whole",
        columns: [
          {
            id: `nested-column-${seed}-2`,
            rowId: secondRowId,
            rowLayout: "whole",
            blocks: [],
          },
        ],
      },
    ],
  };
}

export function nestedLayoutItems(
  column: BuilderLayoutColumn,
): BuilderNestedColumn[] {
  return column.nestedLayout?.rows.flatMap((row) => row.columns) ?? [];
}

export function findLayoutColumn(
  section: BuilderSection,
  columnKey: string,
): BuilderLayoutColumn | BuilderNestedColumn | null {
  for (const column of section.layoutItems ?? []) {
    if (column.id === columnKey) return column;
    for (const nestedColumn of nestedLayoutItems(column)) {
      if (nestedColumn.id === columnKey) return nestedColumn;
    }
  }
  return null;
}

export function findLayoutBlock(
  section: BuilderSection,
  blockKey: string,
  preferredColumnKey?: string | null,
): BuilderLayoutBlock | null {
  const preferredColumn = preferredColumnKey
    ? findLayoutColumn(section, preferredColumnKey)
    : null;
  const findInColumn = (
    column: BuilderLayoutColumn | BuilderNestedColumn,
  ) =>
    (column.blocks ?? []).find(
      (block, index) =>
        (block.id ??
          `${column.id ?? preferredColumnKey ?? "layout-item"}-block-${index}`) ===
        blockKey,
    ) ?? null;

  if (preferredColumn) {
    const preferredBlock = findInColumn(preferredColumn);
    if (preferredBlock) return preferredBlock;
  }

  for (const outerColumn of section.layoutItems ?? []) {
    const outerBlock = findInColumn(outerColumn);
    if (outerBlock) return outerBlock;
    for (const nestedColumn of nestedLayoutItems(outerColumn)) {
      const nestedBlock = findInColumn(nestedColumn);
      if (nestedBlock) return nestedBlock;
    }
  }
  return null;
}

export function mapLayoutColumns(
  section: BuilderSection,
  mapper: (
    column: BuilderLayoutColumn | BuilderNestedColumn,
    nested: boolean,
  ) => BuilderLayoutColumn | BuilderNestedColumn,
): BuilderSection {
  return {
    ...section,
    layoutItems: (section.layoutItems ?? []).map((column) => {
      const mappedOuter = mapper(column, false) as BuilderLayoutColumn;
      if (!mappedOuter.nestedLayout) return mappedOuter;
      return {
        ...mappedOuter,
        nestedLayout: {
          ...mappedOuter.nestedLayout,
          rows: mappedOuter.nestedLayout.rows.map((row) => ({
            ...row,
            columns: row.columns.map(
              (nestedColumn) =>
                mapper(nestedColumn, true) as BuilderNestedColumn,
            ),
          })),
        },
      };
    }),
  };
}

export function getColumnBlocks(
  column: BuilderLayoutColumn | BuilderNestedColumn,
): BuilderLayoutBlock[] {
  return column.blocks ?? [];
}

export function layoutColumnHasContent(column: BuilderLayoutColumn) {
  return (
    (column.blocks ?? []).length > 0 ||
    (column.nestedLayout?.rows.some((row) =>
      row.columns.some((nestedColumn) => nestedColumn.blocks.length > 0),
    ) ??
      false)
  );
}

export function updateLayoutColumn(
  section: BuilderSection,
  columnKey: string,
  updater: (
    column: BuilderLayoutColumn | BuilderNestedColumn,
  ) => BuilderLayoutColumn | BuilderNestedColumn,
): BuilderSection {
  return mapLayoutColumns(section, (column) =>
    column.id === columnKey ? updater(column) : column,
  );
}

export function updateBlockInLayoutColumn(
  section: BuilderSection,
  columnKey: string,
  blockKey: string,
  updater: (block: BuilderLayoutBlock) => BuilderLayoutBlock,
): BuilderSection {
  return updateLayoutColumn(section, columnKey, (column) => ({
    ...column,
    blocks: (column.blocks ?? []).map((block, index) =>
      (block.id ?? `${columnKey}-block-${index}`) === blockKey
        ? updater(block)
        : block,
    ),
  }));
}
