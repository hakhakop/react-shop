import { cookies } from "next/headers";
import {
  extractHeaderSettings,
  getThemeSettings,
  type HeaderSettings,
} from "../lib/themeSettings";
import {
  getBuilderShellSettings,
  type BuilderHeaderLayout,
  type BuilderShellSettings,
} from "../lib/builderShell";
import {
  getPublishedBuilderLayout,
  type BuilderCustomPage,
  type BuilderLayoutKey,
} from "../lib/builderLayouts";
import { resolveScopedPreviewHref } from "../lib/scopedPreviewLinks";
import type { SaaSWebsite } from "@/lib/websites";
import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderShellView from "./HeaderShellView";
import {
  getOrCreateHeaderBuilderLayout,
} from "@/lib/headerBuilderDocument";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { resolveHeaderDocumentSettings } from "@/lib/headerDocumentSettings";
import { resolveContentSections } from "@/lib/builderContentLanguages";

type HeaderShellProps = {
  layoutOverride?: BuilderHeaderLayout;
  shellSettingsOverride?: BuilderShellSettings;
  scopedPreviewWebsiteId?: string;
  scopedPreviewPage?: BuilderLayoutKey;
  scopedPreviewPages?: Pick<BuilderCustomPage, "key" | "slug">[];
  hideSaaSEntry?: boolean;
  website?: SaaSWebsite | null;
  activeContentLanguage?: string;
};

export default async function HeaderShell({
  layoutOverride,
  shellSettingsOverride,
  scopedPreviewWebsiteId,
  scopedPreviewPage,
  scopedPreviewPages,
  hideSaaSEntry = false,
  website,
  activeContentLanguage,
}: HeaderShellProps) {
  const scope = website?.id
    ? { websiteId: website.id }
    : scopedPreviewWebsiteId
      ? { websiteId: scopedPreviewWebsiteId }
      : undefined;

  const [settingsRaw, shellSettingsRaw, homeLayout] = await Promise.all([
    getThemeSettings().catch(() => ({})),
    getBuilderShellSettings(scope),
    getPublishedBuilderLayout("home", scope).catch(() => null),
  ]);

  const settings = (settingsRaw || {}) as Record<string, unknown>;
  const shellSettings = shellSettingsOverride ?? shellSettingsRaw;
  const headerSettings: HeaderSettings = settings.headerSettings
    ? (settings.headerSettings as HeaderSettings)
    : extractHeaderSettings(settings);
  const scopedLinkContext = scopedPreviewWebsiteId
    ? { websiteId: scopedPreviewWebsiteId, pages: scopedPreviewPages }
    : null;
  const serviceHomepageMode = !website && !scopedPreviewWebsiteId;
  const headerLayout = await getOrCreateHeaderBuilderLayout(
    shellSettings,
    scope ?? {},
    serviceHomepageMode,
  );
  const cookieStore = await cookies();
  const langKey = `website_content_language_${website?.id ?? "root"}`;
  const languageCookie = cookieStore.get(langKey)?.value;
  const selectedContentLanguage =
    activeContentLanguage ??
    ((website?.enabledLanguages?.includes(languageCookie as never) || (!website && ["hy", "en", "ru"].includes(languageCookie as never)))
      ? languageCookie!
      : website?.primaryLanguage ?? "hy");
  const localizedHeaderLayout = {
    ...headerLayout,
    sections: resolveContentSections(
      headerLayout.sections as never,
      selectedContentLanguage,
      website?.primaryLanguage ?? selectedContentLanguage,
    ) as typeof headerLayout.sections,
  };
  const headerComposition = resolveHeaderBuilderComposition(localizedHeaderLayout);
  const documentSettings = resolveHeaderDocumentSettings(
    headerComposition,
    shellSettings,
  );
  if (!documentSettings.visible) return null;
  const categoryElement = headerComposition.elements.find(
    (element) => element.type === "categories",
  );

  return (
    <HeaderShellView
      layoutOverride={layoutOverride}
      shellSettings={shellSettings}
      settings={settings}
      headerSettings={headerSettings}
      serviceHomepageMode={serviceHomepageMode}
      homeHref={
        scopedLinkContext
          ? resolveScopedPreviewHref("/", scopedLinkContext)
          : "/"
      }
      clientHref={
        scopedLinkContext
          ? resolveScopedPreviewHref("/client", scopedLinkContext)
          : "/client"
      }
      scopedPreviewWebsiteId={scopedPreviewWebsiteId}
      scopedPreviewPage={scopedPreviewPage}
      scopedPreviewPages={scopedPreviewPages}
      hideSaaSEntry={hideSaaSEntry}
      categoriesContent={categoryElement ? (
        <CategoryMegaMenu
          website={website}
          showAllCategories={categoryElement.categoriesShowAll !== false}
          showCounts={categoryElement.categoriesShowCounts !== false}
          showHierarchy={categoryElement.categoriesShowHierarchy !== false}
        />
      ) : null}
      headerComposition={headerComposition}
      publicAnchorId={localizedHeaderLayout.sections[0]?.anchorId}
      activeContentLanguage={selectedContentLanguage}
      enabledContentLanguages={website?.enabledLanguages ?? ["hy", "en", "ru"]}
      languagePreferenceKey={`website_content_language_${website?.id ?? "root"}`}
    />
  );
}
