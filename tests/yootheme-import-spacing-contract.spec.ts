import { expect, test } from "@playwright/test";
import {
  getGeneralElementShellClassName,
  getGeneralElementShellStyle,
} from "@/lib/builderElementShell";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

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
  expect(getGeneralElementShellClassName(blocks[1])).toContain("uk-margin");
  expect(getGeneralElementShellClassName(blocks[2])).toContain("uk-margin-medium");
  expect(getGeneralElementShellClassName(blocks[3])).toContain("uk-margin-xlarge");
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
