import { expect, test } from "@playwright/test";
import type { BuilderSection } from "@/components/dashboard/builderTypes";
import { dynamicContentPreviewSignature } from "@/lib/dynamicContentPreviewSignature";

const gallerySection = (databaseId: number): BuilderSection => ({
  id: "section",
  kind: "contentLayout",
  title: "Gallery",
  background: "transparent",
  visible: true,
  rows: [{
    id: "row",
    layout: "1-col",
    columns: [{
      id: "column",
      elements: [{
        id: "gallery",
        kind: "gallery",
        galleryItems: [{
          id: "gallery-template",
          title: "Authored fallback",
          dynamicContext: {
            provider: "wordpress",
            source: "content",
            mode: "single",
            query: { sourceName: "discover_tag", databaseId },
          },
          dynamicBindings: {
            title: { path: "name", valueType: "string" },
            imageUrl: { path: "acf.image_intro.url", valueType: "url" },
          },
        }],
      }],
    }],
  }],
});

test("Gallery item source edits invalidate the dynamic render projection", () => {
  const first = dynamicContentPreviewSignature([gallerySection(46)]);
  const second = dynamicContentPreviewSignature([gallerySection(47)]);
  expect(first).not.toBe(second);
  expect(first).toContain('"kind":"gallery-item"');
  expect(first).toContain('"databaseId":46');
});

test("static Gallery copy does not cause a provider refresh", () => {
  const first = gallerySection(46);
  const second = gallerySection(46);
  second.rows![0].columns[0].elements[0].galleryItems![0].title = "Changed fallback";
  expect(dynamicContentPreviewSignature([first])).toBe(dynamicContentPreviewSignature([second]));
});
