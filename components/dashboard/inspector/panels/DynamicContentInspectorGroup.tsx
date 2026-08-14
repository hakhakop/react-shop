"use client";

import type {
  DynamicContentContextDescriptor,
  DynamicContentData,
} from "@/lib/dynamicContent";
import {
  DYNAMIC_CONTENT_SOURCE_CAPABILITIES,
  dynamicContentSourceKey,
  WORDPRESS_POST_COLLECTION_SOURCE,
} from "@/lib/dynamicContentCapabilities";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

type DynamicItem = {
  dynamicContext?: DynamicContentContextDescriptor;
};

type Props<Item extends DynamicItem = DynamicItem> = {
  item: Item;
  update: (patch: Partial<Item>) => void;
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

export default function DynamicContentInspectorGroup<Item extends DynamicItem>({
  item,
  update,
}: Props<Item>) {
  const descriptor = item.dynamicContext;
  const source = dynamicContentSourceKey(descriptor);
  const isCollection = source === WORDPRESS_POST_COLLECTION_SOURCE.key;
  const query = asRecord(descriptor?.query);
  const filters = asRecord(query.filters);

  const setQuery = (patch: Record<string, unknown>) => {
    if (!descriptor) return;
    const nextQuery = { ...query, ...patch };
    Object.keys(nextQuery).forEach((key) => {
      if (nextQuery[key] === undefined) delete nextQuery[key];
    });
    update({
      dynamicContext: {
        ...descriptor,
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
    if (value !== WORDPRESS_POST_COLLECTION_SOURCE.key) return;
    const nextDescriptor: DynamicContentContextDescriptor = {
      provider: WORDPRESS_POST_COLLECTION_SOURCE.provider!,
      source: WORDPRESS_POST_COLLECTION_SOURCE.source!,
      mode: WORDPRESS_POST_COLLECTION_SOURCE.mode!,
      ...(isCollection && descriptor?.query ? { query: descriptor.query } : {}),
    };
    update({ dynamicContext: nextDescriptor } as Partial<Item>);
  };

  return (
    <InspectorDivision title="DYNAMIC CONTENT">
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

      {isCollection && (
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
    </InspectorDivision>
  );
}
