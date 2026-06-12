import { Suspense } from "react";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";

export const metadata = {
  title: "Visual Builder Dashboard",
  description: "Create storefront page layouts with a live React preview.",
};

export default async function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardBuilder />
    </Suspense>
  );
}
