import { NextRequest, NextResponse } from "next/server";
import {
  getPublishedBuilderLayout,
  getBuilderTargetType,
  isValidBuilderSection,
  isBuilderTemplate,
  normalizeBuilderLayoutKey,
  readBuilderLayoutStore,
  writeBuilderLayoutStore,
  type BuilderLayout,
} from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const page = normalizeBuilderLayoutKey(
    request.nextUrl.searchParams.get("key") ??
      request.nextUrl.searchParams.get("template") ??
      request.nextUrl.searchParams.get("page")
  );

  return NextResponse.json({
    layout: await getPublishedBuilderLayout(page, access.scope),
  });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const body = (await request.json()) as {
    key?: string;
    page?: string;
    template?: string;
    design?: BuilderLayout["design"];
    sections?: unknown;
  };

  const page = normalizeBuilderLayoutKey(body.key ?? body.template ?? body.page ?? null);
  const sections = Array.isArray(body.sections)
    ? body.sections.filter(isValidBuilderSection)
    : [];

  if (sections.length === 0) {
    return NextResponse.json(
      { error: "A layout needs at least one valid section." },
      { status: 400 }
    );
  }

  const store = await readBuilderLayoutStore(access.scope);
  const layout: BuilderLayout = {
    version: 1,
    key: page,
    page,
    targetType: getBuilderTargetType(page),
    template: isBuilderTemplate(page) ? page : undefined,
    design: body.design,
    sections,
    updatedAt: new Date().toISOString(),
  };

  store[page] = layout;
  await writeBuilderLayoutStore(store, access.scope);

  return NextResponse.json({ layout });
}
