// app/page.tsx
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import WPPage from "./[...slug]/page";

export const dynamic = "force-dynamic";

// Home route ("/") reuses the same logic as other WP pages,
// but with an "empty" slug → this becomes uri = "/" in your [...slug] file.
export default async function HomePage() {
  const layout = await getPublishedBuilderLayout("home");

  if (layout?.sections?.some((section) => section.visible)) {
    return <StorefrontBuilderRenderer layout={layout} page="home" />;
  }

  return <WPPage params={Promise.resolve({ slug: [] })} />;
}
