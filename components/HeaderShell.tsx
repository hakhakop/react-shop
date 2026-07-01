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
import CategoryMegaMenu from "./CategoryMegaMenu";
import HeaderShellView from "./HeaderShellView";

type HeaderShellProps = {
  layoutOverride?: BuilderHeaderLayout;
  shellSettingsOverride?: BuilderShellSettings;
  scopedPreviewWebsiteId?: string;
  scopedPreviewPage?: BuilderLayoutKey;
  scopedPreviewPages?: Pick<BuilderCustomPage, "key" | "slug">[];
};

export default async function HeaderShell({
  layoutOverride,
  shellSettingsOverride,
  scopedPreviewWebsiteId,
  scopedPreviewPage,
  scopedPreviewPages,
}: HeaderShellProps) {
  const [settingsRaw, shellSettingsRaw, homeLayout] = await Promise.all([
    getThemeSettings().catch(() => ({})),
    getBuilderShellSettings(),
    getPublishedBuilderLayout("home").catch(() => null),
  ]);

  const settings = (settingsRaw || {}) as Record<string, unknown>;
  const shellSettings = shellSettingsOverride ?? shellSettingsRaw;
  const headerSettings: HeaderSettings = settings.headerSettings
    ? (settings.headerSettings as HeaderSettings)
    : extractHeaderSettings(settings);
  const scopedLinkContext = scopedPreviewWebsiteId
    ? { websiteId: scopedPreviewWebsiteId, pages: scopedPreviewPages }
    : null;
  const serviceHomepageMode = Boolean(
    homeLayout?.sections?.some((section) =>
      section.title?.includes("Beautiful React Websites") ||
      section.layoutItems?.some((item) =>
        item.blocks?.some((block) =>
          block.title?.includes("Beautiful React Websites"),
        ),
      ),
    ),
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
      categoriesContent={<CategoryMegaMenu />}
    />
  );
}
