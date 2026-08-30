import { getProducts, type ProductNode } from "@/lib/products";
import { getWooCommerceConnection, hasUsableWooCommerceConnection } from "@/lib/woocommerce";
import {
  fetchWooCommerceProductRecords,
  type WooCommerceProductRecord,
} from "@/lib/woocommerceDynamicContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

const text = (value: unknown) => typeof value === "string" ? value : undefined;
const records = (value: unknown) => Array.isArray(value)
  ? value.filter((entry): entry is Record<string, unknown> => Boolean(entry) && typeof entry === "object" && !Array.isArray(entry))
  : [];

export function normalizeWooCommerceProductRecord(product: WooCommerceProductRecord): ProductNode | null {
  const databaseId = typeof product.id === "number" ? product.id : Number(product.id);
  const slug = text(product.slug);
  const name = text(product.name);
  if (!Number.isFinite(databaseId) || !slug || !name) return null;
  const images = records(product.images);
  const primaryImage = images[0];
  return {
    id: String(databaseId),
    databaseId,
    slug,
    name,
    description: text(product.description),
    price: text(product.price),
    featured: typeof product.featured === "boolean" ? product.featured : null,
    onSale: typeof product.on_sale === "boolean" ? product.on_sale : null,
    image: primaryImage && text(primaryImage.src)
      ? { sourceUrl: text(primaryImage.src)!, altText: text(primaryImage.alt) ?? null }
      : null,
    productCategories: {
      nodes: records(product.categories).flatMap((category) => {
        const categoryName = text(category.name);
        const categorySlug = text(category.slug);
        return categoryName && categorySlug ? [{ name: categoryName, slug: categorySlug }] : [];
      }),
    },
    attributes: {
      nodes: records(product.attributes).flatMap((attribute) => {
        const attributeName = text(attribute.name);
        if (!attributeName) return [];
        return [{
          name: attributeName,
          label: attributeName,
          options: Array.isArray(attribute.options)
            ? attribute.options.filter((option): option is string => typeof option === "string")
            : [],
        }];
      }),
    },
  };
}

/** Resolve Shop products through the tenant's commerce provider, independently of WordPress Page content. */
export async function getShopProducts(website?: SaaSWebsite | null): Promise<ProductNode[]> {
  if (!hasUsableWooCommerceConnection(getWooCommerceConnection(website))) {
    return getProducts({ website });
  }
  const products = await fetchWooCommerceProductRecords({
    website,
    descriptor: {
      provider: "woocommerce",
      source: "product",
      mode: "collection",
      query: { quantity: 100 },
    },
  });
  return products.flatMap((product) => {
    const normalized = normalizeWooCommerceProductRecord(product);
    return normalized ? [normalized] : [];
  });
}
