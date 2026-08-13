import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { resolveYoothemeLess } from "@/lib/yoothemeLessImporter";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { getUikitAlertClass, getUikitAlertPresentationStyle } from "@/lib/uikitTokens";
import {
  formatFreshImportAcceptanceResult,
  runRegisteredYoothemeFreshImportAcceptance,
  type FreshImportCheck,
} from "@/tests/support/yoothemeFreshImportAcceptance";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "header-parity-site";
const importPath = "tests/fixtures/yootheme-compatibility/sources/devstack-import.less";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

type AlertSurfaceProbe = {
  default: { className: string; style: string; background: string; color: string; radius: string } | null;
};

async function probeAlertSurfaces(page: Page): Promise<AlertSurfaceProbe> {
  return page.locator("body").evaluate(() => {
    const alert = document.querySelector<HTMLElement>(".shop-builder-column-block--alert .uk-alert");
    const read = (element: HTMLElement | null) => element ? (() => {
      const style = getComputedStyle(element);
      return { className: element.className, style: element.getAttribute("style") ?? "", background: style.backgroundColor, color: style.color, radius: style.borderTopLeftRadius };
    })() : null;
    return { default: read(alert) };
  });
}

test("Enterprise8 default Alert uses source-backed Global Style surface tokens in Builder and storefront", async ({ page }) => {
  const less = await readFile(importPath, "utf8");
  const preset = resolveYoothemeLess([{ name: "master-devstack/_import.less", content: less, precedence: 1 }]);
  const shellPatch = preset.shellSettings;

  // Authoritative source: DevStack's _import.less sets @alert-background:#FFF
  // and @alert-border-radius:4px; YOOtheme's Alert template emits `uk-alert`
  // with no modifier for the default source style.
  expect(shellPatch).toMatchObject({ alertBackground: "#FFF", alertColor: "#555371", alertBorderRadius: "4px" });
  expect(getUikitGlobalsCssVars(shellPatch)["--uk-alert-background"]).toBe("#FFF");
  expect(getUikitGlobalsCssVars(shellPatch)["--uk-alert-border-radius"]).toBe("4px");
  expect(getUikitAlertClass("default")).toBe("uk-alert");
  expect(getUikitAlertClass("primary")).toBe("uk-alert uk-alert-primary");
  expect(getUikitAlertPresentationStyle("primary")).toEqual({
    background: "var(--uk-alert-primary-background)",
    color: "var(--uk-alert-primary-color)",
    borderRadius: "var(--uk-alert-border-radius)",
  });

  const mapped = mapYoothemeStaticContent({
    type: "layout",
    children: [{ type: "section", children: [{ type: "row", children: [{ type: "column", children: [{
      type: "alert", props: { title: "Default", content: "<p>Surface</p>" },
    }] }] }] }],
  });
  expect(mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0]).toMatchObject({ kind: "alert" });
  expect((mapped.sections[0]?.layoutItems?.[0]?.blocks?.[0] as { alertStyle?: unknown }).alertStyle).toBeUndefined();

  await signIn(page);
  const response = await page.request.get(`/api/builder-shell?websiteId=${websiteId}`);
  expect(response.ok()).toBeTruthy();
  const originalShell = (await response.json() as { settings: Record<string, unknown> }).settings;

  try {
    const write = await page.request.post(`/api/builder-shell?websiteId=${websiteId}`, {
      data: { ...originalShell, ...shellPatch },
    });
    expect(write.ok()).toBeTruthy();

    const result = await runRegisteredYoothemeFreshImportAcceptance({
      page,
      context: page.context(),
      fixtureId: "enterprise8",
      probe: async ({ builder, storefront }) => {
        const [builderSurface, storefrontSurface] = await Promise.all([
          probeAlertSurfaces(builder),
          probeAlertSurfaces(storefront),
        ]);
        const matchesYoothemeDefault = (surface: AlertSurfaceProbe) => Boolean(
          surface.default
          && surface.default.className.split(/\s+/).includes("uk-alert")
          && !surface.default.className.split(/\s+/).some((name) => /^uk-alert-(primary|success|warning|danger)$/.test(name))
          && surface.default.style.includes("--uk-alert-background")
          && surface.default.background === "rgb(255, 255, 255)"
          && surface.default.color === "rgb(85, 83, 113)"
          && surface.default.radius === "4px",
        );
        const parity = JSON.stringify(builderSurface) === JSON.stringify(storefrontSurface);
        return [
          {
            capability: "alert.default-surface",
            outcome: matchesYoothemeDefault(builderSurface) && matchesYoothemeDefault(storefrontSurface) ? "PASS" : "FAIL",
            expected: "uk-alert default surface #FFF / #555371 / 4px",
            actual: `Builder=${JSON.stringify(builderSurface.default)}; storefront=${JSON.stringify(storefrontSurface.default)}`,
          },
          {
            capability: "alert.builder-storefront-parity",
            outcome: parity ? "PASS" : "FAIL",
            expected: "identical canonical default Alert presentation",
            actual: `Builder=${JSON.stringify(builderSurface)}; storefront=${JSON.stringify(storefrontSurface)}`,
          },
        ] satisfies FreshImportCheck[];
      },
    });
    expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
    expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
  } finally {
    await page.request.post(`/api/builder-shell?websiteId=${websiteId}`, { data: originalShell });
  }
});
