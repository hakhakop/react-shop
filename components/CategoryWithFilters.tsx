"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import WishlistToggle from "./WishlistToggle";
import AddToCartButton from "./AddToCartButton";
import type { ProductNode } from "../lib/products";

type Props = {
  products: ProductNode[];
  columns?: number | null;
  filterPosition?: "left" | "top" | "drawer" | "hidden" | string | null;
  cardStyle?: "flat" | "soft" | "lined" | string | null;
  pageSize?: number | null;
};

function toNumberPrice(price: string | null | undefined): number {
  if (!price) return 0;
  const n = parseFloat(price);
  return Number.isNaN(n) ? 0 : n;
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
  attr: any
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
  pageSize,
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
    "default"
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

  const gridStyle =
    viewMode === "compact"
      ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }
      : viewMode === "list"
      ? { gridTemplateColumns: "minmax(0, 1fr)" }
      : { gridTemplateColumns: `repeat(${archiveColumns}, minmax(0, 1fr))` };

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
    [selectedAttributes]
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
          selectedAttributes
        )) {
          if (selectedOptions.length === 0) continue;

          const productValues = productAttrMap[attrKey];
          if (!productValues || productValues.size === 0) {
            return false;
          }

          const match = selectedOptions.some((optKey) =>
            productValues.has(optKey)
          );
          if (!match) return false;
        }

        return true;
      });
    }

    // sorting
    if (sortBy === "price-asc") {
      items.sort(
        (a, b) => toNumberPrice(a.price) - toNumberPrice(b.price)
      );
    } else if (sortBy === "price-desc") {
      items.sort(
        (a, b) => toNumberPrice(b.price) - toNumberPrice(a.price)
      );
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

  return (
    <div
      className={`shop-filter-layout shop-filter-layout--${normalizedFilterPosition} shop-card-style--${cardStyle ?? "flat"}`}
      style={{
        display: "grid",
        gridTemplateColumns:
          normalizedFilterPosition === "left"
            ? "260px minmax(0, 1fr)"
            : "minmax(0, 1fr)",
        gap: "24px",
        marginTop: "16px",
      }}
    >
      {/* Sidebar */}
      <aside
        className={`shop-filter-panel ${
          isTopFilterLayout ? "shop-filter-panel--top" : ""
        }`}
        style={{
          display: normalizedFilterPosition === "hidden" ? "none" : undefined,
          borderRadius: isTopFilterLayout ? undefined : "16px",
          border: isTopFilterLayout ? undefined : "1px solid #e5e7eb",
          background: isTopFilterLayout ? undefined : "#ffffff",
          padding: isTopFilterLayout ? undefined : "14px 14px 16px",
          boxShadow: isTopFilterLayout
            ? undefined
            : "0 10px 30px rgba(15, 23, 42, 0.04)",
          alignSelf: "flex-start",
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
                        current === facet.key ? null : facet.key
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
                    current === "__price" ? null : "__price"
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
                    current === "__sort" ? null : "__sort"
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
        <div
          className="shop-filter-title"
          style={{
            fontSize: "15px",
            fontWeight: 600,
            marginBottom: "10px",
            color: "#0f172a",
          }}
        >
          Filters
        </div>

        {/* Search */}
        <div className="shop-filter-group" style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
            }}
          >
            Search in category
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products…"
            style={{
              width: "100%",
              padding: "7px 9px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
            }}
          />
        </div>

        {/* Price range */}
        <div className="shop-filter-group" style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
            }}
          >
            Price range (AMD)
          </label>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <input
              type="number"
              min={0}
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Min"
              style={{
                width: "100%",
                padding: "7px 9px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
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
              style={{
                width: "100%",
                padding: "7px 9px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontSize: "13px",
              }}
            />
          </div>
        </div>

        {/* Sort */}
        <div className="shop-filter-group" style={{ marginBottom: "12px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              color: "#6b7280",
              marginBottom: "4px",
            }}
          >
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as typeof sortBy);
              setCurrentPage(1);
            }}
            style={{
              width: "100%",
              padding: "7px 9px",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
              fontSize: "13px",
              backgroundColor: "#ffffff",
            }}
          >
            <option value="default">Default</option>
            <option value="price-asc">Price: Low to high</option>
            <option value="price-desc">Price: High to low</option>
            <option value="name-asc">Name: A → Z</option>
          </select>
        </div>

        {/* Attribute filters */}
        {attributeFacets.length > 0 && (
          <div
            className="shop-filter-attributes"
            style={{
              marginTop: "4px",
              paddingTop: "10px",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 500,
                marginBottom: "8px",
                color: "#111827",
              }}
            >
              Attributes
            </div>

            {attributeFacets.map((facet) => {
              const selectedForFacet = selectedAttributes[facet.key] ?? [];
              return (
                <div key={facet.key} style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: "#4b5563",
                      marginBottom: "6px",
                    }}
                  >
                    {facet.label}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}
                  >
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
                          style={{
                            borderRadius: "999px",
                            padding: "4px 9px 5px 9px",
                            fontSize: "11px",
                            border: isSelected
                              ? "1px solid #111827"
                              : "1px solid #e5e7eb",
                            backgroundColor: isSelected
                              ? "#111827"
                              : "#f9fafb",
                            color: isSelected ? "#ffffff" : "#111827",
                            cursor: "pointer",
                            lineHeight: 1.4,
                          }}
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
          style={{
            marginTop: "8px",
            width: "100%",
            borderRadius: "999px",
            border: "1px solid #e5e7eb",
            padding: "7px 10px",
            fontSize: "13px",
            background: "#f9fafb",
            cursor: "pointer",
          }}
        >
          Reset all filters
        </button>

        <div
          className="shop-filter-summary"
          style={{
            marginTop: "10px",
            fontSize: "11px",
            color: "#9ca3af",
          }}
        >
          Showing {showingFrom}-{showingTo} of {total} products.
        </div>
          </>
        )}
      </aside>

      {/* Product grid + pagination */}
      <section>
        {paginatedProducts.length === 0 ? (
          <div
            style={{
              fontSize: "14px",
              color: "#6b7280",
            }}
          >
            No products match these filters. Try adjusting them.
          </div>
        ) : (
          <>
            <div
              style={{
                marginBottom: "8px",
                display: "flex",
                justifyContent: "flex-end",
                gap: "6px",
                fontSize: "12px",
              }}
            >
              <button
                type="button"
                onClick={() => setViewMode("default")}
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border:
                    viewMode === "default"
                      ? "1px solid rgba(148,163,184,0.9)"
                      : "1px solid rgba(148,163,184,0.4)",
                  background:
                    viewMode === "default"
                      ? "rgba(248,250,252,0.95)"
                      : "transparent",
                  cursor: "pointer",
                }}
              >
                Comfort
              </button>
              <button
                type="button"
                onClick={() => setViewMode("compact")}
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border:
                    viewMode === "compact"
                      ? "1px solid rgba(148,163,184,0.9)"
                      : "1px solid rgba(148,163,184,0.4)",
                  background:
                    viewMode === "compact"
                      ? "rgba(248,250,252,0.95)"
                      : "transparent",
                  cursor: "pointer",
                }}
              >
                2-wide
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                style={{
                  padding: "4px 8px",
                  borderRadius: 999,
                  border:
                    viewMode === "list"
                      ? "1px solid rgba(148,163,184,0.9)"
                      : "1px solid rgba(148,163,184,0.4)",
                  background:
                    viewMode === "list"
                      ? "rgba(248,250,252,0.95)"
                      : "transparent",
                  cursor: "pointer",
                }}
              >
                List
              </button>
            </div>

            <div className="product-grid" style={gridStyle}>
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
                  (p as any).attributes?.nodes && Array.isArray((p as any).attributes.nodes)
                    ? (p as any).attributes.nodes
                    : [];

                return (
                  <div
                    key={p.id}
                    className="product-card"
                    style={
                      viewMode === "list"
                        ? {
                            width: "100%",
                            maxWidth: "100%",
                            boxSizing: "border-box",
                            display: "flex",
                            gap: 16,
                            borderRadius: "10px",
                            background: "#f8fafc",
                            padding: "10px 12px",
                            margin: "0 0 12px 0",
                          }
                        : undefined
                    }
                  >
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
                      style={
                        viewMode === "list"
                          ? {
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 16,
                            }
                          : undefined
                      }
                    >
                      <div
                        className="product-image"
                        style={
                          viewMode === "list"
                            ? {
                                margin: 0,
                                width: 130,
                                height: 130,
                                flexShrink: 0,
                              }
                            : undefined
                        }
                      >
                        {p.image?.sourceUrl ? (
                          <img
                            src={p.image.sourceUrl}
                            alt={p.image.altText || p.name}
                            style={
                              viewMode === "list"
                                ? {
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "contain",
                                  }
                                : undefined
                            }
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            No image
                          </div>
                        )}
                      </div>

                      <div className="product-main">
                        <h2 className="product-title product-title-2lines">
                          {p.name}
                        </h2>

                        {attributes.length > 0 && (
                          <div className="product-attributes-row">
                            {attributes.map((attr: any) => {
                              const key =
                                (attr?.name ?? attr?.label ?? "").toString() || "attr";
                              const label =
                                (attr?.label ?? attr?.name ?? "").toString();
                              const values = Array.isArray(attr?.options)
                                ? attr.options
                                    .map((v: any) =>
                                      v != null ? String(v).trim() : ""
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

                        {priceNumber > 0 && !Number.isNaN(priceNumber) && (
                          <div className="product-price">
                            {formattedPrice} ֏
                          </div>
                        )}
                      </div>
                    </Link>

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
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {pageCount > 1 && (
              <div
                style={{
                  marginTop: "16px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <button
                  type="button"
                  onClick={() => goToPage(safePage - 1)}
                  disabled={safePage === 1}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid #e5e7eb",
                    backgroundColor:
                      safePage === 1 ? "#f9fafb" : "#ffffff",
                    cursor:
                      safePage === 1 ? "default" : "pointer",
                  }}
                >
                  ‹ Prev
                </button>

                {Array.from({ length: pageCount }).map((_, i) => {
                  const pageNumber = i + 1;
                  const active = pageNumber === safePage;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => goToPage(pageNumber)}
                      style={{
                        minWidth: "30px",
                        padding: "4px 8px",
                        borderRadius: "999px",
                        border: active
                          ? "1px solid #111827"
                          : "1px solid #e5e7eb",
                        backgroundColor: active
                          ? "#111827"
                          : "#ffffff",
                        color: active ? "#ffffff" : "#111827",
                        cursor: "pointer",
                      }}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(safePage + 1)}
                  disabled={safePage === pageCount}
                  style={{
                    padding: "4px 10px",
                    borderRadius: "999px",
                    border: "1px solid #e5e7eb",
                    backgroundColor:
                      safePage === pageCount
                        ? "#f9fafb"
                        : "#ffffff",
                    cursor:
                      safePage === pageCount
                        ? "default"
                        : "pointer",
                  }}
                >
                  Next ›
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
