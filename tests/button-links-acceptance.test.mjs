import assert from "node:assert/strict";
import test from "node:test";
import { getUikitButtonClass } from "../lib/uikitTokens.ts";
import { resolveCanonicalGridAction } from "../lib/builderActions.ts";
import { mapYoothemeStaticContent } from "../lib/yoothemePageImport.ts";
import { resolveYoothemeLess } from "../lib/yoothemeLessImporter.ts";
import { getUikitGlobalsCssString } from "../lib/uikitGlobals.ts";

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
    // YOOtheme persists its Link selection as an empty value. It remains a
    // bare action link and must not inherit the Button Text arrow treatment.
    ["", "uk-link"],
    ["link-muted", "uk-link-muted"],
    ["link-text", "uk-link-text"],
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

test("Grid Link ownership stays on the Grid unless a source item explicitly overrides it", () => {
  const mapping = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid",
      props: { link_text: "Learn More", link_style: "" },
      children: [
        { type: "grid_item", props: { title: "Inherited", link: "/inherited" } },
        { type: "grid_item", props: { title: "Overridden", link: "/overridden", link_style: "danger" } },
      ],
    }] }] }] }],
  });
  const grid = mapping.sections[0].layoutItems[0].blocks[0];

  assert.equal(grid.buttonStyle, "link");
  assert.equal(grid.gridItems[0].buttonStyle, undefined);
  assert.equal(grid.gridItems[1].buttonStyle, "danger");
  assert.equal(grid.gridItems[1].buttonStyleSource, "item");
  assert.equal(resolveCanonicalGridAction(grid, grid.gridItems[0]).style, "link");
  assert.equal(resolveCanonicalGridAction({ ...grid, buttonStyle: "primary" }, grid.gridItems[0]).style, "primary");
  assert.equal(resolveCanonicalGridAction({ ...grid, buttonStyle: "primary" }, grid.gridItems[1]).style, "danger");
});

test("legacy imported Grid copies no longer override the Grid Link control", () => {
  const block = {
    id: "yootheme-grid-legacy",
    kind: "grid",
    buttonStyle: "secondary",
    gridItems: [
      { id: "a", buttonLabel: "A", buttonUrl: "/a", buttonStyle: "link" },
      { id: "b", buttonLabel: "B", buttonUrl: "/b", buttonStyle: "link" },
    ],
  };
  assert.equal(resolveCanonicalGridAction(block, block.gridItems[0]).style, "secondary");
});

test("the shared Grid action resolver preserves every YOOtheme Link variant", () => {
  const variants = ["default", "primary", "secondary", "danger", "text", "link", "link-muted", "link-text"];
  variants.forEach((variant) => {
    const block = {
      id: "grid-canonical-variants",
      kind: "grid",
      buttonStyle: variant,
      gridItems: [{ id: "item", buttonLabel: "Learn More", buttonUrl: "/learn-more" }],
    };
    const action = resolveCanonicalGridAction(block, block.gridItems[0]);
    assert.equal(action.style, variant, `Grid style ${variant} must not collapse to another variant`);
    if (variant !== "default") {
      assert.notEqual(getUikitButtonClass(action.style), "uk-button uk-button-default", `${variant} must keep its own UIkit treatment`);
    }
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

test("YOOtheme Link uses the global Link color at rest and its own hover token", () => {
  const style = getUikitGlobalsCssString({
    emphasisColor: "#0D0A46",
    linkColor: "#6F40F1",
    linkHoverColor: "#828FFF",
  });
  assert.match(style, /--uk-button-link-color:\s*#6F40F1/);
  assert.match(style, /--uk-button-link-hover-color:\s*#828FFF/);
});
