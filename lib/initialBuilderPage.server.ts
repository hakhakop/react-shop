import type { SaaSWebsite } from "@/lib/websites";
import {
  getPublishedBuilderLayout,
  type BuilderDataScope,
  type BuilderLayout,
  type BuilderLayoutKey,
} from "@/lib/builderLayouts";
import { resolveContentSections } from "@/lib/builderContentLanguages";
import { resolveBuilderMediaUrls } from "@/lib/builderMediaUrls";
import { materializeBuilderDynamicContent } from "@/lib/builderDynamicContentMaterializer.server";
import { resolveOrdinaryBuilderEditorContext } from "@/lib/builderEditorContext.server";

export async function resolveInitialBuilderPage(input: {
  page: BuilderLayoutKey;
  scope?: BuilderDataScope;
  website?: SaaSWebsite;
  contentLanguage: string;
  primaryContentLanguage: string;
  wordpressMediaOrigin?: string | null;
}) {
  const authoredLayout = await getPublishedBuilderLayout(input.page, input.scope);
  const editorContext = await resolveOrdinaryBuilderEditorContext({
    page: input.page,
    scope: input.scope,
    layout: authoredLayout,
  });
  if (!authoredLayout) {
    return {
      authoredLayout: null,
      renderLayout: null,
      editorContext,
    };
  }

  const localizedLayout = {
    ...authoredLayout,
    sections: resolveContentSections(
      authoredLayout.sections as never,
      input.contentLanguage,
      input.primaryContentLanguage,
    ) as typeof authoredLayout.sections,
  };
  const resolvedMediaLayout = input.wordpressMediaOrigin
    ? resolveBuilderMediaUrls(localizedLayout, input.wordpressMediaOrigin)
    : localizedLayout;
  const materialization = await materializeBuilderDynamicContent(
    resolvedMediaLayout,
    input.website
      ? { website: input.website }
      : undefined,
  );

  return {
    authoredLayout,
    renderLayout: materialization.renderLayout,
    editorContext,
  } satisfies {
    authoredLayout: BuilderLayout;
    renderLayout: BuilderLayout;
    editorContext: Awaited<ReturnType<typeof resolveOrdinaryBuilderEditorContext>>;
  };
}
