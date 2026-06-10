import { getBuilderRowLayoutPreset } from "@/components/dashboard/builderLayoutPresets";
import type {
  BuilderDesign,
  BuilderLayoutBlock,
  BuilderSection,
  BuilderState,
  BuilderTemplate,
  LayoutBlockKind,
  SectionBackgroundMode,
  SectionColorScheme,
  SectionContentMode,
  SectionKind,
  SectionSpacing,
  TypographySettings,
} from "@/components/dashboard/builderTypes";
import { sectionLabels } from "@/components/dashboard/builderRegistry";

export const designPresets: Record<
  NonNullable<BuilderDesign["preset"]>,
  BuilderDesign
> = {
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
    cardBg: "#efefe9",
    cardRadius: "8px",
    cardBorder: "transparent",
    cardShadow: "0 12px 30px rgba(17,17,17,0.06)",
    cardShadowHover: "0 18px 42px rgba(17,17,17,0.1)",
    cardImageBg: "#ffffff",
    cardImagePadding: "clamp(22px, 2.4vw, 36px)",
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
    cardBg: "#ffffff",
    cardRadius: "4px",
    cardBorder: "rgba(22,22,22,0.1)",
    cardShadow: "0 8px 24px rgba(22,22,22,0.06)",
    cardShadowHover: "0 14px 36px rgba(22,22,22,0.1)",
    cardImageBg: "#f0ece5",
    cardImagePadding: "clamp(18px, 2vw, 32px)",
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
    cardBg: "#24241f",
    cardRadius: "10px",
    cardBorder: "rgba(247,247,241,0.08)",
    cardShadow: "0 16px 40px rgba(0,0,0,0.3)",
    cardShadowHover: "0 22px 54px rgba(0,0,0,0.4)",
    cardImageBg: "#1a1a16",
    cardImagePadding: "clamp(22px, 2.4vw, 36px)",
  },
};

export const defaultDesign = designPresets.princity;

export const sectionBackgroundPresets = [
  { label: "White", value: "#ffffff", scheme: "light" },
  { label: "Soft", value: "#f7f7f4", scheme: "light" },
  { label: "Warm", value: "#f0ece5", scheme: "light" },
  { label: "Mint", value: "#eef5e8", scheme: "light" },
  { label: "Ink", value: "#111111", scheme: "dark" },
  { label: "Charcoal", value: "#24241f", scheme: "dark" },
] as const;

export const defaultState: BuilderState = {
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
      pagination: {
        enabled: false,
        perPage: 12,
        mode: "pageNumbers",
        infiniteScroll: false,
      },
      visible: true,
    },
  ],
};

const defaultTypography: TypographySettings = {
  variant: "body",
  fontFamily: "inherit",
  fontSize: "16px",
  fontWeight: "400",
  lineHeight: "1.4",
  letterSpacing: "0px",
  color: "inherit",
  textAlign: "left",
};

export const defaultTemplateStates: Record<BuilderTemplate, BuilderState> = {
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
        layout: "halves",
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
        pagination: {
          enabled: false,
          perPage: 12,
          mode: "pageNumbers",
          infiniteScroll: false,
        },
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
        pagination: {
          enabled: false,
          perPage: 12,
          mode: "pageNumbers",
          infiniteScroll: false,
        },
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
        pagination: {
          enabled: false,
          perPage: 12,
          mode: "pageNumbers",
          infiniteScroll: false,
        },
        visible: true,
      },
    ],
  },
};
export function createId(kind: SectionKind) {
  return `${kind}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function createBlockId(kind: LayoutBlockKind) {
  return `${kind}-block-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function createLayoutBlock(kind: LayoutBlockKind): BuilderLayoutBlock {
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
      carouselSettings: {
        variant: "default",
      },
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

  if (kind === "button") {
    return {
      id,
      kind,
      buttonsLayout: "inline",
      buttons: [
        {
          id: `btn-${Date.now().toString(36)}`,
          label: "Button Text",
          url: "/",
          target: "_self",
          style: "primary",
        }
      ],
      elementPadding: "none",
      elementBackgroundMode: "transparent",
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
          typography: defaultTypography,
        },
        {
          id: `${id}-2`,
          eyebrow: "02",
          title: "Grid item two",
          meta: "Meta",
          text: "Control columns, spacing, images, and content.",
          buttonLabel: "Learn more",
          buttonUrl: "/",
          typography: defaultTypography,
        },
        {
          id: `${id}-3`,
          eyebrow: "03",
          title: "Grid item three",
          meta: "Meta",
          text: "Later this can read posts, products, or custom fields.",
          buttonLabel: "Learn more",
          buttonUrl: "/",
          typography: defaultTypography,
        },
      ],
    };
  }

  if (kind === "heading") {
    return {
      id,
      kind,
      headingText: "Your Heading Text",
      headingLevel: "h2",
      headingAlign: "left",
      typography: {
        ...defaultTypography,
        variant: "heading",
        fontSize: "",
        fontWeight: "",
        lineHeight: "",
      },
    };
  }

  if (kind === "image") {
    return {
      id,
      kind,
      title: "Image",
      body: "A simple image block for banners, artwork, and visual breaks.",
      imageUrl: "",
      imageAlt: "",
      imageAlignment: "center",
      imageMaxWidth: 1200,
      imageBorderRadius: 0,
      imageCaption: "",
    };
  }

  if (kind === "table") {
    return {
      id,
      kind,
      title: "Table",
      body: "An editable data table.",
      tableHeadings: ["Column A", "Column B", "Column C"],
      tableRows: [
        ["Row 1 Cell A", "Row 1 Cell B", "Row 1 Cell C"],
        ["Row 2 Cell A", "Row 2 Cell B", "Row 2 Cell C"],
      ],
      tableStyle: "striped",
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

  if (kind === "cartContent") {
    return {
      id,
      kind,
      title: "Cart Content",
      body: "Live cart UI rendered from the React storefront.",
    };
  }

  if (kind === "checkoutContent") {
    return {
      id,
      kind,
      title: "Checkout Content",
      body: "Live checkout UI rendered from the React storefront.",
    };
  }

  if (kind === "accountContent") {
    return {
      id,
      kind,
      title: "My Account Content",
      body: "Live account UI rendered from the React storefront.",
    };
  }

  if (kind === "scrollPinnedDemo") {
    return {
      id,
      kind,
      title: "Scroll Pinned Storytelling",
      eyebrow: "Interactive Showcase",
      body: "Notice how the layout is locked. The scrollbar no longer moves the page vertically. Instead, it directs all energy into fueling the progressive card reveal.",
      elementBackground: "#0a0a0a",
      slides: [
        {
          id: `${id}-slide-1`,
          badge: "01",
          title: "Layout Intercepted",
          text: "GSAP ScrollTrigger sets a temporary inline position fixed to your container, creating a beautiful overlay effect without breaking page layout flow.",
        },
        {
          id: `${id}-slide-2`,
          badge: "02",
          title: "Timeline Scrubbing",
          text: "Scrubbing maps scroll position to timeline interpolation. Scrolling backwards reverses the animation seamlessly.",
        },
        {
          id: `${id}-slide-3`,
          badge: "03",
          title: "Scroll Release",
          text: "Once the timeline finishes, ScrollTrigger unpins the element, and the container rolls up smoothly. The user continues their journey.",
        },
      ],
      carouselSettings: {
        variant: "perfect",
        scrubSpeed: 1.2,
        pinHeightFactor: 100,
        showNavigation: true,
      },
      items: [
        "Natively linked with local state settings",
        "Fully customizable badge numbers and tags",
        "Smooth mobile & desktop layout responsiveness",
      ],
      listIcon: "circleCheck",
    };
  }

  if (kind === "slider") {
    return {
      id,
      kind,
      title: "Swiper / Carousel",
      body: "A modern reusable carousel block with editable slides.",
      slides: [
        {
          id: `${id}-slide-1`,
          badge: "01",
          title: "First slide",
          text: "Edit image, title, text, and call to action from the dashboard.",
          imagePadding: "medium",
          typography: defaultTypography,
        },
        {
          id: `${id}-slide-2`,
          badge: "02",
          title: "Second slide",
          text: "Use this for campaigns, features, or visual stories.",
          imagePadding: "medium",
          typography: defaultTypography,
        },
      ],
      carouselSettings: {
        variant: "showcase",
        loop: true,
        autoplay: false,
        autoplayDelayMs: 5000,
        align: "start",
        dragFree: false,
        effect: "slide",
        spaceBetween: 24,
        coverflowRotate: 34,
        coverflowDepth: 140,
        coverflowStretch: 0,
        cardsRotate: true,
        cardsShadows: true,
        creativePreset: "soft-stack",
        fadeCrossFade: true,
        freeModeMomentum: true,
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
        {
          id: `${id}-badge-1`,
          label: "01",
          title: "Fast",
          body: "Reusable block settings.",
        },
        {
          id: `${id}-badge-2`,
          label: "02",
          title: "Clean",
          body: "Flat, modern presentation.",
        },
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
      listIcon: "check",
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
    typography: defaultTypography,
  };
}

export function createSection(kind: SectionKind): BuilderSection {
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
      carouselSettings: {
        variant: "default",
      },
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
      layout: "halves",
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

  if (kind === "scrollPinnedDemo") {
    return {
      ...base,
      title: "Scroll Pinned Storytelling",
      eyebrow: "Interactive Showcase",
      body: "Notice how the layout is locked. The scrollbar no longer moves the page vertically. Instead, it directs all energy into fueling the progressive card reveal.",
      background: "#0a0a0a",
      backgroundMode: "full",
      contentMode: "full",
      slides: [
        {
          id: `slide-1-${Date.now().toString(36)}`,
          badge: "01",
          title: "Layout Intercepted",
          text: "GSAP ScrollTrigger sets a temporary inline position fixed to your container, creating a beautiful overlay effect without breaking page layout flow.",
        },
        {
          id: `slide-2-${Date.now().toString(36)}`,
          badge: "02",
          title: "Timeline Scrubbing",
          text: "Scrubbing maps scroll position to timeline interpolation. Scrolling backwards reverses the animation seamlessly.",
        },
        {
          id: `slide-3-${Date.now().toString(36)}`,
          badge: "03",
          title: "Scroll Release",
          text: "Once the timeline finishes, ScrollTrigger unpins the element, and the container rolls up smoothly. The user continues their journey.",
        },
      ],
      carouselSettings: {
        variant: "perfect",
        scrubSpeed: 1.2,
        pinHeightFactor: 100,
        showNavigation: true,
      },
      items: [
        "Natively linked with local state settings",
        "Fully customizable badge numbers and tags",
        "Smooth mobile & desktop layout responsiveness",
      ],
      listIcon: "circleCheck",
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

export function createWireframeSection(
  columns: number,
  rows: number,
  presetKey?: string,
): BuilderSection {
  const safeColumns = Math.min(Math.max(columns, 1), 6);
  const safeRows = Math.min(Math.max(rows, 1), 4);
  const layout =
    getBuilderRowLayoutPreset(presetKey)?.key ??
    (safeRows === 1
      ? safeColumns === 1
        ? "whole"
        : safeColumns === 2
          ? "halves"
          : safeColumns === 3
            ? "thirds"
            : safeColumns === 4
              ? "quarters"
              : safeColumns === 5
                ? "fifths"
                : "sixths"
      : undefined);
  return {
    ...createSection("contentLayout"),
    title: "",
    eyebrow: "",
    body: "",
    layout,
    layoutColumns: safeColumns,
    layoutRows: safeRows,
    layoutItems: Array.from({ length: safeColumns * safeRows }, (_, index) => ({
      id: `layout-item-${Date.now().toString(36)}-${index + 1}`,
      blocks: [],
    })),
  };
}
export const elementBackgroundPresets = [
  { label: "White", value: "#ffffff" },
  { label: "Soft", value: "#f5f5f3" },
  { label: "Ink", value: "#111111" },
];
