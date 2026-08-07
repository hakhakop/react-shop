"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function AlertCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const rawBlock = block as any;

  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="alert-content">
        <InspectorDivision title="ALERT CONTENT">
          <InspectorFieldRow label="Title">
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(v) => update({ title: v } as any)}
              placeholder="Alert Title"
              ariaLabel="Alert Title"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Body">
            <InspectorTextarea
              value={rawBlock.body ?? rawBlock.content ?? ""}
              onChange={(v) => update({ body: v, content: v } as any)}
              placeholder="Alert message content..."
              ariaLabel="Alert Content"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="alert-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={rawBlock.customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. site-alert"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={rawBlock.customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-alert"
              ariaLabel="Custom Class"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Attributes">
            <InspectorTextField
              value={rawBlock.customAttributes ?? ""}
              onChange={(v) => update({ customAttributes: v } as any)}
              placeholder='data-custom="value"'
              ariaLabel="Custom Attributes"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom CSS">
            <InspectorTextarea
              value={rawBlock.customCss ?? ""}
              onChange={(v) => update({ customCss: v } as any)}
              placeholder="/* CSS rules */"
              ariaLabel="Custom CSS"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="alert-style">
      <InspectorDivision title="ALERT">
        <InspectorFieldRow label="Style / Status">
          <InspectorSelect
            value={rawBlock.status ?? rawBlock.alertStyle ?? rawBlock.preset ?? "primary"}
            options={[
              { value: "primary", label: "Primary (Info)" },
              { value: "success", label: "Success" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger / Error" },
            ]}
            onChange={(v) => update({ status: v, alertStyle: v, preset: v } as any)}
            ariaLabel="Alert style status"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Close button">
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={rawBlock.alertClose !== false}
              onChange={(e) => update({ alertClose: e.target.checked } as any)}
            />
            <span>Show close icon button</span>
          </label>
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
