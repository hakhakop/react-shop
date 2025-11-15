"use client";

import { useState } from "react";

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

export default function ProductGallery({
  images,
  name,
}: {
  images: WPImage[];
  name: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // No images → fallback placeholder
  if (!images || images.length === 0) {
    return (
      <div className="product-main-image">
        <div className="product-image-placeholder">No image</div>
      </div>
    );
  }

  const current = images[Math.min(selectedIndex, images.length - 1)];

  return (
    <div>
      <div className="product-gallery-main">
        <div className="product-main-image">
          <img src={current.sourceUrl} alt={current.altText || name} />
        </div>
      </div>

      {images.length > 1 && (
        <div className="product-gallery-thumbs">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              className={
                "product-gallery-thumb" +
                (idx === selectedIndex ? " product-gallery-thumb-active" : "")
              }
              onClick={() => setSelectedIndex(idx)}
            >
              <img src={img.sourceUrl} alt={img.altText || name} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}