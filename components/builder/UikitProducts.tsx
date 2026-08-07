"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";
import { productMatchesCategorySelection } from "@/lib/productCategoryFilter";
import { typographyRoleClass } from "@/lib/builderTypography";
import { getUikitButtonClass, getUikitCardClass, getUikitHeadingClass } from "@/lib/uikitTokens";
import type { CategoryTreeItem } from "@/lib/categories";

type Props = {
  block: any;
  isCanvas?: boolean;
  products?: any[];
  categoryTree?: CategoryTreeItem[];
};

const MOCK_PRODUCTS = [
  { id: "1", slug: "classic-leather-sneaker", name: "Classic Leather Sneaker", price: "$120.00", priceAmount: 120, category: "footwear", categoryName: "Footwear", badge: "New", featured: true, onSale: false, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", date: "2026-08-01", productCategories: { nodes: [{ slug: "footwear", name: "Footwear" }] } },
  { id: "2", slug: "minimalist-canvas-backpack", name: "Minimalist Canvas Backpack", price: "$85.00", priceAmount: 85, category: "accessories", categoryName: "Accessories", badge: "Sale", featured: false, onSale: true, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80", date: "2026-07-20", productCategories: { nodes: [{ slug: "accessories", name: "Accessories" }] } },
  { id: "3", slug: "wireless-headphones", name: "Wireless Headphones", price: "$249.00", priceAmount: 249, category: "electronics", categoryName: "Electronics", badge: "Hot", featured: true, onSale: false, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80", date: "2026-08-05", productCategories: { nodes: [{ slug: "electronics", name: "Electronics" }] } },
  { id: "4", slug: "smart-fitness-watch", name: "Smart Fitness Watch", price: "$199.00", priceAmount: 199, category: "electronics", categoryName: "Electronics", badge: "Sale", featured: false, onSale: true, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80", date: "2026-07-15", productCategories: { nodes: [{ slug: "electronics", name: "Electronics" }] } },
  { id: "5", slug: "cotton-crewneck-t-shirt", name: "Cotton Crewneck T-Shirt", price: "$45.00", priceAmount: 45, category: "clothing", categoryName: "Clothing", badge: "New", featured: true, onSale: false, image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80", date: "2026-08-06", productCategories: { nodes: [{ slug: "clothing", name: "Clothing" }] } },
  { id: "6", slug: "waterproof-trail-boots", name: "Waterproof Trail Boots", price: "$180.00", priceAmount: 180, category: "footwear", categoryName: "Footwear", badge: "Sale", featured: false, onSale: true, image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80", date: "2026-06-30", productCategories: { nodes: [{ slug: "footwear", name: "Footwear" }] } },
  { id: "7", slug: "leather-messenger-bag", name: "Leather Messenger Bag", price: "$145.00", priceAmount: 145, category: "accessories", categoryName: "Accessories", badge: "Featured", featured: true, onSale: false, image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80", date: "2026-07-10", productCategories: { nodes: [{ slug: "accessories", name: "Accessories" }] } },
  { id: "8", slug: "slim-fit-chino-pants", name: "Slim Fit Chino Pants", price: "$65.00", priceAmount: 65, category: "clothing", categoryName: "Clothing", badge: "", featured: false, onSale: false, image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80", date: "2026-07-05", productCategories: { nodes: [{ slug: "clothing", name: "Clothing" }] } },
];

function normalizeProduct(p: any, idx: number) {
  // productCategories: WooCommerce standard shape
  const catNodes: { slug: string; name: string }[] =
    p.productCategories?.nodes ||
    p.categories?.nodes ||
    (Array.isArray(p.categories) ? p.categories : []);
  const firstCat = catNodes[0];
  const catSlug = (p.category || firstCat?.slug || firstCat?.name || "shop").toLowerCase();
  const catName = p.categoryName || firstCat?.name || "Shop";

  // featured / onSale - read from real fields or fallback to badge
  const featured = Boolean(p.featured);
  const onSale = Boolean(p.onSale);

  return {
    ...p,
    id: String(p.id || p.databaseId || idx),
    slug: String(p.slug || p.databaseId || p.id || `product-${idx + 1}`),
    name: p.name || p.title || "WooCommerce Product",
    price: p.price ? String(p.price) : p.priceAmount ? `$${p.priceAmount}` : "$99.00",
    priceAmount: typeof p.priceAmount === "number"
      ? p.priceAmount
      : parseFloat(String(p.price || "0").replace(/[^0-9.]/g, "")) || 99,
    category: catSlug,
    categoryName: catName,
    badge: onSale ? "Sale" : featured ? "Featured" : p.badge ?? "",
    featured,
    onSale,
    image: p.imageUrl || p.image?.sourceUrl || MOCK_PRODUCTS[idx % MOCK_PRODUCTS.length].image,
    date: p.date || "2026-08-01",
    productCategories: p.productCategories || { nodes: catNodes.length ? catNodes : [{ slug: catSlug, name: catName }] },
  };
}

export default function UikitProducts({ block, isCanvas, products: passedProducts, categoryTree }: Props) {
  const rawBlock = (block ?? {}) as any;

  // Derive block settings
  const selectedCategory = (rawBlock.productCategory ?? rawBlock.category ?? rawBlock.categoryId ?? "all").toLowerCase().trim();
  const blockSortOrder = rawBlock.productSort ?? "date-desc";
  const source = rawBlock.productSource ?? rawBlock.source ?? "all";
  const isPaginationEnabled = Boolean(rawBlock.paginationEnabled || rawBlock.pagination?.enabled);
  const rawPageSize = Number(rawBlock.pageSize ?? rawBlock.productsLimit ?? rawBlock.limit ?? 4);
  // pageSize === 0 means "show all" (no limit)
  const pageSize = rawPageSize > 0 ? rawPageSize : 0;
  const paginationStyle = rawBlock.paginationStyle ?? "numbers";

  // Local state
  const [fetchedProducts, setFetchedProducts] = useState<any[]>([]);
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>(blockSortOrder);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadMoreCount, setLoadMoreCount] = useState<number>(pageSize);

  // Sync sort order from inspector changes
  const prevSortRef = useRef(blockSortOrder);
  useEffect(() => {
    if (prevSortRef.current !== blockSortOrder) {
      setSortOption(blockSortOrder);
      prevSortRef.current = blockSortOrder;
    }
  }, [blockSortOrder]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setLoadMoreCount(pageSize);
  }, [selectedCategory, activeCategoryPill, sortOption, source, pageSize]);

  // Fetch products — always re-fetch when category or source changes.
  // When passedProducts (canvas preview pool) are available AND no specific
  // category is selected, use them directly to avoid a round-trip.
  // When a category IS selected, fetch from API so we get the correct set.
  useEffect(() => {
    const needsCategoryFetch = selectedCategory && selectedCategory !== "all";
    const needsSourceFetch = source === "featured" || source === "sale";

    // Use passedProducts pool only when showing all / no category filter
    if (passedProducts && passedProducts.length > 0 && !needsCategoryFetch && !needsSourceFetch) {
      setFetchedProducts(passedProducts);
      return;
    }

    let isMounted = true;
    // Fetch ALL products (limit=200) so client-side filtering has the full set
    const catQuery = needsCategoryFetch ? `&categoryId=${encodeURIComponent(selectedCategory)}` : "";
    const srcQuery = needsSourceFetch ? `&source=${encodeURIComponent(source)}` : "";
    fetch(`/api/builder-preview-products?limit=200${catQuery}${srcQuery}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
          setFetchedProducts(data.products);
        } else if (!needsCategoryFetch && !needsSourceFetch && passedProducts && passedProducts.length > 0) {
          // Fallback to passedProducts if API returns nothing
          setFetchedProducts(passedProducts);
        }
      })
      .catch(() => {
        // On error fallback to passedProducts if available
        if (passedProducts && passedProducts.length > 0) {
          setFetchedProducts(passedProducts);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [passedProducts, selectedCategory, source]);

  // Normalize all fetched or mock products
  const normalizedProducts = useMemo(() => {
    const base = fetchedProducts.length > 0 ? fetchedProducts : MOCK_PRODUCTS;
    return base.map(normalizeProduct);
  }, [fetchedProducts]);

  // Build filtered + sorted product list
  const filteredProducts = useMemo(() => {
    let result = [...normalizedProducts];

    // Source filter (Featured / On Sale)
    if (source === "featured") {
      result = result.filter((p) => p.featured);
    } else if (source === "sale") {
      result = result.filter((p) => p.onSale);
    }

    // Category filter — prioritize frontend pill, then inspector category
    const targetCat = (activeCategoryPill !== "all" ? activeCategoryPill : selectedCategory).toLowerCase().trim();
    if (targetCat && targetCat !== "all") {
      result = result.filter((p) => {
        // 1. Canonical category matching helper
        if (categoryTree && categoryTree.length > 0) {
          if (productMatchesCategorySelection(p, targetCat, categoryTree)) return true;
        }

        // 2. Direct productCategories nodes match (WooCommerce standard)
        const catNodes: { slug: string; name: string }[] = p.productCategories?.nodes || [];
        if (catNodes.some((c) => {
          const s = (c.slug || "").toLowerCase();
          const n = (c.name || "").toLowerCase();
          return s === targetCat || n === targetCat || s.includes(targetCat) || targetCat.includes(s);
        })) return true;

        // 3. Flat property checks
        const catSlug = (p.category || p.slug || "").toLowerCase();
        const catName = (p.categoryName || "").toLowerCase();
        return (
          catSlug === targetCat ||
          catName === targetCat ||
          catSlug.includes(targetCat) ||
          catName.includes(targetCat) ||
          targetCat.includes(catSlug)
        );
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "price-asc") return a.priceAmount - b.priceAmount;
      if (sortOption === "price-desc") return b.priceAmount - a.priceAmount;
      if (sortOption === "popularity" || sortOption === "rating") {
        // Fallback: sort featured first then by id
        if (b.featured !== a.featured) return b.featured ? 1 : -1;
        return b.id.localeCompare(a.id);
      }
      // date-desc (default)
      return String(b.date).localeCompare(String(a.date));
    });

    return result;
  }, [normalizedProducts, source, selectedCategory, activeCategoryPill, sortOption, categoryTree]);

  // Build unique category list from fetched products (for frontend pills)
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    normalizedProducts.forEach((p) => {
      const nodes: { slug: string; name: string }[] = p.productCategories?.nodes || [];
      nodes.forEach((c) => {
        if (c.slug) map.set(c.slug, c.name || c.slug);
      });
      if (!map.has(p.category) && p.category) {
        map.set(p.category, p.categoryName || p.category);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [normalizedProducts]);

  // Pagination
  // pageSize=0 means no limit — show all products
  const effectivePageSize = pageSize > 0 ? pageSize : filteredProducts.length || 1;
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / effectivePageSize));

  const visibleProducts = useMemo(() => {
    // Show all when pageSize is 0 (no limit)
    if (pageSize === 0) return filteredProducts;
    if (!isPaginationEnabled) return filteredProducts.slice(0, pageSize);
    if (paginationStyle === "load-more") return filteredProducts.slice(0, Math.max(loadMoreCount, pageSize));
    return filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredProducts, isPaginationEnabled, paginationStyle, currentPage, pageSize, loadMoreCount]);

  // Style calculations
  const columns = Number(rawBlock.gridColumns || rawBlock.columns || 4);
  const columnWidthClass =
    columns === 2 ? "uk-width-1-2@m"
    : columns === 3 ? "uk-width-1-3@m"
    : columns === 5 ? "uk-width-1-5@m"
    : "uk-width-1-4@m";

  // Grid gap — contract: gridGap (none|small|medium|large), mirrors Grid GRID division
  const gridGap = rawBlock.gridGap ?? "medium";
  const gridGapClass =
    gridGap === "none" ? "uk-grid-collapse"
    : gridGap === "small" ? "uk-grid-small"
    : gridGap === "large" ? "uk-grid-large"
    : "uk-grid-medium";

  // Contract GeneralSettingsGroup keys: margin, animation, visibility
  const marginClass = rawBlock.margin && rawBlock.margin !== "default" && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none"
    ? `uk-animation-${typeof rawBlock.animation === "string" ? rawBlock.animation : rawBlock.animation?.preset ?? ""}`
    : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  // Contract CardSettingsGroup keys: panelVariant, panelSize, panelHover
  const panelVariant = rawBlock.panelVariant ?? rawBlock.cardTheme ?? rawBlock.panelStyle ?? "default";
  const panelSize = rawBlock.panelSize ?? "default";
  const panelHover = rawBlock.panelHover === true;
  const cardClass = getUikitCardClass(panelVariant, {
    padding: panelSize,
    hover: panelHover ? "hover" : "none",
  });

  // Contract MediaSettingsGroup keys: productShowMedia, productMediaPlacement,
  // productMediaWidth, productMediaAlign, imageRatio, and imageFit.
  const showMedia = rawBlock.productShowMedia !== false;
  const mediaPlacement = rawBlock.productMediaPlacement ?? "top";
  const mediaWidth = rawBlock.productMediaWidth ?? "medium";
  const mediaAlign = rawBlock.productMediaAlign ?? "center";
  const isSideMedia = mediaPlacement === "left" || mediaPlacement === "right";
  const mediaWidthValue = mediaWidth === "small" ? "35%" : mediaWidth === "large" ? "50%" : "42%";
  const mediaObjectPosition = mediaAlign === "left" ? "left center" : mediaAlign === "right" ? "right center" : "center center";

  // Contract MediaSettingsGroup keys: imageRatio, imageFit, imageShape (via ImageSettingsGroup)
  const ratio = rawBlock.imageRatio ?? "16:9";
  const aspectRatioValue =
    ratio === "1:1" || ratio === "square" ? "1 / 1"
    : ratio === "portrait" || ratio === "3:4" ? "3 / 4"
    : ratio === "16:9" ? "16 / 9"
    : ratio === "4:3" ? "4 / 3"
    : ratio === "3:2" ? "3 / 2"
    : "auto";
  const imageFit = rawBlock.imageFit ?? "cover";
  const imageMaxHeight = rawBlock.imageHeight ? `${rawBlock.imageHeight}px` : "220px";
  const imageShape = rawBlock.imageShape ?? rawBlock.imageBorder ?? "rounded";
  const imageBorderRadius = imageShape === "circle" ? "50%" : imageShape === "pill" ? "9999px" : imageShape === "none" || imageShape === "sharp" ? "0px" : "6px";
  const imageLoading = rawBlock.imageLoading ?? rawBlock.productMediaLoading ?? "lazy";

  // Contract TitleSettingsGroup keys: titleTypographyRole, productTitleSize,
  // productTitleLevel, and productTitleAlign.
  const titleLevel = rawBlock.productTitleLevel ?? "h2";
  const titleSize = rawBlock.productTitleSize ?? "medium";
  const titleAlign = rawBlock.productTitleAlign;
  const titleAlignStyle = titleAlign === "center" ? "center" : titleAlign === "right" ? "right" : undefined;
  const titleClassName = [
    getUikitHeadingClass(titleLevel, titleSize),
    typographyRoleClass(rawBlock.titleTypographyRole === "inherit" ? undefined : rawBlock.titleTypographyRole),
  ].filter(Boolean).join(" ");

  // Contract MetaSettingsGroup keys: metaTypographyRole, productMetaAlign,
  // and productMetaHtmlElement.
  const metaLevel = rawBlock.productMetaHtmlElement ?? "div";
  const metaAlign = rawBlock.productMetaAlign;
  const metaAlignStyle = metaAlign === "center" ? "center" : metaAlign === "right" ? "right" : undefined;
  const metaClassName = [
    typographyRoleClass(rawBlock.metaTypographyRole === "inherit" ? undefined : rawBlock.metaTypographyRole),
    "uk-text-meta",
  ].filter(Boolean).join(" ");

  // Contract ContentSettingsGroup keys: contentTypographyRole and productContentAlign.
  const contentAlign = rawBlock.productContentAlign;
  const contentAlignStyle = contentAlign === "center" ? "center" : contentAlign === "right" ? "right" : undefined;
  const contentClassName = typographyRoleClass(rawBlock.contentTypographyRole === "inherit" ? undefined : rawBlock.contentTypographyRole);

  // Contract ActionSettingsGroup keys: showAddToCart (visible), cartButtonStyle, cartButtonSize
  const showCartButton = rawBlock.showAddToCart !== false;
  const cartButtonVariant = rawBlock.cartButtonStyle ?? "primary";
  const cartButtonSize = rawBlock.cartButtonSize ?? "default";
  const cartButtonClass = getUikitButtonClass(cartButtonVariant, cartButtonSize);

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--products ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {/* Block Title */}
      {rawBlock.title && (
        <Typog as="h3" typography={rawBlock.typography} className="uk-margin-small-bottom">
          <BuilderLineBreakText text={rawBlock.title} />
        </Typog>
      )}

      {/* Frontend Controls Bar */}
      {(rawBlock.showCategoryPills || rawBlock.showFrontendSort) && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "16px" }}>
          {/* Category Filter Pills */}
          {rawBlock.showCategoryPills && (
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                style={{
                  padding: "5px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  background: activeCategoryPill === "all" ? "#1e87f0" : "var(--builder-surface-subtle, #f0f0f2)",
                  color: activeCategoryPill === "all" ? "#fff" : "#333",
                  transition: "background 0.15s, color 0.15s",
                }}
                onClick={() => setActiveCategoryPill("all")}
              >
                All
              </button>
              {categoriesList.map(({ slug, name }) => (
                <button
                  key={slug}
                  type="button"
                  style={{
                    padding: "5px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    border: "none",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    background: activeCategoryPill === slug ? "#1e87f0" : "var(--builder-surface-subtle, #f0f0f2)",
                    color: activeCategoryPill === slug ? "#fff" : "#333",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  onClick={() => setActiveCategoryPill(slug)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Frontend Sort Dropdown */}
          {rawBlock.showFrontendSort && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#666", whiteSpace: "nowrap" }}>Sort by:</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  border: "1px solid var(--builder-border-color, #e0e0e0)",
                  fontSize: "12px",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                <option value="date-desc">Latest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="popularity">Best Sellers</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", color: "#888", background: "var(--builder-surface-subtle, #fafafa)", borderRadius: "8px", border: "1px dashed #ddd" }}>
          <p style={{ margin: 0, fontSize: "14px" }}>
            No products found
            {selectedCategory !== "all" ? ` in category "${selectedCategory}"` : ""}
            {source === "featured" ? " (featured)" : source === "sale" ? " (on sale)" : ""}
            .
          </p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className={`uk-grid ${gridGapClass}`} data-uk-grid>
            {visibleProducts.map((product) => (
              <div key={product.id} className={`${columnWidthClass} uk-width-1-2@s`}>
                <div
                  className={cardClass}
                  style={{
                    overflow: "hidden",
                    display: isSideMedia && showMedia ? "flex" : undefined,
                    flexDirection: mediaPlacement === "right" ? "row-reverse" : undefined,
                  }}
                >
                  {/* Product Media */}
                  {showMedia && (
                    <Link
                      href={`/product/${encodeURIComponent(product.slug)}`}
                      aria-label={`View ${product.name}`}
                      style={{
                        display: "block",
                        width: isSideMedia ? mediaWidthValue : "100%",
                        flex: isSideMedia ? `0 0 ${mediaWidthValue}` : undefined,
                      }}
                    >
                      <div
                        className="uk-card-media-top"
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: aspectRatioValue,
                          maxHeight: imageMaxHeight,
                          overflow: "hidden",
                          alignSelf: mediaAlign === "center" ? "center" : "stretch",
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          loading={imageLoading}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: imageFit as any,
                            objectPosition: mediaObjectPosition,
                            borderRadius: imageBorderRadius,
                            display: "block",
                          }}
                        />
                        {rawBlock.showBadges !== false && product.badge && (
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              left: "8px",
                              background: product.badge === "Sale" ? "#f0506e" : product.badge === "Featured" ? "#1e87f0" : "#32d296",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {product.badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Product Info */}
                  <div
                    className={contentClassName || undefined}
                    style={{
                      padding: panelSize === "small" ? "8px 10px 10px" : panelSize === "large" ? "18px 20px 20px" : "12px 14px 14px",
                      flex: isSideMedia && showMedia ? "1 1 auto" : undefined,
                      minWidth: isSideMedia && showMedia ? 0 : undefined,
                      textAlign: contentAlignStyle,
                    }}
                  >
                    <Link
                      href={`/product/${encodeURIComponent(product.slug)}`}
                      style={{ color: "inherit", textDecoration: "none", display: "block" }}
                    >
                      {rawBlock.showCategoryLabel !== false && (
                        React.createElement(
                          metaLevel,
                          {
                            className: metaClassName || undefined,
                            style: { color: "#999", textTransform: "uppercase", letterSpacing: "0.6px", display: "block", textAlign: metaAlignStyle },
                          },
                          product.categoryName,
                        )
                      )}
                      {React.createElement(
                        titleLevel,
                        { className: `${titleClassName} uk-card-title`.trim(), style: { margin: "4px 0 8px", textAlign: titleAlignStyle } },
                        product.name
                      )}
                    </Link>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: contentAlignStyle === "center" ? "center" : contentAlignStyle === "right" ? "flex-end" : "space-between", gap: "8px", flexWrap: "wrap" }}>
                      <strong className={contentClassName || undefined} style={{ fontSize: "15px", color: "#1e87f0", fontWeight: 700 }}>
                        {product.price}
                      </strong>
                      {showCartButton && (
                        <button type="button" className={cartButtonClass}>
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {isPaginationEnabled && (
            <>
              {paginationStyle === "load-more" && loadMoreCount < filteredProducts.length && (
                <div style={{ textAlign: "center", marginTop: "24px" }}>
                  <button
                    type="button"
                    style={{
                      padding: "10px 28px",
                      borderRadius: "6px",
                      border: "2px solid #1e87f0",
                      background: "transparent",
                      color: "#1e87f0",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onClick={() => setLoadMoreCount((n) => n + pageSize)}
                  >
                    Load More ({filteredProducts.length - loadMoreCount} remaining)
                  </button>
                </div>
              )}

              {(paginationStyle === "numbers" || paginationStyle === "prev-next") && totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", marginTop: "24px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "1px solid var(--builder-border-color, #e0e0e0)",
                      background: currentPage === 1 ? "#f5f5f5" : "#fff",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      opacity: currentPage === 1 ? 0.5 : 1,
                    }}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    ← Prev
                  </button>

                  {paginationStyle === "numbers" &&
                    Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        style={{
                          padding: "6px 12px",
                          borderRadius: "6px",
                          border: "none",
                          background: pageNum === currentPage ? "#1e87f0" : "var(--builder-surface-subtle, #f0f0f2)",
                          color: pageNum === currentPage ? "#fff" : "#333",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: 600,
                          minWidth: "34px",
                        }}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    ))
                  }

                  {paginationStyle === "numbers" && (
                    <span style={{ fontSize: "12px", color: "#999", padding: "0 4px" }}>
                      Page {currentPage} of {totalPages}
                    </span>
                  )}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "6px",
                      border: "1px solid var(--builder-border-color, #e0e0e0)",
                      background: currentPage === totalPages ? "#f5f5f5" : "#fff",
                      cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      fontWeight: 600,
                      opacity: currentPage === totalPages ? 0.5 : 1,
                    }}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
