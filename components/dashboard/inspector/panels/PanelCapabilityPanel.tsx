"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_PANEL_CAPABILITY } from "@/lib/uikitCapabilities";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import { InspectorFieldRow, InspectorSelect, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";
import { ImageSettingsGroup, CardSettingsGroup, MediaSettingsGroup, ActionSettingsGroup, ContentSettingsGroup, MetaSettingsGroup, TitleSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";

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
      </div>
    );
  }

  if (tab === "layout" || tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-settings">
        <MediaSettingsGroup block={block} update={updateSemantic} />
        <ImageSettingsGroup block={block} update={updateSemantic} />
        <TitleSettingsGroup
          block={block}
          update={updateSemantic}
          showDecoration={false}
          keys={{ role: "titleTypographyRole", size: "panelTitleStyle", align: "panelTextAlign", level: "panelTitleElement" }}
          defaultSize="inherit"
          defaultLevel="h3"
          visualPresetOptions={selectOptions(properties.titleStyle.values, { inherit: "Inherit", h3: "Heading H3", h4: "Heading H4", h5: "Heading H5" })}
        />
        <MetaSettingsGroup
          block={block}
          update={updateSemantic}
          showAlignment={false}
          showHtmlElement={false}
          keys={{ role: "metaTypographyRole", align: "panelTextAlign", level: "panelMetaHtmlElement" }}
        />
        <ContentSettingsGroup
          block={block}
          update={updateSemantic}
          showAlignment={false}
          keys={{ role: "contentTypographyRole", align: "panelTextAlign" }}
        />
        <section className="builder-inspector-section" data-uikit-capability="panel-content-layout">
          <h3>Content layout</h3>
          <InspectorFieldRow label="Vertical alignment"><InspectorSelect value={(block.panelVerticalAlign ?? "top") as typeof properties.verticalAlign.values[number]} options={selectOptions(properties.verticalAlign.values)} onChange={(value) => updateSemantic({ panelVerticalAlign: value })} ariaLabel="Vertical alignment" /></InspectorFieldRow>
          <InspectorFieldRow label="Content width"><InspectorSelect value={(block.panelContentWidth ?? "auto") as typeof properties.contentWidth.values[number]} options={selectOptions(properties.contentWidth.values)} onChange={(value) => updateSemantic({ panelContentWidth: value })} ariaLabel="Content width" /></InspectorFieldRow>
        </section>
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
