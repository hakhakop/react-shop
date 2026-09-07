import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  getUikitContainerClass,
  resolveUikitSectionContainerPreset,
} from "@/lib/uikitTokens";

test("section width uses maxWidth as the canonical value with legacy fallback", () => {
  expect(resolveUikitSectionContainerPreset("large", "none")).toBe("large");
  expect(resolveUikitSectionContainerPreset("xlarge", "expand")).toBe("xlarge");
  expect(resolveUikitSectionContainerPreset(undefined, "expand")).toBe("expand");
  expect(resolveUikitSectionContainerPreset(undefined, "boxed")).toBe("default");
});

test("YOOtheme None and Expand retain distinct container semantics", () => {
  expect(getUikitContainerClass(resolveUikitSectionContainerPreset("none", "expand"))).toBe("");
  expect(getUikitContainerClass(resolveUikitSectionContainerPreset("expand", "none"))).toBe(
    "uk-container uk-container-expand",
  );
  expect(getUikitContainerClass(resolveUikitSectionContainerPreset("large", "none"))).toBe(
    "uk-container uk-container-large",
  );
  expect(getUikitContainerClass(resolveUikitSectionContainerPreset("xlarge", "none"))).toBe(
    "uk-container uk-container-xlarge",
  );
});

test("builder row projection preserves the responsive section gutter", async () => {
  const [shopCss, dashboardCss] = await Promise.all([
    readFile(path.join(process.cwd(), "app/styles/shop-builder.css"), "utf8"),
    readFile(path.join(process.cwd(), "app/styles/dashboard.css"), "utf8"),
  ]);

  expect(shopCss).toContain(
    "--shop-builder-container-padding-horizontal: var(--uk-container-padding-horizontal-m, 40px);",
  );
  expect(shopCss).not.toContain(
    ".shop-builder-content-row--contained > .shop-builder-content-layout-card",
  );
  expect(dashboardCss).toContain(
    "margin-left: calc(var(--shop-builder-row-column-gutter) * -1) !important;",
  );
  expect(dashboardCss).toContain(
    "width: calc(100% + var(--shop-builder-row-column-gutter)) !important;",
  );
  expect(dashboardCss).toContain(
    "padding-left: var(--shop-builder-row-column-gutter) !important;",
  );
  expect(shopCss).toContain(
    ".shop-builder-content-row--yootheme {",
  );
  expect(shopCss).toContain(
    "width: calc(100% + var(--shop-builder-row-column-gutter)) !important;",
  );
});

test("row inspector does not display Small for an inherited default gap", async () => {
  const rowPanel = await readFile(
    path.join(
      process.cwd(),
      "components/dashboard/inspector/panels/RowCapabilityPanel.tsx",
    ),
    "utf8",
  );

  expect(rowPanel).toContain('value={row.columnGap ?? "default"}');
  expect(rowPanel).toContain('value={row.rowGap ?? "default"}');
  expect(rowPanel).not.toContain('value={row.columnGap ?? "inherit"}');
});
