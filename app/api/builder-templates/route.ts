import { NextResponse } from "next/server";
import {
  isValidBuilderSection,
  normalizeBuilderLayoutKey,
  readBuilderSavedTemplates,
  type BuilderSavedTemplate,
  writeBuilderSavedTemplates,
} from "@/lib/builderLayouts";

function slugifyTemplateId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function GET() {
  const templates = await readBuilderSavedTemplates();
  return NextResponse.json({ templates });
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<BuilderSavedTemplate>;
  const title = body.title?.trim() || "Saved Template";
  const sections = Array.isArray(body.sections) ? body.sections : [];

  if (!sections.every(isValidBuilderSection)) {
    return NextResponse.json(
      { error: "Invalid builder template sections" },
      { status: 400 },
    );
  }

  const templates = await readBuilderSavedTemplates();
  const existing = templates.find(
    (template) => template.title.toLowerCase() === title.toLowerCase(),
  );
  const fallbackId = slugifyTemplateId(title) || "saved-template";
  const template: BuilderSavedTemplate = {
    id: existing?.id ?? body.id ?? fallbackId,
    title,
    description: body.description?.trim() || existing?.description,
    sourcePage: body.sourcePage
      ? normalizeBuilderLayoutKey(String(body.sourcePage))
      : existing?.sourcePage,
    design: body.design,
    sections,
    updatedAt: new Date().toISOString(),
  };

  const nextTemplates = [
    template,
    ...templates.filter((entry) => entry.id !== template.id),
  ];
  await writeBuilderSavedTemplates(nextTemplates);

  return NextResponse.json({ template, templates: nextTemplates });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Template id is required" }, { status: 400 });
  }

  const templates = await readBuilderSavedTemplates();
  const nextTemplates = templates.filter((template) => template.id !== id);
  await writeBuilderSavedTemplates(nextTemplates);

  return NextResponse.json({ templates: nextTemplates });
}
