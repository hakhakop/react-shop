import { NextRequest, NextResponse } from "next/server";
import {
  getBuilderShellSettings,
  normalizeBuilderShellSettings,
  writeBuilderShellSettings,
  type BuilderShellSettings,
} from "@/lib/builderShell";
import { getCurrentUser } from "@/lib/auth";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import { getBuilderShellPath } from "@/lib/websiteBuilderData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const user = "user" in access ? access.user : await getCurrentUser(request.cookies);
  const websiteId = access.scope.websiteId ?? null;
  const resolvedFilePath = getBuilderShellPath(access.scope.websiteId);

  console.log("[global-settings-scope] builder-shell GET", {
    userRole: user?.role ?? null,
    websiteId,
    section: "builder-shell",
    apiUrl: request.nextUrl.toString(),
    resolvedFilePath,
  });

  return NextResponse.json({
    settings: await getBuilderShellSettings(access.scope),
  });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const user = "user" in access ? access.user : await getCurrentUser(request.cookies);
  const websiteId = access.scope.websiteId ?? null;

  const requestedScope = request.headers.get("x-builder-website-id")?.trim() || null;
  const expectedScope = websiteId ?? "root";
  // Older API clients may omit the diagnostic scope header, so the query
  // scope remains authoritative when the header is absent. A present header
  // must always agree; this prevents a tenant client from silently resolving
  // the root file after losing its query parameter.
  if (requestedScope && requestedScope !== expectedScope) {
    console.error("[global-settings-scope] rejected builder-shell write scope", {
      websiteId,
      requestedScope,
      expectedScope,
      apiUrl: request.nextUrl.toString(),
    });
    return NextResponse.json(
      { error: "Builder shell write scope does not match the authorized website." },
      { status: 409 },
    );
  }

  if (!websiteId && user?.role !== "super_admin") {
    return NextResponse.json(
      { error: "Super admin access is required for platform global settings." },
      { status: 403 },
    );
  }

  const body = (await request.json()) as Partial<BuilderShellSettings>;
  const settings = normalizeBuilderShellSettings(body);
  const resolvedFilePath = getBuilderShellPath(access.scope.websiteId);

  console.log("[global-settings-scope] builder-shell POST", {
    userRole: user?.role ?? null,
    websiteId,
    section: "builder-shell",
    apiUrl: request.nextUrl.toString(),
    resolvedFilePath,
    payloadKeys: Object.keys(body),
  });
  await writeBuilderShellSettings(settings, access.scope);

  return NextResponse.json({ settings });
}
