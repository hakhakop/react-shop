import { expect, test } from "@playwright/test";
import { baseLayoutBlockKinds } from "@/components/dashboard/builderRegistry";
import {
  CANONICAL_INSPECTOR_KINDS,
  classifyInspectorKind,
  INSPECTOR_ELEMENT_CAPABILITIES,
  LEGACY_INSPECTOR_ALLOWLIST,
} from "@/components/dashboard/inspector/inspectorRouting";

test("every normal Element Library kind has an explicit inspector classification", () => {
  const unclassified = baseLayoutBlockKinds.filter((kind) => classifyInspectorKind(kind) === "unclassified");
  expect(unclassified).toEqual([]);
  expect(new Set(LEGACY_INSPECTOR_ALLOWLIST).size).toBe(LEGACY_INSPECTOR_ALLOWLIST.length);
});

test("every canonical element composes the shared inspector shell", () => {
  for (const kind of CANONICAL_INSPECTOR_KINDS) {
    const declaration = INSPECTOR_ELEMENT_CAPABILITIES[kind];
    expect(declaration, `${kind} needs a capability declaration`).toBeDefined();
    expect(declaration?.capabilities).toEqual(["content", "style", "advanced"]);
    expect(declaration?.settingsLabel).toBe("Settings");
    expect(declaration?.composes).toContain("general");
    expect(declaration?.composes).toContain("animation");
  }
});

test("button presentation is declared wherever actions are rendered", () => {
  for (const kind of ["button", "panel", "hero", "grid"] as const) {
    expect(INSPECTOR_ELEMENT_CAPABILITIES[kind]?.composes).toContain("component-presentation");
  }
});
