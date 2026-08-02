"use client";

import type { InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";
import { InspectorFieldRow, InspectorPillGroup, InspectorSection, InspectorSelect, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const legacyButtonFields = {
  buttonBg: undefined,
  buttonTextColor: undefined,
  buttonBorderRadius: undefined,
  buttonBorderWidth: undefined,
  buttonBorderColor: undefined,
  buttonPaddingY: undefined,
  buttonPaddingX: undefined,
  buttonFontWeight: undefined,
  buttonLetterSpacing: undefined,
  buttonHoverBg: undefined,
  buttonHoverTextColor: undefined,
  buttonHoverBorderColor: undefined,
  buttonHoverTransform: undefined,
  buttonHoverBoxShadow: undefined,
  buttonHoverEffect: undefined,
  secondaryButtonLabel: undefined,
  secondaryButtonUrl: undefined,
  secondaryButtonTarget: undefined,
  secondaryButtonStyle: undefined,
  premiumButtonStyle: undefined,
  premiumCardStyle: undefined,
  buttonsLayout: undefined,
  buttonGap: undefined,
  elementAlign: undefined,
} satisfies Partial<BuilderLayoutBlock>;

function selectValue(value: string | undefined, fallback: string) {
  return value || fallback;
}

const targetOptions = [{ value: "_self", label: "Same tab" }, { value: "_blank", label: "New tab" }] as const;
const named = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));

export default function ButtonCapabilityPanel({ block, tab, update }: Props) {
  const updateSemantic = (patch: Partial<BuilderLayoutBlock>) => {
    update({ ...legacyButtonFields, ...patch });
  };

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-content">
        <div className="builder-element-inspector-note">
          <strong>WebPages action</strong>
          <span>Content and navigation remain owned by WebPages.</span>
        </div>
        <InspectorFieldRow label="Label"><InspectorTextField value={block.buttonLabel ?? ""} onChange={(value) => updateSemantic({ buttonLabel: value })} ariaLabel="Button label" /></InspectorFieldRow>
        <InspectorFieldRow label="URL / action"><InspectorTextField value={block.buttonUrl ?? ""} onChange={(value) => updateSemantic({ buttonUrl: value })} ariaLabel="Button URL or action" /></InspectorFieldRow>
        <InspectorFieldRow label="Target"><InspectorSelect value={selectValue(block.buttonTarget, "_self") as "_self" | "_blank"} options={targetOptions} onChange={(value) => updateSemantic({ buttonTarget: value })} ariaLabel="Button target" /></InspectorFieldRow>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-style">
        <div className="builder-element-inspector-note">
          <strong>UIkit Button</strong>
          <span>Semantic values map to UIkit classes in the builder and frontend.</span>
        </div>
        <InspectorSection title="Button style" description="UIkit owns the semantic variant and size." className="inspector-section-flat">
          <InspectorFieldRow label="Variant"><InspectorPillGroup value={selectValue(block.buttonStyle, "primary") as BuilderLayoutBlock["buttonStyle"]} options={named(UIKIT_BUTTON_CAPABILITY.properties.variant.values)} onChange={(value) => updateSemantic({ buttonStyle: value as BuilderLayoutBlock["buttonStyle"] })} ariaLabel="Button variant" /></InspectorFieldRow>
          <InspectorFieldRow label="Size"><InspectorPillGroup value={selectValue(block.size, "default") as BuilderLayoutBlock["size"]} options={named(UIKIT_BUTTON_CAPABILITY.properties.size.values)} onChange={(value) => updateSemantic({ size: value })} ariaLabel="Button size" /></InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="button-advanced">
        <div className="builder-element-inspector-note">
          <strong>Button advanced settings</strong>
          <span>Visibility, animation, and custom classes remain in the shared Advanced tab.</span>
        </div>
      </div>
    );
  }

  return null;
}
