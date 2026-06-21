"use client";

import React from "react";
import { useGlobalStyles } from "../context/GlobalStylesContext";

export default function GlobalTypographyPanel() {
  const { design, updateDesign } = useGlobalStyles();

  return (
    <div className="builder-global-styles-group">
      {/* Live Typography Preview Card */}
      <div className="builder-typography-preview-card">
        <div className="builder-preview-label">Typography Preview</div>
        <div className="builder-preview-canvas">
          {/* Heading 1 Preview */}
          <div className="builder-preview-item">
            <span className="builder-preview-item-label">Heading 1 (H1)</span>
            <h1 style={{
              fontFamily: design.headingFontFamily ?? 'inherit',
              fontWeight: design.headingWeight ?? '700',
              lineHeight: design.headingLineHeight ?? '1.1',
              color: design.headingColor ?? design.textColor ?? '#f4f4f5',
            }}>
              Aa Bb Cc 123
            </h1>
          </div>

          {/* Heading 2 Preview */}
          <div className="builder-preview-item">
            <span className="builder-preview-item-label">Heading 2 (H2)</span>
            <h2 style={{
              fontFamily: design.headingFontFamily ?? 'inherit',
              fontWeight: design.headingWeight ?? '700',
              lineHeight: design.headingLineHeight ?? '1.1',
              color: design.headingColor ?? design.textColor ?? '#f4f4f5',
            }}>
              The Quick Brown Fox
            </h2>
          </div>

          {/* Body Paragraph Preview */}
          <div className="builder-preview-item">
            <span className="builder-preview-item-label">Body Paragraph</span>
            <p style={{
              color: design.textColor ?? '#e4e4e7',
            }}>
              Jumps over the lazy dog. Designers love typography preview features in visual builders.
            </p>
          </div>

          {/* Small Text & Link Text Preview */}
          <div className="builder-preview-footer">
            <div className="builder-preview-footer-left">
              <span className="builder-preview-item-label">Small Text</span>
              <span className="builder-preview-small-text" style={{ color: design.mutedTextColor ?? '#a1a1aa' }}>
                Storefront v1.0.3
              </span>
            </div>
            <div className="builder-preview-footer-right">
              <span className="builder-preview-item-label">Link Text</span>
              <a href="#" onClick={(e) => e.preventDefault()} style={{
                color: design.accentColor ?? '#6366f1',
              }}>
                View products →
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="builder-card-title" style={{ marginTop: "16px" }}>
        <strong>Typography Settings</strong>
        <span>headings & defaults</span>
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
          <div className="builder-swatch-color-preview-wrapper">
            <span
              className="builder-swatch-color-preview"
              style={{
                backgroundColor: design.headingColor ?? design.textColor ?? "#111111"
              }}
            />
            <span className="builder-swatch-color-value">
              {design.headingColor ?? design.textColor ?? "#111111"}
            </span>
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
          </div>
        </label>

        <button
          type="button"
          className="builder-secondary-button builder-typography-reset"
          style={{ height: "32px", alignSelf: "end", fontSize: "11px", minHeight: "32px", padding: "0 8px" }}
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
