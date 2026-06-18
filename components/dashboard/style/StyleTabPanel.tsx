"use client";

import TypographyPanel from "@/components/dashboard/TypographyPanel";
import BackgroundControl from "@/components/dashboard/style/BackgroundControl";
import BorderEffectsControl from "@/components/dashboard/style/BorderEffectsControl";
import SpacingControl from "@/components/dashboard/style/SpacingControl";
import {
  BUILDER_CARD_PRESETS,
  BUILDER_HOVER_PRESETS,
} from "@/lib/builderCardStyles";
import type {
  BuilderCardPartStyle,
  BuilderVisualStyle,
} from "@/lib/builderVisualStyle";
import type {
  TypographyGroup,
  TypographySettings,
} from "@/lib/builderTypography";

type StyleTarget = {
  visualStyle?: BuilderVisualStyle;
  typography?: TypographySettings | TypographyGroup;
};

type Props = {
  target: StyleTarget;
  inheritedSpacing?: {
    padding?: BuilderVisualStyle["padding"];
    margin?: BuilderVisualStyle["margin"];
  };
  showSpacing?: boolean;
  showBackground?: boolean;
  showAppearance?: boolean;
  showLayout?: boolean;
  showAdvanced?: boolean;
  showTypography?: boolean;
  showCardParts?: boolean;
  spacingControlIds?: {
    padding?: string;
    margin?: string;
  };
  onChange: (patch: Partial<StyleTarget>) => void;
  onPickBackgroundImage?: () => void;
};

export default function StyleTabPanel({
  target,
  inheritedSpacing,
  showSpacing = true,
  showBackground = true,
  showAppearance = true,
  showLayout = true,
  showAdvanced = true,
  showTypography = true,
  showCardParts = false,
  spacingControlIds,
  onChange,
  onPickBackgroundImage,
}: Props) {
  const style = target.visualStyle ?? {};

  function patchStyle(patch: Partial<BuilderVisualStyle>) {
    onChange({ visualStyle: { ...style, ...patch } });
  }

  function patchCard(patch: Partial<BuilderCardPartStyle>) {
    patchStyle({ card: { ...(style.card ?? {}), ...patch } });
  }

  return (
    <div className="builder-style-tab">
      {showSpacing && (
        <details className="builder-collapse" open>
          <summary>
            <span>Spacing</span>
            <small>padding & margin</small>
          </summary>
          <SpacingControl
            id={spacingControlIds?.padding}
            label="Padding"
            value={style.padding}
            inheritedValue={inheritedSpacing?.padding}
            context="elementPadding"
            onChange={(padding) => patchStyle({ padding })}
          />
          <SpacingControl
            id={spacingControlIds?.margin}
            label="Margin"
            value={style.margin}
            inheritedValue={inheritedSpacing?.margin}
            context="elementMargin"
            onChange={(margin) => patchStyle({ margin })}
          />
        </details>
      )}

      {showBackground && (
        <details className="builder-collapse" open>
          <summary>
            <span>Background</span>
            <small>color, gradient, image</small>
          </summary>
          <BackgroundControl
            value={style.background}
            onChange={(background) => patchStyle({ background })}
            onPickImage={onPickBackgroundImage}
          />
        </details>
      )}

      {showAppearance && (
        <details className="builder-collapse" open>
          <summary>
            <span>{showCardParts ? "Card / Panel Style" : "Appearance"}</span>
            <small>{showCardParts ? "surface preset & state" : "radius, shadow, opacity"}</small>
          </summary>
          {showCardParts ? (
            <div className="builder-card-style-controls">
              <div className="builder-style-subsection">
                <strong>Card Preset</strong>
                <div className="builder-card-preset-grid">
                  {BUILDER_CARD_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={
                        style.card?.preset === preset.value
                          ? "is-active"
                          : ""
                      }
                      onClick={() => patchCard({ preset: preset.value })}
                    >
                      <span aria-hidden="true" className={`is-${preset.value}`} />
                      <strong>{preset.label}</strong>
                      <small>{preset.description}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="builder-style-subsection">
                <strong>Hover / Press State</strong>
                <div className="builder-style-chip-row">
                  {BUILDER_HOVER_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={
                        style.card?.hoverPreset === preset.value
                          ? "is-active"
                          : ""
                      }
                      title={preset.description}
                      onClick={() => patchCard({ hoverPreset: preset.value })}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <details className="builder-style-mini-advanced">
                <summary>Advanced surface</summary>
                <BorderEffectsControl
                  border={style.border}
                  effects={style.effects}
                  onBorderChange={(border) => patchStyle({ border })}
                  onEffectsChange={(effects) => patchStyle({ effects })}
                  showLayout={false}
                  showVisibility={false}
                  showCustomClass={false}
                />
              </details>
            </div>
          ) : (
            <BorderEffectsControl
              border={style.border}
              effects={style.effects}
              onBorderChange={(border) => patchStyle({ border })}
              onEffectsChange={(effects) => patchStyle({ effects })}
              showLayout={false}
              showVisibility={false}
              showCustomClass={false}
            />
          )}
        </details>
      )}

      {showCardParts && (
        <>
          <details className="builder-collapse">
            <summary>
              <span>Image Style</span>
              <small>ratio, fit, radius, overlay</small>
            </summary>
            <div className="builder-style-subsection">
              <strong>Image Ratio</strong>
              <div className="builder-style-chip-row">
                {[
                  ["auto", "Auto"],
                  ["square", "1:1"],
                  ["4:5", "4:5"],
                  ["3:4", "3:4"],
                  ["16:9", "16:9"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      (style.card?.imageRatio ?? "auto") === value
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      patchCard({
                        imageRatio: value as BuilderCardPartStyle["imageRatio"],
                      })
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="builder-style-subsection">
              <strong>Image Fit</strong>
              <div className="builder-card-fit-row">
                {[
                  ["cover", "Cover", "Crop to fill"],
                  ["contain", "Contain", "Show full image"],
                  ["fill", "Fill", "Stretch to frame"],
                ].map(([value, label, description]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      (style.card?.imageFit ?? "cover") === value
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      patchCard({
                        imageFit: value as BuilderCardPartStyle["imageFit"],
                      })
                    }
                  >
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </button>
                ))}
              </div>
            </div>
            <div className="builder-style-subsection">
              <strong>Image Radius</strong>
              <div className="builder-style-chip-row">
                {[
                  ["", "Inherit"],
                  ["0px", "Sharp"],
                  ["8px", "Soft"],
                  ["16px", "Round"],
                  ["28px", "Blob"],
                  ["999px", "Pill"],
                ].map(([value, label]) => (
                  <button
                    key={value || "inherit"}
                    type="button"
                    className={(style.card?.imageRadius ?? "") === value ? "is-active" : ""}
                    onClick={() => patchCard({ imageRadius: value || undefined })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="builder-style-inline-input">
                <span>Custom</span>
                <input
                  value={style.card?.imageRadius ?? ""}
                  placeholder="16px"
                  onChange={(event) => patchCard({ imageRadius: event.target.value })}
                />
              </label>
            </div>

            <div className="builder-style-subsection">
              <strong>Overlay</strong>
              <div className="builder-style-chip-row">
                {[
                  ["none", "None"],
                  ["soft", "Soft"],
                  ["dark", "Dark"],
                  ["gradient", "Gradient"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={
                      (style.card?.imageOverlay ?? "none") === value
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      patchCard({
                        imageOverlay: value as BuilderCardPartStyle["imageOverlay"],
                      })
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </details>

          <details className="builder-collapse">
            <summary>
              <span>Title Style</span>
              <small>size, weight, color</small>
            </summary>
            <div className="builder-style-subsection">
              <strong>Size</strong>
              <div className="builder-style-chip-row">
                {[
                  ["", "Inherit"],
                  ["0.875rem", "Caption"],
                  ["1rem", "Body"],
                  ["1.25rem", "Card"],
                  ["1.75rem", "Feature"],
                  ["2.5rem", "Hero"],
                ].map(([value, label]) => (
                  <button
                    key={value || "inherit"}
                    type="button"
                    className={(style.card?.titleSize ?? "") === value ? "is-active" : ""}
                    onClick={() => patchCard({ titleSize: value || undefined })}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="builder-style-inline-input">
                <span>Custom</span>
                <input
                  value={style.card?.titleSize ?? ""}
                  placeholder="1.25rem"
                  onChange={(event) => patchCard({ titleSize: event.target.value })}
                />
              </label>
            </div>

            <div className="builder-style-two-col">
              <div className="builder-style-subsection">
                <strong>Weight</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["500", "M"],
                    ["650", "SB"],
                    ["800", "B"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.titleWeight ?? "") === value ? "is-active" : ""}
                      onClick={() => patchCard({ titleWeight: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-style-subsection">
                <strong>Alignment</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["left", "Left"],
                    ["center", "Center"],
                    ["right", "Right"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.titleAlign ?? "") === value ? "is-active" : ""}
                      onClick={() =>
                        patchCard({
                          titleAlign:
                            value === ""
                              ? undefined
                              : (value as BuilderCardPartStyle["titleAlign"]),
                        })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="builder-style-two-col">
              <label className="builder-style-inline-input">
                <span>Color</span>
                <input
                  value={style.card?.titleColor ?? ""}
                  placeholder="currentColor"
                  onChange={(event) => patchCard({ titleColor: event.target.value })}
                />
              </label>
              <label className="builder-style-inline-input">
                <span>Margin</span>
              <input
                value={style.card?.titleMargin ?? ""}
                placeholder="0 0 8px"
                onChange={(event) => patchCard({ titleMargin: event.target.value })}
              />
              </label>
            </div>
          </details>

          <details className="builder-collapse">
            <summary>
              <span>Meta Style</span>
              <small>color, size, spacing</small>
            </summary>
            <div className="builder-style-two-col">
              <div className="builder-style-subsection">
                <strong>Size</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["0.7rem", "Tiny"],
                    ["0.85rem", "Meta"],
                    ["1rem", "Body"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.metaSize ?? "") === value ? "is-active" : ""}
                      onClick={() => patchCard({ metaSize: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-style-subsection">
                <strong>Transform</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["none", "Normal"],
                    ["uppercase", "Uppercase"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={(style.card?.metaTransform ?? "none") === value ? "is-active" : ""}
                      onClick={() =>
                        patchCard({
                          metaTransform: value as BuilderCardPartStyle["metaTransform"],
                        })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="builder-style-two-col">
              <label className="builder-style-inline-input">
                <span>Color</span>
                <input
                  value={style.card?.metaColor ?? ""}
                  placeholder="var(--builder-active-muted)"
                  onChange={(event) => patchCard({ metaColor: event.target.value })}
                />
              </label>
              <label className="builder-style-inline-input">
                <span>Spacing</span>
                <input
                  value={style.card?.metaSpacing ?? ""}
                  placeholder="8px"
                  onChange={(event) => patchCard({ metaSpacing: event.target.value })}
                />
              </label>
            </div>
          </details>

          <details className="builder-collapse">
            <summary>
              <span>Content Style</span>
              <small>copy and line length</small>
            </summary>
            <div className="builder-style-two-col">
              <div className="builder-style-subsection">
                <strong>Size</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["0.9rem", "Compact"],
                    ["1rem", "Body"],
                    ["1.18rem", "Lead"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.contentSize ?? "") === value ? "is-active" : ""}
                      onClick={() => patchCard({ contentSize: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-style-subsection">
                <strong>Line Height</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["1.35", "Tight"],
                    ["1.55", "Normal"],
                    ["1.75", "Airy"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.contentLineHeight ?? "") === value ? "is-active" : ""}
                      onClick={() =>
                        patchCard({ contentLineHeight: value || undefined })
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="builder-style-two-col">
              <label className="builder-style-inline-input">
                <span>Color</span>
                <input
                  value={style.card?.contentColor ?? ""}
                  placeholder="var(--builder-active-muted)"
                  onChange={(event) => patchCard({ contentColor: event.target.value })}
                />
              </label>
              <label className="builder-style-inline-input">
                <span>Max Width</span>
                <input
                  value={style.card?.contentMaxWidth ?? ""}
                  placeholder="42ch"
                  onChange={(event) =>
                    patchCard({ contentMaxWidth: event.target.value })
                  }
                />
              </label>
            </div>
          </details>

          <details className="builder-collapse">
            <summary>
              <span>Button / Link Style</span>
              <small>alignment and offset</small>
            </summary>
            <div className="builder-style-subsection">
              <strong>Alignment</strong>
              <div className="builder-style-chip-row">
                {[
                  ["", "Inherit"],
                  ["left", "Left"],
                  ["center", "Center"],
                  ["right", "Right"],
                ].map(([value, label]) => (
                  <button
                    key={value || "inherit"}
                    type="button"
                    className={(style.card?.buttonAlign ?? "") === value ? "is-active" : ""}
                    onClick={() =>
                      patchCard({
                        buttonAlign:
                          value === ""
                            ? undefined
                            : (value as BuilderCardPartStyle["buttonAlign"]),
                      })
                    }
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <label className="builder-style-inline-input">
              <span>Margin</span>
              <input
                value={style.card?.buttonMargin ?? ""}
                placeholder="16px 0 0"
                onChange={(event) => patchCard({ buttonMargin: event.target.value })}
              />
            </label>
          </details>

          <details className="builder-collapse">
            <summary>
              <span>Spacing</span>
              <small>card padding and gap</small>
            </summary>
            <div className="builder-style-two-col">
              <div className="builder-style-subsection">
                <strong>Card Padding</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["0px", "None"],
                    ["12px", "Compact"],
                    ["20px", "Default"],
                    ["32px", "Comfort"],
                    ["48px", "Editorial"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.cardPadding ?? "") === value ? "is-active" : ""}
                      onClick={() => patchCard({ cardPadding: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="builder-style-subsection">
                <strong>Content Gap</strong>
                <div className="builder-style-chip-row">
                  {[
                    ["", "Inherit"],
                    ["0px", "None"],
                    ["6px", "Tight"],
                    ["12px", "Default"],
                    ["20px", "Comfort"],
                    ["32px", "Airy"],
                  ].map(([value, label]) => (
                    <button
                      key={value || "inherit"}
                      type="button"
                      className={(style.card?.cardGap ?? "") === value ? "is-active" : ""}
                      onClick={() => patchCard({ cardGap: value || undefined })}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="builder-style-two-col">
              <label className="builder-style-inline-input">
                <span>Custom Padding</span>
                <input
                  value={style.card?.cardPadding ?? ""}
                  placeholder="32px"
                  onChange={(event) => patchCard({ cardPadding: event.target.value })}
                />
              </label>
              <label className="builder-style-inline-input">
                <span>Custom Gap</span>
                <input
                  value={style.card?.cardGap ?? ""}
                  placeholder="20px"
                  onChange={(event) => patchCard({ cardGap: event.target.value })}
                />
              </label>
            </div>
          </details>
        </>
      )}

      {showLayout && (
        <details className="builder-collapse" open>
          <summary>
            <span>Dimensions & overflow</span>
            <small>width, height, clipping</small>
          </summary>
          <BorderEffectsControl
            effects={style.effects}
            onEffectsChange={(effects) => patchStyle({ effects })}
            showBorder={false}
            showEffects={false}
            showVisibility={false}
            showCustomClass={false}
          />
        </details>
      )}

      {showAdvanced && (
        <details className="builder-collapse" open>
          <summary>
            <span>Visibility & CSS</span>
            <small>devices, custom class</small>
          </summary>
          <BorderEffectsControl
            visibility={style.visibility}
            customClass={style.customClass}
            onVisibilityChange={(visibility) => patchStyle({ visibility })}
            onCustomClassChange={(customClass) => patchStyle({ customClass })}
            showBorder={false}
            showEffects={false}
            showLayout={false}
          />
        </details>
      )}

      {showTypography && (
        <details className="builder-collapse" open>
          <summary>
            <span>Typography</span>
            <small>font, size, color</small>
          </summary>
          <TypographyPanel
            value={
              typeof target.typography === "object" &&
              target.typography &&
              !("variant" in target.typography) &&
              ("title" in target.typography ||
                "body" in target.typography)
                ? (target.typography as TypographyGroup).title
                : (target.typography as TypographySettings | undefined)
            }
            onChange={(typography) => onChange({ typography })}
          />
        </details>
      )}
    </div>
  );
}
