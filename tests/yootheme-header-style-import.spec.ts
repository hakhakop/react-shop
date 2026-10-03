import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import { createYoothemeThemeSettings } from "@/lib/builderThemeSettings";
import { applyYoothemeHeaderDocumentImport } from "@/lib/yoothemeHeaderRecipe";
import { defaultBuilderShellSettings, normalizeBuilderShellSettings } from "@/lib/builderShell";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import type { BuilderState } from "@/components/dashboard/builderTypes";

const source = `
@global-inverse-color: #fff;
@navbar-padding-top: 15px;
@navbar-padding-bottom: @navbar-padding-top;
@navbar-item-padding-horizontal: 25px;
@navbar-nav-item-padding-horizontal: 25px;
@navbar-nav-gap: 0px;
@inverse-navbar-border: fade(@global-inverse-color, 60%);
@inverse-navbar-item-color: @global-inverse-color;
@inverse-navbar-toggle-color: @global-inverse-color;
@inverse-navbar-toggle-hover-color: fade(@global-inverse-color, 70%);
@logo-font-weight: 700;
`;

test("header style tokens survive persistence and render inverse colors and item spacing", async ({ page }) => {
  const patch = resolveYoothemeLess([{ name: "_import.less", content: source, precedence: 1 }]).shellSettings;
  const shell = normalizeBuilderShellSettings(JSON.parse(JSON.stringify({ ...defaultBuilderShellSettings, ...patch })));
  expect(shell.navbarPaddingTopMedium).toBe("15px");
  expect(shell.navbarPaddingBottomMedium).toBe("15px");
  expect(shell.navbarNavItemPaddingHorizontalMedium).toBe("25px");
  const vars = getUikitGlobalsCssVars(shell);
  expect(vars["--uk-navbar-item-padding-horizontal"]).toBe("25px");
  expect(vars["--uk-inverse-navbar-border"]).toBe("rgba(255, 255, 255, 0.6)");
  const declarations = Object.entries(vars).map(([key, value]) => `${key}:${value}`).join(";");
  await page.setContent(`<style>:root{${declarations}}${readFileSync("app/styles/header.css", "utf8")}</style>
    <header class="site-header" data-header-text-mode="light"><div class="header-builder-element--logo"><a class="site-header-brand">Brand</a></div>
    <div class="header-builder-element--utility"><div class="site-header-actions"><button>Search</button></div></div></header>`);
  await expect(page.locator(".site-header-brand")).toHaveCSS("font-weight", "700");
  await expect(page.locator(".header-builder-element--logo")).toHaveCSS("padding-left", "25px");
  await expect(page.locator("button")).toHaveCSS("color", "rgb(255, 255, 255)");
});

test("transparent navbar border resolves base and inverse tokens from each theme's color mode", async ({ page }) => {
  const themes = [
    {
      name: "Circle",
      mode: "light",
      textMode: "light",
      border: "rgba(255, 255, 255, 0.08)",
      inverseBorder: "rgba(0, 0, 0, 0.12)",
      expected: "rgba(255, 255, 255, 0.08)",
    },
    {
      name: "Makai",
      mode: "dark",
      textMode: "light",
      border: "rgba(0, 0, 0, 0.1)",
      inverseBorder: "rgba(255, 255, 255, 0.6)",
      expected: "rgba(255, 255, 255, 0.6)",
    },
  ];

  for (const theme of themes) {
    await page.setContent(`<style>
      :root {
        --uk-navbar-border: ${theme.border};
        --uk-navbar-border-theme: ${theme.border};
        --uk-inverse-navbar-border: ${theme.inverseBorder};
      }
      ${readFileSync("app/styles/header.css", "utf8")}
    </style>
    <header class="site-header site-header--navbar-yootheme-border-parity site-header--navbar-color-mode-${theme.mode}" data-header-text-mode="${theme.textMode}"></header>`);
    const effectiveBorder = await page.locator(".site-header").evaluate((node) =>
      getComputedStyle(node).getPropertyValue("--uk-navbar-border").trim(),
    );
    expect(effectiveBorder, `${theme.name} transparent navbar border`).toBe(theme.expected);
  }
});

test("Circle and Makai storefronts keep their imported base and inverse navbar borders distinct", async ({ page }) => {
  await page.goto("/circle");
  const circleHeader = page.locator(".site-header").first();
  await expect(circleHeader).toHaveClass(/site-header--navbar-color-mode-light/);
  await expect(circleHeader).toHaveClass(/site-header--navbar-border-mode-bottom-full-width/);
  await expect(circleHeader).toHaveAttribute("data-header-text-mode", "light");
  await expect.poll(() => circleHeader.evaluate((node) =>
    getComputedStyle(node).getPropertyValue("--uk-navbar-border").trim(),
  )).toBe("rgba(255, 255, 255, 0.08)");
  const circleBorderAlignment = await circleHeader.evaluate((node) => {
    const row = node.querySelector(".site-header-builder-primary-row")!.getBoundingClientRect();
    const rect = node.getBoundingClientRect();
    const after = getComputedStyle(node, "::after");
    return {
      rowBottomBorder: getComputedStyle(node.querySelector(".site-header-builder-primary-row")!).borderBottomWidth,
      rowBottom: row.bottom,
      pseudoBottom: rect.bottom - Number.parseFloat(after.bottom),
    };
  });
  expect(circleBorderAlignment.rowBottomBorder).toBe("0px");
  expect(Math.abs(circleBorderAlignment.pseudoBottom - circleBorderAlignment.rowBottom)).toBeLessThanOrEqual(1);

  await page.goto("/makai");
  const makaiHeader = page.locator(".site-header").first();
  await expect(makaiHeader).toHaveClass(/site-header--navbar-color-mode-dark/);
  await expect(makaiHeader).toHaveClass(/site-header--navbar-border-mode-full/);
  await expect(makaiHeader).toHaveAttribute("data-section-header-transparent", "true");
  await expect(makaiHeader).toHaveAttribute("data-header-text-mode", "light");
  const makaiBorderFrame = await makaiHeader.evaluate((node) => {
    const row = node.querySelector(".site-header-builder-primary-row")!;
    const style = getComputedStyle(row);
    const rowRect = row.getBoundingClientRect();
    const headerInner = node.querySelector(".site-header-main-inner")!;
    return {
      borderTop: style.borderTopWidth,
      borderRight: style.borderRightWidth,
      borderBottom: style.borderBottomWidth,
      borderLeft: style.borderLeftWidth,
      containerMaxWidth: getComputedStyle(headerInner).maxWidth,
      rowWidth: rowRect.width,
    };
  });
  expect(makaiBorderFrame).toEqual({
    borderTop: "1px",
    borderRight: "1px",
    borderBottom: "1px",
    borderLeft: "1px",
    containerMaxWidth: "1360px",
    rowWidth: 1296,
  });
  const transparentBorder = await makaiHeader.evaluate((node) =>
    getComputedStyle(node).getPropertyValue("--uk-navbar-border").trim(),
  );
  expect(transparentBorder).toBe("rgba(255, 255, 255, 0.6)");
});

test("settings-only imports measurements without changing composition or assets", () => {
  const theme = createYoothemeThemeSettings({ style: "makai", header: { layout: "horizontal-right", width: "xlarge", search: "header:end" }, navbar: { sticky: 1 }, logo: { image_mobile: "replacement.svg" } });
  const current = { page: "header", targetType: "header", design: {}, sections: [{ id: "header-document", kind: "contentLayout", title: "Header", visible: true, headerLayout: "pill", headerPresetKey: "minimal", headerSearchPosition: "header-start", headerMobileLogoUrl: "authored.svg", rows: [{ id: "row", layout: "whole", columns: [{ id: "column", elements: [{ id: "logo", kind: "image", imageUrl: "existing.svg" }] }] }] }] } as BuilderState;
  const result = applyYoothemeHeaderDocumentImport(current, theme, "desktop", "settings-only");
  expect(result.sections[0]).toMatchObject({ headerLayout: "pill", headerPresetKey: "minimal", headerSearchPosition: "header-start", headerBehavior: "sticky", headerWidthMode: "boxed", maxWidth: "xlarge" });
  expect(result.sections[0].rows).toEqual(current.sections[0].rows);
});
