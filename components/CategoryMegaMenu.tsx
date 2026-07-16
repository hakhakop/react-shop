// wc-store/components/CategoryMegaMenu.tsx

import Link from "next/link";
import { getCategoryTree, type CategoryTreeItem } from "../lib/categories";
import type { SaaSWebsite } from "@/lib/websites";
import { ChevronRight, ArrowUpRight } from "lucide-react";

function RootCategoryBlock({
  cat,
  showCounts,
  showHierarchy,
}: {
  cat: CategoryTreeItem;
  showCounts: boolean;
  showHierarchy: boolean;
}) {
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div className="category-mega-card">
      <Link
        href={`/category/${cat.slug}`}
        className="category-mega-root-link"
      >
        <span>{cat.name}</span>
        {hasChildren && showCounts && (
          <span className="category-mega-count">
            {cat.children.length}
          </span>
        )}
      </Link>

      {hasChildren && showHierarchy && (
        <ul className="category-mega-children">
          {cat.children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/category/${child.slug}`}
                className="category-mega-child-link"
              >
                {child.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Server component that renders a "mega menu" panel
 * with your WooCommerce category hierarchy.
 *
 * Meant to be placed inside an absolutely-positioned dropdown
 * in the header.
 */
export default async function CategoryMegaMenu({
  website,
  showAllCategories = true,
  showCounts = true,
  showHierarchy = true,
}: {
  website?: SaaSWebsite | null;
  showAllCategories?: boolean;
  showCounts?: boolean;
  showHierarchy?: boolean;
}) {
  if (website && website.type !== "e-commerce") return null;

  const tree = await getCategoryTree({ website }).catch(() => []);

  if (!tree.length) {
    return null;
  }

  return (
    <div className="category-mega-menu">
      {/* Desktop version */}
      <div className="category-mega-menu-desktop">
        <div className="category-mega-header">
          <span>Shop by category</span>
          {showAllCategories ? (
            <Link href="/categories" className="category-mega-all-link">
              View full category list
            </Link>
          ) : null}
        </div>

        <div className="category-mega-grid">
          {tree.map((root) => (
            <RootCategoryBlock
              key={root.id}
              cat={root}
              showCounts={showCounts}
              showHierarchy={showHierarchy}
            />
          ))}
        </div>
      </div>

      {/* Mobile version */}
      <div className="category-mega-menu-mobile">
        <div className="category-mobile-list">
          {tree.map((root) => {
            const hasChildren = root.children && root.children.length > 0;
            return (
              <Link
                key={root.id}
                href={`/category/${root.slug}`}
                className="category-mobile-row"
              >
                <div className="category-mobile-row-left">
                  <span className="category-mobile-name">{root.name}</span>
                  {hasChildren && showCounts && (
                    <span className="category-mobile-count-badge">
                      {root.children.length}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} className="category-mobile-chevron" />
              </Link>
            );
          })}
          {showAllCategories && (
            <Link href="/categories" className="category-mobile-row category-mobile-row--all">
              <span className="category-mobile-name">View full category list</span>
              <ArrowUpRight size={16} className="category-mobile-external-icon" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
