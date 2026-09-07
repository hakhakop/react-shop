"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import StorefrontRouteLoadingSkeleton from "./StorefrontRouteLoadingSkeleton";

export default function StorefrontNavigationLoading() {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(target instanceof HTMLAnchorElement) || target.target === "_blank" || target.hasAttribute("download")) return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      if (!url.pathname.startsWith("/woolberry")) return;
      setPendingPath(url.pathname);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname]);

  if (!pendingPath || pendingPath === pathname || !pathname?.startsWith("/woolberry")) return null;
  return (
    <div className="storefront-navigation-loading" aria-label="Loading page" aria-busy="true">
      <StorefrontRouteLoadingSkeleton pathname={pendingPath} />
    </div>
  );
}
