import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  canAccessWebsiteBuilder,
  deleteWebsite,
  getWebsiteByIdOrSlug,
  isRootWebsiteIdentifier,
} from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebsiteRouteProps = {
  params: Promise<{
    websiteId: string;
  }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: WebsiteRouteProps,
) {
  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { websiteId } = await params;
  if (isRootWebsiteIdentifier(websiteId)) {
    return NextResponse.json(
      { error: "The Root Website cannot be deleted." },
      { status: 403 },
    );
  }

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  if (!canAccessWebsiteBuilder(user, website)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const result = await deleteWebsite({ websiteId: website.id });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
