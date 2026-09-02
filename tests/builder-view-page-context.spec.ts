import { expect, test } from "@playwright/test";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { writeBuilderLayoutStore, type BuilderSection } from "@/lib/builderLayouts";
import {
  builderLayoutDocumentId,
  parseRoutingTemplateId,
} from "@/lib/layoutRouting";
import { writeLayoutRoutingRegistry } from "@/lib/layoutRoutingStore.server";
import { resolveLegacyTemplateBuilderEntry } from "@/lib/templateBuilderContext.server";
import { productCategoryStorefrontHref } from "@/lib/templatePageTypes.server";

const sections: BuilderSection[] = [{
  id: "root",
  kind: "contentLayout",
  title: "",
  background: "transparent",
  visible: true,
  layout: "whole",
  layoutColumns: 1,
  layoutRows: 1,
  layoutItems: [],
}];

test("legacy template page entry is promoted to its canonical preview identity", async () => {
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = await mkdtemp(path.join(os.tmpdir(), "webpages-view-page-"));
  const scope = { websiteId: "view-page-site" };
  const layoutId = builderLayoutDocumentId("search-results");
  const templateId = parseRoutingTemplateId("routing:test-product-archive");
  try {
    await writeBuilderLayoutStore({
      "search-results": {
        version: 1,
        page: "search-results",
        targetType: "template",
        template: "search-results",
        updatedAt: "2026-09-02T00:00:00.000Z",
        sections,
      },
    }, scope);
    await writeLayoutRoutingRegistry({
      version: 1,
      individualOverrides: [],
      routingTemplates: [{
        id: templateId,
        name: "Products Archive",
        enabled: true,
        order: 0,
        pageType: "archive:product",
        view: "archive",
        conditions: [{ subject: "content-type", operator: "include", contentType: "product-archive" }],
        layoutId,
      }],
    }, scope);

    await expect(resolveLegacyTemplateBuilderEntry({ page: "home", scope })).resolves.toBeNull();
    await expect(resolveLegacyTemplateBuilderEntry({ page: "search-results", scope })).resolves.toMatchObject({
      documentId: layoutId,
      routingTemplateId: templateId,
      previewIdentity: {
        provider: "woocommerce",
        contentType: "product-archive",
        contentId: "archive:product",
      },
      storefrontHref: "/shop",
    });
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
  }
});

test("category preview storefront href preserves its full hierarchy", () => {
  expect(productCategoryStorefrontHref({
    slug: "accessories",
    ancestry: [{ slug: "women" }, { slug: "new-in" }],
  })).toBe("/product-category/women/new-in/accessories");
});
