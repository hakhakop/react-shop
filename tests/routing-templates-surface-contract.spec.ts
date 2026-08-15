import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("Templates surface is a thin scoped consumer of the routing API", async () => {
  const panel = await readFile(path.join(process.cwd(), "components/dashboard/RoutingTemplatesPanel.tsx"), "utf8");
  const sidebar = await readFile(path.join(process.cwd(), "components/dashboard/DashboardSidebar.tsx"), "utf8");
  expect(sidebar).toContain('tab: "routingTemplates"');
  expect(sidebar).toContain("<RoutingTemplatesPanel websiteId={websiteId} />");
  expect(panel).toContain("/api/routing-templates");
  expect(panel).toContain('action: "create"');
  expect(panel).toContain('action: "reorder"');
  expect(panel).toContain('action: "duplicate"');
  expect(panel).toContain('action: "set-enabled"');
  expect(panel).toContain("?${params.toString()}");
  expect(panel).toContain("Single Product");
  expect(panel).toContain("Single Post");
  expect(panel).not.toContain("builder-templates");
  expect(panel).not.toContain("archive");
  expect(panel).not.toContain("search-results");
});
