/**
 * Removes only the persisted local draft that an authoritative document import
 * has just replaced. Other pages (and, because the storage key is site-scoped,
 * other websites) are deliberately left untouched.
 */
export function invalidateImportedBuilderDraft(
  storage: Pick<Storage, "getItem" | "setItem">,
  {
    draftsKey,
    stateKey,
    draftMetadataKey,
    pageKey,
    importedState,
  }: {
    draftsKey: string;
    stateKey: string;
    draftMetadataKey?: string;
    pageKey: string;
    importedState: unknown;
  },
) {
  const rawDrafts = storage.getItem(draftsKey);
  const drafts = rawDrafts
    ? (JSON.parse(rawDrafts) as Record<string, unknown>)
    : {};

  delete drafts[pageKey];
  storage.setItem(draftsKey, JSON.stringify(drafts));
  if (draftMetadataKey) {
    const rawMetadata = storage.getItem(draftMetadataKey);
    const metadata = rawMetadata
      ? (JSON.parse(rawMetadata) as Record<string, unknown>)
      : {};
    delete metadata[pageKey];
    storage.setItem(draftMetadataKey, JSON.stringify(metadata));
  }
  // DashboardBuilder falls back to this current-state entry when the selected
  // page has no draft. Keep that fallback aligned with the persisted import.
  storage.setItem(stateKey, JSON.stringify(importedState));
}
