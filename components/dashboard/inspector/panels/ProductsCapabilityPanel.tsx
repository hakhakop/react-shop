"use client";

import React, { useState, useEffect } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";
import {
  MediaSettingsGroup,
  CardSettingsGroup,
  TitleSettingsGroup,
  MetaSettingsGroup,
  ContentSettingsGroup,
  ActionSettingsGroup,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const opts = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    value,
    label: value.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
  }));

const SOURCE_OPTIONS = [
  { value: "all", label: "All Products" },
  { value: "featured", label: "Featured Products Only" },
  { value: "sale", label: "On Sale Products Only" },
  { value: "category", label: "Specific Category" },
];

const DEFAULT_CATEGORY_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "footwear", label: "Footwear / Shoes" },
  { value: "clothing", label: "Clothing / Apparel" },
  { value: "accessories", label: "Accessories / Bags" },
  { value: "electronics", label: "Electronics / Gadgets" },
  { value: "custom", label: "Custom Category Slug / ID..." },
];

const ORDER_OPTIONS = [
  { value: "date-desc", label: "Latest / Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popularity", label: "Best Sellers / Popularity" },
  { value: "rating", label: "Highest Rated" },
];

const PAGINATION_STYLE_OPTIONS = [
  { value: "numbers", label: "Numeric Page Buttons (1 2 3)" },
  { value: "load-more", label: "Load More Button" },
  { value: "prev-next", label: "Prev / Next Controls" },
];

export default function ProductsCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
}: Props) {
  const rawBlock = (block ?? {}) as any;
  const isPaginationOn = Boolean(rawBlock.paginationEnabled || rawBlock.pagination?.enabled);
  const [fetchedCategories, setFetchedCategories] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/builder-preview-categories")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          const list = data.categories.map((c: any) => ({
            value: c.slug || String(c.id),
            label: `${c.name || c.title} (${c.slug})`,
          }));
          setFetchedCategories([
            { value: "all", label: "All Categories" },
            ...list,
            { value: "custom", label: "Custom Category Slug / ID..." },
          ]);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const categoryOptions = fetchedCategories.length > 0 ? fetchedCategories : DEFAULT_CATEGORY_OPTIONS;
  const currentCategoryValue = rawBlock.productCategory ?? rawBlock.category ?? rawBlock.categoryId ?? "all";
  const isCustomCategory =
    currentCategoryValue !== "all" &&
    !categoryOptions.some((opt) => opt.value === currentCategoryValue);

  // --------------------------------------------------------------------------
  // TAB: CONTENT
  // --------------------------------------------------------------------------
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="products-content">

        <InspectorDivision title="PRODUCT SOURCE">
          <InspectorFieldRow label="Block title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(value: string) => update({ title: value })}
              placeholder="e.g. Featured Products"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Source"
            isOverridden={rawBlock.productSource !== undefined && rawBlock.productSource !== "all"}
            inheritedValueText="All products"
            onReset={() => update({ productSource: undefined, source: undefined } as any)}
          >
            <InspectorPillGroup
              value={rawBlock.productSource ?? rawBlock.source ?? "all"}
              options={SOURCE_OPTIONS}
              onChange={(value: string) => update({ productSource: value, source: value } as any)}
              ariaLabel="Product source"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Category"
            isOverridden={currentCategoryValue !== "all"}
            inheritedValueText="All categories"
            onReset={() => update({ productCategory: undefined, category: undefined, categoryId: undefined } as any)}
          >
            <InspectorSelect
              value={isCustomCategory ? "custom" : currentCategoryValue}
              onChange={(value: string) => {
                if (value === "custom") {
                  update({ productCategory: "", category: "", categoryId: "" } as any);
                } else {
                  update({ productCategory: value, category: value, categoryId: value } as any);
                }
              }}
              options={categoryOptions}
              ariaLabel="Product category"
            />
          </InspectorFieldRow>

          {isCustomCategory && (
            <InspectorFieldRow label="Custom slug / ID">
              <InspectorTextField
                value={currentCategoryValue === "custom" ? "" : currentCategoryValue}
                onChange={(value: string) =>
                  update({ productCategory: value, category: value, categoryId: value } as any)
                }
                placeholder="e.g. footwear or 15"
              />
            </InspectorFieldRow>
          )}

          <InspectorFieldRow
            label="Sort order"
            isOverridden={rawBlock.productSort !== undefined && rawBlock.productSort !== "date-desc"}
            inheritedValueText="Latest first"
            onReset={() => update({ productSort: undefined } as any)}
          >
            <InspectorSelect
              value={rawBlock.productSort ?? "date-desc"}
              onChange={(value: string) => update({ productSort: value } as any)}
              options={ORDER_OPTIONS}
              ariaLabel="Product sort order"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Limit"
            isOverridden={rawBlock.productsLimit !== undefined}
            inheritedValueText="4"
            onReset={() => update({ productsLimit: undefined, limit: undefined, gridLimit: undefined } as any)}
          >
            <InspectorSelect
              value={String(rawBlock.productsLimit ?? rawBlock.limit ?? rawBlock.gridLimit ?? 4)}
              onChange={(value: string) =>
                update({ productsLimit: parseInt(value, 10), limit: parseInt(value, 10), gridLimit: parseInt(value, 10) } as any)
              }
              options={[
                { value: "0", label: "All (no limit)" },
                { value: "4", label: "4 products" },
                { value: "6", label: "6 products" },
                { value: "8", label: "8 products" },
                { value: "12", label: "12 products" },
                { value: "16", label: "16 products" },
                { value: "24", label: "24 products" },
                { value: "48", label: "48 products" },
              ]}
              ariaLabel="Product limit"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="PAGINATION">
          <InspectorFieldRow
            label="Enable pagination"
            isOverridden={rawBlock.paginationEnabled !== undefined}
            inheritedValueText="Off"
            onReset={() => update({ paginationEnabled: undefined, pagination: undefined } as any)}
          >
            <InspectorSwitch
              checked={isPaginationOn}
              onChange={(checked: boolean) =>
                update({ paginationEnabled: checked, pagination: { ...(rawBlock.pagination ?? {}), enabled: checked } } as any)
              }
              label="Enable page navigation"
            />
          </InspectorFieldRow>

          {isPaginationOn && (
            <>
              <InspectorFieldRow
                label="Items per page"
                isOverridden={rawBlock.pageSize !== undefined}
                inheritedValueText="4"
                onReset={() => update({ pageSize: undefined } as any)}
              >
                <InspectorSelect
                  value={String(rawBlock.pageSize ?? rawBlock.productsLimit ?? 4)}
                  onChange={(value: string) => update({ pageSize: parseInt(value, 10) } as any)}
                  options={[
                    { value: "4", label: "4 per page" },
                    { value: "6", label: "6 per page" },
                    { value: "8", label: "8 per page" },
                    { value: "12", label: "12 per page" },
                    { value: "16", label: "16 per page" },
                  ]}
                  ariaLabel="Items per page"
                />
              </InspectorFieldRow>

              <InspectorFieldRow
                label="Style"
                isOverridden={rawBlock.paginationStyle !== undefined && rawBlock.paginationStyle !== "numbers"}
                inheritedValueText="Numbers"
                onReset={() => update({ paginationStyle: undefined } as any)}
              >
                <InspectorSelect
                  value={rawBlock.paginationStyle ?? "numbers"}
                  onChange={(value: string) => update({ paginationStyle: value } as any)}
                  options={PAGINATION_STYLE_OPTIONS}
                  ariaLabel="Pagination style"
                />
              </InspectorFieldRow>
            </>
          )}
        </InspectorDivision>

        <InspectorDivision title="FRONTEND CONTROLS">
          <InspectorFieldRow
            label="Category pills"
            isOverridden={rawBlock.showCategoryPills !== undefined}
            inheritedValueText="Off"
            onReset={() => update({ showCategoryPills: undefined } as any)}
          >
            <InspectorSwitch
              checked={rawBlock.showCategoryPills === true}
              onChange={(checked: boolean) => update({ showCategoryPills: checked } as any)}
              label="Show category filter pills"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Sort dropdown"
            isOverridden={rawBlock.showFrontendSort !== undefined}
            inheritedValueText="Off"
            onReset={() => update({ showFrontendSort: undefined } as any)}
          >
            <InspectorSwitch
              checked={rawBlock.showFrontendSort === true}
              onChange={(checked: boolean) => update({ showFrontendSort: checked } as any)}
              label="Show sort dropdown"
            />
          </InspectorFieldRow>
        </InspectorDivision>

      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB: STYLE — exact same group order, names, and structure as GridCapabilityPanel
  // --------------------------------------------------------------------------
  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="products-style">

        {/* GRID — identical to Grid GRID division */}
        <InspectorDivision title="GRID">
          <InspectorFieldRow
            label="Columns"
            isOverridden={(block as any).gridColumns !== undefined}
            inheritedValueText="4"
            onReset={() => update({ gridColumns: undefined, columns: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).gridColumns ?? (block as any).columns ?? 4)}
              options={[2, 3, 4, 5].map((n) => ({ value: String(n), label: String(n) }))}
              onChange={(value: string) => update({ gridColumns: Number(value), columns: Number(value) } as any)}
              ariaLabel="Grid columns"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Column Gap"
            isOverridden={(block as any).gridGap !== undefined}
            inheritedValueText="Medium"
            onReset={() => update({ gridGap: undefined } as any)}
          >
            <InspectorPillGroup
              value={(block as any).gridGap ?? "medium"}
              options={opts(["none", "small", "medium", "large", "max"] as const)}
              onChange={(value: string) => update({ gridGap: value } as any)}
              ariaLabel="Grid gutter"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Row gap"
            isOverridden={(block as any).gridRowGap !== undefined}
            inheritedValueText="Medium"
            onReset={() => update({ gridRowGap: undefined } as any)}
          >
            <InspectorPillGroup
              value={(block as any).gridRowGap ?? (block as any).gridGap ?? "medium"}
              options={opts(["none", "small", "medium", "large"] as const)}
              onChange={(value: string) => update({ gridRowGap: value } as any)}
              ariaLabel="Grid row gap"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Stacking"
            isOverridden={(block as any).gridStacking !== undefined}
            inheritedValueText="Inherit"
            onReset={() => update({ gridStacking: undefined } as any)}
          >
            <InspectorPillGroup
              value={(block as any).gridStacking ?? "inherit"}
              options={opts(["inherit", "stack"] as const)}
              onChange={(value: string) => update({ gridStacking: value } as any)}
              ariaLabel="Grid stacking"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* MEDIA — identical keys pattern to Grid MediaSettingsGroup */}
        <MediaSettingsGroup
          block={block}
          update={update}
          title="MEDIA"
          keys={{
            showMedia: "productShowMedia",
            placement: "productMediaPlacement",
            ratio: "imageRatio",
            fit: "imageFit",
            width: "productMediaWidth",
            align: "productMediaAlign",
          }}
        />

        {/* PANEL — identical structure to Grid PANEL division:
            InspectorDivision title="PANEL" wrapping CardSettingsGroup title="CARD PRESENTATION"
            Products always use card renderer so CardSettingsGroup is always visible */}
        <InspectorDivision title="PANEL">
          <CardSettingsGroup
            block={block}
            update={update}
            title="CARD PRESENTATION"
            keys={{
              variant: "panelVariant",
              size: "panelSize",
              hover: "panelHover",
            }}
          />
        </InspectorDivision>

        {/* TITLE — identical to Grid TitleSettingsGroup */}
        <TitleSettingsGroup
          block={block}
          update={update}
          keys={{
            role: "titleTypographyRole",
            size: "productTitleSize",
            align: "productTitleAlign",
            level: "productTitleLevel",
          }}
        />

        {/* META — identical to Grid MetaSettingsGroup */}
        <MetaSettingsGroup
          block={block}
          update={update}
          keys={{
            role: "metaTypographyRole",
            align: "productMetaAlign",
            level: "productMetaHtmlElement",
          }}
        />

        {/* CONTENT — identical to Grid ContentSettingsGroup */}
        <ContentSettingsGroup
          block={block}
          update={update}
          keys={{
            role: "contentTypographyRole",
            align: "productContentAlign",
          }}
        />

        {/* ACTION BUTTON — identical to Grid ActionSettingsGroup, adapted for Add to Cart */}
        <ActionSettingsGroup
          block={block}
          update={update}
          title="ACTION BUTTON"
          showVisibilityToggle
          keys={{
            visible: "showAddToCart",
            style: "cartButtonStyle",
            size: "cartButtonSize",
          }}
        />

      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB: ADVANCED — product-specific display toggles and attributes.
  // General settings are composed by ElementCapabilityComposer in the shared
  // Settings tab, so this panel must not render a second copy here.
  // --------------------------------------------------------------------------
  return (
    <div className="builder-inspector-stack" data-uikit-capability="products-advanced">

      {/* DISPLAY — product-specific visibility toggles */}
      <InspectorDivision title="DISPLAY">
        <InspectorFieldRow
          label="Show badges"
          isOverridden={(block as any).showBadges !== undefined}
          inheritedValueText="On"
          onReset={() => update({ showBadges: undefined } as any)}
        >
          <InspectorSwitch
            checked={(block as any).showBadges !== false}
            onChange={(checked: boolean) => update({ showBadges: checked } as any)}
            label="Show sale / featured badges"
          />
        </InspectorFieldRow>

        <InspectorFieldRow
          label="Show category label"
          isOverridden={(block as any).showCategoryLabel !== undefined}
          inheritedValueText="On"
          onReset={() => update({ showCategoryLabel: undefined } as any)}
        >
          <InspectorSwitch
            checked={(block as any).showCategoryLabel !== false}
            onChange={(checked: boolean) => update({ showCategoryLabel: checked } as any)}
            label="Show category eyebrow"
          />
        </InspectorFieldRow>
      </InspectorDivision>

      {/* ADVANCED IDs */}
      <InspectorDivision title="ATTRIBUTES">
        <InspectorFieldRow label="Custom HTML ID">
          <InspectorTextField
            value={(block as any).customId ?? ""}
            onChange={(value: string) => update({ customId: value } as any)}
            placeholder="my-products-id"
          />
        </InspectorFieldRow>

        <InspectorFieldRow label="Custom CSS class">
          <InspectorTextField
            value={(block as any).customClass ?? ""}
            onChange={(value: string) => update({ customClass: value } as any)}
            placeholder="my-custom-class"
          />
        </InspectorFieldRow>
      </InspectorDivision>

    </div>
  );
}
