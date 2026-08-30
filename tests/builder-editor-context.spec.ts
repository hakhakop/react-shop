import { expect, test } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  BuilderEditorContextMismatchError,
  getEditableLayoutTargetForCurrentRequest,
  projectIndividualBuilderEditorContext,
  resolveBuilderEditorSession,
  resolveOrdinaryBuilderEditorContext,
} from "@/lib/builderEditorContext.server";
import {
  encodeIndividualBuilderIdentity,
  resolveIndividualBuilderContext,
} from "@/lib/individualBuilderContext.server";
import { createIndividualLayoutsService } from "@/lib/individualLayoutsService.server";
import { createContentDiscoveryService } from "@/lib/contentDiscovery.server";
import {
  builderLayoutDocumentId,
  createLegacyPostSingleRoutingTemplate,
  createLegacyProductCategoryRoutingTemplate,
  createLegacyProductSingleRoutingTemplate,
  parseRoutingTemplateId,
  type ArchiveRouteContext,
  type SingularRouteContext,
} from "@/lib/layoutRouting";
import {
  type LayoutRoutingRegistry,
  writeLayoutRoutingRegistry,
} from "@/lib/layoutRoutingStore.server";
import { createRoutingTemplatesService } from "@/lib/routingTemplatesService.server";
import { normalizeWooCommerceProductContext } from "@/lib/woocommerceDynamicContentProvider.server";
import { normalizeWordPressPostContext } from "@/lib/wordpressDynamicContentProvider.server";
import type { BuilderSection } from "@/lib/builderLayouts";

const sections: BuilderSection[] = [{
  id: "root",
  kind: "contentLayout",
  title: "",
  background: "transparent",
  visible: true,
  layout: "whole",
  layoutColumns: 1,
  layoutRows: 1,
  layoutItems: [{ id: "column", rowId: "row", rowLayout: "whole", blocks: [] }],
}];

const productIdentity = { provider: "woocommerce", contentType: "product", contentId: "4078" } as const;
const productContext = normalizeWooCommerceProductContext({
  id: 4078,
  name: "Wool Blend Coat",
  slug: "wool-blend-coat",
  status: "publish",
  price: "65.00",
  description: "<p>Fetched product payload must not enter editor context.</p>",
});
const postContext = normalizeWordPressPostContext({
  id: "post-15",
  databaseId: 15,
  title: "Performance Testing",
  slug: "performance-testing",
  status: "publish",
  content: "<p>Fetched post payload must not enter editor context.</p>",
});

test("canonical editor contexts distinguish Page, Template preview, and fixed Individual ownership", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-editor-context-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "editor-site-a" };
  try {
    const page = await resolveOrdinaryBuilderEditorContext({
      page: "home",
      scope,
      layout: { version: 1, page: "home", sections, updatedAt: "2026-08-15T00:00:00.000Z" },
    });
    expect(page).toMatchObject({
      document: { kind: "page", displayName: "Home" },
      content: { mode: "none", pageType: "singular:page" },
      navigation: { returnLabel: "Back to Pages", frontendHref: "/" },
      capabilities: { canChangePreview: false, canOpenFrontend: true },
    });
    expect(page.navigation.returnHref).toContain("/app/websites/editor-site-a/builder#pages");

    const template = await createRoutingTemplatesService(scope).create({
      name: "Post Story",
      contentType: "post",
      layout: { sections },
    });
    const templateSession = await resolveBuilderEditorSession({
      documentId: template.template.layoutId,
      routingTemplateId: template.template.id,
      scope,
      resolveContexts: async () => [postContext],
    });
    expect(templateSession.editorContext).toMatchObject({
      document: { id: template.template.layoutId, kind: "routing-template", displayName: "Post Story" },
      content: {
        mode: "preview",
        pageType: "singular:post",
        family: "post",
        identity: { provider: "wordpress", contentType: "post", contentId: "post-15" },
        label: "Performance Testing",
        storefrontHref: "/performance-testing",
      },
      ownership: {
        resolved: { source: "routing-template" },
        activeTemplate: { templateId: "routing:legacy-post-single" },
        effective: { source: "routing-template", layoutId: template.template.layoutId },
        assignedTemplate: { templateId: template.template.id },
      },
      navigation: { returnLabel: "Back to Templates", frontendHref: "/performance-testing" },
      capabilities: { canChangePreview: true, canOpenFrontend: true },
    });

    await createRoutingTemplatesService(scope).create({
      name: "All Products",
      contentType: "product",
      layout: { sections },
    });
    const individualService = createIndividualLayoutsService(scope);
    const individual = await individualService.create(productIdentity, { sections });
    const individualResolution = await resolveIndividualBuilderContext({
      documentId: individual.document.documentId,
      individual: encodeIndividualBuilderIdentity(productIdentity),
      scope,
      individualService,
      discoveryService: createContentDiscoveryService(null, { resolveContexts: async () => [productContext] }),
    });
    const individualContext = projectIndividualBuilderEditorContext(individualResolution, scope);
    expect(individualContext).toMatchObject({
      document: { id: individual.document.documentId, kind: "individual", displayName: "Wool Blend Coat" },
      content: { mode: "fixed", pageType: "singular:product", family: "product", identity: productIdentity, storefrontHref: "/product/wool-blend-coat" },
      ownership: {
        resolved: { source: "individual", layoutId: individual.document.documentId },
        effective: { source: "individual", layoutId: individual.document.documentId },
        individual: { layoutId: individual.document.documentId },
        assignedTemplate: { name: "All Products" },
        fallback: { source: "routing-template" },
      },
      navigation: { returnLabel: "Back to Content", frontendHref: "/product/wool-blend-coat" },
      capabilities: { canChangePreview: false, canOpenFrontend: true, canEditAssignedTemplate: true },
    });
    expect(JSON.stringify(individualContext)).not.toContain("Fetched product payload");
    expect(JSON.stringify(templateSession.editorContext)).not.toContain("Fetched post payload");
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("ordinary Builder canvases derive template creation type from their registered layout owner", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-ordinary-page-types-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "ordinary-page-types" };
  try {
    await writeLayoutRoutingRegistry({
      version: 1,
      routingTemplates: [
        createLegacyPostSingleRoutingTemplate(builderLayoutDocumentId("post-single")),
        createLegacyProductSingleRoutingTemplate(builderLayoutDocumentId("product-single")),
        createLegacyProductCategoryRoutingTemplate(builderLayoutDocumentId("product-category")),
      ],
      individualOverrides: [],
    }, scope);
    for (const item of [
      { page: "post-single", pageType: "singular:post" },
      { page: "product-single", pageType: "singular:product" },
      { page: "product-category", pageType: "taxonomy:product_cat" },
    ] as const) {
      const context = await resolveOrdinaryBuilderEditorContext({
        page: item.page,
        scope,
        layout: {
          version: 1,
          page: item.page,
          targetType: "template",
          sections,
          updatedAt: "2026-08-30T00:00:00.000Z",
        },
      });
      expect(context.content.pageType).toBe(item.pageType);
    }
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("mixed and foreign strict transports fail through accepted owners", async () => {
  await expect(resolveBuilderEditorSession({
    documentId: "layout:builder:dynamic:00000000-0000-4000-8000-000000000000",
    routingTemplateId: "routing:legacy-post-single",
    individual: "v1.invalid",
  })).rejects.toBeInstanceOf(BuilderEditorContextMismatchError);

  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-editor-cross-scope-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  try {
    const created = await createRoutingTemplatesService({ websiteId: "site-a" }).create({
      name: "Site A Product",
      contentType: "product",
      layout: { sections },
    });
    await expect(resolveBuilderEditorSession({
      documentId: created.template.layoutId,
      routingTemplateId: created.template.id,
      scope: { websiteId: "site-b" },
      resolveContexts: async () => [productContext],
    })).rejects.toThrow();
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("editable target projection uses canonical route identity and resolved layout ownership", async () => {
  const postRoute: SingularRouteContext = {
    view: "singular",
    provider: "wordpress",
    contentType: "post",
    contentId: "post-15",
    slug: "performance-testing",
    uri: "/performance-testing",
    taxonomyTerms: [],
  };
  const productRoute: SingularRouteContext = {
    view: "singular",
    provider: "woocommerce",
    contentType: "product",
    contentId: "4078",
    slug: "wool-blend-coat",
    uri: "/product/wool-blend-coat",
    taxonomyTerms: [],
  };
  const postLayout = builderLayoutDocumentId("post-template");
  const productLayout = builderLayoutDocumentId("product-individual");
  const postTemplate = {
    id: parseRoutingTemplateId("routing:test-post"),
    name: "Post Template",
    enabled: true,
    order: 0,
    view: "singular" as const,
    conditions: [{ subject: "content-type" as const, operator: "include" as const, contentType: "post" }],
    layoutId: postLayout,
  };
  const registry: LayoutRoutingRegistry = {
    version: 1,
    routingTemplates: [postTemplate],
    individualOverrides: [{ ...productIdentity, layoutId: productLayout }],
  };
  const readRegistry = async () => registry;
  const scope = { websiteId: "editor-site" };

  const individual = await getEditableLayoutTargetForCurrentRequest({ request: { kind: "singular", context: productRoute }, scope, readRegistry });
  expect(individual).toMatchObject({
    label: "Edit Individual Layout",
    targetKind: "individual",
    documentId: productLayout,
    individualIdentity: productIdentity,
  });
  expect(individual?.builderHref).toContain(`document=${encodeURIComponent(productLayout)}`);
  expect(individual?.builderHref).toContain("individual=v1.");

  const post = await getEditableLayoutTargetForCurrentRequest({ request: { kind: "singular", context: postRoute }, scope, readRegistry });
  expect(post).toMatchObject({
    label: "Edit Single Post Template",
    targetKind: "routing-template",
    documentId: postLayout,
    routingTemplateId: postTemplate.id,
  });

  const categoryRoute: ArchiveRouteContext = {
    view: "archive",
    provider: "woocommerce",
    contentType: "product-category",
    contentId: "24",
    databaseId: 24,
    slug: "clothing",
    uri: "/product-category/women/clothing/",
    taxonomyTerms: [{ taxonomy: "product_cat", id: "24", slug: "clothing" }],
  };
  const categoryLayout = builderLayoutDocumentId("product-category");
  const categoryTemplate = {
    ...postTemplate,
    id: parseRoutingTemplateId("routing:test-product-category"),
    name: "Product Category Template",
    view: "archive" as const,
    conditions: [{ subject: "content-type" as const, operator: "include" as const, contentType: "product-category" }],
    layoutId: categoryLayout,
  };
  const category = await getEditableLayoutTargetForCurrentRequest({
    request: { kind: "dynamic", context: categoryRoute },
    scope,
    readRegistry: async () => ({ version: 1, routingTemplates: [categoryTemplate], individualOverrides: [] }),
  });
  expect(category).toMatchObject({
    label: "Edit Product Category Template",
    targetKind: "routing-template",
    documentId: categoryLayout,
    routingTemplateId: categoryTemplate.id,
  });
  expect(category?.builderHref).toContain("previewContentType=product-category");
  expect(category?.builderHref).toContain("previewContentId=24");

  const productTemplateRegistry: LayoutRoutingRegistry = {
    version: 1,
    individualOverrides: [],
    routingTemplates: [{ ...postTemplate, id: parseRoutingTemplateId("routing:test-product"), name: "Product Template", conditions: [{ subject: "content-type", operator: "include", contentType: "product" }] }],
  };
  const productTemplate = await getEditableLayoutTargetForCurrentRequest({
    request: { kind: "singular", context: productRoute },
    scope,
    readRegistry: async () => productTemplateRegistry,
  });
  expect(productTemplate?.label).toBe("Edit Product Template");

  const native = await getEditableLayoutTargetForCurrentRequest({
    request: { kind: "singular", context: postRoute },
    scope,
    readRegistry: async () => ({ version: 1, routingTemplates: [], individualOverrides: [] }),
  });
  expect(native).toMatchObject({
    label: "Create Layout",
    targetKind: "content-management",
    effectiveSource: "native-fallback",
    individualIdentity: { contentId: "post-15" },
  });
  expect(native?.builderHref).toBe("/app/websites/editor-site/builder#content");

  await expect(getEditableLayoutTargetForCurrentRequest({
    request: { kind: "page", pageId: "about" },
    scope,
  })).resolves.toMatchObject({
    label: "Edit Page",
    targetKind: "page",
    builderHref: "/app/websites/editor-site/builder?page=about",
    effectiveSource: "page",
  });
});
