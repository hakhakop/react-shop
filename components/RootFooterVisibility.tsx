"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type RootFooterVisibilityProps = {
  initialPathname: string;
  children: ReactNode;
};

function shouldHideRootFooter(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/app") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register")
  );
}

export default function RootFooterVisibility({
  initialPathname,
  children,
}: RootFooterVisibilityProps) {
  const pathname = usePathname();
  const currentPathname = pathname ?? initialPathname;

  if (shouldHideRootFooter(currentPathname)) return null;

  return children;
}
