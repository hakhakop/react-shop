"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import WishlistToggle from "./WishlistToggle";
import type { ProductNode } from "../lib/products";

type Props = {
  products: ProductNode[];
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

export default function CategoryWithFilters({ products }: Props) {
  // 🔍 Debug – now we can see attributes
  if (products && products.length > 0) {
    console.log(
      "DEBUG first product in CategoryWithFilters:",
      products[0]
    );
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<
    "default" | "price-asc" | "price-desc" | "name-asc"
  >("default");

  const [selectedAttributes, setSelectedAttributes] = useState<
    Record<string, string[]>
  >({});

  // simple client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

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
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(currentPage, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const paginatedProducts = filteredProducts.slice(start, end);

  function goToPage(page: number) {
    const p = Math.min(Math.max(1, page), pageCount);
    setCurrentPage(p);
  }

  const showingFrom = total === 0 ? 0 : start + 1;
  const showingTo = Math.min(end, total);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "260px minmax(0, 1fr)",
        gap: "24px",
        marginTop: "16px",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          background: "#ffffff",
          padding: "14px 14px 16px",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
          alignSelf: "flex-start",
        }}
      >
        <div
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
        <div style={{ marginBottom: "12px" }}>
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
        <div style={{ marginBottom: "12px" }}>
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
        <div style={{ marginBottom: "12px" }}>
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
          style={{
            marginTop: "10px",
            fontSize: "11px",
            color: "#9ca3af",
          }}
        >
          Showing {showingFrom}-{showingTo} of {total} products.
        </div>
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
            <div className="product-grid">
              {paginatedProducts.map((p) => {
                const priceNumber = toNumberPrice(p.price);
                const imageUrl = p.image?.sourceUrl || undefined;

                const formattedPrice =
                  priceNumber > 0 && !Number.isNaN(priceNumber)
                    ? priceNumber.toLocaleString("en-US", {
                        maximumFractionDigits: 0,
                      })
                    : "";

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
                          <img
                            src={p.image.sourceUrl}
                            alt={p.image.altText || p.name}
                          />
                        ) : (
                          <div className="product-image-placeholder">
                            No image
                          </div>
                        )}
                      </div>

                      <h2 className="product-title product-title-2lines">
                        {p.name}
                      </h2>

                      {priceNumber > 0 && !Number.isNaN(priceNumber) && (
                        <div className="product-price">
                          {formattedPrice} ֏
                        </div>
                      )}
                    </Link>
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