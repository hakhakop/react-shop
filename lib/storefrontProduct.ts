import type { StorefrontBuilderProduct } from "@/components/builder/StorefrontBuilderRenderer";
import { getWebsiteGraphQLEndpoint, graphqlFetch, safeDecodeURI } from "@/lib/graphql";
import type { SaaSWebsite } from "@/lib/websites";

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

type ProductAttribute = {
  name: string;
  label: string;
  options: string[];
};

type Product = {
  id: string;
  databaseId?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: WPImage | null;
  galleryImages?: { nodes: WPImage[] } | null;
  price?: string | null;
  attributes?: { nodes: ProductAttribute[] } | null;
};

type ProductData = {
  product: Product | null;
};

const PRODUCT_QUERY = `
  query SingleProduct($id: ID!) {
    product(id: $id, idType: SLUG) {
      id
      databaseId
      name
      slug
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
`;

export async function getStorefrontBuilderProductBySlug(
  slug: string,
  _options?: { website?: SaaSWebsite | null },
) {
  const endpoint = getWebsiteGraphQLEndpoint(_options?.website);
  const data = await graphqlFetch<ProductData>(
    PRODUCT_QUERY,
    { id: slug },
    { endpoint },
  );
  const product = data.product;
  if (!product) return null;

  const priceNumber = product.price ? parseFloat(product.price) : null;
  const priceFormatted =
    priceNumber !== null && !Number.isNaN(priceNumber)
      ? priceNumber.toLocaleString("hy-AM", {
          style: "currency",
          currency: "AMD",
          maximumFractionDigits: 0,
        })
      : null;
  const images: WPImage[] = [];
  const galleryNodes = product.galleryImages?.nodes ?? [];

  if (product.image?.sourceUrl) images.push(product.image);

  for (const image of galleryNodes) {
    if (
      image.sourceUrl &&
      !images.some((item) => item.sourceUrl === image.sourceUrl)
    ) {
      images.push(image);
    }
  }

  return {
    wpProductId: product.databaseId ?? null,
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      priceNumber,
      priceFormatted,
      imageUrl: product.image?.sourceUrl || undefined,
      images,
      attributes: (product.attributes?.nodes ?? []).map((attr) => ({
        name: safeDecodeURI(attr.name),
        label: safeDecodeURI(attr.label),
        options: attr.options.map(safeDecodeURI),
      })),
    } satisfies StorefrontBuilderProduct,
  };
}
