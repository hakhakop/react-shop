"use client";

import type { BuilderLayoutBlock, InspectorTab, WordPressMediaItem } from "@/components/dashboard/builderTypes";
import { UIKIT_HEADING_CAPABILITY } from "@/lib/uikitCapabilities";
import {
  InspectorColorField,
  InspectorFieldRow,
  InspectorNumberUnit,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextarea,
  InspectorTextField,
  InspectorDivision,
} from "@/components/dashboard/inspector/InspectorControls";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { Link, Image as ImageIcon } from "lucide-react";

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

const gradientPresets = UIKIT_HEADING_CAPABILITY.properties.gradient.values;
const labels = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    value,
    label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

export default function HeadingCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  // --------------------------------------------------------------------------
  // TAB 1: CONTENT (CONTENT & LINK SECTIONS)
  // --------------------------------------------------------------------------
  if (tab === "content") {
    const linkUrl = block.buttonUrl ?? block.imageLinkUrl ?? "";
    const isNewWindow = block.buttonTarget === "_blank" || block.imageLinkTarget === "_blank";

    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-content">
        <InspectorDivision title="CONTENT">
          <InspectorFieldRow label="Content">
            <InspectorTextarea
              value={block.headingText ?? block.title ?? ""}
              onChange={(value) => update({ headingText: value, title: value })}
              placeholder="Build Anything on DevStack"
              ariaLabel="Headline content"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="LINK">
          <InspectorFieldRow label="Link">
            <div style={{ display: "flex", gap: "6px", alignItems: "center", width: "100%" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <InspectorTextField
                  value={linkUrl}
                  onChange={(value) => update({ buttonUrl: value, imageLinkUrl: value })}
                  placeholder="http://"
                  ariaLabel="Headline link URL"
                />
              </div>
              {openWordPressMediaPicker && (
                <button
                  type="button"
                  className="builder-icon-button"
                  title="Pick link or media"
                  onClick={() =>
                    openWordPressMediaPicker({
                      title: "Select Link, Image or Video",
                      currentUrl: linkUrl,
                      onSelect: (media) => update({ buttonUrl: media.sourceUrl, imageLinkUrl: media.sourceUrl }),
                    })
                  }
                  style={{
                    padding: "6px 8px",
                    border: "1px solid var(--builder-ui-border, #d1d5db)",
                    borderRadius: "4px",
                    background: "var(--builder-ui-bg, #ffffff)",
                    cursor: "pointer",
                  }}
                >
                  <Link size={14} />
                </button>
              )}
            </div>
            <small style={{ color: "#6b7280", fontSize: "11px", marginTop: "4px", display: "block" }}>
              Enter or pick a link, an image or a video file.
            </small>
          </InspectorFieldRow>

          <InspectorFieldRow>
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={isNewWindow}
                onChange={(e) =>
                  update({
                    buttonTarget: e.target.checked ? "_blank" : "_self",
                    imageLinkTarget: e.target.checked ? "_blank" : "_self",
                  })
                }
              />
              <span>Open the link in a new window</span>
            </label>
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 2: SETTINGS / STYLE (TITLE SECTION & OPTIONAL GRADIENT/TYPEWRITER)
  // --------------------------------------------------------------------------
  if (tab === "style") {
    const headingStyleOptions = [
      { value: "none", label: "None" },
      { value: "heading-small", label: "Heading Small" },
      { value: "heading-medium", label: "Heading Medium" },
      { value: "heading-large", label: "Heading Large" },
      { value: "heading-xlarge", label: "Heading X-Large" },
      { value: "heading-2xlarge", label: "Heading 2X-Large" },
      { value: "hero", label: "Hero" },
      { value: "h1", label: "H1" },
      { value: "h2", label: "H2" },
      { value: "h3", label: "H3" },
      { value: "h4", label: "H4" },
      { value: "h5", label: "H5" },
      { value: "h6", label: "H6" },
    ];

    const decorationOptions = [
      { value: "none", label: "None" },
      { value: "divider", label: "Divider" },
      { value: "bullet", label: "Bullet" },
      { value: "line", label: "Line" },
    ];

    const fontFamilyOptions = [
      { value: "none", label: "None" },
      { value: "default", label: "Default" },
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
      { value: "tertiary", label: "Tertiary" },
    ];

    const colorOptions = [
      { value: "none", label: "None" },
      { value: "muted", label: "Muted" },
      { value: "emphasis", label: "Emphasis" },
      { value: "primary", label: "Primary" },
      { value: "secondary", label: "Secondary" },
      { value: "success", label: "Success" },
      { value: "warning", label: "Warning" },
      { value: "danger", label: "Danger" },
    ];

    const htmlElementOptions = [
      { value: "h1", label: "h1" },
      { value: "h2", label: "h2" },
      { value: "h3", label: "h3" },
      { value: "h4", label: "h4" },
      { value: "h5", label: "h5" },
      { value: "h6", label: "h6" },
      { value: "div", label: "div" },
    ];

    const gradient = block.textGradientPreset ?? "none";

    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-style">
        <InspectorDivision title="TITLE">
          <InspectorFieldRow
            label="Style"
            isOverridden={block.headingSize !== undefined && (block.headingSize as any) !== "heading-medium"}
            inheritedValueText="Heading Medium"
            onReset={() => update({ headingSize: undefined })}
          >
            <InspectorSelect
              value={block.headingSize ?? "heading-medium"}
              options={headingStyleOptions}
              onChange={(value) => update({ headingSize: value as any })}
              ariaLabel="Heading Style"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Decoration"
            isOverridden={(block as any).titleDecoration !== undefined && (block as any).titleDecoration !== "none"}
            inheritedValueText="None"
            onReset={() => update({ titleDecoration: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).titleDecoration ?? "none"}
              options={decorationOptions}
              onChange={(value) => update({ titleDecoration: value } as any)}
              ariaLabel="Title Decoration"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Font Family"
            isOverridden={block.headingTypographyRole !== undefined && (block.headingTypographyRole as any) !== "none"}
            inheritedValueText="None"
            onReset={() => update({ headingTypographyRole: undefined })}
          >
            <InspectorSelect
              value={block.headingTypographyRole ?? "none"}
              options={fontFamilyOptions}
              onChange={(value) => update({ headingTypographyRole: value as any })}
              ariaLabel="Font Family"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Color"
            isOverridden={(block as any).headingColor !== undefined && (block as any).headingColor !== "none"}
            inheritedValueText="None"
            onReset={() => update({ headingColor: undefined } as any)}
          >
            <InspectorSelect
              value={(block as any).headingColor ?? "none"}
              options={colorOptions}
              onChange={(value) => update({ headingColor: value } as any)}
              ariaLabel="Heading Color"
            />
          </InspectorFieldRow>

          <InspectorFieldRow
            label="Hover Effect"
            isOverridden={Boolean((block as any).showHoverEffect)}
            inheritedValueText="Off"
            onReset={() => update({ showHoverEffect: false } as any)}
          >
            <label className="builder-inspector-checkbox-row">
              <input
                type="checkbox"
                checked={Boolean((block as any).showHoverEffect)}
                onChange={(e) => update({ showHoverEffect: e.target.checked } as any)}
              />
              <span>Show hover effect if linked.</span>
            </label>
          </InspectorFieldRow>

          <InspectorFieldRow
            label="HTML Element"
            isOverridden={block.headingLevel !== undefined && block.headingLevel !== "h2"}
            inheritedValueText="H2"
            onReset={() => update({ headingLevel: undefined })}
          >
            <InspectorSelect
              value={block.headingLevel ?? "h2"}
              options={htmlElementOptions}
              onChange={(value) => update({ headingLevel: value as any })}
              ariaLabel="HTML Element"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="GRADIENT">
          <InspectorFieldRow label="Preset">
            <InspectorSelect
              value={gradient}
              options={labels(gradientPresets)}
              onChange={(value) => update({ textGradientPreset: value })}
              ariaLabel="Gradient preset"
            />
          </InspectorFieldRow>
          {gradient === "custom" && (
            <div className="builder-two-column">
              <InspectorFieldRow label="Start color">
                <InspectorColorField
                  value={block.textGradientCustomStart ?? "#ffffff"}
                  onChange={(value) => update({ textGradientCustomStart: value })}
                  ariaLabel="Gradient start color"
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="End color">
                <InspectorColorField
                  value={block.textGradientCustomEnd ?? "#c084fc"}
                  onChange={(value) => update({ textGradientCustomEnd: value })}
                  ariaLabel="Gradient end color"
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="Angle">
                <InspectorNumberUnit
                  value={block.textGradientCustomAngle ?? 135}
                  unit="deg"
                  units={["deg"]}
                  onValueChange={(value) => update({ textGradientCustomAngle: Number(value) })}
                  onUnitChange={() => undefined}
                  ariaLabel="Gradient angle"
                />
              </InspectorFieldRow>
            </div>
          )}
        </InspectorDivision>

        <InspectorDivision title="TYPEWRITER">
          <InspectorFieldRow label="Enable">
            <InspectorSwitch
              checked={block.typewriterEnabled ?? false}
              onChange={(checked) => update({ typewriterEnabled: checked })}
              label="Enable typewriter"
            />
          </InspectorFieldRow>
          {block.typewriterEnabled && (
            <>
              <InspectorFieldRow label="Phrases">
                <InspectorTextarea
                  value={(block.typewriterPhrases ?? []).join("\n")}
                  onChange={(value) => update({ typewriterPhrases: value.split("\n").map((e) => e.trim()).filter(Boolean) })}
                  ariaLabel="Typewriter phrases"
                />
              </InspectorFieldRow>
              <div className="builder-two-column">
                <InspectorFieldRow label="Speed">
                  <input
                    className="inspector-control"
                    type="number"
                    min={10}
                    value={block.typewriterSpeed ?? 80}
                    onChange={(e) => update({ typewriterSpeed: Number(e.target.value) })}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Delay">
                  <input
                    className="inspector-control"
                    type="number"
                    min={0}
                    value={block.typewriterDelay ?? 1200}
                    onChange={(e) => update({ typewriterDelay: Number(e.target.value) })}
                  />
                </InspectorFieldRow>
              </div>
              <InspectorFieldRow label="Loop">
                <InspectorSwitch
                  checked={block.typewriterLoop ?? true}
                  onChange={(checked) => update({ typewriterLoop: checked })}
                  label="Loop phrases"
                />
              </InspectorFieldRow>
            </>
          )}
        </InspectorDivision>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB 3: ADVANCED (GENERAL SECTION WITH ID, CLASS, ATTRIBUTES, CUSTOM CSS)
  // --------------------------------------------------------------------------
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-advanced">
        <InspectorDivision title="GENERAL">
          <InspectorFieldRow label="ID">
            <InspectorTextField
              value={(block as any).anchorId ?? (block as any).htmlId ?? ""}
              onChange={(value) => update({ anchorId: value, htmlId: value } as any)}
              placeholder="e.g. hero-title"
              ariaLabel="HTML ID"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Class">
            <InspectorTextField
              value={(block as any).cssClass ?? ""}
              onChange={(value) => update({ cssClass: value } as any)}
              placeholder="e.g. uk-heading-line my-custom-title"
              ariaLabel="CSS Class"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Attributes">
            <InspectorTextField
              value={(block as any).cssAttributes ?? ""}
              onChange={(value) => update({ cssAttributes: value } as any)}
              placeholder='e.g. data-uk-scrollspy="cls: uk-animation-fade"'
              ariaLabel="CSS Attributes"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="CSS">
            <InspectorTextarea
              value={(block as any).customCss ?? ""}
              onChange={(value) => update({ customCss: value } as any)}
              placeholder="/* Element custom CSS */\n.el-title {\n  letter-spacing: 0.05em;\n}"
              ariaLabel="Custom CSS"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  return null;
}
