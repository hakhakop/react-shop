"use client";

import Link from "next/link";
import { useWishlist } from "./WishlistProvider";

export default function WishlistPageClient() {
  const { items, removeItem, clearWishlist } = useWishlist();

  return (
    <main className="page">
      <p className="product-back-link">
        <Link href="/">← Back to store</Link>
      </p>

      <h1 className="page-title">Wishlist</h1>

      {items.length === 0 ? (
        <p style={{ color: "#6b7280" }}>
          Your wishlist is empty.
        </p>
      ) : (
        <>
          <div className="cart-summary">
            <span>{items.length} item{items.length === 1 ? "" : "s"}</span>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={clearWishlist}
            >
              Clear wishlist
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
                    <span>Saved in wishlist</span>
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