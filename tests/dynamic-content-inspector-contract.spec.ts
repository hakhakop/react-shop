import { expect, test } from "@playwright/test";
import {
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES,
  dynamicContentSourceCapability,
  dynamicContentSourceFields,
  dynamicContentSourceKey,
} from "@/lib/dynamicContentCapabilities";

test("Phase 13E1 advertises only the supported static and Custom Posts sources", () => {
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
    { path: "link", label: "Link", valueType: "url" },
    { path: "id", label: "ID", valueType: "identifier" },
  ]));
});

test("unsupported descriptors are not advertised as working sources", () => {
  const descriptor = {
    provider: "woocommerce",
    source: "product",
    mode: "collection",
  } as never;

  expect(dynamicContentSourceKey(descriptor)).toBe("static");
  expect(dynamicContentSourceCapability(descriptor)).toEqual(
    DYNAMIC_CONTENT_SOURCE_CAPABILITIES[0],
  );
});
