import assert from "node:assert/strict";
import test from "node:test";

import { resolveYoothemeLess } from "../lib/yoothemeLessImporter.ts";

const layers = [
  { name: "master-devstack/_import.less", precedence: 1, content: `
    @global-font-family: Manrope;
    @global-primary-background: #6F40F1;
    @global-background: #F7F8FC;
    @global-muted-background: #EEF1F8;
    @global-secondary-background: #17104E;
    @global-small-box-shadow: 0 1px 2px rgba(0,0,0,.1);
    @button-border-radius: 500px;
    @internal-button-primary-mode: glow;
    @internal-button-primary-glow-gradient: conic-gradient(from 60deg, red, blue);
    @internal-button-primary-glow-filter: blur(10px);
    @internal-button-primary-hover-glow-filter: blur(16px);
    @theme-box-decoration-border-radius: 10px;
    @theme-box-decoration-default-gradient: conic-gradient(red, blue);
    @internal-section-default-gradient: radial-gradient(red, transparent);
    @breakpoint-small: 640px;
    @breakpoint-medium: 960px;
    @breakpoint-large: 1200px;
    @breakpoint-xlarge: 1600px;
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
  assert.equal(preset.shellSettings.backgroundPrimary, "#1991EE");
  assert.equal(preset.shellSettings.backgroundDefault, "#F7F8FC");
  assert.equal(preset.shellSettings.backgroundMuted, "#EEF1F8");
  assert.equal(preset.shellSettings.backgroundSecondary, "#17104E");
  assert.equal(preset.shellSettings.fontFamilyBody, "Manrope");
  assert.equal(preset.shellSettings.pageContainerMaxWidth, "1500px");
  assert.equal(preset.shellSettings.buttonRadius, "500px");
  assert.equal(preset.shellSettings.buttonPrimaryMode, "glow");
  assert.equal(preset.shellSettings.buttonPrimaryGlowGradient, "conic-gradient(from 60deg, red, blue)");
  assert.equal(preset.shellSettings.buttonPrimaryGlowFilter, "blur(10px)");
  assert.equal(preset.shellSettings.buttonPrimaryHoverGlowFilter, "blur(16px)");
  assert.equal(preset.shellSettings.themeBoxDecorationBorderRadius, "10px");
  assert.equal(preset.shellSettings.themeBoxDecorationDefaultGradient, "conic-gradient(red, blue)");
  assert.equal(preset.shellSettings.backgroundDefaultGradient, "radial-gradient(red, transparent)");
  assert.match(String(preset.shellSettings.linkHoverColor), /^#/);
  assert.ok(preset.conflicts.some((row) => row.variable === "@global-primary-background"));
  assert.equal(preset.shellSettings.accordionTitleFontSize, "18px");
  assert.deepEqual(
    [
      preset.shellSettings.breakpointSmall,
      preset.shellSettings.breakpointMedium,
      preset.shellSettings.breakpointLarge,
      preset.shellSettings.breakpointXLarge,
    ],
    ["640px", "960px", "1200px", "1600px"],
  );
  for (const variable of ["@breakpoint-small", "@breakpoint-medium", "@breakpoint-large", "@breakpoint-xlarge"]) {
    assert.equal(preset.unsupported.some((row) => row.variable === variable), false);
    assert.equal(preset.rows.find((row) => row.variable === variable)?.status, "mapped");
  }
  assert.ok(preset.rows.some((row) => row.variable === "@accordion-title-font-size"));
});

test("unsupported expressions are reported and never guessed into semantic settings", () => {
  const preset = resolveYoothemeLess([
    { name: "base.less", precedence: 1, content: "@global-primary-background: var(--brand); @navbar-gap: 10px;" },
  ]);
  assert.equal(preset.shellSettings.backgroundPrimary, undefined);
  assert.ok(preset.unsupported.some((row) => row.variable === "@global-primary-background"));
  assert.doesNotMatch(JSON.stringify(preset), /uk-[a-z-]+/);
});
