import {
  getDynamicItemContextValue,
  type DynamicContentData,
  type DynamicItemContext,
} from "@/lib/dynamicContent";
import { resolveDynamicContentContexts } from "@/lib/dynamicContentProviders.server";
import { parseSupportedIndividualIdentity } from "@/lib/individualLayoutsService.server";
import { WooCommerceRequestError } from "@/lib/woocommerce";
import type { StableContentIdentity } from "@/lib/layoutRouting";
import type { SaaSWebsite } from "@/lib/websites";

export type ContentPublicationState = "published" | "unpublished" | "unknown";

export type ContentDiscoveryItem = {
  identity: StableContentIdentity;
  title: string;
  slug: string;
  thumbnail?: string;
  publicationState: ContentPublicationState;
  storefrontHref?: string;
};

export type StableContentLookupResult =
  | { availability: "missing"; identity: StableContentIdentity }
  | {
      availability: ContentPublicationState;
      identity: StableContentIdentity;
      item: ContentDiscoveryItem;
      /** Canonical provider context for later D3 orchestration; never sent by the API. */
      context: DynamicItemContext;
    };

export class InvalidContentDiscoveryRequestError extends Error {}

type ContentProviderResolver = typeof resolveDynamicContentContexts;

const metadata = (value: DynamicContentData | undefined) =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, DynamicContentData>
    : undefined;

function publicationState(context: DynamicItemContext): ContentPublicationState {
  const status = metadata(getDynamicItemContextValue(context, "meta", "metadata"))?.status;
  if (status === "publish" || status === "published") return "published";
  if (typeof status === "string" && status.trim()) return "unpublished";
  return "unknown";
}

function discoveryItem(
  context: DynamicItemContext,
  provider: "woocommerce" | "wordpress",
  contentType: "product" | "post",
): ContentDiscoveryItem | null {
  if (context.id === undefined || context.id === null) return null;
  const title = getDynamicItemContextValue(context, "title", "string");
  const slug = getDynamicItemContextValue(context, "slug", "string");
  if (!title || !slug) return null;
  const image = getDynamicItemContextValue(
    context,
    contentType === "product" ? "image" : "featuredImage",
    "media",
  );
  const href = getDynamicItemContextValue(context, "storefront.href", "url");
  return {
    identity: { provider, contentType, contentId: String(context.id) },
    title,
    slug,
    ...(image?.url ? { thumbnail: image.url } : {}),
    publicationState: publicationState(context),
    ...(href ? { storefrontHref: href } : {}),
  };
}

function readLimit(value: unknown) {
  if (value === undefined) return 20;
  if (!Number.isInteger(value) || (value as number) < 1 || (value as number) > 100) {
    throw new InvalidContentDiscoveryRequestError("Discovery limit must be an integer from 1 to 100.");
  }
  return value as number;
}

export function createContentDiscoveryService(
  website?: SaaSWebsite | null,
  dependencies: { resolveContexts?: ContentProviderResolver } = {},
) {
  const resolveContexts = dependencies.resolveContexts ?? resolveDynamicContentContexts;

  return {
    async resolveByStableIdentity(value: unknown): Promise<StableContentLookupResult> {
      const identity = parseSupportedIndividualIdentity(value);
      if (identity.provider === "woocommerce" && !/^\d+$/.test(identity.contentId)) {
        throw new InvalidContentDiscoveryRequestError("WooCommerce Product stable IDs must be numeric.");
      }
      let contexts: DynamicItemContext[];
      try {
        contexts = await resolveContexts({
          website,
          descriptor: {
            provider: identity.provider,
            source: identity.contentType,
            mode: "single",
            query: { id: identity.provider === "woocommerce" ? Number(identity.contentId) : identity.contentId },
          },
        });
      } catch (error) {
        if (error instanceof WooCommerceRequestError && error.status === 404) {
          return { availability: "missing", identity };
        }
        throw error;
      }
      const context = contexts[0];
      if (!context) return { availability: "missing", identity };
      const item = discoveryItem(context, identity.provider, identity.contentType);
      if (!item || item.identity.contentId !== identity.contentId) {
        return { availability: "missing", identity };
      }
      return { availability: item.publicationState, identity, item, context };
    },

    async discover(input: { family: "product" | "post"; query?: string; limit?: number }) {
      if (!input || (input.family !== "product" && input.family !== "post")) {
        throw new InvalidContentDiscoveryRequestError("Discovery family must be product or post.");
      }
      if (input.query !== undefined && typeof input.query !== "string") {
        throw new InvalidContentDiscoveryRequestError("Discovery query must be a string.");
      }
      const limit = readLimit(input.limit);
      const product = input.family === "product";
      const provider = product ? "woocommerce" as const : "wordpress" as const;
      const contexts = await resolveContexts({
        website,
        descriptor: {
          provider,
          source: input.family,
          mode: "collection",
          query: {
            start: 0,
            quantity: limit,
            order: "date",
            direction: "desc",
            ...(input.query?.trim() ? { search: input.query.trim() } : {}),
          },
        },
      });
      return contexts.flatMap((context) => {
        const item = discoveryItem(context, provider, input.family);
        return item ? [item] : [];
      });
    },
  };
}
