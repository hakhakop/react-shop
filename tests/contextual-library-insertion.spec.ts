import { expect, test } from "@playwright/test";
import { insertAtContextualTarget } from "@/lib/contextualLibraryInsertion";

const ids = (items: Array<{ id: string }>) => items.map((item) => item.id);
const getId = (item: { id: string }) => item.id;

test("contextual insertion preserves exact before, after, and replace semantics", () => {
  const current = [{ id: "a" }, { id: "b" }, { id: "c" }];
  expect(ids(insertAtContextualTarget(current, [{ id: "x" }], "b", "before", getId).items)).toEqual(["a", "x", "b", "c"]);
  expect(ids(insertAtContextualTarget(current, [{ id: "x" }], "b", "after", getId).items)).toEqual(["a", "b", "x", "c"]);
  expect(ids(insertAtContextualTarget(current, [{ id: "x" }, { id: "y" }], "b", "replace", getId).items)).toEqual(["a", "x", "y", "c"]);
});

test("a stale contextual target fails closed instead of appending", () => {
  const current = [{ id: "a" }, { id: "b" }];
  for (const placement of ["before", "after", "replace"] as const) {
    const result = insertAtContextualTarget(current, [{ id: "x" }], "missing", placement, getId);
    expect(result.targetFound).toBe(false);
    expect(result.items).toBe(current);
    expect(ids(result.items)).toEqual(["a", "b"]);
  }
});
