import { expect, test, type Page } from "@playwright/test";
import { invalidateImportedBuilderDraft } from "@/lib/builderDraftInvalidation";

const email = "header-parity-20260722@example.test";
const password = "HeaderParity!2026";
const websiteId = "header-parity-site";
const builderUrl = `/app/websites/${websiteId}/builder?page=home`;
const previewUrl = `/app/websites/${websiteId}/preview?page=home`;
const homeFixture = "/Users/hakobjaghatspanyan/Downloads/Home.json";

async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/app(?:\?|$)/);
}

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

test("fresh YOOtheme import invalidates only its scoped page draft", () => {
  const storage = new MemoryStorage();
  const draftsKey = "react-shop-visual-builder-drafts-v2:header-parity-site";
  const stateKey = "react-shop-visual-builder-v1:header-parity-site";
  const draftMetadataKey = "react-shop-visual-builder-draft-metadata-v1:header-parity-site";
  const imported = { page: "home", sections: [{ id: "yootheme-section-1" }] };

  storage.setItem(draftsKey, JSON.stringify({
    home: { page: "home", sections: [{ id: "stale-panel-section" }] },
    shop: { page: "shop", sections: [{ id: "keep-shop-draft" }] },
    "page:about": { page: "page:about", sections: [{ id: "keep-about-draft" }] },
  }));
  storage.setItem(draftMetadataKey, JSON.stringify({
    home: { basePublishedSignature: "stale-home" },
    shop: { basePublishedSignature: "keep-shop" },
  }));

  invalidateImportedBuilderDraft(storage as unknown as Storage, {
    draftsKey,
    stateKey,
    draftMetadataKey,
    pageKey: "home",
    importedState: imported,
  });

  expect(JSON.parse(storage.getItem(draftsKey) ?? "{}")).toEqual({
    shop: { page: "shop", sections: [{ id: "keep-shop-draft" }] },
    "page:about": { page: "page:about", sections: [{ id: "keep-about-draft" }] },
  });
  expect(JSON.parse(storage.getItem(stateKey) ?? "{}")).toEqual(imported);
  expect(JSON.parse(storage.getItem(draftMetadataKey) ?? "{}")).toEqual({
    shop: { basePublishedSignature: "keep-shop" },
  });
});

test("fresh Home import replaces the matching stale Builder draft", async ({ page, context }) => {
  await signIn(page);
  const originalPayload = await (await page.request.get(`/api/builder-layouts?key=home&websiteId=${websiteId}`)).json();
  const original = originalPayload.layout;
  const draftsKey = `react-shop-visual-builder-drafts-v2:${websiteId}`;

  try {
    await page.goto(builderUrl);
    await page.evaluate((key) => {
      const drafts = JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, unknown>;
      drafts.home = {
        page: "home",
        sections: [{
          id: "stale-section",
          kind: "contentLayout",
          layoutItems: [{ id: "stale-column", blocks: [{ id: "panel-block-stale", kind: "panel", title: "Stale Panel" }] }],
        }],
      };
      drafts.shop = { page: "shop", sections: [{ id: "other-page-draft" }] };
      window.localStorage.setItem(key, JSON.stringify(drafts));
    }, draftsKey);
    await page.reload();

    await page.getByRole("button", { name: "Layouts", exact: true }).click();
    await page.getByRole("tab", { name: /Pages/ }).click();
    await page.getByText("Import YOOtheme Page JSON", { exact: true }).locator("..").locator('input[type="file"]').setInputFiles(homeFixture);
    await page.getByRole("button", { name: "Apply import", exact: true }).click();
    await page.getByRole("button", { name: "Publish", exact: true }).click();
    await expect(page.getByText("Published successfully", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText("Integrate", { exact: true })).toBeVisible();

    const builderIds = await page.locator("[data-builder-block-key]").evaluateAll((els) =>
      els
        .map((el) => el.getAttribute("data-builder-block-key"))
        .filter((key) => /^yootheme-panel-\d+-/.test(key ?? "")),
    );
    expect(builderIds).toEqual([
      "yootheme-panel-2-1-0-1",
      "yootheme-panel-2-1-1-1",
      "yootheme-panel-2-1-2-1",
    ]);
    await expect(page.locator('[data-builder-block-key="panel-block-stale"]')).toHaveCount(0);
    console.log("remaining draft keys", await page.evaluate(
      (key) => Object.keys(JSON.parse(window.localStorage.getItem(key) ?? "{}")),
      draftsKey,
    ));
    await expect(page.getByText("Unsaved changes", { exact: true })).toHaveCount(0);
    const remainingDraftKeys = await page.evaluate(
      (key) => Object.keys(JSON.parse(window.localStorage.getItem(key) ?? "{}")),
      draftsKey,
    );
    expect(remainingDraftKeys.sort()).toEqual(["shop"]);

    const storefront = await context.newPage();
    await storefront.goto(previewUrl);
    const storefrontIds = await storefront.locator('.shop-builder-column-block--panel').evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-builder-block-id")),
    );
    expect(storefrontIds).toEqual(builderIds);
    await storefront.close();
  } finally {
    expect((await page.request.post(`/api/builder-layouts?websiteId=${websiteId}`, {
      data: { key: "home", design: original.design, sections: original.sections },
    })).ok()).toBeTruthy();
  }
});
