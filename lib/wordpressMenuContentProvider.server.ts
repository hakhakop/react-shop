import { cache } from "react";
import { getCmsConnection, getWordPressAuthHeaders } from "@/lib/cmsConnection";
import { getWebsiteGraphQLEndpoint, graphqlFetch } from "@/lib/graphql";
import { makeNavigationUrlPortable } from "@/lib/navigationPackage";
import type { DynamicContentProviderInput } from "@/lib/dynamicContentProviders.server";
import type { DynamicItemContext } from "@/lib/dynamicContent";
import type { SaaSWebsite } from "@/lib/websites";

type MenuNode = { databaseId: number; parentDatabaseId?: number; label: string; url?: string; path?: string; target?: string; cssClasses?: string[] };
type Menu = { databaseId: number; menuItems?: { nodes?: MenuNode[] } };
const loadMenus = cache(async (website?: SaaSWebsite | null) => {
  const cms = getCmsConnection(website);
  return graphqlFetch<{ menus?: { nodes?: Menu[] } }>(`query WebPagesDynamicMenus {
    menus(first: 100) { nodes { databaseId menuItems(first: 500) { nodes { databaseId parentDatabaseId label url path target cssClasses } } } }
  }`, undefined, { endpoint: getWebsiteGraphQLEndpoint(website), headers: getWordPressAuthHeaders(cms) ?? undefined });
});

export function projectWordPressMenuContexts(menus: Menu[], input: DynamicContentProviderInput): DynamicItemContext[] {
  const source = input.descriptor.query?.sourceQuery as { arguments?: Record<string, unknown> } | undefined;
  const args = source?.arguments ?? input.descriptor.query ?? {};
  const single = input.descriptor.mode === "single";
  const menuId = String(input.descriptor.query?.menuId ?? (single ? args.menu : args.id));
  const menu = menus.find(candidate => String(candidate.databaseId) === menuId);
  if (!menu) throw new Error(`WordPress menu ${menuId} was not found.`);
  const nodes = (menu.menuItems?.nodes ?? []).filter(node => single ? String(node.databaseId) === String(input.descriptor.query?.itemId ?? args.id) : String(node.parentDatabaseId ?? 0) === String(input.descriptor.query?.parentId || args.parent || 0));
  return nodes.flatMap(node => {
    const type = node.cssClasses?.includes("uk-nav-divider") ? "divider" : node.cssClasses?.includes("uk-nav-header") || !node.url ? "header" : "link";
    if (!single && args.include_heading === false && type === "header") return [];
    return [{ id: node.databaseId, fields: {
      title: { type: "string", value: node.label },
      url: { type: "url", value: makeNavigationUrlPortable(node.path || node.url || "#", getCmsConnection(input.website).siteUrl) },
      type: { type: "string", value: type },
      // Active state is resolved against the current page by the shared Nav renderer.
      active: { type: "string", value: "" },
      target: { type: "string", value: node.target || "_self" },
    } } satisfies DynamicItemContext];
  });
}

export async function resolveWordPressMenuContexts(input: DynamicContentProviderInput) {
  const result = await loadMenus(input.website);
  return projectWordPressMenuContexts(result.menus?.nodes ?? [], input);
}
