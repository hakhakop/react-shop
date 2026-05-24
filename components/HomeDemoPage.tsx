import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Check, ShieldCheck, Sparkles, Truck } from "lucide-react";

import ProductCard from "@/components/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFeaturedProducts } from "@/lib/featured";
import { getProductCategories } from "@/lib/navigation";
import { getProductsForGrid, type ProductNode } from "@/lib/products";
import { getThemeSettings } from "@/lib/themeSettings";

type HomeTile = {
  product?: ProductNode | null;
  title: string;
  label: string;
};

type HomeCategoryCard = {
  id: string;
  name: string;
  slug: string;
  count: number;
  image?: ProductNode["image"];
  note: string;
};

type HomePerk = {
  icon: typeof Truck;
  title: string;
  body: string;
};

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : fallback;
}

function uniqueProducts(products: ProductNode[]) {
  const seen = new Set<string>();
  return products.filter((product) => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function hasImage(product: ProductNode) {
  return Boolean(product.image?.sourceUrl);
}

function formatCount(count: number) {
  return `${count.toLocaleString("en-US")} item${count === 1 ? "" : "s"}`;
}

function categoryNote(index: number) {
  const notes = [
    "Soft silhouettes for daily living.",
    "Clean forms for dining and gathering.",
    "Calm storage and bedroom pieces.",
    "Accent objects with a quiet edge.",
  ];

  return notes[index] ?? "A curated edit with room to breathe.";
}

function buildHeroTiles(products: ProductNode[]): HomeTile[] {
  const productPool = uniqueProducts(products).filter(hasImage);
  const labels = ["Lounge", "Dining", "Bedroom", "Accent"];

  return labels.map((label, index) => ({
    product: productPool[index] ?? productPool[0] ?? null,
    title: productPool[index]?.name ?? "Curated detail",
    label,
  }));
}

export async function HomeDemoPage() {
  const [settings, featuredProducts, categories, newArrivals] =
    await Promise.all([
      getThemeSettings(),
      getFeaturedProducts(6),
      getProductCategories(),
      getProductsForGrid({ limit: 8, source: "all" }),
    ]);

  const heroTitle = asString(
    settings.home_hero_title,
    "Warm interiors, softly curated.",
  );
  const heroSubtitle = asString(
    settings.home_hero_subtitle,
    "A polished React homepage example for a modern furniture and interior shop. Built from real WooCommerce products, but shaped to feel calm, premium, and editorial.",
  );
  const heroTiles = buildHeroTiles([...featuredProducts, ...newArrivals]);
  const categoryCards: HomeCategoryCard[] =
    categories.slice(0, 4).map((category, index) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      count: category.count,
      image: heroTiles[index]?.product?.image,
      note: categoryNote(index),
    })) ?? [];

  const perks: HomePerk[] = [
    {
      icon: Truck,
      title: "White-glove delivery feel",
      body: "Designed like a premium showroom experience, with room for service notes and delivery guidance.",
    },
    {
      icon: ShieldCheck,
      title: "Built for the long view",
      body: "The layout stays light, measured, and easy to scan while the catalog remains connected to WooCommerce.",
    },
    {
      icon: Sparkles,
      title: "Material-led presentation",
      body: "Warm surfaces, editorial spacing, and product imagery that sits like part of an interior story.",
    },
    {
      icon: CalendarDays,
      title: "Demo-friendly and responsive",
      body: "Looks good on a laptop, feels balanced on mobile, and is simple to present as a coming-soon example.",
    },
  ];

  const inspirationProducts = uniqueProducts([...featuredProducts, ...newArrivals])
    .filter(hasImage)
    .slice(0, 3);
  const inspirationMain = inspirationProducts[0];
  const inspirationSideA = inspirationProducts[1];
  const inspirationSideB = inspirationProducts[2];

  return (
    <main className="home-demo-page">
      <div className="home-demo-inner">
        <section className="home-demo-hero">
          <div className="home-demo-hero-copy">
            <div className="home-demo-kicker">
              <span>Furniture demo</span>
              <span>Coming soon</span>
            </div>

            <div className="home-demo-copy-stack">
              <p className="home-demo-eyebrow">Premium React storefront</p>
              <h1 className="home-demo-title">{heroTitle}</h1>
              <p className="home-demo-subtitle">{heroSubtitle}</p>
            </div>

            <div className="home-demo-actions">
              <Button asChild size="lg">
                <Link href="/shop">Browse the collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/categories">Explore categories</Link>
              </Button>
            </div>

            <div className="home-demo-stats" aria-label="Demo highlights">
              <span>{newArrivals.length} catalog picks</span>
              <span>{categoryCards.length} featured categories</span>
              <span>Responsive by default</span>
              <span>Built on WooCommerce data</span>
            </div>
          </div>

          <div className="home-demo-hero-visual" aria-hidden="true">
            <div className="home-demo-hero-main">
              {heroTiles[0]?.product?.image?.sourceUrl ? (
                <Image
                  src={heroTiles[0].product.image.sourceUrl}
                  alt={heroTiles[0].product.image.altText || heroTiles[0].title}
                  fill
                  priority
                  className="home-demo-cover-image"
                />
              ) : (
                <div className="home-demo-placeholder" />
              )}

              <div className="home-demo-image-caption">
                <span>{heroTiles[0]?.label ?? "Lounge"}</span>
                <strong>{heroTiles[0]?.title ?? "Curated detail"}</strong>
              </div>
            </div>

            <div className="home-demo-hero-grid">
              {heroTiles.slice(1, 3).map((tile) => (
                <article key={tile.label} className="home-demo-hero-tile">
                  {tile.product?.image?.sourceUrl ? (
                    <Image
                      src={tile.product.image.sourceUrl}
                      alt={tile.product.image.altText || tile.title}
                      fill
                      className="home-demo-cover-image"
                    />
                  ) : (
                    <div className="home-demo-placeholder" />
                  )}
                  <div className="home-demo-image-caption home-demo-image-caption--small">
                    <span>{tile.label}</span>
                    <strong>{tile.title}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-demo-section">
          <div className="home-demo-section-head">
            <div>
              <p className="home-demo-eyebrow">Featured categories</p>
              <h2 className="home-demo-section-title">
                A calm way to move through the catalog.
              </h2>
            </div>
            <p className="home-demo-section-subtitle">
              Four clear starting points for browsing by room, mood, and the
              kind of pieces people actually buy together.
            </p>
          </div>

          <div className="home-demo-category-grid">
            {categoryCards.length > 0 ? (
              categoryCards.map((category) => (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="home-demo-category-card"
                >
                  {category.image?.sourceUrl ? (
                    <Image
                      src={category.image.sourceUrl}
                      alt={category.image.altText || category.name}
                      fill
                      className="home-demo-cover-image"
                    />
                  ) : (
                    <div className="home-demo-placeholder" />
                  )}
                  <div className="home-demo-category-overlay" />
                  <div className="home-demo-category-copy">
                    <span className="home-demo-category-note">
                      {category.note}
                    </span>
                    <strong>{category.name}</strong>
                    <div className="home-demo-category-meta">
                      <Badge variant="outline" className="home-demo-count-badge">
                        {formatCount(category.count)}
                      </Badge>
                      <span>Open category</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="home-demo-empty-state">
                The catalog categories will appear here once WooCommerce has
                product taxonomy data available.
              </div>
            )}
          </div>
        </section>

        <section className="home-demo-section">
          <div className="home-demo-section-head">
            <div>
              <p className="home-demo-eyebrow">New arrivals</p>
              <h2 className="home-demo-section-title">
                The products that make the front page feel alive.
              </h2>
            </div>
            <p className="home-demo-section-subtitle">
              Real WooCommerce products presented in a clean grid, ready for a
              public demo or a coming-soon launch page.
            </p>
          </div>

          <div className="product-grid home-demo-product-grid">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="home-demo-section home-demo-section--soft">
          <div className="home-demo-section-head">
            <div>
              <p className="home-demo-eyebrow">Why it feels premium</p>
              <h2 className="home-demo-section-title">
                Small details that keep the page from feeling generic.
              </h2>
            </div>
          </div>

          <div className="home-demo-benefit-grid">
            {perks.map((perk) => {
              const Icon = perk.icon;

              return (
                <article key={perk.title} className="home-demo-benefit-card">
                  <div className="home-demo-benefit-icon">
                    <Icon size={18} />
                  </div>
                  <h3>{perk.title}</h3>
                  <p>{perk.body}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="home-demo-inspiration">
          <div className="home-demo-inspiration-copy">
            <p className="home-demo-eyebrow">Interior inspiration</p>
            <h2 className="home-demo-section-title home-demo-section-title--light">
              Build the mood before you build the room.
            </h2>
            <p className="home-demo-inspiration-text">
              This demo front page is shaped like an editorial shop: generous
              spacing, tactile materials, and a layout that lets the products
              and collection story do the talking.
            </p>

            <div className="home-demo-material-list">
              <div>
                <Check size={16} />
                <span>Oak, linen, stone, and other natural finishes.</span>
              </div>
              <div>
                <Check size={16} />
                <span>Warm palette with a quiet charcoal anchor.</span>
              </div>
              <div>
                <Check size={16} />
                <span>Flexible enough to present as a coming-soon example.</span>
              </div>
            </div>

            <div className="home-demo-actions">
              <Button asChild size="lg" variant="secondary">
                <Link href="/shop">See the shop</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Open the builder</Link>
              </Button>
            </div>
          </div>

          <div className="home-demo-inspiration-visual">
            <div className="home-demo-inspiration-main">
              {inspirationMain?.image?.sourceUrl ? (
                <Image
                  src={inspirationMain.image.sourceUrl}
                  alt={inspirationMain.image.altText || inspirationMain.name}
                  fill
                  className="home-demo-cover-image"
                />
              ) : (
                <div className="home-demo-placeholder" />
              )}

              <div className="home-demo-inspiration-chip">
                <span>Styled for the front page</span>
                <strong>{inspirationMain?.name ?? "Featured piece"}</strong>
              </div>
            </div>

            <div className="home-demo-inspiration-stack">
              {[inspirationSideA, inspirationSideB].map((product, index) => (
                <article key={product?.id ?? index} className="home-demo-note-card">
                  <div className="home-demo-note-card-image">
                    {product?.image?.sourceUrl ? (
                      <Image
                        src={product.image.sourceUrl}
                        alt={product.image.altText || product.name}
                        fill
                        className="home-demo-cover-image"
                      />
                    ) : (
                      <div className="home-demo-placeholder" />
                    )}
                  </div>
                  <div>
                    <span>
                      {index === 0 ? "Material detail" : "Collection detail"}
                    </span>
                    <strong>{product?.name ?? "Editorial edit"}</strong>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="home-demo-cta">
          <div>
            <p className="home-demo-eyebrow home-demo-eyebrow--light">
              Final call to action
            </p>
            <h2>Ready to browse the catalog?</h2>
            <p>
              The homepage is tuned for a public demo: elegant, warm, and easy
              to hand to someone who just wants to see the product experience.
            </p>
          </div>

          <div className="home-demo-actions home-demo-cta-actions">
            <Button asChild size="lg">
              <Link href="/shop">Enter the shop</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/categories">Browse categories</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}

export function HomeDemoSkeleton() {
  return (
    <main className="home-demo-page">
      <div className="home-demo-inner">
        <section className="home-demo-hero">
          <div className="home-demo-hero-copy">
            <div className="home-demo-kicker">
              <span className="home-demo-pulse" />
              <span className="home-demo-pulse" />
            </div>
            <div className="home-demo-copy-stack">
              <div className="home-demo-pulse home-demo-pulse-title" />
              <div className="home-demo-pulse home-demo-pulse-subtitle" />
              <div className="home-demo-pulse home-demo-pulse-subtitle" />
            </div>
            <div className="home-demo-actions">
              <div className="home-demo-pulse home-demo-pulse-button" />
              <div className="home-demo-pulse home-demo-pulse-button" />
            </div>
          </div>
          <div className="home-demo-hero-visual">
            <div className="home-demo-pulse home-demo-pulse-visual" />
            <div className="home-demo-hero-grid">
              <div className="home-demo-pulse home-demo-pulse-tile" />
              <div className="home-demo-pulse home-demo-pulse-tile" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
