import { expect, test } from "@playwright/test";
import {
  getNavigationRouteAliases,
  getSystemRouteAliases,
  resolveCommerceRouteCandidate,
  resolveNavigationRouteAlias,
  resolveSystemRouteAlias,
} from "@/lib/navigationTargets";
import {
  getBuilderPageKeyForHref,
  resolveScopedBuilderHref,
  resolveTenantPathHref,
} from "@/lib/scopedPreviewLinks";

const shell = {
  menuItems: [],
  namedMenus: [{
    id: "imported",
    name: "Imported",
    items: [{
      id: "new-in",
      label: "New In",
      url: "/new-in/",
      parentId: null,
      navigationTarget: {
        kind: "system",
        pageKey: "shop",
        sourceDatabaseId: 1416,
        uri: "/new-in/",
      },
    }, {
      id: "clothing",
      label: "Clothing",
      url: "/product-category/women/clothing/",
      parentId: null,
      navigationTarget: {
        kind: "term",
        taxonomy: "product_cat",
        slug: "clothing",
        sourceDatabaseId: 24,
        uri: "/product-category/women/clothing/",
      },
    }, {
      id: "blouse",
      label: "Black Oversized Blouse",
      url: "/product/black-oversized-blouse/",
      parentId: null,
      navigationTarget: {
        kind: "product",
        postType: "product",
        slug: "black-oversized-blouse",
        sourceDatabaseId: 187,
        uri: "/product/black-oversized-blouse/",
      },
    }],
  }],
} as never;

test("canonical menu system targets own tenant route aliases", () => {
  const aliases = getSystemRouteAliases(shell);
  expect(aliases).toEqual([{ path: "/new-in", pageKey: "shop" }]);
  expect(resolveSystemRouteAlias("/new-in/", aliases)).toBe("shop");
  expect(getBuilderPageKeyForHref("/new-in/", [], aliases)).toBe("shop");
});

test("the same authored alias resolves in Builder and tenant storefront modes", () => {
  const systemRouteAliases = getSystemRouteAliases(shell);
  const context = { websiteId: "woolberry", systemRouteAliases };
  expect(resolveScopedBuilderHref("/new-in/", context))
    .toBe("/app/websites/woolberry/builder?page=shop");
  expect(resolveTenantPathHref("/new-in/", context))
    .toBe("/woolberry/new-in/");
});

test("an assigned Shop Page is the Builder document behind both Shop aliases", () => {
  const systemRouteAliases = getSystemRouteAliases(shell);
  const context = {
    websiteId: "woolberry",
    systemRouteAliases,
    pages: [{ key: "page:new-in" as const, slug: "new-in", systemRole: "shop" as const }],
  };
  expect(resolveScopedBuilderHref("/new-in/", context))
    .toBe("/app/websites/woolberry/builder?page=page%3Anew-in");
  expect(resolveScopedBuilderHref("/shop", context))
    .toBe("/app/websites/woolberry/builder?page=page%3Anew-in");
});

test("typed commerce menu targets reuse shared category and product templates", () => {
  const aliases = getNavigationRouteAliases(shell);
  expect(resolveNavigationRouteAlias("/product-category/women/clothing/", aliases)).toMatchObject({
    pageKey: "product-category",
    target: { kind: "term", taxonomy: "product_cat", slug: "clothing", sourceDatabaseId: 24 },
  });
  expect(resolveNavigationRouteAlias("/product/black-oversized-blouse/", aliases)).toMatchObject({
    pageKey: "product-single",
    target: { kind: "product", slug: "black-oversized-blouse", sourceDatabaseId: 187 },
  });
  expect(getBuilderPageKeyForHref("/product-category/women/clothing/", [], aliases))
    .toBe("product-category");
  const context = { websiteId: "woolberry", systemRouteAliases: aliases };
  expect(resolveScopedBuilderHref("/product-category/women/clothing/", context))
    .toBe("/app/websites/woolberry/builder?page=product-category&category=clothing");
  expect(resolveScopedBuilderHref("/product/black-oversized-blouse/", context))
    .toBe("/app/websites/woolberry/builder?page=product-single&product=black-oversized-blouse");
});

test("canonical commerce paths remain direct hard-reload candidates outside menus", () => {
  expect(resolveCommerceRouteCandidate("/product-category/women/accessories/")).toMatchObject({
    pageKey: "product-category",
    target: { taxonomy: "product_cat", slug: "accessories" },
  });
  expect(resolveCommerceRouteCandidate("/product/black-oversized-blouse/")).toMatchObject({
    pageKey: "product-single",
    target: { postType: "product", slug: "black-oversized-blouse" },
  });
  expect(resolveCommerceRouteCandidate("/about/")).toBeNull();
});
