"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import StorefrontLoadingSkeleton from "./StorefrontLoadingSkeleton";
import type { StorefrontLoadingData } from "@/lib/storefrontLoading";

export default function StorefrontRouteLoadingSkeleton({
  pathname: pathnameOverride,
}: {
  pathname?: string | null;
}) {
  const currentPathname = usePathname();
  const pathname = pathnameOverride ?? currentPathname ?? "/";
  const [loaded, setLoaded] = useState<{
    pathname: string;
    data: StorefrontLoadingData | null;
  } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/storefront-loading?pathname=${encodeURIComponent(pathname)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((nextData: StorefrontLoadingData | null) => {
        if (nextData) setLoaded({ pathname, data: nextData });
      })
      .catch(() => undefined);

    return () => controller.abort();
  }, [pathname]);

  return (
    <StorefrontLoadingSkeleton
      data={loaded?.pathname === pathname ? loaded.data : null}
    />
  );
}
