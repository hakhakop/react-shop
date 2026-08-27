import { expect, test } from "@playwright/test";

import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import { findYoothemeCapability } from "@/lib/yoothemeCompatibilityRegistry";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolveBuilderRowGap, resolveBuilderRowStyle } from "@/lib/builderRowStyles";
import { resolveBuilderSectionStructure } from "@/lib/builderSectionStructure";

test("fresh Enterprise8 import writes canonical Rows and Columns", () => {
  const imported = mapYoothemeStaticContent(enterprise8);
  const section = imported.sections.find((candidate) =>
    candidate.rows?.some((row) => row.id === "yootheme-section-7-row-1"),
  );
  expect(section).toBeTruthy();
  expect(section!.rows).toBeDefined();

  const firstRow = section!.rows!.find(
    (row) => row.id === "yootheme-section-7-row-1",
  )!;
  expect(firstRow.layout).toBe("thirds-1-2");
  expect(firstRow.customLayout?.template).toBe("1-3,2-3");
  expect(firstRow.topMargin).toBe("medium");
  expect(firstRow.columns).toHaveLength(2);
  expect(firstRow.columns[0]).toMatchObject({
    id: "yootheme-section-7-row-1-column-1",
    responsiveWidths: { medium: "1-3" },
    verticalAlign: "middle",
  });
  expect(firstRow.columns[1]).toMatchObject({
    id: "yootheme-section-7-row-1-column-2",
    responsiveWidths: { medium: "2-3" },
  });
  expect(firstRow.columns[1].verticalAlign).toBeUndefined();
  expect(firstRow.columns.flatMap((column) => column.elements.map((element) => element.id))).toEqual([
    "yootheme-heading-6-0-0-0",
    "yootheme-text-6-0-0-1",
    "yootheme-button-6-0-0-2",
    "yootheme-image-6-0-1-0",
    "yootheme-image-6-0-1-1",
  ]);

  const importedDividers = imported.sections
    .flatMap((candidate) => candidate.rows ?? [])
    .flatMap((row) => row.columns)
    .flatMap((column) => column.elements)
    .filter((element) => element.kind === "divider");
  expect(importedDividers).toHaveLength(2);
  expect(importedDividers[0]).toMatchObject({
    kind: "divider",
    dividerStyle: "default",
    margin: "xlarge",
  });

  const distinctGapRow = imported.sections
    .flatMap((candidate) => candidate.rows ?? [])
    .find((row) => row.columnGap === "small" && row.rowGap === "large");
  expect(distinctGapRow).toBeTruthy();
});

test("does not invent a 40px top margin for an unconfigured YOOtheme row", () => {
  const imported = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [
        { type: "row", children: [{ type: "column", children: [] }] },
        { type: "row", children: [{ type: "column", children: [] }] },
      ],
    }],
  });

  expect(imported.sections[0]?.rows?.[1]?.topMargin).toBeUndefined();
});

test("keeps YOOtheme xlarge row margins on the global token", () => {
  expect(resolveBuilderRowStyle({
    spacingContract: "yootheme",
    rowBottomMargin: "xlarge",
}).marginBottom).toBe("var(--uk-global-margin-xlarge, 140px)");
});

test("keeps YOOtheme small row width on the canonical container token", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        props: { width: "small" },
        children: [{ type: "column", children: [] }],
      }],
    }],
  });
  const structure = resolveBuilderSectionStructure(mapped.sections[0]);
  expect(structure.rows[0]?.style.maxWidth).toBe("var(--uk-container-small-max-width, 900px)");
});

test("does not suppress the visible UIkit row gutter for a source none margin", () => {
  expect(resolveBuilderRowGap(
    { spacingContract: "yootheme" },
    "var(--builder-global-row-gap, 32px)",
    { spacingContract: "yootheme", rowBottomMargin: "none" },
  ).css).toBe("var(--uk-grid-gutter-medium, 40px)");
});

test("projects YOOtheme row viewport height into the shared row style", () => {
  expect(resolveBuilderRowStyle({
    spacingContract: "yootheme",
    rowHeight: { mode: "viewport" },
  }).minHeight).toBe("80vh");
  expect(resolveBuilderRowStyle({
    rowHeight: { mode: "pixels", value: "640px" },
  }).minHeight).toBe("640px");
});

test("lets authored YOOtheme row CSS override inline spacing defaults", () => {
  const style = resolveBuilderRowStyle({
    spacingContract: "yootheme",
    advanced: {
      css: ".el-row { margin-top: -100vh; padding-bottom: 20vh; }",
    },
  });

  expect(style.marginTop).toBeUndefined();
  expect(style.paddingBottom).toBeUndefined();
  expect(style.paddingTop).toBe("0px");
});

test("imports extended structural ownership without repeating Row state on Columns", () => {
  const imported = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        props: {
          layout: "1-3,2-3",
          column_gap: "large",
          row_gap: "small",
          divider: true,
          align: "center",
          width: "large",
          padding_remove_horizontal: true,
          expand: "right",
          height_value: "320",
          height_offset: "10",
          margin: "large",
          margin_remove_bottom: true,
          html_element: "article",
          column_parallax: true,
          column_parallax_start: "10vh",
          class: "row-class",
        },
        children: [{
          type: "column",
          props: {
            width_small: "1-2",
            width_medium: "1-3",
            order_first: "m",
            vertical_align: "middle",
            image: "media/background.jpg",
            image_position: "center-center",
            style: "muted",
            text_color: "light",
            padding: "small",
            html_element: "aside",
            position_sticky: "column",
            position_sticky_offset: "25",
            position_sticky_breakpoint: "m",
            keep_empty: true,
            id: "source-column",
          },
          children: [],
        }, {
          type: "column",
          props: { width_medium: "2-3" },
          children: [],
        }],
      }],
    }],
  });

  const section = imported.sections[0];
  const row = section.rows![0];
  expect(row).toMatchObject({
    layout: "thirds-1-2",
    columnGap: "large",
    rowGap: "small",
    divider: true,
    horizontalDistribution: "center",
    maxWidth: "large",
    removeHorizontalPadding: true,
    expandOneSide: "right",
    height: { mode: "pixels", value: "320px", offset: "10px" },
    topMargin: "large",
    bottomMargin: "none",
    htmlElement: "article",
    columnParallax: { enabled: true, start: "10vh" },
    advanced: { className: "row-class" },
  });
  expect(row.columns[0]).toMatchObject({
    responsiveWidths: { small: "1-2", medium: "1-3" },
    order: { medium: "first" },
    verticalAlign: "middle",
    background: { imageUrl: "/media/background.jpg", position: "center-center" },
    style: "muted",
    textColor: "light",
    padding: "small",
    htmlElement: "aside",
    sticky: { mode: "column-within-row", topOffset: "25px", breakpoint: "m" },
    keepEmpty: true,
    advanced: { htmlId: "source-column" },
  });
  expect(row.columns[1].verticalAlign).toBeUndefined();
});

test("legacy documents still use the pure layoutItems compatibility boundary", () => {
  const normalized = normalizeBuilderSectionLayout({
    id: "legacy-section",
    kind: "contentLayout",
    title: "Legacy",
    background: "transparent",
    visible: true,
    layout: "2-col-equal",
    layoutItems: [{
      id: "legacy-one",
      rowId: "legacy-row",
      rowLayout: "2-col-equal",
      columnVerticalAlign: "center",
      blocks: [{ id: "legacy-element", kind: "text", body: "Legacy" }],
    }, {
      id: "legacy-two",
      rowId: "legacy-row",
      rowLayout: "2-col-equal",
      blocks: [],
    }],
  });

  expect(normalized.source).toBe("legacy");
  expect(normalized.rows[0].columns[0]).toMatchObject({
    id: "legacy-one",
    verticalAlign: "middle",
    elements: [{ id: "legacy-element" }],
  });
});

test("imports 3-4,1-4 / 3-1 row layout to quarters-3-1 canonical preset", () => {
  const imported = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        props: {
          layout: "3-4,1-4",
        },
        children: [{
          type: "column",
          props: { width_medium: "3-4" },
          children: [],
        }, {
          type: "column",
          props: { width_medium: "1-4", vertical_align: "middle" },
          children: [],
        }],
      }],
    }],
  });

  const section = imported.sections[0];
  const row = section.rows![0];
  expect(row.layout).toBe("quarters-3-1");
  expect(row.columns).toHaveLength(2);
  expect(row.columns[0].responsiveWidths?.medium).toBe("3-4");
  expect(row.columns[1].responsiveWidths?.medium).toBe("1-4");
  expect(row.columns[1].verticalAlign).toBe("middle");
});

test("registry distinguishes persisted structural fields from runtime support", () => {
  expect(findYoothemeCapability("row.column_gap")).toMatchObject({
    status: "SUPPORTED",
    canonicalOwner: "BuilderRow",
    persistedDestination: "BuilderSection.rows[]",
  });
  expect(findYoothemeCapability("column.vertical_align")).toMatchObject({
    status: "SUPPORTED",
    canonicalOwner: "BuilderColumn",
    persistedDestination: "BuilderSection.rows[].columns[]",
  });
  expect(findYoothemeCapability("column.image_position")).toMatchObject({
    status: "DEFERRED",
    canonicalOwner: "BuilderColumn",
    runtimeConsumer: null,
  });
  expect(findYoothemeCapability("row.width")).toMatchObject({
    status: "DEFERRED",
    canonicalOwner: "BuilderRow",
    runtimeConsumer: null,
  });
});
