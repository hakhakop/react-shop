"use client";

import { useCart } from "./CartProvider";

export default function CartHeaderButton() {
  const { totalCount, openMiniCart } = useCart();

  return (
    <div className="cart-header-wrapper">
      <button
        type="button"
        onClick={openMiniCart}
        className="cart-header-button"
      >
        <span className="cart-header-icon">🛒</span>
        <span className="cart-header-label">Cart</span>
        {totalCount > 0 && (
          <span className="cart-header-count">{totalCount}</span>
        )}
      </button>
    </div>
  );
}