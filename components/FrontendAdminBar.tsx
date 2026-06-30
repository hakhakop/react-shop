"use client";

import { Edit3, ExternalLink, Gauge, Settings, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PRODUCT_EDIT_EVENT = "react-shop:product-edit-target";

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return (
    process.env.NODE_ENV === "development" ||
    ["localhost", "127.0.0.1", "::1"].includes(hostname) ||
    hostname.endsWith(".local") ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    process.env.NEXT_PUBLIC_SHOW_FRONTEND_ADMIN_BAR === "true"
  );
}

function dashboardTargetForPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return null;

  return {
    href: "/app/websites",
    label: "Open Website Builder",
    context: "Websites",
  };
}

export default function FrontendAdminBar() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isSaasLoggedIn, setIsSaasLoggedIn] = useState(false);
  const [productEditHref, setProductEditHref] = useState<string | null>(null);
  const target = useMemo(
    () => dashboardTargetForPath(pathname ?? "/"),
    [pathname]
  );

  useEffect(() => {
    window.queueMicrotask(() => {
      setReady(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function checkSaasSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        if (!cancelled) {
          setIsSaasLoggedIn(response.ok);
        }
      } catch {
        if (!cancelled) {
          setIsSaasLoggedIn(false);
        }
      }
    }

    checkSaasSession();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const shouldShow = ready && target && isLocalHost() && isSaasLoggedIn;

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
      {pathname?.startsWith("/product/") && productEditHref ? (
        <a href={productEditHref} target="_blank" rel="noopener noreferrer">
          <Edit3 size={15} />
          Edit Product
        </a>
      ) : null}
      <Link href="/app/websites">
        <Gauge size={15} />
        Websites
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
