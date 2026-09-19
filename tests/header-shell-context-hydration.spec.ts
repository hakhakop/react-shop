import { expect, test } from "@playwright/test";

import { resolveInitialBuilderHydrationPage } from "@/lib/builderShellRoute";

test("Header and Footer routes hydrate their own persisted document", () => {
  expect(resolveInitialBuilderHydrationPage("header", "page:product-2")).toBe("header");
  expect(resolveInitialBuilderHydrationPage("footer", "page:about")).toBe("footer");
  expect(resolveInitialBuilderHydrationPage("header", "header")).toBe("header");
});

test("ordinary page routes hydrate their active document", () => {
  expect(resolveInitialBuilderHydrationPage("home", "page:product-2")).toBe("home");
  expect(resolveInitialBuilderHydrationPage("page:product-2", "home")).toBe("page:product-2");
});
