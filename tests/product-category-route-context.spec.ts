import { expect, test } from "@playwright/test";
import { projectProductCategoryRouteContext } from "../lib/productCategoryContext.server";

test("category route projection keeps the current term first and all ancestors after it", () => {
  const context = projectProductCategoryRouteContext({
    id: 63,
    name: "Clothing",
    slug: "clothing-2-2",
    description: "",
    parentId: 62,
    ancestry: [
      { id: 23, name: "Kids", slug: "kids" },
      { id: 62, name: "Babies", slug: "babies-0-24-months" },
    ],
  }, "/product-category/kids/babies-0-24-months/clothing-2-2");

  expect(context.taxonomyTerms).toEqual([
    { taxonomy: "product_cat", id: "63", slug: "clothing-2-2" },
    { taxonomy: "product_cat", id: "23", slug: "kids" },
    { taxonomy: "product_cat", id: "62", slug: "babies-0-24-months" },
  ]);
});
