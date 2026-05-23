import { NextRequest, NextResponse } from "next/server";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";

type WordPressMediaResponse = {
  id: number;
  date?: string;
  title?: { rendered?: string };
  alt_text?: string;
  mime_type?: string;
  source_url?: string;
  media_details?: {
    sizes?: Record<string, { source_url?: string }>;
  };
};

type GraphQLMediaResponse = {
  data?: {
    mediaItems?: {
      nodes?: {
        databaseId?: number;
        title?: string;
        altText?: string;
        mimeType?: string;
        sourceUrl?: string;
        mediaItemUrl?: string;
        mediaDetails?: {
          sizes?: { name?: string; sourceUrl?: string }[];
        };
      }[];
      pageInfo?: {
        hasNextPage?: boolean;
        endCursor?: string | null;
      };
    };
  };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CachedGraphQLMedia = {
  items: {
    id: number;
    title: string;
    altText: string;
    mimeType: string;
    sourceUrl: string;
    thumbnailUrl: string;
    date: string;
  }[];
  total: number;
  totalPages: number;
};

const graphQLMediaCache = new Map<string, CachedGraphQLMedia>();

function getThumbnailUrl(item: WordPressMediaResponse) {
  return (
    item.media_details?.sizes?.medium?.source_url ??
    item.media_details?.sizes?.thumbnail?.source_url ??
    item.source_url ??
    ""
  );
}

function getGraphQLEndpoint(wordpressBaseUrl: string) {
  return (
    process.env.WORDPRESS_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_URL ||
    process.env.NEXT_PUBLIC_WPGRAPHQL_ENDPOINT ||
    `${wordpressBaseUrl}/graphql`
  );
}

async function loadMediaFromGraphQL({
  wordpressBaseUrl,
  search,
  perPage,
}: {
  wordpressBaseUrl: string;
  search: string;
  perPage: number;
}) {
  async function loadPage(cursor: string | null, first: number) {
    const response = await fetch(getGraphQLEndpoint(wordpressBaseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
        body: JSON.stringify({
          query: `
            query ReactShopMedia($first: Int!, $search: String, $after: String) {
              mediaItems(first: $first, after: $after, where: { search: $search }) {
              nodes {
                databaseId
                title
                altText
                mimeType
                sourceUrl
                mediaItemUrl
                mediaDetails {
                  sizes {
                    name
                    sourceUrl
                  }
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
          `,
          variables: {
          first,
          search: search || null,
          after: cursor,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`WordPress GraphQL returned ${response.status}.`);
    }

    return (await response.json()) as GraphQLMediaResponse;
  }

  let after: string | null = null;
  const allMedia: {
    databaseId?: number;
    title?: string;
    altText?: string;
    mimeType?: string;
    sourceUrl?: string;
    mediaItemUrl?: string;
    mediaDetails?: {
      sizes?: { name?: string; sourceUrl?: string }[];
    };
  }[] = [];
  const batchSize = Math.max(perPage, 1000);

  while (true) {
    const payload = await loadPage(after, batchSize);
    const connection = payload.data?.mediaItems;
    const nodes = connection?.nodes ?? [];
    const pageInfo = connection?.pageInfo;
    allMedia.push(...nodes);

    if (!pageInfo?.hasNextPage) break;
    after = pageInfo.endCursor ?? null;
  }

  const items = allMedia
    .filter((item) => item.sourceUrl || item.mediaItemUrl)
    .map((item) => {
      const sizes = item.mediaDetails?.sizes ?? [];
      const medium =
        sizes.find((size) => size.name === "medium")?.sourceUrl ??
        sizes.find((size) => size.name === "thumbnail")?.sourceUrl;
      return {
        id: item.databaseId ?? 0,
        title: item.title || "Untitled image",
        altText: item.altText ?? "",
        mimeType: item.mimeType ?? "",
        sourceUrl: item.sourceUrl ?? item.mediaItemUrl ?? "",
        thumbnailUrl: medium ?? item.sourceUrl ?? item.mediaItemUrl ?? "",
        date: "",
      };
    });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return {
    items,
    total,
    totalPages,
    source: "graphql",
  };
}

export async function GET(request: NextRequest) {
  const wordpressBaseUrl = getWordPressBaseUrl();

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      {
        message:
          "WordPress URL is not configured. Add WORDPRESS_SITE_URL or WC_API_URL.",
      },
      { status: 500 }
    );
  }

  const search = request.nextUrl.searchParams.get("search")?.trim() ?? "";
  const page = Math.max(
    Number(request.nextUrl.searchParams.get("page") ?? 1) || 1,
    1
  );
  const perPage = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("perPage") ?? 36) || 36, 12),
    60
  );

  const mediaUrl = new URL(`${wordpressBaseUrl}/wp-json/wp/v2/media`);
  mediaUrl.searchParams.set("media_type", "image");
  mediaUrl.searchParams.set("per_page", String(perPage));
  mediaUrl.searchParams.set("page", String(page));
  mediaUrl.searchParams.set(
    "_fields",
    "id,date,title,alt_text,mime_type,source_url,media_details"
  );
  if (search) mediaUrl.searchParams.set("search", search);
  const cacheKey = `${wordpressBaseUrl}::${search.toLowerCase()}`;

  const cached = graphQLMediaCache.get(cacheKey);
  if (cached) {
    const start = (page - 1) * perPage;
    const media = cached.items.slice(start, start + perPage);
    return NextResponse.json({
      media,
      total: cached.total,
      totalPages: cached.totalPages,
      page,
      hasNextPage: page < cached.totalPages,
      source: "graphql-cache",
    });
  }

  try {
    const response = await fetch(mediaUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        search,
        perPage,
      });
      graphQLMediaCache.set(cacheKey, fallback);
      const start = (page - 1) * perPage;
      return NextResponse.json({
        media: fallback.items.slice(start, start + perPage),
        total: fallback.total,
        totalPages: fallback.totalPages,
        page,
        hasNextPage: page < fallback.totalPages,
        source: fallback.source,
      });
    }

    const payload = (await response.json()) as WordPressMediaResponse[];
    const media = payload
      .filter((item) => item.source_url)
      .map((item) => ({
        id: item.id,
        title: item.title?.rendered?.replace(/<[^>]*>/g, "").trim() || "Untitled image",
        altText: item.alt_text ?? "",
        mimeType: item.mime_type ?? "",
        sourceUrl: item.source_url ?? "",
        thumbnailUrl: getThumbnailUrl(item),
        date: item.date ?? "",
      }));

    const total = Number(response.headers.get("x-wp-total") ?? media.length);
    const totalPages = Number(response.headers.get("x-wp-totalpages") ?? 1);
    return NextResponse.json({
      media,
      total,
      totalPages,
      page,
      hasNextPage: page < totalPages,
      source: "rest",
    });
  } catch {
    try {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        search,
        perPage,
      });
      graphQLMediaCache.set(cacheKey, fallback);
      const start = (page - 1) * perPage;
      return NextResponse.json({
        media: fallback.items.slice(start, start + perPage),
        total: fallback.total,
        totalPages: fallback.totalPages,
        page,
        hasNextPage: page < fallback.totalPages,
        source: fallback.source,
      });
    } catch {
      return NextResponse.json(
        { message: "React could not reach WordPress media library." },
        { status: 502 }
      );
    }
  }
}
