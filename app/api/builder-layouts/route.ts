import { NextRequest, NextResponse } from "next/server";
import {
  getPublishedBuilderLayout,
  getBuilderTargetType,
  isValidBuilderSection,
  isBuilderTemplate,
  normalizeBuilderLayoutKey,
  mutateBuilderLayoutStore,
  type BuilderLayout,
} from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import type { BuilderSection } from "@/components/dashboard/builderTypes";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getOrCreateHeaderBuilderLayout, migrateLegacyHeaderDocument } from "@/lib/headerBuilderDocument";
import { getOrCreateFooterBuilderLayout } from "@/lib/footerBuilderDocument";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import {
  BuilderDocumentNotFoundError,
  InvalidBuilderDocumentIdError,
  createDynamicBuilderDocument,
  deleteDynamicBuilderDocument,
  duplicateDynamicBuilderDocument,
  readDynamicBuilderDocument,
  updateDynamicBuilderDocument,
} from "@/lib/builderLayoutDocuments.server";
import { resolveOrdinaryBuilderEditorContext } from "@/lib/builderEditorContext.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dynamicDocumentError(error: unknown) {
  if (error instanceof InvalidBuilderDocumentIdError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof BuilderDocumentNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  throw error;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const documentId = request.nextUrl.searchParams.get("document");
  if (documentId !== null) {
    try {
      const layout = await readDynamicBuilderDocument(documentId, access.scope);
      const materialization = await materializeBuilderDynamicContent(layout, {
        website: "website" in access ? access.website : undefined,
      });
      return NextResponse.json({
        layout,
        renderLayout: materialization.renderLayout !== layout
          ? materialization.renderLayout
          : null,
        dynamicContentDiagnostics: materialization.diagnostics,
        materializedGridBlocks: materialization.materializedGridBlocks,
      });
    } catch (error) {
      return dynamicDocumentError(error);
    }
  }

  const page = normalizeBuilderLayoutKey(
    request.nextUrl.searchParams.get("key") ??
      request.nextUrl.searchParams.get("template") ??
      request.nextUrl.searchParams.get("page")
  );

  const layout = page === "header"
    ? await getOrCreateHeaderBuilderLayout(
        await getBuilderShellSettings(access.scope),
        access.scope,
        !access.scope.websiteId,
      )
    : page === "footer"
      ? await getOrCreateFooterBuilderLayout(access.scope)
    : await getPublishedBuilderLayout(page, access.scope);
  const materialization = layout
    ? await materializeBuilderDynamicContent(layout, {
        website: "website" in access ? access.website : undefined,
      })
    : null;
  const editorContext = await resolveOrdinaryBuilderEditorContext({
    page,
    scope: access.scope,
    layout,
  });
  return NextResponse.json({
    // Persistence authority: Builder hydration and Save continue using this.
    layout,
    // Render-only projection: never copied into editable Builder state.
    renderLayout:
      materialization && materialization.renderLayout !== layout
        ? materialization.renderLayout
        : null,
    dynamicContentDiagnostics: materialization?.diagnostics ?? [],
    materializedGridBlocks: materialization?.materializedGridBlocks ?? [],
    editorContext,
  });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const body = (await request.json()) as {
    action?: "create" | "save" | "duplicate";
    documentId?: string;
    displayName?: string;
    key?: string;
    page?: string;
    template?: string;
    design?: BuilderLayout["design"];
    sections?: unknown;
  };

  if (body.action) {
    try {
      if (body.action === "create") {
        const sections = body.sections === undefined
          ? undefined
          : Array.isArray(body.sections) && body.sections.every(isValidBuilderSection)
            ? body.sections as BuilderSection[]
            : null;
        if (sections === null) {
          return NextResponse.json({ error: "Invalid Builder document sections." }, { status: 400 });
        }
        const layout = await createDynamicBuilderDocument({
          displayName: body.displayName,
          design: body.design,
          sections,
        }, access.scope);
        return NextResponse.json({ layout }, { status: 201 });
      }
      if (!body.documentId) {
        return NextResponse.json({ error: "Dynamic Builder document ID is required." }, { status: 400 });
      }
      if (body.action === "duplicate") {
        const layout = await duplicateDynamicBuilderDocument(body.documentId, access.scope);
        return NextResponse.json({ layout }, { status: 201 });
      }
      const sections = Array.isArray(body.sections) && body.sections.every(isValidBuilderSection)
        ? body.sections as BuilderSection[]
        : null;
      if (!sections?.length) {
        return NextResponse.json({ error: "A layout needs at least one valid section." }, { status: 400 });
      }
      const layout = await updateDynamicBuilderDocument(body.documentId, {
        displayName: body.displayName,
        design: body.design,
        sections,
      }, access.scope);
      return NextResponse.json({ layout });
    } catch (error) {
      return dynamicDocumentError(error);
    }
  }

  const requestedPage = body.key ?? body.template ?? body.page;
  const page = normalizeBuilderLayoutKey(requestedPage ?? null);
  if (requestedPage !== undefined && page !== requestedPage) {
    return NextResponse.json({ error: "Invalid Builder layout key." }, { status: 400 });
  }
  const sections = Array.isArray(body.sections)
    ? (body.sections.filter(isValidBuilderSection) as unknown as BuilderSection[])
    : [];

  if (sections.length === 0) {
    return NextResponse.json(
      { error: "A layout needs at least one valid section." },
      { status: 400 }
    );
  }

  let layout: BuilderLayout = {
    version: 1,
    key: page,
    page,
    targetType: getBuilderTargetType(page),
    template: isBuilderTemplate(page) ? page : undefined,
    displayName: body.displayName,
    design: body.design,
    sections,
    updatedAt: new Date().toISOString(),
  };
  if (page === "header") {
    layout = migrateLegacyHeaderDocument(
      layout,
      await getBuilderShellSettings(access.scope),
    );
  }

  await mutateBuilderLayoutStore((store) => {
    store[page] = layout;
  }, access.scope);

  return NextResponse.json({ layout });
}

export async function DELETE(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  try {
    await deleteDynamicBuilderDocument(
      request.nextUrl.searchParams.get("document"),
      access.scope,
    );
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return dynamicDocumentError(error);
  }
}
