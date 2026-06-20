"use client";

import React from "react";
import { useGlobalStyles } from "../context/GlobalStylesContext";

export default function GlobalTypographyPanel() {
  const { design, updateDesign } = useGlobalStyles();

  return (
    <div className="builder-global-styles-group">
      <div className="builder-card-title">
        <strong>Typography</strong>
        <span>headings</span>
      </div>

      <label className="builder-field">
        <span>Heading Font</span>
        <select
          value={design.headingFontFamily ?? "inherit"}
          onChange={(event) =>
            updateDesign({
              headingFontFamily: event.target.value,
              preset: undefined,
            })
          }
        >
          <option value="inherit">Website font</option>
          <option value='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'>
            System sans
          </option>
          <option value="Georgia, serif">Classic serif</option>
          <option value='"Times New Roman", serif'>Times serif</option>
          <option value='"Courier New", monospace'>Monospace</option>
        </select>
      </label>

      <label className="builder-field">
        <span>Heading Size</span>
        <select
          value={
            design.headingSize ?? "clamp(42px, 8vw, 126px)"
          }
          onChange={(event) =>
            updateDesign({
              headingSize: event.target.value,
              preset: undefined,
            })
          }
        >
          <option value="clamp(32px, 5vw, 76px)">Compact</option>
          <option value="clamp(42px, 8vw, 126px)">Display</option>
          <option value="clamp(52px, 9vw, 144px)">Large</option>
        </select>
      </label>

      <div className="builder-two-column">
        <label className="builder-field">
          <span>Weight</span>
          <select
            value={design.headingWeight ?? "760"}
            onChange={(event) =>
              updateDesign({
                headingWeight: event.target.value,
                preset: undefined,
              })
            }
          >
            <option value="500">Medium</option>
            <option value="600">Semibold</option>
            <option value="700">Bold</option>
            <option value="760">Heavy</option>
          </select>
        </label>

        <label className="builder-field">
          <span>Line Height</span>
          <select
            value={design.headingLineHeight ?? "0.92"}
            onChange={(event) =>
              updateDesign({
                headingLineHeight: event.target.value,
                preset: undefined,
              })
            }
          >
            <option value="0.88">Tight</option>
            <option value="0.92">Display</option>
            <option value="1">Balanced</option>
            <option value="1.1">Relaxed</option>
          </select>
        </label>
      </div>

      <div className="builder-two-column">
        <label className="builder-swatch-field">
          <span>Heading Color</span>
          <input
            type="color"
            value={
              design.headingColor ??
              design.textColor ??
              "#111111"
            }
            onChange={(event) =>
              updateDesign({
                headingColor: event.target.value,
                preset: undefined,
              })
            }
          />
        </label>

        <button
          type="button"
          className="builder-secondary-button builder-typography-reset"
          onClick={() =>
            updateDesign({
              headingColor: undefined,
              preset: undefined,
            })
          }
        >
          Use section color
        </button>
      </div>
    </div>
  );
}
