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
import { BUILDER_STRUCTURAL_DESIGN } from "@/lib/builderGeometry";

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
  { label: "Sage", value: "#e2e8df", scheme: "light" },
  { label: "Mint", value: "#eef5e8", scheme: "light" },
  { label: "Clay", value: "#f2e9e1", scheme: "light" },
  { label: "Nordic Mist", value: "linear-gradient(135deg, #e0e0e0 0%, #f5f5f7 100%)", scheme: "light" },
  { label: "Aurora Glow", value: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)", scheme: "light" },
  { label: "Sunset Glow", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", scheme: "dark" },
  { label: "Cyberpunk", value: "linear-gradient(135deg, #2b1055 0%, #7597de 100%)", scheme: "dark" },
  { label: "Deep Ocean", value: "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)", scheme: "dark" },
  { label: "Ocean", value: "#0a192f", scheme: "dark" },
  { label: "Ink", value: "#111111", scheme: "dark" },
  { label: "Charcoal", value: "#24241f", scheme: "dark" },
  { label: "Mesh Dark", value: "linear-gradient(135deg, #1f1f1a 0%, #111111 100%)", scheme: "dark" },
] as const;

export const defaultState: BuilderState = {
  page: "home",
  targetType: "page",
  design: defaultDesign,
  sections: [],
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
      eyebrow: "PLATFORM OVERVIEW",
      title: "Build beautiful websites without writing code",
      body: "Create professional websites using a visual builder designed for speed, flexibility, and pixel-perfect control.",
      buttonLabel: "Start Building",
      buttonUrl: "/",
      buttonStyle: "primary",
      buttons: [
        {
          id: `${id}-secondary-action`,
          label: "Explore Templates",
          url: "/",
          target: "_self",
          style: "outline",
        },
      ],
      buttonsLayout: "inline",
      buttonGap: "0.75rem",
      elementAlign: "left",
      elementPadding: "lg",
      carouselSettings: {
        variant: "default",
      },
    };
  }

  if (kind === "promoStrip") {
    return {
      id,
      kind,
      eyebrow: "LIMITED TIME OFFER",
      title: "Get 30% off your first year of Premium plan",
      body: "Unlock advanced collaboration features, custom domain support, and priority hosting. Offer ends this week.",
      buttonLabel: "Claim Discount",
      buttonUrl: "/",
      elementPadding: "sm",
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
          label: "Start Free Trial",
          url: "/",
          target: "_self",
          style: "primary",
        }
      ],
      elementPadding: "inherit",
      elementBackgroundMode: "transparent",
    };
  }

  if (kind === "grid") {
    return {
      id,
      kind,
      title: "Services designed around your goals",
      gridSource: "static",
      columns: 3,
      gridRows: 1,
      gridGap: "medium",
      gridMargin: "inherit",
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
          title: "Strategy & Consultation",
          meta: "Align your objectives",
          text: "Work with our experts to map out your digital product strategy and define key performance indicators.",
          buttonLabel: "View Details",
          buttonUrl: "/",
          typography: defaultTypography,
        },
        {
          id: `${id}-2`,
          eyebrow: "02",
          title: "Design & Engineering",
          meta: "High-fidelity execution",
          text: "Create modern, responsive interfaces backed by scalable frontend architectures and design systems.",
          buttonLabel: "See Our Work",
          buttonUrl: "/",
          typography: defaultTypography,
        },
        {
          id: `${id}-3`,
          eyebrow: "03",
          title: "Growth & Optimization",
          meta: "Scale your reach",
          text: "Continuously optimize page speeds, SEO metadata, and conversion paths to maximize your ROI.",
          buttonLabel: "Contact Us",
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
      headingText: "Ideas shaped into meaningful results",
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
      title: "",
      body: "",
      imageUrl: "/globe.svg",
      imageAlt: "Abstract globe illustration",
      imageAlignment: "center",
      imageMaxWidth: 960,
      imageFit: "contain",
      imageRatio: "square",
      imageCaption: "",
    };
  }

  if (kind === "table") {
    return {
      id,
      kind,
      title: "Pricing Comparison",
      body: "Compare plan features and choose the right level of support for your team.",
      tableHeadings: ["Feature", "Starter", "Professional", "Enterprise"],
      tableRows: [
        ["Custom Domains", "1 Domain", "5 Domains", "Unlimited"],
        ["SSD Storage", "10 GB", "100 GB", "Dedicated"],
        ["API Access", "None", "Standard", "Full Access"],
        ["Support SLA", "Email", "24/7 Priority", "Dedicated Manager"],
      ],
      tableStyle: "striped",
    };
  }

  if (kind === "panel") {
    return {
      id,
      kind,
      eyebrow: "DESIGN SYSTEM",
      title: "Maintain brand consistency across all pages",
      body: "Define your global typography, color palettes, and spacing rules once. Our visual builder applies them dynamically to ensure a premium, unified experience.",
      buttonLabel: "See Features",
      buttonUrl: "/",
      imageUrl: "",
      imageAlt: "",
      elementPadding: BUILDER_STRUCTURAL_DESIGN.panel.padding,
    };
  }

  if (kind === "productHero") {
    return {
      id,
      kind,
      eyebrow: "Featured selection",
      title: "Discover a product worth remembering",
      body: "Showcase the current product with its gallery, key details, price, options, and purchase action in one balanced introduction.",
      elementPadding: "md",
    };
  }

  if (kind === "productInfoStack") {
    return {
      id,
      kind,
      title: "Everything you need to choose with confidence",
      body: "The current product title, price, description, options, and purchase action appear here automatically.",
      elementPadding: "md",
    };
  }

  if (kind === "productPurchasePanel") {
    return {
      id,
      kind,
      title: "Ready when you are",
      body: "A focused purchase panel using the current product price, available options, and add-to-cart action.",
      elementPadding: "md",
    };
  }

  if (kind === "productSpecsPanel") {
    return {
      id,
      kind,
      title: "Product details",
      body: "Materials, dimensions, options, and other current product attributes are organized here automatically.",
      elementPadding: "md",
    };
  }

  if (kind === "productGallery") {
    return {
      id,
      kind,
      title: "Product gallery",
      body: "Browse the current product from every available angle.",
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
      title: "Signature Everyday Collection",
      body: "The current product name appears here automatically.",
    };
  }

  if (kind === "productPrice") {
    return {
      id,
      kind,
      title: "$89.00",
      body: "The current product price and sale price appear here automatically.",
    };
  }

  if (kind === "productAddToCart") {
    return {
      id,
      kind,
      title: "Add to cart",
      body: "Let customers choose available options and add the current product to their cart.",
      addToCartSize: "medium",
    };
  }

  if (kind === "productAttributes") {
    return {
      id,
      kind,
      title: "Details and specifications",
      body: "The current product’s materials, sizes, colors, and other attributes appear here automatically.",
    };
  }

  if (kind === "productDescription") {
    return {
      id,
      kind,
      title: "Made for everyday use",
      body: "The current product description appears here, giving customers the context they need before purchasing.",
    };
  }

  if (kind === "cartContent") {
    return {
      id,
      kind,
      title: "Your cart",
      body: "Review selected items, update quantities, and continue securely when you are ready.",
    };
  }

  if (kind === "checkoutContent") {
    return {
      id,
      kind,
      title: "Secure checkout",
      body: "Complete delivery and payment details through the live storefront checkout.",
    };
  }

  if (kind === "accountContent") {
    return {
      id,
      kind,
      title: "Your account",
      body: "Customers can review orders, manage account details, and keep their information up to date.",
    };
  }

  if (kind === "scrollPinnedDemo") {
    return {
      id,
      kind,
      title: "A clear path from idea to launch",
      eyebrow: "How it works",
      body: "Guide visitors through a focused story with one meaningful step revealed at a time.",
      slides: [
        {
          id: `${id}-slide-1`,
          badge: "01",
          title: "Start with your goals",
          text: "Share what you want to achieve, who you want to reach, and what a successful result should look like.",
        },
        {
          id: `${id}-slide-2`,
          badge: "02",
          title: "Shape the right approach",
          text: "Turn those priorities into a practical plan with clear content, structure, and next steps.",
        },
        {
          id: `${id}-slide-3`,
          badge: "03",
          title: "Launch and keep growing",
          text: "Publish with confidence, learn from real feedback, and continue improving as your needs evolve.",
        },
      ],
      carouselSettings: {
        variant: "perfect",
        scrubSpeed: 1.2,
        pinHeightFactor: 100,
        showNavigation: true,
      },
      items: [
        "A focused process from start to finish",
        "Clear milestones and editable steps",
        "Responsive presentation on every screen",
      ],
      listIcon: "circleCheck",
    };
  }

  if (kind === "slider") {
    return {
      id,
      kind,
      title: "Explore what makes the difference",
      body: "Use a clear visual sequence to introduce services, benefits, projects, or important ideas.",
      slides: [
        {
          id: `${id}-slide-1`,
          badge: "01",
          title: "Enterprise Grade Security",
          text: "Data protection is built into our core framework, ensuring your application remains safe and compliant.",
          imagePadding: "medium",
          typography: defaultTypography,
        },
        {
          id: `${id}-slide-2`,
          badge: "02",
          title: "Sub-Second Page Speeds",
          text: "Serve content globally through optimized CDN networks, providing visitors with instant load times.",
          imagePadding: "medium",
          typography: defaultTypography,
        },
        {
          id: `${id}-slide-3`,
          badge: "03",
          title: "Dedicated Asset Hosting",
          text: "Manage and deliver high-resolution media assets effortlessly without affecting site performance.",
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
      title: "Custom integration",
      body: "Embed a trusted form, map, booking tool, video, or service that supports the visitor journey.",
      embedMode: "code",
      embedCode: "<div><strong>Connect your preferred service</strong><p>Paste trusted embed code here to display it on the page.</p></div>",
      embedUrl: "",
      embedHeight: 260,
    };
  }

  if (kind === "fluentForm") {
    return {
      id,
      kind,
      title: "Let’s start a conversation",
      body: "Choose a Fluent Forms form to help visitors ask a question, request details, or book a consultation.",
      fluentFormId: "",
    };
  }

  if (kind === "badgeGrid") {
    return {
      id,
      kind,
      title: "Built around the essentials",
      body: "Highlight the qualities that make your offer clear, dependable, and easy to choose.",
      columns: 3,
      badges: [
        {
          id: `${id}-badge-1`,
          label: "99.99%",
          title: "Enterprise SLA",
          body: "Uptime guarantee backed by our priority support operations.",
        },
        {
          id: `${id}-badge-2`,
          label: "250ms",
          title: "Global CDN Delivery",
          body: "Fast content loading worldwide via cloud caching.",
        },
        {
          id: `${id}-badge-3`,
          label: "12K+",
          title: "Launches Completed",
          body: "Websites successfully launched on our platform.",
        },
      ],
    };
  }

  if (kind === "icon") {
    return {
      id,
      kind,
      iconName: "sparkles",
      title: "Designed with care",
      body: "A focused experience that makes important information easier to notice and understand.",
      elementPadding: "sm",
    };
  }

  if (kind === "list") {
    return {
      id,
      kind,
      title: "What you can expect",
      items: [
        "Direct integration with premium design tokens",
        "Optimized media delivery and assets processing",
        "Advanced SEO meta management on every page",
        "Secure custom domain mappings and SSL certificates"
      ],
      listIcon: "circleCheck",
      elementPadding: "sm",
    };
  }

  if (kind === "datePicker") {
    return {
      id,
      kind,
      title: "Book a consultation",
      dateLabel: "Choose your preferred date",
      body: "Select a convenient date and we’ll follow up to confirm the details.",
      elementPadding: "sm",
    };
  }

  if (kind === "products") {
    return {
      id,
      kind,
      title: "Shop the collection",
      source: "all",
      layoutVariant: "grid",
      columns: 4,
      gridLimit: 8,
      filterPosition: "left",
      cardStyle: "flat",
      cardPreset: "standard",
      panelStyle: "default",
    };
  }

  if (kind === "categoryFilters") {
    return {
      id,
      kind,
      title: "Browse by category",
      body: "Help customers narrow the collection and find the right products faster.",
    };
  }

  if (kind === "breadcrumbs") {
    return {
      id,
      kind,
      title: "You are here",
      body: "A clear navigation path helps visitors understand where they are and move back easily.",
    };
  }

  return {
    id,
    kind: "text",
    eyebrow: "A better way forward",
    title: "Make every interaction clear and useful",
    body: "Thoughtful content helps visitors understand your value, find what they need, and take the next step with confidence.",
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
    pullUnderHeader: false,
    visible: true,
  };

  if (kind === "hero") {
    return {
      ...base,
      eyebrow: "VISUAL BUILDER",
      title: "Build beautiful websites without writing code",
      body: "Create professional websites using a visual builder designed for speed, flexibility, and pixel-perfect control.",
      background: "#f7f7f4",
      backgroundMode: "full",
      contentMode: "boxed",
      layout: "split",
      buttonLabel: "Start Building",
      buttonUrl: "/",
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
      title: "Unlock full potential with our premium plans",
      body: "Connect your custom domains, scale your assets, and launch your storefront immediately.",
      background: "#111111",
      backgroundMode: "full",
      contentMode: "boxed",
      promoVariant: "default",
      ctaLabel: "View Pricing Plans",
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
          badge: "SaaS",
          title: "Design directly on the page with instant feedback",
          text: "Every element is fully editable. Drag, drop, style, and preview changes live.",
          imageAlt: "Modern storefront slide",
          imagePadding: "medium",
          buttonLabel: "Start Building",
          buttonUrl: "/",
        },
        {
          id: "slide-2",
          badge: "PORTFOLIO",
          title: "Exhibit your work in dynamic carousels",
          text: "Display case studies, team highlights, and products in clean galleries.",
          imageAlt: "Client design slide",
          imagePadding: "medium",
          buttonLabel: "View Case Studies",
          buttonUrl: "/",
        },
        {
          id: "slide-3",
          badge: "COMMERCE",
          title: "High-converting product showcases",
          text: "Feature collections and dynamic grids powered directly by WooCommerce.",
          imageAlt: "Preview builder slide",
          imagePadding: "medium",
          buttonLabel: "Explore Storefront",
          buttonUrl: "/shop",
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
      title: "Built for speed and flexibility",
      eyebrow: "Highlights",
      body: "Everything you need to create a fast, beautiful digital presence.",
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "full",
      columns: 3,
      badges: [
        {
          id: "badge-1",
          label: "01",
          title: "Premium design system",
          body: "Global design tokens and custom components ensure brand cohesion.",
        },
        {
          id: "badge-2",
          label: "02",
          title: "WooCommerce integrated",
          body: "Pull live catalog products, categories, and shopping features automatically.",
        },
        {
          id: "badge-3",
          label: "03",
          title: "GSAP scroll animations",
          body: "Animate your landing pages with high-fidelity triggers and scroll pinning.",
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
  const preset = getBuilderRowLayoutPreset(layout);
  const rowLayout = preset?.key ?? layout ?? "whole";
  const columnCount = preset?.ratios.length ?? safeColumns;
  const layoutItems = Array.from({ length: safeRows }, (_, rowIndex) => {
    const rowId = `layout-row-${Date.now().toString(36)}-${rowIndex + 1}`;
    return Array.from({ length: columnCount }, (_, columnIndex) => ({
      id: `${rowId}-column-${columnIndex + 1}`,
      rowId,
      rowLayout,
      blocks: [],
    }));
  }).flat();
  return {
    ...createSection("contentLayout"),
    title: "",
    eyebrow: "",
    body: "",
    contentMode: BUILDER_STRUCTURAL_DESIGN.section.widthPreset,
    layout: rowLayout,
    layoutColumns: columnCount,
    layoutRows: safeRows,
    layoutItems,
  };
}

export function createStructuralRowItems(presetKey: string) {
  const preset = getBuilderRowLayoutPreset(presetKey);
  if (!preset) return [];
  const rowId = `layout-row-${Date.now().toString(36)}`;
  return preset.ratios.map((_, index) => ({
    id: `${rowId}-column-${index + 1}`,
    rowId,
    rowLayout: preset.key,
    blocks: [],
  }));
}
export const elementBackgroundPresets = [
  { label: "White", value: "#ffffff" },
  { label: "Soft", value: "#f5f5f3" },
  { label: "Ink", value: "#111111" },
];
