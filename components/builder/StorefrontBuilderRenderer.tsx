"use client";

import { Suspense, memo, useEffect } from "react";
import type { CSSProperties, ReactNode } from "react";
import { builderGeometryCssVariables } from "@/lib/builderGeometry";
import AntigravityTerminal from "@/components/builder/AntigravityTerminal";
import AntigravityCanvas from "@/components/builder/AntigravityCanvas";
import TypewriterText from "@/components/builder/TypewriterText";
import BuilderLineBreakText from "@/components/builder/BuilderLineBreakText";
import { RenderChecklist, Typog, blockLegacyGridMargin } from "@/components/builder/BuilderRenderHelpers";
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
import UikitTable from "@/components/builder/UikitTable";
import UikitSlider from "@/components/builder/UikitSlider";
import UikitFluentForm from "@/components/builder/UikitFluentForm";
import UikitProducts from "@/components/builder/UikitProducts";
import UikitCategoryFilters from "@/components/builder/UikitCategoryFilters";
import UikitText from "@/components/builder/UikitText";
import { WebPagesIcon } from "@/components/builder/WebPagesIcon";
import {
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheck,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import CarouselBlock, {
  type CarouselSlide,
} from "@/components/blocks/CarouselBlock";
import { resolveCarouselPresentation } from "@/lib/carouselPresentation";
import ScrollPinnedDemo from "@/components/animations/ScrollPinnedDemo";
import BuilderScrollAnimations from "@/components/builder/BuilderScrollAnimations";
import { ResponsiveBreakpointPolicyStyle } from "@/components/builder/ResponsiveBreakpointPolicyStyle";
import PrincityGradientTracker from "@/components/builder/PrincityGradientTracker";
import CategoryWithFilters from "@/components/CategoryWithFilters";
import CategoryBar from "@/components/CategoryBar";
import EmbedSectionClient from "@/components/builder/EmbedSectionClient";
import FluentFormClient from "@/components/builder/FluentFormClient";
import ProductGallery from "@/components/ProductGallery";
import ProductCarousel from "@/components/ProductCarousel";
import ProductOptionsSelector from "@/components/ProductOptionsSelector";
import RecentlyViewedStrip from "@/components/RecentlyViewedStrip";
import WishlistToggle from "@/components/WishlistToggle";
import { getCategoryTree } from "@/lib/categories";
import type { CategoryTreeItem } from "@/lib/categories";
import { getProductCategories, type ProductCategory } from "@/lib/navigation";
import { getProductsForGrid, type ProductNode } from "@/lib/products";
import type { SaaSWebsite } from "@/lib/websites";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { resolveAppearanceValue } from "@/lib/globalStyleTokens";
import { getUikitGlobalsCssVars } from "@/lib/uikitGlobals";
import { resolveResponsiveBreakpointPolicy } from "@/lib/responsiveBreakpointPolicy";
import {
  getUikitSemanticContextVars,
  getYoothemeImportGlobalAliases,
  hasYoothemeImportContract,
} from "@/lib/uikitSemanticContext";
import { resolveSectionBackground, sectionBackgroundClass, sectionBackgroundImageVariables } from "@/lib/semanticBackgrounds";
import type {
  BuilderLayout,
  BuilderLayoutBlock,
  BuilderListItem,
  BuilderLayoutKey,
  BuilderPage,
  BuilderSection,
} from "@/lib/builderLayouts";
import { typographyProps, getHeadingTypographyStyles, typographyRoleClass, type TypographyArea } from "@/lib/builderTypography";
import { resolveBuilderSectionStructure } from "@/lib/builderSectionStructure";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import {
  hasBuilderVisualSpacing,
  visualStyleClassName,
  visualStyleToCss,
} from "@/lib/builderVisualStyle";
import {
  getUikitMarginClass,
  getUikitSectionPaddingClass,
  getUikitContainerClass,
  getUikitWidthClass,
  getUikitCardClass,
  getUikitButtonClass,
  getUikitHeadingClass,
  getUikitTextClass,
  getUikitBadgeClass,
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
} from "@/lib/uikitTokens";
import { elementAdvancedScope, parseSafeElementAttributes, resolveElementAdvanced } from "@/lib/elementAdvanced";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";
import { builderLinkTargetProps } from "@/lib/websiteBuilderLinks";
import { resolvePanelPresentation } from "@/lib/panelPresentation";
import {
  builderAnimationClassName as animationClassName,
  builderAnimationDataAttributes as animationDataAttributes,
  builderAnimationPreset as animationPreset,
  type BuilderAnimationLike,
  isBuilderStyleOnlyPreset,
} from "@/lib/builderAnimation";
import { builderButtonOverrideCssVars } from "@/lib/builderButtons";
import { resolveUikitIconName } from "@/lib/uikitIconRegistry";
import {
  getBuilderImageAspectRatio,
  getBuilderImageObjectFit,
} from "@/lib/builderImages";
import { normalizeSectionTitleBreakpoint, normalizeSectionTitlePosition } from "@/lib/sectionSemantics";
import { getGeneralElementShellStyle } from "@/lib/builderElementShell";
import { getGeneralElementShellClassName } from "@/lib/builderElementShell";

export type StorefrontBuilderRendererProps = {
  layout: BuilderLayout;
  page: BuilderLayoutKey;
  pageLabel?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  products?: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  product?: StorefrontBuilderProduct;
  pageContent?: ReactNode;
  website?: SaaSWebsite | null;
  /** Canonical Global Styles values, resolved by shared element renderers. */
  shellSettings?: Partial<BuilderShellSettings>;
  /** When true, the header overlays page content (shellSettings.headerOverlay).
   *  Sets data-overlap-header on the page root so HeaderFrame auto-detects
   *  the first section's background for text-mode adaptation. */
  headerOverlay?: boolean;
  rootElement?: "main" | "footer";
  /** Exposes canonical selection identity when this storefront projection is
   * hosted inside the visual Builder. */
  builderInteractionIdentity?: boolean;
};

export type StorefrontBuilderProduct = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  priceNumber: number | null;
  priceFormatted?: string | null;
  imageUrl?: string | null;
  images: {
    sourceUrl: string;
    altText?: string | null;
  }[];
  attributes: {
    name: string;
    label: string;
    options: string[];
  }[];
};

type BuilderStyle = CSSProperties & Record<`--${string}`, string | undefined>;

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

const pageLabels: Partial<Record<BuilderPage, string>> = {
  home: "Home",
  shop: "Shop",
  client: "Client Page",
};

const templateLabels: Partial<Record<BuilderLayoutKey, string>> = {
  "product-single": "Product",
  "product-category": "Category",
  "product-category-specific": "Category",
  "search-results": "Search Results",
};

const builderLightScheme = {
  pageBackground: "#f7f7f4",
  textColor: "#111111",
  mutedTextColor: "#5f5f58",
  surfaceColor: "#efefe9",
  buttonBackground: "#111111",
  buttonTextColor: "#ffffff",
};

const builderDarkScheme = {
  pageBackground: "#101010",
  textColor: "#f7f7f1",
  mutedTextColor: "#c8c8be",
  surfaceColor: "#24241f",
  buttonBackground: "#f7f7f1",
  buttonTextColor: "#101010",
};

function readableSchemeForColor(color: string | undefined) {
  const match = color
    ?.trim()
    .match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return "light";

  const [, r, g, b] = match;
  const luminance =
    (0.2126 * parseInt(r, 16) +
      0.7152 * parseInt(g, 16) +
      0.0722 * parseInt(b, 16)) /
    255;
  return luminance < 0.48 ? "dark" : "light";
}

function resolveColorSchemeForBackground(
  bg: string | undefined,
  parentScheme: "light" | "dark" = "light",
): "light" | "dark" {
  if (!bg) return parentScheme;
  const color = bg.trim().toLowerCase();
  if (color === "transparent" || color === "initial" || color === "inherit") {
    return parentScheme;
  }

  // Handle CSS Gradients by extracting hex/rgb colors and averaging their luminance
  if (color.includes("gradient")) {
    const hexes = color.match(/#[a-f\d]{3,8}/g) || [];
    const rgbs = color.match(/rgba?\(\d+\s*,\s*\d+\s*,\s*\d+/g) || [];
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

  const hexMatch = color.match(/^#([a-f\d]{3,8})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3 || hex.length === 4) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.48 ? "dark" : "light";
  }

  const rgbMatch = color.match(
    /^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)$/,
  );
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1;
    if (a < 0.15) return parentScheme;
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance < 0.48 ? "dark" : "light";
  }

  return readableSchemeForColor(bg);
}

function getContextVars(
  scheme: "light" | "dark" | "auto",
  customBg?: string,
): Record<string, string | undefined> {
  return getUikitSemanticContextVars(scheme, customBg);
}

function resolveSectionColorScheme(
  section: BuilderSection,
  layoutScheme: "light" | "dark" | "auto" = "light",
): "light" | "dark" | "auto" {
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return section.colorScheme;
  }

  const resolvedBackground = resolveSectionBackground(section);
  if (!resolvedBackground.override) return resolvedBackground.role === "primary" || resolvedBackground.role === "secondary" ? "dark" : "light";
  const bg = resolvedBackground.override.trim().toLowerCase();

  return resolveColorSchemeForBackground(
    resolvedBackground.override,
    layoutScheme === "auto" ? "light" : layoutScheme,
  );
}

function resolveDesignColors(layout: BuilderLayout) {
  const design = layout.design ?? {};
  if (design.colorScheme === "dark") {
    return { ...design, ...builderDarkScheme };
  }
  if (design.colorScheme === "light") {
    return { ...design, ...builderLightScheme };
  }
  return design;
}

function designStyle(layout: BuilderLayout): BuilderStyle {
  const design = layout.design;
  const colors = resolveDesignColors(layout);
  return {
    background: colors.pageBackground,
    color: "var(--uk-global-text-color, #111827)",
    "--builder-text": "var(--uk-global-text-color, #111827)",
    "--builder-muted": "var(--uk-global-muted-text-color, #6b7280)",
    "--builder-accent": colors.accentColor,
    "--builder-surface": colors.surfaceColor,
    "--builder-button-bg": colors.buttonBackground,
    "--builder-button-text": colors.buttonTextColor,
    "--builder-radius": design?.radius,
    "--builder-max-width": design?.sectionMaxWidth,
    "--builder-gutter": design?.sectionGutter,
    "--builder-heading-font-family": design?.headingFontFamily,
    "--builder-heading-size": design?.headingSize,
    "--builder-heading-weight": design?.headingWeight,
    "--builder-heading-line-height": design?.headingLineHeight,
    "--builder-heading-color": "var(--builder-active-heading, var(--uk-global-emphasis-color, var(--uk-global-text-color, #111827)))",
    "--builder-card-bg": design?.cardBg,
    "--builder-card-radius": design?.cardRadius,
    "--builder-card-border": design?.cardBorder,
    "--builder-card-shadow": design?.cardShadow,
    "--builder-card-shadow-hover": design?.cardShadowHover,
    "--builder-card-image-bg": design?.cardImageBg,
    "--builder-card-image-padding": design?.cardImagePadding,
  } as BuilderStyle;
}

function designClassName(layout: BuilderLayout) {
  const scheme = layout.design?.colorScheme ?? "auto";
  return `shop-builder-main shop-builder-main--scheme-${scheme}`;
}

function safeCssColor(value: string | undefined, fallback: string) {
  const color = value?.trim();
  if (!color) return fallback;

  if (
    /^#[0-9a-f]{3,8}$/i.test(color) ||
    /^rgba?\([\d\s.,%+-]+\)$/i.test(color) ||
    /^hsla?\([\d\s.,%+-]+\)$/i.test(color)
  ) {
    return color;
  }

  return fallback;
}

function builderPageShellCss(layout: BuilderLayout) {
  const colors = resolveDesignColors(layout);
  const pageBackground = safeCssColor(colors.pageBackground, "#f7f7f4");
  const textColor = safeCssColor(colors.textColor, "#111111");
  const mutedTextColor = safeCssColor(colors.mutedTextColor, "#5f5f58");
  const surfaceColor = safeCssColor(colors.surfaceColor, "#efefe9");
  const darkPageBackground = safeCssColor(
    builderDarkScheme.pageBackground,
    "#101010",
  );
  const darkTextColor = safeCssColor(builderDarkScheme.textColor, "#f7f7f1");
  const darkMutedTextColor = safeCssColor(
    builderDarkScheme.mutedTextColor,
    "#c8c8be",
  );
  const darkSurfaceColor = safeCssColor(
    builderDarkScheme.surfaceColor,
    "#24241f",
  );
  const darkButtonBackground = safeCssColor(
    builderDarkScheme.buttonBackground,
    "#f7f7f1",
  );
  const darkButtonTextColor = safeCssColor(
    builderDarkScheme.buttonTextColor,
    "#101010",
  );

  return `
body:has(.shop-builder-main[data-builder-page-root]) {
  --page-bg: ${pageBackground};
  --surface-main: ${pageBackground};
  --surface-muted: ${surfaceColor};
  --surface-soft: ${surfaceColor};
  --text-main: ${textColor};
  --text-muted: ${mutedTextColor};
  background: ${pageBackground};
  color: ${textColor};
}

body:has(.shop-builder-main[data-builder-page-root]) .site-main {
  background: ${pageBackground};
}

[data-theme="dark"] body:has(.shop-builder-main[data-builder-page-root]) {
  --page-bg: ${darkPageBackground};
  --surface-main: ${darkPageBackground};
  --surface-muted: ${darkSurfaceColor};
  --surface-soft: ${darkSurfaceColor};
  --text-main: ${darkTextColor};
  --text-muted: ${darkMutedTextColor};
  background: ${darkPageBackground};
  color: ${darkTextColor};
}

[data-theme="dark"] body:has(.shop-builder-main[data-builder-page-root]) .site-main,
[data-theme="dark"] body:has(.shop-builder-main[data-builder-page-root]) .shop-builder-main[data-builder-page-root] {
  --builder-text: ${darkTextColor};
  --builder-muted: ${darkMutedTextColor};
  --builder-surface: ${darkSurfaceColor};
  --builder-button-bg: ${darkButtonBackground};
  --builder-button-text: ${darkButtonTextColor};
  background: ${darkPageBackground} !important;
  color: ${darkTextColor} !important;
}
`;
}

async function BuilderProductsSection({
  section,
  products: productsOverride,
  categoryTree,
  activeCategorySlug,
  website,
}: {
  section: BuilderSection;
  products?: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  website?: SaaSWebsite | null;
}) {
  const isPaginationEnabled = section.pagination?.enabled ?? false;
  const pageSize = isPaginationEnabled
    ? (section.pagination?.perPage ?? 12)
    : typeof section.gridLimit === "number" && section.gridLimit >= 4
      ? Math.min(Math.round(section.gridLimit), 48)
      : 24;
  const fetchLimit = isPaginationEnabled ? 200 : Math.max(pageSize, 48);
  const source =
    section.source === "featured" || section.source === "category"
      ? section.source
      : "all";
  const products =
    productsOverride ??
    (await getProductsForGrid({
      limit: fetchLimit,
      source,
      categoryId: section.categoryId,
      website,
    }));

  if (section.layoutVariant === "carousel") {
    return (
      <ProductCarousel
        products={products.slice(0, pageSize)}
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
        categoryTree={categoryTree}
      />
    );
  }
  const resolvedCategoryTree =
    categoryTree ?? (await getCategoryTree({ website }).catch(() => []));

  return (
    <CategoryWithFilters
      products={products}
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
      categoryTree={resolvedCategoryTree}
      activeCategorySlug={activeCategorySlug}
      pagination={section.pagination}
    />
  );
}

function getSpacingValue(
  value: string | undefined,
  context: BuilderSpacingContext,
) {
  if (!value || value === "inherit") return undefined;
  return resolveBuilderSpacing(value, context).css;
}

function sectionStyle(
  section: BuilderSection,
  layoutScheme: "light" | "dark" | "auto" = "light",
): BuilderStyle {
  const colorScheme = resolveSectionColorScheme(section, layoutScheme);
  const visual = section.visualStyle as BuilderVisualStyle | undefined;
  const resolvedBackground = resolveSectionBackground(section);
  const contextVars = getContextVars(colorScheme, resolvedBackground.override);
  const styleObj: BuilderStyle = {
    background: resolvedBackground.override,
    "--builder-section-padding-top": getSpacingValue(
      section.topSpacing,
      "sectionPadding",
    ),
    "--builder-section-padding-bottom": getSpacingValue(
      section.bottomSpacing,
      "sectionPadding",
    ),
    "--builder-section-margin-top": getSpacingValue(
      section.topMargin,
      "sectionMargin",
    ),
    "--builder-section-margin-bottom": getSpacingValue(
      section.bottomMargin,
      "sectionMargin",
    ),
    ...contextVars,
    ...sectionBackgroundImageVariables(section),
    ...visualStyleToCss(visual),
  };

  if (section.borderRadius !== undefined) {
    styleObj["--builder-radius"] = `${section.borderRadius}px`;
    styleObj["--builder-card-radius"] = `${section.borderRadius}px`;
  }

  return styleObj as BuilderStyle;
}

export function getBuilderSectionClassName(
  section: BuilderSection,
  layoutScheme: "light" | "dark" | "auto" = "light",
  extra?: string,
) {
  const mode = section.backgroundMode === "boxed" ? "boxed" : "full";
  const maxWidth = section.maxWidth ?? section.contentMode ?? "boxed";
  const scheme = resolveSectionColorScheme(section, layoutScheme);
  const visualClass = visualStyleClassName(
    section.visualStyle as BuilderVisualStyle | undefined,
  );
  const heightClass = `shop-builder-section--height-${section.sectionHeight ?? "auto"}`;
  const verticalAlignClass = `shop-builder-section--align-${section.contentVerticalAlign ?? "top"}`;
  const uikitSectionPad = getUikitSectionPaddingClass(
    section.sectionPadding ?? section.topSpacing ?? (section as any).sectionPaddingTop,
  );
  const uikitSectionStyle = sectionBackgroundClass(resolveSectionBackground(section).role);
  const preserveColorClass = section.preserveColor ? "uk-preserve-color" : "";
  const overlapClass = section.overlap ? "uk-section-overlap" : "";
  const textColorClass = section.textColor === "light" ? "uk-light" : section.textColor === "dark" ? "uk-dark" : "";
  const removeTopPadClass = section.removeTopPadding ? "uk-padding-remove-top" : "";
  const removeBottomPadClass = section.removeBottomPadding ? "uk-padding-remove-bottom" : "";
  const removeHorizontalPadClass = section.removeHorizontalPadding
    ? "uk-padding-remove-horizontal"
    : "";
  const expandSideClass =
    section.expandOneSide && section.expandOneSide !== "none"
      ? `shop-builder-section--expand-${section.expandOneSide}`
      : "";
  const titlePosition = normalizeSectionTitlePosition(section.sectionTitlePosition);
  const titlePositionClass =
    titlePosition !== "none"
      ? `shop-builder-section--title-${titlePosition}`
      : "";
  const titleRotationClass =
    section.sectionTitleRotation && section.sectionTitleRotation !== "none"
      ? `shop-builder-section--title-rotate-${section.sectionTitleRotation}`
      : "";
  const imageClass = section.visualStyle?.background?.imageUrl
    ? "shop-builder-section--has-background-image"
    : "";

  return `${uikitSectionPad} ${uikitSectionStyle} ${preserveColorClass} ${overlapClass} ${textColorClass} ${removeTopPadClass} ${removeBottomPadClass} ${removeHorizontalPadClass} ${expandSideClass} ${titlePositionClass} ${titleRotationClass} ${imageClass} shop-builder-section shop-builder-section--${mode} shop-builder-section--content-${maxWidth} shop-builder-section--scheme-${scheme} ${heightClass} ${verticalAlignClass} ${visualClass} ${animationClassName(section.animation)} ${extra}`.trim();
}

function SectionFrame({
  section,
  layoutScheme = "light",
  extra,
  builderInteractionIdentity = false,
  children,
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
  extra?: string;
  builderInteractionIdentity?: boolean;
  children: ReactNode;
}) {
  const ComponentTag = (section.htmlElement || "section") as any;
  const animationAttrs = animationDataAttributes(section.animation);
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
  const isAntigravity = section.backgroundEffect === "antigravity";
  const isFullTheme =
    isAntigravity &&
    (section.antigravityVisualMode === undefined ||
      section.antigravityVisualMode === "full");

  return (
    <ComponentTag
      id={section.anchorId || section.id}
      data-builder-section-id={section.id}
      data-builder-object-type={builderInteractionIdentity ? "section" : undefined}
      className={`${getBuilderSectionClassName(section, layoutScheme, extra)} ${
        isFullTheme
          ? "shop-builder-section--effect-antigravity"
          : isAnimatedBg
            ? "relative overflow-hidden"
            : ""
      }`}
      style={{
        ...sectionStyle(section, layoutScheme),
        ...animationAttrs.style,
        "--shop-builder-section-height-offset":
          section.heightOffset === undefined ? undefined : `${section.heightOffset}${typeof section.heightOffset === "number" ? "px" : ""}`,
      }}
      data-gsap-section={section.kind === "hero" ? "hero" : section.kind}
      data-builder-html-element={section.htmlElement || "section"}
      data-section-title-breakpoint={normalizeSectionTitleBreakpoint(section.sectionTitleBreakpoint)}
      data-subtract-height-above={section.subtractHeightAbove || undefined}
      data-uk-sticky={section.stickyEffect && section.stickyEffect !== "none" ? `cls-active: uk-navbar-sticky; ${section.stickyEffect === "reveal" ? "show-on-up: true" : ""}` : undefined}
      {...animationAttrs.data}
    >
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
          {isAntigravity && section.antigravityShowGrid !== false && (
            <div
              className="antigravity-grid-overlay"
              aria-hidden="true"
              style={
                section.antigravityGridMoveSpeed !== undefined ||
                section.antigravityColor
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
      <div
        className={`shop-builder-section-content ${getUikitContainerClass(section.contentMode)}`}
        data-gsap-stagger={
          section.kind === "hero" || section.kind === "embed" ? undefined : true
        }
      >
        {children}
      </div>
    </ComponentTag>
  );
}

function ProductsSkeleton() {
  return (
    <div className="mt-4">
      <div className="product-grid">
        {Array.from({ length: 12 }).map((_, index) => (
          <div key={index} className="product-card">
            <div className="product-image animate-pulse rounded-lg bg-slate-800/40" />
            <div className="mt-2 space-y-2">
              <div className="h-4 w-3/4 animate-pulse rounded bg-slate-800/60" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroSection({
  section,
  product,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  product?: StorefrontBuilderProduct;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  const isProductTemplate = Boolean(
    product && section.id.includes("template-product"),
  );

  const isAntigravity = section.carouselSettings?.variant === "antigravity";

  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra={`shop-builder-hero ${isAntigravity ? "shop-builder-hero--antigravity" : ""}`}
    >
      <div data-gsap-hero-item className="shop-builder-hero-content-left">
        {section.eyebrow && (
          <Typog
            as="p"
            className="uk-label uk-label-primary"
            typography={section.typography}
          >
            {section.eyebrow}
          </Typog>
        )}
        <Typog
          as="h1"
          className={`shop-builder-title ${isAntigravity ? "shop-builder-title--gradient" : ""}`}
          typography={section.typography}
        >
          {isProductTemplate ? (
            product?.name
          ) : isAntigravity && section.title ? (
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
        </Typog>
        {(isProductTemplate ? product?.priceFormatted : section.body) && (
          <Typog
            as="p"
            className="shop-builder-body"
            typography={section.typography}
          >
            {isProductTemplate ? product?.priceFormatted : section.body}
          </Typog>
        )}
        {section.buttonLabel && section.buttonUrl && (
          <Typog
            as="a"
            className={`shop-builder-cta ${isAntigravity ? "shop-builder-cta--antigravity" : ""}`}
            href={section.buttonUrl}
            {...builderLinkTargetProps(section.buttonTarget)}
            typography={section.typography}
          >
            {section.buttonLabel}
          </Typog>
        )}
      </div>
      {isAntigravity ? (
        <div
          className="shop-builder-hero-media shop-builder-hero-media--antigravity"
          data-gsap-hero-item
        >
          <AntigravityTerminal />
        </div>
      ) : isProductTemplate && product?.imageUrl ? (
        <div
          className="shop-builder-hero-media shop-builder-hero-media--image"
          role="img"
          aria-label={product.name}
          data-gsap-hero-item
          data-gsap-float
          style={{ backgroundImage: `url(${product.imageUrl})` }}
        />
      ) : (
        <div
          className="shop-builder-hero-media"
          aria-hidden="true"
          data-gsap-hero-item
          data-gsap-float
        />
      )}
    </SectionFrame>
  );
}

function PromoSection({
  section,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra={`shop-builder-promo shop-builder-promo--${
        section.promoVariant ?? "default"
      }`}
    >
      <div className="shop-builder-section-heading">
        <h2 className="shop-builder-title" data-builder-section-title>{section.title}</h2>
        <BodyText className="shop-builder-body">{section.body}</BodyText>
      </div>
      {section.ctaLabel && section.ctaUrl && (
        <a
          className="shop-builder-cta shop-builder-cta--light"
          href={section.ctaUrl}
        >
          {section.ctaLabel}
        </a>
      )}
    </SectionFrame>
  );
}

async function FilterPillsSection({
  section,
  layoutScheme = "light",
  website,
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
  website?: SaaSWebsite | null;
}) {
  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-filters"
    >
      {section.title && <h2 className="shop-builder-title">{section.title}</h2>}
      <CategoryFiltersBlock website={website} />
    </SectionFrame>
  );
}

function BadgeGridSection({
  section,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  const badges = section.badges?.length
    ? section.badges
    : [
        {
          id: "one",
          label: "01",
          title: "Fast setup",
          body: "Reusable client-ready settings.",
        },
        {
          id: "two",
          label: "02",
          title: "Clean layouts",
          body: "Flat sections with simple controls.",
        },
        {
          id: "three",
          label: "03",
          title: "Woo data",
          body: "Products stay powered by WordPress.",
        },
      ];

  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-badge-grid"
    >
      <div>
        {section.eyebrow && (
          <p className="uk-label uk-label-primary">{section.eyebrow}</p>
        )}
        <h2 className="shop-builder-title">{section.title}</h2>
        <BodyText className="shop-builder-body">{section.body}</BodyText>
      </div>
      <div
        className="shop-builder-badges"
        style={
          { "--builder-badge-columns": section.columns ?? 3 } as CSSProperties
        }
      >
        {badges.map((badge, index) => (
          <article key={badge.id ?? index} className="shop-builder-badge-card">
            {badge.label && <span>{badge.label}</span>}
            {badge.title && (
              <h3><BuilderLineBreakText text={badge.title} /></h3>
            )}
            <BodyText>{badge.body}</BodyText>
            {badge.items && badge.items.length > 0 && (
              <RenderChecklist
                items={badge.items}
                iconName={badge.listIcon || "check"}
                colorScheme={badge.listIconColorScheme || "default"}
                iconSize={badge.listIconSize}
              />
            )}
          </article>
        ))}
      </div>
    </SectionFrame>
  );
}

function getBlockButtonItems(block: BuilderLayoutBlock) {
  const items: {
    key: string;
    label: string;
    url: string;
    target?: "_self" | "_blank" | string;
    style?: string;
    size?: string;
  }[] = [];

  if (block.buttonLabel && block.buttonUrl) {
    items.push({
      key: "primary",
      label: block.buttonLabel,
      url: block.buttonUrl,
      target: block.buttonTarget,
      style: block.buttonStyle ?? "primary",
      size: block.size ?? "default",
    });
  }

  if (block.secondaryButtonLabel && block.secondaryButtonUrl) {
    items.push({
      key: "secondary",
      label: block.secondaryButtonLabel,
      url: block.secondaryButtonUrl,
      target: block.secondaryButtonTarget,
      style: block.secondaryButtonStyle ?? "secondary",
      size: block.secondaryButtonSize ?? "default",
    });
  }

  if (block.kind === "hero") return items;

  (block.buttons ?? []).forEach((button, index) => {
    if (!button.label || !button.url) return;
    items.push({
      key: button.id ?? `button-${index}`,
      label: button.label,
      url: button.url,
      target: button.target,
      style: button.style ?? "primary",
      size: button.size ?? "default",
    });
  });

  return items;
}

async function CategoryFiltersBlock({
  hiddenCategorySlugs = [],
  website,
}: {
  hiddenCategorySlugs?: string[];
  website?: SaaSWebsite | null;
}) {
  const [flatCategories, categoryTree] = await Promise.all([
    getProductCategories({ website }),
    getCategoryTree({ website }).catch(() => []),
  ]);

  const countsBySlug: Record<string, number> = {};
  flatCategories.forEach((cat: ProductCategory) => {
    countsBySlug[cat.slug] = cat.count;
  });

  return categoryTree.length > 0 ? (
    <CategoryBar
      categoryTree={categoryTree}
      countsBySlug={countsBySlug}
      hiddenCategorySlugs={hiddenCategorySlugs}
    />
  ) : (
    <div className="shop-builder-filter-pills">
      <span>Women</span>
      <span>Men</span>
      <span>Boots</span>
      <span>Accessories</span>
    </div>
  );
}

async function ContentProductsBlock({
  block,
  categoryTree,
  activeCategorySlug,
  website,
}: {
  block: BuilderLayoutBlock;
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  website?: SaaSWebsite | null;
}) {
  const isPaginationEnabled = block.pagination?.enabled ?? false;
  const originalLimit =
    typeof block.gridLimit === "number" && block.gridLimit >= 2
      ? Math.min(Math.round(block.gridLimit), 12)
      : 4;
  const limit = isPaginationEnabled ? 200 : originalLimit;

  const products = await getProductsForGrid({
    limit,
    source:
      block.source === "featured" || block.source === "category"
        ? block.source
        : "all",
    categoryId: block.categoryId,
    website,
  });

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
    ...visualStyleToCss(block.visualStyle as BuilderVisualStyle | undefined),
  } as React.CSSProperties;
  const productVisualClass = visualStyleClassName(
    block.visualStyle as BuilderVisualStyle | undefined,
  );

  if (block.layoutVariant === "carousel") {
    return (
      <div className={productVisualClass} style={productStyleProps}>
        <ProductCarousel
          products={products}
          preset={block.cardPreset ?? "standard"}
          cardStyle={block.cardStyle}
          cardTheme={block.panelStyle}
          gridImageFrame={block.gridImageFrame}
          imagePadding={block.imagePadding}
          imageFit={block.imageFit}
          imageRatio={block.imageRatio as "auto" | "square" | "4:5" | "3:4" | "16:9" | undefined}
          borderRadius={block.borderRadius}
          addToCartStyle={block.addToCartStyle}
          addToCartSize={block.addToCartSize}
          addToCartDisplay={block.addToCartDisplay}
          addToCartVisibility={block.addToCartVisibility}
          addToCartPosition={block.addToCartPosition}
          typography={block.typography}
          categoryTree={categoryTree}
        />
      </div>
    );
  }
  const resolvedCategoryTree =
    categoryTree ?? (await getCategoryTree({ website }).catch(() => []));

  return (
    <div
      className={`shop-builder-grid--margin-${blockLegacyGridMargin(block)} shop-card-preset--${block.panelStyle ?? "default"} ${productVisualClass}`}
      style={productStyleProps}
    >
      <CategoryWithFilters
        products={products}
        columns={block.columns}
        filterPosition={block.filterPosition ?? "hidden"}
        cardStyle={block.cardStyle}
        cardPreset={block.cardPreset}
        cardTheme={block.panelStyle}
        pageSize={originalLimit}
        gridGap={block.gridGap}
        cardPadding={block.cardPadding}
        imagePadding={block.imagePadding}
        imageFit={block.imageFit}
        imageRatio={block.imageRatio as "auto" | "square" | "4:5" | "3:4" | "16:9" | undefined}
        imageFrame={block.gridImageFrame}
        borderRadius={block.borderRadius}
        addToCartStyle={block.addToCartStyle}
        addToCartSize={block.addToCartSize}
        addToCartPosition={block.addToCartPosition}
        addToCartVisibility={block.addToCartVisibility}
        addToCartDisplay={block.addToCartDisplay}
        hiddenCategorySlugs={block.hiddenCategorySlugs}
        categoryTree={resolvedCategoryTree}
        activeCategorySlug={activeCategorySlug}
        typography={block.typography}
        pagination={block.pagination}
      />
    </div>
  );
}

import { GridCardsClient } from "@/components/builder/GridCardsClient";

function GridCards({
  block,
  items,
}: {
  block: BuilderLayoutBlock;
  items: Array<any>;
}) {
  const limit =
    typeof block.gridLimit === "number" && block.gridLimit > 0
      ? block.gridLimit
      : block.gridSource === "products"
        ? Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1))
        : items.length || 999;
  const gridTitleStyle = {
    color: "var(--builder-card-title-color, inherit)",
    fontSize: "var(--builder-card-title-size, inherit)",
    fontWeight: "var(--builder-card-title-weight, inherit)",
    textAlign:
      "var(--builder-card-title-align, inherit)" as CSSProperties["textAlign"],
    margin: "var(--builder-card-title-margin, 0)",
  } as CSSProperties;
  const gridGapClass = gridSpacingClass(
    block.gridGap,
    ["none", "small", "medium", "large", "max"],
    "medium",
  );
  const gridGapCustom =
    gridGapClass === "custom" ? cssSpacingValue(block.gridGap) : null;
  const isAlignWithoutPadding = Boolean((block as any).alignImageWithoutPadding);
  const imagePaddingClass = isAlignWithoutPadding
    ? "frameless"
    : gridSpacingClass(
        block.gridImagePadding,
        ["frameless", "none", "small", "medium", "max"],
        "none",
      );
  const imagePaddingCustom =
    imagePaddingClass === "custom"
      ? cssSpacingValue(block.gridImagePadding)
      : null;
  const contentPaddingClass = gridSpacingClass(
    block.gridContentPadding,
    ["none", "small", "medium", "large"],
    "medium",
  );
  const contentPaddingCustom =
    contentPaddingClass === "custom"
      ? cssSpacingValue(block.gridContentPadding)
      : null;

  return (
    <GridCardsClient
      block={block}
      items={items}
      gridTitleStyle={gridTitleStyle}
      gridGapClass={gridGapClass}
      gridGapCustom={gridGapCustom}
      imagePaddingClass={imagePaddingClass}
      imagePaddingCustom={imagePaddingCustom}
      contentPaddingClass={contentPaddingClass}
      contentPaddingCustom={contentPaddingCustom}
      limit={limit}
    />
  );
}

function ContentGridBlock({ block }: { block: BuilderLayoutBlock }) {
  return (
    <GridCards
      block={block}
      items={(block.gridItems ?? []).map((item, index) => ({
        id: item.id ?? `${block.id}-grid-${index}`,
        ...item,
      }))}
    />
  );
}

function ProductSummaryBlock({
  product,
  typography,
}: {
  product: StorefrontBuilderProduct;
  typography?: any;
}) {
  return (
    <div className="shop-builder-product-summary">
      <div className="product-header-row">
        <Typog as="h3" typography={typography}>
          {product.name}
        </Typog>
        <WishlistToggle
          id={product.id}
          slug={product.slug}
          name={product.name}
          imageUrl={product.imageUrl ?? undefined}
        />
      </div>

      {product.priceFormatted && (
        <div className="shop-builder-product-price">
          {product.priceFormatted}
        </div>
      )}

      <ProductOptionsSelector
        id={product.id}
        slug={product.slug}
        name={product.name}
        priceNumber={product.priceNumber}
        imageUrl={product.imageUrl}
        attributes={product.attributes}
      />

      {product.attributes.length > 0 && (
        <div className="shop-builder-product-attributes">
          <strong>Product Details</strong>
          <ul>
            {product.attributes.map((attr) => (
              <li key={attr.name}>
                <span>{attr.label}</span>
                <em>{attr.options.join(", ")}</em>
              </li>
            ))}
          </ul>
        </div>
      )}

      {product.description && (
        <div
          className="shop-builder-product-description"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}
    </div>
  );
}

function ProductDynamicBlock({
  kind,
  product,
  block,
}: {
  kind: string | undefined;
  product: StorefrontBuilderProduct;
  block?: BuilderLayoutBlock;
}) {
  if (kind === "productHero") {
    return (
      <div className="shop-builder-premium-product-hero">
        <div className="shop-builder-premium-product-media">
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className="shop-builder-premium-product-copy">
          <span>Featured Product</span>
          <div className="product-header-row">
            <Typog as="h3" typography={block?.typography}>
              {product.name}
            </Typog>
            <WishlistToggle
              id={product.id}
              slug={product.slug}
              name={product.name}
              imageUrl={product.imageUrl ?? undefined}
            />
          </div>
          {product.priceFormatted && (
            <div className="shop-builder-product-price">
              {product.priceFormatted}
            </div>
          )}
          {product.description && (
            <div
              className="shop-builder-product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}
          <ProductOptionsSelector
            id={product.id}
            slug={product.slug}
            name={product.name}
            priceNumber={product.priceNumber}
            imageUrl={product.imageUrl}
            attributes={product.attributes}
          />
        </div>
      </div>
    );
  }

  if (kind === "productInfoStack") {
    return (
      <div className="shop-builder-product-info-stack">
        <div className="product-header-row">
          <Typog as="h3" typography={block?.typography}>
            {product.name}
          </Typog>
          <WishlistToggle
            id={product.id}
            slug={product.slug}
            name={product.name}
            imageUrl={product.imageUrl ?? undefined}
          />
        </div>
        {product.priceFormatted && (
          <div className="shop-builder-product-price">
            {product.priceFormatted}
          </div>
        )}
        {product.description && (
          <div
            className="shop-builder-product-description"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        )}
        <ProductOptionsSelector
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceNumber={product.priceNumber}
          imageUrl={product.imageUrl}
          attributes={product.attributes}
        />
      </div>
    );
  }

  if (kind === "productPurchasePanel") {
    return (
      <div className="shop-builder-product-purchase-panel">
        <span>Ready to order</span>
        <Typog as="h3" typography={block?.typography}>
          {product.name}
        </Typog>
        {product.priceFormatted && (
          <div className="shop-builder-product-price">
            {product.priceFormatted}
          </div>
        )}
        <ProductOptionsSelector
          id={product.id}
          slug={product.slug}
          name={product.name}
          priceNumber={product.priceNumber}
          imageUrl={product.imageUrl}
          attributes={product.attributes}
        />
      </div>
    );
  }

  if (kind === "productSpecsPanel") {
    return product.attributes.length > 0 ? (
      <div className="shop-builder-product-specs-panel">
        <span>Specifications</span>
        <div className="shop-builder-product-attributes">
          <ul>
            {product.attributes.map((attr) => (
              <li key={attr.name}>
                <span>{attr.label}</span>
                <em>{attr.options.join(", ")}</em>
              </li>
            ))}
          </ul>
        </div>
      </div>
    ) : null;
  }

  if (kind === "productGallery") {
    return (
      <ProductGallery
        images={product.images}
        name={product.name}
        showThumbnails={block?.galleryShowThumbnails !== false}
        thumbnailPosition={
          block?.galleryThumbnailPosition === "left" ? "left" : "bottom"
        }
        imageFit={block?.galleryImageFit === "cover" ? "cover" : "contain"}
        height={block?.galleryHeight}
      />
    );
  }

  if (kind === "productTitle") {
    return (
      <div className="product-header-row">
        <Typog as="h3" typography={block?.typography}>
          {product.name}
        </Typog>
        <WishlistToggle
          id={product.id}
          slug={product.slug}
          name={product.name}
          imageUrl={product.imageUrl ?? undefined}
        />
      </div>
    );
  }

  if (kind === "productPrice") {
    return product.priceFormatted ? (
      <div className="shop-builder-product-price">{product.priceFormatted}</div>
    ) : null;
  }

  if (kind === "productAddToCart") {
    return (
      <ProductOptionsSelector
        id={product.id}
        slug={product.slug}
        name={product.name}
        priceNumber={product.priceNumber}
        imageUrl={product.imageUrl}
        attributes={product.attributes}
      />
    );
  }

  if (kind === "productAttributes") {
    return product.attributes.length > 0 ? (
      <div className="shop-builder-product-attributes">
        <strong>Product Details</strong>
        <ul>
          {product.attributes.map((attr) => (
            <li key={attr.name}>
              <span>{attr.label}</span>
              <em>{attr.options.join(", ")}</em>
            </li>
          ))}
        </ul>
      </div>
    ) : null;
  }

  if (kind === "productDescription") {
    return product.description ? (
      <div
        className="shop-builder-product-description"
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    ) : null;
  }

  return null;
}

function GoodieIcon({ iconName, size = 24 }: { iconName: string | undefined; size?: number }) {
  return <WebPagesIcon name={iconName} size={size} />;
}

export function ContentLayoutBlock({
  block,
  product,
  breadcrumbItems,
  page,
  pageContent,
  categoryTree,
  activeCategorySlug,
  website,
  shellSettings,
  parentScheme = "light",
}: {
  block: BuilderLayoutBlock;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page?: BuilderLayoutKey;
  pageContent?: ReactNode;
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  website?: SaaSWebsite | null;
  shellSettings?: Partial<BuilderShellSettings>;
  parentScheme?: "light" | "dark";
}) {
  if (block.kind === "accordion") {
    return (
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
    );
  }

  if (block.kind === "text") {
    return (
      <UikitText
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
        margin={(block as any).margin}
        animation={typeof block.animation === "string" ? block.animation : (block.animation as any)?.preset}
        visibility={(block as any).visibility}
      />
    );
  }

  if (block.kind === "button") {
    return <UikitButton block={block} />;
  }

  if (block.kind === "breadcrumbs") {
    return <UikitBreadcrumbs block={block} items={breadcrumbItems} />;
  }

  if (block.kind === "categoryFilters") {
    return <UikitCategoryFilters block={block as any} />;
  }

  if (product && block.id?.includes("product-media")) {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--product-media">
        <ProductDynamicBlock
          kind="productGallery"
          product={product}
          block={block}
        />
      </div>
    );
  }

  if (product && block.id?.includes("product-summary")) {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--product-summary">
        <ProductSummaryBlock product={product} typography={block.typography} />
      </div>
    );
  }

  if (
    product &&
    block.kind !== "products" &&
    block.kind?.startsWith("product")
  ) {
    return (
      <div
        className={`shop-builder-column-block shop-builder-column-block--${block.kind}`}
      >
        <ProductDynamicBlock
          kind={block.kind}
          product={product}
          block={block}
        />
      </div>
    );
  }

  if (block.kind === "panelSlider") {
    return <UikitSlider block={block as any} panelMode shellSettings={shellSettings} />;
  }

  if (block.kind === "slider" || block.kind === "slideshow" || block.kind === "overlaySlider") {
    return <UikitSlider block={block as any} shellSettings={shellSettings} />;
  }

  if (block.kind === "scrollPinnedDemo") {
    return (
      <div
        className="shop-builder-column-block shop-builder-column-block--scroll-pinned"
        style={blockSurfaceStyle(block, parentScheme)}
      >
        <ScrollPinnedDemo block={block} />
      </div>
    );
  }

  if (block.kind === "embed") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--embed">
        {block.title && (
          <Typog as="h3" typography={block.typography}>
            <BuilderLineBreakText text={block.title} />
          </Typog>
        )}
        {block.body && (
          <Typog as="p" typography={block.typography}>
            {block.body}
          </Typog>
        )}
        <EmbedSectionClient
          mode={block.embedMode}
          code={block.embedCode}
          url={block.embedUrl}
          height={block.embedHeight}
          title={block.title}
        />
      </div>
    );
  }

  if (block.kind === "fluentForm") {
    return <UikitFluentForm block={block as any} />;
  }

  if (block.kind === "badgeGrid") {
    return <UikitBadgeGrid block={block as any} />;
  }

  if (block.kind === "products") {
    return <UikitProducts block={block as any} productContexts={(block as any).dynamicProductContexts} />;
  }

  if (block.kind === "grid") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--grid">
        <Suspense fallback={<ProductsSkeleton />}>
          <ContentGridBlock block={block} />
        </Suspense>
      </div>
    );
  }

  if (block.kind === "icon") {
    return <UikitIcon block={block} />;
  }

  if (block.kind === "list") {
    return <UikitList block={block} />;
  }

  if (block.kind === "divider") {
    return <UikitDivider block={block} />;
  }

  if (block.kind === "alert") {
    return <UikitAlert block={block} />;
  }

  if (block.kind === "heading") {
    return <UikitHeading block={block as any} />;
  }

  if (block.kind === "gallery") {
    return <UikitGallery block={block as any} />;
  }

  if (block.kind === "datePicker") {
    return <UikitDatePicker block={block as any} />;
  }

  if (block.kind === "cartContent") {
    return page === "page:cart" ? (
      (pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <Typog as="h3">Cart content</Typog>
          <Typog as="p">The live cart UI will render here.</Typog>
        </div>
      ))
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <Typog as="h3">Cart content</Typog>
        <Typog as="p">Use this block on the Cart page.</Typog>
      </div>
    );
  }

  if (block.kind === "checkoutContent") {
    return page === "page:checkout" ? (
      (pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <Typog as="h3">Checkout content</Typog>
          <Typog as="p">The live checkout UI will render here.</Typog>
        </div>
      ))
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <Typog as="h3">Checkout content</Typog>
        <Typog as="p">Use this block on the Checkout page.</Typog>
      </div>
    );
  }

  if (block.kind === "accountContent") {
    return page === "page:my-account" ? (
      (pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <Typog as="h3">My account content</Typog>
          <Typog as="p">The live account UI will render here.</Typog>
        </div>
      ))
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <Typog as="h3">My account content</Typog>
        <Typog as="p">Use this block on the My Account page.</Typog>
      </div>
    );
  }

  if (block.kind === "hero") {
    const isBlockAntigravity =
      block.carouselSettings?.variant === "antigravity";
    const isGradient =
      block.textGradientPreset && block.textGradientPreset !== "none";
    const isCustom = block.textGradientPreset === "custom";
    const titleClassName =
      isGradient && !isCustom
        ? `text-gradient--${block.textGradientPreset}`
        : isBlockAntigravity
          ? "shop-builder-title--gradient"
          : "";
    const heroHeadingClass = [
      getUikitHeadingClass(block.heroHeadingElement ?? "h2", block.heroHeadingStyle ?? "xlarge"),
      titleClassName,
      typographyRoleClass(block.titleTypographyRole),
      block.heroContentAlign ? `uk-text-${block.heroContentAlign}` : "",
    ].filter(Boolean).join(" ");
    const heroMetaClass = [
      "shop-builder-eyebrow",
      typographyRoleClass(block.metaTypographyRole),
      getUikitTextClass((block as any).metaStyle),
    ].filter(Boolean).join(" ");
    const heroContentClass = [
      typographyRoleClass(block.contentTypographyRole),
      getUikitTextClass((block as any).contentStyle),
    ].filter(Boolean).join(" ");
    const HeroHeading = (block.heroHeadingElement ?? "h2") as any;
    const customStyle = isCustom
      ? {
          backgroundImage: `linear-gradient(${block.textGradientCustomAngle ?? 135}deg, ${block.textGradientCustomStart ?? "#ffffff"} ${block.textGradientCustomStartOffset ?? 0}%, ${block.textGradientCustomMiddle ?? "#60a5fa"} ${block.textGradientCustomMiddleOffset ?? 50}%, ${block.textGradientCustomEnd ?? "#c084fc"} ${block.textGradientCustomEndOffset ?? 100}%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          display: "inline-block",
        }
      : {};
    const buttonItems = getBlockButtonItems(block);

    return (
      <div
        className={`shop-builder-column-block shop-builder-column-block--hero ${typographyRoleClass(block.contentTypographyRole)} ${block.heroContentAlign ? `shop-builder-hero--align-${block.heroContentAlign}` : ""} ${block.heroVerticalAlign ? `shop-builder-hero--valign-${block.heroVerticalAlign}` : ""} ${block.heroHeight ? `shop-builder-hero--height-${block.heroHeight}` : ""} ${block.heroMediaPlacement ? `shop-builder-hero--media-${block.heroMediaPlacement}` : ""} ${block.heroInverse ? "uk-light" : ""} ${isBlockAntigravity ? "shop-builder-hero--antigravity shop-builder-hero--antigravity-block" : ""} ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}
        style={{ textAlign: block.heroContentAlign, maxWidth: block.heroContentWidth === "full" ? "none" : block.heroContentWidth === "small" ? "42rem" : block.heroContentWidth === "medium" ? "56rem" : "72rem" }}
      >
        <div
          className={isBlockAntigravity ? "shop-builder-hero-content-left" : ""}
        >
          {block.eyebrow && (
            <Typog
              as="p"
              className={heroMetaClass}
              area="eyebrow"
              typography={block.typography}
            >
              {block.eyebrow}
            </Typog>
          )}
          {block.title && (
            <Typog
              as={HeroHeading}
              area="title"
              className={heroHeadingClass}
              typography={block.typography}
              style={customStyle}
            >
              {block.typewriterEnabled ? (
                <TypewriterText
                  text={block.title}
                  phrases={block.typewriterPhrases}
                  speed={block.typewriterSpeed}
                  eraseSpeed={block.typewriterEraseSpeed}
                  delay={block.typewriterDelay}
                  loop={block.typewriterLoop}
                  useGradient={block.typewriterUseGradient}
                  gradientPreset={
                    block.textGradientPreset ?? block.typewriterGradientPreset
                  }
                  customStart={block.textGradientCustomStart}
                  customMiddle={block.textGradientCustomMiddle}
                  customEnd={block.textGradientCustomEnd}
                  customAngle={block.textGradientCustomAngle}
                  customStartOffset={block.textGradientCustomStartOffset}
                  customMiddleOffset={block.textGradientCustomMiddleOffset}
                  customEndOffset={block.textGradientCustomEndOffset}
                  typography={block.typography}
                  area="title"
                  preserveHeight={block.typewriterPreserveHeight !== false}
                  reservedLines={block.typewriterReservedLines ?? 1}
                  mobileReservedLines={block.typewriterMobileReservedLines ?? 2}
                />
              ) : isBlockAntigravity ? (
                <TypewriterText
                  text={block.title}
                  phrases={block.typewriterPhrases}
                  speed={block.typewriterSpeed}
                  eraseSpeed={block.typewriterEraseSpeed}
                  delay={block.typewriterDelay}
                  loop={block.typewriterLoop}
                  useGradient={block.typewriterUseGradient}
                  gradientPreset={
                    block.textGradientPreset ?? block.typewriterGradientPreset
                  }
                  customStart={block.textGradientCustomStart}
                  customMiddle={block.textGradientCustomMiddle}
                  customEnd={block.textGradientCustomEnd}
                  customAngle={block.textGradientCustomAngle}
                  customStartOffset={block.textGradientCustomStartOffset}
                  customMiddleOffset={block.textGradientCustomMiddleOffset}
                  customEndOffset={block.textGradientCustomEndOffset}
                  typography={block.typography}
                  area="title"
                  preserveHeight={block.typewriterPreserveHeight !== false}
                  reservedLines={block.typewriterReservedLines ?? 1}
                  mobileReservedLines={block.typewriterMobileReservedLines ?? 2}
                />
              ) : (
                <BuilderLineBreakText text={block.title} />
              )}
            </Typog>
          )}
          {block.body && (
            <Typog as="p" className={heroContentClass} typography={block.typography}>
              {block.typewriterEnabled && !block.title ? (
                <TypewriterText
                  text={block.body}
                  phrases={block.typewriterPhrases}
                  speed={block.typewriterSpeed}
                  eraseSpeed={block.typewriterEraseSpeed}
                  delay={block.typewriterDelay}
                  loop={block.typewriterLoop}
                  useGradient={block.typewriterUseGradient}
                  gradientPreset={
                    block.textGradientPreset ?? block.typewriterGradientPreset
                  }
                  customStart={block.textGradientCustomStart}
                  customMiddle={block.textGradientCustomMiddle}
                  customEnd={block.textGradientCustomEnd}
                  customAngle={block.textGradientCustomAngle}
                  customStartOffset={block.textGradientCustomStartOffset}
                  customMiddleOffset={block.textGradientCustomMiddleOffset}
                  customEndOffset={block.textGradientCustomEndOffset}
                  typography={block.typography}
                  area="body"
                  preserveHeight={block.typewriterPreserveHeight !== false}
                  reservedLines={block.typewriterReservedLines ?? 1}
                  mobileReservedLines={block.typewriterMobileReservedLines ?? 2}
                />
              ) : (
                block.body
              )}
            </Typog>
          )}
          {buttonItems.length > 0 && (
            <div
              className={`shop-builder-buttons ${
                block.premiumButtonStyle &&
                block.premiumButtonStyle !== "default"
                  ? ""
                  : `shop-builder-buttons--${block.buttonsLayout ?? "inline"}`
              }`}
              style={
                {
                  display: "flex",
                  width: "fit-content",
                  maxWidth: "100%",
                  alignItems: "center",
                  flexDirection:
                    block.buttonsLayout === "stacked" ? "column" : "row",
                  flexWrap: "wrap",
                  "--button-group-gap": block.buttonGap || "0.75rem",
                  gap: "var(--button-group-gap, 0.75rem)",
                } as CSSProperties
              }
            >
              {buttonItems.filter((button) => button.key === "primary" ? block.heroPrimaryActionVisible !== false : button.key === "secondary" ? block.heroSecondaryActionVisible !== false : true).map((button) => {
                const isPremium =
                  block.premiumButtonStyle &&
                  block.premiumButtonStyle !== "default";
                return (
                  <a
                    key={button.key}
                    className={`shop-builder-hero-action ${getUikitButtonClass(button.style ?? "primary", button.size ?? "default")}`}
                    href={button.url}
                    {...builderLinkTargetProps(button.target)}
                  >
                    {button.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
        {isBlockAntigravity && (
          <div className="shop-builder-hero-media shop-builder-hero-media--antigravity">
            <AntigravityTerminal />
          </div>
        )}
        {!isBlockAntigravity && block.imageUrl && block.heroMediaPlacement && block.heroMediaPlacement !== "none" && (
          <div className={`shop-builder-hero-media shop-builder-hero-media--${block.heroMediaPlacement}`} style={{ aspectRatio: block.heroMediaRatio && block.heroMediaRatio !== "natural" ? ({ square: "1 / 1", "4:3": "4 / 3", "3:2": "3 / 2", "16:9": "16 / 9", portrait: "3 / 4" } as Record<string, string>)[block.heroMediaRatio] : undefined, overflow: "hidden" }}>
            <img src={block.imageUrl} alt={block.imageAlt || block.title || ""} loading={block.heroMediaLoading ?? "lazy"} style={{ width: "100%", height: "100%", objectFit: block.heroMediaFit === "contain" ? "contain" : "cover" }} />
          </div>
        )}
      </div>
    );
  }



  if (block.kind === "panel") {
    const panelTitleStyle = {
      color: "var(--builder-card-title-color, inherit)",
      textAlign:
        "var(--builder-card-title-align, inherit)" as CSSProperties["textAlign"],
      margin: "var(--builder-card-title-margin, 0)",
    } as CSSProperties;
    const panelMetaStyle = {
      color: "var(--builder-card-meta-color, inherit)",
      fontSize: "var(--builder-card-meta-size, inherit)",
      textTransform:
        "var(--builder-card-meta-transform, none)" as CSSProperties["textTransform"],
      marginTop: "var(--builder-card-meta-spacing, 0)",
    } as CSSProperties;
    const panelBodyStyle = {
      color: "var(--builder-card-content-color, inherit)",
      fontSize: "var(--builder-card-content-size, inherit)",
      lineHeight: "var(--builder-card-content-line-height, inherit)",
      maxWidth: "var(--builder-card-content-max-width, none)",
    } as CSSProperties;
    const panelMediaPlacement = block.panelMediaPlacement ?? "top";
    const panelMediaPresentation = getUikitPanelMediaStyle({ ratio: block.imageRatio, fit: block.imageFit ?? block.panelMediaFit, alignment: block.imageAlignment ?? block.panelMediaAlignment ?? "center", position: (block as any).imagePosition });
    const panelMediaClass = getUikitPanelMediaClass(panelMediaPlacement);
    const panelLayoutClass = getUikitPanelLayoutClass(panelMediaPlacement, block.panelMediaWidth ?? "medium");
    const panelImageDimension = (value: unknown) => value === undefined || value === null || value === "" ? undefined : /^-?\d+(?:\.\d+)?$/.test(String(value)) ? `${value}px` : String(value);
    const panelImageShape = (block as any).imageShape ?? (block as any).imageBorder ?? "none";
    const panelImageRadius = panelImageShape === "circle" ? "50%" : panelImageShape === "pill" ? "9999px" : panelImageShape === "rounded" ? "6px" : undefined;
    const panelImageClass = [
      (block as any).imageShadow && (block as any).imageShadow !== "none" ? `uk-box-shadow-${(block as any).imageShadow}` : "",
      (block as any).imageBoxDecoration && (block as any).imageBoxDecoration !== "none" ? `uk-background-${(block as any).imageBoxDecoration}` : "",
    ].filter(Boolean).join(" ");
    const panelTitleClass = block.panelTitleStyle && block.panelTitleStyle !== "inherit" ? getUikitHeadingClass(block.panelTitleStyle, block.panelTitleStyle) : "";
    const panelShowMedia = block.panelShowMedia !== false;
    const panelPresentation = resolvePanelPresentation(block as Record<string, unknown>);
    const panelMeta = block.eyebrow ? (
      <Typog
        as="span"
        area="eyebrow"
        typography={block.typography}
        className={`shop-builder-panel-meta ${typographyRoleClass(block.metaTypographyRole)}`}
        style={{ ...panelMetaStyle, ...panelPresentation.colorStyle }}
      >
        {block.eyebrow}
      </Typog>
    ) : null;

    return (
      <div data-builder-block-id={block.id} className={`shop-builder-column-block shop-builder-column-block--panel ${panelLayoutClass} ${typographyRoleClass(block.contentTypographyRole)} ${panelPresentation.className}`} style={{ ...panelPresentation.colorStyle }}>
        {panelPresentation.linked && (
          <a
            className="shop-builder-panel-link-overlay"
            href={panelPresentation.linkHref}
            {...builderLinkTargetProps(block.buttonTarget)}
            aria-label={block.title || block.buttonLabel || "Open panel"}
          />
        )}
        {panelShowMedia && (
          <div
            className={`${panelMediaClass} ${panelImageClass} shop-builder-panel-media${block.imageUrl ? "" : " is-empty"}`.trim()}
            role="img"
            aria-label={block.imageAlt || block.title || "Panel image"}
            style={{
              aspectRatio: panelMediaPresentation.aspectRatio,
              position: "relative",
              overflow: "hidden",
              backgroundSize: panelMediaPresentation.backgroundSize,
              backgroundPosition: panelMediaPresentation.backgroundPosition,
              width: panelImageDimension((block as any).imageWidth) ?? "100%",
              maxWidth: typeof (block as any).imageMaxWidth === "number" ? `${(block as any).imageMaxWidth}px` : undefined,
              height: panelImageDimension((block as any).imageHeight),
              borderRadius: panelImageRadius,
              ...(block.imageUrl ? { backgroundImage: `url(${block.imageUrl})` } : {}),
            }}
          />
        )}
        <div className={`uk-card-body shop-builder-panel-content-width-${block.panelContentWidth ?? "auto"}`} style={{ alignSelf: block.panelVerticalAlign === "center" ? "center" : block.panelVerticalAlign === "bottom" ? "end" : "start" }}>
          {panelPresentation.metaPosition === "above-title" && panelMeta}
          {block.title && (
            <Typog
              as={block.panelTitleElement ?? "h3"}
              className={`${panelTitleClass} ${typographyRoleClass(block.titleTypographyRole)}`}
              area="title"
              typography={undefined}
              style={panelTitleStyle}
            >
              {block.typewriterEnabled ? (
                <TypewriterText
                  text={block.title}
                  phrases={block.typewriterPhrases}
                  speed={block.typewriterSpeed}
                  eraseSpeed={block.typewriterEraseSpeed}
                  delay={block.typewriterDelay}
                  loop={block.typewriterLoop}
                  useGradient={block.typewriterUseGradient}
                  gradientPreset={
                    block.textGradientPreset ?? block.typewriterGradientPreset
                  }
                  customStart={block.textGradientCustomStart}
                  customMiddle={block.textGradientCustomMiddle}
                  customEnd={block.textGradientCustomEnd}
                  customAngle={block.textGradientCustomAngle}
                  customStartOffset={block.textGradientCustomStartOffset}
                  customMiddleOffset={block.textGradientCustomMiddleOffset}
                  customEndOffset={block.textGradientCustomEndOffset}
                  typography={block.typography}
                  area="title"
                  preserveHeight={block.typewriterPreserveHeight !== false}
                  reservedLines={block.typewriterReservedLines ?? 1}
                  mobileReservedLines={block.typewriterMobileReservedLines ?? 2}
                />
              ) : (
                <BuilderLineBreakText text={block.title} />
              )}
            </Typog>
          )}
          {(panelPresentation.metaPosition === "below-title" || panelPresentation.metaPosition === "above-content") && panelMeta}
          {block.body && (
            <Typog
              as="p"
              area="body"
              typography={block.typography}
              style={panelBodyStyle}
            >
              {block.typewriterEnabled && !block.title ? (
                <TypewriterText
                  text={block.body}
                  phrases={block.typewriterPhrases}
                  speed={block.typewriterSpeed}
                  eraseSpeed={block.typewriterEraseSpeed}
                  delay={block.typewriterDelay}
                  loop={block.typewriterLoop}
                  useGradient={block.typewriterUseGradient}
                  gradientPreset={
                    block.textGradientPreset ?? block.typewriterGradientPreset
                  }
                  customStart={block.textGradientCustomStart}
                  customMiddle={block.textGradientCustomMiddle}
                  customEnd={block.textGradientCustomEnd}
                  customAngle={block.textGradientCustomAngle}
                  customStartOffset={block.textGradientCustomStartOffset}
                  customMiddleOffset={block.textGradientCustomMiddleOffset}
                  customEndOffset={block.textGradientCustomEndOffset}
                  typography={block.typography}
                  area="body"
                  preserveHeight={block.typewriterPreserveHeight !== false}
                  reservedLines={block.typewriterReservedLines ?? 1}
                  mobileReservedLines={block.typewriterMobileReservedLines ?? 2}
                />
              ) : (
                block.body
              )}
            </Typog>
          )}
          {panelPresentation.metaPosition === "below-content" && panelMeta}

          <RenderChecklist
            items={block.items}
            iconName={block.listIcon}
            colorScheme={block.listIconColorScheme}
            typography={block.typography}
            iconSize={block.listIconSize}
          />

          {!panelPresentation.linked && block.panelActionVisible !== false && block.buttonLabel && block.buttonUrl && (
            <Typog
              as="a"
              area="button"
              className={`shop-builder-cta ${getUikitMarginClass((block as any).linkMarginTop)} ${getUikitButtonClass(block.panelActionStyle ?? block.buttonStyle ?? "primary", block.panelActionSize ?? block.size ?? "default")} ${block.fullWidthButton ? "uk-width-1-1" : ""} shop-builder-panel-action--${block.panelActionAlign ?? "inherit"}`}
              href={block.buttonUrl}
              {...builderLinkTargetProps(block.buttonTarget)}
              typography={block.typography}
            >
              {block.buttonLabel}
            </Typog>
          )}
        </div>
      </div>
    );
  }

  if (block.kind === "image") {
    return <UikitImage block={block} shellSettings={shellSettings} />;
  }

  if (block.kind === "table") {
    return <UikitTable block={block} />;
  }

  return (
    <div className="shop-builder-column-block shop-builder-column-block--text">
      {block.eyebrow && (
        <Typog as="span" area="eyebrow" typography={block.typography}>
          {block.eyebrow}
        </Typog>
      )}
      {block.title && (
        <Typog as="h3" area="title" typography={block.typography}>
          <BuilderLineBreakText text={block.title} />
        </Typog>
      )}
      {block.body && (
        <Typog as="p" area="body" typography={block.typography}>
          {block.body}
        </Typog>
      )}

      <RenderChecklist
        items={block.items}
        iconName={block.listIcon}
        colorScheme={block.listIconColorScheme}
        typography={block.typography}
        iconSize={block.listIconSize}
      />

      <div
        className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
        style={
          {
            display: "flex",
            width: "fit-content",
            maxWidth: "100%",
            flexDirection: block.buttonsLayout === "stacked" ? "column" : "row",
            flexWrap: "wrap",
            "--button-group-gap": block.buttonGap || "0.75rem",
            gap: "var(--button-group-gap, 0.75rem)",
          } as CSSProperties
        }
      >
        {block.buttonLabel && block.buttonUrl && (
          <Typog
            as="a"
            area="button"
            className="shop-builder-cta"
            href={block.buttonUrl}
            {...builderLinkTargetProps(block.buttonTarget)}
            typography={block.typography}
          >
            {block.buttonLabel}
          </Typog>
        )}
        {(block.buttons ?? []).map((btn, btnIdx) => (
          <Typog
            key={btn.id ?? btnIdx}
            as="a"
            area="button"
            className={`shop-builder-cta shop-builder-cta--${btn.style ?? "primary"}`}
            href={btn.url}
            {...builderLinkTargetProps(btn.target)}
            typography={block.typography}
          >
            {btn.label}
          </Typog>
        ))}
      </div>
    </div>
  );
}

function resolveBlockColorSchemeAndBg(
  block: BuilderLayoutBlock,
  parentScheme: "light" | "dark" = "light",
): { scheme: "light" | "dark"; bg: string | undefined } {
  if (block.elementBackgroundMode === "custom" && block.elementBackground) {
    const scheme = resolveColorSchemeForBackground(
      block.elementBackground,
      parentScheme,
    );
    return { scheme, bg: block.elementBackground };
  }
  if (block.elementBackgroundMode === "transparent") {
    return { scheme: parentScheme, bg: "transparent" };
  }

  const style = block.panelStyle ?? "default";
  if (style === "light" || style === "flat-white" || style === "clean-shadow") {
    return { scheme: "light", bg: "#ffffff" };
  }
  if (style === "dark" || style === "flat-dark") {
    return { scheme: "dark", bg: "#111111" };
  }
  if (style === "princity" || style === "princity-flat") {
    return { scheme: "light", bg: "#d8ff65" };
  }
  if (style === "princity-line") {
    return { scheme: "light", bg: "transparent" };
  }

  return { scheme: parentScheme, bg: undefined };
}

function blockSurfaceStyle(
  block: BuilderLayoutBlock,
  parentScheme: "light" | "dark" = "light",
): CSSProperties {
  const visual = block.visualStyle as BuilderVisualStyle | undefined;
  const visualCss = visualStyleToCss(visual);

  const { scheme, bg } = resolveBlockColorSchemeAndBg(block, parentScheme);
  const contextVars = getContextVars(scheme, bg);

  const legacy: BuilderStyle = {};
  // Only set --builder-element-bg when the user explicitly chose a custom
  // element background.  Panel-style presets (dark, light, princity, …)
  // already have their own CSS card-level rules; painting the shell bg here
  // would create a solid-color rectangle around the entire block.
  const isCustomBg =
    block.elementBackgroundMode === "custom" ||
    block.elementBackgroundMode === "transparent";
  const hasSurface =
    block.elementBackgroundMode === "custom" ||
    (block.panelStyle !== undefined && block.panelStyle !== "default") ||
    (block.premiumCardStyle !== undefined &&
      block.premiumCardStyle !== "none") ||
    Boolean(visual?.background);
  if (bg !== undefined && isCustomBg) {
    legacy["--builder-element-bg"] = bg;
  }
  if (block.borderRadius !== undefined) {
    legacy["--builder-radius"] = `${block.borderRadius}px`;
    legacy["--builder-card-radius"] = `${block.borderRadius}px`;
  }
  Object.assign(legacy, builderButtonOverrideCssVars(block));

  return { ...contextVars, ...legacy, ...getGeneralElementShellStyle(block) };
}

function blockShellClassName(block: BuilderLayoutBlock) {
  const visualClass = visualStyleClassName(
    block.visualStyle as BuilderVisualStyle | undefined,
  );
  const premiumCardClass =
    block.premiumCardStyle && block.premiumCardStyle !== "none"
      ? `shop-builder-card--${block.premiumCardStyle}`
      : "";
  const uikitMarginClass = getUikitMarginClass((block as any).elementMargin ?? block.gridMargin);
  const legacySurfaceClass = ["panel", "grid", "hero"].includes(block.kind ?? "")
    ? ""
    : `shop-card-preset--${block.panelStyle ?? "default"}`;
  const advancedClass = resolveElementAdvanced(block).customClass ?? "";
  const generalSpacingClass = getGeneralElementShellClassName(block);
  return `${uikitMarginClass} ${generalSpacingClass} shop-builder-element-shell ${legacySurfaceClass} is-padding-${
    hasBuilderVisualSpacing(
      (block.visualStyle as BuilderVisualStyle | undefined)?.padding,
    )
      ? "none"
      : block.elementPadding && block.elementPadding !== "inherit"
        ? block.elementPadding
        : "none"
  } is-align-${
    block.elementAlign ?? "left"
  } ${visualClass} ${advancedClass} ${animationClassName(block.animation)} ${premiumCardClass}`.trim();
}

const HAS_RICH_TEXT_HTML = /<[a-z][\s\S]*>/i;

export function isRichPreviewText(value: string | null | undefined) {
  return typeof value === "string" && HAS_RICH_TEXT_HTML.test(value);
}

export function getRichTextSafeTag(tag: string) {
  return tag === "p" ? "div" : tag;
}

export function buttonTypographyStyle(
  className: string | undefined,
  style: CSSProperties | undefined,
) {
  if (!style || !String(className || "").includes("cta")) return style;
  const buttonSafeStyle = { ...style };
  delete buttonSafeStyle.color;
  return buttonSafeStyle;
}

export function BodyText({
  children,
  className,
}: {
  children: string | null | undefined;
  className?: string;
}) {
  if (!children) return null;
  if (isRichPreviewText(children)) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }
  return <p className={className}>{children}</p>;
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

function rowContextStyle(
  rowItem: any,
  parentScheme: "light" | "dark" | "auto" = "light",
): CSSProperties {
  const styleObj = {} as CSSProperties & Record<string, string | undefined>;
  if (rowItem?.rowBorderRadius !== undefined) {
    styleObj["--builder-radius"] = `${rowItem.rowBorderRadius}px`;
    styleObj["--builder-card-radius"] = `${rowItem.rowBorderRadius}px`;
  }

  const resolvedScheme = resolveColorSchemeForBackground(
    rowItem?.rowBackground,
    parentScheme === "auto" ? "light" : parentScheme,
  );
  const contextVars = getContextVars(resolvedScheme, rowItem?.rowBackground);

  return { ...styleObj, ...contextVars };
}

function ContentLayoutSection({
  section,
  product,
  breadcrumbItems,
  page,
  pageContent,
  categoryTree,
  activeCategorySlug,
  website,
  shellSettings,
  layoutScheme = "light",
  builderInteractionIdentity = false,
}: {
  section: BuilderSection;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  website?: SaaSWebsite | null;
  shellSettings?: Partial<BuilderShellSettings>;
  layoutScheme?: "light" | "dark" | "auto";
  builderInteractionIdentity?: boolean;
}) {
  const structure = resolveBuilderSectionStructure(section, {
    fallbackLayoutItems: [{
      id: "one",
      eyebrow: "01",
      title: "Flexible layout",
      body: "Choose a full, two-column, or three-column section from the dashboard.",
    }],
    globalRowGap: "var(--builder-global-row-gap, 32px)",
    rowGlobalSpacing: {
      rowPaddingTop: "var(--builder-global-row-padding-top, 0px)",
      rowPaddingBottom: "var(--builder-global-row-padding-bottom, 0px)",
      rowMarginTop: "var(--builder-global-row-margin-top, 0px)",
      rowMarginBottom: "var(--builder-global-row-margin-bottom, 0px)",
    },
  });

  const sectionColorScheme = resolveSectionColorScheme(section, layoutScheme);

  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-content-layout"
      builderInteractionIdentity={builderInteractionIdentity}
    >
      <div
        className="shop-builder-content-layout-rows-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {structure.rows.map((structuralRow, rowIndex) => {
          const rowItem: any = structuralRow.legacyItem ?? {};
          const isRowAnimatedBg =
            rowItem?.rowBackgroundEffect === "antigravity" ||
            rowItem?.rowBackgroundEffect === "antigravity2" ||
            rowItem?.rowBackgroundEffect === "aurora" ||
            rowItem?.rowBackgroundEffect === "constellation" ||
            rowItem?.rowBackgroundEffect === "waves" ||
            rowItem?.rowBackgroundEffect === "flowfield" ||
            rowItem?.rowBackgroundEffect === "webgl_waves" ||
            rowItem?.rowBackgroundEffect === "webgl_flowfield" ||
            rowItem?.rowBackgroundEffect === "webgl_cybergrid" ||
            rowItem?.rowBackgroundEffect === "webgl_fluid";
          const isRowAntigravity =
            rowItem?.rowBackgroundEffect === "antigravity";
          const isFullRowTheme =
            isRowAntigravity &&
            (rowItem.rowAntigravityVisualMode === undefined ||
              rowItem.rowAntigravityVisualMode === "full");
          const rowAnimationAttrs = animationDataAttributes(
            rowItem?.rowAnimation,
          );
          const rowColorScheme = resolveColorSchemeForBackground(
            rowItem?.rowBackground,
            sectionColorScheme === "auto" ? "light" : sectionColorScheme,
          );

          return (
            <div key={structuralRow.row.id} style={{ paddingTop: rowIndex > 0 ? structuralRow.precedingGap : 0 }}>
              <div
                data-builder-object-type={builderInteractionIdentity ? "row" : undefined}
                data-builder-section-id={builderInteractionIdentity ? section.id : undefined}
                data-builder-row-index={builderInteractionIdentity ? rowIndex : undefined}
                className={`${structuralRow.className} shop-builder-content-row ${
                  isFullRowTheme
                    ? "shop-builder-section--effect-antigravity"
                    : isRowAnimatedBg
                      ? "relative overflow-hidden"
                      : ""
                }`}
                style={{
                  ...structuralRow.style,
                  ...rowContextStyle(rowItem, sectionColorScheme),
                  ...rowAnimationAttrs.style,
                }}
                {...rowAnimationAttrs.data}
              >
              {isRowAnimatedBg && (
                <>
                  <AntigravityCanvas
                    speed={rowItem.rowAntigravitySpeed}
                    particleCount={rowItem.rowAntigravityParticleCount}
                    color={rowItem.rowAntigravityColor}
                    gridDensity={rowItem.rowAntigravityGridDensity as any}
                    interactive={rowItem.rowAntigravityInteractive}
                    showGrid={rowItem.rowAntigravityShowGrid}
                    showParticles={rowItem.rowAntigravityShowParticles}
                    gridMoveSpeed={rowItem.rowAntigravityGridMoveSpeed}
                    glowIntensity={rowItem.rowAntigravityGlowIntensity}
                    interactionScope={
                      rowItem.rowAntigravityInteractionScope as any
                    }
                    visualMode={rowItem.rowAntigravityVisualMode as any}
                    effectType={rowItem.rowBackgroundEffect}
                  />
                  {isRowAntigravity &&
                    rowItem.rowAntigravityShowGrid !== false && (
                      <div
                        className="antigravity-grid-overlay"
                        aria-hidden="true"
                        style={
                          rowItem.rowAntigravityGridMoveSpeed !== undefined ||
                          rowItem.rowAntigravityColor
                            ? {
                                animationDuration:
                                  rowItem.rowAntigravityGridMoveSpeed === 0
                                    ? "0s"
                                    : `${25 / (rowItem.rowAntigravityGridMoveSpeed ?? 1.0)}s`,
                                backgroundImage: rowItem.rowAntigravityColor
                                  ? `linear-gradient(${rowItem.rowAntigravityColor}08 1px, transparent 1px), linear-gradient(90deg, ${rowItem.rowAntigravityColor}08 1px, transparent 1px)`
                                  : undefined,
                              }
                            : undefined
                        }
                      />
                    )}
                </>
              )}
              {structuralRow.columns.map((structuralColumn) => {
                const item = structuralColumn.legacyItem;
                const columnKey = structuralColumn.column.id;
                const blocks = structuralColumn.column.elements;
                const cardStyle =
                  blocks.find(
                    (block) =>
                      block.panelStyle && block.panelStyle !== "default",
                  )?.panelStyle ??
                  blocks.find((block) => block.cardPreset)?.cardPreset ??
                  blocks[0]?.panelStyle ??
                  blocks[0]?.cardPreset ??
                  "default";

                const hasScrollPinned = blocks.some(
                  (b) => b.kind === "scrollPinnedDemo",
                );
                const renderColumnBlocks = (
                  columnBlocks: BuilderLayoutBlock[],
                ) =>
                  columnBlocks.map((block, blockIndex) => {
                    if (block.kind === "scrollPinnedDemo") {
                      return (
                        <ContentLayoutBlock
                          key={block.id ?? blockIndex}
                          block={block}
                          product={product}
                          breadcrumbItems={breadcrumbItems}
                          page={page}
                          pageContent={pageContent}
                          categoryTree={categoryTree}
                          activeCategorySlug={activeCategorySlug}
                          website={website}
                          shellSettings={shellSettings}
                          parentScheme={rowColorScheme}
                        />
                      );
                    }

                    const blockAnimationAttrs = animationDataAttributes(
                      block.animation,
                    );
                    return (
                      <div
                        key={block.id ?? blockIndex}
                        data-builder-block-id={block.id}
                        data-builder-object-type={builderInteractionIdentity ? "block" : undefined}
                        data-builder-section-id={builderInteractionIdentity ? section.id : undefined}
                        data-builder-column-key={builderInteractionIdentity ? columnKey : undefined}
                        data-builder-block-key={builderInteractionIdentity ? block.id : undefined}
                        data-builder-element-scope={elementAdvancedScope(block)}
                        className={blockShellClassName(block)}
                        style={{
                          ...blockSurfaceStyle(block, rowColorScheme),
                          ...getContentPositioningGroupChildStyle(block, columnBlocks),
                          ...blockAnimationAttrs.style,
                        }}
                        {...blockAnimationAttrs.data}
                        {...parseSafeElementAttributes(resolveElementAdvanced(block).customAttributes)}
                      >
                        <ElementAdvancedStyle block={block} />
                        <ContentLayoutBlock
                          block={block}
                          product={product}
                          breadcrumbItems={breadcrumbItems}
                          page={page}
                          pageContent={pageContent}
                          categoryTree={categoryTree}
                          activeCategorySlug={activeCategorySlug}
                          website={website}
                          shellSettings={shellSettings}
                          parentScheme={rowColorScheme}
                        />
                      </div>
                    );
                  });
                const nestedLayout = item?.nestedLayout ?? null;
                return (
                  <article
                    key={columnKey}
                    data-builder-object-type="column"
                    data-builder-section-id={builderInteractionIdentity ? section.id : undefined}
                    data-builder-row-index={builderInteractionIdentity ? rowIndex : undefined}
                    data-builder-column-key={columnKey}
                    className={`${structuralColumn.className} ${nestedLayout ? "builder-nested-layout-container " : ""}${
                      hasScrollPinned
                        ? "w-full"
                        : `shop-builder-content-layout-card shop-card-preset--${cardStyle}`
                    }`}
                    style={structuralColumn.style}
                  >
                    {nestedLayout ? (
                      <div
                        className="builder-nested-layout"
                        style={
                          {
                            "--builder-nested-row-count":
                              nestedLayout.rows.length,
                          } as CSSProperties
                        }
                      >
                        {nestedLayout.rows.map((nestedRow) => (
                          <div
                            key={nestedRow.id}
                            className="builder-nested-row"
                            style={{ "--builder-nested-row-weight": nestedRow.weight } as CSSProperties}
                          >
                            {nestedRow.columns.map((nestedColumn) => (
                              <div
                                key={nestedColumn.id}
                                className="builder-nested-column"
                              >
                                <ContentPositioningGroup blocks={nestedColumn.blocks}>
                                  {renderColumnBlocks(nestedColumn.blocks)}
                                </ContentPositioningGroup>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="shop-builder-column-content">
                        <ContentPositioningGroup blocks={blocks}>
                          {renderColumnBlocks(blocks)}
                        </ContentPositioningGroup>
                      </div>
                    )}
                  </article>
                );
              })}
              </div>
            </div>
          );
        })}
      </div>
    </SectionFrame>
  );
}

function SliderSection({
  section,
  shellSettings,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  shellSettings?: Partial<BuilderShellSettings>;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  const carouselSettings = section.carouselSettings ?? {};
  const slides: CarouselSlide[] =
    section.slides?.map((slide, index) => ({
      ...slide,
      id: slide.id ?? `${section.id}-slide-${index}`,
      title: slide.title,
      subtitle: slide.subtitle,
      text: slide.text,
      badge: slide.badge,
      imageUrl: slide.imageUrl,
      imageAlt: slide.imageAlt,
      imageWidth: (slide as any).imageWidth,
      imageHeight: (slide as any).imageHeight,
      imagePadding: slide.imagePadding,
      imageRatio: (slide as any).imageRatio,
      imageFit: (slide as any).imageFit,
      imageShape: (slide as any).imageShape,
      imageShadow: (slide as any).imageShadow,
      imageAlignment: (slide as any).imageAlignment,
      imageLoading: (slide as any).imageLoading,
      buttonLabel: slide.buttonLabel,
      buttonUrl: slide.buttonUrl,
    })) ?? [];

  const carousel = resolveCarouselPresentation({
    ...carouselSettings,
    // Keep the canonical General text-alignment owner intact for every public
    // carousel adapter. A component value, when explicitly authored, wins.
    contentAlign: carouselSettings.contentAlign ?? (section as any).textAlign,
  }, slides as any[], shellSettings) as { settings: any; slides: CarouselSlide[] };

  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-slider"
    >
      <div className="shop-builder-slider-heading">
        <h2 className="shop-builder-title">{section.title}</h2>
        <BodyText className="shop-builder-body">{section.body}</BodyText>
      </div>
      <CarouselBlock
        block={{
          __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
          fieldGroupName: "ReactBuilderSlider",
        }}
        slides={carousel.slides}
        settings={carousel.settings}
        breakpointPolicy={resolveResponsiveBreakpointPolicy(shellSettings)}
      />
    </SectionFrame>
  );
}

function EmbedSection({
  section,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-embed"
    >
      <div className="shop-builder-embed-heading">
        {section.eyebrow && (
          <p className="uk-label uk-label-primary">{section.eyebrow}</p>
        )}
        <h2 className="shop-builder-title">{section.title}</h2>
        <BodyText className="shop-builder-body">{section.body}</BodyText>
      </div>
      <EmbedSectionClient
        mode={section.embedMode}
        code={section.embedCode}
        url={section.embedUrl}
        height={section.embedHeight}
        title={section.title}
      />
    </SectionFrame>
  );
}

function BuilderSectionRenderer({
  section,
  products,
  categoryTree,
  activeCategorySlug,
  product,
  breadcrumbItems,
  page,
  pageContent,
  website,
  shellSettings,
  layoutScheme = "light",
  builderInteractionIdentity = false,
}: {
  section: BuilderSection;
  products?: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
  website?: SaaSWebsite | null;
  shellSettings?: Partial<BuilderShellSettings>;
  layoutScheme?: "light" | "dark" | "auto";
  builderInteractionIdentity?: boolean;
}) {
  if (!section.visible) return null;

  let content: ReactNode;

  if (section.kind === "hero" && !section.layoutItems?.length) {
    content = (
      <HeroSection
        section={section}
        product={product}
        layoutScheme={layoutScheme}
      />
    );
  } else if (section.kind === "recentlyViewed") {
    content = (
      <SectionFrame section={section} layoutScheme={layoutScheme}>
        <RecentlyViewedStrip />
      </SectionFrame>
    );
  } else if (section.kind === "productArchive") {
    content = (
      <SectionFrame
        section={section}
        layoutScheme={layoutScheme}
        extra="shop-builder-products"
      >
        <Suspense fallback={<ProductsSkeleton />}>
          <BuilderProductsSection
            section={section}
            products={products}
            categoryTree={categoryTree}
            activeCategorySlug={activeCategorySlug}
            website={website}
          />
        </Suspense>
      </SectionFrame>
    );
  } else if (section.kind === "filters") {
    content = (
      <FilterPillsSection
        section={section}
        layoutScheme={layoutScheme}
        website={website}
      />
    );
  } else if (section.kind === "promo") {
    content = <PromoSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "badgeGrid") {
    content = (
      <BadgeGridSection section={section} layoutScheme={layoutScheme} />
    );
  } else if (section.kind === "contentLayout" || section.kind === "hero") {
    content = (
      <ContentLayoutSection
        section={section}
        product={product}
        breadcrumbItems={breadcrumbItems}
        page={page}
        pageContent={pageContent}
        categoryTree={categoryTree}
        activeCategorySlug={activeCategorySlug}
        website={website}
        shellSettings={shellSettings}
        layoutScheme={layoutScheme}
        builderInteractionIdentity={builderInteractionIdentity}
      />
    );
  } else if (section.kind === "slider") {
    content = <SliderSection section={section} shellSettings={shellSettings} layoutScheme={layoutScheme} />;
  } else if (section.kind === "embed") {
    content = <EmbedSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "scrollPinnedDemo") {
    content = (
      <SectionFrame section={section} layoutScheme={layoutScheme}>
        <ScrollPinnedDemo section={section} />
      </SectionFrame>
    );
  } else {
    return null;
  }

  if (isBuilderStyleOnlyPreset(animationPreset(section.animation))) {
    return <PrincityGradientTracker>{content}</PrincityGradientTracker>;
  }

  return content;
}

function StorefrontBuilderRendererBase({
  layout,
  page,
  pageLabel,
  breadcrumbItems,
  products,
  categoryTree,
  activeCategorySlug,
  product,
  pageContent,
  website,
  shellSettings,
  headerOverlay = false,
  rootElement = "main",
  builderInteractionIdentity = false,
}: StorefrontBuilderRendererProps) {
  const label =
    pageLabel ??
    pageLabels[page as BuilderPage] ??
    templateLabels[page] ??
    (page.startsWith("page:")
      ? page
          .replace(/^page:/, "")
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ")
      : "Page");
  const resolvedBreadcrumbItems =
    breadcrumbItems ??
    (page === "home"
      ? [{ label: "Home" }]
      : [{ label: "Home", href: "/" }, { label }]);

  const isPageDocument = rootElement === "main";
  const isHomePage = isPageDocument && page === "home";
  const designColorScheme = layout.design?.colorScheme;
  const layoutScheme: "light" | "dark" | "auto" =
    designColorScheme === "dark" ||
    designColorScheme === "light" ||
    designColorScheme === "auto"
      ? designColorScheme
      : "auto";
  const firstVisibleSection = layout.sections.find(
    (section) => section.visible,
  );
  const pullUnderHeader = firstVisibleSection?.pullUnderHeader === true;
  const transparentSectionHeader = firstVisibleSection?.headerTransparent === true;
  const RootElement = rootElement;
  const responsiveBreakpointPolicy = resolveResponsiveBreakpointPolicy(shellSettings);

  useEffect(() => {
    if (!isPageDocument) return;
    const scheme = layout.design?.colorScheme ?? "auto";
    if (scheme === "dark") {
      document.documentElement.dataset.theme = "dark";
      document.documentElement.classList.add("dark");
    } else if (scheme === "light") {
      document.documentElement.dataset.theme = "light";
      document.documentElement.classList.remove("dark");
    }
  }, [isPageDocument, layout.design?.colorScheme]);

  return (
    <>
      {isPageDocument ? <style
        data-builder-page-shell
        dangerouslySetInnerHTML={{ __html: builderPageShellCss(layout) }}
      /> : null}
      {isPageDocument ? <ResponsiveBreakpointPolicyStyle policy={responsiveBreakpointPolicy} /> : null}
      <RootElement
        className={`${designClassName(layout)}${rootElement === "footer" ? " site-footer-builder" : ""}`}
        style={
          {
            ...getUikitGlobalsCssVars(shellSettings),
            ...designStyle(layout),
            ...(hasYoothemeImportContract(layout)
              ? getYoothemeImportGlobalAliases()
              : {}),
            ...builderGeometryCssVariables(),
          } as CSSProperties
        }
        data-builder-page-root
        data-responsive-breakpoint-policy={responsiveBreakpointPolicy.id}
        data-responsive-breakpoint-small={responsiveBreakpointPolicy.small}
        data-responsive-breakpoint-medium={responsiveBreakpointPolicy.medium}
        data-responsive-breakpoint-large={responsiveBreakpointPolicy.large}
        data-responsive-breakpoint-xlarge={responsiveBreakpointPolicy.xlarge}
        data-gsap-home={isHomePage ? true : undefined}
        data-overlap-header={isPageDocument && (pullUnderHeader || transparentSectionHeader || headerOverlay) ? "true" : undefined}
      >
        <BuilderScrollAnimations />
        <div className="shop-builder-inner">
          {layout.sections.map((section) => (
            <BuilderSectionRenderer
              key={section.id}
              section={section}
              products={products}
              categoryTree={categoryTree}
              activeCategorySlug={activeCategorySlug}
              product={product}
              breadcrumbItems={resolvedBreadcrumbItems}
              page={page}
              pageContent={pageContent}
              website={website}
              shellSettings={shellSettings}
              layoutScheme={layoutScheme}
              builderInteractionIdentity={builderInteractionIdentity}
            />
          ))}
        </div>
      </RootElement>
    </>
  );
}

export const StorefrontBuilderRenderer = memo(StorefrontBuilderRendererBase);
export default StorefrontBuilderRenderer;
