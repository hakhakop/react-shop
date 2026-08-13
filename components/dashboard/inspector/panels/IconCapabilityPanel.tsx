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
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";

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
              onClear={() => update({ iconName: "", icon: "" } as any)}
              ariaLabel="Select icon"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="LINK">
          <InspectorFieldRow label="Link URL">
            <InspectorTextField
              value={rawBlock.iconLinkUrl ?? rawBlock.buttonUrl ?? rawBlock.imageLinkUrl ?? ""}
              onChange={(v) => update({ iconLinkUrl: v } as any)}
              placeholder="Optional link"
              ariaLabel="Icon Link URL"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link Target">
            <InspectorSelect
              value={rawBlock.iconLinkTarget ?? rawBlock.buttonTarget ?? rawBlock.imageLinkTarget ?? "_self"}
              options={BUILDER_LINK_TARGET_OPTIONS}
              onChange={(v) => update({ iconLinkTarget: v } as any)}
              ariaLabel="Icon Link Target"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="ARIA Label"><InspectorTextField value={rawBlock.iconLinkAriaLabel ?? ""} onChange={(v) => update({ iconLinkAriaLabel: v } as any)} ariaLabel="Icon Link ARIA Label" /></InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return <ElementAdvancedPanel block={block} update={update} />;
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="icon-style">
      <InspectorDivision title="ICON">
        <InspectorFieldRow label="Color">
          <InspectorSelect
            value={rawBlock.iconColorScheme ?? "default"}
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
        <InspectorFieldRow label="Icon Width">
          <InspectorSelect
            value={String(rawBlock.iconSize ?? 32)}
            options={[16, 24, 32, 48, 64, 80, 96].map((size) => ({
              value: String(size),
              label: `${size}px`,
            }))}
            onChange={(v) => update({ iconSize: Number(v) } as any)}
            ariaLabel="Icon Width"
          />
        </InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="LINK">
        <InspectorFieldRow label="Style">
          <InspectorSelect value={rawBlock.iconLinkStyle ?? "icon"} options={[
            { value: "icon", label: "Icon Link" }, { value: "button", label: "Icon Button" },
            { value: "link", label: "Link" }, { value: "muted", label: "Link Muted" },
            { value: "text", label: "Link Text" }, { value: "reset", label: "Link Reset" },
          ]} onChange={(v) => update({ iconLinkStyle: v } as any)} ariaLabel="Icon Link Style" />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
