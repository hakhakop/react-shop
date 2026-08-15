import { expect, test } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  IndividualBuilderContextMismatchError,
  decodeIndividualBuilderIdentity,
  encodeIndividualBuilderIdentity,
  resolveIndividualBuilderContext,
} from "@/lib/individualBuilderContext.server";
import { createIndividualLayoutsService } from "@/lib/individualLayoutsService.server";
import { createContentDiscoveryService } from "@/lib/contentDiscovery.server";
import { normalizeWooCommerceProductContext } from "@/lib/woocommerceDynamicContentProvider.server";
import { normalizeWordPressPostContext } from "@/lib/wordpressDynamicContentProvider.server";
import { readDynamicBuilderDocument, updateDynamicBuilderDocument } from "@/lib/builderLayoutDocuments.server";
import type { BuilderSection } from "@/lib/builderLayouts";

const productIdentity = { provider: "woocommerce", contentType: "product", contentId: "4078" } as const;
const postIdentity = { provider: "wordpress", contentType: "post", contentId: "cG9zdDoxNQ==" } as const;

const productContext = normalizeWooCommerceProductContext({
  id: 4078,
  name: "Wool Bblend Coat",
  slug: "wool-bblend-coat",
  status: "publish",
  price: "65.00",
  description: "<p>Wool description</p>",
  images: [{ src: "https://store.example/wool.jpg", alt: "Wool coat" }],
});

const postContext = normalizeWordPressPostContext({
  id: "cG9zdDoxNQ==",
  databaseId: 15,
  title: "The Ultimate Guide to Performance Testing",
  slug: "the-ultimate-guide-to-performance-testing",
  status: "draft",
  content: "<p>Performance body</p>",
  featuredImage: { node: { sourceUrl: "https://store.example/performance.jpg", altText: "Performance" } },
});

function sections(family: "product" | "post"): BuilderSection[] {
  return [{
    id: `${family}-section`, kind: "contentLayout", title: "", background: "transparent", visible: true,
    layout: "whole", layoutColumns: 1, layoutRows: 1,
    layoutItems: [{
      id: `${family}-column`, rowId: `${family}-row`, rowLayout: "whole",
      blocks: family === "product" ? [
        { id: "title", kind: "heading", headingText: "Fallback", dynamicBindings: { headingText: { path: "title", valueType: "string" } } },
        { id: "price", kind: "text", body: "Fallback", dynamicBindings: { body: { path: "price", valueType: "string" } } },
        { id: "image", kind: "image", imageUrl: "", dynamicBindings: { imageUrl: { path: "image.url", valueType: "url" } } },
        { id: "button", kind: "button", buttonUrl: "#", dynamicBindings: { buttonUrl: { path: "link", valueType: "url" } } },
      ] : [
        { id: "title", kind: "heading", headingText: "Fallback", dynamicBindings: { headingText: { path: "title", valueType: "string" } } },
        { id: "body", kind: "text", body: "Fallback", dynamicBindings: { body: { path: "content", valueType: "richText" } } },
        { id: "image", kind: "image", imageUrl: "", dynamicBindings: { imageUrl: { path: "featuredImage.url", valueType: "url" } } },
      ],
    }],
  }];
}

test("Individual Product/Post context validates ownership and materializes one fixed root entity", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-individual-builder-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "individual-builder-a" };
  try {
    const individualService = createIndividualLayoutsService(scope);
    const product = await individualService.create(productIdentity, { sections: sections("product") });
    const post = await individualService.create(postIdentity, { sections: sections("post") });
    const discoveryService = createContentDiscoveryService(null, {
      resolveContexts: async (input) => input.descriptor.source === "product" ? [productContext] : [postContext],
    });

    const productResult = await resolveIndividualBuilderContext({
      documentId: product.document.documentId,
      individual: encodeIndividualBuilderIdentity(productIdentity),
      scope,
      individualService,
      discoveryService,
    });
    expect(productResult.context).toMatchObject({
      mode: "individual", familyLabel: "Individual Product Layout", title: "Wool Bblend Coat",
      availability: "published", storefrontHref: "/product/wool-bblend-coat", identity: productIdentity,
    });
    expect(JSON.stringify(productResult.renderLayout)).toContain("Wool Bblend Coat");
    expect(JSON.stringify(productResult.renderLayout)).toContain("65.00");
    expect(JSON.stringify(productResult.renderLayout)).toContain("wool.jpg");
    expect(JSON.stringify(productResult.renderLayout)).toContain("/product/wool-bblend-coat");

    const postResult = await resolveIndividualBuilderContext({
      documentId: post.document.documentId,
      individual: encodeIndividualBuilderIdentity(postIdentity),
      scope,
      individualService,
      discoveryService,
    });
    expect(postResult.context).toMatchObject({
      familyLabel: "Individual Post Layout", title: "The Ultimate Guide to Performance Testing",
      availability: "unpublished", identity: postIdentity,
    });
    expect(JSON.stringify(postResult.renderLayout)).toContain("Performance body");
    expect(JSON.stringify(postResult.renderLayout)).toContain("performance.jpg");

    const assignmentBefore = await individualService.getAssignment(productIdentity);
    await updateDynamicBuilderDocument(product.document.documentId, {
      sections: sections("product"), displayName: "Edited authored document",
    }, scope);
    expect(await individualService.getAssignment(productIdentity)).toEqual(assignmentBefore);
    expect((await readDynamicBuilderDocument(product.document.documentId, scope)).displayName)
      .toBe("Edited authored document");
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("missing content preserves raw authored editing while foreign/mismatched ownership fails", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-individual-missing-"));
  const previous = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scopeA = { websiteId: "individual-missing-a" };
  const scopeB = { websiteId: "individual-missing-b" };
  try {
    const serviceA = createIndividualLayoutsService(scopeA);
    const created = await serviceA.create(productIdentity, { sections: sections("product") });
    const missingDiscovery = createContentDiscoveryService(null, { resolveContexts: async () => [] });
    const missing = await resolveIndividualBuilderContext({
      documentId: created.document.documentId,
      individual: encodeIndividualBuilderIdentity(productIdentity),
      scope: scopeA,
      individualService: serviceA,
      discoveryService: missingDiscovery,
    });
    expect(missing.unavailable).toBe(true);
    expect(missing.context).toMatchObject({ availability: "missing", title: null, slug: null });
    expect(missing.renderLayout).toEqual(missing.layout);
    expect(await serviceA.getAssignment(productIdentity)).toMatchObject(productIdentity);
    await expect(readDynamicBuilderDocument(created.document.documentId, scopeA)).resolves.toBeTruthy();

    await expect(resolveIndividualBuilderContext({
      documentId: created.document.documentId,
      individual: encodeIndividualBuilderIdentity(productIdentity),
      scope: scopeB,
      individualService: createIndividualLayoutsService(scopeB),
      discoveryService: missingDiscovery,
    })).rejects.toBeInstanceOf(IndividualBuilderContextMismatchError);
    await expect(resolveIndividualBuilderContext({
      documentId: created.document.documentId,
      individual: encodeIndividualBuilderIdentity(postIdentity),
      scope: scopeA,
      individualService: serviceA,
      discoveryService: missingDiscovery,
    })).rejects.toBeInstanceOf(IndividualBuilderContextMismatchError);
    expect(() => decodeIndividualBuilderIdentity("not-an-individual-context"))
      .toThrow(IndividualBuilderContextMismatchError);
  } finally {
    if (previous === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previous;
    await rm(dataDir, { recursive: true, force: true });
  }
});
