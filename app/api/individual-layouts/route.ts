import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  IndividualLayoutConflictError,
  IndividualLayoutNotFoundError,
  InvalidIndividualLayoutRequestError,
  UnsupportedIndividualLayoutTargetError,
  createIndividualLayoutsService,
} from "@/lib/individualLayoutsService.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function queryIdentity(request: NextRequest) {
  return {
    provider: request.nextUrl.searchParams.get("provider"),
    contentType: request.nextUrl.searchParams.get("contentType"),
    contentId: request.nextUrl.searchParams.get("contentId"),
  };
}

function serviceError(error: unknown) {
  if (error instanceof InvalidIndividualLayoutRequestError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof UnsupportedIndividualLayoutTargetError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }
  if (error instanceof IndividualLayoutNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof IndividualLayoutConflictError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }
  throw error;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createIndividualLayoutsService(access.scope);
  try {
    const identity = queryIdentity(request);
    if (request.nextUrl.searchParams.get("view") === "assignments") {
      return NextResponse.json({ assignments: await service.listAssignments() });
    }
    if (request.nextUrl.searchParams.get("view") === "assignment") {
      return NextResponse.json({ assignment: await service.getAssignment(identity) });
    }
    return NextResponse.json({ status: await service.getStatus(identity) });
  } catch (error) {
    return serviceError(error);
  }
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createIndividualLayoutsService(access.scope);
  try {
    const body = await request.json();
    return NextResponse.json(await service.create(body.identity, body.layout), { status: 201 });
  } catch (error) {
    return serviceError(error);
  }
}

export async function DELETE(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const service = createIndividualLayoutsService(access.scope);
  try {
    return NextResponse.json(await service.remove(queryIdentity(request), {
      deleteUnreferencedLayout: request.nextUrl.searchParams.get("deleteLayout") !== "false",
    }));
  } catch (error) {
    return serviceError(error);
  }
}
