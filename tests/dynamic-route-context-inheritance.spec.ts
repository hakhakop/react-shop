import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import type { DynamicContentContextDescriptor, DynamicItemContext } from "@/lib/dynamicContent";
import {
  compileWooCommerceProductRequest,
  composeWooCommerceProductDescriptorWithInheritedContext,
} from "@/lib/woocommerceDynamicContentProvider.server";

const categoryContext = (id: number, slug: string): DynamicItemContext => ({
  id,
  fields: {
    kind: { type: "string", value: "product-category" },
    taxonomy: { type: "string", value: "product_cat" },
    termId: { type: "identifier", value: id },
    termSlug: { type: "string", value: slug },
    termPath: { type: "metadata", value: { items: ["women", slug] } },
  },
});

const productContext = (id: number, title: string): DynamicItemContext => ({
  id,
  fields: {
    title: { type: "string", value: title },
    link: { type: "url", value: `/product/${title.toLowerCase().replaceAll(" ", "-")}` },
  },
});

const collectionDescriptor = (query: Record<string, never | string | number | boolean | number[]> = {}): DynamicContentContextDescriptor => ({
  provider: "woocommerce",
  source: "product",
  mode: "collection",
  query,
});

test("Product Category context composes with, rather than replaces, authored Product filters", () => {
  const authored = collectionDescriptor({ quantity: 4, order: "title", direction: "asc", featured: true });
  const composed = composeWooCommerceProductDescriptorWithInheritedContext(authored, categoryContext(24, "clothing"));
  expect(composed).toEqual({
    ...authored,
    query: { ...authored.query, routeCategory: 24 },
  });
  expect(authored.query).not.toHaveProperty("routeCategory");

  const compiled = compileWooCommerceProductRequest(composed);
  const url = new URL(compiled.path, "https://example.invalid");
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    category: "24",
    per_page: "4",
    orderby: "title",
    order: "asc",
    featured: "true",
  });
});

test("an authored category filter refines the inherited route category with AND semantics", () => {
  const compiled = compileWooCommerceProductRequest(
    composeWooCommerceProductDescriptorWithInheritedContext(
      collectionDescriptor({ start: 2, quantity: 3, categories: [31] }),
      categoryContext(24, "clothing"),
    ),
  );
  const url = new URL(compiled.path, "https://example.invalid");
  expect(url.searchParams.get("category")).toBe("24");
  expect(url.searchParams.get("offset")).toBe("0");
  expect(url.searchParams.get("per_page")).toBe("100");
  expect(compiled).toMatchObject({
    postFilterCategoryIds: [31],
    postFilterStart: 2,
    postFilterQuantity: 3,
  });
});

test("Grid, Products, and Slider reuse one inherited category constraint without rewriting authored layout", async () => {
  const descriptor = collectionDescriptor({ quantity: 2, order: "title" });
  const authored = {
    version: 1,
    key: "dynamic-route-context-proof",
    page: "product-category",
    updatedAt: "2026-08-30T00:00:00.000Z",
    sections: [{
      id: "section",
      kind: "contentLayout",
      title: "Collections",
      background: "transparent",
      visible: true,
      rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [
        {
          id: "dynamic-grid",
          kind: "grid",
          gridSource: "static",
          gridItems: [{
            id: "product-template",
            title: "Fallback",
            dynamicContext: descriptor,
            dynamicBindings: { title: { path: "title", valueType: "string" } },
          }],
        },
        { id: "products", kind: "products", dynamicContext: collectionDescriptor({ quantity: 3 }) },
        {
          id: "slider",
          kind: "slider",
          slides: [{
            id: "slide-template",
            title: "Fallback slide",
            dynamicContext: collectionDescriptor({ quantity: 1 }),
            dynamicBindings: { title: { path: "title", valueType: "string" } },
          }],
        },
        {
          id: "static-grid",
          kind: "grid",
          gridSource: "static",
          gridItems: [{ id: "static-item", title: "Static item" }],
        },
      ] }] }],
    }],
  } as unknown as BuilderLayout;
  const snapshot = JSON.stringify(authored);
  const descriptors: DynamicContentContextDescriptor[] = [];
  const resolveContexts = async ({ descriptor: resolved }: { descriptor: DynamicContentContextDescriptor }) => {
    descriptors.push(resolved);
    const category = Number(resolved.query?.routeCategory);
    return category === 24
      ? [productContext(1, "Clothing One"), productContext(2, "Clothing Two")]
      : [productContext(3, "Accessories One")];
  };

  const clothing = await materializeBuilderDynamicContent(authored, {
    rootContext: categoryContext(24, "clothing"),
    resolveContexts,
  });
  const accessories = await materializeBuilderDynamicContent(authored, {
    rootContext: categoryContext(25, "accessories"),
    resolveContexts,
  });
  const clothingBlocks = clothing.renderLayout.sections[0]!.rows![0]!.columns[0]!.elements;
  const accessoriesBlocks = accessories.renderLayout.sections[0]!.rows![0]!.columns[0]!.elements;

  expect(clothingBlocks[0]!.gridItems?.map((item) => item.title)).toEqual(["Clothing One", "Clothing Two"]);
  expect(accessoriesBlocks[0]!.gridItems?.map((item) => item.title)).toEqual(["Accessories One"]);
  expect((clothingBlocks[1] as { dynamicProductContexts?: DynamicItemContext[] }).dynamicProductContexts).toHaveLength(2);
  expect(clothingBlocks[2]!.slides?.map((slide) => slide.title)).toEqual(["Clothing One", "Clothing Two"]);
  expect(clothingBlocks[3]!.gridItems?.map((item) => item.title)).toEqual(["Static item"]);
  expect(descriptors.filter((item) => item.provider === "woocommerce").every((item) => [24, 25].includes(Number(item.query?.routeCategory)))).toBe(true);
  expect(descriptors.some((item) => item.query?.routeCategory === 24 && item.query?.quantity === 2 && item.query?.order === "title")).toBe(true);
  expect(JSON.stringify(authored)).toBe(snapshot);
});

test("Shop, ordinary Page, and singular contexts do not become category-scoped", () => {
  const descriptor = collectionDescriptor({ quantity: 6 });
  const contexts: DynamicItemContext[] = [
    { fields: { kind: { type: "string", value: "shop" } } },
    { fields: { kind: { type: "string", value: "page" } } },
    { fields: { kind: { type: "string", value: "product" }, taxonomy: { type: "string", value: "product_cat" }, termId: { type: "identifier", value: 24 } } },
  ];
  for (const context of contexts) {
    expect(composeWooCommerceProductDescriptorWithInheritedContext(descriptor, context)).toBe(descriptor);
  }
  expect(composeWooCommerceProductDescriptorWithInheritedContext(descriptor, undefined)).toBe(descriptor);
});
