import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isSaaSAdmin } from "@/lib/auth";
import {
  getWebsiteByIdOrSlug,
  updateWebsiteReadiness,
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
  if (!isSaaSAdmin(user)) {
    return NextResponse.json({ error: "Administrator access is required." }, { status: 403 });
  }

  const website = await getWebsiteByIdOrSlug((await params).websiteId);
  if (!website) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  let body: { status?: unknown };
  try {
    body = (await request.json()) as { status?: unknown };
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (body.status !== "preparing" && body.status !== "ready") {
    return NextResponse.json({ error: "Choose preparing or ready." }, { status: 400 });
  }

  const result = await updateWebsiteReadiness({
    websiteId: website.id,
    status: body.status,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ website: result.website });
}
