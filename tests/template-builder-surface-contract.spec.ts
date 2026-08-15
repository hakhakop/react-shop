import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("Templates carry strict identity and Builder preview stays transient", async () => {
  const panel = await readFile(path.join(process.cwd(), "components/dashboard/RoutingTemplatesPanel.tsx"), "utf8");
  const builder = await readFile(path.join(process.cwd(), "components/dashboard/DashboardBuilder.tsx"), "utf8");
  expect(panel).toContain("routingTemplate: template.id");
  expect(builder).toContain('searchParams.get("routingTemplate")');
  expect(builder).toContain('"/api/builder-template-context"');
  expect(builder).toContain("setTemplatePreviewIdentity(candidate.identity)");
  expect(builder).toContain("product.databaseId ?? product.id");
  expect(builder).toContain("Used for: ${templateBuilderContext.assignmentSummary}");
  expect(builder).not.toContain("templatePreviewIdentityStorage");
  expect(builder).not.toContain("localStorage.setItem(templatePreview");
});
