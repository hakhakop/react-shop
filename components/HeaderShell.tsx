import { cookies } from "next/headers";
import { type HeaderSettings } from "../lib/themeSettings";
import {
  getBuilderShellSettings,
  type BuilderHeaderLayout,
  type BuilderShellSettings,
} from "../lib/builderShell";
import {
  type BuilderCustomPage,
  type BuilderLayout,
  type BuilderLayoutKey,
} from "../lib/builderLayouts";
import { projectWebsiteHref } from "../lib/scopedPreviewLinks";
import type { SaaSWebsite } from "@/lib/websites";
import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderShellView from "./HeaderShellView";
import {
  getHeaderBuilderDocuments,
} from "@/lib/headerBuilderDocument";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { resolveHeaderDocumentSettings } from "@/lib/headerDocumentSettings";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import type { BuilderThemeSettings } from "@/lib/builderThemeSettings";
import { menuDropdownRenderLayout } from "@/lib/menuDropdownLayout";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import {
  headerBuilderDocumentSectionId,
  type HeaderBuilderDocumentKey,
} from "@/lib/headerBuilderDocumentKeys";

type HeaderShellProps = {
  layoutOverride?: BuilderHeaderLayout;
  shellSettingsOverride?: BuilderShellSettings;
  themeSettingsOverride?: BuilderThemeSettings | Record<string, unknown>;
  scopedPreviewWebsiteId?: string;
  scopedPreviewPage?: BuilderLayoutKey;
  scopedPreviewPages?: Pick<BuilderCustomPage, "key" | "slug">[];
  scopedPreviewGlobalStarterId?: string;
  hideSaaSEntry?: boolean;
  website?: SaaSWebsite | null;
  activeContentLanguage?: string;
  builderInteractionIdentity?: boolean;
  builderPreviewMode?: boolean;
  builderDraftPreview?: boolean;
  previewHeaderVariant?: "desktop" | "mobile";
  previewHeaderDocument?: HeaderBuilderDocumentKey;
  tenantPathMode?: boolean;
  dropdownProjectionsOverride?: HeaderDropdownProjections;
};

export type HeaderDropdownProjections = Record<
  string,
  { signature: string; sections: BuilderLayout["sections"]; warnings?: string[] }
>;

type HeaderDropdownProjection = HeaderDropdownProjections[string];
type HeaderDropdownProjectionCacheEntry = {
  signature: string;
  expiresAt: number;
  value?: HeaderDropdownProjection;
  pending?: Promise<HeaderDropdownProjection>;
};
const HEADER_DROPDOWN_CACHE_TTL_MS = 30_000;
const HEADER_DROPDOWN_CACHE_MAX_ENTRIES = 200;
const headerDropdownProjectionCache = new Map<string, HeaderDropdownProjectionCacheEntry>();

const trimHeaderDropdownProjectionCache = () => {
  while (headerDropdownProjectionCache.size > HEADER_DROPDOWN_CACHE_MAX_ENTRIES) {
    const oldest = headerDropdownProjectionCache.keys().next().value;
    if (typeof oldest !== "string") break;
    headerDropdownProjectionCache.delete(oldest);
  }
};

const materializeHeaderDropdown = async (
  content: NonNullable<BuilderShellSettings["menuItems"][number]["dropdownContent"]>,
  website?: SaaSWebsite | null,
): Promise<HeaderDropdownProjection> => {
  const signature = JSON.stringify(content);
  const result = await materializeBuilderDynamicContent(menuDropdownRenderLayout([content]), { website });
  return {
    signature,
    sections: result.renderLayout.sections,
    warnings: result.diagnostics.flatMap(item => item.message ? [item.message] : []),
  };
};

const resolveCachedHeaderDropdown = async (
  itemId: string,
  content: NonNullable<BuilderShellSettings["menuItems"][number]["dropdownContent"]>,
  website?: SaaSWebsite | null,
) => {
  const signature = JSON.stringify(content);
  const cacheKey = `${website?.id ?? "default"}:${itemId}`;
  const cached = headerDropdownProjectionCache.get(cacheKey);
  if (cached?.signature === signature) {
    if (cached.value) {
      if (cached.expiresAt <= Date.now() && !cached.pending) {
        const pending = materializeHeaderDropdown(content, website);
        cached.pending = pending;
        pending.then(value => {
          const current = headerDropdownProjectionCache.get(cacheKey);
          if (current?.pending !== pending || current.signature !== signature) return;
          headerDropdownProjectionCache.set(cacheKey, {
            signature,
            value,
            expiresAt: Date.now() + HEADER_DROPDOWN_CACHE_TTL_MS,
          });
        }).catch(() => {
          if (headerDropdownProjectionCache.get(cacheKey)?.pending === pending) cached.pending = undefined;
        });
      }
      return cached.value;
    }
    if (cached.pending) return cached.pending;
  }
  const pending = materializeHeaderDropdown(content, website);
  headerDropdownProjectionCache.set(cacheKey, {
    signature,
    pending,
    expiresAt: Date.now() + HEADER_DROPDOWN_CACHE_TTL_MS,
  });
  trimHeaderDropdownProjectionCache();
  try {
    const value = await pending;
    const current = headerDropdownProjectionCache.get(cacheKey);
    if (current?.pending === pending && current.signature === signature) {
      headerDropdownProjectionCache.set(cacheKey, {
        signature,
        value,
        expiresAt: Date.now() + HEADER_DROPDOWN_CACHE_TTL_MS,
      });
    }
    return value;
  } catch (error) {
    if (headerDropdownProjectionCache.get(cacheKey)?.pending === pending) headerDropdownProjectionCache.delete(cacheKey);
    throw error;
  }
};

export async function resolveHeaderDropdownProjections(
  shellSettings: BuilderShellSettings,
  website?: SaaSWebsite | null,
): Promise<HeaderDropdownProjections> {
  const dropdowns = [...shellSettings.menuItems, ...(shellSettings.namedMenus ?? []).flatMap(menu => menu.items)]
    .filter(item => !item.parentId && item.dropdownContent && !item.dropdownContent.sublayout.disabled);
  return Object.fromEntries(await Promise.all(dropdowns.map(async item => [
    item.id,
    await resolveCachedHeaderDropdown(item.id, item.dropdownContent!, website),
  ])));
}

export default async function HeaderShell({
  layoutOverride,
  shellSettingsOverride,
  themeSettingsOverride,
  scopedPreviewWebsiteId,
  scopedPreviewPage,
  scopedPreviewPages,
  scopedPreviewGlobalStarterId,
  hideSaaSEntry = false,
  website,
  activeContentLanguage,
  builderInteractionIdentity = false,
  builderPreviewMode = false,
  builderDraftPreview = false,
  previewHeaderVariant,
  previewHeaderDocument,
  tenantPathMode = false,
  dropdownProjectionsOverride,
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
  const dropdownProjections = dropdownProjectionsOverride ??
    await resolveHeaderDropdownProjections(shellSettings, website);
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
  const storedHeaderDocuments = await getHeaderBuilderDocuments(
    shellSettings,
    scope ?? {},
    serviceHomepageMode,
  );
  const headerLayout = storedHeaderDocuments.desktop;
  const cookieStore = await cookies();
  const langKey = `website_content_language_${website?.id ?? "root"}`;
  const languageCookie = cookieStore.get(langKey)?.value;
  const selectedContentLanguage =
    activeContentLanguage ??
    ((website?.enabledLanguages?.includes(languageCookie as never) || (!website && ["hy", "en", "ru"].includes(languageCookie as never)))
      ? languageCookie!
      : website?.primaryLanguage ?? "hy");
  const primaryContentLanguage = website?.primaryLanguage ?? "hy";
  const localizedHeaderLayout = {
    ...headerLayout,
    sections: resolveContentSections(
      headerLayout.sections as never,
      selectedContentLanguage,
      primaryContentLanguage,
    ) as typeof headerLayout.sections,
  };
  const headerComposition = resolveHeaderBuilderComposition(localizedHeaderLayout);
  const localizedMobileHeaderLayout = storedHeaderDocuments.mobile
    ? {
        ...storedHeaderDocuments.mobile,
        sections: resolveContentSections(
          storedHeaderDocuments.mobile.sections as never,
          selectedContentLanguage,
          primaryContentLanguage,
        ) as typeof storedHeaderDocuments.mobile.sections,
      }
    : null;
  const mobileHeaderComposition = localizedMobileHeaderLayout
    ? resolveHeaderBuilderComposition(localizedMobileHeaderLayout, {
        sectionId: headerBuilderDocumentSectionId("header-mobile"),
      })
    : undefined;
  // New Mobile Header documents own both authored surfaces in reading order:
  // the mobile bar first, followed by the drawer content. Keep the old
  // standalone document as a storefront fallback until an explicit mobile
  // Builder or Theme Settings action migrates an existing site.
  const embeddedDialogSectionId = headerBuilderDocumentSectionId("header-mobile-dialog");
  const mobileDialogComposition = localizedMobileHeaderLayout?.sections.some(
    (section) => section.id === embeddedDialogSectionId,
  )
    ? resolveHeaderBuilderComposition(localizedMobileHeaderLayout, {
        sectionId: embeddedDialogSectionId,
      })
    : storedHeaderDocuments.dialog
      ? resolveHeaderBuilderComposition({
          ...storedHeaderDocuments.dialog,
          sections: resolveContentSections(
            storedHeaderDocuments.dialog.sections as never,
            selectedContentLanguage,
            primaryContentLanguage,
          ) as typeof storedHeaderDocuments.dialog.sections,
        })
      : undefined;
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
        context: {
          websiteId: navigationWebsiteId,
          pages: scopedPreviewPages,
          globalStarterId: scopedPreviewGlobalStarterId,
        },
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
      scopedPreviewGlobalStarterId={scopedPreviewGlobalStarterId}
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
      mobileHeaderComposition={mobileHeaderComposition}
      mobileDialogComposition={mobileDialogComposition}
      publicAnchorId={localizedHeaderLayout.sections[0]?.anchorId}
      activeContentLanguage={selectedContentLanguage}
      enabledContentLanguages={website?.enabledLanguages ?? ["hy", "en", "ru"]}
      languagePreferenceKey={`website_content_language_${website?.id ?? "root"}`}
      builderInteractionIdentity={builderInteractionIdentity}
      builderPreviewMode={builderPreviewMode}
      builderDraftPreview={builderDraftPreview}
      previewHeaderVariant={previewHeaderVariant}
      forceMobileDialogOpen={
        previewHeaderDocument === "header-mobile-dialog" ||
        (builderDraftPreview && previewHeaderDocument === "header-mobile")
      }
    />
  );
}
