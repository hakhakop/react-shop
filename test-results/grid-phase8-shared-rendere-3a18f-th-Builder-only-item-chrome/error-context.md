# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: grid-phase8-shared-renderer.spec.ts >> Phase 8 Grid uses one presentation renderer with Builder-only item chrome
- Location: tests/grid-phase8-shared-renderer.spec.ts:127:5

# Error details

```
Error: Channel closed
```

```
Error: apiRequestContext.post: Test ended.
```

# Page snapshot

```yaml
- generic [active] [ref=f1e1]:
  - main [ref=f1e2]:
    - generic [ref=f1e4]:
      - complementary [ref=f1e5]:
        - generic [ref=f1e6]:
          - generic [ref=f1e7]: BUILDER
          - generic [ref=f1e8]:
            - button "Structure" [ref=f1e9] [cursor=pointer]
            - button "Blocks" [ref=f1e15] [cursor=pointer]
            - button "Layouts" [ref=f1e27] [cursor=pointer]
            - button "Website" [ref=f1e33] [cursor=pointer]
            - button "Pages" [ref=f1e36] [cursor=pointer]
            - button "History" [ref=f1e41] [cursor=pointer]
            - button "Menu" [ref=f1e47] [cursor=pointer]
          - generic "Builder utilities" [ref=f1e50]:
            - button "Hide Inspector" [pressed] [ref=f1e51] [cursor=pointer]:
              - generic [ref=f1e55]: Inspector
            - button "Switch to light mode" [ref=f1e56] [cursor=pointer]:
              - generic [ref=f1e63]: Theme
            - generic "Language" [ref=f1e64] [cursor=pointer]:
              - generic [ref=f1e70]:
                - generic [ref=f1e71]: Language
                - combobox "Language" [ref=f1e72]:
                  - option "English" [selected]
                  - option "Հայերեն"
                  - option "Русский"
            - button "Close Builder panel" [ref=f1e73] [cursor=pointer]:
              - generic [ref=f1e76]: Close
        - generic [ref=f1e77]:
          - generic "Builder page actions" [ref=f1e79]:
            - generic [ref=f1e80]:
              - strong [ref=f1e81]: Unsaved changes
              - generic [ref=f1e82]: Home
            - generic [ref=f1e83]:
              - button "My Websites" [ref=f1e84] [cursor=pointer]
              - generic [ref=f1e87]:
                - generic [ref=f1e88]: "Editing content:"
                - combobox "Editing content:" [ref=f1e89]:
                  - option "Հայերեն" [selected]
              - generic "Preview device" [ref=f1e90]:
                - button "Desktop" [ref=f1e91] [cursor=pointer]
                - button "Tablet" [ref=f1e95] [cursor=pointer]
                - button "Mobile" [ref=f1e99] [cursor=pointer]
              - button "View Page" [ref=f1e103] [cursor=pointer]
              - button "Undo last change" [disabled] [ref=f1e108] [cursor=pointer]
              - button "Redo last change" [disabled] [ref=f1e112] [cursor=pointer]
              - button "Publish" [ref=f1e116] [cursor=pointer]
          - generic [ref=f1e122]:
            - generic [ref=f1e123]:
              - generic [ref=f1e124]:
                - strong [ref=f1e129]: Home
                - generic [ref=f1e130]: PAGE
              - generic [ref=f1e131]:
                - generic [ref=f1e132]: Current page structure
                - generic [ref=f1e133]: 1 section
            - tree "Page structure" [ref=f1e134]:
              - generic [ref=f1e135]:
                - generic [ref=f1e136]:
                  - button "Collapse section" [ref=f1e137] [cursor=pointer]
                  - treeitem "Grid shared-renderer acceptance Section SEC Open section settings Rename section" [ref=f1e140] [cursor=pointer]:
                    - generic "Grid shared-renderer acceptance" [ref=f1e152]:
                      - strong [ref=f1e153]: Grid shared-renderer acceptance
                      - generic [ref=f1e154]: Section
                    - generic [ref=f1e155]:
                      - generic [ref=f1e156]: SEC
                      - generic [ref=f1e157]:
                        - button "Open section settings" [ref=f1e158]
                        - button "Move section up" [disabled] [ref=f1e162]
                        - button "Rename section" [ref=f1e165]
                        - button "Move section down" [disabled] [ref=f1e168]
                        - button "Duplicate section" [ref=f1e171]
                        - button "Delete section" [ref=f1e175]
                - generic [ref=f1e180]:
                  - generic [ref=f1e181]:
                    - button "Collapse row" [ref=f1e182] [cursor=pointer]
                    - treeitem "Row 1 Whole ROW" [ref=f1e185] [cursor=pointer]:
                      - generic "Row 1 (Whole)" [ref=f1e195]:
                        - strong [ref=f1e197]: Row 1
                        - generic [ref=f1e200]: Whole
                      - generic [ref=f1e201]:
                        - generic [ref=f1e202]: ROW
                        - generic:
                          - button "Move row up" [disabled]
                          - button "Move row down" [disabled]
                          - button "Duplicate row"
                  - generic [ref=f1e204]:
                    - treeitem "Col 1 100% 1" [ref=f1e205] [cursor=pointer]:
                      - generic "Column 1 (Column 1)" [ref=f1e215]:
                        - strong [ref=f1e216]: Col 1
                      - generic [ref=f1e217]:
                        - generic [ref=f1e218]: 100%
                        - emphasis [ref=f1e219]: "1"
                    - treeitem "Grid ELM" [selected] [ref=f1e221] [cursor=pointer]:
                      - 'generic "Grid: Open item" [ref=f1e234]':
                        - strong [ref=f1e235]: Grid
                      - generic [ref=f1e236]:
                        - generic [ref=f1e237]: ELM
                        - generic:
                          - button "Move element up (within column)" [disabled]
                          - button "Move element down (within column)" [disabled]
                          - button "Duplicate element"
                          - button "Delete element"
              - button "Add Section" [ref=f1e239] [cursor=pointer]
        - button "Resize dashboard panel" [ref=f1e242]
      - main [ref=f1e243]:
        - generic [ref=f1e245]:
          - generic [ref=f1e246]:
            - generic [ref=f1e247]:
              - generic [ref=f1e251]:
                - generic "Website language" [ref=f1e256]:
                  - generic [ref=f1e257]: 文
                  - combobox "Website language" [ref=f1e258] [cursor=pointer]:
                    - option "Հայերեն" [selected]
                    - option "English"
                    - option "Русский"
                - button "Search" [ref=f1e265] [cursor=pointer]
              - generic [ref=f1e270]:
                - link [ref=f1e276] [cursor=pointer]:
                  - /url: /app/websites/header-parity-site/builder?page=home
                  - img "Header Parity Site logo" [ref=f1e277]
                - button "Toggle navigation menu" [ref=f1e278] [cursor=pointer]
                - generic [ref=f1e285]:
                  - link "Contact Us" [ref=f1e288] [cursor=pointer]:
                    - /url: /contact
                  - button "Cart" [ref=f1e293] [cursor=pointer]
            - generic:
              - generic:
                - generic: Header
                - button "Edit Header"
                - button "Header Settings"
          - generic "Home preview" [ref=f1e301]:
            - button [ref=f1e303] [cursor=pointer]:
              - button "Add section" [ref=f1e305]
              - generic "Row 1" [ref=f1e309]:
                - generic [ref=f1e310]:
                  - button "Select row 1" [ref=f1e311]
                  - article [ref=f1e312]:
                    - generic [ref=f1e313]:
                      - generic [ref=f1e314]:
                        - generic [ref=f1e315]: Grid
                        - button "Edit element" [ref=f1e316]
                        - button "Move element up" [disabled] [ref=f1e320]
                        - button "Move element down" [disabled] [ref=f1e323]
                        - button "Save element as template" [ref=f1e326]
                        - button "Duplicate element" [ref=f1e331]
                        - button "Delete element" [ref=f1e335]
                      - generic: "::"
                      - generic [ref=f1e339]:
                        - list [ref=f1e340]:
                          - listitem [ref=f1e341]:
                            - button "All" [ref=f1e342]
                          - listitem [ref=f1e343]:
                            - button "Product" [ref=f1e344]
                          - listitem [ref=f1e345]:
                            - button "Featured" [ref=f1e346]
                          - listitem [ref=f1e347]:
                            - button "Workflow" [ref=f1e348]
                        - generic [ref=f1e349]:
                          - article [ref=f1e350]:
                            - generic [ref=f1e351]:
                              - button "Edit grid item 1" [ref=f1e352]
                              - button "Duplicate grid item 1" [ref=f1e356]
                              - button "Delete grid item 1" [ref=f1e360]
                            - generic: "::"
                            - generic [ref=f1e364]:
                              - button [ref=f1e366]:
                                - img "Platform <em>Pro</em>" [ref=f1e367]
                              - heading [level=3] [ref=f1e368]:
                                - text: Platform
                                - emphasis [ref=f1e369]: Pro
                              - generic [ref=f1e370]: Product
                              - paragraph [ref=f1e372]:
                                - text: Platform
                                - strong [ref=f1e373]: content
                              - button "Open item" [ref=f1e375]
                          - article [ref=f1e376]:
                            - generic [ref=f1e377]:
                              - button "Edit grid item 3" [ref=f1e378]
                              - button "Duplicate grid item 3" [ref=f1e382]
                              - button "Delete grid item 3" [ref=f1e386]
                            - generic: "::"
                            - generic [ref=f1e390]:
                              - button [ref=f1e392]:
                                - img "Security" [ref=f1e393]
                              - heading "Security" [level=3] [ref=f1e394]
                              - generic [ref=f1e395]: Product
                              - paragraph [ref=f1e396]: Security content
                              - button "Open item" [ref=f1e398]
                - button "Add row" [ref=f1e400]
          - generic "Footer preview" [ref=f1e402]:
            - generic [ref=f1e404]:
              - generic [ref=f1e405]:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - article
                        - article
                        - article
              - generic [ref=f1e410]:
                - article [ref=f1e411]:
                  - generic [ref=f1e413]:
                    - generic [ref=f1e414]: Header Parity Site
                    - generic [ref=f1e415]: A concise closing statement that reinforces what you offer and who you help.
                - article [ref=f1e416]:
                  - generic [ref=f1e418]:
                    - heading "Explore" [level=3] [ref=f1e419]
                    - list [ref=f1e420]:
                      - listitem [ref=f1e421]:
                        - generic [ref=f1e422]: About
                      - listitem [ref=f1e423]:
                        - generic [ref=f1e424]: Services
                      - listitem [ref=f1e425]:
                        - generic [ref=f1e426]: Testimonials
                      - listitem [ref=f1e427]:
                        - generic [ref=f1e428]: Contact
                - article [ref=f1e429]:
                  - generic [ref=f1e431]:
                    - generic [ref=f1e432]: Contact
                    - generic [ref=f1e433]: Start a conversation
                    - generic [ref=f1e434]: hello@example.com +1 000 000 0000
            - button "Edit Footer" [ref=f1e435] [cursor=pointer]
            - generic [ref=f1e436]:
              - generic [ref=f1e437]: Footer
              - button "Edit Footer" [ref=f1e438] [cursor=pointer]
      - generic [ref=f1e442]:
        - generic [ref=f1e443]:
          - generic [ref=f1e444]: Inspector
          - button "Undock Inspector" [ref=f1e453] [cursor=pointer]
        - complementary [ref=f1e457]:
          - generic [ref=f1e458]:
            - generic [ref=f1e459]:
              - generic [ref=f1e460]:
                - strong [ref=f1e461]: Grid · Element
                - button "Back to section" [ref=f1e462] [cursor=pointer]
              - generic [ref=f1e463]:
                - button "Spacing" [ref=f1e464] [cursor=pointer]
                - button "Close inspector" [ref=f1e472] [cursor=pointer]
            - generic "Selection path" [ref=f1e476]:
              - button "Section Layout" [ref=f1e477] [cursor=pointer]
              - generic [ref=f1e478]: /
              - generic [ref=f1e479]: Col 1
              - generic [ref=f1e480]: /
              - strong [ref=f1e481]: Grid
          - generic "Inspector tabs" [ref=f1e482]:
            - button "Content" [ref=f1e483] [cursor=pointer]
            - button "Settings" [ref=f1e484] [cursor=pointer]
            - button "Advanced" [ref=f1e485] [cursor=pointer]
          - generic [ref=f1e486]:
            - generic [ref=f1e487]:
              - generic [ref=f1e488]: ITEMS
              - generic [ref=f1e490]:
                - button "Add item" [ref=f1e491] [cursor=pointer]
                - generic [ref=f1e494]:
                  - button "Drag item 1" [ref=f1e495] [cursor=pointer]: ⠿
                  - button "Edit item 1" [ref=f1e496] [cursor=pointer]:
                    - generic [ref=f1e497]: Item 1
                    - generic [ref=f1e498]: Platform <em>Pro</em>
                  - button "Copy item 1" [ref=f1e499] [cursor=pointer]
                  - button "Delete item 1" [ref=f1e503] [cursor=pointer]
                - generic [ref=f1e508]:
                  - button "Drag item 2" [ref=f1e509] [cursor=pointer]: ⠿
                  - button "Edit item 2" [ref=f1e510] [cursor=pointer]:
                    - generic [ref=f1e511]: Item 2
                    - generic [ref=f1e512]: Automation
                  - button "Copy item 2" [ref=f1e513] [cursor=pointer]
                  - button "Delete item 2" [ref=f1e517] [cursor=pointer]
                - generic [ref=f1e522]:
                  - button "Drag item 3" [ref=f1e523] [cursor=pointer]: ⠿
                  - button "Edit item 3" [ref=f1e524] [cursor=pointer]:
                    - generic [ref=f1e525]: Item 3
                    - generic [ref=f1e526]: Security
                  - button "Copy item 3" [ref=f1e527] [cursor=pointer]
                  - button "Delete item 3" [ref=f1e531] [cursor=pointer]
            - generic [ref=f1e535]:
              - generic [ref=f1e536]: DISPLAY
              - generic [ref=f1e539]:
                - generic [ref=f1e540] [cursor=pointer]:
                  - checkbox "Show the title" [checked] [ref=f1e541]
                  - generic [ref=f1e542]: Show the title
                - generic [ref=f1e543] [cursor=pointer]:
                  - checkbox "Show the meta text" [checked] [ref=f1e544]
                  - generic [ref=f1e545]: Show the meta text
                - generic [ref=f1e546] [cursor=pointer]:
                  - checkbox "Show the content" [checked] [ref=f1e547]
                  - generic [ref=f1e548]: Show the content
                - generic [ref=f1e549] [cursor=pointer]:
                  - checkbox "Show the image" [checked] [ref=f1e550]
                  - generic [ref=f1e551]: Show the image
                - generic [ref=f1e552] [cursor=pointer]:
                  - checkbox "Show the link" [checked] [ref=f1e553]
                  - generic [ref=f1e554]: Show the link
                - generic [ref=f1e555]: Show or hide content fields without the need to delete the content itself.
  - alert [ref=f1e556]
```

# Test source

```ts
  132 |   const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as Record<string, unknown>;
  133 | 
  134 |   expect(mapped.warnings).toEqual([]);
  135 |   expect(grid).toMatchObject({
  136 |     kind: "grid",
  137 |     gridGap: "large",
  138 |     gridRowGap: "small",
  139 |     showDividers: true,
  140 |     centerRows: true,
  141 |     columnsPhonePortrait: "1",
  142 |     columnsPhoneLandscape: "2",
  143 |     columnsTabletLandscape: "3",
  144 |     gridCardVariant: "default",
  145 |     gridCardSize: "large",
  146 |     enableFilter: true,
  147 |     filterStyle: "pill",
  148 |   });
  149 | 
  150 |   // Filter and lightbox are existing canonical Grid controls. The fixture turns
  151 |   // them on here to exercise the shared runtime without inventing source-only state.
  152 |   grid.enableFilter = true;
  153 |   grid.filterStyle = "pill";
  154 |   grid.enableLightbox = true;
  155 |   grid.gridCardHover = true;
  156 | 
  157 |   try {
  158 |     expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
  159 |       data: { key: "home", design: original.design, sections: mapped.sections },
  160 |     })).ok()).toBeTruthy();
  161 | 
  162 |     await page.setViewportSize({ width: 1280, height: 900 });
  163 |     await clearBuilderCache(page);
  164 |     await page.goto(builderUrl);
  165 | 
  166 |     const builderGrid = page.locator(".shop-builder-grid").first();
  167 |     await expect(builderGrid).toHaveCount(1);
  168 |     await expect(page.getByRole("button", { name: "Product", exact: true })).toBeVisible();
  169 |     await page.getByRole("button", { name: "Product", exact: true }).click();
  170 |     await expect(builderGrid.locator("..")).toHaveAttribute("data-grid-active-filter", "Product");
  171 |     await expect(builderGrid.locator("..")).toHaveAttribute("data-grid-visible-item-count", "2");
  172 |     await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(2);
  173 |     await page.getByRole("button", { name: "Featured", exact: true }).click();
  174 |     await expect(builderGrid.locator("..")).toHaveAttribute("data-grid-active-filter", "Featured");
  175 |     await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(1);
  176 |     await page.getByRole("button", { name: "Product", exact: true }).click();
  177 | 
  178 |     const builderBeforeCopy = await gridPresentation(page, true);
  179 |     expect(builderBeforeCopy).toMatchObject({
  180 |       columnGap: "40px",
  181 |       rowGap: "15px",
  182 |       columns: 3,
  183 |       chrome: { edit: 2, duplicate: 2, remove: 2, draggable: 2 },
  184 |     });
  185 |     expect(builderBeforeCopy.classes).toEqual(expect.arrayContaining(["uk-grid-divider", "shop-builder-grid--gap-large"]));
  186 |     expect(builderBeforeCopy.cardClasses).toEqual(expect.arrayContaining([
  187 |       expect.arrayContaining(["uk-card", "uk-card-primary", "uk-card-hover"]),
  188 |     ]));
  189 |     expect(builderBeforeCopy.titleHtml?.[0]).toContain("<em>Pro</em>");
  190 |     expect(builderBeforeCopy.contentHtml?.[0]).toContain("<strong>content</strong>");
  191 |     expect(builderBeforeCopy.contentHtml?.[0]).not.toContain("script");
  192 | 
  193 |     await builderGrid.getByRole("button", { name: "Duplicate grid item 1", exact: true }).click();
  194 |     await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(3);
  195 |     await builderGrid.getByRole("button", { name: "Delete grid item 1", exact: true }).click();
  196 |     await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(2);
  197 |     const cardsAfterCrud = builderGrid.locator(".shop-builder-grid-card");
  198 |     const dragOrderBefore = await cardsAfterCrud.evaluateAll((cards) =>
  199 |       cards.map((card) => card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()),
  200 |     );
  201 |     await cardsAfterCrud.first().dragTo(cardsAfterCrud.nth(1));
  202 |     await expect.poll(() => cardsAfterCrud.evaluateAll((cards) =>
  203 |       cards.map((card) => card.querySelector("h1,h2,h3,h4,h5,h6")?.textContent?.trim()),
  204 |     )).toEqual([...dragOrderBefore].reverse());
  205 | 
  206 |     await page.getByRole("button", { name: "Publish", exact: true }).click();
  207 |     await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();
  208 |     await page.reload();
  209 |     await expect(page.locator(".shop-builder-grid").first()).toBeVisible();
  210 |     await page.getByRole("button", { name: "Product", exact: true }).click();
  211 |     await expect(page.locator(".shop-builder-grid").first().locator(".shop-builder-grid-card")).toHaveCount(2);
  212 | 
  213 |     const storefront = await context.newPage();
  214 |     await storefront.setViewportSize({ width: 1280, height: 900 });
  215 |     await storefront.goto(previewUrl);
  216 |     const storefrontGrid = storefront.locator(".shop-builder-grid").first();
  217 |     await expect(storefrontGrid).toHaveCount(1);
  218 |     await storefront.getByRole("button", { name: "Product", exact: true }).click();
  219 |     await expect(storefrontGrid.locator(".shop-builder-grid-card")).toHaveCount(2);
  220 | 
  221 |     const frontend = await gridPresentation(storefront, false);
  222 |     const builder = await gridPresentation(page, true);
  223 |     expect({ ...builder, chrome: null }).toEqual(frontend);
  224 |     expect(frontend.titleHtml?.join(" ")).toContain("<em>Pro</em>");
  225 |     expect(frontend.contentHtml?.join(" ")).toContain("<strong>content</strong>");
  226 |     expect(frontend.contentHtml?.join(" ")).not.toContain("script");
  227 |     expect(await storefront.locator(".shop-builder-grid-wrapper").first().getAttribute("data-uk-lightbox")).toBe("animation: slide");
  228 |     await storefront.locator(".shop-builder-grid-image a[data-caption]").first().click();
  229 |     await expect(storefront.locator(".uk-lightbox.uk-open")).toHaveCount(1);
  230 |     await storefront.close();
  231 |   } finally {
> 232 |     expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      |                                ^ Error: apiRequestContext.post: Test ended.
  233 |       data: { key: "home", design: original.design, sections: original.sections },
  234 |     })).ok()).toBeTruthy();
  235 |   }
  236 | });
  237 | 
  238 | test("Grid keeps YOOtheme Auto, None, disabled hover, and missing item links semantic", async ({ page, context }) => {
  239 |   await signIn(page);
  240 |   const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  241 |   const original = originalPayload.layout;
  242 |   const autoFixture = structuredClone(fixture);
  243 |   const props = autoFixture.children[0].children[0].children[0].children[0].props;
  244 |   props.grid_default = "auto";
  245 |   props.grid_medium = "4";
  246 |   delete (props as Record<string, unknown>).panel_style;
  247 |   delete (props as Record<string, unknown>).panel_padding;
  248 |   delete (autoFixture.children[0].children[0].children[0].children[0].children[0].props as Record<string, unknown>).panel_style;
  249 |   delete (autoFixture.children[0].children[0].children[0].children[0].children[2].props as Record<string, unknown>).link;
  250 |   const mapped = mapYoothemeStaticContent(autoFixture);
  251 |   const grid = mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as Record<string, unknown>;
  252 | 
  253 |   expect(grid).toMatchObject({
  254 |     columnsPhonePortrait: "auto",
  255 |     columnsTabletLandscape: "4",
  256 |     gridCardVariant: "blank",
  257 |     gridCardSize: "none",
  258 |     gridCardHover: false,
  259 |   });
  260 | 
  261 |   try {
  262 |     expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
  263 |       data: { key: "home", design: original.design, sections: mapped.sections },
  264 |     })).ok()).toBeTruthy();
  265 | 
  266 |     await page.setViewportSize({ width: 1280, height: 900 });
  267 |     await clearBuilderCache(page);
  268 |     await page.goto(builderUrl);
  269 |     const builderGrid = page.locator(".shop-builder-grid").first();
  270 |     await expect(builderGrid).toHaveCount(1);
  271 |     // At Desktop, `grid_medium: 4` owns the layout. The same block must switch
  272 |     // back to YOOtheme Auto semantics at the Phone Portrait tier.
  273 |     await expect(builderGrid).toHaveCSS("display", "grid");
  274 |     await expect(builderGrid.locator(".shop-builder-grid-card")).toHaveCount(3);
  275 |     await expect(builderGrid.locator(".uk-card")).toHaveCount(0);
  276 |     await expect(builderGrid.locator(".uk-card-hover")).toHaveCount(0);
  277 |     await expect(builderGrid.locator(".shop-builder-grid-card--hover-disabled")).toHaveCount(3);
  278 |     await expect(builderGrid.locator(".shop-builder-grid-action")).toHaveCount(2);
  279 |     await expect(builderGrid.locator('.shop-builder-grid-action[href="#"]')).toHaveCount(0);
  280 | 
  281 |     await page.setViewportSize({ width: 500, height: 900 });
  282 |     await expect(builderGrid).toHaveCSS("display", "flex");
  283 | 
  284 |     const storefront = await context.newPage();
  285 |     await storefront.setViewportSize({ width: 500, height: 900 });
  286 |     await storefront.goto(previewUrl);
  287 |     const storefrontGrid = storefront.locator(".shop-builder-grid").first();
  288 |     await expect(storefrontGrid).toHaveCSS("display", "flex");
  289 |     await expect(storefrontGrid.locator(".uk-card")).toHaveCount(0);
  290 |     await expect(storefrontGrid.locator(".uk-card-hover")).toHaveCount(0);
  291 |     await expect(storefrontGrid.locator(".shop-builder-grid-action")).toHaveCount(2);
  292 |     await expect(storefrontGrid.locator('.shop-builder-grid-action[href="#"]')).toHaveCount(0);
  293 |     await storefront.close();
  294 |   } finally {
  295 |     expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
  296 |       data: { key: "home", design: original.design, sections: original.sections },
  297 |     })).ok()).toBeTruthy();
  298 |   }
  299 | });
  300 | 
```