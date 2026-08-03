"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { resolveTypographyInput, updateTypographyArea, type TypographySettings } from "@/lib/builderTypography";
import { UIKIT_TEXT_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorColorField, InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";
import GeneralSettingsPanel from "@/components/dashboard/inspector/panels/GeneralSettingsPanel";
import type { BuilderShellSettings } from "@/lib/builderShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function TextCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
  const typography = resolveTypographyInput(block.typography, "body") ?? {};
  const updateTypography = (patch: Partial<TypographySettings>) =>
    update({ typography: updateTypographyArea(block.typography, "body", { ...typography, ...patch }) });

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
        <GeneralSettingsPanel block={block} shellSettings={shellSettings} tab={tab} update={update} />
        <div className="builder-element-inspector-note"><strong>UIkit Text</strong><span>Semantic values map to UIkit text helpers in builder and frontend.</span></div>
        <InspectorFieldRow label="Variant"><InspectorPillGroup value={block.textVariant ?? "default"} options={labels(properties.variant.values)} onChange={(value) => update({ textVariant: value })} ariaLabel="Text variant" /></InspectorFieldRow>
        <InspectorFieldRow label="Alignment"><InspectorPillGroup value={block.textAlign ?? "left"} options={labels(properties.alignment.values)} onChange={(value) => update({ textAlign: value })} ariaLabel="Text alignment" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "typography") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="text-typography">
        <div className="builder-element-inspector-note"><strong>Complementary typography</strong><span>Font size and generic typography variants remain UIkit-owned and are not duplicated here.</span></div>
        <InspectorFieldRow label="Font family"><InspectorTextField value={typography.fontFamily ?? ""} placeholder="inherit" onChange={(value) => updateTypography({ fontFamily: value || undefined })} ariaLabel="Text font family" /></InspectorFieldRow>
        <div className="builder-two-column"><InspectorFieldRow label="Font weight"><InspectorSelect value={String(typography.fontWeight ?? "")} options={[{ value: "", label: "Inherit" }, ...[400, 500, 600, 700, 800].map((value) => ({ value: String(value), label: String(value) }))]} onChange={(value) => updateTypography({ fontWeight: value || undefined })} ariaLabel="Text font weight" /></InspectorFieldRow><InspectorFieldRow label="Line height"><InspectorTextField value={typography.lineHeight ?? ""} placeholder="inherit" onChange={(value) => updateTypography({ lineHeight: value || undefined })} ariaLabel="Text line height" /></InspectorFieldRow></div>
        <div className="builder-two-column"><InspectorFieldRow label="Letter spacing"><InspectorTextField value={typography.letterSpacing ?? ""} placeholder="inherit" onChange={(value) => updateTypography({ letterSpacing: value || undefined })} ariaLabel="Text letter spacing" /></InspectorFieldRow><InspectorFieldRow label="Text color"><InspectorColorField value={typography.color?.startsWith("#") ? typography.color : "#111827"} onChange={(value) => updateTypography({ color: value })} ariaLabel="Text color" /></InspectorFieldRow></div>
        <div className="builder-two-column"><InspectorFieldRow label="Text transform"><InspectorSelect value={typography.textTransform ?? "none"} options={["none", "uppercase", "lowercase", "capitalize"].map((value) => ({ value, label: value }))} onChange={(value) => updateTypography({ textTransform: value as TypographySettings["textTransform"] })} ariaLabel="Text transform" /></InspectorFieldRow><InspectorFieldRow label="Text decoration"><InspectorSelect value={typography.textDecoration ?? "none"} options={["none", "underline", "line-through"].map((value) => ({ value, label: value }))} onChange={(value) => updateTypography({ textDecoration: value as TypographySettings["textDecoration"] })} ariaLabel="Text decoration" /></InspectorFieldRow></div>
      </div>
    );
  }

  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="text-advanced"><div className="builder-element-inspector-note"><strong>Text advanced settings</strong><span>Visibility, animation, and custom class behavior remain available through shared document controls.</span></div></div>;
  return null;
}
