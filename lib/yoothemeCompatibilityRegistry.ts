
/**
 * Durable Phase 12 source of truth for synchronized YOOtheme fixtures and
 * field-level compatibility semantics. It deliberately does not participate
 * in importing or rendering yet: Batch 2 will make import reporting consume
 * these records.
 */

export const YOOTHEME_COMPATIBILITY_REGISTRY_SCHEMA_VERSION = 1 as const;

export type YoothemeCapabilityStatus =
  | "SUPPORTED"
  | "DEFERRED"
  | "INTENTIONALLY_UNSUPPORTED"
  | "UNHANDLED"
  | "BLOCKED";

export type YoothemeFixtureAcceptanceStatus = "VERIFIED" | "PARTIAL" | "BLOCKED";

export type YoothemeFixtureContractReference = {
  /** Repository-relative executable contract or focused acceptance artifact. */
  path: string;
  capabilityKeys: readonly string[];
};

export type YoothemeFixtureAcceptanceScope = {
  websiteId: string;
  pageKey: string;
};

export type YoothemeFixtureStatusCounts = Readonly<Record<YoothemeCapabilityStatus, number>>;

/** Strict release baseline. Source/viewport/contracts remain owned by its fixture record. */
export type YoothemeFixtureStrictBaseline = {
  expectedPageReportStatusCounts: YoothemeFixtureStatusCounts;
  requireBuilderStorefrontParity: true;
  requirePersistedRestoration: true;
};

export type YoothemeFixtureRecord = {
  id: string;
  name: string;
  sourcePath: string;
  sourceSha256: string;
  acceptanceScope: YoothemeFixtureAcceptanceScope | null;
  runtimeRequirements: readonly ("accordion" | "grid" | "lightbox")[];
  strictBaseline: YoothemeFixtureStrictBaseline | null;
  yoothemeVersion: string | null;
  uikitVersion: string | null;
  themeStyle: string | null;
  referenceViewports: readonly { width: number; height: number }[];
  capabilityFamilies: readonly string[];
  contracts: readonly YoothemeFixtureContractReference[];
  acceptanceStatus: YoothemeFixtureAcceptanceStatus;
  lastVerifiedAt: string | null;
  lastVerifiedVersion: string | null;
  notes: string | null;
};

export type YoothemeSemanticCapabilityRecord = {
  /** Stable field-level key: `${sourceType}.${sourceField}`. */
  key: string;
  sourceType: string;
  sourceField: string;
  semanticMeaning: string;
  capabilityFamily: string;
  canonicalOwner: string | null;
  normalizer: string | null;
  persistedDestination: string | null;
  inspectorLocation: string | null;
  runtimeConsumer: string | null;
  status: YoothemeCapabilityStatus;
  statusReason: string;
  futureOwnerOrPhase: string | null;
  fixtureIds: readonly string[];
};

export type YoothemeCompatibilityRegistry = {
  schemaVersion: typeof YOOTHEME_COMPATIBILITY_REGISTRY_SCHEMA_VERSION;
  fixtures: readonly YoothemeFixtureRecord[];
  capabilities: readonly YoothemeSemanticCapabilityRecord[];
};

/**
 * Evidence is deliberately independent from the five product statuses.
 * `SUPPORTED` continues to mean that a canonical import/persist/runtime path
 * exists. Only `fixtureAccepted` permits that path to be advertised as
 * fidelity-proven support.
 */
export type YoothemeCapabilityEvidence = {
  mappedRuntimePath: boolean;
  fixtureAccepted: boolean;
  acceptanceContractPaths: readonly string[];
};

const fixture = (
  id: string,
  name: string,
  sourceSha256: string,
  capabilityFamilies: readonly string[],
  contracts: readonly YoothemeFixtureContractReference[],
  acceptanceStatus: YoothemeFixtureAcceptanceStatus,
  notes: string | null = null,
  sourcePath = `tests/fixtures/yootheme-compatibility/sources/${id}.json`,
  acceptanceScope: YoothemeFixtureAcceptanceScope | null = { websiteId: "header-parity-site", pageKey: "home" },
  runtimeRequirements: readonly ("accordion" | "grid" | "lightbox")[] = [],
): YoothemeFixtureRecord => ({
  id,
  name,
  sourcePath,
  sourceSha256,
  acceptanceScope,
  runtimeRequirements,
  strictBaseline: strictBaselineForFixture(id),
  // The accepted exports do not reliably embed Builder/UIkit/theme revision
  // metadata. Keep this explicitly unknown rather than deriving it from the
  // current WebPages dependency.
  yoothemeVersion: null,
  uikitVersion: null,
  themeStyle: null,
  referenceViewports: [{ width: 1704, height: 1242 }],
  capabilityFamilies,
  contracts,
  acceptanceStatus,
  lastVerifiedAt: "2026-08-12",
  lastVerifiedVersion: "Phase 9–11 verified static scope",
  notes,
});

const strictStatusCounts = (
  supported: number,
  deferred: number,
  intentionallyUnsupported = 4,
): YoothemeFixtureStatusCounts => ({
  SUPPORTED: supported,
  DEFERRED: deferred,
  INTENTIONALLY_UNSUPPORTED: intentionallyUnsupported,
  UNHANDLED: 0,
  BLOCKED: 0,
});

function strictBaselineForFixture(id: string): YoothemeFixtureStrictBaseline | null {
  const counts = ({
    enterprise3: strictStatusCounts(277, 55, 3),
    enterprise4: strictStatusCounts(278, 55, 3),
    enterprise5: strictStatusCounts(283, 55, 3),
    enterprise6: strictStatusCounts(312, 65, 3),
    enterprise7: strictStatusCounts(339, 74, 3),
    enterprise8: strictStatusCounts(356, 75, 3),
  } as const)[id];
  return counts
    ? { expectedPageReportStatusCounts: counts, requireBuilderStorefrontParity: true, requirePersistedRestoration: true }
    : null;
}

export const YOOTHEME_FIXTURE_REGISTRY: readonly YoothemeFixtureRecord[] = [
  fixture(
    "devstack-import",
    "DevStack _import.less",
    "989f274e8edb1f081c03d7623d3b236ad18f56e9a670633d49d935252223e0fb",
    ["Global Styles", "YOOtheme LESS"],
    [{ path: "tests/yootheme-importer.test.mjs", capabilityKeys: ["global-styles.breakpoint-small", "global-styles.global-primary-background"] }],
    "VERIFIED",
    "Exact accepted master-devstack _import.less source; style-variant layers are intentionally separate.",
    "tests/fixtures/yootheme-compatibility/sources/devstack-import.less",
    null,
  ),
  fixture(
    "enterprise3",
    "Enterprise 3",
    "7f8ac33b0c20fa1a714ff7c89849855c7a51725c9707984dc2f322401d61aa1d",
    ["Panel Slider", "Slideshow", "Overlay Slider"],
    [
      { path: "tests/fixtures/yootheme-compatibility/panel-slider-divider.enterprise3.contract.json", capabilityKeys: ["panel-slider.slider_divider", "panel-slider.slider_width", "panel-slider.slider_gap", "panel-slider.text_align"] },
      { path: "tests/fixtures/yootheme-compatibility/slideshow-content.enterprise3.contract.json", capabilityKeys: ["slideshow.overlay_position", "slideshow.nav", "slideshow.title_element", "slideshow.title_style"] },
    ],
    "VERIFIED",
    null,
  ),
  fixture(
    "enterprise4",
    "Enterprise 4",
    "9232c14c35780ec2f4269b9a01105556000e670ce752cc3dfbc15b4cf165788f",
    ["Slideshow thumbnail navigation"],
    [{ path: "tests/fixtures/yootheme-compatibility/slideshow-thumbnail.enterprise4.contract.json", capabilityKeys: ["slideshow_item.thumbnail"] }],
    "VERIFIED",
  ),
  fixture(
    "enterprise5",
    "Enterprise 5",
    "49d838645f391387d531859024c582a47dd2c7bc5b1ba5524ddd293ab483a233",
    ["Panel Slider", "Slideshow", "Overlay Slider"],
    [{ path: "docs/yootheme-phase-9-3-panel-slider-contract.md", capabilityKeys: ["panel-slider.image_width", "panel-slider.panel_style", "panel-slider.slidenav"] }],
    "VERIFIED",
  ),
  fixture(
    "enterprise6",
    "Enterprise 6",
    "42e6ff2e0887f236f9989363d45bddb4cc86f26122c553e81402842a5e62965f",
    ["Gallery", "UIkit Grid masonry", "UIkit Lightbox"],
    [{ path: "tests/yootheme-phase11-gallery.spec.ts", capabilityKeys: ["gallery.grid_masonry", "gallery.lightbox", "gallery.overlay_link", "gallery.image_width", "gallery.image_height"] }],
    "VERIFIED",
    null,
    undefined,
    undefined,
    ["grid", "lightbox"],
  ),
  fixture(
    "enterprise7",
    "Enterprise 7",
    "051a5c0744124107642e9df6899cdba3a574240fed0a731dd49660aa0a69d7f1",
    ["Alert", "Icon", "List", "Accordion", "Gallery"],
    [{ path: "tests/yootheme-phase11-simple-elements.spec.ts", capabilityKeys: ["alert.alert_style", "icon.icon_color", "list.list_type"] }],
    "VERIFIED",
    null,
    undefined,
    undefined,
    ["accordion"],
  ),
  fixture(
    "enterprise8",
    "Enterprise 8",
    "a5eb1d55153f954ab067c87b69247b9f9e16ee847aded99a333f2cf00b3c6adb",
    ["Table", "Table media", "Table actions"],
    [
      { path: "tests/yootheme-phase11-accordion-table.spec.ts", capabilityKeys: ["table.show_image", "table.show_link", "table.table_style"] },
      { path: "tests/yootheme-alert-default-surface.spec.ts", capabilityKeys: ["alert.alert_style"] },
    ],
    "VERIFIED",
  ),
];

const supported = (record: Omit<YoothemeSemanticCapabilityRecord, "status" | "futureOwnerOrPhase">): YoothemeSemanticCapabilityRecord => ({
  ...record,
  status: "SUPPORTED",
  futureOwnerOrPhase: null,
});

const YoothemeLessCapabilityRecords: readonly YoothemeSemanticCapabilityRecord[] = Object.entries(YOOTHEME_LESS_CAPABILITIES).map(
  ([sourceField, capability]) => supported({
    key: `global-styles.${sourceField}`,
    sourceType: "global-styles",
    sourceField,
    semanticMeaning: `YOOtheme LESS ${sourceField} global style token`,
    capabilityFamily: "Global Styles",
    canonicalOwner: capability.owner,
    normalizer: "resolveYoothemeLess",
    persistedDestination: capability.owner,
    inspectorLocation: capability.ui,
    runtimeConsumer: "BuilderShellSettings → shared CSS variable renderer",
    statusReason: "Existing LESS capability contract maps and renders this canonical Global Styles token.",
    fixtureIds: ["devstack-import"],
  }),
);

export const YOOTHEME_SEMANTIC_CAPABILITY_REGISTRY: readonly YoothemeSemanticCapabilityRecord[] = [
  ...YoothemeLessCapabilityRecords,
  {
    key: "element.animation",
    sourceType: "element",
    sourceField: "animation",
    semanticMeaning: "Compound UIkit parallax animation with a Y-axis range and easing",
    capabilityFamily: "Animation / Parallax",
    canonicalOwner: "BuilderLayoutBlock.animation.parallaxY / parallaxEasing",
    normalizer: "mapYoothemeStaticContent",
    persistedDestination: "BuilderLayoutBlock.animation",
    inspectorLocation: null,
    runtimeConsumer: "builderAnimationDataAttributes → BuilderScrollAnimations",
    status: "SUPPORTED",
    statusReason: "Shared builder/storefront runtime consumes the imported Y-axis range and easing using the canonical scroll trajectory.",
    futureOwnerOrPhase: null,
    fixtureIds: ["enterprise8"],
  },
  supported({ key: "panel-slider.slider_divider", sourceType: "panel-slider", sourceField: "slider_divider", semanticMeaning: "UIkit Grid divider track", capabilityFamily: "Panel Slider layout", canonicalOwner: "carouselSettings.divider", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.divider", inspectorLocation: "Panel Slider › Settings › Slider", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Synchronized Enterprise3 divider contract passes.", fixtureIds: ["enterprise3"] }),
  supported({ key: "panel-slider.slider_width", sourceType: "panel-slider", sourceField: "slider_width", semanticMeaning: "Responsive Panel Slider item width, including tiered source variants", capabilityFamily: "Panel Slider layout", canonicalOwner: "carouselSettings.cardsPerView*", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings", inspectorLocation: "Panel Slider › Settings › Item Width", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3/5 static contracts establish supported responsive width semantics.", fixtureIds: ["enterprise3", "enterprise5"] }),
  supported({ key: "panel-slider.slider_gap", sourceType: "panel-slider", sourceField: "slider_gap", semanticMeaning: "UIkit Grid gap", capabilityFamily: "Panel Slider layout", canonicalOwner: "carouselSettings.spaceBetween", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.spaceBetween", inspectorLocation: "Panel Slider › Settings › Slider", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3 geometry contract covers the shared gap path.", fixtureIds: ["enterprise3"] }),
  supported({ key: "panel-slider.text_align", sourceType: "panel-slider", sourceField: "text_align", semanticMeaning: "Whole panel content and inline media alignment", capabilityFamily: "General alignment", canonicalOwner: "BuilderLayoutBlock.textAlign", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.textAlign", inspectorLocation: "Panel Slider › Advanced › General › Text Alignment", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3 contract covers left/center/right shared content alignment.", fixtureIds: ["enterprise3"] }),
  supported({ key: "panel-slider.image_width", sourceType: "panel-slider", sourceField: "image_width", semanticMeaning: "Panel Slider media width", capabilityFamily: "Image", canonicalOwner: "canonical Image sizing", normalizer: "normalizeYoothemeMedia", persistedDestination: "BuilderLayoutBlock.imageWidth", inspectorLocation: "Panel Slider › Image › Width", runtimeConsumer: "UikitSlider → CarouselBlock media", statusReason: "Enterprise5 static SVG media contract is verified.", fixtureIds: ["enterprise5"] }),
  supported({ key: "panel-slider.panel_style", sourceType: "panel-slider", sourceField: "panel_style", semanticMeaning: "Panel/card presentation variant", capabilityFamily: "Panel/Card", canonicalOwner: "carouselSettings.panelStyle", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.panelStyle", inspectorLocation: "Panel Slider › Settings › Panel", runtimeConsumer: "resolveCarouselPresentation → CarouselBlock", statusReason: "Enterprise5 compact/plain panel presentation is verified.", fixtureIds: ["enterprise5"] }),
  supported({ key: "panel-slider.slidenav", sourceType: "panel-slider", sourceField: "slidenav", semanticMeaning: "Panel Slider navigation visibility/presentation", capabilityFamily: "Carousel navigation", canonicalOwner: "carouselSettings.navigation", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.navigation", inspectorLocation: "Panel Slider › Settings › Navigation", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise5 static navigation visibility is verified.", fixtureIds: ["enterprise5"] }),
  supported({ key: "slideshow.overlay_position", sourceType: "slideshow", sourceField: "overlay_position", semanticMeaning: "Slideshow overlay placement", capabilityFamily: "Slideshow overlay", canonicalOwner: "carouselSettings.overlayPosition", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.overlayPosition", inspectorLocation: "Slideshow › Settings › Content Overlay", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3 synchronized overlay geometry contract passes.", fixtureIds: ["enterprise3"] }),
  supported({ key: "slideshow.nav", sourceType: "slideshow", sourceField: "nav", semanticMeaning: "Dotnav/thumbnail navigation selection and placement", capabilityFamily: "Slideshow navigation", canonicalOwner: "carouselSettings.navigation", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.navigation", inspectorLocation: "Slideshow › Settings › Navigation", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3/4 static navigation contracts are verified.", fixtureIds: ["enterprise3", "enterprise4"] }),
  supported({ key: "slideshow_item.thumbnail", sourceType: "slideshow_item", sourceField: "thumbnail", semanticMeaning: "Per-slide dedicated navigation thumbnail", capabilityFamily: "Slideshow navigation", canonicalOwner: "slides[].thumbnailUrl", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.slides[].thumbnailUrl", inspectorLocation: "Slideshow › Content › Item › Thumbnail", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise4 thumbnail contract passes.", fixtureIds: ["enterprise4"] }),
  supported({ key: "slideshow.title_element", sourceType: "slideshow", sourceField: "title_element", semanticMeaning: "Slide title HTML element", capabilityFamily: "Typography", canonicalOwner: "carouselSettings.headingLevel", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.headingLevel", inspectorLocation: "Slideshow › Content › Title", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3 title contract passes.", fixtureIds: ["enterprise3"] }),
  supported({ key: "slideshow.title_style", sourceType: "slideshow", sourceField: "title_style", semanticMeaning: "Slide title semantic style", capabilityFamily: "Typography", canonicalOwner: "carouselSettings.headingSize", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.carouselSettings.headingSize", inspectorLocation: "Slideshow › Content › Title", runtimeConsumer: "UikitSlider → CarouselBlock", statusReason: "Enterprise3 title contract passes.", fixtureIds: ["enterprise3"] }),
  supported({ key: "gallery.grid_masonry", sourceType: "gallery", sourceField: "grid_masonry", semanticMeaning: "UIkit Grid masonry packing", capabilityFamily: "Gallery layout", canonicalOwner: "Gallery presentation adapter", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.masonry", inspectorLocation: "Gallery › Settings › Grid", runtimeConsumer: "UikitGallery → useUikitGridRuntime", statusReason: "Enterprise6 uses the shared UIkit Grid masonry runtime.", fixtureIds: ["enterprise6"] }),
  supported({ key: "gallery.lightbox", sourceType: "gallery", sourceField: "lightbox", semanticMeaning: "UIkit lightbox enablement", capabilityFamily: "Gallery interaction", canonicalOwner: "Gallery presentation adapter", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.enableLightbox", inspectorLocation: "Gallery › Settings › Link", runtimeConsumer: "UikitGallery → useUikitLightboxRuntime", statusReason: "Enterprise6 uses the shared UIkit Lightbox runtime.", fixtureIds: ["enterprise6"] }),
  supported({ key: "gallery.overlay_link", sourceType: "gallery", sourceField: "overlay_link", semanticMeaning: "Overlay/media click trigger", capabilityFamily: "Gallery interaction", canonicalOwner: "galleryItems[].overlayLink", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.overlayLink", inspectorLocation: "Gallery › Content › Item › Link Overlay", runtimeConsumer: "UikitGallery → shared link/lightbox trigger", statusReason: "Enterprise6 verifies overlay/media lightbox triggering without nested anchors.", fixtureIds: ["enterprise6"] }),
  supported({ key: "gallery.image_width", sourceType: "gallery", sourceField: "image_width", semanticMeaning: "Natural-proportion gallery image width", capabilityFamily: "Image", canonicalOwner: "canonical Image sizing", normalizer: "normalizeYoothemeMedia", persistedDestination: "BuilderLayoutBlock.imageWidth", inspectorLocation: "Gallery › Image › Width", runtimeConsumer: "UikitGallery → canonical Image resolver", statusReason: "Enterprise6 imported Gallery image contract is verified.", fixtureIds: ["enterprise6"] }),
  supported({ key: "gallery.image_height", sourceType: "gallery", sourceField: "image_height", semanticMeaning: "Natural-proportion gallery image height", capabilityFamily: "Image", canonicalOwner: "canonical Image sizing", normalizer: "normalizeYoothemeMedia", persistedDestination: "BuilderLayoutBlock.imageHeight", inspectorLocation: "Gallery › Image › Height", runtimeConsumer: "UikitGallery → canonical Image resolver", statusReason: "Enterprise6 imported Gallery image contract is verified.", fixtureIds: ["enterprise6"] }),
  supported({ key: "alert.alert_style", sourceType: "alert", sourceField: "alert_style", semanticMeaning: "UIkit Alert style", capabilityFamily: "Alert presentation", canonicalOwner: "UikitAlert", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.alertStyle", inspectorLocation: "Alert › Settings › Presentation", runtimeConsumer: "UikitAlert", statusReason: "Enterprise7 static Alert subset and Enterprise8 default-surface contract are verified.", fixtureIds: ["enterprise7", "enterprise8"] }),
  supported({ key: "icon.icon_color", sourceType: "icon", sourceField: "icon_color", semanticMeaning: "Semantic icon color", capabilityFamily: "Icon", canonicalOwner: "UikitIcon", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.iconColorScheme", inspectorLocation: "Icon › Settings › Color", runtimeConsumer: "UikitIcon", statusReason: "Enterprise7 static Icon subset is verified.", fixtureIds: ["enterprise7"] }),
  supported({ key: "image.css", sourceType: "image", sourceField: "css", semanticMeaning: "Scoped Image Advanced CSS using YOOtheme .el-element/.el-image/.el-link selectors", capabilityFamily: "Advanced CSS", canonicalOwner: "ElementAdvancedStyle", normalizer: "sourceGeneralVisualStyle", persistedDestination: "BuilderLayoutBlock.visualStyle.customCss", inspectorLocation: "Image › Advanced › CSS", runtimeConsumer: "ElementAdvancedStyle → scoped Builder/storefront shell", statusReason: "Enterprise8 Image Advanced CSS is persisted and translated at the shared element scope boundary.", fixtureIds: ["enterprise8"] }),
  supported({ key: "list.list_type", sourceType: "list", sourceField: "list_type", semanticMeaning: "List presentation type", capabilityFamily: "List", canonicalOwner: "UikitList", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.listType", inspectorLocation: "List › Settings › Presentation", runtimeConsumer: "UikitList", statusReason: "Enterprise7 static List subset is verified.", fixtureIds: ["enterprise7"] }),
  supported({ key: "table.show_image", sourceType: "table", sourceField: "show_image", semanticMeaning: "Table image column visibility", capabilityFamily: "Table content", canonicalOwner: "UikitTable + canonical Image", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.tableShowImage", inspectorLocation: "Table › Content › Item › Image", runtimeConsumer: "UikitTable", statusReason: "Enterprise8 media/action table contract is verified.", fixtureIds: ["enterprise8"] }),
  supported({ key: "table.show_link", sourceType: "table", sourceField: "show_link", semanticMeaning: "Table action/link column visibility", capabilityFamily: "Table content", canonicalOwner: "UikitTable + shared Action", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.tableShowLink", inspectorLocation: "Table › Content › Item › Link", runtimeConsumer: "UikitTable", statusReason: "Enterprise8 media/action table contract is verified.", fixtureIds: ["enterprise8"] }),
  supported({ key: "table.table_style", sourceType: "table", sourceField: "table_style", semanticMeaning: "UIkit Table presentation", capabilityFamily: "Table presentation", canonicalOwner: "UikitTable", normalizer: "mapYoothemeStaticContent", persistedDestination: "BuilderLayoutBlock.tableStyle", inspectorLocation: "Table › Settings › Presentation", runtimeConsumer: "UikitTable", statusReason: "Enterprise8 static Table presentation is verified.", fixtureIds: ["enterprise8"] }),
  { key: "gallery_item.hover_image", sourceType: "gallery_item", sourceField: "hover_image", semanticMeaning: "Gallery alternate hover media", capabilityFamily: "Gallery media", canonicalOwner: null, normalizer: null, persistedDestination: null, inspectorLocation: null, runtimeConsumer: null, status: "DEFERRED", statusReason: "No exact canonical Gallery alternate-media runtime exists.", futureOwnerOrPhase: "Future Gallery media capability", fixtureIds: ["enterprise6"] },
  { key: "panel-slider.image_align", sourceType: "panel-slider", sourceField: "image_align", semanticMeaning: "Panel Slider structural image placement", capabilityFamily: "Panel Slider image", canonicalOwner: null, normalizer: "mapYoothemeStaticContent", persistedDestination: null, inspectorLocation: null, runtimeConsumer: null, status: "DEFERRED", statusReason: "Structural media placement has no exact shared media-grid runtime.", futureOwnerOrPhase: "Deferred Panel Slider Image capability", fixtureIds: ["enterprise5"] },
  { key: "panel-slider.link_image", sourceType: "panel-slider", sourceField: "link_image", semanticMeaning: "Panel Slider image-only link", capabilityFamily: "Panel Slider image", canonicalOwner: null, normalizer: null, persistedDestination: null, inspectorLocation: null, runtimeConsumer: null, status: "INTENTIONALLY_UNSUPPORTED", statusReason: "No canonical shared Image link owner exists for this distinct source semantic.", futureOwnerOrPhase: null, fixtureIds: ["enterprise5"] },
  { key: "accordion.image_align", sourceType: "accordion", sourceField: "image_align", semanticMeaning: "Accordion side-media structural placement", capabilityFamily: "Accordion media", canonicalOwner: null, normalizer: "mapYoothemeStaticContent", persistedDestination: null, inspectorLocation: null, runtimeConsumer: null, status: "DEFERRED", statusReason: "Side-media grid layout has no exact canonical runtime.", futureOwnerOrPhase: "Future Accordion media layout capability", fixtureIds: ["enterprise8"] },
  { key: "gallery.source", sourceType: "gallery", sourceField: "source", semanticMeaning: "Dynamic/query-backed Gallery collection", capabilityFamily: "Dynamic Content", canonicalOwner: null, normalizer: null, persistedDestination: null, inspectorLocation: null, runtimeConsumer: null, status: "DEFERRED", statusReason: "Dynamic collection bindings are not part of static Gallery support.", futureOwnerOrPhase: "Phase 13 — Dynamic Content / Field Binding", fixtureIds: ["enterprise6"] },
];

/**
 * Enterprise8 deliberately exercises the already-supported Phase 2–11
 * surface alongside Table. These exact-field rules backfill the registry for
 * the whole synchronized export without changing any importer decision. A
 * field is listed only after its existing normalizer/runtime path, or its
 * explicit lack of one, was established in the Phase 9–11 contracts.
 */
const ENTERPRISE8_SUPPORTED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  accordion_item: ["content", "image", "link", "link_text", "title"],
  accordion: ["collapsible", "link_style", "link_text", "show_image", "show_link"],
  alert: ["content", "link", "title", "title_element"],
  button_item: ["button_style", "content", "link"],
  button: ["animation", "button_size", "margin", "margin_remove_bottom", "text_align", "text_align_breakpoint", "text_align_fallback"],
  column: ["order_first", "vertical_align", "width_large", "width_medium", "width_small"],
  divider: ["animation", "divider_element", "margin"],
  gallery_item: ["content", "image", "title"],
  gallery: ["grid_column_gap", "grid_default", "grid_medium", "grid_row_gap", "link_style", "link_text", "margin", "meta_align", "meta_element", "meta_style", "overlay_hover", "overlay_mode", "overlay_position", "overlay_style", "overlay_transition", "show_content", "show_link", "show_meta", "show_title", "text_align", "text_color", "title_element", "title_hover_style"],
  grid_item: ["content", "image", "link", "link_text", "meta", "panel_style", "title"],
  grid: ["animation", "parallax_easing", "parallax_y", "block_align", "block_align_breakpoint", "block_align_fallback", "content_column_breakpoint", "content_margin", "grid_column_align", "grid_column_gap", "grid_default", "grid_medium", "grid_row_align", "grid_row_gap", "grid_small", "icon_width", "image_align", "image_grid_breakpoint", "image_grid_width", "image_svg_color", "image_svg_inline", "image_width", "link_fullwidth", "link_margin", "link_size", "link_style", "link_text", "margin", "margin_remove_bottom", "maxwidth", "maxwidth_breakpoint", "meta_align", "meta_element", "meta_style", "panel_link", "panel_link_hover", "panel_padding", "panel_style", "position", "position_z_index", "show_content", "show_image", "show_link", "show_meta", "show_title", "text_align", "text_align_breakpoint", "text_align_fallback", "title_align", "title_element", "title_grid_breakpoint", "title_grid_width", "title_margin", "title_style"],
  headline: ["animation", "block_align_breakpoint", "block_align_fallback", "content", "margin", "maxwidth", "position", "position_z_index", "text_align", "text_align_breakpoint", "text_align_fallback", "title_element", "title_style"],
  icon: ["icon", "icon_width", "margin"],
  image: ["animation", "parallax_easing", "parallax_y", "css", "image", "image_border", "image_svg_color", "image_svg_inline", "image_width", "margin", "margin_remove_top", "position", "position_left", "position_right", "position_top", "position_z_index", "text_align", "visibility"],
  list_item: ["content", "icon", "link"],
  list: ["list_element", "list_horizontal_separator", "show_image", "show_link"],
  "overlay-slider_item": ["image", "item_element", "text_color", "title"],
  "overlay-slider": ["image_width", "link_margin", "link_style", "link_text", "margin", "margin_remove_bottom", "meta_align", "meta_element", "meta_style", "nav", "nav_align", "nav_below", "nav_breakpoint", "nav_position", "nav_position_margin", "overlay_display", "overlay_link", "overlay_mode", "overlay_padding", "overlay_position", "overlay_transition", "overlay_transition_background", "show_content", "show_link", "show_meta", "show_title", "slidenav", "slidenav_breakpoint", "slidenav_margin", "slidenav_outside_breakpoint", "slider_autoplay_pause", "slider_center", "slider_divider", "slider_gap", "slider_width", "slider_width_default", "slider_width_medium", "text_align", "title_element", "title_hover_style"],
  "panel-slider_item": ["image", "link", "title"],
  "panel-slider": ["block_align", "css", "image_loading", "image_svg_color", "image_svg_inline", "link_style", "margin", "meta_align", "meta_element", "meta_style", "nav_align", "panel_link", "show_content", "show_image", "show_link", "show_meta", "show_title", "slidenav_breakpoint", "slidenav_margin", "slider_autoplay_pause", "slider_center", "slider_finite", "title_element"],
  panel: ["animation", "content", "content_align", "icon_width", "image_align", "image_svg_color", "image_width", "link", "link_margin", "link_style", "link_text", "margin", "margin_remove_top", "meta_align", "meta_element", "meta_style", "panel_padding", "text_align", "title", "title_align", "title_element", "title_grid_breakpoint", "title_grid_width", "title_margin", "title_style"],
  row: ["column_gap", "layout", "margin", "margin_remove_bottom", "margin_remove_top", "row_gap"],
  section: ["animation", "animation_delay", "id", "image", "image_position", "media_visibility", "overlap", "padding", "padding_remove_bottom", "padding_remove_top", "style", "title_breakpoint", "title_position", "title_rotation", "vertical_align", "width"],
  slideshow_item: ["content", "image", "link", "link_text", "meta", "text_color", "title"],
  slideshow: ["link_style", "link_text", "margin", "meta_align", "meta_element", "meta_style", "nav_align", "nav_breakpoint", "nav_position", "nav_position_margin", "show_content", "show_link", "show_meta", "show_thumbnail", "show_title", "slidenav", "slidenav_breakpoint", "slidenav_margin", "slidenav_outside_breakpoint", "slideshow_autoplay_pause", "slideshow_min_height", "thumbnav_height", "thumbnav_svg_color", "thumbnav_width", "title_hover_style"],
  table_item: ["content", "image", "link", "meta", "title"],
  table: ["content_style", "image_svg_color", "link_style", "link_text", "meta_color", "show_content", "show_meta", "show_title", "table_hover", "table_justify", "table_order", "table_responsive", "table_width_content", "table_width_meta", "table_width_title", "title_color", "title_font_family", "title_style"],
  text: ["animation", "block_align", "block_align_breakpoint", "block_align_fallback", "column_breakpoint", "content", "margin", "margin_remove_bottom", "maxwidth", "position", "position_z_index", "text_align", "text_align_breakpoint", "text_align_fallback", "text_style"],
};

const ENTERPRISE8_DEFERRED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  accordion: ["content_column_breakpoint", "image_grid_breakpoint", "image_grid_width", "image_svg_color"],
  button_item: ["icon_align"],
  button: ["grid_column_gap", "grid_row_gap"],
  column: ["image_position", "padding", "position_sticky_breakpoint"],
  gallery: ["filter_align", "filter_all", "filter_grid_breakpoint", "filter_grid_width", "filter_position", "filter_style", "item_animation", "lightbox_bg_close", "show_hover_image", "show_hover_video"],
  grid: ["filter_align", "filter_all", "filter_grid_breakpoint", "filter_grid_width", "filter_position", "filter_style", "image_svg_animate", "item_animation", "item_maxwidth", "lightbox_bg_close", "panel_expand", "panel_image_no_padding", "show_hover_image", "show_hover_video", "show_video", "title_hover_style"],
  image: ["image_svg_animate", "parallax_scale", "parallax_target"],
  list: ["column_breakpoint", "image_align", "image_svg_color", "image_vertical_align"],
  "overlay-slider": ["show_hover_image", "show_hover_video"],
  "panel-slider": ["content_column_breakpoint", "image_grid_breakpoint", "image_grid_width", "icon_width", "panel_match", "nav_breakpoint", "slidenav_outside_breakpoint", "show_hover_image", "show_hover_video", "show_video", "slider_sets", "title_align", "title_grid_breakpoint", "title_grid_width", "title_hover_style"],
  panel: ["content_column_breakpoint", "image_grid_breakpoint", "image_grid_width", "title_hover_style"],
  row: ["width"],
  section: ["header_transparent", "header_transparent_noplaceholder", "header_transparent_text_color", "image_effect", "image_parallax_bgy", "image_parallax_easing"],
  slideshow: ["overlay_animation"],
  table: ["meta_style"],
};

const ENTERPRISE8_INTENTIONALLY_UNSUPPORTED_FIELDS: Readonly<Record<string, readonly string[]>> = {
  button_item: ["dialog_layout", "dialog_offcanvas_flip"],
  button: ["css"],
};

function enterprise8FieldStatus(sourceType: string, sourceField: string): YoothemeCapabilityStatus | null {
  if (ENTERPRISE8_SUPPORTED_FIELDS[sourceType]?.includes(sourceField)) return "SUPPORTED";
  if (ENTERPRISE8_DEFERRED_FIELDS[sourceType]?.includes(sourceField)) return "DEFERRED";
  if (ENTERPRISE8_INTENTIONALLY_UNSUPPORTED_FIELDS[sourceType]?.includes(sourceField)) return "INTENTIONALLY_UNSUPPORTED";
  return null;
}

function enterprise8BackfillCapability(key: string): YoothemeSemanticCapabilityRecord | undefined {
  const separator = key.indexOf(".");
  if (separator < 1) return undefined;
  const sourceType = key.slice(0, separator);
  const sourceField = key.slice(separator + 1);
  const status = enterprise8FieldStatus(sourceType, sourceField);
  if (!status) return undefined;
  const semanticMeaning = `Enterprise8 ${sourceType} ${sourceField} source semantic`;
  const family = sourceType.replace(/_item$/, "").replace(/-/g, " ");
  if (sourceType === "row" || sourceType === "column") {
    const canonicalOwner = sourceType === "row" ? "BuilderRow" : "BuilderColumn";
    const persistedDestination = sourceType === "row"
      ? "BuilderSection.rows[]"
      : "BuilderSection.rows[].columns[]";
    const hasRuntime = status === "SUPPORTED";
    return {
      key,
      sourceType,
      sourceField,
      semanticMeaning,
      capabilityFamily: `Canonical ${sourceType} structure`,
      canonicalOwner,
      normalizer: "mapYoothemeStaticContent",
      persistedDestination,
      inspectorLocation: null,
      runtimeConsumer: hasRuntime
        ? "normalizeBuilderSectionLayout → resolveBuilderSectionStructure → shared Builder/storefront renderer"
        : null,
      status,
      statusReason: hasRuntime
        ? `Fresh imports persist ${sourceField} on ${canonicalOwner}; the shared structural renderer consumes that canonical owner.`
        : `Fresh imports persist ${sourceField} on ${canonicalOwner}, but Batch 2 intentionally did not add its presentation/runtime projection, so it is not advertised as fully supported.`,
      futureOwnerOrPhase: hasRuntime ? null : "Canonical Row/Column presentation renderer batch",
      fixtureIds: ["enterprise8"],
    };
  }
  if (status === "SUPPORTED") {
    return {
      key, sourceType, sourceField, semanticMeaning,
      capabilityFamily: family,
      canonicalOwner: "existing canonical element/general owner",
      normalizer: "mapYoothemeStaticContent",
      persistedDestination: "existing BuilderLayoutBlock semantic field",
      inspectorLocation: "existing canonical element Inspector",
      runtimeConsumer: "shared Builder/storefront element renderer",
      status, statusReason: "Enterprise8 field is already normalized into an existing canonical persisted/runtime path verified by the Phase 9–11 static scope.", futureOwnerOrPhase: null, fixtureIds: ["enterprise8"],
    };
  }
  if (status === "DEFERRED") {
    return {
      key, sourceType, sourceField, semanticMeaning,
      capabilityFamily: family, canonicalOwner: null, normalizer: "mapYoothemeStaticContent", persistedDestination: null, inspectorLocation: null, runtimeConsumer: null,
      status, statusReason: "The source field is known, but no exact existing canonical runtime owns this specialized semantic.", futureOwnerOrPhase: "Future cross-element capability / Phase 13 where dynamic or media-runtime ownership is required", fixtureIds: ["enterprise8"],
    };
  }
  return {
    key, sourceType, sourceField, semanticMeaning,
    capabilityFamily: family, canonicalOwner: null, normalizer: null, persistedDestination: null, inspectorLocation: null, runtimeConsumer: null,
    status, statusReason: "The source field is a deliberate product exclusion with no canonical equivalent in the verified static scope.", futureOwnerOrPhase: null, fixtureIds: ["enterprise8"],
  };
}

export const YOOTHEME_COMPATIBILITY_REGISTRY: YoothemeCompatibilityRegistry = {
  schemaVersion: YOOTHEME_COMPATIBILITY_REGISTRY_SCHEMA_VERSION,
  fixtures: YOOTHEME_FIXTURE_REGISTRY,
  capabilities: YOOTHEME_SEMANTIC_CAPABILITY_REGISTRY,
};

export type RegistryValidationIssue = { path: string; message: string };

export function validateYoothemeCompatibilityRegistry(
  registry: YoothemeCompatibilityRegistry = YOOTHEME_COMPATIBILITY_REGISTRY,
): RegistryValidationIssue[] {
  const issues: RegistryValidationIssue[] = [];
  const fixtureIds = new Set<string>();
  const capabilityKeys = new Set<string>();

  for (const [index, fixtureRecord] of registry.fixtures.entries()) {
    const entryPath = `fixtures[${index}]`;
    if (fixtureIds.has(fixtureRecord.id)) issues.push({ path: `${entryPath}.id`, message: `duplicate fixture ID '${fixtureRecord.id}'` });
    fixtureIds.add(fixtureRecord.id);
    if (!/^[a-f0-9]{64}$/i.test(fixtureRecord.sourceSha256)) issues.push({ path: `${entryPath}.sourceSha256`, message: "must be a SHA-256 hex digest" });
    if (fixtureRecord.acceptanceScope && !fixtureRecord.strictBaseline) {
      issues.push({ path: `${entryPath}.strictBaseline`, message: "page-acceptance fixtures require a strict baseline" });
    }
    if (fixtureRecord.strictBaseline) {
      for (const status of ["SUPPORTED", "DEFERRED", "INTENTIONALLY_UNSUPPORTED", "UNHANDLED", "BLOCKED"] as const) {
        const count = fixtureRecord.strictBaseline.expectedPageReportStatusCounts[status];
        if (!Number.isInteger(count) || count < 0) {
          issues.push({ path: `${entryPath}.strictBaseline.expectedPageReportStatusCounts.${status}`, message: "must be a non-negative integer" });
        }
      }
    }
    for (const [contractIndex, contract] of fixtureRecord.contracts.entries()) {
      if (!contract.path) issues.push({ path: `${entryPath}.contracts[${contractIndex}].path`, message: "must reference a repository artifact" });
      if (!contract.capabilityKeys.length) issues.push({ path: `${entryPath}.contracts[${contractIndex}].capabilityKeys`, message: "must reference at least one capability" });
    }
  }

  for (const [index, capability] of registry.capabilities.entries()) {
    const entryPath = `capabilities[${index}]`;
    if (capabilityKeys.has(capability.key)) issues.push({ path: `${entryPath}.key`, message: `duplicate capability key '${capability.key}'` });
    capabilityKeys.add(capability.key);
    if (capability.key !== `${capability.sourceType}.${capability.sourceField}`) issues.push({ path: `${entryPath}.key`, message: "must equal sourceType.sourceField" });
    if (!capability.fixtureIds.length) issues.push({ path: `${entryPath}.fixtureIds`, message: "must reference at least one fixture" });
    for (const fixtureId of capability.fixtureIds) if (!fixtureIds.has(fixtureId)) issues.push({ path: `${entryPath}.fixtureIds`, message: `references unknown fixture '${fixtureId}'` });
    if (capability.status === "SUPPORTED" && (!capability.canonicalOwner || !capability.runtimeConsumer || !capability.persistedDestination)) {
      issues.push({ path: entryPath, message: "SUPPORTED capabilities require canonical owner, persisted destination, and runtime consumer" });
    }
    const evidence = getYoothemeCapabilityEvidence(capability, registry);
    if (evidence.fixtureAccepted && !evidence.acceptanceContractPaths.length) {
      issues.push({ path: entryPath, message: "fixture-accepted evidence requires a registered contract reference" });
    }
    if (capability.status === "DEFERRED" && (!capability.statusReason || !capability.futureOwnerOrPhase)) {
      issues.push({ path: entryPath, message: "DEFERRED capabilities require a reason and future owner/phase" });
    }
  }

  for (const [fixtureIndex, fixtureRecord] of registry.fixtures.entries()) {
    for (const [contractIndex, contract] of fixtureRecord.contracts.entries()) {
      for (const capabilityKey of contract.capabilityKeys) if (!capabilityKeys.has(capabilityKey)) {
        issues.push({ path: `fixtures[${fixtureIndex}].contracts[${contractIndex}].capabilityKeys`, message: `references unknown capability '${capabilityKey}'` });
      }
    }
  }
  return issues;
}

export function findYoothemeFixture(id: string, registry = YOOTHEME_COMPATIBILITY_REGISTRY) {
  return registry.fixtures.find((fixtureRecord) => fixtureRecord.id === id);
}

export function findYoothemeCapability(key: string, registry = YOOTHEME_COMPATIBILITY_REGISTRY) {
  return registry.capabilities.find((capability) => capability.key === key)
    ?? enterprise8BackfillCapability(key);
}

/**
 * Computes the proof level from the same fixture contracts that execute the
 * compatibility checks. This prevents a mapped field from quietly becoming a
 * fidelity claim merely because a renderer happens to exist.
 */
export function getYoothemeCapabilityEvidence(
  capabilityOrKey: YoothemeSemanticCapabilityRecord | string,
  registry: YoothemeCompatibilityRegistry = YOOTHEME_COMPATIBILITY_REGISTRY,
): YoothemeCapabilityEvidence {
  const capability = typeof capabilityOrKey === "string"
    ? findYoothemeCapability(capabilityOrKey, registry)
    : capabilityOrKey;
  if (!capability) {
    return { mappedRuntimePath: false, fixtureAccepted: false, acceptanceContractPaths: [] };
  }
  const acceptanceContractPaths = registry.fixtures
    .filter((fixtureRecord) =>
      fixtureRecord.acceptanceStatus === "VERIFIED"
      && capability.fixtureIds.includes(fixtureRecord.id),
    )
    .flatMap((fixtureRecord) => fixtureRecord.contracts
      .filter((contract) => contract.capabilityKeys.includes(capability.key))
      .map((contract) => contract.path));
  const mappedRuntimePath = capability.status === "SUPPORTED"
    && Boolean(capability.canonicalOwner && capability.persistedDestination && capability.runtimeConsumer);
  return {
    mappedRuntimePath,
    fixtureAccepted: mappedRuntimePath && acceptanceContractPaths.length > 0,
    acceptanceContractPaths,
  };
}

/** A public fidelity claim requires both the path and registered acceptance evidence. */
export function isYoothemeCapabilityFixtureAccepted(
  capabilityOrKey: YoothemeSemanticCapabilityRecord | string,
  registry: YoothemeCompatibilityRegistry = YOOTHEME_COMPATIBILITY_REGISTRY,
) {
  return getYoothemeCapabilityEvidence(capabilityOrKey, registry).fixtureAccepted;
}

/** Resolves value-sensitive source semantics without collapsing them into a
 * similarly named but different canonical capability. */
export function resolveYoothemeSourceCapability(
  sourceType: string,
  sourceField: string,
  sourceValue: unknown,
  registry = YOOTHEME_COMPATIBILITY_REGISTRY,
) {
  if (sourceField === "animation" && String(sourceValue).toLowerCase() === "parallax") {
    const parallax = registry.capabilities.find((capability) => capability.key === "element.animation");
    return parallax
      ? { ...parallax, key: `${sourceType}.animation.parallax`, sourceType }
      : undefined;
  }
  return findYoothemeCapability(`${sourceType}.${sourceField}`, registry);
}

export function resolveYoothemeFixtureContracts(id: string, registry = YOOTHEME_COMPATIBILITY_REGISTRY) {
  const fixtureRecord = findYoothemeFixture(id, registry);
  if (!fixtureRecord) throw new Error(`Unknown YOOtheme compatibility fixture '${id}'`);
  return fixtureRecord.contracts.map((contract) => ({
    ...contract,
    capabilities: contract.capabilityKeys.map((key) => {
      const capability = findYoothemeCapability(key, registry);
      if (!capability) throw new Error(`Fixture '${id}' references unknown capability '${key}'`);
      return capability;
    }),
  }));
}
import { YOOTHEME_LESS_CAPABILITIES } from "@/lib/yoothemeImportContract";
