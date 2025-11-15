"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartPageClient() {
  const { items, totalAmount, totalCount, removeItem, clearCart, updateItemQty } =
    useCart();

  const formatAMD = (value: number) =>
    value.toLocaleString("hy-AM", {
      style: "currency",
      currency: "AMD",
      maximumFractionDigits: 0,
    });

  const handleDecrease = (id: string, currentQty: number) => {
    const next = currentQty - 1;
    updateItemQty(id, next);
  };

  const handleIncrease = (id: string, currentQty: number) => {
    const next = currentQty + 1;
    updateItemQty(id, next);
  };

  return (
    <main className="page">
      <p className="product-back-link">
        <Link href="/">← Back to store</Link>
      </p>

      <h1 className="page-title">Cart</h1>

      {items.length === 0 ? (
        <p style={{ color: "#6b7280" }}>Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-summary">
            <span>{totalCount} items</span>
            <span className="cart-summary-total">
              Total: {formatAMD(totalAmount)}
            </span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={clearCart}
            >
              Clear cart
            </button>
          </div>

          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="product-image-placeholder">
                      No image
                    </div>
                  )}
                </div>
                <div className="cart-item-info">
                  <Link
                    href={`/product/${item.slug}`}
                    className="cart-item-name"
                  >
                    {item.name}
                  </Link>
                  <div className="cart-item-meta">
                    <span className="cart-item-price">
                      {formatAMD(item.price)}
                    </span>
                    <span className="cart-item-qty">
                      Qty: {item.qty}
                    </span>
                  </div>

                  <div className="cart-qty-controls">
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() =>
                        handleDecrease(item.id, item.qty)
                      }
                    >
                      −
                    </button>
                    <span className="cart-qty-value">{item.qty}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={() =>
                        handleIncrease(item.id, item.qty)
                      }
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-item-actions">
                  <button
                    type="button"
                    className="btn btn-small btn-outline"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}