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

/** Canonical semantic text-style vocabulary shared by content-capable elements. */
export const CONTENT_STYLE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "text-bold", label: "Text Bold" },
  { value: "text-lead", label: "Text Lead" },
  { value: "text-meta", label: "Text Meta" },
  { value: "text-small", label: "Text Small" },
  { value: "text-large", label: "Text Large" },
  { value: "text-muted", label: "Text Muted" },
  { value: "heading-small", label: "Heading Small" },
  { value: "heading-h1", label: "Heading H1" },
  { value: "heading-h2", label: "Heading H2" },
  { value: "heading-h3", label: "Heading H3" },
  { value: "heading-h4", label: "Heading H4" },
  { value: "heading-h5", label: "Heading H5" },
  { value: "heading-h6", label: "Heading H6" },
] as const;

/**
 * Reusable Title Settings Group.
 * Displays Style, Decoration, Font Family, and HTML Element.
 */
export function TitleSettingsGroup({
  block,
  update,
  showFontRole = true,
  showDecoration = false,
  showColor = false,
  defaultSize = "medium",
  defaultLevel = "h2",
  visualPresetOptions,
  styleAriaLabel = "Title style",
  keys = {
    role: "titleTypographyRole",
    size: "headingSize",
    align: "headingAlign",
    level: "headingLevel",
    decoration: "titleDecoration",
    color: "titleColor",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  showFontRole?: boolean;
  /** @deprecated Alignment is owned by the shared General settings panel. */
  showAlignment?: boolean;
  showDecoration?: boolean;
  showColor?: boolean;
  defaultSize?: string;
  defaultLevel?: string;
  visualPresetOptions?: Array<{ value: string; label: string }>;
  styleAriaLabel?: string;
  keys?: {
    role: string;
    size: string;
    align: string;
    level: string;
    decoration?: string;
    color?: string;
  };
}) {
  const values = block as any;
  const decorationKey = keys.decoration ?? "titleDecoration";
  const colorKey = keys.color ?? "titleColor";
  return (
    <InspectorDivision title="TITLE">
      <InspectorFieldRow
        label="Style"
        isOverridden={values[keys.size] !== undefined}
        inheritedValueText={defaultSize === "none" ? "None" : defaultSize === "inherit" ? "Inherit" : "Medium"}
        onReset={() => update({ [keys.size]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.size] ?? defaultSize)}
          options={visualPresetOptions ?? labels(UIKIT_HEADING_CAPABILITY.properties.visualPreset.values)}
          onChange={(value) => update({ [keys.size]: value })}
          ariaLabel={styleAriaLabel}
        />
      </InspectorFieldRow>

      {showDecoration && (
        <InspectorFieldRow
          label="Decoration"
          isOverridden={values[decorationKey] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [decorationKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[decorationKey] ?? "none")}
            options={[
              { value: "none", label: "None" },
              { value: "divider", label: "Divider" },
              { value: "bullet", label: "Bullet" },
              { value: "line", label: "Line" },
            ]}
            onChange={(value) => update({ [decorationKey]: value })}
          />
        </InspectorFieldRow>
      )}

      {showFontRole && (
        <InspectorFieldRow
          label="Font Family"
          isOverridden={values[keys.role] !== undefined && values[keys.role] !== "inherit"}
          inheritedValueText="Inherit"
          onReset={() => update({ [keys.role]: undefined })}
        >
          <InspectorSelect
            value={String(values[keys.role] ?? "inherit")}
            options={roleOptions}
            onChange={(value) => update({ [keys.role]: value === "inherit" ? undefined : value })}
            ariaLabel="Title font family"
          />
        </InspectorFieldRow>
      )}

      {showColor && (
        <InspectorFieldRow
          label="Color"
          isOverridden={values[colorKey] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [colorKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[colorKey] ?? "none")}
            options={[
              { value: "none", label: "None" },
              { value: "muted", label: "Muted" },
              { value: "emphasis", label: "Emphasis" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "success", label: "Success" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger" },
            ]}
            onChange={(value) => update({ [colorKey]: value })}
          />
        </InspectorFieldRow>
      )}

      <InspectorFieldRow
        label="HTML Element"
        isOverridden={values[keys.level] !== undefined}
        inheritedValueText={defaultLevel.toUpperCase()}
        onReset={() => update({ [keys.level]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.level] ?? defaultLevel)}
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
  showAlignment = true,
  showStyle = false,
  showColor = false,
  showPosition = false,
  showHtmlElement = true,
  keys = {
    role: "metaTypographyRole",
    align: "metaAlign",
    level: "metaHtmlElement",
    style: "metaStyle",
    color: "metaColor",
    position: "gridMetaAlign",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  showAlignment?: boolean;
  showStyle?: boolean;
  showColor?: boolean;
  showPosition?: boolean;
  showHtmlElement?: boolean;
  keys?: {
    role: string;
    align: string;
    level: string;
    style?: string;
    color?: string;
    position?: string;
  };
}) {
  const values = block as any;
  const styleKey = keys.style ?? "metaStyle";
  const colorKey = keys.color ?? "metaColor";
  const positionKey = keys.position ?? "gridMetaAlign";
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

      {showStyle && (
        <InspectorFieldRow
          label="Style"
          isOverridden={values[styleKey] !== undefined}
          inheritedValueText="Text meta"
          onReset={() => update({ [styleKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[styleKey] ?? "text-meta")}
            options={[
              { value: "text-meta", label: "Text Meta" },
              { value: "text-lead", label: "Text Lead" },
              { value: "heading-small", label: "Heading Small" },
            ]}
            onChange={(value) => update({ [styleKey]: value })}
          />
        </InspectorFieldRow>
      )}

      {showColor && (
        <InspectorFieldRow
          label="Color"
          isOverridden={values[colorKey] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [colorKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[colorKey] ?? "none")}
            options={[
              { value: "none", label: "None" },
              { value: "muted", label: "Muted" },
              { value: "emphasis", label: "Emphasis" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "success", label: "Success" },
              { value: "warning", label: "Warning" },
              { value: "danger", label: "Danger" },
            ]}
            onChange={(value) => update({ [colorKey]: value })}
          />
        </InspectorFieldRow>
      )}

      {showPosition && (
        <InspectorFieldRow
          label="Position"
          isOverridden={values[positionKey] !== undefined}
          inheritedValueText="Below title"
          onReset={() => update({ [positionKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[positionKey] ?? "below-title")}
            options={[
              { value: "above-title", label: "Above Title" },
              { value: "below-title", label: "Below Title" },
              { value: "below-content", label: "Below Content" },
            ]}
            onChange={(value) => update({ [positionKey]: value })}
          />
        </InspectorFieldRow>
      )}

      {showAlignment && <InspectorFieldRow
        label="Alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Left"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "left")}
          onChange={(value) => update({ [keys.align]: value })}
        />
      </InspectorFieldRow>}

      {showHtmlElement && (
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
            ariaLabel="Title HTML element"
          />
        </InspectorFieldRow>
      )}
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
  showAlignment = true,
  showStyle = false,
  showRole = true,
  defaultStyle = "none",
  styleOptions,
  keys = {
    role: "contentTypographyRole",
    align: "contentAlign",
    style: "contentStyle",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  showAlignment?: boolean;
  showStyle?: boolean;
  showRole?: boolean;
  defaultStyle?: string;
  styleOptions?: Array<{ value: string; label: string }>;
  keys?: {
    role: string;
    align: string;
    style?: string;
  };
}) {
  const values = block as any;
  const styleKey = keys.style ?? "contentStyle";
  return (
    <InspectorDivision title="CONTENT">
      {showRole && <InspectorFieldRow
        label="Font role"
        isOverridden={values[keys.role] !== undefined && values[keys.role] !== "inherit"}
        inheritedValueText="Inherit"
        onReset={() => update({ [keys.role]: undefined })}
      >
        <InspectorSelect
          value={String(values[keys.role] ?? "inherit")}
          options={roleOptions}
          onChange={(value) => update({ [keys.role]: value === "inherit" ? undefined : value })}
          ariaLabel="Content font role"
        />
      </InspectorFieldRow>}

      {showStyle && (
        <InspectorFieldRow
          label="Style"
          isOverridden={values[styleKey] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [styleKey]: undefined })}
        >
          <InspectorSelect
          value={String(values[styleKey] ?? defaultStyle)}
          options={styleOptions ?? CONTENT_STYLE_OPTIONS}
          onChange={(value) => update({ [styleKey]: value === "inherit" ? undefined : value })}
          ariaLabel="Content style"
          />
        </InspectorFieldRow>
      )}

      {showAlignment && <InspectorFieldRow
        label="Alignment"
        isOverridden={values[keys.align] !== undefined}
        inheritedValueText="Left"
        onReset={() => update({ [keys.align]: undefined })}
      >
        <InspectorAlignmentControl
          value={String(values[keys.align] ?? "left")}
          onChange={(value) => update({ [keys.align]: value })}
        />
      </InspectorFieldRow>}
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
  showFrameless = false,
  defaultFrameless = false,
  showLinkImage = false,
  showDimensions = true,
  showFrameControls = true,
  keys = {
    width: "imageWidth",
    height: "imageHeight",
    ratio: "imageRatio",
    fit: "imageFit",
    loading: "imageLoading",
    shape: "imageShape",
    shadow: "imageShadow",
    decoration: "imageBoxDecoration",
    align: "imageAlignment",
    frameless: "alignImageWithoutPadding",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  showFrameless?: boolean;
  defaultFrameless?: boolean;
  /** Exposes the canonical `linkImage` behavior when the parent provides a link URL. */
  showLinkImage?: boolean;
  /** Image Content owns source dimensions in the standalone YOOtheme UI. */
  showDimensions?: boolean;
  /** Ratio/Fit are WebPages framing behavior, not YOOtheme Image Settings. */
  showFrameControls?: boolean;
  keys?: {
    width: string;
    height: string;
    ratio?: string;
    fit?: string;
    loading: string;
    shape: string;
    shadow: string;
    decoration?: string;
    align: string;
    frameless?: string;
  };
}) {
  const values = block as any;
  const ratioKey = keys.ratio ?? "imageRatio";
  const fitKey = keys.fit ?? "imageFit";
  const shapeVal = values[keys.shape] ?? values.imageBorder ?? "none";
  const shadowVal = values[keys.shadow] ?? values.imageBoxShadow ?? "none";
  const decorationKey = keys.decoration ?? "imageBoxDecoration";
  const framelessKey = keys.frameless ?? "alignImageWithoutPadding";
  const decorationVal = values[decorationKey] ?? "none";

  return (
    <InspectorDivision title="IMAGE">
      {showDimensions && <div className="builder-two-column" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
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
      </div>}

      {showFrameControls && <InspectorFieldRow
        label="Ratio"
        isOverridden={values[ratioKey] !== undefined && values[ratioKey] !== "natural"}
        inheritedValueText="Natural"
        onReset={() => update({ [ratioKey]: undefined })}
      >
        <InspectorSelect
          value={String(values[ratioKey] ?? "natural")}
          options={[
            { value: "natural", label: "Natural" },
            { value: "square", label: "Square (1:1)" },
            { value: "4:3", label: "4:3" },
            { value: "3:2", label: "3:2" },
            { value: "16:9", label: "16:9" },
            { value: "portrait", label: "Portrait (3:4)" },
          ]}
          onChange={(value) => update({ [ratioKey]: value })}
        />
      </InspectorFieldRow>}

      {showFrameControls && <InspectorFieldRow
        label="Fit"
        isOverridden={values[fitKey] !== undefined}
        inheritedValueText="Natural"
        onReset={() => update({ [fitKey]: undefined })}
      >
        <InspectorSegmentedControl
          value={String(values[fitKey] ?? "natural")}
          options={[
            { value: "natural", label: "Natural" },
            { value: "cover", label: "Cover" },
            { value: "contain", label: "Contain" },
            { value: "fill", label: "Fill" },
          ]}
          onChange={(value) => update({ [fitKey]: value })}
        />
      </InspectorFieldRow>}

      <InspectorFieldRow
        label="Focal Point"
        isOverridden={values.imagePosition !== undefined}
        inheritedValueText="Center Center"
        onReset={() => update({ imagePosition: undefined })}
      >
        <InspectorSelect
          value={String(values.imagePosition ?? "center")}
          options={[
            { value: "top-left", label: "Top Left" },
            { value: "top-center", label: "Top Center" },
            { value: "top-right", label: "Top Right" },
            { value: "center-left", label: "Center Left" },
            { value: "center", label: "Center Center" },
            { value: "center-right", label: "Center Right" },
            { value: "bottom-left", label: "Bottom Left" },
            { value: "bottom-center", label: "Bottom Center" },
            { value: "bottom-right", label: "Bottom Right" },
          ]}
          onChange={(value) => update({ imagePosition: value === "center" ? undefined : value })}
          ariaLabel="Image focal point"
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Loading"
        isOverridden={values[keys.loading] !== undefined}
        inheritedValueText="Lazy"
        onReset={() => update({ [keys.loading]: undefined })}
      >
        <InspectorSelect
          value={typeof values[keys.loading] === "boolean" ? (values[keys.loading] ? "eager" : "lazy") : String(values[keys.loading] ?? "lazy")}
          options={[
            { value: "lazy", label: "Lazy (Default)" },
            { value: "eager", label: "Eager (Immediate)" },
          ]}
          onChange={(value) => update({ [keys.loading]: value })}
        />
      </InspectorFieldRow>

      {showLinkImage && (
        <InspectorFieldRow
          label="Link"
          isOverridden={values.linkImage !== undefined}
          inheritedValueText={defaultFrameless ? "On" : "Off"}
          onReset={() => update({ linkImage: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values.linkImage)}
            onChange={(checked) => update({ linkImage: checked })}
            label="Link image"
          />
        </InspectorFieldRow>
      )}

      <InspectorFieldRow
        label="Border"
        isOverridden={values[keys.shape] !== undefined || values.imageBorder !== undefined}
        inheritedValueText="None"
        onReset={() => update({ [keys.shape]: undefined, imageBorder: undefined })}
      >
        <InspectorSelect
          value={String(shapeVal)}
          options={[
            { value: "none", label: "None" },
            { value: "rounded", label: "Rounded" },
            { value: "circle", label: "Circle" },
            { value: "pill", label: "Pill" },
          ]}
          onChange={(value) => update({ [keys.shape]: value, imageBorder: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Box Shadow"
        isOverridden={values[keys.shadow] !== undefined || values.imageBoxShadow !== undefined}
        inheritedValueText="None"
        onReset={() => update({ [keys.shadow]: undefined, imageBoxShadow: undefined })}
      >
        <InspectorSelect
          value={String(shadowVal)}
          options={[
            { value: "none", label: "None" },
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
            { value: "xlarge", label: "X-Large" },
          ]}
          onChange={(value) => update({ [keys.shadow]: value, imageBoxShadow: value })}
        />
      </InspectorFieldRow>

      <InspectorFieldRow
        label="Box Decoration"
        isOverridden={values[decorationKey] !== undefined}
        inheritedValueText="None"
        onReset={() => update({ [decorationKey]: undefined })}
      >
        <InspectorSelect
          value={String(decorationVal)}
          options={[
            { value: "none", label: "None" },
            { value: "default", label: "Default" },
            { value: "primary", label: "Primary" },
            { value: "secondary", label: "Secondary" },
          ]}
          onChange={(value) => update({ [decorationKey]: value })}
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

      {showFrameless && (
        <InspectorFieldRow
          label="Image"
          isOverridden={values[framelessKey] !== undefined}
          inheritedValueText="Off"
          onReset={() => update({ [framelessKey]: undefined })}
        >
          <InspectorSwitch
            checked={values[framelessKey] === undefined ? defaultFrameless : Boolean(values[framelessKey])}
            onChange={(checked) => update({ [framelessKey]: checked })}
            label="Align image without padding"
          />
        </InspectorFieldRow>
      )}
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
  showFullWidth = false,
  showMargin = false,
  showPresentation = true,
  keys = {
    visible: "panelActionVisible",
    label: "buttonLabel",
    url: "buttonUrl",
    target: "buttonTarget",
    style: "buttonStyle",
    size: "size",
    width: "fullWidthButton",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  showVisibilityToggle?: boolean;
  showFullWidth?: boolean;
  showMargin?: boolean;
  /** Content tabs use the same action contract without repeating style controls. */
  showPresentation?: boolean;
  keys?: {
    visible?: string;
    label?: string;
    url?: string;
    target?: string;
    style?: string;
    size?: string;
    width?: string;
    margin?: string;
  };
}) {
  const values = block as any;
  const styleKey = keys.style ?? "buttonStyle";
  const sizeKey = keys.size ?? "size";
  const labelKey = keys.label;
  const urlKey = keys.url;
  const targetKey = keys.target;
  const visibleKey = keys.visible;
  const widthKey = keys.width;
  const marginKey = keys.margin;

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

      {showPresentation && <>
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
            ariaLabel="Button variant"
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
      </>}

      {showFullWidth && widthKey && (
        <InspectorFieldRow
          label="Full width"
          isOverridden={values[widthKey] !== undefined}
          inheritedValueText="Off"
          onReset={() => update({ [widthKey]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values[widthKey])}
            onChange={(checked) => update({ [widthKey]: checked })}
            label="Full width button"
          />
        </InspectorFieldRow>
      )}

      {showMargin && marginKey && (
        <InspectorFieldRow label="Link margin">
          <InspectorSelect
            value={String(values[marginKey] ?? "none")}
            options={[
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
            ]}
            onChange={(value) => update({ [marginKey]: value === "none" ? undefined : value })}
            ariaLabel="Link margin"
          />
        </InspectorFieldRow>
      )}
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
  surfaceOptions,
  sizeOptions,
  defaultSize = "default",
  showLink = false,
  linkFirst = false,
  sizeLabel = "Size",
  hoverLabel = "Enable hover effect",
  showHeight = false,
  showImageNoPadding = false,
  surfaceValue,
  onSurfaceChange,
  keys = {
    variant: "panelVariant",
    size: "panelSize",
    hover: "panelHover",
    link: "linkPanel",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  surfaceOptions?: Array<{ value: string; label: string }>;
  sizeOptions?: Array<{ value: string; label: string }>;
  defaultSize?: string;
  showLink?: boolean;
  linkFirst?: boolean;
  sizeLabel?: string;
  hoverLabel?: string;
  /** Panel-only YOOtheme height/expansion semantics belong to its Panel group. */
  showHeight?: boolean;
  /** Panel-only image padding semantics belong to its Panel group. */
  showImageNoPadding?: boolean;
  /** Adapts a composed canonical surface state to a YOOtheme-facing choice. */
  surfaceValue?: (values: Record<string, unknown>) => string | undefined;
  /** Normalizes a YOOtheme-facing choice into the canonical surface state. */
  onSurfaceChange?: (value: string) => Record<string, unknown>;
  keys?: {
    variant: string;
    size: string;
    hover: string;
    link?: string;
  };
}) {
  const values = block as any;
  const linkKey = keys.link ?? "linkPanel";
  const variantValues = ["default", "primary", "secondary", "blank"] as const;
  const sizeValues = ["small", "default", "large"] as const;

  return (
    <InspectorDivision title={title}>
      <InspectorFieldRow
        label={surfaceOptions ? "Style" : "Variant"}
        isOverridden={values[keys.variant] !== undefined}
        inheritedValueText={surfaceOptions ? "None" : "Default"}
        onReset={() => update({ [keys.variant]: undefined })}
      >
        {surfaceOptions ? (
          <InspectorSelect
            value={String(surfaceValue?.(values) ?? values[keys.variant] ?? "none")}
            options={surfaceOptions}
            onChange={(value) => update(onSurfaceChange?.(value) ?? { [keys.variant]: value })}
            ariaLabel="Panel style"
          />
        ) : (
          <InspectorPillGroup
            value={String(values[keys.variant] ?? "default")}
            options={labels(variantValues)}
            onChange={(value) => update({ [keys.variant]: value })}
            ariaLabel="Card variant"
          />
        )}
      </InspectorFieldRow>

      {showLink && linkFirst && (
        <InspectorFieldRow
          label="Link"
          isOverridden={values[linkKey] !== undefined}
          inheritedValueText="Off"
          onReset={() => update({ [linkKey]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values[linkKey])}
            onChange={(checked) => update({ [linkKey]: checked })}
            label="Link entire panel"
          />
        </InspectorFieldRow>
      )}

      {linkFirst && (
        <InspectorFieldRow
          label="Hover effect"
          isOverridden={values[keys.hover] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [keys.hover]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values[keys.hover])}
            onChange={(checked) => update({ [keys.hover]: checked })}
            label={hoverLabel}
          />
        </InspectorFieldRow>
      )}

      <InspectorFieldRow
        label={sizeLabel}
        isOverridden={values[keys.size] !== undefined}
        inheritedValueText={defaultSize === "none" ? "None" : "Default"}
        onReset={() => update({ [keys.size]: undefined })}
      >
        <InspectorPillGroup
          value={String(values[keys.size] ?? defaultSize)}
          options={sizeOptions ?? labels(sizeValues)}
          onChange={(value) => update({ [keys.size]: value })}
          ariaLabel="Card size"
        />
      </InspectorFieldRow>

      {!linkFirst && (
        <InspectorFieldRow
          label="Hover effect"
          isOverridden={values[keys.hover] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [keys.hover]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values[keys.hover])}
            onChange={(checked) => update({ [keys.hover]: checked })}
            label={hoverLabel}
          />
        </InspectorFieldRow>
      )}

      {showImageNoPadding && (
        <InspectorFieldRow
          label="Image"
          isOverridden={values.panelImageNoPadding !== undefined}
          inheritedValueText="With padding"
          onReset={() => update({ panelImageNoPadding: undefined })}
        >
          <InspectorSwitch
            checked={values.panelImageNoPadding === true}
            onChange={(checked) => update({ panelImageNoPadding: checked })}
            label="Image without padding"
          />
        </InspectorFieldRow>
      )}

      {showHeight && (
        <>
          <InspectorFieldRow label="Height">
            <InspectorSwitch
              checked={values.panelHeightExpand === true}
              onChange={(checked) => update({ panelHeightExpand: checked, panelExpand: checked ? values.panelExpand ?? "none" : "none" })}
              label="Fill the available column space"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Expand Content">
            <InspectorSelect
              value={String(values.panelExpand ?? "none")}
              options={[
                { value: "none", label: "None" }, { value: "image", label: "Image" },
                { value: "content", label: "Content" }, { value: "both", label: "Image and Content" },
              ]}
              onChange={(value) => update({ panelExpand: value, panelHeightExpand: value !== "none" ? true : values.panelHeightExpand })}
              ariaLabel="Panel expand content"
            />
          </InspectorFieldRow>
        </>
      )}

      {showLink && !linkFirst && (
        <InspectorFieldRow
          label="Link"
          isOverridden={values[linkKey] !== undefined}
          inheritedValueText="Off"
          onReset={() => update({ [linkKey]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values[linkKey])}
            onChange={(checked) => update({ [linkKey]: checked })}
            label="Link entire panel"
          />
        </InspectorFieldRow>
      )}
    </InspectorDivision>
  );
}

/**
 * Canonical Media Layout Settings Group.
 * Owns only structural media placement. Image appearance belongs exclusively
 * to ImageSettingsGroup, regardless of the element rendering the image.
 */
export function MediaSettingsGroup({
  block,
  update,
  title = "MEDIA",
  keys = {
    showMedia: "panelShowMedia",
    placement: "panelMediaPlacement",
    width: "panelMediaWidth",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  title?: string;
  keys?: {
    showMedia: string;
    placement: string;
    width: string;
  };
}) {
  const values = block as any;
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
