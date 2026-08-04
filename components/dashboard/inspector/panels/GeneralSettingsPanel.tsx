"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderSpacingSides, BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { legacySpacingToSides } from "@/lib/builderVisualStyle";
import AnimationControl from "@/components/dashboard/style/AnimationControl";
import { InspectorFieldRow, InspectorSelect, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  shellSettings: BuilderShellSettings;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  showAnimation?: boolean;
};

const SIDES = ["top", "right", "bottom", "left"] as const;

function localSides(
  block: BuilderLayoutBlock,
  context: "elementPadding" | "elementMargin",
) {
  const visual = block.visualStyle as BuilderVisualStyle | undefined;
  const visualValue = context === "elementPadding" ? visual?.padding : visual?.margin;
  if (visualValue) return visualValue;

  return context === "elementPadding"
    ? legacySpacingToSides(block.elementPadding)
    : legacySpacingToSides(block.gridMargin);
}

function removeInheritedSides(value?: BuilderSpacingSides) {
  if (!value) return undefined;

  const next: BuilderSpacingSides = { ...value };
  SIDES.forEach((side) => {
    if (next[side]?.trim().toLowerCase() === "inherit") {
      delete next[side];
    }
  });

  if (!SIDES.some((side) => next[side] !== undefined && next[side] !== "")) {
    return undefined;
  }

  return next;
}

const spacingOptions = (inherited: string) => [
  { value: "inherit", label: `Inherit — ${inherited}` },
  { value: "none", label: "None" },
  { value: "xs", label: "X-Small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "X-Large" },
  { value: "2xl", label: "2X-Large" },
];

export default function GeneralSettingsPanel({ block, shellSettings, tab, update, showAnimation = false }: Props) {
  if (tab !== "style") return null;

  const visual = (block.visualStyle as BuilderVisualStyle | undefined) ?? {};
  const layout = visual.layout ?? {};

  const updateVisual = (patch: Partial<BuilderVisualStyle>) => {
    update({ visualStyle: { ...visual, ...patch } });
  };

  const updateLayout = (patch: Partial<NonNullable<BuilderVisualStyle["layout"]>>) => {
    updateVisual({ layout: { ...layout, ...patch } });
  };

  const updateSpacing = (
    context: "elementPadding" | "elementMargin",
    value: BuilderSpacingSides,
  ) => {
    const key = context === "elementPadding" ? "padding" : "margin";
    const nextValue = removeInheritedSides(value);
    const nextVisualStyle: BuilderVisualStyle = {
      ...visual,
      [key]: nextValue,
    };

    update({
      visualStyle: nextVisualStyle,
      ...(context === "elementPadding"
        ? { elementPadding: undefined }
        : { gridMargin: undefined }),
    });
  };

  return (
    <section className="builder-general-settings-panel" data-uikit-capability="general-settings">
      <div className="builder-field-header">
        <strong>General</strong>
        <small>Common element behavior. Inherit keeps Global Settings or the UIkit component default in control.</small>
      </div>
      <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <InspectorFieldRow label="Position">
          <InspectorSelect
            value={layout.position ?? "inherit"}
            options={[
              { value: "inherit", label: "Inherit — Static" },
              { value: "static", label: "Static" },
              { value: "relative", label: "Relative" },
              { value: "absolute", label: "Absolute" },
            ]}
            onChange={(position) => updateLayout({
              position: position === "inherit" ? undefined : position,
              ...(position === "static" || position === "inherit"
                ? { top: undefined, right: undefined, bottom: undefined, left: undefined, zIndex: undefined }
                : {}),
            })}
            ariaLabel="Element position"
          />
        </InspectorFieldRow>
        {layout.position && layout.position !== "static" && (
          <>
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <InspectorFieldRow key={side} label={side.charAt(0).toUpperCase() + side.slice(1)}>
                <InspectorTextField
                  value={layout[side] ?? ""}
                  placeholder="auto"
                  ariaLabel={`${side} offset`}
                  onChange={(value) => updateLayout({ [side]: value || undefined })}
                />
              </InspectorFieldRow>
            ))}
            <InspectorFieldRow label="Z index">
              <InspectorTextField
                value={layout.zIndex === undefined ? "" : String(layout.zIndex)}
                placeholder="auto"
                ariaLabel="Z index"
                onChange={(value) => updateLayout({ zIndex: value === "" ? undefined : Number(value) || 0 })}
              />
            </InspectorFieldRow>
          </>
        )}
        <InspectorFieldRow label="Block alignment">
          <InspectorSelect
            value={block.elementAlign ?? "inherit"}
            options={[
              { value: "inherit", label: "Inherit — Left" },
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
            onChange={(elementAlign) => update({
              elementAlign: elementAlign === "inherit"
                ? undefined
                : elementAlign as BuilderLayoutBlock["elementAlign"],
            })}
            ariaLabel="Block alignment"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Text alignment">
          <InspectorSelect
            value={layout.textAlign ?? "inherit"}
            options={[
              { value: "inherit", label: "Inherit — Component default" },
              { value: "left", label: "Left" },
              { value: "center", label: "Center" },
              { value: "right", label: "Right" },
            ]}
            onChange={(textAlign) => updateLayout({ textAlign: textAlign === "inherit" ? undefined : textAlign })}
            ariaLabel="Text alignment"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Max width">
          <InspectorSelect
            value={visual.effects?.maxWidth ?? "inherit"}
            options={[
              { value: "inherit", label: "Inherit / None" },
              { value: "640px", label: "Small" },
              { value: "960px", label: "Medium" },
              { value: "1200px", label: "Large" },
              { value: "1600px", label: "X-Large" },
              { value: "100%", label: "Full" },
            ]}
            onChange={(maxWidth) => update({
              visualStyle: {
                ...visual,
                effects: maxWidth === "inherit"
                  ? { ...(visual.effects ?? {}), maxWidth: undefined }
                  : { ...(visual.effects ?? {}), maxWidth },
              },
            })}
            ariaLabel="Maximum width"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Margin top">
          <InspectorSelect
            value={localSides(block, "elementMargin")?.top ?? "inherit"}
            options={spacingOptions(shellSettings.elementMarginTop)}
            onChange={(top) => updateSpacing("elementMargin", {
              ...(localSides(block, "elementMargin") ?? {}),
              top: top === "inherit" ? undefined : top,
            })}
            ariaLabel="Element margin top"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Margin bottom">
          <InspectorSelect
            value={localSides(block, "elementMargin")?.bottom ?? "inherit"}
            options={spacingOptions(shellSettings.elementMarginBottom)}
            onChange={(bottom) => updateSpacing("elementMargin", {
              ...(localSides(block, "elementMargin") ?? {}),
              bottom: bottom === "inherit" ? undefined : bottom,
            })}
            ariaLabel="Element margin bottom"
          />
        </InspectorFieldRow>
        {showAnimation && (
          <div className="builder-general-settings-subsection" data-uikit-capability="animation">
            <div className="builder-field-header"><strong>Animation</strong></div>
            <AnimationControl value={block.animation} onChange={(animation) => update({ animation })} />
          </div>
        )}
        <div className="builder-general-settings-subsection" data-uikit-capability="visibility">
          <div className="builder-field-header"><strong>Visibility</strong></div>
          {(["desktop", "tablet", "mobile"] as const).map((device) => {
            const globalValue = shellSettings[`visibility${device.charAt(0).toUpperCase()}${device.slice(1)}` as "visibilityDesktop" | "visibilityTablet" | "visibilityMobile"] !== false;
            return (
              <InspectorFieldRow key={device} label={device.charAt(0).toUpperCase() + device.slice(1)}>
                <InspectorSelect
                  value={visual.visibility?.[device] === undefined ? "inherit" : visual.visibility[device] ? "visible" : "hidden"}
                  options={[
                    { value: "inherit", label: `Inherit — ${globalValue ? "Visible" : "Hidden"}` },
                    { value: "visible", label: "Visible" },
                    { value: "hidden", label: "Hidden" },
                  ]}
                  onChange={(value) => updateVisual({
                    visibility: {
                      ...(visual.visibility ?? {}),
                      [device]: value === "inherit" ? undefined : value === "visible",
                    },
                  })}
                  ariaLabel={`${device} visibility`}
                />
              </InspectorFieldRow>
            );
          })}
        </div>
      </div>
    </section>
  );
}
