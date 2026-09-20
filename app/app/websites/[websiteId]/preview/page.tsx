import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import WebsiteReadinessNotice from "@/components/saas/WebsiteReadinessNotice";
import SaaSShell from "@/components/saas/SaaSShell";
import CartPageClient from "@/components/CartPageClient";
import CheckoutPageClient from "@/components/CheckoutPageClient";
import MyAccountPageContent from "@/components/MyAccountPageContent";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import { getCurrentUser, isSaaSAdmin } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  canAccessWebsiteBuilder,
  getWebsiteByIdOrSlug,
  isWebsitePreparing,
} from "@/lib/websites";
import { getWooCommerceConnection } from "@/lib/woocommerce";
import { resolveCommerceRouteProjection } from "@/lib/commerceRouteProjection.server";
import { resolveEnabledGlobalStarter } from "@/lib/globalStarters";

export const dynamic = "force-dynamic";

type WebsitePreviewPageProps = {
  params: Promise<{
    websiteId: string;
  }>;
  searchParams?: Promise<{
    page?: string;
    product?: string;
    category?: string;
    path?: string;
    builderFrame?: string;
    builderBridge?: string;
    builderContext?: string;
    headerPreviewVariant?: string;
    headerPreviewDocument?: string;
    globalStarterId?: string;
    product_tag?: string;
    paged?: string;
  }>;
};

function previewPathWithSearch(websiteId: string, page?: string, product?: string, category?: string, websitePath?: string) {
  const params = new URLSearchParams();
  if (websitePath) params.set("path", websitePath);
  else if (page) params.set("page", page);
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
  const globalStarterId = query?.globalStarterId?.trim() || undefined;
  const [website, globalStarter] = await Promise.all([
    getWebsiteByIdOrSlug(websiteId),
    globalStarterId ? resolveEnabledGlobalStarter(globalStarterId) : Promise.resolve(null),
  ]);
  const isPublicGlobalStarterPreview = Boolean(
    globalStarterId &&
      globalStarter &&
      website &&
      globalStarter.sourceWebsite.id === website.id,
  );
  if (globalStarterId && !isPublicGlobalStarterPreview) notFound();
  const requestedPage = query?.path ?? query?.page ?? "home";
  const productSlug = query?.product;
  const categorySlug = query?.category;
  const builderEditingContext =
    !isPublicGlobalStarterPreview &&
    (query?.builderContext === "header" || query?.builderContext === "footer")
      ? query.builderContext
      : null;
  const deferPageDocumentToBuilder =
    !isPublicGlobalStarterPreview &&
    query?.builderFrame === "selection" &&
    builderEditingContext === null;
  const requestedPath = previewPathWithSearch(
    websiteId,
    requestedPage,
    productSlug,
    categorySlug,
    query?.path,
  );

  if (!user && !isPublicGlobalStarterPreview) {
    redirect(loginRedirectFor(requestedPath));
  }

  if (!website || (!isPublicGlobalStarterPreview && !canAccessWebsiteBuilder(user, website))) {
    return <AccessDenied />;
  }

  if (isWebsitePreparing(website) && !isSaaSAdmin(user)) {
    if (isPublicGlobalStarterPreview) {
      return <WebsiteReadinessNotice websiteName={website.name} publicSurface />;
    }
    return (
      <SaaSShell user={user!} title={website.name} eyebrow="Website setup">
        <WebsiteReadinessNotice websiteName={website.name} />
      </SaaSShell>
    );
  }

  const commerceSlug = requestedPage === "product-category" ? categorySlug : productSlug;
  const commerceProjection =
    !deferPageDocumentToBuilder &&
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
          pageNumber: Math.max(1, Number.parseInt(query?.paged ?? "1", 10) || 1),
          requestProductTagSlugs: query?.product_tag?.split(",").map((item) => item.trim()).filter(Boolean),
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
      builderIframeSelection={!isPublicGlobalStarterPreview && query?.builderFrame === "selection"}
      previewHeaderVariant={
        !isPublicGlobalStarterPreview &&
        (query?.headerPreviewVariant === "desktop" || query?.headerPreviewVariant === "mobile")
          ? query.headerPreviewVariant
          : undefined
      }
      previewHeaderDocument={
        !isPublicGlobalStarterPreview && (
          query?.headerPreviewDocument === "header-mobile" ||
          query?.headerPreviewDocument === "header-mobile-dialog" ||
          query?.headerPreviewDocument === "header"
        )
          ? query.headerPreviewDocument
          : undefined
      }
      builderEditingContext={builderEditingContext}
      builderIframeDiagnostics={
        isPublicGlobalStarterPreview
          ? "minimal"
          : query?.builderBridge === "full"
          ? "full"
          : query?.builderBridge === "settled"
            ? "settled"
          : query?.builderBridge === "toolbar"
            ? "toolbar"
          : query?.builderBridge === "rect"
            ? "rect"
            : "minimal"
      }
      publicSurface={isPublicGlobalStarterPreview}
      publicPreviewToken={isPublicGlobalStarterPreview ? globalStarterId : undefined}
      pageNumber={Math.max(1, Number.parseInt(query?.paged ?? "1", 10) || 1)}
      requestProductTagSlugs={query?.product_tag?.split(",").map((item) => item.trim()).filter(Boolean)}
    />
  );
}
