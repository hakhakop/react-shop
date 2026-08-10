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

### 8. Grid — PARTIAL

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
- **Content-tab recovery (in progress):** The real Pricing fixture proves that Grid item `title` and `content` are rich HTML, not plain strings. They now normalize through the shared safe rich-text boundary; Title accepts safe inline markup and Content uses the canonical WYSIWYG editor. That shared editor now has compact **Visual | HTML** modes: Source preserves safe imported markup until a Visual edit changes it, and Source edits re-enter through the same sanitizer used by Visual editing. A live Pricing-item round trip verified headings, paragraphs, strong/emphasis, and links in Source → Visual → Publish → reload; the persisted safe link gained its expected `rel` value, and the original nested imported UIkit markup was restored and survived reload unchanged. `GridCardsClient` consumes the resulting sanitized rich HTML for both Builder and storefront rather than rendering it as a plain string. Source `tags` maps to the canonical `gridItems[].tags` array, which is the same data consumed by shared Grid filtering. `filter: true` and `filter_style` now map to the existing Grid filter owner so the fresh Pricing import exposes Monthly/Yearly filter controls. An item `panel_style` is retained only when explicitly authored and resolves before the inherited Grid Card style; an unstyled item remains **Inherit Grid Style**. Focused Grid coverage now protects sanitized rich title/content, tag filtering, explicit item Card style, and Builder/storefront shared rendering. Remaining acceptance: one final fresh-import Builder/storefront parity pass for the complete Phase 8 fixture, then Phase 8 can return to COMPLETE.

### 9. Slider / Slideshow / Overlay — PARTIAL

- **YOOtheme semantics:** slider widths/gaps/dividers/center/autoplay, nav/slidenav style/position/breakpoints, overlay mode/display/position/padding/transition/link, slide media and content fields.
- **Existing owners:** panel slider block, `carouselSettings`, `CarouselBlock`, Global Slider defaults.
- **Missing capability:** normalized overlay layer and responsive navigation/layout contract; no hard-coded carousel defaults during import.
- **Inspector/UI:** Slider Media, Navigation, Overlay, and Behavior groups use canonical carousel fields.
- **Import mapping:** outer slider settings and item fields map separately; media uses the shared Image contract.
- **Builder/frontend:** both use `CarouselBlock` and the same settings resolver.
- **Inheritance:** Global Slider defaults → slider settings → slide local media/content overrides.
- **Explicit unsupported:** overlay transitions/modes not supported by the shared carousel implementation.
- **Acceptance:** fixture overlay slider visibly matches imported width/navigation/overlay choices, and controls persist in frontend.

### 10. Responsive behavior — MISSING

- **YOOtheme semantics:** UIkit `s/m/l/xl` breakpoints; element breakpoint/fallback alignment/visibility; responsive widths; section/grid/media/nav breakpoints.
- **Existing owners:** shell breakpoint fields and fixed CSS breakpoints.
- **Missing capability:** a product decision and runtime strategy. CSS custom properties cannot alter media-query thresholds by themselves.
- **Inspector/UI:** expose breakpoints only if runtime/configurable breakpoints are genuinely implemented; otherwise label them unavailable and do not import/store them.
- **Import mapping:** normalize YOOtheme tier names to the chosen WebPages responsive model.
- **Builder/frontend:** identical breakpoint engine/classes in both surfaces.
- **Inheritance:** global breakpoint policy informs component responsive controls.
- **Explicit unsupported:** imported configurable breakpoint values until the runtime strategy exists.
- **Acceptance:** change a breakpoint/value in Global Styles and observe all responsive section/grid/media behavior update identically in Builder/frontend.

### 11. Remaining supported elements — PARTIAL

- **YOOtheme semantics:** Accordion, Alert, Gallery, List, Table, Map, Social, Nav, Switcher, Tabs, Countdown, Video, Icon, form/content-source elements and WordPress-specific modules.
- **Existing owners:** WebPages block vocabulary, `uikitCapabilities.ts`, existing UIkit element components.
- **Missing capability:** capability inventory that distinguishes structural recognition from an actual WebPages consumer.
- **Inspector/UI:** each supported element owns an explicit capability declaration and inspector surface.
- **Import mapping:** source type is importable only after semantic fields have a canonical destination; otherwise report as unsupported type/feature.
- **Builder/frontend:** each consumer must share a renderer/helper, not separate preview-only markup.
- **Inheritance:** typography, colors, spacing, media, and global tokens use the same foundations above.
- **Explicit unsupported:** WordPress dynamic queries/modules and plugin-specific source adapters unless WebPages implements equivalent data providers.
- **Acceptance:** every advertised supported source type has at least one fixture and a complete visible semantic path.

### 12. Importer + fixture acceptance — PARTIAL

- **YOOtheme semantics:** all source fields in Builder `element.json`, UIkit/theme LESS, and real exports.
- **Existing owners:** LESS importer, page importer, import contract, import reporting UI, fixture tests.
- **Missing capability:** persistent fixture registry, field-level semantic coverage ledger, fresh-import visual acceptance runner, asset/font availability checks, and strict status reporting.
- **Inspector/UI:** import report must link each mapped field to its WebPages UI location; it must group capability families rather than flood users with repeated field warnings.
- **Import mapping:** one contract registers source meaning, owner, normalizer, UI location, renderer status, and unsupported reason.
- **Builder/frontend:** acceptance is visual, uses a newly imported document, and confirms persisted reload parity.
- **Inheritance:** fixture checks must confirm imported values inherit or override at the correct layer.
- **Explicit unsupported:** any capability not adopted by a phase must have a durable, product-level reason and never be silently stored.
- **Acceptance:** each named fixture has a baseline screenshot/behavior checklist; warning counts can fall only through implemented paths or approved product exclusions.

## Execution discipline

1. Start only the first incomplete phase with a stable underlying owner.
2. Add/extend the canonical model and visible inspector before importer mapping.
3. Wire the shared resolver and both renderers before marking a field supported.
4. Import a fresh fixture, verify persisted Builder/frontend parity, then update this file's status.
5. Keep compatibility aliases only in migrations; remove them from new import output.

## First phase to execute

**Phase 1 — Global Styles** is the first incomplete phase to execute. It defines the token and inheritance contract required by every later phase. Its first deliverable is a complete supported-token ledger that makes LESS and template JSON converge on the same visible Global Styles controls; no component-level parity work should proceed ahead of that contract.
