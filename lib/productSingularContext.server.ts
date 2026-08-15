import {
  getDynamicItemContextValue,
  type DynamicContentData,
  type DynamicItemContext,
} from "@/lib/dynamicContent";
import { resolveWooCommerceProductContexts } from "@/lib/woocommerceDynamicContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

type MetadataRecord = Record<string, DynamicContentData>;

const records = (metadata: MetadataRecord | undefined) => {
  const items = metadata?.items;
  return Array.isArray(items)
    ? items.filter((item): item is MetadataRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : [];
};

const text = (value: DynamicContentData | undefined) =>
  typeof value === "string" ? value : undefined;

const identifier = (value: DynamicContentData | undefined) =>
  typeof value === "string" || typeof value === "number" ? value : undefined;

export type CanonicalProductSingular = {
  dynamicContext: DynamicItemContext;
  product: {
    id: string;
    databaseId?: number | null;
    name: string;
    slug: string;
    description?: string | null;
    image?: { sourceUrl: string; altText?: string | null } | null;
    galleryImages?: { nodes: { sourceUrl: string; altText?: string | null }[] } | null;
    price?: string | null;
    attributes?: { nodes: { name: string; label: string; options: string[] }[] } | null;
  };
  taxonomyTerms: { taxonomy: string; id: string; slug?: string }[];
};

export async function getCanonicalProductSingularBySlug(
  slug: string,
  website?: SaaSWebsite | null,
): Promise<CanonicalProductSingular | null> {
  const [dynamicContext] = await resolveWooCommerceProductContexts({
    website,
    descriptor: {
      provider: "woocommerce",
      source: "product",
      mode: "single",
      query: { slug },
    },
  });
  if (!dynamicContext?.id) return null;

  const name = getDynamicItemContextValue(dynamicContext, "title", "string");
  const resolvedSlug = getDynamicItemContextValue(dynamicContext, "slug", "string");
  if (!name || !resolvedSlug) return null;

  const primaryImage = getDynamicItemContextValue(dynamicContext, "image", "media");
  const priceAmount = getDynamicItemContextValue(dynamicContext, "price.amount", "number");
  const gallery = records(getDynamicItemContextValue(dynamicContext, "gallery", "metadata"));
  const attributes = records(getDynamicItemContextValue(dynamicContext, "attributes", "metadata"));
  const categories = records(getDynamicItemContextValue(dynamicContext, "categories", "metadata"));
  const id = String(dynamicContext.id);
  const numericId = typeof dynamicContext.id === "number" ? dynamicContext.id : Number(dynamicContext.id);

  return {
    dynamicContext,
    product: {
      id,
      databaseId: Number.isFinite(numericId) ? numericId : null,
      name,
      slug: resolvedSlug,
      description: getDynamicItemContextValue(dynamicContext, "description", "richText") ?? null,
      image: primaryImage ? { sourceUrl: primaryImage.url, altText: primaryImage.alt ?? null } : null,
      galleryImages: {
        nodes: gallery.flatMap((image) => {
          const url = text(image.url);
          return url ? [{ sourceUrl: url, altText: text(image.alt) ?? null }] : [];
        }),
      },
      price: priceAmount !== undefined
        ? String(priceAmount)
        : getDynamicItemContextValue(dynamicContext, "price", "string") ?? null,
      attributes: {
        nodes: attributes.flatMap((attribute) => {
          const attributeName = text(attribute.name);
          if (!attributeName) return [];
          const options = Array.isArray(attribute.options)
            ? attribute.options.filter((option): option is string => typeof option === "string")
            : [];
          return [{ name: attributeName, label: attributeName, options }];
        }),
      },
    },
    taxonomyTerms: categories.flatMap((category) => {
      const termId = identifier(category.id);
      const categorySlug = text(category.slug);
      return termId === undefined
        ? []
        : [{ taxonomy: "product-category", id: String(termId), ...(categorySlug ? { slug: categorySlug } : {}) }];
    }),
  };
}
