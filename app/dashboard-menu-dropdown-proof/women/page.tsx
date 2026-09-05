import { notFound } from "next/navigation";
import women from "@/tests/fixtures/yootheme-compatibility/sources/women-menu-dropdown.json";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { getWebsiteByIdOrSlug } from "@/lib/websites";
import { ContentLayoutBlock } from "@/components/builder/StorefrontBuilderRenderer";
import { defaultBuilderShellSettings } from "@/lib/builderShell";
import "uikit/dist/css/uikit.css";

export default async function WomenDropdownProof() {
  if (process.env.NODE_ENV === "production") notFound();
  const website = await getWebsiteByIdOrSlug("woolberry");
  const mapped = mapYoothemeStaticContent(women);
  const result = await materializeBuilderDynamicContent({ version: 1, page: "header", updatedAt: "", sections: mapped.sections }, { website });
  const content = result.renderLayout.sections[0].rows![0].columns[0].elements[0];
  return <main style={{ maxWidth: 1200, margin: "40px auto", padding: 24 }}><ContentLayoutBlock block={content} breadcrumbItems={[]} page="home" shellSettings={defaultBuilderShellSettings} /></main>;
}
