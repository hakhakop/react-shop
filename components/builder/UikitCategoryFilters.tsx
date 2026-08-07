"use client";

import React, { useState, useEffect } from "react";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { Typog } from "@/components/builder/BuilderRenderHelpers";

type Props = {
  block: any;
  isCanvas?: boolean;
};

const DEFAULT_CATEGORIES = [
  { id: "all", name: "All Products", slug: "all" },
  { id: "footwear", name: "Footwear", slug: "footwear" },
  { id: "clothing", name: "Clothing", slug: "clothing" },
  { id: "accessories", name: "Accessories", slug: "accessories" },
  { id: "electronics", name: "Electronics", slug: "electronics" },
];

export default function UikitCategoryFilters({ block }: Props) {
  const rawBlock = (block ?? {}) as any;
  const [categories, setCategories] = useState<any[]>(DEFAULT_CATEGORIES);
  const [activeSlug, setActiveSlug] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    fetch("/api/builder-preview-categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const list = data.categories.map((c: any) => ({
            id: c.id || c.slug,
            name: c.name || c.title,
            slug: c.slug,
          }));
          setCategories([{ id: "all", name: "All Products", slug: "all" }, ...list]);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const hiddenSlugs: string[] = rawBlock.hiddenCategorySlugs ?? [];
  const visibleCategories = categories.filter((c) => !hiddenSlugs.includes(c.slug));

  const align = rawBlock.elementAlign ?? rawBlock.align ?? "center";
  const alignStyle = align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";

  const pillVariant = rawBlock.pillVariant ?? "subtle";
  const pillSize = rawBlock.pillSize ?? "medium";
  const padding = pillSize === "small" ? "4px 10px" : pillSize === "large" ? "8px 18px" : "6px 14px";
  const fontSize = pillSize === "small" ? "11px" : pillSize === "large" ? "14px" : "12px";

  const marginClass = rawBlock.margin && rawBlock.margin !== "none" ? `uk-margin-${rawBlock.margin}` : "";
  const animationClass = rawBlock.animation && rawBlock.animation !== "none" ? `uk-animation-${rawBlock.animation}` : "";
  const visibilityClass = rawBlock.visibility && rawBlock.visibility !== "always" ? `uk-${rawBlock.visibility}` : "";

  return (
    <div
      id={rawBlock.customId || rawBlock.id}
      className={`shop-builder-column-block shop-builder-column-block--category-filters ${marginClass} ${animationClass} ${visibilityClass} ${rawBlock.customClass ?? ""}`.trim()}
    >
      {rawBlock.title && (
        <Typog as="h3" typography={rawBlock.typography} className="uk-margin-small-bottom">
          <BuilderLineBreakText text={rawBlock.title} />
        </Typog>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: alignStyle, gap: "8px" }}>
        {visibleCategories.map((cat) => {
          const isActive = activeSlug === cat.slug;
          let background = "var(--builder-surface-subtle, #f5f5f7)";
          let color = "#333333";
          let border = "1px solid var(--builder-border-color, #e0e0e0)";

          if (isActive) {
            background = "#1e87f0";
            color = "#ffffff";
            border = "1px solid #1e87f0";
          } else if (pillVariant === "outline") {
            background = "transparent";
            border = "1px solid #ccc";
          }

          return (
            <button
              key={cat.id || cat.slug}
              type="button"
              style={{
                padding,
                fontSize,
                fontWeight: 600,
                borderRadius: "20px",
                border,
                background,
                color,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onClick={() => setActiveSlug(cat.slug)}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
