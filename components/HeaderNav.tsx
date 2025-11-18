"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuItem } from "../lib/navigation";

interface HeaderNavProps {
  items: MenuItem[];
}

/**
 * Normalize a URL or path into a clean pathname for matching.
 * - Handles full WP URLs (https://cms.webpages.am/shop/)
 * - Strips trailing slashes
 * - Ensures root is "/"
 */
function normalizePath(input?: string | null): string {
  if (!input) return "/";

  let candidate = input;

  try {
    // If it's an absolute URL (common with WP menus), parse it against a dummy base
    const url = new URL(input, "https://dummy.local");
    candidate = url.pathname || "/";
  } catch {
    // Otherwise assume it's already a pathname
    candidate = input;
  }

  if (!candidate.startsWith("/")) return "/";

  const trimmed = candidate.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export default function HeaderNav({ items }: HeaderNavProps) {
  const rawPathname = usePathname();
  const currentPath = normalizePath(rawPathname || "/");

  return (
    <nav className="site-header-nav">
      {items.map((item) => {
        const href = item.path || item.url || "#";

        // Normalize the item's path for comparison (works with full WP URLs or app-relative paths)
        const itemPath =
          href === "#"
            ? "#"
            : normalizePath(item.path || item.url || href);

        const isActive =
          itemPath !== "#" &&
          (currentPath === itemPath ||
            currentPath.startsWith(itemPath + "/"));

        return (
          <Link
            key={item.id}
            href={href}
            className={`site-header-nav-link${
              isActive ? " is-active" : ""
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}