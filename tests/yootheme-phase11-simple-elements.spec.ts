import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { getUikitAlertClass } from "@/lib/uikitTokens";

const fixture = {
  type: "layout",
  children: [{
    type: "section",
    children: [{
      type: "row",
      children: [{
        type: "column",
        children: [
          {
            type: "alert",
            props: {
              title: "System notice",
              content: "<p><strong>Safe</strong> imported alert copy.</p>",
              link: "/notice",
              link_target: "blank",
              alert_style: "warning",
              alert_size: true,
              title_element: "h2",
              title_style: "heading-small",
              title_inline: true,
              content_style: "lead",
              content_margin: "large",
            },
          },
          {
            type: "icon",
            props: {
              icon: "heart",
              icon_width: 48,
              icon_color: "secondary",
              link: "/love",
              link_target: "blank",
              link_aria_label: "Open love",
              link_style: "button",
            },
          },
          {
            type: "list",
            props: {
              list_type: "horizontal",
              list_horizontal_separator: " / ",
              list_marker: "disc",
              list_style: "divider",
              list_size: "large",
              list_element: "ol",
              html_element: true,
              show_link: true,
              content_style: "lead",
              icon: "check",
              icon_width: 20,
              link_style: "muted",
            },
            children: [
              { type: "list_item", props: { content: "<strong>First</strong>", link: "/first", link_target: "blank", icon: "heart" } },
              { type: "list_item", props: { content: "Second", icon: "arrow-right" } },
            ],
          },
        ],
      }],
    }],
  }],
};

test("Phase 11.1 maps verified static YOOtheme Alert, Icon and List contracts into canonical models", () => {
  const mapped = mapYoothemeStaticContent(fixture);
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  const [alert, icon, list] = blocks as any[];

  expect(blocks.map((block) => block.kind)).toEqual(["alert", "icon", "list"]);
  expect(alert).toMatchObject({
    alertStyle: "warning", alertLarge: true, alertTitleElement: "h2",
    alertTitleStyle: "small", alertTitleInline: true, alertContentStyle: "lead",
    alertContentMargin: "large", alertLinkUrl: "/notice", alertLinkTarget: "_blank",
  });
  expect(alert.body).toContain("<strong>Safe</strong>");
  expect(icon).toMatchObject({
    iconName: "heart", iconSize: 48, iconColorScheme: "secondary",
    iconLinkUrl: "/love", iconLinkTarget: "_blank", iconLinkAriaLabel: "Open love",
    iconLinkStyle: "button",
  });
  expect(list).toMatchObject({
    listType: "horizontal", listHorizontalSeparator: " / ", listPresentation: "divider",
    listSpacing: "large", listElement: "ol", listWrapNav: true, listLinkStyle: "muted",
  });
  expect(list.listItems).toEqual(expect.arrayContaining([
    expect.objectContaining({ text: "<strong>First</strong>", url: "/first", target: "_blank", iconName: "heart" }),
    expect.objectContaining({ text: "Second", iconName: "arrow-right" }),
  ]));
  expect(mapped.warnings).toEqual([]);
});

test("Phase 11.1 reports unavailable icons and deferred List media/column fields without fallback substitution", () => {
  const mapped = mapYoothemeStaticContent({
    ...fixture,
    children: [{
      ...fixture.children[0],
      children: [{
        ...fixture.children[0].children[0],
        children: [{
          ...fixture.children[0].children[0].children[0],
          children: [{ type: "icon", props: { icon: "theme-only-icon" } }, {
            type: "list", props: { image_svg_inline: true, column: "1-3", column_breakpoint: "m" }, children: [],
          }],
        }],
      }],
    }],
  });
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  expect(blocks[0]).toMatchObject({ kind: "icon", iconName: undefined });
  expect(mapped.warnings.join("\n")).toContain("theme-only-icon");
  expect(mapped.warnings.join("\n")).toContain("DEFERRED — List media/column runtime");
});

test("Alert default remains the unmodified UIkit base surface", () => {
  expect(getUikitAlertClass("default")).toBe("uk-alert");
});
