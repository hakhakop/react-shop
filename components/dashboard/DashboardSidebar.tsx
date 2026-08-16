"use client";

import {
  ChevronLeft,
  Download,
  ExternalLink,
  GripVertical,
  LibraryBig,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  Layers3,
  Boxes,
  LayoutTemplate,
  Sliders,
  FileText,
  History,
  Menu,
  Route,
} from "lucide-react";
import {
  useEffect,
  useState,
  useMemo,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { createPortal } from "react-dom";
import type { MenuItem } from "@/lib/navigation";
import type {
  BuilderCustomPage,
  BuilderLayoutKey,
  BuilderSavedTemplate,
  BuilderSection,
  BuilderState,
  BuilderTargetType,
  BuilderTemplate,
  LayoutBlockKind,
  MenuPresentationSettings,
  SidebarTab,
  BuilderShellSettings,
} from "@/components/dashboard/builderTypes";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import RoutingTemplatesPanel from "@/components/dashboard/RoutingTemplatesPanel";
import ContentPanel from "@/components/dashboard/ContentPanel";
import ReactMenuEditorPanel from "@/components/dashboard/ReactMenuEditorPanel";
import { createDragGhost } from "@/components/dashboard/builderDragGhost";
import {
  pageTemplateCategories,
  pageTemplateLibrary,
  type PageTemplateCategory,
  type PageTemplateLibraryItem,
} from "@/components/dashboard/pageTemplateLibrary";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import type { LayoutLibraryType } from "@/lib/layoutLibrary";

type TemplateLibraryTab = LayoutLibraryType;

const BUILDER_TEMPLATE_DND_TYPE = "application/x-builder-template";
const BUILDER_TEMPLATE_DND_TYPES: Record<Exclude<LayoutLibraryType, "page" | "header" | "footer">, string> = {
  section: "application/x-builder-template-section",
  row: "application/x-builder-template-row",
  element: "application/x-builder-template-element",
};

const templateLibraryTabs: { value: TemplateLibraryTab; label: string }[] = [
  { value: "page", label: "Pages" },
  { value: "header", label: "Headers" },
  { value: "footer", label: "Footers" },
  { value: "section", label: "Sections" },
  { value: "row", label: "Rows" },
  { value: "element", label: "Elements" },
];

const corePages = [
  { key: "home", title: "Home", slug: "" },
  { key: "shop", title: "Shop", slug: "shop" },
  { key: "client", title: "Client Page", slug: "client" },
  { key: "page:cart", title: "Cart", slug: "cart" },
  { key: "page:checkout", title: "Checkout", slug: "checkout" },
  { key: "page:my-account", title: "My Account", slug: "my-account" },
] as const;

type DashboardSidebarProps = {
  websiteId?: string;
  availableLayoutBlockKinds: LayoutBlockKind[];
  builderState: BuilderState;
  customPages: BuilderCustomPage[];
  publishedKeys: string[];
  newPageTitle: string;
  builderSlot: ReactNode;
  globalStylesSlot: ReactNode;
  canUseShellSettings?: boolean;
  shellSettingsLabel?: string;
  shellSettingsShortLabel?: string;
  pageStatus: string;
  shellSettings: BuilderShellSettings;
  sidebarTab: SidebarTab;
  savedTemplates: BuilderSavedTemplate[];
  renameTemplateRequest?: {
    id: string;
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>;
  } | null;
  templateDescriptions: Record<BuilderTemplate, string>;
  templateLabels: Record<BuilderTemplate, string>;
  templateStatus: string;
  yoothemeImportWarnings?: string[];
  yoothemeImportPreview?: {
    fileName: string;
    sections: BuilderSection[];
    warnings: string[];
  } | null;
  onUpdateShellSettings: (patch: Partial<BuilderShellSettings>) => void;
  onSaveMenuItems?: (newItems: BuilderShellSettings["menuItems"]) => void | Promise<void>;
  topActionsSlot?: ReactNode;
  utilityControlsSlot?: ReactNode;
  onAddElementFromLibrary: (kind: LayoutBlockKind) => void;
  onCreateBuilderPage: () => void;
  onCreateBuilderPageFromTemplate?: (
    template: BuilderSavedTemplate | PageTemplateLibraryItem,
    customTitle?: string,
  ) => void;
  onDeleteBuilderPage: (key: BuilderCustomPage["key"]) => void;
  onDeleteSavedTemplate: (id: string) => void;
  onRenderLayoutBlockIcon: (kind: LayoutBlockKind) => ReactNode;
  onSaveCurrentPageAsTemplate: (title?: string) => void | Promise<unknown>;
  onApplySavedTemplate?: (template: BuilderSavedTemplate) => void;
  onExportSavedTemplate?: (template: BuilderSavedTemplate) => void;
  onImportSavedTemplate?: (
    file: File,
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>,
  ) => void | Promise<void>;
  onImportYoothemePage?: (file: File) => void | Promise<void>;
  onApplyYoothemeImport?: () => void;
  onCancelYoothemeImport?: () => void;
  onRenameSavedTemplate?: (template: BuilderSavedTemplate, title: string) => void;
  onSetNewPageTitle: Dispatch<SetStateAction<string>>;
  onSetSidebarTab: Dispatch<SetStateAction<SidebarTab>>;
  onStartSidebarResize: (clientX: number) => void;
  onSwitchBuilderTarget: (nextKey: BuilderLayoutKey) => void;
  onReorderCustomPages?: (newPages: BuilderCustomPage[]) => void;
  openElementsPanelKey: number;
  sidebarCollapsed?: boolean;
  onSetSidebarCollapsed?: (collapsed: boolean) => void;
  requestedLayoutType?: LayoutLibraryType | null;
  requestedLayoutTypeRequestKey?: number;
};

export default function DashboardSidebar({
  websiteId,
  availableLayoutBlockKinds,
  builderState,
  customPages,
  publishedKeys,
  newPageTitle,
  builderSlot,
  globalStylesSlot,
  canUseShellSettings = true,
  shellSettingsLabel = "Global Styles",
  shellSettingsShortLabel = "Global",
  pageStatus,
  shellSettings,
  sidebarTab,
  savedTemplates,
  renameTemplateRequest,
  templateDescriptions,
  templateLabels,
  templateStatus,
  yoothemeImportWarnings = [],
  yoothemeImportPreview = null,
  topActionsSlot,
  utilityControlsSlot,
  onAddElementFromLibrary,
  onCreateBuilderPage,
  onCreateBuilderPageFromTemplate = () => undefined,
  onDeleteBuilderPage,
  onDeleteSavedTemplate,
  onRenderLayoutBlockIcon,
  onSaveCurrentPageAsTemplate,
  onApplySavedTemplate = () => undefined,
  onExportSavedTemplate = () => undefined,
  onImportSavedTemplate = () => undefined,
  onImportYoothemePage = () => undefined,
  onApplyYoothemeImport = () => undefined,
  onCancelYoothemeImport = () => undefined,
  onRenameSavedTemplate = () => undefined,
  onSetNewPageTitle,
  onSetSidebarTab,
  onStartSidebarResize,
  onSwitchBuilderTarget,
  openElementsPanelKey,
  onUpdateShellSettings,
  onSaveMenuItems,
  onReorderCustomPages,
  sidebarCollapsed = true,
  onSetSidebarCollapsed,
  requestedLayoutType = null,
  requestedLayoutTypeRequestKey = 0,
}: DashboardSidebarProps) {
  const { t } = useTranslation();
  const [nestedOpen, setNestedOpen] = useState(false);
  const [templateDraftTitle, setTemplateDraftTitle] = useState("");
  const [templateLibraryTab, setTemplateLibraryTab] =
    useState<TemplateLibraryTab>("section");
  const [pageTemplateLibraryOpen, setPageTemplateLibraryOpen] = useState(false);
  const [pageTemplateCategory, setPageTemplateCategory] =
    useState<PageTemplateCategory | "all">("all");
  const [renamingTemplateId, setRenamingTemplateId] = useState<string | null>(null);
  const [renamingTemplateTitle, setRenamingTemplateTitle] = useState("");
  const [templateImportKey, setTemplateImportKey] = useState(0);

  const [corePagesOrder, setCorePagesOrder] = useState<string[]>([]);
  const [draggingCorePageKey, setDraggingCorePageKey] = useState<string | null>(null);
  const [dragOverCorePageKey, setDragOverCorePageKey] = useState<string | null>(null);

  const [draggingCustomPageKey, setDraggingCustomPageKey] = useState<string | null>(null);
  const [dragOverCustomPageKey, setDragOverCustomPageKey] = useState<string | null>(null);

  useEffect(() => {
    const defaultKeys = corePages.map((p) => p.key);
    try {
      const stored = window.localStorage.getItem("react-shop-builder-core-pages-order");
      if (stored) {
        const parsed = JSON.parse(stored) as string[];
        const existingStored = parsed.filter((k) => defaultKeys.includes(k as any));
        const missing = defaultKeys.filter((k) => !existingStored.includes(k));
        setCorePagesOrder([...existingStored, ...missing]);
      } else {
        setCorePagesOrder(defaultKeys as string[]);
      }
    } catch {
      setCorePagesOrder(defaultKeys as string[]);
    }
  }, []);

  const orderedCorePages = useMemo(() => {
    if (corePagesOrder.length === 0) return [...corePages];
    const orderMap = new Map(corePagesOrder.map((key, index) => [key, index]));
    return [...corePages].sort((a, b) => {
      const indexA = orderMap.get(a.key) ?? 999;
      const indexB = orderMap.get(b.key) ?? 999;
      return indexA - indexB;
    });
  }, [corePagesOrder]);

  useEffect(() => {
    if (openElementsPanelKey === 0) return;
    onSetSidebarTab("elements");
    const frame = window.requestAnimationFrame(() => setNestedOpen(true));
    return () => window.cancelAnimationFrame(frame);
  }, [openElementsPanelKey]);

  useEffect(() => {
    if (!requestedLayoutType) return;
    onSetSidebarTab("templates");
    setNestedOpen(true);
    setTemplateLibraryTab(requestedLayoutType);
    setRenamingTemplateId(null);
  }, [onSetSidebarTab, requestedLayoutType, requestedLayoutTypeRequestKey]);

  useEffect(() => {
    if (!renameTemplateRequest) return;
    const template = savedTemplates.find(
      (item) => item.id === renameTemplateRequest.id,
    );
    if (!template) return;
    setNestedOpen(true);
    setTemplateLibraryTab(renameTemplateRequest.templateType);
    setRenamingTemplateId(template.id);
    setRenamingTemplateTitle(template.title);
  }, [renameTemplateRequest, savedTemplates]);

  const sidebarPanels: {
    tab: SidebarTab;
    label: string;
    description: string;
    count?: number;
  }[] = [
    {
      tab: "builder",
      label: t("builder.navigation.structure"),
      description: "Navigate the page wireframe tree.",
      count: builderState.sections.length,
    },
    {
      tab: "elements",
      label: t("builder.navigation.elements"),
      description: "Add blocks to the selected layout column.",
      count: availableLayoutBlockKinds.length,
    },
    ...(canUseShellSettings
      ? [
          {
            tab: "globalStyles" as SidebarTab,
            label: shellSettingsLabel,
            description: "Design, typography, header, menu, and spacing.",
          },
        ]
      : []),
    {
      tab: "menu",
      label: t("builder.navigation.menu"),
      description: "Manage React menu items.",
      count: shellSettings.menuItems?.length ?? 0,
    },
    {
      tab: "pages",
      label: t("builder.navigation.pages"),
      description: "Create and switch editable builder pages.",
      count: corePages.length + customPages.length,
    },
    {
      tab: "content",
      label: "Content",
      description: "Manage Products and Posts and their Individual Layouts.",
    },
    {
      tab: "templates",
      label: t("builder.navigation.templates"),
      description: "Save reusable page starting points.",
      count: savedTemplates.length,
    },
    {
      tab: "routingTemplates",
      label: "Templates",
      description: "Manage routing assignments and layouts.",
    },

  ];

  const activePanel =
    sidebarPanels.find((panel) => panel.tab === sidebarTab) ?? sidebarPanels[0];

  const openPanel = (tab: SidebarTab) => {
    onSetSidebarTab(tab);
    setNestedOpen(true);
  };
  const templateTitleValue = templateDraftTitle.trim();
  const saveTemplateAndClear = (kind: "page") => {
    const nextTitle =
      templateTitleValue ||
      builderState.page;

    if (kind === "page") onSaveCurrentPageAsTemplate(nextTitle);

    setTemplateDraftTitle("");
  };
  const filteredTemplates = savedTemplates.filter(
    (template) => (template.templateType ?? "page") === templateLibraryTab,
  );
  const pageTemplates = pageTemplateLibrary.filter(
    (template) =>
      pageTemplateCategory === "all" || template.category === pageTemplateCategory,
  );
  const selectedTemplateTabLabel =
    templateLibraryTabs.find((tab) => tab.value === templateLibraryTab)?.label ??
    "Templates";
  const selectedTemplateTabSingular =
    selectedTemplateTabLabel.endsWith("s")
      ? selectedTemplateTabLabel.slice(0, -1)
      : selectedTemplateTabLabel;

  const leftNavTabs = [
    { tab: "builder" as SidebarTab, label: t("builder.navigation.structure"), icon: <Layers3 size={18} /> },
    { tab: "elements" as SidebarTab, label: t("builder.navigation.blocks"), icon: <Boxes size={18} /> },
    { tab: "templates" as SidebarTab, label: t("builder.navigation.layouts"), icon: <LayoutTemplate size={18} /> },
    { tab: "routingTemplates" as SidebarTab, label: "Templates", icon: <Route size={18} /> },
    { tab: "content" as SidebarTab, label: "Content", icon: <FileText size={18} /> },
    ...(canUseShellSettings
      ? [
          {
            tab: "globalStyles" as SidebarTab,
            label: shellSettingsShortLabel,
            icon: <Sliders size={18} />,
          },
        ]
      : []),
    { tab: "pages" as SidebarTab, label: t("builder.navigation.pages"), icon: <FileText size={18} /> },
    { tab: "history" as SidebarTab, label: t("builder.navigation.history"), icon: <History size={18} /> },
    { tab: "menu" as SidebarTab, label: t("builder.navigation.menu"), icon: <Menu size={18} /> },
  ];

  useEffect(() => {
    if (!pageTemplateLibraryOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPageTemplateLibraryOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pageTemplateLibraryOpen]);

  const pageTemplateLibraryModal = pageTemplateLibraryOpen ? (
    <div
      className="builder-layout-modal builder-page-template-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-page-template-library-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setPageTemplateLibraryOpen(false);
        }
      }}
    >
      <div className="builder-layout-dialog">
        <div className="builder-layout-header">
          <div>
            <strong id="builder-page-template-library-title">
              Page Template Library
            </strong>
            <span>Choose a ready-made page design and import it as an editable builder page.</span>
          </div>
          <button
            type="button"
            className="builder-icon-button builder-layout-close"
            onClick={() => setPageTemplateLibraryOpen(false)}
            aria-label="Close template library"
          >
            <X size={16} />
          </button>
        </div>

        <div className="builder-page-template-categories" role="tablist" aria-label="Page template categories">
          {pageTemplateCategories.map((category) => (
            <button
              key={category.value}
              type="button"
              role="tab"
              aria-selected={pageTemplateCategory === category.value}
              className={pageTemplateCategory === category.value ? "is-active" : ""}
              onClick={() => setPageTemplateCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>

        {pageTemplates.length > 0 ? (
          <div className="builder-page-template-grid">
            {pageTemplates.map((template) => (
              <article className="builder-page-template-card" key={template.id}>
                <img
                  className="builder-page-template-preview-image"
                  src={template.previewImage}
                  alt={`${template.name} template preview`}
                />
                <div className="builder-page-template-card-body">
                  <strong>{template.name}</strong>
                  <span>{template.description}</span>
                  <small>
                    {template.sections.length} section{template.sections.length === 1 ? "" : "s"}
                  </small>
                </div>
                <button
                  type="button"
                  className="builder-template-use-button"
                  onClick={() => {
                    const pageName = window.prompt(
                      "Name this new page",
                      template.name,
                    );
                    if (pageName === null) return;
                    onCreateBuilderPageFromTemplate(
                      template,
                      pageName.trim() || template.name,
                    );
                    setPageTemplateLibraryOpen(false);
                  }}
                >
                  Use Template
                </button>
              </article>
            ))}
          </div>
        ) : (
          <div className="builder-template-note">
            <strong>No templates in this category yet</strong>
            <span>Choose another category or start with Blank.</span>
          </div>
        )}
      </div>
    </div>
  ) : null;

  const yoothemeImportPreviewModal = yoothemeImportPreview ? (
    <div
      className="builder-layout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="yootheme-import-preview-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancelYoothemeImport();
      }}
    >
      <div className="builder-layout-dialog" style={{ maxWidth: "640px" }}>
        <div className="builder-layout-header">
          <div>
            <strong id="yootheme-import-preview-title">Preview YOOtheme import</strong>
            <span>Review the mapped page before replacing the current builder page.</span>
          </div>
          <button
            type="button"
            className="builder-icon-button builder-layout-close"
            onClick={onCancelYoothemeImport}
            aria-label="Cancel YOOtheme import"
          >
            <X size={16} />
          </button>
        </div>
        <div className="builder-template-note" style={{ margin: "16px 0" }}>
          <strong>{yoothemeImportPreview.fileName}</strong>
          <span>
            {yoothemeImportPreview.sections.length} section{yoothemeImportPreview.sections.length === 1 ? "" : "s"} mapped
            {yoothemeImportPreview.warnings.length
              ? ` with ${yoothemeImportPreview.warnings.length} compatibility warning${yoothemeImportPreview.warnings.length === 1 ? "" : "s"}`
              : " with no compatibility warnings"}.
          </span>
        </div>
        <div
          aria-label="Mapped page preview"
          style={{
            display: "grid",
            gap: "10px",
            maxHeight: "min(52vh, 520px)",
            overflowY: "auto",
            padding: "2px 4px 4px 0",
          }}
        >
          {yoothemeImportPreview.sections.map((section, sectionIndex) => (
            <article
              key={section.id}
              style={{
                border: "1px solid var(--builder-border, #d9dce5)",
                borderRadius: "10px",
                padding: "12px",
                background: "var(--builder-surface-muted, #f7f8fb)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "8px" }}>
                <strong>{section.title || `Section ${sectionIndex + 1}`}</strong>
                <span style={{ opacity: 0.7, whiteSpace: "nowrap" }}>
                  {section.layoutRows || section.layoutItems?.length || 0} row{(section.layoutRows || section.layoutItems?.length || 0) === 1 ? "" : "s"}
                </span>
              </div>
              <div style={{ display: "grid", gap: "6px" }}>
                {(section.layoutItems ?? []).map((item, itemIndex) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ opacity: 0.65 }}>
                      Column {itemIndex + 1} · {item.rowLayout}
                    </span>
                    {(item.blocks ?? []).length > 0 ? (
                      (item.blocks ?? []).map((block, blockIndex) => (
                        <span
                          key={block.id ?? `${item.id}-${blockIndex}`}
                          style={{
                            borderRadius: "999px",
                            padding: "3px 8px",
                            background: "var(--builder-accent-soft, #e9e7ff)",
                            color: "var(--builder-accent, #5548e8)",
                            fontWeight: 600,
                          }}
                        >
                          {block.kind ?? "element"}
                        </span>
                      ))
                    ) : (
                      <span style={{ opacity: 0.55 }}>empty</span>
                    )}
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
        {yoothemeImportPreview.warnings.length > 0 && (
          <details open className="builder-template-note" style={{ marginBottom: "16px" }}>
            <summary>Compatibility warnings</summary>
            <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
              {yoothemeImportPreview.warnings.map((warning, index) => (
                <li key={`${index}-${warning}`}>{warning}</li>
              ))}
            </ul>
          </details>
        )}
        <div className="builder-layout-actions">
          <button type="button" className="builder-secondary-button" onClick={onCancelYoothemeImport}>
            Cancel
          </button>
          <button type="button" className="builder-primary-button" onClick={onApplyYoothemeImport}>
            Apply import
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
    <aside className="builder-sidebar builder-panel">
      {/* Persistent narrow left nav */}
      <div className="builder-sidebar-left-nav">
        <div className="builder-sidebar-logo">
          BUILDER
        </div>
        <div className="builder-sidebar-nav-tiles">
          {leftNavTabs.map((item) => {
            const isActive = sidebarTab === item.tab && !sidebarCollapsed;
            return (
              <button
                key={item.tab}
                type="button"
                className={`builder-sidebar-nav-tile${isActive ? " is-active" : ""}`}
                onClick={() => {
                  if (sidebarCollapsed) {
                    onSetSidebarTab(item.tab);
                    onSetSidebarCollapsed?.(false);
                  } else if (sidebarTab === item.tab) {
                    onSetSidebarCollapsed?.(true);
                  } else {
                    onSetSidebarTab(item.tab);
                  }
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="builder-sidebar-utility-group" aria-label="Builder utilities">
          {utilityControlsSlot}
          <button
            type="button"
            className={`builder-sidebar-rail-toggle${
              sidebarCollapsed ? " is-collapsed" : ""
            }`}
            onClick={() => onSetSidebarCollapsed?.(!sidebarCollapsed)}
            title={sidebarCollapsed ? "Open Builder panel" : "Close Builder panel"}
            aria-label={sidebarCollapsed ? "Open Builder panel" : "Close Builder panel"}
          >
            <ChevronLeft size={18} />
            <span>{sidebarCollapsed ? "Open" : "Close"}</span>
          </button>
        </div>
      </div>

      {/* Right content panel container */}
      <div className="builder-sidebar-panel-container">
        {topActionsSlot ? (
          <div className="builder-sidebar-top-actions">{topActionsSlot}</div>
        ) : null}
        <div className="builder-sidebar-content">
          <AnimatePresence mode="wait">
            {sidebarTab === "elements" && (
              <motion.div
                key="elements"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <ElementLibrary
                  availableLayoutBlockKinds={availableLayoutBlockKinds}
                  onAddElement={onAddElementFromLibrary}
                  onRenderLayoutBlockIcon={onRenderLayoutBlockIcon}
                  headerMode={builderState.page === "header"}
                />
              </motion.div>
            )}

            {sidebarTab === "builder" && (
              <motion.div
                key="builder"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                {builderSlot}
              </motion.div>
            )}

            {sidebarTab === "menu" && (
              <motion.div
                key="menu"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <ReactMenuEditorPanel
                  menuItems={shellSettings.menuItems ?? []}
                  onChangeMenuItems={(newItems) => onUpdateShellSettings({ menuItems: newItems })}
                  onSaveMenuItems={onSaveMenuItems}
                  customPages={customPages}
                />
              </motion.div>
            )}

            {canUseShellSettings && sidebarTab === "globalStyles" && (
              <motion.div
                key="globalStyles"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                {globalStylesSlot}
              </motion.div>
            )}

            {sidebarTab === "pages" && (
              <motion.div
                key="pages"
                initial={{ opacity: 0, scale: 0.985 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.995 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
              >
                <div className="builder-sidebar-panel">
                  <div className="builder-card builder-pages-card" style={{ marginBottom: "14px" }}>
                    <div className="builder-card-title">
                      <strong>{t("builder.navigation.website")}</strong>
                    </div>
                    <div className="builder-pages-list">
                      <div className={`builder-page-row${builderState.page === "header" ? " is-active" : ""}`}>
                        <button
                          type="button"
                          className="builder-page-title-button"
                          onClick={() => onSwitchBuilderTarget("header")}
                        >
                          <strong>{t("builder.navigation.header")}</strong>
                          <span>{t("builder.navigation.globalArea")}</span>
                        </button>
                      </div>
                      <div className={`builder-page-row${builderState.page === "footer" ? " is-active" : ""}`}>
                        <button
                          type="button"
                          className="builder-page-title-button"
                          onClick={() => onSwitchBuilderTarget("footer")}
                        >
                          <strong>Footer</strong>
                          <span>{t("builder.navigation.globalArea")}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Core Storefront Pages */}
                  <div className="builder-card builder-pages-card" style={{ marginBottom: "14px" }}>
                    <div className="builder-card-title">
                      <strong>Core Storefront Pages</strong>
                      <span>{corePages.length}</span>
                    </div>
                    <div className="builder-pages-list">
                      {orderedCorePages.map((page) => {
                        const isActive = builderState.page === page.key;
                        const isPublished = publishedKeys.includes(page.key);
                        const isDragging = draggingCorePageKey === page.key;
                        const isDragOver = dragOverCorePageKey === page.key;
                        return (
                          <div
                            key={page.key}
                            className={`builder-page-row${isActive ? " is-active" : ""}${
                              isDragging ? " is-dragging" : ""
                            }${isDragOver ? " is-drag-over" : ""}`}
                            draggable
                            onDragStart={(event) => {
                              setDraggingCorePageKey(page.key);
                              event.dataTransfer.setData("application/x-builder-core-page-key", page.key);
                              event.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(event) => {
                              if (draggingCorePageKey && draggingCorePageKey !== page.key) {
                                event.preventDefault();
                                setDragOverCorePageKey(page.key);
                              }
                            }}
                            onDragLeave={() => {
                              if (dragOverCorePageKey === page.key) {
                                setDragOverCorePageKey(null);
                              }
                            }}
                            onDrop={(event) => {
                              event.preventDefault();
                              const draggedKey = event.dataTransfer.getData("application/x-builder-core-page-key");
                              if (draggedKey && draggedKey !== page.key) {
                                setCorePagesOrder((current) => {
                                  const next = [...current];
                                  const draggedIndex = next.indexOf(draggedKey);
                                  const targetIndex = next.indexOf(page.key);
                                  if (draggedIndex !== -1 && targetIndex !== -1) {
                                    next.splice(draggedIndex, 1);
                                    next.splice(targetIndex, 0, draggedKey);
                                    window.localStorage.setItem("react-shop-builder-core-pages-order", JSON.stringify(next));
                                  }
                                  return next;
                                });
                              }
                              setDraggingCorePageKey(null);
                              setDragOverCorePageKey(null);
                            }}
                            onDragEnd={() => {
                              setDraggingCorePageKey(null);
                              setDragOverCorePageKey(null);
                            }}
                          >
                            <GripVertical size={13} className="builder-group-drag-handle" style={{ marginRight: "2px", flexShrink: 0 }} />
                            <button type="button" className="builder-page-title-button" onClick={() => onSwitchBuilderTarget(page.key)}>
                              <strong>{page.title}</strong>
                              <span>{page.slug ? `/${page.slug}` : "/"}</span>
                            </button>
                            <span
                              className={`builder-page-status ${isPublished ? "is-published" : "is-draft"}`}
                              style={{
                                fontSize: "10px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                backgroundColor: isActive
                                  ? "rgba(255, 255, 255, 0.25)"
                                  : "rgba(164, 190, 123, 0.15)",
                                color: isActive
                                  ? "#ffffff"
                                  : (isPublished ? "#91ad68" : "var(--builder-ui-muted)"),
                                border: `1px solid ${isActive
                                  ? "rgba(255, 255, 255, 0.4)"
                                  : "rgba(164, 190, 123, 0.3)"}`,
                                textTransform: "uppercase",
                                fontWeight: "bold",
                            letterSpacing: "0.05em",
                            marginLeft: "auto",
                            marginRight: "4px",
                          }}
                        >
                          {isPublished ? "Published" : "Draft"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Pages */}
              <div className="builder-card builder-pages-card">
                <div className="builder-card-title">
                  <strong>Custom Pages</strong>
                  <span>{customPages.length}</span>
                </div>
                <div className="builder-page-create">
                  <input
                    type="text"
                    value={newPageTitle}
                    onChange={(event) => onSetNewPageTitle(event.target.value)}
                    placeholder="New page title"
                  />
                  <button
                    type="button"
                    className="builder-icon-button"
                    onClick={onCreateBuilderPage}
                    aria-label="Create custom page"
                  >
                    <Plus size={15} />
                  </button>
                </div>
                {customPages.length > 0 ? (
                  <div className="builder-pages-list" style={{ marginTop: "10px" }}>
                    {customPages.map((page) => {
                      const isActive = builderState.page === page.key;
                      const isPublished = publishedKeys.includes(page.key);
                      const isDragging = draggingCustomPageKey === page.key;
                      const isDragOver = dragOverCustomPageKey === page.key;
                      return (
                        <div
                          key={page.key}
                          className={`builder-page-row${isActive ? " is-active" : ""}${
                            isDragging ? " is-dragging" : ""
                          }${isDragOver ? " is-drag-over" : ""}`}
                          draggable
                          onDragStart={(event) => {
                            setDraggingCustomPageKey(page.key);
                            event.dataTransfer.setData("application/x-builder-custom-page-key", page.key);
                            event.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(event) => {
                            if (draggingCustomPageKey && draggingCustomPageKey !== page.key) {
                              event.preventDefault();
                              setDragOverCustomPageKey(page.key);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverCustomPageKey === page.key) {
                              setDragOverCustomPageKey(null);
                            }
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            const draggedKey = event.dataTransfer.getData("application/x-builder-custom-page-key");
                            if (draggedKey && draggedKey !== page.key) {
                              const next = [...customPages];
                              const draggedIndex = next.findIndex((p) => p.key === draggedKey);
                              const targetIndex = next.findIndex((p) => p.key === page.key);
                              if (draggedIndex !== -1 && targetIndex !== -1) {
                                const draggedPage = next[draggedIndex];
                                next.splice(draggedIndex, 1);
                                next.splice(targetIndex, 0, draggedPage);
                                onReorderCustomPages?.(next);
                              }
                            }
                            setDraggingCustomPageKey(null);
                            setDragOverCustomPageKey(null);
                          }}
                          onDragEnd={() => {
                            setDraggingCustomPageKey(null);
                            setDragOverCustomPageKey(null);
                          }}
                        >
                          <GripVertical size={13} className="builder-group-drag-handle" style={{ marginRight: "2px", flexShrink: 0 }} />
                          <button type="button" className="builder-page-title-button" onClick={() => onSwitchBuilderTarget(page.key)}>
                            <strong>{page.title}</strong>
                            <span>/{page.slug}</span>
                          </button>
                          <span
                            className={`builder-page-status ${isPublished ? "is-published" : "is-draft"}`}
                            style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: isActive
                                ? "rgba(255, 255, 255, 0.25)"
                                : "rgba(164, 190, 123, 0.15)",
                              color: isActive
                                ? "#ffffff"
                                : (isPublished ? "#91ad68" : "var(--builder-ui-muted)"),
                              border: `1px solid ${isActive
                                ? "rgba(255, 255, 255, 0.4)"
                                : "rgba(164, 190, 123, 0.3)"}`,
                              textTransform: "uppercase",
                              fontWeight: "bold",
                              letterSpacing: "0.05em",
                              marginLeft: "auto",
                              marginRight: "4px",
                            }}
                          >
                            {isPublished ? "Published" : "Draft"}
                          </span>
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => onDeleteBuilderPage(page.key)}
                            aria-label={`Delete ${page.title}`}
                            style={{ flexShrink: 0 }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: "12px 4px", fontSize: "12px", color: "var(--builder-ui-muted)", textAlign: "center" }}>
                    No custom pages created yet.
                  </div>
            )}

                <small style={{ display: "block", marginTop: "10px" }}>{pageStatus}</small>
              </div>

            </div>
          </motion.div>
          )}

          {sidebarTab === "routingTemplates" && (
            <motion.div key="routingTemplates" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.995 }} transition={{ duration: 0.12, ease: "easeOut" }}>
              <RoutingTemplatesPanel websiteId={websiteId} />
            </motion.div>
          )}

          {sidebarTab === "content" && (
            <motion.div key="content" initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.995 }} transition={{ duration: 0.12, ease: "easeOut" }}>
              <ContentPanel websiteId={websiteId} />
            </motion.div>
          )}

          {sidebarTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
            <div className="builder-sidebar-panel">
              <div className="builder-card">
                <div className="builder-card-title">
                  <strong>History</strong>
                </div>
                <div style={{ padding: "12px 4px", fontSize: "12px", color: "var(--builder-ui-muted)" }}>
                  Version history and restore points will appear here.
                </div>
              </div>
            </div>
            </motion.div>
          )}

          {sidebarTab === "templates" && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.12, ease: "easeOut" }}
            >
            <div className="builder-sidebar-panel">
              <div className="builder-template-tabs" role="tablist" aria-label="Template types">
                {templateLibraryTabs.map((tab) => {
                  const tabCount = savedTemplates.filter(
                    (template) => (template.templateType ?? "page") === tab.value,
                  ).length;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      role="tab"
                      aria-selected={templateLibraryTab === tab.value}
                      className={templateLibraryTab === tab.value ? "is-active" : ""}
                      onClick={() => {
                        setTemplateLibraryTab(tab.value);
                        setRenamingTemplateId(null);
                      }}
                    >
                      <span>{tab.label}</span>
                      <small>{tabCount}</small>
                    </button>
                  );
                })}
              </div>
              {(templateLibraryTab === "header" || templateLibraryTab === "footer") ? (
                <div className="builder-template-note">
                  <LibraryBig size={16} />
                  <span>{templateLibraryTab === "header" ? "Header layouts will be available here." : "Footer layouts will be available here."}</span>
                </div>
              ) : null}
              {templateLibraryTab === "page" ? (
                <div className="builder-card builder-pages-card" style={{ marginBottom: "12px" }}>
                  <div className="builder-card-title"><strong>Global Layout Target</strong></div>
                  <div className="builder-target-toggle" aria-label="Builder target type">
                    {(["page", "template"] as BuilderTargetType[]).map((targetType) => (
                      <button key={targetType} type="button" className={(builderState.targetType ?? "page") === targetType ? "is-active" : ""} onClick={() => onSwitchBuilderTarget(targetType === "page" ? "shop" : "product-single")}>
                        {targetType === "page" ? "Custom Pages" : "Global Templates"}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="builder-template-save-card builder-page-template-browse"
                    onClick={() => setPageTemplateLibraryOpen(true)}
                  >
                    <LibraryBig size={16} />
                    <span>
                      <strong>Browse Templates</strong>
                      <small>{pageTemplateLibrary.length} ready-made page templates</small>
                    </span>
                  </button>
                  {(builderState.targetType ?? "page") === "template" && (
                    <label className="builder-field" style={{ marginTop: '12px' }}>
                      <span>Editing Template</span>
                      <select value={builderState.page} onChange={(event) => onSwitchBuilderTarget(event.target.value as BuilderLayoutKey)}>
                        {Object.entries(templateLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                  )}
                  {(builderState.targetType ?? "page") === "template" && builderState.template && (
                    <div className="builder-template-note" style={{ marginTop: '8px' }}>
                      <strong>{templateLabels[builderState.template]}</strong>
                      <span>{templateDescriptions[builderState.template]}</span>
                    </div>
                  )}
                  <label className="builder-field">
                    <span>Template name</span>
                    <input
                      type="text"
                      value={templateDraftTitle}
                      onChange={(event) => setTemplateDraftTitle(event.target.value)}
                      placeholder="Optional custom name"
                    />
                  </label>
                  <button
                    type="button"
                    className="builder-template-save-card"
                    onClick={() => saveTemplateAndClear("page")}
                  >
                    <Save size={16} />
                    <span>
                      <strong>Save Current Page</strong>
                      <small>Reusable full-page layout</small>
                    </span>
                  </button>
                  <small>{templateStatus}</small>
                  {yoothemeImportWarnings.length > 0 && (
                    <details className="builder-template-note" style={{ marginTop: "8px" }}>
                      <summary>
                        {yoothemeImportWarnings.length} YOOtheme compatibility warning{yoothemeImportWarnings.length === 1 ? "" : "s"}
                      </summary>
                      <ul style={{ margin: "8px 0 0", paddingLeft: "18px" }}>
                        {yoothemeImportWarnings.map((warning, index) => (
                          <li key={`${index}-${warning}`}>{warning}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              ) : null}
              {filteredTemplates.length > 0 ? (
                <div className="builder-pages-list builder-template-list">
                  {filteredTemplates.map((template) => {
                    const templateType = template.templateType ?? "page";
                    const canDragTemplate = templateType !== "page" && templateType !== "header" && templateType !== "footer";
                    const templateDragMimeType = canDragTemplate
                      ? BUILDER_TEMPLATE_DND_TYPES[
                          templateType as Exclude<LayoutLibraryType, "page" | "header" | "footer">
                        ]
                      : null;
                    return (
                    <div
                      key={template.id}
                      className="builder-page-row builder-template-row"
                      draggable={canDragTemplate && renamingTemplateId !== template.id}
                      onDragStart={(event) => {
                        if (!canDragTemplate || renamingTemplateId === template.id) {
                          event.preventDefault();
                          return;
                        }
                        event.dataTransfer.setData(
                          BUILDER_TEMPLATE_DND_TYPE,
                          template.id,
                        );
                        if (templateDragMimeType) {
                          event.dataTransfer.setData(templateDragMimeType, template.id);
                        }
                        event.dataTransfer.effectAllowed = "copy";
                        createDragGhost(event, template.title || "Template");
                      }}
                    >
                      {renamingTemplateId === template.id ? (
                        <>
                          <input
                            className="builder-template-rename-input"
                            value={renamingTemplateTitle}
                            onChange={(event) => setRenamingTemplateTitle(event.target.value)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                onRenameSavedTemplate(template, renamingTemplateTitle);
                                setRenamingTemplateId(null);
                              }
                              if (event.key === "Escape") {
                                setRenamingTemplateId(null);
                              }
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => {
                              onRenameSavedTemplate(template, renamingTemplateTitle);
                              setRenamingTemplateId(null);
                            }}
                            aria-label={`Save new name for ${template.title}`}
                          >
                            <Save size={14} />
                          </button>
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => setRenamingTemplateId(null)}
                            aria-label="Cancel rename"
                          >
                            <X size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => onApplySavedTemplate(template)}>
                            <strong>{template.title}</strong>
                            <span>
                              {templateType.toUpperCase()} · {template.sourcePage ?? "template"} · {new Date(template.updatedAt).toLocaleDateString()}
                            </span>
                          </button>
                          <button type="button" className="builder-template-use-button" onClick={() => onApplySavedTemplate(template)}>
                            <Plus size={14} />
                            Use
                          </button>
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => onExportSavedTemplate(template)}
                            aria-label={`Export ${template.title}`}
                          >
                            <Download size={14} />
                          </button>
                          <button
                            type="button"
                            className="builder-icon-button"
                            onClick={() => {
                              setRenamingTemplateId(template.id);
                              setRenamingTemplateTitle(template.title);
                            }}
                            aria-label={`Rename ${template.title}`}
                          >
                            <Pencil size={14} />
                          </button>
                          <button type="button" className="builder-icon-button" onClick={() => onDeleteSavedTemplate(template.id)} aria-label={`Delete ${template.title}`}><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="builder-template-note">
                  <LibraryBig size={16} />
                  <span>
                    {savedTemplates.length > 0
                      ? `No ${selectedTemplateTabLabel.toLowerCase()} templates saved yet.`
                      : "Saved templates will appear here after you save from a page, section, row, or element toolbar."}
                  </span>
                </div>
              )}
              {templateLibraryTab !== "header" && templateLibraryTab !== "footer" && (
                <label className="builder-template-import-control">
                  <Upload size={14} />
                  <span>Upload {selectedTemplateTabSingular} Export</span>
                  <input
                    key={`${templateLibraryTab}-${templateImportKey}`}
                    type="file"
                    accept=".json,application/json"
                    onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) return;
                      await onImportSavedTemplate(file, templateLibraryTab);
                      setTemplateImportKey((key) => key + 1);
                    }}
                  />
                </label>
              )}
              {templateLibraryTab === "page" && (
                <label className="builder-template-import-control">
                  <Upload size={14} />
                  <span>Import YOOtheme Page JSON</span>
                  <input
                    key={`yootheme-${templateImportKey}`}
                    type="file"
                    accept=".json,application/json"
                    onChange={async (event) => {
                      const file = event.currentTarget.files?.[0];
                      if (!file) return;
                      await onImportYoothemePage(file);
                      setTemplateImportKey((key) => key + 1);
                    }}
                  />
                </label>
              )}
            </div>
          </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>

      <button
        type="button"
        className="builder-sidebar-resize-handle"
        onMouseDown={(event) => {
          event.preventDefault();
          onStartSidebarResize(event.clientX);
        }}
        aria-label="Resize dashboard panel"
        title="Resize panel"
      />
    </aside>
    {pageTemplateLibraryModal && typeof document !== "undefined"
      ? createPortal(pageTemplateLibraryModal, document.body)
      : null}
    {yoothemeImportPreviewModal}
    </>
  );
}
