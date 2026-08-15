import { NextRequest, NextResponse } from "next/server";
import type { BuilderLayout, BuilderSection } from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  TemplateBuilderContextMismatchError,
  TemplatePreviewIdentityNotFoundError,
  resolveTemplateBuilderContext,
} from "@/lib/templateBuilderContext.server";
import { InvalidRoutingTemplateRequestError, RoutingTemplateNotFoundError } from "@/lib/routingTemplatesService.server";
import { projectTemplateBuilderEditorContext } from "@/lib/builderEditorContext.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (error instanceof TemplateBuilderContextMismatchError || error instanceof InvalidRoutingTemplateRequestError) return NextResponse.json({ error: error.message }, { status: 400 });
  if (error instanceof RoutingTemplateNotFoundError || error instanceof TemplatePreviewIdentityNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  throw error;
}

function identityFrom(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const identity = value as Record<string, unknown>;
  if (typeof identity.provider !== "string" || typeof identity.contentType !== "string" || typeof identity.contentId !== "string") return undefined;
  return { provider: identity.provider, contentType: identity.contentType, contentId: identity.contentId };
}

function isValidTemplatePreviewSection(value: unknown): value is BuilderSection {
  if (!value || typeof value !== "object") return false;
  const section = value as Partial<BuilderSection>;
  return (
    typeof section.id === "string" &&
    typeof section.kind === "string" &&
    typeof section.visible === "boolean" &&
    (section.title === undefined || typeof section.title === "string") &&
    (section.background === undefined || typeof section.background === "string") &&
    (section.layoutItems === undefined || Array.isArray(section.layoutItems))
  );
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  try {
    const result = await resolveTemplateBuilderContext({
      documentId: request.nextUrl.searchParams.get("document"),
      routingTemplateId: request.nextUrl.searchParams.get("routingTemplate"),
      previewIdentity: identityFrom({
        provider: request.nextUrl.searchParams.get("previewProvider"),
        contentType: request.nextUrl.searchParams.get("previewContentType"),
        contentId: request.nextUrl.searchParams.get("previewContentId"),
      }),
      scope: access.scope,
      website: "website" in access ? access.website : undefined,
    });
    return NextResponse.json({
      ...result,
      editorContext: projectTemplateBuilderEditorContext(result, access.scope),
    });
  } catch (error) { return errorResponse(error); }
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const body = await request.json() as { documentId?: string; routingTemplateId?: string; previewIdentity?: unknown; layout?: BuilderLayout };
  if (!body.layout?.sections?.length || body.layout.sections.some((section) => !isValidTemplatePreviewSection(section))) {
    return NextResponse.json({ error: "A preview layout needs valid sections." }, { status: 400 });
  }
  try {
    const result = await resolveTemplateBuilderContext({
      documentId: body.documentId,
      routingTemplateId: body.routingTemplateId,
      previewIdentity: identityFrom(body.previewIdentity),
      authoredLayout: body.layout,
      scope: access.scope,
      website: "website" in access ? access.website : undefined,
    });
    return NextResponse.json({ renderLayout: result.renderLayout, context: result.context, editorContext: projectTemplateBuilderEditorContext(result, access.scope), candidates: result.candidates, previewIdentity: result.previewIdentity, dynamicContentDiagnostics: result.diagnostics });
  } catch (error) { return errorResponse(error); }
}
