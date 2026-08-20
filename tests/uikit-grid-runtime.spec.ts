import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("shared UIkit Grid bridge owns masonry/parallax lifecycle and Gallery consumes the canonical structure", () => {
  const bridge = readFileSync(resolve(process.cwd(), "components/builder/useUikitGridRuntime.ts"), "utf8");
  const gallery = readFileSync(resolve(process.cwd(), "components/builder/UikitGallery.tsx"), "utf8");

  expect(bridge).toContain('import("uikit")');
  expect(bridge).toContain("parallaxJustify");
  expect(bridge).toContain("UIkit.grid(rootRef.current, {");
  expect(bridge).toContain("instance?.$destroy?.()");
  expect(gallery).toContain("useUikitGridRuntime(gridRef");
  expect(gallery).toContain("resolveUikitGridStructure(rawBlock)");
  expect(gallery).toContain("enabled: isYoothemeGallery && Boolean(gridStructure.masonry || gridStructure.parallax !== undefined)");
  expect(gallery).toContain("data-uk-grid={uikitGridAttribute(gridStructure)}");
});
