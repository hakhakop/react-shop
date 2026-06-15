"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import { motion } from "framer-motion";
const MotionDiv = motion.div;
import type { CategoryTreeItem } from "../lib/categories";
import { useProductCategoryFilter } from "./ProductCategoryFilterProvider";

type CategoryBarProps = {
  categoryTree: CategoryTreeItem[];
  countsBySlug: Record<string, number>;
  hiddenCategorySlugs?: string[];
};

export default function CategoryBar({
  categoryTree,
  countsBySlug,
  hiddenCategorySlugs = [],
}: CategoryBarProps) {
  const categoryFilter = useProductCategoryFilter();
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const hiddenSlugs = new Set(hiddenCategorySlugs);
  const visibleCategoryTree = categoryTree
    .filter((root) => !hiddenSlugs.has(root.slug))
    .map((root) => ({
      ...root,
      children: root.children.filter((child) => !hiddenSlugs.has(child.slug)),
    }));

  // Close when clicking outside
  useEffect(() => {
    if (!openSlug) return;

    function handlePointerDown(e: MouseEvent | MouseEventInit | any) {
      if (!barRef.current) return;
      const target = e.target as Node | null;
      if (target && !barRef.current.contains(target)) {
        setOpenSlug(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [openSlug]);

  // Close on Escape
  useEffect(() => {
    if (!openSlug) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenSlug(null);
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [openSlug]);

  const selectCategory = (slug: string, hasChildren = false) => {
    categoryFilter?.setActiveCategorySlug(
      categoryFilter.activeCategorySlug === slug ? null : slug,
    );
    setOpenSlug((current) =>
      hasChildren ? (current === slug ? null : slug) : null,
    );
  };

  return (
    <div className="category-bar" ref={barRef}>
      <MotionDiv
        className="category-pill-wrapper"
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      >
        <button
          type="button"
          className={`category-pill category-pill--all ${
            categoryFilter?.activeCategorySlug ? "" : "is-active"
          }`}
          onClick={() => categoryFilter?.clearActiveCategory()}
          aria-pressed={!categoryFilter?.activeCategorySlug}
        >
          All
        </button>
      </MotionDiv>
      {visibleCategoryTree.map((root) => {
        const hasChildren = root.children && root.children.length > 0;
        const isOpen = openSlug === root.slug;
        const activeSlug = categoryFilter?.activeCategorySlug;
        const isActive = activeSlug === root.slug;
        const hasActiveChild = root.children.some(
          (child) => child.slug === activeSlug,
        );
        const rootCount = countsBySlug[root.slug] ?? 0;

        return (
          <MotionDiv
            key={root.id}
            className={
              "category-pill-wrapper" +
              (hasChildren ? " has-children" : "") +
              (isOpen ? " is-open" : "") +
              (isActive || hasActiveChild ? " is-active" : "")
            }
            whileHover={{ y: -2, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
          >
            <button
              type="button"
              className={`category-pill ${isActive ? "is-active" : ""}`}
              onClick={() => selectCategory(root.slug, hasChildren)}
              aria-pressed={isActive}
            >
              {root.name}
              {rootCount > 0 && (
                <span className="category-pill-count">
                  {rootCount}
                </span>
              )}
            </button>

            {hasChildren && (
              <div className="category-dropdown">
                <div className="category-dropdown-inner">
                  {root.children.map((child) => (
                    <button
                      key={child.id}
                      type="button"
                      className={`category-pill category-pill--child ${
                        activeSlug === child.slug ? "is-active" : ""
                      }`}
                      onClick={() => selectCategory(child.slug)}
                      aria-pressed={activeSlug === child.slug}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </MotionDiv>
        );
      })}
    </div>
  );
}
