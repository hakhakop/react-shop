import type {
  BuilderColumn,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";

export type CanonicalBuilderColumnLocation = {
  rowIndex: number;
  columnIndex: number;
  column: BuilderColumn;
};

export function findCanonicalBuilderColumn(
  section: BuilderSection,
  columnId: string,
): CanonicalBuilderColumnLocation | null {
  if (section.rows === undefined) return null;
  const rows = normalizeBuilderSectionLayout(section).rows;
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    const columnIndex = row?.columns.findIndex((column) => column.id === columnId) ?? -1;
    if (row && columnIndex >= 0) {
      return { rowIndex, columnIndex, column: row.columns[columnIndex]! };
    }
  }
  return null;
}

/**
 * Canonical Column inspector write boundary. A legacy section is promoted only
 * after an explicit edit; its compatibility layoutItems remain untouched.
 */
export function updateCanonicalBuilderColumn(
  section: BuilderSection,
  columnId: string,
  patch: Partial<BuilderColumn>,
): BuilderSection {
  const normalized = normalizeBuilderSectionLayout(section);
  let found = false;
  const rows = normalized.rows.map((row) => ({
    ...row,
    columns: row.columns.map((column) => {
      if (column.id !== columnId) return column;
      found = true;
      return { ...column, ...patch };
    }),
  }));
  return found ? { ...section, rows } : section;
}
