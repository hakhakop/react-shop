import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const panelSource = readFileSync(
  path.resolve("components/dashboard/inspector/panels/ButtonCapabilityPanel.tsx"),
  "utf8",
);

test("imported YOOtheme Button items use a compact select for the full style vocabulary", () => {
  assert.match(panelSource, /function isImportedYoothemeButton\(block: BuilderLayoutBlock\)/);
  assert.match(panelSource, /const itemStyleOptions = isImportedYoothemeButton\(block\) \? buttonStyleOptions : nativeButtonStyleOptions/);
  assert.match(panelSource, /<InspectorSelect[\s\S]*ariaLabel=\{`Button item \$\{index \+ 1\} style`\}/);
  assert.doesNotMatch(panelSource, /<InspectorPillGroup value=\{item\.style/);
});

test("imported YOOtheme Button owns Style per item and does not expose an invented element-level variant", () => {
  assert.match(panelSource, /const importedCollectionButton = isImportedYoothemeButton\(block\) && Array\.isArray\(block\.buttons\)/);
  assert.match(panelSource, /\{importedCollectionButton \? \(/);
  assert.match(panelSource, /label="Button size"[\s\S]*?<InspectorSelect/);
  assert.doesNotMatch(
    panelSource,
    /\{importedCollectionButton \? \([\s\S]*?ActionSettingsGroup[\s\S]*?\) : \(/,
  );
});
