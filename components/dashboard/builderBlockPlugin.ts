import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import type { LayoutBlockIconName } from "@/components/dashboard/builderRegistry";

/**
 * Register a new builder block in one place. After adding an entry here:
 * 1. Extend `LayoutBlockKind` in `builderTypes.ts`
 * 2. Add render logic in `StorefrontBuilderRenderer` and dashboard preview
 * 3. Add inspector fields in `DashboardInspector` (or a block-specific panel)
 */
export type BuilderBlockPlugin = {
  kind: LayoutBlockKind;
  label: string;
  description: string;
  icon: LayoutBlockIconName;
  groupId: string;
  /** Optional: limit to specific builder pages/templates */
  pages?: string[];
  templates?: string[];
};

const pluginRegistry: BuilderBlockPlugin[] = [];

export function registerBuilderBlock(plugin: BuilderBlockPlugin) {
  const existing = pluginRegistry.findIndex((entry) => entry.kind === plugin.kind);
  if (existing >= 0) {
    pluginRegistry[existing] = plugin;
    return;
  }
  pluginRegistry.push(plugin);
}

export function getRegisteredBuilderBlocks() {
  return [...pluginRegistry];
}

/**
 * Example — uncomment and implement render/inspector to enable:
 *
 * registerBuilderBlock({
 *   kind: "callToAction",
 *   label: "Call To Action",
 *   description: "Headline, text, and primary button.",
 *   icon: "sparkles",
 *   groupId: "content",
 * });
 */
