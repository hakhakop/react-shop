"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_HEADING_CAPABILITY } from "@/lib/uikitCapabilities";
import { resolveTypographyInput, updateTypographyArea, type TypographySettings } from "@/lib/builderTypography";
import { InspectorColorField, InspectorFieldRow, InspectorNumberUnit, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";
import GeneralSettingsPanel from "@/components/dashboard/inspector/panels/GeneralSettingsPanel";
import type { BuilderShellSettings } from "@/lib/builderShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const gradientPresets = UIKIT_HEADING_CAPABILITY.properties.gradient.values;
const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

export default function HeadingCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const typography = resolveTypographyInput(block.typography, "title") ?? {};
  const updateTypography = (patch: Partial<TypographySettings>) => {
    update({
      typography: updateTypographyArea(block.typography, "title", {
        ...typography,
        ...patch,
      }),
    });
  };

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
        <GeneralSettingsPanel block={block} shellSettings={shellSettings} tab={tab} update={update} />
        <div className="builder-element-inspector-note"><strong>UIkit Heading</strong><span>Semantic visual presets map to UIkit heading classes in builder and frontend.</span></div>
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

  if (tab === "typography") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-typography">
        <div className="builder-element-inspector-note"><strong>Complementary typography</strong><span>These controls complement the UIkit visual preset; font size and typography variants are intentionally absent.</span></div>
        <InspectorFieldRow label="Font family"><InspectorTextField value={typography.fontFamily ?? ""} placeholder="inherit" onChange={(value) => updateTypography({ fontFamily: value || undefined })} ariaLabel="Heading font family" /></InspectorFieldRow>
        <div className="builder-two-column"><InspectorFieldRow label="Font weight"><InspectorSelect value={String(typography.fontWeight ?? "")} options={[{ value: "", label: "Inherit" }, ...[400, 500, 600, 700, 800].map((value) => ({ value: String(value), label: String(value) }))]} onChange={(value) => updateTypography({ fontWeight: value || undefined })} ariaLabel="Heading font weight" /></InspectorFieldRow><InspectorFieldRow label="Line height"><InspectorTextField value={typography.lineHeight ?? ""} placeholder="inherit" onChange={(value) => updateTypography({ lineHeight: value || undefined })} ariaLabel="Heading line height" /></InspectorFieldRow></div>
        <div className="builder-two-column"><InspectorFieldRow label="Letter spacing"><InspectorTextField value={typography.letterSpacing ?? ""} placeholder="inherit" onChange={(value) => updateTypography({ letterSpacing: value || undefined })} ariaLabel="Heading letter spacing" /></InspectorFieldRow><InspectorFieldRow label="Text color"><InspectorColorField value={typography.color?.startsWith("#") ? typography.color : "#111827"} onChange={(value) => updateTypography({ color: value })} ariaLabel="Heading text color" /></InspectorFieldRow></div>
        <div className="builder-two-column"><InspectorFieldRow label="Text transform"><InspectorSelect value={typography.textTransform ?? "none"} options={["none", "uppercase", "lowercase", "capitalize"].map((value) => ({ value, label: value }))} onChange={(value) => updateTypography({ textTransform: value as TypographySettings["textTransform"] })} ariaLabel="Heading text transform" /></InspectorFieldRow><InspectorFieldRow label="Text decoration"><InspectorSelect value={typography.textDecoration ?? "none"} options={["none", "underline", "line-through"].map((value) => ({ value, label: value }))} onChange={(value) => updateTypography({ textDecoration: value as TypographySettings["textDecoration"] })} ariaLabel="Heading text decoration" /></InspectorFieldRow></div>
        <InspectorFieldRow label="Text shadow"><InspectorTextField value={typography.textShadow ?? ""} placeholder="none or CSS shadow" onChange={(value) => updateTypography({ textShadow: value || undefined })} ariaLabel="Heading text shadow" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="heading-advanced"><div className="builder-element-inspector-note"><strong>Heading advanced settings</strong><span>Visibility, animation, and custom class behavior remain available through shared advanced document controls.</span></div></div>;
  return null;
}
