"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import { UIKIT_IMAGE_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { BuilderImageUrlControl } from "./InspectorSharedControls";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorTextField, InspectorAlignmentControl } from "@/components/dashboard/inspector/InspectorControls";
import { ImageSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import type { BuilderShellSettings } from "@/lib/builderShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void;
};

const legacyImageFields = {
  imageBorderRadius: undefined,
  imageMaxWidth: undefined,
  borderRadius: undefined,
} satisfies Partial<BuilderLayoutBlock>;

const labelFor = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replaceAll("-", " ");
const optionsFor = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: labelFor(value) }));

export default function ImageCapabilityPanel({ block, tab, shellSettings, update, openWordPressMediaPicker }: Props) {
  const updateSemantic = (patch: Partial<BuilderLayoutBlock>) => update({ ...legacyImageFields, ...patch });
  const image = block;

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-content">
        <div className="builder-element-inspector-note">
          <strong>WebPages image content</strong>
          <span>Media, accessibility text, captions, and links remain document-owned.</span>
        </div>
        <InspectorFieldRow label="Image source">
          <BuilderImageUrlControl
            value={image.imageUrl ?? ""}
            onChange={(event) => updateSemantic({ imageUrl: event.target.value })}
            onChoose={() => openWordPressMediaPicker({
              title: "Image Block",
              currentUrl: image.imageUrl ?? undefined,
              onSelect: (media) => updateSemantic({
                imageUrl: media.sourceUrl,
                imageAlt: image.imageAlt || media.altText || media.title || "",
              }),
            })}
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Alt text"><InspectorTextField value={image.imageAlt ?? ""} onChange={(value) => updateSemantic({ imageAlt: value })} /></InspectorFieldRow>
        <InspectorFieldRow label="Caption"><InspectorTextField value={image.imageCaption ?? ""} onChange={(value) => updateSemantic({ imageCaption: value })} placeholder="Optional caption" /></InspectorFieldRow>
        <InspectorFieldRow label="Link URL"><InspectorTextField value={image.imageLinkUrl ?? ""} onChange={(value) => updateSemantic({ imageLinkUrl: value })} placeholder="Optional link" /></InspectorFieldRow>
        <InspectorFieldRow label="Link target"><InspectorSelect value={(image.imageLinkTarget ?? "_self") as "_self" | "_blank"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(value) => updateSemantic({ imageLinkTarget: value })} ariaLabel="Image link target" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-style">
        <div className="builder-element-inspector-note">
          <strong>UIkit Image</strong>
          <span>Semantic presentation settings map to shared UIkit classes and attributes.</span>
        </div>
        <ImageSettingsGroup block={block} update={updateSemantic} />
      </div>
    );
  }

  if (tab === "behavior") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-behavior">
        <InspectorFieldRow label="Loading"><InspectorSelect value={(image.imageLoading ?? "lazy") as BuilderLayoutBlock["imageLoading"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.loading.values)} onChange={(value) => updateSemantic({ imageLoading: value })} ariaLabel="Image loading" /></InspectorFieldRow>
        <div className="builder-element-inspector-note"><strong>Lightbox</strong><span>Not yet supported for normal Image blocks.</span></div>
      </div>
    );
  }

  if (tab === "advanced") return null;

  return null;
}
