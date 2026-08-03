"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import type { BuilderSpacingSides, BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { legacySpacingToSides } from "@/lib/builderVisualStyle";
import SpacingControl from "@/components/dashboard/style/SpacingControl";

type Props = {
  block: BuilderLayoutBlock;
  shellSettings: BuilderShellSettings;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const SIDES = ["top", "right", "bottom", "left"] as const;

function inheritedSides(
  settings: BuilderShellSettings,
  context: "elementPadding" | "elementMargin",
): BuilderSpacingSides {
  if (context === "elementPadding") {
    return {
      top: settings.elementPaddingTop,
      right: settings.elementPaddingRight,
      bottom: settings.elementPaddingBottom,
      left: settings.elementPaddingLeft,
      linked: false,
    };
  }

  return {
    top: settings.elementMarginTop,
    right: settings.elementMarginRight,
    bottom: settings.elementMarginBottom,
    left: settings.elementMarginLeft,
    linked: false,
  };
}

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

export default function GeneralSettingsPanel({ block, shellSettings, tab, update }: Props) {
  if (tab !== "style") return null;

  const visual = (block.visualStyle as BuilderVisualStyle | undefined) ?? {};

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
      <div className="builder-element-inspector-note">
        <strong>General Settings</strong>
        <span>These values inherit from Global Settings until you explicitly override them.</span>
      </div>
      <div className="builder-style-section-content" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <SpacingControl
          id="general-settings-element-padding"
          label="Element padding"
          value={localSides(block, "elementPadding")}
          inheritedValue={inheritedSides(shellSettings, "elementPadding")}
          context="elementPadding"
          onChange={(value) => updateSpacing("elementPadding", value)}
        />
        <SpacingControl
          id="general-settings-element-margin"
          label="Element margin"
          value={localSides(block, "elementMargin")}
          inheritedValue={inheritedSides(shellSettings, "elementMargin")}
          context="elementMargin"
          onChange={(value) => updateSpacing("elementMargin", value)}
        />
      </div>
    </section>
  );
}
