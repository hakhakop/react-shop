"use client";

import type { BuilderSection, BuilderShellSettings, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_CAPABILITIES } from "@/lib/uikitCapabilities";
import SpacingControl from "@/components/dashboard/style/SpacingControl";
import type { BuilderSpacingSides } from "@/lib/builderVisualStyle";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect } from "@/components/dashboard/inspector/InspectorControls";
import AnimationControl from "@/components/dashboard/style/AnimationControl";
import BorderEffectsControl from "@/components/dashboard/style/BorderEffectsControl";

type Props = {
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
  tab: InspectorTab;
  update: (patch: Partial<BuilderSection>) => void;
};

export default function SectionCapabilityPanel({ section, shellSettings, tab, update }: Props) {
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
    const spacingFields = [
      { field: "topSpacing" as const, label: "Top padding", side: "top" as const, inherited: shellSettings.sectionPaddingTop },
      { field: "bottomSpacing" as const, label: "Bottom padding", side: "bottom" as const, inherited: shellSettings.sectionPaddingBottom },
    ];

    return <div className="builder-inspector-stack" data-uikit-capability="section-spacing">
      <div className="builder-element-inspector-note"><strong>UIkit Section spacing</strong><span>Padding uses semantic WebPages values and resolves to UIkit section classes.</span></div>
      <div className="builder-two-column">
        {spacingFields.map(({ field, label, side, inherited }) => (
          <SpacingControl
            key={field}
            id={`section-spacing-${field}`}
            label={label}
            sides={[side]}
            value={section[field] === undefined ? undefined : ({ [side]: section[field], linked: false } as BuilderSpacingSides)}
            inheritedValue={{ [side]: inherited } as BuilderSpacingSides}
            context="sectionPadding"
            onChange={(value) => update({ [field]: value[side] ?? "inherit" })}
          />
        ))}
      </div>
    </div>;
  }

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-advanced"><div className="builder-element-inspector-note"><strong>Section advanced settings</strong><span>Animation uses the shared WebPages motion control and renderer contract.</span></div><AnimationControl value={section.animation} onChange={(animation) => update({ animation })} allowPause allowScrub /></div>;
  }

  return <div className="builder-inspector-stack" data-uikit-capability="section-style"><div className="builder-element-inspector-note"><strong>Section appearance</strong><span>Section appearance follows the selected UIkit variant and shared global design settings.</span></div><BorderEffectsControl visibility={section.visualStyle?.visibility} onVisibilityChange={(visibility) => update({ visualStyle: { ...(section.visualStyle ?? {}), visibility } })} showBorder={false} showEffects={false} showLayout={false} showCustomClass={false} /></div>;
}
