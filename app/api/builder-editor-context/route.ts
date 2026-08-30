import { NextRequest, NextResponse } from "next/server";
import { getAuthorizedWebsiteBuilderScope } from "@/lib/websiteBuilderAccess";
import {
  BuilderEditorContextMismatchError,
  getEditableLayoutTargetForCurrentRequest,
  resolveBuilderEditorSession,
} from "@/lib/builderEditorContext.server";
import { createContentDiscoveryService } from "@/lib/contentDiscovery.server";
import { getBuilderPageBySystemRole, readBuilderCustomPages } from "@/lib/builderLayouts";
import { getBuilderShellSettings } from "@/lib/builderShell";
import { getNavigationRouteAliases, resolveCommerceRouteCandidate, resolveNavigationRouteAlias } from "@/lib/navigationTargets";
import { getCanonicalProductCategoryBySlug } from "@/lib/productCategoryContext.server";
import { getCanonicalProductSingularBySlug } from "@/lib/productSingularContext.server";
import { getWebsiteRouteSegment } from "@/lib/websites";
import { IndividualBuilderContextMismatchError } from "@/lib/individualBuilderContext.server";
import {
  TemplateBuilderContextMismatchError,
  TemplatePreviewIdentityNotFoundError,
} from "@/lib/templateBuilderContext.server";
import {
  InvalidRoutingTemplateRequestError,
  RoutingTemplateNotFoundError,
} from "@/lib/routingTemplatesService.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (
    error instanceof BuilderEditorContextMismatchError ||
    error instanceof IndividualBuilderContextMismatchError ||
    error instanceof TemplateBuilderContextMismatchError ||
    error instanceof InvalidRoutingTemplateRequestError
  ) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (error instanceof RoutingTemplateNotFoundError || error instanceof TemplatePreviewIdentityNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  throw error;
}

/** Strict URL transport validation boundary for canonical Builder hydration. */
export async function GET(request: NextRequest) {
  const access = await getAuthorizedWebsiteBuilderScope(request);
  if ("error" in access) return access.error;
  try {
    const href = request.nextUrl.searchParams.get("href");
    if (href) {
      const path = new URL(href, request.nextUrl.origin).pathname.replace(/\/+$/, "") || "/";
      const website = "website" in access ? access.website : null;
      const routeSegment = website ? getWebsiteRouteSegment(website) : null;
      const relativePath = routeSegment && (path === `/${routeSegment}` || path.startsWith(`/${routeSegment}/`))
        ? path.slice(routeSegment.length + 1) || "/"
        : path;
      if (website) {
        const [pages, shell] = await Promise.all([
          readBuilderCustomPages(access.scope),
          getBuilderShellSettings(access.scope),
        ]);
        const aliases = getNavigationRouteAliases(shell);
        const alias = resolveNavigationRouteAlias(relativePath, aliases) ?? resolveCommerceRouteCandidate(relativePath);
        const assignedShop = getBuilderPageBySystemRole(pages, "shop");
        if ((alias?.pageKey === "shop" || relativePath === "/shop") && assignedShop) {
          const target = await getEditableLayoutTargetForCurrentRequest({
            request: { kind: "page", pageId: assignedShop.key },
            scope: access.scope,
          });
          return NextResponse.json({ target });
        }
        if (alias?.pageKey === "product-category") {
          const category = await getCanonicalProductCategoryBySlug(alias.target.slug, website);
          if (!category) return NextResponse.json({ target: null }, { status: 404 });
          const target = await getEditableLayoutTargetForCurrentRequest({
            request: {
              kind: "dynamic",
              context: {
                view: "archive",
                provider: "woocommerce",
                contentType: "product-category",
                contentId: String(category.category.id),
                databaseId: category.category.id,
                slug: category.category.slug,
                uri: relativePath,
                taxonomyTerms: [{ taxonomy: "product_cat", id: String(category.category.id), slug: category.category.slug }],
              },
              storefrontHref: path,
              label: category.category.name,
            },
            scope: access.scope,
          });
          return NextResponse.json({ target });
        }
        if (alias?.pageKey === "product-single") {
          const canonical = await getCanonicalProductSingularBySlug(alias.target.slug, website);
          if (!canonical) return NextResponse.json({ target: null }, { status: 404 });
          const target = await getEditableLayoutTargetForCurrentRequest({
            request: {
              kind: "dynamic",
              context: {
                view: "singular",
                provider: "woocommerce",
                contentType: "product",
                contentId: canonical.product.id,
                ...(canonical.product.databaseId != null ? { databaseId: canonical.product.databaseId } : {}),
                slug: canonical.product.slug,
                uri: relativePath,
                taxonomyTerms: canonical.taxonomyTerms,
              },
              storefrontHref: path,
              label: canonical.product.name,
            },
            scope: access.scope,
          });
          return NextResponse.json({ target });
        }
        const ordinary = pages.find((page) => page.slug === relativePath.replace(/^\/+/, ""));
        if (ordinary) {
          const target = await getEditableLayoutTargetForCurrentRequest({
            request: { kind: "page", pageId: ordinary.key },
            scope: access.scope,
          });
          return NextResponse.json({ target });
        }
      }
      const slug = relativePath.replace(/^\/+/, "");
      if (!slug || slug.includes("/")) return NextResponse.json({ target: null }, { status: 404 });
      const discovery = createContentDiscoveryService("website" in access ? access.website : null);
      const items = await discovery.discover({ family: "post", limit: 100 });
      const item = items.find((candidate) => candidate.storefrontHref === path);
      if (!item) return NextResponse.json({ target: null }, { status: 404 });
      const target = await getEditableLayoutTargetForCurrentRequest({
        request: {
          kind: "singular",
          context: {
            view: "singular",
            provider: item.identity.provider,
            contentType: item.identity.contentType,
            contentId: item.identity.contentId,
            slug: item.slug,
            uri: path,
            taxonomyTerms: [],
          },
        },
        scope: access.scope,
      });
      return target ? NextResponse.json({ target }) : NextResponse.json({ target: null }, { status: 404 });
    }
    const previewProvider = request.nextUrl.searchParams.get("previewProvider");
    const previewContentType = request.nextUrl.searchParams.get("previewContentType");
    const previewContentId = request.nextUrl.searchParams.get("previewContentId");
    const session = await resolveBuilderEditorSession({
      documentId: request.nextUrl.searchParams.get("document"),
      routingTemplateId: request.nextUrl.searchParams.get("routingTemplate"),
      individual: request.nextUrl.searchParams.get("individual"),
      page: request.nextUrl.searchParams.get("page"),
      ...(previewProvider && previewContentType && previewContentId
        ? { previewIdentity: { provider: previewProvider, contentType: previewContentType, contentId: previewContentId } }
        : {}),
      scope: access.scope,
      website: "website" in access ? access.website : undefined,
    });
    return session.resolution
      ? NextResponse.json({ ...session.resolution, editorContext: session.editorContext })
      : NextResponse.json({ editorContext: session.editorContext });
  } catch (error) {
    return errorResponse(error);
  }
}
