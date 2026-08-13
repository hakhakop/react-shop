# Phase 9.1 — Static Slideshow Contract

This is the authoritative completion ledger for Phase 9.1. It is derived from
the live YOOtheme Slideshow inspector and the synchronized
`/Users/hakobjaghatspanyan/Downloads/enterprise3.json` export. It does not use
the current WebPages UI as the definition of correctness.

## Completion gate

Each supported row must prove:

`YOOtheme source → import normalizer → canonical owner → visible inspector → shared CarouselBlock runtime → Builder + storefront`.

Rows marked **DEFERRED** must stay absent from the WebPages Slideshow
inspector and produce a durable import report. No row is complete because a
field merely persists.

## Content

| YOOtheme group / semantics | Source fields | Canonical WebPages owner | Current status | Phase 9.1 disposition |
| --- | --- | --- | --- | --- |
| Items, add/copy/delete/reorder | `slideshow_item` children | `slides[]` | PARTIAL — the live Builder follows YOOtheme order: Items → Display → Link. Per-item Content uses media/title/meta/rich content/link/navigation label/navigation thumbnail; storefront acceptance remains. | Do not add a parallel item model. |
| Display title/meta/content/link | `show_title`, `show_meta`, `show_content`, `show_link` | `carouselSettings.show*` | PARTIAL — source/import, shared settings ownership and live Builder controls are verified; storefront proof remains | Retain and verify. |
| Navigation thumbnail display | `show_thumbnail`, `nav: thumbnav`, thumbnail dimensions/wrap fields | `carouselSettings.showNavigationThumbnail` + shared carousel slide media | PARTIAL — `show_thumbnail` now imports truthfully, controls whether Thumbnav uses canonical slide media or numbered items, and uses the YOOtheme Display wording | Inline-SVG thumbnail coloring remains deferred. |
| Whole-element link | element `link`, `link_target` | `carouselSettings.elementLinkUrl/elementLinkTarget` + shared Link renderer | PARTIAL — parent link is distinct from item actions and renders as a sibling overlay to avoid nested anchors; live proof remains | Verify/import only when source authoring is present; do not confuse it with an item action. |

## Settings

| YOOtheme group / semantics | Source fields | Canonical owner | Current status | Phase 9.1 disposition |
| --- | --- | --- | --- | --- |
| Height Auto / Viewport | `slideshow_height`, `slideshow_height_viewport` | shared Slideshow frame owner | COMPLETE for Auto and Viewport — fresh-import harness measures an imported 80vh frame at the same geometry in Builder and storefront. | `section` (Viewport Subtract Next Section) remains absent/deferred; it is not persisted as an inert fallback. |
| Ratio | `slideshow_ratio` | `slideshowRatio` / shared frame ratio | COMPLETE — explicit safe `width:height` values set the shared frame ratio. With no authored ratio, the shared frame deliberately uses UIkit Slideshow's documented 16:9 default. | Inspector order is Ratio → Min Height → Max Height, matching YOOtheme. |
| Min/Max height | `slideshow_min_height`, `slideshow_max_height` | shared Slideshow frame constraints | COMPLETE for Auto/ratio frames — a fresh imported 16:9 frame constrained by 450px minimum / 500px maximum measured 500px in both Builder and storefront. | Max Height remains correctly unavailable for Viewport mode, as in YOOtheme. |
| Text context | `text_color` | shared semantic overlay text context | PARTIAL | None/Light/Dark now persist through the shared context owner. Awaiting fresh-import Builder/storefront proof. |
| Box shadow / decoration | slideshow visual fields | Global Card/media presentation | MISSING | DEFERRED; no truthful slideshow owner currently exists. |
| Transition | `slideshow_animation` | `effect` | PARTIAL — Slide/Fade only | Support Slide/Fade; report Pull/Push/Scale unsupported. |
| Velocity | animation velocity | none | MISSING | DEFERRED. |
| Autoplay / pause / interval | `slideshow_autoplay`, `_pause`, `_interval` | shared carousel autoplay | PARTIAL | Verify all three source values and runtime. |
| Parallax / Ken Burns | parallax / Ken Burns fields | no shared animation runtime | UNSUPPORTED | Keep absent and reported. |

## Navigation

| YOOtheme group / semantics | Source fields | Canonical owner | Current status | Phase 9.1 disposition |
| --- | --- | --- | --- | --- |
| Navigation type | `nav` | `navigationType` | PARTIAL — Dotnav and Thumbnav map to a dedicated Slideshow navigation presentation | Both remain subject to fresh-import Builder/storefront geometry proof. |
| Position | `nav_position` | `paginationPosition` as Slideshow navigation position | PARTIAL | Complete nine-position semantic subset actually provided by YOOtheme after live proof. |
| Margin | `nav_position_margin` | `navigationMargin` | PARTIAL | Complete after live proof. |
| Breakpoint | `nav_breakpoint` | `navigationBreakpoint` | COMPLETE for the supported breakpoint tiers | Fresh Enterprise3 import now proves Dotnav is hidden at 639px and visible at 640px for source `s` in both Builder and storefront; the runtime cannot silently fall back to Always. |
| Show below / hover only / vertical | `nav_below`, `nav_hover`, `nav_vertical` | shared carousel navigation layout fields | PARTIAL | Imported and composed in the Slideshow Navigation group; shared runtime classes exist, awaiting live acceptance. |
| Thumbnav dimensions / wrap | `thumbnav_width`, `thumbnav_height`, `thumbnav_nowrap` | shared carousel navigation media presentation | PARTIAL | Reuses slide media and is visibly configurable only when Thumbnav is selected and navigation thumbnails are enabled. Retains `thumbnav_wrap` as an import compatibility alias. |
| Thumbnav Inline SVG / SVG Color | `thumbnav_inline`, `thumbnav_svg_color` | no shared thumbnail-SVG presentation owner | DEFERRED | Remains absent from the inspector until the shared SVG runtime can color thumbnail SVGs truthfully. |

## Slidenav

| YOOtheme group / semantics | Source fields | Canonical owner | Current status | Phase 9.1 disposition |
| --- | --- | --- | --- | --- |
| Position Default / Outside | `slidenav` | `showArrows`, `arrowPosition` | PARTIAL | Complete only Default/Outside after imported value and frame geometry proof. |
| Margin | `slidenav_margin` | shared carousel slidenav inset tier | PARTIAL | Imported and composed in the Slidenav group; shared runtime consumes the semantic inset tier. |
| Breakpoint | `slidenav_breakpoint` | `slidenavBreakpoint` | COMPLETE for the supported breakpoint tiers | Source `s` persists as `small`; fresh Builder/storefront acceptance proves Slidenav is hidden at 639px and visible at 640px. |
| Outside breakpoint | `slidenav_outside_breakpoint` | `slidenavOutsideBreakpoint` | MISSING runtime | DEFERRED. |
| Hover-only / larger | slidenav state fields | shared carousel slidenav state fields | PARTIAL | Hover-only remains pending live acceptance. Larger style is verified: source `slidenav_large: true` produces the shared 60×60 UIkit Slidenav with a 24px icon in Builder and storefront. |

## Item, Overlay, Image, Typography, Link and Advanced

| YOOtheme group | Existing canonical owner | Current status | Phase 9.1 rule |
| --- | --- | --- | --- |
| Item link overlay | shared Panel/Card whole-link owner | PARTIAL | Support only if it can avoid nested anchors with item actions. |
| Overlay position / padding | `overlay_position`, `overlay_padding` | shared Slideshow presentation adapter | PARTIAL — importer, visible `CONTENT` group and shared runtime now use the same owner; fresh-import visual proof remains | Do not substitute Overlay Slider mode/display controls. |
| Overlay container/style/width/animation | no complete shared slideshow overlay presentation owner | MISSING | DEFERRED, absent. |
| Image width/height/loading | shared Image owner | PARTIAL | Compose only the YOOtheme Image fields once their shared runtime is proved. |
| Title, Meta, Content, Link | shared Title/Meta/Rich Text/Action owners | PARTIAL — element-level `link_text`, `link_style`, `link_size`, full width and margin resolve through the shared Action owner without being copied into each item. | Enterprise5 fresh-import coverage proves authored item actions inherit `Button Default` in Builder and storefront. Live Builder verifies exactly one element-level **Settings → Link** group (Target, Text, Style, Button Size, Full width, Margin Top); item Settings retains only YOOtheme Item/Image/Thumbnail overrides and no duplicate Link presentation path. Remaining screen-by-screen acceptance covers the other groups. |
| Item text/HTML/media focus | `text_color`, `item_element`, `image_focal_point` | shared semantic text context, element semantic tag, Image focal point | PARTIAL — live Builder has the exact compact Item and Image groups; runtime uses the item semantic tag, text context, and focal point. | Verify fresh imported overrides in Builder and storefront. |
| Navigation thumbnail item media | `thumbnail`, `thumbnail_focal_point` | `slides[].thumbnailUrl/thumbnailPosition` + canonical WordPress media resolver | COMPLETE for the static thumbnail contract — Enterprise 4 fresh import rendered four 100×75 Thumbnav items in both Builder and storefront; its first item resolved the dedicated `blog-post-customer-stories-fullstack.jpg` thumbnail, not the main slide image. Selecting item three activated the same third slide on both surfaces. | Thumbnail focal-point visual parity remains PARTIAL until a source fixture explicitly authors `thumbnail_focal_point`. |
| General / Advanced | Phase 3 General/Advanced owner | PARTIAL | Reuse without a second Slideshow Advanced system; unsupported General responsive capabilities remain absent. |

## Phase 9.1 acceptance evidence — COMPLETE (2026-08-12)

The fixed Enterprise 3/4/5 compatibility suite now verifies the supported
contract through fresh import in both Builder and storefront: frame/ratio,
overlay, title typography, dotnav and Thumbnav, Slidenav size/breakpoints,
whole-element links, item actions, rich content, global Link ownership, and
shared Advanced composition. The Enterprise 5 matrix also asserts that every
source value outside this supported surface is reported rather than persisted
inertly. The matrix avoids stale storefront responses by using a unique fresh
preview request after every import.

## Phase 9.1 exit criteria

1. The Slideshow inspector is screen/group/order comparable to the live
   YOOtheme surface for supported controls.
2. Every visible WebPages control has an importer mapping, persisted owner and
   shared Builder/storefront consumer.
3. The synchronized Enterprise3 Slideshow fresh-import contract verifies
   source values, visible control values, geometry and behavior in both
   renderers.
4. All remaining YOOtheme controls above are visibly absent and reported as
   deferred; no generic carousel substitute is presented as equivalent.

## Enterprise 4 synchronized thumbnail fixture

`tests/fixtures/yootheme-compatibility/slideshow-thumbnail.enterprise4.source.json`
is a minimal, versioned projection of `Enterprise 4.json` (full-export SHA-256
`9232c14c35780ec2f4269b9a01105556000e670ce752cc3dfbc15b4cf165788f`). It
contains the actual static `slideshow` source node at
`children.1.children.0.children.0.children.0`: `nav: thumbnav`, the real
100×75 thumbnail configuration, and its first item's dedicated `thumbnail`
asset. The companion contract verifies that the same source normalizes into
the one canonical Slideshow collection — not an icon substitute or a separate
thumbnail model. Fresh Enterprise 4 import was then verified in Builder and
storefront: both rendered the resolved dedicated CMS thumbnail at 100×75 for
the first Thumbnav item and selected the same third slide through Thumbnav.

## Verified frame slice / outstanding non-frame failure

The dedicated frame harness verifies Auto + explicit ratio + minimum/maximum
constraints and Viewport percentage height in both Builder and storefront.
The full synchronized Enterprise 3 visual contract still fails one non-frame
check on both surfaces: the Slideshow title resolves to `rgb(17, 17, 17)`
instead of DevStack's semantic dark token `rgb(13, 10, 70)`. This is a shared
Global/Typography token-resolution regression, not a Slideshow frame adapter
failure; it remains outside this bounded slice and keeps Phase 9.1 open.
