import type { BuilderLayoutKey } from "@/lib/builderLayouts";

export function resolveInitialBuilderHydrationPage(
  activePage: BuilderLayoutKey,
  contextPage: BuilderLayoutKey,
): BuilderLayoutKey {
  // Header and Footer are first-class Builder documents. Hydrate the active
  // shell itself on a direct Builder URL so refresh uses the same persisted
  // document as an in-app shell transition.
  if (activePage === "header" || activePage === "footer") return activePage;
  if (contextPage === "header" || contextPage === "footer") return "home";
  return activePage;
}
