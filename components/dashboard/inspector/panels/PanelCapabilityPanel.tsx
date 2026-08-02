"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { UIKIT_PANEL_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";

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

const selectOptions = <T extends string>(values: readonly T[], labels?: Partial<Record<T, string>>) =>
  values.map((value) => ({ value, label: labels?.[value] ?? value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

export default function PanelCapabilityPanel({ block, tab, update }: Props) {
  const updateSemantic = (patch: Partial<BuilderLayoutBlock>) => update({ ...legacyPanelFields, ...patch });
  const properties = UIKIT_PANEL_CAPABILITY.properties;

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-content">
        <section className="builder-inspector-section">
          <h3>Content</h3>
          <p className="builder-inspector-help">Content belongs to this Panel instance. Visual surface styling comes from Global Card styles.</p>
          <InspectorFieldRow label="Image source"><InspectorTextField value={block.imageUrl ?? ""} onChange={(value) => updateSemantic({ imageUrl: value })} ariaLabel="Panel image source" /></InspectorFieldRow>
          <InspectorFieldRow label="Alt text"><InspectorTextField value={block.imageAlt ?? ""} onChange={(value) => updateSemantic({ imageAlt: value })} ariaLabel="Panel image alt text" /></InspectorFieldRow>
          <InspectorFieldRow label="Eyebrow"><InspectorTextField value={block.eyebrow ?? ""} onChange={(value) => updateSemantic({ eyebrow: value })} ariaLabel="Panel eyebrow" /></InspectorFieldRow>
          <InspectorFieldRow label="Title"><InspectorTextField value={block.title ?? ""} onChange={(value) => updateSemantic({ title: value })} ariaLabel="Panel title" /></InspectorFieldRow>
          <InspectorFieldRow label="Body"><InspectorTextarea value={block.body ?? ""} onChange={(value) => updateSemantic({ body: value })} ariaLabel="Panel body" /></InspectorFieldRow>
        </section>
        <section className="builder-inspector-section" data-uikit-capability="panel-action">
          <h3>Action</h3>
          <InspectorFieldRow label="Show action"><InspectorSwitch checked={block.panelActionVisible !== false} onChange={(checked) => updateSemantic({ panelActionVisible: checked })} label="Show action" /></InspectorFieldRow>
          <InspectorFieldRow label="Action label"><InspectorTextField value={block.buttonLabel ?? ""} onChange={(value) => updateSemantic({ buttonLabel: value })} ariaLabel="Action label" /></InspectorFieldRow>
          <InspectorFieldRow label="Action URL"><InspectorTextField value={block.buttonUrl ?? ""} onChange={(value) => updateSemantic({ buttonUrl: value })} ariaLabel="Action URL" /></InspectorFieldRow>
          <InspectorFieldRow label="Action target"><InspectorSelect value={(block.buttonTarget ?? "_self") as "_self" | "_blank"} options={[{ value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" }]} onChange={(value) => updateSemantic({ buttonTarget: value })} ariaLabel="Action target" /></InspectorFieldRow>
        </section>
      </div>
    );
  }

  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-layout">
        <section className="builder-inspector-section" data-uikit-capability="panel-media">
          <h3>Media</h3>
          <InspectorFieldRow label="Show media"><InspectorSwitch checked={block.panelShowMedia !== false} onChange={(checked) => updateSemantic({ panelShowMedia: checked })} label="Show media" /></InspectorFieldRow>
          <InspectorFieldRow label="Placement"><InspectorPillGroup value={(block.panelMediaPlacement ?? "top") as typeof properties.mediaPlacement.values[number]} options={selectOptions(properties.mediaPlacement.values, { top: "Top", left: "Left", right: "Right" })} onChange={(value) => updateSemantic({ panelMediaPlacement: value })} ariaLabel="Media placement" /></InspectorFieldRow>
          <InspectorFieldRow label="Aspect ratio"><InspectorSelect value={(block.imageRatio ?? "natural") as BuilderLayoutBlock["imageRatio"]} options={selectOptions(properties.mediaRatio.values)} onChange={(value) => updateSemantic({ imageRatio: value })} ariaLabel="Media aspect ratio" /></InspectorFieldRow>
          <InspectorFieldRow label="Fit"><InspectorPillGroup value={(block.panelMediaFit ?? "cover") as typeof properties.mediaFit.values[number]} options={selectOptions(properties.mediaFit.values, { cover: "Cover", contain: "Contain" })} onChange={(value) => updateSemantic({ panelMediaFit: value })} ariaLabel="Media fit" /></InspectorFieldRow>
          <InspectorFieldRow label="Side media width"><InspectorSelect value={(block.panelMediaWidth ?? "medium") as typeof properties.mediaWidth.values[number]} options={selectOptions(properties.mediaWidth.values)} onChange={(value) => updateSemantic({ panelMediaWidth: value })} ariaLabel="Side media width" /></InspectorFieldRow>
          <InspectorFieldRow label="Media alignment"><InspectorPillGroup value={(block.panelMediaAlignment ?? "center") as typeof properties.mediaAlignment.values[number]} options={selectOptions(properties.mediaAlignment.values)} onChange={(value) => updateSemantic({ panelMediaAlignment: value })} ariaLabel="Media alignment" /></InspectorFieldRow>
        </section>
        <section className="builder-inspector-section" data-uikit-capability="panel-content-layout">
          <h3>Content layout</h3>
          <InspectorFieldRow label="Text alignment"><InspectorPillGroup value={(block.panelTextAlign ?? "left") as typeof properties.textAlign.values[number]} options={selectOptions(properties.textAlign.values)} onChange={(value) => updateSemantic({ panelTextAlign: value })} ariaLabel="Text alignment" /></InspectorFieldRow>
          <InspectorFieldRow label="Vertical alignment"><InspectorSelect value={(block.panelVerticalAlign ?? "top") as typeof properties.verticalAlign.values[number]} options={selectOptions(properties.verticalAlign.values)} onChange={(value) => updateSemantic({ panelVerticalAlign: value })} ariaLabel="Vertical alignment" /></InspectorFieldRow>
          <InspectorFieldRow label="Title element"><InspectorSelect value={(block.panelTitleElement ?? "h3") as typeof properties.titleElement.values[number]} options={selectOptions(properties.titleElement.values)} onChange={(value) => updateSemantic({ panelTitleElement: value })} ariaLabel="Title element" /></InspectorFieldRow>
          <InspectorFieldRow label="Title visual style"><InspectorSelect value={(block.panelTitleStyle ?? "inherit") as typeof properties.titleStyle.values[number]} options={selectOptions(properties.titleStyle.values)} onChange={(value) => updateSemantic({ panelTitleStyle: value })} ariaLabel="Title visual style" /></InspectorFieldRow>
          <InspectorFieldRow label="Content width"><InspectorSelect value={(block.panelContentWidth ?? "auto") as typeof properties.contentWidth.values[number]} options={selectOptions(properties.contentWidth.values)} onChange={(value) => updateSemantic({ panelContentWidth: value })} ariaLabel="Content width" /></InspectorFieldRow>
        </section>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-style">
        <section className="builder-inspector-section">
          <h3>Styling</h3>
          <p className="builder-inspector-help">Global Card styles own colors, radius, borders, shadows, typography, and padding.</p>
          <InspectorFieldRow label="Variant"><InspectorPillGroup value={(block.panelVariant ?? "default") as BuilderLayoutBlock["panelVariant"]} options={selectOptions(properties.variant.values)} onChange={(value) => updateSemantic({ panelVariant: value })} ariaLabel="Panel variant" /></InspectorFieldRow>
          <InspectorFieldRow label="Size"><InspectorPillGroup value={(block.panelSize ?? "default") as BuilderLayoutBlock["panelSize"]} options={selectOptions(properties.size.values)} onChange={(value) => updateSemantic({ panelSize: value })} ariaLabel="Panel size" /></InspectorFieldRow>
          <InspectorFieldRow label="Hover card"><InspectorSwitch checked={block.panelHover === true} onChange={(checked) => updateSemantic({ panelHover: checked })} label="Hover card" /></InspectorFieldRow>
        </section>
      </div>
    );
  }

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="panel-advanced"><p className="builder-inspector-help">Visibility, animation, and custom classes remain in the shared Advanced controls.</p></div>;
  }

  return null;
}
