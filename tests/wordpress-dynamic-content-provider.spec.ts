import { expect, test } from "@playwright/test";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import {
  compileWordPressPostCollectionQuery,
  normalizeWordPressPostContext,
} from "@/lib/wordpressDynamicContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

const websiteWithGraphQL = (graphqlUrl: string) => ({
  cmsConnection: {
    provider: "wordpress",
    siteUrl: "https://tenant.example",
    graphqlUrl,
  },
}) as unknown as SaaSWebsite;

test("compiles the approved structured Custom Posts query into fixed text and variables", () => {
  const compiled = compileWordPressPostCollectionQuery({
    start: 2,
    quantity: 3,
    order: "title",
    direction: "asc",
    filters: {
      authors: [8, "author-node"],
      categories: [4],
      tags: ["tag-node"],
      terms: [{ taxonomy: "tag", ids: [9] }],
      termMatch: "any",
    },
  });

  expect(compiled.start).toBe(2);
  expect(compiled.quantity).toBe(3);
  expect(compiled.query).toContain("query DynamicContentWordPressPosts");
  expect(compiled.query).toContain("posts(first: $first, where: $where)");
  expect(compiled.variables).toEqual({
    first: 5,
    where: {
      orderby: [{ field: "TITLE", order: "ASC" }],
      authorIn: [8, "author-node"],
      categoryIn: [4],
      tagIn: ["tag-node", 9],
    },
  });
});

test("rejects unsupported query keys instead of accepting document-supplied GraphQL", () => {
  const injectedText = "mutation DeleteEverything { deleteAll }";
  expect(() => compileWordPressPostCollectionQuery({
    quantity: 2,
    graphql: injectedText,
  })).toThrow(/Unsupported WordPress post collection query field: graphql/);

  const approved = compileWordPressPostCollectionQuery({ quantity: 2 });
  expect(approved.query).not.toContain(injectedText);
  expect(JSON.stringify(approved.variables)).not.toContain(injectedText);
});

test("rejects unsupported term matching and an unbounded start/quantity window", () => {
  expect(() => compileWordPressPostCollectionQuery({
    filters: { termMatch: "all" },
  })).toThrow(/termMatch must be one of: any/);
  expect(() => compileWordPressPostCollectionQuery({
    start: 90,
    quantity: 11,
  })).toThrow(/cannot exceed 100/);
});

test("normalizes only canonical post fields", () => {
  const rawPost = {
    id: "post-1",
    databaseId: 1,
    title: "Post one",
    content: "<p>Body</p>",
    excerpt: "<p>Summary</p>",
    date: "2026-08-01T10:00:00",
    modified: "2026-08-02T10:00:00",
    slug: "post-one",
    status: "publish",
    link: "https://tenant.example/post-one/",
    author: { node: { id: "author-1", databaseId: 7, name: "Ada", slug: "ada" } },
    categories: { nodes: [{ id: "category-1", databaseId: 4, name: "News", slug: "news" }] },
    tags: { nodes: [{ id: "tag-1", name: "Launch", slug: "launch" }] },
    featuredImage: {
      node: {
        id: "media-1",
        databaseId: 30,
        sourceUrl: "https://tenant.example/image.jpg",
        altText: "Post image",
        caption: "<p>Image caption</p>",
      },
    },
    rawOnlySecret: "must-not-leak",
  };
  const normalized = normalizeWordPressPostContext(rawPost);

  expect(normalized).toEqual({
    id: "post-1",
    fields: {
      id: { type: "identifier", value: "post-1" },
      title: { type: "string", value: "Post one" },
      content: { type: "richText", value: "<p>Body</p>" },
      excerpt: { type: "richText", value: "<p>Summary</p>" },
      date: { type: "string", value: "2026-08-01T10:00:00" },
      modifiedDate: { type: "string", value: "2026-08-02T10:00:00" },
      link: { type: "url", value: "https://tenant.example/post-one/" },
      meta: {
        type: "metadata",
        value: {
          slug: "post-one",
          status: "publish",
          author: {
            id: "author-1",
            databaseId: 7,
            name: "Ada",
            slug: "ada",
          },
        },
      },
      categories: {
        type: "metadata",
        value: {
          items: [{
            id: "category-1",
            databaseId: 4,
            name: "News",
            slug: "news",
          }],
        },
      },
      tags: {
        type: "metadata",
        value: {
          items: [{ id: "tag-1", name: "Launch", slug: "launch" }],
        },
      },
      "featuredImage.url": {
        type: "url",
        value: "https://tenant.example/image.jpg",
      },
      featuredImage: {
        type: "media",
        value: {
          url: "https://tenant.example/image.jpg",
          id: "media-1",
          alt: "Post image",
          caption: "<p>Image caption</p>",
        },
      },
      "featuredImage.alt": { type: "string", value: "Post image" },
      "featuredImage.caption": {
        type: "richText",
        value: "<p>Image caption</p>",
      },
    },
  });
  expect(JSON.stringify(normalized)).not.toContain("rawOnlySecret");
  expect(JSON.stringify(normalized)).not.toContain("must-not-leak");
});

test("uses the active website endpoint and normalizes multiple provider posts", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestBody: { query?: string; variables?: Record<string, unknown> } = {};

  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestBody = JSON.parse(String(init?.body));
    return new Response(JSON.stringify({
      data: {
        posts: {
          nodes: [
            {
              id: "post-a",
              title: "First",
              link: "https://tenant.example/first/",
              rawProviderObject: { secret: true },
            },
            {
              id: "post-b",
              title: "Second",
              excerpt: "<p>Second summary</p>",
            },
          ],
        },
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const contexts = await resolveDynamicContentContexts({
      website: websiteWithGraphQL("https://active-tenant.example/graphql"),
      descriptor: {
        provider: "wordpress",
        source: "post",
        mode: "collection",
        query: { quantity: 2, order: "date", direction: "desc" },
      },
    });

    expect(requestedUrl).toBe("https://active-tenant.example/graphql");
    expect(requestBody.query).toContain("DynamicContentWordPressPosts");
    expect(requestBody.variables).toEqual({
      first: 2,
      where: { orderby: [{ field: "DATE", order: "DESC" }] },
    });
    expect(contexts).toHaveLength(2);
    expect(contexts[0].fields.title).toEqual({ type: "string", value: "First" });
    expect(contexts[1].fields.excerpt).toEqual({
      type: "richText",
      value: "<p>Second summary</p>",
    });
    expect(JSON.stringify(contexts)).not.toContain("rawProviderObject");
    expect(JSON.stringify(contexts)).not.toContain("secret");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("fails explicitly for unsupported provider, source, and mode", async () => {
  const website = websiteWithGraphQL("https://active-tenant.example/graphql");

  await expect(resolveDynamicContentContexts({
    website,
    descriptor: { provider: "woocommerce", source: "product", mode: "collection" },
  })).rejects.toThrow(/Unsupported Dynamic Content provider: woocommerce/);

  await expect(resolveDynamicContentContexts({
    website,
    descriptor: { provider: "wordpress", source: "page", mode: "collection" },
  })).rejects.toThrow(/Unsupported WordPress Dynamic Content source: page/);

  await expect(resolveDynamicContentContexts({
    website,
    descriptor: { provider: "wordpress", source: "post", mode: "single" },
  })).rejects.toThrow(/Unsupported WordPress post Dynamic Content mode: single/);
});
