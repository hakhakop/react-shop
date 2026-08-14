import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { dynamicGridRenderItemId, materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

const descriptor = { provider: "wordpress", source: "post", mode: "collection" as const, query: { quantity: 3 } };

const layout = (): BuilderLayout => ({
  version: 1,
  key: "repeatable-proof",
  page: "repeatable-proof",
  updatedAt: "2026-08-14T00:00:00.000Z",
  sections: [{
    id: "section", kind: "content", title: "Proof", background: "#fff", visible: true,
    rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [
      { id: "list", kind: "list", listItems: [{ id: "list-template", text: "Fallback item", iconName: "check", dynamicContext: descriptor, dynamicBindings: { text: { path: "title", valueType: "string" }, url: { path: "link", valueType: "url" } } }] },
      { id: "button", kind: "button", buttons: [{ id: "button-template", label: "Fallback action", url: "/fallback", style: "primary", dynamicContext: descriptor, dynamicBindings: { label: { path: "title", valueType: "string" }, url: { path: "link", valueType: "url" } } }] },
    ] }] }],
  }],
});

const contexts = [1, 2, 3].map((id) => ({
  id: `post-${id}`,
  fields: {
    title: { type: "string" as const, value: `Post ${id}` },
    link: { type: "url" as const, value: `https://example.test/post-${id}` },
  },
}));

test("List and canonical multi-button templates expand independently", async () => {
  const authored = layout();
  const snapshot = JSON.stringify(authored);
  const result = await materializeBuilderDynamicContent(authored, { resolveContexts: async () => contexts });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];
  const listItems = elements[0].listItems ?? [];
  const buttons = elements[1].buttons ?? [];

  expect(listItems.map((item) => item.text)).toEqual(["Post 1", "Post 2", "Post 3"]);
  expect(listItems.map((item) => item.url)).toEqual(contexts.map((context) => context.fields.link.value));
  expect(listItems.every((item) => item.iconName === "check")).toBe(true);
  expect(buttons.map((item) => item.label)).toEqual(["Post 1", "Post 2", "Post 3"]);
  expect(buttons.map((item) => item.url)).toEqual(contexts.map((context) => context.fields.link.value));
  expect(buttons.every((item) => item.style === "primary")).toBe(true);
  expect(listItems.map((item) => item.id)).toEqual(contexts.map((context) => dynamicGridRenderItemId("list-template", context.id)));
  expect(buttons.map((item) => item.id)).toEqual(contexts.map((context) => dynamicGridRenderItemId("button-template", context.id)));
  expect(JSON.stringify(authored)).toBe(snapshot);
});

test("repeatable provider failure preserves one authored fallback item", async () => {
  const authored = layout();
  const result = await materializeBuilderDynamicContent(authored, { resolveContexts: async () => { throw new Error("provider unavailable"); } });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];
  expect(elements[0].listItems).toHaveLength(1);
  expect(elements[0].listItems?.[0].text).toBe("Fallback item");
  expect(elements[1].buttons).toHaveLength(1);
  expect(elements[1].buttons?.[0].label).toBe("Fallback action");
});

test("Slideshow and Overlay Slider reuse the same transient slide expansion", async () => {
  const authored: BuilderLayout = {
    version: 1,
    key: "carousel-repeatable-proof",
    page: "carousel-repeatable-proof",
    updatedAt: "2026-08-14T00:00:00.000Z",
    sections: [{
      id: "section", kind: "content", title: "Proof", background: "#fff", visible: true,
      rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [
        { id: "slideshow", kind: "slideshow", slides: [{ id: "slide-template", title: "Fallback", text: "Fallback text", imageUrl: "/fallback.jpg", buttonUrl: "/fallback", dynamicContext: descriptor, dynamicBindings: { title: { path: "title", valueType: "string" }, text: { path: "excerpt", valueType: "richText" }, imageUrl: { path: "image", valueType: "url" }, buttonUrl: { path: "link", valueType: "url" } } }] },
        { id: "overlay", kind: "overlaySlider", slides: [{ id: "overlay-template", title: "Fallback overlay", imageUrl: "/fallback-overlay.jpg", buttonUrl: "/fallback", dynamicContext: descriptor, dynamicBindings: { title: { path: "title", valueType: "string" }, imageUrl: { path: "image", valueType: "url" }, buttonUrl: { path: "link", valueType: "url" } } }] },
      ] }] }],
    }],
  };
  const carouselContexts = contexts.map((context, index) => ({
    ...context,
    fields: {
      ...context.fields,
      excerpt: { type: "richText" as const, value: `Excerpt ${index + 1}` },
      image: { type: "url" as const, value: `https://example.test/image-${index + 1}.jpg` },
    },
  }));
  const result = await materializeBuilderDynamicContent(authored, { resolveContexts: async () => carouselContexts });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];
  expect(elements[0].slides?.map((slide) => slide.title)).toEqual(["Post 1", "Post 2", "Post 3"]);
  expect(elements[0].slides?.map((slide) => slide.text)).toEqual(["Excerpt 1", "Excerpt 2", "Excerpt 3"]);
  expect(elements[1].slides?.map((slide) => slide.imageUrl)).toEqual([
    "https://example.test/image-1.jpg", "https://example.test/image-2.jpg", "https://example.test/image-3.jpg",
  ]);
  expect(elements[0].slides?.every((slide) => slide.id?.includes("--dynamic-"))).toBe(true);
  expect(elements[1].slides?.every((slide) => slide.id?.includes("--dynamic-"))).toBe(true);
  expect(authored.sections[0].rows?.[0].columns[0].elements[0].slides).toHaveLength(1);
  expect(authored.sections[0].rows?.[0].columns[0].elements[1].slides).toHaveLength(1);
});
