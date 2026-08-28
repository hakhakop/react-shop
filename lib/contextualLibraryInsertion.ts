export type ContextualInsertionPlacement = "before" | "after" | "replace";

export type ContextualInsertionResult<Item> = {
  items: Item[];
  targetFound: boolean;
  insertedIndex: number;
};

/**
 * Inserts relative to one stable authored target. A missing target never
 * degrades Replace into append (or Before/After into an arbitrary position).
 */
export function insertAtContextualTarget<Item>(
  items: Item[],
  insertedItems: readonly Item[],
  targetId: string,
  placement: ContextualInsertionPlacement,
  getId: (item: Item, index: number) => string | undefined,
): ContextualInsertionResult<Item> {
  const targetIndex = items.findIndex((item, index) => getId(item, index) === targetId);
  if (targetIndex < 0) {
    return { items, targetFound: false, insertedIndex: -1 };
  }

  const insertedIndex = placement === "after" ? targetIndex + 1 : targetIndex;
  const next = [...items];
  next.splice(insertedIndex, placement === "replace" ? 1 : 0, ...insertedItems);
  return { items: next, targetFound: true, insertedIndex };
}
