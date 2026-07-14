import { NextRequest, NextResponse } from "next/server";
import {
  deleteUser,
  findUserById,
  getCurrentUser,
  isSaaSAdmin,
  isSaaSSuperAdmin,
} from "@/lib/auth";
import { getWebsitesForOwner } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminUserRouteProps = {
  params: Promise<{ userId: string }>;
};

export async function DELETE(
  request: NextRequest,
  { params }: AdminUserRouteProps,
) {
  const currentUser = await getCurrentUser(request.cookies);
  if (!currentUser) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (!isSaaSAdmin(currentUser)) {
    return NextResponse.json({ error: "Access denied." }, { status: 403 });
  }

  const { userId } = await params;
  if (userId === currentUser.id) {
    return NextResponse.json(
      { error: "You cannot delete your own account." },
      { status: 400 },
    );
  }

  const targetUser = await findUserById(userId);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }
  if (targetUser.role !== "user" && !isSaaSSuperAdmin(currentUser)) {
    return NextResponse.json(
      { error: "Only a super admin can delete another administrator." },
      { status: 403 },
    );
  }

  const websites = await getWebsitesForOwner(userId);
  if (websites.length > 0) {
    return NextResponse.json(
      { error: "Delete or reassign this user's websites before deleting the user." },
      { status: 409 },
    );
  }

  const result = await deleteUser(userId);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
