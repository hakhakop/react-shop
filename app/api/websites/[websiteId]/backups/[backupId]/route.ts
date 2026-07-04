import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  readStoredWebsiteBackup,
  restoreStoredWebsiteBackup,
} from "@/lib/websiteBackup";
import { canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type WebsiteBackupRouteProps = {
  params: Promise<{
    websiteId: string;
    backupId: string;
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
  { params }: WebsiteBackupRouteProps,
) {
  const { websiteId, backupId } = await params;
  const access = await getAuthorizedWebsite(request, websiteId);
  if ("error" in access) return access.error;

  try {
    const backup = await readStoredWebsiteBackup({
      websiteId: access.website.id,
      backupId,
    });

    return new NextResponse(`${JSON.stringify(backup, null, 2)}\n`, {
      headers: {
        "Content-Disposition": `attachment; filename="${backupId}"`,
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return NextResponse.json({ error: "Backup not found." }, { status: 404 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: WebsiteBackupRouteProps,
) {
  const { websiteId, backupId } = await params;
  const access = await getAuthorizedWebsite(request, websiteId);
  if ("error" in access) return access.error;

  try {
    const result = await restoreStoredWebsiteBackup({
      website: access.website,
      backupId,
    });

    return NextResponse.json({ restored: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Backup could not be restored.",
      },
      { status: 400 },
    );
  }
}
