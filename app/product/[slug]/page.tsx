import Link from "next/link";
import Breadcrumbs from "../../../components/Breadcrumbs";
import ProductGallery from "../../../components/ProductGallery";
import ProductOptionsSelector from "../../../components/ProductOptionsSelector";
import WishlistToggle from "../../../components/WishlistToggle";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { renderDomainWebsiteFrontend } from "@/components/website/DomainWebsiteFrontend";
import ProductAdminMarker from "@/components/ProductAdminMarker";
import { ProductRecentlyViewedTracker } from "@/components/RecentlyViewedProvider";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getCurrentWebsiteFromHeaders } from "@/lib/currentWebsite";
import { getCanonicalProductSingularBySlug } from "@/lib/productSingularContext.server";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { resolveLayout, type SingularRouteContext } from "@/lib/layoutRouting";
import {
  ensureProductSingleRoutingCompatibility,
  getBuilderLayoutByDocumentId,
} from "@/lib/layoutRoutingStore.server";
import { getStorefrontContentHref } from "@/lib/storefrontContentHref";

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
  databaseId?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  image?: WPImage | null;
  galleryImages?: { nodes: WPImage[] } | null;
  price?: string | null;
  attributes?: { nodes: ProductAttribute[] } | null;
};

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const website = await getCurrentWebsiteFromHeaders();
  let p: Product | null;
  let canonicalProductContext: Awaited<ReturnType<typeof getCanonicalProductSingularBySlug>>;

  try {
    canonicalProductContext = await getCanonicalProductSingularBySlug(slug, website);
    p = canonicalProductContext?.product ?? null;
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

  if (!p) {
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

  const wpProductId = p.databaseId ?? null;

const priceNumber = p.price ? parseFloat(p.price) : null;

const priceFormatted =
  priceNumber !== null && !Number.isNaN(priceNumber)
    ? priceNumber.toLocaleString("hy-AM", {
        style: "currency",
        currency: "AMD",
        maximumFractionDigits: 0,
      })
    : null;

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
  const rendererProduct = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    priceNumber,
    priceFormatted,
    imageUrl: mainImageUrl,
    images,
    attributes,
  };

  const routeContext: SingularRouteContext = {
    view: "singular",
    provider: "woocommerce",
    contentType: "product",
    contentId: p.id,
    ...(p.databaseId != null ? { databaseId: p.databaseId } : {}),
    slug: p.slug,
    uri: getStorefrontContentHref({ contentType: "product", slug: p.slug })!,
    taxonomyTerms: canonicalProductContext?.taxonomyTerms ?? [],
  };
  const routingScope = website ? { websiteId: website.id } : {};
  let selectedLayout = null;
  try {
    const registry = await ensureProductSingleRoutingCompatibility(routingScope);
    const resolution = resolveLayout({
      context: routeContext,
      individualOverrides: registry.individualOverrides,
      routingTemplates: registry.routingTemplates,
      nativeFallbackAvailable: true,
    });
    if (resolution.outcome === "individual" || resolution.outcome === "routing-template") {
      selectedLayout = await getBuilderLayoutByDocumentId(resolution.layoutId, routingScope);
    }
  } catch (error) {
    // Invalid routing persistence fails closed into the defined native Product fallback.
    console.error("[layout-routing] Product resolution failed", error);
  }

  const domainWebsitePage = selectedLayout
    ? await renderDomainWebsiteFrontend({
        requestedPage: "product-single",
        pageLabel: p.name,
        layoutOverride: selectedLayout,
        dynamicItemContextOverride: canonicalProductContext?.dynamicContext,
        rendererProps: {
          breadcrumbItems: [
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: p.name },
          ],
          product: rendererProduct,
        },
      })
    : null;

  if (domainWebsitePage) {
    return (
      <>
        <ProductAdminMarker productId={wpProductId} />
        <ProductRecentlyViewedTracker
          id={p.id}
          slug={p.slug}
          name={p.name}
          thumbnailUrl={p.image?.sourceUrl}
          price={priceFormatted}
        />
        {domainWebsitePage}
      </>
    );
  }

  const shellSettings = selectedLayout && !website
    ? await getBuilderShellSettings()
    : null;

  if (selectedLayout && shellSettings) {
    const materialization = await materializeBuilderDynamicContent(selectedLayout, {
      rootContext: canonicalProductContext?.dynamicContext,
    });
    return (
      <>
        <ProductAdminMarker productId={wpProductId} />
        <ProductRecentlyViewedTracker
          id={p.id}
          slug={p.slug}
          name={p.name}
          thumbnailUrl={p.image?.sourceUrl}
          price={priceFormatted}
        />
        <StorefrontBuilderRenderer
          layout={materialization.renderLayout}
          page="product-single"
          pageLabel={p.name}
          breadcrumbItems={[
            { label: "Home", href: "/" },
            { label: "Shop", href: "/shop" },
            { label: p.name },
          ]}
          product={rendererProduct}
          shellSettings={shellSettings}
        />
      </>
    );
  }

  return (
    <main className="product-page">
      <ProductAdminMarker productId={wpProductId} />
      <ProductRecentlyViewedTracker
  id={p.id}
  slug={p.slug}
  name={p.name}
  thumbnailUrl={p.image?.sourceUrl}
  price={priceFormatted}
/>

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
            <ProductOptionsSelector
              id={p.id}
              slug={p.slug}
              name={p.name}
              priceNumber={priceNumber}
              imageUrl={mainImageUrl}
              attributes={attributes}
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
