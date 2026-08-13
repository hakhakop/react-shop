# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: yootheme-import-spacing-contract.spec.ts >> YOOtheme Grid column and row alignment keep their separate UIkit owners
- Location: tests/yootheme-import-spacing-contract.spec.ts:118:5

# Error details

```
Error: expect(received).toMatchObject(expected)

Matcher error: received value must be a non-null object

Received has value: undefined
```

# Test source

```ts
  28  |           },
  29  |           {
  30  |             type: "panel-slider",
  31  |             props: { margin: "xlarge" },
  32  |             children: [{ type: "panel-slider_item", props: { title: "Slide" } }],
  33  |           },
  34  |         ],
  35  |       }],
  36  |     }],
  37  |   }],
  38  | };
  39  | 
  40  | test("YOOtheme imports own spacing once on the canonical General shell", () => {
  41  |   const mapped = mapYoothemeStaticContent(fixture);
  42  |   const blocks = mapped.sections[0].layoutItems?.[0]?.blocks ?? [];
  43  | 
  44  |   expect(blocks).toHaveLength(4);
  45  |   expect(blocks.map((block) => ({
  46  |     padding: block.elementPadding,
  47  |     contract: block.spacingContract,
  48  |     directMargin: (block as any).margin,
  49  |     directMarginMode: (block as any).marginMode,
  50  |   }))).toEqual([
  51  |     { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
  52  |     { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
  53  |     { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
  54  |     { padding: "none", contract: "yootheme", directMargin: undefined, directMarginMode: undefined },
  55  |   ]);
  56  | 
  57  |   expect(getGeneralElementShellStyle(blocks[2])).toMatchObject({ padding: "0px" });
  58  |   expect(getGeneralElementShellStyle(blocks[1]).margin).toBeUndefined();
  59  |   expect(getGeneralElementShellClassName(blocks[1])).toContain("uk-margin");
  60  |   expect(getGeneralElementShellClassName(blocks[2])).toContain("uk-margin-medium");
  61  |   expect(getGeneralElementShellClassName(blocks[3])).toContain("uk-margin-xlarge");
  62  | });
  63  | 
  64  | test("native elements retain Global Element Padding inheritance", () => {
  65  |   expect(getGeneralElementShellStyle({ id: "native-heading" })).toMatchObject({
  66  |     paddingTop: "var(--builder-global-element-padding-top, 0px)",
  67  |     paddingBottom: "var(--builder-global-element-padding-bottom, 0px)",
  68  |   });
  69  |   expect(getGeneralElementShellClassName({ id: "native-heading" })).toBe("");
  70  | });
  71  | 
  72  | test("legacy imported documents use the same compatibility spacing contract", () => {
  73  |   const legacy = {
  74  |     id: "yootheme-button-1",
  75  |     margin: "medium",
  76  |     visualStyle: { layout: { marginMode: "medium" } },
  77  |   };
  78  |   expect(getGeneralElementShellStyle(legacy)).toMatchObject({ padding: "0px" });
  79  |   expect(getGeneralElementShellClassName(legacy)).toContain("uk-margin-medium");
  80  | });
  81  | 
  82  | test("YOOtheme General max width uses UIkit width utilities, not container tiers", () => {
  83  |   const mapped = mapYoothemeStaticContent({
  84  |     type: "layout",
  85  |     children: [{
  86  |       type: "section",
  87  |       children: [{
  88  |         type: "row",
  89  |         children: [{
  90  |           type: "column",
  91  |           children: [{
  92  |             type: "text",
  93  |             props: {
  94  |               content: "Enterprise8 xlarge text",
  95  |               maxwidth: "xlarge",
  96  |               block_align: "center",
  97  |             },
  98  |           }],
  99  |         }],
  100 |       }],
  101 |     }],
  102 |   });
  103 |   const text = mapped.sections[0].layoutItems?.[0]?.blocks?.[0]!;
  104 | 
  105 |   expect(getGeneralElementShellClassName(text)).toContain("uk-width-xlarge");
  106 |   expect(getGeneralElementShellStyle(text)).toMatchObject({
  107 |     padding: "0px",
  108 |     marginLeft: "auto",
  109 |     marginRight: "auto",
  110 |   });
  111 |   expect(getGeneralElementShellStyle(text).maxWidth).toBeUndefined();
  112 | 
  113 |   const css = renderResponsiveBreakpointPolicyCss(resolveResponsiveBreakpointPolicy());
  114 |   expect(css).toContain("builder-yootheme-width-xlarge-from-medium");
  115 |   expect(css).toContain("--uk-width-xlarge-width,600px");
  116 | });
  117 | 
  118 | test("YOOtheme Grid column and row alignment keep their separate UIkit owners", () => {
  119 |   const mapped = mapYoothemeStaticContent({
  120 |     type: "layout",
  121 |     children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
  122 |       type: "grid",
  123 |       props: { grid_column_align: false, grid_row_align: true },
  124 |       children: [],
  125 |     }] }] }] }],
  126 |   });
  127 |   const grid = mapped.sections[0].layoutItems?.[0]?.blocks?.[0] as any;
> 128 |   expect(grid).toMatchObject({ centerColumns: false, centerRows: true });
      |                ^ Error: expect(received).toMatchObject(expected)
  129 | });
  130 | 
```