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
  InspectorAlignmentControl,
} from "@/components/dashboard/inspector/InspectorControls";
import IconPicker from "@/components/dashboard/inspector/IconPicker";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function IconCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const rawBlock = block as any;

  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="icon-content">
        <InspectorDivision title="ICON">
          <InspectorFieldRow label="Icon">
            <IconPicker
              value={rawBlock.iconName ?? rawBlock.icon}
              onChange={(value) => update({ iconName: value, icon: value } as any)}
              onClear={() => update({ iconName: undefined, icon: undefined } as any)}
              ariaLabel="Select icon"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="LINK">
          <InspectorFieldRow label="Link URL">
            <InspectorTextField
              value={rawBlock.buttonUrl ?? rawBlock.imageLinkUrl ?? ""}
              onChange={(v) => update({ buttonUrl: v, imageLinkUrl: v } as any)}
              placeholder="Optional link"
              ariaLabel="Icon Link URL"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link Target">
            <InspectorSelect
              value={rawBlock.buttonTarget ?? rawBlock.imageLinkTarget ?? "_self"}
              options={BUILDER_LINK_TARGET_OPTIONS}
              onChange={(v) => update({ buttonTarget: v, imageLinkTarget: v } as any)}
              ariaLabel="Icon Link Target"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="icon-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={rawBlock.customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. main-icon"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={rawBlock.customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-icon"
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
    <div className="builder-inspector-stack" data-uikit-capability="icon-style">
      <InspectorDivision title="ICON">
        <InspectorFieldRow label="Color">
          <InspectorSelect
            value={rawBlock.iconColorScheme ?? "primary"}
            options={[
              { value: "default", label: "Default" },
              { value: "muted", label: "Muted" },
              { value: "emphasis", label: "Emphasis" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger" },
            ]}
            onChange={(v) => update({ iconColorScheme: v } as any)}
            ariaLabel="Icon Color"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Size">
          <InspectorSelect
            value={String(rawBlock.iconSize ?? 32)}
            options={[16, 24, 32, 48, 64, 80, 96].map((size) => ({
              value: String(size),
              label: `${size}px`,
            }))}
            onChange={(v) => update({ iconSize: Number(v) } as any)}
            ariaLabel="Icon Size"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Alignment">
          <InspectorAlignmentControl
            value={rawBlock.textAlign ?? "left"}
            onChange={(v) => update({ textAlign: v } as any)}
            ariaLabel="Icon Alignment"
          />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
