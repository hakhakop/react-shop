import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeHeaderBlockDragPayload,
  encodeHeaderBlockDragPayload,
  moveHeaderBlockById,
} from "../lib/headerBuilderBlockMove.ts";

const block = (id) => ({ id, label: id });
const fixture = () => [
  { id: "row-1-left", rowId: "row-1", blocks: [block("logo")] },
  { id: "row-1-center", rowId: "row-1", blocks: [block("menu")] },
  { id: "row-1-right", rowId: "row-1", blocks: [block("search"), block("cart"), block("account")] },
  { id: "row-2-left", rowId: "row-2", blocks: [block("language")] },
  { id: "row-2-center", rowId: "row-2", blocks: [] },
];

const payload = (blockId, sourceRowId, sourceColumnId) => ({
  blockId,
  sourceRowId,
  sourceColumnId,
});

test("drag payload contains only the individual block and source identities", () => {
  const original = payload("search", "row-1", "row-1-right");
  const encoded = encodeHeaderBlockDragPayload(original);
  assert.deepEqual(decodeHeaderBlockDragPayload(encoded), original);
  assert.deepEqual(Object.keys(JSON.parse(encoded)).sort(), ["blockId", "sourceColumnId", "sourceRowId"]);
  assert.equal(decodeHeaderBlockDragPayload(JSON.stringify({ ...original, blocks: [block("cart")] })), null);
});

test("moves Search alone from right to left and preserves right siblings", () => {
  const columns = fixture();
  const menuColumn = columns[1];
  const cart = columns[2].blocks[1];
  const account = columns[2].blocks[2];
  const result = moveHeaderBlockById(columns, payload("search", "row-1", "row-1-right"), {
    targetRowId: "row-1",
    targetColumnId: "row-1-left",
  });

  assert.equal(result.moved, true);
  assert.deepEqual(result.layoutItems[0].blocks.map(({ id }) => id), ["logo", "search"]);
  assert.deepEqual(result.layoutItems[2].blocks.map(({ id }) => id), ["cart", "account"]);
  assert.equal(result.layoutItems[2].blocks[0], cart);
  assert.equal(result.layoutItems[2].blocks[1], account);
  assert.equal(result.layoutItems[1], menuColumn);
});

test("moves Menu alone to another row without changing any other column", () => {
  const columns = fixture();
  const untouchedRightColumn = columns[2];
  const untouchedLanguageColumn = columns[3];
  const result = moveHeaderBlockById(columns, payload("menu", "row-1", "row-1-center"), {
    targetRowId: "row-2",
    targetColumnId: "row-2-center",
  });

  assert.deepEqual(result.layoutItems[1].blocks, []);
  assert.deepEqual(result.layoutItems[4].blocks.map(({ id }) => id), ["menu"]);
  assert.equal(result.layoutItems[2], untouchedRightColumn);
  assert.equal(result.layoutItems[3], untouchedLanguageColumn);
});

test("reorders one element within the same column and preserves sibling objects", () => {
  const columns = fixture();
  const search = columns[2].blocks[0];
  const cart = columns[2].blocks[1];
  const account = columns[2].blocks[2];
  const result = moveHeaderBlockById(columns, payload("account", "row-1", "row-1-right"), {
    targetRowId: "row-1",
    targetColumnId: "row-1-right",
    targetBlockId: "search",
    placement: "above",
  });

  assert.deepEqual(result.layoutItems[2].blocks.map(({ id }) => id), ["account", "search", "cart"]);
  assert.equal(result.layoutItems[2].blocks[0], account);
  assert.equal(result.layoutItems[2].blocks[1], search);
  assert.equal(result.layoutItems[2].blocks[2], cart);
  assert.equal(result.layoutItems[0], columns[0]);
  assert.equal(result.layoutItems[1], columns[1]);
  assert.equal(result.layoutItems[3], columns[3]);
  assert.equal(result.layoutItems[4], columns[4]);
});

test("rejects a stale source identity without moving any block", () => {
  const columns = fixture();
  const result = moveHeaderBlockById(columns, payload("search", "row-1", "row-1-left"), {
    targetRowId: "row-2",
    targetColumnId: "row-2-center",
  });
  assert.equal(result.moved, false);
  assert.equal(result.layoutItems, columns);
});
