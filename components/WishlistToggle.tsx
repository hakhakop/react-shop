"use client";

import type { MouseEvent } from "react";
import { useState } from "react";
import { useWishlist } from "./WishlistProvider";
import { useToast } from "./ToastProvider";
import { SiteIcon } from "@/components/ui/SiteIcon";

type WishlistToggleProps = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
};

export default function WishlistToggle({
  id,
  slug,
  name,
  imageUrl,
}: WishlistToggleProps) {
  const { isInWishlist, toggleItem } = useWishlist();
  const { showToast } = useToast();

  // active if this product is currently in wishlist
  const active = isInWishlist(id);

  // local flag for "just added" heartbeat animation
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();

    // use the real API from WishlistProvider
    toggleItem({
      id,
      slug,
      name,
      imageUrl,
    });

    if (active) {
      showToast(`Removed ${name} from wishlist.`);
    } else {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 320);
      showToast(`Added ${name} to wishlist.`);
    }
  }

  const baseClass = "icon-ghost wishlist-toggle-icon";
  const activeClass = active ? " wishlist-toggle-icon-active" : "";
  const pulseClass = justAdded ? " wishlist-toggle-just-added" : "";

  return (
    <button
      type="button"
      onClick={handleClick}
      className={baseClass + activeClass + pulseClass}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <SiteIcon name="heart" className="wishlist-heart-icon" />
    </button>
  );
}
