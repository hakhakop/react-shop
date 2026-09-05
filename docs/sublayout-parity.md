# Sublayout implementation and verification

Source audit: authenticated YOOtheme 4.5.18 Sublayout Inspector, its `fragment` schema, and `BuilderFragment` client implementation. Rows are direct children of the fragment, not an independent page/section and not a vertical-only split.

## Implemented

- `sublayout` element in the element library; empty by default.
- Nested canonical rows/columns, existing responsive row settings and column controls, existing child element Inspectors, recursive Sublayouts.
- Content reuses `WireframeRow` (including its column/card/action-menu components) from the normal Structure builder and the normal `ElementLibrary`. The Inspector adapter scopes actions to nested rows; it does not maintain a second card UI. Selecting content opens its existing Inspector and Back to Sublayout returns to Structure.
- Add/copy/remove/reorder rows and elements; row preset changes preserve overflow content; copies remap descendant IDs.
- Settings: HTML Element and the source's reduced General settings (no invented width/alignment controls).
- Advanced: Name, disabled state, dynamic source, dynamic ID/classes/attributes, scoped CSS. No Transform field.
- `fragment` importer, canonical persisted nested tree, inherited dynamic data and collection projection, localized descendants and dynamic preview invalidation.
- Existing storefront row renderer reused without a section wrapper, section padding, or invented fallback content.

## Verification boundaries

`tests/yootheme-sublayout.spec.ts` checks representative imports, recursive/empty layouts, preservation during preset changes, duplication, dynamic inheritance, collection projection and reporting.
`tests/yootheme-sublayout-browser.spec.ts` checks desktop/mobile geometry and edits through the real shared Inspector components using the development-only `/dashboard-sublayout-proof` route.

This is not an exhaustive certification of every YOOtheme child element or full-site import. The authenticated original was inspected but not modified or saved. Existing site documents were not migrated. Sublayout uses the existing WebPages row/column capabilities; existing omissions in those controls remain inherited limitations. Ordering uses the normal Structure action menus; cross-column drag-and-drop and YOOtheme's saved-layout Library are not reproduced.
