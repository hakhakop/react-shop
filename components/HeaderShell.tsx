import { cookies } from "next/headers";
import { type HeaderSettings } from "../lib/themeSettings";
import {
  getBuilderShellSettings,
  type BuilderHeaderLayout,
  type BuilderShellSettings,
} from "../lib/builderShell";
import {
  type BuilderCustomPage,
  type BuilderLayoutKey,
} from "../lib/builderLayouts";
import { projectWebsiteHref } from "../lib/scopedPreviewLinks";
import type { SaaSWebsite } from "@/lib/websites";
import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderShellView from "./HeaderShellView";
import {
  getOrCreateHeaderBuilderLayout,
} from "@/lib/headerBuilderDocument";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { resolveHeaderDocumentSettings } from "@/lib/headerDocumentSettings";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import type { BuilderThemeSettings } from "@/lib/builderThemeSettings";
import { menuDropdownRenderLayout } from "@/lib/menuDropdownLayout";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";

type HeaderShellProps = {
  layoutOverride?: BuilderHeaderLayout;
  shellSettingsOverride?: BuilderShellSettings;
  themeSettingsOverride?: BuilderThemeSettings | Record<string, unknown>;
  scopedPreviewWebsiteId?: string;
  scopedPreviewPage?: BuilderLayoutKey;
  scopedPreviewPages?: Pick<BuilderCustomPage, "key" | "slug">[];
  hideSaaSEntry?: boolean;
  website?: SaaSWebsite | null;
  activeContentLanguage?: string;
  builderInteractionIdentity?: boolean;
  builderPreviewMode?: boolean;
  builderDraftPreview?: boolean;
  tenantPathMode?: boolean;
};

export default async function HeaderShell({
  layoutOverride,
  shellSettingsOverride,
  themeSettingsOverride,
  scopedPreviewWebsiteId,
  scopedPreviewPage,
  scopedPreviewPages,
  hideSaaSEntry = false,
  website,
  activeContentLanguage,
  builderInteractionIdentity = false,
  builderPreviewMode = false,
  builderDraftPreview = false,
  tenantPathMode = false,
}: HeaderShellProps) {
  const scope = website?.id
    ? { websiteId: website.id }
    : scopedPreviewWebsiteId
      ? { websiteId: scopedPreviewWebsiteId }
      : undefined;

  const shellSettingsRaw =
    shellSettingsOverride ?? (await getBuilderShellSettings(scope));

  // Header rendering is owned by the canonical Builder shell/document. Keep
  // the optional override for callers that explicitly provide compatibility
  // data, but never fetch the obsolete root GraphQL theme-settings field here.
  const settings = (themeSettingsOverride || {}) as Record<string, unknown>;
  const shellSettings = shellSettingsRaw;
  const dropdowns = [...shellSettings.menuItems, ...(shellSettings.namedMenus ?? []).flatMap(menu => menu.items)]
    .flatMap(item => !item.parentId && item.dropdownContent && !item.dropdownContent.sublayout.disabled ? [item.dropdownContent] : []);
  const dropdownProjections = Object.fromEntries(await Promise.all(dropdowns.map(async content => {
    const result = await materializeBuilderDynamicContent(menuDropdownRenderLayout([content]), { website });
    return [content.id, { signature: JSON.stringify(content), sections: result.renderLayout.sections, warnings: result.diagnostics.flatMap(item => item.message ? [item.message] : []) }];
  })));
  const headerSettings: HeaderSettings = settings.headerSettings
    ? (settings.headerSettings as HeaderSettings)
    : {
        menuLocation: "primary",
        logoMaxWidth: shellSettings.headerLogoMaxWidth,
        iconVariant: shellSettings.headerIconVariant,
        iconOrder: shellSettings.headerIconOrder,
      };
  const navigationWebsiteId = scopedPreviewWebsiteId ?? (tenantPathMode ? website?.slug : undefined);
  const serviceHomepageMode = !website && !scopedPreviewWebsiteId;
  const storedHeaderLayout = await getOrCreateHeaderBuilderLayout(
    shellSettings,
    scope ?? {},
    serviceHomepageMode,
  );
  const headerLayout = storedHeaderLayout;
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
  const scopedLinkMode = tenantPathMode
    ? "tenant-path"
    : builderPreviewMode
      ? "builder"
      : "preview";
  const projectHeaderHref = (href: string) => navigationWebsiteId
    ? projectWebsiteHref(href, {
        mode: scopedLinkMode,
        context: { websiteId: navigationWebsiteId, pages: scopedPreviewPages },
      })
    : href;

  return (
    <HeaderShellView
      layoutOverride={layoutOverride}
      shellSettings={shellSettings}
      dropdownProjections={dropdownProjections}
      settings={settings}
      headerSettings={headerSettings}
      serviceHomepageMode={serviceHomepageMode}
      homeHref={
        projectHeaderHref("/")
      }
      clientHref={
        projectHeaderHref("/client")
      }
      scopedPreviewWebsiteId={navigationWebsiteId}
      scopedPreviewPage={scopedPreviewPage}
      scopedPreviewPages={scopedPreviewPages}
      scopedLinkMode={scopedLinkMode}
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
      builderInteractionIdentity={builderInteractionIdentity}
      builderPreviewMode={builderPreviewMode}
      builderDraftPreview={builderDraftPreview}
    />
  );
}
