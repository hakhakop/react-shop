"use client";

import { useEffect } from "react";

type ProductAdminMarkerProps = {
  productId?: number | null;
};

const DATA_ATTR = "wpProductId";
const EVENT_NAME = "react-shop:product-edit-target";

export default function ProductAdminMarker({
  productId,
}: ProductAdminMarkerProps) {
  useEffect(() => {
    if (!productId) return;

    document.body.dataset[DATA_ATTR] = String(productId);
    window.dispatchEvent(
      new CustomEvent(EVENT_NAME, {
        detail: { productId },
      }),
    );

    return () => {
      if (document.body.dataset[DATA_ATTR] === String(productId)) {
        delete document.body.dataset[DATA_ATTR];
      }
      window.dispatchEvent(
        new CustomEvent(EVENT_NAME, {
          detail: { productId: null },
        }),
      );
    };
  }, [productId]);

  return null;
}
