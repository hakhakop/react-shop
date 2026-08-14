import { expect, test } from "@playwright/test";
import type { BuilderLayout, BuilderLayoutBlock } from "@/lib/builderLayouts";
import {
  dynamicGridRenderItemId,
  dynamicPanelSliderRenderItemId,
  materializeBuilderDynamicContent,
  type DynamicContentContextResolver,
} from "@/lib/builderDynamicContentMaterializer.server";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import type { SaaSWebsite } from "@/lib/websites";

const proofLayout = (): BuilderLayout => ({
  version: 1,
  key: "page:dynamic-panel-slider-proof",
  page: "page:dynamic-panel-slider-proof",
  updatedAt: "2026-08-14T00:00:00.000Z",
  sections: [{
    id: "proof-section",
    kind: "content",
    title: "Dynamic Panel Slider proof",
    background: "#fff",
    visible: true,
    rows: [{
      id: "proof-row",
      layout: "1-col",
      columns: [{
        id: "proof-column",
        elements: [{
          id: "proof-panel-slider",
          kind: "panelSlider",
          panelStyle: "primary",
          panelSize: "large",
          panelHeightExpand: true,
          imageFit: "cover",
          imageRatio: "16:9",
          imageWidth: "large",
          buttonStyle: "secondary",
          size: "large",
          typography: {
            title: { fontWeight: 700 },
            text: { lineHeight: 1.5 },
          },
          carouselSettings: {
            presentation: "panel-slider",
            variant: "panel",
            cardsPerView: 3,
            spaceBetween: 32,
            centered: false,
            showArrows: true,
            showDots: false,
          },
          slides: [{
            id: "post-slide-template",
            title: "Static fallback title",
            text: "Static fallback excerpt",
            imageUrl: "/fallback.jpg",
            imageAlt: "Static fallback image",
            buttonLabel: "Read More",
            buttonUrl: "/fallback",
            imagePadding: "small",
            textColor: "light",
            itemElement: "article",
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

const panelSliderBlock = (layout: BuilderLayout) =>
  layout.sections[0].rows?.[0].columns[0].elements[0] as BuilderLayoutBlock;

test("one authored Panel Slider template expands into three transient ordinary slides", async () => {
  const authored = proofLayout();
  const authoredBefore = JSON.stringify(authored);
  const templateBlock = panelSliderBlock(authored);
  const templateSlide = templateBlock.slides?.[0];
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver([postContext(1), postContext(2), postContext(3)]),
  });
  const renderBlock = panelSliderBlock(result.renderLayout);
  const slides = renderBlock.slides ?? [];

  expect(slides).toHaveLength(3);
  expect(slides.map((slide) => slide.title)).toEqual(["Post 1", "Post 2", "Post 3"]);
  expect(slides.map((slide) => slide.text)).toEqual([
    "<p>Excerpt 1</p>",
    "<p>Excerpt 2</p>",
    "<p>Excerpt 3</p>",
  ]);
  expect(slides.map((slide) => slide.imageUrl)).toEqual([
    "https://cms.example/post-1.jpg",
    "https://cms.example/post-2.jpg",
    "https://cms.example/post-3.jpg",
  ]);
  expect(slides.map((slide) => slide.imageAlt)).toEqual(["Image 1", "Image 2", "Image 3"]);
  expect(slides.map((slide) => slide.buttonUrl)).toEqual([
    "https://cms.example/post-1/",
    "https://cms.example/post-2/",
    "https://cms.example/post-3/",
  ]);
  expect(slides.map((slide) => slide.buttonLabel)).toEqual([
    "Read More",
    "Read More",
    "Read More",
  ]);
  expect(slides.every((slide) => slide.imagePadding === templateSlide?.imagePadding)).toBe(true);
  expect(slides.every((slide) => slide.textColor === templateSlide?.textColor)).toBe(true);
  expect(slides.every((slide) => slide.itemElement === templateSlide?.itemElement)).toBe(true);
  expect(slides.every((slide) => !slide.dynamicContext && !slide.dynamicBindings)).toBe(true);
  expect(slides.map((slide) => slide.id)).toEqual([
    dynamicPanelSliderRenderItemId("post-slide-template", "post-1"),
    dynamicPanelSliderRenderItemId("post-slide-template", "post-2"),
    dynamicPanelSliderRenderItemId("post-slide-template", "post-3"),
  ]);
  expect(dynamicPanelSliderRenderItemId("post-slide-template", "post-1"))
    .toBe(dynamicGridRenderItemId("post-slide-template", "post-1"));

  expect(renderBlock.panelStyle).toBe(templateBlock.panelStyle);
  expect(renderBlock.panelSize).toBe(templateBlock.panelSize);
  expect(renderBlock.panelHeightExpand).toBe(templateBlock.panelHeightExpand);
  expect(renderBlock.imageFit).toBe(templateBlock.imageFit);
  expect(renderBlock.imageRatio).toBe(templateBlock.imageRatio);
  expect(renderBlock.imageWidth).toBe(templateBlock.imageWidth);
  expect(renderBlock.buttonStyle).toBe(templateBlock.buttonStyle);
  expect(renderBlock.size).toBe(templateBlock.size);
  expect(renderBlock.typography).toBe(templateBlock.typography);
  expect(renderBlock.carouselSettings).toBe(templateBlock.carouselSettings);
  expect(result.materializedGridBlocks).toEqual([]);
  expect(result.diagnostics).toEqual([expect.objectContaining({
    status: "materialized",
    sectionId: "proof-section",
    columnKey: "proof-column",
    blockKey: "proof-panel-slider",
    templateItemId: "post-slide-template",
    contextCount: 3,
  })]);

  expect(JSON.stringify(authored)).toBe(authoredBefore);
  expect(panelSliderBlock(authored).slides).toHaveLength(1);
});

test("Builder and storefront receive identical slides while authored serialization remains singular", async () => {
  const authored = proofLayout();
  const persistenceSnapshot = JSON.stringify(authored);
  const contexts = [postContext(1), postContext(2), postContext(3)];
  const storefront = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver(contexts),
  });
  const builderPreview = await materializeBuilderDynamicContent(authored, {
    resolveContexts: proofResolver(contexts),
  });

  expect(builderPreview.renderLayout).toEqual(storefront.renderLayout);
  expect(panelSliderBlock(builderPreview.renderLayout).slides).toHaveLength(3);

  const savePayload = JSON.parse(persistenceSnapshot) as BuilderLayout;
  expect(panelSliderBlock(savePayload).slides).toHaveLength(1);
  expect(panelSliderBlock(savePayload).slides?.[0].dynamicContext).toBeTruthy();
  expect(panelSliderBlock(savePayload).slides?.[0].dynamicBindings).toBeTruthy();
  expect(JSON.stringify(savePayload)).not.toContain("Post 1");
  expect(JSON.stringify(savePayload)).not.toContain("cms.example/post-1");
  expect(JSON.stringify(authored)).toBe(persistenceSnapshot);
});

test("provider failure leaves the authored Panel Slider fallback slide intact", async () => {
  const authored = proofLayout();
  const result = await materializeBuilderDynamicContent(authored, {
    resolveContexts: async () => {
      throw new Error("WPGraphQL unavailable");
    },
  });

  expect(result.renderLayout).toBe(authored);
  expect(panelSliderBlock(result.renderLayout).slides).toHaveLength(1);
  expect(panelSliderBlock(result.renderLayout).slides?.[0]).toEqual(
    panelSliderBlock(authored).slides?.[0],
  );
  expect(result.diagnostics).toEqual([expect.objectContaining({
    status: "fallback",
    templateItemId: "post-slide-template",
    message: "WPGraphQL unavailable",
  })]);
});

test("WordPress provider orchestration feeds the transient Panel Slider projection", async () => {
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
    const result = await materializeBuilderDynamicContent(proofLayout(), { website });
    const slides = panelSliderBlock(result.renderLayout).slides ?? [];

    expect(requestedEndpoint).toBe("https://remote.example/graphql");
    expect(slides).toHaveLength(3);
    expect(slides.map((slide) => slide.title)).toEqual([
      "Remote 1",
      "Remote 2",
      "Remote 3",
    ]);
    expect(slides.map((slide) => slide.buttonLabel)).toEqual([
      "Read More",
      "Read More",
      "Read More",
    ]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
