import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "@playwright/test";

import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import type { BuilderSection } from "@/components/dashboard/builderTypes";
import { resolveBuilderSectionStructure } from "@/lib/builderSectionStructure";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

function enterpriseEfficientWorkflowSection() {
  const imported = mapYoothemeStaticContent(enterprise8);
  const section = imported.sections.find((candidate) =>
    candidate.rows?.some(
      (row) => row.id === "yootheme-section-7-row-1",
    ),
  );
  expect(section).toBeTruthy();
  return section!;
}

test("projects Enterprise8 weighted Row and per-Column vertical alignment", () => {
  const source = enterpriseEfficientWorkflowSection();
  const sourceElementIds = source.rows!
    .find((row) => row.id === "yootheme-section-7-row-1")!
    .columns.flatMap((column) => column.elements.map((element) => element.id));
  const structure = resolveBuilderSectionStructure(
    source,
  );
  const firstRow = structure.rows.find(
    ({ row }) => row.id === "yootheme-section-7-row-1",
  );

  expect(firstRow).toBeTruthy();
  expect(firstRow!.columns.map(({ column }) => column.id)).toEqual([
    "yootheme-section-7-row-1-column-1",
    "yootheme-section-7-row-1-column-2",
  ]);
  expect(firstRow!.columns[0].className).toContain("uk-width-1-3@m");
  expect(firstRow!.columns[1].className).toContain("uk-width-2-3@m");
  expect(firstRow!.columns[0].className).toContain("uk-flex-middle");
  expect(firstRow!.columns[1].className).not.toContain("uk-flex-middle");
  expect(firstRow!.columns.flatMap(({ column }) =>
    column.elements.map((element) => element.id),
  )).toEqual(sourceElementIds);
});

test("keeps legacy equal-column structural classes unchanged", () => {
  const source = enterpriseEfficientWorkflowSection();
  const section: BuilderSection = {
    ...source,
    rows: undefined,
    layout: "2-col-equal",
    layoutItems: [
      {
        id: "equal-one",
        rowId: "equal-row",
        rowLayout: "2-col-equal",
        rowGap: "small",
        columnVerticalAlign: "top",
        blocks: [],
      },
      {
        id: "equal-two",
        rowId: "equal-row",
        rowLayout: "2-col-equal",
        rowGap: "small",
        blocks: [],
      },
    ],
  };

  const row = resolveBuilderSectionStructure(section).rows[0];

  expect(row.className.split(" ")).toEqual([
    "uk-grid",
    "uk-grid-small",
    "uk-grid-match",
  ]);
  expect(row.columns.map(({ className }) => className)).toEqual([
    "uk-width-1-2@m",
    "uk-width-1-2@m",
  ]);
});

test("projects independent canonical Row and responsive Column semantics", () => {
  const source = enterpriseEfficientWorkflowSection();
  const section: BuilderSection = {
    ...source,
    rows: [{
      id: "canonical-row",
      layout: "2-col-equal",
      columnGap: "large",
      rowGap: "small",
      horizontalDistribution: "center",
      topMargin: "40px",
      columns: [
        {
          id: "canonical-one",
          responsiveWidths: { default: "1-1", medium: "1-3" },
          order: { medium: "first" },
          verticalAlign: "middle",
          elements: [],
        },
        { id: "canonical-two", elements: [] },
      ],
    }],
  };

  const row = resolveBuilderSectionStructure(section).rows[0];

  expect(row.className).toContain("uk-grid-column-large");
  expect(row.className).toContain("uk-grid-row-small");
  expect(row.className).toContain("uk-flex-center");
  expect(row.style.marginTop).toBe("40px");
  expect(row.columns[0].className).toContain("uk-width-1-1");
  expect(row.columns[0].className).toContain("uk-width-1-3@m");
  expect(row.columns[0].className).toContain("uk-flex-first@m");
  expect(row.columns[0].className).toContain("uk-flex-middle");
  expect(row.columns[1].className).toContain("uk-width-1-2@m");
});

test("Builder and storefront consume the shared structure outside interaction chrome", () => {
  const storefront = readFileSync(
    resolve(process.cwd(), "components/builder/StorefrontBuilderRenderer.tsx"),
    "utf8",
  );
  const builder = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardBuilder.tsx"),
    "utf8",
  );

  for (const source of [storefront, builder]) {
    expect(source).toContain("resolveBuilderSectionStructure(section");
    expect(source).toContain("structuralRow.className");
    expect(source).toContain("structuralColumn.className");
  }
  expect(builder).toContain("builderInteractionFrameClassName(rowTarget)");
  expect(builder).toContain("builderInteractionClassName(");
  expect(storefront).not.toContain("builderInteractionFrameClassName");
});
