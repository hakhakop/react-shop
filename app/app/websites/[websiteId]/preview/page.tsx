import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AccessDenied from "@/components/saas/AccessDenied";
import HeaderShell from "@/components/HeaderShell";
import ScopedPreviewLinkRouter from "@/components/builder/ScopedPreviewLinkRouter";
import StorefrontBuilderRenderer from "@/components/builder/StorefrontBuilderRenderer";
import { getCurrentUser } from "@/lib/auth";
import {
  getPublishedBuilderLayout,
  isBuilderCustomPageKey,
  normalizeBuilderLayoutKey,
  readBuilderCustomPages,
  type BuilderLayoutKey,
} from "@/lib/builderLayouts";
import {
  ensureWebsiteBuilderData,
  getBuilderLayoutStorePath,
  getBuilderPagesPath,
  getBuilderShellPath,
} from "@/lib/websiteBuilderData";
import {
  getBuilderShellSettings,
  type BuilderShellSettings,
} from "@/lib/builderShell";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import { loginRedirectFor } from "@/lib/saasRoutes";
import { canAccessWebsiteBuilder, getWebsiteById } from "@/lib/websites";

export const dynamic = "force-dynamic";

type WebsitePreviewPageProps = {
  params: Promise<{
    websiteId: string;
  }>;
  searchParams?: Promise<{
    page?: string;
  }>;
};

function previewPathWithSearch(websiteId: string, page?: string) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  const query = params.toString();
  const path = `/app/websites/${websiteId}/preview`;
  return query ? `${path}?${query}` : path;
}

function spacing(value: string | undefined, context: BuilderSpacingContext) {
  return resolveBuilderSpacing(value, context).css;
}

function scopedShellCss(shellSettings: BuilderShellSettings) {
  return `
:root {
  --builder-global-section-padding-top: ${spacing(shellSettings.sectionPaddingTop, "sectionPadding")};
  --builder-global-section-padding-bottom: ${spacing(shellSettings.sectionPaddingBottom, "sectionPadding")};
  --builder-global-section-margin-top: ${spacing(shellSettings.sectionMarginTop, "sectionMargin")};
  --builder-global-section-margin-bottom: ${spacing(shellSettings.sectionMarginBottom, "sectionMargin")};
  --builder-global-row-padding-top: ${spacing(shellSettings.rowPaddingTop, "rowPadding")};
  --builder-global-row-padding-bottom: ${spacing(shellSettings.rowPaddingBottom, "rowPadding")};
  --builder-global-row-margin-top: ${spacing(shellSettings.rowMarginTop, "rowMargin")};
  --builder-global-row-margin-bottom: ${spacing(shellSettings.rowMarginBottom, "rowMargin")};
  --builder-global-row-gap: ${spacing(shellSettings.rowGap, "rowGap")};
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

function resolvePreviewPageKey(
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

export default async function WebsitePreviewPage({
  params,
  searchParams,
}: WebsitePreviewPageProps) {
  const [{ websiteId }, user, query] = await Promise.all([
    params,
    getCurrentUser(await cookies()),
    searchParams,
  ]);
  const requestedPage = query?.page ?? "home";
  const requestedPath = previewPathWithSearch(websiteId, requestedPage);

  if (!user) {
    redirect(loginRedirectFor(requestedPath));
  }

  const website = await getWebsiteById(websiteId);
  if (!website || !canAccessWebsiteBuilder(user, website)) {
    return <AccessDenied />;
  }

  await ensureWebsiteBuilderData(website.id);

  const scope = { websiteId: website.id };
  const customPages = await readBuilderCustomPages(scope);
  const scopedPreviewPages = customPages.map((item) => ({
    key: item.key,
    slug: item.slug,
  }));
  const page = resolvePreviewPageKey(requestedPage, customPages);
  console.log("[builder-preview-scope] resolved files", {
    websiteId: website.id,
    page,
    layoutPath: getBuilderLayoutStorePath(website.id),
    pagesPath: getBuilderPagesPath(website.id),
    shellPath: getBuilderShellPath(website.id),
  });

  const [layout, shellSettings] = await Promise.all([
    getPublishedBuilderLayout(page, scope),
    getBuilderShellSettings(scope),
  ]);

  console.log("[builder-preview-scope] loaded scoped preview", {
    websiteId: website.id,
    page,
    hasLayout: Boolean(layout?.sections?.length),
  });

  if (!layout?.sections?.some((section) => section.visible)) {
    return (
      <main className="page">
        <h1 className="page-title">Preview unavailable</h1>
        <p className="page-subtitle">
          This website does not have a published layout for this page yet.
        </p>
      </main>
    );
  }

  return (
    <div data-scoped-preview-root>
      <ScopedPreviewLinkRouter
        websiteId={website.id}
        pages={scopedPreviewPages}
      />
      <style
        data-builder-preview-shell
        dangerouslySetInnerHTML={{ __html: scopedShellCss(shellSettings) }}
      />
      <HeaderShell
        layoutOverride={shellSettings.headerLayout}
        shellSettingsOverride={shellSettings}
        scopedPreviewWebsiteId={website.id}
        scopedPreviewPage={page}
        scopedPreviewPages={scopedPreviewPages}
      />
      <StorefrontBuilderRenderer
        layout={layout}
        page={page}
        pageLabel={pageLabel(page, customPages)}
      />
    </div>
  );
}
