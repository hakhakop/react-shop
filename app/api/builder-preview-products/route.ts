import { NextRequest, NextResponse } from "next/server";
import { getProductsForGrid } from "@/lib/products";
import { getWebsiteByIdOrSlug } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("limit") ?? 24) || 24, 1),
    500
  );
  const source = request.nextUrl.searchParams.get("source");
  const categoryId = request.nextUrl.searchParams.get("categoryId") ?? undefined;
  const websiteId = request.nextUrl.searchParams.get("websiteId") ?? "";
  const website = websiteId ? await getWebsiteByIdOrSlug(websiteId) : null;

  // Resolve effective source
  let effectiveSource: "featured" | "category" | "all" = "all";
  if (source === "featured") {
    effectiveSource = "featured";
  } else if (source === "sale") {
    // WooCommerce doesn't have a direct "on sale" query filter in the same way;
    // fetch all and let client-side filtering handle it
    effectiveSource = "all";
  } else if (source === "category" || (categoryId && categoryId !== "all")) {
    effectiveSource = "category";
  }

  const products = await getProductsForGrid({
    limit,
    source: effectiveSource,
    categoryId: categoryId === "all" ? undefined : categoryId,
    website,
  });

  return NextResponse.json({ products });
}
