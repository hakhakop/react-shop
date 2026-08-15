import { randomUUID } from "node:crypto";
import type { BuilderSection, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";

export type RoutingTemplateStarter = "blank" | "minimal";

const id = (kind: string) => `starter-${kind}-${randomUUID()}`;

function contentSection(contentType: "product" | "post", blocks: BuilderLayoutBlock[]): BuilderSection {
  const sectionId = id(`${contentType}-section`);
  const rowId = id(`${contentType}-row`);
  const columnId = id(`${contentType}-column`);
  return {
    id: sectionId,
    kind: "contentLayout",
    title: "",
    eyebrow: "",
    body: "",
    background: "transparent",
    visible: true,
    contentMode: "default",
    layout: "whole",
    layoutColumns: 1,
    layoutRows: 1,
    layoutItems: [{
      id: columnId,
      rowId,
      rowLayout: "whole",
      blocks,
    }],
  };
}

export function createMinimalPostStarterSections(): BuilderSection[] {
  return [contentSection("post", [
    {
      id: id("post-heading"),
      kind: "heading",
      headingText: "Post title",
      dynamicBindings: { headingText: { path: "title", valueType: "string" } },
    },
    {
      id: id("post-image"),
      kind: "image",
      imageUrl: "",
      imageAlt: "",
      dynamicBindings: {
        imageUrl: { path: "featuredImage.url", valueType: "url" },
        imageAlt: { path: "featuredImage.alt", valueType: "string" },
      },
    },
    {
      id: id("post-body"),
      kind: "text",
      body: "Post content",
      dynamicBindings: { body: { path: "content", valueType: "richText" } },
    },
  ])];
}

export function createMinimalProductStarterSections(): BuilderSection[] {
  return [contentSection("product", [
    { id: id("product-gallery"), kind: "productGallery" },
    {
      id: id("product-heading"),
      kind: "heading",
      headingText: "Product title",
      dynamicBindings: { headingText: { path: "title", valueType: "string" } },
    },
    {
      id: id("product-price"),
      kind: "text",
      body: "Price",
      dynamicBindings: { body: { path: "price", valueType: "string" } },
    },
    { id: id("product-add-to-cart"), kind: "productAddToCart" },
    {
      id: id("product-description"),
      kind: "text",
      body: "Description",
      dynamicBindings: { body: { path: "description", valueType: "richText" } },
    },
  ])];
}

export function createRoutingTemplateStarterSections(
  contentType: "product" | "post",
  starter: RoutingTemplateStarter,
) {
  if (starter === "blank") return undefined;
  return contentType === "product"
    ? createMinimalProductStarterSections()
    : createMinimalPostStarterSections();
}
