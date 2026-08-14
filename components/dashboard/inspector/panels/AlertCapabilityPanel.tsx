"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
  inspectorDynamicBinding,
} from "@/components/dashboard/inspector/InspectorControls";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import DynamicContentInspectorGroup from "@/components/dashboard/inspector/panels/DynamicContentInspectorGroup";

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
          <InspectorFieldRow label="Title" dynamicBinding={inspectorDynamicBinding(block, update, "title")}>
            <InspectorTextField
              value={rawBlock.title ?? ""}
              onChange={(v) => update({ title: v } as any)}
              placeholder="Alert Title"
              ariaLabel="Alert Title"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Content" dynamicBinding={inspectorDynamicBinding(block, update, "body")}>
            <RichTextEditor
              value={rawBlock.body ?? rawBlock.content ?? ""}
              onChange={(v) => update({ body: v, content: v } as any)}
              placeholder="Alert message content..."
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link URL" dynamicBinding={inspectorDynamicBinding(block, update, "alertLinkUrl")}><InspectorTextField value={rawBlock.alertLinkUrl ?? ""} onChange={(v) => update({ alertLinkUrl: v } as any)} ariaLabel="Alert Link URL" /></InspectorFieldRow>
          <InspectorFieldRow label="Target"><InspectorSelect value={rawBlock.alertLinkTarget ?? "_self"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(v) => update({ alertLinkTarget: v } as any)} ariaLabel="Alert Link Target" /></InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="alert-advanced"><DynamicContentInspectorGroup item={block} update={update} /><ElementAdvancedPanel block={block} update={update} /></div>;
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="alert-style">
      <InspectorDivision title="ALERT">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={rawBlock.alertStyle ?? rawBlock.status ?? rawBlock.preset ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "primary", label: "Primary" },
              { value: "success", label: "Success" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger / Error" },
            ]}
            onChange={(v) => update({ alertStyle: v } as any)}
            ariaLabel="Alert style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Larger padding">
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={rawBlock.alertLarge === true}
              onChange={(e) => update({ alertLarge: e.target.checked } as any)}
            />
            <span>Larger padding</span>
          </label>
        </InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="TITLE">
        <InspectorFieldRow label="Style"><InspectorSelect value={rawBlock.alertTitleStyle ?? ""} options={[{ value: "", label: "None" }, ...["text-bold", "small", "h1", "h2", "h3", "h4", "h5", "h6"].map((value) => ({ value, label: value.replace(/-/g, " ") }))]} onChange={(v) => update({ alertTitleStyle: v || undefined } as any)} ariaLabel="Alert title style" /></InspectorFieldRow>
        <InspectorFieldRow label="HTML Element"><InspectorSelect value={rawBlock.alertTitleElement ?? "h3"} options={["h1", "h2", "h3", "h4", "h5", "h6", "div"].map((value) => ({ value, label: value }))} onChange={(v) => update({ alertTitleElement: v } as any)} ariaLabel="Alert title HTML Element" /></InspectorFieldRow>
        <InspectorFieldRow label="Inline title"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={rawBlock.alertTitleInline === true} onChange={(e) => update({ alertTitleInline: e.target.checked } as any)} /><span>Inline title</span></label></InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="CONTENT">
        <InspectorFieldRow label="Style"><InspectorSelect value={rawBlock.alertContentStyle ?? ""} options={[{ value: "", label: "None" }, { value: "lead", label: "Lead" }, { value: "meta", label: "Meta" }]} onChange={(v) => update({ alertContentStyle: v || undefined } as any)} ariaLabel="Alert content style" /></InspectorFieldRow>
        <InspectorFieldRow label="Margin Top"><InspectorSelect value={rawBlock.alertContentMargin ?? ""} options={[{ value: "", label: "Default" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "none", label: "None" }]} onChange={(v) => update({ alertContentMargin: v || undefined } as any)} ariaLabel="Alert content margin top" /></InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
