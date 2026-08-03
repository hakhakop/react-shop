## Root Website Status

- The Root Website is the public WebPages marketing website at `/`.
- It is currently edited through `/dashboard` by `super_admin`.
- It is intentionally separate from customer websites.
- Customer websites live in `WEBPAGES_DATA_DIR/websites/<websiteId>`.
- Root Website migration into the SaaS website model is a future milestone.
- Do not migrate Root Website until a dedicated backup/import/export migration
  plan exists.

## Repeatable Element Item Inspector Pattern

Accordion is the reference implementation for ordered, repeatable items in the
builder inspector. Future elements with item collections should follow this
interaction contract and reuse the existing inspector presentation classes;
they should not introduce element-specific item-management conventions.

### Canonical interaction contract

- Each item has a stable document `id` and is rendered in document order.
- Items appear as compact nested cards using the existing
  `builder-nested-card` pattern.
- The first item is expanded by default. Clicking an expanded item header a
  second time closes it; opening another item closes the previously expanded
  inspector card.
- Every repeatable item exposes Copy, Delete, and a dedicated drag handle.
- Keyboard-friendly Up and Down controls remain available inside the item body
  for precise reordering and accessible fallback behavior.
- Add item remains an explicit collection-level action.
- Inspector expansion, drag state, and drop state are editor UI state; they are
  not persisted as document content.

### Ownership boundaries

The element-specific capability panel owns the fields, validation, collection
updates, and any item-specific semantics. The existing nested-card classes own
the shared inspector presentation. The canonical element renderer owns the
runtime DOM and consumes the resulting ordered document array. Copy, delete,
and reorder operations must update any related index-based document fields at
the same time; Accordion therefore remaps `accordionOpenItems` whenever its
items move or are removed.

This pattern does not apply to fixed semantic slots such as a Hero's primary
and secondary actions. Those are separate named fields, not an ordered item
collection. It also does not justify a universal mega-component or a second
renderer. If several repeatable elements converge on the same behavior, a
small shared control may be extracted later after the ownership contract and
accessibility behavior are proven in production.

### Adoption sequence

Accordion established the reference, and the List and Grid item inspectors now
conform to the same Copy/Delete/Drag contract. New repeatable elements should
adopt this contract from the beginning, while keeping their content fields and
renderer semantics element-specific.
