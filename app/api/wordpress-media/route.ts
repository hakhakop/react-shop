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
    };
  };
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  const response = await fetch(getGraphQLEndpoint(wordpressBaseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: "no-store",
    body: JSON.stringify({
      query: `
        query ReactShopMedia($first: Int!, $search: String) {
          mediaItems(first: $first, where: { search: $search }) {
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
          }
        }
      `,
      variables: {
        first: perPage,
        search: search || null,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`WordPress GraphQL returned ${response.status}.`);
  }

  const payload = (await response.json()) as GraphQLMediaResponse;
  const media = (payload.data?.mediaItems?.nodes ?? [])
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

  return {
    media,
    total: media.length,
    totalPages: 1,
    page: 1,
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
  const page = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("page") ?? 1) || 1, 1),
    20
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
      return NextResponse.json(fallback);
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

    return NextResponse.json({
      media,
      total: Number(response.headers.get("x-wp-total") ?? media.length),
      totalPages: Number(response.headers.get("x-wp-totalpages") ?? 1),
      page,
      source: "rest",
    });
  } catch {
    try {
      return NextResponse.json(
        await loadMediaFromGraphQL({ wordpressBaseUrl, search, perPage })
      );
    } catch {
      return NextResponse.json(
        { message: "React could not reach WordPress media library." },
        { status: 502 }
      );
    }
  }
}
