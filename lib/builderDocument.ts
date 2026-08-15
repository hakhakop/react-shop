import type {
  BuilderDataScope,
  BuilderDocumentKey,
  BuilderLayout,
} from "@/lib/builderLayouts";
import {
  getPublishedBuilderLayout,
  mutateBuilderLayoutStore,
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

  return mutateBuilderLayoutStore((store) => {
    if (store[key]) return store[key]!;
    const layout = create();
    store[key] = layout;
    return layout;
  }, scope);
}
