"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
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
import { UIKIT_YOOTHEME_SVG_COLOR_OPTIONS } from "@/lib/uikitTokens";

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

const PANEL_TEXT_STYLE_OPTIONS = [
  { value: "inherit", label: "None" },
  { value: "text-meta", label: "Text Meta" },
  { value: "text-lead", label: "Text Lead" },
  { value: "text-small", label: "Text Small" },
  { value: "text-large", label: "Text Large" },
  { value: "heading-3xlarge", label: "Heading 3X-Large" },
  { value: "heading-2xlarge", label: "Heading 2X-Large" },
  { value: "heading-xlarge", label: "Heading X-Large" },
  { value: "heading-large", label: "Heading Large" },
  { value: "heading-medium", label: "Heading Medium" },
  { value: "heading-small", label: "Heading Small" },
  { value: "heading-h1", label: "Heading H1" },
  { value: "heading-h2", label: "Heading H2" },
  { value: "heading-h3", label: "Heading H3" },
  { value: "heading-h4", label: "Heading H4" },
  { value: "heading-h5", label: "Heading H5" },
  { value: "heading-h6", label: "Heading H6" },
  { value: "link", label: "Link" },
];

const PANEL_HTML_ELEMENT_OPTIONS = ["h1", "h2", "h3", "h4", "h5", "h6", "div"];
const PANEL_META_STYLE_OPTIONS = PANEL_TEXT_STYLE_OPTIONS.filter(({ value }) => value !== "link");

export default function PanelCapabilityPanel({ block, tab, shellSettings, update, openWordPressMediaPicker }: Props) {
  const updateSemantic = (patch: Partial<BuilderLayoutBlock>) => update({ ...legacyPanelFields, ...patch });
  const dimensionValue = (value: unknown) => {
    const normalized = String(value ?? "").trim();
    return normalized.replace(/px$/i, "");
  };
  const updateDimension = (key: "imageWidth" | "imageHeight", value: string) => {
    const normalized = value.trim();
    updateSemantic({ [key]: !normalized || normalized === "auto" ? undefined : /^\d+(?:\.\d+)?$/.test(normalized) ? `${normalized}px` : normalized });
  };
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
          <div className="builder-two-column" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <InspectorFieldRow label="Width" isOverridden={block.imageWidth !== undefined} inheritedValueText="auto" onReset={() => updateSemantic({ imageWidth: undefined })}>
              <InspectorTextField value={dimensionValue(block.imageWidth)} placeholder="auto" onChange={(value) => updateDimension("imageWidth", value)} ariaLabel="Panel image width" />
            </InspectorFieldRow>
            <InspectorFieldRow label="Height" isOverridden={block.imageHeight !== undefined} inheritedValueText="auto" onReset={() => updateSemantic({ imageHeight: undefined })}>
              <InspectorTextField value={dimensionValue(block.imageHeight)} placeholder="auto" onChange={(value) => updateDimension("imageHeight", value)} ariaLabel="Panel image height" />
            </InspectorFieldRow>
          </div>
          <InspectorFieldRow label="Meta" dynamicBinding={inspectorDynamicBinding(block, update, "eyebrow")}><InspectorTextField value={block.eyebrow ?? ""} onChange={(value) => updateSemantic({ eyebrow: value })} ariaLabel="Panel meta" /></InspectorFieldRow>
          <InspectorFieldRow label="Title" dynamicBinding={inspectorDynamicBinding(block, update, "title")}><InspectorTextField value={block.title ?? ""} onChange={(value) => updateSemantic({ title: value })} ariaLabel="Panel title" /></InspectorFieldRow>
          <InspectorFieldRow label="Content" dynamicBinding={inspectorDynamicBinding(block, update, "body")}><InspectorTextarea value={block.body ?? ""} onChange={(value) => updateSemantic({ body: value })} ariaLabel="Panel content" /></InspectorFieldRow>
          <ActionSettingsGroup
            block={block}
            update={updateSemantic}
            title="LINK"
            terminology="link"
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
          showDecoration
          showColor
          showLink
          showMargin
          showPanelLayout
          keys={{ role: "titleTypographyRole", size: "panelTitleStyle", align: "panelTextAlign", level: "panelTitleElement", decoration: "titleDecoration", color: "titleColor", link: "linkTitle", margin: "titleMarginTop" }}
          defaultSize="inherit"
          defaultLevel="h3"
          visualPresetOptions={PANEL_TEXT_STYLE_OPTIONS}
        />
        <MetaSettingsGroup
          block={block}
          update={updateSemantic}
          showAlignment={false}
          showRole={false}
          showColor
          showStyle
          showHtmlElement
          showPosition
          showMargin
          positionLabel="Alignment"
          styleOptions={PANEL_META_STYLE_OPTIONS}
          htmlElementOptions={PANEL_HTML_ELEMENT_OPTIONS}
          keys={{ role: "metaTypographyRole", align: "panelTextAlign", level: "panelMetaHtmlElement", style: "metaStyle", color: "metaColor", position: "panelMetaPosition", margin: "metaMarginTop" }}
        />
        <ContentSettingsGroup
          block={block}
          update={updateSemantic}
          showAlignment={false}
          showStyle
          styleOptions={PANEL_TEXT_STYLE_OPTIONS}
          keys={{ role: "contentTypographyRole", align: "panelTextAlign" }}
        />
        <ImageSettingsGroup
          block={block}
          update={updateSemantic}
          showDimensions={false}
          showFrameControls={false}
          showAlignment={false}
          loadingCheckbox
          showLinkImage
          showTransition
          showHoverShadow
          showInverse
          showSvgControls
          showSvgAnimate
          showSvgColorWhenInlineDisabled
          svgColorLabel="SVG Color"
          svgColorOptions={UIKIT_YOOTHEME_SVG_COLOR_OPTIONS}
          showTextColor
          mediaLayout={{
            placement: "panelMediaPlacement",
            width: "panelMediaWidth",
            verticalAlign: "panelVerticalAlign",
            alignmentOptions: ["top", "bottom", "left", "right", "between"],
            widthOptions: [
              { value: "auto", label: "Auto" },
              { value: "4-5", label: "80%" },
              { value: "3-4", label: "75%" },
              { value: "2-3", label: "66%" },
              { value: "1-3", label: "33%" },
              { value: "1-4", label: "25%" },
              { value: "1-5", label: "20%" },
              { value: "2-5", label: "40%" },
              { value: "1-2", label: "50%" },
              { value: "3-5", label: "60%" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
              { value: "2xlarge", label: "2X-Large" },
            ],
          }}
          keys={{
            width: "imageWidth", height: "imageHeight", ratio: "imageRatio", fit: "imageFit",
            loading: "imageLoading", shape: "imageShape", shadow: "imageShadow",
            decoration: "imageBoxDecoration", align: "imageAlignment",
          }}
        />
      </div>
    );
  }

  if (tab === "advanced") return <div className="builder-inspector-stack" data-uikit-capability="panel-advanced" />;

  return null;
}
