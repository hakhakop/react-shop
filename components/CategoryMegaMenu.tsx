// wc-store/components/CategoryMegaMenu.tsx

import Link from "next/link";
import { getCategoryTree, type CategoryTreeItem } from "../lib/categories";

type Props = {
  onCloseHover?: () => void;
};

function RootCategoryBlock({ cat }: { cat: CategoryTreeItem }) {
  const hasChildren = cat.children && cat.children.length > 0;

  return (
    <div
      style={{
        padding: "10px 10px 12px",
        borderRadius: "12px",
        border: "1px solid #f3f4f6",
        background: "#ffffff",
        boxShadow: "0 6px 20px rgba(15, 23, 42, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <Link
        href={`/category/${cat.slug}`}
        style={{
          fontSize: "14px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#111827",
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span>{cat.name}</span>
        {hasChildren && (
          <span
            style={{
              fontSize: "11px",
              padding: "0 6px",
              borderRadius: 999,
              background: "#f3f4f6",
              color: "#6b7280",
            }}
          >
            {cat.children.length}
          </span>
        )}
      </Link>

      {hasChildren && (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            marginTop: "4px",
            display: "flex",
            flexWrap: "wrap",
            gap: "4px 8px",
          }}
        >
          {cat.children.map((child) => (
            <li key={child.id}>
              <Link
                href={`/category/${child.slug}`}
                style={{
                  fontSize: "12px",
                  color: "#4b5563",
                  textDecoration: "none",
                  padding: "2px 6px",
                  borderRadius: 999,
                  background: "#f9fafb",
                  display: "inline-block",
                  whiteSpace: "nowrap",
                }}
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
export default async function CategoryMegaMenu(_props: Props) {
  const tree = await getCategoryTree();

  if (!tree.length) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "8px",
        borderRadius: "16px",
        border: "1px solid rgba(148, 163, 184, 0.25)",
        background: "rgba(15, 23, 42, 0.96)",
        boxShadow:
          "0 22px 45px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(15, 23, 42, 0.2)",
        padding: "14px 16px 16px",
        minWidth: "540px",
        maxWidth: "720px",
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 500,
          color: "#e5e7eb",
          marginBottom: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>Shop by category</span>
        <Link
          href="/categories"
          style={{
            fontSize: "11px",
            color: "#9ca3af",
            textDecoration: "none",
          }}
        >
          View full category list →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
        }}
      >
        {tree.map((root) => (
          <RootCategoryBlock key={root.id} cat={root} />
        ))}
      </div>
    </div>
  );
}