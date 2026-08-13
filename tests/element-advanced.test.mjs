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

test("element CSS translates YOOtheme media selectors and isolates its keyframes", () => {
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

test("YOOtheme .el-element targets the scoped element root, including inside responsive at-rules", () => {
  const scope = elementAdvancedScope({ id: "enterprise-feature-image" });
  const css = scopeElementCss(
    ".el-element { margin-left: -75px; width: 150px; box-shadow: 0 5px 30px rgba(60, 65, 124, .12); border-radius: 30px; max-width: 45vw; }\n@media (max-width: 639px) { .el-element:hover .el-image, .el-link { opacity: .9; } }",
    scope,
  );
  const root = `\\[data-builder-element-scope="${scope}"\\]`;

  assert.match(css, new RegExp(`${root}\\{\\s*margin-left: -75px`));
  assert.doesNotMatch(css, new RegExp(`${root} \\.el-element`));
  assert.match(css, new RegExp(`@media \\(max-width: 639px\\) \\{\\s*${root}:hover \\.el-image, ${root} \\.el-link\\{\\s*opacity: \\.9;\\s*\\}`));
});
