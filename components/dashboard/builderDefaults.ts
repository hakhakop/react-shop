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

const PREMIUM_IMAGE_PLACEHOLDER = "/builder-image-placeholder.svg";

const premiumContentTypography = {
  eyebrow: {
    variant: "subheading" as const,
    fontSize: "12px",
    fontWeight: "700",
    lineHeight: "1.2",
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
  },
  title: {
    variant: "heading" as const,
    fontSize: "clamp(28px, 3vw, 46px)",
    fontWeight: "720",
    lineHeight: "1.06",
    letterSpacing: "-0.025em",
  },
  body: {
    variant: "body" as const,
    fontSize: "16px",
    fontWeight: "400",
    lineHeight: "1.7",
  },
  button: {
    variant: "button" as const,
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    letterSpacing: "0.01em",
  },
};

function premiumCardVisualStyle(options?: {
  elevated?: boolean;
  imageRatio?: "4:5" | "3:4" | "16:9" | "square";
}) {
  return {
    customClass: "builder-premium-starter",
    card: {
      preset: options?.elevated ? ("elevated" as const) : ("soft" as const),
      hoverPreset: "lift-soft" as const,
      imageRatio: options?.imageRatio ?? ("4:5" as const),
      imageFit: "cover" as const,
      imageRadius: "14px",
      titleSize: "clamp(22px, 2vw, 30px)",
      titleWeight: "720",
      titleMargin: "0",
      metaSize: "11px",
      metaTransform: "uppercase" as const,
      metaSpacing: "0",
      contentSize: "15px",
      contentLineHeight: "1.65",
      buttonMargin: "8px 0 0",
      cardGap: "14px",
      cardPadding: "clamp(20px, 2.4vw, 30px)",
    },
    border: {
      radius: "18px",
    },
  };
}

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
      eyebrow: "A considered digital presence",
      title: "Turn a clear idea into a website people remember",
      body: "Bring your story, services, and next steps together in a polished experience designed to earn attention and build trust.",
      buttonLabel: "Start a Project",
      buttonUrl: "/",
      buttonStyle: "primary",
      secondaryButtonLabel: "See Our Work",
      secondaryButtonUrl: "/",
      secondaryButtonTarget: "_self",
      secondaryButtonStyle: "secondary",
      secondaryButtonSize: "default",
      buttonsLayout: "inline",
      buttonGap: "0.75rem",
      elementAlign: "left",
      elementPadding: "sm",
      heroHeadingElement: "h1",
      heroHeadingStyle: "xlarge",
      heroContentAlign: "left",
      heroVerticalAlign: "center",
      heroContentWidth: "large",
      heroMediaPlacement: "none",
      heroMediaFit: "cover",
      heroMediaRatio: "natural",
      heroHeight: "auto",
      heroPrimaryActionVisible: true,
      heroSecondaryActionVisible: true,
      heroMediaLoading: "lazy",
      typography: premiumContentTypography,
      carouselSettings: {
        variant: "default",
      },
    };
  }

  if (kind === "button") {
    return {
      id,
      kind,
      buttonLabel: "Schedule a Consultation",
      buttonUrl: "/",
      buttonStyle: "primary",
      size: "default",
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
      gridItemRenderer: "plain",
      gridCardVariant: "default",
      gridCardSize: "default",
      gridCardHover: false,
      gridRowGap: "medium",
      gridStacking: "inherit",
      gridItems: [
        {
          id: `${id}-1`,
          eyebrow: "01",
          title: "Strategy with a practical point of view",
          meta: "Clarity before complexity",
          text: "Define the audience, message, and priorities that will make every design decision easier.",
          buttonLabel: "Explore Strategy",
          buttonUrl: "/",
          titleElement: "h3",
          titleStyle: "inherit",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: "Warm architectural forms representing strategic planning",
        },
        {
          id: `${id}-2`,
          eyebrow: "02",
          title: "Design that feels distinctive and effortless",
          meta: "Made for real people",
          text: "Shape a responsive experience with a strong visual rhythm and thoughtful interactions.",
          buttonLabel: "View Selected Work",
          buttonUrl: "/",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: "Editorial composition representing interface design",
        },
        {
          id: `${id}-3`,
          eyebrow: "03",
          title: "A foundation designed to keep improving",
          meta: "Built beyond launch",
          text: "Measure what matters, refine the journey, and evolve the site as the business grows.",
          buttonLabel: "Discuss Your Goals",
          buttonUrl: "/",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: "Abstract rising forms representing sustainable growth",
        },
      ],
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle({ elevated: false, imageRatio: "16:9" }),
    };
  }

  if (kind === "heading") {
    return {
      id,
      kind,
      headingText: "Thoughtful work creates momentum that lasts",
      headingLevel: "h2",
      headingAlign: "left",
      headingSize: "medium",
      elementPadding: "sm",
    };
  }

  if (kind === "accordion") {
    return {
      id,
      kind,
      accordionItems: [
        { id: `${id}-item-1`, title: "What does this include?", content: "Add the key details your visitors need to understand the offer." },
        { id: `${id}-item-2`, title: "How does it work?", content: "Explain the next step in a concise, helpful answer." },
        { id: `${id}-item-3`, title: "Can I ask a question?", content: "Give visitors a clear path to contact you or continue exploring." },
      ],
      accordionMultiple: false,
      accordionCollapsible: true,
      accordionOpenItems: [0],
      accordionStyle: "default",
      accordionIndicator: "default",
      accordionIndicatorPosition: "end",
      accordionTitleEmphasis: "inherit",
      accordionItemSpacing: "inherit",
      accordionContentSpacing: "inherit",
      accordionDivider: true,
      accordionTitleStyle: "inherit",
      accordionContentStyle: "inherit",
    };
  }

  if (kind === "image") {
    return {
      id,
      kind,
      title: "",
      body: "",
      imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
      imageAlt: "Modern editorial image placeholder",
      imageAlignment: "center",
      imageMaxWidth: 1200,
      imageFit: "cover",
      imageRatio: "16:9",
      imageShape: "rounded",
      imageShadow: "none",
      imageWidth: "auto",
      imageLoading: "lazy",
      imageLinkTarget: "_self",
      imageCaption: "",
      elementPadding: "xs",
    };
  }

  if (kind === "table") {
    return {
      id,
      kind,
      title: "Choose the partnership that fits your next chapter",
      body: "Every engagement begins with the same care; choose the level of collaboration your goals require.",
      tableHeadings: ["What’s included", "Essential", "Signature", "Partnership"],
      tableRows: [
        ["Discovery workshop", "90 minutes", "Half day", "Full day"],
        ["Design directions", "1 direction", "2 directions", "3 directions"],
        ["Launch support", "7 days", "30 days", "90 days"],
        ["Ongoing guidance", "By request", "Monthly", "Dedicated"],
      ],
      tableStyle: "striped",
      elementPadding: "sm",
      typography: premiumContentTypography,
    };
  }

  if (kind === "panel") {
    return {
      id,
      kind,
      eyebrow: "A more considered approach",
      title: "Build a brand experience that feels unmistakably yours",
      body: "From the first headline to the smallest interaction, every detail works together to create clarity, confidence, and recognition.",
      buttonLabel: "Discover the Process",
      buttonUrl: "/",
      buttonStyle: "primary",
      imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
      imageAlt: "Editorial placeholder for a featured brand story",
      imageRatio: "16:9",
      imagePadding: "frameless",
      imageFit: "cover",
      panelVariant: "default",
      panelHover: false,
      panelSize: "default",
      panelShowMedia: true,
      panelMediaPlacement: "top",
      panelMediaFit: "cover",
      panelMediaWidth: "medium",
      panelMediaAlignment: "center",
      panelTextAlign: "left",
      panelVerticalAlign: "top",
      panelTitleElement: "h3",
      panelTitleStyle: "inherit",
      panelContentWidth: "auto",
      panelActionVisible: true,
      panelActionStyle: "primary",
      panelActionSize: "default",
      panelActionAlign: "inherit",
    };
  }

  if (kind === "productHero") {
    return {
      id,
      kind,
      eyebrow: "Featured selection",
      title: "Discover a product worth remembering",
      body: "Showcase the current product with its gallery, key details, price, options, and purchase action in one balanced introduction.",
      elementPadding: "lg",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle({ elevated: true, imageRatio: "4:5" }),
    };
  }

  if (kind === "productInfoStack") {
    return {
      id,
      kind,
      title: "Everything you need to choose with confidence",
      body: "The current product title, price, description, options, and purchase action appear here automatically.",
      elementPadding: "lg",
      typography: premiumContentTypography,
    };
  }

  if (kind === "productPurchasePanel") {
    return {
      id,
      kind,
      title: "Ready when you are",
      body: "A focused purchase panel using the current product price, available options, and add-to-cart action.",
      elementPadding: "lg",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle({ elevated: true }),
    };
  }

  if (kind === "productSpecsPanel") {
    return {
      id,
      kind,
      title: "Product details",
      body: "Materials, dimensions, options, and other current product attributes are organized here automatically.",
      elementPadding: "lg",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle(),
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
      elementPadding: "sm",
      visualStyle: premiumCardVisualStyle({ imageRatio: "4:5" }),
    };
  }

  if (kind === "productTitle") {
    return {
      id,
      kind,
      title: "Signature Everyday Collection",
      body: "The current product name appears here automatically.",
      typography: premiumContentTypography,
    };
  }

  if (kind === "productPrice") {
    return {
      id,
      kind,
      title: "$89.00",
      body: "The current product price and sale price appear here automatically.",
      typography: premiumContentTypography,
    };
  }

  if (kind === "productAddToCart") {
    return {
      id,
      kind,
      title: "Add to cart",
      body: "Let customers choose available options and add the current product to their cart.",
      addToCartSize: "large",
      elementPadding: "xs",
    };
  }

  if (kind === "productAttributes") {
    return {
      id,
      kind,
      title: "Details and specifications",
      body: "The current product’s materials, sizes, colors, and other attributes appear here automatically.",
      typography: premiumContentTypography,
    };
  }

  if (kind === "productDescription") {
    return {
      id,
      kind,
      title: "Made for everyday use",
      body: "The current product description appears here, giving customers the context they need before purchasing.",
      typography: premiumContentTypography,
    };
  }

  if (kind === "cartContent") {
    return {
      id,
      kind,
      title: "Your cart",
      body: "Review selected items, update quantities, and continue securely when you are ready.",
      elementPadding: "md",
      typography: premiumContentTypography,
    };
  }

  if (kind === "checkoutContent") {
    return {
      id,
      kind,
      title: "Secure checkout",
      body: "Complete delivery and payment details through the live storefront checkout.",
      elementPadding: "md",
      typography: premiumContentTypography,
    };
  }

  if (kind === "accountContent") {
    return {
      id,
      kind,
      title: "Your account",
      body: "Customers can review orders, manage account details, and keep their information up to date.",
      elementPadding: "md",
      typography: premiumContentTypography,
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
      elementPadding: "lg",
      typography: premiumContentTypography,
    };
  }

  if (kind === "slider" || kind === "slideshow" || kind === "overlaySlider") {
    const isOverlaySlider = kind === "overlaySlider";
    return {
      id,
      kind,
      slides: [
        {
          id: `${id}-slide-1`,
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: isOverlaySlider ? "Overlay slider image 1" : "Slideshow image 1",
          imagePadding: "frameless",
        },
        {
          id: `${id}-slide-2`,
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: isOverlaySlider ? "Overlay slider image 2" : "Slideshow image 2",
          imagePadding: "frameless",
        },
        {
          id: `${id}-slide-3`,
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: isOverlaySlider ? "Overlay slider image 3" : "Slideshow image 3",
          imagePadding: "frameless",
        },
      ],
      carouselSettings: {
        presentation: isOverlaySlider ? "overlay-slider" : "slideshow",
        variant: isOverlaySlider ? "overlay" : "hero",
        slideMode: isOverlaySlider ? "overlay" : "hero",
        aspectRatio: "16:9",
        loop: true,
        autoplay: false,
        autoplayDelayMs: 5000,
        align: "start",
        dragFree: false,
        effect: "slide",
        spaceBetween: isOverlaySlider ? 30 : 0,
        cardsPerView: 1,
        showArrows: true,
        showDots: true,
        arrowStyle: "chevron",
        arrowPosition: "overlay",
        paginationStyle: "minimal-dots",
        paginationPosition: "bottom",
        overlayGradient: "none",
        ...(isOverlaySlider
          ? {
              overlayMode: "cover" as const,
              overlayDisplay: "always" as const,
              overlayPadding: "default",
              itemWidthMode: "fixed" as const,
              overlayLink: false,
            }
          : {
              slideshowHeight: "auto" as const,
              slideshowRatio: "16:9",
            }),
        pauseOnHover: true,
      },
      elementPadding: "xs",
    };
  }

  if (kind === "panelSlider") {
    return {
      id,
      kind,
      title: "Choose the next step",
      body: "A focused collection of services, stories, or offers presented as sliding panels.",
      slides: [
        {
          id: `${id}-panel-1`,
          title: "Build the right foundation",
          meta: "Strategy",
          text: "Align the essentials before expanding the experience.",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: "Panel slider item 1",
          imagePadding: "frameless",
          imageFit: "cover",
          imageRatio: "16:9",
          panelStyle: "default",
          panelSize: "default",
          headingLevel: "h3",
          metaStyle: "muted",
          showAction: true,
          buttonLabel: "Learn more",
          buttonUrl: "#",
          buttonStyle: "primary",
          buttonSize: "default",
        },
        {
          id: `${id}-panel-2`,
          title: "Shape a clear system",
          meta: "Design",
          text: "Use reusable components to keep every part of the page coherent.",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: "Panel slider item 2",
          imagePadding: "frameless",
          imageFit: "cover",
          imageRatio: "16:9",
          panelStyle: "default",
          panelSize: "default",
          headingLevel: "h3",
          metaStyle: "muted",
          showAction: true,
          buttonLabel: "Explore design",
          buttonUrl: "#",
          buttonStyle: "primary",
          buttonSize: "default",
        },
        {
          id: `${id}-panel-3`,
          title: "Launch with confidence",
          meta: "Delivery",
          text: "Make each interaction responsive, consistent, and ready to evolve.",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: "Panel slider item 3",
          imagePadding: "frameless",
          imageFit: "cover",
          imageRatio: "16:9",
          panelStyle: "default",
          panelSize: "default",
          headingLevel: "h3",
          metaStyle: "muted",
          showAction: true,
          buttonLabel: "See the process",
          buttonUrl: "#",
          buttonStyle: "primary",
          buttonSize: "default",
        },
      ],
      carouselSettings: {
        variant: "panel",
        slideMode: "panel",
        effect: "slide",
        loop: true,
        autoplay: false,
        autoplayDelayMs: 5000,
        pauseOnHover: true,
        spaceBetween: 24,
        cardsPerView: 3,
        showArrows: true,
        showDots: true,
        arrowStyle: "chevron",
        arrowPosition: "bottom-right",
        paginationStyle: "minimal-dots",
        paginationPosition: "bottom",
      },
      elementPadding: "sm",
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
      elementPadding: "sm",
      typography: premiumContentTypography,
    };
  }

  if (kind === "fluentForm") {
    return {
      id,
      kind,
      title: "Let’s start a conversation",
      body: "Choose a Fluent Forms form to help visitors ask a question, request details, or book a consultation.",
      fluentFormId: "",
      elementPadding: "sm",
      typography: premiumContentTypography,
    };
  }

  if (kind === "gallery") {
    return {
      id,
      kind,
      title: "Gallery Showcase",
      columns: 3,
      gridGap: "medium",
      enableLightbox: true,
      galleryItems: [
        {
          id: `${id}-item-1`,
          imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
          title: "Creative Artwork",
          meta: "Design & Art",
          content: "Visual layout showcase",
        },
        {
          id: `${id}-item-2`,
          imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
          title: "Modern Abstract",
          meta: "Abstract",
          content: "Clean aesthetics",
        },
        {
          id: `${id}-item-3`,
          imageUrl: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80",
          title: "Photography",
          meta: "Photo",
          content: "High resolution media",
        },
      ],
    } as any;
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
          label: "12+",
          title: "Years of focused experience",
          body: "Senior thinking applied from the first conversation through launch.",
        },
        {
          id: `${id}-badge-2`,
          label: "38",
          title: "Brands moved forward",
          body: "Distinctive digital foundations shaped around real business goals.",
        },
        {
          id: `${id}-badge-3`,
          label: "94%",
          title: "Work from recommendations",
          body: "Long-term relationships built through clarity, care, and dependable delivery.",
        },
      ],
      elementPadding: "sm",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle(),
    };
  }

  if (kind === "icon") {
    return {
      id,
      kind,
      iconName: "star",
      title: "Designed with care",
      body: "A focused experience that makes important information easier to notice and understand.",
      listIconSize: 28,
      elementPadding: "md",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle(),
    };
  }

  if (kind === "list") {
    return {
      id,
      kind,
      title: "What you can expect",
      items: [
        "A focused discovery session before design begins",
        "Clear recommendations grounded in your goals",
        "Responsive design considered at every stage",
        "A flexible system your team can confidently maintain"
      ],
      listPresentation: "default",
      listMarker: "none",
      listAlign: "left",
      listSpacing: "default",
      elementPadding: "md",
      typography: premiumContentTypography,
    };
  }

  if (kind === "datePicker") {
    return {
      id,
      kind,
      title: "Book a consultation",
      dateLabel: "Choose your preferred date",
      body: "Select a convenient date and we’ll follow up to confirm the details.",
      elementPadding: "md",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle(),
    };
  }

  if (kind === "products") {
    return {
      id,
      kind,
      title: "Objects chosen for everyday rituals",
      source: "all",
      layoutVariant: "grid",
      columns: 4,
      gridLimit: 8,
      filterPosition: "left",
      cardStyle: "soft",
      cardPreset: "editorial",
      panelStyle: "clean-shadow",
      elementPadding: "sm",
      typography: premiumContentTypography,
      visualStyle: premiumCardVisualStyle({ imageRatio: "4:5" }),
    };
  }

  if (kind === "categoryFilters") {
    return {
      id,
      kind,
      title: "Browse by category",
      body: "Help customers narrow the collection and find the right products faster.",
      elementPadding: "xs",
      typography: premiumContentTypography,
    };
  }

  if (kind === "breadcrumbs") {
    return {
      id,
      kind,
      title: "You are here",
      body: "A clear navigation path helps visitors understand where they are and move back easily.",
      elementPadding: "xs",
      typography: premiumContentTypography,
    };
  }

  if (kind === "divider") {
    return {
      id,
      kind,
      dividerStyle: "default",
    };
  }

  if (kind === "alert") {
    return {
      id,
      kind,
      alertStyle: "primary",
      title: "Heads up",
      body: "This is a UIkit alert callout. Change the variant or edit the text in the inspector.",
      elementPadding: "sm",
    };
  }

  return {
    id,
    kind: "text",
    eyebrow: "",
    title: "Good work begins with a clear point of view",
    body: "<p>We help ambitious teams turn complex ideas into focused, useful experiences.</p><p>Every decision is shaped around what your audience needs to understand, feel, and do next.</p><blockquote>Clarity is not the absence of personality—it is what gives personality room to be understood.</blockquote>",
    buttonLabel: "",
    buttonUrl: "",
    textVariant: "default",
    textAlign: "left",
    elementPadding: "sm",
    visualStyle: {
      customClass: "builder-premium-starter",
    },
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

  if (kind === "slider" || kind === "slideshow" || kind === "overlaySlider") {
    const isOverlaySlider = kind === "overlaySlider";
    return {
      ...base,
      background: "#ffffff",
      backgroundMode: "boxed",
      contentMode: "full",
      slides: [
        {
          id: "slide-1",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: isOverlaySlider ? "Overlay slider image 1" : "Slideshow image 1",
          imagePadding: "frameless",
        },
        {
          id: "slide-2",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: isOverlaySlider ? "Overlay slider image 2" : "Slideshow image 2",
          imagePadding: "frameless",
        },
        {
          id: "slide-3",
          imageUrl: PREMIUM_IMAGE_PLACEHOLDER,
          imageAlt: isOverlaySlider ? "Overlay slider image 3" : "Slideshow image 3",
          imagePadding: "frameless",
        },
      ],
      carouselSettings: {
        presentation: isOverlaySlider ? "overlay-slider" : "slideshow",
        variant: isOverlaySlider ? "overlay" : "hero",
        slideMode: isOverlaySlider ? "overlay" : "hero",
        aspectRatio: "16:9",
        loop: true,
        autoplay: false,
        autoplayDelayMs: 5000,
        align: "center",
        dragFree: false,
        cardsPerView: 1,
        showArrows: true,
        showDots: true,
        arrowStyle: "chevron",
        arrowPosition: "overlay",
        paginationStyle: "minimal-dots",
        paginationPosition: "bottom",
        overlayGradient: "none",
        ...(isOverlaySlider
          ? {
              overlayMode: "cover" as const,
              overlayDisplay: "always" as const,
              overlayPadding: "default",
              itemWidthMode: "fixed" as const,
              overlayLink: false,
            }
          : {
              slideshowHeight: "auto" as const,
              slideshowRatio: "16:9",
            }),
      },
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
  const safeRows = Math.min(Math.max(rows, 0), 4);
  const layout =
    safeRows === 0
      ? undefined
      : getBuilderRowLayoutPreset(presetKey)?.key ??
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
  const columnCount = safeRows === 0 ? 0 : preset?.ratios.length ?? safeColumns;
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
    layout: safeRows > 0 ? rowLayout : undefined,
    layoutColumns: safeRows > 0 ? columnCount : undefined,
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
