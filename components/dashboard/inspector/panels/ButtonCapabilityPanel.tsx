"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
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

export default function ButtonCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-content">
        <InspectorDivision title="CONTENT">
          <InspectorFieldRow label="Text">
            <InspectorTextField
              value={block.buttonLabel ?? ""}
              onChange={(value) => update({ buttonLabel: value })}
              ariaLabel="Button label"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link URL">
            <InspectorTextField
              value={block.buttonUrl ?? ""}
              onChange={(value) => update({ buttonUrl: value })}
              ariaLabel="Button URL"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link Target">
            <InspectorSelect
              value={block.buttonTarget ?? "_self"}
              options={BUILDER_LINK_TARGET_OPTIONS}
              onChange={(value) => update({ buttonTarget: value })}
              ariaLabel="Button target"
            />
          </InspectorFieldRow>
        </InspectorDivision>
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
      <InspectorDivision title="BUTTON">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={block.buttonStyle ?? "primary"}
            options={[
              { value: "default", label: "Button Default" },
              { value: "primary", label: "Button Primary" },
              { value: "secondary", label: "Button Secondary" },
              { value: "danger", label: "Button Danger" },
              { value: "link", label: "Link" },
              { value: "text", label: "Text" },
            ]}
            onChange={(value) => update({ buttonStyle: value as any })}
            ariaLabel="Button style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Size">
          <InspectorSelect
            value={block.size ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "small", label: "Small" },
              { value: "large", label: "Large" },
            ]}
            onChange={(value) => update({ size: value as any })}
            ariaLabel="Button size"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Alignment">
          <InspectorSelect
            value={(block as any).buttonAlign ?? block.textAlign ?? "left"}
            options={[
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
            onChange={(value) => update({ buttonAlign: value, textAlign: value } as any)}
            ariaLabel="Button alignment"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
