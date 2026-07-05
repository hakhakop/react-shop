import { defaultDesign, designPresets } from "@/components/dashboard/builderDefaults";
import type {
  BuilderDesign,
  BuilderSection,
} from "@/components/dashboard/builderTypes";

export type PageTemplateCategory =
  | "blank"
  | "landing"
  | "business"
  | "shop"
  | "contact"
  | "about"
  | "portfolio"
  | "wireframes";

export type PageTemplateLibraryItem = {
  id: string;
  category: PageTemplateCategory;
  name: string;
  description: string;
  previewImage: string;
  design: BuilderDesign;
  sections: BuilderSection[];
};

export const pageTemplateCategories: {
  value: PageTemplateCategory | "all";
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "blank", label: "Blank" },
  { value: "landing", label: "Landing Pages" },
  { value: "business", label: "Business" },
  { value: "shop", label: "Shop" },
  { value: "contact", label: "Contact" },
  { value: "about", label: "About" },
  { value: "portfolio", label: "Portfolio" },
  { value: "wireframes", label: "Wireframes" },
];

function previewSvg(title: string, accent: string, surface: string, dark = false) {
  const text = encodeURIComponent(title);
  const bg = dark ? "#111111" : "#f7f7f4";
  const ink = dark ? "#f7f7f1" : "#171717";
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' rx='28' fill='${encodeURIComponent(bg)}'/%3E%3Crect x='42' y='38' width='556' height='46' rx='23' fill='${encodeURIComponent(surface)}'/%3E%3Ccircle cx='76' cy='61' r='12' fill='${encodeURIComponent(accent)}'/%3E%3Crect x='430' y='54' width='120' height='14' rx='7' fill='${encodeURIComponent(ink)}' opacity='.22'/%3E%3Crect x='42' y='118' width='268' height='206' rx='22' fill='${encodeURIComponent(accent)}' opacity='.88'/%3E%3Crect x='342' y='126' width='214' height='30' rx='15' fill='${encodeURIComponent(ink)}' opacity='.9'/%3E%3Crect x='342' y='176' width='170' height='16' rx='8' fill='${encodeURIComponent(ink)}' opacity='.35'/%3E%3Crect x='342' y='204' width='208' height='16' rx='8' fill='${encodeURIComponent(ink)}' opacity='.24'/%3E%3Crect x='342' y='250' width='116' height='38' rx='19' fill='${encodeURIComponent(accent)}'/%3E%3Crect x='42' y='352' width='154' height='30' rx='15' fill='${encodeURIComponent(surface)}'/%3E%3Crect x='220' y='352' width='154' height='30' rx='15' fill='${encodeURIComponent(surface)}'/%3E%3Crect x='398' y='352' width='154' height='30' rx='15' fill='${encodeURIComponent(surface)}'/%3E%3Ctext x='58' y='304' font-family='Arial,sans-serif' font-size='32' font-weight='800' fill='${encodeURIComponent(ink)}'%3E${text}%3C/text%3E%3C/svg%3E`;
}

function heroSection(
  id: string,
  title: string,
  eyebrow: string,
  body: string,
  background: string,
  buttonLabel = "Get Started",
): BuilderSection {
  return {
    id,
    kind: "contentLayout",
    title: `${title} Hero`,
    eyebrow: "",
    body: "",
    background,
    backgroundMode: "full",
    contentMode: "boxed",
    colorScheme: "inherit",
    layout: "whole",
    layoutColumns: 1,
    layoutRows: 1,
    layoutItems: [
      {
        id: `${id}-hero-column`,
        blocks: [
          {
            id: `${id}-hero-element`,
            kind: "hero",
            title,
            eyebrow,
            body,
            buttonLabel,
            buttonUrl: "/contact",
            buttonsLayout: "inline",
          },
        ],
      },
    ],
    topSpacing: "large",
    bottomSpacing: "large",
    visible: true,
  };
}

function promoSection(
  id: string,
  title: string,
  body: string,
  background: string,
): BuilderSection {
  return {
    id,
    kind: "promo",
    title,
    eyebrow: "Featured",
    body,
    background,
    backgroundMode: "boxed",
    contentMode: "boxed",
    colorScheme: "inherit",
    promoVariant: "soft",
    ctaLabel: "Learn More",
    ctaUrl: "/",
    visible: true,
  };
}

function contentSection(
  id: string,
  title: string,
  columns: number,
  background = "#ffffff",
): BuilderSection {
  return {
    id,
    kind: "contentLayout",
    title,
    eyebrow: "Details",
    body: "Replace this content with your own copy, images, and calls to action.",
    background,
    backgroundMode: "boxed",
    contentMode: "boxed",
    colorScheme: "inherit",
    layout: columns === 1 ? "whole" : columns === 2 ? "halves" : "thirds",
    layoutColumns: columns,
    layoutRows: 1,
    layoutItems: Array.from({ length: columns }, (_, index) => ({
      id: `${id}-column-${index + 1}`,
      blocks: [
        {
          id: `${id}-heading-${index + 1}`,
          kind: "heading",
          eyebrow: index === 0 ? "01" : index === 1 ? "02" : "03",
          title:
            index === 0
              ? "Clear message"
              : index === 1
                ? "Strong visual rhythm"
                : "Built to convert",
          body: "Use this block to explain a service, feature, process step, or offer.",
          buttonLabel: index === 0 ? "Edit Content" : "",
          buttonUrl: "/",
        },
      ],
    })),
    visible: true,
  };
}

function shopArchiveSection(id: string, title: string): BuilderSection {
  return {
    id,
    kind: "productArchive",
    title,
    background: "#ffffff",
    backgroundMode: "boxed",
    contentMode: "full",
    colorScheme: "inherit",
    columns: 4,
    filterPosition: "top",
    cardStyle: "flat",
    cardPreset: "princity-flat",
    gridGap: "large",
    cardPadding: "medium",
    imagePadding: "medium",
    source: "all",
    gridLimit: 8,
    layoutVariant: "grid",
    pagination: {
      enabled: false,
      perPage: 12,
      mode: "pageNumbers",
      infiniteScroll: false,
    },
    visible: true,
  };
}

export const pageTemplateLibrary: PageTemplateLibraryItem[] = [
  {
    id: "blank-page",
    category: "blank",
    name: "Blank Page",
    description: "A clean empty page with one editable content section.",
    previewImage: previewSvg("Blank", "#a4be7b", "#ffffff"),
    design: defaultDesign,
    sections: [contentSection("template-blank-content", "Start Here", 1)],
  },
  {
    id: "launch-landing",
    category: "landing",
    name: "Launch Landing",
    description: "Premium hero, benefits, and conversion-ready sections.",
    previewImage: previewSvg("Launch", "#0d73ff", "#ffffff"),
    design: { ...defaultDesign, accentColor: "#0d73ff" },
    sections: [
      heroSection(
        "template-launch-hero",
        "Launch your next offer with confidence",
        "New release",
        "A polished landing page for products, services, campaigns, and waitlists.",
        "#eef5ff",
      ),
      contentSection("template-launch-benefits", "Why customers choose it", 3),
      promoSection("template-launch-cta", "Ready to make the page yours?", "Swap the copy, connect your forms, and publish.", "#eef5e8"),
    ],
  },
  {
    id: "business-studio",
    category: "business",
    name: "Business Studio",
    description: "A calm service-business page with proof and process sections.",
    previewImage: previewSvg("Studio", "#a4be7b", "#ffffff"),
    design: defaultDesign,
    sections: [
      heroSection("template-business-hero", "Strategy, design, and delivery", "Studio", "Present your company, services, and client outcomes in one elegant page.", "#f7f7f4", "Book a Call"),
      contentSection("template-business-services", "Services", 3),
      contentSection("template-business-process", "How we work", 2, "#f0ece5"),
    ],
  },
  {
    id: "shop-drop",
    category: "shop",
    name: "Collection Drop",
    description: "Commerce-ready page with campaign hero and product grid.",
    previewImage: previewSvg("Shop", "#111111", "#ffffff"),
    design: defaultDesign,
    sections: [
      heroSection("template-shop-hero", "The new collection is here", "Limited drop", "Showcase featured products with an editorial storefront layout.", "#f7f7f4", "Shop Now"),
      shopArchiveSection("template-shop-products", "Featured Products"),
      promoSection("template-shop-promo", "Free delivery on curated orders", "Edit this promo for seasonal offers or shipping messages.", "#eef5e8"),
    ],
  },
  {
    id: "contact-simple",
    category: "contact",
    name: "Contact Page",
    description: "Clear contact layout with intro, form embed area, and details.",
    previewImage: previewSvg("Contact", "#6f8cff", "#ffffff"),
    design: { ...defaultDesign, accentColor: "#6f8cff" },
    sections: [
      heroSection("template-contact-hero", "Let’s talk about your project", "Contact", "Give visitors a direct path to reach your team.", "#f5f5ff", "Send Message"),
      contentSection("template-contact-details", "Contact Details", 2),
      {
        ...contentSection("template-contact-form", "Inquiry Form", 1, "#ffffff"),
        layoutItems: [
          {
            id: "template-contact-form-column",
            blocks: [
              {
                id: "template-contact-form-embed",
                kind: "embed",
                title: "Form Embed",
                body: "Paste your form embed or connect Fluent Forms here.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "about-company",
    category: "about",
    name: "About Company",
    description: "Story, values, and team-friendly content sections.",
    previewImage: previewSvg("About", "#9b5c3d", "#f0ece5"),
    design: designPresets.editorial,
    sections: [
      heroSection("template-about-hero", "A focused team building useful things", "About us", "Tell the story behind your company with room for values and milestones.", "#f0ece5", "Our Work"),
      contentSection("template-about-values", "Values", 3),
      promoSection("template-about-proof", "Trusted by ambitious teams", "Add awards, client logos, or proof points here.", "#ffffff"),
    ],
  },
  {
    id: "portfolio-showcase",
    category: "portfolio",
    name: "Portfolio Showcase",
    description: "Visual case-study page for work, projects, or creative services.",
    previewImage: previewSvg("Work", "#d7ff63", "#24241f", true),
    design: designPresets.contrast,
    sections: [
      heroSection("template-portfolio-hero", "Selected work with measurable impact", "Portfolio", "A dramatic page for presenting case studies and project outcomes.", "#111111", "View Work"),
      contentSection("template-portfolio-grid", "Case Studies", 3, "#24241f"),
      promoSection("template-portfolio-cta", "Have a project in mind?", "Invite visitors to start a conversation.", "#1a1a16"),
    ],
  },
  {
    id: "wireframe-saas",
    category: "wireframes",
    name: "SaaS Wireframe",
    description: "Fast structural starter for SaaS or product pages.",
    previewImage: previewSvg("Wireframe", "#bfc8d8", "#ffffff"),
    design: defaultDesign,
    sections: [
      heroSection("template-wireframe-hero", "Hero headline placeholder", "Wireframe", "Replace each section with final messaging and visuals.", "#f7f7f4", "Primary CTA"),
      contentSection("template-wireframe-features", "Feature Grid", 3),
      contentSection("template-wireframe-pricing", "Offer Blocks", 2, "#f5f5f3"),
      promoSection("template-wireframe-final-cta", "Final CTA", "End the page with one clear action.", "#ffffff"),
    ],
  },
];
