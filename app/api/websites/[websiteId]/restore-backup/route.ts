import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  restoreStoredWebsiteBackup,
  restoreWebsiteBackup,
} from "@/lib/websiteBackup";
import { canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RestoreBackupRouteProps = {
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

export async function POST(
  request: NextRequest,
  { params }: RestoreBackupRouteProps,
) {
  const { websiteId } = await params;
  const access = await getAuthorizedWebsite(request, websiteId);
  if ("error" in access) return access.error;

  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const backupId = String(formData.get("backupId") ?? "");
      if (backupId) {
        const result = await restoreStoredWebsiteBackup({
          website: access.website,
          backupId,
        });
        return NextResponse.json({ restored: true, ...result });
      }

      const file = formData.get("backupFile");
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "Choose a WebPages backup JSON file." },
          { status: 400 },
        );
      }

      const result = await restoreWebsiteBackup({
        website: access.website,
        backup: JSON.parse(await file.text()),
      });
      return NextResponse.json({ restored: true, ...result });
    }

    const body = (await request.json()) as { backupId?: string; backup?: unknown };
    if (body.backupId) {
      const result = await restoreStoredWebsiteBackup({
        website: access.website,
        backupId: body.backupId,
      });
      return NextResponse.json({ restored: true, ...result });
    }

    const result = await restoreWebsiteBackup({
      website: access.website,
      backup: body.backup,
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
