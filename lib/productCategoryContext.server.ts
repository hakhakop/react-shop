import type { CategoryTreeItem } from "@/lib/categories";
import type { DynamicContentData, DynamicItemContext, DynamicItemContextValue } from "@/lib/dynamicContent";
import type { ProductNode } from "@/lib/products";
import { normalizeWooCommerceProductRecord } from "@/lib/shopProducts.server";
import { getWooCommerceConnection, wooCommerceFetch } from "@/lib/woocommerce";
import { fetchWooCommerceProductRecords } from "@/lib/woocommerceDynamicContentProvider.server";
import type { SaaSWebsite } from "@/lib/websites";

type WooCategoryRecord = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  parent?: unknown;
  count?: unknown;
};

const text = (value: unknown) => typeof value === "string" ? value : undefined;
const positiveId = (value: unknown) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : undefined;
};
const setField = (fields: Record<string, DynamicItemContextValue>, key: string, value: DynamicItemContextValue | undefined) => {
  if (value) fields[key] = value;
};
const metadata = (values: Record<string, DynamicContentData | undefined>) =>
  Object.fromEntries(Object.entries(values).filter((entry): entry is [string, DynamicContentData] => entry[1] !== undefined));

function categoryTree(categories: WooCategoryRecord[]): CategoryTreeItem[] {
  const byId = new Map<number, CategoryTreeItem>();
  categories.forEach((category) => {
    const id = positiveId(category.id);
    const slug = text(category.slug);
    const name = text(category.name);
    if (!id || !slug || !name) return;
    byId.set(id, { id: String(id), dbId: id, name, slug, parentId: positiveId(category.parent) ?? null, children: [] });
  });
  const roots: CategoryTreeItem[] = [];
  byId.forEach((category) => {
    const parent = category.parentId ? byId.get(category.parentId) : null;
    if (parent) parent.children.push(category);
    else roots.push(category);
  });
  return roots;
}

export type CanonicalProductCategory = {
  category: { id: number; name: string; slug: string; description: string; parentId: number | null; ancestry: Array<{ id: number; name: string; slug: string }> };
  products: ProductNode[];
  categoryTree: CategoryTreeItem[];
  dynamicContext: DynamicItemContext;
};

/** Resolve a WooCommerce category and its archive context without creating a WebPages page. */
export async function getCanonicalProductCategoryBySlug(
  slug: string,
  website?: SaaSWebsite | null,
): Promise<CanonicalProductCategory | null> {
  const connection = getWooCommerceConnection(website);
  const [matches, allCategories] = await Promise.all([
    wooCommerceFetch<WooCategoryRecord[]>(connection, `products/categories?slug=${encodeURIComponent(slug)}`),
    wooCommerceFetch<WooCategoryRecord[]>(connection, "products/categories?per_page=100&hide_empty=false"),
  ]);
  const source = matches.find((category) => text(category.slug) === slug);
  const id = positiveId(source?.id);
  const name = text(source?.name);
  if (!source || !id || !name) return null;
  const records = await fetchWooCommerceProductRecords({
    website,
    descriptor: {
      provider: "woocommerce",
      source: "product",
      mode: "collection",
      query: { categories: [id], quantity: 100 },
    },
  });
  const products = records.flatMap((product) => {
    const normalized = normalizeWooCommerceProductRecord(product);
    return normalized ? [normalized] : [];
  });
  const byId = new Map(allCategories.flatMap((category) => {
    const categoryId = positiveId(category.id);
    return categoryId ? [[categoryId, category] as const] : [];
  }));
  const ancestry: Array<{ id: number; name: string; slug: string }> = [];
  let parentId = positiveId(source.parent);
  const visited = new Set<number>();
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId);
    const parent = byId.get(parentId);
    const parentName = text(parent?.name);
    const parentSlug = text(parent?.slug);
    if (!parent || !parentName || !parentSlug) break;
    ancestry.unshift({ id: parentId, name: parentName, slug: parentSlug });
    parentId = positiveId(parent.parent);
  }
  const description = text(source.description) ?? "";
  const fields: Record<string, DynamicItemContextValue> = {};
  setField(fields, "id", { type: "identifier", value: id });
  setField(fields, "databaseId", { type: "identifier", value: id });
  setField(fields, "title", { type: "string", value: name });
  setField(fields, "name", { type: "string", value: name });
  setField(fields, "slug", { type: "string", value: slug });
  setField(fields, "description", { type: "richText", value: description });
  setField(fields, "kind", { type: "string", value: "product-category" });
  setField(fields, "taxonomy", { type: "string", value: "product_cat" });
  setField(fields, "termId", { type: "identifier", value: id });
  setField(fields, "termSlug", { type: "string", value: slug });
  setField(fields, "termPath", { type: "metadata", value: { items: [...ancestry.map((item) => item.slug), slug] } });
  setField(fields, "ancestry", { type: "metadata", value: { items: ancestry.map((item) => metadata(item)) } });
  return {
    category: { id, name, slug, description, parentId: positiveId(source.parent) ?? null, ancestry },
    products,
    categoryTree: categoryTree(allCategories),
    dynamicContext: { id, fields },
  };
}

export async function getCanonicalProductCategoryById(
  id: string | number,
  website?: SaaSWebsite | null,
) {
  const numericId = positiveId(id);
  if (!numericId) return null;
  const connection = getWooCommerceConnection(website);
  const category = await wooCommerceFetch<WooCategoryRecord>(connection, `products/categories/${numericId}`);
  const slug = text(category.slug);
  return slug ? getCanonicalProductCategoryBySlug(slug, website) : null;
}

/** A real provider-backed preview context for opening the global archive template directly. */
export async function getDefaultCanonicalProductCategory(
  website?: SaaSWebsite | null,
) {
  const connection = getWooCommerceConnection(website);
  const categories = await wooCommerceFetch<WooCategoryRecord[]>(
    connection,
    "products/categories?per_page=1&hide_empty=true&orderby=count&order=desc",
  );
  const slug = text(categories[0]?.slug);
  return slug ? getCanonicalProductCategoryBySlug(slug, website) : null;
}
