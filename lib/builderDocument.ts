import type {
  BuilderDataScope,
  BuilderDocumentKey,
  BuilderLayout,
} from "@/lib/builderLayouts";
import {
  getPublishedBuilderLayout,
  readBuilderLayoutStore,
  writeBuilderLayoutStore,
} from "@/lib/builderLayouts";

export const builderDocumentConfig: Record<
  BuilderDocumentKey,
  { sectionId: `${BuilderDocumentKey}-document`; label: string }
> = {
  header: { sectionId: "header-document", label: "Header" },
  footer: { sectionId: "footer-document", label: "Footer" },
};

export function isBuilderDocumentKey(value: unknown): value is BuilderDocumentKey {
  return value === "header" || value === "footer";
}

export function hydrateBuilderDocumentState<
  T extends { page: string; targetType?: string },
>(state: T): T {
  if (!isBuilderDocumentKey(state.page) || state.targetType === state.page) {
    return state;
  }
  return { ...state, targetType: state.page };
}

export async function getOrCreateBuilderDocumentLayout({
  key,
  scope,
  create,
}: {
  key: BuilderDocumentKey;
  scope: BuilderDataScope;
  create: () => BuilderLayout;
}) {
  const existing = await getPublishedBuilderLayout(key, scope);
  if (existing) return existing;

  const layout = create();
  const store = await readBuilderLayoutStore(scope);
  store[key] = layout;
  await writeBuilderLayoutStore(store, scope);
  return layout;
}
