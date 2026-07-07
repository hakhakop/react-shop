import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const MAX_LOGO_SIZE = 6 * 1024 * 1024;
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

export async function saveOnboardingLogo(file: File | null | undefined) {
  if (!file || file.size === 0) return { logoUrl: "" };

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return { error: "Please upload a JPG, PNG, WebP, GIF, or SVG logo." };
  }

  if (file.size > MAX_LOGO_SIZE) {
    return { error: "Logo must be smaller than 6MB." };
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "onboarding");
  await mkdir(uploadDir, { recursive: true });

  const baseName = safeName(file.name) || "business-logo";
  const filename = `${baseName}-${Date.now().toString(36)}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await writeFile(path.join(uploadDir, filename), bytes);

  return { logoUrl: `/uploads/onboarding/${filename}` };
}
