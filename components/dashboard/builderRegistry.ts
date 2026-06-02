import type {
  BuilderLayoutKey,
  BuilderTemplate,
  LayoutBlockKind,
  SectionKind,
} from "@/components/dashboard/builderTypes";

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

export const sectionLabels: Record<SectionKind, string> = {
  hero: "Hero",
  productArchive: "Product Archive",
  recentlyViewed: "Recently Viewed",
  filters: "Top Category Filters",
  promo: "Promo Strip",
  slider: "Swiper / Carousel",
  badgeGrid: "Badge Grid",
  contentLayout: "Content Layout",
  embed: "Embed / Code",
  scrollPinnedDemo: "Pinned Story",
};

export const layoutBlockLabels: Record<LayoutBlockKind, string> = {
  hero: "Hero",
  button: "Button",
  promoStrip: "Promo Strip",
  grid: "Grid",
  heading: "Heading",
  image: "Image",
  panel: "Panel",
  table: "Table",
  text: "Text",
  slider: "Swiper / Carousel",
  scrollPinnedDemo: "Scroll Pinned Demo",
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
  cartContent: "Cart Content",
  checkoutContent: "Checkout Content",
  accountContent: "My Account Content",
};

export const baseLayoutBlockKinds: LayoutBlockKind[] = [
  "hero",
  "button",
  "promoStrip",
  "grid",
  "heading",
  "image",
  "panel",
  "table",
  "text",
  "slider",
  "scrollPinnedDemo",
  "fluentForm",
  "embed",
  "badgeGrid",
  "icon",
  "list",
  "datePicker",
  "products",
  "categoryFilters",
  "breadcrumbs",
  "cartContent",
  "checkoutContent",
  "accountContent",
];

export const productLayoutBlockKinds: LayoutBlockKind[] = [
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

export const layoutBlockDescriptions: Record<LayoutBlockKind, string> = {
  hero: "Large intro with eyebrow, title, copy, and button.",
  button: "A standalone call-to-action button.",
  promoStrip: "Compact announcement, offer, or callout.",
  grid: "Configurable static or dynamic card grid.",
  heading: "A standalone heading with level and alignment options.",
  image: "Simple image block with optional caption metadata.",
  panel: "Image, eyebrow, title, copy, and button in one content block.",
  text: "Static copy, button, and small editorial content.",
  table: "Editable data table with headers and styled rows.",
  slider: "Swiper carousel with editable slides and images.",
  scrollPinnedDemo: "An elegant storytelling block with scroll pinning.",
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
  productGallery: "Dynamic current product gallery.",
  productTitle: "Dynamic current product title.",
  productPrice: "Dynamic current product price.",
  productAddToCart: "Dynamic WooCommerce add-to-cart action.",
  productAttributes: "Dynamic current product attributes.",
  productDescription: "Dynamic current product description.",
  cartContent: "Live cart page content slot.",
  checkoutContent: "Live checkout page content slot.",
  accountContent: "Live my-account page content slot.",
};

export const layoutBlockGroups: {
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
    id: "woocommerce-pages",
    label: "WooCommerce Pages",
    kinds: ["cartContent", "checkoutContent", "accountContent"],
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
      "button",
      "promoStrip",
      "grid",
      "heading",
      "image",
      "panel",
      "table",
      "text",
      "slider",
      "scrollPinnedDemo",
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

export const layoutBlockIcons: Record<LayoutBlockKind, LayoutBlockIconName> = {
  hero: "sparkles",
  button: "navigation",
  promoStrip: "sparkles",
  grid: "grid",
  heading: "text",
  image: "image",
  panel: "sparkles",
  table: "grid",
  text: "text",
  slider: "gallery",
  scrollPinnedDemo: "gallery",
  embed: "code",
  fluentForm: "text",
  badgeGrid: "grid",
  icon: "sparkles",
  list: "list",
  datePicker: "calendar",
  products: "shoppingBag",
  categoryFilters: "panel",
  breadcrumbs: "navigation",
  productHero: "sparkles",
  productInfoStack: "sparkles",
  productPurchasePanel: "sparkles",
  productSpecsPanel: "sparkles",
  productGallery: "image",
  productTitle: "text",
  productPrice: "pointer",
  productAddToCart: "shoppingBag",
  productAttributes: "list",
  productDescription: "text",
  cartContent: "shoppingBag",
  checkoutContent: "lock",
  accountContent: "user",
};

export const basePageLabels: Record<string, string> = {
  home: "Home",
  shop: "Shop",
  client: "Client Page",
  "page:cart": "Cart",
  "page:checkout": "Checkout",
  "page:my-account": "My Account",
};

export const templateLabels: Record<BuilderTemplate, string> = {
  "product-single": "Single Product",
  "product-category": "Product Category",
  "product-category-specific": "Specific Category",
  "search-results": "Search Results",
};

export const templateDescriptions: Record<BuilderTemplate, string> = {
  "product-single": "Default layout for every product detail page.",
  "product-category": "Default layout for product category archive pages.",
  "product-category-specific":
    "Override layout for one chosen product category.",
  "search-results": "Default layout for search result pages.",
};

export const layoutLabels: Partial<Record<BuilderLayoutKey, string>> = {
  ...basePageLabels,
  ...templateLabels,
};

export const builderLayoutKeys = new Set<BuilderLayoutKey>([
  "home",
  "shop",
  "client",
  "page:cart",
  "page:checkout",
  "page:my-account",
  "product-single",
  "product-category",
  "product-category-specific",
  "search-results",
]);

export function getLayoutBlockKindsForState() {
  return [...baseLayoutBlockKinds, ...productLayoutBlockKinds];
}
