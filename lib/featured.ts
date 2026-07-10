import { getWebsiteGraphQLEndpoint, graphqlFetch } from "./graphql";
import type { SaaSWebsite } from "@/lib/websites";

export type FeaturedProduct = {
  id: string;
  slug: string;
  name: string;
  image?: {
    sourceUrl: string;
    altText?: string | null;
  } | null;
  price?: string | null;
};

export type FeaturedProductsData = {
  products: {
    nodes: FeaturedProduct[];
  };
};

const FEATURED_QUERY = `
  query FeaturedProducts($limit: Int) {
    products(where: { featured: true, supportedTypesOnly: true }, first: $limit) {
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

export async function getFeaturedProducts(
  limit?: number,
  _options?: { website?: SaaSWebsite | null },
) {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const data = await graphqlFetch<FeaturedProductsData>(FEATURED_QUERY, {
    limit: limit ?? 12,
  }, { endpoint });
  return data.products.nodes;
}
