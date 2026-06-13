import { NextRequest, NextResponse } from "next/server";
import {
  isBuilderCustomPageKey,
  readBuilderCustomPages,
  writeBuilderCustomPages,
  readBuilderLayoutStore,
  type BuilderCustomPage,
  type BuilderCustomPageKey,
} from "@/lib/builderLayouts";

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

export async function GET() {
  const store = await readBuilderLayoutStore();
  const publishedKeys = Object.keys(store);
  return NextResponse.json({
    pages: await readBuilderCustomPages(),
    publishedKeys,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    title?: string;
    slug?: string;
  };
  const title = body.title?.trim() || "New Page";
  const existingPages = await readBuilderCustomPages();
  const slug = uniqueSlug(slugify(body.slug || title), existingPages);
  const page: BuilderCustomPage = {
    key: `page:${slug}` as BuilderCustomPageKey,
    title,
    slug,
    updatedAt: new Date().toISOString(),
  };

  await writeBuilderCustomPages([...existingPages, page]);

  return NextResponse.json({ page }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key");

  if (!isBuilderCustomPageKey(key)) {
    return NextResponse.json({ error: "Invalid page key." }, { status: 400 });
  }

  const pages = await readBuilderCustomPages();
  const nextPages = pages.filter((page) => page.key !== key);
  await writeBuilderCustomPages(nextPages);

  return NextResponse.json({ pages: nextPages });
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      pages?: BuilderCustomPage[];
    };

    if (!body.pages || !Array.isArray(body.pages)) {
      return NextResponse.json({ error: "Invalid pages data." }, { status: 400 });
    }

    await writeBuilderCustomPages(body.pages);
    return NextResponse.json({ pages: body.pages });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
