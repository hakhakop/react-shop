// wc-store/lib/navigation.ts

import { getWebsiteGraphQLEndpoint, graphqlFetch } from "./graphql";
import type { SaaSWebsite } from "@/lib/websites";

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

export async function getProductCategories(_options?: {
  website?: SaaSWebsite | null;
}): Promise<ProductCategory[]> {
  try {
    const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
    const data = await graphqlFetch<CategoriesData>(
      PRODUCT_CATEGORIES_QUERY,
      undefined,
      { endpoint },
    );
    const all = data.productCategories?.nodes ?? [];

    const bySlug = new Map<string, ProductCategory>();
    for (const cat of all) {
      if (!bySlug.has(cat.slug)) {
        bySlug.set(cat.slug, cat);
      }
    }

    const unique = Array.from(bySlug.values());
    unique.sort((a, b) => a.name.localeCompare(b.name, "en"));

    return unique;
  } catch {
    return [];
  }
}
