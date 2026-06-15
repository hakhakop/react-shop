"use client";

import {
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
  Heart,
  ImageIcon,
  Layers3,
  ListChecks,
  Navigation,
  PanelLeft,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  ShoppingBag,
  LockKeyhole,
  Redo2,
  Save,
  Settings2,
  MonitorSmartphone,
  Undo2,
  Sparkles,
  Star,
  ShieldCheck,
  SquareMousePointer,
  TextCursorInput,
  Truck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type {
  CSSProperties,
  FocusEvent as ReactFocusEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from "react";
import { Fragment, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import CarouselBlock, {
  type CarouselSlide,
} from "@/components/blocks/CarouselBlock";
import BuilderScrollAnimations from "@/components/builder/BuilderScrollAnimations";
import CategoryBar from "@/components/CategoryBar";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import ProductCategoryFilterProvider from "@/components/ProductCategoryFilterProvider";
import FluentFormClient from "@/components/builder/FluentFormClient";
import ProductCarousel from "@/components/ProductCarousel";
import ProductOptionsSelector from "@/components/ProductOptionsSelector";
import DashboardInspector from "@/components/dashboard/DashboardInspector";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import ScrollPinnedDemo from "@/components/animations/ScrollPinnedDemo";
import { AntigravityTerminal } from "@/components/builder/AntigravityTerminal";
import AntigravityCanvas from "@/components/builder/AntigravityCanvas";
import TypewriterText from "@/components/builder/TypewriterText";
import type {
  BuilderCustomPage,
  BuilderCustomPageKey,
  BuilderColorScheme,
  BuilderDesign,
  BuilderHeaderActiveIndicator,
  BuilderHeaderBackgroundMode,
  BuilderHeaderTextMode,
  BuilderHeaderLayout,
  BuilderHeaderBrandMode,
  BuilderHeaderIconId,
  BuilderHeaderIconVariant,
  BuilderLayoutBlock,
  BuilderLayoutKey,
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
  builderLayoutKeys,
  getLayoutBlockKindsForState,
  layoutBlockIcons,
  layoutBlockLabels,
  layoutLabels,
  sectionLabels,
  templateDescriptions,
  templateLabels,
} from "@/components/dashboard/builderRegistry";
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
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import { typographyProps, type TypographyArea } from "@/lib/builderTypography";
import {
  hasBuilderVisualSpacing,
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

const BUILDER_TEMPLATE_DND_TYPE = "application/x-builder-template";
const BUILDER_TEMPLATE_SECTION_DND_TYPE =
  "application/x-builder-template-section";
const BUILDER_TEMPLATE_ROW_DND_TYPE = "application/x-builder-template-row";
const BUILDER_TEMPLATE_ELEMENT_DND_TYPE =
  "application/x-builder-template-element";

type BuilderTemplateDragType = "section" | "row" | "element";

function getBuilderTemplateDragType(
  types: Iterable<string> | ArrayLike<string>,
) {
  const dragTypes = Array.from(types);
  if (dragTypes.includes(BUILDER_TEMPLATE_SECTION_DND_TYPE)) return "section";
  if (dragTypes.includes(BUILDER_TEMPLATE_ROW_DND_TYPE)) return "row";
  if (dragTypes.includes(BUILDER_TEMPLATE_ELEMENT_DND_TYPE)) return "element";
  return null;
}

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
          <DashboardTypog as="span" typography={typography}>{item}</DashboardTypog>
        </li>
      ))}
    </ul>
  );
}

const STORAGE_KEY = "react-shop-visual-builder-v1";
const STORAGE_BY_KEY = "react-shop-visual-builder-drafts-v2";
const STORAGE_CUSTOM_PAGES = "react-shop-visual-builder-pages-v1";

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
  headerIconVariant: "muted",
  headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
  headerActiveIndicator: "underline",
  sectionPaddingTop: "medium",
  sectionPaddingBottom: "medium",
  sectionMarginTop: "none",
  sectionMarginBottom: "none",
  rowPaddingTop: "md",
  rowPaddingBottom: "md",
  rowMarginTop: "none",
  rowMarginBottom: "none",
  rowGap: "lg",
  elementPaddingTop: "sm",
  elementPaddingRight: "sm",
  elementPaddingBottom: "sm",
  elementPaddingLeft: "sm",
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
  menuItems: [
    { id: "home", label: "Home", url: "/" },
    { id: "shop", label: "Shop", url: "/shop" },
  ],
};

const defaultMenuPresentation: MenuPresentationSettings = {
  showHeading: false,
  icon: null,
  submenuLayout: "list",
  submenuColumns: 3,
  badgeText: null,
};

const headerIconOptions: {
  id: BuilderHeaderIconId;
  label: string;
}[] = [
  { id: "wishlist", label: "Wishlist" },
  { id: "cart", label: "Cart" },
  { id: "account", label: "Account" },
  { id: "theme", label: "Night mode" },
  { id: "search", label: "Search" },
];

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
    badgeText:
      typeof value?.badgeText === "string" && value.badgeText.trim().length > 0
        ? value.badgeText.trim()
        : null,
  };
}

const UIKIT_ICON_ALIASES: Record<string, string> = {
  sparkles: "star",
  shield: "lock",
  truck: "cart",
};

const UIKIT_ICON_OPTIONS = [
  { name: "home", label: "Home", keywords: "home" },
  { name: "search", label: "Search", keywords: "search" },
  { name: "menu", label: "Menu", keywords: "menu" },
  { name: "grid", label: "Grid", keywords: "grid" },
  { name: "list", label: "List", keywords: "list" },
  { name: "plus", label: "Plus", keywords: "plus" },
  { name: "check", label: "Check", keywords: "check" },
  { name: "close", label: "Close", keywords: "close" },
  { name: "cart", label: "Cart", keywords: "cart" },
  { name: "bag", label: "Bag", keywords: "bag" },
  { name: "heart", label: "Heart", keywords: "heart" },
  { name: "user", label: "User", keywords: "user" },
  { name: "settings", label: "Settings", keywords: "settings" },
  { name: "star", label: "Star", keywords: "star" },
  { name: "tag", label: "Tag", keywords: "tag" },
  { name: "mail", label: "Mail", keywords: "mail" },
  { name: "phone", label: "Phone", keywords: "phone" },
  { name: "lock", label: "Lock", keywords: "lock" },
  { name: "world", label: "World", keywords: "world" },
  { name: "image", label: "Image", keywords: "image" },
  { name: "folder", label: "Folder", keywords: "folder" },
  { name: "warning", label: "Warning", keywords: "warning" },
  { name: "info", label: "Info", keywords: "info" },
  {
    name: "arrow-right",
    label: "Arrow Right",
    keywords: "arrow right",
  },
  {
    name: "chevron-right",
    label: "Chevron Right",
    keywords: "chevron right",
  },
  {
    name: "chevron-down",
    label: "Chevron Down",
    keywords: "chevron down",
  },
  { name: "refresh", label: "Refresh", keywords: "refresh" },
  { name: "calendar", label: "Calendar", keywords: "calendar" },
  { name: "clock", label: "Clock", keywords: "clock" },
  { name: "download", label: "Download", keywords: "download" },
  { name: "upload", label: "Upload", keywords: "upload" },
  { name: "pencil", label: "Pencil", keywords: "pencil" },
  { name: "trash", label: "Trash", keywords: "trash" },
  { name: "bookmark", label: "Bookmark", keywords: "bookmark" },
  { name: "link", label: "Link", keywords: "link" },
  { name: "sign-in", label: "Sign In", keywords: "sign in" },
  { name: "sign-out", label: "Sign Out", keywords: "sign out" },
] as const;

const UIKIT_ICON_INNER_HTML: Record<string, string> = {
  home: `<polygon points="18.65 11.35 10 2.71 1.35 11.35 0.65 10.65 10 1.29 19.35 10.65" /> <polygon points="15 4 18 4 18 7 17 7 17 5 15 5" /> <polygon points="3 11 4 11 4 18 7 18 7 12 12 12 12 18 16 18 16 11 17 11 17 19 11 19 11 13 8 13 8 19 3 19" />`,
  search: `<circle fill="none" stroke="#000" stroke-width="1.1" cx="9" cy="9" r="7" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M14,14 L18,18 L14,14 Z" />`,
  menu: `<rect x="2" y="4" width="16" height="1" /> <rect x="2" y="9" width="16" height="1" /> <rect x="2" y="14" width="16" height="1" />`,
  grid: `<rect x="2" y="2" width="3" height="3" /> <rect x="8" y="2" width="3" height="3" /> <rect x="14" y="2" width="3" height="3" /> <rect x="2" y="8" width="3" height="3" /> <rect x="8" y="8" width="3" height="3" /> <rect x="14" y="8" width="3" height="3" /> <rect x="2" y="14" width="3" height="3" /> <rect x="8" y="14" width="3" height="3" /> <rect x="14" y="14" width="3" height="3" />`,
  list: `<rect x="6" y="4" width="12" height="1" /> <rect x="6" y="9" width="12" height="1" /> <rect x="6" y="14" width="12" height="1" /> <rect x="2" y="4" width="2" height="1" /> <rect x="2" y="9" width="2" height="1" /> <rect x="2" y="14" width="2" height="1" />`,
  plus: `<rect x="9" y="1" width="1" height="17" /> <rect x="1" y="9" width="17" height="1" />`,
  check: `<polyline fill="none" stroke="#000" stroke-width="1.1" points="4,10 8,15 17,4" />`,
  close: `<path fill="none" stroke="#000" stroke-width="1.06" d="M16,16 L4,4" /> <path fill="none" stroke="#000" stroke-width="1.06" d="M16,4 L4,16" />`,
  cart: `<circle cx="7.3" cy="17.3" r="1.4" /> <circle cx="13.3" cy="17.3" r="1.4" /> <polyline fill="none" stroke="#000" points="0 2 3.2 4 5.3 12.5 16 12.5 18 6.5 8 6.5" />`,
  bag: `<path fill="none" stroke="#000" d="M7.5,7.5V4A2.48,2.48,0,0,1,10,1.5,2.54,2.54,0,0,1,12.5,4V7.5" /> <polygon fill="none" stroke="#000" points="16.5 7.5 3.5 7.5 2.5 18.5 17.5 18.5 16.5 7.5" />`,
  heart: `<path fill="none" stroke="#000" stroke-width="1.03" d="M10,4 C10,4 8.1,2 5.74,2 C3.38,2 1,3.55 1,6.73 C1,8.84 2.67,10.44 2.67,10.44 L10,18 L17.33,10.44 C17.33,10.44 19,8.84 19,6.73 C19,3.55 16.62,2 14.26,2 C11.9,2 10,4 10,4 L10,4 Z" />`,
  user: `<circle fill="none" stroke="#000" stroke-width="1.1" cx="9.9" cy="6.4" r="4.4" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M1.5,19 C2.3,14.5 5.8,11.2 10,11.2 C14.2,11.2 17.7,14.6 18.5,19.2" />`,
  settings: `<ellipse fill="none" stroke="#000" cx="6.11" cy="3.55" rx="2.11" ry="2.15" /> <ellipse fill="none" stroke="#000" cx="6.11" cy="15.55" rx="2.11" ry="2.15" /> <circle fill="none" stroke="#000" cx="13.15" cy="9.55" r="2.15" /> <rect x="1" y="3" width="3" height="1" /> <rect x="10" y="3" width="8" height="1" /> <rect x="1" y="9" width="8" height="1" /> <rect x="15" y="9" width="3" height="1" /> <rect x="1" y="15" width="3" height="1" /> <rect x="10" y="15" width="8" height="1" />`,
  star: `<polygon fill="none" stroke="#000" stroke-width="1.01" points="10 2 12.63 7.27 18.5 8.12 14.25 12.22 15.25 18 10 15.27 4.75 18 5.75 12.22 1.5 8.12 7.37 7.27" />`,
  tag: `<path fill="none" stroke="#000" stroke-width="1.1" d="M17.5,3.71 L17.5,7.72 C17.5,7.96 17.4,8.2 17.21,8.39 L8.39,17.2 C7.99,17.6 7.33,17.6 6.93,17.2 L2.8,13.07 C2.4,12.67 2.4,12.01 2.8,11.61 L11.61,2.8 C11.81,2.6 12.08,2.5 12.34,2.5 L16.19,2.5 C16.52,2.5 16.86,2.63 17.11,2.88 C17.35,3.11 17.48,3.4 17.5,3.71 L17.5,3.71 Z" /> <circle cx="14" cy="6" r="1" />`,
  mail: `<polyline fill="none" stroke="#000" points="1.4,6.5 10,11 18.6,6.5" /> <path d="M 1,4 1,16 19,16 19,4 1,4 Z M 18,15 2,15 2,5 18,5 18,15 Z" />`,
  phone: `<path fill="none" stroke="#000" d="M15.5,17 C15.5,17.8 14.8,18.5 14,18.5 L7,18.5 C6.2,18.5 5.5,17.8 5.5,17 L5.5,3 C5.5,2.2 6.2,1.5 7,1.5 L14,1.5 C14.8,1.5 15.5,2.2 15.5,3 L15.5,17 L15.5,17 L15.5,17 Z" /> <circle cx="10.5" cy="16.5" r="0.8" />`,
  lock: `<rect fill="none" stroke="#000" height="10" width="13" y="8.5" x="3.5" /> <path fill="none" stroke="#000" d="M6.5,8 L6.5,4.88 C6.5,3.01 8.07,1.5 10,1.5 C11.93,1.5 13.5,3.01 13.5,4.88 L13.5,8" />`,
  world: `<path fill="none" stroke="#000" d="M1,10.5 L19,10.5" /> <path fill="none" stroke="#000" d="M2.35,15.5 L17.65,15.5" /> <path fill="none" stroke="#000" d="M2.35,5.5 L17.523,5.5" /> <path fill="none" stroke="#000" d="M10,19.46 L9.98,19.46 C7.31,17.33 5.61,14.141 5.61,10.58 C5.61,7.02 7.33,3.83 10,1.7 C10.01,1.7 9.99,1.7 10,1.7 L10,1.7 C12.67,3.83 14.4,7.02 14.4,10.58 C14.4,14.141 12.67,17.33 10,19.46 L10,19.46 L10,19.46 L10,19.46 Z" /> <circle fill="none" stroke="#000" cx="10" cy="10.5" r="9" />`,
  image: `<circle cx="16.1" cy="6.1" r="1.1" /> <rect fill="none" stroke="#000" x="0.5" y="2.5" width="19" height="15" /> <polyline fill="none" stroke="#000" stroke-width="1.01" points="4,13 8,9 13,14" /> <polyline fill="none" stroke="#000" stroke-width="1.01" points="11,12 12.5,10.5 16,14" />`,
  folder: `<polygon fill="none" stroke="#000" points="9.5 5.5 8.5 3.5 1.5 3.5 1.5 16.5 18.5 16.5 18.5 5.5" />`,
  warning: `<circle cx="10" cy="14" r="1" /> <circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9" /> <path d="M10.97,7.72 C10.85,9.54 10.56,11.29 10.56,11.29 C10.51,11.87 10.27,12 9.99,12 C9.69,12 9.49,11.87 9.43,11.29 C9.43,11.29 9.16,9.54 9.03,7.72 C8.96,6.54 9.03,6 9.03,6 C9.03,5.45 9.46,5.02 9.99,5 C10.53,5.01 10.97,5.44 10.97,6 C10.97,6 11.04,6.54 10.97,7.72 L10.97,7.72 Z" />`,
  info: `<path d="M12.13,11.59 C11.97,12.84 10.35,14.12 9.1,14.16 C6.17,14.2 9.89,9.46 8.74,8.37 C9.3,8.16 10.62,7.83 10.62,8.81 C10.62,9.63 10.12,10.55 9.88,11.32 C8.66,15.16 12.13,11.15 12.14,11.18 C12.16,11.21 12.16,11.35 12.13,11.59 C12.08,11.95 12.16,11.35 12.13,11.59 L12.13,11.59 Z M11.56,5.67 C11.56,6.67 9.36,7.15 9.36,6.03 C9.36,5 11.56,4.54 11.56,5.67 L11.56,5.67 Z" /> <circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9" />`,
  "arrow-right": `<line fill="none" stroke="#000" x1="3.47" y1="10" x2="15.47" y2="10" /> <polyline fill="none" stroke="#000" points="11.98 13.84 15.82 10 11.98 6.16" />`,
  "chevron-right": `<polyline fill="none" stroke="#000" stroke-width="1.03" points="7 4 13 10 7 16" />`,
  "chevron-down": `<polyline fill="none" stroke="#000" stroke-width="1.03" points="16 7 10 13 4 7" />`,
  refresh: `<path fill="none" stroke="#000" stroke-width="1.1" d="M17.08,11.15 C17.09,11.31 17.1,11.47 17.1,11.64 C17.1,15.53 13.94,18.69 10.05,18.69 C6.16,18.68 3,15.53 3,11.63 C3,7.74 6.16,4.58 10.05,4.58 C10.9,4.58 11.71,4.73 12.46,5" /> <polyline fill="none" stroke="#000" points="9.9 2 12.79 4.89 9.79 7.9" />`,
  calendar: `<path d="M 2,3 2,17 18,17 18,3 2,3 Z M 17,16 3,16 3,8 17,8 17,16 Z M 17,7 3,7 3,4 17,4 17,7 Z" /> <rect width="1" height="3" x="6" y="2" /> <rect width="1" height="3" x="13" y="2" />`,
  clock: `<circle fill="none" stroke="#000" stroke-width="1.1" cx="10" cy="10" r="9" /> <rect x="9" y="4" width="1" height="7" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M13.018,14.197 L9.445,10.625" />`,
  download: `<line fill="none" stroke="#000" x1="10" y1="2.09" x2="10" y2="14.09" /> <polyline fill="none" stroke="#000" points="6.16 10.62 10 14.46 13.84 10.62" /> <line stroke="#000" x1="3.5" y1="17.5" x2="16.5" y2="17.5" />`,
  upload: `<line fill="none" stroke="#000" x1="10" y1="15.17" x2="10" y2="3.17" /> <polyline fill="none" stroke="#000" points="13.84 6.63 10 2.8 6.16 6.64" /> <line fill="#fff" stroke="#000" x1="3.5" y1="17.5" x2="16.5" y2="17.5" />`,
  pencil: `<path fill="none" stroke="#000" d="M17.25,6.01 L7.12,16.1 L3.82,17.2 L5.02,13.9 L15.12,3.88 C15.71,3.29 16.66,3.29 17.25,3.88 C17.83,4.47 17.83,5.42 17.25,6.01 L17.25,6.01 Z" /> <path fill="none" stroke="#000" d="M15.98,7.268 L13.851,5.148" />`,
  trash: `<polyline fill="none" stroke="#000" points="6.5 3 6.5 1.5 13.5 1.5 13.5 3" /> <polyline fill="none" stroke="#000" points="4.5 4 4.5 18.5 15.5 18.5 15.5 4" /> <rect x="8" y="7" width="1" height="9" /> <rect x="11" y="7" width="1" height="9" /> <rect x="2" y="3" width="16" height="1" />`,
  bookmark: `<polygon fill="none" stroke="#000" points="5.5 1.5 15.5 1.5 15.5 17.5 10.5 12.5 5.5 17.5" />`,
  link: `<path fill="none" stroke="#000" stroke-width="1.1" d="M10.625,12.375 L7.525,15.475 C6.825,16.175 5.925,16.175 5.225,15.475 L4.525,14.775 C3.825,14.074 3.825,13.175 4.525,12.475 L7.625,9.375" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M9.325,7.375 L12.425,4.275 C13.125,3.575 14.025,3.575 14.724,4.275 L15.425,4.975 C16.125,5.675 16.125,6.575 15.425,7.275 L12.325,10.375" /> <path fill="none" stroke="#000" stroke-width="1.1" d="M7.925,11.875 L11.925,7.975" />`,
  "sign-in": `<polygon points="7 2 17 2 17 17 7 17 7 16 16 16 16 3 7 3 7 2" /> <line stroke="#000" x1="3" y1="9.5" x2="12" y2="9.5" /> <polyline fill="none" stroke="#000" points="9.2 6.33 12.37 9.5 9.2 12.67" />`,
  "sign-out": `<polygon points="13 2 3 2 3 17 13 17 13 16 4 16 4 3 13 3 13 2" /> <line stroke="#000" x1="7.96" y1="9.49" x2="16.96" y2="9.49" /> <polyline fill="none" stroke="#000" points="14.17 6.31 17.35 9.48 14.17 12.66" />`,
};

function resolveUIKitIconName(icon: string | null): string | null {
  if (!icon) return null;
  const normalized = icon.trim();
  if (normalized.length === 0) return null;
  return UIKIT_ICON_INNER_HTML[normalized]
    ? normalized
    : UIKIT_ICON_ALIASES[normalized] ?? null;
}

function getMenuIconLabel(icon: string | null): string {
  if (!icon) return "None";

  const direct = UIKIT_ICON_OPTIONS.find((option) => option.name === icon);
  if (direct) return direct.label;

  const alias = UIKIT_ICON_ALIASES[icon];
  if (alias) {
    const resolved = UIKIT_ICON_OPTIONS.find((option) => option.name === alias);
    return resolved ? `${resolved.label} (legacy ${icon})` : icon;
  }

  return icon;
}

function renderUIKitIcon(icon: string | null, size = 14) {
  const iconName = resolveUIKitIconName(icon);
  const innerHtml = iconName ? UIKIT_ICON_INNER_HTML[iconName] : null;

  if (!innerHtml) return null;

  return (
    <svg
      className="uikit-icon"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      stroke="currentColor"
      dangerouslySetInnerHTML={{
        __html: innerHtml.replace(/#000/g, "currentColor"),
      }}
    />
  );
}

function parseBuilderLayoutKey(value: string | null): BuilderLayoutKey | null {
  if (!value) return null;
  if (isBuilderCustomPageKey(value)) return value;
  return builderLayoutKeys.has(value as BuilderLayoutKey)
    ? (value as BuilderLayoutKey)
    : null;
}

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

function getFrontendUrlForBuilderKey(
  key: BuilderLayoutKey,
  customPages: BuilderCustomPage[],
) {
  if (key === "home") return "/";
  if (key === "shop") return "/shop";
  if (key === "client") return "/client";
  if (key === "page:cart") return "/cart";
  if (key === "page:checkout") return "/checkout";
  if (key === "page:my-account") return "/my-account";
  if (key === "product-single") return "/product/pink-jumper";
  if (key === "product-category" || key === "product-category-specific") {
    return "/category/shoes";
  }
  if (key === "search-results") return "/search";
  if (isBuilderCustomPageKey(key)) {
    const page = customPages.find((item) => item.key === key);
    return page ? `/${page.slug}` : "/";
  }
  return "/";
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

function resolveDesignColors(design: BuilderDesign) {
  if (design.colorScheme === "dark") {
    return { ...design, ...darkScheme };
  }

  if (design.colorScheme === "light") {
    return { ...design, ...lightScheme };
  }

  return design;
}

function sectionSchemeStyle(section: BuilderSection) {
  const colorScheme =
    section.colorScheme === "dark" || section.colorScheme === "light"
      ? section.colorScheme
      : readableSchemeForColor(section.background);

  if (colorScheme === "dark") {
    return {
      "--builder-preview-section-text": darkScheme.textColor,
      "--builder-preview-section-muted": darkScheme.mutedTextColor,
      "--builder-preview-section-surface": darkScheme.surfaceColor,
      "--builder-preview-section-button-bg": darkScheme.buttonBackground,
      "--builder-preview-section-button-text": darkScheme.buttonTextColor,
      "--builder-section-text": darkScheme.textColor,
      "--builder-active-muted": darkScheme.mutedTextColor,
      "--builder-active-surface": darkScheme.surfaceColor,
      "--builder-active-button-bg": darkScheme.buttonBackground,
      "--builder-active-button-text": darkScheme.buttonTextColor,
    } as CSSProperties;
  }

  if (colorScheme === "light") {
    return {
      "--builder-preview-section-text": lightScheme.textColor,
      "--builder-preview-section-muted": lightScheme.mutedTextColor,
      "--builder-preview-section-surface": lightScheme.surfaceColor,
      "--builder-preview-section-button-bg": lightScheme.buttonBackground,
      "--builder-preview-section-button-text": lightScheme.buttonTextColor,
      "--builder-section-text": lightScheme.textColor,
      "--builder-active-muted": lightScheme.mutedTextColor,
      "--builder-active-surface": lightScheme.surfaceColor,
      "--builder-active-button-bg": lightScheme.buttonBackground,
      "--builder-active-button-text": lightScheme.buttonTextColor,
    } as CSSProperties;
  }

  return {};
}

function resolveSectionColorScheme(
  section: BuilderSection,
  layoutScheme: "light" | "dark" = "light",
): Exclude<SectionColorScheme, "inherit"> {
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return section.colorScheme;
  }

  const readable = readableSchemeForColor(section.background);
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
      return (totalLuminance / count) < 0.48 ? "dark" : "light";
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
  const rgbMatch = bg.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)$/);
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

const previewButtonsStyle = (layout?: "inline" | "stacked", align?: "left" | "center" | "right"): CSSProperties => ({
  display: "flex",
  width: "100%",
  flexDirection: layout === "stacked" ? "column" : "row",
  flexWrap: "wrap",
  gap: "0.75rem",
  justifyContent: align === "center" ? "center" : align === "right" ? "flex-end" : "flex-start",
  alignItems: "center",
});

const rowInsertionPresets = [
  { key: "whole", label: "1/1", ratios: [1] },
  { key: "halves", label: "1/2 + 1/2", ratios: [1, 1] },
  { key: "thirds", label: "1/3 + 1/3 + 1/3", ratios: [1, 1, 1] },
  { key: "thirds-1-2", label: "1/3 + 2/3", ratios: [1, 2] },
  { key: "thirds-2-1", label: "2/3 + 1/3", ratios: [2, 1] },
] as const;

const HAS_RICH_TEXT_HTML = /<[a-z][\s\S]*>/i;

function isRichPreviewText(value: string | null | undefined) {
  return typeof value === "string" && HAS_RICH_TEXT_HTML.test(value);
}

function getRichTextSafeTag(tag: string) {
  return tag === "p" ? "div" : tag;
}

function DashboardTypog({
  as: As = "div",
  typography,
  className,
  children,
  style,
  ...props
}: any) {
  const Tag = As as any;
  const tp = typographyProps(
    typography,
    inferTypographyArea(String(As), className),
  );
  const combined = [className, tp.className].filter(Boolean).join(" ");
  const combinedStyle = { ...tp.style, ...style };
  const isRich = isRichPreviewText(children);
  if (isRich) {
    const RichTag = getRichTextSafeTag(String(As)) as any;
    return (
      <RichTag
        className={combined || undefined}
        style={combinedStyle}
        {...props}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }
  return (
    <Tag className={combined || undefined} style={combinedStyle} {...props}>
      {children}
    </Tag>
  );
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

function BodyText({ children, className }: { children: string | null | undefined; className?: string }) {
  if (!children) return null;
  if (isRichPreviewText(children)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: children }} />;
  }
  return <p className={className}>{children}</p>;
}

function getDefaultStateForKey(key: BuilderLayoutKey): BuilderState {
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
          id: `${key}-hero`,
          kind: "hero",
          title,
          eyebrow: "Builder page",
          body: "A custom React page created from the visual dashboard.",
          background: "#f7f7f4",
          backgroundMode: "full",
          contentMode: "boxed",
          colorScheme: "inherit",
          layout: "split",
          topSpacing: "medium",
          bottomSpacing: "medium",
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

function loadInitialState(): BuilderState {
  if (typeof window === "undefined") return defaultState;

  try {
    const drafts = window.localStorage.getItem(STORAGE_BY_KEY);
    if (drafts) {
      const parsedDrafts = JSON.parse(drafts) as Partial<
        Record<BuilderLayoutKey, BuilderState>
      >;
      const shopDraft = parsedDrafts.shop;
      if (shopDraft?.sections?.length) {
        return normalizeBuilderState(shopDraft, "shop");
      }
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultState;
    const parsed = JSON.parse(stored) as BuilderState;
    if (!Array.isArray(parsed.sections)) return defaultState;
    return normalizeBuilderState(parsed, parsed.page ?? "shop");
  } catch {
    return defaultState;
  }
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
  const sections = migratedSections.map(normalizeScrollPinnedDemoSection);
  return {
    ...state,
    page: key,
    targetType: isTemplate ? "template" : "page",
    template: isTemplate ? (key as BuilderTemplate) : undefined,
    sections,
    design: {
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
    section?.kind === "contentLayout" || section?.kind === "scrollPinnedDemo"
  );
}

function normalizeScrollPinnedDemoSection(section: BuilderSection): BuilderSection {
  const hasEditableBlocks = (section.layoutItems ?? []).some(
    (item) => (item.blocks ?? []).length > 0,
  );
  if (section.kind !== "scrollPinnedDemo" || hasEditableBlocks) {
    return section;
  }

  const rowId = `${section.id}-story-row`;
  const slides =
    section.slides?.length
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

function loadDraftForKey(key: BuilderLayoutKey): BuilderState {
  if (typeof window === "undefined") return getDefaultStateForKey(key);

  try {
    const raw = window.localStorage.getItem(STORAGE_BY_KEY);
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

export type DashboardBuilderProps = {
  menuTree?: MenuItem[];
};

export default function DashboardBuilder({
  menuTree = [],
}: DashboardBuilderProps) {
  const router = useRouter();
  const { theme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [builderState, setBuilderState] = useState<BuilderState>(defaultState);
  const layoutScheme =
    builderState.design.colorScheme === "dark" ||
    (builderState.design.colorScheme === "auto" && theme === "dark")
      ? "dark"
      : "light";
  const [selectedId, setSelectedId] = useState(
    defaultState.sections[0]?.id ?? "",
  );
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [copied, setCopied] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
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
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(
    null,
  );
  const [draggingLayoutBlockKey, setDraggingLayoutBlockKey] = useState<
    string | null
  >(null);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("layout");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [sectionSettingsOpen, setSectionSettingsOpen] = useState(false);
  const [sectionStructureOpen, setSectionStructureOpen] = useState(false);
  const [globalStylesTab, setGlobalStylesTab] = useState<
    "siteDesign" | "spacing" | "cards" | "typography" | "header"
  >("siteDesign");
  const [globalSpacingFocus, setGlobalSpacingFocus] = useState<
    "section" | "row" | "element" | null
  >(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(390);
  const [sidebarResizing, setSidebarResizing] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewCanvasWidth, setPreviewCanvasWidth] = useState(1180);
  const [spacingOverlayEnabled, setSpacingOverlayEnabled] = useState(false);
  const [spacingFocusRequest, setSpacingFocusRequest] = useState<{
    id: number;
    scope: string;
    field?: string;
  } | null>(null);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("settings");
  const [panelForceToggler, setPanelForceToggler] = useState(0);
  const [inspectorOpenKey, setInspectorOpenKey] = useState(0);
  const [shellSettings, setShellSettings] =
    useState<BuilderShellSettings>(defaultShellSettings);
  const [shellStatus, setShellStatus] = useState(
    "Shell settings load from React",
  );
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string | null>(
    null,
  );
  const [menuIconPickerOpen, setMenuIconPickerOpen] = useState(false);
  const [menuIconSearch, setMenuIconSearch] = useState("");
  const publishCelebrationTimer = useRef<number | null>(null);
  const shellAutoSaveTimer = useRef<number | null>(null);
  const spacingFocusRequestId = useRef(0);
  const [customPages, setCustomPages] = useState<BuilderCustomPage[]>([]);
  const [publishedKeys, setPublishedKeys] = useState<string[]>([]);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [pageStatus, setPageStatus] = useState("Builder pages save to React");
  const [savedTemplates, setSavedTemplates] = useState<BuilderSavedTemplate[]>(
    [],
  );
  const [renameTemplateRequest, setRenameTemplateRequest] = useState<{
    id: string;
    templateType: NonNullable<BuilderSavedTemplate["templateType"]>;
  } | null>(null);
  const [templateStatus, setTemplateStatus] = useState(
    "Templates save to React",
  );
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
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaItems, setMediaItems] = useState<WordPressMediaItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [mediaStatus, setMediaStatus] = useState(
    "Browse images from WordPress",
  );
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaTotalItems, setMediaTotalItems] = useState(0);
  const [mediaTotalPages, setMediaTotalPages] = useState(1);
  const mediaPerPage = 60;
  const previewHeaderSlotRef = useRef<HTMLDivElement>(null);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const mediaSelectRef = useRef<((media: WordPressMediaItem) => void) | null>(
    null,
  );
  const undoHistoryRef = useRef<BuilderState[]>([]);
  const redoHistoryRef = useRef<BuilderState[]>([]);
  const skipUndoCaptureRef = useRef(false);
  const [committedBuilderStateSignature, setCommittedBuilderStateSignature] =
    useState("");
  const undoRef = useRef<() => void>(() => {});
  const redoRef = useRef<() => void>(() => {});

  const selectedSection = useMemo(
    () => builderState.sections.find((section) => section.id === selectedId),
    [builderState.sections, selectedId],
  );
  const selectedLayoutBlock = useMemo(() => {
    if (!selectedSection || !isLayoutContainerSection(selectedSection))
      return null;
    for (const item of selectedSection.layoutItems ?? []) {
      const block = (item.blocks ?? []).find(
        (entry, index) =>
          (entry.id ?? `${item.id ?? "layout-item"}-block-${index}`) ===
          selectedLayoutBlockKey,
      );
      if (block) return block;
    }
    return null;
  }, [selectedLayoutBlockKey, selectedSection]);
  const availableLayoutBlockKinds = useMemo(
    () => getLayoutBlockKindsForState(),
    [],
  );
  const currentFrontendUrl = useMemo(
    () => getFrontendUrlForBuilderKey(builderState.page, customPages),
    [builderState.page, customPages],
  );
  const builderStateSignature = useMemo(
    () => JSON.stringify(builderState),
    [builderState],
  );
  const hasPendingChanges =
    draftReady &&
    committedBuilderStateSignature.length > 0 &&
    builderStateSignature !== committedBuilderStateSignature;
  const previewColors = resolveDesignColors(builderState.design);
  const previewPageBackground =
    previewColors.pageBackground ??
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

  const mediaRangeStart =
    mediaTotalItems === 0 ? 0 : (mediaPage - 1) * mediaPerPage + 1;
  const mediaRangeEnd = Math.min(
    mediaPage * mediaPerPage,
    mediaTotalItems,
  );

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
    const draft = loadInitialState();
    let localPages: BuilderCustomPage[] = [];
    try {
      const rawPages = window.localStorage.getItem(STORAGE_CUSTOM_PAGES);
      localPages = rawPages
        ? (JSON.parse(rawPages) as BuilderCustomPage[]).filter((page) =>
            isBuilderCustomPageKey(page.key),
          )
        : [];
    } catch {
      localPages = [];
    }
    setCustomPages(localPages);
    setBuilderState(draft);
    setSelectedId(draft.sections[0]?.id ?? "");
    setDraftReady(true);
  }, []);

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
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
      const theme = stored === "dark" || (!stored && prefersDark) ? "dark" : "light";
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

  const updatePreviewViewport = useCallback(() => {
    const shell = previewShellRef.current;
    if (!shell) return;
    const shellWidth = shell.clientWidth || window.innerWidth;
    setPreviewCanvasWidth(shellWidth);
    setPreviewScale(1);
  }, []);

  useEffect(() => {
    const shell = previewShellRef.current;
    if (!shell) return;

    updatePreviewViewport();
    const observer = new ResizeObserver(updatePreviewViewport);
    observer.observe(shell);
    window.addEventListener("resize", updatePreviewViewport);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updatePreviewViewport);
    };
  }, [device, sidebarCollapsed, sidebarWidth, updatePreviewViewport]);

  useEffect(() => {
    const updatePreviewHeaderPill = () => {
      const pill =
        previewHeaderSlotRef.current?.querySelector<HTMLElement>(
          "#site-header-pill",
        );
      const header =
        previewHeaderSlotRef.current?.querySelector<HTMLElement>(
          ".site-header",
        );
      if (!pill) return;
      const shellScrollTop = previewShellRef.current?.scrollTop ?? 0;
      const isScrolled = Math.max(shellScrollTop, window.scrollY) > 56;
      pill.dataset.scrolled = isScrolled ? "true" : "false";
      pill.dataset.pillInit = "true";
      if (header) {
        header.dataset.scrolled = isScrolled ? "true" : "false";
      }
    };

    const shell = previewShellRef.current;
    updatePreviewHeaderPill();
    shell?.addEventListener("scroll", updatePreviewHeaderPill, {
      passive: true,
    });
    window.addEventListener("scroll", updatePreviewHeaderPill, {
      passive: true,
    });

    return () => {
      shell?.removeEventListener("scroll", updatePreviewHeaderPill);
      window.removeEventListener("scroll", updatePreviewHeaderPill);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (shellAutoSaveTimer.current) {
        window.clearTimeout(shellAutoSaveTimer.current);
      }
      if (publishCelebrationTimer.current) {
        window.clearTimeout(publishCelebrationTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    let header: Element | null = null;
    let parent: Node | null = null;
    let nextSibling: ChildNode | null = null;

    const moveHeaderIntoPreview = () => {
      const slot = previewHeaderSlotRef.current;
      const nextHeader = document.querySelector(".site-header");
      if (!slot || !nextHeader || slot.contains(nextHeader)) return;
      header = nextHeader;
      parent = nextHeader.parentNode;
      nextSibling = nextHeader.nextSibling;
      slot.appendChild(nextHeader);
    };

    moveHeaderIntoPreview();
    const observer = new MutationObserver(moveHeaderIntoPreview);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (!header || !parent) return;
      parent.insertBefore(header, nextSibling);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderPages() {
      try {
        const response = await fetch("/api/builder-pages", {
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
            STORAGE_CUSTOM_PAGES,
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadBuilderTemplates() {
      try {
        const response = await fetch("/api/builder-templates", {
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviewCategories() {
      try {
        const response = await fetch("/api/builder-preview-categories", {
          cache: "no-store",
        });
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
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPreviewProducts() {
      try {
        const response = await fetch("/api/builder-preview-products?limit=48", {
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
  }, []);

  useEffect(() => {
    if (!draftReady) return;

    const nextKey = parseBuilderLayoutKey(
      searchParams.get("page") ?? searchParams.get("template"),
    );

    if (!nextKey || nextKey === builderState.page) return;

    const nextState = loadDraftForKey(nextKey);
    setBuilderState(nextState);
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
    setPublishStatus("Loaded from menu selection");
  }, [builderState.page, draftReady, searchParams]);

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
        const response = await fetch("/api/builder-shell", {
          cache: "no-store",
        });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          settings?: Partial<BuilderShellSettings>;
        };
        if (!cancelled && payload.settings) {
          setShellSettings({
            ...defaultShellSettings,
            ...payload.settings,
          });
        }
      } catch {
        if (!cancelled) setShellStatus("Shell settings unavailable");
      }
    }

    void loadShellSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!draftReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(builderState));
    let drafts: Partial<Record<BuilderLayoutKey, BuilderState>> = {};
    try {
      const rawDrafts = window.localStorage.getItem(STORAGE_BY_KEY);
      drafts = rawDrafts
        ? (JSON.parse(rawDrafts) as Partial<
            Record<BuilderLayoutKey, BuilderState>
          >)
        : {};
    } catch {
      drafts = {};
    }
    drafts[builderState.page] = builderState;
    window.localStorage.setItem(STORAGE_BY_KEY, JSON.stringify(drafts));
  }, [builderState, draftReady]);

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
    if (!mediaPickerOpen) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setMediaLoading(true);
      setMediaItems([]);
      setMediaTotalItems(0);
      setMediaTotalPages(1);
      setMediaStatus("Loading WordPress media...");

      try {
        const searchTerm = mediaSearch.trim();
        const params = new URLSearchParams({
          page: String(mediaPage),
          perPage: String(mediaPerPage),
        });
        if (searchTerm) params.set("search", searchTerm);

        const apiResponse = await fetch(`/api/wordpress-media?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const payload = (await apiResponse.json()) as
          | {
              media?: WordPressMediaItem[];
              total?: number;
              totalPages?: number;
              hasNextPage?: boolean;
              page?: number;
              message?: string;
            }
          | undefined;

        if (!apiResponse.ok) {
          setMediaStatus(payload?.message ?? "WordPress media could not load");
          return;
        }

        const nextItems = payload?.media ?? [];
        const nextTotal = payload?.total ?? nextItems.length;
        const nextTotalPages = payload?.totalPages ?? 1;
        setMediaItems(nextItems);
        setMediaTotalItems(nextTotal);
        setMediaTotalPages(nextTotalPages);
        setMediaStatus(
          nextItems.length
            ? `Showing ${Math.min(
                (mediaPage - 1) * mediaPerPage + 1,
                nextTotal,
              )}-${Math.min(mediaPage * mediaPerPage, nextTotal)} of ${nextTotal}`
            : "No WordPress images matched this search",
        );
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setMediaItems([]);
          setMediaTotalItems(0);
          setMediaTotalPages(1);
          setMediaStatus("WordPress media could not load");
        }
      } finally {
        if (!controller.signal.aborted) setMediaLoading(false);
      }
    }, 120);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [mediaPickerOpen, mediaPage, mediaSearch]);

  const switchBuilderTarget = (
    nextKey: BuilderLayoutKey,
    options: { syncUrl?: boolean } = {},
  ) => {
    const nextState = loadDraftForKey(nextKey);
    undoHistoryRef.current = [structuredClone(nextState)];
    setCommittedBuilderStateSignature(JSON.stringify(nextState));
    setBuilderState(nextState);
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
    setPublishStatus("Local draft autosaves");

    if (options.syncUrl !== false) {
      router.replace(`${pathname}?page=${nextKey}`, { scroll: false });
    }
  };

  const updateSelected = (patch: Partial<BuilderSection>) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === selectedId ? { ...section, ...patch } : section,
      ),
    }));
  };

  const cycleSectionSpacing = (
    sectionId: string,
    field: "topSpacing" | "bottomSpacing" | "topMargin" | "bottomMargin",
  ) => {
    const cycleOrder: SectionSpacing[] = ["inherit", "none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
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
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
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
                return currentBlockKey === blockKey
                  ? { ...block, ...patch }
                  : block;
              }),
            };
          }),
        };
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
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId) return section;
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
                gridItems[itemIndex] = {
                  ...(gridItems[itemIndex] ?? {}),
                  ...patch,
                };
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
                const items = [...(block.items ?? [])];
                const [moved] = items.splice(fromIndex, 1);
                items.splice(toIndex, 0, moved);
                return { ...block, items };
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
                  items: (block.items ?? []).filter(
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
                const items = [...(block.items ?? [])];
                const source = items[itemIndex];
                if (!source) return block;
                items.splice(itemIndex + 1, 0, source);
                return { ...block, items };
              }),
            };
          }),
        };
      }),
    }));
  };

  const deleteSectionBadgeByKey = (
    sectionId: string,
    badgeIndex: number,
  ) => {
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

  const openElementsPanel = () => {
    setSidebarCollapsed(false);
    setSidebarTab("elements");
    setPanelForceToggler((prev) => prev + 1);
  };

  const openInspectorPanel = () => {
    setSidebarCollapsed(false);
    setInspectorOpen(true);
    setSidebarTab("inspector");
    setInspectorOpenKey((prev) => prev + 1);
  };

  const selectSection = (sectionId: string) => {
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    openInspectorPanel();
    setInspectorTab("layout");
    setSectionSettingsOpen(true);
    setSectionStructureOpen(false);
  };

  const selectLayoutColumn = (sectionId: string, columnKey: string) => {
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(columnKey);
    setInspectorTab("layout");
    openInspectorPanel();
  };

  const selectLayoutBlock = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
  ) => {
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(blockKey);
    setOpenLayoutItemId(columnKey);
    setSectionStructureOpen(false);
    setInspectorTab("content");
    openInspectorPanel();
  };

  const selectLayoutRow = (sectionId: string, rowIndex: number) => {
    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(rowIndex);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setSectionStructureOpen(false);
    setInspectorTab("layout");
    openInspectorPanel();
  };

  const openSpacingSettings = (target: SpacingInspectorTarget) => {
    setSpacingOverlayEnabled(true);
    setSidebarCollapsed(false);

    if (target.scope === "globalSection") {
      setSidebarTab("globalStyles");
      setGlobalStylesTab("spacing");
      setGlobalSpacingFocus("section");
      return;
    }

    setSidebarTab("inspector");
    setInspectorOpen(true);
    setInspectorOpenKey((prev) => prev + 1);
    setSelectedId(target.sectionId);
    setSectionStructureOpen(false);

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
    setInspectorTab(spacingFocusRequest.scope === "column" ? "layout" : "spacing");
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
    if (!selectedSection) return;
    const slides = [...(selectedSection.slides ?? [])];
    slides[index] = { ...(slides[index] ?? {}), ...patch };
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
    if (!selectedSection) return;
    const badges = [...(selectedSection.badges ?? [])];
    badges[index] = { ...(badges[index] ?? {}), ...patch };
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

  const reflowContentLayoutItems = (
    items: NonNullable<BuilderSection["layoutItems"]>,
    targetColumns: number,
  ) => {
    const safeColumns = Math.min(Math.max(targetColumns, 1), 6);
    const normalizedItems = items.map((item, index) => ({
      ...item,
      id: item.id ?? `layout-item-${index + 1}`,
      blocks: [...getLayoutItemBlocks(item)],
    }));
    const nextItems = Array.from({ length: safeColumns }, (_, index) => {
      const sourceItem = normalizedItems[index];
      return (
        sourceItem ?? {
          id: `layout-item-${index + 1}`,
          blocks: [],
        }
      );
    });

    if (normalizedItems.length > safeColumns) {
      const overflowBlocks = normalizedItems
        .slice(safeColumns)
        .flatMap((item) => getLayoutItemBlocks(item));
      if (overflowBlocks.length > 0) {
        const lastIndex = safeColumns - 1;
        nextItems[lastIndex] = {
          ...nextItems[lastIndex],
          blocks: [...getLayoutItemBlocks(nextItems[lastIndex]), ...overflowBlocks],
        };
      }
    }

    return nextItems;
  };

  const applyContentLayoutPreset = (
    sectionId: string,
    presetKey: string,
  ) => {
    const preset = getBuilderRowLayoutPreset(presetKey);
    if (!preset) return;

    const nextColumns = preset.ratios.length;
    let nextSelectedColumnKey: string | null = null;
    let nextSelectedBlockKey = selectedLayoutBlockKey;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const layoutItems = reflowContentLayoutItems(
          section.layoutItems ?? [],
          nextColumns,
        );
        nextSelectedColumnKey = layoutItems[0]?.id ?? null;

        if (selectedLayoutBlockKey) {
          const selectedBlockMatch = layoutItems.find((item, index) =>
            getLayoutItemBlocks(item).some(
              (block, blockIndex) =>
                (block.id ?? `${item.id ?? `layout-item-${index}`}-block-${blockIndex}`) ===
                selectedLayoutBlockKey,
            ),
          );
          if (selectedBlockMatch) {
            nextSelectedColumnKey =
              selectedBlockMatch.id ?? nextSelectedColumnKey ?? null;
          } else {
            nextSelectedBlockKey = null;
          }
        }

        return {
          ...section,
          layout: preset.key,
          layoutColumns: nextColumns,
          layoutItems,
        };
      }),
    }));

    if (nextSelectedColumnKey) {
      setSelectedLayoutColumnKey(nextSelectedColumnKey);
      setOpenLayoutItemId(nextSelectedColumnKey);
    }

    setSelectedLayoutBlockKey(nextSelectedBlockKey);
  };

  const updateSelectedLayoutBlock = (
    columnIndex: number,
    blockIndex: number,
    patch: BuilderLayoutBlock,
  ) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    blocks[blockIndex] = { ...(blocks[blockIndex] ?? {}), ...patch };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const updateSelectedLayoutBlockSlide = (
    columnIndex: number,
    blockIndex: number,
    slideIndex: number,
    patch: NonNullable<BuilderLayoutBlock["slides"]>[number],
  ) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const slides = [...(block.slides ?? [])];
    slides[slideIndex] = { ...(slides[slideIndex] ?? {}), ...patch };
    blocks[blockIndex] = { ...block, slides };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockSlide = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
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
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const badges = [...(block.badges ?? [])];
    badges[badgeIndex] = { ...(badges[badgeIndex] ?? {}), ...patch };
    blocks[blockIndex] = { ...block, badges };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockBadge = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
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
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const gridItems = [...(block.gridItems ?? [])];
    gridItems[itemIndex] = { ...(gridItems[itemIndex] ?? {}), ...patch };
    blocks[blockIndex] = { ...block, gridItems };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const addSelectedLayoutBlockGridItem = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
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
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    const buttons = [...(block.buttons ?? [])];
    buttons[buttonIndex] = { ...(buttons[buttonIndex] ?? {}), ...patch };
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
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    blocks[blockIndex] = {
      ...block,
      buttons: (block.buttons ?? []).filter((_, index) => index !== buttonIndex),
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const deleteSelectedLayoutBlock = (
    columnIndex: number,
    blockIndex: number,
  ) => {
    if (!selectedSection) return;
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
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const columnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === columnKey,
        );
        if (columnIndex < 0) return section;

        const item = layoutItems[columnIndex] ?? {};
        const blocks = [...getLayoutItemBlocks(item)];
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
        layoutItems[columnIndex] = { ...item, blocks };
        return { ...section, layoutItems };
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

        const layoutItems = [...(section.layoutItems ?? [])];
        const columnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === columnKey,
        );
        if (columnIndex < 0) return section;

        const item = layoutItems[columnIndex] ?? {};
        const blocks = [...getLayoutItemBlocks(item)];
        const blockIndex = blocks.findIndex(
          (block, index) =>
            (block.id ?? `${columnKey}-block-${index}`) === blockKey,
        );
        const nextIndex = blockIndex + direction;
        if (
          blockIndex < 0 ||
          nextIndex < 0 ||
          nextIndex >= blocks.length
        ) {
          return section;
        }

        const [movedBlock] = blocks.splice(blockIndex, 1);
        if (!movedBlock) return section;
        blocks.splice(nextIndex, 0, movedBlock);
        layoutItems[columnIndex] = { ...item, blocks };
        return { ...section, layoutItems };
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

        const layoutItems = [...(section.layoutItems ?? [])];
        const columnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === columnKey,
        );
        if (columnIndex < 0) return section;

        const item = layoutItems[columnIndex] ?? {};
        layoutItems[columnIndex] = {
          ...item,
          blocks: getLayoutItemBlocks(item).filter(
            (block, index) =>
              (block.id ?? `${columnKey}-block-${index}`) !== blockKey,
          ),
        };
        return { ...section, layoutItems };
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
  }: {
    sectionId: string;
    targetSectionId?: string;
    sourceColumnKey: string;
    sourceBlockKey: string;
    targetColumnKey: string;
    targetBlockKey?: string;
  }) => {
    setBuilderState((current) => {
      let movingBlock: BuilderLayoutBlock | null = null;
      const targetSection = current.sections.find(
        (section) =>
          section.id === targetSectionId && isLayoutContainerSection(section),
      );
      const hasTargetColumn = (targetSection?.layoutItems ?? []).some(
        (item, index) =>
          (item.id ?? `layout-item-${index}`) === targetColumnKey,
      );

      if (!hasTargetColumn) return current;

      const sectionsWithoutBlock = current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const sourceColumnIndex = layoutItems.findIndex(
          (item, index) =>
            (item.id ?? `layout-item-${index}`) === sourceColumnKey,
        );
        if (sourceColumnIndex < 0) return section;

        const sourceItem = layoutItems[sourceColumnIndex] ?? {};
        const sourceBlocks = [...getLayoutItemBlocks(sourceItem)];
        const sourceBlockIndex = sourceBlocks.findIndex(
          (block, index) =>
            (block.id ?? `${sourceColumnKey}-block-${index}`) ===
            sourceBlockKey,
        );
        if (sourceBlockIndex < 0) return section;

        const [removedBlock] = sourceBlocks.splice(sourceBlockIndex, 1);
        if (!removedBlock) return section;

        movingBlock = removedBlock;
        layoutItems[sourceColumnIndex] = {
          ...sourceItem,
          blocks: sourceBlocks,
        };
        return { ...section, layoutItems };
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

          const layoutItems = [...(section.layoutItems ?? [])];
          const targetColumnIndex = layoutItems.findIndex(
            (item, index) =>
              (item.id ?? `layout-item-${index}`) === targetColumnKey,
          );
          if (targetColumnIndex < 0) return section;

          const targetItem = layoutItems[targetColumnIndex] ?? {};
          const targetBlocks = [...getLayoutItemBlocks(targetItem)];
          const targetIndex = targetBlockKey
            ? targetBlocks.findIndex(
                (block, index) =>
                  (block.id ?? `${targetColumnKey}-block-${index}`) ===
                  targetBlockKey,
              )
            : -1;

          targetBlocks.splice(
            targetIndex >= 0 ? targetIndex : targetBlocks.length,
            0,
            blockToMove,
          );
          layoutItems[targetColumnIndex] = {
            ...targetItem,
            blocks: targetBlocks,
          };

          return { ...section, layoutItems };
        }),
      };
    });

    setSelectedId(targetSectionId);
    setSelectedLayoutColumnKey(targetColumnKey);
    setOpenLayoutItemId(targetColumnKey);
    setSelectedLayoutBlockKey(sourceBlockKey);
  };

  const createLayoutBlockAtDrop = ({
    sectionId,
    targetColumnKey,
    kind,
    targetBlockKey,
  }: {
    sectionId: string;
    targetColumnKey: string;
    kind: LayoutBlockKind;
    targetBlockKey?: string;
  }) => {
    const block = createLayoutBlock(kind);
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const targetColumnIndex = layoutItems.findIndex(
          (item, index) =>
            (item.id ?? `layout-item-${index}`) === targetColumnKey,
        );
        if (targetColumnIndex < 0) return section;

        const targetItem = layoutItems[targetColumnIndex] ?? {};
        const targetBlocks = [...getLayoutItemBlocks(targetItem)];
        const targetIndex = targetBlockKey
          ? targetBlocks.findIndex(
              (item, index) =>
                (item.id ?? `${targetColumnKey}-block-${index}`) ===
                targetBlockKey,
            )
          : -1;

        targetBlocks.splice(
          targetIndex >= 0 ? targetIndex : targetBlocks.length,
          0,
          block,
        );
        layoutItems[targetColumnIndex] = {
          ...targetItem,
          blocks: targetBlocks,
        };

        return { ...section, layoutItems };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(targetColumnKey);
    setOpenLayoutItemId(targetColumnKey);
    setSelectedLayoutBlockKey(block.id ?? null);
  };

  const addElementFromLibrary = (kind: LayoutBlockKind) => {
    let targetSection = selectedSection;

    if (!targetSection || !isLayoutContainerSection(targetSection)) {
      const nextSection = createWireframeSection(1, 1);
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
    }

    const layoutItems = targetSection.layoutItems ?? [];
    const targetColumn =
      layoutItems.find(
        (item, index) =>
          (item.id ?? `layout-item-${index}`) === selectedLayoutColumnKey,
      ) ?? layoutItems[0];
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

  const addSelectedLayoutItem = () => {
    if (!selectedSection) return;
    const layoutItems = selectedSection.layoutItems ?? [];
    const id = `layout-item-${Date.now().toString(36)}`;
    updateSelected({
      layoutItems: [
        ...layoutItems,
        {
          id,
          blocks: [],
        },
      ],
      layout: undefined,
      layoutColumns: Math.min(
        Math.max(selectedSection.layoutColumns ?? 2, 1),
        6,
      ),
    });
    setOpenLayoutItemId(id);
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

  const openWordPressMediaPicker = ({
    title,
    currentUrl,
    onSelect,
  }: {
    title: string;
    currentUrl?: string;
    onSelect: (media: WordPressMediaItem) => void;
  }) => {
    mediaSelectRef.current = onSelect;
    setMediaPickerTitle(title);
    setMediaPickerCurrentUrl(currentUrl ?? "");
    setMediaPage(1);
    setMediaPickerOpen(true);
  };

  const closeWordPressMediaPicker = () => {
    setMediaPickerOpen(false);
    mediaSelectRef.current = null;
  };

  const handleMediaSearchChange = (value: string) => {
    setMediaPage(1);
    setMediaSearch(value);
  };

  const goToMediaPage = (nextPage: number) => {
    setMediaPage(Math.max(nextPage, 1));
  };

  const selectWordPressMedia = (media: WordPressMediaItem) => {
    mediaSelectRef.current?.(media);
    setPublishStatus("WordPress media selected");
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

  const uploadGridItemImage = async (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    file: File | null,
  ) => {
    if (!file) return;
    setPublishStatus("Uploading grid image...");

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
      updateGridItemByKey(sectionId, columnKey, blockKey, itemIndex, {
        imageUrl: payload.url,
        imageAlt: file.name,
      });
      setPublishStatus("Grid image uploaded");
    } catch {
      setPublishStatus("Image upload failed");
    }
  };

  const addWireframeNear = (
    columns: number,
    rows: number,
    targetSectionId: string,
    placement: "above" | "below",
    presetKey?: string,
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
    if (isLayoutContainerSection(nextSection)) {
      const firstColumn = nextSection.layoutItems?.[0]?.id ?? null;
      setSelectedLayoutColumnKey(firstColumn);
      setOpenLayoutItemId(firstColumn);
      setSelectedLayoutBlockKey(null);
    } else {
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
    }
  };

  const addRowNear = (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => {
    const preset = rowInsertionPresets.find((item) => item.key === presetKey);
    if (!preset) return;

    const rowId = `layout-row-${Date.now().toString(36)}`;
    const newItems: PreviewLayoutItem[] = preset.ratios.map((_, index) => ({
      id: `${rowId}-column-${index + 1}`,
      rowId,
      rowLayout: preset.key,
      blocks: [],
    }));
    const firstColumnKey: string | null = newItems[0]?.id ?? null;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[rowIndex];
        const insertIndex = targetRow
          ? targetRow.startIndex + (placement === "after" ? targetRow.items.length : 0)
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

    if (selectedLayoutColumnKey && removedColumnKeys.has(selectedLayoutColumnKey)) {
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
    const preset = getBuilderRowLayoutPreset(presetKey);
    if (!preset) return;

    let nextSelectedColumnKey: string | null = null;

    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (
          section.id !== selectedSection.id ||
          !isLayoutContainerSection(section)
        ) {
          return section;
        }

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[selectedLayoutRowIndex];
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

        if (normalizedItems.length > preset.ratios.length) {
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

    setSelectedLayoutColumnKey(nextSelectedColumnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(nextSelectedColumnKey);
    setPublishStatus("Row layout updated");
  };

  const updateSelectedRowStyle = (
    patch: Partial<NonNullable<BuilderSection["layoutItems"]>[number]>,
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

        const layoutItems = section.layoutItems ?? [];
        const layoutRows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = layoutRows[selectedLayoutRowIndex];
        if (!targetRow) return section;
        const targetItems = new Set(targetRow.items);

        return {
          ...section,
          layoutItems: layoutItems.map((item) =>
            targetItems.has(item) ? { ...item, ...patch } : item,
          ),
        };
      }),
    }));
    setPublishStatus("Row spacing updated");
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

  const reorderSection = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setBuilderState((current) => {
      const sourceIndex = current.sections.findIndex(
        (section) => section.id === sourceId,
      );
      const targetIndex = current.sections.findIndex(
        (section) => section.id === targetId,
      );
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const nextSections = [...current.sections];
      const [section] = nextSections.splice(sourceIndex, 1);
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

    // Reset selection to first section or clear
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
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
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setPublishStatus("Redid last change");
  };
  redoRef.current = redoBuilder;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      const isUndo = mod && e.key === "z" && !e.shiftKey;
      const isRedo = mod && e.key === "z" && e.shiftKey;
      if (isUndo) { e.preventDefault(); undoRef.current(); }
      if (isRedo) { e.preventDefault(); redoRef.current(); }
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
    setPublishStatus("Reading published layout...");
    const response = await fetch(
      `/api/builder-layouts?key=${builderState.page}`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      setPublishStatus("Could not read published layout");
      return;
    }

    const payload = (await response.json()) as {
      layout?: BuilderState | null;
    };

    const currentSignature = JSON.stringify(builderState);

    if (!payload.layout?.sections?.length) {
      setPublishStatus("No published layout yet");
      setCommittedBuilderStateSignature(JSON.stringify(builderState));
      return;
    }

    const nextPublishedState = normalizeBuilderState(
      {
        page: payload.layout.page,
        targetType:
          payload.layout.targetType ?? builderState.targetType ?? "page",
        template: payload.layout.template,
        design: {
          ...defaultDesign,
          ...(payload.layout.design ?? {}),
        },
        sections: payload.layout.sections,
      },
      builderState.page,
    );

    const nextSignature = JSON.stringify(nextPublishedState);
    if (nextSignature === currentSignature) {
      setCommittedBuilderStateSignature(nextSignature);
      setPublishStatus("Local draft matches published");
      return;
    }

    undoHistoryRef.current = [structuredClone(nextPublishedState)];
    setCommittedBuilderStateSignature(nextSignature);
    setBuilderState(nextPublishedState);
    setSelectedId(nextPublishedState.sections[0]?.id ?? "");
    setPublishStatus("Published layout loaded");
  }, [builderState.page, builderState.targetType, builderState.template]);

  useEffect(() => {
    if (!draftReady) return;
    void loadPublishedLayout();
  }, [builderState.page, draftReady, loadPublishedLayout]);

  const publishLayout = async () => {
    setPublishStatus("Publishing layout...");
    setPublishCelebration(false);
    const response = await fetch("/api/builder-layouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(builderState),
    });

    if (!response.ok) {
      setPublishStatus("Publish failed");
      return;
    }

    setCommittedBuilderStateSignature(JSON.stringify(builderState));
    setPublishStatus("Published layout saved");
    setPublishedKeys((current) => {
      if (current.includes(builderState.page)) return current;
      return [...current, builderState.page];
    });
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
    status = "Global settings saved",
  ) => {
    const response = await fetch("/api/builder-shell", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nextSettings),
    });

    if (!response.ok) {
      setShellStatus("Shell save failed");
      return false;
    }

    const payload = (await response.json()) as {
      settings?: BuilderShellSettings;
    };

    if (payload.settings) {
      setShellSettings(payload.settings);
    }
    setShellStatus(status);
    router.refresh();
    return true;
  };

  const updateShellSettings = (patch: Partial<BuilderShellSettings>) => {
    const nextSettings = { ...shellSettings, ...patch };
    setShellSettings(nextSettings);
    setShellStatus("Updating global preview...");

    if (shellAutoSaveTimer.current) {
      window.clearTimeout(shellAutoSaveTimer.current);
    }

    shellAutoSaveTimer.current = window.setTimeout(() => {
      void saveShellSettings(nextSettings, "Global preview updated");
    }, 220);
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

  const updateHeaderIcon = (
    icon: BuilderHeaderIconId,
    enabled: boolean,
  ) => {
    const currentOrder =
      shellSettings.headerIconOrder?.length > 0
        ? shellSettings.headerIconOrder
        : defaultShellSettings.headerIconOrder;
    const nextOrder = enabled
      ? [...currentOrder.filter((item) => item !== icon), icon]
      : currentOrder.filter((item) => item !== icon);

    updateShellSettings({
      headerIconOrder: nextOrder.length > 0 ? nextOrder : [icon],
    });
  };

  const applyHeaderPreset = (
    preset: "service" | "commerce" | "classic" | "simple" | "hero" | "wordpress",
  ) => {
    if (preset === "wordpress") {
      updateShellSettings({
        headerLayout: "wordpress",
      });
      return;
    }

    if (preset === "service") {
      updateShellSettings({
        headerVisible: true,
        headerLayout: "princity",
        headerBrandMode: "brand",
        headerBrandText: "WebPages",
        headerIconVariant: "muted",
        headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
        headerActiveIndicator: "princity",
      });
      return;
    }

    if (preset === "commerce") {
      updateShellSettings({
        headerVisible: true,
        headerLayout: "pill",
        headerBrandMode: "both",
        headerBrandText: "WebPages Store",
        headerIconVariant: "ghost",
        headerIconOrder: ["search", "wishlist", "cart", "account", "theme"],
        headerActiveIndicator: "underline",
      });
      return;
    }

    if (preset === "simple") {
      updateShellSettings({
        headerVisible: true,
        headerLayout: "simple",
        headerBrandMode: "logo",
        headerIconVariant: "muted",
        headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
        headerActiveIndicator: "underline",
      });
      return;
    }

    if (preset === "hero") {
      updateShellSettings({
        headerVisible: true,
        headerLayout: "hero",
        headerBrandMode: "both",
        headerIconVariant: "muted",
        headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
        headerActiveIndicator: "underline",
      });
      return;
    }

    updateShellSettings({
      headerVisible: true,
      headerLayout: "two-row",
      headerBrandMode: "logo",
      headerIconVariant: "muted",
      headerIconOrder: ["wishlist", "cart", "account", "theme", "search"],
      headerActiveIndicator: "underline",
    });
  };

  const publishShellSettings = async () => {
    setShellStatus("Publishing global settings...");
    await saveShellSettings(shellSettings, "Global settings published");
  };

  const createBuilderPage = async () => {
    const title = newPageTitle.trim() || "New Page";
    setPageStatus("Creating page...");

    const response = await fetch("/api/builder-pages", {
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
      STORAGE_CUSTOM_PAGES,
      JSON.stringify(nextPages),
    );
    setNewPageTitle("");

    const nextState = getDefaultStateForKey(payload.page.key);
    setBuilderState(nextState);
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setOpenSlideId(null);
    setPageStatus("Page created");
    router.replace(`${pathname}?page=${payload.page.key}`, { scroll: false });
  };

  const deleteBuilderPage = async (key: BuilderCustomPageKey) => {
    setPageStatus("Deleting page...");
    const response = await fetch(
      `/api/builder-pages?key=${encodeURIComponent(key)}`,
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
      STORAGE_CUSTOM_PAGES,
      JSON.stringify(nextPages),
    );

    try {
      const rawDrafts = window.localStorage.getItem(STORAGE_BY_KEY);
      const drafts = rawDrafts
        ? (JSON.parse(rawDrafts) as Partial<
            Record<BuilderLayoutKey, BuilderState>
          >)
        : {};
      delete drafts[key];
      window.localStorage.setItem(STORAGE_BY_KEY, JSON.stringify(drafts));
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
      STORAGE_CUSTOM_PAGES,
      JSON.stringify(nextPages),
    );
    try {
      await fetch("/api/builder-pages", {
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

  const cloneTemplateBlock = (block: BuilderLayoutBlock): BuilderLayoutBlock => {
    const nextBlock = JSON.parse(JSON.stringify(block)) as BuilderLayoutBlock;
    return {
      ...nextBlock,
      id: createBlockId((nextBlock.kind ?? "text") as LayoutBlockKind),
    };
  };

  const cloneTemplateSection = (section: BuilderSection): BuilderSection => {
    const nextSection = JSON.parse(JSON.stringify(section)) as BuilderSection;
    const rowIdMap = new Map<string, string>();
    const nextLayoutItems = (nextSection.layoutItems ?? []).map((item, index) => {
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
    });

    return {
      ...nextSection,
      id: createId(nextSection.kind),
      layoutItems: nextLayoutItems.length > 0 ? nextLayoutItems : nextSection.layoutItems,
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
    const rows = getPreviewLayoutRows(section, section.layoutItems ?? []);
    const row = rows[rowIndex];
    if (!row) return null;
    const wrapper = createWireframeSection(row.items.length || 1, 1, row.layoutKey);
    const rowId = `layout-row-${Date.now().toString(36)}-template`;
    return {
      ...wrapper,
      title,
      layout: row.layoutKey,
      layoutColumns: row.items.length || 1,
      layoutItems: row.items.map((item, index) => ({
        ...item,
        id: `layout-item-${Date.now().toString(36)}-row-template-${index}`,
        rowId,
        rowLayout: row.layoutKey,
        blocks: (item.blocks ?? []).map(cloneTemplateBlock),
      })),
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

    const response = await fetch("/api/builder-templates", {
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

    if (savedTemplate) {
      setSidebarCollapsed(false);
      setSidebarTab("templates");
      setRenameTemplateRequest({
        id: savedTemplate.id,
        templateType: savedTemplate.templateType ?? templateType,
      });
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
        : templateType === "section"
          ? selectedSection?.title || "Saved Section"
          : selectedLayoutBlock
            ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
            : "Saved Element");
    const sections =
      templateType === "page"
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
      (entry, index) => (entry.id ?? `${columnKey}-block-${index}`) === blockKey,
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

  const applySavedTemplate = (template: BuilderSavedTemplate) => {
    const templateType = template.templateType ?? "page";
    const clonedSections = template.sections.map(cloneTemplateSection);

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
      const block = clonedSections
        .flatMap((section) => section.layoutItems ?? [])
        .flatMap((item) => item.blocks ?? [])[0];
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
            return {
              ...section,
              layoutItems: (section.layoutItems ?? []).map((item, index) => {
                const columnKey = item.id ?? `layout-item-${index}`;
                if (columnKey !== selectedLayoutColumnKey) return item;
                return {
                  ...item,
                  blocks: [...(item.blocks ?? []), cloneTemplateBlock(block)],
                };
              }),
            };
          }),
        }));
        setTemplateStatus("Element template added");
        return;
      }
    }

    if (
      templateType === "row" &&
      selectedSection &&
      isLayoutContainerSection(selectedSection)
    ) {
      const rowItems =
        clonedSections[0]?.layoutItems?.map((item, index) => ({
          ...item,
          id: `layout-item-${Date.now().toString(36)}-row-use-${index}`,
          rowId: `layout-row-${Date.now().toString(36)}-use`,
          blocks: (item.blocks ?? []).map(cloneTemplateBlock),
        })) ?? [];
      if (rowItems.length > 0) {
        setBuilderState((current) => ({
          ...current,
          sections: current.sections.map((section) =>
            section.id === selectedSection.id
              ? {
                  ...section,
                  layoutItems: [...(section.layoutItems ?? []), ...rowItems],
                  layoutRows: (section.layoutRows ?? 1) + 1,
                }
              : section,
          ),
        }));
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

  const createRowItemsFromTemplate = (template: BuilderSavedTemplate) => {
    const sourceSection = template.sections[0];
    const rowId = `layout-row-${Date.now().toString(36)}-drop`;
    return (sourceSection?.layoutItems ?? []).map((item, index) => ({
      ...item,
      id: `layout-item-${Date.now().toString(36)}-row-drop-${index}-${Math.random()
        .toString(36)
        .slice(2, 6)}`,
      rowId,
      rowLayout: item.rowLayout ?? sourceSection?.layout,
      blocks: (item.blocks ?? []).map(cloneTemplateBlock),
    }));
  };

  const insertSectionTemplateNear = (
    templateId: string,
    targetSectionId: string,
    placement: "above" | "below",
  ) => {
    const template = getSavedTemplateById(templateId);
    if (!template || (template.templateType ?? "page") !== "section") {
      setTemplateStatus("Drop section templates between sections");
      return;
    }

    const clonedSections = template.sections.map(cloneTemplateSection);
    setBuilderState((current) => {
      const targetIndex = current.sections.findIndex(
        (section) => section.id === targetSectionId,
      );
      const insertIndex =
        targetIndex < 0
          ? current.sections.length
          : placement === "above"
            ? targetIndex
            : targetIndex + 1;
      const sections = [...current.sections];
      sections.splice(insertIndex, 0, ...clonedSections);
      return { ...current, sections };
    });
    setSelectedId(clonedSections[0]?.id ?? targetSectionId);
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutRowIndex(null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(null);
    setTemplateStatus("Section template inserted");
  };

  const insertRowTemplateAt = (
    templateId: string,
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
  ) => {
    const template = getSavedTemplateById(templateId);
    if (!template || template.templateType !== "row") {
      setTemplateStatus("Drop row templates on row borders");
      return;
    }

    const rowItems = createRowItemsFromTemplate(template);
    if (rowItems.length === 0) {
      setTemplateStatus("Row template is empty");
      return;
    }

    const nextSelectedRowIndex = placement === "before" ? rowIndex : rowIndex + 1;
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }

        const layoutItems = section.layoutItems ?? [];
        const rows = getPreviewLayoutRows(section, layoutItems);
        const targetRow = rows[rowIndex];
        if (!targetRow) return section;
        const targetItem =
          placement === "before"
            ? targetRow.items[0]
            : targetRow.items[targetRow.items.length - 1];
        const targetItemIndex = layoutItems.findIndex((item, index) => {
          const itemKey = item.id ?? `layout-item-${index}`;
          const targetKey = targetItem?.id;
          return item === targetItem || (targetKey ? itemKey === targetKey : false);
        });
        if (targetItemIndex < 0) return section;
        const insertIndex =
          placement === "before" ? targetItemIndex : targetItemIndex + 1;
        const nextLayoutItems = [...layoutItems];
        nextLayoutItems.splice(insertIndex, 0, ...rowItems);
        return {
          ...section,
          layoutItems: nextLayoutItems,
          layoutRows: (section.layoutRows ?? rows.length) + 1,
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutRowIndex(nextSelectedRowIndex);
    setSelectedLayoutColumnKey(rowItems[0]?.id ?? null);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(rowItems[0]?.id ?? null);
    setInspectorTab("layout");
    openInspectorPanel();
    setTemplateStatus("Row template inserted");
  };

  const insertElementTemplateAt = ({
    templateId,
    sectionId,
    columnKey,
    targetBlockKey,
  }: {
    templateId: string;
    sectionId: string;
    columnKey: string;
    targetBlockKey?: string;
  }) => {
    const template = getSavedTemplateById(templateId);
    if (!template || template.templateType !== "element") {
      setTemplateStatus("Drop element templates into columns");
      return;
    }

    const sourceBlock = template.sections
      .flatMap((section) => section.layoutItems ?? [])
      .flatMap((item) => item.blocks ?? [])[0];
    if (!sourceBlock) {
      setTemplateStatus("Element template is empty");
      return;
    }

    const insertedBlock = cloneTemplateBlock(sourceBlock);
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || !isLayoutContainerSection(section)) {
          return section;
        }
        return {
          ...section,
          layoutItems: (section.layoutItems ?? []).map((item, index) => {
            const itemKey = item.id ?? `layout-item-${index}`;
            if (itemKey !== columnKey) return item;
            const blocks = [...(item.blocks ?? [])];
            const targetIndex = targetBlockKey
              ? blocks.findIndex(
                  (block, blockIndex) =>
                    (block.id ?? `${columnKey}-block-${blockIndex}`) ===
                    targetBlockKey,
                )
              : -1;
            blocks.splice(targetIndex >= 0 ? targetIndex : blocks.length, 0, insertedBlock);
            return { ...item, blocks };
          }),
        };
      }),
    }));

    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(insertedBlock.id ?? null);
    setOpenLayoutItemId(columnKey);
    setInspectorTab("content");
    openInspectorPanel();
    setTemplateStatus("Element template inserted");
  };

  const renameSavedTemplate = async (
    template: BuilderSavedTemplate,
    nextTitle: string,
  ) => {
    const title = nextTitle.trim();
    if (!title || title === template.title) return;
    setTemplateStatus("Renaming template...");

    const response = await fetch("/api/builder-templates", {
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

  const deleteSavedTemplate = async (id: string) => {
    setTemplateStatus("Deleting template...");
    const response = await fetch(
      `/api/builder-templates?id=${encodeURIComponent(id)}`,
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

  const inspectorPanel = (
    <DashboardInspector
      hasSections={builderState.sections.length > 0}
      builderJson={builderJson}
      copied={copied}
      elementBackgroundPresets={elementBackgroundPresets}
      getLayoutItemBlocks={getLayoutItemBlocks}
      inspectorOpen={inspectorOpen}
      inspectorTab={inspectorTab}
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
      sectionStructureOpen={sectionStructureOpen}
      selectedLayoutColumnKey={selectedLayoutColumnKey}
      selectedLayoutRowIndex={selectedLayoutRowIndex}
      selectedLayoutBlock={selectedLayoutBlock}
      selectedLayoutBlockKey={selectedLayoutBlockKey}
      selectedSection={selectedSection}
      shellSettings={shellSettings}
      uploadingNestedSlide={uploadingNestedSlide}
      uploadingSlide={uploadingSlide}
      addSelectedLayoutBlockBadge={addSelectedLayoutBlockBadge}
      addSelectedLayoutBlockGridItem={addSelectedLayoutBlockGridItem}
      addSelectedLayoutBlockButton={addSelectedLayoutBlockButton}
      addSelectedLayoutBlockSlide={addSelectedLayoutBlockSlide}
      addSelectedLayoutItem={addSelectedLayoutItem}
      addSelectedSlide={addSelectedSlide}
      copyJson={copyJson}
      deleteSelected={deleteSelected}
      deleteSelectedLayoutBlock={deleteSelectedLayoutBlock}
      deleteSelectedLayoutBlockBadge={deleteSelectedLayoutBlockBadge}
      deleteSelectedLayoutBlockButton={deleteSelectedLayoutBlockButton}
      deleteSelectedLayoutBlockGridItem={deleteSelectedLayoutBlockGridItem}
      deleteSelectedLayoutBlockSlide={deleteSelectedLayoutBlockSlide}
      deleteSelectedLayoutItem={deleteSelectedLayoutItem}
      deleteSelectedSlide={deleteSelectedSlide}
      duplicateSelected={duplicateSelected}
      duplicateSelectedRow={duplicateSelectedRow}
      applyLayoutPreset={applyContentLayoutPreset}
      applySelectedRowLayoutPreset={applySelectedRowLayoutPreset}
      onUpdateRowStyle={updateSelectedRowStyle}
      deleteSelectedRow={deleteSelectedRow}
      moveSelected={moveSelected}
      openWordPressMediaPicker={openWordPressMediaPicker}
      setInspectorOpen={setInspectorOpen}
      setInspectorTab={setInspectorTab}
      setSpacingOverlayEnabled={setSpacingOverlayEnabled}
      setOpenSlideId={setOpenSlideId}
      setSectionSettingsOpen={setSectionSettingsOpen}
      setSectionStructureOpen={setSectionStructureOpen}
      setSelectedLayoutBlockKey={setSelectedLayoutBlockKey}
      updateSelected={updateSelected}
      updateSelectedBadge={updateSelectedBadge}
      updateSelectedLayoutBlock={updateSelectedLayoutBlock}
      updateSelectedLayoutBlockButton={updateSelectedLayoutBlockButton}
      updateSelectedLayoutBlockBadge={updateSelectedLayoutBlockBadge}
      updateSelectedLayoutBlockGridItem={updateSelectedLayoutBlockGridItem}
      updateSelectedLayoutBlockSlide={updateSelectedLayoutBlockSlide}
      updateSelectedSlide={updateSelectedSlide}
      onOpenGlobalSpacingSettings={(scope) => {
        setSidebarTab("globalStyles");
        setGlobalStylesTab("spacing");
        setGlobalSpacingFocus(scope);
      }}
      uploadSelectedLayoutBlockSlideImage={uploadSelectedLayoutBlockSlideImage}
      uploadSelectedSlideImage={uploadSelectedSlideImage}
    />
  );

  const globalStylesPanel = (
    <div className="builder-sidebar-panel builder-sidebar-global-styles">
      <div className="builder-sidebar-panel-header">
        <div>
          <strong>Global Styles</strong>
          <span>Site design, typography, header, and spacing</span>
        </div>
        <small>{shellStatus}</small>
      </div>

      <div className="builder-global-style-tabs" aria-label="Global style sections">
        {(
          [
            ["siteDesign", "Site Design"],
            ["spacing", "Spacing"],
            ["cards", "Cards"],
            ["typography", "Typography"],
            ["header", "Header"],
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
                    (builderState.design[key as keyof BuilderDesign] as string) ??
                    "#ffffff"
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
              <option value="minimal">Minimal (Dark gray, round buttons)</option>
              <option value="soft">Soft (Sage tones, medium round buttons)</option>
              <option value="elevated">Elevated (Slate tones, large card shadows)</option>
              <option value="boutique">Boutique (Red accents, square buttons)</option>
              <option value="princity">Princity (Pure white, bold borders)</option>
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
            <strong>{shellStatus}</strong>
            <span>
              Sections, rows, and elements inherit these defaults until spacing
              is overridden locally.
            </span>
          </div>

          <section id="global-spacing-section" className="builder-global-spacing-group" tabIndex={-1}>
            <div className="builder-card-title">
              <strong>Section Spacing</strong>
              <span>default padding + margin</span>
            </div>
            <div className="builder-two-column">
              <GlobalSpacingControl label="Default Top Padding" value={shellSettings.sectionPaddingTop} context="sectionPadding" onChange={(val) => updateShellSettings({ sectionPaddingTop: val })} />
              <GlobalSpacingControl label="Default Bottom Padding" value={shellSettings.sectionPaddingBottom} context="sectionPadding" onChange={(val) => updateShellSettings({ sectionPaddingBottom: val })} />
            </div>
            <div className="builder-two-column">
              <GlobalSpacingControl label="Default Top Margin" value={shellSettings.sectionMarginTop} context="sectionMargin" onChange={(val) => updateShellSettings({ sectionMarginTop: val })} />
              <GlobalSpacingControl label="Default Bottom Margin" value={shellSettings.sectionMarginBottom} context="sectionMargin" onChange={(val) => updateShellSettings({ sectionMarginBottom: val })} />
            </div>
          </section>

          <section id="global-spacing-row" className="builder-global-spacing-group" tabIndex={-1}>
            <div className="builder-card-title">
              <strong>Row Spacing</strong>
              <span>default padding, margin + gap</span>
            </div>
            <div className="builder-two-column">
              <GlobalSpacingControl label="Row Padding Top" value={shellSettings.rowPaddingTop} context="rowPadding" onChange={(val) => updateShellSettings({ rowPaddingTop: val })} />
              <GlobalSpacingControl label="Row Padding Bottom" value={shellSettings.rowPaddingBottom} context="rowPadding" onChange={(val) => updateShellSettings({ rowPaddingBottom: val })} />
            </div>
            <div className="builder-two-column">
              <GlobalSpacingControl label="Row Margin Top" value={shellSettings.rowMarginTop} context="rowMargin" onChange={(val) => updateShellSettings({ rowMarginTop: val })} />
              <GlobalSpacingControl label="Row Margin Bottom" value={shellSettings.rowMarginBottom} context="rowMargin" onChange={(val) => updateShellSettings({ rowMarginBottom: val })} />
            </div>
            <GlobalSpacingControl label="Gap Between Rows" value={shellSettings.rowGap} context="rowGap" onChange={(val) => updateShellSettings({ rowGap: val })} />
          </section>

          <section id="global-spacing-element" className="builder-global-spacing-group" tabIndex={-1}>
            <div className="builder-card-title">
              <strong>Element Spacing</strong>
              <span>default padding + margin on every side</span>
            </div>
            <div className="builder-two-column">
              <GlobalSpacingControl label="Padding Top" value={shellSettings.elementPaddingTop} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingTop: val })} />
              <GlobalSpacingControl label="Padding Right" value={shellSettings.elementPaddingRight} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingRight: val })} />
              <GlobalSpacingControl label="Padding Bottom" value={shellSettings.elementPaddingBottom} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingBottom: val })} />
              <GlobalSpacingControl label="Padding Left" value={shellSettings.elementPaddingLeft} context="elementPadding" onChange={(val) => updateShellSettings({ elementPaddingLeft: val })} />
            </div>
            <div className="builder-two-column">
              <GlobalSpacingControl label="Margin Top" value={shellSettings.elementMarginTop} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginTop: val })} />
              <GlobalSpacingControl label="Margin Right" value={shellSettings.elementMarginRight} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginRight: val })} />
              <GlobalSpacingControl label="Margin Bottom" value={shellSettings.elementMarginBottom} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginBottom: val })} />
              <GlobalSpacingControl label="Margin Left" value={shellSettings.elementMarginLeft} context="elementMargin" onChange={(val) => updateShellSettings({ elementMarginLeft: val })} />
            </div>
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
                  ["0px", "4px", "8px", "12px", "16px", "24px"].includes(shellSettings.productCardRadius)
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

          {!["0px", "4px", "8px", "12px", "16px", "24px"].includes(shellSettings.productCardRadius) && (
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
              value={shellSettings.productCardShadow || "0 0 0 rgba(15, 23, 42, 0)"}
              onChange={(event) =>
                updateShellSettings({
                  productCardShadow: event.target.value,
                })
              }
            >
              <option value="0 0 0 rgba(15, 23, 42, 0)">None</option>
              <option value="0 4px 12px rgba(15, 23, 42, 0.05)">Subtle (0 4px 12px)</option>
              <option value="0 8px 24px rgba(15, 23, 42, 0.06)">Soft (0 8px 24px)</option>
              <option value="0 12px 30px rgba(15, 23, 42, 0.08)">Medium (0 12px 30px)</option>
              <option value="0 18px 42px rgba(15, 23, 42, 0.12)">Strong (0 18px 42px)</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Card Hover Shadow</span>
            <select
              value={shellSettings.productCardShadowHover || "0 18px 40px rgba(15, 23, 42, 0.14)"}
              onChange={(event) =>
                updateShellSettings({
                  productCardShadowHover: event.target.value,
                })
              }
            >
              <option value="0 0 0 rgba(15, 23, 42, 0)">None</option>
              <option value="0 12px 24px rgba(15, 23, 42, 0.08)">Soft (0 12px 24px)</option>
              <option value="0 18px 40px rgba(15, 23, 42, 0.14)">Medium (0 18px 40px)</option>
              <option value="0 24px 54px rgba(15, 23, 42, 0.18)">Strong (0 24px 54px)</option>
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
                ["auto", "1 / 1", "4 / 3", "16 / 9", "3 / 2"].includes(shellSettings.productImageAspectRatio)
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

          {!["auto", "1 / 1", "4 / 3", "16 / 9", "3 / 2"].includes(shellSettings.productImageAspectRatio) && (
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
                ["0px", "clamp(6px, 1vw, 14px)", "clamp(14px, 1.5vw, 22px)", "clamp(22px, 2.4vw, 36px)", "clamp(28px, 4vw, 48px)"].includes(shellSettings.productImagePadding)
                  ? shellSettings.productImagePadding
                  : "custom"
              }
              onChange={(event) => {
                const val = event.target.value;
                if (val === "custom") {
                  updateShellSettings({
                    productImagePadding: "20px",
                    productImageNoPadding: false
                  });
                } else {
                  updateShellSettings({
                    productImagePadding: val,
                    productImageNoPadding: val === "0px"
                  });
                }
              }}
            >
              <option value="0px">None (0px)</option>
              <option value="clamp(6px, 1vw, 14px)">Tight (Tight padding)</option>
              <option value="clamp(14px, 1.5vw, 22px)">Compact (Compact padding)</option>
              <option value="clamp(22px, 2.4vw, 36px)">Medium (Medium padding)</option>
              <option value="clamp(28px, 4vw, 48px)">Large (Large padding)</option>
              <option value="custom">Custom...</option>
            </select>
          </label>

          {!["0px", "clamp(6px, 1vw, 14px)", "clamp(14px, 1.5vw, 22px)", "clamp(22px, 2.4vw, 36px)", "clamp(28px, 4vw, 48px)"].includes(shellSettings.productImagePadding) && (
            <label className="builder-field">
              <span>Custom Image Padding (e.g. 10px)</span>
              <input
                type="text"
                value={shellSettings.productImagePadding}
                onChange={(event) =>
                  updateShellSettings({
                    productImagePadding: event.target.value,
                    productImageNoPadding: event.target.value.trim() === "0px"
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
                  productImagePadding: event.target.checked ? "0px" : "clamp(22px, 2.4vw, 36px)"
                })
              }
            />
            <span>Disable image padding completely</span>
          </label>
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

      {globalStylesTab === "header" && (
        <div className="builder-global-styles-group">
          <div className="builder-card-title">
            <strong>Header</strong>
            <span>layout + spacing</span>
          </div>

          <label className="builder-check">
            <input
              type="checkbox"
              checked={shellSettings.headerVisible}
              onChange={(event) =>
                updateShellSettings({
                  headerVisible: event.target.checked,
                })
              }
            />
            <span>Show website header</span>
          </label>

          <div className="builder-card-title">
            <strong>Top Toolbar</strong>
            <span>message + meta</span>
          </div>

          <label className="builder-check">
            <input
              type="checkbox"
              checked={shellSettings.topToolbarVisible}
              onChange={(event) =>
                updateShellSettings({
                  topToolbarVisible: event.target.checked,
                })
              }
            />
            <span>Show top toolbar</span>
          </label>

          <label className="builder-field">
            <span>Toolbar Text</span>
            <input
              type="text"
              value={shellSettings.topToolbarText}
              onChange={(event) =>
                updateShellSettings({
                  topToolbarText: event.target.value,
                })
              }
              placeholder="Fast support & setup by Webpages"
            />
          </label>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Phone / Support</span>
              <input
                type="text"
                value={shellSettings.topToolbarPhone}
                onChange={(event) =>
                  updateShellSettings({
                    topToolbarPhone: event.target.value,
                  })
                }
                placeholder="+374 xx xx xx"
              />
            </label>

            <label className="builder-field">
              <span>Right Meta</span>
              <input
                type="text"
                value={shellSettings.topToolbarMeta}
                onChange={(event) =>
                  updateShellSettings({
                    topToolbarMeta: event.target.value,
                  })
                }
                placeholder="AMD ֏"
              />
            </label>
          </div>

          <label className="builder-field">
            <span>Header Background</span>
            <select
              value={shellSettings.headerBackgroundMode}
              onChange={(event) =>
                updateShellSettings({
                  headerBackgroundMode: event.target
                    .value as BuilderHeaderBackgroundMode,
                })
              }
            >
              <option value="default">Default Solid</option>
              <option value="glass">Glassmorphism (Blur)</option>
              <option value="accent">Accent Color Gradient</option>
              <option value="none">Transparent Overlay</option>
            </select>
          </label>

          <label className="builder-field">
            <span>Header Text Mode</span>
            <select
              value={shellSettings.headerTextMode || "auto"}
              onChange={(event) =>
                updateShellSettings({
                  headerTextMode: event.target.value as BuilderHeaderTextMode,
                })
              }
            >
              <option value="auto">Auto</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>

          <div className="builder-field">
            <span>Header Style & Layout</span>
            <div className="builder-header-presets-grid">
              <button
                type="button"
                className={`builder-preset-btn ${shellSettings.headerLayout === "princity" ? "is-active" : ""}`}
                onClick={() => applyHeaderPreset("service")}
              >
                <span>Princity Service</span>
                <small>Flat layout, text logo</small>
              </button>
              <button
                type="button"
                className={`builder-preset-btn ${shellSettings.headerLayout === "pill" ? "is-active" : ""}`}
                onClick={() => applyHeaderPreset("commerce")}
              >
                <span>Commerce Pill</span>
                <small>Floating pill on scroll</small>
              </button>
              <button
                type="button"
                className={`builder-preset-btn ${shellSettings.headerLayout === "two-row" ? "is-active" : ""}`}
                onClick={() => applyHeaderPreset("classic")}
              >
                <span>Classic Store</span>
                <small>Traditional two-row links</small>
              </button>
              <button
                type="button"
                className={`builder-preset-btn ${shellSettings.headerLayout === "simple" ? "is-active" : ""}`}
                onClick={() => applyHeaderPreset("simple")}
              >
                <span>Simple Store</span>
                <small>Single row layout</small>
              </button>
              <button
                type="button"
                className={`builder-preset-btn ${shellSettings.headerLayout === "hero" ? "is-active" : ""}`}
                onClick={() => applyHeaderPreset("hero")}
              >
                <span>Hero Spotlight</span>
                <small>Split layout with hero banner</small>
              </button>
            </div>
          </div>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Brand Display</span>
              <select
                value={shellSettings.headerBrandMode}
                onChange={(event) =>
                  updateShellSettings({
                    headerBrandMode: event.target
                      .value as BuilderHeaderBrandMode,
                  })
                }
              >
                <option value="logo">Logo only</option>
                <option value="brand">Text brand</option>
                <option value="both">Logo + text</option>
              </select>
            </label>

            <label className="builder-field">
              <span>Logo Width</span>
              <input
                type="number"
                min="40"
                max="360"
                value={shellSettings.headerLogoMaxWidth}
                onChange={(event) =>
                  updateShellSettings({
                    headerLogoMaxWidth: Number(event.target.value),
                  })
                }
              />
            </label>
          </div>

          <label className="builder-field">
            <span>Brand Text</span>
            <input
              type="text"
              value={shellSettings.headerBrandText}
              onChange={(event) =>
                updateShellSettings({
                  headerBrandText: event.target.value,
                })
              }
              placeholder="WebPages"
            />
          </label>

          <div className="builder-field">
            <span>Logo Image</span>
            <div className="builder-header-logo-picker">
              <div className="builder-header-logo-preview">
                {shellSettings.headerLogoUrl ? (
                  <Image
                    src={shellSettings.headerLogoUrl ?? ""}
                    alt={
                      shellSettings.headerLogoAlt ||
                      shellSettings.headerBrandText ||
                      "Site logo"
                    }
                    width={120}
                    height={72}
                    unoptimized
                  />
                ) : (
                  <ImageIcon size={20} />
                )}
              </div>
              <div className="builder-header-logo-actions">
                <button
                  type="button"
                  onClick={() =>
                    openWordPressMediaPicker({
                      title: "Header Logo",
                      currentUrl: shellSettings.headerLogoUrl ?? "",
                      onSelect: (media) =>
                        updateShellSettings({
                          headerLogoUrl: media.sourceUrl,
                          headerLogoAlt:
                            shellSettings.headerLogoAlt ||
                            media.altText ||
                            media.title ||
                            "Site logo",
                        }),
                    })
                  }
                >
                  <GalleryHorizontal size={14} />
                  Choose from library
                </button>
                {shellSettings.headerLogoUrl ? (
                  <button
                    type="button"
                    className="is-muted"
                    onClick={() => updateShellSettings({ headerLogoUrl: null })}
                  >
                    Clear
                  </button>
                ) : null}
                <small>
                  {shellSettings.headerLogoUrl
                    ? "Logo selected from WordPress media."
                    : "Select an image from WordPress media."}
                </small>
              </div>
            </div>
          </div>

          <label className="builder-field">
            <span>Logo Alt Text</span>
            <input
              type="text"
              value={shellSettings.headerLogoAlt}
              onChange={(event) =>
                updateShellSettings({
                  headerLogoAlt: event.target.value,
                })
              }
              placeholder="Site logo"
            />
          </label>

          <div className="builder-two-column">
            <label className="builder-field">
              <span>Icon Style</span>
              <select
                value={shellSettings.headerIconVariant}
                onChange={(event) =>
                  updateShellSettings({
                    headerIconVariant: event.target
                      .value as BuilderHeaderIconVariant,
                  })
                }
              >
                <option value="muted">Muted</option>
                <option value="ghost">Ghost</option>
                <option value="solid">Solid</option>
                <option value="icon">Icon only</option>
              </select>
            </label>

            <label className="builder-field">
              <span>Active Indicator</span>
              <select
                value={shellSettings.headerActiveIndicator}
                onChange={(event) =>
                  updateShellSettings({
                    headerActiveIndicator: event.target
                      .value as BuilderHeaderActiveIndicator,
                  })
                }
              >
                <option value="princity">Princity motion</option>
                <option value="underline">Underline</option>
                <option value="none">None</option>
              </select>
            </label>
          </div>

          <div className="builder-field">
            <span>Header Icons</span>
            <div className="builder-header-icon-grid">
              {headerIconOptions.map((option) => (
                <label key={option.id}>
                  <input
                    type="checkbox"
                    checked={shellSettings.headerIconOrder.includes(option.id)}
                    onChange={(event) =>
                      updateHeaderIcon(option.id, event.target.checked)
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const sidebarTopActions = (
    <div className="builder-sidebar-top-action-bar" aria-label="Builder page actions">
      <div className="builder-sidebar-top-action-copy">
        <strong>
          {sidebarTab === "globalStyles"
            ? "Global Styles"
            : hasPendingChanges
              ? "Unsaved changes"
              : "Saved draft"}
        </strong>
        <span>
          {sidebarTab === "globalStyles"
            ? shellStatus
            : hasPendingChanges
              ? getLayoutLabel(builderState.page, customPages)
              : publishStatus}
        </span>
      </div>
      <div className="builder-sidebar-top-action-buttons">
        <div className="builder-device-toggle" aria-label="Preview device">
          {(["desktop", "tablet", "mobile"] as PreviewDevice[]).map((item) => (
            <button
              key={item}
              type="button"
              className={device === item ? "is-active" : ""}
              onClick={() => setDevice(item)}
              title={`${item} preview`}
            >
              <MonitorSmartphone size={15} />
            </button>
          ))}
        </div>
        <button
          type="button"
          className="builder-sidebar-collapse-inline"
          onClick={() => setSidebarCollapsed((value) => !value)}
          title={sidebarCollapsed ? "Open panel" : "Collapse panel"}
          aria-label={sidebarCollapsed ? "Open panel" : "Collapse panel"}
        >
          {sidebarCollapsed ? (
            <PanelRightOpen size={15} />
          ) : (
            <PanelRightClose size={15} />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            window.open(currentFrontendUrl, "_blank", "noopener,noreferrer");
          }}
          title="Open page"
        >
          <ExternalLink size={15} />
          View Page
        </button>
        {sidebarTab === "globalStyles" ? (
          <button
            type="button"
            className="is-primary"
            onClick={publishShellSettings}
            title="Publish Global Settings"
          >
            <CloudUpload size={15} />
            Publish Settings
          </button>
        ) : (
          hasPendingChanges && (
            <>
              <button type="button" onClick={undoBuilder} title="Undo last change">
                <Undo2 size={15} />
                Undo
              </button>
              <button type="button" onClick={redoBuilder} title="Redo last change">
                <Redo2 size={15} />
              </button>
              <button type="button" className="is-primary" onClick={publishLayout}>
                <CloudUpload size={15} />
                Publish
              </button>
            </>
          )
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`builder-dashboard ${inspectorOpen ? "" : "is-inspector-closed"}${
        sidebarCollapsed ? " is-sidebar-collapsed" : ""
      }${sidebarResizing ? " is-sidebar-resizing" : ""} builder-preview-scheme-${
        builderState.design.colorScheme ?? "auto"
      }`}
      style={
        {
          "--builder-dashboard-bg":
            builderState.design.pageBackground ?? "#dfdfd7",
          "--builder-preview-real-bg": previewPageBackground,
          "--builder-sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <DashboardSidebar
        availableLayoutBlockKinds={availableLayoutBlockKinds}
        builderState={builderState}
        customPages={customPages}
        onReorderCustomPages={handleReorderCustomPages}
        publishedKeys={publishedKeys}
        globalStylesSlot={globalStylesPanel}
        newPageTitle={newPageTitle}
        inspectorSlot={inspectorPanel}
        inspectorOpen={inspectorOpen}
        inspectorOpenKey={inspectorOpenKey}
        pageStatus={pageStatus}
        selectedSectionTitle={selectedSection?.title || selectedSection?.kind || null}
        selectedElementLabel={
          selectedLayoutBlock
            ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
            : null
        }
        savedTemplates={savedTemplates}
        renameTemplateRequest={renameTemplateRequest}
        sidebarTab={sidebarTab}
        templateDescriptions={templateDescriptions}
        templateLabels={templateLabels}
        templateStatus={templateStatus}
        topActionsSlot={sidebarTopActions}
        onAddElementFromLibrary={addElementFromLibrary}
        onCreateBuilderPage={createBuilderPage}
        onDeleteBuilderPage={deleteBuilderPage}
        onDeleteSavedTemplate={deleteSavedTemplate}
        onRenderLayoutBlockIcon={getLayoutBlockLibraryIcon}
        onSaveCurrentPageAsTemplate={saveCurrentPageAsTemplate}
        onSaveSelectedSectionAsTemplate={saveSelectedSectionAsTemplate}
        onSaveSelectedElementAsTemplate={saveSelectedElementAsTemplate}
        onApplySavedTemplate={applySavedTemplate}
        onRenameSavedTemplate={renameSavedTemplate}
        onSetNewPageTitle={setNewPageTitle}
        onSetSidebarTab={setSidebarTab}
        onOpenInspector={openInspectorPanel}
        onStartSidebarResize={startSidebarResize}
        onSwitchBuilderTarget={switchBuilderTarget}
        openElementsPanelKey={panelForceToggler}
        shellSettings={shellSettings}
        onUpdateShellSettings={updateShellSettings}
      />

      {sidebarCollapsed && (
        <button
          type="button"
          className="builder-sidebar-open-toggle builder-icon-button"
          onClick={() => {
            openInspectorPanel();
          }}
          aria-label="Open inspector"
          title="Open inspector"
        >
          <PanelRightOpen size={16} />
        </button>
      )}

      <main className="builder-workspace">
        {false && (
          <section className="builder-global-styles builder-panel">
            <div className="builder-global-styles-grid">
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
                        event.target.value as NonNullable<
                          BuilderDesign["preset"]
                        >,
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
              </div>

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
                    <option value='"Times New Roman", serif'>
                      Times serif
                    </option>
                    <option value='"Courier New", monospace'>Monospace</option>
                  </select>
                </label>

                <label className="builder-field">
                  <span>Heading Size</span>
                  <select
                    value={
                      builderState.design.headingSize ??
                      "clamp(42px, 8vw, 126px)"
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

              <div className="builder-global-styles-group">
                <div className="builder-card-title">
                  <strong>Global Layout</strong>
                  <span>header + spacing</span>
                </div>

                <label className="builder-check">
                  <input
                    type="checkbox"
                    checked={shellSettings.headerVisible}
                    onChange={(event) =>
                      updateShellSettings({
                        headerVisible: event.target.checked,
                      })
                    }
                  />
                  <span>Show website header</span>
                </label>

                <div className="builder-card-title">
                  <strong>Top Toolbar</strong>
                  <span>message + meta</span>
                </div>

                <label className="builder-check">
                  <input
                    type="checkbox"
                    checked={shellSettings.topToolbarVisible}
                    onChange={(event) =>
                      updateShellSettings({
                        topToolbarVisible: event.target.checked,
                      })
                    }
                  />
                  <span>Show top toolbar</span>
                </label>

                <label className="builder-field">
                  <span>Toolbar Text</span>
                  <input
                    type="text"
                    value={shellSettings.topToolbarText}
                    onChange={(event) =>
                      updateShellSettings({
                        topToolbarText: event.target.value,
                      })
                    }
                    placeholder="Fast support & setup by Webpages"
                  />
                </label>

                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Phone / Support</span>
                    <input
                      type="text"
                      value={shellSettings.topToolbarPhone}
                      onChange={(event) =>
                        updateShellSettings({
                          topToolbarPhone: event.target.value,
                        })
                      }
                      placeholder="+374 xx xx xx"
                    />
                  </label>

                  <label className="builder-field">
                    <span>Right Meta</span>
                    <input
                      type="text"
                      value={shellSettings.topToolbarMeta}
                      onChange={(event) =>
                        updateShellSettings({
                          topToolbarMeta: event.target.value,
                        })
                      }
                      placeholder="AMD ֏"
                    />
                  </label>
                </div>

                <label className="builder-field">
                  <span>Header Background</span>
                  <select
                    value={shellSettings.headerBackgroundMode}
                    onChange={(event) =>
                      updateShellSettings({
                        headerBackgroundMode: event.target
                          .value as BuilderHeaderBackgroundMode,
                      })
                    }
                  >
                    <option value="default">Default Solid</option>
                    <option value="glass">Glassmorphism (Blur)</option>
                    <option value="accent">Accent Color Gradient</option>
                    <option value="none">Transparent Overlay</option>
                  </select>
                </label>

                <label className="builder-field">
                  <span>Header Text Mode</span>
                  <select
                    value={shellSettings.headerTextMode || "auto"}
                    onChange={(event) =>
                      updateShellSettings({
                        headerTextMode: event.target.value as BuilderHeaderTextMode,
                      })
                    }
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>

                <div className="builder-field">
                  <span>Header Style & Layout</span>
                  <div className="builder-header-presets-grid">
                    <button
                      type="button"
                      className={`builder-preset-btn ${shellSettings.headerLayout === "princity" ? "is-active" : ""}`}
                      onClick={() => applyHeaderPreset("service")}
                    >
                      <span>Princity Service</span>
                      <small>Flat layout, text logo</small>
                    </button>
                    <button
                      type="button"
                      className={`builder-preset-btn ${shellSettings.headerLayout === "pill" ? "is-active" : ""}`}
                      onClick={() => applyHeaderPreset("commerce")}
                    >
                      <span>Commerce Pill</span>
                      <small>Floating pill on scroll</small>
                    </button>
                    <button
                      type="button"
                      className={`builder-preset-btn ${shellSettings.headerLayout === "two-row" ? "is-active" : ""}`}
                      onClick={() => applyHeaderPreset("classic")}
                    >
                      <span>Classic Store</span>
                      <small>Traditional two-row links</small>
                    </button>
                    <button
                      type="button"
                      className={`builder-preset-btn ${shellSettings.headerLayout === "simple" ? "is-active" : ""}`}
                      onClick={() => applyHeaderPreset("simple")}
                    >
                      <span>Simple Store</span>
                      <small>Single row layout</small>
                    </button>
                    <button
                      type="button"
                      className={`builder-preset-btn ${shellSettings.headerLayout === "hero" ? "is-active" : ""}`}
                      onClick={() => applyHeaderPreset("hero")}
                    >
                      <span>Hero Spotlight</span>
                      <small>Split layout with hero banner</small>
                    </button>
                  </div>
                </div>

                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Brand Display</span>
                    <select
                      value={shellSettings.headerBrandMode}
                      onChange={(event) =>
                        updateShellSettings({
                          headerBrandMode: event.target
                            .value as BuilderHeaderBrandMode,
                        })
                      }
                    >
                      <option value="logo">Logo only</option>
                      <option value="brand">Text brand</option>
                      <option value="both">Logo + text</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Logo Width</span>
                    <input
                      type="number"
                      min="40"
                      max="360"
                      value={shellSettings.headerLogoMaxWidth}
                      onChange={(event) =>
                        updateShellSettings({
                          headerLogoMaxWidth: Number(event.target.value),
                        })
                      }
                    />
                  </label>
                </div>

                <label className="builder-field">
                  <span>Brand Text</span>
                  <input
                    type="text"
                    value={shellSettings.headerBrandText}
                    onChange={(event) =>
                      updateShellSettings({
                        headerBrandText: event.target.value,
                      })
                    }
                    placeholder="WebPages"
                  />
                </label>

                <div className="builder-field">
                  <span>Logo Image</span>
                  <div className="builder-header-logo-picker">
                    <div className="builder-header-logo-preview">
                      {shellSettings.headerLogoUrl ? (
                        <Image
                          src={shellSettings.headerLogoUrl ?? ""}
                          alt={
                            shellSettings.headerLogoAlt ||
                            shellSettings.headerBrandText ||
                            "Site logo"
                          }
                          width={120}
                          height={72}
                          unoptimized
                        />
                      ) : (
                        <ImageIcon size={20} />
                      )}
                    </div>
                    <div className="builder-header-logo-actions">
                      <button
                        type="button"
                        onClick={() =>
                          openWordPressMediaPicker({
                            title: "Header Logo",
                            currentUrl: shellSettings.headerLogoUrl ?? "",
                            onSelect: (media) =>
                              updateShellSettings({
                                headerLogoUrl: media.sourceUrl,
                                headerLogoAlt:
                                  shellSettings.headerLogoAlt ||
                                  media.altText ||
                                  media.title ||
                                  "Site logo",
                              }),
                          })
                        }
                      >
                        <GalleryHorizontal size={14} />
                        Choose from library
                      </button>
                      {shellSettings.headerLogoUrl ? (
                        <button
                          type="button"
                          className="is-muted"
                          onClick={() =>
                            updateShellSettings({ headerLogoUrl: null })
                          }
                        >
                          Clear
                        </button>
                      ) : null}
                      <small>
                        {shellSettings.headerLogoUrl
                          ? "Logo selected from WordPress media."
                          : "Select an image from WordPress media."}
                      </small>
                    </div>
                  </div>
                </div>

                <label className="builder-field">
                  <span>Logo Alt Text</span>
                  <input
                    type="text"
                    value={shellSettings.headerLogoAlt}
                    onChange={(event) =>
                      updateShellSettings({
                        headerLogoAlt: event.target.value,
                      })
                    }
                    placeholder="Site logo"
                  />
                </label>

                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Icon Style</span>
                    <select
                      value={shellSettings.headerIconVariant}
                      onChange={(event) =>
                        updateShellSettings({
                          headerIconVariant: event.target
                            .value as BuilderHeaderIconVariant,
                        })
                      }
                    >
                      <option value="muted">Muted</option>
                      <option value="ghost">Ghost</option>
                      <option value="solid">Solid</option>
                      <option value="icon">Icon only</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Active Indicator</span>
                    <select
                      value={shellSettings.headerActiveIndicator}
                      onChange={(event) =>
                        updateShellSettings({
                          headerActiveIndicator: event.target
                            .value as BuilderHeaderActiveIndicator,
                        })
                      }
                    >
                      <option value="princity">Princity motion</option>
                      <option value="underline">Underline</option>
                      <option value="none">None</option>
                    </select>
                  </label>

                  <div className="builder-field">
                    <span>Header Icons</span>
                    <div className="builder-header-icon-grid">
                      {headerIconOptions.map((option) => (
                        <label key={option.id}>
                          <input
                            type="checkbox"
                            checked={shellSettings.headerIconOrder.includes(
                              option.id,
                            )}
                            onChange={(event) =>
                              updateHeaderIcon(
                                option.id,
                                event.target.checked,
                              )
                            }
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}
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
            <strong>Layout published.</strong>
            <small>Looking beautiful.</small>
          </div>
        )}

        <div
          ref={previewShellRef}
          className={`builder-preview-shell builder-preview-${device} builder-preview-scheme-${
            builderState.design.colorScheme ?? "auto"
          }${spacingOverlayEnabled ? " is-spacing-overlay-enabled" : ""}`}
          style={
            {
              "--builder-preview-shell-bg": previewPageBackground,
              "--builder-preview-scale": previewScale,
              "--builder-preview-canvas-width": `${previewCanvasWidth}px`,
            } as CSSProperties
          }
        >
          <div
            ref={previewHeaderSlotRef}
            className="builder-preview-header-slot"
          />
          <ProductCategoryFilterProvider key={builderState.page}>
          <PreviewCanvas
            sections={builderState.sections}
            page={builderState.page}
            previewProducts={previewProducts}
            previewCategoryTree={previewCategoryTree}
            previewCategoryCounts={previewCategoryCounts}
            pageLabel={getLayoutLabel(builderState.page, customPages)}
            design={builderState.design}
            shellSettings={shellSettings}
            spacingOverlayEnabled={spacingOverlayEnabled}
            selectedId={selectedId}
            selectedLayoutColumnKey={selectedLayoutColumnKey}
            selectedLayoutRowIndex={selectedLayoutRowIndex}
            selectedLayoutBlockKey={selectedLayoutBlockKey}
            draggingSectionId={draggingSectionId}
            draggingLayoutBlockKey={draggingLayoutBlockKey}
            onSelect={selectSection}
            onSelectColumn={selectLayoutColumn}
            onSelectRow={selectLayoutRow}
            onSelectBlock={selectLayoutBlock}
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
            onUploadGridItemImage={uploadGridItemImage}
            onAddWireframe={addWireframeNear}
            onAddRow={addRowNear}
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
          />
          </ProductCategoryFilterProvider>
        </div>
      </main>

      <WordPressMediaPicker
        open={mediaPickerOpen}
        title={mediaPickerTitle}
        currentUrl={mediaPickerCurrentUrl}
        search={mediaSearch}
        items={mediaItems}
        loading={mediaLoading}
        status={mediaStatus}
        page={mediaPage}
        totalItems={mediaTotalItems}
        totalPages={mediaTotalPages}
        rangeStart={mediaRangeStart}
        rangeEnd={mediaRangeEnd}
        onPageChange={goToMediaPage}
        onSearchChange={handleMediaSearchChange}
        onSelect={selectWordPressMedia}
        onClose={closeWordPressMediaPicker}
      />

    </div>
  );
}

function WordPressMediaPicker({
  open,
  title,
  currentUrl,
  search,
  items,
  loading,
  status,
  page,
  totalItems,
  totalPages,
  rangeStart,
  rangeEnd,
  onSearchChange,
  onPageChange,
  onSelect,
  onClose,
}: {
  open: boolean;
  title: string;
  currentUrl: string;
  search: string;
  items: WordPressMediaItem[];
  loading: boolean;
  status: string;
  page: number;
  totalItems: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onSelect: (media: WordPressMediaItem) => void;
  onClose: () => void;
}) {
  const [pasting, setPasting] = useState(false);
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);
  const pasteZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      setPasting(false);
      setPasteStatus(null);
    }
  }, [open]);

  const handlePaste = useCallback(async (event: React.ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    let imageFile: File | null = null;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const blob = item.getAsFile();
        if (blob) {
          const ext = blob.type.split("/")[1] || "png";
          imageFile = new File([blob], `pasted-image.${ext}`, { type: blob.type });
          break;
        }
      }
    }

    if (!imageFile) {
      setPasteStatus("No image found in clipboard");
      return;
    }

    setPasting(true);
    setPasteStatus("Uploading pasted image...");

    try {
      const formData = new FormData();
      formData.append("file", imageFile);

      const response = await fetch("/api/builder-uploads", {
        method: "POST",
        body: formData,
      });
      const payload = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !payload.url) {
        setPasteStatus(payload.error ?? "Upload failed");
        return;
      }

      onSelect({
        id: Date.now(),
        title: imageFile.name,
        altText: "Pasted from clipboard",
        sourceUrl: payload.url,
        thumbnailUrl: payload.url,
        mimeType: imageFile.type,
      });
    } catch {
      setPasteStatus("Upload failed");
    } finally {
      setPasting(false);
    }
  }, [onSelect]);

  useEffect(() => {
    const handleGlobalPaste = (event: ClipboardEvent) => {
      if (!open) return;
      if (pasteZoneRef.current?.contains(event.target as Node)) return;
      const items = event.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) return;
      }
    };
    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [open]);

  if (!open) return null;

  return (
    <div className="builder-media-modal" role="dialog" aria-modal="true">
      <div className="builder-media-dialog builder-panel">
        <div className="builder-media-header">
          <div>
            <strong>{title}</strong>
            <span>{status}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close media library"
          >
            <X size={16} />
          </button>
        </div>

        <div className="builder-media-search">
          <input
            value={search}
            placeholder="Search WordPress media"
            onChange={(event) => onSearchChange(event.target.value)}
          />
          {loading && <span>Loading...</span>}
        </div>

        <div
          ref={pasteZoneRef}
          className={`builder-media-paste-zone ${pasting ? "is-pasting" : ""}`}
          tabIndex={0}
          onPaste={handlePaste}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(13,115,255,0.5)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "";
          }}
        >
          <CloudUpload size={20} />
          <span>
            {pasteStatus ??
              "Paste an image from clipboard (Ctrl+V / Cmd+V)"}
          </span>
        </div>

        <div className="builder-media-grid">
          {items.map((item) => {
            const isSelected = currentUrl === item.sourceUrl;
            return (
              <button
                key={item.id}
                type="button"
                className={isSelected ? "is-selected" : ""}
                onClick={() => onSelect(item)}
              >
                <span className="builder-media-thumb">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.altText || item.title}
                      width={240}
                      height={180}
                      unoptimized
                    />
                  ) : (
                    <ImageIcon size={22} />
                  )}
                </span>
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        <div className="builder-media-footer">
          <button
            type="button"
            className="builder-secondary-button"
            onClick={() => onPageChange(page - 1)}
            disabled={loading || page <= 1}
          >
            Previous
          </button>
          <div className="builder-media-page-indicator">
            <strong>
              Showing {rangeStart}-{rangeEnd} of {totalItems}
            </strong>
            <span>
              Page {page} of {Math.max(totalPages, 1)}
            </span>
          </div>
          <button
            type="button"
            className="builder-secondary-button"
            onClick={() => onPageChange(page + 1)}
            disabled={loading || page >= totalPages}
          >
            Next
          </button>
        </div>

        {!loading && items.length === 0 && (
          <div className="builder-media-empty">
            <ImageIcon size={22} />
            <strong>No images found</strong>
            <span>
              Try another search or check that WordPress media is public.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewCanvas({
  sections,
  page,
  previewProducts,
  previewCategoryTree,
  previewCategoryCounts,
  pageLabel,
  design,
  shellSettings,
  spacingOverlayEnabled,
  selectedId,
  selectedLayoutColumnKey,
  selectedLayoutRowIndex,
  selectedLayoutBlockKey,
  draggingSectionId,
  draggingLayoutBlockKey,
  onSelect,
  onSelectColumn,
  onSelectRow,
  onSelectBlock,
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
  onAddWireframe,
  onAddRow,
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
}: {

  sections: BuilderSection[];
  page: BuilderLayoutKey;
  previewProducts: ProductNode[];
  previewCategoryTree: CategoryTreeItem[];
  previewCategoryCounts: Record<string, number>;
  pageLabel: string;
  design: BuilderDesign;
  shellSettings: BuilderShellSettings;
  spacingOverlayEnabled: boolean;
  selectedId: string;
  selectedLayoutColumnKey: string | null;
  selectedLayoutRowIndex: number | null;
  selectedLayoutBlockKey: string | null;
  draggingSectionId: string | null;
  draggingLayoutBlockKey: string | null;
  onSelect: (id: string) => void;
  onSelectColumn: (sectionId: string, columnKey: string) => void;
  onSelectRow: (sectionId: string, rowIndex: number) => void;
  onSelectBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
  ) => void;
  onDragStart: (sectionId: string) => void;
  onDragEnd: () => void;
  onReorder: (sourceId: string, targetId: string) => void;
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
    file: File | null,
  ) => void;
  onAddWireframe: (
    columns: number,
    rows: number,
    targetSectionId: string,
    placement: "above" | "below",
    presetKey?: string,
  ) => void;
  onAddRow: (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => void;
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
    rowIndex: number,
    placement: "before" | "after",
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
  onDeleteSectionBadge: (
    sectionId: string,
    badgeIndex: number,
  ) => void;
  onDuplicateSectionBadge: (
    sectionId: string,
    badgeIndex: number,
  ) => void;
  onMoveSectionBadge: (
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onCycleSectionSpacing?: (
    sectionId: string,
    field: "topSpacing" | "bottomSpacing" | "topMargin" | "bottomMargin",
  ) => void;
}) {
  const { theme } = useTheme();
  const layoutScheme =
    design.colorScheme === "dark" ||
    (design.colorScheme === "auto" && theme === "dark")
      ? "dark"
      : "light";

  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [hoveredColumnKey, setHoveredColumnKey] = useState<string | null>(null);
  const [hoveredBlockKey, setHoveredBlockKey] = useState<string | null>(null);
  const [sectionDragOverId, setSectionDragOverId] = useState<string | null>(null);
  const [templateDragType, setTemplateDragType] =
    useState<BuilderTemplateDragType | null>(null);
  const sectionDragClearTimer = useRef<number | null>(null);
  const [insertTarget, setInsertTarget] = useState<{
    sectionId: string | null;
    placement: "above" | "below";
  } | null>(null);
  const visibleSections = sections.filter((section) => section.visible);
  const animationSignature = visibleSections
    .map((section) => {
      const sectionAnimation = JSON.stringify(section.animation ?? {});
      const blockAnimations = (section.layoutItems ?? [])
        .flatMap((item) => item.blocks ?? [])
        .map((block) => JSON.stringify(block.animation ?? {}))
        .join("|");
      return `${section.id}:${sectionAnimation}:${blockAnimations}`;
    })
    .join("||");
  const insertTargetSection =
    sections.find((section) => section.id === insertTarget?.sectionId) ?? null;
  const insertLayoutPicker = insertTarget ? (
    <div
      className="builder-layout-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="builder-layout-picker-title"
      onClick={() => setInsertTarget(null)}
    >
      <div
        className="builder-layout-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="builder-layout-header">
          <div>
            <strong id="builder-layout-picker-title">
              Choose row layout
            </strong>
            <span>
              {insertTargetSection
                ? `Insert a section ${insertTarget.placement} ${sectionLabels[
                    insertTargetSection.kind
                  ].toLowerCase()} and pick a preset layout.`
                : "Choose a preset layout for the first section on this page."}
            </span>
          </div>
          <button
            type="button"
            className="builder-layout-close"
            onClick={() => setInsertTarget(null)}
            aria-label="Close row layout picker"
          >
            <X size={15} />
          </button>
        </div>

        <div className="builder-layout-picker-grid">
          {builderRowLayoutPresets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className="builder-layout-picker-card"
              onClick={() => {
                onAddWireframe(
                  preset.ratios.length,
                  1,
                  insertTarget.sectionId ?? "__empty-page__",
                  insertTarget.placement,
                  preset.key,
                );
                setInsertTarget(null);
              }}
            >
              <span className="builder-layout-picker-card-copy">
                <strong>{preset.label}</strong>
                <small>{preset.description}</small>
              </span>
              <span
                className="builder-layout-picker-preview"
                aria-hidden="true"
              >
                {preset.ratios.map((ratio, index) => (
                  <i key={`${preset.key}-${index}`} style={{ flex: ratio }} />
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return (
    <div
      className={`builder-preview-canvas${
        templateDragType ? ` is-dragging-template-${templateDragType}` : ""
      }`}
      style={
        {
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
        } as CSSProperties
      }
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
      }}
      onDrop={() => setTemplateDragType(null)}
    >
      {visibleSections.length === 0 && (
        <div className="builder-preview-empty">
          <Layers3 size={22} />
          <strong>No visible sections</strong>
          <small>Use the section list or turn a hidden section back on.</small>
          <button
            type="button"
            className="builder-preview-empty-add"
            onClick={onOpenElementsPanel}
          >
            <Plus size={16} />
            Add section
          </button>
        </div>
      )}

      <div
        className={`shop-builder-main shop-builder-main--scheme-${
          design.colorScheme ?? "auto"
        } builder-preview-page`}
        style={previewDesignStyle(design)}
        data-builder-page-root
        data-gsap-home={page === "home" ? true : undefined}
      >
        <BuilderScrollAnimations key={animationSignature} />
        <div
          className="shop-builder-inner builder-preview-inner"
          aria-label={`${pageLabel} preview`}
        >
          {visibleSections.map((section) => {
            const sourceIndex = sections.findIndex(
              (item) => item.id === section.id,
            );
            const isSelected = selectedId === section.id;
            const isSectionActive = isSelected && selectedLayoutRowIndex === null && selectedLayoutColumnKey === null && selectedLayoutBlockKey === null;
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
            const isSectionAntigravity = section.backgroundEffect === "antigravity";
            const isFullTheme = isSectionAntigravity && (section.antigravityVisualMode === undefined || section.antigravityVisualMode === "full");

            return (
              <div
                id={section.id}
                key={section.id}
                role="button"
                tabIndex={0}
                draggable
                onMouseEnter={() => setHoveredSectionId(section.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
                className={`builder-preview-section ${getStorefrontPreviewClass(
                  section,
                )} builder-preview-${section.kind} builder-preview-section--${
                  section.backgroundMode === "boxed" ? "boxed" : "full"
                } builder-preview-section--content-${
                  section.contentMode ?? "boxed"
                } builder-preview-section--scheme-${resolveSectionColorScheme(section, layoutScheme)} ${
                  isFullTheme ? "shop-builder-section--effect-antigravity" : isAnimatedBg ? "relative overflow-hidden" : ""
                } ${
                  isSelected ? "is-selected" : ""
                } ${
                  hoveredSectionId === section.id ? "is-hovered" : ""
                } ${visualStyleClassName(section.visualStyle)} ${draggingSectionId === section.id ? "is-dragging" : ""} ${sectionDragOverId === section.id ? "is-drag-over" : ""}`}
                style={
                  {
                    background: section.background,
                    "--builder-preview-padding-top": getPreviewSpacing(
                      section.topSpacing,
                    ),
                    "--builder-preview-padding-bottom": getPreviewSpacing(
                      section.bottomSpacing,
                    ),
                    "--builder-section-padding-top": getPreviewSpacing(
                      section.topSpacing,
                    ),
                    "--builder-section-padding-bottom": getPreviewSpacing(
                      section.bottomSpacing,
                    ),
                    "--builder-section-margin-top": getPreviewSectionMargin(
                      section.topMargin,
                    ),
                    "--builder-section-margin-bottom": getPreviewSectionMargin(
                      section.bottomMargin,
                    ),
                    "--builder-radius":
                      section.borderRadius !== undefined
                        ? `${section.borderRadius}px`
                        : undefined,
                    "--builder-card-radius":
                      section.borderRadius !== undefined
                        ? `${section.borderRadius}px`
                        : undefined,
                    ...sectionSchemeStyle(section),
                    ...visualStyleToCss(
                      section.visualStyle as BuilderVisualStyle | undefined,
                    ),
                    ...animationAttrs.style,
                  } as CSSProperties
                }
                {...animationAttrs.data}
                onClick={() => onSelect(section.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(section.id);
                  }
                }}
                onDragStart={(event) => {
                  event.dataTransfer.setData("text/plain", section.id);
                  event.dataTransfer.effectAllowed = "move";
                  onDragStart(section.id);
                }}
                onDragEnter={(event) => {
                  const types = Array.from(event.dataTransfer.types);
                  if (
                    types.includes("text/plain") &&
                    !types.includes("application/x-builder-block") &&
                    !types.includes("application/x-builder-new-block")
                  ) {
                    event.preventDefault();
                    if (sectionDragClearTimer.current !== null) {
                      clearTimeout(sectionDragClearTimer.current);
                      sectionDragClearTimer.current = null;
                    }
                    setSectionDragOverId(section.id);
                  }
                }}
                onDragLeave={() => {
                  sectionDragClearTimer.current = window.setTimeout(() => {
                    sectionDragClearTimer.current = null;
                    setSectionDragOverId(null);
                  }, 50);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  if (sectionDragClearTimer.current !== null) {
                    clearTimeout(sectionDragClearTimer.current);
                    sectionDragClearTimer.current = null;
                  }
                  event.preventDefault();
                  if (event.dataTransfer.getData(BUILDER_TEMPLATE_DND_TYPE)) {
                    setSectionDragOverId(null);
                    onDragEnd();
                    return;
                  }
                  const sourceId = event.dataTransfer.getData("text/plain");
                  if (!sourceId) {
                    setSectionDragOverId(null);
                    onDragEnd();
                    return;
                  }
                  if (sourceId.startsWith("builder-block:")) return;
                  onReorder(sourceId, section.id);
                  onDragEnd();
                  setSectionDragOverId(null);
                }}
                onDragEnd={() => {
                  if (sectionDragClearTimer.current !== null) {
                    clearTimeout(sectionDragClearTimer.current);
                    sectionDragClearTimer.current = null;
                  }
                  setSectionDragOverId(null);
                  onDragEnd();
                }}
                >
                {isSectionActive && (
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
                      interactionScope={section.antigravityInteractionScope as any}
                      visualMode={section.antigravityVisualMode as any}
                      effectType={section.backgroundEffect}
                    />
                    {isSectionAntigravity && section.antigravityShowGrid !== false && (
                      <div
                        className="antigravity-grid-overlay"
                        aria-hidden="true"
                        style={
                          section.antigravityGridMoveSpeed !== undefined || section.antigravityColor
                            ? {
                                animationDuration: section.antigravityGridMoveSpeed === 0
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
                <div
                  className={`builder-preview-section-tools ${
                    isSelected ? "is-selected-tools" : ""
                  }`}
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onDragStart={(event) => event.stopPropagation()}
                >
                  <div className="builder-preview-section-tools-main">
                    <span>{sectionLabels[section.kind]}</span>
                    <button
                      type="button"
                      onClick={() => onSelect(section.id)}
                      aria-label="Open section settings"
                      title="Section settings"
                    >
                      <Settings2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveSectionTemplate(section.id)}
                      title="Save section as template"
                    >
                      <Save size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveSection(section.id, -1)}
                      disabled={sourceIndex <= 0}
                      title="Move section up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveSection(section.id, 1)}
                      disabled={
                        sourceIndex < 0 || sourceIndex >= sections.length - 1
                      }
                      title="Move section down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDuplicateSection(section.id)}
                      title="Duplicate section"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteSection(section.id)}
                      title="Delete section"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div
                  className="builder-preview-section-insert builder-preview-section-insert--top"
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onDragStart={(event) => event.stopPropagation()}
                  onDragOver={(event) => {
                    if (getBuilderTemplateDragType(event.dataTransfer.types) !== "section") return;
                    event.preventDefault();
                    event.stopPropagation();
                    setSectionDragOverId(section.id);
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={(event) => {
                    const templateId = event.dataTransfer.getData(
                      BUILDER_TEMPLATE_DND_TYPE,
                    );
                    if (!templateId) return;
                    event.preventDefault();
                    event.stopPropagation();
                    setSectionDragOverId(null);
                    onDropSectionTemplate(templateId, section.id, "above");
                  }}
                >
                  <button
                    type="button"
                    className="builder-preview-section-insert-trigger"
                    onClick={() =>
                      setInsertTarget({
                        sectionId: section.id,
                        placement: "above",
                      })
                    }
                    aria-label="Add section above"
                    title="Add section above"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div
                  className="builder-preview-section-insert builder-preview-section-insert--bottom"
                  onClick={(event) => event.stopPropagation()}
                  onMouseDown={(event) => event.stopPropagation()}
                  onDragStart={(event) => event.stopPropagation()}
                  onDragOver={(event) => {
                    if (getBuilderTemplateDragType(event.dataTransfer.types) !== "section") return;
                    event.preventDefault();
                    event.stopPropagation();
                    setSectionDragOverId(section.id);
                    event.dataTransfer.dropEffect = "copy";
                  }}
                  onDrop={(event) => {
                    const templateId = event.dataTransfer.getData(
                      BUILDER_TEMPLATE_DND_TYPE,
                    );
                    if (!templateId) return;
                    event.preventDefault();
                    event.stopPropagation();
                    setSectionDragOverId(null);
                    onDropSectionTemplate(templateId, section.id, "below");
                  }}
                >
                  <button
                    type="button"
                    className="builder-preview-section-insert-trigger"
                    onClick={() =>
                      setInsertTarget({
                        sectionId: section.id,
                        placement: "below",
                      })
                    }
                    aria-label="Add section below"
                    title="Add section below"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <PreviewSection
                  section={section}
                  shellSettings={shellSettings}
                  previewProducts={previewProducts}
                  previewCategoryTree={previewCategoryTree}
                  previewCategoryCounts={previewCategoryCounts}
                  selectedLayoutColumnKey={selectedLayoutColumnKey}
                  selectedLayoutRowIndex={selectedLayoutRowIndex}
                  selectedSectionId={selectedId}
                  selectedLayoutBlockKey={selectedLayoutBlockKey}
                  draggingLayoutBlockKey={draggingLayoutBlockKey}
                  onSelectColumn={onSelectColumn}
                  onSelectRow={onSelectRow}
                  onSelectBlock={onSelectBlock}
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
                  onAddRow={onAddRow}
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
                  spacingOverlayEnabled={spacingOverlayEnabled}
                />
              </div>
            );
          })}
        </div>
      </div>
      {insertLayoutPicker ? createPortal(insertLayoutPicker, document.body) : null}
    </div>
  );
}

function previewDesignStyle(design: BuilderDesign) {
  const colors = resolveDesignColors(design);
  return {
    background: colors.pageBackground,
    color: colors.textColor,
    "--builder-page-bg": colors.pageBackground,
    "--builder-preview-text": colors.textColor,
    "--builder-preview-muted": colors.mutedTextColor,
    "--builder-preview-accent": colors.accentColor,
    "--builder-preview-surface": colors.surfaceColor,
    "--builder-preview-button-bg": colors.buttonBackground,
    "--builder-preview-button-text": colors.buttonTextColor,
    "--builder-text": colors.textColor,
    "--builder-muted": colors.mutedTextColor,
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
    "--builder-heading-color": design.headingColor,
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

function GlobalSpacingControl({
  label,
  value,
  context,
  onChange,
}: {
  label: string;
  value: string | undefined;
  context: BuilderSpacingContext;
  onChange: (newValue: any) => void;
}) {
  const presets = ["none", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"] as const;

  const isPresetToken = (val: string) => {
    return (
      val === "none" ||
      val === "xs" ||
      val === "sm" ||
      val === "md" ||
      val === "lg" ||
      val === "xl" ||
      val === "2xl" ||
      val === "3xl" ||
      val === "small" ||
      val === "medium" ||
      val === "large"
    );
  };

  const isPreset = !value || isPresetToken(value);
  const isCustom = !isPreset;

  const numericMatch = value ? value.trim().match(/^(\d+)px$/i) : null;
  const customNumericValue = numericMatch ? numericMatch[1] : "";

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const val = event.target.value;
    if (val === "custom") {
      const defaultToken = getDefaultSpacingToken(context);
      const currentPx = resolveBuilderSpacing(value ?? defaultToken, context).px;
      onChange(`${currentPx > 0 ? currentPx : 32}px`);
    } else {
      onChange(val);
    }
  };

  const handleCustomNumericChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const num = event.target.value.replace(/\D/g, "");
    onChange(num ? `${num}px` : "0px");
  };

  const defaultVal = getDefaultSpacingToken(context);
  let selectValue: string = defaultVal;
  if (isCustom) {
    selectValue = "custom";
  } else if (value) {
    if (value === "small") selectValue = "sm";
    else if (value === "medium") selectValue = "md";
    else if (value === "large") selectValue = "lg";
    else selectValue = value;
  } else {
    selectValue = defaultVal;
  }

  return (
    <label className="builder-field spacing-control-wrapper" style={{ display: "block", marginBottom: "12px" }}>
      <span style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: 500, color: "var(--text-muted)" }}>{label}</span>
      <div className="spacing-control-row" style={{ display: "flex", gap: "8px", alignItems: "center", width: "100%" }}>
        <select
          value={selectValue}
          onChange={handleSelectChange}
          style={{
            flex: 1,
            height: "36px",
            padding: "0 10px",
            borderRadius: "var(--builder-ui-radius-sm)",
            border: "1px solid var(--builder-ui-border)",
            background: "var(--builder-ui-panel-solid)",
            color: "var(--builder-ui-text)",
            font: "inherit",
          }}
        >
          {presets.map((preset) => {
            const px = BUILDER_SPACING_SCALE[preset];
            const labelName = TOKEN_LABELS[preset];
            return (
              <option key={preset} value={preset}>
                {labelName} ({px}px)
              </option>
            );
          })}
          <option value="custom">Custom...</option>
        </select>
        
        {isCustom && (
          <div className="custom-spacing-input-wrapper" style={{ display: "flex", alignItems: "center", gap: "4px", width: "85px", flexShrink: 0 }}>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={customNumericValue}
              onChange={handleCustomNumericChange}
              style={{
                width: "100%",
                height: "36px",
                padding: "0 10px",
                border: "1px solid var(--builder-ui-border)",
                background: "var(--builder-ui-panel-solid)",
                color: "var(--builder-ui-text)",
                borderRadius: "var(--builder-ui-radius-sm)",
                textAlign: "right",
                font: "inherit",
              }}
              placeholder="0"
            />
            <span style={{ fontSize: "12px", color: "var(--text-muted)", opacity: 0.8 }}>px</span>
          </div>
        )}
      </div>
    </label>
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

  return `shop-builder-section shop-builder-section--${
    section.backgroundMode === "boxed" ? "boxed" : "full"
  } shop-builder-section--content-${section.contentMode ?? "boxed"} shop-builder-section--height-${
    section.sectionHeight ?? "auto"
  } shop-builder-section--align-${
    section.contentVerticalAlign ?? "top"
  } ${kindClass} ${previewAnimationClassName(section.animation)}`.trim();
}

function previewAnimationPreset(
  animation?: BuilderSection["animation"] | BuilderLayoutBlock["animation"],
) {
  const preset = animation?.preset ?? "none";
  return preset === "none" ? null : preset;
}

function previewAnimationClassName(
  animation?: BuilderSection["animation"] | BuilderLayoutBlock["animation"],
) {
  const preset = previewAnimationPreset(animation);
  return preset ? `shop-builder-animate--${preset}` : "";
}

function previewAnimationAttrs(
  animation?: BuilderSection["animation"] | BuilderLayoutBlock["animation"],
) {
  const preset = previewAnimationPreset(animation);

  if (!preset) {
    return {
      data: {},
      style: undefined,
    };
  }

  const delay =
    typeof animation?.delayMs === "number" && Number.isFinite(animation.delayMs)
      ? `${Math.max(0, animation.delayMs)}ms`
      : undefined;
  const progressSmoothing =
    typeof animation?.progressSmoothingMs === "number" &&
    Number.isFinite(animation.progressSmoothingMs)
      ? `${Math.max(0, animation.progressSmoothingMs)}ms`
      : undefined;
  const scrubDistance =
    typeof animation?.scrubDistanceVh === "number" &&
    Number.isFinite(animation.scrubDistanceVh)
      ? `${Math.max(40, animation.scrubDistanceVh)}vh`
      : undefined;
  const stepOffset =
    typeof animation?.stepOffset === "number" &&
    Number.isFinite(animation.stepOffset)
      ? String(animation.stepOffset)
      : undefined;
  const duration =
    typeof animation?.durationMs === "number" &&
    Number.isFinite(animation.durationMs)
      ? `${Math.max(200, animation.durationMs * 1000)}ms`
      : undefined;
  const easing = animation?.easing === "ease-in-out"
    ? "cubic-bezier(0.65, 0, 0.35, 1)"
    : animation?.easing === "spring"
      ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
      : undefined;
  const style = {
    ...(delay ? { "--builder-animate-delay": delay } : {}),
    ...(duration ? { "--builder-animate-duration": duration } : {}),
    ...(easing ? { "--builder-animate-easing": easing } : {}),
    ...(progressSmoothing
      ? { "--builder-progress-smoothing": progressSmoothing }
      : {}),
    ...(scrubDistance ? { "--builder-pin-distance": scrubDistance } : {}),
  } as CSSProperties;

  const playOnce = animation?.once ?? animation?.playOnce ?? true;
  const triggerOffset =
    typeof animation?.triggerOffset === "number" &&
    Number.isFinite(animation.triggerOffset)
      ? String(animation.triggerOffset)
      : undefined;

  return {
    data: {
      "data-builder-animate": preset,
      "data-builder-animate-once": playOnce === false ? "false" : "true",
      "data-builder-pause": animation?.pauseUntilComplete ? "true" : undefined,
      "data-builder-step-offset": stepOffset,
      "data-builder-trigger-offset": triggerOffset,
      "data-builder-progress-direction": animation?.progressDirection === "vertical" ? "vertical" : undefined,
    },
    style: Object.keys(style).length ? style : undefined,
  };
}

function getPreviewLayoutBlocks(
  item: NonNullable<BuilderSection["layoutItems"]>[number],
) {
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
}

type PreviewLayoutItem = NonNullable<BuilderSection["layoutItems"]>[number];



function getPreviewGoodieIcon(iconName: BuilderLayoutBlock["iconName"]) {
  if (iconName === "heart") return <Heart size={24} />;
  if (iconName === "truck") return <Truck size={24} />;
  if (iconName === "shield") return <ShieldCheck size={24} />;
  return <Sparkles size={24} />;
}

function getLayoutBlockLibraryIcon(kind: LayoutBlockKind) {
  const icon = layoutBlockIcons[kind];

  if (icon === "text") return <TextCursorInput size={16} />;
  if (icon === "gallery") return <GalleryHorizontal size={16} />;
  if (icon === "image") return <ImageIcon size={16} />;
  if (icon === "code") return <Code2 size={16} />;
  if (icon === "grid") return <Grid3X3 size={16} />;
  if (icon === "list") return <ListChecks size={16} />;
  if (icon === "calendar") return <CalendarDays size={16} />;
  if (icon === "shoppingBag") return <ShoppingBag size={16} />;
  if (icon === "panel") return <PanelLeft size={16} />;
  if (icon === "navigation") return <Navigation size={16} />;
  if (icon === "pointer") return <SquareMousePointer size={16} />;
  if (icon === "lock") return <LockKeyhole size={16} />;
  if (icon === "user") return <UserRound size={16} />;

  return <Sparkles size={16} />;
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
  value,
  className,
  onChange,
  typography,
  style,
}: {
  as: "span" | "em" | "strong" | "p" | "h2" | "h3";
  value: string;
  className?: string;
  onChange: (value: string) => void;
  typography?: any;
  style?: React.CSSProperties;
}) {
  const tp = typographyProps(typography, inferTypographyArea(Tag, className));
  const isRich = isRichPreviewText(value);
  const EditableTag = (isRich ? getRichTextSafeTag(Tag) : Tag) as any;
  const stopInlineEvent = (event: ReactMouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };
  const handleBlur = (event: ReactFocusEvent<HTMLElement>) => {
    const nextValue = isRich
      ? event.currentTarget.innerHTML.trim()
      : (event.currentTarget.textContent?.trim() ?? "");
    if (nextValue !== value) onChange(nextValue);
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    event.stopPropagation();
    if (event.key === "Enter" && Tag !== "p") {
      event.preventDefault();
      event.currentTarget.blur();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      if (isRich) {
        event.currentTarget.innerHTML = value;
      } else {
        event.currentTarget.textContent = value;
      }
      event.currentTarget.blur();
    }
  };

  return (
    <EditableTag
      className={["builder-inline-editable", className, tp.className]
        .filter(Boolean)
        .join(" ")}
      style={{ ...tp.style, ...style }}
      contentEditable
      suppressContentEditableWarning
      {...(isRich ? { dangerouslySetInnerHTML: { __html: value } } : {})}
      onClick={stopInlineEvent}
      onMouseDown={stopInlineEvent}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {isRich ? null : value}
    </EditableTag>
  );
}

function RowInsertControl({
  placement,
  onClick,
  onTemplateDrop,
}: {
  placement: "after";
  onClick: () => void;
  onTemplateDrop?: (templateId: string) => void;
}) {
  const [templateDragOver, setTemplateDragOver] = useState(false);

  return (
    <div
      className={`builder-preview-row-insert builder-preview-row-insert--${placement}${
        templateDragOver ? " is-template-drag-over" : ""
      }`}
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.stopPropagation()}
      onDragEnter={(event) => {
        if (getBuilderTemplateDragType(event.dataTransfer.types) !== "row") return;
        event.preventDefault();
        event.stopPropagation();
        setTemplateDragOver(true);
      }}
      onDragLeave={() => setTemplateDragOver(false)}
      onDragOver={(event) => {
        if (getBuilderTemplateDragType(event.dataTransfer.types) !== "row") return;
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "copy";
      }}
      onDrop={(event) => {
        const templateId = event.dataTransfer.getData(BUILDER_TEMPLATE_DND_TYPE);
        if (!templateId || !onTemplateDrop) return;
        event.preventDefault();
        event.stopPropagation();
        setTemplateDragOver(false);
        onTemplateDrop(templateId);
      }}
    >
      <button
        type="button"
        className="builder-preview-row-insert-trigger"
        onClick={onClick}
        aria-label={`Add row ${placement}`}
        title={`Add row ${placement}`}
      >
        <Plus size={14} />
        <span>Add Row</span>
      </button>
    </div>
  );
}

function RowLayoutToolbar({
  rowIndex,
  canMoveUp,
  canMoveDown,
  isEmpty,
  onSettings,
  onMoveUp,
  onMoveDown,
  onSave,
  onDuplicate,
  onDelete,
}: {
  rowIndex: number;
  canMoveUp: boolean;
  canMoveDown: boolean;
  isEmpty: boolean;
  onSettings: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSave: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="builder-preview-row-toolbar"
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onDragStart={(event) => event.stopPropagation()}
    >
      <span>Row Layout</span>
      <button
        type="button"
        onClick={onSettings}
        aria-label={`Open row ${rowIndex + 1} settings`}
        title={`Open row ${rowIndex + 1} settings`}
      >
        <Settings2 size={13} />
      </button>
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        aria-label={`Move row ${rowIndex + 1} up`}
        title="Move row up"
      >
        <ArrowUp size={13} />
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        aria-label={`Move row ${rowIndex + 1} down`}
        title="Move row down"
      >
        <ArrowDown size={13} />
      </button>
      <button
        type="button"
        onClick={onSave}
        aria-label={`Save row ${rowIndex + 1} as template`}
        title={`Save row ${rowIndex + 1} as template`}
      >
        <Save size={13} />
      </button>
      <button
        type="button"
        onClick={onDuplicate}
        aria-label={`Duplicate row ${rowIndex + 1}`}
        title={`Duplicate row ${rowIndex + 1}`}
      >
        <Copy size={13} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={!isEmpty}
        aria-label={
          isEmpty
            ? `Delete row ${rowIndex + 1}`
            : `Row ${rowIndex + 1} must be empty before deleting`
        }
        title={isEmpty ? "Delete empty row" : "Delete is available for empty rows"}
      >
        <Trash2 size={13} />
      </button>
    </div>
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
  const topMargin = resolveBuilderSpacing(item.rowTopMargin ?? "inherit", "rowMargin", shellSettings.rowMarginTop);
  const topPadding = resolveBuilderSpacing(item.rowTopSpacing ?? "inherit", "rowPadding", shellSettings.rowPaddingTop);
  const bottomPadding = resolveBuilderSpacing(item.rowBottomSpacing ?? "inherit", "rowPadding", shellSettings.rowPaddingBottom);
  const bottomMargin = resolveBuilderSpacing(item.rowBottomMargin ?? "inherit", "rowMargin", shellSettings.rowMarginBottom);
  const rowGap = rowIndex > 0
    ? resolveBuilderSpacing(undefined, "rowGap", shellSettings.rowGap)
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
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
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
              onClick={onOpenSpacingSettings ? () => onOpenSpacingSettings(marginTopTarget) : undefined}
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
              onClick={onOpenSpacingSettings ? () => onOpenSpacingSettings(paddingTopTarget) : undefined}
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
              onClick={onOpenSpacingSettings ? () => onOpenSpacingSettings(paddingBottomTarget) : undefined}
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
              onClick={onOpenSpacingSettings ? () => onOpenSpacingSettings(marginBottomTarget) : undefined}
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
              ? () => onOpenSpacingSettings(label.target as SpacingInspectorTarget)
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
      field:
        | "topSpacing"
        | "bottomSpacing"
        | "topMargin"
        | "bottomMargin";
    }
  | {
      scope: "row";
      sectionId: string;
      rowIndex: number;
      field?: "rowTopSpacing" | "rowBottomSpacing" | "rowTopMargin" | "rowBottomMargin" | "rowGap";
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
      field?: "elementPadding" | "visualPadding" | "visualMargin" | "elementGap";
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

function dashboardElementBoxStyle(block: BuilderLayoutBlock): CSSProperties {
  const visual = block.visualStyle as BuilderVisualStyle | undefined;
  const style: CSSProperties = {};

  if (!hasBuilderVisualSpacing(visual?.padding)) {
    if (block.elementPadding && block.elementPadding !== "inherit") {
      const padding = resolveBuilderSpacing(
        block.elementPadding,
        "elementPadding",
      ).css;
      style.padding = padding;
    } else {
      style.paddingTop = "var(--builder-global-element-padding-top, 16px)";
      style.paddingRight = "var(--builder-global-element-padding-right, 16px)";
      style.paddingBottom = "var(--builder-global-element-padding-bottom, 16px)";
      style.paddingLeft = "var(--builder-global-element-padding-left, 16px)";
    }
  }

  if (
    !hasBuilderVisualSpacing(visual?.margin) &&
    (!block.gridMargin || block.gridMargin === "inherit")
  ) {
    style.marginTop = "var(--builder-global-element-margin-top, 0px)";
    style.marginRight = "var(--builder-global-element-margin-right, 0px)";
    style.marginBottom = "var(--builder-global-element-margin-bottom, 0px)";
    style.marginLeft = "var(--builder-global-element-margin-left, 0px)";
  }

  return style;
}

function visualSpacingSideValue(
  sides: BuilderVisualStyle["padding"] | BuilderVisualStyle["margin"],
  side: "top" | "right" | "bottom" | "left",
) {
  if (!sides) return undefined;
  const linked = sides.linked !== false;
  if (side === "top") return sides.top;
  if (side === "right") return sides.right ?? (linked ? sides.top : undefined);
  if (side === "bottom") return sides.bottom ?? (linked ? sides.top : undefined);
  return sides.left ?? (linked ? sides.top : sides.right);
}

function visualSpacingMeasurements(
  sides: BuilderVisualStyle["padding"] | BuilderVisualStyle["margin"],
  context: Parameters<typeof resolveBuilderSpacingCssValue>[1],
) {
  const top = resolveLocalSpacingValue(visualSpacingSideValue(sides, "top"), context);
  const right = resolveLocalSpacingValue(visualSpacingSideValue(sides, "right"), context);
  const bottom = resolveLocalSpacingValue(visualSpacingSideValue(sides, "bottom"), context);
  const left = resolveLocalSpacingValue(visualSpacingSideValue(sides, "left"), context);
  return { top, right, bottom, left };
}

function inheritedElementSpacingMeasurements(
  shellSettings: BuilderShellSettings,
  context: "elementPadding" | "elementMargin",
) {
  const prefix = context === "elementPadding" ? "elementPadding" : "elementMargin";
  return {
    top: resolveBuilderSpacing(undefined, context, shellSettings[`${prefix}Top`]),
    right: resolveBuilderSpacing(undefined, context, shellSettings[`${prefix}Right`]),
    bottom: resolveBuilderSpacing(undefined, context, shellSettings[`${prefix}Bottom`]),
    left: resolveBuilderSpacing(undefined, context, shellSettings[`${prefix}Left`]),
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
  const positions = tone === "margin"
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
    spacingLabel(`${prefix}r`, measurements.right, tone, positions.right, target),
    spacingLabel(`${prefix}b`, measurements.bottom, tone, positions.bottom, target),
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
      }
    | undefined,
) {
  const labels: Array<BuilderSpacingOverlayLabel | null> = [];

  if (rowMeta && rowMeta.columnIndex > 0) {
    labels.push(
      spacingLabel(
        "Column Gap",
        resolveBuilderSpacing(undefined, "columnGap"),
        "gap",
        "outside-left",
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
  labels.push(...(
    visualPaddingLabels.length > 0
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
            inheritedElementSpacingMeasurements(shellSettings, "elementPadding"),
            visualPaddingTarget,
          )
  ));
  const visualMarginLabels = boxSpacingSideLabels(
    "m",
    "margin",
    visualSpacingMeasurements(visual?.margin, "elementMargin"),
    visualMarginTarget,
  );
  const legacyMarginIsLocal = Boolean(
    block.gridMargin && block.gridMargin !== "inherit",
  );
  labels.push(...(
    visualMarginLabels.length > 0
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
          )
  ));

  return labels;
}

function PreviewSection({
  section,
  shellSettings,
  previewProducts,
  previewCategoryTree,
  previewCategoryCounts,
  selectedLayoutColumnKey,
  selectedLayoutRowIndex,
  selectedSectionId,
  selectedLayoutBlockKey,
  draggingLayoutBlockKey,
  onSelectColumn,
  onSelectRow,
  onSelectBlock,
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
  onAddRow,
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
  spacingOverlayEnabled,
}: {
  section: BuilderSection;
  shellSettings: BuilderShellSettings;
  previewProducts: ProductNode[];
  previewCategoryTree: CategoryTreeItem[];
  previewCategoryCounts: Record<string, number>;
  selectedLayoutColumnKey: string | null;
  selectedLayoutRowIndex: number | null;
  selectedSectionId: string;
  selectedLayoutBlockKey: string | null;
  draggingLayoutBlockKey: string | null;
  onSelectColumn: (sectionId: string, columnKey: string) => void;
  onSelectRow: (sectionId: string, rowIndex: number) => void;
  onSelectBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
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
    file: File | null,
  ) => void;
  onAddRow: (
    sectionId: string,
    rowIndex: number,
    placement: "before" | "after",
    presetKey: string,
  ) => void;
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
    rowIndex: number,
    placement: "before" | "after",
  ) => void;
  onDropElementTemplate: (payload: {
    templateId: string;
    sectionId: string;
    columnKey: string;
    targetBlockKey?: string;
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
  onDeleteSectionBadge: (
    sectionId: string,
    badgeIndex: number,
  ) => void;
  onDuplicateSectionBadge: (
    sectionId: string,
    badgeIndex: number,
  ) => void;
  onMoveSectionBadge: (
    sectionId: string,
    fromIndex: number,
    toIndex: number,
  ) => void;
  onOpenSpacingSettings: (target: SpacingInspectorTarget) => void;
  onOpenElementsPanel: () => void;
  spacingOverlayEnabled: boolean;
}) {
  const [hoveredColumnKey, setHoveredColumnKey] = useState<string | null>(null);
  const [hoveredBlockKey, setHoveredBlockKey] = useState<string | null>(null);
  const dragClearTimer = useRef<number | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
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
              Choose row layout
            </strong>
            <span>
              Insert a row {rowInsertTarget.placement} the selected row.
            </span>
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

        <div className="builder-layout-picker-grid">
          {rowInsertionPresets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              className="builder-layout-picker-card"
              onClick={() => {
                onAddRow(
                  section.id,
                  rowInsertTarget.rowIndex,
                  rowInsertTarget.placement,
                  preset.key,
                );
                setRowInsertTarget(null);
              }}
            >
              <span className="builder-layout-picker-card-copy">
                <strong>{preset.label}</strong>
                <small>Add row</small>
              </span>
              <span
                className="builder-layout-picker-preview"
                aria-hidden="true"
              >
                {preset.ratios.map((ratio, index) => (
                  <i key={`${preset.key}-${index}`} style={{ flex: ratio }} />
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  if (section.kind === "hero") {
    const isAntigravity = section.carouselSettings?.variant === "antigravity";
    return (
      <div className={`shop-builder-section-content builder-preview-hero-inner ${isAntigravity ? "shop-builder-hero--antigravity" : ""}`}>
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
                typography={section.typography}
                area="title"
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
    const slides = (section.slides ?? []).map((slide, index) => ({
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
    })) satisfies CarouselSlide[];
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
            <BodyText className="shop-builder-body">{section.body?.trim() ? section.body : null}</BodyText>
          </div>
        )}
        <CarouselBlock
          slides={slides}
          settings={section.carouselSettings}
          className="builder-preview-carousel"
        />
      </div>
    );
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
          {section.body && <BodyText className="shop-builder-body">{section.body}</BodyText>}
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
    const items = section.layoutItems?.length
      ? section.layoutItems
      : [
          {
            id: "layout-item-fallback",
            eyebrow: "01",
            title: "Flexible content",
            body: "Choose one, two, or three columns from the dashboard.",
          },
        ];
    const layoutRows = getPreviewLayoutRows(section, items);
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
    layoutRows.forEach((row, rowIndex) => {
      const preset = getBuilderRowLayoutPreset(row.layoutKey);
      const ratios =
        preset?.ratios.length === row.items.length
          ? preset.ratios
          : row.items.map(() => 1);
      const total = ratios.reduce((sum, ratio) => sum + ratio, 0) || 1;
      let usedSpan = 0;

      row.items.forEach((item, columnIndex) => {
        const flatIndex = row.startIndex + columnIndex;
        const columnKey = item.id ?? `layout-item-${flatIndex}`;
        const remainingColumns = row.items.length - columnIndex - 1;
        const span =
          columnIndex === row.items.length - 1
            ? Math.max(1, 12 - usedSpan)
            : Math.min(
                Math.max(1, Math.round((ratios[columnIndex] / total) * 12)),
                12 - usedSpan - remainingColumns,
              );
        usedSpan += span;
        rowMetaByColumnKey.set(columnKey, {
          rowIndex,
          columnIndex,
          isRowStart: columnIndex === 0,
          isRowEnd: columnIndex === row.items.length - 1,
          span,
        });
      });
    });
    return (
      <div className="shop-builder-section-content builder-preview-content-layout">
        {(section.eyebrow || section.title || section.body) && (
          <div className="shop-builder-content-layout-heading">
            {section.eyebrow && (
              <DashboardTypog
                as="p"
                className="shop-builder-eyebrow"
                typography={section.typography}
              >
                {section.eyebrow}
              </DashboardTypog>
            )}
            {section.title && (
              <DashboardTypog
                as="h2"
                className="shop-builder-title"
                typography={section.typography}
              >
                {section.title}
              </DashboardTypog>
            )}
            {section.body && (
              <DashboardTypog
                as="p"
                className="shop-builder-body"
                typography={section.typography}
              >
                {section.body}
              </DashboardTypog>
            )}
          </div>
        )}
        <div
          className="shop-builder-content-layout-grid builder-preview-content-layout-grid"
          style={
            {
              "--builder-preview-layout-columns": section.layoutColumns ?? 2,
              "--builder-layout-columns": section.layoutColumns ?? 2,
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              columnGap: resolveBuilderSpacing(undefined, "columnGap").css,
              rowGap: "var(--builder-global-row-gap, 64px)",
            } as CSSProperties
          }
        >
          {items.map((item, index) => {
            const columnKey = item.id ?? `layout-item-${index}`;
            const rowMeta = rowMetaByColumnKey.get(columnKey);
            const blocks = getPreviewLayoutBlocks(item);
            const cardStyle =
              blocks.find(
                (block) =>
                  block.panelStyle && block.panelStyle !== "default",
              )?.panelStyle ??
              blocks.find((block) => block.cardPreset)?.cardPreset ??
              blocks[0]?.panelStyle ??
              blocks[0]?.cardPreset ??
              "default";

            const hasScrollPinned = blocks.some((b) => b.kind === "scrollPinnedDemo");
            const isColumnActive =
              selectedSectionId === section.id &&
              selectedLayoutColumnKey === columnKey &&
              selectedLayoutBlockKey === null;
            const isRowActive =
              selectedSectionId === section.id &&
              rowMeta !== undefined &&
              selectedLayoutRowIndex === rowMeta.rowIndex &&
              selectedLayoutColumnKey === null &&
              selectedLayoutBlockKey === null;
            const isEmptyRow =
              rowMeta !== undefined &&
              (layoutRows[rowMeta.rowIndex]?.items ?? []).every(
                (rowItem) => (rowItem.blocks ?? []).length === 0,
              );
            const isSelectedRow =
              rowMeta !== undefined &&
              selectedSectionId === section.id &&
              selectedLayoutRowIndex === rowMeta.rowIndex;
            const rowSpacingStyle: CSSProperties = {};
            rowSpacingStyle.paddingTop = item.rowTopSpacing && item.rowTopSpacing !== "inherit"
              ? resolveBuilderSpacing(item.rowTopSpacing, "rowPadding").css
              : "var(--builder-global-row-padding-top, 32px)";
            rowSpacingStyle.paddingBottom = item.rowBottomSpacing && item.rowBottomSpacing !== "inherit"
              ? resolveBuilderSpacing(item.rowBottomSpacing, "rowPadding").css
              : "var(--builder-global-row-padding-bottom, 32px)";
            rowSpacingStyle.marginTop = item.rowTopMargin && item.rowTopMargin !== "inherit"
              ? resolveBuilderSpacing(item.rowTopMargin, "rowMargin").css
              : "var(--builder-global-row-margin-top, 0px)";
            rowSpacingStyle.marginBottom = item.rowBottomMargin && item.rowBottomMargin !== "inherit"
              ? resolveBuilderSpacing(item.rowBottomMargin, "rowMargin").css
              : "var(--builder-global-row-margin-bottom, 0px)";
            return (
              <Fragment key={columnKey}>
              <article
                onMouseEnter={() => setHoveredColumnKey(columnKey)}
                onMouseLeave={() => setHoveredColumnKey(null)}
                className={hasScrollPinned ? `w-full col-span-12 ${
                  selectedLayoutColumnKey === columnKey
                    ? "is-selected-column"
                    : ""
                } ${
                  hoveredColumnKey === columnKey ? "is-hovered-column" : ""
                } ${
                  isSelectedRow ? "is-selected-row" : ""
                } ${
                  dragOverKey === `col:${columnKey}` ? "is-drag-over" : ""
                }` : `shop-builder-content-layout-card shop-card-preset--${cardStyle} ${
                  blocks.length === 0 ? "is-empty-column" : ""
                } ${
                  selectedLayoutColumnKey === columnKey
                    ? "is-selected-column"
                    : ""
                } ${
                  hoveredColumnKey === columnKey ? "is-hovered-column" : ""
                } ${
                  isSelectedRow ? "is-selected-row" : ""
                } ${
                  dragOverKey === `col:${columnKey}` ? "is-drag-over" : ""
                }`}
                style={
                  hasScrollPinned
                    ? { ...rowSpacingStyle, gridColumn: "span 12" }
                    : {
                        ...rowSpacingStyle,
                        gridColumn: `span ${rowMeta?.span ?? 12}`,
                      }
                }
                onClick={(event) => {
                  if (
                    event.target instanceof HTMLElement &&
                    event.target.closest(".builder-preview-layout-block")
                  ) {
                    return;
                  }
                  event.stopPropagation();
                  onSelectColumn(section.id, columnKey);
                }}
                onDragEnter={(event) => {
                  const types = Array.from(event.dataTransfer.types);
                  if (
                    types.includes("application/x-builder-block") ||
                    types.includes("application/x-builder-new-block") ||
                    getBuilderTemplateDragType(event.dataTransfer.types) === "element"
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (dragClearTimer.current !== null) {
                      clearTimeout(dragClearTimer.current);
                      dragClearTimer.current = null;
                    }
                    setDragOverKey(`col:${columnKey}`);
                  }
                }}
                onDragLeave={() => {
                  dragClearTimer.current = window.setTimeout(() => {
                    dragClearTimer.current = null;
                    setDragOverKey(null);
                  }, 50);
                }}
                onDragOver={(event) => {
                  const types = Array.from(event.dataTransfer.types);
                  if (
                    types.includes("application/x-builder-block") ||
                    types.includes("application/x-builder-new-block") ||
                    getBuilderTemplateDragType(event.dataTransfer.types) === "element"
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    event.dataTransfer.dropEffect = types.includes(
                      "application/x-builder-new-block",
                    ) || getBuilderTemplateDragType(event.dataTransfer.types) === "element"
                      ? "copy"
                      : "move";
                  }
                }}
                onDrop={(event) => {
                  if (dragClearTimer.current !== null) {
                    clearTimeout(dragClearTimer.current);
                    dragClearTimer.current = null;
                  }
                  setDragOverKey(null);
                  const templateId = event.dataTransfer.getData(
                    BUILDER_TEMPLATE_DND_TYPE,
                  );
                  if (templateId) {
                    event.preventDefault();
                    event.stopPropagation();
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
                    event.preventDefault();
                    event.stopPropagation();
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
                  event.preventDefault();
                  event.stopPropagation();
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
                {isColumnActive && (
                  <BoxSpacingOverlay
                    kind="column"
                    labels={columnSpacingOverlayLabels(rowMeta)}
                    onOpenSpacingSettings={onOpenSpacingSettings}
	                  />
                )}
                {isRowActive && rowMeta?.isRowStart && (
                  <RowSpacingOverlay
                    item={item}
                    shellSettings={shellSettings}
                    sectionId={section.id}
                    rowIndex={rowMeta.rowIndex}
                    isRowStart
                    showZeroLabels={spacingOverlayEnabled}
                    onOpenSpacingSettings={onOpenSpacingSettings}
                  />
                )}
                {rowMeta?.isRowStart && (
                  <RowLayoutToolbar
                    rowIndex={rowMeta.rowIndex}
                    canMoveUp={rowMeta.rowIndex > 0}
                    canMoveDown={rowMeta.rowIndex < layoutRows.length - 1}
                    isEmpty={isEmptyRow}
                    onSettings={() => onSelectRow(section.id, rowMeta.rowIndex)}
                    onMoveUp={() => onMoveRow(section.id, rowMeta.rowIndex, -1)}
                    onMoveDown={() => onMoveRow(section.id, rowMeta.rowIndex, 1)}
                    onSave={() => onSaveRowTemplate(section.id, rowMeta.rowIndex)}
                    onDuplicate={() => onDuplicateRow(section.id, rowMeta.rowIndex)}
                    onDelete={() => onDeleteRow(section.id, rowMeta.rowIndex)}
                  />
                )}
                <div className="builder-preview-column-label">
                  Row {(rowMeta?.rowIndex ?? 0) + 1} / Column{" "}
                  {(rowMeta?.columnIndex ?? index) + 1}
                </div>
                {blocks.length === 0 && (
                  <div
                    className="builder-preview-drop-zone"
                    aria-label={`Drop element into row ${(rowMeta?.rowIndex ?? 0) + 1}, column ${(rowMeta?.columnIndex ?? index) + 1}`}
                    title={`Drop element into row ${(rowMeta?.rowIndex ?? 0) + 1}, column ${(rowMeta?.columnIndex ?? index) + 1}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpenElementsPanel();
                    }}
                  >
                    <Plus size={16} />
                  </div>
                )}
                {blocks.map((block, blockIndex) => {
                  const blockKey =
                    block.id ?? `${columnKey}-block-${blockIndex}`;
                  const blockAnimationAttrs = previewAnimationAttrs(
                    block.animation,
                  );
                  const isElementActive =
                    selectedSectionId === section.id &&
                    selectedLayoutColumnKey === columnKey &&
                    selectedLayoutBlockKey === blockKey;

                  return (
                    <div
                      key={blockKey}
                      draggable
                      onMouseEnter={() => setHoveredBlockKey(blockKey)}
                      onMouseLeave={() => setHoveredBlockKey(null)}
                      className={`builder-preview-layout-block is-${
                        block.kind ?? "text"
                      } ${
                        block.kind === "scrollPinnedDemo"
                          ? ""
                          : `shop-card-preset--${block.panelStyle ?? "default"} is-padding-${hasBuilderVisualSpacing(block.visualStyle?.padding) || !block.elementPadding || block.elementPadding === "inherit" ? "none" : block.elementPadding} is-align-${block.elementAlign ?? "left"} ${visualStyleClassName(block.visualStyle)} ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`
                      } ${
                        selectedLayoutBlockKey === blockKey
                          ? "is-selected-block"
                          : ""
                      } ${
                        hoveredBlockKey === blockKey ? "is-hovered-block" : ""
                      } ${
                        draggingLayoutBlockKey === blockKey
                          ? "is-dragging-block"
                          : ""
                      } ${
                        dragOverKey === `blk:${blockKey}` ? "is-drag-over" : ""
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
                          ...dashboardElementBoxStyle(block),
                          ...visualStyleToCss(
                            block.visualStyle as BuilderVisualStyle | undefined,
                          ),
                          ...blockAnimationAttrs.style,
                        } as CSSProperties
                      }
                      {...blockAnimationAttrs.data}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                        onSelectBlock(section.id, columnKey, blockKey);
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectBlock(section.id, columnKey, blockKey);
                      }}
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
                      }}
                      onDragEnter={(event) => {
                        const types = Array.from(event.dataTransfer.types);
                        if (
                          types.includes("application/x-builder-block") ||
                          types.includes("application/x-builder-new-block") ||
                          getBuilderTemplateDragType(event.dataTransfer.types) === "element"
                        ) {
                          event.stopPropagation();
                          if (dragClearTimer.current !== null) {
                            clearTimeout(dragClearTimer.current);
                            dragClearTimer.current = null;
                          }
                          setDragOverKey(`blk:${blockKey}`);
                        }
                      }}
                      onDragLeave={() => {
                        dragClearTimer.current = window.setTimeout(() => {
                          dragClearTimer.current = null;
                          setDragOverKey(null);
                        }, 50);
                      }}
                      onDragOver={(event) => {
                        const types = Array.from(event.dataTransfer.types);
                        if (
                          types.includes("application/x-builder-block") ||
                          types.includes("application/x-builder-new-block") ||
                          getBuilderTemplateDragType(event.dataTransfer.types) === "element"
                        ) {
                          event.preventDefault();
                          event.stopPropagation();
                          event.dataTransfer.dropEffect = types.includes(
                            "application/x-builder-new-block",
                          ) || getBuilderTemplateDragType(event.dataTransfer.types) === "element"
                            ? "copy"
                            : "move";
                        }
                      }}
                      onDrop={(event) => {
                        if (dragClearTimer.current !== null) {
                          clearTimeout(dragClearTimer.current);
                          dragClearTimer.current = null;
                        }
                        setDragOverKey(null);
                        const templateId = event.dataTransfer.getData(
                          BUILDER_TEMPLATE_DND_TYPE,
                        );
                        if (templateId) {
                          event.preventDefault();
                          event.stopPropagation();
                          onDropElementTemplate({
                            templateId,
                            sectionId: section.id,
                            columnKey,
                            targetBlockKey: blockKey,
                          });
                          return;
                        }
                        const newBlockKind = event.dataTransfer.getData(
                          "application/x-builder-new-block",
                        ) as LayoutBlockKind;
                        if (newBlockKind && newBlockKind in layoutBlockLabels) {
                          event.preventDefault();
                          event.stopPropagation();
                          onCreateBlock({
                            sectionId: section.id,
                            targetColumnKey: columnKey,
                            targetBlockKey: blockKey,
                            kind: newBlockKind,
                          });
                          return;
                        }

                        const payload = event.dataTransfer.getData(
                          "application/x-builder-block",
                        );
                        if (!payload) return;
                        event.preventDefault();
                        event.stopPropagation();
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
                          });
                        } catch {
                          onBlockDragEnd();
                        }
                        onBlockDragEnd();
                      }}
                      onDragEnd={() => {
                        if (dragClearTimer.current !== null) {
                          clearTimeout(dragClearTimer.current);
                          dragClearTimer.current = null;
                        }
                        setDragOverKey(null);
                        onBlockDragEnd();
                      }}
                    >
                      {isElementActive && (
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
                      <div
                        className="builder-preview-block-tools"
                        onClick={(event) => event.stopPropagation()}
                        onMouseDown={(event) => event.stopPropagation()}
                        onDragStart={(event) => event.stopPropagation()}
                      >
                        <span>
                          {layoutBlockLabels[block.kind ?? "text"] ?? "Block"}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onSelectBlock(section.id, columnKey, blockKey)
                          }
                          title="Edit element"
                        >
                          <Settings2 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onMoveBlockWithinColumn({
                              sectionId: section.id,
                              columnKey,
                              blockKey,
                              direction: -1,
                            })
                          }
                          disabled={blockIndex <= 0}
                          title="Move element up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onMoveBlockWithinColumn({
                              sectionId: section.id,
                              columnKey,
                              blockKey,
                              direction: 1,
                            })
                          }
                          disabled={blockIndex >= blocks.length - 1}
                          title="Move element down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onSaveElementTemplate(section.id, columnKey, blockKey)
                          }
                          title="Save element as template"
                        >
                          <Save size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDuplicateBlock({
                              sectionId: section.id,
                              columnKey,
                              blockKey,
                            })
                          }
                          title="Duplicate element"
                        >
                          <Copy size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onDeleteBlock({
                              sectionId: section.id,
                              columnKey,
                              blockKey,
                            })
                          }
                          title="Delete element"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <span
                        className="builder-preview-drag-handle"
                        aria-hidden="true"
                      >
                        ::
                      </span>
                      {block.kind !== "products" &&
                      block.kind?.startsWith("product") ? (
                        <PreviewProductBlockContent
                          block={block}
                          product={previewProduct}
                        />
                      ) : block.kind === "button" ? (
                        <div className={`shop-builder-column-block shop-builder-column-block--button ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}>
                          <div 
                            className={`shop-builder-buttons ${block.premiumButtonStyle && block.premiumButtonStyle !== "default" ? "" : `shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}`}
                            style={previewButtonsStyle(block.buttonsLayout, block.elementAlign)}
                          >
                            {block.buttonLabel && (
                              <DashboardTypog
                                as="span"
                                className={`builder-preview-cta ${
                                  block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                                    ? `shop-builder-cta--${block.premiumButtonStyle}`
                                    : `builder-preview-cta--${block.buttonStyle ?? "primary"}`
                                }`}
                                typography={block.typography}
                              >
                                {block.buttonLabel}
                              </DashboardTypog>
                            )}
                            {(block.buttons ?? []).map((btn, btnIdx) => (
                              <div
                                key={btn.id ?? btnIdx}
                                className={`builder-preview-button-item ${draggingItem?.kind === "button" && draggingItem?.fromIndex === btnIdx && draggingItem?.blockKey === blockKey ? "is-dragging" : ""} ${draggingItem?.kind === "button" && dropHoverIndex === btnIdx ? "is-drag-over" : ""}`}
                                draggable
                                onDragStart={(event) => {
                                  event.stopPropagation();
                                  event.dataTransfer.setData("text/plain", `button:${blockKey}:${btnIdx}`);
                                  event.dataTransfer.effectAllowed = "move";
                                  setDraggingItem({ kind: "button", blockKey, fromIndex: btnIdx });
                                }}
                                onDragOver={(event) => {
                                  if (!draggingItem || draggingItem.kind !== "button" || draggingItem.blockKey !== blockKey) return;
                                  if (draggingItem.fromIndex === btnIdx) {
                                    setDropHoverIndex(null);
                                    return;
                                  }
                                  event.preventDefault();
                                  event.dataTransfer.dropEffect = "move";
                                  if (dropHoverIndex !== btnIdx) {
                                    setDropHoverIndex(btnIdx);
                                  }
                                }}
                                onDragLeave={() => {
                                  if (dropHoverIndex === btnIdx) {
                                    setDropHoverIndex(null);
                                  }
                                }}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setDropHoverIndex(null);
                                  if (!draggingItem || draggingItem.kind !== "button" || draggingItem.blockKey !== blockKey) return;
                                  if (draggingItem.fromIndex === btnIdx) {
                                    setDraggingItem(null);
                                    return;
                                  }
                                  onMoveButton(section.id, columnKey, blockKey, draggingItem.fromIndex, btnIdx);
                                  setDraggingItem(null);
                                }}
                                onDragEnd={() => {
                                  setDraggingItem(null);
                                  setDropHoverIndex(null);
                                }}
                                style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: "4px" }}
                              >
                                <div className="builder-preview-button-tools">
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateButton(section.id, columnKey, blockKey, btnIdx);
                                    }}
                                    title="Duplicate button"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteButton(section.id, columnKey, blockKey, btnIdx);
                                    }}
                                    title="Delete button"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <span className="builder-preview-button-drag-handle" aria-hidden="true">⠿</span>
                                <DashboardTypog
                                  as="span"
                                  className={`builder-preview-cta ${
                                    block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                                      ? `shop-builder-cta--${block.premiumButtonStyle}`
                                      : `builder-preview-cta--${btn.style ?? "primary"}`
                                  }`}
                                  typography={block.typography}
                                >
                                  {btn.label || "Button"}
                                </DashboardTypog>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : block.kind === "icon" ? (
                        <div className="builder-preview-goodie builder-preview-goodie-icon">
                          {getPreviewGoodieIcon(block.iconName)}
                          {block.title && (
                            <DashboardTypog
                              as="strong"
                              typography={block.typography}
                            >
                              {block.title}
                            </DashboardTypog>
                          )}
                          {block.body && (
                            <DashboardTypog as="p" typography={block.typography}>
                              {block.body}
                            </DashboardTypog>
                          )}
                        </div>
                      ) : block.kind === "list" ? (
                        <div className="builder-preview-goodie builder-preview-goodie-list">
                          {block.title && (
                            <DashboardTypog
                              as="strong"
                              typography={block.typography}
                            >
                              {block.title}
                            </DashboardTypog>
                          )}
                          <ul className={block.listIconColorScheme === "gradient-cycle" ? "is-icon-gradient-cycle" : undefined}>
                            {(block.items ?? []).map((item, index) => (
                              <li
                                key={`${item}-${index}`}
                                className={`builder-preview-list-item ${draggingItem?.kind === "list" && draggingItem?.fromIndex === index && draggingItem?.blockKey === blockKey ? "is-dragging" : ""} ${draggingItem?.kind === "list" && dropHoverIndex === index ? "is-drag-over" : ""}`}
                                draggable
                                onDragStart={(event) => {
                                  event.stopPropagation();
                                  event.dataTransfer.setData("text/plain", `list:${blockKey}:${index}`);
                                  event.dataTransfer.effectAllowed = "move";
                                  setDraggingItem({ kind: "list", blockKey, fromIndex: index });
                                }}
                                onDragOver={(event) => {
                                  if (!draggingItem || draggingItem.kind !== "list" || draggingItem.blockKey !== blockKey) return;
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
                                  if (!draggingItem || draggingItem.kind !== "list" || draggingItem.blockKey !== blockKey) return;
                                  if (draggingItem.fromIndex === index) {
                                    setDraggingItem(null);
                                    return;
                                  }
                                  onMoveListItem(section.id, columnKey, blockKey, draggingItem.fromIndex, index);
                                  setDraggingItem(null);
                                }}
                                onDragEnd={() => {
                                  setDraggingItem(null);
                                  setDropHoverIndex(null);
                                }}
                                style={{ position: "relative", display: "flex", alignItems: "center", gap: "4px" }}
                              >
                                <div className="builder-preview-list-item-tools">
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDuplicateListItem(section.id, columnKey, blockKey, index);
                                    }}
                                    title="Duplicate list item"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(e) => e.stopPropagation()}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onDeleteListItem(section.id, columnKey, blockKey, index);
                                    }}
                                    title="Delete list item"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <span className="builder-preview-list-item-drag-handle" aria-hidden="true">⠿</span>
                                {{
                                  check: <Check size={14} />,
                                  circleCheck: <CircleCheck size={14} />,
                                  arrowRight: <ArrowRight size={14} />,
                                  star: <Star size={14} />,
                                  heart: <Heart size={14} />,
                                  sparkles: <Sparkles size={14} />,
                                  shield: <ShieldCheck size={14} />,
                                }[block.listIcon ?? "check"] ?? <Check size={14} />}
                                <DashboardTypog
                                  as="span"
                                  typography={block.typography}
                                >
                                  {item}
                                </DashboardTypog>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : block.kind === "heading" ? (
                        <div
                          className={`shop-builder-column-block shop-builder-column-block--heading ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}
                          style={{ textAlign: block.headingAlign ?? "left" }}
                        >
                          {(() => {
                            const Tag = block.headingLevel ?? "h2";
                            const levelDefaults: Record<string, { fontSize: string; fontWeight: string; lineHeight: string }> = {
                              h1: { fontSize: "clamp(42px, 8vw, 126px)", fontWeight: "760", lineHeight: "0.92" },
                              h2: { fontSize: "clamp(32px, 5vw, 64px)", fontWeight: "700", lineHeight: "1.1" },
                              h3: { fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "700", lineHeight: "1.2" },
                              h4: { fontSize: "clamp(20px, 3vw, 32px)", fontWeight: "600", lineHeight: "1.2" },
                              h5: { fontSize: "20px", fontWeight: "600", lineHeight: "1.3" },
                              h6: { fontSize: "16px", fontWeight: "600", lineHeight: "1.4" },
                            };
                            const defaultForLevel = levelDefaults[Tag] ?? levelDefaults.h2;

                            const userTitleTyp = (block.typography as any)?.title ?? 
                              (typeof block.typography === "object" && !(block.typography as any).title ? block.typography : {});

                            const resolvedTypography = {
                              variant: "heading",
                              fontSize: userTitleTyp.fontSize || defaultForLevel.fontSize,
                              fontWeight: userTitleTyp.fontWeight || defaultForLevel.fontWeight,
                              lineHeight: userTitleTyp.lineHeight || defaultForLevel.lineHeight,
                              fontFamily: userTitleTyp.fontFamily,
                              letterSpacing: userTitleTyp.letterSpacing,
                              color: userTitleTyp.color,
                              textTransform: userTitleTyp.textTransform,
                              textDecoration: userTitleTyp.textDecoration,
                            };

                            return (
                              <DashboardTypog
                                as={Tag}
                                className={block.textGradientPreset && block.textGradientPreset !== "none" && block.textGradientPreset !== "custom" ? `text-gradient--${block.textGradientPreset}` : ""}
                                typography={resolvedTypography}
                                style={{
                                  textAlign: block.headingAlign ?? "left",
                                  margin: 0,
                                  ...(block.textGradientPreset === "custom" ? {
                                    backgroundImage: `linear-gradient(${block.textGradientCustomAngle ?? 135}deg, ${block.textGradientCustomStart ?? "#ffffff"} ${block.textGradientCustomStartOffset ?? 0}%, ${block.textGradientCustomMiddle ?? "#60a5fa"} ${block.textGradientCustomMiddleOffset ?? 50}%, ${block.textGradientCustomEnd ?? "#c084fc"} ${block.textGradientCustomEndOffset ?? 100}%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                    display: "inline-block",
                                  } : {})
                                }}
                              >
                                {block.typewriterEnabled ? (
                                  <TypewriterText
                                    text={block.headingText ?? "Your Heading Text"}
                                    speed={block.typewriterSpeed}
                                    eraseSpeed={block.typewriterEraseSpeed}
                                    delay={block.typewriterDelay}
                                    loop={block.typewriterLoop}
                                    useGradient={block.typewriterUseGradient}
                                    gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                    typography={resolvedTypography}
                                    area="title"
                                  />
                                ) : (
                                  block.headingText ?? "Your Heading Text"
                                )}
                              </DashboardTypog>
                            );
                          })()}
                        </div>
                      ) : block.kind === "datePicker" ? (
                        <div className="builder-preview-goodie builder-preview-goodie-date">
                          <CalendarDays size={24} />
                          {block.title && (
                            <DashboardTypog
                              as="strong"
                              typography={block.typography}
                            >
                              {block.title}
                            </DashboardTypog>
                          )}
                          {block.body && (
                            <DashboardTypog as="p" typography={block.typography}>
                              {block.body}
                            </DashboardTypog>
                          )}
                          <label>
                            <span>{block.dateLabel ?? "Preferred date"}</span>
                            <input type="date" />
                          </label>
                        </div>
                      ) : block.kind === "hero" ? (
                        <div className={`shop-builder-column-block shop-builder-column-block--hero ${block.carouselSettings?.variant === "antigravity" ? "shop-builder-hero--antigravity shop-builder-hero--antigravity-block" : ""} ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}>
                          <div className={block.carouselSettings?.variant === "antigravity" ? "shop-builder-hero-content-left" : ""}>
                          {block.eyebrow && (
                            <InlineEditableText
                              as="span"
                              className="shop-builder-eyebrow"
                              typography={block.typography}
                              value={block.eyebrow}
                              onChange={(eyebrow) =>
                                onUpdateBlock(section.id, columnKey, blockKey, {
                                  eyebrow,
                                })
                              }
                            />
                          )}
                          {block.title && (
                            (block.typewriterEnabled || block.carouselSettings?.variant === "antigravity") ? (
                              <DashboardTypog
                                as="h3"
                                className={block.textGradientPreset && block.textGradientPreset !== "none" ? `text-gradient--${block.textGradientPreset}` : block.carouselSettings?.variant === "antigravity" ? "shop-builder-title--gradient" : ""}
                                typography={block.typography}
                              >
                                <TypewriterText
                                  text={block.title}
                                  speed={block.typewriterSpeed}
                                  eraseSpeed={block.typewriterEraseSpeed}
                                  delay={block.typewriterDelay}
                                  loop={block.typewriterLoop}
                                  useGradient={block.typewriterUseGradient}
                                  gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                  typography={block.typography}
                                  area="title"
                                />
                              </DashboardTypog>
                            ) : (
                              <InlineEditableText
                                as="h3"
                                className={block.textGradientPreset && block.textGradientPreset !== "none" && block.textGradientPreset !== "custom" ? `text-gradient--${block.textGradientPreset}` : block.carouselSettings?.variant === "antigravity" ? "shop-builder-title--gradient" : ""}
                                typography={block.typography}
                                value={block.title}
                                onChange={(title) =>
                                  onUpdateBlock(section.id, columnKey, blockKey, {
                                    title,
                                  })
                                }
                                style={block.textGradientPreset === "custom" ? {
                                  backgroundImage: `linear-gradient(${block.textGradientCustomAngle ?? 135}deg, ${block.textGradientCustomStart ?? "#ffffff"} ${block.textGradientCustomStartOffset ?? 0}%, ${block.textGradientCustomMiddle ?? "#60a5fa"} ${block.textGradientCustomMiddleOffset ?? 50}%, ${block.textGradientCustomEnd ?? "#c084fc"} ${block.textGradientCustomEndOffset ?? 100}%)`,
                                  WebkitBackgroundClip: "text",
                                  WebkitTextFillColor: "transparent",
                                  backgroundClip: "text",
                                  display: "inline-block",
                                } : undefined}
                              />
                            )
                          )}
                           {block.body && (
                            block.typewriterEnabled && !block.title ? (
                              <DashboardTypog as="p" typography={block.typography}>
                                <TypewriterText
                                  text={block.body}
                                  speed={block.typewriterSpeed}
                                  eraseSpeed={block.typewriterEraseSpeed}
                                  delay={block.typewriterDelay}
                                  loop={block.typewriterLoop}
                                  useGradient={block.typewriterUseGradient}
                                  gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                  typography={block.typography}
                                  area="body"
                                />
                              </DashboardTypog>
                            ) : (
                              <InlineEditableText
                                as="p"
                                typography={block.typography}
                                value={block.body}
                                onChange={(body) =>
                                  onUpdateBlock(section.id, columnKey, blockKey, {
                                    body,
                                  })
                                }
                              />
                            )
                          )}
                          <div 
                            className={`shop-builder-buttons ${block.premiumButtonStyle && block.premiumButtonStyle !== "default" ? "" : `shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}`}
                            style={previewButtonsStyle(block.buttonsLayout, block.elementAlign)}
                          >
                            {block.buttonLabel && (
                              <DashboardTypog
                                as="span"
                                className={`builder-preview-cta ${
                                  block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                                    ? `shop-builder-cta--${block.premiumButtonStyle}`
                                    : block.carouselSettings?.variant === "antigravity"
                                      ? "shop-builder-cta--antigravity"
                                      : `builder-preview-cta--${block.buttonStyle ?? "primary"}`
                                }`}
                                typography={block.typography}
                              >
                                {block.buttonLabel}
                              </DashboardTypog>
                            )}
                            {(block.buttons ?? []).map((btn, btnIdx) => (
                              <DashboardTypog
                                key={btn.id ?? btnIdx}
                                as="span"
                                className={`builder-preview-cta ${
                                  block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                                    ? `shop-builder-cta--${block.premiumButtonStyle}`
                                    : `builder-preview-cta--${btn.style ?? "primary"}`
                                }`}
                                style={{ display: "inline-flex" }}
                                typography={block.typography}
                              >
                                {btn.label || "Button"}
                              </DashboardTypog>
                            ))}
                          </div>
                          </div>
                          {block.carouselSettings?.variant === "antigravity" && (
                            <div className="shop-builder-hero-media shop-builder-hero-media--antigravity">
                              <AntigravityTerminal />
                            </div>
                          )}
                        </div>
                      ) : block.kind === "promoStrip" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--promo-strip">
                          <div>
                            {block.eyebrow && (
                              <InlineEditableText
                                as="span"
                                className="shop-builder-eyebrow"
                                typography={block.typography}
                                value={block.eyebrow}
                                onChange={(eyebrow) =>
                                  onUpdateBlock(
                                    section.id,
                                    columnKey,
                                    blockKey,
                                    { eyebrow },
                                  )
                                }
                              />
                            )}
                            {block.title && (
                              block.typewriterEnabled ? (
                                <DashboardTypog as="h3" typography={block.typography}>
                                  <TypewriterText
                                    text={block.title}
                                    speed={block.typewriterSpeed}
                                    eraseSpeed={block.typewriterEraseSpeed}
                                    delay={block.typewriterDelay}
                                    loop={block.typewriterLoop}
                                    useGradient={block.typewriterUseGradient}
                                    gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                    typography={block.typography}
                                    area="title"
                                  />
                                </DashboardTypog>
                              ) : (
                                <InlineEditableText
                                  as="h3"
                                  typography={block.typography}
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
                              )
                            )}
                            {block.body && (
                              block.typewriterEnabled && !block.title ? (
                                <DashboardTypog as="p" typography={block.typography}>
                                  <TypewriterText
                                    text={block.body}
                                    speed={block.typewriterSpeed}
                                    eraseSpeed={block.typewriterEraseSpeed}
                                    delay={block.typewriterDelay}
                                    loop={block.typewriterLoop}
                                    useGradient={block.typewriterUseGradient}
                                    gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                    typography={block.typography}
                                    area="body"
                                  />
                                </DashboardTypog>
                              ) : (
                                <InlineEditableText
                                  as="p"
                                  typography={block.typography}
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
                              )
                            )}
                          </div>
                        <div 
                          className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
                          style={previewButtonsStyle(block.buttonsLayout, block.elementAlign)}
                        >
                          {block.buttonLabel && (
                            <DashboardTypog
                              as="span"
                              className="builder-preview-cta"
                              typography={block.typography}
                            >
                              {block.buttonLabel}
                            </DashboardTypog>
                          )}
                          {(block.buttons ?? []).map((btn, btnIdx) => (
                            <DashboardTypog
                              key={btn.id ?? btnIdx}
                              as="span"
                              className={`builder-preview-cta builder-preview-cta--${btn.style ?? "primary"}`}
                              style={{ display: "inline-flex" }}
                              typography={block.typography}
                            >
                              {btn.label || "Button"}
                            </DashboardTypog>
                          ))}
                        </div>
                        </div>
                      ) : block.kind === "panel" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--panel">
                          {block.imageUrl && (
                            <div
                              className="shop-builder-panel-media"
                              style={{
                                backgroundImage: `url(${block.imageUrl})`,
                              }}
                            />
                          )}
                          <div>
                            {block.eyebrow && (
                              <InlineEditableText
                                as="span"
                                className="shop-builder-eyebrow"
                                typography={block.typography}
                                value={block.eyebrow}
                                onChange={(eyebrow) =>
                                  onUpdateBlock(
                                    section.id,
                                    columnKey,
                                    blockKey,
                                    { eyebrow },
                                  )
                                }
                              />
                            )}
                            {block.title && (
                              block.typewriterEnabled ? (
                                <DashboardTypog as="h3" typography={block.typography}>
                                  <TypewriterText
                                    text={block.title}
                                    speed={block.typewriterSpeed}
                                    eraseSpeed={block.typewriterEraseSpeed}
                                    delay={block.typewriterDelay}
                                    loop={block.typewriterLoop}
                                    useGradient={block.typewriterUseGradient}
                                    gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                    typography={block.typography}
                                    area="title"
                                  />
                                </DashboardTypog>
                              ) : (
                                <InlineEditableText
                                  as="h3"
                                  typography={block.typography}
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
                              )
                            )}
                            {block.body && (
                              block.typewriterEnabled && !block.title ? (
                                <DashboardTypog as="p" typography={block.typography}>
                                  <TypewriterText
                                    text={block.body}
                                    speed={block.typewriterSpeed}
                                    eraseSpeed={block.typewriterEraseSpeed}
                                    delay={block.typewriterDelay}
                                    loop={block.typewriterLoop}
                                    useGradient={block.typewriterUseGradient}
                                    gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset} customStart={block.textGradientCustomStart} customMiddle={block.textGradientCustomMiddle} customEnd={block.textGradientCustomEnd} customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                                    typography={block.typography}
                                    area="body"
                                  />
                                </DashboardTypog>
                              ) : (
                                <InlineEditableText
                                  as="p"
                                  typography={block.typography}
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
                              )
                            )}
                            
                            <RenderDashboardChecklist
                              items={block.items}
                              iconName={block.listIcon}
                              colorScheme={block.listIconColorScheme}
                              typography={block.typography}
                            />

                          <div 
                            className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
                            style={previewButtonsStyle(block.buttonsLayout, block.elementAlign)}
                          >
                            {block.buttonLabel && (
                              <DashboardTypog
                                as="span"
                                className="builder-preview-cta"
                                typography={block.typography}
                              >
                                {block.buttonLabel}
                              </DashboardTypog>
                            )}
                            {(block.buttons ?? []).map((btn, btnIdx) => (
                              <DashboardTypog
                                key={btn.id ?? btnIdx}
                                as="span"
                                className={`builder-preview-cta builder-preview-cta--${btn.style ?? "primary"}`}
                              style={{ display: "inline-flex" }}
                                typography={block.typography}
                              >
                                {btn.label || "Button"}
                              </DashboardTypog>
                            ))}
                          </div>
                          </div>
                        </div>
                      ) : block.kind === "image" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--image">
                          <div
                            className="shop-builder-panel-media"
                            style={{
                              textAlign: block.imageAlignment ?? "center",
                              maxWidth: block.imageMaxWidth ? `${block.imageMaxWidth}px` : undefined,
                              marginInline: "auto",
                            }}
                          >
                            {block.imageUrl ? (
                              <Image
                                src={block.imageUrl}
                                alt={block.imageAlt ?? block.title ?? ""}
                                width={1200}
                                height={800}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  borderRadius: block.imageBorderRadius ? `${block.imageBorderRadius}px` : undefined,
                                }}
                              />
                            ) : (
                              <div className="builder-mini-empty">
                                Choose an image in the inspector.
                              </div>
                            )}
                          </div>
                          {block.imageCaption && (
                            <p style={{ textAlign: "center", fontSize: "0.85em", opacity: 0.7, marginTop: 4 }}>
                              {block.imageCaption}
                            </p>
                          )}
                          {block.title && (
                            <DashboardTypog as="h3" typography={block.typography}>
                              {block.title}
                            </DashboardTypog>
                          )}
                          {block.body && (
                            <DashboardTypog as="p" typography={block.typography}>
                              {block.body}
                            </DashboardTypog>
                          )}
                        </div>
                      ) : block.kind === "table" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--table">
                          <div style={{ overflowX: "auto" }}>
                            <table
                              className={`builder-preview-table builder-preview-table--${block.tableStyle ?? "striped"}`}
                              style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9em" }}
                            >
                              {(block.tableHeadings ?? []).length > 0 && (
                                <thead>
                                  <tr>
                                    {(block.tableHeadings ?? []).map((heading, hIdx) => (
                                      <th key={hIdx}>{heading}</th>
                                    ))}
                                  </tr>
                                </thead>
                              )}
                              <tbody>
                                {(block.tableRows ?? []).map((row, rIdx) => (
                                  <tr key={rIdx}>
                                    {row.map((cell, cIdx) => (
                                      <td key={cIdx}>{cell}</td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : block.kind === "categoryFilters" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--category-filters">
                          {previewCategoryTree.length > 0 ? (
                            <CategoryBar
                              categoryTree={previewCategoryTree}
                              countsBySlug={previewCategoryCounts}
                              hiddenCategorySlugs={block.hiddenCategorySlugs}
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
                      ) : block.kind === "scrollPinnedDemo" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--scroll-pinned">
                          <ScrollPinnedDemo block={block} isPreview={true} />
                        </div>
                      ) : block.kind === "slider" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--slider">
                          {block.title && (
                            <DashboardTypog as="h3" typography={block.typography}>
                              {block.title}
                            </DashboardTypog>
                          )}
                          {block.body && (
                            <DashboardTypog as="p" typography={block.typography}>
                              {block.body}
                            </DashboardTypog>
                          )}
                          <CarouselBlock
                            block={{
                              __typename:
                                "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
                              fieldGroupName: "ReactBuilderColumnSliderPreview",
                            }}
                            slides={(block.slides ?? []).map(
                              (slide, slideIndex) => ({
                                id:
                                  slide.id ?? `${blockKey}-slide-${slideIndex}`,
                                title: slide.title,
                                subtitle: slide.subtitle,
                                text: slide.text,
                                badge: slide.badge,
                                imageUrl: slide.imageUrl,
                                imageAlt: slide.imageAlt,
                                imagePadding: slide.imagePadding,
                                buttonLabel: slide.buttonLabel,
                                buttonUrl: slide.buttonUrl,
                              }),
                            )}
                            settings={block.carouselSettings}
                            className="builder-preview-carousel"
                          />
                        </div>
                      ) : block.kind === "products" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--products">
                          {block.title && (
                            <DashboardTypog as="h3" typography={block.typography}>
                              {block.title}
                            </DashboardTypog>
                          )}
                          {previewProducts.length > 0 ? (
                            (() => {
                              const cardBorderRadiusStyle =
                                block.borderRadius !== undefined
                                  ? {
                                      "--builder-card-radius": `${block.borderRadius}px`,
                                      "--product-card-radius": `${block.borderRadius}px`,
                                    }
                                  : {};

                              const cardBackgroundStyle =
                                block.elementBackgroundMode === "custom" && block.elementBackground
                                  ? { "--builder-card-bg": block.elementBackground }
                                  : block.elementBackgroundMode === "transparent"
                                    ? { "--builder-card-bg": "transparent" }
                                    : {};

                              const productStyleProps = {
                                ...cardBorderRadiusStyle,
                                ...cardBackgroundStyle,
                              } as React.CSSProperties;

                              return block.layoutVariant === "carousel" ? (
                                <div style={productStyleProps}>
                                  <ProductCarousel
                                    products={previewProducts.slice(
                                      0,
                                      block.gridLimit ?? 8,
                                    )}
                                    preset={block.cardPreset ?? "standard"}
                                    cardStyle={block.cardStyle}
                                    cardTheme={block.panelStyle}
                                    gridImageFrame={block.gridImageFrame}
                                    imagePadding={block.imagePadding}
                                    imageFit={block.imageFit}
                                    imageRatio={block.imageRatio}
                                    borderRadius={block.borderRadius}
                                    addToCartStyle={block.addToCartStyle}
                                    addToCartSize={block.addToCartSize}
                                    addToCartDisplay={block.addToCartDisplay}
                                    addToCartVisibility={block.addToCartVisibility}
                                    addToCartPosition={block.addToCartPosition}
                                    typography={block.typography}
                                    categoryTree={previewCategoryTree}
                                  />
                                </div>
                              ) : (
                                <div
                                  className={`shop-builder-grid--margin-${
                                    hasBuilderVisualSpacing(block.visualStyle?.margin)
                                      ? "none"
                                      : block.gridMargin && block.gridMargin !== "inherit"
                                        ? block.gridMargin
                                        : "none"
                                  } shop-card-preset--${block.panelStyle ?? "default"}`}
                                  style={productStyleProps}
                                >
                                  <CategoryWithFilters
                                    products={
                                      (block.pagination?.enabled ?? false)
                                        ? previewProducts
                                        : previewProducts.slice(0, block.gridLimit ?? 4)
                                    }
                                    columns={block.columns}
                                    filterPosition={block.filterPosition}
                                    cardStyle={block.cardStyle}
                                    cardPreset={block.cardPreset}
                                    cardTheme={block.panelStyle}
                                    pageSize={block.gridLimit}
                                    gridGap={block.gridGap}
                                    cardPadding={block.cardPadding}
                                    imagePadding={block.imagePadding}
                                    imageFit={block.imageFit}
                                    imageRatio={block.imageRatio}
                                    imageFrame={block.gridImageFrame}
                                    addToCartStyle={block.addToCartStyle}
                                    addToCartSize={block.addToCartSize}
                                    addToCartPosition={block.addToCartPosition}
                                    addToCartVisibility={block.addToCartVisibility}
                                    addToCartDisplay={block.addToCartDisplay}
                                    hiddenCategorySlugs={block.hiddenCategorySlugs}
                                    categoryTree={previewCategoryTree}
                                    typography={block.typography}
                                    pagination={block.pagination}
                                  />
                              </div>
                              );
                            })()
                          ) : (
                            <div
                              className={`builder-preview-products shop-card-preset--${block.panelStyle ?? "default"}`}
                            >
                              {sampleProducts
                                .slice(0, block.gridLimit ?? 4)
                                .map((name) => (
                                  <span
                                    key={name}
                                    className="product-card builder-preview-product-card"
                                  >
                                    {name}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>
                      ) : block.kind === "grid" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--grid">
                          <div
                            className={`shop-builder-grid shop-builder-grid--gap-${
                              block.gridGap ?? "medium"
                            } shop-builder-grid--margin-${hasBuilderVisualSpacing(block.visualStyle?.margin) || !block.gridMargin || block.gridMargin === "inherit" ? "none" : block.gridMargin} shop-card-preset--${block.panelStyle ?? "default"}`}
                            style={
                              {
                                "--shop-builder-grid-columns":
                                  block.columns ?? 3,
                              } as CSSProperties
                            }
                          >
                            {(block.gridSource === "products"
                              ? previewProducts.map((product) => ({
                                  id: product.id,
                                  imageUrl: product.image?.sourceUrl,
                                  imageAlt:
                                    product.image?.altText ?? product.name,
                                  eyebrow: "Product",
                                  title: product.name,
                                  meta: product.price ?? "",
                                  text: product.attributes?.nodes
                                    ?.map(
                                      (attribute) =>
                                        attribute.label ?? attribute.name,
                                    )
                                    .join(", "),
                                  buttonLabel: "View product",
                                  buttonUrl: `/product/${product.slug}`,
                                }))
                              : (block.gridItems ?? [])
                            )
                              .slice(
                                0,
                                Math.max(
                                  1,
                                  (block.columns ?? 3) * (block.gridRows ?? 1),
                                ),
                              )
                              .map((item, itemIndex) => {
                                const itemTypography =
                                  ("typography" in item
                                    ? item.typography
                                    : undefined) ?? block.typography;

                                return (
                                <article
                                  key={
                                    item.id ?? `${blockKey}-grid-${itemIndex}`
                                  }
                                  draggable={block.gridSource !== "products"}
                                  className={`shop-builder-grid-card is-image-${
                                    block.gridImagePadding ?? "frameless"
                                  } is-content-${block.gridContentPadding ?? "medium"} is-frame-${
                                    block.gridImageFrame ?? "none"
                                  } ${
                                    draggingItem?.blockKey === blockKey && draggingItem?.fromIndex === itemIndex
                                      ? "is-dragging-grid"
                                      : ""
                                  } ${
                                    draggingItem && dropHoverIndex === itemIndex && draggingItem.blockKey === blockKey
                                      ? "is-drag-over-grid"
                                      : ""
                                  }`}
                                  onDragStart={(event) => {
                                    if (block.gridSource === "products") return;
                                    event.stopPropagation();
                                    event.dataTransfer.setData(
                                      "text/plain",
                                      `grid-item:${blockKey}:${itemIndex}`,
                                    );
                                    event.dataTransfer.effectAllowed = "move";
                                    setDraggingItem({ kind: "grid", blockKey, fromIndex: itemIndex });
                                  }}
                                  onDragOver={(event) => {
                                    if (!draggingItem || draggingItem.kind !== "grid" || draggingItem.blockKey !== blockKey) return;
                                    if (draggingItem.fromIndex === itemIndex) {
                                      setDropHoverIndex(null);
                                      return;
                                    }
                                    event.preventDefault();
                                    event.dataTransfer.dropEffect = "move";
                                    if (dropHoverIndex !== itemIndex) {
                                      setDropHoverIndex(itemIndex);
                                    }
                                  }}
                                  onDragLeave={() => {
                                    if (dropHoverIndex === itemIndex) {
                                      setDropHoverIndex(null);
                                    }
                                  }}
                                  onDrop={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    setDropHoverIndex(null);
                                    if (!draggingItem || draggingItem.kind !== "grid" || draggingItem.blockKey !== blockKey) return;
                                    if (draggingItem.fromIndex === itemIndex) {
                                      setDraggingItem(null);
                                      return;
                                    }
                                    onMoveGridItem(
                                      section.id,
                                      columnKey,
                                      blockKey,
                                      draggingItem.fromIndex,
                                      itemIndex,
                                    );
                                    setDraggingItem(null);
                                  }}
                                  onDragEnd={() => {
                                    setDraggingItem(null);
                                    setDropHoverIndex(null);
                                  }}
                                >
                                  {block.gridSource !== "products" && (
                                    <>
                                      <div className="builder-preview-grid-item-tools">
                                        <button
                                          type="button"
                                          onMouseDown={(event) => event.stopPropagation()}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            onDuplicateGridItem(
                                              section.id,
                                              columnKey,
                                              blockKey,
                                              itemIndex,
                                            );
                                          }}
                                          title="Duplicate item"
                                        >
                                          <Copy size={12} />
                                        </button>
                                        <button
                                          type="button"
                                          onMouseDown={(event) => event.stopPropagation()}
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            onDeleteGridItem(
                                              section.id,
                                              columnKey,
                                              blockKey,
                                              itemIndex,
                                            );
                                          }}
                                          title="Delete item"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      </div>
                                      <span
                                        className="builder-preview-grid-drag-handle"
                                        aria-hidden="true"
                                      >
                                        ::
                                      </span>
                                    </>
                                  )}
                                  {block.gridShowImage !== false && (
                                    <div
                                      className={`shop-builder-grid-image ${
                                        item.imageUrl ? "" : "is-empty"
                                      }`}
                                    >
                                      {item.imageUrl ? (
                                        <Image
                                          src={item.imageUrl}
                                          alt={
                                            item.imageAlt || item.title || ""
                                          }
                                          width={420}
                                          height={420}
                                        />
                                      ) : block.gridSource !== "products" ? (
                                        <span>No image</span>
                                      ) : null}
                                      {block.gridSource !== "products" && (
                                        <label
                                          className="builder-preview-image-upload"
                                          onClick={(event) =>
                                            event.stopPropagation()
                                          }
                                        >
                                          <ImageIcon size={14} />
                                          <span>
                                            {item.imageUrl
                                              ? "Change image"
                                              : "Select image"}
                                          </span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) =>
                                              onUploadGridItemImage(
                                                section.id,
                                                columnKey,
                                                blockKey,
                                                itemIndex,
                                                event.target.files?.[0] ?? null,
                                              )
                                            }
                                          />
                                        </label>
                                      )}
                                    </div>
                                  )}
                                  <div className="shop-builder-grid-content">
                                    {block.gridSource !== "products" ? (
                                      <>
                                        {block.gridShowEyebrow !== false &&
                                          item.eyebrow && (
                                            <InlineEditableText
                                              as="span"
                                              className="shop-builder-eyebrow"
                                              typography={itemTypography}
                                              value={item.eyebrow}
                                              onChange={(eyebrow) =>
                                                onUpdateGridItem(
                                                  section.id,
                                                  columnKey,
                                                  blockKey,
                                                  itemIndex,
                                                  {
                                                    eyebrow,
                                                  },
                                                )
                                              }
                                            />
                                          )}
                                        {item.title && (
                                          <InlineEditableText
                                            as="h3"
                                            className="shop-builder-title"
                                            typography={itemTypography}
                                            value={item.title}
                                            onChange={(title) =>
                                              onUpdateGridItem(
                                                section.id,
                                                columnKey,
                                                blockKey,
                                                itemIndex,
                                                {
                                                  title,
                                                },
                                              )
                                            }
                                          />
                                        )}
                                        {block.gridShowMeta !== false &&
                                          item.meta && (
                                            <InlineEditableText
                                              as="span"
                                              className="shop-builder-grid-meta"
                                              typography={itemTypography}
                                              value={item.meta}
                                              onChange={(meta) =>
                                                onUpdateGridItem(
                                                  section.id,
                                                  columnKey,
                                                  blockKey,
                                                  itemIndex,
                                                  {
                                                    meta,
                                                  },
                                                )
                                              }
                                            />
                                          )}
                                        {block.gridShowText !== false &&
                                          item.text && (
                                            <InlineEditableText
                                              as="p"
                                              className="shop-builder-body"
                                              typography={itemTypography}
                                              value={item.text}
                                              onChange={(text) =>
                                                onUpdateGridItem(
                                                  section.id,
                                                  columnKey,
                                                  blockKey,
                                                  itemIndex,
                                                  {
                                                    text,
                                                  },
                                                )
                                              }
                                            />
                                          )}

                                        <RenderDashboardChecklist
                                          items={"items" in item ? item.items : undefined}
                                          iconName={"listIcon" in item ? item.listIcon : undefined}
                                          colorScheme={"listIconColorScheme" in item ? item.listIconColorScheme : undefined}
                                          typography={itemTypography}
                                        />

                                        {block.gridShowButton !== false &&
                                          item.buttonLabel && (
                                            <InlineEditableText
                                              as="span"
                                              className="builder-preview-cta"
                                              typography={itemTypography}
                                              value={item.buttonLabel}
                                              onChange={(buttonLabel) =>
                                                onUpdateGridItem(
                                                  section.id,
                                                  columnKey,
                                                  blockKey,
                                                  itemIndex,
                                                  {
                                                    buttonLabel,
                                                  },
                                                )
                                              }
                                            />
                                          )}
                                      </>
                                    ) : (
                                      <>
                                        {block.gridShowEyebrow !== false &&
                                          item.eyebrow && (
                                            <span>{item.eyebrow}</span>
                                          )}
                                        {item.title && <h3>{item.title}</h3>}
                                        {block.gridShowMeta !== false &&
                                          item.meta && (
                                            <small>{item.meta}</small>
                                          )}
                                        {block.gridShowText !== false &&
                                          item.text && <p>{item.text}</p>}
                                        {block.gridShowButton !== false &&
                                          item.buttonLabel && (
                                            <span className="builder-preview-cta">
                                              {item.buttonLabel}
                                            </span>
                                          )}
                                      </>
                                    )}
                                  </div>
                                </article>
                              );
                              })}
                          </div>
                        </div>
                      ) : block.kind === "badgeGrid" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--badges">
                          {block.title && (
                            <DashboardTypog as="h3" typography={block.typography}>
                              {block.title}
                            </DashboardTypog>
                          )}
                          {block.body && (
                            <DashboardTypog as="p" typography={block.typography}>
                              {block.body}
                            </DashboardTypog>
                          )}
                          <div
                            className="shop-builder-column-badges"
                            style={
                              {
                                "--builder-column-badge-columns":
                                  block.columns ?? 2,
                              } as CSSProperties
                            }
                          >
                            {(block.badges ?? []).map((badge, badgeIndex) => (
                              <article
                                key={
                                  badge.id ?? `${blockKey}-badge-${badgeIndex}`
                                }
                                className={`shop-builder-badge-card ${draggingItem?.kind === "badge" && draggingItem?.fromIndex === badgeIndex && draggingItem?.blockKey === blockKey ? "is-dragging" : ""} ${draggingItem?.kind === "badge" && dropHoverIndex === badgeIndex ? "is-drag-over" : ""}`}
                                draggable
                                onDragStart={(event) => {
                                  event.stopPropagation();
                                  event.dataTransfer.setData("text/plain", `badge:${blockKey}:${badgeIndex}`);
                                  event.dataTransfer.effectAllowed = "move";
                                  setDraggingItem({ kind: "badge", blockKey, fromIndex: badgeIndex });
                                }}
                                onDragOver={(event) => {
                                  if (!draggingItem || draggingItem.kind !== "badge" || draggingItem.blockKey !== blockKey) return;
                                  if (draggingItem.fromIndex === badgeIndex) {
                                    setDropHoverIndex(null);
                                    return;
                                  }
                                  event.preventDefault();
                                  event.dataTransfer.dropEffect = "move";
                                  if (dropHoverIndex !== badgeIndex) {
                                    setDropHoverIndex(badgeIndex);
                                  }
                                }}
                                onDragLeave={() => {
                                  if (dropHoverIndex === badgeIndex) {
                                    setDropHoverIndex(null);
                                  }
                                }}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  setDropHoverIndex(null);
                                  if (!draggingItem || draggingItem.kind !== "badge" || draggingItem.blockKey !== blockKey) return;
                                  if (draggingItem.fromIndex === badgeIndex) {
                                    setDraggingItem(null);
                                    return;
                                  }
                                  onMoveBadge(section.id, columnKey, blockKey, draggingItem.fromIndex, badgeIndex);
                                  setDraggingItem(null);
                                }}
                                onDragEnd={() => {
                                  setDraggingItem(null);
                                  setDropHoverIndex(null);
                                }}
                              >
                                <div className="builder-preview-badge-tools">
                                  <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onDuplicateBadge(
                                        section.id,
                                        columnKey,
                                        blockKey,
                                        badgeIndex,
                                      );
                                    }}
                                    title="Duplicate badge"
                                  >
                                    <Copy size={12} />
                                  </button>
                                  <button
                                    type="button"
                                    onMouseDown={(event) => event.stopPropagation()}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onDeleteBadge(
                                        section.id,
                                        columnKey,
                                        blockKey,
                                        badgeIndex,
                                      );
                                    }}
                                    title="Delete badge"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                                <span
                                  className="builder-preview-badge-drag-handle"
                                  aria-hidden="true"
                                >
                                  ::
                                </span>
                                {badge.label && (
                                  <DashboardTypog
                                    as="span"
                                    typography={block.typography}
                                  >
                                    {badge.label}
                                  </DashboardTypog>
                                )}
                                {badge.title && (
                                  <DashboardTypog
                                    as="strong"
                                    typography={block.typography}
                                  >
                                    {badge.title}
                                  </DashboardTypog>
                                )}
                                {badge.body && (
                                  <DashboardTypog
                                    as="p"
                                    typography={block.typography}
                                  >
                                    {badge.body}
                                  </DashboardTypog>
                                )}
                              </article>
                            ))}
                          </div>
                        </div>
                      ) : block.kind === "fluentForm" ? (
                        <div className="shop-builder-column-block shop-builder-column-block--fluent-form builder-preview-fluent-form">
                          <FluentFormClient
                            formId={block.fluentFormId}
                            title={block.title}
                            previewMode
                          />
                        </div>
                      ) : (
                        <>
                          <small>
                            {layoutBlockLabels[block.kind ?? "text"]}
                          </small>
                          {block.eyebrow && (
                            <InlineEditableText
                              as="em"
                              value={block.eyebrow}
                              typography={block.typography}
                              onChange={(eyebrow) =>
                                onUpdateBlock(section.id, columnKey, blockKey, {
                                  eyebrow,
                                })
                              }
                            />
                          )}
                          {block.title && (
                            <InlineEditableText
                              as="strong"
                              value={block.title}
                              typography={block.typography}
                              onChange={(title) =>
                                onUpdateBlock(section.id, columnKey, blockKey, {
                                  title,
                                })
                              }
                            />
                          )}
                          {block.body && (
                            <InlineEditableText
                              as="p"
                              value={block.body}
                              typography={block.typography}
                              onChange={(body) =>
                                onUpdateBlock(section.id, columnKey, blockKey, {
                                  body,
                                })
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
                          {block.kind === "breadcrumbs" && (
                            <span>Dynamic navigation path</span>
                          )}
                          <div 
                            className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
                            style={previewButtonsStyle(block.buttonsLayout, block.elementAlign)}
                          >
                            {block.buttonLabel && (
                              <span className="builder-preview-cta">
                                {block.buttonLabel}
                              </span>
                            )}
                            {(block.buttons ?? []).map((btn, btnIdx) => (
                              <DashboardTypog
                                key={btn.id ?? btnIdx}
                                as="span"
                                className={`builder-preview-cta builder-preview-cta--${btn.style ?? "primary"}`}
                              style={{ display: "inline-flex" }}
                              >
                                {btn.label || "Button"}
                              </DashboardTypog>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </article>
                {rowMeta?.isRowEnd && (
                  <RowInsertControl
                    placement="after"
                    onClick={() =>
                      setRowInsertTarget({
                        rowIndex: rowMeta.rowIndex,
                        placement: "after",
                      })
                    }
                    onTemplateDrop={(templateId) =>
                      onDropRowTemplate(
                        templateId,
                        section.id,
                        rowMeta.rowIndex,
                        "after",
                      )
                    }
                  />
                )}
              </Fragment>
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
          {section.body && <BodyText className="shop-builder-body">{section.body}</BodyText>}
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
                event.dataTransfer.setData("text/plain", `sectionBadge:${section.id}:${index}`);
                event.dataTransfer.effectAllowed = "move";
                setDraggingItem({ kind: "sectionBadge", blockKey: section.id, fromIndex: index });
              }}
              onDragOver={(event) => {
                if (!draggingItem || draggingItem.kind !== "sectionBadge" || draggingItem.blockKey !== section.id) return;
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
                if (!draggingItem || draggingItem.kind !== "sectionBadge" || draggingItem.blockKey !== section.id) return;
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
              <span className="builder-preview-section-badge-drag-handle" aria-hidden="true">⠿</span>
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
      <div>
        <p className="shop-builder-eyebrow">
          <Grid3X3 size={18} />
          Promo
        </p>
        <h2 className="shop-builder-title">{section.title}</h2>
        {section.body && <BodyText className="shop-builder-body">{section.body}</BodyText>}
      </div>
      {section.ctaLabel && (
        <span className="shop-builder-cta shop-builder-cta--light">
          {section.ctaLabel}
        </span>
      )}
    </div>
  );
}
