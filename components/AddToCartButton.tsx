"use client";

import type { CSSProperties } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

type Props = {
  id: string;
  productId?: string | number;
  slug: string;
  name: string;
  priceNumber: number | null;
  imageUrl?: string | null;
  className?: string;
  style?: CSSProperties;
  display?: "button" | "icon";
};

export default function AddToCartButton({
  id,
  productId,
  slug,
  name,
  priceNumber,
  imageUrl,
  className,
  style,
  display = "button",
}: Props) {
  const { addItem } = useCart();
  const { showToast } = useToast();

  const canAdd = priceNumber !== null && !Number.isNaN(priceNumber);

  const handleClick = () => {
    if (!canAdd || priceNumber === null) return;
    addItem(
      {
        id,
        productId: productId ?? id,
        slug,
        name,
        price: priceNumber,
        imageUrl,
      },
      1,
    );
    showToast(`Added “${name}” to cart`);
  };

  if (!canAdd) {
    return (
      <button className="btn btn-disabled" type="button" disabled>
        Not purchasable
      </button>
    );
  }

  return (
    <button
      className={className ? `btn btn-primary ${className}` : "btn btn-primary"}
      style={style}
      type="button"
      onClick={handleClick}
      aria-label={display === "icon" ? `Add ${name} to cart` : undefined}
      title={display === "icon" ? "Add to cart" : undefined}
    >
      {display === "icon" ? (
        <ShoppingCart size={18} aria-hidden="true" />
      ) : (
        "Add to cart"
      )}
    </button>
  );
}
