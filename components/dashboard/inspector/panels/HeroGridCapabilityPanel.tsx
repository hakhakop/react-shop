"use client";

import { useRef, useState } from "react";
import type {
  BuilderLayoutBlock,
  InspectorTab,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { UIKIT_BUTTON_CAPABILITY } from "@/lib/uikitCapabilities";
import { BUILDER_LINK_TARGET_OPTIONS } from "@/lib/websiteBuilderLinks";
import IconPicker from "@/components/dashboard/inspector/IconPicker";
import RepeatableItemShell from "@/components/dashboard/inspector/RepeatableItemShell";
import { BuilderImageUrlControl } from "@/components/dashboard/inspector/panels/InspectorSharedControls";
import {
  TitleSettingsGroup,
  MetaSettingsGroup,
  ContentSettingsGroup,
  LinkSettingsGroup,
  CardSettingsGroup,
  MediaSettingsGroup,
  ActionSettingsGroup,
} from "@/components/dashboard/inspector/panels/SharedSettingGroups";
import TypographyRoleSettingsPanel from "@/components/dashboard/inspector/panels/TypographyRoleSettingsPanel";
import ButtonPresentationFields from "@/components/dashboard/inspector/panels/ButtonPresentationFields";
import {
  InspectorFieldRow,
  InspectorPillGroup,
  InspectorSection,
  InspectorSelect,
  InspectorSwitch,
  InspectorTextField,
  InspectorTextarea,
  InspectorDivision,
  InspectorAlignmentControl,
  InspectorMediaPlacementControl,
  InspectorSegmentedControl,
} from "@/components/dashboard/inspector/InspectorControls";

type Props = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: any) => void;
  openWordPressMediaPicker?: (options: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => void;
};
const opts = <T extends string>(values: readonly T[]) =>
  values.map((value) => ({
    value,
    label: value.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
  }));
const gridActionStyleOptions = [
  { value: "inherit", label: "Inherit" },
  ...opts(UIKIT_BUTTON_CAPABILITY.properties.variant.values),
];
const gridActionSizeOptions = [
  { value: "inherit", label: "Inherit" },
  ...opts(UIKIT_BUTTON_CAPABILITY.properties.size.values),
];

function ActionFields({
  label,
  prefix,
  block,
  update,
}: {
  label: string;
  prefix: "primary" | "secondary";
  block: BuilderLayoutBlock;
  update: Props["update"];
}) {
  const labelKey =
    prefix === "primary" ? "buttonLabel" : "secondaryButtonLabel";
  const urlKey = prefix === "primary" ? "buttonUrl" : "secondaryButtonUrl";
  const targetKey =
    prefix === "primary" ? "buttonTarget" : "secondaryButtonTarget";
  const styleKey =
    prefix === "primary" ? "buttonStyle" : "secondaryButtonStyle";
  const sizeKey = prefix === "primary" ? "size" : "secondaryButtonSize";
  const values = block as any;
  return (
    <InspectorSection title={label}>
      <InspectorFieldRow label="Label">
        <InspectorTextField
          value={String(values[labelKey] ?? "")}
          onChange={(value) => update({ [labelKey]: value })}
          ariaLabel={`${label} label`}
        />
      </InspectorFieldRow>
      <InspectorFieldRow label="URL">
        <InspectorTextField
          value={String(values[urlKey] ?? "")}
          onChange={(value) => update({ [urlKey]: value })}
          ariaLabel={`${label} URL`}
        />
      </InspectorFieldRow>
      <InspectorFieldRow label="Target">
        <InspectorSelect
          value={String(values[targetKey] ?? "_self")}
          options={BUILDER_LINK_TARGET_OPTIONS}
          onChange={(value) => update({ [targetKey]: value })}
          ariaLabel={`${label} target`}
        />
      </InspectorFieldRow>
    </InspectorSection>
  );
}

function ActionPresentationFields({
  label,
  prefix,
  block,
  update,
}: {
  label: string;
  prefix: "primary" | "secondary";
  block: BuilderLayoutBlock;
  update: Props["update"];
}) {
  const values = block as any;
  const styleKey =
    prefix === "primary" ? "buttonStyle" : "secondaryButtonStyle";
  const sizeKey = prefix === "primary" ? "size" : "secondaryButtonSize";
  return <ButtonPresentationFields
    title={label}
    variant={String(values[styleKey] ?? (prefix === "primary" ? "primary" : "secondary"))}
    size={String(values[sizeKey] ?? "default")}
    onVariantChange={(value) => update({ [styleKey]: value })}
    onSizeChange={(value) => update({ [sizeKey]: value })}
  />;
}

export function HeroCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  if (tab === "content")
    return (
      <div
        className="builder-inspector-stack"
        data-uikit-capability="hero-content"
      >
        <InspectorSection
          title="Hero content"
          description="Edit the content and actions for this hero instance."
        >
          <InspectorFieldRow label="Eyebrow">
            <InspectorTextField
              value={block.eyebrow ?? ""}
              onChange={(value) => update({ eyebrow: value })}
              ariaLabel="Hero eyebrow"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Heading">
            <InspectorTextField
              value={block.title ?? ""}
              onChange={(value) => update({ title: value })}
              ariaLabel="Hero heading"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Body">
            <InspectorTextarea
              value={block.body ?? ""}
              onChange={(value) => update({ body: value })}
              ariaLabel="Hero body"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Media source">
            <BuilderImageUrlControl
              value={block.imageUrl ?? ""}
              onChange={(event) => update({ imageUrl: event.target.value })}
              onChoose={() =>
                openWordPressMediaPicker?.({
                  title: "Hero media",
                  currentUrl: block.imageUrl,
                  onSelect: (media) =>
                    update({
                      imageUrl: media.sourceUrl,
                      imageAlt:
                        block.imageAlt || media.altText || media.title || "",
                    }),
                })
              }
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Media alt">
            <InspectorTextField
              value={block.imageAlt ?? ""}
              onChange={(value) => update({ imageAlt: value })}
              ariaLabel="Hero media alt"
            />
          </InspectorFieldRow>
        </InspectorSection>
        <ActionFields
          label="Primary action"
          prefix="primary"
          block={block}
          update={update}
        />
        <ActionFields
          label="Secondary action"
          prefix="secondary"
          block={block}
          update={update}
        />
      </div>
    );
  if (tab === "style")
    return (
      <div
        className="builder-inspector-stack"
        data-uikit-capability="hero-style"
      >
        <TypographyRoleSettingsPanel
          block={block}
          fields={[
            { field: "titleTypographyRole", label: "Heading role" },
            { field: "contentTypographyRole", label: "Content role" },
            { field: "metaTypographyRole", label: "Eyebrow role" },
          ]}
          update={update}
        />
        <InspectorSection title="Layout">
          <InspectorFieldRow label="Content alignment">
            <InspectorAlignmentControl
              value={block.heroContentAlign ?? block.elementAlign ?? "left"}
              options={["left", "center", "right"] as const}
              onChange={(value) =>
                update({ heroContentAlign: value, elementAlign: value })
              }
              ariaLabel="Hero content alignment"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Vertical alignment">
            <InspectorPillGroup
              value={block.heroVerticalAlign ?? "center"}
              options={opts(["top", "center", "bottom"] as const)}
              onChange={(value) => update({ heroVerticalAlign: value })}
              ariaLabel="Hero vertical alignment"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Content width">
            <InspectorSelect
              value={block.heroContentWidth ?? "large"}
              options={opts(["small", "medium", "large", "full"] as const)}
              onChange={(value) => update({ heroContentWidth: value })}
              ariaLabel="Hero content width"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Media placement">
            <InspectorPillGroup
              value={block.heroMediaPlacement ?? "none"}
              options={opts(["none", "right", "left", "background"] as const)}
              onChange={(value) => update({ heroMediaPlacement: value })}
              ariaLabel="Hero media placement"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Media ratio">
            <InspectorSelect
              value={block.heroMediaRatio ?? "natural"}
              options={opts([
                "natural",
                "square",
                "4:3",
                "3:2",
                "16:9",
                "portrait",
              ] as const)}
              onChange={(value) => update({ heroMediaRatio: value })}
              ariaLabel="Hero media ratio"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Media fit">
            <InspectorPillGroup
              value={block.heroMediaFit ?? "cover"}
              options={opts(["contain", "cover"] as const)}
              onChange={(value) => update({ heroMediaFit: value })}
              ariaLabel="Hero media fit"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Hero height">
            <InspectorSelect
              value={block.heroHeight ?? "auto"}
              options={opts([
                "auto",
                "small",
                "medium",
                "large",
                "viewport",
              ] as const)}
              onChange={(value) => update({ heroHeight: value })}
              ariaLabel="Hero height"
            />
          </InspectorFieldRow>
        </InspectorSection>
        <InspectorSection title="Presentation">
          <InspectorFieldRow label="Heading element">
            <InspectorSelect
              value={block.heroHeadingElement ?? "h2"}
              options={opts(["h1", "h2", "h3", "h4", "h5", "h6"] as const)}
              onChange={(value) => update({ heroHeadingElement: value })}
              ariaLabel="Hero heading element"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Heading style">
            <InspectorSelect
              value={block.heroHeadingStyle ?? "xlarge"}
              options={opts([
                "inherit",
                "h1",
                "h2",
                "h3",
                "article-title",
                "small",
                "medium",
                "large",
                "xlarge",
              ] as const)}
              onChange={(value) => update({ heroHeadingStyle: value })}
              ariaLabel="Hero heading style"
            />
          </InspectorFieldRow>
        </InspectorSection>
        <InspectorSection title="Actions">
          <ActionPresentationFields
            label="Primary action"
            prefix="primary"
            block={block}
            update={update}
          />
          <ActionPresentationFields
            label="Secondary action"
            prefix="secondary"
            block={block}
            update={update}
          />
        </InspectorSection>
      </div>
    );
  if (tab === "behavior")
    return (
      <div
        className="builder-inspector-stack"
        data-uikit-capability="hero-behavior"
      >
        <InspectorSection title="Behavior">
          <InspectorFieldRow label="Primary action">
            <InspectorSwitch
              checked={block.heroPrimaryActionVisible !== false}
              onChange={(checked) =>
                update({ heroPrimaryActionVisible: checked })
              }
              label="Show primary action"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Secondary action">
            <InspectorSwitch
              checked={block.heroSecondaryActionVisible !== false}
              onChange={(checked) =>
                update({ heroSecondaryActionVisible: checked })
              }
              label="Show secondary action"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Media loading">
            <InspectorPillGroup
              value={block.heroMediaLoading ?? "lazy"}
              options={opts(["lazy", "eager"] as const)}
              onChange={(value) => update({ heroMediaLoading: value })}
              ariaLabel="Hero media loading"
            />
          </InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  return (
    <div
      className="builder-inspector-stack"
      data-uikit-capability="hero-advanced"
    >
      <InspectorSection title="Advanced">
        <InspectorFieldRow label="Inverse text">
          <InspectorSwitch
            checked={block.heroInverse === true}
            onChange={(checked) => update({ heroInverse: checked })}
            label="Use inverse text"
          />
        </InspectorFieldRow>
      </InspectorSection>
    </div>
  );
}

type GridItem = NonNullable<BuilderLayoutBlock["gridItems"]>[number];

export function GridCapabilityPanel({
  block,
  tab,
  shellSettings,
  update,
  openWordPressMediaPicker,
}: Props) {
  const items = block.gridItems ?? [];
  const [activeItemTabs, setActiveItemTabs] = useState<Record<string, "content" | "settings">>({});
  const copySequenceRef = useRef(0);
  const updateItems = (next: GridItem[]) => update({ gridItems: next });
  const reorderItems = (sourceIndex: number, targetIndex: number) => {
    if (
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex === targetIndex ||
      sourceIndex >= items.length ||
      targetIndex >= items.length
    )
      return;
    const next = [...items];
    const [moved] = next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, moved);
    updateItems(next);
  };

  const removeItem = (index: number) =>
    updateItems(items.filter((_, itemIndex) => itemIndex !== index));

  const copyItem = (index: number) => {
    const source = items[index];
    if (!source) return;
    let id = "";
    do {
      copySequenceRef.current += 1;
      id = `grid-item-copy-${copySequenceRef.current}`;
    } while (items.some((item) => item.id === id));
    const copy = {
      ...source,
      id,
      title: source.title ? `${source.title} Copy` : "Copy of item",
    };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    updateItems(next);
    return id;
  };

  const updateItemActionStyle = (index: number, value: string) => {
    updateItems(
      items.map((entry, itemIndex) => {
        if (itemIndex !== index) return entry;
        const next = { ...entry };
        if (value === "inherit") {
          delete next.actionStyle;
          delete next.buttonStyle;
        } else if (value === "link") {
          delete next.actionStyle;
          next.buttonStyle = "link";
        } else {
          next.actionStyle = value as GridItem["actionStyle"];
          delete next.buttonStyle;
        }
        return next;
      }),
    );
  };

  const updateItemActionSize = (index: number, value: string) => {
    updateItems(
      items.map((entry, itemIndex) => {
        if (itemIndex !== index) return entry;
        const next = { ...entry };
        if (value === "inherit") delete next.actionSize;
        else next.actionSize = value as GridItem["actionSize"];
        return next;
      }),
    );
  };

  if (tab === "content")
    return (
      <div
        className="builder-inspector-stack"
        data-uikit-capability="grid-content"
      >
        <InspectorSection
          title="Content Source"
        >
          <InspectorFieldRow label="Source">
            <InspectorPillGroup
              value={block.gridSource ?? "static"}
              options={opts(["static", "products"] as const)}
              onChange={(value) => update({ gridSource: value })}
              ariaLabel="Grid source"
            />
          </InspectorFieldRow>
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
              updateItems([
                ...items,
                {
                  id,
                  title: `Grid item ${items.length + 1}`,
                  text: "Edit this item.",
                  buttonLabel: "Learn more",
                  buttonUrl: "/",
                },
              ]);
              return id;
            }}
            onCopy={copyItem}
            onDelete={removeItem}
            onReorder={reorderItems}
            renderItem={(item, index) => {
              const activeTab = item.id ? (activeItemTabs[item.id] ?? "content") : "content";
              return (
              <>
                <InspectorFieldRow>
                  <InspectorPillGroup
                    value={activeTab}
                    options={opts(["content", "settings"] as const)}
                    onChange={(value) => {
                      if (item.id) {
                        setActiveItemTabs((prev) => ({
                          ...prev,
                          [item.id as string]: value as "content" | "settings",
                        }));
                      }
                    }}
                    ariaLabel={`Grid item ${index + 1} tab`}
                  />
                </InspectorFieldRow>

                {activeTab === "content" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    <InspectorFieldRow label="Image">
                      <BuilderImageUrlControl
                        value={item.imageUrl ?? ""}
                        onChange={(event) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, imageUrl: event.target.value }
                                : entry,
                            ),
                          )
                        }
                        onChoose={() =>
                          openWordPressMediaPicker?.({
                            title: `Grid item ${index + 1} image`,
                            currentUrl: item.imageUrl,
                            onSelect: (media) =>
                              updateItems(
                                items.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? {
                                        ...entry,
                                        imageUrl: media.sourceUrl,
                                        imageAlt:
                                          entry.imageAlt ||
                                          media.altText ||
                                          media.title ||
                                          "",
                                      }
                                    : entry,
                                ),
                              ),
                          })
                        }
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Alt text">
                      <InspectorTextField
                        value={item.imageAlt ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, imageAlt: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} alt`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Eyebrow">
                      <InspectorTextField
                        value={item.eyebrow ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, eyebrow: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} eyebrow`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Title">
                      <InspectorTextField
                        value={item.title ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, title: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} title`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Meta">
                      <InspectorTextField
                        value={item.meta ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, meta: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} meta`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Body">
                      <InspectorTextarea
                        value={item.text ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, text: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} body`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Icon">
                      <IconPicker
                        value={item.iconName}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, iconName: value }
                                : entry,
                            ),
                          )
                        }
                        onClear={() =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, iconName: undefined }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} icon`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Action label">
                      <InspectorTextField
                        value={item.buttonLabel ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, buttonLabel: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} action label`}
                      />
                    </InspectorFieldRow>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "12px" }}>
                    <InspectorFieldRow label="Action URL">
                      <InspectorTextField
                        value={item.buttonUrl ?? ""}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, buttonUrl: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} action URL`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Action target">
                      <InspectorSelect
                        value={item.buttonTarget ?? "_self"}
                        options={BUILDER_LINK_TARGET_OPTIONS}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, buttonTarget: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} action target`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Action style">
                      <InspectorPillGroup
                        value={
                          item.actionStyle ??
                          (item.buttonStyle === "link" ? "link" : "inherit")
                        }
                        options={
                          item.buttonStyle === "link" && !item.actionStyle
                            ? [
                                { value: "inherit", label: "Inherit" },
                                { value: "link", label: "Link" },
                                ...opts(
                                  UIKIT_BUTTON_CAPABILITY.properties.variant.values,
                                ),
                              ]
                            : gridActionStyleOptions
                        }
                        onChange={(value) => updateItemActionStyle(index, value)}
                        ariaLabel={`Grid item ${index + 1} action style`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Action size">
                      <InspectorPillGroup
                        value={item.actionSize ?? "inherit"}
                        options={gridActionSizeOptions}
                        onChange={(value) => updateItemActionSize(index, value)}
                        ariaLabel={`Grid item ${index + 1} action size`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Icon size">
                      <InspectorSelect
                        value={String(item.iconSize ?? 20)}
                        options={[12, 14, 16, 20, 24, 28, 32].map((value) => ({
                          value: String(value),
                          label: `${value}px`,
                        }))}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, iconSize: Number(value) }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} icon size`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Media placement">
                      <InspectorMediaPlacementControl
                        value={item.mediaPlacement ?? "top"}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, mediaPlacement: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} media placement`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Media ratio">
                      <InspectorSelect
                        value={item.mediaRatio ?? "natural"}
                        options={opts([
                          "natural",
                          "square",
                          "4:3",
                          "3:2",
                          "16:9",
                          "portrait",
                        ] as const)}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, mediaRatio: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} media ratio`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Media fit">
                      <InspectorSegmentedControl
                        value={item.mediaFit ?? "cover"}
                        options={[
                          { value: "cover", label: "Cover" },
                          { value: "contain", label: "Contain" },
                        ]}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, mediaFit: value as "cover" | "contain" }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} media fit`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Text alignment">
                      <InspectorAlignmentControl
                        value={item.textAlign ?? "left"}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, textAlign: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} text alignment`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Title element">
                      <InspectorSelect
                        value={item.titleElement ?? "h3"}
                        options={opts(["h2", "h3", "h4", "div"] as const)}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, titleElement: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} title element`}
                      />
                    </InspectorFieldRow>
                    <InspectorFieldRow label="Title style">
                      <InspectorSelect
                        value={item.titleStyle ?? "inherit"}
                        options={opts(["inherit", "h3", "h4", "h5"] as const)}
                        onChange={(value) =>
                          updateItems(
                            items.map((entry, itemIndex) =>
                              itemIndex === index
                                ? { ...entry, titleStyle: value }
                                : entry,
                            ),
                          )
                        }
                        ariaLabel={`Grid item ${index + 1} title style`}
                      />
                    </InspectorFieldRow>
                  </div>
                )}
              </>
              );
            }}
          />
        </InspectorSection>
        <InspectorSection
          title="Field Visibility"
          description="Control which fields are visible across all items."
        >
          <InspectorFieldRow label="Show image">
            <InspectorSwitch
              checked={block.gridShowImage !== false}
              onChange={(checked) => update({ gridShowImage: checked })}
              label="Show image"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show eyebrow">
            <InspectorSwitch
              checked={block.gridShowEyebrow !== false}
              onChange={(checked) => update({ gridShowEyebrow: checked })}
              label="Show eyebrow"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show meta">
            <InspectorSwitch
              checked={block.gridShowMeta !== false}
              onChange={(checked) => update({ gridShowMeta: checked })}
              label="Show meta"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show body">
            <InspectorSwitch
              checked={block.gridShowText !== false}
              onChange={(checked) => update({ gridShowText: checked })}
              label="Show body"
            />
          </InspectorFieldRow>
          <InspectorFieldRow label="Show actions">
            <InspectorSwitch
              checked={block.gridShowButton === true}
              onChange={(checked) => update({ gridShowButton: checked })}
              label="Show actions"
            />
          </InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  if (tab === "style")
    return (
      <div
        className="builder-inspector-stack"
        data-uikit-capability="grid-style"
      >
        {/* GRID DIVISION */}
        <InspectorDivision title="GRID">
          <InspectorFieldRow
            label="Columns"
            isOverridden={block.columns !== undefined}
            inheritedValueText="3"
            onReset={() => update({ columns: undefined })}
          >
            <InspectorSelect
              value={String(block.columns ?? 3)}
              options={[1, 2, 3, 4, 5, 6].map((value) => ({
                value: String(value),
                label: String(value),
              }))}
              onChange={(value) => update({ columns: Number(value) })}
              ariaLabel="Grid columns"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Column Gap"
            isOverridden={block.gridGap !== undefined}
            inheritedValueText="Medium"
            onReset={() => update({ gridGap: undefined })}
          >
            <InspectorPillGroup
              value={block.gridGap ?? "medium"}
              options={opts([
                "none",
                "small",
                "medium",
                "large",
                "max",
              ] as const)}
              onChange={(value) => update({ gridGap: value })}
              ariaLabel="Grid gutter"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Row gap"
            isOverridden={block.gridRowGap !== undefined}
            inheritedValueText="Medium"
            onReset={() => update({ gridRowGap: undefined })}
          >
            <InspectorPillGroup
              value={block.gridRowGap ?? block.gridGap ?? "medium"}
              options={opts(["none", "small", "medium", "large"] as const)}
              onChange={(value) => update({ gridRowGap: value })}
              ariaLabel="Grid row gap"
            />
          </InspectorFieldRow>
          <InspectorFieldRow
            label="Stacking"
            isOverridden={block.gridStacking !== undefined}
            inheritedValueText="Inherit"
            onReset={() => update({ gridStacking: undefined })}
          >
            <InspectorPillGroup
              value={block.gridStacking ?? "inherit"}
              options={opts(["inherit", "stack"] as const)}
              onChange={(value) => update({ gridStacking: value })}
              ariaLabel="Grid stacking"
            />
          </InspectorFieldRow>
        </InspectorDivision>

        {/* MEDIA DIVISION */}
        <MediaSettingsGroup
          block={block}
          update={(patch) => {
            const mappedPatch = { ...patch };
            if (patch.gridShowImage !== undefined) mappedPatch.heroShowMedia = patch.gridShowImage;
            if (patch.imageRatio !== undefined) mappedPatch.heroMediaRatio = patch.imageRatio;
            if (patch.imageFit !== undefined) mappedPatch.heroMediaFit = patch.imageFit;
            
            // Clear item-level overrides so global media settings apply to ALL items cleanly
            if (block.gridItems && block.gridItems.length > 0) {
              mappedPatch.gridItems = block.gridItems.map((item) => ({
                ...item,
                ...(patch.imageRatio !== undefined ? { mediaRatio: undefined } : {}),
                ...(patch.imageFit !== undefined ? { mediaFit: undefined } : {}),
                ...(patch.gridMediaPlacement !== undefined ? { mediaPlacement: undefined } : {}),
              }));
            }
            update(mappedPatch);
          }}
          title="MEDIA"
          keys={{
            showMedia: "gridShowImage",
            placement: "gridMediaPlacement",
            ratio: "imageRatio",
            fit: "imageFit",
            width: "gridMediaWidth",
            align: "gridMediaAlignment",
          }}
        />

        {/* PANEL / CARD PRESENTATION DIVISION */}
        <InspectorDivision title="PANEL">
          <InspectorFieldRow
            label="Item renderer"
            isOverridden={block.gridItemRenderer !== undefined}
            inheritedValueText="Plain"
            onReset={() => update({ gridItemRenderer: undefined })}
          >
            <InspectorPillGroup
              value={block.gridItemRenderer ?? "plain"}
              options={opts(["plain", "card"] as const)}
              onChange={(value) => update({ gridItemRenderer: value })}
              ariaLabel="Grid item renderer"
            />
          </InspectorFieldRow>
          {block.gridItemRenderer === "card" && (
            <CardSettingsGroup
              block={block}
              update={update}
              title="CARD PRESENTATION"
              keys={{
                variant: "gridCardVariant",
                size: "gridCardSize",
                hover: "gridCardHover",
              }}
            />
          )}
        </InspectorDivision>

        {/* TITLE DIVISION */}
        <TitleSettingsGroup
          block={block}
          update={update}
          keys={{
            role: "titleTypographyRole",
            size: "gridTitleSize",
            align: "gridTitleAlign",
            level: "gridTitleLevel",
          }}
        />

        {/* META DIVISION */}
        <MetaSettingsGroup
          block={block}
          update={update}
          keys={{
            role: "metaTypographyRole",
            align: "gridMetaAlign",
            level: "gridMetaHtmlElement",
          }}
        />

        {/* CONTENT DIVISION */}
        <ContentSettingsGroup
          block={block}
          update={update}
          keys={{
            role: "contentTypographyRole",
            align: "gridContentAlign",
          }}
        />

        {/* ACTION BUTTON DIVISION */}
        <ActionSettingsGroup
          block={block}
          update={update}
          title="ACTION BUTTON"
          keys={{
            label: "buttonLabel",
            url: "buttonUrl",
            target: "buttonTarget",
            style: "buttonStyle",
            size: "size",
          }}
        />
      </div>
    );

  if (tab === "behavior")
    return (
      <div
        className="builder-inspector-stack"
        data-uikit-capability="grid-behavior"
      >
        <InspectorSection title="Behavior">
          <InspectorFieldRow label="Item actions">
            <InspectorSwitch
              checked={block.gridShowButton === true}
              onChange={(checked) => update({ gridShowButton: checked })}
              label="Show item actions"
            />
          </InspectorFieldRow>
        </InspectorSection>
      </div>
    );
  return (
    <div
      className="builder-inspector-stack"
      data-uikit-capability="grid-advanced"
    >
      <InspectorSection title="Advanced">
        <p className="inspector-help-text">
          Global Styles and the shared Card adapter remain authoritative for
          visual tokens.
        </p>
      </InspectorSection>
    </div>
  );
}
