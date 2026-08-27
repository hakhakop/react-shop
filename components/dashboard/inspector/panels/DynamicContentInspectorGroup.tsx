"use client";

import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
} from "@/lib/dynamicContent";
import {
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES,
  dynamicContentSourceCapability,
  dynamicContentSourceKey,
  type DynamicContentQueryControl,
  type DynamicContentSourceCapability,
} from "@/lib/dynamicContentCapabilities";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";
import { flattenCategoryTree } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import type { CategoryTreeItem } from "@/lib/categories";
import { useMemo, useState } from "react";

type DynamicItem = {
  dynamicContext?: DynamicContentContextDescriptor;
};

type Props<Item extends DynamicItem = DynamicItem> = {
  item: Item;
  update: (patch: Partial<Item>) => void;
  fixedSourceKey?: DynamicContentSourceCapability["key"];
  categoryTree?: CategoryTreeItem[];
};

const sourceOptions = DYNAMIC_CONTENT_SOURCE_CAPABILITIES.map((source) => ({
  value: source.key,
  label: source.label,
}));

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
}: Props<Item>) {
  const descriptor = item.dynamicContext;
  const fixedCapability = fixedSourceKey
    ? DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find((candidate) => candidate.key === fixedSourceKey)
    : undefined;
  const source = fixedSourceKey ?? dynamicContentSourceKey(descriptor);
  const effectiveDescriptor = fixedCapability?.provider && fixedCapability.source && fixedCapability.mode
    ? {
        provider: fixedCapability.provider,
        source: fixedCapability.source,
        mode: fixedCapability.mode,
        ...(descriptor?.query ? { query: descriptor.query } : {}),
      } satisfies DynamicContentContextDescriptor
    : descriptor;
  const capability = fixedCapability ?? dynamicContentSourceCapability(effectiveDescriptor);
  const isWordPressPostCollection = capability?.provider === "wordpress" && capability.source === "post" && capability.mode === "collection";
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
      update({ dynamicContext: undefined } as Partial<Item>);
      return;
    }
    const capability = DYNAMIC_CONTENT_SOURCE_CAPABILITIES.find(
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

      {!isWordPressPostCollection && capability?.queryControls?.length ? (
        <>{capability.queryControls.map(renderCapabilityQueryControl)}</>
      ) : null}
    </InspectorDivision>
  );
}
