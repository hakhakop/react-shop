"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import { UIKIT_IMAGE_CAPABILITY } from "@/lib/uikitCapabilities";
import { BuilderImageUrlControl } from "./InspectorSharedControls";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";
import GeneralSettingsPanel from "@/components/dashboard/inspector/panels/GeneralSettingsPanel";
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
        <InspectorFieldRow label="Link target"><InspectorSelect value={(image.imageLinkTarget ?? "_self") as "_self" | "_blank"} options={[{ value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" }]} onChange={(value) => updateSemantic({ imageLinkTarget: value })} ariaLabel="Image link target" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-style">
        <GeneralSettingsPanel block={block} shellSettings={shellSettings} tab={tab} update={update} />
        <div className="builder-element-inspector-note">
          <strong>UIkit Image</strong>
          <span>Semantic presentation settings map to shared UIkit classes and attributes.</span>
        </div>
        <InspectorFieldRow label="Fit"><InspectorPillGroup value={(image.imageFit ?? "cover") as BuilderLayoutBlock["imageFit"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.fit.values)} onChange={(value) => updateSemantic({ imageFit: value })} ariaLabel="Image fit" /></InspectorFieldRow>
        <InspectorFieldRow label="Aspect ratio"><InspectorSelect value={(image.imageRatio === "auto" ? "natural" : image.imageRatio ?? "natural") as BuilderLayoutBlock["imageRatio"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.ratio.values)} onChange={(value) => updateSemantic({ imageRatio: value })} ariaLabel="Image aspect ratio" /></InspectorFieldRow>
        <InspectorFieldRow label="Shape"><InspectorPillGroup value={(image.imageShape ?? (image.imageBorderRadius ? "rounded" : "none")) as BuilderLayoutBlock["imageShape"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.shape.values)} onChange={(value) => updateSemantic({ imageShape: value })} ariaLabel="Image shape" /></InspectorFieldRow>
        <InspectorFieldRow label="Shadow"><InspectorSelect value={(image.imageShadow ?? "none") as BuilderLayoutBlock["imageShadow"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.shadow.values)} onChange={(value) => updateSemantic({ imageShadow: value })} ariaLabel="Image shadow" /></InspectorFieldRow>
        <InspectorFieldRow label="Alignment"><InspectorPillGroup value={(image.imageAlignment ?? "center") as BuilderLayoutBlock["imageAlignment"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.alignment.values)} onChange={(value) => updateSemantic({ imageAlignment: value })} ariaLabel="Image alignment" /></InspectorFieldRow>
        <InspectorFieldRow label="Width"><InspectorSelect value={(image.imageWidth ?? "auto") as BuilderLayoutBlock["imageWidth"]} options={optionsFor(UIKIT_IMAGE_CAPABILITY.properties.width.values)} onChange={(value) => updateSemantic({ imageWidth: value })} ariaLabel="Image width" /></InspectorFieldRow>
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

  if (tab === "advanced") {
    return <div className="builder-inspector-stack" data-uikit-capability="image-advanced"><div className="builder-element-inspector-note"><strong>Image advanced settings</strong><span>Visibility, animation, and custom classes remain in the shared Advanced tab when supported.</span></div></div>;
  }

  return null;
}
