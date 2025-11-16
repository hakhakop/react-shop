"use client";

import Link from "next/link";
import { useState } from "react";
import { useWishlist } from "./WishlistProvider";
import { useCart } from "./CartProvider";
import MiniCart from "./MiniCart";
import ThemeToggle from "./ThemeToggle";

export default function HeaderActions() {
  const { totalCount: wishlistCount } = useWishlist();
  const { totalCount: cartCount } = useCart();
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  return (
    <>
      <div className="site-header-actions">
        <Link href="/wishlist" className="site-header-action-pill">
          <span className="site-header-action-label">Wishlist</span>
          {wishlistCount > 0 && (
            <span className="site-header-action-badge">
              {wishlistCount}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="site-header-action-pill"
          onClick={() => setMiniCartOpen(true)}
        >
          <span className="site-header-action-label">Cart</span>
          {cartCount > 0 && (
            <span className="site-header-action-badge">
              {cartCount}
            </span>
          )}
        </button>

        <div className="site-header-action-pill">
          <ThemeToggle />
        </div>
      </div>

      <MiniCart
        open={miniCartOpen}
        onClose={() => setMiniCartOpen(false)}
      />
    </>
  );
}