"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { UIKIT_TEXT_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorDivision } from "@/components/dashboard/inspector/InspectorControls";
import type { BuilderShellSettings } from "@/lib/builderShell";
import TypographyRoleSettingsPanel from "@/components/dashboard/inspector/panels/TypographyRoleSettingsPanel";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function TextCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="text-content">
        <div className="builder-element-inspector-note"><strong>Rich text content</strong><span>WebPages owns the semantic HTML and inline formatting.</span></div>
        <RichTextEditor value={block.body ?? ""} onChange={(body) => update({ body })} placeholder="Write your text..." minHeight="180px" />
      </div>
    );
  }

  if (tab === "style") {
    const properties = UIKIT_TEXT_CAPABILITY.properties;
    return (
      <div className="builder-inspector-stack" data-uikit-capability="text-style">
        <div className="builder-element-inspector-note"><strong>UIkit Text</strong><span>Semantic values map to UIkit text helpers in builder and frontend.</span></div>
        <InspectorDivision title="TYPOGRAPHY">
          <TypographyRoleSettingsPanel block={block} fields={[{ field: "textTypographyRole", label: "Font role" }]} update={update} noSection />
          <InspectorFieldRow
            label="Variant"
            isOverridden={block.textVariant !== undefined}
            inheritedValueText="Default"
            onReset={() => update({ textVariant: undefined })}
          >
            <InspectorPillGroup
              value={block.textVariant ?? "default"}
              options={labels(properties.variant.values)}
              onChange={(value) => update({ textVariant: value })}
              ariaLabel="Text variant"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Alignment"
            isOverridden={block.textAlign !== undefined}
            inheritedValueText="Left"
            onReset={() => update({ textAlign: undefined })}
          >
            <InspectorPillGroup
              value={block.textAlign ?? "left"}
              options={labels(properties.alignment.values)}
              onChange={(value) => update({ textAlign: value })}
              ariaLabel="Text alignment"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }


  if (tab === "advanced") return null;
  return null;
}
