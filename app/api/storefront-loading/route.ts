import { NextRequest, NextResponse } from "next/server";
import {
  getBuilderPageBySystemRole,
  getPublishedBuilderLayout,
  readBuilderCustomPages,
  type BuilderLayout,
  type BuilderLayoutBlock,
  type BuilderSection,
} from "@/lib/builderLayouts";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getBuilderPageKeyForTenantPath } from "@/lib/scopedPreviewLinks";
import {
  getNavigationRouteAliases,
  resolveCommerceRouteCandidate,
  resolveNavigationRouteAlias,
} from "@/lib/navigationTargets";
import {
  ensureWebsiteBuilderData,
} from "@/lib/websiteBuilderData";
import {
  getWebsiteByDomainHost,
  getWebsiteByIdOrSlug,
  getWebsiteRouteSegment,
} from "@/lib/websites";
import type {
  StorefrontLoadingChromeShape,
  StorefrontLoadingSectionShape,
} from "@/lib/storefrontLoading";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSectionBlocks(section: BuilderSection): BuilderLayoutBlock[] {
  if (section.rows?.length) {
    return section.rows.flatMap((row) =>
      row.columns.flatMap((column) => column.elements ?? []),
    );
  }
  return (section.layoutItems ?? []).flatMap((item) => item.blocks ?? []);
}

function getBlockItemCount(block: BuilderLayoutBlock) {
  const candidate = block as BuilderLayoutBlock & {
    items?: unknown[];
    slides?: unknown[];
    galleryItems?: unknown[];
  };
  return Math.max(
    candidate.items?.length ?? 0,
    candidate.slides?.length ?? 0,
    candidate.galleryItems?.length ?? 0,
    1,
  );
}

function summarizeSection(section: BuilderSection): StorefrontLoadingSectionShape {
  const blocks = getSectionBlocks(section);
  const blockShapes = blocks.map((block) => ({
    kind: block.kind ?? "text",
    itemCount: getBlockItemCount(block),
  }));
  const itemCount = Math.max(
    section.layoutItems?.length ?? 0,
    section.rows?.reduce(
      (count, row) => Math.max(count, row.columns.length),
      0,
    ) ?? 0,
    1,
  );

  return {
    kind: section.kind,
    sectionHeight: section.sectionHeight ?? null,
    heroHeight: section.heroHeight ?? null,
    layout: section.layout ?? null,
    columns: Math.max(1, section.layoutColumns ?? section.columns ?? itemCount),
    itemCount,
    blockKinds: Array.from(new Set(blockShapes.map((block) => block.kind))),
    blocks: blockShapes,
  };
}

function summarizeLayout(layout: BuilderLayout | null) {
  return (layout?.sections ?? [])
    .filter((section) => section.visible !== false)
    .map(summarizeSection);
}

function normalizePath(pathname: string) {
  const path = pathname.trim().split(/[?#]/)[0] || "/";
  return path.startsWith("/") ? path : `/${path}`;
}

async function resolvePublicLayout(pathname: string, request: NextRequest) {
  const normalizedPath = normalizePath(pathname);
  const pathSegments = normalizedPath.split("/").filter(Boolean);
  const domainWebsite = await getWebsiteByDomainHost(request.headers.get("host"));
  const pathWebsite = pathSegments[0]
    ? await getWebsiteByIdOrSlug(pathSegments[0])
    : null;
  const website = domainWebsite ?? pathWebsite;
  const scope = website ? { websiteId: website.id } : {};

  if (website) await ensureWebsiteBuilderData(website.id);

  const shellSettings = await getBuilderShellSettings(scope);
  const customPages = await readBuilderCustomPages(scope);
  const routePath = website
    ? (() => {
        const segment = `/${getWebsiteRouteSegment(website)}`;
        return normalizedPath === segment || normalizedPath.startsWith(`${segment}/`)
          ? normalizedPath.slice(segment.length) || "/"
          : normalizedPath;
      })()
    : normalizedPath;
  const aliases = getNavigationRouteAliases(shellSettings);
  const routeAlias =
    resolveNavigationRouteAlias(routePath, aliases) ??
    resolveCommerceRouteCandidate(routePath);
  const resolvedPage = routeAlias
    ? routeAlias.pageKey
    : getBuilderPageKeyForTenantPath(
        normalizedPath,
        customPages,
        website ? getWebsiteRouteSegment(website) : undefined,
        aliases,
      ) ?? "home";
  const assignedShopPage = getBuilderPageBySystemRole(customPages, "shop");
  const page = resolvedPage === "shop" && assignedShopPage
    ? assignedShopPage.key
    : resolvedPage;
  const layout = await getPublishedBuilderLayout(page, scope);
  const headerLayout = await getPublishedBuilderLayout("header", scope);
  const footerLayout = await getPublishedBuilderLayout("footer", scope);
  const menuItemCount = shellSettings.menuItems?.filter((item) => item.visibility !== "mobile").length ?? 0;
  const headerBlockCount = summarizeLayout(headerLayout)
    .flatMap((section) => section.blocks)
    .filter((block) => block.kind === "menu")
    .reduce((count, block) => Math.max(count, block.itemCount), 0);

  return {
    sections: summarizeLayout(layout),
    chrome: {
      headerVisible: shellSettings.headerVisible !== false,
      headerHeight: shellSettings.headerHeight ?? null,
      navItemCount: Math.max(1, headerBlockCount, menuItemCount),
      footerColumnCount: Math.max(
        1,
        summarizeLayout(footerLayout).reduce(
          (count, section) => Math.max(count, section.columns),
          1,
        ),
      ),
    } satisfies StorefrontLoadingChromeShape,
  };
}

export async function GET(request: NextRequest) {
  const pathname = request.nextUrl.searchParams.get("pathname");
  if (!pathname || pathname.length > 2048) {
    return NextResponse.json({ error: "A storefront pathname is required." }, { status: 400 });
  }

  try {
    return NextResponse.json(await resolvePublicLayout(pathname, request));
  } catch (error) {
    console.error("[storefront-loading] failed to resolve layout shape", error);
    return NextResponse.json({
      sections: [],
      chrome: {
        headerVisible: true,
        headerHeight: null,
        navItemCount: 1,
        footerColumnCount: 1,
      } satisfies StorefrontLoadingChromeShape,
    });
  }
}
