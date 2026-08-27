import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  getBuilderThemeSettings,
  writeBuilderThemeSettings,
} from "@/lib/builderThemeSettings.server";
import { normalizeBuilderThemeSettings } from "@/lib/builderThemeSettings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  return NextResponse.json({ settings: await getBuilderThemeSettings(access.scope) });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const settings = normalizeBuilderThemeSettings(await request.json());
  if (settings.provider !== "yootheme") {
    return NextResponse.json({ error: "Only YOOtheme provider settings are supported." }, { status: 400 });
  }
  await writeBuilderThemeSettings(settings, access.scope);
  return NextResponse.json({ settings: await getBuilderThemeSettings(access.scope) });
}
