"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_HEADING_CAPABILITY } from "@/lib/uikitCapabilities";
import {
  InspectorColorField,
  InspectorFieldRow,
  InspectorNumberUnit,
  InspectorPillGroup,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextarea,
  InspectorDivision,
} from "@/components/dashboard/inspector/InspectorControls";
import type { BuilderShellSettings } from "@/lib/builderShell";
import TypographyRoleSettingsPanel from "@/components/dashboard/inspector/panels/TypographyRoleSettingsPanel";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

const gradientPresets = UIKIT_HEADING_CAPABILITY.properties.gradient.values;
const labels = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    value,
    label: value.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
  }));

export default function HeadingCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-content">
        <div className="builder-element-inspector-note">
          <strong>Heading content</strong>
          <span>WebPages owns the text and semantic HTML level.</span>
        </div>
        <InspectorFieldRow label="Heading text">
          <input
            className="inspector-control"
            type="text"
            value={block.headingText ?? ""}
            onChange={(e) => update({ headingText: e.target.value })}
            aria-label="Heading text"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Semantic level">
          <InspectorSelect
            value={(block.headingLevel ?? "h2") as BuilderLayoutBlock["headingLevel"]}
            options={UIKIT_HEADING_CAPABILITY.properties.level.values.map((value) => ({
              value,
              label: value.toUpperCase(),
            }))}
            onChange={(value) => update({ headingLevel: value })}
            ariaLabel="Heading semantic level"
          />
        </InspectorFieldRow>
      </div>
    );
  }

  if (tab === "style") {
    const gradient = block.textGradientPreset ?? "none";
    return (
      <div className="builder-inspector-stack" data-uikit-capability="heading-style">
        <div className="builder-element-inspector-note">
          <strong>UIkit Heading</strong>
          <span>Visual preset selects the UIkit heading style class. Semantic level controls the HTML heading element independently.</span>
        </div>

        <InspectorDivision title="HEADING">
          <TypographyRoleSettingsPanel
            block={block}
            fields={[{ field: "headingTypographyRole", label: "Font role" }]}
            update={update}
            noSection
          />
          <InspectorFieldRow
            label="Visual preset"
            isOverridden={block.headingSize !== undefined}
            inheritedValueText="Medium"
            onReset={() => update({ headingSize: undefined })}
          >
            <InspectorSelect
              value={(block.headingSize ?? "medium") as BuilderLayoutBlock["headingSize"]}
              options={labels(UIKIT_HEADING_CAPABILITY.properties.visualPreset.values)}
              onChange={(value) => update({ headingSize: value })}
              ariaLabel="Heading visual preset"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Alignment"
            isOverridden={block.headingAlign !== undefined}
            inheritedValueText="Left"
            onReset={() => update({ headingAlign: undefined })}
          >
            <InspectorPillGroup
              value={(block.headingAlign ?? "left") as BuilderLayoutBlock["headingAlign"]}
              options={labels(UIKIT_HEADING_CAPABILITY.properties.alignment.values)}
              onChange={(value) => update({ headingAlign: value })}
              ariaLabel="Heading alignment"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="HTML Element"
            isOverridden={block.headingLevel !== undefined}
            inheritedValueText="H2"
            onReset={() => update({ headingLevel: undefined })}
          >
            <InspectorSelect
              value={(block.headingLevel ?? "h2") as BuilderLayoutBlock["headingLevel"]}
              options={UIKIT_HEADING_CAPABILITY.properties.level.values.map((v) => ({
                value: v,
                label: v.toUpperCase(),
              }))}
              onChange={(value) => update({ headingLevel: value })}
              ariaLabel="Heading HTML element"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Title decoration"
            isOverridden={(block as any).titleDecoration !== undefined && (block as any).titleDecoration !== "none"}
            inheritedValueText="None"
            onReset={() => update({ titleDecoration: undefined } as any)}
          >
            <InspectorSelect
              value={String((block as any).titleDecoration ?? "none")}
              options={[
                { value: "none", label: "None" },
                { value: "divider", label: "Divider" },
                { value: "bullet", label: "Bullet" },
                { value: "line", label: "Line" },
              ]}
              onChange={(value) => update({ titleDecoration: value === "none" ? undefined : value } as any)}
              ariaLabel="Title decoration"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="GRADIENT">
          <InspectorFieldRow
            label="Preset"
            isOverridden={block.textGradientPreset !== undefined && block.textGradientPreset !== "none"}
            inheritedValueText="None"
            onReset={() => update({ textGradientPreset: undefined, textGradientCustomStart: undefined, textGradientCustomEnd: undefined, textGradientCustomAngle: undefined })}
          >
            <InspectorSelect
              value={gradient}
              options={labels(gradientPresets)}
              onChange={(value) => update({ textGradientPreset: value })}
              ariaLabel="Gradient preset"
            />
          </InspectorFieldRow>
          {gradient === "custom" && (
            <div className="builder-two-column">
              <InspectorFieldRow label="Start color">
                <InspectorColorField
                  value={block.textGradientCustomStart ?? "#ffffff"}
                  onChange={(value) => update({ textGradientCustomStart: value })}
                  ariaLabel="Gradient start color"
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="End color">
                <InspectorColorField
                  value={block.textGradientCustomEnd ?? "#c084fc"}
                  onChange={(value) => update({ textGradientCustomEnd: value })}
                  ariaLabel="Gradient end color"
                />
              </InspectorFieldRow>
              <InspectorFieldRow label="Angle">
                <InspectorNumberUnit
                  value={block.textGradientCustomAngle ?? 135}
                  unit="deg"
                  units={["deg"]}
                  onValueChange={(value) => update({ textGradientCustomAngle: Number(value) })}
                  onUnitChange={() => undefined}
                  ariaLabel="Gradient angle"
                />
              </InspectorFieldRow>
            </div>
          )}
        </InspectorDivision>

        <InspectorDivision title="TYPEWRITER">
          <InspectorFieldRow label="Enable">
            <InspectorSwitch
              checked={block.typewriterEnabled ?? false}
              onChange={(checked) => update({ typewriterEnabled: checked })}
              label="Enable typewriter"
            />
          </InspectorFieldRow>
          {block.typewriterEnabled && (
            <>
              <InspectorFieldRow label="Phrases">
                <InspectorTextarea
                  value={(block.typewriterPhrases ?? []).join("\n")}
                  onChange={(value) => update({ typewriterPhrases: value.split("\n").map((e) => e.trim()).filter(Boolean) })}
                  ariaLabel="Typewriter phrases"
                />
              </InspectorFieldRow>
              <div className="builder-two-column">
                <InspectorFieldRow label="Speed">
                  <input
                    className="inspector-control"
                    type="number"
                    min={10}
                    value={block.typewriterSpeed ?? 80}
                    onChange={(e) => update({ typewriterSpeed: Number(e.target.value) })}
                  />
                </InspectorFieldRow>
                <InspectorFieldRow label="Delay">
                  <input
                    className="inspector-control"
                    type="number"
                    min={0}
                    value={block.typewriterDelay ?? 1200}
                    onChange={(e) => update({ typewriterDelay: Number(e.target.value) })}
                  />
                </InspectorFieldRow>
              </div>
              <InspectorFieldRow label="Loop">
                <InspectorSwitch
                  checked={block.typewriterLoop ?? true}
                  onChange={(checked) => update({ typewriterLoop: checked })}
                  label="Loop phrases"
                />
              </InspectorFieldRow>
            </>
          )}
        </InspectorDivision>
      </div>
    );
  }

  if (tab === "advanced") return null;
  return null;
}
