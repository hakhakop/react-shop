import { NextRequest, NextResponse } from "next/server";
import { getProductsForGrid } from "@/lib/products";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const limit = Math.min(
    Math.max(Number(request.nextUrl.searchParams.get("limit") ?? 24) || 24, 1),
    48
  );
  const source = request.nextUrl.searchParams.get("source");
  const categoryId = request.nextUrl.searchParams.get("categoryId") ?? undefined;

  const products = await getProductsForGrid({
    limit,
    source:
      source === "featured" || source === "category" ? source : "all",
    categoryId,
  });

  return NextResponse.json({ products });
}
