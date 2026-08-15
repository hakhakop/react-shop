import { expect, test } from "@playwright/test";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import { createRoutingTemplatesService } from "@/lib/routingTemplatesService.server";
import {
  TemplateBuilderContextMismatchError,
  TemplatePreviewIdentityNotFoundError,
  resolveTemplateBuilderContext,
} from "@/lib/templateBuilderContext.server";

function item(id: string, title: string): DynamicItemContext {
  return { id, fields: { title: { type: "string", value: title } } };
}

const boundSections = [{
  id: "root",
  kind: "contentLayout" as const,
  title: "",
  background: "transparent",
  visible: true,
  layout: "whole" as const,
  layoutColumns: 1,
  layoutRows: 1,
  layoutItems: [{
    id: "column",
    rowId: "row",
    rowLayout: "whole",
    blocks: [{
      id: "title",
      kind: "heading" as const,
      headingText: "Fallback title",
      dynamicBindings: { headingText: { path: "title", valueType: "string" as const } },
    }],
  }],
}];

test("template-aware context validates ownership and rematerializes Product/Post roots", async () => {
  const dataDir = await mkdtemp(path.join(os.tmpdir(), "webpages-template-context-"));
  process.env.WEBPAGES_DATA_DIR = dataDir;
  const scope = { websiteId: "site-a" };
  const service = createRoutingTemplatesService(scope);
  const product = await service.create({ name: "Product Preview", contentType: "product", layout: { sections: boundSections } });
  const post = await service.create({ name: "Post Preview", contentType: "post", layout: { sections: boundSections } });
  const resolveContexts = async ({ descriptor }: { descriptor: { source: string } }) =>
    descriptor.source === "product"
      ? [item("101", "Wool Blend Coat"), item("102", "Pink Jumper")]
      : [item("post-a", "Customer Story: Ambitech"), item("post-b", "Second Story")];

  const firstProduct = await resolveTemplateBuilderContext({
    documentId: product.template.layoutId,
    routingTemplateId: product.template.id,
    scope,
    resolveContexts: resolveContexts as never,
  });
  expect(firstProduct.context.familyLabel).toBe("Single Product");
  expect(firstProduct.context.provider).toBe("woocommerce");
  expect(firstProduct.previewIdentity?.contentId).toBe("101");
  expect(firstProduct.candidates.map((candidate) => candidate.label)).toEqual(["Wool Blend Coat", "Pink Jumper"]);
  expect(firstProduct.renderLayout.sections[0]?.layoutItems?.[0]?.blocks?.[0]?.headingText).toBe("Wool Blend Coat");

  const secondProduct = await resolveTemplateBuilderContext({
    documentId: product.template.layoutId,
    routingTemplateId: product.template.id,
    previewIdentity: { provider: "woocommerce", contentType: "product", contentId: "102" },
    scope,
    resolveContexts: resolveContexts as never,
  });
  expect(secondProduct.renderLayout.sections[0]?.layoutItems?.[0]?.blocks?.[0]?.headingText).toBe("Pink Jumper");

  const firstPost = await resolveTemplateBuilderContext({
    documentId: post.template.layoutId,
    routingTemplateId: post.template.id,
    scope,
    resolveContexts: resolveContexts as never,
  });
  expect(firstPost.context.familyLabel).toBe("Single Post");
  expect(firstPost.context.provider).toBe("wordpress");
  expect(firstPost.renderLayout.sections[0]?.layoutItems?.[0]?.blocks?.[0]?.headingText).toBe("Customer Story: Ambitech");

  await expect(resolveTemplateBuilderContext({
    documentId: post.template.layoutId,
    routingTemplateId: product.template.id,
    scope,
    resolveContexts: resolveContexts as never,
  })).rejects.toBeInstanceOf(TemplateBuilderContextMismatchError);
  await expect(resolveTemplateBuilderContext({
    documentId: product.template.layoutId,
    routingTemplateId: product.template.id,
    previewIdentity: { provider: "woocommerce", contentType: "product", contentId: "999" },
    scope,
    resolveContexts: resolveContexts as never,
  })).rejects.toBeInstanceOf(TemplatePreviewIdentityNotFoundError);
  await expect(resolveTemplateBuilderContext({
    documentId: product.template.layoutId,
    routingTemplateId: product.template.id,
    scope: { websiteId: "site-b" },
    resolveContexts: resolveContexts as never,
  })).rejects.toThrow();

  const storedLayouts = await readFile(path.join(dataDir, "websites", "site-a", "builder-layouts.json"), "utf8");
  expect(storedLayouts).not.toContain("Wool Blend Coat");
  expect(storedLayouts).not.toContain("Pink Jumper");
  expect(storedLayouts).not.toContain("Customer Story: Ambitech");
});

