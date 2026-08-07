# WebPages Inspector Design System & Architecture Rulebook

Every inspector panel in WebPages MUST strictly adhere to the 3-Layer Canonical Architecture to guarantee complete visual consistency, global maintenance, and user muscle memory.

---

## The 3-Layer Inspector Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Layer 3: Element Capability Panels                                      │
│ (Heading, Text, Image, HeroGrid, Accordion, Panel, Gallery, etc.)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Composes)
┌────────────────────────────────────▼────────────────────────────────────┐
│ Layer 2: Minimal Canonical Composite Setting Groups                     │
│ (@/components/dashboard/inspector/panels/SharedSettingGroups)           │
│ (TitleSettingsGroup, MetaSettingsGroup, ImageSettingsGroup, etc.)       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ (Uses)
┌────────────────────────────────────▼────────────────────────────────────┐
│ Layer 1: Canonical Inspector UI Controls                                │
│ (@/components/dashboard/inspector/InspectorControls)                    │
│ (InspectorAlignmentControl, InspectorSelect, InspectorSwitch, etc.)    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Architectural Rules for Layer 2 & Layer 3

### Rule 1: Layer 2 Must Remain Small, Minimal & Reusable
Before creating any new Layer 2 group, you MUST answer:
> **"Why can't this be composed from existing Layer 2 groups?"**

Do NOT create broad or single-use wrapper groups (such as `PanelLayoutGroup` or `RepeatableItemHeaderGroup`). Create a new Layer 2 group ONLY when existing composite groups are genuinely insufficient. Layer 2 is strictly reserved for universal composite concepts:
- **`TitleSettingsGroup`**: Standard title role, preset, alignment, and level.
- **`MetaSettingsGroup`**: Standard meta typography role, style, and alignment.
- **`ContentSettingsGroup`**: Standard body content typography role and alignment.
- **`ImageSettingsGroup`**: Standard image width, height, fit, border/shape, shadow, and alignment.
- **`ButtonPresentationFields` / `ButtonSettingsGroup`**: Standard button variant and size fields (reusable across Button, Panel, Hero, Grid, Slides).

### Rule 2: Never Write Custom Inline Control Primitives
All low-level UI controls MUST be imported from `@/components/dashboard/inspector/InspectorControls`:
- **Text Alignment**: `InspectorAlignmentControl` (left, center, right, justify)
- **Flex/Container Alignment**: `InspectorFlexAlignControl` (start, center, end, space-between)
- **Media Placement**: `InspectorMediaPlacementControl` (top, left, right)
- **Start/End Positioning**: `InspectorSemanticPositionControl` (start, end — RTL aware)
- **Booleans**: `InspectorSwitch`
- **Segmented / Options**: `InspectorSegmentedControl` / `InspectorPillGroup`
- **Dropdowns**: `InspectorSelect`
- **Numbers + Units**: `InspectorNumberUnit`
- **Colors**: `InspectorColorField`

### Rule 3: Maintain Muscle Memory & Structural Hierarchy
Every section in an inspector panel must strictly use:
1. **Level 1 Section**: `InspectorSection`
2. **Level 2 Division**: `InspectorDivision`
3. **Level 3 Field Row**: `InspectorFieldRow`
