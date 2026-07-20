import { cookies, headers } from "next/headers";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import WebsiteFrontend from "@/components/website/WebsiteFrontend";
import { getPublishedBuilderLayout } from "@/lib/builderLayouts";
import { getWebsiteByDomainHost } from "@/lib/websites";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getPublishedHeaderDocumentSettings } from "@/lib/publishedHeaderDocumentSettings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const host = (await headers()).get("host");
  const domainWebsite = await getWebsiteByDomainHost(host);

  if (domainWebsite) {
    return (
      <WebsiteFrontend
        website={domainWebsite}
        requestedPage="home"
        mode="domain"
      />
    );
  }

  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout("home"),
    getBuilderShellSettings(),
  ]);
  const headerDocumentSettings = await getPublishedHeaderDocumentSettings(shellSettings);
  const cookieStore = await cookies();
  const languageCookie = cookieStore.get("website_content_language_root")?.value;
  const activeContentLanguage = ["hy", "en", "ru"].includes(languageCookie as never)
    ? languageCookie!
    : "hy";

  const localizedLayout = layout
    ? {
        ...layout,
        sections: resolveContentSections(
          layout.sections as never,
          activeContentLanguage,
          "hy",
        ) as typeof layout.sections,
      }
    : layout;
  const launchLayout = localizedLayout ? {
    ...localizedLayout,
    sections: localizedLayout.sections.map((section) => ({
      ...section,
      ...(section.buttonLabel && section.buttonUrl ? { buttonLabel: "Start Free", buttonUrl: "/register" } : {}),
      layoutItems: section.layoutItems?.map((item) => ({
        ...item,
        blocks: item.blocks?.map((block) => ({
          ...block,
          ...(block.buttonLabel && block.buttonUrl ? { buttonLabel: "Start Free", buttonUrl: "/register" } : {}),
          buttons: block.buttons?.map((button) => button.style === "primary" ? { ...button, label: "Start Free", url: "/register" } : button),
        })),
      })),
    })),
  } : localizedLayout;

  if (launchLayout?.sections?.some((section) => section.visible)) {
    return (
      <StorefrontBuilderRenderer
        layout={launchLayout}
        page="home"
        headerOverlay={headerDocumentSettings.overlay}
      />
    );
  }

  return null;
}
