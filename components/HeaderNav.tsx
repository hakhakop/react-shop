"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import type { MenuItem } from "../lib/navigation";
import {
  getScopedWebsiteIdFromPath,
  getPreviewActivePathForPageKey,
  projectWebsiteHref,
  type ScopedPreviewPage,
} from "../lib/scopedPreviewLinks";
import type { NavigationRouteAlias } from "@/lib/navigationTargets";
import type { BuilderLayoutKey } from "../lib/builderLayouts";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import { resolveUikitIconName } from "@/lib/uikitIconRegistry";

interface HeaderNavProps {
  dropdownContentById?: Record<string, ReactNode>;
  items: MenuItem[];
  presentationById?: Record<string, MenuPresentationSettings>;
  scopedPreviewWebsiteId?: string;
  activePageKey?: BuilderLayoutKey;
  scopedPreviewPages?: ScopedPreviewPage[];
  systemRouteAliases?: NavigationRouteAlias[];
  scopedLinkMode?: "builder" | "preview" | "tenant-path";
  activeContentLanguage?: string;
  dropdownIndicator?: "none" | "chevron";
  parentIconEnabled?: boolean;
  clickModeEnabled?: boolean;
  canonicalMobile?: boolean;
  dialogLayout?: string;
  dialogMenuStyle?: string;
  dialogCenter?: boolean;
  dialogPushAfter?: number;
  dialogClose?: boolean;
  offcanvasMode?: string;
  offcanvasFlip?: boolean;
  offcanvasOverlay?: boolean;
  dropbarAnimation?: string;
  /** Builder-authored content for the mobile menu dialog. */
  mobileDrawerContent?: ReactNode;
  /** Render only the mobile menu list, for use inside the drawer section. */
  mobileMenuOnly?: boolean;
  /** Builder preview only: keep the dialog visible while it is being edited. */
  forceMobileMenuOpen?: boolean;
  style?: CSSProperties;
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
  submenuWidth: string | null;
  submenuStretch: "navbar" | "navbar-container" | null;
  submenuLarge: boolean;
  submenuRemoveHorizontalPadding: boolean;
  submenuRemoveVerticalPadding: boolean;
  mobileAccordion: boolean;
  badgeText: string | null;
};

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
    submenuWidth:
      typeof value?.submenuWidth === "string" && value.submenuWidth.trim().length > 0
        ? value.submenuWidth.trim()
        : null,
    submenuStretch:
      value?.submenuStretch === "navbar" || value?.submenuStretch === "navbar-container"
        ? value.submenuStretch
        : null,
    submenuLarge: value?.submenuLarge === true,
    submenuRemoveHorizontalPadding: value?.submenuRemoveHorizontalPadding === true,
    submenuRemoveVerticalPadding: value?.submenuRemoveVerticalPadding === true,
    mobileAccordion: value?.mobileAccordion !== false,
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
  dropdownIndicator: "none" | "chevron" = "none",
  parentIconEnabled = dropdownIndicator === "chevron",
  clickModeEnabled = false,
  mobileMode = false,
  expandedIds = new Set<string>(),
  onToggleMobileItem?: (id: string) => void,
  pushAfter?: number,
  dropdownContentById?: Record<string, ReactNode>,
): ReactNode {
  const visibleItems = items.filter((item) =>
    mobileMode ? item.visibility !== "desktop" : item.visibility !== "mobile",
  );
  return visibleItems.map((item, itemIndex) => {
    const href = mobileMode
      ? (item.mobileUrl || item.path || item.url || "#")
      : (item.path || item.url || "#");
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
    const children = (item.children ?? []).filter((child) =>
      mobileMode ? child.visibility !== "desktop" : child.visibility !== "mobile",
    );
    const dropdownContent = !mobileMode && level === 0 ? dropdownContentById?.[item.id] : undefined;
    const hasChildren = children.length > 0 || Boolean(dropdownContent);
    const isBranchActive = itemHasActiveDescendant(item, currentPath);
    const presentation = normalizeMenuPresentation(presentationById?.[item.id]);
    const headingVisible = presentation.showHeading !== false;
    const iconName = resolveUikitIconName(item.iconName || presentation.icon);
    const icon = item.iconUrl ? (
      <img src={item.iconUrl} alt="" width={52} height={52} loading="eager" />
    ) : iconName ? (
      <WebPagesIcon name={iconName} size={14} />
    ) : null;
    const badgeText = presentation.badgeText;
    const submenuLayout = hasChildren ? presentation.submenuLayout : "list";
    const submenuColumns = presentation.submenuColumns;
    const mobileParentAccordion = mobileMode && hasChildren && presentation.mobileAccordion;
    // In YOOtheme hover mode the parent text remains a normal link; click
    // mode turns that text into the dropdown toggle. Previously every desktop
    // parent was intercepted before clickModeEnabled could be consulted.
    const desktopParentToggle = !mobileMode && hasChildren && clickModeEnabled;
    const submenuOpen = !mobileParentAccordion || expandedIds.has(item.id);

    return (
      <div
        key={item.id}
        className={`site-header-nav-item${
          hasChildren ? " has-children" : ""
        }${isBranchActive ? " is-active" : ""}${
          desktopParentToggle && expandedIds.has(item.id) ? " is-open" : ""
        }${level === 0 && pushAfter && itemIndex === pushAfter ? " is-pushed" : ""}`}
      >
        <Link
          href={mobileParentAccordion ? "#" : dashboardHref}
          className={`site-header-nav-link${
            level > 0 ? " site-header-nav-submenu-link" : ""
          }${isActive ? " is-active" : ""}`}
          aria-current={isActive ? "page" : undefined}
          aria-haspopup={hasChildren ? "menu" : undefined}
          aria-expanded={hasChildren ? expandedIds.has(item.id) : undefined}
          role={hasChildren ? "button" : undefined}
          target={item.target}
          onMouseMove={handleNavMouseMove}
          onMouseLeave={handleNavMouseLeave}
          onClick={(event) => {
            if (mobileParentAccordion) {
              event.preventDefault();
              onToggleMobileItem?.(item.id);
              return;
            }
            if (desktopParentToggle) {
              event.preventDefault();
              onToggleMobileItem?.(item.id);
              return;
            }
          }}
        >
          {icon && <span className="site-header-nav-icon">{icon}</span>}
          <span className="site-header-nav-label">{item.label}</span>
          {item.subtitle && (
            <span className="site-header-nav-subtitle">{item.subtitle}</span>
          )}
          {badgeText && <span className="site-header-nav-badge">{badgeText}</span>}
          {level === 0 && hasChildren && parentIconEnabled && dropdownIndicator === "chevron" && (
            <WebPagesIcon
              name="chevron-down"
              size={12}
              className="site-header-nav-parent-icon"
            />
          )}
        </Link>

        {hasChildren && submenuOpen && (
          <div
            className={`site-header-nav-submenu site-header-nav-submenu--${submenuLayout}${dropdownContent ? " site-header-nav-submenu--builder" : ""}${presentation.submenuStretch ? ` is-stretch-${presentation.submenuStretch}` : ""}${presentation.submenuLarge ? " is-large" : ""}${presentation.submenuRemoveHorizontalPadding ? " is-flush-horizontal" : ""}${presentation.submenuRemoveVerticalPadding ? " is-flush-vertical" : ""}`}
            role={dropdownContent ? "region" : "menu"}
            aria-label={dropdownContent ? `${item.label} dropdown` : undefined}
            style={
              {
                "--submenu-columns": submenuColumns,
                "--submenu-stretch": presentation.submenuStretch ?? "none",
                ...(presentation.submenuWidth
                  ? { width: presentation.submenuWidth, maxWidth: "min(100vw - 30px, 1424px)" }
                  : {}),
                ...(submenuLayout === "list"
                  ? { backdropFilter: "var(--uk-navbar-backdrop-filter)" }
                  : {}),
              } as CSSProperties
            }
          >
            {mobileMode && (
              <Link
                href={dashboardMode ? getDashboardEditHref(href, dashboardMode) : resolvedHref}
                className="site-header-nav-link site-header-nav-submenu-link site-header-nav-mobile-parent-link"
                target={item.target}
              >
                {icon && <span className="site-header-nav-icon">{icon}</span>}
                {item.label}
              </Link>
            )}
            {!dropdownContent && headingVisible && (
              <div className="site-header-nav-submenu-heading">
                {icon && <span className="site-header-nav-icon">{icon}</span>}
                {headingVisible && <span>{item.label}</span>}
                {badgeText && (
                  <span className="site-header-nav-badge">{badgeText}</span>
                )}
              </div>
            )}
            {dropdownContent || <div className="site-header-nav-submenu-items">
              {renderMenuItems(
                children,
                currentPath,
                dashboardMode,
                presentationById,
                level + 1,
                hrefResolver,
                dropdownIndicator,
                parentIconEnabled,
                clickModeEnabled,
                mobileMode,
                expandedIds,
                onToggleMobileItem,
                pushAfter,
              )}
            </div>}
          </div>
        )}
      </div>
    );
  });
}

export default function HeaderNav({
  dropdownContentById,
  items,
  presentationById,
  scopedPreviewWebsiteId,
  activePageKey,
  scopedPreviewPages,
  systemRouteAliases,
  scopedLinkMode = "preview",
  activeContentLanguage,
  dropdownIndicator = "none",
  parentIconEnabled = dropdownIndicator === "chevron",
  clickModeEnabled = false,
  canonicalMobile = false,
  dialogLayout = "offcanvas-top",
  dialogMenuStyle = "default",
  dialogCenter = false,
  dialogPushAfter,
  dialogClose = true,
  offcanvasMode = "slide",
  offcanvasFlip = false,
  offcanvasOverlay = true,
  dropbarAnimation = "",
  mobileDrawerContent,
  mobileMenuOnly = false,
  forceMobileMenuOpen = false,
  style,
}: HeaderNavProps) {
  const rawPathname = usePathname();
  const dashboardMode = rawPathname === "/dashboard";
  const [dashboardPageKey, setDashboardPageKey] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMobileIds, setExpandedMobileIds] = useState<Set<string>>(
    () => new Set(),
  );
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close mobile navigation panel when path changes
  useEffect(() => {
    setIsMobileOpen(false);
    setExpandedMobileIds(new Set());
  }, [rawPathname, canonicalMobile]);

  useEffect(() => {
    if (forceMobileMenuOpen) setIsMobileOpen(true);
  }, [forceMobileMenuOpen]);

  const toggleMenuItem = (id: string) => {
    setExpandedMobileIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleDesktopMenuItem = (id: string) => {
    setExpandedMobileIds((current) =>
      current.has(id) ? new Set() : new Set([id]),
    );
  };

  useEffect(() => {
    if (!clickModeEnabled) return;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!navContainerRef.current?.contains(event.target as Node)) {
        setExpandedMobileIds(new Set());
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpandedMobileIds(new Set());
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [clickModeEnabled]);

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
        projectWebsiteHref(href, {
          mode: scopedLinkMode,
          context: {
            websiteId: activeScopedWebsiteId,
            pages: scopedPreviewPages,
            systemRouteAliases,
          },
        })
    : undefined;

  const mobileMenu = (
    <nav className="site-header-nav site-header-nav--mobile-dialog" style={style}>
      {renderMenuItems(
        items,
        currentPath,
        dashboardMode,
        presentationById,
        0,
        hrefResolver,
        dropdownIndicator,
        parentIconEnabled,
        clickModeEnabled,
        true,
        expandedMobileIds,
        toggleMenuItem,
        dialogPushAfter,
      )}
    </nav>
  );

  if (mobileMenuOnly) {
    return <div className="mobile-drawer-nav-items">{mobileMenu}</div>;
  }

  const mobileMenuOpen = forceMobileMenuOpen || isMobileOpen;

  return (
    <div
      ref={navContainerRef}
      className={`site-header-nav-container${canonicalMobile ? " is-canonical-mobile" : ""}${mobileMenuOpen ? " is-open" : ""} dialog-layout-${dialogLayout} dialog-menu-${dialogMenuStyle} offcanvas-mode-${offcanvasMode}${offcanvasFlip ? " is-flipped" : ""}${offcanvasOverlay ? " has-overlay" : ""}${dialogCenter ? " is-dialog-centered" : ""}${dialogClose ? " has-dialog-close" : ""}${dropbarAnimation ? ` dropbar-animation-${dropbarAnimation}` : ""}`}
      data-dialog-layout={dialogLayout}
    >
      <button
        type="button"
        className="site-header-mobile-menu-toggle"
        onClick={() => setIsMobileOpen((prev) => !prev)}
        aria-expanded={mobileMenuOpen}
        aria-label="Toggle navigation menu"
      >
        <div className="mobile-menu-grid-dot-wrap">
          <span className="mobile-menu-grid-dot" />
          <span className="mobile-menu-grid-dot" />
          <span className="mobile-menu-grid-dot" />
          <span className="mobile-menu-grid-dot" />
        </div>
      </button>

      <nav className="site-header-nav" style={style}>
        {renderMenuItems(
          items,
          currentPath,
          dashboardMode,
          presentationById,
          0,
          hrefResolver,
          dropdownIndicator,
          parentIconEnabled,
          clickModeEnabled,
          false,
          expandedMobileIds,
          toggleDesktopMenuItem,
          dialogPushAfter,
          dropdownContentById,
        )}
      </nav>

      {/* Unified Mobile Right Slide-in Drawer */}
      <div
        className={`site-header-mobile-drawer-backdrop${mobileMenuOpen ? " is-open" : ""}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <div className={`site-header-mobile-drawer-wrapper${mobileMenuOpen ? " is-open" : ""}`}>
        <div className="site-header-mobile-drawer">
          {/* 1. Header (Menu / close) */}
          <div className="mobile-drawer-header">
            {!mobileDrawerContent ? <span className="mobile-drawer-title">Menu</span> : null}
            {dialogClose && <button
              type="button"
              className="mobile-drawer-close"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <path d="M15,15 L5,5" />
                <path d="M15,5 L5,15" />
              </svg>
            </button>}
          </div>

          <div className="mobile-drawer-scrollable-content">
            {mobileDrawerContent ?? <div className="mobile-drawer-nav-items">{mobileMenu}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
