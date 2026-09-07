import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { createYoothemeThemeSettings } from "@/lib/builderThemeSettings";
import {
  applyYoothemeHeaderImport,
  createYoothemeHeaderRecipe,
} from "@/lib/yoothemeHeaderRecipe";
import type { BuilderState } from "@/components/dashboard/builderTypes";

const currentHeader: BuilderState = {
  page: "header",
  targetType: "header",
  design: {},
  sections: [{
    id: "header-document",
    kind: "header",
    title: "Header",
    background: "transparent",
    layout: "whole",
    headerPresetKey: "minimal",
    rows: [{
      id: "authored-row",
      layout: "halves",
      columns: [
        { id: "authored-left", elements: [{ id: "authored-logo", kind: "image" }] },
        { id: "authored-right", elements: [{ id: "authored-menu", kind: "menu" }] },
      ],
    }],
  }],
};

test("settings-only YOOtheme Header import preserves authored construction", () => {
  const source = JSON.parse(readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"));
  const theme = createYoothemeThemeSettings(source);
  const result = applyYoothemeHeaderImport(currentHeader, theme, "settings-only");

  expect(result.sections[0]?.rows).toEqual(currentHeader.sections[0]?.rows);
  expect(result.sections[0]?.layout).toBe("whole");
  expect(result.sections[0]?.headerPresetKey).toBe("minimal");
  expect(result.sections[0]?.headerDropbarEnabled).toBe(true);
  expect(result.sections[0]?.headerBehavior).toBe("sticky-on-scroll-up");
});

test("recipe mode creates ordinary semantic Header rows only when selected", () => {
  const source = JSON.parse(readFileSync("tests/fixtures/yootheme-jack-theme-settings.json", "utf8"));
  const theme = createYoothemeThemeSettings(source);
  const recipe = createYoothemeHeaderRecipe(theme);
  const result = applyYoothemeHeaderImport(currentHeader, theme, "replace-from-recipe");

  expect(recipe.rows.length).toBe(2);
  expect(result.sections[0]?.rows?.map((row) => row.id)).toEqual([
    "header-main-row",
    "header-mobile-row",
  ]);
  expect(result.sections[0]?.rows?.flatMap((row) => row.columns.map((column) => column.headerSlot))).toEqual(
    expect.arrayContaining(["header-start", "logo", "navigation", "mobile-logo", "mobile-end"]),
  );
  expect(result.sections[0]?.layoutItems).toBeUndefined();
  expect(result.sections[0]?.headerPresetKey).toBeUndefined();
});

test("Woolberry positions compile into desktop and mobile semantic slots", () => {
  const theme = createYoothemeThemeSettings({
    style: "woolberry",
    header: {
      layout: "horizontal-left",
      width: "expand",
      search: "header:start",
      search_layout: "input-dropbar",
      search_expand: true,
    },
    navbar: { sticky: 2, dropdown_align: "center", dropbar: true, dropdown_boundary: false },
    mobile: {
      breakpoint: "l",
      header: { layout: "horizontal-left", search: "header-mobile:end", search_layout: "dropbar" },
      navbar: { sticky: 2 },
      dialog: { layout: "dropbar-top", toggle: "header-mobile:end" },
    },
    dialog: { layout: "offcanvas-top", toggle: "header:end" },
    logo: { text: "WOOLBERRY", image: "wp-content/uploads/yootheme/logo.svg", image_mobile: "wp-content/uploads/yootheme/logo-mobile.svg" },
    menu: { positions: { navbar: { menu: 78 }, header: { menu: 80 }, "dialog-mobile": { menu: 79 } } },
  });
  const recipe = createYoothemeHeaderRecipe(theme);
  const desktop = recipe.rows.find((row) => row.headerVariant === "desktop");
  const mobile = recipe.rows.find((row) => row.headerVariant === "mobile");

  expect(recipe.desktopLayout).toBe("horizontal-left");
  expect(recipe.settings).toMatchObject({
    headerWidthMode: "full",
    headerBehavior: "sticky-on-scroll-up",
    headerDropbarEnabled: true,
    headerSearchPosition: "header-start",
    headerMobileSearchPosition: "mobile-end",
  });
  expect(desktop?.columns.find((item) => item.headerSlot === "logo")?.elements.map((item) => item.id)).toEqual([
    "header-search",
    "header-logo",
  ]);
  expect(desktop?.columns.find((item) => item.headerSlot === "navigation")?.elements[0]?.menuSource).toBe("main");
  expect(mobile?.columns.find((item) => item.headerSlot === "mobile-logo")?.elements[0]?.imageUrl).toContain("logo-mobile.svg");
  expect(mobile?.columns.find((item) => item.headerSlot === "mobile-end")?.elements.map((item) => item.id)).toEqual([
    "header-mobile-navigation",
    "header-mobile-search",
  ]);
  expect(recipe.report.omitted).toEqual(expect.arrayContaining([
    "header menu 80: link the imported WordPress menu resource in WebPages",
    "dialog-mobile menu 79: link the imported WordPress menu resource in WebPages",
  ]));
});
