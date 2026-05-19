import { NextRequest, NextResponse } from "next/server";
import {
  getBuilderShellSettings,
  normalizeBuilderShellSettings,
  writeBuilderShellSettings,
  type BuilderShellSettings,
} from "@/lib/builderShell";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    settings: await getBuilderShellSettings(),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<BuilderShellSettings>;
  const settings = normalizeBuilderShellSettings(body);
  await writeBuilderShellSettings(settings);

  return NextResponse.json({ settings });
}
