// wc-store/app/product/[slug]/page.tsx

import Link from "next/link";
import { graphqlFetch } from "../../../lib/graphql";
import AddToCartButton from "../../../components/AddToCartButton";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ProductGallery from "../../../components/ProductGallery";
import WishlistToggle from "../../../components/WishlistToggle";

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

type ProductAttribute = {
  name: string;
  label: string;
  options: string[];
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: WPImage | null;
  galleryImages?: { nodes: WPImage[] } | null;
  price?: string | null;
  attributes?: { nodes: ProductAttribute[] } | null;
};

type ProductData = {
  product: Product | null;
};

const PRODUCT_QUERY = `
  query SingleProduct($id: ID!) {
    product(id: $id, idType: SLUG) {
      id
      name
      slug
      description
      image {
        sourceUrl
        altText
      }
      galleryImages(first: 10) {
        nodes {
          sourceUrl
          altText
        }
      }

      ... on SimpleProduct {
        price(format: RAW)
        attributes {
          nodes {
            name
            label
            options
          }
        }
      }

      ... on VariableProduct {
        price(format: RAW)
        attributes {
          nodes {
            name
            label
            options
          }
        }
      }
    }
  }
`;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let data: ProductData;

  try {
    data = await graphqlFetch<ProductData>(PRODUCT_QUERY, { id: slug });
  } catch (err: any) {
    return (
      <main className="product-page">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Product" },
          ]}
        />
        <h1 className="page-title">Product</h1>
        <p style={{ color: "#b91c1c" }}>
          Failed to load product: {String(err?.message || err)}
        </p>
        <p className="product-back-link">
          <Link href="/">← Back to store</Link>
        </p>
      </main>
    );
  }

  if (!data.product) {
    return (
      <main className="product-page">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Product" },
          ]}
        />
        <h1 className="page-title">Product not found</h1>
        <p style={{ color: "#6b7280" }}>
          We couldn’t find this product. It may be unpublished or
          the URL is wrong.
        </p>
        <p className="product-back-link">
          <Link href="/">← Back to store</Link>
        </p>
      </main>
    );
  }

  const p = data.product;
  const priceNumber = p.price ? parseFloat(p.price) : null;

  const images: WPImage[] = [];
  const galleryNodes = p.galleryImages?.nodes ?? [];

  if (p.image?.sourceUrl) images.push(p.image);

  for (const img of galleryNodes) {
    if (img.sourceUrl && !images.some((i) => i.sourceUrl === img.sourceUrl)) {
      images.push(img);
    }
  }

  const mainImageUrl = p.image?.sourceUrl || undefined;

  const attributes = p.attributes?.nodes ?? [];

  return (
    <main className="product-page">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Product" },
          { label: p.name },
        ]}
      />

      <div className="product-layout">
        <ProductGallery images={images} name={p.name} />

        <div>
          <div className="product-header-row">
            <h1 className="product-name">{p.name}</h1>
            <WishlistToggle
              id={p.id}
              slug={p.slug}
              name={p.name}
              imageUrl={mainImageUrl}
            />
          </div>

          {priceNumber !== null && !Number.isNaN(priceNumber) && (
            <div className="product-page-price">
              {priceNumber.toLocaleString("hy-AM", {
                style: "currency",
                currency: "AMD",
                maximumFractionDigits: 0,
              })}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <AddToCartButton
              id={p.id}
              slug={p.slug}
              name={p.name}
              priceNumber={priceNumber}
              imageUrl={mainImageUrl}
            />
          </div>

          {/* ATTRIBUTES SECTION */}
          {attributes.length > 0 && (
            <div style={{ margin: "24px 0" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "8px" }}>
                Product Details
              </h3>

              <ul style={{ fontSize: "14px", color: "#374151", lineHeight: "22px" }}>
                {attributes.map((attr) => (
                  <li key={attr.name}>
                    <strong>{attr.label}:</strong>{" "}
                    {attr.options.join(", ")}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {p.description && (
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: p.description }}
            />
          )}
        </div>
      </div>
    </main>
  );
}