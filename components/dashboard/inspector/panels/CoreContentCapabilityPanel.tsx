"use client";

import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { InspectorFieldRow, InspectorPillGroup, InspectorSelect, InspectorSwitch, InspectorTextField, InspectorTextarea } from "@/components/dashboard/inspector/InspectorControls";
import IconPicker from "@/components/dashboard/inspector/IconPicker";

type Props = { block: BuilderLayoutBlock; tab: InspectorTab; update: (patch: Partial<BuilderLayoutBlock>) => void };
type CoreProps = Props & { shellSettings: BuilderShellSettings };
type CoreKind = "hero" | "grid" | "icon" | "badgeGrid" | "table" | "divider" | "alert" | "breadcrumbs" | "datePicker";

const labels = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) }));
const option = <T extends string>(value: T, label: string) => [{ value, label }] as const;

function TextContent({ block, update }: Pick<Props, "block" | "update">) {
  return <>
    <InspectorFieldRow label="Title"><InspectorTextField value={block.title ?? block.headingText ?? ""} onChange={(value) => update({ title: value, headingText: block.kind === "hero" ? value : block.headingText })} ariaLabel="Element title" /></InspectorFieldRow>
    <InspectorFieldRow label="Body"><InspectorTextarea value={block.body ?? ""} onChange={(value) => update({ body: value })} ariaLabel="Element body" /></InspectorFieldRow>
  </>;
}

export default function CoreContentCapabilityPanel({ block, tab, shellSettings, update }: CoreProps) {
  const kind = block.kind as CoreKind;
  if (tab === "content") {
    return <div className="builder-inspector-stack" data-uikit-capability={`${kind}-content`}>
      <div className="builder-element-inspector-note"><strong>{kind === "badgeGrid" ? "Badge Grid content" : `${kind[0].toUpperCase()}${kind.slice(1)} content`}</strong><span>Content and document structure remain owned by WebPages.</span></div>
      {kind === "hero" && <>
        <InspectorFieldRow label="Eyebrow"><InspectorTextField value={block.eyebrow ?? ""} onChange={(value) => update({ eyebrow: value })} ariaLabel="Hero eyebrow" /></InspectorFieldRow>
        <InspectorFieldRow label="Title"><InspectorTextField value={block.title ?? ""} onChange={(value) => update({ title: value })} ariaLabel="Hero title" /></InspectorFieldRow>
        <InspectorFieldRow label="Body"><InspectorTextarea value={block.body ?? ""} onChange={(value) => update({ body: value })} ariaLabel="Hero body" /></InspectorFieldRow>
      </>}
      {kind === "icon" && <>
        <InspectorFieldRow label="Icon">
          <IconPicker
            value={block.iconName}
            onChange={(value) => update({ iconName: value })}
            onClear={() => update({ iconName: undefined })}
            ariaLabel="Icon"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Icon size">
          <InspectorSelect
            value={String(block.iconSize ?? block.listIconSize ?? 28)}
            options={[16, 20, 24, 28, 32, 40, 48].map((value) => ({ value: String(value), label: `${value}px` }))}
            onChange={(value) => update({ iconSize: Number(value) })}
            ariaLabel="Icon size"
          />
        </InspectorFieldRow>
        <TextContent block={block} update={update} />
      </>}
      {kind === "alert" && <TextContent block={block} update={update} />}
      {kind === "datePicker" && <InspectorFieldRow label="Field label"><InspectorTextField value={block.dateLabel ?? ""} onChange={(value) => update({ dateLabel: value })} ariaLabel="Date picker label" /></InspectorFieldRow>}
      {kind === "breadcrumbs" && <div className="builder-element-inspector-note"><strong>Dynamic breadcrumbs</strong><span>Breadcrumbs are resolved from the active page and current navigation context.</span></div>}
      {kind === "badgeGrid" && <div className="builder-element-inspector-note"><strong>Badge items</strong><span>Badge content is managed by the section data and remains localized with the document.</span></div>}
      {kind === "grid" && <>
        <InspectorFieldRow label="Source"><InspectorPillGroup value={block.gridSource ?? "static"} options={[{ value: "static", label: "Static" }, { value: "products", label: "Products" }]} onChange={(value) => update({ gridSource: value })} ariaLabel="Grid source" /></InspectorFieldRow>
        <InspectorFieldRow label="Rows"><InspectorSelect value={String(block.gridRows ?? 3)} options={[1, 2, 3, 4, 5, 6].map((value) => ({ value: String(value), label: String(value) }))} onChange={(value) => update({ gridRows: Number(value) })} ariaLabel="Grid rows" /></InspectorFieldRow>
        {block.gridSource === "products" && <InspectorFieldRow label="Item limit"><InspectorTextField value={String(block.gridLimit ?? 8)} onChange={(value) => update({ gridLimit: Number(value) || 0 })} ariaLabel="Grid item limit" /></InspectorFieldRow>}
      </>}
      {kind === "table" && <TableEditor block={block} update={update} />}
      {kind === "divider" && <div className="builder-element-inspector-note"><strong>Divider content</strong><span>Divider content is structural; presentation is controlled in Styling.</span></div>}
    </div>;
  }

  if (tab === "style") {
    return <div className="builder-inspector-stack" data-uikit-capability={`${kind}-style`}>
      <div className="builder-element-inspector-note"><strong>Semantic presentation</strong><span>Appearance tokens remain owned by UIkit and Global Styles.</span></div>
      {kind === "hero" && <InspectorFieldRow label="Variant"><InspectorSelect value={block.carouselSettings?.variant ?? "default"} options={[{ value: "default", label: "Default" }, { value: "antigravity", label: "Antigravity" }]} onChange={(value) => update({ carouselSettings: { ...(block.carouselSettings ?? {}), variant: value } })} ariaLabel="Hero variant" /></InspectorFieldRow>}
      {kind === "grid" && <>
        <InspectorFieldRow label="Item gap"><InspectorPillGroup value={block.gridGap ?? "medium"} options={labels(["none", "small", "medium", "large", "max"] as const)} onChange={(value) => update({ gridGap: value })} ariaLabel="Grid item gap" /></InspectorFieldRow>
        <InspectorFieldRow label="Show image"><InspectorSwitch checked={block.gridShowImage !== false} onChange={(checked) => update({ gridShowImage: checked })} label="Show image" /></InspectorFieldRow>
        <InspectorFieldRow label="Show text"><InspectorSwitch checked={block.gridShowText !== false} onChange={(checked) => update({ gridShowText: checked })} label="Show text" /></InspectorFieldRow>
        <InspectorFieldRow label="Show action"><InspectorSwitch checked={block.gridShowButton === true} onChange={(checked) => update({ gridShowButton: checked })} label="Show action" /></InspectorFieldRow>
      </>}
      {kind === "table" && <InspectorFieldRow label="Presentation"><InspectorPillGroup value={block.tableStyle ?? "plain"} options={labels(["plain", "striped", "bordered"] as const)} onChange={(value) => update({ tableStyle: value })} ariaLabel="Table presentation" /></InspectorFieldRow>}
      {kind === "divider" && <InspectorFieldRow label="Style"><InspectorPillGroup value={block.dividerStyle ?? "default"} options={labels(["default", "small", "icon", "vertical"] as const)} onChange={(value) => update({ dividerStyle: value })} ariaLabel="Divider style" /></InspectorFieldRow>}
      {kind === "alert" && <InspectorFieldRow label="Variant"><InspectorPillGroup value={block.alertStyle ?? "primary"} options={labels(["primary", "success", "warning", "danger"] as const)} onChange={(value) => update({ alertStyle: value })} ariaLabel="Alert variant" /></InspectorFieldRow>}
      {kind === "badgeGrid" && <InspectorFieldRow label="Show text"><InspectorSwitch checked={block.gridShowText !== false} onChange={(checked) => update({ gridShowText: checked })} label="Show text" /></InspectorFieldRow>}
    </div>;
  }

  if (tab === "behavior") {
    return <div className="builder-inspector-stack" data-uikit-capability={`${kind}-behavior`}><div className="builder-element-inspector-note"><strong>Behavior</strong><span>{kind === "datePicker" ? "The browser owns date selection and keyboard behavior." : kind === "breadcrumbs" ? "Navigation follows the active page hierarchy." : "No additional instance behavior is currently supported."}</span></div></div>;
  }
  return null;
}

function TableEditor({ block, update }: Pick<Props, "block" | "update">) {
  const headings = block.tableHeadings ?? [];
  const rows = block.tableRows ?? [];
  return <>
    <InspectorFieldRow label="Headers"><InspectorTextarea value={headings.join(" | ")} onChange={(value) => update({ tableHeadings: value.split("|").map((entry) => entry.trim()).filter(Boolean) })} ariaLabel="Table headers" /></InspectorFieldRow>
    <InspectorFieldRow label="Rows"><InspectorTextarea value={rows.map((row) => row.join(" | ")).join("\n")} onChange={(value) => update({ tableRows: value.split("\n").map((row) => row.split("|").map((entry) => entry.trim())) })} ariaLabel="Table rows" /></InspectorFieldRow>
  </>;
}
