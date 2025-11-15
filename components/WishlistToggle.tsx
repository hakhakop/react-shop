"use client";

import { MouseEvent } from "react";
import { useWishlist } from "./WishlistProvider";
import { useToast } from "./ToastProvider";

type Props = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
};

export default function WishlistToggle({
  id,
  slug,
  name,
  imageUrl,
}: Props) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { showToast } = useToast();

  const active = isInWishlist(id);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    // prevent card/link navigation
    e.preventDefault();
    e.stopPropagation();

    toggleItem({ id, slug, name, imageUrl });

    if (active) {
      showToast(`Removed “${name}” from wishlist`);
    } else {
      showToast(`Added “${name}” to wishlist`);
    }
  };

  return (
    <button
      type="button"
      className={
        "wishlist-toggle-btn" +
        (active ? " wishlist-toggle-btn-active" : "")
      }
      onClick={handleClick}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <span className="wishlist-heart">
        {active ? "♥" : "♡"}
      </span>
    </button>
  );
}