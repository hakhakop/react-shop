import { expect, test } from "@playwright/test";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { BuilderDataScope } from "@/lib/builderLayouts";
import { readBuilderLayoutStore, writeBuilderLayoutStore } from "@/lib/builderLayouts";
import { readDynamicBuilderDocument, updateDynamicBuilderDocument } from "@/lib/builderLayoutDocuments.server";
import {
  resolveLayout,
  parseRoutingTemplateId,
  type CanonicalRouteContext,
  type RoutingTemplate,
} from "@/lib/layoutRouting";
import { readLayoutRoutingRegistry, writeLayoutRoutingRegistry } from "@/lib/layoutRoutingStore.server";
import {
  InvalidRoutingTemplateRequestError,
  RoutingTemplateNotFoundError,
  createRoutingTemplatesService,
} from "@/lib/routingTemplatesService.server";

const productContext = {
  view: "singular" as const,
  provider: "wordpress",
  contentType: "product",
  contentId: "product-1",
  slug: "proof",
  uri: "/product/proof/",
  taxonomyTerms: [],
};

const postContext = { ...productContext, contentType: "post", contentId: "post-1" };

function winnerId(context: CanonicalRouteContext, templates: RoutingTemplate[]) {
  const resolution = resolveLayout({
    context,
    individualOverrides: [],
    routingTemplates: templates,
    nativeFallbackAvailable: true,
  });
  return resolution.outcome === "routing-template" ? resolution.template.id : null;
}

test("Routing Templates service owns atomic website-scoped lifecycle", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-routing-service-"));
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scopeA: BuilderDataScope = { websiteId: "site-a" };
  const scopeB: BuilderDataScope = { websiteId: "site-b" };

  await writeBuilderLayoutStore({
    "product-single": {
      version: 1,
      page: "product-single",
      targetType: "template",
      template: "product-single",
      updatedAt: new Date(0).toISOString(),
      sections: [{ id: "legacy-product", kind: "contentLayout", title: "", background: "transparent", visible: true }],
    },
  }, scopeA);

  const serviceA = createRoutingTemplatesService(scopeA);
  const initial = await serviceA.list();
  expect(initial.filter((item) => item.id === "routing:legacy-product-single")).toHaveLength(1);
  expect(initial.filter((item) => item.id === "routing:legacy-post-single")).toHaveLength(1);
  expect(await serviceA.list()).toHaveLength(initial.length);

  const product = await serviceA.create({ name: "Featured Product", contentType: "product" });
  const post = await serviceA.create({ name: "Featured Post", contentType: "post" });
  expect(product.template.layoutId).toBe(product.document.documentId);
  expect(post.template.layoutId).toBe(post.document.documentId);
  await expect(readDynamicBuilderDocument(product.template.layoutId, scopeA)).resolves.toBeTruthy();
  await expect(readDynamicBuilderDocument(product.template.layoutId, scopeB)).rejects.toThrow();
  await expect(createRoutingTemplatesService(scopeB).update(product.template.id, { name: "Cross scope" }))
    .rejects.toBeInstanceOf(RoutingTemplateNotFoundError);

  const sourceBefore = await readDynamicBuilderDocument(product.template.layoutId, scopeA);
  const renamed = await serviceA.update(product.template.id, { name: "Renamed Product" });
  expect(renamed.name).toBe("Renamed Product");
  expect((await readDynamicBuilderDocument(product.template.layoutId, scopeA)).updatedAt)
    .toBe(sourceBefore.updatedAt);

  await serviceA.setEnabled(product.template.id, false);
  expect(winnerId(productContext, await serviceA.list())).not.toBe(product.template.id);
  await serviceA.setEnabled(product.template.id, true);

  const beforeReorder = await serviceA.list();
  const matchingProducts = beforeReorder.filter((item) =>
    item.conditions.some((condition) => condition.subject === "content-type" && condition.contentType === "product"));
  const first = matchingProducts[0]!;
  const second = matchingProducts[1]!;
  expect(winnerId(productContext, beforeReorder)).toBe(first.id);
  const reorderedIds = beforeReorder.map((item) => item.id);
  reorderedIds.splice(reorderedIds.indexOf(second.id), 1);
  reorderedIds.splice(reorderedIds.indexOf(first.id), 0, second.id);
  const reordered = await serviceA.reorder(reorderedIds);
  expect(winnerId(productContext, reordered)).toBe(second.id);
  expect(reordered.map((item) => item.order)).toEqual(reordered.map((_, index) => index * 10));
  await serviceA.setEnabled(second.id, false);
  expect(winnerId(productContext, await serviceA.list())).toBe(first.id);
  await serviceA.setEnabled(second.id, true);
  expect(winnerId(productContext, await serviceA.list())).toBe(second.id);

  const duplicate = await serviceA.duplicate(product.template.id);
  expect(duplicate.template.id).not.toBe(product.template.id);
  expect(duplicate.template.layoutId).not.toBe(product.template.layoutId);
  const duplicateIndex = (await serviceA.list()).findIndex((item) => item.id === duplicate.template.id);
  const sourceIndex = (await serviceA.list()).findIndex((item) => item.id === product.template.id);
  expect(duplicateIndex).toBe(sourceIndex + 1);
  await updateDynamicBuilderDocument(duplicate.template.layoutId, {
    sections: [{ id: "duplicate-only", kind: "contentLayout", title: "Duplicate", background: "transparent", visible: true }],
  }, scopeA);
  expect((await readDynamicBuilderDocument(product.template.layoutId, scopeA)).sections[0]?.id)
    .not.toBe("duplicate-only");

  const duplicatedCompatibility = await serviceA.duplicate("routing:legacy-product-single");
  expect(duplicatedCompatibility.template.layoutId).toMatch(/^layout:builder:dynamic:/);
  expect((await readBuilderLayoutStore(scopeA))["product-single"]).toBeTruthy();

  const registry = await readLayoutRoutingRegistry(scopeA);
  const sharedId = parseRoutingTemplateId("routing:template:11111111-1111-4111-8111-111111111111");
  await writeLayoutRoutingRegistry({
    ...registry,
    routingTemplates: [...registry.routingTemplates, {
      ...product.template,
      id: sharedId,
      name: "Shared reference",
      order: 999,
    }],
  }, scopeA);
  const sharedDelete = await serviceA.delete(product.template.id);
  expect((await serviceA.list()).some((item) => item.id === product.template.id)).toBe(false);
  expect(sharedDelete.layoutDeleted).toBe(false);
  expect(sharedDelete.references.routingTemplates.map((item) => item.id)).toContain(sharedId);
  await expect(readDynamicBuilderDocument(product.template.layoutId, scopeA)).resolves.toBeTruthy();

  const exclusiveDelete = await serviceA.delete(duplicate.template.id);
  expect(exclusiveDelete.layoutDeleted).toBe(true);
  await expect(readDynamicBuilderDocument(duplicate.template.layoutId, scopeA)).rejects.toThrow();
  expect(winnerId(postContext, await serviceA.list())).toBeTruthy();

  await expect(serviceA.get("bad-id")).rejects.toBeInstanceOf(InvalidRoutingTemplateRequestError);
  await expect(serviceA.reorder([...(await serviceA.list()).map((item) => item.id), sharedId]))
    .rejects.toBeInstanceOf(InvalidRoutingTemplateRequestError);
  await expect(serviceA.create({
    name: "Ambiguous",
    contentType: "product",
    conditions: [
      { subject: "content-type", operator: "include", contentType: "product" },
      { subject: "content-identity", operator: "include", identity: productContext },
      { subject: "taxonomy-term", operator: "include", taxonomy: "category", termId: "1" },
    ],
  })).rejects.toBeInstanceOf(InvalidRoutingTemplateRequestError);

  const serialized = await readFile(path.join(dataDir, "websites", "site-a", "builder-routing.json"), "utf8");
  expect(serialized).not.toContain("featuredImage");
  expect(serialized).not.toContain("product payload");
});

test("failed routing persistence rolls back the newly created document", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-routing-rollback-"));
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "rollback-site" };
  const service = createRoutingTemplatesService(scope, {
    readRegistry: async () => ({ version: 1, routingTemplates: [], individualOverrides: [] }),
    writeRegistry: async () => { throw new Error("simulated routing persistence failure"); },
  });
  await expect(service.create({ name: "Rollback", contentType: "post" }))
    .rejects.toThrow("simulated routing persistence failure");
  const store = await readBuilderLayoutStore(scope);
  expect(Object.keys(store).filter((key) => key.startsWith("dynamic:"))).toHaveLength(0);
});
