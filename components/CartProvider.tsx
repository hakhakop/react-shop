"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string; // product GraphQL ID
  productId?: string | number; // original WooCommerce product ID/global ID, even when cart line has options
  variationId?: string | number | null;
  slug: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  updateItemQty: (id: string, qty: number) => void;
  totalCount: number;
  totalAmount: number;
  isMiniCartOpen: boolean;
  openMiniCart: () => void;
  closeMiniCart: () => void;
  toggleMiniCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "wc-store-cart";

function loadInitialCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const hasLoadedStoredCart = useRef(false);

  useEffect(() => {
    const storedItems = loadInitialCart();
    window.queueMicrotask(() => {
      hasLoadedStoredCart.current = true;
      setItems(storedItems);
    });
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (!hasLoadedStoredCart.current) return;
    saveCart(items);
  }, [items]);

  const openMiniCart = () => setIsMiniCartOpen(true);
  const closeMiniCart = () => setIsMiniCartOpen(false);
  const toggleMiniCart = () => setIsMiniCartOpen((prev) => !prev);

  const addItem = (item: Omit<CartItem, "qty">, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, qty: p.qty + qty } : p
        );
      }
      return [...prev, { ...item, qty }];
    });

    // Automatically open the MiniCart whenever an item is added
    openMiniCart();
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCart = () => setItems([]);

  const updateItemQty = (id: string, qty: number) => {
    setItems((prev) => {
      if (qty <= 0) {
        return prev.filter((p) => p.id !== id);
      }
      return prev.map((p) => (p.id === id ? { ...p, qty } : p));
    });
  };

  const totalCount = items.reduce((sum, it) => sum + it.qty, 0);
  const totalAmount = items.reduce((sum, it) => sum + it.qty * it.price, 0);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clearCart,
    updateItemQty,
    totalCount,
    totalAmount,
    isMiniCartOpen,
    openMiniCart,
    closeMiniCart,
    toggleMiniCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
}
