import { getWooCommerceConnection, wooCommerceFetch } from "@/lib/woocommerce";
import type { SaaSWebsite } from "@/lib/websites";

export type TemplateAssignmentTermOption = {
  id: string;
  label: string;
  slug: string;
  parentId?: string;
  depth: number;
};

type WooTerm = {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  parent?: unknown;
};

const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
const id = (value: unknown) => {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? String(numeric) : "";
};

export function flattenProductCategories(terms: WooTerm[]): TemplateAssignmentTermOption[] {
  const normalized = terms.flatMap((term) => {
    const termId = id(term.id);
    const label = text(term.name);
    const slug = text(term.slug);
    if (!termId || !label) return [];
    const parentId = id(term.parent);
    return [{ id: termId, label, slug, ...(parentId ? { parentId } : {}) }];
  });
  const byParent = new Map<string, typeof normalized>();
  normalized.forEach((term) => {
    const key = term.parentId ?? "root";
    byParent.set(key, [...(byParent.get(key) ?? []), term]);
  });
  byParent.forEach((children) => children.sort((left, right) => left.label.localeCompare(right.label)));
  const seen = new Set<string>();
  const visit = (term: (typeof normalized)[number], depth: number): TemplateAssignmentTermOption[] => {
    if (seen.has(term.id)) return [];
    seen.add(term.id);
    return [
      { ...term, depth },
      ...(byParent.get(term.id) ?? []).flatMap((child) => visit(child, depth + 1)),
    ];
  };
  const roots = normalized.filter((term) => !term.parentId || !normalized.some((candidate) => candidate.id === term.parentId));
  const result = roots.flatMap((term) => visit(term, 0));
  normalized.forEach((term) => { if (!seen.has(term.id)) result.push(...visit(term, 0)); });
  return result;
}

/** Provider-backed labels for Template assignment controls. IDs remain canonical in persistence. */
export async function getTemplateAssignmentOptions(website?: SaaSWebsite | null) {
  const connection = getWooCommerceConnection(website);
  const [categories, tags] = await Promise.all([
    wooCommerceFetch<WooTerm[]>(connection, "products/categories?per_page=100&hide_empty=false"),
    wooCommerceFetch<WooTerm[]>(connection, "products/tags?per_page=100&hide_empty=false&orderby=name&order=asc"),
  ]);
  return {
    product_cat: flattenProductCategories(categories),
    product_tag: tags.flatMap((term) => {
      const termId = id(term.id);
      const label = text(term.name);
      if (!termId || !label) return [];
      return [{ id: termId, label, slug: text(term.slug), depth: 0 } satisfies TemplateAssignmentTermOption];
    }),
  };
}
