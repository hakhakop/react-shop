import type {
  BuilderRow,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";

/**
 * Canonical Row inspector write boundary. Legacy layoutItems are read only by
 * the section normalizer; the first explicit Row edit promotes that normalized
 * structure to section.rows without mutating or deleting legacy storage.
 */
export function updateCanonicalBuilderRow(
  section: BuilderSection,
  rowIndex: number,
  patch: Partial<BuilderRow>,
): BuilderSection {
  const normalized = normalizeBuilderSectionLayout(section);
  if (!normalized.rows[rowIndex]) return section;
  return {
    ...section,
    rows: normalized.rows.map((row, index) =>
      index === rowIndex ? { ...row, ...patch } : row,
    ),
  };
}

export function applyCanonicalBuilderRowLayout(
  section: BuilderSection,
  rowIndex: number,
  layout: string,
  columnCount: number,
): BuilderSection {
  const normalized = normalizeBuilderSectionLayout(section);
  const row = normalized.rows[rowIndex];
  if (!row || columnCount < 1) return section;

  const retained = row.columns.slice(0, columnCount).map((column) => ({
    ...column,
    responsiveWidths: undefined,
  }));
  while (retained.length < columnCount) {
    retained.push({
      id: `${row.id}-column-${retained.length + 1}`,
      responsiveWidths: undefined,
      elements: [],
    });
  }
  const overflow = row.columns
    .slice(columnCount)
    .flatMap((column) => column.elements);
  if (overflow.length > 0) {
    const lastIndex = retained.length - 1;
    retained[lastIndex] = {
      ...retained[lastIndex]!,
      elements: [...retained[lastIndex]!.elements, ...overflow],
    };
  }

  return {
    ...section,
    rows: normalized.rows.map((candidate, index) =>
      index === rowIndex
        ? {
            ...candidate,
            layout,
            customLayout: undefined,
            columns: retained,
          }
        : candidate,
    ),
  };
}
