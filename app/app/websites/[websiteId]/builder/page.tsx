import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import {
  canAccessWebsiteBuilder,
  getWebsiteByIdOrSlug,
  getWebsiteRouteSegment,
} from "@/lib/websites";
import { ensureWebsiteBuilderData } from "@/lib/websiteBuilderData";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";
import { normalizeBuilderLayoutKey } from "@/lib/builderLayouts";
import { resolveInitialBuilderPage } from "@/lib/initialBuilderPage.server";

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
  const resolvedSearchParams = await searchParams;
  const [{ websiteId }, user] = await Promise.all([
    params,
    getCurrentUser(await cookies()),
  ]);
  const requestedPath = builderPathWithSearch(websiteId, resolvedSearchParams);
  console.log("[builder-scope] route websiteId", {
    routeWebsiteId: websiteId,
    requestedPath,
  });

  if (!user) {
    redirect(loginRedirectFor(requestedPath));
  }

  const website = await getWebsiteByIdOrSlug(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  await ensureWebsiteBuilderData(website.id);
  console.log("[builder-scope] route passes DashboardBuilder websiteId", {
    routeWebsiteId: websiteId,
    resolvedWebsiteId: website.id,
    ownerId: website.ownerId,
  });

  const requestedTargetValue =
    resolvedSearchParams?.page ?? resolvedSearchParams?.template ?? "home";
  const requestedTarget = Array.isArray(requestedTargetValue)
    ? requestedTargetValue[0] ?? "home"
    : requestedTargetValue;
  const initialPage = normalizeBuilderLayoutKey(requestedTarget);
  const hasStrictDocumentTarget = Boolean(
    resolvedSearchParams?.document ||
    resolvedSearchParams?.routingTemplate ||
    resolvedSearchParams?.individual,
  );
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get(`website_content_language_${website.id}`)?.value;
  const contentLanguage = website.enabledLanguages.includes(languageCookie as never)
    ? languageCookie!
    : website.primaryLanguage;
  const initialPageHydration =
    !hasStrictDocumentTarget && initialPage !== "header" && initialPage !== "footer"
      ? await resolveInitialBuilderPage({
          page: initialPage,
          scope: { websiteId: website.id },
          website,
          contentLanguage,
          primaryContentLanguage: website.primaryLanguage,
          wordpressMediaOrigin: getWordPressBaseUrl(website),
        })
      : undefined;

  return (
    <SaaSI18nProvider userLocale={user.language} persistForUser><div data-scoped-builder-root>
      <Suspense fallback={null}>
        <DashboardBuilder
          websiteId={website.id}
          websiteRouteSegment={getWebsiteRouteSegment(website)}
          websitePrimaryDomain={website.primaryDomain}
          saasUserRole={user.role}
          primaryContentLanguage={website.primaryLanguage}
          enabledContentLanguages={website.enabledLanguages}
          wordpressMediaOrigin={getWordPressBaseUrl(website)}
          initialPageHydration={initialPageHydration}
        />
      </Suspense>
    </div></SaaSI18nProvider>
  );
}
