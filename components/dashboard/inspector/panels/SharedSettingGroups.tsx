"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import {
  InspectorFieldRow,
  InspectorSelect,
  InspectorPillGroup,
  InspectorTextField,
  InspectorDivision,
  InspectorAlignmentControl,
  InspectorSwitch,
  InspectorMediaPlacementControl,
  InspectorSegmentedControl,
} from "@/components/dashboard/inspector/InspectorControls";
import { UIKIT_HEADING_CAPABILITY, UIKIT_IMAGE_CAPABILITY, UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";

const labels = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    value,
    label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

const roleOptions = [
  { value: "inherit", label: "Inherit" },
  { value: "default", label: "Default" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
];

/**
 * Reusable Title Settings Group.
 * Displays Font role, Visual preset, Alignment, and HTML Element.
 */
export function TitleSettingsGroup({
  block,
  update,
  keys = {
    role: "titleTypographyRole",
    size: "headingSize",
    align: "headingAlign",
    level: "headingLevel",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  keys?: {
    role: string;
    size: string;
    align: string;
    level: string;
  };
}) {
  const values = block as any;
  return (
    <InspectorDivision title="TITLE">
      <InspectorFieldRow
        label="Font role"
        isOverridden={values[keys.role] !== undefined && values[keys.role] !== "inherit"}
        inheritedValueText="Inherit"
        onReset={() => update({ [keys.role]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.role] ?? "inherit")}
          options={roleOptions}
          onChange={(value) => update({ [keys.role]: value === "inherit" ? undefined : value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Visual preset"
        isOverridden={values[keys.size] !== undefined}
        inheritedValueText="Medium"
        onReset={() => update({ [keys.size]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.size] ?? "medium")}
          options={labels(UIKIT_HEADING_CAPABILITY.properties.visualPreset.values)}
          onChange={(value) => update({ [keys.size]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Left"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "left")}
          onChange={(value) => update({ [keys.align]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="HTML Element"
        isOverridden={values[keys.level] !== undefined}
        inheritedValueText="H2"
        onReset={() => update({ [keys.level]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.level] ?? "h2")}
          options={UIKIT_HEADING_CAPABILITY.properties.level.values.map((v) => ({
            value: v,
            label: v.toUpperCase(),
          }))}
          onChange={(value) => update({ [keys.level]: value })}
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Reusable Meta Settings Group.
 * Displays Font role, Alignment, and HTML Element.
 */
export function MetaSettingsGroup({
  block,
  update,
  keys = {
    role: "metaTypographyRole",
    align: "metaAlign",
    level: "metaHtmlElement",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  keys?: {
    role: string;
    align: string;
    level: string;
  };
}) {
  const values = block as any;
  return (
    <InspectorDivision title="META">
      <InspectorFieldRow
        label="Font role"
        isOverridden={values[keys.role] !== undefined && values[keys.role] !== "inherit"}
        inheritedValueText="Inherit"
        onReset={() => update({ [keys.role]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.role] ?? "inherit")}
          options={roleOptions}
          onChange={(value) => update({ [keys.role]: value === "inherit" ? undefined : value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Left"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "left")}
          onChange={(value) => update({ [keys.align]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="HTML Element"
        isOverridden={values[keys.level] !== undefined}
        inheritedValueText="Div"
        onReset={() => update({ [keys.level]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.level] ?? "div")}
          options={["div", "span", "p"].map((v) => ({
            value: v,
            label: v.toUpperCase(),
          }))}
          onChange={(value) => update({ [keys.level]: value })}
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Reusable Content Settings Group.
 * Displays Font role and Alignment.
 */
export function ContentSettingsGroup({
  block,
  update,
  keys = {
    role: "contentTypographyRole",
    align: "contentAlign",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  keys?: {
    role: string;
    align: string;
  };
}) {
  const values = block as any;
  return (
    <InspectorDivision title="CONTENT">
      <InspectorFieldRow
        label="Font role"
        isOverridden={values[keys.role] !== undefined && values[keys.role] !== "inherit"}
        inheritedValueText="Inherit"
        onReset={() => update({ [keys.role]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.role] ?? "inherit")}
          options={roleOptions}
          onChange={(value) => update({ [keys.role]: value === "inherit" ? undefined : value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Left"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "left")}
          onChange={(value) => update({ [keys.align]: value })}
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Reusable Image Settings Group.
 * Displays Width/Height inputs, Loading mode, Border, Box shadow, and Alignment.
 */
export function ImageSettingsGroup({
  block,
  update,
  keys = {
    width: "imageWidth",
    height: "imageHeight",
    loading: "imageLoading",
    shape: "imageShape",
    shadow: "imageShadow",
    align: "imageAlignment",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  keys?: {
    width: string;
    height: string;
    loading: string;
    shape: string;
    shadow: string;
    align: string;
  };
}) {
  const values = block as any;
  return (
    <InspectorDivision title="IMAGE">
      <div className="builder-two-column" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <InspectorFieldRow
          label="Width"
          isOverridden={values[keys.width] !== undefined}
          inheritedValueText="auto"
          onReset={() => update({ [keys.width]: undefined })}
        >
          <InspectorTextField
            value={String(values[keys.width] ?? "")}
            placeholder="auto"
            onChange={(val) => update({ [keys.width]: val || undefined })}
          />
        </InspectorFieldRow>
        <InspectorFieldRow
          label="Height"
          isOverridden={values[keys.height] !== undefined}
          inheritedValueText="auto"
          onReset={() => update({ [keys.height]: undefined })}
        >
          <InspectorTextField
            value={String(values[keys.height] ?? "")}
            placeholder="auto"
            onChange={(val) => update({ [keys.height]: val || undefined })}
          />
        </InspectorFieldRow>
      </div>

      <InspectorFieldRow
        label="Loading"
        isOverridden={values[keys.loading] !== undefined}
        inheritedValueText="Lazy"
        onReset={() => update({ [keys.loading]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.loading] ?? "lazy")}
          options={labels(UIKIT_IMAGE_CAPABILITY.properties.loading.values)}
          onChange={(value) => update({ [keys.loading]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Border"
        isOverridden={values[keys.shape] !== undefined}
        inheritedValueText="None"
        onReset={() => update({ [keys.shape]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.shape] ?? "none")}
          options={labels(UIKIT_IMAGE_CAPABILITY.properties.shape.values)}
          onChange={(value) => update({ [keys.shape]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Box Shadow"
        isOverridden={values[keys.shadow] !== undefined}
        inheritedValueText="None"
        onReset={() => update({ [keys.shadow]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.shadow] ?? "none")}
          options={labels(UIKIT_IMAGE_CAPABILITY.properties.shadow.values)}
          onChange={(value) => update({ [keys.shadow]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Center"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "center")}
          onChange={(value) => update({ [keys.align]: value })}
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Reusable Link/Action Settings Group.
 * Displays Button Style and Button Size.
 */
export function LinkSettingsGroup({
  block,
  update,
  keys = {
    style: "buttonStyle",
    size: "size",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  keys?: {
    style: string;
    size: string;
  };
}) {
  const values = block as any;
  return (
    <InspectorDivision title="LINK">
      <InspectorFieldRow
        label="Style"
        isOverridden={values[keys.style] !== undefined}
        inheritedValueText="Primary"
        onReset={() => update({ [keys.style]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[keys.style] ?? "primary")}
          options={labels(UIKIT_BUTTON_CAPABILITY.properties.variant.values)}
          onChange={(value) => update({ [keys.style]: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Button Size"
        isOverridden={values[keys.size] !== undefined}
        inheritedValueText="Default"
        onReset={() => update({ [keys.size]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[keys.size] ?? "default")}
          options={labels(UIKIT_BUTTON_CAPABILITY.properties.size.values)}
          onChange={(value) => update({ [keys.size]: value })}
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Canonical Action / Button Settings Group.
 * Displays Show action, Label, URL, Target, Style, and Size.
 * Used by Standalone Button, Panel action button, Grid action button, etc.
 */
export function ActionSettingsGroup({
  block,
  update,
  title = "ACTION BUTTON",
  showVisibilityToggle = false,
  keys = {
    visible: "panelActionVisible",
    label: "buttonLabel",
    url: "buttonUrl",
    target: "buttonTarget",
    style: "buttonStyle",
    size: "size",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  showVisibilityToggle?: boolean;
  keys?: {
    visible?: string;
    label?: string;
    url?: string;
    target?: string;
    style?: string;
    size?: string;
  };
}) {
  const values = block as any;
  const styleKey = keys.style ?? "buttonStyle";
  const sizeKey = keys.size ?? "size";
  const labelKey = keys.label;
  const urlKey = keys.url;
  const targetKey = keys.target;
  const visibleKey = keys.visible;

  return (
    <InspectorDivision title={title}>
      {showVisibilityToggle && visibleKey && (
        <InspectorFieldRow
          label="Show action"
          isOverridden={values[visibleKey] !== undefined}
          inheritedValueText="Show"
          onReset={() => update({ [visibleKey]: undefined })}
        >
          <InspectorSwitch
            checked={values[visibleKey] !== false}
            onChange={(checked) => update({ [visibleKey]: checked })}
            label="Show action"
          />
        </InspectorFieldRow>
      )}

      {labelKey && (
        <InspectorFieldRow
          label="Action label"
          isOverridden={values[labelKey] !== undefined}
          inheritedValueText="Action"
          onReset={() => update({ [labelKey]: undefined })}
        >
          <InspectorTextField
            value={String(values[labelKey] ?? "")}
            onChange={(val) => update({ [labelKey]: val })}
            ariaLabel="Action label"
          />
        </InspectorFieldRow>
      )}

      {urlKey && (
        <InspectorFieldRow
          label="Action URL"
          isOverridden={values[urlKey] !== undefined}
          inheritedValueText="#"
          onReset={() => update({ [urlKey]: undefined })}
        >
          <InspectorTextField
            value={String(values[urlKey] ?? "")}
            onChange={(val) => update({ [urlKey]: val })}
            ariaLabel="Action URL"
          />
        </InspectorFieldRow>
      )}

      {targetKey && (
        <InspectorFieldRow
          label="Action target"
          isOverridden={values[targetKey] !== undefined}
          inheritedValueText="Same window"
          onReset={() => update({ [targetKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[targetKey] ?? "_self")}
            options={BUILDER_LINK_TARGET_OPTIONS}
            onChange={(val) => update({ [targetKey]: val })}
            ariaLabel="Action target"
          />
        </InspectorFieldRow>
      )}

      <InspectorFieldRow
        label="Style"
        isOverridden={values[styleKey] !== undefined}
        inheritedValueText="Primary"
        onReset={() => update({ [styleKey]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[styleKey] ?? "primary")}
          options={labels(UIKIT_BUTTON_CAPABILITY.properties.variant.values)}
          onChange={(value) => update({ [styleKey]: value })}
          ariaLabel="Button style"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Button size"
        isOverridden={values[sizeKey] !== undefined}
        inheritedValueText="Default"
        onReset={() => update({ [sizeKey]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[sizeKey] ?? "default")}
          options={labels(UIKIT_BUTTON_CAPABILITY.properties.size.values)}
          onChange={(value) => update({ [sizeKey]: value })}
          ariaLabel="Button size"
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Canonical Card / Panel Presentation Group.
 * Displays Variant, Size, and Hover behavior for Card & Panel structures.
 */
export function CardSettingsGroup({
  block,
  update,
  title = "CARD / PANEL",
  keys = {
    variant: "panelVariant",
    size: "panelSize",
    hover: "panelHover",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  keys?: {
    variant: string;
    size: string;
    hover: string;
  };
}) {
  const values = block as any;
  const variantValues = ["default", "primary", "secondary", "blank"] as const;
  const sizeValues = ["small", "default", "large"] as const;

  return (
    <InspectorDivision title={title}>
      <InspectorFieldRow
        label="Variant"
        isOverridden={values[keys.variant] !== undefined}
        inheritedValueText="Default"
        onReset={() => update({ [keys.variant]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[keys.variant] ?? "default")}
          options={labels(variantValues)}
          onChange={(value) => update({ [keys.variant]: value })}
          ariaLabel="Card variant"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Size"
        isOverridden={values[keys.size] !== undefined}
        inheritedValueText="Default"
        onReset={() => update({ [keys.size]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[keys.size] ?? "default")}
          options={labels(sizeValues)}
          onChange={(value) => update({ [keys.size]: value })}
          ariaLabel="Card size"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Hover effect"
        isOverridden={values[keys.hover] !== undefined}
        inheritedValueText="None"
        onReset={() => update({ [keys.hover]: undefined })}
      >
        <InspectorSwitch
          checked={Boolean(values[keys.hover])}
          onChange={(checked) => update({ [keys.hover]: checked })}
          label="Enable hover effect"
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Canonical Media Settings Group.
 * Displays Show media, Placement, Aspect ratio, Fit, Side media width, and Media alignment.
 * Used by Standalone Panel and Grid Element and any media-container elements.
 */
export function MediaSettingsGroup({
  block,
  update,
  title = "MEDIA",
  keys = {
    showMedia: "panelShowMedia",
    placement: "panelMediaPlacement",
    ratio: "imageRatio",
    fit: "panelMediaFit",
    width: "panelMediaWidth",
    align: "panelMediaAlignment",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  keys?: {
    showMedia: string;
    placement: string;
    ratio: string;
    fit: string;
    width: string;
    align: string;
  };
}) {
  const values = block as any;
  const ratioOptions = [
    { value: "natural", label: "Natural" },
    { value: "square", label: "Square (1:1)" },
    { value: "4:3", label: "4:3" },
    { value: "3:2", label: "3:2" },
    { value: "16:9", label: "16:9" },
    { value: "portrait", label: "Portrait (3:4)" },
  ];
  const widthOptions = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
  ];

  return (
    <InspectorDivision title={title}>
      <InspectorFieldRow
        label="Show media"
        isOverridden={values[keys.showMedia] !== undefined}
        inheritedValueText="Show"
        onReset={() => update({ [keys.showMedia]: undefined })}
      >
        <InspectorSwitch
          checked={values[keys.showMedia] !== false}
          onChange={(checked) => update({ [keys.showMedia]: checked })}
          label="Show media"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Placement"
        isOverridden={values[keys.placement] !== undefined}
        inheritedValueText="Top"
        onReset={() => update({ [keys.placement]: undefined })}
      >
        <InspectorMediaPlacementControl
          value={(values[keys.placement] ?? "top") as "top" | "left" | "right"}
          onChange={(val) => update({ [keys.placement]: val })}
          ariaLabel="Media placement"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Aspect ratio"
        isOverridden={values[keys.ratio] !== undefined}
        inheritedValueText="16:9"
        onReset={() => update({ [keys.ratio]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.ratio] ?? "16:9")}
          options={ratioOptions}
          onChange={(val) => update({ [keys.ratio]: val })}
          ariaLabel="Media aspect ratio"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Fit"
        isOverridden={values[keys.fit] !== undefined}
        inheritedValueText="Cover"
        onReset={() => update({ [keys.fit]: undefined })}
      >
        <InspectorSegmentedControl
          value={String(values[keys.fit] ?? "cover")}
          options={[
            { value: "cover", label: "Cover" },
            { value: "contain", label: "Contain" },
          ]}
          onChange={(val) => update({ [keys.fit]: val })}
          ariaLabel="Media fit"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Side media width"
        isOverridden={values[keys.width] !== undefined}
        inheritedValueText="Medium"
        onReset={() => update({ [keys.width]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.width] ?? "medium")}
          options={widthOptions}
          onChange={(val) => update({ [keys.width]: val })}
          ariaLabel="Side media width"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Media alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Center"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "center")}
          onChange={(val) => update({ [keys.align]: val })}
          ariaLabel="Media alignment"
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}

/**
 * Shared YOOtheme General Settings Group (Margin, Animation, Visibility).
 * Rendered across all element capability panels under Settings/Style tab.
 */
export function GeneralSettingsGroup({
  block,
  update,
  title = "GENERAL",
  keys = {
    margin: "margin",
    animation: "animation",
    visibility: "visibility",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  keys?: {
    margin?: string;
    animation?: string;
    visibility?: string;
  };
}) {
  const values = block as any;
  const marginKey = keys.margin ?? "margin";
  const animKey = keys.animation ?? "animation";
  const visKey = keys.visibility ?? "visibility";

  const marginOptions = [
    { value: "default", label: "Default" },
    { value: "none", label: "None" },
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "xlarge", label: "X-Large" },
  ];

  const animationOptions = [
    { value: "none", label: "None" },
    { value: "fade", label: "Fade" },
    { value: "scale-up", label: "Scale Up" },
    { value: "scale-down", label: "Scale Down" },
    { value: "slide-top-small", label: "Slide Top" },
    { value: "slide-bottom-small", label: "Slide Bottom" },
    { value: "slide-left-small", label: "Slide Left" },
    { value: "slide-right-small", label: "Slide Right" },
  ];

  const visibilityOptions = [
    { value: "always", label: "Always Visible" },
    { value: "visible@s", label: "Visible @ Small" },
    { value: "visible@m", label: "Visible @ Medium" },
    { value: "visible@l", label: "Visible @ Large" },
    { value: "visible@xl", label: "Visible @ X-Large" },
    { value: "hidden@s", label: "Hidden @ Small" },
    { value: "hidden@m", label: "Hidden @ Medium" },
    { value: "hidden@l", label: "Hidden @ Large" },
    { value: "hidden@xl", label: "Hidden @ X-Large" },
  ];

  return (
    <InspectorDivision title={title}>
      <InspectorFieldRow
        label="Margin"
        isOverridden={values[marginKey] !== undefined && values[marginKey] !== "default"}
        inheritedValueText="Default"
        onReset={() => update({ [marginKey]: undefined })}
      >
        <InspectorSelect
          value={String(values[marginKey] ?? "default")}
          options={marginOptions}
          onChange={(val) => update({ [marginKey]: val })}
          ariaLabel="Element margin"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Animation"
        isOverridden={values[animKey] !== undefined && values[animKey] !== "none"}
        inheritedValueText="None"
        onReset={() => update({ [animKey]: undefined })}
      >
        <InspectorSelect
          value={typeof values[animKey] === "string" ? values[animKey] : (values[animKey]?.preset ?? "none")}
          options={animationOptions}
          onChange={(val) => update({ [animKey]: val })}
          ariaLabel="Element animation"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Visibility"
        isOverridden={values[visKey] !== undefined && values[visKey] !== "always"}
        inheritedValueText="Always Visible"
        onReset={() => update({ [visKey]: undefined })}
      >
        <InspectorSelect
          value={String(values[visKey] ?? "always")}
          options={visibilityOptions}
          onChange={(val) => update({ [visKey]: val })}
          ariaLabel="Element visibility"
        />
      </InspectorFieldRow>
    </InspectorDivision>
  );
}
