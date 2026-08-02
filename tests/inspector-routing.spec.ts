import { expect, test } from "@playwright/test";
import { baseLayoutBlockKinds } from "@/components/dashboard/builderRegistry";
import { classifyInspectorKind, LEGACY_INSPECTOR_ALLOWLIST } from "@/components/dashboard/inspector/inspectorRouting";

test("every normal Element Library kind has an explicit inspector classification", () => {
  const unclassified = baseLayoutBlockKinds.filter((kind) => classifyInspectorKind(kind) === "unclassified");
  expect(unclassified).toEqual([]);
  expect(new Set(LEGACY_INSPECTOR_ALLOWLIST).size).toBe(LEGACY_INSPECTOR_ALLOWLIST.length);
});
