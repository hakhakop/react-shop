import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { dynamicStructureRenderId, materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { dynamicBindingDestinationCapability } from "@/lib/dynamicContentCapabilities";

const descriptor = { provider: "wordpress", source: "post", mode: "collection" as const };

const proofLayout = (): BuilderLayout => ({
  version: 1,
  key: "simple-elements-proof",
  page: "simple-elements-proof",
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
          { id: "text", kind: "text", body: "Static text", dynamicContext: descriptor, dynamicBindings: { body: { path: "excerpt", valueType: "richText" } } },
          { id: "button", kind: "button", buttonLabel: "Static button", buttonUrl: "/fallback", dynamicContext: descriptor, dynamicBindings: { buttonLabel: { path: "title", valueType: "string" }, buttonUrl: { path: "link", valueType: "url" } } },
          { id: "panel", kind: "panel", title: "Static panel", body: "Static body", imageUrl: "/fallback.jpg", imageAlt: "Static alt", buttonLabel: "Read", buttonUrl: "/fallback", dynamicContext: descriptor, dynamicBindings: { title: { path: "title", valueType: "string" }, body: { path: "excerpt", valueType: "richText" }, imageUrl: { path: "featuredImage.url", valueType: "url" }, imageAlt: { path: "featuredImage.alt", valueType: "string" }, buttonUrl: { path: "link", valueType: "url" } } },
          { id: "alert", kind: "alert", title: "Static alert", body: "Static message", alertLinkUrl: "/fallback", dynamicContext: descriptor, dynamicBindings: { title: { path: "title", valueType: "string" }, body: { path: "excerpt", valueType: "richText" }, alertLinkUrl: { path: "link", valueType: "url" } } },
          { id: "list", kind: "list", title: "Static list", listItems: [{ id: "one", text: "Static item" }], dynamicContext: descriptor, dynamicBindings: { title: { path: "title", valueType: "string" } } },
        ],
      }],
    }],
  }],
});

test("simple source-capable elements resolve one context and list remains static", async () => {
  const authored = proofLayout();
  const snapshot = JSON.stringify(authored);
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async () => [{
      id: "post",
      fields: {
        title: { type: "string", value: "Dynamic title" },
        excerpt: { type: "richText", value: "<p>Dynamic excerpt</p>" },
        link: { type: "url", value: "https://example.test/post" },
        "featuredImage.url": { type: "url", value: "https://example.test/image.jpg" },
        "featuredImage.alt": { type: "string", value: "Dynamic alt" },
      },
    }],
  });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];

  expect(elements[0]).toMatchObject({ kind: "text", body: "<p>Dynamic excerpt</p>" });
  expect(elements[1]).toMatchObject({ kind: "button", buttonLabel: "Dynamic title", buttonUrl: "https://example.test/post" });
  expect(elements[2]).toMatchObject({ kind: "panel", title: "Dynamic title", body: "<p>Dynamic excerpt</p>", imageUrl: "https://example.test/image.jpg", imageAlt: "Dynamic alt", buttonLabel: "Read", buttonUrl: "https://example.test/post" });
  expect(elements[3]).toMatchObject({ kind: "alert", title: "Dynamic title", body: "<p>Dynamic excerpt</p>", alertLinkUrl: "https://example.test/post" });
  expect(elements[4]).toBe(authored.sections[0].rows?.[0].columns[0].elements[4]);
  expect(JSON.stringify(authored)).toBe(snapshot);
});

test("destination type compatibility remains narrow", () => {
  expect(dynamicBindingDestinationCapability("body")?.acceptedTypes).toEqual(["string", "richText"]);
  expect(dynamicBindingDestinationCapability("buttonUrl")?.acceptedTypes).toEqual(["url"]);
  expect(dynamicBindingDestinationCapability("imageUrl")?.acceptedTypes).toEqual(["url"]);
  expect(dynamicBindingDestinationCapability("alertLinkUrl")?.acceptedTypes).toEqual(["url"]);
});

test("13K1 inherits the nearest structural item context while an explicit child source overrides it", async () => {
  const parentContext = { provider: "wordpress", source: "post", mode: "collection" as const };
  const childContext = { provider: "wordpress", source: "page", mode: "single" as const };
  const authored: BuilderLayout = {
    version: 1,
    key: "parent-context-proof",
    page: "parent-context-proof",
    updatedAt: "2026-08-14T00:00:00.000Z",
    sections: [{
      id: "section",
      kind: "content",
      title: "Proof",
      background: "#fff",
      visible: true,
      dynamicContext: parentContext,
      rows: [{
        id: "row",
        layout: "1-col",
        columns: [{
          id: "column",
          elements: [
            { id: "inherited", kind: "heading", headingText: "Fallback", dynamicBindings: { headingText: { path: "title", valueType: "string" } } },
            { id: "override", kind: "heading", headingText: "Fallback", dynamicContext: childContext, dynamicBindings: { headingText: { path: "title", valueType: "string" } } },
          ],
        }],
      }],
    }],
  };
  const snapshot = JSON.stringify(authored);
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async ({ descriptor }) => [{
      id: descriptor.source,
      fields: { title: { type: "string", value: descriptor.source === "page" ? "Explicit child" : "Inherited parent" } },
    }],
  });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];

  expect(elements[0]).toMatchObject({ headingText: "Inherited parent" });
  expect(elements[1]).toMatchObject({ headingText: "Explicit child" });
  expect(JSON.stringify(authored)).toBe(snapshot);
});

test("13K2 transiently multiplies canonical Section, Row, and Column templates with deterministic IDs", async () => {
  const collection = { provider: "wordpress", source: "post", mode: "collection" as const };
  const heading = (id: string) => ({ id, kind: "heading" as const, headingText: "Fallback", dynamicBindings: { headingText: { path: "title", valueType: "string" as const } } });
  const authored = {
    version: 1,
    key: "home",
    page: "home",
    updatedAt: "2026-08-14T00:00:00.000Z",
    sections: [
      { id: "section-template", kind: "content" as const, title: "Section", background: "#fff", visible: true, dynamicContext: collection, rows: [{ id: "section-row", layout: "1-col", columns: [{ id: "section-column", elements: [heading("section-heading")] }] }] },
      { id: "row-section", kind: "content" as const, title: "Row", background: "#fff", visible: true, rows: [{ id: "row-template", layout: "1-col", dynamicContext: collection, columns: [{ id: "row-column", elements: [heading("row-heading")] }] }] },
      { id: "column-section", kind: "content" as const, title: "Column", background: "#fff", visible: true, rows: [{ id: "column-row", layout: "1-col", columns: [{ id: "column-template", dynamicContext: collection, elements: [heading("column-heading")] }] }] },
    ],
  } as BuilderLayout;
  const snapshot = JSON.stringify(authored);
  const contexts = [
    { id: "post-a", fields: { title: { type: "string" as const, value: "Post A" } } },
    { id: "post-b", fields: { title: { type: "string" as const, value: "Post B" } } },
  ];
  const result = await materializeBuilderDynamicContent(authored, { resolveContexts: async () => contexts });

  expect(result.renderLayout.sections.map((section) => section.id)).toEqual([
    dynamicStructureRenderId("section-template", "post-a"),
    dynamicStructureRenderId("section-template", "post-b"),
    "row-section",
    "column-section",
  ]);
  expect(result.renderLayout.sections[2].rows?.map((row) => row.id)).toEqual([
    dynamicStructureRenderId("row-template", "post-a"),
    dynamicStructureRenderId("row-template", "post-b"),
  ]);
  expect(result.renderLayout.sections[3].rows?.[0].columns.map((column) => column.id)).toEqual([
    dynamicStructureRenderId("column-template", "post-a"),
    dynamicStructureRenderId("column-template", "post-b"),
  ]);
  expect(result.renderLayout.sections.flatMap((section) => section.rows ?? []).flatMap((row) => row.columns).flatMap((column) => column.elements).map((element) => element.headingText)).toEqual([
    "Post A", "Post B", "Post A", "Post B", "Post A", "Post B",
  ]);
  expect(JSON.stringify(authored)).toBe(snapshot);
});
