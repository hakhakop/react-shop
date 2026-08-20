"use client";

import { InspectorFieldRow, InspectorSelect, InspectorSwitch, InspectorTextField } from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: Record<string, unknown>;
  update: (patch: Record<string, unknown>) => void;
  keys: { masonry: string; parallax: string; parallaxJustify: string; parallaxStart: string; parallaxEnd: string };
};

/** Shared Inspector owner for UIkit collection-track masonry and parallax. */
export default function UikitGridStructureSettingsGroup({ block, update, keys }: Props) {
  const parallax = block[keys.parallax];
  return (
    <>
      <InspectorFieldRow label="Masonry" isOverridden={block[keys.masonry] !== undefined} inheritedValueText="None" onReset={() => update({ [keys.masonry]: undefined })}>
        <InspectorSelect
          value={String(block[keys.masonry] ?? "none")}
          options={[{ value: "none", label: "None" }, { value: "pack", label: "Pack" }, { value: "next", label: "Next" }]}
          onChange={(value) => update({ [keys.masonry]: value === "none" ? undefined : value })}
          ariaLabel="Masonry"
        />
      </InspectorFieldRow>
      <InspectorFieldRow label="Parallax" isOverridden={parallax !== undefined} inheritedValueText="None" onReset={() => update({ [keys.parallax]: undefined })}>
        <InspectorTextField value={String(parallax ?? "")} placeholder="None" onChange={(value) => update({ [keys.parallax]: value.trim() === "" ? undefined : Number(value) })} ariaLabel="Parallax" />
      </InspectorFieldRow>
      {parallax !== undefined && <>
        <InspectorFieldRow label="Justify columns at the bottom">
          <InspectorSwitch checked={Boolean(block[keys.parallaxJustify])} onChange={(checked) => update({ [keys.parallaxJustify]: checked })} label="Justify columns at the bottom" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Parallax start">
          <InspectorTextField value={String(block[keys.parallaxStart] ?? "")} onChange={(value) => update({ [keys.parallaxStart]: value || undefined })} ariaLabel="Parallax start" />
        </InspectorFieldRow>
        <InspectorFieldRow label="Parallax end">
          <InspectorTextField value={String(block[keys.parallaxEnd] ?? "")} onChange={(value) => update({ [keys.parallaxEnd]: value || undefined })} ariaLabel="Parallax end" />
        </InspectorFieldRow>
      </>}
    </>
  );
}
