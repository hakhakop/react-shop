import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import { getCurrentUser } from "@/lib/auth";
import { loginRedirectFor } from "@/lib/saasRoutes";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";

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
  const user = await getCurrentUser(await cookies());

  if (!user) {
    redirect(loginRedirectFor(dashboardPathWithSearch(await searchParams)));
  }

  return (
    <SaaSI18nProvider userLocale={user.language} persistForUser>
      <Suspense fallback={null}>
        <DashboardBuilder
          saasUserRole={user.role}
          primaryContentLanguage="hy"
          enabledContentLanguages={["hy", "en", "ru"]}
          wordpressMediaOrigin={getWordPressBaseUrl()}
        />
      </Suspense>
    </SaaSI18nProvider>
  );
}
