import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

const homeFixture = JSON.parse(
  readFileSync("/Users/hakobjaghatspanyan/Downloads/Home.json", "utf8"),
);

const collectBlocks = (value: unknown, result: any[] = []) => {
  if (!value || typeof value !== "object") return result;
  if ((value as { kind?: unknown }).kind) result.push(value);
  for (const child of Object.values(value as Record<string, unknown>)) {
    if (Array.isArray(child)) child.forEach((entry) => collectBlocks(entry, result));
    else collectBlocks(child, result);
  }
  return result;
};

test("imports a real YOOtheme Custom Posts Grid item into the canonical contract", () => {
  const mapped = mapYoothemeStaticContent(homeFixture);
  const dynamicGrid = collectBlocks(mapped.sections).find((block) =>
    block.kind === "grid" && block.gridItems?.some((item: any) => item.dynamicContext),
  );
  expect(dynamicGrid).toBeTruthy();
  const item = dynamicGrid.gridItems.find((candidate: any) => candidate.dynamicContext);
  expect(item).toMatchObject({
    dynamicContext: {
      provider: "wordpress",
      source: "post",
      mode: "collection",
      query: {
        start: 0,
        quantity: 3,
        order: "date",
        direction: "desc",
      },
    },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
  expect(item.dynamicBindings.imageUrl).toBeUndefined();
  expect(mapped.warnings.some((warning) => warning.includes("raw term IDs do not carry taxonomy identity"))).toBeTruthy();
});

test("preserves authored static fallbacks beside supported bindings", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid",
      children: [{
        type: "grid_item",
        props: { title: "Static title", link_text: "Read More", content: "Fallback" },
        source: {
          query: { name: "posts.customPosts", arguments: { offset: 2, limit: 4, order: "title", order_direction: "ASC" } },
          props: { title: { name: "title" }, link: { name: "link" }, content: { name: "excerpt" } },
        },
      }],
    }] }] }] }],
  });
  const item = collectBlocks(mapped.sections).find((block) => block.kind === "grid").gridItems[0];
  expect(item).toMatchObject({
    title: "Static title",
    buttonLabel: "Read More",
    text: "Fallback",
    dynamicContext: { query: { start: 2, quantity: 4, order: "title", direction: "asc" } },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      text: { path: "excerpt", valueType: "richText" },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
});

test("unsupported dynamic source retains static fallback and creates no inert metadata", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid",
      children: [{
        type: "grid_item",
        props: { title: "Fallback", content: "Static" },
        source: { query: { name: "products.customProducts", arguments: { offset: 0, limit: 3 } }, props: { title: { name: "title" } } },
      }],
    }] }] }] }],
  });
  const item = collectBlocks(mapped.sections).find((block) => block.kind === "grid").gridItems[0];
  expect(item).toMatchObject({ title: "Fallback", text: "Static" });
  expect(item.dynamicContext).toBeUndefined();
  expect(item.dynamicBindings).toBeUndefined();
  expect(mapped.warnings.some((warning) => warning.includes("DYNAMIC CONTENT UNSUPPORTED FOR NOW"))).toBeTruthy();
});

test("uses the same canonical metadata helper for a Panel Slider template", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      children: [{
        type: "panel-slider_item",
        props: { title: "Fallback slide", link_text: "Read More" },
        source: {
          query: { name: "posts.customPosts", arguments: { offset: 0, limit: 3 } },
          props: { title: { name: "title" }, content: { name: "excerpt" }, link: { name: "link" } },
        },
      }],
    }] }] }] }],
  });
  const slider = collectBlocks(mapped.sections).find((block) => block.kind === "panelSlider");
  expect(slider.slides).toHaveLength(1);
  expect(slider.slides[0]).toMatchObject({
    title: "Fallback slide",
    buttonLabel: "Read More",
    dynamicContext: { provider: "wordpress", source: "post", mode: "collection" },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      text: { path: "excerpt", valueType: "richText" },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
});

test("the imported Grid template uses the existing transient materializer", async () => {
  const mapped = mapYoothemeStaticContent(homeFixture);
  const authoredLayout = {
    version: 1,
    key: "page:imported-grid-proof",
    page: "page:imported-grid-proof",
    updatedAt: "2026-08-14T00:00:00.000Z",
    sections: mapped.sections,
  } as any;
  const result = await materializeBuilderDynamicContent(authoredLayout, {
    resolveContexts: async () => [
      { id: "post-1", fields: { title: { type: "string", value: "Resolved Post" }, link: { type: "url", value: "/post-1" } } },
    ],
  });
  const dynamicGrid = collectBlocks(result.renderLayout.sections).find((block) => block.kind === "grid" && block.gridItems?.some((item: any) => item.id.includes("dynamic")));
  expect(dynamicGrid.gridItems).toHaveLength(1);
  expect(dynamicGrid.gridItems[0]).toMatchObject({ title: "Resolved Post", buttonUrl: "/post-1" });
  expect(dynamicGrid.gridItems[0].dynamicContext).toBeUndefined();
});
