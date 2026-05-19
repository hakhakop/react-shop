// wc-store/components/CategoryMegaMenu.tsx

import Link from "next/link";
import { getCategoryTree, type CategoryTreeItem } from "../lib/categories";

function RootCategoryBlock({ cat }: { cat: CategoryTreeItem }) {
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div className="category-mega-card">
      <Link
        href={`/category/${cat.slug}`}
        className="category-mega-root-link"
      >
        <span>{cat.name}</span>
        {hasChildren && (
          <span className="category-mega-count">
            {cat.children.length}
          </span>
        )}
      </Link>

      {hasChildren && (
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
export default async function CategoryMegaMenu() {
  const tree = await getCategoryTree();

  if (!tree.length) {
    return null;
  }

  return (
    <div className="category-mega-menu">
      <div className="category-mega-header">
        <span>Shop by category</span>
        <Link
          href="/categories"
          className="category-mega-all-link"
        >
          View full category list
        </Link>
      </div>

      <div className="category-mega-grid">
        {tree.map((root) => (
          <RootCategoryBlock key={root.id} cat={root} />
        ))}
      </div>
    </div>
  );
}
