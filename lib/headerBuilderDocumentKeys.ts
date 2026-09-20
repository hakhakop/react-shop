/**
 * Desktop and Mobile Header are the two editable Builder documents. The
 * former standalone dialog key remains a compatibility/import key; its root
 * now lives directly after the mobile bar inside `header-mobile`.
 */
export const HEADER_BUILDER_DOCUMENT_KEYS = [
  "header",
  "header-mobile",
  "header-mobile-dialog",
] as const;

export type HeaderBuilderDocumentKey = (typeof HEADER_BUILDER_DOCUMENT_KEYS)[number];
export type HeaderBuilderView = "desktop" | "mobile" | "dialog";

export function isHeaderBuilderDocumentKey(value: unknown): value is HeaderBuilderDocumentKey {
  return typeof value === "string" && (HEADER_BUILDER_DOCUMENT_KEYS as readonly string[]).includes(value);
}

export function headerBuilderDocumentKeyForView(view: HeaderBuilderView): HeaderBuilderDocumentKey {
  if (view === "mobile") return "header-mobile";
  if (view === "dialog") return "header-mobile-dialog";
  return "header";
}

export function headerBuilderViewForDocumentKey(key: HeaderBuilderDocumentKey): HeaderBuilderView {
  if (key === "header-mobile") return "mobile";
  if (key === "header-mobile-dialog") return "dialog";
  return "desktop";
}

/**
 * The Builder selection bridge uses section IDs as part of its stable target
 * identity. The drawer root remains distinct inside the Mobile Header
 * document so Builder selection and imported settings retain a stable owner.
 */
export function headerBuilderDocumentSectionId(key: HeaderBuilderDocumentKey): string {
  if (key === "header-mobile") return "header-mobile-document";
  if (key === "header-mobile-dialog") return "header-mobile-dialog-document";
  return "header-document";
}

/** Resolve the owning Header document from the stable Builder root ID. */
export function headerBuilderDocumentKeyForSectionId(
  value: unknown,
): HeaderBuilderDocumentKey | null {
  if (typeof value !== "string") return null;
  return HEADER_BUILDER_DOCUMENT_KEYS.find(
    (key) => headerBuilderDocumentSectionId(key) === value,
  ) ?? null;
}

export function isHeaderBuilderDocumentSectionId(value: unknown): boolean {
  return headerBuilderDocumentKeyForSectionId(value) !== null;
}

export const HEADER_BUILDER_DOCUMENT_LABELS: Record<HeaderBuilderView, string> = {
  desktop: "Desktop Header",
  mobile: "Mobile Header",
  dialog: "Mobile Menu Dialog",
};
