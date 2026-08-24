"use client";

import {
  Box,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Columns2,
  Copy,
  FileText,
  Image as ImageIcon,
  Layers3,
  LayoutGrid,
  List,
  MoreHorizontal,
  MousePointerClick,
  Pencil,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  Type,
} from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";
import type {
  BuilderLayoutBlock,
  BuilderLayoutKey,
  BuilderSection,
  LayoutBlockKind,
} from "@/components/dashboard/builderTypes";
import {
  layoutBlockLabels,
  sectionLabels,
} from "@/components/dashboard/builderRegistry";
import {
  getBuilderLayoutRows,
  getBuilderRowLayoutPreset,
  type BuilderLayoutRow,
} from "@/components/dashboard/builderLayoutPresets";
import { layoutColumnHasContent } from "@/lib/builderNestedLayout";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import type { BuilderInteractionTarget } from "@/components/dashboard/builderInteraction";

export type BuilderHoverTarget = BuilderInteractionTarget;

export type BuilderWireframeActions = {
  addSection?: (
    targetSectionId: string | null,
    placement: "above" | "below",
  ) => void;
  addRow?: (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => void;
  addColumnAfter?: (target: { sectionId: string; columnKey: string }) => void;
  deleteColumn?: (target: { sectionId: string; columnKey: string }) => void;
  openElements?: (target: { sectionId: string; columnKey: string }) => void;
  selectSection: (sectionId: string) => void;
  selectRow: (sectionId: string, rowIndex: number) => void;
  selectColumn: (sectionId: string, columnKey: string) => void;
  selectBlock: (sectionId: string, columnKey: string, blockKey: string) => void;
  hover?: (target: BuilderHoverTarget | null) => void;
  renameSection?: (sectionId: string, name: string) => void;
  renameComplete?: () => void;
  moveSection?: (sectionId: string, direction: -1 | 1) => void;
  duplicateSection?: (sectionId: string) => void;
  deleteSection?: (sectionId: string) => void;
  moveRow?: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  duplicateRow?: (sectionId: string, rowIndex: number) => void;
  deleteRow?: (sectionId: string, rowIndex: number) => void;
  moveBlock?: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
    direction: -1 | 1;
  }) => void;
  duplicateBlock?: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
  deleteBlock?: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
};

type Props = {
  page: BuilderLayoutKey;
  pageLabel: string;
  documentKindLabel?: string;
  documentBadgeLabel?: string;
  structureLabel?: string;
  structureAriaLabel?: string;
  sections: BuilderSection[];
  selectedSectionId: string;
  selectedLayoutRowIndex: number | null;
  selectedLayoutColumnKey: string | null;
  selectedLayoutBlockKey: string | null;
  hoveredTarget?: BuilderHoverTarget | null;
  actions: BuilderWireframeActions;
  renameSectionId?: string | null;
};

function getWireframeRows(section: BuilderSection): BuilderLayoutRow[] {
  const normalized = normalizeBuilderSectionLayout(section);
  if (normalized.source === "canonical") {
    return normalized.rows.map((row) => ({
      id: row.id,
      layoutKey: row.layout,
      startIndex: 0,
      items: row.columns.map((column) => ({
        id: column.id,
        rowId: row.id,
        rowLayout: row.layout,
        responsiveWidths: column.responsiveWidths,
        blocks: column.elements,
      })),
    }));
  }
  return getBuilderLayoutRows(section, section.layoutItems ?? []);
}

function wireframeLayout(row: BuilderLayoutRow, fallback: number[]) {
  const mediumWidths = row.items.map(
    (item) =>
      item.responsiveWidths?.medium ??
      item.columnWidthMedium ??
      item.widthMedium ??
      item.width_medium,
  );
  if (
    mediumWidths.length > 1 &&
    mediumWidths.every(
      (width: string | undefined) => width === "1-1" || width === "full",
    )
  ) {
    return { ratios: mediumWidths.map(() => 1), stacked: true };
  }
  return { ratios: fallback, stacked: false };
}

function structureKey(target: BuilderHoverTarget | null | undefined) {
  if (!target) return null;
  if (target.type === "section") return `section:${target.sectionId}`;
  if (target.type === "row")
    return `row:${target.sectionId}:${target.rowIndex}`;
  if (target.type === "column")
    return `column:${target.sectionId}:${target.columnKey}`;
  return `block:${target.sectionId}:${target.columnKey}:${target.blockKey}`;
}

function selectedKey(
  sectionId: string,
  rowIndex: number | null,
  columnKey: string | null,
  blockKey: string | null,
) {
  if (blockKey) return `block:${sectionId}:${columnKey}:${blockKey}`;
  if (columnKey) return `column:${sectionId}:${columnKey}`;
  if (rowIndex !== null) return `row:${sectionId}:${rowIndex}`;
  return sectionId ? `section:${sectionId}` : null;
}

function isDescendant(key: string, target: string | null) {
  return Boolean(target && target.startsWith(`${key}:`));
}

function blockSnippet(block: BuilderLayoutBlock) {
  let name =
    block.title ||
    block.headingText ||
    block.buttonLabel ||
    block.embedUrl ||
    block.fluentFormId ||
    null;
  if (name) {
    if (typeof name !== "string") {
      try {
        name = JSON.stringify(name);
      } catch {
        name = String(name);
      }
    }
    name = name.replace(/<[^>]*>/g, "").trim();
    if (name.length > 28) name = `${name.substring(0, 28)}…`;
  }
  return name;
}

function blockTitle(block: BuilderLayoutBlock, index: number, full = false) {
  const label =
    layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ??
    block.kind ??
    "Element";
  let name =
    block.title ||
    block.headingText ||
    block.buttonLabel ||
    block.embedUrl ||
    block.fluentFormId ||
    null;
  if (name) {
    if (typeof name !== "string") {
      try {
        name = JSON.stringify(name);
      } catch {
        name = String(name);
      }
    }
    name = name.replace(/<[^>]*>/g, "").trim();
    if (!full && name.length > 40) name = `${name.substring(0, 40)}…`;
  }
  return name ? `${label}: ${name}` : `${label} ${index + 1}`;
}

function blockIcon(kind: string) {
  const props = { size: 12, className: "builder-structure-icon-svg" };
  if (kind === "text" || kind === "heading") return <Type {...props} />;
  if (kind === "image" || kind === "productGallery")
    return <ImageIcon {...props} />;
  if (kind === "button" || kind === "productAddToCart")
    return <MousePointerClick {...props} />;
  if (["grid", "badgeGrid", "products"].includes(kind))
    return <LayoutGrid {...props} />;
  if (["slider", "panelSlider", "slideshow", "overlaySlider"].includes(kind))
    return <Sliders {...props} />;
  if (["hero", "productHero", "scrollPinnedDemo"].includes(kind))
    return <Sparkles {...props} />;
  if (kind === "list") return <List {...props} />;
  return <Box {...props} />;
}

function hasDynamicContent(value: Record<string, unknown> | null | undefined) {
  if (!value) return false;
  return Boolean(
    value.dynamicContext ||
      (value.dynamicBindings &&
        typeof value.dynamicBindings === "object" &&
        Object.keys(value.dynamicBindings).length > 0),
  );
}

function blockHasDynamicContent(block: BuilderLayoutBlock) {
  return (
    hasDynamicContent(block as unknown as Record<string, unknown>) ||
    block.gridItems?.some((item) =>
      hasDynamicContent(item as unknown as Record<string, unknown>),
    ) === true ||
    block.slides?.some((slide) =>
      hasDynamicContent(slide as unknown as Record<string, unknown>),
    ) === true ||
    block.listItems?.some((item) =>
      hasDynamicContent(item as unknown as Record<string, unknown>),
    ) === true ||
    block.buttons?.some((btn) =>
      hasDynamicContent(btn as unknown as Record<string, unknown>),
    ) === true ||
    block.badges?.some((badge) =>
      hasDynamicContent(badge as unknown as Record<string, unknown>),
    ) === true
  );
}

function StructureOverflow({
  label = "More actions",
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuWidth = menuEl ? menuEl.offsetWidth : 156;
    const menuHeight = menuEl ? menuEl.offsetHeight : 160;
    const viewportPadding = 8;

    // Check vertical space
    const spaceBelow =
      window.innerHeight - triggerRect.bottom - viewportPadding;
    const spaceAbove = triggerRect.top - viewportPadding;
    const placeAbove = spaceBelow < menuHeight && spaceAbove >= spaceBelow;

    const top = placeAbove
      ? Math.max(viewportPadding, triggerRect.top - menuHeight - 4)
      : Math.min(
          window.innerHeight - menuHeight - viewportPadding,
          triggerRect.bottom + 4,
        );

    // Check horizontal space: align right edge of menu to right edge of trigger
    let left = triggerRect.right - menuWidth;
    if (left < viewportPadding) {
      left = viewportPadding;
    }
    if (left + menuWidth > window.innerWidth - viewportPadding) {
      left = Math.max(
        viewportPadding,
        window.innerWidth - menuWidth - viewportPadding,
      );
    }

    setMenuPosition({ top, left });
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setMenuPosition(null);
      return;
    }

    updatePosition();

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target.closest("button")) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`builder-structure-action-btn builder-wireframe-action-btn${isOpen ? " is-active" : ""}`}
        aria-label={label}
        title={label}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        <MoreHorizontal size={12} />
      </button>

      {isOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              className="builder-structure-portal-menu"
              style={{
                position: "fixed",
                top: menuPosition?.top ?? 0,
                left: menuPosition?.left ?? 0,
                visibility: menuPosition ? "visible" : "hidden",
                zIndex: 99999,
              }}
              onClick={handleMenuClick}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

const WireframeBlock = memo(function WireframeBlock({
  sectionId,
  columnKey,
  block,
  index,
  count,
  selected,
  hovered,
  actions,
}: {
  sectionId: string;
  columnKey: string;
  block: BuilderLayoutBlock;
  index: number;
  count: number;
  selected: boolean;
  hovered: boolean;
  actions: BuilderWireframeActions;
}) {
  const blockKey = block.id ?? `${columnKey}-block-${index}`;
  const blockLabel =
    layoutBlockLabels[(block.kind ?? "text") as LayoutBlockKind] ??
    block.kind ??
    "Element";
  const snippet = blockSnippet(block);
  const isDynamic = blockHasDynamicContent(block);

  return (
    <div
      className={`builder-structure-item builder-structure-item--element builder-wireframe-item builder-wireframe-item--block${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`}
      data-structure-key={`block:${sectionId}:${columnKey}:${blockKey}`}
      onMouseEnter={() =>
        actions.hover?.({ type: "block", sectionId, columnKey, blockKey })
      }
      onMouseLeave={() => actions.hover?.(null)}
      onClick={() => actions.selectBlock(sectionId, columnKey, blockKey)}
      role="treeitem"
      tabIndex={0}
      aria-selected={selected}
    >
      <span className="builder-structure-icon builder-structure-icon--element">
        {blockIcon(block.kind ?? "text")}
      </span>
      <span
        className="builder-structure-label-wrap builder-wireframe-label-wrap"
        title={blockTitle(block, index, true)}
      >
        <strong className="builder-structure-title">{blockLabel}</strong>
        {snippet ? (
          <span className="builder-structure-snippet">{snippet}</span>
        ) : null}
      </span>
      <div className="builder-structure-meta builder-wireframe-meta">
        {isDynamic ? (
          <span
            className="builder-structure-badge builder-structure-badge--dynamic builder-wireframe-badge builder-wireframe-badge--dynamic"
            title="Dynamic content"
            aria-label="Dynamic content"
          >
            <Sparkles size={10} />
          </span>
        ) : null}
        <div className="builder-structure-actions builder-wireframe-actions">
          <StructureOverflow label="Element actions">
            {actions.moveBlock && (
              <button
                type="button"
                className="builder-structure-menu-btn builder-wireframe-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.moveBlock?.({
                    sectionId,
                    columnKey,
                    blockKey,
                    direction: -1,
                  });
                }}
                disabled={index === 0}
                title="Move element up"
              >
                <ChevronUp size={11} /> <span>Move up</span>
              </button>
            )}
            {actions.moveBlock && (
              <button
                type="button"
                className="builder-structure-menu-btn builder-wireframe-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.moveBlock?.({
                    sectionId,
                    columnKey,
                    blockKey,
                    direction: 1,
                  });
                }}
                disabled={index === count - 1}
                title="Move element down"
              >
                <ChevronDown size={11} /> <span>Move down</span>
              </button>
            )}
            {actions.duplicateBlock && (
              <button
                type="button"
                className="builder-structure-menu-btn builder-wireframe-action-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.duplicateBlock?.({ sectionId, columnKey, blockKey });
                }}
                title="Duplicate element"
              >
                <Copy size={11} /> <span>Duplicate</span>
              </button>
            )}
            {actions.deleteBlock && (
              <button
                type="button"
                className="builder-structure-menu-btn builder-structure-menu-btn--danger builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                onClick={(e) => {
                  e.stopPropagation();
                  actions.deleteBlock?.({ sectionId, columnKey, blockKey });
                }}
                title="Delete element"
              >
                <Trash2 size={11} /> <span>Delete</span>
              </button>
            )}
          </StructureOverflow>
        </div>
      </div>
    </div>
  );
});

function columnOwns(
  item: NonNullable<BuilderSection["layoutItems"]>[number],
  key: string | null,
) {
  if (!key) return false;
  return (
    item.id === key ||
    Boolean(
      item.nestedLayout?.rows.some((row) =>
        row.columns.some((column) => column.id === key),
      ),
    )
  );
}

function sameColumn(
  a: Readonly<{
    item: NonNullable<BuilderSection["layoutItems"]>[number];
    index: number;
    flatIndex: number;
    ratio: number;
    totalRatio: number;
    selectedColumnKey: string | null;
    selectedBlockKey: string | null;
    hoveredColumnKey: string | null;
    hoveredBlockKey: string | null;
    collapsed: boolean;
    onToggle: (key: string) => void;
    actions: BuilderWireframeActions;
  }>,
  b: Readonly<{
    item: NonNullable<BuilderSection["layoutItems"]>[number];
    index: number;
    flatIndex: number;
    ratio: number;
    totalRatio: number;
    selectedColumnKey: string | null;
    selectedBlockKey: string | null;
    hoveredColumnKey: string | null;
    hoveredBlockKey: string | null;
    collapsed: boolean;
    onToggle: (key: string) => void;
    actions: BuilderWireframeActions;
  }>,
) {
  const selected = (props: typeof a) =>
    columnOwns(props.item, props.selectedColumnKey)
      ? `${props.selectedColumnKey}:${props.selectedBlockKey ?? ""}`
      : "";
  const hovered = (props: typeof a) =>
    columnOwns(props.item, props.hoveredColumnKey)
      ? `${props.hoveredColumnKey}:${props.hoveredBlockKey ?? ""}`
      : "";
  return (
    a.item === b.item &&
    a.index === b.index &&
    a.flatIndex === b.flatIndex &&
    a.ratio === b.ratio &&
    a.totalRatio === b.totalRatio &&
    a.collapsed === b.collapsed &&
    a.onToggle === b.onToggle &&
    a.actions === b.actions &&
    selected(a) === selected(b) &&
    hovered(a) === hovered(b)
  );
}

const WireframeColumn = memo(
  function WireframeColumn({
    sectionId,
    item,
    index,
    flatIndex,
    ratio,
    totalRatio,
    stacked,
    selectedColumnKey,
    selectedBlockKey,
    hoveredColumnKey,
    hoveredBlockKey,
    collapsed,
    onToggle,
    actions,
  }: {
    sectionId: string;
    item: NonNullable<BuilderSection["layoutItems"]>[number];
    index: number;
    flatIndex: number;
    ratio: number;
    totalRatio: number;
    stacked: boolean;
    selectedColumnKey: string | null;
    selectedBlockKey: string | null;
    hoveredColumnKey: string | null;
    hoveredBlockKey: string | null;
    collapsed: boolean;
    onToggle: (key: string) => void;
    actions: BuilderWireframeActions;
  }) {
    const columnKey = item.id ?? `layout-item-${flatIndex}`;
    const selected = selectedColumnKey === columnKey && !selectedBlockKey;
    const hovered = hoveredColumnKey === columnKey && !hoveredBlockKey;
    const blocks = item.blocks ?? [];
    const pct = stacked
      ? 100
      : totalRatio
        ? Math.round((ratio / totalRatio) * 100)
        : 100;
    const nested = item.nestedLayout;
    const hasChildren = nested ? nested.rows.length > 0 : blocks.length > 0;
    const columnToggleKey = `${sectionId}:${columnKey}`;

    return (
      <div
        className={`builder-structure-branch builder-structure-branch--column builder-wireframe-column${selected ? " is-selected" : ""}`}
      >
        <div
          className={`builder-structure-item builder-structure-item--column builder-wireframe-item builder-wireframe-item--column${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`}
          data-structure-key={`column:${sectionId}:${columnKey}`}
          onMouseEnter={() =>
            actions.hover?.({ type: "column", sectionId, columnKey })
          }
          onMouseLeave={() => actions.hover?.(null)}
          onClick={() => actions.selectColumn(sectionId, columnKey)}
          role="treeitem"
          tabIndex={0}
          aria-selected={selected}
          aria-expanded={hasChildren ? !collapsed : undefined}
        >
          {hasChildren ? (
            <button
              type="button"
              className={`builder-structure-toggle builder-wireframe-toggle${collapsed ? "" : " is-expanded"}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggle(columnToggleKey);
              }}
              aria-label={collapsed ? "Expand column" : "Collapse column"}
            >
              <ChevronRight size={12} />
            </button>
          ) : (
            <span className="builder-structure-toggle-placeholder" />
          )}
          <span className="builder-structure-icon builder-structure-icon--column">
            <Columns2 size={12} />
          </span>
          <span
            className="builder-structure-label-wrap builder-wireframe-label-wrap"
            title={`${item.title || `Column ${index + 1}`} (${pct}%)`}
          >
            <strong className="builder-structure-title">
              {item.title || `Column ${index + 1}`}
            </strong>
          </span>
          <div className="builder-structure-meta builder-wireframe-meta">
            <span
              className="builder-structure-badge builder-structure-badge--column builder-wireframe-badge builder-wireframe-badge--column-pct"
              title={`Column width: ${pct}%`}
            >
              {pct}%
            </span>
            {blocks.length > 0 && (
              <span
                className="builder-structure-badge builder-structure-badge--count builder-wireframe-count"
                title={`${blocks.length} elements`}
              >
                {blocks.length}
              </span>
            )}
            <div className="builder-structure-actions builder-wireframe-actions">
              <StructureOverflow label="Column actions">
                <button
                  type="button"
                  className="builder-structure-menu-btn builder-wireframe-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.selectColumn(sectionId, columnKey);
                  }}
                  title="Edit column settings"
                >
                  <Pencil size={11} /> <span>Edit column</span>
                </button>
                {actions.addColumnAfter && !nested && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-wireframe-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.addColumnAfter?.({ sectionId, columnKey });
                    }}
                    title="Add column after"
                  >
                    <Plus size={11} /> <span>Add column after</span>
                  </button>
                )}
                {actions.deleteColumn && !nested && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-structure-menu-btn--danger builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.deleteColumn?.({ sectionId, columnKey });
                    }}
                    title="Delete column"
                  >
                    <Trash2 size={11} /> <span>Delete column</span>
                  </button>
                )}
              </StructureOverflow>
            </div>
          </div>
        </div>

        {!collapsed && (
          <div className="builder-structure-children builder-structure-children--elements builder-wireframe-children builder-wireframe-children--blocks">
            {nested ? (
              <div className="builder-structure-nested-layout builder-wireframe-nested-layout">
                {nested.rows.map((row, rowIndex) => (
                  <div
                    key={row.id}
                    className="builder-structure-nested-row builder-wireframe-nested-row"
                  >
                    <div className="builder-structure-nested-row-label builder-wireframe-nested-row-label">
                      Nested row {rowIndex + 1}
                    </div>
                    {row.columns.map((column, columnIndex) => (
                      <WireframeColumn
                        key={column.id}
                        sectionId={sectionId}
                        item={
                          column as NonNullable<
                            BuilderSection["layoutItems"]
                          >[number]
                        }
                        index={columnIndex}
                        flatIndex={columnIndex}
                        ratio={1}
                        totalRatio={row.columns.length}
                        stacked={false}
                        selectedColumnKey={selectedColumnKey}
                        selectedBlockKey={selectedBlockKey}
                        hoveredColumnKey={hoveredColumnKey}
                        hoveredBlockKey={hoveredBlockKey}
                        collapsed={false}
                        onToggle={onToggle}
                        actions={actions}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <>
                {blocks.map((block, blockIndex) => {
                  const blockKey =
                    block.id ?? `${columnKey}-block-${blockIndex}`;
                  return (
                    <WireframeBlock
                      key={blockKey}
                      sectionId={sectionId}
                      columnKey={columnKey}
                      block={block}
                      index={blockIndex}
                      count={blocks.length}
                      selected={
                        selectedColumnKey === columnKey &&
                        selectedBlockKey === blockKey
                      }
                      hovered={hoveredBlockKey === `${columnKey}:${blockKey}`}
                      actions={actions}
                    />
                  );
                })}
                {actions.openElements ? (
                  <button
                    type="button"
                    className="builder-structure-add-element-btn builder-structure-empty-target"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.selectColumn(sectionId, columnKey);
                      actions.openElements?.({ sectionId, columnKey });
                    }}
                    title="Add element to this column"
                    aria-label="Add element"
                  >
                    <Plus size={10} />
                    <span className="builder-structure-empty-label">Add Element</span>
                  </button>
                ) : null}
              </>
            )}
          </div>
        )}
      </div>
    );
  },
  (a, b) => sameColumn(a, b) && a.stacked === b.stacked,
);

function sameRow(
  a: Readonly<{
    row: BuilderLayoutRow;
    index: number;
    selected: boolean;
    hovered: boolean;
    selectedColumnKey: string | null;
    selectedBlockKey: string | null;
    hoveredColumnKey: string | null;
    hoveredBlockKey: string | null;
    collapsed: boolean;
    collapsedColumns: Set<string>;
    onToggleRow: (key: string) => void;
    onToggleColumn: (key: string) => void;
    actions: BuilderWireframeActions;
  }>,
  b: Readonly<{
    row: BuilderLayoutRow;
    index: number;
    selected: boolean;
    hovered: boolean;
    selectedColumnKey: string | null;
    selectedBlockKey: string | null;
    hoveredColumnKey: string | null;
    hoveredBlockKey: string | null;
    collapsed: boolean;
    collapsedColumns: Set<string>;
    onToggleRow: (key: string) => void;
    onToggleColumn: (key: string) => void;
    actions: BuilderWireframeActions;
  }>,
) {
  return (
    a.index === b.index &&
    a.collapsed === b.collapsed &&
    a.selected === b.selected &&
    a.hovered === b.hovered &&
    a.selectedColumnKey === b.selectedColumnKey &&
    a.selectedBlockKey === b.selectedBlockKey &&
    a.hoveredColumnKey === b.hoveredColumnKey &&
    a.hoveredBlockKey === b.hoveredBlockKey &&
    a.collapsedColumns === b.collapsedColumns &&
    a.onToggleRow === b.onToggleRow &&
    a.onToggleColumn === b.onToggleColumn &&
    a.actions === b.actions &&
    a.row.id === b.row.id &&
    a.row.layoutKey === b.row.layoutKey &&
    a.row.startIndex === b.row.startIndex &&
    a.row.items.length === b.row.items.length &&
    a.row.items.every((item, index) => item === b.row.items[index])
  );
}

const WireframeRow = memo(function WireframeRow({
  sectionId,
  row,
  index,
  collapsed,
  selected,
  hovered,
  selectedColumnKey,
  selectedBlockKey,
  hoveredColumnKey,
  hoveredBlockKey,
  collapsedColumns,
  onToggleRow,
  onToggleColumn,
  actions,
}: {
  sectionId: string;
  row: BuilderLayoutRow;
  index: number;
  collapsed: boolean;
  selected: boolean;
  hovered: boolean;
  selectedColumnKey: string | null;
  selectedBlockKey: string | null;
  hoveredColumnKey: string | null;
  hoveredBlockKey: string | null;
  collapsedColumns: Set<string>;
  onToggleRow: (key: string) => void;
  onToggleColumn: (key: string) => void;
  actions: BuilderWireframeActions;
}) {
  const rowKey = `${sectionId}:${index}`;
  const preset = getBuilderRowLayoutPreset(row.layoutKey);
  const { ratios, stacked } = wireframeLayout(row, preset.ratios);
  const totalRatio = ratios.reduce((a, b) => a + b, 0);
  const empty = row.items.every(
    (item) =>
      !layoutColumnHasContent(
        item as NonNullable<BuilderSection["layoutItems"]>[number],
      ),
  );
  const count = row.items.length;
  const isMultiColumn = row.items.length > 1;

  const selectedColIndex = row.items.findIndex((item) =>
    columnOwns(
      item as NonNullable<BuilderSection["layoutItems"]>[number],
      selectedColumnKey,
    ),
  );
  const hoveredColIndex = row.items.findIndex((item) =>
    columnOwns(
      item as NonNullable<BuilderSection["layoutItems"]>[number],
      hoveredColumnKey,
    ),
  );

  const [localActiveColumnIndex, setLocalActiveColumnIndex] = useState(0);

  const activeColumnIndex =
    selectedColIndex !== -1
      ? selectedColIndex
      : localActiveColumnIndex < row.items.length
        ? localActiveColumnIndex
        : 0;

  const activeItem = row.items[activeColumnIndex];

  return (
    <div
      className={`builder-structure-branch builder-structure-branch--row builder-wireframe-row${selected ? " is-selected" : ""}`}
    >
      <div
        className={`builder-structure-item builder-structure-item--row builder-wireframe-item builder-wireframe-item--row${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`}
        data-structure-key={`row:${sectionId}:${index}`}
        onMouseEnter={() =>
          actions.hover?.({ type: "row", sectionId, rowIndex: index })
        }
        onMouseLeave={() => actions.hover?.(null)}
        onClick={() => actions.selectRow(sectionId, index)}
        role="treeitem"
        tabIndex={0}
        aria-selected={selected}
        aria-expanded={!collapsed}
      >
        <button
          type="button"
          className={`builder-structure-toggle builder-wireframe-toggle${collapsed ? "" : " is-expanded"}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleRow(rowKey);
          }}
          aria-label={collapsed ? "Expand row" : "Collapse row"}
        >
          <ChevronRight size={12} />
        </button>
        <span className="builder-structure-icon builder-structure-icon--row">
          <LayoutGrid size={12} />
        </span>
        <span className="builder-structure-label-wrap builder-wireframe-label-wrap">
          <strong className="builder-structure-title">Row {index + 1}</strong>
        </span>
        <div className="builder-structure-meta builder-wireframe-meta">
          <span
            className="builder-structure-badge builder-structure-badge--row builder-wireframe-badge builder-wireframe-badge--row"
            title="Row layout preset"
          >
            {stacked ? "Stacked" : preset.label || `${row.items.length} Col`}
          </span>
          <div className="builder-structure-actions builder-wireframe-actions">
            <StructureOverflow label="Row actions">
              {actions.addRow && (
                <button
                  type="button"
                  className="builder-structure-menu-btn builder-wireframe-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.addRow?.(sectionId, index, "before", "1-col");
                  }}
                  title="Add row before"
                >
                  <Plus size={11} /> <span>Add row before</span>
                </button>
              )}
              {actions.addRow && (
                <button
                  type="button"
                  className="builder-structure-menu-btn builder-wireframe-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.addRow?.(sectionId, index, "after", "1-col");
                  }}
                  title="Add row after"
                >
                  <Plus size={11} /> <span>Add row after</span>
                </button>
              )}
              {actions.moveRow && (
                <button
                  type="button"
                  className="builder-structure-menu-btn builder-wireframe-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.moveRow?.(sectionId, index, -1);
                  }}
                  disabled={index === 0}
                  title="Move row up"
                >
                  <ChevronUp size={11} /> <span>Move up</span>
                </button>
              )}
              {actions.moveRow && (
                <button
                  type="button"
                  className="builder-structure-menu-btn builder-wireframe-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.moveRow?.(sectionId, index, 1);
                  }}
                  disabled={index === count - 1}
                  title="Move row down"
                >
                  <ChevronDown size={11} /> <span>Move down</span>
                </button>
              )}
              {actions.duplicateRow && (
                <button
                  type="button"
                  className="builder-structure-menu-btn builder-wireframe-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    actions.duplicateRow?.(sectionId, index);
                  }}
                  title="Duplicate row"
                >
                  <Copy size={11} /> <span>Duplicate row</span>
                </button>
              )}
              {actions.deleteRow && (
                <>
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-structure-menu-btn--danger builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (empty) actions.deleteRow?.(sectionId, index);
                    }}
                    disabled={!empty}
                    title={
                      empty
                        ? "Delete empty row"
                        : "Remove elements before deleting this row"
                    }
                  >
                    <Trash2 size={11} /> <span>Delete row</span>
                  </button>
                  {!empty && (
                    <span className="builder-structure-menu-note builder-wireframe-overflow-reason">
                      Remove elements before deleting this row.
                    </span>
                  )}
                </>
              )}
            </StructureOverflow>
          </div>
        </div>
      </div>

      {!collapsed && (
        <div className="builder-structure-children builder-structure-children--columns builder-wireframe-children builder-wireframe-children--columns">
          {isMultiColumn ? (
            <>
              {/* Sibling columns grouped horizontal summary bar with contextual add column buttons */}
              <div
                className="builder-structure-row-columns-bar"
                role="tablist"
                aria-label={`Row ${index + 1} columns`}
              >
                {row.items.map((item, columnIndex) => {
                  const columnKey =
                    item.id ?? `layout-item-${row.startIndex + columnIndex}`;
                  const isSelected = selectedColIndex === columnIndex;
                  const isHovered = hoveredColIndex === columnIndex;
                  const isActive = activeColumnIndex === columnIndex;
                  const pct = stacked
                    ? 100
                    : totalRatio
                      ? Math.round(
                          ((ratios[columnIndex] ?? 1) / totalRatio) * 100,
                        )
                      : Math.round(100 / row.items.length);
                  const colBlocks = (
                    item as NonNullable<BuilderSection["layoutItems"]>[number]
                  ).blocks;
                  const colBlocksCount = colBlocks?.length ?? 0;
                  const shortColLabel =
                    row.items.length >= 4
                      ? `${columnIndex + 1}`
                      : item.title || `Col ${columnIndex + 1}`;

                  return (
                    <div
                      key={columnKey}
                      className="builder-structure-col-segment-wrapper"
                      style={{
                        flex: `${ratios[columnIndex] ?? 1} ${ratios[columnIndex] ?? 1} 0%`,
                      }}
                    >
                      <button
                        type="button"
                        className={`builder-structure-col-segment${isActive ? " is-active" : ""}${isSelected ? " is-selected" : ""}${isHovered ? " is-hovered" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocalActiveColumnIndex(columnIndex);
                          actions.selectColumn(sectionId, columnKey);
                        }}
                        onMouseEnter={() =>
                          actions.hover?.({
                            type: "column",
                            sectionId,
                            columnKey,
                          })
                        }
                        onMouseLeave={() => actions.hover?.(null)}
                        title={`${item.title || `Column ${columnIndex + 1}`} (${pct}%)`}
                        aria-selected={isActive}
                        role="tab"
                      >
                        <span className="builder-structure-col-segment-label">
                          {shortColLabel}
                        </span>
                        <span className="builder-structure-col-segment-pct">
                          {pct}%
                        </span>
                        {colBlocksCount > 0 && (
                          <span
                            className="builder-structure-col-segment-count"
                            title={`${colBlocksCount} elements`}
                          >
                            {colBlocksCount}
                          </span>
                        )}
                      </button>
                      {actions.addColumnAfter && (
                        <button
                          type="button"
                          className="builder-structure-insert-col-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            actions.addColumnAfter?.({ sectionId, columnKey });
                          }}
                          title={`Add column after ${item.title || `Column ${columnIndex + 1}`}`}
                          aria-label="Add column after"
                        >
                          <Plus size={8} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Active Column Details & Elements */}
              {activeItem && (
                <WireframeColumn
                  key={
                    activeItem.id ??
                    `layout-item-${row.startIndex + activeColumnIndex}`
                  }
                  sectionId={sectionId}
                  item={
                    activeItem as NonNullable<
                      BuilderSection["layoutItems"]
                    >[number]
                  }
                  index={activeColumnIndex}
                  flatIndex={row.startIndex + activeColumnIndex}
                  ratio={ratios[activeColumnIndex] ?? 1}
                  totalRatio={totalRatio}
                  stacked={stacked}
                  selectedColumnKey={selectedColumnKey}
                  selectedBlockKey={selectedBlockKey}
                  hoveredColumnKey={hoveredColumnKey}
                  hoveredBlockKey={hoveredBlockKey}
                  collapsed={false}
                  onToggle={onToggleColumn}
                  actions={actions}
                />
              )}
            </>
          ) : (
            /* 1-Column Row: Show column directly */
            row.items.map((item, columnIndex) => (
              <WireframeColumn
                key={item.id ?? `layout-item-${row.startIndex + columnIndex}`}
                sectionId={sectionId}
                item={
                  item as NonNullable<BuilderSection["layoutItems"]>[number]
                }
                index={columnIndex}
                flatIndex={row.startIndex + columnIndex}
                ratio={ratios[columnIndex] ?? 1}
                totalRatio={totalRatio}
                stacked={stacked}
                selectedColumnKey={selectedColumnKey}
                selectedBlockKey={selectedBlockKey}
                hoveredColumnKey={hoveredColumnKey}
                hoveredBlockKey={hoveredBlockKey}
                collapsed={collapsedColumns.has(
                  `${sectionId}:${item.id ?? `layout-item-${row.startIndex + columnIndex}`}`,
                )}
                onToggle={onToggleColumn}
                actions={actions}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}, sameRow);

function targetRowIndex(
  section: BuilderSection,
  target: BuilderInteractionTarget | null | undefined,
) {
  if (!target || target.sectionId !== section.id) return null;
  if (target.type === "row") return target.rowIndex;
  if (target.type === "section") return null;
  return getWireframeRows(section).findIndex((row) =>
    row.items.some((item) => {
      const column =
        item as NonNullable<BuilderSection["layoutItems"]>[number];
      return (
        column.id === target.columnKey ||
        Boolean(
          column.nestedLayout?.rows.some((nested) =>
            nested.columns.some(
              (nestedColumn) => nestedColumn.id === target.columnKey,
            ),
          ),
        )
      );
    }),
  );
}

const WireframeSection = memo(function WireframeSection({
  section,
  index,
  total,
  collapsed,
  selected,
  hovered,
  hasSelectedDescendant,
  hasHoveredDescendant,
  selectedTarget,
  hoveredTarget,
  editing,
  renameDraft,
  onRenameDraft,
  onStartRename,
  onFinishRename,
  onToggle,
  actions,
  header,
}: {
  section: BuilderSection;
  index: number;
  total: number;
  collapsed: boolean;
  selected: boolean;
  hovered: boolean;
  hasSelectedDescendant: boolean;
  hasHoveredDescendant: boolean;
  selectedTarget: BuilderInteractionTarget | null;
  hoveredTarget: BuilderInteractionTarget | null;
  editing: boolean;
  renameDraft: string;
  onRenameDraft: (value: string) => void;
  onStartRename: (section: BuilderSection) => void;
  onFinishRename: (sectionId: string, commit: boolean) => void;
  onToggle: (sectionId: string) => void;
  actions: BuilderWireframeActions;
  header: boolean;
}) {
  const rows = useMemo(() => getWireframeRows(section), [section]);
  const [collapsedRows, setCollapsedRows] = useState<Set<string>>(
    () => new Set(),
  );
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(
    () => new Set(),
  );
  const selectedRow = targetRowIndex(section, selectedTarget);
  const hoveredRow = targetRowIndex(section, hoveredTarget);

  useEffect(() => {
    if (selectedRow === null) return;
    const key = `${section.id}:${selectedRow}`;
    setCollapsedRows((current) =>
      current.has(key)
        ? new Set([...current].filter((entry) => entry !== key))
        : current,
    );
  }, [section.id, selectedRow]);

  useEffect(() => {
    if (hoveredRow === null) return;
    const key = `${section.id}:${hoveredRow}`;
    setCollapsedRows((current) =>
      current.has(key)
        ? new Set([...current].filter((entry) => entry !== key))
        : current,
    );
  }, [section.id, hoveredRow]);

  const toggleRow = useCallback((key: string) => {
    setCollapsedRows((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleColumn = useCallback((key: string) => {
    setCollapsedColumns((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const sectionName =
    section.name ||
    section.title ||
    sectionLabels[section.kind] ||
    `Section ${index + 1}`;

  return (
    <div
      className={`builder-structure-branch builder-structure-branch--section builder-wireframe-section${selected ? " is-selected" : ""}`}
      data-structure-has-selected-descendant={
        hasSelectedDescendant || undefined
      }
      data-structure-has-hovered-descendant={hasHoveredDescendant || undefined}
    >
      <div
        className={`builder-structure-item builder-structure-item--section builder-wireframe-item builder-wireframe-item--section${selected ? " is-selected" : ""}${hovered ? " is-hovered" : ""}`}
        data-structure-key={`section:${section.id}`}
        onMouseEnter={() =>
          actions.hover?.({ type: "section", sectionId: section.id })
        }
        onMouseLeave={() => actions.hover?.(null)}
        onClick={() => actions.selectSection(section.id)}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onStartRename(section);
        }}
        role="treeitem"
        tabIndex={0}
        aria-selected={selected}
        aria-expanded={!collapsed}
      >
        <button
          type="button"
          className={`builder-structure-toggle builder-wireframe-toggle${collapsed ? "" : " is-expanded"}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(section.id);
          }}
          aria-label={collapsed ? "Expand section" : "Collapse section"}
        >
          <ChevronRight size={13} />
        </button>
        <span className="builder-structure-icon builder-structure-icon--section">
          <Layers3 size={13} />
        </span>
        {editing ? (
          <input
            className="builder-structure-rename-input builder-wireframe-rename-input"
            value={renameDraft}
            onChange={(e) => onRenameDraft(e.target.value)}
            onBlur={() => onFinishRename(section.id, true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onFinishRename(section.id, true);
              if (e.key === "Escape") onFinishRename(section.id, false);
            }}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            aria-label="Section name"
          />
        ) : (
          <span
            className="builder-structure-label-wrap builder-wireframe-label-wrap"
            title={sectionName}
          >
            <strong className="builder-structure-title">{sectionName}</strong>
          </span>
        )}
        <div className="builder-structure-meta builder-wireframe-meta">
          {!section.visible && (
            <em className="builder-structure-tag-hidden builder-wireframe-hidden-tag">
              Hidden
            </em>
          )}
          {!header && (
            <div className="builder-structure-actions builder-wireframe-actions">
              <StructureOverflow label="Section actions">
                {actions.renameSection && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-wireframe-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartRename(section);
                    }}
                    title="Rename section"
                  >
                    <Type size={11} /> <span>Rename</span>
                  </button>
                )}
                {actions.moveSection && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-wireframe-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.moveSection?.(section.id, -1);
                    }}
                    disabled={index === 0}
                    title="Move section up"
                  >
                    <ChevronUp size={11} /> <span>Move up</span>
                  </button>
                )}
                {actions.moveSection && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-wireframe-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.moveSection?.(section.id, 1);
                    }}
                    disabled={index === total - 1}
                    title="Move section down"
                  >
                    <ChevronDown size={11} /> <span>Move down</span>
                  </button>
                )}
                {actions.duplicateSection && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-wireframe-action-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.duplicateSection?.(section.id);
                    }}
                    title="Duplicate section"
                  >
                    <Copy size={11} /> <span>Duplicate</span>
                  </button>
                )}
                {actions.deleteSection && (
                  <button
                    type="button"
                    className="builder-structure-menu-btn builder-structure-menu-btn--danger builder-wireframe-action-btn builder-wireframe-action-btn--danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      actions.deleteSection?.(section.id);
                    }}
                    title="Delete section"
                  >
                    <Trash2 size={11} /> <span>Delete</span>
                  </button>
                )}
              </StructureOverflow>
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="builder-structure-children builder-structure-children--rows builder-wireframe-children">
          {rows.length === 0 ? (
            <div className="builder-structure-empty-slot">
              {actions.addRow ? (
                <button
                  type="button"
                  className="builder-structure-add-element-btn builder-structure-empty-target"
                  onClick={() =>
                    actions.addRow?.(section.id, 0, "after", "1-col")
                  }
                >
                  <Plus size={10} />
                  <span className="builder-structure-empty-label">Add first row</span>
                </button>
              ) : null}
            </div>
          ) : (
            rows.map((row, rowIndex) => {
              const rowSelectedTarget =
                selectedRow === rowIndex ? selectedTarget : null;
              const rowHoveredTarget =
                hoveredRow === rowIndex ? hoveredTarget : null;
              return (
                <div key={row.id} className="builder-structure-row-slot">
                  <WireframeRow
                    sectionId={section.id}
                    row={row}
                    index={rowIndex}
                    collapsed={collapsedRows.has(`${section.id}:${rowIndex}`)}
                    selected={
                      selectedTarget?.type === "row" && selectedRow === rowIndex
                    }
                    hovered={
                      hoveredTarget?.type === "row" && hoveredRow === rowIndex
                    }
                    selectedColumnKey={
                      rowSelectedTarget?.type === "column" ||
                      rowSelectedTarget?.type === "block"
                        ? rowSelectedTarget.columnKey
                        : null
                    }
                    selectedBlockKey={
                      rowSelectedTarget?.type === "block"
                        ? rowSelectedTarget.blockKey
                        : null
                    }
                    hoveredColumnKey={
                      rowHoveredTarget?.type === "column" ||
                      rowHoveredTarget?.type === "block"
                        ? rowHoveredTarget.columnKey
                        : null
                    }
                    hoveredBlockKey={
                      rowHoveredTarget?.type === "block"
                        ? `${rowHoveredTarget.columnKey}:${rowHoveredTarget.blockKey}`
                        : null
                    }
                    collapsedColumns={collapsedColumns}
                    onToggleRow={toggleRow}
                    onToggleColumn={toggleColumn}
                    actions={actions}
                  />
                  {actions.addRow && (
                    <div className="builder-structure-insert-row-slot">
                      <button
                        type="button"
                        className="builder-structure-insert-row-btn"
                        onClick={() =>
                          actions.addRow?.(section.id, rowIndex, "after", "1-col")
                        }
                        aria-label={`Add row after Row ${rowIndex + 1}`}
                        title="Add row here"
                      >
                        <Plus size={9} />
                        <span className="builder-structure-insert-label">
                          Add Row
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
});

export default function BuilderWireframePanel({
  page,
  pageLabel,
  documentKindLabel = "Page",
  documentBadgeLabel = "Page",
  structureLabel,
  structureAriaLabel = "Page structure",
  sections,
  selectedSectionId,
  selectedLayoutRowIndex,
  selectedLayoutColumnKey,
  selectedLayoutBlockKey,
  hoveredTarget = null,
  actions,
  renameSectionId = null,
}: Props) {
  const treeRef = useRef<HTMLDivElement>(null);
  const renameDraftRef = useRef("");
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(),
  );
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");

  const selected = useMemo(
    () =>
      selectedKey(
        selectedSectionId,
        selectedLayoutRowIndex,
        selectedLayoutColumnKey,
        selectedLayoutBlockKey,
      ),
    [
      selectedSectionId,
      selectedLayoutRowIndex,
      selectedLayoutColumnKey,
      selectedLayoutBlockKey,
    ],
  );

  const hovered = useMemo(() => structureKey(hoveredTarget), [hoveredTarget]);
  const header = page === "header";

  useEffect(() => {
    setCollapsedSections((current) => {
      const valid = new Set(sections.map((section) => section.id));
      const next = new Set([...current].filter((id) => valid.has(id)));
      if (selectedSectionId) next.delete(selectedSectionId);
      return next.size === current.size &&
        [...next].every((id) => current.has(id))
        ? current
        : next;
    });
  }, [sections, selectedSectionId]);

  useEffect(() => {
    if (!renameSectionId) return;
    const section = sections.find((item) => item.id === renameSectionId);
    if (!section) return;
    setEditingSectionId(section.id);
    renameDraftRef.current = section.name ?? "";
    setRenameDraft(section.name ?? "");
  }, [renameSectionId, sections]);

  useEffect(() => {
    const node = selected
      ? treeRef.current?.querySelector<HTMLElement>(
          `[data-structure-key="${CSS.escape(selected)}"]`,
        )
      : null;
    node?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected]);

  const setRenameValue = useCallback((value: string) => {
    renameDraftRef.current = value;
    setRenameDraft(value);
  }, []);

  const finishRename = useCallback(
    (sectionId: string, commit: boolean) => {
      if (commit && renameDraftRef.current.trim()) {
        actions.renameSection?.(sectionId, renameDraftRef.current.trim());
      }
      setEditingSectionId(null);
      renameDraftRef.current = "";
      setRenameDraft("");
      actions.renameComplete?.();
    },
    [actions],
  );

  const beginRename = useCallback((section: BuilderSection) => {
    setEditingSectionId(section.id);
    renameDraftRef.current = section.name ?? "";
    setRenameDraft(section.name ?? "");
  }, []);

  const toggle = useCallback(
    (id: string) =>
      setCollapsedSections((current) => {
        const next = new Set(current);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    [],
  );

  const headerRows = header
    ? sections.reduce(
        (count, section) => count + getWireframeRows(section).length,
        0,
      )
    : 0;

  return (
    <div className="builder-sidebar-panel builder-structure-panel builder-wireframe-panel builder-wireframe-panel--outline">
      <div className="builder-structure-header builder-wireframe-header-consolidated">
        <div className="builder-structure-header-row builder-wireframe-header-row">
          <div className="builder-structure-header-title-wrap builder-wireframe-header-title-wrap">
            <FileText
              size={13}
              className="builder-structure-header-icon builder-wireframe-icon builder-wireframe-icon--page"
            />
            <strong>{pageLabel}</strong>
          </div>
          <span className="builder-structure-badge builder-structure-badge--doc builder-wireframe-badge builder-wireframe-badge--page">
            {documentBadgeLabel}
          </span>
        </div>
        <div className="builder-structure-header-row builder-structure-header-row--sub builder-wireframe-header-row--sub">
          <span>
            {structureLabel ??
              (header ? "Header structure" : `${documentKindLabel} structure`)}
          </span>
          <small>
            {header
              ? `${headerRows} ${headerRows === 1 ? "row" : "rows"}`
              : `${sections.length} ${sections.length === 1 ? "section" : "sections"}`}
          </small>
        </div>
      </div>

      <div
        ref={treeRef}
        className="builder-structure-tree builder-wireframe-tree"
        role="tree"
        aria-label={structureAriaLabel}
      >
        {sections.length === 0 ? (
          <div className="builder-structure-empty builder-wireframe-empty">
            <Layers3 size={16} />
            <strong>No sections</strong>
            <span>Add a section to start building this page.</span>
            {actions.addSection ? (
              <button
                type="button"
                className="builder-structure-add-btn builder-wireframe-add-section is-empty"
                onClick={() => actions.addSection?.(null, "below")}
              >
                <Plus size={13} />
                <span>Add first section</span>
              </button>
            ) : null}
          </div>
        ) : (
          sections.map((section, index) => {
            const sectionSelectedKey = `section:${section.id}`;
            const sectionHoveredKey = sectionSelectedKey;
            const selectedTarget =
              selectedSectionId === section.id
                ? selectedLayoutBlockKey
                  ? {
                      type: "block" as const,
                      sectionId: selectedSectionId,
                      columnKey: selectedLayoutColumnKey!,
                      blockKey: selectedLayoutBlockKey,
                    }
                  : selectedLayoutColumnKey
                    ? {
                        type: "column" as const,
                        sectionId: selectedSectionId,
                        columnKey: selectedLayoutColumnKey,
                      }
                    : selectedLayoutRowIndex !== null
                      ? {
                          type: "row" as const,
                          sectionId: selectedSectionId,
                          rowIndex: selectedLayoutRowIndex,
                        }
                      : {
                          type: "section" as const,
                          sectionId: selectedSectionId,
                        }
                : null;

            return (
              <div
                key={section.id}
                className="builder-structure-section-slot builder-wireframe-section-slot"
              >
                <WireframeSection
                  section={section}
                  index={index}
                  total={sections.length}
                  collapsed={collapsedSections.has(section.id)}
                  selected={selected === sectionSelectedKey}
                  hovered={hovered === sectionHoveredKey}
                  hasSelectedDescendant={isDescendant(
                    sectionSelectedKey,
                    selected,
                  )}
                  hasHoveredDescendant={isDescendant(
                    sectionHoveredKey,
                    hovered,
                  )}
                  selectedTarget={selectedTarget}
                  hoveredTarget={
                    hoveredTarget?.sectionId === section.id
                      ? hoveredTarget
                      : null
                  }
                  editing={editingSectionId === section.id}
                  renameDraft={
                    editingSectionId === section.id ? renameDraft : ""
                  }
                  onRenameDraft={setRenameValue}
                  onStartRename={beginRename}
                  onFinishRename={finishRename}
                  onToggle={toggle}
                  actions={actions}
                  header={header}
                />
                {!header && actions.addSection ? (
                  <div className="builder-structure-insert-section-row">
                    <button
                      type="button"
                      className="builder-structure-insert-section-btn builder-wireframe-insert-section"
                      onClick={() => actions.addSection?.(section.id, "below")}
                      aria-label={`Add section after ${section.name || section.title || `Section ${index + 1}`}`}
                      title="Add section here"
                    >
                      <Plus size={10} />
                      <span className="builder-structure-insert-label">
                        Add Section
                      </span>
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
