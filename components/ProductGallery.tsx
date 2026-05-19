"use client";

import { type CSSProperties, useState } from "react";

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

export default function ProductGallery({
  images,
  name,
  showThumbnails = true,
  thumbnailPosition = "bottom",
  imageFit = "contain",
  height,
}: {
  images: WPImage[];
  name: string;
  showThumbnails?: boolean;
  thumbnailPosition?: "bottom" | "left";
  imageFit?: "contain" | "cover";
  height?: number;
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
    <div
      className={`product-gallery product-gallery--thumbs-${thumbnailPosition}`}
      style={
        {
          "--product-gallery-height": height ? `${height}px` : undefined,
          "--product-gallery-image-fit": imageFit,
        } as CSSProperties
      }
    >
      <div className="product-gallery-main">
        <div className="product-main-image">
          <img src={current.sourceUrl} alt={current.altText || name} />
        </div>
      </div>

      {showThumbnails && images.length > 1 && (
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
