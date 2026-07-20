import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, isSaaSSuperAdmin } from "@/lib/auth";
import { isLocale, validateMessages } from "@/lib/i18n";
import { loadMessages, saveMessages } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

async function requireSuperAdmin(request: NextRequest) {
  const user = await getCurrentUser(request.cookies);
  if (!user) {
    return { error: NextResponse.json({ error: "Authentication required." }, { status: 401 }) };
  }
  if (!isSaaSSuperAdmin(user)) {
    return { error: NextResponse.json({ error: "Super Admin access required." }, { status: 403 }) };
  }
  return { user };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const auth = await requireSuperAdmin(request);
  if ("error" in auth) return auth.error;

  const { locale } = await params;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }

  return NextResponse.json({ locale, messages: await loadMessages(locale) });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ locale: string }> },
) {
  const auth = await requireSuperAdmin(request);
  if ("error" in auth) return auth.error;

  const { locale } = await params;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const candidate =
    typeof body === "object" && body !== null && "messages" in body
      ? (body as { messages?: unknown }).messages
      : body;
  const validated = validateMessages(candidate);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const saved = await saveMessages(locale, validated.messages);
  if (!saved.ok) {
    return NextResponse.json({ error: saved.error }, { status: 400 });
  }

  return NextResponse.json({ locale, messages: saved.messages });
}
