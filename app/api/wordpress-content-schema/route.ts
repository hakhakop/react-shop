import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import { discoverWordPressContentSchema } from "@/lib/wordpressContentSchema.server";
import { wordpressContentSchemaCapabilities } from "@/lib/wordpressContentSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  try {
    const schema = await discoverWordPressContentSchema("website" in access ? access.website : null);
    return NextResponse.json({ schema, capabilities: wordpressContentSchemaCapabilities(schema) });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : "WordPress content schema discovery failed.",
    }, { status: 502 });
  }
}
