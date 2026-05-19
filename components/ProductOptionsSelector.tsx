"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Check, Minus, Plus } from "lucide-react";
import { useCart } from "./CartProvider";
import { useToast } from "./ToastProvider";

type ProductOptionAttribute = {
  name: string;
  label: string;
  options: string[];
};

type Props = {
  id: string;
  productId?: string | number;
  variationId?: string | number | null;
  slug: string;
  name: string;
  priceNumber: number | null;
  imageUrl?: string | null;
  attributes?: ProductOptionAttribute[];
  previewMode?: boolean;
};

function cleanOption(value: string) {
  return value.trim();
}

function optionKey(label: string, value: string) {
  return `${label}:${value}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function optionDescription(label: string, value: string) {
  const normalizedLabel = label.toLowerCase();
  if (normalizedLabel.includes("size")) return `Size ${value}`;
  if (normalizedLabel.includes("color") || normalizedLabel.includes("colour")) {
    return value;
  }
  return `${label} ${value}`;
}

function formatPrice(value: number | null) {
  if (value === null || Number.isNaN(value)) return "";
  return value.toLocaleString("hy-AM", {
    style: "currency",
    currency: "AMD",
    maximumFractionDigits: 0,
  });
}

export default function ProductOptionsSelector({
  id,
  productId,
  variationId,
  slug,
  name,
  priceNumber,
  imageUrl,
  attributes = [],
  previewMode = false,
}: Props) {
  const { addItem } = useCart();
  const { showToast } = useToast();
  const displayAttributes = useMemo(
    () =>
      attributes
        .map((attribute) => ({
          ...attribute,
          options: Array.from(
            new Set((attribute.options ?? []).map(cleanOption).filter(Boolean))
          ),
        }))
        .filter((attribute) => attribute.options.length > 0),
    [attributes]
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const selectableAttributes = displayAttributes.filter(
    (attribute) => attribute.options.length > 1
  );

  const canAdd = priceNumber !== null && !Number.isNaN(priceNumber);
  const missingAttribute = selectableAttributes.find(
    (attribute) => !selectedOptions[attribute.name]
  );
  const selectionComplete = !missingAttribute;
  const buttonLabel = !canAdd
    ? "Not purchasable"
    : selectionComplete
      ? "Add to cart"
      : `Choose ${missingAttribute.label.toLowerCase()}`;
  const linePrice =
    canAdd && priceNumber !== null ? formatPrice(priceNumber * quantity) : "";

  const handleSelect = (attribute: ProductOptionAttribute, value: string) => {
    if (attribute.options.length <= 1) return;
    setSelectedOptions((current) => ({
      ...current,
      [attribute.name]: value,
    }));
  };

  const handleAdd = () => {
    if (!canAdd || priceNumber === null || !selectionComplete) return;
    if (previewMode) {
      showToast("Preview only - publish to use storefront cart");
      return;
    }

    const optionSummary = selectableAttributes
      .map((attribute) => ({
        label: attribute.label,
        value: selectedOptions[attribute.name],
      }))
      .filter((selection) => selection.value);
    const selectedId = optionSummary.length
      ? `${id}:${optionSummary
          .map((selection) => optionKey(selection.label, selection.value))
          .join(":")}`
      : id;
    const selectedName = optionSummary.length
      ? `${name} (${optionSummary
          .map((selection) => `${selection.label}: ${selection.value}`)
          .join(", ")})`
      : name;

    addItem(
      {
        id: selectedId,
        productId: productId ?? id,
        variationId: variationId ?? null,
        slug,
        name: selectedName,
        price: priceNumber,
        imageUrl,
      },
      quantity
    );
    showToast(`Added “${selectedName}” to cart`);
  };

  return (
    <div className="product-options-panel">
      {displayAttributes.map((attribute) => (
        <fieldset key={attribute.name} className="product-option-group">
          <legend>{attribute.label}</legend>
          <div className="product-option-values">
            {attribute.options.map((value) => {
              const selectedValue =
                selectedOptions[attribute.name] ??
                (attribute.options.length === 1 ? attribute.options[0] : "");
              const selected = selectedValue === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`product-option-chip${selected ? " is-selected" : ""}`}
                  aria-pressed={selected}
                  disabled={attribute.options.length <= 1}
                  onClick={() => handleSelect(attribute, value)}
                >
                  <strong>{value}</strong>
                  <span>{optionDescription(attribute.label, value)}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="product-options-buy-row">
        <div className="product-options-quantity" aria-label="Quantity">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
          >
            <Minus size={16} />
          </button>
          <span>{quantity}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQuantity((current) => current + 1)}
          >
            <Plus size={16} />
          </button>
        </div>
        {linePrice && <div className="product-options-price">{linePrice}</div>}
      </div>

      <div className="product-options-delivery">
        <CalendarDays size={17} />
        <span>
          <strong>Order before 22:00</strong>
          <em>Next day delivery - Shipping free</em>
        </span>
      </div>

      <div className="product-options-actions">
        <button
          className="btn btn-primary product-options-submit"
          type="button"
          onClick={handleAdd}
          disabled={!canAdd || !selectionComplete}
        >
          {buttonLabel}
        </button>
      </div>

      <ul className="product-options-promises">
        <li>
          <Check size={18} />
          <span>Free returns within 30 days</span>
        </li>
        <li>
          <Check size={18} />
          <span>Dispatched from and sold by Webpages</span>
        </li>
        <li>
          <Check size={18} />
          <span>Secure checkout with WooCommerce</span>
        </li>
      </ul>
    </div>
  );
}
