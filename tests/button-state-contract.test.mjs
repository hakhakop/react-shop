import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

test("shared Button state selectors consume configured hover and UIkit active tokens", () => {
  for (const variant of ["default", "primary", "secondary", "danger"]) {
    assert.match(
      css,
      new RegExp(`\\.uk-button-${variant}:active,\\s*\\n\\.shop-builder-main \\.uk-button-${variant}\\.uk-active`),
      `${variant} must consume its active tokens for both :active and UIkit .uk-active`,
    );
  }
  assert.match(css, /\.uk-button-text:active,\s*\n\.shop-builder-main \.uk-button-text\.uk-active/);
  assert.match(css, /\.shop-builder-main \.uk-button-text \{[\s\S]*?padding: 0 25px 0 0;[\s\S]*?border: none;[\s\S]*?border-radius: 0;/);
  assert.match(css, /\.shop-builder-main \.uk-button-text::after \{[\s\S]*?width: 20px;[\s\S]*?height: 20px;[\s\S]*?background-image: var\(--uk-button-text-arrow-image\);/);
  assert.match(css, /\.shop-builder-main \.uk-button-text:hover:not\(:disabled\)::after/);

  for (const declaration of [
    "--uk-button-default-hover-background",
    "--uk-button-default-hover-border",
    "--uk-button-primary-hover-background",
    "--uk-button-primary-hover-border",
    "--uk-button-secondary-hover-background",
    "--uk-button-secondary-hover-border",
    "--uk-button-danger-hover-background",
    "--uk-button-danger-hover-border",
  ]) {
    assert.match(css, new RegExp(`${declaration}[^;]*!important`), `${declaration} must outrank its normal-state declaration`);
  }
});
