import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { loadMessages } from "@/lib/i18n.server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Unsupported locale." }, { status: 400 });
  }

  return NextResponse.json({ locale, messages: await loadMessages(locale) });
}
