import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("Builder Library uses existing saved-template persistence and preserves document context", async () => {
  const source = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");
  const panel = await readFile(path.join(process.cwd(), "components/dashboard/TemplatesPanel.tsx"), "utf8");
  expect(source).toContain('fetch("/api/builder-templates"');
  expect(source).toContain("cloneTemplateSection");
  expect(source).toContain("const applySavedTemplate = (template: BuilderSavedTemplate)");
  expect(source).toContain("...current,");
  expect(source).toContain("sections: clonedSections");
  expect(source).toContain('setSidebarTab("templates")');
  expect(panel).toContain("Save Current Page");
  expect(panel).toContain("Save Selected Section");
  expect(panel).toContain("Save Selected Element");
  expect(panel).toContain("templateType");
  expect(source).not.toContain("builder-routing.json");
  expect(source).not.toContain("templatePreviewIdentityStorage");
});
