import { expect, test } from "@playwright/test";
import { graphqlFetch } from "@/lib/graphql";
import { discoverWordPressContentSchema } from "@/lib/wordpressContentSchema.server";
import { wordpressContentSchemaCapabilities } from "@/lib/wordpressContentSchema";
import { resolveWordPressGenericContentContexts } from "@/lib/wordpressGenericContentProvider.server";

test("GraphQL requests fall back from /graphql to the query-string endpoint", async () => {
  const requested: string[] = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input) => {
    requested.push(String(input));
    if (requested.length === 1) return new Response("Not found", { status: 404 });
    return Response.json({ data: { viewer: null } });
  }) as typeof fetch;

  try {
    await expect(graphqlFetch("query { viewer { id } }", undefined, {
      endpoint: "https://wordpress.example/graphql",
    })).resolves.toEqual({ viewer: null });
    expect(requested).toEqual([
      "https://wordpress.example/graphql",
      "https://wordpress.example/?graphql",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("new WPGraphQL content types become inspector capabilities without a registry edit", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    if (url.endsWith("/graphql")) return new Response("Not found", { status: 404 });
    const body = JSON.parse(String(init?.body ?? "{}")) as { query?: string };
    if (body.query?.includes("WebPagesWordPressContentSchema")) {
      return Response.json({ data: {
        contentTypes: { nodes: [{
          name: "excursion",
          graphqlSingleName: "excursion",
          graphqlPluralName: "excursions",
          label: "Excursions",
        }] },
        taxonomies: { nodes: [] },
      } });
    }
    return Response.json({ errors: [{ message: "GraphQL introspection is disabled." }] });
  }) as typeof fetch;

  try {
    const schema = await discoverWordPressContentSchema({
      id: "future-type-test",
      cmsConnection: { graphqlUrl: "https://future.example/graphql" },
    } as never);
    expect(schema.introspectionAvailable).toBe(false);
    expect(schema.sources).toMatchObject([{
      kind: "contentType",
      name: "excursion",
      graphqlPluralName: "excursions",
    }]);
    expect(wordpressContentSchemaCapabilities(schema)).toContainEqual(expect.objectContaining({
      key: "wordpress-contentType-excursion-collection",
      label: "Excursions",
      provider: "wordpress",
      source: "content",
      defaultQuery: expect.objectContaining({
        sourceName: "excursion",
        graphqlPluralName: "excursions",
      }),
    }));
    expect(wordpressContentSchemaCapabilities(schema)).toContainEqual(expect.objectContaining({
      key: "wordpress-contentType-excursion-single",
      label: "Excursions (Single)",
      mode: "single",
      defaultQuery: expect.objectContaining({ sourceName: "excursion", quantity: 1 }),
    }));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("legacy YOOtheme taxonomy names resolve to the discovered source and preserve the selected term", async () => {
  const originalFetch = globalThis.fetch;
  let contentRequests = 0;
  globalThis.fetch = (async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as { query?: string };
    const query = body.query ?? "";
    if (query.includes("WebPagesWordPressContentSchema")) {
      return Response.json({ data: {
        contentTypes: { nodes: [] },
        taxonomies: { nodes: [{
          name: "accommodation_cat",
          graphqlSingleName: "accommodationCategory",
          graphqlPluralName: "accommodationCategories",
          label: "Accommodation Categories",
        }] },
      } });
    }
    if (query.includes("WebPagesWordPressType")) {
      return Response.json({ errors: [{ message: "GraphQL introspection is disabled." }] });
    }
    if (query.includes("WebPagesGenericWordPressContent")) {
      contentRequests += 1;
      if (query.includes("accommodationCategoryFields")) {
        return Response.json({ errors: [{ message: "Cannot query field accommodationCategoryFields." }] });
      }
      expect(query).toContain("accommodationCategories");
      return Response.json({ data: { accommodationCategories: { nodes: [
        { id: "term-6", databaseId: 6, name: "Norway" },
        { id: "term-24", databaseId: 24, name: "Germany" },
      ] } } });
    }
    throw new Error(`Unexpected test query: ${query}`);
  }) as typeof fetch;

  try {
    const contexts = await resolveWordPressGenericContentContexts({
      website: { id: "legacy-yootheme-taxonomy-test", cmsConnection: { graphqlUrl: "https://taxonomy.example/?graphql" } } as never,
      descriptor: {
        provider: "wordpress",
        source: "content",
        mode: "single",
        query: {
          graphqlRoot: "accommodationCats",
          yoothemeQueryName: "accommodationCats.customAccommodationCat",
          databaseId: 6,
          requestedFields: ["acf.accommodation_intro_image.url"],
        },
      },
    });
    expect(contentRequests).toBe(2);
    expect(contexts).toHaveLength(1);
    expect(contexts[0].fields.name).toEqual({ type: "string", value: "Norway" });
    expect(contexts[0].fields["acf.accommodation_intro_image.url"]).toBeUndefined();
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generic CPT materialization retains ACF fields while applying imported taxonomy terms", async () => {
  const originalFetch = globalThis.fetch;
  let contentQuery = "";
  globalThis.fetch = (async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as {
      query?: string;
      variables?: Record<string, unknown>;
    };
    const query = body.query ?? "";
    if (query.includes("WebPagesWordPressContentSchema")) {
      return Response.json({ data: {
        contentTypes: { nodes: [{
          name: "accommodation",
          graphqlSingleName: "accommodation",
          graphqlPluralName: "accommodations",
          label: "Accommodations",
        }] },
        taxonomies: { nodes: [
          {
            name: "accommodation_flag",
            graphqlSingleName: "accommodationFlag",
            graphqlPluralName: "accommodationFlags",
            label: "Accommodation Flags",
          },
          {
            name: "accommodation_cat",
            graphqlSingleName: "accommodationCategory",
            graphqlPluralName: "accommodationCategories",
            label: "Accommodation Categories",
          },
        ] },
      } });
    }
    if (query.includes("WebPagesWordPressType")) {
      return Response.json({ errors: [{ message: "GraphQL introspection is disabled." }] });
    }
    if (query.includes("WebPagesGenericWordPressTerms")) {
      expect(body.variables).toMatchObject({ where: { include: [43] } });
      return Response.json({ data: { terms: { nodes: [
        { databaseId: 43, __typename: "AccommodationFlag" },
      ] } } });
    }
    if (query.includes("WebPagesGenericWordPressContent")) {
      contentQuery = query;
      if (query.includes("NodeWithExcerpt")) {
        return Response.json({ errors: [{
          message: "Fragment cannot be spread here as objects of type \"Accommodation\" can never be of type \"NodeWithExcerpt\".",
        }] });
      }
      return Response.json({ data: { accommodations: { nodes: [
        {
          id: "ordinary",
          title: "Ordinary stay",
          accommodationFlags: { nodes: [] },
          accommodationCategories: { nodes: [{ name: "Coast" }] },
          accommodationFields: { accommodationTeaserTitle: null, accommodationTeaserImageBg: null },
        },
        {
          id: "featured",
          title: "Featured stay",
          accommodationFlags: { nodes: [{ databaseId: 43 }] },
          accommodationCategories: { nodes: [{ name: "Highlands" }] },
          accommodationFields: {
            accommodationTeaserTitle: "Featured hero",
            accommodationTeaserImageBg: { node: {
              databaseId: 88,
              sourceUrl: "https://wordpress.example/hero.jpg",
              altText: "Hero",
            } },
          },
        },
      ] } } });
    }
    throw new Error(`Unexpected test query: ${query}`);
  }) as typeof fetch;

  try {
    const contexts = await resolveWordPressGenericContentContexts({
      website: {
        id: "hero-acf-test",
        cmsConnection: { graphqlUrl: "https://hero.example/?graphql" },
      } as never,
      descriptor: {
        provider: "wordpress",
        source: "content",
        mode: "collection",
        query: {
          graphqlRoot: "accommodations",
          metaTaxonomy: "accommodation_cat",
          quantity: 3,
          sourceQuery: { arguments: { terms: [43] } },
          requestedFields: [
            "acf.accommodation_teaser_title",
            "acf.accommodation_teaser_image_bg.url",
            "acf.accommodation_teaser_image_bg.alt",
          ],
        },
      },
    });
    expect(contentQuery).toContain("accommodationFlags { nodes { databaseId } }");
    expect(contentQuery).toContain("accommodationCategories { nodes { name uri } }");
    expect(contentQuery).toContain("accommodationFields { accommodationTeaserTitle");
    expect(contexts).toHaveLength(1);
    expect(contexts[0].fields).toMatchObject({
      title: { type: "string", value: "Featured stay" },
      metaString: { type: "string", value: "Highlands" },
      "acf.accommodation_teaser_title": { type: "string", value: "Featured hero" },
      "acf.accommodation_teaser_image_bg.url": { type: "url", value: "https://wordpress.example/hero.jpg" },
      "acf.accommodation_teaser_image_bg.alt": { type: "string", value: "Hero" },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("generic taxonomy materialization requests ACF media from the taxonomy field group", async () => {
  const originalFetch = globalThis.fetch;
  let contentQuery = "";
  globalThis.fetch = (async (_input, init) => {
    const body = JSON.parse(String(init?.body ?? "{}")) as { query?: string };
    const query = body.query ?? "";
    if (query.includes("WebPagesWordPressContentSchema")) {
      return Response.json({ data: {
        contentTypes: { nodes: [] },
        taxonomies: { nodes: [{
          name: "discover_tag",
          graphqlSingleName: "discoverTag",
          graphqlPluralName: "discoverTags",
          label: "Discover Tags",
        }] },
      } });
    }
    if (query.includes("WebPagesWordPressType")) {
      return Response.json({ errors: [{ message: "GraphQL introspection is disabled." }] });
    }
    if (query.includes("WebPagesGenericWordPressContent")) {
      contentQuery = query;
      return Response.json({ data: { discoverTags: { nodes: [{
        id: "tag-44",
        databaseId: 44,
        name: "Exclusive Architecture",
        discoverTagFields: {
          imageIntro: { node: { databaseId: 144, sourceUrl: "https://wordpress.example/tag-intro.jpg", altText: "Architecture" } },
          imageFeatured: { node: { databaseId: 244, sourceUrl: "https://wordpress.example/tag-featured.jpg", altText: "" } },
        },
      }] } } });
    }
    throw new Error(`Unexpected test query: ${query}`);
  }) as typeof fetch;

  try {
    const contexts = await resolveWordPressGenericContentContexts({
      website: { id: "taxonomy-acf-test", cmsConnection: { graphqlUrl: "https://taxonomy.example/?graphql" } } as never,
      descriptor: {
        provider: "wordpress",
        source: "content",
        mode: "single",
        query: {
          graphqlRoot: "discoverTags",
          databaseId: 44,
          requestedFields: ["acf.image_intro.url", "acf.image_intro.alt", "acf.image_featured.url"],
        },
      },
    });
    expect(contentQuery).toContain("discoverTagFields { imageIntro");
    expect(contentQuery).toContain("imageFeatured");
    expect(contexts[0].fields).toMatchObject({
      name: { type: "string", value: "Exclusive Architecture" },
      "acf.image_intro.url": { type: "url", value: "https://wordpress.example/tag-intro.jpg" },
      "acf.image_intro.alt": { type: "string", value: "Architecture" },
      "acf.image_featured.url": { type: "url", value: "https://wordpress.example/tag-featured.jpg" },
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
