import { GLOBAL_STYLE_TOKEN_DEFAULTS } from "@/lib/globalStyleTokens";

/** Browser-safe validation and runtime resolution for the BuilderShell owner. */
export const RESPONSIVE_BREAKPOINT_KEYS = [
  "breakpointSmall",
  "breakpointMedium",
  "breakpointLarge",
  "breakpointXLarge",
] as const;

export type ResponsiveBreakpointKey = typeof RESPONSIVE_BREAKPOINT_KEYS[number];
export type ResponsiveBreakpointSettings = Partial<Record<ResponsiveBreakpointKey, string | undefined>>;

export type ResponsiveBreakpointPolicy = {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  id: string;
};

export type ResponsiveBreakpointTier = "base" | "small" | "medium" | "large" | "xlarge";

export function parseResponsiveBreakpoint(value: unknown): number | null {
  const match = typeof value === "string" && /^\s*(\d+(?:\.\d+)?)\s*px\s*$/i.exec(value);
  const parsed = match ? Number(match[1]) : Number.NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function validateResponsiveBreakpointSettings(settings: ResponsiveBreakpointSettings) {
  const values = RESPONSIVE_BREAKPOINT_KEYS.map((key) => parseResponsiveBreakpoint(settings[key]));
  if (values.some((value) => value == null)) {
    return { valid: false as const, message: "Each breakpoint must be a positive finite pixel value." };
  }
  const [small, medium, large, xlarge] = values as number[];
  if (!(small < medium && medium < large && large < xlarge)) {
    return { valid: false as const, message: "Breakpoints must satisfy Small < Medium < Large < X-Large." };
  }
  return { valid: true as const, values: { small, medium, large, xlarge } };
}

/**
 * Resolves the one responsive policy used by rendered WebPages content.
 * Invalid persisted data falls back as a complete policy, never as a mix of
 * competing per-component defaults. Batch 1 prevents new invalid writes.
 */
export function resolveResponsiveBreakpointPolicy(
  settings?: ResponsiveBreakpointSettings | null,
): ResponsiveBreakpointPolicy {
  const canonical = {
    breakpointSmall: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointSmall,
    breakpointMedium: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointMedium,
    breakpointLarge: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointLarge,
    breakpointXLarge: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointXLarge,
    ...settings,
  };
  const defaultValidation = validateResponsiveBreakpointSettings({
    breakpointSmall: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointSmall,
    breakpointMedium: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointMedium,
    breakpointLarge: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointLarge,
    breakpointXLarge: GLOBAL_STYLE_TOKEN_DEFAULTS.breakpointXLarge,
  });
  if (!defaultValidation.valid) {
    throw new Error(`Invalid canonical responsive breakpoint defaults: ${defaultValidation.message}`);
  }
  const validation = validateResponsiveBreakpointSettings(canonical);
  const values = validation.valid
    ? validation.values
    : defaultValidation.values;
  return {
    ...values,
    id: `s${values.small}-m${values.medium}-l${values.large}-xl${values.xlarge}`,
  };
}

/** Maps an actual rendered-page width to the semantic UIkit tier. */
export function resolveResponsiveBreakpointTier(
  width: number,
  policy: ResponsiveBreakpointPolicy,
): ResponsiveBreakpointTier {
  if (!Number.isFinite(width) || width < policy.small) return "base";
  if (width < policy.medium) return "small";
  if (width < policy.large) return "medium";
  if (width < policy.xlarge) return "large";
  return "xlarge";
}

/**
 * Emits only scoped page-content rules. Consumers migrate onto these semantic
 * tier variables in Batch 3; the rule itself is intentionally independent of
 * dashboard/application-shell breakpoints.
 */
export function renderResponsiveBreakpointPolicyCss(policy: ResponsiveBreakpointPolicy) {
  const selector = `[data-builder-page-root][data-responsive-breakpoint-policy="${policy.id}"]`;
  return `${selector}{--webpages-breakpoint-small:${policy.small}px;--webpages-breakpoint-medium:${policy.medium}px;--webpages-breakpoint-large:${policy.large}px;--webpages-breakpoint-xlarge:${policy.xlarge}px;--webpages-responsive-tier:base;}
@media (min-width:${policy.small}px){${selector}{--webpages-responsive-tier:small;}}
@media (min-width:${policy.medium}px){${selector}{--webpages-responsive-tier:medium;}}
@media (min-width:${policy.large}px){${selector}{--webpages-responsive-tier:large;}}
@media (min-width:${policy.xlarge}px){${selector}{--webpages-responsive-tier:xlarge;}}
${renderResponsiveConsumerCss(selector, policy)}`;
}

/**
 * The responsive page consumers migrated in Phase 10 Batch 3. This is kept
 * beside policy resolution so CSS and JS consumers cannot acquire separate
 * numeric breakpoint tables. It is deliberately scoped to the rendered page
 * root: dashboard/application-shell breakpoints remain outside this contract.
 */
function renderResponsiveConsumerCss(selector: string, policy: ResponsiveBreakpointPolicy) {
  const tiers = [
    ["small", policy.small],
    ["medium", policy.medium],
    ["large", policy.large],
    ["xlarge", policy.xlarge],
  ] as const;
  const generalValues = ["small", "medium", "large", "xlarge", "2xlarge"];
  const generalRule = (tier: string) => [
    ...generalValues.map((value) => `${selector} .builder-general-maxwidth-${value}-from-${tier}{max-width:var(--uk-container-${value === "medium" ? "default" : value}-max-width,${value === "small" ? "960" : value === "medium" ? "1200" : value === "large" ? "1400" : value === "xlarge" ? "1600" : "1800"}px);}`),
    `${selector} .builder-general-blockalign-center-from-${tier}{margin-left:auto;margin-right:auto;}`,
    `${selector} .builder-general-blockalign-right-from-${tier}{margin-left:auto;margin-right:0;}`,
    `${selector} .builder-general-blockalign-left-from-${tier}{margin-left:0;margin-right:auto;}`,
    `${selector} .builder-general-textalign-left-from-${tier}{text-align:left;}`,
    `${selector} .builder-general-textalign-center-from-${tier}{text-align:center;}`,
    `${selector} .builder-general-textalign-right-from-${tier}{text-align:right;}`,
    `${selector} .builder-general-textalign-justify-from-${tier}{text-align:justify;}`,
  ].join("");
  const yoothemeWidthValues = ["small", "medium", "large", "xlarge", "2xlarge"];
  const yoothemeWidthFallbacks: Record<string, string> = {
    small: "150px",
    medium: "300px",
    large: "450px",
    xlarge: "600px",
    "2xlarge": "750px",
  };
  const yoothemeWidthRule = (tier: string) => yoothemeWidthValues
    .map((value) => `${selector} .builder-yootheme-width-${value}-from-${tier}{width:var(--uk-width-${value}-width,${yoothemeWidthFallbacks[value]});max-width:var(--uk-width-${value}-width,${yoothemeWidthFallbacks[value]});box-sizing:border-box;}`)
    .join("");
  const gridRuleFor = (tier: string, fallbackTier: string) =>
    `${selector} .shop-builder-grid{grid-template-columns:var(--shop-builder-grid-template-${tier},var(--shop-builder-grid-template-${fallbackTier},var(--shop-builder-grid-template,repeat(var(--shop-builder-grid-columns-${tier},var(--shop-builder-grid-columns,3)),minmax(0,1fr)))));--shop-builder-grid-image-width:var(--shop-builder-grid-image-width-${tier},var(--shop-builder-grid-image-width-${fallbackTier},var(--shop-builder-grid-image-width-base,100%)));--shop-builder-grid-card-width:var(--shop-builder-grid-card-width-${tier},var(--shop-builder-grid-card-width-${fallbackTier},var(--shop-builder-grid-card-width-base,auto)));--shop-builder-grid-display:var(--shop-builder-grid-display-${tier},var(--shop-builder-grid-display-${fallbackTier},var(--shop-builder-grid-display-base,grid)));--shop-builder-grid-item-basis:var(--shop-builder-grid-item-basis-${tier},var(--shop-builder-grid-item-basis-${fallbackTier},var(--shop-builder-grid-item-basis-base,auto)));}`;
  const gridRule = gridRuleFor("phone-landscape", "base");
  const gridBaseRule = `${selector} .shop-builder-grid{grid-template-columns:var(--shop-builder-grid-template,repeat(var(--shop-builder-grid-columns,3),minmax(0,1fr)));--shop-builder-grid-image-width:var(--shop-builder-grid-image-width-base,100%);--shop-builder-grid-card-width:var(--shop-builder-grid-card-width-base,auto);--shop-builder-grid-display:var(--shop-builder-grid-display-base,grid);--shop-builder-grid-item-basis:var(--shop-builder-grid-item-basis-base,auto);}`;
  const gridRules: Record<string, string> = {
    small: gridRule,
    medium: gridRuleFor("tablet", "phone-landscape"),
    large: gridRuleFor("desktop", "tablet"),
    xlarge: gridRuleFor("xlarge", "desktop"),
  };
  const columns = ["1-2", "1-3", "1-4", "1-5", "1-6"];
  const textColumnRule = (tier: string) => columns
    .map((value, index) => `${selector} .builder-text-columns-${value}-from-${tier}{columns:${index + 2};}`)
    .join("");
  const navRule = (tier: string) => `${selector} .shop-builder-slidenav-from-${tier} .swiper-button-prev,${selector} .shop-builder-slidenav-from-${tier} .swiper-button-next{display:flex!important;}${selector} .shop-builder-swiper--slideshow.shop-builder-slideshow-nav-from-${tier} .swiper-pagination.uk-dotnav,${selector} .shop-builder-swiper--slideshow.shop-builder-slideshow-nav-from-${tier} .swiper-pagination.uk-thumbnav{display:flex!important;}${selector} .shop-builder-swiper--overlay.shop-builder-overlay-nav-from-${tier} .shop-builder-overlay-navigation-frame{display:block!important;}`;
  const outsideNavHideRule = (tier: string) => `${selector} .shop-builder-slidenav-outside-from-${tier}.shop-builder-arrow-pos--outer .swiper-button-prev,${selector} .shop-builder-slidenav-outside-from-${tier}.shop-builder-arrow-pos--outer .swiper-button-next{display:none!important;}`;
  const titleReset = (tier: string, max: number) => `@media (max-width:${max}px){${selector} .shop-builder-section[data-section-title-breakpoint="${tier}"] .shop-builder-section-heading{writing-mode:horizontal-tb;transform:none;}}`;
  const generalVisibilityBase = tiers.map(([tier]) => `${selector} .builder-general-visible-from-${tier}{display:none!important;}`).join("");
  const generalVisibilityRules = tiers.map(([tier, value]) => `@media (min-width:${value}px){${selector} .builder-general-visible-from-${tier}{display:block!important;}${selector} .builder-general-hidden-from-${tier},${selector} .shop-builder-row--hidden-from-${tier}{display:none!important;}}`).join("");
  const deviceVisibility = `${selector} .builder-hide-mobile,${selector} .builder-hide-tablet,${selector} .builder-hide-desktop{display:initial!important;}@media (max-width:${policy.small - 0.02}px){${selector} .builder-hide-mobile{display:none!important;}}@media (min-width:${policy.small}px) and (max-width:${policy.medium - 0.02}px){${selector} .builder-hide-tablet{display:none!important;}}@media (min-width:${policy.medium}px){${selector} .builder-hide-desktop{display:none!important;}}`;
  const baseNav = tiers.map(([tier]) => `${selector} .shop-builder-slidenav-from-${tier} .swiper-button-prev,${selector} .shop-builder-slidenav-from-${tier} .swiper-button-next,${selector} .shop-builder-swiper--slideshow.shop-builder-slideshow-nav-from-${tier} .swiper-pagination.uk-dotnav,${selector} .shop-builder-swiper--slideshow.shop-builder-slideshow-nav-from-${tier} .swiper-pagination.uk-thumbnav,${selector} .shop-builder-swiper--overlay.shop-builder-overlay-nav-from-${tier} .shop-builder-overlay-navigation-frame{display:none!important;}`).join("");
  const previewSelector = (tier: ResponsiveBreakpointTier) => `${selector}[data-responsive-preview-tier="${tier}"]`;
  const scope = (css: string, previewTier: ResponsiveBreakpointTier) => css.split(selector).join(previewSelector(previewTier));
  const tierOrder: ResponsiveBreakpointTier[] = ["base", "small", "medium", "large", "xlarge"];
  // Desktop Builder keeps the host viewport for the rest of the page, but
  // Slidenav breakpoints must follow the rendered preview canvas width, as
  // YOOtheme evaluates `uk-visible@xl` inside that canvas.
  const builderPreviewSelector = (tier: ResponsiveBreakpointTier) => `${selector}[data-builder-preview-tier="${tier}"]`;
  const builderPreviewNavRules = tierOrder.map((previewTier, index) => {
    const previewRoot = builderPreviewSelector(previewTier);
    const reset = `${previewRoot} .shop-builder-slidenav-from-small .swiper-button-prev,${previewRoot} .shop-builder-slidenav-from-small .swiper-button-next,${previewRoot} .shop-builder-slidenav-from-medium .swiper-button-prev,${previewRoot} .shop-builder-slidenav-from-medium .swiper-button-next,${previewRoot} .shop-builder-slidenav-from-large .swiper-button-prev,${previewRoot} .shop-builder-slidenav-from-large .swiper-button-next,${previewRoot} .shop-builder-slidenav-from-xlarge .swiper-button-prev,${previewRoot} .shop-builder-slidenav-from-xlarge .swiper-button-next{display:none!important;}`;
    const active = tiers.slice(0, index).map(([tier]) => `${previewRoot} .shop-builder-slidenav-from-${tier} .swiper-button-prev,${previewRoot} .shop-builder-slidenav-from-${tier} .swiper-button-next{display:flex!important;}`).join("");
    return `${reset}${active}`;
  }).join("");
  const builderPreviewHeadingRules = tierOrder.map((previewTier) => {
    const previewRoot = builderPreviewSelector(previewTier);
    const size = previewTier === "medium" ? "4rem" : previewTier === "large" || previewTier === "xlarge" ? "6rem" : "3.4rem";
    return `${previewRoot} .uk-heading-large{font-size:${size}!important;line-height:1.1!important;}`;
  }).join("");
  const previewRules = tierOrder.map((previewTier, index) => {
    const activeTiers = tiers.slice(0, Math.max(index, 0));
    const inactiveTitleTiers = tiers.slice(Math.max(index, 0));
    const previewRoot = previewSelector(previewTier);
    const resetGeneral = `${previewRoot} [class*="builder-general-textalign-"]{text-align:start;}${previewRoot} [class*="builder-general-maxwidth-"],${previewRoot} [class*="builder-yootheme-width-"]{max-width:none;width:auto;}${previewRoot} [class*="builder-general-blockalign-"]{margin-left:0;margin-right:0;}`;
    const resetVisibility = `${tiers.map(([tier]) => `${previewRoot} .builder-general-visible-from-${tier}{display:none!important;}${previewRoot} .builder-general-hidden-from-${tier},${previewRoot} .shop-builder-row--hidden-from-${tier}{display:block!important;}`).join("")}`;
    const resetTextColumns = `${tiers.flatMap(([tier]) => columns.map((value) => `${previewRoot} .builder-text-columns-${value}-from-${tier}`)).join(",")}{columns:auto;}`;
    const resetDeviceVisibility = `${previewRoot} .builder-hide-mobile,${previewRoot} .builder-hide-tablet,${previewRoot} .builder-hide-desktop{display:initial!important;}`;
    const deviceVisibilityForTier = index === 0
      ? `${previewRoot} .builder-hide-mobile{display:none!important;}`
      : index === 1
        ? `${previewRoot} .builder-hide-tablet{display:none!important;}`
        : `${previewRoot} .builder-hide-desktop{display:none!important;}`;
    const active = activeTiers.map(([tier]) => `${scope(generalRule(tier), previewTier)}${scope(yoothemeWidthRule(tier), previewTier)}${scope(gridRules[tier], previewTier)}${scope(textColumnRule(tier), previewTier)}${scope(navRule(tier), previewTier)}${previewSelector(previewTier)} .builder-general-visible-from-${tier}{display:block!important;}${previewSelector(previewTier)} .builder-general-hidden-from-${tier},${previewSelector(previewTier)} .shop-builder-row--hidden-from-${tier}{display:none!important;}`).join("");
    const outsideHidden = tiers.slice(0, Math.min(index + 1, tiers.length)).map(([tier]) => scope(outsideNavHideRule(tier), previewTier)).join("");
    const titleResets = inactiveTitleTiers.map(([tier]) => `${previewSelector(previewTier)} .shop-builder-section[data-section-title-breakpoint="${tier}"] .shop-builder-section-heading{writing-mode:horizontal-tb;transform:none;}`).join("");
    return `${resetGeneral}${scope(gridBaseRule, previewTier)}${resetTextColumns}${scope(baseNav, previewTier)}${resetVisibility}${resetDeviceVisibility}${deviceVisibilityForTier}${active}${outsideHidden}${titleResets}`;
  }).join("");
  return [
    generalVisibilityBase,
    deviceVisibility,
    baseNav,
    ...tiers.map(([tier, value]) => `@media (min-width:${value}px){${generalRule(tier)}${yoothemeWidthRule(tier)}${gridRules[tier]}${textColumnRule(tier)}${navRule(tier)}}`),
    ...tiers.map(([tier, value]) => `@media (min-width:${value}px){${outsideNavHideRule(tier)}}`),
    generalVisibilityRules,
    titleReset("small", policy.small - 0.02),
    titleReset("medium", policy.medium - 0.02),
    titleReset("large", policy.large - 0.02),
    titleReset("xlarge", policy.xlarge - 0.02),
    previewRules,
    builderPreviewNavRules,
    builderPreviewHeadingRules,
  ].join("");
}
