"use client";

import type { InspectorTab, BuilderLayoutBlock } from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import {
  InspectorDivision,
  InspectorFieldRow,
  InspectorSelect,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";
import ElementAdvancedPanel from "@/components/dashboard/inspector/panels/ElementAdvancedPanel";
import RichTextEditor from "@/components/dashboard/RichTextEditor";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
};

export default function TableCapabilityPanel({ block, tab, shellSettings, update }: Props) {
  const rawBlock = block as any;
  const importedItems = Array.isArray(rawBlock.tableItems) ? rawBlock.tableItems : null;
  const isImportedYoothemeTable = rawBlock.spacingContract === "yootheme" && importedItems !== null;
  const updateItem = (index: number, patch: Record<string, unknown>) => {
    if (!importedItems) return;
    update({ tableItems: importedItems.map((item: any, itemIndex: number) => itemIndex === index ? { ...item, ...patch } : item) } as any);
  };
  const updateItems = (items: typeof importedItems) => update({ tableItems: items } as any);
  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (!importedItems || sourceIndex === targetIndex) return;
    const next = [...importedItems];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    updateItems(next);
  };
  const fields = new Set(rawBlock.tableColumnFields ?? []);

  // CONTENT TAB
  if (tab === "content") {
    if (isImportedYoothemeTable) {
      return (
        <div className="builder-inspector-stack" data-uikit-capability="table-content">
          <InspectorDivision title="ITEMS">
            <RepeatableItemShell
              items={importedItems}
              getItemKey={(item: any, index) => item.id ?? `${block.id ?? "table"}-item-${index}`}
              itemLabel="Item"
              itemDataAttribute="data-table-item-id"
              addLabel="Add Item"
              getItemSummary={(item: any) => item.title || item.meta || item.imageAlt || "Untitled item"}
              onAdd={() => {
                const id = `${block.id ?? "table"}-item-${Date.now().toString(36)}`;
                updateItems([...importedItems, { id, title: "", meta: "", content: "" }]);
                return id;
              }}
              onCopy={(index) => {
                const source = importedItems[index];
                if (!source) return;
                const id = `${block.id ?? "table"}-item-${Date.now().toString(36)}`;
                const next = [...importedItems];
                next.splice(index + 1, 0, { ...source, id, title: source.title ? `${source.title} Copy` : "" });
                updateItems(next);
                return id;
              }}
              onDelete={(index) => updateItems(importedItems.filter((_: any, itemIndex: number) => itemIndex !== index))}
              onReorder={reorderItems}
              renderItem={(item: any, index) => <>
                {fields.has("image") && <>
                  <InspectorFieldRow label="Image">
                    <InspectorTextField value={item.imageUrl ?? ""} onChange={(value) => updateItem(index, { imageUrl: value || undefined })} ariaLabel={`Table item ${index + 1} image`} />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Alt text">
                    <InspectorTextField value={item.imageAlt ?? ""} onChange={(value) => updateItem(index, { imageAlt: value || undefined })} ariaLabel={`Table item ${index + 1} image alt`} />
                  </InspectorFieldRow>
                </>}
                {fields.has("title") && <InspectorFieldRow label="Title">
                  <InspectorTextField value={item.title ?? ""} onChange={(value) => updateItem(index, { title: value })} ariaLabel={`Table item ${index + 1} title`} />
                </InspectorFieldRow>}
                {fields.has("meta") && <InspectorFieldRow label="Meta">
                  <InspectorTextField value={item.meta ?? ""} onChange={(value) => updateItem(index, { meta: value })} ariaLabel={`Table item ${index + 1} meta`} />
                </InspectorFieldRow>}
                {fields.has("content") && <InspectorFieldRow label="Content">
                  <RichTextEditor value={item.content ?? ""} onChange={(value) => updateItem(index, { content: value })} minHeight="120px" />
                </InspectorFieldRow>}
                {fields.has("link") && <>
                  <InspectorFieldRow label="Link URL">
                    <InspectorTextField value={item.linkUrl ?? ""} onChange={(value) => updateItem(index, { linkUrl: value || undefined })} ariaLabel={`Table item ${index + 1} link URL`} />
                  </InspectorFieldRow>
                  <InspectorFieldRow label="Link label">
                    <InspectorTextField value={item.linkLabel ?? ""} onChange={(value) => updateItem(index, { linkLabel: value || undefined })} ariaLabel={`Table item ${index + 1} link label`} />
                  </InspectorFieldRow>
                </>}
              </>}
            />
          </InspectorDivision>
        </div>
      );
    }
    const headingsStr = (rawBlock.tableHeadings ?? []).join(", ");
    const rowsStr = (rawBlock.tableRows ?? []).map((row: string[]) => row.join(", ")).join("\n");

    return (
      <div className="builder-inspector-stack" data-uikit-capability="table-content">
        <InspectorDivision title="HEADINGS">
          <InspectorFieldRow label="Headings (CSV)">
            <InspectorTextField
              value={headingsStr}
              onChange={(v) => update({ tableHeadings: v.split(",").map((s) => s.trim()) } as any)}
              placeholder="Header 1, Header 2, Header 3"
              ariaLabel="Table Headings"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        <InspectorDivision title="ROWS">
          <InspectorFieldRow label="Rows (CSV per line)">
            <InspectorTextarea
              value={rowsStr}
              onChange={(v) =>
                update({
                  tableRows: v
                    .split("\n")
                    .map((line) => line.split(",").map((s) => s.trim())),
                } as any)
              }
              placeholder="Item 1, Desc 1, $10&#10;Item 2, Desc 2, $20"
              ariaLabel="Table Rows"
            />
          </InspectorFieldRow>
        </InspectorDivision>
      </div>
    );
  }

  // ADVANCED TAB
  if (tab === "advanced") {
    return <ElementAdvancedPanel block={block} update={update} />;
  }

  // SETTINGS TAB (Default)
  return (
    <div className="builder-inspector-stack" data-uikit-capability="table-style">
      <InspectorDivision title="TABLE">
        <InspectorFieldRow label="Style">
          <InspectorSelect
            value={rawBlock.tableStyle ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "divider", label: "Divider" },
              { value: "striped", label: "Striped" },
            ]}
            onChange={(v) => update({ tableStyle: v } as any)}
            ariaLabel="Table style"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Size">
          <InspectorSelect
            value={rawBlock.tableSize ?? rawBlock.size ?? "default"}
            options={[
              { value: "default", label: "Default" },
              { value: "small", label: "Small" },
              { value: "large", label: "Large" },
            ]}
            onChange={(v) => update({ tableSize: v } as any)}
            ariaLabel="Table size"
          />
        </InspectorFieldRow>
        <InspectorFieldRow label="Hover effect">
          <label className="builder-inspector-checkbox-row">
            <input
              type="checkbox"
              checked={Boolean(rawBlock.tableHover)}
              onChange={(e) => update({ tableHover: e.target.checked } as any)}
            />
            <span>Enable row hover highlight</span>
          </label>
        </InspectorFieldRow>
      </InspectorDivision>
      <InspectorDivision title="LAYOUT">
        <InspectorFieldRow label="Responsive"><InspectorSelect value={rawBlock.tableResponsive ?? "overflow"} options={[{ value: "overflow", label: "Scroll overflow" }, { value: "responsive", label: "Stacked" }]} onChange={(v) => update({ tableResponsive: v } as any)} ariaLabel="Table responsive behavior" /></InspectorFieldRow>
        <InspectorFieldRow label="Vertical Alignment"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={rawBlock.tableVerticalAlign === true} onChange={(event) => update({ tableVerticalAlign: event.target.checked } as any)} /><span>Center cells vertically</span></label></InspectorFieldRow>
        <InspectorFieldRow label="Remove horizontal padding"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={rawBlock.tableJustify === true} onChange={(event) => update({ tableJustify: event.target.checked } as any)} /><span>Remove left and right padding</span></label></InspectorFieldRow>
        <InspectorFieldRow label="Last Column Alignment"><InspectorSelect value={rawBlock.tableLastAlign ?? ""} options={[{ value: "", label: "None" }, { value: "left", label: "Left" }, { value: "center", label: "Center" }, { value: "right", label: "Right" }]} onChange={(v) => update({ tableLastAlign: v || undefined } as any)} ariaLabel="Last column alignment" /></InspectorFieldRow>
      </InspectorDivision>
      {isImportedYoothemeTable && (
        <>
          <InspectorDivision title="IMAGE">
            <InspectorFieldRow label="Show image"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={rawBlock.tableShowImage !== false} onChange={(event) => update({ tableShowImage: event.target.checked } as any)} /><span>Show image</span></label></InspectorFieldRow>
            <InspectorFieldRow label="Width"><InspectorTextField value={String(rawBlock.tableImageWidth ?? "")} onChange={(value) => update({ tableImageWidth: value || undefined } as any)} ariaLabel="Table image width" /></InspectorFieldRow>
            <InspectorFieldRow label="Height"><InspectorTextField value={String(rawBlock.tableImageHeight ?? "")} onChange={(value) => update({ tableImageHeight: value || undefined } as any)} ariaLabel="Table image height" /></InspectorFieldRow>
            <InspectorFieldRow label="Loading"><InspectorSelect value={rawBlock.tableImageLoading ?? "lazy"} options={[{ value: "lazy", label: "Lazy" }, { value: "eager", label: "Eager" }]} onChange={(value) => update({ tableImageLoading: value } as any)} ariaLabel="Table image loading" /></InspectorFieldRow>
            <InspectorFieldRow label="Border"><InspectorSelect value={rawBlock.tableImageBorder ?? "none"} options={[{ value: "none", label: "None" }, { value: "rounded", label: "Rounded" }, { value: "circle", label: "Circle" }, { value: "pill", label: "Pill" }]} onChange={(value) => update({ tableImageBorder: value } as any)} ariaLabel="Table image border" /></InspectorFieldRow>
            <InspectorFieldRow label="Box Shadow"><InspectorSelect value={rawBlock.tableImageShadow ?? "none"} options={[{ value: "none", label: "None" }, { value: "small", label: "Small" }, { value: "medium", label: "Medium" }, { value: "large", label: "Large" }, { value: "xlarge", label: "X-Large" }]} onChange={(value) => update({ tableImageShadow: value } as any)} ariaLabel="Table image box shadow" /></InspectorFieldRow>
          </InspectorDivision>
          <InspectorDivision title="LINK">
            <InspectorFieldRow label="Show link"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={rawBlock.tableShowLink !== false} onChange={(event) => update({ tableShowLink: event.target.checked } as any)} /><span>Show link</span></label></InspectorFieldRow>
            <InspectorFieldRow label="Target"><InspectorSelect value={rawBlock.tableLinkTarget ?? "_self"} options={BUILDER_LINK_TARGET_OPTIONS} onChange={(value) => update({ tableLinkTarget: value } as any)} ariaLabel="Table link target" /></InspectorFieldRow>
            <InspectorFieldRow label="Style"><InspectorSelect value={rawBlock.tableLinkStyle ?? "default"} options={[{ value: "default", label: "Button Default" }, { value: "primary", label: "Button Primary" }, { value: "secondary", label: "Button Secondary" }, { value: "danger", label: "Button Danger" }, { value: "text", label: "Button Text" }, { value: "link-muted", label: "Link Muted" }, { value: "link-text", label: "Link Text" }]} onChange={(value) => update({ tableLinkStyle: value } as any)} ariaLabel="Table link style" /></InspectorFieldRow>
            <InspectorFieldRow label="Button Size"><InspectorSelect value={rawBlock.tableLinkSize ?? "default"} options={[{ value: "small", label: "Small" }, { value: "default", label: "Default" }, { value: "large", label: "Large" }]} onChange={(value) => update({ tableLinkSize: value } as any)} ariaLabel="Table link size" /></InspectorFieldRow>
            <InspectorFieldRow label="Full width"><label className="builder-inspector-checkbox-row"><input type="checkbox" checked={rawBlock.tableLinkFullWidth === true} onChange={(event) => update({ tableLinkFullWidth: event.target.checked } as any)} /><span>Expand width to table cell</span></label></InspectorFieldRow>
          </InspectorDivision>
        </>
      )}
    </div>
  );
}
