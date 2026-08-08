# WebPages UIkit Architecture Roadmap

## Milestone 1 — Shared Typography Resolver

- [x] Task 1 — Consolidate `CategoryWithFilters` typography through the existing `lib/builderTypography.ts` resolver.
- [x] Task 2 — Consolidate the duplicated `buttonTypographyStyle` helper by reusing the implementation in `StorefrontBuilderRenderer`.
- [x] Task 3 — Replace the dashboard-local `DashboardTypog` implementation with the canonical `Typog` renderer from `StorefrontBuilderRenderer`.
- [x] Task 4 — Consolidate duplicated rich-text detection and safe-tag rendering.
- [x] Task 5a — Consolidate the duplicated `BodyText` rich/plain-text renderer by reusing `StorefrontBuilderRenderer`.
- [x] Task 5b.1 — Delegate `InlineEditableText` typography composition to the canonical `Typog` renderer while preserving editing behavior.
- [x] Task 5b.2a — Route builder heading blocks through the existing canonical `ContentLayoutBlock` renderer.
- [x] Task 5b.2b.1 — Route Hero action labels through canonical `DashboardTypog` button rendering.
- [x] Task 5b.2b.2 — Validate Panel content already uses canonical `DashboardTypog`/`InlineEditableText` paths.
- [x] Task 5b.2b.3 — Route remaining Grid product-content labels through canonical typography rendering.
- [x] Task 5b.2b.4 — Consolidate Grid action button parity and add block-level UIkit button defaults with item overrides.

## Completed architectural foundations

These foundations are complete and are prerequisites for the Builder Core
milestones below:

- [x] Global Settings editor and inheritance foundation.
- [x] General Settings capability vertical slice for Heading, Text, Button,
  and Image.
- [x] Canonical Typography capability and shared builder/frontend resolution.
- [x] Canonical UIkit icon registry, picker, and shared icon renderer.
- [x] Repeatable item interaction contract and shared `RepeatableItemShell` for
  Accordion, List, and Grid.
- [x] Capability-driven Inspector composition.
- [x] WebPages Capability Architecture constitution.

## Builder Core roadmap

The Builder Core roadmap is organized by capability family, not by isolated
element settings. Each family must have one canonical capability panel,
resolver, document contract, and builder/frontend rendering path. Elements
compose capabilities; they do not recreate them.

### Phase 0 — Builder Core contract

- [x] Define the permanent capability ownership and inheritance constitution.
- [x] Make Inspector composition declaration-driven.
- [x] Establish focused validation and roadmap completion rules.

### Phase 1 — Button and Link capability

- [x] Consolidate the canonical Button vocabulary across the active Button,
  Grid, Hero, and Panel consumers.
- [x] Consolidate Link target choices and security behavior so compatible
  inspectors and builder/frontend renderers reuse the same link contract.
- [x] Verify builder/frontend parity, inheritance, overrides, reset, and
  persistence for the family.

### Phase 2 — Layout and Spacing capability

- [x] Route canonical Row padding controls through the shared spacing
  capability control while preserving existing row fields and renderer paths.
- [x] Route canonical Section padding controls through the shared spacing
  capability control while preserving existing section fields and UIkit output.
- [x] Retire the duplicate legacy scalar Row spacing control and route its
  fallback callers through the shared spacing capability control.
- [x] Retire the duplicate legacy Section spacing control and route its
  fallback callers through the shared spacing capability control.
- [x] Establish one reusable layout/spacing composition path for applicable
  structural and content elements through the shared `SpacingControl`,
  canonical structural capability panels, and the generic element style path.
- [x] Verify component defaults, global inheritance, local overrides, and
  builder/frontend parity. The focused Section parity test retains one
  pre-existing strict-selector failure in its second fixture; the affected
  production assertions pass.

### Phase 3 — Media and Image capability

- [x] Route legacy DashboardInspector media URL controls through the shared
  `BuilderImageUrlControl` while preserving existing document update callbacks.
- [x] Consolidate the duplicated Image document-to-UIkit semantic mapping in
  the shared `uikitTokens` resolver used by builder and frontend renderers.
- [x] Route Grid item media ratio and fit resolution through the existing
  `getUikitPanelMediaStyle` helper in both builder and frontend paths.
- [x] Route Hero media source selection through the shared
  `BuilderImageUrlControl` while preserving the existing URL and alt fields.
- [x] Route the canonical Panel inspector image source through the shared
  `BuilderImageUrlControl` and existing WordPress media-picker flow, preserving
  the existing `imageUrl` and `imageAlt` document fields.
- [x] Route Grid item image selection through the shared
  `BuilderImageUrlControl` and existing WordPress media-picker flow, preserving
  each item’s existing `imageUrl` and `imageAlt` fields.
- [x] Consolidate shared media/image controls and resolution for applicable
  elements. Image, Hero, Panel, and Grid item source paths now reuse the shared
  media control; applicable semantic presentation paths reuse the existing
  UIkit resolvers.
- [x] Verify Image source and alt text remain document-owned while semantic
  presentation fields are stored without UIkit class values and resolve
  identically in builder and frontend.
- [!] Verify inherited defaults and explicit overrides for media presentation
  when a canonical global media owner exists; do not invent one in Phase 3.
  Blocked because the current Global Settings document has no generic media
  presentation owner. Existing image fields are document-owned, while the
  shell image fields are product-specific; creating a new global media owner
  would expand the approved Phase 3 scope.

### Phase 4 — Visibility and Responsive capability

- [x] Consolidate visibility and responsive behavior through existing UIkit and
  WebPages mappings. Dashboard and frontend column paths now both consume
  `getUikitColumnClass`, including nested columns; visual-style visibility
  continues to use the shared `visualStyleClassName` path.
- [x] Verify inherited defaults, explicit local overrides, and responsive
  builder/frontend parity for column responsive behavior. Column responsive
  defaults (`inherit`), explicit `stack`, reset, reload persistence, and
  builder/frontend parity are verified in `tests/column-uikit.spec.ts`.
- [x] Implement and verify Global Visibility v1. `BuilderShellSettings` owns
  desktop, tablet, and mobile defaults; content-element and section inspectors
  reuse the existing visual-style visibility resolver with Inherit, Visible,
  and Hidden controls. Builder and frontend consume the same resolved classes;
  global propagation, local override, reset, and reload persistence were
  verified in the focused browser pass.

### Builder Core stabilization — Row layout editing

- [x] Scope the dedicated row-toolbar layout popup to the selected row. It now
  reuses the canonical row layout transformation used by the pencil inspector;
  section-level layout editing remains section-scoped.
- [x] Verify that changing a row layout preserves sibling rows with focused
  browser coverage in `tests/row-layout-toolbar.spec.ts`.
- [x] Remove obsolete section-level split/layout controls. Sections now expose
  section/container capabilities only; row composition is edited from the row
  toolbar or Row capability panel. Legacy layout fields remain readable for
  backward compatibility.
- [x] Make section insertion create an empty section; the section's Add Row
  placeholder is the only entry point for choosing the first row layout.

### Phase 5 — Effects and Animation capability

- [x] First slice — canonical Section, Row, Hero, Grid, Heading, Text,
  Button, Image, Panel, List, Accordion, and core element Advanced panels now
  reuse the existing `AnimationControl` and shared animation document fields.
- [x] Consolidate duplicated animation preset, class, and data-attribute
  resolution into `lib/builderAnimation.ts`, reused by the dashboard preview
  and storefront renderer.
- [x] Continue consolidating existing effects and animation behavior only where
  a genuine canonical implementation already exists; section scroll reveal
  now uses the shared data-attribute observer and UIkit-compatible CSS path.
- [x] Verify accessibility, reduced-motion behavior, and parity before adding
  further motion features; the shared CSS/data-attribute path and the
  ScrollReveal path now settle without motion when reduced motion is enabled.

### Phase 6 — Integrated Builder Core review

- [x] Run a focused cross-capability review against the constitution across
  Heading, Text, Button, Image, Hero, Grid, and List.
- [x] Confirm no duplicate panels, resolvers, document fields, or renderers
  were introduced in the active canonical paths; legacy paths remain behind
  the explicit allowlist.
- [x] Reprioritize after the Core Builder capability families were validated;
  the remaining Phase 3/4 items stay deferred until canonical global media and
  visibility owners exist.

### Builder Core Settings — Canonical completion

- [x] Replace element-specific inspector assembly with the registry-driven
  `ElementCapabilityComposer` and normalize canonical elements to Content,
  Settings, and Advanced.
- [x] Compose shared General Settings and Animation once for every canonical
  element; preserve element panels as semantic-field owners only.
- [x] Complete semantic typography roles for Heading, Text, Hero, Panel, and
  Grid content. Global Style owns concrete Primary, Secondary, and Tertiary
  font family/weight values; builder and frontend consume the same role classes.
- [x] Consolidate standalone Button, Panel action, Hero action, and Grid action
  variant/size editing through one shared UIkit Button presentation control.
- [x] Retire unsupported Global Style navigation placeholders and the duplicate
  Card elevation group so the editor exposes only canonical owners.
- [x] Verify the shared inspector shell in the browser across Heading, Text,
  Button, Image, Hero, Grid, Panel, Accordion, List, Icon, and Divider.
- [x] Verify live Heading semantic/alignment rendering, Text variant mapping,
  Button sizing, and reactive Global typography variables; restore temporary
  verification values after each check.

## Task execution contract

Every implementation task must remain session-sized and record:

- the selected capability or duplication;
- the canonical implementation being reused;
- affected consumers and expected files;
- explicit exclusions;
- focused success criteria and validation commands;
- completion status and remaining roadmap work.

Do not begin the next task while the current task has unresolved validation
failures. Broad audits are periodic review milestones, not a requirement for
every focused implementation task.

## YOOtheme compatibility roadmap

This roadmap defines the next bounded milestone after the Builder Core work. It
uses the supplied DevStack theme and `Home.json` export as compatibility
references only. UIkit and the existing WebPages document, capability, resolver,
and renderer paths remain canonical; proprietary theme code and assets are not
copied.

### Phase 0 — Source boundary and compatibility contract

- [x] Audit the supplied theme package and `Home.json` export.
- [x] Define the source-to-WebPages boundary: source data may be analyzed and
  mapped, but imported documents must use the existing WebPages schema.
- [x] Inventory the source node types and identify unsupported or dynamic
  boundaries without inventing replacement element systems.

### Phase 1 — Import contract and structural mapping

- [x] Add a pure source analyzer that reports source node counts and maps
  supported source element types to the existing WebPages vocabulary.
- [x] Map source layout, section, row, and column structure to canonical
  WebPages layout primitives without writing documents yet.
- [x] Add focused fixture coverage for the supplied `Home.json` shape,
  including unsupported-node reporting and deterministic mapping.

### Phase 2 — Core static element import

- [x] Import headings, text, buttons, and images through existing document
  fields and canonical builder/frontend renderers.
- [x] Preserve source ordering, hierarchy, links, alt text, and supported
  semantic roles.
- [x] Verify imported builder and frontend output against the source structure.

### Phase 3 — Shared consumers

- [x] Map Grid and Grid items onto the existing shared Card, Media, Title,
  Meta, Content, Action, and General capability paths.
- [x] Map Panel and Panel Slider onto the same shared consumer capabilities;
  keep slider behavior in the existing UIkit/Swiper path.
- [x] Preserve unsupported options as explicit import warnings rather than
  silently creating parallel behavior.

### Phase 4 — Global style translation

- [x] Map source section variants and spacing presets only where existing
  WebPages section fields already own them.
- [x] Translate only source values that have an existing WebPages Global
  Settings owner or UIkit token mapping.
- [x] Keep concrete appearance values global and semantic element choices local,
  following the existing inheritance contract.
- [x] Report source values with no canonical owner; do not create settings
  solely to achieve superficial visual similarity.

Phase 4 currently has no separate source Global Settings payload in
`Home.json`; the boundary analyzer therefore maps recognized semantic values
to existing WebPages/UIkit owners and reports concrete font/color values for a
future source export that contains global settings. No new settings are
created by this phase.

### Phase 5 — Assets and dynamic boundaries

- [x] Normalize supported source-relative asset paths against the configured
  public WordPress site URL while preserving external and data URLs.
- [x] Reuse the existing media-picker and asset/document paths for supported
  source assets: imported URLs remain in canonical image fields and can be
  replaced through the existing media picker.
- [x] Define safe boundaries for dynamic data, forms, commerce, and external
  integrations; do not pretend static import supports them.
- [x] Verify missing assets and unsupported nodes remain recoverable and
  visible to the user through the import warning list.

Phase 5 boundary note: static import does not copy remote media into WebPages
storage. Supported source URLs are preserved in existing document fields; the
existing media picker remains the canonical replacement/editing path. Dynamic,
commerce, form, and unsupported source nodes remain warnings and are not
silently converted into static content.

### Phase 6 — Import experience and parity hardening

- [x] Add the import entry point only after the pure mapping and fixture
  contracts are stable.
- [x] Provide a previewable import result, warnings, and a reversible save
  boundary using the existing builder workflow.
- [ ] Run focused builder/frontend parity checks and a periodic broad audit
  before calling the compatibility milestone complete.

### Compatibility milestone completion rule

The milestone is complete only when a supported `Home.json` subset can be
deterministically mapped into canonical WebPages documents, rendered through
the existing builder/frontend paths, and accompanied by explicit warnings for
everything outside the supported contract.

## Status legend

- `[ ]` planned or unresolved;
- `[~]` in progress or awaiting focused validation;
- `[x]` completed and validated;
- `[!]` blocked by a documented decision or external dependency.
