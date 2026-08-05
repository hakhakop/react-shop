"use client";

import React from "react";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import {
  InspectorFieldRow,
  InspectorSelect,
  InspectorPillGroup,
  InspectorTextField,
  InspectorDivision,
} from "@/components/dashboard/inspector/InspectorControls";
import { UIKIT_HEADING_CAPABILITY, UIKIT_IMAGE_CAPABILITY, UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";

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
        <InspectorPillGroup
          value={String(values[keys.align] ?? "left")}
          options={labels(UIKIT_HEADING_CAPABILITY.properties.alignment.values)}
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
        <InspectorPillGroup
          value={String(values[keys.align] ?? "left")}
          options={labels(UIKIT_HEADING_CAPABILITY.properties.alignment.values)}
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
        <InspectorPillGroup
          value={String(values[keys.align] ?? "left")}
          options={labels(UIKIT_HEADING_CAPABILITY.properties.alignment.values)}
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
        <InspectorPillGroup
          value={String(values[keys.align] ?? "center")}
          options={labels(UIKIT_IMAGE_CAPABILITY.properties.alignment.values)}
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
