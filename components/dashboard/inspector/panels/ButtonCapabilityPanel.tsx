"use client";

import type { InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import { InspectorFieldRow, InspectorSelect, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";
import ButtonPresentationFields from "@/components/dashboard/inspector/panels/ButtonPresentationFields";
import type { BuilderShellSettings } from "@/lib/builderShell";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
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

export default function ButtonCapabilityPanel({ block, tab, shellSettings, update }: Props) {
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
        <InspectorFieldRow label="Target"><InspectorSelect value={selectValue(block.buttonTarget, "_self") as "_self" | "_blank"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(value) => updateSemantic({ buttonTarget: value })} ariaLabel="Button target" /></InspectorFieldRow>
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
        <ButtonPresentationFields
          variant={selectValue(block.buttonStyle, "primary")}
          size={selectValue(block.size, "default")}
          onVariantChange={(value) => updateSemantic({ buttonStyle: value as BuilderLayoutBlock["buttonStyle"] })}
          onSizeChange={(value) => updateSemantic({ size: value as BuilderLayoutBlock["size"] })}
        />
      </div>
    );
  }

  if (tab === "advanced") return null;

  return null;
}
