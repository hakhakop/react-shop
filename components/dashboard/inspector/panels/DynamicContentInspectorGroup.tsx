"use client";

import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
} from "@/lib/dynamicContent";
import {
  dynamicContentCapabilityMatchesDescriptor,
  dynamicContentSourceKey,
  type DynamicContentQueryControl,
  type DynamicContentSourceCapability,
} from "@/lib/dynamicContentCapabilities";
import { useDynamicContentCapabilities } from "@/components/dashboard/inspector/DynamicContentCapabilitiesContext";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";
import { flattenCategoryTree } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import type { CategoryTreeItem } from "@/lib/categories";
import { Fragment, useMemo, useState } from "react";

type DynamicItem = {
  dynamicContext?: DynamicContentContextDescriptor;
};

type Props<Item extends DynamicItem = DynamicItem> = {
  item: Item;
  update: (patch: Partial<Item>) => void;
  fixedSourceKey?: DynamicContentSourceCapability["key"];
  categoryTree?: CategoryTreeItem[];
  /** The nearest authored ancestor source, exposed as YOOtheme's `#parent`. */
  inheritedSource?: DynamicContentContextDescriptor;
};

const PARENT_SOURCE_KEY = "yootheme-parent";
const STATIC_SOURCE_DESCRIPTOR: DynamicContentContextDescriptor = {
  provider: "webpages",
  source: "static",
  mode: "single",
};

export const isParentDynamicContentSource = (
  descriptor: DynamicContentContextDescriptor | null | undefined,
) => descriptor?.provider === "yootheme" && descriptor.source === "#parent";

export const effectiveDynamicContentSource = (
  descriptor: DynamicContentContextDescriptor | null | undefined,
  inheritedSource: DynamicContentContextDescriptor | null | undefined,
) => isParentDynamicContentSource(descriptor) || (!descriptor && inheritedSource)
  ? inheritedSource ?? undefined
  : descriptor ?? undefined;

const parentSourceEntityLabel = (descriptor: DynamicContentContextDescriptor) => {
  if (descriptor.provider === "woocommerce") {
    if (descriptor.source === "product") return "Products";
    if (descriptor.source === "product-category") return "Product Categories";
    if (descriptor.source === "product-tag") return "Product Tags";
  }
  if (descriptor.provider === "wordpress" && descriptor.source === "post") return "Posts";
  return descriptor.source
    .split(/[-_.]/g)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
};

const dynamicSourceLabel = (descriptor: DynamicContentContextDescriptor) => {
  if (descriptor.provider === "woocommerce" && descriptor.source === "product" && descriptor.mode === "collection") {
    return "Current Product Category → Products";
  }
  if (descriptor.provider === "woocommerce" && descriptor.source === "product" && descriptor.mode === "single") {
    return "Current Product";
  }
  if (
    descriptor.provider === "webpages" &&
    descriptor.source === "context-relation" &&
    descriptor.query?.path === "gallery.items"
  ) {
    return "Current Product → Gallery Images";
  }
  return `${descriptor.provider} → ${descriptor.source}`;
};

export function DynamicContentSourceNotice({
  descriptor,
  inherited = false,
}: {
  descriptor: DynamicContentContextDescriptor;
  inherited?: boolean;
}) {
  const query = descriptor.query ?? {};
  const galleryRelation =
    descriptor.provider === "webpages" &&
    descriptor.source === "context-relation" &&
    query.path === "gallery.items";
  const relationLimit = galleryRelation && typeof query.quantity === "number"
    ? ` Up to ${query.quantity} additional images are used.`
    : "";
  return (
    <div className="builder-element-inspector-note" data-dynamic-source-ownership={inherited ? "inherited" : "related"}>
      <strong>{inherited ? "Inherited dynamic source" : "Related dynamic source"}</strong>
      <span>{dynamicSourceLabel(descriptor)}</span>
      <span>
        {inherited
          ? "The parent column repeats this element once for every product in the active category. Content fields map values from that current product."
          : `This item repeats a relation from the current product.${relationLimit}`}
      </span>
    </div>
  );
}

const orderOptions = [
  { value: "date", label: "Date" },
  { value: "modifiedDate", label: "Modified Date" },
  { value: "title", label: "Title" },
  { value: "menuOrder", label: "Menu Order" },
  { value: "id", label: "ID" },
] as const;

const directionOptions = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
] as const;

const termMatchOptions = [{ value: "any", label: "Any matching term" }] as const;

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const listValue = (value: unknown) =>
  Array.isArray(value) ? value.map(String).join(", ") : "";

const parseList = (value: string) =>
  Array.from(new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean)));

const parseTerms = (value: string): Array<{ taxonomy: "category" | "tag"; ids: string[] }> =>
  parseList(value).flatMap((entry) => {
      const separator = entry.indexOf(":");
      if (separator <= 0 || separator === entry.length - 1) return [];
      const taxonomy = entry.slice(0, separator).trim();
      const id = entry.slice(separator + 1).trim();
      if ((taxonomy !== "category" && taxonomy !== "tag") || !id) return [];
      return [{ taxonomy, ids: [id] }];
    });

const formatTerms = (value: unknown) =>
  Array.isArray(value)
    ? value.flatMap((entry) => {
        const term = asRecord(entry);
        const taxonomy = term.taxonomy;
        const ids = Array.isArray(term.ids) ? term.ids : [];
        return (taxonomy === "category" || taxonomy === "tag")
          ? ids.map((id) => `${taxonomy}:${String(id)}`)
          : [];
      }).join(", ")
    : "";

function ProductCategoryPicker({
  value,
  onChange,
  categoryTree,
}: {
  value: unknown;
  onChange: (value: string[]) => void;
  categoryTree: CategoryTreeItem[];
}) {
  const [search, setSearch] = useState("");
  const selected = new Set(Array.isArray(value) ? value.map(String) : []);
  const options = useMemo(() => {
    const query = search.trim().toLowerCase();
    return flattenCategoryTree(categoryTree).filter((category) =>
      !query || category.label.toLowerCase().includes(query) || category.slug.toLowerCase().includes(query),
    );
  }, [categoryTree, search]);
  return (
    <div className="builder-category-visibility-card">
      <input
        className="builder-category-search"
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search product categories..."
        aria-label="Search product categories"
      />
      <div className="builder-category-hide-list">
        {options.map((category) => {
          const id = String((category as { dbId?: number }).dbId ?? category.slug);
          const checked = selected.has(id);
          return (
            <label key={id} className="builder-category-hide-option">
              <input
                type="checkbox"
                checked={checked}
                onChange={(event) => {
                  const next = new Set(selected);
                  if (event.target.checked) next.add(id); else next.delete(id);
                  onChange(Array.from(next));
                }}
              />
              <span className="builder-category-hide-copy"><strong>{category.label}</strong></span>
            </label>
          );
        })}
        {options.length === 0 && <div className="builder-category-hide-empty">No product categories available.</div>}
      </div>
    </div>
  );
}

export default function DynamicContentInspectorGroup<Item extends DynamicItem>({
  item,
  update,
  fixedSourceKey,
  categoryTree = [],
  inheritedSource,
}: Props<Item>) {
  const capabilities = useDynamicContentCapabilities();
  const sourceOptions = useMemo(() => [
    ...capabilities.slice(0, 1).map((source) => ({ value: source.key, label: source.label })),
    ...(inheritedSource ? [{
      value: PARENT_SOURCE_KEY,
      label: `Parent (${parentSourceEntityLabel(inheritedSource)})`,
    }] : []),
    ...capabilities.slice(1).map((source) => ({ value: source.key, label: source.label })),
  ], [capabilities, inheritedSource]);
  const descriptor = item.dynamicContext;
  const fixedCapability = fixedSourceKey
    ? capabilities.find((candidate) => candidate.key === fixedSourceKey)
    : undefined;
  const effectiveAuthoredDescriptor = effectiveDynamicContentSource(descriptor, inheritedSource);
  const descriptorCapability = capabilities.find((candidate) =>
    dynamicContentCapabilityMatchesDescriptor(candidate, effectiveAuthoredDescriptor),
  );
  const source = fixedSourceKey ?? (
    inheritedSource && (isParentDynamicContentSource(descriptor) || !descriptor)
      ? PARENT_SOURCE_KEY
      : descriptorCapability?.key ?? dynamicContentSourceKey(descriptor)
  );
  const effectiveDescriptor = fixedCapability?.provider && fixedCapability.source && fixedCapability.mode
    ? {
        provider: fixedCapability.provider,
        source: fixedCapability.source,
        mode: fixedCapability.mode,
        ...(descriptor?.query ? { query: descriptor.query } : {}),
      } satisfies DynamicContentContextDescriptor
    : effectiveAuthoredDescriptor;
  const capability = fixedCapability ?? descriptorCapability;
  const usesParentSource = source === PARENT_SOURCE_KEY;
  const isWordPressPostCollection = !usesParentSource && capability?.provider === "wordpress" && capability.source === "post" && capability.mode === "collection";
  const query = asRecord(effectiveDescriptor?.query);
  const filters = asRecord(query.filters);

  const setQuery = (patch: Record<string, unknown>) => {
    if (!effectiveDescriptor) return;
    const nextQuery = { ...query, ...patch };
    Object.keys(nextQuery).forEach((key) => {
      if (nextQuery[key] === undefined) delete nextQuery[key];
    });
    update({
      dynamicContext: {
        ...effectiveDescriptor,
        query: nextQuery as Record<string, DynamicContentData>,
      },
    } as Partial<Item>);
  };

  const setFilter = (key: string, value: unknown) => {
    const nextFilters = { ...filters, [key]: value };
    Object.keys(nextFilters).forEach((filterKey) => {
      const filterValue = nextFilters[filterKey];
      if (filterValue === undefined || (Array.isArray(filterValue) && filterValue.length === 0)) {
        delete nextFilters[filterKey];
      }
    });
    setQuery({ filters: Object.keys(nextFilters).length > 0 ? nextFilters : undefined });
  };

  const selectSource = (value: string) => {
    if (value === "static") {
      update({ dynamicContext: inheritedSource ? STATIC_SOURCE_DESCRIPTOR : undefined } as Partial<Item>);
      return;
    }
    if (value === PARENT_SOURCE_KEY && inheritedSource) {
      update({
        dynamicContext: {
          provider: "yootheme",
          source: "#parent",
          mode: "single",
          query: {
            parentProvider: inheritedSource.provider,
            parentSource: inheritedSource.source,
            parentMode: inheritedSource.mode,
          },
        },
      } as unknown as Partial<Item>);
      return;
    }
    const capability = capabilities.find(
      (candidate) => candidate.key === value,
    );
    if (!capability?.provider || !capability.source || !capability.mode) return;
    const nextDescriptor: DynamicContentContextDescriptor = {
      provider: capability.provider,
      source: capability.source,
      mode: capability.mode,
      ...(source === capability.key && descriptor?.query
        ? { query: descriptor.query }
        : capability.defaultQuery
          ? { query: capability.defaultQuery }
          : {}),
    };
    update({ dynamicContext: nextDescriptor } as Partial<Item>);
  };

  const renderCapabilityQueryControl = (control: DynamicContentQueryControl) => {
    const value = query[control.key];
    if (fixedSourceKey === "woocommerce-product-collection" && control.key === "categories") {
      return (
        <InspectorFieldRow key={control.key} label={control.label} description="Select one or more product categories.">
          <ProductCategoryPicker value={value} categoryTree={categoryTree} onChange={(nextValue) => setQuery({ categories: nextValue })} />
        </InspectorFieldRow>
      );
    }
    if (
      capability?.provider === "woocommerce" &&
      capability.source === "product-category" &&
      control.key === "parentId" &&
      categoryTree.length > 0
    ) {
      const categoryOptions = flattenCategoryTree(categoryTree).map((category) => ({
        value: String((category as { dbId?: number }).dbId ?? category.slug),
        label: category.label,
      }));
      return (
        <Fragment key={control.key}>
          <InspectorFieldRow
            label={query.parentRelation === true ? "Category" : control.label}
            description="Select the category whose direct children should populate this item template."
          >
            <InspectorSelect
              value={value == null ? "0" : String(value)}
              options={[{ value: "0", label: "Root" }, ...categoryOptions]}
              onChange={(nextValue) => setQuery({
                parentId: Math.max(0, Number.parseInt(nextValue, 10) || 0),
                parentRelation: true,
              })}
              ariaLabel="Dynamic Content Parent Category"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Multiple Items Source"
            description="Fetch all product categories or only direct children of the selected category."
          >
            <InspectorSelect
              value={query.parentRelation === true ? "children" : "all"}
              options={[
                { value: "children", label: "Child Product Categories" },
                { value: "all", label: "All Product Categories" },
              ]}
              onChange={(nextValue) => setQuery(nextValue === "children"
                ? { parentRelation: true, parentId: Math.max(0, Number(query.parentId) || 0) }
                : { parentRelation: undefined, parentId: undefined })}
              ariaLabel="Dynamic Content multiple items source"
            />
          </InspectorFieldRow>
        </Fragment>
      );
    }
    if (control.control === "select") {
      return (
        <InspectorFieldRow key={control.key} label={control.label} description={control.description}>
          <InspectorSelect
            value={value == null ? "" : String(value)}
            options={control.options ?? []}
            onChange={(nextValue) => setQuery({
              [control.key]: nextValue === "true" ? true : nextValue === "false" ? false : nextValue || undefined,
            })}
            ariaLabel={`Dynamic Content ${control.label}`}
          />
        </InspectorFieldRow>
      );
    }
    return (
      <InspectorFieldRow key={control.key} label={control.label} description={control.description}>
        <InspectorTextField
          value={control.control === "list" ? listValue(value) : value == null ? "" : String(value)}
          placeholder={control.placeholder}
          ariaLabel={`Dynamic Content ${control.label}`}
          onChange={(nextValue) => setQuery({
            [control.key]: nextValue.trim() === ""
              ? undefined
              : control.control === "integer"
                ? Math.max(control.minimum ?? 0, Number.parseInt(nextValue, 10) || control.minimum || 0)
                : control.control === "list"
                  ? parseList(nextValue)
                  : nextValue,
          })}
        />
      </InspectorFieldRow>
    );
  };

  return (
    <InspectorDivision title={fixedSourceKey === "woocommerce-product-collection" ? "PRODUCT QUERY" : "DYNAMIC CONTENT"}>
      {!fixedSourceKey && (
        <InspectorFieldRow
          label="Source"
          description="Use the authored item as a template for provider content."
        >
          <InspectorSelect
            value={source}
            options={sourceOptions}
            onChange={selectSource}
            ariaLabel="Dynamic Content source"
          />
        </InspectorFieldRow>
      )}

      {isWordPressPostCollection && (
        <>
          <InspectorFieldRow label="Start">
            <InspectorTextField
              value={query.start == null ? "" : String(query.start)}
              placeholder="0"
              ariaLabel="Dynamic Content start"
              onChange={(value) => setQuery({
                start: value.trim() === "" ? undefined : Math.max(0, Number.parseInt(value, 10) || 0),
              })}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Quantity">
            <InspectorTextField
              value={query.quantity == null ? "" : String(query.quantity)}
              placeholder="10"
              ariaLabel="Dynamic Content quantity"
              onChange={(value) => setQuery({
                quantity: value.trim() === "" ? undefined : Math.max(1, Number.parseInt(value, 10) || 1),
              })}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Order">
            <InspectorSelect
              value={String(query.order ?? "date")}
              options={orderOptions}
              onChange={(value) => setQuery({ order: value })}
              ariaLabel="Dynamic Content order"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Direction">
            <InspectorSelect
              value={String(query.direction ?? "desc")}
              options={directionOptions}
              onChange={(value) => setQuery({ direction: value })}
              ariaLabel="Dynamic Content direction"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Authors" description="Comma-separated author IDs or slugs.">
            <InspectorTextField
              value={listValue(filters.authors)}
              placeholder="1, 2"
              ariaLabel="Dynamic Content authors"
              onChange={(value) => setFilter("authors", parseList(value))}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Categories" description="Comma-separated category IDs or slugs.">
            <InspectorTextField
              value={listValue(filters.categories)}
              placeholder="news, features"
              ariaLabel="Dynamic Content categories"
              onChange={(value) => setFilter("categories", parseList(value))}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Tags" description="Comma-separated tag IDs or slugs.">
            <InspectorTextField
              value={listValue(filters.tags)}
              placeholder="featured, product"
              ariaLabel="Dynamic Content tags"
              onChange={(value) => setFilter("tags", parseList(value))}
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Taxonomy Terms"
            description="Use category:value or tag:value entries."
          >
            <InspectorTextField
              value={formatTerms(filters.terms)}
              placeholder="category:12, tag:featured"
              ariaLabel="Dynamic Content taxonomy terms"
              onChange={(value) => setFilter("terms", parseTerms(value))}
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Term Matching">
            <InspectorSelect
              value={String(filters.termMatch ?? "any")}
              options={termMatchOptions}
              onChange={(value) => setFilter("termMatch", value)}
              ariaLabel="Dynamic Content term matching"
            />
          </InspectorFieldRow>
        </>
      )}

      {!usesParentSource && !isWordPressPostCollection && capability?.queryControls?.length ? (
        <>{capability.queryControls.map(renderCapabilityQueryControl)}</>
      ) : null}
    </InspectorDivision>
  );
}
