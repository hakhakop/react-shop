import { cookies } from "next/headers";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import { getOrCreateFooterBuilderLayout } from "@/lib/footerBuilderDocument";
import type { SaaSWebsite } from "@/lib/websites";

type FooterShellProps = {
  website?: SaaSWebsite | null;
  activeContentLanguage?: string;
};

export default async function FooterShell({
  website,
  activeContentLanguage,
}: FooterShellProps) {
  const layout = await getOrCreateFooterBuilderLayout(
    website ? { websiteId: website.id } : {},
  );
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get(
    `website_content_language_${website?.id ?? "root"}`,
  )?.value;
  const language =
    activeContentLanguage ??
    (website?.enabledLanguages.includes(languageCookie as never)
      ? languageCookie!
      : website?.primaryLanguage ?? "hy");
  const localizedLayout = {
    ...layout,
    sections: resolveContentSections(
      layout.sections as never,
      language,
      website?.primaryLanguage ?? language,
    ) as typeof layout.sections,
  };

  return (
    <StorefrontBuilderRenderer
      layout={localizedLayout}
      page="footer"
      pageLabel="Footer"
      website={website}
      rootElement="footer"
    />
  );
}
