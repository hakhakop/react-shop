"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { UIKIT_TEXT_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorDivision, InspectorAlignmentControl, InspectorSwitch, inspectorDynamicBinding } from "@/components/dashboard/inspector/InspectorControls";
import type { BuilderShellSettings } from "@/lib/builderShell";
import TypographyRoleSettingsPanel from "@/components/dashboard/inspector/panels/TypographyRoleSettingsPanel";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";

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
        <InspectorFieldRow label="Content" dynamicBinding={inspectorDynamicBinding(block, update, "body")}>
          <RichTextEditor value={block.body ?? ""} onChange={(body) => update({ body })} placeholder="Write your text..." minHeight="180px" />
        </InspectorFieldRow>
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
            label="Color"
            isOverridden={block.textColor !== undefined}
            inheritedValueText="None"
            onReset={() => update({ textColor: undefined })}
          >
            <InspectorSelect
              value={block.textColor ?? "none"}
              options={labels(["none", "muted", "emphasis", "primary", "secondary", "success", "warning", "danger"] as const)}
              onChange={(value) => update({ textColor: value === "none" ? undefined : value as any })}
              ariaLabel="Text color"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Alignment"
            isOverridden={block.textAlign !== undefined}
            inheritedValueText="Left"
            onReset={() => update({ textAlign: undefined })}
          >
            <InspectorAlignmentControl
              value={block.textAlign ?? "left"}
              onChange={(value) => update({ textAlign: value })}
              ariaLabel="Text alignment"
            />
          </InspectorFieldRow>
        </InspectorDivision>
        <InspectorDivision title="TEXT">
          <InspectorFieldRow label="Drop Cap" isOverridden={block.textDropcap !== undefined} inheritedValueText="Off" onReset={() => update({ textDropcap: undefined })}>
            <InspectorSwitch checked={Boolean(block.textDropcap)} onChange={(checked) => update({ textDropcap: checked || undefined })} label="Enable drop cap" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Columns" isOverridden={block.textColumns !== undefined} inheritedValueText="None" onReset={() => update({ textColumns: undefined, textColumnDivider: undefined, textColumnBreakpoint: undefined })}>
            <InspectorSelect value={block.textColumns ?? "none"} options={labels(["none", "1-2", "1-3", "1-4", "1-5", "1-6"] as const)} onChange={(value) => update({ textColumns: value === "none" ? undefined : value as any })} ariaLabel="Text columns" />
          </InspectorFieldRow>
          {(block.textColumns ?? "none") !== "none" && <>
            <InspectorFieldRow label="Dividers" isOverridden={block.textColumnDivider !== undefined} inheritedValueText="Off" onReset={() => update({ textColumnDivider: undefined })}>
              <InspectorSwitch checked={Boolean(block.textColumnDivider)} onChange={(checked) => update({ textColumnDivider: checked || undefined })} label="Show dividers" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Columns Breakpoint" isOverridden={block.textColumnBreakpoint !== undefined} inheritedValueText="Medium" onReset={() => update({ textColumnBreakpoint: undefined })}>
              <InspectorSelect value={block.textColumnBreakpoint ?? "medium"} options={labels(["always", "small", "medium", "large", "xlarge"] as const)} onChange={(value) => update({ textColumnBreakpoint: value as any })} ariaLabel="Text columns breakpoint" />
            </InspectorFieldRow>
          </>}
          <InspectorFieldRow label="HTML Element" isOverridden={block.textHtmlElement !== undefined} inheritedValueText="Div" onReset={() => update({ textHtmlElement: undefined })}>
            <InspectorSelect value={block.textHtmlElement ?? "div"} options={labels(["div", "address", "aside", "footer"] as const)} onChange={(value) => update({ textHtmlElement: value === "div" ? undefined : value as any })} ariaLabel="Text HTML element" />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }


  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="text-advanced"><DynamicContentInspectorGroup item={block} update={update} /></div>;
  return null;
}
