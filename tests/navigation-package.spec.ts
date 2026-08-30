import { expect, test } from "@playwright/test";
import type { BuilderMenuPresentationMap, ReactMenuItem } from "@/lib/builderShell";
import {
  createPortableNavigationPackage,
  makeNavigationUrlPortable,
  materializePortableNavigation,
  parsePortableNavigationPackage,
  previewPortableNavigationPackage,
  type PortableNavigationTarget,
} from "@/lib/navigationPackage";

const items: ReactMenuItem[] = [
  { id: "menu-1", label: "Home", url: "https://source.example/about/", parentId: null },
  { id: "menu-2", label: "News", url: "https://source.example/category/news/", parentId: null },
  { id: "menu-3", label: "Shop category", url: "https://source.example/product-category/shirts/", parentId: null },
  { id: "menu-4", label: "Read", url: "https://source.example/hello-world/", parentId: "menu-2", subtitle: "Featured story" },
  { id: "menu-5", label: "Partner", url: "https://external.example/sale", parentId: null, target: "_blank" },
  { id: "menu-6", label: "Details", url: "#details", parentId: "menu-1" },
  { id: "menu-7", label: "Duplicate", url: "/one", parentId: null },
  { id: "menu-8", label: "Duplicate", url: "/two", parentId: null },
];

const targets: Record<string, PortableNavigationTarget> = {
  "menu-1": { kind: "page", postType: "page", slug: "about", sourceDatabaseId: 10, uri: "/about/" },
  "menu-2": { kind: "term", taxonomy: "category", slug: "news", sourceDatabaseId: 20, uri: "/category/news/" },
  "menu-3": { kind: "term", taxonomy: "product_cat", slug: "shirts", sourceDatabaseId: 30, uri: "/product-category/shirts/" },
  "menu-4": { kind: "post", postType: "post", slug: "hello-world", sourceDatabaseId: 40, uri: "/hello-world/" },
  "menu-5": { kind: "custom", url: "https://external.example/sale" },
  "menu-6": { kind: "anchor", url: "#details" },
  "menu-7": { kind: "custom", uri: "/one" },
  "menu-8": { kind: "custom", uri: "/two" },
};

const presentation: BuilderMenuPresentationMap = {
  "menu-2": {
    showHeading: true,
    icon: "grid",
    submenuLayout: "mega",
    submenuColumns: 3,
    submenuWidth: "720px",
    mobileAccordion: true,
    badgeText: "New",
  },
};

test("portable navigation round-trip preserves hierarchy, typed targets, duplicate identities, and presentation", () => {
  const exported = createPortableNavigationPackage({
    name: "Controlled navigation",
    intendedLocation: "PRIMARY",
    sourceOrigin: "https://source.example",
    sourceDatabaseId: 7,
    items,
    presentation,
    targetsByItemId: targets,
    exportedAt: "2026-08-30T00:00:00.000Z",
  });
  const parsed = parsePortableNavigationPackage(JSON.parse(JSON.stringify(exported)));
  const destinationIds = Object.fromEntries(parsed.menu.items.map((item, index) => [item.key, 1000 + index]));
  const installed = materializePortableNavigation(parsed, destinationIds);

  expect(parsed.menu.name).toBe("Controlled navigation");
  expect(parsed.menu.intendedLocation).toBe("PRIMARY");
  expect(parsed.menu.items.map((item) => item.label)).toEqual(items.map((item) => item.label));
  expect(new Set(parsed.menu.items.map((item) => item.key)).size).toBe(items.length);
  expect(parsed.menu.items.filter((item) => item.label === "Duplicate").map((item) => item.key)[0])
    .not.toBe(parsed.menu.items.filter((item) => item.label === "Duplicate").map((item) => item.key)[1]);

  const blogCategory = parsed.menu.items.find((item) => item.label === "News")!;
  const productCategory = parsed.menu.items.find((item) => item.label === "Shop category")!;
  expect(blogCategory.target.taxonomy).toBe("category");
  expect(productCategory.target.taxonomy).toBe("product_cat");
  expect(blogCategory.target.sourceDatabaseId).toBe(20);

  const installedNews = installed.items.find((item) => item.label === "News")!;
  const installedPost = installed.items.find((item) => item.label === "Read")!;
  expect(installedPost.parentId).toBe(installedNews.id);
  expect(installedPost.subtitle).toBe("Featured story");
  expect(installed.presentation[installedNews.id]).toEqual(presentation["menu-2"]);
});

test("connected absolute URLs become portable while external and anchor links remain unchanged", () => {
  expect(makeNavigationUrlPortable("https://source.example/shop?q=shirt#top", "https://source.example"))
    .toBe("/shop?q=shirt#top");
  expect(makeNavigationUrlPortable("https://external.example/shop", "https://source.example"))
    .toBe("https://external.example/shop");
  expect(makeNavigationUrlPortable("#details", "https://source.example")).toBe("#details");

  const exported = createPortableNavigationPackage({
    name: "Links",
    sourceOrigin: "https://source.example",
    items,
    presentation,
    targetsByItemId: targets,
  });
  const materialized = materializePortableNavigation(exported);
  expect(materialized.items.find((item) => item.label === "Home")?.url).toBe("/about/");
  expect(materialized.items.find((item) => item.label === "Partner")?.url).toBe("https://external.example/sale");
  expect(materialized.items.find((item) => item.label === "Details")?.url).toBe("#details");
});

test("invalid hierarchy is rejected instead of silently flattening it", () => {
  const exported = createPortableNavigationPackage({ name: "Broken", items });
  exported.menu.items[0].parentKey = "missing-parent";
  expect(() => parsePortableNavigationPackage(exported)).toThrow(/missing parent/i);
});

test("a child listed before its parent still exports the canonical relationship", () => {
  const exported = createPortableNavigationPackage({
    name: "Out of order",
    items: [items[3], items[1]],
    targetsByItemId: targets,
  });
  const child = exported.menu.items.find((item) => item.label === "Read")!;
  const parent = exported.menu.items.find((item) => item.label === "News")!;
  expect(child.parentKey).toBe(parent.key);
  expect(materializePortableNavigation(exported).items.find((item) => item.label === "Read")?.parentId)
    .toBe(`portable-${parent.key}`);
});

test("circular hierarchy is rejected", () => {
  const exported = createPortableNavigationPackage({ name: "Cycle", items: items.slice(0, 2) });
  exported.menu.items[0].parentKey = exported.menu.items[1].key;
  exported.menu.items[1].parentKey = exported.menu.items[0].key;
  expect(() => parsePortableNavigationPackage(exported)).toThrow(/circular/i);
});

test("a WordPress-independent WebPages menu previews and installs without a CMS", () => {
  const independentItems: ReactMenuItem[] = [
    { id: "home", label: "Home", url: "/" },
    { id: "about", label: "About", url: "/about" },
    { id: "details", label: "Details", url: "#details", parentId: "about", subtitle: "On this page" },
    { id: "external", label: "External", url: "https://example.org/resource" },
  ];
  const packageValue = createPortableNavigationPackage({
    name: "Independent",
    items: independentItems,
    presentation: { about: presentation["menu-2"] },
    targetsByItemId: {
      home: { kind: "system", pageKey: "home", uri: "/" },
      about: { kind: "webpages-page", pageKey: "page:about", slug: "about", uri: "/about" },
      details: { kind: "anchor", url: "#details" },
      external: { kind: "custom", url: "https://example.org/resource" },
    },
  });
  const preview = previewPortableNavigationPackage(packageValue, false);
  const installed = materializePortableNavigation(packageValue);

  expect(preview.unresolvedCount).toBe(0);
  expect(preview.portableCount).toBe(4);
  expect(installed.items.map((item) => item.url)).toEqual(["/", "/about", "#details", "https://example.org/resource"]);
  expect(installed.items.find((item) => item.label === "Details")?.parentId)
    .toBe(installed.items.find((item) => item.label === "About")?.id);
  expect(installed.presentation[installed.items.find((item) => item.label === "About")!.id])
    .toEqual(presentation["menu-2"]);
});

test("WordPress-only targets are reported but do not block unrelated local installation", () => {
  const packageValue = createPortableNavigationPackage({
    name: "Mixed",
    items: [
      { id: "local", label: "Local", url: "/about" },
      { id: "wp", label: "WordPress post", url: "/source-post" },
      { id: "anchor", label: "Anchor", url: "#more" },
    ],
    targetsByItemId: {
      local: { kind: "webpages-page", pageKey: "page:about", slug: "about", uri: "/about" },
      wp: { kind: "post", postType: "post", slug: "source-post", uri: "/source-post" },
      anchor: { kind: "anchor", url: "#more" },
    },
  });
  const preview = previewPortableNavigationPackage(packageValue, false);
  const installed = materializePortableNavigation(packageValue);

  expect(preview.unresolvedCount).toBe(1);
  expect(preview.resolutions.find((item) => item.key === packageValue.menu.items[1].key)?.message)
    .toMatch(/without a WordPress connection/i);
  expect(installed.items).toHaveLength(3);
  expect(installed.items[1].url).toBe("/source-post");
  expect(installed.items[1].navigationTarget?.kind).toBe("post");
});

test("assigned-source page references can remain typed when pretty permalinks are unavailable", () => {
  const packageValue = parsePortableNavigationPackage({
    format: "webpages.navigation",
    version: 1,
    exportedAt: "2026-08-30T00:00:00.000Z",
    menu: {
      name: "Source pages",
      intendedLocation: null,
      items: [{
        key: "posts-page",
        parentKey: null,
        order: 0,
        label: "Stories",
        target: { kind: "page", sourceDatabaseId: 1501, uri: "/?page_id=1501" },
        linkTarget: "_self",
      }],
    },
  });
  expect(packageValue.menu.items[0].target).toMatchObject({
    kind: "page",
    sourceDatabaseId: 1501,
  });
});
