import { expect, test } from "@playwright/test";
import { createContentDiscoveryService } from "@/lib/contentDiscovery.server";
import { normalizeWooCommerceProductContext } from "@/lib/woocommerceDynamicContentProvider.server";
import {
  compileWordPressPostCollectionQuery,
  compileWordPressPostSingleQuery,
  normalizeWordPressPostContext,
} from "@/lib/wordpressDynamicContentProvider.server";
import type { DynamicContentProviderInput } from "@/lib/dynamicContentProviders.server";
import type { SaaSWebsite } from "@/lib/websites";

const websiteA = { id: "website-a" } as unknown as SaaSWebsite;
const websiteB = { id: "website-b" } as unknown as SaaSWebsite;

const productContext = (slug = "renamed-product", status = "publish") =>
  normalizeWooCommerceProductContext({
    id: 41,
    name: "Canonical Product",
    slug,
    status,
    images: [{ src: "https://a.example/product.jpg" }],
    permalink: `https://cms.example/product/${slug}/`,
  });

const postContext = (slug = "renamed-post", status = "publish") =>
  normalizeWordPressPostContext({
    id: "cG9zdDo3",
    databaseId: 7,
    title: "Canonical Post",
    slug,
    status,
    featuredImage: { node: { sourceUrl: "https://a.example/post.jpg" } },
    link: `https://cms.example/${slug}/`,
  });

test("stable Product/Post lookup uses persisted IDs and returns lightweight canonical metadata", async () => {
  const calls: DynamicContentProviderInput[] = [];
  const service = createContentDiscoveryService(websiteA, {
    resolveContexts: async (input) => {
      calls.push(input);
      return input.descriptor.source === "product"
        ? [productContext()]
        : [postContext()];
    },
  });
  const product = await service.resolveByStableIdentity({
    provider: "woocommerce", contentType: "product", contentId: "41",
  });
  const post = await service.resolveByStableIdentity({
    provider: "wordpress", contentType: "post", contentId: "cG9zdDo3",
  });

  expect(calls.map((call) => call.descriptor.query)).toEqual([{ id: 41 }, { id: "cG9zdDo3" }]);
  expect(calls.every((call) => call.website === websiteA)).toBe(true);
  expect(product).toMatchObject({
    availability: "published",
    identity: { provider: "woocommerce", contentType: "product", contentId: "41" },
    item: { slug: "renamed-product", storefrontHref: "/product/renamed-product" },
  });
  expect(post).toMatchObject({
    availability: "published",
    identity: { provider: "wordpress", contentType: "post", contentId: "cG9zdDo3" },
    item: { slug: "renamed-post", storefrontHref: "/renamed-post" },
  });
  expect(JSON.stringify(product.availability === "missing" ? product : product.item))
    .not.toContain("https://cms.example");
  expect(JSON.stringify(post.availability === "missing" ? post : post.item))
    .not.toContain("https://cms.example");
});

test("missing and unpublished entities remain distinct without slug fallback", async () => {
  const missing = createContentDiscoveryService(websiteA, { resolveContexts: async () => [] });
  await expect(missing.resolveByStableIdentity({
    provider: "wordpress", contentType: "post", contentId: "missing-id",
  })).resolves.toEqual({
    availability: "missing",
    identity: { provider: "wordpress", contentType: "post", contentId: "missing-id" },
  });

  const drafts = createContentDiscoveryService(websiteA, {
    resolveContexts: async (input) => input.descriptor.source === "product"
      ? [productContext("draft-product", "draft")]
      : [postContext("draft-post", "draft")],
  });
  expect((await drafts.resolveByStableIdentity({
    provider: "woocommerce", contentType: "product", contentId: "41",
  })).availability).toBe("unpublished");
  expect((await drafts.resolveByStableIdentity({
    provider: "wordpress", contentType: "post", contentId: "cG9zdDo3",
  })).availability).toBe("unpublished");
});

test("recent and searched discovery compile provider-owned collection requests", async () => {
  const calls: DynamicContentProviderInput[] = [];
  const service = createContentDiscoveryService(websiteB, {
    resolveContexts: async (input) => {
      calls.push(input);
      return input.descriptor.source === "product" ? [productContext()] : [postContext()];
    },
  });
  const recentProducts = await service.discover({ family: "product", limit: 12 });
  const searchedPosts = await service.discover({ family: "post", query: "customer story", limit: 8 });
  expect(calls[0]).toMatchObject({
    website: websiteB,
    descriptor: { provider: "woocommerce", source: "product", mode: "collection", query: { quantity: 12 } },
  });
  expect(calls[1]).toMatchObject({
    website: websiteB,
    descriptor: { provider: "wordpress", source: "post", mode: "collection", query: {
      quantity: 8, search: "customer story",
    } },
  });
  expect(recentProducts[0]).toEqual({
    identity: { provider: "woocommerce", contentType: "product", contentId: "41" },
    title: "Canonical Product", slug: "renamed-product",
    thumbnail: "https://a.example/product.jpg",
    publicationState: "published", storefrontHref: "/product/renamed-product",
  });
  expect(searchedPosts[0]?.identity.contentId).toBe("cG9zdDo3");
  expect(JSON.stringify(recentProducts)).not.toContain("fields");
  expect(JSON.stringify(searchedPosts)).not.toContain("<p>");
  expect(JSON.stringify(searchedPosts)).not.toContain("fields");
});

test("WordPress provider compiles stable ID and server-side search as fixed GraphQL variables", () => {
  const stable = compileWordPressPostSingleQuery({ id: "cG9zdDo3" });
  expect(stable.query).toContain("post(id: $id, idType: ID)");
  expect(stable.variables).toEqual({ id: "cG9zdDo3" });
  const search = compileWordPressPostCollectionQuery({ search: "customer story", quantity: 9 });
  expect(search.variables.where).toMatchObject({ search: "customer story" });
  expect(search.query).not.toContain("customer story");
  expect(() => compileWordPressPostSingleQuery({ id: "cG9zdDo3", slug: "old-slug" }))
    .toThrow(/exactly one/);
});
