"use client";

import React from "react";
import type { BuilderSection, BuilderShellSettings, InspectorTab } from "@/components/dashboard/builderTypes";
import {
  InspectorSection,
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorSwitch,
} from "@/components/dashboard/inspector/InspectorControls";
import AnimationControl from "@/components/dashboard/style/AnimationControl";
import BorderEffectsControl from "@/components/dashboard/style/BorderEffectsControl";

type Props = {
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
  tab: InspectorTab;
  update: (patch: Partial<BuilderSection>) => void;
};

export default function SectionCapabilityPanel({ section, shellSettings, tab, update }: Props) {
  // 1. CONTENT TAB
  if (tab === "content") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="section-content">
        <InspectorSection title="Section Content">
          <InspectorFieldRow label="Section Title">
            <input
              type="text"
              className="builder-input"
              value={section.title || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Section Title"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Eyebrow">
            <input
              type="text"
              className="builder-input"
              value={section.eyebrow || ""}
              onChange={(e) => update({ eyebrow: e.target.value })}
              placeholder="Section Eyebrow"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Description">
            <textarea
              className="builder-input"
              rows={3}
              value={section.body || ""}
              onChange={(e) => update({ body: e.target.value })}
              placeholder="Section description text..."
            />
          </InspectorFieldRow>
        </InspectorSection>

        <InspectorSection title="Background Media">
          <InspectorFieldRow label="Background Color">
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="color"
                value={section.background || "#ffffff"}
                onChange={(e) => update({ background: e.target.value })}
                style={{ width: "36px", height: "32px", border: "none", cursor: "pointer" }}
              />
              <input
                type="text"
                className="builder-input"
                value={section.background || ""}
                onChange={(e) => update({ background: e.target.value })}
                placeholder="#ffffff"
                style={{ flex: 1 }}
              />
            </div>
          </InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  }

  // 2. ADVANCED TAB
  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-uikit-capability="section-advanced">
        <InspectorSection title="Advanced Settings">
          <InspectorFieldRow label="Anchor ID" description="HTML ID attribute for smooth scroll navigation links.">
            <input
              type="text"
              className="builder-input"
              value={section.anchorId || ""}
              onChange={(e) => update({ anchorId: e.target.value })}
              placeholder="e.g. features-section"
            />
          </InspectorFieldRow>

          <BorderEffectsControl
            visibility={section.visualStyle?.visibility}
            onVisibilityChange={(visibility) => update({ visualStyle: { ...(section.visualStyle ?? {}), visibility } })}
            showBorder={false}
            showEffects={false}
            showLayout={false}
            showCustomClass={true}
          />

          <InspectorDivision title="Motion">
            <AnimationControl value={section.animation} onChange={(animation) => update({ animation })} allowPause allowScrub />
          </InspectorDivision>
        </InspectorSection>
      </div>
    );
  }

  // 3. SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="section-settings">
      <InspectorSection title="Section Settings">
        {/* STYLE */}
        <InspectorFieldRow
          label="Style"
          description="Preserve the text color, for example when using cards. Section overlap is not supported by all styles and may have no visual effect."
        >
          <InspectorSelect
            value={section.sectionVariant ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "muted", label: "Muted" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
            ]}
            onChange={(value) => update({ sectionVariant: value as any })}
            ariaLabel="Style"
          />
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <InspectorSwitch
              label="Preserve text color"
              checked={section.preserveColor ?? false}
              onChange={(checked) => update({ preserveColor: checked })}
            />
            <InspectorSwitch
              label="Overlap the following section"
              checked={section.overlap ?? false}
              onChange={(checked) => update({ overlap: checked })}
            />
          </div>
        </InspectorFieldRow>

        {/* TEXT COLOR */}
        <InspectorFieldRow
          label="Text Color"
          description="Force a light or dark color for text, buttons and controls on the image or video background."
        >
          <InspectorSelect
            value={section.textColor ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            onChange={(value) => update({ textColor: value as any })}
            ariaLabel="Text color"
          />
        </InspectorFieldRow>

        {/* MAX WIDTH */}
        <InspectorFieldRow
          label="Max Width"
          description="Set the maximum content width."
        >
          <InspectorSelect
            value={section.maxWidth ?? section.contentMode ?? "default"}
            options={[
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "default", label: "Default" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
              { value: "expand", label: "Expand" },
            ]}
            onChange={(value) => update({ maxWidth: value as any, contentMode: value as any })}
            ariaLabel="Max width"
          />
          <div style={{ marginTop: "8px" }}>
            <InspectorSwitch
              label="Remove horizontal padding"
              checked={section.removeHorizontalPadding ?? false}
              onChange={(checked) => update({ removeHorizontalPadding: checked })}
            />
          </div>
        </InspectorFieldRow>

        {/* EXPAND ONE SIDE */}
        <InspectorFieldRow
          label="Expand One Side"
          description="Expand the width of one side to the left or right while the other side keeps within the constraints of the max width."
        >
          <InspectorSelect
            value={section.expandOneSide ?? "none"}
            options={[
              { value: "none", label: "Don't expand" },
              { value: "left", label: "Expand Left" },
              { value: "right", label: "Expand Right" },
            ]}
            onChange={(value) => update({ expandOneSide: value as any })}
            ariaLabel="Expand one side"
          />
        </InspectorFieldRow>

        {/* HEIGHT */}
        <InspectorFieldRow
          label="Height"
          description="Set a fixed height, and optionally subtract the header height to fill the first visible viewport. Alternatively, expand the height so the next section also fits the viewport, or on smaller pages to fill the viewport."
        >
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <InspectorSelect
                value={section.sectionHeight ?? "none"}
                options={[
                  { value: "none", label: "None" },
                  { value: "viewport", label: "Viewport" },
                  { value: "viewport-20", label: "Viewport (Minus 20%)" },
                  { value: "viewport-percent", label: "Viewport (Minus section above)" },
                  { value: "viewport-80", label: "Viewport 80%" },
                  { value: "auto", label: "Auto" },
                ]}
                onChange={(value) => update({ sectionHeight: value as any })}
                ariaLabel="Height"
              />
            </div>
            <input
              type="number"
              className="builder-input"
              style={{ width: "70px", textAlign: "center" }}
              value={section.heightOffset ?? "100"}
              placeholder="100"
              onChange={(e) => update({ heightOffset: e.target.value ? Number(e.target.value) : undefined })}
              title="Height offset in px or %"
            />
          </div>
          <div style={{ marginTop: "8px" }}>
            <InspectorSwitch
              label="Subtract height above section"
              checked={section.subtractHeightAbove ?? false}
              onChange={(checked) => update({ subtractHeightAbove: checked })}
            />
          </div>
        </InspectorFieldRow>

        {/* VERTICAL ALIGNMENT */}
        <InspectorFieldRow
          label="Vertical Alignment"
          description="Align the section content vertically, if the section height is larger than the content itself."
        >
          <InspectorSelect
            value={section.contentVerticalAlign ?? "top"}
            options={[
              { value: "top", label: "Top" },
              { value: "center", label: "Middle" },
              { value: "bottom", label: "Bottom" },
            ]}
            onChange={(value) => update({ contentVerticalAlign: value as any })}
            ariaLabel="Vertical alignment"
          />
        </InspectorFieldRow>

        {/* PADDING */}
        <InspectorFieldRow
          label="Padding"
          description="Set the vertical padding."
        >
          <InspectorSelect
            value={section.sectionPadding ?? "default"}
            options={[
              { value: "none", label: "None" },
              { value: "xsmall", label: "X-Small" },
              { value: "small", label: "Small" },
              { value: "default", label: "Default" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
            ]}
            onChange={(value) => update({ sectionPadding: value as any })}
            ariaLabel="Padding"
          />
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
            <InspectorSwitch
              label="Remove top padding"
              checked={section.removeTopPadding ?? false}
              onChange={(checked) => update({ removeTopPadding: checked, topSpacing: checked ? "none" : undefined })}
            />
            <InspectorSwitch
              label="Remove bottom padding"
              checked={section.removeBottomPadding ?? false}
              onChange={(checked) => update({ removeBottomPadding: checked, bottomSpacing: checked ? "none" : undefined })}
            />
          </div>
        </InspectorFieldRow>

        {/* HTML ELEMENT */}
        <InspectorFieldRow
          label="HTML Element"
          description="Define the purpose and structure of the content or give it no semantic meaning."
        >
          <InspectorSelect
            value={section.htmlElement ?? "div"}
            options={[
              { value: "div", label: "div" },
              { value: "section", label: "section" },
              { value: "header", label: "header" },
              { value: "footer", label: "footer" },
              { value: "aside", label: "aside" },
              { value: "main", label: "main" },
            ]}
            onChange={(value) => update({ htmlElement: value as any })}
            ariaLabel="HTML Element"
          />
        </InspectorFieldRow>

        {/* STICKY EFFECT */}
        <InspectorFieldRow
          label="Sticky Effect"
          description="Sticky section will be covered by the following section while scrolling. Reveal section by previous section."
        >
          <InspectorSelect
            value={section.stickyEffect ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "cover", label: "Sticky Cover" },
              { value: "reveal", label: "Sticky Reveal" },
            ]}
            onChange={(value) => update({ stickyEffect: value as any })}
            ariaLabel="Sticky Effect"
          />
        </InspectorFieldRow>

        {/* TRANSPARENT HEADER */}
        <InspectorFieldRow
          label="Transparent Header"
          description="Make the header transparent and overlay this section if it directly follows the header."
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <InspectorSwitch
              label="Make header transparent"
              checked={section.headerTransparent ?? false}
              onChange={(checked) => update({ headerTransparent: checked })}
            />
            <InspectorSwitch
              label="Pull content behind header"
              checked={section.pullUnderHeader ?? false}
              onChange={(checked) => update({ pullUnderHeader: checked })}
            />
          </div>
        </InspectorFieldRow>

        {/* HEADER TEXT COLOR */}
        <InspectorFieldRow
          label="Header Text Color"
          description="Force a light or dark color for text, buttons and controls on the image or video background."
        >
          <InspectorSelect
            value={section.headerTextColor ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
            onChange={(value) => update({ headerTextColor: value as any })}
            ariaLabel="Header Text Color"
          />
        </InspectorFieldRow>

        {/* ANIMATION */}
        <InspectorFieldRow
          label="Animation"
          description="Apply an animation to elements once they enter the viewport. Slide animations can come into effect with a fixed offset or at 100% of the element size."
        >
          <InspectorSelect
            value={typeof section.animation === "string" ? section.animation : section.animation?.preset ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "fade", label: "Fade" },
              { value: "scale-up", label: "Scale Up" },
              { value: "scale-down", label: "Scale Down" },
              { value: "slide-top-small", label: "Slide Top Small" },
              { value: "slide-top-medium", label: "Slide Top Medium" },
              { value: "slide-bottom-medium", label: "Slide Bottom Medium" },
              { value: "slide-left-medium", label: "Slide Left Medium" },
              { value: "slide-right-medium", label: "Slide Right Medium" },
            ]}
            onChange={(value) => update({ animation: value as any })}
            ariaLabel="Animation"
          />
        </InspectorFieldRow>

        {/* ANIMATION DELAY */}
        <InspectorFieldRow
          label="Animation Delay"
          description="Delay the element animations in milliseconds, e.g. 200."
        >
          <input
            type="number"
            className="builder-input"
            value={section.animationDelay ?? ""}
            placeholder="100"
            onChange={(e) => update({ animationDelay: e.target.value ? Number(e.target.value) : undefined })}
          />
        </InspectorFieldRow>

        <hr style={{ border: "none", borderTop: "1px solid var(--builder-ui-border)", margin: "16px 0" }} />

        {/* TITLE DIVISION */}
        <InspectorDivision title="Title">
          <InspectorFieldRow label="Position">
            <InspectorSelect
              value={section.sectionTitlePosition ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "left-top", label: "Left Top" },
                { value: "right-top", label: "Right Top" },
                { value: "left-center", label: "Left Center" },
                { value: "right-center", label: "Right Center" },
              ]}
              onChange={(value) => update({ sectionTitlePosition: value })}
              ariaLabel="Title Position"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Rotation">
            <InspectorSelect
              value={section.sectionTitleRotation ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "left", label: "Left" },
                { value: "right", label: "Right" },
              ]}
              onChange={(value) => update({ sectionTitleRotation: value as any })}
              ariaLabel="Title Rotation"
            />
          </InspectorFieldRow>

          <InspectorFieldRow label="Breakpoint">
            <InspectorSelect
              value={section.sectionTitleBreakpoint ?? "xlarge"}
              options={[
                { value: "xlarge", label: "X-Large (Large Screens)" },
                { value: "large", label: "Large" },
                { value: "medium", label: "Medium" },
                { value: "small", label: "Small" },
              ]}
              onChange={(value) => update({ sectionTitleBreakpoint: value })}
              ariaLabel="Title Breakpoint"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </InspectorSection>
    </div>
  );
}
