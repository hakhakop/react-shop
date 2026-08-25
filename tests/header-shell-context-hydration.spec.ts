import { expect, test } from "@playwright/test";

import { resolveInitialBuilderHydrationPage } from "@/lib/builderShellRoute";

test("Header and Footer routes hydrate their return-page context", () => {
  expect(resolveInitialBuilderHydrationPage("header", "page:product-2")).toBe("page:product-2");
  expect(resolveInitialBuilderHydrationPage("footer", "about")).toBe("about");
  expect(resolveInitialBuilderHydrationPage("header", "header")).toBe("home");
});

test("ordinary page routes hydrate their active document", () => {
  expect(resolveInitialBuilderHydrationPage("home", "page:product-2")).toBe("home");
  expect(resolveInitialBuilderHydrationPage("page:product-2", "home")).toBe("page:product-2");
});
