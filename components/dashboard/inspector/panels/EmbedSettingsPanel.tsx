"use client";

import React from "react";
import { useInspector } from "../../context/InspectorContext";
import type { EmbedMode } from "@/components/dashboard/builderTypes";

export default function EmbedSettingsPanel() {
  const {
    selectedLayoutBlock,
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
          <strong>Embed Settings</strong>
        </div>

        <label className="builder-field">
          <span>Block Title</span>
          <input
            value={block.title ?? ""}
            onChange={(event) => handleUpdate({ title: event.target.value })}
            placeholder="Embed block label..."
          />
        </label>

        <label className="builder-field">
          <span>Embed Mode</span>
          <select
            value={block.embedMode ?? "code"}
            onChange={(event) =>
              handleUpdate({ embedMode: event.target.value as EmbedMode })
            }
          >
            <option value="code">Custom HTML / Script</option>
            <option value="iframe">Iframe URL</option>
          </select>
        </label>

        {block.embedMode === "iframe" ? (
          <label className="builder-field">
            <span>Iframe URL</span>
            <input
              value={block.embedUrl ?? ""}
              placeholder="https://example.com/embed"
              onChange={(event) => handleUpdate({ embedUrl: event.target.value })}
            />
          </label>
        ) : (
          <label className="builder-field">
            <span>HTML / Script</span>
            <textarea
              rows={6}
              value={block.embedCode ?? ""}
              placeholder="<div>Custom HTML content here...</div>"
              onChange={(event) => handleUpdate({ embedCode: event.target.value })}
              style={{ fontFamily: "monospace", fontSize: "11px" }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
