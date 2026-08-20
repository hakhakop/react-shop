import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const panelSource = readFileSync(
  path.resolve("components/dashboard/inspector/panels/PanelCapabilityPanel.tsx"),
  "utf8",
);

const builderSource = readFileSync(
  path.resolve("components/dashboard/DashboardBuilder.tsx"),
  "utf8",
);

test("Panel Link reuses the canonical YOOtheme link vocabulary and preserves every supported style", () => {
  assert.match(panelSource, /<ActionSettingsGroup[\s\S]*?title="LINK"[\s\S]*?terminology="link"/);
  assert.match(builderSource, /UIKIT_YOOTHEME_BUTTON_VARIANTS\.includes\(block\.panelActionStyle/);
});
