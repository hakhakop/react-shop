import type { CSSProperties } from "react";
import type {
  StorefrontLoadingChromeShape,
  StorefrontLoadingData,
  StorefrontLoadingSectionShape,
} from "@/lib/storefrontLoading";
import type { BuilderSection } from "@/components/dashboard/builderTypes";

type StorefrontLoadingSectionInput = StorefrontLoadingSectionShape | BuilderSection;

function LoadingBlock({ className = "" }: { className?: string }) {
  return <span className={`storefront-loading-skeleton__block ${className}`.trim()} />;
}

function clampCount(value: number | undefined, fallback: number, max = 12) {
  return Math.min(max, Math.max(1, Math.round(value ?? fallback)));
}

function blockKinds(section: StorefrontLoadingSectionShape) {
  return new Set([
    ...section.blockKinds,
    ...section.blocks.map((block) => block.kind),
  ]);
}

function blockItemCount(section: StorefrontLoadingSectionShape, kinds: string[]) {
  return Math.max(
    ...section.blocks
      .filter((block) => kinds.includes(block.kind))
      .map((block) => block.itemCount),
    0,
  );
}

function normalizeSection(section: StorefrontLoadingSectionInput): StorefrontLoadingSectionShape {
  if (
    "blocks" in section &&
    "itemCount" in section &&
    Array.isArray(section.blocks) &&
    Array.isArray(section.blockKinds)
  ) {
    return section;
  }

  const builderSection = section as BuilderSection;
  const blocks = builderSection.rows?.length
    ? builderSection.rows.flatMap((row) =>
        row.columns.flatMap((column) => column.elements ?? []),
      )
    : (builderSection.layoutItems ?? []).flatMap((item) => item.blocks ?? []);
  const blockShapes = blocks.map((block) => {
    const candidate = block as typeof block & {
      items?: unknown[];
      slides?: unknown[];
      galleryItems?: unknown[];
    };
    return {
      kind: block.kind ?? "text",
      itemCount: Math.max(
        candidate.items?.length ?? 0,
        candidate.slides?.length ?? 0,
        candidate.galleryItems?.length ?? 0,
        1,
      ),
    };
  });
  const itemCount = Math.max(
    builderSection.layoutItems?.length ?? 0,
    builderSection.rows?.reduce(
      (count, row) => Math.max(count, row.columns.length),
      0,
    ) ?? 0,
    1,
  );

  return {
    kind: builderSection.kind,
    sectionHeight: builderSection.sectionHeight ?? null,
    heroHeight: blocks.find((block) => block.heroHeight)?.heroHeight ?? null,
    layout: builderSection.layout ?? null,
    columns: Math.max(1, builderSection.layoutColumns ?? builderSection.columns ?? itemCount),
    itemCount,
    blockKinds: Array.from(new Set(blockShapes.map((block) => block.kind))),
    blocks: blockShapes,
  };
}

function ProductLoadingCard() {
  return (
    <article className="storefront-loading-skeleton__product-card">
      <LoadingBlock className="storefront-loading-skeleton__product-media" />
      <div className="storefront-loading-skeleton__product-copy">
        <LoadingBlock className="storefront-loading-skeleton__product-title" />
        <LoadingBlock className="storefront-loading-skeleton__product-price" />
      </div>
    </article>
  );
}

function ProductsLoadingSection({ count = 4 }: { count?: number }) {
  return (
    <section className="storefront-loading-skeleton__products">
      <div className="storefront-loading-skeleton__section-heading">
        <LoadingBlock className="storefront-loading-skeleton__section-title" />
        <LoadingBlock className="storefront-loading-skeleton__section-link" />
      </div>
      <div className="storefront-loading-skeleton__product-grid">
        {Array.from({ length: clampCount(count, 4) }, (_, index) => (
          <ProductLoadingCard key={index} />
        ))}
      </div>
    </section>
  );
}

function CategoryLoadingCard() {
  return (
    <article className="storefront-loading-skeleton__category-card">
      <LoadingBlock className="storefront-loading-skeleton__category-media" />
      <div className="storefront-loading-skeleton__category-copy">
        <LoadingBlock className="storefront-loading-skeleton__category-title" />
        <LoadingBlock className="storefront-loading-skeleton__category-link" />
      </div>
    </article>
  );
}

function CategoryLoadingGrid({
  count = 2,
  columns = 2,
}: {
  count?: number;
  columns?: number;
}) {
  const safeCount = clampCount(count, 2);
  const safeColumns = clampCount(columns, Math.min(2, safeCount), 6);
  return (
    <section
      className="storefront-loading-skeleton__category-grid"
      style={{ "--storefront-loading-columns": safeColumns } as CSSProperties}
    >
      {Array.from({ length: safeCount }, (_, index) => (
        <CategoryLoadingCard key={index} />
      ))}
    </section>
  );
}

function FeatureLoadingSection({ fullHeight = false }: { fullHeight?: boolean }) {
  return (
    <section
      className={`storefront-loading-skeleton__feature${fullHeight ? " is-full-height" : ""}`}
    >
      <LoadingBlock className="storefront-loading-skeleton__feature-media" />
      <div className="storefront-loading-skeleton__feature-copy">
        <LoadingBlock className="storefront-loading-skeleton__feature-kicker" />
        <LoadingBlock className="storefront-loading-skeleton__feature-title" />
        <div className="storefront-loading-skeleton__feature-actions">
          <LoadingBlock />
          <LoadingBlock />
        </div>
      </div>
    </section>
  );
}

function TextLoadingSection({ fullHeight = false }: { fullHeight?: boolean }) {
  return (
    <section
      className={`storefront-loading-skeleton__text-section${fullHeight ? " is-full-height" : ""}`}
    >
      <div className="storefront-loading-skeleton__text-copy">
        <LoadingBlock className="storefront-loading-skeleton__feature-kicker" />
        <LoadingBlock className="storefront-loading-skeleton__text-title" />
        <LoadingBlock className="storefront-loading-skeleton__text-line" />
        <LoadingBlock className="storefront-loading-skeleton__text-line is-short" />
        <LoadingBlock className="storefront-loading-skeleton__text-action" />
      </div>
    </section>
  );
}

function FilterLoadingSection() {
  return (
    <section className="storefront-loading-skeleton__filters">
      {Array.from({ length: 4 }, (_, index) => (
        <LoadingBlock key={index} className="storefront-loading-skeleton__filter" />
      ))}
    </section>
  );
}

function ProductDetailLoadingSection() {
  return (
    <section className="storefront-loading-skeleton__product-detail">
      <LoadingBlock className="storefront-loading-skeleton__product-detail-media" />
      <div className="storefront-loading-skeleton__product-detail-copy">
        <LoadingBlock className="storefront-loading-skeleton__feature-kicker" />
        <LoadingBlock className="storefront-loading-skeleton__product-detail-title" />
        <LoadingBlock className="storefront-loading-skeleton__product-detail-price" />
        <LoadingBlock className="storefront-loading-skeleton__product-detail-line" />
        <LoadingBlock className="storefront-loading-skeleton__product-detail-line is-short" />
        <LoadingBlock className="storefront-loading-skeleton__product-detail-action" />
      </div>
    </section>
  );
}

function LoadingSection({ section }: { section: StorefrontLoadingSectionShape }) {
  const kinds = blockKinds(section);
  const fullHeight =
    section.sectionHeight?.startsWith("viewport") || section.heroHeight === "viewport";
  const hasProductBlock =
    section.kind === "productArchive" ||
    ["products", "panelSlider"].some((kind) => kinds.has(kind));
  const hasProductDetailBlock = [
    "productGallery",
    "productInfoStack",
    "productTitle",
    "productPurchasePanel",
  ].some((kind) => kinds.has(kind));
  const hasMediaBlock = [
    "image",
    "gallery",
    "overlay",
    "overlaySlider",
    "slideshow",
    "slider",
  ].some((kind) => kinds.has(kind));
  const mediaItemCount = blockItemCount(section, [
    "gallery",
    "overlaySlider",
    "slideshow",
    "slider",
  ]);
  const hasMultipleItems =
    section.itemCount > 1 || section.columns > 1 || mediaItemCount > 1;

  if (hasProductDetailBlock) return <ProductDetailLoadingSection />;
  if (hasProductBlock) {
    return (
      <ProductsLoadingSection
        count={blockItemCount(section, ["products", "panelSlider", "productArchive"]) || 4}
      />
    );
  }
  if (section.kind === "filters") return <FilterLoadingSection />;
  if (section.kind === "badgeGrid") {
    return <CategoryLoadingGrid count={section.itemCount || 3} columns={section.columns} />;
  }
  if (fullHeight && !hasMultipleItems) {
    return <FeatureLoadingSection fullHeight />;
  }
  if (hasMultipleItems || section.kind === "slider") {
    return (
      <CategoryLoadingGrid
        count={Math.max(
          section.itemCount,
          mediaItemCount,
        )}
        columns={section.columns}
      />
    );
  }
  if (hasMediaBlock || section.kind === "promo" || section.kind === "scrollPinnedDemo") {
    return <FeatureLoadingSection fullHeight={fullHeight} />;
  }
  return <TextLoadingSection fullHeight={fullHeight} />;
}

const defaultChrome: StorefrontLoadingChromeShape = {
  headerVisible: true,
  headerHeight: null,
  navItemCount: 4,
  footerColumnCount: 3,
};

function LoadingHeader({ chrome }: { chrome: StorefrontLoadingChromeShape }) {
  const navItemCount = clampCount(chrome.navItemCount, 4, 10);
  if (!chrome.headerVisible) return null;

  return (
    <header className="storefront-loading-skeleton__header">
      <LoadingBlock className="storefront-loading-skeleton__logo" />
      <nav className="storefront-loading-skeleton__nav">
        {Array.from({ length: navItemCount }, (_, index) => (
          <LoadingBlock key={index} className="storefront-loading-skeleton__nav-item" />
        ))}
      </nav>
      <div className="storefront-loading-skeleton__actions">
        <LoadingBlock className="storefront-loading-skeleton__search" />
        <LoadingBlock className="storefront-loading-skeleton__cart" />
      </div>
    </header>
  );
}

function LoadingFooter({ chrome }: { chrome: StorefrontLoadingChromeShape }) {
  const columnCount = clampCount(chrome.footerColumnCount, 3, 6);
  return (
    <footer className="storefront-loading-skeleton__footer">
      <div
        className="storefront-loading-skeleton__footer-grid"
        style={{ "--storefront-loading-footer-columns": columnCount } as CSSProperties}
      >
        <div className="storefront-loading-skeleton__footer-brand">
          <LoadingBlock className="storefront-loading-skeleton__footer-logo" />
          <LoadingBlock className="storefront-loading-skeleton__footer-copy" />
          <LoadingBlock className="storefront-loading-skeleton__footer-copy is-short" />
        </div>
        {Array.from({ length: columnCount }, (_, index) => (
          <div className="storefront-loading-skeleton__footer-column" key={index}>
            <LoadingBlock className="storefront-loading-skeleton__footer-heading" />
            <LoadingBlock />
            <LoadingBlock />
            <LoadingBlock className="is-short" />
          </div>
        ))}
      </div>
      <div className="storefront-loading-skeleton__footer-bottom">
        <LoadingBlock />
        <LoadingBlock className="is-short" />
        <LoadingBlock />
      </div>
    </footer>
  );
}

export default function StorefrontLoadingSkeleton({
  data,
  sections,
  chrome,
}: {
  data?: StorefrontLoadingData | null;
  sections?: readonly StorefrontLoadingSectionInput[];
  chrome?: StorefrontLoadingChromeShape;
}) {
  const resolvedSections = (data?.sections ?? sections ?? [])
    .filter((section) => !("visible" in section) || section.visible !== false)
    .map(normalizeSection);
  const resolvedChrome = data?.chrome ?? chrome ?? defaultChrome;
  const headerHeight = resolvedChrome.headerHeight?.trim() ?? "";
  const loadingStyle = /^(?:\d+(?:\.\d+)?(?:px|rem|em|%|vw|vh|svh|dvh)|clamp\([^)]*\)|calc\([^)]*\))$/.test(headerHeight)
    ? ({ "--storefront-loading-header-height": headerHeight } as CSSProperties)
    : undefined;

  return (
    <div
      className={`storefront-loading-skeleton${resolvedChrome.headerVisible ? "" : " is-header-hidden"}`}
      style={loadingStyle}
    >
      <LoadingHeader chrome={resolvedChrome} />
      <div className="storefront-loading-skeleton__content">
        {resolvedSections.length > 0 ? (
          resolvedSections.map((section, index) => (
            <LoadingSection key={`${section.kind}-${index}`} section={section} />
          ))
        ) : (
          <TextLoadingSection fullHeight />
        )}
        <LoadingFooter chrome={resolvedChrome} />
      </div>
    </div>
  );
}
