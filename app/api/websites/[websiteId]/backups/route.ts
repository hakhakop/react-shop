import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createStoredWebsiteBackup,
  listWebsiteBackups,
} from "@/lib/websiteBackup";
import { canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebsiteBackupsRouteProps = {
  params: Promise<{
    websiteId: string;
  }>;
};

async function getAuthorizedWebsite(request: NextRequest, websiteId: string) {
  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return {
      error: NextResponse.json({ error: "Access denied." }, { status: 403 }),
    };
  }

  return { website, user };
}

export async function GET(
  request: NextRequest,
  { params }: WebsiteBackupsRouteProps,
) {
  const { websiteId } = await params;
  const access = await getAuthorizedWebsite(request, websiteId);
  if ("error" in access) return access.error;

  return NextResponse.json({
    backups: await listWebsiteBackups(access.website.id),
  });
}

export async function POST(
  request: NextRequest,
  { params }: WebsiteBackupsRouteProps,
) {
  const { websiteId } = await params;
  const access = await getAuthorizedWebsite(request, websiteId);
  if ("error" in access) return access.error;

  return NextResponse.json(
    { backup: await createStoredWebsiteBackup(access.website) },
    { status: 201 },
  );
}
