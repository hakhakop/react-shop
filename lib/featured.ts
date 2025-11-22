import { graphqlFetch } from "./graphql";

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
    products(where: { featured: true }, first: $limit) {
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

export async function getFeaturedProducts(limit?: number) {
  const data = await graphqlFetch<FeaturedProductsData>(FEATURED_QUERY, { limit: limit ?? 12 });
  return data.products.nodes;
}