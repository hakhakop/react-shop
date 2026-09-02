"use client";

import { Edit3, ExternalLink, Gauge, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { EditableLayoutTarget } from "@/lib/builderEditorContext";
import { getBuilderPageKeyForTenantPath } from "@/lib/scopedPreviewLinks";
import {
  getDefaultWebsiteBuilderPageKey,
  resolveBuilderPageParam,
  scopedBuilderHref,
  type BuilderPageSummary,
  type WebsiteBuilderPages,
} from "@/lib/websiteBuilderLinks";

const PRODUCT_EDIT_EVENT = "react-shop:product-edit-target";

type AuthMeResponse = {
  user?: {
    id: string;
    name?: string;
    role: "user" | "admin" | "super_admin";
  } | null;
};

type DashboardTarget = {
  href: string;
  label: string;
  context: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  legacy?: boolean;
};

type BuilderPagesResponse = {
  pages?: BuilderPageSummary[];
  publishedKeys?: string[];
};

type BuilderEditorTargetResponse = {
  target?: EditableLayoutTarget | null;
};

type DomainWebsiteContext = {
  ownerId: string;
  routeSegment: string;
};

function labelForPageKey(pageKey: string, pathname: string) {
  if (pageKey === "product-single") return "Edit Product Template";
  if (pageKey === "product-category-specific") return "Edit Category Template";
  if (pageKey === "search-results") return "Edit Search Template";
  if (pathname === "/cart" || pathname === "/checkout" || pathname === "/my-account") {
    return "Edit Current Page";
  }
  return "Edit Current Page";
}

function scopedWebsiteIdFromPreviewPath(pathname: string) {
  const match = pathname.match(/^\/app\/websites\/([^/]+)\/preview/);
  return match?.[1] ?? null;
}

function dashboardTargetForPath(
  pathname: string,
  pageParam: string | null,
  builderPages: WebsiteBuilderPages | null,
  user: AuthMeResponse["user"],
  domainWebsite?: DomainWebsiteContext,
): DashboardTarget | null {
  if (pathname.startsWith("/dashboard")) return null;

  const scopedWebsiteId = scopedWebsiteIdFromPreviewPath(pathname);
  if (scopedWebsiteId) {
    const pageKey = resolveBuilderPageParam(pageParam, builderPages);
    const websitePageKey = getDefaultWebsiteBuilderPageKey(builderPages);
    return {
      href: scopedBuilderHref(scopedWebsiteId, pageKey),
      label: "Edit This Page",
      context: "Website preview",
      secondaryHref: scopedBuilderHref(scopedWebsiteId, websitePageKey),
      secondaryLabel: "Edit This Website",
    };
  }

  if (pathname.startsWith("/app") || pathname.startsWith("/admin")) {
    return null;
  }

  if (domainWebsite) {
    const canEditDomainWebsite =
      user?.id === domainWebsite.ownerId ||
      user?.role === "admin" ||
      user?.role === "super_admin";
    if (!canEditDomainWebsite) return null;

    const pageKey = getBuilderPageKeyForTenantPath(
      pathname,
      builderPages?.pages ?? [],
      domainWebsite.routeSegment,
    );
    if (!pageKey) return null;
    const websitePageKey = getDefaultWebsiteBuilderPageKey(builderPages);
    return {
      href: scopedBuilderHref(domainWebsite.routeSegment, pageKey),
      label: "Edit This Page",
      context: "Tenant website",
      secondaryHref: scopedBuilderHref(
        domainWebsite.routeSegment,
        websitePageKey,
      ),
      secondaryLabel: "Edit This Website",
    };
  }

  if (user?.role !== "super_admin") {
    return null;
  }

  const pageKey = getBuilderPageKeyForTenantPath(pathname, builderPages?.pages ?? []);
  if (!pageKey) return null;
  const params = new URLSearchParams({ page: pageKey });
  return {
    href: `/dashboard?${params.toString()}`,
    label: pageKey === "home" ? "Edit Root Site" : labelForPageKey(pageKey, pathname),
    context: "Root site builder",
    secondaryHref: "/dashboard",
    secondaryLabel: "Open Root Builder",
    legacy: true,
  };
}

export default function FrontendAdminBar({
  domainWebsite,
}: {
  domainWebsite?: DomainWebsiteContext;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isCanonicalBuilderPreview =
    pathname?.startsWith("/dashboard/preview") ||
    (pathname?.match(/^\/app\/websites\/[^/]+\/preview(?:\/|$)/) &&
      searchParams.get("builderFrame") !== null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [saasUser, setSaasUser] = useState<AuthMeResponse["user"]>(null);
  const [productEditHref, setProductEditHref] = useState<string | null>(null);
  const [pageParam, setPageParam] = useState<string | null>(null);
  const [builderPages, setBuilderPages] = useState<WebsiteBuilderPages | null>(null);
  const [routedContentTarget, setRoutedContentTarget] =
    useState<EditableLayoutTarget | null>(null);
  const scopedWebsiteId = useMemo(
    () =>
      scopedWebsiteIdFromPreviewPath(pathname ?? "/") ??
      domainWebsite?.routeSegment ??
      null,
    [domainWebsite?.routeSegment, pathname],
  );
  const target = useMemo(() => {
    const pathTarget = dashboardTargetForPath(
      pathname ?? "/",
      pageParam,
      builderPages,
      saasUser,
      domainWebsite,
    );
    if (!pathTarget || !routedContentTarget) return pathTarget;
    return {
      ...pathTarget,
      href: routedContentTarget.builderHref,
      label: routedContentTarget.label,
    };
  }, [
    builderPages,
    domainWebsite,
    pageParam,
    pathname,
    routedContentTarget,
    saasUser,
  ]);

  useEffect(() => {
    window.queueMicrotask(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    setPageParam(new URLSearchParams(window.location.search).get("page"));
  }, [pathname]);

  useEffect(() => {
    if (!pathname || pathname.startsWith("/dashboard") || !saasUser) {
      setRoutedContentTarget(null);
      return;
    }

    let cancelled = false;
    async function loadRoutedContentTarget() {
      setRoutedContentTarget(null);
      try {
        const params = new URLSearchParams({ href: window.location.href });
        if (scopedWebsiteId) params.set("websiteId", scopedWebsiteId);
        const response = await fetch(
          `/api/builder-editor-context?${params.toString()}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as BuilderEditorTargetResponse;
        if (!cancelled) setRoutedContentTarget(payload.target ?? null);
      } catch {
        if (!cancelled) setRoutedContentTarget(null);
      }
    }

    void loadRoutedContentTarget();
    return () => {
      cancelled = true;
    };
  }, [pathname, saasUser, scopedWebsiteId]);

  useEffect(() => {
    if (!scopedWebsiteId || !saasUser) {
      setBuilderPages(null);
      return;
    }

    const websiteId = scopedWebsiteId;
    let cancelled = false;

    async function loadBuilderPages() {
      try {
        const params = new URLSearchParams({ websiteId });
        const response = await fetch(`/api/builder-pages?${params.toString()}`, {
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = (await response.json()) as BuilderPagesResponse;
        if (!cancelled) {
          setBuilderPages({
            pages: payload.pages ?? [],
            publishedKeys: payload.publishedKeys ?? [],
          });
        }
      } catch {
        if (!cancelled) setBuilderPages(null);
      }
    }

    setBuilderPages(null);
    void loadBuilderPages();

    return () => {
      cancelled = true;
    };
  }, [saasUser, scopedWebsiteId]);

  useEffect(() => {
    let cancelled = false;

    async function checkSaasSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!cancelled) {
          if (!response.ok) {
            setSaasUser(null);
            return;
          }

          const data = (await response.json()) as AuthMeResponse;
          setSaasUser(data.user ?? null);
        }
      } catch {
        if (!cancelled) {
          setSaasUser(null);
        }
      }
    }

    checkSaasSession();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => {
    if (!pathname?.startsWith("/product/")) return;

    const readHref = () => {
      const productId = document.body.dataset.wpProductId;
      setProductEditHref(
        productId
          ? `https://cms.webpages.am/wp-admin/post.php?post=${productId}&action=edit`
          : null
      );
    };

    readHref();

    const observer = new MutationObserver(() => {
      readHref();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-wp-product-id"],
    });

    const onProductEditTarget = () => {
      readHref();
    };

    window.addEventListener(PRODUCT_EDIT_EVENT, onProductEditTarget);

    return () => {
      observer.disconnect();
      window.removeEventListener(PRODUCT_EDIT_EVENT, onProductEditTarget);
    };
  }, [pathname]);

  // Authorization is established by the resolved target (owner/admin/root
  // super-admin) and the authenticated SaaS session. Do not hide the tenant
  // storefront toolbar merely because the storefront uses a real domain.
  const shouldShow = ready && target && Boolean(saasUser);

  if (isCanonicalBuilderPreview || !ready || pathname?.startsWith("/dashboard")) return null;

  if (!shouldShow) return null;

  if (!visible) {
    return (
      <button
        className="frontend-admin-bar-toggle"
        type="button"
        onClick={() => setVisible(true)}
        aria-label="Show builder toolbar"
      >
        <Settings size={16} />
        <span>Builder</span>
      </button>
    );
  }

  return (
    <aside
      className="frontend-admin-bar"
      aria-label="Frontend editor tools"
      data-website-link-owner="application"
    >
      <div>
        <strong>{target.context}</strong>
        <span>{target.legacy ? "Root website editor" : "Website builder"}</span>
      </div>
      <Link className="frontend-admin-bar-primary" href={target.href}>
        <Edit3 size={15} />
        {target.label}
      </Link>
      {target.secondaryHref && target.secondaryLabel ? (
        <Link href={target.secondaryHref}>
          <Gauge size={15} />
          {target.secondaryLabel}
        </Link>
      ) : null}
      {pathname?.startsWith("/product/") && productEditHref ? (
        <a href={productEditHref} target="_blank" rel="noopener noreferrer">
          <Edit3 size={15} />
          Edit Product
        </a>
      ) : null}
      <Link href={target.legacy ? "/admin/websites" : "/app/websites"}>
        <Gauge size={15} />
        {target.legacy ? "All Websites" : "My Websites"}
      </Link>
      <a href="https://cms.webpages.am/wp-admin/" target="_blank" rel="noreferrer">
        <ExternalLink size={15} />
        WP Admin
      </a>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Hide builder toolbar"
      >
        <X size={15} />
      </button>
    </aside>
  );
}
