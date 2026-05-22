import { Suspense } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  CalendarDays,
  Check,
  Heart,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CarouselBlock, {
  type CarouselSlide,
} from "@/components/blocks/CarouselBlock";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import CategoryBar from "@/components/CategoryBar";
import EmbedSectionClient from "@/components/builder/EmbedSectionClient";
import FluentFormClient from "@/components/builder/FluentFormClient";
import ProductGallery from "@/components/ProductGallery";
import ProductOptionsSelector from "@/components/ProductOptionsSelector";
import RecentlyViewedStrip from "@/components/RecentlyViewedStrip";
import WishlistToggle from "@/components/WishlistToggle";
import { getCategoryTree } from "@/lib/categories";
import { getProductCategories, type ProductCategory } from "@/lib/navigation";
import { getProductsForGrid, type ProductNode } from "@/lib/products";
import type {
  BuilderLayout,
  BuilderLayoutBlock,
  BuilderLayoutKey,
  BuilderPage,
  BuilderSection,
} from "@/lib/builderLayouts";

type StorefrontBuilderRendererProps = {
  layout: BuilderLayout;
  page: BuilderLayoutKey;
  pageLabel?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  products?: ProductNode[];
  product?: StorefrontBuilderProduct;
  pageContent?: ReactNode;
};

type StorefrontBuilderProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceNumber: number | null;
  priceFormatted?: string | null;
  imageUrl?: string | null;
  images: {
    sourceUrl: string;
    altText?: string | null;
  }[];
  attributes: {
    name: string;
    label: string;
    options: string[];
  }[];
};

type BuilderStyle = CSSProperties & Record<`--${string}`, string | undefined>;

const pageLabels: Partial<Record<BuilderPage, string>> = {
  home: "Home",
  shop: "Shop",
  client: "Client Page",
};

const templateLabels: Partial<Record<BuilderLayoutKey, string>> = {
  "product-single": "Product",
  "product-category": "Category",
  "product-category-specific": "Category",
  "search-results": "Search Results",
};

const builderLightScheme = {
  pageBackground: "#f7f7f4",
  textColor: "#111111",
  mutedTextColor: "#5f5f58",
  surfaceColor: "#efefe9",
  buttonBackground: "#111111",
  buttonTextColor: "#ffffff",
};

const builderDarkScheme = {
  pageBackground: "#101010",
  textColor: "#f7f7f1",
  mutedTextColor: "#c8c8be",
  surfaceColor: "#24241f",
  buttonBackground: "#f7f7f1",
  buttonTextColor: "#101010",
};

function readableSchemeForColor(color: string | undefined) {
  const match = color
    ?.trim()
    .match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return "light";

  const [, r, g, b] = match;
  const luminance =
    (0.2126 * parseInt(r, 16) +
      0.7152 * parseInt(g, 16) +
      0.0722 * parseInt(b, 16)) /
    255;
  return luminance < 0.48 ? "dark" : "light";
}

function resolveSectionColorScheme(section: BuilderSection) {
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return section.colorScheme;
  }

  return readableSchemeForColor(section.background);
}

function resolveDesignColors(layout: BuilderLayout) {
  const design = layout.design ?? {};
  if (design.colorScheme === "dark") {
    return { ...design, ...builderDarkScheme };
  }
  if (design.colorScheme === "light") {
    return { ...design, ...builderLightScheme };
  }
  return design;
}

function designStyle(layout: BuilderLayout): BuilderStyle {
  const design = layout.design;
  const colors = resolveDesignColors(layout);
  return {
    background: colors.pageBackground,
    color: colors.textColor,
    "--builder-text": colors.textColor,
    "--builder-muted": colors.mutedTextColor,
    "--builder-accent": colors.accentColor,
    "--builder-surface": colors.surfaceColor,
    "--builder-button-bg": colors.buttonBackground,
    "--builder-button-text": colors.buttonTextColor,
    "--builder-radius": design?.radius,
    "--builder-max-width": design?.sectionMaxWidth,
    "--builder-gutter": design?.sectionGutter,
    "--builder-heading-font-family": design?.headingFontFamily,
    "--builder-heading-size": design?.headingSize,
    "--builder-heading-weight": design?.headingWeight,
    "--builder-heading-line-height": design?.headingLineHeight,
    "--builder-heading-color": design?.headingColor,
  } as BuilderStyle;
}

function designClassName(layout: BuilderLayout) {
  const scheme = layout.design?.colorScheme ?? "auto";
  return `shop-builder-main shop-builder-main--scheme-${scheme}`;
}

async function BuilderProductsSection({
  section,
  products: productsOverride,
}: {
  section: BuilderSection;
  products?: ProductNode[];
}) {
  const pageSize =
    typeof section.gridLimit === "number" && section.gridLimit >= 4
      ? Math.min(Math.round(section.gridLimit), 48)
      : 24;
  const fetchLimit = Math.max(pageSize, 48);
  const source =
    section.source === "featured" || section.source === "category"
      ? section.source
      : "all";
  const products =
    productsOverride ??
    (await getProductsForGrid({
      limit: fetchLimit,
      source,
      categoryId: section.categoryId,
    }));
  return (
    <CategoryWithFilters
      products={products}
      columns={section.columns}
      filterPosition={section.filterPosition}
      cardStyle={section.cardStyle}
      cardPreset={section.cardPreset}
      pageSize={section.gridLimit}
      gridGap={section.gridGap}
      cardPadding={section.cardPadding}
      imagePadding={section.imagePadding}
      addToCartStyle={section.addToCartStyle}
      addToCartSize={section.addToCartSize}
      addToCartPosition={section.addToCartPosition}
      addToCartVisibility={section.addToCartVisibility}
      addToCartDisplay={section.addToCartDisplay}
    />
  );
}

function getSpacingValue(value: string | undefined) {
  switch (value) {
    case "inherit":
      return undefined;
    case "none":
      return "0px";
    case "small":
      return "clamp(18px, 3vw, 36px)";
    case "large":
      return "clamp(52px, 7vw, 96px)";
    case "medium":
      return "clamp(28px, 5vw, 72px)";
    default:
      return undefined;
  }
}

function sectionStyle(section: BuilderSection): BuilderStyle {
  const colorScheme = resolveSectionColorScheme(section);
  const schemeVars =
    colorScheme === "dark"
      ? ({
          "--builder-section-text": builderDarkScheme.textColor,
          "--builder-section-muted": builderDarkScheme.mutedTextColor,
          "--builder-section-surface": builderDarkScheme.surfaceColor,
          "--builder-section-button-bg": builderDarkScheme.buttonBackground,
          "--builder-section-button-text": builderDarkScheme.buttonTextColor,
        } satisfies BuilderStyle)
      : colorScheme === "light"
        ? ({
            "--builder-section-text": builderLightScheme.textColor,
            "--builder-section-muted": builderLightScheme.mutedTextColor,
            "--builder-section-surface": builderLightScheme.surfaceColor,
            "--builder-section-button-bg": builderLightScheme.buttonBackground,
            "--builder-section-button-text": builderLightScheme.buttonTextColor,
          } satisfies BuilderStyle)
        : ({} satisfies BuilderStyle);

  return {
    background: section.background,
    "--builder-section-padding-top": getSpacingValue(section.topSpacing),
    "--builder-section-padding-bottom": getSpacingValue(section.bottomSpacing),
    "--builder-section-margin-top": getSpacingValue(section.topMargin),
    "--builder-section-margin-bottom": getSpacingValue(section.bottomMargin),
    ...schemeVars,
  } as BuilderStyle;
}

function sectionClassName(section: BuilderSection, extra = "") {
  const mode = section.backgroundMode === "boxed" ? "boxed" : "full";
  const contentMode =
    section.contentMode === "full" || section.contentMode === "narrow"
      ? section.contentMode
      : "boxed";
  const scheme = resolveSectionColorScheme(section);
  return `shop-builder-section shop-builder-section--${mode} shop-builder-section--content-${contentMode} shop-builder-section--scheme-${scheme} ${extra}`.trim();
}

function SectionFrame({
  section,
  extra,
  children,
}: {
  section: BuilderSection;
  extra?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={sectionClassName(section, extra)}
      style={sectionStyle(section)}
    >
      <div className="shop-builder-section-content">{children}</div>
    </section>
  );
}

function ProductsSkeleton() {
  return (
    <div className="mt-4">
      <div className="product-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="product-card">
            <div className="product-image animate-pulse rounded-lg bg-slate-800/40" />
            <div className="mt-2 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/60" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection({
  section,
  product,
}: {
  section: BuilderSection;
  product?: StorefrontBuilderProduct;
}) {
  const isProductTemplate = Boolean(
    product && section.id.includes("template-product"),
  );

  return (
    <SectionFrame section={section} extra="shop-builder-hero">
      <div>
        {section.eyebrow && (
          <p className="shop-builder-eyebrow">{section.eyebrow}</p>
        )}
        <h1 className="shop-builder-title">
          {isProductTemplate ? product?.name : section.title}
        </h1>
        {(isProductTemplate ? product?.priceFormatted : section.body) && (
          <p className="shop-builder-body">
            {isProductTemplate ? product?.priceFormatted : section.body}
          </p>
        )}
        {section.buttonLabel && section.buttonUrl && (
          <a
            className="shop-builder-cta"
            href={section.buttonUrl}
            target={section.buttonTarget === "_blank" ? "_blank" : undefined}
            rel={section.buttonTarget === "_blank" ? "noreferrer" : undefined}
          >
            {section.buttonLabel}
          </a>
        )}
      </div>
      {isProductTemplate && product?.imageUrl ? (
        <div
          className="shop-builder-hero-media shop-builder-hero-media--image"
          role="img"
          aria-label={product.name}
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
      ) : (
        <div className="shop-builder-hero-media" aria-hidden="true" />
      )}
    </SectionFrame>
  );
}

function PromoSection({ section }: { section: BuilderSection }) {
  return (
    <SectionFrame
      section={section}
      extra={`shop-builder-promo shop-builder-promo--${
        section.promoVariant ?? "default"
      }`}
    >
      <div>
        <h2 className="shop-builder-title">{section.title}</h2>
        {section.body && <p className="shop-builder-body">{section.body}</p>}
      </div>
      {section.ctaLabel && section.ctaUrl && (
        <a
          className="shop-builder-cta shop-builder-cta--light"
          href={section.ctaUrl}
        >
          {section.ctaLabel}
        </a>
      )}
    </SectionFrame>
  );
}

async function FilterPillsSection({ section }: { section: BuilderSection }) {
  return (
    <SectionFrame section={section} extra="shop-builder-filters">
      {section.title && <h2 className="shop-builder-title">{section.title}</h2>}
      <CategoryFiltersBlock />
    </SectionFrame>
  );
}

function BadgeGridSection({ section }: { section: BuilderSection }) {
  const badges = section.badges?.length
    ? section.badges
    : [
        {
          id: "one",
          label: "01",
          title: "Fast setup",
          body: "Reusable client-ready settings.",
        },
        {
          id: "two",
          label: "02",
          title: "Clean layouts",
          body: "Flat sections with simple controls.",
        },
        {
          id: "three",
          label: "03",
          title: "Woo data",
          body: "Products stay powered by WordPress.",
        },
      ];

  return (
    <SectionFrame section={section} extra="shop-builder-badge-grid">
      <div>
        {section.eyebrow && (
          <p className="shop-builder-eyebrow">{section.eyebrow}</p>
        )}
        <h2 className="shop-builder-title">{section.title}</h2>
        {section.body && <p className="shop-builder-body">{section.body}</p>}
      </div>
      <div
        className="shop-builder-badges"
        style={
          { "--builder-badge-columns": section.columns ?? 3 } as CSSProperties
        }
      >
        {badges.map((badge, index) => (
          <article key={badge.id ?? index} className="shop-builder-badge-card">
            {badge.label && <span>{badge.label}</span>}
            {badge.title && <h3>{badge.title}</h3>}
            {badge.body && <p>{badge.body}</p>}
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

function getContentLayoutBlocks(
  item: NonNullable<BuilderSection["layoutItems"]>[number],
): BuilderLayoutBlock[] {
  if (item.blocks?.length) return item.blocks;
  if (
    item.title ||
    item.body ||
    item.eyebrow ||
    item.buttonLabel ||
    item.buttonUrl
  ) {
    return [
      {
        id: `${item.id ?? "legacy"}-text`,
        kind: "text",
        eyebrow: item.eyebrow,
        title: item.title,
        body: item.body,
        buttonLabel: item.buttonLabel,
        buttonUrl: item.buttonUrl,
      },
    ];
  }
  return [];
}

async function CategoryFiltersBlock() {
  const [flatCategories, categoryTree] = await Promise.all([
    getProductCategories(),
    getCategoryTree().catch(() => []),
  ]);

  const countsBySlug: Record<string, number> = {};
  flatCategories.forEach((cat: ProductCategory) => {
    countsBySlug[cat.slug] = cat.count;
  });

  return categoryTree.length > 0 ? (
    <CategoryBar categoryTree={categoryTree} countsBySlug={countsBySlug} />
  ) : (
    <div className="shop-builder-filter-pills">
      <span>Women</span>
      <span>Men</span>
      <span>Boots</span>
      <span>Accessories</span>
    </div>
  );
}

async function ContentProductsBlock({ block }: { block: BuilderLayoutBlock }) {
  const limit =
    typeof block.gridLimit === "number" && block.gridLimit >= 2
      ? Math.min(Math.round(block.gridLimit), 12)
      : 4;
  const products = await getProductsForGrid({
    limit,
    source:
      block.source === "featured" || block.source === "category"
        ? block.source
        : "all",
    categoryId: block.categoryId,
  });

  return (
    <div className={`shop-builder-grid--margin-${block.gridMargin ?? "none"}`}>
      <CategoryWithFilters
        products={products}
        columns={block.columns}
        filterPosition={block.filterPosition ?? "hidden"}
        cardStyle={block.cardStyle}
        cardPreset={block.cardPreset}
        pageSize={limit}
        gridGap={block.gridGap}
        cardPadding={block.cardPadding}
        imagePadding={block.imagePadding}
        imageFrame={block.gridImageFrame}
        addToCartStyle={block.addToCartStyle}
        addToCartSize={block.addToCartSize}
        addToCartPosition={block.addToCartPosition}
        addToCartVisibility={block.addToCartVisibility}
        addToCartDisplay={block.addToCartDisplay}
      />
    </div>
  );
}

function GridCards({
  block,
  items,
}: {
  block: BuilderLayoutBlock;
  items: Array<{
    id: string;
    imageUrl?: string;
    imageAlt?: string;
    eyebrow?: string;
    title?: string;
    meta?: string;
    text?: string;
    buttonLabel?: string;
    buttonUrl?: string;
  }>;
}) {
  const limit = Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1));
  return (
    <div
      className={`shop-builder-grid shop-builder-grid--gap-${block.gridGap ?? "medium"} shop-builder-grid--margin-${block.gridMargin ?? "none"}`}
      style={
        { "--shop-builder-grid-columns": block.columns ?? 3 } as CSSProperties
      }
    >
      {items.slice(0, limit).map((item) => (
        <article
          key={item.id}
          className={`shop-builder-grid-card is-image-${block.gridImagePadding ?? "frameless"} is-content-${block.gridContentPadding ?? "medium"} is-frame-${block.gridImageFrame ?? "none"}`}
        >
          {block.gridShowImage !== false && item.imageUrl && (
            <div className="shop-builder-grid-image">
              <img
                src={item.imageUrl}
                alt={item.imageAlt || item.title || ""}
              />
            </div>
          )}
          <div className="shop-builder-grid-content">
            {block.gridShowEyebrow !== false && item.eyebrow && (
              <span>{item.eyebrow}</span>
            )}
            {item.title && <h3>{item.title}</h3>}
            {block.gridShowMeta !== false && item.meta && (
              <small>{item.meta}</small>
            )}
            {block.gridShowText !== false && item.text && <p>{item.text}</p>}
            {block.gridShowButton !== false &&
              item.buttonLabel &&
              item.buttonUrl && (
                <a className="shop-builder-cta" href={item.buttonUrl}>
                  {item.buttonLabel}
                </a>
              )}
          </div>
        </article>
      ))}
    </div>
  );
}

async function ContentGridBlock({ block }: { block: BuilderLayoutBlock }) {
  if (block.gridSource === "products") {
    const limit = Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1));
    const products = await getProductsForGrid({
      limit,
      source: "all",
    });
    return (
      <GridCards
        block={block}
        items={products.map((product) => ({
          id: product.id,
          imageUrl: product.image?.sourceUrl,
          imageAlt: product.image?.altText ?? product.name,
          eyebrow: "Product",
          title: product.name,
          meta: product.price ?? undefined,
          text: product.attributes?.nodes
            ?.map((attribute) => attribute.label ?? attribute.name)
            .join(", "),
          buttonLabel: "View product",
          buttonUrl: `/product/${product.slug}`,
        }))}
      />
    );
  }

  return (
    <GridCards
      block={block}
      items={(block.gridItems ?? []).map((item, index) => ({
        id: item.id ?? `${block.id}-grid-${index}`,
        ...item,
      }))}
    />
  );
}

function ProductSummaryBlock({
  product,
}: {
  product: StorefrontBuilderProduct;
}) {
  return (
    <div className="shop-builder-product-summary">
      <div className="product-header-row">
        <h3>{product.name}</h3>
        <WishlistToggle
          id={product.id}
          slug={product.slug}
          name={product.name}
          imageUrl={product.imageUrl ?? undefined}
        />
      </div>

      {product.priceFormatted && (
        <div className="shop-builder-product-price">
          {product.priceFormatted}
        </div>
      )}

      <ProductOptionsSelector
        id={product.id}
        slug={product.slug}
        name={product.name}
        priceNumber={product.priceNumber}
        imageUrl={product.imageUrl}
        attributes={product.attributes}
      />

      {product.attributes.length > 0 && (
        <div className="shop-builder-product-attributes">
          <strong>Product Details</strong>
          <ul>
            {product.attributes.map((attr) => (
              <li key={attr.name}>
                <span>{attr.label}</span>
                <em>{attr.options.join(", ")}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.description && (
        <div
          className="shop-builder-product-description"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}
    </div>
  );
}

function ProductDynamicBlock({
  kind,
  product,
  block,
}: {
  kind: string | undefined;
  product: StorefrontBuilderProduct;
  block?: BuilderLayoutBlock;
}) {
  if (kind === "productHero") {
    return (
      <div className="shop-builder-premium-product-hero">
        <div className="shop-builder-premium-product-media">
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className="shop-builder-premium-product-copy">
          <span>Featured Product</span>
          <div className="product-header-row">
            <h3>{product.name}</h3>
            <WishlistToggle
              id={product.id}
              slug={product.slug}
              name={product.name}
              imageUrl={product.imageUrl ?? undefined}
            />
          </div>
          {product.priceFormatted && (
            <div className="shop-builder-product-price">
              {product.priceFormatted}
            </div>
          )}
          {product.description && (
            <div
              className="shop-builder-product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <ProductOptionsSelector
            id={product.id}
            slug={product.slug}
            name={product.name}
            priceNumber={product.priceNumber}
            imageUrl={product.imageUrl}
            attributes={product.attributes}
          />
        </div>
      </div>
    );
  }

  if (kind === "productInfoStack") {
    return (
      <div className="shop-builder-product-info-stack">
        <div className="product-header-row">
          <h3>{product.name}</h3>
          <WishlistToggle
            id={product.id}
            slug={product.slug}
            name={product.name}
            imageUrl={product.imageUrl ?? undefined}
          />
        </div>
        {product.priceFormatted && (
          <div className="shop-builder-product-price">
            {product.priceFormatted}
          </div>
        )}
        {product.description && (
          <div
            className="shop-builder-product-description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
        <ProductOptionsSelector
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceNumber={product.priceNumber}
          imageUrl={product.imageUrl}
          attributes={product.attributes}
        />
      </div>
    );
  }

  if (kind === "productPurchasePanel") {
    return (
      <div className="shop-builder-product-purchase-panel">
        <span>Ready to order</span>
        <h3>{product.name}</h3>
        {product.priceFormatted && (
          <div className="shop-builder-product-price">
            {product.priceFormatted}
          </div>
        )}
        <ProductOptionsSelector
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceNumber={product.priceNumber}
          imageUrl={product.imageUrl}
          attributes={product.attributes}
        />
      </div>
    );
  }

  if (kind === "productSpecsPanel") {
    return product.attributes.length > 0 ? (
      <div className="shop-builder-product-specs-panel">
        <span>Specifications</span>
        <div className="shop-builder-product-attributes">
          <ul>
            {product.attributes.map((attr) => (
              <li key={attr.name}>
                <span>{attr.label}</span>
                <em>{attr.options.join(", ")}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null;
  }

  if (kind === "productGallery") {
    return (
      <ProductGallery
        images={product.images}
        name={product.name}
        showThumbnails={block?.galleryShowThumbnails !== false}
        thumbnailPosition={
          block?.galleryThumbnailPosition === "left" ? "left" : "bottom"
        }
        imageFit={block?.galleryImageFit === "cover" ? "cover" : "contain"}
        height={block?.galleryHeight}
      />
    );
  }

  if (kind === "productTitle") {
    return (
      <div className="product-header-row">
        <h3>{product.name}</h3>
        <WishlistToggle
          id={product.id}
          slug={product.slug}
          name={product.name}
          imageUrl={product.imageUrl ?? undefined}
        />
      </div>
    );
  }

  if (kind === "productPrice") {
    return product.priceFormatted ? (
      <div className="shop-builder-product-price">{product.priceFormatted}</div>
    ) : null;
  }

  if (kind === "productAddToCart") {
    return (
      <ProductOptionsSelector
        id={product.id}
        slug={product.slug}
        name={product.name}
        priceNumber={product.priceNumber}
        imageUrl={product.imageUrl}
        attributes={product.attributes}
      />
    );
  }

  if (kind === "productAttributes") {
    return product.attributes.length > 0 ? (
      <div className="shop-builder-product-attributes">
        <strong>Product Details</strong>
        <ul>
          {product.attributes.map((attr) => (
            <li key={attr.name}>
              <span>{attr.label}</span>
              <em>{attr.options.join(", ")}</em>
            </li>
          ))}
        </ul>
      </div>
    ) : null;
  }

  if (kind === "productDescription") {
    return product.description ? (
      <div
        className="shop-builder-product-description"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    ) : null;
  }

  return null;
}

function GoodieIcon({ iconName }: { iconName: string | undefined }) {
  if (iconName === "heart") return <Heart size={24} />;
  if (iconName === "truck") return <Truck size={24} />;
  if (iconName === "shield") return <ShieldCheck size={24} />;
  return <Sparkles size={24} />;
}

function ContentLayoutBlock({
  block,
  product,
  breadcrumbItems,
  page,
  pageContent,
}: {
  block: BuilderLayoutBlock;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
}) {
  if (block.kind === "breadcrumbs") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--breadcrumbs">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
    );
  }

  if (block.kind === "categoryFilters") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--category-filters">
        <Suspense
          fallback={
            <div className="shop-builder-column-empty">
              Loading categories...
            </div>
          }
        >
          <CategoryFiltersBlock />
        </Suspense>
      </div>
    );
  }

  if (product && block.id?.includes("product-media")) {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--product-media">
        <ProductDynamicBlock
          kind="productGallery"
          product={product}
          block={block}
        />
      </div>
    );
  }

  if (product && block.id?.includes("product-summary")) {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--product-summary">
        <ProductSummaryBlock product={product} />
      </div>
    );
  }

  if (
    product &&
    block.kind !== "products" &&
    block.kind?.startsWith("product")
  ) {
    return (
      <div
        className={`shop-builder-column-block shop-builder-column-block--${block.kind}`}
      >
        <ProductDynamicBlock
          kind={block.kind}
          product={product}
          block={block}
        />
      </div>
    );
  }

  if (block.kind === "slider") {
    const slides: CarouselSlide[] =
      block.slides?.map((slide, index) => ({
        id: slide.id ?? `${block.id}-slide-${index}`,
        title: slide.title,
        subtitle: slide.subtitle,
        text: slide.text,
        badge: slide.badge,
        imageUrl: slide.imageUrl,
        imageAlt: slide.imageAlt,
        imagePadding: slide.imagePadding,
        buttonLabel: slide.buttonLabel,
        buttonUrl: slide.buttonUrl,
      })) ?? [];

    return (
      <div className="shop-builder-column-block shop-builder-column-block--slider">
        {block.title && <h3>{block.title}</h3>}
        {block.body && <p>{block.body}</p>}
        <CarouselBlock
          block={{
            __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
            fieldGroupName: "ReactBuilderColumnSlider",
          }}
          slides={slides}
          settings={block.carouselSettings}
        />
      </div>
    );
  }

  if (block.kind === "embed") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--embed">
        {block.title && <h3>{block.title}</h3>}
        {block.body && <p>{block.body}</p>}
        <EmbedSectionClient
          mode={block.embedMode}
          code={block.embedCode}
          url={block.embedUrl}
          height={block.embedHeight}
          title={block.title}
        />
      </div>
    );
  }

  if (block.kind === "fluentForm") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--fluent-form">
        <FluentFormClient formId={block.fluentFormId} title={block.title} />
      </div>
    );
  }

  if (block.kind === "badgeGrid") {
    const badges = block.badges?.length
      ? block.badges
      : [
          {
            id: "one",
            label: "01",
            title: "Fast setup",
            body: "Reusable settings.",
          },
          {
            id: "two",
            label: "02",
            title: "Clean blocks",
            body: "Flat nested sections.",
          },
        ];

    return (
      <div className="shop-builder-column-block shop-builder-column-block--badges">
        {block.title && <h3>{block.title}</h3>}
        {block.body && <p>{block.body}</p>}
        <div
          className="shop-builder-column-badges"
          style={
            {
              "--builder-column-badge-columns": block.columns ?? 2,
            } as CSSProperties
          }
        >
          {badges.map((badge, index) => (
            <article key={badge.id ?? index}>
              {badge.label && <span>{badge.label}</span>}
              {badge.title && <strong>{badge.title}</strong>}
              {badge.body && <p>{badge.body}</p>}
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.kind === "products") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--products">
        {block.title && <h3>{block.title}</h3>}
        <Suspense fallback={<ProductsSkeleton />}>
          <ContentProductsBlock block={block} />
        </Suspense>
      </div>
    );
  }

  if (block.kind === "grid") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--grid">
        <Suspense fallback={<ProductsSkeleton />}>
          <ContentGridBlock block={block} />
        </Suspense>
      </div>
    );
  }

  if (block.kind === "icon") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--icon">
        <GoodieIcon iconName={block.iconName} />
        {block.title && <h3>{block.title}</h3>}
        {block.body && <p>{block.body}</p>}
      </div>
    );
  }

  if (block.kind === "list") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--list">
        {block.title && <h3>{block.title}</h3>}
        <ul>
          {(block.items ?? []).map((item) => (
            <li key={item}>
              <Check size={16} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.kind === "datePicker") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--date-picker">
        <CalendarDays size={24} />
        {block.title && <h3>{block.title}</h3>}
        {block.body && <p>{block.body}</p>}
        <label>
          <span>{block.dateLabel ?? "Preferred date"}</span>
          <input type="date" />
        </label>
      </div>
    );
  }

  if (block.kind === "cartContent") {
    return page === "page:cart" ? (
      pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <h3>Cart content</h3>
          <p>The live cart UI will render here.</p>
        </div>
      )
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <h3>Cart content</h3>
        <p>Use this block on the Cart page.</p>
      </div>
    );
  }

  if (block.kind === "checkoutContent") {
    return page === "page:checkout" ? (
      pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <h3>Checkout content</h3>
          <p>The live checkout UI will render here.</p>
        </div>
      )
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <h3>Checkout content</h3>
        <p>Use this block on the Checkout page.</p>
      </div>
    );
  }

  if (block.kind === "accountContent") {
    return page === "page:my-account" ? (
      pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <h3>My account content</h3>
          <p>The live account UI will render here.</p>
        </div>
      )
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <h3>My account content</h3>
        <p>Use this block on the My Account page.</p>
      </div>
    );
  }

  if (block.kind === "hero") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--hero">
        {block.eyebrow && <span>{block.eyebrow}</span>}
        {block.title && <h3>{block.title}</h3>}
        {block.body && <p>{block.body}</p>}
        {block.buttonLabel && block.buttonUrl && (
          <a className="shop-builder-cta" href={block.buttonUrl}>
            {block.buttonLabel}
          </a>
        )}
      </div>
    );
  }

  if (block.kind === "promoStrip") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--promo-strip">
        <div>
          {block.eyebrow && <span>{block.eyebrow}</span>}
          {block.title && <h3>{block.title}</h3>}
          {block.body && <p>{block.body}</p>}
        </div>
        {block.buttonLabel && block.buttonUrl && (
          <a className="shop-builder-cta" href={block.buttonUrl}>
            {block.buttonLabel}
          </a>
        )}
      </div>
    );
  }

  if (block.kind === "panel") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--panel">
        {block.imageUrl && (
          <div
            className="shop-builder-panel-media"
            role="img"
            aria-label={block.imageAlt || block.title || "Panel image"}
            style={{ backgroundImage: `url(${block.imageUrl})` }}
          />
        )}
        <div>
          {block.eyebrow && <span>{block.eyebrow}</span>}
          {block.title && <h3>{block.title}</h3>}
          {block.body && <p>{block.body}</p>}
          {block.buttonLabel && block.buttonUrl && (
            <a className="shop-builder-cta" href={block.buttonUrl}>
              {block.buttonLabel}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="shop-builder-column-block shop-builder-column-block--text">
      {block.eyebrow && <span>{block.eyebrow}</span>}
      {block.title && <h3>{block.title}</h3>}
      {block.body && <p>{block.body}</p>}
      {block.buttonLabel && block.buttonUrl && (
        <a className="shop-builder-cta" href={block.buttonUrl}>
          {block.buttonLabel}
        </a>
      )}
    </div>
  );
}

function blockSurfaceStyle(
  block: BuilderLayoutBlock,
): CSSProperties | undefined {
  if (block.elementBackgroundMode === "transparent") {
    return { "--builder-element-bg": "transparent" } as CSSProperties;
  }
  if (block.elementBackgroundMode === "custom" && block.elementBackground) {
    return { "--builder-element-bg": block.elementBackground } as CSSProperties;
  }
  return undefined;
}

function blockShellClassName(block: BuilderLayoutBlock) {
  return `shop-builder-element-shell is-padding-${
    block.elementPadding ?? "none"
  } is-align-${block.elementAlign ?? "left"}`;
}

function ContentLayoutSection({
  section,
  product,
  breadcrumbItems,
  page,
  pageContent,
}: {
  section: BuilderSection;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
}) {
  const items = section.layoutItems?.length
    ? section.layoutItems
    : [
        {
          id: "one",
          eyebrow: "01",
          title: "Flexible layout",
          body: "Choose a full, two-column, or three-column section from the dashboard.",
        },
      ];

  return (
    <SectionFrame section={section} extra="shop-builder-content-layout">
      {(section.eyebrow || section.title || section.body) && (
        <div className="shop-builder-content-layout-heading">
          {section.eyebrow && (
            <p className="shop-builder-eyebrow">{section.eyebrow}</p>
          )}
          {section.title && (
            <h2 className="shop-builder-title">{section.title}</h2>
          )}
          {section.body && <p className="shop-builder-body">{section.body}</p>}
        </div>
      )}
      <div
        className="shop-builder-content-layout-grid"
        style={
          {
            "--builder-layout-columns": section.layoutColumns ?? 2,
          } as CSSProperties
        }
      >
        {items.map((item, index) => (
          <article
            key={item.id ?? index}
            className="shop-builder-content-layout-card"
          >
            {getContentLayoutBlocks(item).map((block, blockIndex) => (
              <div
                key={block.id ?? blockIndex}
                className={blockShellClassName(block)}
                style={blockSurfaceStyle(block)}
              >
                <ContentLayoutBlock
                  block={block}
                  product={product}
                  breadcrumbItems={breadcrumbItems}
                  page={page}
                  pageContent={pageContent}
                />
              </div>
            ))}
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

function SliderSection({ section }: { section: BuilderSection }) {
  const slides: CarouselSlide[] =
    section.slides?.map((slide, index) => ({
      id: slide.id ?? `${section.id}-slide-${index}`,
      title: slide.title,
      subtitle: slide.subtitle,
      text: slide.text,
      badge: slide.badge,
      imageUrl: slide.imageUrl,
      imageAlt: slide.imageAlt,
      imagePadding: slide.imagePadding,
      buttonLabel: slide.buttonLabel,
      buttonUrl: slide.buttonUrl,
    })) ?? [];

  return (
    <SectionFrame section={section} extra="shop-builder-slider">
      <div className="shop-builder-slider-heading">
        <h2 className="shop-builder-title">{section.title}</h2>
        {section.body && <p className="shop-builder-body">{section.body}</p>}
      </div>
      <CarouselBlock
        block={{
          __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
          fieldGroupName: "ReactBuilderSlider",
        }}
        slides={slides}
        settings={section.carouselSettings}
      />
    </SectionFrame>
  );
}

function EmbedSection({ section }: { section: BuilderSection }) {
  return (
    <SectionFrame section={section} extra="shop-builder-embed">
      <div className="shop-builder-embed-heading">
        {section.eyebrow && (
          <p className="shop-builder-eyebrow">{section.eyebrow}</p>
        )}
        <h2 className="shop-builder-title">{section.title}</h2>
        {section.body && <p className="shop-builder-body">{section.body}</p>}
      </div>
      <EmbedSectionClient
        mode={section.embedMode}
        code={section.embedCode}
        url={section.embedUrl}
        height={section.embedHeight}
        title={section.title}
      />
    </SectionFrame>
  );
}

function BuilderSectionRenderer({
  section,
  products,
  product,
  breadcrumbItems,
  page,
  pageContent,
}: {
  section: BuilderSection;
  products?: ProductNode[];
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
}) {
  if (!section.visible) return null;

  if (section.kind === "hero") {
    return <HeroSection section={section} product={product} />;
  }

  if (section.kind === "recentlyViewed") {
    return (
      <SectionFrame section={section}>
        <RecentlyViewedStrip />
      </SectionFrame>
    );
  }

  if (section.kind === "productArchive") {
    return (
      <SectionFrame section={section} extra="shop-builder-products">
        <Suspense fallback={<ProductsSkeleton />}>
          <BuilderProductsSection section={section} products={products} />
        </Suspense>
      </SectionFrame>
    );
  }

  if (section.kind === "filters") {
    return <FilterPillsSection section={section} />;
  }

  if (section.kind === "promo") {
    return <PromoSection section={section} />;
  }

  if (section.kind === "badgeGrid") {
    return <BadgeGridSection section={section} />;
  }

  if (section.kind === "contentLayout") {
    return (
      <ContentLayoutSection
        section={section}
        product={product}
        breadcrumbItems={breadcrumbItems}
        page={page}
        pageContent={pageContent}
      />
    );
  }

  if (section.kind === "slider") {
    return <SliderSection section={section} />;
  }

  if (section.kind === "embed") {
    return <EmbedSection section={section} />;
  }

  return null;
}

export default function StorefrontBuilderRenderer({
  layout,
  page,
  pageLabel,
  breadcrumbItems,
  products,
  product,
  pageContent,
}: StorefrontBuilderRendererProps) {
  const label =
    pageLabel ??
    pageLabels[page as BuilderPage] ??
    templateLabels[page] ??
    (page.startsWith("page:")
      ? page
          .replace(/^page:/, "")
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Page");
  const resolvedBreadcrumbItems =
    breadcrumbItems ??
    (page === "home"
      ? [{ label: "Home" }]
      : [{ label: "Home", href: "/" }, { label }]);

  return (
    <main className={designClassName(layout)} style={designStyle(layout)}>
      <div className="shop-builder-inner">
        {layout.sections.map((section) => (
          <BuilderSectionRenderer
            key={section.id}
            section={section}
            products={products}
            product={product}
            breadcrumbItems={resolvedBreadcrumbItems}
            page={page}
            pageContent={pageContent}
          />
        ))}
      </div>
    </main>
  );
}
