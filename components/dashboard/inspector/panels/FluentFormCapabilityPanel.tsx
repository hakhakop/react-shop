"use client";

import React, { useState, useEffect } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const DEFAULT_FORM_OPTIONS = [
  { value: "1", label: "Form #1: General Contact Form" },
  { value: "2", label: "Form #2: Newsletter Subscription" },
  { value: "3", label: "Form #3: Project Quote & Inquiry" },
  { value: "4", label: "Form #4: Customer Support & Feedback" },
  { value: "custom", label: "Custom Form ID..." },
];

export default function FluentFormCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
}: Props) {
  const rawBlock = (block ?? {}) as any;
  const currentFormId = String(rawBlock.fluentFormId || "1");

  const [isCustomId, setIsCustomId] = useState(() => {
    return !["1", "2", "3", "4"].includes(currentFormId);
  });

  const selectValue = isCustomId ? "custom" : currentFormId;

  // --------------------------------------------------------------------------
  // TAB 1: CONTENT
  // --------------------------------------------------------------------------
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="fluent-form-content">
        <InspectorDivision title="FORM SELECTION">
          <InspectorFieldRow label="Select Form">
            <InspectorSelect
              value={selectValue}
              onChange={(value: string) => {
                if (value === "custom") {
                  setIsCustomId(true);
                } else {
                  setIsCustomId(false);
                  update({ fluentFormId: value });
                }
              }}
              options={DEFAULT_FORM_OPTIONS}
            />
          </InspectorFieldRow>

          {isCustomId && (
            <InspectorFieldRow label="Custom Form ID">
              <InspectorTextField
                value={currentFormId}
                onChange={(value: string) => update({ fluentFormId: value })}
                placeholder="e.g. 5 or 12"
              />
            </InspectorFieldRow>
          )}

          <InspectorFieldRow label="Form Heading / Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(value: string) => update({ title: value })}
              placeholder="e.g. Get in Touch"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 2: SETTINGS
  // --------------------------------------------------------------------------
  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="fluent-form-settings">
        <InspectorDivision title="APPEARANCE & DISPLAY">
          <InspectorFieldRow label="Show Form Title">
            <InspectorSwitch
              checked={rawBlock.showFormTitle !== false}
              onChange={(checked: boolean) => update({ showFormTitle: checked } as any)}
              label="Display title above form"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Container Padding">
            <InspectorSelect
              value={rawBlock.elementPadding ?? "default"}
              onChange={(value: string) => update({ elementPadding: value } as any)}
              options={[
                { value: "none", label: "None" },
                { value: "small", label: "Small" },
                { value: "default", label: "Medium / Default" },
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
    <div className="builder-inspector-stack" data-uikit-capability="fluent-form-advanced">
      <InspectorDivision title="GENERAL">
        <InspectorFieldRow label="Custom HTML ID">
          <InspectorTextField
            value={rawBlock.customId ?? ""}
            onChange={(value: string) => update({ customId: value } as any)}
            placeholder="my-form-id"
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
