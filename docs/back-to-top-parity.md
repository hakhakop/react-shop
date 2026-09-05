# Back To Top — audit and acceptance

Audited 2026-09-05 against the authenticated Woolberry YOOtheme customizer's
`totop` schema and rendered footer element. The WebPages library name is
**Back To Top**; the import source type remains **totop**.

## Source contract

| Surface | Original fields / semantics | WebPages owner |
| --- | --- | --- |
| Content | Title; Link Title (hover tooltip, dynamic-enabled) | BackToTopCapabilityPanel; UikitBackToTop |
| Title settings | Style: None / Small / Meta; separate column/row gaps; Always / s / m / l / xl breakpoint | backToTop settings |
| General | Position and mutually exclusive offsets; z-index; blend; flow margin and removals; width; block/text alignment with breakpoint/fallback; animation/parallax; visibility | YoothemeGeneralSettingsPanel; canonical visualStyle and shared element shell |
| Advanced | Name; disabled status; source; dynamic ID / Classes / Attributes; scoped CSS; element transformation | BackToTopCapabilityPanel; shared dynamic materializer and Advanced renderer |
| Runtime | Separate title and accessible `Back to top` control, 18×9 chevron; title moves before the control at the selected breakpoint | UikitBackToTop; UIkit grid runtime |
| WebPages extension | Floating Button, off by default; additional fixed control after 400px scrolling | UikitBackToTop; own-document portal |

Original defaults: no title, small column and row gaps, default margin.
Selecting a source gap of None preserves `collapse`; empty gap values preserve
UIkit's default rather than becoming Small. Explicit animation None is preserved.
Scrolling targets the control's own window, including Builder iframes, and respects
reduced motion. Unbinding a dynamic value retains its static fallback.

The root-layout ScrollToTopButton mount, implementation and obsolete CSS were
removed. Existing authored documents were not rewritten or published.

## Verification

Executed successfully:

```sh
npx playwright test tests/yootheme-back-to-top.spec.ts tests/yootheme-back-to-top-browser.spec.ts tests/yootheme-social-element.spec.ts --reporter=line
```

13 tests passed. Coverage includes all 75 title-style/gap/breakpoint combinations,
General/Advanced import values, serialization, dynamic tooltip and Advanced fields,
transformation cleanup, import report classification, responsive browser geometry,
keyboard scrolling, floating opt-in/off, iframe isolation, and Social regressions.
Desktop and mobile screenshots were inspected.

The development-only `/dashboard-back-to-top-proof` route imports the synthetic
source fixture and mounts the real components/controls without changing any saved
website. It returns 404 outside development.

Limits: this is component/import acceptance, not a full exported-Woolberry-page
fidelity certification. The live preview encountered a WooCommerce connection
reset and the local Builder session subsequently showed Sign in. The compatibility
registry therefore records this fixture as PARTIAL, not full-page VERIFIED.
The broader registry suite has an existing missing `product-2` fixture reference;
project-wide TypeScript checking also has pre-existing errors. Targeted new-file
lint and diff whitespace checks passed.
