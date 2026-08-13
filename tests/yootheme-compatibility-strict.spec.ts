import { readFile } from "node:fs/promises";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import {
  YOOTHEME_FIXTURE_REGISTRY,
  type YoothemeCapabilityStatus,
} from "@/lib/yoothemeCompatibilityRegistry";
import { validateRegisteredFixtureFiles } from "@/lib/yoothemeCompatibilityRegistry.node";
import { createYoothemePageImportReport } from "@/lib/yoothemeImportReport";
import {
  formatFreshImportAcceptanceResult,
  runRegisteredYoothemeFreshImportAcceptance,
} from "@/tests/support/yoothemeFreshImportAcceptance";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const pageFixtureIds = ["enterprise3", "enterprise4", "enterprise5", "enterprise6", "enterprise7", "enterprise8"] as const;
const statuses: readonly YoothemeCapabilityStatus[] = [
  "SUPPORTED",
  "DEFERRED",
  "INTENTIONALLY_UNSUPPORTED",
  "UNHANDLED",
  "BLOCKED",
];

test.describe.configure({ mode: "serial" });

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

function reportCounts(report: ReturnType<typeof createYoothemePageImportReport>) {
  return Object.fromEntries(statuses.map((status) => [status, report.byStatus[status].length])) as Record<YoothemeCapabilityStatus, number>;
}

test("strict gate validates all registered fixture bytes and registry-backed status baselines", async () => {
  expect(await validateRegisteredFixtureFiles()).toEqual([]);

  for (const fixtureId of pageFixtureIds) {
    const fixture = YOOTHEME_FIXTURE_REGISTRY.find((entry) => entry.id === fixtureId)!;
    const source = JSON.parse(await readFile(path.resolve(process.cwd(), fixture.sourcePath), "utf8"));
    const report = createYoothemePageImportReport(source);
    const counts = reportCounts(report);
    expect(counts).toEqual(fixture.strictBaseline!.expectedPageReportStatusCounts);
    expect(report.byStatus.UNHANDLED, `${fixtureId}: unhandled source fields`).toEqual([]);
    expect(report.byStatus.BLOCKED, `${fixtureId}: blocked source fields`).toEqual([]);
    console.log(
      `[yootheme strict] ${fixtureId} supported=${counts.SUPPORTED} deferred=${counts.DEFERRED} intentionallyUnsupported=${counts.INTENTIONALLY_UNSUPPORTED} unhandled=${counts.UNHANDLED} blocked=${counts.BLOCKED} contracts=${fixture.contracts.length}`,
    );
  }
});

for (const fixtureId of pageFixtureIds) {
  test(`strict gate fresh-imports ${fixtureId}, verifies parity/readiness, and restores safely`, async ({ page }) => {
    const result = await runRegisteredYoothemeFreshImportAcceptance({
      page,
      context: page.context(),
      fixtureId,
      authenticate: signIn,
    });
    expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
    expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
    expect(result.checks.find((check) => check.capability === "builder.persisted-reload-parity")?.outcome).toBe("PASS");
    expect(result.checks.find((check) => check.capability === "storefront.persisted-parity")?.outcome).toBe("PASS");
  });
}
