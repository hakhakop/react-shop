import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

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
  expect(librarySurface).toContain("replace the entire layout");
  expect(librarySurface).toContain("imported !== false");
  expect(source).toContain("acceptedTypes.includes(importedType)");
  expect(source).toContain("templateType: importedType");
  expect(source).toContain('targetType === "element"');
  expect(librarySurface).toContain('"This Site" : "Shared"');
  expect(librarySurface).toContain('template.libraryScope ?? "shared"');
  expect(librarySurface).toContain("templateIsReadOnlyShared");
  expect(dashboardStyles).toContain(
    ".builder-library-surface.is-contextual .builder-template-row > .builder-icon-button {\n  display: inline-flex;",
  );
});

test("Builder Library persistence separates website and shared stores", async () => {
  const route = await readFile(path.join(process.cwd(), "app/api/builder-templates/route.ts"), "utf8");
  const storage = await readFile(path.join(process.cwd(), "lib/websiteBuilderData.ts"), "utf8");
  const layouts = await readFile(path.join(process.cwd(), "lib/builderLayouts.ts"), "utf8");

  expect(route).toContain("getAuthorizedWebsiteBuilderScope(request)");
  expect(route).toContain('readBuilderSavedTemplates(scope)');
  expect(route).toContain('readBuilderSavedTemplates()');
  expect(route).toContain('withLibraryScope(siteTemplates, "site")');
  expect(route).toContain('withLibraryScope(sharedTemplates, "shared")');
  expect(storage).toContain('getBuilderTemplatesPath(websiteId?: string)');
  expect(layouts).toContain('getBuilderTemplatesPath(scope.websiteId)');
});
