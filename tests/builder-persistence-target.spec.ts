import { expect, test } from "@playwright/test";
import {
  resolveBuilderPersistenceTarget,
  type BuilderEditorContext,
} from "@/lib/builderEditorContext";

function context(
  kind: BuilderEditorContext["document"]["kind"],
  id: string,
): BuilderEditorContext {
  return {
    document: { id, kind, displayName: "Test" },
    scope: {},
    content: { mode: kind === "routing-template" ? "preview" : "none" },
    ownership: {},
    navigation: { returnHref: "/dashboard#templates", returnLabel: "Back to Templates" },
    capabilities: { canChangePreview: false, canOpenFrontend: false, canEditAssignedTemplate: false },
  };
}

test("strict template URLs cannot fall through and overwrite Home while ownership loads", () => {
  const documentId = "layout:builder:dynamic:00000000-0000-4000-8000-000000000001";
  expect(resolveBuilderPersistenceTarget({
    requestedDocumentId: documentId,
    editorContext: context("page", "layout:builder:home"),
    page: "home",
  })).toBeNull();
  expect(resolveBuilderPersistenceTarget({
    requestedDocumentId: documentId,
    editorContext: context("routing-template", documentId),
    page: "dynamic:00000000-0000-4000-8000-000000000001",
  })).toEqual({ kind: "document", documentId });
});

test("a canonical template opened through a routing assignment keeps its page-store owner", () => {
  const documentId = "layout:builder:product-category";
  expect(resolveBuilderPersistenceTarget({
    requestedDocumentId: documentId,
    editorContext: context("routing-template", documentId),
    page: "product-category",
  })).toEqual({ kind: "page" });

  // The URL identity and rendered state must still agree before saving.
  expect(resolveBuilderPersistenceTarget({
    requestedDocumentId: documentId,
    editorContext: context("routing-template", documentId),
    page: "home",
  })).toBeNull();
});

test("a stale template context cannot save after returning to an ordinary page", () => {
  const documentId = "layout:builder:dynamic:00000000-0000-4000-8000-000000000001";
  expect(resolveBuilderPersistenceTarget({
    editorContext: context("routing-template", documentId),
    page: "home",
  })).toBeNull();
  expect(resolveBuilderPersistenceTarget({
    editorContext: context("page", "layout:builder:home"),
    page: "home",
  })).toEqual({ kind: "page" });
});

test("ordinary page ownership must match the state key", () => {
  expect(resolveBuilderPersistenceTarget({
    editorContext: context("page", "layout:builder:page:women"),
    page: "home",
  })).toBeNull();
});
