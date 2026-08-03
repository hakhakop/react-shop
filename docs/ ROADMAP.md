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
