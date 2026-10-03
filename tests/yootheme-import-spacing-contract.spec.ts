import { expect, test } from "@playwright/test";
import {
  getGeneralElementShellClassName,
  getGeneralElementShellStyle,
} from "@/lib/builderElementShell";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import {
  renderResponsiveBreakpointPolicyCss,
  resolveResponsiveBreakpointPolicy,
} from "@/lib/responsiveBreakpointPolicy";
import { getUikitCardClass } from "@/lib/uikitTokens";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";

const fixture = {
  type: "layout",
  children: [{
    type: "section",
    props: {},
    children: [{
      type: "row",
      children: [{
        type: "column",
        children: [
          { type: "headline", props: { content: "Heading", margin: "remove-vertical" } },
          { type: "text", props: { content: "Copy", margin: "default" } },
          {
            type: "button",
            props: { margin: "medium" },
            children: [{ type: "button_item", props: { content: "Action", link: "/action" } }],
          },
          {
            type: "panel-slider",
            props: { margin: "xlarge" },
            children: [{ type: "panel-slider_item", props: { title: "Slide" } }],
          },
        ],
      }],
    }],
  }],
};

test("YOOtheme imports own spacing once on the canonical General shell", () => {
  const mapped = mapYoothemeStaticContent(fixture);
  const blocks = mapped.sections[0].layoutItems?.[0]?.blocks ?? [];

  expect(blocks).toHaveLength(4);
  expect(blocks.map((block) => ({
    padding: block.elementPadding,
    contract: block.spacingContract,
    directMargin: (block as any).margin,
    directMarginMode: (block as any).marginMode,
  }))).toEqual([
    { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
    { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
    { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
    { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
  ]);

  expect(getGeneralElementShellStyle(blocks[2])).toMatchObject({ padding: "0px" });
  expect(getGeneralElementShellStyle(blocks[2]).margin).toBeUndefined();
  expect(getGeneralElementShellStyle(blocks[1]).margin).toBeUndefined();
  expect(getGeneralElementShellClassName(blocks[1])).toContain("uk-margin");
  expect(getGeneralElementShellClassName(blocks[2])).toContain("uk-margin-medium");
  expect(getGeneralElementShellClassName(blocks[3])).toContain("uk-margin-xlarge");
});

test("YOOtheme imports independent vertical margins and positioned z-index values", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [
            { type: "headline", props: { content: "Title", margin_top: "small", margin_bottom: "small" } },
            { type: "text", props: { content: "Copy", margin_top: "default", margin_bottom: "large" } },
            { type: "image", props: { image: "surfboard.png", position: "absolute", position_top: "-125px", position_right: "-8vw", position_z_index: "0" } },
          ],
        }],
      }],
    }],
  });
  const blocks = mapped.sections[0].layoutItems?.[0]?.blocks ?? [];

  expect(blocks[0]?.visualStyle?.layout).toMatchObject({
    marginTopMode: "small",
    marginBottomMode: "small",
  });
  expect(getGeneralElementShellClassName(blocks[0]!)).toContain("uk-margin-small-top");
  expect(getGeneralElementShellClassName(blocks[0]!)).toContain("uk-margin-small-bottom");
  expect(blocks[1]?.visualStyle?.layout).toMatchObject({
    marginTopMode: "default",
    marginBottomMode: "large",
  });
  expect(getGeneralElementShellClassName(blocks[1]!)).toContain("uk-margin-top");
  expect(getGeneralElementShellClassName(blocks[1]!)).toContain("uk-margin-large-bottom");
  expect(blocks[2]?.visualStyle?.layout).toMatchObject({
    position: "absolute",
    top: "-125px",
    right: "-8vw",
    zIndex: 0,
  });
  expect(getGeneralElementShellStyle(blocks[2]!).zIndex).toBe(0);
});

test("YOOtheme tile columns use tile padding modifiers and true padding removal", () => {
  expect(getUikitCardClass("tile-default", { padding: "none" })).toContain("uk-padding-remove");
  expect(getUikitCardClass("tile-secondary", { padding: "large" })).toContain("uk-tile-large");
  expect(getUikitCardClass("tile-secondary", { padding: "large" })).not.toContain("uk-padding-large");
});

test("YOOtheme default Button padding stays on its imported Global Style token", () => {
  const imported = resolveYoothemeLess([{
    name: "_import.less",
    precedence: 1,
    content: "@button-padding-horizontal: 20px; @button-font-size: 12px; @button-line-height: 42px;",
  }]);

  expect(imported.shellSettings).toMatchObject({
    buttonPaddingX: "20px",
    buttonFontSize: "12px",
    buttonLineHeight: "42px",
    buttonTextTransform: "uppercase",
  });
  expect(getUikitGlobalsCssVars(imported.shellSettings)["--uk-button-padding-x"]).toBe("20px");
});

test("an unconfigured YOOtheme divider does not invent element margin", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{ type: "column", children: [{ type: "divider", props: {} }] }],
      }],
    }],
  });
  const divider = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;

  expect(divider).toMatchObject({ kind: "divider", spacingContract: "yootheme" });
  expect(divider.margin).toBeUndefined();
});

test("YOOtheme divider imports preserve separate tag and visual style settings", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{ type: "column", children: [{
          type: "divider",
          props: { divider_element: "div", divider_style: "vertical" },
        }] }],
      }],
    }],
  });
  const divider = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;

  expect(divider).toMatchObject({
    kind: "divider",
    dividerElement: "div",
    dividerStyle: "vertical",
    preset: "vertical",
    spacingContract: "yootheme",
  });
});

test("YOOtheme Subnav preserves divider links and authored scroll targets", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{ type: "column", children: [{
          type: "subnav",
          props: { style: "divider" },
          children: [
            { type: "subnav_item", props: { content: "Further questions?", link: "#" } },
            { type: "subnav_item", props: { content: "Visit the Help Center", link: "/?page_id=21" } },
          ],
        }] }],
      }],
    }],
  });
  const subnav = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;

  expect(subnav).toMatchObject({ kind: "subnav", spacingContract: "yootheme", subnavStyle: "divider" });
  expect(subnav.subnavItems).toEqual([
    expect.objectContaining({ label: "Further questions?", url: "#", scroll: true }),
    expect.objectContaining({ label: "Visit the Help Center", url: "/?page_id=21", scroll: false }),
  ]);
});

test("native elements retain Global Element Padding inheritance", () => {
  expect(getGeneralElementShellStyle({ id: "native-heading" })).toMatchObject({
    paddingTop: "var(--builder-global-element-padding-top, 0px)",
    paddingBottom: "var(--builder-global-element-padding-bottom, 0px)",
  });
  expect(getGeneralElementShellClassName({ id: "native-heading" })).toBe("");
});

test("legacy imported documents use the same compatibility spacing contract", () => {
  const legacy = {
    id: "yootheme-button-1",
    margin: "medium",
    visualStyle: { layout: { marginMode: "medium" } },
  };
  expect(getGeneralElementShellStyle(legacy)).toMatchObject({ padding: "0px" });
  expect(getGeneralElementShellClassName(legacy)).toContain("uk-margin-medium");
});

test("YOOtheme General max width uses UIkit width utilities, not container tiers", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{
      type: "section",
      children: [{
        type: "row",
        children: [{
          type: "column",
          children: [{
            type: "text",
            props: {
              content: "Enterprise8 xlarge text",
              maxwidth: "xlarge",
              block_align: "center",
            },
          }],
        }],
      }],
    }],
  });
  const text = mapped.sections[0].layoutItems?.[0]?.blocks?.[0]!;

  expect(getGeneralElementShellClassName(text)).toContain("uk-width-xlarge");
  expect(getGeneralElementShellStyle(text)).toMatchObject({
    padding: "0px",
    marginLeft: "auto",
    marginRight: "auto",
  });
  expect(getGeneralElementShellStyle(text).maxWidth).toBeUndefined();

  const css = renderResponsiveBreakpointPolicyCss(resolveResponsiveBreakpointPolicy());
  expect(css).toContain("builder-yootheme-width-xlarge-from-medium");
  expect(css).toContain("--uk-width-xlarge-width,600px");
});

test("YOOtheme Grid column and row alignment keep their separate UIkit owners", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "grid",
      props: { grid_column_align: false, grid_row_align: true },
      children: [],
    }] }] }] }],
  });
  const grid = mapped.sections[0].layoutItems?.[0]?.blocks?.[0] as any;
  expect(grid).toMatchObject({ centerColumns: false, centerRows: true });
});
