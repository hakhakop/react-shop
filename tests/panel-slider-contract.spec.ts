import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolvePanelSliderRuntime } from "@/lib/panelSliderRuntime";

test("Panel Slider maps its element-level UIkit contract without per-item Card defaults", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", props: {}, children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: {
        text_align: "center", show_title: true, show_image: true,
        show_meta: true, show_content: true, show_link: true,
        image_width: "58", image_loading: true, image_align: "top",
        image_svg_inline: true, image_svg_color: "emphasis",
        title_element: "div", meta_align: "below-title", meta_element: "div", meta_style: "text-meta",
        panel_link: true, link_style: "default", slider_finite: true,
        slider_width: "", slider_width_default: "1-1", slider_width_medium: "1-3",
        slider_gap: "default", slidenav: "outside", slidenav_breakpoint: "xl", nav: "",
      },
      children: [{ type: "panel-slider_item", props: { title: "API", content: "Copy", image: "/icon.svg", link: "/api" } }],
    }] }] }] }],
  });

  const block: any = mapped.sections[0]!.layoutItems![0]!.blocks![0];
  expect(block.kind).toBe("panelSlider");
  expect(block.carouselSettings).toMatchObject({
    presentation: "panel-slider", showTitle: true, showImage: true,
    contentAlign: "center", headingLevel: "div", metaPosition: "below-title",
    imageWidth: "58", imageLoading: "eager", imageSvgInline: true,
    imageSvgColor: "emphasis", itemWidthMode: "auto", cardsPerViewPhone: 1,
    cardsPerViewMedium: 3, showArrows: true, showDots: false,
    arrowPosition: "outside", slidenavBreakpoint: "xlarge", loop: false,
  });
  expect(block.slides[0]).toMatchObject({ title: "API", text: "Copy", panelStyle: "blank", panelSize: "none" });
  expect(block.slides[0]).not.toHaveProperty("panelHover");
  expect(mapped.warnings.join("\n")).not.toContain("image_svg_inline");
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
