import type { CategoryTreeItem } from "@/lib/categories";
import type { ProductNode } from "@/lib/products";

export function getCategorySlugsForSelection(
  selectedSlug: string,
  categoryTree: CategoryTreeItem[] = [],
) {
  const findCategory = (
    nodes: CategoryTreeItem[],
  ): CategoryTreeItem | null => {
    for (const node of nodes) {
      if (node.slug === selectedSlug) return node;
      const childMatch = findCategory(node.children ?? []);
      if (childMatch) return childMatch;
    }
    return null;
  };

  const selectedCategory = findCategory(categoryTree);
  if (!selectedCategory) return new Set([selectedSlug]);

  const slugs = new Set<string>();
  const collect = (node: CategoryTreeItem) => {
    slugs.add(node.slug);
    node.children?.forEach(collect);
  };
  collect(selectedCategory);
  return slugs;
}

export function productMatchesCategorySelection(
  product: ProductNode,
  selectedSlug: string | null,
  categoryTree: CategoryTreeItem[] = [],
) {
  if (!selectedSlug) return true;
  const acceptedSlugs = getCategorySlugsForSelection(
    selectedSlug,
    categoryTree,
  );
  return (product.productCategories?.nodes ?? []).some((category) =>
    acceptedSlugs.has(category.slug),
  );
}
