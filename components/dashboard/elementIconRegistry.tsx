"use client";

import {
  AlertCircle,
  AlignJustify,
  AlignLeft,
  CalendarDays,
  ChevronRight,
  Code2,
  GalleryHorizontal,
  Grid3X3,
  ImageIcon,
  Heading,
  Layout,
  LayoutGrid,
  ListChecks,
  ListCollapse,
  List as ListIcon,
  LockKeyhole,
  Menu,
  Minus,
  MousePointerClick,
  Presentation,
  ShoppingBag,
  Sliders,
  Sparkles,
  Star,
  Table,
  Tag,
  Timer,
  UserRound,
  Zap,
} from "lucide-react";
import type { LayoutBlockKind } from "@/components/dashboard/builderTypes";

export type LayoutBlockIconName =
  | "calendar"
  | "code"
  | "gallery"
  | "grid"
  | "image"
  | "list"
  | "lock"
  | "navigation"
  | "panel"
  | "pointer"
  | "shoppingBag"
  | "sparkles"
  | "text"
  | "user";

/** Canonical monochrome icon family for the element library. */
export const elementIconRegistry: Record<LayoutBlockKind, keyof typeof elementIconComponents> = {
  hero: "hero",
  button: "button",
  grid: "grid",
  heading: "heading",
  image: "image",
  panel: "panel",
  accordion: "accordion",
  table: "table",
  gallery: "image",
  text: "text",
  slider: "slider",
  slideshow: "slider",
  panelSlider: "slider",
  overlaySlider: "slider",
  scrollPinnedDemo: "scrollPinnedDemo",
  embed: "embed",
  fluentForm: "fluentForm",
  badgeGrid: "badgeGrid",
  icon: "icon",
  list: "list",
  subnav: "menu",
  menu: "menu",
  headerUtility: "headerUtility",
  headerSearch: "headerSearch",
  headerWishlist: "headerWishlist",
  headerCart: "headerCart",
  headerAccount: "headerAccount",
  headerTheme: "headerTheme",
  headerCategories: "headerCategories",
  headerLanguage: "headerLanguage",
  datePicker: "datePicker",
  products: "products",
  categoryFilters: "categoryFilters",
  breadcrumbs: "breadcrumbs",
  productHero: "productHero",
  productInfoStack: "productInfoStack",
  productPurchasePanel: "productPurchasePanel",
  productSpecsPanel: "productSpecsPanel",
  productGallery: "productGallery",
  productTitle: "productTitle",
  productPrice: "productPrice",
  productAddToCart: "productAddToCart",
  productAttributes: "productAttributes",
  productDescription: "productDescription",
  cartContent: "cartContent",
  checkoutContent: "checkoutContent",
  accountContent: "accountContent",
  divider: "divider",
  alert: "alert",
};

const elementIconComponents = {
  hero: Sparkles,
  button: MousePointerClick,
  grid: Grid3X3,
  heading: Heading,
  image: ImageIcon,
  panel: Layout,
  accordion: ListCollapse,
  table: Table,
  gallery: ImageIcon,
  text: AlignJustify,
  slider: GalleryHorizontal,
  slideshow: GalleryHorizontal,
  scrollPinnedDemo: Presentation,
  embed: Code2,
  fluentForm: Code2,
  badgeGrid: LayoutGrid,
  icon: Star,
  list: ListIcon,
  subnav: Menu,
  menu: Menu,
  headerUtility: Sliders,
  headerSearch: MousePointerClick,
  headerWishlist: Star,
  headerCart: ShoppingBag,
  headerAccount: UserRound,
  headerTheme: Sparkles,
  headerCategories: Menu,
  headerLanguage: ChevronRight,
  datePicker: CalendarDays,
  products: ShoppingBag,
  categoryFilters: Sliders,
  breadcrumbs: ChevronRight,
  productHero: Sparkles,
  productInfoStack: AlignLeft,
  productPurchasePanel: ShoppingBag,
  productSpecsPanel: Table,
  productGallery: ImageIcon,
  productTitle: AlignLeft,
  productPrice: Tag,
  productAddToCart: ShoppingBag,
  productAttributes: ListChecks,
  productDescription: AlignLeft,
  cartContent: ShoppingBag,
  checkoutContent: LockKeyhole,
  accountContent: UserRound,
  divider: Minus,
  alert: AlertCircle,
} as const;

export function ElementLibraryIcon({ kind }: { kind: LayoutBlockKind }) {
  const Icon = elementIconComponents[elementIconRegistry[kind]];
  return <Icon aria-hidden="true" focusable="false" strokeWidth={1.7} size={28} />;
}
