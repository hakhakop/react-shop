"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type WishlistItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
};

export type WishlistContextType = {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  clearWishlist: () => void;
  isInWishlist: (id: string) => boolean;
  totalCount: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const STORAGE_KEY = "wishlist";

function loadInitialWishlist(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WishlistItem[]) : [];
  } catch (error) {
    console.error("Failed to load wishlist from localStorage", error);
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    setItems(loadInitialWishlist());
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Failed to save wishlist to localStorage", error);
    }
  }, [items]);

  const isInWishlist = (id: string) => items.some((item) => item.id === id);

  const toggleItem = (item: WishlistItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) {
        // remove
        return prev.filter((p) => p.id !== item.id);
      }
      // add
      return [...prev, item];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const value: WishlistContextType = {
    items,
    toggleItem,
    removeItem,
    clearWishlist,
    isInWishlist,
    totalCount: items.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextType {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return ctx;
}
