"use client";

import { useCart } from "./CartProvider";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

export default function MiniCart() {
  const {
    items,
    totalAmount,
    updateItemQty,
    removeItem,
    clearCart,
    isMiniCartOpen,
    closeMiniCart,
  } = useCart();

  // Prevent background scroll when mini cart is open Haua1 and Hawai new 11 11
  useEffect(() => {
    if (!isMiniCartOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isMiniCartOpen]);

  if (!isMiniCartOpen) return null;

  const hasItems = items.length > 0;

  return (
    <div className="mini-cart-overlay" role="dialog" aria-modal="true">
      <div className="mini-cart-backdrop" onClick={closeMiniCart} />

      <div className="mini-cart-panel">
        {/* Header */}
        <div className="mini-cart-header">
          <h2 className="mini-cart-title">Cart</h2>
          {hasItems && (
            <button
              type="button"
              className="mini-cart-clear"
              onClick={clearCart}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            className="mini-cart-close"
            onClick={closeMiniCart}
            aria-label="Close mini cart"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="mini-cart-content">
          {!hasItems && (
            <div className="mini-cart-empty">
              <p>Your cart is empty.</p>
              <button
                type="button"
                className="mini-cart-empty-button"
                onClick={closeMiniCart}
              >
                Continue shopping
              </button>
            </div>
          )}

          {hasItems && (
            <ul className="mini-cart-items">
              {items.map((item) => (
                <li key={item.id} className="mini-cart-item">
                  <div className="mini-cart-item-image">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        width={60}
                        height={60}
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <div className="mini-cart-item-image-placeholder">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mini-cart-item-main">
                    <Link
                      href={`/product/${item.slug}`}
                      className="mini-cart-item-name"
                      onClick={closeMiniCart}
                    >
                      {item.name}
                    </Link>
                    <div className="mini-cart-item-price-row">
                      <span className="mini-cart-item-price">
                        {(item.price * item.qty).toLocaleString("hy-AM", {
                          style: "currency",
                          currency: "AMD",
                          maximumFractionDigits: 0,
                        })}
                      </span>
                      <button
                        type="button"
                        className="mini-cart-item-remove"
                        onClick={() => removeItem(item.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mini-cart-item-qty">
                      <button
                        type="button"
                        onClick={() =>
                          updateItemQty(item.id, Math.max(0, item.qty - 1))
                        }
                      >
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          updateItemQty(item.id, item.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {hasItems && (
          <div className="mini-cart-footer">
            <div className="mini-cart-summary">
              <span>Total</span>
              <span className="mini-cart-total">
                {totalAmount.toLocaleString("hy-AM", {
                  style: "currency",
                  currency: "AMD",
                  maximumFractionDigits: 0,
                })}
              </span>
            </div>
            <div className="mini-cart-actions">
              <Link
                href="/cart"
                className="mini-cart-button secondary"
                onClick={closeMiniCart}
              >
                View cart
              </Link>
              <Link
                href="/checkout"
                className="mini-cart-button primary"
                onClick={closeMiniCart}
              >
                Checkout
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}