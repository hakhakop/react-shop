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

test("flush Grid media cannot wrap expanded Panel content into a clipped column", () => {
  const styles = readFileSync(resolve(process.cwd(), "app/styles/shop-builder.css"), "utf8");
  expect(styles).toContain(".shop-builder-grid-card.shop-builder-panel--expand-content {\n  display: flex;\n  flex-direction: column;");
  expect(styles).toContain("flex-wrap: nowrap;");
});

test("Grid applies the shared Image margin top for every placement", () => {
  const renderer = readFileSync(resolve(process.cwd(), "components/builder/GridCardsClient.tsx"), "utf8");
  const styles = readFileSync(resolve(process.cwd(), "app/styles/shop-builder.css"), "utf8");
  const dashboardStyles = readFileSync(resolve(process.cwd(), "app/styles/dashboard.css"), "utf8");
  expect(renderer).toContain('getUikitMarginClass(rawBlock.imageMarginTop ?? "default", "top")');
  expect(renderer).toContain('getUikitMarginClass(rawBlock.metaMarginTop, "top")');
  expect(renderer).toContain('.replace(/\\buk-margin-remove-top\\b/g, "").trim()');
  expect(renderer).not.toContain('mediaPlacement === "between"\n              ||');
  expect(styles).toContain("margin-bottom: 20px !important;");
  expect(styles).not.toContain("margin: 0 0 20px 0 !important;");
  expect(dashboardStyles).toContain("margin-bottom: 20px !important;");
  expect(dashboardStyles).not.toContain("margin: 0 0 20px 0 !important;");
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
  expect(getUikitMarginClass("small", "top")).toBe("uk-margin-small-top");
  expect(getUikitMarginClass("medium", "top")).toBe("uk-margin-medium-top");
  expect(getUikitMarginClass("large", "top")).toBe("uk-margin-large-top");
});

test("Grid parent Image settings retain YOOtheme owners during import", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid", props: {
        image_width: "80", image_height: "80", image_loading: true, image_border: "rounded",
        image_box_shadow: "medium", image_box_decoration: "primary", image_transition: "scale-up",
        image_hover_box_shadow: "large", image_hover_border: true, image_grid_width: "1-2",
        image_grid_column_gap: "small", image_grid_row_gap: "large", image_grid_breakpoint: "m",
        image_vertical_align: true, image_margin: "medium", image_svg_inline: true,
        image_svg_animate: true, image_svg_color: "emphasis", icon_width: 80, icon_color: "primary",
        text_color: "light", image_align: "between", image_link: true,
      }, children: [],
    }] }] }] }],
  } as any);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(grid).toMatchObject({
    imageWidth: "80px", imageHeight: "80px", imageLoading: "eager", imageShape: "rounded",
    imageShadow: "medium", imageBoxDecoration: "primary", imageHoverTransition: "scale-up",
    imageHoverBoxShadow: "large", imageHoverBorder: true, gridMediaWidth: "1-2",
    gridMediaColumnGap: "small", gridMediaRowGap: "large", gridMediaBreakpoint: "m",
    gridMediaVerticalAlign: true, imageMarginTop: "medium", imageSvgInline: true,
    imageSvgAnimate: true, imageSvgColor: "emphasis", imageIconWidth: "80", imageIconColor: "primary",
    imageTextColor: "light", gridMediaPlacement: "between", linkImage: true,
  });
});

test("Grid parent alignment is not shadowed by synthetic item-top defaults", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid", props: { image_align: "bottom" }, children: [{ type: "grid_item", props: { title: "Item", image: "/image.jpg" } }],
    }] }] }] }],
  } as any);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(grid.gridMediaPlacement).toBe("bottom");
  expect(grid.gridItems?.[0]?.mediaPlacement).toBeUndefined();
});

test("Grid Meta settings retain canonical style, alignment, element, and margin owners", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid", props: {
        meta_style: "h5", meta_color: "none", meta_align: "above-content",
        meta_element: "h3", meta_margin: "medium",
      }, children: [{ type: "grid_item", props: { title: "Item", meta: "Meta" } }],
    }] }] }] }],
  } as any);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(grid).toMatchObject({
    metaStyle: "h5", metaColor: "none", gridMetaAlign: "above-content",
    gridMetaHtmlElement: "h3", metaMarginTop: "medium",
  });
});

test("Grid Panel settings retain YOOtheme style, padding, expansion, and max-width owners", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid", props: {
        panel_style: "tile-checked", panel_padding: "large", panel_link: true,
        panel_link_hover: true, panel_expand: "content", item_maxwidth: "medium",
      }, children: [],
    }] }] }] }],
  } as any);
  const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks[0] as any;
  expect(grid).toMatchObject({
    gridCardVariant: "tile-checked", gridCardSize: "large", linkPanel: true,
    panelHover: true, panelExpand: "content", gridItemMaxWidth: "medium",
  });
});

test("YOOtheme Grid Panel padding preserves the canonical card spacing scale", () => {
  const styles = readFileSync(resolve(process.cwd(), "app/styles/shop-builder.css"), "utf8");
  expect(styles).toContain(".shop-builder-grid-card--yootheme .shop-builder-panel-padding-small {\n  padding: 20px !important;");
  expect(styles).toContain(".shop-builder-grid-card--yootheme .shop-builder-panel-padding-default {\n  padding: 40px 30px !important;");
  expect(styles).toContain(".shop-builder-grid-card--yootheme .shop-builder-panel-padding-large {\n  padding: 70px !important;");
});

test("YOOtheme Grid title does not receive an invented top-margin fallback", () => {
  const renderer = readFileSync(resolve(process.cwd(), "components/builder/GridCardsClient.tsx"), "utf8");
  expect(renderer).toContain("${titleMarginTopClass} ${isYoothemeGrid ? \"uk-margin-remove-bottom\" : \"\"}");
  expect(renderer).not.toContain('titleMarginTopClass || (isYoothemeGrid ? "uk-margin-top" : "")');
});
