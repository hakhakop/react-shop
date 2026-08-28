import HeaderShell from "@/components/HeaderShell";
import FooterShell from "@/components/FooterShell";
import ScopedPreviewLinkRouter from "@/components/builder/ScopedPreviewLinkRouter";
import WebPagesFontLoader from "@/components/builder/WebPagesFontLoader";
import StorefrontBuilderRenderer, {
  type StorefrontBuilderRendererProps,
} from "@/components/builder/StorefrontBuilderRenderer";
import type { ReactNode } from "react";
import {
  getPublishedBuilderLayout,
  isBuilderCustomPageKey,
  normalizeBuilderLayoutKey,
  readBuilderCustomPages,
  type BuilderLayout,
  type BuilderLayoutKey,
} from "@/lib/builderLayouts";
import {
  getBuilderShellSettings,
  type BuilderShellSettings,
} from "@/lib/builderShell";
import {
  applyBuilderThemeSettings,
  type BuilderThemeSettings,
} from "@/lib/builderThemeSettings";
import { getBuilderThemeSettings } from "@/lib/builderThemeSettings.server";
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
import { resolveBuilderMediaUrls } from "@/lib/builderMediaUrls";
import { getBuilderPageKeyForTenantPath } from "@/lib/scopedPreviewLinks";
import { getWordPressBaseUrl } from "@/lib/wordpressUrl";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import BuilderIframeSelectionBridge from "@/components/builder/BuilderIframeSelectionBridge";
import BuilderDocumentRuntime from "@/components/builder/BuilderDocumentRuntime";

type WebsiteFrontendMode = "preview" | "domain" | "tenant-path";

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
  /** Pre-resolved document ownership; selection remains outside rendering. */
  layoutOverride?: BuilderLayout;
  dynamicItemContextOverride?: DynamicItemContext;
  builderIframeSelection?: boolean;
  builderIframeDiagnostics?: "minimal" | "settled" | "rect" | "toolbar" | "full";
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
/* Tenant-owned UIkit tokens must live on the WebsiteFrontend root rather
   than document :root. The application shell also emits generic globals at
   document scope; putting an imported YOOtheme preset on :root lets one
   tenant's Card/Button tokens compete with another tenant's runtime. */
:where([data-scoped-preview-root], [data-domain-website-root]) {
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

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container {
  background: var(--uk-theme-page-container-background, transparent);
  color: var(--uk-theme-page-container-color, inherit);
  --uk-inverse: var(--uk-theme-page-container-color-mode, dark);
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container--full {
  background: var(--uk-theme-page-container-background, transparent);
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-margin-top {
  margin-top: var(--uk-theme-page-container-margin-top, 0);
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-margin-bottom {
  margin-bottom: var(--uk-theme-page-container-margin-bottom, 0);
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page {
  position: relative;
  border: 0 solid var(--uk-theme-page-border-color, transparent);
  border-image: var(--uk-theme-page-border-gradient, none) 1;
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container--boxed .tm-page {
  width: 100%;
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container--boxed[data-builder-theme-page-alignment="left"] .tm-page {
  margin-left: 0;
  margin-right: auto;
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container--boxed[data-builder-theme-page-alignment="center"] .tm-page {
  margin-left: auto;
  margin-right: auto;
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container--boxed[data-builder-theme-page-alignment="right"] .tm-page {
  margin-left: auto;
  margin-right: 0;
}

:where([data-scoped-preview-root], [data-domain-website-root]) .tm-page-container--boxed .tm-page {
  max-width: var(--uk-page-container-max-width, 1500px);
}

@media (min-width: 960px) {
  :where([data-scoped-preview-root], [data-domain-website-root]) .tm-page {
    border-width: var(--uk-theme-page-border-width, 0);
    border-top-width: var(--uk-theme-page-border-top-width, var(--uk-theme-page-border-width, 0));
  }
}

@media (min-width: 1200px) {
  :where([data-scoped-preview-root], [data-domain-website-root]) .tm-page {
    border-width: var(--uk-theme-page-border-width-large, var(--uk-theme-page-border-width, 0));
    border-top-width: var(--uk-theme-page-border-top-width, var(--uk-theme-page-border-width-large, var(--uk-theme-page-border-width, 0)));
  }
}

/* The canonical preview keeps the imported Header in normal document flow
   when overlay/pull-under are disabled. Preserve the semantic surface on the
   document root for the reserved header-height area, while leaving Section
   gradients to the Section that owns them. */
html:has([data-scoped-preview-root]),
html:has([data-domain-website-root]) {
  background-color: var(--uikit-section-default-bg, var(--page-bg)) !important;
  /* YOOtheme paints the imported surface on Sections, not on the document
     root. Keep the root color for the transparent header area, but do not
     create a second gradient origin beneath the Section handoff. */
  background-image: none !important;
  color: var(--uk-global-text-color, var(--text-main)) !important;
}

body:has([data-scoped-preview-root]),
body:has([data-domain-website-root]) {
  background-color: transparent !important;
  background-image: none !important;
}

/* Keep the host shell transparent so an imported Section remains the only
   owner of its gradient/background paint. The html surface still covers the
   reserved normal-flow header area before the first Section begins. */
body:has([data-scoped-preview-root]) .site-main,
body:has([data-domain-website-root]) .site-main {
  background-color: transparent !important;
  background-image: none !important;
}

body:has([data-scoped-preview-root]) .shop-builder-main,
body:has([data-domain-website-root]) .shop-builder-main {
  /* Match YOOtheme's transparent #tm-main. Section variants must be the
     paint owner; a main-level black surface otherwise becomes visible when
     a remove-bottom-padding section hands off to the next Section. */
  background-color: transparent !important;
  background-image: none !important;
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
    requestedPage === "post-single" ||
    requestedPage === "product-category" ||
    requestedPage === "product-category-specific" ||
    requestedPage === "search-results" ||
    requestedPage.startsWith("page:")
  ) {
    return normalizedDirect;
  }

  return getBuilderPageKeyForTenantPath(requestedPage, customPages) ?? normalizedDirect;
}

export default async function WebsiteFrontend({
  website,
  requestedPage,
  mode,
  pageLabelOverride,
  rendererProps,
  fallbackContent,
  layoutOverride,
  dynamicItemContextOverride,
  builderIframeSelection = false,
  builderIframeDiagnostics = "minimal",
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

  const [layout, baseShellSettings, themeSettings] = await Promise.all([
    layoutOverride ?? getPublishedBuilderLayout(page, scope),
    getBuilderShellSettings(scope),
    getBuilderThemeSettings(scope),
  ]);
  const shellSettings = applyBuilderThemeSettings(baseShellSettings, themeSettings);
  const headerDocumentSettings = await getPublishedHeaderDocumentSettings(
    shellSettings,
    scope,
    themeSettings,
  );
  const languageCookie = (await cookies()).get(`website_content_language_${website.id}`)?.value;
  const activeContentLanguage = website.enabledLanguages.includes(languageCookie as never)
    ? languageCookie!
    : website.primaryLanguage;
  const localizedLayout = layout
    ? { ...layout, sections: resolveContentSections(layout.sections as never, activeContentLanguage, website.primaryLanguage) as typeof layout.sections }
    : layout;
  const resolvedMediaLayout = localizedLayout
    ? resolveBuilderMediaUrls(localizedLayout, getWordPressBaseUrl(website))
    : localizedLayout;
  // The Builder route already owns a materialized projection and sends it to
  // its isolated iframe through the draft bridge. Materializing the published
  // layout again here delays iframe readiness and duplicates every provider
  // request before that bridge can deliver the authoritative projection.
  const materialization = resolvedMediaLayout && !builderIframeSelection
    ? await materializeBuilderDynamicContent(resolvedMediaLayout, {
        website,
        rootContext: dynamicItemContextOverride,
      })
    : null;
  const renderLayout = materialization?.renderLayout ?? resolvedMediaLayout;
  materialization?.diagnostics
    .filter((diagnostic) => diagnostic.status === "fallback")
    .forEach((diagnostic) => {
      console.warn("[dynamic-content] storefront fallback", diagnostic);
    });

  const hasVisibleLayout = renderLayout?.sections?.some((section) => section.visible);
  // A newly created page can have a complete local Builder draft before its
  // first publish. The iframe must still mount the canonical renderer so it
  // can receive that draft snapshot; returning the not-found shell here would
  // prevent StorefrontBuilderRenderer's draft bridge from ever mounting.
  const mountDraftPreview = builderIframeSelection && !hasVisibleLayout && !fallbackContent;
  const draftPreviewLayout: BuilderLayout = {
    version: 1,
    key: page,
    page,
    targetType: "page",
    sections: [],
    updatedAt: new Date(0).toISOString(),
  };

  if (!hasVisibleLayout && !fallbackContent && !mountDraftPreview) {
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
  const isTenantPath = mode === "tenant-path";

  return (
    <div className={builderGlobalVisibilityClassName({
      desktop: shellSettings.visibilityDesktop,
      tablet: shellSettings.visibilityTablet,
      mobile: shellSettings.visibilityMobile,
    })} data-scoped-preview-root={isPreview ? "" : undefined} data-domain-website-root={!isPreview ? "" : undefined} data-tenant-website-root={isTenantPath ? websiteRouteSegment : undefined} data-builder-runtime-deferred="true">
      <WebPagesFontLoader settings={shellSettings} />
      {builderIframeSelection ? <BuilderIframeSelectionBridge diagnostics={builderIframeDiagnostics} /> : null}
      {(isPreview || isTenantPath) && (
        <ScopedPreviewLinkRouter
          websiteId={websiteRouteSegment}
          pages={scopedPreviewPages}
          mode={isTenantPath ? "tenant-path" : "preview"}
        />
      )}
      <style
        data-builder-preview-shell
        dangerouslySetInnerHTML={{ __html: scopedShellCss(shellSettings) }}
      />
      <BuilderDocumentRuntime>
        <div
          className={shellSettings.themePageLayout === "boxed" ? "tm-page-container tm-page-container--boxed tm-page-margin-top tm-page-margin-bottom" : "tm-page-container tm-page-container--full"}
          data-builder-theme-page-container={themeSettings.active ? themeSettings.themeId ?? "active" : undefined}
          data-builder-theme-page-alignment={shellSettings.themePageContainerAlignment ?? undefined}
        >
          <div className="tm-page">
            <HeaderShell
              layoutOverride={shellSettings.headerLayout}
              shellSettingsOverride={shellSettings}
              scopedPreviewWebsiteId={isPreview ? websiteRouteSegment : undefined}
              scopedPreviewPage={page}
              scopedPreviewPages={scopedPreviewPages}
              hideSaaSEntry={!isPreview}
              website={website}
              activeContentLanguage={activeContentLanguage}
              builderInteractionIdentity={builderIframeSelection}
              builderPreviewMode={builderIframeSelection}
              builderDraftPreview={builderIframeSelection}
              tenantPathMode={isTenantPath}
              themeSettingsOverride={themeSettings as BuilderThemeSettings}
            />
            {renderLayout && hasVisibleLayout || mountDraftPreview ? (
              <StorefrontBuilderRenderer
                layout={renderLayout ?? draftPreviewLayout}
                page={page}
                pageLabel={pageLabelOverride ?? pageLabel(page, customPages)}
                website={website}
                headerOverlay={headerDocumentSettings.overlay}
                {...rendererProps}
                builderInteractionIdentity={builderIframeSelection || rendererProps?.builderInteractionIdentity}
                shellSettings={shellSettings}
                documentRuntimeOwnedExternally
              />
            ) : (
              fallbackContent
            )}
            <FooterShell
              website={website}
              activeContentLanguage={activeContentLanguage}
              builderInteractionIdentity={builderIframeSelection}
              shellSettingsOverride={shellSettings}
              documentRuntimeOwnedExternally
            />
          </div>
        </div>
      </BuilderDocumentRuntime>
      {website.status !== "active" && (
        <div className="webpages-draft-branding"><Sparkles size={14} /> Created with <strong>WebPages</strong></div>
      )}
    </div>
  );
}
