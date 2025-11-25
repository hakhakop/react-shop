// lib/pageBuilder.ts
//
// Central type mapper for ACF flexible content “Page Builder”
// -----------------------------------------------------------

export type PageBuilderBlock =
  | HeroLayoutBlock
  | ProductGridLayoutBlock;

// ---- HERO BLOCK ----
export interface HeroLayoutBlock {
  __typename: "PageBuilderLayoutPageBuilderHeroLayout";
  fieldGroupName: string;
  primaryButtonLink?: {
    url: string;
    title: string;
    target?: string;
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