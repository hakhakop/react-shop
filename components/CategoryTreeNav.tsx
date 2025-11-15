// wc-store/components/CategoryTreeNav.tsx

import Link from "next/link";
import { getCategoryTree, type CategoryTreeItem } from "../lib/categories";

function CategoryList({
  nodes,
  level = 0,
}: {
  nodes: CategoryTreeItem[];
  level?: number;
}) {
  if (!nodes.length) return null;

  return (
    <ul
      style={{
        listStyle: "none",
        paddingLeft: level === 0 ? 0 : 14,
        margin: 0,
      }}
    >
      {nodes.map((cat) => (
        <li key={cat.id} style={{ marginBottom: 4 }}>
          <Link
            href={`/category/${cat.slug}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: level === 0 ? 14 : 13,
              fontWeight: level === 0 ? 600 : 400,
              color: level === 0 ? "#111827" : "#374151",
              textDecoration: "none",
            }}
          >
            {cat.name}
            {cat.children.length > 0 && (
              <span
                style={{
                  fontSize: 11,
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

          {cat.children.length > 0 && (
            <CategoryList nodes={cat.children} level={level + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default async function CategoryTreeNav() {
  const tree = await getCategoryTree();

  return (
    <nav
      aria-label="Shop categories"
      style={{
        borderRadius: 16,
        border: "1px solid #e5e7eb",
        padding: "12px 12px 14px",
        background: "#ffffff",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 8,
          color: "#0f172a",
        }}
      >
        Shop by category
      </div>

      <CategoryList nodes={tree} />
    </nav>
  );
}