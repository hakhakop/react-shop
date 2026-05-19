import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_UPLOAD_SIZE = 6 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
]);

function safeName(value: string) {
  return value
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No image file was uploaded." }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json(
      { error: "Please upload a JPG, PNG, WebP, GIF, or SVG image." },
      { status: 415 }
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json(
      { error: "Image must be smaller than 6MB." },
      { status: 413 }
    );
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "builder");
  await mkdir(uploadDir, { recursive: true });

  const baseName = safeName(file.name) || "builder-image";
  const filename = `${baseName}-${Date.now().toString(36)}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(uploadDir, filename), bytes);

  return NextResponse.json({
    url: `/uploads/builder/${filename}`,
    filename,
    size: file.size,
    type: file.type,
  });
}
