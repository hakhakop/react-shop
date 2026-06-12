// wc-store/lib/navigation.ts

import { graphqlFetch } from "./graphql";

/**
 * WORDPRESS MENU "Main"
 */

export type MenuItem = {
  id: string;
  label: string;
  url: string;
  path?: string | null;
  parentId?: string | null;
  children?: MenuItem[];
};

/**
 * WOOCOMMERCE PRODUCT CATEGORIES
 */

export type ProductCategory = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  count: number;
};

type CategoriesData = {
  productCategories: {
    nodes: ProductCategory[];
  };
};

/**
 * We fetch only TOP-LEVEL categories (parent = 0), hide empty,
 * then deduplicate by slug so "Accessories" doesn't appear 4 times.
 */
const PRODUCT_CATEGORIES_QUERY = `
  query ProductCategories {
    productCategories(
      first: 50
      where: { hideEmpty: true, parent: 0 }
    ) {
      nodes {
        id
        databaseId
        name
        slug
        count
      }
    }
  }
`;

export async function getProductCategories(): Promise<ProductCategory[]> {
  try {
    const data = await graphqlFetch<CategoriesData>(PRODUCT_CATEGORIES_QUERY);
    const all = data.productCategories?.nodes ?? [];

    // Deduplicate by slug
    const bySlug = new Map<string, ProductCategory>();
    for (const cat of all) {
      if (!bySlug.has(cat.slug)) {
        bySlug.set(cat.slug, cat);
      }
    }

    // Return sorted by name for nicer UI
    const unique = Array.from(bySlug.values());
    unique.sort((a, b) => a.name.localeCompare(b.name, "en"));

    return unique;
  } catch {
    return [];
  }
}
