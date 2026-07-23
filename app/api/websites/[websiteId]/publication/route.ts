import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  canAccessWebsiteBuilder,
  getWebsiteByIdOrSlug,
  recordWebsitePublication,
} from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ websiteId: string }> },
) {
  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const website = await getWebsiteByIdOrSlug((await params).websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  const result = await recordWebsitePublication({ websiteId: website.id });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true, publishedAt: result.website.lastPublishedAt });
}
