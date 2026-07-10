import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import CartPageClient from "@/components/CartPageClient";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import MyAccountPageContent from "@/components/MyAccountPageContent";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getStorefrontBuilderProductBySlug } from "@/lib/storefrontProduct";
import {
  canAccessWebsiteBuilder,
  getWebsiteByIdOrSlug,
} from "@/lib/websites";
import { getWooCommerceConnection } from "@/lib/woocommerce";

export const dynamic = "force-dynamic";

type WebsitePreviewPageProps = {
  params: Promise<{
    websiteId: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    product?: string;
  }>;
};

function previewPathWithSearch(websiteId: string, page?: string, product?: string) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (product) params.set("product", product);
  const query = params.toString();
  const path = `/app/websites/${websiteId}/preview`;
  return query ? `${path}?${query}` : path;
}

export default async function WebsitePreviewPage({
  params,
  searchParams,
}: WebsitePreviewPageProps) {
  const [{ websiteId }, user, query] = await Promise.all([
    params,
    getCurrentUser(await cookies()),
    searchParams,
  ]);
  const requestedPage = query?.page ?? "home";
  const productSlug = query?.product;
  const requestedPath = previewPathWithSearch(
    websiteId,
    requestedPage,
    productSlug,
  );

  if (!user) {
    redirect(loginRedirectFor(requestedPath));
  }

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  const productData =
    requestedPage === "product-single" && productSlug
      ? await getStorefrontBuilderProductBySlug(productSlug, {
          website,
        }).catch(() => null)
      : null;
  const connection = getWooCommerceConnection(website);
  const corePageContent =
    requestedPage === "cart" || requestedPage === "page:cart" ? (
      <CartPageClient asSlot />
    ) : requestedPage === "checkout" || requestedPage === "page:checkout" ? (
      <CheckoutPageClient
        asSlot
        wordpressBaseUrl={connection.wordpressBaseUrl}
      />
    ) : requestedPage === "my-account" ||
      requestedPage === "page:my-account" ? (
      <MyAccountPageContent connection={connection} />
    ) : null;
  const corePageFallback =
    requestedPage === "cart" || requestedPage === "page:cart" ? (
      <CartPageClient />
    ) : requestedPage === "checkout" || requestedPage === "page:checkout" ? (
      <CheckoutPageClient wordpressBaseUrl={connection.wordpressBaseUrl} />
    ) : corePageContent ? (
      <main className="page account-bridge-page">{corePageContent}</main>
    ) : undefined;

  return (
    <WebsiteFrontend
      website={website}
      requestedPage={requestedPage}
      mode="preview"
      pageLabelOverride={productData?.product.name}
      rendererProps={
        productData
          ? {
              breadcrumbItems: [
                { label: "Home", href: "/" },
                { label: "Shop", href: "/shop" },
                { label: productData.product.name },
              ],
              product: productData.product,
            }
          : corePageContent
            ? { pageContent: corePageContent }
            : undefined
      }
      fallbackContent={corePageFallback}
    />
  );
}
