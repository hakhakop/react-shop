import assert from "node:assert/strict";
import test from "node:test";

import { resolveYoothemeLess } from "../lib/yoothemeLessImporter.ts";

const layers = [
  { name: "master-devstack/_import.less", precedence: 1, content: `
    @global-font-family: Manrope;
    @global-primary-background: #6F40F1;
    @global-background: #F7F8FC;
    @global-small-box-shadow: 0 1px 2px rgba(0,0,0,.1);
    @button-border-radius: 500px;
    @global-primary-font-weight: 600;
    @form-background: darken(@global-background, 1%);
  ` },
  { name: "master-devstack/styles/light-blue.less", precedence: 2, content: `
    @global-primary-background: #1991EE;
    @global-link-hover-color: lighten(@global-primary-background, 20%);
    @button-primary-hover-box-shadow: fade(@global-primary-background, 30%);
    @accordion-title-font-size: 18px;
  ` },
  { name: "theme.less", precedence: 3, content: `@theme-page-container-width: 1500px;` },
  { name: "style.less", precedence: 4, content: `@tab-item-border-width: 3px;` },
];

test("YOOtheme resolver honors layer precedence and evaluates supported color functions", () => {
  const preset = resolveYoothemeLess(layers);
  assert.equal(preset.shellSettings.primaryColor, "#1991EE");
  assert.equal(preset.shellSettings.fontFamilyBody, "Manrope");
  assert.equal(preset.shellSettings.pageContainerMaxWidth, "1500px");
  assert.equal(preset.shellSettings.buttonRadius, "500px");
  assert.match(String(preset.shellSettings.linkHoverColor), /^#/);
  assert.ok(preset.conflicts.some((row) => row.variable === "@global-primary-background"));
  assert.equal(preset.shellSettings.accordionTitleFontSize, "18px");
  assert.ok(preset.rows.some((row) => row.variable === "@accordion-title-font-size"));
});

test("unsupported expressions are reported and never guessed into semantic settings", () => {
  const preset = resolveYoothemeLess([
    { name: "base.less", precedence: 1, content: "@global-primary-background: var(--brand); @navbar-gap: 10px;" },
  ]);
  assert.equal(preset.shellSettings.primaryColor, undefined);
  assert.ok(preset.unsupported.some((row) => row.variable === "@global-primary-background"));
  assert.doesNotMatch(JSON.stringify(preset), /uk-[a-z-]+/);
});
