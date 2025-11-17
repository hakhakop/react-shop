import Link from "next/link";
import Image from "next/image";

import { graphqlFetch } from "../lib/graphql";
import { getFeaturedProducts } from "../lib/featured";
import {
  getProductCategories,
  ProductCategory,
} from "../lib/navigation";
import WishlistToggle from "../components/WishlistToggle";
import { getThemeSettings } from "../lib/themeSettings";

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

export default async function Home() {
  try {
    //
    // Fetch theme settings + products + categories in parallel
    //
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

    // Debug root object shape
    console.log("Theme Settings Root:", settings);

    // ----- THEME SETTINGS MAPPING -----

    // Colors (from ACF color pickers: primary_color, accent_color)
    const primaryColor =
      asString(settings.primary_color, "#111827") || "#111827"; // default dark gray
    const accentColor =
      asString(settings.accent_color, "#ec4899") || "#ec4899"; // default pink

    // Hero title / subtitle
    const heroTitle =
      asString(settings.home_hero_title, "Webpages Store") || "Webpages Store";
    const heroSubtitle = asString(settings.home_hero_subtitle, null);

    // Logo: try to extract URL from the ACF image field
    const logoField =
      settings.logo ||
      settings.site_logo ||
      settings.store_logo;

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

    console.log("Logo field from settings:", logoField);
    console.log("Resolved logoUrl:", logoUrl);

    // Featured limit: try several possible keys, then convert
    const rawLimitCandidate =
      settings.home_featured_limit ??
      settings.homepage_featured_limit ??
      settings.featured_limit ??
      settings.featured_products_limit;

    console.log("Raw featured limit from settings:", rawLimitCandidate);

    const featuredLimit = asPositiveInt(rawLimitCandidate, 4);

    // Show category tiles
    const showCategoryTiles = asBool(settings.show_category_tiles, true);

    // ----- PRODUCTS & CATEGORIES -----

    const featuredProducts = (featured || []).slice(0, featuredLimit);
    const allNodes = allProducts.products.nodes;

    // Remove featured products from the regular list
    const moreProducts = allNodes.filter(
      (p) => !featuredProducts.find((f) => f.id === p.id)
    );

    const topCategories = categories.slice(0, 8);

    //
    // RENDER
    //
    return (
      <main className="page">
        {/* HERO */}
        <section
          className="home-hero"
          style={{
            borderBottom: `3px solid ${accentColor}`,
          }}
        >
          {logoUrl && (
            <div className="mb-4 flex justify-center">
              <Image
                src={logoUrl}
                alt="Store logo"
                width={72}
                height={72}
                style={{ objectFit: "var(--product-image-object-fit, contain)" as any }}
              />
            </div>
          )}

          <h1 className="page-title" style={{ color: primaryColor }}>
            {heroTitle}
          </h1>
          {heroSubtitle && (
            <p className="page-subtitle" style={{ color: "#4b5563" }}>
              {heroSubtitle}
            </p>
          )}
        </section>

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
            </div>

            <div className="product-grid">
              {featuredProducts.map((p) => {
                const priceNumber = p.price ? parseFloat(p.price) : null;
                const imageUrl = p.image?.sourceUrl || undefined;

                return (
                  <div key={p.id} className="product-card">
                    <div className="product-card-top-right">
                      <WishlistToggle
                        id={p.id}
                        slug={p.slug}
                        name={p.name}
                        imageUrl={imageUrl}
                      />
                    </div>

                    <Link
                      href={`/product/${p.slug}`}
                      className="product-card-link"
                    >
                      <div className="product-image">
                        {p.image?.sourceUrl ? (
                          <Image
                            src={p.image.sourceUrl}
                            alt={p.image.altText || p.name}
                            width={400}
                            height={300}
                            style={{ objectFit: "var(--product-image-object-fit, contain)" as any }}
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            No image
                          </div>
                        )}
                      </div>

                      <h3 className="product-title product-title-2lines">
                        {p.name}
                      </h3>

                      {priceNumber !== null &&
                        !Number.isNaN(priceNumber) && (
                          <div className="product-price">
                            {priceNumber.toLocaleString("hy-AM", {
                              style: "currency",
                              currency: "AMD",
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        )}
                    </Link>
                  </div>
                );
              })}
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
            </div>

            <div className="product-grid">
              {moreProducts.map((p) => {
                const priceNumber = p.price ? parseFloat(p.price) : null;
                const imageUrl = p.image?.sourceUrl || undefined;

                return (
                  <div key={p.id} className="product-card">
                    <div className="product-card-top-right">
                      <WishlistToggle
                        id={p.id}
                        slug={p.slug}
                        name={p.name}
                        imageUrl={imageUrl}
                      />
                    </div>

                    <Link
                      href={`/product/${p.slug}`}
                      className="product-card-link"
                    >
                      <div className="product-image">
                        {p.image?.sourceUrl ? (
                          <Image
                            src={p.image.sourceUrl}
                            alt={p.image.altText || p.name}
                            width={400}
                            height={300}
                            style={{ objectFit: "var(--product-image-object-fit, contain)" as any }}
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            No image
                          </div>
                        )}
                      </div>

                      <h3 className="product-title product-title-2lines">
                        {p.name}
                      </h3>

                      {priceNumber !== null &&
                        !Number.isNaN(priceNumber) && (
                          <div className="product-price">
                            {priceNumber.toLocaleString("hy-AM", {
                              style: "currency",
                              currency: "AMD",
                              maximumFractionDigits: 0,
                            })}
                          </div>
                        )}
                    </Link>
                  </div>
                );
              })}
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
                  <div className="category-card-name">
                    {cat.name}
                  </div>
                  {cat.count > 0 && (
                    <div className="category-card-count">
                      {cat.count} item{cat.count === 1 ? "" : "s"}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    );
  } catch (err: any) {
    return (
      <main className="page">
        <h1 className="page-title">Store</h1>
        <p style={{ color: "#b91c1c" }}>
          Failed to load products: {String(err?.message || err)}
        </p>
      </main>
    );
  }
}