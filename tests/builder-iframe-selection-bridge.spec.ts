import { expect, test } from "@playwright/test";

import { visibleBuilderSelectionRect } from "@/components/builder/BuilderIframeSelectionBridge";

test("clips a negative UIkit row wireframe to the visible canvas", () => {
  expect(visibleBuilderSelectionRect(
    { x: -40, y: 120, width: 1240, height: 80 },
    { type: "row", sectionId: "products", rowIndex: 0 },
    1200,
  )).toEqual({ x: 0, y: 120, width: 1200, height: 80 });
});

test("keeps contained row wireframes unchanged", () => {
  expect(visibleBuilderSelectionRect(
    { x: 120, y: 120, width: 960, height: 80 },
    { type: "row", sectionId: "products", rowIndex: 0 },
    1200,
  )).toEqual({ x: 120, y: 120, width: 960, height: 80 });
});

test("does not clip element wireframes that intentionally paint outside", () => {
  expect(visibleBuilderSelectionRect(
    { x: -20, y: 120, width: 200, height: 80 },
    { type: "block", sectionId: "products", columnKey: "column-1", blockKey: "image-1" },
    1200,
  )).toEqual({ x: -20, y: 120, width: 200, height: 80 });
});
