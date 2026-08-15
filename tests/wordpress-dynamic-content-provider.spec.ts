import { expect, test } from "@playwright/test";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import {
  compileWordPressPostCollectionQuery,
  compileWordPressPostSingleQuery,
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

test("compiles resolved raw terms into the existing category/tag filters", () => {
  const compiled = compileWordPressPostCollectionQuery({
    quantity: 3,
    filters: { rawTermIds: [2, 3, 5] },
  }, {
    resolvedRawTerms: [
      { taxonomy: "category", id: 2 },
      { taxonomy: "tag", id: 3 },
      { taxonomy: "category", id: 5 },
    ],
  });
  expect(compiled.variables.where).toMatchObject({
    categoryIn: [2, 5],
    tagIn: [3],
  });
});

test("resolves raw terms once before querying posts and fails on missing terms", async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ query: string; variables: Record<string, unknown> }> = [];
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(String(init?.body));
    requests.push(body);
    const data = body.query.includes("DynamicContentWordPressTerms")
      ? { terms: { nodes: [
        { databaseId: 2, __typename: "Category" },
        { databaseId: 3, __typename: "Tag" },
        { databaseId: 5, __typename: "Category" },
      ] } }
      : { posts: { nodes: [{ id: "post-1", title: "Resolved post", link: "https://tenant.example/post-1/" }] } };
    return new Response(JSON.stringify({ data }), { status: 200 });
  };
  try {
    const contexts = await resolveDynamicContentContexts({
      website: websiteWithGraphQL("https://active-tenant.example/graphql"),
      descriptor: {
        provider: "wordpress", source: "post", mode: "collection",
        query: { quantity: 3, filters: { rawTermIds: [2, 3, 5] } },
      },
    });
    expect(requests).toHaveLength(2);
    expect(requests[0].query).toContain("DynamicContentWordPressTerms");
    expect(requests[0].variables).toEqual({ where: { include: [2, 3, 5] } });
    expect(requests[1].variables.where).toMatchObject({ categoryIn: [2, 5], tagIn: [3] });
    expect(contexts).toHaveLength(1);

    globalThis.fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      const data = body.query.includes("DynamicContentWordPressTerms")
        ? { terms: { nodes: [{ databaseId: 2, __typename: "Category" }] } }
        : { posts: { nodes: [] } };
      return new Response(JSON.stringify({ data }), { status: 200 });
    };
    await expect(resolveDynamicContentContexts({
      website: websiteWithGraphQL("https://active-tenant.example/graphql"),
      descriptor: {
        provider: "wordpress", source: "post", mode: "collection",
        query: { filters: { rawTermIds: [2, 3] } },
      },
    })).rejects.toThrow(/did not resolve: 3/);
  } finally {
    globalThis.fetch = originalFetch;
  }
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
      databaseId: { type: "identifier", value: 1 },
      slug: { type: "string", value: "post-one" },
      title: { type: "string", value: "Post one" },
      content: { type: "richText", value: "<p>Body</p>" },
      excerpt: { type: "richText", value: "<p>Summary</p>" },
      date: { type: "string", value: "2026-08-01T10:00:00" },
      modifiedDate: { type: "string", value: "2026-08-02T10:00:00" },
      "origin.permalink": { type: "url", value: "https://tenant.example/post-one/" },
      "storefront.href": { type: "url", value: "/post-one" },
      link: { type: "url", value: "/post-one" },
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

test("normalizes provider-owned ACF media children without leaking the raw field", () => {
  const normalized = normalizeWordPressPostContext({
    id: "post-acf",
    title: "ACF post",
    acfFields: {
      intro_image: {
        node: {
          databaseId: 2192,
          sourceUrl: "https://tenant.example/intro.jpg",
          altText: "Intro image",
          caption: "<p>Caption</p>",
        },
      },
    },
  });
  expect(normalized.fields).toMatchObject({
    "acf.intro_image.url": { type: "url", value: "https://tenant.example/intro.jpg" },
    "acf.intro_image.alt": { type: "string", value: "Intro image" },
    "acf.intro_image.caption": { type: "richText", value: "<p>Caption</p>" },
    "acf.intro_image.id": { type: "identifier", value: 2192 },
    "acf.intro_image": {
      type: "media",
      value: { url: "https://tenant.example/intro.jpg", id: 2192, alt: "Intro image", caption: "<p>Caption</p>" },
    },
  });
  expect(JSON.stringify(normalized)).not.toContain("sourceUrl");
});

test("projects the live WPGraphQL ACF group and normalizes its media edge", () => {
  const compiled = compileWordPressPostCollectionQuery({ quantity: 3 });
  expect(compiled.query).toContain("acfFields: postAcfFields");
  expect(compiled.query).toContain("intro_image: introImage");
  const normalized = normalizeWordPressPostContext({
    id: "post-live-acf",
    acfFields: {
      intro_image: {
        node: {
          databaseId: 4321,
          sourceUrl: "https://store.webpages.am/wp-content/uploads/post-intro.jpg",
          altText: "Intro image alt",
          caption: "Intro caption",
        },
      },
    },
  });
  expect(normalized.fields).toMatchObject({
    "acf.intro_image.url": { type: "url", value: "https://store.webpages.am/wp-content/uploads/post-intro.jpg" },
    "acf.intro_image.alt": { type: "string", value: "Intro image alt" },
    "acf.intro_image.caption": { type: "richText", value: "Intro caption" },
    "acf.intro_image.id": { type: "identifier", value: 4321 },
  });
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

test("resolves one Post through the canonical provider boundary", async () => {
  const compiled = compileWordPressPostSingleQuery({ slug: "post-one" });
  expect(compiled.query).toContain("query DynamicContentWordPressPost($id: ID!)");
  expect(compiled.query).toContain("post(id: $id, idType: SLUG)");
  expect(compiled.variables).toEqual({ id: "post-one" });
  expect(() => compileWordPressPostSingleQuery({ slug: "post-one", graphql: "query Bad" }))
    .toThrow(/Unsupported WordPress post single query field: graphql/);

  const originalFetch = globalThis.fetch;
  let fetchCount = 0;
  globalThis.fetch = async () => {
    fetchCount += 1;
    return new Response(JSON.stringify({ data: { post: {
      id: "post-1", databaseId: 1, slug: "post-one", uri: "/post-one/",
      title: "Post one", content: "<p>Body</p>",
    } } }), { status: 200 });
  };
  try {
    const contexts = await resolveDynamicContentContexts({
      website: websiteWithGraphQL("https://active-tenant.example/graphql"),
      descriptor: { provider: "wordpress", source: "post", mode: "single", query: { slug: "post-one" } },
    });
    expect(fetchCount).toBe(1);
    expect(contexts).toHaveLength(1);
    expect(contexts[0].fields.title).toEqual({ type: "string", value: "Post one" });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Post provider projects internal navigation while preserving the origin permalink", () => {
  const normalized = normalizeWordPressPostContext({
    id: "post-42",
    databaseId: 42,
    slug: "customer-story-ambitech",
    title: "Customer Story: Ambitech",
    link: "https://cms.example/customer-story-ambitech/",
  });
  expect(normalized.fields.link).toEqual({ type: "url", value: "/customer-story-ambitech" });
  expect(normalized.fields["storefront.href"]).toEqual({ type: "url", value: "/customer-story-ambitech" });
  expect(normalized.fields["origin.permalink"]).toEqual({
    type: "url", value: "https://cms.example/customer-story-ambitech/",
  });
});

test("fails explicitly for unsupported provider, source, and malformed single query", async () => {
  const website = websiteWithGraphQL("https://active-tenant.example/graphql");

  await expect(resolveDynamicContentContexts({
    website,
    descriptor: { provider: "shopify", source: "product", mode: "collection" },
  })).rejects.toThrow(/Unsupported Dynamic Content provider: shopify/);

  await expect(resolveDynamicContentContexts({
    website,
    descriptor: { provider: "wordpress", source: "page", mode: "collection" },
  })).rejects.toThrow(/Unsupported WordPress Dynamic Content source: page/);

  await expect(resolveDynamicContentContexts({
    website,
    descriptor: { provider: "wordpress", source: "post", mode: "single" },
  })).rejects.toThrow(/query.slug must be a non-empty string/);
});
