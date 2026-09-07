import { expect, test } from "@playwright/test";
import women from "./fixtures/yootheme-compatibility/sources/women-menu-dropdown.json";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { getWebsiteByIdOrSlug } from "@/lib/websites";
import { projectWordPressMenuContexts } from "@/lib/wordpressMenuContentProvider.server";
import { duplicateSublayoutNode } from "@/lib/builderSublayout";
import { DYNAMIC_CONTENT_SOURCE_CAPABILITIES, dynamicBindingDestinationCapability, dynamicContentCapabilityMatchesDescriptor } from "@/lib/dynamicContentCapabilities";

test("imported slideshow video and product tag selection have shared Inspector capabilities", () => {
  const mapped = mapYoothemeStaticContent(women);
  const fragment = mapped.sections[0].rows![0].columns[0].elements[0];
  const slideshow = fragment.sublayout!.rows[0].columns.flatMap(column => column.elements).find(block => block.kind === "slideshow")!;
  expect(slideshow.slides).toHaveLength(2);
  slideshow.slides!.forEach((slide, index) => {
    expect(slide.dynamicContext?.query?.databaseId).toBe([71, 73][index]);
    expect(slide.dynamicBindings?.videoUrl).toEqual({ path: "acf.image_featured.url", valueType: "url" });
    const capability = DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find(candidate => dynamicContentCapabilityMatchesDescriptor(candidate, slide.dynamicContext!));
    expect(capability?.label).toBe("Product Tag");
    expect(capability?.queryControls?.some(control => control.key === "databaseId")).toBe(true);
  });
  expect(dynamicBindingDestinationCapability("videoUrl")?.acceptedTypes).toEqual(["url"]);
});

test("Kids Overlay preserves the authored Product Tag video binding", () => {
  const mapped = mapYoothemeStaticContent({
    type: "fragment",
    children: [{
      type: "row",
      children: [{
        type: "column",
        children: [{
          type: "overlay",
          props: {
            image_height: 540,
            image_min_height: "360",
            image_width: 960,
            overlay_mode: "cover",
          },
          source: {
            query: { name: "productTags.customProductTag", arguments: { id: 75 } },
            props: {
              image_alt: { name: "field.image_intro.alt" },
              title: { name: "name" },
              video: { name: "field.image_featured.url" },
            },
          },
        }],
      }],
    }],
  });
  const fragment = mapped.sections[0].rows![0].columns[0].elements[0];
  const overlay = fragment.sublayout!.rows[0].columns[0].elements[0];

  expect(overlay.kind).toBe("overlay");
  expect(overlay.dynamicContext).toMatchObject({
    provider: "woocommerce",
    source: "product-tag",
    mode: "single",
    query: { databaseId: 75 },
  });
  expect(overlay.dynamicBindings).toMatchObject({
    imageAlt: { path: "acf.image_intro.alt", valueType: "string" },
    title: { path: "name", valueType: "string" },
    videoUrl: { path: "acf.image_featured.url", valueType: "url" },
  });
});

test("connected Kids Overlay resolves its Product Tag video", async () => {
  test.skip(!process.env.VERIFY_WOOLBERRY_NAV, "Opt-in read-only connected CMS verification");
  const mapped = mapYoothemeStaticContent({
    type: "fragment",
    children: [{ type: "row", children: [{ type: "column", children: [{
      type: "overlay",
      props: { image_height: 540, image_min_height: "360", image_width: 960, overlay_mode: "cover" },
      source: {
        query: { name: "productTags.customProductTag", arguments: { id: 75 } },
        props: {
          image_alt: { name: "field.image_intro.alt" },
          title: { name: "name" },
          video: { name: "field.image_featured.url" },
        },
      },
    }] }] }],
  });
  const website = await getWebsiteByIdOrSlug("woolberry");
  const result = await materializeBuilderDynamicContent(
    { version: 1, page: "header", updatedAt: "", sections: mapped.sections },
    { website },
  );
  const fragment = result.renderLayout.sections[0].rows![0].columns[0].elements[0];
  const overlay = fragment.sublayout!.rows[0].columns[0].elements[0];

  expect(overlay.title).toBeTruthy();
  expect(overlay.videoUrl).toMatch(/^https:\/\/.+\.(?:mp4|webm)(?:\?.*)?$/i);
  expect(result.diagnostics.filter(item => item.message?.includes("acf.image_featured.url"))).toHaveLength(0);
});

test("Women fragment retains Nav collections in the shared mapper", () => {
  const result = mapYoothemeStaticContent(women);
  expect(JSON.stringify(result.sections)).toContain('"kind":"nav"');
  expect(result.warnings).toEqual([]);
  const fragment = result.sections[0].rows![0].columns[0].elements[0];
  const copied = duplicateSublayoutNode(fragment);
  expect(copied.id).not.toBe(fragment.id);
  expect(copied.sublayout!.rows[0].columns[0].elements[0].dynamicContext).toEqual(fragment.sublayout!.rows[0].columns[0].elements[0].dynamicContext);
});

test("connected slideshow resolves both ACF videos independently of menu contents", async () => {
  test.skip(!process.env.VERIFY_WOOLBERRY_NAV, "Opt-in read-only connected CMS verification");
  const mapped = mapYoothemeStaticContent(women);
  const fragment = mapped.sections[0].rows![0].columns[0].elements[0];
  const slideshow = fragment.sublayout!.rows[0].columns.flatMap(column => column.elements).find(block => block.kind === "slideshow")!;
  fragment.sublayout!.rows[0].columns = [{ ...fragment.sublayout!.rows[0].columns[0], elements: [slideshow] }];
  const website = await getWebsiteByIdOrSlug("woolberry");
  const result = await materializeBuilderDynamicContent({ version: 1, page: "header", updatedAt: "", sections: mapped.sections }, { website });
  const slides = result.renderLayout.sections[0].rows![0].columns[0].elements[0].sublayout!.rows[0].columns[0].elements[0].slides!;
  expect(slides.map(slide => slide.title)).toEqual(["Revolutionary Muse Women", "Color Essentials Women"]);
  expect(slides.map(slide => slide.videoUrl)).toEqual([
    "https://woolberry.webpages.am/wp-content/uploads/yootheme/products-tag-revolutionary-muse-women.mp4",
    "https://woolberry.webpages.am/wp-content/uploads/yootheme/products-tag-color-essentials-women.mp4",
  ]);
  expect(result.diagnostics.filter(item => item.message?.includes("acf.image_featured.url"))).toHaveLength(0);
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
  expect(result.diagnostics.filter(item => item.message?.includes("acf.image_featured.url"))).toHaveLength(0);
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
