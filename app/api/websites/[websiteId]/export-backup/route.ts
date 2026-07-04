import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createWebsiteBackupPayload,
  getWebsiteBackupDownloadFilename,
} from "@/lib/websiteBackup";
import { canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportBackupRouteProps = {
  params: Promise<{
    websiteId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: ExportBackupRouteProps) {
  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { websiteId } = await params;
  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website) {
    return NextResponse.json({ error: "Website not found." }, { status: 404 });
  }

  if (!canAccessWebsiteBuilder(user, website)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const exportedAt = new Date();
  const backup = await createWebsiteBackupPayload(website);
  const filename = getWebsiteBackupDownloadFilename(website, exportedAt);

  return new NextResponse(`${JSON.stringify(backup, null, 2)}\n`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
