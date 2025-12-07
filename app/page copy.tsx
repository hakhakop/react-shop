import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import { graphqlFetch } from "../lib/graphql";
import { getFeaturedProducts } from "../lib/featured";
import {
  getProductCategories,
  ProductCategory,
} from "../lib/navigation";
import { getThemeSettings } from "../lib/themeSettings";
import ProductCard from "../components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import HomePerks from "../components/HomePerks";
import RecentlyViewedStrip from "../components/RecentlyViewedStrip";

//
// Types
//

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

type ProductNode = {
  id: string;
  slug: string;
  name: string;
  image?: WPImage | null;
  price?: string | null;
};

type ProductsData = {
  products: {
    nodes: ProductNode[];
  };
};

//
// Default product query (non-featured)
//

const PRODUCTS_QUERY = `
  query ProductsForHome {
    products(first: 24) {
      nodes {
        id
        slug
        name
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price(format: RAW)
        }
        ... on VariableProduct {
          price(format: RAW)
        }
      }
    }
  }
`;

//
// Helpers to normalize ACF values
//

function asString(value: unknown, fallback: string | null = null): string | null {
  if (typeof value === "string" && value.trim() !== "") return value;
  return fallback;
}

function asPositiveInt(value: unknown, fallback: number): number {
  if (typeof value === "number" && value > 0) return value;
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n) && n > 0) return n;
  }
  return fallback;
}

function asBool(value: unknown, fallback: boolean): boolean {
  // ACF true/false can give: true, false, 1, 0, "1", "0", null
  if (value === true || value === 1 || value === "1") return true;
  if (value === false || value === 0 || value === "0") return false;
  return fallback;
}

//
// PAGE
//

async function HomeContent() {
  try {
    // Fetch theme settings + products + categories in parallel
    const [settingsRaw, featured, categories, allProducts] = await Promise.all([
      getThemeSettings(),
      getFeaturedProducts(),
      getProductCategories(),
      graphqlFetch<ProductsData>(PRODUCTS_QUERY),
    ]);

    // Some ACF setups wrap options in a group like `theme_settings`.
    // We'll auto-detect a sensible "root" object.
    const settings =
      (settingsRaw?.theme_settings as Record<string, any>) ||
      (settingsRaw?.theme as Record<string, any>) ||
      (settingsRaw?.webpages_headless_theme as Record<string, any>) ||
      (settingsRaw as Record<string, any>);

    // Colors (from ACF color pickers: primary_color, accent_color)
    const primaryColor =
      asString(settings.primary_color, "#111827") || "#111827"; // default dark gray
    const accentColor =
      asString(settings.accent_color, "#ec4899") || "#ec4899"; // default pink

    // Hero title / subtitle
    const heroTitle =
      asString(settings.home_hero_title, "Webpages Store") || "Webpages Store";
    const heroSubtitle =
      asString(
        settings.home_hero_subtitle,
        "Discover carefully curated products with a clean, fast shopping experience."
      ) ||
      "Discover carefully curated products with a clean, fast shopping experience.";

    // Logo: try to extract URL from the ACF image field
    const logoField =
      settings.logo || settings.site_logo || settings.store_logo;

    let logoUrl: string | null = null;
    if (typeof logoField === "string") {
      logoUrl = logoField;
    } else if (logoField && typeof logoField === "object") {
      // Handle common ACF image array shapes
      logoUrl =
        (logoField.url as string) ||
        (logoField.source_url as string) ||
        (logoField.sourceUrl as string) ||
        (logoField.full_url as string) ||
        null;
    }

    // Featured limit: try several possible keys, then convert
    const rawLimitCandidate =
      settings.home_featured_limit ??
      settings.homepage_featured_limit ??
      settings.featured_limit ??
      settings.featured_products_limit;

    const featuredLimit = asPositiveInt(rawLimitCandidate, 4);

    // Show category tiles
    const showCategoryTiles = asBool(settings.show_category_tiles, true);

    // PRODUCTS & CATEGORIES
    const featuredProducts = (featured || []).slice(0, featuredLimit);
    const allNodes = allProducts.products.nodes;

    // Remove featured products from the regular list
    const moreProducts = allNodes.filter(
      (p) => !featuredProducts.find((f) => f.id === p.id)
    );

    const topCategories: ProductCategory[] = categories.slice(0, 8);

    // RENDER
    return (
      <main className="home-page">
        <div className="home-inner">
          {/* HERO */}
          <section className="home-hero">
            <div>
              {logoUrl && (
                <div className="mb-4">
                  <Image
                    src={logoUrl}
                    alt="Store logo"
                    width={64}
                    height={64}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              )}

              <div className="home-hero-kicker">Online store</div>

              <h1 className="home-hero-title" style={{ color: primaryColor }}>
                {heroTitle}
              </h1>

              {heroSubtitle && (
                <p className="home-hero-subtitle">{heroSubtitle}</p>
              )}

              <div className="home-hero-actions flex gap-3 mt-6">
                <Button asChild size="lg">
                  <Link href="/shop">Browse all products</Link>
                </Button>

                <Button variant="outline" asChild size="lg">
                  <Link href="/categories">Explore categories</Link>
                </Button>
              </div>
            </div>

            <div className="home-hero-side">
              <div style={{ fontSize: 13, color: "#4b5563" }}>
                Clean, modular WooCommerce storefront powered by React and Next.js.
              </div>
            </div>
          </section>

          {/* NEW DEMO BLOCK */}
          <HomePerks />

          {/* RECENTLY VIEWED STRIP */}
          <RecentlyViewedStrip />

          {/* FEATURED PRODUCTS */}
          {featuredProducts.length > 0 && (
            <section
              className="home-section home-featured"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}11, ${accentColor}11)`,
              }}
            >
              <div className="home-section-header">
                <div>
                  <h2 className="home-section-title">Featured products</h2>
                  <p className="home-section-subtitle">
                    Highlighted items selected from WooCommerce.
                  </p>
                </div>
                <div className="home-section-actions">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/shop">View all products</Link>
                  </Button>
                </div>
              </div>

              <div className="product-grid">
                {featuredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* MORE PRODUCTS */}
          {moreProducts.length > 0 && (
            <section className="home-section">
              <div className="home-section-header">
                <div>
                  <h2 className="home-section-title">More products</h2>
                  <p className="home-section-subtitle">
                    Explore the rest of the catalog loaded from WordPress.
                  </p>
                </div>
                <div className="home-section-actions">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/shop">Browse full catalog</Link>
                  </Button>
                </div>
              </div>

              <div className="product-grid">
                {moreProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* CATEGORIES */}
          {showCategoryTiles && topCategories.length > 0 && (
            <section className="home-section">
              <div className="home-section-header">
                <div>
                  <h2 className="home-section-title">Shop by category</h2>
                  <p className="home-section-subtitle">
                    Jump directly into top-level product categories.
                  </p>
                </div>
              </div>

              <div className="category-grid">
                {topCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="category-card"
                  >
                    <div className="category-card-name">{cat.name}</div>
                    {cat.count > 0 && (
                      <Badge
                        variant="secondary"
                        className="category-card-count"
                      >
                        {cat.count} item{cat.count === 1 ? "" : "s"}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    );
  } catch (err: any) {
    return (
      <main className="home-page">
        <div className="home-inner">
          <h1 className="page-title">Store</h1>
          <p style={{ color: "#b91c1c" }}>
            Failed to load products: {String(err?.message || err)}
          </p>
        </div>
      </main>
    );
  }
}

function HomeSkeleton() {
  return (
    <main className="home-page">
      <div className="home-inner">
        {/* HERO SKELETON */}
        <section className="home-hero">
          <div>
            <div className="mb-4 h-16 w-16 animate-pulse rounded-full bg-slate-800/40" />

            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-slate-800/60" />

            <div className="mb-3 h-8 w-64 max-w-full animate-pulse rounded bg-slate-800/70" />

            <div className="mb-4 h-4 w-80 max-w-full animate-pulse rounded bg-slate-800/60" />

            <div className="mt-6 flex gap-3">
              <div className="h-10 w-40 animate-pulse rounded-full bg-slate-800/60" />
              <div className="h-10 w-40 animate-pulse rounded-full bg-slate-800/40" />
            </div>
          </div>

          <div className="home-hero-side">
            <div className="h-24 w-full max-w-xs animate-pulse rounded-xl bg-slate-900/60" />
          </div>
        </section>

        {/* FEATURED PRODUCTS SKELETON */}
        <section className="home-section home-featured mt-6">
          <div className="home-section-header mb-4">
            <div>
              <div className="mb-2 h-5 w-40 animate-pulse rounded bg-slate-800/60" />
              <div className="h-4 w-64 max-w-full animate-pulse rounded bg-slate-800/40" />
            </div>
            <div className="home-section-actions">
              <div className="h-8 w-28 animate-pulse rounded-full bg-slate-800/60" />
            </div>
          </div>

          <div className="product-grid">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="product-card">
                <div className="product-image animate-pulse rounded-lg bg-slate-800/40" />
                <div className="mt-2 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/60" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800/60" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}