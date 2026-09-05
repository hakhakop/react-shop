import { expect, test } from "@playwright/test";
import women from "./fixtures/yootheme-compatibility/sources/women-menu-dropdown.json";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { getWebsiteByIdOrSlug } from "@/lib/websites";
import { projectWordPressMenuContexts } from "@/lib/wordpressMenuContentProvider.server";
import { duplicateSublayoutNode } from "@/lib/builderSublayout";

test("Women fragment retains Nav collections in the shared mapper", () => {
  const result = mapYoothemeStaticContent(women);
  expect(JSON.stringify(result.sections)).toContain('"kind":"nav"');
  expect(result.warnings).toEqual([]);
  const fragment = result.sections[0].rows![0].columns[0].elements[0];
  const copied = duplicateSublayoutNode(fragment);
  expect(copied.id).not.toBe(fragment.id);
  expect(copied.sublayout!.rows[0].columns[0].elements[0].dynamicContext).toEqual(fragment.sublayout!.rows[0].columns[0].elements[0].dynamicContext);
});

test("connected Women dropdown resolves live CMS contexts read-only", async () => {
  test.skip(!process.env.VERIFY_WOOLBERRY_NAV, "Opt-in read-only connected CMS verification");
  const website = await getWebsiteByIdOrSlug("woolberry");
  const mapped = mapYoothemeStaticContent(women);
  const result = await materializeBuilderDynamicContent({ version: 1, page: "header", updatedAt: "", sections: mapped.sections }, { website });
  const fragment = result.renderLayout.sections[0].rows![0].columns[0].elements[0];
  const blocks = fragment.sublayout!.rows[0].columns.flatMap(column => column.elements);
  expect(blocks.filter(block => block.kind === "heading").map(block => block.headingText)).toEqual(["Highlights", "Collections", "Clothing", "Shoes", "Accessories"]);
  expect(blocks.flatMap(block => block.navItems ?? [])).toHaveLength(25);
  expect(blocks.find(block => block.kind === "slideshow")?.slides?.map(slide => slide.title)).toEqual(["Revolutionary Muse Women", "Color Essentials Women"]);
  expect(result.diagnostics.filter(item => item.status === "fallback")).toEqual([]);
  // This tenant does not expose its featured term media via GraphQL or REST.
  // Keep the missing-field diagnostic; never certify these videos as resolved.
  expect(result.diagnostics.filter(item => item.message?.includes("acf.image_featured.url"))).toHaveLength(2);
});

test("menu context scopes by menu and parent and preserves header/divider semantics", () => {
  const menus = [{ databaseId: 78, menuItems: { nodes: [
    { databaseId: 1, parentDatabaseId: 0, label: "Women", url: "/women" },
    { databaseId: 2, parentDatabaseId: 1, label: "Shop", url: "/shop" },
    { databaseId: 3, parentDatabaseId: 1, label: "Heading", cssClasses: ["uk-nav-header"] },
    { databaseId: 4, parentDatabaseId: 1, label: "", cssClasses: ["uk-nav-divider"] },
    { databaseId: 5, parentDatabaseId: 2, label: "Nested", url: "/nested" },
  ] } }];
  const contexts = projectWordPressMenuContexts(menus, { descriptor: { provider: "wordpress", source: "menu-item", mode: "collection", query: { menuId: "78", parentId: "1" } } });
  expect(contexts.map(context => context.id)).toEqual([2, 3, 4]);
  expect(contexts.map(context => context.fields.type.value)).toEqual(["link", "header", "divider"]);
});
