import { NextRequest, NextResponse } from "next/server";
import { parsePortableNavigationPackage } from "@/lib/navigationPackage";
import {
  previewWordPressNavigationInstall,
  materializeAssignedWordPressPages,
  retrieveWordPressNavigationPackages,
  WORDPRESS_MENU_WRITE_LIMITATION,
} from "@/lib/wordpressNavigation.server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import { getCurrentUser } from "@/lib/auth";
import { isSaaSAdmin } from "@/lib/authRoles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function authorizeNavigationRequest(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access;
  if ("website" in access) return access;
  const user = await getCurrentUser(request.cookies);
  if (!user) return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  if (!isSaaSAdmin(user)) return { error: NextResponse.json({ error: "Administrator access is required." }, { status: 403 }) };
  return access;
}

export async function GET(request: NextRequest) {
  const access = await authorizeNavigationRequest(request);
  if ("error" in access) return access.error;
  try {
    const packages = await retrieveWordPressNavigationPackages("website" in access ? access.website : undefined);
    return NextResponse.json({
      packages,
      writeCapability: { available: false, reason: WORDPRESS_MENU_WRITE_LIMITATION },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "WordPress navigation retrieval failed.",
      writeCapability: { available: false, reason: WORDPRESS_MENU_WRITE_LIMITATION },
    }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  const access = await authorizeNavigationRequest(request);
  if ("error" in access) return access.error;
  try {
    const body = await request.json() as { package?: unknown; installAssignedPages?: boolean };
    const packageValue = parsePortableNavigationPackage(body.package);
    if (body.installAssignedPages) {
      const pages = await materializeAssignedWordPressPages(packageValue, access.scope);
      return NextResponse.json({ pages });
    }
    const preview = await previewWordPressNavigationInstall(
      packageValue,
      "website" in access ? access.website : undefined,
    );
    return NextResponse.json({
      preview,
      writeCapability: { available: false, reason: WORDPRESS_MENU_WRITE_LIMITATION },
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Navigation package preview failed.",
    }, { status: 400 });
  }
}
