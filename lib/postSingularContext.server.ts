import {
  getDynamicItemContextValue,
  type DynamicContentData,
  type DynamicItemContext,
} from "@/lib/dynamicContent";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import type { SaaSWebsite } from "@/lib/websites";
import { getStorefrontContentHref } from "@/lib/storefrontContentHref";

type MetadataRecord = Record<string, DynamicContentData>;
const records = (value: DynamicContentData | undefined) =>
  Array.isArray((value as MetadataRecord | undefined)?.items)
    ? ((value as MetadataRecord).items as DynamicContentData[]).filter(
        (item): item is MetadataRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : [];
const text = (value: DynamicContentData | undefined) => typeof value === "string" ? value : undefined;
const identifier = (value: DynamicContentData | undefined) =>
  typeof value === "string" || typeof value === "number" ? value : undefined;

export type CanonicalPostSingular = {
  dynamicContext: DynamicItemContext;
  post: {
    id: string;
    databaseId?: number;
    slug: string;
    uri?: string;
    title: string;
    content?: string;
    excerpt?: string;
    featuredImage?: { sourceUrl: string; altText?: string };
  };
  taxonomyTerms: { taxonomy: string; id: string; slug?: string }[];
};

export async function getCanonicalPostSingularBySlug(
  slug: string,
  website?: SaaSWebsite | null,
): Promise<CanonicalPostSingular | null> {
  const [dynamicContext] = await resolveDynamicContentContexts({
    website,
    descriptor: { provider: "wordpress", source: "post", mode: "single", query: { slug } },
  });
  if (!dynamicContext?.id) return null;
  const resolvedSlug = getDynamicItemContextValue(dynamicContext, "slug", "string");
  const title = getDynamicItemContextValue(dynamicContext, "title", "string");
  if (!resolvedSlug || !title) return null;
  const image = getDynamicItemContextValue(dynamicContext, "featuredImage", "media");
  const databaseIdValue = getDynamicItemContextValue(dynamicContext, "databaseId", "identifier");
  const databaseId = typeof databaseIdValue === "number" ? databaseIdValue : Number(databaseIdValue);
  const categories = records(getDynamicItemContextValue(dynamicContext, "categories", "metadata"));
  const tags = records(getDynamicItemContextValue(dynamicContext, "tags", "metadata"));
  const taxonomyTerms = [
    ...categories.map((term) => ({ taxonomy: "category", term })),
    ...tags.map((term) => ({ taxonomy: "tag", term })),
  ].flatMap(({ taxonomy, term }) => {
    const id = identifier(term.id);
    const termSlug = text(term.slug);
    return id === undefined ? [] : [{ taxonomy, id: String(id), ...(termSlug ? { slug: termSlug } : {}) }];
  });
  return {
    dynamicContext,
    post: {
      id: String(dynamicContext.id),
      ...(Number.isFinite(databaseId) ? { databaseId } : {}),
      slug: resolvedSlug,
      uri: getStorefrontContentHref({ contentType: "post", slug: resolvedSlug }) ?? `/${resolvedSlug}`,
      title,
      content: getDynamicItemContextValue(dynamicContext, "content", "richText"),
      excerpt: getDynamicItemContextValue(dynamicContext, "excerpt", "richText"),
      ...(image ? { featuredImage: { sourceUrl: image.url, ...(image.alt ? { altText: image.alt } : {}) } } : {}),
    },
    taxonomyTerms,
  };
}
