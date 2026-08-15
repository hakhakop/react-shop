import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  InvalidRoutingTemplateRequestError,
  RoutingTemplateConflictError,
  RoutingTemplateNotFoundError,
  createRoutingTemplatesService,
} from "@/lib/routingTemplatesService.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serviceError(error: unknown) {
  if (error instanceof InvalidRoutingTemplateRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof RoutingTemplateNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof RoutingTemplateConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  throw error;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createRoutingTemplatesService(access.scope);
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) return NextResponse.json({ template: await service.get(id) });
    const layoutId = request.nextUrl.searchParams.get("referencesForLayout");
    if (layoutId) return NextResponse.json({ references: await service.inspectReferences(layoutId) });
    return NextResponse.json({ templates: await service.list() });
  } catch (error) {
    return serviceError(error);
  }
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createRoutingTemplatesService(access.scope);
  const body = await request.json();
  try {
    if (body.action === "create") {
      return NextResponse.json(await service.create(body), { status: 201 });
    }
    if (body.action === "update") {
      return NextResponse.json({ template: await service.update(body.id, body) });
    }
    if (body.action === "set-enabled") {
      return NextResponse.json({ template: await service.setEnabled(body.id, body.enabled) });
    }
    if (body.action === "reorder") {
      return NextResponse.json({ templates: await service.reorder(body.ids) });
    }
    if (body.action === "duplicate") {
      return NextResponse.json(await service.duplicate(body.id), { status: 201 });
    }
    throw new InvalidRoutingTemplateRequestError("Invalid Routing Template action.");
  } catch (error) {
    return serviceError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createRoutingTemplatesService(access.scope);
  try {
    return NextResponse.json(await service.delete(
      request.nextUrl.searchParams.get("id"),
      { deleteUnreferencedLayout: request.nextUrl.searchParams.get("deleteLayout") !== "false" },
    ));
  } catch (error) {
    return serviceError(error);
  }
}
