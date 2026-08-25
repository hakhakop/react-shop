import type { BuilderLayoutKey } from "@/lib/builderLayouts";

export function resolveInitialBuilderHydrationPage(
  activePage: BuilderLayoutKey,
  contextPage: BuilderLayoutKey,
): BuilderLayoutKey {
  if (activePage !== "header" && activePage !== "footer") return activePage;
  if (contextPage === "header" || contextPage === "footer") return "home";
  return contextPage;
}
