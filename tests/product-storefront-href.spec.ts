import { expect, test } from "@playwright/test";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import type { BuilderLayout } from "@/lib/builderLayouts";
import { getStorefrontContentHref } from "@/lib/storefrontContentHref";
import { normalizeWooCommerceProductContext } from "@/lib/woocommerceDynamicContentProvider.server";

test("canonical Product href is relative, encoded, and does not infer other content routes", () => {
  expect(getStorefrontContentHref({ contentType: "product", slug: "pink-jumper" }))
    .toBe("/product/pink-jumper");
  expect(getStorefrontContentHref({ contentType: "product", slug: "pink jumper" }))
    .toBe("/product/pink%20jumper");
  expect(getStorefrontContentHref({ contentType: "post", slug: "pink-jumper" })).toBe("/pink-jumper");
  expect(getStorefrontContentHref({ contentType: "product", slug: "" })).toBeNull();
});

test("Product provider separates origin permalink from storefront navigation", () => {
  const context = normalizeWooCommerceProductContext({
    id: 42,
    name: "Pink Jumper",
    slug: "pink-jumper",
    permalink: "https://cms.example/products/pink-jumper/",
  });
  expect(context.fields.link).toEqual({ type: "url", value: "/product/pink-jumper" });
  expect(context.fields["storefront.href"]).toEqual({ type: "url", value: "/product/pink-jumper" });
  expect(context.fields["origin.permalink"]).toEqual({
    type: "url",
    value: "https://cms.example/products/pink-jumper/",
  });
});

test("Product Button, Grid, and slider bindings consume one storefront projection", async () => {
  const descriptor = {
    provider: "woocommerce",
    source: "product",
    mode: "collection" as const,
  };
  const context = normalizeWooCommerceProductContext({
    id: 42,
    name: "Pink Jumper",
    slug: "pink-jumper",
    permalink: "https://cms.example/products/pink-jumper/",
  });
  const layout = {
    version: 1,
    key: "product-single",
    page: "product-single",
    updatedAt: "2026-08-15T00:00:00.000Z",
    sections: [{
      id: "section",
      kind: "content",
      visible: true,
      rows: [{ id: "row", layout: "1-col", columns: [{ id: "column", elements: [
        {
          id: "button",
          kind: "button",
          buttonUrl: "/fallback",
          dynamicBindings: { buttonUrl: { path: "link", valueType: "url" } },
        },
        {
          id: "grid",
          kind: "grid",
          gridItems: [{
            id: "grid-template",
            buttonUrl: "/fallback",
            dynamicContext: descriptor,
            dynamicBindings: { buttonUrl: { path: "link", valueType: "url" } },
          }],
        },
        {
          id: "slider",
          kind: "panelSlider",
          slides: [{
            id: "slide-template",
            buttonUrl: "/fallback",
            dynamicContext: descriptor,
            dynamicBindings: { buttonUrl: { path: "link", valueType: "url" } },
          }],
        },
      ] }] }],
    }],
  } as BuilderLayout;

  const result = await materializeBuilderDynamicContent(layout, {
    rootContext: context,
    resolveContexts: async () => [context],
  });
  const elements = result.renderLayout.sections[0].rows?.[0].columns[0].elements ?? [];
  expect(elements[0].buttonUrl).toBe("/product/pink-jumper");
  expect(elements[1].gridItems?.[0].buttonUrl).toBe("/product/pink-jumper");
  expect(elements[2].slides?.[0].buttonUrl).toBe("/product/pink-jumper");
  expect(JSON.stringify(result.renderLayout)).not.toContain("cms.example");
});
