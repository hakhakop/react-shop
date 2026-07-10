// wc-store/lib/categories.ts

import { getWebsiteGraphQLEndpoint, graphqlFetch } from "./graphql";
import type { SaaSWebsite } from "@/lib/websites";

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
export async function getCategoryTree(_options?: {
  website?: SaaSWebsite | null;
}): Promise<CategoryTreeItem[]> {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const data = await graphqlFetch<CategoriesResponse>(
    CATEGORY_TREE_QUERY,
    undefined,
    { endpoint },
  );

  const flat = data.productCategories?.nodes ?? [];

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

  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)!.children.push(item);
    } else {
      roots.push(item);
    }
  }

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
