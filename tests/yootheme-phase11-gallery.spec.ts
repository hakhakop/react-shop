import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const fixture = {
  type: "layout", children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
    type: "gallery",
    props: { show_title: true, show_meta: true, show_content: true, show_link: true, show_hover_image: false, show_hover_video: false, grid_column_gap: "large", grid_row_gap: "small", grid_divider: true, overlay_mode: "caption", overlay_link: true, lightbox: true, link_text: "Read more", link_style: "default", image_width: 640, image_height: 400, image_loading: true, image_border: "rounded", image_box_shadow: "medium" },
    children: [{ type: "gallery_item", props: { image: "/gallery.jpg", image_alt: "Gallery example", title: "Example", meta: "Work", content: "<p><strong>Rich</strong> copy</p>", link: "/example", link_text: "View", link_aria_label: "View Example", tags: "design, art" } }],
  }] }] }] }],
};

test("Phase 11.3 maps the verified static Gallery item and shared media subset", () => {
  const mapped = mapYoothemeStaticContent(fixture);
  const gallery = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;
  expect(gallery).toMatchObject({ kind: "gallery", gridGap: "large", gridRowGap: "small", showDividers: true, overlayMode: "caption", overlayLink: true, enableLightbox: true, linkText: "Read more", buttonStyle: "default", imageWidth: 640, imageHeight: 400, imageLoading: "eager", imageBorder: "rounded", imageShadow: "medium", imageBoxShadow: "medium" });
  expect(gallery.galleryItems).toEqual([expect.objectContaining({ imageUrl: "/gallery.jpg", imageAlt: "Gallery example", title: "Example", meta: "Work", content: "<p><strong>Rich</strong> copy</p>", linkUrl: "/example", linkLabel: "View", linkTarget: "_self", linkAriaLabel: "View Example", tags: ["design", "art"] })]);
  expect(mapped.warnings).toEqual([]);
});

test("Phase 11.3 reports Gallery-only runtime gaps instead of fabricating support", () => {
  const mapped = mapYoothemeStaticContent({
    ...fixture,
    children: [{ ...fixture.children[0], children: [{ ...fixture.children[0].children[0], children: [{ ...fixture.children[0].children[0].children[0], children: [{ type: "gallery", props: { grid_medium: "3", lightbox: true, filter: true, overlay_style: "overlay-primary" }, children: [{ type: "gallery_item", props: { video: "https://example.test/video", hover_image: "/hover.jpg" } }] }] }] }] }],
  });
  expect(mapped.warnings.join("\n")).toContain("Gallery has no exact canonical runtime");
  expect(mapped.warnings.join("\n")).toContain("Gallery item runtime has no exact canonical consumer");
});

test("Phase 11.3 preserves verified UIkit masonry and responsive width semantics", () => {
  const mapped = mapYoothemeStaticContent({
    ...fixture,
    children: [{ ...fixture.children[0], children: [{ ...fixture.children[0].children[0], children: [{ ...fixture.children[0].children[0].children[0], children: [{
      type: "gallery", props: { grid_default: "1", grid_medium: "3", grid_masonry: "pack" }, children: fixture.children[0].children[0].children[0].children,
    }] }] }] }],
  });
  const gallery = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;
  expect(gallery).toMatchObject({ columnsPhonePortrait: "1", columnsTabletLandscape: "3", masonry: "pack" });
});

test("Phase 11.3 keeps an explicit Gallery overlay-link false without manufacturing a media trigger", () => {
  const mapped = mapYoothemeStaticContent({
    ...fixture,
    children: [{ ...fixture.children[0], children: [{ ...fixture.children[0].children[0], children: [{ ...fixture.children[0].children[0].children[0], children: [{
      type: "gallery", props: { lightbox: false, overlay_link: false, link_text: "Read more" }, children: fixture.children[0].children[0].children[0].children,
    }] }] }] }],
  });
  const gallery = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;
  expect(gallery).toMatchObject({ kind: "gallery", enableLightbox: false, overlayLink: false });
  expect(mapped.warnings.join("\n")).not.toContain("overlay_link");
});
