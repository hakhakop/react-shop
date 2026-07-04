import { readFile } from "node:fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { canAccessWebsiteBuilder, getWebsiteByIdOrSlug } from "@/lib/websites";
import {
  getBuilderLayoutStorePath,
  getBuilderPagesPath,
  getBuilderShellPath,
} from "@/lib/websiteBuilderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ExportBackupRouteProps = {
  params: Promise<{
    websiteId: string;
  }>;
};

async function readJsonFile(filePath: string, fallback: unknown) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function backupDateStamp(date: Date) {
  return date.toISOString().slice(0, 10);
}

function safeFilenamePart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "website"
  );
}

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
  const backup = {
    exportVersion: 1,
    exportedAt: exportedAt.toISOString(),
    website,
    files: {
      "builder-layouts.json": await readJsonFile(
        getBuilderLayoutStorePath(website.id),
        {},
      ),
      "builder-pages.json": await readJsonFile(getBuilderPagesPath(website.id), []),
      "builder-shell.json": await readJsonFile(getBuilderShellPath(website.id), {}),
    },
  };
  const filename = `webpages-backup-${safeFilenamePart(website.slug)}-${backupDateStamp(exportedAt)}.json`;

  return new NextResponse(`${JSON.stringify(backup, null, 2)}\n`, {
    headers: {
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
