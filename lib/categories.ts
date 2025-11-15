// wc-store/lib/categories.ts

import { graphqlFetch } from "./graphql";

export type RawCategoryNode = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  parentDatabaseId?: number | null;
};

export type CategoryTreeItem = {
  id: string;
  dbId: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: CategoryTreeItem[];
};

type CategoriesResponse = {
  productCategories: {
    nodes: RawCategoryNode[];
  };
};

const CATEGORY_TREE_QUERY = `
  query CategoryTree {
    productCategories(first: 200, where: { hideEmpty: true }) {
      nodes {
        id
        databaseId
        name
        slug
        parentDatabaseId
      }
    }
  }
`;

/**
 * Build a tree out of flat WooCommerce categories using parentDatabaseId.
 */
export async function getCategoryTree(): Promise<CategoryTreeItem[]> {
  const data = await graphqlFetch<CategoriesResponse>(CATEGORY_TREE_QUERY);

  const flat = data.productCategories?.nodes ?? [];

  // Map dbId -> CategoryTreeItem
  const byId = new Map<number, CategoryTreeItem>();

  for (const cat of flat) {
    byId.set(cat.databaseId, {
      id: cat.id,
      dbId: cat.databaseId,
      name: cat.name,
      slug: cat.slug,
      parentId:
        typeof cat.parentDatabaseId === "number" &&
        cat.parentDatabaseId > 0
          ? cat.parentDatabaseId
          : null,
      children: [],
    });
  }

  const roots: CategoryTreeItem[] = [];

  // Attach children to parents via parentId (which is parentDatabaseId)
  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  }

  // Sort roots and children alphabetically
  function sortTree(nodes: CategoryTreeItem[]) {
    nodes.sort((a, b) => a.name.localeCompare(b.name));
    for (const n of nodes) {
      if (n.children.length > 0) {
        sortTree(n.children);
      }
    }
  }

  sortTree(roots);

  return roots;
}