"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";
import { useCart } from "./CartProvider";

export default function CartPageClient() {
  const { items, totalAmount, totalCount, removeItem, clearCart, updateItemQty } =
    useCart();

  const formatAMD = (value: number) =>
    `${value.toLocaleString("hy-AM", {
      maximumFractionDigits: 0,
    })} ֏`;

  const handleDecrease = (id: string, currentQty: number) => {
    const next = currentQty - 1;
    updateItemQty(id, next);
  };

  const handleIncrease = (id: string, currentQty: number) => {
    const next = currentQty + 1;
    updateItemQty(id, next);
  };

  const estimatedProtection = totalAmount > 0 ? Math.max(1, Math.round(totalAmount * 0.02)) : 0;

  return (
    <main className="cart-page">
      <section className="cart-hero" aria-labelledby="cart-title">
        <div>
          <Link href="/shop" className="cart-back-link">
            Back to shop
          </Link>
          <h1 id="cart-title">Cart</h1>
          <p>
            Review your pieces, adjust quantities, then move into the React
            checkout flow.
          </p>
        </div>

        <div className="cart-hero-status">
          <span>
            <ShoppingBag size={16} />
            {totalCount} {totalCount === 1 ? "item" : "items"}
          </span>
          <span>
            <ShieldCheck size={16} />
            WooCommerce order
          </span>
          <span>
            <Truck size={16} />
            Payment next
          </span>
        </div>
      </section>

      {items.length === 0 ? (
        <section className="cart-empty">
          <span>
            <ShoppingBag size={30} />
          </span>
          <h2>Your cart is empty</h2>
          <p>Save a few products here before starting checkout.</p>
          <div>
            <Link href="/shop" className="cart-primary-action">
              Start shopping
              <ArrowRight size={16} />
            </Link>
            <Link href="/" className="cart-secondary-action">
              Browse home
            </Link>
          </div>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items-panel" aria-label="Cart items">
            <div className="cart-section-heading">
              <div>
                <h2>Your selection</h2>
                <p>Update quantities or remove items before checkout.</p>
              </div>
              <button type="button" className="cart-clear-button" onClick={clearCart}>
                <Trash2 size={15} />
                Clear
              </button>
            </div>

            <div className="cart-items">
              {items.map((item) => {
                const lineTotal = item.price * item.qty;

                return (
                  <article key={item.id} className="cart-item">
                    <Link href={`/product/${item.slug}`} className="cart-item-image">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={112}
                          height={112}
                        />
                      ) : (
                        <span>No image</span>
                      )}
                    </Link>

                    <div className="cart-item-info">
                      <Link href={`/product/${item.slug}`} className="cart-item-name">
                        {item.name}
                      </Link>
                      <div className="cart-item-meta">
                        <span>{formatAMD(item.price)} each</span>
                        <span>{formatAMD(lineTotal)} line total</span>
                      </div>
                      <div className="cart-item-mobile-price">
                        {formatAMD(lineTotal)}
                      </div>
                    </div>

                    <div className="cart-qty-controls" aria-label={`Quantity for ${item.name}`}>
                    <button
                      type="button"
                      className="cart-qty-btn"
                        onClick={() => handleDecrease(item.id, item.qty)}
                        aria-label={`Decrease ${item.name} quantity`}
                    >
                        <Minus size={14} />
                    </button>
                    <span className="cart-qty-value">{item.qty}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                        onClick={() => handleIncrease(item.id, item.qty)}
                        aria-label={`Increase ${item.name} quantity`}
                    >
                        <Plus size={14} />
                    </button>
                  </div>

                    <div className="cart-item-total">{formatAMD(lineTotal)}</div>

                  <button
                    type="button"
                      className="cart-remove-button"
                    onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                  >
                      <Trash2 size={16} />
                  </button>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="cart-summary-card" aria-label="Cart summary">
            <div className="cart-summary-heading">
              <span>
                <PackageCheck size={19} />
              </span>
              <div>
                <h2>Order preview</h2>
                <p>Final shipping and taxes happen in WooCommerce.</p>
              </div>
            </div>

            <div className="cart-summary-lines">
              <div>
                <span>Items</span>
                <strong>{totalCount}</strong>
              </div>
              <div>
                <span>Subtotal</span>
                <strong>{formatAMD(totalAmount)}</strong>
              </div>
              <div>
                <span>Estimated protection</span>
                <em>{formatAMD(estimatedProtection)}</em>
              </div>
              <div>
                <span>Shipping</span>
                <em>Calculated next</em>
              </div>
              <div className="cart-summary-total-row">
                <span>Cart total</span>
                <strong>{formatAMD(totalAmount)}</strong>
              </div>
            </div>

            <Link href="/checkout" className="cart-checkout-button">
              Continue to checkout
              <ArrowRight size={16} />
            </Link>

            <Link href="/shop" className="cart-continue-link">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
