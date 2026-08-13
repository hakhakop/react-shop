# YOOtheme / UIkit Compatibility Roadmap

## Purpose and operating rule

This is the permanent execution roadmap for semantic YOOtheme imports. It is
derived from the bundled YOOtheme package (`/Users/hakobjaghatspanyan/Downloads/yootheme`), including UIkit theme LESS, Builder element contracts, and real exported layouts such as `Home.json`. Import warnings are evidence, not the specification.

**Completion rule:** a capability is complete only when its YOOtheme source is
normalized into one existing canonical WebPages owner, exposed through its
normal inspector, persisted in the document/global model, resolved through the
shared resolver, and rendered identically by Builder and frontend. Tests and a
successful parse alone never make a capability complete.

### Status vocabulary

- **COMPLETE** — proven model → inspector → importer → resolver → Builder → frontend path.
- **PARTIAL** — a real canonical path exists but a source semantic, UI, or renderer is incomplete.
- **MISSING** — no canonical WebPages capability currently exists.
- **UNSUPPORTED** — deliberately outside product scope; importer must report it clearly and never store it as an inert value.

### Existing canonical foundations to reuse

| Concern | Canonical WebPages owner / shared path | Current status |
|---|---|---|
| Global tokens | `BuilderShellSettings` → `getUikitGlobalsCssVars` → `CanonicalGlobalStylesPanel` | PARTIAL |
| Semantic section backgrounds | `backgroundRole` → `resolveSectionBackground` | PARTIAL |
| Typography | `builderTypography` resolver and `TypographyPanel` | PARTIAL |
| Local appearance | `BuilderVisualStyle` / `StyleTabPanel` | PARTIAL |
| Image semantics | `resolveUikitImageSemantics` / `UikitImage` | PARTIAL |
| Shared UIkit classes | `uikitTokens.ts` | PARTIAL |
| Import boundary | `yoothemeImportContract.ts`, LESS importer, page importer | PARTIAL |

## Fixed phases

Each phase must be completed as a semantic capability family; do not implement a source field in isolation.

### 1. Global Styles — COMPLETE (supported scope)

**Phase 1 progress (2026-08-09):** the LESS importer now sends every known
Global Styles destination through the shared compatibility policy instead of
silently excluding the larger legacy destination table. Explicit semantic
anchors cover typography roles, Default/Muted/Primary/Secondary backgrounds,
spacing, gutters, section padding, Buttons, and Cards. The remaining existing
Global Styles destinations resolve through the same `BuilderShellSettings`
owner and `getUikitGlobalsCssVars` renderer. `@global-background` and
`@global-muted-background` now drive the canonical semantic CSS variables
rather than the legacy aliases, while legacy aliases remain fallback-only for
saved documents. `@button-border-width` and primary-hover shadow/gradient
values now reach their canonical shared renderer properties. Card Default,
Primary, Secondary, and corresponding hover shadows are exposed inside their
YOOtheme-aligned semantic state groups (including the generic Hover state),
not in a separate property-based shadow group.

**Fixture evidence:** the fresh scoped DevStack import currently populates
`backgroundDefault`, `backgroundMuted`, `backgroundPrimary`, and
`backgroundSecondary` as `#F7F8FC`, `#ECEEF6`, `#6F40F1`, and `#171258`, with
the imported Button/Card/spacing tokens stored in the same website-scoped
`BuilderShellSettings` owner.

**UI compatibility rule adopted:** every Global Styles screen is grouped by
the corresponding YOOtheme semantic owner/state. Shared geometry may precede
states, but variants keep their background, border, typography, shadow, hover,
and active tokens together. Property-only groups are not introduced.

**Live UI alignment (2026-08-09):** the supported Global Styles navigation now
follows the observed YOOtheme sequence: Global, then Accordion, Background,
Base, Button, Card, Container, Grid, Heading, Navbar, and Section. WebPages
Visibility is explicitly marked as WebPages-only and placed last. Card and
Button controls are ordered by their YOOtheme semantic owner/state, rather
than by CSS property. Shared dashboard theme tokens now drive Global Styles
text, muted text, placeholders, focus rings, disabled controls, and native
select options in both light and dark mode; live Builder inspection confirmed
readable labels in both modes. The canonical Global Styles editor also uses
one label/control row per setting (rather than a two-column card grid), and
the shared YOOtheme font picker now consumes those same theme primitives
instead of carrying dark-only inline colors.

**Current acceptance state:** the authenticated local Builder is reachable and
the Global → Typography screen has been visually verified in light mode with
the shared row layout and readable labels. Dark-mode contrast was also checked
through the same shared dashboard primitives. Runtime-configurable breakpoints
are now an explicit product exclusion: the UI exposes a read-only compatibility
note, and imports retain durable unsupported warnings without storing values
that no renderer consumes. Frontend parity and inherited-consumer checks are
evidenced by the authenticated Builder canvas and storefront preview using
the same imported variables.
The live authenticated Builder canvas and storefront preview now provide
evidence for the shared path: both resolve the imported `#F7F8FC` Default
background and Manrope family from the same canonical variables.

- **YOOtheme semantics:** `@global-*` typography, color, background, border, shadow, margin, gutter, control-height, breakpoint, container, section-padding, card, and button tokens from UIkit/theme LESS and `theme.devstack.less`.
- **Existing owners:** `BuilderShellSettings`, `GLOBAL_STYLE_TOKEN_DEFAULTS`, `getUikitGlobalsCssVars`, Canonical Global Styles editors.
- **Supported-scope ledger:** the shared LESS destination map, import contract, `BuilderShellSettings` defaults, canonical Global Styles screens, and `getUikitGlobalsCssVars` form one owner/consumer ledger for the supported token families. Unsupported breakpoint values are excluded at the contract boundary and represented by the read-only UI note.
- **Inspector/UI:** every imported global token must appear in its existing General, Background, Section, Container, Grid, Button, Card, Heading, or component Global Styles screen.
- **Import mapping:** LESS and JSON globals must normalize to the same shell property; JSON must not bake a global value into sections/elements.
- **Builder/frontend:** both roots must mount the same generated CSS variables and font loader.
- **Inheritance:** Global → component default → local override only; legacy aliases remain migration-only.
- **Explicit unsupported:** theme-only WordPress, WooCommerce, and plugin options without a WebPages owner.
- **Acceptance:** met for the supported scope: imported DevStack globals populate visible controls; Builder and storefront preview resolve the same background/font variables; semantic groups are editable and persisted; unsupported breakpoint imports remain explicit warnings and do not create dead state.

**Canonical color-context repair (2026-08-12):** Global Style tokens now also
own the normal/inverse runtime text context. The shared
`getUikitSemanticContextVars` resolver is used by both Builder and storefront;
it replaces their former independent light/dark Builder palettes. Both roots
mount `getUikitGlobalsCssVars`, normal headings inherit Global Emphasis, meta
inherits Global Muted, and dark semantic surfaces inherit Global Inverse.
Explicit local element colors still win. Live Enterprise verification measured
the normal Slideshow title at `rgb(13, 10, 70)` from the imported Emphasis
token and an inverse-section heading at `rgb(255, 255, 255)` in storefront;
the synchronized Builder/storefront Slideshow compatibility contract passes.

**Imported-document surface bridge (2026-08-12):** existing imported blocks
already carry the explicit `spacingContract: "yootheme"` provenance. At a root
containing that contract, legacy Builder page/surface/card/button aliases now
resolve to the canonical Global background, Card, and Button variables. This
is a compatibility bridge for old shared presentation consumers, not a second
style system. Native WebPages page-design presets do not receive the bridge
and retain their authored values. The fresh-import Slideshow harness verifies
the aliases match in Builder and storefront.

**Page-design migration rule (2026-08-12):** applying a YOOtheme page import
now replaces the document design layer with `{}`. During hydration, documents
whose blocks carry the same YOOtheme provenance retain that empty design layer
instead of receiving `defaultDesign`/Princity defaults again. This gives the
canonical Global Styles owner unambiguous precedence for imported pages while
leaving native documents on their existing preset path. Fresh-import coverage
asserts the persisted imported layout has `design: {}` before comparing Builder
and storefront.

**Legacy action bridge (2026-08-12):** imported-document roots now also map
the remaining Builder preview text, surface, and Button aliases to their
canonical Global Style tokens. Section semantic contexts provide the same
Button token path for Builder and storefront. This closes the old preview-only
palette bypass without changing native WebPages page-design behavior; the
fresh-import harness verifies preview text and Button background/text resolve
to the same Global values on both surfaces.

### 2. Section / Container — COMPLETE

**Phase 2 progress (2026-08-09):** live YOOtheme inspection confirmed the
Section screen order (section padding, semantic background states, responsive
padding tiers) and the Container screen order (default max width, horizontal
padding, responsive horizontal padding, xsmall/small/large/xlarge max widths).
WebPages now exposes the missing Container horizontal padding tokens and the
xsmall container tier through the existing Global Styles → Container editor.
LESS values `container-padding-horizontal`, `-s`, `-m`, and
`container-xsmall-max-width` normalize into `BuilderShellSettings`, generate
shared UIkit variables, and render through the same container CSS in Builder
and storefront. The duplicated Builder-only Section class calculation now
uses the existing frontend `getBuilderSectionClassName` helper, so height,
alignment, padding-removal, semantic background, title, overlap, and visual
classes have one path. Live Builder verification changed Small max width from
900px to 777px and observed the canvas max width change to 777px before
restoring the imported value.

Section JSON normalization now also recognizes the existing canonical fields
for title position/rotation/breakpoint, sticky cover/reveal, transparent
header/pull-under-header, header text color, section text color, and HTML
element. These values are not stored as source-only compatibility props; they
flow into `BuilderSection` and the shared Section class/render path.
The Builder preview no longer appends a second Section class implementation;
live Builder and storefront inspection now show the same canonical title-position
and rotation classes, the same normalized `xlarge` title breakpoint, the same
HTML-element marker, and the same imported `data-overlap-header="true"` state
for the transparent Hero. Builder interaction checks also changed Height to
Viewport (the shared `height-viewport` class and sticky positioning appeared),
changed Sticky Effect to Cover (the shared `data-uk-sticky` contract appeared),
and toggled Overlap (the shared `uk-section-overlap` class appeared and was
removed on reset). All temporary edits were restored to the fixture defaults;
the storefront uses the same SectionFrame class/attribute path.

The dedicated `tests/fixtures/section-acceptance.json` fixture now covers the
capabilities the imported Home page cannot exercise. The Playwright acceptance
test installs it through the normal layout API, verifies a real storefront
`<section>` tag, checks the dedicated title's left-top/left-rotation state,
switches to right-center/right-rotation, verifies the small breakpoint resets
rotation below the breakpoint, and compares Builder/frontend output before
restoring the original layout. Phase 3 remains untouched.

- **YOOtheme semantics:** section style/background role, width/expand, horizontal padding removal, vertical padding, height/viewport offset, vertical alignment, overlap, preserve color, HTML element, sticky, transparent header, title position/rotation/breakpoint.
- **Existing owners:** `BuilderSection`, semantic background resolver, section inspector, UIkit section/container classes.
- **Missing capability:** none within the supported Section / Container contract; no raw YOOtheme enum casts.
- **Inspector/UI:** Section Layout, Section Style, and Advanced must expose normalized width, padding, height, alignment, header, and title controls in YOOtheme-compatible order.
- **Import mapping:** `section/element.json` fields normalize once into `BuilderSection`; padding presets continue to inherit Global Styles tokens.
- **Builder/frontend:** share `SectionFrame` / section-class calculation or a single equivalent helper.
- **Inheritance:** background roles and padding scales derive from globals unless an explicit local override exists.
- **Explicit unsupported:** scroll effects or sticky variants without a shared WebPages behavior contract.
- **Acceptance:** met for the supported contract, including the dedicated Section fixture and Builder/frontend parity checks; unsupported scroll effects remain explicit.

### 3. General Element Settings — COMPLETE

- **YOOtheme semantics:** margin/removal, max width, visibility, block/text alignment, animation, custom CSS/classes/IDs, absolute positioning, offsets, z-index, origin/breakpoint behavior.
- **Existing owners:** `BuilderVisualStyle`, general inspector panels, `visualStyleToCss`.
- **Completed capability:** responsive visibility normalization, responsive max-width/block/text alignment classes, semantic margin presets/removal, shared positioning/offset/z-index/blend output, and consistent wrapper consumption across Heading, Image, Panel, and Grid.
- **Remaining explicit gap:** transform-origin/advanced transform behavior and arbitrary source selector CSS remain outside the supported contract.
- **Inspector/UI:** one General/Advanced group reused by every supported block; controls unavailable to a block must be absent rather than inert.
- **Import mapping:** normalize common General source props before element-specific mapping.
- **Builder/frontend:** every supported block wrapper applies the same `visualStyleClassName`/`visualStyleToCss` output. Panel normalization now preserves `visualStyle`; Grid no longer bypasses the shared General class path. Storefront shells expose the canonical block id for fixture verification.
- **Inheritance:** global spacing tokens feed local semantic spacing presets; source CSS is unsupported unless an explicit safe custom-style product feature is adopted.
- **Explicit unsupported:** arbitrary YOOtheme selector CSS, transform-origin/transform controls, and parallax runtime behavior without a shared animation engine.
- **Acceptance evidence:** `tests/general-element-settings.spec.ts` installs `tests/fixtures/general-element-acceptance.json` through the normal importer/API, clears the test-context Builder draft cache, verifies four imported blocks, reloads Builder, checks visible position/offset/z-index/margin/max-width/alignment/animation/visibility output for Heading, Image, Panel, and Grid, then compares the same semantic measurements and responsive classes in storefront before restoring the original layout. Its positioned-Image regression guard reimports the Image with an absolute outer-shell offset, verifies that the API payload was actually loaded, and requires the inner image wrapper to remain static, visible, and sized in both renderers. The live Builder and storefront inspection confirms the same single-owner boundary: the outer shell owns General positioning while the Image component owns only media semantics. The live Builder inspector was also checked against the YOOtheme General screen: Static/Relative/Absolute position, offsets, z-index, blend, margin/removal, max width/breakpoint, block/text alignment/fallback, animation, and visibility controls are present and editable.

### 4. Typography / Heading / Text — COMPLETE

**Phase 4 progress (2026-08-09):** live YOOtheme Heading inspection established
the supported screen order as Content/Link, then Settings → Title (Style,
Decoration, Font Family, Color, linked hover, HTML Element), followed by the
shared General group. WebPages retains that existing Heading structure and
does not add a parallel Typography panel. The canonical Title group now carries
YOOtheme's complete supported Heading style vocabulary including Heading
3X-Large, 2X-Large, X-Large, Large, Medium, Small, H1–H6, and Text
Meta/Lead/Small/Large, plus the semantic `div` HTML element. `title_font_family`
normalizes into the existing semantic Font Family role (Default/Primary/
Secondary/Tertiary), not a literal-font compatibility field.

The existing `UikitHeading` and `UikitText` renderers remain the only renderer
path for Builder and storefront. The shared title CSS was corrected so an
inherited Heading resolves Heading Global → legacy component default instead of
incorrectly falling back to Primary. Explicit semantic roles still override that
chain. Text now exposes its native YOOtheme Text group through the normal
Settings inspector: style, semantic color, drop cap, responsive columns,
column dividers, and HTML element. These fields normalize once at import and
render through the shared Text component; no per-fixture adapter or media
behavior was added.

- **YOOtheme semantics:** heading/text element/style/size, semantic primary/secondary/tertiary fonts, font family/weight/style/size/line-height/letter spacing/transform/color, text/meta/title roles.
- **Existing owners:** `BuilderShellSettings` typography tokens, `builderTypography`, `TypographyPanel`, `UikitHeading`, `UikitText`.
- **Missing capability:** none within the supported Heading/Text contract. Grid/Panel/Slider title/meta typography remain their own Phase 7–9 presentation work, rather than duplicating Heading/Text ownership.
- **Inspector/UI:** Global Typography roles, the existing Heading Title group, and the existing Text group express Inherit versus explicit semantic override consistently; no parallel Typography panel exists.
- **Import mapping:** global LESS/JSON typography goes to shell; `title_font_family` maps to the Heading role; explicit raw typography remains in the existing local typography object; Text style/color/dropcap/columns/HTML semantics map to the Text owner.
- **Builder/frontend:** consume `resolveTypographyInput`, semantic role classes, shared font registration, `UikitHeading`, and `UikitText`—not element-specific CSS paths.
- **Inheritance:** Global role → component default → element override; reset restores inheritance.
- **Explicit unsupported:** a font without a registered, permitted source or weight variant; arbitrary inline source CSS and transform behavior remain General/Advanced exclusions.
- **Acceptance evidence:** `tests/fixtures/typography-acceptance.json` imports a Heading with 3X-Large/Primary/Secondary/`div` semantics and a Text element with Lead/Primary/drop-cap/two-column/divider/small-breakpoint/`aside` semantics. `tests/typography-element-acceptance.spec.ts` installs it through the normal importer/API, changes Global Heading and Primary families to visibly distinct registered fonts, verifies the imported Primary override in Builder and storefront, then removes that local role and verifies Heading Global resumes identically. It also verifies tags, classes, responsive columns, and Builder/storefront computed parity before restoring all data. Live YOOtheme and WebPages Heading/Text inspector comparison confirmed comparable screen and Title/Text-group order.

### 5. Image / Media / Positioning — PARTIAL (reopened for hero composition acceptance)

- **YOOtheme semantics:** `image_width`, `image_height`, ratio, fit, focal/position, loading, border, shadow, decoration, alignment, image-grid width/breakpoint, inline SVG/color/strokes, image link/modal/lightbox, hover image/video, media position.
- **Compatibility resolution:** the implicit historic `cover` default is migrated once to canonical `natural`; an explicit modern Cover setting is preserved. Natural uses the browser’s non-cropping baseline, so an imported image is not silently framed or cropped.
- **Canonical owner:** `resolveUikitImageSemantics` / `getUikitImageStyle`, with `ImageSettingsGroup` as the one inspector surface. `UikitImage`, `GridCardsClient`, Panel, and Carousel consume that contract through narrow adapters; General element positioning remains Phase 3 ownership.
- **Inspector/UI:** Image Settings provides Width, Height, Ratio, Fit (Natural / Cover / Contain / Fill), Focal Point, Loading, Border, Box Shadow, Decoration, Link, and Alignment. The legacy Image Layout surface uses the same Natural default.
- **Import mapping:** `image_width`, `image_height`, `image_fit`, `image_ratio`, `image_position`, `image_align`, and `image_loading` normalize into `image*` fields. Grid width normalizes to the existing `gridMediaWidth` adapter; legacy `imageMaxWidth` remains read-compatible only.
- **Builder/frontend:** standalone Image, Grid, Panel, and Panel Slider use shared dimension, focal, loading, and natural-fit semantics. Their active Builder and storefront paths were verified together.
- **Inheritance:** global media defaults apply where the element has no explicit override.
- **Explicit unsupported:** inline SVG manipulation/color/stroke animation; hover image/video asset switching; modal/lightbox links; and responsive `image_grid_breakpoint`. They stay importer warnings because WebPages has no safe shared asset/interaction or responsive-media-width owner yet.
- **Reopened acceptance:** the previous fixture only proved stored dimensions/non-cropping behavior. It did not prove imported DevStack hero composition: media-sized absolute anchors, main-image aspect presentation, play-control placement, and decorative image scale/placement must be compared visually in the live YOOtheme and WebPages fixture. Standalone Image Settings must also follow the live YOOtheme Content/Settings separation: Width/Height are Content controls; Focal Point, Loading, Border, Shadow, and Decoration remain Settings; WebPages-only framing controls must not appear as fake YOOtheme Settings controls.

### 6. Button / Links — COMPLETE

**Verified completion (2026-08-09):** Button, Panel action, and Grid action
normalize YOOtheme Default, Primary, Secondary, and Text/Link styles into one
canonical UIkit variant vocabulary. `UikitButton` owns multi-action
`buttons[]`; the Button Content inspector exposes that exact collection with
add, remove, reorder, per-item label, URL, target, and style controls. Legacy
singular button fields remain read-compatible only when `buttons[]` is absent.

Panel uses its existing shared Action group and Grid now uses
`resolveCanonicalGridAction`, so imported `link_style`, `link_target`,
`link_size`, `link_fullwidth`, and `link_margin` converge on the same
canonical action fields consumed in both Builder and storefront. A shared
typography wrapper no longer appends a legacy Primary class to an already
resolved UIkit variant, and the Builder Panel action no longer receives the
legacy preview CTA typography that overrode the Global Button large-size
tokens. Global Button CSS variables remain the sole visual owner for family,
weight, transform, variant, size, radius, padding, line height, and shadow.

Focused fresh-import coverage in
`tests/button-links-acceptance.spec.ts` imports a Button Items collection,
Panel action, and Grid action through the production importer; publishes an
Item edit; then proves Builder/storefront class and computed-token parity.
It verifies Primary/Text Large and Secondary Large/Default Small variants,
full-width, `_blank`/`noreferrer`, and Panel/Grid link margins. The test
passes together with `npx tsc --noEmit`. The currently open Builder tab has
an explicitly unsaved local draft and was deliberately not overwritten during
this verification; the isolated fresh import is the authoritative persisted
comparison.

- **YOOtheme semantics:** button/link style, size, state colors/borders/shadows/gradients, typography, target, full width, margins, panel/image/title links, modal/dialog links.
- **Existing owners:** button shell tokens, `UikitButton` classes, button inspector/style controls, `builderLinkTargetProps`.
- **Missing capability:** modal/dialog/offcanvas navigation policy only.
- **Inspector/UI:** existing Button and Link controls show variant, size, target, width, and explicit link behavior.
- **Import mapping:** `button_style`, `link_style`, `link_text`, `link_target`, size/margins normalize to canonical button/link fields.
- **Builder/frontend:** `UikitButton`, Panel action, and Grid action consume the same UIkit token classes and target helper; the Builder uses the same action resolver as storefront.
- **Inheritance:** global button tokens → component variant → local explicit fields.
- **Explicit unsupported:** YOOtheme dialog/offcanvas links until WebPages has one canonical modal/navigation interaction.
- **Acceptance:** met for supported Button, Panel action, and Grid action semantics: fresh import, normal inspector editing/persistence, Global token resolution, Builder/storefront class and computed-style parity, targets, full width, and link spacing. Dialog/offcanvas links remain intentionally unsupported.

### 7. Panel / Card — COMPLETE

- **YOOtheme semantics:** panel/card/tile variants, padding, hover, whole-panel links, media placement/width, title/meta/content order, image-without-padding, and height/expansion behavior.
- **Canonical owners:** `panelVariant`, `panelSize`, `panelHover`, `linkPanel`, `panelImageNoPadding`, `panelHeightExpand`, `panelExpand`, and `panelMetaPosition` on the existing Panel block. `resolvePanelPresentation` is the sole presentation resolver, used by both `DashboardBuilder` and `StorefrontBuilderRenderer`; existing Global Card variables remain the surface, text, border-radius, and shadow owner.
- **Inspector/UI:** verified against the live YOOtheme Panel screen: one canonical Settings composition in the order **Panel** (Style, Link, Hover, Padding, Image without padding, Height, Expand Content), **Title**, **Meta**, **Content**, **Image**, **Link**, then shared **General**. The former duplicate `layout` + `style` composition was removed. `Card Hover` is imported as the canonical Default-card + `panelHover` state and is exposed only by **Add hover style**, not as a second Style option. Panel media placement/grid width now live in the **Image** group under the matching Alignment/Grid width semantics; the overlapping Image alignment, standalone Image Layout group, and non-YOOtheme Show action switch are absent. Width/ratio/fit remain internal canonical media semantics, not false YOOtheme Panel Image controls.
- **Import mapping:** `panel_style` (including Card Hover and tile variants), `panel_padding`, `panel_link`, `panel_link_hover`, `panel_image_no_padding`, `height_expand`, `panel_expand`, `meta`, and `meta_align` normalize into those owners. Legacy `panelStyle` remains a compatibility read alias and cannot mask an imported Primary/Secondary canonical variant.
- **Builder/frontend:** both render through `resolvePanelPresentation`; the same UIkit classes govern Card/Tile variant, padding, hover, whole-panel link overlay, media padding, meta position, and expansion. Linked panels suppress the separate action exactly as YOOtheme makes the panel link the primary action.
- **Inheritance:** Global Card tokens → canonical Panel variant/padding/hover → explicit local Panel state. No Panel-specific global color/shadow system was added.
- **Explicit unsupported:** responsive `image_grid_breakpoint`, hover image/video, modal/lightbox interaction, and YOOtheme text/link sub-controls for which no canonical WebPages consumer exists remain absent and reported by the importer; they are not stored as Panel-only compatibility state.
- **Acceptance:** met. `tests/panel-card-acceptance.spec.ts` fresh-imports a Card Primary Panel and proves canonical persistence, padded media, 40px Card Large body padding, height/content expansion, below-content meta order, whole-panel `_blank` link, hover class, action suppression, inspector values, and Builder/storefront parity. It also asserts exactly one Panel Settings composition and verifies the cleaned surface has no Card Hover duplicate, Image Layout group, or Show action toggle, while the canonical Panel media alignment/grid-width controls remain populated. Type-check passes. In the live DevStack Builder/storefront, the existing imported Panel inspector was compared directly with the YOOtheme Panel screen and the resulting single composition left Panel rendering unchanged.

### 8. Grid — COMPLETE

**Phase 8 completion (2026-08-10):** `GridCardsClient` is now the one
canonical Grid presentation/runtime path. `DashboardBuilder` supplies only
Builder adapters: selection, Inspector entry, duplicate/delete controls, and
HTML drag/reorder handlers. It no longer owns a second Grid layout, card,
media, filter, action, or lightbox presentation implementation. The adapter
preserves source item indices after filtering, so copy/delete/reorder always
operate on the persisted collection rather than its temporary filtered view.

The Grid inspector was reduced to controls with active canonical consumers:
**Grid**, **Columns**, **Filter**, **Lightbox**, **Panel**, **Title**, **Meta**,
**Content**, **Image**, and **Link**. Masonry, parallax, filter animation, and
video/hover-media visibility controls were removed rather than retained as
inert compatibility state. Filter uses `enableFilter` / `filterStyle`; lightbox
uses `enableLightbox`; Panel uses `gridCardVariant` / `gridCardSize` /
`gridCardHover`. `panel_style: card-hover` now maps to the canonical default
Card surface plus hover state, including per-item card-hover imports.

- **YOOtheme semantics:** source/content items, responsive columns, column/row gaps, dividers, alignment/justify, masonry, parallax, filters, lightbox, item media, panel/card, title/meta/content/link layout and visibility.
- **Existing owners:** grid block, `GridCardsClient`, Grid inspector/style controls, UIkit grid/card helpers.
- **Missing capability:** none within the currently supported static Grid surface.
- **Inspector/UI:** Grid layout/media/presentation groups reflect the same owner contract as Panel and Image. Supported values appear once, in the YOOtheme-comparable order above.
- **Import mapping:** Grid source fields map to grid-level canonical controls; item fields map to item content only. `card-hover` maps to default Card + canonical hover rather than a parallel variant.
- **Builder/frontend:** both render `GridCardsClient`; Builder-only item chrome decorates shared cards and never owns Grid presentation.
- **Inheritance:** global gutters/card tokens and shared media/typography presentation values must apply unless overridden.
- **Explicit unsupported:** masonry, grid parallax, item animation, hover image/video, video, advanced filter layout/alignment/width/breakpoint configuration, `lightbox_bg_close`, and WordPress dynamic query grids. They remain absent from the inspector and continue to be reported by the importer; the supported local category filter and lightbox enablement are not presented as equivalents for those advanced YOOtheme behaviors.
- **Content-tab and final acceptance:** The real Pricing fixture proves that Grid item `title` and `content` are rich HTML, not plain strings. They normalize through the shared safe rich-text boundary; Title accepts safe inline markup and Content uses the canonical **Visual | HTML** editor. A live Pricing-item round trip verified headings, paragraphs, strong/emphasis, and links in Source → Visual → Publish → reload; the persisted safe link gained its expected `rel` value, and the original nested imported UIkit markup was restored and survived reload unchanged. `GridCardsClient` consumes the resulting sanitized rich HTML for both Builder and storefront rather than rendering it as a plain string. Source `tags` maps to the canonical `gridItems[].tags` array, which is the same data consumed by shared Grid filtering. `filter: true` and `filter_style` map to the existing Grid filter owner so fresh Pricing imports expose Monthly/Yearly filter controls. An item `panel_style` is retained only when explicitly authored and resolves before the inherited Grid Card style; an unstyled item remains **Inherit Grid Style**. Colored Primary/Secondary Cards and Tiles now resolve title, meta, content, links, and default/text actions through the shared Global Card role tokens, while explicit local color utilities still win. Imported `/wp-content/uploads/...` fields resolve once at the shared Builder document boundary with the configured CMS origin; absolute URLs and non-WordPress WebPages assets remain unchanged. Live Builder/storefront inspection of the imported DevStack Pricing page confirmed matching Primary Card inverse text/title surfaces. Focused Grid coverage protects rich content, tags, explicit item Card style, shared rendering, inverse Card semantics, and CMS media-URL normalization.

### 9. Slider / Slideshow / Overlay — COMPLETE — supported static scope

**Phase 9.2 — Static Overlay Slider contract: COMPLETE — supported static scope (2026-08-12).**
The fixed source-led matrix is
[`yootheme-phase-9-2-overlay-slider-contract.md`](./yootheme-phase-9-2-overlay-slider-contract.md).
The former generic Carousel/Card inspector is no longer the Overlay Slider
surface: its visible Settings order is now Slider, Item Width, Animation,
Navigation, Slidenav, Item, Overlay, shared Title/Meta/Content/Link, followed
by shared Advanced. Import normalization now preserves the static Enterprise
source's width mode/responsive widths, title/meta defaults, element Action
defaults, and navigation/slidenav descriptors without copying parent actions
onto items. The shared runtime now consumes General text alignment for both
Builder and storefront and uses a distinct UIkit-dotnav Overlay Slider adapter
instead of generic bar pagination. A fresh Enterprise import was visually
accepted in Builder and storefront; deferred Dynamic Content, hover Media,
unproven transitions and safe whole-overlay linking remain explicitly outside
this completed static scope.

**Phase 9.3 — Static Panel Slider contract: COMPLETE — supported static scope
(2026-08-12).**
The source-led matrix is
[`yootheme-phase-9-3-panel-slider-contract.md`](./yootheme-phase-9-3-panel-slider-contract.md).
Enterprise 5’s six-panel icon Slider is the acceptance fixture. Its supported
static contract is complete through canonical Panel Slider composition and
shared owners; layout/media/dynamic fields without a proven canonical runtime
remain explicitly deferred rather than becoming inspector-only settings.
The current pass also makes UIkit navigation values source-truthful:
`slidenav: none` suppresses controls; `default`/`outside` normalize once into
the shared navigation placement; and source slidenav margin is a real
element-level token rather than an ignored import value. Fresh Enterprise 5
acceptance proved six 58px SVG media boxes, centered semantic titles, six
whole-panel links without a fabricated action, UIkit grid/divider structure,
and correctly hidden slidenav when the auto-width set fits. Focused type and
carousel-contract coverage passes.

**Phase 9.1 — Static Slideshow contract: COMPLETE (2026-08-12).** The
permanent source-led ledger is
[`yootheme-phase-9-1-slideshow-contract.md`](./yootheme-phase-9-1-slideshow-contract.md).
It records the live YOOtheme Slideshow screen, synchronized Enterprise3 source
fields, existing canonical owners, supported scope, and every explicit
deferment. The finalized ledger is the acceptance boundary before Phase 9.2
(Overlay Slider) or Phase 9.3 (Panel Slider) resumes. The prior generic carousel
"Navigation Presentation" surface is not evidence of Slideshow compatibility.
Current verified implementation progress: source `nav_*` / `slidenav_*` values
now normalize into the shared carousel owners and are composed through the
Slideshow-specific Navigation and Slidenav groups. The bounded Slideshow frame
contract is now verified by fresh-import Builder/storefront harnesses: Auto
ratio + min/max constraints and Viewport percentage height share the same
runtime geometry, and the supported Height group follows YOOtheme's practical
order (Height, Ratio, Min Height, Max Height). Slideshow now also composes the
shared Title, Meta, Rich Content, Action, and General/Advanced owners rather
than a local substitute; item actions preserve authored link values and do not
render when no source URL exists. `height_expand`, thumbnail SVG styling, and
Slidenav outside breakpoint are deliberately reported as deferred rather than
persisted as inert Slideshow settings. The fixed Enterprise 3/4/5 source-led
acceptance matrix has now passed: static
source mapping, truthful deferment reporting, comparable Content/Settings/
Advanced composition, and shared Builder/storefront behavior.

**Responsive navigation evidence (2026-08-12):** the synchronized Enterprise3
source uses YOOtheme `s` for both `nav_breakpoint` and `slidenav_breakpoint`.
Fresh-import tests now verify that both controls are hidden at 639px and
visible at 640px in Builder and storefront. The shared Slideshow CSS takes
precedence over Swiper's inline pagination display, so this source semantic
cannot fall back silently to **Always**.

- **YOOtheme semantics:** **Slideshow** is an image/video-led, one-item presentation with slideshow height/ratio, transition, text/overlay placement, dot/thumb navigation and slidenav. **Overlay Slider** is a responsive multi-item slider with fixed/auto item-width mode, breakpoint widths, gap/divider/center/finite behavior, and a per-item overlay (cover/caption, display, style, position, padding and whole-overlay linking). These are distinct public element contracts, not aliases.
- **Canonical owners:** public WebPages **Slideshow** and **Overlay Slider** elements now own their distinct persisted `carouselSettings.presentation` values and share one `resolveCarouselPresentation` → `CarouselBlock` runtime. `Panel Slider` remains a presentation adapter over that runtime. The previous generic `slider` kind remains renderable only as a legacy document compatibility alias and is removed from the Element Library.
- **Inspector/UI:** both elements use the normal Content / Settings / Advanced composition. Slideshow now exposes rendered Auto/Viewport height, ratio, Slide/Fade transition and YOOtheme-style Title/Meta/Content/Link display toggles. Overlay Slider exposes rendered responsive columns, gap/divider, centering and its shared Overlay Mode/Display/Position/Padding contract. Existing shared media, actions, navigation and General/Advanced owners remain the only owners of those semantics.
- **Import mapping:** YOOtheme `slideshow` normalizes to the first-class `slideshow` owner, `overlay-slider` to `overlaySlider`, and `panel-slider` to the existing Panel Slider adapter; none are coerced into another carousel form. All map only settings currently consumed by the shared runtime. Unrendered overlay modes/transitions remain reported rather than stored inertly; dynamic sources are deferred to Phase 13.
- **Builder/frontend:** both route every public semantic adapter through the same carousel resolver and `CarouselBlock`; Builder editing chrome remains outside that presentation path.
- **Inheritance:** Global Slider defaults → semantic carousel settings → slide-local shared Media/Action overrides.
- **Verified static acceptance:** Slideshow, Overlay Slider and Panel Slider are the only public carousel elements; all persist through the same resolver/runtime. Fresh synchronized Enterprise imports were accepted for the supported static Slideshow and Overlay Slider contracts. Enterprise 5 proves the Panel Slider static contract: six linked 58px SVG panels, centered semantic titles, UIkit grid/divider track, correct auto-width lock behavior and no invented action. Builder and storefront share the same `UikitSlider → resolveCarouselPresentation → CarouselBlock` path.
- **Deferred / unsupported by product decision:** Dynamic Content / Field Binding is Phase 13; static video, cross-section `Viewport (Subtract Next Section)`, parallax, source-specific responsive outside-navigation breakpoints, and unproven UIkit transition modes remain absent rather than inert. These do not change the completed supported static scope.
- **Acceptance:** all supported static Slider / Slideshow / Overlay semantics must retain source → canonical owner → inspector → shared Builder/storefront behavior. Focused carousel/import contracts are the regression gate; synchronized fresh imports and live comparison are the release evidence.
- **Explicit unsupported for now:** parallax, Ken Burns, thumbnail SVG/color controls, and overlay transitions/modes without a proven shared runtime remain absent from the inspector and importer mapping.
- **Acceptance:** fresh imports and live YOOtheme comparison must prove each supported Slideshow/Overlay Slider control has the same persisted, Builder and storefront behavior before this phase can become COMPLETE.

### 10. Responsive behavior — COMPLETE (supported scope)

- **YOOtheme semantics implemented:** fixed UIkit semantic tiers `s/m/l/xl`; imported/global tier values; General responsive width, block/text alignment and visibility; Section title breakpoint; Grid column cascade; Text columns; supported carousel navigation/slidenav visibility; Panel Slider fixed responsive item-width cascade.
- **Canonical owner:** `shellSettings.breakpointSmall`, `breakpointMedium`, `breakpointLarge`, `breakpointXLarge`, validated as a strictly ascending positive policy by `resolveResponsiveBreakpointPolicy()`.
- **Inspector/UI:** Global Styles › Global › Breakpoints exposes the four canonical values. YOOtheme LESS import writes the same fields and reports them as supported.
- **Builder/frontend:** `ResponsiveBreakpointPolicyStyle` emits scoped rendered-page media rules from the active policy. Builder preview retains a real pixel width and adds its resolved `data-responsive-preview-tier`, allowing its device frame to follow the same semantic tier as storefront without changing dashboard responsiveness. Carousel JavaScript consumes the same resolved policy; it owns no parallel numeric table.
- **Inheritance/runtime:** responsive values retain UIkit forward fallback. General responsive fields remain owned by `visualStyle.layout`; legacy runtime-only UIkit visibility/text-column classes were replaced with policy-scoped equivalents, without duplicating persisted document state.
- **Verified acceptance (2026-08-12):** default `640/960/1200/1600` and imported custom `700/1000/1280/1680` policies are checked at threshold −1, exact threshold, and threshold +1 by the shared tier resolver. Builder preview resolves its semantic tier from its actual canvas width and overrides browser-window media queries through the same scoped policy. Builder and storefront agree for a real imported-policy responsive probe covering General, Section title, Grid, Text, navigation/slidenav, and the policy passed to Panel Slider fixed item-width behavior. A fresh YOOtheme LESS import changes the active policy and the real responsive probe at its imported threshold; restoring the default policy restores the original tier behavior.
- **Explicit deferred:** media-grid/image responsive layout semantics without an exact canonical owner; Dynamic Content; dashboard/application-shell breakpoints; source-specific Slidenav Outside Breakpoint and other specialized carousel breakpoints without a proven runtime contract. These remain absent rather than stored inertly.

### 11. Remaining supported elements — COMPLETE (verified static scope)

**Phase 11.3 — Gallery: COMPLETE (verified static scope).**
Static YOOtheme `gallery`/`gallery_item` now retain Gallery identity and map
ordered static image source/alt, title, meta, sanitized rich content, tags,
ordinary item links with target/ARIA label, display flags, column/row gaps,
divider, caption/cover mode, and the shared image width/height/loading/border
subset. The existing shared `UikitGallery` renderer consumes the canonical
model in both Builder and storefront; its item editor now uses the canonical
rich-content and Link controls, and Advanced composes the shared Element
Advanced owner. Source `lightbox: true` now maps to the shared real UIkit
Lightbox runtime rather than the native Gallery modal, retaining source item
order, media link triggers, and supported title/content captions in Builder
and storefront. Source `overlay_link` maps to the same canonical Gallery
whole-media link owner: it produces a separate accessible overlay trigger,
uses that UIkit lightbox trigger when enabled, and never nests the visible
action anchor. Advanced UIkit lightbox options (controls, counter, background
close, animation, navigation, media dimensions/orientation, video autoplay,
and text color) remain explicitly deferred. Responsive grid-column cascade,
masonry, parallax,
filter/navigation, video/hover media, per-item focal/color overrides, and
overlay style/position/padding/transition remain explicitly deferred until an
exact shared runtime exists. Focused static import contracts pass; Phase 11.3
has synchronized fixture acceptance for the supported static subset in Builder
and storefront.

**Phase 11.2 — Accordion and Table: COMPLETE (verified static scope).**
Static YOOtheme `accordion`/`accordion_item` now normalizes into the native
`UikitAccordion` collection: source item order, title, sanitized rich content,
top/bottom image, per-item link and target, show-image/show-link,
multiple/collapsible behavior, content style/margin, image width/height/loading/
border, and shared Action presentation all retain canonical owners. The
Accordion Content editor now uses the shared rich-text owner and its Advanced
tab is the shared `ElementAdvancedPanel`. Side-media grid layout, content
drop-caps/columns, SVG styling, and danger actions are reported as deferred
because their existing Accordion paths are not exact canonical consumers.

Static YOOtheme `table`/`table_item` now normalizes into the native Table
model for the verified subset: source order of title/meta/content/image/link cells,
headers, sanitized rich text cells, Default/Divider/Striped style, hover,
justify, row size, vertical alignment, overflow/stacked responsive mode and
last-column alignment. Authored row media and actions retain source URL, alt,
label, target and verified presentation through the canonical Image and
Action/Link owners; `show_image` and `show_link` suppress their respective
cells without manufacturing content. `UikitTable` consumes that same persisted
model in both Builder and storefront with canonical UIkit table classes.
Per-cell typography/color, SVG animation and unproven field-width semantics
remain explicitly deferred. Focused contracts and synchronized Enterprise8
fresh-import Builder/storefront acceptance pass. The Table Content tab is a
canonical repeatable **Items** collection: it supplies add/copy/delete/reorder
and opens one item at a time for source-truthful Image, title/meta/rich
content, and per-row Link URL/label editing. Element-level Link target/style/
size remain in Settings, matching YOOtheme ownership. A live item edit was
persisted through Builder and storefront, then restored to the synchronized
fixture value.

**Phase 11.1 — Alert, Icon, List: COMPLETE (verified static scope).**
The importer now recognizes static `alert`, `icon`, `list`, and `list_item`
source nodes as first-class WebPages blocks rather than degrading them to text
or generic HTML. Alert maps its UIkit style/size, title element/style/inline
presentation, rich content, content style/margin, and optional link through
`UikitAlert`, shared Typography/Rich Text/Link, and shared General/Advanced.
Icon maps only registry-resolved UIkit icons, width, semantic color, optional
link/target/ARIA label and link style through `UikitIcon`; an unavailable
source icon is reported and never substituted. List maps the verified static
collection order, sanitized rich item content, item link/target/icon,
vertical/horizontal list type, marker/marker color, divider/striped/spacing,
list element/nav wrapper, show-link, icon visibility/size/color and link
style through `UikitList`. The three Inspector surfaces compose their
canonical Content/Settings owners and the shared `ElementAdvancedPanel`, not
element-local Advanced copies. List item image/SVG framing, responsive
columns/dividers, vertical media placement and any dynamic source are
explicitly deferred because List has no exact shared media/column runtime for
them yet. Focused static import contracts pass; this sub-phase remains
**PARTIAL** until a synchronized YOOtheme fixture containing all three source
elements verifies persisted Builder/storefront parity and visual behavior.

- **YOOtheme semantics:** Accordion, Alert, Gallery, List, Table, Map, Social, Nav, Switcher, Tabs, Countdown, Video, Icon, form/content-source elements and WordPress-specific modules.
- **Existing owners:** WebPages block vocabulary, `uikitCapabilities.ts`, existing UIkit element components.
- **Missing capability:** capability inventory that distinguishes structural recognition from an actual WebPages consumer.
- **Inspector/UI:** each supported element owns an explicit capability declaration and inspector surface.
- **Import mapping:** source type is importable only after semantic fields have a canonical destination; otherwise report as unsupported type/feature.
- **Builder/frontend:** each consumer must share a renderer/helper, not separate preview-only markup.
- **Inheritance:** typography, colors, spacing, media, and global tokens use the same foundations above.
- **Explicit unsupported:** WordPress dynamic queries/modules and plugin-specific source adapters unless WebPages implements equivalent data providers.
- **Acceptance:** every advertised supported source type has at least one fixture and a complete visible semantic path.

### 12. Importer + fixture acceptance — COMPLETE (registered compatibility scope)

- **YOOtheme semantics:** all source fields in Builder `element.json`, UIkit/theme LESS, and real exports.
- **Existing owners:** LESS importer, page importer, import contract, import reporting UI, fixture tests.
- **Implemented evidence:** repository fixture registry and field-level semantic registry; registry-backed grouped import reports; fresh-import Builder/storefront runner with SHA validation, scoped-draft replacement, persisted reload/restore, font/media/SVG readiness, UIkit runtime readiness, and layout-stability checks. Batch 3 representative acceptance passed on 2026-08-12: Enterprise7 (ordinary static Alert/Accordion), Enterprise3 (Panel Slider geometry), Enterprise6 (UIkit Grid masonry/Lightbox).
- **Batch 4 release-gate evidence (2026-08-12):** `npm run test:yootheme-compat:strict` validates registry source hashes, per-fixture status baselines, contracts, all six real fresh-import/reload/Builder-storefront/restore runs, and explicit deferred/intentional status visibility. The final Phase 10 boundary repair ensures the Enterprise3 Slideshow navigation and slidenav are hidden at 639px and visible at the canonical Small threshold (640px) and 641px in both Builder and storefront. The strict gate passes for the registered compatibility scope.
- **Inspector/UI:** import report must link each mapped field to its WebPages UI location; it must group capability families rather than flood users with repeated field warnings.
- **Import mapping:** one contract registers source meaning, owner, normalizer, UI location, renderer status, and unsupported reason.
- **Builder/frontend:** acceptance is visual, uses a newly imported document, and confirms persisted reload parity.
- **Inheritance:** fixture checks must confirm imported values inherit or override at the correct layer.
- **Explicit unsupported:** any capability not adopted by a phase must have a durable, product-level reason and never be silently stored.
- **Acceptance:** each named fixture has a baseline screenshot/behavior checklist; warning counts can fall only through implemented paths or approved product exclusions.

### 13. Dynamic Content / Field Binding — MISSING (deferred cross-element capability)

- **Scope:** one canonical source-selection, collection/query, item-context and field-binding contract reused by Grid, Panel, Slideshow, Overlay Slider and future data-aware elements.
- **Current behavior:** static item content remains importable. YOOtheme `source`, `query`, `content_source`, `item_source`, and related descriptors are reported as **DYNAMIC CONTENT UNSUPPORTED FOR NOW** and are never persisted as inert bindings. If no static fallback items exist, the source element is skipped with that explicit warning.
- **Required ownership:** a shared data-source owner, explicit provider/query adapters, safe item context, typed field mapping and one Builder/storefront resolver. Individual elements must only adapt the canonical item context to their existing static item model.
- **Acceptance:** a dynamic fixture proves the same source and field mapping in Builder and storefront across at least Grid and one carousel/panel consumer; unsupported providers remain visible in the import report without creating document state.

## Execution discipline

1. Start only the first incomplete phase with a stable underlying owner.
2. Add/extend the canonical model and visible inspector before importer mapping.
3. Wire the shared resolver and both renderers before marking a field supported.
4. Import a fresh fixture, verify persisted Builder/frontend parity, then update this file's status.
5. Keep compatibility aliases only in migrations; remove them from new import output.

## First phase to execute

**Phase 1 — Global Styles** is the first incomplete phase to execute. It defines the token and inheritance contract required by every later phase. Its first deliverable is a complete supported-token ledger that makes LESS and template JSON converge on the same visible Global Styles controls; no component-level parity work should proceed ahead of that contract.
