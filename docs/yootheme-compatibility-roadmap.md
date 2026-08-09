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

### 2. Section / Container — PARTIAL

- **YOOtheme semantics:** section style/background role, width/expand, horizontal padding removal, vertical padding, height/viewport offset, vertical alignment, overlap, preserve color, HTML element, sticky, transparent header, title position/rotation/breakpoint.
- **Existing owners:** `BuilderSection`, semantic background resolver, section inspector, UIkit section/container classes.
- **Missing capability:** complete normalized height/header/sticky/title behavior and full container-width semantics; no raw YOOtheme enum casts.
- **Inspector/UI:** Section Layout, Section Style, and Advanced must expose normalized width, padding, height, alignment, header, and title controls in YOOtheme-compatible order.
- **Import mapping:** `section/element.json` fields normalize once into `BuilderSection`; padding presets continue to inherit Global Styles tokens.
- **Builder/frontend:** share `SectionFrame` / section-class calculation or a single equivalent helper.
- **Inheritance:** background roles and padding scales derive from globals unless an explicit local override exists.
- **Explicit unsupported:** scroll effects or sticky variants without a shared WebPages behavior contract.
- **Acceptance:** import every Section variant in fixture layouts, change global background/padding/containers, and verify affected sections update in both surfaces.

### 3. General Element Settings — PARTIAL

- **YOOtheme semantics:** margin/removal, max width, visibility, block/text alignment, animation, custom CSS/classes/IDs, absolute positioning, offsets, z-index, origin/breakpoint behavior.
- **Existing owners:** `BuilderVisualStyle`, general inspector panels, `visualStyleToCss`.
- **Missing capability:** responsive visibility/position normalization, transform origin, general margin presets consistently used by every block renderer, and a safe policy for source CSS.
- **Inspector/UI:** one General/Advanced group reused by every supported block; controls unavailable to a block must be absent rather than inert.
- **Import mapping:** normalize common General source props before element-specific mapping.
- **Builder/frontend:** every block wrapper must apply the same visual-style output.
- **Inheritance:** global spacing tokens feed local semantic spacing presets; source CSS is unsupported unless an explicit safe custom-style product feature is adopted.
- **Explicit unsupported:** arbitrary YOOtheme selector CSS and unsupported animation/parallax engines.
- **Acceptance:** import a positioned image/panel/grid, edit offsets/margins/alignment, reload, and compare Builder/frontend.

### 4. Typography / Heading / Text — PARTIAL

- **YOOtheme semantics:** heading/text element/style/size, semantic primary/secondary/tertiary fonts, font family/weight/style/size/line-height/letter spacing/transform/color, text/meta/title roles.
- **Existing owners:** `BuilderShellSettings` typography tokens, `builderTypography`, `TypographyPanel`, `UikitHeading`, `UikitText`.
- **Missing capability:** full element-level YOOtheme typography mapping, source font availability verification, UIkit semantic title/meta/text variants across Grid/Panel/Slider.
- **Inspector/UI:** Global Typography roles, component defaults, and local TypographyPanel must express Inherit versus explicit override consistently.
- **Import mapping:** global LESS/JSON typography goes to shell; per-element source typography goes to the existing local typography object only when explicit.
- **Builder/frontend:** consume `resolveTypographyInput` and shared font registration, not element-specific CSS.
- **Inheritance:** Global role → component default → element override; reset restores inheritance.
- **Explicit unsupported:** a font without a registered, permitted source or weight variant.
- **Acceptance:** imported DevStack roles and local overrides visibly change Heading, Text, Panel, Grid, and Slider copy in both surfaces and persist on reload.

### 5. Image / Media / Positioning — PARTIAL

- **YOOtheme semantics:** `image_width`, `image_height`, ratio, fit, focal/position, loading, border, shadow, decoration, alignment, image-grid width/breakpoint, inline SVG/color/strokes, image link/modal/lightbox, hover image/video, media position.
- **Existing owners:** `resolveUikitImageSemantics`, image inspector/style controls, `UikitImage`, panel/grid/slider media adapters.
- **Missing capability:** one responsive media-width contract; focal position; safe inline SVG/color; canonical lightbox; hover-media/video asset model; shared media dimensions in all active renderers.
- **Inspector/UI:** Image Settings must be the canonical surface; Grid/Panel/Slider expose adapters to the same fields, not duplicate media systems.
- **Import mapping:** map supported dimensions/fit/ratio/alignment/loading/link into shared media fields; element adapters only translate storage shape.
- **Builder/frontend:** standalone image, GridCards, Panel, and Carousel must resolve the same media semantics and dimensions.
- **Inheritance:** global media defaults apply where the element has no explicit override.
- **Explicit unsupported:** inline SVG manipulation, hover video, and modal/lightbox until a shared asset/interaction contract exists.
- **Acceptance:** import fixture media, change width/fit/ratio/alignment in the canonical inspector, and observe matching layout changes in all relevant consumers and frontend.

### 6. Button / Links — PARTIAL

- **YOOtheme semantics:** button/link style, size, state colors/borders/shadows/gradients, typography, target, full width, margins, panel/image/title links, modal/dialog links.
- **Existing owners:** button shell tokens, `UikitButton` classes, button inspector/style controls, `builderLinkTargetProps`.
- **Missing capability:** semantic default/text/link variants, link spacing and title/panel linking shared across consumers, dialog policy.
- **Inspector/UI:** existing Button and Link controls show variant, size, target, width, and explicit link behavior.
- **Import mapping:** `button_style`, `link_style`, `link_text`, `link_target`, size/margins normalize to canonical button/link fields.
- **Builder/frontend:** all button/link renderers consume shared token classes and target helper.
- **Inheritance:** global button tokens → component variant → local explicit fields.
- **Explicit unsupported:** YOOtheme dialog/offcanvas links until WebPages has one canonical modal/navigation interaction.
- **Acceptance:** imported variants/states and links work in Builder/frontend; changing Global Button styles updates every inheriting button.

### 7. Panel / Card — PARTIAL

- **YOOtheme semantics:** panel/card/tile variants, padding, hover, links, media placement/width, title/meta/content layout, expand and image-padding behavior.
- **Existing owners:** panel block fields, `BuilderVisualStyle.card`, UIkit card variables/classes, panel renderer.
- **Missing capability:** a complete shared presentation contract for title/meta/content order, spacing, linking, responsive media, and panel expansion.
- **Inspector/UI:** Panel Style/Media/Typography groups reuse card presentation controls and expose only valid variants.
- **Import mapping:** `panel_style`, `panel_padding`, media and text semantics map through the shared presentation/media contract.
- **Builder/frontend:** panel renderer uses the same card/media helper and CSS variables in both surfaces.
- **Inheritance:** global Card tokens → panel/card variant → local presentation override.
- **Explicit unsupported:** tiles or panel modes without a canonical WebPages presentation equivalent.
- **Acceptance:** import `card-default`, `card-primary`, `card-secondary`, padding, media, and text semantics; edit values and verify parity.

### 8. Grid — PARTIAL

- **YOOtheme semantics:** source/content items, responsive columns, column/row gaps, dividers, alignment/justify, masonry, parallax, filters, lightbox, item media, panel/card, title/meta/content/link layout and visibility.
- **Existing owners:** grid block, `GridCardsClient`, Grid inspector/style controls, UIkit grid/card helpers.
- **Missing capability:** shared static/product Grid renderer semantics, responsive grid breakpoints, complete title/meta/link presentation, filter/lightbox policy, masonry/parallax decisions.
- **Inspector/UI:** Grid layout/media/presentation groups reflect the same owner contract as Panel and Image.
- **Import mapping:** Grid source fields map to grid-level canonical controls; item fields map to item content only.
- **Builder/frontend:** eliminate drift between dashboard grid code and `GridCardsClient` before adding further semantics.
- **Inheritance:** global gutters/card tokens and shared media/typography presentation values must apply unless overridden.
- **Explicit unsupported:** masonry/parallax/query/filter behaviors until a single frontend-capable grid engine exists.
- **Acceptance:** fixture grids preserve columns, gaps, card variants, media, title/meta/content/link layout, and visibility in both surfaces.

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
