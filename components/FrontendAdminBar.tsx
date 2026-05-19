"use client";

import { Edit3, Gauge, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function isLocalHost() {
  if (typeof window === "undefined") return false;
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function labelFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function dashboardTargetForPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return null;
  if (pathname === "/") {
    return {
      href: "/dashboard?page=home",
      label: "Edit Home",
      context: "Page",
    };
  }
  if (pathname === "/shop") {
    return {
      href: "/dashboard?page=shop",
      label: "Edit Shop",
      context: "Page",
    };
  }
  if (pathname === "/client") {
    return {
      href: "/dashboard?page=client",
      label: "Edit Client",
      context: "Page",
    };
  }
  if (pathname.startsWith("/product/")) {
    return {
      href: "/dashboard?page=product-single",
      label: "Edit Product Template",
      context: "Template",
    };
  }
  if (pathname.startsWith("/category/")) {
    return {
      href: "/dashboard?page=product-category",
      label: "Edit Category Template",
      context: "Template",
    };
  }
  if (pathname.startsWith("/search")) {
    return {
      href: "/dashboard?page=search-results",
      label: "Edit Search Template",
      context: "Template",
    };
  }

  const slug = pathname.replace(/^\/+|\/+$/g, "");
  if (!slug || slug.includes("/")) {
    return {
      href: "/dashboard",
      label: "Open Builder",
      context: "Dashboard",
    };
  }

  return {
    href: `/dashboard?page=page:${slug}`,
    label: `Edit ${labelFromSlug(slug)}`,
    context: "Builder Page",
  };
}

export default function FrontendAdminBar() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  const target = useMemo(
    () => dashboardTargetForPath(pathname ?? "/"),
    [pathname]
  );

  useEffect(() => {
    window.queueMicrotask(() => {
      setReady(true);
    });
  }, []);

  const shouldShow = ready && target && isLocalHost();

  if (!ready || pathname?.startsWith("/dashboard")) return null;

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
    <aside className="frontend-admin-bar" aria-label="Frontend editor tools">
      <div>
        <strong>{target.context}</strong>
        <span>React visual builder</span>
      </div>
      <Link className="frontend-admin-bar-primary" href={target.href}>
        <Edit3 size={15} />
        {target.label}
      </Link>
      <Link href="/dashboard">
        <Gauge size={15} />
        Dashboard
      </Link>
      <a href="https://cms.webpages.am/wp-admin/" target="_blank" rel="noreferrer">
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
