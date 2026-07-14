export const HEADER_BLOCK_DRAG_TYPE = "application/x-builder-header-element";

export type HeaderBlockDragPayload = {
  blockId: string;
  sourceRowId: string;
  sourceColumnId: string;
};

export type HeaderBlockDropTarget = {
  targetRowId: string;
  targetColumnId: string;
  targetBlockId?: string;
  placement?: "above" | "below";
};

type HeaderBlock = { id?: string };

export type HeaderLayoutColumn<TBlock extends HeaderBlock = HeaderBlock> = {
  id?: string;
  rowId?: string;
  blocks?: TBlock[];
};

export function encodeHeaderBlockDragPayload(payload: HeaderBlockDragPayload) {
  return JSON.stringify(payload);
}

export function decodeHeaderBlockDragPayload(value: string): HeaderBlockDragPayload | null {
  try {
    const payload = JSON.parse(value) as Partial<HeaderBlockDragPayload>;
    const keys = Object.keys(payload).sort();
    if (
      keys.length !== 3 ||
      keys[0] !== "blockId" || keys[1] !== "sourceColumnId" || keys[2] !== "sourceRowId" ||
      typeof payload.blockId !== "string" || !payload.blockId ||
      typeof payload.sourceRowId !== "string" || !payload.sourceRowId ||
      typeof payload.sourceColumnId !== "string" || !payload.sourceColumnId
    ) {
      return null;
    }
    return {
      blockId: payload.blockId,
      sourceRowId: payload.sourceRowId,
      sourceColumnId: payload.sourceColumnId,
    };
  } catch {
    return null;
  }
}

export function moveHeaderBlockById<TBlock extends HeaderBlock, TColumn extends HeaderLayoutColumn<TBlock>>(
  layoutItems: TColumn[],
  payload: HeaderBlockDragPayload,
  target: HeaderBlockDropTarget,
): { layoutItems: TColumn[]; moved: boolean } {
  const sourceColumnIndex = layoutItems.findIndex((item) =>
    item.id === payload.sourceColumnId && item.rowId === payload.sourceRowId,
  );
  const targetColumnIndex = layoutItems.findIndex((item) =>
    item.id === target.targetColumnId && item.rowId === target.targetRowId,
  );
  if (sourceColumnIndex < 0 || targetColumnIndex < 0) {
    return { layoutItems, moved: false };
  }

  const sourceBlocks = layoutItems[sourceColumnIndex]?.blocks ?? [];
  const sourceBlockIndex = sourceBlocks.findIndex((block) => block.id === payload.blockId);
  const matchingBlockCount = layoutItems.reduce(
    (count, item) => count + (item.blocks ?? []).filter((block) => block.id === payload.blockId).length,
    0,
  );
  if (sourceBlockIndex < 0 || matchingBlockCount !== 1) {
    return { layoutItems, moved: false };
  }

  const movingBlock = sourceBlocks[sourceBlockIndex];
  if (!movingBlock) return { layoutItems, moved: false };

  const nextLayoutItems = [...layoutItems];
  if (sourceColumnIndex === targetColumnIndex) {
    const nextBlocks = [...sourceBlocks];
    nextBlocks.splice(sourceBlockIndex, 1);
    const targetBlockIndex = target.targetBlockId
      ? nextBlocks.findIndex((block) => block.id === target.targetBlockId)
      : -1;
    const insertIndex = targetBlockIndex < 0
      ? nextBlocks.length
      : targetBlockIndex + (target.placement === "below" ? 1 : 0);
    nextBlocks.splice(insertIndex, 0, movingBlock);
    nextLayoutItems[sourceColumnIndex] = {
      ...layoutItems[sourceColumnIndex],
      blocks: nextBlocks,
    };
    return { layoutItems: nextLayoutItems, moved: true };
  }

  const nextSourceBlocks = [...sourceBlocks];
  nextSourceBlocks.splice(sourceBlockIndex, 1);
  const targetBlocks = layoutItems[targetColumnIndex]?.blocks ?? [];
  const nextTargetBlocks = [...targetBlocks];
  const targetBlockIndex = target.targetBlockId
    ? nextTargetBlocks.findIndex((block) => block.id === target.targetBlockId)
    : -1;
  const insertIndex = targetBlockIndex < 0
    ? nextTargetBlocks.length
    : targetBlockIndex + (target.placement === "below" ? 1 : 0);
  nextTargetBlocks.splice(insertIndex, 0, movingBlock);

  nextLayoutItems[sourceColumnIndex] = {
    ...layoutItems[sourceColumnIndex],
    blocks: nextSourceBlocks,
  };
  nextLayoutItems[targetColumnIndex] = {
    ...layoutItems[targetColumnIndex],
    blocks: nextTargetBlocks,
  };
  return { layoutItems: nextLayoutItems, moved: true };
}
