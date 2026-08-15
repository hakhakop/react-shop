"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_PANEL_CAPABILITY } from "@/lib/uikitCapabilities";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import { InspectorFieldRow, InspectorTextField, InspectorTextarea, inspectorDynamicBinding } from "@/components/dashboard/inspector/InspectorControls";
import {
  ImageSettingsGroup,
  CardSettingsGroup,
  ActionSettingsGroup,
  ContentSettingsGroup,
  MetaSettingsGroup,
  TitleSettingsGroup,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";

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
          <InspectorFieldRow label="Image source" dynamicBinding={inspectorDynamicBinding(block, update, "imageUrl")}>
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
          <InspectorFieldRow label="Alt text" dynamicBinding={inspectorDynamicBinding(block, update, "imageAlt")}><InspectorTextField value={block.imageAlt ?? ""} onChange={(value) => updateSemantic({ imageAlt: value })} ariaLabel="Panel image alt text" /></InspectorFieldRow>
          <InspectorFieldRow label="Meta" dynamicBinding={inspectorDynamicBinding(block, update, "eyebrow")}><InspectorTextField value={block.eyebrow ?? ""} onChange={(value) => updateSemantic({ eyebrow: value })} ariaLabel="Panel meta" /></InspectorFieldRow>
          <InspectorFieldRow label="Title" dynamicBinding={inspectorDynamicBinding(block, update, "title")}><InspectorTextField value={block.title ?? ""} onChange={(value) => updateSemantic({ title: value })} ariaLabel="Panel title" /></InspectorFieldRow>
          <InspectorFieldRow label="Content" dynamicBinding={inspectorDynamicBinding(block, update, "body")}><InspectorTextarea value={block.body ?? ""} onChange={(value) => updateSemantic({ body: value })} ariaLabel="Panel content" /></InspectorFieldRow>
        </section>
      </div>
    );
  }

  if (tab === "layout" || tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="panel-settings">
        <CardSettingsGroup
          block={block}
          update={updateSemantic}
          title="PANEL"
          showLink
          linkFirst
          sizeLabel="Padding"
          hoverLabel="Add hover style"
          showHeight
          showImageNoPadding
          keys={{ variant: "panelVariant", size: "panelSize", hover: "panelHover", link: "linkPanel" }}
          surfaceOptions={[
            { value: "blank", label: "None" },
            { value: "default", label: "Card Default" },
            { value: "primary", label: "Card Primary" },
            { value: "secondary", label: "Card Secondary" },
            { value: "tile-default", label: "Tile Default" },
            { value: "tile-muted", label: "Tile Muted" },
            { value: "tile-primary", label: "Tile Primary" },
            { value: "tile-secondary", label: "Tile Secondary" },
          ]}
          defaultSize="none"
          sizeOptions={[
            { value: "none", label: "None" },
            { value: "small", label: "Small" },
            { value: "default", label: "Default" },
            { value: "large", label: "Large" },
          ]}
        />
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
          showPosition
          positionLabel="Alignment"
          keys={{ role: "metaTypographyRole", align: "panelTextAlign", level: "panelMetaHtmlElement", position: "panelMetaPosition" }}
        />
        <ContentSettingsGroup
          block={block}
          update={updateSemantic}
          showAlignment={false}
          keys={{ role: "contentTypographyRole", align: "panelTextAlign" }}
        />
        <ImageSettingsGroup
          block={block}
          update={updateSemantic}
          showDimensions={false}
          showFrameControls={false}
          showAlignment={false}
          mediaLayout={{ placement: "panelMediaPlacement", width: "panelMediaWidth" }}
          keys={{
            width: "imageWidth", height: "imageHeight", ratio: "imageRatio", fit: "imageFit",
            loading: "imageLoading", shape: "imageShape", shadow: "imageShadow",
            decoration: "imageBoxDecoration", align: "imageAlignment",
          }}
        />
        <ActionSettingsGroup
          block={block}
          update={updateSemantic}
          title="LINK"
          showFullWidth
          showMargin
          keys={{
            visible: "panelActionVisible",
            label: "buttonLabel",
            url: "buttonUrl",
            target: "buttonTarget",
            style: "panelActionStyle",
            size: "panelActionSize",
            width: "fullWidthButton",
            margin: "linkMarginTop",
          }}
          dynamicContext={block.dynamicContext}
          dynamicBindings={block.dynamicBindings}
          onDynamicBindingChange={inspectorDynamicBinding(block, update, "buttonLabel").onChange}
        />
      </div>
    );
  }

  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="panel-advanced" />;

  return null;
}
