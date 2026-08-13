import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";
import {
  findYoothemeFixture,
  type YoothemeFixtureRecord,
} from "@/lib/yoothemeCompatibilityRegistry";

export type FreshImportOutcome = "PASS" | "FAIL" | "BLOCKED";

export type FreshImportCheck = {
  capability: string;
  outcome: FreshImportOutcome;
  expected: string;
  actual: string;
  detail?: string;
};

export type FreshImportAcceptanceResult = {
  fixtureId: string;
  outcome: FreshImportOutcome;
  checks: FreshImportCheck[];
  restoration: FreshImportCheck;
  builderBlockIds: string[];
  storefrontBlockIds: string[];
};

export type FreshImportProbeContext = {
  fixture: YoothemeFixtureRecord;
  source: unknown;
  persisted: PersistedLayout;
  builder: Page;
  storefront: Page;
  expectedBlockIds: readonly string[];
};

export type RunFreshImportAcceptanceOptions = {
  page: Page;
  context: BrowserContext;
  fixtureId: string;
  authenticate?: (page: Page) => Promise<void>;
  probe?: (context: FreshImportProbeContext) => Promise<readonly FreshImportCheck[]>;
  repositoryRoot?: string;
  timeoutMs?: number;
};

type PersistedLayout = { page?: string; design?: unknown; sections?: unknown[] };
type LocalSnapshot = Record<string, string | null>;

class ReadinessBlockedError extends Error {}

const builderStorageKeys = (websiteId: string) => ({
  state: `react-shop-visual-builder-v1:${websiteId}`,
  drafts: `react-shop-visual-builder-drafts-v2:${websiteId}`,
});

const hash = (content: Buffer) => createHash("sha256").update(content).digest("hex");
const builderUrl = (fixture: YoothemeFixtureRecord) => {
  const scope = fixture.acceptanceScope!;
  return `/app/websites/${scope.websiteId}/builder?page=${encodeURIComponent(scope.pageKey)}`;
};
const storefrontUrl = (fixture: YoothemeFixtureRecord) => {
  const scope = fixture.acceptanceScope!;
  return `/app/websites/${scope.websiteId}/preview?page=${encodeURIComponent(scope.pageKey)}&compatibilityProbe=${Date.now()}`;
};

function layoutBlockIds(layout: PersistedLayout | undefined) {
  const ids = new Set<string>();
  const visitBlock = (block: unknown) => {
    if (!block || typeof block !== "object") return;
    const value = block as Record<string, unknown>;
    // Rows and columns have structural IDs but are not rendered as selectable
    // Builder blocks. The parity contract is intentionally page-block-only.
    if (typeof value.id === "string" && typeof value.kind === "string") ids.add(value.id);
    if (Array.isArray(value.blocks)) value.blocks.forEach(visitBlock);
    const nested = value.nestedLayout as { rows?: unknown[] } | undefined;
    if (Array.isArray(nested?.rows)) nested.rows.forEach(visitBlock);
    if (Array.isArray(value.columns)) value.columns.forEach(visitBlock);
    if (Array.isArray(value.rows)) value.rows.forEach(visitBlock);
  };
  for (const section of layout?.sections ?? []) {
    const value = section as Record<string, unknown>;
    if (Array.isArray(value.layoutItems)) value.layoutItems.forEach(visitBlock);
    if (Array.isArray(value.blocks)) value.blocks.forEach(visitBlock);
  }
  return [...ids].sort();
}

async function readPersistedLayout(page: Page, fixture: YoothemeFixtureRecord) {
  const scope = fixture.acceptanceScope!;
  const response = await page.request.get(`/api/builder-layouts?key=${encodeURIComponent(scope.pageKey)}&websiteId=${encodeURIComponent(scope.websiteId)}`);
  if (!response.ok()) throw new Error(`persisted document read failed (${response.status()})`);
  const payload = await response.json() as { layout?: PersistedLayout };
  if (!payload.layout) throw new Error("registered acceptance scope has no persisted document to snapshot");
  return payload.layout;
}

async function savePersistedLayout(page: Page, fixture: YoothemeFixtureRecord, layout: PersistedLayout) {
  const scope = fixture.acceptanceScope!;
  const response = await page.request.post(`/api/builder-layouts?websiteId=${encodeURIComponent(scope.websiteId)}`, {
    data: { key: scope.pageKey, design: layout.design, sections: layout.sections },
  });
  if (!response.ok()) throw new Error(`persisted document restoration failed (${response.status()})`);
}

async function snapshotScopedBuilderStorage(page: Page, fixture: YoothemeFixtureRecord): Promise<LocalSnapshot> {
  const keys = builderStorageKeys(fixture.acceptanceScope!.websiteId);
  return page.evaluate((storageKeys) => Object.fromEntries(storageKeys.map((key) => [key, window.localStorage.getItem(key)])), Object.values(keys));
}

async function clearScopedBuilderDraft(page: Page, fixture: YoothemeFixtureRecord) {
  const scope = fixture.acceptanceScope!;
  const keys = builderStorageKeys(scope.websiteId);
  await page.evaluate(({ draftsKey, stateKey, pageKey }) => {
    try {
    const drafts = JSON.parse(window.localStorage.getItem(draftsKey) ?? "{}") as Record<string, unknown>;
    delete drafts[pageKey];
    // DashboardBuilder bootstraps through `shop` before applying a route key.
    // Treat that implementation fallback as active test scope, otherwise an
    // unrelated stale bootstrap draft can win the initial hydrate.
    delete drafts.shop;
      window.localStorage.setItem(draftsKey, JSON.stringify(drafts));
    } catch {
      window.localStorage.removeItem(draftsKey);
    }
    try {
      const current = JSON.parse(window.localStorage.getItem(stateKey) ?? "null") as { page?: unknown } | null;
      if (current?.page === pageKey) window.localStorage.removeItem(stateKey);
    } catch {
      window.localStorage.removeItem(stateKey);
    }
  }, { draftsKey: keys.drafts, stateKey: keys.state, pageKey: scope.pageKey });
}

async function prepareScopedBuilderStorageRestoration(
  page: Page,
  fixture: YoothemeFixtureRecord,
  snapshot: LocalSnapshot,
  persisted: PersistedLayout,
) {
  const scope = fixture.acceptanceScope!;
  const keys = builderStorageKeys(scope.websiteId);
  const payload = {
    values: snapshot,
    draftsKey: keys.drafts,
    stateKey: keys.state,
    pageKey: scope.pageKey,
    persisted: { ...persisted, page: scope.pageKey },
  };
  // Run before the next document's React tree hydrates. Mutating localStorage
  // in the currently imported page races its draft-persistence effect.
  await page.addInitScript((restore) => {
    // Preserve the user's unrelated drafts, but never reintroduce a scoped
    // draft captured before this run. It may be stale relative to the
    // restored persisted document—the exact divergence this runner guards.
    try {
      const drafts = JSON.parse(restore.values[restore.draftsKey] ?? "{}") as Record<string, unknown>;
      delete drafts[restore.pageKey];
      delete drafts.shop;
      window.localStorage.setItem(restore.draftsKey, JSON.stringify(drafts));
    } catch {
      window.localStorage.removeItem(restore.draftsKey);
    }
    try {
      // Force DashboardBuilder's published-document loader to read the API
      // snapshot rather than a browser fallback from the test import.
      window.localStorage.removeItem(restore.stateKey);
    } catch {
      window.localStorage.removeItem(restore.stateKey);
    }
  }, payload);
}

async function importThroughBuilder(page: Page, fixture: YoothemeFixtureRecord, source: Buffer) {
  await page.goto(builderUrl(fixture));
  await page.locator(".builder-preview-shell").first().waitFor({ state: "visible" });
  await clearScopedBuilderDraft(page, fixture);
  await page.reload();
  await page.locator(".builder-preview-shell").first().waitFor({ state: "visible" });
  await page.getByRole("button", { name: "Layouts", exact: true }).click();
  await page.getByRole("tab", { name: /Pages/ }).click();
  await page.getByText("Import YOOtheme Page JSON", { exact: true }).locator("..").locator('input[type="file"]').setInputFiles({
    name: path.basename(fixture.sourcePath),
    mimeType: "application/json",
    buffer: source,
  });
  await page.getByRole("button", { name: "Apply import", exact: true }).click();
  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await page.getByText("Published successfully", { exact: true }).waitFor({ state: "visible" });
  await page.reload();
  await page.locator(".builder-preview-shell").first().waitFor({ state: "visible" });
}

async function blockIdsFromDom(page: Page, attribute: "data-builder-block-key" | "data-builder-block-id") {
  const ids = await page.locator(`[${attribute}]`).evaluateAll((nodes, name) => nodes
    .map((node) => node.getAttribute(name))
    .filter((id): id is string => Boolean(id))
    .sort(), attribute);
  return [...new Set(ids)];
}

async function waitForFonts(page: Page, timeoutMs: number) {
  try {
    await page.waitForFunction(async () => {
      if (!document.fonts) return true;
      await document.fonts.ready;
      return document.fonts.status === "loaded";
    }, undefined, { timeout: timeoutMs });
  } catch {
    throw new ReadinessBlockedError("document.fonts did not settle before measurement");
  }
}

async function waitForMedia(page: Page, timeoutMs: number) {
  try {
    await page.waitForFunction(async () => {
      const images = Array.from(document.querySelectorAll(".builder-preview-shell img, [data-builder-page-root] img")) as HTMLImageElement[];
      if (images.some((image) => !image.complete || image.naturalWidth <= 0)) return false;
      await Promise.all(images.map((image) => image.decode?.().catch(() => undefined)));
      const svgHosts = Array.from(document.querySelectorAll<HTMLElement>(".shop-builder-stylable-svg-host[data-svg-state]"));
      return svgHosts.every((host) => host.dataset.svgState === "ready");
    }, undefined, { timeout: timeoutMs });
  } catch {
    throw new ReadinessBlockedError("image/SVG media did not load and decode before measurement");
  }
}

async function waitForUikitRuntime(page: Page, fixture: YoothemeFixtureRecord, timeoutMs: number) {
  for (const runtime of fixture.runtimeRequirements) {
    const predicate = runtime === "accordion"
      ? () => Array.from(document.querySelectorAll<HTMLElement>("ul[uk-accordion]")).every((root) => root.querySelector(".uk-accordion-title")?.getAttribute("aria-expanded") !== null)
      : runtime === "grid"
        ? () => Array.from(document.querySelectorAll<HTMLElement>(".uk-grid-masonry[data-uk-grid]")).every((root) => root.children.length === 0 || Array.from(root.children).some((child) => child.getAttribute("style")?.includes("transform")))
        : () => Array.from(document.querySelectorAll<HTMLElement>("[data-uk-lightbox]")).every((root) => root.querySelector("a[data-type='image']") !== null);
    try {
      await page.waitForFunction(predicate, undefined, { timeout: timeoutMs });
    } catch {
      throw new ReadinessBlockedError(`UIkit ${runtime} runtime did not reach its observable settled condition`);
    }
  }
}

async function waitForStableLayout(page: Page, timeoutMs: number) {
  try {
    await page.waitForFunction(async () => {
      const root = document.querySelector<HTMLElement>(".builder-preview-shell, [data-builder-page-root]");
      if (!root) return false;
      const sample = () => {
        const rect = root.getBoundingClientRect();
        return [rect.x, rect.y, rect.width, rect.height];
      };
      const before = sample();
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      const after = sample();
      return before.every((value, index) => Math.abs(value - after[index]) <= 0.5);
    }, undefined, { timeout: timeoutMs });
  } catch {
    throw new ReadinessBlockedError("layout bounding boxes did not stabilize before measurement");
  }
}

export async function waitForYoothemeAcceptanceReadiness(page: Page, fixture: YoothemeFixtureRecord, timeoutMs = 12_000) {
  await waitForFonts(page, timeoutMs);
  await waitForMedia(page, timeoutMs);
  await waitForUikitRuntime(page, fixture, timeoutMs);
  await waitForStableLayout(page, timeoutMs);
}

function sameIds(expected: readonly string[], actual: readonly string[]) {
  return expected.length === actual.length && expected.every((value, index) => value === actual[index]);
}

function pageBlockIds(expected: readonly string[], actual: readonly string[]) {
  const expectedIds = new Set(expected);
  return actual.filter((id) => expectedIds.has(id));
}

async function waitForBuilderPersistedParity(page: Page, expected: readonly string[], timeoutMs: number, absentIds: readonly string[] = []) {
  await page.waitForFunction(({ expectedIds, absentIds }) => {
    const expected = [...expectedIds].sort();
    const expectedSet = new Set(expected);
    const absent = new Set(absentIds);
    const all = Array.from(document.querySelectorAll<HTMLElement>("[data-builder-block-key]"))
      .map((node) => node.dataset.builderBlockKey)
      .filter((id): id is string => Boolean(id));
    if (all.some((id) => absent.has(id))) return false;
    const actual = all.filter((id) => expectedSet.has(id))
      .sort();
    return actual.length === expected.length && actual.every((id, index) => id === expected[index]);
  }, { expectedIds: [...expected], absentIds: [...absentIds] }, { timeout: timeoutMs });
}

export function formatFreshImportAcceptanceResult(result: FreshImportAcceptanceResult) {
  const lines = [`${result.outcome}: ${result.fixtureId}`];
  for (const check of [...result.checks, result.restoration]) {
    lines.push(`${check.outcome}: ${check.capability} — expected ${check.expected}; actual ${check.actual}${check.detail ? ` · ${check.detail}` : ""}`);
  }
  return lines.join("\n");
}

/**
 * The one Phase 12 browser acceptance boundary. It serially owns the scoped
 * document, browser draft, real import UI, reload, readiness and restoration.
 */
export async function runRegisteredYoothemeFreshImportAcceptance(
  options: RunFreshImportAcceptanceOptions,
): Promise<FreshImportAcceptanceResult> {
  const fixture = findYoothemeFixture(options.fixtureId);
  if (!fixture) throw new Error(`Unknown registered fixture '${options.fixtureId}'`);
  if (!fixture.acceptanceScope) throw new Error(`Fixture '${fixture.id}' has no registered Builder/storefront acceptance scope`);
  const timeoutMs = options.timeoutMs ?? 12_000;
  const repositoryRoot = options.repositoryRoot ?? process.cwd();
  const source = await readFile(path.resolve(repositoryRoot, fixture.sourcePath));
  const checks: FreshImportCheck[] = [];
  let builderBlockIds: string[] = [];
  let storefrontBlockIds: string[] = [];
  let original: PersistedLayout | undefined;
  let localSnapshot: LocalSnapshot | undefined;
  let importedIds: string[] = [];
  let outcome: FreshImportOutcome = "PASS";
  let restoration: FreshImportCheck = { capability: "restoration", outcome: "FAIL", expected: "original document restored", actual: "not attempted" };

  try {
    if (hash(source) !== fixture.sourceSha256) {
      throw new ReadinessBlockedError(`fixture SHA-256 mismatch: expected ${fixture.sourceSha256}, got ${hash(source)}`);
    }
    checks.push({ capability: "fixture.hash", outcome: "PASS", expected: fixture.sourceSha256, actual: fixture.sourceSha256 });
    await options.authenticate?.(options.page);
    await options.page.goto(builderUrl(fixture));
    await options.page.locator(".builder-preview-shell").first().waitFor({ state: "visible" });
    original = await readPersistedLayout(options.page, fixture);
    localSnapshot = await snapshotScopedBuilderStorage(options.page, fixture);
    await importThroughBuilder(options.page, fixture, source);

    const persisted = await readPersistedLayout(options.page, fixture);
    importedIds = layoutBlockIds(persisted);
    await waitForBuilderPersistedParity(options.page, importedIds, timeoutMs);
    builderBlockIds = await blockIdsFromDom(options.page, "data-builder-block-key");
    await waitForYoothemeAcceptanceReadiness(options.page, fixture, timeoutMs);
    const builderPageBlockIds = pageBlockIds(importedIds, builderBlockIds);
    const builderParity = sameIds(importedIds, builderPageBlockIds);
    checks.push({ capability: "builder.persisted-reload-parity", outcome: builderParity ? "PASS" : "FAIL", expected: importedIds.join(","), actual: builderPageBlockIds.join(",") });
    if (!builderParity) outcome = "FAIL";

    const storefront = await options.context.newPage();
    try {
      await storefront.goto(storefrontUrl(fixture));
      await storefront.locator("[data-builder-page-root]").first().waitFor({ state: "visible" });
      await waitForYoothemeAcceptanceReadiness(storefront, fixture, timeoutMs);
      storefrontBlockIds = await blockIdsFromDom(storefront, "data-builder-block-id");
      const storefrontPageBlockIds = pageBlockIds(importedIds, storefrontBlockIds);
      const storefrontParity = sameIds(importedIds, storefrontPageBlockIds);
      checks.push({ capability: "storefront.persisted-parity", outcome: storefrontParity ? "PASS" : "FAIL", expected: importedIds.join(","), actual: storefrontPageBlockIds.join(",") });
      if (!storefrontParity) outcome = "FAIL";
      if (options.probe) {
        const probeChecks = await options.probe({ fixture, source: JSON.parse(source.toString()), persisted, builder: options.page, storefront, expectedBlockIds: importedIds });
        checks.push(...probeChecks);
        if (probeChecks.some((check) => check.outcome === "FAIL")) outcome = "FAIL";
        if (probeChecks.some((check) => check.outcome === "BLOCKED") && outcome === "PASS") outcome = "BLOCKED";
      }
    } finally {
      await storefront.close();
    }
  } catch (error) {
    outcome = error instanceof ReadinessBlockedError ? "BLOCKED" : "FAIL";
    checks.push({ capability: "fresh-import", outcome, expected: "registered fixture import, readiness, and parity", actual: error instanceof Error ? error.message : String(error) });
  } finally {
    try {
      if (!original || !localSnapshot) throw new Error("original document/storage snapshot was not captured");
      await savePersistedLayout(options.page, fixture, original);
      // Unmount the imported Builder before replacing its browser draft. This
      // prevents its persistence effect from racing the restored document.
      await options.page.goto("about:blank");
      // Verify restoration in a clean browser context. This is deliberately
      // separate from the importing page, whose React effects may still hold
      // the old document in memory. The original context's scoped storage was
      // snapshotted; the verifier proves the persisted document itself has no
      // dependency on the test-only draft.
      const browser = options.context.browser();
      if (!browser) throw new Error("browser context is unavailable for clean restoration verification");
      const verificationContext = await browser.newContext({
        storageState: await options.context.storageState(),
      });
      const verificationPage = await verificationContext.newPage();
      const storageKeys = builderStorageKeys(fixture.acceptanceScope!.websiteId);
      await verificationPage.addInitScript(({ drafts, state }) => {
        window.localStorage.removeItem(drafts);
        window.localStorage.removeItem(state);
      }, storageKeys);
      await verificationPage.goto(builderUrl(fixture));
      await verificationPage.locator(".builder-preview-shell").first().waitFor({ state: "visible" });
      const restored = await readPersistedLayout(verificationPage, fixture);
      const restoredIds = layoutBlockIds(restored);
      await waitForBuilderPersistedParity(verificationPage, restoredIds, timeoutMs, importedIds.filter((id) => !restoredIds.includes(id)));
      const restoredDocument = JSON.stringify({ design: restored.design, sections: restored.sections }) === JSON.stringify({ design: original.design, sections: original.sections });
      const testOnlyIds = importedIds.filter((id) => !restoredIds.includes(id));
      const restoredBuilderIds = await blockIdsFromDom(verificationPage, "data-builder-block-key");
      const remainingTestIds = restoredBuilderIds.filter((id) => testOnlyIds.includes(id));
      const restoredBuilderParity = sameIds(restoredIds, pageBlockIds(restoredIds, restoredBuilderIds));
      await verificationContext.close();
      const restoredCleanly = restoredDocument && remainingTestIds.length === 0 && restoredBuilderParity;
      restoration = {
        capability: "restoration",
        outcome: restoredCleanly ? "PASS" : "FAIL",
        expected: "original persisted document and no test-only Builder blocks",
        actual: restoredCleanly ? "restored" : `persisted=${restoredDocument}; Builder parity=${restoredBuilderParity}; remaining test IDs=${remainingTestIds.join(",") || "none"}`,
      };
      if (!restoredCleanly) outcome = "FAIL";
    } catch (error) {
      restoration = { capability: "restoration", outcome: "BLOCKED", expected: "original document restored", actual: error instanceof Error ? error.message : String(error) };
      if (outcome === "PASS") outcome = "BLOCKED";
    }
  }
  return { fixtureId: fixture.id, outcome, checks, restoration, builderBlockIds, storefrontBlockIds };
}
