"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import MiniCart from "./MiniCart";

export default function CartHeaderButton() {
  const { totalCount } = useCart();
  const [open, setOpen] = useState(false);

  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  return (
    <div className="cart-header-wrapper">
      <button
        type="button"
        onClick={toggle}
        className="cart-header-button"
      >
        <span className="cart-header-icon">🛒</span>
        <span className="cart-header-label">Cart</span>
        {totalCount > 0 && (
          <span className="cart-header-count">{totalCount}</span>
        )}
      </button>

      <MiniCart open={open} onClose={close} />
    </div>
  );
}