import { expect, test } from "@playwright/test";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import {
  compileWooCommerceProductRequest,
  normalizeWooCommerceProductContext,
} from "@/lib/woocommerceDynamicContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

const websiteWithWooCommerce = () => ({
  cmsConnection: {
    provider: "wordpress",
    siteUrl: "https://tenant.example",
    wooCommerceApiUrl: "https://tenant.example/wp-json/wc/v3",
    wooCommerceConsumerKey: "consumer-key",
    wooCommerceConsumerSecret: "consumer-secret",
  },
}) as unknown as SaaSWebsite;

const product = {
  id: 41,
  name: "Denim Overall",
  slug: "denim-overall",
  permalink: "https://tenant.example/product/denim-overall/",
  type: "simple",
  status: "publish",
  description: "<p>Long description</p>",
  short_description: "<p>Short description</p>",
  sku: "D-41",
  price: "49.50",
  regular_price: "59.50",
  sale_price: "49.50",
  stock_status: "instock",
  stock_quantity: 7,
  featured: true,
  on_sale: true,
  images: [
    { id: 9, src: "https://tenant.example/denim.jpg", alt: "Blue denim overall", secret: "drop" },
    { id: 10, src: "https://tenant.example/denim-back.jpg", alt: "Back" },
  ],
  categories: [{ id: 3, name: "Clothing", slug: "clothing" }],
  tags: [{ id: 5, name: "Denim", slug: "denim" }],
  attributes: [{ id: 2, name: "Size", slug: "pa_size", visible: true, variation: true, options: ["S", "M"] }],
  rawProviderObject: "must-not-escape",
};

test("compiles only the approved WooCommerce Product query vocabulary", () => {
  const compiled = compileWooCommerceProductRequest({
    provider: "woocommerce",
    source: "product",
    mode: "collection",
    query: {
      start: 2,
      quantity: 4,
      order: "price",
      direction: "asc",
      search: "denim",
      categories: [3],
      tags: [5],
      featured: true,
      onSale: true,
      stockStatus: "instock",
      include: [41, "42"],
      exclude: [99],
    },
  });
  const url = new URL(compiled.path, "https://example.invalid/");
  expect(compiled.mode).toBe("collection");
  expect(Object.fromEntries(url.searchParams)).toEqual({
    offset: "2",
    per_page: "4",
    order: "asc",
    orderby: "price",
    search: "denim",
    category: "3",
    tag: "5",
    featured: "true",
    on_sale: "true",
    stock_status: "instock",
    include: "41,42",
    exclude: "99",
  });
  expect(() => compileWooCommerceProductRequest({
    provider: "woocommerce",
    source: "product",
    mode: "collection",
    query: { rawRestQuery: "status=any" },
  })).toThrow(/Unsupported WooCommerce Product collection query field: rawRestQuery/);
});

test("compiles safe single Product lookups by numeric ID or slug", () => {
  expect(compileWooCommerceProductRequest({
    provider: "woocommerce", source: "product", mode: "single", query: { id: 41 },
  })).toEqual({ mode: "single", path: "products/41" });
  expect(compileWooCommerceProductRequest({
    provider: "woocommerce", source: "product", mode: "single", query: { slug: "denim-overall" },
  })).toEqual({ mode: "single", path: "products?slug=denim-overall&per_page=1" });
});

test("normalizes Product records without leaking raw REST objects or inventing variable amounts", () => {
  const context = normalizeWooCommerceProductContext(product);
  expect(context).toMatchObject({
    id: 41,
    fields: {
      id: { type: "identifier", value: 41 },
      databaseId: { type: "identifier", value: 41 },
      title: { type: "string", value: "Denim Overall" },
      link: { type: "url", value: "/product/denim-overall" },
      "storefront.href": { type: "url", value: "/product/denim-overall" },
      "origin.permalink": { type: "url", value: "https://tenant.example/product/denim-overall/" },
      image: { type: "media", value: { id: 9, url: "https://tenant.example/denim.jpg", alt: "Blue denim overall" } },
      "image.url": { type: "url", value: "https://tenant.example/denim.jpg" },
      "price.amount": { type: "number", value: 49.5 },
      "categories.label": { type: "string", value: "Clothing" },
    },
  });
  expect(JSON.stringify(context)).not.toContain("rawProviderObject");
  expect(JSON.stringify(context)).not.toContain("secret");

  const variable = normalizeWooCommerceProductContext({
    ...product,
    type: "variable",
    price: "49.50",
    price_html: "<span>$49.50–$89.50</span>",
    regular_price: "59.50",
    sale_price: "49.50",
  });
  expect(variable.fields.price).toEqual({ type: "string", value: "$49.50–$89.50" });
  expect(variable.fields["price.amount"]).toBeUndefined();
  expect(variable.fields["regularPrice.amount"]).toBeUndefined();
  expect(variable.fields["salePrice.amount"]).toBeUndefined();
});

test("resolves collection and single Products through provider/source dispatch", async () => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input, init) => {
    requested.push(String(input));
    expect(new Headers(init?.headers).get("Authorization")).toMatch(/^Basic /);
    return Response.json(String(input).includes("slug=") ? [product] : [product]);
  };
  try {
    const collection = await resolveDynamicContentContexts({
      website: websiteWithWooCommerce(),
      descriptor: { provider: "woocommerce", source: "product", mode: "collection", query: { quantity: 1 } },
    });
    const single = await resolveDynamicContentContexts({
      website: websiteWithWooCommerce(),
      descriptor: { provider: "woocommerce", source: "product", mode: "single", query: { slug: "denim-overall" } },
    });
    expect(collection[0].fields.title).toEqual({ type: "string", value: "Denim Overall" });
    expect(single).toHaveLength(1);
    expect(requested).toEqual([
      "https://tenant.example/wp-json/wc/v3/products?offset=0&per_page=1&order=desc&orderby=date",
      "https://tenant.example/wp-json/wc/v3/products?slug=denim-overall&per_page=1",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("projects imported YOOtheme commerce namespaces to the registered WooCommerce adapters", async () => {
  const originalFetch = globalThis.fetch;
  const requested: string[] = [];
  globalThis.fetch = async (input) => {
    const url = String(input);
    requested.push(url);
    if (url.includes("products/categories?include=")) return Response.json([{ id: 3 }]);
    if (url.includes("products/tags?include=")) return Response.json([]);
    if (url.includes("/products?")) return Response.json([product]);
    if (url.endsWith("products/categories/3")) return Response.json({
      id: 3,
      name: "Clothing",
      slug: "clothing",
      description: "Seasonal clothing",
    });
    throw new Error(`Unexpected WooCommerce request: ${url}`);
  };
  try {
    const products = await resolveDynamicContentContexts({
      website: websiteWithWooCommerce(),
      descriptor: {
        provider: "wordpress",
        source: "content",
        mode: "collection",
        query: {
          sourceName: "product",
          graphqlRoot: "products",
          quantity: 1,
          sourceQuery: { arguments: { terms: [3], order: "date", order_direction: "DESC" } },
        },
      },
    });
    const category = await resolveDynamicContentContexts({
      website: websiteWithWooCommerce(),
      descriptor: {
        provider: "wordpress",
        source: "content",
        mode: "single",
        query: { sourceName: "product_cat", graphqlRoot: "productCats", databaseId: 3 },
      },
    });
    expect(products[0].fields.title).toEqual({ type: "string", value: "Denim Overall" });
    expect(category[0].fields).toMatchObject({
      name: { type: "string", value: "Clothing" },
      link: { type: "url", value: "/product-category/clothing" },
      taxonomy: { type: "string", value: "product_cat" },
    });
    expect(requested.find((url) => url.includes("/products?"))).toContain("category=3");
    expect(requested.some((url) => url.includes("graphql"))).toBe(false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Product uses the canonical materializer and leaves authored layout untouched", async () => {
  const authored = {
    version: 1,
    key: "product-provider-proof",
    page: "product-provider-proof",
    updatedAt: "2026-08-15T00:00:00.000Z",
    sections: [{
      id: "section",
      kind: "content",
      title: "Product",
      background: "#fff",
      visible: true,
      rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [{
        id: "heading",
        kind: "heading",
        headingText: "Fallback",
        title: "Fallback",
        dynamicContext: { provider: "woocommerce", source: "product", mode: "single", query: { id: 41 } },
        dynamicBindings: { headingText: { path: "title", valueType: "string" } },
      }] }] }],
    }],
  } as BuilderLayout;
  const snapshot = JSON.stringify(authored);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(product);
  try {
    const result = await materializeBuilderDynamicContent(authored, { website: websiteWithWooCommerce() });
    expect(result.renderLayout.sections[0].rows?.[0].columns[0].elements[0].headingText).toBe("Denim Overall");
    expect(JSON.stringify(authored)).toBe(snapshot);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Products element receives a transient canonical collection projection", async () => {
  const authored = {
    version: 1,
    key: "products-element-proof",
    page: "products-element-proof",
    updatedAt: "2026-08-15T00:00:00.000Z",
    sections: [{
      id: "section",
      kind: "content",
      rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [{
        id: "products",
        kind: "products",
        dynamicContext: { provider: "woocommerce", source: "product", mode: "collection", query: { quantity: 1 } },
      }] }] }],
    }],
  } as BuilderLayout;
  const snapshot = JSON.stringify(authored);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json([product]);
  try {
    const result = await materializeBuilderDynamicContent(authored, { website: websiteWithWooCommerce() });
    const projected = result.renderLayout.sections[0].rows?.[0].columns[0].elements[0] as any;
    expect(projected.dynamicProductContexts).toHaveLength(1);
    expect((projected.dynamicProductContexts?.[0] as any).fields.title.value).toBe("Denim Overall");
    expect(JSON.stringify(authored)).toBe(snapshot);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
