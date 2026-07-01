import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { canAccessWebsiteBuilder, getWebsiteById } from "@/lib/websites";
import { ensureWebsiteBuilderData } from "@/lib/websiteBuilderData";

export const metadata = {
  title: "Website Builder",
  description: "Edit a website-scoped visual builder layout.",
};

export const dynamic = "force-dynamic";

type WebsiteBuilderPageProps = {
  params: Promise<{
    websiteId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function builderPathWithSearch(
  websiteId: string,
  searchParams?: Record<string, string | string[] | undefined>,
) {
  const params = new URLSearchParams();

  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (typeof value === "string") {
      params.set(key, value);
    }
  });

  const query = params.toString();
  const path = `/app/websites/${websiteId}/builder`;
  return query ? `${path}?${query}` : path;
}

export default async function WebsiteBuilderPage({
  params,
  searchParams,
}: WebsiteBuilderPageProps) {
  const [{ websiteId }, user] = await Promise.all([
    params,
    getCurrentUser(await cookies()),
  ]);
  const requestedPath = builderPathWithSearch(websiteId, await searchParams);
  console.log("[builder-scope] route websiteId", {
    routeWebsiteId: websiteId,
    requestedPath,
  });

  if (!user) {
    redirect(loginRedirectFor(requestedPath));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  await ensureWebsiteBuilderData(website.id);
  console.log("[builder-scope] route passes DashboardBuilder websiteId", {
    routeWebsiteId: websiteId,
    resolvedWebsiteId: website.id,
    ownerId: website.ownerId,
  });

  return (
    <div data-scoped-builder-root>
      <Suspense fallback={null}>
        <DashboardBuilder websiteId={website.id} saasUserRole={user.role} />
      </Suspense>
    </div>
  );
}
