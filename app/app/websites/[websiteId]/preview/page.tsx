import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { getStorefrontBuilderProductBySlug } from "@/lib/storefrontProduct";
import {
  canAccessWebsiteBuilder,
  getWebsiteByIdOrSlug,
} from "@/lib/websites";

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
      ? await getStorefrontBuilderProductBySlug(productSlug).catch(() => null)
      : null;

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
          : undefined
      }
    />
  );
}
