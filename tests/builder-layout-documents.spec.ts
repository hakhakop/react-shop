import { expect, test } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  BuilderDocumentNotFoundError,
  InvalidBuilderDocumentIdError,
  createDynamicBuilderDocument,
  deleteDynamicBuilderDocument,
  duplicateDynamicBuilderDocument,
  readDynamicBuilderDocument,
  updateDynamicBuilderDocument,
} from "@/lib/builderLayoutDocuments.server";
import {
  mutateBuilderLayoutStore,
  readBuilderLayoutStore,
  writeBuilderLayoutStore,
  type BuilderSection,
} from "@/lib/builderLayouts";
import {
  parseRoutingTemplateId,
  resolveLayout,
  type RoutingTemplate,
  type SingularRouteContext,
} from "@/lib/layoutRouting";
import { getBuilderLayoutByDocumentId } from "@/lib/layoutRoutingStore.server";

const section = (title: string): BuilderSection => ({
  id: `section-${title.toLowerCase().replace(/\s+/g, "-")}`,
  kind: "contentLayout",
  title,
  background: "transparent",
  visible: true,
  layout: "whole",
  layoutColumns: 1,
  layoutRows: 1,
  layoutItems: [],
});

test("strict dynamic Builder document CRUD is isolated and Phase 14B compatible", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-dynamic-documents-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const siteA = { websiteId: "site-a" };
  const siteB = { websiteId: "site-b" };
  try {
    await writeBuilderLayoutStore({
      shop: {
        version: 1, page: "shop", targetType: "page",
        sections: [section("Shop must remain")], updatedAt: "2026-08-15T00:00:00.000Z",
      },
    }, siteA);

    const created = await createDynamicBuilderDocument({
      displayName: "Routing layout",
      sections: [section("Original")],
    }, siteA);
    expect(created.documentId).toMatch(/^layout:builder:dynamic:/);
    expect(created.page).toMatch(/^dynamic:/);
    expect((await readDynamicBuilderDocument(created.documentId, siteA)).sections[0].title)
      .toBe("Original");

    const updated = await updateDynamicBuilderDocument(created.documentId, {
      displayName: "Updated routing layout",
      sections: [section("Updated")],
    }, siteA);
    expect(updated.sections[0].title).toBe("Updated");

    const duplicate = await duplicateDynamicBuilderDocument(created.documentId, siteA);
    expect(duplicate.documentId).not.toBe(created.documentId);
    duplicate.sections[0].title = "Transient mutation";
    expect((await readDynamicBuilderDocument(created.documentId, siteA)).sections[0].title)
      .toBe("Updated");
    expect((await readDynamicBuilderDocument(duplicate.documentId, siteA)).sections[0].title)
      .toBe("Updated");

    await expect(readDynamicBuilderDocument(created.documentId, siteB))
      .rejects.toBeInstanceOf(BuilderDocumentNotFoundError);
    await expect(readDynamicBuilderDocument("layout:builder:dynamic:not-valid", siteA))
      .rejects.toBeInstanceOf(InvalidBuilderDocumentIdError);
    await expect(readDynamicBuilderDocument("layout:builder:shop", siteA))
      .rejects.toBeInstanceOf(InvalidBuilderDocumentIdError);

    const routeContext: SingularRouteContext = {
      view: "singular", provider: "wordpress", contentType: "post",
      contentId: "post-42", databaseId: 42, slug: "proof", uri: "/proof",
      taxonomyTerms: [],
    };
    const routingTemplate: RoutingTemplate = {
      id: parseRoutingTemplateId("routing:dynamic-document-proof"),
      name: "Dynamic document proof", enabled: true, order: 0, view: "singular",
      conditions: [{ subject: "content-type", operator: "include", contentType: "post" }],
      layoutId: created.documentId!,
    };
    const resolution = resolveLayout({
      context: routeContext, individualOverrides: [], routingTemplates: [routingTemplate],
      nativeFallbackAvailable: true,
    });
    expect(resolution).toMatchObject({ outcome: "routing-template", layoutId: created.documentId });
    expect((await getBuilderLayoutByDocumentId(created.documentId!, siteA))?.displayName)
      .toBe("Updated routing layout");

    await deleteDynamicBuilderDocument(created.documentId, siteA);
    await expect(readDynamicBuilderDocument(created.documentId, siteA))
      .rejects.toBeInstanceOf(BuilderDocumentNotFoundError);
    const store = await readBuilderLayoutStore(siteA);
    expect(store.shop?.sections[0].title).toBe("Shop must remain");
    expect(store[duplicate.page]?.sections[0].title).toBe("Updated");
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("blank creation produces an ordinary editable Builder AST", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-blank-document-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  try {
    const created = await createDynamicBuilderDocument({}, { websiteId: "blank-site" });
    expect(created.targetType).toBe("document");
    expect(created.sections).toHaveLength(1);
    expect(created.sections[0].kind).toBe("contentLayout");
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("website-scoped layout mutations use latest state and touch only their exact entry", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-layout-concurrency-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "concurrency-site" };
  try {
    await writeBuilderLayoutStore({
      shop: { version: 1, page: "shop", targetType: "page", sections: [section("Shop")], updatedAt: "shop-stable" },
      home: { version: 1, page: "home", targetType: "page", sections: [section("Home")], updatedAt: "home-stable" },
    }, scope);
    const untouchedBefore = JSON.stringify((await readBuilderLayoutStore(scope)).home);

    let releaseLegacy!: () => void;
    const legacyPaused = new Promise<void>((resolve) => { releaseLegacy = resolve; });
    let legacyHasRead!: () => void;
    const legacyRead = new Promise<void>((resolve) => { legacyHasRead = resolve; });
    const legacySave = mutateBuilderLayoutStore(async (store) => {
      legacyHasRead();
      await legacyPaused;
      store.shop = { ...store.shop!, sections: [section("Saved Shop")] };
    }, scope);
    await legacyRead;
    const createdPromise = createDynamicBuilderDocument({ sections: [section("Concurrent Create")] }, scope);
    releaseLegacy();
    const [, created] = await Promise.all([legacySave, createdPromise]);
    let store = await readBuilderLayoutStore(scope);
    expect(store.shop?.sections[0].title).toBe("Saved Shop");
    expect(store[created.page]?.sections[0].title).toBe("Concurrent Create");
    expect(JSON.stringify(store.home)).toBe(untouchedBefore);

    const second = await createDynamicBuilderDocument({ sections: [section("Second") ] }, scope);
    await Promise.all([
      updateDynamicBuilderDocument(created.documentId, { sections: [section("First Updated")] }, scope),
      updateDynamicBuilderDocument(second.documentId, { sections: [section("Second Updated")] }, scope),
    ]);
    store = await readBuilderLayoutStore(scope);
    expect(store[created.page]?.sections[0].title).toBe("First Updated");
    expect(store[second.page]?.sections[0].title).toBe("Second Updated");

    await Promise.all([
      updateDynamicBuilderDocument(created.documentId, { sections: [section("Final First")] }, scope),
      deleteDynamicBuilderDocument(second.documentId, scope),
    ]);
    store = await readBuilderLayoutStore(scope);
    expect(store[created.page]?.sections[0].title).toBe("Final First");
    expect(store[second.page]).toBeUndefined();
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});
