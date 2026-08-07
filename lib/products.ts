// wc-store/lib/products.ts

import { getWebsiteGraphQLEndpoint, graphqlFetch, safeDecodeURI } from "./graphql";
import type { SaaSWebsite } from "@/lib/websites";

/**
 * Shared product types
 */

export type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

export type ProductNode = {
  id: string;
  databaseId?: number | null;
  slug: string;
  name: string;
  description?: string | null;
  image?: WPImage | null;
  galleryImages?: { nodes: WPImage[] } | null;
  price?: string | null;
  featured?: boolean | null;
  onSale?: boolean | null;
  productCategories?: {
    nodes: {
      name: string;
      slug: string;
    }[];
  } | null;
  attributes?: {
    nodes: {
      name: string;
      label?: string | null;
      options?: string[] | null;
    }[];
  } | null;
};

type ProductsOptions = {
  website?: SaaSWebsite | null;
};

type ProductsData = {
  products: {
    nodes: ProductNode[];
  };
};

const PRODUCT_NODE_FIELDS = `
  __typename
  id
  slug
  name
  image {
    sourceUrl
    altText
  }
  ... on Product {
    featured
    productCategories {
      nodes {
        name
        slug
      }
    }
  }
  ... on SimpleProduct {
    onSale
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
    onSale
    price(format: RAW)
    attributes {
      nodes {
        name
        label
        options
      }
    }
  }
`;

const PRODUCT_DETAIL_FIELDS = `
  id
  databaseId
  slug
  name
  description
  image {
    sourceUrl
    altText
  }
  galleryImages(first: 10) {
    nodes {
      sourceUrl
      altText
    }
  }
  ... on Product {
    productCategories {
      nodes {
        name
        slug
      }
    }
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
`;

const PRODUCTS_QUERY = `
  query ProductsForHome {
    products(first: 200, where: { supportedTypesOnly: true }) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
    }
  }
`;

/**
 * Fetch a list of products for the home page.
 *
 * Existing env-based storefronts use WPGraphQL. The optional options argument
 * is kept so website-scoped callers can pass context without breaking the
 * legacy fetch path.
 */
export async function getProducts(_options?: ProductsOptions): Promise<ProductNode[]> {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const data = await graphqlFetch<ProductsData>(PRODUCTS_QUERY, undefined, {
    endpoint,
  });
  return data.products?.nodes ?? [];
}

/**
 * Category + products by category slug
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
    products(first: 200, where: { category: $slug, supportedTypesOnly: true }) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
    }
  }
`;

export async function getCategoryProductsBySlug(
  slug: string,
  _options?: ProductsOptions,
): Promise<CategoryWithProducts | null> {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const data = await graphqlFetch<CategoryProductsResponse>(
    CATEGORY_PRODUCTS_QUERY,
    {
      id: slug,
      slug,
    },
    { endpoint },
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

/**
 * Generic grid product fetcher for Page Builder blocks
 */
type GridProductsResponse = {
  products: {
    nodes: ProductNode[];
  };
};

const FEATURED_PRODUCTS_QUERY = `
  query FeaturedProducts($limit: Int!) {
    products(first: $limit, where: { featured: true, supportedTypesOnly: true }) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
    }
  }
`;

const CATEGORY_ID_PRODUCTS_QUERY = `
  query ProductsByCategoryId($limit: Int!, $catId: [String]) {
    products(first: $limit, where: { categoryIn: $catId, supportedTypesOnly: true }) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
    }
  }
`;

const ALL_PRODUCTS_QUERY = `
  query AllProducts($limit: Int!) {
    products(first: $limit, where: { supportedTypesOnly: true }) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
    }
  }
`;

export async function getProductsForGrid(options: {
  limit: number;
  source?: "featured" | "category" | "all";
  categoryId?: string;
  website?: SaaSWebsite | null;
}): Promise<ProductNode[]> {
  const { limit, source = "all", categoryId } = options;
  const endpoint = getWebsiteGraphQLEndpoint(options.website);

  if ((source === "category" || (categoryId && categoryId !== "all")) && categoryId && categoryId !== "all") {
    try {
      const data = await graphqlFetch<GridProductsResponse>(
        CATEGORY_ID_PRODUCTS_QUERY,
        {
          limit,
          catId: [categoryId],
        },
        { endpoint },
      );
      if (data?.products?.nodes?.length) {
        return data.products.nodes;
      }
    } catch (e) {}
  }

  if (source === "all") {
    try {
      const data = await graphqlFetch<GridProductsResponse>(
        ALL_PRODUCTS_QUERY,
        { limit },
        { endpoint },
      );
      if (data?.products?.nodes?.length) {
        return data.products.nodes;
      }
    } catch (e) {}
  }

  try {
    const data = await graphqlFetch<GridProductsResponse>(
      FEATURED_PRODUCTS_QUERY,
      { limit },
      { endpoint },
    );
    if (data?.products?.nodes?.length) {
      return data.products.nodes;
    }
  } catch (e) {}

  return [];
}

type ProductData = {
  product: ProductNode | null;
};

type ProductDetailNode = Omit<ProductNode, "attributes"> & {
  attributes?: {
    nodes: {
      name: string;
      label: string;
      options: string[];
    }[];
  } | null;
};

const PRODUCT_QUERY = `
  query SingleProduct($id: ID!) {
    product(id: $id, idType: SLUG) {
      ${PRODUCT_DETAIL_FIELDS}
    }
  }
`;

export async function getProductBySlug(
  slug: string,
  _options?: ProductsOptions,
): Promise<ProductDetailNode | null> {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const data = await graphqlFetch<ProductData>(
    PRODUCT_QUERY,
    { id: slug },
    { endpoint },
  );
  const product = data.product;
  if (!product) return null;

  return {
    ...product,
    attributes: product.attributes
      ? {
          nodes: product.attributes.nodes.map((attribute) => ({
            name: safeDecodeURI(attribute.name),
            label: safeDecodeURI(attribute.label ?? attribute.name),
            options: (attribute.options ?? []).map(safeDecodeURI),
          })),
        }
      : product.attributes,
  };
}

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($search: String!) {
    products(first: 24, where: { search: $search, supportedTypesOnly: true }) {
      nodes {
        ${PRODUCT_NODE_FIELDS}
      }
    }
  }
`;

export async function searchProducts(
  search: string,
  _options?: ProductsOptions,
): Promise<ProductNode[]> {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const term = search.trim();
  if (!term) return [];

  const data = await graphqlFetch<GridProductsResponse>(
    SEARCH_PRODUCTS_QUERY,
    { search: term },
    { endpoint },
  );
  return data.products?.nodes ?? [];
}
