"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type ProductCategoryFilterContextValue = {
  activeCategorySlug: string | null;
  setActiveCategorySlug: (slug: string | null) => void;
  clearActiveCategory: () => void;
};

const ProductCategoryFilterContext =
  createContext<ProductCategoryFilterContextValue | null>(null);

function categorySlugFromPathname(pathname: string | null) {
  const match = pathname?.match(/^\/category\/([^/]+)\/?$/);
  if (!match) return null;

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export default function ProductCategoryFilterProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(
    () => categorySlugFromPathname(pathname),
  );

  useEffect(() => {
    setActiveCategorySlug(categorySlugFromPathname(pathname));
  }, [pathname]);

  const value = useMemo<ProductCategoryFilterContextValue>(
    () => ({
      activeCategorySlug,
      setActiveCategorySlug,
      clearActiveCategory: () => setActiveCategorySlug(null),
    }),
    [activeCategorySlug],
  );

  return (
    <ProductCategoryFilterContext.Provider value={value}>
      {children}
    </ProductCategoryFilterContext.Provider>
  );
}

export function useProductCategoryFilter() {
  return useContext(ProductCategoryFilterContext);
}
