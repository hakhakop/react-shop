"use client";

import {
  ArrowLeft,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  CircleCheck,
  CloudUpload,
  Code2,
  Copy,
  ExternalLink,
  GalleryHorizontal,
  Grid3X3,
  GripVertical,
  Heart,
  Layers3,
  ListChecks,
  Navigation,
  PanelLeft,
  PanelRightOpen,
  Pencil,
  Languages,
  Plus,
  ShoppingBag,
  LockKeyhole,
  Laptop,
  Monitor,
  Redo2,
  Save,
  Settings2,
  Undo2,
  Sliders,
  Sparkles,
  Star,
  ShieldCheck,
  SquareMousePointer,
  TextCursorInput,
  Truck,
  UserRound,
  Trash2,
  X,
  Sun,
  Smartphone,
  Tablet,
  Moon,
  AlertCircle,
  AlignLeft,
  Clock,
  Equal,
  FileText,
  Frame,
  Layout,
  LayoutGrid,
  Menu,
  Minus,
  MousePointerClick,
  Presentation,
  Table,
  Tag,
  Timer,
  Zap,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import { GridCardsClient } from "@/components/builder/GridCardsClient";
import UikitStylableSvg from "@/components/builder/UikitStylableSvg";
import { ResponsiveBreakpointPolicyStyle } from "@/components/builder/ResponsiveBreakpointPolicyStyle";
import { useTranslation } from "@/components/i18n/LanguageProvider";
import { isLocale, localeLabels } from "@/lib/i18n";
import {
  applyContentPatch,
  isUsingPrimaryFallback,
  resolveContentSections,
} from "@/lib/builderContentLanguages";
import { resolveHeaderBuilderComposition } from "@/lib/headerBuilderComposition";
import { resolveHeaderDocumentSettings } from "@/lib/headerDocumentSettings";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import type { LayoutLibraryType } from "@/lib/layoutLibrary";
import type { BuilderLayout } from "@/lib/builderLayouts";
import {
  decodeHeaderBlockDragPayload,
  encodeHeaderBlockDragPayload,
  HEADER_BLOCK_DRAG_TYPE,
  moveHeaderBlockById,
  type HeaderBlockDragPayload,
} from "@/lib/headerBuilderBlockMove";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { SaaSUserRole } from "@/lib/authRoles";
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
  TransitionEvent as ReactTransitionEvent,
} from "react";
import {
  Fragment,
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import CarouselBlock, {
  type CarouselSlide,
} from "@/components/blocks/CarouselBlock";
import { resolveCarouselPresentation } from "@/lib/carouselPresentation";
import BuilderScrollAnimations from "@/components/builder/BuilderScrollAnimations";
import BuilderStickyRuntime from "@/components/builder/BuilderStickyRuntime";
import { LayoutAdvancedStyle } from "@/components/builder/LayoutAdvancedStyle";
import { BuilderCarouselGeometryCoordinator } from "@/components/builder/BuilderCarouselGeometryCoordinator";
import StorefrontBuilderRenderer, {
  BodyText,
  ContentLayoutBlock,
  designStyle,
  getBuilderSectionClassName,
  getBuilderStickyDeclaration,
  isRichPreviewText,
  sectionStyle,
} from "@/components/builder/StorefrontBuilderRenderer";
import ScopedPreviewLinkRouter from "@/components/builder/ScopedPreviewLinkRouter";
import {
  BUILDER_IFRAME_DRAFT_MESSAGE,
  BUILDER_IFRAME_DRAFT_SOURCE,
} from "@/components/builder/BuilderIframeDraftBridge";
import { Typog as DashboardTypog } from "@/components/builder/BuilderRenderHelpers";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import { resolveUikitIconName, UIKIT_ICON_OPTIONS } from "@/lib/uikitIconRegistry";
import { normalizeSectionTitleBreakpoint } from "@/lib/sectionSemantics";
import UikitAccordion from "@/components/builder/UikitAccordion";
import UikitAlert from "@/components/builder/UikitAlert";
import UikitBadgeGrid from "@/components/builder/UikitBadgeGrid";
import UikitBreadcrumbs from "@/components/builder/UikitBreadcrumbs";
import UikitButton from "@/components/builder/UikitButton";
import UikitDivider from "@/components/builder/UikitDivider";
import UikitDatePicker from "@/components/builder/UikitDatePicker";
import UikitGallery from "@/components/builder/UikitGallery";
import UikitHeading from "@/components/builder/UikitHeading";
import UikitIcon from "@/components/builder/UikitIcon";
import UikitImage from "@/components/builder/UikitImage";
import { ElementAdvancedStyle } from "@/components/builder/ElementAdvancedStyle";
import {
  ContentPositioningGroup,
  getContentPositioningGroupChildStyle,
} from "@/components/builder/ContentPositioningGroup";
import UikitList from "@/components/builder/UikitList";
import UikitSubnav from "@/components/builder/UikitSubnav";
import UikitTable from "@/components/builder/UikitTable";
import UikitSlider from "@/components/builder/UikitSlider";
import UikitFluentForm from "@/components/builder/UikitFluentForm";
import UikitProducts from "@/components/builder/UikitProducts";
import UikitCategoryFilters from "@/components/builder/UikitCategoryFilters";
import UikitText from "@/components/builder/UikitText";
import {
  getUikitMarginClass,
  getUikitSectionPaddingClass,
  getUikitContainerClass,
  getUikitWidthClass,
  getUikitCardClass,
  getUikitButtonClass,
  getUikitHeadingClass,
  getUikitTextClass,
  getUikitDividerClass,
  getUikitAlertClass,
  getUikitImageClass,
  getUikitImageWrapperClass,
  getUikitImageStyle,
  getUikitImageAttributes,
  resolveUikitImageSemantics,
  getUikitListClass,
  getUikitPanelMediaClass,
  getUikitPanelLayoutClass,
  getUikitPanelMediaStyle,
  getUikitSvgColor,
  getUikitSvgColorClass,
  UIKIT_YOOTHEME_BUTTON_VARIANTS,
} from "@/lib/uikitTokens";
import { elementAdvancedScope, layoutAdvancedScope, parseSafeElementAttributes, resolveElementAdvanced } from "@/lib/elementAdvanced";
import {
  getGeneralElementShellClassName,
  getGeneralElementShellStyle,
  isYoothemeCenteredPositionedPanel,
} from "@/lib/builderElementShell";
import { resolveCanonicalGridAction } from "@/lib/builderActions";
import { resolvePanelPresentation } from "@/lib/panelPresentation";
import { resolveBuilderMediaUrls } from "@/lib/builderMediaUrls";
import { resolveSectionBackground, resolveSectionColorMode, sectionBackgroundClass, sectionBackgroundImageVariables } from "@/lib/semanticBackgrounds";
import {
  normalizeLayoutToUikitPreset,
  UIKIT_LAYOUT_PRESETS,
} from "@/lib/uikitLayoutEngine";
import {
  resolveResponsiveBreakpointPolicy,
  resolveResponsiveBreakpointTier,
} from "@/lib/responsiveBreakpointPolicy";
import {
  getUikitSemanticContextVars,
  getYoothemeImportGlobalAliases,
  hasYoothemeImportContract,
} from "@/lib/uikitSemanticContext";
import WebPagesFontLoader from "@/components/builder/WebPagesFontLoader";
import CategoryBar from "@/components/CategoryBar";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import ProductCategoryFilterProvider from "@/components/ProductCategoryFilterProvider";
import HeaderShellView from "@/components/HeaderShellView";
import { useTheme } from "@/components/ThemeProvider";
import FluentFormClient from "@/components/builder/FluentFormClient";
import ProductCarousel from "@/components/ProductCarousel";
import ProductOptionsSelector from "@/components/ProductOptionsSelector";
import DashboardInspector from "@/components/dashboard/DashboardInspector";
import { DynamicContentCapabilitiesProvider } from "@/components/dashboard/inspector/DynamicContentCapabilitiesContext";
import type { DynamicContentSourceCapability } from "@/lib/dynamicContentCapabilities";
import { headerPresets } from "./headerPresets";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import LayoutLibrarySurface, {
  type LayoutLibraryGroup,
  type LayoutLibraryInsertionAction,
} from "@/components/dashboard/LayoutLibrarySurface";
import ElementLibrary from "@/components/dashboard/ElementLibrary";
import { ElementLibraryIcon } from "@/components/dashboard/elementIconRegistry";
import BuilderWireframePanel, {
  type BuilderHoverTarget,
  type BuilderWireframeActions,
} from "@/components/dashboard/BuilderWireframePanel";
import {
  builderInteractionClassName,
  builderInteractionFrameClassName,
  builderInsertionBoundaryClassName,
  builderTargetsEqual,
  builderTargetFromElement,
  resolveBuilderInteractionChrome,
  resolveBuilderInteractionState,
  selectedBuilderTarget,
  type BuilderInteractionTarget,
} from "@/components/dashboard/builderInteraction";
import {
  isBuilderPreviewInteractiveControl,
  resolveBuilderOpenLinkIntent,
  shouldSuppressBuilderKeyboardNavigation,
  shouldSuppressBuilderNavigation,
} from "@/components/dashboard/builderInteractionBoundary";
import MediaManager from "@/components/dashboard/media/MediaManager";
import ScrollPinnedDemo from "@/components/animations/ScrollPinnedDemo";
import { AntigravityTerminal } from "@/components/builder/AntigravityTerminal";
import AntigravityCanvas from "@/components/builder/AntigravityCanvas";
import TypewriterText from "@/components/builder/TypewriterText";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { BUILDER_IFRAME_SELECTION_SOURCE } from "@/components/builder/BuilderIframeSelectionBridge";
import type {
  BuilderCustomPage,
  BuilderCustomPageKey,
  BuilderColorScheme,
  BuilderColumn,
  BuilderDesign,
  BuilderHeaderIconId,
  BuilderLayoutBlock,
  BuilderListItem,
  BuilderLayoutKey,
  BuilderRow,
  BuilderSavedTemplate,
  BuilderSection,
  BuilderShellSettings,
  BuilderState,
  BuilderTemplate,
  GlobalSectionSpacing,
  InspectorTab,
  LayoutBlockKind,
  MenuPresentationSettings,
  PreviewDevice,
  SectionColorScheme,
  SectionSpacing,
  SidebarTab,
  WordPressMediaItem,
} from "@/components/dashboard/builderTypes";
import {
  applyCanonicalBuilderRowLayout,
  updateCanonicalBuilderRow,
} from "@/lib/builderRowEditing";
import { updateCanonicalBuilderColumn } from "@/lib/builderColumnEditing";
import {
  builderLayoutKeys,
  getLayoutBlockKindsForState,
  layoutBlockLabels,
  layoutLabels,
  sectionLabels,
  templateDescriptions,
  templateLabels,
} from "@/components/dashboard/builderRegistry";
import { createDragGhost } from "@/components/dashboard/builderDragGhost";
import {
  builderRowLayoutPresets,
  getBuilderRowLayoutPreset,
  getBuilderRowLayoutPreviewTemplate,
  getBuilderLayoutRows as getPreviewLayoutRows,
} from "@/components/dashboard/builderLayoutPresets";
import {
  createBlockId,
  createId,
  createLayoutBlock,
  createWireframeSection,
  createStructuralRowItems,
  defaultDesign,
  defaultState,
  defaultTemplateStates,
  designPresets,
  elementBackgroundPresets,
  sectionBackgroundPresets,
} from "@/components/dashboard/builderDefaults";
import type { CategoryTreeItem } from "@/lib/categories";
import type { MenuItem } from "@/lib/navigation";
import type { ProductNode } from "@/lib/products";
import type { PageTemplateLibraryItem } from "@/components/dashboard/pageTemplateLibrary";
import {
  createVerticalNestedLayout,
  findLayoutBlock,
  findLayoutColumn,
  layoutColumnHasContent,
  removeBlockInLayoutColumn,
  updateBlockInLayoutColumn,
  updateLayoutColumn,
  updateLayoutBlockEverywhere,
} from "@/lib/builderNestedLayout";
import {
  GLOBAL_STYLE_PRESETS,
  type GlobalStylePreset,
} from "@/components/dashboard/globalStylePresets";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import YoothemeImportPanel from "@/components/dashboard/global-styles/YoothemeImportPanel";
import CanonicalGlobalStylesPanel from "@/components/dashboard/global-styles/CanonicalGlobalStylesPanel";
import { typographyRoleClass, type TypographyArea } from "@/lib/builderTypography";
import {
  resolveBuilderRowGap,
} from "@/lib/builderRowStyles";
import { resolveBuilderSectionStructure } from "@/lib/builderSectionStructure";
import { normalizeBuilderSectionLayout } from "@/lib/builderSectionLayout";
import { insertAtContextualTarget } from "@/lib/contextualLibraryInsertion";
import { dynamicContentPreviewSignature } from "@/lib/dynamicContentPreviewSignature";
import {
  createUniqueBuilderAnchorId,
} from "@/lib/builderAnchors";
import type { HeaderSettings } from "@/lib/themeSettings";
import {
  hasBuilderVisualSpacing,
  builderGlobalVisibilityClassName,
  resolveSpacingToken,
  visualStyleClassName,
  visualStyleToCss,
} from "@/lib/builderVisualStyle";
import {
  getSpacingOptionLabel,
  resolveBuilderSpacingCssValue,
  resolveBuilderSpacing,
  type ResolvedBuilderSpacing,
  BUILDER_SPACING_SCALE,
  TOKEN_LABELS,
  type BuilderSpacingContext,
  getDefaultSpacingToken,
} from "@/lib/builderSpacing";
import {
  builderLinkTargetProps,
  resolveWebsiteStorefrontHref,
} from "@/lib/websiteBuilderLinks";
import {
  getBuilderPageKeyForHref,
  getStorefrontHrefFromScopedPreviewHref,
  resolveTenantPathHref,
} from "@/lib/scopedPreviewLinks";
import {
  builderAnimationClassName as previewAnimationClassName,
  builderAnimationDataAttributes as previewAnimationAttrs,
} from "@/lib/builderAnimation";
import { normalizeBuilderLineBreaks } from "@/lib/builderText";
import {
  BUILDER_BUTTON_PRESETS,
  builderButtonCssVars,
  builderButtonOverrideCssVars,
  builderButtonPresetFields,
  buttonColorInputValue,
  getBuilderButtonPresetKey,
} from "@/lib/builderButtons";
import {
  getBuilderImageAspectRatio,
  getBuilderImageObjectFit,
} from "@/lib/builderImages";
import { mapYoothemeStaticContent } from "@/lib/yoothemePageImport";
import {
  defaultBuilderThemeSettings,
  type BuilderThemeSettings,
} from "@/lib/builderThemeSettings";
import { invalidateImportedBuilderDraft } from "@/lib/builderDraftInvalidation";
import type { BuilderEditorContext } from "@/lib/builderEditorContext";
import { AnimatePresence, motion } from "framer-motion";

const BUILDER_TEMPLATE_DND_TYPE = "application/x-builder-template";
const BUILDER_TEMPLATE_SECTION_DND_TYPE =
  "application/x-builder-template-section";
const BUILDER_TEMPLATE_ROW_DND_TYPE = "application/x-builder-template-row";
const INSPECTOR_WIDTH_STORAGE_KEY = "webpages-builder-inspector-width";
const INSPECTOR_MODE_STORAGE_KEY = "webpages-builder-inspector-mode";
const INSPECTOR_FLOATING_RECT_STORAGE_KEY =
  "webpages-builder-inspector-floating-rect";
const INSPECTOR_DEFAULT_WIDTH = 360;
const INSPECTOR_MIN_WIDTH = 300;
const INSPECTOR_MAX_WIDTH = 520;
const INSPECTOR_MIN_HEIGHT = 360;
const INSPECTOR_DEFAULT_HEIGHT = 720;
const INSPECTOR_MIN_CANVAS_WIDTH = 320;
const INSPECTOR_RESIZE_BREAKPOINT = 1180;
const INSPECTOR_VIEWPORT_GUTTER = 12;

type PublishedBuilderLayoutPayload = {
  layout?: BuilderState | null;
  renderLayout?: BuilderState | null;
  editorContext?: BuilderEditorContext;
  dynamicContentDiagnostics?: Array<{
    status: "materialized" | "fallback";
    message?: string;
  }>;
};

// Share only an in-flight request while the dashboard route settles. Completed
// documents are not cached here; the published API remains the hydration
// authority for every genuine load.
const publishedLayoutRequests = new Map<
  string,
  Promise<{ ok: boolean; payload: PublishedBuilderLayoutPayload }>
>();

function fetchPublishedLayoutOnce(url: string) {
  const existing = publishedLayoutRequests.get(url);
  if (existing) return existing;

  let request!: Promise<{ ok: boolean; payload: PublishedBuilderLayoutPayload }>;
  request = fetch(url, { cache: "no-store" })
    .then(async (response) => ({
      ok: response.ok,
      payload: response.ok
        ? await response.json() as PublishedBuilderLayoutPayload
        : {},
    }))
    .finally(() => {
      if (publishedLayoutRequests.get(url) === request) {
        publishedLayoutRequests.delete(url);
      }
    });
  publishedLayoutRequests.set(url, request);
  return request;
}

type InspectorMode = "docked" | "floating";
type InspectorFloatingRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function readInspectorWidthPreference() {
  if (typeof window === "undefined") return INSPECTOR_DEFAULT_WIDTH;
  const storedWidth = Number(
    window.localStorage.getItem(INSPECTOR_WIDTH_STORAGE_KEY),
  );
  return Number.isFinite(storedWidth) && storedWidth >= INSPECTOR_MIN_WIDTH
    ? storedWidth
    : INSPECTOR_DEFAULT_WIDTH;
}

function readInspectorModePreference(): InspectorMode {
  if (typeof window === "undefined") return "docked";
  return window.localStorage.getItem(INSPECTOR_MODE_STORAGE_KEY) === "floating"
    ? "floating"
    : "docked";
}

function readInspectorFloatingRectPreference(): InspectorFloatingRect {
  const fallback = {
    x:
      typeof window === "undefined"
        ? 960
        : Math.max(
            INSPECTOR_VIEWPORT_GUTTER,
            window.innerWidth -
              INSPECTOR_DEFAULT_WIDTH -
              INSPECTOR_VIEWPORT_GUTTER,
          ),
    y: 82,
    width: INSPECTOR_DEFAULT_WIDTH,
    height:
      typeof window === "undefined"
        ? INSPECTOR_DEFAULT_HEIGHT
        : Math.min(
            INSPECTOR_DEFAULT_HEIGHT,
            window.innerHeight - 82 - INSPECTOR_VIEWPORT_GUTTER,
          ),
  };
  if (typeof window === "undefined") return fallback;
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(INSPECTOR_FLOATING_RECT_STORAGE_KEY) ?? "",
    ) as Partial<InspectorFloatingRect>;
    return {
      x: Number.isFinite(stored.x) ? Number(stored.x) : fallback.x,
      y: Number.isFinite(stored.y) ? Number(stored.y) : fallback.y,
      width: Number.isFinite(stored.width)
        ? Number(stored.width)
        : fallback.width,
      height: Number.isFinite(stored.height)
        ? Number(stored.height)
        : fallback.height,
    };
  } catch {
    return fallback;
  }
}

function clampInspectorFloatingRect(
  rect: InspectorFloatingRect,
): InspectorFloatingRect {
  if (typeof window === "undefined") return rect;
  const width = Math.min(
    Math.max(INSPECTOR_MIN_WIDTH, rect.width),
    Math.max(
      INSPECTOR_MIN_WIDTH,
      window.innerWidth - INSPECTOR_VIEWPORT_GUTTER * 2,
    ),
  );
  const height = Math.min(
    Math.max(INSPECTOR_MIN_HEIGHT, rect.height),
    Math.max(
      INSPECTOR_MIN_HEIGHT,
      window.innerHeight - INSPECTOR_VIEWPORT_GUTTER * 2,
    ),
  );
  return {
    x: Math.min(
      Math.max(INSPECTOR_VIEWPORT_GUTTER, rect.x),
      Math.max(
        INSPECTOR_VIEWPORT_GUTTER,
        window.innerWidth - width - INSPECTOR_VIEWPORT_GUTTER,
      ),
    ),
    y: Math.min(
      Math.max(INSPECTOR_VIEWPORT_GUTTER, rect.y),
      Math.max(
        INSPECTOR_VIEWPORT_GUTTER,
        window.innerHeight - height - INSPECTOR_VIEWPORT_GUTTER,
      ),
    ),
    width,
    height,
  };
}
const BUILDER_TEMPLATE_ELEMENT_DND_TYPE =
  "application/x-builder-template-element";

type BuilderTemplateDragType = "section" | "row" | "element";

const getElementDropPlacement = (
  clientY: number,
  rect: Pick<DOMRect, "top" | "height">,
): "above" | "below" => clientY - rect.top < rect.height / 2 ? "above" : "below";

function getBuilderTemplateDragType(
  types: Iterable<string> | ArrayLike<string>,
) {
  const dragTypes = Array.from(types);
  if (dragTypes.includes(BUILDER_TEMPLATE_SECTION_DND_TYPE)) return "section";
  if (dragTypes.includes(BUILDER_TEMPLATE_ROW_DND_TYPE)) return "row";
  if (dragTypes.includes(BUILDER_TEMPLATE_ELEMENT_DND_TYPE)) return "element";
  return null;
}

// Memoized to prevent Swiper from remounting on every DashboardBuilder state change
const PreviewSliderBlock = memo(function PreviewSliderBlock({
  section,
  shellSettings,
}: {
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
}) {
  const carousel = resolveCarouselPresentation({
    ...(section.carouselSettings ?? {}),
    // General Text Alignment is owned by the element shell, not an invented
    // carousel setting. Present it to the shared renderer only when the
    // semantic adapter has no explicit component value.
    contentAlign: section.carouselSettings?.contentAlign ?? (section as any).textAlign,
  }, section.slides as any[], shellSettings) as { settings: any; slides: any[] };
  const breakpointPolicy = resolveResponsiveBreakpointPolicy(shellSettings);
  const slides = carousel.slides.map(
    (slide, index) =>
      ({
        ...slide,
        id: slide.id ?? `preview-slide-${index}`,
        imageUrl: slide.imageUrl,
        imageAlt: slide.imageAlt,
        title: slide.title,
        subtitle: slide.subtitle,
        text: slide.text,
        buttonLabel: slide.buttonLabel,
        buttonUrl: slide.buttonUrl,
        badge: slide.badge,
        imagePadding: slide.imagePadding,
      }) satisfies CarouselSlide,
  );
  const showSliderHeading = Boolean(
    section.title?.trim() || section.body?.trim(),
  );
  return (
    <div className="shop-builder-section-content builder-preview-slider">
      {showSliderHeading && (
        <div className="shop-builder-slider-heading">
          <p className="shop-builder-eyebrow">
            <GalleryHorizontal size={18} />
            {section.carouselSettings?.variant ?? "hero"} slider
          </p>
          {section.title?.trim() ? (
            <h2 className="shop-builder-title">{section.title}</h2>
          ) : null}
          {section.body?.trim() ? (
            <p className="shop-builder-body">{section.body}</p>
          ) : null}
        </div>
      )}
      <CarouselBlock
        slides={slides}
        settings={carousel.settings}
        breakpointPolicy={breakpointPolicy}
        className="builder-preview-carousel"
      />
    </div>
  );
},
// Only re-render when slides or carousel settings change, not on selection/hover state changes
(prev, next) => {
  return (
    prev.section.slides === next.section.slides &&
    prev.section.carouselSettings === next.section.carouselSettings &&
    prev.section.title === next.section.title &&
    prev.section.body === next.section.body
  );
});

function RenderDashboardChecklist({
  items,
  iconName = "check",
  colorScheme = "default",
  typography,
}: {
  items?: string[];
  iconName?: string;
  colorScheme?: string;
  typography?: any;
}) {
  if (!items || items.length === 0) return null;
  const isGradientCycle = colorScheme === "gradient-cycle";
  return (
    <ul
      className={`builder-preview-goodie-list-checklist ${isGradientCycle ? "is-icon-gradient-cycle" : ""}`}
      style={{
        listStyle: "none",
        padding: 0,
        margin: "12px 0",
        display: "grid",
        gap: "6px",
      }}
    >
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
          }}
        >
          {{
            check: <Check size={14} />,
            circleCheck: <CircleCheck size={14} />,
            arrowRight: <ArrowRight size={14} />,
            star: <Star size={14} />,
            heart: <Heart size={14} />,
            sparkles: <Sparkles size={14} />,
            shield: <ShieldCheck size={14} />,
          }[iconName] ?? <Check size={14} />}
          <DashboardTypog as="span" typography={typography}>
            {item}
          </DashboardTypog>
        </li>
      ))}
    </ul>
  );
}

const STORAGE_KEY = "react-shop-visual-builder-v1";
const STORAGE_BY_KEY = "react-shop-visual-builder-drafts-v2";
const STORAGE_DRAFT_METADATA = "react-shop-visual-builder-draft-metadata-v1";
const STORAGE_CUSTOM_PAGES = "react-shop-visual-builder-pages-v1";
const SIDEBAR_COLLAPSED_BREAKPOINT = 900;
type BuilderStorageKeys = {
  state: string;
  drafts: string;
  draftMetadata: string;
  pages: string;
  sidebarCollapsed: string;
};

const defaultBuilderStorageKeys: BuilderStorageKeys = {
  state: STORAGE_KEY,
  drafts: STORAGE_BY_KEY,
  draftMetadata: STORAGE_DRAFT_METADATA,
  pages: STORAGE_CUSTOM_PAGES,
  sidebarCollapsed: "react-shop-builder-sidebar-collapsed-v1",
};

function getBuilderStorageKeys(websiteId?: string): BuilderStorageKeys {
  if (!websiteId) return defaultBuilderStorageKeys;
  return {
    state: `${STORAGE_KEY}:${websiteId}`,
    drafts: `${STORAGE_BY_KEY}:${websiteId}`,
    draftMetadata: `${STORAGE_DRAFT_METADATA}:${websiteId}`,
    pages: `${STORAGE_CUSTOM_PAGES}:${websiteId}`,
    sidebarCollapsed: `react-shop-builder-sidebar-collapsed-v1:${websiteId}`,
  };
}

type BuilderDraftMetadata = Partial<
  Record<BuilderLayoutKey, { basePublishedSignature?: string }>
>;

function loadBuilderDraftMetadata(storageKey: string): BuilderDraftMetadata {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BuilderDraftMetadata;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function removeBuilderDraft(
  storageKeys: BuilderStorageKeys,
  page: BuilderLayoutKey,
) {
  try {
    const rawDrafts = window.localStorage.getItem(storageKeys.drafts);
    const drafts = rawDrafts
      ? (JSON.parse(rawDrafts) as Partial<Record<BuilderLayoutKey, BuilderState>>)
      : {};
    delete drafts[page];
    window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));

    const metadata = loadBuilderDraftMetadata(storageKeys.draftMetadata);
    delete metadata[page];
    window.localStorage.setItem(storageKeys.draftMetadata, JSON.stringify(metadata));
  } catch {
    // A failed browser-storage cleanup must not block the authoritative
    // persisted document from being shown.
  }
}

function getDefaultSidebarCollapsed() {
  if (typeof window === "undefined") return false;
  return window.innerWidth < SIDEBAR_COLLAPSED_BREAKPOINT;
}

function loadSidebarCollapsedPreference(storageKey: string) {
  if (typeof window === "undefined") return false;

  const stored = window.localStorage.getItem(storageKey);
  if (stored === "true") return true;
  if (stored === "false") return false;
  return getDefaultSidebarCollapsed();
}

const defaultShellSettings: BuilderShellSettings = {
  headerVisible: true,
  topToolbarVisible: true,
  topToolbarText: "Fast support & setup by Webpages",
  topToolbarPhone: "+374 xx xx xx",
  topToolbarMeta: "AMD ֏",
  headerBackgroundMode: "default",
  headerTextMode: "auto",
  headerLayout: "wordpress",
  headerBrandMode: "logo",
  headerBrandText: "WebPages",
  headerLogoUrl: null,
  headerLogoAlt: "Site logo",
  headerLogoMaxWidth: 160,
  headerButtonLabel: "Start",
  headerButtonUrl: "/client",
  headerIconVariant: "muted",
  headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
  headerActiveIndicator: "underline",
  headerBehavior: "sticky",
  headerTransparent: false,
  headerOverlay: false,
  headerWidthMode: "boxed",
  headerHeight: "comfortable",
  headerZIndex: 40,
  sectionPaddingTop: "lg",
  sectionPaddingBottom: "lg",
  sectionMarginTop: "none",
  sectionMarginBottom: "none",
  rowPaddingTop: "none",
  rowPaddingBottom: "none",
  rowMarginTop: "none",
  rowMarginBottom: "none",
  rowGap: "md",
  columnGap: "md",
  elementPaddingTop: "none",
  elementPaddingRight: "none",
  elementPaddingBottom: "none",
  elementPaddingLeft: "none",
  elementMarginTop: "none",
  elementMarginRight: "none",
  elementMarginBottom: "none",
  elementMarginLeft: "none",
  menuPresentation: {},
  storefrontPreset: "princity",
  primaryColor: "#111111",
  accentColor: "#111111",
  productCardRadius: "10px",
  productCardBg: "#ffffff",
  productCardShadow: "0 0 0 rgba(15, 23, 42, 0)",
  productCardShadowHover: "0 18px 40px rgba(15, 23, 42, 0.14)",
  productCardMinHeight: "0px",
  productCardMaxWidth: "100%",
  productImageWidth: "100%",
  productImageHeight: "260px",
  productImageMaxWidth: "100%",
  productImageMaxHeight: "100%",
  productImageAspectRatio: "auto",
  productImageNoPadding: false,
  productImagePadding: "clamp(22px, 2.4vw, 36px)",
  productImageObjectFit: "contain",
  buttonBg: "",
  buttonTextColor: "",
  buttonBorderRadius: "999px",
  buttonBorderWidth: "0px",
  buttonBorderColor: "transparent",
  buttonPaddingY: "11px",
  buttonPaddingX: "18px",
  buttonFontWeight: "720",
  buttonLetterSpacing: "0px",
  buttonHoverBg: "",
  buttonHoverTextColor: "",
  buttonHoverBorderColor: "transparent",
  buttonHoverEffect: "lift",
  menuItems: [
    { id: "home", label: "Home", url: "/" },
    { id: "shop", label: "Shop", url: "/shop" },
  ],
  namedMenus: [],
};

const defaultMenuPresentation: MenuPresentationSettings = {
  showHeading: false,
  icon: null,
  submenuLayout: "list",
  submenuColumns: 3,
  submenuWidth: null,
  mobileAccordion: true,
  badgeText: null,
};

const headerActionFromKind = (kind?: LayoutBlockKind): BuilderHeaderIconId | undefined => {
  if (kind === "headerSearch") return "search";
  if (kind === "headerWishlist") return "wishlist";
  if (kind === "headerCart") return "cart";
  if (kind === "headerAccount") return "account";
  if (kind === "headerTheme") return "theme";
  return undefined;
};

function normalizeMenuPresentation(
  value?: Partial<MenuPresentationSettings> | null,
): MenuPresentationSettings {
  const rawColumns = Number(value?.submenuColumns);

  return {
    showHeading:
      typeof value?.showHeading === "boolean" ? value.showHeading : false,
    icon:
      typeof value?.icon === "string" && value.icon.trim().length > 0
        ? value.icon.trim()
        : null,
    submenuLayout:
      value?.submenuLayout === "grid" || value?.submenuLayout === "mega"
        ? value.submenuLayout
        : "list",
    submenuColumns: Number.isFinite(rawColumns)
      ? Math.min(Math.max(Math.round(rawColumns), 1), 6)
      : defaultMenuPresentation.submenuColumns,
    submenuWidth:
      typeof value?.submenuWidth === "string" && value.submenuWidth.trim().length > 0
        ? value.submenuWidth.trim()
        : null,
    mobileAccordion: value?.mobileAccordion !== false,
    badgeText:
      typeof value?.badgeText === "string" && value.badgeText.trim().length > 0
        ? value.badgeText.trim()
        : null,
  };
}

function parseBuilderLayoutKey(value: string | null): BuilderLayoutKey | null {
  if (!value) return null;
  if (isBuilderCustomPageKey(value)) return value;
  return builderLayoutKeys.has(value as BuilderLayoutKey)
    ? (value as BuilderLayoutKey)
    : null;
}

const tenantCorePageKeys: Record<string, BuilderLayoutKey> = {
  cart: "page:cart",
  checkout: "page:checkout",
  "my-account": "page:my-account",
};

function isBuilderCustomPageKey(
  value: string | null,
): value is BuilderCustomPageKey {
  return /^page:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? "");
}

function slugifyPageTitle(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function getLayoutLabel(
  key: BuilderLayoutKey,
  customPages: BuilderCustomPage[],
) {
  if (layoutLabels[key]) {
    return layoutLabels[key] as string;
  }

  if (isBuilderCustomPageKey(key)) {
    return customPages.find((page) => page.key === key)?.title ?? "Custom Page";
  }

  return layoutLabels[key] ?? "Page";
}

function builderDocumentKindLabel(context: BuilderEditorContext | null) {
  if (!context) return "Page";
  if (context.document.kind === "routing-template") {
    return context.content.family === "product"
      ? "Single Product Template"
      : "Single Post Template";
  }
  if (context.document.kind === "individual") {
    return context.content.family === "product"
      ? "Individual Product Layout"
      : "Individual Post Layout";
  }
  if (context.document.kind === "header") return "Header";
  if (context.document.kind === "footer") return "Footer";
  return "Page";
}

function builderDocumentOwnershipLabel(context: BuilderEditorContext | null) {
  if (!context) return "";
  if (context.document.kind === "routing-template") {
    return `Used for: ${context.ownership.assignmentSummary ?? "Matching content"}`;
  }
  if (context.document.kind === "individual") {
    const assigned = context.ownership.assignedTemplate?.name;
    return assigned
      ? `Effective: Individual Layout · Assigned Template: ${assigned}`
      : "Effective: Individual Layout";
  }
  return context.document.kind === "page" ? "Page" : "Global site document";
}

function builderFrontendActionLabel(context: BuilderEditorContext | null) {
  if (!context) return "View Page";
  if (context.document.kind === "routing-template" || context.document.kind === "individual") {
    return context.content.family === "product" ? "View Product" : "View Post";
  }
  return context.document.kind === "page" ? "View Page" : "Open Frontend";
}

function ordinaryBuilderFrontendHref(
  page: BuilderLayoutKey,
  customPages: BuilderCustomPage[],
) {
  if (page === "home") return "/";
  if (page === "shop") return "/shop";
  if (page === "client") return "/client";
  if (page === "page:cart") return "/cart";
  if (page === "page:checkout") return "/checkout";
  if (page === "page:my-account") return "/my-account";
  if (isBuilderCustomPageKey(page)) {
    const slug = customPages.find((item) => item.key === page)?.slug;
    return slug ? `/${encodeURIComponent(slug)}` : null;
  }
  return null;
}

const lightScheme = {
  pageBackground: "#f7f7f4",
  textColor: "#111111",
  mutedTextColor: "#5f5f58",
  surfaceColor: "#efefe9",
  buttonBackground: "#111111",
  buttonTextColor: "#ffffff",
};

const darkScheme = {
  pageBackground: "#101010",
  textColor: "#f7f7f1",
  mutedTextColor: "#c8c8be",
  surfaceColor: "#24241f",
  buttonBackground: "#f7f7f1",
  buttonTextColor: "#101010",
};

function resolveDesignColors(
  design: BuilderDesign,
  resolvedScheme?: "light" | "dark",
) {
  if (design.colorScheme === "dark") {
    return { ...design, ...darkScheme };
  }

  if (design.colorScheme === "light") {
    return { ...design, ...lightScheme };
  }

  if (resolvedScheme === "dark") {
    return { ...design, ...darkScheme };
  }

  return design;
}

function sectionSchemeStyle(section: BuilderSection) {
  const colorScheme = resolveSectionColorScheme(section);
  const background = resolveSectionBackground(section).override;
  return getUikitSemanticContextVars(colorScheme, background) as CSSProperties;
}

function resolveSectionColorScheme(
  section: BuilderSection,
  layoutScheme: "light" | "dark" = "light",
): Exclude<SectionColorScheme, "inherit"> {
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return section.colorScheme;
  }

  const resolvedBackground = resolveSectionBackground(section);
  if (!resolvedBackground.override) return "light";
  const readable = readableSchemeForColor(resolvedBackground.override);
  return readable === "inherit" ? layoutScheme : readable;
}

function sectionColorModeLabel(
  section: BuilderSection,
  layoutScheme: "light" | "dark" = "light",
) {
  const resolved = resolveSectionColorScheme(section, layoutScheme);
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return resolved === "dark" ? "forced light text" : "forced dark text";
  }

  return resolved === "dark" ? "auto light text" : "auto dark text";
}

function readableSchemeForColor(color: string | undefined): SectionColorScheme {
  if (!color) return "inherit";
  const bg = color.trim().toLowerCase();
  if (bg === "transparent" || bg === "initial" || bg === "inherit") {
    return "inherit";
  }

  // Handle CSS Gradients by extracting hex/rgb colors and averaging their luminance
  if (bg.includes("gradient")) {
    const hexes = bg.match(/#[a-f\d]{3,8}/g) || [];
    const rgbs = bg.match(/rgba?\(\d+\s*,\s*\d+\s*,\s*\d+/g) || [];
    let totalLuminance = 0;
    let count = 0;

    for (const hex of hexes) {
      let h = hex.substring(1);
      if (h.length === 3 || h.length === 4) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      }
      if (h.length === 6 || h.length === 8) {
        const r = parseInt(h.substring(0, 2), 16);
        const g = parseInt(h.substring(2, 4), 16);
        const b = parseInt(h.substring(4, 6), 16);
        totalLuminance += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        count++;
      }
    }

    for (const rgb of rgbs) {
      const match = rgb.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        totalLuminance += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        count++;
      }
    }

    if (count > 0) {
      return totalLuminance / count < 0.48 ? "dark" : "light";
    }
  }

  // Handle Hex
  const hexMatch = bg.match(/^#?([a-f\d]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      return luminance < 0.48 ? "dark" : "light";
    }
  }

  // Handle RGB
  const rgbMatch = bg.match(
    /^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)$/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    if (a < 0.15) return "inherit";
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.48 ? "dark" : "light";
  }

  return "inherit";
}

const previewButtonsStyle = (
  layout?: "inline" | "stacked",
  align?: "left" | "center" | "right",
  gap?: string,
): CSSProperties =>
  ({
    display: "flex",
    width: "fit-content",
    maxWidth: "100%",
    marginLeft: align === "center" || align === "right" ? "auto" : undefined,
    marginRight: align === "center" ? "auto" : undefined,
    flexDirection: layout === "stacked" ? "column" : "row",
    flexWrap: "wrap",
    "--button-group-gap": gap || "0.75rem",
    gap: "var(--button-group-gap, 0.75rem)",
    justifyContent:
      align === "center"
        ? "center"
        : align === "right"
          ? "flex-end"
          : "flex-start",
    alignItems: "center",
  }) as CSSProperties;

const rowInsertionPresets = builderRowLayoutPresets;

const uikitPresetGroups = [
  {
    title: "Equal Widths",
    keys: ["1-col", "2-col-equal", "3-col-equal", "4-col-equal", "5-col-equal", "6-col-equal"],
  },
  {
    title: "Asymmetric Proportions",
    keys: [
      "thirds-2-1",
      "thirds-1-2",
      "quarters-3-1",
      "quarters-1-3",
      "quarters-2-1-1",
      "quarters-1-1-2",
      "quarters-1-2-1",
      "fifths-2-3",
      "fifths-3-2",
      "fifths-1-4",
      "fifths-4-1",
      "fifths-3-1-1",
      "fifths-1-1-3",
      "fifths-1-3-1",
      "fifths-2-1-1-1",
      "fifths-1-1-1-2",
      "sixths-1-5",
      "sixths-5-1",
    ],
  },
  {
    title: "Fixed & Expanding",
    keys: ["fixed-left", "fixed-right", "fixed-inner", "fixed-outer", "auto-expand"],
  },
];

function UikitPresetWireframeDiagram({ presetKey }: { presetKey: string }) {
  const normalizedKey = normalizeLayoutToUikitPreset(presetKey);
  const preset = UIKIT_LAYOUT_PRESETS[normalizedKey];

  return (
    <div className="builder-preset-wireframe-container" aria-hidden="true">
      {preset.columnClasses.map((cls, index) => {
        let flexVal = "1";
        let showArrow = false;

        if (preset.key === "1-col") flexVal = "1";
        else if (preset.key === "2-col-equal") flexVal = "1";
        else if (preset.key === "3-col-equal") flexVal = "1";
        else if (preset.key === "4-col-equal") flexVal = "1";
        else if (preset.key === "5-col-equal") flexVal = "1";
        else if (preset.key === "6-col-equal") flexVal = "1";
        else if (preset.key === "thirds-2-1") flexVal = index === 0 ? "2" : "1";
        else if (preset.key === "thirds-1-2") flexVal = index === 0 ? "1" : "2";
        else if (preset.key === "quarters-3-1") flexVal = index === 0 ? "3" : "1";
        else if (preset.key === "quarters-1-3") flexVal = index === 0 ? "1" : "3";
        else if (preset.key === "quarters-2-1-1") flexVal = index === 0 ? "2" : "1";
        else if (preset.key === "quarters-1-1-2") flexVal = index === 2 ? "2" : "1";
        else if (preset.key === "quarters-1-2-1") flexVal = index === 1 ? "2" : "1";
        else if (preset.key === "fifths-2-3") flexVal = index === 0 ? "2" : "3";
        else if (preset.key === "fifths-3-2") flexVal = index === 0 ? "3" : "2";
        else if (preset.key === "fifths-1-4") flexVal = index === 0 ? "1" : "4";
        else if (preset.key === "fifths-4-1") flexVal = index === 0 ? "4" : "1";
        else if (preset.key === "fifths-3-1-1") flexVal = index === 0 ? "3" : "1";
        else if (preset.key === "fifths-1-1-3") flexVal = index === 2 ? "3" : "1";
        else if (preset.key === "fifths-1-3-1") flexVal = index === 1 ? "3" : "1";
        else if (preset.key === "fifths-2-1-1-1") flexVal = index === 0 ? "2" : "1";
        else if (preset.key === "fifths-1-1-1-2") flexVal = index === 3 ? "2" : "1";
        else if (preset.key === "sixths-1-5") flexVal = index === 0 ? "1" : "5";
        else if (preset.key === "sixths-5-1") flexVal = index === 0 ? "5" : "1";
        else if (preset.key === "fixed-left") {
          flexVal = index === 0 ? "0 0 24%" : "1";
          if (index === 1) showArrow = true;
        } else if (preset.key === "fixed-right") {
          flexVal = index === 0 ? "1" : "0 0 24%";
          if (index === 0) showArrow = true;
        } else if (preset.key === "fixed-inner") {
          flexVal = index === 1 ? "0 0 24%" : "1";
          if (index === 0 || index === 2) showArrow = true;
        } else if (preset.key === "fixed-outer") {
          flexVal = index === 1 ? "1" : "0 0 24%";
          if (index === 1) showArrow = true;
        } else if (preset.key === "auto-expand") {
          flexVal = index === 0 ? "0 0 28%" : "1";
          if (index === 1) showArrow = true;
        }

        return (
          <div
            key={`${preset.key}-${index}`}
            className="builder-preset-wireframe-col"
            style={{ flex: flexVal }}
          >
            {showArrow ? (
              <span className="builder-preset-wireframe-arrow">← →</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function blockButtonCssVars(block: BuilderLayoutBlock): CSSProperties {
  return builderButtonOverrideCssVars(block);
}

function cssSpacingValue(value: string | null | undefined) {
  const trimmed = (value ?? "").toString().trim();
  if (!trimmed) return null;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return `${trimmed}px`;
  if (/^-?\d+(\.\d+)?(px|rem|em|%|vw|vh|svh|dvh)$/.test(trimmed))
    return trimmed;
  if (/^clamp\([^)]+\)$/.test(trimmed)) return trimmed;
  return null;
}

function gridSpacingClass(
  value: string | null | undefined,
  presets: readonly string[],
  fallback: string,
) {
  const key = (value || fallback).toString().trim().toLowerCase();
  return presets.includes(key) ? key : "custom";
}

function inferTypographyArea(
  tagName: string,
  className?: string,
): TypographyArea {
  const tag = tagName.toLowerCase();
  const classHint = String(className || "").toLowerCase();

  if (classHint.includes("eyebrow")) return "eyebrow";
  if (classHint.includes("cta") || tag === "a" || tag === "button") {
    return "button";
  }
  if (/^h[1-6]$/.test(tag) || tag === "strong" || tag === "em") {
    return "title";
  }
  return "body";
}

function getDefaultStateForKey(key: BuilderLayoutKey): BuilderState {
  if (key === "header") {
    const defaultHeaderSection = headerPresets.find((preset) => preset.key === "minimal")?.sections[0];
    return {
      ...structuredClone(defaultState),
      page: "header",
      targetType: "header",
      template: undefined,
      sections: [structuredClone(defaultHeaderSection ?? {
        id: "header-document",
        kind: "contentLayout",
        title: "Header",
        background: "transparent",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "header-row",
        layoutColumns: 1,
        headerUtilityMigrationVersion: 3,
        layoutItems: [],
        visible: true,
      })],
    };
  }

  if (key === "footer") {
    return {
      ...structuredClone(defaultState),
      page: "footer",
      targetType: "footer",
      template: undefined,
      sections: [
        {
          id: "footer-document",
          kind: "contentLayout",
          title: "Footer",
          background: "#111111",
          backgroundMode: "full",
          contentMode: "boxed",
          colorScheme: "dark",
          topSpacing: "sm",
          bottomSpacing: "sm",
          layout: "halves",
          layoutColumns: 2,
          layoutItems: [
            {
              id: "footer-main-left",
              rowId: "footer-main-row",
              rowLayout: "halves",
              blocks: [{ id: "footer-copyright", kind: "text", body: "© 2025 Webpages · Headless WooCommerce demo" }],
            },
            {
              id: "footer-main-right",
              rowId: "footer-main-row",
              rowLayout: "halves",
              blocks: [{ id: "footer-platform", kind: "text", body: "Powered by WordPress · WooCommerce · WPGraphQL · Next.js" }],
            },
          ],
          visible: true,
        },
      ],
    };
  }

  if (key in defaultTemplateStates) {
    return structuredClone(defaultTemplateStates[key as BuilderTemplate]);
  }

  if (
    key === "page:cart" ||
    key === "page:checkout" ||
    key === "page:my-account"
  ) {
    const title =
      key === "page:cart"
        ? "Cart"
        : key === "page:checkout"
          ? "Checkout"
          : "My account";
    const slotKind =
      key === "page:cart"
        ? "cartContent"
        : key === "page:checkout"
          ? "checkoutContent"
          : "accountContent";

    return {
      ...structuredClone(defaultState),
      page: key,
      targetType: "page",
      template: undefined,
      sections: [
        {
          id: `${key}-content`,
          kind: "contentLayout",
          title,
          eyebrow: "WooCommerce page",
          body: "Keep the functional store content in place, then customize the surrounding layout.",
          background: "#ffffff",
          backgroundMode: "boxed",
          contentMode: "boxed",
          colorScheme: "inherit",
          layout: "whole",
          layoutColumns: 1,
          layoutItems: [
            {
              id: `${key}-slot`,
              blocks: [
                {
                  id: `${key}-slot-block`,
                  kind: slotKind,
                  title: `${title} content`,
                  body: `Live ${title.toLowerCase()} UI rendered from the React storefront.`,
                },
              ],
            },
          ],
          visible: true,
        },
      ],
    };
  }

  if (isBuilderCustomPageKey(key)) {
    const title = key
      .replace(/^page:/, "")
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

    return {
      ...structuredClone(defaultState),
      page: key,
      targetType: "page",
      template: undefined,
      sections: [
        {
          id: `${key}-content`,
          kind: "contentLayout",
          title: "Page introduction",
          background: "#f7f7f4",
          backgroundMode: "full",
          contentMode: "boxed",
          colorScheme: "inherit",
          layout: "whole",
          layoutColumns: 1,
          topSpacing: "medium",
          bottomSpacing: "medium",
          layoutItems: [{
            id: `${key}-content-column`,
            rowId: `${key}-content-row`,
            rowLayout: "whole",
            blocks: [{
              id: `${key}-hero`,
              kind: "hero",
              eyebrow: "New page",
              title,
              body: "Introduce this page with a clear headline, useful context, and a focused next step.",
              buttonLabel: "Get Started",
              buttonUrl: "#",
              buttonStyle: "primary",
              elementPadding: "lg",
            }],
          }],
          visible: true,
        },
      ],
    };
  }

  return {
    ...structuredClone(defaultState),
    page: key,
    targetType: "page",
    template: undefined,
  };
}

function hydrateDocumentBuilderState(
  state: BuilderState,
  settings: BuilderShellSettings,
): BuilderState {
  if (state.page !== "header" && state.page !== "footer") return state;
  const normalized = state.targetType === state.page
    ? state
    : { ...state, targetType: state.page };
  if (state.page !== "header" || normalized.sections[0]?.headerArchitectureVersion === 2) {
    return normalized;
  }
  const [header, ...rest] = normalized.sections;
  if (!header) return normalized;
  const shouldSeedLegacyBranding = header.headerArchitectureVersion === undefined;
  return {
    ...normalized,
    sections: [{
      ...header,
      headerArchitectureVersion: 2,
      headerVisible: header.headerVisible ?? settings.headerVisible,
      headerTransparent: header.headerTransparent ?? settings.headerTransparent,
      headerOverlay: header.headerOverlay ?? settings.headerOverlay,
      headerHeight: header.headerHeight ?? settings.headerHeight,
      headerCustomHeight: header.headerCustomHeight ?? settings.headerCustomHeight,
      headerLayout: header.headerLayout ?? settings.headerLayout,
      headerBehavior: header.headerBehavior ?? settings.headerBehavior,
      headerWidthMode: header.headerWidthMode ?? settings.headerWidthMode,
      headerBackgroundMode: header.headerBackgroundMode ?? settings.headerBackgroundMode,
      headerTextMode: header.headerTextMode ?? settings.headerTextMode,
      headerZIndex: header.headerZIndex ?? settings.headerZIndex,
      headerTopToolbarVisible: header.headerTopToolbarVisible ?? settings.topToolbarVisible,
      headerTopToolbarText: header.headerTopToolbarText ?? settings.topToolbarText,
      headerTopToolbarPhone: header.headerTopToolbarPhone ?? settings.topToolbarPhone,
      headerTopToolbarMeta: header.headerTopToolbarMeta ?? settings.topToolbarMeta,
      ...(shouldSeedLegacyBranding
        ? {
            layoutItems: (header.layoutItems ?? []).map((item) => ({
              ...item,
              blocks: (item.blocks ?? []).map((block) =>
                block.kind === "image" || block.id === "header-logo"
                  ? {
                      ...block,
                      imageUrl: block.imageUrl ?? settings.headerLogoUrl,
                      imageAlt: block.imageAlt ?? settings.headerLogoAlt,
                      imageMaxWidth: block.imageMaxWidth ?? settings.headerLogoMaxWidth,
                      headerBrandMode: block.headerBrandMode ?? settings.headerBrandMode,
                      headerBrandText:
                        block.headerBrandText === "WebPages" || !block.headerBrandText
                          ? settings.headerBrandText
                          : block.headerBrandText,
                    }
                  : block,
              ),
            })),
          }
        : {}),
    } as BuilderSection, ...rest],
  };
}

function loadInitialState(
  storageKeys: BuilderStorageKeys = defaultBuilderStorageKeys,
): BuilderState {
  if (typeof window === "undefined") return defaultState;

  try {
    const drafts = window.localStorage.getItem(storageKeys.drafts);
    if (drafts) {
      const parsedDrafts = JSON.parse(drafts) as Partial<
        Record<BuilderLayoutKey, BuilderState>
      >;
      const shopDraft = parsedDrafts.shop;
      if (shopDraft?.sections?.length) {
        return normalizeBuilderState(shopDraft, "shop");
      }
    }
  } catch {
    // A malformed scoped draft must not block the authoritative published
    // document load below.
  }

  // This site-wide last-rendered snapshot is not a page-scoped draft. It can
  // be an old import after a persisted document is restored elsewhere.
  return defaultState;
}

function normalizeBuilderState(
  state: BuilderState,
  fallbackKey: BuilderLayoutKey,
): BuilderState {
  const key = state.page ?? fallbackKey;
  const isTemplate = key in defaultTemplateStates;
  const migratedSections =
    key === "product-single"
      ? migrateProductTemplateSections(state.sections)
      : state.sections;
  const headerBlockIds = new Set<string>();
  const sections = migratedSections
    .map(normalizeScrollPinnedDemoSection)
    .map((section) => ({
      ...section,
      layoutItems: section.layoutItems?.map((item) => ({
        ...item,
        blocks: (item.blocks ?? []).map((block, blockIndex) => {
          if (key === "header") {
            const baseId = block.id?.trim() ||
              `header-${block.kind ?? "element"}-${item.id ?? "column"}-${blockIndex}`;
            let canonicalId = baseId;
            let suffix = 2;
            while (headerBlockIds.has(canonicalId)) {
              canonicalId = `${baseId}-${suffix}`;
              suffix += 1;
            }
            headerBlockIds.add(canonicalId);
            if (block.id !== canonicalId) block = { ...block, id: canonicalId };
          }
          if (block.kind === "grid") {
            const gridStyle = UIKIT_YOOTHEME_BUTTON_VARIANTS.includes(
              block.buttonStyle as typeof UIKIT_YOOTHEME_BUTTON_VARIANTS[number],
            )
              ? block.buttonStyle
              : undefined;
            const legacyImportedItemStyles = (block.gridItems ?? [])
              .filter((gridItem) => gridItem.buttonStyleSource !== "item")
              .map((gridItem) => gridItem.buttonStyle)
              .filter((style): style is typeof UIKIT_YOOTHEME_BUTTON_VARIANTS[number] => UIKIT_YOOTHEME_BUTTON_VARIANTS.includes(
                style as typeof UIKIT_YOOTHEME_BUTTON_VARIANTS[number],
              ));
            const hasUniformLegacyImportedStyle = Boolean(block.id?.startsWith("yootheme-grid-"))
              && legacyImportedItemStyles.length === (block.gridItems ?? []).length
              && new Set(legacyImportedItemStyles).size === 1;
            const gridItems = (block.gridItems ?? []).map((gridItem) => {
              const itemStyleIsValid = UIKIT_YOOTHEME_BUTTON_VARIANTS.includes(
                gridItem.buttonStyle as typeof UIKIT_YOOTHEME_BUTTON_VARIANTS[number],
              );
              // Recover documents created by the short-lived importer bug:
              // it copied the Grid-owned style onto every item. Equal values
              // without explicit source provenance are inherited, not item
              // overrides, so the Grid Link control remains authoritative.
              if (gridItem.buttonStyleSource !== "item" && itemStyleIsValid && (
                gridItem.buttonStyle === gridStyle || hasUniformLegacyImportedStyle
              )) {
                const { buttonStyle: _inheritedCopy, ...inheritedItem } = gridItem;
                return inheritedItem;
              }
              return gridItem;
            });
            return {
              ...block,
              ...(gridStyle ? { buttonStyle: gridStyle } : {}),
              ...(block.spacingContract === "yootheme" && block.contentMarginTop === undefined
                ? { contentMarginTop: "small" }
                : {}),
              gridItems,
            } as BuilderLayoutBlock;
          }
          if (block.kind === "panel") {
            const {
              panelStyle,
              cardPreset,
              premiumCardStyle,
              borderRadius,
              elementBackgroundMode,
              elementBackground,
              elementPadding,
              hoverPreset,
              cardStyle,
              ...semanticPanel
            } = block;
            void cardPreset;
            void premiumCardStyle;
            void borderRadius;
            void elementBackgroundMode;
            void elementBackground;
            void cardStyle;
            const rawVariant = String(
              block.panelVariant ?? panelStyle ?? "default",
            ).toLowerCase();
            const panelVariant =
              rawVariant === "primary" ||
              rawVariant === "secondary" ||
              rawVariant === "blank" ||
              rawVariant === "tile-default" ||
              rawVariant === "tile-muted" ||
              rawVariant === "tile-primary" ||
              rawVariant === "tile-secondary" ||
              rawVariant === "panel"
                ? rawVariant === "panel"
                  ? "blank"
                  : rawVariant
                : "default";
            const panelSize =
              block.panelSize === "none"
                ? "none"
                : block.panelSize === "small" || elementPadding === "sm"
                ? "small"
                : block.panelSize === "large" ||
                    elementPadding === "lg" ||
                    elementPadding === "xl"
                  ? "large"
                  : "default";
            return {
              ...semanticPanel,
              panelVariant,
              panelHover: block.panelHover ?? hoverPreset !== "none",
              panelSize,
              panelShowMedia: block.panelShowMedia ?? true,
              panelMediaPlacement: ["top", "bottom", "left", "right", "between"].includes(block.panelMediaPlacement ?? "")
                ? block.panelMediaPlacement
                : "top",
              panelMediaFit: block.imageFit ?? block.panelMediaFit,
              panelMediaWidth: ["auto", "4-5", "3-4", "2-3", "3-5", "1-2", "2-5", "1-3", "1-4", "1-5", "small", "medium", "large", "xlarge", "2xlarge"].includes(block.panelMediaWidth as string) ? block.panelMediaWidth : "medium",
              panelMediaAlignment: (block.imageAlignment ?? block.panelMediaAlignment) === "left" || (block.imageAlignment ?? block.panelMediaAlignment) === "right" ? (block.imageAlignment ?? block.panelMediaAlignment) : "center",
              panelVerticalAlign: block.panelVerticalAlign === "center" || block.panelVerticalAlign === "bottom" ? block.panelVerticalAlign : "top",
              panelMediaVerticalAlign: block.panelMediaVerticalAlign === "center" || block.panelMediaVerticalAlign === "bottom" ? block.panelMediaVerticalAlign : "top",
              panelTitleElement: ["h1", "h2", "h3", "h4", "h5", "h6", "div"].includes(block.panelTitleElement as string) ? block.panelTitleElement : "h3",
              panelTitleStyle: typeof block.panelTitleStyle === "string" && block.panelTitleStyle.length > 0 ? block.panelTitleStyle : "inherit",
              panelContentWidth: block.panelContentWidth === "small" || block.panelContentWidth === "medium" || block.panelContentWidth === "large" || block.panelContentWidth === "full" ? block.panelContentWidth : "auto",
              panelActionVisible: block.panelActionVisible ?? true,
              panelActionStyle: UIKIT_YOOTHEME_BUTTON_VARIANTS.includes(block.panelActionStyle as typeof UIKIT_YOOTHEME_BUTTON_VARIANTS[number])
                ? block.panelActionStyle
                : "primary",
              panelActionSize: block.panelActionSize === "small" || block.panelActionSize === "large" ? block.panelActionSize : "default",
              panelActionAlign: block.panelActionAlign === "left" || block.panelActionAlign === "center" || block.panelActionAlign === "right" ? block.panelActionAlign : "inherit",
              panelImageNoPadding: block.panelImageNoPadding,
              panelHeightExpand: block.panelHeightExpand === true,
              panelExpand: block.panelExpand === "image" || block.panelExpand === "content" || block.panelExpand === "both" ? block.panelExpand : "none",
              panelMetaPosition: block.panelMetaPosition === "above-title" || block.panelMetaPosition === "above-content" || block.panelMetaPosition === "below-content" ? block.panelMetaPosition : "below-title",
              linkPanel: block.linkPanel === true,
            } as BuilderLayoutBlock;
          }
          if (block.kind === "list") {
            const { listIcon, listIconColorScheme, listIconSize, ...semanticList } = block;
            void listIcon;
            void listIconColorScheme;
            void listIconSize;
            const listItems = block.listItems?.length
              ? block.listItems
              : (block.items ?? []).map((text, index) => ({
                  id: `${block.id ?? "list"}-item-${index + 1}`,
                  text,
                }));
            return {
              ...semanticList,
              listItems,
              listPresentation: block.listPresentation === "bullet" || block.listPresentation === "divider" || block.listPresentation === "striped" || block.listPresentation === "large" ? block.listPresentation : "default",
              listMarker: block.listMarker === "disc" || block.listMarker === "circle" || block.listMarker === "square" ? block.listMarker : "none",
              listAlign: block.listAlign === "center" || block.listAlign === "right" ? block.listAlign : "left",
              listSpacing: block.listSpacing === "compact" || block.listSpacing === "large" ? block.listSpacing : "default",
            } as BuilderLayoutBlock;
          }
          if (block.kind !== "button") return block;
          const {
            buttonBg,
            buttonTextColor,
            buttonBorderRadius,
            buttonBorderWidth,
            buttonBorderColor,
            buttonPaddingY,
            buttonPaddingX,
            buttonFontWeight,
            buttonLetterSpacing,
            buttonHoverBg,
            buttonHoverTextColor,
            buttonHoverBorderColor,
            buttonHoverTransform,
            buttonHoverBoxShadow,
            buttonHoverEffect,
            secondaryButtonLabel,
            secondaryButtonUrl,
            secondaryButtonTarget,
            secondaryButtonStyle,
            premiumButtonStyle,
            premiumCardStyle,
            buttonsLayout,
            buttonGap,
            elementAlign,
            elementPadding,
            elementBackgroundMode,
            typography,
            ...semanticButton
          } = block;
          void buttonBg;
          void buttonTextColor;
          void buttonBorderRadius;
          void buttonBorderWidth;
          void buttonBorderColor;
          void buttonPaddingY;
          void buttonPaddingX;
          void buttonFontWeight;
          void buttonLetterSpacing;
          void buttonHoverBg;
          void buttonHoverTextColor;
          void buttonHoverBorderColor;
          void buttonHoverTransform;
          void buttonHoverBoxShadow;
          void buttonHoverEffect;
          void secondaryButtonLabel;
          void secondaryButtonUrl;
          void secondaryButtonTarget;
          void secondaryButtonStyle;
          void premiumButtonStyle;
          void premiumCardStyle;
          void buttonsLayout;
          void buttonGap;
          void elementAlign;
          void elementPadding;
          void elementBackgroundMode;
          void typography;
          const rawButtonStyle = block.buttonStyle as string | undefined;
          const normalizedButtonStyle =
            rawButtonStyle === "primary" ||
            rawButtonStyle === "secondary" ||
            rawButtonStyle === "default" ||
            rawButtonStyle === "text"
              ? rawButtonStyle
              : "default";
          return {
            ...semanticButton,
            buttonStyle: normalizedButtonStyle,
            buttons: block.buttons?.map((button) => ({
              ...button,
              style:
                (button.style as string | undefined) === "primary" ||
                (button.style as string | undefined) === "secondary" ||
                (button.style as string | undefined) === "default" ||
                (button.style as string | undefined) === "text"
                  ? (button.style as string)
                  : "default",
            })),
            size: block.size ?? "default",
          } as BuilderLayoutBlock;
        }),
      })),
    }));
  return {
    ...state,
    page: key,
    targetType:
      key === "header" || key === "footer"
        ? key
        : key.startsWith("dynamic:")
          ? "document"
        : isTemplate
          ? "template"
          : "page",
    template: isTemplate ? (key as BuilderTemplate) : undefined,
    sections,
    // A YOOtheme page has no WebPages page-design-preset equivalent. Its
    // imported sections inherit the canonical website Global Styles owner,
    // rather than silently receiving the current Princity document defaults.
    // Native documents retain their existing preset hydration unchanged.
    design: hasYoothemeImportContract({ sections })
      ? {}
      : {
          ...defaultDesign,
          ...(state.design ?? {}),
        },
  };
}

function migrateProductTemplateSections(sections: BuilderSection[]) {
  return sections.map((section) => {
    if (!isLayoutContainerSection(section)) return section;

    return {
      ...section,
      layoutItems: section.layoutItems?.map((item) => ({
        ...item,
        blocks: (item.blocks ?? []).flatMap((block) => {
          const blockId = block.id ?? "";
          if (block.kind !== "text") return [block];

          if (
            block.kind === "text" &&
            (blockId.includes("product-media") ||
              block.title === "Product Gallery Slot")
          ) {
            return [createProductDynamicBlock("productGallery")];
          }

          if (
            block.kind === "text" &&
            (blockId.includes("product-summary") ||
              block.title === "Product Info Slot")
          ) {
            return [
              createProductDynamicBlock("productTitle"),
              createProductDynamicBlock("productPrice"),
              createProductDynamicBlock("productAddToCart"),
              createProductDynamicBlock("productAttributes"),
              createProductDynamicBlock("productDescription"),
            ];
          }

          return [block];
        }),
      })),
    };
  });
}

function isLayoutContainerSection(section: BuilderSection | null | undefined) {
  return (
    section?.kind === "contentLayout" ||
    section?.kind === "hero" ||
    section?.kind === "scrollPinnedDemo"
  );
}

function normalizeScrollPinnedDemoSection(
  section: BuilderSection,
): BuilderSection {
  const hasEditableBlocks = (section.layoutItems ?? []).some(
    (item) => (item.blocks ?? []).length > 0,
  );
  if (section.kind !== "scrollPinnedDemo" || hasEditableBlocks) {
    return section;
  }

  const rowId = `${section.id}-story-row`;
  const slides = section.slides?.length
    ? section.slides
    : [
        {
          id: `${section.id}-story-card-1`,
          badge: "01",
          title: "Layout Intercepted",
          text: "The section holds position while scroll movement drives the reveal.",
        },
        {
          id: `${section.id}-story-card-2`,
          badge: "02",
          title: "Timeline Scrubbing",
          text: "Each panel appears from normal reusable builder content.",
        },
        {
          id: `${section.id}-story-card-3`,
          badge: "03",
          title: "Scroll Release",
          text: "After the stack completes, the page resumes normal scrolling.",
        },
      ];

  return {
    ...section,
    layout: section.layout ?? "thirds-1-2",
    layoutColumns: section.layoutColumns ?? 2,
    layoutItems: [
      {
        id: `${section.id}-story-copy`,
        rowId,
        rowLayout: "thirds-1-2",
        blocks: [
          {
            id: `${section.id}-story-heading`,
            kind: "text",
            eyebrow: section.eyebrow,
            title: section.title,
            body: section.body,
            elementBackgroundMode: "transparent",
          },
          {
            id: `${section.id}-story-list`,
            kind: "list",
            listIcon: "circleCheck",
            items: [
              "Reusable dashboard elements",
              "Editable card stack",
              "Scroll-scrubbed progress",
            ],
            elementBackgroundMode: "transparent",
          },
        ],
      },
      {
        id: `${section.id}-story-cards`,
        rowId,
        rowLayout: "thirds-1-2",
        blocks: slides.map((slide, index) => ({
          id: `${slide.id ?? `${section.id}-story-card-${index + 1}`}-block`,
          kind: "panel",
          eyebrow: slide.badge ?? `0${index + 1}`,
          title: slide.title,
          body: slide.text,
          buttonLabel: slide.buttonLabel,
          buttonUrl: slide.buttonUrl,
          imageUrl: slide.imageUrl,
          imageAlt: slide.imageAlt,
          elementBackgroundMode: "transparent",
        })),
      },
    ],
  };
}

function createProductDynamicBlock(
  kind: Extract<LayoutBlockKind, `product${string}`>,
) {
  return {
    id: createBlockId(kind),
    kind,
    title: layoutBlockLabels[kind],
    body: `Dynamic field: ${layoutBlockLabels[kind].toLowerCase()}.`,
  };
}

function loadDraftForKey(
  key: BuilderLayoutKey,
  storageKeys: BuilderStorageKeys = defaultBuilderStorageKeys,
): BuilderState {
  if (typeof window === "undefined") return getDefaultStateForKey(key);

  try {
    const raw = window.localStorage.getItem(storageKeys.drafts);
    if (!raw) return getDefaultStateForKey(key);
    const drafts = JSON.parse(raw) as Partial<
      Record<BuilderLayoutKey, BuilderState>
    >;
    const draft = drafts[key];
    if (!draft?.sections?.length) return getDefaultStateForKey(key);
    return normalizeBuilderState(draft, key);
  } catch {
    return getDefaultStateForKey(key);
  }
}

const sampleProducts = [
  "Wool Blend Coat",
  "Biker Ankle Boots",
  "Brown Calfskin Boots",
  "Relaxed Shirt",
  "Pleated Mini Skirt",
  "Classic Tote Bag",
];

function formatPreviewPrice(price: string | null | undefined) {
  if (!price) return "";
  const parsed = Number.parseFloat(price);
  if (Number.isNaN(parsed)) return price;
  return `${parsed.toLocaleString("en-US", { maximumFractionDigits: 0 })} ֏`;
}

function getPreviewProductAttributes(product: ProductNode) {
  return (product.attributes?.nodes ?? [])
    .flatMap((attribute) => attribute.options ?? [])
    .filter(Boolean)
    .slice(0, 2);
}

function getPreviewProductModel(previewProducts: ProductNode[]) {
  const product =
    previewProducts.find((item) => item.image?.sourceUrl) ?? previewProducts[0];
  const priceNumber =
    product?.price && !Number.isNaN(Number.parseFloat(product.price))
      ? Number.parseFloat(product.price)
      : 30;

  return {
    id: product?.id ?? "preview-product",
    slug: product?.slug ?? "preview-product",
    name: product?.name ?? "Pink Jumper",
    priceNumber,
    priceFormatted: formatPreviewPrice(product?.price) || `${priceNumber} ֏`,
    imageUrl: product?.image?.sourceUrl,
    imageAlt: product?.image?.altText ?? product?.name ?? "Preview product",
    attributes: product?.attributes?.nodes
      ?.map((attribute) => ({
        name: attribute.name,
        label: attribute.label ?? attribute.name,
        options: (attribute.options ?? []).filter(Boolean),
      }))
      .filter((attribute) => attribute.options.length > 0) ?? [
      { name: "size", label: "Size", options: ["one-size"] },
      { name: "color", label: "Color", options: ["pink"] },
    ],
    description:
      "Live product description from WooCommerce appears here in the real product template.",
  };
}

function mergeBrandingIntoPreset(
  currentSections: BuilderSection[],
  presetSections: BuilderSection[],
): BuilderSection[] {
  let currentLogoBlock: any = null;
  for (const s of currentSections) {
    for (const item of s.layoutItems ?? []) {
      for (const block of item.blocks ?? []) {
        if (block.id === "header-logo" || (block.kind === "image" && block.headerBrandMode)) {
          currentLogoBlock = block;
          break;
        }
      }
      if (currentLogoBlock) break;
    }
    if (currentLogoBlock) break;
  }

  if (!currentLogoBlock) {
    return presetSections;
  }

  return presetSections.map(section => ({
    ...section,
    layoutItems: (section.layoutItems ?? []).map(item => ({
      ...item,
      blocks: (item.blocks ?? []).map(block => {
        if (block.id === "header-logo" || (block.kind === "image" && block.headerBrandMode)) {
          return {
            ...block,
            imageUrl: currentLogoBlock.imageUrl ?? block.imageUrl,
            imageAlt: currentLogoBlock.imageAlt ?? block.imageAlt,
            imageMaxWidth: currentLogoBlock.imageMaxWidth ?? block.imageMaxWidth,
            headerBrandMode: currentLogoBlock.headerBrandMode ?? block.headerBrandMode,
            headerBrandText: currentLogoBlock.headerBrandText ?? block.headerBrandText,
          };
        }
        return block;
      }),
    })),
  }));
}

export type DashboardBuilderProps = {
  menuTree?: MenuItem[];
  websiteId?: string;
  websiteRouteSegment?: string;
  websitePrimaryDomain?: string | null;
  saasUserRole?: SaaSUserRole;
  primaryContentLanguage?: string;
  enabledContentLanguages?: string[];
  /** Server-provided CMS origin for canonical imported WordPress media URLs. */
  wordpressMediaOrigin?: string | null;
  initialPageHydration?: {
    authoredLayout: BuilderLayout | null;
    renderLayout: BuilderLayout | null;
  };
};

export default function DashboardBuilder({
  menuTree = [],
  websiteId,
  websiteRouteSegment = websiteId,
  websitePrimaryDomain,
  saasUserRole,
  primaryContentLanguage = "hy",
  enabledContentLanguages = [primaryContentLanguage],
  wordpressMediaOrigin = null,
  initialPageHydration,
}: DashboardBuilderProps) {
  const router = useRouter();
  const { locale, setLocale, t } = useTranslation();
  const { theme: storefrontTheme } = useTheme();
  const [contentLanguage, setContentLanguage] = useState(primaryContentLanguage);
  // Inspector callbacks can remain mounted while the active editing locale
  // changes. Keep the mutation boundary on the current locale rather than a
  // callback's previous render snapshot.
  const contentLanguageRef = useRef(contentLanguage);
  contentLanguageRef.current = contentLanguage;
  const previewLanguageStorageKey = useMemo(
    () => `builder_preview_language_${websiteId ?? "root"}`,
    [websiteId],
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [activeDynamicDocumentId, setActiveDynamicDocumentId] = useState<string | null>(null);
  const [contextualLibraryOpen, setContextualLibraryOpen] = useState(false);
  const [contextualLibraryType, setContextualLibraryType] =
    useState<LayoutLibraryType>("section");
  const [contextualLibraryTarget, setContextualLibraryTarget] = useState<{
    page: BuilderLayoutKey;
    sectionId: string | null;
    rowId: string | null;
    columnKey: string | null;
    blockKey: string | null;
  } | null>(null);
  const [activeRoutingTemplateId, setActiveRoutingTemplateId] = useState<string | null>(null);
  const [activeIndividualContextToken, setActiveIndividualContextToken] = useState<string | null>(null);
  const ordinaryLoadRequestRef = useRef(0);
  const ordinaryLoadIdentityRef = useRef("");
  const initialHydrationConsumedRef = useRef("");
  const initializedStorageScopeRef = useRef<string | null>(null);
  const strictBuilderTargetRef = useRef(false);
  const shellTransitionRef = useRef<{
    direction: "enter" | "exit";
    page: BuilderLayoutKey;
  } | null>(null);
  const strictBuilderTargetIdentityRef = useRef("");
  const strictBuilderTargetParts = [
    searchParams.get("document") ?? "",
    searchParams.get("routingTemplate") ?? "",
    searchParams.get("individual") ?? "",
    activeRoutingTemplateId ?? "",
    activeIndividualContextToken ?? "",
  ];
  const hasStrictBuilderTarget = strictBuilderTargetParts.some(Boolean);
  const strictBuilderTargetIdentity = strictBuilderTargetParts.join("|");
  useLayoutEffect(() => {
    if (strictBuilderTargetIdentityRef.current !== strictBuilderTargetIdentity) {
      strictBuilderTargetIdentityRef.current = strictBuilderTargetIdentity;
      if (hasStrictBuilderTarget) ordinaryLoadRequestRef.current += 1;
    }
    strictBuilderTargetRef.current = hasStrictBuilderTarget;
  }, [hasStrictBuilderTarget, strictBuilderTargetIdentity]);
  const [builderEditorContext, setBuilderEditorContext] = useState<BuilderEditorContext | null>(null);
  const [templateBuilderContext, setTemplateBuilderContext] = useState<{
    documentId: string;
    routingTemplateId: string;
    displayName: string;
    family: "product" | "post";
    familyLabel: "Single Product" | "Single Post";
    provider: "woocommerce" | "wordpress";
    source: "product" | "post";
    websiteId?: string;
    assignmentSummary: "All Products" | "All Posts";
  } | null>(null);
  const [individualBuilderContext, setIndividualBuilderContext] = useState<{
    mode: "individual";
    documentId: string;
    identity: { provider: string; contentType: "product" | "post"; contentId: string };
    family: "product" | "post";
    familyLabel: "Individual Product Layout" | "Individual Post Layout";
    title: string | null;
    slug: string | null;
    availability: "published" | "unpublished" | "unknown" | "missing";
    websiteId?: string;
    storefrontHref?: string;
    assignedTemplate: null | { templateId: string; name: string; layoutId: string };
  } | null>(null);
  const [templatePreviewCandidates, setTemplatePreviewCandidates] = useState<Array<{
    identity: { provider: string; contentType: string; contentId: string };
    label: string;
    storefrontHref?: string;
  }>>([]);
  const [templatePreviewIdentity, setTemplatePreviewIdentity] = useState<{
    provider: string;
    contentType: string;
    contentId: string;
  } | null>(null);
  const [headerContextKey, setHeaderContextKey] = useState<BuilderLayoutKey>(() => {
    const requestedContext = parseBuilderLayoutKey(searchParams.get("context"));
    return requestedContext && requestedContext !== "header" ? requestedContext : "shop";
  });
  const [shellPageContextState, setShellPageContextState] = useState<BuilderState | null>(null);
  const pageContextStateRef = useRef<BuilderState | null>(null);
  useEffect(() => {
    const storedLanguage = window.sessionStorage.getItem(previewLanguageStorageKey);
    if (storedLanguage && enabledContentLanguages.includes(storedLanguage)) {
      setContentLanguage(storedLanguage);
    }
  }, [enabledContentLanguages, previewLanguageStorageKey]);

  useEffect(() => {
    window.sessionStorage.setItem(previewLanguageStorageKey, contentLanguage);
  }, [contentLanguage, previewLanguageStorageKey]);
  const storageKeys = useMemo(() => getBuilderStorageKeys(websiteId), [websiteId]);
  const builderApiUrl = useCallback(
    (path: string, params: Record<string, string | number | boolean> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        query.set(key, String(value));
      });
      if (websiteId) {
        query.set("websiteId", websiteId);
      }
      const queryString = query.toString();
      const url = queryString ? `${path}?${queryString}` : path;
      if (
        path.includes("/api/builder-layouts") ||
        path.includes("/api/builder-pages") ||
        path.includes("/api/builder-shell") ||
        path.includes("/api/builder-theme-settings")
      ) {
        console.log("[builder-scope] DashboardBuilder API URL", {
          websiteId,
          path,
          url,
        });
      }
      if (path.includes("/api/builder-shell")) {
        console.log("[global-settings-scope] DashboardBuilder shell API URL", {
          userRole: saasUserRole ?? null,
          websiteId: websiteId ?? null,
          section: "builder-shell",
          path,
          url,
        });
      }
      if (path.includes("/api/builder-theme-settings")) {
        console.log("[global-settings-scope] DashboardBuilder theme API URL", {
          userRole: saasUserRole ?? null,
          websiteId: websiteId ?? null,
          section: "builder-theme-settings",
          path,
          url,
        });
      }
      return url;
    },
    [saasUserRole, websiteId],
  );
  const [discoveredDynamicContentCapabilities, setDiscoveredDynamicContentCapabilities] =
    useState<DynamicContentSourceCapability[]>([]);
  useEffect(() => {
    if (!websiteId) {
      setDiscoveredDynamicContentCapabilities([]);
      return;
    }
    const controller = new AbortController();
    void fetch(builderApiUrl("/api/wordpress-content-schema"), { signal: controller.signal })
      .then(async (response) => response.ok
        ? response.json() as Promise<{ capabilities?: DynamicContentSourceCapability[] }>
        : null)
      .then((payload) => {
        if (payload?.capabilities) setDiscoveredDynamicContentCapabilities(payload.capabilities);
      })
      .catch(() => {
        // The static sources remain available when WordPress discovery is offline.
      });
    return () => controller.abort();
  }, [builderApiUrl, websiteId]);
  const isWebsiteScopedBuilder = Boolean(websiteId);
  const canEditShellSettings =
    isWebsiteScopedBuilder || saasUserRole === "super_admin";
  const shellSettingsLabel = isWebsiteScopedBuilder
    ? "Global Styles"
    : "Style Customizer";
  const shellSettingsShortLabel = isWebsiteScopedBuilder
    ? "Global Styles"
    : "Style";
  const shellSettingsStatusLabel = isWebsiteScopedBuilder
    ? "Website settings"
    : "Style customizer";
  const initialResolvedPage = parseBuilderLayoutKey(
    searchParams.get("page") ?? searchParams.get("template"),
  );
  const initialRequestedPage =
    hasStrictBuilderTarget ? null : initialResolvedPage;
  const initialPublishedState = useMemo(() => initialPageHydration?.authoredLayout
    ? normalizeBuilderState({
        page: initialPageHydration.authoredLayout.page,
        targetType: initialPageHydration.authoredLayout.targetType ?? "page",
        template: initialPageHydration.authoredLayout.template,
        documentId: initialPageHydration.authoredLayout.documentId,
        displayName: initialPageHydration.authoredLayout.displayName,
        design: {
          ...defaultDesign,
          ...(initialPageHydration.authoredLayout.design ?? {}),
        } as BuilderState["design"],
        sections: initialPageHydration.authoredLayout.sections,
      }, initialPageHydration.authoredLayout.page)
    : null, [initialPageHydration]);
  const initialRenderState = useMemo(() => initialPageHydration?.renderLayout
    ? normalizeBuilderState({
        page: initialPageHydration.renderLayout.page,
        targetType: initialPageHydration.renderLayout.targetType ?? "page",
        template: initialPageHydration.renderLayout.template,
        documentId: initialPageHydration.renderLayout.documentId,
        displayName: initialPageHydration.renderLayout.displayName,
        design: {
          ...defaultDesign,
          ...(initialPageHydration.renderLayout.design ?? {}),
        } as BuilderState["design"],
        sections: initialPageHydration.renderLayout.sections,
      }, initialPageHydration.renderLayout.page)
    : null, [initialPageHydration]);
  const initialRenderProjection = useMemo(() => initialPublishedState && initialRenderState
    ? {
        page: initialPublishedState.page,
        sourceSignature: JSON.stringify(initialPublishedState),
        sections: initialRenderState.sections,
      }
    : null, [initialPublishedState, initialRenderState]);
  const [builderState, setRawBuilderState] = useState<BuilderState>(() =>
    initialPublishedState ?? (
      initialRequestedPage
        ? hydrateDocumentBuilderState(
            loadDraftForKey(initialRequestedPage, storageKeys),
            defaultShellSettings,
          )
        : defaultState
    ),
  );
  useEffect(() => {
    if (builderState.page !== "header" && builderState.page !== "footer") {
      pageContextStateRef.current = builderState;
    }
  }, [builderState]);
  const [builderRenderProjection, setBuilderRenderProjection] = useState<{
    page: BuilderLayoutKey;
    sourceSignature: string;
    sections: BuilderSection[];
  } | null>(initialRenderProjection);
  const dynamicContentSignature = useMemo(
    () => dynamicContentPreviewSignature(builderState.sections),
    [builderState.sections],
  );
  // Authored state is the source of truth for context-aware projection
  // invalidation. It deliberately excludes renderLayout/materialized values.
  const authoredRevisionSignature = useMemo(
    () => JSON.stringify(builderState),
    [builderState],
  );
  const initialProjectionMatchesAuthoredState =
    initialRenderProjection?.sourceSignature === authoredRevisionSignature;
  const dynamicPreviewRequestRef = useRef(0);
  // Initial hydration already contains the server-resolved projection. Seed
  // the refresh guards from it so mounting the client does not immediately
  // issue the same uncached WordPress preview request a second time.
  const previousDynamicContentSignatureRef = useRef<string | null>(
    initialProjectionMatchesAuthoredState ? dynamicContentSignature : null,
  );
  const previousDynamicContentPageRef = useRef<BuilderLayoutKey | null>(
    initialProjectionMatchesAuthoredState ? builderState.page : null,
  );
  const previousAuthoredRevisionRef = useRef<string | null>(null);
  const authoredRevisionSignatureRef = useRef(authoredRevisionSignature);
  authoredRevisionSignatureRef.current = authoredRevisionSignature;
  const authoredRefreshTimerRef = useRef<number | null>(null);
  const iframeSaveTimerRef = useRef<number | null>(null);
  const iframeSavedSignatureRef = useRef<string | null>(null);
  const iframePendingSaveRef = useRef<{
    sequence: number;
    signature: string;
    state: BuilderState;
  } | null>(null);
  const iframeSaveInFlightRef = useRef(false);
  const iframeSaveSequenceRef = useRef(0);
  const iframeRunSaveRef = useRef<() => void>(() => {});
  const iframeFlushSaveRef = useRef<() => void>(() => {});
  const iframeDraftRevisionRef = useRef(0);
  const iframeDraftSignatureRef = useRef<string | null>(null);
  const iframeDraftFrameRef = useRef<number | null>(null);
  const iframeDraftPendingRef = useRef<BuilderState | null>(null);
  const suppressNextIframeSelectionScrollRef = useRef(false);
  const setBuilderState = useCallback((value: BuilderState | ((current: BuilderState) => BuilderState)) => {
    setRawBuilderState((current) => {
      let nextState = typeof value === "function" ? value(current) : value;
      if (nextState.page === "header" && nextState.sections && nextState.sections.length > 0) {
        const oldSec = current.sections?.[0];
        const nextSec = nextState.sections[0];
        if (oldSec && nextSec) {
          const oldKey = oldSec.headerPresetKey;
          const nextKey = nextSec.headerPresetKey;

          if (oldKey !== undefined && oldKey === nextKey) {
            const oldSectionWithoutKey = { ...oldSec, headerPresetKey: undefined };
            const nextSectionWithoutKey = { ...nextSec, headerPresetKey: undefined };

            if (JSON.stringify(oldSectionWithoutKey) !== JSON.stringify(nextSectionWithoutKey)) {
              nextState = {
                ...nextState,
                sections: [
                  {
                    ...nextSec,
                    headerPresetKey: undefined
                  },
                  ...nextState.sections.slice(1)
                ]
              };
            }
          }
        }
      }
      return nextState;
    });
  }, []);
  const builderStateRef = useRef(builderState);
  builderStateRef.current = builderState;

  const refreshDynamicContentPreview = useCallback(async () => {
    const requestedState = builderStateRef.current;
    const requestedSignature = JSON.stringify(requestedState);
    const requestId = ++dynamicPreviewRequestRef.current;
    const response = await fetch(builderApiUrl(
      activeIndividualContextToken
        ? "/api/builder-individual-context"
        : activeRoutingTemplateId
          ? "/api/builder-template-context"
          : "/api/builder-layouts/preview",
    ), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(activeIndividualContextToken ? {
        layout: requestedState,
        documentId: individualBuilderContext?.documentId,
        individual: activeIndividualContextToken,
      } : activeRoutingTemplateId ? {
          layout: requestedState,
          documentId: templateBuilderContext?.documentId,
          routingTemplateId: activeRoutingTemplateId,
          previewIdentity: templatePreviewIdentity,
        } : { layout: requestedState }),
      cache: "no-store",
    });
    if (
      requestId !== dynamicPreviewRequestRef.current ||
      JSON.stringify(builderStateRef.current) !== requestedSignature
    ) return;
    if (!response.ok) {
      setBuilderRenderProjection(null);
      return;
    }
    const payload = (await response.json()) as {
      renderLayout?: BuilderState | null;
      editorContext?: BuilderEditorContext;
    };
    if (payload.editorContext) setBuilderEditorContext(payload.editorContext);
    setBuilderRenderProjection(
      payload.renderLayout?.sections?.length
        ? {
            page: requestedState.page,
            sourceSignature: requestedSignature,
            sections: payload.renderLayout.sections,
          }
        : null,
    );
  }, [activeIndividualContextToken, activeRoutingTemplateId, builderApiUrl, individualBuilderContext?.documentId, templateBuilderContext?.documentId, templatePreviewIdentity]);

  useEffect(() => {
    if (!activeRoutingTemplateId || !templatePreviewIdentity) return;
    if (authoredRefreshTimerRef.current !== null) {
      window.clearTimeout(authoredRefreshTimerRef.current);
      authoredRefreshTimerRef.current = null;
    }
    previousAuthoredRevisionRef.current = authoredRevisionSignatureRef.current;
    void refreshDynamicContentPreview();
  }, [activeRoutingTemplateId, refreshDynamicContentPreview, templatePreviewIdentity]);
  useEffect(() => {
    if (!activeIndividualContextToken) return;
    if (authoredRefreshTimerRef.current !== null) {
      window.clearTimeout(authoredRefreshTimerRef.current);
      authoredRefreshTimerRef.current = null;
    }
    previousAuthoredRevisionRef.current = authoredRevisionSignatureRef.current;
    void refreshDynamicContentPreview();
  }, [activeIndividualContextToken, refreshDynamicContentPreview]);
  useEffect(() => () => {
    if (authoredRefreshTimerRef.current !== null) {
      window.clearTimeout(authoredRefreshTimerRef.current);
      authoredRefreshTimerRef.current = null;
    }
  }, []);
  const restoredDraftKeysRef = useRef(new Set<BuilderLayoutKey>());
  const draftMetadataRef = useRef<BuilderDraftMetadata>({});
  // A YOOtheme import replaces a persisted document. Its old local draft must
  // not win on the next Builder load after the imported document is published.
  const pendingYoothemeDraftInvalidationRef = useRef<BuilderLayoutKey | null>(null);
  const skipImportedDraftPersistenceRef = useRef<{
    page: BuilderLayoutKey;
    signature: string;
  } | null>(null);
  const [headerDocumentPreviewState, setHeaderDocumentPreviewState] = useState<BuilderState | null>(null);
  const headerRouteHydrationRef = useRef<string | null>(null);
  const footerRouteHydrationRef = useRef<string | null>(null);
  const [footerDocumentPreviewState, setFooterDocumentPreviewState] = useState<BuilderState | null>(null);
  const footerDocumentLoadRef = useRef<Promise<BuilderState | null> | null>(null);
  const [presetToApply, setPresetToApply] = useState<{ presetKey: string; name: string } | null>(null);
  const [dashboardTheme, setDashboardTheme] = useState<"light" | "dark">(
    "dark",
  );

  useEffect(() => {
    console.log("[builder-scope] DashboardBuilder websiteId prop", {
      websiteId,
      pathname,
    });
  }, [pathname, websiteId]);

  useEffect(() => {
    const handleHeaderPointerMove = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      setHeaderHovered(
        Boolean(
          target.closest(
            ".builder-preview-header-editable .site-header, .builder-preview-header-editable #site-header-pill, .builder-preview-header-tools",
          ),
        ),
      );
    };

    window.addEventListener("pointermove", handleHeaderPointerMove, {
      passive: true,
    });
    return () => {
      window.removeEventListener("pointermove", handleHeaderPointerMove);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("builder-dashboard-theme");
    if (saved === "light" || saved === "dark") {
      setDashboardTheme(saved as "light" | "dark");
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = dashboardTheme === "light" ? "dark" : "light";
    setDashboardTheme(nextTheme);
    localStorage.setItem("builder-dashboard-theme", nextTheme);
  };

  // Builder chrome and storefront preview themes are separate. A forced
  // document scheme wins; `auto` follows the canonical visitor/header toggle.
  const layoutScheme =
    builderState.design.colorScheme === "dark" ||
    builderState.design.colorScheme === "light"
      ? builderState.design.colorScheme
      : storefrontTheme;
  const [selectedId, setSelectedId] = useState("");
  const [headerSelected, setHeaderSelected] = useState(false);
  const [footerSelected, setFooterSelected] = useState(false);
  const [headerHovered, setHeaderHovered] = useState(false);
  const [draggingHeaderElementId, setDraggingHeaderElementId] = useState<string | null>(null);
  const [draggingHeaderRowId, setDraggingHeaderRowId] = useState<string | null>(null);
  const [headerDropTarget, setHeaderDropTarget] = useState<string | null>(null);
  const [headerRowDropTarget, setHeaderRowDropTarget] = useState<string | null>(null);

  useEffect(() => {
    const clearHeaderDragState = () => {
      setDraggingHeaderElementId(null);
      setHeaderDropTarget(null);
    };
    window.addEventListener("dragend", clearHeaderDragState);
    window.addEventListener("drop", clearHeaderDragState);
    return () => {
      window.removeEventListener("dragend", clearHeaderDragState);
      window.removeEventListener("drop", clearHeaderDragState);
    };
  }, []);
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  // The canonical tenant preview is the production Builder canvas. Keep the
  // in-document renderer available only as an explicit temporary fallback so
  // ordinary Builder visits retain iframe isolation and settled bridge work.
  const [iframeComparisonMode, setIframeComparisonMode] = useState(
    () => searchParams.get("builderCanvas") !== "legacy",
  );
  const [iframeSelectionRect, setIframeSelectionRect] = useState<BuilderInteractionLayerRect | null>(null);
  const iframeDiagnosticMode = searchParams.get("iframeDiag") === "minimal"
    ? "minimal"
    : searchParams.get("iframeDiag") === "full"
    ? "full"
    : searchParams.get("iframeDiag") === "toolbar"
      ? "toolbar"
    : searchParams.get("iframeDiag") === "rect"
      ? "rect"
      : "settled";
  const iframeMutationSyncEnabled = searchParams.get("iframeMutations") === "1";
  const laptopPreviewWidth = 1280;
  const [customMobileWidth, setCustomMobileWidth] = useState(390);
  const [customTabletWidth, setCustomTabletWidth] = useState(820);
  const [isResizingDevice, setIsResizingDevice] = useState(false);
  const [copied, setCopied] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [publishedDocumentReady, setPublishedDocumentReady] = useState(false);
  const [publishStatus, setPublishStatus] = useState("Local draft autosaves");
  const [publishCelebration, setPublishCelebration] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null);
  const [uploadingNestedSlide, setUploadingNestedSlide] = useState<
    string | null
  >(null);
  const [openSlideId, setOpenSlideId] = useState<string | null>(null);
  const [openLayoutItemId, setOpenLayoutItemId] = useState<string | null>(null);
  const [selectedLayoutColumnKey, setSelectedLayoutColumnKey] = useState<
    string | null
  >(null);
  const [selectedLayoutRowIndex, setSelectedLayoutRowIndex] = useState<
    number | null
  >(null);
  const [selectedLayoutBlockKey, setSelectedLayoutBlockKey] = useState<
    string | null
  >(null);
  const [activeShellEntry, setActiveShellEntry] = useState<{
    shellType: "header" | "footer";
    rootId: string;
  } | null>(null);
  const [hoveredBuilderTarget, setHoveredBuilderTarget] =
    useState<BuilderHoverTarget | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleHoverTarget = useCallback((target: BuilderHoverTarget | null) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }

    if (target === null) {
      hoverTimeoutRef.current = setTimeout(() => {
        setHoveredBuilderTarget(null);
      }, 280);
    } else {
      setHoveredBuilderTarget(target);
    }
  }, []);
  const [renameSectionRequestId, setRenameSectionRequestId] = useState<
    string | null
  >(null);
  const [documentRenameEditing, setDocumentRenameEditing] = useState(false);
  const [documentRenameDraft, setDocumentRenameDraft] = useState("");
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(
    null,
  );
  const [draggingLayoutBlockKey, setDraggingLayoutBlockKey] = useState<
    string | null
  >(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("layout");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorRendered, setInspectorRendered] = useState(false);
  const [elementLibraryOpen, setElementLibraryOpen] = useState(false);
  const [elementLibraryTarget, setElementLibraryTarget] = useState<{
    sectionId: string;
    columnKey: string;
  } | null>(null);
  const previousInspectorOpenRef = useRef(false);
  const [inspectorMode, setInspectorMode] = useState<InspectorMode>("docked");
  const [inspectorWidth, setInspectorWidth] = useState(INSPECTOR_DEFAULT_WIDTH);
  const [inspectorFloatingRect, setInspectorFloatingRect] =
    useState<InspectorFloatingRect>({
      x: 960,
      y: 82,
      width: INSPECTOR_DEFAULT_WIDTH,
      height: INSPECTOR_DEFAULT_HEIGHT,
    });
  const inspectorFloatingRectRef = useRef(inspectorFloatingRect);
  const [inspectorDragging, setInspectorDragging] = useState(false);
  const [inspectorWorkspaceWidth, setInspectorWorkspaceWidth] = useState(0);
  const [inspectorDesktopLayout, setInspectorDesktopLayout] = useState(false);
  const [inspectorResizing, setInspectorResizing] = useState(false);
  const [sectionSettingsOpen, setSectionSettingsOpen] = useState(false);
  const [globalStylesTab, setGlobalStylesTab] = useState<
    | "presets"
    | "siteDesign"
    | "semantic"
    | "spacing"
    | "cards"
    | "typography"
    | "buttons"
    | "import"
  >("presets");
  const [globalSpacingFocus, setGlobalSpacingFocus] = useState<
    "section" | "row" | "element" | null
  >(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    false,
  );
  const [sidebarTransitioning, setSidebarTransitioning] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(480);
  const [sidebarResizing, setSidebarResizing] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewCanvasWidth, setPreviewCanvasWidth] = useState(1180);
  const previewScaleRef = useRef(previewScale);
  const previewCanvasWidthRef = useRef(previewCanvasWidth);
  const iframeComparisonShellRef = useRef<HTMLDivElement | null>(null);
  const previewViewportFrameRef = useRef<number | null>(null);
  const workspaceWidthRef = useRef(0);
  const inspectorDesktopLayoutRef = useRef(false);
  const sidebarTransitionUntilRef = useRef(0);
  const sidebarViewportTimerRef = useRef<number | null>(null);
  const [spacingOverlayEnabled, setSpacingOverlayEnabled] = useState(false);
  const [spacingFocusRequest, setSpacingFocusRequest] = useState<{
    id: number;
    scope: string;
    field?: string;
  } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("builder");
  const [shellSettings, setShellSettings] =
    useState<BuilderShellSettings>(defaultShellSettings);
  const [themeSettings, setThemeSettings] = useState<BuilderThemeSettings>(defaultBuilderThemeSettings);
  const [themePreviewRevision, setThemePreviewRevision] = useState(0);
  // Tenant tokens belong to explicit Builder/preview roots, never <html>.
  // A stylesheet keeps the DOM readable and lets portalled tenant surfaces
  // opt in without leaking one site's theme into the application shell.
  const dashboardTenantTokensCss = useMemo(() => {
    const declarations = Object.entries(getUikitGlobalsCssVars(shellSettings))
      .map(([name, value]) => `  ${name}: ${value};`)
      .join("\n");
    return `:where([data-builder-tenant-theme-root]) {\n${declarations}\n}`;
  }, [shellSettings]);
  const [shellStatus, setShellStatus] = useState(
    `${shellSettingsStatusLabel} load from React`,
  );
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(
    null,
  );
  const [menuIconPickerOpen, setMenuIconPickerOpen] = useState(false);
  const [menuIconSearch, setMenuIconSearch] = useState("");
  const setSidebarCollapsedPreference = useCallback(
    (next: boolean) => {
      sidebarTransitionUntilRef.current = performance.now() + 280;
      setSidebarTransitioning(true);
      setSidebarCollapsed(next);
      window.localStorage.setItem(storageKeys.sidebarCollapsed, String(next));
    },
    [storageKeys.sidebarCollapsed],
  );
  const handleDashboardTransitionEnd = useCallback(
    (event: ReactTransitionEvent<HTMLDivElement>) => {
      if (event.target !== event.currentTarget) return;
      if (event.propertyName !== "grid-template-columns") return;
      sidebarTransitionUntilRef.current = 0;
      window.dispatchEvent(new Event("builder:sidebar-transition-end"));
      setSidebarTransitioning(false);
    },
    [],
  );
  const publishCelebrationTimer = useRef<number | null>(null);
  const shellAutoSaveTimer = useRef<number | null>(null);
  const themeAutoSaveTimer = useRef<number | null>(null);
  const shellSaveRevision = useRef(0);
  const spacingFocusRequestId = useRef(0);

  useEffect(() => {
    inspectorFloatingRectRef.current = inspectorFloatingRect;
  }, [inspectorFloatingRect]);

  useEffect(() => {
    if (sidebarTab === "globalStyles" && !canEditShellSettings) {
      setSidebarTab("builder");
      setShellStatus("Platform global settings require super admin access.");
    }
  }, [canEditShellSettings, sidebarTab]);

  useEffect(() => {
    setInspectorMode(readInspectorModePreference());
    setInspectorWidth(readInspectorWidthPreference());
    setInspectorFloatingRect(readInspectorFloatingRectPreference());
  }, []);

  useEffect(() => {
    setSidebarCollapsed(
      loadSidebarCollapsedPreference(storageKeys.sidebarCollapsed),
    );
  }, [storageKeys.sidebarCollapsed]);

  const [customPages, setCustomPages] = useState<BuilderCustomPage[]>([]);
  const resolveRequestedPageFromSearch = useCallback((fallbackPage: BuilderLayoutKey) => {
    const requestedPage = searchParams.get("page") ?? searchParams.get("template");
    return (
      parseBuilderLayoutKey(requestedPage) ??
      (websiteId && requestedPage
        ? tenantCorePageKeys[requestedPage] ?? null
        : null) ??
      (websiteId && requestedPage
        ? customPages.find(
            (page) =>
              page.slug === requestedPage ||
              page.key === `page:${requestedPage}`,
          )?.key ?? null
        : null) ??
      fallbackPage
    );
  }, [customPages, searchParams, websiteId]);
  const [publishedKeys, setPublishedKeys] = useState<string[]>([]);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [pageStatus, setPageStatus] = useState("Builder pages save to React");
  const [savedTemplates, setSavedTemplates] = useState<BuilderSavedTemplate[]>(
    [],
  );
  const [templateStatus, setTemplateStatus] = useState(
    "Templates save to React",
  );
  const [yoothemeImportWarnings, setYoothemeImportWarnings] = useState<string[]>([]);
  const [yoothemeImportPreview, setYoothemeImportPreview] = useState<{
    fileName: string;
    targetPage: BuilderLayoutKey;
    documentName?: string;
    sections: BuilderSection[];
    warnings: string[];
    globalStylePatch: Partial<BuilderShellSettings>;
    headerDocumentPatch: Partial<BuilderSection>;
  } | null>(null);
  const [previewProducts, setPreviewProducts] = useState<ProductNode[]>([]);
  const [previewCategoryTree, setPreviewCategoryTree] = useState<
    CategoryTreeItem[]
  >([]);
  const [previewCategoryCounts, setPreviewCategoryCounts] = useState<
    Record<string, number>
  >({});
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTitle, setMediaPickerTitle] = useState("WordPress Media");
  const [mediaPickerCurrentUrl, setMediaPickerCurrentUrl] = useState("");
  const [mediaPickerMultiple, setMediaPickerMultiple] = useState(false);
  const mediaSelectManyRef = useRef<((media: WordPressMediaItem[]) => void) | null>(null);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const iframeComparisonRef = useRef<HTMLIFrameElement>(null);
  const pendingIframeShellTargetRef = useRef<{
    shell: "header" | "footer";
    target: BuilderInteractionTarget;
  } | null>(null);
  const headerPreviewSlotRef = useRef<HTMLDivElement>(null);
  const [builderHeaderScrollState, setBuilderHeaderScrollState] = useState({
    scrolled: false,
    hidden: false,
  });
  const headerPageContextRef = useRef<HTMLDivElement>(null);
  const footerPreviewSlotRef = useRef<HTMLDivElement>(null);
  const builderWorkspaceRef = useRef<HTMLElement>(null);
  const inspectorPanelRef = useRef<HTMLDivElement>(null);
  const inspectorToggleRef = useRef<HTMLButtonElement>(null);
  const inspectorPortalRootRef = useRef<HTMLDivElement>(null);
  const inspectorResizeRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
    currentWidth: number;
    previousCursor: string;
    previousUserSelect: string;
  } | null>(null);
  const inspectorDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const inspectorFloatingResizeRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);
  const mediaSelectRef = useRef<((media: WordPressMediaItem) => void) | null>(
    null,
  );
  const undoHistoryRef = useRef<BuilderState[]>([]);
  const redoHistoryRef = useRef<BuilderState[]>([]);
  const skipUndoCaptureRef = useRef(false);
  const [committedBuilderStateSignature, setCommittedBuilderStateSignature] =
    useState("");
  const [committedShellSettingsSignature, setCommittedShellSettingsSignature] =
    useState("");
  const undoRef = useRef<() => void>(() => {});
  const redoRef = useRef<() => void>(() => {});

  const rawSelectedSection = useMemo(
    () => builderState.sections.find((section) => section.id === selectedId),
    [builderState.sections, selectedId],
  );
  const localizedSections = useMemo(
    () => resolveContentSections(builderState.sections, contentLanguage, primaryContentLanguage),
    [builderState.sections, contentLanguage, primaryContentLanguage],
  );
  const materializedPreviewSections = useMemo(() => {
    if (
      !builderRenderProjection ||
      builderRenderProjection.page !== builderState.page ||
      builderRenderProjection.sourceSignature !== JSON.stringify(builderState)
    ) {
      return null;
    }
    return resolveContentSections(
      builderRenderProjection.sections,
      contentLanguage,
      primaryContentLanguage,
    );
  }, [
    builderRenderProjection,
    builderState,
    contentLanguage,
    primaryContentLanguage,
  ]);
  // The comparison iframe is a renderer, not an authored-state owner. Send it
  // the transient server projection once Dynamic Content resolves, while all
  // inspector mutations and persistence continue to use `builderState`.
  // Previously the bridge only depended on the authored draft, so a resolved
  // projection could reach the inline preview but never the iframe until a
  // full reload performed server-side materialization again.
  const iframeRenderState = useMemo<BuilderState>(
    () => materializedPreviewSections
      ? { ...builderState, sections: materializedPreviewSections }
      : builderState,
    [builderState, materializedPreviewSections],
  );
  const iframeRenderStateRef = useRef(iframeRenderState);
  iframeRenderStateRef.current = iframeRenderState;
  const headerContextState = useMemo(
    () =>
      builderState.page === "header" || builderState.page === "footer"
        ? shellPageContextState ?? pageContextStateRef.current ?? loadDraftForKey(headerContextKey, storageKeys)
        : builderState,
    [builderState, headerContextKey, shellPageContextState, storageKeys],
  );
  const iframeComparisonHref = useMemo(() => {
    const params = new URLSearchParams({ page: headerContextState.page });
    const productSlug = individualBuilderContext?.slug ??
      (templateBuilderContext?.family === "product" ? previewProducts[0]?.slug : undefined);
    if (headerContextState.page === "product-single" && productSlug) {
      params.set("product", productSlug);
    }
    if (themePreviewRevision > 0) params.set("themeRevision", String(themePreviewRevision));
    if (!websiteId) {
      params.set("builderFrame", "selection");
      params.set("builderBridge", iframeDiagnosticMode);
      return `/dashboard/preview?${params.toString()}`;
    }
    const tenantRouteSegment = websiteRouteSegment ?? websiteId;
    params.set("builderFrame", "selection");
    params.set("builderBridge", iframeDiagnosticMode);
    return `/app/websites/${encodeURIComponent(tenantRouteSegment)}/preview?${params.toString()}`;
  }, [
    headerContextState.page,
    individualBuilderContext?.slug,
    previewProducts,
    templateBuilderContext?.family,
    iframeDiagnosticMode,
    themePreviewRevision,
    websiteId,
    websiteRouteSegment,
  ]);
  const headerContextSections = useMemo(
    () => {
      const resolved = resolveContentSections(
        headerContextState.sections,
        contentLanguage,
        primaryContentLanguage,
      );
      return resolved;
    },
    [contentLanguage, headerContextState.sections, primaryContentLanguage],
  );
  const headerDocumentState = useMemo(
    () => builderState.page === "header"
      ? builderState
      : headerDocumentPreviewState ?? hydrateDocumentBuilderState(loadDraftForKey("header", storageKeys), shellSettings),
    [builderState, headerDocumentPreviewState, shellSettings, storageKeys],
  );
  const footerDocumentState = useMemo(
    () => builderState.page === "footer"
      ? builderState
      : footerDocumentPreviewState ?? hydrateDocumentBuilderState(loadDraftForKey("footer", storageKeys), shellSettings),
    [builderState, footerDocumentPreviewState, shellSettings, storageKeys],
  );
  const footerDocumentSections = useMemo(
    () => resolveContentSections(
      footerDocumentState.sections,
      contentLanguage,
      primaryContentLanguage,
    ),
    [contentLanguage, footerDocumentState.sections, primaryContentLanguage],
  );
  const footerSlotLayout = useMemo(
    () => ({
      version: 1 as const,
      key: (footerDocumentState.page ?? "footer") as BuilderLayoutKey,
      updatedAt: "",
      ...footerDocumentState,
      sections: footerDocumentSections,
    }),
    [footerDocumentState, footerDocumentSections],
  );
  const headerCompositionSections = useMemo(
    () => resolveContentSections(
      headerDocumentState.sections,
      contentLanguage,
      primaryContentLanguage,
    ),
    [contentLanguage, headerDocumentState.sections, primaryContentLanguage],
  );
  const currentHeaderComposition = useMemo(
    () => {
      const composition = resolveHeaderBuilderComposition({ sections: headerCompositionSections });
      return { ...composition, columns: composition.columns ?? [] };
    },
    [headerCompositionSections],
  );
  const currentHeaderDocumentSettings = useMemo(
    () => resolveHeaderDocumentSettings(currentHeaderComposition, shellSettings),
    [currentHeaderComposition, shellSettings],
  );

  useEffect(() => {
    const behavior = currentHeaderDocumentSettings.behavior;
    let scrollSource: HTMLElement | null = null;
    const resolveScrollSource = () => {
      const previewShell = previewShellRef.current;
      if (!previewShell) {
        scrollSource = null;
        return;
      }
      const previewStyle = window.getComputedStyle(previewShell);
      const previewOwnsScroll =
        previewShell.scrollHeight > previewShell.clientHeight + 1 &&
        (previewStyle.overflowY === "auto" || previewStyle.overflowY === "scroll");
      scrollSource = previewOwnsScroll ? previewShell : null;
    };
    resolveScrollSource();
    const getScrollY = () => {
      return scrollSource?.scrollTop ?? window.scrollY;
    };

    const onScroll = () => {
      const nextScrollY = getScrollY();
      setBuilderHeaderScrollState((current) => {
        const next = {
          scrolled: behavior !== "static" && nextScrollY > 24,
          hidden: nextScrollY <= 24 ? false : current.hidden,
        };
        return next.scrolled === current.scrolled && next.hidden === current.hidden
          ? current
          : next;
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (behavior !== "sticky-on-scroll-up" || Math.abs(event.deltaY) <= 2) return;
      const nextHidden = event.deltaY > 0;
      setBuilderHeaderScrollState((current) =>
        current.hidden === nextHidden
          ? current
          : { ...current, hidden: nextHidden },
      );
    };

    const initialScrollY = getScrollY();
    setBuilderHeaderScrollState({
      scrolled: behavior !== "static" && initialScrollY > 24,
      hidden: false,
    });
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });
    const onResize = () => {
      resolveScrollSource();
      onScroll();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("resize", onResize);
    };
  }, [currentHeaderDocumentSettings.behavior]);
  const composedAnchorIdEntries = useMemo(() => {
    const sections = [
      ...builderState.sections,
      ...(builderState.page === "header" ? [] : headerDocumentState.sections),
      ...(builderState.page === "footer" ? [] : footerDocumentState.sections),
    ];
    return sections
      .filter((section) => Boolean(section.anchorId))
      .map((section) => ({ sectionId: section.id, anchorId: section.anchorId! }));
  }, [builderState.page, builderState.sections, footerDocumentState.sections, headerDocumentState.sections]);
  const builderHeaderCategoriesContent = (() => {
    if (previewCategoryTree.length === 0) return null;
    const categoriesElement = currentHeaderComposition.elements.find((element) => element.type === "categories");
    const showAllCategories = categoriesElement?.categoriesShowAll !== false;
    const showCounts = categoriesElement?.categoriesShowCounts !== false;
    const showHierarchy = categoriesElement?.categoriesShowHierarchy !== false;

    return (
      <div className="category-mega-menu">
        {/* Desktop version */}
        <div className="category-mega-menu-desktop">
          <div className="category-mega-header">
            <span>Shop by category</span>
            {showAllCategories ? (
              <span className="category-mega-all-link">View full category list</span>
            ) : null}
          </div>
          <div className="category-mega-grid">
            {previewCategoryTree.map((category) => {
              const hasChildren = category.children && category.children.length > 0;
              return (
                <div key={category.id} className="category-mega-card">
                  <span className="category-mega-root-link">
                    <span>{category.name}</span>
                    {hasChildren && showCounts && (
                      <span className="category-mega-count">{category.children.length}</span>
                    )}
                  </span>
                  {hasChildren && showHierarchy && (
                    <ul className="category-mega-children">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <span className="category-mega-child-link">{child.name}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile version */}
        <div className="category-mega-menu-mobile">
          <div className="category-mobile-list">
            {previewCategoryTree.map((category) => {
              const hasChildren = category.children && category.children.length > 0;
              return (
                <div key={category.id} className="category-mobile-row">
                  <div className="category-mobile-row-left">
                    <span className="category-mobile-name">{category.name}</span>
                    {hasChildren && showCounts && (
                      <span className="category-mobile-count-badge">
                        {category.children.length}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={16} className="category-mobile-chevron" />
                </div>
              );
            })}
            {showAllCategories && (
              <div className="category-mobile-row category-mobile-row--all">
                <span className="category-mobile-name">View full category list</span>
                <ArrowUpRight size={16} className="category-mobile-external-icon" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  })();
  const selectedSection = useMemo(
    () => localizedSections.find((section) => section.id === selectedId),
    [localizedSections, selectedId],
  );

  const effectiveInspectorMode: InspectorMode = inspectorDesktopLayout
    ? inspectorMode
    : "floating";
  const inspectorMaxWidth = Math.floor(
    Math.min(
      INSPECTOR_MAX_WIDTH,
      inspectorWorkspaceWidth - INSPECTOR_MIN_CANVAS_WIDTH,
    ),
  );
  const inspectorResizeEnabled =
    effectiveInspectorMode === "docked" &&
    inspectorDesktopLayout &&
    inspectorMaxWidth >= INSPECTOR_MIN_WIDTH;
  const clampedInspectorWidth = inspectorResizeEnabled
    ? Math.min(
        inspectorMaxWidth,
        Math.max(INSPECTOR_MIN_WIDTH, inspectorWidth),
      )
    : INSPECTOR_DEFAULT_WIDTH;

  const restoreInspectorResizeDocumentStyles = useCallback(() => {
    const resizeState = inspectorResizeRef.current;
    if (resizeState) {
      document.documentElement.style.cursor = resizeState.previousCursor;
      document.body.style.userSelect = resizeState.previousUserSelect;
    } else {
      document.documentElement.style.cursor = "";
      document.body.style.userSelect = "";
    }
    inspectorResizeRef.current = null;
    inspectorDragRef.current = null;
    inspectorFloatingResizeRef.current = null;
  }, []);

  useEffect(() => {
    const workspace = builderWorkspaceRef.current;
    if (!workspace) return;

    let frameId: number | null = null;
    let finalMeasurementTimer: number | null = null;
    const measureWorkspaceSize = () => {
      frameId = null;
      const workspaceRect = workspace.getBoundingClientRect();
      const dashboardRect = workspace.parentElement?.getBoundingClientRect();
      // The Inspector occupies a sibling grid track. Measuring only the
      // remaining canvas makes the Inspector's maximum depend on its current
      // width, creating a resize/clamp feedback loop. Measure the stable area
      // from the workspace's left edge through the dashboard's right edge.
      const nextWorkspaceWidth = dashboardRect
        ? Math.max(0, dashboardRect.right - workspaceRect.left)
        : workspaceRect.width;
      if (nextWorkspaceWidth !== workspaceWidthRef.current) {
        workspaceWidthRef.current = nextWorkspaceWidth;
        setInspectorWorkspaceWidth(nextWorkspaceWidth);
      }
      const nextDesktopLayout = window.innerWidth >= INSPECTOR_RESIZE_BREAKPOINT;
      if (nextDesktopLayout !== inspectorDesktopLayoutRef.current) {
        inspectorDesktopLayoutRef.current = nextDesktopLayout;
        setInspectorDesktopLayout(nextDesktopLayout);
      }
      const currentFloatingRect = inspectorFloatingRectRef.current;
      const nextFloatingRect = clampInspectorFloatingRect(currentFloatingRect);
      const floatingRectChanged =
        nextFloatingRect.x !== currentFloatingRect.x ||
        nextFloatingRect.y !== currentFloatingRect.y ||
        nextFloatingRect.width !== currentFloatingRect.width ||
        nextFloatingRect.height !== currentFloatingRect.height;
      if (floatingRectChanged) {
        inspectorFloatingRectRef.current = nextFloatingRect;
        setInspectorFloatingRect(nextFloatingRect);
      }
    };
    const scheduleWorkspaceMeasurement = () => {
      const remainingTransition = sidebarTransitionUntilRef.current - performance.now();
      if (remainingTransition > 0) {
        if (finalMeasurementTimer === null) {
          finalMeasurementTimer = window.setTimeout(() => {
            finalMeasurementTimer = null;
            scheduleWorkspaceMeasurement();
          }, remainingTransition);
        }
        return;
      }
      if (frameId === null) frameId = window.requestAnimationFrame(measureWorkspaceSize);
    };
    const handleSidebarTransitionEnd = () => {
      sidebarTransitionUntilRef.current = 0;
      if (finalMeasurementTimer !== null) {
        window.clearTimeout(finalMeasurementTimer);
        finalMeasurementTimer = null;
      }
      scheduleWorkspaceMeasurement();
    };
    scheduleWorkspaceMeasurement();

    const resizeObserver = new ResizeObserver(scheduleWorkspaceMeasurement);
    resizeObserver.observe(workspace);
    window.addEventListener("resize", scheduleWorkspaceMeasurement);
    window.addEventListener("builder:sidebar-transition-end", handleSidebarTransitionEnd);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleWorkspaceMeasurement);
      window.removeEventListener("builder:sidebar-transition-end", handleSidebarTransitionEnd);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
      if (finalMeasurementTimer !== null) window.clearTimeout(finalMeasurementTimer);
    };
  }, []);

  useEffect(() => {
    return () => restoreInspectorResizeDocumentStyles();
  }, [restoreInspectorResizeDocumentStyles]);

  // Keep the drawer mounted briefly while closing so its panel transition can
  // finish instead of disappearing on the same click that requests close.
  useEffect(() => {
    if (inspectorOpen && selectedSection) {
      setInspectorRendered(true);
      return;
    }
    // Docked mode owns a real grid track, so retaining a closed panel would
    // leave an empty column behind. Only floating mode needs close retention.
    if (effectiveInspectorMode !== "floating") {
      setInspectorRendered(false);
      return;
    }
    if (!inspectorRendered) return;
    const timer = window.setTimeout(() => setInspectorRendered(false), 280);
    return () => window.clearTimeout(timer);
  }, [effectiveInspectorMode, inspectorOpen, inspectorRendered, selectedSection?.id]);

  useEffect(() => {
    if (!inspectorOpen) return;

    const handleOutsidePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const eventPath = event.composedPath();
      const isWithinBoundary = [
        inspectorPanelRef.current,
        inspectorToggleRef.current,
        inspectorPortalRootRef.current,
      ].some((element) => element && eventPath.includes(element));
      if (isWithinBoundary || target.closest("[data-inspector-owned-portal]")) {
        return;
      }

      // Structure and the sidebar own panel switching. Let those controls
      // decide whether Inspector should be replaced instead of closing it
      // before the replacement handler can preserve its previous state.
      if (target.closest(".builder-sidebar")) {
        return;
      }

      // Canvas selection is independent from inspection. Keep an already-open
      // Inspector stable while the user changes the selected canvas object.
      if (
        target.closest(
          ".builder-preview-section, .builder-preview-layout-block, .builder-header-document-preview, [data-builder-section-id]",
        )
      ) {
        return;
      }

      setInspectorOpen(false);
    };

    document.addEventListener("pointerdown", handleOutsidePointerDown, true);
    return () => {
      document.removeEventListener(
        "pointerdown",
        handleOutsidePointerDown,
        true,
      );
    };
  }, [inspectorOpen]);

  useEffect(() => {
    if (!inspectorOpen || effectiveInspectorMode !== "floating") return;
    const closeFloatingInspector = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInspectorOpen(false);
    };
    window.addEventListener("keydown", closeFloatingInspector);
    return () => window.removeEventListener("keydown", closeFloatingInspector);
  }, [effectiveInspectorMode, inspectorOpen]);

  const selectedSectionIsFirstVisible =
    builderState.sections.find((section) => section.visible)?.id ===
    selectedSection?.id;
  const selectedLayoutBlock = useMemo(() => {
    if (!selectedSection || !isLayoutContainerSection(selectedSection))
      return null;
    if (!selectedLayoutBlockKey) return null;
    return findLayoutBlock(
      selectedSection,
      selectedLayoutBlockKey,
      selectedLayoutColumnKey,
    );
  }, [
    selectedLayoutBlockKey,
    selectedLayoutColumnKey,
    selectedSection,
  ]);
  const inheritedTemplateDynamicContext = useMemo(() => {
    const family = templateBuilderContext?.family ??
      builderEditorContext?.content.family ??
      (builderState.page === "post-single"
        ? "post"
        : builderState.page === "product-single"
          ? "product"
          : builderState.template === "post-single"
            ? "post"
          : builderState.template === "product-single"
              ? "product"
              : activeRoutingTemplateId
                ? activeRoutingTemplateId.toLowerCase().includes("product")
                  ? "product"
                  : "post"
                : undefined);
    if (!family) return undefined;
    return {
      provider: family === "product" ? "woocommerce" : "wordpress",
      source: family,
      mode: "single" as const,
    };
  }, [activeRoutingTemplateId, builderEditorContext?.content.family, builderState.page, builderState.template, templateBuilderContext?.family]);
  const selectedLayoutBlockForInspector = useMemo(() => {
    if (
      !selectedLayoutBlock ||
      selectedLayoutBlock.dynamicContext ||
      !inheritedTemplateDynamicContext
    ) {
      return selectedLayoutBlock;
    }
    return {
      ...selectedLayoutBlock,
      dynamicContext: inheritedTemplateDynamicContext,
    };
  }, [inheritedTemplateDynamicContext, selectedLayoutBlock]);
  const availableLayoutBlockKinds = useMemo(
    () =>
      builderState.page === "header"
        ? (["image", "menu", "button", "embed", "headerSearch", "headerWishlist", "headerCart", "headerAccount", "headerTheme", "headerCategories", "headerLanguage"] as LayoutBlockKind[])
        : getLayoutBlockKindsForState(),
    [builderState.page],
  );
  const frontendHref = builderEditorContext?.navigation.frontendHref;
  const rawViewPageHref =
    frontendHref ?? ordinaryBuilderFrontendHref(builderState.page, customPages);
  const localTenantHref = websiteId
    ? resolveTenantPathHref(rawViewPageHref, {
        websiteId: websiteRouteSegment ?? websiteId,
        pages: customPages.map((page) => ({ key: page.key, slug: page.slug })),
      })
    : undefined;
  const viewPageHref = resolveWebsiteStorefrontHref(
    rawViewPageHref,
    websitePrimaryDomain,
    localTenantHref,
  );
  const handleScopedBuilderNavigate = useCallback(
    (href: string) => {
      // A strict routing-template document already owns the live preview
      // context. When one of its canonical entity hrefs is clicked, switch
      // only the materialized candidate and keep the authored document open.
      if (builderEditorContext?.content.mode === "preview") {
        const candidate = templatePreviewCandidates.find(
          (item) => item.storefrontHref === href,
        );
        if (!candidate) return false;
        setTemplatePreviewIdentity(candidate.identity);
        return true;
      }

      // A normal page Builder has no preview candidate list yet. Resolve a
      // canonical Post target through the existing editor-context boundary,
      // then let the normal query-driven Builder hydration switch context.
      if (!href.startsWith("/") || href.includes("?")) return false;
      const path = href.replace(/\/+$/, "") || "/";
      if (["/", "/shop", "/client", "/cart", "/checkout", "/my-account", "/search", "/categories"].includes(path)) {
        return false;
      }
      if (customPages.some((page) => page.slug === path.slice(1))) return false;
      void (async () => {
        const response = await fetch(builderApiUrl("/api/builder-editor-context", { href: path }), {
          cache: "no-store",
        });
        if (!response.ok) {
          window.location.assign(href);
          return;
        }
        const payload = await response.json() as { target?: { builderHref?: string } | null };
        if (payload.target?.builderHref) {
          router.push(payload.target.builderHref);
        } else {
          window.location.assign(href);
        }
      })();
      return true;
    },
    [builderApiUrl, builderEditorContext?.content.mode, customPages, router, templatePreviewCandidates],
  );
  const scopedPreviewPages = useMemo(
    () =>
      customPages.map((page) => ({
        key: page.key,
        slug: page.slug,
      })),
    [customPages],
  );
  const resolvedHeaderSettings = useMemo<HeaderSettings>(
    () => ({
      menuLocation: "primary",
      logoMaxWidth: shellSettings.headerLogoMaxWidth ?? defaultShellSettings.headerLogoMaxWidth,
      iconVariant: shellSettings.headerIconVariant ?? defaultShellSettings.headerIconVariant,
      iconOrder: shellSettings.headerIconOrder ?? defaultShellSettings.headerIconOrder,
    }),
    [shellSettings.headerLogoMaxWidth, shellSettings.headerIconVariant, shellSettings.headerIconOrder],
  );
  const builderStateSignature = useMemo(
    () => JSON.stringify(builderState),
    [builderState],
  );

  const shellSettingsSignature = useMemo(
    () => JSON.stringify(shellSettings),
    [shellSettings],
  );

  const hasShellPendingChanges =
    committedShellSettingsSignature.length > 0 &&
    shellSettingsSignature !== committedShellSettingsSignature;

  const hasLayoutPendingChanges =
    committedBuilderStateSignature.length > 0 &&
    builderStateSignature !== committedBuilderStateSignature;

  const hasPendingChanges =
    draftReady && (hasLayoutPendingChanges || hasShellPendingChanges);

  const statusText = useMemo(() => {
    if (hasLayoutPendingChanges && hasShellPendingChanges) {
      return `Unpublished changes in ${getLayoutLabel(builderState.page, customPages)} & Settings`;
    }
    if (hasLayoutPendingChanges) {
      return `Unpublished changes in ${getLayoutLabel(builderState.page, customPages)}`;
    }
    if (hasShellPendingChanges) {
      return "Unpublished settings changes";
    }
    return publishStatus;
  }, [hasLayoutPendingChanges, hasShellPendingChanges, builderState.page, customPages, publishStatus]);
  const previewColors = resolveDesignColors(
    builderState.design,
    layoutScheme,
  );
  const previewUsesCanonicalPageBackground =
    (builderState.design.colorScheme ?? "auto") === "auto" &&
    (!builderState.design.pageBackground ||
      builderState.design.pageBackground === lightScheme.pageBackground);
  const previewPageBackground =
    previewUsesCanonicalPageBackground
      ? "var(--uk-global-background-color, #f7f7f4)"
      : previewColors.pageBackground ??
        builderState.design.pageBackground ??
        "#f7f7f4";
  const selectedMenuItem = useMemo(() => {
    function findItem(items: MenuItem[]): MenuItem | null {
      for (const item of items) {
        if (item.id === selectedMenuItemId) return item;
        const child = findItem(item.children ?? []);
        if (child) return child;
      }
      return null;
    }

    return findItem(menuTree);
  }, [menuTree, selectedMenuItemId]);
  const filteredMenuIcons = useMemo(() => {
    const query = menuIconSearch.trim().toLowerCase();
    if (!query) return UIKIT_ICON_OPTIONS;

    return UIKIT_ICON_OPTIONS.filter((option) => {
      return (
        option.name.includes(query) ||
        option.label.toLowerCase().includes(query) ||
        option.keywords.includes(query)
      );
    });
  }, [menuIconSearch]);

  const builderJson = useMemo(
    () =>
      JSON.stringify(
        {
          version: 1,
          key: builderState.page,
          page: builderState.page,
          targetType: builderState.targetType ?? "page",
          template: builderState.template,
          design: builderState.design,
          sections: builderState.sections,
        },
        null,
        2,
      ),
    [builderState],
  );

  useEffect(() => {
    if (initializedStorageScopeRef.current === storageKeys.state) return;
    initializedStorageScopeRef.current = storageKeys.state;
    setPublishedDocumentReady(false);
    try {
      const storedDrafts = window.localStorage.getItem(storageKeys.drafts);
      const parsedDrafts = storedDrafts
        ? (JSON.parse(storedDrafts) as Partial<Record<BuilderLayoutKey, BuilderState>>)
        : {};
      draftMetadataRef.current = loadBuilderDraftMetadata(
        storageKeys.draftMetadata,
      );
      restoredDraftKeysRef.current = new Set(
        Object.keys(parsedDrafts).filter((key): key is BuilderLayoutKey =>
          Boolean(parsedDrafts[key as BuilderLayoutKey]?.sections),
        ),
      );
    } catch {
      restoredDraftKeysRef.current = new Set();
      draftMetadataRef.current = {};
    }
    const localDraft = initialRequestedPage
      ? hydrateDocumentBuilderState(
          loadDraftForKey(initialRequestedPage, storageKeys),
          shellSettings,
        )
      : hydrateDocumentBuilderState(
          resolveBuilderMediaUrls(loadInitialState(storageKeys), wordpressMediaOrigin),
          shellSettings,
        );
    const hasCompatibleInitialDraft = Boolean(
      initialPublishedState &&
      initialRequestedPage === initialPublishedState.page &&
      restoredDraftKeysRef.current.has(initialRequestedPage) &&
      draftMetadataRef.current[initialRequestedPage]?.basePublishedSignature ===
        JSON.stringify(initialPublishedState),
    );
    const draft = initialPublishedState && !hasCompatibleInitialDraft
      ? initialPublishedState
      : localDraft;
    let localPages: BuilderCustomPage[] = [];
    try {
      const rawPages = window.localStorage.getItem(storageKeys.pages);
      localPages = rawPages
        ? (JSON.parse(rawPages) as BuilderCustomPage[]).filter((page) =>
            isBuilderCustomPageKey(page.key),
          )
        : [];
    } catch {
      localPages = [];
    }
    setCustomPages(localPages);
    setBuilderRenderProjection(initialRenderProjection);
    setBuilderState(draft);
    setSelectedId("");
    setDraftReady(true);
  }, [
    initialPublishedState,
    initialRenderProjection,
    initialRequestedPage,
    shellSettings,
    storageKeys,
    wordpressMediaOrigin,
  ]);

  useEffect(() => {
    const scheme = builderState.design.colorScheme ?? "auto";
    if (scheme === "dark") {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.classList.add("dark");
    } else if (scheme === "light") {
      document.documentElement.dataset.theme = "light";
      document.documentElement.classList.remove("dark");
    } else {
      // Revert to visitor theme preference
      const stored = window.localStorage.getItem("wc-store-theme");
      const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)",
      )?.matches;
      const theme =
        stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [builderState.design.colorScheme]);

  useEffect(() => {
    setMenuIconPickerOpen(false);
    setMenuIconSearch("");
  }, [selectedMenuItemId]);

  const measurePreviewViewport = useCallback(() => {
    const shell = previewShellRef.current ?? iframeComparisonShellRef.current;
    if (!shell) return;
    const shellWidth = shell.clientWidth || window.innerWidth;

    let targetWidth = shellWidth;
    if (device === "laptop") {
      targetWidth = laptopPreviewWidth;
    } else if (device === "tablet") {
      targetWidth = customTabletWidth;
    } else if (device === "mobile") {
      targetWidth = customMobileWidth;
    }

    const padding = device === "desktop" ? 0 : 48;
    const availableWidth = Math.max(240, shellWidth - padding);

    let scale = 1;
    if (targetWidth > availableWidth) {
      scale = availableWidth / targetWidth;
    }

    if (previewCanvasWidthRef.current !== targetWidth) {
      previewCanvasWidthRef.current = targetWidth;
      setPreviewCanvasWidth(targetWidth);
    }
    if (previewScaleRef.current !== scale) {
      previewScaleRef.current = scale;
      setPreviewScale(scale);
    }
  }, [device, customMobileWidth, customTabletWidth]);

  const schedulePreviewViewport = useCallback(() => {
    const remainingTransition = sidebarTransitionUntilRef.current - performance.now();
    if (remainingTransition > 0) {
      if (sidebarViewportTimerRef.current === null) {
        sidebarViewportTimerRef.current = window.setTimeout(() => {
          sidebarViewportTimerRef.current = null;
          schedulePreviewViewport();
        }, remainingTransition);
      }
      return;
    }
    if (previewViewportFrameRef.current === null) {
      previewViewportFrameRef.current = window.requestAnimationFrame(() => {
        previewViewportFrameRef.current = null;
        measurePreviewViewport();
      });
    }
  }, [measurePreviewViewport]);

  useEffect(() => {
    const shell = previewShellRef.current ?? iframeComparisonShellRef.current;
    if (!shell) return;

    schedulePreviewViewport();
    const handleSidebarTransitionEnd = () => {
      sidebarTransitionUntilRef.current = 0;
      if (sidebarViewportTimerRef.current !== null) {
        window.clearTimeout(sidebarViewportTimerRef.current);
        sidebarViewportTimerRef.current = null;
      }
      schedulePreviewViewport();
    };
    const observer = new ResizeObserver(schedulePreviewViewport);
    observer.observe(shell);
    window.addEventListener("resize", schedulePreviewViewport);
    window.addEventListener("builder:sidebar-transition-end", handleSidebarTransitionEnd);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedulePreviewViewport);
      window.removeEventListener("builder:sidebar-transition-end", handleSidebarTransitionEnd);
      if (previewViewportFrameRef.current !== null) {
        window.cancelAnimationFrame(previewViewportFrameRef.current);
        previewViewportFrameRef.current = null;
      }
      if (sidebarViewportTimerRef.current !== null) {
        window.clearTimeout(sidebarViewportTimerRef.current);
        sidebarViewportTimerRef.current = null;
      }
    };
  }, [device, iframeComparisonMode, sidebarCollapsed, sidebarWidth, schedulePreviewViewport]);

  const handleDeviceResizeStart = (
    e: React.MouseEvent,
    side: "left" | "right",
  ) => {
    e.preventDefault();
    setIsResizingDevice(true);

    const startX = e.clientX;
    const startWidth =
      device === "mobile" ? customMobileWidth : customTabletWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const multiplier = side === "right" ? 2 : -2;
      const newWidth = Math.max(
        320,
        Math.min(1600, startWidth + deltaX * multiplier),
      );

      if (device === "mobile") {
        setCustomMobileWidth(newWidth);
      } else {
        setCustomTabletWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizingDevice(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  useEffect(() => {
    document.body.classList.add("is-visual-builder-active");

    return () => {
      document.body.classList.remove("is-visual-builder-active");
    };
  }, []);

  useEffect(() => {
    return () => {
      if (shellAutoSaveTimer.current) {
        window.clearTimeout(shellAutoSaveTimer.current);
      }
      if (themeAutoSaveTimer.current) {
        window.clearTimeout(themeAutoSaveTimer.current);
      }
      if (publishCelebrationTimer.current) {
        window.clearTimeout(publishCelebrationTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderPages() {
      try {
        const response = await fetch(builderApiUrl("/api/builder-pages"), {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          pages?: BuilderCustomPage[];
          publishedKeys?: string[];
        };
        const pages = (payload.pages ?? []).filter((page) =>
          isBuilderCustomPageKey(page.key),
        );
        if (!cancelled) {
          setCustomPages(pages);
          setPublishedKeys(payload.publishedKeys ?? []);
          window.localStorage.setItem(
            storageKeys.pages,
            JSON.stringify(pages),
          );
        }
      } catch {
        if (!cancelled) setPageStatus("Builder pages unavailable");
      }
    }

    void loadBuilderPages();

    return () => {
      cancelled = true;
    };
  }, [builderApiUrl, storageKeys.pages]);

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderTemplates() {
      try {
        const response = await fetch(builderApiUrl("/api/builder-templates"), {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          templates?: BuilderSavedTemplate[];
        };
        if (!cancelled) {
          setSavedTemplates(payload.templates ?? []);
        }
      } catch {
        if (!cancelled) setTemplateStatus("Templates unavailable");
      }
    }

    void loadBuilderTemplates();

    return () => {
      cancelled = true;
    };
  }, [builderApiUrl]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviewCategories() {
      try {
        const params = new URLSearchParams();
        if (websiteId) params.set("websiteId", websiteId);
        const query = params.toString();
        const response = await fetch(
          `/api/builder-preview-categories${query ? `?${query}` : ""}`,
          {
          cache: "no-store",
          },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as {
          categoryTree?: CategoryTreeItem[];
          countsBySlug?: Record<string, number>;
        };
        if (!cancelled) {
          setPreviewCategoryTree(payload.categoryTree ?? []);
          setPreviewCategoryCounts(payload.countsBySlug ?? {});
        }
      } catch {
        if (!cancelled) {
          setPreviewCategoryTree([]);
          setPreviewCategoryCounts({});
        }
      }
    }

    void loadPreviewCategories();

    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  // Compatibility bridge for the legacy semantic Product blocks. Ordinary
  // bound elements use the canonical root DynamicItemContext projection.
  useEffect(() => {
    const fixedIdentity = individualBuilderContext?.family === "product"
      ? individualBuilderContext.identity
      : templateBuilderContext?.family === "product"
        ? templatePreviewIdentity
        : null;
    if (!fixedIdentity) return;
    setPreviewProducts((current) => {
      const selectedIndex = current.findIndex((product) =>
        String(product.databaseId ?? product.id) === fixedIdentity.contentId,
      );
      if (selectedIndex <= 0) return current;
      return [current[selectedIndex]!, ...current.slice(0, selectedIndex), ...current.slice(selectedIndex + 1)];
    });
  }, [individualBuilderContext, previewProducts.length, templateBuilderContext?.family, templatePreviewIdentity]);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviewProducts() {
      try {
        const params = new URLSearchParams({ limit: "48" });
        if (websiteId) params.set("websiteId", websiteId);
        const response = await fetch(`/api/builder-preview-products?${params}`, {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          products?: ProductNode[];
        };
        if (!cancelled) {
          setPreviewProducts(payload.products ?? []);
        }
      } catch {
        if (!cancelled) setPreviewProducts([]);
      }
    }

    void loadPreviewProducts();

    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  useEffect(() => {
    if (!draftReady) return;

    const requestedDocument = searchParams.get("document");
    const requestedRoutingTemplate = searchParams.get("routingTemplate");
    const requestedIndividual = searchParams.get("individual");
    const requestedPreviewProvider = searchParams.get("previewProvider");
    const requestedPreviewContentType = searchParams.get("previewContentType");
    const requestedPreviewContentId = searchParams.get("previewContentId");
    if (!requestedDocument || (
      requestedDocument === (individualBuilderContext?.documentId ?? templateBuilderContext?.documentId) &&
      requestedRoutingTemplate === activeRoutingTemplateId &&
      requestedIndividual === activeIndividualContextToken
    )) return;
    let cancelled = false;
    void (async () => {
      setPublishedDocumentReady(false);
      const response = await fetch(builderApiUrl(
        requestedRoutingTemplate || requestedIndividual
          ? "/api/builder-editor-context"
          : "/api/builder-layouts",
        {
          document: requestedDocument,
          ...(requestedRoutingTemplate ? { routingTemplate: requestedRoutingTemplate } : {}),
          ...(requestedIndividual ? { individual: requestedIndividual } : {}),
          ...(requestedPreviewProvider ? { previewProvider: requestedPreviewProvider } : {}),
          ...(requestedPreviewContentType ? { previewContentType: requestedPreviewContentType } : {}),
          ...(requestedPreviewContentId ? { previewContentId: requestedPreviewContentId } : {}),
        },
      ), { cache: "no-store" });
      if (cancelled) return;
      if (!response.ok) {
        setPublishStatus(response.status === 404 ? "Document not found" : "Invalid document target");
        setPublishedDocumentReady(true);
        return;
      }
      const payload = await response.json() as {
        layout?: BuilderState;
        renderLayout?: BuilderState;
        context?: typeof templateBuilderContext;
        candidates?: typeof templatePreviewCandidates;
        previewIdentity?: typeof templatePreviewIdentity;
        unavailable?: boolean;
        editorContext?: BuilderEditorContext;
      };
      if (!payload.layout?.sections?.length || (!requestedRoutingTemplate && !payload.layout.page?.startsWith("dynamic:"))) {
        setPublishStatus("Invalid document response");
        setPublishedDocumentReady(true);
        return;
      }
      const nextState = normalizeBuilderState(payload.layout, payload.layout.page);
      setActiveDynamicDocumentId(requestedDocument.startsWith("layout:builder:dynamic:") ? requestedDocument : null);
      setActiveRoutingTemplateId(requestedRoutingTemplate);
      setActiveIndividualContextToken(requestedIndividual);
      setBuilderEditorContext(payload.editorContext ?? null);
      if (payload.editorContext?.document.kind === "individual") {
        setIndividualBuilderContext((payload.context as typeof individualBuilderContext) ?? null);
        setTemplateBuilderContext(null);
        setTemplatePreviewCandidates([]);
        setTemplatePreviewIdentity(null);
      } else if (payload.editorContext?.document.kind === "routing-template") {
        setIndividualBuilderContext(null);
        setTemplateBuilderContext(payload.context ?? null);
        setTemplatePreviewCandidates(payload.candidates ?? []);
        setTemplatePreviewIdentity(payload.previewIdentity ?? null);
      } else {
        setIndividualBuilderContext(null);
        setTemplateBuilderContext(null);
        setTemplatePreviewCandidates([]);
        setTemplatePreviewIdentity(null);
      }
      setBuilderState(nextState);
      const sourceSignature = JSON.stringify(nextState);
      setBuilderRenderProjection(payload.renderLayout?.sections?.length ? {
        page: nextState.page,
        sourceSignature,
        sections: payload.renderLayout.sections,
      } : null);
      setSelectedId(nextState.sections[0]?.id ?? "");
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
      setCommittedBuilderStateSignature(JSON.stringify(nextState));
      setPublishStatus(payload.unavailable ? "Assigned content unavailable" : "Published document loaded");
      setPublishedDocumentReady(true);
    })();
    return () => { cancelled = true; };
  }, [activeIndividualContextToken, activeRoutingTemplateId, builderApiUrl, draftReady, individualBuilderContext?.documentId, searchParams, templateBuilderContext?.documentId]);

  useEffect(() => {
    if (!draftReady) return;
    const shellTransition = shellTransitionRef.current;
    if (shellTransition) {
      const requestedPage = resolveRequestedPageFromSearch(builderState.page);
      if (requestedPage !== shellTransition.page) return;
      shellTransitionRef.current = null;
    }
    // Shell entry owns the active document transition until the synchronized
    // URL is visible. Do not let the previous page query restore the page
    // draft over the shell target during that transaction.
    if (activeShellEntry) return;
    if (searchParams.get("document")) return;
    const requestedPage = searchParams.get("page") ?? searchParams.get("template");
    const nextKey = resolveRequestedPageFromSearch(
      parseBuilderLayoutKey(requestedPage) ?? builderState.page,
    );
    if (nextKey === builderState.page) return;
    setPublishedDocumentReady(false);
    const nextState = hydrateDocumentBuilderState(
      loadDraftForKey(nextKey, storageKeys),
      shellSettings,
    );
    setBuilderState(nextState);
    setSelectedId("");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
    setPublishStatus("Loaded from menu selection");
  }, [
    builderState.page,
    activeShellEntry,
    customPages,
    draftReady,
    resolveRequestedPageFromSearch,
    searchParams,
    storageKeys,
    websiteId,
  ]);

  useEffect(() => {
    if (!menuTree.length) {
      setSelectedMenuItemId(null);
      return;
    }

    setSelectedMenuItemId((current) => {
      if (current && selectedMenuItem) return current;
      return menuTree[0]?.id ?? null;
    });
  }, [menuTree, selectedMenuItem]);

  useEffect(() => {
    let cancelled = false;

    async function loadShellSettings() {
      try {
        const [response, themeResponse] = await Promise.all([
          fetch(builderApiUrl("/api/builder-shell"), { cache: "no-store" }),
          fetch(builderApiUrl("/api/builder-theme-settings"), { cache: "no-store" }),
        ]);
        if (response.ok) {
          const payload = (await response.json()) as {
            settings?: Partial<BuilderShellSettings>;
          };
          if (!cancelled && payload.settings) {
          const nextShellSettings = {
            ...defaultShellSettings,
            ...payload.settings,
          };
          setShellSettings(nextShellSettings);
          setCommittedShellSettingsSignature(
            JSON.stringify(nextShellSettings),
          );
          }
        }
        if (themeResponse.ok) {
          const themePayload = (await themeResponse.json()) as { settings?: BuilderThemeSettings };
          if (!cancelled && themePayload.settings) setThemeSettings(themePayload.settings);
        }
      } catch {
        if (!cancelled) setShellStatus("Shell settings unavailable");
      }
    }

    void loadShellSettings();

    return () => {
      cancelled = true;
    };
  }, [builderApiUrl]);

  useEffect(() => {
    if (!draftReady || !publishedDocumentReady) return;
    // A published document is already the authoritative fallback. Persisting
    // it again as a draft makes a subsequent fresh import vulnerable to an
    // old browser draft winning during hydration.
    if (
      committedBuilderStateSignature.length > 0 &&
      builderStateSignature === committedBuilderStateSignature
    ) {
      return;
    }
    const pendingSkip = skipImportedDraftPersistenceRef.current;
    if (pendingSkip) {
      skipImportedDraftPersistenceRef.current = null;
      if (
        pendingSkip.page === builderState.page &&
        pendingSkip.signature === JSON.stringify(builderState)
      ) {
        return;
      }
    }
    window.localStorage.setItem(storageKeys.state, JSON.stringify(builderState));
    let drafts: Partial<Record<BuilderLayoutKey, BuilderState>> = {};
    try {
      const rawDrafts = window.localStorage.getItem(storageKeys.drafts);
      drafts = rawDrafts
        ? (JSON.parse(rawDrafts) as Partial<
            Record<BuilderLayoutKey, BuilderState>
          >)
        : {};
    } catch {
      drafts = {};
    }
    drafts[builderState.page] = builderState;
    window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));
    const metadata = loadBuilderDraftMetadata(storageKeys.draftMetadata);
    metadata[builderState.page] = {
      ...(committedBuilderStateSignature
        ? { basePublishedSignature: committedBuilderStateSignature }
        : {}),
    };
    draftMetadataRef.current = metadata;
    restoredDraftKeysRef.current.add(builderState.page);
    window.localStorage.setItem(
      storageKeys.draftMetadata,
      JSON.stringify(metadata),
    );
  }, [
    builderState,
    builderStateSignature,
    committedBuilderStateSignature,
    draftReady,
    publishedDocumentReady,
    storageKeys,
  ]);

  const runNextIframeSave = useCallback(() => {
    if (iframeSaveInFlightRef.current) return;
    const pending = iframePendingSaveRef.current;
    if (!pending) return;
    iframePendingSaveRef.current = null;
    iframeSaveInFlightRef.current = true;
    void (async () => {
      const response = await fetch(builderApiUrl("/api/builder-layouts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activeDynamicDocumentId
          ? { ...pending.state, action: "save", documentId: activeDynamicDocumentId }
          : pending.state),
      });
      iframeSaveInFlightRef.current = false;
      if (!response.ok) {
        setPublishStatus("Iframe preview update failed");
      } else {
        iframeSavedSignatureRef.current = pending.signature;
      }
      if (iframePendingSaveRef.current) {
        queueMicrotask(() => iframeRunSaveRef.current());
      }
    })();
  }, [activeDynamicDocumentId, builderApiUrl]);
  useEffect(() => {
    iframeRunSaveRef.current = runNextIframeSave;
    iframeFlushSaveRef.current = () => {
      if (iframeSaveTimerRef.current !== null) {
        window.clearTimeout(iframeSaveTimerRef.current);
        iframeSaveTimerRef.current = null;
      }
      iframeRunSaveRef.current();
    };
  }, [runNextIframeSave]);

  useEffect(() => {
    if (!iframeMutationSyncEnabled || (iframeDiagnosticMode !== "settled" && iframeDiagnosticMode !== "full") || !iframeComparisonMode || !draftReady || !publishedDocumentReady) {
      iframeSavedSignatureRef.current = null;
      iframePendingSaveRef.current = null;
      return;
    }
    const signature = JSON.stringify(builderState);
    if (iframeSavedSignatureRef.current === null) {
      iframeSavedSignatureRef.current = signature;
      return;
    }
    if (iframeSavedSignatureRef.current === signature) return;
    const sequence = iframeSaveSequenceRef.current + 1;
    iframeSaveSequenceRef.current = sequence;
    iframePendingSaveRef.current = {
      sequence,
      signature,
      state: structuredClone(builderState),
    };
    if (iframeSaveTimerRef.current !== null) window.clearTimeout(iframeSaveTimerRef.current);
    iframeSaveTimerRef.current = window.setTimeout(() => {
      iframeSaveTimerRef.current = null;
      iframeRunSaveRef.current();
    }, 180);
    return () => {
      if (iframeSaveTimerRef.current !== null) {
        window.clearTimeout(iframeSaveTimerRef.current);
        iframeSaveTimerRef.current = null;
      }
    };
  }, [
    builderState,
    draftReady,
    iframeComparisonMode,
    iframeDiagnosticMode,
    iframeMutationSyncEnabled,
    publishedDocumentReady,
  ]);

  useEffect(() => {
    if (!iframeMutationSyncEnabled || !iframeComparisonMode || (iframeDiagnosticMode !== "settled" && iframeDiagnosticMode !== "full")) return;
    const flushAfterControlCommit = () => {
      window.setTimeout(() => iframeFlushSaveRef.current(), 0);
    };
    window.addEventListener("pointerup", flushAfterControlCommit, true);
    window.addEventListener("change", flushAfterControlCommit, true);
    return () => {
      window.removeEventListener("pointerup", flushAfterControlCommit, true);
      window.removeEventListener("change", flushAfterControlCommit, true);
    };
  }, [iframeComparisonMode, iframeDiagnosticMode, iframeMutationSyncEnabled]);

  useEffect(() => {
    if (builderState.page === "header") {
      setHeaderDocumentPreviewState(builderState);
    }
    if (builderState.page === "footer" && footerDocumentPreviewState) {
      setFooterDocumentPreviewState(builderState);
    }
  }, [builderState, footerDocumentPreviewState]);

  useEffect(() => {
    if (!draftReady || builderState.page === "header" || headerDocumentPreviewState) return;
    let cancelled = false;

    async function loadHeaderDocumentPreview() {
      try {
        const response = await fetch(builderApiUrl("/api/builder-layouts", { key: "header" }), {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as { layout?: BuilderState | null };
        if (cancelled || !payload.layout?.sections?.length) return;
        const nextHeaderState = hydrateDocumentBuilderState(
          normalizeBuilderState({
            page: "header",
            targetType: "header",
            documentId: payload.layout.documentId,
            displayName: payload.layout.displayName,
            design: { ...defaultDesign, ...(payload.layout.design ?? {}) },
            sections: payload.layout.sections,
          }, "header"),
          shellSettings,
        );
        setHeaderDocumentPreviewState(nextHeaderState);
      } catch {
        // Keep the locally hydrated header document when the published layout is unavailable.
      }
    }

    void loadHeaderDocumentPreview();
    return () => {
      cancelled = true;
    };
  }, [builderApiUrl, builderState.page, draftReady, headerDocumentPreviewState, shellSettings]);

  useEffect(() => {
    const requestedPage = searchParams.get("page") ?? searchParams.get("template");
    if (!draftReady || requestedPage !== "header") return;

    const routeIdentity = `${websiteId ?? "root"}:header:${searchParams.toString()}`;
    if (headerRouteHydrationRef.current === routeIdentity) return;
    // Shell entry has already selected its authoritative in-memory state. Do
    // not replace active edits when the URL is synchronized by that entry.
    if (activeShellEntry) {
      headerRouteHydrationRef.current = routeIdentity;
      return;
    }
    headerRouteHydrationRef.current = routeIdentity;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(builderApiUrl("/api/builder-layouts", { key: "header" }), {
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as { layout?: BuilderState | null };
        if (cancelled || !payload.layout?.sections?.length) return;
        const nextState = hydrateDocumentBuilderState(
          normalizeBuilderState(payload.layout, "header"),
          shellSettings,
        );
        setHeaderDocumentPreviewState(nextState);
        setBuilderState(nextState);
        undoHistoryRef.current = [structuredClone(nextState)];
        setCommittedBuilderStateSignature(JSON.stringify(nextState));
        setPublishedDocumentReady(true);
        setSelectedId(nextState.sections[0]?.id ?? "");
        setSelectedLayoutColumnKey(null);
        setSelectedLayoutBlockKey(null);
        setOpenLayoutItemId(null);
        removeBuilderDraft(storageKeys, "header");
        restoredDraftKeysRef.current.delete("header");
        delete draftMetadataRef.current.header;
      } catch {
        // Keep the current state if the persisted Header cannot be read.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeShellEntry, builderApiUrl, draftReady, searchParams, shellSettings, storageKeys, websiteId]);

  useEffect(() => {
    const requestedPage = searchParams.get("page") ?? searchParams.get("template");
    if (!draftReady || requestedPage !== "footer") return;

    const routeIdentity = `${websiteId ?? "root"}:footer:${searchParams.toString()}`;
    if (footerRouteHydrationRef.current === routeIdentity) return;
    if (activeShellEntry) {
      footerRouteHydrationRef.current = routeIdentity;
      return;
    }
    footerRouteHydrationRef.current = routeIdentity;

    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(builderApiUrl("/api/builder-layouts", { key: "footer" }), {
          cache: "no-store",
        });
        if (!response.ok || cancelled) return;
        const payload = (await response.json()) as { layout?: BuilderState | null };
        if (cancelled || !payload.layout?.sections?.length) return;
        const nextState = hydrateDocumentBuilderState(
          normalizeBuilderState({
            page: "footer",
            targetType: "footer",
            documentId: payload.layout.documentId,
            displayName: payload.layout.displayName,
            design: { ...defaultDesign, ...(payload.layout.design ?? {}) },
            sections: payload.layout.sections,
          }, "footer"),
          shellSettings,
        );
        setFooterDocumentPreviewState(nextState);
        setBuilderState(nextState);
        undoHistoryRef.current = [structuredClone(nextState)];
        setCommittedBuilderStateSignature(JSON.stringify(nextState));
        setPublishedDocumentReady(true);
        setSelectedId(nextState.sections[0]?.id ?? "");
        setSelectedLayoutColumnKey(null);
        setSelectedLayoutBlockKey(null);
        setOpenLayoutItemId(null);
        removeBuilderDraft(storageKeys, "footer");
        restoredDraftKeysRef.current.delete("footer");
        delete draftMetadataRef.current.footer;
      } catch {
        // Keep the current state if the persisted Footer cannot be read.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [activeShellEntry, builderApiUrl, draftReady, searchParams, shellSettings, storageKeys, websiteId]);

  const loadFooterDocumentPreview = useCallback(async () => {
    if (footerDocumentPreviewState) return footerDocumentPreviewState;
    if (footerDocumentLoadRef.current) return footerDocumentLoadRef.current;

    const request = fetch(builderApiUrl("/api/builder-layouts", { key: "footer" }), {
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as { layout?: BuilderState | null };
        if (!payload.layout?.sections?.length) return null;
        const nextState = hydrateDocumentBuilderState(
          normalizeBuilderState({
            page: "footer",
            targetType: "footer",
            documentId: payload.layout.documentId,
            displayName: payload.layout.displayName,
            design: { ...defaultDesign, ...(payload.layout.design ?? {}) },
            sections: payload.layout.sections,
          }, "footer"),
          shellSettings,
        );
        setFooterDocumentPreviewState(nextState);
        return nextState;
      })
      .catch(() => null)
      .finally(() => {
        footerDocumentLoadRef.current = null;
      });

    footerDocumentLoadRef.current = request;
    return request;
  }, [builderApiUrl, footerDocumentPreviewState, shellSettings]);

  useEffect(() => {
    if (!draftReady || footerDocumentPreviewState) return;
    void loadFooterDocumentPreview();
  }, [draftReady, footerDocumentPreviewState, loadFooterDocumentPreview]);

  useEffect(() => {
    if (!draftReady) return;
    if (skipUndoCaptureRef.current) {
      skipUndoCaptureRef.current = false;
      return;
    }

    const history = undoHistoryRef.current;
    const previous = history[history.length - 1];
    if (previous && JSON.stringify(previous) === JSON.stringify(builderState)) {
      return;
    }

    redoHistoryRef.current = [];
    history.push(structuredClone(builderState));
    if (history.length > 80) history.shift();
  }, [builderState, draftReady]);

  useEffect(() => {
    if (!draftReady) return;
    if (committedBuilderStateSignature) return;
    setCommittedBuilderStateSignature(JSON.stringify(builderState));
  }, [builderState, committedBuilderStateSignature, draftReady]);

  useEffect(() => {
    const active = activeShellEntry;
    if (!active || builderState.page !== active.shellType) return;
    const rootId = builderState.sections.some(
      (section) => section.id === active.rootId,
    )
      ? active.rootId
      : builderState.sections[0]?.id;
    if (!rootId) return;

    if (selectedId === rootId) {
      setActiveShellEntry(null);
      return;
    }
    setSelectedId(rootId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setInspectorTab("layout");
    setSectionSettingsOpen(true);
    setInspectorOpen(true);
    // Shell entry establishes the initial root selection only. Descendant
    // clicks must continue through the ordinary Builder selection path.
    setActiveShellEntry(null);
  }, [activeShellEntry, builderState.page, builderState.sections, selectedId]);

  const switchBuilderTarget = (
    nextKey: BuilderLayoutKey,
    options: { syncUrl?: boolean; state?: BuilderState } = {},
  ) => {
    if (
      (builderState.page === "header" || builderState.page === "footer") &&
      nextKey !== "header" &&
      nextKey !== "footer"
    ) {
      // Navigation from a shell is a real document transition. Clear the
      // shell context before replacing the URL so the old header query cannot
      // restore Header state over the newly selected page.
      shellTransitionRef.current = { direction: "exit", page: nextKey };
      setActiveShellEntry(null);
      setShellPageContextState(null);
      setHeaderSelected(false);
      setFooterSelected(false);
      setSectionSettingsOpen(false);
      setInspectorOpen(false);
    }
    setActiveDynamicDocumentId(null);
    setActiveRoutingTemplateId(null);
    setActiveIndividualContextToken(null);
    setTemplateBuilderContext(null);
    setIndividualBuilderContext(null);
    setBuilderEditorContext(null);
    setTemplatePreviewCandidates([]);
    setTemplatePreviewIdentity(null);
    const nextState = options.state ?? hydrateDocumentBuilderState(
      loadDraftForKey(nextKey, storageKeys),
      shellSettings,
    );
    undoHistoryRef.current = [structuredClone(nextState)];
    setCommittedBuilderStateSignature(JSON.stringify(nextState));
    setBuilderState(nextState);
    setSelectedId("");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
    setPublishStatus("Local draft autosaves");

    if (options.syncUrl !== false) {
      router.replace(`${pathname}?page=${nextKey}`, { scroll: false });
    }
  };

  const switchBuilderTargetFromNavigation = useCallback(async (nextKey: BuilderLayoutKey) => {
    const localState = hydrateDocumentBuilderState(
      loadDraftForKey(nextKey, storageKeys),
      shellSettings,
    );
    if (localState.sections.length > 0) {
      switchBuilderTarget(nextKey, { state: localState });
      return;
    }

    // A shell can be entered before the page has a local draft. Navigation
    // must then use the published document instead of replacing the canvas
    // with the empty default state.
    try {
      const response = await fetch(builderApiUrl("/api/builder-layouts", { key: nextKey }), {
        cache: "no-store",
      });
      const payload = (await response.json()) as { layout?: BuilderState | null };
      if (response.ok && payload.layout?.sections?.length) {
        const publishedState = hydrateDocumentBuilderState(
          normalizeBuilderState(payload.layout, nextKey),
          shellSettings,
        );
        switchBuilderTarget(nextKey, { state: publishedState });
        return;
      }
    } catch {
      // Fall through to the normal local/default transition when the
      // published document cannot be loaded.
    }
    switchBuilderTarget(nextKey, { state: localState });
  }, [builderApiUrl, shellSettings, storageKeys, switchBuilderTarget]);

  const updateSelected = (patch: Partial<BuilderSection>) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === selectedId
          ? applyContentPatch(section, patch, contentLanguage, primaryContentLanguage)
          : section,
      ),
    }));
  };

  const cycleSectionSpacing = (
    sectionId: string,
    field: "topSpacing" | "bottomSpacing" | "topMargin" | "bottomMargin",
  ) => {
    const cycleOrder: SectionSpacing[] = [
      "inherit",
      "none",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "3xl",
    ];
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const currentVal = section[field] ?? "inherit";
        const currentIndex = cycleOrder.indexOf(currentVal);
        const nextIndex = (currentIndex + 1) % cycleOrder.length;
        const nextVal = cycleOrder[nextIndex];
        return {
          ...section,
          [field]: nextVal,
        };
      }),
    }));
  };

  const updateLayoutBlockByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    patch: Partial<BuilderLayoutBlock>,
    mutationLanguage = contentLanguageRef.current,
  ) => {
    const currentSection = builderState.sections.find(
      (section) => section.id === sectionId,
    );
    const currentBlock = currentSection
      ? findLayoutBlock(currentSection, blockKey, columnKey)
      : null;
    const isHeaderButton =
      sectionId === "header-document" &&
      (currentBlock?.id === "header-button" || currentBlock?.kind === "button");
    const headerButtonOverrideFields: Array<[
      keyof BuilderLayoutBlock,
      keyof NonNullable<BuilderLayoutBlock["headerButtonOverrides"]>,
    ]> = [
      ["buttonStyle", "variant"],
      ["size", "size"],
      ["fullWidthButton", "width"],
      ["buttonBg", "background"],
      ["buttonTextColor", "text"],
      ["buttonBorderRadius", "radius"],
      ["buttonBorderWidth", "border"],
      ["buttonBorderColor", "border"],
      ["buttonPaddingY", "padding"],
      ["buttonPaddingX", "padding"],
      ["buttonHoverBg", "hoverBackground"],
      ["buttonHoverTextColor", "hoverText"],
      ["buttonHoverBorderColor", "hoverBorder"],
      ["buttonHoverEffect", "hoverEffect"],
      ["buttonHoverTransform", "hoverEffect"],
      ["buttonHoverBoxShadow", "hoverEffect"],
      ["typography", "typography"],
    ];
    const canonicalPatch = isHeaderButton
      ? {
          ...patch,
          headerButtonOverrides: headerButtonOverrideFields.reduce(
            (overrides, [field, owner]) =>
              Object.prototype.hasOwnProperty.call(patch, field)
                ? { ...overrides, [owner]: patch[field] !== undefined }
                : overrides,
            {
              ...(currentBlock?.headerButtonOverrides ?? {}),
              ...(patch.headerButtonOverrides ?? {}),
            },
          ),
        }
      : patch;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return updateLayoutBlockEverywhere(section, blockKey, (block) =>
          applyContentPatch(
            block,
            canonicalPatch,
            mutationLanguage,
            primaryContentLanguage,
          ),
        );
      }),
    }));
  };

  const updateGridItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number],
  ) => {
    const mutateCanonical = (section: BuilderSection) => section.rows !== undefined;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (mutateCanonical(section)) {
          return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
            const gridItems = [...(block.gridItems ?? [])];
            gridItems[itemIndex] = applyContentPatch(gridItems[itemIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
            return { ...block, gridItems };
          });
        }
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const gridItems = [...(block.gridItems ?? [])];
                gridItems[itemIndex] = applyContentPatch(
                  gridItems[itemIndex] ?? {},
                  patch,
                  contentLanguage,
                  primaryContentLanguage,
                );
                return { ...block, gridItems };
              }),
            };
          }),
        };
      }),
    }));
  };

  const deleteGridItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => ({ ...block, gridItems: (block.gridItems ?? []).filter((_, index) => index !== itemIndex) }));
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                return {
                  ...block,
                  gridItems: (block.gridItems ?? []).filter(
                    (_, index) => index !== itemIndex,
                  ),
                };
              }),
            };
          }),
        };
      }),
    }));
  };

  const duplicateGridItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const gridItems = [...(block.gridItems ?? [])];
          const source = gridItems[itemIndex];
          if (!source) return block;
          gridItems.splice(itemIndex + 1, 0, { ...source, id: `grid-${Date.now().toString(36)}` });
          return { ...block, gridItems };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const gridItems = [...(block.gridItems ?? [])];
                const source = gridItems[itemIndex];
                if (!source) return block;
                gridItems.splice(itemIndex + 1, 0, {
                  ...source,
                  id: `grid-${Date.now().toString(36)}`,
                });
                return { ...block, gridItems };
              }),
            };
          }),
        };
      }),
    }));
  };

  const deleteBadgeByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    badgeIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => ({ ...block, badges: (block.badges ?? []).filter((_, index) => index !== badgeIndex) }));
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                return {
                  ...block,
                  badges: (block.badges ?? []).filter(
                    (_, index) => index !== badgeIndex,
                  ),
                };
              }),
            };
          }),
        };
      }),
    }));
  };

  const duplicateBadgeByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    badgeIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const badges = [...(block.badges ?? [])];
          const source = badges[badgeIndex];
          if (!source) return block;
          badges.splice(badgeIndex + 1, 0, { ...source, id: `badge-${Date.now().toString(36)}` });
          return { ...block, badges };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const badges = [...(block.badges ?? [])];
                const source = badges[badgeIndex];
                if (!source) return block;
                badges.splice(badgeIndex + 1, 0, {
                  ...source,
                  id: `badge-${Date.now().toString(36)}`,
                });
                return { ...block, badges };
              }),
            };
          }),
        };
      }),
    }));
  };

  const moveGridItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const gridItems = [...(block.gridItems ?? [])];
          const [moved] = gridItems.splice(fromIndex, 1);
          gridItems.splice(toIndex, 0, moved);
          return { ...block, gridItems };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const gridItems = [...(block.gridItems ?? [])];
                const [moved] = gridItems.splice(fromIndex, 1);
                gridItems.splice(toIndex, 0, moved);
                return { ...block, gridItems };
              }),
            };
          }),
        };
      }),
    }));
  };

  const moveBadgeByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const badges = [...(block.badges ?? [])];
          const [moved] = badges.splice(fromIndex, 1);
          badges.splice(toIndex, 0, moved);
          return { ...block, badges };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const badges = [...(block.badges ?? [])];
                const [moved] = badges.splice(fromIndex, 1);
                badges.splice(toIndex, 0, moved);
                return { ...block, badges };
              }),
            };
          }),
        };
      }),
    }));
  };

  const moveButtonByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const buttons = [...(block.buttons ?? [])];
          const [moved] = buttons.splice(fromIndex, 1);
          buttons.splice(toIndex, 0, moved);
          return { ...block, buttons };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const buttons = [...(block.buttons ?? [])];
                const [moved] = buttons.splice(fromIndex, 1);
                buttons.splice(toIndex, 0, moved);
                return { ...block, buttons };
              }),
            };
          }),
        };
      }),
    }));
  };

  const moveListItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const items = block.listItems ?? (block.items ?? []).map((text, index) => ({ id: `${block.id ?? blockKey}-item-${index}`, text }));
          const next = [...items];
          const [moved] = next.splice(fromIndex, 1);
          next.splice(toIndex, 0, moved);
          return { ...block, listItems: next };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const items = block.listItems ?? (block.items ?? []).map((text, index) => ({ id: `${block.id ?? currentBlockKey}-item-${index}`, text }));
                const [moved] = [...items].splice(fromIndex, 1);
                const next = [...items];
                next.splice(fromIndex, 1);
                next.splice(toIndex, 0, moved);
                return { ...block, listItems: next };
              }),
            };
          }),
        };
      }),
    }));
  };

  const deleteButtonByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    buttonIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => ({ ...block, buttons: (block.buttons ?? []).filter((_, index) => index !== buttonIndex) }));
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                return {
                  ...block,
                  buttons: (block.buttons ?? []).filter(
                    (_, index) => index !== buttonIndex,
                  ),
                };
              }),
            };
          }),
        };
      }),
    }));
  };

  const duplicateButtonByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    buttonIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const buttons = [...(block.buttons ?? [])];
          const source = buttons[buttonIndex];
          if (!source) return block;
          buttons.splice(buttonIndex + 1, 0, { ...source, id: `button-${Date.now().toString(36)}` });
          return { ...block, buttons };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const buttons = [...(block.buttons ?? [])];
                const source = buttons[buttonIndex];
                if (!source) return block;
                buttons.splice(buttonIndex + 1, 0, {
                  ...source,
                  id: `button-${Date.now().toString(36)}`,
                });
                return { ...block, buttons };
              }),
            };
          }),
        };
      }),
    }));
  };

  const deleteListItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const items = block.listItems ?? (block.items ?? []).map((text, index) => ({ id: `${block.id ?? blockKey}-item-${index}`, text }));
          return { ...block, listItems: items.filter((_, index) => index !== itemIndex) };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const items = block.listItems ?? (block.items ?? []).map((text, index) => ({ id: `${block.id ?? currentBlockKey}-item-${index}`, text }));
                return { ...block, listItems: items.filter((_, index) => index !== itemIndex) };
              }),
            };
          }),
        };
      }),
    }));
  };

  const duplicateListItemByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        if (section.rows !== undefined) return updateBlockInLayoutColumn(section, columnKey, blockKey, (block) => {
          const items = [...(block.listItems ?? (block.items ?? []).map((text, index) => ({ id: `${block.id ?? blockKey}-item-${index}`, text })))];
          const source = items[itemIndex];
          if (!source) return block;
          items.splice(itemIndex + 1, 0, { ...source, id: `${source.id}-copy-${Date.now().toString(36)}` });
          return { ...block, listItems: items };
        });
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, columnIndex) => {
            const itemKey = item.id ?? `layout-item-${columnIndex}`;
            if (itemKey !== columnKey) return item;
            return {
              ...item,
              blocks: getLayoutItemBlocks(item).map((block, blockIndex) => {
                const currentBlockKey =
                  block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const items = block.listItems ?? (block.items ?? []).map((text, index) => ({ id: `${block.id ?? currentBlockKey}-item-${index}`, text }));
                const source = items[itemIndex];
                if (!source) return block;
                items.splice(itemIndex + 1, 0, source);
                return { ...block, listItems: items };
              }),
            };
          }),
        };
      }),
    }));
  };

  const deleteSectionBadgeByKey = (sectionId: string, badgeIndex: number) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          badges: (section.badges ?? []).filter(
            (_, index) => index !== badgeIndex,
          ),
        };
      }),
    }));
  };

  const duplicateSectionBadgeByKey = (
    sectionId: string,
    badgeIndex: number,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const badges = [...(section.badges ?? [])];
        const source = badges[badgeIndex];
        if (!source) return section;
        badges.splice(badgeIndex + 1, 0, {
          ...source,
          id: `badge-${Date.now().toString(36)}`,
        });
        return { ...section, badges };
      }),
    }));
  };

  const moveSectionBadgeByKey = (
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) => {
    if (fromIndex === toIndex) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        const badges = [...(section.badges ?? [])];
        const [moved] = badges.splice(fromIndex, 1);
        badges.splice(toIndex, 0, moved);
        return { ...section, badges };
      }),
    }));
  };

  const updateDesign = (patch: Partial<BuilderDesign>) => {
    setBuilderState((current) => ({
      ...current,
      design: {
        ...current.design,
        ...patch,
      },
    }));
  };

  const applyDesignPreset = (preset: NonNullable<BuilderDesign["preset"]>) => {
    setBuilderState((current) => ({
      ...current,
      design: designPresets[preset],
    }));
  };

  const openElementsPanel = (target?: { sectionId: string; columnKey: string }) => {
    // A Structure column action selects the column and requests its Inspector
    // in the same event turn before opening Library. Treat that target as the
    // appropriate Inspector return state even when the prior panel was closed.
    previousInspectorOpenRef.current = inspectorOpen || Boolean(target);
    setElementLibraryTarget(target ?? null);
    setSidebarCollapsed(false);
    setSidebarTab("builder");
    setInspectorOpen(false);
    setElementLibraryOpen(true);
  };

  const closeElementLibrary = (restoreInspector = true) => {
    setElementLibraryOpen(false);
    if (restoreInspector && (previousInspectorOpenRef.current || elementLibraryTarget)) {
      setInspectorOpen(true);
    }
    previousInspectorOpenRef.current = false;
    setElementLibraryTarget(null);
  };

  const openInspectorPanel = () => {
    setInspectorOpen(true);
  };

  const clearInspectorSelection = () => {
    setInspectorOpen(false);
    setHeaderSelected(false);
    setFooterSelected(false);
    setSelectedId("");
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
  };

  const toggleInspectorVisibility = () => {
    if (!selectedSection) return;
    setInspectorOpen((current) => !current);
  };

  const revealCanvasTarget = (targetId: string | null | undefined) => {
    if (!targetId) return;
    requestAnimationFrame(() => {
      const byInternalId = Array.from(
        document.querySelectorAll<HTMLElement>("[data-builder-section-id]"),
      ).find((element) => element.dataset.builderSectionId === targetId);
      (byInternalId ?? document.getElementById(targetId))?.scrollIntoView({
        block: "nearest",
      });
    });
  };

  const selectSection = (sectionId: string, shouldOpenInspector = false) => {
    setHeaderSelected(false);
    setFooterSelected(false);
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setInspectorTab("layout");
    setSectionSettingsOpen(true);
    if (shouldOpenInspector) openInspectorPanel();
    revealCanvasTarget(sectionId);
  };

  const selectShellRoot = (shellType: "header" | "footer", shouldOpenInspector = false) => {
    if (builderState.page !== shellType) {
      enterShellEdit(shellType);
      return;
    }

    const rootId =
      builderState.sections[0]?.id ??
      loadDraftForKey(shellType, storageKeys).sections[0]?.id ??
      (shellType === "header" ? "header-document" : "footer-document");
    selectSection(rootId, shouldOpenInspector);
    setHeaderSelected(shellType === "header");
    setFooterSelected(shellType === "footer");
  };

  const selectLayoutColumn = (
    sectionId: string,
    columnKey: string,
    shouldOpenInspector = false,
  ) => {
    setHeaderSelected(false);
    setFooterSelected(false);
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(columnKey);
    setInspectorTab("layout");
    if (shouldOpenInspector) openInspectorPanel();
    revealCanvasTarget(columnKey);
  };

  const selectLayoutBlock = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    shouldOpenInspector = false,
  ) => {
    setHeaderSelected(false);
    setFooterSelected(false);
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(blockKey);
    setOpenLayoutItemId(columnKey);
    const selectedBlock = selectedSection
      ? findLayoutBlock(selectedSection, blockKey, columnKey)
      : null;
    setInspectorTab(
      selectedBlock?.kind === "button" || selectedBlock?.kind === "panel"
        ? "style"
        : "content",
    );
    if (shouldOpenInspector) openInspectorPanel();
    revealCanvasTarget(blockKey);
  };

  const selectLayoutRow = (
    sectionId: string,
    rowIndex: number,
    shouldOpenInspector = false,
  ) => {
    setHeaderSelected(false);
    setFooterSelected(false);
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(rowIndex);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    const section = builderState.sections.find((item) => item.id === sectionId);
    const isCanonicalRow = Boolean(
      section && normalizeBuilderSectionLayout(section).source === "canonical",
    );
    setInspectorTab(isCanonicalRow ? "settings" : "layout");
    if (shouldOpenInspector) openInspectorPanel();
    const row = section
      ? normalizeBuilderSectionLayout(section).rows[rowIndex]
      : null;
    revealCanvasTarget(row?.id);
  };

  const iframeSelectedTarget = useMemo(
    () => selectedBuilderTarget({
      sectionId: selectedId,
      rowIndex: selectedLayoutRowIndex,
      columnKey: selectedLayoutColumnKey,
      blockKey: selectedLayoutBlockKey,
    }),
    [selectedId, selectedLayoutBlockKey, selectedLayoutColumnKey, selectedLayoutRowIndex],
  );
  const sendSelectionToIframe = useCallback((scrollIntoView = true) => {
    if (!iframeSelectedTarget) return;
    const shouldScrollIntoView = suppressNextIframeSelectionScrollRef.current
      ? false
      : scrollIntoView;
    suppressNextIframeSelectionScrollRef.current = false;
    iframeComparisonRef.current?.contentWindow?.postMessage({
      source: BUILDER_IFRAME_SELECTION_SOURCE,
      type: "focus",
      target: iframeSelectedTarget,
      scrollIntoView: shouldScrollIntoView,
    }, window.location.origin);
  }, [iframeSelectedTarget]);
  const postIframeDraftSnapshot = useCallback((state: BuilderState) => {
    const frame = iframeComparisonRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage({
      source: BUILDER_IFRAME_SELECTION_SOURCE,
      type: "context",
      shell: state.page === "header" || state.page === "footer" ? state.page : null,
    }, window.location.origin);
    iframeDraftRevisionRef.current += 1;
    // The iframe is rendering the authored document represented by `state`.
    // Using the surrounding shell context here can label a Home draft as
    // Header/Footer, causing the renderer to reject an otherwise valid live
    // mutation before it ever reaches the canvas.
    const documentKey = state.page;
    frame.contentWindow.postMessage({
      source: BUILDER_IFRAME_DRAFT_SOURCE,
      type: BUILDER_IFRAME_DRAFT_MESSAGE,
      documentKey,
      revision: iframeDraftRevisionRef.current,
      state,
      shellSettings,
    }, window.location.origin);
  }, [shellSettings]);

  useEffect(() => {
    if (!iframeComparisonMode) return;
    const signature = JSON.stringify({
      state: iframeRenderState,
      shellSettings,
    });
    if (iframeDraftSignatureRef.current === signature) return;
    iframeDraftSignatureRef.current = signature;
    iframeDraftPendingRef.current = iframeRenderState;
    if (iframeDraftFrameRef.current !== null) return;
    iframeDraftFrameRef.current = window.requestAnimationFrame(() => {
      iframeDraftFrameRef.current = null;
      const pending = iframeDraftPendingRef.current;
      iframeDraftPendingRef.current = null;
      if (pending) postIframeDraftSnapshot(pending);
    });
  }, [iframeComparisonMode, iframeRenderState, postIframeDraftSnapshot, shellSettings]);

  useEffect(() => () => {
    if (iframeDraftFrameRef.current !== null) {
      window.cancelAnimationFrame(iframeDraftFrameRef.current);
      iframeDraftFrameRef.current = null;
    }
  }, []);

  const handleIframeLoad = useCallback(() => {
    window.requestAnimationFrame(() => {
      const loadedState = iframeRenderStateRef.current;
      postIframeDraftSnapshot(loadedState);
      // Entering Footer editing reloads the iframe with its shell interaction
      // context. A non-scrolling focus leaves that new document at scrollY 0,
      // thousands of pixels above the selected Footer. Reveal the Footer root
      // after load while preserving the no-jump behavior for pages and Header.
      sendSelectionToIframe(loadedState.page === "footer");
    });
  }, [postIframeDraftSnapshot, sendSelectionToIframe]);

  useEffect(() => {
    if (!iframeComparisonMode) return;
    const handleIframeSelection = (event: MessageEvent) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeComparisonRef.current?.contentWindow ||
        event.data?.source !== BUILDER_IFRAME_SELECTION_SOURCE
      ) return;
      if (event.data.type === "ready") {
        const loadedState = iframeRenderStateRef.current;
        postIframeDraftSnapshot(loadedState);
        if (loadedState.page === "footer") {
          iframeComparisonRef.current?.contentWindow?.postMessage({
            source: BUILDER_IFRAME_SELECTION_SOURCE,
            type: "focus",
            target: {
              type: "section",
              sectionId: loadedState.sections[0]?.id ?? "footer-document",
            } satisfies BuilderInteractionTarget,
            scrollIntoView: true,
          }, window.location.origin);
        } else {
          sendSelectionToIframe(false);
        }
        return;
      }
      if (event.data.type === "scroll-start" && iframeDiagnosticMode === "settled") {
        setIframeSelectionRect(null);
        return;
      }
      if (event.data.type === "rect" && iframeDiagnosticMode !== "minimal") {
        if (iframeDiagnosticMode === "rect") return;
        const frame = iframeComparisonRef.current;
        const rect = event.data.rect as { x: number; y: number; width: number; height: number } | null;
        if (!frame || !rect) {
          setIframeSelectionRect(null);
          return;
        }
        const frameRect = frame.getBoundingClientRect();
        const scale = frame.clientWidth > 0 ? frameRect.width / frame.clientWidth : 1;
        setIframeSelectionRect({
          left: frameRect.left + rect.x * scale,
          top: frameRect.top + rect.y * scale,
          width: rect.width * scale,
          height: rect.height * scale,
        });
        return;
      }
      if (event.data.type === "navigate" && (iframeDiagnosticMode === "settled" || iframeDiagnosticMode === "full")) {
        const rawHref = typeof event.data.href === "string" ? event.data.href : "";
        const href = getStorefrontHrefFromScopedPreviewHref(
          rawHref,
          websiteRouteSegment ?? websiteId ?? "",
        );
        if (!href || href === "#" || href.startsWith("mailto:") || href.startsWith("tel:")) return;
        if (handleScopedBuilderNavigate(href)) return;
        const page = getBuilderPageKeyForHref(href, scopedPreviewPages);
        if (page) void switchBuilderTargetFromNavigation(page);
        return;
      }
      if (event.data.type === "exit-shell") {
        if (builderState.page === "header" || builderState.page === "footer") {
          exitShellEdit();
        }
        return;
      }
      if (event.data.type !== "select") return;
      const target = event.data.target as BuilderInteractionTarget | undefined;
      if (!target) return;
      const shell = iframeDiagnosticMode === "settled" || iframeDiagnosticMode === "full"
        ? event.data.shell === "header" || event.data.shell === "footer"
          ? event.data.shell
          : target.sectionId === "header-document"
            ? "header"
            : target.sectionId === "footer-document"
              ? "footer"
              : null
        : null;
      if (shell && builderState.page !== shell) {
        pendingIframeShellTargetRef.current = { shell, target };
        void enterShellEdit(shell);
        return;
      }
      if (!builderState.sections.some((section) => section.id === target.sectionId)) return;
      if (target.type === "section") {
        selectSection(target.sectionId, true);
      } else if (target.type === "row" && Number.isInteger(target.rowIndex)) {
        selectLayoutRow(target.sectionId, target.rowIndex, true);
      } else if (target.type === "column" && target.columnKey) {
        setHeaderSelected(false);
        setFooterSelected(false);
        setSelectedId(target.sectionId);
        setSelectedLayoutRowIndex(null);
        setSelectedLayoutColumnKey(target.columnKey);
        setSelectedLayoutBlockKey(null);
        setOpenLayoutItemId(target.columnKey);
        setInspectorTab("layout");
        openInspectorPanel();
      } else if (target.type === "block" && target.columnKey && target.blockKey) {
        selectLayoutBlock(target.sectionId, target.columnKey, target.blockKey, true);
      }
    };
    window.addEventListener("message", handleIframeSelection);
    return () => window.removeEventListener("message", handleIframeSelection);
  }, [
    builderState.sections,
    handleScopedBuilderNavigate,
    iframeComparisonMode,
    iframeDiagnosticMode,
    postIframeDraftSnapshot,
    scopedPreviewPages,
    sendSelectionToIframe,
    switchBuilderTargetFromNavigation,
  ]);

  useEffect(() => {
    if (iframeComparisonMode) sendSelectionToIframe();
  }, [iframeComparisonMode, sendSelectionToIframe]);

  useEffect(() => {
    const pending = pendingIframeShellTargetRef.current;
    if (!pending || builderState.page !== pending.shell) return;
    pendingIframeShellTargetRef.current = null;
    const target = pending.target;
    setSelectedId(target.sectionId);
    setSelectedLayoutRowIndex(target.type === "row" ? target.rowIndex : null);
    setSelectedLayoutColumnKey(target.type === "column" || target.type === "block" ? target.columnKey : null);
    setSelectedLayoutBlockKey(target.type === "block" ? target.blockKey : null);
    setOpenLayoutItemId(target.type === "column" || target.type === "block" ? target.columnKey : null);
    setInspectorTab(target.type === "block" ? "content" : target.type === "row" ? "settings" : "layout");
    setInspectorOpen(true);
  }, [builderState.page]);

  const enterShellEdit = async (shellType: "header" | "footer") => {
    if (builderState.page !== "header" && builderState.page !== "footer") {
      pageContextStateRef.current = builderState;
      setShellPageContextState(builderState);
    }
    const contextKey =
      builderState.page === "header" || builderState.page === "footer"
        ? headerContextKey
        : builderState.page;
    const targetState = shellType === "footer"
      ? footerDocumentPreviewState ?? await loadFooterDocumentPreview()
      : null;
    let nextState = targetState ?? hydrateDocumentBuilderState(
      loadDraftForKey(shellType, storageKeys),
      shellSettings,
    );

    if (shellType === "header" && !headerDocumentPreviewState) {
      // Header entry must be anchored to the persisted document. A local draft
      // can belong to an older saved revision and would otherwise resurrect
      // deleted blocks or reintroduce stale layout/design values after refresh.
      try {
        const response = await fetch(builderApiUrl("/api/builder-layouts", { key: "header" }), {
          cache: "no-store",
        });
        const payload = (await response.json()) as { layout?: BuilderState | null };
        if (response.ok && payload.layout?.sections?.length) {
          nextState = hydrateDocumentBuilderState(
            normalizeBuilderState(payload.layout, "header"),
            shellSettings,
          );
          setHeaderDocumentPreviewState(nextState);
        }
      } catch {
        // Keep the local draft fallback when the persisted Header cannot load.
      }
    }
    // A newly-created website can have an empty Header document.  Seed it
    // with the canonical minimal Header preset on first entry so owners can
    // immediately add/edit rows, while retaining any authored header that
    // already contains elements.
    if (
      shellType === "header" &&
      !nextState.sections.some((section) =>
        (section.layoutItems ?? []).some((item) => (item.blocks ?? []).length > 0),
      )
    ) {
      const defaultHeaderPreset = headerPresets.find((preset) => preset.key === "minimal");
      if (defaultHeaderPreset) {
        nextState = {
          ...nextState,
          sections: mergeBrandingIntoPreset(
            nextState.sections,
            defaultHeaderPreset.sections,
          ),
        };
      }
    }
    const shellRootId =
      nextState.sections[0]?.id ??
      (shellType === "header" ? "header-document" : "footer-document");
    shellTransitionRef.current = { direction: "enter", page: shellType };
    setActiveShellEntry({ shellType, rootId: shellRootId });
    setHeaderContextKey(contextKey);
    switchBuilderTarget(shellType, { syncUrl: false, state: nextState });
    router.replace(`${pathname}?page=${shellType}&context=${encodeURIComponent(contextKey)}`, { scroll: false });
    setHeaderSelected(shellType === "header");
    setFooterSelected(shellType === "footer");
    setSelectedId(shellRootId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setInspectorTab("layout");
    setSectionSettingsOpen(true);
    setSidebarCollapsed(false);
    setSidebarTab("builder");
    if (shellType === "footer") setFooterSelected(true);
  };

  const selectHeader = () => {
    enterShellEdit("header");
  };

  // The Header toolbar's edit action must target the Header document root,
  // not the generic section-settings panel. Keep this separate from
  // selectSection because HeaderDocumentSettings is document-scoped.
  const openHeaderDocumentInspector = () => {
    if (builderState.page !== "header") {
      enterShellEdit("header");
      return;
    }
    const rootId = builderState.sections[0]?.id ?? "header-document";
    setHeaderSelected(true);
    setFooterSelected(false);
    setSelectedId(rootId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setInspectorTab("layout");
    setSectionSettingsOpen(true);
    openInspectorPanel();
    revealCanvasTarget(rootId);
  };

  const selectFooter = () => {
    enterShellEdit("footer");
  };

  const exitShellEdit = () => {
    if (builderState.page !== "header" && builderState.page !== "footer") return;
    const contextKey = headerContextKey;
    const preservedPageState =
      shellPageContextState ?? pageContextStateRef.current;

    shellTransitionRef.current = { direction: "exit", page: contextKey };
    setActiveShellEntry(null);
    setShellPageContextState(null);
    setSidebarCollapsed(false);
    setSidebarTab("builder");

    if (preservedPageState) {
      switchBuilderTarget(contextKey, { state: preservedPageState });
      setPublishedDocumentReady(true);
      return;
    }

    // A direct Header/Footer URL (or a refresh while editing one) has no
    // in-memory page snapshot to restore. Resolve the contextual page through
    // the same canonical navigation path used by the Pages panel instead of
    // leaving the shell document active.
    void switchBuilderTargetFromNavigation(contextKey);
  };

  const openSpacingSettings = (target: SpacingInspectorTarget) => {
    setSpacingOverlayEnabled(true);
    setSidebarCollapsed(false);

    if (target.scope === "globalSection") {
      if (!canEditShellSettings) {
        setShellStatus("Platform global settings require super admin access.");
        return;
      }
      setSidebarTab("globalStyles");
      setGlobalStylesTab("spacing");
      setGlobalSpacingFocus("section");
      return;
    }

    setInspectorOpen(true);
    setSelectedId(target.sectionId);

    if (target.scope === "section") {
      setSelectedLayoutRowIndex(null);
      setSelectedLayoutBlockKey(null);
      setSelectedLayoutColumnKey(null);
      setInspectorTab("spacing");
      setSectionSettingsOpen(true);
    } else if (target.scope === "row") {
      setSelectedLayoutRowIndex(target.rowIndex);
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
      setOpenLayoutItemId(null);
      setInspectorTab("spacing");
    } else if (target.scope === "column") {
      setSelectedLayoutRowIndex(null);
      setSelectedLayoutColumnKey(target.columnKey);
      setSelectedLayoutBlockKey(null);
      setOpenLayoutItemId(target.columnKey);
      setInspectorTab("layout");
      setSectionSettingsOpen(true);
    } else {
      setSelectedLayoutRowIndex(null);
      setSelectedLayoutColumnKey(target.columnKey);
      setSelectedLayoutBlockKey(target.blockKey);
      setOpenLayoutItemId(target.columnKey);
      setInspectorTab("spacing");
    }

    setSpacingFocusRequest({
      id: ++spacingFocusRequestId.current,
      scope: target.scope,
      field: target.field,
    });
  };

  useEffect(() => {
    if (!spacingFocusRequest || spacingFocusRequest.scope === "globalSection") {
      return;
    }
    setInspectorTab(
      spacingFocusRequest.scope === "column" ? "layout" : "spacing",
    );
  }, [spacingFocusRequest]);

  useEffect(() => {
    if (globalStylesTab !== "spacing" || !globalSpacingFocus) return;
    const timer = window.setTimeout(() => {
      const target = document.getElementById(
        `global-spacing-${globalSpacingFocus}`,
      );
      if (!target) return;
      target.scrollIntoView({ block: "start", behavior: "smooth" });
      target.classList.add("pulse-highlight");
      window.setTimeout(() => target.classList.remove("pulse-highlight"), 1500);
      setGlobalSpacingFocus(null);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [globalSpacingFocus, globalStylesTab]);

  const updateSelectedSlide = (
    index: number,
    patch: NonNullable<BuilderSection["slides"]>[number],
  ) => {
    if (!rawSelectedSection) return;
    const slides = [...(rawSelectedSection.slides ?? [])];
    slides[index] = applyContentPatch(slides[index] ?? {}, patch, contentLanguage, primaryContentLanguage);
    updateSelected({ slides });
  };

  const addSelectedSlide = () => {
    if (!selectedSection) return;
    const slides = selectedSection.slides ?? [];
    const nextIndex = slides.length + 1;
    const id = `slide-${Date.now().toString(36)}`;
    updateSelected({
      slides: [
        ...slides,
        {
          id,
          badge: "New",
          title: `Slide ${nextIndex}`,
          text: "Add slide copy, upload an image, and publish.",
          imagePadding: "medium",
          buttonLabel: "Explore",
          buttonUrl: "/shop",
        },
      ],
    });
    setOpenSlideId(id);
  };

  const deleteSelectedSlide = (index: number) => {
    if (!selectedSection) return;
    const slide = selectedSection.slides?.[index];
    updateSelected({
      slides: (selectedSection.slides ?? []).filter(
        (_, slideIndex) => slideIndex !== index,
      ),
    });
    if (slide?.id === openSlideId) {
      setOpenSlideId(null);
    }
  };

  const updateSelectedBadge = (
    index: number,
    patch: NonNullable<BuilderSection["badges"]>[number],
  ) => {
    if (!rawSelectedSection) return;
    const badges = [...(rawSelectedSection.badges ?? [])];
    badges[index] = applyContentPatch(badges[index] ?? {}, patch, contentLanguage, primaryContentLanguage);
    updateSelected({ badges });
  };

  const getLayoutItemBlocks = (
    item: NonNullable<BuilderSection["layoutItems"]>[number],
  ) => {
    if (item.blocks?.length) return item.blocks;
    if (
      item.title ||
      item.body ||
      item.eyebrow ||
      item.buttonLabel ||
      item.buttonUrl
    ) {
      return [
        {
          id: `${item.id ?? "legacy"}-text`,
          kind: "text" as LayoutBlockKind,
          eyebrow: item.eyebrow,
          title: item.title,
          body: item.body,
          buttonLabel: item.buttonLabel,
          buttonUrl: item.buttonUrl,
        },
      ];
    }
    return [];
  };

  const applyContentRowLayoutPreset = (
    sectionId: string,
    rowIndex: number,
    presetKey: string,
  ) => {
    const preset = getBuilderRowLayoutPreset(presetKey);
    if (!preset) return;

    let nextSelectedColumnKey: string | null = null;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (
          section.id !== sectionId ||
          !isLayoutContainerSection(section)
        ) {
          return section;
        }

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[rowIndex];
        if (!targetRow) return section;

        const rowId =
          targetRow.items.find((item) => item.rowId)?.rowId ??
          `layout-row-${Date.now().toString(36)}`;
        const normalizedItems = targetRow.items.map((item, index) => ({
          ...item,
          id: item.id ?? `${rowId}-column-${index + 1}`,
          rowId,
          blocks: [...getLayoutItemBlocks(item)],
        }));
        const nextRowItems: PreviewLayoutItem[] = preset.ratios.map(
          (_, index) => {
            const sourceItem = normalizedItems[index];
            return (
              sourceItem ?? {
                id: `${rowId}-column-${index + 1}`,
                rowId,
                blocks: [],
              }
            );
          },
        );

        if (section.id === "header-document" && preset.ratios.length > 1) {
          const allHeaderBlocks = normalizedItems.flatMap((item) =>
            getLayoutItemBlocks(item),
          );
          nextRowItems.forEach((item, index) => {
            item.blocks = allHeaderBlocks.filter(
              (_, blockIndex) =>
                Math.min(
                  preset.ratios.length - 1,
                  Math.floor(
                    (blockIndex * preset.ratios.length) /
                      Math.max(1, allHeaderBlocks.length),
                  ),
                ) === index,
            );
          });
        }

        if (
          section.id !== "header-document" &&
          normalizedItems.length > preset.ratios.length
        ) {
          const overflowBlocks = normalizedItems
            .slice(preset.ratios.length)
            .flatMap((item) => getLayoutItemBlocks(item));
          if (overflowBlocks.length > 0) {
            const lastIndex = preset.ratios.length - 1;
            nextRowItems[lastIndex] = {
              ...nextRowItems[lastIndex],
              blocks: [
                ...getLayoutItemBlocks(nextRowItems[lastIndex]),
                ...overflowBlocks,
              ],
            };
          }
        }

        const nextRowItemsWithLayout = nextRowItems.map((item) => ({
          ...item,
          rowId,
          rowLayout: preset.key,
        }));
        nextSelectedColumnKey = nextRowItemsWithLayout[0]?.id ?? null;

        return {
          ...section,
          layoutItems: [
            ...layoutItems.slice(0, targetRow.startIndex),
            ...nextRowItemsWithLayout,
            ...layoutItems.slice(targetRow.startIndex + targetRow.items.length),
          ],
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(rowIndex);
    setSelectedLayoutColumnKey(nextSelectedColumnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(nextSelectedColumnKey);
    setInspectorTab("layout");
    setPublishStatus("Row layout updated");
  };

  const applyContentLayoutPreset = (
    sectionId: string,
    presetKey: string,
    rowIndex: number,
  ) => {
    applyContentRowLayoutPreset(sectionId, rowIndex, presetKey);
  };

  const applyHeaderPreset = (presetKey: string) => {
    const preset = headerPresets.find((p) => p.key === presetKey);
    if (!preset) return;
    setPresetToApply({ presetKey, name: preset.name });
  };

  const executeApplyHeaderPreset = (presetKey: string) => {
    const preset = headerPresets.find((p) => p.key === presetKey);
    if (!preset) return;

    let currentHeaderSections: BuilderSection[] = [];
    if (builderState.page === "header") {
      currentHeaderSections = builderState.sections;
    } else if (headerDocumentPreviewState?.sections) {
      currentHeaderSections = headerDocumentPreviewState.sections;
    }

    const brandedSections = mergeBrandingIntoPreset(
      currentHeaderSections,
      preset.sections
    );
    const mergedSections = brandedSections;

    if (mergedSections.length > 0) {
      const currentSettings = resolveHeaderDocumentSettings(
        resolveHeaderBuilderComposition({ sections: currentHeaderSections }),
        shellSettings,
      );
      mergedSections[0] = {
        ...mergedSections[0],
        // Presets remain readable for compatibility, but an application is
        // now materialized as ordinary Header composition/settings rather
        // than leaving a named preset as an active owner.
        headerPresetKey: undefined,
        headerArchitectureVersion: 2,
        headerVisible:
          currentHeaderSections[0]?.headerVisible ??
          shellSettings.headerVisible ??
          true,
        headerTransparent: preset.headerTransparent,
        headerOverlay: preset.headerOverlay,
        headerLayout: preset.headerLayout,
        headerBehavior: currentSettings.behavior,
        headerWidthMode: preset.headerWidthMode,
        headerBackgroundMode: currentSettings.backgroundMode,
        headerTextMode: currentSettings.textMode,
        headerZIndex: currentSettings.zIndex,
        headerTopToolbarVisible: currentSettings.topToolbarVisible,
        headerTopToolbarText: currentSettings.topToolbarText,
        headerTopToolbarPhone: currentSettings.topToolbarPhone,
        headerTopToolbarMeta: currentSettings.topToolbarMeta,
        ...(currentHeaderSections[0]?.headerHeight !== undefined
          ? { headerHeight: currentHeaderSections[0].headerHeight }
          : {}),
        ...(currentHeaderSections[0]?.headerCustomHeight !== undefined
          ? { headerCustomHeight: currentHeaderSections[0].headerCustomHeight }
          : {}),
      };
    }

    const nextHeaderState: BuilderState = {
      page: "header",
      targetType: "header",
      design: builderState.design,
      sections: mergedSections,
    };

    if (builderState.page === "header") {
      setBuilderState((current) => ({
        ...current,
        sections: mergedSections,
      }));
    } else {
      setHeaderDocumentPreviewState(nextHeaderState);
      try {
        let drafts: Partial<Record<BuilderLayoutKey, BuilderState>> = {};
        const rawDrafts = window.localStorage.getItem(storageKeys.drafts);
        drafts = rawDrafts ? JSON.parse(rawDrafts) : {};
        drafts["header"] = nextHeaderState;
        window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));
      } catch (e) {
        console.error("Failed to save header draft in localStorage:", e);
      }

      void fetch(builderApiUrl("/api/builder-layouts"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nextHeaderState),
      }).catch((err) => {
        console.error("Failed to autosave preset to backend:", err);
      });
    }

  };

  const updateSelectedLayoutBlock = (
    columnIndex: number,
    blockIndex: number,
    patch: BuilderLayoutBlock,
    mutationLanguage = contentLanguageRef.current,
  ) => {
    if (!rawSelectedSection) return;
    const targetForProvenance = selectedLayoutColumnKey && selectedLayoutBlockKey
      ? selectedLayoutBlock
      : getLayoutItemBlocks(rawSelectedSection.layoutItems?.[columnIndex] ?? {})[blockIndex];
    const isHeaderButton =
      (builderState.page === "header" || rawSelectedSection.id === "header-document") &&
      (targetForProvenance?.id === "header-button" || targetForProvenance?.kind === "button");
    const buttonOverrideFields: Array<[keyof BuilderLayoutBlock, keyof NonNullable<BuilderLayoutBlock["headerButtonOverrides"]>]> = [
      ["buttonStyle", "variant"],
      ["size", "size"],
      ["fullWidthButton", "width"],
      ["buttonBg", "background"],
      ["buttonTextColor", "text"],
      ["buttonBorderRadius", "radius"],
      ["buttonBorderWidth", "border"],
      ["buttonBorderColor", "border"],
      ["buttonPaddingY", "padding"],
      ["buttonPaddingX", "padding"],
      ["buttonHoverBg", "hoverBackground"],
      ["buttonHoverTextColor", "hoverText"],
      ["buttonHoverBorderColor", "hoverBorder"],
      ["buttonHoverEffect", "hoverEffect"],
      ["buttonHoverTransform", "hoverEffect"],
      ["buttonHoverBoxShadow", "hoverEffect"],
      ["typography", "typography"],
    ];
    const nextPatch = isHeaderButton
      ? {
          ...patch,
          headerButtonOverrides: buttonOverrideFields.reduce(
            (overrides, [field, owner]) =>
              Object.prototype.hasOwnProperty.call(patch, field)
                ? { ...overrides, [owner]: patch[field] !== undefined }
                : overrides,
            { ...(targetForProvenance?.headerButtonOverrides ?? {}) },
          ),
        }
      : patch;
    if (
      selectedLayoutColumnKey &&
      selectedLayoutBlockKey &&
      findLayoutColumn(rawSelectedSection, selectedLayoutColumnKey)
    ) {
      updateLayoutBlockByKey(
        rawSelectedSection.id,
        selectedLayoutColumnKey,
        selectedLayoutBlockKey,
        nextPatch,
        mutationLanguage,
      );
      return;
    }
    const layoutItems = [...(rawSelectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const targetBlock = blocks[blockIndex] ?? {};
    blocks[blockIndex] = applyContentPatch(
      targetBlock,
      nextPatch,
      mutationLanguage,
      primaryContentLanguage,
    );
    const requestedHeaderAlignment =
      builderState.page === "header"
        ? patch.imageAlignment ?? patch.elementAlign
        : undefined;
    if (requestedHeaderAlignment) {
      blocks.forEach((block, index) => {
        if (index === blockIndex) return;
        blocks[index] =
          block.kind === "image" || block.id === "header-logo"
            ? { ...block, imageAlignment: requestedHeaderAlignment }
            : { ...block, elementAlign: requestedHeaderAlignment };
      });
    }
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const updateSelectedLayoutBlockSlide = (
    columnIndex: number,
    blockIndex: number,
    slideIndex: number,
    patch: NonNullable<BuilderLayoutBlock["slides"]>[number],
  ) => {
    if (!rawSelectedSection) return;
    if (rawSelectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(rawSelectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => {
        const slides = [...(block.slides ?? [])];
        slides[slideIndex] = applyContentPatch(slides[slideIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
        return { ...block, slides };
      }));
      return;
    }
    const layoutItems = [...(rawSelectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const slides = [...(block.slides ?? [])];
    slides[slideIndex] = applyContentPatch(slides[slideIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
    blocks[blockIndex] = { ...block, slides };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockSlide = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!rawSelectedSection) return;
    if (rawSelectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      const nextSlide = { id: `nested-slide-${Date.now().toString(36)}`, badge: "01", title: "Slide 1", text: "Edit this nested slider slide.", imagePadding: "medium" } as NonNullable<BuilderLayoutBlock["slides"]>[number];
      updateSelected(updateBlockInLayoutColumn(rawSelectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, slides: [...(block.slides ?? []), { ...nextSlide, badge: String((block.slides?.length ?? 0) + 1).padStart(2, "0"), title: `Slide ${(block.slides?.length ?? 0) + 1}` }] })));
      setOpenSlideId(nextSlide.id ?? null);
      return;
    }
    const layoutItems = [...(rawSelectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const slides = block.slides ?? [];
    const nextIndex = slides.length + 1;
    const id = `nested-slide-${Date.now().toString(36)}`;

    blocks[blockIndex] = {
      ...block,
      slides: [
        ...slides,
        {
          id,
          badge: String(nextIndex).padStart(2, "0"),
          title: `Slide ${nextIndex}`,
          text: "Edit this nested slider slide.",
          imagePadding: "medium",
        },
      ],
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
    setOpenSlideId(id);
  };

  const deleteSelectedLayoutBlockSlide = (
    columnIndex: number,
    blockIndex: number,
    slideIndex: number,
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, slides: (block.slides ?? []).filter((_, index) => index !== slideIndex) })));
      if (selectedSection.rows && openSlideId && (selectedSection.rows.flatMap((row) => row.columns).find((column) => column.id === selectedLayoutColumnKey)?.elements.find((block) => block.id === selectedLayoutBlockKey)?.slides?.[slideIndex]?.id === openSlideId)) setOpenSlideId(null);
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const slide = block.slides?.[slideIndex];

    blocks[blockIndex] = {
      ...block,
      slides: (block.slides ?? []).filter((_, index) => index !== slideIndex),
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });

    if (slide?.id === openSlideId) {
      setOpenSlideId(null);
    }
  };

  const updateSelectedLayoutBlockBadge = (
    columnIndex: number,
    blockIndex: number,
    badgeIndex: number,
    patch: NonNullable<BuilderLayoutBlock["badges"]>[number],
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => {
        const badges = [...(block.badges ?? [])];
        badges[badgeIndex] = applyContentPatch(badges[badgeIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
        return { ...block, badges };
      }));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const badges = [...(block.badges ?? [])];
    badges[badgeIndex] = applyContentPatch(badges[badgeIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
    blocks[blockIndex] = { ...block, badges };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockBadge = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!rawSelectedSection) return;
    if (rawSelectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(rawSelectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, badges: [...(block.badges ?? []), { id: `nested-badge-${Date.now().toString(36)}`, label: String((block.badges?.length ?? 0) + 1).padStart(2, "0"), title: `Badge ${(block.badges?.length ?? 0) + 1}`, body: "Edit this badge." }] })));
      return;
    }
    const layoutItems = [...(rawSelectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const badges = block.badges ?? [];
    const nextIndex = badges.length + 1;

    blocks[blockIndex] = {
      ...block,
      badges: [
        ...badges,
        {
          id: `nested-badge-${Date.now().toString(36)}`,
          label: String(nextIndex).padStart(2, "0"),
          title: `Badge ${nextIndex}`,
          body: "Edit this badge.",
        },
      ],
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const deleteSelectedLayoutBlockBadge = (
    columnIndex: number,
    blockIndex: number,
    badgeIndex: number,
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, badges: (block.badges ?? []).filter((_, index) => index !== badgeIndex) })));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    blocks[blockIndex] = {
      ...block,
      badges: (block.badges ?? []).filter((_, index) => index !== badgeIndex),
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const updateSelectedLayoutBlockGridItem = (
    columnIndex: number,
    blockIndex: number,
    itemIndex: number,
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number],
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => {
        const gridItems = [...(block.gridItems ?? [])];
        gridItems[itemIndex] = applyContentPatch(gridItems[itemIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
        return { ...block, gridItems };
      }));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const gridItems = [...(block.gridItems ?? [])];
    gridItems[itemIndex] = applyContentPatch(gridItems[itemIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
    blocks[blockIndex] = { ...block, gridItems };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockGridItem = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!rawSelectedSection) return;
    if (rawSelectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(rawSelectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, gridItems: [...(block.gridItems ?? []), { id: `grid-item-${Date.now().toString(36)}`, eyebrow: String((block.gridItems?.length ?? 0) + 1).padStart(2, "0"), title: `Grid item ${(block.gridItems?.length ?? 0) + 1}`, meta: "Meta", text: "Edit this grid item.", buttonLabel: "Learn more", buttonUrl: "/" }] })));
      return;
    }
    const layoutItems = [...(rawSelectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const gridItems = block.gridItems ?? [];
    const nextIndex = gridItems.length + 1;
    blocks[blockIndex] = {
      ...block,
      gridItems: [
        ...gridItems,
        {
          id: `grid-item-${Date.now().toString(36)}`,
          eyebrow: String(nextIndex).padStart(2, "0"),
          title: `Grid item ${nextIndex}`,
          meta: "Meta",
          text: "Edit this grid item.",
          buttonLabel: "Learn more",
          buttonUrl: "/",
        },
      ],
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const deleteSelectedLayoutBlockGridItem = (
    columnIndex: number,
    blockIndex: number,
    itemIndex: number,
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, gridItems: (block.gridItems ?? []).filter((_, index) => index !== itemIndex) })));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    blocks[blockIndex] = {
      ...block,
      gridItems: (block.gridItems ?? []).filter(
        (_, index) => index !== itemIndex,
      ),
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockButton = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, buttons: [...(block.buttons ?? []), { id: `btn-${Date.now().toString(36)}-${block.buttons?.length ?? 0}`, label: "New Button", url: "/", target: "_self", style: "primary" }] })));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const buttons = block.buttons ?? [];
    blocks[blockIndex] = {
      ...block,
      buttons: [
        ...buttons,
        {
          id: `btn-${Date.now().toString(36)}-${buttons.length}`,
          label: "New Button",
          url: "/",
          target: "_self",
          style: "primary",
        },
      ],
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const updateSelectedLayoutBlockButton = (
    columnIndex: number,
    blockIndex: number,
    buttonIndex: number,
    patch: NonNullable<BuilderLayoutBlock["buttons"]>[number],
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => {
        const buttons = [...(block.buttons ?? [])];
        buttons[buttonIndex] = applyContentPatch(buttons[buttonIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
        return { ...block, buttons };
      }));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const buttons = [...(block.buttons ?? [])];
    buttons[buttonIndex] = applyContentPatch(buttons[buttonIndex] ?? {}, patch, contentLanguage, primaryContentLanguage);
    blocks[blockIndex] = { ...block, buttons };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const deleteSelectedLayoutBlockButton = (
    columnIndex: number,
    blockIndex: number,
    buttonIndex: number,
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(updateBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey, (block) => ({ ...block, buttons: (block.buttons ?? []).filter((_, index) => index !== buttonIndex) })));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    blocks[blockIndex] = {
      ...block,
      buttons: (block.buttons ?? []).filter(
        (_, index) => index !== buttonIndex,
      ),
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const deleteSelectedLayoutBlock = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!selectedSection) return;
    if (selectedSection.rows !== undefined && selectedLayoutColumnKey && selectedLayoutBlockKey) {
      updateSelected(removeBlockInLayoutColumn(selectedSection, selectedLayoutColumnKey, selectedLayoutBlockKey));
      return;
    }
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    layoutItems[columnIndex] = {
      ...item,
      blocks: getLayoutItemBlocks(item).filter(
        (_, index) => index !== blockIndex,
      ),
    };
    updateSelected({ layoutItems });
  };

  const duplicateLayoutBlock = ({
    sectionId,
    columnKey,
    blockKey,
  }: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (
          section.id !== sectionId ||
          (!isLayoutContainerSection(section) && section.id !== "header-document")
        ) {
          return section;
        }

        const item = findLayoutColumn(section, columnKey);
        if (!item) return section;
        const blocks = [...(item.blocks ?? [])];
        const blockIndex = blocks.findIndex(
          (block, index) =>
            (block.id ?? `${columnKey}-block-${index}`) === blockKey,
        );
        const block = blocks[blockIndex];
        if (blockIndex < 0 || !block) return section;

        blocks.splice(blockIndex + 1, 0, {
          ...block,
          id: createBlockId(block.kind ?? "text"),
        });
        return updateLayoutColumn(section, columnKey, (column) => ({
          ...column,
          blocks,
        }));
      }),
    }));
  };

  const moveLayoutBlockWithinColumn = ({
    sectionId,
    columnKey,
    blockKey,
    direction,
  }: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
    direction: -1 | 1;
  }) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const item = findLayoutColumn(section, columnKey);
        if (!item) return section;
        const blocks = [...(item.blocks ?? [])];
        const blockIndex = blocks.findIndex(
          (block, index) =>
            (block.id ?? `${columnKey}-block-${index}`) === blockKey,
        );
        const nextIndex = blockIndex + direction;
        if (blockIndex < 0 || nextIndex < 0 || nextIndex >= blocks.length) {
          return section;
        }

        const [movedBlock] = blocks.splice(blockIndex, 1);
        if (!movedBlock) return section;
        blocks.splice(nextIndex, 0, movedBlock);
        return updateLayoutColumn(section, columnKey, (column) => ({
          ...column,
          blocks,
        }));
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(blockKey);
    setOpenLayoutItemId(columnKey);
    setPublishStatus("Element moved");
  };

  const deleteLayoutBlock = ({
    sectionId,
    columnKey,
    blockKey,
  }: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        if (!findLayoutColumn(section, columnKey)) return section;
        return updateLayoutColumn(section, columnKey, (column) => ({
          ...column,
          blocks: (column.blocks ?? []).filter(
            (block, index) =>
              (block.id ?? `${columnKey}-block-${index}`) !== blockKey,
          ),
        }));
      }),
    }));

    if (selectedLayoutBlockKey === blockKey) {
      setSelectedLayoutBlockKey(null);
    }
  };

  const moveLayoutBlock = ({
    sectionId,
    targetSectionId = sectionId,
    sourceColumnKey,
    sourceBlockKey,
    targetColumnKey,
    targetBlockKey,
    placement = "above",
  }: {
    sectionId: string;
    targetSectionId?: string;
    sourceColumnKey: string;
    sourceBlockKey: string;
    targetColumnKey: string;
    targetBlockKey?: string;
    placement?: "above" | "below";
  }) => {
    setBuilderState((current) => {
      let movingBlock: BuilderLayoutBlock | null = null;
      const targetSection = current.sections.find(
        (section) =>
          section.id === targetSectionId && isLayoutContainerSection(section),
      );
      const hasTargetColumn = targetSection
        ? Boolean(findLayoutColumn(targetSection, targetColumnKey))
        : false;

      if (!hasTargetColumn) return current;

      const sectionsWithoutBlock = current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const sourceItem = findLayoutColumn(section, sourceColumnKey);
        if (!sourceItem) return section;
        const sourceBlocks = [...(sourceItem.blocks ?? [])];
        const sourceBlockIndex = sourceBlocks.findIndex(
          (block, index) =>
            (block.id ?? `${sourceColumnKey}-block-${index}`) ===
            sourceBlockKey,
        );
        if (sourceBlockIndex < 0) return section;

        const [removedBlock] = sourceBlocks.splice(sourceBlockIndex, 1);
        if (!removedBlock) return section;

        movingBlock = removedBlock;
        return updateLayoutColumn(section, sourceColumnKey, (column) => ({
          ...column,
          blocks: sourceBlocks,
        }));
      });

      const blockToMove = movingBlock;
      if (!blockToMove) return current;

      return {
        ...current,
        sections: sectionsWithoutBlock.map((section) => {
          if (
            section.id !== targetSectionId ||
            !isLayoutContainerSection(section)
          ) {
            return section;
          }

          const targetItem = findLayoutColumn(section, targetColumnKey);
          if (!targetItem) return section;
          const targetBlocks = [...(targetItem.blocks ?? [])];
          const targetIndex = targetBlockKey
            ? targetBlocks.findIndex(
                (block, index) =>
                  (block.id ?? `${targetColumnKey}-block-${index}`) ===
                  targetBlockKey,
              )
            : -1;

          let insertIndex =
            targetIndex >= 0 ? targetIndex : targetBlocks.length;
          if (targetIndex >= 0 && placement === "below") {
            insertIndex = targetIndex + 1;
          }

          targetBlocks.splice(insertIndex, 0, blockToMove);
          return updateLayoutColumn(section, targetColumnKey, (column) => ({
            ...column,
            blocks: targetBlocks,
          }));
        }),
      };
    });

    setSelectedId(targetSectionId);
    setSelectedLayoutColumnKey(targetColumnKey);
    setOpenLayoutItemId(targetColumnKey);
    setSelectedLayoutBlockKey(sourceBlockKey);
  };

  const moveHeaderBuilderElement = ({
    payload,
    targetRowId,
    targetColumnId,
    targetBlockId,
    placement = "below",
  }: {
    payload: HeaderBlockDragPayload;
    targetRowId: string;
    targetColumnId: string;
    targetBlockId?: string;
    placement?: "above" | "below";
  }) => {
    setBuilderState((current) => {
      if (current.page !== "header") return current;
      const sectionIndex = current.sections.findIndex((section) => section.id === "header-document");
      const section = current.sections[sectionIndex];
      if (!section || !isLayoutContainerSection(section)) return current;
      const result = moveHeaderBlockById(section.layoutItems ?? [], payload, {
        targetRowId,
        targetColumnId,
        targetBlockId,
        placement,
      });
      if (!result.moved) return current;

      const sections = [...current.sections];
      sections[sectionIndex] = {
        ...section,
        layoutItems: result.layoutItems,
      };
      return { ...current, sections };
    });

    setSelectedId("header-document");
    setSelectedLayoutColumnKey(targetColumnId);
    setSelectedLayoutBlockKey(payload.blockId);
    setOpenLayoutItemId(targetColumnId);
    setPublishStatus("Header element moved");
  };

  const moveHeaderBuilderRow = ({
    sourceRowId,
    targetRowId,
    placement,
  }: {
    sourceRowId: string;
    targetRowId: string;
    placement: "before" | "after";
  }) => {
    if (sourceRowId === targetRowId) return;
    setBuilderState((current) => {
      if (current.page !== "header") return current;
      const sections = current.sections.map((section) => {
        if (section.id !== "header-document" || !isLayoutContainerSection(section)) return section;
        const rows = getPreviewLayoutRows(section, section.layoutItems ?? []);
        const sourceIndex = rows.findIndex((row) => row.items.some((item) => (item.rowId ?? item.id) === sourceRowId));
        const targetIndex = rows.findIndex((row) => row.items.some((item) => (item.rowId ?? item.id) === targetRowId));
        if (sourceIndex < 0 || targetIndex < 0) return section;

        const nextRows = [...rows];
        const [sourceRow] = nextRows.splice(sourceIndex, 1);
        if (!sourceRow) return section;
        const adjustedTargetIndex = nextRows.findIndex((row) => row === rows[targetIndex]);
        const insertIndex = adjustedTargetIndex + (placement === "after" ? 1 : 0);
        nextRows.splice(Math.max(0, insertIndex), 0, sourceRow);
        return { ...section, headerUtilityMigrationVersion: 3 as const, layoutItems: nextRows.flatMap((row) => row.items) };
      });
      return { ...current, sections };
    });

    setSelectedId("header-document");
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setPublishStatus("Header row moved");
  };

  const createLayoutBlockAtDrop = ({
    sectionId,
    targetColumnKey,
    kind,
    targetBlockKey,
    placement = "above",
  }: {
    sectionId: string;
    targetColumnKey: string;
    kind: LayoutBlockKind;
    targetBlockKey?: string;
    placement?: "above" | "below";
  }) => {
    const block = createLayoutBlock(kind);
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const targetItem = findLayoutColumn(section, targetColumnKey);
        if (!targetItem) return section;
        const targetBlocks = [...(targetItem.blocks ?? [])];
        const targetIndex = targetBlockKey
          ? targetBlocks.findIndex(
              (item, index) =>
                (item.id ?? `${targetColumnKey}-block-${index}`) ===
                targetBlockKey,
            )
          : -1;

        let insertIndex = targetIndex >= 0 ? targetIndex : targetBlocks.length;
        if (targetIndex >= 0 && placement === "below") {
          insertIndex = targetIndex + 1;
        }

        targetBlocks.splice(insertIndex, 0, block);
        return updateLayoutColumn(section, targetColumnKey, (column) => ({
          ...column,
          blocks: targetBlocks,
        }));
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(targetColumnKey);
    setOpenLayoutItemId(targetColumnKey);
    setSelectedLayoutBlockKey(block.id ?? null);
  };

  const addElementFromLibrary = (
    kind: LayoutBlockKind,
    preferredHeaderColumnKey?: string,
    targetHeaderBlockId?: string,
    placement: "above" | "below" = "below",
    explicitTarget?: { sectionId: string; columnKey: string },
  ) => {
    if (builderState.page === "header") {
      const headerElementByKind: Partial<Record<LayoutBlockKind, BuilderLayoutBlock>> = {
        image: {
          id: "header-logo",
          kind: "image",
          imageUrl: shellSettings.headerLogoUrl ?? undefined,
          imageAlt: shellSettings.headerLogoAlt,
          imageMaxWidth: shellSettings.headerLogoMaxWidth,
          headerBrandMode: shellSettings.headerLogoUrl
            ? shellSettings.headerBrandMode
            : "brand",
          headerBrandText: shellSettings.headerBrandText?.trim() || "WebPages",
          imageAlignment: "left",
        },
        menu: {
          id: "header-navigation",
          kind: "menu",
          title: "Navigation",
          menuSource: "main",
          menuActiveIndicator: shellSettings.headerActiveIndicator,
        },
        button: {
          id: "header-button",
          kind: "button",
          buttonLabel: shellSettings.headerButtonLabel,
          buttonUrl: shellSettings.headerButtonUrl,
        },
        embed: {
          id: "header-spacer",
          kind: "embed",
          embedMode: "code",
          embedCode: "",
        },
        headerSearch: {
          id: "header-utility-search",
          kind: "headerSearch",
          headerUtilityAction: "search",
          headerUtilityVariant: shellSettings.headerIconVariant,
        },
        headerWishlist: {
          id: "header-utility-wishlist",
          kind: "headerWishlist",
          headerUtilityAction: "wishlist",
          headerUtilityVariant: shellSettings.headerIconVariant,
        },
        headerCart: {
          id: "header-utility-cart",
          kind: "headerCart",
          headerUtilityAction: "cart",
          headerUtilityVariant: shellSettings.headerIconVariant,
        },
        headerAccount: {
          id: "header-utility-account",
          kind: "headerAccount",
          headerUtilityAction: "account",
          headerUtilityVariant: shellSettings.headerIconVariant,
        },
        headerTheme: {
          id: "header-utility-theme",
          kind: "headerTheme",
          headerUtilityAction: "theme",
          headerUtilityVariant: shellSettings.headerIconVariant,
        },
        headerCategories: {
          id: "header-categories",
          kind: "headerCategories",
        headerCategoriesLabel: "Categories",
        headerCategoriesShowLabel: true,
        headerCategoriesDisplay: "icon-label",
        headerCategoriesIcon: "menu",
        headerCategoriesIconPosition: "left",
        headerCategoriesDropdownAlign: "left",
        headerCategoriesShowAll: true,
        headerCategoriesShowCounts: true,
        headerCategoriesShowHierarchy: true,
        },
        headerLanguage: {
          id: "header-language",
          kind: "headerLanguage",
          headerLanguageDisplay: "native",
        },
      };
      const headerElement = headerElementByKind[kind];
      if (!headerElement?.id) return;
      const headerSection = builderState.sections.find(
        (section) => section.id === "header-document",
      );
      const existingLocation = headerSection?.layoutItems?.find((item) =>
        (item.blocks ?? []).some((block) => block.id === headerElement.id),
      );
      const elementToInsert = existingLocation
        ? { ...headerElement, id: createBlockId(kind) }
        : headerElement;
      const headerRow = headerSection?.layoutItems?.find(
        (item) => item.id === (preferredHeaderColumnKey ?? selectedLayoutColumnKey),
      ) ?? headerSection?.layoutItems?.find((item) => item.id === "header-main-row")
        ?? headerSection?.layoutItems?.[0];
      if (!headerSection || !headerRow) return;
      if (existingLocation) {
        selectLayoutBlock(headerSection.id, existingLocation.id ?? "header-main-row", headerElement.id);
        return;
      }
      setBuilderState((current) => ({
        ...current,
        sections: current.sections.map((section) =>
          section.id !== headerSection.id
            ? section
            : {
                ...section,
                layoutItems: (section.layoutItems ?? []).map((item) => {
                  if (item.id !== headerRow.id) return item;
                  const blocks = [...(item.blocks ?? [])];
                  const targetIndex = targetHeaderBlockId
                    ? blocks.findIndex((block) => block.id === targetHeaderBlockId)
                    : -1;
                  const insertIndex = targetIndex < 0
                    ? blocks.length
                    : targetIndex + (placement === "below" ? 1 : 0);
                  blocks.splice(insertIndex, 0, elementToInsert);
                  return { ...item, blocks };
                }),
              },
        ),
      }));
      setSelectedId(headerSection.id);
      setSelectedLayoutColumnKey(headerRow.id ?? "header-main-row");
      setSelectedLayoutBlockKey(elementToInsert.id ?? null);
      setInspectorOpen(true);
      setPublishStatus(`${layoutBlockLabels[kind]} restored`);
      return;
    }

    let targetSection = explicitTarget
      ? builderState.sections.find((section) => section.id === explicitTarget.sectionId) ?? null
      : selectedSection;

    if (!targetSection || !isLayoutContainerSection(targetSection)) {
      const nextSection = createWireframeSection(1, 1);
      const nextColumn = nextSection.layoutItems?.[0];
      const initialBlock = createLayoutBlock(kind);
      if (nextColumn) {
        nextSection.layoutItems = nextSection.layoutItems?.map((item) =>
          item === nextColumn
            ? { ...item, blocks: [...(item.blocks ?? []), initialBlock] }
            : item,
        );
      }
      setBuilderState((current) => {
        const selectedIndex = current.sections.findIndex(
          (section) => section.id === selectedId,
        );
        const insertIndex =
          selectedIndex >= 0 ? selectedIndex + 1 : current.sections.length;
        const sections = [...current.sections];
        sections.splice(insertIndex, 0, nextSection);
        return { ...current, sections };
      });
      targetSection = nextSection;
      setSelectedId(nextSection.id);
      setPublishStatus(`${layoutBlockLabels[kind]} added in a new layout`);
      setSelectedLayoutColumnKey(nextColumn?.id ?? null);
      setSelectedLayoutBlockKey(initialBlock.id ?? null);
      setOpenLayoutItemId(nextColumn?.id ?? null);
      return;
    }

    const layoutItems = targetSection.layoutItems ?? [];
    const targetColumn = explicitTarget
      ? findLayoutColumn(targetSection, explicitTarget.columnKey)
      : (selectedLayoutColumnKey
          ? findLayoutColumn(targetSection, selectedLayoutColumnKey)
          : null) ?? layoutItems[0];
    const targetColumnIndex = layoutItems.findIndex(
      (item) => item === targetColumn,
    );
    const targetColumnKey =
      targetColumn?.id ??
      (targetColumnIndex >= 0 ? `layout-item-${targetColumnIndex}` : undefined);

    if (!targetColumnKey) {
      setPublishStatus("Add a column before adding elements");
      return;
    }

    createLayoutBlockAtDrop({
      sectionId: targetSection.id,
      targetColumnKey,
      kind,
    });
  };

  const addSelectedLayoutItem = (target?: {
    sectionId: string;
    columnKey: string;
  }) => {
    const sectionId = target?.sectionId ?? selectedSection?.id;
    const anchorColumnKey = target?.columnKey ?? selectedLayoutColumnKey;
    if (!sectionId) return;
    const sourceSection = builderState.sections.find(
      (section) => section.id === sectionId,
    );
    if (!sourceSection || !isLayoutContainerSection(sourceSection)) return;
    const sourceItems = sourceSection.layoutItems ?? [];
    const sourceAnchorIndex = anchorColumnKey
      ? sourceItems.findIndex(
          (item, index) =>
            (item.id ?? `layout-item-${index}`) === anchorColumnKey,
        )
      : sourceItems.length - 1;
    const sourceRows = getPreviewLayoutRows(sourceSection, sourceItems);
    const sourceTargetRow =
      sourceRows.find(
        (row) =>
          sourceAnchorIndex >= row.startIndex &&
          sourceAnchorIndex < row.startIndex + row.items.length,
      ) ?? sourceRows[sourceRows.length - 1];
    if (sourceTargetRow && sourceTargetRow.items.length >= 6) {
      setPublishStatus("Rows support up to 6 columns");
      return;
    }

    const id = `layout-item-${Date.now().toString(36)}`;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        if (section.rows !== undefined) {
          let foundRowIndex = -1;
          let foundColumnIndex = -1;
          if (anchorColumnKey) {
            section.rows.forEach((row, rIdx) => {
              const cIdx = row.columns.findIndex((c) => c.id === anchorColumnKey);
              if (cIdx >= 0) {
                foundRowIndex = rIdx;
                foundColumnIndex = cIdx;
              }
            });
          }
          const targetRowIndex = foundRowIndex >= 0 ? foundRowIndex : section.rows.length - 1;
          if (targetRowIndex < 0) return section;
          const targetRow = section.rows[targetRowIndex];
          if (!targetRow || targetRow.columns.length >= 6) return section;
          const insertColIndex = foundColumnIndex >= 0 ? foundColumnIndex + 1 : targetRow.columns.length;
          const colId = `layout-column-${Date.now().toString(36)}`;
          const nextCols = [...targetRow.columns];
          nextCols.splice(insertColIndex, 0, { id: colId, elements: [] });
          const nextRows = [...section.rows];
          nextRows[targetRowIndex] = { ...targetRow, columns: nextCols };
          return { ...section, rows: nextRows };
        }

        const layoutItems = section.layoutItems ?? [];
        const anchorIndex = anchorColumnKey
          ? layoutItems.findIndex(
              (item, index) =>
                (item.id ?? `layout-item-${index}`) === anchorColumnKey,
            )
          : layoutItems.length - 1;
        const safeAnchorIndex = anchorIndex >= 0 ? anchorIndex : layoutItems.length - 1;
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow =
          layoutRows.find(
            (row) =>
              safeAnchorIndex >= row.startIndex &&
              safeAnchorIndex < row.startIndex + row.items.length,
          ) ?? layoutRows[layoutRows.length - 1];

        if (targetRow && targetRow.items.length >= 6) {
          return section;
        }

        const insertIndex =
          safeAnchorIndex >= 0 ? safeAnchorIndex + 1 : layoutItems.length;
        const rowId =
          targetRow?.items.find((item) => item.rowId)?.rowId ??
          `layout-row-${Date.now().toString(36)}`;
        const nextLayoutItems = layoutItems.map((item, index) =>
          targetRow &&
          index >= targetRow.startIndex &&
          index < targetRow.startIndex + targetRow.items.length
            ? { ...item, rowId, rowLayout: undefined }
            : item,
        );
        nextLayoutItems.splice(insertIndex, 0, {
          id,
          rowId,
          rowLayout: undefined,
          blocks: [],
        });
        return {
          ...section,
          layout: undefined,
          layoutItems: nextLayoutItems,
          layoutColumns: Math.max(
            section.layoutColumns ?? 1,
            (targetRow?.items.length ?? 0) + 1,
          ),
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(id);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(id);
    setPublishStatus("Column added");
  };

  const stackColumnBelow = (sectionId: string, columnKey: string) => {
    const sourceSection = builderState.sections.find(
      (section) => section.id === sectionId,
    );
    const sourceColumn = sourceSection
      ? findLayoutColumn(sourceSection, columnKey)
      : null;
    if (!sourceSection || !sourceColumn || "nestedLayout" in sourceColumn && sourceColumn.nestedLayout) {
      return;
    }
    const nestedLayout = createVerticalNestedLayout(sourceColumn);
    const nextColumnKey = nestedLayout.rows[1]?.columns[0]?.id ?? null;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((column, index) =>
            (column.id ?? `layout-item-${index}`) === columnKey
              ? {
                  ...column,
                  blocks: [],
                  nestedLayout,
                }
              : column,
          ),
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(nextColumnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(nextColumnKey);
    setPublishStatus("Column converted to a stacked layout");
  };

  const unwrapNestedColumn = (sectionId: string, columnKey: string) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((column, index) => {
            if (
              (column.id ?? `layout-item-${index}`) !== columnKey ||
              !column.nestedLayout
            ) {
              return column;
            }
            return {
              ...column,
              blocks: column.nestedLayout.rows.flatMap((row) =>
                row.columns.flatMap((nestedColumn) => nestedColumn.blocks),
              ),
              nestedLayout: undefined,
            };
          }),
        };
      }),
    }));
    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(null);
    setPublishStatus("Stacked layout removed");
  };

  const appendNestedRow = (
    sectionId: string,
    outerColumnKey: string,
    afterRowId: string,
  ) => {
    const seed = Date.now().toString(36);
    const rowId = `nested-row-${seed}`;
    const columnId = `nested-column-${seed}`;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((column, index) => {
            if (
              (column.id ?? `layout-item-${index}`) !== outerColumnKey ||
              !column.nestedLayout
            ) {
              return column;
            }
            const rows = [...column.nestedLayout.rows];
            const anchorIndex = rows.findIndex((row) => row.id === afterRowId);
            rows.splice(anchorIndex >= 0 ? anchorIndex + 1 : rows.length, 0, {
              id: rowId,
              weight: 1,
              layout: "whole",
              columns: [
                {
                  id: columnId,
                  rowId,
                  rowLayout: "whole",
                  blocks: [],
                },
              ],
            });
            return {
              ...column,
              nestedLayout: {
                ...column.nestedLayout,
                rows,
              },
            };
          }),
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(columnId);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(columnId);
    setPublishStatus("Nested row added");
  };

  const deleteNestedRow = (
    sectionId: string,
    outerColumnKey: string,
    rowId: string,
    nestedColumnKey: string,
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((column) => {
            if (!column.nestedLayout) {
              return column;
            }
            const isRequestedColumn =
              column.id === outerColumnKey ||
              column.nestedLayout.rows.some(
                (row) =>
                  row.id === rowId ||
                  row.columns.some(
                    (nestedColumn) => nestedColumn.id === nestedColumnKey,
                  ),
              );
            if (!isRequestedColumn) return column;

            const remainingRows = column.nestedLayout.rows.filter(
              (row) =>
                row.id !== rowId &&
                !row.columns.some(
                  (nestedColumn) => nestedColumn.id === nestedColumnKey,
                ),
            );
            if (remainingRows.length === column.nestedLayout.rows.length) {
              return column;
            }

            if (remainingRows.length === 1) {
              return {
                ...column,
                blocks: remainingRows[0].columns.flatMap(
                  (nestedColumn) => nestedColumn.blocks,
                ),
                nestedLayout: undefined,
              };
            }

            return {
              ...column,
              nestedLayout: {
                ...column.nestedLayout,
                rows: remainingRows,
              },
            };
          }),
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(outerColumnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(outerColumnKey);
    setPublishStatus("Nested row deleted");
  };

  const deleteSelectedLayoutItem = (index: number) => {
    if (!selectedSection) return;
    const item = selectedSection.layoutItems?.[index];
    updateSelected({
      layout: undefined,
      layoutItems: (selectedSection.layoutItems ?? []).filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    });
    if (item?.id === openLayoutItemId) {
      setOpenLayoutItemId(null);
    }
    if (item?.id === selectedLayoutColumnKey) {
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
    }
  };

  const deleteStructureColumn = ({ sectionId, columnKey }: { sectionId: string; columnKey: string }) => {
    const section = builderState.sections.find((candidate) => candidate.id === sectionId);
    if (!section || section.rows !== undefined) return;
    const index = (section.layoutItems ?? []).findIndex(
      (item, itemIndex) => (item.id ?? `layout-item-${itemIndex}`) === columnKey,
    );
    if (index < 0) return;
    if (selectedSection?.id === sectionId) {
      deleteSelectedLayoutItem(index);
      return;
    }
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((candidate) =>
        candidate.id === sectionId
          ? {
              ...candidate,
              layout: undefined,
              layoutItems: (candidate.layoutItems ?? []).filter((_, itemIndex) => itemIndex !== index),
            }
          : candidate,
      ),
    }));
  };

  const openWordPressMediaPicker = ({
    title,
    currentUrl,
    multiple = false,
    onSelect,
    onSelectMany,
  }: {
    title: string;
    currentUrl?: string;
    multiple?: boolean;
    onSelect: (media: WordPressMediaItem) => void;
    onSelectMany?: (media: WordPressMediaItem[]) => void;
  }) => {
    mediaSelectRef.current = onSelect;
    mediaSelectManyRef.current = onSelectMany ?? null;
    setMediaPickerTitle(title);
    setMediaPickerCurrentUrl(currentUrl ?? "");
    setMediaPickerMultiple(multiple);
    setMediaPickerOpen(true);
  };

  const closeWordPressMediaPicker = () => {
    setMediaPickerOpen(false);
    mediaSelectRef.current = null;
    mediaSelectManyRef.current = null;
  };

  const selectWordPressMedia = (media: WordPressMediaItem) => {
    mediaSelectRef.current?.(media);
    setPublishStatus("WordPress media selected");
    closeWordPressMediaPicker();
  };

  const selectManyWordPressMedia = (mediaItems: WordPressMediaItem[]) => {
    mediaSelectManyRef.current?.(mediaItems);
    setPublishStatus(`${mediaItems.length} WordPress media items selected`);
    closeWordPressMediaPicker();
  };

  const uploadSelectedSlideImage = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingSlide(index);
    setPublishStatus("Uploading slide image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/builder-uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        setPublishStatus(payload.error ?? "Image upload failed");
        return;
      }

      updateSelectedSlide(index, {
        imageUrl: payload.url,
        imageAlt:
          selectedSection?.slides?.[index]?.imageAlt ||
          selectedSection?.slides?.[index]?.title ||
          file.name,
      });
      setPublishStatus("Slide image uploaded");
    } catch {
      setPublishStatus("Image upload failed");
    } finally {
      setUploadingSlide(null);
    }
  };

  const uploadSelectedLayoutBlockSlideImage = async (
    columnIndex: number,
    blockIndex: number,
    slideIndex: number,
    file: File | null,
  ) => {
    if (!file) return;
    const uploadKey = `${columnIndex}-${blockIndex}-${slideIndex}`;
    setUploadingNestedSlide(uploadKey);
    setPublishStatus("Uploading slide image...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/builder-uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        setPublishStatus(payload.error ?? "Image upload failed");
        return;
      }

      const layoutItem = selectedSection?.layoutItems?.[columnIndex];
      const block = layoutItem
        ? getLayoutItemBlocks(layoutItem)[blockIndex]
        : undefined;
      const slide = block?.slides?.[slideIndex];

      updateSelectedLayoutBlockSlide(columnIndex, blockIndex, slideIndex, {
        imageUrl: payload.url,
        imageAlt: slide?.imageAlt || slide?.title || file.name,
      });
      setPublishStatus("Slide image uploaded");
    } catch {
      setPublishStatus("Image upload failed");
    } finally {
      setUploadingNestedSlide(null);
    }
  };

  const pickGridItemImage = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    currentUrl?: string,
  ) => {
    openWordPressMediaPicker({
      title: "Choose grid item image",
      currentUrl,
      onSelect: (media) => {
        updateGridItemByKey(sectionId, columnKey, blockKey, itemIndex, {
          imageUrl: media.sourceUrl,
          imageAlt: media.altText || media.title || media.filename || "",
        });
        setPublishStatus("Grid image selected");
      },
    });
  };

  const pickBlockImage = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    currentUrl?: string,
  ) => {
    openWordPressMediaPicker({
      title: "Choose image",
      currentUrl,
      onSelect: (media) => {
        updateLayoutBlockByKey(sectionId, columnKey, blockKey, {
          imageUrl: media.sourceUrl,
          imageAlt: media.altText || media.title || media.filename || "",
        });
        setPublishStatus("Image selected");
      },
    });
  };

  const addWireframeNear = (
    columns: number,
    rows: number,
    targetSectionId: string,
    placement: "above" | "below",
    presetKey?: string,
    selectTarget: "column" | "section" = "column",
    renameAfterCreate = false,
  ) => {
    const nextSection = createWireframeSection(columns, rows, presetKey);
    setBuilderState((current) => {
      const targetIndex = current.sections.findIndex(
        (section) => section.id === targetSectionId,
      );
      const insertIndex =
        targetIndex < 0
          ? current.sections.length
          : targetIndex + (placement === "below" ? 1 : 0);
      const nextSections = [...current.sections];
      nextSections.splice(insertIndex, 0, nextSection);
      return { ...current, sections: nextSections };
    });
    setSelectedId(nextSection.id);
    setSelectedLayoutRowIndex(null);
    if (selectTarget === "column" && isLayoutContainerSection(nextSection)) {
      const firstColumn = nextSection.layoutItems?.[0]?.id ?? null;
      setSelectedLayoutColumnKey(firstColumn);
      setOpenLayoutItemId(firstColumn);
      setSelectedLayoutBlockKey(null);
    } else {
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
    }
    openInspectorPanel();
    setInspectorTab("layout");
    if (selectTarget === "section") setSectionSettingsOpen(true);
    if (renameAfterCreate) setRenameSectionRequestId(nextSection.id);
    requestAnimationFrame(() => {
      document.getElementById(nextSection.id)?.scrollIntoView({ block: "nearest" });
    });
  };

  const renameBuilderSection = (sectionId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;
    setBuilderState((current) => {
      const reserved = [
        ...current.sections,
        ...headerDocumentState.sections,
        ...footerDocumentState.sections,
      ]
        .filter((section) => section.id !== sectionId)
        .map((section) => section.anchorId ?? "")
        .filter(Boolean);
      return {
        ...current,
        sections: current.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                name: trimmedName,
                anchorId:
                  section.anchorId ||
                  createUniqueBuilderAnchorId(trimmedName, reserved),
              }
            : section,
        ),
      };
    });
  };

  const startDocumentRename = () => {
    if (builderState.page !== "header" && builderState.page !== "footer") return;
    setDocumentRenameDraft(
      builderState.displayName || (builderState.page === "footer" ? "Footer" : "Header"),
    );
    setDocumentRenameEditing(true);
  };

  const finishDocumentRename = (commit: boolean) => {
    const nextName = documentRenameDraft.trim();
    if (commit && nextName) {
      setBuilderState((current) => ({ ...current, displayName: nextName }));
      setPublishStatus(`${builderState.page === "footer" ? "Footer" : "Header"} document renamed`);
    }
    setDocumentRenameEditing(false);
    setDocumentRenameDraft("");
  };

  const addRowNear = (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => {
    const preset = rowInsertionPresets.find((item) => item.key === presetKey);
    if (!preset) return;

    const newItems: PreviewLayoutItem[] = createStructuralRowItems(preset.key);
    const firstColumnKey: string | null = newItems[0]?.id ?? null;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        if (section.rows !== undefined) {
          const targetRow = section.rows[rowIndex];
          const insertIndex = targetRow
            ? rowIndex + (placement === "after" ? 1 : 0)
            : section.rows.length;
          const rowId =
            newItems[0]?.rowId ?? `layout-row-${Date.now().toString(36)}`;
          const nextRow: BuilderRow = {
            id: rowId,
            layout: preset.key,
            columns: newItems.map((item, index) => ({
              id: item.id ?? `${rowId}-column-${index + 1}`,
              elements: item.blocks ?? [],
            })),
          };
          const rows = [...section.rows];
          rows.splice(insertIndex, 0, nextRow);
          return { ...section, rows, layoutRows: rows.length };
        }

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[rowIndex];
        const insertIndex = targetRow
          ? targetRow.startIndex +
            (placement === "after" ? targetRow.items.length : 0)
          : layoutItems.length;
        const nextLayoutItems = [...layoutItems];
        nextLayoutItems.splice(insertIndex, 0, ...newItems);

        return {
          ...section,
          layoutItems: nextLayoutItems,
          layoutRows: layoutRows.length + 1,
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(firstColumnKey);
    setOpenLayoutItemId(firstColumnKey);
    setSelectedLayoutBlockKey(null);
    setPublishStatus("Row inserted");
  };

  const deleteEmptyRow = (sectionId: string, rowIndex: number) => {
    const removedColumnKeys = new Set<string>();

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        if (section.rows !== undefined) {
          const targetRow = section.rows[rowIndex];
          if (!targetRow) return section;
          const isEmptyRow = targetRow.columns.every(
            (column) => column.elements.length === 0,
          );
          if (!isEmptyRow) return section;
          targetRow.columns.forEach((column) =>
            removedColumnKeys.add(column.id),
          );
          const rows = section.rows.filter((_, index) => index !== rowIndex);
          return { ...section, rows, layoutRows: rows.length };
        }

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[rowIndex];
        if (!targetRow) return section;

        const isEmptyRow = targetRow.items.every(
          (item) => (item.blocks ?? []).length === 0,
        );
        if (!isEmptyRow) return section;

        targetRow.items.forEach((item, columnIndex) => {
          removedColumnKeys.add(
            item.id ?? `layout-item-${targetRow.startIndex + columnIndex}`,
          );
        });

        return {
          ...section,
          layoutItems: layoutItems.filter(
            (_, itemIndex) =>
              itemIndex < targetRow.startIndex ||
              itemIndex >= targetRow.startIndex + targetRow.items.length,
          ),
          layoutRows: Math.max(0, layoutRows.length - 1),
        };
      }),
    }));

    if (
      selectedLayoutColumnKey &&
      removedColumnKeys.has(selectedLayoutColumnKey)
    ) {
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
    }
    if (openLayoutItemId && removedColumnKeys.has(openLayoutItemId)) {
      setOpenLayoutItemId(null);
    }
    setPublishStatus("Blank row deleted");
  };

  const applySelectedRowLayoutPreset = (presetKey: string) => {
    if (!selectedSection || selectedLayoutRowIndex === null) return;
    if (selectedSection.id !== "header-document") {
      const preset = getBuilderRowLayoutPreset(presetKey);
      if (!preset) return;
      setBuilderState((current) => ({
        ...current,
        sections: current.sections.map((section) =>
          section.id === selectedSection.id && isLayoutContainerSection(section)
            ? applyCanonicalBuilderRowLayout(
                section,
                selectedLayoutRowIndex,
                preset.key,
                preset.ratios.length,
              )
            : section,
        ),
      }));
      setPublishStatus("Row layout updated");
      return;
    }
    applyContentRowLayoutPreset(
      selectedSection.id,
      selectedLayoutRowIndex,
      presetKey,
    );
  };

  const updateSelectedRowStyle = (
    patch: Partial<BuilderRow>,
  ) => {
    if (!selectedSection || selectedLayoutRowIndex === null) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (
          section.id !== selectedSection.id ||
          !isLayoutContainerSection(section)
        ) {
          return section;
        }

        return updateCanonicalBuilderRow(section, selectedLayoutRowIndex, patch);
      }),
    }));
    setPublishStatus("Row settings updated");
  };

  const updateSelectedColumnStyle = (
    patch: Partial<BuilderColumn>,
  ) => {
    if (!selectedSection || !selectedLayoutColumnKey) return;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== selectedSection.id || !isLayoutContainerSection(section)) {
          return section;
        }
        return updateCanonicalBuilderColumn(section, selectedLayoutColumnKey, patch);
      }),
    }));
    setPublishStatus("Column settings updated");
  };

  const duplicateSelectedRow = () => {
    if (!selectedSection || selectedLayoutRowIndex === null) return;
    duplicateLayoutRow(selectedSection.id, selectedLayoutRowIndex);
  };

  const duplicateLayoutRow = (sectionId: string, rowIndex: number) => {
    const rowId = `layout-row-${Date.now().toString(36)}`;
    let nextSelectedColumnKey: string | null = null;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        if (section.rows !== undefined) {
          const targetRow = section.rows[rowIndex];
          if (!targetRow) return section;
          const copiedRow: BuilderRow = {
            ...(JSON.parse(JSON.stringify(targetRow)) as BuilderRow),
            id: rowId,
            columns: targetRow.columns.map((column, index) => ({
              ...JSON.parse(JSON.stringify(column)),
              id: `${rowId}-column-${index + 1}`,
              elements: column.elements.map((block) => ({
                ...JSON.parse(JSON.stringify(block)),
                id: createBlockId((block.kind ?? "text") as LayoutBlockKind),
              })),
            })),
          };
          nextSelectedColumnKey = copiedRow.columns[0]?.id ?? null;
          const rows = [...section.rows];
          rows.splice(rowIndex + 1, 0, copiedRow);
          return { ...section, rows, layoutRows: rows.length };
        }

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[rowIndex];
        if (!targetRow) return section;

        const copiedItems = targetRow.items.map((item, index) => {
          const copy = JSON.parse(JSON.stringify(item)) as PreviewLayoutItem;
          return {
            ...copy,
            id: `${rowId}-column-${index + 1}`,
            rowId,
            blocks: (copy.blocks ?? []).map((block) => ({
              ...block,
              id: createBlockId((block.kind ?? "text") as LayoutBlockKind),
            })),
          };
        });
        nextSelectedColumnKey = copiedItems[0]?.id ?? null;

        const insertIndex = targetRow.startIndex + targetRow.items.length;
        return {
          ...section,
          layoutItems: [
            ...layoutItems.slice(0, insertIndex),
            ...copiedItems,
            ...layoutItems.slice(insertIndex),
          ],
          layoutRows: layoutRows.length + 1,
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(rowIndex + 1);
    setSelectedLayoutColumnKey(nextSelectedColumnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(nextSelectedColumnKey);
    setInspectorTab("layout");
    openInspectorPanel();
    setPublishStatus("Row duplicated");
  };

  const moveLayoutRow = (
    sectionId: string,
    rowIndex: number,
    direction: -1 | 1,
  ) => {
    const targetRowIndex = rowIndex + direction;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        if (section.rows !== undefined) {
          const rows = [...section.rows];
          if (!rows[rowIndex] || !rows[targetRowIndex]) return section;
          const [movedRow] = rows.splice(rowIndex, 1);
          if (!movedRow) return section;
          rows.splice(targetRowIndex, 0, movedRow);
          return { ...section, rows };
        }

        const layoutItems = section.layoutItems ?? [];
        const rows = getPreviewLayoutRows(section, layoutItems);
        const row = rows[rowIndex];
        const targetRow = rows[targetRowIndex];
        if (!row || !targetRow) return section;

        const nextRows = [...rows];
        const [movedRow] = nextRows.splice(rowIndex, 1);
        if (!movedRow) return section;
        nextRows.splice(targetRowIndex, 0, movedRow);

        return {
          ...section,
          layoutItems: nextRows.flatMap((entry) => entry.items),
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(targetRowIndex);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setInspectorTab("layout");
    openInspectorPanel();
    setPublishStatus("Row moved");
  };

  const deleteSelectedRow = () => {
    if (!selectedSection || selectedLayoutRowIndex === null) return;
    deleteEmptyRow(selectedSection.id, selectedLayoutRowIndex);
    setSelectedLayoutRowIndex(null);
  };

  const moveSelected = (direction: -1 | 1) => {
    moveSection(selectedId, direction);
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    setBuilderState((current) => {
      const index = current.sections.findIndex(
        (section) => section.id === sectionId,
      );
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.sections.length)
        return current;
      const nextSections = [...current.sections];
      const [section] = nextSections.splice(index, 1);
      nextSections.splice(target, 0, section);
      return { ...current, sections: nextSections };
    });
    setSelectedId(sectionId);
  };

  const reorderSection = (
    sourceId: string,
    targetId: string,
    placement: "above" | "below" = "above",
  ) => {
    if (sourceId === targetId) return;
    setBuilderState((current) => {
      const sourceIndex = current.sections.findIndex(
        (section) => section.id === sourceId,
      );
      if (sourceIndex < 0) return current;
      const nextSections = [...current.sections];
      const [section] = nextSections.splice(sourceIndex, 1);
      let targetIndex = nextSections.findIndex((sec) => sec.id === targetId);
      if (targetIndex < 0) return current;
      if (placement === "below") {
        targetIndex += 1;
      }
      nextSections.splice(targetIndex, 0, section);
      return { ...current, sections: nextSections };
    });
    setSelectedId(sourceId);
  };

  const duplicateSelected = () => {
    if (!selectedSection) return;
    duplicateSection(selectedSection.id);
  };

  const duplicateSection = (sectionId: string) => {
    const sourceSection = builderState.sections.find(
      (section) => section.id === sectionId,
    );
    if (!sourceSection) return;
    const copySection = {
      ...(JSON.parse(JSON.stringify(sourceSection)) as BuilderSection),
      id: createId(sourceSection.kind),
      title: `${sourceSection.title} Copy`,
    };
    setBuilderState((current) => {
      const index = current.sections.findIndex(
        (section) => section.id === sectionId,
      );
      const nextSections = [...current.sections];
      nextSections.splice(index + 1, 0, copySection);
      return { ...current, sections: nextSections };
    });
    setSelectedId(copySection.id);
  };

  const deleteSelected = () => {
    deleteSection(selectedId);
  };

  const deleteSection = (sectionId: string) => {
    const removedIndex = builderState.sections.findIndex(
      (section) => section.id === sectionId,
    );
    const nextSections = builderState.sections.filter(
      (section) => section.id !== sectionId,
    );
    const nextSelected =
      nextSections[Math.max(0, Math.min(removedIndex, nextSections.length - 1))]
        ?.id ?? "";
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
    setSelectedId(nextSelected);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
  };

  const undoBuilder = () => {
    const history = undoHistoryRef.current;
    if (history.length <= 1) {
      setPublishStatus("Nothing to undo");
      return;
    }

    const current = history[history.length - 1];
    redoHistoryRef.current.push(structuredClone(current));
    history.pop();

    const nextState = structuredClone(history[history.length - 1]);
    skipUndoCaptureRef.current = true;
    setBuilderState(nextState);
    setPublishStatus("Undid last change");
  };
  undoRef.current = undoBuilder;

  const redoBuilder = () => {
    const redoHistory = redoHistoryRef.current;
    if (redoHistory.length === 0) {
      setPublishStatus("Nothing to redo");
      return;
    }

    const current = undoHistoryRef.current[undoHistoryRef.current.length - 1];
    const nextState = structuredClone(redoHistory.pop()!);
    undoHistoryRef.current.push(structuredClone(nextState));
    skipUndoCaptureRef.current = true;
    setBuilderState(nextState);
    setPublishStatus("Redid last change");
  };
  redoRef.current = redoBuilder;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const isUndo = mod && e.key === "z" && !e.shiftKey;
      const isRedo = mod && e.key === "z" && e.shiftKey;
      if (isUndo) {
        e.preventDefault();
        undoRef.current();
      }
      if (isRedo) {
        e.preventDefault();
        redoRef.current();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const copyJson = async () => {
    await navigator.clipboard.writeText(builderJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadPublishedLayout = useCallback(async () => {
    // Template and Individual modes have stricter context owners that load the
    // authored document and its root materialization together. A generic
    // document reload would discard that validated render projection.
    if (strictBuilderTargetRef.current) return;
    const requestedState = builderStateRef.current;
    const requestedPage = resolveRequestedPageFromSearch(requestedState.page);
    const hasStoredDraft = restoredDraftKeysRef.current.has(requestedPage);
    const requestUrl = builderApiUrl("/api/builder-layouts",
      activeDynamicDocumentId && requestedState.page.startsWith("dynamic:")
        ? { document: activeDynamicDocumentId }
        : { key: requestedPage },
    );
    const requestIdentity = requestUrl;
    if (ordinaryLoadIdentityRef.current === requestIdentity) return;
    ordinaryLoadIdentityRef.current = requestIdentity;
    const requestId = ++ordinaryLoadRequestRef.current;
    setPublishStatus("Reading published layout...");
    const requestedStateForPage = {
      ...requestedState,
      page: requestedPage,
    };
    const requestedSignature = JSON.stringify(requestedStateForPage);
    const canUseInitialHydration = Boolean(
      initialPageHydration?.authoredLayout &&
      initialPageHydration.authoredLayout.page === requestedPage &&
      initialHydrationConsumedRef.current !== requestUrl,
    );
    const response: {
      ok: boolean;
      payload: PublishedBuilderLayoutPayload;
    } = canUseInitialHydration
      ? {
          ok: true,
          payload: {
            layout: initialPageHydration!.authoredLayout,
            renderLayout: initialPageHydration!.renderLayout,
          } as PublishedBuilderLayoutPayload,
        }
      : await fetchPublishedLayoutOnce(requestUrl);
    if (canUseInitialHydration) {
      initialHydrationConsumedRef.current = requestUrl;
    }

    if (
      requestId !== ordinaryLoadRequestRef.current ||
      strictBuilderTargetRef.current
    ) {
      return;
    }

    if (!response.ok) {
      setPublishStatus("Could not read published layout");
      setPublishedDocumentReady(true);
      return;
    }

    const payload = response.payload;


    if (
      requestId !== ordinaryLoadRequestRef.current ||
      strictBuilderTargetRef.current
    ) {
      return;
    }

    if (payload.editorContext) setBuilderEditorContext(payload.editorContext);

    const currentState = builderStateRef.current;
    if (currentState.page !== requestedPage) {
      setPublishStatus("Kept newer local changes");
      setPublishedDocumentReady(true);
      return;
    }
    if (JSON.stringify(currentState) !== requestedSignature) {
      setPublishStatus("Kept newer local changes");
      return;
    }

    if (!payload.layout?.sections?.length) {
      setPublishStatus("No published layout yet");
      setCommittedBuilderStateSignature(hasStoredDraft ? "" : requestedSignature);
      setPublishedDocumentReady(true);
      return;
    }

    const nextPublishedState = normalizeBuilderState({
        page: payload.layout.page,
        targetType:
          payload.layout.targetType ?? requestedStateForPage.targetType ?? "page",
        template: payload.layout.template,
        design: {
          ...defaultDesign,
          ...(payload.layout.design ?? {}),
        },
        sections: payload.layout.sections,
      }, requestedPage);

    const nextSignature = JSON.stringify(nextPublishedState);
    const nextRenderState = payload.renderLayout?.sections?.length
      ? normalizeBuilderState({
          page: payload.renderLayout.page,
          targetType:
            payload.renderLayout.targetType ?? requestedStateForPage.targetType ?? "page",
          template: payload.renderLayout.template,
          design: {
            ...defaultDesign,
            ...(payload.renderLayout.design ?? {}),
          },
          sections: payload.renderLayout.sections,
        }, requestedPage)
      : null;
    const nextRenderProjection = nextRenderState
      ? {
          page: nextPublishedState.page,
          sourceSignature: nextSignature,
          sections: nextRenderState.sections,
        }
      : null;
    const applyProjectionForSignature = (signature: string) => {
      setBuilderRenderProjection(
        nextRenderProjection?.sourceSignature === signature
          ? nextRenderProjection
          : null,
      );
    };
    payload.dynamicContentDiagnostics
      ?.filter((diagnostic) => diagnostic.status === "fallback")
      .forEach((diagnostic) => {
        console.warn("[dynamic-content] Builder preview fallback", diagnostic);
      });
    const draftMetadata = draftMetadataRef.current[requestedPage];
    const hasCompatibleRestoredDraft =
      hasStoredDraft &&
      draftMetadata?.basePublishedSignature === nextSignature;
    if (hasCompatibleRestoredDraft) {
      applyProjectionForSignature(requestedSignature);
      setCommittedBuilderStateSignature(nextSignature);
      setPublishStatus(
        nextSignature === requestedSignature
          ? "Local draft matches published"
          : "Local draft restored",
      );
      setPublishedDocumentReady(true);
      return;
    }

    // A legacy draft has no base-document marker. A marked draft whose base
    // differs from the persisted document is also stale (for example after a
    // YOOtheme import or restore). Neither may conceal the persisted page.
    if (hasStoredDraft) {
      removeBuilderDraft(storageKeys, requestedPage);
      restoredDraftKeysRef.current.delete(requestedPage);
      delete draftMetadataRef.current[requestedPage];
    }
    if (nextSignature === requestedSignature) {
      applyProjectionForSignature(requestedSignature);
      setCommittedBuilderStateSignature(nextSignature);
      setPublishStatus("Local draft matches published");
      setPublishedDocumentReady(true);
      return;
    }

    undoHistoryRef.current = [structuredClone(nextPublishedState)];
    applyProjectionForSignature(nextSignature);
    setCommittedBuilderStateSignature(nextSignature);
    setBuilderState(nextPublishedState);
    setSelectedId(nextPublishedState.sections[0]?.id ?? "");
    setPublishStatus("Published layout loaded");
    setPublishedDocumentReady(true);
  }, [
    activeDynamicDocumentId,
    activeIndividualContextToken,
    activeRoutingTemplateId,
    resolveRequestedPageFromSearch,
    builderApiUrl,
    storageKeys,
    initialPageHydration,
  ]);

  useEffect(() => {
    if (!draftReady) return;
    // Strict document sessions hydrate through their canonical owner context.
    // Do not let the ordinary page loader race that request and replace the
    // authored document with the initial Home draft.
    if (
      shellTransitionRef.current ||
      activeShellEntry ||
      searchParams.get("document") ||
      builderState.page === "header" ||
      builderState.page === "footer"
    ) return;
    if (resolveRequestedPageFromSearch(builderState.page) !== builderState.page) return;
    if (activeRoutingTemplateId || activeIndividualContextToken) return;
    void loadPublishedLayout();
  }, [activeIndividualContextToken, activeRoutingTemplateId, activeShellEntry, builderState.page, draftReady, loadPublishedLayout, resolveRequestedPageFromSearch, searchParams]);

  useEffect(() => {
    if (!draftReady || !publishedDocumentReady) return;
    const contextAware = builderEditorContext?.content.mode === "preview" ||
      builderEditorContext?.content.mode === "fixed";
    if (contextAware) return;
    const pageChanged = previousDynamicContentPageRef.current !== builderState.page;
    const dynamicMetadataChanged =
      previousDynamicContentSignatureRef.current !== dynamicContentSignature;
    if (!pageChanged && !dynamicMetadataChanged) return;

    previousDynamicContentPageRef.current = builderState.page;
    previousDynamicContentSignatureRef.current = dynamicContentSignature;
    if (dynamicContentSignature === "[]" && !activeRoutingTemplateId && !activeIndividualContextToken) {
      setBuilderRenderProjection(null);
      return;
    }
    void refreshDynamicContentPreview();
  }, [
    builderState.page,
    activeIndividualContextToken,
    activeRoutingTemplateId,
    builderEditorContext?.content.mode,
    draftReady,
    dynamicContentSignature,
    publishedDocumentReady,
    refreshDynamicContentPreview,
  ]);

  useEffect(() => {
    if (!draftReady || !publishedDocumentReady) return;
    const contextAware = builderEditorContext?.content.mode === "preview" ||
      builderEditorContext?.content.mode === "fixed";
    if (!contextAware) {
      previousAuthoredRevisionRef.current = authoredRevisionSignature;
      return;
    }
    if (previousAuthoredRevisionRef.current === null) {
      previousAuthoredRevisionRef.current = authoredRevisionSignature;
      return;
    }
    if (previousAuthoredRevisionRef.current === authoredRevisionSignature) return;
    previousAuthoredRevisionRef.current = authoredRevisionSignature;
    if (authoredRefreshTimerRef.current !== null) {
      window.clearTimeout(authoredRefreshTimerRef.current);
    }
    // Coalesce the burst of AST mutations emitted by one Builder interaction
    // while retaining the existing request-id and authored-signature guards.
    authoredRefreshTimerRef.current = window.setTimeout(() => {
      authoredRefreshTimerRef.current = null;
      void refreshDynamicContentPreview();
    }, 60);
  }, [
    authoredRevisionSignature,
    builderEditorContext?.content.mode,
    draftReady,
    publishedDocumentReady,
    refreshDynamicContentPreview,
  ]);

  const publishLayout = async () => {
    setPublishStatus("Publishing...");
    setPublishCelebration(false);

    let layoutSuccess = true;
    let shellSuccess = true;

    // Publishing is the authoritative save boundary. Always persist the exact
    // document currently rendered by the Builder before recording publication;
    // a stale committed signature or a restored local draft must never let this
    // request be skipped.
    const response = await fetch(builderApiUrl("/api/builder-layouts"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        activeDynamicDocumentId
          ? { ...builderState, action: "save", documentId: activeDynamicDocumentId }
          : builderState,
      ),
    });

    if (!response.ok) {
      layoutSuccess = false;
    } else {
      setCommittedBuilderStateSignature(JSON.stringify(builderState));
      if (pendingYoothemeDraftInvalidationRef.current === builderState.page) {
        try {
          invalidateImportedBuilderDraft(window.localStorage, {
            draftsKey: storageKeys.drafts,
            stateKey: storageKeys.state,
            draftMetadataKey: storageKeys.draftMetadata,
            pageKey: builderState.page,
            importedState: builderState,
          });
          restoredDraftKeysRef.current.delete(builderState.page);
          delete draftMetadataRef.current[builderState.page];
          // The import's setState effect can still be queued when Publish is
          // clicked. Skip precisely that already-persisted state once, rather
          // than allowing it to recreate the invalidated draft.
          skipImportedDraftPersistenceRef.current = {
            page: builderState.page,
            signature: JSON.stringify(builderState),
          };
          pendingYoothemeDraftInvalidationRef.current = null;
        } catch {
          // Persistence succeeded. A storage failure must not turn a successful
          // document publish into a failed import.
        }
      }
      setPublishedKeys((current) => {
        if (current.includes(builderState.page)) return current;
        return [...current, builderState.page];
      });
    }

    if (hasShellPendingChanges && canEditShellSettings) {
      if (shellAutoSaveTimer.current) {
        window.clearTimeout(shellAutoSaveTimer.current);
      }
      const success = await saveShellSettings(
        shellSettings,
        `${isWebsiteScopedBuilder ? "Website" : "Global"} settings published`,
      );
      if (success) {
        setCommittedShellSettingsSignature(JSON.stringify(shellSettings));
      } else {
        shellSuccess = false;
      }
    }

    if (!layoutSuccess || !shellSuccess) {
      if (!layoutSuccess && !shellSuccess) {
        setPublishStatus("Publish failed");
      } else if (!layoutSuccess) {
        setPublishStatus("Layout publish failed");
      } else {
        setPublishStatus("Settings publish failed");
      }
      return;
    }

    if (websiteId) {
      const publicationResponse = await fetch(
        `/api/websites/${websiteId}/publication`,
        { method: "POST" },
      );
      if (!publicationResponse.ok) {
        setPublishStatus("Published, but status tracking failed");
        return;
      }
    }

    setPublishStatus("Published successfully");
    setPublishCelebration(true);
    if (publishCelebrationTimer.current) {
      window.clearTimeout(publishCelebrationTimer.current);
    }
    publishCelebrationTimer.current = window.setTimeout(() => {
      setPublishCelebration(false);
    }, 2800);
  };

  const saveShellSettings = async (
    nextSettings: BuilderShellSettings,
    status?: string,
    revision = shellSaveRevision.current,
  ) => {
    // A tenant route without its canonical website id must fail closed. It
    // must never downgrade a Global Styles write to the Root shell.
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/app/websites/") && !websiteId) {
      setShellStatus("Website scope unavailable; Global Styles were not saved.");
      console.error("[global-settings-scope] blocked unscoped tenant shell write", {
        pathname: window.location.pathname,
        websiteId: null,
      });
      return false;
    }
    if (!canEditShellSettings) {
      setShellStatus("Platform global settings require super admin access.");
      return false;
    }

    const apiUrl = builderApiUrl("/api/builder-shell");
    console.log("[global-settings-scope] DashboardBuilder saving shell settings", {
      userRole: saasUserRole ?? null,
      websiteId: websiteId ?? null,
      section: "builder-shell",
      apiUrl,
      payloadKeys: Object.keys(nextSettings),
    });
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Keep the write scope explicit. The API rejects a missing or
        // mismatched tenant scope before it can resolve the root file.
        "X-Builder-Website-Id": websiteId ?? "root",
      },
      body: JSON.stringify(nextSettings),
    });

    if (!response.ok) {
      if (revision !== shellSaveRevision.current) return false;
      setShellStatus("Shell save failed");
      return false;
    }

    const payload = (await response.json()) as {
      settings?: BuilderShellSettings;
    };

    if (payload.settings && revision === shellSaveRevision.current) {
      setShellSettings(payload.settings);
    }
    if (revision === shellSaveRevision.current) {
      setShellStatus(status ?? `${shellSettingsStatusLabel} saved`);
    }
    return true;
  };

  const updateShellSettings = (patch: Partial<BuilderShellSettings>) => {
    if (!canEditShellSettings) {
      setShellStatus("Platform global settings require super admin access.");
      return;
    }

    const revision = ++shellSaveRevision.current;
    const nextSettings = { ...shellSettings, ...patch };
    setShellSettings(nextSettings);
    setShellStatus(`Updating ${isWebsiteScopedBuilder ? "website" : "global"} preview...`);

    // Global Styles is the editable surface for the resolved provider theme.
    // Keep the Theme Settings document's resolved projection in sync with
    // those edits, otherwise a refresh would re-apply the older imported
    // value over the user's current Global Styles choice.
    if (themeSettings.active && themeSettings.provider === "yootheme") {
      const nextThemeSettings: BuilderThemeSettings = {
        ...themeSettings,
        resolved: {
          ...themeSettings.resolved,
          shellSettings: {
            ...themeSettings.resolved.shellSettings,
            ...patch,
          },
        },
        updatedAt: new Date().toISOString(),
      };
      setThemeSettings(nextThemeSettings);
      if (themeAutoSaveTimer.current) {
        window.clearTimeout(themeAutoSaveTimer.current);
      }
      themeAutoSaveTimer.current = window.setTimeout(() => {
        void fetch(builderApiUrl("/api/builder-theme-settings"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextThemeSettings),
        }).catch(() => {
          setShellStatus("Theme settings autosave failed");
        });
      }, 260);
    }

    if (shellAutoSaveTimer.current) {
      window.clearTimeout(shellAutoSaveTimer.current);
    }

    shellAutoSaveTimer.current = window.setTimeout(() => {
      void saveShellSettings(
        nextSettings,
        `${isWebsiteScopedBuilder ? "Website" : "Global"} preview updated`,
        revision,
      );
    }, 220);
  };

  const saveBuilderThemeSettings = async (nextSettings: BuilderThemeSettings) => {
    if (!canEditShellSettings) {
      setShellStatus("Platform global settings require super admin access.");
      return false;
    }
    const response = await fetch(builderApiUrl("/api/builder-theme-settings"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextSettings),
    });
    if (!response.ok) {
      setShellStatus("Theme settings save failed");
      return false;
    }
    const payload = (await response.json()) as { settings?: BuilderThemeSettings };
    if (payload.settings) setThemeSettings(payload.settings);
    setShellStatus(`${isWebsiteScopedBuilder ? "Website" : "Global"} theme settings saved`);
    return true;
  };

  const importBuilderThemeSettings = async (nextThemeSettings: BuilderThemeSettings) => {
    if (!canEditShellSettings) {
      setShellStatus("Platform global settings require super admin access.");
      return;
    }

    // An import is a replacement of the provider document. Cancel pending
    // Global Styles writes first; otherwise a debounced edit from the
    // previous theme could overwrite this import a few hundred milliseconds
    // later with stale sourceConfig/header data.
    if (shellAutoSaveTimer.current) {
      window.clearTimeout(shellAutoSaveTimer.current);
      shellAutoSaveTimer.current = null;
    }
    if (themeAutoSaveTimer.current) {
      window.clearTimeout(themeAutoSaveTimer.current);
      themeAutoSaveTimer.current = null;
    }

    setThemeSettings(nextThemeSettings);
    const saved = await saveBuilderThemeSettings(nextThemeSettings);
    if (!saved) return;
    // WebsiteFrontend reads Theme Settings on the server. Change the iframe
    // identity after the persisted import so the preview cannot keep the old
    // page shell/Header projection in its isolated document.
    setThemePreviewRevision((revision) => revision + 1);

    if (Object.keys(nextThemeSettings.resolved.shellSettings).length) {
      // Materialize the resolved provider projection in the WebPages shell
      // document without going through updateShellSettings. That function
      // intentionally mirrors ordinary Global Styles edits back into the
      // current theme document; during a replacement import its closure may
      // still point at the old theme and would schedule a stale overwrite.
      const nextShellSettings = {
        ...shellSettings,
        ...nextThemeSettings.resolved.shellSettings,
      };
      const shellRevision = ++shellSaveRevision.current;
      setShellSettings(nextShellSettings);
      await saveShellSettings(
        nextShellSettings,
        `${isWebsiteScopedBuilder ? "Website" : "Global"} theme shell imported`,
        shellRevision,
      );
    }

    if (Object.keys(nextThemeSettings.resolved.headerDocument).length) {
      const currentHeaderState = builderStateRef.current.page === "header"
        ? builderStateRef.current
        : headerDocumentPreviewState ?? hydrateDocumentBuilderState(
            loadDraftForKey("header", storageKeys),
            shellSettings,
          );
      const nextHeaderState = materializeImportedHeaderDocument(
        currentHeaderState,
        nextThemeSettings.resolved.headerDocument,
      );
      setHeaderDocumentPreviewState(nextHeaderState);
      if (builderStateRef.current.page === "header") setBuilderState(nextHeaderState);
      try {
        const drafts = JSON.parse(window.localStorage.getItem(storageKeys.drafts) ?? "{}") as Partial<Record<BuilderLayoutKey, BuilderState>>;
        drafts.header = nextHeaderState;
        window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));
      } catch {
        // The in-memory Header document remains authoritative for this session.
      }
      await fetch(builderApiUrl("/api/builder-layouts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextHeaderState),
      });
    }
    setTemplateStatus(`${nextThemeSettings.displayName} Theme Settings imported`);
  };

  const exportBuilderThemeSettings = () => {
    if (!themeSettings.active) return;
    const blob = new Blob([JSON.stringify(themeSettings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${themeSettings.themeId ?? "yootheme"}-theme-settings.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const applyGlobalStylePreset = (preset: GlobalStylePreset) => {
    const confirmed = window.confirm(
      "Apply this style preset?\nThis will replace your current Global Style settings while keeping your pages and content.",
    );

    if (!confirmed) return;

    const expandedDesign = preset.design.preset
      ? {
          ...designPresets[preset.design.preset],
          ...preset.design,
        }
      : preset.design;

    updateDesign(expandedDesign);
    updateShellSettings(preset.shellSettings);
  };

  const updateMenuPresentation = (
    itemId: string,
    patch: Partial<MenuPresentationSettings>,
  ) => {
    const nextMenuPresentation = {
      ...(shellSettings.menuPresentation ?? {}),
      [itemId]: {
        ...normalizeMenuPresentation(shellSettings.menuPresentation?.[itemId]),
        ...patch,
      },
    };

    updateShellSettings({
      menuPresentation: nextMenuPresentation,
    });
  };


  const publishShellSettings = async () => {
    if (!canEditShellSettings) {
      setShellStatus("Platform global settings require super admin access.");
      return;
    }

    setShellStatus(`Publishing ${isWebsiteScopedBuilder ? "website" : "global"} settings...`);
    await saveShellSettings(
      shellSettings,
      `${isWebsiteScopedBuilder ? "Website" : "Global"} settings published`,
    );
  };

  const createBuilderPage = async (
    template?: Pick<BuilderSavedTemplate, "title" | "design" | "sections">,
    customTitle?: string,
  ) => {
    const title =
      customTitle?.trim() ||
      template?.title?.trim() ||
      newPageTitle.trim() ||
      "New Page";
    setPageStatus("Creating page...");

    const response = await fetch(builderApiUrl("/api/builder-pages"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        slug: slugifyPageTitle(title),
      }),
    });

    if (!response.ok) {
      setPageStatus("Page creation failed");
      return;
    }

    const payload = (await response.json()) as {
      page?: BuilderCustomPage;
    };

    if (!payload.page || !isBuilderCustomPageKey(payload.page.key)) {
      setPageStatus("Page creation failed");
      return;
    }

    const nextPages = [
      ...customPages.filter((page) => page.key !== payload.page?.key),
      payload.page,
    ];
    setCustomPages(nextPages);
    window.localStorage.setItem(
      storageKeys.pages,
      JSON.stringify(nextPages),
    );
    if (!template) {
      setNewPageTitle("");
    }

    const nextState = template
      ? normalizeBuilderState(
          {
            page: payload.page.key,
            targetType: "page",
            template: undefined,
            design: template.design ?? defaultDesign,
            sections: template.sections.map(cloneTemplateSection),
          },
          payload.page.key,
        )
      : getDefaultStateForKey(payload.page.key);
    setBuilderState(nextState);
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
    setPageStatus(template ? "Page created from template" : "Page created");
    router.replace(`${pathname}?page=${payload.page.key}`, { scroll: false });
  };

  const createBuilderPageFromTemplate = (
    template: BuilderSavedTemplate | PageTemplateLibraryItem,
    customTitle?: string,
  ) => {
    if ("templateType" in template && (template.templateType ?? "page") !== "page") {
      setPageStatus("Choose a page template");
      return;
    }
    void createBuilderPage(
      {
        title: "name" in template ? template.name : template.title,
        design: template.design,
        sections: template.sections,
      },
      customTitle,
    );
  };

  const deleteBuilderPage = async (key: BuilderCustomPageKey) => {
    setPageStatus("Deleting page...");
    const response = await fetch(
      builderApiUrl("/api/builder-pages", { key }),
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      setPageStatus("Page delete failed");
      return;
    }

    const nextPages = customPages.filter((page) => page.key !== key);
    setCustomPages(nextPages);
    setPublishedKeys((current) => current.filter((k) => k !== key));
    window.localStorage.setItem(
      storageKeys.pages,
      JSON.stringify(nextPages),
    );

    try {
      const rawDrafts = window.localStorage.getItem(storageKeys.drafts);
      const drafts = rawDrafts
        ? (JSON.parse(rawDrafts) as Partial<
            Record<BuilderLayoutKey, BuilderState>
          >)
        : {};
      delete drafts[key];
      window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));
    } catch {
      // Keeping a stale local draft is harmless if cleanup fails.
    }

    if (builderState.page === key) {
      switchBuilderTarget("shop");
    }

    setPageStatus("Page deleted");
  };

  const handleReorderCustomPages = async (nextPages: BuilderCustomPage[]) => {
    setCustomPages(nextPages);
    window.localStorage.setItem(
      storageKeys.pages,
      JSON.stringify(nextPages),
    );
    try {
      await fetch(builderApiUrl("/api/builder-pages"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pages: nextPages }),
      });
    } catch (err) {
      console.error("Failed to persist custom pages order on server:", err);
    }
  };

  const cloneTemplateBlock = (
    block: BuilderLayoutBlock,
  ): BuilderLayoutBlock => {
    const nextBlock = JSON.parse(JSON.stringify(block)) as BuilderLayoutBlock;
    return {
      ...nextBlock,
      id: createBlockId((nextBlock.kind ?? "text") as LayoutBlockKind),
    };
  };

  const cloneTemplateRow = (row: BuilderRow, suffix = "use"): BuilderRow => {
    const nextRow = JSON.parse(JSON.stringify(row)) as BuilderRow;
    const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    return {
      ...nextRow,
      id: `layout-row-${seed}-${suffix}`,
      columns: nextRow.columns.map((column, index) => ({
        ...column,
        id: `layout-column-${seed}-${suffix}-${index}`,
        elements: (column.elements ?? []).map(cloneTemplateBlock),
      })),
    };
  };

  const cloneTemplateSection = (section: BuilderSection): BuilderSection => {
    const nextSection = JSON.parse(JSON.stringify(section)) as BuilderSection;
    const rowIdMap = new Map<string, string>();
    const nextLayoutItems = (nextSection.layoutItems ?? []).map(
      (item, index) => {
        const itemRowId = item.rowId;
        const nextRowId = itemRowId
          ? (rowIdMap.get(itemRowId) ??
            `layout-row-${Date.now().toString(36)}-${index}`)
          : undefined;
        if (itemRowId && nextRowId) rowIdMap.set(itemRowId, nextRowId);
        return {
          ...item,
          id: `layout-item-${Date.now().toString(36)}-${index}-${Math.random()
            .toString(36)
            .slice(2, 6)}`,
          rowId: nextRowId,
          blocks: (item.blocks ?? []).map(cloneTemplateBlock),
        };
      },
    );

    return {
      ...nextSection,
      id: createId(nextSection.kind),
      rows: nextSection.rows?.map((row, index) =>
        cloneTemplateRow(row, `section-${index}`),
      ),
      layoutItems:
        nextLayoutItems.length > 0 ? nextLayoutItems : nextSection.layoutItems,
    };
  };

  const createElementTemplateSection = (
    block: BuilderLayoutBlock,
    title: string,
  ): BuilderSection => {
    const section = createWireframeSection(1, 1, "whole");
    return {
      ...section,
      title,
      layoutItems: [
        {
          ...(section.layoutItems?.[0] ?? {}),
          id: `layout-item-${Date.now().toString(36)}-template-element`,
          blocks: [cloneTemplateBlock(block)],
        },
      ],
    };
  };

  const createRowTemplateSection = (
    section: BuilderSection,
    rowIndex: number,
    title: string,
  ): BuilderSection | null => {
    if (!isLayoutContainerSection(section)) return null;
    const row = normalizeBuilderSectionLayout(section).rows[rowIndex];
    if (!row) return null;
    const wrapper = createWireframeSection(row.columns.length || 1, 1, row.layout);
    return {
      ...wrapper,
      title,
      layout: row.layout,
      layoutColumns: row.columns.length || 1,
      rows: [cloneTemplateRow(row, "template")],
      layoutItems: undefined,
    };
  };

  const persistTemplate = async ({
    title,
    templateType,
    sections,
    design,
  }: {
    title: string;
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>;
    sections: BuilderSection[];
    design?: BuilderDesign;
  }) => {
    const pageTitle = getLayoutLabel(builderState.page, customPages);
    setTemplateStatus("Saving template...");

    const response = await fetch(builderApiUrl("/api/builder-templates"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title,
        templateType,
        description:
          templateType === "page"
            ? `Page template saved from ${pageTitle}`
            : templateType === "header"
              ? "Header layout saved from the current Header document"
              : templateType === "footer"
                ? "Footer layout saved from the current Footer document"
            : templateType === "section"
              ? `Section template saved from ${pageTitle}`
              : templateType === "row"
                ? `Row template saved from ${pageTitle}`
                : `Element template saved from ${pageTitle}`,
        sourcePage: builderState.page,
        design,
        sections,
      }),
    });

    if (!response.ok) {
      setTemplateStatus("Template save failed");
      return null;
    }

    const payload = (await response.json()) as {
      template?: BuilderSavedTemplate;
      templates?: BuilderSavedTemplate[];
    };
    const savedTemplate = payload.template ?? null;

    if (payload.templates) {
      setSavedTemplates(payload.templates);
    } else if (payload.template) {
      setSavedTemplates((templates) => [
        payload.template as BuilderSavedTemplate,
        ...templates.filter((template) => template.id !== payload.template?.id),
      ]);
    }

    setTemplateStatus("Template saved");
    return savedTemplate;
  };

  const saveTemplate = async (
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>,
    customTitle?: string,
  ) => {
    const pageTitle = getLayoutLabel(builderState.page, customPages);
    const title =
      customTitle?.trim() ||
      (templateType === "page"
        ? pageTitle
        : templateType === "header"
          ? "Saved Header"
          : templateType === "footer"
            ? "Saved Footer"
        : templateType === "section"
          ? selectedSection?.title || "Saved Section"
          : selectedLayoutBlock
            ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
            : "Saved Element");
    const sections =
      templateType === "page" || templateType === "header" || templateType === "footer"
        ? builderState.sections
        : templateType === "section"
          ? selectedSection
            ? [selectedSection]
            : []
          : selectedLayoutBlock
            ? [createElementTemplateSection(selectedLayoutBlock, title)]
            : [];

    if (sections.length === 0) {
      setTemplateStatus(`Select a ${templateType} before saving`);
      return null;
    }

    return persistTemplate({
      title,
      templateType,
      design: templateType === "page" ? builderState.design : undefined,
      sections,
    });
  };

  const saveCurrentPageAsTemplate = (title?: string) => {
    return saveTemplate("page", title);
  };

  const saveSelectedSectionAsTemplate = (title?: string) => {
    return saveTemplate("section", title);
  };

  const saveSelectedElementAsTemplate = (title?: string) => {
    return saveTemplate("element", title);
  };

  const saveSectionTemplateById = (sectionId: string) => {
    const section = builderState.sections.find((item) => item.id === sectionId);
    if (!section) {
      setTemplateStatus("Select a section before saving");
      return null;
    }
    return persistTemplate({
      title: section.title || sectionLabels[section.kind] || "Saved Section",
      templateType: "section",
      sections: [section],
    });
  };

  const saveRowTemplateByIndex = (sectionId: string, rowIndex: number) => {
    const section = builderState.sections.find((item) => item.id === sectionId);
    const rowSection = section
      ? createRowTemplateSection(section, rowIndex, `Row ${rowIndex + 1}`)
      : null;
    if (!rowSection) {
      setTemplateStatus("Select a row before saving");
      return null;
    }
    return persistTemplate({
      title: `Row ${rowIndex + 1}`,
      templateType: "row",
      sections: [rowSection],
    });
  };

  const saveElementTemplateByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
  ) => {
    const section = builderState.sections.find((item) => item.id === sectionId);
    if (!section || !isLayoutContainerSection(section)) {
      setTemplateStatus("Select an element before saving");
      return null;
    }
    const item = (section.layoutItems ?? []).find(
      (layoutItem, index) =>
        (layoutItem.id ?? `layout-item-${index}`) === columnKey,
    );
    const block = (item?.blocks ?? []).find(
      (entry, index) =>
        (entry.id ?? `${columnKey}-block-${index}`) === blockKey,
    );
    if (!block) {
      setTemplateStatus("Select an element before saving");
      return null;
    }
    const title = layoutBlockLabels[block.kind ?? "text"] ?? "Saved Element";
    return persistTemplate({
      title,
      templateType: "element",
      sections: [createElementTemplateSection(block, title)],
    });
  };

  const getFirstTemplateBlock = (sections: BuilderSection[]) =>
    sections
      .flatMap((section) => normalizeBuilderSectionLayout(section).rows)
      .flatMap((row) => row.columns)
      .flatMap((column) => column.elements ?? [])[0];

  const applySavedTemplate = (
    template: BuilderSavedTemplate,
    options: { confirmReplace?: boolean } = {},
  ) => {
    const templateType = template.templateType ?? "page";
    if (options.confirmReplace !== false && templateType === "page" && builderState.sections.length > 0 &&
      !window.confirm(`Replace the current layout with “${template.title}”?`)) {
      return;
    }
    const clonedSections = template.sections.map(cloneTemplateSection);

    if (templateType === "header") {
      const currentHeaderSection = builderState.sections.find(
        (section) => section.id === "header-document",
      ) ?? builderState.sections[0];
      const savedHeaderSection = clonedSections[0];
      if (!savedHeaderSection) {
        setTemplateStatus("Header template is empty");
        return;
      }

      const documentFields = [
        "headerVisible",
        "headerTransparent",
        "headerOverlay",
        "headerHeight",
        "headerCustomHeight",
        "headerLayout",
        "headerBehavior",
        "headerWidthMode",
        "headerBackgroundMode",
        "headerTextMode",
        "headerZIndex",
        "headerTopToolbarVisible",
        "headerTopToolbarText",
        "headerTopToolbarPhone",
        "headerTopToolbarMeta",
      ] as const;
      const preservedFields = Object.fromEntries(
        documentFields.flatMap((field) =>
          savedHeaderSection[field] === undefined && currentHeaderSection?.[field] !== undefined
            ? [[field, currentHeaderSection[field]]]
            : [],
        ),
      );
      const nextHeaderSections = clonedSections.map((section, index) =>
        index === 0
          ? {
              ...section,
              id: currentHeaderSection?.id ?? section.id,
              ...preservedFields,
            }
          : section,
      );

      setBuilderState((current) => ({
        ...current,
        page: "header",
        targetType: "header",
        sections: nextHeaderSections,
      }));
      setSelectedId(nextHeaderSections[0]?.id ?? "");
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutRowIndex(null);
      setSelectedLayoutBlockKey(null);
      setOpenLayoutItemId(null);
      setTemplateStatus("Header layout applied");
      return;
    }

    if (templateType === "footer") {
      const currentFooterSection = builderState.sections.find(
        (section) => section.id === "footer-document",
      ) ?? builderState.sections[0];
      const savedFooterSection = clonedSections[0];
      if (!savedFooterSection) {
        setTemplateStatus("Footer template is empty");
        return;
      }

      const documentFields = [
        "background",
        "backgroundMode",
        "contentMode",
        "colorScheme",
        "topSpacing",
        "bottomSpacing",
        "topMargin",
        "bottomMargin",
        "pullUnderHeader",
        "visible",
        "visualStyle",
        "animation",
      ] as const;
      const preservedFields = Object.fromEntries(
        documentFields.flatMap((field) =>
          savedFooterSection[field] === undefined && currentFooterSection?.[field] !== undefined
            ? [[field, currentFooterSection[field]]]
            : [],
        ),
      );
      const nextFooterSections = clonedSections.map((section, index) =>
        index === 0
          ? {
              ...section,
              id: currentFooterSection?.id ?? section.id,
              ...preservedFields,
            }
          : section,
      );

      setBuilderState((current) => ({
        ...current,
        page: "footer",
        targetType: "footer",
        sections: nextFooterSections,
      }));
      setSelectedId(nextFooterSections[0]?.id ?? "");
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutRowIndex(null);
      setSelectedLayoutBlockKey(null);
      setOpenLayoutItemId(null);
      setTemplateStatus("Footer layout applied");
      return;
    }

    if (templateType === "page") {
      setBuilderState((current) => ({
        ...current,
        design: template.design ?? current.design,
        sections: clonedSections,
      }));
      const firstSectionId = clonedSections[0]?.id ?? "";
      setSelectedId(firstSectionId);
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutRowIndex(null);
      setSelectedLayoutBlockKey(null);
      setOpenLayoutItemId(null);
      setTemplateStatus("Page template applied");
      return;
    }

    if (templateType === "element") {
      const block = getFirstTemplateBlock(clonedSections);
      if (
        block &&
        selectedSection &&
        isLayoutContainerSection(selectedSection) &&
        selectedLayoutColumnKey
      ) {
        setBuilderState((current) => ({
          ...current,
          sections: current.sections.map((section) => {
            if (section.id !== selectedSection.id) return section;
            return updateLayoutColumn(section, selectedLayoutColumnKey, (column) => ({
              ...column,
              blocks: [...(column.blocks ?? []), block],
            }));
          }),
        }));
        setSelectedLayoutBlockKey(block.id ?? null);
        setTemplateStatus("Element template added");
        return;
      }
    }

    if (
      templateType === "row" &&
      selectedSection &&
      isLayoutContainerSection(selectedSection)
    ) {
      const sourceRow = clonedSections[0]
        ? normalizeBuilderSectionLayout(clonedSections[0]).rows[0]
        : null;
      if (sourceRow) {
        const nextRowIndex = normalizeBuilderSectionLayout(selectedSection).rows.length;
        setBuilderState((current) => ({
          ...current,
          sections: current.sections.map((section) =>
            section.id === selectedSection.id
              ? {
                  ...section,
                  rows: [...normalizeBuilderSectionLayout(section).rows, sourceRow],
                }
              : section,
          ),
        }));
        setSelectedLayoutRowIndex(nextRowIndex);
        setSelectedLayoutColumnKey(sourceRow.columns[0]?.id ?? null);
        setTemplateStatus("Row template added");
        return;
      }
    }

    setBuilderState((current) => ({
      ...current,
      sections: [...current.sections, ...clonedSections],
    }));
    setSelectedId(clonedSections[0]?.id ?? selectedId);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setTemplateStatus(
      templateType === "element"
        ? "Element template added as a new section"
        : templateType === "row"
          ? "Row template added as a new section"
          : "Section template added",
    );
  };

  const getSavedTemplateById = (templateId: string) =>
    savedTemplates.find((template) => template.id === templateId);

  const createRowFromTemplate = (template: BuilderSavedTemplate) => {
    const sourceSection = template.sections[0];
    const sourceRow = sourceSection
      ? normalizeBuilderSectionLayout(sourceSection).rows[0]
      : null;
    return sourceRow ? cloneTemplateRow(sourceRow, "insert") : null;
  };

  const insertSectionTemplateNear = (
    templateId: string,
    targetSectionId: string,
    placement: "above" | "below" | "replace",
  ) => {
    const template = getSavedTemplateById(templateId);
    const templateType = template?.templateType ?? "page";
    if (
      !template ||
      !(["page", "footer", "section", "row"] as LayoutLibraryType[]).includes(templateType)
    ) {
      setTemplateStatus("Drop section templates between sections");
      return false;
    }

    const clonedSections = template.sections.map(cloneTemplateSection);
    const currentSections = builderStateRef.current.sections;
    const previewMutation = insertAtContextualTarget(
      currentSections,
      clonedSections,
      targetSectionId,
      placement === "above" ? "before" : placement === "below" ? "after" : "replace",
      (section) => section.id,
    );
    if (!previewMutation.targetFound) {
      setTemplateStatus("Library target changed. Select the structure item and try again.");
      return false;
    }
    setBuilderState((current) => {
      const mutation = insertAtContextualTarget(
        current.sections,
        clonedSections,
        targetSectionId,
        placement === "above" ? "before" : placement === "below" ? "after" : "replace",
        (section) => section.id,
      );
      return mutation.targetFound ? { ...current, sections: mutation.items } : current;
    });
    setSelectedId(clonedSections[0]?.id ?? targetSectionId);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setTemplateStatus(placement === "replace" ? "Section replaced from Library" : "Section template inserted");
    return true;
  };

  const insertRowTemplateAt = (
    templateId: string,
    sectionId: string,
    targetRowId: string,
    placement: "before" | "after" | "replace",
    revealInspector = true,
  ) => {
    const template = getSavedTemplateById(templateId);
    if (!template || template.templateType !== "row") {
      setTemplateStatus("Drop row templates on row borders");
      return false;
    }

    const insertedRow = createRowFromTemplate(template);
    if (!insertedRow) {
      setTemplateStatus("Row template is empty");
      return false;
    }

    const currentSection = builderStateRef.current.sections.find((section) => section.id === sectionId);
    const previewMutation = currentSection && isLayoutContainerSection(currentSection)
      ? insertAtContextualTarget(
          normalizeBuilderSectionLayout(currentSection).rows,
          [insertedRow],
          targetRowId,
          placement,
          (row) => row.id,
        )
      : null;
    if (!previewMutation?.targetFound) {
      setTemplateStatus("Library row target changed. Select the row and try again.");
      return false;
    }
    const nextSelectedRowIndex = previewMutation.insertedIndex;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const mutation = insertAtContextualTarget(
          normalizeBuilderSectionLayout(section).rows,
          [insertedRow],
          targetRowId,
          placement,
          (row) => row.id,
        );
        if (!mutation.targetFound) return section;
        return {
          ...section,
          rows: mutation.items,
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(nextSelectedRowIndex);
    setSelectedLayoutColumnKey(insertedRow.columns[0]?.id ?? null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(insertedRow.columns[0]?.id ?? null);
    setInspectorTab("layout");
    if (revealInspector) openInspectorPanel();
    setTemplateStatus(placement === "replace" ? "Row replaced from Library" : "Row template inserted");
    return true;
  };

  const insertElementTemplateAt = ({
    templateId,
    sectionId,
    columnKey,
    targetBlockKey,
    placement = "above",
    revealInspector = true,
  }: {
    templateId: string;
    sectionId: string;
    columnKey: string;
    targetBlockKey?: string;
    placement?: "above" | "below" | "replace";
    revealInspector?: boolean;
  }) => {
    const template = getSavedTemplateById(templateId);
    if (!template || template.templateType !== "element") {
      setTemplateStatus("Drop element templates into columns");
      return false;
    }

    const sourceBlock = getFirstTemplateBlock(template.sections);
    if (!sourceBlock) {
      setTemplateStatus("Element template is empty");
      return false;
    }

    const insertedBlock = cloneTemplateBlock(sourceBlock);
    const currentSection = builderStateRef.current.sections.find((section) => section.id === sectionId);
    const currentColumn = currentSection && isLayoutContainerSection(currentSection)
      ? findLayoutColumn(currentSection, columnKey)
      : null;
    if (!currentColumn) {
      setTemplateStatus("Library column target changed. Select the element and try again.");
      return false;
    }
    if (targetBlockKey) {
      const previewMutation = insertAtContextualTarget(
        currentColumn.blocks ?? [],
        [insertedBlock],
        targetBlockKey,
        placement === "above" ? "before" : placement === "below" ? "after" : "replace",
        (block, index) => block.id ?? `${columnKey}-block-${index}`,
      );
      if (!previewMutation.targetFound) {
        setTemplateStatus("Library element target changed. Select the element and try again.");
        return false;
      }
    }
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }
        return updateLayoutColumn(section, columnKey, (item) => {
          const blocks = [...(item.blocks ?? [])];
          if (!targetBlockKey) return { ...item, blocks: [...blocks, insertedBlock] };
          const mutation = insertAtContextualTarget(
            blocks,
            [insertedBlock],
            targetBlockKey,
            placement === "above" ? "before" : placement === "below" ? "after" : "replace",
            (block, index) => block.id ?? `${columnKey}-block-${index}`,
          );
          return mutation.targetFound ? { ...item, blocks: mutation.items } : item;
        });
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(insertedBlock.id ?? null);
    setOpenLayoutItemId(columnKey);
    setInspectorTab("content");
    if (revealInspector) openInspectorPanel();
    setTemplateStatus(placement === "replace" ? "Element replaced from Library" : "Element template inserted");
    return true;
  };

  const openContextualLibrary = (requestedType?: LayoutLibraryType) => {
    const usesUnifiedLayouts = builderState.page !== "header";
    const unifiedLayoutType: LayoutLibraryType =
      builderState.page === "footer" ? "footer" : "page";
    const documentRoot =
      (builderState.page === "header" || builderState.page === "footer") &&
      selectedLayoutRowIndex === null &&
      !selectedLayoutColumnKey &&
      !selectedLayoutBlockKey;
    const preferredType: LayoutLibraryType = requestedType ?? (
      usesUnifiedLayouts
        ? selectedLayoutBlockKey || selectedLayoutColumnKey
          ? "element"
          : unifiedLayoutType
        : selectedLayoutBlockKey
        ? "element"
        : selectedLayoutRowIndex !== null
          ? "row"
          : selectedLayoutColumnKey
            ? "element"
            : documentRoot
              ? builderState.page as "header" | "footer"
              : selectedId
                ? "section"
                : "page"
    );

    const targetSection = builderState.sections.find((section) => section.id === selectedId);
    const targetRowId = targetSection && selectedLayoutRowIndex !== null
      ? normalizeBuilderSectionLayout(targetSection).rows[selectedLayoutRowIndex]?.id ?? null
      : null;
    setContextualLibraryTarget({
      page: builderState.page,
      sectionId: selectedId || null,
      rowId: targetRowId,
      columnKey: selectedLayoutColumnKey,
      blockKey: selectedLayoutBlockKey,
    });
    setContextualLibraryType(preferredType);
    setContextualLibraryOpen(true);
    setSidebarTab("builder");
    setSidebarCollapsed(false);
  };

  const usesUnifiedContextualLayouts = builderState.page !== "header";
  const unifiedContextualLayoutType: LayoutLibraryType =
    builderState.page === "footer" ? "footer" : "page";
  const contextualLibraryGroups: LayoutLibraryGroup[] | undefined =
    usesUnifiedContextualLayouts
      ? [
          {
            value: unifiedContextualLayoutType,
            label: "Layouts",
            types: ["page", "footer", "section", "row"],
          },
          { value: "element", label: "Elements", types: ["element"] },
        ]
      : undefined;
  const contextualLibraryTypes: LayoutLibraryType[] =
    builderState.page === "header"
      ? ["header", "section", "row", "element"]
      : [unifiedContextualLayoutType, "element"];

  const contextualLibraryActions = (() => {
    const target = contextualLibraryTarget;
    if (!target) return [];
    if (contextualLibraryType === "header" || contextualLibraryType === "footer") {
      return [{ value: "replace" as const, label: "Replace" }];
    }
    if (contextualLibraryType === "page") {
      return [
        { value: "before" as const, label: "Insert Before" },
        { value: "after" as const, label: "Insert After" },
        { value: "replace" as const, label: "Replace Layout" },
      ];
    }
    if (contextualLibraryType === "section") {
      return [
        { value: "before" as const, label: "Insert Before" },
        { value: "after" as const, label: "Insert After" },
        ...(target.sectionId
          ? [{ value: "replace" as const, label: "Replace" }]
          : []),
      ];
    }
    if (contextualLibraryType === "row") {
      return target.sectionId && target.rowId
        ? [
            { value: "before" as const, label: "Insert Before" },
            { value: "after" as const, label: "Insert After" },
            { value: "replace" as const, label: "Replace" },
          ]
        : [];
    }
    if (contextualLibraryType === "element") {
      if (!target.sectionId || !target.columnKey) return [];
      return target.blockKey
        ? [
            { value: "before" as const, label: "Insert Before" },
            { value: "after" as const, label: "Insert After" },
            { value: "replace" as const, label: "Replace" },
          ]
        : [{ value: "after" as const, label: "Insert After" }];
    }
    return [];
  })();

  const contextualLibraryActionsForTemplate = (
    template: BuilderSavedTemplate | null,
  ) => {
    if (!usesUnifiedContextualLayouts) return contextualLibraryActions;
    const templateType = template?.templateType ?? unifiedContextualLayoutType;
    if (templateType !== "element") {
      return [
        { value: "before" as const, label: "Insert Before" },
        { value: "after" as const, label: "Insert After" },
        { value: "replace" as const, label: "Replace Layout" },
      ];
    }
    const target = contextualLibraryTarget;
    if (!target?.sectionId || !target.columnKey) return [];
    return target.blockKey
      ? [
          { value: "before" as const, label: "Insert Before" },
          { value: "after" as const, label: "Insert After" },
          { value: "replace" as const, label: "Replace" },
        ]
      : [{ value: "after" as const, label: "Insert After" }];
  };

  const insertContextualLibraryTemplate = (
    template: BuilderSavedTemplate,
    action: LayoutLibraryInsertionAction,
  ) => {
    const target = contextualLibraryTarget;
    if (!target) return;
    if (builderStateRef.current.page !== target.page) {
      setTemplateStatus("Library document target changed. Reopen Library from the current structure.");
      return;
    }
    const templateType = template.templateType ?? "page";
    let inserted = false;

    if (
      usesUnifiedContextualLayouts &&
      templateType !== "element" &&
      templateType !== "header"
    ) {
      const clonedSections = template.sections.map(cloneTemplateSection);
      if (action === "replace") {
        setBuilderState((current) => ({ ...current, sections: clonedSections }));
        setSelectedId(clonedSections[0]?.id ?? "");
        setSelectedLayoutRowIndex(null);
        setSelectedLayoutColumnKey(null);
        setSelectedLayoutBlockKey(null);
        setOpenLayoutItemId(null);
        setTemplateStatus("Layout replaced from Library");
        inserted = true;
      } else {
        const currentSections = builderStateRef.current.sections;
        const sectionAnchorId = target.sectionId ?? (
          action === "before"
            ? currentSections[0]?.id
            : currentSections[currentSections.length - 1]?.id
        ) ?? "";
        inserted = insertSectionTemplateNear(
          template.id,
          sectionAnchorId,
          action === "before" ? "above" : action === "after" ? "below" : "replace",
        );
      }
    } else if (templateType === "header" || templateType === "footer") {
      applySavedTemplate(template, { confirmReplace: false });
      inserted = true;
    } else if (templateType === "page") {
      if (action === "replace") {
        applySavedTemplate(template, { confirmReplace: false });
        inserted = true;
      } else {
        const currentSections = builderStateRef.current.sections;
        const sectionAnchorId = target.sectionId ?? (
          action === "before"
            ? currentSections[0]?.id
            : currentSections[currentSections.length - 1]?.id
        ) ?? "";
        inserted = insertSectionTemplateNear(
          template.id,
          sectionAnchorId,
          action === "before" ? "above" : "below",
        );
      }
    } else if (templateType === "section") {
      if (action === "replace" && !target.sectionId) return;
      const currentSections = builderStateRef.current.sections;
      const sectionAnchorId = target.sectionId ?? (
        action === "before"
          ? currentSections[0]?.id
          : currentSections[currentSections.length - 1]?.id
      ) ?? "";
      inserted = insertSectionTemplateNear(
        template.id,
        sectionAnchorId,
        action === "before" ? "above" : action === "after" ? "below" : "replace",
      );
    } else if (
      templateType === "row" &&
      target.sectionId &&
      target.rowId
    ) {
      inserted = insertRowTemplateAt(template.id, target.sectionId, target.rowId, action, false);
    } else if (
      templateType === "element" &&
      target.sectionId &&
      target.columnKey
    ) {
      inserted = insertElementTemplateAt({
        templateId: template.id,
        sectionId: target.sectionId,
        columnKey: target.columnKey,
        targetBlockKey: target.blockKey ?? undefined,
        placement: action === "before" ? "above" : action === "after" ? "below" : "replace",
        revealInspector: false,
      });
    } else {
      return;
    }

    if (!inserted) return;
    setContextualLibraryOpen(false);
    setContextualLibraryTarget(null);
    setSidebarTab("builder");
  };

  useEffect(() => {
    if (!contextualLibraryOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextualLibraryOpen(false);
        setContextualLibraryTarget(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [contextualLibraryOpen]);

  const renameSavedTemplate = async (
    template: BuilderSavedTemplate,
    nextTitle: string,
  ) => {
    const title = nextTitle.trim();
    if (!title || title === template.title) return;
    setTemplateStatus("Renaming template...");

    const response = await fetch(builderApiUrl("/api/builder-templates"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...template,
        title,
      }),
    });

    if (!response.ok) {
      setTemplateStatus("Template rename failed");
      return;
    }

    const payload = (await response.json()) as {
      template?: BuilderSavedTemplate;
      templates?: BuilderSavedTemplate[];
    };
    if (payload.templates) {
      setSavedTemplates(payload.templates);
    }
    setTemplateStatus("Template renamed");
  };

  const exportSavedTemplate = (template: BuilderSavedTemplate) => {
    const exportedAt = new Date().toISOString();
    const portableTemplate = { ...template };
    delete portableTemplate.libraryScope;
    const payload = {
      exportType: "webpages-builder-template",
      exportVersion: 1,
      exportedAt,
      template: portableTemplate,
    };
    const templateType = template.templateType ?? "page";
    const slug =
      template.title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 72) || "template";
    const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], {
      type: "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `webpages-${templateType}-template-${slug}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setTemplateStatus(`${templateType} template exported`);
  };

  const importSavedTemplate = async (
    file: File,
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>,
    title: string,
    acceptedTypes: LayoutLibraryType[] = [templateType],
  ) => {
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const parsedObject =
        parsed && typeof parsed === "object"
          ? (parsed as Record<string, unknown>)
          : null;
      const wrappedTemplate =
        parsedObject?.template &&
        typeof parsedObject.template === "object" &&
        !Array.isArray(parsedObject.template)
          ? (parsedObject.template as Partial<BuilderSavedTemplate>)
          : null;
      const importedTemplate = wrappedTemplate
        ? wrappedTemplate
        : (parsedObject as Partial<BuilderSavedTemplate> | null);

      if (!importedTemplate) {
        setTemplateStatus("Template import failed: invalid JSON");
        return false;
      }

      const importedType = importedTemplate.templateType ?? templateType;

      if (
        importedType !== "page" &&
        importedType !== "header" &&
        importedType !== "footer" &&
        importedType !== "section" &&
        importedType !== "row" &&
        importedType !== "element"
      ) {
        setTemplateStatus("Template import failed: unsupported type");
        return false;
      }

      if (!acceptedTypes.includes(importedType)) {
        setTemplateStatus(`This Library view does not accept ${importedType} compositions`);
        return false;
      }

      if (!Array.isArray(importedTemplate.sections)) {
        setTemplateStatus("Template import failed: missing sections");
        return false;
      }

      setTemplateStatus("Importing Library item...");

      const response = await fetch(builderApiUrl("/api/builder-templates"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          templateType: importedType,
          description: importedTemplate.description,
          sourcePage: importedTemplate.sourcePage,
          design: importedTemplate.design,
          sections: importedTemplate.sections,
        }),
      });

      if (!response.ok) {
        setTemplateStatus("Template import failed");
        return false;
      }

      const payload = (await response.json()) as {
        template?: BuilderSavedTemplate;
        templates?: BuilderSavedTemplate[];
      };
      setSavedTemplates(payload.templates ?? []);
      setTemplateStatus(`“${title}” added to Library`);
      return true;
    } catch {
      setTemplateStatus("Template import failed: invalid JSON");
      return false;
    }
  };

  const importYoothemePage = async (
    file: File,
    targetType?: LayoutLibraryType,
  ) => {
    const targetPage: BuilderLayoutKey =
      targetType === "header" || targetType === "footer"
        ? targetType
        : builderStateRef.current.page;
    setTemplateStatus("Preparing YOOtheme import preview...");
    setYoothemeImportWarnings([]);
    setYoothemeImportPreview(null);

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const mapping = mapYoothemeStaticContent(parsed);
      // Preview and apply must use the same tenant CMS origin. The pure
      // YOOtheme mapper may initially use its process-level fallback origin;
      // normalize here before any imported URL is shown or persisted.
      const tenantMappedSections = resolveBuilderMediaUrls(
        mapping.sections,
        wordpressMediaOrigin,
      );

      if (!mapping.sections.length && !Object.keys(mapping.globalStylePatch).length && !Object.keys(mapping.headerDocumentPatch).length) {
        setTemplateStatus("YOOtheme import failed: no supported sections");
        return;
      }

      setYoothemeImportPreview({
        fileName: file.name,
        targetPage,
        documentName: targetPage === "footer" || targetPage === "header"
          ? (targetPage === "footer" ? "Footer" : "Header")
          : undefined,
        sections: tenantMappedSections,
        // Keep the existing string[] preview contract, but derive it from the
        // canonical Phase 12 report rather than raw importer warning strings.
        warnings: mapping.reportWarnings,
        globalStylePatch: mapping.globalStylePatch,
        headerDocumentPatch: mapping.headerDocumentPatch,
      });
      setTemplateStatus("YOOtheme import preview ready");
    } catch {
      setTemplateStatus("YOOtheme import failed: invalid JSON");
    }
  };

  const cancelYoothemeImport = () => {
    setYoothemeImportPreview(null);
    setTemplateStatus("YOOtheme import cancelled");
  };

  const materializeImportedHeaderDocument = (
    currentHeaderState: BuilderState,
    patch: Partial<BuilderSection>,
  ): BuilderState => {
    const hasCanonicalComposition = Array.isArray(patch.rows) || Array.isArray(patch.layoutItems);
    const preset = patch.headerLayout && !hasCanonicalComposition
      ? headerPresets.find((candidate) => candidate.key === patch.headerLayout)
      : undefined;
    const baseSections = preset
      ? mergeBrandingIntoPreset(currentHeaderState.sections, preset.sections)
      : currentHeaderState.sections;
    return resolveBuilderMediaUrls({
      ...currentHeaderState,
      page: "header",
      targetType: "header",
      sections: baseSections.map((section, index) =>
        index === 0 || section.id === "header-document"
          ? { ...section, ...patch, headerArchitectureVersion: 2 }
          : section,
      ),
    }, wordpressMediaOrigin);
  };

  const importYoothemeLibraryItem = async (
    file: File,
    targetType: LayoutLibraryType,
    title: string,
  ) => {
    if (targetType === "element") {
      setTemplateStatus("Choose Layouts before importing YOOtheme JSON");
      return false;
    }

    setTemplateStatus("Mapping YOOtheme Library item...");

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const mapping = mapYoothemeStaticContent(parsed);
      let sections = resolveBuilderMediaUrls(mapping.sections, wordpressMediaOrigin);

      if (
        targetType === "header" &&
        sections.length === 0 &&
        Object.keys(mapping.headerDocumentPatch).length > 0
      ) {
        const currentHeaderState = builderStateRef.current.page === "header"
          ? builderStateRef.current
          : headerDocumentPreviewState ?? hydrateDocumentBuilderState(
              loadDraftForKey("header", storageKeys),
              shellSettings,
            );
        sections = materializeImportedHeaderDocument(
          currentHeaderState,
          mapping.headerDocumentPatch,
        ).sections;
      } else if (
        targetType === "header" &&
        sections[0] &&
        Object.keys(mapping.headerDocumentPatch).length > 0
      ) {
        sections = sections.map((section, index) =>
          index === 0 ? { ...section, ...mapping.headerDocumentPatch } : section,
        );
      }

      if (sections.length === 0) {
        setTemplateStatus("YOOtheme Library import failed: no reusable structure found");
        return false;
      }

      const savedTemplate = await persistTemplate({
        title,
        templateType: targetType,
        sections,
      });
      if (!savedTemplate) return false;
      setYoothemeImportWarnings(mapping.reportWarnings);
      setTemplateStatus(`“${title}” added to Library`);
      return true;
    } catch {
      setTemplateStatus("YOOtheme Library import failed: invalid JSON");
      return false;
    }
  };

  const applyYoothemeImport = () => {
    if (!yoothemeImportPreview) return;

    // A full YOOtheme site export can contain canonical Header/Navbar settings
    // without a page `layout` root. Apply Global Styles and the Header document
    // independently without replacing the current page with empty sections.
    if (!yoothemeImportPreview.sections.length) {
      if (Object.keys(yoothemeImportPreview.globalStylePatch).length) {
        updateShellSettings(yoothemeImportPreview.globalStylePatch);
      }
      if (Object.keys(yoothemeImportPreview.headerDocumentPatch).length) {
        const patch = yoothemeImportPreview.headerDocumentPatch;
        const currentHeaderState = builderStateRef.current.page === "header"
          ? builderStateRef.current
          : headerDocumentPreviewState ?? hydrateDocumentBuilderState(
          loadDraftForKey("header", storageKeys),
          shellSettings,
        );
        const nextHeaderState = materializeImportedHeaderDocument(currentHeaderState, patch);
        setHeaderDocumentPreviewState(nextHeaderState);
        if (builderStateRef.current.page === "header") setBuilderState(nextHeaderState);
        try {
          const drafts = JSON.parse(window.localStorage.getItem(storageKeys.drafts) ?? "{}") as Partial<Record<BuilderLayoutKey, BuilderState>>;
          drafts.header = nextHeaderState;
          window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));
        } catch {
          // The in-memory Header document remains authoritative for this session.
        }
        void fetch(builderApiUrl("/api/builder-layouts"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nextHeaderState),
        }).catch(() => {
          // Keep the imported document available locally if the API is offline.
        });
      }
      setYoothemeImportWarnings(yoothemeImportPreview.warnings);
      setTemplateStatus("YOOtheme Header/Navbar settings imported");
      setYoothemeImportPreview(null);
      return;
    }

    const targetState = yoothemeImportPreview.targetPage === "footer"
      ? footerDocumentPreviewState ?? hydrateDocumentBuilderState(
          loadDraftForKey("footer", storageKeys),
          shellSettings,
        )
      : yoothemeImportPreview.targetPage === "header"
        ? headerDocumentPreviewState ?? hydrateDocumentBuilderState(
            loadDraftForKey("header", storageKeys),
            shellSettings,
          )
        : builderStateRef.current;
    const importedState = {
      ...targetState,
      page: yoothemeImportPreview.targetPage,
      displayName: yoothemeImportPreview.documentName?.trim() || targetState.displayName,
      targetType:
        yoothemeImportPreview.targetPage === "header" ||
        yoothemeImportPreview.targetPage === "footer"
          ? yoothemeImportPreview.targetPage
          : targetState.targetType,
      // Import replaces the document layer, not just its sections. Keep
      // global values in BuilderShellSettings; do not carry over the previous
      // native WebPages page-design preset as an accidental local override.
      design: {},
      sections: resolveBuilderMediaUrls(
        yoothemeImportPreview.sections,
        wordpressMediaOrigin,
      ),
    };

    // Import is the authoritative document replacement boundary. Clear only
    // this page's stale local draft *before* setState can persist the imported
    // document into that old draft slot. Publish repeats this safely as a
    // fallback, but must not be the first invalidation opportunity.
    try {
      invalidateImportedBuilderDraft(window.localStorage, {
        draftsKey: storageKeys.drafts,
        stateKey: storageKeys.state,
        draftMetadataKey: storageKeys.draftMetadata,
        pageKey: importedState.page,
        importedState,
      });
      restoredDraftKeysRef.current.delete(importedState.page);
      delete draftMetadataRef.current[importedState.page];
    } catch {
      // The imported document can still be published if browser storage is
      // unavailable; do not convert a valid import into a failed operation.
    }

    pendingYoothemeDraftInvalidationRef.current = importedState.page;
    if (importedState.page === "header") {
      setHeaderDocumentPreviewState(importedState);
    } else if (importedState.page === "footer") {
      setFooterDocumentPreviewState(importedState);
    }
    if (builderStateRef.current.page === importedState.page) {
      setBuilderState(importedState);
    } else {
      try {
        const drafts = JSON.parse(window.localStorage.getItem(storageKeys.drafts) ?? "{}") as Partial<Record<BuilderLayoutKey, BuilderState>>;
        drafts[importedState.page] = importedState;
        window.localStorage.setItem(storageKeys.drafts, JSON.stringify(drafts));
      } catch {
        // The target document remains available in the in-memory preview state.
      }
    }
    if (Object.keys(yoothemeImportPreview.globalStylePatch).length) {
      updateShellSettings(yoothemeImportPreview.globalStylePatch);
    }
    if (Object.keys(yoothemeImportPreview.headerDocumentPatch).length) {
      const patch = yoothemeImportPreview.headerDocumentPatch;
      const currentHeaderState = builderStateRef.current.page === "header"
        ? builderStateRef.current
        : headerDocumentPreviewState ?? hydrateDocumentBuilderState(
        loadDraftForKey("header", storageKeys),
        shellSettings,
        );
      const nextHeaderState = materializeImportedHeaderDocument(currentHeaderState, patch);
      setHeaderDocumentPreviewState(nextHeaderState);
      if (builderStateRef.current.page === "header") setBuilderState(nextHeaderState);
      void fetch(builderApiUrl("/api/builder-layouts"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextHeaderState),
      }).catch(() => {
        // The page import itself remains valid if Header persistence is offline.
      });
    }
    setYoothemeImportWarnings(yoothemeImportPreview.warnings);
    suppressNextIframeSelectionScrollRef.current = true;
    setSelectedId(yoothemeImportPreview.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setFooterSelected(yoothemeImportPreview.targetPage === "footer");
    setHeaderSelected(yoothemeImportPreview.targetPage === "header");
    // Keep the document-level Library open after an import so the next
    // deliberate action can be naming/saving the imported Footer without
    // forcing the user through another Footer entry cycle.
    setInspectorTab(yoothemeImportPreview.targetPage === "footer" ? "settings" : "layout");
    setSectionSettingsOpen(true);
    setInspectorOpen(true);
    setSidebarCollapsed(false);
    setSidebarTab("builder");
    setTemplateStatus(
      yoothemeImportPreview.warnings.length
        ? `YOOtheme page imported with ${yoothemeImportPreview.warnings.length} compatibility warning${yoothemeImportPreview.warnings.length === 1 ? "" : "s"}`
        : "YOOtheme page imported",
    );
    setYoothemeImportPreview(null);
  };

  const deleteSavedTemplate = async (id: string) => {
    setTemplateStatus("Deleting template...");
    const response = await fetch(
      builderApiUrl("/api/builder-templates", { id }),
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      setTemplateStatus("Template delete failed");
      return;
    }

    const payload = (await response.json()) as {
      templates?: BuilderSavedTemplate[];
    };
    setSavedTemplates(payload.templates ?? []);
    setTemplateStatus("Template deleted");
  };

  const startSidebarResize = (clientX: number) => {
    const startX = clientX;
    const startWidth = sidebarWidth;
    setSidebarResizing(true);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const nextWidth = startWidth + moveEvent.clientX - startX;
      setSidebarWidth(Math.min(620, Math.max(300, nextWidth)));
    };

    const stopResize = () => {
      setSidebarResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResize);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResize);
  };

  const startInspectorResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (!inspectorResizeEnabled || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    inspectorResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: clampedInspectorWidth,
      currentWidth: clampedInspectorWidth,
      previousCursor: document.documentElement.style.cursor,
      previousUserSelect: document.body.style.userSelect,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    document.documentElement.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.dispatchEvent(new CustomEvent("builder:layout-transition-start"));
    setInspectorResizing(true);
  };

  const setInspectorModePreference = (mode: InspectorMode) => {
    setInspectorMode(mode);
    window.localStorage.setItem(INSPECTOR_MODE_STORAGE_KEY, mode);
    if (mode === "floating") {
      setInspectorFloatingRect((current) => {
        const next = clampInspectorFloatingRect({
          ...current,
          x: Math.max(
            INSPECTOR_VIEWPORT_GUTTER,
            window.innerWidth - current.width - 24,
          ),
          y: Math.max(72, current.y),
        });
        window.localStorage.setItem(
          INSPECTOR_FLOATING_RECT_STORAGE_KEY,
          JSON.stringify(next),
        );
        return next;
      });
    }
  };

  const startInspectorDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (
      effectiveInspectorMode !== "floating" ||
      event.button !== 0 ||
      (event.target instanceof Element &&
        event.target.closest("button, input, select, textarea"))
    ) {
      return;
    }
    event.preventDefault();
    inspectorDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: inspectorFloatingRect.x,
      originY: inspectorFloatingRect.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    document.documentElement.style.cursor = "grabbing";
    document.body.style.userSelect = "none";
    setInspectorDragging(true);
  };

  const moveInspectorDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const dragState = inspectorDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    event.preventDefault();
    setInspectorFloatingRect((current) =>
      clampInspectorFloatingRect({
        ...current,
        x: dragState.originX + event.clientX - dragState.startX,
        y: dragState.originY + event.clientY - dragState.startY,
      }),
    );
  };

  const stopInspectorDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const dragState = inspectorDragRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;
    window.localStorage.setItem(
      INSPECTOR_FLOATING_RECT_STORAGE_KEY,
      JSON.stringify(inspectorFloatingRect),
    );
    restoreInspectorResizeDocumentStyles();
    setInspectorDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const startInspectorFloatingResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    if (effectiveInspectorMode !== "floating" || event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    inspectorFloatingResizeRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: inspectorFloatingRect.width,
      startHeight: inspectorFloatingRect.height,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    document.documentElement.style.cursor = "nwse-resize";
    document.body.style.userSelect = "none";
    setInspectorResizing(true);
  };

  const moveInspectorFloatingResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const resizeState = inspectorFloatingResizeRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;
    event.preventDefault();
    setInspectorFloatingRect((current) =>
      clampInspectorFloatingRect({
        ...current,
        width: resizeState.startWidth + event.clientX - resizeState.startX,
        height: resizeState.startHeight + event.clientY - resizeState.startY,
      }),
    );
  };

  const stopInspectorFloatingResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const resizeState = inspectorFloatingResizeRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;
    window.localStorage.setItem(
      INSPECTOR_FLOATING_RECT_STORAGE_KEY,
      JSON.stringify(inspectorFloatingRect),
    );
    restoreInspectorResizeDocumentStyles();
    setInspectorResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const moveInspectorResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const resizeState = inspectorResizeRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;
    event.preventDefault();
    const nextWidth =
      resizeState.startWidth + resizeState.startX - event.clientX;
    const clampedWidth = Math.min(
      inspectorMaxWidth,
      Math.max(INSPECTOR_MIN_WIDTH, nextWidth),
    );
    resizeState.currentWidth = clampedWidth;
    setInspectorWidth(clampedWidth);
  };

  const stopInspectorResize = (
    event: ReactPointerEvent<HTMLDivElement>,
  ) => {
    const resizeState = inspectorResizeRef.current;
    if (!resizeState || resizeState.pointerId !== event.pointerId) return;
    const persistedWidth = resizeState.currentWidth;
    setInspectorWidth(persistedWidth);
    window.localStorage.setItem(
      INSPECTOR_WIDTH_STORAGE_KEY,
      String(Math.round(persistedWidth)),
    );
    restoreInspectorResizeDocumentStyles();
    window.dispatchEvent(new CustomEvent("builder:layout-transition-end"));
    setInspectorResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const resizeInspectorWithKeyboard = (
    event: ReactKeyboardEvent<HTMLDivElement>,
  ) => {
    if (!inspectorResizeEnabled) return;
    const step = event.shiftKey ? 40 : 10;
    let nextWidth: number | null = null;
    if (event.key === "ArrowLeft") nextWidth = clampedInspectorWidth + step;
    if (event.key === "ArrowRight") nextWidth = clampedInspectorWidth - step;
    if (event.key === "Home") nextWidth = INSPECTOR_MIN_WIDTH;
    if (event.key === "End") nextWidth = inspectorMaxWidth;
    if (nextWidth === null) return;
    event.preventDefault();
    const clampedWidth = Math.min(
      inspectorMaxWidth,
      Math.max(INSPECTOR_MIN_WIDTH, nextWidth),
    );
    setInspectorWidth(clampedWidth);
    window.localStorage.setItem(
      INSPECTOR_WIDTH_STORAGE_KEY,
      String(Math.round(clampedWidth)),
    );
  };

  const inspectorPanel = (
    <DynamicContentCapabilitiesProvider discovered={discoveredDynamicContentCapabilities}>
      <DashboardInspector
      hasSections={builderState.sections.length > 0}
      builderJson={builderJson}
      copied={copied}
      elementBackgroundPresets={elementBackgroundPresets}
      getLayoutItemBlocks={getLayoutItemBlocks}
      inspectorOpen={inspectorOpen}
      inspectorTab={inspectorTab}
      contentFallbackActive={isUsingPrimaryFallback(
        selectedLayoutBlock ?? rawSelectedSection,
        contentLanguage,
        primaryContentLanguage,
      )}
      activeContentLanguage={contentLanguage}
      spacingFocusRequest={spacingFocusRequest}
      spacingOverlayEnabled={spacingOverlayEnabled}
      layoutBlockLabels={layoutBlockLabels}
      openLayoutItemId={openLayoutItemId}
      openSlideId={openSlideId}
      previewCategoryTree={previewCategoryTree}
      sectionBackgroundPresets={sectionBackgroundPresets}
      sectionColorModeLabel={(sec) => sectionColorModeLabel(sec, layoutScheme)}
      sectionLabels={sectionLabels}
      sectionSettingsOpen={sectionSettingsOpen}
      selectedLayoutColumnKey={selectedLayoutColumnKey}
      selectedLayoutRowIndex={selectedLayoutRowIndex}
      selectedLayoutBlock={selectedLayoutBlockForInspector}
      selectedLayoutBlockKey={selectedLayoutBlockKey}
      selectedSection={selectedSection}
      headerDocumentRoot={builderState.page === "header"}
      footerDocumentRoot={footerSelected}
      anchorIdEntries={composedAnchorIdEntries}
      selectedSectionIsFirstVisible={selectedSectionIsFirstVisible}
      shellSettings={shellSettings}
      updateShellSettings={updateShellSettings}
      uploadingNestedSlide={uploadingNestedSlide}
      uploadingSlide={uploadingSlide}
      addSelectedLayoutBlockBadge={addSelectedLayoutBlockBadge}
      addSelectedLayoutBlockGridItem={addSelectedLayoutBlockGridItem}
      addSelectedLayoutBlockButton={addSelectedLayoutBlockButton}
      addSelectedLayoutBlockSlide={addSelectedLayoutBlockSlide}
      addSelectedSlide={addSelectedSlide}
      copyJson={copyJson}
      deleteSelected={deleteSelected}
      deleteSelectedLayoutBlock={deleteSelectedLayoutBlock}
      deleteSelectedLayoutBlockBadge={deleteSelectedLayoutBlockBadge}
      deleteSelectedLayoutBlockButton={deleteSelectedLayoutBlockButton}
      deleteSelectedLayoutBlockGridItem={deleteSelectedLayoutBlockGridItem}
      deleteSelectedLayoutBlockSlide={deleteSelectedLayoutBlockSlide}
      deleteSelectedSlide={deleteSelectedSlide}
      duplicateSelected={duplicateSelected}
      duplicateSelectedRow={duplicateSelectedRow}
      onApplyHeaderPreset={executeApplyHeaderPreset}
      applySelectedRowLayoutPreset={applySelectedRowLayoutPreset}
      onUpdateRowStyle={updateSelectedRowStyle}
      onUpdateColumnStyle={updateSelectedColumnStyle}
      deleteSelectedRow={deleteSelectedRow}
      moveSelected={moveSelected}
      openWordPressMediaPicker={openWordPressMediaPicker}
      onCloseInspector={() => setInspectorOpen(false)}
      setInspectorTab={setInspectorTab}
      setSpacingOverlayEnabled={setSpacingOverlayEnabled}
      setOpenSlideId={setOpenSlideId}
      setSectionSettingsOpen={setSectionSettingsOpen}
      setSelectedLayoutBlockKey={setSelectedLayoutBlockKey}
      setSelectedLayoutColumnKey={setSelectedLayoutColumnKey}
      setSelectedLayoutRowIndex={setSelectedLayoutRowIndex}
      updateSelected={updateSelected}
      updateSelectedBadge={updateSelectedBadge}
      updateSelectedLayoutBlock={updateSelectedLayoutBlock}
      updateLayoutBlockByKey={updateLayoutBlockByKey}
      updateSelectedLayoutBlockButton={updateSelectedLayoutBlockButton}
      updateSelectedLayoutBlockBadge={updateSelectedLayoutBlockBadge}
      updateSelectedLayoutBlockGridItem={updateSelectedLayoutBlockGridItem}
      updateSelectedLayoutBlockSlide={updateSelectedLayoutBlockSlide}
      updateSelectedSlide={updateSelectedSlide}
      onOpenGlobalSpacingSettings={
        canEditShellSettings
          ? (scope) => {
              setSidebarTab("globalStyles");
              setGlobalStylesTab("spacing");
              setGlobalSpacingFocus(scope);
            }
          : undefined
      }
      onOpenGlobalTypographySettings={
        canEditShellSettings
          ? () => {
              setSidebarTab("globalStyles");
              setGlobalStylesTab("typography");
            }
          : undefined
      }
      uploadSelectedLayoutBlockSlideImage={uploadSelectedLayoutBlockSlideImage}
      uploadSelectedSlideImage={uploadSelectedSlideImage}
      />
    </DynamicContentCapabilitiesProvider>
  );

  const activeDocumentKindLabel = builderState.page === "footer"
    ? "Footer"
    : builderState.page === "header"
      ? "Header"
      : builderDocumentKindLabel(builderEditorContext);

  const wireframeActions = useStableCallbackObject<BuilderWireframeActions>({
    addSection: (targetSectionId, placement) =>
      addWireframeNear(
        1,
        1,
        targetSectionId ?? "__empty-page__",
        placement,
        undefined,
        "section",
      ),
    addRow: (sectionId, rowIndex, placement, presetKey) => addRowNear(sectionId, rowIndex, placement, presetKey),
    addColumnAfter: addSelectedLayoutItem,
    deleteColumn: deleteStructureColumn,
    openElements: openElementsPanel,
    selectSection: (sectionId) => selectSection(sectionId, true),
    selectRow: (sectionId, rowIndex) => selectLayoutRow(sectionId, rowIndex, true),
    selectColumn: (sectionId, columnKey) => selectLayoutColumn(sectionId, columnKey, true),
    selectBlock: (sectionId, columnKey, blockKey) => selectLayoutBlock(sectionId, columnKey, blockKey, true),
    hover: handleHoverTarget,
    renameSection: renameBuilderSection,
    renameComplete: () => setRenameSectionRequestId(null),
    moveSection,
    duplicateSection,
    deleteSection,
    moveRow: moveLayoutRow,
    duplicateRow: duplicateLayoutRow,
    deleteRow: deleteEmptyRow,
    moveBlock: moveLayoutBlockWithinColumn,
    duplicateBlock: duplicateLayoutBlock,
    deleteBlock: deleteLayoutBlock,
  });

  const builderWireframePanel = (
    <BuilderWireframePanel
      page={builderState.page}
      pageLabel={builderEditorContext?.document.displayName ?? getLayoutLabel(builderState.page, customPages)}
      documentKindLabel={activeDocumentKindLabel}
      documentBadgeLabel={activeDocumentKindLabel}
      structureLabel={`${activeDocumentKindLabel} structure`}
      structureAriaLabel={`${activeDocumentKindLabel} structure`}
      sections={builderState.sections}
      selectedSectionId={elementLibraryOpen ? elementLibraryTarget?.sectionId ?? selectedId : selectedId}
      selectedLayoutRowIndex={elementLibraryOpen && elementLibraryTarget ? null : selectedLayoutRowIndex}
      selectedLayoutColumnKey={elementLibraryOpen ? elementLibraryTarget?.columnKey ?? selectedLayoutColumnKey : selectedLayoutColumnKey}
      selectedLayoutBlockKey={elementLibraryOpen && elementLibraryTarget ? null : selectedLayoutBlockKey}
      hoveredTarget={hoveredBuilderTarget}
      actions={wireframeActions}
      renameSectionId={renameSectionRequestId}
      onOpenLibrary={() => openContextualLibrary()}
    />
  );

  const legacyGlobalStylesPanel = (
    <div className="builder-sidebar-panel builder-sidebar-global-styles">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>{shellSettingsLabel}</strong>
          <span>
            {isWebsiteScopedBuilder
              ? "Shared colors, typography, spacing, buttons, radius, shadows, and card styles for this website."
              : "Shared colors, typography, spacing, buttons, radius, shadows, and card styles for the public WebPages website."}
          </span>
        </div>
      </div>
      <div
        className="builder-global-style-tabs"
        aria-label={`${shellSettingsLabel} sections`}
      >
        {(
          [
            ["presets", "Presets"],
            ["siteDesign", "Site Design"],
            ["semantic", "Global Style Editor"],
            ["spacing", "Spacing"],
            ["cards", "Cards"],
            ["buttons", "Buttons"],
            ["typography", "Typography"],
            ["import", "Import LESS"],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            className={globalStylesTab === tab ? "is-active" : ""}
            onClick={() => setGlobalStylesTab(tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {globalStylesTab === "presets" && (
        <div className="builder-global-styles-group">
          <div className="builder-card-title">
            <strong>Style Presets</strong>
            <span>apply a complete visual system</span>
          </div>

          <div className="builder-global-preset-grid">
            {GLOBAL_STYLE_PRESETS.map((preset) => (
              <article className="builder-global-preset-card" key={preset.id}>
                <img
                  src={preset.previewImage}
                  alt={`${preset.name} style preview`}
                  className="builder-global-preset-preview"
                />
                <div className="builder-global-preset-card-body">
                  <div>
                    <strong>{preset.name}</strong>
                    <p>{preset.description}</p>
                  </div>
                  <div
                    className="builder-global-preset-palette"
                    aria-label={`${preset.name} color palette`}
                  >
                    {preset.palette.map((color) => (
                      <span
                        key={color}
                        style={{ background: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    className="builder-global-preset-apply"
                    onClick={() => applyGlobalStylePreset(preset)}
                  >
                    <Sparkles size={14} />
                    Apply
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {globalStylesTab === "import" && (
        <YoothemeImportPanel
          design={builderState.design}
          shellSettings={shellSettings}
          updateDesign={updateDesign}
          updateShellSettings={updateShellSettings}
        />
      )}

      {globalStylesTab === "semantic" && (
        <div className="builder-import-readonly">
          <strong>Canonical editor</strong>
          <span>This legacy tab is retired. Use the Global Styles editor navigation.</span>
        </div>
      )}

      {globalStylesTab === "siteDesign" && (
        <div className="builder-global-styles-group">
          <div className="builder-card-title">
            <strong>Site Design</strong>
            <span>{builderState.design.preset ?? "custom"}</span>
          </div>

          <label className="builder-field">
            <span>Design Preset</span>
            <select
              value={builderState.design.preset ?? "princity"}
              onChange={(event) =>
                applyDesignPreset(
                  event.target.value as NonNullable<BuilderDesign["preset"]>,
                )
              }
            >
              <option value="princity">Princity clean</option>
              <option value="editorial">Editorial warm</option>
              <option value="contrast">Dark contrast</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Website Color Mode</span>
            <select
              value={builderState.design.colorScheme ?? "auto"}
              onChange={(event) =>
                updateDesign({
                  colorScheme: event.target.value as BuilderColorScheme,
                  preset: undefined,
                })
              }
            >
              <option value="auto">Follow visitor switch</option>
              <option value="light">Force light</option>
              <option value="dark">Force dark</option>
            </select>
          </label>

          <div className="builder-design-grid">
            {[
              ["pageBackground", "Page"],
              ["textColor", "Text"],
              ["mutedTextColor", "Muted"],
              ["accentColor", "Accent"],
              ["surfaceColor", "Surface"],
              ["buttonBackground", "Button"],
            ].map(([key, label]) => (
              <label key={key} className="builder-swatch-field">
                <span>{label}</span>
                <input
                  type="color"
                  value={
                    (builderState.design[
                      key as keyof BuilderDesign
                    ] as string) ?? "#ffffff"
                  }
                  onChange={(event) =>
                    updateDesign({
                      [key]: event.target.value,
                      preset: undefined,
                    } as Partial<BuilderDesign>)
                  }
                />
              </label>
            ))}
          </div>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Radius</span>
              <select
                value={builderState.design.radius ?? "8px"}
                onChange={(event) =>
                  updateDesign({
                    radius: event.target.value,
                    preset: undefined,
                  })
                }
              >
                <option value="0px">Flat</option>
                <option value="4px">Small</option>
                <option value="8px">Medium</option>
                <option value="16px">Large</option>
                <option value="999px">Pill</option>
              </select>
            </label>

            <label className="builder-field">
              <span>Gutter</span>
              <select
                value={builderState.design.sectionGutter ?? "48px"}
                onChange={(event) =>
                  updateDesign({
                    sectionGutter: event.target.value,
                    preset: undefined,
                  })
                }
              >
                <option value="28px">Tight</option>
                <option value="48px">Medium</option>
                <option value="72px">Wide</option>
              </select>
            </label>
          </div>

          <div className="builder-card-title">
            <strong>Storefront Styling</strong>
            <span>global styling + colors</span>
          </div>

          <label className="builder-field">
            <span>Storefront Style Preset</span>
            <select
              value={shellSettings.storefrontPreset}
              onChange={(event) =>
                updateShellSettings({
                  storefrontPreset: event.target.value,
                })
              }
            >
              <option value="minimal">
                Minimal (Dark gray, round buttons)
              </option>
              <option value="soft">
                Soft (Sage tones, medium round buttons)
              </option>
              <option value="elevated">
                Elevated (Slate tones, large card shadows)
              </option>
              <option value="boutique">
                Boutique (Red accents, square buttons)
              </option>
              <option value="princity">
                Princity (Pure white, bold borders)
              </option>
            </select>
          </label>

          <div className="builder-design-grid">
            <label className="builder-swatch-field">
              <span>Primary Color</span>
              <input
                type="color"
                value={shellSettings.primaryColor || "#111111"}
                onChange={(event) =>
                  updateShellSettings({
                    primaryColor: event.target.value,
                  })
                }
              />
            </label>

            <label className="builder-swatch-field">
              <span>Accent Color</span>
              <input
                type="color"
                value={shellSettings.accentColor || "#111111"}
                onChange={(event) =>
                  updateShellSettings({
                    accentColor: event.target.value,
                  })
                }
              />
            </label>
          </div>
        </div>
      )}

      {globalStylesTab === "spacing" && (
        <div className="builder-global-styles-group builder-global-spacing-tab">
          <div className="builder-shell-note">
            <strong>Spacing Defaults</strong>
            <span>
              Sections, rows, and elements inherit these defaults until spacing
              is overridden locally.
            </span>
          </div>

          <section
            id="global-spacing-section"
            className="builder-global-spacing-group"
            tabIndex={-1}
          >
            <div className="builder-card-title">
              <strong>Section Spacing</strong>
              <span>default padding + margin</span>
            </div>
            <GlobalSpacingControl
              label="Padding"
              sides={["top", "bottom"]}
              values={{
                top: shellSettings.sectionPaddingTop,
                bottom: shellSettings.sectionPaddingBottom,
              }}
              context="sectionPadding"
              onChange={(newVals) => {
                updateShellSettings({
                  sectionPaddingTop:
                    newVals.top !== undefined
                      ? newVals.top
                      : shellSettings.sectionPaddingTop,
                  sectionPaddingBottom:
                    newVals.bottom !== undefined
                      ? newVals.bottom
                      : shellSettings.sectionPaddingBottom,
                });
              }}
            />
            <GlobalSpacingControl
              label="Margin"
              sides={["top", "bottom"]}
              values={{
                top: shellSettings.sectionMarginTop,
                bottom: shellSettings.sectionMarginBottom,
              }}
              context="sectionMargin"
              onChange={(newVals) => {
                updateShellSettings({
                  sectionMarginTop:
                    newVals.top !== undefined
                      ? newVals.top
                      : shellSettings.sectionMarginTop,
                  sectionMarginBottom:
                    newVals.bottom !== undefined
                      ? newVals.bottom
                      : shellSettings.sectionMarginBottom,
                });
              }}
            />
          </section>

          <section
            id="global-spacing-row"
            className="builder-global-spacing-group"
            tabIndex={-1}
          >
            <div className="builder-card-title">
              <strong>Row Spacing</strong>
              <span>default padding, margin + gap</span>
            </div>
            <GlobalSpacingControl
              label="Padding"
              sides={["top", "bottom"]}
              values={{
                top: shellSettings.rowPaddingTop,
                bottom: shellSettings.rowPaddingBottom,
              }}
              context="rowPadding"
              onChange={(newVals) => {
                updateShellSettings({
                  rowPaddingTop:
                    newVals.top !== undefined
                      ? newVals.top
                      : shellSettings.rowPaddingTop,
                  rowPaddingBottom:
                    newVals.bottom !== undefined
                      ? newVals.bottom
                      : shellSettings.rowPaddingBottom,
                });
              }}
            />
            <GlobalSpacingControl
              label="Margin"
              sides={["top", "bottom"]}
              values={{
                top: shellSettings.rowMarginTop,
                bottom: shellSettings.rowMarginBottom,
              }}
              context="rowMargin"
              onChange={(newVals) => {
                updateShellSettings({
                  rowMarginTop:
                    newVals.top !== undefined
                      ? newVals.top
                      : shellSettings.rowMarginTop,
                  rowMarginBottom:
                    newVals.bottom !== undefined
                      ? newVals.bottom
                      : shellSettings.rowMarginBottom,
                });
              }}
            />
            <GlobalSpacingControl
              label="Gap Between Rows"
              sides={["gap"]}
              values={{
                gap: shellSettings.rowGap,
              }}
              context="rowGap"
              onChange={(newVals) => {
                updateShellSettings({
                  rowGap: newVals.gap,
                });
              }}
            />
            <GlobalSpacingControl
              label="Gap Between Columns"
              sides={["gap"]}
              values={{ gap: shellSettings.columnGap }}
              context="columnGap"
              onChange={(newVals) => {
                updateShellSettings({ columnGap: newVals.gap });
              }}
            />
          </section>

          <section
            id="global-spacing-element"
            className="builder-global-spacing-group"
            tabIndex={-1}
          >
            <div className="builder-card-title">
              <strong>Element Spacing</strong>
              <span>default padding + margin on every side</span>
            </div>
            <GlobalSpacingControl
              label="Padding"
              sides={["top", "right", "bottom", "left"]}
              values={{
                top: shellSettings.elementPaddingTop,
                right: shellSettings.elementPaddingRight,
                bottom: shellSettings.elementPaddingBottom,
                left: shellSettings.elementPaddingLeft,
              }}
              context="elementPadding"
              onChange={(newVals) => {
                updateShellSettings({
                  elementPaddingTop:
                    newVals.top !== undefined
                      ? newVals.top
                      : shellSettings.elementPaddingTop,
                  elementPaddingRight:
                    newVals.right !== undefined
                      ? newVals.right
                      : shellSettings.elementPaddingRight,
                  elementPaddingBottom:
                    newVals.bottom !== undefined
                      ? newVals.bottom
                      : shellSettings.elementPaddingBottom,
                  elementPaddingLeft:
                    newVals.left !== undefined
                      ? newVals.left
                      : shellSettings.elementPaddingLeft,
                });
              }}
            />
            <GlobalSpacingControl
              label="Margin"
              sides={["top", "right", "bottom", "left"]}
              values={{
                top: shellSettings.elementMarginTop,
                right: shellSettings.elementMarginRight,
                bottom: shellSettings.elementMarginBottom,
                left: shellSettings.elementMarginLeft,
              }}
              context="elementMargin"
              onChange={(newVals) => {
                updateShellSettings({
                  elementMarginTop:
                    newVals.top !== undefined
                      ? newVals.top
                      : shellSettings.elementMarginTop,
                  elementMarginRight:
                    newVals.right !== undefined
                      ? newVals.right
                      : shellSettings.elementMarginRight,
                  elementMarginBottom:
                    newVals.bottom !== undefined
                      ? newVals.bottom
                      : shellSettings.elementMarginBottom,
                  elementMarginLeft:
                    newVals.left !== undefined
                      ? newVals.left
                      : shellSettings.elementMarginLeft,
                });
              }}
            />
          </section>
        </div>
      )}

      {globalStylesTab === "cards" && (
        <div className="builder-global-styles-group">
          <div className="builder-card-title">
            <strong>Product Card Design</strong>
            <span>Style, colors, and shadows</span>
          </div>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Card Background</span>
              <input
                type="color"
                value={shellSettings.productCardBg || "#ffffff"}
                onChange={(event) =>
                  updateShellSettings({
                    productCardBg: event.target.value,
                  })
                }
              />
            </label>

            <label className="builder-field">
              <span>Card Radius</span>
              <select
                value={
                  ["0px", "4px", "8px", "12px", "16px", "24px"].includes(
                    shellSettings.productCardRadius,
                  )
                    ? shellSettings.productCardRadius
                    : "custom"
                }
                onChange={(event) => {
                  const val = event.target.value;
                  if (val === "custom") {
                    updateShellSettings({ productCardRadius: "10px" });
                  } else {
                    updateShellSettings({ productCardRadius: val });
                  }
                }}
              >
                <option value="0px">Flat (0px)</option>
                <option value="4px">Small (4px)</option>
                <option value="8px">Medium (8px)</option>
                <option value="12px">Rounded (12px)</option>
                <option value="16px">Large (16px)</option>
                <option value="24px">Extra Large (24px)</option>
                <option value="custom">Custom...</option>
              </select>
            </label>
          </div>

          {!["0px", "4px", "8px", "12px", "16px", "24px"].includes(
            shellSettings.productCardRadius,
          ) && (
            <label className="builder-field">
              <span>Custom Card Radius (px/rem)</span>
              <input
                type="text"
                value={shellSettings.productCardRadius}
                onChange={(event) =>
                  updateShellSettings({
                    productCardRadius: event.target.value,
                  })
                }
              />
            </label>
          )}

          <label className="builder-field">
            <span>Card Shadow</span>
            <select
              value={
                shellSettings.productCardShadow || "0 0 0 rgba(15, 23, 42, 0)"
              }
              onChange={(event) =>
                updateShellSettings({
                  productCardShadow: event.target.value,
                })
              }
            >
              <option value="0 0 0 rgba(15, 23, 42, 0)">None</option>
              <option value="0 4px 12px rgba(15, 23, 42, 0.05)">
                Subtle (0 4px 12px)
              </option>
              <option value="0 8px 24px rgba(15, 23, 42, 0.06)">
                Soft (0 8px 24px)
              </option>
              <option value="0 12px 30px rgba(15, 23, 42, 0.08)">
                Medium (0 12px 30px)
              </option>
              <option value="0 18px 42px rgba(15, 23, 42, 0.12)">
                Strong (0 18px 42px)
              </option>
            </select>
          </label>

          <label className="builder-field">
            <span>Card Hover Shadow</span>
            <select
              value={
                shellSettings.productCardShadowHover ||
                "0 18px 40px rgba(15, 23, 42, 0.14)"
              }
              onChange={(event) =>
                updateShellSettings({
                  productCardShadowHover: event.target.value,
                })
              }
            >
              <option value="0 0 0 rgba(15, 23, 42, 0)">None</option>
              <option value="0 12px 24px rgba(15, 23, 42, 0.08)">
                Soft (0 12px 24px)
              </option>
              <option value="0 18px 40px rgba(15, 23, 42, 0.14)">
                Medium (0 18px 40px)
              </option>
              <option value="0 24px 54px rgba(15, 23, 42, 0.18)">
                Strong (0 24px 54px)
              </option>
            </select>
          </label>

          <div className="builder-card-title">
            <strong>Card Sizing</strong>
            <span>Width and height constraints</span>
          </div>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Card Min Height</span>
              <input
                type="text"
                value={shellSettings.productCardMinHeight}
                onChange={(event) =>
                  updateShellSettings({
                    productCardMinHeight: event.target.value,
                  })
                }
                placeholder="e.g. 0px, 320px"
              />
            </label>

            <label className="builder-field">
              <span>Card Max Width</span>
              <input
                type="text"
                value={shellSettings.productCardMaxWidth}
                onChange={(event) =>
                  updateShellSettings({
                    productCardMaxWidth: event.target.value,
                  })
                }
                placeholder="e.g. 100%, 300px"
              />
            </label>
          </div>

          <div className="builder-card-title">
            <strong>Product Image Settings</strong>
            <span>Image sizing and fit</span>
          </div>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Image Width</span>
              <input
                type="text"
                value={shellSettings.productImageWidth}
                onChange={(event) =>
                  updateShellSettings({
                    productImageWidth: event.target.value,
                  })
                }
                placeholder="e.g. 100%"
              />
            </label>

            <label className="builder-field">
              <span>Image Height</span>
              <input
                type="text"
                value={shellSettings.productImageHeight}
                onChange={(event) =>
                  updateShellSettings({
                    productImageHeight: event.target.value,
                  })
                }
                placeholder="e.g. 260px"
              />
            </label>
          </div>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Image Max Width</span>
              <input
                type="text"
                value={shellSettings.productImageMaxWidth}
                onChange={(event) =>
                  updateShellSettings({
                    productImageMaxWidth: event.target.value,
                  })
                }
                placeholder="e.g. 100%"
              />
            </label>

            <label className="builder-field">
              <span>Image Max Height</span>
              <input
                type="text"
                value={shellSettings.productImageMaxHeight}
                onChange={(event) =>
                  updateShellSettings({
                    productImageMaxHeight: event.target.value,
                  })
                }
                placeholder="e.g. 100%"
              />
            </label>
          </div>

          <label className="builder-field">
            <span>Image Aspect Ratio</span>
            <select
              value={
                ["auto", "1 / 1", "4 / 3", "16 / 9", "3 / 2"].includes(
                  shellSettings.productImageAspectRatio,
                )
                  ? shellSettings.productImageAspectRatio
                  : "custom"
              }
              onChange={(event) => {
                const val = event.target.value;
                if (val === "custom") {
                  updateShellSettings({ productImageAspectRatio: "4 / 5" });
                } else {
                  updateShellSettings({ productImageAspectRatio: val });
                }
              }}
            >
              <option value="auto">Auto (from file)</option>
              <option value="1 / 1">Square (1:1)</option>
              <option value="4 / 3">Standard (4:3)</option>
              <option value="16 / 9">Widescreen (16:9)</option>
              <option value="3 / 2">Classic (3:2)</option>
              <option value="custom">Custom...</option>
            </select>
          </label>

          {!["auto", "1 / 1", "4 / 3", "16 / 9", "3 / 2"].includes(
            shellSettings.productImageAspectRatio,
          ) && (
            <label className="builder-field">
              <span>Custom Aspect Ratio (e.g. 4/5)</span>
              <input
                type="text"
                value={shellSettings.productImageAspectRatio}
                onChange={(event) =>
                  updateShellSettings({
                    productImageAspectRatio: event.target.value,
                  })
                }
              />
            </label>
          )}

          <label className="builder-field">
            <span>Image Object Fit</span>
            <select
              value={shellSettings.productImageObjectFit}
              onChange={(event) =>
                updateShellSettings({
                  productImageObjectFit: event.target.value,
                })
              }
            >
              <option value="contain">Contain (shrink to fit)</option>
              <option value="cover">Cover (fill & crop)</option>
              <option value="fill">Fill (stretch to fit)</option>
              <option value="none">None (original size)</option>
              <option value="scale-down">Scale Down</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Image Padding</span>
            <select
              value={
                [
                  "0px",
                  "clamp(6px, 1vw, 14px)",
                  "clamp(14px, 1.5vw, 22px)",
                  "clamp(22px, 2.4vw, 36px)",
                  "clamp(28px, 4vw, 48px)",
                ].includes(shellSettings.productImagePadding)
                  ? shellSettings.productImagePadding
                  : "custom"
              }
              onChange={(event) => {
                const val = event.target.value;
                if (val === "custom") {
                  updateShellSettings({
                    productImagePadding: "20px",
                    productImageNoPadding: false,
                  });
                } else {
                  updateShellSettings({
                    productImagePadding: val,
                    productImageNoPadding: val === "0px",
                  });
                }
              }}
            >
              <option value="0px">None (0px)</option>
              <option value="clamp(6px, 1vw, 14px)">
                Tight (Tight padding)
              </option>
              <option value="clamp(14px, 1.5vw, 22px)">
                Compact (Compact padding)
              </option>
              <option value="clamp(22px, 2.4vw, 36px)">
                Medium (Medium padding)
              </option>
              <option value="clamp(28px, 4vw, 48px)">
                Large (Large padding)
              </option>
              <option value="custom">Custom...</option>
            </select>
          </label>

          {![
            "0px",
            "clamp(6px, 1vw, 14px)",
            "clamp(14px, 1.5vw, 22px)",
            "clamp(22px, 2.4vw, 36px)",
            "clamp(28px, 4vw, 48px)",
          ].includes(shellSettings.productImagePadding) && (
            <label className="builder-field">
              <span>Custom Image Padding (e.g. 10px)</span>
              <input
                type="text"
                value={shellSettings.productImagePadding}
                onChange={(event) =>
                  updateShellSettings({
                    productImagePadding: event.target.value,
                    productImageNoPadding: event.target.value.trim() === "0px",
                  })
                }
              />
            </label>
          )}

          <label className="builder-check">
            <input
              type="checkbox"
              checked={shellSettings.productImageNoPadding}
              onChange={(event) =>
                updateShellSettings({
                  productImageNoPadding: event.target.checked,
                  productImagePadding: event.target.checked
                    ? "0px"
                    : "clamp(22px, 2.4vw, 36px)",
                })
              }
            />
            <span>Disable image padding completely</span>
          </label>
        </div>
      )}

      {globalStylesTab === "buttons" && (
        <div className="builder-global-styles-group">
          <div className="builder-card-title">
            <strong>Button Preset</strong>
            <span>applies to inherited element buttons</span>
          </div>
          <div className="builder-header-presets-grid">
            {BUILDER_BUTTON_PRESETS.map((preset) => {
              const activePreset = getBuilderButtonPresetKey(shellSettings);
              return (
                <button
                  key={preset.key}
                  type="button"
                  className={`builder-preset-btn${activePreset === preset.key ? " is-active" : ""}`}
                  onClick={() =>
                    updateShellSettings(builderButtonPresetFields(preset.key))
                  }
                >
                  <span>{preset.label}</span>
                  <small>{preset.description}</small>
                </button>
              );
            })}
          </div>
          <div className="builder-button-preview-row">
            <span
              className="builder-preview-cta builder-preview-cta--primary"
              style={builderButtonCssVars(shellSettings)}
            >
              Button preview
            </span>
          </div>

          <details className="builder-collapse">
            <summary>
              <span>Fine tune button style</span>
              <small>optional custom values</small>
            </summary>
            <div className="builder-card-title">
              <strong>Button Core Style</strong>
              <span>colors + borders</span>
            </div>

            <div className="builder-two-column">
              <label className="builder-field">
                <span>Background</span>
                <input
                  type="color"
                  value={buttonColorInputValue(
                    shellSettings.buttonBg,
                    "#111111",
                  )}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonBg: event.target.value,
                    })
                  }
                />
              </label>

              <label className="builder-field">
                <span>Text Color</span>
                <input
                  type="color"
                  value={buttonColorInputValue(
                    shellSettings.buttonTextColor,
                    "#ffffff",
                  )}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonTextColor: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="builder-two-column">
              <label className="builder-field">
                <span>Border Radius</span>
                <select
                  value={
                    ["0px", "4px", "8px", "12px", "16px", "999px"].includes(
                      shellSettings.buttonBorderRadius,
                    )
                      ? shellSettings.buttonBorderRadius
                      : "custom"
                  }
                  onChange={(event) => {
                    const val = event.target.value;
                    if (val === "custom") {
                      updateShellSettings({ buttonBorderRadius: "10px" });
                    } else {
                      updateShellSettings({ buttonBorderRadius: val });
                    }
                  }}
                >
                  <option value="0px">Flat (0px)</option>
                  <option value="4px">Small (4px)</option>
                  <option value="8px">Medium (8px)</option>
                  <option value="12px">Rounded (12px)</option>
                  <option value="16px">Large (16px)</option>
                  <option value="999px">Pill (999px)</option>
                  <option value="custom">Custom...</option>
                </select>
              </label>

              <label className="builder-field">
                <span>Border Width</span>
                <select
                  value={
                    ["0px", "1px", "2px", "3px", "4px"].includes(
                      shellSettings.buttonBorderWidth,
                    )
                      ? shellSettings.buttonBorderWidth
                      : "custom"
                  }
                  onChange={(event) => {
                    const val = event.target.value;
                    if (val === "custom") {
                      updateShellSettings({ buttonBorderWidth: "1.5px" });
                    } else {
                      updateShellSettings({ buttonBorderWidth: val });
                    }
                  }}
                >
                  <option value="0px">None (0px)</option>
                  <option value="1px">Thin (1px)</option>
                  <option value="2px">Medium (2px)</option>
                  <option value="3px">Thick (3px)</option>
                  <option value="custom">Custom...</option>
                </select>
              </label>
            </div>

            {!["0px", "4px", "8px", "12px", "16px", "999px"].includes(
              shellSettings.buttonBorderRadius,
            ) && (
              <label className="builder-field">
                <span>Custom Border Radius (px/rem)</span>
                <input
                  type="text"
                  value={shellSettings.buttonBorderRadius}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonBorderRadius: event.target.value,
                    })
                  }
                />
              </label>
            )}

            {!["0px", "1px", "2px", "3px", "4px"].includes(
              shellSettings.buttonBorderWidth,
            ) && (
              <label className="builder-field">
                <span>Custom Border Width (px/rem)</span>
                <input
                  type="text"
                  value={shellSettings.buttonBorderWidth}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonBorderWidth: event.target.value,
                    })
                  }
                />
              </label>
            )}

            <label className="builder-field">
              <span>Border Color</span>
              <input
                type="color"
                value={buttonColorInputValue(
                  shellSettings.buttonBorderColor,
                  "#111111",
                )}
                onChange={(event) =>
                  updateShellSettings({
                    buttonBorderColor: event.target.value,
                  })
                }
              />
            </label>

            <div className="builder-card-title">
              <strong>Sizing & Spacing</strong>
              <span>paddings + text options</span>
            </div>

            <div className="builder-two-column">
              <label className="builder-field">
                <span>Padding Y (vertical)</span>
                <input
                  type="text"
                  value={shellSettings.buttonPaddingY}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonPaddingY: event.target.value,
                    })
                  }
                  placeholder="e.g. 11px"
                />
              </label>

              <label className="builder-field">
                <span>Padding X (horizontal)</span>
                <input
                  type="text"
                  value={shellSettings.buttonPaddingX}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonPaddingX: event.target.value,
                    })
                  }
                  placeholder="e.g. 18px"
                />
              </label>
            </div>

            <div className="builder-two-column">
              <label className="builder-field">
                <span>Font Weight</span>
                <select
                  value={shellSettings.buttonFontWeight || "720"}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonFontWeight: event.target.value,
                    })
                  }
                >
                  <option value="400">Normal (400)</option>
                  <option value="500">Medium (500)</option>
                  <option value="600">Semibold (600)</option>
                  <option value="700">Bold (700)</option>
                  <option value="720">Heavy (720)</option>
                  <option value="800">Extra Bold (800)</option>
                </select>
              </label>

              <label className="builder-field">
                <span>Letter Spacing</span>
                <select
                  value={shellSettings.buttonLetterSpacing || "0px"}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonLetterSpacing: event.target.value,
                    })
                  }
                >
                  <option value="0px">None (0px)</option>
                  <option value="0.02em">Tight (0.02em)</option>
                  <option value="0.05em">Medium (0.05em)</option>
                  <option value="0.1em">Wide (0.1em)</option>
                </select>
              </label>
            </div>

            <div className="builder-card-title">
              <strong>Hover Behavior</strong>
              <span>actions + animations</span>
            </div>

            <div className="builder-two-column">
              <label className="builder-field">
                <span>Hover Background</span>
                <input
                  type="color"
                  value={buttonColorInputValue(
                    shellSettings.buttonHoverBg,
                    "#111111",
                  )}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonHoverBg: event.target.value,
                    })
                  }
                />
              </label>

              <label className="builder-field">
                <span>Hover Text</span>
                <input
                  type="color"
                  value={buttonColorInputValue(
                    shellSettings.buttonHoverTextColor,
                    "#ffffff",
                  )}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonHoverTextColor: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <div className="builder-two-column">
              <label className="builder-field">
                <span>Hover Border</span>
                <input
                  type="color"
                  value={buttonColorInputValue(
                    shellSettings.buttonHoverBorderColor,
                    "#111111",
                  )}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonHoverBorderColor: event.target.value,
                    })
                  }
                />
              </label>

              <label className="builder-field">
                <span>Hover Action</span>
                <select
                  value={shellSettings.buttonHoverEffect || "lift"}
                  onChange={(event) =>
                    updateShellSettings({
                      buttonHoverEffect: event.target.value as
                        "none" | "lift" | "grow",
                    })
                  }
                >
                  <option value="none">None (Stay static)</option>
                  <option value="lift">
                    Lift Up (Hover translation + shadow)
                  </option>
                  <option value="grow">Grow (Slightly scale up)</option>
                </select>
              </label>
            </div>
          </details>
        </div>
      )}

      {globalStylesTab === "typography" && (
        <div className="builder-global-styles-group">
          <div className="builder-card-title">
            <strong>Typography</strong>
            <span>headings</span>
          </div>

          <label className="builder-field">
            <span>Heading Font</span>
            <select
              value={builderState.design.headingFontFamily ?? "inherit"}
              onChange={(event) =>
                updateDesign({
                  headingFontFamily: event.target.value,
                  preset: undefined,
                })
              }
            >
              <option value="inherit">Website font</option>
              <option value='system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'>
                System sans
              </option>
              <option value="Georgia, serif">Classic serif</option>
              <option value='"Times New Roman", serif'>Times serif</option>
              <option value='"Courier New", monospace'>Monospace</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Heading Size</span>
            <select
              value={
                builderState.design.headingSize ?? "clamp(42px, 8vw, 126px)"
              }
              onChange={(event) =>
                updateDesign({
                  headingSize: event.target.value,
                  preset: undefined,
                })
              }
            >
              <option value="clamp(32px, 5vw, 76px)">Compact</option>
              <option value="clamp(42px, 8vw, 126px)">Display</option>
              <option value="clamp(52px, 9vw, 144px)">Large</option>
            </select>
          </label>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Weight</span>
              <select
                value={builderState.design.headingWeight ?? "760"}
                onChange={(event) =>
                  updateDesign({
                    headingWeight: event.target.value,
                    preset: undefined,
                  })
                }
              >
                <option value="500">Medium</option>
                <option value="600">Semibold</option>
                <option value="700">Bold</option>
                <option value="760">Heavy</option>
              </select>
            </label>

            <label className="builder-field">
              <span>Line Height</span>
              <select
                value={builderState.design.headingLineHeight ?? "0.92"}
                onChange={(event) =>
                  updateDesign({
                    headingLineHeight: event.target.value,
                    preset: undefined,
                  })
                }
              >
                <option value="0.88">Tight</option>
                <option value="0.92">Display</option>
                <option value="1">Balanced</option>
                <option value="1.1">Relaxed</option>
              </select>
            </label>
          </div>

          <div className="builder-two-column">
            <label className="builder-swatch-field">
              <span>Heading Color</span>
              <input
                type="color"
                value={
                  builderState.design.headingColor ??
                  builderState.design.textColor ??
                  "#111111"
                }
                onChange={(event) =>
                  updateDesign({
                    headingColor: event.target.value,
                    preset: undefined,
                  })
                }
              />
            </label>

            <button
              type="button"
              className="builder-secondary-button builder-typography-reset"
              onClick={() =>
                updateDesign({
                  headingColor: undefined,
                  preset: undefined,
                })
              }
            >
              Use section color
            </button>
          </div>
        </div>
      )}

    </div>
  );

  const globalStylesPanel = (
    <CanonicalGlobalStylesPanel
      shellSettings={shellSettings}
      updateShellSettings={updateShellSettings}
      themeSettings={themeSettings}
      onImportThemeSettings={importBuilderThemeSettings}
      onExportThemeSettings={exportBuilderThemeSettings}
    />
  );

  const activeDocumentDisplayName = builderState.displayName ||
    (builderState.page === "footer" ? "Footer" : builderState.page === "header" ? "Header" : getLayoutLabel(builderState.page, customPages));

  const sidebarTopActions = (
    <div className="builder-editor-chrome" aria-label="Builder document and canvas controls">
      <header className="builder-document-header" data-testid="builder-document-header">
        <div className="builder-document-breadcrumb" aria-label="Builder breadcrumb">
          {builderEditorContext ? (
            <button
              type="button"
              className="builder-document-back"
              onClick={() => router.push(builderEditorContext.navigation.returnHref)}
              title={builderEditorContext.navigation.returnLabel}
            >
              <ArrowLeft size={14} />
              {builderEditorContext.navigation.returnLabel}
            </button>
          ) : <span className="builder-document-back-placeholder">Builder</span>}
          <span aria-hidden="true">/</span>
          <span>{builderEditorContext ? builderEditorContext.document.displayName : activeDocumentDisplayName}</span>
        </div>
        <div className="builder-document-header-main">
          <div className="builder-document-identity">
            <span className="builder-document-kind-badge">
              {activeDocumentKindLabel}
            </span>
            {documentRenameEditing && (builderState.page === "header" || builderState.page === "footer") ? (
              <div className="builder-document-rename-row">
                <input
                  aria-label={`Rename ${builderState.page} document`}
                  value={documentRenameDraft}
                  onChange={(event) => setDocumentRenameDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") finishDocumentRename(true);
                    if (event.key === "Escape") finishDocumentRename(false);
                  }}
                  autoFocus
                />
                <button type="button" onClick={() => finishDocumentRename(true)}>Save</button>
                <button type="button" onClick={() => finishDocumentRename(false)}>Cancel</button>
              </div>
            ) : (
              <div className="builder-document-title-row">
                <h1>{builderEditorContext?.document.displayName ?? (sidebarTab === "globalStyles" ? shellSettingsLabel : activeDocumentDisplayName)}</h1>
                {(builderState.page === "header" || builderState.page === "footer") && !builderEditorContext ? (
                  <button
                    type="button"
                    className="builder-icon-button"
                    onClick={startDocumentRename}
                    aria-label={`Rename ${builderState.page} document`}
                    title={`Rename ${builderState.page} document`}
                  >
                    <Pencil size={13} />
                  </button>
                ) : null}
              </div>
            )}
            <p>{builderEditorContext ? builderDocumentOwnershipLabel(builderEditorContext) : sidebarTab === "globalStyles" ? shellStatus : statusText}</p>
          </div>
          <div className="builder-document-actions" aria-label="Document actions">
            {builderEditorContext?.content.mode === "preview" && builderEditorContext.capabilities.canChangePreview ? (
              <label className="builder-template-preview-select">
                <span>Preview {builderEditorContext.content.family === "product" ? "Product" : "Post"}</span>
                {templatePreviewCandidates.length ? (
                  <select
                    value={templatePreviewIdentity?.contentId ?? builderEditorContext.content.identity?.contentId ?? ""}
                    onChange={(event) => {
                      const candidate = templatePreviewCandidates.find((item) => item.identity.contentId === event.target.value);
                      if (candidate) setTemplatePreviewIdentity(candidate.identity);
                    }}
                  >
                    {templatePreviewCandidates.map((candidate) => (
                      <option key={`${candidate.identity.provider}:${candidate.identity.contentType}:${candidate.identity.contentId}`} value={candidate.identity.contentId}>{candidate.label}</option>
                    ))}
                  </select>
                ) : <small>No live {builderEditorContext.content.family === "product" ? "products" : "posts"} available</small>}
              </label>
            ) : null}
            {sidebarTab !== "globalStyles" ? (
              <label className="builder-content-language-select builder-document-language-top">
                <span>{t("builder.contentLanguage.editing")}</span>
                <select value={contentLanguage} onChange={(event) => setContentLanguage(event.target.value)}>
                  {enabledContentLanguages.map((language) => (
                    <option key={language} value={language}>
                      {language === "hy" ? "Հայերեն" : language === "en" ? "English" : "Русский"}
                    </option>
                  ))}
                </select>
                {isUsingPrimaryFallback(rawSelectedSection, contentLanguage, primaryContentLanguage) ? (
                  <small>{t("builder.contentLanguage.fallback")}</small>
                ) : null}
              </label>
            ) : null}
            {sidebarTab !== "globalStyles" && viewPageHref ? (
              <a
                className="builder-canvas-control"
                href={viewPageHref}
                target="_blank"
                rel="noreferrer"
                title={builderFrontendActionLabel(builderEditorContext)}
              >
                <ExternalLink size={14} />
                {builderFrontendActionLabel(builderEditorContext)}
              </a>
            ) : null}
            {sidebarTab !== "globalStyles" ? (
              <>
                <button
                  type="button"
                  className="builder-canvas-control builder-icon-only-control"
                  onClick={undoBuilder}
                  disabled={undoHistoryRef.current.length <= 1}
                  title={t("builder.toolbar.undo")}
                  aria-label={t("builder.toolbar.undo")}
                >
                  <Undo2 size={14} />
                </button>
                <button
                  type="button"
                  className="builder-canvas-control builder-icon-only-control"
                  onClick={redoBuilder}
                  disabled={redoHistoryRef.current.length === 0}
                  title={t("builder.toolbar.redo")}
                  aria-label={t("builder.toolbar.redo")}
                >
                  <Redo2 size={14} />
                </button>
              </>
            ) : null}
            {sidebarTab === "globalStyles" ? (
              <button
                type="button"
                className="builder-canvas-control is-primary"
                onClick={publishShellSettings}
                title={`Publish ${shellSettingsLabel}`}
              >
                <CloudUpload size={14} />
                Publish Settings
              </button>
            ) : hasPendingChanges ? (
              <button
                type="button"
                className="builder-canvas-control is-primary"
                onClick={() => void publishLayout()}
              >
                <CloudUpload size={14} />
                {t("builder.toolbar.publish")}
              </button>
            ) : null}
          </div>
        </div>
      </header>

    </div>
  );

  const sidebarUtilityControls = (
    <>
      <div className="builder-responsive-mode-group" role="group" aria-label={t("builder.toolbar.previewDevice")}>
        <button
          type="button"
          className={`builder-responsive-mode-button${device === "desktop" ? " is-active" : ""}`}
          onClick={() => setDevice("desktop")}
          title="Desktop preview"
          aria-label="Desktop preview"
          aria-pressed={device === "desktop"}
        >
          <Monitor size={17} />
        </button>
        <button
          type="button"
          className={`builder-responsive-mode-button${device === "laptop" ? " is-active" : ""}`}
          onClick={() => setDevice("laptop")}
          title="Laptop preview"
          aria-label="Laptop preview"
          aria-pressed={device === "laptop"}
        >
          <Laptop size={17} />
        </button>
        <button
          type="button"
          className={`builder-responsive-mode-button${device === "tablet" ? " is-active" : ""}`}
          onClick={() => setDevice("tablet")}
          title="Tablet preview"
          aria-label="Tablet preview"
          aria-pressed={device === "tablet"}
        >
          <Tablet size={17} />
        </button>
        <button
          type="button"
          className={`builder-responsive-mode-button${device === "mobile" ? " is-active" : ""}`}
          onClick={() => setDevice("mobile")}
          title="Phone preview"
          aria-label="Phone preview"
          aria-pressed={device === "mobile"}
        >
          <Smartphone size={17} />
        </button>
      </div>
      <button
        type="button"
        className={`builder-sidebar-utility-button${iframeComparisonMode ? " is-active" : ""}`}
        onClick={() => setIframeComparisonMode((current) => !current)}
        title={iframeComparisonMode ? "Use legacy canvas (temporary fallback)" : "Use canonical iframe canvas"}
        aria-label={iframeComparisonMode ? "Use legacy canvas (temporary fallback)" : "Use canonical iframe canvas"}
        aria-pressed={iframeComparisonMode}
      >
        <Frame size={18} />
        <span>{iframeComparisonMode ? "Legacy" : "Iframe"}</span>
      </button>
      <button
        type="button"
        className="builder-sidebar-utility-button"
        onClick={handleToggleTheme}
        title={`Switch to ${dashboardTheme === "light" ? "dark" : "light"} mode`}
        aria-label={`Switch to ${dashboardTheme === "light" ? "dark" : "light"} mode`}
      >
        {dashboardTheme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        <span>Theme</span>
      </button>
      <div className="builder-sidebar-utility-language" title={t("language.label")}>
        <Languages size={18} aria-hidden="true" />
        <span>{t("language.label")}</span>
        <label className="saas-language-switcher">
          <span className="sr-only">Language</span>
          <select
            aria-label="Language"
            data-testid="builder-language-selector"
            value={locale}
            onChange={(event) => {
              if (isLocale(event.target.value)) void setLocale(event.target.value);
            }}
          >
            {(["en", "hy", "ru"] as const).map((language) => (
              <option key={language} value={language}>
                {localeLabels[language]}
              </option>
            ))}
          </select>
        </label>
      </div>
    </>
  );

  const contextualLibraryModal = contextualLibraryOpen && contextualLibraryTarget ? (
    <div
      className="builder-layout-modal builder-dashboard-modal builder-contextual-library-modal"
      data-builder-tenant-theme-root=""
      data-theme={dashboardTheme}
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-contextual-library-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setContextualLibraryOpen(false);
          setContextualLibraryTarget(null);
        }
      }}
    >
      <div className="builder-layout-dialog">
        <div className="builder-layout-header">
          <div>
            <strong id="builder-contextual-library-title">Library</strong>
            <span>Select a saved composition, then insert it into the current Structure selection.</span>
          </div>
          <button
            type="button"
            className="builder-icon-button builder-layout-close"
            onClick={() => {
              setContextualLibraryOpen(false);
              setContextualLibraryTarget(null);
            }}
            aria-label="Close Library"
          >
            <X size={16} />
          </button>
        </div>
        <div className="builder-contextual-library-body">
          <LayoutLibrarySurface
            mode="contextual"
            libraryType={contextualLibraryType}
            availableLibraryTypes={contextualLibraryTypes}
            libraryGroups={contextualLibraryGroups}
            savedTemplates={savedTemplates}
            siteLibraryEnabled={Boolean(websiteId)}
            templateStatus={templateStatus}
            onLibraryTypeChange={setContextualLibraryType}
            onApply={applySavedTemplate}
            onExport={exportSavedTemplate}
            onImport={importSavedTemplate}
            onImportYootheme={importYoothemeLibraryItem}
            onDelete={deleteSavedTemplate}
            onRename={renameSavedTemplate}
            contextualActions={contextualLibraryActions}
            contextualActionsForTemplate={contextualLibraryActionsForTemplate}
            onContextualAction={insertContextualLibraryTemplate}
          />
        </div>
      </div>
    </div>
  ) : null;

  const confirmPresetModal = presetToApply ? (
    <div
      className="builder-layout-modal"
      role="dialog"
      aria-modal="true"
      onClick={() => setPresetToApply(null)}
    >
      <div
        className="builder-layout-dialog"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "480px",
          maxHeight: "300px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          padding: "20px 24px",
        }}
      >
        <div className="builder-layout-header" style={{ borderBottom: "none", paddingBottom: 0 }}>
          <div>
            <strong style={{ fontSize: "16px", fontWeight: 700, color: "var(--builder-ui-text)" }}>Apply Preset</strong>
            <span style={{ fontSize: "13px", color: "var(--builder-ui-muted)", marginTop: "4px", display: "block" }}>
              Are you sure you want to apply the &quot;{presetToApply.name}&quot; preset?
            </span>
          </div>
          <button
            type="button"
            className="builder-layout-close"
            onClick={() => setPresetToApply(null)}
            aria-label="Close confirmation dialog"
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ fontSize: "13px", color: "var(--builder-ui-text)", lineHeight: "1.5" }}>
          This will replace your current Header layout. (Global Styles and Custom Branding will remain unchanged)
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "auto" }}>
          <button
            type="button"
            className="db-btn"
            style={{
              padding: "8px 16px",
              border: "1px solid var(--builder-ui-border)",
              borderRadius: "6px",
              background: "transparent",
              color: "var(--builder-ui-text)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500
            }}
            onClick={() => setPresetToApply(null)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="db-btn db-btn--primary"
            style={{
              padding: "8px 16px",
              border: "none",
              borderRadius: "6px",
              background: "var(--builder-ui-accent, #0d73ff)",
              color: "#fff",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500
            }}
            onClick={() => {
              const key = presetToApply.presetKey;
              setPresetToApply(null);
              executeApplyHeaderPreset(key);
            }}
          >
            Apply Preset
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const isPrimaryPageHydrationPending =
    !publishedDocumentReady &&
    !initialPageHydration?.authoredLayout &&
    !activeShellEntry &&
    builderState.page !== "header" &&
    builderState.page !== "footer";

  return (
    <div
      className={`builder-dashboard ${builderGlobalVisibilityClassName({
        desktop: shellSettings.visibilityDesktop,
        tablet: shellSettings.visibilityTablet,
        mobile: shellSettings.visibilityMobile,
      })} ${inspectorOpen ? "" : "is-inspector-closed"}${
        sidebarCollapsed ? " is-sidebar-collapsed" : ""
      }${sidebarTransitioning ? " is-sidebar-transitioning" : ""}${inspectorOpen ? ` is-inspector-${effectiveInspectorMode}` : " is-inspector-collapsed"}${
        sidebarResizing ? " is-sidebar-resizing" : ""
      }${elementLibraryOpen ? " is-element-library-open" : ""} builder-preview-scheme-${
        builderState.design.colorScheme ?? "auto"
      }`}
      data-builder-tenant-theme-root=""
      data-theme={dashboardTheme}
      style={
        {
          "--builder-dashboard-bg":
            builderState.design.pageBackground ?? "#dfdfd7",
          "--builder-preview-real-bg": previewPageBackground,
          "--builder-sidebar-width": `${sidebarWidth}px`,
          "--builder-inspector-width": `${clampedInspectorWidth}px`,
        } as CSSProperties
      }
      onTransitionEnd={handleDashboardTransitionEnd}
    >
      <style data-builder-dashboard-tenant-tokens>{dashboardTenantTokensCss}</style>
      <WebPagesFontLoader settings={shellSettings} />
      <DashboardSidebar
        websiteId={websiteId}
        dashboardTheme={dashboardTheme}
        availableLayoutBlockKinds={availableLayoutBlockKinds}
        builderState={builderState}
        customPages={customPages}
        onReorderCustomPages={handleReorderCustomPages}
        publishedKeys={publishedKeys}
        builderSlot={builderWireframePanel}
        globalStylesSlot={globalStylesPanel}
        canUseShellSettings={canEditShellSettings}
        shellSettingsLabel={shellSettingsLabel}
        shellSettingsShortLabel={shellSettingsShortLabel}
        newPageTitle={newPageTitle}
        pageStatus={pageStatus}
        savedTemplates={savedTemplates}
        sidebarTab={sidebarTab}
        templateDescriptions={templateDescriptions}
        templateLabels={templateLabels}
        templateStatus={templateStatus}
        yoothemeImportWarnings={yoothemeImportWarnings}
        yoothemeImportPreview={yoothemeImportPreview}
        topActionsSlot={sidebarTopActions}
        utilityControlsSlot={sidebarUtilityControls}
        onOpenElementLibrary={openElementsPanel}
        onCreateBuilderPage={createBuilderPage}
        onCreateBuilderPageFromTemplate={createBuilderPageFromTemplate}
        onDeleteBuilderPage={deleteBuilderPage}
        onDeleteSavedTemplate={deleteSavedTemplate}
        onRenderLayoutBlockIcon={getLayoutBlockLibraryIcon}
        onSaveCurrentPageAsTemplate={saveCurrentPageAsTemplate}
        onApplySavedTemplate={applySavedTemplate}
        onExportSavedTemplate={exportSavedTemplate}
        onImportSavedTemplate={importSavedTemplate}
        onImportYoothemePage={importYoothemePage}
        onApplyYoothemeImport={applyYoothemeImport}
        onChangeYoothemeImportName={(name) => {
          setYoothemeImportPreview((current) => current ? { ...current, documentName: name } : current);
        }}
        onCancelYoothemeImport={cancelYoothemeImport}
        onRenameSavedTemplate={renameSavedTemplate}
        onSetNewPageTitle={setNewPageTitle}
        onSetSidebarTab={setSidebarTab}
        onStartSidebarResize={startSidebarResize}
        onSwitchBuilderTarget={(nextKey) =>
          nextKey === "header"
            ? selectHeader()
            : nextKey === "footer"
              ? selectFooter()
              : switchBuilderTarget(nextKey)
        }
        shellSettings={shellSettings}
        onUpdateShellSettings={updateShellSettings}
        sidebarCollapsed={sidebarCollapsed}
        onSetSidebarCollapsed={setSidebarCollapsedPreference}
      />

      <main ref={builderWorkspaceRef} className="builder-workspace">
        {publishCelebration && (
          <div
            className="builder-publish-celebration"
            role="status"
            aria-live="polite"
          >
            <span className="builder-publish-sparkles" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <strong>Published successfully</strong>
            <small>Looking beautiful.</small>
          </div>
        )}

        {iframeComparisonMode ? (
          <div
            ref={iframeComparisonShellRef}
            className={`builder-iframe-comparison-shell builder-preview-${device}`}
            aria-label="Canonical iframe Builder canvas"
          >
            <motion.div
              className="builder-iframe-comparison-viewport"
              animate={{
                width: device === "desktop" ? "100%" : previewCanvasWidth,
                scale: 1,
              }}
              transition={{ type: "tween", duration: 0 }}
              style={{ transformOrigin: "top center" }}
            >
              <iframe
                ref={iframeComparisonRef}
                key={iframeComparisonHref}
                className="builder-iframe-comparison-frame"
                src={iframeComparisonHref}
                title="Canonical tenant Builder canvas"
                onLoad={handleIframeLoad}
              />
            </motion.div>
          </div>
        ) : (
        <div
          ref={previewShellRef}
          className={`builder-preview-shell builder-preview-${device} builder-preview-scheme-${
            builderState.design.colorScheme ?? "auto"
          }${layoutScheme === "dark" ? " dark" : ""}${spacingOverlayEnabled ? " is-spacing-overlay-enabled" : ""}${isResizingDevice ? " is-resizing-device" : ""}`}
          data-theme={layoutScheme}
          onMouseDown={(event) => {
            const target = event.target as HTMLElement;
            if (
              target.closest(
                ".builder-preview-section, .builder-preview-layout-block, .builder-header-document-preview, .builder-preview-header-editable, button, input, select, textarea, [contenteditable='true'], [draggable='true']",
              )
            ) {
              return;
            }
            clearInspectorSelection();
          }}
          style={
            {
              "--builder-preview-shell-bg": previewPageBackground,
            } as CSSProperties
          }
          >
            <motion.div
              data-builder-editable-canvas="true"
              className="builder-preview-viewport-container"
            animate={{
              width: device === "desktop" ? "100%" : previewCanvasWidth,
              scale: device === "desktop" ? 1 : previewScale,
            }}
            // Inspector docking changes the available grid width. A spring
            // here makes open/close feel like a heavy mechanical shift and
            // needlessly animates the whole canvas.
            transition={{ type: "tween", duration: 0 }}
            style={
              {
                transformOrigin: "top center",
                "--builder-preview-device-width": `${previewCanvasWidth}px`,
                "--builder-preview-header-width": `${previewCanvasWidth}px`,
              } as CSSProperties
            }
            onClickCapture={(event) => {
              // Navigation suppression belongs to the rendered Builder
              // canvas only. Builder chrome lives outside this boundary and
              // must retain normal application navigation.
              if (
                event.target instanceof Element &&
                event.target.closest("a[href]") &&
                shouldSuppressBuilderNavigation(event.target, event)
              ) {
                event.preventDefault();
              }
            }}
            onKeyDownCapture={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("a[href]") &&
                shouldSuppressBuilderKeyboardNavigation(event.target, event.key)
              ) {
                event.preventDefault();
              }
            }}
            onSubmitCapture={(event) => {
              event.preventDefault();
            }}
          >
            <ScopedPreviewLinkRouter
              websiteId={websiteRouteSegment}
              pages={scopedPreviewPages}
              mode="builder"
              scopeSelector='[data-builder-editable-canvas="true"]'
              onNavigate={handleScopedBuilderNavigate}
            />
            <div
              ref={headerPreviewSlotRef}
              id={builderState.page === "header" ? "builder-header-document-preview-slot" : undefined}
              className={`builder-preview-header-slot${builderHeaderScrollState.hidden ? " builder-preview-header-slot--scroll-hidden" : ""}`}
            >
              {builderState.page === "header" && (
                <div
                  className={`builder-header-document-preview builder-preview-section${currentHeaderDocumentSettings.overlay ? " is-header-overlay" : ""}${selectedId === "header-document" && selectedLayoutRowIndex === null && selectedLayoutColumnKey === null && selectedLayoutBlockKey === null ? " is-selected" : ""}${hoveredBuilderTarget?.type === "section" && hoveredBuilderTarget.sectionId === "header-document" ? " is-hovered" : ""}${draggingHeaderElementId ? " is-header-element-dragging" : ""}${draggingHeaderRowId ? " is-header-row-dragging" : ""}${!currentHeaderDocumentSettings.visible ? " is-header-hidden" : ""}`}
                  onMouseEnter={() => setHoveredBuilderTarget({ type: "section", sectionId: "header-document" })}
                  onMouseLeave={() => setHoveredBuilderTarget(null)}
                  onDragOver={(event) => {
                    if (!Array.from(event.dataTransfer.types).includes("application/x-builder-new-block")) return;
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={(event) => {
                    const kind = event.dataTransfer.getData("application/x-builder-new-block") as LayoutBlockKind;
                    if (!kind || !(kind in layoutBlockLabels)) return;
                    event.preventDefault();
                    event.stopPropagation();
                    addElementFromLibrary(kind);
                  }}
                  onDragEndCapture={() => {
                    setDraggingHeaderElementId(null);
                    setDraggingHeaderRowId(null);
                    setHeaderDropTarget(null);
                    setHeaderRowDropTarget(null);
                  }}
                  onDropCapture={() => {
                    window.setTimeout(() => {
                      setDraggingHeaderElementId(null);
                      setDraggingHeaderRowId(null);
                      setHeaderDropTarget(null);
                      setHeaderRowDropTarget(null);
                    }, 0);
                  }}
                >
                  {!currentHeaderDocumentSettings.visible ? (
                    <span className="builder-header-hidden-badge">Header hidden on website</span>
                  ) : null}
                  <BuilderContextToolbar
                    context="shell"
                    label="Header"
                    canMoveUp={false}
                    canMoveDown={false}
                    canDelete={false}
                    onSelect={() => selectShellRoot("header")}
                    onSettings={openHeaderDocumentInspector}
                    onBackToPage={builderState.page === "header" ? exitShellEdit : undefined}
                  />
                  <HeaderShellView
                    layoutOverride={shellSettings.headerLayout}
                    shellSettings={shellSettings}
                    headerSettings={resolvedHeaderSettings}
                    homeHref="#"
                    clientHref="#"
                    scopedPreviewWebsiteId={websiteRouteSegment}
                    scopedPreviewPage={headerContextState.page}
                    scopedPreviewPages={scopedPreviewPages}
                    scopedLinkMode="builder"
                    categoriesContent={builderHeaderCategoriesContent}
                    headerComposition={currentHeaderComposition}
                    builderPreviewMode={true}
                    scrollState={builderHeaderScrollState}
                    publicAnchorId={builderState.sections.find((section) => section.id === "header-document")?.anchorId}
                    activeContentLanguage={contentLanguage}
                    enabledContentLanguages={enabledContentLanguages}
                    languagePreferenceKey={`website_content_language_${websiteId ?? "root"}`}
                    languageSwitcherPreviewOnly={true}
                    onContentLanguageChange={setContentLanguage}
                    renderBuilderElement={(element, content, flexItemStyle) => {
                      const columnId = element.columnId ?? "header-main-row";
                      const columnElements = currentHeaderComposition.elements.filter(
                        (candidate) => candidate.columnId === element.columnId,
                      );
                      const elementIndex = columnElements.findIndex((candidate) => candidate.id === element.id);
                      const dragPlacement = headerDropTarget?.startsWith(`${element.id}:`)
                        ? headerDropTarget.slice(element.id.length + 1) as "above" | "below"
                        : null;
                      return (
                        <div
                          id={element.id}
                          style={flexItemStyle}
                          draggable={Boolean(element.rowId && element.columnId)}
                          className={`builder-header-live-element builder-preview-layout-block is-${element.type}${selectedLayoutBlockKey === element.id ? " is-selected is-selected-block" : ""}${hoveredBuilderTarget?.type === "block" && hoveredBuilderTarget.blockKey === element.id ? " is-hovered-block" : ""}${draggingHeaderElementId === element.id ? " is-dragging-block" : ""}${dragPlacement ? ` is-drag-over-${dragPlacement}` : ""}`}
                          data-header-element={element.type}
                          onClickCapture={(event) => {
                            const target = event.target as HTMLElement;
                            // A Header element is an ordinary Builder block.
                            // Capture every canvas click before authored links
                            // or live controls can route/select the document;
                            // the inspector should follow the clicked element.
                            if (target.closest(".builder-preview-block-tools")) return;
                            event.preventDefault();
                            event.stopPropagation();
                            selectLayoutBlock("header-document", columnId, element.id, true);
                          }}
                          onMouseEnter={() => setHoveredBuilderTarget({ type: "block", sectionId: "header-document", columnKey: columnId, blockKey: element.id })}
                          onMouseLeave={() => setHoveredBuilderTarget(null)}
                          onMouseDown={(event) => {
                            const target = event.target as HTMLElement;
                            if (target.closest("select, input, button, textarea, a, [role='button'], label, .website-language-switcher")) {
                              // Skip immediate block selection on mousedown for interactive components to avoid
                              // disruptive layout/state changes that interrupt browser native actions.
                              return;
                            }
                            event.stopPropagation();
                            if (selectedLayoutBlockKey !== element.id) {
                              selectLayoutBlock("header-document", columnId, element.id, true);
                            }
                          }}
                          onClick={(event) => {
                            const target = event.target as HTMLElement;
                            if (target.closest("a[href]")) return;
                            if (target.closest(".builder-preview-block-tools")) {
                              return;
                            }
                            event.preventDefault();
                            event.stopPropagation();
                            if (selectedLayoutBlockKey !== element.id) {
                              selectLayoutBlock("header-document", columnId, element.id, true);
                            }
                          }}
                          onDragStart={(event) => {
                            event.stopPropagation();
                            if (!element.rowId || !element.columnId) {
                              event.preventDefault();
                              return;
                            }
                            event.dataTransfer.setData(HEADER_BLOCK_DRAG_TYPE, encodeHeaderBlockDragPayload({
                              blockId: element.id,
                              sourceRowId: element.rowId,
                              sourceColumnId: element.columnId,
                            }));
                            event.dataTransfer.effectAllowed = "move";
                            setDraggingHeaderElementId(element.id);
                            setDraggingHeaderRowId(null);
                            createDragGhost(event, element.type);
                          }}
                          onDragOver={(event) => {
                            const types = Array.from(event.dataTransfer.types);
                            if (!types.includes(HEADER_BLOCK_DRAG_TYPE) && !types.includes("application/x-builder-new-block")) return;
                            event.preventDefault();
                            event.stopPropagation();
                            const rect = event.currentTarget.getBoundingClientRect();
                            const placement = getElementDropPlacement(event.clientY, rect);
                            setHeaderDropTarget(`${element.id}:${placement}`);
                            event.dataTransfer.dropEffect = types.includes("application/x-builder-new-block") ? "copy" : "move";
                          }}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            event.nativeEvent.stopImmediatePropagation();
                            const placement = dragPlacement ?? "above";
                            const kind = event.dataTransfer.getData("application/x-builder-new-block") as LayoutBlockKind;
                            if (kind && kind in layoutBlockLabels) {
                              addElementFromLibrary(kind, element.columnId, element.id, placement);
                              setHeaderDropTarget(null);
                              return;
                            }
                            const payload = decodeHeaderBlockDragPayload(event.dataTransfer.getData(HEADER_BLOCK_DRAG_TYPE));
                            if (payload && payload.blockId !== element.id && element.rowId && element.columnId) {
                              moveHeaderBuilderElement({ payload, targetRowId: element.rowId, targetColumnId: element.columnId, targetBlockId: element.id, placement });
                            }
                            setHeaderDropTarget(null);
                            setDraggingHeaderElementId(null);
                          }}
                          onDragEnd={() => {
                            setDraggingHeaderElementId(null);
                            setHeaderDropTarget(null);
                          }}
                        >
                          <BuilderElementToolbar
                            label={element.type}
                            canMoveUp={elementIndex > 0}
                            canMoveDown={elementIndex >= 0 && elementIndex < columnElements.length - 1}
                            onSettings={() => selectLayoutBlock("header-document", columnId, element.id, true)}
                            onMoveUp={() => moveLayoutBlockWithinColumn({ sectionId: "header-document", columnKey: columnId, blockKey: element.id, direction: -1 })}
                            onMoveDown={() => moveLayoutBlockWithinColumn({ sectionId: "header-document", columnKey: columnId, blockKey: element.id, direction: 1 })}
                            onSave={() => saveElementTemplateByKey("header-document", columnId, element.id)}
                            onDuplicate={() => duplicateLayoutBlock({ sectionId: "header-document", columnKey: columnId, blockKey: element.id })}
                            onDelete={() => deleteLayoutBlock({ sectionId: "header-document", columnKey: columnId, blockKey: element.id })}
                          />
                          <span className="builder-preview-drag-handle" aria-hidden="true">::</span>
                          <div className="builder-header-live-element-content">
                            {content}
                          </div>
                        </div>
                      );
                    }}
                    renderBuilderColumn={(columnId, content) => (
                      <div
                        id={columnId}
                        className={`builder-header-live-column${selectedLayoutColumnKey === columnId && !selectedLayoutBlockKey ? " is-selected" : ""}${hoveredBuilderTarget?.type === "column" && hoveredBuilderTarget.columnKey === columnId ? " is-hovered-column" : ""}${headerDropTarget === `column:${columnId}` ? " is-drag-over" : ""}`}
                        style={{ flex: currentHeaderComposition.columns.find((column) => column.id === columnId)?.flex ?? 1 }}
                        onMouseEnter={() => setHoveredBuilderTarget({ type: "column", sectionId: "header-document", columnKey: columnId })}
                        onMouseLeave={() => setHoveredBuilderTarget(null)}
                        onClick={(event) => {
                          if ((event.target as HTMLElement).closest(".builder-header-live-element")) return;
                          event.preventDefault();
                          event.stopPropagation();
                          setHeaderDropTarget(`column:${columnId}`);
                          selectLayoutColumn("header-document", columnId);
                        }}
                        onDragOver={(event) => {
                          const types = Array.from(event.dataTransfer.types);
                          if (!types.includes("application/x-builder-new-block") && !types.includes(HEADER_BLOCK_DRAG_TYPE)) return;
                          event.preventDefault();
                          event.stopPropagation();
                          if (types.includes(HEADER_BLOCK_DRAG_TYPE)) {
                            setHeaderDropTarget(`column:${columnId}`);
                          }
                          event.dataTransfer.dropEffect = types.includes("application/x-builder-new-block") ? "copy" : "move";
                        }}
                        onDragLeave={(event) => {
                          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                          setHeaderDropTarget((current) => current === `column:${columnId}` ? null : current);
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          event.nativeEvent.stopImmediatePropagation();
                          const kind = event.dataTransfer.getData("application/x-builder-new-block") as LayoutBlockKind;
                          if (kind && kind in layoutBlockLabels) {
                            addElementFromLibrary(kind, columnId);
                            setHeaderDropTarget(null);
                            return;
                          }
                          const payload = decodeHeaderBlockDragPayload(event.dataTransfer.getData(HEADER_BLOCK_DRAG_TYPE));
                          const targetRowId = currentHeaderComposition.columns.find((column) => column.id === columnId)?.rowId;
                          if (payload && targetRowId) {
                            moveHeaderBuilderElement({ payload, targetRowId, targetColumnId: columnId, placement: "below" });
                          }
                          setHeaderDropTarget(null);
                        }}
                      >
                        {content}
                      </div>
                    )}
                    renderBuilderRow={(rowId, content) => {
                      const headerSection = builderState.sections.find((section) => section.id === "header-document");
                      const headerRows = headerSection ? getPreviewLayoutRows(headerSection, headerSection.layoutItems ?? []) : [];
                      const rowIndex = headerRows.findIndex((row) => row.items.some((item) => (item.rowId ?? item.id) === rowId));
                      return (
                        <div
                          id={rowId}
                          className={`builder-header-live-row${selectedLayoutRowIndex === rowIndex ? " is-selected" : ""}${hoveredBuilderTarget?.type === "row" && hoveredBuilderTarget.rowIndex === rowIndex ? " is-hovered-row" : ""}`}
                          onMouseEnter={() => setHoveredBuilderTarget({ type: "row", sectionId: "header-document", rowIndex })}
                          onMouseLeave={() => setHoveredBuilderTarget(null)}
                        >
                          {(["before", "after"] as const).map((placement) => (
                            <span
                              key={placement}
                              className={`builder-header-row-drop-target is-${placement}${headerRowDropTarget === `${rowId}:${placement}` ? " is-active" : ""}`}
                              onDragOver={(event) => {
                                if (!event.dataTransfer.types.includes("application/x-builder-header-row")) return;
                                event.preventDefault();
                                event.stopPropagation();
                                setHeaderRowDropTarget(`${rowId}:${placement}`);
                                event.dataTransfer.dropEffect = "move";
                              }}
                              onDragLeave={() => setHeaderRowDropTarget((current) => current === `${rowId}:${placement}` ? null : current)}
                              onDrop={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                const sourceRowId = event.dataTransfer.getData("application/x-builder-header-row");
                                if (sourceRowId && sourceRowId !== rowId) {
                                  moveHeaderBuilderRow({ sourceRowId, targetRowId: rowId, placement });
                                }
                                setHeaderRowDropTarget(null);
                              }}
                              aria-hidden="true"
                            />
                          ))}
                          <div className="builder-preview-row-toolbar builder-header-live-row-tools">
                            <span>Row Layout</span>
                            <button
                              type="button"
                              className="builder-header-row-drag-handle"
                              title={`Drag Header Row ${rowIndex + 1}`}
                              aria-label={`Drag Header Row ${rowIndex + 1}`}
                              draggable
                              onPointerDown={(event) => event.stopPropagation()}
                              onDragStart={(event) => {
                                event.stopPropagation();
                                event.dataTransfer.setData("application/x-builder-header-row", rowId);
                                event.dataTransfer.effectAllowed = "move";
                                setDraggingHeaderRowId(rowId);
                                setDraggingHeaderElementId(null);
                              }}
                              onDragEnd={(event) => {
                                event.stopPropagation();
                                setDraggingHeaderRowId(null);
                                setHeaderRowDropTarget(null);
                              }}
                            ><GripVertical size={12} /></button>
                            <button type="button" title="Open row settings" onClick={() => selectLayoutRow("header-document", rowIndex, true)}><Settings2 size={12} /></button>
                            <button type="button" title="Duplicate row" onClick={() => duplicateLayoutRow("header-document", rowIndex)}><Copy size={12} /></button>
                            <button type="button" title="Delete empty row" onClick={() => deleteEmptyRow("header-document", rowIndex)}><Trash2 size={12} /></button>
                          </div>
                          {content}
                          <button
                            type="button"
                            className="builder-header-add-row-trigger"
                            aria-label={`Add Header row after row ${rowIndex + 1}`}
                            title="Add Header row"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              addRowNear("header-document", rowIndex, "after", "whole");
                            }}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      );
                    }}
                  />
                </div>
              )}
              {builderState.page !== "header" && currentHeaderDocumentSettings.visible && (
                <div
                  className={`builder-preview-header-editable ${
                    headerSelected ? "is-selected" : ""
                  } ${headerHovered ? "is-hovered" : ""}`}
                  onMouseOverCapture={() => setHeaderHovered(true)}
                  onMouseLeave={() => setHeaderHovered(false)}
                  onFocusCapture={() => setHeaderHovered(true)}
                  onBlurCapture={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      setHeaderHovered(false);
                    }
                  }}
                >
                  <HeaderShellView
                    layoutOverride={shellSettings.headerLayout}
                    shellSettings={shellSettings}
                    headerSettings={resolvedHeaderSettings}
                    homeHref={
                      websiteId
                        ? `/app/websites/${websiteRouteSegment}/builder?page=home`
                        : "/dashboard?page=home"
                    }
                    clientHref={
                      websiteId
                        ? `/app/websites/${websiteRouteSegment}/builder?page=client`
                        : "/dashboard?page=client"
                    }
                    scopedPreviewWebsiteId={websiteRouteSegment}
                    scopedPreviewPage={builderState.page}
                    scopedPreviewPages={scopedPreviewPages}
                    scopedLinkMode="builder"
                    categoriesContent={builderHeaderCategoriesContent}
                    headerComposition={currentHeaderComposition}
                    builderPreviewMode={true}
                    scrollState={builderHeaderScrollState}
                    activeContentLanguage={contentLanguage}
                    enabledContentLanguages={enabledContentLanguages}
                    languagePreferenceKey={`website_content_language_${websiteId ?? "root"}`}
                    languageSwitcherPreviewOnly={true}
                    onContentLanguageChange={setContentLanguage}
                  />
                  <BuilderContextToolbar
                    context="shell"
                    label="Header"
                    canMoveUp={false}
                    canMoveDown={false}
                    canDelete={false}
                    onSelect={() => selectShellRoot("header")}
                    onSettings={openHeaderDocumentInspector}
                    onBackToPage={undefined}
                  />
                </div>
              )}
            </div>
            <div
              ref={headerPageContextRef}
              data-overlap-header={currentHeaderDocumentSettings.overlay ? "true" : "false"}
              className={
                builderState.page === "header"
                  ? "builder-context-page-preview builder-header-page-context is-locked"
                  : builderState.page === "footer"
                    ? "builder-context-page-preview builder-footer-page-context is-locked"
                    : ""
              }
              aria-label={
                builderState.page === "header" || builderState.page === "footer"
                  ? "Locked page context"
                  : undefined
              }
              // The locked page preview deliberately disables its editing
              // controls, but PreviewCanvas descendants may still stop the
              // bubble-phase click. Capture here so clicking anywhere inside
              // the page reliably returns to the page document.
              onClickCapture={
                builderState.page === "header" || builderState.page === "footer"
                  ? exitShellEdit
                  : undefined
              }
            >
            {builderState.page === "header" ? (
              <div className="builder-context-preview-status-sticky-wrapper">
                <div
                  className="builder-context-preview-status builder-context-preview-status--header-boundary"
                  role="group"
                  aria-label="Locked page preview status"
                >
                  <span>
                    Previewing {getLayoutLabel(headerContextState.page, customPages)} · Page editing locked
                  </span>
                </div>
              </div>
            ) : null}
            {isPrimaryPageHydrationPending ? (
              <div className="builder-preview-hydrating" role="status">
                Loading page…
              </div>
            ) : (
              <ProductCategoryFilterProvider key={headerContextState.page}>
                <PreviewCanvas
                device={device}
                previewWidth={previewCanvasWidth}
                interactionScale={device === "desktop" ? 1 : previewScale}
                continuousGeometryUpdates={isResizingDevice}
                sections={headerContextSections}
                interactionSections={builderState.page === "footer" ? localizedSections : undefined}
                externalInteractionRootRef={builderState.page === "footer" ? footerPreviewSlotRef : undefined}
                renderSections={
                  builderState.page !== "header" && builderState.page !== "footer"
                    ? materializedPreviewSections ?? undefined
                    : undefined
                }
                page={headerContextState.page}
                previewProducts={previewProducts}
                previewCategoryTree={previewCategoryTree}
                previewCategoryCounts={previewCategoryCounts}
                pageLabel={getLayoutLabel(headerContextState.page, customPages)}
                design={headerContextState.design}
                layoutScheme={layoutScheme}
                shellSettings={shellSettings}
                headerOverlay={currentHeaderDocumentSettings.overlay}
                spacingOverlayEnabled={spacingOverlayEnabled}
                selectedId={selectedId}
                selectedLayoutColumnKey={selectedLayoutColumnKey}
                selectedLayoutRowIndex={selectedLayoutRowIndex}
                selectedLayoutBlockKey={selectedLayoutBlockKey}
                externalHoveredTarget={hoveredBuilderTarget}
                draggingSectionId={draggingSectionId}
                draggingLayoutBlockKey={draggingLayoutBlockKey}
                onSelect={selectSection}
                onSelectColumn={selectLayoutColumn}
                onSelectRow={selectLayoutRow}
                onSelectBlock={selectLayoutBlock}
                onOpenInspector={openInspectorPanel}
                onFollowLink={(href) => {
                  if (!handleScopedBuilderNavigate(href)) {
                    window.location.assign(href);
                  }
                }}
                onDragStart={setDraggingSectionId}
                onDragEnd={() => setDraggingSectionId(null)}
                onReorder={reorderSection}
                onBlockDragStart={setDraggingLayoutBlockKey}
                onBlockDragEnd={() => setDraggingLayoutBlockKey(null)}
                onMoveBlock={moveLayoutBlock}
                onCreateBlock={createLayoutBlockAtDrop}
                onDuplicateBlock={duplicateLayoutBlock}
                onDeleteBlock={deleteLayoutBlock}
                onUpdateBlock={updateLayoutBlockByKey}
                onUpdateGridItem={updateGridItemByKey}
                onDeleteGridItem={deleteGridItemByKey}
                onDuplicateGridItem={duplicateGridItemByKey}
                onMoveGridItem={moveGridItemByKey}
                onMoveBadge={moveBadgeByKey}
                onMoveButton={moveButtonByKey}
                onMoveListItem={moveListItemByKey}
                onDeleteBadge={deleteBadgeByKey}
                onDuplicateBadge={duplicateBadgeByKey}
                onDeleteButton={deleteButtonByKey}
                onDuplicateButton={duplicateButtonByKey}
                onDeleteListItem={deleteListItemByKey}
                onDuplicateListItem={duplicateListItemByKey}
                onDeleteSectionBadge={deleteSectionBadgeByKey}
                onDuplicateSectionBadge={duplicateSectionBadgeByKey}
                onMoveSectionBadge={moveSectionBadgeByKey}
                onUploadGridItemImage={pickGridItemImage}
                onUploadBlockImage={pickBlockImage}
                onAddSection={(targetSectionId, placement) =>
                  addWireframeNear(
                    1,
                    1,
                    targetSectionId,
                    placement,
                    undefined,
                    "section",
                  )
                }
                onAddRow={addRowNear}
                onAddColumnAfter={addSelectedLayoutItem}
                onStackColumnBelow={stackColumnBelow}
                onAppendNestedRow={appendNestedRow}
                onDeleteNestedRow={deleteNestedRow}
                onUnwrapNestedColumn={unwrapNestedColumn}
                onDeleteRow={deleteEmptyRow}
                onDuplicateRow={duplicateLayoutRow}
                onMoveRow={moveLayoutRow}
                onSaveSectionTemplate={saveSectionTemplateById}
                onSaveRowTemplate={saveRowTemplateByIndex}
                onSaveElementTemplate={saveElementTemplateByKey}
                onMoveBlockWithinColumn={moveLayoutBlockWithinColumn}
                onDropSectionTemplate={insertSectionTemplateNear}
                onDropRowTemplate={insertRowTemplateAt}
                onDropElementTemplate={insertElementTemplateAt}
                onMoveSection={moveSection}
                onDuplicateSection={duplicateSection}
                onDeleteSection={deleteSection}
                onOpenSpacingSettings={openSpacingSettings}
                onSetSidebarTab={setSidebarTab}
                onOpenElementsPanel={openElementsPanel}
                onCycleSectionSpacing={cycleSectionSpacing}
                onApplyLayoutPreset={applyContentLayoutPreset}
                />
              </ProductCategoryFilterProvider>
            )}
            </div>
            <div
              ref={footerPreviewSlotRef}
              className="builder-preview-footer-slot"
              aria-label="Footer preview"
            >
                {builderState.page === "footer" ? (
                  <BuilderContextToolbar
                    context="shell"
                    label="Footer"
                    canMoveUp={false}
                    canMoveDown={false}
                    canDelete={false}
                    onSelect={() => selectShellRoot("footer")}
                    onSettings={() => selectShellRoot("footer", true)}
                    onBackToPage={builderState.page === "footer" ? exitShellEdit : undefined}
                  />
                ) : null}
                <StorefrontBuilderRenderer
                  layout={footerSlotLayout}
                  page="footer"
                  pageLabel="Footer"
                  rootElement="footer"
                  shellSettings={shellSettings}
                  builderInteractionIdentity={builderState.page === "footer"}
                />
                {builderState.page !== "footer" ? (
                  <button
                    type="button"
                    className="builder-preview-footer-edit-overlay"
                    aria-label="Edit Footer"
                    title="Edit Footer"
                    onClick={selectFooter}
                  />
                ) : null}
                <BuilderContextToolbar
                  context="shell"
                  label="Footer"
                  canMoveUp={false}
                  canMoveDown={false}
                  canDelete={false}
                  onSelect={() => selectShellRoot("footer")}
                  onSettings={() => selectShellRoot("footer", true)}
                />
            </div>
            {(device === "tablet" || device === "mobile") && (
              <>
                <div
                  className="builder-device-resize-handle handle-left"
                  onMouseDown={(e) => handleDeviceResizeStart(e, "left")}
                  onDoubleClick={() => {
                    if (device === "mobile") {
                      setCustomMobileWidth(390);
                    } else if (device === "tablet") {
                      setCustomTabletWidth(820);
                    }
                  }}
                  title="Drag to resize, double-click to reset"
                />
                <div
                  className="builder-device-resize-handle handle-right"
                  onMouseDown={(e) => handleDeviceResizeStart(e, "right")}
                  onDoubleClick={() => {
                    if (device === "mobile") {
                      setCustomMobileWidth(390);
                    } else if (device === "tablet") {
                      setCustomTabletWidth(820);
                    }
                  }}
                  title="Drag to resize, double-click to reset"
                />
                <div className="builder-device-size-indicator">
                  <span>
                    {device === "mobile"
                      ? customMobileWidth
                      : customTabletWidth}
                    px
                  </span>
                  <button
                    type="button"
                    className="builder-device-size-reset"
                    onClick={() => {
                      if (device === "mobile") {
                        setCustomMobileWidth(390);
                      } else if (device === "tablet") {
                        setCustomTabletWidth(820);
                      }
                    }}
                    title="Reset to default preset"
                  >
                    Reset
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
        )}
        {iframeComparisonMode && (iframeDiagnosticMode === "settled" || iframeDiagnosticMode === "toolbar" || iframeDiagnosticMode === "full") ? (
          <IframeBuilderInteractionLayer
            target={iframeSelectedTarget}
            rect={iframeSelectionRect}
            sections={builderState.sections}
            onSelectTarget={(target, shouldOpenInspector = false) => {
              if (target.type === "section") selectSection(target.sectionId, shouldOpenInspector);
              else if (target.type === "row") selectLayoutRow(target.sectionId, target.rowIndex, shouldOpenInspector);
              else if (target.type === "column") {
                setSelectedId(target.sectionId);
                setSelectedLayoutRowIndex(null);
                setSelectedLayoutColumnKey(target.columnKey);
                setSelectedLayoutBlockKey(null);
                setOpenLayoutItemId(target.columnKey);
                setInspectorTab("layout");
                if (shouldOpenInspector) openInspectorPanel();
              } else selectLayoutBlock(target.sectionId, target.columnKey, target.blockKey, shouldOpenInspector);
            }}
            onOpenInspector={openInspectorPanel}
            onMoveSection={moveSection}
            onDuplicateSection={duplicateSection}
            onDeleteSection={deleteSection}
            onMoveRow={moveLayoutRow}
            onDuplicateRow={duplicateLayoutRow}
            onDeleteRow={deleteEmptyRow}
            onMoveBlock={moveLayoutBlockWithinColumn}
            onDuplicateBlock={duplicateLayoutBlock}
            onDeleteBlock={deleteLayoutBlock}
            onSaveSection={saveSectionTemplateById}
            onSaveRow={saveRowTemplateByIndex}
            onSaveBlock={saveElementTemplateByKey}
            onAddSection={(sectionId) => addWireframeNear(1, 1, sectionId, "below", undefined, "section")}
            onAddRow={(sectionId, rowIndex) => addRowNear(sectionId, rowIndex, "after", "whole")}
            onAddBlock={openElementsPanel}
          />
        ) : null}
      </main>

      {(elementLibraryOpen || inspectorOpen || inspectorRendered) && selectedSection ? (
        <div
          ref={inspectorPanelRef}
          className={`builder-floating-inspector is-${effectiveInspectorMode}${
            !inspectorOpen && !elementLibraryOpen ? " is-closing" : ""
          }${
            inspectorResizing ? " is-resizing" : ""
          }${inspectorDragging ? " is-dragging" : ""}`}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          style={
            effectiveInspectorMode === "floating"
              ? {
                  left: `${inspectorFloatingRect.x}px`,
                  top: `${inspectorFloatingRect.y}px`,
                  width: `${inspectorFloatingRect.width}px`,
                  height: `${inspectorFloatingRect.height}px`,
                }
              : { width: `${clampedInspectorWidth}px` }
          }
        >
          <div
            className="builder-inspector-mode-bar"
            onPointerDown={startInspectorDrag}
            onPointerMove={moveInspectorDrag}
            onPointerUp={stopInspectorDrag}
            onPointerCancel={stopInspectorDrag}
            onLostPointerCapture={stopInspectorDrag}
          >
            <span>
              {elementLibraryOpen ? (
                <>
                  <PanelRightOpen size={14} aria-hidden="true" />
                  Element Library
                </>
              ) : (
                <>
                  <GripVertical size={14} aria-hidden="true" />
                  Inspector
                </>
              )}
            </span>
            <div>
              {elementLibraryOpen ? (
                <button
                  type="button"
                  onClick={() => closeElementLibrary(true)}
                  aria-label="Close Element Library"
                  title="Close Element Library"
                >
                  <X size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setInspectorModePreference(
                      effectiveInspectorMode === "docked"
                        ? "floating"
                        : "docked",
                    )
                  }
                  disabled={
                    effectiveInspectorMode === "floating" &&
                    !inspectorDesktopLayout
                  }
                  aria-label={
                    effectiveInspectorMode === "docked"
                      ? "Undock Inspector"
                      : "Dock Inspector right"
                  }
                  title={
                    effectiveInspectorMode === "docked"
                      ? "Undock Inspector"
                      : inspectorDesktopLayout
                        ? "Dock Inspector right"
                        : "Docking is available on wider screens"
                  }
                >
                  {effectiveInspectorMode === "docked" ? (
                    <SquareMousePointer size={14} />
                  ) : (
                    <PanelRightOpen size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
          {!elementLibraryOpen && inspectorResizeEnabled ? (
            <div
              className="builder-inspector-resize-handle"
              role="separator"
              aria-label="Resize Inspector"
              aria-orientation="vertical"
              aria-valuemin={INSPECTOR_MIN_WIDTH}
              aria-valuemax={inspectorMaxWidth}
              aria-valuenow={Math.round(clampedInspectorWidth)}
              tabIndex={0}
              onKeyDown={resizeInspectorWithKeyboard}
              onPointerDown={startInspectorResize}
              onPointerMove={moveInspectorResize}
              onPointerUp={stopInspectorResize}
              onPointerCancel={stopInspectorResize}
              onLostPointerCapture={stopInspectorResize}
            />
          ) : null}
          {!elementLibraryOpen ? inspectorPanel : null}
          {elementLibraryOpen ? (
            <div className="builder-inspector builder-panel is-open">
              <ElementLibrary
                availableLayoutBlockKinds={availableLayoutBlockKinds}
                onAddElement={(kind) => {
                  const target = elementLibraryTarget;
                  addElementFromLibrary(kind, undefined, undefined, "below", target ?? undefined);
                  closeElementLibrary(false);
                  setInspectorOpen(true);
                }}
                onRenderLayoutBlockIcon={getLayoutBlockLibraryIcon}
                headerMode={builderState.page === "header"}
              />
            </div>
          ) : null}
          {!elementLibraryOpen && effectiveInspectorMode === "floating" ? (
            <div
              className="builder-inspector-floating-resize-handle"
              role="separator"
              aria-label="Resize floating Inspector"
              onPointerDown={startInspectorFloatingResize}
              onPointerMove={moveInspectorFloatingResize}
              onPointerUp={stopInspectorFloatingResize}
              onPointerCancel={stopInspectorFloatingResize}
              onLostPointerCapture={stopInspectorFloatingResize}
            />
          ) : null}
        </div>
      ) : null}

      {!elementLibraryOpen && !inspectorOpen && !inspectorRendered && selectedSection ? (
        <button
          type="button"
          className="builder-inspector-collapsed-rail"
          onClick={openInspectorPanel}
          aria-label="Open Inspector"
          title="Open Inspector"
        >
          <PanelRightOpen size={15} />
          <span>Inspector</span>
        </button>
      ) : null}

      <div
        ref={inspectorPortalRootRef}
        data-inspector-owned-portal
        className="builder-inspector-owned-portal-root"
      >
        <MediaManager
          open={mediaPickerOpen}
          title={mediaPickerTitle}
          currentUrl={mediaPickerCurrentUrl}
          multiple={mediaPickerMultiple}
          websiteId={websiteId}
          onSelect={selectWordPressMedia}
          onSelectMany={selectManyWordPressMedia}
          onClose={closeWordPressMediaPicker}
        />
      </div>
      {contextualLibraryModal ? createPortal(contextualLibraryModal, document.body) : null}
      {confirmPresetModal ? createPortal(confirmPresetModal, document.body) : null}
    </div>
  );
}

type StableCallbackRecord = Record<
  string,
  ((...args: never[]) => unknown) | undefined
>;

function useStableCallbackObject<T extends StableCallbackRecord>(callbacks: T): T {
  const callbacksRef = useRef(callbacks);
  // The proxy captures the ref but reads it only when a user event invokes a callback.
  // eslint-disable-next-line react-hooks/refs
  const [stableCallbacks] = useState<T>(() => {
    const callbackCache = new Map<PropertyKey, unknown>();
    return new Proxy({} as T, {
      get(_target, property) {
        const current = callbacksRef.current[property as keyof T];
        if (typeof current !== "function") return current;
        if (!callbackCache.has(property)) {
          callbackCache.set(property, (...args: never[]) => {
            const latest = callbacksRef.current[property as keyof T];
            if (typeof latest === "function") return latest(...args);
          });
        }
        return callbackCache.get(property);
      },
    });
  });

  useLayoutEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  return stableCallbacks;
}

function PreviewCanvas({
  device,
  previewWidth,
  interactionScale,
  continuousGeometryUpdates,
  sections,
  interactionSections,
  externalInteractionRootRef,
  renderSections,
  page,
  previewProducts,
  previewCategoryTree,
  previewCategoryCounts,
  pageLabel,
  design,
  layoutScheme,
  shellSettings,
  headerOverlay,
  spacingOverlayEnabled,
  selectedId,
  selectedLayoutColumnKey,
  selectedLayoutRowIndex,
  selectedLayoutBlockKey,
  externalHoveredTarget,
  draggingSectionId,
  draggingLayoutBlockKey,
  onSelect,
  onSelectColumn,
  onSelectRow,
  onSelectBlock,
  onOpenInspector,
  onFollowLink,
  onDragStart,
  onDragEnd,
  onReorder,
  onBlockDragStart,
  onBlockDragEnd,
  onMoveBlock,
  onCreateBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onUpdateBlock,
  onUpdateGridItem,
  onDeleteGridItem,
  onDuplicateGridItem,
  onMoveGridItem,
  onMoveBadge,
  onMoveButton,
  onMoveListItem,
  onDeleteBadge,
  onDuplicateBadge,
  onDeleteButton,
  onDuplicateButton,
  onDeleteListItem,
  onDuplicateListItem,
  onDeleteSectionBadge,
  onDuplicateSectionBadge,
  onMoveSectionBadge,
  onUploadGridItemImage,
  onUploadBlockImage,
  onAddSection,
  onAddRow,
  onAddColumnAfter,
  onStackColumnBelow,
  onAppendNestedRow,
  onDeleteNestedRow,
  onUnwrapNestedColumn,
  onDeleteRow,
  onDuplicateRow,
  onMoveRow,
  onSaveSectionTemplate,
  onSaveRowTemplate,
  onSaveElementTemplate,
  onMoveBlockWithinColumn,
  onDropSectionTemplate,
  onDropRowTemplate,
  onDropElementTemplate,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onOpenSpacingSettings,
  onSetSidebarTab,
  onOpenElementsPanel,
  onCycleSectionSpacing,
  onApplyLayoutPreset,
}: {
  device: PreviewDevice;
  previewWidth: number;
  interactionScale: number;
  continuousGeometryUpdates: boolean;
  sections: BuilderSection[];
  interactionSections?: BuilderSection[];
  externalInteractionRootRef?: { current: HTMLDivElement | null };
  /** Transient server projection; authored `sections` remain interaction authority. */
  renderSections?: BuilderSection[];
  page: BuilderLayoutKey;
  previewProducts: ProductNode[];
  previewCategoryTree: CategoryTreeItem[];
  previewCategoryCounts: Record<string, number>;
  pageLabel: string;
  design: BuilderDesign;
  layoutScheme: "light" | "dark";
  shellSettings: BuilderShellSettings;
  headerOverlay: boolean;
  spacingOverlayEnabled: boolean;
  selectedId: string;
  selectedLayoutColumnKey: string | null;
  selectedLayoutRowIndex: number | null;
  selectedLayoutBlockKey: string | null;
  externalHoveredTarget: BuilderHoverTarget | null;
  draggingSectionId: string | null;
  draggingLayoutBlockKey: string | null;
  onSelect: (id: string, openInspector?: boolean) => void;
  onSelectColumn: (sectionId: string, columnKey: string, openInspector?: boolean) => void;
  onSelectRow: (sectionId: string, rowIndex: number, openInspector?: boolean) => void;
  onSelectBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    openInspector?: boolean,
  ) => void;
  onOpenInspector: () => void;
  onFollowLink: (href: string) => void;
  onDragStart: (sectionId: string) => void;
  onDragEnd: () => void;
  onReorder: (
    sourceId: string,
    targetId: string,
    placement?: "above" | "below",
  ) => void;
  onBlockDragStart: (blockKey: string) => void;
  onBlockDragEnd: () => void;
  onMoveBlock: (payload: {
    sectionId: string;
    targetSectionId?: string;
    sourceColumnKey: string;
    sourceBlockKey: string;
    targetColumnKey: string;
    targetBlockKey?: string;
  }) => void;
  onCreateBlock: (payload: {
    sectionId: string;
    targetColumnKey: string;
    kind: LayoutBlockKind;
    targetBlockKey?: string;
  }) => void;
  onDuplicateBlock: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
  onDeleteBlock: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
  onUpdateBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    patch: Partial<BuilderLayoutBlock>,
  ) => void;
  onUpdateGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number],
  ) => void;
  onDeleteGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onDuplicateGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onMoveGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onMoveBadge: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onMoveButton: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onMoveListItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onDeleteBadge: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    badgeIndex: number,
  ) => void;
  onDuplicateBadge: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    badgeIndex: number,
  ) => void;
  onUploadGridItemImage: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    currentUrl?: string,
  ) => void;
  onUploadBlockImage?: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    currentUrl?: string,
  ) => void;
  onAddSection: (
    targetSectionId: string,
    placement: "above" | "below",
  ) => void;
  onAddRow: (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => void;
  onAddColumnAfter: (target: {
    sectionId: string;
    columnKey: string;
  }) => void;
  onStackColumnBelow: (sectionId: string, columnKey: string) => void;
  onAppendNestedRow: (
    sectionId: string,
    outerColumnKey: string,
    afterRowId: string,
  ) => void;
  onDeleteNestedRow: (
    sectionId: string,
    outerColumnKey: string,
    rowId: string,
    nestedColumnKey: string,
  ) => void;
  onUnwrapNestedColumn: (sectionId: string, columnKey: string) => void;
  onDeleteRow: (sectionId: string, rowIndex: number) => void;
  onDuplicateRow: (sectionId: string, rowIndex: number) => void;
  onMoveRow: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  onSaveSectionTemplate: (sectionId: string) => void;
  onSaveRowTemplate: (sectionId: string, rowIndex: number) => void;
  onSaveElementTemplate: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
  ) => void;
  onMoveBlockWithinColumn: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
    direction: -1 | 1;
  }) => void;
  onDropSectionTemplate: (
    templateId: string,
    targetSectionId: string,
    placement: "above" | "below",
  ) => void;
  onDropRowTemplate: (
    templateId: string,
    sectionId: string,
    targetRowId: string,
    placement: "before" | "after" | "replace",
  ) => void;
  onDropElementTemplate: (payload: {
    templateId: string;
    sectionId: string;
    columnKey: string;
    targetBlockKey?: string;
  }) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onOpenSpacingSettings: (target: SpacingInspectorTarget) => void;
  onSetSidebarTab: (tab: SidebarTab) => void;
  onOpenElementsPanel: () => void;
  onDeleteButton: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    buttonIndex: number,
  ) => void;
  onDuplicateButton: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    buttonIndex: number,
  ) => void;
  onDeleteListItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onDuplicateListItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onDeleteSectionBadge: (sectionId: string, badgeIndex: number) => void;
  onDuplicateSectionBadge: (sectionId: string, badgeIndex: number) => void;
  onMoveSectionBadge: (
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onCycleSectionSpacing?: (
    sectionId: string,
    field: "topSpacing" | "bottomSpacing" | "topMargin" | "bottomMargin",
  ) => void;
  onApplyLayoutPreset: (
    sectionId: string,
    presetKey: string,
    rowIndex: number,
  ) => void;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const hoverFrameRef = useRef<HTMLDivElement>(null);
  const hoverSuppressedByScrollRef = useRef(false);
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null);
  const [activeDragOver, setActiveDragOver] = useState<{
    type: "section" | "column" | "block";
    sectionId: string;
    columnKey?: string;
    blockKey?: string;
    placement?: "above" | "below" | "inside";
  } | null>(null);
  const [templateDragType, setTemplateDragType] =
    useState<BuilderTemplateDragType | null>(null);
  const [changeLayoutTarget, setChangeLayoutTarget] = useState<{
    sectionId: string;
    rowIndex: number;
  } | null>(null);
  const [rowInsertRequest, setRowInsertRequest] = useState<{
    sectionId: string;
    rowIndex: number;
  } | null>(null);
  const [editingTarget, setEditingTarget] =
    useState<BuilderInteractionTarget | null>(null);
  const findCanvasTargetElement = useCallback(
    (target: BuilderInteractionTarget | null) => {
      const root = canvasRef.current;
      if (!root || !target) return null;
      const sectionId = CSS.escape(target.sectionId);
      if (target.type === "section") {
        return root.querySelector<HTMLElement>(
          `.builder-preview-section[data-builder-object-type="section"][data-builder-section-id="${sectionId}"]`,
        );
      }
      if (target.type === "row") {
        return root.querySelector<HTMLElement>(
          `.builder-preview-content-row[data-builder-object-type="row"][data-builder-section-id="${sectionId}"][data-builder-row-index="${target.rowIndex}"]`,
        );
      }
      const columnKey = CSS.escape(target.columnKey);
      if (target.type === "column") {
        return root.querySelector<HTMLElement>(
          `[data-builder-object-type="column"][data-builder-section-id="${sectionId}"][data-builder-column-key="${columnKey}"]`,
        );
      }
      const blockKey = CSS.escape(target.blockKey);
      return root.querySelector<HTMLElement>(
        `[data-builder-object-type="block"][data-builder-section-id="${sectionId}"][data-builder-column-key="${columnKey}"][data-builder-block-key="${blockKey}"]`,
      );
    },
    [],
  );
  const onHoverTarget = useCallback(
    (target: BuilderHoverTarget | null) => {
      const frame = hoverFrameRef.current;
      if (!frame) return;
      const element = editingTarget ? null : findCanvasTargetElement(target);
      if (!target || !element) {
        frame.style.display = "none";
        return;
      }
      const rect = element.getBoundingClientRect();
      frame.className = `builder-shared-interaction-frame is-hovered is-${target.type}`;
      frame.style.display = "block";
      frame.style.left = `${rect.left}px`;
      frame.style.top = `${rect.top}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;
    },
    [editingTarget, findCanvasTargetElement],
  );
  useEffect(() => {
    onHoverTarget(externalHoveredTarget);
  }, [externalHoveredTarget, onHoverTarget]);
  const selectedTarget = useMemo(
    () =>
      selectedBuilderTarget({
        sectionId: selectedId,
        rowIndex: selectedLayoutRowIndex,
        columnKey: selectedLayoutColumnKey,
        blockKey: selectedLayoutBlockKey,
      }),
    [
      selectedId,
      selectedLayoutRowIndex,
      selectedLayoutColumnKey,
      selectedLayoutBlockKey,
    ],
  );
  const [optimisticSelectedTarget, setOptimisticSelectedTarget] =
    useState<BuilderInteractionTarget | null>(null);
  const selectionCommitFrameRef = useRef<number | null>(null);
  const interactionSelectedTarget = optimisticSelectedTarget ?? selectedTarget;
  useEffect(() => {
    if (
      optimisticSelectedTarget &&
      builderTargetsEqual(optimisticSelectedTarget, selectedTarget)
    ) {
      setOptimisticSelectedTarget(null);
    }
  }, [optimisticSelectedTarget, selectedTarget]);
  useEffect(() => () => {
    if (selectionCommitFrameRef.current !== null) {
      window.cancelAnimationFrame(selectionCommitFrameRef.current);
    }
  }, []);
  const onChangeSectionLayout = useCallback(
    (sectionId: string, rowIndex: number) =>
      setChangeLayoutTarget({ sectionId, rowIndex }),
    [],
  );
  const requestRowInsert = useCallback(
    (sectionId: string, rowIndex: number) =>
      setRowInsertRequest({ sectionId, rowIndex }),
    [],
  );
  const consumeRowInsertRequest = useCallback(
    () => setRowInsertRequest(null),
    [],
  );

  const sectionCallbacks = useStableCallbackObject({
    onHoverTarget,
    onSelectColumn,
    onSelectRow,
    onSelectBlock,
    onOpenInspector,
    onBlockDragStart,
    onBlockDragEnd,
    onMoveBlock,
    onCreateBlock,
    onDuplicateBlock,
    onDeleteBlock,
    onUpdateBlock,
    onUpdateGridItem,
    onDeleteGridItem,
    onDuplicateGridItem,
    onMoveGridItem,
    onMoveBadge,
    onMoveButton,
    onMoveListItem,
    onDeleteBadge,
    onDuplicateBadge,
    onDeleteButton,
    onDuplicateButton,
    onDeleteListItem,
    onDuplicateListItem,
    onDeleteSectionBadge,
    onDuplicateSectionBadge,
    onMoveSectionBadge,
    onUploadGridItemImage,
    onUploadBlockImage,
    onAddRow,
    onAddColumnAfter,
    onStackColumnBelow,
    onAppendNestedRow,
    onDeleteNestedRow,
    onUnwrapNestedColumn,
    onDeleteRow,
    onDuplicateRow,
    onMoveRow,
    onSaveRowTemplate,
    onSaveElementTemplate,
    onMoveBlockWithinColumn,
    onDropRowTemplate,
    onDropElementTemplate,
    onOpenSpacingSettings,
    onOpenElementsPanel,
    onChangeSectionLayout,
  });

  const selectDelegatedTarget = useCallback(
    (target: BuilderInteractionTarget, openInspector: boolean) => {
      if (target.type === "section") onSelect(target.sectionId, openInspector);
      if (target.type === "row") onSelectRow(target.sectionId, target.rowIndex, openInspector);
      if (target.type === "column") onSelectColumn(target.sectionId, target.columnKey, openInspector);
      if (target.type === "block") {
        onSelectBlock(target.sectionId, target.columnKey, target.blockKey, openInspector);
      }
    },
    [onSelect, onSelectBlock, onSelectColumn, onSelectRow],
  );
  const scheduleDelegatedSelection = useCallback(
    (target: BuilderInteractionTarget, openInspector: boolean) => {
      setOptimisticSelectedTarget(target);
      if (selectionCommitFrameRef.current !== null) {
        window.cancelAnimationFrame(selectionCommitFrameRef.current);
      }
      selectionCommitFrameRef.current = window.requestAnimationFrame(() => {
        selectionCommitFrameRef.current = null;
        selectDelegatedTarget(target, openInspector);
      });
    },
    [selectDelegatedTarget],
  );
  const selectInteractionTarget = useCallback(
    (target: BuilderInteractionTarget) => scheduleDelegatedSelection(target, false),
    [scheduleDelegatedSelection],
  );

  const resolveDelegatedHoverTarget = useCallback((element: Element | null) => {
    const target = builderTargetFromElement(element);
    if (target?.type !== "column") return target;
    const owner = element?.closest<HTMLElement>(
      '[data-builder-object-type="column"]',
    );
    if (owner?.dataset.builderColumnEmpty !== "true") return target;
    const rowIndex = Number(owner.dataset.builderRowIndex);
    return Number.isInteger(rowIndex)
      ? { type: "row" as const, sectionId: target.sectionId, rowIndex }
      : target;
  }, []);

  const handleDelegatedMouseOver = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const previousPosition = lastPointerPositionRef.current;
      const pointerMoved = !previousPosition ||
        previousPosition.x !== event.clientX || previousPosition.y !== event.clientY;
      lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };
      if (hoverSuppressedByScrollRef.current && !pointerMoved) return;
      if (pointerMoved) hoverSuppressedByScrollRef.current = false;
      const target = resolveDelegatedHoverTarget(event.target as Element);
      const previous = resolveDelegatedHoverTarget(
        event.relatedTarget instanceof Element ? event.relatedTarget : null,
      );
      if (!builderTargetsEqual(target, previous)) onHoverTarget(target);
    },
    [onHoverTarget, resolveDelegatedHoverTarget],
  );

  const handleDelegatedMouseOut = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const current = resolveDelegatedHoverTarget(event.target as Element);
      const next = resolveDelegatedHoverTarget(
        event.relatedTarget instanceof Element ? event.relatedTarget : null,
      );
      if (!builderTargetsEqual(current, next)) onHoverTarget(next);
    },
    [onHoverTarget, resolveDelegatedHoverTarget],
  );
  const handleDelegatedMouseMove = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      const previousPosition = lastPointerPositionRef.current;
      const pointerMoved = !previousPosition ||
        previousPosition.x !== event.clientX || previousPosition.y !== event.clientY;
      lastPointerPositionRef.current = { x: event.clientX, y: event.clientY };
      if (hoverSuppressedByScrollRef.current && !pointerMoved) return;
      if (pointerMoved) hoverSuppressedByScrollRef.current = false;
      if (hoverFrameRef.current?.style.display !== "none") return;
      const target = resolveDelegatedHoverTarget(event.target as Element);
      onHoverTarget(target);
    },
    [onHoverTarget, resolveDelegatedHoverTarget],
  );

  const handleDelegatedClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('[contenteditable="true"]')) return;
      // In Builder, an authored link is still part of the selectable canvas
      // object. Keep the live destination for the explicit Follow Link action,
      // but do not navigate on the normal element click.
      if (resolveBuilderOpenLinkIntent(event.target)) event.preventDefault();
      const target = builderTargetFromElement(event.target);
      if (target) {
        onHoverTarget(null);
        scheduleDelegatedSelection(target, false);
      }
    },
    [onHoverTarget, scheduleDelegatedSelection],
  );

  const handleBuilderNavigationCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      // Portaled Builder chrome remains in this component's React event tree,
      // but it is not part of the rendered canvas DOM. E3 suppression is
      // canvas-scoped, so toolbar and breadcrumb actions must bypass it.
      if (
        !(event.target instanceof Node) ||
        !event.currentTarget.contains(event.target)
      ) {
        return;
      }
      if (shouldSuppressBuilderNavigation(event.target, event)) {
        // Keep bubbling intact: the canvas delegated click handler still owns
        // selection, while the authored destination cannot escape Builder.
        event.preventDefault();
        const actionable = event.target instanceof Element
          ? event.target.closest<HTMLElement>(
              "button, [role=\"button\"], summary, input[type=\"submit\"], input[type=\"button\"]",
            )
          : null;
        if (actionable && !isBuilderPreviewInteractiveControl(event.target)) {
          // Commerce and submit controls are actions, not navigation. Stop the
          // renderer-owned action, then preserve the canonical canvas select.
          event.stopPropagation();
          const target = builderTargetFromElement(event.target as Element);
          if (target) {
            onHoverTarget(null);
            scheduleDelegatedSelection(target, false);
          }
        }
      }
    },
    [onHoverTarget, scheduleDelegatedSelection],
  );

  const handleBuilderKeyboardCapture = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (
        !(event.target instanceof Node) ||
        !event.currentTarget.contains(event.target)
      ) {
        return;
      }
      if (shouldSuppressBuilderKeyboardNavigation(event.target, event.key)) {
        // This covers Enter-generated anchor clicks and Space activation, too.
        event.preventDefault();
        const target = builderTargetFromElement(
          event.target instanceof Element ? event.target : null,
        );
        if (target) {
          onHoverTarget(null);
          scheduleDelegatedSelection(target, false);
        }
      }
    },
    [onHoverTarget, scheduleDelegatedSelection],
  );

  const handleDelegatedDoubleClick = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('[contenteditable="true"]')) return;
      const owner = event.target.closest<HTMLElement>(
        '[data-builder-double-click-inspector="true"]',
      );
      const target = builderTargetFromElement(owner);
      if (target) {
        onHoverTarget(null);
        scheduleDelegatedSelection(target, true);
      }
    },
    [onHoverTarget, scheduleDelegatedSelection],
  );

  const visibleSections = useMemo(
    () => (renderSections ?? sections).filter((section) => section.visible),
    [renderSections, sections],
  );
  const responsiveBreakpointPolicy = useMemo(
    () => resolveResponsiveBreakpointPolicy(shellSettings),
    [shellSettings],
  );
  const previewResponsiveTier = useMemo(
    () => resolveResponsiveBreakpointTier(previewWidth, responsiveBreakpointPolicy),
    [previewWidth, responsiveBreakpointPolicy],
  );
  const animationSignature = useMemo(
    () => visibleSections
      .map((section) => {
        const sectionAnimation = JSON.stringify(section.animation ?? {});
        const blockAnimations = (section.layoutItems ?? [])
          .flatMap((item) => item.blocks ?? [])
          .map((block) => JSON.stringify(block.animation ?? {}))
          .join("|");
        return `${section.id}:${sectionAnimation}:${blockAnimations}`;
      })
      .join("||"),
    [visibleSections],
  );

  const changeLayoutModal = changeLayoutTarget ? (
    <div
      className="builder-layout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-change-layout-picker-title"
      onClick={() => setChangeLayoutTarget(null)}
    >
      <div
        className="builder-layout-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="builder-layout-header">
          <div>
            <strong id="builder-change-layout-picker-title">Choose layout</strong>
            <span>Select the column structure for this layout.</span>
          </div>
          <button
            type="button"
            className="builder-layout-close"
            onClick={() => setChangeLayoutTarget(null)}
            aria-label="Close layout picker"
          >
            <X size={15} />
          </button>
        </div>

        <div className="builder-layout-picker-body">
          {uikitPresetGroups.map((group) => {
            const groupPresets = group.keys
              .map((key) => builderRowLayoutPresets.find((p) => p.key === key))
              .filter(Boolean);

            if (groupPresets.length === 0) return null;

            return (
              <div key={group.title} className="builder-layout-picker-group">
                <div className="builder-layout-picker-group-title">
                  {group.title}
                </div>
                <div className="builder-layout-picker-grid">
                  {groupPresets.map((preset) => (
                    <button
                      key={preset!.key}
                      type="button"
                      className="builder-layout-picker-card"
                      onClick={() => {
                        onApplyLayoutPreset(
                          changeLayoutTarget.sectionId,
                          preset!.key,
                          changeLayoutTarget.rowIndex,
                        );
                        setChangeLayoutTarget(null);
                      }}
                    >
                      <UikitPresetWireframeDiagram presetKey={preset!.key} />
                      <span className="builder-layout-picker-card-copy">
                        <strong>{preset!.label}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <BuilderCarouselGeometryCoordinator
      continuousUpdates={continuousGeometryUpdates}
    >
      <div
        ref={canvasRef}
      className={`builder-preview-canvas${
        templateDragType ? ` is-dragging-template-${templateDragType}` : ""
      }${selectedLayoutBlockKey !== null ? " has-selected-block" : ""}${
        selectedLayoutRowIndex !== null && selectedLayoutBlockKey === null
          ? " has-selected-row"
          : ""
      }${
        selectedId &&
        selectedLayoutRowIndex === null &&
        selectedLayoutBlockKey === null
          ? " has-selected-section"
          : ""
      }${editingTarget ? " is-text-editing" : ""}`}
      onMouseOver={handleDelegatedMouseOver}
      onMouseOut={handleDelegatedMouseOut}
      onMouseMove={handleDelegatedMouseMove}
      onClickCapture={handleBuilderNavigationCapture}
      onKeyDownCapture={handleBuilderKeyboardCapture}
      onSubmitCapture={(event) => {
        // Forms are preview-only in Builder. Do not submit to a CMS or
        // external action while preserving normal field editing above.
        event.preventDefault();
      }}
      onClick={handleDelegatedClick}
      onDoubleClick={handleDelegatedDoubleClick}
      onFocusCapture={(event) => {
        if (!(event.target instanceof HTMLElement)) return;
        if (!event.target.isContentEditable) {
          if (event.target.matches(".builder-main-row-frame")) {
            const target = builderTargetFromElement(event.target);
            if (target?.type === "row") {
              onSelectRow(target.sectionId, target.rowIndex, false);
            }
          }
          return;
        }
        const target = builderTargetFromElement(event.target);
        if (target?.type === "block") {
          setEditingTarget(target);
          onHoverTarget(null);
          onSelectBlock(target.sectionId, target.columnKey, target.blockKey, false);
        }
      }}
      onBlurCapture={(event) => {
        if (!(event.target instanceof HTMLElement) || !event.target.isContentEditable) {
          return;
        }
        const next = event.relatedTarget;
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          setEditingTarget(null);
          return;
        }
        if (!(next instanceof HTMLElement) || !next.isContentEditable) {
          setEditingTarget(null);
        }
      }}
        style={omitPreviewCanvasDefaults({
          "--builder-global-section-padding-top": resolveBuilderSpacing(
            shellSettings.sectionPaddingTop,
            "sectionPadding",
          ).css,
          "--builder-global-section-padding-bottom": resolveBuilderSpacing(
            shellSettings.sectionPaddingBottom,
            "sectionPadding",
          ).css,
          "--builder-global-section-margin-top": resolveBuilderSpacing(
            shellSettings.sectionMarginTop,
            "sectionMargin",
          ).css,
          "--builder-global-section-margin-bottom": resolveBuilderSpacing(
            shellSettings.sectionMarginBottom,
            "sectionMargin",
          ).css,
          "--builder-global-row-padding-top": getPreviewRowSpacing(
            shellSettings.rowPaddingTop,
            "rowPadding",
          ),
          "--builder-global-row-padding-bottom": getPreviewRowSpacing(
            shellSettings.rowPaddingBottom,
            "rowPadding",
          ),
          "--builder-global-row-margin-top": getPreviewRowSpacing(
            shellSettings.rowMarginTop,
            "rowMargin",
          ),
          "--builder-global-row-margin-bottom": getPreviewRowSpacing(
            shellSettings.rowMarginBottom,
            "rowMargin",
          ),
          "--builder-global-row-gap": getPreviewRowSpacing(
            shellSettings.rowGap,
            "rowGap",
          ),
          "--builder-global-column-gap": resolveBuilderSpacing(
            undefined,
            "columnGap",
            shellSettings.columnGap,
          ).css,
          "--builder-global-element-padding-top": getPreviewElementSpacing(
            shellSettings.elementPaddingTop,
            "elementPadding",
          ),
          "--builder-global-element-padding-right": getPreviewElementSpacing(
            shellSettings.elementPaddingRight,
            "elementPadding",
          ),
          "--builder-global-element-padding-bottom": getPreviewElementSpacing(
            shellSettings.elementPaddingBottom,
            "elementPadding",
          ),
          "--builder-global-element-padding-left": getPreviewElementSpacing(
            shellSettings.elementPaddingLeft,
            "elementPadding",
          ),
          "--builder-global-element-margin-top": getPreviewElementSpacing(
            shellSettings.elementMarginTop,
            "elementMargin",
          ),
          "--builder-global-element-margin-right": getPreviewElementSpacing(
            shellSettings.elementMarginRight,
            "elementMargin",
          ),
          "--builder-global-element-margin-bottom": getPreviewElementSpacing(
            shellSettings.elementMarginBottom,
            "elementMargin",
          ),
          "--builder-global-element-margin-left": getPreviewElementSpacing(
            shellSettings.elementMarginLeft,
            "elementMargin",
          ),
          "--builder-editor-row-interaction-gutter": `${
            20 / Math.max(interactionScale, 0.25)
          }px`,
          "--builder-editor-main-row-margin": `${
            24 / Math.max(interactionScale, 0.25)
          }px`,
          ...builderButtonCssVars(shellSettings),
        } as CSSProperties)}
      onDragEnter={(event) => {
        const dragType = getBuilderTemplateDragType(event.dataTransfer.types);
        if (!dragType) return;
        setTemplateDragType(dragType);
      }}
      onDragOver={(event) => {
        const dragType = getBuilderTemplateDragType(event.dataTransfer.types);
        if (!dragType) return;
        setTemplateDragType(dragType);
      }}
      onDragLeave={(event) => {
        if (
          event.relatedTarget instanceof Node &&
          event.currentTarget.contains(event.relatedTarget)
        ) {
          return;
        }
        setTemplateDragType(null);
        setActiveDragOver(null);
      }}
      onDrop={() => {
        setTemplateDragType(null);
        setActiveDragOver(null);
      }}
    >
      <ResponsiveBreakpointPolicyStyle policy={responsiveBreakpointPolicy} />
      {visibleSections.length === 0 && (
        <div className="builder-preview-empty">
          <Layers3 size={22} />
          <strong>No visible sections</strong>
          <small>Use the section list or turn a hidden section back on.</small>
          <button
            type="button"
            className="builder-preview-empty-add"
            data-builder-preview-interactive="true"
            onClick={() => onAddSection("__empty-page__", "below")}
          >
            <Plus size={16} />
            Add section
          </button>
        </div>
      )}

      <div
        className={`shop-builder-main shop-builder-main--scheme-${
          design.colorScheme ?? "auto"
        } builder-preview-page${draggingSectionId ? " is-dragging-section" : ""}`}
        data-theme={layoutScheme}
        style={{
          ...designStyle({ design, sections } as BuilderLayout),
        }}
        data-builder-page-root
        data-responsive-breakpoint-policy={responsiveBreakpointPolicy.id}
        data-responsive-breakpoint-small={responsiveBreakpointPolicy.small}
        data-responsive-breakpoint-medium={responsiveBreakpointPolicy.medium}
        data-responsive-breakpoint-large={responsiveBreakpointPolicy.large}
        data-responsive-breakpoint-xlarge={responsiveBreakpointPolicy.xlarge}
        data-responsive-preview-width={previewWidth}
        data-builder-preview-tier={previewResponsiveTier}
        // Desktop Builder uses the real rendered-page viewport, exactly like
        // storefront. Device previews deliberately opt into the simulated
        // canvas tier below; applying that simulation to desktop caused a
        // 640px browser viewport to be treated as its sidebar-reduced canvas
        // width instead of the canonical UIkit Small boundary.
        data-responsive-preview-tier={device === "desktop" ? undefined : previewResponsiveTier}
        data-builder-page={page}
        data-gsap-home={page === "home" ? true : undefined}
        data-section-header-transparent={
          visibleSections[0]?.headerTransparent ? "true" : undefined
        }
        data-section-pull-under-header={
          visibleSections[0]?.pullUnderHeader ? "true" : undefined
        }
        data-section-header-text-color={
          visibleSections[0]?.headerTextColor && visibleSections[0].headerTextColor !== "none"
            ? visibleSections[0].headerTextColor
            : undefined
        }
        data-overlap-header={
          (visibleSections[0]?.pullUnderHeader || headerOverlay) ? "true" : undefined
        }
        data-section-default-color-mode={resolveSectionColorMode(shellSettings, "default")}
        data-section-muted-color-mode={resolveSectionColorMode(shellSettings, "muted")}
        data-section-primary-color-mode={resolveSectionColorMode(shellSettings, "primary")}
        data-section-secondary-color-mode={resolveSectionColorMode(shellSettings, "secondary")}
      >
        <BuilderScrollAnimations key={animationSignature} dashboardMode />
        <BuilderStickyRuntime />
        <div
          className="shop-builder-inner builder-preview-inner"
          aria-label={`${pageLabel} preview`}
        >
          <AnimatePresence mode="sync">
            {visibleSections.map((section, sectionIndex) => {
              const sourceIndex = sections.findIndex(
                (item) => item.id === section.id,
              );
              const isSelected = selectedId === section.id;
              const sectionEditingTarget = editingTarget?.sectionId === section.id
                ? editingTarget
                : null;
              const isSectionActive =
                isSelected &&
                selectedLayoutRowIndex === null &&
                selectedLayoutColumnKey === null &&
                selectedLayoutBlockKey === null;
              const sectionTarget: BuilderInteractionTarget = {
                type: "section",
                sectionId: section.id,
              };
              const sectionInteractionState = resolveBuilderInteractionState({
                target: sectionTarget,
                selected: selectedTarget,
                hovered: null,
                editing: editingTarget,
              });
              const sectionChrome = resolveBuilderInteractionChrome({
                state: sectionInteractionState,
                spacingActive: spacingOverlayEnabled,
                dragging: Boolean(draggingSectionId),
                hoverToolbarReady: builderTargetsEqual(
                  sectionTarget,
                  null,
                ),
              });
              const animationAttrs = previewAnimationAttrs(section.animation);
              const isAnimatedBg =
                section.backgroundEffect === "antigravity" ||
                section.backgroundEffect === "antigravity2" ||
                section.backgroundEffect === "aurora" ||
                section.backgroundEffect === "constellation" ||
                section.backgroundEffect === "waves" ||
                section.backgroundEffect === "flowfield" ||
                section.backgroundEffect === "webgl_waves" ||
                section.backgroundEffect === "webgl_flowfield" ||
                section.backgroundEffect === "webgl_cybergrid" ||
                section.backgroundEffect === "webgl_fluid";
              const isSectionAntigravity =
                section.backgroundEffect === "antigravity";
              const isFullTheme =
                isSectionAntigravity &&
                (section.antigravityVisualMode === undefined ||
                  section.antigravityVisualMode === "full");

              return (
                <motion.div
                  key={section.id}
                  className={section.stickyEffect && section.stickyEffect !== "none" ? "builder-preview-section-sticky-wrapper" : undefined}
                  initial={false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={undefined}
                  transition={{
                    duration: 0,
                  }}
                  style={{
                    position: "relative",
                    zIndex: section.stickyEffect === "reveal" ? -1 : Math.max(1, 100 - sectionIndex),
                  }}
                >
                  <div
                    id={section.anchorId || section.id}
                    data-builder-section-id={section.id}
                    data-builder-object-type="section"
                    data-builder-interaction-state={sectionInteractionState}
                    data-builder-double-click-inspector="true"
                    role="button"
                    tabIndex={0}
                    draggable={false}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", section.id);
                      event.dataTransfer.effectAllowed = "move";
                      onDragStart(section.id);
                      createDragGhost(
                        event,
                        sectionLabels[section.kind] || "Section",
                      );
                    }}
                    className={`builder-preview-section ${builderInteractionClassName(
                      sectionTarget,
                      sectionInteractionState,
                    )} ${getBuilderSectionClassName(
                      section,
                      layoutScheme,
                      getStorefrontPreviewClass(section),
                    )} ${
                      isFullTheme
                        ? "shop-builder-section--effect-antigravity"
                        : isAnimatedBg
                          ? "relative overflow-hidden"
                          : ""
                    } ${isSectionActive ? "is-selected" : ""}`}
                    style={{
                      // Reveal sections are the lower sticky layer in
                      // YOOtheme; the following section must paint over them.
                      zIndex: section.stickyEffect === "reveal" ? -1 : Math.max(1, 100 - sectionIndex),
                      ...sectionStyle(section, layoutScheme),
                      "--shop-builder-section-height-offset":
                        section.heightOffset === undefined
                          ? undefined
                          : `${section.heightOffset}${typeof section.heightOffset === "number" ? "px" : ""}`,
                      ...animationAttrs.style,
                    } as CSSProperties}
                    {...animationAttrs.data}
                    data-section-title-breakpoint={normalizeSectionTitleBreakpoint(section.sectionTitleBreakpoint)}
                    data-builder-html-element={section.htmlElement || "section"}
                    data-uk-sticky={getBuilderStickyDeclaration(section.stickyEffect)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onSelect(section.id);
                      }
                    }}
                    onDragOver={(event) => {
                      const types = Array.from(event.dataTransfer.types);
                      const isSectionDrag =
                        types.includes("text/plain") &&
                        !types.includes("application/x-builder-block") &&
                        !types.includes("application/x-builder-new-block") &&
                        getBuilderTemplateDragType(event.dataTransfer.types) !==
                          "element";

                      if (isSectionDrag) {
                        event.preventDefault();
                        event.stopPropagation();
                        const rect =
                          event.currentTarget.getBoundingClientRect();
                        const relativeY = event.clientY - rect.top;
                        const placement =
                          relativeY < rect.height / 2 ? "above" : "below";
                        if (
                          !activeDragOver ||
                          activeDragOver.type !== "section" ||
                          activeDragOver.sectionId !== section.id ||
                          activeDragOver.placement !== placement
                        ) {
                          setActiveDragOver({
                            type: "section",
                            sectionId: section.id,
                            placement,
                          });
                        }
                        event.dataTransfer.dropEffect = "move";
                      }
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      const placement =
                        activeDragOver?.type === "section" &&
                        activeDragOver.sectionId === section.id &&
                        (activeDragOver.placement === "above" ||
                          activeDragOver.placement === "below")
                          ? activeDragOver.placement
                          : "above";
                      setActiveDragOver(null);

                      if (
                        event.dataTransfer.getData(BUILDER_TEMPLATE_DND_TYPE)
                      ) {
                        const templateId = event.dataTransfer.getData(
                          BUILDER_TEMPLATE_DND_TYPE,
                        );
                        if (templateId) {
                          onDropSectionTemplate(
                            templateId,
                            section.id,
                            placement,
                          );
                        }
                        onDragEnd();
                        return;
                      }
                      const sourceId = event.dataTransfer.getData("text/plain");
                      if (!sourceId) {
                        onDragEnd();
                        return;
                      }
                      if (sourceId.startsWith("builder-block:")) return;
                      onReorder(sourceId, section.id, placement);
                      onDragEnd();
                    }}
                    onDragEnd={() => {
                      setActiveDragOver(null);
                      onDragEnd();
                    }}
                  >
                    {sectionChrome.showSpacing && (
                      <SectionSpacingOverlay
                        section={section}
                        shellSettings={shellSettings}
                        showZeroLabels={spacingOverlayEnabled}
                        onOpenSpacingSettings={onOpenSpacingSettings}
                        onCycleSectionSpacing={onCycleSectionSpacing}
                      />
                    )}
                    {isAnimatedBg && (
                      <>
                        <AntigravityCanvas
                          speed={section.antigravitySpeed}
                          particleCount={section.antigravityParticleCount}
                          color={section.antigravityColor}
                          gridDensity={section.antigravityGridDensity as any}
                          interactive={section.antigravityInteractive}
                          showGrid={section.antigravityShowGrid}
                          showParticles={section.antigravityShowParticles}
                          gridMoveSpeed={section.antigravityGridMoveSpeed}
                          glowIntensity={section.antigravityGlowIntensity}
                          interactionScope={
                            section.antigravityInteractionScope as any
                          }
                          visualMode={section.antigravityVisualMode as any}
                          effectType={section.backgroundEffect}
                        />
                        {isSectionAntigravity &&
                          section.antigravityShowGrid !== false && (
                            <div
                              className="antigravity-grid-overlay"
                              aria-hidden="true"
                              style={
                                section.antigravityGridMoveSpeed !==
                                  undefined || section.antigravityColor
                                  ? {
                                      animationDuration:
                                        section.antigravityGridMoveSpeed === 0
                                          ? "0s"
                                          : `${25 / (section.antigravityGridMoveSpeed ?? 1.0)}s`,
                                      backgroundImage: section.antigravityColor
                                        ? `linear-gradient(${section.antigravityColor}08 1px, transparent 1px), linear-gradient(90deg, ${section.antigravityColor}08 1px, transparent 1px)`
                                        : undefined,
                                    }
                                  : undefined
                              }
                            />
                          )}
                      </>
                    )}
                    {section.visualStyle?.background?.videoUrl ? (
                      <video
                        className="shop-builder-section-background-video"
                        src={section.visualStyle.background.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-hidden="true"
                      />
                    ) : null}
                    <div
                      className="builder-preview-section-insert builder-preview-section-insert--top"
                      data-builder-object-type="section"
                      data-builder-section-id={section.id}
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => event.stopPropagation()}
                      onDragStart={(event) => event.stopPropagation()}
                      onDragOver={(event) => {
                        if (
                          getBuilderTemplateDragType(
                            event.dataTransfer.types,
                          ) !== "section"
                        )
                          return;
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveDragOver({
                          type: "section",
                          sectionId: section.id,
                          placement: "above",
                        });
                        event.dataTransfer.dropEffect = "copy";
                      }}
                      onDrop={(event) => {
                        const templateId = event.dataTransfer.getData(
                          BUILDER_TEMPLATE_DND_TYPE,
                        );
                        if (!templateId) return;
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveDragOver(null);
                        onDropSectionTemplate(templateId, section.id, "above");
                      }}
                    >
                    </div>
                    <div
                      className="builder-preview-section-insert builder-preview-section-insert--bottom"
                      data-builder-object-type="section"
                      data-builder-section-id={section.id}
                      onClick={(event) => event.stopPropagation()}
                      onMouseDown={(event) => event.stopPropagation()}
                      onDragStart={(event) => event.stopPropagation()}
                      onDragOver={(event) => {
                        if (
                          getBuilderTemplateDragType(
                            event.dataTransfer.types,
                          ) !== "section"
                        )
                          return;
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveDragOver({
                          type: "section",
                          sectionId: section.id,
                          placement: "below",
                        });
                        event.dataTransfer.dropEffect = "copy";
                      }}
                      onDrop={(event) => {
                        const templateId = event.dataTransfer.getData(
                          BUILDER_TEMPLATE_DND_TYPE,
                        );
                        if (!templateId) return;
                        event.preventDefault();
                        event.stopPropagation();
                        setActiveDragOver(null);
                        onDropSectionTemplate(templateId, section.id, "below");
                      }}
                    >
                    </div>
                    <PreviewSection
                      device={device}
                      section={section}
                      shellSettings={shellSettings}
                      previewProducts={previewProducts}
                      previewCategoryTree={previewCategoryTree}
                      previewCategoryCounts={previewCategoryCounts}
                      selectedLayoutColumnKey={null}
                      selectedLayoutRowIndex={null}
                      selectedSectionId=""
                      selectedLayoutBlockKey={null}
                      selectedTarget={null}
                      editingTarget={sectionEditingTarget}
                      hoverToolbarTarget={null}
                      hoveredTarget={null}
                      rowInsertRequest={
                        rowInsertRequest?.sectionId === section.id ? rowInsertRequest : null
                      }
                      onConsumeRowInsertRequest={consumeRowInsertRequest}
                      onHoverTarget={sectionCallbacks.onHoverTarget}
                      draggingLayoutBlockKey={draggingLayoutBlockKey}
                      activeDragOver={activeDragOver}
                      onCanvasDragOverChange={setActiveDragOver}
                      onSelectColumn={sectionCallbacks.onSelectColumn}
                      onSelectRow={sectionCallbacks.onSelectRow}
                      onSelectBlock={sectionCallbacks.onSelectBlock}
                      onOpenInspector={sectionCallbacks.onOpenInspector}
                      onBlockDragStart={sectionCallbacks.onBlockDragStart}
                      onBlockDragEnd={sectionCallbacks.onBlockDragEnd}
                      onMoveBlock={sectionCallbacks.onMoveBlock}
                      onCreateBlock={sectionCallbacks.onCreateBlock}
                      onDuplicateBlock={sectionCallbacks.onDuplicateBlock}
                      onDeleteBlock={sectionCallbacks.onDeleteBlock}
                      onUpdateBlock={sectionCallbacks.onUpdateBlock}
                      onUpdateGridItem={sectionCallbacks.onUpdateGridItem}
                      onDeleteGridItem={sectionCallbacks.onDeleteGridItem}
                      onDuplicateGridItem={sectionCallbacks.onDuplicateGridItem}
                      onMoveGridItem={sectionCallbacks.onMoveGridItem}
                      onMoveBadge={sectionCallbacks.onMoveBadge}
                      onMoveButton={sectionCallbacks.onMoveButton}
                      onMoveListItem={sectionCallbacks.onMoveListItem}
                      onDeleteBadge={sectionCallbacks.onDeleteBadge}
                      onDuplicateBadge={sectionCallbacks.onDuplicateBadge}
                      onDeleteButton={sectionCallbacks.onDeleteButton}
                      onDuplicateButton={sectionCallbacks.onDuplicateButton}
                      onDeleteListItem={sectionCallbacks.onDeleteListItem}
                      onDuplicateListItem={sectionCallbacks.onDuplicateListItem}
                      onDeleteSectionBadge={sectionCallbacks.onDeleteSectionBadge}
                      onDuplicateSectionBadge={sectionCallbacks.onDuplicateSectionBadge}
                      onMoveSectionBadge={sectionCallbacks.onMoveSectionBadge}
                      onUploadGridItemImage={sectionCallbacks.onUploadGridItemImage}
                      onUploadBlockImage={sectionCallbacks.onUploadBlockImage}
                      onAddRow={sectionCallbacks.onAddRow}
                      onAddColumnAfter={sectionCallbacks.onAddColumnAfter}
                      onStackColumnBelow={sectionCallbacks.onStackColumnBelow}
                      onAppendNestedRow={sectionCallbacks.onAppendNestedRow}
                      onDeleteNestedRow={sectionCallbacks.onDeleteNestedRow}
                      onUnwrapNestedColumn={sectionCallbacks.onUnwrapNestedColumn}
                      onDeleteRow={sectionCallbacks.onDeleteRow}
                      onDuplicateRow={sectionCallbacks.onDuplicateRow}
                      onMoveRow={sectionCallbacks.onMoveRow}
                      onSaveRowTemplate={sectionCallbacks.onSaveRowTemplate}
                      onSaveElementTemplate={sectionCallbacks.onSaveElementTemplate}
                      onMoveBlockWithinColumn={sectionCallbacks.onMoveBlockWithinColumn}
                      onDropRowTemplate={sectionCallbacks.onDropRowTemplate}
                      onDropElementTemplate={sectionCallbacks.onDropElementTemplate}
                      onOpenSpacingSettings={sectionCallbacks.onOpenSpacingSettings}
                      onOpenElementsPanel={sectionCallbacks.onOpenElementsPanel}
                      onChangeLayout={sectionCallbacks.onChangeSectionLayout}
                      spacingOverlayEnabled={spacingOverlayEnabled}
                    />
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
      {changeLayoutModal
        ? createPortal(changeLayoutModal, document.body)
        : null}
      <BuilderInteractionLayer
        canvasRef={canvasRef}
        externalInteractionRootRef={externalInteractionRootRef}
        hoverFrameRef={hoverFrameRef}
        hoverSuppressedByScrollRef={hoverSuppressedByScrollRef}
        sections={interactionSections ?? sections}
        selectedTarget={interactionSelectedTarget}
        editingTarget={editingTarget}
        onRequestAddRow={requestRowInsert}
        onAddSection={onAddSection}
        onSelectTarget={selectInteractionTarget}
        onSelect={onSelect}
        onSelectRow={onSelectRow}
        onSelectColumn={onSelectColumn}
        onSelectBlock={onSelectBlock}
        onOpenInspector={onOpenInspector}
        onMoveSection={onMoveSection}
        onDuplicateSection={onDuplicateSection}
        onDeleteSection={onDeleteSection}
        onSaveSectionTemplate={onSaveSectionTemplate}
        onChangeLayout={onChangeSectionLayout}
        onMoveRow={onMoveRow}
        onDuplicateRow={onDuplicateRow}
        onDeleteRow={onDeleteRow}
        onSaveRowTemplate={onSaveRowTemplate}
        onMoveBlockWithinColumn={onMoveBlockWithinColumn}
        onDuplicateBlock={onDuplicateBlock}
        onDeleteBlock={onDeleteBlock}
        onSaveElementTemplate={onSaveElementTemplate}
        onFollowLink={onFollowLink}
      />
      </div>
    </BuilderCarouselGeometryCoordinator>
  );
}

function previewDesignStyle(
  design: BuilderDesign,
  layoutScheme: "light" | "dark",
) {
  const colors = resolveDesignColors(design, layoutScheme);
  return {
    background: colors.pageBackground,
    color: "var(--uk-global-text-color, #111827)",
    "--builder-page-bg": colors.pageBackground,
    "--builder-preview-text": colors.textColor,
    "--builder-preview-muted": colors.mutedTextColor,
    "--builder-preview-accent": colors.accentColor,
    "--builder-preview-surface": colors.surfaceColor,
    "--builder-preview-button-bg": colors.buttonBackground,
    "--builder-preview-button-text": colors.buttonTextColor,
    "--builder-text": "var(--uk-global-text-color, #111827)",
    "--builder-muted": "var(--uk-global-muted-text-color, #6b7280)",
    "--builder-accent": colors.accentColor,
    "--builder-surface": colors.surfaceColor,
    "--builder-button-bg": colors.buttonBackground,
    "--builder-button-text": colors.buttonTextColor,
    "--builder-max-width": design.sectionMaxWidth,
    "--builder-gutter": design.sectionGutter,
    "--builder-preview-radius": design.radius,
    "--builder-radius": design.radius,
    "--builder-heading-font-family": design.headingFontFamily,
    "--builder-heading-size": design.headingSize,
    "--builder-heading-weight": design.headingWeight,
    "--builder-heading-line-height": design.headingLineHeight,
    "--builder-heading-color": "var(--builder-active-heading, var(--uk-global-emphasis-color, var(--uk-global-text-color, #111827)))",
    "--builder-card-bg": design.cardBg,
    "--builder-card-radius": design.cardRadius,
    "--builder-card-border": design.cardBorder,
    "--builder-card-shadow": design.cardShadow,
    "--builder-card-shadow-hover": design.cardShadowHover,
    "--builder-card-image-bg": design.cardImageBg,
    "--builder-card-image-padding": design.cardImagePadding,
  } as CSSProperties;
}

function getPreviewSpacing(value: SectionSpacing | undefined) {
  if (!value || value === "inherit") return undefined;
  return resolveBuilderSpacing(value, "sectionPadding").css;
}

function getPreviewSectionMargin(value: SectionSpacing | undefined) {
  if (!value || value === "inherit") return undefined;
  return resolveBuilderSpacing(value, "sectionMargin").css;
}

function getPreviewElementSpacing(
  value: string | undefined,
  context: "elementPadding" | "elementMargin",
) {
  return resolveBuilderSpacing(value, context).css;
}

function getPreviewRowSpacing(
  value: string | undefined,
  context: "rowPadding" | "rowMargin" | "rowGap",
) {
  return resolveBuilderSpacing(value, context).css;
}

const PREVIEW_CANVAS_DEFAULTS: Record<string, string> = {
  "--builder-global-section-padding-top": "64px",
  "--builder-global-section-padding-bottom": "64px",
  "--builder-global-section-margin-top": "0px",
  "--builder-global-section-margin-bottom": "0px",
  "--builder-global-row-padding-top": "0px",
  "--builder-global-row-padding-bottom": "0px",
  "--builder-global-row-margin-top": "0px",
  "--builder-global-row-margin-bottom": "0px",
  "--builder-global-row-gap": "32px",
  "--builder-global-column-gap": "32px",
  "--builder-global-element-padding-top": "8px",
  "--builder-global-element-padding-right": "8px",
  "--builder-global-element-padding-bottom": "8px",
  "--builder-global-element-padding-left": "8px",
  "--builder-global-element-margin-top": "0px",
  "--builder-global-element-margin-right": "0px",
  "--builder-global-element-margin-bottom": "0px",
  "--builder-global-element-margin-left": "0px",
  "--button-bg": "#111111",
  "--button-text-color": "#ffffff",
  "--button-radius": "999px",
  "--button-border-width": "0px",
  "--button-border-color": "transparent",
  "--button-padding-y": "11px",
  "--button-padding-x": "18px",
  "--button-font-weight": "720",
  "--button-letter-spacing": "0px",
  "--button-hover-bg": "#111111",
  "--button-hover-text-color": "#ffffff",
  "--button-hover-border-color": "transparent",
  "--button-hover-transform": "translateY(-2px)",
  "--button-hover-shadow": "0 16px 34px rgba(17, 17, 17, 0.16)",
};

function omitPreviewCanvasDefaults(style: CSSProperties): CSSProperties {
  const filtered = Object.entries(style).filter(([name, value]) => {
    const defaultValue = PREVIEW_CANVAS_DEFAULTS[name];
    if (defaultValue === undefined || value === undefined || value === null) {
      return true;
    }
    return String(value).trim().toLowerCase() !== defaultValue.toLowerCase();
  });
  return Object.fromEntries(filtered) as CSSProperties;
}

function GlobalSpacingControl({
  label,
  sides,
  values,
  context,
  onChange,
}: {
  label: string;
  sides: string[];
  values: Record<string, string | undefined>;
  context: BuilderSpacingContext;
  onChange: (newValues: Record<string, string | undefined>) => void;
}) {
  const presets: { label: string; value: string }[] = [
    { label: "None", value: "none" },
    { label: "XS", value: "xs" },
    { label: "S", value: "sm" },
    { label: "M", value: "md" },
    { label: "L", value: "lg" },
    { label: "XL", value: "xl" },
    { label: "2XL", value: "2xl" },
    { label: "3XL", value: "3xl" },
  ];

  const isAllSidesEqual = () => {
    if (sides.length <= 1) return true;
    const firstVal = values[sides[0]];
    return sides.every((side) => values[side] === firstVal);
  };

  const [linked, setLinked] = useState(() => isAllSidesEqual());

  const valuesString = JSON.stringify(values);
  useEffect(() => {
    setLinked(isAllSidesEqual());
  }, [valuesString]);

  const setSideValue = (side: string, next: string) => {
    if (linked && sides.length > 1) {
      const updated: Record<string, string> = {};
      sides.forEach((s) => {
        updated[s] = next;
      });
      onChange(updated);
    } else {
      onChange({ [side]: next });
    }
  };

  const renderSideControl = (side: string, sideLabel: string) => {
    const val = values[side];
    const isPresetToken = (v?: string) => {
      if (!v) return true;
      return presets.some(
        (p) =>
          p.value === v ||
          (v === "small" && p.value === "sm") ||
          (v === "medium" && p.value === "md") ||
          (v === "large" && p.value === "lg"),
      );
    };

    const isPreset = isPresetToken(val);
    const isCustom = !isPreset;

    const numericMatch = val ? val.trim().match(/^(\d+)px$/i) : null;
    const customNumericValue = numericMatch ? numericMatch[1] : "";

    const handleCustomNumericChange = (
      event: React.ChangeEvent<HTMLInputElement>,
    ) => {
      const num = event.target.value.replace(/\D/g, "");
      setSideValue(side, num ? `${num}px` : "0px");
    };

    const defaultVal = getDefaultSpacingToken(context);
    let selectValue: string = defaultVal;
    if (isCustom) {
      selectValue = "custom";
    } else if (val) {
      if (val === "small") selectValue = "sm";
      else if (val === "medium") selectValue = "md";
      else if (val === "large") selectValue = "lg";
      else selectValue = val;
    } else {
      selectValue = defaultVal;
    }

    const handleChipClick = (presetValue: string) => {
      if (presetValue === "custom") {
        const currentPx = resolveBuilderSpacing(val ?? defaultVal, context).px;
        setSideValue(side, `${currentPx > 0 ? currentPx : 32}px`);
      } else {
        setSideValue(side, presetValue);
      }
    };

    return (
      <div key={side} className="builder-style-side-control-chips-wrapper">
        <span className="builder-style-side-label">{sideLabel}</span>
        <div className="builder-style-chips-row">
          {presets.map((preset) => {
            const isSelected = selectValue === preset.value;
            const px =
              BUILDER_SPACING_SCALE[
                preset.value as keyof typeof BUILDER_SPACING_SCALE
              ];
            const displayLabel = `${preset.label} ${px}px`;
            return (
              <button
                key={preset.value}
                type="button"
                className={`builder-style-chip${isSelected ? " is-active" : ""}`}
                onClick={() => handleChipClick(preset.value)}
              >
                {displayLabel}
              </button>
            );
          })}
          <button
            type="button"
            className={`builder-style-chip builder-style-chip--custom${selectValue === "custom" ? " is-active" : ""}`}
            onClick={() => handleChipClick("custom")}
          >
            <Sliders size={11} style={{ marginRight: "4px" }} />
            Custom
          </button>
          {isCustom && (
            <div className="custom-spacing-input-wrapper">
              <input
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={customNumericValue}
                onChange={handleCustomNumericChange}
                placeholder="0"
              />
              <span className="custom-spacing-unit">px</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const showLinkCheckbox = sides.length > 1;

  return (
    <div className="builder-style-spacing">
      <div className="builder-style-spacing-header">
        <strong>{label}</strong>
        {showLinkCheckbox && (
          <label className="builder-check builder-style-link-toggle">
            <input
              type="checkbox"
              checked={linked}
              onChange={(event) => {
                const nextLinked = event.target.checked;
                setLinked(nextLinked);
                if (nextLinked) {
                  const firstVal =
                    values[sides[0]] ?? getDefaultSpacingToken(context);
                  const updated: Record<string, string> = {};
                  sides.forEach((s) => {
                    updated[s] = firstVal;
                  });
                  onChange(updated);
                }
              }}
            />
            <span>Link sides</span>
          </label>
        )}
      </div>
      <div className="builder-style-side-controls">
        {linked && sides.length > 1
          ? renderSideControl(sides[0], "ALL SIDES")
          : sides.map((side) => renderSideControl(side, side.toUpperCase()))}
      </div>
    </div>
  );
}

function getStorefrontPreviewClass(section: BuilderSection) {
  const kindClass =
    section.kind === "hero"
      ? "shop-builder-hero"
      : section.kind === "productArchive"
        ? "shop-builder-products"
        : section.kind === "filters"
          ? "shop-builder-filters"
          : section.kind === "promo"
            ? `shop-builder-promo shop-builder-promo--${
                section.promoVariant ?? "default"
              }`
            : section.kind === "badgeGrid"
              ? "shop-builder-badge-grid"
              : isLayoutContainerSection(section)
                ? "shop-builder-content-layout"
                : section.kind === "slider"
                  ? "shop-builder-slider"
                  : section.kind === "scrollPinnedDemo"
                    ? "shop-builder-scroll-pinned"
                    : section.kind === "embed"
                      ? "shop-builder-embed"
                      : "";

  return kindClass;
}

type PreviewLayoutItem = NonNullable<BuilderSection["layoutItems"]>[number];

function getPreviewGoodieIcon(block: BuilderLayoutBlock) {
  return <WebPagesIcon name={block.iconName} size={block.iconSize ?? block.listIconSize ?? 28} />;
}

function getLayoutBlockLibraryIcon(kind: LayoutBlockKind) {
  return <ElementLibraryIcon kind={kind} />;
}

function PreviewProductGallery({
  product,
  block,
}: {
  product: ReturnType<typeof getPreviewProductModel>;
  block?: BuilderLayoutBlock;
}) {
  return (
    <div
      className={`builder-preview-real-product-gallery is-thumbs-${
        block?.galleryThumbnailPosition ?? "bottom"
      }`}
      style={
        {
          "--builder-preview-gallery-height": `${block?.galleryHeight ?? 420}px`,
          "--builder-preview-gallery-fit": block?.galleryImageFit ?? "contain",
        } as CSSProperties
      }
    >
      <div className="product-gallery-main">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.imageAlt}
            width={620}
            height={720}
          />
        ) : (
          <div className="product-image-placeholder">No image</div>
        )}
      </div>
      {block?.galleryShowThumbnails !== false && (
        <div className="builder-preview-product-thumbs">
          <span className="is-active" />
          <span />
        </div>
      )}
    </div>
  );
}

function PreviewProductAttributes({
  product,
}: {
  product: ReturnType<typeof getPreviewProductModel>;
}) {
  return (
    <div className="shop-builder-product-attributes">
      <strong>Product Details</strong>
      <ul>
        {product.attributes.map((attribute) => (
          <li key={attribute.name}>
            <span>{attribute.label}</span>
            <em>{attribute.options.join(", ")}</em>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewProductBlockContent({
  block,
  product,
}: {
  block: BuilderLayoutBlock;
  product: ReturnType<typeof getPreviewProductModel>;
}) {
  if (block.kind === "productGallery") {
    return <PreviewProductGallery product={product} block={block} />;
  }

  if (block.kind === "productTitle") {
    return (
      <div className="product-header-row builder-preview-product-title-row">
        <DashboardTypog as="h3" typography={block.typography}>
          {product.name}
        </DashboardTypog>
        <span aria-hidden="true">♡</span>
      </div>
    );
  }

  if (block.kind === "productPrice") {
    return (
      <div className="shop-builder-product-price">{product.priceFormatted}</div>
    );
  }

  if (block.kind === "productAddToCart") {
    return (
      <ProductOptionsSelector
        id={product.id}
        slug={product.slug}
        name={product.name}
        priceNumber={product.priceNumber}
        imageUrl={product.imageUrl}
        attributes={product.attributes}
        previewMode
      />
    );
  }

  if (block.kind === "productAttributes") {
    return <PreviewProductAttributes product={product} />;
  }

  if (block.kind === "productDescription") {
    return (
      <DashboardTypog
        as="p"
        className="shop-builder-product-description"
        typography={block.typography}
      >
        {product.description}
      </DashboardTypog>
    );
  }

  if (block.kind === "productHero") {
    return (
      <div className="shop-builder-premium-product-hero builder-preview-product-hero">
        <PreviewProductGallery product={product} />
        <div className="shop-builder-premium-product-copy">
          <span>Featured Product</span>
          <DashboardTypog as="h3" typography={block.typography}>
            {product.name}
          </DashboardTypog>
          <div className="shop-builder-product-price">
            {product.priceFormatted}
          </div>
          <DashboardTypog
            as="p"
            className="shop-builder-product-description"
            typography={block.typography}
          >
            {product.description}
          </DashboardTypog>
          <ProductOptionsSelector
            id={product.id}
            slug={product.slug}
            name={product.name}
            priceNumber={product.priceNumber}
            imageUrl={product.imageUrl}
            attributes={product.attributes}
            previewMode
          />
        </div>
      </div>
    );
  }

  if (block.kind === "productInfoStack") {
    return (
      <div className="shop-builder-product-info-stack">
        <DashboardTypog as="h3" typography={block.typography}>
          {product.name}
        </DashboardTypog>
        <div className="shop-builder-product-price">
          {product.priceFormatted}
        </div>
        <DashboardTypog
          as="p"
          className="shop-builder-product-description"
          typography={block.typography}
        >
          {product.description}
        </DashboardTypog>
        <ProductOptionsSelector
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceNumber={product.priceNumber}
          imageUrl={product.imageUrl}
          attributes={product.attributes}
          previewMode
        />
      </div>
    );
  }

  if (block.kind === "productPurchasePanel") {
    return (
      <div className="shop-builder-product-purchase-panel">
        <span>Ready to order</span>
        <DashboardTypog as="h3" typography={block.typography}>
          {product.name}
        </DashboardTypog>
        <div className="shop-builder-product-price">
          {product.priceFormatted}
        </div>
        <ProductOptionsSelector
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceNumber={product.priceNumber}
          imageUrl={product.imageUrl}
          attributes={product.attributes}
          previewMode
        />
      </div>
    );
  }

  if (block.kind === "productSpecsPanel") {
    return (
      <div className="shop-builder-product-specs-panel">
        <span>Specifications</span>
        <PreviewProductAttributes product={product} />
      </div>
    );
  }

  return null;
}

function InlineEditableText({
  as: Tag,
  area,
  value,
  className,
  onChange,
  typography,
  style,
}: {
  as: "span" | "em" | "strong" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div";
  area?: TypographyArea;
  value: string;
  className?: string;
  onChange: (value: string) => void;
  typography?: any;
  style?: React.CSSProperties;
}) {
  const resolvedArea = area ?? inferTypographyArea(Tag, className);
  const supportsLineBreaks = resolvedArea === "title";
  const displayValue = supportsLineBreaks
    ? normalizeBuilderLineBreaks(value)
    : value;
  const isRich = isRichPreviewText(displayValue);
  const stopInlineEvent = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const handleBlur = (event: ReactFocusEvent<HTMLElement>) => {
    const nextValue = isRich
      ? event.currentTarget.innerHTML.trim()
      : (event.currentTarget.innerText?.trim() ?? "");
    if (nextValue !== value) onChange(nextValue);
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" && Tag !== "p" && !supportsLineBreaks) {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (isRich) {
        event.currentTarget.innerHTML = displayValue;
      } else {
        event.currentTarget.innerText = displayValue;
      }
      event.currentTarget.blur();
    }
  };

  return (
    <DashboardTypog
      as={Tag}
      area={resolvedArea}
      typography={typography}
      className={["builder-inline-editable", className].filter(Boolean).join(" ")}
      style={{
        ...style,
        ...(supportsLineBreaks ? { whiteSpace: "pre-line" } : {}),
      }}
      contentEditable
      suppressContentEditableWarning
      onClick={stopInlineEvent}
      onMouseDown={stopInlineEvent}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {displayValue}
    </DashboardTypog>
  );
}

function RowInsertControl({
  placement,
  owner,
  onTemplateDrop,
}: {
  placement: "after";
  owner: BuilderInteractionTarget;
  onTemplateDrop?: (templateId: string) => void;
}) {
  const [templateDragOver, setTemplateDragOver] = useState(false);

  return (
    <div
      className={`${builderInsertionBoundaryClassName(owner)} builder-preview-row-insert builder-preview-row-insert--${placement}${
        templateDragOver ? " is-template-drag-over" : ""
      }`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.stopPropagation()}
      onDragEnter={(event) => {
        if (getBuilderTemplateDragType(event.dataTransfer.types) !== "row")
          return;
        event.preventDefault();
        event.stopPropagation();
        setTemplateDragOver(true);
      }}
      onDragLeave={() => setTemplateDragOver(false)}
      onDragOver={(event) => {
        if (getBuilderTemplateDragType(event.dataTransfer.types) !== "row")
          return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        const templateId = event.dataTransfer.getData(
          BUILDER_TEMPLATE_DND_TYPE,
        );
        if (!templateId || !onTemplateDrop) return;
        event.preventDefault();
        event.stopPropagation();
        setTemplateDragOver(false);
        onTemplateDrop(templateId);
      }}
    >
    </div>
  );
}

/**
 * BuilderContextToolbar — single unified floating pill for Section and Layout contexts.
 * Section context  → label + Settings | Move Up/Down | Save | Duplicate | Delete
 * Layout context   → label + [Change Layout] | sep | Settings | Move Up/Down | Save | Duplicate | Delete
 * Column context   → no floating toolbar (outline only).
 */
function BuilderContextToolbar({
  context,
  label,
  canMoveUp,
  canMoveDown,
  canDelete,
  onChangeLayout,
  onSelect,
  onSettings,
  onBackToPage,
  onMoveUp,
  onMoveDown,
  onSave,
  onDuplicate,
  onDelete,
}: {
  context: "section" | "layout" | "shell";
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;
  onChangeLayout?: () => void;
  onSelect?: () => void;
  onSettings: () => void;
  onBackToPage?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onSave?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
}) {
  const cls =
    context === "section" || context === "shell"
      ? "builder-context-toolbar builder-preview-section-tools-main"
      : "builder-context-toolbar builder-preview-row-toolbar";

  if (context === "shell") {
    return (
      <div
        className={`${cls} builder-shell-toolbar`}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button type="button" className="builder-shell-toolbar-label" onClick={onSelect}>
          {label}
        </button>
        <button
          type="button"
          onClick={onSettings}
          aria-label={`${label} settings`}
          title={`${label} settings`}
        >
          <Pencil size={13} />
        </button>
        {onBackToPage ? (
          <button
            type="button"
            onClick={onBackToPage}
            aria-label="Back to Page"
            title="Back to Page"
          >
            <ArrowLeft size={13} />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={cls}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.stopPropagation()}
    >
      <span>{label}</span>
      {context === "layout" && onChangeLayout && (
        <>
          <button
            type="button"
            className="builder-context-toolbar-change-layout"
            onClick={onChangeLayout}
            aria-label="Change layout composition"
            title="Change layout composition"
          >
            <Layers3 size={13} />
          </button>
          <span className="builder-context-toolbar-sep" aria-hidden="true" />
        </>
      )}
      <button
        type="button"
        onClick={onSettings}
        aria-label={context === "section" ? "Section settings" : "Layout settings"}
        title={context === "section" ? "Section settings" : "Layout settings"}
      >
        <Pencil size={13} />
      </button>
      <button type="button" onClick={onMoveUp} disabled={!canMoveUp}
        aria-label={context === "section" ? "Move section up" : "Move layout up"}
        title={context === "section" ? "Move section up" : "Move layout up"}
      >
        <ArrowUp size={13} />
      </button>
      <button type="button" onClick={onMoveDown} disabled={!canMoveDown}
        aria-label={context === "section" ? "Move section down" : "Move layout down"}
        title={context === "section" ? "Move section down" : "Move layout down"}
      >
        <ArrowDown size={13} />
      </button>
      <button type="button" onClick={onSave}
        aria-label={context === "section" ? "Save section as template" : "Save layout as template"}
        title={context === "section" ? "Save section as template" : "Save layout as template"}
      >
        <Save size={13} />
      </button>
      <button type="button" onClick={onDuplicate}
        aria-label={context === "section" ? "Duplicate section" : "Duplicate layout"}
        title={context === "section" ? "Duplicate section" : "Duplicate layout"}
      >
        <Copy size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete}
        aria-label={
          context === "layout" && !canDelete
            ? "Layout must be empty before deleting"
            : context === "section" ? "Delete section" : "Delete layout"
        }
        title={
          context === "layout" && !canDelete
            ? "Delete is available for empty layouts"
            : context === "section" ? "Delete section" : "Delete empty layout"
        }
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}



function BuilderElementToolbar({
  label,
  canMoveUp,
  canMoveDown,
  onSettings,
  onMoveUp,
  onMoveDown,
  onSave,
  onDuplicate,
  onDelete,
  linkHref,
  onFollowLink,
}: {
  label: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onSettings: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  linkHref?: string | null;
  onFollowLink?: () => void;
}) {
  return (
    <div
      className="builder-preview-block-tools"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.stopPropagation()}
    >
      <span>{label}</span>
      <button type="button" onClick={onSettings} title="Edit element">
        <Settings2 size={13} />
      </button>
      <button type="button" onClick={onMoveUp} disabled={!canMoveUp} title="Move element up">
        <ArrowUp size={13} />
      </button>
      <button type="button" onClick={onMoveDown} disabled={!canMoveDown} title="Move element down">
        <ArrowDown size={13} />
      </button>
      <button type="button" onClick={onSave} title="Save element as template">
        <Save size={13} />
      </button>
      <button type="button" onClick={onDuplicate} title="Duplicate element">
        <Copy size={13} />
      </button>
      <button type="button" onClick={onDelete} title="Delete element">
        <Trash2 size={13} />
      </button>
      <button type="button" onClick={() => onFollowLink?.()} disabled={!linkHref || !onFollowLink} title="Follow link" aria-label="Follow link">
        <ExternalLink size={13} />
      </button>
    </div>
  );
}

function IframeBuilderInteractionLayer({
  target,
  rect,
  sections,
  onSelectTarget,
  onOpenInspector,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onMoveRow,
  onDuplicateRow,
  onDeleteRow,
  onMoveBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onSaveSection,
  onSaveRow,
  onSaveBlock,
  onAddSection,
  onAddRow,
  onAddBlock,
}: {
  target: BuilderInteractionTarget | null;
  rect: BuilderInteractionLayerRect | null;
  sections: BuilderSection[];
  onSelectTarget: (target: BuilderInteractionTarget, openInspector?: boolean) => void;
  onOpenInspector: () => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onMoveRow: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  onDuplicateRow: (sectionId: string, rowIndex: number) => void;
  onDeleteRow: (sectionId: string, rowIndex: number) => void;
  onMoveBlock: (payload: { sectionId: string; columnKey: string; blockKey: string; direction: -1 | 1 }) => void;
  onDuplicateBlock: (payload: { sectionId: string; columnKey: string; blockKey: string }) => void;
  onDeleteBlock: (payload: { sectionId: string; columnKey: string; blockKey: string }) => void;
  onSaveSection: (sectionId: string) => void;
  onSaveRow: (sectionId: string, rowIndex: number) => void;
  onSaveBlock: (sectionId: string, columnKey: string, blockKey: string) => void;
  onAddSection: (sectionId: string) => void;
  onAddRow: (sectionId: string, rowIndex: number) => void;
  onAddBlock: () => void;
}) {
  if (!target || !rect || typeof document === "undefined") return null;
  const section = sections.find((candidate) => candidate.id === target.sectionId);
  if (!section) return null;
  const rows = resolveBuilderSectionStructure(section).rows;
  const rowIndex = target.type === "row"
    ? target.rowIndex
    : target.type === "column" || target.type === "block"
      ? rows.findIndex((row) => row.columns.some((column) => column.column.id === target.columnKey))
      : -1;
  const toolbarTop = Math.min(rect.top + rect.height + 8, window.innerHeight - 58);
  const toolbarLeft = Math.min(Math.max(rect.left + rect.width / 2, 210), window.innerWidth - 210);
  let actions: ReactNode = null;
  if (target.type === "section") {
    const index = sections.findIndex((candidate) => candidate.id === target.sectionId);
    actions = <BuilderContextToolbar context="section" label={sectionLabels[section.kind] ?? "Section"}
      canMoveUp={index > 0} canMoveDown={index < sections.length - 1} canDelete
      onSettings={() => { onSelectTarget(target, true); onOpenInspector(); }}
      onMoveUp={() => onMoveSection(target.sectionId, -1)} onMoveDown={() => onMoveSection(target.sectionId, 1)}
      onSave={() => onSaveSection(target.sectionId)} onDuplicate={() => onDuplicateSection(target.sectionId)} onDelete={() => onDeleteSection(target.sectionId)} />;
  } else if (target.type === "row") {
    const row = rows[target.rowIndex];
    const empty = Boolean(row?.columns.every((column) => column.column.elements.length === 0));
    actions = <BuilderContextToolbar context="layout" label={`Row ${target.rowIndex + 1}`}
      canMoveUp={target.rowIndex > 0} canMoveDown={target.rowIndex < rows.length - 1} canDelete={empty}
      onSettings={() => { onSelectTarget(target, true); onOpenInspector(); }}
      onMoveUp={() => onMoveRow(target.sectionId, target.rowIndex, -1)} onMoveDown={() => onMoveRow(target.sectionId, target.rowIndex, 1)}
      onSave={() => onSaveRow(target.sectionId, target.rowIndex)} onDuplicate={() => onDuplicateRow(target.sectionId, target.rowIndex)} onDelete={() => onDeleteRow(target.sectionId, target.rowIndex)} />;
  } else if (target.type === "column") {
    actions = <BuilderContextToolbar context="layout" label="Column" canMoveUp={false} canMoveDown={false} canDelete={false}
      onSettings={() => { onSelectTarget(target, true); onOpenInspector(); }} />;
  } else {
    const column = findLayoutColumn(section, target.columnKey);
    const blocks = column?.blocks ?? [];
    const blockIndex = blocks.findIndex((block, index) => (block.id ?? `${target.columnKey}-block-${index}`) === target.blockKey);
    const block = blocks[blockIndex];
    actions = <BuilderElementToolbar label={layoutBlockLabels[block?.kind ?? "text"] ?? "Block"}
      canMoveUp={blockIndex > 0} canMoveDown={blockIndex >= 0 && blockIndex < blocks.length - 1}
      onSettings={() => { onSelectTarget(target, true); onOpenInspector(); }}
      onMoveUp={() => onMoveBlock({ ...target, direction: -1 })} onMoveDown={() => onMoveBlock({ ...target, direction: 1 })}
      onSave={() => onSaveBlock(target.sectionId, target.columnKey, target.blockKey)} onDuplicate={() => onDuplicateBlock(target)} onDelete={() => onDeleteBlock(target)} />;
  }
  return createPortal(<>
    <div className={`builder-shared-interaction-frame is-selected is-${target.type}`} style={{ position: "fixed", left: rect.left, top: rect.top, width: rect.width, height: rect.height }} />
    <div className={`builder-fixed-selection-toolbar is-anchored${target.type === "block" ? " is-element" : ""}`}
      role="toolbar" aria-label="Selected iframe Builder object"
      style={{ position: "fixed", left: toolbarLeft, top: toolbarTop, right: "auto", bottom: "auto" }}>
      <nav className="builder-fixed-selection-breadcrumb" aria-label="Builder object hierarchy">
        <button type="button" onClick={() => onSelectTarget({ type: "section", sectionId: target.sectionId })}>Section</button>
        {rowIndex >= 0 ? <button type="button" onClick={() => onSelectTarget({ type: "row", sectionId: target.sectionId, rowIndex })}>Row {rowIndex + 1}</button> : null}
        {target.type === "column" || target.type === "block" ? <button type="button" onClick={() => onSelectTarget({ type: "column", sectionId: target.sectionId, columnKey: target.columnKey })}>Column</button> : null}
      </nav>
      <div className="builder-fixed-selection-actions">{actions}</div>
      <div className="builder-fixed-add-control">
        <button type="button" onClick={() => onAddSection(target.sectionId)}><Plus size={13} /> Section</button>
        {rowIndex >= 0 ? <button type="button" onClick={() => onAddRow(target.sectionId, rowIndex)}><Plus size={13} /> Row</button> : null}
        <button type="button" onClick={onAddBlock}><Plus size={13} /> Block</button>
      </div>
    </div>
  </>, document.body);
}

type BuilderInteractionLayerRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

function BuilderInteractionLayer({
  canvasRef,
  externalInteractionRootRef,
  hoverFrameRef,
  hoverSuppressedByScrollRef,
  sections,
  selectedTarget,
  editingTarget,
  onRequestAddRow,
  onAddSection,
  onSelectTarget,
  onSelect,
  onSelectRow,
  onSelectColumn,
  onSelectBlock,
  onOpenInspector,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onSaveSectionTemplate,
  onChangeLayout,
  onMoveRow,
  onDuplicateRow,
  onDeleteRow,
  onSaveRowTemplate,
  onMoveBlockWithinColumn,
  onDuplicateBlock,
  onDeleteBlock,
  onSaveElementTemplate,
  onFollowLink,
}: {
  canvasRef: { current: HTMLDivElement | null };
  externalInteractionRootRef?: { current: HTMLDivElement | null };
  hoverFrameRef: { current: HTMLDivElement | null };
  hoverSuppressedByScrollRef: { current: boolean };
  sections: BuilderSection[];
  selectedTarget: BuilderInteractionTarget | null;
  editingTarget: BuilderInteractionTarget | null;
  onRequestAddRow: (sectionId: string, rowIndex: number) => void;
  onAddSection: (targetSectionId: string, placement: "above" | "below") => void;
  onSelectTarget: (target: BuilderInteractionTarget) => void;
  onSelect: (sectionId: string) => void;
  onSelectRow: (sectionId: string, rowIndex: number) => void;
  onSelectColumn: (sectionId: string, columnKey: string) => void;
  onSelectBlock: (sectionId: string, columnKey: string, blockKey: string) => void;
  onOpenInspector: () => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onSaveSectionTemplate: (sectionId: string) => void;
  onChangeLayout: (sectionId: string, rowIndex: number) => void;
  onMoveRow: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  onDuplicateRow: (sectionId: string, rowIndex: number) => void;
  onDeleteRow: (sectionId: string, rowIndex: number) => void;
  onSaveRowTemplate: (sectionId: string, rowIndex: number) => void;
  onMoveBlockWithinColumn: (payload: { sectionId: string; columnKey: string; blockKey: string; direction: -1 | 1 }) => void;
  onDuplicateBlock: (payload: { sectionId: string; columnKey: string; blockKey: string }) => void;
  onDeleteBlock: (payload: { sectionId: string; columnKey: string; blockKey: string }) => void;
  onSaveElementTemplate: (sectionId: string, columnKey: string, blockKey: string) => void;
  onFollowLink: (href: string) => void;
}) {
  const selectedVisualTarget = editingTarget ?? selectedTarget;
  // This layer is portaled to document.body. Keep its first client render
  // identical to SSR, then attach the portal after hydration.
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);
  const [selectedRect, setSelectedRect] =
    useState<BuilderInteractionLayerRect | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const selectedFrameRef = useRef<HTMLDivElement>(null);
  const selectedToolbarRef = useRef<HTMLDivElement>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [previousSelection, setPreviousSelection] =
    useState<BuilderInteractionTarget | null>(null);
  const lastSelectionRef = useRef<BuilderInteractionTarget | null>(null);
  const draggableElementRef = useRef<HTMLElement | null>(null);
  const draggableScanInitializedRef = useRef(false);
  const interactionRoots = useCallback(
    () => [canvasRef.current, externalInteractionRootRef?.current].filter(
      (root): root is HTMLDivElement => Boolean(root),
    ),
    [canvasRef, externalInteractionRootRef],
  );
  const findInteractionElement = useCallback(
    (target: BuilderInteractionTarget | null) => {
      if (!target) return null;
      const sectionId = CSS.escape(target.sectionId);
      const selector = target.type === "section"
        ? `[data-builder-object-type="section"][data-builder-section-id="${sectionId}"]`
        : target.type === "row"
          ? `[data-builder-object-type="row"][data-builder-section-id="${sectionId}"][data-builder-row-index="${target.rowIndex}"]`
          : target.type === "column"
            ? `[data-builder-object-type="column"][data-builder-section-id="${sectionId}"][data-builder-column-key="${CSS.escape(target.columnKey)}"]`
            : `[data-builder-object-type="block"][data-builder-section-id="${sectionId}"][data-builder-column-key="${CSS.escape(target.columnKey)}"][data-builder-block-key="${CSS.escape(target.blockKey)}"]`;
      for (const root of interactionRoots()) {
        const element = root.querySelector<HTMLElement>(selector);
        if (element) return element;
      }
      return null;
    },
    [interactionRoots],
  );
  useEffect(() => setAddMenuOpen(false), [selectedVisualTarget]);
  useEffect(() => {
    const previous = lastSelectionRef.current;
    if (
      selectedVisualTarget &&
      previous &&
      !builderTargetsEqual(previous, selectedVisualTarget)
    ) {
      setPreviousSelection(previous);
    }
    lastSelectionRef.current = selectedVisualTarget;
  }, [selectedVisualTarget]);
  useEffect(() => {
    const root = externalInteractionRootRef?.current;
    if (!root) return;
    const updateHover = (target: BuilderInteractionTarget | null) => {
      const frame = hoverFrameRef.current;
      const element = findInteractionElement(target);
      if (!frame || !target || !element) {
        if (frame) frame.style.display = "none";
        return;
      }
      const rect = element.getBoundingClientRect();
      frame.className = `builder-shared-interaction-frame is-hovered is-${target.type}`;
      frame.style.display = "block";
      frame.style.left = `${rect.left}px`;
      frame.style.top = `${rect.top}px`;
      frame.style.width = `${rect.width}px`;
      frame.style.height = `${rect.height}px`;
    };
    const handlePointerOver = (event: MouseEvent) => {
      const target = builderTargetFromElement(event.target instanceof Element ? event.target : null);
      const previous = builderTargetFromElement(
        event.relatedTarget instanceof Element ? event.relatedTarget : null,
      );
      if (!builderTargetsEqual(target, previous)) updateHover(target);
    };
    const handlePointerOut = (event: MouseEvent) => {
      const current = builderTargetFromElement(event.target instanceof Element ? event.target : null);
      const next = builderTargetFromElement(
        event.relatedTarget instanceof Element ? event.relatedTarget : null,
      );
      if (!builderTargetsEqual(current, next)) updateHover(next);
    };
    const handleClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      if (resolveBuilderOpenLinkIntent(event.target)) return;
      const target = builderTargetFromElement(event.target);
      if (!target) return;
      updateHover(null);
      onSelectTarget(target);
      onOpenInspector();
    };
    root.addEventListener("mouseover", handlePointerOver);
    root.addEventListener("mouseout", handlePointerOut);
    root.addEventListener("click", handleClick);
    return () => {
      root.removeEventListener("mouseover", handlePointerOver);
      root.removeEventListener("mouseout", handlePointerOut);
      root.removeEventListener("click", handleClick);
    };
  }, [externalInteractionRootRef, findInteractionElement, hoverFrameRef, onOpenInspector, onSelectTarget]);
  const selectedHierarchy = useMemo(() => {
    if (!selectedVisualTarget) return null;
    const section = sections.find(
      (candidate) => candidate.id === selectedVisualTarget.sectionId,
    );
    if (!section) return null;
    const columnKey = selectedVisualTarget.type === "column" || selectedVisualTarget.type === "block"
      ? selectedVisualTarget.columnKey
      : null;
    let rowIndex = selectedVisualTarget.type === "row"
      ? selectedVisualTarget.rowIndex
      : -1;
    if (rowIndex < 0 && columnKey) {
      const structure = resolveBuilderSectionStructure(section);
      rowIndex = structure.rows.findIndex((row) =>
        row.columns.some((column) => column.column.id === columnKey),
      );
    }
    return { section, columnKey, rowIndex };
  }, [sections, selectedVisualTarget]);

  useLayoutEffect(() => {
    const roots = interactionRoots();
    if (roots.length === 0) return;
    const selectedElement = findInteractionElement(selectedVisualTarget);
    if (!draggableScanInitializedRef.current) {
      for (const root of roots) {
        for (const owner of root.querySelectorAll<HTMLElement>(
          '[draggable], [data-builder-object-type="section"], [data-builder-object-type="block"]',
        )) {
          owner.draggable = false;
        }
      }
      draggableScanInitializedRef.current = true;
    } else if (draggableElementRef.current && draggableElementRef.current !== selectedElement) {
      draggableElementRef.current.draggable = false;
    }
    if (
      selectedElement &&
      (selectedVisualTarget?.type === "section" || selectedVisualTarget?.type === "block")
    ) {
      selectedElement.draggable = true;
      draggableElementRef.current = selectedElement;
    } else {
      draggableElementRef.current = null;
    }
    const readRect = (element: HTMLElement | null): BuilderInteractionLayerRect | null => {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
    };
    const applyRectToPortal = (next: BuilderInteractionLayerRect | null) => {
      if (!next) return;
      const frame = selectedFrameRef.current;
      if (frame) {
        frame.style.left = `${next.left + window.scrollX}px`;
        frame.style.top = `${next.top + window.scrollY}px`;
        frame.style.width = `${next.width}px`;
        frame.style.height = `${next.height}px`;
      }
      const toolbar = selectedToolbarRef.current;
      if (!toolbar) return;
      const toolbarY = next.top + next.height + 8;
      const top = toolbarY > window.innerHeight - 64
        ? Math.max(12, next.top - 52)
        : toolbarY;
      const left = Math.min(
        Math.max(next.left + next.width / 2, 180),
        window.innerWidth - 180,
      );
      toolbar.style.left = `${left + window.scrollX}px`;
      toolbar.style.top = `${top + window.scrollY}px`;
      toolbar.style.right = "auto";
      toolbar.style.bottom = "auto";
    };
    const rectsEqual = (
      left: BuilderInteractionLayerRect | null,
      right: BuilderInteractionLayerRect | null,
    ) =>
      left === right ||
      Boolean(
        left && right &&
        left.left === right.left &&
        left.top === right.top &&
        left.width === right.width &&
        left.height === right.height,
      );
    const updateRect = (commitSelectionRect: boolean) => {
      const next = readRect(selectedElement);
      applyRectToPortal(next);
      if (commitSelectionRect) {
        setSelectedRect((current) => rectsEqual(current, next) ? current : next);
      }
    };
    updateRect(true);
    let animationFrame: number | null = null;
    const scheduleUpdate = () => {
      // The selected interaction portal is not mounted when there is no
      // active selection. Avoid scheduling a scroll-following geometry read
      // for an overlay that cannot paint anything.
      if (!selectedFrameRef.current && !selectedToolbarRef.current) return;
      if (animationFrame !== null) return;
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = null;
        updateRect(false);
      });
    };
    const handleResize = () => scheduleUpdate();
    const handleScroll = () => {
      if (!selectedFrameRef.current && !selectedToolbarRef.current) return;
      hoverSuppressedByScrollRef.current = true;
      if (hoverFrameRef.current) hoverFrameRef.current.style.display = "none";
      scheduleUpdate();
    };
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      if (animationFrame !== null) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [findInteractionElement, hoverFrameRef, hoverSuppressedByScrollRef, interactionRoots, sections, selectedVisualTarget]);

  const renderToolbar = (target: BuilderInteractionTarget) => {
    const section = sections.find((candidate) => candidate.id === target.sectionId);
    if (!section) return null;
    if (target.type === "section") {
      const sectionIndex = sections.findIndex((candidate) => candidate.id === target.sectionId);
      return <BuilderContextToolbar context="section" label={sectionLabels[section.kind] ?? "Section"}
        canMoveUp={sectionIndex > 0} canMoveDown={sectionIndex >= 0 && sectionIndex < sections.length - 1} canDelete
        onSettings={() => { onSelect(section.id); onOpenInspector(); }}
        onMoveUp={() => onMoveSection(section.id, -1)} onMoveDown={() => onMoveSection(section.id, 1)}
        onSave={() => onSaveSectionTemplate(section.id)} onDuplicate={() => onDuplicateSection(section.id)}
        onDelete={() => onDeleteSection(section.id)} />;
    }
    if (target.type === "row") {
      const rows = resolveBuilderSectionStructure(section).rows;
      const row = rows[target.rowIndex];
      if (!row) return null;
      const preset = getBuilderRowLayoutPreset(row.row.layout);
      const isEmpty = row.columns.every(
        (column) => column.column.elements.length === 0,
      );
      return <BuilderContextToolbar context="layout" label={preset?.label ? `Layout · ${preset.label}` : "Layout"}
        canMoveUp={target.rowIndex > 0} canMoveDown={target.rowIndex < rows.length - 1} canDelete={isEmpty}
        onChangeLayout={() => onChangeLayout(section.id, target.rowIndex)}
        onSettings={() => { onSelectRow(section.id, target.rowIndex); onOpenInspector(); }}
        onMoveUp={() => onMoveRow(section.id, target.rowIndex, -1)} onMoveDown={() => onMoveRow(section.id, target.rowIndex, 1)}
        onSave={() => onSaveRowTemplate(section.id, target.rowIndex)} onDuplicate={() => onDuplicateRow(section.id, target.rowIndex)}
        onDelete={() => onDeleteRow(section.id, target.rowIndex)} />;
    }
    if (target.type === "column") {
      return <BuilderContextToolbar context="layout" label="Column"
        canMoveUp={false} canMoveDown={false} canDelete={false}
        onSettings={() => { onSelectColumn(section.id, target.columnKey); onOpenInspector(); }} />;
    }
    if (target.type !== "block") return null;
    const column = findLayoutColumn(section, target.columnKey);
    const blocks = column?.blocks ?? [];
    const blockIndex = blocks.findIndex((block, index) => (block.id ?? `${target.columnKey}-block-${index}`) === target.blockKey);
    const block = blocks[blockIndex];
    if (!block) return null;
    const interactionElement = findInteractionElement(target);
    const linkElement = interactionElement?.matches("a[href]")
      ? interactionElement
      : interactionElement?.querySelector<HTMLAnchorElement>("a[href]");
    const linkHref = linkElement?.getAttribute("href") ?? null;
    return <BuilderElementToolbar label={layoutBlockLabels[block.kind ?? "text"] ?? "Block"}
      canMoveUp={blockIndex > 0} canMoveDown={blockIndex < blocks.length - 1}
      onSettings={() => { onSelectBlock(section.id, target.columnKey, target.blockKey); onOpenInspector(); }}
      onMoveUp={() => onMoveBlockWithinColumn({ ...target, direction: -1 })}
      onMoveDown={() => onMoveBlockWithinColumn({ ...target, direction: 1 })}
      onSave={() => onSaveElementTemplate(section.id, target.columnKey, target.blockKey)}
      onDuplicate={() => onDuplicateBlock(target)} onDelete={() => onDeleteBlock(target)}
      linkHref={linkHref}
      onFollowLink={() => { if (linkHref) onFollowLink(linkHref); }} />;
  };

  if (!isMounted || typeof document === "undefined") return null;
  const renderFrame = (target: BuilderInteractionTarget | null, rect: BuilderInteractionLayerRect | null,
    state: "selected" | "hovered" | "editing") => {
    if (!target || !rect) return null;
    return <div className={`builder-shared-interaction-frame is-${state} is-${target.type}`}
      ref={state === "selected" || state === "editing" ? selectedFrameRef : undefined} />;
  };
  return createPortal(
    <>
      <div ref={layerRef} className="builder-shared-interaction-layer">
        {renderFrame(selectedVisualTarget, selectedRect, editingTarget ? "editing" : "selected")}
        <div
          ref={hoverFrameRef}
          className="builder-shared-interaction-frame is-hovered"
          style={{ display: "none" }}
        />
      </div>
      {selectedVisualTarget && selectedHierarchy && !editingTarget ? (
        <div
          className={`builder-fixed-selection-toolbar${selectedRect ? " is-anchored" : ""}${selectedVisualTarget.type === "block" ? " is-element" : ""}`}
          ref={selectedToolbarRef}
          role="toolbar"
          aria-label="Selected Builder object"
        >
          {previousSelection ? (
            <button
              type="button"
              className="builder-fixed-selection-back"
              onClick={() => onSelectTarget(previousSelection)}
              title="Return to previous selection"
            >
              <ArrowLeft size={13} />
              Back to {previousSelection.type === "block" ? "Element" : previousSelection.type[0].toUpperCase() + previousSelection.type.slice(1)}
            </button>
          ) : null}
          <nav className="builder-fixed-selection-breadcrumb" aria-label="Builder object hierarchy">
            <button type="button" onClick={() => onSelectTarget({ type: "section", sectionId: selectedVisualTarget.sectionId })}>
              Section
            </button>
            {selectedHierarchy.rowIndex >= 0 ? (
              <button type="button" onClick={() => onSelectTarget({ type: "row", sectionId: selectedVisualTarget.sectionId, rowIndex: selectedHierarchy.rowIndex })}>
                Row {selectedHierarchy.rowIndex + 1}
              </button>
            ) : null}
            {selectedHierarchy.columnKey ? (
              <button type="button" onClick={() => onSelectTarget({ type: "column", sectionId: selectedVisualTarget.sectionId, columnKey: selectedHierarchy.columnKey! })}>
                Column
              </button>
            ) : null}
            {selectedVisualTarget.type === "block" ? <span aria-current="page">Block</span> : null}
          </nav>
          <div className="builder-fixed-selection-actions">
            {renderToolbar(selectedVisualTarget)}
          </div>
          <div className="builder-fixed-add-control">
            <button type="button" onClick={() => setAddMenuOpen((open) => !open)} aria-expanded={addMenuOpen}>
              <Plus size={14} /> Add
            </button>
            {addMenuOpen ? (
              <div className="builder-fixed-add-menu">
                <button type="button" onClick={() => { onAddSection(selectedVisualTarget.sectionId, "below"); setAddMenuOpen(false); }}>
                  Add section
                </button>
                {selectedHierarchy.rowIndex >= 0 ? (
                  <button type="button" onClick={() => { onRequestAddRow(selectedVisualTarget.sectionId, selectedHierarchy.rowIndex); setAddMenuOpen(false); }}>
                    Add row
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </>,
    document.body,
  );
}

function SectionSpacingOverlay({
  section,
  shellSettings,
  showZeroLabels = false,
  onOpenSpacingSettings,
  onCycleSectionSpacing,
}: {
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
  showZeroLabels?: boolean;
  onOpenSpacingSettings?: (target: SpacingInspectorTarget) => void;
  onCycleSectionSpacing?: (
    sectionId: string,
    field: "topSpacing" | "bottomSpacing" | "topMargin" | "bottomMargin",
  ) => void;
}) {
  const topMargin = resolveSectionSpacingMeasurement(
    section.topMargin,
    "sectionMargin",
    shellSettings.sectionMarginTop,
  );
  const topPadding = resolveSectionSpacingMeasurement(
    section.topSpacing,
    "sectionPadding",
    shellSettings.sectionPaddingTop,
  );
  const bottomPadding = resolveSectionSpacingMeasurement(
    section.bottomSpacing,
    "sectionPadding",
    shellSettings.sectionPaddingBottom,
  );
  const bottomMargin = resolveSectionSpacingMeasurement(
    section.bottomMargin,
    "sectionMargin",
    shellSettings.sectionMarginBottom,
  );

  const marginTopTarget: SpacingInspectorTarget = {
    scope: "section",
    sectionId: section.id,
    field: "topMargin",
  };
  const paddingTopTarget: SpacingInspectorTarget = {
    scope: "section",
    sectionId: section.id,
    field: "topSpacing",
  };
  const paddingBottomTarget: SpacingInspectorTarget = {
    scope: "section",
    sectionId: section.id,
    field: "bottomSpacing",
  };
  const marginBottomTarget: SpacingInspectorTarget = {
    scope: "section",
    sectionId: section.id,
    field: "bottomMargin",
  };

  return (
    <div className="builder-preview-spacing-layer">
      <div className="builder-preview-spacing-overlay builder-preview-spacing-overlay--margin-top">
        {shouldShowSectionSpacingMeasurement(topMargin, showZeroLabels) ? (
          <SpacingGuideLabel
            className={`builder-preview-spacing-label builder-preview-spacing-label--margin builder-preview-spacing-label--source-${topMargin.source.toLowerCase()}`}
            style={{ left: "8px", right: "auto", bottom: "4px", top: "auto" }}
            onClick={
              onOpenSpacingSettings
                ? () => onOpenSpacingSettings(marginTopTarget)
                : undefined
            }
          >
            MT {topMargin.displayLabel}
          </SpacingGuideLabel>
        ) : null}
      </div>
      <div className="builder-preview-spacing-overlay builder-preview-spacing-overlay--padding-top">
        {shouldShowSectionSpacingMeasurement(topPadding, showZeroLabels) ? (
          <SpacingGuideLabel
            className={`builder-preview-spacing-label builder-preview-spacing-label--padding builder-preview-spacing-label--source-${topPadding.source.toLowerCase()}`}
            style={{ left: "auto", right: "8px", top: "4px", bottom: "auto" }}
            onClick={
              onOpenSpacingSettings
                ? () => onOpenSpacingSettings(paddingTopTarget)
                : undefined
            }
          >
            PT {topPadding.displayLabel}
          </SpacingGuideLabel>
        ) : null}
      </div>
      <div className="builder-preview-spacing-overlay builder-preview-spacing-overlay--padding-bottom">
        {shouldShowSectionSpacingMeasurement(bottomPadding, showZeroLabels) ? (
          <SpacingGuideLabel
            className={`builder-preview-spacing-label builder-preview-spacing-label--padding builder-preview-spacing-label--source-${bottomPadding.source.toLowerCase()}`}
            style={{ left: "auto", right: "8px", bottom: "4px", top: "auto" }}
            onClick={
              onOpenSpacingSettings
                ? () => onOpenSpacingSettings(paddingBottomTarget)
                : undefined
            }
          >
            PB {bottomPadding.displayLabel}
          </SpacingGuideLabel>
        ) : null}
      </div>
      <div className="builder-preview-spacing-overlay builder-preview-spacing-overlay--margin-bottom">
        {shouldShowSectionSpacingMeasurement(bottomMargin, showZeroLabels) ? (
          <SpacingGuideLabel
            className={`builder-preview-spacing-label builder-preview-spacing-label--margin builder-preview-spacing-label--source-${bottomMargin.source.toLowerCase()}`}
            style={{ left: "8px", right: "auto", top: "4px", bottom: "auto" }}
            onClick={
              onOpenSpacingSettings
                ? () => onOpenSpacingSettings(marginBottomTarget)
                : undefined
            }
          >
            MB {bottomMargin.displayLabel}
          </SpacingGuideLabel>
        ) : null}
      </div>
    </div>
  );
}

function RowSpacingOverlay({
  item,
  shellSettings,
  sectionId,
  rowIndex,
  isRowStart,
  showZeroLabels = false,
  onOpenSpacingSettings,
}: {
  item: any;
  shellSettings: BuilderShellSettings;
  sectionId: string;
  rowIndex: number;
  isRowStart: boolean;
  showZeroLabels?: boolean;
  onOpenSpacingSettings?: (target: SpacingInspectorTarget) => void;
}) {
  const topMargin = resolveBuilderSpacing(
    item.rowTopMargin ?? "inherit",
    "rowMargin",
    shellSettings.rowMarginTop,
  );
  const topPadding = resolveBuilderSpacing(
    item.rowTopSpacing ?? "inherit",
    "rowPadding",
    shellSettings.rowPaddingTop,
  );
  const bottomPadding = resolveBuilderSpacing(
    item.rowBottomSpacing ?? "inherit",
    "rowPadding",
    shellSettings.rowPaddingBottom,
  );
  const bottomMargin = resolveBuilderSpacing(
    item.rowBottomMargin ?? "inherit",
    "rowMargin",
    shellSettings.rowMarginBottom,
  );
  const rowGap =
    rowIndex > 0
      ? resolveBuilderRowGap(item, shellSettings.rowGap)
      : undefined;

  const marginTopTarget: SpacingInspectorTarget = {
    scope: "row",
    sectionId,
    rowIndex,
    field: "rowTopMargin",
  };
  const paddingTopTarget: SpacingInspectorTarget = {
    scope: "row",
    sectionId,
    rowIndex,
    field: "rowTopSpacing",
  };
  const paddingBottomTarget: SpacingInspectorTarget = {
    scope: "row",
    sectionId,
    rowIndex,
    field: "rowBottomSpacing",
  };
  const marginBottomTarget: SpacingInspectorTarget = {
    scope: "row",
    sectionId,
    rowIndex,
    field: "rowBottomMargin",
  };

  return (
    <div className="builder-preview-row-spacing-layer">
      {rowGap && isRowStart && (
        <div
          className="builder-preview-row-spacing-overlay builder-preview-row-spacing-overlay--gap-top"
          style={{ height: rowGap.css, top: `-${rowGap.css}` }}
        >
          <SpacingGuideLabel
            className={`builder-preview-spacing-label builder-preview-spacing-label--gap builder-preview-spacing-label--source-${rowGap.source.toLowerCase()}`}
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            Gap {formatSpacingMeasurement(rowGap)}
          </SpacingGuideLabel>
        </div>
      )}
      {shouldShowSpacingMeasurement(topMargin, showZeroLabels) && (
        <div
          className="builder-preview-row-spacing-overlay builder-preview-row-spacing-overlay--margin-top"
          style={{ height: topMargin.css }}
        >
          {isRowStart && (
            <SpacingGuideLabel
              className={`builder-preview-spacing-label builder-preview-spacing-label--margin builder-preview-spacing-label--source-${topMargin.source.toLowerCase()}`}
              style={{ left: "8px", right: "auto", bottom: "4px", top: "auto" }}
              onClick={
                onOpenSpacingSettings
                  ? () => onOpenSpacingSettings(marginTopTarget)
                  : undefined
              }
            >
              MT {formatSpacingMeasurement(topMargin)}
            </SpacingGuideLabel>
          )}
        </div>
      )}
      {shouldShowSpacingMeasurement(topPadding, showZeroLabels) && (
        <div
          className="builder-preview-row-spacing-overlay builder-preview-row-spacing-overlay--padding-top"
          style={{ height: topPadding.css }}
        >
          {isRowStart && (
            <SpacingGuideLabel
              className={`builder-preview-spacing-label builder-preview-spacing-label--padding builder-preview-spacing-label--source-${topPadding.source.toLowerCase()}`}
              style={{ left: "8px", right: "auto", top: "4px", bottom: "auto" }}
              onClick={
                onOpenSpacingSettings
                  ? () => onOpenSpacingSettings(paddingTopTarget)
                  : undefined
              }
            >
              PT {formatSpacingMeasurement(topPadding)}
            </SpacingGuideLabel>
          )}
        </div>
      )}
      {shouldShowSpacingMeasurement(bottomPadding, showZeroLabels) && (
        <div
          className="builder-preview-row-spacing-overlay builder-preview-row-spacing-overlay--padding-bottom"
          style={{ height: bottomPadding.css }}
        >
          {isRowStart && (
            <SpacingGuideLabel
              className={`builder-preview-spacing-label builder-preview-spacing-label--padding builder-preview-spacing-label--source-${bottomPadding.source.toLowerCase()}`}
              style={{ left: "8px", right: "auto", bottom: "4px", top: "auto" }}
              onClick={
                onOpenSpacingSettings
                  ? () => onOpenSpacingSettings(paddingBottomTarget)
                  : undefined
              }
            >
              PB {formatSpacingMeasurement(bottomPadding)}
            </SpacingGuideLabel>
          )}
        </div>
      )}
      {shouldShowSpacingMeasurement(bottomMargin, showZeroLabels) && (
        <div
          className="builder-preview-row-spacing-overlay builder-preview-row-spacing-overlay--margin-bottom"
          style={{ height: bottomMargin.css }}
        >
          {isRowStart && (
            <SpacingGuideLabel
              className={`builder-preview-spacing-label builder-preview-spacing-label--margin builder-preview-spacing-label--source-${bottomMargin.source.toLowerCase()}`}
              style={{ left: "8px", right: "auto", top: "4px", bottom: "auto" }}
              onClick={
                onOpenSpacingSettings
                  ? () => onOpenSpacingSettings(marginBottomTarget)
                  : undefined
              }
            >
              MB {formatSpacingMeasurement(bottomMargin)}
            </SpacingGuideLabel>
          )}
        </div>
      )}
    </div>
  );
}

function BoxSpacingOverlay({
  kind,
  labels,
  onOpenSpacingSettings,
}: {
  kind: "column" | "element";
  labels: BuilderSpacingOverlayLabel[];
  onOpenSpacingSettings?: (target: SpacingInspectorTarget) => void;
}) {
  if (labels.length === 0) return null;
  const paddingInset = labels.find((label) => label.tone === "padding")
    ?.measurement.css;

  return (
    <div
      className={`builder-preview-box-spacing builder-preview-box-spacing--${kind}${
        paddingInset ? " has-padding-guide" : ""
      }`}
      style={
        paddingInset
          ? ({
              "--builder-spacing-padding-inset": paddingInset,
            } as CSSProperties)
          : undefined
      }
    >
      <span className="builder-preview-box-spacing-fill" />
      {labels.map((label) => (
        <SpacingGuideLabel
          key={`${label.position}-${label.text}`}
          className={`builder-preview-spacing-label builder-preview-spacing-label--box builder-preview-spacing-label--${label.tone} builder-preview-spacing-label--${label.position} builder-preview-spacing-label--source-${label.measurement.source.toLowerCase()}`}
          onClick={
            onOpenSpacingSettings && label.target
              ? () =>
                  onOpenSpacingSettings(label.target as SpacingInspectorTarget)
              : undefined
          }
        >
          {label.text}
        </SpacingGuideLabel>
      ))}
    </div>
  );
}

function SpacingGuideLabel({
  children,
  className,
  onClick,
  tabIndex,
  style,
}: {
  children: ReactNode;
  className: string;
  onClick?: () => void;
  tabIndex?: number;
  style?: CSSProperties;
}) {
  if (onClick) {
    return (
      <button
        type="button"
        className={className}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onClick();
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (event.detail === 0) onClick();
        }}
        tabIndex={tabIndex ?? 0}
        style={style}
      >
        {children}
      </button>
    );
  }
  return (
    <span className={`${className} is-informational`} style={style}>
      {children}
    </span>
  );
}

type SpacingInspectorTarget =
  | {
      scope: "globalSection";
      field:
        | "sectionPaddingTop"
        | "sectionPaddingBottom"
        | "sectionMarginTop"
        | "sectionMarginBottom";
    }
  | {
      scope: "section";
      sectionId: string;
      field: "topSpacing" | "bottomSpacing" | "topMargin" | "bottomMargin";
    }
  | {
      scope: "row";
      sectionId: string;
      rowIndex: number;
      field?:
        | "rowTopSpacing"
        | "rowBottomSpacing"
        | "rowTopMargin"
        | "rowBottomMargin"
        | "rowGap";
    }
  | {
      scope: "column";
      sectionId: string;
      columnKey: string;
      field?: "columnPadding";
    }
  | {
      scope: "element";
      sectionId: string;
      columnKey: string;
      blockKey: string;
      field?:
        "elementPadding" | "visualPadding" | "visualMargin" | "elementGap";
    };

type BuilderSpacingOverlayLabel = {
  text: string;
  measurement: ResolvedBuilderSpacing;
  target?: SpacingInspectorTarget;
  tone: "padding" | "margin" | "gap";
  position:
    | "inside-top"
    | "outside-top"
    | "inside-bottom"
    | "outside-bottom"
    | "outside-left"
    | "outside-right"
    | "inside-right"
    | "inside-left";
};

function resolveSectionSpacingMeasurement(
  value: SectionSpacing | undefined,
  context: "sectionPadding" | "sectionMargin",
  fallback: GlobalSectionSpacing | undefined,
) {
  const resolved = resolveBuilderSpacing(value ?? "inherit", context, fallback);
  return {
    ...resolved,
    displayLabel: formatSpacingMeasurement(resolved),
  };
}

function shouldShowSectionSpacingMeasurement(
  measurement: ReturnType<typeof resolveSectionSpacingMeasurement>,
  showZero = false,
) {
  return shouldShowSpacingMeasurement(measurement, showZero);
}

function shouldShowSpacingMeasurement(
  measurement?: ResolvedBuilderSpacing,
  showZero = false,
) {
  if (!measurement) return false;
  return (
    measurement.px > 0 ||
    (measurement.isExplicitZero && measurement.source === "Local") ||
    (showZero && measurement.px === 0 && measurement.source !== "Default")
  );
}

function formatSpacingMeasurement(measurement: ResolvedBuilderSpacing) {
  const sourceText =
    measurement.source === "Local"
      ? "Local"
      : measurement.source === "Global"
        ? "Global"
        : "Default";
  return `${measurement.label} · ${sourceText}`;
}

function spacingLabel(
  prefix: string,
  measurement: ResolvedBuilderSpacing | undefined,
  tone: BuilderSpacingOverlayLabel["tone"],
  position: BuilderSpacingOverlayLabel["position"],
  target?: SpacingInspectorTarget,
): BuilderSpacingOverlayLabel | null {
  if (!shouldShowSpacingMeasurement(measurement)) return null;
  const visibleMeasurement = measurement;
  if (!visibleMeasurement) return null;
  return {
    text: `${prefix} ${formatSpacingMeasurement(visibleMeasurement)}`,
    measurement: visibleMeasurement,
    target,
    tone,
    position,
  };
}

function compactSpacingLabels(
  labels: Array<BuilderSpacingOverlayLabel | null>,
) {
  return labels.filter(Boolean) as BuilderSpacingOverlayLabel[];
}

function resolveLocalSpacingValue(
  value: string | undefined,
  context: Parameters<typeof resolveBuilderSpacingCssValue>[1],
) {
  if (!value || value === "inherit") return undefined;
  const css = resolveSpacingToken(value, context);
  if (!css) return undefined;
  return resolveBuilderSpacingCssValue(css, context, "Local", value);
}

function resolveLocalTokenSpacing(
  value: string | undefined,
  context: Parameters<typeof resolveBuilderSpacingCssValue>[1],
) {
  if (!value || value === "inherit") return undefined;
  return resolveBuilderSpacing(value, context);
}

function dashboardElementPaddingMeasurement(
  value: BuilderLayoutBlock["elementPadding"],
) {
  return resolveBuilderSpacing(value, "elementPadding");
}

function visualSpacingSideValue(
  sides: BuilderVisualStyle["padding"] | BuilderVisualStyle["margin"],
  side: "top" | "right" | "bottom" | "left",
) {
  if (!sides) return undefined;
  const linked = sides.linked !== false;
  if (side === "top") return sides.top;
  if (side === "right") return sides.right ?? (linked ? sides.top : undefined);
  if (side === "bottom")
    return sides.bottom ?? (linked ? sides.top : undefined);
  return sides.left ?? (linked ? sides.top : sides.right);
}

function visualSpacingMeasurements(
  sides: BuilderVisualStyle["padding"] | BuilderVisualStyle["margin"],
  context: Parameters<typeof resolveBuilderSpacingCssValue>[1],
) {
  const top = resolveLocalSpacingValue(
    visualSpacingSideValue(sides, "top"),
    context,
  );
  const right = resolveLocalSpacingValue(
    visualSpacingSideValue(sides, "right"),
    context,
  );
  const bottom = resolveLocalSpacingValue(
    visualSpacingSideValue(sides, "bottom"),
    context,
  );
  const left = resolveLocalSpacingValue(
    visualSpacingSideValue(sides, "left"),
    context,
  );
  return { top, right, bottom, left };
}

function inheritedElementSpacingMeasurements(
  shellSettings: BuilderShellSettings,
  context: "elementPadding" | "elementMargin",
) {
  const prefix =
    context === "elementPadding" ? "elementPadding" : "elementMargin";
  return {
    top: resolveBuilderSpacing(
      undefined,
      context,
      shellSettings[`${prefix}Top`],
    ),
    right: resolveBuilderSpacing(
      undefined,
      context,
      shellSettings[`${prefix}Right`],
    ),
    bottom: resolveBuilderSpacing(
      undefined,
      context,
      shellSettings[`${prefix}Bottom`],
    ),
    left: resolveBuilderSpacing(
      undefined,
      context,
      shellSettings[`${prefix}Left`],
    ),
  };
}

function boxSpacingSideLabels(
  prefix: string,
  tone: BuilderSpacingOverlayLabel["tone"],
  measurements: {
    top?: ResolvedBuilderSpacing;
    right?: ResolvedBuilderSpacing;
    bottom?: ResolvedBuilderSpacing;
    left?: ResolvedBuilderSpacing;
  },
  target: SpacingInspectorTarget,
) {
  const visible = Object.values(measurements).filter(
    (measurement): measurement is ResolvedBuilderSpacing =>
      shouldShowSpacingMeasurement(measurement),
  );
  if (visible.length === 0) return [];
  const first = visible[0];
  const allEqual =
    visible.length === 4 && visible.every((entry) => entry.css === first.css);
  const positions =
    tone === "margin"
      ? {
          top: "outside-top" as const,
          right: "outside-right" as const,
          bottom: "outside-bottom" as const,
          left: "outside-left" as const,
        }
      : {
          top: "inside-top" as const,
          right: "inside-right" as const,
          bottom: "inside-bottom" as const,
          left: "inside-left" as const,
        };

  if (allEqual) {
    return compactSpacingLabels([
      spacingLabel(prefix, first, tone, positions.top, target),
    ]);
  }

  return compactSpacingLabels([
    spacingLabel(`${prefix}t`, measurements.top, tone, positions.top, target),
    spacingLabel(
      `${prefix}r`,
      measurements.right,
      tone,
      positions.right,
      target,
    ),
    spacingLabel(
      `${prefix}b`,
      measurements.bottom,
      tone,
      positions.bottom,
      target,
    ),
    spacingLabel(`${prefix}l`, measurements.left, tone, positions.left, target),
  ]);
}

function columnSpacingOverlayLabels(
  rowMeta:
    | {
        rowIndex: number;
        columnIndex: number;
        span: number;
        isRowStart: boolean;
        isRowEnd: boolean;
      }
    | undefined,
  shellSettings: BuilderShellSettings,
  sectionId: string,
  columnKey: string,
) {
  const labels: Array<BuilderSpacingOverlayLabel | null> = [];
  const target: SpacingInspectorTarget = {
    scope: "column",
    sectionId,
    columnKey,
  };

  if (rowMeta && rowMeta.columnIndex > 0) {
    labels.push(
      spacingLabel(
        "Column Gap",
        resolveBuilderSpacing(
          undefined,
          "columnGap",
          shellSettings.columnGap,
        ),
        "gap",
        "outside-left",
        target,
      ),
    );
  } else if (rowMeta && !rowMeta.isRowEnd) {
    labels.push(
      spacingLabel(
        "Column Gap",
        resolveBuilderSpacing(
          undefined,
          "columnGap",
          shellSettings.columnGap,
        ),
        "gap",
        "outside-right",
        target,
      ),
    );
  }

  return compactSpacingLabels(labels);
}

function elementSpacingOverlayLabels(
  block: BuilderLayoutBlock,
  shellSettings: BuilderShellSettings,
  sectionId: string,
  columnKey: string,
  blockKey: string,
) {
  const visual = block.visualStyle as BuilderVisualStyle | undefined;
  const labels: BuilderSpacingOverlayLabel[] = [];
  const visualPaddingTarget: SpacingInspectorTarget = {
    scope: "element",
    sectionId,
    columnKey,
    blockKey,
    field: "visualPadding",
  };
  const visualMarginTarget: SpacingInspectorTarget = {
    scope: "element",
    sectionId,
    columnKey,
    blockKey,
    field: "visualMargin",
  };
  const visualPaddingLabels = boxSpacingSideLabels(
    "p",
    "padding",
    visualSpacingMeasurements(visual?.padding, "elementPadding"),
    visualPaddingTarget,
  );
  const legacyPaddingIsLocal = Boolean(
    block.elementPadding && block.elementPadding !== "inherit",
  );
  labels.push(
    ...(visualPaddingLabels.length > 0
      ? visualPaddingLabels
      : legacyPaddingIsLocal
        ? compactSpacingLabels([
            spacingLabel(
              "Element P",
              dashboardElementPaddingMeasurement(block.elementPadding),
              "padding",
              "inside-top",
              visualPaddingTarget,
            ),
          ])
        : boxSpacingSideLabels(
            "p",
            "padding",
            inheritedElementSpacingMeasurements(
              shellSettings,
              "elementPadding",
            ),
            visualPaddingTarget,
          )),
  );
  const visualMarginLabels = boxSpacingSideLabels(
    "m",
    "margin",
    visualSpacingMeasurements(visual?.margin, "elementMargin"),
    visualMarginTarget,
  );
  const legacyMarginIsLocal = Boolean(
    block.gridMargin && block.gridMargin !== "inherit",
  );
  labels.push(
    ...(visualMarginLabels.length > 0
      ? visualMarginLabels
      : legacyMarginIsLocal
        ? compactSpacingLabels([
            spacingLabel(
              "Element M",
              resolveBuilderSpacing(block.gridMargin, "elementMargin"),
              "margin",
              "outside-top",
              visualMarginTarget,
            ),
          ])
        : boxSpacingSideLabels(
            "m",
            "margin",
            inheritedElementSpacingMeasurements(shellSettings, "elementMargin"),
            visualMarginTarget,
          )),
  );

  return labels;
}

const previewTargetTouchesSection = (target: BuilderInteractionTarget | null | undefined, sectionId: string) =>
  target?.sectionId === sectionId;

const previewSectionPropsEqual = (
  previous: any,
  next: any,
) => {
  const sectionId = previous.section.id;
  if (previous.section !== next.section || previous.device !== next.device) return false;
  if (previous.selectedSectionId !== next.selectedSectionId) {
    return previous.selectedSectionId !== sectionId && next.selectedSectionId !== sectionId;
  }
  if (previous.selectedLayoutColumnKey !== next.selectedLayoutColumnKey ||
      previous.selectedLayoutRowIndex !== next.selectedLayoutRowIndex ||
      previous.selectedLayoutBlockKey !== next.selectedLayoutBlockKey) return false;
  if (previewTargetTouchesSection(previous.selectedTarget, sectionId) || previewTargetTouchesSection(next.selectedTarget, sectionId)) {
    if (!builderTargetsEqual(previous.selectedTarget, next.selectedTarget)) return false;
  }
  if (previewTargetTouchesSection(previous.editingTarget, sectionId) || previewTargetTouchesSection(next.editingTarget, sectionId)) {
    if (!builderTargetsEqual(previous.editingTarget, next.editingTarget)) return false;
  }
  if (previewTargetTouchesSection(previous.hoveredTarget, sectionId) || previewTargetTouchesSection(next.hoveredTarget, sectionId)) {
    if (!builderTargetsEqual(previous.hoveredTarget, next.hoveredTarget)) return false;
  }
  if (previewTargetTouchesSection(previous.hoverToolbarTarget, sectionId) || previewTargetTouchesSection(next.hoverToolbarTarget, sectionId)) {
    if (!builderTargetsEqual(previous.hoverToolbarTarget, next.hoverToolbarTarget)) return false;
  }
  if (previous.rowInsertRequest?.sectionId === sectionId || next.rowInsertRequest?.sectionId === sectionId) {
    if (previous.rowInsertRequest !== next.rowInsertRequest) return false;
  }
  return true;
};

const PreviewSection = memo(function PreviewSection({
  device,
  section,
  shellSettings,
  previewProducts,
  previewCategoryTree,
  previewCategoryCounts,
  selectedLayoutColumnKey,
  selectedLayoutRowIndex,
  selectedSectionId,
  selectedLayoutBlockKey,
  selectedTarget,
  editingTarget,
  hoverToolbarTarget,
  hoveredTarget,
  rowInsertRequest = null,
  onConsumeRowInsertRequest,
  onHoverTarget,
  draggingLayoutBlockKey,
  activeDragOver,
  onCanvasDragOverChange,
  onSelectColumn,
  onSelectRow,
  onSelectBlock,
  onOpenInspector,
  onBlockDragStart,
  onBlockDragEnd,
  onMoveBlock,
  onCreateBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onUpdateBlock,
  onUpdateGridItem,
  onDeleteGridItem,
  onDuplicateGridItem,
  onMoveGridItem,
  onMoveBadge,
  onMoveButton,
  onMoveListItem,
  onDeleteBadge,
  onDuplicateBadge,
  onDeleteButton,
  onDuplicateButton,
  onDeleteListItem,
  onDuplicateListItem,
  onDeleteSectionBadge,
  onDuplicateSectionBadge,
  onMoveSectionBadge,
  onUploadGridItemImage,
  onUploadBlockImage,
  onAddRow,
  onAddColumnAfter,
  onStackColumnBelow,
  onAppendNestedRow,
  onDeleteNestedRow,
  onUnwrapNestedColumn,
  onDeleteRow,
  onDuplicateRow,
  onMoveRow,
  onSaveRowTemplate,
  onSaveElementTemplate,
  onMoveBlockWithinColumn,
  onDropRowTemplate,
  onDropElementTemplate,
  onOpenSpacingSettings,
  onOpenElementsPanel,
  onChangeLayout,
  spacingOverlayEnabled,
  nestingDepth = 0,
  nestedOwnerColumnKey = null,
}: {
  device: PreviewDevice;
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
  previewProducts: ProductNode[];
  previewCategoryTree: CategoryTreeItem[];
  previewCategoryCounts: Record<string, number>;
  selectedLayoutColumnKey: string | null;
  selectedLayoutRowIndex: number | null;
  selectedSectionId: string;
  selectedLayoutBlockKey: string | null;
  selectedTarget: BuilderInteractionTarget | null;
  editingTarget: BuilderInteractionTarget | null;
  hoverToolbarTarget: BuilderInteractionTarget | null;
  hoveredTarget: BuilderHoverTarget | null;
  rowInsertRequest?: { sectionId: string; rowIndex: number } | null;
  onConsumeRowInsertRequest?: () => void;
  onHoverTarget: (target: BuilderHoverTarget | null) => void;
  draggingLayoutBlockKey: string | null;
  activeDragOver: {
    type: "section" | "column" | "block";
    sectionId: string;
    columnKey?: string;
    blockKey?: string;
    placement?: "above" | "below" | "inside";
  } | null;
  onCanvasDragOverChange: (
    state: {
      type: "section" | "column" | "block";
      sectionId: string;
      columnKey?: string;
      blockKey?: string;
      placement?: "above" | "below" | "inside";
    } | null,
  ) => void;
  onSelectColumn: (sectionId: string, columnKey: string, openInspector?: boolean) => void;
  onSelectRow: (sectionId: string, rowIndex: number, openInspector?: boolean) => void;
  onSelectBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    openInspector?: boolean,
  ) => void;
  onOpenInspector: () => void;
  onBlockDragStart: (blockKey: string) => void;
  onBlockDragEnd: () => void;
  onMoveBlock: (payload: {
    sectionId: string;
    targetSectionId?: string;
    sourceColumnKey: string;
    sourceBlockKey: string;
    targetColumnKey: string;
    targetBlockKey?: string;
    placement?: "above" | "below";
  }) => void;
  onCreateBlock: (payload: {
    sectionId: string;
    targetColumnKey: string;
    kind: LayoutBlockKind;
    targetBlockKey?: string;
    placement?: "above" | "below";
  }) => void;
  onDuplicateBlock: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
  onDeleteBlock: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
  }) => void;
  onUpdateBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    patch: Partial<BuilderLayoutBlock>,
  ) => void;
  onUpdateGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number],
  ) => void;
  onDeleteGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onDuplicateGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onMoveGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onMoveBadge: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onMoveButton: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onMoveListItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onDeleteBadge: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    badgeIndex: number,
  ) => void;
  onDuplicateBadge: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    badgeIndex: number,
  ) => void;
  onUploadGridItemImage: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    currentUrl?: string,
  ) => void;
  onUploadBlockImage?: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    currentUrl?: string,
  ) => void;
  onAddRow: (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => void;
  onAddColumnAfter: (target: {
    sectionId: string;
    columnKey: string;
  }) => void;
  onStackColumnBelow: (sectionId: string, columnKey: string) => void;
  onAppendNestedRow: (
    sectionId: string,
    outerColumnKey: string,
    afterRowId: string,
  ) => void;
  onDeleteNestedRow: (
    sectionId: string,
    outerColumnKey: string,
    rowId: string,
    nestedColumnKey: string,
  ) => void;
  onUnwrapNestedColumn: (sectionId: string, columnKey: string) => void;
  onDeleteRow: (sectionId: string, rowIndex: number) => void;
  onDuplicateRow: (sectionId: string, rowIndex: number) => void;
  onMoveRow: (sectionId: string, rowIndex: number, direction: -1 | 1) => void;
  onSaveRowTemplate: (sectionId: string, rowIndex: number) => void;
  onSaveElementTemplate: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
  ) => void;
  onMoveBlockWithinColumn: (payload: {
    sectionId: string;
    columnKey: string;
    blockKey: string;
    direction: -1 | 1;
  }) => void;
  onDropRowTemplate: (
    templateId: string,
    sectionId: string,
    targetRowId: string,
    placement: "before" | "after" | "replace",
  ) => void;
  onDropElementTemplate: (payload: {
    templateId: string;
    sectionId: string;
    columnKey: string;
    targetBlockKey?: string;
    placement?: "above" | "below";
  }) => void;
  onDeleteButton: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    buttonIndex: number,
  ) => void;
  onDuplicateButton: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    buttonIndex: number,
  ) => void;
  onDeleteListItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onDuplicateListItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
  ) => void;
  onDeleteSectionBadge: (sectionId: string, badgeIndex: number) => void;
  onDuplicateSectionBadge: (sectionId: string, badgeIndex: number) => void;
  onMoveSectionBadge: (
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onOpenSpacingSettings: (target: SpacingInspectorTarget) => void;
  onOpenElementsPanel: () => void;
  onChangeLayout: (sectionId: string, rowIndex: number) => void;
  spacingOverlayEnabled: boolean;
  nestingDepth?: number;
  nestedOwnerColumnKey?: string | null;
}) {
  const [draggingItem, setDraggingItem] = useState<{
    kind: "grid" | "badge" | "button" | "list" | "sectionBadge";
    blockKey: string;
    fromIndex: number;
  } | null>(null);
  const [dropHoverIndex, setDropHoverIndex] = useState<number | null>(null);
  const [rowInsertTarget, setRowInsertTarget] = useState<{
    rowIndex: number;
    placement: "before" | "after";
  } | null>(null);
  useEffect(() => {
    if (!rowInsertRequest || nestingDepth !== 0) return;
    setRowInsertTarget({ rowIndex: rowInsertRequest.rowIndex, placement: "after" });
    onConsumeRowInsertRequest?.();
  }, [nestingDepth, onConsumeRowInsertRequest, rowInsertRequest]);
  const rowLayoutPicker = rowInsertTarget ? (
    <div
      className="builder-layout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-row-layout-picker-title"
      onClick={() => setRowInsertTarget(null)}
    >
      <div
        className="builder-layout-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="builder-layout-header">
          <div>
            <strong id="builder-row-layout-picker-title">
              Choose layout
            </strong>
            <span>Select the column structure for this layout.</span>
          </div>
          <button
            type="button"
            className="builder-layout-close"
            onClick={() => setRowInsertTarget(null)}
            aria-label="Close row layout picker"
          >
            <X size={15} />
          </button>
        </div>

        <div className="builder-layout-picker-body">
          {uikitPresetGroups.map((group) => {
            const groupPresets = group.keys
              .map((key) => rowInsertionPresets.find((p) => p.key === key))
              .filter(Boolean);

            if (groupPresets.length === 0) return null;

            return (
              <div key={group.title} className="builder-layout-picker-group">
                <div className="builder-layout-picker-group-title">
                  {group.title}
                </div>
                <div className="builder-layout-picker-grid">
                  {groupPresets.map((preset) => (
                    <button
                      key={preset!.key}
                      type="button"
                      className="builder-layout-picker-card"
                      onClick={() => {
                        onAddRow(
                          section.id,
                          rowInsertTarget.rowIndex,
                          rowInsertTarget.placement,
                          preset!.key,
                        );
                        setRowInsertTarget(null);
                      }}
                    >
                      <UikitPresetWireframeDiagram presetKey={preset!.key} />
                      <span className="builder-layout-picker-card-copy">
                        <strong>{preset!.label}</strong>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  ) : null;

  if (
    isLayoutContainerSection(section) &&
    normalizeBuilderSectionLayout(section).rows.length === 0
  ) {
    return (
      <>
        <div className="shop-builder-section-content builder-preview-empty-section">
          <button
            type="button"
            className="builder-preview-drop-zone builder-preview-empty-section-action"
            onClick={() =>
              setRowInsertTarget({ rowIndex: -1, placement: "after" })
            }
            aria-label="Add row"
          >
            <span className="builder-structural-placeholder-mark">
              <Plus size={14} />
            </span>
            <span className="builder-structural-placeholder-copy">
              <strong>Empty section</strong>
              <small>Add Row</small>
            </span>
          </button>
        </div>
        {rowLayoutPicker ? createPortal(rowLayoutPicker, document.body) : null}
      </>
    );
  }

  if (section.kind === "hero" && !section.layoutItems?.length) {
    const isAntigravity = section.carouselSettings?.variant === "antigravity";
    return (
      <div
        className={`shop-builder-section-content builder-preview-hero-inner ${isAntigravity ? "shop-builder-hero--antigravity" : ""}`}
      >
        <div className="shop-builder-hero-content-left">
          {section.eyebrow && (
            <DashboardTypog
              as="p"
              className="shop-builder-eyebrow"
              typography={section.typography}
            >
              {section.eyebrow}
            </DashboardTypog>
          )}
          <DashboardTypog
            as="h2"
            className={`shop-builder-title ${isAntigravity ? "shop-builder-title--gradient" : ""}`}
            typography={section.typography}
          >
            {isAntigravity && section.title ? (
              <TypewriterText
                text={section.title}
                phrases={section.typewriterPhrases}
                typography={section.typography}
                area="title"
                speed={section.typewriterSpeed}
                eraseSpeed={section.typewriterEraseSpeed}
                delay={section.typewriterDelay}
                loop={section.typewriterLoop}
                useGradient={section.typewriterUseGradient}
                gradientPreset={section.typewriterGradientPreset}
                preserveHeight={section.typewriterPreserveHeight !== false}
                reservedLines={section.typewriterReservedLines ?? 1}
                mobileReservedLines={section.typewriterMobileReservedLines ?? 2}
              />
            ) : (
              section.title
            )}
          </DashboardTypog>
          {section.body && (
            <DashboardTypog
              as="p"
              className="shop-builder-body"
              typography={section.typography}
            >
              {section.body}
            </DashboardTypog>
          )}
          {section.buttonLabel && section.buttonUrl && (
            <DashboardTypog
              as="span"
              className={`shop-builder-cta ${isAntigravity ? "shop-builder-cta--antigravity" : ""}`}
              typography={section.typography}
            >
              {section.buttonLabel}
            </DashboardTypog>
          )}
        </div>
        {isAntigravity ? (
          <div className="shop-builder-hero-media shop-builder-hero-media--antigravity">
            <AntigravityTerminal />
          </div>
        ) : (
          <div
            className="shop-builder-hero-media builder-preview-hero-media"
            aria-hidden="true"
          />
        )}
      </div>
    );
  }

  if (section.kind === "productArchive") {
    return (
      <div className="shop-builder-section-content builder-preview-live-products">
        {previewProducts.length > 0 ? (
          section.layoutVariant === "carousel" ? (
            <ProductCarousel
              products={previewProducts.slice(0, section.gridLimit ?? 8)}
              preset={section.cardPreset ?? "standard"}
              cardStyle={section.cardStyle}
              cardTheme={undefined}
              gridImageFrame={undefined}
              imagePadding={section.imagePadding}
              imageFit={section.imageFit}
              imageRatio={section.imageRatio}
              borderRadius={section.borderRadius}
              addToCartStyle={section.addToCartStyle}
              addToCartSize={section.addToCartSize}
              addToCartDisplay={section.addToCartDisplay}
              addToCartVisibility={section.addToCartVisibility}
              addToCartPosition={section.addToCartPosition}
              typography={section.typography}
              categoryTree={previewCategoryTree}
            />
          ) : (
            <CategoryWithFilters
              products={previewProducts}
              columns={section.columns}
              filterPosition={section.filterPosition}
              cardStyle={section.cardStyle}
              cardPreset={section.cardPreset}
              pageSize={section.gridLimit}
              gridGap={section.gridGap}
              cardPadding={section.cardPadding}
              imagePadding={section.imagePadding}
              imageFit={section.imageFit}
              imageRatio={section.imageRatio}
              borderRadius={section.borderRadius}
              addToCartStyle={section.addToCartStyle}
              addToCartSize={section.addToCartSize}
              addToCartPosition={section.addToCartPosition}
              addToCartVisibility={section.addToCartVisibility}
              addToCartDisplay={section.addToCartDisplay}
              hiddenCategorySlugs={section.hiddenCategorySlugs}
              categoryTree={previewCategoryTree}
              typography={section.typography}
              pagination={section.pagination}
            />
          )
        ) : (
          <div className="builder-preview-products">
            <h2 className="shop-builder-title">{section.title}</h2>
            <div
              className={`builder-preview-product-grid cards-${
                section.cardStyle ?? "flat"
              } preset-${section.cardPreset ?? "standard"} cart-${section.addToCartStyle ?? "blue"} cart-size-${section.addToCartSize ?? "medium"} cart-position-${section.addToCartPosition ?? "below"} cart-visibility-${section.addToCartVisibility ?? "hover"} cart-display-${section.addToCartDisplay ?? "button"}`}
              style={
                {
                  "--builder-preview-columns": section.columns ?? 4,
                } as CSSProperties
              }
            >
              {sampleProducts
                .slice(
                  0,
                  Math.min(section.gridLimit ?? 12, sampleProducts.length),
                )
                .map((name) => (
                  <div
                    key={name}
                    className="product-card builder-preview-product-card"
                  >
                    <div className="product-image builder-preview-product-image" />
                    <strong className="product-title">{name}</strong>
                    <span className="product-attr-pill">Preview product</span>
                    <small className="product-price">No live products</small>
                    <div className="product-card-actions-row">
                      <button className="btn btn-primary" type="button">
                        Add to cart
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (section.kind === "recentlyViewed") {
    const recentProducts = previewProducts.slice(0, 4);

    return (
      <div className="shop-builder-section-content builder-preview-strip builder-preview-recent-products">
        <h2 className="shop-builder-title">{section.title}</h2>
        <div>
          {recentProducts.length > 0
            ? recentProducts.map((product) => {
                const attributes = getPreviewProductAttributes(product);
                return (
                  <article
                    key={product.id}
                    className="product-card builder-preview-product-card"
                  >
                    <div className="product-image builder-preview-product-image">
                      {product.image?.sourceUrl ? (
                        <Image
                          src={product.image.sourceUrl}
                          alt={product.image.altText || product.name}
                          width={420}
                          height={520}
                        />
                      ) : (
                        <div className="product-image-placeholder">
                          No image
                        </div>
                      )}
                    </div>
                    <strong className="product-title">{product.name}</strong>
                    {attributes.length > 0 && (
                      <div className="product-meta product-meta-attributes">
                        {attributes.slice(0, 2).map((attribute) => (
                          <span key={attribute} className="product-attr-pill">
                            {attribute}
                          </span>
                        ))}
                      </div>
                    )}
                    {product.price && (
                      <small className="product-price">
                        {formatPreviewPrice(product.price)}
                      </small>
                    )}
                  </article>
                );
              })
            : sampleProducts
                .slice(0, 4)
                .map((name) => <span key={name}>{name}</span>)}
        </div>
      </div>
    );
  }

  if (section.kind === "filters") {
    return (
      <div className="shop-builder-section-content builder-preview-filter-pills">
        <h2 className="shop-builder-title">{section.title}</h2>
        {previewCategoryTree.length > 0 ? (
          <CategoryBar
            categoryTree={previewCategoryTree}
            countsBySlug={previewCategoryCounts}
          />
        ) : (
          <div className="shop-builder-filter-pills">
            <span>Women</span>
            <span>Men</span>
            <span>Boots</span>
            <span>Accessories</span>
          </div>
        )}
      </div>
    );
  }

  if (section.kind === "slider") {
    return <PreviewSliderBlock section={section} shellSettings={shellSettings} />;
  }

  if (section.kind === "scrollPinnedDemo") {
    const previewSection = normalizeScrollPinnedDemoSection(section);
    return (
      <div className="shop-builder-section-content builder-preview-scroll-pinned">
        <ScrollPinnedDemo section={previewSection} isPreview={true} />
      </div>
    );
  }

  if (section.kind === "embed") {
    return (
      <div className="shop-builder-section-content builder-preview-embed">
        <div className="shop-builder-embed-heading">
          <p className="shop-builder-eyebrow">
            <Grid3X3 size={18} />
            {section.embedMode === "code" ? "custom code" : "iframe"} embed
          </p>
          <h2 className="shop-builder-title">{section.title}</h2>
          {section.body && (
            <BodyText className="shop-builder-body">{section.body}</BodyText>
          )}
        </div>
        <div
          className="shop-builder-embed-empty builder-preview-embed-frame"
          style={{ minHeight: section.embedHeight ?? 220 }}
        >
          {section.embedMode === "code"
            ? "HTML / script widget"
            : section.embedUrl || "Iframe URL"}
        </div>
      </div>
    );
  }

  if (isLayoutContainerSection(section)) {
    const previewProduct = getPreviewProductModel(previewProducts);
    const structure = resolveBuilderSectionStructure(section, {
      fallbackLayoutItems: [{
        id: "layout-item-fallback",
        eyebrow: "01",
        title: "Flexible content",
        body: "Choose one, two, or three columns from the dashboard.",
      }],
      globalRowGap: shellSettings.rowGap,
      rowGlobalSpacing: {
        rowPaddingTop: shellSettings.rowPaddingTop,
        rowPaddingBottom: shellSettings.rowPaddingBottom,
        rowMarginTop: shellSettings.rowMarginTop,
        rowMarginBottom: shellSettings.rowMarginBottom,
      },
    });
    const rowMetaByColumnKey = new Map<
      string,
      {
        rowIndex: number;
        columnIndex: number;
        isRowStart: boolean;
        isRowEnd: boolean;
        span: number;
      }
    >();
    structure.rows.forEach((structuralRow, rowIndex) => {
      structuralRow.columns.forEach((structuralColumn, columnIndex) => {
        const columnKey = structuralColumn.column.id;
        rowMetaByColumnKey.set(columnKey, {
          rowIndex,
          columnIndex,
          isRowStart: columnIndex === 0,
          isRowEnd: columnIndex === structuralRow.columns.length - 1,
          span: structuralColumn.span,
        });
      });
    });
    return (
      <div
        className={`shop-builder-section-content ${
          nestingDepth === 0 ? getUikitContainerClass(section.contentMode) : ""
        } builder-preview-content-layout`}
      >
        <div
          className="shop-builder-content-layout-grid builder-preview-content-layout-grid"
          style={
            {
              "--builder-preview-layout-columns": section.layoutColumns ?? 2,
              "--builder-layout-columns": section.layoutColumns ?? 2,
              display: "flex",
              flexDirection: "column",
              gap: 0,
            } as CSSProperties
          }
        >
          {structure.rows.map((structuralRow, layoutRowIndex) => {
            const rowItem = structuralRow.legacyItem ?? {};
            const rowTarget: BuilderInteractionTarget = {
              type: "row",
              sectionId: section.id,
              rowIndex: layoutRowIndex,
            };
            const rowInteractionState =
              nestingDepth > 0
                ? "idle"
                : resolveBuilderInteractionState({
                    target: rowTarget,
                    selected: selectedTarget,
                    hovered: hoveredTarget,
                    editing: editingTarget,
                  });
            const rowChrome = resolveBuilderInteractionChrome({
              state: rowInteractionState,
              spacingActive: spacingOverlayEnabled,
              dragging: Boolean(draggingLayoutBlockKey),
              hoverToolbarReady: builderTargetsEqual(
                rowTarget,
                hoverToolbarTarget,
              ),
            });
            const rowLayoutPreset = getBuilderRowLayoutPreset(structuralRow.row.layout);
            const rowLayoutLabel = rowLayoutPreset?.label
              ? `Layout · ${rowLayoutPreset.label}`
              : "Layout";
            const hasActiveDescendant = [hoveredTarget, selectedTarget].some(
              (target) =>
                target?.sectionId === section.id &&
                (target.type === "column" || target.type === "block") &&
                rowMetaByColumnKey.get(target.columnKey)?.rowIndex ===
                  layoutRowIndex,
            );
            const showRowToolbar =
              rowChrome.showToolbar &&
              !hasActiveDescendant &&
              !editingTarget;

            const isEmptyRow = structuralRow.columns.every(
              ({ column }) => column.elements.length === 0,
            );
            return (
              <div
                key={structuralRow.row.id}
                className={`${builderInteractionFrameClassName(rowTarget)} ${
                  nestingDepth === 0
                    ? "builder-main-row-frame"
                    : "builder-nested-row-frame"
                }`}
                data-builder-row-frame={layoutRowIndex}
                data-builder-object-type="row"
                data-builder-section-id={section.id}
                data-builder-row-index={layoutRowIndex}
                data-builder-double-click-inspector={nestingDepth === 0 ? "true" : undefined}
                tabIndex={nestingDepth > 0 ? -1 : 0}
                aria-label={`Row ${layoutRowIndex + 1}`}
                onFocus={(event) => {
                  if (nestingDepth > 0) return;
                  if (event.target === event.currentTarget) {
                    onSelectRow(section.id, layoutRowIndex);
                  }
                }}
                onKeyDown={(event) => {
                  if (nestingDepth > 0) return;
                  if (
                    event.target === event.currentTarget &&
                    (event.key === "Enter" || event.key === " ")
                  ) {
                    event.preventDefault();
                    onSelectRow(section.id, layoutRowIndex);
                  }
                }}
                style={{
                  paddingTop:
                    nestingDepth === 0 && layoutRowIndex > 0
                      ? structuralRow.precedingGap
                      : 0,
                }}
              >
                <div
                  className={`${structuralRow.className} shop-builder-content-row builder-preview-content-row ${
                    structuralRow.row.spacingContract === "yootheme" ? "shop-builder-content-row--yootheme " : ""
                  }${structuralRow.style.maxWidth ? "shop-builder-content-row--contained " : ""}${builderInteractionClassName(
                    rowTarget,
                    rowInteractionState,
                  )}`}
                  data-builder-object-type="row"
                  data-builder-section-id={section.id}
                  data-builder-row-index={layoutRowIndex}
                  data-builder-element-scope={layoutAdvancedScope("row", page, section.id, structuralRow.row.id)}
                  data-builder-interaction-state={rowInteractionState}
                  data-builder-double-click-inspector={nestingDepth === 0 ? "true" : undefined}
                  style={{
                    ...structuralRow.style,
                  }}
                >
                  <LayoutAdvancedStyle
                    css={structuralRow.row.advanced?.css}
                    scope={layoutAdvancedScope("row", page, section.id, structuralRow.row.id)}
                  />
                  {rowChrome.showSpacing && (
                    <RowSpacingOverlay
                      item={rowItem}
                      shellSettings={shellSettings}
                      sectionId={section.id}
                      rowIndex={layoutRowIndex}
                      isRowStart
                      showZeroLabels={spacingOverlayEnabled}
                      onOpenSpacingSettings={onOpenSpacingSettings}
                    />
                  )}
                  {isEmptyRow && (
                    <div
                      className="builder-structural-row-identity"
                      aria-hidden="true"
                    >
                      <span>Row {layoutRowIndex + 1}</span>
                      <small>
                        {structuralRow.columns.length}{" "}
                        {structuralRow.columns.length === 1 ? "column" : "columns"}
                      </small>
                    </div>
                  )}
                  {structuralRow.columns.map((structuralColumn, columnIndex) => {
            const index = structuralColumn.flatIndex;
            const typedItem = (structuralColumn.legacyItem ?? {
              id: structuralColumn.column.id,
              blocks: structuralColumn.column.elements,
            }) as PreviewLayoutItem;
            const columnKey = structuralColumn.column.id;
            const rowMeta = rowMetaByColumnKey.get(columnKey);
            const blocks = structuralColumn.column.elements;
            const cardStyle =
              blocks.find(
                (block) => block.panelStyle && block.panelStyle !== "default",
              )?.panelStyle ??
              blocks.find((block) => block.cardPreset)?.cardPreset ??
              blocks[0]?.panelStyle ??
              blocks[0]?.cardPreset ??
              "default";

            const hasScrollPinned = blocks.some(
              (b) => b.kind === "scrollPinnedDemo",
            );
            const isColumnActive =
              selectedSectionId === section.id &&
              selectedLayoutColumnKey === columnKey &&
              selectedLayoutBlockKey === null;
            const columnTarget: BuilderInteractionTarget = {
              type: "column",
              sectionId: section.id,
              columnKey,
            };
            const columnInteractionState = resolveBuilderInteractionState({
              target: columnTarget,
              selected: selectedTarget,
              hovered: hoveredTarget,
              editing: editingTarget,
            });
            const columnChrome = resolveBuilderInteractionChrome({
              state: columnInteractionState,
              spacingActive: spacingOverlayEnabled,
              dragging: activeDragOver?.type === "column",
              hoverToolbarReady:
                nestingDepth === 0 &&
                builderTargetsEqual(columnTarget, hoverToolbarTarget),
            });
            if (typedItem.nestedLayout) {
              const nestedSection: BuilderSection = {
                ...section,
                rows: undefined,
                layout: undefined,
                layoutColumns: 1,
                layoutRows: typedItem.nestedLayout.rows.length,
                layoutItems: typedItem.nestedLayout.rows.flatMap((nestedRow) =>
                  nestedRow.columns.map((nestedColumn) => ({
                    ...nestedColumn,
                    rowId: nestedRow.id,
                    rowLayout: nestedRow.layout,
                  })),
                ),
              };

              return (
                <article
                  key={columnKey}
                  id={columnKey}
                  data-builder-object-type="column"
                  data-builder-section-id={section.id}
                  data-builder-row-index={rowMeta?.rowIndex}
                  data-builder-column-key={columnKey}
                  data-builder-element-scope={`column-${columnKey}`}
                  data-builder-interaction-state={columnInteractionState}
                  className={`${structuralColumn.className} ${builderInteractionClassName(
                    columnTarget,
                    columnInteractionState,
                  )} shop-builder-content-layout-card builder-nested-layout-container`}
                  style={{
                    ...structuralColumn.style,
                    gridColumn:
                      device === "mobile"
                        ? "1 / -1"
                        : `span ${rowMeta?.span ?? 12}`,
                    "--builder-nested-row-count": typedItem.nestedLayout.rows.length,
                  } as CSSProperties}
                >
                  <LayoutAdvancedStyle
                    css={structuralColumn.column.advanced?.css}
                    scope={`column-${columnKey}`}
                  />

                  <div className="builder-nested-layout">
                    <PreviewSection
                      device={device}
                      section={nestedSection}
                      shellSettings={shellSettings}
                      previewProducts={previewProducts}
                      previewCategoryTree={previewCategoryTree}
                      previewCategoryCounts={previewCategoryCounts}
                      selectedLayoutColumnKey={selectedLayoutColumnKey}
                      selectedLayoutRowIndex={selectedLayoutRowIndex}
                      selectedSectionId={selectedSectionId}
                      selectedLayoutBlockKey={selectedLayoutBlockKey}
                      selectedTarget={selectedTarget}
                      editingTarget={editingTarget}
                      hoverToolbarTarget={hoverToolbarTarget}
                      hoveredTarget={hoveredTarget}
                      onHoverTarget={onHoverTarget}
                      draggingLayoutBlockKey={draggingLayoutBlockKey}
                      activeDragOver={activeDragOver}
                      onCanvasDragOverChange={onCanvasDragOverChange}
                      onSelectColumn={onSelectColumn}
                      onSelectRow={onSelectRow}
                      onSelectBlock={onSelectBlock}
                      onOpenInspector={onOpenInspector}
                      onBlockDragStart={onBlockDragStart}
                      onBlockDragEnd={onBlockDragEnd}
                      onMoveBlock={onMoveBlock}
                      onCreateBlock={onCreateBlock}
                      onDuplicateBlock={onDuplicateBlock}
                      onDeleteBlock={onDeleteBlock}
                      onUpdateBlock={onUpdateBlock}
                      onUpdateGridItem={onUpdateGridItem}
                      onDeleteGridItem={onDeleteGridItem}
                      onDuplicateGridItem={onDuplicateGridItem}
                      onMoveGridItem={onMoveGridItem}
                      onMoveBadge={onMoveBadge}
                      onMoveButton={onMoveButton}
                      onMoveListItem={onMoveListItem}
                      onDeleteBadge={onDeleteBadge}
                      onDuplicateBadge={onDuplicateBadge}
                      onDeleteButton={onDeleteButton}
                      onDuplicateButton={onDuplicateButton}
                      onDeleteListItem={onDeleteListItem}
                      onDuplicateListItem={onDuplicateListItem}
                      onDeleteSectionBadge={onDeleteSectionBadge}
                      onDuplicateSectionBadge={onDuplicateSectionBadge}
                      onMoveSectionBadge={onMoveSectionBadge}
                      onUploadGridItemImage={onUploadGridItemImage}
                      onUploadBlockImage={onUploadBlockImage}
                      onAddRow={onAddRow}
                      onAddColumnAfter={onAddColumnAfter}
                      onStackColumnBelow={onStackColumnBelow}
                      onAppendNestedRow={onAppendNestedRow}
                      onDeleteNestedRow={onDeleteNestedRow}
                      onUnwrapNestedColumn={onUnwrapNestedColumn}
                      onDeleteRow={onDeleteRow}
                      onDuplicateRow={onDuplicateRow}
                      onMoveRow={onMoveRow}
                      onSaveRowTemplate={onSaveRowTemplate}
                      onSaveElementTemplate={onSaveElementTemplate}
                      onMoveBlockWithinColumn={onMoveBlockWithinColumn}
                      onDropRowTemplate={onDropRowTemplate}
                      onDropElementTemplate={onDropElementTemplate}
                      onOpenSpacingSettings={onOpenSpacingSettings}
                      onOpenElementsPanel={onOpenElementsPanel}
                      onChangeLayout={onChangeLayout}
                      spacingOverlayEnabled={spacingOverlayEnabled}
                      nestingDepth={nestingDepth + 1}
                      nestedOwnerColumnKey={columnKey}
                    />
                  </div>
                </article>
              );
            }
            return (
              <Fragment key={columnKey}>
                <article
                  key={columnKey}
                  id={columnKey}
                  data-builder-object-type="column"
                  data-builder-section-id={section.id}
                  data-builder-row-index={rowMeta?.rowIndex}
                  data-builder-column-key={columnKey}
                  data-builder-element-scope={`column-${columnKey}`}
                  data-builder-column-empty={blocks.length === 0 ? "true" : undefined}
                  data-builder-interaction-state={columnInteractionState}
                  data-builder-double-click-inspector="true"
                  className={`${structuralColumn.className} ${builderInteractionClassName(
                    columnTarget,
                    columnInteractionState,
                  )} ${
                    hasScrollPinned
                      ? `w-full ${
                          isColumnActive
                            ? "is-selected-column"
                            : ""
                        } ${
                          hoveredTarget?.type === "column" &&
                          hoveredTarget.sectionId === section.id &&
                          hoveredTarget.columnKey === columnKey
                            ? "is-hovered-column"
                            : ""
                        } ${
                          hoveredTarget?.type === "row" &&
                          hoveredTarget.sectionId === section.id &&
                          hoveredTarget.rowIndex === rowMeta?.rowIndex
                            ? "is-hovered-row"
                            : ""
                        } ${
                          activeDragOver?.type === "column" &&
                          activeDragOver.columnKey === columnKey
                            ? "is-drag-over"
                            : ""
                        }`
                      : `shop-builder-content-layout-card shop-card-preset--${cardStyle} ${
                          blocks.length === 0 ? "is-empty-column" : ""
                        } ${
                          isColumnActive
                            ? "is-selected-column"
                            : ""
                        } ${
                          hoveredTarget?.type === "column" &&
                          hoveredTarget.sectionId === section.id &&
                          hoveredTarget.columnKey === columnKey
                            ? "is-hovered-column"
                            : ""
                        } ${
                          hoveredTarget?.type === "row" &&
                          hoveredTarget.sectionId === section.id &&
                          hoveredTarget.rowIndex === rowMeta?.rowIndex
                            ? "is-hovered-row"
                            : ""
                        } ${
                          activeDragOver?.type === "column" &&
                          activeDragOver.columnKey === columnKey
                            ? "is-drag-over"
                            : ""
                        }`
                  }`}
                  style={structuralColumn.style}
                  onDragOver={(event) => {
                    const types = Array.from(event.dataTransfer.types);
                    const isElementDrag =
                      types.includes("application/x-builder-block") ||
                      types.includes("application/x-builder-new-block") ||
                      getBuilderTemplateDragType(event.dataTransfer.types) ===
                        "element";

                    if (isElementDrag) {
                      event.preventDefault();
                      event.stopPropagation();

                      if (blocks.length === 0) {
                        if (
                          !activeDragOver ||
                          activeDragOver.type !== "column" ||
                          activeDragOver.columnKey !== columnKey
                        ) {
                          onCanvasDragOverChange({
                            type: "column",
                            sectionId: section.id,
                            columnKey,
                            placement: "inside",
                          });
                        }
                      }

                      event.dataTransfer.dropEffect =
                        types.includes("application/x-builder-new-block") ||
                        getBuilderTemplateDragType(event.dataTransfer.types) ===
                          "element"
                          ? "copy"
                          : "move";
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onCanvasDragOverChange(null);

                    const templateId = event.dataTransfer.getData(
                      BUILDER_TEMPLATE_DND_TYPE,
                    );
                    if (templateId) {
                      onDropElementTemplate({
                        templateId,
                        sectionId: section.id,
                        columnKey,
                      });
                      return;
                    }
                    const newBlockKind = event.dataTransfer.getData(
                      "application/x-builder-new-block",
                    ) as LayoutBlockKind;
                    if (newBlockKind && newBlockKind in layoutBlockLabels) {
                      onCreateBlock({
                        sectionId: section.id,
                        targetColumnKey: columnKey,
                        kind: newBlockKind,
                      });
                      return;
                    }

                    const payload = event.dataTransfer.getData(
                      "application/x-builder-block",
                    );
                    if (!payload) return;
                    try {
                      const parsed = JSON.parse(payload) as {
                        sectionId: string;
                        sourceColumnKey: string;
                        sourceBlockKey: string;
                      };
                      onMoveBlock({
                        ...parsed,
                        targetSectionId: section.id,
                        targetColumnKey: columnKey,
                      });
                    } catch {
                      onBlockDragEnd();
                    }
                    onBlockDragEnd();
                  }}
                >
                  <LayoutAdvancedStyle
                    css={structuralColumn.column.advanced?.css}
                    scope={`column-${columnKey}`}
                  />
                  {columnChrome.showSpacing && (
                    <BoxSpacingOverlay
                      kind="column"
                      labels={columnSpacingOverlayLabels(
                        rowMeta,
                        shellSettings,
                        section.id,
                        columnKey,
                      )}
                      onOpenSpacingSettings={onOpenSpacingSettings}
                    />
                  )}

                  <div
                    className={`shop-builder-column-content${
                      structuralColumn.column.background?.videoUrl
                        ? " shop-builder-column-content--media-sticky uk-tile uk-position-z-index"
                        : ""
                    }${
                      structuralColumn.column.sticky?.mode === "column-within-row" && structuralColumn.column.verticalAlign === "middle"
                        ? " uk-flex uk-flex-middle"
                        : structuralColumn.column.sticky?.mode === "column-within-row" && structuralColumn.column.verticalAlign === "bottom"
                          ? " uk-flex uk-flex-bottom"
                          : ""
                    }`}
                    data-uk-sticky={structuralColumn.stickyDeclaration}
                  >
                    {structuralColumn.column.background?.videoUrl ? (
                      <video
                        className="shop-builder-column-background-video"
                        src={structuralColumn.column.background.videoUrl}
                        autoPlay
                        muted
                        loop
                        playsInline
                        aria-hidden="true"
                      />
                    ) : null}
                    {blocks.length === 0 && (
                      <div
                        className="builder-preview-drop-zone"
                        aria-label={`Drop element into row ${(rowMeta?.rowIndex ?? 0) + 1}, column ${(rowMeta?.columnIndex ?? index) + 1}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectColumn(section.id, columnKey);
                          onOpenElementsPanel();
                        }}
                      >
                        <span className="builder-structural-placeholder-mark">
                          <Plus size={14} />
                        </span>
                        <span className="builder-structural-placeholder-copy">
                          <strong>
                            Column {(rowMeta?.columnIndex ?? index) + 1}
                          </strong>
                          <small>Add element</small>
                        </span>
                      </div>
                    )}

                  <ContentPositioningGroup blocks={blocks}>
                    {blocks.map((block, blockIndex) => {
                    const blockKey =
                      block.id ?? `${columnKey}-block-${blockIndex}`;
                    const blockAnimationAttrs = previewAnimationAttrs(
                      block.animation,
                    );
                    const legacySurfaceClass =
                      ["panel", "grid", "hero"].includes(block.kind ?? "") ||
                      !block.panelStyle ||
                      block.panelStyle === "default"
                        ? ""
                        : `shop-card-preset--${block.panelStyle}`;
                    const blockPaddingClass =
                      !hasBuilderVisualSpacing(block.visualStyle?.padding) &&
                      block.elementPadding &&
                      block.elementPadding !== "inherit" &&
                      block.elementPadding !== "none"
                        ? `is-padding-${block.elementPadding}`
                        : "";
                    const blockAlignClass =
                      block.elementAlign &&
                      block.elementAlign !== "left" &&
                      !isYoothemeCenteredPositionedPanel(block)
                        ? `is-align-${block.elementAlign}`
                        : "";
                    const isElementActive =
                      selectedSectionId === section.id &&
                      selectedLayoutColumnKey === columnKey &&
                      selectedLayoutBlockKey === blockKey;
                    const blockTarget: BuilderInteractionTarget = {
                      type: "block",
                      sectionId: section.id,
                      columnKey,
                      blockKey,
                    };
                    const blockInteractionState = resolveBuilderInteractionState({
                      target: blockTarget,
                      selected: selectedTarget,
                      hovered: hoveredTarget,
                      editing: editingTarget,
                      insertionTarget:
                        activeDragOver?.type === "block" &&
                        activeDragOver.blockKey === blockKey,
                    });
                    const blockChrome = resolveBuilderInteractionChrome({
                      state: blockInteractionState,
                      spacingActive: spacingOverlayEnabled,
                      dragging: draggingLayoutBlockKey === blockKey,
                      hoverToolbarReady: builderTargetsEqual(
                        blockTarget,
                        hoverToolbarTarget,
                      ),
                    });

                    return (
                      <div
                        key={blockKey}
                        id={blockKey}
                        data-builder-object-type="block"
                        data-builder-section-id={section.id}
                        data-builder-column-key={columnKey}
                        data-builder-block-key={blockKey}
                        data-builder-element-scope={elementAdvancedScope(block)}
                        data-builder-has-advanced-css={
                          resolveElementAdvanced(block).customCss ? "true" : undefined
                        }
                        data-builder-interaction-state={blockInteractionState}
                        data-builder-double-click-inspector="true"
                        draggable={false}
                        className={`builder-preview-layout-block ${builderInteractionClassName(
                          blockTarget,
                          blockInteractionState,
                        )} ${getUikitMarginClass((block as any).elementMargin ?? block.gridMargin)} ${getGeneralElementShellClassName(block)} shop-builder-element-shell is-${
                          block.kind ?? "text"
                        } ${legacySurfaceClass} ${
                          block.kind === "scrollPinnedDemo"
                            ? ""
                            : `${blockPaddingClass} ${blockAlignClass} ${visualStyleClassName(block.visualStyle)} ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`
                        } ${
                          selectedLayoutBlockKey === blockKey
                            ? "is-selected-block"
                            : ""
                        } ${
                          hoveredTarget?.type === "block" &&
                          hoveredTarget.sectionId === section.id &&
                          hoveredTarget.columnKey === columnKey &&
                          hoveredTarget.blockKey === blockKey
                            ? "is-hovered-block"
                            : ""
                        } ${
                          draggingLayoutBlockKey === blockKey
                            ? "is-dragging-block"
                            : ""
                        } ${
                          activeDragOver?.type === "block" &&
                          activeDragOver.blockKey === blockKey &&
                          activeDragOver.placement === "above"
                            ? "is-drag-over-above"
                            : ""
                        } ${
                          activeDragOver?.type === "block" &&
                          activeDragOver.blockKey === blockKey &&
                          activeDragOver.placement === "below"
                            ? "is-drag-over-below"
                            : ""
                        } ${previewAnimationClassName(block.animation)}`}
                        style={
                          {
                            "--builder-element-bg":
                              block.elementBackgroundMode === "transparent"
                                ? "transparent"
                                : block.elementBackgroundMode === "custom"
                                  ? (block.elementBackground ?? "#ffffff")
                                  : undefined,
                            "--builder-radius":
                              block.borderRadius !== undefined
                                ? `${block.borderRadius}px`
                                : undefined,
                            "--builder-card-radius":
                              block.borderRadius !== undefined
                                ? `${block.borderRadius}px`
                                : undefined,
                            ...blockButtonCssVars(block),
                            ...getGeneralElementShellStyle(block),
                            ...getContentPositioningGroupChildStyle(block, blocks),
                            ...blockAnimationAttrs.style,
                          } as CSSProperties
                        }
                        {...blockAnimationAttrs.data}
                        {...parseSafeElementAttributes(resolveElementAdvanced(block).customAttributes)}
                        onDragStart={(event) => {
                          event.stopPropagation();
                          const payload = JSON.stringify({
                            sectionId: section.id,
                            sourceColumnKey: columnKey,
                            sourceBlockKey: blockKey,
                          });
                          event.dataTransfer.setData(
                            "application/x-builder-block",
                            payload,
                          );
                          event.dataTransfer.setData(
                            "text/plain",
                            `builder-block:${blockKey}`,
                          );
                          event.dataTransfer.effectAllowed = "move";
                          onBlockDragStart(blockKey);
                          createDragGhost(
                            event,
                            layoutBlockLabels[block.kind!] || "Block",
                          );
                        }}
                        onDragOver={(event) => {
                          const types = Array.from(event.dataTransfer.types);
                          const isElementDrag =
                            types.includes("application/x-builder-block") ||
                            types.includes("application/x-builder-new-block") ||
                            getBuilderTemplateDragType(
                              event.dataTransfer.types,
                            ) === "element";

                          if (isElementDrag) {
                            event.preventDefault();
                            event.stopPropagation();

                            const rect = event.currentTarget.getBoundingClientRect();
                            const placement = getElementDropPlacement(event.clientY, rect);
                            if (
                              !activeDragOver ||
                              activeDragOver.type !== "block" ||
                              activeDragOver.blockKey !== blockKey ||
                              activeDragOver.placement !== placement
                            ) {
                              onCanvasDragOverChange({
                                type: "block",
                                sectionId: section.id,
                                columnKey,
                                blockKey,
                                placement,
                              });
                            }

                            event.dataTransfer.dropEffect =
                              types.includes(
                                "application/x-builder-new-block",
                              ) ||
                              getBuilderTemplateDragType(
                                event.dataTransfer.types,
                              ) === "element"
                                ? "copy"
                                : "move";
                          }
                        }}
                        onDrop={(event) => {
                          event.preventDefault();
                          event.stopPropagation();

                          const placement =
                            activeDragOver?.type === "block" &&
                            activeDragOver.blockKey === blockKey &&
                            (activeDragOver.placement === "above" ||
                              activeDragOver.placement === "below")
                              ? activeDragOver.placement
                              : "above";
                          onCanvasDragOverChange(null);

                          const templateId = event.dataTransfer.getData(
                            BUILDER_TEMPLATE_DND_TYPE,
                          );
                          if (templateId) {
                            onDropElementTemplate({
                              templateId,
                              sectionId: section.id,
                              columnKey,
                              targetBlockKey: blockKey,
                              placement,
                            });
                            return;
                          }
                          const newBlockKind = event.dataTransfer.getData(
                            "application/x-builder-new-block",
                          ) as LayoutBlockKind;
                          if (
                            newBlockKind &&
                            newBlockKind in layoutBlockLabels
                          ) {
                            onCreateBlock({
                              sectionId: section.id,
                              targetColumnKey: columnKey,
                              targetBlockKey: blockKey,
                              kind: newBlockKind,
                              placement,
                            });
                            return;
                          }

                          const payload = event.dataTransfer.getData(
                            "application/x-builder-block",
                          );
                          if (!payload) return;
                          try {
                            const parsed = JSON.parse(payload) as {
                              sectionId: string;
                              sourceColumnKey: string;
                              sourceBlockKey: string;
                            };
                            onMoveBlock({
                              ...parsed,
                              targetSectionId: section.id,
                              targetColumnKey: columnKey,
                              targetBlockKey: blockKey,
                              placement,
                            });
                          } catch {
                            onBlockDragEnd();
                          }
                          onBlockDragEnd();
                        }}
                        onDragEnd={() => {
                          onCanvasDragOverChange(null);
                          onBlockDragEnd();
                        }}
                      >
                        <ElementAdvancedStyle block={block} />
                        {blockChrome.showSpacing && (
                          <BoxSpacingOverlay
                            kind="element"
                            labels={elementSpacingOverlayLabels(
                              block,
                              shellSettings,
                              section.id,
                              columnKey,
                              blockKey,
                            )}
                            onOpenSpacingSettings={onOpenSpacingSettings}
                          />
                        )}
                        {blockChrome.showDragHandle && (
                          <span
                            className="builder-preview-drag-handle"
                            aria-hidden="true"
                            title="Drag element"
                          >
                            ::
                          </span>
                        )}
                        {block.kind !== "products" &&
                        block.kind?.startsWith("product") ? (
                          <PreviewProductBlockContent
                            block={block}
                            product={previewProduct}
                          />
                        ) : (block as any).kind === "button" ? (
                          <UikitButton block={block} />
                        ) : block.kind === "breadcrumbs" ? (
                          <UikitBreadcrumbs block={block} />
                        ) : block.kind === "icon" ? (
                          <UikitIcon block={block} />
                        ) : block.kind === "list" ? (
                          <UikitList block={block} />
                        ) : block.kind === "subnav" ? (
                          <UikitSubnav block={block} />
                        ) : block.kind === "accordion" ? (
                          <UikitAccordion
                            block={block}
                            items={block.accordionItems ?? []}
                            multiple={block.accordionMultiple}
                            collapsible={block.accordionCollapsible}
                            active={block.accordionOpenItems}
                            style={block.accordionStyle}
                            indicator={block.accordionIndicator}
                            indicatorPosition={block.accordionIndicatorPosition}
                            titleEmphasis={block.accordionTitleEmphasis}
                            itemSpacing={block.accordionItemSpacing}
                            contentSpacing={block.accordionContentSpacing}
                            divider={block.accordionDivider}
                            titleStyle={block.accordionTitleStyle}
                            contentStyle={block.accordionContentStyle}
                          />
                        ) : block.kind === "text" ? (
                          <UikitText
                            sourceId={block.id}
                            eyebrow={block.eyebrow}
                            title={block.title}
                            content={block.body}
                            variant={block.textVariant}
                            typography={block.typography}
                            typographyRole={block.textTypographyRole}
                            textColor={block.textColor}
                            dropcap={block.textDropcap}
                            columns={block.textColumns}
                            columnDivider={block.textColumnDivider}
                            columnBreakpoint={block.textColumnBreakpoint}
                            htmlElement={block.textHtmlElement}
                            margin={block.visualStyle?.layout?.marginMode ?? (block as any).margin}
                            maxWidth={block.visualStyle?.layout?.maxWidth ?? (block as any).maxWidth}
                            maxWidthBreakpoint={block.visualStyle?.layout?.maxWidthBreakpoint ?? (block as any).maxWidthBreakpoint}
                            blockAlign={block.elementAlign ?? block.visualStyle?.layout?.blockAlign}
                            align={block.textAlign ?? block.visualStyle?.layout?.textAlign}
                            textAlignBreakpoint={block.visualStyle?.layout?.textAlignBreakpoint}
                            removeTopMargin={(block as any).removeTopMargin ?? block.visualStyle?.layout?.removeTopMargin}
                            removeBottomMargin={(block as any).removeBottomMargin ?? block.visualStyle?.layout?.removeBottomMargin}
                          />
                        ) : block.kind === "heading" ? (
                          <UikitHeading block={block} isCanvas />
                        ) : block.kind === "gallery" ? (
                          <UikitGallery block={block} isCanvas />
                        ) : block.kind === "datePicker" ? (
                          <UikitDatePicker block={block} />
                        ) : block.kind === "hero" ? (
                          <div
                            className={`shop-builder-column-block shop-builder-column-block--hero ${typographyRoleClass(block.contentTypographyRole)} ${block.heroContentAlign ? `shop-builder-hero--align-${block.heroContentAlign}` : ""} ${block.heroVerticalAlign ? `shop-builder-hero--valign-${block.heroVerticalAlign}` : ""} ${block.heroHeight ? `shop-builder-hero--height-${block.heroHeight}` : ""} ${block.heroMediaPlacement ? `shop-builder-hero--media-${block.heroMediaPlacement}` : ""} ${block.heroInverse ? "uk-light" : ""} ${block.carouselSettings?.variant === "antigravity" ? "shop-builder-hero--antigravity shop-builder-hero--antigravity-block" : ""} ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""} ${(block as any).margin && (block as any).margin !== "none" ? `uk-margin-${(block as any).margin}` : ""} ${block.animation && typeof block.animation === "string" && block.animation !== "none" ? `uk-animation-${block.animation}` : ""} ${(block as any).visibility && (block as any).visibility !== "always" ? `uk-${(block as any).visibility}` : ""}`.trim()}
                            style={{ textAlign: block.heroContentAlign, maxWidth: block.heroContentWidth === "full" ? "none" : block.heroContentWidth === "small" ? "42rem" : block.heroContentWidth === "medium" ? "56rem" : "72rem" }}
                          >
                            <div
                              className={
                                block.carouselSettings?.variant ===
                                "antigravity"
                                  ? "shop-builder-hero-content-left"
                                  : ""
                              }
                            >
                              {block.eyebrow && (
                                <InlineEditableText
                                  as="span"
                                  className={`shop-builder-eyebrow ${typographyRoleClass(block.metaTypographyRole)} ${getUikitTextClass((block as any).metaStyle)}`}
                                  typography={block.typography}
                                  value={block.eyebrow}
                                  onChange={(eyebrow) =>
                                    onUpdateBlock(
                                      section.id,
                                      columnKey,
                                      blockKey,
                                      {
                                        eyebrow,
                                      },
                                    )
                                  }
                                />
                              )}
                              {block.title &&
                                (block.typewriterEnabled ||
                                block.carouselSettings?.variant ===
                                  "antigravity" ? (
                                  <DashboardTypog
                                    as={block.heroHeadingElement ?? "h2"}
                                    className={`${typographyRoleClass(block.titleTypographyRole)} ${getUikitHeadingClass(
                                      block.heroHeadingElement ?? "h2",
                                      block.heroHeadingStyle ?? "xlarge",
                                    )} ${
                                      block.textGradientPreset &&
                                      block.textGradientPreset !== "none"
                                        ? `text-gradient--${block.textGradientPreset}`
                                        : block.carouselSettings?.variant ===
                                            "antigravity"
                                          ? "shop-builder-title--gradient"
                                          : ""
                                    }`}
                                    typography={block.typography}
                                  >
                                    <TypewriterText
                                      text={block.title}
                                      phrases={block.typewriterPhrases}
                                      speed={block.typewriterSpeed}
                                      eraseSpeed={block.typewriterEraseSpeed}
                                      delay={block.typewriterDelay}
                                      loop={block.typewriterLoop}
                                      useGradient={block.typewriterUseGradient}
                                      gradientPreset={
                                        block.textGradientPreset ??
                                        block.typewriterGradientPreset
                                      }
                                      customStart={
                                        block.textGradientCustomStart
                                      }
                                      customMiddle={
                                        block.textGradientCustomMiddle
                                      }
                                      customEnd={block.textGradientCustomEnd}
                                      customAngle={
                                        block.textGradientCustomAngle
                                      }
                                      customStartOffset={
                                        block.textGradientCustomStartOffset
                                      }
                                      customMiddleOffset={
                                        block.textGradientCustomMiddleOffset
                                      }
                                      customEndOffset={
                                        block.textGradientCustomEndOffset
                                      }
                                      typography={block.typography}
                                      area="title"
                                      preserveHeight={
                                        block.typewriterPreserveHeight !== false
                                      }
                                      reservedLines={
                                        block.typewriterReservedLines ?? 1
                                      }
                                      mobileReservedLines={
                                        block.typewriterMobileReservedLines ?? 2
                                      }
                                    />
                                  </DashboardTypog>
                                ) : (
                                  <InlineEditableText
                                    as={(block.heroHeadingElement ?? "h2") as any}
                                    className={`${typographyRoleClass(block.titleTypographyRole)} ${getUikitHeadingClass(block.heroHeadingElement ?? "h2", block.heroHeadingStyle ?? "xlarge")} ${
                                      block.textGradientPreset &&
                                      block.textGradientPreset !== "none" &&
                                      block.textGradientPreset !== "custom"
                                        ? `text-gradient--${block.textGradientPreset}`
                                        : block.carouselSettings?.variant ===
                                            "antigravity"
                                          ? "shop-builder-title--gradient"
                                          : ""}`}
                                    typography={block.typography}
                                    style={
                                      block.textGradientPreset === "custom"
                                        ? {
                                            backgroundImage: `linear-gradient(${block.textGradientCustomAngle ?? 135}deg, ${block.textGradientCustomStart ?? "#ffffff"} ${block.textGradientCustomStartOffset ?? 0}%, ${block.textGradientCustomMiddle ?? "#60a5fa"} ${block.textGradientCustomMiddleOffset ?? 50}%, ${block.textGradientCustomEnd ?? "#c084fc"} ${block.textGradientCustomEndOffset ?? 100}%)`,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                            display: "inline-block",
                                          }
                                        : undefined
                                    }
                                    value={block.title}
                                    onChange={(title) =>
                                      onUpdateBlock(
                                        section.id,
                                        columnKey,
                                        blockKey,
                                        {
                                          title,
                                        },
                                      )
                                    }
                                  />
                                ))}
                              {block.body &&
                                (block.typewriterEnabled && !block.title ? (
                                  <DashboardTypog
                                    as="p"
                                    className={`${typographyRoleClass(block.contentTypographyRole)} ${getUikitTextClass((block as any).contentStyle)}`}
                                    typography={block.typography}
                                  >
                                    <TypewriterText
                                      text={block.body}
                                      phrases={block.typewriterPhrases}
                                      speed={block.typewriterSpeed}
                                      eraseSpeed={block.typewriterEraseSpeed}
                                      delay={block.typewriterDelay}
                                      loop={block.typewriterLoop}
                                      useGradient={block.typewriterUseGradient}
                                      gradientPreset={
                                        block.textGradientPreset ??
                                        block.typewriterGradientPreset
                                      }
                                      customStart={
                                        block.textGradientCustomStart
                                      }
                                      customMiddle={
                                        block.textGradientCustomMiddle
                                      }
                                      customEnd={block.textGradientCustomEnd}
                                      customAngle={
                                        block.textGradientCustomAngle
                                      }
                                      customStartOffset={
                                        block.textGradientCustomStartOffset
                                      }
                                      customMiddleOffset={
                                        block.textGradientCustomMiddleOffset
                                      }
                                      customEndOffset={
                                        block.textGradientCustomEndOffset
                                      }
                                      typography={block.typography}
                                      area="body"
                                      preserveHeight={
                                        block.typewriterPreserveHeight !== false
                                      }
                                      reservedLines={
                                        block.typewriterReservedLines ?? 1
                                      }
                                      mobileReservedLines={
                                        block.typewriterMobileReservedLines ?? 2
                                      }
                                    />
                                  </DashboardTypog>
                                ) : (
                                  <InlineEditableText
                                    as="p"
                                    className={`${typographyRoleClass(block.contentTypographyRole)} ${getUikitTextClass((block as any).contentStyle)}`}
                                    typography={block.typography}
                                    value={block.body}
                                    onChange={(body) =>
                                      onUpdateBlock(
                                        section.id,
                                        columnKey,
                                        blockKey,
                                        {
                                          body,
                                        },
                                      )
                                    }
                                  />
                                ))}
                              <div
                                className={`shop-builder-buttons ${block.premiumButtonStyle && block.premiumButtonStyle !== "default" ? "" : `shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}`}
                                style={previewButtonsStyle(
                                  block.buttonsLayout,
                                  block.elementAlign,
                                  block.buttonGap,
                                )}
                              >
                                {block.heroPrimaryActionVisible !== false && block.buttonLabel && (
                                  <DashboardTypog
                                    as="a"
                                    area="button"
                                    className={`builder-hero-action ${getUikitButtonClass(block.buttonStyle ?? "primary", block.size ?? "default")}`}
                                    href={block.buttonUrl || "#"}
                                    {...builderLinkTargetProps(block.buttonTarget)}
                                  >
                                    {block.buttonLabel}
                                  </DashboardTypog>
                                )}
                                {block.heroSecondaryActionVisible !== false && block.secondaryButtonLabel && (
                                  <DashboardTypog
                                    as="a"
                                    area="button"
                                    className={`builder-hero-action ${getUikitButtonClass(block.secondaryButtonStyle ?? "secondary", block.secondaryButtonSize ?? "default")}`}
                                    href={block.secondaryButtonUrl || "#"}
                                    {...builderLinkTargetProps(block.secondaryButtonTarget)}
                                  >
                                    {block.secondaryButtonLabel}
                                  </DashboardTypog>
                                )}
                              </div>
                            </div>
                            {block.carouselSettings?.variant ===
                              "antigravity" && (
                              <div className="shop-builder-hero-media shop-builder-hero-media--antigravity">
                                <AntigravityTerminal />
                              </div>
                            )}
                          </div>
                        ) : block.kind === "panel" ? (
                          (() => {
                            const isPanelImagePlaceholder =
                              !block.imageUrl ||
                              !block.imageUrl.trim();
                            const panelMetaStyleName = String((block as any).metaStyle ?? "").replace(/^uk-/, "").toLowerCase();
                            const panelMetaIsHeading = /^(?:h[1-6]|heading-h[1-6])$/.test(panelMetaStyleName);
                            const panelMetaHasExplicitMargin = (block as any).metaMarginTop !== undefined;

                            const panelTitleStyle = {
                              color: "var(--builder-card-title-color, inherit)",
                              textAlign:
                                "var(--builder-card-title-align, inherit)" as React.CSSProperties["textAlign"],
                              margin: "var(--builder-card-title-margin, 0) 0 0",
                            } as React.CSSProperties;
                            const panelMetaStyle = {
                              color: panelMetaIsHeading
                                ? "var(--builder-card-title-color, inherit)"
                                : "var(--builder-card-meta-color, inherit)",
                              fontSize: panelMetaIsHeading
                                ? undefined
                                : "var(--builder-card-meta-size, inherit)",
                              fontFamily: panelMetaIsHeading
                                ? "var(--uk-heading-font-family, inherit)"
                                : undefined,
                              textTransform:
                                "var(--builder-card-meta-transform, none)" as React.CSSProperties["textTransform"],
                              marginTop: panelMetaHasExplicitMargin
                                ? undefined
                                : panelMetaIsHeading
                                ? "var(--builder-card-meta-spacing, var(--uk-global-margin, 20px))"
                                : "var(--builder-card-meta-spacing, 0)",
                            } as React.CSSProperties;
                            const panelBodyStyle = {
                              color:
                                "var(--builder-card-content-color, inherit)",
                              fontSize:
                                "var(--builder-card-content-size, inherit)",
                              lineHeight:
                                "var(--builder-card-content-line-height, inherit)",
                              maxWidth:
                                "var(--builder-card-content-max-width, none)",
                            } as React.CSSProperties;

                            const panelMediaPlacement = block.panelMediaPlacement ?? "top";
                            const panelMediaPresentation = getUikitPanelMediaStyle({ ratio: block.imageRatio, fit: block.imageFit ?? block.panelMediaFit, alignment: block.imageAlignment ?? block.panelMediaAlignment ?? "center", position: (block as any).imagePosition });
                            const panelMediaClass = getUikitPanelMediaClass(panelMediaPlacement);
                            const panelLayoutClass = getUikitPanelLayoutClass(panelMediaPlacement, block.panelMediaWidth ?? "medium");
                            const panelSideMedia = panelMediaPlacement === "left" || panelMediaPlacement === "right";
                            const panelImageLink = block.linkImage ?? ((block.yoothemeSource as any)?.props?.image_link === true || (block.yoothemeSource as any)?.props?.image_link === "true");
                            const panelMediaVerticalAlign = block.panelMediaVerticalAlign ?? "top";
                            const panelSvgColorClass = getUikitSvgColorClass(block.imageSvgColor);
                            const panelSvgColor = getUikitSvgColor(block.imageSvgColor);
                            const panelSvgAnimateClass = block.imageSvgAnimate === true ? "uk-animation-stroke" : "";
                            const panelImageDimension = (value: unknown) => value === undefined || value === null || value === "" ? undefined : /^-?\d+(?:\.\d+)?$/.test(String(value)) ? `${value}px` : String(value);
                            const panelImageShape = (block as any).imageShape ?? (block as any).imageBorder ?? "none";
                            const panelImageRadius = panelImageShape === "circle" ? "50%" : panelImageShape === "pill" ? "9999px" : panelImageShape === "rounded" ? "6px" : undefined;
                            const panelImageClass = [
                              (block as any).imageShadow && (block as any).imageShadow !== "none" ? `uk-box-shadow-${(block as any).imageShadow}` : "",
                              (block as any).imageBoxDecoration && (block as any).imageBoxDecoration !== "none" ? `uk-background-${(block as any).imageBoxDecoration}` : "",
                              (block as any).imageHoverTransition && (block as any).imageHoverTransition !== "none" ? `uk-transition-${(block as any).imageHoverTransition} uk-transition-opaque` : "",
                              (block as any).imageTextColor && (block as any).imageTextColor !== "none" ? `uk-text-${(block as any).imageTextColor}` : "",
                              (block as any).imageInverse === true ? "uk-light" : "",
                            ].filter(Boolean).join(" ");
                            const panelTitleClass = block.panelTitleStyle && block.panelTitleStyle !== "inherit" ? (block.panelTitleStyle.startsWith("heading-") || ["h1","h2","h3","h4","h5","h6"].includes(block.panelTitleStyle) ? `uk-${block.panelTitleStyle}` : getUikitHeadingClass(block.panelTitleStyle, block.panelTitleStyle)).replace(/\buk-margin-remove-top\b/g, "").trim() : "";
                            const panelTitleDecorationClass = block.titleDecoration && block.titleDecoration !== "none" ? `uk-heading-${block.titleDecoration}` : "";
                            const panelTitleColorClass = block.titleColor && !["none", "default", "inherit"].includes(block.titleColor)
                              ? (block.titleColor.startsWith("uk-text-") ? block.titleColor : `uk-text-${block.titleColor}`)
                              : "";
                            const panelTitleHoverClass = block.panelTitleHoverStyle === "heading-link" ? "uk-link-heading" : block.panelTitleHoverStyle === "default-link" ? "uk-link" : "";
                            const panelTitleGridWidth = ({ expand: "100%", "5-6": "80%", "3-4": "75%", "2-3": "66.6667%", "3-5": "60%", "1-2": "50%", "2-5": "40%", "1-3": "33.3333%", "1-4": "25%", "1-5": "20%" } as Record<string, string>)[String(block.panelTitleGridWidth ?? "")] ?? (/^\d+%$/.test(String(block.panelTitleGridWidth ?? "")) ? String(block.panelTitleGridWidth) : undefined);
                            const panelTitleLayoutStyle = block.panelShowMedia !== false && panelTitleGridWidth
                              ? { width: panelTitleGridWidth, maxWidth: panelTitleGridWidth, ...(block.panelTitleAlign === "left" ? { marginLeft: 0, marginRight: "auto" } : {}) }
                              : {};
                            const panelMarginClass = ((block as any).margin && (block as any).margin !== "none" && (block as any).margin !== "default") ? `uk-margin-${(block as any).margin}` : "";
                            const panelAnimationClass = (block.animation && typeof block.animation === "string" && block.animation !== "none") ? `uk-animation-${block.animation}` : "";
                            const panelVisibilityClass = ((block as any).visibility && (block as any).visibility !== "always") ? `uk-${(block as any).visibility}` : "";
                            const panelPresentation = resolvePanelPresentation(block as Record<string, unknown>);
                            const panelMeta = block.eyebrow ? (
                              <InlineEditableText
                                as={((block as any).panelMetaHtmlElement ?? "div") as any}
                                area="eyebrow"
                                className={`shop-builder-eyebrow shop-builder-panel-meta ${typographyRoleClass(block.metaTypographyRole)} ${getUikitTextClass((block as any).metaStyle)} ${getUikitMarginClass((block as any).metaMarginTop)}`}
                                typography={panelMetaIsHeading ? undefined : block.typography}
                                style={{ ...panelMetaStyle, ...panelPresentation.colorStyle }}
                                value={block.eyebrow}
                                onChange={(eyebrow) =>
                                  onUpdateBlock(section.id, columnKey, blockKey, { eyebrow })
                                }
                              />
                            ) : null;

                            return (
                              <div data-builder-block-id={block.id} className={`shop-builder-column-block shop-builder-column-block--panel ${panelLayoutClass} ${panelMarginClass} ${panelAnimationClass} ${panelVisibilityClass} ${typographyRoleClass(block.contentTypographyRole)} ${panelPresentation.className}`.trim()} style={{ ...panelPresentation.colorStyle, ...(block.imageUrl && !isPanelImagePlaceholder && /\.svg(?:[?#].*)?$/i.test(block.imageUrl) ? { overflow: "visible" } : {}) }}>
                                {panelPresentation.linked && (
                                  <a
                                    className="shop-builder-panel-link-overlay"
                                    href={panelPresentation.linkHref}
                                    {...builderLinkTargetProps(block.buttonTarget)}
                                    aria-label={block.title || block.buttonLabel || "Open panel"}
                                  />
                                )}
                                {block.panelShowMedia !== false && (
                                <div
                                  className={`${panelMediaClass} ${panelImageClass} shop-builder-panel-media${isPanelImagePlaceholder ? " is-empty" : ""}`.trim()}
                                  style={{
                                    aspectRatio: panelMediaPresentation.aspectRatio,
                                    position: "relative",
                                    overflow: block.imageUrl && !isPanelImagePlaceholder && /\.svg(?:[?#].*)?$/i.test(block.imageUrl) ? "visible" : "hidden",
                                    backgroundColor: "transparent",
                                    alignSelf: panelMediaVerticalAlign === "center" ? "center" : panelMediaVerticalAlign === "bottom" ? "end" : "start",
                                    minHeight: (block as any).imageHeight ? "0" : undefined,
                                    backgroundSize: panelMediaPresentation.backgroundSize,
                                    backgroundPosition: panelMediaPresentation.backgroundPosition,
                                    width: panelSideMedia ? "100%" : panelImageDimension((block as any).imageWidth) ?? "100%",
                                    maxWidth: typeof (block as any).imageMaxWidth === "number" ? `${(block as any).imageMaxWidth}px` : undefined,
                                    height: panelImageDimension((block as any).imageHeight),
                                    borderRadius: panelImageRadius,
                                  }}
                                >
                                  {panelImageLink && block.buttonUrl && (
                                    <a className="shop-builder-panel-image-link" href={block.buttonUrl} {...builderLinkTargetProps(block.buttonTarget)} aria-label={block.imageAlt || block.title || "Open panel image"} />
                                  )}
                                  {!isPanelImagePlaceholder ? (
                                    <>
                                      {block.imageUrl && /\.svg(?:[?#].*)?$/i.test(block.imageUrl) ? (
                                        <UikitStylableSvg
                                          src={block.imageUrl}
                                          alt={block.imageAlt || ""}
                                          className={`${panelSvgColorClass} ${panelSvgAnimateClass} el-image`.trim()}
                                          color={panelSvgColorClass ? undefined : panelSvgColor}
                                          loading="eager"
                                          fit={panelMediaPresentation.objectFit === "fill" ? "fill" : panelMediaPresentation.objectFit === "contain" ? "contain" : "cover"}
                                          fallback={<img src={block.imageUrl} alt={block.imageAlt || ""} />}
                                          style={{ width: panelSideMedia ? "100%" : panelImageDimension((block as any).imageWidth) ?? "100%", height: panelImageDimension((block as any).imageHeight) ?? panelImageDimension((block as any).imageWidth) ?? "100%", pointerEvents: "none" }}
                                        />
                                      ) : (
                                        <img
                                          src={block.imageUrl || ""}
                                          alt={block.imageAlt || ""}
                                          loading="eager"
                                          aria-hidden="true"
                                          style={{ display: "block", width: "100%", height: "100%", objectFit: panelMediaPresentation.objectFit ?? "cover", objectPosition: panelMediaPresentation.backgroundPosition, pointerEvents: "none" }}
                                        />
                                      )}
                                    </>
                                  ) : (
                                    <div className="builder-media-placeholder-container">
                                      <svg
                                        className="builder-media-placeholder-bg"
                                        viewBox="0 0 800 520"
                                        preserveAspectRatio="none"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <defs>
                                          <linearGradient id="bgGradPanel" x1="0" y1="0" x2="800" y2="520" gradientUnits="userSpaceOnUse">
                                            <stop offset="0%" stopColor="#F2F4F8"/>
                                            <stop offset="100%" stopColor="#EAEEF4"/>
                                          </linearGradient>
                                        </defs>
                                        <rect width="800" height="520" rx="16" fill="url(#bgGradPanel)"/>
                                        <circle cx="760" cy="40" r="230" fill="#FFFFFF" fillOpacity="0.5"/>
                                        <circle cx="40" cy="480" r="220" fill="#FFFFFF" fillOpacity="0.45"/>
                                        <rect x="24" y="24" width="752" height="472" rx="18" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="6 6"/>
                                        <g fill="#BCC6D5">
                                          <circle cx="56" cy="56" r="2.2"/><circle cx="70" cy="56" r="2.2"/><circle cx="84" cy="56" r="2.2"/><circle cx="98" cy="56" r="2.2"/><circle cx="112" cy="56" r="2.2"/>
                                          <circle cx="56" cy="70" r="2.2"/><circle cx="70" cy="70" r="2.2"/><circle cx="84" cy="70" r="2.2"/><circle cx="98" cy="70" r="2.2"/><circle cx="112" cy="70" r="2.2"/>
                                          <circle cx="56" cy="84" r="2.2"/><circle cx="70" cy="84" r="2.2"/><circle cx="84" cy="84" r="2.2"/><circle cx="98" cy="84" r="2.2"/><circle cx="112" cy="84" r="2.2"/>
                                        </g>
                                        <g fill="#BCC6D5">
                                          <circle cx="688" cy="436" r="2.2"/><circle cx="702" cy="436" r="2.2"/><circle cx="716" cy="436" r="2.2"/><circle cx="730" cy="436" r="2.2"/><circle cx="744" cy="436" r="2.2"/>
                                          <circle cx="688" cy="450" r="2.2"/><circle cx="702" cy="450" r="2.2"/><circle cx="716" cy="450" r="2.2"/><circle cx="730" cy="450" r="2.2"/><circle cx="744" cy="450" r="2.2"/>
                                          <circle cx="688" cy="464" r="2.2"/><circle cx="702" cy="464" r="2.2"/><circle cx="716" cy="464" r="2.2"/><circle cx="730" cy="464" r="2.2"/><circle cx="744" cy="464" r="2.2"/>
                                        </g>
                                      </svg>
                                      <div className="builder-media-placeholder-content">
                                        <div className="builder-media-placeholder-icon-frame">
                                          <svg viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <rect width="120" height="90" rx="14" fill="none" stroke="#B8C3D2" strokeWidth="4.5"/>
                                            <circle cx="90" cy="30" r="10" fill="#B8C3D2"/>
                                            <path d="M 8 78 L 46 36 C 48.5 33.5 53.5 33.5 56 36 L 84 68 L 92 58 C 94.5 55.5 99.5 55.5 102 58 L 112 78 Z" fill="#B8C3D2"/>
                                          </svg>
                                        </div>
                                        <h4 className="builder-media-placeholder-title">Select an image</h4>
                                        <p className="builder-media-placeholder-subtitle">Drag and drop, upload, or choose from your media library</p>
                                </div>
                              </div>
                            )}
                            {block.carouselSettings?.variant !== "antigravity" && block.imageUrl && block.heroMediaPlacement && block.heroMediaPlacement !== "none" && (
                              <div className={`shop-builder-hero-media shop-builder-hero-media--${block.heroMediaPlacement}`}>
                                <img src={block.imageUrl} alt={block.imageAlt || block.title || ""} loading={block.heroMediaLoading ?? "lazy"} style={{ width: "100%", height: "100%", objectFit: block.heroMediaFit === "contain" ? "contain" : "cover" }} />
                              </div>
                            )}
                                </div>
                                )}
                                <div className={`uk-card-body shop-builder-panel-content-width-${block.panelContentWidth ?? "auto"}`} style={{ alignSelf: block.panelVerticalAlign === "center" ? "center" : block.panelVerticalAlign === "bottom" ? "end" : "start" }}>
                                  {panelPresentation.metaPosition === "above-title" && panelMeta}
                                  {block.title &&
                                    (block.typewriterEnabled ? (
                                      <DashboardTypog
                                        as={block.panelTitleElement ?? "h3"}
                                        className={`shop-builder-title ${panelTitleClass} ${panelTitleDecorationClass} ${panelTitleColorClass} ${panelTitleHoverClass} ${typographyRoleClass(block.titleTypographyRole)} ${getUikitMarginClass((block as any).titleMarginTop)}`.trim()}
                                        area="title"
                                        typography={undefined}
                                        style={{ ...panelTitleStyle, ...panelTitleLayoutStyle }}
                                      >
                                        <TypewriterText
                                          text={block.title}
                                          phrases={block.typewriterPhrases}
                                          speed={block.typewriterSpeed}
                                          eraseSpeed={
                                            block.typewriterEraseSpeed
                                          }
                                          delay={block.typewriterDelay}
                                          loop={block.typewriterLoop}
                                          useGradient={
                                            block.typewriterUseGradient
                                          }
                                          gradientPreset={
                                            block.textGradientPreset ??
                                            block.typewriterGradientPreset
                                          }
                                          customStart={
                                            block.textGradientCustomStart
                                          }
                                          customMiddle={
                                            block.textGradientCustomMiddle
                                          }
                                          customEnd={
                                            block.textGradientCustomEnd
                                          }
                                          customAngle={
                                            block.textGradientCustomAngle
                                          }
                                          customStartOffset={
                                            block.textGradientCustomStartOffset
                                          }
                                          customMiddleOffset={
                                            block.textGradientCustomMiddleOffset
                                          }
                                          customEndOffset={
                                            block.textGradientCustomEndOffset
                                          }
                                          typography={block.typography}
                                          area="title"
                                          preserveHeight={
                                            block.typewriterPreserveHeight !==
                                            false
                                          }
                                          reservedLines={
                                            block.typewriterReservedLines ?? 1
                                          }
                                          mobileReservedLines={
                                            block.typewriterMobileReservedLines ??
                                            2
                                          }
                                        />
                                      </DashboardTypog>
                                    ) : (
                                      <InlineEditableText
                                        as={block.panelTitleElement ?? "h3"}
                                        className={`shop-builder-title ${panelTitleClass} ${panelTitleDecorationClass} ${panelTitleColorClass} ${panelTitleHoverClass} ${typographyRoleClass(block.titleTypographyRole)} ${getUikitMarginClass((block as any).titleMarginTop)}`.trim()}
                                        area="title"
                                        typography={undefined}
                                        style={{ ...panelTitleStyle, ...panelTitleLayoutStyle }}
                                        value={block.title}
                                        onChange={(title) =>
                                          onUpdateBlock(
                                            section.id,
                                            columnKey,
                                            blockKey,
                                            { title },
                                          )
                                        }
                                      />
                                    ))}
                                  {(panelPresentation.metaPosition === "below-title" || panelPresentation.metaPosition === "above-content") && panelMeta}
                                  {block.body &&
                                    (block.typewriterEnabled && !block.title ? (
                                      <DashboardTypog
                                        as="p"
                                        className={`shop-builder-panel-content-text ${getUikitTextClass((block as any).contentStyle)} ${getUikitMarginClass((block as any).contentMarginTop)}`}
                                        area="body"
                                        typography={block.typography}
                                        style={panelBodyStyle}
                                      >
                                        <TypewriterText
                                          text={block.body}
                                          phrases={block.typewriterPhrases}
                                          speed={block.typewriterSpeed}
                                          eraseSpeed={
                                            block.typewriterEraseSpeed
                                          }
                                          delay={block.typewriterDelay}
                                          loop={block.typewriterLoop}
                                          useGradient={
                                            block.typewriterUseGradient
                                          }
                                          gradientPreset={
                                            block.textGradientPreset ??
                                            block.typewriterGradientPreset
                                          }
                                          customStart={
                                            block.textGradientCustomStart
                                          }
                                          customMiddle={
                                            block.textGradientCustomMiddle
                                          }
                                          customEnd={
                                            block.textGradientCustomEnd
                                          }
                                          customAngle={
                                            block.textGradientCustomAngle
                                          }
                                          customStartOffset={
                                            block.textGradientCustomStartOffset
                                          }
                                          customMiddleOffset={
                                            block.textGradientCustomMiddleOffset
                                          }
                                          customEndOffset={
                                            block.textGradientCustomEndOffset
                                          }
                                          typography={block.typography}
                                          area="body"
                                          preserveHeight={
                                            block.typewriterPreserveHeight !==
                                            false
                                          }
                                          reservedLines={
                                            block.typewriterReservedLines ?? 1
                                          }
                                          mobileReservedLines={
                                            block.typewriterMobileReservedLines ??
                                            2
                                          }
                                        />
                                      </DashboardTypog>
                                    ) : (
                                      <InlineEditableText
                                        as="p"
                                        className={`shop-builder-panel-content-text ${getUikitTextClass((block as any).contentStyle)} ${getUikitMarginClass((block as any).contentMarginTop)}`}
                                        area="body"
                                        typography={block.typography}
                                        style={panelBodyStyle}
                                        value={block.body}
                                        onChange={(body) =>
                                          onUpdateBlock(
                                            section.id,
                                            columnKey,
                                            blockKey,
                                            { body },
                                          )
                                        }
                                      />
                                    ))}
                                  {panelPresentation.metaPosition === "below-content" && panelMeta}

                                  <RenderDashboardChecklist
                                    items={block.items}
                                    iconName={block.listIcon}
                                    colorScheme={block.listIconColorScheme}
                                    typography={block.typography}
                                  />

                                  <div
                                    className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
                                    style={{
                                      ...previewButtonsStyle(
                                        block.buttonsLayout,
                                        block.elementAlign,
                                        block.buttonGap,
                                      ),
                                      width: "100%",
                                      justifyContent: "var(--builder-card-button-align, flex-start)",
                                    }}
                                  >
                                    {!panelPresentation.linked && block.panelActionVisible !== false && block.buttonLabel && (
                                      <DashboardTypog
                                        as="span"
                                        area="button"
                                        className={`shop-builder-panel-action ${getUikitMarginClass((block as any).linkMarginTop)} ${getUikitButtonClass(block.panelActionStyle ?? block.buttonStyle ?? "primary", block.panelActionSize ?? block.size ?? "default")} ${block.fullWidthButton ? "uk-width-1-1" : ""} shop-builder-panel-action--${block.panelActionAlign ?? "inherit"}`}
                                        typography={block.typography}
                                      >
                                        {block.buttonLabel}
                                      </DashboardTypog>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : block.kind === "image" || block.kind === "overlay" ? (
                          <UikitImage
                            block={block}
                            isCanvas
                            shellSettings={shellSettings}
                          />
                        ) : block.kind === "table" ? (
                          <UikitTable block={block} />
                        ) : block.kind === "categoryFilters" ? (
                          <UikitCategoryFilters block={block} isCanvas />
                        ) : block.kind === "scrollPinnedDemo" ? (
                          <div className="shop-builder-column-block shop-builder-column-block--scroll-pinned">
                            <ScrollPinnedDemo block={block} isPreview={true} />
                          </div>
                        ) : block.kind === "panelSlider" ? (
                          <UikitSlider block={block} isCanvas panelMode shellSettings={shellSettings} />
                        ) : block.kind === "slider" || block.kind === "slideshow" || block.kind === "overlaySlider" ? (
                          <UikitSlider block={block} isCanvas shellSettings={shellSettings} />
                        ) : block.kind === "products" ? (
                          <UikitProducts block={block} productContexts={block.dynamicProductContexts} categoryTree={previewCategoryTree} />
                        ) : block.kind === "grid" ? (
                          <GridCardsClient
                            block={block}
                            items={block.gridItems ?? []}
                            gridTitleStyle={{
                              color: "var(--builder-card-title-color, inherit)",
                              fontSize: "var(--builder-card-title-size, inherit)",
                              fontWeight: "var(--builder-card-title-weight, inherit)",
                              textAlign: "var(--builder-card-title-align, inherit)" as React.CSSProperties["textAlign"],
                              margin: "var(--builder-card-title-margin, 0)",
                            }}
                            gridGapClass={gridSpacingClass(block.gridGap, ["none", "small", "medium", "large", "max"], "medium")}
                            gridGapCustom={gridSpacingClass(block.gridGap, ["none", "small", "medium", "large", "max"], "medium") === "custom" ? cssSpacingValue(block.gridGap) : null}
                            imagePaddingClass={Boolean(block.panelImageNoPadding || (block as any).alignImageWithoutPadding) ? "frameless" : gridSpacingClass(block.gridImagePadding, ["frameless", "none", "small", "medium", "max"], "none")}
                            imagePaddingCustom={gridSpacingClass(block.gridImagePadding, ["frameless", "none", "small", "medium", "max"], "none") === "custom" ? cssSpacingValue(block.gridImagePadding) : null}
                            contentPaddingClass={gridSpacingClass(block.gridContentPadding, ["none", "small", "medium", "large"], "medium")}
                            contentPaddingCustom={gridSpacingClass(block.gridContentPadding, ["none", "small", "medium", "large"], "medium") === "custom" ? cssSpacingValue(block.gridContentPadding) : null}
                            limit={typeof block.gridLimit === "number" && block.gridLimit > 0 ? block.gridLimit : (block.gridItems?.length ?? 999)}
                            itemChrome={(item, itemIndex) => (
                              <>
                                <div className="builder-preview-grid-item-tools" data-builder-grid-item-id={item.id ?? itemIndex}>
                                  <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onSelectBlock(section.id, columnKey, blockKey);
                                      onOpenInspector();
                                    }}
                                    aria-label={`Edit grid item ${itemIndex + 1}`}
                                    title="Edit item"
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onDuplicateGridItem(section.id, columnKey, blockKey, itemIndex);
                                    }}
                                    aria-label={`Duplicate grid item ${itemIndex + 1}`}
                                    title="Duplicate item"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onDeleteGridItem(section.id, columnKey, blockKey, itemIndex);
                                    }}
                                    aria-label={`Delete grid item ${itemIndex + 1}`}
                                    title="Delete item"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <span className="builder-preview-grid-drag-handle" aria-hidden="true">::</span>
                              </>
                            )}
                            itemProps={(_, itemIndex) => ({
                              draggable: block.gridSource !== "products",
                              onDragStart: (event) => {
                                if (block.gridSource === "products") return;
                                event.stopPropagation();
                                setDraggingItem({ kind: "grid", blockKey, fromIndex: itemIndex });
                              },
                              onDragOver: (event) => {
                                if (draggingItem?.kind !== "grid" || draggingItem.blockKey !== blockKey || draggingItem.fromIndex === itemIndex) return;
                                event.preventDefault();
                                if (dropHoverIndex !== itemIndex) setDropHoverIndex(itemIndex);
                              },
                              onDragLeave: () => {
                                if (dropHoverIndex === itemIndex) setDropHoverIndex(null);
                              },
                              onDrop: (event) => {
                                event.preventDefault();
                                if (draggingItem?.kind === "grid" && draggingItem.blockKey === blockKey && draggingItem.fromIndex !== itemIndex) {
                                  onMoveGridItem(section.id, columnKey, blockKey, draggingItem.fromIndex, itemIndex);
                                }
                                setDraggingItem(null);
                                setDropHoverIndex(null);
                              },
                              onDragEnd: () => {
                                setDraggingItem(null);
                                setDropHoverIndex(null);
                              },
                              className: `${draggingItem?.kind === "grid" && draggingItem.blockKey === blockKey && draggingItem.fromIndex === itemIndex ? "is-dragging-grid" : ""} ${draggingItem?.kind === "grid" && draggingItem.blockKey === blockKey && dropHoverIndex === itemIndex ? "is-drag-over-grid" : ""}`.trim(),
                            })}
                          />
                        ) : block.kind === "badgeGrid" ? (
                          <UikitBadgeGrid block={block} />
                        ) : block.kind === "fluentForm" ? (
                          <UikitFluentForm block={block} isCanvas />
                        ) : block.kind === "alert" ? (
                          <UikitAlert block={block} />
                        ) : block.kind === "divider" ? (
                          <UikitDivider block={block} />
                        ) : (
                          <div className="shop-builder-column-block shop-builder-column-block--text">
                            {block.eyebrow && (
                              <InlineEditableText
                                as="em"
                                area="eyebrow"
                                value={block.eyebrow}
                                typography={block.typography}
                                onChange={(eyebrow) =>
                                  onUpdateBlock(
                                    section.id,
                                    columnKey,
                                    blockKey,
                                    {
                                      eyebrow,
                                    },
                                  )
                                }
                              />
                            )}
                            {block.title && (
                              <InlineEditableText
                                as="strong"
                                area="title"
                                value={block.title}
                                typography={block.typography}
                                onChange={(title) =>
                                  onUpdateBlock(
                                    section.id,
                                    columnKey,
                                    blockKey,
                                    {
                                      title,
                                    },
                                  )
                                }
                              />
                            )}
                            {block.body && (
                              <InlineEditableText
                                as="p"
                                area="body"
                                value={block.body}
                                typography={block.typography}
                                onChange={(body) =>
                                  onUpdateBlock(
                                    section.id,
                                    columnKey,
                                    blockKey,
                                    {
                                      body,
                                    },
                                  )
                                }
                              />
                            )}

                            <RenderDashboardChecklist
                              items={block.items}
                              iconName={block.listIcon}
                              colorScheme={block.listIconColorScheme}
                              typography={block.typography}
                            />

                            {block.kind === "embed" && (
                              <span>{block.embedMode ?? "code"} block</span>
                            )}
                            <div
                              className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
                              style={previewButtonsStyle(
                                block.buttonsLayout,
                                block.elementAlign,
                                block.buttonGap,
                              )}
                            >
                              {block.buttonLabel && (
                                <DashboardTypog
                                  as="span"
                                  area="button"
                                  className={`shop-builder-cta shop-builder-cta--${block.buttonStyle ?? "primary"} builder-preview-cta`}
                                  typography={block.typography}
                                >
                                  {block.buttonLabel}
                                </DashboardTypog>
                              )}
                              {(block.buttons ?? []).map((btn, btnIdx) => (
                                <DashboardTypog
                                  key={btn.id ?? btnIdx}
                                  as="span"
                                  area="button"
                                  className={`shop-builder-cta shop-builder-cta--${btn.style ?? "primary"} builder-preview-cta`}
                                  typography={block.typography}
                                  style={{ display: "inline-flex" }}
                                >
                                  {btn.label || "Button"}
                                </DashboardTypog>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    })}
                  </ContentPositioningGroup>
                  </div>
                </article>
              </Fragment>
            );
                  })}
                </div>

                {nestingDepth === 0 && <RowInsertControl
                  placement="after"
                  owner={rowTarget}
                  onTemplateDrop={(templateId) =>
                    onDropRowTemplate(
                      templateId,
                      section.id,
                      normalizeBuilderSectionLayout(section).rows[layoutRowIndex].id,
                      "after",
                    )
                  }
                />}
              </div>
            );
          })}
        </div>
        {rowLayoutPicker ? createPortal(rowLayoutPicker, document.body) : null}
      </div>
    );
  }

  if (section.kind === "badgeGrid") {
    return (
      <div className="shop-builder-section-content builder-preview-badge-grid">
        <div>
          {section.eyebrow && (
            <p className="shop-builder-eyebrow">{section.eyebrow}</p>
          )}
          <h2 className="shop-builder-title">{section.title}</h2>
          {section.body && (
            <BodyText className="shop-builder-body">{section.body}</BodyText>
          )}
        </div>
        <div
          className="shop-builder-badges builder-preview-badges"
          style={
            {
              "--builder-preview-columns": section.columns ?? 3,
              "--builder-badge-columns": section.columns ?? 3,
            } as CSSProperties
          }
        >
          {(section.badges ?? []).map((badge, index) => (
            <article
              key={badge.id ?? index}
              className={`shop-builder-badge-card ${draggingItem?.kind === "sectionBadge" && draggingItem?.fromIndex === index && draggingItem?.blockKey === section.id ? "is-dragging" : ""} ${draggingItem?.kind === "sectionBadge" && dropHoverIndex === index ? "is-drag-over" : ""}`}
              draggable
              onDragStart={(event) => {
                event.stopPropagation();
                event.dataTransfer.setData(
                  "text/plain",
                  `sectionBadge:${section.id}:${index}`,
                );
                event.dataTransfer.effectAllowed = "move";
                setDraggingItem({
                  kind: "sectionBadge",
                  blockKey: section.id,
                  fromIndex: index,
                });
              }}
              onDragOver={(event) => {
                if (
                  !draggingItem ||
                  draggingItem.kind !== "sectionBadge" ||
                  draggingItem.blockKey !== section.id
                )
                  return;
                if (draggingItem.fromIndex === index) {
                  setDropHoverIndex(null);
                  return;
                }
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dropHoverIndex !== index) {
                  setDropHoverIndex(index);
                }
              }}
              onDragLeave={() => {
                if (dropHoverIndex === index) {
                  setDropHoverIndex(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setDropHoverIndex(null);
                if (
                  !draggingItem ||
                  draggingItem.kind !== "sectionBadge" ||
                  draggingItem.blockKey !== section.id
                )
                  return;
                if (draggingItem.fromIndex === index) {
                  setDraggingItem(null);
                  return;
                }
                onMoveSectionBadge(section.id, draggingItem.fromIndex, index);
                setDraggingItem(null);
              }}
              onDragEnd={() => {
                setDraggingItem(null);
                setDropHoverIndex(null);
              }}
            >
              <div className="builder-preview-section-badge-tools">
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicateSectionBadge(section.id, index);
                  }}
                  title="Duplicate badge"
                >
                  <Copy size={12} />
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSectionBadge(section.id, index);
                  }}
                  title="Delete badge"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <span
                className="builder-preview-section-badge-drag-handle"
                aria-hidden="true"
              >
                ⠿
              </span>
              {badge.label && <span>{badge.label}</span>}
              {badge.title && <h3>{badge.title}</h3>}
              <BodyText>{badge.body}</BodyText>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`shop-builder-section-content builder-preview-promo is-${
        section.promoVariant ?? "default"
      }`}
    >
      <div className="shop-builder-section-heading">
        <p className="shop-builder-eyebrow">
          <Grid3X3 size={18} />
          Promo
        </p>
        <h2 className="shop-builder-title" data-builder-section-title>{section.title}</h2>
        {section.body && (
          <BodyText className="shop-builder-body">{section.body}</BodyText>
        )}
      </div>
      {section.ctaLabel && (
        <span className="shop-builder-cta shop-builder-cta--light">
          {section.ctaLabel}
        </span>
      )}
    </div>
  );
}, previewSectionPropsEqual);
