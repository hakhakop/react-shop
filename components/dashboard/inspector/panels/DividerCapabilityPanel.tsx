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

export default function DividerCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const rawBlock = block as any;

  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="divider-content">
        <InspectorDivision title="DIVIDER">
          <div className="builder-element-inspector-note">
            <strong>Divider Element</strong>
            <span>Horizontal rule separator with optional UIkit decorative styles.</span>
          </div>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="divider-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={rawBlock.customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. section-divider"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={rawBlock.customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-divider"
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
    <div className="builder-inspector-stack" data-uikit-capability="divider-style">
      <InspectorDivision title="DIVIDER">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={rawBlock.dividerStyle ?? rawBlock.preset ?? "icon"}
            options={[
              { value: "icon", label: "Icon (Decorative Center)" },
              { value: "small", label: "Small" },
              { value: "vertical", label: "Vertical" },
            ]}
            onChange={(v) => update({ dividerStyle: v, preset: v } as any)}
            ariaLabel="Divider style"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
