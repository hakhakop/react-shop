"use client";

import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import { InspectorFieldRow, InspectorSelect } from "@/components/dashboard/inspector/InspectorControls";

export type TypographyRole = "inherit" | "default" | "primary" | "secondary" | "tertiary";
export type TypographyRoleField = "headingTypographyRole" | "textTypographyRole" | "titleTypographyRole" | "contentTypographyRole" | "metaTypographyRole";

const OPTIONS: { value: TypographyRole; label: string }[] = [
  { value: "inherit", label: "Inherit" },
  { value: "default", label: "Default" },
  { value: "primary", label: "Primary" },
  { value: "secondary", label: "Secondary" },
  { value: "tertiary", label: "Tertiary" },
];

export default function TypographyRoleSettingsPanel({
  block,
  fields,
  update,
}: {
  block: BuilderLayoutBlock;
  fields: readonly { field: TypographyRoleField; label: string }[];
  update: (patch: Partial<BuilderLayoutBlock>) => void;
}) {
  return (
    <section className="builder-inspector-section" data-uikit-capability="typography-role">
      <h3>Typography</h3>
      <p className="builder-inspector-help">Select semantic roles here. Concrete font values remain owned by Global Typography.</p>
      {fields.map(({ field, label }) => (
        <InspectorFieldRow key={field} label={label}>
          <InspectorSelect
            value={(block[field] ?? "inherit") as TypographyRole}
            options={OPTIONS}
            onChange={(value) => update({ [field]: value === "inherit" ? undefined : value })}
            ariaLabel={`${label} typography role`}
          />
        </InspectorFieldRow>
      ))}
    </section>
  );
}
