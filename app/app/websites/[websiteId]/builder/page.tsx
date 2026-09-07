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
import { getWordPressBaseUrl, getWordPressMediaOrigin } from "@/lib/wordpressUrl";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";
import { normalizeBuilderLayoutKey } from "@/lib/builderLayouts";
import { resolveInitialBuilderPage } from "@/lib/initialBuilderPage.server";
import { resolveInitialBuilderHydrationPage } from "@/lib/builderShellRoute";
import { resolveLegacyTemplateBuilderEntry } from "@/lib/templateBuilderContext.server";
import { resolveBuilderEditorSession } from "@/lib/builderEditorContext.server";

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
    resolvedSearchParams?.page ?? resolvedSearchParams?.template ?? resolvedSearchParams?.path ?? "home";
  const requestedTarget = Array.isArray(requestedTargetValue)
    ? requestedTargetValue[0] ?? "home"
    : requestedTargetValue;
  const initialPage = normalizeBuilderLayoutKey(requestedTarget);
  const contextTargetValue = resolvedSearchParams?.context ?? "home";
  const contextTarget = Array.isArray(contextTargetValue)
    ? contextTargetValue[0] ?? "home"
    : contextTargetValue;
  const requestedContextPage = normalizeBuilderLayoutKey(contextTarget);
  const initialHydrationPage = resolveInitialBuilderHydrationPage(
    initialPage,
    requestedContextPage,
  );
  const hasStrictDocumentTarget = Boolean(
    resolvedSearchParams?.document ||
    resolvedSearchParams?.routingTemplate ||
    resolvedSearchParams?.individual,
  );
  if (!hasStrictDocumentTarget) {
    const strictTemplateEntry = await resolveLegacyTemplateBuilderEntry({
      page: initialHydrationPage,
      scope: { websiteId: website.id },
      website,
    });
    if (strictTemplateEntry) {
      const nextSearchParams = new URLSearchParams();
      Object.entries(resolvedSearchParams ?? {}).forEach(([key, value]) => {
        if (["page", "template", "path", "context", "category", "product"].includes(key)) return;
        if (Array.isArray(value)) value.forEach((item) => nextSearchParams.append(key, item));
        else if (typeof value === "string") nextSearchParams.set(key, value);
      });
      nextSearchParams.set("document", strictTemplateEntry.documentId);
      nextSearchParams.set("routingTemplate", strictTemplateEntry.routingTemplateId);
      nextSearchParams.set("previewProvider", strictTemplateEntry.previewIdentity.provider);
      nextSearchParams.set("previewContentType", strictTemplateEntry.previewIdentity.contentType);
      nextSearchParams.set("previewContentId", strictTemplateEntry.previewIdentity.contentId);
      redirect(`/app/websites/${websiteId}/builder?${nextSearchParams.toString()}`);
    }
  }
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get(`website_content_language_${website.id}`)?.value;
  const contentLanguage = website.enabledLanguages.includes(languageCookie as never)
    ? languageCookie!
    : website.primaryLanguage;
  const scalar = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
  const strictDocument = scalar(resolvedSearchParams?.document);
  const strictRoutingTemplate = scalar(resolvedSearchParams?.routingTemplate);
  const strictIndividual = scalar(resolvedSearchParams?.individual);
  const strictPreviewProvider = scalar(resolvedSearchParams?.previewProvider);
  const strictPreviewContentType = scalar(resolvedSearchParams?.previewContentType);
  const strictPreviewContentId = scalar(resolvedSearchParams?.previewContentId);
  const [initialPageHydration, initialContextPageHydration] =
    hasStrictDocumentTarget && strictDocument && (strictRoutingTemplate || strictIndividual)
      ? await resolveBuilderEditorSession({
          documentId: strictDocument,
          routingTemplateId: strictRoutingTemplate,
          individual: strictIndividual,
          ...(strictPreviewProvider && strictPreviewContentType && strictPreviewContentId
            ? { previewIdentity: { provider: strictPreviewProvider, contentType: strictPreviewContentType, contentId: strictPreviewContentId } }
            : {}),
          scope: { websiteId: website.id },
          website,
        }).then((session) => session.resolution ? [{
          authoredLayout: session.resolution.layout,
          renderLayout: session.resolution.renderLayout,
          editorContext: session.editorContext,
          context: session.resolution.context,
          candidates: "candidates" in session.resolution ? session.resolution.candidates : [],
          previewIdentity: "previewIdentity" in session.resolution ? session.resolution.previewIdentity : undefined,
        }, undefined] as const : [undefined, undefined] as const)
      : !hasStrictDocumentTarget
      ? await Promise.all([
        resolveInitialBuilderPage({
          page: initialHydrationPage,
          scope: { websiteId: website.id },
          website,
          contentLanguage,
          primaryContentLanguage: website.primaryLanguage,
          wordpressMediaOrigin: getWordPressMediaOrigin(website),
          // DashboardBuilder refreshes this transient projection after mount.
          // Keep remote providers off the blocking Builder shell path.
          deferDynamicContent: true,
        }),
        initialPage === "header" || initialPage === "footer"
          ? resolveInitialBuilderPage({
              page: requestedContextPage,
              scope: { websiteId: website.id },
              website,
              contentLanguage,
              primaryContentLanguage: website.primaryLanguage,
              wordpressMediaOrigin: getWordPressMediaOrigin(website),
              deferDynamicContent: true,
            })
          : Promise.resolve(undefined),
      ])
      : [undefined, undefined];

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
          wordpressMediaOrigin={getWordPressMediaOrigin(website)}
          wordpressSiteUrl={getWordPressBaseUrl(website)}
          initialPageHydration={initialPageHydration}
          initialContextPageHydration={initialContextPageHydration}
        />
      </Suspense>
    </div></SaaSI18nProvider>
  );
}
