import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("section alignment projects middle and bottom as renderer classes", async () => {
  const renderer = await readFile(path.join(process.cwd(), "components/builder/StorefrontBuilderRenderer.tsx"), "utf8");
  expect(renderer).toContain('`shop-builder-section--align-${verticalAlign}`');
  expect(renderer).toContain("section.contentVerticalAlign");
  expect(renderer).toContain('verticalAlign !== "top"');
});

test("viewport sections keep flex layout after UIkit section styles load", async () => {
  const css = await readFile(path.join(process.cwd(), "app/styles/shop-builder.css"), "utf8");
  expect(css).toContain(".shop-builder-section.shop-builder-section--height-viewport-percent");
  expect(css).toContain("display: flex;");
  expect(css).toContain("margin-top: auto;\n  margin-bottom: auto;");
});
