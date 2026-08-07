"use client";

import React from "react";
import type { BuilderLayoutBlock, InspectorTab, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => void;
};

export default function DatePickerCapabilityPanel({ block, tab, update }: Props) {
  const rawBlock = (block ?? {}) as any;

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="datepicker-content">
        <InspectorDivision title="CONTENT">
          <InspectorFieldRow label="Label">
            <InspectorTextField
              value={rawBlock.dateLabel ?? "Preferred date"}
              onChange={(dateLabel) => update({ dateLabel } as any)}
              placeholder="Preferred date"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(title) => update({ title } as any)}
              placeholder="Optional title"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Body">
            <InspectorTextarea
              value={rawBlock.body ?? ""}
              onChange={(body) => update({ body } as any)}
              placeholder="Optional description"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="datepicker-style">
        <InspectorDivision title="DISPLAY">
          <InspectorFieldRow
            label="Label text"
            isOverridden={rawBlock.dateLabel !== undefined && rawBlock.dateLabel !== "Preferred date"}
            inheritedValueText="Preferred date"
            onReset={() => update({ dateLabel: undefined } as any)}
          >
            <InspectorTextField
              value={rawBlock.dateLabel ?? "Preferred date"}
              onChange={(dateLabel) => update({ dateLabel } as any)}
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="datepicker-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="Custom ID">
            <InspectorTextField
              value={rawBlock.customId ?? ""}
              onChange={(customId) => update({ customId } as any)}
              placeholder="e.g. date-picker-1"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom Class">
            <InspectorTextField
              value={rawBlock.customClass ?? ""}
              onChange={(customClass) => update({ customClass } as any)}
              placeholder="e.g. my-date-picker"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  return null;
}
