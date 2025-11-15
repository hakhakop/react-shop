import Link from "next/link";
import Image from "next/image";
import { graphqlFetch } from "../../lib/graphql";

type WPImage = {
  sourceUrl: string;
  altText?: string | null;
};

type ProductNode = {
  id: string;
  slug: string;
  name: string;
  image?: WPImage | null;
  price?: string | null;
};

type SearchProductsData = {
  products: {
    nodes: ProductNode[];
  };
};

// Next.js 16: searchParams is a Promise
type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($search: String!) {
    products(
      first: 24
      where: {
        search: $search
      }
    ) {
      nodes {
        id
        slug
        name
        image {
          sourceUrl
          altText
        }
        ... on SimpleProduct {
          price(format: RAW)
        }
        ... on VariableProduct {
          price(format: RAW)
        }
      }
    }
  }
`;

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // ✅ unwrap the Promise
  const resolved = await searchParams;
  const term = (resolved.q || "").trim();

  let products: ProductNode[] = [];
  let errorMessage: string | null = null;

  if (term) {
    try {
      const data = await graphqlFetch<SearchProductsData>(
        SEARCH_PRODUCTS_QUERY,
        { search: term }
      );
      products = data.products?.nodes ?? [];
    } catch (err: any) {
      errorMessage = err?.message || "Failed to load search results.";
      console.error("Search error:", err);
    }
  }

  return (
    <main className="page">
      <h1 className="page-title">Search products</h1>
      <p className="page-subtitle">
        Search in your WooCommerce catalog by product name or keyword.
      </p>

      {/* Search form */}
      <form
        action="/search"
        method="get"
        className="mb-4"
        style={{ marginBottom: "16px" }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
          }}
        >
          <input
            type="text"
            name="q"
            defaultValue={term}
            placeholder="Type product name…"
            style={{
              flex: 1,
              padding: "8px 10px",
              borderRadius: "999px",
              border: "1px solid #e5e7eb",
              fontSize: "14px",
            }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            style={{ whiteSpace: "nowrap" }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Error state */}
      {errorMessage && (
        <p style={{ color: "#b91c1c", fontSize: "13px", marginTop: "4px" }}>
          {errorMessage}
        </p>
      )}

      {/* Empty state before typing */}
      {!term && !errorMessage && (
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
          Enter a search term above and press <strong>Search</strong>.
        </p>
      )}

      {/* No results */}
      {term && !errorMessage && products.length === 0 && (
        <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "8px" }}>
          No products found for <strong>&quot;{term}&quot;</strong>.
        </p>
      )}

      {/* Results grid */}
      {products.length > 0 && (
        <div className="product-grid" style={{ marginTop: "16px" }}>
          {products.map((p) => {
            const priceNumber = p.price ? parseFloat(p.price) : null;

            return (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                className="product-card"
              >
                <div className="product-image">
                  {p.image?.sourceUrl ? (
                    <Image
                      src={p.image.sourceUrl}
                      alt={p.image.altText || p.name}
                      width={400}
                      height={300}
                    />
                  ) : (
                    <div className="product-image-placeholder">No image</div>
                  )}
                </div>

                <div className="product-title product-title-2lines">
                  {p.name}
                </div>

                {priceNumber !== null && !Number.isNaN(priceNumber) && (
                  <div className="product-price">
                    {priceNumber.toLocaleString("hy-AM", {
                      style: "currency",
                      currency: "AMD",
                      maximumFractionDigits: 0,
                    })}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}