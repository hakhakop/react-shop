import { expect, test } from "@playwright/test";
import { normalizeLayoutToUikitPreset } from "@/lib/uikitLayoutEngine";
import { getBuilderRowLayoutPreset, builderRowLayoutPresets } from "@/components/dashboard/builderLayoutPresets";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { resolveBuilderSectionStructure } from "@/lib/builderSectionStructure";

test.describe("YOOtheme Testimonials Section & Overlay Slider Parity", () => {
  test("layout engine normalizes 3-4,1-4 and 3-1 to quarters-3-1 with [3, 1] ratio preview", () => {
    expect(normalizeLayoutToUikitPreset("3-4,1-4")).toBe("quarters-3-1");
    expect(normalizeLayoutToUikitPreset("3-1")).toBe("quarters-3-1");
    expect(normalizeLayoutToUikitPreset("1-4,3-4")).toBe("quarters-1-3");
    expect(normalizeLayoutToUikitPreset("1-3")).toBe("quarters-1-3");
    expect(normalizeLayoutToUikitPreset("2-3,1-3")).toBe("thirds-2-1");
    expect(normalizeLayoutToUikitPreset("2-1")).toBe("thirds-2-1");

    const preset31 = getBuilderRowLayoutPreset("quarters-3-1");
    expect(preset31.key).toBe("quarters-3-1");
    expect(preset31.ratios).toEqual([3, 1]);

    const preset21 = getBuilderRowLayoutPreset("thirds-2-1");
    expect(preset21.key).toBe("thirds-2-1");
    expect(preset21.ratios).toEqual([2, 1]);

    const card = builderRowLayoutPresets.find((p) => p.key === "quarters-3-1");
    expect(card).toBeDefined();
    expect(card!.ratios).toEqual([3, 1]);
  });

  test("imports Testimonials section preserving 3-1 row ratio and column vertical alignment", () => {
    const yoothemeTestimonialsSource = {
      type: "layout",
      children: [
        {
          type: "section",
          name: "Testimonials",
          props: {
            style: "default",
            padding: "xlarge",
            padding_remove_bottom: true,
            width: "expand",
          },
          children: [
            {
              type: "row",
              props: {
                layout: "3-4,1-4",
                margin: "large",
                width: "default",
              },
              children: [
                {
                  type: "column",
                  props: { width_medium: "3-4" },
                  children: [
                    {
                      type: "headline",
                      props: {
                        title: "Reach Your Digital Goals With a Solution",
                        heading_tag: "h2",
                      },
                    },
                  ],
                },
                {
                  type: "column",
                  props: {
                    width_medium: "1-4",
                    vertical_align: "middle",
                    align: "right",
                  },
                  children: [
                    {
                      type: "button",
                      props: {
                        label: "View All",
                        button_style: "primary",
                      },
                    },
                  ],
                },
              ],
            },
            {
              type: "row",
              props: {
                layout: "1-1",
                width: "expand",
              },
              children: [
                {
                  type: "column",
                  props: {},
                  children: [
                    {
                      type: "overlay-slider",
                      props: {
                        image_width: "800",
                        center: true,
                        space_between: 15,
                        button_style: "default",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    const imported = mapYoothemeStaticContent(yoothemeTestimonialsSource);
    expect(imported.sections).toHaveLength(1);

    const section = imported.sections[0];
    expect(section.title).toBe("Testimonials");
    expect(section.rows).toHaveLength(2);

    const row1 = section.rows![0];
    expect(row1.layout).toBe("quarters-3-1");
    expect(row1.maxWidth).toBe("default");
    expect(row1.columns).toHaveLength(2);
    expect(row1.columns[0].responsiveWidths?.medium).toBe("3-4");
    expect(row1.columns[1].responsiveWidths?.medium).toBe("1-4");
    expect(row1.columns[1].verticalAlign).toBe("middle");

    const row2 = section.rows![1];
    expect(row2.layout).toBe("1-col");
    expect(row2.maxWidth).toBe("expand");

    const structure = resolveBuilderSectionStructure(section);
    expect(structure.rows).toHaveLength(2);

    // Row 1 Column 1: uk-width-3-4@m
    expect(structure.rows[0].columns[0].className).toContain("uk-width-3-4@m");

    // Row 1 Column 2: uk-width-1-4@m and vertical middle (uk-flex uk-flex-middle)
    expect(structure.rows[0].columns[1].className).toContain("uk-width-1-4@m");
    expect(structure.rows[0].columns[1].className).toContain("uk-flex-middle");
  });

  test("fresh import preserves Customer Stories overlay slider gap 15, cards per view, and unboxed width", () => {
    const imported = mapYoothemeStaticContent({
      type: "layout",
      children: [
        {
          type: "section",
          name: "Customer Stories",
          props: {
            id: "customer-stories",
            padding: "large",
            padding_remove_bottom: true,
            style: "default",
            width: "",
          },
          children: [
            {
              type: "row",
              props: { width: "default" },
              children: [
                {
                  type: "column",
                  props: {},
                  children: [
                    {
                      type: "headline",
                      props: { content: "Trusted By Clients", title_element: "h2" },
                    },
                  ],
                },
              ],
            },
            {
              type: "row",
              props: { margin: "large", margin_remove_bottom: true },
              children: [
                {
                  type: "column",
                  props: {},
                  children: [
                    {
                      type: "overlay-slider",
                      props: {
                        image_width: "800",
                        link_margin: "xlarge",
                        link_style: "default",
                        link_text: "Read Story",
                        margin: "large",
                        margin_remove_bottom: true,
                        overlay_display: "hover",
                        overlay_link: true,
                        overlay_mode: "cover",
                        overlay_padding: "large",
                        overlay_position: "bottom-center",
                        overlay_transition: "fade",
                        show_content: true,
                        show_link: true,
                        show_meta: true,
                        show_title: true,
                        slidenav: "default",
                        slider_autoplay_pause: true,
                        slider_center: true,
                        slider_gap: "small",
                        slider_width_default: "1-1",
                        slider_width_medium: "4-5",
                        text_align: "center",
                      },
                      children: [
                        {
                          type: "overlay-slider_item",
                          props: {
                            title: "Story 1",
                            image: "wp-content/uploads/story-1.jpg",
                          },
                        },
                        {
                          type: "overlay-slider_item",
                          props: {
                            title: "Story 2",
                            image: "wp-content/uploads/story-2.jpg",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const customerStoriesSection = imported.sections.find(
      (s) => s.title === "Customer Stories",
    );
    expect(customerStoriesSection).toBeDefined();
    expect(customerStoriesSection!.contentMode).toBe("expand");

    const sliderBlock = customerStoriesSection!.rows?.flatMap((r) =>
      r.columns.flatMap((c) => c.elements),
    ).find((el) => el.kind === "overlaySlider");

    expect(sliderBlock).toBeDefined();
    expect(sliderBlock!.carouselSettings?.presentation).toBe("overlay-slider");
    expect(sliderBlock!.carouselSettings?.spaceBetween).toBe(15);
    expect(sliderBlock!.carouselSettings?.centered).toBe(true);
    expect(sliderBlock!.carouselSettings?.cardsPerViewMedium).toBe(1.25);
    expect(sliderBlock!.carouselSettings?.cardsPerViewPhone).toBe(1);
  });

  test("imports fixed item width mode preserving itemWidthMode: fixed and imageWidth", () => {
    const imported = mapYoothemeStaticContent({
      type: "layout",
      children: [
        {
          type: "section",
          props: {},
          children: [
            {
              type: "row",
              props: {},
              children: [
                {
                  type: "column",
                  props: {},
                  children: [
                    {
                      type: "overlay-slider",
                      props: {
                        slider_width: "fixed",
                        image_width: "800",
                        image_height: "500",
                        slider_gap: "small",
                      },
                      children: [
                        {
                          type: "overlay-slider_item",
                          props: { title: "Item 1", image: "test.jpg" },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    const block = imported.sections[0].rows![0].columns[0].elements[0];
    expect(block.kind).toBe("overlaySlider");
    expect(block.carouselSettings?.itemWidthMode).toBe("fixed");
    expect(block.carouselSettings?.imageWidth).toBe("800px");
    expect(block.carouselSettings?.imageHeight).toBe("500px");
    expect(block.carouselSettings?.spaceBetween).toBe(15);
  });

  test("resolveCarouselPresentation propagates parent imageWidth and imageHeight to overlay slider slides", () => {
    const { resolveCarouselPresentation } = require("../lib/carouselPresentation");
    const result = resolveCarouselPresentation(
      {
        presentation: "overlay-slider",
        imageWidth: "600px",
        imageHeight: "400px",
      },
      [
        { id: "s1", title: "Slide 1" },
        { id: "s2", title: "Slide 2" },
      ],
      {},
    );

    expect(result.slides[0].imageWidth).toBe("600px");
    expect(result.slides[0].imageHeight).toBe("400px");
    expect(result.slides[1].imageWidth).toBe("600px");
    expect(result.slides[1].imageHeight).toBe("400px");
  });
});
