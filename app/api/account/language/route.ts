import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, updateUserLanguage } from "@/lib/auth";
import { localeCookieName, normalizeLocale } from "@/lib/i18n";

export async function PATCH(request: Request) {
  const cookieStore = await cookies();
  const user = await getCurrentUser(cookieStore);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { locale?: unknown };
  if (body.locale !== "en" && body.locale !== "hy") {
    return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
  }

  const locale = normalizeLocale(body.locale);
  const result = await updateUserLanguage(user.id, locale);
  if ("error" in result) return NextResponse.json(result, { status: 404 });

  const response = NextResponse.json({ locale });
  response.cookies.set(localeCookieName, locale, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return response;
}
