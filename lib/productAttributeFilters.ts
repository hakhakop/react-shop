import { safeDecodeURI } from "@/lib/safeDecodeURI";

export type ProductAttributeOption = {
  key: string;
  label: string;
};

export type ProductAttributeFacet = {
  key: string;
  label: string;
  options: ProductAttributeOption[];
};

export type SelectedProductAttributes = Record<string, string[]>;

export function normalizeProductAttribute(
  attribute: unknown,
): { attrKey: string; label: string; values: string[] } | null {
  if (!attribute || typeof attribute !== "object") return null;

  const raw = attribute as { name?: unknown; label?: unknown; options?: unknown };
  const rawName = safeDecodeURI(String(raw.name ?? raw.label ?? "").trim());
  const label = safeDecodeURI(String(raw.label ?? rawName)).trim();
  if (!rawName || !label) return null;

  const values = Array.isArray(raw.options)
    ? raw.options
        .filter(Boolean)
        .map((option) => safeDecodeURI(String(option).trim()))
        .filter(Boolean)
    : [];
  if (values.length === 0) return null;

  return {
    // WooCommerce may expose the same global attribute as both `pa_color`
    // and `Color` depending on the source query. The visible label is the
    // canonical facet identity, not the transport-specific attribute name.
    attrKey: label.toLocaleLowerCase(),
    label,
    values,
  };
}

type ProductWithAttributes = {
  attributes?: { nodes?: readonly unknown[] | null } | null;
};

export function getProductAttributeFacets(products: readonly ProductWithAttributes[]): ProductAttributeFacet[] {
  const facets = new Map<string, { label: string; values: Map<string, string> }>();

  for (const product of products) {
    for (const rawAttribute of product.attributes?.nodes ?? []) {
      const attribute = normalizeProductAttribute(rawAttribute);
      if (!attribute) continue;

      const facet = facets.get(attribute.attrKey) ?? {
        label: attribute.label,
        values: new Map<string, string>(),
      };
      attribute.values.forEach((value) => {
        const key = value.toLocaleLowerCase();
        if (!facet.values.has(key)) facet.values.set(key, value);
      });
      facets.set(attribute.attrKey, facet);
    }
  }

  return Array.from(facets.entries())
    .map(([key, facet]) => ({
      key,
      label: facet.label,
      options: Array.from(facet.values.entries())
        .sort(([, a], [, b]) => a.localeCompare(b))
        .map(([key, label]) => ({ key, label })),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function productMatchesAttributeSelection(
  product: ProductWithAttributes,
  selectedAttributes: SelectedProductAttributes,
): boolean {
  for (const [attributeKey, selectedOptions] of Object.entries(selectedAttributes)) {
    if (selectedOptions.length === 0) continue;

    const productValues = new Set<string>();
    for (const rawAttribute of product.attributes?.nodes ?? []) {
      const attribute = normalizeProductAttribute(rawAttribute);
      if (attribute?.attrKey === attributeKey) {
        attribute.values.forEach((value) => productValues.add(value.toLowerCase()));
      }
    }

    if (!selectedOptions.some((option) => productValues.has(option))) return false;
  }

  return true;
}
