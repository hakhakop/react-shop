"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";
import { productMatchesCategorySelection } from "@/lib/productCategoryFilter";
import {
  getProductAttributeFacets,
  normalizeProductAttribute,
  productMatchesAttributeSelection,
  type SelectedProductAttributes,
} from "@/lib/productAttributeFilters";
import { typographyRoleClass } from "@/lib/builderTypography";
import { resolvePanelColorSemantics } from "@/lib/panelPresentation";
import {
  getUikitButtonClass,
  getUikitCardClass,
  getUikitHeadingClass,
  getUikitPanelMediaClass,
  getUikitPanelMediaStyle,
} from "@/lib/uikitTokens";
import type { CategoryTreeItem } from "@/lib/categories";
import type { DynamicItemContext } from "@/lib/dynamicContent";

type Props = {
  block: any;
  productContexts?: DynamicItemContext[];
  categoryTree?: CategoryTreeItem[];
};

function getCardAttributeSummary(product: { attributes?: { nodes?: readonly unknown[] | null } | null }) {
  const attributes = (product.attributes?.nodes ?? [])
    .map(normalizeProductAttribute)
    .filter((attribute): attribute is NonNullable<typeof attribute> => attribute !== null);
  const tooltip = attributes
    .map((attribute) => `${attribute.label}: ${attribute.values.join(", ")}`)
    .join(" · ");

  return { attributes, tooltip };
}

function contextValue(context: DynamicItemContext, path: string) {
  return context.fields[path]?.value;
}

function productFromContext(context: DynamicItemContext, index: number) {
  const categories = (contextValue(context, "categories") as { items?: Array<Record<string, unknown>> } | undefined)?.items ?? [];
  const attributes = (contextValue(context, "attributes") as { items?: Array<Record<string, unknown>> } | undefined)?.items ?? [];
  const image = contextValue(context, "image") as { url?: string; alt?: string } | undefined;
  const id = context.id ?? contextValue(context, "id") ?? index;
  const firstCategory = categories[0];
  const slug = String(contextValue(context, "slug") ?? id);
  return {
    id: String(id),
    databaseId: contextValue(context, "databaseId") ?? id,
    slug,
    link: String(
      contextValue(context, "storefront.href") ??
      contextValue(context, "link") ??
      "",
    ),
    category: String(firstCategory?.slug ?? ""),
    categoryName: String(firstCategory?.name ?? ""),
    name: String(contextValue(context, "title") ?? "Product"),
    price: String(contextValue(context, "price") ?? ""),
    priceAmount: contextValue(context, "price.amount"),
    image: image?.url ?? String(contextValue(context, "image.url") ?? ""),
    imageAlt: image?.alt ?? String(contextValue(context, "image.alt") ?? ""),
    featured: Boolean((contextValue(context, "meta") as Record<string, unknown> | undefined)?.featured),
    onSale: Boolean((contextValue(context, "meta") as Record<string, unknown> | undefined)?.onSale),
    productCategories: { nodes: categories.map((category) => ({ slug: String(category.slug ?? ""), name: String(category.name ?? "") })) },
    attributes: { nodes: attributes.map((attribute) => ({ name: String(attribute.name ?? ""), label: String(attribute.name ?? ""), options: Array.isArray(attribute.options) ? attribute.options.map(String) : [] })) },
  };
}

export default function UikitProducts({ block, productContexts, categoryTree }: Props) {
  const rawBlock = (block ?? {}) as any;

  // Derive block settings
  const selectedCategory = (rawBlock.productCategory ?? rawBlock.category ?? rawBlock.categoryId ?? "all").toLowerCase().trim();
  const blockSortOrder = rawBlock.productSort ?? "date-desc";
  // Product source/query ownership lives in dynamicContext. This local value
  // is presentation-only and is intentionally not read from legacy source
  // fields (which previously selected and fetched products here).
  const source = rawBlock.productFilter ?? "all";
  const isPaginationEnabled = Boolean(rawBlock.paginationEnabled || rawBlock.pagination?.enabled);
  const rawPageSize = Number(rawBlock.pageSize ?? rawBlock.productsLimit ?? rawBlock.limit ?? 4);
  // pageSize === 0 means "show all" (no limit)
  const pageSize = rawPageSize > 0 ? rawPageSize : 0;
  const paginationStyle = rawBlock.paginationStyle ?? "numbers";
  const attributeFilterPresentation = rawBlock.attributeFilterPresentation === "sidebar" ? "sidebar" : "top";

  // Local state
  const [activeCategoryPill, setActiveCategoryPill] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>(blockSortOrder);
  const [selectedAttributes, setSelectedAttributes] = useState<SelectedProductAttributes>({});
  const [openAttributeFacet, setOpenAttributeFacet] = useState<string | null>(null);
  const [openProductAttribute, setOpenProductAttribute] = useState<string | null>(null);
  const [expandedSidebarFacets, setExpandedSidebarFacets] = useState<Record<string, boolean>>({});
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
  }, [selectedCategory, activeCategoryPill, sortOption, source, pageSize, selectedAttributes]);

  // Provider rematerialization replaces the collection. Do not carry a
  // transient frontend category/attribute selection into an unrelated result
  // set; authored Product query settings remain untouched.
  useEffect(() => {
    setActiveCategoryPill("all");
    setSelectedAttributes({});
    setOpenAttributeFacet(null);
    setOpenProductAttribute(null);
  }, [productContexts]);

  // Products presentation consumes only canonical provider contexts. Legacy
  // products and mock fallback are intentionally ignored.
  const normalizedProducts = useMemo(() => {
    return (productContexts ?? []).map(productFromContext);
  }, [productContexts]);

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
          if (productMatchesCategorySelection(p as any, targetCat, categoryTree)) return true;
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

    if (rawBlock.showAttributeFilters && Object.keys(selectedAttributes).length > 0) {
      result = result.filter((product) =>
        productMatchesAttributeSelection(product, selectedAttributes),
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortOption === "price-asc") return Number(a.priceAmount || 0) - Number(b.priceAmount || 0);
      if (sortOption === "price-desc") return Number(b.priceAmount || 0) - Number(a.priceAmount || 0);
      if (sortOption === "popularity" || sortOption === "rating") {
        // Fallback: sort featured first then by id
        if (b.featured !== a.featured) return b.featured ? 1 : -1;
        return b.id.localeCompare(a.id);
      }
      // date-desc (default)
      return String((b as any).date || "").localeCompare(String((a as any).date || ""));
    });

    return result;
  }, [normalizedProducts, source, selectedCategory, activeCategoryPill, sortOption, categoryTree, rawBlock.showAttributeFilters, selectedAttributes]);

  // Build unique category list from fetched products (for frontend pills)
  const categoriesList = useMemo(() => {
    const map = new Map<string, string>();
    normalizedProducts.forEach((p) => {
      const nodes: { slug: string; name: string }[] = p.productCategories?.nodes || [];
      nodes.forEach((c) => {
        const name = c.name || c.slug;
        const key = name.trim().toLocaleLowerCase();
        if (c.slug && key && !map.has(key)) map.set(key, name);
      });
      if (p.category) {
        const name = p.categoryName || p.category;
        const key = name.trim().toLocaleLowerCase();
        if (key && !map.has(key)) map.set(key, name);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [normalizedProducts]);

  const attributeFacets = useMemo(
    () => getProductAttributeFacets(normalizedProducts),
    [normalizedProducts],
  );
  const hasSelectedAttributes = Object.values(selectedAttributes).some(
    (options) => options.length > 0,
  );

  const toggleAttributeOption = (attributeKey: string, optionKey: string) => {
    setSelectedAttributes((current) => {
      const selected = current[attributeKey] ?? [];
      const next = selected.includes(optionKey)
        ? selected.filter((key) => key !== optionKey)
        : [...selected, optionKey];
      if (next.length === 0) {
        const { [attributeKey]: _removed, ...remaining } = current;
        return remaining;
      }
      return { ...current, [attributeKey]: next };
    });
  };

  const attributeFilterControls = rawBlock.showAttributeFilters && attributeFacets.length > 0 && (
    <>
      {attributeFacets.map((facet) => {
        const selected = selectedAttributes[facet.key] ?? [];
        const isOpen = openAttributeFacet === facet.key;
        return (
          <div key={facet.key} style={{ position: "relative", display: "inline-flex", flexWrap: "wrap", gap: "4px" }}>
            <button
              type="button"
              className={`uk-button uk-button-${selected.length > 0 ? "primary" : "default"} uk-button-small`}
              aria-expanded={isOpen}
              onClick={() => setOpenAttributeFacet((current) => current === facet.key ? null : facet.key)}
            >
              {facet.label}{selected.length > 0 ? ` (${selected.length})` : ""}
            </button>
            {isOpen && (
              <div
                className="uk-card uk-card-default uk-card-body uk-box-shadow-medium"
                style={{ position: "absolute", zIndex: 20, top: "calc(100% + 6px)", left: 0, minWidth: "170px", padding: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}
              >
                {facet.options.map((option) => {
                  const isSelected = selected.includes(option.key);
                  return (
                    <button
                      key={option.key}
                      type="button"
                      className={`uk-button uk-button-${isSelected ? "primary" : "default"} uk-button-small`}
                      aria-pressed={isSelected}
                      onClick={() => toggleAttributeOption(facet.key, option.key)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      {hasSelectedAttributes && (
        <button type="button" className="uk-button uk-button-text uk-button-small" onClick={() => setSelectedAttributes({})}>
          Clear filters
        </button>
      )}
    </>
  );

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
  const colorSemantics = resolvePanelColorSemantics({
    ...rawBlock,
    panelVariant,
    titleColor: rawBlock.titleColor,
    metaColor: rawBlock.metaColor,
    contentColor: rawBlock.contentColor,
  });

  // Product cards own only structural media layout. Image appearance is shared
  // with Grid through ImageSettingsGroup and its canonical image* fields.
  const showMedia = rawBlock.productShowMedia !== false;
  const mediaPlacement = rawBlock.productMediaPlacement ?? "top";
  const mediaWidth = rawBlock.productMediaWidth ?? "medium";
  const mediaAlign = rawBlock.imageAlignment ?? rawBlock.productMediaAlign ?? "center";
  const isSideMedia = mediaPlacement === "left" || mediaPlacement === "right";
  const mediaWidthValue = mediaWidth === "small" ? "35%" : mediaWidth === "large" ? "50%" : "42%";
  const mediaStyle = getUikitPanelMediaStyle({
    ratio: rawBlock.imageRatio ?? "natural",
    fit: rawBlock.imageFit,
    alignment: mediaAlign,
    position: rawBlock.imagePosition,
  });
  const imageFit = rawBlock.imageFit ?? "natural";
  const imageDimension = (value: unknown, fallback?: string) => {
    if (value === undefined || value === null || value === "") return fallback;
    const stringValue = String(value);
    return /^-?\\d+(?:\\.\\d+)?$/.test(stringValue) ? `${stringValue}px` : stringValue;
  };
  const imageWidth = imageDimension(rawBlock.imageWidth);
  // Ratio owns the media box until an author explicitly supplies a height.
  // A product-only 220px cap previously hid ratio changes that Grid displayed.
  const imageHeight = imageDimension(rawBlock.imageHeight);
  const imageShape = rawBlock.imageShape ?? rawBlock.imageBorder ?? "rounded";
  const imageBorderRadius = imageShape === "circle" ? "50%" : imageShape === "pill" ? "9999px" : imageShape === "none" || imageShape === "sharp" ? "0px" : "6px";
  const imageShadowClass = rawBlock.imageShadow && rawBlock.imageShadow !== "none" ? `uk-box-shadow-${rawBlock.imageShadow}` : "";
  const imageDecorationClass = rawBlock.imageBoxDecoration && rawBlock.imageBoxDecoration !== "none" ? `uk-background-${rawBlock.imageBoxDecoration}` : "";
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
      {(rawBlock.showCategoryPills || rawBlock.showFrontendSort || (rawBlock.showAttributeFilters && attributeFilterPresentation === "top" && attributeFacets.length > 0)) && (
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

          {rawBlock.showAttributeFilters && attributeFilterPresentation === "top" && attributeFacets.length > 0 && (
            <div aria-label="Product attribute filters" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", width: "100%" }}>
              {attributeFilterControls}
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
          <div style={{ display: attributeFilterPresentation === "sidebar" && rawBlock.showAttributeFilters && attributeFacets.length > 0 ? "flex" : undefined, gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
            {rawBlock.showAttributeFilters && attributeFilterPresentation === "sidebar" && attributeFacets.length > 0 && (
              <aside className="uk-card uk-card-default uk-card-body builder-products-filter-sidebar" aria-label="Product attribute filters">
                <div className="builder-products-filter-heading">Filter products</div>
                <div className="builder-products-filter-facets">
                  {attributeFacets.map((facet) => {
                    const isExpanded = expandedSidebarFacets[facet.key] === true;
                    const visibleOptions = isExpanded ? facet.options : facet.options.slice(0, 8);
                    return (
                    <section key={facet.key} className="builder-products-filter-facet">
                      <div className="builder-products-filter-facet-header">
                        <span>{facet.label}</span>
                        <span>{facet.options.length}</span>
                      </div>
                      <div className="builder-products-filter-options">
                        {visibleOptions.map((option) => {
                          const selected = (selectedAttributes[facet.key] ?? []).includes(option.key);
                          return <button key={option.key} type="button" className={`uk-button uk-button-${selected ? "primary" : "default"} uk-button-small builder-products-filter-option`} aria-pressed={selected} onClick={() => toggleAttributeOption(facet.key, option.key)}>{option.label}</button>;
                        })}
                      </div>
                      {facet.options.length > 8 && (
                        <button
                          type="button"
                          className="uk-button uk-button-text uk-button-small builder-products-filter-expand"
                          onClick={() => setExpandedSidebarFacets((current) => ({ ...current, [facet.key]: !isExpanded }))}
                        >
                          {isExpanded ? "Show less" : `Show all (${facet.options.length})`}
                        </button>
                      )}
                    </section>
                  )})}
                  {hasSelectedAttributes && <button type="button" className="uk-button uk-button-text uk-button-small builder-products-filter-clear" onClick={() => setSelectedAttributes({})}>Clear filters</button>}
                </div>
              </aside>
            )}

            {/* Products Grid */}
            <div style={{ flex: "1 1 0", minWidth: "min(100%, 280px)" }}>
          <div className={`uk-grid ${gridGapClass}`} data-uk-grid>
            {visibleProducts.map((product) => (
              <div key={product.id} className={`${columnWidthClass} uk-width-1-2@s`}>
                <div
                  className={`${cardClass} ${colorSemantics.className}`.trim()}
                  style={{
                    ...colorSemantics.style,
                    overflow: "hidden",
                    display: isSideMedia && showMedia ? "flex" : undefined,
                    flexDirection: mediaPlacement === "right" ? "row-reverse" : undefined,
                  }}
                >
                  {/* Product Media */}
                  {showMedia && (
                    <Link
                      href={product.link}
                      aria-label={`View ${product.name}`}
                      style={{
                        display: "block",
                        width: isSideMedia ? mediaWidthValue : "100%",
                        flex: isSideMedia ? `0 0 ${mediaWidthValue}` : undefined,
                      }}
                    >
                      <div
                        className={`${getUikitPanelMediaClass(mediaPlacement)} ${imageDecorationClass}`.trim()}
                        style={{
                          position: "relative",
                          width: imageWidth ?? "100%",
                          aspectRatio: mediaStyle.aspectRatio,
                          maxHeight: imageHeight,
                          overflow: "hidden",
                          alignSelf: mediaAlign === "center" ? "center" : "stretch",
                        }}
                      >
                        <img
                          src={product.image}
                          alt={product.imageAlt || product.name}
                          loading={imageLoading}
                          className={imageShadowClass || undefined}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: imageFit as any,
                            objectPosition: mediaStyle.backgroundPosition,
                            borderRadius: imageBorderRadius,
                            display: "block",
                          }}
                        />
                        {rawBlock.showBadges !== false && (product as any).badge && (
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              left: "8px",
                              background: (product as any).badge === "Sale" ? "#f0506e" : (product as any).badge === "Featured" ? "#1e87f0" : "#32d296",
                              color: "#fff",
                              fontSize: "10px",
                              fontWeight: 700,
                              padding: "2px 8px",
                              borderRadius: "4px",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {(product as any).badge}
                          </span>
                        )}
                      </div>
                    </Link>
                  )}

                  {/* Product Info */}
                  <div
                    className={`uk-card-body ${contentClassName}`.trim()}
                    style={{
                      flex: isSideMedia && showMedia ? "1 1 auto" : undefined,
                      minWidth: isSideMedia && showMedia ? 0 : undefined,
                      textAlign: contentAlignStyle,
                    }}
                  >
                    <Link
                      href={product.link}
                      style={{ color: "inherit", textDecoration: "none", display: "block" }}
                    >
                      {rawBlock.showCategoryLabel !== false && (
                        React.createElement(
                          metaLevel,
                          {
                            className: metaClassName || undefined,
                            style: { ...colorSemantics.metaStyle, textTransform: "uppercase", letterSpacing: "0.6px", display: "block", textAlign: metaAlignStyle },
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
                    {(() => {
                      const { attributes, tooltip } = getCardAttributeSummary(product);
                      return attributes.length > 0 ? (
                        <div
                          className="builder-product-card-attributes"
                          aria-label={tooltip}
                        >
                          {attributes.map((attribute) => {
                            const attributeId = `${product.id}:${attribute.attrKey}`;
                            const isOpen = openProductAttribute === attributeId;
                            return (
                              <div key={attribute.attrKey} className="builder-product-card-attribute-control">
                                <button
                                  type="button"
                                  className="uk-button uk-button-default uk-button-small builder-product-card-attribute-trigger"
                                  aria-expanded={isOpen}
                                  onClick={() => setOpenProductAttribute((current) => current === attributeId ? null : attributeId)}
                                >
                                  {attribute.label}
                                </button>
                                {isOpen && (
                                  <div className="builder-product-card-attribute-popover" role="status">
                                    {attribute.values.join(", ")}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : null;
                    })()}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: contentAlignStyle === "center" ? "center" : contentAlignStyle === "right" ? "flex-end" : "space-between", gap: "8px", flexWrap: "wrap" }}>
                      <strong className={contentClassName} style={{ ...colorSemantics.style, color: "var(--builder-card-content-color, inherit)", fontSize: "15px", fontWeight: 700 }}>
                        {product.price}
                      </strong>
                      {showCartButton && (
                        <AddToCartButton
                          id={product.id}
                          productId={String(product.databaseId ?? product.id)}
                          slug={product.slug}
                          name={product.name}
                          priceNumber={Number(product.priceAmount || 0)}
                          imageUrl={product.image}
                          className={cartButtonClass}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
            </div>
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
