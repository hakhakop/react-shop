import { NextRequest, NextResponse } from "next/server";
import { isValidBuilderSection, type BuilderLayout } from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  IndividualBuilderContextMismatchError,
  resolveIndividualBuilderContext,
} from "@/lib/individualBuilderContext.server";
import { projectIndividualBuilderEditorContext } from "@/lib/builderEditorContext.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof IndividualBuilderContextMismatchError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  throw error;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  try {
    const result = await resolveIndividualBuilderContext({
      documentId: request.nextUrl.searchParams.get("document"),
      individual: request.nextUrl.searchParams.get("individual"),
      scope: access.scope,
      website: "website" in access ? access.website : undefined,
    });
    return NextResponse.json({
      ...result,
      editorContext: projectIndividualBuilderEditorContext(result, access.scope),
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const body = await request.json() as {
    documentId?: string;
    individual?: string;
    layout?: BuilderLayout;
  };
  if (!body.layout?.sections?.length || body.layout.sections.some((section) => !isValidBuilderSection(section))) {
    return NextResponse.json({ error: "A preview layout needs valid sections." }, { status: 400 });
  }
  try {
    const result = await resolveIndividualBuilderContext({
      documentId: body.documentId,
      individual: body.individual,
      authoredLayout: body.layout,
      scope: access.scope,
      website: "website" in access ? access.website : undefined,
    });
    return NextResponse.json({
      renderLayout: result.renderLayout,
      context: result.context,
      editorContext: projectIndividualBuilderEditorContext(result, access.scope),
      unavailable: result.unavailable,
      dynamicContentDiagnostics: result.diagnostics,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
