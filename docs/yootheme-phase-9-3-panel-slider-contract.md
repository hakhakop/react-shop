# Phase 9.3 — Static Panel Slider contract

Status: **COMPLETE — supported static scope (2026-08-12)**. This is the source-led acceptance boundary for the
YOOtheme `panel-slider` element. Enterprise 5 provides the active static
fixture: six linked SVG-icon panels, responsive `1-1` → `1-3` item widths,
default gap, divider, finite mode, outside slidenav, centered text and no
visible item action.

## Canonical ownership

`panel-slider` normalizes to public WebPages `panelSlider`, with
`carouselSettings.presentation = "panel-slider"`. It shares
`resolveCarouselPresentation` → `CarouselBlock` with Builder and storefront.
The Panel Slider adapter owns only its UIkit slider-grid/card composition;
Media, Typography, Meta, safe rich content, Action, General and Advanced
remain canonical shared owners.

## Supported contract matrix

| YOOtheme source | Canonical owner | Required inspector / order | Shared runtime | Status |
|---|---|---|---|---|
| `panel-slider_item` title, content, image, link | `slides[]` | Content → **Panel Slides** | actual item content/media/whole-panel link | COMPLETE |
| show title/image/meta/content/link | `carouselSettings.show*` | Settings → **Item** | only corresponding output hides | COMPLETE |
| `panel_link` | shared Panel/Card safe link owner | Settings → **Panel** (element-level) | valid whole-panel link without nesting action anchors | COMPLETE |
| responsive slider width | `itemWidthMode`, responsive `cardsPerView*` | Settings → **Slider**, **Item Width** | UIkit/Swiper track matches source widths | COMPLETE |
| gap/divider/center/finite/autoplay | `spaceBetween`, `divider`, `centered`, `loop`, autoplay fields | Settings → **Slider** | UIkit grid divider + shared behavior | COMPLETE |
| `slidenav`, margin, breakpoint | shared navigation owner | Settings → **Slidenav** | source `none` hides controls; `default`/`outside` and margin resolve once in the shared carousel adapter; arrows show only on overflow | COMPLETE |
| `nav` | navigation owner | Settings → **Navigation** | source `none` remains none; `dotnav` reaches the shared pagination runtime | COMPLETE |
| image width/height/loading/border/inline SVG/color | canonical Image media owners | Settings → **Image**, only supported Panel Slider image fields | real media DOM presentation | COMPLETE |
| title element/style and meta placement/element/style | canonical Title / Meta | Settings → **Title**, **Meta** | item override → element default → global role | COMPLETE |
| rich content | canonical Rich Text | Content item editor | sanitized HTML Builder/storefront | COMPLETE |
| item action | canonical Action/Button | Content item action only when source action exists | no manufactured action | COMPLETE |
| General text alignment | shared General owner | Advanced → **General** | panel text and structural image alignment follow the same element context where source requires it | COMPLETE |
| custom class/attributes/scoped CSS | shared Advanced owner | Advanced → **General**, **Advanced** | shared shell only | COMPLETE |

## Explicit deferments

- `panel_match` / equal-height sets: requires a shared item-height contract;
  not stored as inert state.
- `content_column_breakpoint`, title/image grid layout fields, title alignment
  structural layout, `icon_width`, hover image/video/video and media-grid
  semantics: deferred shared Media/Layout capabilities.
- image structural alignment (`image_align`) remains deferred; it must not be
  approximated by generic Image left/center/right alignment.
- `slidenav_outside_breakpoint`, hover video/image, parallax, `slider_sets`,
  and Dynamic Content/Field Binding (Phase 13) remain absent.

## Acceptance

Fresh Enterprise import must prove every supported row through:

`source → persisted value → displayed inspector → shared CarouselBlock in
Builder → identical storefront behavior`.

The six static Enterprise icon panels exercise responsive width, finite,
divider, outside slidenav, SVG media, whole-panel links and centered text. The
Phase 9 harness is the regression gate for layout and navigation geometry;
live visual Builder/storefront comparison is the release gate.

## Progress

The first shared-owner correction is complete: source-level Panel Slider Image
defaults now resolve through `resolveCarouselPresentation` into inheriting
items. An explicit item value still wins. This prevents an element-level
`image_width` such as Enterprise 5's 58px SVG icon width from being persisted
correctly yet ignored by `CarouselBlock`.

The global Panel ownership path is also corrected: source `panel_style`,
`panel_padding`, `panel_link_hover`, and `panel_link` now persist once on
`carouselSettings`. The Panel Slider Settings inspector composes one shared
**Panel** group, and the shared runtime resolves item override → element Panel
setting. Historic per-item values remain respected as overrides; new imports
no longer copy the parent setting into all six items.

The same boundary now applies to **Link**: item URLs remain item data, while
source `link_text`, target, style, size, full-width and margin normalize once
to the element Action owner. The item editor no longer presents duplicate
style/size controls, and the shared renderer creates an action only when an
item has a real URL.

Navigation normalization is now source-truthful as well: a YOOtheme
`slidenav: none` no longer becomes a truthy enabled control; `default` and
`outside` normalize to the existing shared overlay/outer placement values;
and `slidenav_margin` is a real element-level spacing token consumed by the
Panel Slider adapter. The Settings surface now represents these as one
**Slidenav** position/margin/breakpoint group and one **Navigation** type
group, rather than separate generic switches. The focused import contract
protects the `none`, `outside`, margin, breakpoint and dotnav cases.

## Fresh Enterprise 5 acceptance

The fresh imported Builder instance proves the supported contract directly:
the root has `uk-text-center`; all six titles are semantic `div` elements; and
every imported inline SVG media box is exactly `58 × 58px`. All six safe
whole-panel links are present, while the empty source `link_text` produces no
fabricated action. The track uses `uk-slider-items uk-grid uk-grid-divider`
with its source `-80px` leading gutter. After correcting the shared outside
slidenav adapter, this auto-width set is locked and its arrows are hidden: the
controls no longer consume item viewport width. Builder and storefront both
invoke `UikitSlider → resolveCarouselPresentation → CarouselBlock`, with no
separate Builder presentation path.
