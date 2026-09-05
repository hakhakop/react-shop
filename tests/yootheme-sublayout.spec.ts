import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { applySublayoutPreset, duplicateSublayoutNode, createSublayoutRow } from "@/lib/builderSublayout";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { dynamicContentPreviewSignature } from "@/lib/dynamicContentPreviewSignature";
import type { BuilderLayout } from "@/lib/builderLayouts";
import source from "./fixtures/yootheme-compatibility/sources/sublayout.json";
import { createYoothemePageImportReport } from "@/lib/yoothemeImportReport";

const imported = () => mapYoothemeStaticContent(source);
const block = () => imported().sections[0].rows![0].columns[0].elements[0];
test("imports fragment as nested canonical rows with semantic tag and responsive columns", () => {
  const result = imported();
  expect(result.warnings).toEqual([]);
  expect(block()).toMatchObject({ kind: "sublayout", sublayoutHtmlId: "nested-links", sublayout: { htmlElement: "nav", rows: [{ columns: [{ responsiveWidths: { medium: "1-2" }, elements: [{ kind: "heading", headingText: "Shop" }] }, { elements: [{ headingText: "Help" }] }] }, { columns: [{ elements: [{ kind: "text" }] }] }] } });
});
test("import report recognizes Sublayout fields", () => {
  const report = createYoothemePageImportReport(source);
  expect(report.byStatus.UNHANDLED.filter(entry => entry.sourceType === "fragment")).toEqual([]);
});
test("collection Sublayout repeats its layout and resolves dynamic attributes for each item", async () => {
  const result = imported();
  const fragment = result.sections[0].rows![0].columns[0].elements[0];
  fragment.dynamicContext = { provider: "wordpress", source: "post", mode: "collection" };
  fragment.dynamicBindings = { sublayoutHtmlId: { path: "slug", valueType: "string" } };
  const layout = { version: 1, key: "home", page: "home", updatedAt: "2026-09-05", sections: result.sections } as BuilderLayout;
  const materialized = await materializeBuilderDynamicContent(layout, { resolveContexts: async () => ["first", "second"].map(id => ({ id, fields: { slug: { type: "string", value: id } } })) });
  const elements = materialized.renderLayout.sections[0].rows![0].columns[0].elements;
  expect(elements.map(element => element.sublayoutHtmlId)).toEqual(["first", "second"]);
  expect(elements[0].id).not.toBe(elements[1].id);
  expect(fragment.sublayoutHtmlId).toBe("nested-links");
});
test("empty Sublayout stays empty and nested Sublayout imports recursively", () => {
  const copy = structuredClone(source);
  const fragment = copy.children[0].children[0].children[0].children[0];
  (fragment as { children: unknown[] }).children = [{ type: "row", children: [{ type: "column", children: [{ type: "fragment", props: {}, children: [] }] }] }];
  const result = mapYoothemeStaticContent(copy);
  expect(result.sections[0].rows![0].columns[0].elements[0].sublayout!.rows[0].columns[0].elements[0]).toMatchObject({ kind: "sublayout", sublayout: { rows: [] } });
});
test("changing column presets preserves all content and copying remaps descendants", () => {
  const row = block().sublayout!.rows[0];
  const one = applySublayoutPreset(row, "1-col");
  expect(one.columns[0].elements.map(element => element.headingText)).toEqual(["Shop", "Help"]);
  expect(row.columns).toHaveLength(2);
  const copy = duplicateSublayoutNode(block());
  expect(copy.id).not.toBe(block().id);
  expect(copy.sublayout!.rows[0].columns[0].elements[0].id).not.toBe(row.columns[0].elements[0].id);
  expect(createSublayoutRow().columns[0].elements).toEqual([]);
});
test("dynamic descendants inherit the Sublayout source without changing persisted content", async () => {
  const result = imported();
  const fragment = result.sections[0].rows![0].columns[0].elements[0];
  fragment.dynamicContext = { provider: "wordpress", source: "post", mode: "single" };
  fragment.sublayout!.rows[0].columns[0].elements[0].dynamicBindings = { title: { path: "title", valueType: "string" } };
  const layout = { version: 1, key: "home", page: "home", updatedAt: "2026-09-05", sections: result.sections } as BuilderLayout;
  const saved = JSON.stringify(layout);
  const signature = dynamicContentPreviewSignature(result.sections);
  const materialized = await materializeBuilderDynamicContent(layout, { resolveContexts: async () => [{ id: "one", fields: { title: { type: "string", value: "Inherited title" } } }] });
  expect(materialized.renderLayout.sections[0].rows![0].columns[0].elements[0].sublayout!.rows[0].columns[0].elements[0].title).toBe("Inherited title");
  expect(JSON.stringify(layout)).toBe(saved);
  fragment.sublayout!.rows[0].columns[0].elements[0].dynamicBindings = undefined;
  expect(dynamicContentPreviewSignature(result.sections)).not.toBe(signature);
});
