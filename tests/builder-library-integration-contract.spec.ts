import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { resolveBuilderLibraryImportFormat } from "@/lib/layoutLibrary";

test("one Library upload routes portable Builder JSON and YOOtheme JSON by format", () => {
  expect(resolveBuilderLibraryImportFormat({
    exportType: "webpages-builder-template",
    template: { templateType: "section", sections: [] },
  })).toEqual({ source: "webpages", templateType: "section" });
  expect(resolveBuilderLibraryImportFormat({
    sections: [{ id: "section-1", kind: "contentLayout", visible: true }],
  })).toEqual({ source: "webpages", templateType: undefined });
  expect(resolveBuilderLibraryImportFormat({ name: "YOOtheme layout", children: [] })).toEqual({
    source: "yootheme",
    templateType: undefined,
  });
});

test("Builder Library uses existing saved-template persistence and preserves document context", async () => {
  const source = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");
  const librarySurface = await readFile(path.join(process.cwd(), "components/dashboard/LayoutLibrarySurface.tsx"), "utf8");
  const dashboardStyles = await readFile(path.join(process.cwd(), "app/styles/dashboard.css"), "utf8");
  const panel = await readFile(path.join(process.cwd(), "components/dashboard/TemplatesPanel.tsx"), "utf8");
  expect(source).toContain('fetch(builderApiUrl("/api/builder-templates")');
  expect(source).toContain("cloneTemplateSection");
  expect(source).toContain("const applySavedTemplate = (");
  expect(source).toContain("...current,");
  expect(source).toContain("sections: clonedSections");
  expect(source).toContain("const insertContextualLibraryTemplate = (");
  expect(source).toContain("insertAtContextualTarget");
  expect(source).toContain("rowId: targetRowId");
  expect(source).toContain("if (!inserted) return;");
  expect(source).toContain('if (action === "replace") {');
  expect(source).toContain('label: "Replace Layout"');
  const unifiedReplacement = source.slice(
    source.indexOf("usesUnifiedContextualLayouts &&"),
    source.indexOf("} else {", source.indexOf("usesUnifiedContextualLayouts &&")),
  );
  expect(unifiedReplacement).toContain('if (action === "replace") {');
  expect(unifiedReplacement).not.toContain("target.sectionId");
  expect(source).toContain('mode="contextual"');
  expect(panel).toContain("Save Current Page");
  expect(panel).toContain("Save Selected Section");
  expect(panel).toContain("Save Selected Element");
  expect(panel).toContain("templateType");
  expect(source).not.toContain("builder-routing.json");
  expect(source).not.toContain("templatePreviewIdentityStorage");
  expect(librarySurface).toContain("activeLibraryTypes");
  expect(librarySurface).toContain('aria-label="Insert layout"');
  expect(librarySurface).toContain("imported !== false");
  expect(librarySurface).toContain("resolveBuilderLibraryImportFormat");
  expect(librarySurface).toContain("pendingImport.targetType");
  expect(librarySurface).toContain("Upload Layout");
  expect(librarySurface).not.toContain("Import YOOtheme Layout");
  expect(source).toContain("acceptedTypes.includes(importedType)");
  expect(source).toContain("templateType: importedType");
  expect(source).toContain('targetType === "element"');
  expect(librarySurface).not.toContain('"This Site" : "Shared"');
  expect(librarySurface).not.toContain("templateIsReadOnlyShared");
  expect(source).not.toContain("Templates save to React");
  expect(dashboardStyles).toContain(".builder-template-row:hover .builder-template-row-actions");
  expect(dashboardStyles).toContain(".builder-library-context-actions select");
});

test("Builder Library persistence separates website and shared stores", async () => {
  const route = await readFile(path.join(process.cwd(), "app/api/builder-templates/route.ts"), "utf8");
  const storage = await readFile(path.join(process.cwd(), "lib/websiteBuilderData.ts"), "utf8");
  const layouts = await readFile(path.join(process.cwd(), "lib/builderLayouts.ts"), "utf8");

  expect(route).toContain("getAuthorizedWebsiteBuilderScope(request)");
  expect(route).toContain('readBuilderSavedTemplates(scope)');
  expect(route).not.toContain('readBuilderSavedTemplates()');
  expect(route).toContain('return withLibraryScope(templates, scope.websiteId ? "site" : "shared")');
  expect(route).not.toContain("sharedTemplates");
  expect(storage).toContain('getBuilderTemplatesPath(websiteId?: string)');
  expect(layouts).toContain('getBuilderTemplatesPath(scope.websiteId)');
});
