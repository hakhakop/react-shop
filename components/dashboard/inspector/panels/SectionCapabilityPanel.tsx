"use client";

import type { ReactNode } from "react";

import type {
  BuilderLayoutAdvancedSettings,
  BuilderSection,
  BuilderShellSettings,
  InspectorTab,
} from "@/components/dashboard/builderTypes";
import {
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";
import AnimationControl from "@/components/dashboard/style/AnimationControl";
import { resolveSectionBackground } from "@/lib/semanticBackgrounds";
import { normalizeSectionTitleBreakpoint, normalizeSectionTitlePosition } from "@/lib/sectionSemantics";

type Props = {
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
  tab: InspectorTab;
  update: (patch: Partial<BuilderSection>) => void;
};

function attributesValue(attributes: BuilderLayoutAdvancedSettings["attributes"]) {
  if (!attributes) return "";
  return typeof attributes === "string"
    ? attributes
    : Object.entries(attributes).map(([name, value]) => `${name}=${value}`).join("\n");
}

function Group({ title, children }: { title?: string; children: ReactNode }) {
  return <section className="builder-inspector-section">{title && <h3>{title}</h3>}{children}</section>;
}

/** Canonical Section inspector following YOOtheme's Content / Settings / Advanced contract. */
export default function SectionCapabilityPanel({ section, tab, update }: Props) {
  const resolvedBackground = resolveSectionBackground(section);
  const updateVisualStyle = (patch: Partial<NonNullable<BuilderSection["visualStyle"]>>) =>
    update({ visualStyle: { ...(section.visualStyle ?? {}), ...patch } });
  const updateAdvanced = (patch: Partial<BuilderLayoutAdvancedSettings>) => {
    const next: Partial<NonNullable<BuilderSection["visualStyle"]>> = {};
    if ("className" in patch) next.customClass = patch.className;
    if ("attributes" in patch) {
      next.customAttributes = typeof patch.attributes === "string"
        ? patch.attributes
        : patch.attributes
          ? Object.entries(patch.attributes).map(([name, value]) => `${name}=${value}`).join("\n")
          : undefined;
    }
    if ("css" in patch) next.customCss = patch.css;
    updateVisualStyle(next);
  };

  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="section-content">
        <Group title="Content">
          <InspectorFieldRow label="Image" description="Section background image source.">
            <InspectorTextField value={section.backgroundOverride ?? ""} placeholder="Image URL" onChange={(backgroundOverride) => update({ backgroundOverride: backgroundOverride || undefined })} ariaLabel="Section image" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Video" description="Video backgrounds are not currently supported by the canonical Section owner.">
            <InspectorTextField value="" placeholder="Deferred" disabled onChange={() => undefined} ariaLabel="Section video (deferred)" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Title" description="Decorative Section title source field.">
            <InspectorTextField value={section.title ?? ""} onChange={(title) => update({ title })} ariaLabel="Section title" />
          </InspectorFieldRow>
        </Group>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="section-advanced">
        <Group title="Identity">
          <InspectorFieldRow label="Name"><InspectorTextField value={section.name ?? ""} onChange={(name) => update({ name: name || undefined })} ariaLabel="Section name" /></InspectorFieldRow>
          <InspectorFieldRow label="Status / Disable Section" description="Section status is not yet a canonical persisted capability.">
            <InspectorSelect value="enabled" options={[{ value: "enabled", label: "Enabled" }, { value: "disabled", label: "Deferred" }]} disabled onChange={() => undefined} ariaLabel="Section status (deferred)" />
          </InspectorFieldRow>
          <InspectorFieldRow label="Dynamic Content" description="Dynamic Section content is not yet supported by the canonical owner.">
            <InspectorTextField value="" placeholder="Deferred" disabled onChange={() => undefined} ariaLabel="Section dynamic content (deferred)" />
          </InspectorFieldRow>
        </Group>
        <Group title="Advanced">
          <InspectorFieldRow label="ID"><InspectorTextField value={section.anchorId ?? ""} onChange={(anchorId) => update({ anchorId: anchorId || undefined })} ariaLabel="Section ID" /></InspectorFieldRow>
          <InspectorFieldRow label="Classes"><InspectorTextField value={section.visualStyle?.customClass ?? ""} onChange={(className) => updateAdvanced({ className: className || undefined })} ariaLabel="Section classes" /></InspectorFieldRow>
          <InspectorFieldRow label="Attributes"><InspectorTextarea value={attributesValue(section.visualStyle?.customAttributes)} onChange={(attributes) => updateAdvanced({ attributes: attributes || undefined })} ariaLabel="Section attributes" /></InspectorFieldRow>
          <InspectorFieldRow label="CSS"><InspectorTextarea value={section.visualStyle?.customCss ?? ""} onChange={(css) => updateAdvanced({ css: css || undefined })} ariaLabel="Section CSS" /></InspectorFieldRow>
        </Group>
      </div>
    );
  }

  return (
    <div className="builder-inspector-stack" data-uikit-capability="section-settings">
      <Group title="Appearance">
        <InspectorFieldRow label="Style"><InspectorSelect value={resolvedBackground.role} options={[{ value: "default", label: "Default" }, { value: "muted", label: "Muted" }, { value: "primary", label: "Primary" }, { value: "secondary", label: "Secondary" }]} onChange={(value) => update({ backgroundRole: value as BuilderSection["backgroundRole"], sectionVariant: value as BuilderSection["sectionVariant"] })} ariaLabel="Section style" /></InspectorFieldRow>
        <InspectorFieldRow label="Preserve Text Color" description="Preserve the text color, for example when using cards. Section overlap is not supported by all styles and may have no visual effect."><InspectorSwitch checked={section.preserveColor === true} onChange={(preserveColor) => update({ preserveColor })} label="Preserve nested element colors" /></InspectorFieldRow>
        <InspectorFieldRow label="Text Color" description="Force a light or dark color for text, buttons and controls on the image or video background."><InspectorSelect value={section.textColor ?? "none"} options={[{ value: "none", label: "Auto" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]} onChange={(textColor) => update({ textColor: textColor as BuilderSection["textColor"] })} ariaLabel="Section text color" /></InspectorFieldRow>
      </Group>
      <Group title="Container">
        <InspectorFieldRow label="Max Width" description="Set the maximum content width."><InspectorSelect value={section.maxWidth ?? section.contentMode ?? "default"} options={["none", "xsmall", "small", "default", "medium", "large", "xlarge", "expand"].map((value) => ({ value, label: value.replace(/^./, (letter) => letter.toUpperCase()) }))} onChange={(value) => update({ maxWidth: value as BuilderSection["maxWidth"], contentMode: value as BuilderSection["contentMode"] })} ariaLabel="Section max width" /></InspectorFieldRow>
        <InspectorFieldRow label="Remove Horizontal Padding"><InspectorSwitch checked={section.removeHorizontalPadding === true} onChange={(removeHorizontalPadding) => update({ removeHorizontalPadding })} label="Remove left and right padding" /></InspectorFieldRow>
        <InspectorFieldRow label="Expand One Side" description="Expand the width of one side to the left or right while the other side keeps within the constraints of the max width."><InspectorSelect value={section.expandOneSide ?? "none"} options={[{ value: "none", label: "Don't expand" }, { value: "left", label: "Expand Left" }, { value: "right", label: "Expand Right" }]} onChange={(expandOneSide) => update({ expandOneSide: expandOneSide as BuilderSection["expandOneSide"] })} ariaLabel="Section one-sided expansion" /></InspectorFieldRow>
      </Group>
      <Group title="Height & Alignment">
        <InspectorFieldRow label="Height" description="Set a fixed height, and optionally subtract the header height to fill the first visible viewport. Alternatively, expand the height so the next section also fits the viewport, or on smaller pages to fill the viewport."><InspectorSelect value={section.sectionHeight ?? "none"} options={[{ value: "none", label: "Auto" }, { value: "viewport", label: "Viewport" }, { value: "viewport-20", label: "Viewport minus 20%" }, { value: "viewport-80", label: "Viewport 80%" }, { value: "viewport-percent", label: "Viewport minus section above" }, { value: "auto", label: "Auto" }]} onChange={(sectionHeight) => update({ sectionHeight: sectionHeight as BuilderSection["sectionHeight"] })} ariaLabel="Section height" /></InspectorFieldRow>
        <InspectorFieldRow label="Subtract Height Above Section"><InspectorSwitch checked={section.subtractHeightAbove === true} onChange={(subtractHeightAbove) => update({ subtractHeightAbove })} label="Subtract preceding layout height" /></InspectorFieldRow>
        <InspectorFieldRow label="Vertical Alignment" description="Align the section content vertically, if the section height is larger than the content itself."><InspectorSelect value={section.contentVerticalAlign ?? "top"} options={[{ value: "top", label: "Top" }, { value: "center", label: "Middle" }, { value: "bottom", label: "Bottom" }]} onChange={(contentVerticalAlign) => update({ contentVerticalAlign: contentVerticalAlign as BuilderSection["contentVerticalAlign"] })} ariaLabel="Section vertical alignment" /></InspectorFieldRow>
      </Group>
      <Group title="Spacing">
        <InspectorFieldRow label="Padding"><InspectorSelect value={section.sectionPadding ?? "default"} options={[{ value: "none", label: "None" }, { value: "xsmall", label: "X-Small" }, { value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }]} onChange={(sectionPadding) => update({ sectionPadding: sectionPadding as BuilderSection["sectionPadding"] })} ariaLabel="Section padding" /></InspectorFieldRow>
        <InspectorFieldRow label="Remove Top Padding"><InspectorSwitch checked={section.removeTopPadding === true} onChange={(removeTopPadding) => update({ removeTopPadding, topSpacing: removeTopPadding ? "none" : undefined })} label="Remove top padding" /></InspectorFieldRow>
        <InspectorFieldRow label="Remove Bottom Padding"><InspectorSwitch checked={section.removeBottomPadding === true} onChange={(removeBottomPadding) => update({ removeBottomPadding, bottomSpacing: removeBottomPadding ? "none" : undefined })} label="Remove bottom padding" /></InspectorFieldRow>
      </Group>
      <Group title="Behavior">
        <InspectorFieldRow label="Overlap Following Section"><InspectorSwitch checked={section.overlap === true} onChange={(overlap) => update({ overlap })} label="Overlap the next section" /></InspectorFieldRow>
        <InspectorFieldRow label="Header Transparent"><InspectorSwitch checked={section.headerTransparent === true} onChange={(headerTransparent) => update({ headerTransparent })} label="Overlay section beneath the header" /></InspectorFieldRow>
        <InspectorFieldRow label="Sticky"><InspectorSelect value={section.stickyEffect ?? "none"} options={[{ value: "none", label: "None" }, { value: "cover", label: "Sticky Cover" }, { value: "reveal", label: "Sticky Reveal" }]} onChange={(stickyEffect) => update({ stickyEffect: stickyEffect as BuilderSection["stickyEffect"] })} ariaLabel="Section sticky behavior" /></InspectorFieldRow>
        <InspectorFieldRow label="Animation"><AnimationControl value={section.animation} onChange={(animation) => update({ animation })} allowPause allowScrub /></InspectorFieldRow>
        <InspectorFieldRow label="Visibility"><InspectorSelect value={section.visualStyle?.visibility?.desktop === true ? "visible" : section.visualStyle?.visibility?.desktop === false ? "hidden" : "inherit"} options={[{ value: "inherit", label: "Inherit" }, { value: "visible", label: "Visible" }, { value: "hidden", label: "Hidden" }]} onChange={(value) => updateVisualStyle({ visibility: { ...(section.visualStyle?.visibility ?? {}), desktop: value === "inherit" ? undefined : value === "visible" } })} ariaLabel="Section visibility" /></InspectorFieldRow>
      </Group>
      <Group title="Structure">
        <InspectorFieldRow label="HTML Element"><InspectorSelect value={section.htmlElement ?? "div"} options={["div", "section", "header", "footer", "aside", "main"].map((value) => ({ value, label: value }))} onChange={(htmlElement) => update({ htmlElement: htmlElement as BuilderSection["htmlElement"] })} ariaLabel="Section HTML element" /></InspectorFieldRow>
      </Group>
      <Group title="Decorative Title">
        <InspectorFieldRow label="Title Position"><InspectorSelect value={normalizeSectionTitlePosition(section.sectionTitlePosition)} options={[{ value: "none", label: "None" }, { value: "left-top", label: "Left Top" }, { value: "right-top", label: "Right Top" }, { value: "left-center", label: "Left Center" }, { value: "right-center", label: "Right Center" }]} onChange={(sectionTitlePosition) => update({ sectionTitlePosition })} ariaLabel="Section title position" /></InspectorFieldRow>
        <InspectorFieldRow label="Title Rotation"><InspectorSelect value={section.sectionTitleRotation ?? "none"} options={[{ value: "none", label: "None" }, { value: "left", label: "Left" }, { value: "right", label: "Right" }]} onChange={(sectionTitleRotation) => update({ sectionTitleRotation: sectionTitleRotation as BuilderSection["sectionTitleRotation"] })} ariaLabel="Section title rotation" /></InspectorFieldRow>
        <InspectorFieldRow label="Title Breakpoint"><InspectorSelect value={normalizeSectionTitleBreakpoint(section.sectionTitleBreakpoint)} options={[{ value: "xlarge", label: "X-Large" }, { value: "large", label: "Large" }, { value: "medium", label: "Medium" }, { value: "small", label: "Small" }]} onChange={(sectionTitleBreakpoint) => update({ sectionTitleBreakpoint })} ariaLabel="Section title breakpoint" /></InspectorFieldRow>
      </Group>
    </div>
  );
}
