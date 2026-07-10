import { NextRequest, NextResponse } from "next/server";
import { getCategoryTree } from "@/lib/categories";
import { getProductCategories } from "@/lib/navigation";
import { getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId") ?? "";
  const website = websiteId ? await getWebsiteByIdOrSlug(websiteId) : null;
  const [categoryTree, flatCategories] = await Promise.all([
    getCategoryTree({ website }).catch(() => []),
    getProductCategories({ website }).catch(() => []),
  ]);

  return NextResponse.json({
    categoryTree,
    countsBySlug: Object.fromEntries(
      flatCategories.map((category) => [category.slug, category.count])
    ),
  });
}
