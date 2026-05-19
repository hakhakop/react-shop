"use client";

import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

type Props = {
  id: string;
  productId?: string | number;
  slug: string;
  name: string;
  priceNumber: number | null;
  imageUrl?: string | null;
};

export default function AddToCartButton({
  id,
  productId,
  slug,
  name,
  priceNumber,
  imageUrl,
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
      1
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
    <button className="btn btn-primary" type="button" onClick={handleClick}>
      Add to cart
    </button>
  );
}
