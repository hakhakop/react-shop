import { NextRequest, NextResponse } from "next/server";
import { getCategoryTree } from "@/lib/categories";
import { getProductCategories } from "@/lib/navigation";
import { getWebsiteByIdOrSlug } from "@/lib/websites";
import { resolveWooCommerceTermContexts } from "@/lib/woocommerceTermContentProvider.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const websiteId = request.nextUrl.searchParams.get("websiteId") ?? "";
  const website = websiteId ? await getWebsiteByIdOrSlug(websiteId) : null;
  const [discoveredCategoryTree, flatCategories] = await Promise.all([
    getCategoryTree({ website }).catch(() => []),
    getProductCategories({ website }).catch(() => []),
  ]);
  const fallbackContexts = discoveredCategoryTree.length > 0 ? [] : await resolveWooCommerceTermContexts({
    website,
    descriptor: {
      provider: "woocommerce",
      source: "product-category",
      mode: "collection",
      query: { parentId: 0, quantity: 100, order: "name", direction: "asc", hideEmpty: true },
    },
  }).catch(() => []);
  const categoryTree = discoveredCategoryTree.length > 0
    ? discoveredCategoryTree
    : fallbackContexts.flatMap((context) => {
        const id = Number(context.fields.databaseId?.value ?? context.id);
        const name = context.fields.name?.value;
        const slug = context.fields.slug?.value;
        return Number.isInteger(id) && typeof name === "string" && typeof slug === "string"
          ? [{ id: String(context.id ?? id), dbId: id, name, slug, parentId: null, children: [] }]
          : [];
      });

  return NextResponse.json({
    categoryTree,
    countsBySlug: Object.fromEntries(
      flatCategories.map((category) => [category.slug, category.count])
    ),
  });
}
