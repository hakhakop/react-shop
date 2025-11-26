"use client";

import Link from "next/link";
import { useState } from "react";
import { useWishlist } from "./WishlistProvider";
import { useCart } from "./CartProvider";
import MiniCart from "./MiniCart";
import ThemeToggle from "./ThemeToggle";
import { AppIconButton } from "@/components/ui/AppIconButton";

function HeartIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M12 20.25s-4.5-2.7-7.2-5.4C3 13.05 2.25 11.7 2.25 10.2 2.25 7.8 4.05 6 6.45 6c1.35 0 2.7.6 3.55 1.8C10.85 6.6 12.2 6 13.55 6c2.4 0 4.2 1.8 4.2 4.2 0 1.5-.75 2.85-2.55 4.65-2.7 2.7-7.2 5.4-7.2 5.4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="9"
        cy="20"
        r="1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle
        cx="17"
        cy="20"
        r="1.25"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3 4h2l1.6 9h11l1.5-7.5H7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeaderActions() {
  const { totalCount: wishlistCount } = useWishlist();
  const { totalCount: cartCount } = useCart();
  const [miniCartOpen, setMiniCartOpen] = useState(false);

  return (
    <>
      <div className="site-header-actions">
        <AppIconButton
          icon={<HeartIcon />}
          badgeCount={wishlistCount}
          href="/wishlist"
          size="md"
          variant="subtle"
          aria-label={
            wishlistCount > 0
              ? `Wishlist (${wishlistCount} items)`
              : "Wishlist"
          }
        />

        <AppIconButton
          icon={<CartIcon />}
          badgeCount={cartCount}
          onClick={() => setMiniCartOpen(true)}
          size="md"
          variant="subtle"
          aria-label={
            cartCount > 0
              ? `Cart (${cartCount} items)`
              : "Cart"
          }
        />
           <AppIconButton
    icon="👤"
    href="/my-account"
    aria-label="My account"
  />
        <div className="site-header-theme-toggle">
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