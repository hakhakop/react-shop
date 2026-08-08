import HeaderShell from "@/components/HeaderShell";
import FooterShell from "@/components/FooterShell";
import ScopedPreviewLinkRouter from "@/components/builder/ScopedPreviewLinkRouter";
import StorefrontBuilderRenderer, {
  type StorefrontBuilderRendererProps,
} from "@/components/builder/StorefrontBuilderRenderer";
import type { ReactNode } from "react";
import {
  getPublishedBuilderLayout,
  isBuilderCustomPageKey,
  normalizeBuilderLayoutKey,
  readBuilderCustomPages,
  type BuilderLayoutKey,
} from "@/lib/builderLayouts";
import {
  getBuilderShellSettings,
  type BuilderShellSettings,
} from "@/lib/builderShell";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import { ensureWebsiteBuilderData } from "@/lib/websiteBuilderData";
import { getWebsiteRouteSegment, type SaaSWebsite } from "@/lib/websites";
import { cookies } from "next/headers";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import { Sparkles } from "lucide-react";
import { getPublishedHeaderDocumentSettings } from "@/lib/publishedHeaderDocumentSettings";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { builderGlobalVisibilityClassName } from "@/lib/builderVisualStyle";

type WebsiteFrontendMode = "preview" | "domain";

type WebsiteFrontendProps = {
  website: SaaSWebsite;
  requestedPage: string;
  mode: WebsiteFrontendMode;
  pageLabelOverride?: string;
  rendererProps?: Omit<
    StorefrontBuilderRendererProps,
    "layout" | "page" | "pageLabel" | "website"
  >;
  fallbackContent?: ReactNode;
};

function spacing(value: string | undefined, context: BuilderSpacingContext) {
  return resolveBuilderSpacing(value, context).css;
}

function scopedShellCss(shellSettings: BuilderShellSettings) {
  const uikitGlobals = getUikitGlobalsCssVars(shellSettings);
  const uikitCss = Object.entries(uikitGlobals)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  return `
:root {
${uikitCss}
  --builder-global-section-padding-top: ${spacing(shellSettings.sectionPaddingTop, "sectionPadding")};
  --builder-global-section-padding-bottom: ${spacing(shellSettings.sectionPaddingBottom, "sectionPadding")};
  --builder-global-section-margin-top: ${spacing(shellSettings.sectionMarginTop, "sectionMargin")};
  --builder-global-section-margin-bottom: ${spacing(shellSettings.sectionMarginBottom, "sectionMargin")};
  --builder-global-row-padding-top: ${spacing(shellSettings.rowPaddingTop, "rowPadding")};
  --builder-global-row-padding-bottom: ${spacing(shellSettings.rowPaddingBottom, "rowPadding")};
  --builder-global-row-margin-top: ${spacing(shellSettings.rowMarginTop, "rowMargin")};
  --builder-global-row-margin-bottom: ${spacing(shellSettings.rowMarginBottom, "rowMargin")};
  --builder-global-row-gap: ${spacing(shellSettings.rowGap, "rowGap")};
  --builder-global-column-gap: ${spacing(shellSettings.columnGap, "columnGap")};
  --builder-global-element-padding-top: ${spacing(shellSettings.elementPaddingTop, "elementPadding")};
  --builder-global-element-padding-right: ${spacing(shellSettings.elementPaddingRight, "elementPadding")};
  --builder-global-element-padding-bottom: ${spacing(shellSettings.elementPaddingBottom, "elementPadding")};
  --builder-global-element-padding-left: ${spacing(shellSettings.elementPaddingLeft, "elementPadding")};
  --builder-global-element-margin-top: ${spacing(shellSettings.elementMarginTop, "elementMargin")};
  --builder-global-element-margin-right: ${spacing(shellSettings.elementMarginRight, "elementMargin")};
  --builder-global-element-margin-bottom: ${spacing(shellSettings.elementMarginBottom, "elementMargin")};
  --builder-global-element-margin-left: ${spacing(shellSettings.elementMarginLeft, "elementMargin")};
}
  `.trim();
}

function pageLabel(
  page: BuilderLayoutKey,
  customPages: Awaited<ReturnType<typeof readBuilderCustomPages>>,
) {
  if (!isBuilderCustomPageKey(page)) return undefined;
  return customPages.find((item) => item.key === page)?.title;
}

function resolveWebsitePageKey(
  requestedPage: string,
  customPages: Awaited<ReturnType<typeof readBuilderCustomPages>>,
): BuilderLayoutKey {
  if (requestedPage === "cart") return "page:cart";
  if (requestedPage === "checkout") return "page:checkout";
  if (requestedPage === "my-account") return "page:my-account";

  const normalizedDirect = normalizeBuilderLayoutKey(requestedPage);
  if (
    normalizedDirect !== "shop" ||
    requestedPage === "shop" ||
    requestedPage === "product-single" ||
    requestedPage === "product-category" ||
    requestedPage === "product-category-specific" ||
    requestedPage === "search-results" ||
    requestedPage.startsWith("page:")
  ) {
    return normalizedDirect;
  }

  const requestedSlug = requestedPage.replace(/^\/+|\/+$/g, "");
  const customPage = customPages.find(
    (item) =>
      item.slug === requestedSlug ||
      item.key === `page:${requestedSlug}` ||
      item.key === requestedPage,
  );

  return customPage?.key ?? normalizedDirect;
}

export default async function WebsiteFrontend({
  website,
  requestedPage,
  mode,
  pageLabelOverride,
  rendererProps,
  fallbackContent,
}: WebsiteFrontendProps) {
  await ensureWebsiteBuilderData(website.id);

  const scope = { websiteId: website.id };
  const customPages = await readBuilderCustomPages(scope);
  const scopedPreviewPages = customPages.map((item) => ({
    key: item.key,
    slug: item.slug,
  }));
  const websiteRouteSegment = getWebsiteRouteSegment(website);
  const page = resolveWebsitePageKey(requestedPage, customPages);

  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout(page, scope),
    getBuilderShellSettings(scope),
  ]);
  const headerDocumentSettings = await getPublishedHeaderDocumentSettings(
    shellSettings,
    scope,
  );
  const languageCookie = (await cookies()).get(`website_content_language_${website.id}`)?.value;
  const activeContentLanguage = website.enabledLanguages.includes(languageCookie as never)
    ? languageCookie!
    : website.primaryLanguage;
  const localizedLayout = layout
    ? { ...layout, sections: resolveContentSections(layout.sections as never, activeContentLanguage, website.primaryLanguage) as typeof layout.sections }
    : layout;

  const hasVisibleLayout = localizedLayout?.sections?.some((section) => section.visible);

  if (!hasVisibleLayout && !fallbackContent) {
    return (
      <main className="page">
        <h1 className="page-title">Page not found</h1>
        <p className="page-subtitle">
          This website does not have a published layout for this page yet.
        </p>
      </main>
    );
  }

  const isPreview = mode === "preview";

  return (
    <div className={builderGlobalVisibilityClassName({
      desktop: shellSettings.visibilityDesktop,
      tablet: shellSettings.visibilityTablet,
      mobile: shellSettings.visibilityMobile,
    })} data-scoped-preview-root={isPreview ? "" : undefined} data-domain-website-root={!isPreview ? "" : undefined}>
      {isPreview && (
        <ScopedPreviewLinkRouter
          websiteId={websiteRouteSegment}
          pages={scopedPreviewPages}
        />
      )}
      <style
        data-builder-preview-shell
        dangerouslySetInnerHTML={{ __html: scopedShellCss(shellSettings) }}
      />
      <HeaderShell
        layoutOverride={shellSettings.headerLayout}
        shellSettingsOverride={shellSettings}
        scopedPreviewWebsiteId={isPreview ? websiteRouteSegment : undefined}
        scopedPreviewPage={page}
        scopedPreviewPages={scopedPreviewPages}
        hideSaaSEntry={!isPreview}
        website={website}
        activeContentLanguage={activeContentLanguage}
      />
      {localizedLayout && hasVisibleLayout ? (
        <StorefrontBuilderRenderer
          layout={localizedLayout}
          page={page}
          pageLabel={pageLabelOverride ?? pageLabel(page, customPages)}
          website={website}
          headerOverlay={headerDocumentSettings.overlay}
          {...rendererProps}
          shellSettings={shellSettings}
        />
      ) : (
        fallbackContent
      )}
      <FooterShell
        website={website}
        activeContentLanguage={activeContentLanguage}
      />
      {website.status !== "active" && (
        <div className="webpages-draft-branding"><Sparkles size={14} /> Created with <strong>WebPages</strong></div>
      )}
    </div>
  );
}
