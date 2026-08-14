import { test, expect } from "@playwright/test";
import { createLayoutBlock } from "@/components/dashboard/builderDefaults";
import { layoutBlockGroups, layoutBlockLabels } from "@/components/dashboard/builderRegistry";
import { INSPECTOR_ELEMENT_CAPABILITIES } from "@/components/dashboard/inspector/inspectorRouting";
import { mapYoothemeElementType, mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolveCarouselPresentation } from "@/lib/carouselPresentation";

test("Slideshow and Overlay Slider are first-class elements on the shared carousel contract", () => {
  const slideshow = createLayoutBlock("slideshow");
  const overlaySlider = createLayoutBlock("overlaySlider");
  const multipleItems = layoutBlockGroups.find((group) => group.id === "multiple-items");

  expect(layoutBlockLabels.slideshow).toBe("Slideshow");
  expect(layoutBlockLabels.overlaySlider).toBe("Overlay Slider");
  expect(multipleItems?.kinds).toEqual(expect.arrayContaining(["slideshow", "overlaySlider", "panelSlider"]));
  expect(multipleItems?.kinds).not.toContain("slider");
  expect(slideshow.carouselSettings?.presentation).toBe("slideshow");
  expect(overlaySlider.carouselSettings?.presentation).toBe("overlay-slider");
  expect(INSPECTOR_ELEMENT_CAPABILITIES.slideshow?.capabilities).toEqual(["content", "style", "advanced"]);
  expect(INSPECTOR_ELEMENT_CAPABILITIES.overlaySlider?.capabilities).toEqual(["content", "style", "advanced"]);
  expect(mapYoothemeElementType("slideshow")).toBe("slideshow");
  expect(mapYoothemeElementType("overlay-slider")).toBe("overlaySlider");
  expect(mapYoothemeElementType("panel-slider")).toBe("panelSlider");
});

test("dynamic-only overlay slides remain authored templates", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [{
            type: "overlay-slider",
            children: [{
              type: "overlay-slider_item",
              props: { title: "", content: "" },
              source: {
                query: { name: "posts.customPosts", arguments: { offset: 0, limit: 3, order: "date", order_direction: "DESC" } },
                props: { title: { name: "title" }, image: { name: "field.intro_image.url" } },
              },
            }],
          }],
        }],
      }],
    }],
  });

  const blocks = mapped.sections.flatMap((section) =>
    section.rows?.flatMap((row) => row.columns.flatMap((column) => column.elements)) ??
    section.layoutItems?.flatMap((item) => item.blocks ?? []) ?? [],
  );
  expect(blocks).toEqual(expect.arrayContaining([
    expect.objectContaining({
      kind: "overlaySlider",
      slides: [expect.objectContaining({
        dynamicContext: expect.objectContaining({ provider: "wordpress", source: "post", mode: "collection" }),
        dynamicBindings: expect.objectContaining({ title: { path: "title", valueType: "string" } }),
      })],
    }),
  ]));
});

test("Panel Slider preserves a whole-panel link without inventing an action label", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: { panel_link: true, link_text: "" },
      children: [{ type: "panel-slider_item", props: { title: "API", image: "api.svg", link: "/api" } }],
    }] }] }] }],
  });
  const panelSlider = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  const slide = panelSlider?.slides?.[0];

  expect(panelSlider?.carouselSettings).toMatchObject({ linkPanel: true });
  expect(slide).toMatchObject({ showAction: false, buttonUrl: "/api" });
  expect(slide?.linkPanel).toBeUndefined();
  expect(slide?.buttonLabel).toBeUndefined();
});

test("Panel Slider keeps global Link presentation separate from item URLs", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: { link_text: "Read more", link_style: "secondary", link_size: "large", link_target: "blank", link_fullwidth: true, link_margin: "large" },
      children: [{ type: "panel-slider_item", props: { title: "API", image: "api.svg", link: "/api" } }],
    }] }] }] }],
  });
  const panelSlider = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0];
  const slide = panelSlider?.slides?.[0];

  expect(panelSlider?.carouselSettings).toMatchObject({ buttonLabel: "Read more", buttonStyle: "secondary", buttonSize: "large", linkTarget: "_blank", fullWidthButton: true, linkMarginTop: "large" });
  expect(slide).toMatchObject({ buttonUrl: "/api" });
  expect(slide?.buttonLabel).toBeUndefined();
});

test("Panel Slider normalizes UIkit navigation strings without treating none as enabled", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      props: { slidenav: "outside", slidenav_margin: "medium", slidenav_breakpoint: "s", nav: "none" },
      children: [{ type: "panel-slider_item", props: { title: "API", image: "api.svg" } }],
    }, {
      type: "panel-slider",
      props: { slidenav: "none", nav: "dotnav" },
      children: [{ type: "panel-slider_item", props: { title: "Docs", image: "docs.svg" } }],
    }] }] }] }],
  });
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];

  expect(blocks[0]?.carouselSettings).toMatchObject({
    showArrows: true,
    arrowPosition: "outer",
    slidenavMargin: "medium",
    slidenavBreakpoint: "small",
    showDots: false,
    navigationType: "none",
  });
  expect(blocks[1]?.carouselSettings).toMatchObject({
    showArrows: false,
    showDots: true,
    navigationType: "dotnav",
  });
});

test("Panel Slider media defaults inherit through the shared resolver without masking item overrides", () => {
  const resolved = resolveCarouselPresentation(
    { presentation: "panel-slider", imageWidth: "58", imageLoading: "eager", imageShape: "rounded" },
    [{ id: "inherits" }, { id: "overrides", imageWidth: "96" }],
    { imageDefaultFit: "cover", imageDefaultRatio: "16:9" },
  );

  expect(resolved.slides[0]).toMatchObject({ imageWidth: "58", imageLoading: "eager", imageShape: "rounded" });
  expect(resolved.slides[1]).toMatchObject({ imageWidth: "96", imageLoading: "eager", imageShape: "rounded" });
});

test("static slideshow and overlay-slider fields normalize into shared carousel settings", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [
      {
        type: "slideshow",
        props: {
          slideshow_height: "viewport", slideshow_animation: "fade", show_title: false, show_content: true,
          show_link: true, link_text: "Read more", overlay_position: "center-left", title_element: "h3",
        },
        children: [{ type: "slideshow_item", props: { title: "Static", content: "Body", image: "hero.jpg" } }],
      },
      {
        type: "overlay-slider",
        props: {
          overlay_mode: "cover", overlay_display: "hover", overlay_position: "center", overlay_padding: "large", show_link: false,
          slider_width: "fixed", slider_width_default: "1-1", slider_width_medium: "1-3",
          nav: "dotnav", nav_below: true, nav_breakpoint: "s", nav_position: "bottom-center", nav_position_margin: "default",
          slidenav: "default", slidenav_breakpoint: "s", slidenav_margin: "medium",
          title_element: "h3", meta_align: "below-title", meta_element: "div", meta_style: "text-meta",
          link_text: "Read more", link_style: "default", overlay_style: "primary",
        },
        children: [{ type: "overlay-slider_item", props: { title: "Overlay", image: "overlay.jpg" } }],
      },
    ] }] }] }],
  });
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  const slideshow = blocks.find((block) => block.kind === "slideshow");
  const overlay = blocks.find((block) => block.kind === "overlaySlider");

  expect(slideshow?.carouselSettings).toMatchObject({
    slideshowHeight: "viewport", effect: "fade", showTitle: false, showContent: true,
    overlayPosition: "center-left", overlayPadding: "default", headingLevel: "h3", overlayTextColor: undefined,
  });
  expect(slideshow?.slides?.[0]).toMatchObject({ showAction: false, buttonLabel: undefined });
  expect((slideshow?.carouselSettings as any)?.buttonLabel).toBe("Read more");
  expect(slideshow?.slides?.[0]?.buttonUrl).toBeUndefined();
  expect(overlay?.carouselSettings).toMatchObject({
    overlayMode: "cover", overlayDisplay: "hover", overlayPosition: "center", overlayPadding: "large", showLink: false,
    itemWidthMode: "fixed", cardsPerViewPhone: 1, cardsPerViewMedium: 3,
    navigationType: "dotnav", navigationBelow: true, navigationMargin: "default", navigationBreakpoint: "small", paginationPosition: "bottom-center",
    arrowPosition: "overlay", slidenavBreakpoint: "small", headingLevel: "h3", metaPosition: "below-title", buttonLabel: "Read more",
    overlayStyle: "primary",
  });
});
