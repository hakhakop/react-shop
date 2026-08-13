# Phase 9.2 — Static Overlay Slider contract

Status: **COMPLETE — supported static scope (2026-08-12)**. This is the fixed acceptance boundary for the
YOOtheme `overlay-slider` element. It is derived from the synchronized static
Overlay Slider in Enterprise 5, YOOtheme's Overlay Slider inspector, and the
UIkit slider/overlay contract. A capability is not complete merely because it
has an importer field or an inspector control.

## Canonical ownership

`overlay-slider` JSON normalizes to the public WebPages `overlaySlider` block.
Its settings are owned by `carouselSettings.presentation = "overlay-slider"`.
`CarouselBlock` remains the single Builder/storefront runtime; its Overlay
Slider adapter owns only multi-item layout and per-item overlay presentation.
Shared Media, Title, Meta, rich content, Action, General and Advanced owners
remain shared. The legacy generic Slider is not a public compatibility element.

## Supported static contract

| YOOtheme group / source | Canonical WebPages owner | Required UI group and order | Shared runtime requirement | Status |
|---|---|---|---|---|
| Items (`overlay-slider_item`) | `slides[]` | Content → **Items** | Item title, meta, safe rich content, image and local action render in Builder/storefront | IN PROGRESS |
| Show title/meta/content/link | `carouselSettings.show*` | Content → **Display** | Suppress only the corresponding visible field | PARTIAL |
| `slider_width`, responsive width fields | `itemWidthMode`, `cardsPerViewPhone/Small/Medium/Large/XLarge` | Settings → **Slider**, **Item Width** | Fixed/auto mode and responsive item geometry affect the same Swiper track | IN PROGRESS |
| `slider_gap`, `slider_divider`, `slider_center`, `slider_finite` | `spaceBetween`, `divider`, `centered`, `loop` | Settings → **Slider** | UIkit-equivalent track geometry; divider only if its semantic adapter paints it | PARTIAL |
| `slider_autoplay`, interval, pause | `autoplay`, `autoplayDelayMs`, `pauseOnHover` | Settings → **Slider** | Shared Swiper behavior | PARTIAL |
| `nav`, `nav_below`, `nav_position`, `nav_position_margin`, `nav_breakpoint` | navigation owner | Settings → **Navigation** | Dotnav/none, position, flow-vs-overlay, margin and responsive visibility | MISSING |
| `slidenav`, position, margin, breakpoint | slidenav owner | Settings → **Slidenav** | UIkit-style arrows and responsive visibility | PARTIAL |
| show content fields and `text_align` | shared display + General text alignment | Content → **Display**; Advanced → **General** | Entire item content context uses shared General alignment | MISSING |
| `overlay_mode`, `overlay_display`, `overlay_position`, `overlay_padding`, `overlay_style` | overlay presentation owner | Settings → **Overlay** | Cover/caption, hover/always, position, padding and UIkit Overlay/Tile surface render identically | PARTIAL |
| title/meta/content typography | shared Title / Meta / rich-content owners | Settings → **Title**, **Meta**, **Content** | Parent defaults flow to each item; explicit item overrides win | MISSING |
| `link_text`, `link_style`, `link_size`, target, margin | shared Action/Button owner | Settings → **Link** | No URL means no manufactured action; local action precedes element default | PARTIAL |
| `overlay_link` | shared safe whole-card link owner | Settings → **Item** | Whole-overlay link must not create nested anchors | DEFERRED pending safe shared composition |
| custom class/attributes/scoped CSS | General/Advanced owner | Advanced → **General**, **Advanced** | Existing shared element shell only | COMPLETE |

## Explicit deferments

- Dynamic query/source bindings and item field binding: Phase 13.
- `show_hover_image`, `show_hover_video`, `show_video`: shared Media capability
  not yet supported; absent from the Overlay Slider inspector.
- `overlay_transition`, `overlay_transition_background`, parallax: no proven
  shared UIkit runtime; absent rather than stored inertly.
- `slidenav_outside_breakpoint`: requires a responsive outside-position
  contract; absent until that runtime exists.
- Per-item `text_color` / custom item element and whole-overlay linking remain
  deferred until the shared surface-context/link composition is safe and
  verified.

## Inspector contract

The visible YOOtheme-comparable order for the supported element-level surface
is: **Content** (Items, Display) → **Settings** (Slider, Item Width,
Navigation, Slidenav, Item, Overlay, Title, Meta, Content, Link) →
**Advanced** (shared General/Advanced). Item editing stays intentionally small:
Content is content/media/action data; item settings contains only fields that
are genuinely item-specific and rendered. Generic Card, icon, focal-point,
shadow and decoration panels must not be composed merely because they exist in
other WebPages elements.

## Acceptance

A fresh static Enterprise import must prove, for every supported row above:

`YOOtheme source → persisted WebPages setting → displayed inspector value →
shared CarouselBlock result in Builder → same storefront result`.

The Phase 9 harness remains the regression gate for responsive item geometry,
gap/divider, navigation visibility/placement, overlay geometry and action
visibility. A fresh Enterprise import was visually accepted in Builder and
storefront on 2026-08-12; the supported static Overlay Slider contract is
therefore complete. Deferred rows remain deliberately absent from the importer
and inspector until their shared capabilities exist.
