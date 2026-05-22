import { Suspense } from "react";
import DashboardBuilder from "@/components/dashboard/DashboardBuilder";
import { getMainMenuItems } from "@/lib/navigation";

export const metadata = {
  title: "Visual Builder Dashboard",
  description: "Create storefront page layouts with a live React preview.",
};

export default async function DashboardPage() {
  const menuTree = await getMainMenuItems();

  return (
    <Suspense fallback={null}>
      <DashboardBuilder menuTree={menuTree} />
    </Suspense>
  );
}
