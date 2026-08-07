"use client";

import React from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function CategoryFiltersCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
}: Props) {
  const rawBlock = (block ?? {}) as any;

  // --------------------------------------------------------------------------
  // TAB 1: CONTENT
  // --------------------------------------------------------------------------
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="category-filters-content">
        <InspectorDivision title="HEADING & INTRO">
          <InspectorFieldRow label="Block Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(value: string) => update({ title: value })}
              placeholder="e.g. Filter by Category"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Default Active Category">
            <InspectorSelect
              value={rawBlock.defaultCategory ?? "all"}
              onChange={(value: string) => update({ defaultCategory: value } as any)}
              options={[
                { value: "all", label: "All Products" },
                { value: "footwear", label: "Footwear" },
                { value: "clothing", label: "Clothing" },
                { value: "accessories", label: "Accessories" },
                { value: "electronics", label: "Electronics" },
              ]}
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 2: SETTINGS / STYLE
  // --------------------------------------------------------------------------
  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="category-filters-settings">
        <InspectorDivision title="ALIGNMENT & APPEARANCE">
          <InspectorFieldRow label="Alignment">
            <InspectorSelect
              value={rawBlock.elementAlign ?? rawBlock.align ?? "center"}
              onChange={(value: string) => update({ elementAlign: value, align: value } as any)}
              options={[
                { value: "left", label: "Left" },
                { value: "center", label: "Center" },
                { value: "right", label: "Right" },
              ]}
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Pill Style Variant">
            <InspectorSelect
              value={rawBlock.pillVariant ?? "subtle"}
              onChange={(value: string) => update({ pillVariant: value } as any)}
              options={[
                { value: "subtle", label: "Subtle Gray Background" },
                { value: "primary", label: "Primary Blue Accent" },
                { value: "outline", label: "Outline / Border Only" },
              ]}
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Pill Size">
            <InspectorSelect
              value={rawBlock.pillSize ?? "medium"}
              onChange={(value: string) => update({ pillSize: value } as any)}
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium (Default)" },
                { value: "large", label: "Large" },
              ]}
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 3: ADVANCED
  // --------------------------------------------------------------------------
  return (
    <div className="builder-inspector-stack" data-uikit-capability="category-filters-advanced">
      <InspectorDivision title="GENERAL">
        <InspectorFieldRow label="Custom HTML ID">
          <InspectorTextField
            value={rawBlock.customId ?? ""}
            onChange={(value: string) => update({ customId: value } as any)}
            placeholder="my-category-filters-id"
          />
        </InspectorFieldRow>

        <InspectorFieldRow label="Custom CSS Class">
          <InspectorTextField
            value={rawBlock.customClass ?? ""}
            onChange={(value: string) => update({ customClass: value } as any)}
            placeholder="my-custom-class"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
