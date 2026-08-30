import type {
  BuilderEditorContext,
  BuilderTemplateCreationContext,
} from "@/lib/builderEditorContext";
import type { StableContentIdentity } from "@/lib/layoutRouting";

type PreviewCandidate = {
  identity: StableContentIdentity;
  label: string;
  storefrontHref?: string;
};

/** Projects the validated current canvas into generic template-creation defaults. */
export function deriveTemplateCreationContext(input: {
  editorContext?: BuilderEditorContext | null;
  templatePageType?: string | null;
  previewIdentity?: StableContentIdentity | null;
  previewCandidates?: readonly PreviewCandidate[];
}): BuilderTemplateCreationContext | undefined {
  const pageType = input.editorContext?.content.pageType ?? input.templatePageType;
  if (!pageType) return undefined;
  const previewIdentity = input.previewIdentity ?? input.editorContext?.content.identity;
  const candidate = previewIdentity
    ? input.previewCandidates?.find((item) =>
        item.identity.provider === previewIdentity.provider &&
        item.identity.contentType === previewIdentity.contentType &&
        item.identity.contentId === previewIdentity.contentId,
      )
    : undefined;
  const previewLabel = candidate?.label ?? input.editorContext?.content.label;
  const storefrontHref = candidate?.storefrontHref ?? input.editorContext?.content.storefrontHref;
  return {
    pageType,
    ...(previewIdentity ? { previewIdentity } : {}),
    ...(previewLabel ? { previewLabel } : {}),
    ...(storefrontHref ? { storefrontHref } : {}),
  };
}

export function initialTemplatePageType(
  registeredPageTypeIds: readonly string[],
  context?: BuilderTemplateCreationContext,
) {
  return context && registeredPageTypeIds.includes(context.pageType)
    ? context.pageType
    : registeredPageTypeIds[0];
}

export function templateEditorSearchParams(input: {
  layoutId: string;
  templateId: string;
  websiteId?: string;
  previewIdentity?: StableContentIdentity;
}) {
  const params = new URLSearchParams({ document: input.layoutId, routingTemplate: input.templateId });
  if (input.previewIdentity) {
    params.set("previewProvider", input.previewIdentity.provider);
    params.set("previewContentType", input.previewIdentity.contentType);
    params.set("previewContentId", input.previewIdentity.contentId);
  }
  if (input.websiteId) params.set("websiteId", input.websiteId);
  return params;
}
