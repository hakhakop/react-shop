import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  InvalidContentDiscoveryRequestError,
  createContentDiscoveryService,
} from "@/lib/contentDiscovery.server";
import {
  InvalidIndividualLayoutRequestError,
  UnsupportedIndividualLayoutTargetError,
} from "@/lib/individualLayoutsService.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function requestError(error: unknown) {
  if (error instanceof InvalidContentDiscoveryRequestError ||
      error instanceof InvalidIndividualLayoutRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof UnsupportedIndividualLayoutTargetError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  throw error;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createContentDiscoveryService("website" in access ? access.website : null);
  try {
    const contentId = request.nextUrl.searchParams.get("contentId");
    if (contentId !== null) {
      const result = await service.resolveByStableIdentity({
        provider: request.nextUrl.searchParams.get("provider"),
        contentType: request.nextUrl.searchParams.get("contentType"),
        contentId,
      });
      // DynamicItemContext is internal provider data for D3; the discovery API
      // exposes only the explicit lightweight projection.
      return NextResponse.json(result.availability === "missing"
        ? result
        : { availability: result.availability, identity: result.identity, item: result.item });
    }

    const family = request.nextUrl.searchParams.get("family");
    const limitValue = request.nextUrl.searchParams.get("limit");
    const items = await service.discover({
      family: family as "product" | "post",
      query: request.nextUrl.searchParams.get("query") ?? undefined,
      limit: limitValue === null ? undefined : Number(limitValue),
    });
    return NextResponse.json({ items });
  } catch (error) {
    return requestError(error);
  }
}
