// lib/pageBuilder.ts
//
// Central type mapper for ACF flexible content “Page Builder”
// -----------------------------------------------------------
// lib/pageBuilder.ts
type SectionSettings = {
  sectionBackground?: string | null;
  sectionTopSpacing?: string | null;
  sectionBottomSpacing?: string | null;
};
export type PageBuilderBlock =
  | HeroLayoutBlock
  | ProductGridLayoutBlock
  | PromoStripLayoutBlock
  | BadgeGridLayoutBlock;

// ---- HERO BLOCK ----
export interface HeroLayoutBlock {
  __typename: "PageBuilderLayoutPageBuilderHeroLayout";
   fieldGroupName?: string | null;
  primaryButtonLink?: {
    url?: string | null;
    title?: string | null;
    target?: string | null;
  } | null;
}

// ---- PRODUCT GRID ----
export interface ProductGridLayoutBlock {
  __typename: "PageBuilderLayoutPageBuilderProductGridLayout";
  fieldGroupName: string;
  cardPreset?: string[] | null;
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
export interface PromoStripLayoutBlock {
  __typename: "PageBuilderLayoutPageBuilderPromoStripLayout";
  fieldGroupName: string;
  psText?: string | null;
  psSubtext?: string | null;
  psCtaLabel?: string | null;
  psCtaUrl?: string | null;
  psVariant?: string | null; // e.g. "default" | "accent" | "soft"
}

// ---- BADGE GRID (Perks-style cards) ----
export interface BadgeGridLayoutBlock {
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