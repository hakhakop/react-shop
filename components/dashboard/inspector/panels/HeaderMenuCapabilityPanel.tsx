"use client";

import type { InspectorPanelContext } from "@/components/dashboard/inspector/inspectorRouting";
import type { BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

type OverrideKey = keyof NonNullable<BuilderLayoutBlock["headerNavigationOverrides"]>;

const inherited = [{ value: "inherit", label: "Inherit global" }];

/**
 * Header navigation has a real menu resource rather than authored Nav items.
 * Keep that distinction, but present it through the canonical Inspector
 * primitives so its Content and Settings tabs behave like every other element.
 */
export default function HeaderMenuCapabilityPanel({ block, tab, shellSettings, update }: InspectorPanelContext) {
  const overrides = block.headerNavigationOverrides ?? {};
  const patchOverride = (key: OverrideKey, patch: Partial<BuilderLayoutBlock>) =>
    update({
      ...patch,
      headerNavigationOverrides: { ...overrides, [key]: true },
    });
  const resetOverride = (key: OverrideKey, patch: Partial<BuilderLayoutBlock>) =>
    update({
      ...patch,
      headerNavigationOverrides: { ...overrides, [key]: false },
    });

  if (tab === "content") {
    const menuOptions = [
      { value: "main", label: "Main Menu" },
      ...shellSettings.namedMenus.map((menu) => ({ value: menu.id, label: menu.name })),
    ];
    if (block.menuSource && !menuOptions.some((option) => option.value === block.menuSource)) {
      menuOptions.push({ value: block.menuSource, label: `Unavailable source (${block.menuSource})` });
    }
    return (
      <InspectorDivision title="MENU">
        <InspectorFieldRow label="Source" help="The website menu rendered by this Header element.">
          <InspectorSelect value={block.menuSource ?? "main"} options={menuOptions} onChange={(menuSource) => update({ menuSource })} />
        </InspectorFieldRow>
      </InspectorDivision>
    );
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="header-menu-settings">
      <InspectorDivision title="PRESENTATION" description="Overrides apply only to this Header menu; reset returns to the global Navbar setting.">
        <InspectorFieldRow label="Item spacing" isOverridden={Boolean(overrides.gap)} onReset={() => resetOverride("gap", { menuItemGap: undefined })}>
          <InspectorTextField value={overrides.gap ? block.menuItemGap ?? "" : ""} placeholder="Inherit (for example 1.4rem)" onChange={(menuItemGap) => menuItemGap ? patchOverride("gap", { menuItemGap }) : resetOverride("gap", { menuItemGap: undefined })} />
        </InspectorFieldRow>
        <InspectorFieldRow label="Hover variant" isOverridden={Boolean(overrides.hoverVariant)} onReset={() => resetOverride("hoverVariant", { menuHoverVariant: undefined })}>
          <InspectorSelect value={overrides.hoverVariant ? block.menuHoverVariant ?? "none" : "inherit"} options={[...inherited, { value: "line", label: "Line" }, { value: "glow", label: "Glow" }, { value: "line-glow", label: "Line + glow" }, { value: "none", label: "None" }]} onChange={(value) => value === "inherit" ? resetOverride("hoverVariant", { menuHoverVariant: undefined }) : patchOverride("hoverVariant", { menuHoverVariant: value as BuilderLayoutBlock["menuHoverVariant"] })} />
        </InspectorFieldRow>
        <InspectorFieldRow label="Line position" isOverridden={Boolean(overrides.hoverLine)} onReset={() => resetOverride("hoverLine", { menuHoverLine: undefined })}>
          <InspectorSelect value={overrides.hoverLine ? block.menuHoverLine ?? "top" : "inherit"} options={[...inherited, { value: "top", label: "Top" }, { value: "bottom", label: "Bottom" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} onChange={(value) => value === "inherit" ? resetOverride("hoverLine", { menuHoverLine: undefined }) : patchOverride("hoverLine", { menuHoverLine: value as BuilderLayoutBlock["menuHoverLine"] })} />
        </InspectorFieldRow>
        <InspectorFieldRow label="Dropdown indicator" isOverridden={Boolean(overrides.dropdownIndicator)} onReset={() => resetOverride("dropdownIndicator", { menuDropdownIndicator: undefined })}>
          <InspectorSelect value={overrides.dropdownIndicator ? block.menuDropdownIndicator ?? "chevron" : "inherit"} options={[...inherited, { value: "chevron", label: "Chevron" }, { value: "none", label: "None" }]} onChange={(value) => value === "inherit" ? resetOverride("dropdownIndicator", { menuDropdownIndicator: undefined }) : patchOverride("dropdownIndicator", { menuDropdownIndicator: value as BuilderLayoutBlock["menuDropdownIndicator"] })} />
        </InspectorFieldRow>
        <InspectorFieldRow label="Vertical dividers" isOverridden={Boolean(overrides.divider)} onReset={() => resetOverride("divider", { menuDividerMode: undefined })}>
          <InspectorSelect value={overrides.divider ? block.menuDividerMode ?? "none" : "inherit"} options={[...inherited, { value: "none", label: "None" }, { value: "partial", label: "Outer edges" }, { value: "all", label: "Between all items" }]} onChange={(value) => value === "inherit" ? resetOverride("divider", { menuDividerMode: undefined }) : patchOverride("divider", { menuDividerMode: value as BuilderLayoutBlock["menuDividerMode"] })} />
        </InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="COLORS">
        <InspectorFieldRow label="Custom hover color" isOverridden={Boolean(overrides.hoverColor)} onReset={() => resetOverride("hoverColor", { menuHoverColor: undefined })}>
          <InspectorSwitch checked={Boolean(overrides.hoverColor)} onChange={(enabled) => enabled ? patchOverride("hoverColor", { menuHoverColor: block.menuHoverColor ?? "#111827" }) : resetOverride("hoverColor", { menuHoverColor: undefined })} />
        </InspectorFieldRow>
        {overrides.hoverColor && <InspectorFieldRow label="Hover color"><input className="inspector-control" type="color" value={block.menuHoverColor ?? "#111827"} onChange={(event) => patchOverride("hoverColor", { menuHoverColor: event.target.value })} /></InspectorFieldRow>}
        <InspectorFieldRow label="Custom active color" isOverridden={Boolean(overrides.activeColor)} onReset={() => resetOverride("activeColor", { menuActiveColor: undefined })}>
          <InspectorSwitch checked={Boolean(overrides.activeColor)} onChange={(enabled) => enabled ? patchOverride("activeColor", { menuActiveColor: block.menuActiveColor ?? "#111827" }) : resetOverride("activeColor", { menuActiveColor: undefined })} />
        </InspectorFieldRow>
        {overrides.activeColor && <InspectorFieldRow label="Active color"><input className="inspector-control" type="color" value={block.menuActiveColor ?? "#111827"} onChange={(event) => patchOverride("activeColor", { menuActiveColor: event.target.value })} /></InspectorFieldRow>}
        <InspectorFieldRow label="Active indicator" isOverridden={Boolean(overrides.indicator)} onReset={() => resetOverride("indicator", { menuActiveIndicator: undefined })}>
          <InspectorSelect value={overrides.indicator ? block.menuActiveIndicator ?? "underline" : "inherit"} options={[...inherited, { value: "princity", label: "Princity motion" }, { value: "underline", label: "Underline" }, { value: "none", label: "None" }]} onChange={(value) => value === "inherit" ? resetOverride("indicator", { menuActiveIndicator: undefined }) : patchOverride("indicator", { menuActiveIndicator: value as BuilderLayoutBlock["menuActiveIndicator"] })} />
        </InspectorFieldRow>
      </InspectorDivision>
    </div>
  );
}
