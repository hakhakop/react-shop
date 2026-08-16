import type {
  BuilderColumn,
  BuilderLayoutBlock,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";

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
  if (section.rows !== undefined) {
    for (const row of normalizeBuilderSectionLayout(section).rows) {
      const column = row.columns.find((candidate) => candidate.id === columnKey);
      if (column) {
        return {
          ...column,
          rowId: row.id,
          rowLayout: row.layout,
          blocks: column.elements,
        } as BuilderLayoutColumn;
      }
    }
  }
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

  if (section.rows !== undefined) {
    for (const row of normalizeBuilderSectionLayout(section).rows) {
      for (const column of row.columns) {
        const block = (column.elements ?? []).find(
          (candidate, index) =>
            (candidate.id ?? `${column.id}-block-${index}`) === blockKey,
        );
        if (block) return block;
      }
    }
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
  if (section.rows !== undefined) {
    return {
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => {
          const adapted = {
            ...column,
            blocks: column.elements,
          } as BuilderColumn & BuilderLayoutColumn;
          if (!column.id) return column;
          const mapped = mapper(adapted, false) as BuilderLayoutColumn;
          return {
            ...column,
            elements: mapped.blocks ?? column.elements,
          };
        }),
      })),
    };
  }
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

/**
 * Update a block in the raw canonical layout tree without relying on the
 * currently rendered/localized column projection.
 */
export function updateLayoutBlockEverywhere(
  section: BuilderSection,
  blockKey: string,
  updater: (block: BuilderLayoutBlock) => BuilderLayoutBlock,
): BuilderSection {
  const updateBlocks = (blocks: BuilderLayoutBlock[]) =>
    blocks.map((block, index) => {
      const key = block.id ?? `layout-block-${index}`;
      return key === blockKey ? updater(block) : block;
    });

  if (section.rows !== undefined) {
    return {
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => ({
          ...column,
          elements: updateBlocks(column.elements ?? []),
        })),
      })),
    };
  }

  const updateColumn = (column: BuilderLayoutColumn): BuilderLayoutColumn => ({
    ...column,
    blocks: updateBlocks(column.blocks ?? []),
    nestedLayout: column.nestedLayout
      ? {
          ...column.nestedLayout,
          rows: column.nestedLayout.rows.map((row) => ({
            ...row,
            columns: row.columns.map((nestedColumn) => ({
              ...nestedColumn,
              blocks: updateBlocks(nestedColumn.blocks ?? []),
            })),
          })),
        }
      : column.nestedLayout,
  });

  return {
    ...section,
    layoutItems: (section.layoutItems ?? []).map(updateColumn),
  };
}

export function removeBlockInLayoutColumn(
  section: BuilderSection,
  columnKey: string,
  blockKey: string,
): BuilderSection {
  if (section.rows !== undefined) {
    return {
      ...section,
      rows: section.rows.map((row) => ({
        ...row,
        columns: row.columns.map((column) => column.id !== columnKey ? column : {
          ...column,
          elements: column.elements.filter((block, index) => (block.id ?? `${columnKey}-block-${index}`) !== blockKey),
        }),
      })),
    };
  }
  return updateLayoutColumn(section, columnKey, (column) => ({
    ...column,
    blocks: (column.blocks ?? []).filter((block, index) => (block.id ?? `${columnKey}-block-${index}`) !== blockKey),
  }));
}
