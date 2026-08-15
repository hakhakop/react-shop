import { expect, test } from "@playwright/test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  builderLayoutDocumentId,
  resolveLayout,
  type IndividualLayoutOverride,
  type SingularRouteContext,
} from "@/lib/layoutRouting";
import {
  ensurePostSingleRoutingCompatibility,
  ensureProductSingleRoutingCompatibility,
  readLayoutRoutingRegistry,
  writeLayoutRoutingRegistry,
} from "@/lib/layoutRoutingStore.server";
import { readBuilderLayoutStore } from "@/lib/builderLayouts";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

test("website-scoped Product compatibility is idempotent and overrides stay identity-based", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-routing-"));
  const previousDataDir = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const websiteId = "routing-proof-site";
  const websiteDir = path.join(dataDir, "websites", websiteId);

  try {
    await import("node:fs/promises").then(({ mkdir }) => mkdir(websiteDir, { recursive: true }));
    await writeFile(path.join(websiteDir, "builder-layouts.json"), JSON.stringify({
      "product-single": {
        version: 1,
        key: "product-single",
        page: "product-single",
        targetType: "template",
        template: "product-single",
        sections: [{ id: "product", kind: "content", visible: true }],
        updatedAt: "2026-08-15T00:00:00.000Z",
      },
    }), "utf8");

    const first = await ensureProductSingleRoutingCompatibility({ websiteId });
    const second = await ensureProductSingleRoutingCompatibility({ websiteId });
    expect(first.routingTemplates).toHaveLength(1);
    expect(second.routingTemplates).toHaveLength(1);
    expect(JSON.parse(await readFile(path.join(websiteDir, "builder-routing.json"), "utf8")))
      .not.toHaveProperty("resolvedProduct");

    const context: SingularRouteContext = {
      view: "singular",
      provider: "woocommerce",
      contentType: "product",
      contentId: "product-stable-42",
      databaseId: 42,
      slug: "first-slug",
      uri: "/product/first-slug",
      taxonomyTerms: [],
    };
    const override: IndividualLayoutOverride = {
      provider: context.provider,
      contentType: context.contentType,
      contentId: context.contentId,
      layoutId: builderLayoutDocumentId("page:individual-product"),
    };
    await writeLayoutRoutingRegistry({ ...second, individualOverrides: [override] }, { websiteId });
    const persisted = await readLayoutRoutingRegistry({ websiteId });
    expect(resolveLayout({
      context: { ...context, slug: "renamed", uri: "/product/renamed" },
      individualOverrides: persisted.individualOverrides,
      routingTemplates: persisted.routingTemplates,
      nativeFallbackAvailable: true,
    })).toMatchObject({ outcome: "individual", layoutId: override.layoutId });
    expect(resolveLayout({
      context,
      individualOverrides: [],
      routingTemplates: persisted.routingTemplates,
      nativeFallbackAvailable: true,
    })).toMatchObject({
      outcome: "routing-template",
      layoutId: builderLayoutDocumentId("product-single"),
    });
  } finally {
    if (previousDataDir === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previousDataDir;
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("Post compatibility is persistent, idempotent, and inherits one canonical context", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-post-routing-"));
  const previousDataDir = process.env.WEBPAGES_DATA_DIR;
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const websiteId = "post-routing-proof";
  try {
    const first = await ensurePostSingleRoutingCompatibility({ websiteId });
    const second = await ensurePostSingleRoutingCompatibility({ websiteId });
    expect(first.routingTemplates).toHaveLength(1);
    expect(second.routingTemplates).toHaveLength(1);
    const layouts = await readBuilderLayoutStore({ websiteId });
    expect(layouts["post-single"]).toBeTruthy();
    const materialized = await materializeBuilderDynamicContent(layouts["post-single"]!, {
      rootContext: { id: "post-stable-7", fields: {
        title: { type: "string", value: "Canonical Post Title" },
        content: { type: "richText", value: "<p>Canonical body</p>" },
        "featuredImage.url": { type: "url", value: "https://example.test/post.jpg" },
        "featuredImage.alt": { type: "string", value: "Canonical image" },
      } },
    });
    const serialized = JSON.stringify(materialized.renderLayout);
    expect(serialized).toContain("Canonical Post Title");
    expect(serialized).toContain("Canonical body");
    expect(serialized).toContain("post.jpg");
    const persisted = await readFile(path.join(dataDir, "websites", websiteId, "builder-routing.json"), "utf8");
    expect(persisted).not.toContain("Canonical Post Title");
    expect(JSON.stringify(layouts)).not.toContain("Canonical Post Title");
  } finally {
    if (previousDataDir === undefined) delete process.env.WEBPAGES_DATA_DIR;
    else process.env.WEBPAGES_DATA_DIR = previousDataDir;
    await rm(dataDir, { recursive: true, force: true });
  }
});
