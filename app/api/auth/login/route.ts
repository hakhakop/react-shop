import { NextRequest, NextResponse } from "next/server";
import {
  authCookieMaxAge,
  authCookieName,
  createSessionToken,
  findUserByEmail,
  toPublicUser,
  validateLoginInput,
  verifyUserPassword,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = validateLoginInput(body as Record<string, unknown>);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const user = await findUserByEmail(parsed.email);
  if (!user || !(await verifyUserPassword(user, parsed.password))) {
    return NextResponse.json(
      { error: "Invalid email or password." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ user: toPublicUser(user) });
  response.cookies.set(authCookieName, createSessionToken(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: authCookieMaxAge,
  });

  return response;
}
