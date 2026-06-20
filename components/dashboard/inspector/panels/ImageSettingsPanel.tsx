"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import { BuilderImageUrlControl } from "./InspectorSharedControls";

export default function ImageSettingsPanel() {
  const {
    selectedLayoutBlock,
    openWordPressMediaPicker,
    getSelectedBlockIndices,
    updateSelectedLayoutBlock,
  } = useInspector();

  if (!selectedLayoutBlock) return null;

  const block = selectedLayoutBlock;
  const indices = getSelectedBlockIndices();
  if (!indices) return null;

  const { itemIndex, blockIndex } = indices;

  const handleUpdate = (patch: any) => {
    updateSelectedLayoutBlock(itemIndex, blockIndex, patch);
  };

  return (
    <div className="builder-inspector-stack">
      <div className="builder-inspector-section">
        <div className="builder-field-header" style={{ marginBottom: "10px" }}>
          <strong>Image Settings</strong>
        </div>

        <label className="builder-field">
          <span>Image Source</span>
          <BuilderImageUrlControl
            value={block.imageUrl ?? ""}
            onChange={(event) => handleUpdate({ imageUrl: event.target.value })}
            onChoose={() =>
              openWordPressMediaPicker({
                title: "Image Block",
                currentUrl: block.imageUrl,
                onSelect: (media) =>
                  handleUpdate({
                    imageUrl: media.sourceUrl,
                    imageAlt: block.imageAlt || media.altText || media.title,
                  }),
              })
            }
          />
        </label>

        <label className="builder-field">
          <span>Alt Text</span>
          <input
            value={block.imageAlt ?? ""}
            onChange={(event) => handleUpdate({ imageAlt: event.target.value })}
            placeholder="Describe the image..."
          />
        </label>

        <label className="builder-field">
          <span>Caption</span>
          <input
            value={block.imageCaption ?? ""}
            onChange={(event) => handleUpdate({ imageCaption: event.target.value })}
            placeholder="Optional image caption..."
          />
        </label>
      </div>
    </div>
  );
}
