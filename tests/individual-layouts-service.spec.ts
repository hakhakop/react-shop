import { expect, test } from "@playwright/test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  IndividualLayoutConflictError,
  IndividualLayoutNotFoundError,
  InvalidIndividualLayoutRequestError,
  UnsupportedIndividualLayoutTargetError,
  createIndividualLayoutsService,
} from "@/lib/individualLayoutsService.server";
import { createRoutingTemplatesService } from "@/lib/routingTemplatesService.server";
import { readDynamicBuilderDocument } from "@/lib/builderLayoutDocuments.server";
import {
  parseRoutingTemplateId,
  resolveLayout,
  type IndividualLayoutOverride,
} from "@/lib/layoutRouting";
import { readLayoutRoutingRegistry } from "@/lib/layoutRoutingStore.server";

const product = { provider: "woocommerce", contentType: "product", contentId: "42" };
const post = { provider: "wordpress", contentType: "post", contentId: "post-7" };

test("Individual service creates exact Product/Post assignments and exposes canonical status", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-individual-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "individual-site-a" };
  try {
    const templates = createRoutingTemplatesService(scope);
    const assigned = await templates.create({ name: "Default Product", contentType: "product" });
    const service = createIndividualLayoutsService(scope);
    const authoredSections = [{
      id: "authored-copy",
      kind: "contentLayout" as const,
      title: "",
      background: "transparent",
      visible: true,
      dynamicContext: { provider: "woocommerce", source: "product", mode: "single" as const },
    }];
    const created = await service.create(product, { sections: authoredSections });
    const createdPost = await service.create(post);

    expect(created.document.documentId).toMatch(/^layout:builder:dynamic:/);
    expect(createdPost.document.documentId).toMatch(/^layout:builder:dynamic:/);
    expect(created.assignment).toMatchObject(product);
    expect(created.status.effective).toEqual({ source: "individual", layoutId: created.document.documentId });
    expect(created.status.fallback).toEqual({ source: "routing-template", layoutId: assigned.template.layoutId });
    expect(created.status.assignedTemplate).toMatchObject({
      templateId: assigned.template.id,
      name: "Default Product",
    });
    expect((await readDynamicBuilderDocument(created.document.documentId, scope)).sections)
      .toEqual(authoredSections);
    authoredSections[0]!.title = "mutated input";
    expect((await readDynamicBuilderDocument(created.document.documentId, scope)).sections[0]?.title).toBe("");

    const registry = await readLayoutRoutingRegistry(scope);
    expect(registry.individualOverrides).toContainEqual({ ...product, layoutId: created.document.documentId });
    const runtime = resolveLayout({
      context: { view: "singular", ...product, slug: "any-slug", uri: "/product/any-slug", taxonomyTerms: [] },
      individualOverrides: registry.individualOverrides,
      routingTemplates: registry.routingTemplates,
      nativeFallbackAvailable: true,
    });
    expect(runtime).toMatchObject({ outcome: "individual", layoutId: created.document.documentId });
    await expect(service.create(product)).rejects.toBeInstanceOf(IndividualLayoutConflictError);

    const removed = await service.remove(product);
    expect(removed.status.effective).toEqual({ source: "routing-template", layoutId: assigned.template.layoutId });
    expect(removed.cleanup.outcome).toBe("deleted");
    await expect(readDynamicBuilderDocument(created.document.documentId, scope)).rejects.toThrow();
    await expect(service.validateBuilderOwnership(product, created.document.documentId))
      .rejects.toBeInstanceOf(IndividualLayoutNotFoundError);

    const serialized = await readFile(path.join(dataDir, "websites", scope.websiteId, "builder-routing.json"), "utf8");
    expect(serialized).not.toContain("any-slug");
    expect(serialized).not.toContain("mutated input");
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("removal preserves referenced layouts and cleanup failure never restores routing", async () => {
  const registry = { version: 1 as const, routingTemplates: [], individualOverrides: [] as IndividualLayoutOverride[] };
  let current = structuredClone(registry);
  let cleanupFails = false;
  const service = createIndividualLayoutsService({}, {
    readRegistry: async () => structuredClone(current),
    writeRegistry: async (next) => { current = structuredClone(next); },
    createDocument: async () => ({ documentId: "layout:builder:dynamic:11111111-1111-4111-8111-111111111111" } as never),
    deleteDocument: async () => { if (cleanupFails) throw new Error("simulated cleanup failure"); },
    inspectReferences: async (layoutId) => ({
      layoutId: layoutId as never,
      dynamicDocument: true,
      routingTemplates: [{ id: parseRoutingTemplateId("routing:template:22222222-2222-4222-8222-222222222222"), name: "Shared" }],
      individualOverrides: [], pages: [], documents: [], hasReferences: true,
    }),
  });
  const created = await service.create(product);
  const preserved = await service.remove(product);
  expect(preserved.cleanup.outcome).toBe("preserved");
  expect(current.individualOverrides).toHaveLength(0);

  await service.create(post);
  cleanupFails = true;
  const failingService = createIndividualLayoutsService({}, {
    readRegistry: async () => structuredClone(current),
    writeRegistry: async (next) => { current = structuredClone(next); },
    deleteDocument: async () => { throw new Error("simulated cleanup failure"); },
    inspectReferences: async (layoutId) => ({
      layoutId: layoutId as never, dynamicDocument: true, routingTemplates: [], individualOverrides: [],
      pages: [], documents: [], hasReferences: false,
    }),
  });
  const failed = await failingService.remove(post);
  expect(failed.cleanup).toMatchObject({ outcome: "failed", message: "simulated cleanup failure" });
  expect(current.individualOverrides).toHaveLength(0);
  expect(created.assignment.contentId).toBe("42");
});

test("website scope, ownership validation, strict identity, rollback, and serialized mutations", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-individual-scope-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scopeA = { websiteId: "scope-a" };
  const scopeB = { websiteId: "scope-b" };
  try {
    const serviceA = createIndividualLayoutsService(scopeA);
    const serviceB = createIndividualLayoutsService(scopeB);
    const created = await serviceA.create(product);
    expect(await serviceB.getAssignment(product)).toBeNull();
    await expect(serviceB.validateBuilderOwnership(product, created.document.documentId))
      .rejects.toBeInstanceOf(IndividualLayoutNotFoundError);
    await expect(serviceA.create({ ...product, contentId: " " }))
      .rejects.toBeInstanceOf(InvalidIndividualLayoutRequestError);
    await expect(serviceA.create({ provider: "wordpress", contentType: "page", contentId: "1" }))
      .rejects.toBeInstanceOf(UnsupportedIndividualLayoutTargetError);

    const concurrentIdentity = { ...product, contentId: "concurrent" };
    await Promise.all([
      serviceA.create(concurrentIdentity),
      createRoutingTemplatesService(scopeA).create({ name: "Concurrent template", contentType: "post" }),
    ]);
    const concurrentRegistry = await readLayoutRoutingRegistry(scopeA);
    expect(concurrentRegistry.individualOverrides.some((item) => item.contentId === "concurrent")).toBe(true);
    expect(concurrentRegistry.routingTemplates.some((item) => item.name === "Concurrent template")).toBe(true);

    let rolledBack = false;
    const rollback = createIndividualLayoutsService({}, {
      readRegistry: async () => ({ version: 1, routingTemplates: [], individualOverrides: [] }),
      writeRegistry: async () => { throw new Error("routing write failed"); },
      createDocument: async () => ({ documentId: "layout:builder:dynamic:33333333-3333-4333-8333-333333333333" } as never),
      deleteDocument: async () => { rolledBack = true; },
    });
    await expect(rollback.create(post)).rejects.toThrow("routing write failed");
    expect(rolledBack).toBe(true);
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});
