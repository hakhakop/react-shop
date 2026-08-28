import { NextRequest, NextResponse } from "next/server";
import { getWordPressMediaAuthHeaders } from "@/lib/cmsConnection";
import { getCmsConnectionForRequest } from "@/lib/cmsConnectionServer";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";

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

type MediaDiagnosticCode =
  | "cms_not_configured"
  | "wordpress_authentication_failed"
  | "upstream_forbidden"
  | "rest_endpoint_unavailable"
  | "graphql_endpoint_unavailable"
  | "upstream_network_failure";

function mediaDiagnostic(
  code: MediaDiagnosticCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  return NextResponse.json(
    { error: code, code, message, ...(details ? { details } : {}) },
    { status },
  );
}

function upstreamMessage(status: number, endpoint: "REST" | "GraphQL") {
  if (status === 401) {
    return `WordPress rejected the ${endpoint} media request with HTTP 401. Check the WordPress username and Application Password.`;
  }
  if (status === 403) {
    return `WordPress or its security/CDN layer blocked the ${endpoint} media request with HTTP 403.`;
  }
  if (status === 404) {
    return `The WordPress ${endpoint} media endpoint returned HTTP 404.`;
  }
  return `The WordPress ${endpoint} media endpoint returned HTTP ${status}.`;
}

async function resolveMediaCms(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access && access.error) {
    return { error: access.error };
  }
  return {
    cms: await getCmsConnectionForRequest(request, access.website),
  };
}

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
  graphqlUrl,
  search,
  perPage,
  page,
  type,
  authHeaders,
}: {
  wordpressBaseUrl: string;
  graphqlUrl?: string;
  search: string;
  perPage: number;
  page: number;
  type: string;
  authHeaders?: Record<string, string> | null;
}) {
  const endpoint = graphqlUrl || `${wordpressBaseUrl}/graphql`;
  async function loadPage(cursor: string | null, first: number) {
    const response = await fetch(endpoint, {
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
      throw Object.assign(
        new Error(upstreamMessage(response.status, "GraphQL")),
        { status: response.status },
      );
    }

    const payload = (await response.json()) as GraphQLMediaResponse;
    const mediaItems = payload.data?.mediaItems;
    const nodes = mediaItems?.nodes ?? [];
    return {
      nodes,
      pageInfo: mediaItems?.pageInfo,
    };
  }

  const desiredStart = (page - 1) * perPage;
  const targetEnd = desiredStart + perPage;
  let cursor: string | null = null;
  let accumulated: any[] = [];
  let hasMoreMatches = false;

  while (accumulated.length < targetEnd) {
    const batchSize = Math.min(Math.max(perPage * 2, 50), 100);
    const result = await loadPage(cursor, batchSize);
    const nodes = result.nodes;

    const filtered = type === "all"
      ? nodes
      : nodes.filter((node: any) => {
          const mime = (node.mimeType ?? "").toLowerCase();
          if (type === "videos") return mime.startsWith("video/");
          if (type === "documents") return !mime.startsWith("image/") && !mime.startsWith("video/");
          return mime.startsWith("image/");
        });

    accumulated.push(...filtered);

    if (!result.pageInfo?.hasNextPage || !result.pageInfo?.endCursor) {
      hasMoreMatches = false;
      break;
    }

    cursor = result.pageInfo.endCursor;
    hasMoreMatches = result.pageInfo.hasNextPage;
  }

  const start = Math.min(desiredStart, accumulated.length);
  const items = accumulated.slice(start, start + perPage).map((node: any) => {
    const sourceUrl = node.sourceUrl ?? node.mediaItemUrl ?? "";
    const mediumSize = node.mediaDetails?.sizes?.find(
      (size: any) => size.name === "medium" || size.name === "thumbnail",
    );
    const filename =
      getFilenameFromUrl(sourceUrl) ||
      (node.title ? node.title.toLowerCase().replace(/[^a-z0-9-]+/g, "-") : "") ||
      `media-${node.databaseId ?? "item"}`;

    return {
      id: node.databaseId ?? Math.floor(Math.random() * 1000000),
      title: node.title || filename || "Untitled media",
      altText: node.altText ?? "",
      mimeType: node.mimeType ?? "",
      sourceUrl,
      thumbnailUrl: mediumSize?.sourceUrl ?? sourceUrl,
      date: new Date().toISOString(),
      filename,
    };
  });

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
  const resolved = await resolveMediaCms(request);
  if ("error" in resolved) return resolved.error;
  const cms = resolved.cms;
  const wordpressBaseUrl = cms.siteUrl;
  const authHeaders = getWordPressMediaAuthHeaders(cms);

  if (!wordpressBaseUrl) {
    return mediaDiagnostic(
      "cms_not_configured",
      "CMS not configured for this website. Add a WordPress site URL and credentials in Website Settings.",
      424,
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

  let graphqlError: { code: MediaDiagnosticCode; message: string } | null = null;

  if (authHeaders) {
    try {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        graphqlUrl: cms.graphqlUrl,
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
    } catch (caught) {
      const status = Number((caught as { status?: number })?.status);
      graphqlError = {
        code:
          status === 401
            ? "wordpress_authentication_failed"
            : status === 403
              ? "upstream_forbidden"
              : "graphql_endpoint_unavailable",
        message:
          caught instanceof Error
            ? caught.message
            : "The WordPress GraphQL media endpoint is unavailable.",
      };
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
      const status = response.status;
      if (status === 401) {
        return mediaDiagnostic(
          "wordpress_authentication_failed",
          upstreamMessage(status, "REST"),
          502,
          { upstreamStatus: status, endpoint: "rest" },
        );
      }
      if (status === 403) {
        return mediaDiagnostic(
          "upstream_forbidden",
          upstreamMessage(status, "REST"),
          502,
          { upstreamStatus: status, endpoint: "rest" },
        );
      }

      return mediaDiagnostic(
        "rest_endpoint_unavailable",
        upstreamMessage(status, "REST"),
        502,
        {
          upstreamStatus: status,
          endpoint: "rest",
          ...(graphqlError ? { graphql: graphqlError } : {}),
        },
      );
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
  } catch (caught) {
    try {
      const fallback = await loadMediaFromGraphQL({
        wordpressBaseUrl,
        graphqlUrl: cms.graphqlUrl,
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
      return mediaDiagnostic(
        "upstream_network_failure",
        "The server could not connect to the WordPress media service. Check the CMS URL, network access, or security layer.",
        502,
        {
          endpoint: "rest",
          ...(caught instanceof Error ? { reason: caught.message } : {}),
          ...(graphqlError ? { graphql: graphqlError } : {}),
        },
      );
    }
  }
}

export async function POST(request: NextRequest) {
  const resolved = await resolveMediaCms(request);
  if ("error" in resolved) return resolved.error;
  const cms = resolved.cms;
  const wordpressBaseUrl = cms.siteUrl;
  const authHeaders = getWordPressMediaAuthHeaders(cms);

  if (!wordpressBaseUrl) {
    return mediaDiagnostic(
      "cms_not_configured",
      "CMS not configured for this website. Add a WordPress site URL and credentials in Website Settings.",
      424,
    );
  }

  if (!authHeaders) {
    return mediaDiagnostic(
      "wordpress_authentication_failed",
      "WordPress media upload requires a WordPress username and Application Password.",
      502,
      { endpoint: "rest", reason: "credentials_missing" },
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
  const resolved = await resolveMediaCms(request);
  if ("error" in resolved) return resolved.error;
  const cms = resolved.cms;
  const wordpressBaseUrl = cms.siteUrl;
  const authHeaders = getWordPressMediaAuthHeaders(cms);

  if (!wordpressBaseUrl) {
    return mediaDiagnostic(
      "cms_not_configured",
      "CMS not configured for this website. Add a WordPress site URL and credentials in Website Settings.",
      424,
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
  const resolved = await resolveMediaCms(request);
  if ("error" in resolved) return resolved.error;
  const cms = resolved.cms;
  const wordpressBaseUrl = cms.siteUrl;
  const authHeaders = getWordPressMediaAuthHeaders(cms);
  const id = Number(request.nextUrl.searchParams.get("id"));

  if (!wordpressBaseUrl) {
    return mediaDiagnostic(
      "cms_not_configured",
      "CMS not configured for this website. Add a WordPress site URL and credentials in Website Settings.",
      424,
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
