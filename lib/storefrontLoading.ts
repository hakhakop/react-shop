export type StorefrontLoadingBlockShape = {
  kind: string;
  itemCount: number;
};

export type StorefrontLoadingSectionShape = {
  kind: string;
  sectionHeight: string | null;
  heroHeight: string | null;
  layout: string | null;
  columns: number;
  itemCount: number;
  blockKinds: string[];
  blocks: StorefrontLoadingBlockShape[];
};

export type StorefrontLoadingChromeShape = {
  headerVisible: boolean;
  headerHeight: string | null;
  navItemCount: number;
  footerColumnCount: number;
};

export type StorefrontLoadingData = {
  sections: StorefrontLoadingSectionShape[];
  chrome: StorefrontLoadingChromeShape;
};
