import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getWebsiteByDomainHost } from "@/lib/websites";

export const dynamic = "force-dynamic";

export async function GET() {
  const website = await getWebsiteByDomainHost((await headers()).get("host"));

  if (!website) {
    return NextResponse.json(
      { connected: false },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { connected: true, websiteId: website.id },
    { headers: { "Cache-Control": "no-store" } },
  );
}
