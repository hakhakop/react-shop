import type { BuilderLayout, BuilderLayoutKey } from "@/lib/builderLayouts";
import type { BuilderShellSettings } from "@/lib/builderShell";

export type StarterWebsiteId =
  | "modern-business"
  | "creative-agency"
  | "local-services"
  | "blank";

export type StarterWebsiteData = {
  layouts: Partial<Record<BuilderLayoutKey, BuilderLayout>>;
  pages: Array<{ key: `page:${string}`; title: string; slug: string; updatedAt: string }>;
  shell: BuilderShellSettings;
};

export type StarterWebsiteDefinition = {
  id: StarterWebsiteId;
  name: string;
  description: string;
  preview: { tone: "sage" | "violet" | "clay" | "blank"; rows: readonly number[] };
  create: (context: { websiteName: string; now: string }) => StarterWebsiteData;
};

type StarterTheme = {
  page: string;
  text: string;
  muted: string;
  accent: string;
  surface: string;
  dark: string;
  radius: string;
};

const themes = {
  business: { page: "#f7f7f3", text: "#17211d", muted: "#66716c", accent: "#2f6657", surface: "#e9eee9", dark: "#17211d", radius: "14px" },
  agency: { page: "#f8f6fc", text: "#211b2d", muted: "#70687d", accent: "#6b4bc3", surface: "#eee9f7", dark: "#211b2d", radius: "18px" },
  local: { page: "#fbf8f3", text: "#2b211b", muted: "#766960", accent: "#b45d3d", surface: "#f2e7dc", dark: "#2b211b", radius: "12px" },
} satisfies Record<string, StarterTheme>;

const textBlock = (id: string, title: string, body: string, eyebrow?: string) => ({
  id, kind: "text", eyebrow, title, body,
  typography: {
    title: { fontFamily: "inherit", fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: "700", lineHeight: "1.08", letterSpacing: "-0.02em", color: "inherit", textAlign: "left" },
    body: { fontFamily: "inherit", fontSize: "16px", fontWeight: "400", lineHeight: "1.65", letterSpacing: "0", color: "inherit", textAlign: "left" },
    eyebrow: { fontFamily: "inherit", fontSize: "12px", fontWeight: "700", lineHeight: "1.2", letterSpacing: "0.08em", color: "inherit", textAlign: "left", textTransform: "uppercase" },
  },
});

const section = (input: {
  id: string; title: string; eyebrow?: string; body?: string; background: string;
  layout?: "whole" | "halves" | "thirds"; blocks: Array<Array<Record<string, unknown>>>;
  colorScheme?: "inherit" | "dark"; spacing?: "medium" | "large";
}) => {
  const layout = input.layout ?? "whole";
  const columns = layout === "whole" ? 1 : layout === "halves" ? 2 : 3;
  const rowId = `${input.id}-row`;
  return {
    id: input.id, kind: "contentLayout", title: input.title,
    background: input.background, backgroundMode: "full", contentMode: "boxed",
    colorScheme: input.colorScheme ?? "inherit", topSpacing: input.spacing ?? "large", bottomSpacing: input.spacing ?? "large",
    layout, layoutColumns: columns,
    layoutItems: input.blocks.map((blocks, index) => ({ id: `${input.id}-column-${index + 1}`, rowId, rowLayout: layout, blocks })),
    visible: true,
  };
};

const gridBlock = (id: string, title: string, items: Array<{ id: string; eyebrow?: string; title: string; text: string; meta?: string; buttonLabel?: string; buttonUrl?: string }>, columns = 3) => ({
  id, kind: "grid", title, gridSource: "static", columns, gridRows: Math.ceil(items.length / columns),
  gridGap: "medium", gridContentPadding: "large", gridShowImage: false, gridShowEyebrow: true,
  gridShowMeta: items.some((item) => item.meta), gridShowText: true,
  gridShowButton: items.some((item) => item.buttonLabel),
  gridItems: items.map((item) => ({ ...item, buttonStyle: "link" })),
  typography: {
    title: { fontFamily: "inherit", fontSize: "22px", fontWeight: "700", lineHeight: "1.15", letterSpacing: "-0.01em", color: "inherit", textAlign: "left" },
    body: { fontFamily: "inherit", fontSize: "15px", fontWeight: "400", lineHeight: "1.6", letterSpacing: "0", color: "inherit", textAlign: "left" },
    eyebrow: { fontFamily: "inherit", fontSize: "12px", fontWeight: "700", lineHeight: "1.2", letterSpacing: "0.08em", color: "inherit", textAlign: "left", textTransform: "uppercase" },
    button: { fontFamily: "inherit", fontSize: "14px", fontWeight: "700", lineHeight: "1", letterSpacing: "0", textAlign: "left" },
  },
});

const heroBlock = (id: string, eyebrow: string, title: string, body: string, primary: string, secondary: string, secondaryUrl: string) => ({
  id, kind: "hero", eyebrow, title, body, buttonLabel: primary, buttonUrl: "#contact", buttonStyle: "primary",
  buttons: [{ id: `${id}-secondary`, label: secondary, url: secondaryUrl, target: "_self", style: "outline" }],
  buttonsLayout: "inline", buttonGap: "0.75rem", elementAlign: "left", elementPadding: "lg", carouselSettings: { variant: "default" },
  typography: {
    title: { fontFamily: "inherit", fontSize: "clamp(42px, 6vw, 84px)", fontWeight: "720", lineHeight: "1.02", letterSpacing: "-0.035em", color: "inherit", textAlign: "left" },
    body: { fontFamily: "inherit", fontSize: "18px", fontWeight: "400", lineHeight: "1.65", letterSpacing: "0", color: "inherit", textAlign: "left" },
    eyebrow: { fontFamily: "inherit", fontSize: "12px", fontWeight: "700", lineHeight: "1.2", letterSpacing: "0.1em", color: "inherit", textAlign: "left", textTransform: "uppercase" },
    button: { fontFamily: "inherit", fontSize: "14px", fontWeight: "700", lineHeight: "1", letterSpacing: "0", textAlign: "left" },
  },
});

const makeHeader = (websiteName: string, now: string, theme: StarterTheme, cta: string): BuilderLayout => ({
  version: 1, key: "header", page: "header", targetType: "header", updatedAt: now, design: {},
  sections: [{ ...section({ id: "header-document", title: "Header", background: "#ffffff", spacing: "medium", layout: "thirds", blocks: [
    [{ id: "header-logo", kind: "image", headerBrandMode: "brand", headerBrandText: websiteName, imageAlt: `${websiteName} logo`, imageMaxWidth: 180 }],
    [{ id: "header-navigation", kind: "menu", title: "Navigation", menuSource: "main", menuActiveIndicator: "underline" }],
    [{ id: "header-button", kind: "button", buttonLabel: cta, buttonUrl: "#contact", buttonStyle: "primary" }],
  ] }), headerUtilityMigrationVersion: 3 }],
});

const makeFooter = (websiteName: string, now: string, theme: StarterTheme): BuilderLayout => ({
  version: 1, key: "footer", page: "footer", targetType: "footer", updatedAt: now, design: {},
  sections: [section({ id: "footer-document", title: "Footer", background: theme.dark, colorScheme: "dark", spacing: "medium", layout: "thirds", blocks: [
    [textBlock("footer-about", websiteName, "A concise closing statement that reinforces what you offer and who you help.")],
    [{ id: "footer-links", kind: "list", title: "Explore", items: ["About", "Services", "Testimonials", "Contact"], listIcon: "arrowRight" }],
    [textBlock("footer-contact", "Start a conversation", "hello@example.com\n+1 000 000 0000", "Contact")],
  ] })],
});

const makeShell = (websiteName: string, now: string, theme: StarterTheme, cta: string): BuilderShellSettings => ({
  headerVisible: true, topToolbarVisible: false, topToolbarText: "", topToolbarPhone: "", topToolbarMeta: "",
  headerBackgroundMode: "default", headerTextMode: "auto", headerLayout: "simple", headerBrandMode: "brand", headerBrandText: websiteName,
  headerLogoUrl: null, headerLogoAlt: `${websiteName} logo`, headerLogoMaxWidth: 180, headerButtonLabel: cta, headerButtonUrl: "#contact",
  headerIconVariant: "muted", headerIconOrder: ["theme", "search"], headerActiveIndicator: "underline", headerBehavior: "sticky",
  headerTransparent: false, headerOverlay: false, headerWidthMode: "boxed", headerZIndex: 40,
  sectionPaddingTop: "lg", sectionPaddingBottom: "lg", sectionMarginTop: "none", sectionMarginBottom: "none",
  rowPaddingTop: "md", rowPaddingBottom: "md", rowMarginTop: "none", rowMarginBottom: "none", rowGap: "lg", columnGap: "md",
  elementPaddingTop: "sm", elementPaddingRight: "sm", elementPaddingBottom: "sm", elementPaddingLeft: "sm",
  elementMarginTop: "none", elementMarginRight: "none", elementMarginBottom: "none", elementMarginLeft: "none",
  menuPresentation: {}, storefrontPreset: "princity", primaryColor: theme.text, accentColor: theme.accent,
  productCardRadius: theme.radius, productCardBg: "#ffffff", productCardShadow: "0 10px 30px rgba(20,20,20,0.05)", productCardShadowHover: "0 16px 38px rgba(20,20,20,0.09)",
  productCardMinHeight: "0px", productCardMaxWidth: "100%", productImageWidth: "100%", productImageHeight: "280px", productImageMaxWidth: "100%", productImageMaxHeight: "100%", productImageAspectRatio: "4 / 5", productImageNoPadding: false, productImagePadding: "clamp(18px, 2vw, 32px)", productImageObjectFit: "contain",
  buttonBg: "", buttonTextColor: "", buttonBorderRadius: "8px", buttonBorderWidth: "0px", buttonBorderColor: "transparent", buttonPaddingY: "12px", buttonPaddingX: "20px", buttonFontWeight: "700", buttonLetterSpacing: "0px", buttonHoverBg: "", buttonHoverTextColor: "", buttonHoverBorderColor: "transparent", buttonHoverEffect: "lift",
  menuItems: [
    { id: "starter-home", label: "Home", url: "/", parentId: null },
    { id: "starter-about", label: "About", url: "/#about", parentId: null },
    { id: "starter-services", label: "Services", url: "/#services", parentId: null },
    { id: "starter-contact", label: "Contact", url: "/#contact", parentId: null },
  ], updatedAt: now,
});

const makeData = (websiteName: string, now: string, theme: StarterTheme, sections: BuilderLayout["sections"], cta: string): StarterWebsiteData => ({
  layouts: {
    home: { version: 1, key: "home", page: "home", targetType: "page", updatedAt: now, design: {
      preset: "princity", colorScheme: "auto", pageBackground: theme.page, textColor: theme.text, mutedTextColor: theme.muted,
      accentColor: theme.accent, surfaceColor: theme.surface, buttonBackground: theme.text, buttonTextColor: "#ffffff", radius: theme.radius,
      sectionMaxWidth: "1280px", sectionGutter: "clamp(20px, 4vw, 64px)", headingFontFamily: "inherit", headingSize: "clamp(42px, 6vw, 84px)", headingWeight: "720", headingLineHeight: "1.02",
      cardBg: "#ffffff", cardRadius: theme.radius, cardBorder: "rgba(20,20,20,0.09)", cardShadow: "0 10px 30px rgba(20,20,20,0.05)", cardShadowHover: "0 16px 38px rgba(20,20,20,0.09)",
    }, sections },
    header: makeHeader(websiteName, now, theme, cta), footer: makeFooter(websiteName, now, theme),
  }, pages: [], shell: makeShell(websiteName, now, theme, cta),
});

const modernBusiness: StarterWebsiteDefinition = {
  id: "modern-business", name: "Modern Business", description: "A polished company site with services, proof, testimonials, and a clear contact path.", preview: { tone: "sage", rows: [86, 52, 74, 62] },
  create: ({ websiteName, now }) => { const t = themes.business; return makeData(websiteName, now, t, [
    section({ id: "hero", title: "Hero", background: t.page, blocks: [[heroBlock("business-hero", "A clear foundation for growth", "Build trust from the first impression", "Introduce your company with a focused promise, useful context, and a simple path for visitors to take the next step.", "Get Started", "Explore Services", "#services")]] }),
    section({ id: "trust", title: "Trust and Key Benefits", eyebrow: "At a glance", body: "A compact proof strip helps visitors understand your strongest practical advantages.", background: t.surface, spacing: "medium", blocks: [[gridBlock("trust-grid", "Why clients choose this approach", [{ id: "trust-1", eyebrow: "01", title: "Clear communication", text: "Set expectations early and keep every step easy to understand." }, { id: "trust-2", eyebrow: "02", title: "Thoughtful delivery", text: "Balance quality, pace, and attention to the details that matter." }, { id: "trust-3", eyebrow: "03", title: "Built to adapt", text: "Create a foundation that can evolve as priorities change." }])]] }),
    section({ id: "about", title: "About Company", background: "#ffffff", layout: "halves", blocks: [[textBlock("about-copy", "Explain the company in a human, confident way", "Use two short paragraphs to introduce your experience, point of view, and the kind of customer you serve. This is enough detail to build credibility without slowing the page down.", "About the company")], [{ id: "about-highlights", kind: "list", title: "Useful supporting highlights", items: ["A focused company introduction", "A meaningful point of difference", "Two or three proof points"], listIcon: "circleCheck", elementPadding: "lg" }]] }),
    section({ id: "services", title: "Services", eyebrow: "What we do", body: "Group your core offers into three easy-to-scan cards with benefit-focused descriptions.", background: t.page, blocks: [[gridBlock("services-grid", "Services designed around real priorities", [{ id: "service-1", eyebrow: "01", title: "Strategy and planning", text: "Turn an initial idea into a clear, practical direction.", buttonLabel: "View Details", buttonUrl: "#contact" }, { id: "service-2", eyebrow: "02", title: "Implementation", text: "Bring the plan to life through a focused and collaborative process.", buttonLabel: "View Details", buttonUrl: "#contact" }, { id: "service-3", eyebrow: "03", title: "Ongoing support", text: "Keep improving after launch with dependable guidance.", buttonLabel: "View Details", buttonUrl: "#contact" }])]] }),
    section({ id: "why-us", title: "Why Choose Us", background: t.surface, layout: "halves", blocks: [[textBlock("why-copy", "Make the decision easier", "Use this section to connect your working style to outcomes customers care about: clarity, reliability, and a result that supports what comes next.", "Why choose us")], [{ id: "why-list", kind: "list", title: "A dependable way of working", items: ["Practical recommendations", "Transparent collaboration", "A flexible long-term foundation"], listIcon: "circleCheck", elementPadding: "lg" }]] }),
    section({ id: "testimonials", title: "Testimonials", eyebrow: "Client perspective", body: "Short, specific feedback builds trust without overwhelming the page.", background: "#ffffff", blocks: [[gridBlock("testimonial-grid", "What a strong experience feels like", [{ id: "quote-1", eyebrow: "“", title: "Clear from the first conversation", text: "The process stayed focused, and we always understood the next step.", meta: "Alex Morgan · Project Lead" }, { id: "quote-2", eyebrow: "“", title: "A result we can build on", text: "We now have a stronger structure and a much clearer direction.", meta: "Jordan Lee · Business Owner" }, { id: "quote-3", eyebrow: "“", title: "Thoughtful and practical", text: "Every recommendation was useful, realistic, and easy to act on.", meta: "Taylor Reed · Operations Manager" }])]] }),
    section({ id: "cta", title: "Call to Action", background: t.accent, colorScheme: "dark", spacing: "medium", blocks: [[{ id: "business-cta", kind: "promoStrip", eyebrow: "Ready when you are", title: "Start with a focused conversation", body: "Share what you are working toward and discover a practical next step.", buttonLabel: "Contact Us", buttonUrl: "#contact", buttonStyle: "light", elementPadding: "md" }]] }),
    section({ id: "contact", title: "Contact", background: t.page, layout: "halves", blocks: [[textBlock("contact-copy", "Make it easy to get in touch", "Set expectations for the first conversation and tell visitors what information will help you respond well.", "Contact")], [{ id: "contact-panel", kind: "panel", eyebrow: "Start a conversation", title: "Tell us what you are planning", body: "Share your goal, preferred timeline, and the best way to reach you.", buttonLabel: "Book a Consultation", buttonUrl: "mailto:hello@example.com", buttonStyle: "primary", elementPadding: "lg" }]] }),
  ], "Contact Us"); },
};

const creativeAgency: StarterWebsiteDefinition = {
  id: "creative-agency", name: "Creative Agency", description: "An expressive portfolio-led structure for studios, teams, and creative practices.", preview: { tone: "violet", rows: [92, 78, 58, 70] },
  create: ({ websiteName, now }) => { const t = themes.agency; return makeData(websiteName, now, t, [
    section({ id: "hero", title: "Hero", background: t.page, blocks: [[heroBlock("agency-hero", "Independent thinking. Useful outcomes.", "Ideas shaped into work people remember", "Use this space to express the studio’s point of view, the problems you enjoy solving, and the kind of work you want to create next.", "Start a Project", "See Our Work", "#work")]] }),
    section({ id: "work", title: "Selected Work", eyebrow: "Selected work", body: "Lead with a small, edited set of projects. Each card should explain the challenge, contribution, and result.", background: t.dark, colorScheme: "dark", blocks: [[gridBlock("work-grid", "A focused portfolio creates a stronger impression", [{ id: "work-1", eyebrow: "Identity", title: "A clearer brand for a growing team", text: "Strategy, visual direction, and a flexible identity system.", buttonLabel: "View Project", buttonUrl: "#contact" }, { id: "work-2", eyebrow: "Digital", title: "A simpler path through a complex offer", text: "Content structure and a digital experience designed around decisions.", buttonLabel: "View Project", buttonUrl: "#contact" }, { id: "work-3", eyebrow: "Campaign", title: "A launch designed to earn attention", text: "A concise campaign system built for multiple channels.", buttonLabel: "View Project", buttonUrl: "#contact" }])]] }),
    section({ id: "services", title: "Services", eyebrow: "Capabilities", body: "Describe complementary services without turning the page into a long catalogue.", background: t.surface, blocks: [[gridBlock("agency-services", "From first idea to finished experience", [{ id: "as-1", eyebrow: "01", title: "Brand direction", text: "Positioning, messaging, and visual systems that create clarity." }, { id: "as-2", eyebrow: "02", title: "Digital experiences", text: "Useful websites and interfaces built around real audience needs." }, { id: "as-3", eyebrow: "03", title: "Campaigns and content", text: "Flexible creative systems that keep communication consistent." }])]] }),
    section({ id: "about", title: "About the Studio", background: "#ffffff", layout: "halves", blocks: [[textBlock("studio-copy", "Small enough to stay close to the work", "Introduce the studio’s approach, the people behind it, and how collaboration works. Keep the copy personal and specific rather than sounding like a corporate biography.", "About the studio")], [{ id: "studio-list", kind: "list", title: "What clients can expect", items: ["Direct collaboration", "Senior creative attention", "A process shaped around the project"], listIcon: "circleCheck", elementPadding: "lg" }]] }),
    section({ id: "process", title: "Process", eyebrow: "How we work", body: "A simple process reduces uncertainty and makes starting feel easier.", background: t.page, blocks: [[gridBlock("process-grid", "A practical creative process", [{ id: "process-1", eyebrow: "01", title: "Discover", text: "Align on context, audience, and the opportunity worth pursuing." }, { id: "process-2", eyebrow: "02", title: "Shape", text: "Explore directions, test ideas, and build a coherent system." }, { id: "process-3", eyebrow: "03", title: "Deliver", text: "Refine the work and prepare everything for confident use." }])]] }),
    section({ id: "testimonials", title: "Testimonials", background: t.surface, blocks: [[gridBlock("agency-quotes", "Creative partnership, clearly described", [{ id: "aq-1", eyebrow: "“", title: "They understood the real challenge", text: "The team asked better questions and turned complexity into a clear direction.", meta: "Morgan Hale · Founder" }, { id: "aq-2", eyebrow: "“", title: "The work feels distinctly ours", text: "We gained a stronger identity without losing what made the company personal.", meta: "Sam Ellis · Marketing Lead" }, { id: "aq-3", eyebrow: "“", title: "A genuinely collaborative process", text: "Ideas were shared openly, decisions were clear, and the final system is easy to use.", meta: "Riley Chen · Product Director" }])]] }),
    section({ id: "cta", title: "Call to Action", background: t.accent, colorScheme: "dark", spacing: "medium", blocks: [[{ id: "agency-cta", kind: "promoStrip", eyebrow: "Have a project in mind?", title: "Let’s make the next idea useful and memorable", body: "Tell us where you are now and what you want the work to make possible.", buttonLabel: "Start a Project", buttonUrl: "#contact", buttonStyle: "light", elementPadding: "md" }]] }),
    section({ id: "contact", title: "Contact", background: t.page, layout: "halves", blocks: [[textBlock("agency-contact", "Begin with the essentials", "A short note about the project, timing, and ambition is enough to start a useful conversation.", "Contact")], [{ id: "agency-contact-panel", kind: "panel", eyebrow: "New projects", title: "What would you like to create?", body: "Introduce the opportunity and we will reply with a clear next step.", buttonLabel: "Start a Conversation", buttonUrl: "mailto:hello@example.com", buttonStyle: "primary", elementPadding: "lg" }]] }),
  ], "Start a Project"); },
};

const localServices: StarterWebsiteDefinition = {
  id: "local-services", name: "Local Services", description: "A practical lead-focused site for trusted services in a defined local area.", preview: { tone: "clay", rows: [80, 60, 66, 54] },
  create: ({ websiteName, now }) => { const t = themes.local; return makeData(websiteName, now, t, [
    section({ id: "hero", title: "Hero", background: t.page, blocks: [[heroBlock("local-hero", "Reliable help, close to home", "A dependable local service when you need it", "State what you do, where you work, and how quickly a customer can expect a response. Keep the first action direct and reassuring.", "Request a Quote", "View Services", "#services")]] }),
    section({ id: "services", title: "Service Categories", eyebrow: "Services", body: "Help visitors recognize the right service quickly with clear categories and plain-language descriptions.", background: "#ffffff", blocks: [[gridBlock("local-services-grid", "Practical support for common needs", [{ id: "ls-1", eyebrow: "01", title: "Scheduled service", text: "Plan routine work at a time that fits your day.", buttonLabel: "View Details", buttonUrl: "#contact" }, { id: "ls-2", eyebrow: "02", title: "Repairs and solutions", text: "Get a clear assessment and a practical route forward.", buttonLabel: "View Details", buttonUrl: "#contact" }, { id: "ls-3", eyebrow: "03", title: "Ongoing care", text: "Prevent recurring problems with dependable maintenance.", buttonLabel: "View Details", buttonUrl: "#contact" }])]] }),
    section({ id: "about", title: "About the Company", background: t.surface, layout: "halves", blocks: [[textBlock("local-about", "Local knowledge and straightforward service", "Explain how long you have served the area, what customers value about the experience, and the standards that guide every visit. Keep it warm, useful, and easy to verify.", "About the company")], [{ id: "local-about-list", kind: "list", title: "What customers can expect", items: ["Clear arrival windows", "Upfront recommendations", "Respectful, tidy work"], listIcon: "circleCheck", elementPadding: "lg" }]] }),
    section({ id: "benefits", title: "Benefits and Trust Signals", background: t.dark, colorScheme: "dark", spacing: "medium", blocks: [[gridBlock("benefit-grid", "Confidence before the appointment", [{ id: "benefit-1", eyebrow: "Local", title: "A team that knows the area", text: "Show the towns, neighborhoods, or region you serve." }, { id: "benefit-2", eyebrow: "Clear", title: "Simple communication", text: "Explain what happens next and keep customers informed." }, { id: "benefit-3", eyebrow: "Reliable", title: "Work completed with care", text: "Set realistic expectations and follow through consistently." }])]] }),
    section({ id: "process", title: "Service Area and Process", background: t.page, blocks: [[gridBlock("local-process", "From first message to finished service", [{ id: "lp-1", eyebrow: "01", title: "Tell us what you need", text: "Share the location, timing, and a short description of the issue." }, { id: "lp-2", eyebrow: "02", title: "Receive a clear next step", text: "We confirm availability and explain what to expect." }, { id: "lp-3", eyebrow: "03", title: "Get the work completed", text: "The service is delivered carefully and reviewed with you." }])]] }),
    section({ id: "testimonials", title: "Testimonials", background: "#ffffff", blocks: [[gridBlock("local-quotes", "Trust built through everyday service", [{ id: "lq-1", eyebrow: "“", title: "Prompt, clear, and easy to work with", text: "We knew when to expect the visit and everything was explained before work began.", meta: "Jamie P. · Local customer" }, { id: "lq-2", eyebrow: "“", title: "A straightforward experience", text: "The recommendation was practical and the work was completed with care.", meta: "Casey R. · Homeowner" }, { id: "lq-3", eyebrow: "“", title: "The team followed through", text: "Communication was reliable from the first call to the final check.", meta: "Avery D. · Property manager" }])]] }),
    section({ id: "faq", title: "FAQ", eyebrow: "Common questions", body: "Answer practical questions customers ask before booking.", background: t.surface, blocks: [[gridBlock("local-faq", "Helpful details before you book", [{ id: "lf-1", title: "Which areas do you serve?", text: "List your core service area and explain whether nearby locations are available by request." }, { id: "lf-2", title: "How soon can I schedule?", text: "Give a realistic response window and explain how urgent requests are handled." }, { id: "lf-3", title: "What should I prepare?", text: "Ask for the location, a short description, and any useful photos before the visit." }, { id: "lf-4", title: "How is pricing confirmed?", text: "Explain when customers receive an estimate and what could affect the final scope." }], 2)]] }),
    section({ id: "contact", title: "Contact", background: t.page, layout: "halves", blocks: [[textBlock("local-contact", "Request service with confidence", "Tell visitors when you answer enquiries, which locations you cover, and what information helps you respond faster.", "Contact")], [{ id: "local-contact-panel", kind: "panel", eyebrow: "Request a quote", title: "Tell us how we can help", body: "Share the service, location, and preferred timing. We will reply with availability and a clear next step.", buttonLabel: "Request a Quote", buttonUrl: "mailto:hello@example.com", buttonStyle: "primary", elementPadding: "lg" }]] }),
  ], "Request a Quote"); },
};

const blankWebsite: StarterWebsiteDefinition = {
  id: "blank", name: "Blank Website", description: "A clean Home, Header, and Footer document ready to build completely from scratch.", preview: { tone: "blank", rows: [22] },
  create: ({ websiteName, now }) => {
    const t = themes.business;
    return { layouts: {
      home: { version: 1, key: "home", page: "home", targetType: "page", updatedAt: now, design: {}, sections: [] },
      header: { version: 1, key: "header", page: "header", targetType: "header", updatedAt: now, design: {}, sections: [] },
      footer: { version: 1, key: "footer", page: "footer", targetType: "footer", updatedAt: now, design: {}, sections: [] },
    }, pages: [], shell: makeShell(websiteName, now, t, "Contact Us") };
  },
};

export const starterWebsiteLibrary: readonly StarterWebsiteDefinition[] = [modernBusiness, creativeAgency, localServices, blankWebsite];
export const defaultStarterWebsiteId: StarterWebsiteId = "modern-business";

export function isStarterWebsiteId(value: unknown): value is StarterWebsiteId {
  return typeof value === "string" && starterWebsiteLibrary.some((starter) => starter.id === value);
}

export function getStarterWebsite(id: StarterWebsiteId = defaultStarterWebsiteId) {
  return starterWebsiteLibrary.find((starter) => starter.id === id) ?? modernBusiness;
}

export function createStarterWebsiteData(input: { starterId?: StarterWebsiteId; websiteName: string; now?: string }) {
  return getStarterWebsite(input.starterId).create({ websiteName: input.websiteName.trim() || "Your Website", now: input.now ?? new Date().toISOString() });
}
