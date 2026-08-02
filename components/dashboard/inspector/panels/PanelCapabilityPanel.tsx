"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { UIKIT_CAPABILITIES } from "@/lib/uikitCapabilities";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const legacyPanelFields = {
  panelStyle: undefined,
  cardPreset: undefined,
  premiumCardStyle: undefined,
  borderRadius: undefined,
  elementBackgroundMode: undefined,
  elementBackground: undefined,
  elementPadding: undefined,
  visualStyle: undefined,
  hoverPreset: undefined,
  cardStyle: undefined,
} satisfies Partial<BuilderLayoutBlock>;

export default function PanelCapabilityPanel({ block, tab, update }: Props) {
  const clearLegacy = () => update(legacyPanelFields);
  const updateSemantic = (patch: Partial<BuilderLayoutBlock>) =>
    update({ ...legacyPanelFields, ...patch });
  const variants = UIKIT_CAPABILITIES.panel.variants;

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-content">
        <div className="builder-element-inspector-note">
          <strong>WebPages content</strong>
          <span>Panel content and media remain owned by WebPages.</span>
        </div>
        <label className="builder-field"><span>Image URL</span><input value={block.imageUrl ?? ""} onChange={(e) => updateSemantic({ imageUrl: e.target.value })} /></label>
        <label className="builder-field"><span>Image Alt</span><input value={block.imageAlt ?? ""} onChange={(e) => updateSemantic({ imageAlt: e.target.value })} /></label>
        <label className="builder-field"><span>Eyebrow</span><input value={block.eyebrow ?? ""} onChange={(e) => updateSemantic({ eyebrow: e.target.value })} /></label>
        <label className="builder-field"><span>Title</span><input value={block.title ?? ""} onChange={(e) => updateSemantic({ title: e.target.value })} /></label>
        <label className="builder-field"><span>Body</span><textarea value={block.body ?? ""} onChange={(e) => updateSemantic({ body: e.target.value })} /></label>
        <label className="builder-field"><span>Action label</span><input value={block.buttonLabel ?? ""} onChange={(e) => updateSemantic({ buttonLabel: e.target.value })} /></label>
        <label className="builder-field"><span>Action URL</span><input value={block.buttonUrl ?? ""} onChange={(e) => updateSemantic({ buttonUrl: e.target.value })} /></label>
        <label className="builder-field"><span>Action target</span><select value={block.buttonTarget ?? "_self"} onChange={(e) => updateSemantic({ buttonTarget: e.target.value as "_self" | "_blank" })}><option value="_self">Same tab</option><option value="_blank">New tab</option></select></label>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-style">
        <div className="builder-element-inspector-note"><strong>UIkit Card / Panel</strong><span>Semantic values map to shared UIkit card classes.</span></div>
        <label className="builder-field"><span>Variant</span><select value={block.panelVariant ?? "default"} onChange={(e) => updateSemantic({ panelVariant: e.target.value as BuilderLayoutBlock["panelVariant"] })}>{variants.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>
        <label className="builder-field"><span>Size / padding</span><select value={block.panelSize ?? "default"} onChange={(e) => updateSemantic({ panelSize: e.target.value as BuilderLayoutBlock["panelSize"] })}><option value="small">small</option><option value="default">default</option><option value="large">large</option></select></label>
        <label className="builder-check"><input type="checkbox" checked={block.panelHover === true} onChange={(e) => updateSemantic({ panelHover: e.target.checked })} /><span>Hover card</span></label>
        <div className="builder-element-inspector-note"><strong>Unsupported legacy ownership removed</strong><span>Custom colors, radius, borders, shadows, typography, arbitrary padding, and premium presets are not Panel controls.</span></div>
        <button type="button" className="builder-secondary-button" onClick={clearLegacy}>Clear legacy Panel fields</button>
      </div>
    );
  }

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="panel-advanced"><div className="builder-element-inspector-note"><strong>Panel advanced settings</strong><span>Visibility, animation, and custom classes remain in the shared Advanced tab.</span></div></div>;
  }

  return null;
}
