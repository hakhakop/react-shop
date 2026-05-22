"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  LockKeyhole,
  PackageCheck,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { CartItem, useCart } from "./CartProvider";
import { useWordPressSession } from "./useWordPressSession";

const wordpressBaseUrl = process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL ?? null;

type CheckoutPageClientProps = {
  asSlot?: boolean;
};

type CheckoutAddress = {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

type CheckoutCartItem = CartItem & {
  key?: string;
  quantity?: number;
  databaseId?: string | number;
  productSlug?: string;
  title?: string;
  image?: {
    sourceUrl?: string | null;
    src?: string | null;
    altText?: string | null;
    alt?: string | null;
  } | null;
};

type CheckoutCustomerAddress = CheckoutAddress & {
  company?: string;
  email?: string;
  phone?: string;
};

type CheckoutCustomerProfile = {
  id?: number;
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  billing?: CheckoutCustomerAddress;
  shipping?: CheckoutCustomerAddress;
};

function formatPrice(amount: number): string {
  if (!amount || Number.isNaN(amount)) return "0 ֏";
  return `${amount.toLocaleString("hy-AM", {
    maximumFractionDigits: 0,
  })} ֏`;
}

function getCartItemQuantity(item: CheckoutCartItem) {
  return item.quantity ?? item.qty ?? 1;
}

function getCartItemPrice(item: CheckoutCartItem) {
  return typeof item.price === "number"
    ? item.price
    : parseFloat(String(item.price ?? "0")) || 0;
}

function getField(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function getAddress(formData: FormData, prefix: "shipping" | "billing"): CheckoutAddress {
  return {
    firstName: getField(formData, `${prefix}FirstName`),
    lastName: getField(formData, `${prefix}LastName`),
    address1: getField(formData, `${prefix}Address1`),
    address2: getField(formData, `${prefix}Address2`),
    city: getField(formData, `${prefix}City`),
    state: getField(formData, `${prefix}State`),
    postcode: getField(formData, `${prefix}Postcode`),
    country: getField(formData, `${prefix}Country`) || "AM",
  };
}

export default function CheckoutPageClient({
  asSlot = false,
}: CheckoutPageClientProps) {
  const { items, clearCart } = useCart();
  const checkoutItems = items as CheckoutCartItem[];
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [customerProfile, setCustomerProfile] =
    useState<CheckoutCustomerProfile | null>(null);
  const [billingMatchesShipping, setBillingMatchesShipping] = useState(true);
  const { session } = useWordPressSession(wordpressBaseUrl);

  const loggedInCustomer =
    session.status === "logged-in" && session.id
      ? {
          id: session.id,
          name: session.name,
          email: session.email ?? "",
        }
      : null;

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + getCartItemPrice(item) * getCartItemQuantity(item),
        0
      ),
    [checkoutItems]
  );

  const itemCount = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + getCartItemQuantity(item), 0),
    [checkoutItems]
  );

  const hasItems = checkoutItems.length > 0;
  const [defaultFirstName = "", ...defaultLastNameParts] =
    loggedInCustomer?.name?.split(" ") ?? [];
  const defaultLastName = defaultLastNameParts.join(" ");
  const fallbackFirstName =
    customerProfile?.shipping?.firstName ||
    customerProfile?.billing?.firstName ||
    customerProfile?.firstName ||
    defaultFirstName;
  const fallbackLastName =
    customerProfile?.shipping?.lastName ||
    customerProfile?.billing?.lastName ||
    customerProfile?.lastName ||
    defaultLastName;
  const fallbackEmail =
    customerProfile?.billing?.email ||
    customerProfile?.email ||
    loggedInCustomer?.email ||
    "";
  const fallbackPhone = customerProfile?.billing?.phone || "";
  const shippingDefaults = customerProfile?.shipping;
  const billingDefaults = customerProfile?.billing;

  useEffect(() => {
    if (session.status !== "logged-in" || !session.id) {
      setCustomerProfile(null);
      setProfileMessage(null);
      return;
    }

    let cancelled = false;
    setProfileMessage("Loading saved WooCommerce details...");

    fetch(`/api/account/customer?customerId=${encodeURIComponent(session.id)}`, {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(
            payload?.message || "Saved WooCommerce details could not be loaded."
          );
        }
        return payload as CheckoutCustomerProfile;
      })
      .then((profile) => {
        if (cancelled) return;
        setCustomerProfile(profile);
        setProfileMessage("Saved WooCommerce details loaded.");
      })
      .catch((caughtError) => {
        if (cancelled) return;
        setCustomerProfile(null);
        setProfileMessage(
          caughtError instanceof Error
            ? caughtError.message
            : "Saved WooCommerce details could not be loaded."
        );
      });

    return () => {
      cancelled = true;
    };
  }, [session]);

  async function handlePlaceOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasItems || placing) return;

    setPlacing(true);
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = getField(formData, "email");
    const phone = getField(formData, "phone");
    const shipping = getAddress(formData, "shipping");
    const billing = billingMatchesShipping
      ? shipping
      : getAddress(formData, "billing");
    const name = `${billing.firstName} ${billing.lastName}`.trim();

    const itemsPayload = checkoutItems.map((item) => ({
      productId: item.productId ?? item.databaseId ?? item.id,
      variationId: item.variationId ?? null,
      quantity: getCartItemQuantity(item),
    }));

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            customerId: loggedInCustomer?.id,
            name,
            email,
            phone,
            billing,
            shipping,
            customerNote: getField(formData, "customerNote"),
          },
          items: itemsPayload,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message || "Failed to create order in WooCommerce."
        );
      }

      clearCart();

      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      form.reset();
      setPlaced(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Something went wrong while placing the order. Please try again."
      );
    } finally {
      setPlacing(false);
    }
  }

  const content = (
    <>
      <section className="checkout-hero" aria-labelledby="checkout-title">
        <div>
          <Link href="/cart" className="checkout-back-link">
            Back to cart
          </Link>
          <h1 id="checkout-title">Checkout</h1>
          <p>
            Complete your details here, then continue to WooCommerce for secure
            payment.
          </p>
        </div>
        <div className="checkout-trust-strip" aria-label="Checkout assurances">
          <span>
            <ShieldCheck size={16} />
            Secure order
          </span>
          <span>
            <PackageCheck size={16} />
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
          <span>
            <Truck size={16} />
            Shipping calculated next
          </span>
        </div>
      </section>

      {error && (
        <div className="checkout-alert checkout-alert--error" role="alert">
          {error}
        </div>
      )}

      {!hasItems && !placed && (
        <section className="checkout-empty">
          <PackageCheck size={30} />
          <h2>Your cart is empty</h2>
          <p>Add a few products before starting checkout.</p>
          <div>
            <Link href="/shop" className="checkout-primary-link">
              Continue shopping
            </Link>
            <Link href="/cart" className="checkout-secondary-link">
              View cart
            </Link>
          </div>
        </section>
      )}

      {!hasItems && placed && (
        <section className="checkout-complete">
          <CheckCircle2 size={32} />
          <h2>Order created</h2>
          <p>
            Your order was created in WooCommerce. If no payment page opened,
            you can continue shopping and we can inspect the payment URL next.
          </p>
          <Link href="/shop" className="checkout-primary-link">
            Back to shop
          </Link>
        </section>
      )}

      {hasItems && (
        <form
          key={customerProfile?.id ?? session.status}
          className="checkout-layout"
          onSubmit={handlePlaceOrder}
        >
          <div className="checkout-form-stack">
            <section className="checkout-panel">
              <div className="checkout-panel-heading">
                <span>01</span>
                <div>
                  <h2>Contact</h2>
                  <p>Used for order updates and receipts.</p>
                </div>
              </div>

              {session.status === "logged-in" && (
                <div className="checkout-session checkout-session--success">
                  Signed in as <strong>{session.name}</strong>. This order will
                  be attached to your WordPress customer account.
                </div>
              )}

              {session.status === "logged-in" && profileMessage && (
                <div className="checkout-session checkout-session--profile">
                  {profileMessage}
                </div>
              )}

              {session.status === "logged-out" && (
                <div className="checkout-session">
                  Checking out as guest. Sign in from My account if you want the
                  order saved to a WordPress user.
                </div>
              )}

              <div className="checkout-field-grid checkout-field-grid--two">
                <label className="checkout-field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    defaultValue={fallbackEmail}
                    placeholder="you@example.com"
                  />
                </label>
                <label className="checkout-field">
                  <span>Phone</span>
                  <input
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    defaultValue={fallbackPhone}
                    placeholder="+374"
                  />
                </label>
              </div>
            </section>

            <section className="checkout-panel">
              <div className="checkout-panel-heading">
                <span>02</span>
                <div>
                  <h2>Shipping address</h2>
                  <p>Where WooCommerce should send the order.</p>
                </div>
              </div>

              <div className="checkout-field-grid checkout-field-grid--two">
                <label className="checkout-field">
                  <span>First name</span>
                  <input
                    type="text"
                    name="shippingFirstName"
                    required
                    autoComplete="given-name"
                    defaultValue={fallbackFirstName}
                  />
                </label>
                <label className="checkout-field">
                  <span>Last name</span>
                  <input
                    type="text"
                    name="shippingLastName"
                    required
                    autoComplete="family-name"
                    defaultValue={fallbackLastName}
                  />
                </label>
              </div>

              <label className="checkout-field">
                <span>Address</span>
                <input
                  type="text"
                  name="shippingAddress1"
                  required
                  autoComplete="shipping address-line1"
                  defaultValue={shippingDefaults?.address1 || billingDefaults?.address1 || ""}
                  placeholder="Street and house number"
                />
              </label>

              <label className="checkout-field">
                <span>Apartment, suite, floor</span>
                <input
                  type="text"
                  name="shippingAddress2"
                  autoComplete="shipping address-line2"
                  defaultValue={shippingDefaults?.address2 || billingDefaults?.address2 || ""}
                  placeholder="Optional"
                />
              </label>

              <div className="checkout-field-grid checkout-field-grid--three">
                <label className="checkout-field">
                  <span>City</span>
                  <input
                    type="text"
                    name="shippingCity"
                    required
                    autoComplete="shipping address-level2"
                    defaultValue={shippingDefaults?.city || billingDefaults?.city || "Yerevan"}
                  />
                </label>
                <label className="checkout-field">
                  <span>Region</span>
                  <input
                    type="text"
                    name="shippingState"
                    autoComplete="shipping address-level1"
                    defaultValue={shippingDefaults?.state || billingDefaults?.state || ""}
                  />
                </label>
                <label className="checkout-field">
                  <span>Postcode</span>
                  <input
                    type="text"
                    name="shippingPostcode"
                    autoComplete="shipping postal-code"
                    defaultValue={shippingDefaults?.postcode || billingDefaults?.postcode || ""}
                  />
                </label>
              </div>

              <label className="checkout-field checkout-field--compact">
                <span>Country</span>
                <select
                  name="shippingCountry"
                  required
                  autoComplete="shipping country"
                  defaultValue={shippingDefaults?.country || billingDefaults?.country || "AM"}
                >
                  <option value="AM">Armenia</option>
                  <option value="US">United States</option>
                  <option value="GE">Georgia</option>
                  <option value="FR">France</option>
                </select>
              </label>
            </section>

            <section className="checkout-panel">
              <div className="checkout-panel-heading">
                <span>03</span>
                <div>
                  <h2>Billing</h2>
                  <p>Use the same address, or enter billing details.</p>
                </div>
              </div>

              <label className="checkout-check-row">
                <input
                  type="checkbox"
                  checked={billingMatchesShipping}
                  onChange={(event) =>
                    setBillingMatchesShipping(event.currentTarget.checked)
                  }
                />
                <span>Billing address is the same as shipping</span>
              </label>

              {!billingMatchesShipping && (
                <div className="checkout-billing-fields">
                  <div className="checkout-field-grid checkout-field-grid--two">
                    <label className="checkout-field">
                      <span>First name</span>
                      <input
                        type="text"
                        name="billingFirstName"
                        required
                        defaultValue={billingDefaults?.firstName || fallbackFirstName}
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Last name</span>
                      <input
                        type="text"
                        name="billingLastName"
                        required
                        defaultValue={billingDefaults?.lastName || fallbackLastName}
                      />
                    </label>
                  </div>
                  <label className="checkout-field">
                    <span>Billing address</span>
                    <input
                      type="text"
                      name="billingAddress1"
                      required
                      defaultValue={billingDefaults?.address1 || ""}
                    />
                  </label>
                  <label className="checkout-field">
                    <span>Apartment, suite, floor</span>
                    <input
                      type="text"
                      name="billingAddress2"
                      defaultValue={billingDefaults?.address2 || ""}
                    />
                  </label>
                  <div className="checkout-field-grid checkout-field-grid--three">
                    <label className="checkout-field">
                      <span>City</span>
                      <input
                        type="text"
                        name="billingCity"
                        required
                        defaultValue={billingDefaults?.city || ""}
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Region</span>
                      <input
                        type="text"
                        name="billingState"
                        defaultValue={billingDefaults?.state || ""}
                      />
                    </label>
                    <label className="checkout-field">
                      <span>Postcode</span>
                      <input
                        type="text"
                        name="billingPostcode"
                        defaultValue={billingDefaults?.postcode || ""}
                      />
                    </label>
                  </div>
                  <label className="checkout-field checkout-field--compact">
                    <span>Country</span>
                    <select
                      name="billingCountry"
                      required
                      defaultValue={billingDefaults?.country || "AM"}
                    >
                      <option value="AM">Armenia</option>
                      <option value="US">United States</option>
                      <option value="GE">Georgia</option>
                      <option value="FR">France</option>
                    </select>
                  </label>
                </div>
              )}

              <label className="checkout-field">
                <span>Order notes</span>
                <textarea
                  name="customerNote"
                  rows={4}
                  placeholder="Delivery notes, preferred time, or anything we should know."
                />
              </label>
            </section>

          </div>

          <aside className="checkout-summary" aria-label="Order summary">
            <div className="checkout-summary-card">
              <div className="checkout-summary-heading">
                <div>
                  <h2>Order summary</h2>
                  <p>{itemCount} {itemCount === 1 ? "item" : "items"} in cart</p>
                </div>
                <LockKeyhole size={18} />
              </div>

              <ul className="checkout-summary-list">
                {checkoutItems.map((item) => {
                  const qty = getCartItemQuantity(item);
                  const lineTotal = getCartItemPrice(item) * qty;
                  const slug = item.productSlug || item.slug || "";
                  const name = item.name || item.title || "Product";
                  const imageSrc =
                    item.image?.sourceUrl ||
                    item.imageUrl ||
                    item.image?.src ||
                    null;
                  const imageAlt = item.image?.altText || item.image?.alt || name;

                  return (
                    <li key={item.key || slug || name}>
                      <div className="checkout-summary-image">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={imageAlt}
                            width={72}
                            height={72}
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </div>
                      <div className="checkout-summary-item-main">
                        {slug ? (
                          <Link href={`/product/${slug}`}>{name}</Link>
                        ) : (
                          <strong>{name}</strong>
                        )}
                        <span>Qty {qty}</span>
                      </div>
                      <strong className="checkout-summary-price">
                        {formatPrice(lineTotal)}
                      </strong>
                    </li>
                  );
                })}
              </ul>

              <div className="checkout-totals">
                <div>
                  <span>Subtotal</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
                <div>
                  <span>Shipping</span>
                  <em>Calculated in WooCommerce</em>
                </div>
                <div>
                  <span>Taxes</span>
                  <em>Calculated in WooCommerce</em>
                </div>
                <div className="checkout-total-row">
                  <span>Due now</span>
                  <strong>{formatPrice(subtotal)}</strong>
                </div>
              </div>

              <button
                type="submit"
                className="checkout-place-order"
                disabled={placing}
              >
                <LockKeyhole size={16} />
                {placing ? "Creating order..." : "Continue to payment"}
              </button>

            <p className="checkout-payment-note">
              We create the WooCommerce order first, then hand you to the
              store payment page.
            </p>
          </div>
        </aside>
      </form>
      )}
    </>
  );

  if (asSlot) {
    return content;
  }

  return <main className="checkout-page">{content}</main>;
}
