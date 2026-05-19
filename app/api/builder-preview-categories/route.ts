import { NextResponse } from "next/server";
import { getCategoryTree } from "@/lib/categories";
import { getProductCategories } from "@/lib/navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [categoryTree, flatCategories] = await Promise.all([
    getCategoryTree().catch(() => []),
    getProductCategories().catch(() => []),
  ]);

  return NextResponse.json({
    categoryTree,
    countsBySlug: Object.fromEntries(
      flatCategories.map((category) => [category.slug, category.count])
    ),
  });
}
