"use client";

import Link from "next/link";
import { useWishlist } from "./WishlistProvider";

export default function WishlistHeaderButton() {
  const { totalCount } = useWishlist();

  return (
    <Link
      href="/wishlist"
      className="wishlist-header-button"
    >
      <span className="wishlist-header-icon">♥</span>
      <span className="wishlist-header-label">Wishlist</span>
      {totalCount > 0 && (
        <span className="wishlist-header-count">
          {totalCount}
        </span>
      )}
    </Link>
  );
}