import { NextRequest, NextResponse } from "next/server";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";

type WordPressMediaResponse = {
  id: number;
  date?: string;
  slug?: string;
  title?: { rendered?: string };
  caption?: { rendered?: string };
  description?: { rendered?: string };
  alt_text?: string;
  mime_type?: string;
  source_url?: string;
  media_details?: {
    width?: number;
    height?: number;
    filesize?: number;
    file?: string;
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
    filename?: string;
    caption?: string;
    description?: string;
    width?: number;
    height?: number;
    fileSize?: number;
  }[];
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
};

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

function stripHtml(value?: string) {
  return value?.replace(/<[^>]*>/g, "").trim() ?? "";
}

function getFilenameFromUrl(value?: string) {
  if (!value) return "";
  try {
    const pathname = new URL(value).pathname;
    return decodeURIComponent(pathname.split("/").pop() ?? "");
  } catch {
    return value.split("/").pop() ?? "";
  }
}

function getWordPressMediaAuthHeaders() {
  const username =
    process.env.WORDPRESS_MEDIA_USERNAME ||
    process.env.WORDPRESS_USERNAME ||
    process.env.WP_USERNAME ||
    "";
  const password =
    process.env.WORDPRESS_MEDIA_PASSWORD ||
    process.env.WORDPRESS_APPLICATION_PASSWORD ||
    process.env.WORDPRESS_PASSWORD ||
    process.env.WP_APPLICATION_PASSWORD ||
    "";

  if (!username || !password) return null;

  return {
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
  };
}

function toMediaItem(item: WordPressMediaResponse) {
  const sourceUrl = item.source_url ?? "";
  const filename =
    getFilenameFromUrl(item.media_details?.file) ||
    getFilenameFromUrl(sourceUrl) ||
    item.slug ||
    `media-${item.id}`;

  return {
    id: item.id,
    title: stripHtml(item.title?.rendered) || filename || "Untitled media",
    altText: item.alt_text ?? "",
    mimeType: item.mime_type ?? "",
    sourceUrl,
    thumbnailUrl: getThumbnailUrl(item),
    date: item.date ?? "",
    filename,
    caption: stripHtml(item.caption?.rendered),
    description: stripHtml(item.description?.rendered),
    width: item.media_details?.width,
    height: item.media_details?.height,
    fileSize: item.media_details?.filesize,
  };
}

function getWordPressErrorMessage(payload: unknown, fallback: string) {
  return typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as { message?: unknown }).message === "string"
    ? (payload as { message: string }).message
    : fallback;
}

async function loadMediaFromGraphQL({
  wordpressBaseUrl,
  search,
  perPage,
  page,
  type,
  authHeaders,
}: {
  wordpressBaseUrl: string;
  search: string;
  perPage: number;
  page: number;
  type: string;
  authHeaders?: ReturnType<typeof getWordPressMediaAuthHeaders>;
}) {
  async function loadPage(cursor: string | null, first: number) {
    const response = await fetch(getGraphQLEndpoint(wordpressBaseUrl), {
      method: "POST",
      headers: {
        ...(authHeaders ?? {}),
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

  let cursor: string | null = null;
  let hasNextPage = true;
  const targetCount = page * perPage;
  const matchedItems: CachedGraphQLMedia["items"] = [];
  const maxScanPages = type === "all" || type === "image" ? page + 2 : 8;
  let scannedPages = 0;

  const matchesType = (mimeType: string) => {
    if (type === "all") return true;
    if (type === "videos") return mimeType.startsWith("video/");
    if (type === "documents") {
      return (
        mimeType.startsWith("application/") ||
        mimeType.startsWith("text/") ||
        mimeType === "image/vnd.adobe.photoshop"
      );
    }
    return mimeType.startsWith("image/");
  };

  while (
    matchedItems.length < targetCount &&
    hasNextPage &&
    scannedPages < maxScanPages
  ) {
    const payload = await loadPage(cursor, perPage);
    scannedPages += 1;
    const connection = payload.data?.mediaItems;
    const allMedia = connection?.nodes ?? [];
    const pageInfo = connection?.pageInfo;

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
      })
      .filter((item) => matchesType(item.mimeType));

    matchedItems.push(...items);
    hasNextPage = Boolean(pageInfo?.hasNextPage);
    cursor = pageInfo?.endCursor ?? null;
  }

  const start = (page - 1) * perPage;
  const items = matchedItems.slice(start, start + perPage);
  const scanCapped = hasNextPage && scannedPages >= maxScanPages;
  const hasMoreMatches =
    matchedItems.length > start + items.length ||
    (hasNextPage && !scanCapped && matchedItems.length >= targetCount);

  const total = start + items.length + (hasMoreMatches ? 1 : 0);
  const totalPages = hasMoreMatches ? page + 1 : page;

  return {
    items,
    total,
    totalPages,
    hasNextPage: hasMoreMatches,
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
  const type = request.nextUrl.searchParams.get("type") ?? "image";
  const page = Math.max(
    Number(request.nextUrl.searchParams.get("page") ?? 1) || 1,
    1
  );
  const perPage = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("perPage") ?? 40) || 40, 12),
    80
  );

  const mediaUrl = new URL(`${wordpressBaseUrl}/wp-json/wp/v2/media`);
  if (type !== "all") {
    const mediaType =
      type === "documents" ? "file" : type === "videos" ? "video" : "image";
    mediaUrl.searchParams.set("media_type", mediaType);
  }
  mediaUrl.searchParams.set("per_page", String(perPage));
  mediaUrl.searchParams.set("page", String(page));
  mediaUrl.searchParams.set(
    "_fields",
    "id,date,slug,title,caption,description,alt_text,mime_type,source_url,media_details"
  );
  if (search) mediaUrl.searchParams.set("search", search);
  const authHeaders = getWordPressMediaAuthHeaders();

  if (authHeaders) {
    try {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        search,
        perPage,
        page,
        type,
        authHeaders,
      });
      return NextResponse.json({
        media: fallback.items,
        total: fallback.total,
        totalPages: fallback.totalPages,
        page,
        hasNextPage: fallback.hasNextPage ?? page < fallback.totalPages,
        source: "graphql-auth",
      });
    } catch {
      // Fall through to REST as a secondary path when authenticated GraphQL is unavailable.
    }
  }

  try {
    const response = await fetch(mediaUrl, {
      headers: {
        ...(authHeaders ?? {}),
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        search,
        perPage,
        page,
        type,
        authHeaders,
      });
      return NextResponse.json({
        media: fallback.items,
        total: fallback.total,
        totalPages: fallback.totalPages,
        page,
        hasNextPage: fallback.hasNextPage ?? page < fallback.totalPages,
        source: authHeaders ? "graphql-auth" : fallback.source,
      });
    }

    const payload = (await response.json()) as WordPressMediaResponse[];
    const media = payload
      .filter((item) => item.source_url)
      .map(toMediaItem);

    const total = Number(response.headers.get("x-wp-total") ?? media.length);
    const totalPages = Number(response.headers.get("x-wp-totalpages") ?? 1);
    return NextResponse.json({
      media,
      total,
      totalPages,
      page,
      hasNextPage: page < totalPages,
      source: authHeaders ? "rest-auth" : "rest",
    });
  } catch {
    try {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        search,
        perPage,
        page,
        type,
        authHeaders,
      });
      return NextResponse.json({
        media: fallback.items,
        total: fallback.total,
        totalPages: fallback.totalPages,
        page,
        hasNextPage: fallback.hasNextPage ?? page < fallback.totalPages,
        source: authHeaders ? "graphql-auth" : fallback.source,
      });
    } catch {
      return NextResponse.json(
        { message: "React could not reach WordPress media library." },
        { status: 502 }
      );
    }
  }
}

export async function POST(request: NextRequest) {
  const wordpressBaseUrl = getWordPressBaseUrl();
  const authHeaders = getWordPressMediaAuthHeaders();

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      { message: "WordPress URL is not configured." },
      { status: 500 }
    );
  }

  if (!authHeaders) {
    return NextResponse.json(
      {
        message:
          "WordPress media upload requires WORDPRESS_MEDIA_USERNAME and WORDPRESS_MEDIA_PASSWORD or a WordPress application password.",
      },
      { status: 501 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "No file was uploaded." }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const response = await fetch(`${wordpressBaseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: {
      ...authHeaders,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
      "Content-Type": file.type || "application/octet-stream",
      Accept: "application/json",
    },
    body: bytes,
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | WordPressMediaResponse
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("id" in payload)) {
    return NextResponse.json(
      { message: getWordPressErrorMessage(payload, "WordPress media upload failed.") },
      { status: response.status || 502 }
    );
  }

  return NextResponse.json({ media: toMediaItem(payload) });
}

export async function PATCH(request: NextRequest) {
  const wordpressBaseUrl = getWordPressBaseUrl();
  const authHeaders = getWordPressMediaAuthHeaders();

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      { message: "WordPress URL is not configured." },
      { status: 500 }
    );
  }

  if (!authHeaders) {
    return NextResponse.json(
      { message: "WordPress media edits require WordPress media credentials." },
      { status: 501 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        id?: number;
        title?: string;
        altText?: string;
        caption?: string;
        description?: string;
      }
    | null;

  if (!body?.id) {
    return NextResponse.json({ message: "Missing media id." }, { status: 400 });
  }

  const response = await fetch(
    `${wordpressBaseUrl}/wp-json/wp/v2/media/${body.id}`,
    {
      method: "POST",
      headers: {
        ...authHeaders,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title: body.title,
        alt_text: body.altText,
        caption: body.caption,
        description: body.description,
      }),
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | WordPressMediaResponse
    | { message?: string }
    | null;

  if (!response.ok || !payload || !("id" in payload)) {
    return NextResponse.json(
      { message: getWordPressErrorMessage(payload, "WordPress media update failed.") },
      { status: response.status || 502 }
    );
  }

  return NextResponse.json({ media: toMediaItem(payload) });
}

export async function DELETE(request: NextRequest) {
  const wordpressBaseUrl = getWordPressBaseUrl();
  const authHeaders = getWordPressMediaAuthHeaders();
  const id = Number(request.nextUrl.searchParams.get("id"));

  if (!wordpressBaseUrl) {
    return NextResponse.json(
      { message: "WordPress URL is not configured." },
      { status: 500 }
    );
  }

  if (!authHeaders) {
    return NextResponse.json(
      { message: "WordPress media delete requires WordPress media credentials." },
      { status: 501 }
    );
  }

  if (!id) {
    return NextResponse.json({ message: "Missing media id." }, { status: 400 });
  }

  const response = await fetch(
    `${wordpressBaseUrl}/wp-json/wp/v2/media/${id}?force=true`,
    {
      method: "DELETE",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { deleted?: boolean; message?: string }
    | null;

  if (!response.ok) {
    return NextResponse.json(
      { message: payload?.message ?? "WordPress media delete failed." },
      { status: response.status || 502 }
    );
  }

  return NextResponse.json({ deleted: true });
}
