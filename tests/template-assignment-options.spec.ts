import { expect, test } from "@playwright/test";
import { flattenProductCategories } from "@/lib/templateAssignmentOptions.server";

test("template category choices retain WooCommerce hierarchy while sorting siblings", () => {
  expect(flattenProductCategories([
    { id: 12, name: "Clothing", slug: "clothing", parent: 10 },
    { id: 10, name: "Kids", slug: "kids", parent: 0 },
    { id: 13, name: "Accessories", slug: "accessories", parent: 10 },
    { id: 20, name: "Women", slug: "women", parent: 0 },
  ])).toEqual([
    { id: "10", label: "Kids", slug: "kids", depth: 0 },
    { id: "13", label: "Accessories", slug: "accessories", parentId: "10", depth: 1 },
    { id: "12", label: "Clothing", slug: "clothing", parentId: "10", depth: 1 },
    { id: "20", label: "Women", slug: "women", depth: 0 },
  ]);
});
