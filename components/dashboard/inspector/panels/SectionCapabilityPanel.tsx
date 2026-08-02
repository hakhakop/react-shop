"use client";

import type { BuilderSection, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_CAPABILITIES } from "@/lib/uikitCapabilities";

type Props = {
  section: BuilderSection;
  tab: InspectorTab;
  update: (patch: Partial<BuilderSection>) => void;
};

export default function SectionCapabilityPanel({ section, tab, update }: Props) {
  if (tab === "layout") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-layout">
      <div className="builder-element-inspector-note"><strong>UIkit Section</strong><span>Semantic section settings map to UIkit section and container classes.</span></div>
      <label className="builder-field"><span>Variant</span><select value={section.sectionVariant ?? "default"} onChange={(e) => update({ sectionVariant: e.target.value as BuilderSection["sectionVariant"] })}>{UIKIT_CAPABILITIES.section.variants.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
      <label className="builder-field"><span>Container</span><select value={section.contentMode ?? "boxed"} onChange={(e) => update({ contentMode: e.target.value as BuilderSection["contentMode"] })}><option value="full">full</option><option value="boxed">default</option><option value="narrow">small</option></select></label>
      <label className="builder-field"><span>Height</span><select value={section.sectionHeight ?? "auto"} onChange={(e) => update({ sectionHeight: e.target.value as BuilderSection["sectionHeight"] })}><option value="auto">auto</option><option value="viewport">viewport</option><option value="viewport-80">viewport-80</option></select></label>
      <label className="builder-field"><span>Vertical alignment</span><select value={section.contentVerticalAlign ?? "top"} onChange={(e) => update({ contentVerticalAlign: e.target.value as BuilderSection["contentVerticalAlign"] })}><option value="top">top</option><option value="center">center</option><option value="bottom">bottom</option></select></label>
    </div>;
  }

  if (tab === "spacing") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-spacing">
      <div className="builder-element-inspector-note"><strong>UIkit Section spacing</strong><span>Padding uses semantic WebPages values and resolves to UIkit section classes.</span></div>
      <label className="builder-field"><span>Top padding</span><select value={section.topSpacing ?? "inherit"} onChange={(e) => update({ topSpacing: e.target.value })}><option value="inherit">inherit</option><option value="none">none</option><option value="sm">small</option><option value="md">medium</option><option value="lg">large</option></select></label>
      <label className="builder-field"><span>Bottom padding</span><select value={section.bottomSpacing ?? "inherit"} onChange={(e) => update({ bottomSpacing: e.target.value })}><option value="inherit">inherit</option><option value="none">none</option><option value="sm">small</option><option value="md">medium</option><option value="lg">large</option></select></label>
    </div>;
  }

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="section-advanced"><div className="builder-element-inspector-note"><strong>Section advanced settings</strong><span>Visibility, animation, anchor, and custom class behavior remain available through the shared advanced controls.</span></div></div>;
  }

  return <div className="builder-inspector-stack" data-uikit-capability="section-style"><div className="builder-element-inspector-note"><strong>Section appearance</strong><span>Use the UIkit variant in Layout. Legacy arbitrary background, radius, shadow, and duplicate appearance controls are not Section capabilities.</span></div></div>;
}
