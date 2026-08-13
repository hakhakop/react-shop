import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const panelSource = readFileSync(
  path.resolve("components/dashboard/global-styles/YoothemeImportPanel.tsx"),
  "utf8",
);

test("a complete YOOtheme _import.less is accepted as a Global Styles source", () => {
  assert.match(panelSource, /sources\.some\(\(source\) => source\.name\.endsWith\("_import\.less"\)\)/);
  assert.doesNotMatch(panelSource, /sources\.length < 2/);
});
