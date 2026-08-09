"use client";

import type { InspectorTab, BuilderLayoutBlock, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { BuilderImageUrlControl } from "./InspectorSharedControls";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorTextField,
  InspectorTextarea,
  InspectorSelect,
} from "@/components/dashboard/inspector/InspectorControls";
import { ImageSettingsGroup } from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import type { BuilderShellSettings } from "@/lib/builderShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker: (options: { title: string; currentUrl?: string; onSelect: (media: WordPressMediaItem) => void }) => void;
};

export default function ImageCapabilityPanel({ block, tab, shellSettings, update, openWordPressMediaPicker }: Props) {
  const image = block;

  // CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-content">
        <InspectorDivision title="IMAGE">
          <InspectorFieldRow label="Image source">
            <BuilderImageUrlControl
              value={image.imageUrl ?? ""}
              onChange={(event) => update({ imageUrl: event.target.value })}
              onChoose={() =>
                openWordPressMediaPicker({
                  title: "Image Block",
                  currentUrl: image.imageUrl ?? undefined,
                  onSelect: (media) =>
                    update({
                      imageUrl: media.sourceUrl,
                      imageAlt: image.imageAlt || media.altText || media.title || "",
                    }),
                })
              }
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Alt text">
            <InspectorTextField
              value={image.imageAlt ?? ""}
              onChange={(value) => update({ imageAlt: value })}
              ariaLabel="Image Alt Text"
            />
          </InspectorFieldRow>
          <div className="builder-two-column" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <InspectorFieldRow label="Width">
              <InspectorTextField
                value={String(image.imageWidth ?? "")}
                placeholder="auto"
                onChange={(value) => update({ imageWidth: value || undefined })}
                ariaLabel="Image width"
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Height">
              <InspectorTextField
                value={String(image.imageHeight ?? "")}
                placeholder="auto"
                onChange={(value) => update({ imageHeight: value || undefined })}
                ariaLabel="Image height"
              />
            </InspectorFieldRow>
          </div>
          <InspectorFieldRow label="Caption">
            <InspectorTextField
              value={image.imageCaption ?? ""}
              onChange={(value) => update({ imageCaption: value })}
              placeholder="Optional caption"
              ariaLabel="Image Caption"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="LINK">
          <InspectorFieldRow label="Link URL">
            <InspectorTextField
              value={image.imageLinkUrl ?? ""}
              onChange={(value) => update({ imageLinkUrl: value })}
              placeholder="Optional link"
              ariaLabel="Image Link URL"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Link Target">
            <InspectorSelect
              value={(image.imageLinkTarget ?? "_self") as "_self" | "_blank"}
              options={BUILDER_LINK_TARGET_OPTIONS}
              onChange={(value) => update({ imageLinkTarget: value })}
              ariaLabel="Image link target"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="image-advanced">
        <InspectorDivision title="ADVANCED">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={(block as any).customId ?? block.id ?? ""}
              onChange={(v) => update({ customId: v, id: v } as any)}
              placeholder="e.g. hero-image"
              ariaLabel="Custom ID"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={(block as any).customClass ?? ""}
              onChange={(v) => update({ customClass: v } as any)}
              placeholder="e.g. my-custom-image"
              ariaLabel="Custom Class"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Attributes">
            <InspectorTextField
              value={(block as any).customAttributes ?? ""}
              onChange={(v) => update({ customAttributes: v } as any)}
              placeholder='data-custom="value"'
              ariaLabel="Custom Attributes"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Custom CSS">
            <InspectorTextarea
              value={(block as any).customCss ?? ""}
              onChange={(v) => update({ customCss: v } as any)}
              placeholder="/* CSS rules */"
              ariaLabel="Custom CSS"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="image-style">
      <ImageSettingsGroup block={block} update={update} showDimensions={false} showFrameControls={false} />
    </div>
  );
}
