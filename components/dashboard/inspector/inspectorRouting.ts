import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";
import type {
  BuilderLayoutBlock,
  BuilderShellSettings,
  InspectorTab,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import type { ComponentType } from "react";
import AccordionCapabilityPanel from "@/components/dashboard/inspector/panels/AccordionCapabilityPanel";
import AlertCapabilityPanel from "@/components/dashboard/inspector/panels/AlertCapabilityPanel";
import BadgeGridCapabilityPanel from "@/components/dashboard/inspector/panels/BadgeGridCapabilityPanel";
import BreadcrumbsCapabilityPanel from "@/components/dashboard/inspector/panels/BreadcrumbsCapabilityPanel";
import ButtonCapabilityPanel from "@/components/dashboard/inspector/panels/ButtonCapabilityPanel";
import CoreContentCapabilityPanel from "@/components/dashboard/inspector/panels/CoreContentCapabilityPanel";
import DatePickerCapabilityPanel from "@/components/dashboard/inspector/panels/DatePickerCapabilityPanel";
import DividerCapabilityPanel from "@/components/dashboard/inspector/panels/DividerCapabilityPanel";
import HeadingCapabilityPanel from "@/components/dashboard/inspector/panels/HeadingCapabilityPanel";
import IconCapabilityPanel from "@/components/dashboard/inspector/panels/IconCapabilityPanel";
import GridCapabilityPanel from "@/components/dashboard/inspector/panels/GridCapabilityPanel";
import { HeroCapabilityPanel } from "@/components/dashboard/inspector/panels/HeroGridCapabilityPanel";
import ImageCapabilityPanel from "@/components/dashboard/inspector/panels/ImageCapabilityPanel";
import ListCapabilityPanel from "@/components/dashboard/inspector/panels/ListCapabilityPanel";
import PanelCapabilityPanel from "@/components/dashboard/inspector/panels/PanelCapabilityPanel";
import TableCapabilityPanel from "@/components/dashboard/inspector/panels/TableCapabilityPanel";
import GalleryCapabilityPanel from "@/components/dashboard/inspector/panels/GalleryCapabilityPanel";
import SliderCapabilityPanel from "@/components/dashboard/inspector/panels/SliderCapabilityPanel";
import FluentFormCapabilityPanel from "@/components/dashboard/inspector/panels/FluentFormCapabilityPanel";
import ProductsCapabilityPanel from "@/components/dashboard/inspector/panels/ProductsCapabilityPanel";
import CategoryFiltersCapabilityPanel from "@/components/dashboard/inspector/panels/CategoryFiltersCapabilityPanel";
import TextCapabilityPanel from "@/components/dashboard/inspector/panels/TextCapabilityPanel";

/** Normal page kinds with a dedicated capability-driven inspector path. */
export const CANONICAL_INSPECTOR_KINDS = [
  "button", "panel", "heading", "text", "list", "accordion", "image",
  "hero", "grid", "gallery", "slider", "slideshow", "overlaySlider", "panelSlider", "fluentForm", "products", "categoryFilters", "icon", "badgeGrid", "table", "divider", "alert", "breadcrumbs", "datePicker",
] as const satisfies readonly LayoutBlockKind[];

/**
 * Explicitly documented legacy paths. These remain visible while their larger
 * data-heavy editors are migrated; they are never silently treated as modern.
 */
export const LEGACY_INSPECTOR_ALLOWLIST = [
  "scrollPinnedDemo",
  "embed", "menu",
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
    multiple?: boolean;
    onSelect: (media: WordPressMediaItem) => void;
    onSelectMany?: (media: WordPressMediaItem[]) => void;
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
  /** Canonical destination fields that may receive provider-independent bindings. */
  dynamicFields?: Readonly<Record<string, { label: string; destination: string }>>;
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
    settingsSources: ["style"],
    panel: ButtonCapabilityPanel,
    settingsLabel: "Settings",
    dynamicFields: {
      label: { label: "Action label", destination: "buttonLabel" },
      url: { label: "Action URL", destination: "buttonUrl" },
    },
  },
  panel: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "media", "link", "layout", "general", "animation"],
    // PanelCapabilityPanel owns one unified Settings surface. Rendering both
    // legacy sources mounts the same controls twice without adding a distinct
    // canonical capability.
    settingsSources: ["style"],
    panel: PanelCapabilityPanel,
    settingsLabel: "Settings",
    dynamicFields: {
      image: { label: "Image source", destination: "imageUrl" },
      imageAlt: { label: "Alt text", destination: "imageAlt" },
      meta: { label: "Meta", destination: "eyebrow" },
      title: { label: "Title", destination: "title" },
      content: { label: "Content", destination: "body" },
      actionLabel: { label: "Text", destination: "buttonLabel" },
      actionUrl: { label: "URL", destination: "buttonUrl" },
    },
  },
  heading: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: HeadingCapabilityPanel,
    settingsLabel: "Settings",
    dynamicFields: { content: { label: "Content", destination: "headingText" } },
  },
  text: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: TextCapabilityPanel,
    settingsLabel: "Settings",
    dynamicFields: { content: { label: "Content", destination: "body" } },
  },
  list: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "link", "general", "animation"],
    settingsSources: ["style"],
    panel: ListCapabilityPanel,
    settingsLabel: "Settings",
    dynamicFields: {
      text: { label: "Content", destination: "text" },
      url: { label: "Link URL", destination: "url" },
    },
  },
  accordion: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: AccordionCapabilityPanel,
    settingsLabel: "Settings",
  },
  image: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "media", "link", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: ImageCapabilityPanel,
    settingsLabel: "Settings",
    available: normalImageAvailability,
    dynamicFields: {
      source: { label: "Image source", destination: "imageUrl" },
      alt: { label: "Alt text", destination: "imageAlt" },
    },
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
    settingsSources: ["style"],
    panel: GridCapabilityPanel,
    settingsLabel: "Settings",
  },
  gallery: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "layout", "general", "animation"],
    settingsSources: ["style"],
    panel: GalleryCapabilityPanel,
    settingsLabel: "Settings",
  },
  slider: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "general", "animation"],
    settingsSources: ["style"],
    panel: SliderCapabilityPanel,
    settingsLabel: "Settings",
  },
  slideshow: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "general", "animation"],
    settingsSources: ["style"],
    panel: SliderCapabilityPanel,
    settingsLabel: "Settings",
  },
  overlaySlider: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "general", "animation"],
    settingsSources: ["style"],
    panel: SliderCapabilityPanel,
    settingsLabel: "Settings",
  },
  panelSlider: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "general", "animation"],
    settingsSources: ["style"],
    panel: SliderCapabilityPanel,
    settingsLabel: "Settings",
  },
  fluentForm: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: FluentFormCapabilityPanel,
    settingsLabel: "Settings",
  },
  products: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "media", "link", "general", "animation"],
    settingsSources: ["style"],
    panel: ProductsCapabilityPanel,
    settingsLabel: "Settings",
  },
  categoryFilters: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: CategoryFiltersCapabilityPanel,
    settingsLabel: "Settings",
  },
  icon: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: IconCapabilityPanel,
    settingsLabel: "Settings",
  },
  badgeGrid: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "repeatable-items", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: BadgeGridCapabilityPanel,
    settingsLabel: "Settings",
  },
  table: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: TableCapabilityPanel,
    settingsLabel: "Settings",
  },
  divider: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: DividerCapabilityPanel,
    settingsLabel: "Settings",
  },
  alert: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: AlertCapabilityPanel,
    settingsLabel: "Settings",
    dynamicFields: {
      title: { label: "Title", destination: "title" },
      content: { label: "Content", destination: "body" },
      link: { label: "Link URL", destination: "alertLinkUrl" },
    },
  },
  breadcrumbs: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: BreadcrumbsCapabilityPanel,
    settingsLabel: "Settings",
  },
  datePicker: {
    capabilities: ["content", "style", "advanced"],
    composes: ["content", "component-presentation", "general", "animation"],
    settingsSources: ["style"],
    panel: DatePickerCapabilityPanel,
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
