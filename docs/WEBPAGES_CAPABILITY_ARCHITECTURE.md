# WebPages Capability Architecture

**Status:** Permanent architectural constitution  
**Scope:** WebPages builder, document model, inspector, Global Settings, and rendering  
**Visual system:** UIkit  

---

## 1. Builder philosophy

WebPages is a composable visual system.

The builder has one source of truth for authored website documents, one global
appearance system, one capability vocabulary, and one canonical rendering
contract shared by the builder preview and the published frontend.

The fundamental rule is:

> Elements compose capabilities. Capabilities own behavior. Elements own semantic content.

The builder must prefer composition over element-specific implementations. A
new element may combine existing capabilities, but it must not recreate a
capability that already exists.

UIkit is the canonical visual system. Global Settings are the canonical source
of shared appearance. WebPages documents store authored content and explicit
local overrides. The renderer consumes resolved values and does not invent
settings.

The architecture is intentionally made of small, named capability contracts.
It must not converge on a universal settings component, a universal element,
or parallel visual systems.

---

## 2. Capability and Element

### Capability

A capability is a coherent, reusable behavior or appearance contract.

A capability defines:

- the meaning of its values
- its inheritance behavior
- its component-default behavior
- its local override behavior
- its inspector controls
- its effective-value resolution
- its renderer contract
- its accessibility and responsive rules

A capability owns one concern. Typography owns typography. Spacing owns
spacing. Links own link behavior. Cards own card appearance. A capability must
not silently absorb adjacent concerns.

A capability may compose another capability through a defined contract. It may
not copy that capability's fields, resolver, inspector controls, or renderer
logic.

### Element

An element is a semantic unit authored and placed in a WebPages document.

Examples include Heading, Text, Rich Text, Button, Hero, Panel, Grid, List,
Accordion, Image, and Icon.

An element owns:

- its semantic meaning
- its document identity and content
- its element-specific structure
- its element-specific data
- its element-specific composition of capabilities

An element does not own a general-purpose implementation of Typography,
Spacing, Visibility, Animation, Buttons, or any other shared capability.

### Relationship

An element declares which capabilities it composes. The capability supplies the
behavioral contract. The element supplies the semantic inputs.

For example:

```text
Hero
├── semantic content
├── Typography
├── Layout
├── Spacing
├── Media
├── Links
├── Buttons
├── Visibility
└── Animation
```

The Hero owns its content and arrangement. The composed capabilities own their
respective behavior and appearance.

---

## 3. Ownership model

Every capability has six explicit ownership boundaries.

| Boundary | Owner | Responsibility |
|---|---|---|
| Capability owner | The capability contract | Defines the concern, allowed values, dependencies, inheritance, and reset behavior |
| Renderer owner | The canonical element renderer and structural component | Produces the final DOM using resolved capability values |
| Document owner | The element or site document model | Stores semantic content and only explicit local overrides |
| Global owner | Global Settings | Stores shared site-level defaults and component defaults |
| Resolver owner | The capability-specific resolver | Computes the effective value without mutating the document |
| Inspector owner | The capability panel | Edits the capability and exposes inherit, override, and reset behavior |

No boundary may claim another boundary's responsibility.

### Universal ownership rules

1. Documents store authored intent, not computed appearance.
2. Global Settings store shared defaults, not element content.
3. Component defaults are fallback values, not persisted element values.
4. Capability panels own capability UI, not semantic element structure.
5. Resolvers own effective values, not DOM structure.
6. Renderers consume resolved values, not inspector state.
7. Structural components own markup and interaction structure, not Global Settings.
8. UI-only editor state never enters the document model.

---

## 4. Inheritance contract

Every inheritable capability follows this contract:

```text
Global Settings
        ↓
Component defaults
        ↓
Element inherits
        ↓
Explicit element override
        ↓
Resolved value
        ↓
Renderer
```

### Global Settings

Global Settings define the shared site-level value for a capability.

Changing a global value must update every element that still inherits that
value. A global value must not be copied into inheriting elements.

### Component defaults

Component defaults are the safe fallback for a capability when no global value
applies. They belong to the component or UIkit semantic contract and are not
element-owned document values.

Component defaults must remain stable, explicit, and discoverable. They must
not be recreated independently by each element.

### Element inherits

An element inherits when it has no explicit local override for the capability
property.

Inheritance is the normal state. It is not an exceptional or advanced mode.

### Explicit element override

Ownership changes from Global Settings to the element only when the user
explicitly changes that capability property at element scope.

The element then owns only that property. Unchanged properties continue to
inherit independently.

An element override must not force unrelated properties to become local.

### Reset

Resetting a local property removes its local ownership and returns it to the
inheritance chain.

The resolved global value must not be written as a replacement value during
reset.

### Resolution

The resolver computes the effective value in this order:

```text
explicit element override
→ global setting
→ component default
→ UIkit fallback
```

The resolver is pure from the document's perspective. It reads settings,
returns an effective value, and does not persist that value.

### Non-inheritable values

Semantic content and authored data do not inherit:

- titles and body content
- rich text
- URLs and link targets
- image sources and alternative text
- icon identifiers
- data sources and queries
- product selection
- table rows
- repeatable item content
- accessibility meaning authored for a specific element

Appearance associated with those values may still inherit. For example, an
image source is local, while its fit, ratio, radius, and shadow may inherit.

---

## 5. Capability ownership registry

The following registry is the permanent target ownership model.

| Capability | Owner | Renderer owner | Document owner | Global owner | Resolver owner | Inspector owner |
|---|---|---|---|---|---|---|
| Typography | Typography contract | Canonical renderer and semantic text components | Element-local typography overrides; semantic text remains with the element | Global Typography Settings | Typography resolver | Typography Settings panel |
| Colors | Color contract | Canonical renderer and UIkit color mapping | Element or section local color overrides | Global Colors Settings | Color resolver | Color Settings panel |
| Background | Background contract | Element renderer and UIkit background mapping | Local background content or appearance override | Global Background/Colors Settings | Background resolver | Background Settings panel |
| Spacing | Spacing contract | Canonical renderer and UIkit spacing mapping | Local padding, margin, and component gap overrides | Global Spacing Settings | Spacing resolver | Spacing Settings panel |
| Sizing | Sizing contract | Canonical renderer and UIkit width/container mapping | Local size or dimension override | Global Sizing/Container Settings | Sizing resolver | Sizing Settings panel |
| Layout | Layout contract | Structural component and canonical renderer | Element or containing layout record | Global layout defaults where applicable | Layout resolver | Layout Settings panel |
| Alignment | Alignment contract | Structural component and UIkit alignment mapping | Local alignment override | Component or global layout defaults | Alignment resolver | Layout/Alignment Settings panel |
| Visibility | Visibility contract | Canonical renderer and responsive visibility mapping | Local visibility rules | Optional global visibility policy | Visibility resolver | Visibility Settings panel |
| Responsive | Responsive contract | Canonical renderer and UIkit responsive mapping | Local breakpoint-specific overrides | Global responsive defaults | Responsive resolver | Responsive Settings panel |
| Animation | Animation contract | Canonical renderer and UIkit animation mapping | Local animation choice and parameters | Global motion defaults where applicable | Animation resolver | Animation Settings panel |
| Transitions | Transition contract | UIkit renderer mapping | Local transition override | Global transition tokens | Transition resolver | Effects/Transition Settings panel |
| Geometry | Border and radius contract | Structural renderer and UIkit geometry mapping | Local border/radius override | Global Geometry Settings | Geometry resolver | Geometry Settings panel |
| Shadows and effects | Effects contract | Canonical renderer and UIkit effects mapping | Local shadow/effect override | Global Effects Settings | Effects resolver | Effects Settings panel |
| Links | Link contract | Canonical renderer and semantic link component | URL, target, rel, and local link options | Global Link Settings for appearance | Link resolver | Link Settings panel |
| Buttons | Button contract | Canonical renderer and UIkit button component | Button label, URL, target, and local appearance override | Global Button Settings | Button resolver | Button Settings panel |
| Cards | Card contract | Canonical renderer and UIkit card component | Element-specific card content and local appearance override | Global Card Settings | Card resolver | Card Settings panel |
| Media | Media contract | Canonical renderer and media components | Media source, alt text, caption, and local media options | Global Media defaults | Media resolver | Media Settings panel |
| Images | Image contract | Canonical renderer and UIkit image mapping | Image source, alt text, link, and local presentation | Global Image defaults | Image resolver | Image Settings panel |
| Icons | Icon contract | Shared icon renderer | Icon identifier and local size/appearance override | Global icon appearance defaults | Icon resolver | Icon Settings panel |
| List presentation | List contract | List structural component and canonical renderer | List item content, links, and icon identifiers | Global List defaults where applicable | List resolver | List Settings panel |
| Accordion behavior | Accordion contract | Accordion structural component and canonical renderer | Item content and authored behavior options | Global Accordion defaults | Accordion resolver | Accordion Settings panel |
| Grid layout | Grid contract | Grid structural component and canonical renderer | Grid items, layout choices, and local overrides | Global Grid defaults where applicable | Grid resolver | Grid Settings panel |
| Data and query | Data contract | Element-specific data renderer | Source, filters, limits, pagination, and query values | No general Global Styles owner | Data/query resolver | Data Source Settings panel |
| Accessibility | Accessibility contract | Semantic renderer | Heading level, alt text, labels, and authored accessibility values | Global accessibility defaults only where safe | Accessibility resolver | Accessibility Settings panel |
| Forms and embeds | Form/embed contract | Element-specific renderer | Form identity, embed source, trusted content, and dimensions | Shared visual defaults only | Form/embed resolver | Form/Embed Settings panel |
| Repeatable item interaction | Repeatable-item contract | Inspector interaction shell; element renderer consumes ordered data | Stable item identity and ordered item data | None | Collection reorder/update resolver | Shared Repeatable Item control |

The registry defines ownership, not a requirement that every capability appear on
every element. Elements compose only the capabilities that are semantically
valid for them.

---

## 6. Capability composition rules

### General

- An element owns semantic content and structure.
- Shared appearance and behavior are composed capabilities.
- A capability may be omitted when it has no semantic meaning for an element.
- Capability composition must be explicit and inspectable.
- A capability must not be silently duplicated inside an element.

### Heading

Composes:

- Typography
- Layout/Alignment
- Spacing
- Visibility
- Animation, when semantically supported
- Accessibility

Owns:

- heading text
- semantic heading level
- element identity

### Text and Rich Text

Compose:

- Typography
- Layout/Alignment
- Spacing
- Visibility
- Accessibility

Own:

- text or rich text content
- semantic content structure

Rich text markup must not become a second typography system. Typography remains
resolved by the Typography capability.

### Button

Composes:

- Buttons
- Links
- Typography through the Button capability
- Visibility
- Animation/Transitions

Owns:

- label
- destination
- target behavior
- action identity

Button appearance must not be implemented separately by Hero, Panel, Grid, or
any other element.

### Hero

Composes:

- Typography
- Layout
- Spacing
- Media
- Images, when applicable
- Links
- Buttons
- Visibility/Responsive
- Animation

Owns:

- hero composition
- eyebrow, title, body, and action content
- hero-specific media placement semantics

### Panel

Composes:

- Cards
- Typography
- Media
- Images, when applicable
- Layout
- Spacing
- Links
- Buttons
- Visibility

Owns:

- panel content structure
- panel-specific media/content relationship

### List

Composes:

- List presentation
- Typography
- Spacing
- Links
- Icons
- Visibility

Owns:

- ordered item content
- item destinations
- list semantics

### Accordion

Composes:

- Accordion behavior
- Typography
- Spacing
- Icons, when used as indicators
- Visibility
- Animation/Transitions

Owns:

- item titles
- item content
- disclosure semantics
- authored open-state options

Editor-only expansion and drag state is not Accordion document content.

### Grid

Composes:

- Grid layout
- Data and query
- Cards
- Typography
- Media/Images
- Spacing
- Links
- Buttons
- Visibility/Responsive

Owns:

- grid source and query semantics
- ordered items when the grid is static
- item content and item-specific composition

Grid must not create a second Card, Button, Typography, or Icon system.

### Image

Composes:

- Images
- Media
- Links
- Geometry
- Shadows and effects
- Visibility/Responsive

Owns:

- source
- alternative text
- caption
- image-specific semantic link data

### Icon

Composes:

- Icons
- Visibility
- optional Typography/color inheritance

Owns:

- the semantic icon identifier
- optional accessible label

The icon identifier is selected locally. SVG implementation, registry data, and
rendering are never element-specific.

---

## 7. Capability design principles

1. **Single ownership**  
   Every setting has one capability owner.

2. **Composition over duplication**  
   Elements compose capabilities instead of reimplementing them.

3. **Semantic content stays local**  
   Content, data, and element meaning belong to the element document record.

4. **Appearance stays shared**  
   Appearance belongs to Global Settings, component defaults, or an explicit
   local override.

5. **Inheritance is the default**  
   Local ownership begins only after an explicit user override.

6. **Reset restores inheritance**  
   Reset removes local ownership; it does not copy a resolved global value.

7. **Capability panels own UI**  
   Inspector controls for a capability live in one reusable capability panel.

8. **Resolvers own effective values**  
   Resolvers calculate values and never render DOM or mutate documents.

9. **Renderers consume resolved values**  
   Renderers do not contain inspector logic or independent default systems.

10. **Components own structure**  
    Structural components own markup, semantics, and component-specific DOM
    relationships.

11. **UIkit remains canonical**  
    WebPages maps semantic capability values to UIkit classes, variables, and
    components. It does not create a parallel design system.

12. **No capability may absorb another capability**  
    A Button capability may depend on Typography, but it must not copy
    Typography controls or create a second typography resolver.

13. **No circular capability ownership**  
    Capabilities may depend on lower-level contracts, but dependencies must not
    form ownership cycles.

14. **Builder/frontend parity is mandatory**  
    Builder preview and frontend rendering consume the same resolved values and
    canonical structural rendering path.

15. **UI-only state is not document state**  
    Selection, inspector expansion, drag state, and preview state remain in the
    editor runtime.

16. **Compatibility is an adapter concern**  
    Legacy fields may be read and normalized, but compatibility code must not
    become a second canonical owner.

17. **Accessibility follows semantics**  
    Accessibility values belong to the semantic element or shared accessibility
    capability, never to visual-only appearance controls.

18. **Capability boundaries must remain visible**  
    A reviewer must be able to identify where a setting is stored, resolved,
    edited, and rendered.

---

## 8. Future capability milestones

These are capability milestones, not element milestones or implementation tasks.

### Foundation capabilities

- Content and semantic identity
- Typography
- Colors
- Spacing
- Sizing and containers
- Layout and alignment

### Appearance capabilities

- Backgrounds
- Borders and radius
- Shadows and effects
- Cards
- Buttons
- Links
- Media and images
- Icons

### Responsive and behavioral capabilities

- Visibility
- Responsive overrides
- Animation
- Transitions
- Interaction behavior
- Accessibility

### Composition capabilities

- List presentation
- Accordion behavior
- Grid layout
- Repeatable item interaction
- Component media relationships

### Domain capabilities

- Data sources
- Queries and filters
- Product presentation
- Forms
- Embeds
- Navigation and header behavior

Each milestone extends the same ownership and inheritance contract. A milestone
does not create a new settings architecture.

---

## 9. Migration principles

All future architectural work must obey these rules:

- Extend existing canonical systems before creating anything new.
- Reuse existing resolvers, UIkit mappings, renderers, and capability panels.
- Establish ownership before changing implementation.
- Prefer the smallest consolidation that removes a real duplicate owner.
- Preserve document compatibility and existing authored content.
- Keep legacy readers as compatibility adapters until migration is proven safe.
- Never add a second renderer for the same element.
- Never add an element-specific version of a shared capability.
- Never copy global values into local document fields merely to simplify rendering.
- Never make a component responsible for Global Settings.
- Never make an inspector responsible for DOM rendering.
- Never make a resolver responsible for document mutation.
- Never introduce a universal mega-component to avoid defining boundaries.
- Keep builder and frontend parity as a release requirement.
- Validate inherited values and explicit overrides independently.
- Treat reset and inheritance as first-class behavior.
- Keep UI-only state outside the persisted document.
- Retire duplicate ownership only after compatibility behavior is verified.

This constitution governs all future WebPages builder elements and capabilities.
