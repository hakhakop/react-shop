import { expect, test } from "@playwright/test";
import {
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES,
  dynamicContentSourceCapability,
  dynamicContentSourceFields,
  dynamicContentSourceKey,
} from "@/lib/dynamicContentCapabilities";
import { INSPECTOR_ELEMENT_CAPABILITIES } from "@/components/dashboard/inspector/inspectorRouting";

test("advertises Post and Product through the canonical source registry", () => {
  expect(DYNAMIC_CONTENT_SOURCE_CAPABILITIES.map(({ key, label, provider, source, mode }) => ({
    key,
    label,
    provider,
    source,
    mode,
  }))).toEqual([
    { key: "static", label: "None / Static", provider: undefined, source: undefined, mode: undefined },
    {
      key: "wordpress-post-collection",
      label: "Custom Posts",
      provider: "wordpress",
      source: "post",
      mode: "collection",
    },
    {
      key: "woocommerce-product-collection",
      label: "Custom Products",
      provider: "woocommerce",
      source: "product",
      mode: "collection",
    },
    {
      key: "woocommerce-product-single",
      label: "Product",
      provider: "woocommerce",
      source: "product",
      mode: "single",
    },
  ]);
});

test("Custom Posts source maps to the canonical collection descriptor", () => {
  const descriptor = {
    provider: "wordpress",
    source: "post",
    mode: "collection",
    query: { start: 2, quantity: 3, order: "title", direction: "asc" },
  } as const;

  expect(dynamicContentSourceKey(descriptor)).toBe("wordpress-post-collection");
  expect(dynamicContentSourceCapability(descriptor)).toMatchObject({
    provider: "wordpress",
    source: "post",
    mode: "collection",
  });
});

test("Custom Posts exposes one typed normalized field catalog", () => {
  const fields = dynamicContentSourceFields({
    provider: "wordpress",
    source: "post",
    mode: "collection",
  });

  expect(fields).toEqual(expect.arrayContaining([
    { path: "title", label: "Title", valueType: "string" },
    { path: "content", label: "Content", valueType: "richText" },
    { path: "featuredImage", label: "Featured Image", valueType: "media" },
    { path: "featuredImage.url", label: "Featured Image URL", valueType: "url" },
    { path: "featuredImage.alt", label: "Featured Image Alt", valueType: "string" },
    { path: "acf.intro_image.url", label: "Intro Image → URL", valueType: "url" },
    { path: "acf.intro_image.alt", label: "Intro Image → Alt", valueType: "string" },
    { path: "link", label: "Link", valueType: "url" },
    { path: "id", label: "ID", valueType: "identifier" },
  ]));
});

test("unsupported descriptors are not advertised as working sources", () => {
  const descriptor = {
    provider: "shopify",
    source: "item",
    mode: "collection",
  } as never;

  expect(dynamicContentSourceKey(descriptor)).toBe("static");
  expect(dynamicContentSourceCapability(descriptor)).toEqual(
    DYNAMIC_CONTENT_SOURCE_CAPABILITIES[0],
  );
});

test("Product exposes only canonical normalized provider fields", () => {
  const fields = dynamicContentSourceFields({
    provider: "woocommerce",
    source: "product",
    mode: "collection",
  });

  expect(fields).toEqual(expect.arrayContaining([
    { path: "title", label: "Title", valueType: "string" },
    { path: "image", label: "Image", valueType: "media" },
    { path: "price.amount", label: "Price Amount", valueType: "number" },
    { path: "categories.label", label: "Category Labels", valueType: "string" },
    { path: "attributes", label: "Attributes", valueType: "metadata" },
  ]));
  expect(dynamicContentSourceKey({
    provider: "woocommerce",
    source: "product",
    mode: "single",
  })).toBe("woocommerce-product-single");
});

test("Product capabilities own canonical collection and single query controls", () => {
  const collection = dynamicContentSourceCapability({
    provider: "woocommerce",
    source: "product",
    mode: "collection",
  });
  expect(collection?.queryControls?.map(({ key, control }) => ({ key, control }))).toEqual([
    { key: "start", control: "integer" },
    { key: "quantity", control: "integer" },
    { key: "order", control: "select" },
    { key: "direction", control: "select" },
    { key: "search", control: "text" },
    { key: "categories", control: "list" },
    { key: "featured", control: "select" },
    { key: "onSale", control: "select" },
    { key: "stockStatus", control: "select" },
    { key: "include", control: "list" },
    { key: "exclude", control: "list" },
  ]);
  const single = dynamicContentSourceCapability({
    provider: "woocommerce",
    source: "product",
    mode: "single",
  });
  expect(single?.queryControls?.map(({ key }) => key)).toEqual(["slug", "id"]);
});

test("Product fields are filtered by the shared destination compatibility registry", () => {
  const fields = dynamicContentSourceFields({ provider: "woocommerce", source: "product", mode: "collection" });
  const compatible = (types: readonly string[]) => fields.filter((field) => types.includes(field.valueType)).map((field) => field.path);
  expect(compatible(["string", "richText"])).toEqual(expect.arrayContaining([
    "title", "description", "excerpt", "price", "sku", "stockStatus", "categories.label",
  ]));
  expect(compatible(["media"])).toContain("image");
  expect(compatible(["url"])).toContain("link");
});

test("element source ownership is declared centrally, separate from field destinations", () => {
  for (const kind of ["heading", "text", "image", "button", "panel", "alert"] as const) {
    expect(INSPECTOR_ELEMENT_CAPABILITIES[kind]?.dynamicSourceSurface).toBe("element");
  }
  expect(INSPECTOR_ELEMENT_CAPABILITIES.list?.dynamicSourceSurface).not.toBe("element");
  expect(INSPECTOR_ELEMENT_CAPABILITIES.grid?.dynamicSourceSurface).not.toBe("element");
});
