"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Grid2X2,
  Rows3,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import WishlistToggle from "./WishlistToggle";
import AddToCartButton from "./AddToCartButton";
import type { ProductNode } from "../lib/products";

type Props = {
  products: ProductNode[];
  columns?: number | null;
  filterPosition?: "left" | "top" | "drawer" | "hidden" | string | null;
  cardStyle?: "flat" | "soft" | "lined" | string | null;
  cardPreset?: string | null;
  pageSize?: number | null;
  gridGap?: string | null;
  cardPadding?: string | null;
  imagePadding?: string | null;
  imageFrame?: string | null;
  addToCartStyle?: string | null;
  addToCartSize?: string | null;
  addToCartPosition?: string | null;
  addToCartVisibility?: string | null;
  addToCartDisplay?: string | null;
};

function toNumberPrice(price: string | null | undefined): number {
  if (!price) return 0;
  const n = parseFloat(price);
  return Number.isNaN(n) ? 0 : n;
}

function productSpaceToCss(value: string | null | undefined, fallback: string) {
  const key = (value || fallback).toString().toLowerCase();
  switch (key) {
    case "frameless":
    case "none":
      return "0px";
    case "small":
      return "clamp(6px, 0.7vw, 10px)";
    case "large":
      return "clamp(28px, 3vw, 46px)";
    case "max":
      return "clamp(44px, 5vw, 76px)";
    case "medium":
    default:
      return "clamp(16px, 1.8vw, 26px)";
  }
}

function productGridGapToCss(
  value: string | null | undefined,
  fallback: string,
) {
  const key = (value || fallback).toString().toLowerCase();
  switch (key) {
    case "none":
      return "0px";
    case "small":
      return "clamp(10px, 1vw, 14px)";
    case "large":
      return "clamp(18px, 1.8vw, 26px)";
    case "max":
      return "clamp(24px, 2.4vw, 34px)";
    case "medium":
    default:
      return "clamp(14px, 1.4vw, 20px)";
  }
}

function getCartButtonStyle({
  style,
  size,
  display,
}: {
  style: string;
  size: string;
  display: string;
}): CSSProperties {
  const sizeStyle: CSSProperties =
    display === "icon"
      ? {
          width: 42,
          minWidth: 42,
          height: 42,
          minHeight: 42,
          padding: 0,
          fontSize: 0,
        }
      : size === "compact"
        ? { minWidth: 96, minHeight: 32, padding: "0 14px", fontSize: 11 }
        : size === "large"
          ? { minWidth: 168, minHeight: 48, padding: "0 28px", fontSize: 13 }
          : size === "full"
            ? { width: "100%", minHeight: 54, padding: "0 24px", fontSize: 13 }
            : { minWidth: 128, minHeight: 38, padding: "0 20px", fontSize: 12 };

  const colorStyle: CSSProperties =
    style === "dark"
      ? { background: "#111111", borderColor: "#111111", color: "#ffffff" }
      : style === "light"
        ? {
            background: "#ffffff",
            borderColor: "rgba(17, 17, 17, 0.14)",
            color: "#111111",
            boxShadow: "inset 0 0 0 1px rgba(17, 17, 17, 0.08)",
          }
        : style === "inherit"
          ? {
              background:
                "var(--builder-active-button-bg, var(--text-main, #111111))",
              borderColor:
                "var(--builder-active-button-bg, var(--text-main, #111111))",
              color: "var(--builder-active-button-text, #ffffff)",
            }
          : { background: "#0d7cff", borderColor: "#0d7cff", color: "#ffffff" };

  return {
    ...sizeStyle,
    ...colorStyle,
    borderRadius: 999,
    fontWeight: 800,
    letterSpacing: "0.06em",
    boxShadow: colorStyle.boxShadow ?? "none",
  };
}

type AttributeOption = {
  key: string; // normalized key (e.g. "yellow")
  label: string; // display label (e.g. "Yellow")
};

type AttributeFacet = {
  key: string; // attr key (e.g. "pa_color")
  label: string;
  options: AttributeOption[];
};

function normalizeAttributeNode(
  attr: any,
): { attrKey: string; label: string; values: string[] } | null {
  if (!attr) return null;

  const rawName = (attr.name ?? attr.label ?? "").toString().trim();
  if (!rawName) return null;

  const attrKey = rawName.toLowerCase();
  const values: string[] = [];

  if (Array.isArray(attr.options) && attr.options.length > 0) {
    for (const opt of attr.options) {
      if (!opt) continue;
      const v = String(opt).trim();
      if (v) values.push(v);
    }
  }

  if (values.length === 0) return null;

  return {
    attrKey,
    label: attr.label || rawName,
    values,
  };
}

export default function CategoryWithFilters({
  products,
  columns,
  filterPosition = "left",
  cardStyle = "flat",
  cardPreset = "standard",
  pageSize,
  gridGap,
  cardPadding,
  imagePadding,
  imageFrame,
  addToCartStyle,
  addToCartSize,
  addToCartPosition,
  addToCartVisibility,
  addToCartDisplay,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "name-asc"
  >("default");

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({});
  const [openTopFacet, setOpenTopFacet] = useState<string | null>(null);
  const topFiltersRef = useRef<HTMLDivElement | null>(null);

  // simple client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const normalizedPageSize =
    typeof pageSize === "number" && pageSize >= 4 && pageSize <= 48
      ? Math.round(pageSize)
      : 12;

  const [viewMode, setViewMode] = useState<"default" | "compact" | "list">(
    "default",
  );

  const archiveColumns =
    typeof columns === "number" && columns >= 2 && columns <= 6 ? columns : 4;
  const normalizedFilterPosition =
    filterPosition === "top" ||
    filterPosition === "drawer" ||
    filterPosition === "hidden"
      ? filterPosition
      : "left";
  const isTopFilterLayout = normalizedFilterPosition === "top";
  const normalizedCardStyle =
    cardStyle === "soft" || cardStyle === "lined" || cardStyle === "none"
      ? cardStyle
      : "flat";
  const normalizedCardPreset =
    cardPreset === "graph" ||
    cardPreset === "gallery" ||
    cardPreset === "editorial" ||
    cardPreset === "compact" ||
    cardPreset === "minimal" ||
    cardPreset === "luxury"
      ? cardPreset
      : "standard";
  const normalizedCartStyle =
    addToCartStyle === "dark" ||
    addToCartStyle === "light" ||
    addToCartStyle === "inherit"
      ? addToCartStyle
      : "blue";
  const normalizedCartSize =
    addToCartSize === "compact" ||
    addToCartSize === "large" ||
    addToCartSize === "full"
      ? addToCartSize
      : "medium";
  const normalizedCartPosition =
    addToCartPosition === "under-price" ||
    addToCartPosition === "under-wishlist"
      ? addToCartPosition
      : "below";
  const normalizedCartVisibility =
    addToCartVisibility === "always" ? "always" : "hover";
  const normalizedCartDisplay = addToCartDisplay === "icon" ? "icon" : "button";
  const cartButtonStyle = getCartButtonStyle({
    style: normalizedCartStyle,
    size: normalizedCartSize,
    display: normalizedCartDisplay,
  });

  const productSpaceVars = {
    "--product-grid-gap": productGridGapToCss(gridGap, "medium"),
    "--product-card-padding": productSpaceToCss(cardPadding, "medium"),
    "--product-image-padding": productSpaceToCss(imagePadding, "large"),
    "--archive-columns": archiveColumns,
  } as CSSProperties;

  const gridStyle =
    viewMode === "compact"
      ? {
          ...productSpaceVars,
          "--archive-columns": 2,
        }
      : viewMode === "list"
        ? { ...productSpaceVars, "--archive-columns": 1 }
        : productSpaceVars;

  const attributeFacets: AttributeFacet[] = useMemo(() => {
    const map: Record<string, { label: string; optionSet: Set<string> }> = {};

    for (const p of products) {
      const rawAttrs = p.attributes?.nodes ?? [];
      for (const raw of rawAttrs) {
        const normalized = normalizeAttributeNode(raw);
        if (!normalized) continue;
        const { attrKey, label, values } = normalized;

        if (!map[attrKey]) {
          map[attrKey] = {
            label,
            optionSet: new Set<string>(),
          };
        }

        for (const v of values) {
          map[attrKey].optionSet.add(v);
        }
      }
    }

    return Object.entries(map)
      .map(([attrKey, { label, optionSet }]) => ({
        key: attrKey,
        label,
        options: Array.from(optionSet)
          .sort((a, b) => a.localeCompare(b))
          .map((v) => ({
            key: v.toLowerCase(),
            label: v,
          })),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  const hasAttributeFilters = useMemo(
    () => Object.keys(selectedAttributes).length > 0,
    [selectedAttributes],
  );

  useEffect(() => {
    if (!openTopFacet) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!topFiltersRef.current) return;
      if (!topFiltersRef.current.contains(event.target as Node)) {
        setOpenTopFacet(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [openTopFacet]);

  function toggleAttribute(attrKey: string, optionKey: string) {
    setCurrentPage(1); // reset page when changing filters
    setSelectedAttributes((prev) => {
      const current = prev[attrKey] ?? [];
      const exists = current.includes(optionKey);
      const nextForAttr = exists
        ? current.filter((v) => v !== optionKey)
        : [...current, optionKey];

      const next = { ...prev, [attrKey]: nextForAttr };
      if (nextForAttr.length === 0) {
        delete next[attrKey];
      }
      return next;
    });
  }

  function resetFilters() {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
    setSelectedAttributes({});
    setCurrentPage(1);
  }

  const filteredProducts = useMemo(() => {
    let items = [...products];

    // text search
    if (searchTerm.trim() !== "") {
      const q = searchTerm.trim().toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q));
    }

    // price range
    const min = minPrice ? parseFloat(minPrice) : null;
    const max = maxPrice ? parseFloat(maxPrice) : null;

    if (min !== null && !Number.isNaN(min)) {
      items = items.filter((p) => toNumberPrice(p.price) >= min);
    }

    if (max !== null && !Number.isNaN(max)) {
      items = items.filter((p) => toNumberPrice(p.price) <= max);
    }

    // attribute filters
    if (hasAttributeFilters) {
      items = items.filter((p) => {
        const rawAttrs = p.attributes?.nodes ?? [];
        const productAttrMap: Record<string, Set<string>> = {};

        for (const raw of rawAttrs) {
          const normalized = normalizeAttributeNode(raw);
          if (!normalized) continue;
          const { attrKey, values } = normalized;

          if (!productAttrMap[attrKey]) {
            productAttrMap[attrKey] = new Set<string>();
          }

          for (const v of values) {
            productAttrMap[attrKey].add(v.toLowerCase());
          }
        }

        for (const [attrKey, selectedOptions] of Object.entries(
          selectedAttributes,
        )) {
          if (selectedOptions.length === 0) continue;

          const productValues = productAttrMap[attrKey];
          if (!productValues || productValues.size === 0) {
            return false;
          }

          const match = selectedOptions.some((optKey) =>
            productValues.has(optKey),
          );
          if (!match) return false;
        }

        return true;
      });
    }

    // sorting
    if (sortBy === "price-asc") {
      items.sort((a, b) => toNumberPrice(a.price) - toNumberPrice(b.price));
    } else if (sortBy === "price-desc") {
      items.sort((a, b) => toNumberPrice(b.price) - toNumberPrice(a.price));
    } else if (sortBy === "name-asc") {
      items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [
    products,
    searchTerm,
    minPrice,
    maxPrice,
    sortBy,
    hasAttributeFilters,
    selectedAttributes,
  ]);

  // pagination derived from filtered products
  const total = filteredProducts.length;
  const pageCount = Math.max(1, Math.ceil(total / normalizedPageSize));
  const safePage = Math.min(currentPage, pageCount);
  const start = (safePage - 1) * normalizedPageSize;
  const end = start + normalizedPageSize;
  const paginatedProducts = filteredProducts.slice(start, end);

  function goToPage(page: number) {
    const p = Math.min(Math.max(1, page), pageCount);
    setCurrentPage(p);
  }

  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(end, total);
  const selectedAttributeCount = Object.values(selectedAttributes).reduce(
    (sum, values) => sum + values.length,
    0,
  );
  const activeFilterCount =
    selectedAttributeCount +
    (searchTerm.trim() ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);
  return (
    <div
      className={`shop-filter-layout shop-filter-layout--${normalizedFilterPosition} shop-card-style--${normalizedCardStyle} shop-card-preset--${normalizedCardPreset} shop-cart-button--${normalizedCartStyle} shop-cart-size--${normalizedCartSize} shop-cart-position--${normalizedCartPosition} shop-cart-visibility--${normalizedCartVisibility} shop-cart-display--${normalizedCartDisplay} shop-image-padding--${
        imagePadding === "frameless" || imagePadding === "none"
          ? "none"
          : imagePadding || "large"
      } shop-image-frame--${imageFrame === "soft" ? "soft" : "none"}`}
    >
      {/* Sidebar */}
      <aside
        className={`shop-filter-panel ${
          isTopFilterLayout ? "shop-filter-panel--top" : ""
        }`}
        style={{
          display: normalizedFilterPosition === "hidden" ? "none" : undefined,
        }}
      >
        {isTopFilterLayout ? (
          <div className="shop-top-attribute-filters" ref={topFiltersRef}>
            {attributeFacets.map((facet) => {
              const selectedForFacet = selectedAttributes[facet.key] ?? [];
              const isOpen = openTopFacet === facet.key;
              return (
                <div
                  key={facet.key}
                  className={`shop-top-attribute-filter ${
                    isOpen ? "is-open" : ""
                  }`}
                >
                  <button
                    type="button"
                    className="shop-top-attribute-trigger"
                    onClick={() =>
                      setOpenTopFacet((current) =>
                        current === facet.key ? null : facet.key,
                      )
                    }
                  >
                    <span>{facet.label}</span>
                    {selectedForFacet.length > 0 && (
                      <strong>{selectedForFacet.length}</strong>
                    )}
                  </button>

                  <div className="shop-top-attribute-dropdown">
                    {facet.options.map((opt) => {
                      const isSelected = selectedForFacet.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          className={isSelected ? "is-selected" : ""}
                          onClick={() => toggleAttribute(facet.key, opt.key)}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div
              className={`shop-top-attribute-filter ${
                openTopFacet === "__price" ? "is-open" : ""
              }`}
            >
              <button
                type="button"
                className="shop-top-attribute-trigger"
                onClick={() =>
                  setOpenTopFacet((current) =>
                    current === "__price" ? null : "__price",
                  )
                }
              >
                <span>Price</span>
                {(minPrice || maxPrice) && <strong>1</strong>}
              </button>

              <div className="shop-top-attribute-dropdown shop-top-price-dropdown">
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(event) => {
                    setMinPrice(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(event) => {
                    setMaxPrice(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Max"
                />
              </div>
            </div>

            <div
              className={`shop-top-attribute-filter ${
                openTopFacet === "__sort" ? "is-open" : ""
              }`}
            >
              <button
                type="button"
                className="shop-top-attribute-trigger"
                onClick={() =>
                  setOpenTopFacet((current) =>
                    current === "__sort" ? null : "__sort",
                  )
                }
              >
                <span>Sort by</span>
              </button>

              <div className="shop-top-attribute-dropdown shop-top-sort-dropdown">
                {[
                  ["default", "Default"],
                  ["price-asc", "Price: Low to high"],
                  ["price-desc", "Price: High to low"],
                  ["name-asc", "Name: A to Z"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={sortBy === value ? "is-selected" : ""}
                    onClick={() => {
                      setSortBy(value as typeof sortBy);
                      setCurrentPage(1);
                      setOpenTopFacet(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {attributeFacets.length > 0 && (
              <label className="shop-top-attribute-search">
                <span className="sr-only">Search products</span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                />
              </label>
            )}

            {attributeFacets.length > 0 && (
              <button
                type="button"
                className="shop-top-attribute-reset"
                onClick={resetFilters}
              >
                Reset
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="shop-filter-title">
              <span>
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filters
              </span>
              {activeFilterCount > 0 && <strong>{activeFilterCount}</strong>}
            </div>

            {/* Search */}
            <div className="shop-filter-group">
              <label>Search in category</label>
              <div className="shop-filter-input-wrap">
                <Search size={15} aria-hidden="true" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                />
              </div>
            </div>

            {/* Price range */}
            <div className="shop-filter-group">
              <label>Price range</label>
              <div className="shop-filter-price-grid">
                <input
                  type="number"
                  min={0}
                  value={minPrice}
                  onChange={(e) => {
                    setMinPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Min"
                />
                <input
                  type="number"
                  min={0}
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="shop-filter-group">
              <label>Sort by</label>
              <div className="shop-filter-select-wrap">
                <ArrowUpDown size={15} aria-hidden="true" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as typeof sortBy);
                    setCurrentPage(1);
                  }}
                >
                  <option value="default">Default</option>
                  <option value="price-asc">Price: Low to high</option>
                  <option value="price-desc">Price: High to low</option>
                  <option value="name-asc">Name: A to Z</option>
                </select>
              </div>
            </div>

            {/* Attribute filters */}
            {attributeFacets.length > 0 && (
              <div className="shop-filter-attributes">
                <div className="shop-filter-subtitle">Attributes</div>

                {attributeFacets.map((facet) => {
                  const selectedForFacet = selectedAttributes[facet.key] ?? [];
                  return (
                    <div key={facet.key} className="shop-filter-facet">
                      <div className="shop-filter-facet-label">
                        {facet.label}
                      </div>
                      <div className="shop-filter-chip-row">
                        {facet.options.map((opt) => {
                          const isSelected = selectedForFacet.includes(opt.key);
                          return (
                            <button
                              key={opt.key}
                              type="button"
                              className={isSelected ? "is-selected" : ""}
                              onClick={() =>
                                toggleAttribute(facet.key, opt.key)
                              }
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reset */}
            <button
              className="shop-filter-reset"
              type="button"
              onClick={resetFilters}
            >
              <X size={14} aria-hidden="true" />
              Reset all filters
            </button>

            <div className="shop-filter-summary">
              Showing {showingFrom}-{showingTo} of {total} products.
            </div>
          </>
        )}
      </aside>

      {/* Product grid + pagination */}
      <section className="shop-archive-results">
        {paginatedProducts.length === 0 ? (
          <div className="shop-archive-empty">
            <Sparkles size={24} aria-hidden="true" />
            <h2>No products match these filters</h2>
            <p>Try a wider price range or clear a selected attribute.</p>
            <button type="button" onClick={resetFilters}>
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <div className="shop-archive-toolbar">
              <div>
                <strong>
                  {showingFrom}-{showingTo}
                </strong>{" "}
                of {total} products
              </div>
              <div className="shop-view-switcher" aria-label="Archive view">
                <button
                  type="button"
                  className={viewMode === "default" ? "is-active" : ""}
                  onClick={() => setViewMode("default")}
                >
                  <Grid2X2 size={15} aria-hidden="true" />
                  Comfort
                </button>
                <button
                  type="button"
                  className={viewMode === "compact" ? "is-active" : ""}
                  onClick={() => setViewMode("compact")}
                >
                  <Grid2X2 size={15} aria-hidden="true" />
                  2-wide
                </button>
                <button
                  type="button"
                  className={viewMode === "list" ? "is-active" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <Rows3 size={15} aria-hidden="true" />
                  List
                </button>
              </div>
            </div>

            <div
              className={`product-grid shop-archive-grid shop-archive-grid--${viewMode}`}
              style={gridStyle}
            >
              {paginatedProducts.map((p) => {
                const priceNumber = toNumberPrice(p.price);
                const imageUrl = p.image?.sourceUrl || undefined;

                const formattedPrice =
                  priceNumber > 0 && !Number.isNaN(priceNumber)
                    ? priceNumber.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })
                    : "";

                const attributes =
                  (p as any).attributes?.nodes &&
                  Array.isArray((p as any).attributes.nodes)
                    ? (p as any).attributes.nodes
                    : [];
                const cartAction = (
                  <div className="product-card-actions-row">
                    <AddToCartButton
                      id={p.id}
                      slug={p.slug}
                      name={p.name}
                      priceNumber={
                        priceNumber > 0 && !Number.isNaN(priceNumber)
                          ? priceNumber
                          : null
                      }
                      imageUrl={imageUrl}
                      style={cartButtonStyle}
                      display={normalizedCartDisplay}
                    />
                  </div>
                );

                return (
                  <div
                    key={p.id}
                    className={`product-card shop-archive-card ${
                      viewMode === "list" ? "shop-archive-card--list" : ""
                    }`}
                    data-card-preset={normalizedCardPreset}
                  >
                    <div className="product-card-top-right">
                      <WishlistToggle
                        id={p.id}
                        slug={p.slug}
                        name={p.name}
                        imageUrl={imageUrl}
                      />
                      {normalizedCartPosition === "under-wishlist" &&
                        cartAction}
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
                            width={420}
                            height={420}
                            className="product-image-img"
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            No image
                          </div>
                        )}
                      </div>
                    </Link>

                    <div className="product-main">
                      <Link
                        href={`/product/${p.slug}`}
                        className="product-card-title-link"
                      >
                        <h2 className="product-title product-title-2lines">
                          {p.name}
                        </h2>
                      </Link>

                      {priceNumber > 0 && !Number.isNaN(priceNumber) && (
                        <div className="product-price">{formattedPrice} ֏</div>
                      )}

                      {normalizedCartPosition === "under-price" && cartAction}

                      {attributes.length > 0 && (
                        <div className="product-attributes-row">
                          {attributes.map((attr: any) => {
                            const key =
                              (attr?.name ?? attr?.label ?? "").toString() ||
                              "attr";
                            const label = (
                              attr?.label ??
                              attr?.name ??
                              ""
                            ).toString();
                            const values = Array.isArray(attr?.options)
                              ? attr.options
                                  .map((v: any) =>
                                    v != null ? String(v).trim() : "",
                                  )
                                  .filter((v: string) => v.length > 0)
                              : [];

                            if (!label || values.length === 0) {
                              return null;
                            }

                            return (
                              <div
                                key={key}
                                className="product-attribute-badge"
                              >
                                <span className="product-attribute-label">
                                  {label}:
                                </span>
                                <span className="product-attribute-values">
                                  {values.join(", ")}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {normalizedCartPosition === "below" && cartAction}
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {pageCount > 1 && (
              <div className="shop-pagination">
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                >
                  <ChevronLeft size={15} aria-hidden="true" />
                  Prev
                </button>

                {Array.from({ length: pageCount }).map((_, i) => {
                  const pageNumber = i + 1;
                  const active = pageNumber === safePage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      className={active ? "is-active" : ""}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === pageCount}
                >
                  Next
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
