import {
  getCmsConnection,
  getWordPressAuthHeaders,
  hasUsableMediaAuth,
  hasUsableWooCommerce,
  type CmsConnection,
} from "@/lib/cmsConnection";
import { getWebsiteGraphQLEndpoint, graphqlFetch } from "@/lib/graphql";
import { wooCommerceFetch } from "@/lib/woocommerce";
import {
  createPortableNavigationPackage,
  makeNavigationUrlPortable,
  summarizeNavigationPreview,
  type NavigationResolution,
  type PortableNavigationPackage,
  type PortableNavigationTarget,
} from "@/lib/navigationPackage";
import type { ReactMenuItem } from "@/lib/builderShell";
import type { SaaSWebsite } from "@/lib/websites";
import type { SystemNavigationPageKey } from "@/lib/navigationTargets";
import {
  mutateBuilderLayoutStore,
  readBuilderCustomPages,
  writeBuilderCustomPages,
  type BuilderCustomPage,
  type BuilderCustomPageKey,
  type BuilderDataScope,
} from "@/lib/builderLayouts";

type WordPressMenuNode = {
  databaseId?: number;
  name?: string;
  slug?: string;
  locations?: string[];
  menuItems?: { nodes?: WordPressMenuItemNode[] };
};

type WordPressMenuItemNode = {
  databaseId?: number;
  parentDatabaseId?: number | null;
  label?: string;
  url?: string;
  path?: string;
  target?: string;
  connectedNode?: {
    node?: {
      __typename?: string;
      databaseId?: number;
      uri?: string;
      slug?: string;
    } | null;
  } | null;
};

type MenuQueryResponse = { menus?: { nodes?: WordPressMenuNode[] } };

type WooNavigationEntity = {
  id?: unknown;
  slug?: unknown;
};

const MENU_QUERY = `
  query WebPagesNavigationMenus {
    menus(first: 100) {
      nodes {
        databaseId name slug locations
        menuItems(first: 500) {
          nodes {
            databaseId parentDatabaseId label url path target
            connectedNode {
              node {
                __typename
                ... on DatabaseIdentifier { databaseId }
                ... on UniformResourceIdentifiable { uri }
              }
            }
          }
        }
      }
    }
  }
`;

export type AssignedWordPressPageSettings = {
  systemRouteByPageId: Map<number, SystemNavigationPageKey>;
  postsPageId?: number;
  diagnostics: string[];
};

const positiveId = (value: unknown) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
};

/** Authenticated server-only discovery of WordPress/WooCommerce assigned pages. */
export async function retrieveAssignedWordPressPageSettings(
  website?: SaaSWebsite | null,
): Promise<AssignedWordPressPageSettings> {
  const cms = getCmsConnection(website);
  const systemRouteByPageId = new Map<number, SystemNavigationPageKey>();
  const diagnostics: string[] = [];

  if (hasUsableWooCommerce(cms)) {
    const assignments = [
      ["settings/products/woocommerce_shop_page_id", "shop"],
      ["settings/advanced/woocommerce_cart_page_id", "cart"],
      ["settings/advanced/woocommerce_checkout_page_id", "checkout"],
      ["settings/advanced/woocommerce_myaccount_page_id", "my-account"],
    ] as const;
    const results = await Promise.allSettled(assignments.map(async ([path, pageKey]) => {
      const setting = await wooCommerceFetch<{ value?: unknown }>({
        wordpressBaseUrl: cms.siteUrl || null,
        wordpressAdminUrl: cms.adminUrl || null,
        wooCommerceAdminUrl: cms.adminUrl || null,
        apiUrl: cms.wooCommerceApiUrl || null,
        consumerKey: cms.wooCommerceConsumerKey || null,
        consumerSecret: cms.wooCommerceConsumerSecret || null,
        source: website?.cmsConnection ? "website" : "env",
      }, path);
      const pageId = positiveId(setting.value);
      if (pageId) systemRouteByPageId.set(pageId, pageKey);
    }));
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        diagnostics.push(`WooCommerce could not expose ${assignments[index]![1]} assigned-page settings.`);
      }
    });
  } else {
    diagnostics.push("WooCommerce assigned-page settings are unavailable because REST credentials are not configured.");
  }

  let postsPageId: number | undefined;
  if (cms.siteUrl && hasUsableMediaAuth(cms)) {
    try {
      const response = await fetch(`${cms.siteUrl}/wp-json/wp/v2/settings`, {
        headers: getWordPressAuthHeaders(cms) ?? undefined,
      });
      if (!response.ok) throw new Error(`WordPress settings returned ${response.status}.`);
      const settings = await response.json() as {
        page_on_front?: unknown;
        page_for_posts?: unknown;
      };
      const frontPageId = positiveId(settings.page_on_front);
      postsPageId = positiveId(settings.page_for_posts);
      if (frontPageId && !systemRouteByPageId.has(frontPageId)) {
        systemRouteByPageId.set(frontPageId, "home");
      }
    } catch {
      diagnostics.push("WordPress could not expose Front Page and Posts Page assignments.");
    }
  } else {
    diagnostics.push("WordPress Front Page and Posts Page settings are unavailable because application-password authentication is not configured.");
  }

  return { systemRouteByPageId, ...(postsPageId ? { postsPageId } : {}), diagnostics };
}

type WooNavigationTargetResolver = (
  uri: string,
  connectedType?: string,
) => Promise<PortableNavigationTarget | null>;

function wooRouteCandidate(uri: string, connectedType?: string) {
  const path = uri.split(/[?#]/)[0] ?? "";
  const categoryMatch = path.match(/^\/product-category\/(?:.+\/)?([^/]+)\/?$/i);
  const productMatch = path.match(/^\/product\/([^/]+)\/?$/i);
  if (connectedType === "productcategory" || categoryMatch) {
    return { type: "category" as const, slug: decodeURIComponent(categoryMatch?.[1] ?? path.split("/").filter(Boolean).at(-1) ?? "") };
  }
  if (connectedType === "product" || productMatch) {
    return { type: "product" as const, slug: decodeURIComponent(productMatch?.[1] ?? path.split("/").filter(Boolean).at(-1) ?? "") };
  }
  return null;
}

function createWooNavigationTargetResolver(
  cms: CmsConnection,
  website?: SaaSWebsite | null,
): WooNavigationTargetResolver {
  const cache = new Map<string, Promise<PortableNavigationTarget | null>>();
  return async (uri, connectedType) => {
    const candidate = wooRouteCandidate(uri, connectedType);
    if (!candidate || !hasUsableWooCommerce(cms) || !candidate.slug) return null;
    const key = `${candidate.type}:${candidate.slug}`;
    const existing = cache.get(key);
    if (existing) return existing;
    const request: Promise<PortableNavigationTarget | null> = (async () => {
      const path = candidate.type === "category"
        ? `products/categories?slug=${encodeURIComponent(candidate.slug)}`
        : `products?slug=${encodeURIComponent(candidate.slug)}&per_page=1`;
      const entities = await wooCommerceFetch<WooNavigationEntity[]>({
        wordpressBaseUrl: cms.siteUrl || null,
        wordpressAdminUrl: cms.adminUrl || null,
        wooCommerceAdminUrl: cms.adminUrl || null,
        apiUrl: cms.wooCommerceApiUrl || null,
        consumerKey: cms.wooCommerceConsumerKey || null,
        consumerSecret: cms.wooCommerceConsumerSecret || null,
        source: website?.cmsConnection ? "website" : "env",
      }, path);
      const entity = entities.find((entry) => entry.slug === candidate.slug);
      const sourceDatabaseId = positiveId(entity?.id);
      if (!sourceDatabaseId) return null;
      return candidate.type === "category"
        ? { kind: "term", taxonomy: "product_cat", slug: candidate.slug, uri, sourceDatabaseId } satisfies PortableNavigationTarget
        : { kind: "product", postType: "product", slug: candidate.slug, uri, sourceDatabaseId } satisfies PortableNavigationTarget;
    })().catch(() => null);
    cache.set(key, request);
    return request;
  };
}

async function targetFromWordPressItem(
  item: WordPressMenuItemNode,
  sourceOrigin: string,
  assignedPages: AssignedWordPressPageSettings,
  resolveWooTarget: WooNavigationTargetResolver,
): Promise<PortableNavigationTarget> {
  const connected = item.connectedNode?.node;
  const type = connected?.__typename?.toLowerCase();
  const uri = makeNavigationUrlPortable(connected?.uri || item.path || item.url, sourceOrigin);
  const slug = connected?.slug || uri.split(/[?#]/)[0].split("/").filter(Boolean).at(-1);
  const sourceDatabaseId = connected?.databaseId;
  const common = {
    ...(slug ? { slug } : {}),
    ...(sourceDatabaseId ? { sourceDatabaseId } : {}),
    ...(uri ? { uri } : {}),
  };
  const verifiedWooTarget = await resolveWooTarget(uri, type);
  if (verifiedWooTarget) return verifiedWooTarget;
  if (type === "page") {
    const systemRoute = sourceDatabaseId
      ? assignedPages.systemRouteByPageId.get(sourceDatabaseId)
      : undefined;
    if (systemRoute) {
      return {
        kind: "system",
        pageKey: systemRoute,
        ...(sourceDatabaseId ? { sourceDatabaseId } : {}),
        ...(uri ? { uri } : {}),
      };
    }
    return { kind: "page", postType: "page", ...common };
  }
  if (type === "post") return { kind: "post", postType: "post", ...common };
  if (type === "product") return { kind: "product", postType: "product", ...common };
  if (type === "category") return { kind: "term", taxonomy: "category", ...common };
  if (type === "productcategory") return { kind: "term", taxonomy: "product_cat", ...common };
  const rawUrl = item.url?.trim() || item.path?.trim() || "#";
  const portableUrl = makeNavigationUrlPortable(rawUrl, sourceOrigin);
  if (portableUrl.startsWith("#")) return { kind: "anchor", url: portableUrl };
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(portableUrl)) return { kind: "custom", url: portableUrl };
  const archive = /^\/(?:shop|blog|products?|categories)(?:\/|$)/i.test(portableUrl);
  return archive ? { kind: "archive", uri: portableUrl } : { kind: "custom", uri: portableUrl };
}

export async function retrieveWordPressNavigationPackages(
  website?: SaaSWebsite | null,
) {
  const cms = getCmsConnection(website);
  const endpoint = getWebsiteGraphQLEndpoint(website);
  if (!endpoint || !cms.siteUrl) throw new Error("The connected WordPress site and WPGraphQL endpoint are required.");
  const [data, assignedPages] = await Promise.all([
    graphqlFetch<MenuQueryResponse>(MENU_QUERY, undefined, {
      endpoint,
      headers: getWordPressAuthHeaders(cms) ?? undefined,
    }),
    retrieveAssignedWordPressPageSettings(website),
  ]);
  const resolveWooTarget = createWooNavigationTargetResolver(cms, website);
  return Promise.all((data.menus?.nodes ?? []).map(async (menu) => {
    const sourceItems = menu.menuItems?.nodes ?? [];
    const items: ReactMenuItem[] = sourceItems.flatMap((item) => {
      if (!item.databaseId || !item.label) return [];
      return [{
        id: `wp-${item.databaseId}`,
        label: item.label,
        url: makeNavigationUrlPortable(item.path || item.url || "#", cms.siteUrl),
        parentId: item.parentDatabaseId ? `wp-${item.parentDatabaseId}` : null,
        target: item.target === "_blank" ? "_blank" : "_self",
      } satisfies ReactMenuItem];
    });
    const resolvedTargets = await Promise.all(sourceItems.map(async (item) =>
      item.databaseId
        ? [[`wp-${item.databaseId}`, await targetFromWordPressItem(item, cms.siteUrl, assignedPages, resolveWooTarget)] as const]
        : [],
    ));
    const targetsByItemId = Object.fromEntries(resolvedTargets.flat());
    return createPortableNavigationPackage({
      name: menu.name || menu.slug || "WordPress navigation",
      intendedLocation: menu.locations?.[0] ?? null,
      sourceDatabaseId: menu.databaseId,
      sourceOrigin: cms.siteUrl,
      items,
      targetsByItemId,
    });
  }));
}

async function resolveConnectedTarget(
  cms: CmsConnection,
  target: PortableNavigationTarget,
  website?: SaaSWebsite | null,
) {
  if (
    target.slug &&
    hasUsableWooCommerce(cms) &&
    (target.kind === "product" || (target.kind === "term" && target.taxonomy === "product_cat"))
  ) {
    const path = target.kind === "product"
      ? `products?slug=${encodeURIComponent(target.slug)}&per_page=1`
      : `products/categories?slug=${encodeURIComponent(target.slug)}`;
    const entities = await wooCommerceFetch<WooNavigationEntity[]>({
      wordpressBaseUrl: cms.siteUrl || null,
      wordpressAdminUrl: cms.adminUrl || null,
      wooCommerceAdminUrl: cms.adminUrl || null,
      apiUrl: cms.wooCommerceApiUrl || null,
      consumerKey: cms.wooCommerceConsumerKey || null,
      consumerSecret: cms.wooCommerceConsumerSecret || null,
      source: website?.cmsConnection ? "website" : "env",
    }, path);
    return positiveId(entities.find((entry) => entry.slug === target.slug)?.id) ?? null;
  }
  const queryByType: Record<string, { field: string; whereField: string; variableType: string; listValue?: boolean }> = {
    page: { field: "pages", whereField: "name", variableType: "String!" },
    post: { field: "posts", whereField: "name", variableType: "String!" },
    product: { field: "products", whereField: "slug", variableType: "String!" },
    category: { field: "categories", whereField: "slug", variableType: "[String]", listValue: true },
    product_cat: { field: "productCategories", whereField: "slug", variableType: "[String]", listValue: true },
  };
  const descriptor = target.kind === "term"
    ? queryByType[target.taxonomy ?? ""]
    : queryByType[target.postType ?? target.kind];
  if (!descriptor || !cms.graphqlUrl || !target.slug) return null;
  const data = await graphqlFetch<{ targets?: { nodes?: Array<{ databaseId?: number }> } | null }>(`
    query WebPagesResolveNavigationTarget($slug: ${descriptor.variableType}) {
      targets: ${descriptor.field}(first: 1, where: { ${descriptor.whereField}: $slug }) {
        nodes { databaseId }
      }
    }
  `, { slug: descriptor.listValue ? [target.slug] : target.slug }, {
    endpoint: cms.graphqlUrl,
    headers: getWordPressAuthHeaders(cms) ?? undefined,
  });
  return data.targets?.nodes?.[0]?.databaseId ?? null;
}

export async function previewWordPressNavigationInstall(
  packageValue: PortableNavigationPackage,
  website?: SaaSWebsite | null,
) {
  const cms = getCmsConnection(website);
  const resolutions: NavigationResolution[] = [];
  for (const item of packageValue.menu.items) {
    const target = item.target;
    if (!["page", "post", "product", "term"].includes(target.kind)) {
      resolutions.push({ key: item.key, status: "portable", target });
      continue;
    }
    try {
      const destinationDatabaseId = await resolveConnectedTarget(cms, target, website);
      resolutions.push(destinationDatabaseId
        ? { key: item.key, status: "resolved", target, destinationDatabaseId }
        : { key: item.key, status: "unresolved", target, message: `Missing ${target.taxonomy ?? target.postType ?? target.kind} “${target.slug}”.` });
    } catch (error) {
      resolutions.push({
        key: item.key,
        status: "unresolved",
        target,
        message: error instanceof Error ? error.message : `Could not resolve ${target.slug}.`,
      });
    }
  }
  return summarizeNavigationPreview(packageValue, resolutions);
}

export const WORDPRESS_MENU_WRITE_LIMITATION =
  "No authenticated classic-menu mutation or companion-plugin endpoint is implemented. WebPages requires an endpoint that can create a menu, create ordered parent/child menu items bound to destination object IDs, and return the new menu-item IDs.";

function pageSlugFromUri(uri: string | undefined) {
  return uri?.split(/[?#]/)[0].split("/").filter(Boolean).at(-1)
    ?.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "") || "shop";
}

/** Explicit-confirmation boundary for assigned WordPress Pages; never writes WordPress. */
export async function materializeAssignedWordPressPages(
  packageValue: PortableNavigationPackage,
  scope: BuilderDataScope,
) {
  const assignedItems = packageValue.menu.items.filter((item) =>
    item.target.kind === "system" && item.target.pageKey === "shop",
  );
  if (!assignedItems.length) return readBuilderCustomPages(scope);
  const pages = await readBuilderCustomPages(scope);
  const existingAssigned = pages.find((page) => page.systemRole === "shop");
  if (existingAssigned) return pages;
  const source = assignedItems[0]!;
  const baseSlug = pageSlugFromUri(source.target.uri);
  const usedSlugs = new Set(pages.map((page) => page.slug));
  let slug = baseSlug;
  let suffix = 2;
  while (usedSlugs.has(slug)) slug = `${baseSlug}-${suffix++}`;
  const sourceDatabaseId = source.target.sourceDatabaseId;
  const page: BuilderCustomPage = {
    id: sourceDatabaseId ? `wordpress-page:${sourceDatabaseId}` : `wordpress-page:${source.key}`,
    key: `page:${slug}` as BuilderCustomPageKey,
    title: source.label,
    slug,
    systemRole: "shop",
    ...(sourceDatabaseId ? { sourceDatabaseId } : {}),
    updatedAt: new Date().toISOString(),
  };
  await writeBuilderCustomPages([...pages, page], scope);
  // Controlled compatibility migration only: move an already-authored legacy
  // Shop document; never manufacture or overwrite its section design.
  await mutateBuilderLayoutStore((layouts) => {
    if (!layouts[page.key] && layouts.shop) {
      layouts[page.key] = {
        ...structuredClone(layouts.shop),
        key: page.key,
        page: page.key,
        targetType: "page",
        displayName: page.title,
        updatedAt: new Date().toISOString(),
      };
      delete layouts.shop;
    }
  }, scope);
  return [...pages, page];
}
