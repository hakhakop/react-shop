import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const layout = await getPublishedBuilderLayout("home");

  if (layout?.sections?.some((section) => section.visible)) {
    return <StorefrontBuilderRenderer layout={layout} page="home" />;
  }

  return null;
}
