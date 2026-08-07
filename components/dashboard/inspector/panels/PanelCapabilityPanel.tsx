"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import TypographyRoleSettingsPanel from "@/components/dashboard/inspector/panels/TypographyRoleSettingsPanel";
import { UIKIT_PANEL_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import ButtonPresentationFields from "@/components/dashboard/inspector/panels/ButtonPresentationFields";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea, InspectorAlignmentControl, InspectorMediaPlacementControl } from "@/components/dashboard/inspector/InspectorControls";
import { ImageSettingsGroup, CardSettingsGroup, MediaSettingsGroup, ActionSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => void;
};

const legacyPanelFields = {
  panelStyle: undefined,
  cardPreset: undefined,
  premiumCardStyle: undefined,
  borderRadius: undefined,
  elementBackgroundMode: undefined,
  elementBackground: undefined,
  elementPadding: undefined,
  hoverPreset: undefined,
  cardStyle: undefined,
} satisfies Partial<BuilderLayoutBlock>;

const selectOptions = <T extends string>(values: readonly T[], labels?: Partial<Record<T, string>>) =>
  values.map((value) => ({ value, label: labels?.[value] ?? value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

export default function PanelCapabilityPanel({ block, tab, shellSettings, update, openWordPressMediaPicker }: Props) {
  const updateSemantic = (patch: Partial<BuilderLayoutBlock>) => update({ ...legacyPanelFields, ...patch });
  const properties = UIKIT_PANEL_CAPABILITY.properties;

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-content">
        <section className="builder-inspector-section">
          <h3>Content</h3>
          <p className="builder-inspector-help">Content belongs to this Panel instance. Visual surface styling comes from Global Card styles.</p>
          <InspectorFieldRow label="Image source">
            <BuilderImageUrlControl
              value={block.imageUrl ?? ""}
              onChange={(event) => updateSemantic({ imageUrl: event.target.value })}
              onChoose={() => openWordPressMediaPicker?.({
                title: "Panel image",
                currentUrl: block.imageUrl,
                onSelect: (media) => updateSemantic({
                  imageUrl: media.sourceUrl,
                  imageAlt: block.imageAlt || media.altText || media.title || "",
                }),
              })}
            />
          </InspectorFieldRow>
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
          <InspectorFieldRow label="Action target"><InspectorSelect value={(block.buttonTarget ?? "_self") as "_self" | "_blank"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(value) => updateSemantic({ buttonTarget: value })} ariaLabel="Action target" /></InspectorFieldRow>
        </section>
      </div>
    );
  }

  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-layout">
        <MediaSettingsGroup block={block} update={updateSemantic} />
        <section className="builder-inspector-section" data-uikit-capability="panel-content-layout">
          <h3>Content layout</h3>
          <InspectorFieldRow label="Text alignment"><InspectorAlignmentControl value={(block.panelTextAlign ?? "left") as "left" | "center" | "right"} onChange={(value) => updateSemantic({ panelTextAlign: value })} ariaLabel="Text alignment" /></InspectorFieldRow>
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
        <CardSettingsGroup
          block={block}
          update={updateSemantic}
          title="CARD PRESENTATION"
          keys={{
            variant: "panelVariant",
            size: "panelSize",
            hover: "panelHover",
          }}
        />
        <TypographyRoleSettingsPanel block={block} fields={[{ field: "titleTypographyRole", label: "Title role" }, { field: "contentTypographyRole", label: "Content role" }, { field: "metaTypographyRole", label: "Meta role" }]} update={update} />
        <ActionSettingsGroup
          block={block}
          update={updateSemantic}
          title="ACTION BUTTON"
          showVisibilityToggle
          keys={{
            visible: "panelActionVisible",
            label: "buttonLabel",
            url: "buttonUrl",
            target: "buttonTarget",
            style: "panelActionStyle",
            size: "panelActionSize",
          }}
        />
      </div>
    );
  }

  if (tab === "advanced") return null;

  return null;
}
