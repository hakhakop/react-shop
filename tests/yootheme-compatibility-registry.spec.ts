import { expect, test } from "@playwright/test";
import {
  YOOTHEME_COMPATIBILITY_REGISTRY,
  findYoothemeCapability,
  findYoothemeFixture,
  getYoothemeCapabilityEvidence,
  isYoothemeCapabilityFixtureAccepted,
  resolveYoothemeFixtureContracts,
  validateYoothemeCompatibilityRegistry,
  type YoothemeCompatibilityRegistry,
} from "@/lib/yoothemeCompatibilityRegistry";
import { validateRegisteredFixtureFiles } from "@/lib/yoothemeCompatibilityRegistry.node";

test("Phase 12 fixture and semantic capability registries validate their synchronized repository evidence", async () => {
  expect(validateYoothemeCompatibilityRegistry()).toEqual([]);
  expect(await validateRegisteredFixtureFiles()).toEqual([]);

  for (const fixtureId of ["enterprise3", "enterprise4", "enterprise5", "enterprise6", "enterprise7", "enterprise8"]) {
    expect(findYoothemeFixture(fixtureId)).toBeTruthy();
  }
  expect(findYoothemeCapability("panel-slider.slider_divider")?.status).toBe("SUPPORTED");
  expect(findYoothemeCapability("gallery.source")?.status).toBe("DEFERRED");
  expect(resolveYoothemeFixtureContracts("enterprise3")).toHaveLength(2);
});

test("Phase 12 registry rejects duplicate fixture IDs, duplicate capability keys, and unresolved references", () => {
  const duplicateFixtureRegistry: YoothemeCompatibilityRegistry = {
    ...YOOTHEME_COMPATIBILITY_REGISTRY,
    fixtures: [
      YOOTHEME_COMPATIBILITY_REGISTRY.fixtures.find((fixture) => fixture.id === "enterprise3")!,
      YOOTHEME_COMPATIBILITY_REGISTRY.fixtures.find((fixture) => fixture.id === "enterprise3")!,
    ],
  };
  expect(validateYoothemeCompatibilityRegistry(duplicateFixtureRegistry).map((issue) => issue.message)).toContain("duplicate fixture ID 'enterprise3'");

  const duplicateCapabilityRegistry: YoothemeCompatibilityRegistry = {
    ...YOOTHEME_COMPATIBILITY_REGISTRY,
    capabilities: [
      YOOTHEME_COMPATIBILITY_REGISTRY.capabilities.find((capability) => capability.key === "panel-slider.slider_divider")!,
      YOOTHEME_COMPATIBILITY_REGISTRY.capabilities.find((capability) => capability.key === "panel-slider.slider_divider")!,
    ],
  };
  expect(validateYoothemeCompatibilityRegistry(duplicateCapabilityRegistry).map((issue) => issue.message)).toContain("duplicate capability key 'panel-slider.slider_divider'");

  const unresolvedReferenceRegistry: YoothemeCompatibilityRegistry = {
    ...YOOTHEME_COMPATIBILITY_REGISTRY,
    fixtures: [{ ...YOOTHEME_COMPATIBILITY_REGISTRY.fixtures[0], contracts: [{ path: "tests/fixtures/yootheme-compatibility/missing.contract.json", capabilityKeys: ["missing.field"] }] }],
  };
  expect(validateYoothemeCompatibilityRegistry(unresolvedReferenceRegistry).map((issue) => issue.message)).toContain("references unknown capability 'missing.field'");
});

test("registry distinguishes a mapped runtime path from fixture-accepted semantic fidelity", () => {
  const fixtureAccepted = getYoothemeCapabilityEvidence("panel-slider.slider_divider");
  expect(fixtureAccepted.mappedRuntimePath).toBe(true);
  expect(fixtureAccepted.fixtureAccepted).toBe(true);
  expect(fixtureAccepted.acceptanceContractPaths).toContain(
    "tests/fixtures/yootheme-compatibility/panel-slider-divider.enterprise3.contract.json",
  );

  // Enterprise8 backfill records are deliberately descriptive of an existing
  // path, not a substitute for a field-level executable acceptance contract.
  const mappedOnly = getYoothemeCapabilityEvidence("button.button_size");
  expect(mappedOnly.mappedRuntimePath).toBe(true);
  expect(mappedOnly.fixtureAccepted).toBe(false);
  expect(isYoothemeCapabilityFixtureAccepted("button.button_size")).toBe(false);
});
