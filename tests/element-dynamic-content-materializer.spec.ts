import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import type { DynamicItemContext } from "@/lib/dynamicContent";

const descriptor = {
  provider: "wordpress",
  source: "post",
  mode: "collection" as const,
  query: { quantity: 3 },
};

const layout = (): BuilderLayout => ({
  version: 1,
  key: "element-dynamic-proof",
  page: "element-dynamic-proof",
  updatedAt: "2026-08-14T00:00:00.000Z",
  sections: [{
    id: "section",
    kind: "content",
    title: "Proof",
    background: "#fff",
    visible: true,
    rows: [{
      id: "row",
      layout: "1-col",
      columns: [{
        id: "column",
        elements: [
          {
            id: "heading",
            kind: "heading",
            headingText: "Static heading",
            title: "Static heading",
            dynamicContext: descriptor,
            dynamicBindings: { headingText: { path: "title", valueType: "string" } },
          },
          {
            id: "image",
            kind: "image",
            imageUrl: "/fallback.jpg",
            imageAlt: "Static alt",
            dynamicContext: descriptor,
            dynamicBindings: {
              imageUrl: { path: "featuredImage.url", valueType: "url" },
              imageAlt: { path: "featuredImage.alt", valueType: "string" },
            },
          },
        ],
      }],
    }],
  }],
});

const contexts: DynamicItemContext[] = [{
  id: "post-1",
  fields: {
    title: { type: "string", value: "Resolved post title" },
    "featuredImage.url": { type: "url", value: "https://cms.example/image.jpg" },
    "featuredImage.alt": { type: "string", value: "Resolved alt" },
  },
}, {
  id: "post-2",
  fields: { title: { type: "string", value: "Ignored second post" } },
}];

test("Heading and Image resolve one context without structural multiplication", async () => {
  const authored = layout();
  const snapshot = JSON.stringify(authored);
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async () => contexts,
  });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];

  expect(elements).toHaveLength(2);
  expect(elements[0]).toMatchObject({ id: "heading", headingText: "Resolved post title", title: "Static heading" });
  expect(elements[1]).toMatchObject({
    id: "image",
    imageUrl: "https://cms.example/image.jpg",
    imageAlt: "Resolved alt",
  });
  expect(elements.every((block) => !block.dynamicContext && !block.dynamicBindings)).toBe(true);
  expect(JSON.stringify(authored)).toBe(snapshot);
});

test("missing values and provider failure preserve authored element fallbacks", async () => {
  const authored = layout();
  const missing = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async () => [{ id: "post", fields: {} }],
  });
  const missingElements = missing.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];
  expect(missingElements[0].headingText).toBe("Static heading");
  expect(missingElements[1].imageUrl).toBe("/fallback.jpg");
  expect(missingElements[1].imageAlt).toBe("Static alt");

  const failed = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async () => { throw new Error("provider unavailable"); },
  });
  expect(failed.renderLayout).toBe(authored);
  expect(failed.diagnostics).toEqual([
    expect.objectContaining({ status: "fallback", blockKey: "heading", message: "provider unavailable" }),
    expect.objectContaining({ status: "fallback", blockKey: "image", message: "provider unavailable" }),
  ]);
});
