import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";
import { ensureWebsiteBuilderData } from "@/lib/websiteBuilderData";

export async function getAuthorizedWebsiteBuilderScope(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId");
  console.log("[builder-scope] API scope request", {
    pathname: request.nextUrl.pathname,
    websiteId,
    fullUrl: request.nextUrl.toString(),
  });
  if (!websiteId) return { scope: {} };

  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
    };
  }

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return {
      error: NextResponse.json({ error: "Access denied." }, { status: 403 }),
    };
  }

  await ensureWebsiteBuilderData(website.id);
  console.log("[builder-scope] API scope authorized", {
    pathname: request.nextUrl.pathname,
    websiteId: website.id,
    ownerId: website.ownerId,
    userId: user.id,
  });
  return { scope: { websiteId: website.id }, website, user };
}

export function isRootSaaSWebsiteScope(scope?: { websiteId?: string } | null): boolean {
  return !scope || !scope.websiteId;
}

export function isSuperAdminUser(user?: { role?: string } | null): boolean {
  return user?.role === "admin";
}

export function canAccessSaaSComponents(
  user?: { role?: string } | null,
  scope?: { websiteId?: string } | null,
): boolean {
  return isSuperAdminUser(user) && isRootSaaSWebsiteScope(scope);
}
