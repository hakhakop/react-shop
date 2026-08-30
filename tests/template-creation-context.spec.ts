import { expect, test } from "@playwright/test";
import type { BuilderEditorContext } from "@/lib/builderEditorContext";
import {
  deriveTemplateCreationContext,
  initialTemplatePageType,
  templateEditorSearchParams,
} from "@/lib/templateCreationContext";

function editorContext(input: {
  pageType: string;
  provider: string;
  contentType: string;
  contentId: string;
  label: string;
  href: string;
}): BuilderEditorContext {
  return {
    document: { id: "layout:builder:test", kind: "routing-template", displayName: "Current Canvas" },
    scope: { websiteId: "woolberry" },
    content: {
      mode: "preview",
      pageType: input.pageType,
      family: input.contentType,
      identity: { provider: input.provider, contentType: input.contentType, contentId: input.contentId },
      label: input.label,
      storefrontHref: input.href,
    },
    ownership: {},
    navigation: { returnHref: "/templates", returnLabel: "Back to Templates" },
    capabilities: { canChangePreview: true, canOpenFrontend: true, canEditAssignedTemplate: false },
  };
}

const cases = [
  {
    name: "regular WordPress single content",
    pageType: "singular:post",
    provider: "wordpress",
    contentType: "post",
    contentId: "15",
    label: "Performance Testing",
    href: "/performance-testing",
  },
  {
    name: "WooCommerce single content",
    pageType: "singular:product",
    provider: "woocommerce",
    contentType: "product",
    contentId: "4078",
    label: "Wool Blend Coat",
    href: "/product/wool-blend-coat",
  },
  {
    name: "taxonomy archive context",
    pageType: "taxonomy:product_cat",
    provider: "woocommerce",
    contentType: "product-category",
    contentId: "34",
    label: "Accessories",
    href: "/product-category/accessories",
  },
] as const;

for (const item of cases) {
  test(`new Template recognizes and preserves ${item.name}`, () => {
    const context = deriveTemplateCreationContext({ editorContext: editorContext(item) });
    expect(context).toEqual({
      pageType: item.pageType,
      previewIdentity: {
        provider: item.provider,
        contentType: item.contentType,
        contentId: item.contentId,
      },
      previewLabel: item.label,
      storefrontHref: item.href,
    });
    expect(initialTemplatePageType(cases.map((candidate) => candidate.pageType), context)).toBe(item.pageType);
    const params = templateEditorSearchParams({
      layoutId: "layout:builder:dynamic:00000000-0000-4000-8000-000000000001",
      templateId: "routing:template:00000000-0000-4000-8000-000000000002",
      websiteId: "woolberry",
      previewIdentity: context?.previewIdentity,
    });
    expect(params.get("previewProvider")).toBe(item.provider);
    expect(params.get("previewContentType")).toBe(item.contentType);
    expect(params.get("previewContentId")).toBe(item.contentId);
  });
}

test("unregistered canvas types fall back to the registry without inventing a branch", () => {
  const context = deriveTemplateCreationContext({
    editorContext: editorContext({ ...cases[0], pageType: "singular:unregistered" }),
  });
  expect(initialTemplatePageType(["singular:post", "singular:product"], context)).toBe("singular:post");
});

test("late registry and canvas context can derive a default without a stored product fallback", () => {
  expect(initialTemplatePageType([], undefined)).toBeUndefined();
  expect(initialTemplatePageType(["singular:post", "singular:page"], {
    pageType: "singular:page",
  })).toBe("singular:page");
});
