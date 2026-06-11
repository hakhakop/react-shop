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
import type { CategoryTreeItem } from "../lib/categories";
import type { ProductNode } from "../lib/products";

type Props = {
  products: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  typography?: any;
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
  hiddenCategorySlugs?: string[] | null;
  pagination?: {
    enabled: boolean;
    perPage: number;
    mode: "pageNumbers" | "loadMore" | "infinite";
    infiniteScroll?: boolean;
    style?: "standard" | "solid" | "minimal" | "rounded";
  } | null;
};

type CategoryFilterNode = {
  slug: string;
  label: string;
  depth: number;
  ancestors: string[];
  children: CategoryFilterNode[];
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

const InfiniteScrollTrigger = ({
  onLoadMore,
  hasMore,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
}) => {
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTrigger = triggerRef.current;
    if (currentTrigger) {
      observer.observe(currentTrigger);
    }

    return () => {
      if (currentTrigger) {
        observer.unobserve(currentTrigger);
      }
    };
  }, [onLoadMore, hasMore]);

  return (
    <div
      ref={triggerRef}
      style={{
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        marginTop: "20px",
      }}
    >
      {hasMore && (
        <div className="animate-pulse text-sm text-slate-400">
          Loading more products...
        </div>
      )}
    </div>
  );
};

export default function CategoryWithFilters({
  products,
  categoryTree = [],
  activeCategorySlug,
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
  hiddenCategorySlugs,
  typography,
  pagination,
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
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    activeCategorySlug ? [activeCategorySlug] : [],
  );
  const [openCategorySlugs, setOpenCategorySlugs] = useState<Set<string>>(
    () => new Set(activeCategorySlug ? [activeCategorySlug] : []),
  );
  const [openTopFacet, setOpenTopFacet] = useState<string | null>(null);
  const topFiltersRef = useRef<HTMLDivElement | null>(null);

  // simple client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const isPaginationEnabled = pagination ? pagination.enabled : true;
  const paginationPerPage = pagination?.perPage ?? pageSize ?? 12;
  const normalizedPageSize =
    typeof paginationPerPage === "number" && paginationPerPage >= 4 && paginationPerPage <= 48
      ? Math.round(paginationPerPage)
      : 12;

  const paginationMode = pagination?.mode ?? "pageNumbers";
  const paginationStyle = pagination?.style ?? "standard";

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
    cardPreset === "luxury" ||
    cardPreset === "default" ||
    cardPreset === "secondary" ||
    cardPreset === "dark" ||
    cardPreset === "light" ||
    cardPreset === "clean-shadow" ||
    cardPreset === "flat-dark" ||
    cardPreset === "flat-white"
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

  function typographyProps(typ?: any) {
    if (!typ) return { className: undefined, style: undefined };
    const classes: string[] = [];
    const style: CSSProperties = {};

    function isClassLike(value?: string) {
      return typeof value === "string" && /^[a-z-]+[0-9a-z-]*$/.test(value);
    }

    if (typ.fontSize) {
      if (isClassLike(typ.fontSize) && typ.fontSize.startsWith("text-")) {
        classes.push(typ.fontSize);
      } else {
        style.fontSize = typ.fontSize as any;
      }
    }

    if (typ.fontWeight) {
      if (isClassLike(String(typ.fontWeight)) && String(typ.fontWeight).startsWith("font-")) {
        classes.push(String(typ.fontWeight));
      } else {
        style.fontWeight = typ.fontWeight as any;
      }
    }

    if (typ.lineHeight) {
      if (isClassLike(typ.lineHeight) && typ.lineHeight.startsWith("leading-")) {
        classes.push(typ.lineHeight);
      } else {
        style.lineHeight = typ.lineHeight as any;
      }
    }

    if (typ.color) {
      if (isClassLike(typ.color) && typ.color.startsWith("text-")) {
        classes.push(typ.color);
      } else {
        style.color = typ.color as any;
      }
    }

    if (typ.textAlign) {
      const map: Record<string, string> = {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify",
      };
      classes.push(map[typ.textAlign] ?? "");
    }

    return { className: classes.filter(Boolean).join(" ") || undefined, style: Object.keys(style).length ? style : undefined };
  }

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

  const categoryOptions = useMemo(() => {
    const hiddenSlugs = new Set(hiddenCategorySlugs ?? []);
    const map = new Map<string, string>();

    for (const product of products) {
      for (const category of product.productCategories?.nodes ?? []) {
        if (!category.slug || hiddenSlugs.has(category.slug)) continue;
        map.set(category.slug, category.name || category.slug);
      }
    }

    return Array.from(map.entries())
      .map(([slug, label]) => ({ slug, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [hiddenCategorySlugs, products]);
  const categoryOptionSlugs = useMemo(
    () => new Set(categoryOptions.map((category) => category.slug)),
    [categoryOptions],
  );
  const categoryFilterTree = useMemo<CategoryFilterNode[]>(() => {
    if (categoryTree.length === 0) {
      return categoryOptions.map((category) => ({
        slug: category.slug,
        label: category.label,
        depth: 0,
        ancestors: [],
        children: [],
      }));
    }

    const hiddenSlugs = new Set(hiddenCategorySlugs ?? []);
    const buildNodes = (
      nodes: CategoryTreeItem[],
      depth = 0,
      ancestors: string[] = [],
    ): CategoryFilterNode[] =>
      nodes.flatMap((category) => {
        if (hiddenSlugs.has(category.slug)) return [];
        const children = buildNodes(category.children, depth + 1, [
          ...ancestors,
          category.slug,
        ]);
        const shouldInclude =
          categoryOptionSlugs.has(category.slug) || children.length > 0;
        if (!shouldInclude) return [];
        return [
          {
            slug: category.slug,
            label: category.name,
            depth,
            ancestors,
            children,
          },
        ];
      });

    return buildNodes(categoryTree);
  }, [categoryOptionSlugs, categoryOptions, categoryTree, hiddenCategorySlugs]);
  const categoryDescendantsBySlug = useMemo(() => {
    const map = new Map<string, string[]>();
    const collect = (node: CategoryFilterNode): string[] => {
      const descendants = node.children.flatMap((child) => [
        child.slug,
        ...collect(child),
      ]);
      map.set(node.slug, descendants);
      return descendants;
    };
    categoryFilterTree.forEach(collect);
    return map;
  }, [categoryFilterTree]);

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

  function toggleCategory(slug: string) {
    setCurrentPage(1);
    setSelectedCategories((current) =>
      current.includes(slug)
        ? current.filter((item) => item !== slug)
        : [...current, slug],
    );
  }

  function toggleCategoryGroup(slug: string) {
    setOpenCategorySlugs((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  function isCategoryActive(node: CategoryFilterNode) {
    if (selectedCategories.includes(node.slug)) return true;
    return node.ancestors.some((ancestor) => selectedCategories.includes(ancestor));
  }

  function categoryHasActiveDescendant(node: CategoryFilterNode): boolean {
    return node.children.some(
      (child) => isCategoryActive(child) || categoryHasActiveDescendant(child),
    );
  }

  function renderCategoryTree(nodes: CategoryFilterNode[], mode: "top" | "side") {
    return nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isDirectSelected = selectedCategories.includes(node.slug);
      const isOpen =
        openCategorySlugs.has(node.slug) ||
        isDirectSelected ||
        categoryHasActiveDescendant(node);
      const isActive = isCategoryActive(node);

      return (
        <div
          key={node.slug}
          className={`shop-category-filter-node is-depth-${node.depth} ${
            hasChildren ? "has-children" : ""
          } ${isOpen ? "is-open" : ""}`}
        >
          <div
            className="shop-category-filter-row"
            style={
              {
                "--category-filter-depth": node.depth,
              } as CSSProperties
            }
          >
            {hasChildren && (
              <button
                type="button"
                className="shop-category-filter-toggle"
                onClick={() => toggleCategoryGroup(node.slug)}
                aria-label={`${isOpen ? "Collapse" : "Expand"} ${node.label}`}
                aria-expanded={isOpen}
              >
                <ChevronRight size={14} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              className={`${isActive ? "is-selected" : ""} ${
                isActive && !isDirectSelected ? "is-parent-selected" : ""
              }`}
              onClick={() => toggleCategory(node.slug)}
            >
              {node.label}
            </button>
          </div>
          {hasChildren && isOpen && (
            <div className={`shop-category-filter-children is-${mode}`}>
              {renderCategoryTree(node.children, mode)}
            </div>
          )}
        </div>
      );
    });
  }

  function resetFilters() {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("default");
    setSelectedAttributes({});
    setSelectedCategories([]);
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

    if (selectedCategories.length > 0) {
      items = items.filter((product) => {
        const productCategorySlugs =
          product.productCategories?.nodes.map((category) => category.slug) ??
          [];
        return selectedCategories.some((slug) => {
          const acceptedSlugs = [
            slug,
            ...(categoryDescendantsBySlug.get(slug) ?? []),
          ];
          return acceptedSlugs.some((acceptedSlug) =>
            productCategorySlugs.includes(acceptedSlug),
          );
        });
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
    categoryDescendantsBySlug,
    selectedCategories,
  ]);

  // pagination derived from filtered products
  const total = filteredProducts.length;
  const isPaginationActive = isPaginationEnabled && total > 0;
  const pageCount = isPaginationActive ? Math.max(1, Math.ceil(total / normalizedPageSize)) : 1;
  const safePage = isPaginationActive ? Math.min(currentPage, pageCount) : 1;

  // Slice products based on mode
  const displayStart = (paginationMode === "loadMore" || paginationMode === "infinite") ? 0 : (safePage - 1) * normalizedPageSize;
  const end = (paginationMode === "loadMore" || paginationMode === "infinite")
    ? Math.min(currentPage * normalizedPageSize, total)
    : displayStart + normalizedPageSize;
  
  const paginatedProducts = isPaginationActive ? filteredProducts.slice(displayStart, end) : filteredProducts;

  function goToPage(page: number) {
    const p = Math.min(Math.max(1, page), pageCount);
    setCurrentPage(p);
  }

  const showingFrom = total === 0 ? 0 : displayStart + 1;
  const showingTo = Math.min(end, total);
  const selectedAttributeCount = Object.values(selectedAttributes).reduce(
    (sum, values) => sum + values.length,
    0,
  );
  const activeFilterCount =
    selectedAttributeCount +
    selectedCategories.length +
    (searchTerm.trim() ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);
  return (
    <div
      data-view-mode={viewMode}
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
            {categoryFilterTree.length > 0 && (
              <div
                className={`shop-top-attribute-filter ${
                  openTopFacet === "__categories" ? "is-open" : ""
                }`}
              >
                <button
                  type="button"
                  className="shop-top-attribute-trigger"
                  onClick={() =>
                    setOpenTopFacet((current) =>
                      current === "__categories" ? null : "__categories",
                    )
                  }
                >
                  <span>Categories</span>
                  {selectedCategories.length > 0 && (
                    <strong>{selectedCategories.length}</strong>
                  )}
                </button>

                <div className="shop-top-attribute-dropdown shop-category-filter-menu">
                  {renderCategoryTree(categoryFilterTree, "top")}
                </div>
              </div>
            )}

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

            {categoryFilterTree.length > 0 && (
              <div className="shop-filter-group">
                <label>Categories</label>
                <div className="shop-filter-chip-row shop-category-filter-tree">
                  {renderCategoryTree(categoryFilterTree, "side")}
                </div>
              </div>
            )}

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
                      <Link href={`/product/${p.slug}`} className="product-card-title-link">
                          {(() => {
                          const tp = typographyProps((typography as any)?.title ?? typography);
                          return (
                            <h2
                              className={["product-title product-title-2lines", tp.className]
                                .filter(Boolean)
                                .join(" ")}
                              style={tp.style}
                            >
                              {p.name}
                            </h2>
                          );
                        })()}
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
            {isPaginationEnabled && pageCount > 1 && (
              <>
                {paginationMode === "pageNumbers" && (
                  <div className={`shop-pagination shop-pagination--${paginationStyle}`}>
                    <button
                      type="button"
                      className="shop-pagination-nav"
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
                          className={`shop-pagination-number ${active ? "is-active" : ""}`}
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      className="shop-pagination-nav"
                      onClick={() => goToPage(safePage + 1)}
                      disabled={safePage === pageCount}
                    >
                      Next
                      <ChevronRight size={15} aria-hidden="true" />
                    </button>
                  </div>
                )}

                {paginationMode === "loadMore" && safePage < pageCount && (
                  <div className={`shop-load-more-container shop-load-more-container--${paginationStyle}`}>
                    <button
                      type="button"
                      onClick={() => goToPage(safePage + 1)}
                    >
                      Load More
                    </button>
                  </div>
                )}

                {paginationMode === "infinite" && safePage < pageCount && (
                  <InfiniteScrollTrigger
                    onLoadMore={() => goToPage(safePage + 1)}
                    hasMore={safePage < pageCount}
                  />
                )}
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
