import { expect, test } from "@playwright/test";
import {
  createLegacyProductSingleRoutingTemplate,
  parseLayoutDocumentId,
  parseLayoutTarget,
  parseRoutingTemplateId,
  resolveLayout,
  type IndividualLayoutOverride,
  type RoutingTemplate,
  type SingularRouteContext,
} from "@/lib/layoutRouting";

const productLayout = parseLayoutDocumentId("layout:product-single");
const postLayout = parseLayoutDocumentId("layout:post-single");
const individualLayout = parseLayoutDocumentId("layout:individual-42");

const product: SingularRouteContext = {
  view: "singular",
  provider: "wordpress",
  contentType: "product",
  contentId: "gid://woocommerce/product/42",
  databaseId: 42,
  slug: "old-product-slug",
  uri: "/product/old-product-slug/",
  taxonomyTerms: [],
};

const post: SingularRouteContext = {
  view: "singular",
  provider: "wordpress",
  contentType: "post",
  contentId: "gid://wordpress/post/9",
  databaseId: 9,
  slug: "post-nine",
  uri: "/post-nine/",
  taxonomyTerms: [],
};

function template(input: Partial<RoutingTemplate> & Pick<RoutingTemplate, "id" | "layoutId">): RoutingTemplate {
  return {
    name: "Template",
    enabled: true,
    order: 0,
    view: "singular",
    conditions: [],
    ...input,
  };
}

test("strict target parsing never aliases an unknown target to Shop", () => {
  expect(() => parseLayoutTarget("mystery-target")).toThrow("Invalid layout target");
  expect(() => parseLayoutTarget({ kind: "page", pageId: "x", layoutId: "shop" })).toThrow(
    "Invalid layout document ID",
  );
});

test("individual overrides outrank templates and removal reveals the template", () => {
  const override: IndividualLayoutOverride = { ...product, layoutId: individualLayout };
  const general = createLegacyProductSingleRoutingTemplate(productLayout);
  const base = {
    context: product,
    routingTemplates: [general],
    nativeFallbackAvailable: true,
  };
  expect(resolveLayout({ ...base, individualOverrides: [override] })).toMatchObject({
    outcome: "individual",
    layoutId: individualLayout,
  });
  expect(resolveLayout({ ...base, individualOverrides: [] })).toMatchObject({
    outcome: "routing-template",
    layoutId: productLayout,
  });
});

test("matching templates use explicit order and ignore disabled templates", () => {
  const disabledFirst = template({
    id: parseRoutingTemplateId("routing:disabled"),
    layoutId: individualLayout,
    enabled: false,
    order: -1,
  });
  const later = template({
    id: parseRoutingTemplateId("routing:later"),
    layoutId: postLayout,
    order: 20,
  });
  const earlier = template({
    id: parseRoutingTemplateId("routing:earlier"),
    layoutId: productLayout,
    order: 10,
  });
  expect(resolveLayout({
    context: product,
    individualOverrides: [],
    routingTemplates: [disabledFirst, later, earlier],
    nativeFallbackAvailable: true,
  })).toMatchObject({ outcome: "routing-template", layoutId: productLayout });
});

test("stable identity survives slug changes", () => {
  const override: IndividualLayoutOverride = { ...product, layoutId: individualLayout };
  const renamed = { ...product, slug: "renamed", uri: "/product/renamed/" };
  expect(resolveLayout({
    context: renamed,
    individualOverrides: [override],
    routingTemplates: [],
    nativeFallbackAvailable: true,
  })).toMatchObject({ outcome: "individual", layoutId: individualLayout });
});

test("Product and Post contexts share one resolver algorithm", () => {
  const templates = [
    createLegacyProductSingleRoutingTemplate(productLayout),
    template({
      id: parseRoutingTemplateId("routing:post-single"),
      layoutId: postLayout,
      conditions: [{ subject: "content-type", operator: "include", contentType: "post" }],
    }),
  ];
  const input = { individualOverrides: [], routingTemplates: templates, nativeFallbackAvailable: true };
  expect(resolveLayout({ ...input, context: product })).toMatchObject({ layoutId: productLayout });
  expect(resolveLayout({ ...input, context: post })).toMatchObject({ layoutId: postLayout });
});

test("outputs distinguish routing, native, and not-found outcomes", () => {
  expect(resolveLayout({
    context: post,
    individualOverrides: [],
    routingTemplates: [],
    nativeFallbackAvailable: true,
  })).toEqual({ outcome: "native-fallback" });
  const notFoundLayoutId = parseLayoutDocumentId("layout:not-found");
  expect(resolveLayout({
    context: post,
    individualOverrides: [],
    routingTemplates: [],
    nativeFallbackAvailable: false,
    notFoundLayoutId,
  })).toEqual({ outcome: "not-found", layoutId: notFoundLayoutId });
});

test("library-template-shaped data cannot participate in routing", () => {
  const libraryTemplate = {
    id: "saved-library-template",
    title: "Reusable section",
    templateType: "section",
    sections: [],
  };
  expect(() => parseLayoutTarget(libraryTemplate)).toThrow("Invalid layout target");
});

test("existing product-single document is representable without renderer changes", () => {
  const compatibilityTemplate = createLegacyProductSingleRoutingTemplate(productLayout);
  expect(compatibilityTemplate).toMatchObject({
    view: "singular",
    layoutId: productLayout,
    conditions: [{ subject: "content-type", operator: "include", contentType: "product" }],
  });
  expect(resolveLayout({
    context: product,
    individualOverrides: [],
    routingTemplates: [compatibilityTemplate],
    nativeFallbackAvailable: true,
  })).toMatchObject({ outcome: "routing-template", layoutId: productLayout });
});

