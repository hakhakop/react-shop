import assert from "node:assert/strict";
import test from "node:test";
import { getUikitButtonClass } from "../lib/uikitTokens.ts";
import { mapYoothemeStaticContent } from "../lib/yoothemePageImport.ts";
import { resolveYoothemeLess } from "../lib/yoothemeLessImporter.ts";

const fixture = {
  type: "layout",
  children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [
    { type: "button", props: { button_size: "large", fullwidth: true }, children: [
      { type: "button_item", props: { content: "Default", link: "/default", button_style: "default" } },
      { type: "button_item", props: { content: "Text", link: "/text", button_style: "text", link_target: "blank" } },
    ] },
    { type: "panel", props: { title: "Panel", content: "Body", link: "/panel", link_text: "Read", link_style: "text", link_target: "blank", link_size: "large", link_fullwidth: true, link_margin: "medium" } },
    { type: "grid", props: { link_text: "Read", link_style: "default", link_target: "blank", link_size: "small", link_fullwidth: true, link_margin: "large" }, children: [
      { type: "grid_item", props: { title: "Grid", link: "/grid" } },
    ] },
  ] }] }] }],
};

test("Phase 6 normalizes Button and reusable Panel/Grid action semantics", () => {
  const mapping = mapYoothemeStaticContent(fixture);
  assert.equal(mapping.warnings.length, 0);
  const [button, panel, grid] = mapping.sections[0].layoutItems[0].blocks;

  assert.deepEqual(button.buttons.map((item) => item.style), ["default", "text"]);
  assert.equal(button.fullWidthButton, true);
  assert.equal(button.size, "large");
  assert.equal(getUikitButtonClass("default", "large"), "uk-button uk-button-default uk-button-large");
  assert.equal(getUikitButtonClass("text"), "uk-button uk-button-text");

  // `buttons` is the canonical collection, so importer output cannot fall
  // back to the old singular action owner when it contains multiple actions.
  assert.equal(Object.hasOwn(button, "buttonLabel"), false);

  assert.deepEqual(
    { style: panel.panelActionStyle, size: panel.panelActionSize, target: panel.buttonTarget, full: panel.fullWidthButton, margin: panel.linkMarginTop },
    { style: "text", size: "large", target: "_blank", full: true, margin: "medium" },
  );
  assert.deepEqual(
    { style: grid.buttonStyle, size: grid.size, target: grid.buttonTarget, full: grid.fullWidthButton, margin: grid.linkMarginTop },
    { style: "default", size: "small", target: "_blank", full: true, margin: "large" },
  );
});

test("YOOtheme Button variants remain lossless through the shared UIkit resolver", () => {
  const styles = [
    ["default", "uk-button uk-button-default"],
    ["primary", "uk-button uk-button-primary"],
    ["secondary", "uk-button uk-button-secondary"],
    ["danger", "uk-button uk-button-danger"],
    ["text", "uk-button uk-button-text"],
    ["", "uk-button"],
    ["link-muted", "uk-button uk-link-muted"],
    ["link-text", "uk-button uk-link-text"],
  ];

  const mapping = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "button",
      props: {},
      children: styles.map(([button_style], index) => ({
        type: "button_item",
        props: { button_style, content: `Action ${index + 1}`, link: `/action-${index + 1}` },
      })),
    }] }] }] }],
  });

  const button = mapping.sections[0].layoutItems[0].blocks[0];
  assert.deepEqual(button.buttons.map((item) => item.style), [
    "default",
    "primary",
    "secondary",
    "danger",
    "text",
    "link",
    "link-muted",
    "link-text",
  ]);
  styles.forEach(([sourceStyle, expectedClass], index) => {
    assert.equal(
      getUikitButtonClass(button.buttons[index].style),
      expectedClass,
      `button_style=${JSON.stringify(sourceStyle)} should retain its YOOtheme UIkit treatment`,
    );
  });
});

test("YOOtheme Button globals preserve derived control geometry", () => {
  const preset = resolveYoothemeLess([
    {
      name: "devstack-button-contract.less",
      precedence: 1,
      content: `
        @global-control-height: 48px;
        @global-control-large-height: 56px;
        @button-border-width: 2px;
        @global-gutter: 40px;
        @button-large-font-size: 16px;
      `,
    },
  ]);

  assert.equal(preset.shellSettings.buttonTextTransform, "none");
  assert.equal(preset.shellSettings.buttonLineHeight, "44px");
  assert.equal(preset.shellSettings.buttonLargeLineHeight, "52px");
  assert.equal(preset.shellSettings.buttonLargePaddingX, "40px");
  assert.equal(preset.shellSettings.buttonLargeFontSize, "16px");
});

test("YOOtheme inverse Button tokens preserve their own global semantic owner", () => {
  const preset = resolveYoothemeLess([
    {
      name: "devstack-inverse-button-contract.less",
      precedence: 1,
      content: `
        @inverse-button-default-box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        @inverse-button-primary-box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        @inverse-button-secondary-background: transparent;
        @inverse-button-secondary-color: #ffffff;
        @inverse-button-secondary-hover-background: #ffffff;
        @inverse-button-secondary-active-background: rgba(255, 255, 255, 0.8);
        @inverse-button-secondary-border: #ffffff;
      `,
    },
  ]);

  assert.equal(preset.shellSettings.buttonInverseDefaultShadow, "0 5px 15px rgba(0, 0, 0, 0.2)");
  assert.equal(preset.shellSettings.buttonInversePrimaryShadow, "0 5px 15px rgba(0, 0, 0, 0.2)");
  assert.equal(preset.shellSettings.buttonInverseSecondaryBackground, "transparent");
  assert.equal(preset.shellSettings.buttonInverseSecondaryText, "#ffffff");
  assert.equal(preset.shellSettings.buttonInverseSecondaryHoverBackground, "#ffffff");
  assert.equal(preset.shellSettings.buttonInverseSecondaryActiveBackground, "rgba(255, 255, 255, 0.8)");
  assert.equal(preset.shellSettings.buttonInverseSecondaryBorder, "#ffffff");
});
