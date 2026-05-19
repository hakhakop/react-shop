"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

export type RecentlyViewedItem = {
  id: string;
  slug: string;
  name: string;
  thumbnailUrl?: string;
  price?: string | null;
};

type RecentlyViewedContextValue = {
  items: RecentlyViewedItem[];
  addViewedProduct: (item: RecentlyViewedItem) => void;
  clear: () => void;
  storageReady: boolean;
};

const STORAGE_KEY = "recentlyViewedProducts";

// Safe default: no crash if used without provider, just no items
const defaultValue: RecentlyViewedContextValue = {
  items: [],
  addViewedProduct: () => {},
  clear: () => {},
  storageReady: false,
};

const RecentlyViewedContext =
  createContext<RecentlyViewedContextValue>(defaultValue);

type RecentlyViewedProviderProps = {
  children: ReactNode;
  maxItems?: number;
};

function loadInitialRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentlyViewedItem[]) : [];
  } catch (err) {
    console.warn("Failed to parse recently viewed from localStorage", err);
    return [];
  }
}

export function RecentlyViewedProvider({
  children,
  maxItems = 8,
}: RecentlyViewedProviderProps) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  useEffect(() => {
    window.queueMicrotask(() => {
      setItems(loadInitialRecentlyViewed());
      setStorageReady(true);
    });
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!storageReady) return;
    if (typeof window === "undefined") return;

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("Failed to save recently viewed to localStorage", err);
    }
  }, [items, storageReady]);

  const addViewedProduct = useCallback(
    (item: RecentlyViewedItem) => {
      if (!item.id && !item.slug) return;

      setItems((prev) => {
        // Deduplicate by id or slug
        const filtered = prev.filter(
          (p) => p.id !== item.id && p.slug !== item.slug
        );

        const next = [item, ...filtered];
        if (next.length > maxItems) {
          return next.slice(0, maxItems);
        }
        return next;
      });
    },
    [maxItems]
  );

  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      addViewedProduct,
      clear,
      storageReady,
    }),
    [items, addViewedProduct, storageReady]
  );

  return (
    <RecentlyViewedContext.Provider value={value}>
      {children}
    </RecentlyViewedContext.Provider>
  );
}

export function useRecentlyViewed(): RecentlyViewedContextValue {
  return useContext(RecentlyViewedContext);
}

/**
 * Tiny helper component for server product pages:
 * you can render this in a server component and pass product data as props.
 */
type ProductRecentlyViewedTrackerProps = RecentlyViewedItem;

export function ProductRecentlyViewedTracker(
  props: ProductRecentlyViewedTrackerProps
) {
  const { addViewedProduct } = useRecentlyViewed();
  const { id, slug, name, thumbnailUrl, price } = props;

  useEffect(() => {
    addViewedProduct({ id, slug, name, thumbnailUrl, price });
  }, [id, slug, name, thumbnailUrl, price, addViewedProduct]);

  return null;
}

export default RecentlyViewedProvider;
