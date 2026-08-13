# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: enterprise8-semantic-context.spec.ts >> Enterprise8 primary semantic context is shared by Builder and storefront
- Location: tests/enterprise8-semantic-context.spec.ts:67:5

# Error details

```
Error: FAIL: enterprise8
PASS: fixture.hash — expected a5eb1d55153f954ab067c87b69247b9f9e16ee847aded99a333f2cf00b3c6adb; actual a5eb1d55153f954ab067c87b69247b9f9e16ee847aded99a333f2cf00b3c6adb
PASS: builder.persisted-reload-parity — expected yootheme-accordion-1-0-0-0,yootheme-alert-1-0-2-0,yootheme-button-0-0-0-2,yootheme-button-12-2-0-0,yootheme-button-6-0-0-2,yootheme-button-7-2-0-1,yootheme-button-9-0-0-1,yootheme-gallery-3-0-0-0,yootheme-grid-10-0-0-2,yootheme-grid-11-0-1-0,yootheme-grid-12-1-0-0,yootheme-grid-5-1-0-0,yootheme-grid-5-1-2-0,yootheme-grid-6-1-0-0,yootheme-grid-7-2-0-0,yootheme-heading-0-0-0-0,yootheme-heading-10-0-0-0,yootheme-heading-11-0-0-0,yootheme-heading-12-0-0-0,yootheme-heading-5-0-0-0,yootheme-heading-6-0-0-0,yootheme-heading-7-0-0-0,yootheme-heading-8-0-0-0,yootheme-heading-9-0-0-0,yootheme-icon-1-0-1-1,yootheme-image-10-1-0-0,yootheme-image-11-1-0-0,yootheme-image-11-1-0-1,yootheme-image-5-1-1-0,yootheme-image-6-0-1-0,yootheme-image-6-0-1-1,yootheme-image-6-1-0-1,yootheme-image-7-1-0-0,yootheme-image-7-1-0-1,yootheme-image-8-1-0-0,yootheme-image-8-1-0-1,yootheme-image-8-1-1-0,yootheme-image-8-1-1-1,yootheme-list-1-0-1-0,yootheme-overlay-slider-4-0-0-1,yootheme-panel-8-1-0-2,yootheme-panel-8-1-1-2,yootheme-panel-slider-0-0-0-3,yootheme-slideshow-4-0-0-0,yootheme-table-2-0-0-0,yootheme-text-0-0-0-1,yootheme-text-10-0-0-1,yootheme-text-11-0-0-1,yootheme-text-12-0-0-1,yootheme-text-5-0-0-1,yootheme-text-6-0-0-1,yootheme-text-7-0-0-1,yootheme-text-8-0-0-1; actual yootheme-accordion-1-0-0-0,yootheme-alert-1-0-2-0,yootheme-button-0-0-0-2,yootheme-button-12-2-0-0,yootheme-button-6-0-0-2,yootheme-button-7-2-0-1,yootheme-button-9-0-0-1,yootheme-gallery-3-0-0-0,yootheme-grid-10-0-0-2,yootheme-grid-11-0-1-0,yootheme-grid-12-1-0-0,yootheme-grid-5-1-0-0,yootheme-grid-5-1-2-0,yootheme-grid-6-1-0-0,yootheme-grid-7-2-0-0,yootheme-heading-0-0-0-0,yootheme-heading-10-0-0-0,yootheme-heading-11-0-0-0,yootheme-heading-12-0-0-0,yootheme-heading-5-0-0-0,yootheme-heading-6-0-0-0,yootheme-heading-7-0-0-0,yootheme-heading-8-0-0-0,yootheme-heading-9-0-0-0,yootheme-icon-1-0-1-1,yootheme-image-10-1-0-0,yootheme-image-11-1-0-0,yootheme-image-11-1-0-1,yootheme-image-5-1-1-0,yootheme-image-6-0-1-0,yootheme-image-6-0-1-1,yootheme-image-6-1-0-1,yootheme-image-7-1-0-0,yootheme-image-7-1-0-1,yootheme-image-8-1-0-0,yootheme-image-8-1-0-1,yootheme-image-8-1-1-0,yootheme-image-8-1-1-1,yootheme-list-1-0-1-0,yootheme-overlay-slider-4-0-0-1,yootheme-panel-8-1-0-2,yootheme-panel-8-1-1-2,yootheme-panel-slider-0-0-0-3,yootheme-slideshow-4-0-0-0,yootheme-table-2-0-0-0,yootheme-text-0-0-0-1,yootheme-text-10-0-0-1,yootheme-text-11-0-0-1,yootheme-text-12-0-0-1,yootheme-text-5-0-0-1,yootheme-text-6-0-0-1,yootheme-text-7-0-0-1,yootheme-text-8-0-0-1
PASS: storefront.persisted-parity — expected yootheme-accordion-1-0-0-0,yootheme-alert-1-0-2-0,yootheme-button-0-0-0-2,yootheme-button-12-2-0-0,yootheme-button-6-0-0-2,yootheme-button-7-2-0-1,yootheme-button-9-0-0-1,yootheme-gallery-3-0-0-0,yootheme-grid-10-0-0-2,yootheme-grid-11-0-1-0,yootheme-grid-12-1-0-0,yootheme-grid-5-1-0-0,yootheme-grid-5-1-2-0,yootheme-grid-6-1-0-0,yootheme-grid-7-2-0-0,yootheme-heading-0-0-0-0,yootheme-heading-10-0-0-0,yootheme-heading-11-0-0-0,yootheme-heading-12-0-0-0,yootheme-heading-5-0-0-0,yootheme-heading-6-0-0-0,yootheme-heading-7-0-0-0,yootheme-heading-8-0-0-0,yootheme-heading-9-0-0-0,yootheme-icon-1-0-1-1,yootheme-image-10-1-0-0,yootheme-image-11-1-0-0,yootheme-image-11-1-0-1,yootheme-image-5-1-1-0,yootheme-image-6-0-1-0,yootheme-image-6-0-1-1,yootheme-image-6-1-0-1,yootheme-image-7-1-0-0,yootheme-image-7-1-0-1,yootheme-image-8-1-0-0,yootheme-image-8-1-0-1,yootheme-image-8-1-1-0,yootheme-image-8-1-1-1,yootheme-list-1-0-1-0,yootheme-overlay-slider-4-0-0-1,yootheme-panel-8-1-0-2,yootheme-panel-8-1-1-2,yootheme-panel-slider-0-0-0-3,yootheme-slideshow-4-0-0-0,yootheme-table-2-0-0-0,yootheme-text-0-0-0-1,yootheme-text-10-0-0-1,yootheme-text-11-0-0-1,yootheme-text-12-0-0-1,yootheme-text-5-0-0-1,yootheme-text-6-0-0-1,yootheme-text-7-0-0-1,yootheme-text-8-0-0-1; actual yootheme-accordion-1-0-0-0,yootheme-alert-1-0-2-0,yootheme-button-0-0-0-2,yootheme-button-12-2-0-0,yootheme-button-6-0-0-2,yootheme-button-7-2-0-1,yootheme-button-9-0-0-1,yootheme-gallery-3-0-0-0,yootheme-grid-10-0-0-2,yootheme-grid-11-0-1-0,yootheme-grid-12-1-0-0,yootheme-grid-5-1-0-0,yootheme-grid-5-1-2-0,yootheme-grid-6-1-0-0,yootheme-grid-7-2-0-0,yootheme-heading-0-0-0-0,yootheme-heading-10-0-0-0,yootheme-heading-11-0-0-0,yootheme-heading-12-0-0-0,yootheme-heading-5-0-0-0,yootheme-heading-6-0-0-0,yootheme-heading-7-0-0-0,yootheme-heading-8-0-0-0,yootheme-heading-9-0-0-0,yootheme-icon-1-0-1-1,yootheme-image-10-1-0-0,yootheme-image-11-1-0-0,yootheme-image-11-1-0-1,yootheme-image-5-1-1-0,yootheme-image-6-0-1-0,yootheme-image-6-0-1-1,yootheme-image-6-1-0-1,yootheme-image-7-1-0-0,yootheme-image-7-1-0-1,yootheme-image-8-1-0-0,yootheme-image-8-1-0-1,yootheme-image-8-1-1-0,yootheme-image-8-1-1-1,yootheme-list-1-0-1-0,yootheme-overlay-slider-4-0-0-1,yootheme-panel-8-1-0-2,yootheme-panel-8-1-1-2,yootheme-panel-slider-0-0-0-3,yootheme-slideshow-4-0-0-0,yootheme-table-2-0-0-0,yootheme-text-0-0-0-1,yootheme-text-10-0-0-1,yootheme-text-11-0-0-1,yootheme-text-12-0-0-1,yootheme-text-5-0-0-1,yootheme-text-6-0-0-1,yootheme-text-7-0-0-1,yootheme-text-8-0-0-1
FAIL: semantic-context.lead — expected inverse lead is not the former fixed dark color; actual Builder="rgb(255, 255, 255)"; storefront=""
FAIL: semantic-context.accordion — expected inverse Accordion title/content/indicator/divider consume semantic context; actual Builder={"title":"rgb(255, 255, 255)","content":"rgb(255, 255, 255)","indicator":"color(srgb 1 1 1 / 0.7)","divider":"color(srgb 1 1 1 / 0.24)"}; storefront={"title":"","content":"","indicator":"","divider":""}
FAIL: semantic-context.defaultButton — expected YOOtheme inverse Default is a light surface with emphasis text; actual Builder={"color":"rgb(85, 83, 113)","background":"rgb(255, 255, 255)","border":"rgb(255, 255, 255)","shadow":"none"}; storefront={"color":"","background":"","border":"","shadow":""}
FAIL: semantic-context.secondaryButton — expected YOOtheme inverse Secondary is the unglowed inverse outline; actual Builder={"color":"rgb(255, 255, 255)","background":"rgba(0, 0, 0, 0)","border":"rgb(255, 255, 255)","shadow":"none"}; storefront={"color":"","background":"","border":"","shadow":""}
PASS: restoration — expected original persisted document and no test-only Builder blocks; actual restored

expect(received).toBe(expected) // Object.is equality

Expected: "PASS"
Received: "FAIL"
```

# Test source

```ts
  1   | import { expect, test, type Page } from "@playwright/test";
  2   | import {
  3   |   formatFreshImportAcceptanceResult,
  4   |   runRegisteredYoothemeFreshImportAcceptance,
  5   |   type FreshImportCheck,
  6   | } from "@/tests/support/yoothemeFreshImportAcceptance";
  7   | 
  8   | const email = "header-parity-20260722@example.test";
  9   | const password = "HeaderParity!2026";
  10  | 
  11  | test.describe.configure({ mode: "serial" });
  12  | 
  13  | async function signIn(page: Page) {
  14  |   await page.goto("/login");
  15  |   await page.getByLabel("Email", { exact: true }).fill(email);
  16  |   await page.getByLabel("Password", { exact: true }).fill(password);
  17  |   await page.getByRole("button", { name: "Sign in", exact: true }).click();
  18  |   await expect(page).toHaveURL(/\/app(?:\?|$)/);
  19  | }
  20  | 
  21  | type SemanticProbe = {
  22  |   lead: string;
  23  |   defaultButton: { color: string; background: string; border: string; shadow: string } | null;
  24  |   secondaryButton: { color: string; background: string; border: string; shadow: string } | null;
  25  |   accordion: { title: string; content: string; indicator: string; divider: string };
  26  | };
  27  | 
  28  | async function probeSemanticContext(page: Page): Promise<SemanticProbe> {
  29  |   return page.locator(".uk-section-primary").first().evaluate((section) => {
  30  |     const read = (element: Element | null) => {
  31  |       if (!element) return null;
  32  |       const style = getComputedStyle(element);
  33  |       return {
  34  |         color: style.color,
  35  |         background: style.backgroundColor,
  36  |         border: style.borderTopColor,
  37  |         shadow: style.boxShadow,
  38  |       };
  39  |     };
  40  |     const sandbox = document.createElement("div");
  41  |     sandbox.className = "shop-builder-column-block shop-builder-column-block--accordion";
  42  |     sandbox.innerHTML = `
  43  |       <ul class="shop-builder-accordion uk-accordion uk-accordion-default shop-builder-accordion--style-divided shop-builder-accordion--divider">
  44  |         <li><a class="uk-accordion-title" href="#"><span class="shop-builder-accordion-indicator">⌄</span><span class="shop-builder-accordion-title-text">Context title</span></a><div class="uk-accordion-content">Context content</div></li>
  45  |         <li><a class="uk-accordion-title" href="#"><span class="shop-builder-accordion-indicator">⌄</span><span class="shop-builder-accordion-title-text">Second title</span></a><div class="uk-accordion-content">Second content</div></li>
  46  |       </ul>`;
  47  |     section.append(sandbox);
  48  |     const accordion = sandbox.querySelector(".shop-builder-accordion")!;
  49  |     const firstTitle = accordion.querySelector(".uk-accordion-title");
  50  |     const firstContent = accordion.querySelector(".uk-accordion-content");
  51  |     const indicator = accordion.querySelector(".shop-builder-accordion-indicator");
  52  |     const divider = accordion.querySelectorAll("li")[1];
  53  |     return {
  54  |       lead: getComputedStyle(section.querySelector(".shop-builder-column-block--text.uk-text-lead")!).color,
  55  |       defaultButton: read(section.querySelector(".uk-button-default")),
  56  |       secondaryButton: read(section.querySelector(".uk-button-secondary")),
  57  |       accordion: {
  58  |         title: getComputedStyle(firstTitle!).color,
  59  |         content: getComputedStyle(firstContent!).color,
  60  |         indicator: getComputedStyle(indicator!).color,
  61  |         divider: getComputedStyle(divider).borderTopColor,
  62  |       },
  63  |     };
  64  |   });
  65  | }
  66  | 
  67  | test("Enterprise8 primary semantic context is shared by Builder and storefront", async ({ page }) => {
  68  |   const result = await runRegisteredYoothemeFreshImportAcceptance({
  69  |     page,
  70  |     context: page.context(),
  71  |     fixtureId: "enterprise8",
  72  |     authenticate: signIn,
  73  |     probe: async ({ builder, storefront }) => {
  74  |       const builderProbe = await probeSemanticContext(builder);
  75  |       const storefrontProbe = await probeSemanticContext(storefront);
  76  |       const equals = <T,>(key: keyof SemanticProbe, predicate: (value: T) => boolean, expected: string): FreshImportCheck => ({
  77  |         capability: `semantic-context.${String(key)}`,
  78  |         outcome: predicate(builderProbe[key] as T) && JSON.stringify(builderProbe[key]) === JSON.stringify(storefrontProbe[key]) ? "PASS" : "FAIL",
  79  |         expected,
  80  |         actual: `Builder=${JSON.stringify(builderProbe[key])}; storefront=${JSON.stringify(storefrontProbe[key])}`,
  81  |       });
  82  |       return [
  83  |         equals<string>("lead", (color) => color !== "rgb(51, 65, 85)", "inverse lead is not the former fixed dark color"),
  84  |         equals<SemanticProbe["accordion"]>("accordion", (value) =>
  85  |           value.title !== "rgb(0, 0, 0)" && value.content !== "rgb(0, 0, 0)" && value.indicator !== "rgb(0, 0, 0)" && value.divider !== "rgb(0, 0, 0)",
  86  |         "inverse Accordion title/content/indicator/divider consume semantic context"),
  87  |         equals<SemanticProbe["defaultButton"]>("defaultButton", (value) => Boolean(
  88  |           value && value.background === "rgb(255, 255, 255)" && value.color === "rgb(13, 10, 70)",
  89  |         ), "YOOtheme inverse Default is a light surface with emphasis text"),
  90  |         equals<SemanticProbe["secondaryButton"]>("secondaryButton", (value) => Boolean(
  91  |           value && value.background === "rgba(0, 0, 0, 0)" && value.color === "rgb(255, 255, 255)" && value.border === "rgb(255, 255, 255)" && value.shadow === "none",
  92  |         ), "YOOtheme inverse Secondary is the unglowed inverse outline"),
  93  |       ];
  94  |     },
  95  |   });
  96  | 
> 97  |   expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
      |                                                                     ^ Error: FAIL: enterprise8
  98  |   expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
  99  | });
  100 | 
  101 | type GeometryProbe = {
  102 |   text: { width: number; offset: number; centered: boolean } | null;
  103 |   grid: { display: string; alignItems: string; columnGap: number; cardWidth: number; expectedCardWidth: number; lastRowOffset: number; expectedLastRowOffset: number } | null;
  104 |   gridCandidates: Array<{ directCards: number; descendantCards: number }>;
  105 | };
  106 | 
  107 | async function probeTextAndGridGeometry(page: Page): Promise<GeometryProbe> {
  108 |   return page.locator("body").evaluate(() => {
  109 |     const textShell = Array.from(document.querySelectorAll<HTMLElement>(
  110 |       ".shop-builder-element-shell.uk-width-xlarge",
  111 |     )).find((shell) => shell.querySelector(".shop-builder-column-block--text"));
  112 |     const text = textShell ? (() => {
  113 |       const rect = textShell.getBoundingClientRect();
  114 |       const parent = textShell.parentElement!.getBoundingClientRect();
  115 |       const offset = rect.left - parent.left;
  116 |       return {
  117 |         width: rect.width,
  118 |         offset,
  119 |         centered: Math.abs(offset - (parent.width - rect.width) / 2) <= 1,
  120 |       };
  121 |     })() : null;
  122 | 
  123 |     const gridCandidates = Array.from(document.querySelectorAll<HTMLElement>(
  124 |       ".shop-builder-grid--yootheme-column-center",
  125 |     )).map((candidate) => ({
  126 |       directCards: candidate.querySelectorAll(":scope > .shop-builder-grid-card").length,
  127 |       descendantCards: candidate.querySelectorAll(".shop-builder-grid-card").length,
  128 |     }));
  129 |     const grid = Array.from(document.querySelectorAll<HTMLElement>(
  130 |       ".shop-builder-grid--yootheme-column-center",
  131 |     )).find((candidate) => candidate.querySelectorAll(".shop-builder-grid-card").length === 5);
  132 |     const gridMetrics = grid ? (() => {
  133 |       const cards = Array.from(grid.querySelectorAll<HTMLElement>(".shop-builder-grid-card"));
  134 |       const gridRect = grid.getBoundingClientRect();
  135 |       const style = getComputedStyle(grid);
  136 |       const columnGap = Number.parseFloat(style.columnGap);
  137 |       const rows = new Map<number, DOMRect[]>();
  138 |       for (const card of cards) {
  139 |         const rect = card.getBoundingClientRect();
  140 |         const key = Math.round(rect.top);
  141 |         rows.set(key, [...(rows.get(key) ?? []), rect]);
  142 |       }
  143 |       const lastRow = [...rows.entries()].sort(([a], [b]) => a - b).at(-1)?.[1] ?? [];
  144 |       const lastRowWidth = lastRow.reduce((sum, rect) => sum + rect.width, 0) + Math.max(0, lastRow.length - 1) * columnGap;
  145 |       return {
  146 |         display: style.display,
  147 |         alignItems: style.alignItems,
  148 |         columnGap,
  149 |         cardWidth: cards[0]?.getBoundingClientRect().width ?? Number.NaN,
  150 |         expectedCardWidth: (gridRect.width - 2 * columnGap) / 3,
  151 |         lastRowOffset: lastRow[0] ? lastRow[0].left - gridRect.left : Number.NaN,
  152 |         expectedLastRowOffset: (gridRect.width - lastRowWidth) / 2,
  153 |       };
  154 |     })() : null;
  155 |     return { text, grid: gridMetrics, gridCandidates };
  156 |   });
  157 | }
  158 | 
  159 | test("Enterprise8 Text width and Grid alignment use the source UIkit geometry in Builder and storefront", async ({ page }) => {
  160 |   const result = await runRegisteredYoothemeFreshImportAcceptance({
  161 |     page,
  162 |     context: page.context(),
  163 |     fixtureId: "enterprise8",
  164 |     authenticate: signIn,
  165 |     probe: async ({ builder, storefront }) => {
  166 |       const [builderProbe, storefrontProbe] = await Promise.all([
  167 |         probeTextAndGridGeometry(builder),
  168 |         probeTextAndGridGeometry(storefront),
  169 |       ]);
  170 |       const textPass = (probe: GeometryProbe) => Boolean(
  171 |         probe.text
  172 |         && Math.abs(probe.text.width - 600) <= 1
  173 |         && probe.text.centered,
  174 |       );
  175 |       const gridPass = (probe: GeometryProbe) => Boolean(
  176 |         probe.grid
  177 |         && probe.grid.display === "flex"
  178 |         && Math.abs(probe.grid.cardWidth - probe.grid.expectedCardWidth) <= 1
  179 |         && Math.abs(probe.grid.lastRowOffset - probe.grid.expectedLastRowOffset) <= 1,
  180 |       );
  181 |       return [
  182 |         {
  183 |           capability: "text.maxwidth.xlarge",
  184 |           outcome: textPass(builderProbe) && textPass(storefrontProbe) ? "PASS" : "FAIL",
  185 |           expected: "UIkit uk-width-xlarge is a centered 600px text block",
  186 |           actual: `Builder=${JSON.stringify(builderProbe.text)}; storefront=${JSON.stringify(storefrontProbe.text)}`,
  187 |         },
  188 |         {
  189 |           capability: "grid.grid_column_align",
  190 |           outcome: gridPass(builderProbe) && gridPass(storefrontProbe) ? "PASS" : "FAIL",
  191 |           expected: "grid_column_align centers the incomplete final row through uk-flex-center semantics",
  192 |           actual: `Builder=${JSON.stringify(builderProbe.grid)}; storefront=${JSON.stringify(storefrontProbe.grid)}; candidates={Builder:${JSON.stringify(builderProbe.gridCandidates)}, storefront:${JSON.stringify(storefrontProbe.gridCandidates)}}`,
  193 |         },
  194 |       ];
  195 |     },
  196 |   });
  197 | 
```