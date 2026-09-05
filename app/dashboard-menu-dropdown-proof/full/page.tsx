import { Suspense } from "react";
import { notFound } from "next/navigation";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import SaaSI18nProvider from "@/components/i18n/SaaSI18nProvider";

export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound();
  // Test-only owner, never a real website. Tests intercept all API requests.
  return <SaaSI18nProvider userLocale="en"><Suspense><DashboardBuilder websiteId="menu-dropdown-proof" saasUserRole="super_admin" /></Suspense></SaaSI18nProvider>;
}
