"use client";

import type { ReactNode } from "react";
import { useCart } from "@/components/CartProvider";
import type { BuilderLayoutBlock } from "@/lib/builderLayouts";

type CartElementProps = {
  block: BuilderLayoutBlock;
  page?: string;
  pageContent?: ReactNode;
};

/**
 * The authored Cart element owns both inline and floating presentation. Cart
 * state and the drawer remain shared with the header through CartProvider.
 */
export default function CartElement({ block, page, pageContent }: CartElementProps) {
  const { totalCount = 0, totalAmount = 0, openMiniCart } = useCart();
  const presentation = block.cartPresentation ?? "inline";
  const position = block.cartFloatingPosition ?? "bottom-right";
  const isCartPage = page === "page:cart";

  if (isCartPage && presentation === "inline" && pageContent) {
    return <>{pageContent}</>;
  }

  const summary = (
    <button
      type="button"
      onClick={openMiniCart}
      className="cart-element-summary"
      aria-label={`Open cart (${totalCount} items)`}
    >
      <span className="cart-element-summary-icon" aria-hidden="true">🛒</span>
      <span className="cart-element-summary-copy">
        <strong>Cart</strong>
        <span>{totalCount} {totalCount === 1 ? "item" : "items"}</span>
      </span>
      <span className="cart-element-summary-total">
        {totalAmount.toLocaleString("hy-AM", { maximumFractionDigits: 0 })} ֏
      </span>
    </button>
  );

  if (presentation === "floating") {
    return (
      <div className={`cart-element-floating cart-element-floating--${position}`}>
        {summary}
      </div>
    );
  }

  return <div className="cart-element-inline">{summary}</div>;
}
