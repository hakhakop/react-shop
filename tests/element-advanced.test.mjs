import assert from "node:assert/strict";
import test from "node:test";
import {
  elementAdvancedScope,
  parseSafeElementAttributes,
  resolveElementAdvanced,
  scopeElementCss,
} from "../lib/elementAdvanced.ts";

test("shared element Advanced owner persists canonical values and safely parses attributes", () => {
  const block = {
    id: "hero-play-image",
    visualStyle: {
      customClass: "uk-disabled play-image",
      customAttributes: 'data-hero="play"\naria-label="Play video"\nonclick=alert(1)\nstyle=color:red\nsrcdoc=<script>',
      customCss: ".el-image { animation: pulse 2s infinite; margin-top: -42px; }\n@keyframes pulse { 0% { transform: scale(.95); } 100% { transform: scale(1); } }",
    },
  };

  assert.deepEqual(resolveElementAdvanced(block), block.visualStyle);
  assert.deepEqual(parseSafeElementAttributes(block.visualStyle.customAttributes), {
    "data-hero": "play",
    "aria-label": "Play video",
  });
});

test("element CSS scopes YOOtheme .el-image and isolates its keyframes", () => {
  const scope = elementAdvancedScope({ id: "hero-play-image" });
  const css = scopeElementCss(
    ".el-image { border-radius: 50%; animation: pulse 2s infinite; margin-top: -42px; }\n@keyframes pulse { 0% { transform: scale(.95); } 100% { transform: scale(1); } }",
    scope,
  );

  assert.match(css, new RegExp(`\\[data-builder-element-scope="${scope}"\\] \\.el-image`));
  assert.match(css, new RegExp(`animation: ${scope}-pulse 2s infinite`));
  assert.match(css, new RegExp(`@keyframes ${scope}-pulse`));
  assert.doesNotMatch(css, /\[data-builder-element-scope[^}]+100%/);
  assert.doesNotMatch(scopeElementCss("@import url(https://example.test/a.css); .x { color: red; }", scope), /@import/);
});
