import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import {
  applyCanonicalBuilderRowLayout,
  updateCanonicalBuilderRow,
} from "@/lib/builderRowEditing";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

function efficientWorkflowSection() {
  const imported = mapYoothemeStaticContent(enterprise8);
  return imported.sections.find((section) =>
    section.rows?.some((row) => row.id === "yootheme-section-7-row-1"),
  )!;
}

test("Row inspector exposes canonical imported layout, independent gaps, and margins", () => {
  const section = efficientWorkflowSection();
  const importedRow = section.rows![0];
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/inspector/panels/RowCapabilityPanel.tsx"),
    "utf8",
  );

  expect(importedRow).toMatchObject({ layout: "thirds-1-2", topMargin: "medium" });
  expect(panelSource).toContain('data-canonical-owner="BuilderRow"');
  expect(panelSource).toContain('aria-label="Edit Layout"');
  expect(panelSource).toContain('value={row.layout}');
  expect(panelSource).toContain('value={row.columnGap ?? "inherit"}');
  expect(panelSource).toContain('onChange={(columnGap) => update({ columnGap })}');
  expect(panelSource).toContain('value={row.rowGap ?? "inherit"}');
  expect(panelSource).toContain('onChange={(rowGap) => update({ rowGap })}');
  expect(panelSource).toContain('value={row.topMargin ?? "inherit"}');
  expect(panelSource).toContain('ariaLabel="Row margin"');
  expect(panelSource).not.toContain('label="Top Margin"');
  expect(panelSource).not.toContain('label="Bottom Margin"');
});

test("canonical Row edits keep gaps, margins, and Columns independent", () => {
  const section = efficientWorkflowSection();
  const originalRow = section.rows![0];
  const gapEdited = updateCanonicalBuilderRow(section, 0, { columnGap: "large" });
  const marginEdited = updateCanonicalBuilderRow(gapEdited, 0, { topMargin: "xlarge" });
  const editedRow = marginEdited.rows![0];

  expect(editedRow.columnGap).toBe("large");
  expect(editedRow.rowGap).toBe(originalRow.rowGap);
  expect(editedRow.topMargin).toBe("xlarge");
  expect(editedRow.columns).toEqual(originalRow.columns);
  expect(marginEdited.layoutItems).toBeUndefined();
});

test("first Row edit promotes legacy reads to canonical rows without writing layoutItems", () => {
  const legacyLayoutItems = [{
    id: "legacy-one",
    rowId: "legacy-row",
    rowLayout: "2-col-equal",
    rowGap: "small" as const,
    blocks: [],
  }, {
    id: "legacy-two",
    rowId: "legacy-row",
    rowLayout: "2-col-equal",
    rowGap: "small" as const,
    blocks: [],
  }];
  const section = {
    ...efficientWorkflowSection(),
    rows: undefined,
    layoutItems: legacyLayoutItems,
  };
  const edited = updateCanonicalBuilderRow(section, 0, { columnGap: "large" });

  expect(edited.rows![0]).toMatchObject({
    id: "legacy-row",
    columnGap: "large",
    rowGap: "small",
  });
  expect(edited.layoutItems).toBe(legacyLayoutItems);
});

test("layout changes write canonical Row and preserve element order", () => {
  const section = efficientWorkflowSection();
  const elementIds = section.rows![0].columns.flatMap((column) =>
    column.elements.map((element) => element.id),
  );
  const edited = applyCanonicalBuilderRowLayout(section, 0, "2-col-equal", 2);

  expect(edited.rows![0].layout).toBe("2-col-equal");
  expect(edited.rows![0].columns.flatMap((column) =>
    column.elements.map((element) => element.id),
  )).toEqual(elementIds);
  expect(edited.layoutItems).toBeUndefined();
});

test("obsolete legacy Row controls and writes are absent from the canonical panel", () => {
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/inspector/panels/RowCapabilityPanel.tsx"),
    "utf8",
  );
  const editingSource = readFileSync(
    resolve(process.cwd(), "lib/builderRowEditing.ts"),
    "utf8",
  );

  expect(panelSource).not.toContain("rowAlignment");
  expect(panelSource).not.toContain("rowJustify");
  expect(panelSource).not.toContain("rowTopSpacing");
  expect(panelSource).not.toContain("rowBottomSpacing");
  expect(panelSource).not.toContain('label="Gutter"');
  expect(editingSource).not.toContain("layoutItems:");
});
