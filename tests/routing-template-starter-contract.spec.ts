import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import path from "node:path";

test("creation surface exposes family-derived Starter or Blank choices", async () => {
  const panel = await readFile(path.join(process.cwd(), "components/dashboard/RoutingTemplatesPanel.tsx"), "utf8");
  const service = await readFile(path.join(process.cwd(), "lib/routingTemplatesService.server.ts"), "utf8");
  const starters = await readFile(path.join(process.cwd(), "lib/routingTemplateStarters.ts"), "utf8");
  expect(panel).toContain('aria-label="Starting Layout"');
  expect(panel).toContain('option value="minimal">Starter');
  expect(panel).toContain('option value="blank">Blank');
  expect(panel).toContain("starter,");
  expect(service).toContain("createRoutingTemplateStarterSections");
  expect(starters).toContain("createMinimalPostStarterSections");
  expect(starters).toContain("createMinimalProductStarterSections");
  expect(starters).not.toContain('kind: "productTitle"');
  expect(starters).not.toContain('kind: "productPrice"');
  expect(starters).not.toContain('kind: "productDescription"');
});
