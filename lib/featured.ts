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
  query FeaturedProducts {
    products(where: { featured: true }, first: 12) {
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

export async function getFeaturedProducts() {
  const data = await graphqlFetch<FeaturedProductsData>(FEATURED_QUERY);
  return data.products.nodes;
}