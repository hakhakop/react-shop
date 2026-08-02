"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import { resolveTypographyInput, updateTypographyArea, type TypographySettings } from "@/lib/builderTypography";
import { UIKIT_TEXT_CAPABILITY } from "@/lib/uikitCapabilities";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function TextCapabilityPanel({ block, tab, update }: Props) {
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
        <div className="builder-element-inspector-note"><strong>UIkit Text</strong><span>Semantic values map to UIkit text helpers in builder and frontend.</span></div>
        <label className="builder-field"><span>Variant</span><select value={block.textVariant ?? "default"} onChange={(event) => update({ textVariant: event.target.value as BuilderLayoutBlock["textVariant"] })}>{properties.variant.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="builder-field"><span>Alignment</span><select value={block.textAlign ?? "left"} onChange={(event) => update({ textAlign: event.target.value as BuilderLayoutBlock["textAlign"] })}>{properties.alignment.values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      </div>
    );
  }

  if (tab === "typography") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="text-typography">
        <div className="builder-element-inspector-note"><strong>Complementary typography</strong><span>Font size and generic typography variants remain UIkit-owned and are not duplicated here.</span></div>
        <label className="builder-field"><span>Font family</span><input value={typography.fontFamily ?? ""} placeholder="inherit" onChange={(event) => updateTypography({ fontFamily: event.target.value || undefined })} /></label>
        <div className="builder-two-column"><label className="builder-field"><span>Font weight</span><select value={String(typography.fontWeight ?? "")} onChange={(event) => updateTypography({ fontWeight: event.target.value || undefined })}><option value="">inherit</option>{[400, 500, 600, 700, 800].map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label className="builder-field"><span>Line height</span><input value={typography.lineHeight ?? ""} placeholder="inherit" onChange={(event) => updateTypography({ lineHeight: event.target.value || undefined })} /></label></div>
        <div className="builder-two-column"><label className="builder-field"><span>Letter spacing</span><input value={typography.letterSpacing ?? ""} placeholder="inherit" onChange={(event) => updateTypography({ letterSpacing: event.target.value || undefined })} /></label><label className="builder-field"><span>Text color</span><input type="color" value={typography.color?.startsWith("#") ? typography.color : "#111827"} onChange={(event) => updateTypography({ color: event.target.value })} /></label></div>
        <div className="builder-two-column"><label className="builder-field"><span>Text transform</span><select value={typography.textTransform ?? "none"} onChange={(event) => updateTypography({ textTransform: event.target.value as TypographySettings["textTransform"] })}><option value="none">none</option><option value="uppercase">uppercase</option><option value="lowercase">lowercase</option><option value="capitalize">capitalize</option></select></label><label className="builder-field"><span>Text decoration</span><select value={typography.textDecoration ?? "none"} onChange={(event) => updateTypography({ textDecoration: event.target.value as TypographySettings["textDecoration"] })}><option value="none">none</option><option value="underline">underline</option><option value="line-through">line-through</option></select></label></div>
      </div>
    );
  }

  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="text-advanced"><div className="builder-element-inspector-note"><strong>Text advanced settings</strong><span>Visibility, animation, and custom class behavior remain available through shared document controls.</span></div></div>;
  return null;
}
