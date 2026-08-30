import type { StableContentIdentity } from "@/lib/layoutRouting";

export type BuilderEditorDocumentKind =
  | "page"
  | "routing-template"
  | "individual"
  | "header"
  | "footer";

export type BuilderEditorLayoutSource =
  | "individual"
  | "routing-template"
  | "native-fallback"
  | "not-found";

export type BuilderEditorLayoutReference = {
  source: BuilderEditorLayoutSource;
  layoutId?: string;
};

export type BuilderEditorTemplateReference = {
  templateId: string;
  name: string;
  layoutId: string;
};

/**
 * Canonical, serializable UI projection for one validated Builder session.
 * It intentionally contains identity and ownership metadata, never CMS payloads.
 */
export type BuilderEditorContext = {
  document: {
    id: string;
    kind: BuilderEditorDocumentKind;
    displayName: string;
  };
  scope: {
    websiteId?: string;
  };
  content: {
    mode: "none" | "preview" | "fixed";
    pageType?: string;
    family?: string;
    identity?: StableContentIdentity;
    label?: string;
    availability?: "published" | "unpublished" | "unknown" | "missing";
    storefrontHref?: string;
  };
  ownership: {
    /** Storefront-equivalent resolution for the canvas context. */
    resolved?: BuilderEditorLayoutReference;
    /** Present only when the canonical resolver selected a Routing Template. */
    activeTemplate?: BuilderEditorTemplateReference;
    effective?: BuilderEditorLayoutReference;
    individual?: { layoutId: string };
    assignedTemplate?: BuilderEditorTemplateReference;
    fallback?: BuilderEditorLayoutReference;
    assignmentSummary?: string;
  };
  navigation: {
    returnHref: string;
    returnLabel: "Back to Pages" | "Back to Templates" | "Back to Content";
    frontendHref?: string;
  };
  capabilities: {
    canChangePreview: boolean;
    canOpenFrontend: boolean;
    canEditAssignedTemplate: boolean;
  };
};

/** Current validated canvas context used to seed new Routing Templates. */
export type BuilderTemplateCreationContext = {
  pageType: string;
  previewIdentity?: StableContentIdentity;
  previewLabel?: string;
  storefrontHref?: string;
};

export type EditableLayoutTarget = {
  label: string;
  targetKind: "individual" | "routing-template" | "content-management" | "page";
  builderHref: string;
  effectiveSource: BuilderEditorLayoutSource | "page";
  documentId?: string;
  routingTemplateId?: string;
  individualIdentity?: StableContentIdentity;
};
