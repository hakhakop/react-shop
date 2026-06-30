import { NextRequest, NextResponse } from "next/server";
import {
  isBuilderCustomPageKey,
  readBuilderCustomPages,
  writeBuilderCustomPages,
  readBuilderLayoutStore,
  type BuilderCustomPage,
  type BuilderCustomPageKey,
} from "@/lib/builderLayouts";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function uniqueSlug(baseSlug: string, pages: BuilderCustomPage[]) {
  const reserved = new Set([
    "home",
    "cart",
    "categories",
    "checkout",
    "client",
    "dashboard",
    "product",
    "search",
    "shop",
    "wishlist",
    ...pages.map((page) => page.slug),
  ]);
  let slug = baseSlug || "new-page";
  let suffix = 2;

  while (reserved.has(slug)) {
    slug = `${baseSlug || "new-page"}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const store = await readBuilderLayoutStore(access.scope);
  const publishedKeys = Object.keys(store);
  return NextResponse.json({
    pages: await readBuilderCustomPages(access.scope),
    publishedKeys,
  });
}

export async function POST(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const body = (await request.json()) as {
    title?: string;
    slug?: string;
  };
  const title = body.title?.trim() || "New Page";
  const existingPages = await readBuilderCustomPages(access.scope);
  const slug = uniqueSlug(slugify(body.slug || title), existingPages);
  const page: BuilderCustomPage = {
    key: `page:${slug}` as BuilderCustomPageKey,
    title,
    slug,
    updatedAt: new Date().toISOString(),
  };

  await writeBuilderCustomPages([...existingPages, page], access.scope);

  return NextResponse.json({ page }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;

  const key = request.nextUrl.searchParams.get("key");

  if (!isBuilderCustomPageKey(key)) {
    return NextResponse.json({ error: "Invalid page key." }, { status: 400 });
  }

  const pages = await readBuilderCustomPages(access.scope);
  const nextPages = pages.filter((page) => page.key !== key);
  await writeBuilderCustomPages(nextPages, access.scope);

  return NextResponse.json({ pages: nextPages });
}

export async function PUT(request: NextRequest) {
  try {
    const access = await getAuthorizedWebsiteBuilderScope(request);
    if ("error" in access) return access.error;

    const body = (await request.json()) as {
      pages?: BuilderCustomPage[];
    };

    if (!body.pages || !Array.isArray(body.pages)) {
      return NextResponse.json({ error: "Invalid pages data." }, { status: 400 });
    }

    await writeBuilderCustomPages(body.pages, access.scope);
    return NextResponse.json({ pages: body.pages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
