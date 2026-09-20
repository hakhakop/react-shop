import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isSaaSAdmin } from "@/lib/auth";
import {
  createGlobalStarter,
  readGlobalStarters,
  removeGlobalStarter,
  updateGlobalStarter,
} from "@/lib/globalStarters";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin(request: NextRequest) {
  const user = await getCurrentUser(request.cookies);
  return user && isSaaSAdmin(user) ? user : null;
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }
  return NextResponse.json({ starters: await readGlobalStarters() });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await createGlobalStarter({
    sourceWebsiteId: typeof body.sourceWebsiteId === "string" ? body.sourceWebsiteId : "",
    title: body.title,
    description: body.description,
    category: body.category,
    sortOrder: body.sortOrder,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ starter: result.record }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const result = await updateGlobalStarter({
    id: typeof body.id === "string" ? body.id : "",
    title: body.title,
    description: body.description,
    category: body.category,
    sortOrder: body.sortOrder,
    enabled: body.enabled,
  });
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ starter: result.record });
}

export async function DELETE(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const id = new URL(request.url).searchParams.get("id") ?? "";
  const result = await removeGlobalStarter(id);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
