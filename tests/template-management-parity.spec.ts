import { expect, test } from "@playwright/test";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  parseLayoutDocumentId,
  parseRoutingTemplateId,
  resolveLayout,
  routingTemplateMatches,
  type ArchiveRouteContext,
  type RoutingTemplate,
} from "@/lib/layoutRouting";
import { parseLayoutRoutingRegistry } from "@/lib/layoutRoutingStore.server";
import { createRoutingTemplatesService } from "@/lib/routingTemplatesService.server";
import { BUILTIN_TEMPLATE_PAGE_TYPES, type TemplatePageTypeDefinition } from "@/lib/templatePageTypes";

const layout = parseLayoutDocumentId("layout:builder:product-category");
const categoryContext: ArchiveRouteContext = {
  view: "archive",
  pageType: "taxonomy:product_cat",
  provider: "woocommerce",
  contentType: "product-category",
  contentId: "24",
  databaseId: 24,
  slug: "clothing",
  uri: "/product-category/women/clothing/",
  taxonomyTerms: [
    { taxonomy: "product_cat", id: "24", slug: "clothing" },
    { taxonomy: "product_cat", id: "10", slug: "women" },
  ],
  requestTaxonomyTerms: [{ taxonomy: "product_tag", id: "7", slug: "sale" }],
  pageNumber: 2,
  language: "en",
};

const assignedTemplate = (conditions: RoutingTemplate["conditions"]): RoutingTemplate => ({
  id: parseRoutingTemplateId("routing:assignment-proof"),
  name: "Assignment proof",
  enabled: true,
  order: 999,
  pageType: "taxonomy:product_cat",
  view: "archive",
  conditions,
  layoutId: layout,
});

test("registered page types include WordPress, system, and WooCommerce views in one catalog", () => {
  expect(BUILTIN_TEMPLATE_PAGE_TYPES.map((item) => item.id)).toEqual(expect.arrayContaining([
    "singular:post", "singular:page", "singular:product",
    "archive:post", "archive:product", "taxonomy:category",
    "taxonomy:product_cat", "taxonomy:product_tag", "system:search", "system:error-404",
  ]));
  expect(new Set(BUILTIN_TEMPLATE_PAGE_TYPES.map((item) => item.id)).size).toBe(BUILTIN_TEMPLATE_PAGE_TYPES.length);
});

test("legacy templates acquire canonical page types without a broad data migration", () => {
  const registry = parseLayoutRoutingRegistry({
    version: 1,
    routingTemplates: [{
      id: "routing:legacy-proof", name: "Legacy", enabled: true, order: 0,
      view: "archive", layoutId: "layout:builder:product-category",
      conditions: [{ subject: "content-type", operator: "include", contentType: "product-category" }],
    }],
    individualOverrides: [],
  });
  expect(registry.routingTemplates[0]?.pageType).toBe("taxonomy:product_cat");
});

test("assignment values are OR within a filter and filter groups compose with AND", () => {
  const template = assignedTemplate([
    { subject: "content-type", operator: "include", contentType: "product-category" },
    { subject: "taxonomy-term", operator: "include", taxonomy: "product_cat", termId: "999" },
    { subject: "taxonomy-term", operator: "include", taxonomy: "product_cat", termId: "24" },
    { subject: "request-taxonomy-term", operator: "include", taxonomy: "product_tag", termId: "7" },
    { subject: "page-number", operator: "include", page: "except-first" },
    { subject: "language", operator: "include", language: "en" },
  ]);
  expect(routingTemplateMatches(categoryContext, template)).toBe(true);
  expect(routingTemplateMatches({ ...categoryContext, language: "hy" }, template)).toBe(false);
  expect(routingTemplateMatches({ ...categoryContext, pageNumber: 1 }, template)).toBe(false);
  expect(routingTemplateMatches({ ...categoryContext, requestTaxonomyTerms: [] }, template)).toBe(false);
});

test("first matching list item wins and a disabled item can only be forced by editor preview", () => {
  const first = assignedTemplate([]);
  const disabled = { ...assignedTemplate([]), id: parseRoutingTemplateId("routing:disabled-proof"), enabled: false };
  const later = { ...assignedTemplate([]), id: parseRoutingTemplateId("routing:later-proof"), layoutId: parseLayoutDocumentId("layout:builder:later") };
  const storefront = resolveLayout({
    context: categoryContext, individualOverrides: [], routingTemplates: [disabled, first, later], nativeFallbackAvailable: false,
  });
  expect(storefront).toMatchObject({ outcome: "routing-template", template: { id: first.id } });
  expect(resolveLayout({
    context: categoryContext, individualOverrides: [], routingTemplates: [disabled, first, later],
    nativeFallbackAvailable: false, editorTemplateId: disabled.id,
  })).toMatchObject({ outcome: "routing-template", template: { id: disabled.id } });
});

test("CRUD, copy, status, assignment change, and order use the same generic service", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-template-parity-"));
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const movie: TemplatePageTypeDefinition = {
    id: "singular:movie", label: "Single Movie", group: "Single Movie", view: "singular",
    provider: "wordpress", contentType: "movie", source: "content", sourceKind: "content",
    filters: ["content-identity", "taxonomy-term", "language"],
  };
  const genre: TemplatePageTypeDefinition = {
    id: "taxonomy:movie_genre", label: "Movie Genre Archive", group: "Movie Genre Archive", view: "archive",
    provider: "wordpress", contentType: "movie_genre", source: "content", sourceKind: "taxonomy",
    taxonomy: "movie_genre", filters: ["taxonomy-term", "page-number", "language"],
  };
  const service = createRoutingTemplatesService(
    { websiteId: "template-parity" }, {}, { pageTypes: [...BUILTIN_TEMPLATE_PAGE_TYPES, movie, genre] },
  );
  const created = await service.create({ name: "Movie", pageType: movie.id, starter: "minimal" });
  expect(created.template).toMatchObject({ pageType: movie.id, view: "singular", enabled: true });
  const copy = await service.duplicate(created.template.id);
  expect(copy.template.layoutId).not.toBe(created.template.layoutId);
  await service.setEnabled(copy.template.id, false);
  expect((await service.get(copy.template.id)).enabled).toBe(false);
  const reassigned = await service.update(copy.template.id, { pageType: genre.id, conditions: [
    { subject: "content-type", operator: "include", contentType: "movie_genre" },
    { subject: "taxonomy-term", operator: "include", taxonomy: "movie_genre", termId: "12" },
  ] });
  expect(reassigned).toMatchObject({ pageType: genre.id, view: "archive" });
  const reordered = await service.reorder((await service.list()).map((item) => item.id).reverse());
  expect(reordered.map((item) => item.order)).toEqual(reordered.map((_, index) => index * 10));
  expect((await service.delete(copy.template.id)).template.id).toBe(copy.template.id);
});
