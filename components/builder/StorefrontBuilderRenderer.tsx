import { Suspense } from "react";
import type { CSSProperties, ReactNode } from "react";
import AntigravityTerminal from "@/components/builder/AntigravityTerminal";
import AntigravityCanvas from "@/components/builder/AntigravityCanvas";
import TypewriterText from "@/components/builder/TypewriterText";
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
import HomeGsapAnimations from "@/components/animations/HomeGsapAnimations";
import ScrollPinnedDemo from "@/components/animations/ScrollPinnedDemo";
import BuilderScrollAnimations from "@/components/builder/BuilderScrollAnimations";
import ScrollReveal from "@/components/builder/ScrollReveal";
import type { ScrollRevealConfig } from "@/components/builder/ScrollReveal";
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
import type {
  BuilderLayout,
  BuilderLayoutBlock,
  BuilderLayoutKey,
  BuilderPage,
  BuilderSection,
} from "@/lib/builderLayouts";
import { typographyProps, type TypographyArea } from "@/lib/builderTypography";
import type { BuilderVisualStyle } from "@/lib/builderVisualStyle";
import {
  hasBuilderVisualSpacing,
  visualStyleClassName,
  visualStyleToCss,
} from "@/lib/builderVisualStyle";
import {
  getBuilderLayoutRows,
  getBuilderRowLayoutPreset,
} from "@/components/dashboard/builderLayoutPresets";
import {
  resolveBuilderSpacing,
  type BuilderSpacingContext,
} from "@/lib/builderSpacing";

type StorefrontBuilderRendererProps = {
  layout: BuilderLayout;
  page: BuilderLayoutKey;
  pageLabel?: string;
  breadcrumbItems?: { label: string; href?: string }[];
  products?: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  product?: StorefrontBuilderProduct;
  pageContent?: ReactNode;
};

type StorefrontBuilderProduct = {
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
type BuilderAnimation = {
  preset?: string;
  delayMs?: number;
  durationMs?: number;
  easing?: "ease-out" | "ease-in-out" | "spring";
  triggerOffset?: number;
  playOnce?: boolean;
  progressSmoothingMs?: number;
  scrubDistanceVh?: number;
  stepOffset?: number;
  once?: boolean;
  pauseUntilComplete?: boolean;
  progressDirection?: "horizontal" | "vertical";
};

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
  parentScheme: "light" | "dark" = "light"
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
      return (totalLuminance / count) < 0.48 ? "dark" : "light";
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

  const rgbMatch = color.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\)$/);
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

function getContextVars(scheme: "light" | "dark" | "auto", customBg?: string): Record<string, string | undefined> {
  if (scheme === "auto") {
    return {
      "--context-bg": customBg || "transparent",
      "--context-text": "var(--builder-text)",
      "--context-muted": "var(--builder-muted)",
      "--context-surface": "var(--builder-surface)",
      "--context-button-bg": "var(--builder-button-bg)",
      "--context-button-text": "var(--builder-button-text)",
      "--context-card-bg": "var(--builder-card-bg)",
      "--context-card-border": "var(--builder-card-border)",

      // Legacy variables mapping for correct cascade
      "--builder-active-text": "var(--builder-text)",
      "--builder-active-muted": "var(--builder-muted)",
      "--builder-active-surface": "var(--builder-surface)",
      "--builder-active-button-bg": "var(--builder-button-bg)",
      "--builder-active-button-text": "var(--builder-button-text)",
      "--builder-card-bg": "var(--builder-card-bg)",
      "--builder-card-border": "var(--builder-card-border)",
    };
  }

  const schemeColors = scheme === "dark" ? builderDarkScheme : builderLightScheme;
  const cardBorder = scheme === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(17, 17, 17, 0.08)";
  return {
    "--context-bg": customBg || schemeColors.pageBackground,
    "--context-text": schemeColors.textColor,
    "--context-muted": schemeColors.mutedTextColor,
    "--context-surface": schemeColors.surfaceColor,
    "--context-button-bg": schemeColors.buttonBackground,
    "--context-button-text": schemeColors.buttonTextColor,
    "--context-card-bg": schemeColors.surfaceColor,
    "--context-card-border": cardBorder,

    // Legacy variables mapping for correct cascade
    "--builder-active-text": schemeColors.textColor,
    "--builder-active-muted": schemeColors.mutedTextColor,
    "--builder-active-surface": schemeColors.surfaceColor,
    "--builder-active-button-bg": schemeColors.buttonBackground,
    "--builder-active-button-text": schemeColors.buttonTextColor,
    "--builder-card-bg": schemeColors.surfaceColor,
    "--builder-card-border": cardBorder,
  };
}

function resolveSectionColorScheme(
  section: BuilderSection,
  layoutScheme: "light" | "dark" | "auto" = "light",
): "light" | "dark" | "auto" {
  if (section.colorScheme === "dark" || section.colorScheme === "light") {
    return section.colorScheme;
  }

  const bg = section.background?.trim().toLowerCase();
  if (!bg || bg === "transparent" || bg === "initial" || bg === "inherit") {
    return layoutScheme;
  }

  return resolveColorSchemeForBackground(
    section.background,
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
    color: colors.textColor,
    "--builder-text": colors.textColor,
    "--builder-muted": colors.mutedTextColor,
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
    "--builder-heading-color": design?.headingColor,
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
    "#101010"
  );
  const darkTextColor = safeCssColor(builderDarkScheme.textColor, "#f7f7f1");
  const darkMutedTextColor = safeCssColor(
    builderDarkScheme.mutedTextColor,
    "#c8c8be"
  );
  const darkSurfaceColor = safeCssColor(
    builderDarkScheme.surfaceColor,
    "#24241f"
  );
  const darkButtonBackground = safeCssColor(
    builderDarkScheme.buttonBackground,
    "#f7f7f1"
  );
  const darkButtonTextColor = safeCssColor(
    builderDarkScheme.buttonTextColor,
    "#101010"
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
}: {
  section: BuilderSection;
  products?: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
}) {
  const isPaginationEnabled = section.pagination?.enabled ?? false;
  const pageSize = isPaginationEnabled
    ? (section.pagination?.perPage ?? 12)
    : (typeof section.gridLimit === "number" && section.gridLimit >= 4
        ? Math.min(Math.round(section.gridLimit), 48)
        : 24);
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
    categoryTree ?? (await getCategoryTree().catch(() => []));

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
  const schemeVars =
    colorScheme === "dark"
      ? ({
          "--builder-section-text": builderDarkScheme.textColor,
          "--builder-section-muted": builderDarkScheme.mutedTextColor,
          "--builder-section-surface": builderDarkScheme.surfaceColor,
          "--builder-section-button-bg": builderDarkScheme.buttonBackground,
          "--builder-section-button-text": builderDarkScheme.buttonTextColor,
        } satisfies BuilderStyle)
      : colorScheme === "light"
        ? ({
            "--builder-section-text": builderLightScheme.textColor,
            "--builder-section-muted": builderLightScheme.mutedTextColor,
            "--builder-section-surface": builderLightScheme.surfaceColor,
            "--builder-section-button-bg": builderLightScheme.buttonBackground,
            "--builder-section-button-text": builderLightScheme.buttonTextColor,
          } satisfies BuilderStyle)
        : ({} satisfies BuilderStyle);

  const visual = section.visualStyle as BuilderVisualStyle | undefined;
  const contextVars = getContextVars(colorScheme, section.background);
  const styleObj: BuilderStyle = {
    background: section.background,
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
    ...schemeVars,
    ...contextVars,
    ...visualStyleToCss(visual),
  };

  if (section.borderRadius !== undefined) {
    styleObj["--builder-radius"] = `${section.borderRadius}px`;
    styleObj["--builder-card-radius"] = `${section.borderRadius}px`;
  }

  return styleObj as BuilderStyle;
}

function sectionClassName(
  section: BuilderSection,
  layoutScheme: "light" | "dark" | "auto" = "light",
  extra = "",
) {
  const mode = section.backgroundMode === "boxed" ? "boxed" : "full";
  const contentMode =
    section.contentMode === "full" || section.contentMode === "narrow"
      ? section.contentMode
      : "boxed";
  const scheme = resolveSectionColorScheme(section, layoutScheme);
  const visualClass = visualStyleClassName(
    section.visualStyle as BuilderVisualStyle | undefined,
  );
  const srClass = isScrollRevealPreset(section.animation) ? "shop-builder-section--scroll-reveal" : "";
  const heightClass = `shop-builder-section--height-${section.sectionHeight ?? "auto"}`;
  const verticalAlignClass = `shop-builder-section--align-${section.contentVerticalAlign ?? "top"}`;
  return `shop-builder-section shop-builder-section--${mode} shop-builder-section--content-${contentMode} shop-builder-section--scheme-${scheme} ${heightClass} ${verticalAlignClass} ${visualClass} ${animationClassName(section.animation)} ${srClass} ${extra}`.trim();
}

const scrollRevealPresets = new Set([
  "fade-up",
  "fade-down",
  "fade-in",
  "slide-left",
  "slide-right",
  "scale-up",
  "zoom-in",
  "flip-up",
  "blur-in",
  "stagger",
]);

const styleOnlyPresets = new Set([
  "princity-gradient",
]);

function isScrollRevealPreset(animation?: BuilderAnimation | Record<string, unknown>) {
  const preset =
    animation && typeof animation.preset === "string"
      ? animation.preset
      : "none";
  return scrollRevealPresets.has(preset);
}

function animationPreset(animation?: BuilderAnimation | Record<string, unknown>) {
  const preset =
    animation && typeof animation.preset === "string"
      ? animation.preset
      : "none";
  return preset === "none" ? null : preset;
}

function animationClassName(
  animation?: BuilderAnimation | Record<string, unknown>,
) {
  const preset = animationPreset(animation);
  if (!preset) return "";
  return `shop-builder-animate--${preset}`;
}

function animationDataAttributes(
  animation?: BuilderAnimation | Record<string, unknown>,
) {
  const preset = animationPreset(animation);

  if (!preset || styleOnlyPresets.has(preset)) {
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
  } as BuilderStyle;

  const playOnce = typeof animation?.once !== "undefined"
    ? animation.once
    : typeof animation?.playOnce !== "undefined"
      ? animation.playOnce
      : true;
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

function SectionFrame({
  section,
  layoutScheme = "light",
  extra,
  children,
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
  extra?: string;
  children: ReactNode;
}) {
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
    (section.antigravityVisualMode === undefined || section.antigravityVisualMode === "full");

  return (
    <section
      id={section.id}
      className={`${sectionClassName(section, layoutScheme, extra)} ${
        isFullTheme
          ? "shop-builder-section--effect-antigravity"
          : isAnimatedBg
            ? "relative overflow-hidden"
            : ""
      }`}
      style={{ ...sectionStyle(section, layoutScheme), ...animationAttrs.style }}
      data-gsap-section={section.kind === "hero" ? "hero" : section.kind}
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
        className="shop-builder-section-content"
        data-gsap-stagger={
          section.kind === "hero" || section.kind === "embed"
            ? undefined
            : true
        }
      >
        {children}
      </div>
    </section>
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
             className="shop-builder-eyebrow"
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
            <TypewriterText text={section.title} typography={section.typography} area="title" />
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
            target={section.buttonTarget === "_blank" ? "_blank" : undefined}
            rel={section.buttonTarget === "_blank" ? "noreferrer" : undefined}
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
      <div>
        <h2 className="shop-builder-title">{section.title}</h2>
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
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-filters"
    >
      {section.title && <h2 className="shop-builder-title">{section.title}</h2>}
      <CategoryFiltersBlock />
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
          <p className="shop-builder-eyebrow">{section.eyebrow}</p>
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
            {badge.title && <h3>{badge.title}</h3>}
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

function getContentLayoutBlocks(
  item: NonNullable<BuilderSection["layoutItems"]>[number],
): BuilderLayoutBlock[] {
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
        kind: "text",
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

async function CategoryFiltersBlock({
  hiddenCategorySlugs = [],
}: {
  hiddenCategorySlugs?: string[];
}) {
  const [flatCategories, categoryTree] = await Promise.all([
    getProductCategories(),
    getCategoryTree().catch(() => []),
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
}: {
  block: BuilderLayoutBlock;
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
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
  } as React.CSSProperties;

  if (block.layoutVariant === "carousel") {
    return (
      <div style={productStyleProps}>
        <ProductCarousel
          products={products}
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
          categoryTree={categoryTree}
        />
      </div>
    );
  }
  const resolvedCategoryTree =
    categoryTree ?? (await getCategoryTree().catch(() => []));

  return (
    <div
      className={`shop-builder-grid--margin-${blockLegacyGridMargin(block)} shop-card-preset--${block.panelStyle ?? "default"}`}
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
        imageRatio={block.imageRatio}
        imageFrame={block.gridImageFrame}
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

function RenderChecklist({
  items,
  iconName = "check",
  colorScheme = "default",
  typography,
  iconSize = 15,
}: {
  items?: string[];
  iconName?: string;
  colorScheme?: string;
  typography?: any;
  iconSize?: number;
}) {
  if (!items || items.length === 0) return null;
  const isGradientCycle = colorScheme === "gradient-cycle";
  return (
    <ul 
      className={`shop-builder-column-block--list-items ${isGradientCycle ? "is-icon-gradient-cycle" : ""}`}
      style={{
        listStyle: "none",
        padding: 0,
        margin: "1rem 0",
        display: "grid",
        gap: "0.5rem",
      }}
    >
      {items.map((item, index) => (
        <li 
          key={`${item}-${index}`} 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            fontSize: "0.95rem",
          }}
        >
          {{
            check: <Check size={iconSize} />,
            circleCheck: <CircleCheck size={iconSize} />,
            arrowRight: <ArrowRight size={iconSize} />,
            star: <Star size={iconSize} />,
            heart: <Heart size={iconSize} />,
            sparkles: <Sparkles size={iconSize} />,
            shield: <ShieldCheck size={iconSize} />,
          }[iconName] ?? <Check size={iconSize} />}
          <Typog as="span" typography={typography}>{item}</Typog>
        </li>
      ))}
    </ul>
  );
}

function GridCards({
  block,
  items,
}: {
  block: BuilderLayoutBlock;
  items: Array<{
    id: string;
    imageUrl?: string;
    imageAlt?: string;
    eyebrow?: string;
    title?: string;
    meta?: string;
    text?: string;
    buttonLabel?: string;
    buttonUrl?: string;
    typography?: BuilderLayoutBlock["typography"];
    items?: string[];
    listIcon?: string;
    listIconColorScheme?: string;
    listIconSize?: number;
  }>;
}) {
  const limit = Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1));
  return (
    <div
      className={`shop-builder-grid shop-builder-grid--gap-${block.gridGap ?? "medium"} shop-builder-grid--margin-${blockLegacyGridMargin(block)} shop-card-preset--${block.panelStyle ?? "default"}`}
      style={
        { "--shop-builder-grid-columns": block.columns ?? 3 } as CSSProperties
      }
    >
      {items.slice(0, limit).map((item) => (
        <article
          key={item.id}
          className={`shop-builder-grid-card is-image-${block.gridImagePadding ?? "frameless"} is-content-${block.gridContentPadding ?? "medium"} is-frame-${block.gridImageFrame ?? "none"}`}
        >
          {block.gridShowImage !== false && item.imageUrl && (
            <div className="shop-builder-grid-image">
              <img
                src={item.imageUrl}
                alt={item.imageAlt || item.title || ""}
              />
            </div>
          )}
          <div className="shop-builder-grid-content">
            {block.gridShowEyebrow !== false && item.eyebrow && (
              <span>{item.eyebrow}</span>
            )}
            {item.title && <Typog as="h3" typography={item.typography ?? block.typography}>{item.title}</Typog>}
            {block.gridShowMeta !== false && item.meta && (
              <small>{item.meta}</small>
            )}
            {block.gridShowText !== false && item.text && <Typog as="p" typography={item.typography ?? block.typography}>{item.text}</Typog>}
            
            <RenderChecklist
              items={item.items}
              iconName={item.listIcon}
              colorScheme={item.listIconColorScheme}
              typography={item.typography ?? block.typography}
              iconSize={item.listIconSize}
            />

            {block.gridShowButton !== false &&
              item.buttonLabel &&
              item.buttonUrl && (
                <Typog
                  as="a"
                  className="shop-builder-cta"
                  href={item.buttonUrl}
                  typography={item.typography ?? block.typography}
                >
                  {item.buttonLabel}
                </Typog>
              )}
          </div>
        </article>
      ))}
    </div>
  );
}

async function ContentGridBlock({ block }: { block: BuilderLayoutBlock }) {
  if (block.gridSource === "products") {
    const limit = Math.max(1, (block.columns ?? 3) * (block.gridRows ?? 1));
    const products = await getProductsForGrid({
      limit,
      source: "all",
    });
    return (
      <GridCards
        block={block}
        items={products.map((product) => ({
          id: product.id,
          imageUrl: product.image?.sourceUrl,
          imageAlt: product.image?.altText ?? product.name,
          eyebrow: "Product",
          title: product.name,
          meta: product.price ?? undefined,
          text: product.attributes?.nodes
            ?.map((attribute) => attribute.label ?? attribute.name)
            .join(", "),
          buttonLabel: "View product",
          buttonUrl: `/product/${product.slug}`,
        }))}
      />
    );
  }

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
        <Typog as="h3" typography={typography}>{product.name}</Typog>
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
            <Typog as="h3" typography={block?.typography}>{product.name}</Typog>
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
          <Typog as="h3" typography={block?.typography}>{product.name}</Typog>
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
        <Typog as="h3" typography={block?.typography}>{product.name}</Typog>
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
        <Typog as="h3" typography={block?.typography}>{product.name}</Typog>
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

function GoodieIcon({ iconName }: { iconName: string | undefined }) {
  if (iconName === "heart") return <Heart size={24} />;
  if (iconName === "truck") return <Truck size={24} />;
  if (iconName === "shield") return <ShieldCheck size={24} />;
  return <Sparkles size={24} />;
}

function ContentLayoutBlock({
  block,
  product,
  breadcrumbItems,
  page,
  pageContent,
  categoryTree,
  activeCategorySlug,
  parentScheme = "light",
}: {
  block: BuilderLayoutBlock;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  parentScheme?: "light" | "dark";
}) {
  if (block.kind === "button") {
    return (
      <div className={`shop-builder-column-block shop-builder-column-block--button ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}>
        <div 
          className={`shop-builder-buttons ${block.premiumButtonStyle && block.premiumButtonStyle !== "default" ? "" : `shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}`}
          style={{
            display: "flex",
            flexDirection: block.buttonsLayout === "stacked" ? "column" : "row",
            flexWrap: "wrap",
            gap: "0.75rem",
          }}
        >
          {block.buttonLabel && block.buttonUrl && (
            <Typog
              as="a"
              className={`shop-builder-cta ${
                block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                  ? `shop-builder-cta--${block.premiumButtonStyle}`
                  : `shop-builder-cta--${block.buttonStyle ?? "primary"}`
              }`}
              href={block.buttonUrl}
              target={block.buttonTarget === "_blank" ? "_blank" : undefined}
              rel={block.buttonTarget === "_blank" ? "noreferrer" : undefined}
              typography={block.typography}
            >
              {block.buttonLabel}
            </Typog>
          )}
          {(block.buttons ?? []).map((btn, btnIdx) => (
            <Typog
              key={btn.id ?? btnIdx}
              as="a"
              className={`shop-builder-cta ${
                block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                  ? `shop-builder-cta--${block.premiumButtonStyle}`
                  : `shop-builder-cta--${btn.style ?? "primary"}`
              }`}
              href={btn.url}
              target={btn.target === "_blank" ? "_blank" : undefined}
              rel={btn.target === "_blank" ? "noreferrer" : undefined}
              typography={block.typography}
            >
              {btn.label}
            </Typog>
          ))}
        </div>
      </div>
    );
  }

  if (block.kind === "breadcrumbs") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--breadcrumbs">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
    );
  }

  if (block.kind === "categoryFilters") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--category-filters">
        <Suspense
          fallback={
            <div className="shop-builder-column-empty">
              Loading categories...
            </div>
          }
        >
          <CategoryFiltersBlock hiddenCategorySlugs={block.hiddenCategorySlugs} />
        </Suspense>
      </div>
    );
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

  if (block.kind === "slider") {
    const slides: CarouselSlide[] =
      block.slides?.map((slide, index) => ({
        id: slide.id ?? `${block.id}-slide-${index}`,
        title: slide.title,
        subtitle: slide.subtitle,
        text: slide.text,
        badge: slide.badge,
        imageUrl: slide.imageUrl,
        imageAlt: slide.imageAlt,
        imagePadding: slide.imagePadding,
        buttonLabel: slide.buttonLabel,
        buttonUrl: slide.buttonUrl,
      })) ?? [];

    return (
      <div className="shop-builder-column-block shop-builder-column-block--slider">
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        {block.body && <Typog as="p" typography={block.typography}>{block.body}</Typog>}
        <CarouselBlock
          block={{
            __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout",
            fieldGroupName: "ReactBuilderColumnSlider",
          }}
          slides={slides}
          settings={block.carouselSettings}
        />
      </div>
    );
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
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        {block.body && <Typog as="p" typography={block.typography}>{block.body}</Typog>}
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
    return (
      <div className="shop-builder-column-block shop-builder-column-block--fluent-form">
        <FluentFormClient formId={block.fluentFormId} title={block.title} />
      </div>
    );
  }

  if (block.kind === "badgeGrid") {
    const badges = block.badges?.length
      ? block.badges
      : [
          {
            id: "one",
            label: "01",
            title: "Fast setup",
            body: "Reusable settings.",
          },
          {
            id: "two",
            label: "02",
            title: "Clean blocks",
            body: "Flat nested sections.",
          },
        ];

    return (
      <div className="shop-builder-column-block shop-builder-column-block--badges">
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        {block.body && <Typog as="p" typography={block.typography}>{block.body}</Typog>}
        <div
          className="shop-builder-column-badges"
          style={
            {
              "--builder-column-badge-columns": block.columns ?? 2,
            } as CSSProperties
          }
        >
          {badges.map((badge, index) => (
            <article key={badge.id ?? index}>
              {badge.label && <span>{badge.label}</span>}
              {badge.title && <Typog as="strong" typography={block.typography}>{badge.title}</Typog>}
              {badge.body && <Typog as="p" typography={block.typography}>{badge.body}</Typog>}
              {badge.items && badge.items.length > 0 && (
                <RenderChecklist
                  items={badge.items}
                  iconName={badge.listIcon || "check"}
                  colorScheme={badge.listIconColorScheme || "default"}
                  typography={block.typography}
                  iconSize={badge.listIconSize}
                />
              )}
            </article>
          ))}
        </div>
      </div>
    );
  }

  if (block.kind === "products") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--products">
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        <Suspense fallback={<ProductsSkeleton />}>
          <ContentProductsBlock
            block={block}
            categoryTree={categoryTree}
            activeCategorySlug={activeCategorySlug}
          />
        </Suspense>
      </div>
    );
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
    return (
      <div className="shop-builder-column-block shop-builder-column-block--icon">
        <GoodieIcon iconName={block.iconName} />
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        {block.body && <Typog as="p" typography={block.typography}>{block.body}</Typog>}
      </div>
    );
  }

  if (block.kind === "list") {
    const isGradientCycle = block.listIconColorScheme === "gradient-cycle";
    return (
      <div className="shop-builder-column-block shop-builder-column-block--list">
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        <ul className={isGradientCycle ? "is-icon-gradient-cycle" : undefined}>
          {(block.items ?? []).map((item, index) => (
            <li key={`${item}-${index}`}>
              {{
                check: <Check size={block.listIconSize ?? 16} />,
                circleCheck: <CircleCheck size={block.listIconSize ?? 16} />,
                arrowRight: <ArrowRight size={block.listIconSize ?? 16} />,
                star: <Star size={block.listIconSize ?? 16} />,
                heart: <Heart size={block.listIconSize ?? 16} />,
                sparkles: <Sparkles size={block.listIconSize ?? 16} />,
                shield: <ShieldCheck size={block.listIconSize ?? 16} />,
              }[block.listIcon ?? "check"] ?? <Check size={block.listIconSize ?? 16} />}
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (block.kind === "heading") {
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

    const isGradient = block.textGradientPreset && block.textGradientPreset !== "none";
    const isCustom = block.textGradientPreset === "custom";
    const titleClassName = isGradient && !isCustom ? `text-gradient--${block.textGradientPreset}` : "";
    const customStyle = isCustom ? {
      backgroundImage: `linear-gradient(${block.textGradientCustomAngle ?? 135}deg, ${block.textGradientCustomStart ?? "#ffffff"} ${block.textGradientCustomStartOffset ?? 0}%, ${block.textGradientCustomMiddle ?? "#60a5fa"} ${block.textGradientCustomMiddleOffset ?? 50}%, ${block.textGradientCustomEnd ?? "#c084fc"} ${block.textGradientCustomEndOffset ?? 100}%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      display: "inline-block",
    } : {};
    return (
      <div
        className={`shop-builder-column-block shop-builder-column-block--heading ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}
        style={{ textAlign: block.headingAlign ?? "left" }}
      >
        <Typog
          as={Tag}
          className={titleClassName}
          typography={resolvedTypography}
          style={{ textAlign: block.headingAlign ?? "left", margin: 0, ...customStyle }}
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
        </Typog>
      </div>
    );
  }

  if (block.kind === "datePicker") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--date-picker">
        <CalendarDays size={24} />
        {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
        {block.body && <Typog as="p" typography={block.typography}>{block.body}</Typog>}
        <label>
          <span>{block.dateLabel ?? "Preferred date"}</span>
          <input type="date" />
        </label>
      </div>
    );
  }

  if (block.kind === "cartContent") {
    return page === "page:cart" ? (
      pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <Typog as="h3">Cart content</Typog>
          <Typog as="p">The live cart UI will render here.</Typog>
        </div>
      )
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <Typog as="h3">Cart content</Typog>
        <Typog as="p">Use this block on the Cart page.</Typog>
      </div>
    );
  }

  if (block.kind === "checkoutContent") {
    return page === "page:checkout" ? (
      pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <Typog as="h3">Checkout content</Typog>
          <Typog as="p">The live checkout UI will render here.</Typog>
        </div>
      )
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <Typog as="h3">Checkout content</Typog>
        <Typog as="p">Use this block on the Checkout page.</Typog>
      </div>
    );
  }

  if (block.kind === "accountContent") {
    return page === "page:my-account" ? (
      pageContent ?? (
        <div className="shop-builder-column-block shop-builder-column-block--text">
          <Typog as="h3">My account content</Typog>
          <Typog as="p">The live account UI will render here.</Typog>
        </div>
      )
    ) : (
      <div className="shop-builder-column-block shop-builder-column-block--text">
        <Typog as="h3">My account content</Typog>
        <Typog as="p">Use this block on the My Account page.</Typog>
      </div>
    );
  }

  if (block.kind === "hero") {
    const isBlockAntigravity = block.carouselSettings?.variant === "antigravity";
    const isGradient = block.textGradientPreset && block.textGradientPreset !== "none";
    const isCustom = block.textGradientPreset === "custom";
    const titleClassName = isGradient && !isCustom
      ? `text-gradient--${block.textGradientPreset}`
      : isBlockAntigravity
        ? "shop-builder-title--gradient"
        : "";
    const customStyle = isCustom ? {
      backgroundImage: `linear-gradient(${block.textGradientCustomAngle ?? 135}deg, ${block.textGradientCustomStart ?? "#ffffff"} ${block.textGradientCustomStartOffset ?? 0}%, ${block.textGradientCustomMiddle ?? "#60a5fa"} ${block.textGradientCustomMiddleOffset ?? 50}%, ${block.textGradientCustomEnd ?? "#c084fc"} ${block.textGradientCustomEndOffset ?? 100}%)`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      display: "inline-block",
    } : {};

    return (
      <div className={`shop-builder-column-block shop-builder-column-block--hero ${isBlockAntigravity ? "shop-builder-hero--antigravity shop-builder-hero--antigravity-block" : ""} ${block.premiumCardStyle && block.premiumCardStyle !== "none" ? `shop-builder-card--${block.premiumCardStyle}` : ""}`}>
        <div className={isBlockAntigravity ? "shop-builder-hero-content-left" : ""}>
          {block.eyebrow && (
            <Typog
              as="span"
              className="shop-builder-eyebrow"
              typography={block.typography}
            >
              {block.eyebrow}
            </Typog>
          )}
          {block.title && (
            <Typog
              as="h3"
              className={titleClassName}
              typography={block.typography}
              style={customStyle}
            >
              {block.typewriterEnabled ? (
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
              ) : isBlockAntigravity ? (
                <TypewriterText
                  text={block.title}
                  speed={block.typewriterSpeed}
                  eraseSpeed={block.typewriterEraseSpeed}
                  delay={block.typewriterDelay}
                  loop={block.typewriterLoop}
                  useGradient={block.typewriterUseGradient}
                  gradientPreset={block.textGradientPreset ?? block.typewriterGradientPreset}
                  customStart={block.textGradientCustomStart}
                  customMiddle={block.textGradientCustomMiddle}
                  customEnd={block.textGradientCustomEnd}
                  customAngle={block.textGradientCustomAngle} customStartOffset={block.textGradientCustomStartOffset} customMiddleOffset={block.textGradientCustomMiddleOffset} customEndOffset={block.textGradientCustomEndOffset}
                  typography={block.typography}
                  area="title"
                />
              ) : (
                block.title
              )}
            </Typog>
          )}
          {block.body && (
            <Typog as="p" typography={block.typography}>
              {block.typewriterEnabled && !block.title ? (
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
              ) : (
                block.body
              )}
            </Typog>
          )}
          {block.buttonLabel && block.buttonUrl && (
            <Typog
              as="a"
              className={`shop-builder-cta ${
                block.premiumButtonStyle && block.premiumButtonStyle !== "default"
                  ? `shop-builder-cta--${block.premiumButtonStyle}`
                  : isBlockAntigravity
                    ? "shop-builder-cta--antigravity"
                    : ""
              }`}
              href={block.buttonUrl}
              typography={block.typography}
            >
              {block.buttonLabel}
            </Typog>
          )}
          {(block.buttons ?? []).map((btn, btnIdx) => {
            const isPremium = block.premiumButtonStyle && block.premiumButtonStyle !== "default";
            return (
              <Typog
                key={btn.id ?? btnIdx}
                as="a"
                className={`shop-builder-cta ${
                  isPremium
                    ? `shop-builder-cta--${block.premiumButtonStyle}`
                    : `shop-builder-cta--${btn.style ?? "primary"}`
                }`}
                href={btn.url}
                target={btn.target === "_blank" ? "_blank" : undefined}
                rel={btn.target === "_blank" ? "noreferrer" : undefined}
                typography={block.typography}
              >
                {btn.label}
              </Typog>
            );
          })}
        </div>
        {isBlockAntigravity && (
          <div className="shop-builder-hero-media shop-builder-hero-media--antigravity">
            <AntigravityTerminal />
          </div>
        )}
      </div>
    );
  }

  if (block.kind === "promoStrip") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--promo-strip">
        <div>
          {block.eyebrow && <span>{block.eyebrow}</span>}
          {block.title && (
            <Typog as="h3" typography={block.typography}>
              {block.typewriterEnabled ? (
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
              ) : (
                block.title
              )}
            </Typog>
          )}
          {block.body && (
            <Typog as="p" typography={block.typography}>
              {block.typewriterEnabled && !block.title ? (
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
              ) : (
                block.body
              )}
            </Typog>
          )}
        </div>
        {block.buttonLabel && block.buttonUrl && (
          <Typog
            as="a"
            className="shop-builder-cta"
            href={block.buttonUrl}
            typography={block.typography}
          >
            {block.buttonLabel}
          </Typog>
        )}
        {(block.buttons ?? []).map((btn, btnIdx) => (
          <Typog
            key={btn.id ?? btnIdx}
            as="a"
            className={`shop-builder-cta shop-builder-cta--${btn.style ?? "primary"}`}
            href={btn.url}
            target={btn.target === "_blank" ? "_blank" : undefined}
            rel={btn.target === "_blank" ? "noreferrer" : undefined}
            typography={block.typography}
          >
            {btn.label}
          </Typog>
        ))}
      </div>
    );
  }

  if (block.kind === "panel") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--panel">
        {block.imageUrl && (
          <div
            className="shop-builder-panel-media"
            role="img"
            aria-label={block.imageAlt || block.title || "Panel image"}
            style={{ backgroundImage: `url(${block.imageUrl})` }}
          />
        )}
        <div>
          {block.eyebrow && <span>{block.eyebrow}</span>}
          {block.title && (
            <Typog as="h3" typography={block.typography}>
              {block.typewriterEnabled ? (
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
              ) : (
                block.title
              )}
            </Typog>
          )}
          {block.body && (
            <Typog as="p" typography={block.typography}>
              {block.typewriterEnabled && !block.title ? (
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
              ) : (
                block.body
              )}
            </Typog>
          )}
          
          <RenderChecklist
            items={block.items}
            iconName={block.listIcon}
            colorScheme={block.listIconColorScheme}
            typography={block.typography}
            iconSize={block.listIconSize}
          />

          {block.buttonLabel && block.buttonUrl && (
            <Typog
              as="a"
              className="shop-builder-cta"
              href={block.buttonUrl}
              typography={block.typography}
            >
              {block.buttonLabel}
            </Typog>
          )}
        {(block.buttons ?? []).map((btn, btnIdx) => (
          <Typog
            key={btn.id ?? btnIdx}
            as="a"
            className={`shop-builder-cta shop-builder-cta--${btn.style ?? "primary"}`}
            href={btn.url}
            target={btn.target === "_blank" ? "_blank" : undefined}
            rel={btn.target === "_blank" ? "noreferrer" : undefined}
            typography={block.typography}
          >
            {btn.label}
          </Typog>
        ))}
        </div>
      </div>
    );
  }

  if (block.kind === "image") {
    return (
      <div className="shop-builder-column-block shop-builder-column-block--image">
        <div
          style={{
            textAlign: block.imageAlignment ?? "center",
            maxWidth: block.imageMaxWidth ? `${block.imageMaxWidth}px` : undefined,
            marginInline: "auto",
          }}
        >
          {block.imageUrl ? (
            <img
              src={block.imageUrl}
              alt={block.imageAlt ?? block.title ?? ""}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: block.imageBorderRadius ? `${block.imageBorderRadius}px` : undefined,
              }}
            />
          ) : block.title || block.body ? null : (
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
          <Typog as="h3" typography={block.typography}>
            {block.title}
          </Typog>
        )}
        {block.body && (
          <Typog as="p" typography={block.typography}>
            {block.body}
          </Typog>
        )}
      </div>
    );
  }

  if (block.kind === "table") {
    const headLength = (block.tableHeadings ?? []).length;
    return (
      <div className="shop-builder-column-block shop-builder-column-block--table">
        <div style={{ overflowX: "auto" }}>
          <table
            className={`builder-preview-table builder-preview-table--${block.tableStyle ?? "striped"}`}
            style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9em" }}
          >
            {headLength > 0 && (
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
                  {Array.from({ length: Math.max(headLength, row.length) }, (_, cIdx) => (
                    <td key={cIdx}>{row[cIdx] ?? ""}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-builder-column-block shop-builder-column-block--text">
      {block.eyebrow && <span>{block.eyebrow}</span>}
      {block.title && <Typog as="h3" typography={block.typography}>{block.title}</Typog>}
      {block.body && <Typog as="p" typography={block.typography}>{block.body}</Typog>}
      
      <RenderChecklist
        items={block.items}
        iconName={block.listIcon}
        colorScheme={block.listIconColorScheme}
        typography={block.typography}
        iconSize={block.listIconSize}
      />

      <div 
        className={`shop-builder-buttons shop-builder-buttons--${block.buttonsLayout ?? "inline"}`}
        style={{
          display: "flex",
          flexDirection: block.buttonsLayout === "stacked" ? "column" : "row",
          flexWrap: "wrap",
          gap: "0.75rem",
        }}
      >
        {block.buttonLabel && block.buttonUrl && (
          <Typog
            as="a"
            className="shop-builder-cta"
            href={block.buttonUrl}
            typography={block.typography}
          >
            {block.buttonLabel}
          </Typog>
        )}
        {(block.buttons ?? []).map((btn, btnIdx) => (
          <Typog
            key={btn.id ?? btnIdx}
            as="a"
            className={`shop-builder-cta shop-builder-cta--${btn.style ?? "primary"}`}
            href={btn.url}
            target={btn.target === "_blank" ? "_blank" : undefined}
            rel={btn.target === "_blank" ? "noreferrer" : undefined}
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
  parentScheme: "light" | "dark" = "light"
): { scheme: "light" | "dark"; bg: string | undefined } {
  if (block.elementBackgroundMode === "custom" && block.elementBackground) {
    const scheme = resolveColorSchemeForBackground(block.elementBackground, parentScheme);
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
  parentScheme: "light" | "dark" = "light"
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
  if (bg !== undefined && isCustomBg) {
    legacy["--builder-element-bg"] = bg;
  }
  if (block.borderRadius !== undefined) {
    legacy["--builder-radius"] = `${block.borderRadius}px`;
    legacy["--builder-card-radius"] = `${block.borderRadius}px`;
  }
  if (!hasBuilderVisualSpacing(visual?.padding)) {
    if (block.elementPadding && block.elementPadding !== "inherit") {
      legacy.padding = resolveBuilderSpacing(
        block.elementPadding,
        "elementPadding",
      ).css;
    } else {
      legacy.paddingTop = "var(--builder-global-element-padding-top, 16px)";
      legacy.paddingRight = "var(--builder-global-element-padding-right, 16px)";
      legacy.paddingBottom = "var(--builder-global-element-padding-bottom, 16px)";
      legacy.paddingLeft = "var(--builder-global-element-padding-left, 16px)";
    }
  }
  if (
    !hasBuilderVisualSpacing(visual?.margin) &&
    (!block.gridMargin || block.gridMargin === "inherit")
  ) {
    legacy.marginTop = "var(--builder-global-element-margin-top, 0px)";
    legacy.marginRight = "var(--builder-global-element-margin-right, 0px)";
    legacy.marginBottom = "var(--builder-global-element-margin-bottom, 0px)";
    legacy.marginLeft = "var(--builder-global-element-margin-left, 0px)";
  }

  return { ...contextVars, ...legacy, ...visualCss };
}


function blockShellClassName(block: BuilderLayoutBlock) {
  const visualClass = visualStyleClassName(
    block.visualStyle as BuilderVisualStyle | undefined,
  );
  const premiumCardClass = block.premiumCardStyle && block.premiumCardStyle !== "none"
    ? `shop-builder-card--${block.premiumCardStyle}`
    : "";
  return `shop-builder-element-shell shop-card-preset--${
    block.panelStyle ?? "default"
  } is-padding-${
    hasBuilderVisualSpacing(
      (block.visualStyle as BuilderVisualStyle | undefined)?.padding,
    )
      ? "none"
      : block.elementPadding && block.elementPadding !== "inherit"
        ? block.elementPadding
        : "none"
  } is-align-${
    block.elementAlign ?? "left"
  } ${visualClass} ${animationClassName(block.animation)} ${premiumCardClass}`.trim();
}

function blockLegacyGridMargin(block: BuilderLayoutBlock) {
  return hasBuilderVisualSpacing(
    (block.visualStyle as BuilderVisualStyle | undefined)?.margin,
  )
    ? "none"
    : block.gridMargin && block.gridMargin !== "inherit"
      ? block.gridMargin
      : "none";
}

const HAS_RICH_TEXT_HTML = /<[a-z][\s\S]*>/i;

function isRichPreviewText(value: string | null | undefined) {
  return typeof value === "string" && HAS_RICH_TEXT_HTML.test(value);
}

function getRichTextSafeTag(tag: string) {
  return tag === "p" ? "div" : tag;
}

function Typog({ as: As = "div", typography, className, children, style, ...props }: any) {
  const tp = typographyProps(
    typography,
    inferTypographyArea(String(As), className),
  );
  const combined = [className, tp.className].filter(Boolean).join(" ");
  const combinedStyle = { ...tp.style, ...style };
  const isRich = isRichPreviewText(children);
  if (isRich) {
    const Tag = getRichTextSafeTag(String(As)) as any;
    return (
      <Tag className={combined || undefined} style={combinedStyle} {...props} dangerouslySetInnerHTML={{ __html: children }} />
    );
  }
  const Tag = As as any;
  return (
    <Tag className={combined || undefined} style={combinedStyle} {...props}>
      {children}
    </Tag>
  );
}

function BodyText({ children, className }: { children: string | null | undefined; className?: string }) {
  if (!children) return null;
  if (isRichPreviewText(children)) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: children }} />;
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

function rowStyle(rowItem: any, parentScheme: "light" | "dark" | "auto" = "light"): CSSProperties {
  const visual = rowItem?.rowVisualStyle as BuilderVisualStyle | undefined;
  const visualCss = visualStyleToCss(visual);
  const styleObj: any = {};

  if (rowItem?.rowBackground) {
    styleObj.background = rowItem.rowBackground;
  }
  styleObj["--builder-section-padding-top"] =
    rowItem?.rowTopSpacing && rowItem.rowTopSpacing !== "inherit"
      ? resolveBuilderSpacing(rowItem.rowTopSpacing, "rowPadding").css
      : "var(--builder-global-row-padding-top, 32px)";
  styleObj["--builder-section-padding-bottom"] =
    rowItem?.rowBottomSpacing && rowItem.rowBottomSpacing !== "inherit"
      ? resolveBuilderSpacing(rowItem.rowBottomSpacing, "rowPadding").css
      : "var(--builder-global-row-padding-bottom, 32px)";
  styleObj["--builder-section-margin-top"] =
    rowItem?.rowTopMargin && rowItem.rowTopMargin !== "inherit"
      ? resolveBuilderSpacing(rowItem.rowTopMargin, "rowMargin").css
      : "var(--builder-global-row-margin-top, 0px)";
  styleObj["--builder-section-margin-bottom"] =
    rowItem?.rowBottomMargin && rowItem.rowBottomMargin !== "inherit"
      ? resolveBuilderSpacing(rowItem.rowBottomMargin, "rowMargin").css
      : "var(--builder-global-row-margin-bottom, 0px)";
  if (rowItem?.rowBorderRadius !== undefined) {
    styleObj["--builder-radius"] = `${rowItem.rowBorderRadius}px`;
    styleObj["--builder-card-radius"] = `${rowItem.rowBorderRadius}px`;
    styleObj.borderRadius = `${rowItem.rowBorderRadius}px`;
  }

  const resolvedScheme = resolveColorSchemeForBackground(
    rowItem?.rowBackground,
    parentScheme === "auto" ? "light" : parentScheme,
  );
  const contextVars = getContextVars(resolvedScheme, rowItem?.rowBackground);

  return { ...styleObj, ...contextVars, ...visualCss };
}

function ContentLayoutSection({
  section,
  product,
  breadcrumbItems,
  page,
  pageContent,
  categoryTree,
  activeCategorySlug,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  const items = section.layoutItems?.length
    ? section.layoutItems
    : [
        {
          id: "one",
          eyebrow: "01",
          title: "Flexible layout",
          body: "Choose a full, two-column, or three-column section from the dashboard.",
        },
      ];

  const layoutRows = getBuilderLayoutRows(section, items);
  const rowMetaByColumnKey = new Map<
    string,
    {
      span: number;
    }
  >();

  layoutRows.forEach((row) => {
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
      rowMetaByColumnKey.set(columnKey, { span });
    });
  });

  const sectionColorScheme = resolveSectionColorScheme(section, layoutScheme);

  return (
    <SectionFrame
      section={section}
      layoutScheme={layoutScheme}
      extra="shop-builder-content-layout"
    >
      {(section.eyebrow || section.title || section.body) && (
        <div className="shop-builder-content-layout-heading">
          {section.eyebrow && (
            <p className="shop-builder-eyebrow">{section.eyebrow}</p>
          )}
          {section.title && (
            <h2 className="shop-builder-title">{section.title}</h2>
          )}
          <BodyText className="shop-builder-body">{section.body}</BodyText>
        </div>
      )}
      <div
        className="shop-builder-content-layout-rows-wrapper"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--builder-global-row-gap, 64px)",
        }}
      >
        {layoutRows.map((row) => {
          const rowItem = row.items[0];
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
          const isRowAntigravity = rowItem?.rowBackgroundEffect === "antigravity";
          const isFullRowTheme = isRowAntigravity && (rowItem.rowAntigravityVisualMode === undefined || rowItem.rowAntigravityVisualMode === "full");
          const rowAnimationAttrs = animationDataAttributes(rowItem?.rowAnimation);
          const rowColorScheme = resolveColorSchemeForBackground(rowItem?.rowBackground, sectionColorScheme === "auto" ? "light" : sectionColorScheme);

          return (
            <div
              key={row.id}
              className={`shop-builder-content-row ${
                isFullRowTheme
                  ? "shop-builder-section--effect-antigravity"
                  : isRowAnimatedBg
                    ? "relative overflow-hidden"
                    : ""
              }`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
                gap: resolveBuilderSpacing(undefined, "columnGap").css,
                paddingTop: "var(--builder-section-padding-top, 0px)",
                paddingBottom: "var(--builder-section-padding-bottom, 0px)",
                marginTop: "var(--builder-section-margin-top, 0px)",
                marginBottom: "var(--builder-section-margin-bottom, 0px)",
                ...rowStyle(rowItem, sectionColorScheme),
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
                    interactionScope={rowItem.rowAntigravityInteractionScope as any}
                    visualMode={rowItem.rowAntigravityVisualMode as any}
                    effectType={rowItem.rowBackgroundEffect}
                  />
                  {isRowAntigravity && rowItem.rowAntigravityShowGrid !== false && (
                    <div
                      className="antigravity-grid-overlay"
                      aria-hidden="true"
                      style={
                        rowItem.rowAntigravityGridMoveSpeed !== undefined || rowItem.rowAntigravityColor
                          ? {
                              animationDuration: rowItem.rowAntigravityGridMoveSpeed === 0
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
              {row.items.map((item, index) => {
                const columnKey = item.id ?? `layout-item-${row.startIndex + index}`;
                const rowMeta = rowMetaByColumnKey.get(columnKey);
                const span = rowMeta?.span ?? 12;

                const blocks = getContentLayoutBlocks(item);
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
                return (
                  <article
                    key={columnKey}
                    className={hasScrollPinned ? "w-full col-span-12" : `shop-builder-content-layout-card shop-card-preset--${cardStyle}`}
                    style={hasScrollPinned ? { gridColumn: "span 12" } : { gridColumn: `span ${span}` }}
                  >
                    {blocks.map((block, blockIndex) => {
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
                          className={blockShellClassName(block)}
                          style={{
                            ...blockSurfaceStyle(block, rowColorScheme),
                            ...blockAnimationAttrs.style,
                          }}
                          {...blockAnimationAttrs.data}
                        >
                          <ContentLayoutBlock
                            block={block}
                            product={product}
                            breadcrumbItems={breadcrumbItems}
                            page={page}
                            pageContent={pageContent}
                            categoryTree={categoryTree}
                            activeCategorySlug={activeCategorySlug}
                            parentScheme={rowColorScheme}
                          />
                        </div>
                      );
                    })}
                  </article>
                );
              })}
            </div>
          );
        })}
      </div>
    </SectionFrame>
  );
}

function SliderSection({
  section,
  layoutScheme = "light",
}: {
  section: BuilderSection;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  const slides: CarouselSlide[] =
    section.slides?.map((slide, index) => ({
      id: slide.id ?? `${section.id}-slide-${index}`,
      title: slide.title,
      subtitle: slide.subtitle,
      text: slide.text,
      badge: slide.badge,
      imageUrl: slide.imageUrl,
      imageAlt: slide.imageAlt,
      imagePadding: slide.imagePadding,
      buttonLabel: slide.buttonLabel,
      buttonUrl: slide.buttonUrl,
    })) ?? [];

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
        slides={slides}
        settings={section.carouselSettings}
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
          <p className="shop-builder-eyebrow">{section.eyebrow}</p>
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
  layoutScheme = "light",
}: {
  section: BuilderSection;
  products?: ProductNode[];
  categoryTree?: CategoryTreeItem[];
  activeCategorySlug?: string | null;
  product?: StorefrontBuilderProduct;
  breadcrumbItems: { label: string; href?: string }[];
  page: BuilderLayoutKey;
  pageContent?: ReactNode;
  layoutScheme?: "light" | "dark" | "auto";
}) {
  if (!section.visible) return null;

  let content: ReactNode;

  if (section.kind === "hero") {
    content = <HeroSection section={section} product={product} layoutScheme={layoutScheme} />;
  } else if (section.kind === "recentlyViewed") {
    content = (
      <SectionFrame section={section} layoutScheme={layoutScheme}>
        <RecentlyViewedStrip />
      </SectionFrame>
    );
  } else if (section.kind === "productArchive") {
    content = (
      <SectionFrame section={section} layoutScheme={layoutScheme} extra="shop-builder-products">
        <Suspense fallback={<ProductsSkeleton />}>
          <BuilderProductsSection
            section={section}
            products={products}
            categoryTree={categoryTree}
            activeCategorySlug={activeCategorySlug}
          />
        </Suspense>
      </SectionFrame>
    );
  } else if (section.kind === "filters") {
    content = <FilterPillsSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "promo") {
    content = <PromoSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "badgeGrid") {
    content = <BadgeGridSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "contentLayout") {
    content = (
      <ContentLayoutSection
        section={section}
        product={product}
        breadcrumbItems={breadcrumbItems}
        page={page}
        pageContent={pageContent}
        categoryTree={categoryTree}
        activeCategorySlug={activeCategorySlug}
        layoutScheme={layoutScheme}
      />
    );
  } else if (section.kind === "slider") {
    content = <SliderSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "embed") {
    content = <EmbedSection section={section} layoutScheme={layoutScheme} />;
  } else if (section.kind === "scrollPinnedDemo") {
    content = <ScrollPinnedDemo section={section} />;
  } else {
    return null;
  }

  if (isScrollRevealPreset(section.animation)) {
    const anim = section.animation as BuilderAnimation;
    return (
      <ScrollReveal
        config={{
          preset: anim.preset as ScrollRevealConfig["preset"],
          duration: anim.durationMs,
          delay: anim.delayMs ? anim.delayMs / 1000 : undefined,
          easing: anim.easing,
          playOnce: anim.playOnce,
          triggerOffset: anim.triggerOffset,
        }}
      >
        {content}
      </ScrollReveal>
    );
  }

  if (styleOnlyPresets.has(animationPreset(section.animation) ?? "")) {
    return <PrincityGradientTracker>{content}</PrincityGradientTracker>;
  }

  return content;
}

export default function StorefrontBuilderRenderer({
  layout,
  page,
  pageLabel,
  breadcrumbItems,
  products,
  categoryTree,
  activeCategorySlug,
  product,
  pageContent,
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

  const isHomePage = page === "home";
  const designColorScheme = layout.design?.colorScheme;
  const layoutScheme: "light" | "dark" | "auto" =
    designColorScheme === "dark" || designColorScheme === "light" || designColorScheme === "auto"
      ? designColorScheme
      : "auto";

  return (
    <>
      <script
        key={layout.design?.colorScheme ?? "auto"}
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const scheme = ${JSON.stringify(layout.design?.colorScheme ?? "auto")};
              if (scheme === "dark") {
                document.documentElement.dataset.theme = "dark";
                document.documentElement.classList.add("dark");
              } else if (scheme === "light") {
                document.documentElement.dataset.theme = "light";
                document.documentElement.classList.remove("dark");
              }
            })();
          `.trim()
        }}
      />
      <style
        data-builder-page-shell
        dangerouslySetInnerHTML={{ __html: builderPageShellCss(layout) }}
      />
      <main
        className={designClassName(layout)}
        style={designStyle(layout)}
        data-builder-page-root
        data-gsap-home={isHomePage ? true : undefined}
      >
        <BuilderScrollAnimations />
        {isHomePage && <HomeGsapAnimations />}
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
              layoutScheme={layoutScheme}
            />
          ))}
        </div>
      </main>
    </>
  );
}
