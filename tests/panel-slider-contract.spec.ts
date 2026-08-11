import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import type { BuilderSection } from "@/components/dashboard/builderTypes";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolvePanelSliderRuntime } from "@/lib/panelSliderRuntime";
import { resolveCarouselContentAlignment } from "@/lib/carouselPresentation";

// Compile-time guard for the persisted Panel Slider contract. These are all
// fields already consumed by the importer/runtime; this object must not need
// an `any` cast to represent them.
const panelSliderTypeContractCheck: {
  carouselSettings: Pick<NonNullable<BuilderSection["carouselSettings"]>,
    | "imageWidth" | "imageHeight" | "imageSvgInline" | "imageSvgColor"
    | "metaPosition" | "metaHtmlElement" | "metaStyle"
    | "navigationBreakpoint" | "slidenavOutsideBreakpoint"
  >;
  slide: Pick<NonNullable<BuilderSection["slides"]>[number],
    | "meta" | "imageWidth" | "imageHeight" | "imageSvgInline" | "imageSvgColor"
    | "metaHtmlElement" | "metaStyle" | "buttonTarget" | "buttonStyle" | "buttonSize"
    | "panelStyle" | "panelSize" | "panelHover"
  >;
} = {
  carouselSettings: {
    imageWidth: "58", imageHeight: "240", imageSvgInline: true, imageSvgColor: "emphasis",
    metaPosition: "below-title", metaHtmlElement: "div", metaStyle: "text-meta",
    navigationBreakpoint: "large", slidenavOutsideBreakpoint: "xlarge",
  },
  slide: {
    meta: "Meta", imageWidth: "280", imageHeight: "140", imageSvgInline: true, imageSvgColor: "emphasis",
    metaHtmlElement: "span", metaStyle: "meta", buttonTarget: "_blank", buttonStyle: "text", buttonSize: "small",
    panelStyle: "secondary", panelSize: "small", panelHover: false,
  },
};
void panelSliderTypeContractCheck;

test("Panel Slider content alignment is a General-only canonical semantic", () => {
  expect(resolveCarouselContentAlignment("left")).toBe("left");
  expect(resolveCarouselContentAlignment("center")).toBe("center");
  expect(resolveCarouselContentAlignment("right")).toBe("right");
  expect(resolveCarouselContentAlignment(undefined)).toBe("left");
});

test("Panel Slider Settings does not compose a duplicate text-alignment control", () => {
  const source = readFileSync(
    path.join(process.cwd(), "components/dashboard/inspector/panels/SliderCapabilityPanel.tsx"),
    "utf8",
  );
  expect(source).not.toContain('label="Text alignment"');
});

test("Panel Slider maps its element-level UIkit contract without per-item Card defaults", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: {
        text_align: "center", show_title: true, show_image: true,
        show_meta: true, show_content: true, show_link: true,
        image_width: "58", image_height: "240", image_loading: true, image_align: "top", image_border: "rounded", text_color: "light",
        image_svg_inline: true, image_svg_color: "emphasis",
        title_element: "div", meta_align: "below-title", meta_element: "div", meta_style: "text-meta",
        panel_link: true, link_style: "default", slider_finite: true,
        panel_style: "card-primary", panel_padding: "large", panel_link_hover: true, slider_divider: true,
        slider_width: "", slider_width_default: "1-1", slider_width_medium: "1-3", slider_width_xlarge: "1-6",
        nav_breakpoint: "l", slidenav_outside_breakpoint: "xl",
        slider_gap: "default", slidenav: "outside", slidenav_breakpoint: "xl", nav: "",
      },
      children: [{ type: "panel-slider_item", props: { title: "API", content: "Copy", image: "/icon.svg", link: "/api" } }],
    }] }] }] }],
  });

  const block: any = mapped.sections[0]!.layoutItems![0]!.blocks![0];
  expect(block.kind).toBe("panelSlider");
  expect(block.carouselSettings).toMatchObject({
    presentation: "panel-slider", showTitle: true, showImage: true,
    headingLevel: "div", metaPosition: "below-title",
    imageWidth: "58", imageHeight: "240", imageLoading: "eager", imageSvgInline: true,
    imageSvgColor: "emphasis", imageShape: "rounded", itemWidthMode: "auto", cardsPerViewPhone: 1,
    cardsPerViewMedium: 3, cardsPerViewXLarge: 6, showArrows: true, showDots: false,
    arrowPosition: "outside", slidenavBreakpoint: "xlarge", navigationBreakpoint: "large", slidenavOutsideBreakpoint: "xlarge", loop: false, divider: true,
  });
  expect(block.slides[0]).toMatchObject({ title: "API", text: "Copy", panelStyle: "primary", panelSize: "large", panelHover: true });
  expect(block.slides[0]).not.toHaveProperty("imageWidth");
  expect(block.slides[0]).not.toHaveProperty("imageHeight");
  expect(block.carouselSettings.divider).toBe(true);
  expect(block.carouselSettings).not.toHaveProperty("imageAlignment");
  expect(block.carouselSettings).not.toHaveProperty("contentAlign");
  expect(block.slides[0]).not.toHaveProperty("imageAlignment");
  expect(mapped.warnings.join("\n")).not.toContain("image_border");
  expect(mapped.warnings.join("\n")).not.toContain("image_svg_inline");
  expect(mapped.warnings.join("\n")).not.toContain("image_svg_color");
  expect(mapped.warnings.join("\n")).toContain("image_align: DEFERRED");
  expect(mapped.warnings.join("\n")).toContain("text_color: DEFERRED");
  expect(mapped.warnings.join("\n")).toContain("nav_breakpoint: DEFERRED");
  expect(mapped.warnings.join("\n")).toContain("slidenav_outside_breakpoint: DEFERRED");
  expect(mapped.warnings.join("\n")).not.toContain("nav_breakpoint: INTENTIONALLY UNSUPPORTED");
  expect(mapped.warnings.join("\n")).not.toContain("slidenav_outside_breakpoint: INTENTIONALLY UNSUPPORTED");
  expect(mapped.warnings.join("\n")).not.toContain("image_width: UNHANDLED");
  expect(mapped.warnings.join("\n")).not.toContain("image_svg_inline: UNHANDLED");
  expect(mapped.warnings.join("\n")).not.toContain("panel_link: UNHANDLED");
});

test("Panel Slider reports deferred, intentional, and unknown fields distinctly", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: {
        image_align: "left",
        text_color: "light",
        nav_breakpoint: "l",
        slidenav_outside_breakpoint: "xl",
        image_grid_width: "1-2",
        panel_slider_future_option: "unknown",
      },
      children: [{
        type: "panel-slider_item",
        props: { title: "Item", image_align: "left", text_color: "light" },
      }],
    }] }] }] }],
  });

  const warnings = mapped.warnings.join("\n");
  expect(warnings).toContain("image_align: DEFERRED");
  expect(warnings).toContain("text_color: DEFERRED");
  expect(warnings).toContain("nav_breakpoint: DEFERRED");
  expect(warnings).toContain("slidenav_outside_breakpoint: DEFERRED");
  expect(warnings).toContain("image_grid_width: INTENTIONALLY UNSUPPORTED");
  expect(warnings).toContain("panel_slider_future_option: UNHANDLED");
  expect(warnings).toContain("0.0.0.0.0.image_align: DEFERRED");
  expect(warnings).toContain("0.0.0.0.0.text_color: DEFERRED");
  expect(warnings).not.toContain("image_grid_width: UNHANDLED");
});

test("Panel Slider keeps element media defaults separate from item overrides", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: { image_width: "58", image_height: "240", image_svg_inline: true },
      children: [{
        type: "panel-slider_item",
        props: { title: "Override", image_width: "280", image_height: "140", image_svg_inline: false },
      }],
    }] }] }] }],
  });

  const block: any = mapped.sections[0]!.layoutItems![0]!.blocks![0];
  expect(block.carouselSettings).toMatchObject({ imageWidth: "58", imageHeight: "240", imageSvgInline: true });
  expect(block.slides[0]).toMatchObject({ imageWidth: "280", imageHeight: "140" });
  expect(block.slides[0].imageSvgInline).toBeUndefined();
});

test("Panel Slider Auto is content-sized and does not apply persisted fraction widths", () => {
  expect(resolvePanelSliderRuntime({
    itemWidthMode: "auto",
    cardsPerViewPhone: 1,
    cardsPerViewMedium: 3,
  })).toEqual({
    mode: "auto",
    slidesPerView: "auto",
    counts: { base: 1, small: 1, medium: 3, large: 3, xlarge: 3 },
    breakpoints: undefined,
  });
});

test("Panel Slider Fixed applies UIkit breakpoints and inherits omitted widths", () => {
  expect(resolvePanelSliderRuntime({
    itemWidthMode: "fixed",
    cardsPerViewPhone: 1,
    cardsPerViewMedium: 3,
    cardsPerViewXLarge: 6,
  })).toMatchObject({
    mode: "fixed",
    slidesPerView: 1,
    counts: { base: 1, small: 1, medium: 3, large: 3, xlarge: 6 },
    breakpoints: {
      320: { slidesPerView: 1 },
      640: { slidesPerView: 1 },
      960: { slidesPerView: 3 },
      1200: { slidesPerView: 3 },
      1600: { slidesPerView: 6 },
    },
  });
});

test("Panel Slider preserves YOOtheme's explicit Fixed item width mode", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: { slider_width: "fixed", slider_width_default: "1-2" },
      children: [{ type: "panel-slider_item", props: { title: "Fixed" } }],
    }] }] }] }],
  });

  const block: any = mapped.sections[0]!.layoutItems![0]!.blocks![0];
  expect(block.carouselSettings).toMatchObject({ itemWidthMode: "fixed", cardsPerViewPhone: 2 });
});

test("Panel Slider keeps element typography and actions canonical while preserving item overrides", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: {
        title_element: "h2", title_style: "heading-large", meta_align: "below-content",
        meta_element: "p", meta_style: "text-lead", link_style: "secondary", link_size: "large",
        link_target: "blank", panel_link: true,
      },
      children: [{ type: "panel-slider_item", props: {
        title: "Item", content: "<p>Safe <strong>HTML</strong></p><script>window.bad = true</script>", meta: "Meta",
        title_element: "h4", title_style: "heading-small", meta_align: "above-title",
        meta_element: "span", meta_style: "text-meta", link: "/item", link_text: "Read",
        link_style: "text", link_size: "small", link_target: "blank",
      } }],
    }] }] }] }],
  });

  const block: any = mapped.sections[0]!.layoutItems![0]!.blocks![0];
  expect(block.carouselSettings).toMatchObject({
    headingLevel: "h2", headingSize: "large", metaPosition: "below-content",
    metaHtmlElement: "p", metaStyle: "text-lead", buttonStyle: "secondary",
    buttonSize: "large", linkTarget: "_blank", linkPanel: true,
  });
  expect(block.slides[0]).toMatchObject({
    headingLevel: "h4", headingSize: "small", gridMetaAlign: "above-title",
    metaHtmlElement: "span", metaStyle: "meta", buttonStyle: "text",
    buttonSize: "small", buttonTarget: "_blank", linkPanel: true,
  });
  expect(block.slides[0].text).toContain("<strong>HTML</strong>");
  expect(block.slides[0].text).not.toContain("<script");
});

test("Panel Slider preserves explicit per-item Card presentation overrides", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: { panel_style: "card-primary", panel_padding: "large", panel_link_hover: true },
      children: [{ type: "panel-slider_item", props: {
        title: "Item override", panel_style: "card-secondary", panel_padding: "small", panel_link_hover: false,
      } }],
    }] }] }] }],
  });

  const slide: any = mapped.sections[0]!.layoutItems![0]!.blocks![0]!.slides![0];
  expect(slide).toMatchObject({ panelStyle: "secondary", panelSize: "small", panelHover: false });
});
