import { randomUUID } from "node:crypto";
import {
  parseLayoutDocumentId,
  type LayoutDocumentId,
} from "@/lib/layoutRouting";
import {
  mutateBuilderLayoutStore,
  readBuilderLayoutStore,
  type BuilderDataScope,
  type BuilderDesign,
  type BuilderLayout,
  type BuilderSection,
  type DynamicBuilderDocumentKey,
} from "@/lib/builderLayouts";

const DYNAMIC_DOCUMENT_ID = /^layout:builder:dynamic:([a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;

export class InvalidBuilderDocumentIdError extends Error {}
export class BuilderDocumentNotFoundError extends Error {}

export function parseDynamicBuilderDocumentId(value: unknown): LayoutDocumentId {
  if (typeof value !== "string" || !DYNAMIC_DOCUMENT_ID.test(value)) {
    throw new InvalidBuilderDocumentIdError("Invalid dynamic Builder document ID.");
  }
  return parseLayoutDocumentId(value);
}

export function dynamicBuilderDocumentKey(
  documentId: LayoutDocumentId,
): DynamicBuilderDocumentKey {
  const match = DYNAMIC_DOCUMENT_ID.exec(documentId);
  if (!match) throw new InvalidBuilderDocumentIdError("Invalid dynamic Builder document ID.");
  return `dynamic:${match[1].toLowerCase()}`;
}

function createDocumentId() {
  return parseDynamicBuilderDocumentId(`layout:builder:dynamic:${randomUUID()}`);
}

function blankSections(): BuilderSection[] {
  return [{
    id: "dynamic-document-section",
    kind: "contentLayout",
    title: "",
    background: "transparent",
    visible: true,
    layout: "whole",
    layoutColumns: 1,
    layoutRows: 1,
    layoutItems: [{
      id: "dynamic-document-column",
      rowId: "dynamic-document-row",
      rowLayout: "whole",
      blocks: [],
    }],
  }];
}

export type DynamicBuilderDocumentCreateInput = {
  displayName?: string;
  design?: BuilderDesign;
  sections?: BuilderSection[];
};

export type DynamicBuilderLayout = BuilderLayout & {
  page: DynamicBuilderDocumentKey;
  key: DynamicBuilderDocumentKey;
  targetType: "document";
  documentId: LayoutDocumentId;
};

export async function createDynamicBuilderDocument(
  input: DynamicBuilderDocumentCreateInput = {},
  scope: BuilderDataScope = {},
): Promise<DynamicBuilderLayout> {
  const documentId = createDocumentId();
  const key = dynamicBuilderDocumentKey(documentId);
  const layout: DynamicBuilderLayout = {
    version: 1,
    key,
    page: key,
    targetType: "document",
    documentId,
    displayName: input.displayName?.trim() || "Untitled Layout",
    design: input.design,
    sections: structuredClone(input.sections ?? blankSections()),
    updatedAt: new Date().toISOString(),
  };
  return mutateBuilderLayoutStore((store) => {
    store[key] = layout;
    return layout;
  }, scope);
}

export async function readDynamicBuilderDocument(
  value: unknown,
  scope: BuilderDataScope = {},
): Promise<DynamicBuilderLayout> {
  const documentId = parseDynamicBuilderDocumentId(value);
  const key = dynamicBuilderDocumentKey(documentId);
  const store = await readBuilderLayoutStore(scope);
  if (!Object.prototype.hasOwnProperty.call(store, key)) {
    throw new BuilderDocumentNotFoundError("Dynamic Builder document not found.");
  }
  const layout = store[key]!;
  if (layout.documentId !== documentId || layout.page !== key || layout.targetType !== "document") {
    throw new InvalidBuilderDocumentIdError("Stored dynamic Builder document identity is invalid.");
  }
  return layout as DynamicBuilderLayout;
}

export async function updateDynamicBuilderDocument(
  value: unknown,
  input: Pick<BuilderLayout, "sections"> & Partial<Pick<BuilderLayout, "design" | "displayName">>,
  scope: BuilderDataScope = {},
): Promise<DynamicBuilderLayout> {
  const documentId = parseDynamicBuilderDocumentId(value);
  const key = dynamicBuilderDocumentKey(documentId);
  return mutateBuilderLayoutStore((store) => {
    const current = store[key];
    if (!current) throw new BuilderDocumentNotFoundError("Dynamic Builder document not found.");
    const layout: DynamicBuilderLayout = {
      ...current,
      key,
      page: key,
      targetType: "document",
      documentId,
      displayName: input.displayName?.trim() || current.displayName,
      design: input.design,
      sections: structuredClone(input.sections),
      updatedAt: new Date().toISOString(),
    };
    store[key] = layout;
    return layout;
  }, scope);
}

export async function duplicateDynamicBuilderDocument(
  value: unknown,
  scope: BuilderDataScope = {},
): Promise<DynamicBuilderLayout> {
  const sourceDocumentId = parseDynamicBuilderDocumentId(value);
  const sourceKey = dynamicBuilderDocumentKey(sourceDocumentId);
  const documentId = createDocumentId();
  const key = dynamicBuilderDocumentKey(documentId);
  return mutateBuilderLayoutStore((store) => {
    const source = store[sourceKey];
    if (!source) throw new BuilderDocumentNotFoundError("Dynamic Builder document not found.");
    const layout: DynamicBuilderLayout = {
      ...structuredClone(source), key, page: key, targetType: "document", documentId,
      displayName: `${source.displayName || "Untitled Layout"} Copy`,
      updatedAt: new Date().toISOString(),
    };
    store[key] = layout;
    return layout;
  }, scope);
}

export async function deleteDynamicBuilderDocument(
  value: unknown,
  scope: BuilderDataScope = {},
) {
  const documentId = parseDynamicBuilderDocumentId(value);
  const key = dynamicBuilderDocumentKey(documentId);
  await mutateBuilderLayoutStore((store) => {
    if (!store[key]) throw new BuilderDocumentNotFoundError("Dynamic Builder document not found.");
    delete store[key];
  }, scope);
}
