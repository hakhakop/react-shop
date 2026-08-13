import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import {
  findCanonicalBuilderColumn,
  updateCanonicalBuilderColumn,
} from "@/lib/builderColumnEditing";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

function efficientWorkflowSection() {
  return mapYoothemeStaticContent(enterprise8).sections.find((section) =>
    section.rows?.some((row) => row.id === "yootheme-section-7-row-1"),
  )!;
}

test("Enterprise8 canonical Columns retain independent vertical alignment", () => {
  const section = efficientWorkflowSection();
  const first = findCanonicalBuilderColumn(section, "yootheme-section-7-row-1-column-1");
  const second = findCanonicalBuilderColumn(section, "yootheme-section-7-row-1-column-2");

  expect(first).toMatchObject({ rowIndex: 0, columnIndex: 0, column: { verticalAlign: "middle" } });
  expect(second).toMatchObject({ rowIndex: 0, columnIndex: 1 });
  expect(second!.column.verticalAlign).toBeUndefined();
});

test("editing Column 1 does not mutate its Row or sibling Column", () => {
  const section = efficientWorkflowSection();
  const originalRow = section.rows![0];
  const originalElementIds = originalRow.columns.flatMap((column) =>
    column.elements.map((element) => element.id),
  );
  const edited = updateCanonicalBuilderColumn(
    section,
    "yootheme-section-7-row-1-column-1",
    { verticalAlign: "bottom", padding: "large" },
  );
  const editedRow = edited.rows![0];

  expect(editedRow.layout).toBe(originalRow.layout);
  expect(editedRow.columns[0]).toMatchObject({ verticalAlign: "bottom", padding: "large" });
  expect(editedRow.columns[1]).toEqual(originalRow.columns[1]);
  expect(editedRow.columns.flatMap((column) =>
    column.elements.map((element) => element.id),
  )).toEqual(originalElementIds);
  expect(edited.layoutItems).toBeUndefined();
});

test("legacy Column edit promotes normalized rows without writing layoutItems", () => {
  const legacyLayoutItems = [{
    id: "legacy-one",
    rowId: "legacy-row",
    rowLayout: "2-col-equal",
    columnVerticalAlign: "center" as const,
    blocks: [{ id: "legacy-element", kind: "text" as const, body: "Legacy" }],
  }, {
    id: "legacy-two",
    rowId: "legacy-row",
    rowLayout: "2-col-equal",
    blocks: [],
  }];
  const legacySection = {
    ...efficientWorkflowSection(),
    rows: undefined,
    layoutItems: legacyLayoutItems,
  };
  const edited = updateCanonicalBuilderColumn(legacySection, "legacy-one", {
    verticalAlign: "top",
    keepEmpty: true,
  });

  expect(edited.rows![0].columns[0]).toMatchObject({
    id: "legacy-one",
    verticalAlign: "top",
    keepEmpty: true,
    elements: [{ id: "legacy-element" }],
  });
  expect(edited.rows![0].columns[1].verticalAlign).toBeUndefined();
  expect(edited.layoutItems).toBe(legacyLayoutItems);
});

test("Column inspector binds canonical fields and retires incompatible controls", () => {
  const panelSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/inspector/panels/ColumnCapabilityPanel.tsx"),
    "utf8",
  );
  const inspectorSource = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardInspector.tsx"),
    "utf8",
  );
  const editingSource = readFileSync(
    resolve(process.cwd(), "lib/builderColumnEditing.ts"),
    "utf8",
  );

  expect(panelSource).toContain('data-canonical-owner="BuilderColumn"');
  expect(panelSource).toContain('value={column.verticalAlign ?? "top"}');
  expect(panelSource).toContain('onChange={(verticalAlign) => update({ verticalAlign })}');
  expect(panelSource).toContain("Responsive width and order remain in Row → Edit Layout");
  expect(panelSource).not.toContain("columnHorizontalAlign");
  expect(panelSource).not.toContain("columnVerticalAlign");
  expect(panelSource).not.toContain("columnFlex");
  expect(panelSource).not.toContain("columnResponsiveWidth");
  expect(inspectorSource).toContain("findCanonicalBuilderColumn(layoutContainerSection, selectedLayoutColumnKey)");
  expect(editingSource).not.toContain("layoutItems:");
});

test("fresh import preserves canonical Column presentation ownership", () => {
  const imported = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          props: {
            vertical_align: "middle",
            style: "primary",
            text_color: "light",
            preserve_color: true,
            padding: "large",
            html_element: "aside",
            keep_empty: true,
          },
          children: [],
        }],
      }],
    }],
  });

  expect(imported.sections[0].rows![0].columns[0]).toMatchObject({
    verticalAlign: "middle",
    style: "primary",
    textColor: "light",
    preserveColor: true,
    padding: "large",
    htmlElement: "aside",
    keepEmpty: true,
  });
  expect(imported.sections[0].layoutItems).toBeUndefined();
});
