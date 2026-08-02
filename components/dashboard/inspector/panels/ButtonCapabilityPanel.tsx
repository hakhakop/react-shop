"use client";

import type { InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";

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

export default function ButtonCapabilityPanel({ block, tab, update }: Props) {
  const clearLegacy = () => update(legacyButtonFields);
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
        <label className="builder-field">
          <span>Label</span>
          <input
            value={block.buttonLabel ?? ""}
            onChange={(event) => updateSemantic({ buttonLabel: event.target.value })}
          />
        </label>
        <label className="builder-field">
          <span>URL / action</span>
          <input
            value={block.buttonUrl ?? ""}
            onChange={(event) => updateSemantic({ buttonUrl: event.target.value })}
          />
        </label>
        <label className="builder-field">
          <span>Target</span>
          <select
            value={selectValue(block.buttonTarget, "_self")}
            onChange={(event) =>
              updateSemantic({
                buttonTarget: event.target.value as "_self" | "_blank",
              })
            }
          >
            <option value="_self">Same tab</option>
            <option value="_blank">New tab</option>
          </select>
        </label>
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
        <label className="builder-field">
          <span>Variant</span>
          <select
            value={selectValue(block.buttonStyle, "primary")}
            onChange={(event) =>
              updateSemantic({
                buttonStyle: event.target.value as BuilderLayoutBlock["buttonStyle"],
              })
            }
          >
            {UIKIT_BUTTON_CAPABILITY.properties.variant.values.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="builder-field">
          <span>Size</span>
          <select
            value={selectValue(block.size, "default")}
            onChange={(event) =>
              updateSemantic({
                size: event.target.value as BuilderLayoutBlock["size"],
              })
            }
          >
            {UIKIT_BUTTON_CAPABILITY.properties.size.values.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <div className="builder-element-inspector-note">
          <strong>Unsupported by this Button capability</strong>
          <span>Width, alignment, icons, loading, disabled, custom colors, hover effects, radius, and per-button spacing have no retained controls.</span>
        </div>
        <button type="button" className="builder-secondary-button" onClick={clearLegacy}>
          Clear legacy Button fields
        </button>
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
