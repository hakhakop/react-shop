"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useWishlist } from "./WishlistProvider";
import { useCart } from "./CartProvider";
import { useSearch } from "./SearchProvider";
import ThemeToggle from "./ThemeToggle";
import HeaderAccountButton from "./HeaderAccountButton";
import type { MenuItem } from "../lib/navigation";
import {
  getScopedWebsiteIdFromPath,
  getPreviewActivePathForPageKey,
  resolveScopedBuilderHref,
  resolveScopedPreviewHref,
  type ScopedPreviewPage,
} from "../lib/scopedPreviewLinks";
import type { BuilderLayoutKey } from "../lib/builderLayouts";

interface HeaderNavProps {
  items: MenuItem[];
  presentationById?: Record<string, MenuPresentationSettings>;
  categories?: ReactNode;
  serviceHomepageMode?: boolean;
  scopedPreviewWebsiteId?: string;
  activePageKey?: BuilderLayoutKey;
  scopedPreviewPages?: ScopedPreviewPage[];
  scopedLinkMode?: "builder" | "preview";
}

function handleNavMouseMove(e: MouseEvent<HTMLAnchorElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = ((e.clientX - rect.left) / rect.width) * 100;
  e.currentTarget.style.setProperty("--gradient-pct", `${x}%`);
}

function handleNavMouseLeave(e: MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.style.removeProperty("--gradient-pct");
}

type MenuPresentationSettings = {
  showHeading: boolean;
  icon: string | null;
  submenuLayout: "list" | "grid" | "mega";
  submenuColumns: number;
  badgeText: string | null;
};

const UIKIT_ICON_ALIASES: Record<string, string> = {
  sparkles: "star",
  shield: "lock",
  truck: "cart",
};

const UIKIT_ICON_INNER_HTML: Record<string, string> = {
  home: `<polygon points="18.65 11.35 10 2.71 1.35 11.35 0.65 10.65 10 1.29 19.35 10.65" /> <polygon points="15 4 18 4 18 7 17 7 17 5 15 5" /> <polygon points="3 11 4 11 4 18 7 18 7 12 12 12 12 18 16 18 16 11 17 11 17 19 11 19 11 13 8 13 8 19 3 19" />`,
  search: `<circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z" />`,
  menu: `<rect x="2" y="4" width="16" height="1" /> <rect x="2" y="9" width="16" height="1" /> <rect x="2" y="14" width="16" height="1" />`,
  grid: `<rect x="2" y="2" width="3" height="3" /> <rect x="8" y="2" width="3" height="3" /> <rect x="14" y="2" width="3" height="3" /> <rect x="2" y="8" width="3" height="3" /> <rect x="8" y="8" width="3" height="3" /> <rect x="14" y="8" width="3" height="3" /> <rect x="2" y="14" width="3" height="3" /> <rect x="8" y="14" width="3" height="3" /> <rect x="14" y="14" width="3" height="3" />`,
  list: `<rect x="6" y="4" width="12" height="1" /> <rect x="6" y="9" width="12" height="1" /> <rect x="6" y="14" width="12" height="1" /> <rect x="2" y="4" width="2" height="1" /> <rect x="2" y="9" width="2" height="1" /> <rect x="2" y="14" width="2" height="1" />`,
  plus: `<rect x="9" y="1" width="1" height="17" /> <rect x="1" y="9" width="17" height="1" />`,
  check: `<polyline fill="none" stroke="#000" stroke-width="1.1" points="4,10 8,15 17,4" />`,
  close: `<path fill="none" stroke="#000" stroke-width="1.06" d="M16,16 L4,4" /> <path fill="none" stroke="#000" stroke-width="1.06" d="M16,4 L4,16" />`,
  cart: `<circle cx="7.3" cy="17.3" r="1.4" /> <circle cx="13.3" cy="17.3" r="1.4" /> <polyline fill="none" stroke="#000" points="0 2 3.2 4 5.3 12.5 16 12.5 18 6.5 8 6.5" />`,
  bag: `<path fill="none" stroke="#000" d="M7.5,7.5V4A2.48,2.48,0,0,1,10,1.5,2.54,2.54,0,0,1,12.5,4V7.5" /> <polygon fill="none" stroke="#000" points="16.5 7.5 3.5 7.5 2.5 18.5 17.5 18.5 16.5 7.5" />`,
  heart: `<path fill="none" stroke="#000" stroke-width="1.03" d="M10,4 C10,4 8.1,2 5.74,2 C3.38,2 1,3.55 1,6.73 C1,8.84 2.67,10.44 2.67,10.44 L10,18 L17.33,10.44 C17.33,10.44 19,8.84 19,6.73 C19,3.55 16.62,2 14.26,2 C11.9,2 10,4 10,4 L10,4 Z" />`,
  user: `<circle fill="none" stroke="#000" stroke-width="1.1" cx="9.9" cy="6.4" r="4.4" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M1.5,19 C2.3,14.5 5.8,11.2 10,11.2 C14.2,11.2 17.7,14.6 18.5,19.2" />`,
  settings: `<ellipse fill="none" stroke="#000" cx="6.11" cy="3.55" rx="2.11" ry="2.15" /> <ellipse fill="none" stroke="#000" cx="6.11" cy="15.55" rx="2.11" ry="2.15" /> <circle fill="none" stroke="#000" cx="13.15" cy="9.55" r="2.15" /> <rect x="1" y="3" width="3" height="1" /> <rect x="10" y="3" width="8" height="1" /> <rect x="1" y="9" width="8" height="1" /> <rect x="15" y="9" width="3" height="1" /> <rect x="1" y="15" width="3" height="1" /> <rect x="10" y="15" width="8" height="1" />`,
  star: `<polygon fill="none" stroke="#000" stroke-width="1.01" points="10 2 12.63 7.27 18.5 8.12 14.25 12.22 15.25 18 10 15.27 4.75 18 5.75 12.22 1.5 8.12 7.37 7.27" />`,
  tag: `<path fill="none" stroke="#000" stroke-width="1.1" d="M17.5,3.71 L17.5,7.72 C17.5,7.96 17.4,8.2 17.21,8.39 L8.39,17.2 C7.99,17.6 7.33,17.6 6.93,17.2 L2.8,13.07 C2.4,12.67 2.4,12.01 2.8,11.61 L11.61,2.8 C11.81,2.6 12.08,2.5 12.34,2.5 L16.19,2.5 C16.52,2.5 16.86,2.63 17.11,2.88 C17.35,3.11 17.48,3.4 17.5,3.71 L17.5,3.71 Z" /> <circle cx="14" cy="6" r="1" />`,
  mail: `<polyline fill="none" stroke="#000" points="1.4,6.5 10,11 18.6,6.5" /> <path d="M 1,4 1,16 19,16 19,4 1,4 Z M 18,15 2,15 2,5 18,5 18,15 Z" />`,
  phone: `<path fill="none" stroke="#000" d="M15.5,17 C15.5,17.8 14.8,18.5 14,18.5 L7,18.5 C6.2,18.5 5.5,17.8 5.5,17 L5.5,3 C5.5,2.2 6.2,1.5 7,1.5 L14,1.5 C14.8,1.5 15.5,2.2 15.5,3 L15.5,17 L15.5,17 L15.5,17 Z" /> <circle cx="10.5" cy="16.5" r="0.8" />`,
  lock: `<rect fill="none" stroke="#000" height="10" width="13" y="8.5" x="3.5" /> <path fill="none" stroke="#000" d="M6.5,8 L6.5,4.88 C6.5,3.01 8.07,1.5 10,1.5 C11.93,1.5 13.5,3.01 13.5,4.88 L13.5,8" />`,
  world: `<path fill="none" stroke="#000" d="M1,10.5 L19,10.5" /> <path fill="none" stroke="#000" d="M2.35,15.5 L17.65,15.5" /> <path fill="none" stroke="#000" d="M2.35,5.5 L17.523,5.5" /> <path fill="none" stroke="#000" d="M10,19.46 L9.98,19.46 C7.31,17.33 5.61,14.141 5.61,10.58 C5.61,7.02 7.33,3.83 10,1.7 C10.01,1.7 9.99,1.7 10,1.7 L10,1.7 C12.67,3.83 14.4,7.02 14.4,10.58 C14.4,14.141 12.67,17.33 10,19.46 L10,19.46 L10,19.46 L10,19.46 Z" /> <circle fill="none" stroke="#000" cx="10" cy="10.5" r="9" />`,
  image: `<circle cx="16.1" cy="6.1" r="1.1" /> <rect fill="none" stroke="#000" x="0.5" y="2.5" width="19" height="15" /> <polyline fill="none" stroke="#000" stroke-width="1.01" points="4,13 8,9 13,14" /> <polyline fill="none" stroke="#000" stroke-width="1.01" points="11,12 12.5,10.5 16,14" />`,
  folder: `<polygon fill="none" stroke="#000" points="9.5 5.5 8.5 3.5 1.5 3.5 1.5 16.5 18.5 16.5 18.5 5.5" />`,
  warning: `<circle cx="10" cy="14" r="1" /> <circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9" /> <path d="M10.97,7.72 C10.85,9.54 10.56,11.29 10.56,11.29 C10.51,11.87 10.27,12 9.99,12 C9.69,12 9.49,11.87 9.43,11.29 C9.43,11.29 9.16,9.54 9.03,7.72 C8.96,6.54 9.03,6 9.03,6 C9.03,5.45 9.46,5.02 9.99,5 C10.53,5.01 10.97,5.44 10.97,6 C10.97,6 11.04,6.54 10.97,7.72 L10.97,7.72 Z" />`,
  info: `<path d="M12.13,11.59 C11.97,12.84 10.35,14.12 9.1,14.16 C6.17,14.2 9.89,9.46 8.74,8.37 C9.3,8.16 10.62,7.83 10.62,8.81 C10.62,9.63 10.12,10.55 9.88,11.32 C8.66,15.16 12.13,11.15 12.14,11.18 C12.16,11.21 12.16,11.35 12.13,11.59 C12.08,11.95 12.16,11.35 12.13,11.59 L12.13,11.59 Z M11.56,5.67 C11.56,6.67 9.36,7.15 9.36,6.03 C9.36,5 11.56,4.54 11.56,5.67 L11.56,5.67 Z" /> <circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9" />`,
  "arrow-right": `<line fill="none" stroke="#000" x1="3.47" y1="10" x2="15.47" y2="10" /> <polyline fill="none" stroke="#000" points="11.98 13.84 15.82 10 11.98 6.16" />`,
  "chevron-right": `<polyline fill="none" stroke="#000" stroke-width="1.03" points="7 4 13 10 7 16" />`,
  "chevron-down": `<polyline fill="none" stroke="#000" stroke-width="1.03" points="16 7 10 13 4 7" />`,
  refresh: `<path fill="none" stroke="#000" stroke-width="1.1" d="M17.08,11.15 C17.09,11.31 17.1,11.47 17.1,11.64 C17.1,15.53 13.94,18.69 10.05,18.69 C6.16,18.68 3,15.53 3,11.63 C3,7.74 6.16,4.58 10.05,4.58 C10.9,4.58 11.71,4.73 12.46,5" /> <polyline fill="none" stroke="#000" points="9.9 2 12.79 4.89 9.79 7.9" />`,
  calendar: `<path d="M 2,3 2,17 18,17 18,3 2,3 Z M 17,16 3,16 3,8 17,8 17,16 Z M 17,7 3,7 3,4 17,4 17,7 Z" /> <rect width="1" height="3" x="6" y="2" /> <rect width="1" height="3" x="13" y="2" />`,
  clock: `<circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9" /> <rect x="9" y="4" width="1" height="7" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M13.018,14.197 L9.445,10.625" />`,
  download: `<line fill="none" stroke="#000" x1="10" y1="2.09" x2="10" y2="14.09" /> <polyline fill="none" stroke="#000" points="6.16 10.62 10 14.46 13.84 10.62" /> <line stroke="#000" x1="3.5" y1="17.5" x2="16.5" y2="17.5" />`,
  upload: `<line fill="none" stroke="#000" x1="10" y1="15.17" x2="10" y2="3.17" /> <polyline fill="none" stroke="#000" points="13.84 6.63 10 2.8 6.16 6.64" /> <line fill="#fff" stroke="#000" x1="3.5" y1="17.5" x2="16.5" y2="17.5" />`,
  pencil: `<path fill="none" stroke="#000" d="M17.25,6.01 L7.12,16.1 L3.82,17.2 L5.02,13.9 L15.12,3.88 C15.71,3.29 16.66,3.29 17.25,3.88 C17.83,4.47 17.83,5.42 17.25,6.01 L17.25,6.01 Z" /> <path fill="none" stroke="#000" d="M15.98,7.268 L13.851,5.148" />`,
  trash: `<polyline fill="none" stroke="#000" points="6.5 3 6.5 1.5 13.5 1.5 13.5 3" /> <polyline fill="none" stroke="#000" points="4.5 4 4.5 18.5 15.5 18.5 15.5 4" /> <rect x="8" y="7" width="1" height="9" /> <rect x="11" y="7" width="1" height="9" /> <rect x="2" y="3" width="16" height="1" />`,
  bookmark: `<polygon fill="none" stroke="#000" points="5.5 1.5 15.5 1.5 15.5 17.5 10.5 12.5 5.5 17.5" />`,
  link: `<path fill="none" stroke="#000" stroke-width="1.1" d="M10.625,12.375 L7.525,15.475 C6.825,16.175 5.925,16.175 5.225,15.475 L4.525,14.775 C3.825,14.074 3.825,13.175 4.525,12.475 L7.625,9.375" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M9.325,7.375 L12.425,4.275 C13.125,3.575 14.025,3.575 14.724,4.275 L15.425,4.975 C16.125,5.675 16.125,6.575 15.425,7.275 L12.325,10.375" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M7.925,11.875 L11.925,7.975" />`,
  "sign-in": `<polygon points="7 2 17 2 17 17 7 17 7 16 16 16 16 3 7 3 7 2" /> <line stroke="#000" x1="3" y1="9.5" x2="12" y2="9.5" /> <polyline fill="none" stroke="#000" points="9.2 6.33 12.37 9.5 9.2 12.67" />`,
  "sign-out": `<polygon points="13 2 3 2 3 17 13 17 13 16 4 16 4 3 13 3 13 2" /> <line stroke="#000" x1="7.96" y1="9.49" x2="16.96" y2="9.49" /> <polyline fill="none" stroke="#000" points="14.17 6.31 17.35 9.48 14.17 12.66" />`,
};

function resolveUIKitIconName(icon: string | null): string | null {
  if (!icon) return null;
  const normalized = icon.trim();
  if (normalized.length === 0) return null;
  return UIKIT_ICON_INNER_HTML[normalized]
    ? normalized
    : UIKIT_ICON_ALIASES[normalized] ?? null;
}

function renderUIKitIcon(icon: string | null, size = 14) {
  const iconName = resolveUIKitIconName(icon);
  const innerHtml = iconName ? UIKIT_ICON_INNER_HTML[iconName] : null;

  if (!innerHtml) return null;

  return (
    <svg
      className="uikit-icon"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      stroke="currentColor"
      dangerouslySetInnerHTML={{
        __html: innerHtml.replace(/#000/g, "currentColor"),
      }}
    />
  );
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

function getDashboardPageKey(href: string): string | null {
  if (href === "#") return null;
  const itemPath = normalizePath(href);
  if (itemPath === "/") return "home";
  if (itemPath === "/shop") return "shop";
  if (itemPath === "/client") return "client";
  if (itemPath === "/cart") return "page:cart";
  if (itemPath === "/checkout") return "page:checkout";
  if (itemPath === "/my-account") return "page:my-account";
  if (itemPath === "/search") return "search-results";
  if (itemPath === "/categories" || itemPath.startsWith("/category/")) {
    return "product-category";
  }
  if (itemPath === "/product" || itemPath.startsWith("/product/")) {
    return "product-single";
  }
  if (/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(itemPath)) {
    return `page:${itemPath.slice(1)}`;
  }
  return null;
}

function getDashboardEditHref(href: string, dashboardMode: boolean): string {
  if (!dashboardMode) return href;
  const pageKey = getDashboardPageKey(href);
  return pageKey ? `/dashboard?page=${pageKey}` : href;
}

function getDashboardActivePath(pageKey: string | null): string {
  if (!pageKey || pageKey === "home") return "/";
  if (pageKey === "shop") return "/shop";
  if (pageKey === "client") return "/client";
  if (pageKey === "product-single") return "/product";
  if (
    pageKey === "product-category" ||
    pageKey === "product-category-specific"
  ) {
    return "/categories";
  }
  if (pageKey === "search-results") return "/search";
  if (pageKey.startsWith("page:")) return `/${pageKey.slice(5)}`;
  return "/";
}

function normalizeMenuPresentation(
  value?: Partial<MenuPresentationSettings> | null
): MenuPresentationSettings {
  const rawColumns = Number(value?.submenuColumns);

  return {
    showHeading:
      typeof value?.showHeading === "boolean" ? value.showHeading : false,
    icon:
      typeof value?.icon === "string" && value.icon.trim().length > 0
        ? value.icon.trim()
        : null,
    submenuLayout:
      value?.submenuLayout === "grid" || value?.submenuLayout === "mega"
        ? value.submenuLayout
        : "list",
    submenuColumns: Number.isFinite(rawColumns)
      ? Math.min(Math.max(Math.round(rawColumns), 1), 6)
      : 3,
    badgeText:
      typeof value?.badgeText === "string" && value.badgeText.trim().length > 0
        ? value.badgeText.trim()
        : null,
  };
}

function itemHasActiveDescendant(
  item: MenuItem,
  currentPath: string
): boolean {
  const href = item.path || item.url || "#";
  const isSectionLink = href.includes("#");
  const itemPath =
    href === "#" ? "#" : normalizePath(item.path || item.url || href);
  const isActive =
    !isSectionLink &&
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
  dashboardMode: boolean,
  presentationById?: Record<string, MenuPresentationSettings>,
  level = 0,
  hrefResolver?: (href: string) => string,
): ReactNode {
  return items.map((item) => {
    const href = item.path || item.url || "#";
    const isSectionLink = href.includes("#");
    const resolvedHref = hrefResolver ? hrefResolver(href) : href;
    const dashboardHref = dashboardMode
      ? getDashboardEditHref(href, dashboardMode)
      : resolvedHref;
    const itemPath =
      href === "#" ? "#" : normalizePath(item.path || item.url || href);
    const isActive =
      !isSectionLink &&
      itemPath !== "#" &&
      (currentPath === itemPath || currentPath.startsWith(itemPath + "/"));
    const children = item.children ?? [];
    const hasChildren = children.length > 0;
    const isBranchActive = itemHasActiveDescendant(item, currentPath);
    const presentation = normalizeMenuPresentation(presentationById?.[item.id]);
    const headingVisible = presentation.showHeading !== false;
    const iconName = resolveUIKitIconName(presentation.icon);
    const icon = iconName ? renderUIKitIcon(iconName) : null;
    const badgeText = presentation.badgeText;
    const submenuLayout = hasChildren ? presentation.submenuLayout : "list";
    const submenuColumns = presentation.submenuColumns;

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
          onMouseMove={handleNavMouseMove}
          onMouseLeave={handleNavMouseLeave}
        >
          {icon && <span className="site-header-nav-icon">{icon}</span>}
          {item.label}
          {badgeText && <span className="site-header-nav-badge">{badgeText}</span>}
        </Link>

        {hasChildren && (
          <div
            className={`site-header-nav-submenu site-header-nav-submenu--${submenuLayout}`}
            role="menu"
            style={
              {
                "--submenu-columns": submenuColumns,
              } as CSSProperties
            }
          >
            {headingVisible && (
              <div className="site-header-nav-submenu-heading">
                {icon && <span className="site-header-nav-icon">{icon}</span>}
                {headingVisible && <span>{item.label}</span>}
                {badgeText && (
                  <span className="site-header-nav-badge">{badgeText}</span>
                )}
              </div>
            )}
            <div className="site-header-nav-submenu-items">
              {renderMenuItems(
                children,
                currentPath,
                dashboardMode,
                presentationById,
                level + 1,
                hrefResolver,
              )}
            </div>
          </div>
        )}
      </div>
    );
  });
}

export default function HeaderNav({
  items,
  presentationById,
  categories,
  serviceHomepageMode,
  scopedPreviewWebsiteId,
  activePageKey,
  scopedPreviewPages,
  scopedLinkMode = "preview",
}: HeaderNavProps) {
  const rawPathname = usePathname();
  const dashboardMode = rawPathname === "/dashboard";
  const [dashboardPageKey, setDashboardPageKey] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { totalCount: wishlistCount } = useWishlist();
  const { totalCount: cartCount, openMiniCart } = useCart();
  const { openSearch } = useSearch();

  // Close mobile navigation panel when path changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [rawPathname]);

  useEffect(() => {
    if (!dashboardMode) {
      setDashboardPageKey(null);
      return;
    }

    const updateDashboardPage = () => {
      const previewPage = document.querySelector<HTMLElement>(
        ".builder-preview-page[data-builder-page]",
      );
      const query = new URLSearchParams(window.location.search);
      setDashboardPageKey(
        previewPage?.dataset.builderPage ??
          query.get("page") ??
          query.get("template"),
      );
    };

    updateDashboardPage();
    const observer = new MutationObserver(updateDashboardPage);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["data-builder-page"],
    });
    window.addEventListener("popstate", updateDashboardPage);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", updateDashboardPage);
    };
  }, [dashboardMode]);

  const currentPath = dashboardMode
    ? getDashboardActivePath(dashboardPageKey)
    : activePageKey
      ? getPreviewActivePathForPageKey(activePageKey)
      : normalizePath(rawPathname || "/");
  const activeScopedWebsiteId =
    scopedPreviewWebsiteId ?? getScopedWebsiteIdFromPath(rawPathname);
  const hrefResolver = activeScopedWebsiteId
    ? (href: string) =>
        scopedLinkMode === "builder"
          ? resolveScopedBuilderHref(href, {
              websiteId: activeScopedWebsiteId,
              pages: scopedPreviewPages,
            })
          : resolveScopedPreviewHref(href, {
              websiteId: activeScopedWebsiteId,
              pages: scopedPreviewPages,
            })
    : undefined;

  return (
    <div className={`site-header-nav-container${isMobileOpen ? " is-open" : ""}`}>
      <button
        type="button"
        className="site-header-mobile-menu-toggle"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-expanded={isMobileOpen}
        aria-label="Toggle navigation menu"
      >
        <div className="mobile-menu-grid-dot-wrap">
          <span className="mobile-menu-grid-dot" />
          <span className="mobile-menu-grid-dot" />
          <span className="mobile-menu-grid-dot" />
          <span className="mobile-menu-grid-dot" />
        </div>
      </button>

      <nav className="site-header-nav">
        {renderMenuItems(
          items,
          currentPath,
          dashboardMode,
          presentationById,
          0,
          hrefResolver,
        )}
      </nav>

      {/* Unified Mobile Right Slide-in Drawer */}
      <div
        className={`site-header-mobile-drawer-backdrop${isMobileOpen ? " is-open" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <div className={`site-header-mobile-drawer-wrapper${isMobileOpen ? " is-open" : ""}`}>
        <div className="site-header-mobile-drawer">
          {/* 1. Header (Menu / close) */}
          <div className="mobile-drawer-header">
            <span className="mobile-drawer-title">Menu</span>
            <button
              type="button"
              className="mobile-drawer-close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M15,15 L5,5" />
                <path d="M15,5 L5,15" />
              </svg>
            </button>
          </div>

          {/* 2. Top Actions (Account, Wishlist, Cart, Theme Toggle) */}
          <div className="mobile-drawer-top-actions">
            <div className="mobile-drawer-top-action-wrapper" onClick={() => setIsMobileOpen(false)}>
              <HeaderAccountButton />
            </div>

            <Link
              href="/wishlist"
              className="mobile-drawer-top-action-btn"
              onClick={() => setIsMobileOpen(false)}
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <div className="mobile-drawer-top-action-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistCount > 0 && (
                  <span className="mobile-drawer-top-action-badge">{wishlistCount}</span>
                )}
              </div>
            </Link>

            <button
              type="button"
              className="mobile-drawer-top-action-btn"
              onClick={() => {
                setIsMobileOpen(false);
                openMiniCart();
              }}
              aria-label={`Cart (${cartCount} items)`}
            >
              <div className="mobile-drawer-top-action-icon-wrap">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                {cartCount > 0 && (
                  <span className="mobile-drawer-top-action-badge">{cartCount}</span>
                )}
              </div>
            </button>

            <div className="mobile-drawer-top-action-wrapper">
              <ThemeToggle size="md" />
            </div>
          </div>

          <div className="mobile-drawer-scrollable-content">
            {/* 3. Main Navigation Links */}
            <div className="mobile-drawer-section mobile-drawer-nav-links">
              <span className="mobile-drawer-section-title">Navigation</span>
              <div className="mobile-drawer-nav-items">
                {renderMenuItems(
                  items,
                  currentPath,
                  dashboardMode,
                  presentationById,
                  0,
                  hrefResolver,
                )}
                {serviceHomepageMode && (
                  <div className="site-header-nav-item">
                    <Link
                      href={hrefResolver ? hrefResolver("/client") : "/client"}
                      className="site-header-nav-link mobile-drawer-builder-direct-link"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <span className="site-header-nav-icon">
                        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                          <rect x="2" y="2" width="16" height="16" rx="2" />
                          <path d="M6,6 L14,6 M6,10 L14,10 M6,14 L10,14" />
                        </svg>
                      </span>
                      <span>Start Builder</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Categories */}
            {categories && (
              <div className="mobile-drawer-section mobile-drawer-categories">
                <span className="mobile-drawer-section-title">Categories</span>
                <div className="mobile-drawer-categories-wrap">
                  {categories}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
