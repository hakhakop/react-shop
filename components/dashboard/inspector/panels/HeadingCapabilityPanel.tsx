"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_HEADING_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorColorField, InspectorFieldRow, InspectorNumberUnit, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";
import type { BuilderShellSettings } from "@/lib/builderShell";
import TypographyRoleSettingsPanel from "@/components/dashboard/inspector/panels/TypographyRoleSettingsPanel";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const gradientPresets = UIKIT_HEADING_CAPABILITY.properties.gradient.values;
const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

export default function HeadingCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-content">
        <div className="builder-element-inspector-note"><strong>Heading content</strong><span>WebPages owns the text and semantic HTML level.</span></div>
        <InspectorFieldRow label="Heading text"><InspectorTextField value={block.headingText ?? ""} onChange={(value) => update({ headingText: value })} ariaLabel="Heading text" /></InspectorFieldRow>
        <InspectorFieldRow label="Semantic level"><InspectorSelect value={(block.headingLevel ?? "h2") as BuilderLayoutBlock["headingLevel"]} options={UIKIT_HEADING_CAPABILITY.properties.level.values.map((value) => ({ value, label: value.toUpperCase() }))} onChange={(value) => update({ headingLevel: value })} ariaLabel="Heading semantic level" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "style") {
    const gradient = block.textGradientPreset ?? "none";
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-style">
        <div className="builder-element-inspector-note"><strong>UIkit Heading</strong><span>Visual preset selects the UIkit heading style class. Semantic level controls the HTML heading element independently. Both paths are shared by builder and frontend.</span></div>
        <TypographyRoleSettingsPanel block={block} fields={[{ field: "headingTypographyRole", label: "Font role" }]} update={update} />
        <InspectorFieldRow label="Visual preset"><InspectorSelect value={(block.headingSize ?? "medium") as BuilderLayoutBlock["headingSize"]} options={labels(UIKIT_HEADING_CAPABILITY.properties.visualPreset.values)} onChange={(value) => update({ headingSize: value })} ariaLabel="Heading visual preset" /></InspectorFieldRow>
        <InspectorFieldRow label="Alignment"><InspectorPillGroup value={(block.headingAlign ?? "left") as BuilderLayoutBlock["headingAlign"]} options={labels(UIKIT_HEADING_CAPABILITY.properties.alignment.values)} onChange={(value) => update({ headingAlign: value })} ariaLabel="Heading alignment" /></InspectorFieldRow>
        <InspectorFieldRow label="Gradient preset"><InspectorSelect value={gradient} options={labels(gradientPresets)} onChange={(value) => update({ textGradientPreset: value })} ariaLabel="Gradient preset" /></InspectorFieldRow>
        {gradient === "custom" && <div className="builder-two-column">
          <InspectorFieldRow label="Start color"><InspectorColorField value={block.textGradientCustomStart ?? "#ffffff"} onChange={(value) => update({ textGradientCustomStart: value })} ariaLabel="Gradient start color" /></InspectorFieldRow>
          <InspectorFieldRow label="End color"><InspectorColorField value={block.textGradientCustomEnd ?? "#c084fc"} onChange={(value) => update({ textGradientCustomEnd: value })} ariaLabel="Gradient end color" /></InspectorFieldRow>
          <InspectorFieldRow label="Angle"><InspectorNumberUnit value={block.textGradientCustomAngle ?? 135} unit="deg" units={["deg"]} onValueChange={(value) => update({ textGradientCustomAngle: Number(value) })} onUnitChange={() => undefined} ariaLabel="Gradient angle" /></InspectorFieldRow>
        </div>}
        <InspectorFieldRow label="Typewriter"><InspectorSwitch checked={block.typewriterEnabled ?? false} onChange={(checked) => update({ typewriterEnabled: checked })} label="Enable typewriter" /></InspectorFieldRow>
        {block.typewriterEnabled && <>
          <InspectorFieldRow label="Typewriter phrases"><InspectorTextarea value={(block.typewriterPhrases ?? []).join("\n")} onChange={(value) => update({ typewriterPhrases: value.split("\n").map((entry) => entry.trim()).filter(Boolean) })} ariaLabel="Typewriter phrases" /></InspectorFieldRow>
          <div className="builder-two-column"><InspectorFieldRow label="Speed"><input className="inspector-control" type="number" min={10} value={block.typewriterSpeed ?? 80} onChange={(event) => update({ typewriterSpeed: Number(event.target.value) })} /></InspectorFieldRow><InspectorFieldRow label="Delay"><input className="inspector-control" type="number" min={0} value={block.typewriterDelay ?? 1200} onChange={(event) => update({ typewriterDelay: Number(event.target.value) })} /></InspectorFieldRow></div>
          <InspectorFieldRow label="Loop phrases"><InspectorSwitch checked={block.typewriterLoop ?? true} onChange={(checked) => update({ typewriterLoop: checked })} label="Loop phrases" /></InspectorFieldRow>
        </>}
      </div>
    );
  }

  if (tab === "advanced") return null;
  return null;
}
