import { expect, test } from "@playwright/test";
import type { BuilderLayout, BuilderLayoutBlock } from "@/lib/builderLayouts";
import {
  dynamicGridRenderItemId,
  materializeBuilderDynamicContent,
  type DynamicContentContextResolver,
} from "@/lib/builderDynamicContentMaterializer.server";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import type { SaaSWebsite } from "@/lib/websites";

const proofLayout = (): BuilderLayout => ({
  version: 1,
  key: "page:dynamic-grid-proof",
  page: "page:dynamic-grid-proof",
  updatedAt: "2026-08-14T00:00:00.000Z",
  sections: [{
    id: "proof-section",
    kind: "content",
    title: "Dynamic Grid proof",
    background: "#fff",
    visible: true,
    rows: [{
      id: "proof-row",
      layout: "1-col",
      columns: [{
        id: "proof-column",
        elements: [{
          id: "proof-grid",
          kind: "grid",
          gridGap: "large",
          gridCardVariant: "primary",
          gridContentPadding: "large",
          gridItems: [{
            id: "post-card-template",
            title: "Static fallback title",
            text: "Static fallback excerpt",
            imageUrl: "/fallback.jpg",
            imageAlt: "Static fallback image",
            buttonLabel: "Read More",
            buttonUrl: "/fallback",
            buttonStyle: "primary",
            cardVariant: "primary",
            cardSize: "large",
            typography: { title: { fontWeight: 700 } },
            dynamicContext: {
              provider: "wordpress",
              source: "post",
              mode: "collection",
              query: { quantity: 3, order: "date", direction: "desc" },
            },
            dynamicBindings: {
              title: { path: "title", valueType: "string" },
              text: { path: "excerpt", valueType: "richText" },
              imageUrl: { path: "featuredImage.url", valueType: "url" },
              imageAlt: { path: "featuredImage.alt", valueType: "string" },
              buttonUrl: { path: "link", valueType: "url" },
            },
          }],
        }],
      }],
    }],
  }],
});

const postContext = (index: number): DynamicItemContext => ({
  id: `post-${index}`,
  fields: {
    id: { type: "identifier", value: `post-${index}` },
    title: { type: "string", value: `Post ${index}` },
    excerpt: { type: "richText", value: `<p>Excerpt ${index}</p>` },
    "featuredImage.url": {
      type: "url",
      value: `https://cms.example/post-${index}.jpg`,
    },
    "featuredImage.alt": { type: "string", value: `Image ${index}` },
    link: { type: "url", value: `https://cms.example/post-${index}/` },
  },
});

const proofResolver = (contexts: DynamicItemContext[]): DynamicContentContextResolver =>
  async ({ descriptor }) => {
    expect(descriptor).toEqual({
      provider: "wordpress",
      source: "post",
      mode: "collection",
      query: { quantity: 3, order: "date", direction: "desc" },
    });
    return contexts;
  };

const gridBlock = (layout: BuilderLayout) =>
  layout.sections[0].rows?.[0].columns[0].elements[0] as BuilderLayoutBlock;

test("one authored Grid template transiently expands into three ordinary cards", async () => {
  const authored = proofLayout();
  const authoredBefore = JSON.stringify(authored);
  const template = gridBlock(authored).gridItems?.[0];
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver([postContext(1), postContext(2), postContext(3)]),
  });
  const cards = gridBlock(result.renderLayout).gridItems ?? [];

  expect(cards).toHaveLength(3);
  expect(cards.map((item) => item.title)).toEqual(["Post 1", "Post 2", "Post 3"]);
  expect(cards.map((item) => item.text)).toEqual([
    "<p>Excerpt 1</p>",
    "<p>Excerpt 2</p>",
    "<p>Excerpt 3</p>",
  ]);
  expect(cards.map((item) => item.imageUrl)).toEqual([
    "https://cms.example/post-1.jpg",
    "https://cms.example/post-2.jpg",
    "https://cms.example/post-3.jpg",
  ]);
  expect(cards.map((item) => item.buttonUrl)).toEqual([
    "https://cms.example/post-1/",
    "https://cms.example/post-2/",
    "https://cms.example/post-3/",
  ]);
  expect(cards.map((item) => item.buttonLabel)).toEqual([
    "Read More",
    "Read More",
    "Read More",
  ]);
  expect(cards.every((item) => item.buttonStyle === template?.buttonStyle)).toBe(true);
  expect(cards.every((item) => item.cardVariant === template?.cardVariant)).toBe(true);
  expect(cards.every((item) => item.cardSize === template?.cardSize)).toBe(true);
  expect(cards.every((item) => item.typography === template?.typography)).toBe(true);
  expect(cards.every((item) => !item.dynamicContext && !item.dynamicBindings)).toBe(true);
  expect(cards.map((item) => item.id)).toEqual([
    dynamicGridRenderItemId("post-card-template", "post-1"),
    dynamicGridRenderItemId("post-card-template", "post-2"),
    dynamicGridRenderItemId("post-card-template", "post-3"),
  ]);
  expect(gridBlock(result.renderLayout).gridGap).toBe("large");
  expect(gridBlock(result.renderLayout).gridCardVariant).toBe("primary");
  expect(result.materializedGridBlocks).toEqual([{
    sectionId: "proof-section",
    columnKey: "proof-column",
    blockKey: "proof-grid",
  }]);
  expect(result.diagnostics).toEqual([expect.objectContaining({
    status: "materialized",
    templateItemId: "post-card-template",
    contextCount: 3,
  })]);

  expect(JSON.stringify(authored)).toBe(authoredBefore);
  expect(gridBlock(authored).gridItems).toHaveLength(1);
});

test("paginated Dynamic Grid requests a bounded complete collection window", async () => {
  const authored = proofLayout();
  const block = gridBlock(authored);
  block.pagination = { enabled: true, perPage: 9, mode: "pageNumbers", style: "standard" };
  let requestedQuantity = 0;
  await materializeBuilderDynamicContent(authored, {
    resolveContexts: async ({ descriptor }) => {
      requestedQuantity = Number(descriptor.query?.quantity ?? 0);
      return [postContext(1)];
    },
  });
  expect(requestedQuantity).toBe(100);
});

test("legacy product Grid resolves on the server into canonical Grid cards", async () => {
  const authored = proofLayout();
  const block = gridBlock(authored);
  block.gridSource = "products";
  block.columns = 2;
  block.gridRows = 1;
  block.gridItems = [];

  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async ({ descriptor }) => {
      expect(descriptor).toEqual({
        provider: "woocommerce",
        source: "product",
        mode: "collection",
        query: { quantity: 2 },
      });
      return [
        {
          id: 41,
          fields: {
            title: { type: "string", value: "Canonical Product" },
            price: { type: "string", value: "$49" },
            image: { type: "media", value: { url: "https://cms.example/product.jpg", alt: "Product image" } },
            "categories.label": { type: "string", value: "Objects" },
            "storefront.href": { type: "url", value: "/product/canonical-product" },
          },
        },
      ];
    },
  });
  const cards = gridBlock(result.renderLayout).gridItems ?? [];

  expect(cards).toEqual([expect.objectContaining({
    id: "product-grid-41",
    title: "Canonical Product",
    meta: "$49",
    imageUrl: "https://cms.example/product.jpg",
    imageAlt: "Product image",
    text: "Objects",
    buttonLabel: "View product",
    buttonUrl: "/product/canonical-product",
  })]);
  expect(result.materializedGridBlocks).toEqual([{
    sectionId: "proof-section",
    columnKey: "proof-column",
    blockKey: "proof-grid",
  }]);
});

test("provider failure preserves the authored static fallback and reports diagnostics", async () => {
  const authored = proofLayout();
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async () => {
      throw new Error("WPGraphQL unavailable");
    },
  });

  expect(result.renderLayout).toBe(authored);
  expect(gridBlock(result.renderLayout).gridItems).toHaveLength(1);
  expect(gridBlock(result.renderLayout).gridItems?.[0].title).toBe(
    "Static fallback title",
  );
  expect(result.materializedGridBlocks).toEqual([]);
  expect(result.diagnostics).toEqual([expect.objectContaining({
    status: "fallback",
    message: "WPGraphQL unavailable",
  })]);
});

test("re-resolution changes transient cards without mutating persistence authority", async () => {
  const authored = proofLayout();
  const persistenceSnapshot = JSON.stringify(authored);
  const first = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver([postContext(1), postContext(2), postContext(3)]),
  });
  const refreshed = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver([postContext(4), postContext(5), postContext(6)]),
  });

  expect(gridBlock(first.renderLayout).gridItems?.map((item) => item.title)).toEqual([
    "Post 1", "Post 2", "Post 3",
  ]);
  expect(gridBlock(refreshed.renderLayout).gridItems?.map((item) => item.title)).toEqual([
    "Post 4", "Post 5", "Post 6",
  ]);
  expect(JSON.stringify(authored)).toBe(persistenceSnapshot);
  expect(JSON.parse(persistenceSnapshot).sections[0].rows[0].columns[0].elements[0].gridItems)
    .toHaveLength(1);
});

test("Builder and storefront projections are identical while authored serialization stays singular", async () => {
  const authored = proofLayout();
  const contexts = [postContext(1), postContext(2), postContext(3)];
  const storefront = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver(contexts),
  });
  const builderPreview = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver(contexts),
  });

  expect(builderPreview.renderLayout).toEqual(storefront.renderLayout);
  expect(gridBlock(builderPreview.renderLayout).gridItems).toHaveLength(3);

  const savePayload = JSON.parse(JSON.stringify(authored)) as BuilderLayout;
  expect(gridBlock(savePayload).gridItems).toHaveLength(1);
  expect(gridBlock(savePayload).gridItems?.[0].dynamicContext).toBeTruthy();
  expect(gridBlock(savePayload).gridItems?.[0].dynamicBindings).toBeTruthy();
  expect(JSON.stringify(savePayload)).not.toContain("Post 1");
  expect(JSON.stringify(savePayload)).not.toContain("cms.example/post-1");
});

test("WordPress provider orchestration feeds the transient Grid projection", async () => {
  const originalFetch = globalThis.fetch;
  let requestedEndpoint = "";
  globalThis.fetch = async (input) => {
    requestedEndpoint = String(input);
    return new Response(JSON.stringify({
      data: {
        posts: {
          nodes: [1, 2, 3].map((index) => ({
            id: `wp-post-${index}`,
            title: `Remote ${index}`,
            excerpt: `<p>Remote excerpt ${index}</p>`,
            link: `https://remote.example/post-${index}/`,
            featuredImage: {
              node: {
                sourceUrl: `https://remote.example/post-${index}.jpg`,
                altText: `Remote image ${index}`,
              },
            },
          })),
        },
      },
    }), { status: 200, headers: { "Content-Type": "application/json" } });
  };

  try {
    const website = {
      cmsConnection: {
        provider: "wordpress",
        siteUrl: "https://remote.example",
        graphqlUrl: "https://remote.example/graphql",
      },
    } as unknown as SaaSWebsite;
    const result = await materializeBuilderDynamicContent(proofLayout(), {
      website,
    });
    const cards = gridBlock(result.renderLayout).gridItems ?? [];

    expect(requestedEndpoint).toBe("https://remote.example/graphql");
    expect(cards).toHaveLength(3);
    expect(cards.map((item) => item.title)).toEqual([
      "Remote 1", "Remote 2", "Remote 3",
    ]);
    expect(cards.map((item) => item.buttonLabel)).toEqual([
      "Read More", "Read More", "Read More",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
