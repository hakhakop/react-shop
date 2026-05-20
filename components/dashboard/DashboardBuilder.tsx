"use client";

import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
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
  MonitorSmartphone,
  Navigation,
  PanelLeft,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  ShoppingBag,
  Undo2,
  Save,
  Settings2,
  Sparkles,
  ShieldCheck,
  SquareMousePointer,
  TextCursorInput,
  Truck,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CSSProperties, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import CarouselBlock, { type CarouselSlide } from "@/components/blocks/CarouselBlock";
import CategoryBar from "@/components/CategoryBar";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import ProductOptionsSelector from "@/components/ProductOptionsSelector";
import type { CategoryTreeItem } from "@/lib/categories";
import type { ProductNode } from "@/lib/products";

type BuilderCustomPageKey = `page:${string}`;
type BuilderPage = "home" | "shop" | "client" | BuilderCustomPageKey;
type BuilderTemplate =
  | "product-single"
  | "product-category"
  | "product-category-specific"
  | "search-results";
type BuilderLayoutKey = BuilderPage | BuilderTemplate;
type BuilderTargetType = "page" | "template";
type BuilderHeaderLayout =
  | "wordpress"
  | "simple"
  | "two-row"
  | "hero"
  | "pill"
  | "princity";
type BuilderShellSettings = {
  headerVisible: boolean;
  headerLayout: BuilderHeaderLayout;
  sectionPaddingTop: GlobalSectionSpacing;
  sectionPaddingBottom: GlobalSectionSpacing;
  sectionMarginTop: GlobalSectionSpacing;
  sectionMarginBottom: GlobalSectionSpacing;
};
type SectionKind =
  | "hero"
  | "productArchive"
  | "recentlyViewed"
  | "filters"
  | "promo"
  | "slider"
  | "badgeGrid"
  | "contentLayout"
  | "embed";
type PreviewDevice = "desktop" | "tablet" | "mobile";
type GlobalSectionSpacing = "none" | "small" | "medium" | "large";
type SectionSpacing = "inherit" | GlobalSectionSpacing;
type InspectorTab = "content" | "style" | "manage";
type SlideImagePadding = "frameless" | "small" | "medium" | "max";
type SectionBackgroundMode = "full" | "boxed";
type SectionContentMode = "full" | "boxed" | "narrow";
type BuilderColorScheme = "auto" | "light" | "dark";
type SectionColorScheme = "inherit" | "light" | "dark";
type EmbedMode = "iframe" | "code";
type LayoutBlockKind =
  | "hero"
  | "promoStrip"
  | "grid"
  | "panel"
  | "text"
  | "slider"
  | "embed"
  | "fluentForm"
  | "badgeGrid"
  | "icon"
  | "list"
  | "datePicker"
  | "products"
  | "categoryFilters"
  | "breadcrumbs"
  | "productHero"
  | "productInfoStack"
  | "productPurchasePanel"
  | "productSpecsPanel"
  | "productGallery"
  | "productTitle"
  | "productPrice"
  | "productAddToCart"
  | "productAttributes"
  | "productDescription";

type BuilderDesign = {
  preset?: "princity" | "editorial" | "contrast";
  colorScheme?: BuilderColorScheme;
  pageBackground?: string;
  textColor?: string;
  mutedTextColor?: string;
  accentColor?: string;
  surfaceColor?: string;
  buttonBackground?: string;
  buttonTextColor?: string;
  radius?: string;
  sectionMaxWidth?: string;
  sectionGutter?: string;
  headingFontFamily?: string;
  headingSize?: string;
  headingWeight?: string;
  headingLineHeight?: string;
  headingColor?: string;
};

type BuilderLayoutBlock = {
  id?: string;
  kind?: LayoutBlockKind;
  eyebrow?: string;
  title?: string;
  body?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  elementBackgroundMode?: "default" | "transparent" | "custom";
  elementBackground?: string;
  elementPadding?: "none" | "small" | "medium" | "large";
  embedMode?: EmbedMode;
  embedCode?: string;
  embedUrl?: string;
  embedHeight?: number;
  fluentFormId?: string;
  columns?: number;
  filterPosition?: "left" | "top" | "drawer" | "hidden";
  cardStyle?: "flat" | "soft" | "lined";
  cardPreset?:
    | "standard"
    | "graph"
    | "gallery"
    | "editorial"
    | "compact"
    | "minimal"
    | "luxury";
  gridLimit?: number;
  source?: "all" | "featured" | "category";
  categoryId?: string;
  layoutVariant?: "grid" | "carousel";
  badges?: BuilderSection["badges"];
  slides?: BuilderSection["slides"];
  carouselSettings?: BuilderSection["carouselSettings"];
  iconName?: "sparkles" | "heart" | "truck" | "shield";
  items?: string[];
  dateLabel?: string;
  gridSource?: "static" | "products";
  gridRows?: number;
  gridGap?: "none" | "small" | "medium" | "large" | "max";
  gridMargin?: "none" | "small" | "medium" | "large";
  cardPadding?: "none" | "small" | "medium" | "large" | "max";
  imagePadding?: "none" | "small" | "medium" | "large" | "max";
  gridImagePadding?: "frameless" | "small" | "medium" | "max";
  gridContentPadding?: "none" | "small" | "medium" | "large";
  gridImageFrame?: "none" | "soft";
  gridShowImage?: boolean;
  gridShowEyebrow?: boolean;
  gridShowMeta?: boolean;
  gridShowText?: boolean;
  gridShowButton?: boolean;
  gridItems?: {
    id?: string;
    imageUrl?: string;
    imageAlt?: string;
    eyebrow?: string;
    title?: string;
    meta?: string;
    text?: string;
    buttonLabel?: string;
    buttonUrl?: string;
  }[];
  galleryShowThumbnails?: boolean;
  galleryThumbnailPosition?: "bottom" | "left";
  galleryImageFit?: "contain" | "cover";
  galleryHeight?: number;
};

type BuilderSection = {
  id: string;
  kind: SectionKind;
  title: string;
  eyebrow?: string;
  body?: string;
  background: string;
  backgroundMode?: SectionBackgroundMode;
  contentMode?: SectionContentMode;
  colorScheme?: SectionColorScheme;
  layout?: string;
  topSpacing?: SectionSpacing;
  bottomSpacing?: SectionSpacing;
  topMargin?: SectionSpacing;
  bottomMargin?: SectionSpacing;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonTarget?: "_self" | "_blank";
  columns?: number;
  filterPosition?: "left" | "top" | "drawer" | "hidden";
  cardStyle?: "flat" | "soft" | "lined";
  cardPreset?:
    | "standard"
    | "graph"
    | "gallery"
    | "editorial"
    | "compact"
    | "minimal"
    | "luxury";
  gridGap?: "none" | "small" | "medium" | "large" | "max";
  cardPadding?: "none" | "small" | "medium" | "large" | "max";
  imagePadding?: "none" | "small" | "medium" | "large" | "max";
  source?: "all" | "featured" | "category";
  categoryId?: string;
  gridLimit?: number;
  layoutVariant?: "grid" | "carousel";
  promoVariant?: "default" | "accent" | "soft";
  ctaLabel?: string;
  ctaUrl?: string;
  embedMode?: EmbedMode;
  embedCode?: string;
  embedUrl?: string;
  embedHeight?: number;
  layoutColumns?: number;
  layoutRows?: number;
  layoutItems?: {
    id?: string;
    eyebrow?: string;
    title?: string;
    body?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    blocks?: BuilderLayoutBlock[];
  }[];
  badges?: {
    id?: string;
    label?: string;
    title?: string;
    body?: string;
  }[];
  slides?: {
    id?: string;
    title?: string;
    subtitle?: string;
    text?: string;
    badge?: string;
    imageUrl?: string;
    imageAlt?: string;
    imagePadding?: SlideImagePadding;
    buttonLabel?: string;
    buttonUrl?: string;
  }[];
  carouselSettings?: {
    variant?: string;
    loop?: boolean;
    autoplay?: boolean;
    autoplayDelayMs?: number;
    align?: "center" | "start";
    dragFree?: boolean;
    cardsPerView?: number;
    showArrows?: boolean;
    showDots?: boolean;
    pauseOnHover?: boolean;
  };
  visible: boolean;
};

type BuilderState = {
  page: BuilderLayoutKey;
  targetType?: BuilderTargetType;
  template?: BuilderTemplate;
  design: BuilderDesign;
  sections: BuilderSection[];
};

type BuilderCustomPage = {
  key: BuilderCustomPageKey;
  title: string;
  slug: string;
  updatedAt?: string;
};

const STORAGE_KEY = "react-shop-visual-builder-v1";
const STORAGE_BY_KEY = "react-shop-visual-builder-drafts-v2";
const STORAGE_CUSTOM_PAGES = "react-shop-visual-builder-pages-v1";

const defaultShellSettings: BuilderShellSettings = {
  headerVisible: true,
  headerLayout: "wordpress",
  sectionPaddingTop: "medium",
  sectionPaddingBottom: "medium",
  sectionMarginTop: "none",
  sectionMarginBottom: "none",
};

const sectionLabels: Record<SectionKind, string> = {
  hero: "Hero",
  productArchive: "Product Archive",
  recentlyViewed: "Recently Viewed",
  filters: "Top Category Filters",
  promo: "Promo Strip",
  slider: "Slider",
  badgeGrid: "Badge Grid",
  contentLayout: "Content Layout",
  embed: "Embed / Code",
};

const layoutBlockLabels: Record<LayoutBlockKind, string> = {
  hero: "Hero",
  promoStrip: "Promo Strip",
  grid: "Grid",
  panel: "Panel",
  text: "Text",
  slider: "Slider",
  embed: "HTML",
  fluentForm: "Fluent Form",
  badgeGrid: "Badges",
  icon: "Icon",
  list: "List",
  datePicker: "Date Picker",
  products: "Products",
  categoryFilters: "Category Filters",
  breadcrumbs: "Breadcrumbs",
  productHero: "Product Hero",
  productInfoStack: "Product Info Stack",
  productPurchasePanel: "Purchase Panel",
  productSpecsPanel: "Specs Panel",
  productGallery: "Product Gallery",
  productTitle: "Product Title",
  productPrice: "Product Price",
  productAddToCart: "Add To Cart",
  productAttributes: "Product Details",
  productDescription: "Description",
};

const baseLayoutBlockKinds: LayoutBlockKind[] = [
  "hero",
  "promoStrip",
  "grid",
  "panel",
  "text",
  "slider",
  "fluentForm",
  "embed",
  "badgeGrid",
  "icon",
  "list",
  "datePicker",
  "products",
  "categoryFilters",
  "breadcrumbs",
];

const productLayoutBlockKinds: LayoutBlockKind[] = [
  "productHero",
  "productInfoStack",
  "productPurchasePanel",
  "productSpecsPanel",
  "productGallery",
  "productTitle",
  "productPrice",
  "productAddToCart",
  "productAttributes",
  "productDescription",
];

const layoutBlockDescriptions: Record<LayoutBlockKind, string> = {
  hero: "Large intro with eyebrow, title, copy, and button.",
  promoStrip: "Compact announcement, offer, or callout.",
  grid: "Configurable static or dynamic card grid.",
  panel: "Image, eyebrow, title, copy, and button in one content block.",
  text: "Static copy, button, and small editorial content.",
  slider: "Carousel with editable slides and images.",
  embed: "Forms, chat widgets, maps, or trusted HTML.",
  fluentForm: "Render a Fluent Forms form from WordPress by form ID.",
  badgeGrid: "Compact promises, services, or feature badges.",
  icon: "Decorative icon with optional label and text.",
  list: "Clean bullet or checklist content.",
  datePicker: "Native date input for bookings, forms, or delivery dates.",
  products: "Dynamic WooCommerce product grid or carousel.",
  categoryFilters: "Dynamic WooCommerce category pills.",
  breadcrumbs: "Dynamic page or product breadcrumbs.",
  productHero: "Premium product intro using live product fields.",
  productInfoStack: "Title, price, description, and purchase action.",
  productPurchasePanel: "Focused buy box with price, cart, and details.",
  productSpecsPanel: "Clean dynamic attribute/specification panel.",
  productGallery: "Dynamic current product image gallery.",
  productTitle: "Dynamic current product title.",
  productPrice: "Dynamic current product price.",
  productAddToCart: "Dynamic WooCommerce add-to-cart action.",
  productAttributes: "Dynamic current product attributes.",
  productDescription: "Dynamic current product description.",
};

const layoutBlockGroups: {
  id: string;
  label: string;
  kinds: LayoutBlockKind[];
}[] = [
  {
    id: "woocommerce-product",
    label: "WooCommerce Product",
    kinds: [
      "productHero",
      "productInfoStack",
      "productPurchasePanel",
      "productSpecsPanel",
    ],
  },
  {
    id: "woocommerce-fields",
    label: "Product Fields",
    kinds: [
      "productGallery",
      "productTitle",
      "productPrice",
      "productAddToCart",
      "productAttributes",
      "productDescription",
    ],
  },
  {
    id: "woocommerce-catalog",
    label: "WooCommerce Catalog",
    kinds: ["products", "categoryFilters"],
  },
  {
    id: "content",
    label: "Content",
    kinds: [
      "hero",
      "promoStrip",
      "grid",
      "panel",
      "text",
      "slider",
      "badgeGrid",
      "icon",
      "list",
      "datePicker",
    ],
  },
  {
    id: "wordpress",
    label: "WordPress & Utility",
    kinds: ["fluentForm", "embed", "breadcrumbs"],
  },
];

const basePageLabels: Record<Exclude<BuilderPage, BuilderCustomPageKey>, string> = {
  home: "Home",
  shop: "Shop",
  client: "Client Page",
};

const templateLabels: Record<BuilderTemplate, string> = {
  "product-single": "Single Product",
  "product-category": "Product Category",
  "product-category-specific": "Specific Category",
  "search-results": "Search Results",
};

const layoutLabels: Partial<Record<BuilderLayoutKey, string>> = {
  ...basePageLabels,
  ...templateLabels,
};

const builderLayoutKeys = new Set<BuilderLayoutKey>([
  "home",
  "shop",
  "client",
  "product-single",
  "product-category",
  "product-category-specific",
  "search-results",
]);

function parseBuilderLayoutKey(value: string | null): BuilderLayoutKey | null {
  if (!value) return null;
  if (isBuilderCustomPageKey(value)) return value;
  return builderLayoutKeys.has(value as BuilderLayoutKey)
    ? (value as BuilderLayoutKey)
    : null;
}

function isBuilderCustomPageKey(value: string | null): value is BuilderCustomPageKey {
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

function getLayoutLabel(key: BuilderLayoutKey, customPages: BuilderCustomPage[]) {
  if (isBuilderCustomPageKey(key)) {
    return customPages.find((page) => page.key === key)?.title ?? "Custom Page";
  }

  return layoutLabels[key] ?? "Page";
}

function getFrontendUrlForBuilderKey(
  key: BuilderLayoutKey,
  customPages: BuilderCustomPage[]
) {
  if (key === "home") return "/";
  if (key === "shop") return "/shop";
  if (key === "client") return "/client";
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

const templateDescriptions: Record<BuilderTemplate, string> = {
  "product-single": "Default layout for every product detail page.",
  "product-category": "Default layout for product category archive pages.",
  "product-category-specific": "Override layout for one chosen product category.",
  "search-results": "Default layout for search result pages.",
};

const designPresets: Record<NonNullable<BuilderDesign["preset"]>, BuilderDesign> = {
  princity: {
    preset: "princity",
    colorScheme: "auto",
    pageBackground: "#f7f7f4",
    textColor: "#111111",
    mutedTextColor: "#5f5f58",
    accentColor: "#a4be7b",
    surfaceColor: "#efefe9",
    buttonBackground: "#111111",
    buttonTextColor: "#ffffff",
    radius: "8px",
    sectionMaxWidth: "1640px",
    sectionGutter: "48px",
    headingFontFamily: "inherit",
    headingSize: "clamp(42px, 8vw, 126px)",
    headingWeight: "760",
    headingLineHeight: "0.92",
  },
  editorial: {
    preset: "editorial",
    colorScheme: "auto",
    pageBackground: "#fbfbf8",
    textColor: "#161616",
    mutedTextColor: "#6a655d",
    accentColor: "#9b5c3d",
    surfaceColor: "#f0ece5",
    buttonBackground: "#2d2a26",
    buttonTextColor: "#ffffff",
    radius: "4px",
    sectionMaxWidth: "1520px",
    sectionGutter: "56px",
    headingFontFamily: "Georgia, serif",
    headingSize: "clamp(42px, 8vw, 126px)",
    headingWeight: "700",
    headingLineHeight: "0.96",
  },
  contrast: {
    preset: "contrast",
    colorScheme: "dark",
    pageBackground: "#101010",
    textColor: "#f7f7f1",
    mutedTextColor: "#c8c8be",
    accentColor: "#d7ff63",
    surfaceColor: "#24241f",
    buttonBackground: "#d7ff63",
    buttonTextColor: "#101010",
    radius: "10px",
    sectionMaxWidth: "1600px",
    sectionGutter: "48px",
    headingFontFamily: "inherit",
    headingSize: "clamp(42px, 8vw, 126px)",
    headingWeight: "760",
    headingLineHeight: "0.92",
  },
};

const defaultDesign = designPresets.princity;

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

function resolveSectionColorScheme(section: BuilderSection): Exclude<SectionColorScheme, "inherit"> {
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return section.colorScheme;
  }

  const readable = readableSchemeForColor(section.background);
  return readable === "inherit" ? "light" : readable;
}

function sectionColorModeLabel(section: BuilderSection) {
  const resolved = resolveSectionColorScheme(section);
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return resolved === "dark" ? "forced light text" : "forced dark text";
  }

  return resolved === "dark" ? "auto light text" : "auto dark text";
}

function readableSchemeForColor(color: string): SectionColorScheme {
  const match = color.trim().match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return "inherit";

  const [, r, g, b] = match;
  const luminance =
    (0.2126 * parseInt(r, 16) +
      0.7152 * parseInt(g, 16) +
      0.0722 * parseInt(b, 16)) /
    255;
  return luminance < 0.48 ? "dark" : "light";
}

const sectionBackgroundPresets = [
  { label: "White", value: "#ffffff", scheme: "light" },
  { label: "Soft", value: "#f7f7f4", scheme: "light" },
  { label: "Warm", value: "#f0ece5", scheme: "light" },
  { label: "Mint", value: "#eef5e8", scheme: "light" },
  { label: "Ink", value: "#111111", scheme: "dark" },
  { label: "Charcoal", value: "#24241f", scheme: "dark" },
] as const;

const defaultState: BuilderState = {
  page: "shop",
  targetType: "page",
  design: defaultDesign,
  sections: [
    {
      id: "hero-1",
      kind: "hero",
      title: "Shop",
      eyebrow: "New season",
      body: "A clean commerce layout controlled from the visual builder.",
      background: "#f7f7f4",
      backgroundMode: "full",
      contentMode: "boxed",
      colorScheme: "inherit",
      layout: "split",
      topSpacing: "medium",
      bottomSpacing: "medium",
      buttonLabel: "Shop now",
      buttonUrl: "/shop",
      visible: true,
    },
    {
      id: "recent-1",
      kind: "recentlyViewed",
      title: "Recently Viewed",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "full",
      colorScheme: "inherit",
      layout: "carousel",
      visible: true,
    },
    {
      id: "archive-1",
      kind: "productArchive",
      title: "All Products",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "full",
      colorScheme: "inherit",
      columns: 4,
      filterPosition: "left",
      cardStyle: "flat",
      cardPreset: "standard",
      gridGap: "large",
      cardPadding: "medium",
      imagePadding: "large",
      source: "all",
      gridLimit: 12,
      layoutVariant: "grid",
      visible: true,
    },
  ],
};

const defaultTemplateStates: Record<BuilderTemplate, BuilderState> = {
  "product-single": {
    page: "product-single",
    targetType: "template",
    template: "product-single",
    design: defaultDesign,
    sections: [
      {
        id: "template-product-hero",
        kind: "hero",
        title: "Product Detail Template",
        eyebrow: "WooCommerce product",
        body: "This template will be used for every single product page.",
        background: "#f7f7f4",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "split",
        topSpacing: "medium",
        bottomSpacing: "medium",
        buttonLabel: "Back to shop",
        buttonUrl: "/shop",
        visible: true,
      },
      {
        id: "template-product-layout",
        kind: "contentLayout",
        title: "Product Content",
        eyebrow: "Dynamic area",
        body: "Use this section to shape gallery, information, and related content zones.",
        background: "#ffffff",
        backgroundMode: "boxed",
        contentMode: "boxed",
        colorScheme: "inherit",
        layoutColumns: 2,
        layoutItems: [
          {
            id: "template-product-media",
            blocks: [
              {
                id: "template-product-gallery",
                kind: "productGallery",
                title: "Product Gallery",
                body: "Dynamic field: current product gallery.",
              },
            ],
          },
          {
            id: "template-product-summary",
            blocks: [
              {
                id: "template-product-title",
                kind: "productTitle",
                title: "Product Title",
                body: "Dynamic field: current product title.",
              },
              {
                id: "template-product-price",
                kind: "productPrice",
                title: "Product Price",
                body: "Dynamic field: current product price.",
              },
              {
                id: "template-product-cart",
                kind: "productAddToCart",
                title: "Add To Cart",
                body: "Dynamic WooCommerce add-to-cart button.",
              },
              {
                id: "template-product-attributes",
                kind: "productAttributes",
                title: "Product Attributes",
                body: "Dynamic field: size, color, material, and other attributes.",
              },
              {
                id: "template-product-description",
                kind: "productDescription",
                title: "Product Description",
                body: "Dynamic field: current product description.",
              },
            ],
          },
        ],
        visible: true,
      },
      {
        id: "template-product-recent",
        kind: "recentlyViewed",
        title: "Recently Viewed",
        background: "#ffffff",
        backgroundMode: "boxed",
        contentMode: "full",
        colorScheme: "inherit",
        layout: "carousel",
        visible: true,
      },
    ],
  },
  "product-category": {
    page: "product-category",
    targetType: "template",
    template: "product-category",
    design: defaultDesign,
    sections: [
      {
        id: "template-category-hero",
        kind: "hero",
        title: "Category Template",
        eyebrow: "WooCommerce category",
        body: "Default layout for every product category archive.",
        background: "#f7f7f4",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "split",
        topSpacing: "medium",
        bottomSpacing: "small",
        buttonLabel: "Shop all",
        buttonUrl: "/shop",
        visible: true,
      },
      {
        id: "template-category-products",
        kind: "productArchive",
        title: "Category Products",
        background: "#ffffff",
        backgroundMode: "boxed",
        contentMode: "full",
        colorScheme: "inherit",
        columns: 4,
        filterPosition: "left",
        cardStyle: "flat",
        cardPreset: "standard",
        source: "category",
        gridLimit: 12,
        layoutVariant: "grid",
        visible: true,
      },
    ],
  },
  "product-category-specific": {
    page: "product-category-specific",
    targetType: "template",
    template: "product-category-specific",
    design: defaultDesign,
    sections: [
      {
        id: "template-specific-category-hero",
        kind: "hero",
        title: "Specific Category Override",
        eyebrow: "Condition: choose category",
        body: "Use this when one category needs a unique campaign layout.",
        background: "#eef5e8",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "split",
        topSpacing: "medium",
        bottomSpacing: "medium",
        buttonLabel: "View collection",
        buttonUrl: "/shop",
        visible: true,
      },
      {
        id: "template-specific-category-products",
        kind: "productArchive",
        title: "Selected Category Products",
        background: "#ffffff",
        backgroundMode: "boxed",
        contentMode: "full",
        colorScheme: "inherit",
        columns: 3,
        filterPosition: "top",
        cardStyle: "flat",
        cardPreset: "editorial",
        source: "category",
        categoryId: "",
        gridLimit: 9,
        layoutVariant: "grid",
        visible: true,
      },
    ],
  },
  "search-results": {
    page: "search-results",
    targetType: "template",
    template: "search-results",
    design: defaultDesign,
    sections: [
      {
        id: "template-search-hero",
        kind: "hero",
        title: "Search Results",
        eyebrow: "Store search",
        body: "Template for search pages and product discovery results.",
        background: "#f7f7f4",
        backgroundMode: "full",
        contentMode: "boxed",
        colorScheme: "inherit",
        layout: "split",
        topSpacing: "medium",
        bottomSpacing: "small",
        visible: true,
      },
      {
        id: "template-search-products",
        kind: "productArchive",
        title: "Matching Products",
        background: "#ffffff",
        backgroundMode: "boxed",
        contentMode: "full",
        colorScheme: "inherit",
        columns: 4,
        filterPosition: "top",
        cardStyle: "flat",
        cardPreset: "standard",
        source: "all",
        gridLimit: 12,
        layoutVariant: "grid",
        visible: true,
      },
    ],
  },
};

function getDefaultStateForKey(key: BuilderLayoutKey): BuilderState {
  if (key in defaultTemplateStates) {
    return structuredClone(defaultTemplateStates[key as BuilderTemplate]);
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

function createId(kind: SectionKind) {
  return `${kind}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function createBlockId(kind: LayoutBlockKind) {
  return `${kind}-block-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function createLayoutBlock(kind: LayoutBlockKind): BuilderLayoutBlock {
  const id = createBlockId(kind);

  if (kind === "hero") {
    return {
      id,
      kind,
      eyebrow: "Featured",
      title: "Hero Element",
      body: "A strong visual opening with editable copy and action.",
      buttonLabel: "Learn more",
      buttonUrl: "/",
    };
  }

  if (kind === "promoStrip") {
    return {
      id,
      kind,
      eyebrow: "Offer",
      title: "Free delivery this week",
      body: "Use promo strips for offers, notices, and compact calls to action.",
      buttonLabel: "View offer",
      buttonUrl: "/shop",
    };
  }

  if (kind === "grid") {
    return {
      id,
      kind,
      title: "Grid",
      gridSource: "static",
      columns: 3,
      gridRows: 1,
      gridGap: "medium",
      gridMargin: "none",
      gridImagePadding: "frameless",
      gridContentPadding: "medium",
      gridImageFrame: "none",
      gridShowImage: true,
      gridShowEyebrow: true,
      gridShowMeta: true,
      gridShowText: true,
      gridShowButton: true,
      gridItems: [
        {
          id: `${id}-1`,
          eyebrow: "01",
          title: "Grid item one",
          meta: "Meta",
          text: "Map static or dynamic content into a reusable card.",
          buttonLabel: "Learn more",
          buttonUrl: "/",
        },
        {
          id: `${id}-2`,
          eyebrow: "02",
          title: "Grid item two",
          meta: "Meta",
          text: "Control columns, spacing, images, and content.",
          buttonLabel: "Learn more",
          buttonUrl: "/",
        },
        {
          id: `${id}-3`,
          eyebrow: "03",
          title: "Grid item three",
          meta: "Meta",
          text: "Later this can read posts, products, or custom fields.",
          buttonLabel: "Learn more",
          buttonUrl: "/",
        },
      ],
    };
  }

  if (kind === "panel") {
    return {
      id,
      kind,
      eyebrow: "Panel",
      title: "Content Panel",
      body: "Add image, title, text, and action in one flexible element.",
      buttonLabel: "Learn more",
      buttonUrl: "/",
      imageUrl: "",
      imageAlt: "",
    };
  }

  if (kind === "productHero") {
    return {
      id,
      kind,
      eyebrow: "Featured Product",
      title: "Product Hero",
      body: "Premium component: gallery, title, price, attributes, and purchase action from the current product.",
    };
  }

  if (kind === "productInfoStack") {
    return {
      id,
      kind,
      title: "Product Info Stack",
      body: "Premium component: current product summary with dynamic title, price, description, and cart button.",
    };
  }

  if (kind === "productPurchasePanel") {
    return {
      id,
      kind,
      title: "Purchase Panel",
      body: "Premium component: focused WooCommerce buy box for the current product.",
    };
  }

  if (kind === "productSpecsPanel") {
    return {
      id,
      kind,
      title: "Specs Panel",
      body: "Premium component: dynamic product attributes in a clean specification layout.",
    };
  }

  if (kind === "productGallery") {
    return {
      id,
      kind,
      title: "Product Gallery",
      body: "Dynamic field: current product gallery.",
      galleryShowThumbnails: true,
      galleryThumbnailPosition: "bottom",
      galleryImageFit: "contain",
      galleryHeight: 420,
    };
  }

  if (kind === "productTitle") {
    return {
      id,
      kind,
      title: "Product Title",
      body: "Dynamic field: current product title.",
    };
  }

  if (kind === "productPrice") {
    return {
      id,
      kind,
      title: "Product Price",
      body: "Dynamic field: current product price.",
    };
  }

  if (kind === "productAddToCart") {
    return {
      id,
      kind,
      title: "Add To Cart",
      body: "Dynamic WooCommerce add-to-cart button.",
    };
  }

  if (kind === "productAttributes") {
    return {
      id,
      kind,
      title: "Product Attributes",
      body: "Dynamic field: current product attributes.",
    };
  }

  if (kind === "productDescription") {
    return {
      id,
      kind,
      title: "Product Description",
      body: "Dynamic field: current product description.",
    };
  }

  if (kind === "slider") {
    return {
      id,
      kind,
      title: "Column Slider",
      body: "A real carousel block inside this column.",
      slides: [
        {
          id: `${id}-slide-1`,
          badge: "01",
          title: "First slide",
          text: "Edit this slider block from the column.",
          imagePadding: "medium",
        },
        {
          id: `${id}-slide-2`,
          badge: "02",
          title: "Second slide",
          text: "Use this for campaigns, features, or visual stories.",
          imagePadding: "medium",
        },
      ],
      carouselSettings: {
        variant: "basic",
        loop: true,
        autoplay: false,
        autoplayDelayMs: 5000,
        align: "start",
        dragFree: false,
        cardsPerView: 1,
        showArrows: true,
        showDots: true,
        pauseOnHover: true,
      },
    };
  }

  if (kind === "embed") {
    return {
      id,
      kind,
      title: "HTML Block",
      body: "Add a form, live chat, map, or trusted widget.",
      embedMode: "code",
      embedCode: "<div>Custom HTML block</div>",
      embedUrl: "",
      embedHeight: 260,
    };
  }

  if (kind === "fluentForm") {
    return {
      id,
      kind,
      title: "Contact Form",
      body: "Rendered from Fluent Forms in WordPress.",
      fluentFormId: "",
    };
  }

  if (kind === "badgeGrid") {
    return {
      id,
      kind,
      title: "Feature Badges",
      body: "Use badge blocks for services, promises, or compact feature rows.",
      columns: 2,
      badges: [
        { id: `${id}-badge-1`, label: "01", title: "Fast", body: "Reusable block settings." },
        { id: `${id}-badge-2`, label: "02", title: "Clean", body: "Flat, modern presentation." },
      ],
    };
  }

  if (kind === "icon") {
    return {
      id,
      kind,
      iconName: "sparkles",
      title: "Icon Feature",
      body: "Use a small visual cue for services, promises, or highlights.",
    };
  }

  if (kind === "list") {
    return {
      id,
      kind,
      title: "Feature List",
      items: ["Fast setup", "Reusable layouts", "Live visual editing"],
    };
  }

  if (kind === "datePicker") {
    return {
      id,
      kind,
      title: "Choose a date",
      dateLabel: "Preferred date",
      body: "Useful for delivery, booking, or consultation flows.",
    };
  }

  if (kind === "products") {
    return {
      id,
      kind,
      title: "Products",
      source: "all",
      layoutVariant: "grid",
      columns: 4,
      gridLimit: 12,
      filterPosition: "left",
      cardStyle: "flat",
      cardPreset: "standard",
    };
  }

  if (kind === "categoryFilters") {
    return {
      id,
      kind,
      title: "Category Filters",
      body: "Dynamic WooCommerce category pills.",
    };
  }

  if (kind === "breadcrumbs") {
    return {
      id,
      kind,
      title: "Breadcrumbs",
      body: "Dynamic navigation path for the current page.",
    };
  }

  return {
    id,
    kind: "text",
    eyebrow: "Text",
    title: "Text Block",
    body: "Add copy, buttons, and simple content inside this column.",
    buttonLabel: "",
    buttonUrl: "",
  };
}

function createSection(kind: SectionKind): BuilderSection {
  const base = {
    id: createId(kind),
    kind,
    title: sectionLabels[kind],
    background: "#ffffff",
    backgroundMode: "full" as SectionBackgroundMode,
    contentMode: "boxed" as SectionContentMode,
    colorScheme: "inherit" as SectionColorScheme,
    topSpacing: "inherit" as SectionSpacing,
    bottomSpacing: "inherit" as SectionSpacing,
    topMargin: "inherit" as SectionSpacing,
    bottomMargin: "inherit" as SectionSpacing,
    visible: true,
  };

  if (kind === "hero") {
    return {
      ...base,
      eyebrow: "Featured page",
      body: "Edit this section and preview the page instantly.",
      background: "#f7f7f4",
      backgroundMode: "full",
      contentMode: "boxed",
      layout: "split",
      buttonLabel: "Open shop",
      buttonUrl: "/shop",
    };
  }

  if (kind === "productArchive") {
    return {
      ...base,
      title: "Product Grid",
      columns: 4,
      backgroundMode: "boxed",
      contentMode: "full",
      filterPosition: "left",
      cardStyle: "flat",
      cardPreset: "standard",
      source: "all",
      gridLimit: 12,
      layoutVariant: "grid",
    };
  }

  if (kind === "filters") {
    return {
      ...base,
      title: "Category Filters",
      background: "#f5f5f3",
      backgroundMode: "boxed",
      contentMode: "full",
      filterPosition: "top",
    };
  }

  if (kind === "promo") {
    return {
      ...base,
      title: "Free setup for new clients",
      body: "Use promo strips for seasonal offers, service notes, or client messages.",
      background: "#111111",
      backgroundMode: "full",
      contentMode: "boxed",
      promoVariant: "default",
      ctaLabel: "View offer",
      ctaUrl: "/shop",
    };
  }

  if (kind === "slider") {
    return {
      ...base,
      title: "Featured Slider",
      body: "A swipeable section powered by the existing Embla carousel.",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "full",
      slides: [
        {
          id: "slide-1",
          badge: "New",
          title: "Modern commerce layouts",
          text: "Use sliders for hero stories, campaigns, or featured collections.",
          imageAlt: "Modern storefront slide",
          imagePadding: "medium",
          buttonLabel: "Shop now",
          buttonUrl: "/shop",
        },
        {
          id: "slide-2",
          badge: "Client",
          title: "Design per client",
          text: "Publish unique storefront sections without touching code.",
          imageAlt: "Client design slide",
          imagePadding: "medium",
          buttonLabel: "View page",
          buttonUrl: "/client",
        },
        {
          id: "slide-3",
          badge: "Fast",
          title: "Preview and publish",
          text: "Keep drafts local, then publish layout JSON when ready.",
          imageAlt: "Preview builder slide",
          imagePadding: "medium",
        },
      ],
      carouselSettings: {
        variant: "hero",
        loop: true,
        autoplay: true,
        autoplayDelayMs: 5000,
        align: "center",
        dragFree: false,
        cardsPerView: 1,
        showArrows: true,
        showDots: true,
        pauseOnHover: true,
      },
      visible: true,
    };
  }

  if (kind === "badgeGrid") {
    return {
      ...base,
      title: "Why clients choose us",
      eyebrow: "Highlights",
      body: "Badge grids match the ACF badge layout and work well for features, promises, or services.",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "full",
      columns: 3,
      badges: [
        {
          id: "badge-1",
          label: "01",
          title: "Client-specific design",
          body: "Create page personalities from the dashboard.",
        },
        {
          id: "badge-2",
          label: "02",
          title: "WooCommerce powered",
          body: "Products and attributes still come from WordPress.",
        },
        {
          id: "badge-3",
          label: "03",
          title: "Flat modern sections",
          body: "Keep layouts close to the clean Princity direction.",
        },
      ],
    };
  }

  if (kind === "contentLayout") {
    return {
      ...base,
      title: "Blank Layout",
      eyebrow: "Section",
      body: "",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "boxed",
      layoutColumns: 2,
      layoutItems: [
        {
          id: "layout-item-1",
          blocks: [],
        },
        {
          id: "layout-item-2",
          blocks: [],
        },
      ],
    };
  }

  if (kind === "embed") {
    return {
      ...base,
      title: "Embed / Code",
      eyebrow: "Function block",
      body: "Use this for live chat widgets, forms, maps, booking widgets, or trusted custom code.",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "boxed",
      embedMode: "iframe",
      embedUrl: "",
      embedCode: "",
      embedHeight: 420,
    };
  }

  return {
    ...base,
    title: "Recently Viewed",
    backgroundMode: "boxed",
    contentMode: "full",
    layout: "carousel",
  };
}

function createWireframeSection(columns: number, rows: number): BuilderSection {
  const safeColumns = Math.min(Math.max(columns, 1), 6);
  const safeRows = Math.min(Math.max(rows, 1), 4);
  return {
    ...createSection("contentLayout"),
    title: "",
    eyebrow: "",
    body: "",
    layoutColumns: safeColumns,
    layoutRows: safeRows,
    layoutItems: Array.from({ length: safeColumns * safeRows }, (_, index) => ({
      id: `layout-item-${Date.now().toString(36)}-${index + 1}`,
      blocks: [],
    })),
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
  fallbackKey: BuilderLayoutKey
): BuilderState {
  const key = state.page ?? fallbackKey;
  const isTemplate = key in defaultTemplateStates;
  const sections =
    key === "product-single"
      ? migrateProductTemplateSections(state.sections)
      : state.sections;
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
    if (section.kind !== "contentLayout") return section;

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

function createProductDynamicBlock(kind: Extract<LayoutBlockKind, `product${string}`>) {
  return {
    id: createBlockId(kind),
    kind,
    title: layoutBlockLabels[kind],
    body: `Dynamic field: ${layoutBlockLabels[kind].toLowerCase()}.`,
  };
}

function getLayoutBlockKindsForState() {
  return [...baseLayoutBlockKinds, ...productLayoutBlockKinds];
}

function loadDraftForKey(key: BuilderLayoutKey): BuilderState {
  if (typeof window === "undefined") return getDefaultStateForKey(key);

  try {
    const raw = window.localStorage.getItem(STORAGE_BY_KEY);
    if (!raw) return getDefaultStateForKey(key);
    const drafts = JSON.parse(raw) as Partial<Record<BuilderLayoutKey, BuilderState>>;
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

const elementBackgroundPresets = [
  { label: "White", value: "#ffffff" },
  { label: "Soft", value: "#f5f5f3" },
  { label: "Ink", value: "#111111" },
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
    attributes:
      product?.attributes?.nodes
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

export default function DashboardBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [builderState, setBuilderState] = useState<BuilderState>(defaultState);
  const [selectedId, setSelectedId] = useState(defaultState.sections[0]?.id ?? "");
  const [device, setDevice] = useState<PreviewDevice>("desktop");
  const [copied, setCopied] = useState(false);
  const [draftReady, setDraftReady] = useState(false);
  const [publishStatus, setPublishStatus] = useState("Local draft autosaves");
  const [publishCelebration, setPublishCelebration] = useState(false);
  const [uploadingSlide, setUploadingSlide] = useState<number | null>(null);
  const [uploadingNestedSlide, setUploadingNestedSlide] = useState<string | null>(
    null
  );
  const [openSlideId, setOpenSlideId] = useState<string | null>(null);
  const [openLayoutItemId, setOpenLayoutItemId] = useState<string | null>(null);
  const [selectedLayoutColumnKey, setSelectedLayoutColumnKey] = useState<string | null>(
    null
  );
  const [selectedLayoutBlockKey, setSelectedLayoutBlockKey] = useState<string | null>(
    null
  );
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [draggingLayoutBlockKey, setDraggingLayoutBlockKey] = useState<string | null>(
    null
  );
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>("content");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [adminPillVisible, setAdminPillVisible] = useState(true);
  const [sectionSettingsOpen, setSectionSettingsOpen] = useState(false);
  const [sectionStructureOpen, setSectionStructureOpen] = useState(false);
  const [globalStylesOpen, setGlobalStylesOpen] = useState(false);
  const [shellSettings, setShellSettings] =
    useState<BuilderShellSettings>(defaultShellSettings);
  const [shellStatus, setShellStatus] = useState("Shell settings load from React");
  const publishCelebrationTimer = useRef<number | null>(null);
  const shellAutoSaveTimer = useRef<number | null>(null);
  const [customPages, setCustomPages] = useState<BuilderCustomPage[]>([]);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [pageStatus, setPageStatus] = useState("Builder pages save to React");
  const [previewProducts, setPreviewProducts] = useState<ProductNode[]>([]);
  const [previewCategoryTree, setPreviewCategoryTree] = useState<CategoryTreeItem[]>([]);
  const [previewCategoryCounts, setPreviewCategoryCounts] = useState<Record<string, number>>({});
  const previewHeaderSlotRef = useRef<HTMLDivElement>(null);
  const previewShellRef = useRef<HTMLDivElement>(null);
  const undoHistoryRef = useRef<BuilderState[]>([]);
  const skipUndoCaptureRef = useRef(false);

  const selectedSection = useMemo(
    () => builderState.sections.find((section) => section.id === selectedId),
    [builderState.sections, selectedId]
  );
  const selectedLayoutBlock = useMemo(() => {
    if (!selectedSection || selectedSection.kind !== "contentLayout") return null;
    for (const item of selectedSection.layoutItems ?? []) {
      const block = (item.blocks ?? []).find(
        (entry, index) =>
          (entry.id ?? `${item.id ?? "layout-item"}-block-${index}`) ===
          selectedLayoutBlockKey
      );
      if (block) return block;
    }
    return null;
  }, [selectedLayoutBlockKey, selectedSection]);
  const availableLayoutBlockKinds = useMemo(
    () => getLayoutBlockKindsForState(),
    []
  );
  const currentFrontendUrl = useMemo(
    () => getFrontendUrlForBuilderKey(builderState.page, customPages),
    [builderState.page, customPages]
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
        2
      ),
    [builderState]
  );

  useEffect(() => {
    const draft = loadInitialState();
    let localPages: BuilderCustomPage[] = [];
    try {
      const rawPages = window.localStorage.getItem(STORAGE_CUSTOM_PAGES);
      localPages = rawPages
        ? (JSON.parse(rawPages) as BuilderCustomPage[]).filter((page) =>
            isBuilderCustomPageKey(page.key)
          )
        : [];
    } catch {
      localPages = [];
    }
    window.queueMicrotask(() => {
      setCustomPages(localPages);
      setBuilderState(draft);
      setSelectedId(draft.sections[0]?.id ?? "");
      setDraftReady(true);
    });
  }, []);

  useEffect(() => {
    const updatePreviewHeaderPill = () => {
      const pill = previewHeaderSlotRef.current?.querySelector<HTMLElement>(
        "#site-header-pill"
      );
      if (!pill) return;
      const shellScrollTop = previewShellRef.current?.scrollTop ?? 0;
      const isScrolled = Math.max(shellScrollTop, window.scrollY) > 56;
      pill.dataset.scrolled = isScrolled ? "true" : "false";
      pill.dataset.pillInit = "true";
    };

    const shell = previewShellRef.current;
    updatePreviewHeaderPill();
    shell?.addEventListener("scroll", updatePreviewHeaderPill, { passive: true });
    window.addEventListener("scroll", updatePreviewHeaderPill, { passive: true });

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
        const response = await fetch("/api/builder-pages", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          pages?: BuilderCustomPage[];
        };
        const pages = (payload.pages ?? []).filter((page) =>
          isBuilderCustomPageKey(page.key)
        );
        if (!cancelled) {
          setCustomPages(pages);
          window.localStorage.setItem(STORAGE_CUSTOM_PAGES, JSON.stringify(pages));
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
      searchParams.get("page") ?? searchParams.get("template")
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
    let cancelled = false;

    async function loadShellSettings() {
      try {
        const response = await fetch("/api/builder-shell", { cache: "no-store" });
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
        ? (JSON.parse(rawDrafts) as Partial<Record<BuilderLayoutKey, BuilderState>>)
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

    history.push(structuredClone(builderState));
    if (history.length > 80) history.shift();
  }, [builderState, draftReady]);

  const switchBuilderTarget = (
    nextKey: BuilderLayoutKey,
    options: { syncUrl?: boolean } = {}
  ) => {
    const nextState = loadDraftForKey(nextKey);
    undoHistoryRef.current = [structuredClone(nextState)];
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
        section.id === selectedId ? { ...section, ...patch } : section
      ),
    }));
  };

  const updateSectionById = (
    sectionId: string,
    patch: Partial<BuilderSection>
  ) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      ),
    }));
  };

  const updateLayoutBlockByKey = (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    patch: Partial<BuilderLayoutBlock>
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
                const currentBlockKey = block.id ?? `${itemKey}-block-${blockIndex}`;
                return currentBlockKey === blockKey ? { ...block, ...patch } : block;
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
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number]
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
                const currentBlockKey = block.id ?? `${itemKey}-block-${blockIndex}`;
                if (currentBlockKey !== blockKey) return block;
                const gridItems = [...(block.gridItems ?? [])];
                gridItems[itemIndex] = { ...(gridItems[itemIndex] ?? {}), ...patch };
                return { ...block, gridItems };
              }),
            };
          }),
        };
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

  const selectSection = (sectionId: string) => {
    const section = builderState.sections.find((item) => item.id === sectionId);
    setSelectedId(sectionId);
    setSelectedLayoutBlockKey(null);
    setInspectorOpen(true);
    setSectionSettingsOpen(true);
    setSectionStructureOpen(false);
    if (section?.kind === "contentLayout") {
      const firstColumn = section.layoutItems?.[0]?.id ?? null;
      setSelectedLayoutColumnKey((current) =>
        section.layoutItems?.some((item, index) => (item.id ?? `layout-item-${index}`) === current)
          ? current
          : firstColumn
      );
      setOpenLayoutItemId((current) =>
        section.layoutItems?.some((item, index) => (item.id ?? `layout-item-${index}`) === current)
          ? current
          : firstColumn
      );
    } else {
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
    }
  };

  const selectLayoutColumn = (sectionId: string, columnKey: string) => {
    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(null);
    setOpenLayoutItemId(columnKey);
    setInspectorOpen(true);
  };

  const selectLayoutBlock = (
    sectionId: string,
    columnKey: string,
    blockKey: string
  ) => {
    setSelectedId(sectionId);
    setSelectedLayoutColumnKey(columnKey);
    setSelectedLayoutBlockKey(blockKey);
    setOpenLayoutItemId(columnKey);
    setSectionStructureOpen(false);
    setInspectorTab("content");
    setInspectorOpen(true);
  };

  const updateSelectedSlide = (
    index: number,
    patch: NonNullable<BuilderSection["slides"]>[number]
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
      slides: (selectedSection.slides ?? []).filter((_, slideIndex) => slideIndex !== index),
    });
    if (slide?.id === openSlideId) {
      setOpenSlideId(null);
    }
  };

  const updateSelectedBadge = (
    index: number,
    patch: NonNullable<BuilderSection["badges"]>[number]
  ) => {
    if (!selectedSection) return;
    const badges = [...(selectedSection.badges ?? [])];
    badges[index] = { ...(badges[index] ?? {}), ...patch };
    updateSelected({ badges });
  };

  const getLayoutItemBlocks = (
    item: NonNullable<BuilderSection["layoutItems"]>[number]
  ) => {
    if (item.blocks?.length) return item.blocks;
    if (item.title || item.body || item.eyebrow || item.buttonLabel || item.buttonUrl) {
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

  const updateSelectedLayoutBlock = (
    columnIndex: number,
    blockIndex: number,
    patch: BuilderLayoutBlock
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
    patch: NonNullable<BuilderLayoutBlock["slides"]>[number]
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

  const addSelectedLayoutBlockSlide = (columnIndex: number, blockIndex: number) => {
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
    slideIndex: number
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
    patch: NonNullable<BuilderLayoutBlock["badges"]>[number]
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

  const addSelectedLayoutBlockBadge = (columnIndex: number, blockIndex: number) => {
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
    badgeIndex: number
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
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number]
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

  const addSelectedLayoutBlockGridItem = (columnIndex: number, blockIndex: number) => {
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
    itemIndex: number
  ) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    const blocks = [...getLayoutItemBlocks(item)];
    const block = blocks[blockIndex] ?? {};
    blocks[blockIndex] = {
      ...block,
      gridItems: (block.gridItems ?? []).filter((_, index) => index !== itemIndex),
    };
    layoutItems[columnIndex] = { ...item, blocks };
    updateSelected({ layoutItems });
  };

  const deleteSelectedLayoutBlock = (columnIndex: number, blockIndex: number) => {
    if (!selectedSection) return;
    const layoutItems = [...(selectedSection.layoutItems ?? [])];
    const item = layoutItems[columnIndex] ?? {};
    layoutItems[columnIndex] = {
      ...item,
      blocks: getLayoutItemBlocks(item).filter((_, index) => index !== blockIndex),
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
        if (section.id !== sectionId || section.kind !== "contentLayout") {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const columnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === columnKey
        );
        if (columnIndex < 0) return section;

        const item = layoutItems[columnIndex] ?? {};
        const blocks = [...getLayoutItemBlocks(item)];
        const blockIndex = blocks.findIndex(
          (block, index) => (block.id ?? `${columnKey}-block-${index}`) === blockKey
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
        if (section.id !== sectionId || section.kind !== "contentLayout") {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const columnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === columnKey
        );
        if (columnIndex < 0) return section;

        const item = layoutItems[columnIndex] ?? {};
        layoutItems[columnIndex] = {
          ...item,
          blocks: getLayoutItemBlocks(item).filter(
            (block, index) => (block.id ?? `${columnKey}-block-${index}`) !== blockKey
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
    sourceColumnKey,
    sourceBlockKey,
    targetColumnKey,
    targetBlockKey,
  }: {
    sectionId: string;
    sourceColumnKey: string;
    sourceBlockKey: string;
    targetColumnKey: string;
    targetBlockKey?: string;
  }) => {
    setBuilderState((current) => ({
      ...current,
      sections: current.sections.map((section) => {
        if (section.id !== sectionId || section.kind !== "contentLayout") {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const sourceColumnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === sourceColumnKey
        );
        const targetColumnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === targetColumnKey
        );

        if (sourceColumnIndex < 0 || targetColumnIndex < 0) return section;

        const sourceItem = layoutItems[sourceColumnIndex] ?? {};
        const sourceBlocks = [...getLayoutItemBlocks(sourceItem)];
        const sourceBlockIndex = sourceBlocks.findIndex(
          (block, index) =>
            (block.id ?? `${sourceColumnKey}-block-${index}`) === sourceBlockKey
        );

        if (sourceBlockIndex < 0) return section;

        const [movingBlock] = sourceBlocks.splice(sourceBlockIndex, 1);
        if (!movingBlock) return section;

        if (sourceColumnIndex === targetColumnIndex) {
          const targetIndex = targetBlockKey
            ? sourceBlocks.findIndex(
                (block, index) =>
                  (block.id ?? `${targetColumnKey}-block-${index}`) === targetBlockKey
              )
            : -1;
          sourceBlocks.splice(targetIndex >= 0 ? targetIndex : sourceBlocks.length, 0, movingBlock);
          layoutItems[sourceColumnIndex] = { ...sourceItem, blocks: sourceBlocks };
        } else {
          const targetItem = layoutItems[targetColumnIndex] ?? {};
          const targetBlocks = [...getLayoutItemBlocks(targetItem)];
          const targetIndex = targetBlockKey
            ? targetBlocks.findIndex(
                (block, index) =>
                  (block.id ?? `${targetColumnKey}-block-${index}`) === targetBlockKey
              )
            : -1;

          layoutItems[sourceColumnIndex] = { ...sourceItem, blocks: sourceBlocks };
          targetBlocks.splice(targetIndex >= 0 ? targetIndex : targetBlocks.length, 0, movingBlock);
          layoutItems[targetColumnIndex] = { ...targetItem, blocks: targetBlocks };
        }

        return { ...section, layoutItems };
      }),
    }));

    setSelectedId(sectionId);
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
        if (section.id !== sectionId || section.kind !== "contentLayout") {
          return section;
        }

        const layoutItems = [...(section.layoutItems ?? [])];
        const targetColumnIndex = layoutItems.findIndex(
          (item, index) => (item.id ?? `layout-item-${index}`) === targetColumnKey
        );
        if (targetColumnIndex < 0) return section;

        const targetItem = layoutItems[targetColumnIndex] ?? {};
        const targetBlocks = [...getLayoutItemBlocks(targetItem)];
        const targetIndex = targetBlockKey
          ? targetBlocks.findIndex(
              (item, index) =>
                (item.id ?? `${targetColumnKey}-block-${index}`) === targetBlockKey
            )
          : -1;

        targetBlocks.splice(targetIndex >= 0 ? targetIndex : targetBlocks.length, 0, block);
        layoutItems[targetColumnIndex] = { ...targetItem, blocks: targetBlocks };

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

    if (!targetSection || targetSection.kind !== "contentLayout") {
      const nextSection = createWireframeSection(1, 1);
      setBuilderState((current) => {
        const selectedIndex = current.sections.findIndex(
          (section) => section.id === selectedId
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
          (item.id ?? `layout-item-${index}`) === selectedLayoutColumnKey
      ) ?? layoutItems[0];
    const targetColumnIndex = layoutItems.findIndex((item) => item === targetColumn);
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
      layoutColumns: Math.min(Math.max(selectedSection.layoutColumns ?? 2, 1), 6),
    });
    setOpenLayoutItemId(id);
  };

  const deleteSelectedLayoutItem = (index: number) => {
    if (!selectedSection) return;
    const item = selectedSection.layoutItems?.[index];
    updateSelected({
      layoutItems: (selectedSection.layoutItems ?? []).filter(
        (_, itemIndex) => itemIndex !== index
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
    file: File | null
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
      const block = layoutItem ? getLayoutItemBlocks(layoutItem)[blockIndex] : undefined;
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
    file: File | null
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
      const payload = (await response.json()) as { url?: string; error?: string };
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
    placement: "above" | "below"
  ) => {
    const nextSection = createWireframeSection(columns, rows);
    setBuilderState((current) => {
      const targetIndex = current.sections.findIndex(
        (section) => section.id === targetSectionId
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
    if (nextSection.kind === "contentLayout") {
      const firstColumn = nextSection.layoutItems?.[0]?.id ?? null;
      setSelectedLayoutColumnKey(firstColumn);
      setOpenLayoutItemId(firstColumn);
      setSelectedLayoutBlockKey(null);
    } else {
      setSelectedLayoutColumnKey(null);
      setSelectedLayoutBlockKey(null);
    }
  };

  const moveSelected = (direction: -1 | 1) => {
    moveSection(selectedId, direction);
  };

  const moveSection = (sectionId: string, direction: -1 | 1) => {
    setBuilderState((current) => {
      const index = current.sections.findIndex((section) => section.id === sectionId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.sections.length) return current;
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
      const sourceIndex = current.sections.findIndex((section) => section.id === sourceId);
      const targetIndex = current.sections.findIndex((section) => section.id === targetId);
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
      (section) => section.id === sectionId
    );
    if (!sourceSection) return;
    const copySection = {
      ...(JSON.parse(JSON.stringify(sourceSection)) as BuilderSection),
      id: createId(sourceSection.kind),
      title: `${sourceSection.title} Copy`,
    };
    setBuilderState((current) => {
      const index = current.sections.findIndex((section) => section.id === sectionId);
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
      (section) => section.id === sectionId
    );
    const nextSections = builderState.sections.filter(
      (section) => section.id !== sectionId
    );
    const nextSelected =
      nextSections[Math.max(0, Math.min(removedIndex, nextSections.length - 1))]?.id ??
      "";
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

    history.pop();
    const nextState = structuredClone(history[history.length - 1]);
    skipUndoCaptureRef.current = true;
    setBuilderState(nextState);
    setSelectedId(nextState.sections[0]?.id ?? "");
    setSelectedLayoutColumnKey(null);
    setSelectedLayoutBlockKey(null);
    setPublishStatus("Undid last change");
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(builderJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  const loadPublishedLayout = async () => {
    setPublishStatus("Reading published layout...");
    const response = await fetch(`/api/builder-layouts?key=${builderState.page}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      setPublishStatus("Could not read published layout");
      return;
    }

    const payload = (await response.json()) as {
      layout?: BuilderState | null;
    };

    if (!payload.layout?.sections?.length) {
      setPublishStatus("No published layout yet");
      return;
    }

    setBuilderState({
      page: payload.layout.page,
      targetType: payload.layout.targetType ?? builderState.targetType ?? "page",
      template: payload.layout.template,
      design: {
        ...defaultDesign,
        ...(payload.layout.design ?? {}),
      },
      sections: payload.layout.sections,
    });
    setSelectedId(payload.layout.sections[0]?.id ?? "");
    setPublishStatus("Published layout loaded");
  };

  useEffect(() => {
    if (!draftReady) return;
    void loadPublishedLayout();
    // Published content is the source of truth when switching editable targets.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [builderState.page, draftReady]);

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

    setPublishStatus("Published layout saved");
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
    status = "Global settings saved"
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
    window.localStorage.setItem(STORAGE_CUSTOM_PAGES, JSON.stringify(nextPages));
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
    const response = await fetch(`/api/builder-pages?key=${encodeURIComponent(key)}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setPageStatus("Page delete failed");
      return;
    }

    const nextPages = customPages.filter((page) => page.key !== key);
    setCustomPages(nextPages);
    window.localStorage.setItem(STORAGE_CUSTOM_PAGES, JSON.stringify(nextPages));

    try {
      const rawDrafts = window.localStorage.getItem(STORAGE_BY_KEY);
      const drafts = rawDrafts
        ? (JSON.parse(rawDrafts) as Partial<Record<BuilderLayoutKey, BuilderState>>)
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

  return (
    <div className={`builder-dashboard ${inspectorOpen ? "" : "is-inspector-closed"}`}>
      <aside className="builder-sidebar builder-panel">
        <div className="builder-brand">
          <span className="builder-brand-icon">
            <Sparkles size={18} />
          </span>
          <span>
            <strong>Visual Builder</strong>
            <small>React storefront layouts</small>
          </span>
        </div>

        <div className="builder-target-toggle" aria-label="Builder target type">
          {(["page", "template"] as BuilderTargetType[]).map((targetType) => (
            <button
              key={targetType}
              type="button"
              className={
                (builderState.targetType ?? "page") === targetType ? "is-active" : ""
              }
              onClick={() =>
                switchBuilderTarget(targetType === "page" ? "shop" : "product-single")
              }
            >
              {targetType === "page" ? "Pages" : "Templates"}
            </button>
          ))}
        </div>

        <div className="builder-sidebar-controls">
          <button
            type="button"
            className={`builder-secondary-button builder-full-button builder-global-styles-button ${
              globalStylesOpen ? "is-active" : ""
            }`}
            onClick={() => setGlobalStylesOpen((value) => !value)}
          >
            <Settings2 size={16} />
            Global Styles
          </button>

          <div className="builder-device-toggle" aria-label="Preview device">
            {(["desktop", "tablet", "mobile"] as PreviewDevice[]).map((item) => (
              <button
                key={item}
                type="button"
                className={device === item ? "is-active" : ""}
                onClick={() => setDevice(item)}
                title={`${item} preview`}
              >
                <MonitorSmartphone size={16} />
              </button>
            ))}
          </div>

        </div>
        <small className="builder-sidebar-status">{publishStatus}</small>

        {(builderState.targetType ?? "page") === "template" && (
          <label className="builder-field">
            <span>Editing Template</span>
            <select
              value={builderState.page}
              onChange={(event) =>
                switchBuilderTarget(event.target.value as BuilderLayoutKey)
              }
            >
              {Object.entries(templateLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        )}

        {(builderState.targetType ?? "page") === "page" && (
          <div className="builder-card builder-pages-card">
            <div className="builder-card-title">
              <strong>Builder Pages</strong>
              <span>{customPages.length}</span>
            </div>
            <div className="builder-page-create">
              <input
                type="text"
                value={newPageTitle}
                onChange={(event) => setNewPageTitle(event.target.value)}
                placeholder="Page title"
              />
              <button
                type="button"
                className="builder-icon-button"
                onClick={createBuilderPage}
                aria-label="Create builder page"
              >
                <Plus size={15} />
              </button>
            </div>
            {customPages.length > 0 && (
              <div className="builder-pages-list">
                {customPages.map((page) => (
                  <div
                    key={page.key}
                    className={`builder-page-row${
                      builderState.page === page.key ? " is-active" : ""
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => switchBuilderTarget(page.key)}
                    >
                      <strong>{page.title}</strong>
                      <span>/{page.slug}</span>
                    </button>
                    <button
                      type="button"
                      className="builder-icon-button"
                      onClick={() => deleteBuilderPage(page.key)}
                      aria-label={`Delete ${page.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <small>{pageStatus}</small>
          </div>
        )}

        {(builderState.targetType ?? "page") === "template" && builderState.template && (
          <div className="builder-template-note">
            <strong>{templateLabels[builderState.template]}</strong>
            <span>{templateDescriptions[builderState.template]}</span>
          </div>
        )}

        <details className="builder-collapse" open>
          <summary>
            <span>Element Library</span>
            <small>Drag</small>
          </summary>

          <div className="builder-element-library" aria-label="Element library">
          {layoutBlockGroups.map((group) => {
            const groupKinds = group.kinds.filter((kind) =>
              availableLayoutBlockKinds.includes(kind)
            );
            if (!groupKinds.length) return null;

            return (
              <div key={group.id} className="builder-element-library-group">
                <div className="builder-element-library-group-title">
                  {group.label}
                </div>
                {groupKinds.map((blockKind) => (
                  <button
                    key={blockKind}
                    type="button"
                    draggable
                    onClick={() => addElementFromLibrary(blockKind)}
                    onDragStart={(event) => {
                      event.dataTransfer.setData(
                        "application/x-builder-new-block",
                        blockKind
                      );
                      event.dataTransfer.setData(
                        "text/plain",
                        `builder-new-block:${blockKind}`
                      );
                      event.dataTransfer.effectAllowed = "copy";
                    }}
                  >
                    <span className="builder-element-library-icon">
                      {getLayoutBlockLibraryIcon(blockKind)}
                    </span>
                    <span>
                      <strong>{layoutBlockLabels[blockKind]}</strong>
                      <small>{layoutBlockDescriptions[blockKind]}</small>
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
          </div>
        </details>
      </aside>

      <main className="builder-workspace">
        {globalStylesOpen && (
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
                        event.target.value as NonNullable<BuilderDesign["preset"]>
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
                        updateDesign({ radius: event.target.value, preset: undefined })
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
                    <option value='"Times New Roman", serif'>Times serif</option>
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
                      updateShellSettings({ headerVisible: event.target.checked })
                    }
                  />
                  <span>Show website header</span>
                </label>

                <label className="builder-field">
                  <span>Header Layout</span>
                  <select
                    value={shellSettings.headerLayout}
                    onChange={(event) =>
                      updateShellSettings({
                        headerLayout: event.target.value as BuilderHeaderLayout,
                      })
                    }
                  >
                    <option value="wordpress">Use WordPress setting</option>
                    <option value="princity">Princity flat</option>
                    <option value="pill">Pill on scroll</option>
                    <option value="two-row">Two row</option>
                    <option value="simple">Simple</option>
                    <option value="hero">Hero</option>
                  </select>
                </label>

                <div className="builder-shell-note">
                  <strong>{shellStatus}</strong>
                  <span>
                    New sections inherit these spacing defaults until you override
                    them inside a section.
                  </span>
                </div>

                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Default Top Padding</span>
                    <select
                      value={shellSettings.sectionPaddingTop}
                      onChange={(event) =>
                        updateShellSettings({
                          sectionPaddingTop:
                            event.target.value as GlobalSectionSpacing,
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Default Bottom Padding</span>
                    <select
                      value={shellSettings.sectionPaddingBottom}
                      onChange={(event) =>
                        updateShellSettings({
                          sectionPaddingBottom:
                            event.target.value as GlobalSectionSpacing,
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </label>
                </div>

                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Default Top Margin</span>
                    <select
                      value={shellSettings.sectionMarginTop}
                      onChange={(event) =>
                        updateShellSettings({
                          sectionMarginTop: event.target.value as GlobalSectionSpacing,
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Default Bottom Margin</span>
                    <select
                      value={shellSettings.sectionMarginBottom}
                      onChange={(event) =>
                        updateShellSettings({
                          sectionMarginBottom:
                            event.target.value as GlobalSectionSpacing,
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </label>
                </div>

                <button
                  type="button"
                  className="builder-secondary-button builder-full-button"
                  onClick={publishShellSettings}
                >
                  <CloudUpload size={16} />
                  Publish Global Settings
                </button>
              </div>
            </div>
          </section>
        )}
        {publishCelebration && (
          <div className="builder-publish-celebration" role="status" aria-live="polite">
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
          className={`builder-preview-shell builder-preview-${device}`}
        >
          <PreviewCanvas
            sections={builderState.sections}
            previewProducts={previewProducts}
            previewCategoryTree={previewCategoryTree}
            previewCategoryCounts={previewCategoryCounts}
            pageLabel={getLayoutLabel(builderState.page, customPages)}
            design={builderState.design}
            shellSettings={shellSettings}
            selectedId={selectedId}
            selectedLayoutColumnKey={selectedLayoutColumnKey}
            selectedLayoutBlockKey={selectedLayoutBlockKey}
            draggingSectionId={draggingSectionId}
            draggingLayoutBlockKey={draggingLayoutBlockKey}
            onSelect={selectSection}
            onSelectColumn={selectLayoutColumn}
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
            onUpdateSection={updateSectionById}
            onUpdateBlock={updateLayoutBlockByKey}
            onUpdateGridItem={updateGridItemByKey}
            onUploadGridItemImage={uploadGridItemImage}
            onAddWireframe={addWireframeNear}
            onMoveSection={moveSection}
            onDuplicateSection={duplicateSection}
            onDeleteSection={deleteSection}
            headerSlotRef={previewHeaderSlotRef}
          />
        </div>
      </main>

      {adminPillVisible ? (
        <div className="builder-admin-pill" aria-label="Builder page actions">
          <div>
            <strong>Builder</strong>
            <span>{getLayoutLabel(builderState.page, customPages)}</span>
          </div>
          <button
            type="button"
            onClick={undoBuilder}
            title="Undo last change"
          >
            <Undo2 size={15} />
            Undo
          </button>
          <button
            type="button"
            onClick={() => setInspectorOpen((current) => !current)}
            aria-label={inspectorOpen ? "Close inspector" : "Open inspector"}
          >
            {inspectorOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            Inspector
          </button>
          <button
            type="button"
            onClick={() => {
              window.open(currentFrontendUrl, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink size={15} />
            View Page
          </button>
          <button type="button" className="is-primary" onClick={publishLayout}>
            <CloudUpload size={15} />
            Publish
          </button>
          <button
            type="button"
            onClick={() => setAdminPillVisible(false)}
            aria-label="Hide builder toolbar"
          >
            <X size={15} />
          </button>
        </div>
      ) : (
        <button
          className="builder-admin-pill-toggle"
          type="button"
          onClick={() => setAdminPillVisible(true)}
          aria-label="Show builder toolbar"
        >
          <Settings2 size={16} />
          <span>Builder</span>
        </button>
      )}

      <aside className={`builder-inspector builder-panel ${inspectorOpen ? "is-open" : ""}`}>
        <div className="builder-inspector-header">
          <Settings2 size={18} />
          <span>{selectedLayoutBlock ? "Element Settings" : "Section Settings"}</span>
          <button
            type="button"
            className="builder-inspector-close"
            onClick={() => setInspectorOpen(false)}
            aria-label="Close inspector"
          >
            <PanelRightClose size={16} />
          </button>
        </div>
        {selectedSection ? (
          <>
            <div className="builder-inspector-context">
              <strong>{selectedLayoutBlock ? "Element" : "Section"}</strong>
              <span>
                {selectedLayoutBlock
                  ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
                  : sectionLabels[selectedSection.kind]}
              </span>
              {selectedLayoutBlock && (
                <button
                  type="button"
                  onClick={() => setSelectedLayoutBlockKey(null)}
                >
                  Back to section
                </button>
              )}
            </div>
            {!selectedLayoutBlock && (
              <div className="builder-inspector-tabs" aria-label="Inspector tabs">
                {[
                  ["content", "Content"],
                  ["style", "Style"],
                  ["manage", "Manage"],
                ].map(([tab, label]) => (
                  <button
                    key={tab}
                    type="button"
                    className={inspectorTab === tab ? "is-active" : ""}
                    onClick={() => setInspectorTab(tab as InspectorTab)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {!selectedLayoutBlock && <div className="builder-actions-row">
              <button type="button" onClick={() => moveSelected(-1)} title="Move up">
                <ArrowUp size={15} />
              </button>
              <button type="button" onClick={() => moveSelected(1)} title="Move down">
                <ArrowDown size={15} />
              </button>
              <button type="button" onClick={duplicateSelected} title="Duplicate">
                <Copy size={15} />
              </button>
              <button type="button" onClick={deleteSelected} title="Delete">
                <Trash2 size={15} />
              </button>
            </div>}

            {(!selectedLayoutBlock || selectedSection.kind === "contentLayout") && (
              <details
                className={`builder-collapse builder-section-settings-toggle ${
                  selectedLayoutBlock ? "is-element-focus" : ""
                }`}
                open={selectedLayoutBlock ? true : sectionSettingsOpen}
                onToggle={(event) =>
                  !selectedLayoutBlock &&
                  setSectionSettingsOpen((event.currentTarget as HTMLDetailsElement).open)
                }
              >
                <summary>
                  <span>{selectedLayoutBlock ? "Element Settings" : "Section Settings"}</span>
                  <small>
                    {selectedLayoutBlock || sectionSettingsOpen ? "open" : "closed"}
                  </small>
                </summary>
              {inspectorTab === "content" &&
                !selectedLayoutBlock &&
                selectedSection.kind !== "contentLayout" && (
                <>
                <details className="builder-collapse" open>
                  <summary>
                    <span>Basic Content</span>
                    <small>{sectionLabels[selectedSection.kind]}</small>
                  </summary>

                  <label className="builder-field">
                    <span>Section Title</span>
                    <input
                      value={selectedSection.title}
                      onChange={(event) =>
                        updateSelected({ title: event.target.value })
                      }
                    />
                  </label>

                  <label className="builder-field">
                    <span>Eyebrow</span>
                    <input
                      value={selectedSection.eyebrow ?? ""}
                      onChange={(event) =>
                        updateSelected({ eyebrow: event.target.value })
                      }
                    />
                  </label>
                </details>
                </>
              )}

            {inspectorTab === "style" && !selectedLayoutBlock && (
              <>
                <details className="builder-collapse" open>
                  <summary>
                    <span>Background</span>
                    <small>{selectedSection.backgroundMode ?? "full"}</small>
                  </summary>

                  <label className="builder-field">
                    <span>Background</span>
                    <div className="builder-background-presets">
                      {sectionBackgroundPresets.map((preset) => (
                        <button
                          key={preset.value}
                          type="button"
                          className={
                            selectedSection.background?.toLowerCase() ===
                            preset.value
                              ? "is-active"
                              : ""
                          }
                          onClick={() =>
                      updateSelected({
                        background: preset.value,
                        colorScheme: "inherit",
                      })
                          }
                          title={preset.label}
                        >
                          <span style={{ background: preset.value }} />
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <div className="builder-color-row">
                      <input
                        type="color"
                        value={selectedSection.background}
                        onChange={(event) =>
                          updateSelected({
                            background: event.target.value,
                            colorScheme: "inherit",
                          })
                        }
                      />
                      <input
                        value={selectedSection.background}
                        onChange={(event) =>
                          updateSelected({
                            background: event.target.value,
                            colorScheme: "inherit",
                          })
                        }
                      />
                    </div>
                  </label>
                </details>

                <details className="builder-collapse" open>
                  <summary>
                    <span>Layout Widths</span>
                    <small>{selectedSection.contentMode ?? "boxed"}</small>
                  </summary>

                  <label className="builder-field">
                    <span>Background Width</span>
                    <select
                      value={selectedSection.backgroundMode ?? "full"}
                      onChange={(event) =>
                        updateSelected({
                          backgroundMode: event.target
                            .value as SectionBackgroundMode,
                        })
                      }
                    >
                      <option value="full">Full width</option>
                      <option value="boxed">Boxed</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Content Width</span>
                    <select
                      value={selectedSection.contentMode ?? "boxed"}
                      onChange={(event) =>
                        updateSelected({
                          contentMode: event.target.value as SectionContentMode,
                        })
                      }
                    >
                      <option value="full">Full</option>
                      <option value="boxed">Boxed</option>
                      <option value="narrow">Narrow</option>
                    </select>
                  </label>
                </details>

                <details className="builder-collapse" open>
                  <summary>
                    <span>Color & Spacing</span>
                    <small>{sectionColorModeLabel(selectedSection)}</small>
                  </summary>

                  <label className="builder-field">
                    <span>Section Color Mode</span>
                    <select
                      value={selectedSection.colorScheme ?? "inherit"}
                      onChange={(event) =>
                        updateSelected({
                          colorScheme: event.target.value as SectionColorScheme,
                        })
                      }
                    >
                      <option value="inherit">Auto by background</option>
                      <option value="light">Dark text for light background</option>
                      <option value="dark">Light text for dark background</option>
                    </select>
                  </label>

                  <div className="builder-contrast-note">
                    <strong>{sectionColorModeLabel(selectedSection)}</strong>
                    <span>
                      Auto keeps text readable against this section background.
                      Use Light or Dark only when you want to force the look.
                    </span>
                  </div>

                  <div className="builder-two-column">
                    <label className="builder-field">
                      <span>Top Padding</span>
                      <select
                        value={selectedSection.topSpacing ?? "inherit"}
                        onChange={(event) =>
                          updateSelected({
                            topSpacing: event.target.value as SectionSpacing,
                          })
                        }
                      >
                        <option value="inherit">Use global</option>
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </label>

                    <label className="builder-field">
                      <span>Bottom Padding</span>
                      <select
                        value={selectedSection.bottomSpacing ?? "inherit"}
                        onChange={(event) =>
                          updateSelected({
                            bottomSpacing: event.target.value as SectionSpacing,
                          })
                        }
                      >
                        <option value="inherit">Use global</option>
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </label>
                  </div>

                  <div className="builder-two-column">
                    <label className="builder-field">
                      <span>Top Margin</span>
                      <select
                        value={selectedSection.topMargin ?? "inherit"}
                        onChange={(event) =>
                          updateSelected({
                            topMargin: event.target.value as SectionSpacing,
                          })
                        }
                      >
                        <option value="inherit">Use global</option>
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </label>

                    <label className="builder-field">
                      <span>Bottom Margin</span>
                      <select
                        value={selectedSection.bottomMargin ?? "inherit"}
                        onChange={(event) =>
                          updateSelected({
                            bottomMargin: event.target.value as SectionSpacing,
                          })
                        }
                      >
                        <option value="inherit">Use global</option>
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </label>
                  </div>
                </details>
              </>
            )}

              {inspectorTab === "content" &&
              selectedSection.kind !== "hero" &&
              selectedSection.kind !== "promo" && (
              <details className="builder-collapse" open>
                <summary>
                  <span>{selectedLayoutBlock ? "Element Content" : "Section Type Options"}</span>
                  <small>
                    {selectedLayoutBlock
                      ? layoutBlockLabels[selectedLayoutBlock.kind ?? "text"]
                      : sectionLabels[selectedSection.kind]}
                  </small>
                </summary>

            {selectedSection.kind === "productArchive" && (
              <>
                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Source</span>
                    <select
                      value={selectedSection.source ?? "all"}
                      onChange={(event) =>
                        updateSelected({
                          source: event.target.value as BuilderSection["source"],
                        })
                      }
                    >
                      <option value="all">All products</option>
                      <option value="featured">Featured</option>
                  <option value="category">Category</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Layout Variant</span>
                    <select
                      value={selectedSection.layoutVariant ?? "grid"}
                      onChange={(event) =>
                        updateSelected({
                          layoutVariant: event.target
                            .value as BuilderSection["layoutVariant"],
                        })
                      }
                    >
                      <option value="grid">Grid</option>
                      <option value="carousel">Carousel</option>
                    </select>
                  </label>
                </div>

                {selectedSection.source === "category" && (
                  <label className="builder-field">
                    <span>Category Slug / ID</span>
                    <input
                      value={selectedSection.categoryId ?? ""}
                      onChange={(event) =>
                        updateSelected({ categoryId: event.target.value })
                      }
                    />
                  </label>
                )}

                <label className="builder-field">
                  <span>Columns</span>
                  <input
                    type="number"
                    min={2}
                    max={6}
                    value={selectedSection.columns ?? 4}
                    onChange={(event) =>
                      updateSelected({ columns: Number(event.target.value) })
                    }
                  />
                </label>

                <label className="builder-field">
                  <span>Grid Limit / Page Size</span>
                  <input
                    type="number"
                    min={4}
                    max={48}
                    value={selectedSection.gridLimit ?? 12}
                    onChange={(event) =>
                      updateSelected({ gridLimit: Number(event.target.value) })
                    }
                  />
                </label>

                <label className="builder-field">
                  <span>Filter Position</span>
                  <select
                    value={selectedSection.filterPosition ?? "left"}
                    onChange={(event) =>
                      updateSelected({
                        filterPosition: event.target.value as BuilderSection["filterPosition"],
                      })
                    }
                  >
                    <option value="left">Left sidebar</option>
                    <option value="top">Top pills</option>
                    <option value="drawer">Drawer</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </label>

                <label className="builder-field">
                  <span>Card Style</span>
                  <select
                    value={selectedSection.cardStyle ?? "flat"}
                    onChange={(event) =>
                      updateSelected({
                        cardStyle: event.target.value as BuilderSection["cardStyle"],
                      })
                    }
                  >
                    <option value="flat">Flat</option>
                    <option value="soft">Soft</option>
                    <option value="lined">Lined</option>
                  </select>
                </label>

                <label className="builder-field">
                  <span>Card Preset</span>
                  <select
                    value={selectedSection.cardPreset ?? "standard"}
                    onChange={(event) =>
                      updateSelected({
                        cardPreset: event.target
                          .value as BuilderSection["cardPreset"],
                      })
                    }
                  >
                    <option value="standard">Standard</option>
                    <option value="graph">Graph Clean</option>
                    <option value="gallery">Gallery</option>
                    <option value="editorial">Editorial</option>
                    <option value="compact">Compact</option>
                    <option value="minimal">Minimal</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </label>

                <div className="builder-two-column">
                  <label className="builder-field">
                    <span>Grid Gap</span>
                    <select
                      value={selectedSection.gridGap ?? "large"}
                      onChange={(event) =>
                        updateSelected({
                          gridGap: event.target.value as BuilderSection["gridGap"],
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="max">Max</option>
                    </select>
                  </label>

                  <label className="builder-field">
                    <span>Card Padding</span>
                    <select
                      value={selectedSection.cardPadding ?? "medium"}
                      onChange={(event) =>
                        updateSelected({
                          cardPadding: event.target
                            .value as BuilderSection["cardPadding"],
                        })
                      }
                    >
                      <option value="none">None</option>
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="max">Max</option>
                    </select>
                  </label>
                </div>

                <label className="builder-field">
                  <span>Image Padding</span>
                  <select
                    value={selectedSection.imagePadding ?? "large"}
                    onChange={(event) =>
                      updateSelected({
                        imagePadding: event.target
                          .value as BuilderSection["imagePadding"],
                      })
                    }
                  >
                    <option value="none">Frameless</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="max">Max</option>
                  </select>
                </label>
              </>
            )}

            {selectedSection.kind === "badgeGrid" && (
              <>
                <label className="builder-field">
                  <span>Columns</span>
                  <input
                    type="number"
                    min={2}
                    max={4}
                    value={selectedSection.columns ?? 3}
                    onChange={(event) =>
                      updateSelected({ columns: Number(event.target.value) })
                    }
                  />
                </label>

                <div className="builder-section-heading">
                  <span>Badges</span>
                  <span>{selectedSection.badges?.length ?? 0}</span>
                </div>

                {(selectedSection.badges ?? []).map((badge, index) => (
                  <div key={badge.id ?? index} className="builder-nested-card">
                    <label className="builder-field">
                      <span>Badge Label</span>
                      <input
                        value={badge.label ?? ""}
                        onChange={(event) =>
                          updateSelectedBadge(index, { label: event.target.value })
                        }
                      />
                    </label>
                    <label className="builder-field">
                      <span>Badge Title</span>
                      <input
                        value={badge.title ?? ""}
                        onChange={(event) =>
                          updateSelectedBadge(index, { title: event.target.value })
                        }
                      />
                    </label>
                    <label className="builder-field">
                      <span>Badge Body</span>
                      <textarea
                        rows={3}
                        value={badge.body ?? ""}
                        onChange={(event) =>
                          updateSelectedBadge(index, { body: event.target.value })
                        }
                      />
                    </label>
                  </div>
                ))}
              </>
            )}

            {selectedSection.kind === "contentLayout" && (
              <>
                {selectedLayoutBlock && (
                  <div className="builder-element-inspector-note">
                    <strong>Element Settings</strong>
                    <span>
                      You are editing the selected element only. Section layout,
                      spacing, and background stay in Section Settings.
                    </span>
                  </div>
                )}
                {!selectedLayoutBlock && <label className="builder-field">
                  <span>Layout Columns</span>
                  <select
                    value={selectedSection.layoutColumns ?? 2}
                    onChange={(event) =>
                      updateSelected({ layoutColumns: Number(event.target.value) })
                    }
                  >
                    <option value={1}>Full width</option>
                    <option value={2}>2 columns</option>
                    <option value={3}>3 columns</option>
                    <option value={4}>4 columns</option>
                    <option value={5}>5 columns</option>
                    <option value={6}>6 columns</option>
                  </select>
                </label>}

                {!selectedLayoutBlock && (
                  <details
                    className="builder-collapse builder-structure-summary"
                    open={sectionStructureOpen}
                    onToggle={(event) =>
                      setSectionStructureOpen(
                        (event.currentTarget as HTMLDetailsElement).open
                      )
                    }
                  >
                    <summary>
                      <span>Columns</span>
                      <small>{selectedSection.layoutItems?.length ?? 0}</small>
                    </summary>
                    <div className="builder-structure-note">
                      Select an element in the canvas to edit it. This area only manages the
                      section grid itself.
                    </div>
                    <button
                      type="button"
                      className="builder-inline-add"
                      onClick={addSelectedLayoutItem}
                    >
                      <Plus size={15} />
                      Add column
                    </button>
                    <div className="builder-compact-column-list">
                      {(selectedSection.layoutItems ?? []).map((item, index) => {
                        const itemKey = item.id ?? `layout-item-${index}`;
                        const blocks = getLayoutItemBlocks(item);
                        return (
                          <div key={itemKey} className="builder-compact-column-row">
                            <div>
                              <strong>Column {index + 1}</strong>
                              <span>{blocks.length} elements</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteSelectedLayoutItem(index)}
                              title="Delete column"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </details>
                )}

                {(selectedSection.layoutItems ?? []).map((item, index) => {
                  if (!selectedLayoutBlock) {
                    return null;
                  }
                  if (
                    selectedLayoutBlock &&
                    !(item.blocks ?? []).some(
                      (block) => block.id === selectedLayoutBlockKey
                    )
                  ) {
                    return null;
                  }
                  const itemKey = item.id ?? `layout-item-${index}`;
                  const isOpen = Boolean(selectedLayoutBlock) || openLayoutItemId === itemKey;
                  const blocks = getLayoutItemBlocks(item);
                  const columnLabel =
                    blocks[0]?.title || item.title || `${blocks.length} blocks`;

                  return (
                    <div
                      key={itemKey}
                      className={`builder-nested-card ${isOpen ? "is-open" : ""} ${
                        selectedLayoutBlock ? "is-element-focus-card" : ""
                      }`}
                    >
                      {isOpen && (
                        <div className="builder-nested-card-body">
                          {blocks.length === 0 && (
                            <div className="builder-mini-empty">
                              Select this column in the preview, then drag an element from the
                              Element Library.
                            </div>
                          )}

                          {blocks.map((block, blockIndex) => {
                            const blockKey = block.id ?? `${itemKey}-block-${blockIndex}`;
                            const isSelectedBlock =
                              selectedLayoutBlockKey === blockKey;

                            return (
                            <div
                              key={blockKey}
                              className={`builder-layout-block-card ${
                                isSelectedBlock ? "is-selected" : ""
                              } ${selectedLayoutBlock ? "is-element-focus-block" : ""}`}
                            >
                              <div className="builder-layout-block-header">
                                <span>
                                  {layoutBlockLabels[block.kind ?? "text"] ?? "Block"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteSelectedLayoutBlock(index, blockIndex)
                                  }
                                  title="Delete block"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <details className="builder-collapse">
                                <summary>
                                  <span>Element Surface</span>
                                  <small>{block.elementBackgroundMode ?? "default"}</small>
                                </summary>
                                <label className="builder-field">
                                  <span>Background Mode</span>
                                  <select
                                    value={block.elementBackgroundMode ?? "default"}
                                    onChange={(event) =>
                                      updateSelectedLayoutBlock(index, blockIndex, {
                                        elementBackgroundMode: event.target
                                          .value as BuilderLayoutBlock["elementBackgroundMode"],
                                      })
                                    }
                                  >
                                    <option value="default">Use element default</option>
                                    <option value="transparent">Transparent</option>
                                    <option value="custom">Custom color</option>
                                  </select>
                                </label>
                                {block.elementBackgroundMode === "custom" && (
                                  <label className="builder-field">
                                    <span>Background</span>
                                    <div className="builder-background-presets">
                                      {elementBackgroundPresets.map((preset) => (
                                        <button
                                          key={preset.value}
                                          type="button"
                                          className={
                                            block.elementBackground?.toLowerCase() ===
                                            preset.value
                                              ? "is-active"
                                              : ""
                                          }
                                          onClick={() =>
                                            updateSelectedLayoutBlock(index, blockIndex, {
                                              elementBackground: preset.value,
                                            })
                                          }
                                        >
                                          <span style={{ background: preset.value }} />
                                          {preset.label}
                                        </button>
                                      ))}
                                    </div>
                                    <div className="builder-color-row">
                                      <input
                                        type="color"
                                        value={block.elementBackground ?? "#ffffff"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            elementBackground: event.target.value,
                                          })
                                        }
                                      />
                                      <input
                                        value={block.elementBackground ?? "#ffffff"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            elementBackground: event.target.value,
                                          })
                                        }
                                      />
                                    </div>
                                  </label>
                                )}
                                <label className="builder-field">
                                  <span>Element Padding</span>
                                  <select
                                    value={block.elementPadding ?? "none"}
                                    onChange={(event) =>
                                      updateSelectedLayoutBlock(index, blockIndex, {
                                        elementPadding: event.target
                                          .value as BuilderLayoutBlock["elementPadding"],
                                      })
                                    }
                                  >
                                    <option value="none">None</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                  </select>
                                </label>
                              </details>

                              {block.kind === "embed" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Block Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Embed Mode</span>
                                    <select
                                      value={block.embedMode ?? "code"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          embedMode: event.target.value as EmbedMode,
                                        })
                                      }
                                    >
                                      <option value="code">Custom HTML / Script</option>
                                      <option value="iframe">Iframe URL</option>
                                    </select>
                                  </label>
                                  {block.embedMode === "iframe" ? (
                                    <label className="builder-field">
                                      <span>Iframe URL</span>
                                      <input
                                        value={block.embedUrl ?? ""}
                                        placeholder="https://..."
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            embedUrl: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  ) : (
                                    <label className="builder-field">
                                      <span>HTML / Script</span>
                                      <textarea
                                        rows={5}
                                        value={block.embedCode ?? ""}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            embedCode: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  )}
                                  <label className="builder-field">
                                    <span>Height</span>
                                    <input
                                      type="number"
                                      min={120}
                                      max={900}
                                      value={block.embedHeight ?? 260}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          embedHeight: Number(event.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind === "fluentForm" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Block Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Fluent Form ID</span>
                                    <input
                                      inputMode="numeric"
                                      value={block.fluentFormId ?? ""}
                                      placeholder="Example: 3"
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          fluentFormId: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <div className="builder-dynamic-field-note">
                                    <strong>WordPress renderer required</strong>
                                    <span>
                                      Add the React Shop Fluent Forms snippet in WordPress,
                                      then this element can show the real Fluent Form.
                                    </span>
                                  </div>
                                </>
                              ) : block.kind === "grid" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Content Source</span>
                                    <select
                                      value={block.gridSource ?? "static"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          gridSource: event.target
                                            .value as BuilderLayoutBlock["gridSource"],
                                        })
                                      }
                                    >
                                      <option value="static">Static items</option>
                                      <option value="products">WooCommerce products</option>
                                    </select>
                                  </label>
                                  <div className="builder-two-column">
                                    <label className="builder-field">
                                      <span>Columns</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={6}
                                        value={block.columns ?? 3}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            columns: Number(event.target.value),
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Rows</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={6}
                                        value={block.gridRows ?? 1}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            gridRows: Number(event.target.value),
                                          })
                                        }
                                      />
                                    </label>
                                  </div>
                                  <div className="builder-two-column">
                                    <label className="builder-field">
                                      <span>Grid Gap</span>
                                      <select
                                        value={block.gridGap ?? "medium"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            gridGap: event.target
                                              .value as BuilderLayoutBlock["gridGap"],
                                          })
                                        }
                                      >
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                      </select>
                                    </label>
                                    <label className="builder-field">
                                      <span>Outer Margin</span>
                                      <select
                                        value={block.gridMargin ?? "none"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            gridMargin: event.target
                                              .value as BuilderLayoutBlock["gridMargin"],
                                          })
                                        }
                                      >
                                        <option value="none">None</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                      </select>
                                    </label>
                                  </div>
                                  <div className="builder-two-column">
                                    <label className="builder-field">
                                      <span>Image Padding</span>
                                      <select
                                        value={block.gridImagePadding ?? "frameless"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            gridImagePadding: event.target
                                              .value as BuilderLayoutBlock["gridImagePadding"],
                                          })
                                        }
                                      >
                                        <option value="frameless">Frameless</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="max">Max</option>
                                      </select>
                                    </label>
                                    <label className="builder-field">
                                      <span>Content Padding</span>
                                      <select
                                        value={block.gridContentPadding ?? "medium"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            gridContentPadding: event.target
                                              .value as BuilderLayoutBlock["gridContentPadding"],
                                          })
                                        }
                                      >
                                        <option value="none">None</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                      </select>
                                    </label>
                                  </div>
                                  <label className="builder-field">
                                    <span>Image Frame</span>
                                    <select
                                      value={block.gridImageFrame ?? "none"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          gridImageFrame: event.target
                                            .value as BuilderLayoutBlock["gridImageFrame"],
                                        })
                                      }
                                    >
                                      <option value="none">No frame</option>
                                      <option value="soft">Soft surface</option>
                                    </select>
                                  </label>
                                  <details className="builder-collapse" open>
                                    <summary>
                                      <span>Fields</span>
                                      <small>visibility</small>
                                    </summary>
                                    <div className="builder-grid-toggle-list">
                                      {[
                                        ["gridShowImage", "Image"],
                                        ["gridShowEyebrow", "Eyebrow"],
                                        ["gridShowMeta", "Meta"],
                                        ["gridShowText", "Text"],
                                        ["gridShowButton", "Button"],
                                      ].map(([field, label]) => (
                                        <label key={field}>
                                          <input
                                            type="checkbox"
                                            checked={
                                              block[
                                                field as keyof BuilderLayoutBlock
                                              ] !== false
                                            }
                                            onChange={(event) =>
                                              updateSelectedLayoutBlock(index, blockIndex, {
                                                [field]: event.target.checked,
                                              })
                                            }
                                          />
                                          <span>{label}</span>
                                        </label>
                                      ))}
                                    </div>
                                  </details>
                                  {block.gridSource !== "products" && (
                                    <details className="builder-collapse" open>
                                      <summary>
                                        <span>Static Items</span>
                                        <small>{block.gridItems?.length ?? 0}</small>
                                      </summary>
                                      <button
                                        type="button"
                                        className="builder-inline-add"
                                        onClick={() =>
                                          addSelectedLayoutBlockGridItem(index, blockIndex)
                                        }
                                      >
                                        <Plus size={15} />
                                        Add item
                                      </button>
                                      {(block.gridItems ?? []).map((gridItem, gridItemIndex) => (
                                        <div
                                          key={gridItem.id ?? `${blockKey}-grid-${gridItemIndex}`}
                                          className="builder-nested-card is-open"
                                        >
                                          <div className="builder-nested-card-header">
                                            <span>Item {gridItemIndex + 1}</span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteSelectedLayoutBlockGridItem(
                                                  index,
                                                  blockIndex,
                                                  gridItemIndex
                                                )
                                              }
                                              title="Delete grid item"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                          <div className="builder-nested-card-body">
                                            <label className="builder-field">
                                              <span>Image URL</span>
                                              <input
                                                value={gridItem.imageUrl ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockGridItem(
                                                    index,
                                                    blockIndex,
                                                    gridItemIndex,
                                                    { imageUrl: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Eyebrow</span>
                                              <input
                                                value={gridItem.eyebrow ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockGridItem(
                                                    index,
                                                    blockIndex,
                                                    gridItemIndex,
                                                    { eyebrow: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Title</span>
                                              <input
                                                value={gridItem.title ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockGridItem(
                                                    index,
                                                    blockIndex,
                                                    gridItemIndex,
                                                    { title: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Meta</span>
                                              <input
                                                value={gridItem.meta ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockGridItem(
                                                    index,
                                                    blockIndex,
                                                    gridItemIndex,
                                                    { meta: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Text</span>
                                              <textarea
                                                rows={3}
                                                value={gridItem.text ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockGridItem(
                                                    index,
                                                    blockIndex,
                                                    gridItemIndex,
                                                    { text: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <div className="builder-two-column">
                                              <label className="builder-field">
                                                <span>Button Label</span>
                                                <input
                                                  value={gridItem.buttonLabel ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlockGridItem(
                                                      index,
                                                      blockIndex,
                                                      gridItemIndex,
                                                      { buttonLabel: event.target.value }
                                                    )
                                                  }
                                                />
                                              </label>
                                              <label className="builder-field">
                                                <span>Button Link</span>
                                                <input
                                                  value={gridItem.buttonUrl ?? ""}
                                                  onChange={(event) =>
                                                    updateSelectedLayoutBlockGridItem(
                                                      index,
                                                      blockIndex,
                                                      gridItemIndex,
                                                      { buttonUrl: event.target.value }
                                                    )
                                                  }
                                                />
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </details>
                                  )}
                                </>
                              ) : block.kind === "products" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Block Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <div className="builder-two-column">
                                    <label className="builder-field">
                                      <span>Columns</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={4}
                                        value={block.columns ?? 2}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            columns: Number(event.target.value),
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Limit</span>
                                      <input
                                        type="number"
                                        min={2}
                                        max={12}
                                        value={block.gridLimit ?? 4}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            gridLimit: Number(event.target.value),
                                          })
                                        }
                                      />
                                    </label>
                                  </div>
                                  <div className="builder-two-column">
                                    <label className="builder-field">
                                      <span>Source</span>
                                      <select
                                        value={block.source ?? "all"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            source: event.target
                                              .value as BuilderLayoutBlock["source"],
                                          })
                                        }
                                      >
                                        <option value="all">All products</option>
                                        <option value="featured">Featured</option>
                                        <option value="category">Category</option>
                                      </select>
                                    </label>
                                    <label className="builder-field">
                                      <span>Layout Variant</span>
                                      <select
                                        value={block.layoutVariant ?? "grid"}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            layoutVariant: event.target
                                              .value as BuilderLayoutBlock["layoutVariant"],
                                          })
                                        }
                                      >
                                        <option value="grid">Grid</option>
                                        <option value="carousel">Carousel</option>
                                      </select>
                                    </label>
                                  </div>
                                  {block.source === "category" && (
                                    <label className="builder-field">
                                      <span>Category Slug / ID</span>
                                      <input
                                        value={block.categoryId ?? ""}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            categoryId: event.target.value,
                                          })
                                        }
                                      />
                                    </label>
                                  )}
                                  <label className="builder-field">
                                    <span>Filter Position</span>
                                    <select
                                      value={block.filterPosition ?? "left"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          filterPosition: event.target
                                            .value as BuilderLayoutBlock["filterPosition"],
                                        })
                                      }
                                    >
                                      <option value="left">Left sidebar</option>
                                      <option value="top">Top pills</option>
                                      <option value="drawer">Drawer</option>
                                      <option value="hidden">Hidden</option>
                                    </select>
                                  </label>
                                  <label className="builder-field">
                                    <span>Card Style</span>
                                    <select
                                      value={block.cardStyle ?? "flat"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          cardStyle: event.target
                                            .value as BuilderLayoutBlock["cardStyle"],
                                        })
                                      }
                                    >
                                      <option value="flat">Flat</option>
                                      <option value="soft">Soft</option>
                                      <option value="lined">Lined</option>
                                    </select>
                                  </label>
                                  <label className="builder-field">
                                    <span>Card Preset</span>
                                    <select
                                      value={block.cardPreset ?? "standard"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          cardPreset: event.target
                                            .value as BuilderLayoutBlock["cardPreset"],
                                        })
                                      }
                                    >
                                      <option value="standard">Standard</option>
                                      <option value="graph">Graph Clean</option>
                                      <option value="gallery">Gallery</option>
                                      <option value="editorial">Editorial</option>
                                      <option value="compact">Compact</option>
                                      <option value="minimal">Minimal</option>
                                      <option value="luxury">Luxury</option>
                                    </select>
                                  </label>
                                  <details className="builder-collapse" open>
                                    <summary>Product Grid Spacing</summary>
                                    <div className="builder-two-column">
                                      <label className="builder-field">
                                        <span>Grid Gap</span>
                                        <select
                                          value={block.gridGap ?? "medium"}
                                          onChange={(event) =>
                                            updateSelectedLayoutBlock(index, blockIndex, {
                                              gridGap: event.target
                                                .value as BuilderLayoutBlock["gridGap"],
                                            })
                                          }
                                        >
                                          <option value="none">None</option>
                                          <option value="small">Small</option>
                                          <option value="medium">Medium</option>
                                          <option value="large">Large</option>
                                          <option value="max">Max</option>
                                        </select>
                                      </label>
                                      <label className="builder-field">
                                        <span>Outer Margin</span>
                                        <select
                                          value={block.gridMargin ?? "none"}
                                          onChange={(event) =>
                                            updateSelectedLayoutBlock(index, blockIndex, {
                                              gridMargin: event.target
                                                .value as BuilderLayoutBlock["gridMargin"],
                                            })
                                          }
                                        >
                                          <option value="none">None</option>
                                          <option value="small">Small</option>
                                          <option value="medium">Medium</option>
                                          <option value="large">Large</option>
                                        </select>
                                      </label>
                                    </div>
                                    <div className="builder-two-column">
                                      <label className="builder-field">
                                        <span>Card Padding</span>
                                        <select
                                          value={block.cardPadding ?? "medium"}
                                          onChange={(event) =>
                                            updateSelectedLayoutBlock(index, blockIndex, {
                                              cardPadding: event.target
                                                .value as BuilderLayoutBlock["cardPadding"],
                                            })
                                          }
                                        >
                                          <option value="none">None</option>
                                          <option value="small">Small</option>
                                          <option value="medium">Medium</option>
                                          <option value="large">Large</option>
                                          <option value="max">Max</option>
                                        </select>
                                      </label>
                                      <label className="builder-field">
                                        <span>Image Padding</span>
                                        <select
                                          value={block.imagePadding ?? "large"}
                                          onChange={(event) =>
                                            updateSelectedLayoutBlock(index, blockIndex, {
                                              imagePadding: event.target
                                                .value as BuilderLayoutBlock["imagePadding"],
                                            })
                                          }
                                        >
                                          <option value="none">Frameless</option>
                                          <option value="small">Small</option>
                                          <option value="medium">Medium</option>
                                          <option value="large">Large</option>
                                          <option value="max">Max</option>
                                        </select>
                                      </label>
                                    </div>
                                  </details>
                                </>
                              ) : block.kind === "productGallery" ? (
                                <>
                                  <div className="builder-dynamic-field-note">
                                    <strong>Dynamic Product Gallery</strong>
                                    <span>
                                      Uses images from the current WooCommerce product.
                                    </span>
                                  </div>
                                  <label className="builder-field">
                                    <span>Show Thumbnails</span>
                                    <select
                                      value={block.galleryShowThumbnails === false ? "no" : "yes"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          galleryShowThumbnails: event.target.value === "yes",
                                        })
                                      }
                                    >
                                      <option value="yes">Yes</option>
                                      <option value="no">No</option>
                                    </select>
                                  </label>
                                  <label className="builder-field">
                                    <span>Thumbnail Position</span>
                                    <select
                                      value={block.galleryThumbnailPosition ?? "bottom"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          galleryThumbnailPosition: event.target
                                            .value as BuilderLayoutBlock["galleryThumbnailPosition"],
                                        })
                                      }
                                    >
                                      <option value="bottom">Bottom</option>
                                      <option value="left">Left</option>
                                    </select>
                                  </label>
                                  <label className="builder-field">
                                    <span>Image Fit</span>
                                    <select
                                      value={block.galleryImageFit ?? "contain"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          galleryImageFit: event.target
                                            .value as BuilderLayoutBlock["galleryImageFit"],
                                        })
                                      }
                                    >
                                      <option value="contain">Contain</option>
                                      <option value="cover">Cover</option>
                                    </select>
                                  </label>
                                  <label className="builder-field">
                                    <span>Gallery Height</span>
                                    <input
                                      type="number"
                                      min={220}
                                      max={900}
                                      value={block.galleryHeight ?? 420}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          galleryHeight: Number(event.target.value),
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind === "categoryFilters" ||
                                block.kind === "breadcrumbs" ? (
                                <>
                                  <div className="builder-dynamic-field-note">
                                    <strong>Dynamic Store Element</strong>
                                    <span>
                                      This element renders live storefront data in
                                      the published page.
                                    </span>
                                  </div>
                                  <label className="builder-field">
                                    <span>Editor Label</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Editor Note</span>
                                    <textarea
                                      rows={2}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind?.startsWith("product") ? (
                                <>
                                  <div className="builder-dynamic-field-note">
                                    <strong>Dynamic Product Field</strong>
                                    <span>
                                      This element reads from the current WooCommerce
                                      product on the live product page.
                                    </span>
                                  </div>
                                  <label className="builder-field">
                                    <span>Editor Label</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Editor Note</span>
                                    <textarea
                                      rows={2}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind === "slider" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Block Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Body</span>
                                    <textarea
                                      rows={3}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <div className="builder-two-column">
                                    <label className="builder-field">
                                      <span>Cards Per View</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={3}
                                        value={block.carouselSettings?.cardsPerView ?? 1}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            carouselSettings: {
                                              ...(block.carouselSettings ?? {}),
                                              cardsPerView: Number(event.target.value),
                                            },
                                          })
                                        }
                                      />
                                    </label>
                                    <label className="builder-field">
                                      <span>Autoplay Delay</span>
                                      <input
                                        type="number"
                                        min={2000}
                                        max={30000}
                                        step={500}
                                        value={
                                          block.carouselSettings?.autoplayDelayMs ?? 5000
                                        }
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            carouselSettings: {
                                              ...(block.carouselSettings ?? {}),
                                              autoplayDelayMs: Number(event.target.value),
                                            },
                                          })
                                        }
                                      />
                                    </label>
                                  </div>
                                  <div className="builder-slider-options">
                                    {[
                                      ["autoplay", "Autoplay"],
                                      ["showArrows", "Arrows"],
                                      ["showDots", "Dots"],
                                      ["dragFree", "Drag free"],
                                      ["pauseOnHover", "Pause hover"],
                                    ].map(([key, label]) => (
                                      <label key={key} className="builder-check">
                                        <input
                                          type="checkbox"
                                          checked={Boolean(
                                            block.carouselSettings?.[
                                              key as keyof NonNullable<
                                                BuilderLayoutBlock["carouselSettings"]
                                              >
                                            ] ??
                                              (key === "dragFree" ||
                                              key === "autoplay"
                                                ? false
                                                : true)
                                          )}
                                          onChange={(event) =>
                                            updateSelectedLayoutBlock(index, blockIndex, {
                                              carouselSettings: {
                                                ...(block.carouselSettings ?? {}),
                                                [key]: event.target.checked,
                                              },
                                            })
                                          }
                                        />
                                        <span>{label}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <div className="builder-section-heading">
                                    <span>Slider Slides</span>
                                    <span>{block.slides?.length ?? 0}</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="builder-inline-add"
                                    onClick={() =>
                                      addSelectedLayoutBlockSlide(index, blockIndex)
                                    }
                                  >
                                    <Plus size={15} />
                                    Add slide
                                  </button>
                                  {(block.slides ?? []).map((slide, slideIndex) => {
                                    const slideKey =
                                      slide.id ??
                                      `${blockKey}-nested-slide-${slideIndex}`;
                                    const isSlideOpen = openSlideId === slideKey;

                                    return (
                                      <div
                                        key={slideKey}
                                        className={`builder-nested-card ${
                                          isSlideOpen ? "is-open" : ""
                                        }`}
                                      >
                                        <div className="builder-nested-card-header">
                                          <button
                                            type="button"
                                            className="builder-slide-toggle"
                                            onClick={() =>
                                              setOpenSlideId(
                                                isSlideOpen ? null : slideKey
                                              )
                                            }
                                          >
                                            <span>Slide {slideIndex + 1}</span>
                                            <small>
                                              {slide.title || "Untitled slide"}
                                            </small>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              deleteSelectedLayoutBlockSlide(
                                                index,
                                                blockIndex,
                                                slideIndex
                                              )
                                            }
                                            title="Delete slide"
                                          >
                                            <Trash2 size={14} />
                                          </button>
                                        </div>
                                        {isSlideOpen && (
                                          <div className="builder-nested-card-body">
                                            <label className="builder-field">
                                              <span>Slide Badge</span>
                                              <input
                                                value={slide.badge ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { badge: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Slide Title</span>
                                              <input
                                                value={slide.title ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { title: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Slide Text</span>
                                              <textarea
                                                rows={3}
                                                value={slide.text ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { text: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Image URL</span>
                                              <input
                                                value={slide.imageUrl ?? ""}
                                                placeholder="https://... or /uploads/image.jpg"
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { imageUrl: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-upload-field">
                                              <span>Upload Image</span>
                                              <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                                                onChange={(event) => {
                                                  void uploadSelectedLayoutBlockSlideImage(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    event.target.files?.[0] ?? null
                                                  );
                                                  event.target.value = "";
                                                }}
                                              />
                                              <small>
                                                {uploadingNestedSlide ===
                                                `${index}-${blockIndex}-${slideIndex}`
                                                  ? "Uploading..."
                                                  : "Saved to /uploads/builder"}
                                              </small>
                                            </label>
                                            <label className="builder-field">
                                              <span>Image Alt Text</span>
                                              <input
                                                value={slide.imageAlt ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { imageAlt: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Image To Panel Padding</span>
                                              <select
                                                value={slide.imagePadding ?? "medium"}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    {
                                                      imagePadding: event.target
                                                        .value as SlideImagePadding,
                                                    }
                                                  )
                                                }
                                              >
                                                <option value="frameless">
                                                  Frameless
                                                </option>
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="max">Max</option>
                                              </select>
                                            </label>
                                            <label className="builder-field">
                                              <span>Button Label</span>
                                              <input
                                                value={slide.buttonLabel ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { buttonLabel: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                            <label className="builder-field">
                                              <span>Button URL</span>
                                              <input
                                                value={slide.buttonUrl ?? ""}
                                                onChange={(event) =>
                                                  updateSelectedLayoutBlockSlide(
                                                    index,
                                                    blockIndex,
                                                    slideIndex,
                                                    { buttonUrl: event.target.value }
                                                  )
                                                }
                                              />
                                            </label>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </>
                              ) : block.kind === "icon" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Icon</span>
                                    <select
                                      value={block.iconName ?? "sparkles"}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          iconName: event.target
                                            .value as BuilderLayoutBlock["iconName"],
                                        })
                                      }
                                    >
                                      <option value="sparkles">Sparkles</option>
                                      <option value="heart">Heart</option>
                                      <option value="truck">Truck</option>
                                      <option value="shield">Shield</option>
                                    </select>
                                  </label>
                                  <label className="builder-field">
                                    <span>Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Text</span>
                                    <textarea
                                      rows={3}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind === "list" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Items</span>
                                    <textarea
                                      rows={5}
                                      value={(block.items ?? []).join("\n")}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          items: event.target.value
                                            .split("\n")
                                            .map((item) => item.trim())
                                            .filter(Boolean),
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind === "datePicker" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Field Label</span>
                                    <input
                                      value={block.dateLabel ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          dateLabel: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Help Text</span>
                                    <textarea
                                      rows={3}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : block.kind === "badgeGrid" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Block Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Body</span>
                                    <textarea
                                      rows={3}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  {block.kind === "badgeGrid" && (
                                    <label className="builder-field">
                                      <span>Badge Columns</span>
                                      <input
                                        type="number"
                                        min={1}
                                        max={3}
                                        value={block.columns ?? 2}
                                        onChange={(event) =>
                                          updateSelectedLayoutBlock(index, blockIndex, {
                                            columns: Number(event.target.value),
                                          })
                                        }
                                      />
                                    </label>
                                  )}
                                  <div className="builder-section-heading">
                                    <span>Badges</span>
                                    <span>{block.badges?.length ?? 0}</span>
                                  </div>
                                  <button
                                    type="button"
                                    className="builder-inline-add"
                                    onClick={() =>
                                      addSelectedLayoutBlockBadge(index, blockIndex)
                                    }
                                  >
                                    <Plus size={15} />
                                    Add badge
                                  </button>
                                  {(block.badges ?? []).map((badge, badgeIndex) => (
                                    <div
                                      key={badge.id ?? `${blockKey}-badge-${badgeIndex}`}
                                      className="builder-nested-card is-open"
                                    >
                                      <div className="builder-nested-card-header">
                                        <span>Badge {badgeIndex + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteSelectedLayoutBlockBadge(
                                              index,
                                              blockIndex,
                                              badgeIndex
                                            )
                                          }
                                          title="Delete badge"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                      <div className="builder-nested-card-body">
                                        <label className="builder-field">
                                          <span>Label</span>
                                          <input
                                            value={badge.label ?? ""}
                                            onChange={(event) =>
                                              updateSelectedLayoutBlockBadge(
                                                index,
                                                blockIndex,
                                                badgeIndex,
                                                { label: event.target.value }
                                              )
                                            }
                                          />
                                        </label>
                                        <label className="builder-field">
                                          <span>Title</span>
                                          <input
                                            value={badge.title ?? ""}
                                            onChange={(event) =>
                                              updateSelectedLayoutBlockBadge(
                                                index,
                                                blockIndex,
                                                badgeIndex,
                                                { title: event.target.value }
                                              )
                                            }
                                          />
                                        </label>
                                        <label className="builder-field">
                                          <span>Text</span>
                                          <textarea
                                            rows={3}
                                            value={badge.body ?? ""}
                                            onChange={(event) =>
                                              updateSelectedLayoutBlockBadge(
                                                index,
                                                blockIndex,
                                                badgeIndex,
                                                { body: event.target.value }
                                              )
                                            }
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              ) : block.kind === "panel" ? (
                                <>
                                  <label className="builder-field">
                                    <span>Image URL</span>
                                    <input
                                      value={block.imageUrl ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          imageUrl: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Image Alt</span>
                                    <input
                                      value={block.imageAlt ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          imageAlt: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Eyebrow</span>
                                    <input
                                      value={block.eyebrow ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          eyebrow: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Body</span>
                                    <textarea
                                      rows={4}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Button Label</span>
                                    <input
                                      value={block.buttonLabel ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          buttonLabel: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Button URL</span>
                                    <input
                                      value={block.buttonUrl ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          buttonUrl: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              ) : (
                                <>
                                  <label className="builder-field">
                                    <span>Eyebrow</span>
                                    <input
                                      value={block.eyebrow ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          eyebrow: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Title</span>
                                    <input
                                      value={block.title ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          title: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Body</span>
                                    <textarea
                                      rows={4}
                                      value={block.body ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          body: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Button Label</span>
                                    <input
                                      value={block.buttonLabel ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          buttonLabel: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label className="builder-field">
                                    <span>Button URL</span>
                                    <input
                                      value={block.buttonUrl ?? ""}
                                      onChange={(event) =>
                                        updateSelectedLayoutBlock(index, blockIndex, {
                                          buttonUrl: event.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </>
                              )}
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {selectedSection.kind === "embed" && (
              <>
                <label className="builder-field">
                  <span>Embed Mode</span>
                  <select
                    value={selectedSection.embedMode ?? "iframe"}
                    onChange={(event) =>
                      updateSelected({
                        embedMode: event.target.value as EmbedMode,
                      })
                    }
                  >
                    <option value="iframe">Iframe URL</option>
                    <option value="code">Custom HTML / Script</option>
                  </select>
                </label>

                {selectedSection.embedMode !== "code" && (
                  <label className="builder-field">
                    <span>Iframe URL</span>
                    <input
                      value={selectedSection.embedUrl ?? ""}
                      placeholder="https://..."
                      onChange={(event) =>
                        updateSelected({ embedUrl: event.target.value })
                      }
                    />
                  </label>
                )}

                {selectedSection.embedMode === "code" && (
                  <label className="builder-field">
                    <span>Embed Code</span>
                    <textarea
                      rows={7}
                      value={selectedSection.embedCode ?? ""}
                      placeholder="<div>...</div> or trusted widget script"
                      onChange={(event) =>
                        updateSelected({ embedCode: event.target.value })
                      }
                    />
                  </label>
                )}

                <label className="builder-field">
                  <span>Embed Height</span>
                  <input
                    type="number"
                    min={120}
                    max={1200}
                    value={selectedSection.embedHeight ?? 420}
                    onChange={(event) =>
                      updateSelected({ embedHeight: Number(event.target.value) })
                    }
                  />
                </label>
              </>
            )}

            {selectedSection.kind === "slider" && (
              <>
                <label className="builder-field">
                  <span>Slider Variant</span>
                  <select
                    value={selectedSection.carouselSettings?.variant ?? "hero"}
                    onChange={(event) =>
                      updateSelected({
                        carouselSettings: {
                          ...(selectedSection.carouselSettings ?? {}),
                          variant: event.target.value,
                        },
                      })
                    }
                  >
                    <option value="hero">Hero</option>
                    <option value="basic">Basic</option>
                    <option value="overlay">Overlay</option>
                  </select>
                </label>

                <label className="builder-field">
                  <span>Cards Per View</span>
                  <input
                    type="number"
                    min={1}
                    max={4}
                    value={selectedSection.carouselSettings?.cardsPerView ?? 1}
                    onChange={(event) =>
                      updateSelected({
                        carouselSettings: {
                          ...(selectedSection.carouselSettings ?? {}),
                          cardsPerView: Number(event.target.value),
                        },
                      })
                    }
                  />
                </label>

                <label className="builder-field">
                  <span>Autoplay Delay (ms)</span>
                  <input
                    type="number"
                    min={2000}
                    max={30000}
                    step={500}
                    value={selectedSection.carouselSettings?.autoplayDelayMs ?? 5000}
                    onChange={(event) =>
                      updateSelected({
                        carouselSettings: {
                          ...(selectedSection.carouselSettings ?? {}),
                          autoplayDelayMs: Number(event.target.value),
                        },
                      })
                    }
                  />
                </label>

                <label className="builder-field">
                  <span>Align</span>
                  <select
                    value={selectedSection.carouselSettings?.align ?? "center"}
                    onChange={(event) =>
                      updateSelected({
                        carouselSettings: {
                          ...(selectedSection.carouselSettings ?? {}),
                          align: event.target
                            .value as NonNullable<
                            BuilderSection["carouselSettings"]
                          >["align"],
                        },
                      })
                    }
                  >
                    <option value="center">Center</option>
                    <option value="start">Start</option>
                  </select>
                </label>

                <div className="builder-slider-options">
                  {[
                    ["autoplay", "Autoplay"],
                    ["showArrows", "Arrows"],
                    ["showDots", "Dots"],
                    ["dragFree", "Drag free"],
                    ["pauseOnHover", "Pause hover"],
                  ].map(([key, label]) => (
                    <label key={key} className="builder-check">
                      <input
                        type="checkbox"
                        checked={Boolean(
                          selectedSection.carouselSettings?.[
                            key as keyof NonNullable<BuilderSection["carouselSettings"]>
                          ] ??
                          (key === "dragFree" ? false : true)
                        )}
                        onChange={(event) =>
                          updateSelected({
                            carouselSettings: {
                              ...(selectedSection.carouselSettings ?? {}),
                              [key]: event.target.checked,
                            },
                          })
                        }
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                <div className="builder-section-heading">
                  <span>Slides</span>
                  <span>{selectedSection.slides?.length ?? 0}</span>
                </div>

                <button
                  type="button"
                  className="builder-inline-add"
                  onClick={addSelectedSlide}
                >
                  <Plus size={15} />
                  Add slide
                </button>

                {(selectedSection.slides ?? []).map((slide, index) => {
                  const slideKey = slide.id ?? `slide-${index}`;
                  const isOpen = openSlideId === slideKey;

                  return (
                    <div
                      key={slideKey}
                      className={`builder-nested-card ${isOpen ? "is-open" : ""}`}
                    >
                      <div className="builder-nested-card-header">
                        <button
                          type="button"
                          className="builder-slide-toggle"
                          onClick={() => setOpenSlideId(isOpen ? null : slideKey)}
                        >
                          <span>Slide {index + 1}</span>
                          <small>{slide.title || "Untitled slide"}</small>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSelectedSlide(index)}
                          title="Delete slide"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {isOpen && (
                        <div className="builder-nested-card-body">
                          <label className="builder-field">
                            <span>Slide Badge</span>
                            <input
                              value={slide.badge ?? ""}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  badge: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="builder-field">
                            <span>Slide Title</span>
                            <input
                              value={slide.title ?? ""}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  title: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="builder-field">
                            <span>Slide Text</span>
                            <textarea
                              rows={3}
                              value={slide.text ?? ""}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  text: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="builder-field">
                            <span>Image URL</span>
                            <input
                              value={slide.imageUrl ?? ""}
                              placeholder="https://... or /uploads/image.jpg"
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  imageUrl: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="builder-upload-field">
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                              onChange={(event) => {
                                void uploadSelectedSlideImage(
                                  index,
                                  event.target.files?.[0] ?? null
                                );
                                event.target.value = "";
                              }}
                            />
                            <small>
                              {uploadingSlide === index
                                ? "Uploading..."
                                : "Saved to /uploads/builder"}
                            </small>
                          </label>
                          <label className="builder-field">
                            <span>Image Alt Text</span>
                            <input
                              value={slide.imageAlt ?? ""}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  imageAlt: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="builder-field">
                            <span>Image To Panel Padding</span>
                            <select
                              value={slide.imagePadding ?? "medium"}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  imagePadding: event.target
                                    .value as SlideImagePadding,
                                })
                              }
                            >
                              <option value="frameless">Frameless</option>
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="max">Max</option>
                            </select>
                          </label>
                          <label className="builder-field">
                            <span>Button Label</span>
                            <input
                              value={slide.buttonLabel ?? ""}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  buttonLabel: event.target.value,
                                })
                              }
                            />
                          </label>
                          <label className="builder-field">
                            <span>Button URL</span>
                            <input
                              value={slide.buttonUrl ?? ""}
                              onChange={(event) =>
                                updateSelectedSlide(index, {
                                  buttonUrl: event.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

              </details>
            )}
              </details>
            )}

            {inspectorTab === "manage" && (
              <>
                <details className="builder-collapse" open>
                  <summary>
                    <span>Publishing State</span>
                    <small>{selectedSection.visible ? "visible" : "hidden"}</small>
                  </summary>

                  <label className="builder-check">
                    <input
                      type="checkbox"
                      checked={selectedSection.visible}
                      onChange={(event) =>
                        updateSelected({ visible: event.target.checked })
                      }
                    />
                    <span>Visible on page</span>
                  </label>
                </details>

                <details className="builder-collapse">
                  <summary>
                    <span>Current JSON</span>
                    <small>advanced</small>
                  </summary>
                  <div className="builder-json-card">
                    <span>Current JSON</span>
                    <pre>{builderJson}</pre>
                  </div>
                  <button type="button" className="builder-secondary-button builder-full-button" onClick={copyJson}>
                    <Save size={16} />
                    {copied ? "Copied JSON" : "Export JSON"}
                  </button>
                </details>
              </>
            )}
          </>
        ) : (
          <div className="builder-empty-state">
            <Layers3 size={22} />
            <p>Add a section to start designing.</p>
          </div>
        )}
      </aside>
    </div>
  );
}

function PreviewCanvas({
  sections,
  previewProducts,
  previewCategoryTree,
  previewCategoryCounts,
  pageLabel,
  design,
  shellSettings,
  selectedId,
  selectedLayoutColumnKey,
  selectedLayoutBlockKey,
  draggingSectionId,
  draggingLayoutBlockKey,
  onSelect,
  onSelectColumn,
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
  onUpdateSection,
  onUpdateBlock,
  onUpdateGridItem,
  onUploadGridItemImage,
  onAddWireframe,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  headerSlotRef,
}: {
  sections: BuilderSection[];
  previewProducts: ProductNode[];
  previewCategoryTree: CategoryTreeItem[];
  previewCategoryCounts: Record<string, number>;
  pageLabel: string;
  design: BuilderDesign;
  shellSettings: BuilderShellSettings;
  selectedId: string;
  selectedLayoutColumnKey: string | null;
  selectedLayoutBlockKey: string | null;
  draggingSectionId: string | null;
  draggingLayoutBlockKey: string | null;
  onSelect: (id: string) => void;
  onSelectColumn: (sectionId: string, columnKey: string) => void;
  onSelectBlock: (sectionId: string, columnKey: string, blockKey: string) => void;
  onDragStart: (sectionId: string) => void;
  onDragEnd: () => void;
  onReorder: (sourceId: string, targetId: string) => void;
  onBlockDragStart: (blockKey: string) => void;
  onBlockDragEnd: () => void;
  onMoveBlock: (payload: {
    sectionId: string;
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
  onUpdateSection: (sectionId: string, patch: Partial<BuilderSection>) => void;
  onUpdateBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    patch: Partial<BuilderLayoutBlock>
  ) => void;
  onUpdateGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number]
  ) => void;
  onUploadGridItemImage: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    file: File | null
  ) => void;
  onAddWireframe: (
    columns: number,
    rows: number,
    targetSectionId: string,
    placement: "above" | "below"
  ) => void;
  onMoveSection: (sectionId: string, direction: -1 | 1) => void;
  onDuplicateSection: (sectionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  headerSlotRef: RefObject<HTMLDivElement | null>;
}) {
  const [wireframeColumns, setWireframeColumns] = useState(2);
  const [wireframeRows, setWireframeRows] = useState(1);
  const [insertAfterSectionId, setInsertAfterSectionId] = useState<string | null>(
    null
  );
  const visibleSections = sections.filter((section) => section.visible);
  return (
    <div
      className="builder-preview-canvas"
      style={{
        "--builder-global-section-padding-top": getPreviewSpacing(
          shellSettings.sectionPaddingTop
        ),
        "--builder-global-section-padding-bottom": getPreviewSpacing(
          shellSettings.sectionPaddingBottom
        ),
        "--builder-global-section-margin-top": getPreviewSpacing(
          shellSettings.sectionMarginTop
        ),
        "--builder-global-section-margin-bottom": getPreviewSpacing(
          shellSettings.sectionMarginBottom
        ),
      } as CSSProperties}
    >
      <div ref={headerSlotRef} className="builder-preview-header-slot" />
      {visibleSections.length === 0 && (
        <div className="builder-preview-empty">
          <Layers3 size={22} />
          <strong>No visible sections</strong>
          <small>Use the section list or turn a hidden section back on.</small>
        </div>
      )}

      <div
        className={`shop-builder-main shop-builder-main--scheme-${
          design.colorScheme ?? "auto"
        } builder-preview-page`}
        style={previewDesignStyle(design)}
      >
      <div className="shop-builder-inner builder-preview-inner" aria-label={`${pageLabel} preview`}>
      {visibleSections.map((section) => {
        const sourceIndex = sections.findIndex((item) => item.id === section.id);
        const isSelected = selectedId === section.id;

        return (
          <div
            key={section.id}
            role="button"
            tabIndex={0}
            draggable
            className={`builder-preview-section ${getStorefrontPreviewClass(
              section
            )} builder-preview-${section.kind} builder-preview-section--${
              section.backgroundMode === "boxed" ? "boxed" : "full"
            } builder-preview-section--content-${
              section.contentMode ?? "boxed"
            } builder-preview-section--scheme-${resolveSectionColorScheme(section)} ${
              isSelected ? "is-selected" : ""
            } ${
              draggingSectionId === section.id ? "is-dragging" : ""
            }`}
            style={
              {
                background: section.background,
                "--builder-preview-padding-top": getPreviewSpacing(section.topSpacing),
                "--builder-preview-padding-bottom": getPreviewSpacing(
                  section.bottomSpacing
                ),
                "--builder-section-padding-top": getPreviewSpacing(
                  section.topSpacing
                ),
                "--builder-section-padding-bottom": getPreviewSpacing(
                  section.bottomSpacing
                ),
                "--builder-section-margin-top": getPreviewSpacing(section.topMargin),
                "--builder-section-margin-bottom": getPreviewSpacing(
                  section.bottomMargin
                ),
                ...sectionSchemeStyle(section),
              } as CSSProperties
            }
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
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
            }}
            onDrop={(event) => {
              event.preventDefault();
              const sourceId = event.dataTransfer.getData("text/plain");
              if (sourceId.startsWith("builder-block:")) return;
              onReorder(sourceId, section.id);
              onDragEnd();
            }}
            onDragEnd={onDragEnd}
          >
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
                    onClick={() => onMoveSection(section.id, -1)}
                    disabled={sourceIndex <= 0}
                    title="Move section up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMoveSection(section.id, 1)}
                    disabled={sourceIndex < 0 || sourceIndex >= sections.length - 1}
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
                className="builder-preview-section-insert"
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onDragStart={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="builder-preview-section-insert-trigger"
                  onClick={() =>
                    setInsertAfterSectionId((current) =>
                      current === section.id ? null : section.id
                    )
                  }
                  aria-label="Add section below"
                  title="Add section below"
                >
                  <Plus size={16} />
                </button>

                {insertAfterSectionId === section.id && (
                  <div className="builder-preview-section-insert-panel">
                    <strong>New section</strong>
                    <div className="builder-wireframe-controls">
                      <label>
                        <span>Cols</span>
                        <select
                          value={wireframeColumns}
                          onChange={(event) =>
                            setWireframeColumns(Number(event.target.value))
                          }
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                          <option value={5}>5</option>
                          <option value={6}>6</option>
                        </select>
                      </label>
                      <label>
                        <span>Rows</span>
                        <select
                          value={wireframeRows}
                          onChange={(event) =>
                            setWireframeRows(Number(event.target.value))
                          }
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </label>
                      <span
                        className="builder-wireframe-preview"
                        style={
                          { "--wireframe-columns": wireframeColumns } as CSSProperties
                        }
                        aria-hidden="true"
                      >
                        {Array.from({
                          length: wireframeColumns * wireframeRows,
                        }).map((_, index) => (
                          <i key={index} />
                        ))}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onAddWireframe(
                          wireframeColumns,
                          wireframeRows,
                          section.id,
                          "below"
                        );
                        setInsertAfterSectionId(null);
                      }}
                    >
                      Add section
                    </button>
                  </div>
                )}
              </div>
            <PreviewSection
              section={section}
              previewProducts={previewProducts}
              previewCategoryTree={previewCategoryTree}
              previewCategoryCounts={previewCategoryCounts}
              selectedLayoutColumnKey={selectedLayoutColumnKey}
              selectedLayoutBlockKey={selectedLayoutBlockKey}
              draggingLayoutBlockKey={draggingLayoutBlockKey}
              onSelectColumn={onSelectColumn}
              onSelectBlock={onSelectBlock}
              onBlockDragStart={onBlockDragStart}
              onBlockDragEnd={onBlockDragEnd}
              onMoveBlock={onMoveBlock}
              onCreateBlock={onCreateBlock}
              onDuplicateBlock={onDuplicateBlock}
              onDeleteBlock={onDeleteBlock}
              onUpdateSection={onUpdateSection}
              onUpdateBlock={onUpdateBlock}
              onUpdateGridItem={onUpdateGridItem}
              onUploadGridItemImage={onUploadGridItemImage}
            />
          </div>
        );
      })}
      </div>
      </div>
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
  } as CSSProperties;
}

function getPreviewSpacing(value: SectionSpacing | undefined) {
  switch (value) {
    case "inherit":
      return undefined;
    case "none":
      return "0px";
    case "small":
      return "clamp(18px, 3vw, 36px)";
    case "large":
      return "clamp(52px, 7vw, 96px)";
    case "medium":
      return "clamp(28px, 5vw, 72px)";
    default:
      return undefined;
  }
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
              : section.kind === "contentLayout"
                ? "shop-builder-content-layout"
                : section.kind === "slider"
                  ? "shop-builder-slider"
                  : section.kind === "embed"
                    ? "shop-builder-embed"
                    : "";

  return `shop-builder-section shop-builder-section--${
    section.backgroundMode === "boxed" ? "boxed" : "full"
  } shop-builder-section--content-${section.contentMode ?? "boxed"} ${kindClass}`;
}

function getPreviewLayoutBlocks(
  item: NonNullable<BuilderSection["layoutItems"]>[number]
) {
  if (item.blocks?.length) return item.blocks;
  if (item.title || item.body || item.eyebrow || item.buttonLabel || item.buttonUrl) {
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

function getPreviewGoodieIcon(iconName: BuilderLayoutBlock["iconName"]) {
  if (iconName === "heart") return <Heart size={24} />;
  if (iconName === "truck") return <Truck size={24} />;
  if (iconName === "shield") return <ShieldCheck size={24} />;
  return <Sparkles size={24} />;
}

function getLayoutBlockLibraryIcon(kind: LayoutBlockKind) {
  switch (kind) {
    case "text":
      return <TextCursorInput size={16} />;
    case "slider":
      return <GalleryHorizontal size={16} />;
    case "embed":
      return <Code2 size={16} />;
    case "fluentForm":
      return <TextCursorInput size={16} />;
    case "badgeGrid":
      return <Grid3X3 size={16} />;
    case "icon":
      return <Sparkles size={16} />;
    case "list":
      return <ListChecks size={16} />;
    case "datePicker":
      return <CalendarDays size={16} />;
    case "products":
      return <ShoppingBag size={16} />;
    case "categoryFilters":
      return <PanelLeft size={16} />;
    case "breadcrumbs":
      return <Navigation size={16} />;
    case "productGallery":
      return <ImageIcon size={16} />;
    case "productTitle":
      return <TextCursorInput size={16} />;
    case "productPrice":
      return <SquareMousePointer size={16} />;
    case "productAddToCart":
      return <ShoppingBag size={16} />;
    case "productAttributes":
      return <ListChecks size={16} />;
    case "productDescription":
      return <TextCursorInput size={16} />;
    default:
      return <Sparkles size={16} />;
  }
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
        <h3>{product.name}</h3>
        <span aria-hidden="true">♡</span>
      </div>
    );
  }

  if (block.kind === "productPrice") {
    return <div className="shop-builder-product-price">{product.priceFormatted}</div>;
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
    return <p className="shop-builder-product-description">{product.description}</p>;
  }

  if (block.kind === "productHero") {
    return (
      <div className="shop-builder-premium-product-hero builder-preview-product-hero">
        <PreviewProductGallery product={product} />
        <div className="shop-builder-premium-product-copy">
          <span>Featured Product</span>
          <h3>{product.name}</h3>
          <div className="shop-builder-product-price">{product.priceFormatted}</div>
          <p className="shop-builder-product-description">{product.description}</p>
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
        <h3>{product.name}</h3>
        <div className="shop-builder-product-price">{product.priceFormatted}</div>
        <p className="shop-builder-product-description">{product.description}</p>
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
        <h3>{product.name}</h3>
        <div className="shop-builder-product-price">{product.priceFormatted}</div>
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
}: {
  as: "span" | "em" | "strong" | "p" | "h2" | "h3";
  value: string;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Tag
      className={`builder-inline-editable ${className ?? ""}`.trim()}
      contentEditable
      suppressContentEditableWarning
      onClick={(event) => event.stopPropagation()}
      onMouseDown={(event) => event.stopPropagation()}
      onBlur={(event) => {
        const nextValue = event.currentTarget.textContent?.trim() ?? "";
        if (nextValue !== value) onChange(nextValue);
      }}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === "Enter" && Tag !== "p") {
          event.preventDefault();
          event.currentTarget.blur();
        }
        if (event.key === "Escape") {
          event.preventDefault();
          event.currentTarget.textContent = value;
          event.currentTarget.blur();
        }
      }}
    >
      {value}
    </Tag>
  );
}

function PreviewSection({
  section,
  previewProducts,
  previewCategoryTree,
  previewCategoryCounts,
  selectedLayoutColumnKey,
  selectedLayoutBlockKey,
  draggingLayoutBlockKey,
  onSelectColumn,
  onSelectBlock,
  onBlockDragStart,
  onBlockDragEnd,
  onMoveBlock,
  onCreateBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onUpdateSection,
  onUpdateBlock,
  onUpdateGridItem,
  onUploadGridItemImage,
}: {
  section: BuilderSection;
  previewProducts: ProductNode[];
  previewCategoryTree: CategoryTreeItem[];
  previewCategoryCounts: Record<string, number>;
  selectedLayoutColumnKey: string | null;
  selectedLayoutBlockKey: string | null;
  draggingLayoutBlockKey: string | null;
  onSelectColumn: (sectionId: string, columnKey: string) => void;
  onSelectBlock: (sectionId: string, columnKey: string, blockKey: string) => void;
  onBlockDragStart: (blockKey: string) => void;
  onBlockDragEnd: () => void;
  onMoveBlock: (payload: {
    sectionId: string;
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
  onUpdateSection: (sectionId: string, patch: Partial<BuilderSection>) => void;
  onUpdateBlock: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    patch: Partial<BuilderLayoutBlock>
  ) => void;
  onUpdateGridItem: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    patch: NonNullable<BuilderLayoutBlock["gridItems"]>[number]
  ) => void;
  onUploadGridItemImage: (
    sectionId: string,
    columnKey: string,
    blockKey: string,
    itemIndex: number,
    file: File | null
  ) => void;
}) {
  if (section.kind === "hero") {
    return (
      <div className="shop-builder-section-content builder-preview-hero-inner">
        <div>
          {section.eyebrow && (
            <InlineEditableText
              as="p"
              className="shop-builder-eyebrow"
              value={section.eyebrow}
              onChange={(eyebrow) => onUpdateSection(section.id, { eyebrow })}
            />
          )}
          <InlineEditableText
            as="h2"
            className="shop-builder-title"
            value={section.title}
            onChange={(title) => onUpdateSection(section.id, { title })}
          />
          {section.body && (
            <InlineEditableText
              as="p"
              className="shop-builder-body"
              value={section.body}
              onChange={(body) => onUpdateSection(section.id, { body })}
            />
          )}
          {section.buttonLabel && section.buttonUrl && (
            <span className="shop-builder-cta">{section.buttonLabel}</span>
          )}
        </div>
        <div className="shop-builder-hero-media builder-preview-hero-media" aria-hidden="true" />
      </div>
    );
  }

  if (section.kind === "productArchive") {
    return (
      <div className="shop-builder-section-content builder-preview-live-products">
        {previewProducts.length > 0 ? (
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
          />
        ) : (
          <div className="builder-preview-products">
            <h2 className="shop-builder-title">{section.title}</h2>
            <div
              className={`builder-preview-product-grid cards-${
                section.cardStyle ?? "flat"
              } preset-${section.cardPreset ?? "standard"}`}
              style={{ "--builder-preview-columns": section.columns ?? 4 } as CSSProperties}
            >
              {sampleProducts
                .slice(0, Math.min(section.gridLimit ?? 12, sampleProducts.length))
                .map((name) => (
                  <div key={name} className="product-card builder-preview-product-card">
                    <div className="product-image builder-preview-product-image" />
                    <strong className="product-title">{name}</strong>
                    <span className="product-attr-pill">Preview product</span>
                    <small className="product-price">No live products</small>
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
                  <article key={product.id} className="product-card builder-preview-product-card">
                    <div className="product-image builder-preview-product-image">
                      {product.image?.sourceUrl ? (
                        <Image
                          src={product.image.sourceUrl}
                          alt={product.image.altText || product.name}
                          width={420}
                          height={520}
                        />
                      ) : (
                        <div className="product-image-placeholder">No image</div>
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
            : sampleProducts.slice(0, 4).map((name) => (
                <span key={name}>{name}</span>
              ))}
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

    return (
      <div className="shop-builder-section-content builder-preview-slider">
        <div className="shop-builder-slider-heading">
          <p className="shop-builder-eyebrow">
            <GalleryHorizontal size={18} />
            {section.carouselSettings?.variant ?? "hero"} slider
          </p>
          <h2 className="shop-builder-title">{section.title}</h2>
          {section.body && <p className="shop-builder-body">{section.body}</p>}
        </div>
        <CarouselBlock slides={slides} settings={section.carouselSettings} />
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
          {section.body && <p className="shop-builder-body">{section.body}</p>}
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

  if (section.kind === "contentLayout") {
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
    return (
      <div className="shop-builder-section-content builder-preview-content-layout">
        {(section.eyebrow || section.title || section.body) && (
          <div className="shop-builder-content-layout-heading">
            {section.eyebrow && (
              <InlineEditableText
                as="p"
                className="shop-builder-eyebrow"
                value={section.eyebrow}
                onChange={(eyebrow) => onUpdateSection(section.id, { eyebrow })}
              />
            )}
            {section.title && (
              <InlineEditableText
                as="h2"
                className="shop-builder-title"
                value={section.title}
                onChange={(title) => onUpdateSection(section.id, { title })}
              />
            )}
            {section.body && (
              <InlineEditableText
                as="p"
                className="shop-builder-body"
                value={section.body}
                onChange={(body) => onUpdateSection(section.id, { body })}
              />
            )}
          </div>
        )}
        <div
          className="shop-builder-content-layout-grid builder-preview-content-layout-grid"
          style={
            {
              "--builder-preview-layout-columns": section.layoutColumns ?? 2,
              "--builder-layout-columns": section.layoutColumns ?? 2,
            } as CSSProperties
          }
        >
          {items.map((item, index) => {
            const columnKey = item.id ?? `layout-item-${index}`;
            const blocks = getPreviewLayoutBlocks(item);

            return (
            <article
              key={columnKey}
              className={`shop-builder-content-layout-card ${
                blocks.length === 0 ? "is-empty-column" : ""
              } ${
                selectedLayoutColumnKey === columnKey ? "is-selected-column" : ""
              }`}
              onClick={(event) => {
                event.stopPropagation();
                onSelectColumn(section.id, columnKey);
              }}
              onDragOver={(event) => {
                const types = Array.from(event.dataTransfer.types);
                if (
                  types.includes("application/x-builder-block") ||
                  types.includes("application/x-builder-new-block")
                ) {
                  event.preventDefault();
                  event.stopPropagation();
                  event.dataTransfer.dropEffect = types.includes(
                    "application/x-builder-new-block"
                  )
                    ? "copy"
                    : "move";
                }
              }}
              onDrop={(event) => {
                const newBlockKind = event.dataTransfer.getData(
                  "application/x-builder-new-block"
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
                  "application/x-builder-block"
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
                    targetColumnKey: columnKey,
                  });
                } catch {
                  onBlockDragEnd();
                }
                onBlockDragEnd();
              }}
            >
              <div className="builder-preview-column-label">Column {index + 1}</div>
              {blocks.length === 0 && (
                <div
                  className="builder-preview-drop-zone"
                  aria-label={`Drop element into column ${index + 1}`}
                  title={`Drop element into column ${index + 1}`}
                >
                  <Plus size={16} />
                </div>
              )}
              {blocks.map((block, blockIndex) => {
                const blockKey = block.id ?? `${columnKey}-block-${blockIndex}`;

                return (
                <div
                  key={blockKey}
                  draggable
                  className={`builder-preview-layout-block is-${
                    block.kind ?? "text"
                  } ${
                    selectedLayoutBlockKey === blockKey ? "is-selected-block" : ""
                  } ${
                    draggingLayoutBlockKey === blockKey ? "is-dragging-block" : ""
                  } is-padding-${block.elementPadding ?? "none"}`}
                  style={
                    {
                      "--builder-element-bg":
                        block.elementBackgroundMode === "transparent"
                          ? "transparent"
                          : block.elementBackgroundMode === "custom"
                            ? block.elementBackground ?? "#ffffff"
                            : undefined,
                    } as CSSProperties
                  }
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
                      payload
                    );
                    event.dataTransfer.setData("text/plain", `builder-block:${blockKey}`);
                    event.dataTransfer.effectAllowed = "move";
                    onBlockDragStart(blockKey);
                  }}
                  onDragOver={(event) => {
                    const types = Array.from(event.dataTransfer.types);
                    if (
                      types.includes("application/x-builder-block") ||
                      types.includes("application/x-builder-new-block")
                    ) {
                      event.preventDefault();
                      event.stopPropagation();
                      event.dataTransfer.dropEffect = types.includes(
                        "application/x-builder-new-block"
                      )
                        ? "copy"
                        : "move";
                    }
                  }}
                  onDrop={(event) => {
                    const newBlockKind = event.dataTransfer.getData(
                      "application/x-builder-new-block"
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
                      "application/x-builder-block"
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
                        targetColumnKey: columnKey,
                        targetBlockKey: blockKey,
                      });
                    } catch {
                      onBlockDragEnd();
                    }
                    onBlockDragEnd();
                  }}
                  onDragEnd={onBlockDragEnd}
                >
                  <div
                    className="builder-preview-block-tools"
                    onClick={(event) => event.stopPropagation()}
                    onMouseDown={(event) => event.stopPropagation()}
                    onDragStart={(event) => event.stopPropagation()}
                  >
                    <span>{layoutBlockLabels[block.kind ?? "text"] ?? "Block"}</span>
                    <button
                      type="button"
                      onClick={() => onSelectBlock(section.id, columnKey, blockKey)}
                      title="Edit element"
                    >
                      <Settings2 size={13} />
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
                  <span className="builder-preview-drag-handle" aria-hidden="true">
                    ::
                  </span>
                  {block.kind !== "products" && block.kind?.startsWith("product") ? (
                    <PreviewProductBlockContent
                      block={block}
                      product={previewProduct}
                    />
                  ) : block.kind === "icon" ? (
                    <div className="builder-preview-goodie builder-preview-goodie-icon">
                      {getPreviewGoodieIcon(block.iconName)}
                      {block.title && <strong>{block.title}</strong>}
                      {block.body && <p>{block.body}</p>}
                    </div>
                  ) : block.kind === "list" ? (
                    <div className="builder-preview-goodie builder-preview-goodie-list">
                      {block.title && <strong>{block.title}</strong>}
                      <ul>
                        {(block.items ?? []).map((item) => (
                          <li key={item}>
                            <Check size={14} />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : block.kind === "datePicker" ? (
                    <div className="builder-preview-goodie builder-preview-goodie-date">
                      <CalendarDays size={24} />
                      {block.title && <strong>{block.title}</strong>}
                      {block.body && <p>{block.body}</p>}
                      <label>
                        <span>{block.dateLabel ?? "Preferred date"}</span>
                        <input type="date" />
                      </label>
                    </div>
                  ) : block.kind === "hero" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--hero">
                      {block.eyebrow && (
                        <InlineEditableText
                          as="span"
                          value={block.eyebrow}
                          onChange={(eyebrow) =>
                            onUpdateBlock(section.id, columnKey, blockKey, { eyebrow })
                          }
                        />
                      )}
                      {block.title && (
                        <InlineEditableText
                          as="h3"
                          value={block.title}
                          onChange={(title) =>
                            onUpdateBlock(section.id, columnKey, blockKey, { title })
                          }
                        />
                      )}
                      {block.body && (
                        <InlineEditableText
                          as="p"
                          value={block.body}
                          onChange={(body) =>
                            onUpdateBlock(section.id, columnKey, blockKey, { body })
                          }
                        />
                      )}
                      {block.buttonLabel && (
                        <span className="builder-preview-cta">{block.buttonLabel}</span>
                      )}
                    </div>
                  ) : block.kind === "promoStrip" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--promo-strip">
                      <div>
                        {block.eyebrow && (
                          <InlineEditableText
                            as="span"
                            value={block.eyebrow}
                            onChange={(eyebrow) =>
                              onUpdateBlock(section.id, columnKey, blockKey, { eyebrow })
                            }
                          />
                        )}
                        {block.title && (
                          <InlineEditableText
                            as="h3"
                            value={block.title}
                            onChange={(title) =>
                              onUpdateBlock(section.id, columnKey, blockKey, { title })
                            }
                          />
                        )}
                        {block.body && (
                          <InlineEditableText
                            as="p"
                            value={block.body}
                            onChange={(body) =>
                              onUpdateBlock(section.id, columnKey, blockKey, { body })
                            }
                          />
                        )}
                      </div>
                      {block.buttonLabel && (
                        <span className="builder-preview-cta">{block.buttonLabel}</span>
                      )}
                    </div>
                  ) : block.kind === "panel" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--panel">
                      {block.imageUrl && (
                        <div
                          className="shop-builder-panel-media"
                          style={{ backgroundImage: `url(${block.imageUrl})` }}
                        />
                      )}
                      <div>
                        {block.eyebrow && (
                          <InlineEditableText
                            as="span"
                            value={block.eyebrow}
                            onChange={(eyebrow) =>
                              onUpdateBlock(section.id, columnKey, blockKey, { eyebrow })
                            }
                          />
                        )}
                        {block.title && (
                          <InlineEditableText
                            as="strong"
                            value={block.title}
                            onChange={(title) =>
                              onUpdateBlock(section.id, columnKey, blockKey, { title })
                            }
                          />
                        )}
                        {block.body && (
                          <InlineEditableText
                            as="p"
                            value={block.body}
                            onChange={(body) =>
                              onUpdateBlock(section.id, columnKey, blockKey, { body })
                            }
                          />
                        )}
                        {block.buttonLabel && (
                          <span className="builder-preview-cta">{block.buttonLabel}</span>
                        )}
                      </div>
                    </div>
                  ) : block.kind === "categoryFilters" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--category-filters">
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
                  ) : block.kind === "slider" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--slider">
                      {block.title && <h3>{block.title}</h3>}
                      {block.body && <p>{block.body}</p>}
                      <CarouselBlock
                        block={{
                          __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
                          fieldGroupName: "ReactBuilderColumnSliderPreview",
                        }}
                        slides={(block.slides ?? []).map((slide, slideIndex) => ({
                          id: slide.id ?? `${blockKey}-slide-${slideIndex}`,
                          title: slide.title,
                          subtitle: slide.subtitle,
                          text: slide.text,
                          badge: slide.badge,
                          imageUrl: slide.imageUrl,
                          imageAlt: slide.imageAlt,
                          imagePadding: slide.imagePadding,
                          buttonLabel: slide.buttonLabel,
                          buttonUrl: slide.buttonUrl,
                        }))}
                        settings={block.carouselSettings}
                      />
                    </div>
                  ) : block.kind === "products" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--products">
                      {block.title && <h3>{block.title}</h3>}
                      {previewProducts.length > 0 ? (
                        <div
                          className={`shop-builder-grid--margin-${
                            block.gridMargin ?? "none"
                          }`}
                        >
                          <CategoryWithFilters
                            products={previewProducts.slice(0, block.gridLimit ?? 4)}
                            columns={block.columns}
                            filterPosition={block.filterPosition}
                            cardStyle={block.cardStyle}
                            cardPreset={block.cardPreset}
                            pageSize={block.gridLimit}
                            gridGap={block.gridGap}
                            cardPadding={block.cardPadding}
                            imagePadding={block.imagePadding}
                          />
                        </div>
                      ) : (
                        <div className="builder-preview-products">
                          {sampleProducts
                            .slice(0, block.gridLimit ?? 4)
                            .map((name) => (
                              <span key={name}>{name}</span>
                            ))}
                        </div>
                      )}
                    </div>
                  ) : block.kind === "grid" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--grid">
                      <div
                        className={`shop-builder-grid shop-builder-grid--gap-${
                          block.gridGap ?? "medium"
                        } shop-builder-grid--margin-${block.gridMargin ?? "none"}`}
                        style={
                          {
                            "--shop-builder-grid-columns": block.columns ?? 3,
                          } as CSSProperties
                        }
                      >
                        {(block.gridSource === "products"
                          ? previewProducts.map((product) => ({
                              id: product.id,
                              imageUrl: product.image?.sourceUrl,
                              imageAlt: product.image?.altText ?? product.name,
                              eyebrow: "Product",
                              title: product.name,
                              meta: product.price ?? "",
                              text: product.attributes?.nodes
                                ?.map((attribute) => attribute.label ?? attribute.name)
                                .join(", "),
                              buttonLabel: "View product",
                              buttonUrl: `/product/${product.slug}`,
                            }))
                          : block.gridItems ?? []
                        )
                          .slice(0, Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1)))
                          .map((item, itemIndex) => (
                            <article
                              key={item.id ?? `${blockKey}-grid-${itemIndex}`}
                              className={`shop-builder-grid-card is-image-${
                                block.gridImagePadding ?? "frameless"
                              } is-content-${block.gridContentPadding ?? "medium"} is-frame-${
                                block.gridImageFrame ?? "none"
                              }`}
                            >
                              {block.gridShowImage !== false && (
                                <div
                                  className={`shop-builder-grid-image ${
                                    item.imageUrl ? "" : "is-empty"
                                  }`}
                                >
                                  {item.imageUrl ? (
                                    <Image
                                      src={item.imageUrl}
                                      alt={item.imageAlt || item.title || ""}
                                      width={420}
                                      height={420}
                                    />
                                  ) : block.gridSource !== "products" ? (
                                    <span>No image</span>
                                  ) : null}
                                  {block.gridSource !== "products" && (
                                    <label
                                      className="builder-preview-image-upload"
                                      onClick={(event) => event.stopPropagation()}
                                    >
                                      <ImageIcon size={14} />
                                      <span>{item.imageUrl ? "Change image" : "Select image"}</span>
                                      <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) =>
                                          onUploadGridItemImage(
                                            section.id,
                                            columnKey,
                                            blockKey,
                                            itemIndex,
                                            event.target.files?.[0] ?? null
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
                                    {block.gridShowEyebrow !== false && item.eyebrow && (
                                      <InlineEditableText
                                        as="span"
                                        value={item.eyebrow}
                                        onChange={(eyebrow) =>
                                          onUpdateGridItem(section.id, columnKey, blockKey, itemIndex, {
                                            eyebrow,
                                          })
                                        }
                                      />
                                    )}
                                    {item.title && (
                                      <InlineEditableText
                                        as="h3"
                                        value={item.title}
                                        onChange={(title) =>
                                          onUpdateGridItem(section.id, columnKey, blockKey, itemIndex, {
                                            title,
                                          })
                                        }
                                      />
                                    )}
                                    {block.gridShowMeta !== false && item.meta && (
                                      <InlineEditableText
                                        as="span"
                                        className="shop-builder-grid-meta"
                                        value={item.meta}
                                        onChange={(meta) =>
                                          onUpdateGridItem(section.id, columnKey, blockKey, itemIndex, {
                                            meta,
                                          })
                                        }
                                      />
                                    )}
                                    {block.gridShowText !== false && item.text && (
                                      <InlineEditableText
                                        as="p"
                                        value={item.text}
                                        onChange={(text) =>
                                          onUpdateGridItem(section.id, columnKey, blockKey, itemIndex, {
                                            text,
                                          })
                                        }
                                      />
                                    )}
                                    {block.gridShowButton !== false && item.buttonLabel && (
                                      <InlineEditableText
                                        as="span"
                                        className="builder-preview-cta"
                                        value={item.buttonLabel}
                                        onChange={(buttonLabel) =>
                                          onUpdateGridItem(section.id, columnKey, blockKey, itemIndex, {
                                            buttonLabel,
                                          })
                                        }
                                      />
                                    )}
                                  </>
                                ) : (
                                  <>
                                    {block.gridShowEyebrow !== false && item.eyebrow && (
                                      <span>{item.eyebrow}</span>
                                    )}
                                    {item.title && <h3>{item.title}</h3>}
                                    {block.gridShowMeta !== false && item.meta && (
                                      <small>{item.meta}</small>
                                    )}
                                    {block.gridShowText !== false && item.text && <p>{item.text}</p>}
                                    {block.gridShowButton !== false && item.buttonLabel && (
                                      <span className="builder-preview-cta">{item.buttonLabel}</span>
                                    )}
                                  </>
                                )}
                              </div>
                            </article>
                          ))}
                      </div>
                    </div>
                  ) : block.kind === "badgeGrid" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--badges">
                      {block.title && <h3>{block.title}</h3>}
                      {block.body && <p>{block.body}</p>}
                      <div
                        className="shop-builder-column-badges"
                        style={
                          {
                            "--builder-column-badge-columns": block.columns ?? 2,
                          } as CSSProperties
                        }
                      >
                        {(block.badges ?? []).map((badge, badgeIndex) => (
                          <article key={badge.id ?? `${blockKey}-badge-${badgeIndex}`}>
                            {badge.label && <span>{badge.label}</span>}
                            {badge.title && <strong>{badge.title}</strong>}
                            {badge.body && <p>{badge.body}</p>}
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : block.kind === "fluentForm" ? (
                    <div className="shop-builder-column-block shop-builder-column-block--fluent-form builder-preview-fluent-form">
                      <small>Fluent Form</small>
                      <strong>{block.title || "Contact Form"}</strong>
                      <span>
                        {block.fluentFormId
                          ? `WordPress form ID ${block.fluentFormId}`
                          : "Add a Fluent Forms form ID"}
                      </span>
                      <div className="builder-preview-form-lines">
                        <i />
                        <i />
                        <i />
                        <b />
                      </div>
                    </div>
                  ) : (
                    <>
                      <small>{layoutBlockLabels[block.kind ?? "text"]}</small>
                      {block.eyebrow && (
                        <InlineEditableText
                          as="em"
                          value={block.eyebrow}
                          onChange={(eyebrow) =>
                            onUpdateBlock(section.id, columnKey, blockKey, { eyebrow })
                          }
                        />
                      )}
                      {block.title && (
                        <InlineEditableText
                          as="strong"
                          value={block.title}
                          onChange={(title) =>
                            onUpdateBlock(section.id, columnKey, blockKey, { title })
                          }
                        />
                      )}
                      {block.body && (
                        <InlineEditableText
                          as="p"
                          value={block.body}
                          onChange={(body) =>
                            onUpdateBlock(section.id, columnKey, blockKey, { body })
                          }
                        />
                      )}
                      {block.kind === "embed" && (
                        <span>{block.embedMode ?? "code"} block</span>
                      )}
                      {block.kind === "breadcrumbs" && (
                        <span>Dynamic navigation path</span>
                      )}
                      {block.buttonLabel && (
                        <span className="builder-preview-cta">{block.buttonLabel}</span>
                      )}
                    </>
                  )}
                </div>
                );
              })}
            </article>
            );
          })}
        </div>
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
          {section.body && <p className="shop-builder-body">{section.body}</p>}
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
            <article key={badge.id ?? index} className="shop-builder-badge-card">
              {badge.label && <span>{badge.label}</span>}
              {badge.title && <h3>{badge.title}</h3>}
              {badge.body && <p>{badge.body}</p>}
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
        {section.body && <p className="shop-builder-body">{section.body}</p>}
      </div>
      {section.ctaLabel && (
        <span className="shop-builder-cta shop-builder-cta--light">
          {section.ctaLabel}
        </span>
      )}
    </div>
  );
}
