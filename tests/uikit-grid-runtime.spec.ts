import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("shared UIkit Grid bridge owns masonry/parallax lifecycle and Gallery consumes the canonical structure", () => {
  const bridge = readFileSync(resolve(process.cwd(), "components/builder/useUikitGridRuntime.ts"), "utf8");
  const gallery = readFileSync(resolve(process.cwd(), "components/builder/UikitGallery.tsx"), "utf8");
  const grid = readFileSync(resolve(process.cwd(), "components/builder/GridCardsClient.tsx"), "utf8");
  const structure = readFileSync(resolve(process.cwd(), "lib/uikitGridStructure.ts"), "utf8");
  const styles = readFileSync(resolve(process.cwd(), "app/styles/shop-builder.css"), "utf8");

  expect(bridge).toContain('import("uikit")');
  expect(bridge).toContain("parallaxJustify");
  expect(bridge).toContain("UIkit.grid(rootRef.current, {");
  expect(bridge).toContain("instance?.$destroy?.()");
  expect(gallery).toContain("useUikitGridRuntime(gridRef");
  expect(gallery).toContain("resolveUikitGridStructure(rawBlock)");
  expect(gallery).toContain("enabled: isYoothemeGallery && Boolean(gridStructure.masonry || gridStructure.parallax !== undefined)");
  expect(gallery).toContain("data-uk-grid={uikitGridAttribute(gridStructure)}");
  expect(grid).toContain("useUikitGridRuntime(gridRef");
  expect(grid).toContain('"--shop-builder-grid-row-gap": rowGapCss');
  expect(grid).toContain("rowGap: hasGridRuntimeEffect ? 0 : rowGapCss");
  expect(structure).toContain('"shop-builder-uikit-grid--runtime"');
  expect(styles).toContain(".shop-builder-grid.shop-builder-uikit-grid--runtime");
  expect(styles).toContain("box-sizing: content-box");
  expect(styles).toContain("row-gap: 0");
  expect(styles).toContain("margin-top: var(--shop-builder-grid-row-gap");
  expect(styles).toContain(".shop-builder-grid:not(.shop-builder-uikit-grid--runtime) > .shop-builder-grid-card--hover-disabled");
});
