import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("Templates carry strict identity and Builder preview stays transient", async () => {
  const panel = await readFile(path.join(process.cwd(), "components/dashboard/RoutingTemplatesPanel.tsx"), "utf8");
  const builder = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");
  expect(panel).toContain("templateEditorSearchParams");
  expect(panel).toContain("templateId: template.id");
  expect(panel).toContain("creationContext?.pageType === template.pageType");
  expect(panel).toContain("creationContext.previewIdentity");
  expect(builder).toContain('searchParams.get("routingTemplate")');
  expect(builder).toContain('"/api/builder-template-context"');
  expect(builder).toContain("setTemplatePreviewIdentity(candidate.identity)");
  expect(builder).toContain("product.databaseId ?? product.id");
  expect(builder).toContain('return `Used for: ${context.ownership.assignmentSummary ?? "Matching content"}`');
  expect(builder).not.toContain("templatePreviewIdentityStorage");
  expect(builder).not.toContain("localStorage.setItem(templatePreview");
});
