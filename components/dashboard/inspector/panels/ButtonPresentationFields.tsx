"use client";

import {
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSection,
} from "@/components/dashboard/inspector/InspectorControls";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";

const options = (values: readonly string[], allowInherit: boolean) => [
  ...(allowInherit ? [{ value: "inherit", label: "Inherit" }] : []),
  ...values.map((value) => ({
    value,
    label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  })),
];

export default function ButtonPresentationFields({
  title = "Button style",
  description = "Uses the canonical UIkit Button variants and sizes.",
  variant,
  size,
  allowInherit = false,
  isVariantOverridden = false,
  isSizeOverridden = false,
  inheritedVariantText,
  inheritedSizeText,
  onVariantReset,
  onSizeReset,
  onVariantChange,
  onSizeChange,
}: {
  title?: string;
  description?: string;
  variant: string;
  size: string;
  allowInherit?: boolean;
  isVariantOverridden?: boolean;
  isSizeOverridden?: boolean;
  inheritedVariantText?: string;
  inheritedSizeText?: string;
  onVariantReset?: () => void;
  onSizeReset?: () => void;
  onVariantChange: (value: string) => void;
  onSizeChange: (value: string) => void;
}) {
  return (
    <InspectorSection title={title} description={description}>
      <InspectorFieldRow
        label="Variant"
        isOverridden={isVariantOverridden}
        inheritedValueText={inheritedVariantText}
        onReset={onVariantReset}
      >
        <InspectorPillGroup
          value={variant}
          options={options(UIKIT_BUTTON_CAPABILITY.properties.variant.values, allowInherit)}
          onChange={onVariantChange}
          ariaLabel={`${title} variant`}
        />
      </InspectorFieldRow>
      <InspectorFieldRow
        label="Size"
        isOverridden={isSizeOverridden}
        inheritedValueText={inheritedSizeText}
        onReset={onSizeReset}
      >
        <InspectorPillGroup
          value={size}
          options={options(UIKIT_BUTTON_CAPABILITY.properties.size.values, allowInherit)}
          onChange={onSizeChange}
          ariaLabel={`${title} size`}
        />
      </InspectorFieldRow>
    </InspectorSection>
  );
}

