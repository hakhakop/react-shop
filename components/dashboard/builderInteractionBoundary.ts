/**
 * Interaction policy for the visual Builder canvas.
 *
 * Renderers continue to own presentation and storefront behavior. This module
 * is deliberately DOM/event focused so every rendered element gets the same
 * Builder editing boundary without teaching individual renderers about it.
 */

/** Controls that are intentionally allowed to behave as a live preview. */
export const BUILDER_PREVIEW_INTERACTIVE_SELECTOR = [
  "[data-builder-preview-interactive=\"true\"]",
  ".builder-preview-block-tools button",
  ".shop-builder-swiper button",
  ".shop-builder-swiper [role=\"button\"]",
  ".shop-builder-swiper .swiper-pagination",
  ".shop-builder-swiper .swiper-pagination-bullet",
  ".shop-builder-column-block--accordion .uk-accordion-title",
  ".shop-builder-products button",
  ".shop-builder-grid-wrapper button",
].join(", ");

const BUILDER_ACTION_SELECTOR = [
  "button",
  "[role=\"button\"]",
  "summary",
  "input[type=\"button\"]",
  "input[type=\"submit\"]",
  "input[type=\"reset\"]",
].join(", ");

const BUILDER_INLINE_EDIT_SELECTOR = [
  "[contenteditable=\"true\"]",
  "input:not([type=\"button\"]):not([type=\"submit\"]):not([type=\"reset\"])",
  "textarea",
  "select",
].join(", ");

function closestElement(
  target: EventTarget | null,
  selector: string,
): HTMLElement | null {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(selector);
}

export function isBuilderInlineEditingTarget(target: EventTarget | null) {
  return Boolean(closestElement(target, BUILDER_INLINE_EDIT_SELECTOR));
}

export function isBuilderPreviewInteractiveControl(target: EventTarget | null) {
  return Boolean(closestElement(target, BUILDER_PREVIEW_INTERACTIVE_SELECTOR));
}

export function isBuilderNavigableTarget(target: EventTarget | null) {
  return Boolean(closestElement(target, BUILDER_ACTION_SELECTOR));
}

/**
 * Returns the authored destination for the shared scoped-preview navigation
 * owner (and for any future explicit "Open link" action).
 */
export function resolveBuilderOpenLinkIntent(target: EventTarget | null) {
  const element = closestElement(target, "a[href]");
  if (!element) return null;
  const anchor = element as HTMLAnchorElement;
  return {
    href: anchor.getAttribute("href") ?? "",
    target: anchor.getAttribute("target"),
    rel: anchor.getAttribute("rel"),
  };
}

/**
 * Website anchors are deliberately not suppressed here. The scoped preview
 * router owns internal anchor navigation; this boundary only blocks controls
 * that can perform a live side effect (commerce, auth, submit, etc.).
 * The event is left bubbling so the existing delegated selection owner still
 * runs for blocked controls.
 */
export function shouldSuppressBuilderNavigation(
  target: EventTarget | null,
  event: Pick<MouseEvent, "defaultPrevented"> = { defaultPrevented: false },
) {
  if (event.defaultPrevented || isBuilderInlineEditingTarget(target)) return false;
  // Anchors are website navigation, not editor actions. The scoped preview
  // router receives the authored intent and resolves internal destinations.
  if (resolveBuilderOpenLinkIntent(target)) return false;
  if (isBuilderPreviewInteractiveControl(target)) return false;
  return isBuilderNavigableTarget(target);
}

export function shouldSuppressBuilderKeyboardNavigation(
  target: EventTarget | null,
  key: string,
) {
  if (key !== "Enter" && key !== " ") return false;
  if (isBuilderInlineEditingTarget(target)) return false;
  if (resolveBuilderOpenLinkIntent(target)) return false;
  if (isBuilderPreviewInteractiveControl(target)) return false;
  return isBuilderNavigableTarget(target);
}
