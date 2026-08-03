"use client";

import { useRef } from "react";
import type { BuilderLayoutBlock, InspectorTab } from "@/components/dashboard/builderTypes";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import {
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = { block: BuilderLayoutBlock; tab: InspectorTab; update: (patch: any) => void };
const opts = <T extends string>(values: readonly T[]) => values.map((value) => ({ value, label: value.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()) }));
const targets = [{ value: "_self", label: "Same window" }, { value: "_blank", label: "New window" }] as const;

function ActionFields({ label, prefix, block, update }: { label: string; prefix: "primary" | "secondary"; block: BuilderLayoutBlock; update: Props["update"] }) {
  const labelKey = prefix === "primary" ? "buttonLabel" : "secondaryButtonLabel";
  const urlKey = prefix === "primary" ? "buttonUrl" : "secondaryButtonUrl";
  const targetKey = prefix === "primary" ? "buttonTarget" : "secondaryButtonTarget";
  const styleKey = prefix === "primary" ? "buttonStyle" : "secondaryButtonStyle";
  const sizeKey = prefix === "primary" ? "size" : "secondaryButtonSize";
  const values = block as any;
  return <InspectorSection title={label}>
    <InspectorFieldRow label="Label"><InspectorTextField value={String(values[labelKey] ?? "")} onChange={(value) => update({ [labelKey]: value })} ariaLabel={`${label} label`} /></InspectorFieldRow>
    <InspectorFieldRow label="URL"><InspectorTextField value={String(values[urlKey] ?? "")} onChange={(value) => update({ [urlKey]: value })} ariaLabel={`${label} URL`} /></InspectorFieldRow>
    <InspectorFieldRow label="Target"><InspectorSelect value={String(values[targetKey] ?? "_self")} options={targets} onChange={(value) => update({ [targetKey]: value })} ariaLabel={`${label} target`} /></InspectorFieldRow>
  </InspectorSection>;
}

function ActionPresentationFields({ label, prefix, block, update }: { label: string; prefix: "primary" | "secondary"; block: BuilderLayoutBlock; update: Props["update"] }) {
  const values = block as any;
  const styleKey = prefix === "primary" ? "buttonStyle" : "secondaryButtonStyle";
  const sizeKey = prefix === "primary" ? "size" : "secondaryButtonSize";
  return <InspectorSection title={label} description="Uses the same UIkit Button variants and sizes as standalone Buttons.">
    <InspectorFieldRow label="Variant"><InspectorPillGroup value={String(values[styleKey] ?? (prefix === "primary" ? "primary" : "secondary"))} options={opts(["default", "primary", "secondary", "text"] as const)} onChange={(value) => update({ [styleKey]: value })} ariaLabel={`${label} variant`} /></InspectorFieldRow>
    <InspectorFieldRow label="Size"><InspectorPillGroup value={String(values[sizeKey] ?? "default")} options={opts(["small", "default", "large"] as const)} onChange={(value) => update({ [sizeKey]: value })} ariaLabel={`${label} size`} /></InspectorFieldRow>
  </InspectorSection>;
}

export function HeroCapabilityPanel({ block, tab, update }: Props) {
  if (tab === "content") return <div className="builder-inspector-stack" data-uikit-capability="hero-content">
    <InspectorSection title="Hero content" description="Edit the content and actions for this hero instance.">
      <InspectorFieldRow label="Eyebrow"><InspectorTextField value={block.eyebrow ?? ""} onChange={(value) => update({ eyebrow: value })} ariaLabel="Hero eyebrow" /></InspectorFieldRow>
      <InspectorFieldRow label="Heading"><InspectorTextField value={block.title ?? ""} onChange={(value) => update({ title: value })} ariaLabel="Hero heading" /></InspectorFieldRow>
      <InspectorFieldRow label="Body"><InspectorTextarea value={block.body ?? ""} onChange={(value) => update({ body: value })} ariaLabel="Hero body" /></InspectorFieldRow>
      <InspectorFieldRow label="Media source"><InspectorTextField value={block.imageUrl ?? ""} onChange={(value) => update({ imageUrl: value })} ariaLabel="Hero media source" /></InspectorFieldRow>
      <InspectorFieldRow label="Media alt"><InspectorTextField value={block.imageAlt ?? ""} onChange={(value) => update({ imageAlt: value })} ariaLabel="Hero media alt" /></InspectorFieldRow>
    </InspectorSection>
    <ActionFields label="Primary action" prefix="primary" block={block} update={update} />
    <ActionFields label="Secondary action" prefix="secondary" block={block} update={update} />
  </div>;
  if (tab === "style") return <div className="builder-inspector-stack" data-uikit-capability="hero-style">
    <InspectorSection title="Layout">
      <InspectorFieldRow label="Content alignment"><InspectorPillGroup value={block.heroContentAlign ?? block.elementAlign ?? "left"} options={opts(["left", "center", "right"] as const)} onChange={(value) => update({ heroContentAlign: value, elementAlign: value })} ariaLabel="Hero content alignment" /></InspectorFieldRow>
      <InspectorFieldRow label="Vertical alignment"><InspectorPillGroup value={block.heroVerticalAlign ?? "center"} options={opts(["top", "center", "bottom"] as const)} onChange={(value) => update({ heroVerticalAlign: value })} ariaLabel="Hero vertical alignment" /></InspectorFieldRow>
      <InspectorFieldRow label="Content width"><InspectorSelect value={block.heroContentWidth ?? "large"} options={opts(["small", "medium", "large", "full"] as const)} onChange={(value) => update({ heroContentWidth: value })} ariaLabel="Hero content width" /></InspectorFieldRow>
      <InspectorFieldRow label="Media placement"><InspectorPillGroup value={block.heroMediaPlacement ?? "none"} options={opts(["none", "right", "left", "background"] as const)} onChange={(value) => update({ heroMediaPlacement: value })} ariaLabel="Hero media placement" /></InspectorFieldRow>
      <InspectorFieldRow label="Media ratio"><InspectorSelect value={block.heroMediaRatio ?? "natural"} options={opts(["natural", "square", "4:3", "3:2", "16:9", "portrait"] as const)} onChange={(value) => update({ heroMediaRatio: value })} ariaLabel="Hero media ratio" /></InspectorFieldRow>
      <InspectorFieldRow label="Media fit"><InspectorPillGroup value={block.heroMediaFit ?? "cover"} options={opts(["contain", "cover"] as const)} onChange={(value) => update({ heroMediaFit: value })} ariaLabel="Hero media fit" /></InspectorFieldRow>
      <InspectorFieldRow label="Hero height"><InspectorSelect value={block.heroHeight ?? "auto"} options={opts(["auto", "small", "medium", "large", "viewport"] as const)} onChange={(value) => update({ heroHeight: value })} ariaLabel="Hero height" /></InspectorFieldRow>
    </InspectorSection>
    <InspectorSection title="Presentation">
      <InspectorFieldRow label="Heading element"><InspectorSelect value={block.heroHeadingElement ?? "h2"} options={opts(["h1", "h2", "h3", "h4", "h5", "h6"] as const)} onChange={(value) => update({ heroHeadingElement: value })} ariaLabel="Hero heading element" /></InspectorFieldRow>
      <InspectorFieldRow label="Heading style"><InspectorSelect value={block.heroHeadingStyle ?? "xlarge"} options={opts(["inherit", "h1", "h2", "h3", "article-title", "small", "medium", "large", "xlarge"] as const)} onChange={(value) => update({ heroHeadingStyle: value })} ariaLabel="Hero heading style" /></InspectorFieldRow>
    </InspectorSection>
    <InspectorSection title="Actions">
      <ActionPresentationFields label="Primary action" prefix="primary" block={block} update={update} />
      <ActionPresentationFields label="Secondary action" prefix="secondary" block={block} update={update} />
    </InspectorSection>
  </div>;
  if (tab === "behavior") return <div className="builder-inspector-stack" data-uikit-capability="hero-behavior">
    <InspectorSection title="Behavior"><InspectorFieldRow label="Primary action"><InspectorSwitch checked={block.heroPrimaryActionVisible !== false} onChange={(checked) => update({ heroPrimaryActionVisible: checked })} label="Show primary action" /></InspectorFieldRow><InspectorFieldRow label="Secondary action"><InspectorSwitch checked={block.heroSecondaryActionVisible !== false} onChange={(checked) => update({ heroSecondaryActionVisible: checked })} label="Show secondary action" /></InspectorFieldRow><InspectorFieldRow label="Media loading"><InspectorPillGroup value={block.heroMediaLoading ?? "lazy"} options={opts(["lazy", "eager"] as const)} onChange={(value) => update({ heroMediaLoading: value })} ariaLabel="Hero media loading" /></InspectorFieldRow></InspectorSection>
  </div>;
  return <div className="builder-inspector-stack" data-uikit-capability="hero-advanced"><InspectorSection title="Advanced"><InspectorFieldRow label="Inverse text"><InspectorSwitch checked={block.heroInverse === true} onChange={(checked) => update({ heroInverse: checked })} label="Use inverse text" /></InspectorFieldRow><p className="inspector-help-text">Global Styles remain authoritative for colors, radius, borders, and shadows.</p></InspectorSection></div>;
}

type GridItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];

export function GridCapabilityPanel({ block, tab, update }: Props) {
  const items = block.gridItems ?? [];
  const copySequenceRef = useRef(0);
  const updateItems = (next: GridItem[]) => update({ gridItems: next });
  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex || sourceIndex >= items.length || targetIndex >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    updateItems(next);
  };

  const removeItem = (index: number) => updateItems(items.filter((_, itemIndex) => itemIndex !== index));

  const copyItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    let id = "";
    do {
      copySequenceRef.current += 1;
      id = `grid-item-copy-${copySequenceRef.current}`;
    } while (items.some((item) => item.id === id));
    const copy = { ...source, id, title: source.title ? `${source.title} Copy` : "Copy of item" };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    updateItems(next);
    return id;
  };

  if (tab === "content") return (
    <div className="builder-inspector-stack" data-uikit-capability="grid-content">
      <InspectorSection title="Grid content" description="Manage the collection and each item’s content.">
        <InspectorFieldRow label="Source"><InspectorPillGroup value={block.gridSource ?? "static"} options={opts(["static", "products"] as const)} onChange={(value) => update({ gridSource: value })} ariaLabel="Grid source" /></InspectorFieldRow>
        <InspectorFieldRow label="Show image"><InspectorSwitch checked={block.gridShowImage !== false} onChange={(checked) => update({ gridShowImage: checked })} label="Show image" /></InspectorFieldRow>
        <InspectorFieldRow label="Show eyebrow"><InspectorSwitch checked={block.gridShowEyebrow !== false} onChange={(checked) => update({ gridShowEyebrow: checked })} label="Show eyebrow" /></InspectorFieldRow>
        <InspectorFieldRow label="Show meta"><InspectorSwitch checked={block.gridShowMeta !== false} onChange={(checked) => update({ gridShowMeta: checked })} label="Show meta" /></InspectorFieldRow>
        <InspectorFieldRow label="Show body"><InspectorSwitch checked={block.gridShowText !== false} onChange={(checked) => update({ gridShowText: checked })} label="Show body" /></InspectorFieldRow>
        <InspectorFieldRow label="Show actions"><InspectorSwitch checked={block.gridShowButton === true} onChange={(checked) => update({ gridShowButton: checked })} label="Show actions" /></InspectorFieldRow>
      </InspectorSection>
      <InspectorSection title="Items" description={`${items.length} items`}>
        <RepeatableItemShell
          items={items}
          getItemKey={(item, index) => item.id ?? index}
          itemLabel="Item"
          itemDataAttribute="data-grid-item-id"
          addPosition="before"
          getItemSummary={(item) => item.title || "Untitled item"}
          onAdd={() => {
            const id = `grid-item-${Date.now().toString(36)}`;
            updateItems([...items, { id, title: `Grid item ${items.length + 1}`, text: "Edit this item.", buttonLabel: "Learn more", buttonUrl: "/" }]);
            return id;
          }}
          onCopy={copyItem}
          onDelete={removeItem}
          onReorder={reorderItems}
          renderItem={(item, index) => <>
            <InspectorFieldRow label="Image"><InspectorTextField value={item.imageUrl ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, imageUrl: value } : entry))} ariaLabel={`Grid item ${index + 1} image`} /></InspectorFieldRow>
            <InspectorFieldRow label="Alt text"><InspectorTextField value={item.imageAlt ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, imageAlt: value } : entry))} ariaLabel={`Grid item ${index + 1} alt`} /></InspectorFieldRow>
            <InspectorFieldRow label="Eyebrow"><InspectorTextField value={item.eyebrow ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, eyebrow: value } : entry))} ariaLabel={`Grid item ${index + 1} eyebrow`} /></InspectorFieldRow>
            <InspectorFieldRow label="Title"><InspectorTextField value={item.title ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: value } : entry))} ariaLabel={`Grid item ${index + 1} title`} /></InspectorFieldRow>
            <InspectorFieldRow label="Meta"><InspectorTextField value={item.meta ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, meta: value } : entry))} ariaLabel={`Grid item ${index + 1} meta`} /></InspectorFieldRow>
            <InspectorFieldRow label="Body"><InspectorTextarea value={item.text ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: value } : entry))} ariaLabel={`Grid item ${index + 1} body`} /></InspectorFieldRow>
            <InspectorFieldRow label="Icon">
              <IconPicker
                value={item.iconName}
                onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, iconName: value } : entry))}
                onClear={() => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, iconName: undefined } : entry))}
                ariaLabel={`Grid item ${index + 1} icon`}
              />
            </InspectorFieldRow>
            <InspectorFieldRow label="Icon size"><InspectorSelect value={String(item.iconSize ?? 20)} options={[12, 14, 16, 20, 24, 28, 32].map((value) => ({ value: String(value), label: `${value}px` }))} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, iconSize: Number(value) } : entry))} ariaLabel={`Grid item ${index + 1} icon size`} /></InspectorFieldRow>
            <InspectorFieldRow label="Action label"><InspectorTextField value={item.buttonLabel ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, buttonLabel: value } : entry))} ariaLabel={`Grid item ${index + 1} action label`} /></InspectorFieldRow>
            <InspectorFieldRow label="Action URL"><InspectorTextField value={item.buttonUrl ?? ""} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, buttonUrl: value } : entry))} ariaLabel={`Grid item ${index + 1} action URL`} /></InspectorFieldRow>
            <InspectorFieldRow label="Action target"><InspectorSelect value={item.buttonTarget ?? "_self"} options={targets} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, buttonTarget: value } : entry))} ariaLabel={`Grid item ${index + 1} action target`} /></InspectorFieldRow>
            <InspectorFieldRow label="Media placement"><InspectorPillGroup value={item.mediaPlacement ?? "top"} options={opts(["top", "left", "right"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, mediaPlacement: value } : entry))} ariaLabel={`Grid item ${index + 1} media placement`} /></InspectorFieldRow>
            <InspectorFieldRow label="Media ratio"><InspectorSelect value={item.mediaRatio ?? "natural"} options={opts(["natural", "square", "4:3", "3:2", "16:9", "portrait"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, mediaRatio: value } : entry))} ariaLabel={`Grid item ${index + 1} media ratio`} /></InspectorFieldRow>
            <InspectorFieldRow label="Media fit"><InspectorPillGroup value={item.mediaFit ?? "cover"} options={opts(["cover", "contain"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, mediaFit: value } : entry))} ariaLabel={`Grid item ${index + 1} media fit`} /></InspectorFieldRow>
            <InspectorFieldRow label="Text alignment"><InspectorPillGroup value={item.textAlign ?? "left"} options={opts(["left", "center", "right"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, textAlign: value } : entry))} ariaLabel={`Grid item ${index + 1} text alignment`} /></InspectorFieldRow>
            <InspectorFieldRow label="Title element"><InspectorSelect value={item.titleElement ?? "h3"} options={opts(["h2", "h3", "h4", "div"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, titleElement: value } : entry))} ariaLabel={`Grid item ${index + 1} title element`} /></InspectorFieldRow>
            <InspectorFieldRow label="Title style"><InspectorSelect value={item.titleStyle ?? "inherit"} options={opts(["inherit", "h3", "h4", "h5"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, titleStyle: value } : entry))} ariaLabel={`Grid item ${index + 1} title style`} /></InspectorFieldRow>
            <InspectorFieldRow label="Action style"><InspectorPillGroup value={item.actionStyle ?? "primary"} options={opts(["default", "primary", "secondary", "text"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, actionStyle: value } : entry))} ariaLabel={`Grid item ${index + 1} action style`} /></InspectorFieldRow>
            <InspectorFieldRow label="Action size"><InspectorPillGroup value={item.actionSize ?? "default"} options={opts(["small", "default", "large"] as const)} onChange={(value) => updateItems(items.map((entry, itemIndex) => itemIndex === index ? { ...entry, actionSize: value } : entry))} ariaLabel={`Grid item ${index + 1} action size`} /></InspectorFieldRow>
          </>}
        />
      </InspectorSection>
    </div>
  );
  if (tab === "style") return <div className="builder-inspector-stack" data-uikit-capability="grid-style"><InspectorSection title="Grid layout"><InspectorFieldRow label="Columns"><InspectorSelect value={String(block.columns ?? 3)} options={[1, 2, 3, 4, 5, 6].map((value) => ({ value: String(value), label: String(value) }))} onChange={(value) => update({ columns: Number(value) })} ariaLabel="Grid columns" /></InspectorFieldRow><InspectorFieldRow label="Gutter"><InspectorPillGroup value={block.gridGap ?? "medium"} options={opts(["none", "small", "medium", "large", "max"] as const)} onChange={(value) => update({ gridGap: value })} ariaLabel="Grid gutter" /></InspectorFieldRow><InspectorFieldRow label="Row gap"><InspectorPillGroup value={block.gridRowGap ?? block.gridGap ?? "medium"} options={opts(["none", "small", "medium", "large"] as const)} onChange={(value) => update({ gridRowGap: value })} ariaLabel="Grid row gap" /></InspectorFieldRow><InspectorFieldRow label="Rows"><InspectorSelect value={String(block.gridRows ?? 1)} options={[1, 2, 3, 4, 5, 6].map((value) => ({ value: String(value), label: String(value) }))} onChange={(value) => update({ gridRows: Number(value) })} ariaLabel="Grid rows" /></InspectorFieldRow><InspectorFieldRow label="Stacking"><InspectorPillGroup value={block.gridStacking ?? "inherit"} options={opts(["inherit", "stack"] as const)} onChange={(value) => update({ gridStacking: value })} ariaLabel="Grid stacking" /></InspectorFieldRow></InspectorSection><InspectorSection title="Default card mapping"><InspectorFieldRow label="Item renderer"><InspectorPillGroup value={block.gridItemRenderer ?? "plain"} options={opts(["plain", "card"] as const)} onChange={(value) => update({ gridItemRenderer: value })} ariaLabel="Grid item renderer" /></InspectorFieldRow>{block.gridItemRenderer === "card" && <><InspectorFieldRow label="Card variant"><InspectorPillGroup value={block.gridCardVariant ?? "default"} options={opts(["default", "primary", "secondary", "blank"] as const)} onChange={(value) => update({ gridCardVariant: value })} ariaLabel="Grid card variant" /></InspectorFieldRow><InspectorFieldRow label="Card size"><InspectorPillGroup value={block.gridCardSize ?? "default"} options={opts(["small", "default", "large"] as const)} onChange={(value) => update({ gridCardSize: value })} ariaLabel="Grid card size" /></InspectorFieldRow><InspectorFieldRow label="Card hover"><InspectorSwitch checked={block.gridCardHover === true} onChange={(checked) => update({ gridCardHover: checked })} label="Enable card hover" /></InspectorFieldRow></>}</InspectorSection><InspectorSection title="Default action mapping" description="Applies to every Grid action unless an item override is set."><InspectorFieldRow label="Button variant"><InspectorPillGroup value={block.buttonStyle ?? "primary"} options={opts(UIKIT_BUTTON_CAPABILITY.properties.variant.values)} onChange={(value) => update({ buttonStyle: value })} ariaLabel="Grid button variant" /></InspectorFieldRow><InspectorFieldRow label="Button size"><InspectorPillGroup value={block.size ?? "default"} options={opts(UIKIT_BUTTON_CAPABILITY.properties.size.values)} onChange={(value) => update({ size: value })} ariaLabel="Grid button size" /></InspectorFieldRow></InspectorSection></div>;
  if (tab === "behavior") return <div className="builder-inspector-stack" data-uikit-capability="grid-behavior"><InspectorSection title="Behavior"><InspectorFieldRow label="Item actions"><InspectorSwitch checked={block.gridShowButton === true} onChange={(checked) => update({ gridShowButton: checked })} label="Show item actions" /></InspectorFieldRow></InspectorSection></div>;
  return <div className="builder-inspector-stack" data-uikit-capability="grid-advanced"><InspectorSection title="Advanced"><p className="inspector-help-text">Global Styles and the shared Card adapter remain authoritative for visual tokens.</p></InspectorSection></div>;
}
