import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/products";
import { getWebsiteByDomainHost } from "@/lib/websites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  const website = await getWebsiteByDomainHost(host);
  const products = await searchProducts(query, { website }).catch(() => []);

  return NextResponse.json({
    products: products.slice(0, 10).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      thumbnailUrl: product.image?.sourceUrl ?? undefined,
      price: product.price ?? null,
    })),
  });
}
