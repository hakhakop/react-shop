import { expect, test } from "@playwright/test";
import type { BuilderLayoutBlock } from "@/lib/builderLayouts";
import {
  getDynamicItemContextValue,
  resolveDynamicItem,
  type DynamicContentContextDescriptor,
  type DynamicFieldBindings,
  type DynamicItemContext,
} from "@/lib/dynamicContent";

type TestItem = {
  title: string;
  text: string;
  imageUrl: string;
  buttonUrl: string;
  count: number;
};

const staticItem: TestItem = {
  title: "Static title",
  text: "Static text",
  imageUrl: "/static.jpg",
  buttonUrl: "/static-link",
  count: 4,
};

test("static-only item is unchanged", () => {
  expect(resolveDynamicItem(staticItem, undefined, undefined)).toBe(staticItem);
  expect(resolveDynamicItem(staticItem, { fields: {} }, {})).toBe(staticItem);
});

test("one binding overrides only its destination field", () => {
  const context: DynamicItemContext = {
    fields: { title: { type: "string", value: "Dynamic title" } },
  };
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    title: { path: "title", valueType: "string" },
  };

  expect(resolveDynamicItem(staticItem, context, bindings)).toEqual({
    ...staticItem,
    title: "Dynamic title",
  });
});

test("multiple fields bind independently while unbound fields stay static", () => {
  const context: DynamicItemContext = {
    fields: {
      title: { type: "string", value: "Dynamic title" },
      content: { type: "richText", value: "<p>Dynamic content</p>" },
      count: { type: "number", value: 12 },
    },
  };
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    title: { path: "title", valueType: "string" },
    text: { path: "content", valueType: "richText" },
    count: { path: "count", valueType: "number" },
  };

  expect(resolveDynamicItem(staticItem, context, bindings)).toEqual({
    ...staticItem,
    title: "Dynamic title",
    text: "<p>Dynamic content</p>",
    count: 12,
  });
});

test("missing dynamic value retains the authored static fallback", () => {
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    title: { path: "missing.title", valueType: "string" },
  };

  expect(resolveDynamicItem(staticItem, { fields: {} }, bindings)).toBe(staticItem);
});

test("removing a binding restores the authored field without changing the fallback", () => {
  const context: DynamicItemContext = {
    fields: { title: { type: "string", value: "Dynamic title" } },
  };
  const binding: DynamicFieldBindings<keyof TestItem> = {
    title: { path: "title", valueType: "string" },
  };

  expect(resolveDynamicItem(staticItem, context, binding).title).toBe("Dynamic title");
  expect(resolveDynamicItem(staticItem, context, undefined)).toBe(staticItem);
  expect(staticItem.title).toBe("Static title");
});

test("incorrect dynamic value type safely retains the static fallback", () => {
  const context: DynamicItemContext = {
    fields: { title: { type: "number", value: 99 } },
  };
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    title: { path: "title", valueType: "string" },
  };

  expect(resolveDynamicItem(staticItem, context, bindings)).toBe(staticItem);
});

test("source-proven date format transform resolves into the destination field", () => {
  const context: DynamicItemContext = {
    fields: { date: { type: "string", value: "2021-02-02T08:00:00" } },
  };
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    text: {
      path: "date",
      valueType: "string",
      transform: { kind: "dateFormat", format: "d F, Y" },
    },
  };

  expect(resolveDynamicItem(staticItem, context, bindings).text).toBe("02 February, 2021");
});

test("YOOtheme archive date and teaser-limit transforms resolve safely", () => {
  const resolved = resolveDynamicItem(
    { meta: "Fallback date", text: "Fallback teaser" },
    {
      fields: {
        date: { type: "string", value: "2026-08-07T12:00:00.000Z" },
        excerpt: { type: "richText", value: `<p>${"A".repeat(120)}</p>` },
      },
    },
    {
      meta: { path: "date", valueType: "string", transform: { kind: "dateFormat", format: "j F, Y" } },
      text: { path: "excerpt", valueType: "richText", transform: { kind: "textLimit", limit: 100 } },
    },
  );
  expect(resolved.meta).toBe("7 August, 2026");
  expect(resolved.text).toBe(`${"A".repeat(100)}…`);
});

test("invalid date transform input retains the authored fallback", () => {
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    text: {
      path: "date",
      valueType: "string",
      transform: { kind: "dateFormat", format: "Y-m-d;DROP" },
    },
  };

  expect(resolveDynamicItem(staticItem, {
    fields: { date: { type: "string", value: "not-a-date" } },
  }, bindings)).toBe(staticItem);
});

test("text, URL, and media context values remain typed", () => {
  const context: DynamicItemContext = {
    fields: {
      title: { type: "string", value: "Typed title" },
      featuredImageUrl: { type: "url", value: "https://example.com/image.jpg" },
      featuredImage: {
        type: "media",
        value: { url: "https://example.com/image.jpg", alt: "Example" },
      },
      identifier: { type: "identifier", value: "article-42" },
      metadata: { type: "metadata", value: { categories: ["News", "Events"] } },
    },
  };
  const bindings: DynamicFieldBindings<keyof TestItem> = {
    title: { path: "title", valueType: "string" },
    imageUrl: { path: "featuredImageUrl", valueType: "url" },
  };

  const resolved = resolveDynamicItem(staticItem, context, bindings);
  expect(resolved.title).toBe("Typed title");
  expect(resolved.imageUrl).toBe("https://example.com/image.jpg");
  expect(getDynamicItemContextValue(context, "featuredImage", "media")).toEqual({
    url: "https://example.com/image.jpg",
    alt: "Example",
  });
  expect(getDynamicItemContextValue(context, "featuredImage", "url")).toBeUndefined();
  expect(getDynamicItemContextValue(context, "identifier", "identifier")).toBe("article-42");
  expect(getDynamicItemContextValue(context, "metadata", "metadata")).toEqual({
    categories: ["News", "Events"],
  });
});

test("Grid and Panel Slider items accept the same canonical dynamic metadata", () => {
  const dynamicContext: DynamicContentContextDescriptor = {
    provider: "fixture",
    source: "article",
    mode: "single",
    query: { id: "article-1" },
  };

  const grid = {
    id: "grid",
    kind: "grid",
    gridItems: [{
      id: "grid-item",
      title: "Static Grid title",
      dynamicContext,
      dynamicBindings: { title: { path: "title", valueType: "string" } },
    }],
  } satisfies BuilderLayoutBlock;

  const panelSlider = {
    id: "panel-slider",
    kind: "panelSlider",
    slides: [{
      id: "panel-slide",
      title: "Static Panel title",
      dynamicContext,
      dynamicBindings: { title: { path: "title", valueType: "string" } },
    }],
  } satisfies BuilderLayoutBlock;

  expect(grid.gridItems[0].dynamicContext).toBe(dynamicContext);
  expect(panelSlider.slides[0].dynamicContext).toBe(dynamicContext);
});
