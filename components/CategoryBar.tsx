"use client";

import { useState, useEffect, useRef, MouseEvent } from "react";
import Link from "next/link";
import type { CategoryTreeItem } from "../lib/categories";

type CategoryBarProps = {
  categoryTree: CategoryTreeItem[];
  countsBySlug: Record<string, number>;
};

export default function CategoryBar({
  categoryTree,
  countsBySlug,
}: CategoryBarProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);

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

  const handleRootClick = (
    e: MouseEvent<HTMLAnchorElement>,
    slug: string,
    hasChildren: boolean
  ) => {
    if (!hasChildren) {
      // normal navigation
      setOpenSlug(null);
      return;
    }

    // Toggle dropdown instead of navigating
    e.preventDefault();
    setOpenSlug((prev) => (prev === slug ? null : slug));
  };

  return (
    <div className="category-bar" ref={barRef}>
      {categoryTree.map((root) => {
        const hasChildren = root.children && root.children.length > 0;
        const isOpen = openSlug === root.slug;
        const rootCount = countsBySlug[root.slug] ?? 0;

        return (
          <div
            key={root.id}
            className={
              "category-pill-wrapper" +
              (hasChildren ? " has-children" : "") +
              (isOpen ? " is-open" : "")
            }
          >
            <Link
              href={`/category/${root.slug}`}
              className="category-pill"
              onClick={(e) => handleRootClick(e, root.slug, hasChildren)}
            >
              {root.name}
              {rootCount > 0 && (
                <span className="category-pill-count">
                  {rootCount}
                </span>
              )}
            </Link>

            {hasChildren && (
              <div className="category-dropdown">
                <div className="category-dropdown-inner">
                  {root.children.map((child) => (
                    <Link
                      key={child.id}
                      href={`/category/${child.slug}`}
                      className="category-pill category-pill--child"
                      onClick={() => setOpenSlug(null)}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}