# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: yootheme-import-draft-invalidation.spec.ts >> fresh Home import replaces the matching stale Builder draft
- Location: tests/yootheme-import-draft-invalidation.spec.ts:57:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByText('Unsaved changes', { exact: true })
Expected: 0
Received: 1
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for getByText('Unsaved changes', { exact: true })
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- generic [active] [ref=f3e1]:
  - main [ref=f3e2]:
    - generic [ref=f3e4]:
      - complementary [ref=f3e5]:
        - generic [ref=f3e6]:
          - generic [ref=f3e7]: BUILDER
          - generic [ref=f3e8]:
            - button "Structure" [ref=f3e9] [cursor=pointer]
            - button "Blocks" [ref=f3e15] [cursor=pointer]
            - button "Layouts" [ref=f3e27] [cursor=pointer]
            - button "Website" [ref=f3e33] [cursor=pointer]
            - button "Pages" [ref=f3e36] [cursor=pointer]
            - button "History" [ref=f3e41] [cursor=pointer]
            - button "Menu" [ref=f3e47] [cursor=pointer]
          - generic "Builder utilities" [ref=f3e50]:
            - button "Open Inspector" [disabled] [ref=f3e51]:
              - generic [ref=f3e55]: Inspector
            - button "Switch to light mode" [ref=f3e56] [cursor=pointer]:
              - generic [ref=f3e63]: Theme
            - generic "Language" [ref=f3e64] [cursor=pointer]:
              - generic [ref=f3e70]:
                - generic [ref=f3e71]: Language
                - combobox "Language" [ref=f3e72]:
                  - option "English" [selected]
                  - option "Հայերեն"
                  - option "Русский"
            - button "Close Builder panel" [ref=f3e73] [cursor=pointer]:
              - generic [ref=f3e76]: Close
        - generic [ref=f3e77]:
          - generic "Builder page actions" [ref=f3e79]:
            - generic [ref=f3e80]:
              - strong [ref=f3e81]: Unsaved changes
              - generic [ref=f3e82]: Home
            - generic [ref=f3e83]:
              - button "My Websites" [ref=f3e84] [cursor=pointer]
              - generic [ref=f3e87]:
                - generic [ref=f3e88]: "Editing content:"
                - combobox "Editing content:" [ref=f3e89]:
                  - option "Հայերեն" [selected]
              - generic "Preview device" [ref=f3e90]:
                - button "Desktop" [ref=f3e91] [cursor=pointer]
                - button "Tablet" [ref=f3e95] [cursor=pointer]
                - button "Mobile" [ref=f3e99] [cursor=pointer]
              - button "View Page" [ref=f3e103] [cursor=pointer]
              - button "Undo last change" [disabled] [ref=f3e108] [cursor=pointer]
              - button "Redo last change" [disabled] [ref=f3e112] [cursor=pointer]
              - button "Publish" [ref=f3e116] [cursor=pointer]
          - generic [ref=f3e122]:
            - generic [ref=f3e123]:
              - generic [ref=f3e124]:
                - strong [ref=f3e129]: Home
                - generic [ref=f3e130]: PAGE
              - generic [ref=f3e131]:
                - generic [ref=f3e132]: Current page structure
                - generic [ref=f3e133]: 7 sections
            - tree "Page structure" [ref=f3e134]:
              - generic [ref=f3e135]:
                - generic [ref=f3e136]:
                  - button "Collapse section" [ref=f3e137] [cursor=pointer]
                  - treeitem "Hero Section SEC Open section settings Rename section" [ref=f3e140] [cursor=pointer]:
                    - generic "Hero" [ref=f3e152]:
                      - strong [ref=f3e153]: Hero
                      - generic [ref=f3e154]: Section
                    - generic [ref=f3e155]:
                      - generic [ref=f3e156]: SEC
                      - generic [ref=f3e157]:
                        - button "Open section settings" [ref=f3e158]
                        - button "Move section up" [disabled] [ref=f3e162]
                        - button "Rename section" [ref=f3e165]
                        - button "Move section down" [ref=f3e168]
                        - button "Duplicate section" [ref=f3e171]
                        - button "Delete section" [ref=f3e175]
                - generic [ref=f3e179]:
                  - generic [ref=f3e180]:
                    - generic [ref=f3e181]:
                      - button "Collapse row" [ref=f3e182] [cursor=pointer]
                      - treeitem "Row 1 Whole ROW" [ref=f3e185] [cursor=pointer]:
                        - generic "Row 1 (Whole)" [ref=f3e195]:
                          - strong [ref=f3e197]: Row 1
                          - generic [ref=f3e200]: Whole
                        - generic [ref=f3e201]:
                          - generic [ref=f3e202]: ROW
                          - generic:
                            - button "Move row up" [disabled]
                            - button "Move row down"
                            - button "Duplicate row"
                    - generic [ref=f3e204]:
                      - treeitem "Col 1 100% 8" [ref=f3e205] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e215]:
                          - strong [ref=f3e216]: Col 1
                        - generic [ref=f3e217]:
                          - generic [ref=f3e218]: 100%
                          - emphasis [ref=f3e219]: "8"
                      - generic [ref=f3e220]:
                        - treeitem "Heading ELM" [ref=f3e221] [cursor=pointer]:
                          - 'generic "Heading: Build Anything on DevStack" [ref=f3e231]':
                            - strong [ref=f3e232]: Heading
                          - generic [ref=f3e233]:
                            - generic [ref=f3e234]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Text ELM" [ref=f3e235] [cursor=pointer]:
                          - generic "Text 2" [ref=f3e245]:
                            - strong [ref=f3e246]: Text
                          - generic [ref=f3e247]:
                            - generic [ref=f3e248]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Button ELM" [ref=f3e249] [cursor=pointer]:
                          - generic "Button 3" [ref=f3e263]:
                            - strong [ref=f3e264]: Button
                          - generic [ref=f3e265]:
                            - generic [ref=f3e266]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e267] [cursor=pointer]:
                          - generic "Image 4" [ref=f3e279]:
                            - strong [ref=f3e280]: Image
                          - generic [ref=f3e281]:
                            - generic [ref=f3e282]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e283] [cursor=pointer]:
                          - generic "Image 5" [ref=f3e295]:
                            - strong [ref=f3e296]: Image
                          - generic [ref=f3e297]:
                            - generic [ref=f3e298]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e299] [cursor=pointer]:
                          - generic "Image 6" [ref=f3e311]:
                            - strong [ref=f3e312]: Image
                          - generic [ref=f3e313]:
                            - generic [ref=f3e314]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e315] [cursor=pointer]:
                          - generic "Image 7" [ref=f3e327]:
                            - strong [ref=f3e328]: Image
                          - generic [ref=f3e329]:
                            - generic [ref=f3e330]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e331] [cursor=pointer]:
                          - generic "Image 8" [ref=f3e343]:
                            - strong [ref=f3e344]: Image
                          - generic [ref=f3e345]:
                            - generic [ref=f3e346]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
                  - generic [ref=f3e347]:
                    - generic [ref=f3e348]:
                      - button "Collapse row" [ref=f3e349] [cursor=pointer]
                      - treeitem "Row 2 Whole ROW" [ref=f3e352] [cursor=pointer]:
                        - generic "Row 2 (Whole)" [ref=f3e362]:
                          - strong [ref=f3e364]: Row 2
                          - generic [ref=f3e367]: Whole
                        - generic [ref=f3e368]:
                          - generic [ref=f3e369]: ROW
                          - generic:
                            - button "Move row up"
                            - button "Move row down" [disabled]
                            - button "Duplicate row"
                    - generic [ref=f3e371]:
                      - treeitem "Col 1 100% 2" [ref=f3e372] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e382]:
                          - strong [ref=f3e383]: Col 1
                        - generic [ref=f3e384]:
                          - generic [ref=f3e385]: 100%
                          - emphasis [ref=f3e386]: "2"
                      - generic [ref=f3e387]:
                        - treeitem "Image ELM" [ref=f3e388] [cursor=pointer]:
                          - generic "Image 1" [ref=f3e400]:
                            - strong [ref=f3e401]: Image
                          - generic [ref=f3e402]:
                            - generic [ref=f3e403]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e404] [cursor=pointer]:
                          - generic "Image 2" [ref=f3e416]:
                            - strong [ref=f3e417]: Image
                          - generic [ref=f3e418]:
                            - generic [ref=f3e419]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
              - generic [ref=f3e420]:
                - generic [ref=f3e421]:
                  - button "Collapse section" [ref=f3e422] [cursor=pointer]
                  - treeitem "Clients Section SEC Open section settings Rename section" [ref=f3e425] [cursor=pointer]:
                    - generic "Clients" [ref=f3e437]:
                      - strong [ref=f3e438]: Clients
                      - generic [ref=f3e439]: Section
                    - generic [ref=f3e440]:
                      - generic [ref=f3e441]: SEC
                      - generic [ref=f3e442]:
                        - button "Open section settings" [ref=f3e443]
                        - button "Move section up" [ref=f3e447]
                        - button "Rename section" [ref=f3e450]
                        - button "Move section down" [ref=f3e453]
                        - button "Duplicate section" [ref=f3e456]
                        - button "Delete section" [ref=f3e460]
                - generic [ref=f3e465]:
                  - generic [ref=f3e466]:
                    - button "Collapse row" [ref=f3e467] [cursor=pointer]
                    - treeitem "Row 1 Whole ROW" [ref=f3e470] [cursor=pointer]:
                      - generic "Row 1 (Whole)" [ref=f3e480]:
                        - strong [ref=f3e482]: Row 1
                        - generic [ref=f3e485]: Whole
                      - generic [ref=f3e486]:
                        - generic [ref=f3e487]: ROW
                        - generic:
                          - button "Move row up" [disabled]
                          - button "Move row down" [disabled]
                          - button "Duplicate row"
                  - generic [ref=f3e489]:
                    - treeitem "Col 1 100% 2" [ref=f3e490] [cursor=pointer]:
                      - generic "Column 1 (Column 1)" [ref=f3e500]:
                        - strong [ref=f3e501]: Col 1
                      - generic [ref=f3e502]:
                        - generic [ref=f3e503]: 100%
                        - emphasis [ref=f3e504]: "2"
                    - generic [ref=f3e505]:
                      - treeitem "Heading ELM" [ref=f3e506] [cursor=pointer]:
                        - 'generic "Heading: DevStack Is Trusted by Professionals Around the World" [ref=f3e516]':
                          - strong [ref=f3e517]: Heading
                        - generic [ref=f3e518]:
                          - generic [ref=f3e519]: ELM
                          - generic:
                            - button "Move element up (within column)" [disabled]
                            - button "Move element down (within column)"
                            - button "Duplicate element"
                            - button "Delete element"
                      - treeitem "Grid ELM" [ref=f3e520] [cursor=pointer]:
                        - 'generic "Grid: Read more" [ref=f3e533]':
                          - strong [ref=f3e534]: Grid
                        - generic [ref=f3e535]:
                          - generic [ref=f3e536]: ELM
                          - generic:
                            - button "Move element up (within column)"
                            - button "Move element down (within column)" [disabled]
                            - button "Duplicate element"
                            - button "Delete element"
              - generic [ref=f3e537]:
                - generic [ref=f3e538]:
                  - button "Collapse section" [ref=f3e539] [cursor=pointer]
                  - treeitem "How It Works Section SEC Open section settings Rename section" [ref=f3e542] [cursor=pointer]:
                    - generic "How It Works" [ref=f3e554]:
                      - strong [ref=f3e555]: How It Works
                      - generic [ref=f3e556]: Section
                    - generic [ref=f3e557]:
                      - generic [ref=f3e558]: SEC
                      - generic [ref=f3e559]:
                        - button "Open section settings" [ref=f3e560]
                        - button "Move section up" [ref=f3e564]
                        - button "Rename section" [ref=f3e567]
                        - button "Move section down" [ref=f3e570]
                        - button "Duplicate section" [ref=f3e573]
                        - button "Delete section" [ref=f3e577]
                - generic [ref=f3e581]:
                  - generic [ref=f3e582]:
                    - generic [ref=f3e583]:
                      - button "Collapse row" [ref=f3e584] [cursor=pointer]
                      - treeitem "Row 1 Whole ROW" [ref=f3e587] [cursor=pointer]:
                        - generic "Row 1 (Whole)" [ref=f3e597]:
                          - strong [ref=f3e599]: Row 1
                          - generic [ref=f3e602]: Whole
                        - generic [ref=f3e603]:
                          - generic [ref=f3e604]: ROW
                          - generic:
                            - button "Move row up" [disabled]
                            - button "Move row down"
                            - button "Duplicate row"
                    - generic [ref=f3e606]:
                      - treeitem "Col 1 100% 2" [ref=f3e607] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e617]:
                          - strong [ref=f3e618]: Col 1
                        - generic [ref=f3e619]:
                          - generic [ref=f3e620]: 100%
                          - emphasis [ref=f3e621]: "2"
                      - generic [ref=f3e622]:
                        - treeitem "Heading ELM" [ref=f3e623] [cursor=pointer]:
                          - 'generic "Heading: How does it work?" [ref=f3e633]':
                            - strong [ref=f3e634]: Heading
                          - generic [ref=f3e635]:
                            - generic [ref=f3e636]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Text ELM" [ref=f3e637] [cursor=pointer]:
                          - generic "Text 2" [ref=f3e647]:
                            - strong [ref=f3e648]: Text
                          - generic [ref=f3e649]:
                            - generic [ref=f3e650]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
                  - generic [ref=f3e651]:
                    - generic [ref=f3e652]:
                      - button "Collapse row" [ref=f3e653] [cursor=pointer]
                      - treeitem "Row 2 Thirds ROW" [ref=f3e656] [cursor=pointer]:
                        - generic "Row 2 (Thirds)" [ref=f3e666]:
                          - strong [ref=f3e668]: Row 2
                          - generic [ref=f3e673]: Thirds
                        - generic [ref=f3e674]:
                          - generic [ref=f3e675]: ROW
                          - generic:
                            - button "Move row up"
                            - button "Move row down" [disabled]
                            - button "Duplicate row"
                    - generic [ref=f3e676]:
                      - generic [ref=f3e677]:
                        - treeitem "Col 1 33% 2" [ref=f3e678] [cursor=pointer]:
                          - generic "Column 1 (Column 1)":
                            - strong: Col 1
                          - generic [ref=f3e688]:
                            - generic [ref=f3e689]: 33%
                            - emphasis [ref=f3e690]: "2"
                        - generic [ref=f3e691]:
                          - treeitem "Image ELM" [ref=f3e692] [cursor=pointer]:
                            - generic "Image 1" [ref=f3e704]:
                              - strong [ref=f3e705]: Image
                            - generic [ref=f3e706]:
                              - generic [ref=f3e707]: ELM
                              - generic:
                                - button "Move element up (within column)" [disabled]
                                - button "Move element down (within column)"
                                - button "Duplicate element"
                                - button "Delete element"
                          - treeitem "Panel ELM" [ref=f3e708] [cursor=pointer]:
                            - 'generic "Panel: Integrate" [ref=f3e719]':
                              - strong [ref=f3e720]: Panel
                            - generic [ref=f3e721]:
                              - generic [ref=f3e722]: ELM
                              - generic:
                                - button "Move element up (within column)"
                                - button "Move element down (within column)" [disabled]
                                - button "Duplicate element"
                                - button "Delete element"
                      - generic [ref=f3e723]:
                        - treeitem "Col 2 33% 2" [ref=f3e724] [cursor=pointer]:
                          - generic "Column 2 (Column 2)":
                            - strong: Col 2
                          - generic [ref=f3e734]:
                            - generic [ref=f3e735]: 33%
                            - emphasis [ref=f3e736]: "2"
                        - generic [ref=f3e737]:
                          - treeitem "Image ELM" [ref=f3e738] [cursor=pointer]:
                            - generic "Image 1" [ref=f3e750]:
                              - strong [ref=f3e751]: Image
                            - generic [ref=f3e752]:
                              - generic [ref=f3e753]: ELM
                              - generic:
                                - button "Move element up (within column)" [disabled]
                                - button "Move element down (within column)"
                                - button "Duplicate element"
                                - button "Delete element"
                          - treeitem "Panel ELM" [ref=f3e754] [cursor=pointer]:
                            - 'generic "Panel: Automate" [ref=f3e765]':
                              - strong [ref=f3e766]: Panel
                            - generic [ref=f3e767]:
                              - generic [ref=f3e768]: ELM
                              - generic:
                                - button "Move element up (within column)"
                                - button "Move element down (within column)" [disabled]
                                - button "Duplicate element"
                                - button "Delete element"
                      - generic [ref=f3e769]:
                        - treeitem "Col 3 33% 2" [ref=f3e770] [cursor=pointer]:
                          - generic "Column 3 (Column 3)":
                            - strong: Col 3
                          - generic [ref=f3e780]:
                            - generic [ref=f3e781]: 33%
                            - emphasis [ref=f3e782]: "2"
                        - generic [ref=f3e783]:
                          - treeitem "Image ELM" [ref=f3e784] [cursor=pointer]:
                            - generic "Image 1" [ref=f3e796]:
                              - strong [ref=f3e797]: Image
                            - generic [ref=f3e798]:
                              - generic [ref=f3e799]: ELM
                              - generic:
                                - button "Move element up (within column)" [disabled]
                                - button "Move element down (within column)"
                                - button "Duplicate element"
                                - button "Delete element"
                          - treeitem "Panel ELM" [ref=f3e800] [cursor=pointer]:
                            - 'generic "Panel: Innovate" [ref=f3e811]':
                              - strong [ref=f3e812]: Panel
                            - generic [ref=f3e813]:
                              - generic [ref=f3e814]: ELM
                              - generic:
                                - button "Move element up (within column)"
                                - button "Move element down (within column)" [disabled]
                                - button "Duplicate element"
                                - button "Delete element"
              - generic [ref=f3e815]:
                - generic [ref=f3e816]:
                  - button "Collapse section" [ref=f3e817] [cursor=pointer]
                  - treeitem "Feature Grid Section SEC Open section settings Rename section" [ref=f3e820] [cursor=pointer]:
                    - generic "Feature Grid" [ref=f3e832]:
                      - strong [ref=f3e833]: Feature Grid
                      - generic [ref=f3e834]: Section
                    - generic [ref=f3e835]:
                      - generic [ref=f3e836]: SEC
                      - generic [ref=f3e837]:
                        - button "Open section settings" [ref=f3e838]
                        - button "Move section up" [ref=f3e842]
                        - button "Rename section" [ref=f3e845]
                        - button "Move section down" [ref=f3e848]
                        - button "Duplicate section" [ref=f3e851]
                        - button "Delete section" [ref=f3e855]
                - generic [ref=f3e859]:
                  - generic [ref=f3e860]:
                    - generic [ref=f3e861]:
                      - button "Collapse row" [ref=f3e862] [cursor=pointer]
                      - treeitem "Row 1 Whole ROW" [ref=f3e865] [cursor=pointer]:
                        - generic "Row 1 (Whole)" [ref=f3e875]:
                          - strong [ref=f3e877]: Row 1
                          - generic [ref=f3e880]: Whole
                        - generic [ref=f3e881]:
                          - generic [ref=f3e882]: ROW
                          - generic:
                            - button "Move row up" [disabled]
                            - button "Move row down"
                            - button "Duplicate row"
                    - generic [ref=f3e884]:
                      - treeitem "Col 1 100% 3" [ref=f3e885] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e895]:
                          - strong [ref=f3e896]: Col 1
                        - generic [ref=f3e897]:
                          - generic [ref=f3e898]: 100%
                          - emphasis [ref=f3e899]: "3"
                      - generic [ref=f3e900]:
                        - treeitem "Heading ELM" [ref=f3e901] [cursor=pointer]:
                          - 'generic "Heading: The Best Tools from the Leading DevOps Platform" [ref=f3e911]':
                            - strong [ref=f3e912]: Heading
                          - generic [ref=f3e913]:
                            - generic [ref=f3e914]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Text ELM" [ref=f3e915] [cursor=pointer]:
                          - generic "Text 2" [ref=f3e925]:
                            - strong [ref=f3e926]: Text
                          - generic [ref=f3e927]:
                            - generic [ref=f3e928]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Grid ELM" [ref=f3e929] [cursor=pointer]:
                          - 'generic "Grid: Learn More" [ref=f3e942]':
                            - strong [ref=f3e943]: Grid
                          - generic [ref=f3e944]:
                            - generic [ref=f3e945]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
                  - generic [ref=f3e946]:
                    - generic [ref=f3e947]:
                      - button "Collapse row" [ref=f3e948] [cursor=pointer]
                      - treeitem "Row 2 Whole ROW" [ref=f3e951] [cursor=pointer]:
                        - generic "Row 2 (Whole)" [ref=f3e961]:
                          - strong [ref=f3e963]: Row 2
                          - generic [ref=f3e966]: Whole
                        - generic [ref=f3e967]:
                          - generic [ref=f3e968]: ROW
                          - generic:
                            - button "Move row up"
                            - button "Move row down" [disabled]
                            - button "Duplicate row"
                    - generic [ref=f3e970]:
                      - treeitem "Col 1 100% 2" [ref=f3e971] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e981]:
                          - strong [ref=f3e982]: Col 1
                        - generic [ref=f3e983]:
                          - generic [ref=f3e984]: 100%
                          - emphasis [ref=f3e985]: "2"
                      - generic [ref=f3e986]:
                        - treeitem "Image ELM" [ref=f3e987] [cursor=pointer]:
                          - generic "Image 1" [ref=f3e999]:
                            - strong [ref=f3e1000]: Image
                          - generic [ref=f3e1001]:
                            - generic [ref=f3e1002]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e1003] [cursor=pointer]:
                          - generic "Image 2" [ref=f3e1015]:
                            - strong [ref=f3e1016]: Image
                          - generic [ref=f3e1017]:
                            - generic [ref=f3e1018]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
              - generic [ref=f3e1019]:
                - generic [ref=f3e1020]:
                  - button "Collapse section" [ref=f3e1021] [cursor=pointer]
                  - treeitem "Testimonials Section SEC Open section settings Rename section" [ref=f3e1024] [cursor=pointer]:
                    - generic "Testimonials" [ref=f3e1036]:
                      - strong [ref=f3e1037]: Testimonials
                      - generic [ref=f3e1038]: Section
                    - generic [ref=f3e1039]:
                      - generic [ref=f3e1040]: SEC
                      - generic [ref=f3e1041]:
                        - button "Open section settings" [ref=f3e1042]
                        - button "Move section up" [ref=f3e1046]
                        - button "Rename section" [ref=f3e1049]
                        - button "Move section down" [ref=f3e1052]
                        - button "Duplicate section" [ref=f3e1055]
                        - button "Delete section" [ref=f3e1059]
                - generic [ref=f3e1063]:
                  - generic [ref=f3e1064]:
                    - generic [ref=f3e1065]:
                      - button "Collapse row" [ref=f3e1066] [cursor=pointer]
                      - treeitem "Row 1 Halves ROW" [ref=f3e1069] [cursor=pointer]:
                        - generic "Row 1 (Halves)" [ref=f3e1079]:
                          - strong [ref=f3e1081]: Row 1
                          - generic [ref=f3e1085]: Halves
                        - generic [ref=f3e1086]:
                          - generic [ref=f3e1087]: ROW
                          - generic:
                            - button "Move row up" [disabled]
                            - button "Move row down"
                            - button "Duplicate row"
                    - generic [ref=f3e1088]:
                      - generic [ref=f3e1089]:
                        - treeitem "Col 1 50% 1" [ref=f3e1090] [cursor=pointer]:
                          - generic "Column 1 (Column 1)" [ref=f3e1100]:
                            - strong [ref=f3e1101]: Col 1
                          - generic [ref=f3e1102]:
                            - generic [ref=f3e1103]: 50%
                            - emphasis [ref=f3e1104]: "1"
                        - treeitem "Heading ELM" [ref=f3e1106] [cursor=pointer]:
                          - 'generic "Heading: Reach Your Digital Goals With a Solution Trusted by Many Industry Experts" [ref=f3e1116]':
                            - strong [ref=f3e1117]: Heading
                          - generic [ref=f3e1118]:
                            - generic [ref=f3e1119]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
                      - generic [ref=f3e1120]:
                        - treeitem "Col 2 50% 1" [ref=f3e1121] [cursor=pointer]:
                          - generic "Column 2 (Column 2)" [ref=f3e1131]:
                            - strong [ref=f3e1132]: Col 2
                          - generic [ref=f3e1133]:
                            - generic [ref=f3e1134]: 50%
                            - emphasis [ref=f3e1135]: "1"
                        - treeitem "Button ELM" [ref=f3e1137] [cursor=pointer]:
                          - generic "Button 1" [ref=f3e1151]:
                            - strong [ref=f3e1152]: Button
                          - generic [ref=f3e1153]:
                            - generic [ref=f3e1154]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
                  - generic [ref=f3e1155]:
                    - generic [ref=f3e1156]:
                      - button "Collapse row" [ref=f3e1157] [cursor=pointer]
                      - treeitem "Row 2 Whole ROW" [ref=f3e1160] [cursor=pointer]:
                        - generic "Row 2 (Whole)" [ref=f3e1170]:
                          - strong [ref=f3e1172]: Row 2
                          - generic [ref=f3e1175]: Whole
                        - generic [ref=f3e1176]:
                          - generic [ref=f3e1177]: ROW
                          - generic:
                            - button "Move row up"
                            - button "Move row down" [disabled]
                            - button "Duplicate row"
                    - generic [ref=f3e1179]:
                      - treeitem "Col 1 100% 1" [ref=f3e1180] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e1190]:
                          - strong [ref=f3e1191]: Col 1
                        - generic [ref=f3e1192]:
                          - generic [ref=f3e1193]: 100%
                          - emphasis [ref=f3e1194]: "1"
                      - treeitem "Panel Slider ELM" [ref=f3e1196] [cursor=pointer]:
                        - generic "Panel Slider 1" [ref=f3e1205]:
                          - strong [ref=f3e1206]: Panel Slider
                        - generic [ref=f3e1207]:
                          - generic [ref=f3e1208]: ELM
                          - generic:
                            - button "Move element up (within column)" [disabled]
                            - button "Move element down (within column)" [disabled]
                            - button "Duplicate element"
                            - button "Delete element"
              - generic [ref=f3e1209]:
                - generic [ref=f3e1210]:
                  - button "Collapse section" [ref=f3e1211] [cursor=pointer]
                  - treeitem "Call to Action Section SEC Open section settings Rename section" [ref=f3e1214] [cursor=pointer]:
                    - generic "Call to Action" [ref=f3e1226]:
                      - strong [ref=f3e1227]: Call to Action
                      - generic [ref=f3e1228]: Section
                    - generic [ref=f3e1229]:
                      - generic [ref=f3e1230]: SEC
                      - generic [ref=f3e1231]:
                        - button "Open section settings" [ref=f3e1232]
                        - button "Move section up" [ref=f3e1236]
                        - button "Rename section" [ref=f3e1239]
                        - button "Move section down" [ref=f3e1242]
                        - button "Duplicate section" [ref=f3e1245]
                        - button "Delete section" [ref=f3e1249]
                - generic [ref=f3e1253]:
                  - generic [ref=f3e1254]:
                    - generic [ref=f3e1255]:
                      - button "Collapse row" [ref=f3e1256] [cursor=pointer]
                      - treeitem "Row 1 Whole ROW" [ref=f3e1259] [cursor=pointer]:
                        - generic "Row 1 (Whole)" [ref=f3e1269]:
                          - strong [ref=f3e1271]: Row 1
                          - generic [ref=f3e1274]: Whole
                        - generic [ref=f3e1275]:
                          - generic [ref=f3e1276]: ROW
                          - generic:
                            - button "Move row up" [disabled]
                            - button "Move row down"
                            - button "Duplicate row"
                    - generic [ref=f3e1278]:
                      - treeitem "Col 1 100% 1" [ref=f3e1279] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e1289]:
                          - strong [ref=f3e1290]: Col 1
                        - generic [ref=f3e1291]:
                          - generic [ref=f3e1292]: 100%
                          - emphasis [ref=f3e1293]: "1"
                      - treeitem "Heading ELM" [ref=f3e1295] [cursor=pointer]:
                        - 'generic "Heading: Reinvent Your Business With DevStack Solutions" [ref=f3e1305]':
                          - strong [ref=f3e1306]: Heading
                        - generic [ref=f3e1307]:
                          - generic [ref=f3e1308]: ELM
                          - generic:
                            - button "Move element up (within column)" [disabled]
                            - button "Move element down (within column)" [disabled]
                            - button "Duplicate element"
                            - button "Delete element"
                  - generic [ref=f3e1309]:
                    - generic [ref=f3e1310]:
                      - button "Collapse row" [ref=f3e1311] [cursor=pointer]
                      - treeitem "Row 2 Whole ROW" [ref=f3e1314] [cursor=pointer]:
                        - generic "Row 2 (Whole)" [ref=f3e1324]:
                          - strong [ref=f3e1326]: Row 2
                          - generic [ref=f3e1329]: Whole
                        - generic [ref=f3e1330]:
                          - generic [ref=f3e1331]: ROW
                          - generic:
                            - button "Move row up"
                            - button "Move row down"
                            - button "Duplicate row"
                    - generic [ref=f3e1333]:
                      - treeitem "Col 1 100% 1" [ref=f3e1334] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e1344]:
                          - strong [ref=f3e1345]: Col 1
                        - generic [ref=f3e1346]:
                          - generic [ref=f3e1347]: 100%
                          - emphasis [ref=f3e1348]: "1"
                      - treeitem "Grid ELM" [ref=f3e1350] [cursor=pointer]:
                        - 'generic "Grid: Read more" [ref=f3e1363]':
                          - strong [ref=f3e1364]: Grid
                        - generic [ref=f3e1365]:
                          - generic [ref=f3e1366]: ELM
                          - generic:
                            - button "Move element up (within column)" [disabled]
                            - button "Move element down (within column)" [disabled]
                            - button "Duplicate element"
                            - button "Delete element"
                  - generic [ref=f3e1367]:
                    - generic [ref=f3e1368]:
                      - button "Collapse row" [ref=f3e1369] [cursor=pointer]
                      - treeitem "Row 3 Whole ROW" [ref=f3e1372] [cursor=pointer]:
                        - generic "Row 3 (Whole)" [ref=f3e1382]:
                          - strong [ref=f3e1384]: Row 3
                          - generic [ref=f3e1387]: Whole
                        - generic [ref=f3e1388]:
                          - generic [ref=f3e1389]: ROW
                          - generic:
                            - button "Move row up"
                            - button "Move row down" [disabled]
                            - button "Duplicate row"
                    - generic [ref=f3e1391]:
                      - treeitem "Col 1 100% 2" [ref=f3e1392] [cursor=pointer]:
                        - generic "Column 1 (Column 1)" [ref=f3e1402]:
                          - strong [ref=f3e1403]: Col 1
                        - generic [ref=f3e1404]:
                          - generic [ref=f3e1405]: 100%
                          - emphasis [ref=f3e1406]: "2"
                      - generic [ref=f3e1407]:
                        - treeitem "Image ELM" [ref=f3e1408] [cursor=pointer]:
                          - generic "Image 1" [ref=f3e1420]:
                            - strong [ref=f3e1421]: Image
                          - generic [ref=f3e1422]:
                            - generic [ref=f3e1423]: ELM
                            - generic:
                              - button "Move element up (within column)" [disabled]
                              - button "Move element down (within column)"
                              - button "Duplicate element"
                              - button "Delete element"
                        - treeitem "Image ELM" [ref=f3e1424] [cursor=pointer]:
                          - generic "Image 2" [ref=f3e1436]:
                            - strong [ref=f3e1437]: Image
                          - generic [ref=f3e1438]:
                            - generic [ref=f3e1439]: ELM
                            - generic:
                              - button "Move element up (within column)"
                              - button "Move element down (within column)" [disabled]
                              - button "Duplicate element"
                              - button "Delete element"
              - generic [ref=f3e1440]:
                - generic [ref=f3e1441]:
                  - button "Collapse section" [ref=f3e1442] [cursor=pointer]
                  - treeitem "Latest Posts Section SEC Open section settings Rename section" [ref=f3e1445] [cursor=pointer]:
                    - generic "Latest Posts" [ref=f3e1457]:
                      - strong [ref=f3e1458]: Latest Posts
                      - generic [ref=f3e1459]: Section
                    - generic [ref=f3e1460]:
                      - generic [ref=f3e1461]: SEC
                      - generic [ref=f3e1462]:
                        - button "Open section settings" [ref=f3e1463]
                        - button "Move section up" [ref=f3e1467]
                        - button "Rename section" [ref=f3e1470]
                        - button "Move section down" [disabled] [ref=f3e1473]
                        - button "Duplicate section" [ref=f3e1476]
                        - button "Delete section" [ref=f3e1480]
                - generic [ref=f3e1485]:
                  - generic [ref=f3e1486]:
                    - button "Collapse row" [ref=f3e1487] [cursor=pointer]
                    - treeitem "Row 1 Whole ROW" [ref=f3e1490] [cursor=pointer]:
                      - generic "Row 1 (Whole)" [ref=f3e1500]:
                        - strong [ref=f3e1502]: Row 1
                        - generic [ref=f3e1505]: Whole
                      - generic [ref=f3e1506]:
                        - generic [ref=f3e1507]: ROW
                        - generic:
                          - button "Move row up" [disabled]
                          - button "Move row down" [disabled]
                          - button "Duplicate row"
                  - generic [ref=f3e1509]:
                    - treeitem "Col 1 100% 4" [ref=f3e1510] [cursor=pointer]:
                      - generic "Column 1 (Column 1)" [ref=f3e1520]:
                        - strong [ref=f3e1521]: Col 1
                      - generic [ref=f3e1522]:
                        - generic [ref=f3e1523]: 100%
                        - emphasis [ref=f3e1524]: "4"
                    - generic [ref=f3e1525]:
                      - treeitem "Heading ELM" [ref=f3e1526] [cursor=pointer]:
                        - 'generic "Heading: Latest News" [ref=f3e1536]':
                          - strong [ref=f3e1537]: Heading
                        - generic [ref=f3e1538]:
                          - generic [ref=f3e1539]: ELM
                          - generic:
                            - button "Move element up (within column)" [disabled]
                            - button "Move element down (within column)"
                            - button "Duplicate element"
                            - button "Delete element"
                      - treeitem "Text ELM" [ref=f3e1540] [cursor=pointer]:
                        - generic "Text 2" [ref=f3e1550]:
                          - strong [ref=f3e1551]: Text
                        - generic [ref=f3e1552]:
                          - generic [ref=f3e1553]: ELM
                          - generic:
                            - button "Move element up (within column)"
                            - button "Move element down (within column)"
                            - button "Duplicate element"
                            - button "Delete element"
                      - treeitem "Button ELM" [ref=f3e1554] [cursor=pointer]:
                        - generic "Button 3" [ref=f3e1568]:
                          - strong [ref=f3e1569]: Button
                        - generic [ref=f3e1570]:
                          - generic [ref=f3e1571]: ELM
                          - generic:
                            - button "Move element up (within column)"
                            - button "Move element down (within column)"
                            - button "Duplicate element"
                            - button "Delete element"
                      - treeitem "Grid ELM" [ref=f3e1572] [cursor=pointer]:
                        - 'generic "Grid: Read more" [ref=f3e1585]':
                          - strong [ref=f3e1586]: Grid
                        - generic [ref=f3e1587]:
                          - generic [ref=f3e1588]: ELM
                          - generic:
                            - button "Move element up (within column)"
                            - button "Move element down (within column)" [disabled]
                            - button "Duplicate element"
                            - button "Delete element"
              - button "Add Section" [ref=f3e1590] [cursor=pointer]
        - button "Resize dashboard panel" [ref=f3e1593]
      - main [ref=f3e1594]:
        - generic [ref=f3e1596]:
          - generic [ref=f3e1597]:
            - generic [ref=f3e1598]:
              - generic [ref=f3e1602]:
                - generic "Website language" [ref=f3e1607]:
                  - generic [ref=f3e1608]: 文
                  - combobox "Website language" [ref=f3e1609] [cursor=pointer]:
                    - option "Հայերեն" [selected]
                    - option "English"
                    - option "Русский"
                - generic [ref=f3e1611]:
                  - link "Dashboard, signed in as Header Parity Tester" [ref=f3e1616] [cursor=pointer]:
                    - /url: /app
                    - generic [ref=f3e1621]:
                      - strong [ref=f3e1622]: Header Parity Tester
                      - generic [ref=f3e1623]: Signed in
                  - button "Search" [ref=f3e1629] [cursor=pointer]
              - generic [ref=f3e1634]:
                - link [ref=f3e1640] [cursor=pointer]:
                  - /url: /app/websites/header-parity-site/builder?page=home
                  - img "Header Parity Site logo" [ref=f3e1641]
                - navigation [ref=f3e1647]:
                  - link "Home" [ref=f3e1649] [cursor=pointer]:
                    - /url: /app/websites/header-parity-site/builder?page=home
                  - link "Shop" [ref=f3e1651] [cursor=pointer]:
                    - /url: /app/websites/header-parity-site/builder?page=shop
                - generic [ref=f3e1653]:
                  - link "Contact Us" [ref=f3e1656] [cursor=pointer]:
                    - /url: /contact
                  - button "Toggle dark mode" [ref=f3e1661] [cursor=pointer]
                  - button "Cart" [ref=f3e1672] [cursor=pointer]
            - generic:
              - generic:
                - generic: Header
                - button "Edit Header"
                - button "Header Settings"
          - generic "Home preview" [ref=f3e1680]:
            - button [ref=f3e1682] [cursor=pointer]:
              - button "Add section" [ref=f3e1684]
              - generic [ref=f3e1687]:
                - generic "Row 1" [ref=f3e1688]:
                  - generic [ref=f3e1689]:
                    - button "Select row 1" [ref=f3e1690]
                    - article [ref=f3e1691]:
                      - generic [ref=f3e1692]:
                        - heading "Build Anything on DevStack" [level=1] [ref=f3e1695]
                        - generic [ref=f3e1696]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.
                        - generic [ref=f3e1701]:
                          - link "Sign up for Free" [ref=f3e1702]:
                            - /url: "?page_id=21"
                          - link "Learn More" [ref=f3e1703]:
                            - /url: "?page_id=20"
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                  - button "Add row" [ref=f3e1705]
                - generic "Row 2" [ref=f3e1707]:
                  - generic:
                    - button "Select row 2" [ref=f3e1708]
                    - article:
                      - generic:
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - link:
                                  - /url: wp-content/uploads/yootheme/home-hero-video.mp4
                                - button "Change image"
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                  - button "Add row" [ref=f3e1710]
            - button [ref=f3e1713] [cursor=pointer]:
              - button "Add section" [ref=f3e1715]
              - generic "Row 1" [ref=f3e1719]:
                - generic [ref=f3e1720]:
                  - button "Select row 1" [ref=f3e1721]
                  - article [ref=f3e1722]:
                    - generic [ref=f3e1723]: DevStack Is Trusted by Professionals Around the World
                    - generic [ref=f3e1728]:
                      - article [ref=f3e1729]:
                        - generic [ref=f3e1730]:
                          - button "Duplicate item" [ref=f3e1731]
                          - button "Delete item" [ref=f3e1735]
                        - generic: "::"
                        - generic [ref=f3e1739]:
                          - generic [ref=f3e1740]:
                            - button "Change image"
                          - link "Read more" [ref=f3e1742]:
                            - /url: "#"
                      - article [ref=f3e1743]:
                        - generic [ref=f3e1744]:
                          - button "Duplicate item" [ref=f3e1745]
                          - button "Delete item" [ref=f3e1749]
                        - generic: "::"
                        - generic [ref=f3e1753]:
                          - generic [ref=f3e1754]:
                            - button "Change image"
                          - link "Read more" [ref=f3e1756]:
                            - /url: "#"
                      - article [ref=f3e1757]:
                        - generic [ref=f3e1758]:
                          - button "Duplicate item" [ref=f3e1759]
                          - button "Delete item" [ref=f3e1763]
                        - generic: "::"
                        - generic [ref=f3e1767]:
                          - generic [ref=f3e1768]:
                            - button "Change image"
                          - link "Read more" [ref=f3e1770]:
                            - /url: "#"
                      - article [ref=f3e1771]:
                        - generic [ref=f3e1772]:
                          - button "Duplicate item" [ref=f3e1773]
                          - button "Delete item" [ref=f3e1777]
                        - generic: "::"
                        - generic [ref=f3e1781]:
                          - generic [ref=f3e1782]:
                            - button "Change image"
                          - link "Read more" [ref=f3e1784]:
                            - /url: "#"
                      - article [ref=f3e1785]:
                        - generic [ref=f3e1786]:
                          - button "Duplicate item" [ref=f3e1787]
                          - button "Delete item" [ref=f3e1791]
                        - generic: "::"
                        - generic [ref=f3e1795]:
                          - generic [ref=f3e1796]:
                            - button "Change image"
                          - link "Read more" [ref=f3e1798]:
                            - /url: "#"
                      - article [ref=f3e1799]:
                        - generic [ref=f3e1800]:
                          - button "Duplicate item" [ref=f3e1801]
                          - button "Delete item" [ref=f3e1805]
                        - generic: "::"
                        - generic [ref=f3e1809]:
                          - generic [ref=f3e1810]:
                            - button "Change image"
                          - link "Read more" [ref=f3e1812]:
                            - /url: "#"
                - button "Add row" [ref=f3e1814]
            - button [ref=f3e1817] [cursor=pointer]:
              - button "Add section" [ref=f3e1819]
              - generic [ref=f3e1822]:
                - generic "Row 1" [ref=f3e1823]:
                  - generic [ref=f3e1824]:
                    - button "Select row 1" [ref=f3e1825]
                    - article [ref=f3e1826]:
                      - heading "How does it work?" [level=2] [ref=f3e1829]
                      - generic [ref=f3e1830]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.
                  - button "Add row" [ref=f3e1834]
                - generic "Row 2" [ref=f3e1836]:
                  - generic [ref=f3e1837]:
                    - button "Select row 2" [ref=f3e1838]
                    - article [ref=f3e1839]:
                      - generic [ref=f3e1840]:
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                        - generic [ref=f3e1842]:
                          - generic [ref=f3e1843]:
                            - button "Change image"
                          - generic [ref=f3e1844]:
                            - heading "Integrate" [level=3] [ref=f3e1845]
                            - generic [ref=f3e1846]: Lorem ipsum dolo nonumy eirmod tempor invidunt ut labore et magna aliquyam.
                            - generic [ref=f3e1847]: Learn More
                    - article [ref=f3e1849]:
                      - generic [ref=f3e1850]:
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                        - generic [ref=f3e1852]:
                          - generic [ref=f3e1853]:
                            - button "Change image"
                          - generic [ref=f3e1854]:
                            - heading "Automate" [level=3] [ref=f3e1855]
                            - generic [ref=f3e1856]: Lorem ipsum dolo nonumy eirmod tempor invidunt ut labore et magna aliquyam.
                            - generic [ref=f3e1857]: Learn More
                    - article [ref=f3e1859]:
                      - generic [ref=f3e1860]:
                        - generic:
                          - generic:
                            - figure:
                              - generic:
                                - button "Change image"
                        - generic [ref=f3e1862]:
                          - generic [ref=f3e1863]:
                            - button "Change image"
                          - generic [ref=f3e1864]:
                            - heading "Innovate" [level=3] [ref=f3e1865]
                            - generic [ref=f3e1866]: Lorem ipsum dolo nonumy eirmod tempor invidunt ut labore et magna aliquyam.
                            - generic [ref=f3e1867]: Learn More
                  - button "Add row" [ref=f3e1870]
            - button [ref=f3e1873] [cursor=pointer]:
              - button "Add section" [ref=f3e1875]
              - generic [ref=f3e1878]:
                - generic "Row 1" [ref=f3e1879]:
                  - generic [ref=f3e1880]:
                    - button "Select row 1" [ref=f3e1881]
                    - article [ref=f3e1882]:
                      - heading "The Best Tools from the Leading DevOps Platform" [level=2] [ref=f3e1885]
                      - generic [ref=f3e1886]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor.
                      - generic [ref=f3e1891]:
                        - article [ref=f3e1892]:
                          - generic [ref=f3e1893]:
                            - button "Duplicate item" [ref=f3e1894]
                            - button "Delete item" [ref=f3e1898]
                          - generic: "::"
                          - generic [ref=f3e1902]:
                            - generic [ref=f3e1903]:
                              - img "Easy Deployments" [ref=f3e1904]
                              - button "Change image"
                            - heading "Easy Deployments" [level=3] [ref=f3e1905]
                            - link "Learn More" [ref=f3e1907]:
                              - /url: "?page_id=19#deployment"
                        - article [ref=f3e1908]:
                          - generic [ref=f3e1909]:
                            - button "Duplicate item" [ref=f3e1910]
                            - button "Delete item" [ref=f3e1914]
                          - generic: "::"
                          - generic [ref=f3e1918]:
                            - generic [ref=f3e1919]:
                              - img "Scalable Automation" [ref=f3e1920]
                              - button "Change image"
                            - heading "Scalable Automation" [level=3] [ref=f3e1921]
                            - link "Learn More" [ref=f3e1923]:
                              - /url: "?page_id=19#automation"
                        - article [ref=f3e1924]:
                          - generic [ref=f3e1925]:
                            - button "Duplicate item" [ref=f3e1926]
                            - button "Delete item" [ref=f3e1930]
                          - generic: "::"
                          - generic [ref=f3e1934]:
                            - generic [ref=f3e1935]:
                              - img "Continuous Integration" [ref=f3e1936]
                              - button "Change image"
                            - heading "Continuous Integration" [level=3] [ref=f3e1937]
                            - link "Learn More" [ref=f3e1939]:
                              - /url: "?page_id=19#ci-cd"
                        - article [ref=f3e1940]:
                          - generic [ref=f3e1941]:
                            - button "Duplicate item" [ref=f3e1942]
                            - button "Delete item" [ref=f3e1946]
                          - generic: "::"
                          - generic [ref=f3e1950]:
                            - generic [ref=f3e1951]:
                              - img "Infrastructure" [ref=f3e1952]
                              - button "Change image"
                            - heading "Infrastructure" [level=3] [ref=f3e1953]
                            - link "Learn More" [ref=f3e1955]:
                              - /url: "?page_id=19#infrastructure"
                        - article [ref=f3e1956]:
                          - generic [ref=f3e1957]:
                            - button "Duplicate item" [ref=f3e1958]
                            - button "Delete item" [ref=f3e1962]
                          - generic: "::"
                          - generic [ref=f3e1966]:
                            - generic [ref=f3e1967]:
                              - img "End-to-End Security" [ref=f3e1968]
                              - button "Change image"
                            - heading "End-to-End Security" [level=3] [ref=f3e1969]
                            - link "Learn More" [ref=f3e1971]:
                              - /url: "?page_id=19#security"
                        - article [ref=f3e1972]:
                          - generic [ref=f3e1973]:
                            - button "Duplicate item" [ref=f3e1974]
                            - button "Delete item" [ref=f3e1978]
                          - generic: "::"
                          - generic [ref=f3e1982]:
                            - generic [ref=f3e1983]:
                              - img "Seamless Integrations" [ref=f3e1984]
                              - button "Change image"
                            - heading "Seamless Integrations" [level=3] [ref=f3e1985]
                            - link "Learn More" [ref=f3e1987]:
                              - /url: "?page_id=19#integrations"
                        - article [ref=f3e1988]:
                          - generic [ref=f3e1989]:
                            - button "Duplicate item" [ref=f3e1990]
                            - button "Delete item" [ref=f3e1994]
                          - generic: "::"
                          - generic [ref=f3e1998]:
                            - generic [ref=f3e1999]:
                              - img "Automated Testing" [ref=f3e2000]
                              - button "Change image"
                            - heading "Automated Testing" [level=3] [ref=f3e2001]
                            - link "Learn More" [ref=f3e2003]:
                              - /url: "?page_id=19#features"
                        - article [ref=f3e2004]:
                          - generic [ref=f3e2005]:
                            - button "Duplicate item" [ref=f3e2006]
                            - button "Delete item" [ref=f3e2010]
                          - generic: "::"
                          - generic [ref=f3e2014]:
                            - generic [ref=f3e2015]:
                              - img "Cloud Storage" [ref=f3e2016]
                              - button "Change image"
                            - heading "Cloud Storage" [level=3] [ref=f3e2017]
                            - link "Learn More" [ref=f3e2019]:
                              - /url: "?page_id=19#features"
                  - button "Add row" [ref=f3e2021]
                - generic "Row 2" [ref=f3e2023]:
                  - generic:
                    - button "Select row 2" [ref=f3e2024]
                    - article
                  - button "Add row" [ref=f3e2026]
            - button [ref=f3e2029] [cursor=pointer]:
              - button "Add section" [ref=f3e2031]
              - generic [ref=f3e2034]:
                - generic "Row 1" [ref=f3e2035]:
                  - generic [ref=f3e2036]:
                    - button "Select row 1" [ref=f3e2037]
                    - article [ref=f3e2038]:
                      - heading "Reach Your Digital Goals With a Solution Trusted by Many Industry Experts" [level=2] [ref=f3e2041]
                    - article [ref=f3e2042]:
                      - link "View All" [ref=f3e2046]:
                        - /url: "?post_type=post"
                  - button "Add row" [ref=f3e2048]
                - generic "Row 2" [ref=f3e2050]:
                  - generic [ref=f3e2051]:
                    - button "Select row 2" [ref=f3e2052]
                    - article [ref=f3e2053]:
                      - article [ref=f3e2060]:
                        - generic:
                          - img "Slide Image"
                        - heading "Slide 1" [level=3] [ref=f3e2062]
                  - button "Add row" [ref=f3e2064]
            - button [ref=f3e2067] [cursor=pointer]:
              - button "Add section" [ref=f3e2069]
              - generic [ref=f3e2072]:
                - generic "Row 1" [ref=f3e2073]:
                  - generic [ref=f3e2074]:
                    - button "Select row 1" [ref=f3e2075]
                    - article [ref=f3e2076]:
                      - heading "Reinvent Your Business With DevStack Solutions" [level=2] [ref=f3e2079]
                  - button "Add row" [ref=f3e2081]
                - generic "Row 2" [ref=f3e2083]:
                  - generic [ref=f3e2084]:
                    - button "Select row 2" [ref=f3e2085]
                    - article [ref=f3e2086]:
                      - generic [ref=f3e2089]:
                        - article [ref=f3e2090]:
                          - generic [ref=f3e2091]:
                            - button "Duplicate item" [ref=f3e2092]
                            - button "Delete item" [ref=f3e2096]
                          - generic: "::"
                          - generic [ref=f3e2100]:
                            - generic [ref=f3e2101]:
                              - img "Ship Faster with<br class=\"uk-visible@s\"> the Leading DevOps Platform" [ref=f3e2102]
                              - button "Change image"
                            - heading "Ship Faster with the Leading DevOps Platform" [level=3] [ref=f3e2103]
                            - paragraph [ref=f3e2104]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr dolore magna aliquyam erat, sed diam voluptua.
                            - link "Read more" [ref=f3e2106]:
                              - /url: "?page_id=19"
                        - article [ref=f3e2107]:
                          - generic [ref=f3e2108]:
                            - button "Duplicate item" [ref=f3e2109]
                            - button "Delete item" [ref=f3e2113]
                          - generic: "::"
                          - generic [ref=f3e2117]:
                            - generic [ref=f3e2118]:
                              - img "Endless Benefits with DevStack Enterprise" [ref=f3e2119]
                              - button "Change image"
                            - heading "Endless Benefits with DevStack Enterprise" [level=3] [ref=f3e2120]
                            - paragraph [ref=f3e2121]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr dolore magna aliquyam erat, sed diam voluptua.
                            - link "Read more" [ref=f3e2123]:
                              - /url: "?page_id=2"
                  - button "Add row" [ref=f3e2125]
                - generic "Row 3" [ref=f3e2127]:
                  - generic:
                    - button "Select row 3" [ref=f3e2128]
                    - article
                  - button "Add row" [ref=f3e2130]
            - button [ref=f3e2133] [cursor=pointer]:
              - button "Add section" [ref=f3e2135]
              - generic "Row 1" [ref=f3e2139]:
                - generic [ref=f3e2140]:
                  - button "Select row 1" [ref=f3e2141]
                  - article [ref=f3e2142]:
                    - heading "Latest News" [level=2] [ref=f3e2145]
                    - generic [ref=f3e2146]: Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut.
                    - link "Visit Our Blog" [ref=f3e2152]:
                      - /url: "?post_type=post"
                    - article [ref=f3e2156]:
                      - generic [ref=f3e2157]:
                        - button "Duplicate item" [ref=f3e2158]
                        - button "Delete item" [ref=f3e2162]
                      - generic: "::"
                      - generic [ref=f3e2166]:
                        - generic [ref=f3e2169]:
                          - heading "Select an image" [level=4] [ref=f3e2175]
                          - paragraph [ref=f3e2176]: Drag and drop, upload, or choose from your media library
                          - button "Choose Image" [ref=f3e2177]
                        - link "Read more" [ref=f3e2183]:
                          - /url: "#"
                - button "Add row" [ref=f3e2185]
          - generic "Footer preview" [ref=f3e2187]:
            - generic [ref=f3e2189]:
              - generic [ref=f3e2190]:
                - generic:
                  - generic:
                    - generic:
                      - generic:
                        - article
                        - article
                        - article
              - generic [ref=f3e2195]:
                - article [ref=f3e2196]:
                  - generic [ref=f3e2198]:
                    - generic [ref=f3e2199]: Header Parity Site
                    - generic [ref=f3e2200]: A concise closing statement that reinforces what you offer and who you help.
                - article [ref=f3e2201]:
                  - generic [ref=f3e2203]:
                    - heading "Explore" [level=3] [ref=f3e2204]
                    - list [ref=f3e2205]:
                      - listitem [ref=f3e2206]:
                        - generic [ref=f3e2207]: About
                      - listitem [ref=f3e2208]:
                        - generic [ref=f3e2209]: Services
                      - listitem [ref=f3e2210]:
                        - generic [ref=f3e2211]: Testimonials
                      - listitem [ref=f3e2212]:
                        - generic [ref=f3e2213]: Contact
                - article [ref=f3e2214]:
                  - generic [ref=f3e2216]:
                    - generic [ref=f3e2217]: Contact
                    - generic [ref=f3e2218]: Start a conversation
                    - generic [ref=f3e2219]: hello@example.com +1 000 000 0000
            - button "Edit Footer" [ref=f3e2220] [cursor=pointer]
            - generic [ref=f3e2221]:
              - generic [ref=f3e2222]: Footer
              - button "Edit Footer" [ref=f3e2223] [cursor=pointer]
  - alert [ref=f3e2227]
```

# Test source

```ts
  4   | const email = "header-parity-20260722@example.test";
  5   | const password = "HeaderParity!2026";
  6   | const websiteId = "header-parity-site";
  7   | const builderUrl = `/app/websites/${websiteId}/builder?page=home`;
  8   | const previewUrl = `/app/websites/${websiteId}/preview?page=home`;
  9   | const homeFixture = "/Users/hakobjaghatspanyan/Downloads/Home.json";
  10  | 
  11  | async function signIn(page: Page) {
  12  |   await page.goto("/login");
  13  |   await page.getByLabel("Email", { exact: true }).fill(email);
  14  |   await page.getByLabel("Password", { exact: true }).fill(password);
  15  |   await page.getByRole("button", { name: "Sign in", exact: true }).click();
  16  |   await expect(page).toHaveURL(/\/app(?:\?|$)/);
  17  | }
  18  | 
  19  | class MemoryStorage {
  20  |   private values = new Map<string, string>();
  21  | 
  22  |   getItem(key: string) {
  23  |     return this.values.get(key) ?? null;
  24  |   }
  25  | 
  26  |   setItem(key: string, value: string) {
  27  |     this.values.set(key, value);
  28  |   }
  29  | }
  30  | 
  31  | test("fresh YOOtheme import invalidates only its scoped page draft", () => {
  32  |   const storage = new MemoryStorage();
  33  |   const draftsKey = "react-shop-visual-builder-drafts-v2:header-parity-site";
  34  |   const stateKey = "react-shop-visual-builder-v1:header-parity-site";
  35  |   const imported = { page: "home", sections: [{ id: "yootheme-section-1" }] };
  36  | 
  37  |   storage.setItem(draftsKey, JSON.stringify({
  38  |     home: { page: "home", sections: [{ id: "stale-panel-section" }] },
  39  |     shop: { page: "shop", sections: [{ id: "keep-shop-draft" }] },
  40  |     "page:about": { page: "page:about", sections: [{ id: "keep-about-draft" }] },
  41  |   }));
  42  | 
  43  |   invalidateImportedBuilderDraft(storage as unknown as Storage, {
  44  |     draftsKey,
  45  |     stateKey,
  46  |     pageKey: "home",
  47  |     importedState: imported,
  48  |   });
  49  | 
  50  |   expect(JSON.parse(storage.getItem(draftsKey) ?? "{}")).toEqual({
  51  |     shop: { page: "shop", sections: [{ id: "keep-shop-draft" }] },
  52  |     "page:about": { page: "page:about", sections: [{ id: "keep-about-draft" }] },
  53  |   });
  54  |   expect(JSON.parse(storage.getItem(stateKey) ?? "{}")).toEqual(imported);
  55  | });
  56  | 
  57  | test("fresh Home import replaces the matching stale Builder draft", async ({ page, context }) => {
  58  |   await signIn(page);
  59  |   const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  60  |   const original = originalPayload.layout;
  61  |   const draftsKey = `react-shop-visual-builder-drafts-v2:${websiteId}`;
  62  | 
  63  |   try {
  64  |     await page.goto(builderUrl);
  65  |     await page.evaluate((key) => {
  66  |       const drafts = JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, unknown>;
  67  |       drafts.home = {
  68  |         page: "home",
  69  |         sections: [{
  70  |           id: "stale-section",
  71  |           kind: "contentLayout",
  72  |           layoutItems: [{ id: "stale-column", blocks: [{ id: "panel-block-stale", kind: "panel", title: "Stale Panel" }] }],
  73  |         }],
  74  |       };
  75  |       drafts.shop = { page: "shop", sections: [{ id: "other-page-draft" }] };
  76  |       window.localStorage.setItem(key, JSON.stringify(drafts));
  77  |     }, draftsKey);
  78  |     await page.reload();
  79  | 
  80  |     await page.getByRole("button", { name: "Layouts", exact: true }).click();
  81  |     await page.getByRole("tab", { name: /Pages/ }).click();
  82  |     await page.getByText("Import YOOtheme Page JSON", { exact: true }).locator("..").locator('input[type="file"]').setInputFiles(homeFixture);
  83  |     await page.getByRole("button", { name: "Apply import", exact: true }).click();
  84  |     await page.getByRole("button", { name: "Publish", exact: true }).click();
  85  |     await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();
  86  |     await page.reload();
  87  |     await expect(page.getByText("Integrate", { exact: true })).toBeVisible();
  88  | 
  89  |     const builderIds = await page.locator("[data-builder-block-key]").evaluateAll((els) =>
  90  |       els
  91  |         .map((el) => el.getAttribute("data-builder-block-key"))
  92  |         .filter((key) => /^yootheme-panel-\d+-/.test(key ?? "")),
  93  |     );
  94  |     expect(builderIds).toEqual([
  95  |       "yootheme-panel-2-1-0-1",
  96  |       "yootheme-panel-2-1-1-1",
  97  |       "yootheme-panel-2-1-2-1",
  98  |     ]);
  99  |     await expect(page.locator('[data-builder-block-key="panel-block-stale"]')).toHaveCount(0);
  100 |     console.log("remaining draft keys", await page.evaluate(
  101 |       (key) => Object.keys(JSON.parse(window.localStorage.getItem(key) ?? "{}")),
  102 |       draftsKey,
  103 |     ));
> 104 |     await expect(page.getByText("Unsaved changes", { exact: true })).toHaveCount(0);
      |                                                                      ^ Error: expect(locator).toHaveCount(expected) failed
  105 |     const remainingDraftKeys = await page.evaluate(
  106 |       (key) => Object.keys(JSON.parse(window.localStorage.getItem(key) ?? "{}")),
  107 |       draftsKey,
  108 |     );
  109 |     expect(remainingDraftKeys.sort()).toEqual(["shop"]);
  110 | 
  111 |     const storefront = await context.newPage();
  112 |     await storefront.goto(previewUrl);
  113 |     const storefrontIds = await storefront.locator('.shop-builder-column-block--panel').evaluateAll((els) =>
  114 |       els.map((el) => el.getAttribute("data-builder-block-id")),
  115 |     );
  116 |     expect(storefrontIds).toEqual(builderIds);
  117 |     await storefront.close();
  118 |   } finally {
  119 |     expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
  120 |       data: { key: "home", design: original.design, sections: original.sections },
  121 |     })).ok()).toBeTruthy();
  122 |   }
  123 | });
  124 | 
```