"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type {
  DynamicContentContextDescriptor,
  DynamicFieldBinding,
  DynamicFieldBindings,
} from "@/lib/dynamicContent";
import type { DynamicBindingDestination } from "@/lib/dynamicContentCapabilities";
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
import DynamicFieldBindingControl from "@/components/dashboard/inspector/panels/DynamicFieldBindingControl";

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
  showMargin = false,
  showDecoration = false,
  showColor = false,
  showLink = false,
  showPanelLayout = false,
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
    link: "linkTitle",
    margin: "titleMarginTop",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  showFontRole?: boolean;
  showMargin?: boolean;
  /** @deprecated Alignment is owned by the shared General settings panel. */
  showAlignment?: boolean;
  showDecoration?: boolean;
  showColor?: boolean;
  showLink?: boolean;
  showPanelLayout?: boolean;
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
    link?: string;
    margin?: string;
  };
}) {
  const values = block as any;
  const decorationKey = keys.decoration ?? "titleDecoration";
  const colorKey = keys.color ?? "titleColor";
  const linkKey = keys.link ?? "linkTitle";
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

      {showMargin && (
        <InspectorFieldRow
          label="Margin Top"
          isOverridden={values[keys.margin ?? "titleMarginTop"] !== undefined}
          inheritedValueText="Medium"
          onReset={() => update({ [keys.margin ?? "titleMarginTop"]: undefined })}
        >
          <InspectorSelect
            value={String(values[keys.margin ?? "titleMarginTop"] ?? "medium")}
            options={[{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "none", label: "None" }]}
            onChange={(value) => update({ [keys.margin ?? "titleMarginTop"]: value })}
            ariaLabel="Title margin top"
          />
        </InspectorFieldRow>
      )}

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
              { value: "background", label: "Background" },
            ]}
            onChange={(value) => update({ [colorKey]: value })}
          />
        </InspectorFieldRow>
      )}

      {showLink && (
        <InspectorFieldRow
          label="Link"
          isOverridden={values[linkKey] !== undefined}
          inheritedValueText="Off"
          onReset={() => update({ [linkKey]: undefined })}
        >
          <InspectorSwitch
            checked={values[linkKey] === true}
            onChange={(value) => update({ [linkKey]: value || undefined })}
            label="Link title"
          />
        </InspectorFieldRow>
      )}

      {showPanelLayout && <>
        <InspectorFieldRow label="Hover Style" isOverridden={values.panelTitleHoverStyle !== undefined} inheritedValueText="None" onReset={() => update({ panelTitleHoverStyle: undefined })}>
          <InspectorSelect value={String(values.panelTitleHoverStyle ?? "none")} options={[{ value: "none", label: "None" }, { value: "heading-link", label: "Heading Link" }, { value: "default-link", label: "Default Link" }]} onChange={(value) => update({ panelTitleHoverStyle: value })} ariaLabel="Panel title hover style" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Alignment" isOverridden={values.panelTitleAlign !== undefined} inheritedValueText="Top" onReset={() => update({ panelTitleAlign: undefined })}>
          <InspectorSelect value={String(values.panelTitleAlign ?? "top")} options={[{ value: "top", label: "Top" }, { value: "left", label: "Left" }]} onChange={(value) => update({ panelTitleAlign: value })} ariaLabel="Panel title alignment" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Grid Width" isOverridden={values.panelTitleGridWidth !== undefined} inheritedValueText="Auto" onReset={() => update({ panelTitleGridWidth: undefined })}>
          <InspectorSelect value={String(values.panelTitleGridWidth ?? "auto")} options={[{ value: "auto", label: "Auto" }, { value: "expand", label: "Expand" }, { value: "80%", label: "80%" }, { value: "75%", label: "75%" }, { value: "66%", label: "66%" }, { value: "60%", label: "60%" }, { value: "50%", label: "50%" }, { value: "40%", label: "40%" }, { value: "33%", label: "33%" }, { value: "25%", label: "25%" }, { value: "20%", label: "20%" }]} onChange={(value) => update({ panelTitleGridWidth: value === "auto" ? undefined : value })} ariaLabel="Panel title grid width" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Grid Breakpoint" isOverridden={values.panelTitleGridBreakpoint !== undefined} inheritedValueText="Always" onReset={() => update({ panelTitleGridBreakpoint: undefined })}>
          <InspectorSelect value={String(values.panelTitleGridBreakpoint ?? "always")} options={[{ value: "always", label: "Always" }, { value: "small", label: "Small (Phone Landscape)" }, { value: "medium", label: "Medium (Tablet Landscape)" }, { value: "large", label: "Large (Desktop)" }, { value: "xlarge", label: "X-Large (Large Screens)" }]} onChange={(value) => update({ panelTitleGridBreakpoint: value })} ariaLabel="Panel title grid breakpoint" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Grid Column Gap" isOverridden={values.panelTitleGridColumnGap !== undefined} inheritedValueText="Default" onReset={() => update({ panelTitleGridColumnGap: undefined })}>
          <InspectorSelect value={String(values.panelTitleGridColumnGap ?? "default")} options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }, { value: "none", label: "None" }]} onChange={(value) => update({ panelTitleGridColumnGap: value })} ariaLabel="Panel title grid column gap" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Grid Row Gap" isOverridden={values.panelTitleGridRowGap !== undefined} inheritedValueText="Default" onReset={() => update({ panelTitleGridRowGap: undefined })}>
          <InspectorSelect value={String(values.panelTitleGridRowGap ?? "default")} options={[{ value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }, { value: "none", label: "None" }]} onChange={(value) => update({ panelTitleGridRowGap: value })} ariaLabel="Panel title grid row gap" />
        </InspectorFieldRow>
      </>}

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
 * Displays optional legacy Font role plus YOOtheme-compatible meta controls.
 */
export function MetaSettingsGroup({
  block,
  update,
  showAlignment = true,
  showRole = true,
  showStyle = false,
  showColor = false,
  showPosition = false,
  showHtmlElement = true,
  positionLabel = "Position",
  showMargin = false,
  styleOptions,
  htmlElementOptions = ["div", "span", "p"],
  keys = {
    role: "metaTypographyRole",
    align: "metaAlign",
    level: "metaHtmlElement",
    style: "metaStyle",
    color: "metaColor",
    position: "gridMetaAlign",
    margin: "metaMarginTop",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  showAlignment?: boolean;
  showRole?: boolean;
  showStyle?: boolean;
  showColor?: boolean;
  showPosition?: boolean;
  showHtmlElement?: boolean;
  /** Some YOOtheme components name their content-order choice Alignment. */
  positionLabel?: string;
  /** Expose the source component's canonical margin owner when it has one. */
  showMargin?: boolean;
  /** Element-specific YOOtheme style vocabulary. */
  styleOptions?: ReadonlyArray<{ value: string; label: string }>;
  /** Element-specific HTML element vocabulary. */
  htmlElementOptions?: ReadonlyArray<string>;
  keys?: {
    role: string;
    align: string;
    level: string;
    style?: string;
    color?: string;
    position?: string;
    margin?: string;
  };
}) {
  const values = block as any;
  const styleKey = keys.style ?? "metaStyle";
  const colorKey = keys.color ?? "metaColor";
  const positionKey = keys.position ?? "gridMetaAlign";
  return (
    <InspectorDivision title="META">
      {showRole && (
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
      )}

      {showStyle && (
        <InspectorFieldRow
          label="Style"
          isOverridden={values[styleKey] !== undefined}
          inheritedValueText="Text meta"
          onReset={() => update({ [styleKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[styleKey] ?? "text-meta")}
            options={styleOptions ?? [
              { value: "text-meta", label: "Text Meta" },
              { value: "text-lead", label: "Text Lead" },
              { value: "heading-small", label: "Heading Small" },
            ]}
            onChange={(value) => update({ [styleKey]: value === "inherit" ? undefined : value })}
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
          label={positionLabel}
          isOverridden={values[positionKey] !== undefined}
          inheritedValueText="Below title"
          onReset={() => update({ [positionKey]: undefined })}
        >
          <InspectorSelect
            value={String(values[positionKey] ?? "below-title")}
            options={[
              { value: "above-title", label: "Above Title" },
              { value: "below-title", label: "Below Title" },
              { value: "above-content", label: "Above Content" },
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
            options={(htmlElementOptions ?? ["div", "span", "p"]).map((v) => ({
              value: v,
              // YOOtheme displays the authored HTML element value verbatim
              // (for example `h3`, not an invented `H3` label).
              label: v,
            }))}
            onChange={(value) => update({ [keys.level]: value })}
            ariaLabel="Title HTML element"
          />
        </InspectorFieldRow>
      )}

      {showMargin && (
        <InspectorFieldRow
          label="Margin Top"
          isOverridden={values[keys.margin ?? "metaMarginTop"] !== undefined}
          inheritedValueText="Default"
          onReset={() => update({ [keys.margin ?? "metaMarginTop"]: undefined })}
        >
          <InspectorSelect
            value={String(values[keys.margin ?? "metaMarginTop"] ?? "default")}
            options={[
              { value: "small", label: "Small" },
              { value: "default", label: "Default" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
              { value: "none", label: "None" },
            ]}
            onChange={(value) => update({ [keys.margin ?? "metaMarginTop"]: value })}
            ariaLabel="Meta margin top"
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
  title = "CONTENT",
  showAlignment = true,
  showStyle = false,
  showRole = true,
  showMargin = false,
  defaultStyle = "none",
  styleOptions,
  keys = {
    role: "contentTypographyRole",
    align: "contentAlign",
    style: "contentStyle",
    margin: "contentMarginTop",
  },
}: {
  block: BuilderLayoutBlock;
  update: (patch: any) => void;
  /** Compose the same owner under a component-specific semantic group. */
  title?: string;
  showAlignment?: boolean;
  showStyle?: boolean;
  showRole?: boolean;
  showMargin?: boolean;
  defaultStyle?: string;
  styleOptions?: ReadonlyArray<{ value: string; label: string }>;
  keys?: {
    role: string;
    align: string;
    style?: string;
    margin?: string;
  };
}) {
  const values = block as any;
  const styleKey = keys.style ?? "contentStyle";
  return (
    <InspectorDivision title={title}>
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

      {showMargin && (
        <InspectorFieldRow
          label="Margin Top"
          isOverridden={values[keys.margin ?? "contentMarginTop"] !== undefined}
          inheritedValueText="Default"
          onReset={() => update({ [keys.margin ?? "contentMarginTop"]: undefined })}
        >
          <InspectorSelect
            value={String(values[keys.margin ?? "contentMarginTop"] ?? "default")}
            options={[{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }, { value: "none", label: "None" }]}
            onChange={(value) => update({ [keys.margin ?? "contentMarginTop"]: value })}
            ariaLabel="Content margin top"
          />
        </InspectorFieldRow>
      )}
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
  showAlignment = true,
  showFocalPoint = true,
  showTransition = false,
  showBorder = true,
  showShadow = true,
  showHoverShadow = false,
  disableHoverShadow = false,
  hoverShadowOptions,
  showDecoration = true,
  showInverse = false,
  showSvgAnimate = false,
  showHeightControls = false,
  showTextColor = false,
  loadingCheckbox = false,
  showSvgControls = false,
  showSvgColorWhenInlineDisabled = false,
  svgColorLabel = "SVG Style",
  svgColorOptions,
  mediaLayout,
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
    svgInline: "imageSvgInline",
    svgColor: "imageSvgColor",
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
  /** Hide when a component owns image placement through its structural layout. */
  showAlignment?: boolean;
  /** Focal positioning only belongs where the composed media runtime consumes it. */
  showFocalPoint?: boolean;
  /** Image hover transition used by YOOtheme slider/media compositions. */
  showTransition?: boolean;
  /** Border is not part of every YOOtheme media composition (for example sliders). */
  showBorder?: boolean;
  /** Keep shared shadow semantics available without forcing them into every composition. */
  showShadow?: boolean;
  showHoverShadow?: boolean;
  /** Some YOOtheme elements expose hover shadow only once their link is active. */
  disableHoverShadow?: boolean;
  /** The standalone Image element omits the shared Bottom shadow variant. */
  hoverShadowOptions?: ReadonlyArray<{ value: string; label: string }>;
  showInverse?: boolean;
  showSvgAnimate?: boolean;
  showHeightControls?: boolean;
  showTextColor?: boolean;
  loadingCheckbox?: boolean;
  /** Keep shared decoration semantics available without forcing them into every composition. */
  showDecoration?: boolean;
  /** Compose the canonical YOOtheme stylable-SVG controls where the parent element exposes them. */
  showSvgControls?: boolean;
  /** Preserve YOOtheme's disabled SVG Color control before Inline SVG is enabled. */
  showSvgColorWhenInlineDisabled?: boolean;
  /** Components may use YOOtheme's semantic label while sharing the same color owner. */
  svgColorLabel?: string;
  /** Source-specific vocabulary for the shared SVG color owner. */
  svgColorOptions?: ReadonlyArray<{ value: string; label: string }>;
  /** Structural Panel media placement remains a Panel owner but is presented in YOOtheme's Image group. */
  mediaLayout?: { placement: string; width: string; verticalAlign?: string; widthOptions?: ReadonlyArray<{ value: string; label: string }>; alignmentOptions?: readonly string[] };
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
    svgInline?: string;
    svgColor?: string;
  };
}) {
  const values = block as any;
  const ratioKey = keys.ratio ?? "imageRatio";
  const fitKey = keys.fit ?? "imageFit";
  const shapeVal = values[keys.shape] ?? values.imageBorder ?? "none";
  const shadowVal = values[keys.shadow] ?? values.imageBoxShadow ?? "none";
  const decorationKey = keys.decoration ?? "imageBoxDecoration";
  const framelessKey = keys.frameless ?? "alignImageWithoutPadding";
  const svgInlineKey = keys.svgInline ?? "imageSvgInline";
  const svgColorKey = keys.svgColor ?? "imageSvgColor";
  const decorationVal = values[decorationKey] ?? "none";
  const normalizeDimensionInput = (value: string) => {
    const normalized = value.trim();
    if (!normalized || normalized === "auto") return normalized;
    return /^\d+(?:\.\d+)?$/.test(normalized) ? `${normalized}px` : normalized;
  };

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
            onChange={(val) => update({ [keys.width]: val.trim() || undefined })}
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
            onChange={(val) => update({ [keys.height]: val.trim() || undefined })}
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

      {showFocalPoint && <InspectorFieldRow
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
      </InspectorFieldRow>}

      {loadingCheckbox ? (
        <InspectorFieldRow label="Loading" isOverridden={values[keys.loading] !== undefined} inheritedValueText="Lazy" onReset={() => update({ [keys.loading]: undefined })}>
          <InspectorSwitch
            checked={values[keys.loading] === "eager" || values[keys.loading] === true}
            onChange={(checked) => update({ [keys.loading]: checked ? "eager" : undefined })}
            label="Load image eagerly"
          />
        </InspectorFieldRow>
      ) : <InspectorFieldRow
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
      </InspectorFieldRow>}

      {showTransition && <InspectorFieldRow
        label="Transition"
        isOverridden={values.imageHoverTransition !== undefined}
        inheritedValueText="None"
        onReset={() => update({ imageHoverTransition: undefined })}
      >
        <InspectorSelect
          value={String(values.imageHoverTransition ?? "none")}
          options={[
            { value: "none", label: "None" },
            { value: "scale-up", label: "Scale Up" },
            { value: "scale-down", label: "Scale Down" },
          ]}
          onChange={(value) => update({ imageHoverTransition: value === "none" ? undefined : value })}
        />
      </InspectorFieldRow>}

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

      {showBorder && <InspectorFieldRow
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
      </InspectorFieldRow>}

      {showShadow && <InspectorFieldRow
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
            { value: "bottom", label: "Bottom" },
          ]}
          onChange={(value) => update({ [keys.shadow]: value, imageBoxShadow: value })}
        />
      </InspectorFieldRow>}

      {showHoverShadow && <InspectorFieldRow
        label="Hover Box Shadow"
        isOverridden={values.imageHoverBoxShadow !== undefined}
        inheritedValueText="None"
        onReset={() => update({ imageHoverBoxShadow: undefined })}
      >
        <InspectorSelect
          value={String(values.imageHoverBoxShadow ?? "none")}
          options={hoverShadowOptions ?? ["none", "small", "medium", "large", "xlarge", "bottom"].map((value) => ({
            value,
            label: value === "none" ? "None" : value === "xlarge" ? "X-Large" : value.charAt(0).toUpperCase() + value.slice(1),
          }))}
          disabled={disableHoverShadow}
          onChange={(value) => update({ imageHoverBoxShadow: value === "none" ? undefined : value })}
          ariaLabel="Image hover box shadow"
        />
      </InspectorFieldRow>}

      {showDecoration && <InspectorFieldRow
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
            { value: "shadow", label: "Floating Shadow" },
            { value: "mask", label: "Mask" },
          ]}
          onChange={(value) => update({ [decorationKey]: value })}
        />
      </InspectorFieldRow>}

      {showInverse && <InspectorFieldRow label="" isOverridden={values.imageInverse !== undefined} inheritedValueText="Off" onReset={() => update({ imageInverse: undefined })}>
        <InspectorSwitch checked={values.imageInverse === true} onChange={(checked) => update({ imageInverse: checked || undefined })} label="Inverse style" />
      </InspectorFieldRow>}

      {showSvgControls && <InspectorFieldRow
        label="Inline SVG"
        isOverridden={values[svgInlineKey] !== undefined}
        inheritedValueText="Off"
        onReset={() => update({ [svgInlineKey]: undefined })}
      >
        <InspectorSwitch
          checked={values[svgInlineKey] === true}
          onChange={(checked) => update({ [svgInlineKey]: checked || undefined })}
          label="Make SVG stylable with CSS"
        />
      </InspectorFieldRow>}

      {showSvgControls && (values[svgInlineKey] === true || showSvgColorWhenInlineDisabled) && <InspectorFieldRow
        label={svgColorLabel}
        isOverridden={values[svgColorKey] !== undefined}
        inheritedValueText={svgColorOptions ? "None" : "Primary"}
        onReset={() => update({ [svgColorKey]: undefined })}
      >
        <InspectorSelect
          value={String(values[svgColorKey] ?? (svgColorOptions ? "none" : "primary"))}
          options={svgColorOptions ?? [
            { value: "primary", label: "Primary" },
            { value: "secondary", label: "Secondary" },
            { value: "default", label: "Default" },
            { value: "muted", label: "Muted" },
            { value: "emphasis", label: "Emphasis" },
            { value: "inverse", label: "Inverse" },
          ]}
          disabled={values[svgInlineKey] !== true}
          onChange={(value) => update({ [svgColorKey]: value === "none" ? undefined : value })}
          ariaLabel={svgColorLabel}
        />
      </InspectorFieldRow>}

      {showSvgAnimate && <InspectorFieldRow label="" isOverridden={values.imageSvgAnimate !== undefined} inheritedValueText="Off" onReset={() => update({ imageSvgAnimate: undefined })}>
        <InspectorSwitch checked={values.imageSvgAnimate === true} onChange={(checked) => update({ imageSvgAnimate: checked || undefined })} label="Animate strokes" disabled={values[svgInlineKey] !== true} />
      </InspectorFieldRow>}

      {showHeightControls && <>
        <InspectorFieldRow label="Height" isOverridden={values.imageHeight !== undefined} inheritedValueText="Auto" onReset={() => update({ imageHeight: undefined })}>
          <InspectorSwitch checked={values.imageHeight === "column"} onChange={(checked) => update({ imageHeight: checked ? "column" : undefined })} label="Fill the available column space" />
        </InspectorFieldRow>
        <InspectorFieldRow label="" isOverridden={values.imageHeight === "viewport"} inheritedValueText="Off" onReset={() => update({ imageHeight: undefined })}>
          <InspectorSwitch checked={values.imageHeight === "viewport"} onChange={(checked) => update({ imageHeight: checked ? "viewport" : undefined })} label="Force viewport height" />
        </InspectorFieldRow>
      </>}

      {showTextColor && <InspectorFieldRow label="Text Color" isOverridden={values.imageTextColor !== undefined} inheritedValueText="None" onReset={() => update({ imageTextColor: undefined })}>
        <InspectorSelect value={String(values.imageTextColor ?? "none")} options={[{ value: "none", label: "None" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} onChange={(value) => update({ imageTextColor: value === "none" ? undefined : value })} />
      </InspectorFieldRow>}

      {showAlignment && (
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
      )}

      {mediaLayout && (
        <>
          <InspectorFieldRow
            label="Alignment"
            isOverridden={values[mediaLayout.placement] !== undefined}
            inheritedValueText="Top"
            onReset={() => update({ [mediaLayout.placement]: undefined })}
          >
            <InspectorMediaPlacementControl
              value={(values[mediaLayout.placement] ?? "top") as string}
              options={mediaLayout.alignmentOptions}
              onChange={(value) => update({ [mediaLayout.placement]: value })}
              ariaLabel="Panel media alignment"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Grid width"
            isOverridden={values[mediaLayout.width] !== undefined}
            inheritedValueText="Medium"
            onReset={() => update({ [mediaLayout.width]: undefined })}
          >
            <InspectorSelect
              value={String(values[mediaLayout.width] ?? "medium")}
              options={mediaLayout.widthOptions ?? [
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
              onChange={(value) => update({ [mediaLayout.width]: value })}
              ariaLabel="Panel media grid width"
            />
          </InspectorFieldRow>
          {mediaLayout.verticalAlign && (
            <InspectorFieldRow label="Vertical alignment">
              <InspectorSwitch
                checked={values[mediaLayout.verticalAlign] === "center"}
                onChange={(checked) => update({ [mediaLayout.verticalAlign!]: checked ? "center" : "top" })}
                label="Center"
              />
            </InspectorFieldRow>
          )}
        </>
      )}

      {showFrameless && (
        <InspectorFieldRow
          label=""
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
  showLabel = true,
  showUrl = true,
  showTarget = true,
  showAriaLabel = false,
  targetFirst = false,
  targetControl = "select",
  presentationControl = "pills",
  inheritedValues,
  showPresentation = true,
  terminology = "action",
  dynamicContext,
  dynamicBindings,
  dynamicLabelDestination,
  dynamicUrlDestination,
  onDynamicBindingChange,
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
  showLabel?: boolean;
  showUrl?: boolean;
  showTarget?: boolean;
  showAriaLabel?: boolean;
  /** Match component contracts that place target before the visible link text. */
  targetFirst?: boolean;
  /** A new-window switch is the same canonical target owner as the select. */
  targetControl?: "select" | "new-window-switch";
  /** Components may compose the shared variants as selects rather than pills. */
  presentationControl?: "pills" | "select";
  /** Element-level defaults presented by an item without turning them into local overrides. */
  inheritedValues?: Record<string, unknown>;
  /** Content tabs use the same action contract without repeating style controls. */
  showPresentation?: boolean;
  /** Grid uses YOOtheme's Link vocabulary while keeping the same owner. */
  terminology?: "action" | "link";
  dynamicContext?: DynamicContentContextDescriptor;
  dynamicBindings?: DynamicFieldBindings;
  dynamicLabelDestination?: DynamicBindingDestination;
  dynamicUrlDestination?: DynamicBindingDestination;
  onDynamicBindingChange?: (
    destination: string,
    binding: DynamicFieldBinding | undefined,
  ) => void;
  keys?: {
    visible?: string;
    label?: string;
    url?: string;
    target?: string;
    aria?: string;
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
  const ariaKey = keys.aria;
  const visibleKey = keys.visible;
  const widthKey = keys.width;
  const marginKey = keys.margin;
  const labelLabel = terminology === "link" ? "Text" : "Action label";
  const urlLabel = terminology === "link" ? "URL" : "Action URL";
  const targetLabel = terminology === "link" ? "Target" : "Action target";
  const inherited = inheritedValues ?? {};
  const resolvedStyle = values[styleKey] ?? inherited[styleKey] ?? "primary";
  const resolvedSize = values[sizeKey] ?? inherited[sizeKey] ?? "default";
  const resolvedFullWidth = values[widthKey ?? ""] ?? inherited[widthKey ?? ""] ?? false;
  const resolvedMargin = values[marginKey ?? ""] ?? inherited[marginKey ?? ""] ?? "none";
  // This follows the actual YOOtheme Link control vocabulary: the Button
  // variants retain their Button prefix, while Link, Link Muted and Link Text
  // remain link semantics rather than being relabelled as buttons.
  const styleOptions = labels(UIKIT_BUTTON_CAPABILITY.properties.variant.values).map((option) => (
    terminology === "link" && !option.value.startsWith("link")
      ? { ...option, label: `Button ${option.label}` }
      : option
  ));

  const targetField = showTarget && targetKey ? (
    <InspectorFieldRow
      label={targetLabel}
      isOverridden={values[targetKey] !== undefined}
      inheritedValueText="Same window"
      onReset={() => update({ [targetKey]: undefined })}
    >
      {targetControl === "new-window-switch" ? (
        <InspectorSwitch
          checked={values[targetKey] === "_blank"}
          onChange={(checked) => update({ [targetKey]: checked ? "_blank" : undefined })}
          label="Open in a new window"
        />
      ) : (
        <InspectorSelect
          value={String(values[targetKey] ?? "_self")}
          options={BUILDER_LINK_TARGET_OPTIONS}
          onChange={(val) => update({ [targetKey]: val })}
          ariaLabel={targetLabel}
        />
      )}
    </InspectorFieldRow>
  ) : null;

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

      {targetFirst && targetField}

      {showLabel && labelKey && (
        <InspectorFieldRow
          label={labelLabel}
          labelAccessory={dynamicContext && onDynamicBindingChange ? (
            <DynamicFieldBindingControl
              destination={dynamicLabelDestination ?? "buttonLabel"}
              label={labelLabel}
              descriptor={dynamicContext}
              binding={dynamicBindings?.[labelKey]}
              onChange={(binding) => onDynamicBindingChange(labelKey, binding)}
            />
          ) : undefined}
          isOverridden={values[labelKey] !== undefined}
          inheritedValueText="Action"
          onReset={() => update({ [labelKey]: undefined })}
        >
          <>
            <InspectorTextField
              value={String(values[labelKey] ?? "")}
              onChange={(val) => update({ [labelKey]: val })}
              ariaLabel={labelLabel}
            />
          </>
        </InspectorFieldRow>
      )}

      {showUrl && urlKey && (
        <InspectorFieldRow
          label={urlLabel}
          labelAccessory={dynamicContext && onDynamicBindingChange ? (
            <DynamicFieldBindingControl
              destination={dynamicUrlDestination ?? "buttonUrl"}
              label={urlLabel}
              descriptor={dynamicContext}
              binding={dynamicBindings?.[urlKey]}
              onChange={(binding) => onDynamicBindingChange(urlKey, binding)}
            />
          ) : undefined}
          isOverridden={values[urlKey] !== undefined}
          inheritedValueText="#"
          onReset={() => update({ [urlKey]: undefined })}
        >
          <>
            <InspectorTextField
              value={String(values[urlKey] ?? "")}
              onChange={(val) => update({ [urlKey]: val })}
              ariaLabel={urlLabel}
            />
          </>
        </InspectorFieldRow>
      )}

      {!targetFirst && targetField}

      {showAriaLabel && ariaKey && (
        <InspectorFieldRow label="ARIA Label">
          <InspectorTextField
            value={String(values[ariaKey] ?? "")}
            onChange={(val) => update({ [ariaKey]: val || undefined })}
            ariaLabel="ARIA label"
          />
        </InspectorFieldRow>
      )}

      {showPresentation && <>
        <InspectorFieldRow
          label="Style"
          isOverridden={values[styleKey] !== undefined}
          inheritedValueText={String(inherited[styleKey] ?? "Primary")}
          onReset={() => update({ [styleKey]: undefined })}
        >
          {presentationControl === "select" ? (
            <InspectorSelect
              value={String(resolvedStyle)}
              options={styleOptions}
              onChange={(value) => update({ [styleKey]: value })}
              ariaLabel="Button variant"
            />
          ) : (
            <InspectorPillGroup
              value={String(resolvedStyle)}
              options={styleOptions}
              onChange={(value) => update({ [styleKey]: value })}
              ariaLabel="Button variant"
              className="button-variant-control"
            />
          )}
        </InspectorFieldRow>

        <InspectorFieldRow
          label="Button size"
          isOverridden={values[sizeKey] !== undefined}
          inheritedValueText="Default"
          onReset={() => update({ [sizeKey]: undefined })}
        >
          {presentationControl === "select" ? (
            <InspectorSelect
              value={String(resolvedSize)}
              options={labels(UIKIT_BUTTON_CAPABILITY.properties.size.values)}
              onChange={(value) => update({ [sizeKey]: value })}
              ariaLabel="Button size"
            />
          ) : (
            <InspectorPillGroup
              value={String(resolvedSize)}
              options={labels(UIKIT_BUTTON_CAPABILITY.properties.size.values)}
              onChange={(value) => update({ [sizeKey]: value })}
              ariaLabel="Button size"
            />
          )}
        </InspectorFieldRow>
      </>}

      {showFullWidth && widthKey && (
        <InspectorFieldRow
          label={terminology === "link" ? "Full width button" : "Full width"}
          isOverridden={values[widthKey] !== undefined}
          inheritedValueText="Off"
          onReset={() => update({ [widthKey]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(resolvedFullWidth)}
            onChange={(checked) => update({ [widthKey]: checked })}
            label="Full width button"
          />
        </InspectorFieldRow>
      )}

      {showMargin && marginKey && (
        <InspectorFieldRow label={terminology === "link" ? "Margin Top" : "Action margin"}>
          <InspectorSelect
            value={String(resolvedMargin)}
            options={[
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
            ]}
            onChange={(value) => update({ [marginKey]: value === "none" ? undefined : value })}
            ariaLabel={terminology === "link" ? "Margin top" : "Action margin"}
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
  showMatch = false,
  showExpandContent = false,
  showMaxWidth = false,
  showImageNoPadding = false,
  heightLabel = "Fill the available column space",
  imageNoPaddingLabel = "Image without padding",
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
  /** Expose YOOtheme's equal-height item contract. */
  showMatch?: boolean;
  /** Expose YOOtheme's Panel expand control without requiring height expansion. */
  showExpandContent?: boolean;
  /** Expose the Grid item max-width owner. */
  showMaxWidth?: boolean;
  /** Panel-only image padding semantics belong to its Panel group. */
  showImageNoPadding?: boolean;
  heightLabel?: string;
  imageNoPaddingLabel?: string;
  keys?: {
    variant: string;
    size: string;
    hover: string;
    link?: string;
    maxWidth?: string;
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
            value={String(values[keys.variant] ?? "none")}
            options={surfaceOptions}
            onChange={(value) => update({ [keys.variant]: value })}
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
            label="Link panel"
          />
        </InspectorFieldRow>
      )}

      {linkFirst && (
        <InspectorFieldRow
          label=""
          isOverridden={values[keys.hover] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [keys.hover]: undefined })}
        >
          <InspectorSwitch
            checked={Boolean(values[keys.hover])}
            onChange={(checked) => update({ [keys.hover]: checked })}
            label={hoverLabel}
            disabled={showLink && !Boolean(values[linkKey])}
          />
        </InspectorFieldRow>
      )}

      <InspectorFieldRow
        label={sizeLabel}
        isOverridden={values[keys.size] !== undefined}
        inheritedValueText={defaultSize === "none" ? "None" : "Default"}
        onReset={() => update({ [keys.size]: undefined })}
      >
        {showMaxWidth ? (
          <InspectorSelect
            value={String(values[keys.size] ?? defaultSize)}
            options={sizeOptions ?? labels(sizeValues)}
            onChange={(value) => update({ [keys.size]: value })}
            ariaLabel="Panel padding"
          />
        ) : (
          <InspectorPillGroup
            value={String(values[keys.size] ?? defaultSize)}
            options={sizeOptions ?? labels(sizeValues)}
            onChange={(value) => update({ [keys.size]: value })}
            ariaLabel="Card size"
          />
        )}
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

      {showMatch && (
        <InspectorFieldRow label="Height" isOverridden={values.panelMatch !== undefined} inheritedValueText="Off" onReset={() => update({ panelMatch: undefined })}>
          <InspectorSwitch
            checked={values.panelMatch === true}
            onChange={(checked) => update({ panelMatch: checked })}
            label="Match panel heights"
          />
        </InspectorFieldRow>
      )}

      {showImageNoPadding && (
        <InspectorFieldRow
          label=""
          isOverridden={values.panelImageNoPadding !== undefined}
          inheritedValueText="With padding"
          onReset={() => update({ panelImageNoPadding: undefined })}
        >
          <InspectorSwitch
            checked={values.panelImageNoPadding === true}
            onChange={(checked) => update({ panelImageNoPadding: checked })}
            label={imageNoPaddingLabel}
          />
        </InspectorFieldRow>
      )}

      {showHeight && (
        <>
          <InspectorFieldRow label="Height">
            <InspectorSwitch
              checked={values.panelHeightExpand === true}
              onChange={(checked) => update({ panelHeightExpand: checked, panelExpand: checked ? values.panelExpand ?? "none" : "none" })}
              label={heightLabel}
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

      {showMaxWidth && (
        <InspectorFieldRow
          label="Max Width"
          isOverridden={values[keys.maxWidth ?? "gridItemMaxWidth"] !== undefined}
          inheritedValueText="None"
          onReset={() => update({ [keys.maxWidth ?? "gridItemMaxWidth"]: undefined })}
        >
          <InspectorSelect
            value={String(values[keys.maxWidth ?? "gridItemMaxWidth"] ?? "none")}
            options={[
              { value: "none", label: "None" }, { value: "small", label: "Small" },
              { value: "medium", label: "Medium" }, { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" }, { value: "2xlarge", label: "2X-Large" },
            ]}
            onChange={(value) => update({ [keys.maxWidth ?? "gridItemMaxWidth"]: value })}
            ariaLabel="Panel max width"
          />
        </InspectorFieldRow>
      )}

      {!showHeight && showExpandContent && (
        <InspectorFieldRow label="Expand Content">
          <InspectorSelect
            value={String(values.panelExpand ?? "none")}
            options={[
              { value: "none", label: "None" }, { value: "image", label: "Image" },
              { value: "content", label: "Content" }, { value: "both", label: "Image and Content" },
            ]}
            onChange={(value) => update({ panelExpand: value })}
            ariaLabel="Panel expand content"
          />
        </InspectorFieldRow>
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
    { value: "auto", label: "Auto" }, { value: "4-5", label: "80%" },
    { value: "3-4", label: "75%" }, { value: "2-3", label: "66%" },
    { value: "3-5", label: "60%" }, { value: "1-2", label: "50%" },
    { value: "2-5", label: "40%" }, { value: "1-3", label: "33%" },
    { value: "1-4", label: "25%" }, { value: "1-5", label: "20%" },
    { value: "small", label: "Small" }, { value: "medium", label: "Medium" },
    { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" },
    { value: "2xlarge", label: "2X-Large" },
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
