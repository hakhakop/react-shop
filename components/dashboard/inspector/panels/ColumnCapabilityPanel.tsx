"use client";

import type {
  BuilderColumn,
  BuilderLayoutAdvancedSettings,
  BuilderLayoutHtmlElement,
  InspectorTab,
} from "@/components/dashboard/builderTypes";
import {
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextarea,
  InspectorTextField,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  column: BuilderColumn;
  tab: InspectorTab;
  update: (patch: Partial<BuilderColumn>) => void;
};

function attributesValue(attributes: BuilderLayoutAdvancedSettings["attributes"]) {
  if (!attributes) return "";
  return typeof attributes === "string"
    ? attributes
    : Object.entries(attributes).map(([name, value]) => `${name}=${value}`).join("\n");
}

export default function ColumnCapabilityPanel({ column, tab, update }: Props) {
  const updateBackground = (patch: Partial<NonNullable<BuilderColumn["background"]>>) =>
    update({ background: { ...(column.background ?? {}), ...patch } });
  const updateSticky = (patch: Partial<NonNullable<BuilderColumn["sticky"]>>) =>
    update({ sticky: { ...(column.sticky ?? {}), ...patch } });
  const updateAdvanced = (patch: Partial<BuilderLayoutAdvancedSettings>) =>
    update({ advanced: { ...(column.advanced ?? {}), ...patch } });

  if (tab === "layout") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
        <div className="builder-element-inspector-note">
          <strong>YOOtheme Column</strong>
          <span>Vertical alignment belongs to this Column. Responsive width and order remain in Row → Edit Layout.</span>
        </div>
        <InspectorFieldRow label="Vertical Alignment">
          <InspectorPillGroup
            value={column.verticalAlign ?? "top"}
            options={[
              { value: "top", label: "Top" },
              { value: "middle", label: "Middle" },
              { value: "bottom", label: "Bottom" },
            ]}
            onChange={(verticalAlign) => update({ verticalAlign })}
            ariaLabel="Column Vertical Alignment"
          />
        </InspectorFieldRow>
      </div>
    );
  }

  if (tab === "style") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
        <div className="builder-element-inspector-note">
          <strong>Column Background</strong>
          <span>These values have canonical Column storage. Their presentation projection remains deferred.</span>
        </div>
        <InspectorFieldRow label="Style / Background Role">
          <InspectorSelect
            value={column.style ?? "none"}
            options={[
              { value: "none", label: "None" },
              { value: "default", label: "Default" },
              { value: "muted", label: "Muted" },
              { value: "primary", label: "Primary" },
              { value: "secondary", label: "Secondary" },
            ]}
            onChange={(style) => update({ style: style === "none" ? undefined : style })}
            ariaLabel="Column background role"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Custom Color"><InspectorTextField value={column.background?.color ?? ""} placeholder="#ffffff or semantic value" onChange={(color) => updateBackground({ color: color || undefined })} ariaLabel="Column background color" /></InspectorFieldRow>
        <InspectorFieldRow label="Gradient"><InspectorTextarea value={column.background?.gradient ?? ""} placeholder="linear-gradient(...)" onChange={(gradient) => updateBackground({ gradient: gradient || undefined })} ariaLabel="Column background gradient" /></InspectorFieldRow>
        <InspectorFieldRow label="Background Image"><InspectorTextField value={column.background?.imageUrl ?? ""} placeholder="Image URL" onChange={(imageUrl) => updateBackground({ imageUrl: imageUrl || undefined })} ariaLabel="Column background image" /></InspectorFieldRow>
        <InspectorFieldRow label="Background Video"><InspectorTextField value={column.background?.videoUrl ?? ""} placeholder="Video URL" onChange={(videoUrl) => updateBackground({ videoUrl: videoUrl || undefined })} ariaLabel="Column background video" /></InspectorFieldRow>
        <div className="builder-two-column">
          <InspectorFieldRow label="Media Position"><InspectorTextField value={column.background?.position ?? ""} placeholder="center-center" onChange={(position) => updateBackground({ position: position || undefined })} ariaLabel="Column background position" /></InspectorFieldRow>
          <InspectorFieldRow label="Media Size">
            <InspectorSelect
              value={column.background?.size ?? "cover"}
              options={[{ value: "auto", label: "Auto" }, { value: "cover", label: "Cover" }, { value: "contain", label: "Contain" }]}
              onChange={(size) => updateBackground({ size })}
              ariaLabel="Column background size"
            />
          </InspectorFieldRow>
        </div>
        <InspectorFieldRow label="Media Repeat"><InspectorTextField value={column.background?.repeat ?? ""} placeholder="no-repeat" onChange={(repeat) => updateBackground({ repeat: repeat || undefined })} ariaLabel="Column background repeat" /></InspectorFieldRow>
        <InspectorFieldRow label="Text Color">
          <InspectorSelect
            value={column.textColor ?? "none"}
            options={[{ value: "none", label: "Auto" }, { value: "light", label: "Light" }, { value: "dark", label: "Dark" }]}
            onChange={(textColor) => update({ textColor })}
            ariaLabel="Column Text Color"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Preserve Color" description="Canonical storage exists; preserve-color class projection is deferred.">
          <InspectorSwitch checked={column.preserveColor === true} onChange={(preserveColor) => update({ preserveColor })} label="Preserve nested element colors" />
        </InspectorFieldRow>
      </div>
    );
  }

  if (tab === "spacing") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
        <div className="builder-element-inspector-note">
          <strong>Column Padding</strong>
          <span>Padding is stored on this Column; renderer projection remains deferred.</span>
        </div>
        <InspectorFieldRow label="Padding">
          <InspectorSelect
            value={column.padding ?? "inherit"}
            options={[
              { value: "inherit", label: "Inherit" },
              { value: "none", label: "None" },
              { value: "small", label: "Small" },
              { value: "default", label: "Default" },
              { value: "medium", label: "Medium" },
              { value: "large", label: "Large" },
              { value: "xlarge", label: "X-Large" },
            ]}
            onChange={(padding) => update({ padding })}
            ariaLabel="Column Padding"
          />
        </InspectorFieldRow>
      </div>
    );
  }

  if (tab === "advanced") {
    return (
      <div className="builder-inspector-stack" data-canonical-owner="BuilderColumn">
        <InspectorFieldRow label="HTML Element" description="Canonical storage exists; semantic tag projection is deferred.">
          <InspectorSelect
            value={column.htmlElement ?? "div"}
            options={["div", "address", "article", "aside", "footer", "header", "hgroup", "main", "nav", "section"].map((value) => ({ value, label: value }))}
            onChange={(htmlElement) => update({ htmlElement: htmlElement as BuilderLayoutHtmlElement })}
            ariaLabel="Column HTML Element"
          />
        </InspectorFieldRow>

        <div className="builder-inspector-section">
          <div className="builder-field-header"><strong>Sticky</strong><small>Canonical configuration; sticky runtime projection remains deferred.</small></div>
          <InspectorFieldRow label="Mode">
            <InspectorSelect
              value={column.sticky?.mode ?? "none"}
              options={[
                { value: "none", label: "None" },
                { value: "elements-within-column", label: "Elements within Column" },
                { value: "column-within-row", label: "Column within Row" },
                { value: "column-within-section", label: "Column within Section" },
                { value: "always", label: "Always" },
              ]}
              onChange={(mode) => updateSticky({ mode })}
              ariaLabel="Column Sticky Mode"
            />
          </InspectorFieldRow>
          <div className="builder-two-column">
            <InspectorFieldRow label="Top Offset"><InspectorTextField value={column.sticky?.topOffset ?? ""} placeholder="0px" onChange={(topOffset) => updateSticky({ topOffset: topOffset || undefined })} ariaLabel="Column sticky top offset" /></InspectorFieldRow>
            <InspectorFieldRow label="Bottom Offset"><InspectorTextField value={column.sticky?.bottomOffset ?? ""} placeholder="0px" onChange={(bottomOffset) => updateSticky({ bottomOffset: bottomOffset || undefined })} ariaLabel="Column sticky bottom offset" /></InspectorFieldRow>
          </div>
          <InspectorFieldRow label="Breakpoint">
            <InspectorSelect
              value={column.sticky?.breakpoint ?? ""}
              options={[{ value: "", label: "Always" }, { value: "s", label: "Small" }, { value: "m", label: "Medium" }, { value: "l", label: "Large" }, { value: "xl", label: "X-Large" }]}
              onChange={(breakpoint) => updateSticky({ breakpoint })}
              ariaLabel="Column sticky breakpoint"
            />
          </InspectorFieldRow>
        </div>

        <InspectorFieldRow label="Empty Dynamic Content" description="Preserve the Column when its dynamic content resolves empty.">
          <InspectorSwitch checked={column.keepEmpty === true} onChange={(keepEmpty) => update({ keepEmpty })} label="Keep empty Column" />
        </InspectorFieldRow>
        <InspectorFieldRow label="ID"><InspectorTextField value={column.advanced?.htmlId ?? ""} onChange={(htmlId) => updateAdvanced({ htmlId: htmlId || undefined })} ariaLabel="Column Advanced ID" /></InspectorFieldRow>
        <InspectorFieldRow label="Class"><InspectorTextField value={column.advanced?.className ?? ""} onChange={(className) => updateAdvanced({ className: className || undefined })} ariaLabel="Column Advanced Class" /></InspectorFieldRow>
        <InspectorFieldRow label="Attributes"><InspectorTextarea value={attributesValue(column.advanced?.attributes)} onChange={(attributes) => updateAdvanced({ attributes: attributes || undefined })} ariaLabel="Column Advanced Attributes" /></InspectorFieldRow>
        <InspectorFieldRow label="CSS"><InspectorTextarea value={column.advanced?.css ?? ""} onChange={(css) => updateAdvanced({ css: css || undefined })} ariaLabel="Column Advanced CSS" /></InspectorFieldRow>
      </div>
    );
  }

  return null;
}
