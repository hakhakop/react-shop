"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_HEADING_CAPABILITY } from "@/lib/uikitCapabilities";
import { resolveTypographyInput, updateTypographyArea, type TypographySettings } from "@/lib/builderTypography";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const gradientPresets = UIKIT_HEADING_CAPABILITY.properties.gradient.values;

export default function HeadingCapabilityPanel({ block, tab, update }: Props) {
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
        <label className="builder-field"><span>Heading Text</span><input value={block.headingText ?? ""} onChange={(event) => update({ headingText: event.target.value })} /></label>
        <label className="builder-field"><span>Semantic level</span><select value={block.headingLevel ?? "h2"} onChange={(event) => update({ headingLevel: event.target.value as BuilderLayoutBlock["headingLevel"] })}>{UIKIT_HEADING_CAPABILITY.properties.level.values.map((value) => <option key={value} value={value}>{value.toUpperCase()}</option>)}</select></label>
      </div>
    );
  }

  if (tab === "style") {
    const gradient = block.textGradientPreset ?? "none";
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-style">
        <div className="builder-element-inspector-note"><strong>UIkit Heading</strong><span>Semantic visual presets map to UIkit heading classes in builder and frontend.</span></div>
        <label className="builder-field"><span>Visual Preset</span><select value={block.headingSize ?? "medium"} onChange={(event) => update({ headingSize: event.target.value as BuilderLayoutBlock["headingSize"] })}>{UIKIT_HEADING_CAPABILITY.properties.visualPreset.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="builder-field"><span>Alignment</span><select value={block.headingAlign ?? "left"} onChange={(event) => update({ headingAlign: event.target.value as BuilderLayoutBlock["headingAlign"] })}>{UIKIT_HEADING_CAPABILITY.properties.alignment.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="builder-field"><span>Gradient preset</span><select value={gradient} onChange={(event) => update({ textGradientPreset: event.target.value as BuilderLayoutBlock["textGradientPreset"] })}>{gradientPresets.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        {gradient === "custom" && <div className="builder-two-column">
          <label className="builder-field"><span>Start color</span><input type="color" value={block.textGradientCustomStart ?? "#ffffff"} onChange={(event) => update({ textGradientCustomStart: event.target.value })} /></label>
          <label className="builder-field"><span>End color</span><input type="color" value={block.textGradientCustomEnd ?? "#c084fc"} onChange={(event) => update({ textGradientCustomEnd: event.target.value })} /></label>
          <label className="builder-field"><span>Angle</span><input type="number" min={0} max={360} value={block.textGradientCustomAngle ?? 135} onChange={(event) => update({ textGradientCustomAngle: Number(event.target.value) })} /></label>
        </div>}
        <label className="builder-check"><input type="checkbox" checked={block.typewriterEnabled ?? false} onChange={(event) => update({ typewriterEnabled: event.target.checked })} /><span>Enable typewriter</span></label>
        {block.typewriterEnabled && <>
          <label className="builder-field"><span>Typewriter phrases</span><textarea value={(block.typewriterPhrases ?? []).join("\n")} onChange={(event) => update({ typewriterPhrases: event.target.value.split("\n").map((value) => value.trim()).filter(Boolean) })} /></label>
          <div className="builder-two-column"><label className="builder-field"><span>Speed</span><input type="number" min={10} value={block.typewriterSpeed ?? 80} onChange={(event) => update({ typewriterSpeed: Number(event.target.value) })} /></label><label className="builder-field"><span>Delay</span><input type="number" min={0} value={block.typewriterDelay ?? 1200} onChange={(event) => update({ typewriterDelay: Number(event.target.value) })} /></label></div>
          <label className="builder-check"><input type="checkbox" checked={block.typewriterLoop ?? true} onChange={(event) => update({ typewriterLoop: event.target.checked })} /><span>Loop phrases</span></label>
        </>}
      </div>
    );
  }

  if (tab === "typography") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-typography">
        <div className="builder-element-inspector-note"><strong>Complementary typography</strong><span>These controls complement the UIkit visual preset; font size and typography variants are intentionally absent.</span></div>
        <label className="builder-field"><span>Font family</span><input value={typography.fontFamily ?? ""} placeholder="inherit" onChange={(event) => updateTypography({ fontFamily: event.target.value || undefined })} /></label>
        <div className="builder-two-column"><label className="builder-field"><span>Font weight</span><select value={String(typography.fontWeight ?? "")} onChange={(event) => updateTypography({ fontWeight: event.target.value || undefined })}><option value="">inherit</option>{[400, 500, 600, 700, 800].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="builder-field"><span>Line height</span><input value={typography.lineHeight ?? ""} placeholder="inherit" onChange={(event) => updateTypography({ lineHeight: event.target.value || undefined })} /></label></div>
        <div className="builder-two-column"><label className="builder-field"><span>Letter spacing</span><input value={typography.letterSpacing ?? ""} placeholder="inherit" onChange={(event) => updateTypography({ letterSpacing: event.target.value || undefined })} /></label><label className="builder-field"><span>Text color</span><input type="color" value={typography.color?.startsWith("#") ? typography.color : "#111827"} onChange={(event) => updateTypography({ color: event.target.value })} /></label></div>
        <div className="builder-two-column"><label className="builder-field"><span>Text transform</span><select value={typography.textTransform ?? "none"} onChange={(event) => updateTypography({ textTransform: event.target.value as TypographySettings["textTransform"] })}><option value="none">none</option><option value="uppercase">uppercase</option><option value="lowercase">lowercase</option><option value="capitalize">capitalize</option></select></label><label className="builder-field"><span>Text decoration</span><select value={typography.textDecoration ?? "none"} onChange={(event) => updateTypography({ textDecoration: event.target.value as TypographySettings["textDecoration"] })}><option value="none">none</option><option value="underline">underline</option><option value="line-through">line-through</option></select></label></div>
        <label className="builder-field"><span>Text shadow</span><input value={typography.textShadow ?? ""} placeholder="none or CSS shadow" onChange={(event) => updateTypography({ textShadow: event.target.value || undefined })} /></label>
      </div>
    );
  }

  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="heading-advanced"><div className="builder-element-inspector-note"><strong>Heading advanced settings</strong><span>Visibility, animation, and custom class behavior remain available through shared advanced document controls.</span></div></div>;
  return null;
}
