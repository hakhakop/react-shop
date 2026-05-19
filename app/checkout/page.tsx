"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../../components/CartProvider";


type AnyCartItem = any;

function formatPrice(amount: number): string {
  if (!amount || Number.isNaN(amount)) return "0 ֏";
  return amount.toLocaleString("hy-AM", {
    style: "currency",
    currency: "AMD",
    maximumFractionDigits: 0,
  });
}

export default function CheckoutPage() {
  const { items, clearCart } = useCart() as {
    items: AnyCartItem[];
    clearCart: () => void;
  };

  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = (items || []).reduce((sum, item: AnyCartItem) => {
    const rawPrice =
      typeof item.price === "number"
        ? item.price
        : parseFloat(item.price ?? "0") || 0;
    const qty = item.quantity ?? item.qty ?? 1;
    return sum + rawPrice * qty;
  }, 0);

  const hasItems = items && items.length > 0;

  async function handlePlaceOrder(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!hasItems || placing) return;

    setPlacing(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const phone = String(formData.get("phone") || "");
    const address = String(formData.get("address") || "");

    const itemsPayload = (items || []).map((item: AnyCartItem) => ({
      productId: item.productId ?? item.databaseId ?? item.id,
      variationId: item.variationId ?? null,
      quantity: item.quantity ?? item.qty ?? 1,
    }));

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: { name, email, phone, address },
          items: itemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || "Failed to create order in WooCommerce."
        );
      }

      if (data.checkoutUrl) {
        clearCart();
        window.location.assign(data.checkoutUrl);
        return;
      }

      // Fallback: order created, but WooCommerce did not return a payment URL.
      clearCart();
      form.reset();
      setPlaced(true);
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(
        err?.message ||
          "Something went wrong while placing the order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  }

  return (
    <main className="page">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">
        Review your order and enter your details to complete the purchase.
      </p>

      {error && (
        <div
          style={{
            marginTop: "10px",
            padding: "8px 10px",
            borderRadius: "10px",
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {/* Empty state */}
      {!hasItems && !placed && (
        <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "8px" }}>
          Your cart is empty.{" "}
          <Link href="/cart" style={{ color: "#be185d" }}>
            Go back to cart
          </Link>{" "}
          or{" "}
          <Link href="/" style={{ color: "#be185d" }}>
            continue shopping
          </Link>
          .
        </div>
      )}

      {/* After "order" placed */}
      {!hasItems && placed && (
        <div
          style={{
            marginTop: "12px",
            padding: "12px 14px",
            borderRadius: "12px",
            background: "#ecfdf3",
            border: "1px solid #bbf7d0",
            fontSize: "14px",
            color: "#166534",
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: "4px" }}>
            Thank you! 💗
          </div>
          <div>
            Your order was created in WooCommerce. WooCommerce did not return a
            payment URL, so we stayed here.
          </div>
          <div style={{ marginTop: "8px" }}>
            <Link href="/" style={{ color: "#15803d" }}>
              Back to store
            </Link>
          </div>
        </div>
      )}

      {hasItems && (
        <div
          style={{
            display: "grid",
            gap: "24px",
            marginTop: "20px",
          }}
        >
          {/* 2-column layout on larger screens */}
          <div
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            {/* Customer details + Place order */}
            <form onSubmit={handlePlaceOrder}>
              <div
                style={{
                  borderRadius: "16px",
                  border: "1px solid #e5e7eb",
                  background: "#ffffff",
                  padding: "16px 16px 18px",
                  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
                  marginBottom: "16px",
                }}
              >
                <h2
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    marginBottom: "10px",
                    letterSpacing: "-0.01em",
                    color: "#0f172a",
                  }}
                >
                  Contact details
                </h2>

                <div
                  style={{
                    display: "grid",
                    gap: "10px",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Full name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "12px",
                        color: "#6b7280",
                        marginBottom: "4px",
                      }}
                    >
                      Address
                    </label>
                    <textarea
                      name="address"
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "10px",
                        border: "1px solid #e5e7eb",
                        fontSize: "14px",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={placing}
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      opacity: placing ? 0.7 : 1,
                    }}
                  >
                    {placing ? "Connecting to WooCommerce…" : "Continue to WooCommerce checkout"}
                  </button>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      textAlign: "center",
                    }}
                  >
                    This creates the WooCommerce order, then hands the customer
                    to WooCommerce for payment.
                  </div>
                </div>
              </div>
            </form>

            {/* Order summary */}
            <div
              style={{
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                padding: "16px 16px 18px",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
              }}
            >
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: 600,
                  marginBottom: "10px",
                  letterSpacing: "-0.01em",
                  color: "#0f172a",
                }}
              >
                Order summary
              </h2>

              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  marginBottom: "12px",
                }}
              >
                {items.map((item: AnyCartItem) => {
                  const qty = item.quantity ?? item.qty ?? 1;
                  const rawPrice =
                    typeof item.price === "number"
                      ? item.price
                      : parseFloat(item.price ?? "0") || 0;
                  const lineTotal = rawPrice * qty;

                  const slug = item.productSlug || item.slug || "";
                  const name = item.name || item.title || "Product";
                  const imageSrc =
                    item.image?.sourceUrl ||
                    item.imageUrl ||
                    item.image?.src ||
                    null;
                  const imageAlt =
                    item.image?.altText || item.image?.alt || name;

                  return (
                    <li
                      key={item.key || slug || name}
                      style={{ display: "flex", gap: "10px" }}
                    >
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "10px",
                          background: "#f9fafb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          flexShrink: 0,
                        }}
                      >
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={imageAlt}
                            width={56}
                            height={56}
                            style={{ objectFit: "contain" }}
                          />
                        ) : (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#9ca3af",
                              textAlign: "center",
                            }}
                          >
                            No image
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        {slug ? (
                          <Link
                            href={`/product/${slug}`}
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#111827",
                              textDecoration: "none",
                            }}
                          >
                            {name}
                          </Link>
                        ) : (
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: 500,
                              color: "#111827",
                            }}
                          >
                            {name}
                          </div>
                        )}

                        <div
                          style={{
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          Qty: {qty}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color: "#b91c1c",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatPrice(lineTotal)}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: "10px",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Subtotal</span>
                <span style={{ fontWeight: 600 }}>
                  {formatPrice(subtotal)}
                </span>
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "12px",
                  color: "#6b7280",
                }}
              >
                Taxes, shipping and payment gateway details can be added later
                in a more advanced flow.
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
