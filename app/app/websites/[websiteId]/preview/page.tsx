import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import CartPageClient from "@/components/CartPageClient";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import MyAccountPageContent from "@/components/MyAccountPageContent";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  canAccessWebsiteBuilder,
  getWebsiteByIdOrSlug,
} from "@/lib/websites";
import { getWooCommerceConnection } from "@/lib/woocommerce";
import { resolveCommerceRouteProjection } from "@/lib/commerceRouteProjection.server";

export const dynamic = "force-dynamic";

type WebsitePreviewPageProps = {
  params: Promise<{
    websiteId: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    product?: string;
    category?: string;
    builderFrame?: string;
    builderBridge?: string;
  }>;
};

function previewPathWithSearch(websiteId: string, page?: string, product?: string, category?: string) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (product) params.set("product", product);
  if (category) params.set("category", category);
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
  const categorySlug = query?.category;
  const requestedPath = previewPathWithSearch(
    websiteId,
    requestedPage,
    productSlug,
    categorySlug,
  );

  if (!user) {
    redirect(loginRedirectFor(requestedPath));
  }

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  const commerceSlug = requestedPage === "product-category" ? categorySlug : productSlug;
  const commerceProjection =
    (requestedPage === "product-category" || requestedPage === "product-single") && commerceSlug
      ? await resolveCommerceRouteProjection({
          alias: {
            path: requestedPage === "product-category"
              ? `/product-category/${commerceSlug}`
              : `/product/${commerceSlug}`,
            pageKey: requestedPage,
            target: requestedPage === "product-category"
              ? {
                  kind: "term",
                  taxonomy: "product_cat",
                  slug: commerceSlug,
                  uri: `/product-category/${commerceSlug}`,
                }
              : {
                  kind: "product",
                  postType: "product",
                  slug: commerceSlug,
                  uri: `/product/${commerceSlug}`,
                },
          },
          website,
          scope: { websiteId: website.id },
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
      pageLabelOverride={commerceProjection?.pageLabel}
      rendererProps={
        commerceProjection?.rendererProps ?? (corePageContent
            ? { pageContent: corePageContent }
            : undefined)
      }
      layoutOverride={commerceProjection?.layout ?? undefined}
      dynamicItemContextOverride={commerceProjection?.dynamicContext}
      fallbackContent={corePageFallback}
      builderIframeSelection={query?.builderFrame === "selection"}
      builderIframeDiagnostics={
        query?.builderBridge === "full"
          ? "full"
          : query?.builderBridge === "settled"
            ? "settled"
          : query?.builderBridge === "toolbar"
            ? "toolbar"
          : query?.builderBridge === "rect"
            ? "rect"
            : "minimal"
      }
    />
  );
}
