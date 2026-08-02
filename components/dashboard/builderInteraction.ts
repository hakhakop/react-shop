export type BuilderObjectType = "section" | "row" | "column" | "block";

export type BuilderInteractionTarget =
  | { type: "section"; sectionId: string }
  | { type: "row"; sectionId: string; rowIndex: number }
  | { type: "column"; sectionId: string; columnKey: string }
  | {
      type: "block";
      sectionId: string;
      columnKey: string;
      blockKey: string;
    };

export type BuilderInteractionState =
  | "idle"
  | "hovered"
  | "selected"
  | "editing"
  | "insertion-target";

export type BuilderInteractionChrome = {
  showToolbar: boolean;
  showSpacing: boolean;
  showDragHandle: boolean;
};

export const BUILDER_HOVER_TOOLBAR_DELAY_MS = 420;

export function builderTargetsEqual(
  left: BuilderInteractionTarget | null,
  right: BuilderInteractionTarget | null,
) {
  if (!left || !right || left.type !== right.type) return false;
  if (left.sectionId !== right.sectionId) return false;
  if (left.type === "section" && right.type === "section") return true;
  if (left.type === "row" && right.type === "row") {
    return left.rowIndex === right.rowIndex;
  }
  if (left.type === "column" && right.type === "column") {
    return left.columnKey === right.columnKey;
  }
  return (
    left.type === "block" &&
    right.type === "block" &&
    left.columnKey === right.columnKey &&
    left.blockKey === right.blockKey
  );
}

export function resolveBuilderInteractionState({
  target,
  selected,
  hovered,
  editing,
  insertionTarget = false,
}: {
  target: BuilderInteractionTarget;
  selected: BuilderInteractionTarget | null;
  hovered: BuilderInteractionTarget | null;
  editing: BuilderInteractionTarget | null;
  insertionTarget?: boolean;
}): BuilderInteractionState {
  if (builderTargetsEqual(target, editing)) return "editing";
  if (insertionTarget) return "insertion-target";
  if (builderTargetsEqual(target, selected)) return "selected";
  if (!editing && builderTargetsEqual(target, hovered)) return "hovered";
  return "idle";
}

export function builderInteractionClassName(
  target: BuilderInteractionTarget,
  state: BuilderInteractionState,
) {
  return `builder-interaction-object builder-interaction-${target.type} is-interaction-${state}`;
}

export function builderInteractionFrameClassName(
  target: BuilderInteractionTarget,
) {
  return `builder-interaction-frame builder-interaction-${target.type}-frame`;
}

export function builderInsertionBoundaryClassName(
  owner: BuilderInteractionTarget,
) {
  return `builder-interaction-boundary builder-interaction-${owner.type}-boundary`;
}

export function resolveBuilderInteractionChrome({
  state,
  spacingActive = false,
  dragging = false,
}: {
  state: BuilderInteractionState;
  spacingActive?: boolean;
  dragging?: boolean;
  hoverToolbarReady?: boolean;
}): BuilderInteractionChrome {
  return {
    showToolbar: state === "selected" || state === "hovered",
    showSpacing:
      (state === "selected" && spacingActive) ||
      (state === "insertion-target" && dragging),
    showDragHandle: state === "selected" && !spacingActive,
  };
}

export function builderTargetFromElement(
  element: Element | null,
): BuilderInteractionTarget | null {
  const owner = element?.closest<HTMLElement>("[data-builder-object-type]");
  if (!owner) return null;
  const type = owner.dataset.builderObjectType as BuilderObjectType | undefined;
  const sectionId = owner.dataset.builderSectionId;
  if (!type || !sectionId) return null;
  if (type === "section") return { type, sectionId };
  if (type === "row") {
    const rowIndex = Number(owner.dataset.builderRowIndex);
    return Number.isInteger(rowIndex) ? { type, sectionId, rowIndex } : null;
  }
  const columnKey = owner.dataset.builderColumnKey;
  if (!columnKey) return null;
  if (type === "column") return { type, sectionId, columnKey };
  const blockKey = owner.dataset.builderBlockKey;
  return blockKey ? { type, sectionId, columnKey, blockKey } : null;
}

export function selectedBuilderTarget({
  sectionId,
  rowIndex,
  columnKey,
  blockKey,
}: {
  sectionId: string;
  rowIndex: number | null;
  columnKey: string | null;
  blockKey: string | null;
}): BuilderInteractionTarget | null {
  if (!sectionId) return null;
  if (blockKey && columnKey) {
    return { type: "block", sectionId, columnKey, blockKey };
  }
  if (columnKey) return { type: "column", sectionId, columnKey };
  if (rowIndex !== null) return { type: "row", sectionId, rowIndex };
  return { type: "section", sectionId };
}
