import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { normalizeBuilderShellSettings } from "@/lib/builderShell";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";

const source = readFileSync(
  resolve(process.cwd(), "tests/fixtures/yootheme-compatibility/sources/devstack-import.less"),
  "utf8",
);

test("YOOtheme Card shadows survive import, normalization, and JSON persistence", () => {
  const imported = resolveYoothemeLess([
    { name: "master-devstack/_import.less", content: source, precedence: 1 },
  ]);
  const importedShell = normalizeBuilderShellSettings(imported.shellSettings);
  const importedVars = getUikitGlobalsCssVars(importedShell);

  for (const key of [
    "cardPrimaryShadow",
    "cardPrimaryHoverShadow",
    "cardSecondaryShadow",
    "cardSecondaryHoverShadow",
  ]) {
    expect(imported.shellSettings[key as keyof typeof imported.shellSettings]).toBeTruthy();
  }

  expect(importedVars["--uk-card-primary-shadow"]).toContain("rgba(255, 255, 255, 0.9)");
  expect(importedVars["--uk-card-primary-shadow"]).toContain("rgba(89, 51, 193, 0.3)");
  expect(importedVars["--uk-card-primary-hover-shadow"]).toContain("rgba(89, 51, 193, 0.3)");
  expect(importedVars["--uk-card-secondary-shadow"]).toContain("rgba(18, 14, 70, 0.3)");
  expect(importedVars["--uk-card-default-box-shadow"]).toContain("rgba(57, 65, 124, 0.08)");
  expect(importedVars["--uk-card-default-hover-shadow"]).toBe(
    "-2px -2px 5px rgba(255, 255, 255, 0.9), 2px 2px 4px rgba(57, 65, 124, 0.2)",
  );

  // The builder-shell API serializes these settings as JSON. Re-normalize the
  // same payload to cover the save/reload boundary without mutating a tenant.
  const reloadedShell = normalizeBuilderShellSettings(JSON.parse(JSON.stringify(importedShell)));
  expect(getUikitGlobalsCssVars(reloadedShell)).toEqual(importedVars);
});

test("Circle's explicit no-shadow contract remains no-shadow after persistence", () => {
  const circleShell = normalizeBuilderShellSettings({
    globalStylePresetName: "Circle-Default-2",
    cardShadow: "none",
    cardShadowHover: "none",
  });
  const reloadedCircleShell = normalizeBuilderShellSettings(JSON.parse(JSON.stringify(circleShell)));
  const circleVars = getUikitGlobalsCssVars(reloadedCircleShell);

  expect(circleVars["--uk-card-primary-shadow"]).toBe("none");
  expect(circleVars["--uk-card-primary-hover-shadow"]).toBe("none");
  expect(circleVars["--uk-card-secondary-shadow"]).toBe("none");
  expect(circleVars["--uk-card-secondary-hover-shadow"]).toBe("none");
});

test("legacy DevStack shell values are promoted to canonical default-card tokens", () => {
  const legacy = normalizeBuilderShellSettings({
    globalStylePresetName: "DevStack Light Blue",
    cardShadow: "-15px -15px 20px rgba(255, 255, 255, 0.6), 15px 15px 20px rgba(57, 65, 124, 0.1)",
    cardShadowHover: "-2px -2px 5px rgba(255, 255, 255, 0.8), 2px 2px 4px rgba(57, 65, 124, 0.2)",
  });
  const vars = getUikitGlobalsCssVars(legacy);

  expect(vars["--uk-card-default-box-shadow"]).toContain("rgba(57, 65, 124, 0.1)");
  expect(vars["--uk-card-default-hover-shadow"]).toContain("rgba(57, 65, 124, 0.2)");
});
