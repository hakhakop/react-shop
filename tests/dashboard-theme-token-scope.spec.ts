import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("Dashboard tenant tokens stay scoped and never mutate the document root", () => {
  const dashboard = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardBuilder.tsx"),
    "utf8",
  );
  const sidebar = readFileSync(
    resolve(process.cwd(), "components/dashboard/DashboardSidebar.tsx"),
    "utf8",
  );

  expect(dashboard).not.toContain("dashboardGlobalCssSnapshotRef");
  expect(dashboard).not.toMatch(/document\.documentElement[\s\S]{0,500}getUikitGlobalsCssVars/);
  expect(dashboard).not.toMatch(/getUikitGlobalsCssVars[\s\S]{0,500}\.style\.setProperty/);
  expect(dashboard).toContain(":where([data-builder-tenant-theme-root])");
  expect(dashboard).toContain("data-builder-dashboard-tenant-tokens");
  expect(dashboard.match(/data-builder-tenant-theme-root=/g)?.length).toBeGreaterThanOrEqual(2);
  expect(sidebar.match(/data-builder-tenant-theme-root=/g)?.length).toBeGreaterThanOrEqual(2);
});
