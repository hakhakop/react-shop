"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorAlignmentControl,
  InspectorFieldRow,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";
import { ActionSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function ButtonCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-content">
        <ActionSettingsGroup
          block={block}
          update={update}
          title="BUTTON"
          showPresentation={false}
        />
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={(block as any).customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. cta-button"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={(block as any).customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-button"
              ariaLabel="Custom Class"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Attributes">
            <InspectorTextField
              value={(block as any).customAttributes ?? ""}
              onChange={(v) => update({ customAttributes: v } as any)}
              placeholder='data-custom="value"'
              ariaLabel="Custom Attributes"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom CSS">
            <InspectorTextarea
              value={(block as any).customCss ?? ""}
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
    <div className="builder-inspector-stack" data-uikit-capability="button-style">
      <ActionSettingsGroup
        block={block}
        update={update}
        title="BUTTON"
        keys={{ style: "buttonStyle", size: "size" }}
      />
      <InspectorDivision title="LAYOUT">
        <InspectorFieldRow label="Alignment">
          <InspectorAlignmentControl
            value={(block as any).buttonAlign ?? block.textAlign ?? "left"}
            onChange={(value) => update({ buttonAlign: value, textAlign: value } as any)}
            ariaLabel="Button alignment"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
