"use client";

import { AppIconButton } from "@/components/ui/AppIconButton";
import { useWishlist } from "./WishlistProvider";

export default function WishlistHeaderButton() {
  const { totalCount } = useWishlist();

  return (
    <AppIconButton
      icon="♥"
      badgeCount={totalCount}
      href="/wishlist"
      aria-label={
        totalCount > 0
          ? `Wishlist (${totalCount} items)`
          : "Wishlist"
      }
    />
  );
}