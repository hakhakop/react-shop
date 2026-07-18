import { NextRequest, NextResponse } from "next/server";
import {
  authCookieMaxAge,
  authCookieName,
  createSessionToken,
  createUser,
  toPublicUser,
  validateRegistrationInput,
} from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      body = Object.fromEntries(formData.entries());
    } else {
      body = (await request.json()) as Record<string, unknown>;
    }
  } catch {
    return NextResponse.json({ error: "Invalid registration body." }, { status: 400 });
  }

  const parsed = validateRegistrationInput(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const result = await createUser(parsed);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const response = NextResponse.json(
    {
      user: toPublicUser(result.user),
      message: "Your account is ready. Let’s create your first website.",
    },
    { status: 201 },
  );

  response.cookies.set(authCookieName, createSessionToken(result.user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: authCookieMaxAge,
  });

  return response;
}
