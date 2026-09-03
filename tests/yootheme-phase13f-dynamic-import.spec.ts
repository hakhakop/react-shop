import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

const homeFixture = JSON.parse(
  readFileSync("/Users/hakobjaghatspanyan/Downloads/Home.json", "utf8"),
);
const blogFixture = JSON.parse(
  readFileSync("/Users/hakobjaghatspanyan/Downloads/Circle-Blog-page.json", "utf8"),
);
const designFixture = JSON.parse(
  readFileSync("/Users/hakobjaghatspanyan/Downloads/Design-Home.json", "utf8"),
);

const collectBlocks = (value: unknown, result: any[] = []) => {
  if (!value || typeof value !== "object") return result;
  if ((value as { kind?: unknown }).kind) result.push(value);
  for (const child of Object.values(value as Record<string, unknown>)) {
    if (Array.isArray(child)) child.forEach((entry) => collectBlocks(entry, result));
    else collectBlocks(child, result);
  }
  return result;
};

test("imports a real YOOtheme Custom Posts Grid item into the canonical contract", () => {
  const mapped = mapYoothemeStaticContent(homeFixture);
  const dynamicGrid = collectBlocks(mapped.sections).find((block) =>
    block.kind === "grid" && block.gridItems?.some((item: any) => item.dynamicContext),
  );
  expect(dynamicGrid).toBeTruthy();
  const item = dynamicGrid.gridItems.find((candidate: any) => candidate.dynamicContext);
  expect(item).toMatchObject({
    dynamicContext: {
      provider: "wordpress",
      source: "post",
      mode: "collection",
      query: {
        start: 0,
        quantity: 3,
        order: "date",
        direction: "desc",
      },
    },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      meta: {
        path: "date",
        valueType: "string",
        transform: { kind: "dateFormat", format: "d F, Y" },
      },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
  expect(item.dynamicBindings.imageUrl).toEqual({ path: "featuredImage.url", valueType: "url" });
  expect(item.dynamicBindings.imageAlt).toEqual({ path: "featuredImage.alt", valueType: "string" });
  expect(item.dynamicContext.query).toMatchObject({
    filters: { rawTermIds: [2, 3, 5] },
  });
  expect(mapped.warnings.some((warning) => warning.includes("raw term IDs do not carry taxonomy identity"))).toBeFalsy();
});

test("preserves authored static fallbacks beside supported bindings", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid",
      children: [{
        type: "grid_item",
        props: { title: "Static title", link_text: "Read More", content: "Fallback" },
        source: {
          query: { name: "posts.customPosts", arguments: { offset: 2, limit: 4, order: "title", order_direction: "ASC" } },
          props: { title: { name: "title" }, link: { name: "link" }, content: { name: "excerpt" } },
        },
      }],
    }] }] }] }],
  });
  const item = collectBlocks(mapped.sections).find((block) => block.kind === "grid").gridItems[0];
  expect(item).toMatchObject({
    title: "Static title",
    buttonLabel: "Read More",
    text: "Fallback",
    dynamicContext: { query: { start: 2, quantity: 4, order: "title", direction: "asc" } },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      text: { path: "excerpt", valueType: "richText" },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
});

test("custom WordPress source retains static fallback and becomes a discoverable provider", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid",
      children: [{
        type: "grid_item",
        props: { title: "Fallback", content: "Static" },
        source: { query: { name: "products.customProducts", arguments: { offset: 0, limit: 3 } }, props: { title: { name: "title" } } },
      }],
    }] }] }] }],
  });
  const item = collectBlocks(mapped.sections).find((block) => block.kind === "grid").gridItems[0];
  expect(item).toMatchObject({ title: "Fallback", text: "Static" });
  expect(item.dynamicContext).toMatchObject({
    provider: "woocommerce",
    source: "product",
    mode: "collection",
    query: { start: 0, quantity: 3 },
  });
  expect(item.dynamicBindings).toMatchObject({
    title: { path: "title", valueType: "string" },
  });
  expect(mapped.warnings.some((warning) => warning.includes("DYNAMIC CONTENT PROVIDER UNRESOLVED"))).toBeFalsy();
});

test("Design Escapes custom providers retain every known canonical element template", () => {
  const dynamicItem = (type: string, queryName: string, props: Record<string, unknown>) => ({
    type,
    props: {},
    source: {
      query: { name: queryName, arguments: { offset: 0, limit: 4 } },
      props,
    },
  });
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [
            { type: "slideshow", children: [dynamicItem("slideshow_item", "accommodations.customAccommodations", { title: { name: "field.accommodation_teaser_title" }, image: { name: "field.accommodation_teaser_image_bg.url" } })] },
            { type: "panel-slider", children: [dynamicItem("panel-slider_item", "accommodations.customAccommodations", { title: { name: "title" }, image: { name: "field.intro_image.url" } })] },
            { type: "grid", children: [dynamicItem("grid_item", "#parent", { title: { name: "title" }, link: { name: "link" } })] },
            { type: "gallery", children: [dynamicItem("gallery_item", "discoverTags.customDiscoverTag", { title: { name: "name" }, image: { name: "field.image_intro.url" }, link: { name: "link" } })] },
            { type: "list", children: [dynamicItem("list_item", "discoverTags.customDiscoverTags", { content: { name: "name" }, link: { name: "link" } })] },
          ],
        }],
      }],
    }],
  });
  const blocks = collectBlocks(mapped.sections);

  const slideshow = blocks.find((block) => block.kind === "slideshow");
  const panelSlider = blocks.find((block) => block.kind === "panelSlider");
  const grid = blocks.find((block) => block.kind === "grid");
  const gallery = blocks.find((block) => block.kind === "gallery");
  const list = blocks.find((block) => block.kind === "list");

  expect(slideshow.slides).toHaveLength(1);
  expect(panelSlider.slides).toHaveLength(1);
  expect(grid.gridItems).toHaveLength(1);
  expect(gallery.galleryItems).toHaveLength(1);
  expect(list.listItems).toHaveLength(1);
  expect(slideshow.slides[0].dynamicContext).toMatchObject({
    provider: "wordpress",
    source: "content",
    query: { graphqlRoot: "accommodations", start: 0, quantity: 4 },
  });
  expect(panelSlider.slides[0].dynamicBindings.imageUrl).toEqual({ path: "acf.intro_image.url", valueType: "url" });
  expect(grid.gridItems[0].dynamicContext).toBeUndefined();
  expect(gallery.galleryItems[0].dynamicBindings).toMatchObject({
    title: { path: "name", valueType: "string" },
    imageUrl: { path: "acf.image_intro.url", valueType: "url" },
    linkUrl: { path: "link", valueType: "url" },
  });
  expect(list.listItems[0].dynamicBindings).toMatchObject({
    text: { path: "name", valueType: "string" },
    url: { path: "link", valueType: "url" },
  });
});

test("Design Cozy Places imports a single tag context and its related Accommodation Grid", () => {
  const mapped = mapYoothemeStaticContent(designFixture);
  const section = mapped.sections.find((candidate) => candidate.title === "Tag Cozy Places");
  expect(section?.dynamicContext).toMatchObject({
    provider: "wordpress",
    source: "content",
    mode: "single",
    query: {
      graphqlRoot: "discoverTags",
      databaseId: 56,
    },
  });
  expect(section?.dynamicBindings).toEqual({
    backgroundImageUrl: { path: "acf.image_featured.url", valueType: "url" },
  });
  const grid = collectBlocks(section).find((block) => block.kind === "grid");
  expect(grid.gridItems[0]).toMatchObject({
    dynamicContext: {
      provider: "wordpress",
      source: "content",
      mode: "collection",
      query: {
        graphqlRoot: "accommodations",
        parentRelation: true,
        metaTaxonomy: "accommodation_cat",
        start: 0,
        quantity: 4,
      },
    },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      meta: { path: "metaString", valueType: "string" },
      imageUrl: { path: "acf.intro_image.url", valueType: "url" },
      imageAlt: { path: "acf.intro_image.alt", valueType: "string" },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
});

test("Design Get Inspired imports Overlay, Gallery, and List taxonomy sources canonically", () => {
  const mapped = mapYoothemeStaticContent(designFixture);
  const section = mapped.sections.find((candidate) => candidate.title === "Get Inspired");
  const blocks = collectBlocks(section);
  const overlay = blocks.find((block) => block.kind === "overlay");
  const gallery = blocks.find((block) => block.kind === "gallery");
  const list = blocks.find((block) => block.kind === "list" && block.listItems?.[0].dynamicContext?.query?.quantity === 4);
  expect(overlay).toMatchObject({
    dynamicContext: { mode: "single", query: { graphqlRoot: "discoverTags", databaseId: 44 } },
    dynamicBindings: {
      imageUrl: { path: "acf.image_intro.url", valueType: "url" },
      title: { path: "name", valueType: "string" },
      imageLinkUrl: { path: "link", valueType: "url" },
    },
  });
  expect(gallery?.galleryItems?.[0]).toMatchObject({
    dynamicContext: { mode: "single", query: { graphqlRoot: "discoverTags", databaseId: 45 } },
    dynamicBindings: { imageUrl: { path: "acf.image_intro.url", valueType: "url" } },
  });
  expect(list?.listItems?.[0]).toMatchObject({
    dynamicContext: { mode: "collection", query: { graphqlRoot: "discoverTags", start: 0, quantity: 4 } },
    dynamicBindings: { text: { path: "name", valueType: "string" } },
  });
});

test("imports an authored YOOtheme taxonomy Overlay Slider item as one canonical term", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "overlay-slider",
      children: [{
        type: "overlay-slider_item",
        props: { meta: "Discover", link: "?page_id=40" },
        source: {
          query: { name: "accommodationCats.customAccommodationCat", arguments: { id: 6 } },
          props: {
            title: { name: "name" },
            image: { name: "field.accommodation_intro_image.url" },
            image_alt: { name: "field.accommodation_intro_image.alt" },
          },
        },
      }],
    }] }] }] }],
  });
  const slide = collectBlocks(mapped.sections).find((block) => block.kind === "overlaySlider").slides[0];
  expect(slide).toMatchObject({
    meta: "Discover",
    buttonUrl: "?page_id=40",
    dynamicContext: {
      provider: "wordpress",
      source: "content",
      mode: "single",
      query: {
        sourceName: "accommodation_cat",
        graphqlRoot: "accommodationCats",
        yoothemeQueryName: "accommodationCats.customAccommodationCat",
        databaseId: 6,
      },
    },
    dynamicBindings: {
      title: { path: "name", valueType: "string" },
      imageUrl: { path: "acf.accommodation_intro_image.url", valueType: "url" },
      imageAlt: { path: "acf.accommodation_intro_image.alt", valueType: "string" },
    },
  });
});

test("materialization requests the imported ACF fields without persisting provider metadata", async () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "slideshow",
      children: [{
        type: "slideshow_item",
        props: { title: "Fallback title", image: "/fallback.jpg" },
        source: {
          query: { name: "accommodations.customAccommodations", arguments: { limit: 2 } },
          props: {
            title: { name: "field.accommodation_teaser_title" },
            image: { name: "field.intro_image.url" },
          },
        },
      }],
    }] }] }] }],
  });
  const descriptors: any[] = [];
  await materializeBuilderDynamicContent({
    version: 1,
    key: "page:acf-request-proof",
    page: "page:acf-request-proof",
    updatedAt: "2026-08-28T00:00:00.000Z",
    sections: mapped.sections,
  } as any, {
    resolveContexts: async ({ descriptor }) => {
      descriptors.push(descriptor);
      return [];
    },
  });
  expect(descriptors[0]).toMatchObject({
    provider: "wordpress",
    source: "content",
    query: {
      graphqlRoot: "accommodations",
      quantity: 2,
      requestedFields: ["acf.accommodation_teaser_title", "acf.intro_image.url"],
    },
  });
});

test("uses the same canonical metadata helper for a Panel Slider template", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "panel-slider",
      children: [{
        type: "panel-slider_item",
        props: { title: "Fallback slide", link_text: "Read More" },
        source: {
          query: { name: "posts.customPosts", arguments: { offset: 0, limit: 3 } },
          props: {
            title: { name: "title" },
            content: { name: "excerpt" },
            link: { name: "link" },
            video_hover: { name: "link" },
          },
        },
      }],
    }] }] }] }],
  });
  const slider = collectBlocks(mapped.sections).find((block) => block.kind === "panelSlider");
  expect(slider.slides).toHaveLength(1);
  expect(slider.slides[0]).toMatchObject({
    title: "Fallback slide",
    buttonLabel: "Read More",
    dynamicContext: { provider: "wordpress", source: "post", mode: "collection" },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      text: { path: "excerpt", valueType: "richText" },
      buttonUrl: { path: "link", valueType: "url" },
      hoverVideoUrl: { path: "link", valueType: "url" },
    },
  });
});

test("the imported Grid template uses the existing transient materializer", async () => {
  const mapped = mapYoothemeStaticContent(homeFixture);
  const authoredLayout = {
    version: 1,
    key: "page:imported-grid-proof",
    page: "page:imported-grid-proof",
    updatedAt: "2026-08-14T00:00:00.000Z",
    sections: mapped.sections,
  } as any;
  const result = await materializeBuilderDynamicContent(authoredLayout, {
    resolveContexts: async () => [
      { id: "post-1", fields: { title: { type: "string", value: "Resolved Post" }, link: { type: "url", value: "/post-1" } } },
    ],
  });
  const dynamicGrid = collectBlocks(result.renderLayout.sections).find((block) => block.kind === "grid" && block.gridItems?.some((item: any) => item.id.includes("dynamic")));
  expect(dynamicGrid.gridItems).toHaveLength(1);
  expect(dynamicGrid.gridItems[0]).toMatchObject({ title: "Resolved Post", buttonUrl: "/post-1" });
  expect(dynamicGrid.gridItems[0].dynamicContext).toBeUndefined();
});

test("imports Circle Blog archive Panel and responsive Grids into canonical post bindings", () => {
  const mapped = mapYoothemeStaticContent(blogFixture);
  const blocks = collectBlocks(mapped.sections);
  const panel = blocks.find((block) => block.kind === "panel" && block.dynamicContext);
  const grids = Array.from(new Map(
    blocks
      .filter((block) => block.kind === "grid" && block.gridItems?.[0]?.dynamicContext)
      .map((block) => [block.id, block]),
  ).values());

  expect(panel).toMatchObject({
    panelShowMedia: true,
    dynamicContext: {
      provider: "wordpress",
      source: "post",
      mode: "collection",
      query: { archive: "single", start: 0, quantity: 1 },
    },
    dynamicBindings: {
      title: { path: "title", valueType: "string" },
      eyebrow: { path: "date", transform: { kind: "dateFormat", format: "j F, Y" } },
      body: { path: "excerpt", transform: { kind: "textLimit", limit: 150 } },
      imageUrl: { path: "featuredImage.url", valueType: "url" },
      imageAlt: { path: "featuredImage.alt", valueType: "string" },
      buttonUrl: { path: "link", valueType: "url" },
    },
  });
  expect(grids).toHaveLength(2);
  expect(grids.map((grid) => grid.visibility)).toEqual(["m", "hidden-m"]);
  expect(grids.map((grid) => grid.pagination)).toEqual([
    { enabled: true, perPage: 9, mode: "pageNumbers", style: "standard", margin: "large", alignment: "center", animation: "none" },
    { enabled: true, perPage: 9, mode: "pageNumbers", style: "standard", margin: "large", alignment: "center", animation: "none" },
  ]);
  expect(grids.map((grid) => grid.gridItems[0].dynamicContext.query.archive)).toEqual([
    "collection",
    "collection",
  ]);
  expect(grids.map((grid) => grid.gridItems[0].dynamicContext.query.start)).toEqual([1, 0]);
  for (const grid of grids) {
    expect(grid.gridItems[0].dynamicBindings).toMatchObject({
      title: { path: "title" },
      meta: { path: "date", transform: { kind: "dateFormat", format: "j F, Y" } },
      text: { path: "excerpt", transform: { kind: "textLimit", limit: 100 } },
      imageUrl: { path: "featuredImage.url" },
      imageAlt: { path: "featuredImage.alt" },
      buttonUrl: { path: "link" },
    });
  }
  expect(mapped.warnings.some((warning) => /dynamic content unsupported/i.test(warning))).toBeFalsy();
});
