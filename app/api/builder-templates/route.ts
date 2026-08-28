import { NextRequest, NextResponse } from "next/server";
import {
  isValidBuilderSection,
  normalizeBuilderLayoutKey,
  readBuilderSavedTemplates,
  type BuilderSavedTemplate,
  writeBuilderSavedTemplates,
} from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LibraryScope = "site" | "shared";

function withLibraryScope(
  templates: BuilderSavedTemplate[],
  libraryScope: LibraryScope,
) {
  return templates.map((template) => ({ ...template, libraryScope }));
}

async function readVisibleTemplates(scope: { websiteId?: string }) {
  if (!scope.websiteId) {
    return withLibraryScope(await readBuilderSavedTemplates(), "shared");
  }
  const [siteTemplates, sharedTemplates] = await Promise.all([
    readBuilderSavedTemplates(scope),
    readBuilderSavedTemplates(),
  ]);
  return [
    ...withLibraryScope(siteTemplates, "site"),
    ...withLibraryScope(sharedTemplates, "shared"),
  ];
}

function slugifyTemplateId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function createTemplateId(title: string) {
  const slug = slugifyTemplateId(title) || "saved-template";
  return `${slug}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  return NextResponse.json({ templates: await readVisibleTemplates(access.scope) });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const body = (await request.json()) as Partial<BuilderSavedTemplate>;
  const title = body.title?.trim() || "Saved Template";
  const sections = Array.isArray(body.sections) ? body.sections : [];

  if (!sections.every(isValidBuilderSection)) {
    return NextResponse.json(
      { error: "Invalid builder template sections" },
      { status: 400 },
    );
  }

  const templates = await readBuilderSavedTemplates(access.scope);
  const existing = body.id
    ? templates.find((template) => template.id === body.id)
    : undefined;
  const template: BuilderSavedTemplate = {
    id: existing?.id ?? body.id ?? createTemplateId(title),
    title,
    templateType:
      body.templateType === "header" ||
      body.templateType === "footer" ||
      body.templateType === "section" ||
      body.templateType === "row" ||
      body.templateType === "element"
        ? body.templateType
        : body.templateType === "page"
          ? "page"
          : existing?.templateType,
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
  await writeBuilderSavedTemplates(nextTemplates, access.scope);

  return NextResponse.json({
    template: {
      ...template,
      libraryScope: access.scope.websiteId ? "site" : "shared",
    },
    templates: await readVisibleTemplates(access.scope),
  });
}

export async function DELETE(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  const id = request.nextUrl.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Template id is required" }, { status: 400 });
  }

  const templates = await readBuilderSavedTemplates(access.scope);
  const nextTemplates = templates.filter((template) => template.id !== id);
  await writeBuilderSavedTemplates(nextTemplates, access.scope);

  return NextResponse.json({ templates: await readVisibleTemplates(access.scope) });
}
