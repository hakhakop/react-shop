import { NextRequest, NextResponse } from "next/server";
import {
  isValidBuilderSection,
  type BuilderLayout,
} from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Render-only draft preview boundary; it never reads or writes the layout store. */
export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const body = (await request.json()) as { layout?: Partial<BuilderLayout> };
  const candidate = body.layout;
  const rawSections = Array.isArray(candidate?.sections) ? candidate.sections : [];
  if (
    rawSections.length === 0 ||
    rawSections.some((section) => !isValidBuilderSection(section))
  ) {
    return NextResponse.json(
      { error: "A preview layout needs valid sections." },
      { status: 400 },
    );
  }

  const layout = {
    ...(candidate as BuilderLayout),
    sections: rawSections,
  } as BuilderLayout;
  const materialization = await materializeBuilderDynamicContent(layout, {
    website: "website" in access ? access.website : undefined,
  });

  return NextResponse.json({
    renderLayout: materialization.renderLayout,
    dynamicContentDiagnostics: materialization.diagnostics,
  });
}
