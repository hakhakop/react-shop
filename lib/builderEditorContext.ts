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
    family?: "product" | "post";
    identity?: StableContentIdentity;
    label?: string;
    availability?: "published" | "unpublished" | "unknown" | "missing";
    storefrontHref?: string;
  };
  ownership: {
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

export type EditableLayoutTarget = {
  label: "Edit Individual Layout" | "Edit Single Post Template" | "Edit Product Template" | "Create Layout" | "Edit Page";
  targetKind: "individual" | "routing-template" | "content-management" | "page";
  builderHref: string;
  effectiveSource: BuilderEditorLayoutSource | "page";
  documentId?: string;
  routingTemplateId?: string;
  individualIdentity?: StableContentIdentity;
};
