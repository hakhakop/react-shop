import { test, expect } from "@playwright/test";
import { createLayoutBlock } from "@/components/dashboard/builderDefaults";
import { layoutBlockGroups, layoutBlockLabels } from "@/components/dashboard/builderRegistry";
import { INSPECTOR_ELEMENT_CAPABILITIES } from "@/components/dashboard/inspector/inspectorRouting";
import { mapYoothemeElementType, mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

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

test("dynamic-only overlay slides are deferred instead of becoming empty static slides", () => {
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
              source: { query: { name: "posts.customPosts" } },
            }],
          }],
        }],
      }],
    }],
  });

  const blocks = mapped.sections.flatMap((section) =>
    section.layoutItems?.flatMap((item) => item.blocks ?? []) ?? [],
  );
  expect(blocks).not.toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "overlaySlider" }),
  ]));
  expect(mapped.warnings.join("\n")).toContain("DYNAMIC CONTENT UNSUPPORTED FOR NOW");
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
  const slide = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0]?.slides?.[0];

  expect(slide).toMatchObject({ linkPanel: true, showAction: false, buttonUrl: "/api" });
  expect(slide?.buttonLabel).toBeUndefined();
});

test("static slideshow and overlay-slider fields normalize into shared carousel settings", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [
      {
        type: "slideshow",
        props: { slideshow_height: "viewport", slideshow_animation: "fade", show_title: false, show_content: true },
        children: [{ type: "slideshow_item", props: { title: "Static", content: "Body", image: "hero.jpg" } }],
      },
      {
        type: "overlay-slider",
        props: { overlay_mode: "cover", overlay_display: "hover", overlay_position: "center", overlay_padding: "large", show_link: false },
        children: [{ type: "overlay-slider_item", props: { title: "Overlay", image: "overlay.jpg" } }],
      },
    ] }] }] }],
  });
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  const slideshow = blocks.find((block) => block.kind === "slideshow");
  const overlay = blocks.find((block) => block.kind === "overlaySlider");

  expect(slideshow?.carouselSettings).toMatchObject({
    slideshowHeight: "viewport", effect: "fade", showTitle: false, showContent: true,
  });
  expect(overlay?.carouselSettings).toMatchObject({
    overlayMode: "cover", overlayDisplay: "hover", overlayPosition: "center", overlayPadding: "large", showLink: false,
  });
});
