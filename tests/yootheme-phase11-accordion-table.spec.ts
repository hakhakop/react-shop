import { expect, test } from "@playwright/test";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";

const fixture = {
  type: "layout",
  children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [
    {
      type: "accordion",
      props: { multiple: true, collapsible: true, show_image: true, show_link: true, content_style: "lead", content_margin: "large", image_width: 320, image_border: "rounded", image_align: "top", link_text: "Explore", link_style: "secondary", link_size: "large" },
      children: [{ type: "accordion_item", props: { title: "First", content: "<p><strong>Rich</strong> detail</p>", image: "/one.jpg", image_alt: "One", link: "/one", link_text: "Open" } }],
    },
    {
      type: "table",
      props: { show_title: true, show_meta: true, show_content: true, show_image: false, show_link: false, table_order: "6", table_style: "divider", table_hover: true, table_justify: true, table_size: "large", table_vertical_align: true, table_responsive: "responsive", table_last_align: "right", table_head_meta: "Plan", table_head_title: "Name", table_head_content: "Details" },
      children: [{ type: "table_item", props: { title: "Pro", meta: "Popular", content: "<strong>Everything</strong> included" } }],
    },
  ] }] }] }],
};

test("Phase 11.2 maps verified static Accordion and text-cell Table contracts", () => {
  const mapped = mapYoothemeStaticContent(fixture);
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  const [accordion, table] = blocks as any[];

  expect(blocks.map((block) => block.kind)).toEqual(["accordion", "table"]);
  expect(accordion).toMatchObject({
    accordionMultiple: true, accordionCollapsible: true, accordionTitleLevel: "div",
    accordionContentStyle: "lead", accordionContentMarginTop: "large", imageWidth: 320,
    imageBorder: "rounded", accordionMediaPlacement: "top", accordionButtonStyle: "secondary",
    accordionButtonSize: "large",
  });
  expect(accordion.accordionItems[0]).toMatchObject({ title: "First", content: "<p><strong>Rich</strong> detail</p>", imageUrl: "/one.jpg", buttonUrl: "/one", buttonLabel: "Open" });
  expect(table).toMatchObject({
    tableHeadings: ["Plan", "Name", "Details"], tableRows: [["Popular", "Pro", "<strong>Everything</strong> included"]],
    tableColumnFields: ["meta", "title", "content"], tableStyle: "divider", tableSize: "large",
    tableHover: true, tableJustify: true, tableVerticalAlign: true, tableResponsive: "responsive", tableLastAlign: "right",
  });
  expect(mapped.warnings).toEqual([]);
});

test("Phase 11.2 keeps Accordion side-media deferred without suppressing Table media/actions", () => {
  const mapped = mapYoothemeStaticContent({
    ...fixture,
    children: [{ ...fixture.children[0], children: [{ ...fixture.children[0].children[0], children: [{ ...fixture.children[0].children[0].children[0], children: [
      { type: "accordion", props: { image_align: "left", content_column: "1-2" }, children: [] },
      { type: "table", props: { show_image: true, show_link: true }, children: [{ type: "table_item", props: { image: "/one.jpg", link: "/one" } }] },
    ] }] }] }],
  });
  expect(mapped.warnings.join("\n")).toContain("Accordion side-media grid layout");
  expect(mapped.warnings.join("\n")).not.toContain("Table image/action cells");
  const blocks = mapped.sections[0]?.layoutItems?.[0]?.blocks ?? [];
  expect(blocks[1]).toMatchObject({
    tableColumnFields: ["image", "link"],
    tableShowImage: true,
    tableShowLink: true,
    tableItems: [expect.objectContaining({ imageUrl: "/one.jpg", linkUrl: "/one" })],
  });
});

test("Phase 11.2 maps table image/action presentation through the canonical row model", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "table",
      props: {
        show_image: true, show_link: true, image_width: 48, image_height: 32,
        image_loading: true, image_border: "rounded", image_box_shadow: "small",
        link_text: "Read more", link_target: true, link_style: "secondary", link_size: "large", link_fullwidth: true,
      },
      children: [{ type: "table_item", props: { image: "/table.svg", image_alt: "Table icon", link: "/details" } }],
    }] }] }] }],
  });
  const table = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;
  expect(table).toMatchObject({
    tableColumnFields: ["image", "link"], tableImageWidth: 48, tableImageHeight: 32,
    tableImageLoading: "eager", tableImageBorder: "rounded", tableImageShadow: "small",
    tableLinkStyle: "secondary", tableLinkSize: "large", tableLinkFullWidth: true,
    tableItems: [expect.objectContaining({ imageUrl: "/table.svg", imageAlt: "Table icon", linkUrl: "/details", linkLabel: "Read more", linkTarget: "_blank" })],
  });
  expect(mapped.warnings).toEqual([]);
});

test("Phase 11.2 honors source Table image/link visibility without manufacturing cells", () => {
  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "table",
      props: { show_image: false, show_link: false },
      children: [{ type: "table_item", props: { image: "/hidden.svg", link: "/hidden", link_text: "Hidden" } }],
    }] }] }] }],
  });
  const table = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as any;
  expect(table).toMatchObject({
    tableShowImage: false,
    tableShowLink: false,
    tableColumnFields: [],
    tableItems: [expect.not.objectContaining({ imageUrl: expect.anything(), linkUrl: expect.anything() })],
  });
});
