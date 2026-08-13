import { expect, test } from "@playwright/test";
import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import type {
  BuilderRow,
  BuilderSection,
} from "@/components/dashboard/builderTypes";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import { getUikitColumnWidthClass } from "@/lib/uikitLayoutEngine";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

test("normalizes an Enterprise8-shaped legacy section without manufacturing column alignment", () => {
  const imported = mapYoothemeStaticContent(enterprise8);
  const section = imported.sections.find(
    (candidate) => candidate.rows?.some(
      (row) => row.id === "yootheme-section-7-row-1",
    ),
  );
  expect(section).toBeTruthy();

  const sourceRow = section!.rows!.find(
    (row) => row.id === "yootheme-section-7-row-1",
  )!;
  const legacyFirstRow = sourceRow.columns.map((column) => ({
    id: column.id,
    rowId: sourceRow.id,
    rowLayout: sourceRow.layout,
    blocks: column.elements,
    ...(column.verticalAlign === "middle" ? { columnVerticalAlign: "center" as const } : {}),
  }));
  const legacySection: BuilderSection = {
    ...section!,
    rows: undefined,
    layoutItems: legacyFirstRow,
  };
  const normalized = normalizeBuilderSectionLayout(legacySection);
  const firstRow = normalized.rows.find(
    (row) => row.id === "yootheme-section-7-row-1",
  );

  expect(normalized.source).toBe("legacy");
  expect(firstRow).toBeTruthy();
  expect(firstRow!.layout).toBe("thirds-1-2");
  expect([
    getUikitColumnWidthClass(firstRow!.layout, 0),
    getUikitColumnWidthClass(firstRow!.layout, 1),
  ]).toEqual(["uk-width-1-3@m", "uk-width-2-3@m"]);
  expect(firstRow!.columns).toHaveLength(2);
  expect(firstRow!.columns[0].verticalAlign).toBe("middle");
  expect(firstRow!.columns[1].verticalAlign).toBeUndefined();
  expect(firstRow!.columns.map((column) => column.id)).toEqual(
    legacyFirstRow.map((column) => column.id),
  );
  expect(firstRow!.columns.flatMap((column) =>
    column.elements.map((element) => element.id),
  )).toEqual(
    legacyFirstRow.flatMap((column) =>
      (column.blocks ?? []).map((block) => block.id),
    ),
  );
});

test("selects the first repeated legacy row value and reports conflicts", () => {
  const imported = mapYoothemeStaticContent(enterprise8);
  const source = imported.sections[0];
  const section: BuilderSection = {
    ...source,
    rows: undefined,
    layoutItems: [
      {
        id: "column-one",
        rowId: "conflicting-row",
        rowLayout: "2-col-equal",
        rowGap: "small",
        blocks: [],
      },
      {
        id: "column-two",
        rowId: "conflicting-row",
        rowLayout: "2-col-equal",
        rowGap: "large",
        blocks: [],
      },
    ],
  };

  const normalized = normalizeBuilderSectionLayout(section);

  expect(normalized.rows[0]).toMatchObject({
    columnGap: "small",
    rowGap: "small",
  });
  expect(normalized.conflicts).toContainEqual({
    rowId: "conflicting-row",
    field: "rowGap",
    selectedItemId: "column-one",
    selectedValue: "small",
    conflictingValues: [{ itemId: "column-two", value: "large" }],
  });
});

test("canonical rows bypass legacy reconstruction", () => {
  const imported = mapYoothemeStaticContent(enterprise8);
  const canonicalRows: BuilderRow[] = [{
    id: "canonical-row",
    layout: "whole",
    columns: [{ id: "canonical-column", elements: [] }],
  }];
  const section: BuilderSection = {
    ...imported.sections[0],
    rows: canonicalRows,
    layoutItems: [{
      id: "legacy-column",
      rowId: "legacy-row",
      rowGap: "large",
      blocks: [],
    }],
  };

  const normalized = normalizeBuilderSectionLayout(section);

  expect(normalized.source).toBe("canonical");
  expect(normalized.rows).toBe(canonicalRows);
  expect(normalized.conflicts).toEqual([]);
});
