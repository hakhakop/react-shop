import { expect, test } from "@playwright/test";

import enterprise8 from "@/tests/fixtures/yootheme-compatibility/sources/enterprise8.json";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import { findYoothemeCapability } from "@/lib/yoothemeCompatibilityRegistry";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

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
  expect(firstRow.topMargin).toBe("40px");
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

  const distinctGapRow = imported.sections
    .flatMap((candidate) => candidate.rows ?? [])
    .find((row) => row.columnGap === "small" && row.rowGap === "large");
  expect(distinctGapRow).toBeTruthy();
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
