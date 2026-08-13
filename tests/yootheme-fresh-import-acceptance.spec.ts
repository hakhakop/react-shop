import { expect, test, type Page } from "@playwright/test";
import {
  formatFreshImportAcceptanceResult,
  runRegisteredYoothemeFreshImportAcceptance,
  type FreshImportCheck,
} from "@/tests/support/yoothemeFreshImportAcceptance";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";

test.describe.configure({ mode: "serial" });

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

function passOrFail(capability: string, condition: boolean, expected: string, actual: string): FreshImportCheck {
  return { capability, outcome: condition ? "PASS" : "FAIL", expected, actual };
}

async function runFreshImport(
  page: Page,
  fixtureId: "enterprise3" | "enterprise6" | "enterprise7",
  probe: Parameters<typeof runRegisteredYoothemeFreshImportAcceptance>[0]["probe"],
) {
  const result = await runRegisteredYoothemeFreshImportAcceptance({
    page,
    context: page.context(),
    fixtureId,
    authenticate: signIn,
    probe,
  });
  return result;
}

test("Phase 12 runner fresh-imports a registered ordinary static-element fixture and restores its scoped Builder document", async ({ page }) => {
  const result = await runFreshImport(page, "enterprise7", async ({ builder, storefront }) => {
    const builderAlerts = await builder.locator(".shop-builder-column-block--alert").count();
    const storefrontAlerts = await storefront.locator(".shop-builder-column-block--alert").count();
    const builderAccordion = await builder.locator("ul[uk-accordion]").count();
    const storefrontAccordion = await storefront.locator("ul[uk-accordion]").count();
    return [
      passOrFail("ordinary-static.alert", builderAlerts > 0 && storefrontAlerts === builderAlerts, ">=1 Alert on both surfaces", `Builder=${builderAlerts}; storefront=${storefrontAlerts}`),
      passOrFail("ordinary-static.accordion", builderAccordion > 0 && storefrontAccordion === builderAccordion, ">=1 Accordion on both surfaces", `Builder=${builderAccordion}; storefront=${storefrontAccordion}`),
    ];
  });
  expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
  expect(result.restoration.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
});

test("Phase 12 runner measures a registered geometry-sensitive Panel Slider only after fresh persisted reload", async ({ page }) => {
  const result = await runFreshImport(page, "enterprise3", async ({ builder, storefront }) => {
    const measure = async (target: Page) => target.locator(".shop-builder-swiper--panel").first().evaluate((element) => {
      const root = element.getBoundingClientRect();
      const track = element.querySelector<HTMLElement>(".uk-slider-items")?.getBoundingClientRect();
      const items = element.querySelectorAll<HTMLElement>(".uk-slider-items > *");
      return { rootWidth: root.width, trackWidth: track?.width ?? 0, itemCount: items.length };
    });
    const builderGeometry = await measure(builder);
    const storefrontGeometry = await measure(storefront);
    return [
      passOrFail("geometry.panel-slider", builderGeometry.itemCount > 0 && builderGeometry.rootWidth > 0 && builderGeometry.trackWidth > 0, "settled Panel Slider geometry", JSON.stringify(builderGeometry)),
      passOrFail(
        "geometry.builder-storefront",
        builderGeometry.itemCount === storefrontGeometry.itemCount &&
          Math.abs((builderGeometry.trackWidth - builderGeometry.rootWidth) - (storefrontGeometry.trackWidth - storefrontGeometry.rootWidth)) <= 1,
        "same item count and track overflow geometry ±1px at each surface viewport",
        `Builder=${JSON.stringify(builderGeometry)}; storefront=${JSON.stringify(storefrontGeometry)}`,
      ),
    ];
  });
  expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
});

test("Phase 12 runner waits for registered UIkit Grid and Lightbox runtime before Gallery probes", async ({ page }) => {
  const result = await runFreshImport(page, "enterprise6", async ({ builder, storefront }) => {
    const probe = async (target: Page) => target.locator(".uk-grid-masonry[data-uk-grid]").first().evaluate((grid) => ({
      masonry: grid.classList.contains("uk-grid-masonry"),
      positionedItems: Array.from(grid.children).filter((child) => (child as HTMLElement).style.transform.includes("translate")).length,
      lightboxTriggers: grid.querySelectorAll("[data-uk-lightbox] a[data-type='image'], a[data-type='image']").length,
    }));
    const builderRuntime = await probe(builder);
    const storefrontRuntime = await probe(storefront);
    return [
      passOrFail("uikit-grid.masonry", builderRuntime.masonry && builderRuntime.positionedItems > 0, "masonry grid with positioned children", JSON.stringify(builderRuntime)),
      passOrFail("uikit-lightbox.triggers", builderRuntime.lightboxTriggers > 0 && storefrontRuntime.lightboxTriggers === builderRuntime.lightboxTriggers, "matching lightbox triggers on Builder/storefront", `Builder=${JSON.stringify(builderRuntime)}; storefront=${JSON.stringify(storefrontRuntime)}`),
    ];
  });
  expect(result.outcome, formatFreshImportAcceptanceResult(result)).toBe("PASS");
});
