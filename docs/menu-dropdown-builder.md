# Menu-owned shared builder — first implementation slice

## Implemented

- Root items in the Menu panel expose Builder, for main and named menus.
- The editor hosts the normal Structure rows. Its EmbeddedBuilderHost routes Add Element to DashboardBuilder's existing Library modal and row/column/element details into the dashboard Inspector. The sidebar remains the structure view.
- A menu item owns an optional canonical `dropdownContent` fragment. Every mutation immediately updates normal shell state and autosave. There is no extra local draft or Apply button hiding edits from Publish.
- Shell normalization and portable navigation packages retain each item's content.
- Import calls DashboardBuilder's existing importYoothemePage and shared preview modal. An explicit menu destination intercepts application before page replacement. The shared mapper now accepts fragment roots and the previous native dropdown package. The separate menuDropdownImport module and private import UI were removed.
- The desktop header resolves fragments with the same server-side dynamic materializer as pages, then renders ContentLayoutBlock. Live drafts call the existing authorized preview endpoint; stale responses are cancelled and the last resolved projection remains visible while refreshing. Authored bindings are never overwritten by the render projection. An empty fragment falls back to the normal child menu.
- Mobile continues to use existing menu children. This is a conservative fallback, not claimed YOOtheme mobile parity.

## Women dropdown import

The real source fragment is recorded in `tests/fixtures/yootheme-compatibility/sources/women-menu-dropdown.json`, copied from the site's already-imported YOOtheme sourceConfig.menuItems[1418].content. The customer data was read only.

It contains four columns, five Headline/Nav groups, and a Slideshow. Queries include customMenuItem, customMenuItems and productTags.customProductTag. Nav items bind title, URL, type and active state; the slideshow resolves title and featured media from product tags.

Nav/Nav Item now map through the shared importer, renderer and Inspector. WordPress Menu Item and Custom Menu Items are shared dynamic sources, including menu/parent scoping. Standalone Heading import now retains dynamic text and link bindings. The actual fragment applies and survives autosave/reload in the production Builder test with isolated storage. A read-only connected test resolves all five headings and 25 links.

The slideshow's two product-tag titles resolve, but this site's `field.image_featured.url` is not exposed via its REST or GraphQL content projection. The binding is retained, the draft reports missing-field diagnostics, and imported slides never substitute demo images. Video parity is not claimed. Enabling exposure of the source field requires a WordPress-side integration change, not replacement JSON.

## Next required slice

1. Complete exhaustive Nav variant parity beyond the verified Women fragment.
2. Add portable cross-site source-menu ID remapping; current imported dynamic descriptors reference the connected WordPress menu IDs.
3. Expose product-tag featured media from WordPress and verify video playback through the shared resolver.
4. Import per-item dropdown width/stretch/padding separately from fragment JSON. The actual Women item uses stretch=navbar-container; these settings are outside its fragment export.
5. Compare the real Women dropdown at desktop/tablet/mobile sizes and test navigation, keyboard behaviour, repeat import and reload. Only then claim original-import parity.

Tests cover immediate edits, external Inspector/Library hosts, desktop rendering, shell normalization and portable ownership. The `/dashboard-menu-dropdown-proof/full` harness mounts the production DashboardBuilder; tests intercept all API requests to check the actual Women JSON, autosave payloads, import targeting and reload without customer writes. Media exposure and exhaustive cross-site/mobile parity remain unfinished.
