import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { getUikitMarginClass } from "@/lib/uikitTokens";

const fixture = {
  type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
    type: "grid", props: {
      item_maxwidth: "xlarge", panel_content_width: "small", panel_expand: "both",
      title_align: "left", title_grid_width: "2-3", title_grid_column_gap: "large", title_grid_row_gap: "small", title_grid_breakpoint: "l",
      image_align: "between", image_grid_width: "1-3", image_grid_column_gap: "medium", image_grid_row_gap: "large", image_grid_breakpoint: "xl", image_vertical_align: true,
      image_margin: "large",
    }, children: [{ type: "grid_item", props: { title: "Title", content: "Content", image: "/image.jpg" } }],
  }] }] }] }],
};

test("Batch 2 imports YOOtheme Grid composition as canonical structural state", () => {
  const mapped = mapYoothemeStaticContent(fixture as any);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(grid).toMatchObject({
    gridItemMaxWidth: "xlarge", panelContentWidth: "small", panelExpand: "both",
    gridTitlePlacement: "left", gridTitleWidth: "2-3", gridTitleColumnGap: "large", gridTitleRowGap: "small", gridTitleBreakpoint: "l",
    gridMediaPlacement: "between", gridMediaWidth: "1-3", gridMediaColumnGap: "medium", gridMediaRowGap: "large", gridMediaBreakpoint: "xl", gridMediaVerticalAlign: true,
    imageMarginTop: "large",
  });
});

test("Grid renderer composes title and media structurally rather than with positioning CSS", () => {
  const renderer = readFileSync(resolve(process.cwd(), "components/builder/GridCardsClient.tsx"), "utf8");
  expect(renderer).toContain("shop-builder-grid-title-layout uk-grid");
  expect(renderer).toContain("shop-builder-grid-media-layout uk-grid");
  expect(renderer).toContain('mediaPlacement === "between" && renderImage()');
  expect(renderer).toContain('mediaPlacement === "bottom" && renderImage()');
});

test("Grid applies the shared media margin only at YOOtheme's between/bottom placements", () => {
  const renderer = readFileSync(resolve(process.cwd(), "components/builder/GridCardsClient.tsx"), "utf8");
  expect(renderer).toContain('mediaPlacement === "between"');
  expect(renderer).toContain('mediaPlacement === "bottom" && !(hasPanelSurface && rawBlock.panelImageNoPadding === true)');
  expect(renderer).toContain('getUikitMarginClass(rawBlock.imageMarginTop ?? "default", "top")');
});

test("YOOtheme's remove value uses the shared zero-spacing token", () => {
  const mapped = mapYoothemeStaticContent({
    ...fixture,
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid", props: { image_align: "bottom", image_margin: "remove" }, children: [],
    }] }] }] }],
  } as any);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(grid.imageMarginTop).toBe("none");
  expect(getUikitMarginClass(grid.imageMarginTop, "top")).toBe("uk-margin-remove-top");
});
