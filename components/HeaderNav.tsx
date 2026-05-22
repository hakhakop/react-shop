"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
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

function getDashboardEditHref(href: string, currentPath: string): string {
  if (currentPath !== "/dashboard" || href === "#") return href;

  const itemPath = normalizePath(href);
  const reservedPaths = new Set([
    "/cart",
    "/categories",
    "/checkout",
    "/dashboard",
    "/my-account",
    "/product",
    "/search",
    "/wishlist",
  ]);

  if (itemPath === "/") return "/dashboard?page=home";
  if (itemPath === "/shop") return "/dashboard?page=shop";
  if (itemPath === "/client") return "/dashboard?page=client";
  if (!reservedPaths.has(itemPath) && /^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(itemPath)) {
    return `/dashboard?page=page:${itemPath.slice(1)}`;
  }

  return href;
}

function itemHasActiveDescendant(
  item: MenuItem,
  currentPath: string
): boolean {
  const href = item.path || item.url || "#";
  const itemPath =
    href === "#" ? "#" : normalizePath(item.path || item.url || href);
  const isActive =
    itemPath !== "#" &&
    (currentPath === itemPath || currentPath.startsWith(itemPath + "/"));

  if (isActive) return true;

  return (item.children ?? []).some((child) =>
    itemHasActiveDescendant(child, currentPath)
  );
}

function renderMenuItems(
  items: MenuItem[],
  currentPath: string,
  level = 0
): ReactNode {
  return items.map((item) => {
    const href = item.path || item.url || "#";
    const dashboardHref = getDashboardEditHref(href, currentPath);
    const itemPath =
      href === "#" ? "#" : normalizePath(item.path || item.url || href);
    const isActive =
      itemPath !== "#" &&
      (currentPath === itemPath || currentPath.startsWith(itemPath + "/"));
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const isBranchActive = itemHasActiveDescendant(item, currentPath);

    return (
      <div
        key={item.id}
        className={`site-header-nav-item${
          hasChildren ? " has-children" : ""
        }${isBranchActive ? " is-active" : ""}`}
      >
        <Link
          href={dashboardHref}
          className={`site-header-nav-link${
            level > 0 ? " site-header-nav-submenu-link" : ""
          }${isActive ? " is-active" : ""}`}
          aria-current={isActive ? "page" : undefined}
          aria-haspopup={hasChildren ? "menu" : undefined}
        >
          {item.label}
        </Link>

        {hasChildren && (
          <div className="site-header-nav-submenu" role="menu">
            {renderMenuItems(children, currentPath, level + 1)}
          </div>
        )}
      </div>
    );
  });
}

export default function HeaderNav({ items }: HeaderNavProps) {
  const rawPathname = usePathname();
  const currentPath = normalizePath(rawPathname || "/");

  return (
    <nav className="site-header-nav">
      {renderMenuItems(items, currentPath)}
    </nav>
  );
}
