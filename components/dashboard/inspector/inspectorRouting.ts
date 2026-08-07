import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import type {
  BuilderLayoutBlock,
  BuilderShellSettings,
  InspectorTab,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import type { ComponentType } from "react";
import AccordionCapabilityPanel from "@/components/dashboard/inspector/panels/AccordionCapabilityPanel";
import ButtonCapabilityPanel from "@/components/dashboard/inspector/panels/ButtonCapabilityPanel";
import CoreContentCapabilityPanel from "@/components/dashboard/inspector/panels/CoreContentCapabilityPanel";
import HeadingCapabilityPanel from "@/components/dashboard/inspector/panels/HeadingCapabilityPanel";
import GridCapabilityPanel from "@/components/dashboard/inspector/panels/GridCapabilityPanel";
import { HeroCapabilityPanel } from "@/components/dashboard/inspector/panels/HeroGridCapabilityPanel";
import ImageCapabilityPanel from "@/components/dashboard/inspector/panels/ImageCapabilityPanel";
import ListCapabilityPanel from "@/components/dashboard/inspector/panels/ListCapabilityPanel";
import PanelCapabilityPanel from "@/components/dashboard/inspector/panels/PanelCapabilityPanel";
import TextCapabilityPanel from "@/components/dashboard/inspector/panels/TextCapabilityPanel";

/** Normal page kinds with a dedicated capability-driven inspector path. */
export const CANONICAL_INSPECTOR_KINDS = [
  "button", "panel", "heading", "text", "list", "accordion", "image",
  "hero", "grid", "icon", "badgeGrid", "table", "divider", "alert", "breadcrumbs", "datePicker",
] as const satisfies readonly LayoutBlockKind[];

/**
 * Explicitly documented legacy paths. These remain visible while their larger
 * data-heavy editors are migrated; they are never silently treated as modern.
 */
export const LEGACY_INSPECTOR_ALLOWLIST = [
  "promoStrip", "slider", "scrollPinnedDemo",
  "embed", "fluentForm", "menu",
  "products", "categoryFilters",
  "cartContent", "checkoutContent", "accountContent",
] as const satisfies readonly LayoutBlockKind[];

export function classifyInspectorKind(kind: LayoutBlockKind) {
  return (CANONICAL_INSPECTOR_KINDS as readonly string[]).includes(kind)
    ? "canonical"
    : (LEGACY_INSPECTOR_ALLOWLIST as readonly string[]).includes(kind)
      ? "legacy-allowlisted"
      : "unclassified";
}

export type InspectorPanelContext = {
  block: BuilderLayoutBlock;
  tab: InspectorTab;
  shellSettings: BuilderShellSettings;
  update: (patch: Partial<BuilderLayoutBlock>) => void;
  openWordPressMediaPicker: (options: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => void;
};

export type InspectorPanelComponent = ComponentType<InspectorPanelContext>;

export type InspectorCapabilityId =
  | "general"
  | "animation"
  | "content"
  | "component-presentation"
  | "layout"
  | "media"
  | "link"
  | "repeatable-items";

export type InspectorElementCapabilityDeclaration = {
  capabilities: readonly InspectorTab[];
  composes: readonly InspectorCapabilityId[];
  panel: InspectorPanelComponent;
  settingsSources?: readonly Extract<InspectorTab, "layout" | "style" | "behavior">[];
  settingsLabel?: "Settings" | "Styling";
  available?: (sectionId?: string) => boolean;
};

const normalImageAvailability = (sectionId?: string) => sectionId !== "header-document";

/**
 * The single element-to-capability composition registry used by DashboardInspector.
 * Panels remain responsible for their editing UI; this registry decides which
 * existing panel is composed for each element and which inspector capabilities
 * are exposed for it.
 */
export const INSPECTOR_ELEMENT_CAPABILITIES: Partial<Record<LayoutBlockKind, InspectorElementCapabilityDeclaration>> = {
  button: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "link", "general", "animation"],
    panel: ButtonCapabilityPanel,
    settingsLabel: "Settings",
  },
  panel: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "media", "link", "layout", "general", "animation"],
    settingsSources: ["layout", "style"],
    panel: PanelCapabilityPanel,
    settingsLabel: "Settings",
  },
  heading: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    panel: HeadingCapabilityPanel,
    settingsLabel: "Settings",
  },
  text: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    panel: TextCapabilityPanel,
    settingsLabel: "Settings",
  },
  list: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "link", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: ListCapabilityPanel,
    settingsLabel: "Settings",
  },
  accordion: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "general", "animation"],
    settingsSources: ["behavior", "style"],
    panel: AccordionCapabilityPanel,
    settingsLabel: "Settings",
  },
  image: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "media", "link", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: ImageCapabilityPanel,
    settingsLabel: "Settings",
    available: normalImageAvailability,
  },
  hero: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "media", "link", "layout", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: HeroCapabilityPanel,
    settingsLabel: "Settings",
  },
  grid: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "layout", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: GridCapabilityPanel,
    settingsLabel: "Settings",
  },
  icon: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
  badgeGrid: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
  table: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
  divider: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
  alert: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
  breadcrumbs: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
  datePicker: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style", "behavior"],
    panel: CoreContentCapabilityPanel,
    settingsLabel: "Settings",
  },
};

export function getInspectorElementCapabilityDeclaration(
  kind?: LayoutBlockKind,
  sectionId?: string,
) {
  if (!kind) return undefined;
  const declaration = INSPECTOR_ELEMENT_CAPABILITIES[kind];
  if (!declaration || declaration.available?.(sectionId) === false) return undefined;
  return declaration;
}
