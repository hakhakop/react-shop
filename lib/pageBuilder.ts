// lib/pageBuilder.ts
//
// Central type mapper for ACF flexible content “Page Builder”
// -----------------------------------------------------------
// lib/pageBuilder.ts
export interface SectionSettings {
  sectionBackground?: string | null;
  sectionTopSpacing?: string | null;
  sectionBottomSpacing?: string | null;
}

export type PageBuilderBlock =
  | HeroLayoutBlock
  | ProductGridLayoutBlock
  | PromoStripLayoutBlock
  | BadgeGridLayoutBlock
  | CarouselLayoutBlock;

// ---- HERO BLOCK ----
export interface HeroLayoutBlock extends SectionSettings {
  __typename: "PageBuilderLayoutPageBuilderHeroLayout";
  fieldGroupName?: string | null;
  primaryButtonLink?: {
    url?: string | null;
    title?: string | null;
    target?: string | null;
  } | null;
}

// ---- PRODUCT GRID ----
export interface ProductGridLayoutBlock extends SectionSettings {
  __typename: "PageBuilderLayoutPageBuilderProductGridLayout";
  fieldGroupName: string;
  cardPreset?: string[] | null;
  cardSurface?: string[] | string | null;
  gridSurface?: string[] | string | null;
  productGridSurface?: string[] | string | null;
  productCardSurface?: string[] | string | null;
  columnsDesktop?: number | string | null;
  gridGap?: string[] | string | null;
  cardPadding?: string[] | string | null;
  imagePadding?: string[] | string | null;
  layoutVariant?: string[] | null;
  gridLimit?: number | null;
  source?: string[] | null;
  category?: {
    node?: {
      databaseId: number;
      name?: string | null;
      slug?: string | null;
    } | null;
    nodes?: {
      databaseId: number;
      name?: string | null;
      slug?: string | null;
    }[] | null;
  } | null;
}

// ---- PROMO STRIP ----
export interface PromoStripLayoutBlock extends SectionSettings {
  __typename: "PageBuilderLayoutPageBuilderPromoStripLayout";
  fieldGroupName: string;
  psText?: string | null;
  psSubtext?: string | null;
  psCtaLabel?: string | null;
  psCtaUrl?: string | null;
  psVariant?: string | null; // e.g. "default" | "accent" | "soft"
}

// ---- BADGE GRID (Perks-style cards) ----
export interface BadgeGridLayoutBlock extends SectionSettings {
  __typename: "PageBuilderLayoutPageBuilderBadgeGridLayoutLayout";
  fieldGroupName: string;
  bgColumnsDesktop?: number | string | null;
  bgItems?:
    | {
        bgId?: string | null;
        bgLabel?: string | null;
        bgTitle?: string | null;
        bgBody?: string | null;
      }[]
    | null;
}

// ---- CAROUSEL LAYOUT ----
export interface CarouselLayoutBlock extends SectionSettings {
  __typename: "PageBuilderLayoutPageBuilderCarouselLayoutLayout";
  fieldGroupName: string;
  slides?:
    | {
        slideId?: string | null;
        image?: {
          sourceUrl?: string | null;
          altText?: string | null;
        } | null;
        title?: string | null;
        subtitle?: string | null;
        text?: string | null;
        buttonLabel?: string | null;
        buttonUrl?: string | null;
        badge?: string | null;
      }[]
    | null;
  carouselSettings?: {
    variant?: string | null;
    loop?: boolean | null;
    autoplay?: boolean | null;
    autoplayDelayMs?: number | null;
    align?: string | null;
    dragFree?: boolean | null;
  } | null;
}

// ---- ROOT WRAPPER ----
export interface PageBuilderLayout {
  pageBuilder?: PageBuilderBlock[] | null;
}

// ---- Extract helper ----
export function mapPageBuilder(layout: PageBuilderLayout | null | undefined) {
  if (!layout?.pageBuilder || !Array.isArray(layout.pageBuilder)) {
    return [];
  }
  return layout.pageBuilder;
}
