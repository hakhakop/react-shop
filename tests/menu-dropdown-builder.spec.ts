import { expect, test } from "@playwright/test";
import { emptyMenuDropdown, exportMenuDropdown, normalizeMenuDropdown, menuDropdownRenderLayout } from "@/lib/menuDropdownLayout";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { createSublayoutRow } from "@/lib/builderSublayout";
import { createPortableNavigationPackage, materializePortableNavigation, parsePortableNavigationPackage } from "@/lib/navigationPackage";
import { normalizeBuilderShellSettings } from "@/lib/builderShell";
import women from "./fixtures/yootheme-compatibility/sources/women-menu-dropdown.json";

function previewMenuDropdownImport(source: unknown) {
  const mapping = mapYoothemeStaticContent(source);
  const content = normalizeMenuDropdown(mapping.sections[0]?.rows?.[0]?.columns[0]?.elements[0]);
  return { content, issues: [...mapping.warnings, ...mapping.reportWarnings, ...(content ? [] : ["Not a dropdown fragment"])] };
}

test("dropdown content survives shell normalization without becoming a page", () => {
  const content = emptyMenuDropdown(); content.sublayout.rows.push(createSublayoutRow());
  const shell = normalizeBuilderShellSettings({ menuItems: [{ id: "women", label: "Women", url: "/women", dropdownContent: content }] });
  expect(shell.menuItems[0].dropdownContent).toEqual(content);
  expect(normalizeMenuDropdown({ kind: "sublayout", id: "bad", sublayout: { rows: [{}] } })).toBeUndefined();
});

test("portable navigation attaches each dropdown to its own stable item", () => {
  const content = emptyMenuDropdown(); content.sublayout.rows.push(createSublayoutRow());
  const source = [{ id: "wp-1418", label: "Women", url: "/women", dropdownContent: content }, { id: "wp-42", label: "Men", url: "/men" }];
  const packet = createPortableNavigationPackage({ name: "Main", items: source });
  const parsed = parsePortableNavigationPackage(packet);
  const result = materializePortableNavigation(parsed);
  expect(result.items[0].dropdownContent).toEqual(content);
  expect(result.items[1].dropdownContent).toBeUndefined();
  expect(result.items[0].id).not.toBe("wp-1418");
});

test("native dropdown export round-trips without mutating original", async () => {
  const content = emptyMenuDropdown(); content.sublayout.rows.push(createSublayoutRow());
  const preview = await previewMenuDropdownImport(exportMenuDropdown(content));
  expect(preview.issues).toEqual([]);
  expect(preview.content?.sublayout.rows).toHaveLength(1);
  expect(preview.content?.id).not.toBe(content.id);
  preview.content!.sublayout.rows.length = 0;
  expect(content.sublayout.rows).toHaveLength(1);
});

test("YOOtheme fragment imports Nav through the shared page mapper", async () => {
  const preview = await previewMenuDropdownImport({ type: "fragment", children: [{ type: "row", children: [{ type: "column", children: [{ type: "nav", children: [{ type: "nav_item", props: { content: "Shop" } }] }] }] }] });
  expect(preview.content?.sublayout.rows[0].columns[0].elements[0].kind).toBe("nav");
  const empty = await previewMenuDropdownImport({ type: "fragment", children: [] });
  expect(empty.content?.sublayout.rows).toEqual([]);
  expect((await previewMenuDropdownImport({ type: "layout", children: [] })).issues).not.toEqual([]);
});

test("dropdown Products uses the page resolver without mutating saved content", async () => {
  const content = emptyMenuDropdown();
  content.sublayout.rows.push(createSublayoutRow());
  content.sublayout.rows[0].columns[0].elements.push({ id: "products", kind: "products", dynamicContext: { provider: "woocommerce", source: "product", mode: "collection", query: { quantity: 8 } } });
  const before = JSON.stringify(content);
  const preview = await previewMenuDropdownImport(exportMenuDropdown(content));
  expect(preview.issues).toEqual([]);
  const contexts = [{ id: "product-1", fields: { title: { type: "string" as const, value: "Resolved product" } } }];
  const result = await materializeBuilderDynamicContent(menuDropdownRenderLayout([content]), { resolveContexts: async ({ descriptor }) => {
    expect(descriptor.source).toBe("product");
    return contexts;
  } });
  expect(JSON.stringify(result.renderLayout)).toContain("Resolved product");
  expect(JSON.stringify(content)).toBe(before);
});

test("actual Woolberry Women export retains all five Nav groups", () => {
  const result = previewMenuDropdownImport(women);
  expect(result.content?.sublayout.rows[0].columns).toHaveLength(4);
  expect(result.content?.sublayout.rows[0].columns.flatMap(column => column.elements).filter(block => block.kind === "nav")).toHaveLength(5);
  expect(JSON.stringify(women)).toContain("customMenuItems");
});
