import { NextRequest, NextResponse } from "next/server";
import {
  getBuilderShellSettings,
  normalizeBuilderShellSettings,
  writeBuilderShellSettings,
  type BuilderShellSettings,
} from "@/lib/builderShell";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  return NextResponse.json({
    settings: await getBuilderShellSettings(access.scope),
  });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const body = (await request.json()) as Partial<BuilderShellSettings>;
  const settings = normalizeBuilderShellSettings(body);
  await writeBuilderShellSettings(settings, access.scope);

  return NextResponse.json({ settings });
}
