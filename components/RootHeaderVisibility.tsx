"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type RootHeaderVisibilityProps = {
  initialPathname: string;
  children: ReactNode;
};

function shouldHideRootHeader(pathname: string) {
  return (
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  );
}

export default function RootHeaderVisibility({
  initialPathname,
  children,
}: RootHeaderVisibilityProps) {
  const pathname = usePathname();
  const currentPathname = pathname ?? initialPathname;

  if (shouldHideRootHeader(currentPathname)) return null;

  return children;
}
