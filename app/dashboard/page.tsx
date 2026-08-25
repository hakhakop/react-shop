import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";
import { normalizeBuilderLayoutKey } from "@/lib/builderLayouts";
import { resolveInitialBuilderPage } from "@/lib/initialBuilderPage.server";
import { resolveInitialBuilderHydrationPage } from "@/lib/builderShellRoute";

export const metadata = {
  title: "Root Website Builder",
  description: "Edit the public WebPages website with a live React preview.",
};

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function dashboardPathWithSearch(
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
  return query ? `/dashboard?${query}` : "/dashboard";
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const cookieStore = await cookies();
  const user = await getCurrentUser(cookieStore);
  const resolvedSearchParams = await searchParams;

  if (!user) {
    redirect(loginRedirectFor(dashboardPathWithSearch(resolvedSearchParams)));
  }

  const requestedTargetValue =
    resolvedSearchParams?.page ?? resolvedSearchParams?.template ?? "home";
  const requestedTarget = Array.isArray(requestedTargetValue)
    ? requestedTargetValue[0] ?? "home"
    : requestedTargetValue;
  const initialPage = normalizeBuilderLayoutKey(requestedTarget);
  const contextTargetValue = resolvedSearchParams?.context ?? "home";
  const contextTarget = Array.isArray(contextTargetValue)
    ? contextTargetValue[0] ?? "home"
    : contextTargetValue;
  const requestedContextPage = normalizeBuilderLayoutKey(contextTarget);
  // A direct Header/Footer URL must hydrate the active document itself. The
  // context page is only the locked preview canvas; using it as the authored
  // Builder state lets an older page draft overwrite the shell after refresh.
  const initialHydrationPage =
    initialPage === "header" || initialPage === "footer"
      ? initialPage
      : resolveInitialBuilderHydrationPage(initialPage, requestedContextPage);
  const hasStrictDocumentTarget = Boolean(
    resolvedSearchParams?.document ||
    resolvedSearchParams?.routingTemplate ||
    resolvedSearchParams?.individual,
  );
  const initialPageHydration =
    !hasStrictDocumentTarget
      ? await resolveInitialBuilderPage({
          page: initialHydrationPage,
          contentLanguage: ["hy", "en", "ru"].includes(
            cookieStore.get("website_content_language_root")?.value as never,
          )
            ? cookieStore.get("website_content_language_root")!.value
            : "hy",
          primaryContentLanguage: "hy",
          wordpressMediaOrigin: getWordPressBaseUrl(),
        })
      : undefined;

  return (
    <SaaSI18nProvider userLocale={user.language} persistForUser>
      <Suspense fallback={null}>
        <DashboardBuilder
          saasUserRole={user.role}
          primaryContentLanguage="hy"
          enabledContentLanguages={["hy", "en", "ru"]}
          wordpressMediaOrigin={getWordPressBaseUrl()}
          initialPageHydration={initialPageHydration}
        />
      </Suspense>
    </SaaSI18nProvider>
  );
}
