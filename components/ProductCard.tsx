import Link from "next/link";
import Image from "next/image";
import WishlistToggle from "./WishlistToggle";

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

export type BasicProduct = {
  id: string;
  slug: string;
  name: string;
  image?: WPImage | null;
  price?: string | null;
};

export default function ProductCard({
  product,
  preset,
}: {
  product: BasicProduct;
  preset?: string;
}) {
  const priceNumber = product.price ? parseFloat(product.price) : null;
  const imageUrl = product.image?.sourceUrl || undefined;

  return (
    <div className="product-card" data-preset={preset || "default"}>
      <div className="product-card-top-right">
        <WishlistToggle
          id={product.id}
          slug={product.slug}
          name={product.name}
          imageUrl={imageUrl}
        />
      </div>

      <Link
        href={`/product/${product.slug}`}
        className="product-card-link"
      >
        <div className="product-image">
          {product.image?.sourceUrl ? (
            <Image
              src={product.image.sourceUrl}
              alt={product.image.altText || product.name}
              width={400}
              height={300}
              style={{
                objectFit: "var(--product-image-object-fit, contain)" as any,
              }}
            />
          ) : (
            <div className="product-image-placeholder">No image</div>
          )}
        </div>

        <h3 className="product-title product-title-2lines">
          {product.name}
        </h3>

      {priceNumber !== null && !Number.isNaN(priceNumber) && (
  <div className="product-price">
    {(() => {
      const rounded = Math.round(priceNumber);
      const withSpaces = rounded
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
      return `${withSpaces} ֏`;
    })()}
  </div>
)}
      </Link>
    </div>
  );
}