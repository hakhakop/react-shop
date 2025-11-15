// wc-store/lib/products.ts

import { graphqlFetch } from "./graphql";

/**
 * Shared product types
 */

export type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

export type ProductNode = {
  id: string;
  slug: string;
  name: string;
  image?: WPImage | null;
  price?: string | null;
  attributes?: {
    nodes: {
      name: string;
      label?: string | null;
      options?: string[] | null;
    }[];
  } | null;
};

type ProductsData = {
  products: {
    nodes: ProductNode[];
  };
};

const PRODUCTS_QUERY = `
  query ProductsForHome {
    products(first: 12) {
      nodes {
        id
        slug
        name
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price(format: RAW)
        }
        ... on VariableProduct {
          price(format: RAW)
        }
      }
    }
  }
`;

/**
 * Fetch a list of products for the home page.
 */
export async function getProducts(): Promise<ProductNode[]> {
  const data = await graphqlFetch<ProductsData>(PRODUCTS_QUERY);
  return data.products?.nodes ?? [];
}

/**
 * Category + products by category slug
 *
 * Here we:
 *  - fetch category meta by slug using an ID variable ($id: ID!)
 *  - fetch products filtered by category slug using a String variable ($slug: String!)
 */

export type CategoryWithProducts = {
  id: string;
  name: string;
  slug: string;
  products: ProductNode[];
};

type CategoryProductsResponse = {
  productCategory: {
    id: string;
    name: string;
    slug: string;
  } | null;
  products: {
    nodes: ProductNode[];
  };
};

const CATEGORY_PRODUCTS_QUERY = `
  query ProductsByCategory($id: ID!, $slug: String!) {
    productCategory(id: $id, idType: SLUG) {
      id
      name
      slug
    }
    products(first: 200, where: { category: $slug }) {
      nodes {
        __typename
        id
        slug
        name
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price(format: RAW)
          attributes {
            nodes {
              name
              label
              options
            }
          }
        }
        ... on VariableProduct {
          price(format: RAW)
          attributes {
            nodes {
              name
              label
              options
            }
          }
        }
      }
    }
  }
`;

export async function getCategoryProductsBySlug(
  slug: string
): Promise<CategoryWithProducts | null> {
  const data = await graphqlFetch<CategoryProductsResponse>(
    CATEGORY_PRODUCTS_QUERY,
    {
      id: slug,
      slug,
    }
  );

  if (!data.productCategory) {
    return null;
  }

  return {
    id: data.productCategory.id,
    name: data.productCategory.name,
    slug: data.productCategory.slug,
    products: data.products?.nodes ?? [],
  };
}