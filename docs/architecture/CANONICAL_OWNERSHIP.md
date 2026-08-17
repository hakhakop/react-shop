# WebPages Canonical Ownership

**Version:** 1.0  
**Status:** Architectural Authority  
**Updated:** August 2026

## Purpose

This document defines the canonical architectural ownership model of WebPages.

Its purpose is to prevent parallel rendering systems, duplicated inspectors, competing style owners, compatibility hacks, and regressions caused by solving the same problem in multiple places.

Any implementation that violates these ownership rules is considered an architectural regression even if it passes tests or appears to solve the immediate task.

Before creating new rendering paths, styling systems, inspectors, adapters, state, or compatibility logic:

1. Identify the existing canonical owner.
2. Reuse it.
3. Extend it if necessary.
4. Create something new only when no appropriate canonical owner exists.

---

# 1. Fundamental Law

## One Concept → One Owner

A semantic concept must have one canonical owner.

Do not introduce:

- parallel renderers;
- parallel inspectors;
- duplicate state ownership;
- component-local design systems;
- Builder-only visual implementations;
- storefront-only semantic implementations;
- compatibility layers that become permanent competing owners.

Compatibility code may translate legacy data into canonical semantics.

It must not become a second architecture.

---

# 2. Builder and Storefront

## Golden Rule

**Builder and storefront render the same canonical primitives.**

The Builder may decorate canonical output with:

- selection;
- hover;
- drag/drop;
- editing;
- interaction frames;
- inline editing behavior;
- preview routing;
- Builder chrome.

The Builder must not replace canonical rendering merely to support editing.

### Builder owns

- document composition;
- interaction;
- selection;
- editing;
- drag/drop;
- Inspector coordination;
- preview context.

### Builder does not own

- independent visual appearance;
- duplicate typography;
- duplicate element rendering;
- duplicate design tokens.

If Builder and storefront visually disagree, investigate the shared canonical rendering boundary before introducing local CSS corrections.

---

# 3. Global Styles

Global Styles are the canonical owner of reusable appearance.

They own design language such as:

- colors;
- typography;
- spacing tokens;
- borders;
- radii;
- shadows;
- backgrounds and paint;
- Buttons;
- Cards/Panels;
- Nav;
- Navbar;
- other canonical component appearance families.

Global Styles do not own document composition.

## Inheritance

The intended ownership order is:

**Global Style → Component Default → Explicit Element Override**

An explicit authored override may win.

Legacy defaults, presets, imported compatibility values, and component-local CSS must not masquerade as explicit authored overrides.

---

# 4. YOOtheme Compatibility

WebPages remains the source of truth.

YOOtheme compatibility maps external YOOtheme semantics into canonical WebPages ownership.

The compatibility pipeline is:

**YOOtheme source → importer → canonical WebPages state → canonical runtime tokens → canonical components**

Do not create separate YOOtheme renderers when the existing WebPages primitive can represent the same semantics.

Internal YOOtheme implementation variables must not automatically become user-facing WebPages controls.

YOOtheme source and live YOOtheme output are acceptance authorities for import parity.

---

# 5. Layout Library

The Layout Library owns reusable Builder compositions.

Canonical layout types:

- Pages
- Headers
- Footers
- Sections
- Rows
- Elements

These types describe **what is saved**, not where it originated.

Examples:

- Whole Header document → Header Layout
- Whole Footer document → Footer Layout
- Section saved while editing Footer → Section Layout
- Row saved while editing Header → Row Layout
- Element saved anywhere → Element Layout

Do not create separate Header Section, Footer Section, Header Row, or Footer Row libraries.

## Contextual Library

The same canonical Layout Library is opened contextually:

- Header → Headers
- Footer → Footers
- Page → Pages
- Section → Sections
- Row → Rows
- Element → Elements

The caller supplies the initial context.

Do not create separate Library implementations for each Builder surface.

---

# 6. Dynamic Templates

Dynamic Templates own routing and dynamic-content context.

Examples:

- Single Post
- Single Product
- Archives
- Search
- 404
- other routed content templates.

Dynamic Templates answer:

**What document renders this content/context?**

Layouts answer:

**What reusable composition should be used here?**

These concepts must remain separate.

A Dynamic Template document may use the Layout Library while being edited.

---

# 7. Header

The Header is a canonical Builder document.

It uses normal WebPages composition:

**Sections → Rows → Columns → Elements**

The Header Builder remains the composition authority.

## Header owns

- composition;
- Header document identity;
- Header-specific behavior;
- site identity semantics;
- Header-specific responsive behavior;
- home-link/logo identity semantics;
- Header shell state.

## Header does not own

generic component appearance that already belongs to Global Styles or canonical primitives.

### Header composition

Reusable Header compositions belong in:

**Layout Library → Headers**

Header layouts are starting compositions, not separate renderer species.

### Header behavior

Header-specific behavior may include:

- visibility;
- static/sticky behavior;
- sticky-on-scroll-up;
- transparent capability;
- overlay/underlap behavior;
- z-index;
- responsive shell behavior.

Appearance must not be encoded as a behavior preset.

### Header appearance

Normal navigation appearance inherits from:

**Global Styles → Navbar / Nav**

Header CTA appearance inherits from:

**Global Styles → Button**

Explicit Header element overrides may win when deliberately authored.

---

# 8. Footer

The Footer is a canonical Builder document.

It uses the same composition language:

**Sections → Rows → Columns → Elements**

The Footer owns whole-document composition and Footer-specific shell state.

Ordinary Sections, Rows, Columns, and Elements inside Footer retain their normal canonical ownership.

Reusable whole Footer compositions belong in:

**Layout Library → Footers**

---

# 9. Shared Primitives

Canonical primitives must be reused across Builder surfaces.

## Button

**Renderer:** `UikitButton`

**Inspector:** canonical Button capability/Inspector controls

**Appearance:** Button Global Styles

Header CTA is an adapter to canonical Button semantics.

Header must not maintain an independent Button design system.

Reuse means:

**renderer + inspector + state semantics**

not merely similar visual output.

---

## Image

**Renderer:** `UikitImage`

**Inspector:** canonical Image capability/Inspector controls

Image owns:

- source;
- alt;
- sizing;
- intrinsic sizing;
- containment;
- alignment;
- loading;
- shape/border;
- shadow;
- SVG behavior;
- other canonical Image semantics.

Header Logo is an adapter around canonical Image.

Header-specific Logo semantics may include:

- home link;
- site identity;
- Logo/Brand mode;
- mobile/inverse source where supported.

Header must not recreate Image sizing or presentation.

---

## Heading

**Renderer:** `UikitHeading`

Heading semantics and appearance must not be recreated in Builder-specific rendering paths.

---

## Text

**Renderer:** `UikitText`

Text typography and rich-text rendering remain canonical across Builder and storefront.

---

## Alert

**Renderer:** `UikitAlert`

Builder interaction may decorate Alert output but must not create an independent visual implementation.

---

## Navigation

**Renderer:** canonical Header navigation path (`HeaderNav`)

Desktop Header navigation is primarily a Navbar consumer.

Navigation appearance inherits from:

**Global Styles → Navbar**

Generic navigation-list semantics may inherit from:

**Global Styles → Nav**

Header Navigation owns:

- menu source;
- hierarchy;
- composition placement;
- deliberate per-element overrides;
- submenu presentation metadata.

It does not independently own normal Navbar appearance.

---

# 10. Header Utility Actions

Search, Account, Cart, Wishlist, Theme, Language, and similar Header actions should reuse a shared canonical utility/action visual language.

Action-specific behavior remains in adapters.

Examples:

- Search owns search behavior.
- Cart owns cart state/count.
- Account owns authentication semantics.
- Theme owns theme-toggle state.

These behaviors must not require separate visual design systems.

---

# 11. Positioning

Positioning has one shared semantic owner.

Do not introduce:

- Builder-only geometry models;
- local CSS compensation;
- element-specific positioning hacks;
- arbitrary editor-rail translations.

Builder and storefront should preserve the same authored positioning semantics unless an explicitly documented preview projection is required.

Positioning regressions must be traced through:

**authored fields → resolver → containing block → shared renderer → Builder/storefront geometry**

Do not repair one positioned element by shifting all positioned elements.

---

# 12. Inline Editing

Inline editing is interaction behavior.

It is never a visual renderer.

Inline editing may decorate canonical output with editing behavior.

It must not:

- reconstruct typography;
- replace canonical semantic tags;
- create parallel rich-text markup;
- introduce Builder-only visual classes that alter appearance.

If inline editing threatens Builder/storefront parity, canonical rendering takes priority over inline-edit convenience.

---

# 13. Inspector Ownership

The Inspector edits canonical state.

Do not create separate inspectors for the same semantic primitive merely because the primitive appears in a Header, Footer, Template, or another context.

Examples:

Header Button → canonical Button Inspector  
Header Logo → canonical Image Inspector

Context-specific controls may wrap canonical inspectors only for genuinely context-specific semantics.

---

# 14. Presets

Presets are convenience starting points.

They are not permanent semantic owners.

A preset may materialize:

- composition;
- explicit behavior;
- intentional content.

After application, canonical document state owns the result.

Preset identity must not continue overriding:

- Global Styles;
- canonical component appearance;
- canonical layout behavior.

Named visual modes must not become parallel design systems.

---

# 15. Responsive Ownership

Responsive behavior should be owned at the appropriate canonical composition/component level.

Do not solve responsive problems through unrelated component-local CSS when the Row, Column, element, or shell is the true owner.

Builder responsive previews must preserve canonical rendering semantics.

---

# 16. Regression Policy

A repair is rejected if it solves a local symptom by introducing:

- another renderer;
- another Inspector;
- another style system;
- another state source;
- another geometry model;
- another compatibility owner.

When a previously accepted feature regresses:

1. identify the last known-good contract;
2. locate the first divergence;
3. restore the canonical owner;
4. avoid redesigning already-solved architecture.

Regression recovery takes precedence over architectural reinvention.

---

# 17. Source-First Rule

Before implementation:

1. Audit the canonical component.
2. Identify what can be reused.
3. Establish ownership.
4. Identify the smallest canonical repair boundary.
5. Only then implement.

For YOOtheme parity:

1. inspect source YOOtheme data/settings;
2. inspect live YOOtheme output where necessary;
3. inspect freshly imported WebPages state;
4. compare Builder and storefront;
5. repair the first canonical divergence.

Do not infer source semantics from visual appearance alone.

---

# 18. Acceptance Law

**The live product is acceptance authority.**

Passing:

- ESLint;
- TypeScript;
- contract tests;
- static checks;
- automated verification

does not override a contradictory live result.

If an implementation report says "verified" while the live Builder visibly disagrees, the implementation is not accepted.

Automated tests protect contracts.

Live acceptance protects the product.

Both matter.

---

# 19. No Parallel Design Systems

WebPages must not develop independent design systems for:

- Header;
- Footer;
- Builder;
- storefront;
- imported YOOtheme content.

Canonical Global Styles and canonical primitives are shared.

Context-specific adapters may provide behavior and composition semantics.

They must not become independent appearance owners.

---

# 20. Decision Rule for New Work

Before adding anything, ask:

### Does a canonical owner already exist?

If yes:

**reuse it.**

If incomplete:

**extend it.**

If duplicated:

**consolidate it.**

Only when no appropriate owner exists:

**create one.**

---

# 21. Agent / Contributor Instructions

Before making architectural changes, read this document.

When proposing implementation, explicitly state:

1. Canonical owner.
2. Existing components being reused.
3. Ownership of new behavior/state.
4. Why no parallel implementation is being created.

Do not optimize for checklist completion at the expense of architectural ownership.

Do not introduce speculative refactors while repairing a focused regression.

When uncertain, audit before implementation.

---

# Canonical Principle

> **WebPages owns the model.  
> Components own structure and semantics.  
> Global Styles own appearance.  
> Layouts own reusable composition.  
> Dynamic Templates own routing context.  
> Builder decorates canonical rendering with interaction.  
> Storefront and Builder share canonical primitives.  
> One concept has one owner.**