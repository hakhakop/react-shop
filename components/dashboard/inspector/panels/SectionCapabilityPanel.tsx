"use client";

import type { BuilderSection, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_CAPABILITIES } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  section: BuilderSection;
  tab: InspectorTab;
  update: (patch: Partial<BuilderSection>) => void;
};

export default function SectionCapabilityPanel({ section, tab, update }: Props) {
  const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
  if (tab === "layout") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-layout">
      <div className="builder-element-inspector-note"><strong>UIkit Section</strong><span>Semantic section settings map to UIkit section and container classes.</span></div>
      <InspectorFieldRow label="Variant"><InspectorPillGroup value={section.sectionVariant ?? "default"} options={labels(UIKIT_CAPABILITIES.section.variants)} onChange={(value) => update({ sectionVariant: value })} ariaLabel="Section variant" /></InspectorFieldRow>
      <InspectorFieldRow label="Container"><InspectorPillGroup value={section.contentMode ?? "boxed"} options={[{ value: "full", label: "Expand" }, { value: "boxed", label: "Default" }, { value: "narrow", label: "Small" }]} onChange={(value) => update({ contentMode: value })} ariaLabel="Section container" /></InspectorFieldRow>
      <InspectorFieldRow label="Height"><InspectorSelect value={section.sectionHeight ?? "auto"} options={[{ value: "auto", label: "Auto" }, { value: "viewport", label: "Viewport" }, { value: "viewport-80", label: "Viewport 80%" }]} onChange={(value) => update({ sectionHeight: value })} ariaLabel="Section height" /></InspectorFieldRow>
      <InspectorFieldRow label="Vertical alignment"><InspectorPillGroup value={section.contentVerticalAlign ?? "top"} options={["top", "center", "bottom"].map((value) => ({ value, label: value[0].toUpperCase() + value.slice(1) }))} onChange={(value) => update({ contentVerticalAlign: value as BuilderSection["contentVerticalAlign"] })} ariaLabel="Section vertical alignment" /></InspectorFieldRow>
    </div>;
  }

  if (tab === "spacing") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-spacing">
      <div className="builder-element-inspector-note"><strong>UIkit Section spacing</strong><span>Padding uses semantic WebPages values and resolves to UIkit section classes.</span></div>
      <InspectorFieldRow label="Top padding"><InspectorSelect value={section.topSpacing ?? "inherit"} options={["inherit", "none", "sm", "md", "lg"].map((value) => ({ value, label: value === "sm" ? "Small" : value === "md" ? "Medium" : value === "lg" ? "Large" : value[0].toUpperCase() + value.slice(1) }))} onChange={(value) => update({ topSpacing: value })} ariaLabel="Top padding" /></InspectorFieldRow>
      <InspectorFieldRow label="Bottom padding"><InspectorSelect value={section.bottomSpacing ?? "inherit"} options={["inherit", "none", "sm", "md", "lg"].map((value) => ({ value, label: value === "sm" ? "Small" : value === "md" ? "Medium" : value === "lg" ? "Large" : value[0].toUpperCase() + value.slice(1) }))} onChange={(value) => update({ bottomSpacing: value })} ariaLabel="Bottom padding" /></InspectorFieldRow>
    </div>;
  }

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-advanced"><div className="builder-element-inspector-note"><strong>Section advanced settings</strong><span>Visibility, animation, anchor, and custom class behavior remain available through the shared advanced controls.</span></div></div>;
  }

  return <div className="builder-inspector-stack" data-uikit-capability="section-style"><div className="builder-element-inspector-note"><strong>Section appearance</strong><span>Section appearance follows the selected UIkit variant and shared global design settings.</span></div></div>;
}
